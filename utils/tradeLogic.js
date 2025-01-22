// tradeLogic.js
const { loadTradeState, saveTradeState, clearTradeState } = require('./stateManager');
const { fetchMarketData, getBalance, placeOrder } = require('./exchange');
const { calculateIndicators } = require('./indicators');
const { PAIR, TIMEFRAME, BINANCE_FEE_PERCENT, MINIMUM_PROFIT, RISK_LEVEL } = require('./config');

function calculateRiskRewardWithATR(entryPrice, tradeAmount, atr) {
	const feePerTrade = entryPrice * BINANCE_FEE_PERCENT * tradeAmount;
	const stopLoss = entryPrice - 1.5 * atr;
	const takeProfit = entryPrice + (MINIMUM_PROFIT + feePerTrade * 2) / tradeAmount + 2 * atr;

	console.log(`ATR-Based Risk-Reward Calculation`);
	console.log(`Entry Price: ${entryPrice}, Stop Loss: ${stopLoss}, Take Profit: ${takeProfit}, ATR: ${atr}`);
	return { stopLoss, takeProfit };
}

async function monitorPosition(trade) {
	const { tradeAmount, entryPrice, takeProfit, stopLoss } = trade;
	console.log('Monitoring position:', trade);

	while (true) {
		const updatedData = await fetchMarketData(PAIR, TIMEFRAME);
		const updatedPrice = updatedData[updatedData.length - 1].close;

		if (updatedPrice >= takeProfit) {
			console.log(`Taking profit at ${updatedPrice}`);
			await placeOrder('sell', tradeAmount);
			clearTradeState();
			break;
		}

		if (updatedPrice <= stopLoss) {
			console.log(`Stopping loss at ${updatedPrice}`);
			await placeOrder('sell', tradeAmount);
			clearTradeState();
			break;
		}

		await new Promise(resolve => setTimeout(resolve, 1000));
	}
}

async function executeTrade() {
	const existingTrade = loadTradeState();
	if (existingTrade) {
		console.log('Resuming existing trade...');
		await monitorPosition(existingTrade);
		return;
	}

	try {
		console.log(`Fetching ${TIMEFRAME} market data...`);
		const data = await fetchMarketData(PAIR, TIMEFRAME, 250); // fetch 250 candles so we have enough for 200MA
		console.log('Market data fetched. Last 5 candles:', data.slice(-5));

		const dataWithIndicators = calculateIndicators(data);

		// Skip the last incomplete candle
		const validData = dataWithIndicators
			.slice(0, -1)
			.filter(candle => candle.stockRSI && candle.macd && candle.bbLower && candle.atr && candle.sma200);
		console.log('Valid data for signals (with 200MA):', validData.slice(-5));

		if (validData.length === 0) {
			console.log('No valid data for indicators. Skipping...');
			return;
		}

		// Grab the latest fully-formed candle
		const latestCandle = validData[validData.length - 1];
		const { close, stockRSI, bbLower, macd, atr, sma200 } = latestCandle;

		console.log('Latest candle details:', latestCandle);

		// 1) Check bigger-picture bullishness: close price > 200MA
		const isBiggerTrendBullish = close > sma200;

		// 2) Check short-term momentum using MACD
		const isBullishMACD = macd.MACD > macd.signal;

		// 3) Optional check: Stoch RSI < 50 means it's oversold enough to consider buying
		const isStochRSILow = stockRSI.k < 50;

		// 4) Bollinger Band Check: near the lower band
		const bbThreshold = 0.005; // 0.5% threshold
		const isNearLowerBand = close <= bbLower * (1 + bbThreshold);

		console.log({
			isBiggerTrendBullish,
			isBullishMACD,
			isStochRSILow,
			isNearLowerBand,
		});

		// If the bigger trend is bullish, MACD says short-term is bullish, and
		// we meet our other conditions, then go LONG
		if (isBiggerTrendBullish && isBullishMACD && isStochRSILow && isNearLowerBand) {
			console.log(`All bullish conditions met. Entering LONG position at ${close}...`);

			const usdtBalance = await getBalance();
			const usdtToTrade = usdtBalance * RISK_LEVEL;
			const tradeAmount = usdtToTrade / close;

			console.log(
				`USDT Balance: ${usdtBalance}, USDT to Trade: ${usdtToTrade}, Trade Amount in SOL: ${tradeAmount}`
			);

			const { stopLoss, takeProfit } = calculateRiskRewardWithATR(close, tradeAmount, atr);

			await placeOrder('buy', tradeAmount);

			const trade = { tradeAmount, entryPrice: close, takeProfit, stopLoss };
			saveTradeState(trade);

			await monitorPosition(trade);
		} else {
			console.log(`Conditions are not all bullish. No trade taken.`);
		}
	} catch (error) {
		console.error('Error in executeTrade:', error.message);
	}
}

module.exports = {
	executeTrade,
};
