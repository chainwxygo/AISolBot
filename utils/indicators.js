// indicators.js
const { StochasticRSI, BollingerBands, MACD, ATR, SMA } = require('technicalindicators');

function calculateIndicators(data) {
	const closePrices = data.map(c => c.close);
	const highPrices = data.map(c => c.high);
	const lowPrices = data.map(c => c.low);

	// Stochastic RSI
	const stockRSI = StochasticRSI.calculate({
		values: closePrices,
		rsiPeriod: 14,
		stochasticPeriod: 14,
		kPeriod: 3,
		dPeriod: 3,
	});

	// Bollinger Bands
	const bollingerBands = BollingerBands.calculate({
		values: closePrices,
		period: 20,
		stdDev: 2,
	});

	// MACD
	const macd = MACD.calculate({
		values: closePrices,
		fastPeriod: 12,
		slowPeriod: 26,
		signalPeriod: 9,
		SimpleMAOscillator: false,
		SimpleMASignal: false,
	});

	// ATR
	const atr = ATR.calculate({
		high: highPrices,
		low: lowPrices,
		close: closePrices,
		period: 14,
	});

	// NEW: 200-period Simple Moving Average for bigger-picture trend
	const sma200 = SMA.calculate({
		period: 200,
		values: closePrices,
	});

	// Merge indicators into each candle
	return data.map((candle, index) => {
		return {
			...candle,
			stockRSI: stockRSI[index] || undefined,
			bbLower: bollingerBands[index]?.lower || undefined,
			bbUpper: bollingerBands[index]?.upper || undefined,
			macd: macd[index] || undefined,
			atr: atr[index] || undefined,
			sma200: sma200[index] || undefined, // attach the 200MA if available
		};
	});
}

module.exports = {
	calculateIndicators,
};
