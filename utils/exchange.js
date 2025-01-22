const ccxt = require('ccxt');
const dotenv = require('dotenv');
const { PAIR } = require('./config');

dotenv.config(); // Load .env

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const exchange = new ccxt.binance({
	apiKey: API_KEY,
	secret: SECRET_KEY,
	enableRateLimit: true,
});

/**
 * Fetch market data for a given pair and timeframe.
 */
async function fetchMarketData(pair, timeframe, limit = 200) {
	try {
		const candles = await exchange.fetchOHLCV(pair, timeframe, undefined, limit);
		if (!candles || candles.length === 0) {
			throw new Error('No market data returned. Check your connection or API.');
		}
		return candles.map(candle => ({
			time: candle[0],
			open: candle[1],
			high: candle[2],
			low: candle[3],
			close: candle[4],
			volume: candle[5],
		}));
	} catch (error) {
		console.error('Error fetching market data:', error.message);
		throw error;
	}
}

/**
 * Fetch free USDT balance.
 */
async function getBalance() {
	try {
		const balance = await exchange.fetchBalance();
		return balance.free['USDT'] || 0;
	} catch (error) {
		console.error('Error fetching balance:', error.message);
		throw error;
	}
}

/**
 * Place an order (market or limit).
 */
async function placeOrder(side, amount, price = null) {
	try {
		if (price) {
			return await exchange.createLimitOrder(PAIR, side, amount, price);
		} else {
			return await exchange.createMarketOrder(PAIR, side, amount);
		}
	} catch (error) {
		console.error(`Error placing ${side} order:`, error.message);
		throw error;
	}
}

module.exports = {
	exchange,
	fetchMarketData,
	getBalance,
	placeOrder,
};
