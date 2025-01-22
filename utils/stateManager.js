// stateManager.js
const fs = require('fs');
const { TRADE_STATE_FILE } = require('./config');

/**
 * Load existing trade state from a JSON file.
 */
function loadTradeState() {
	if (fs.existsSync(TRADE_STATE_FILE)) {
		const data = fs.readFileSync(TRADE_STATE_FILE);
		return JSON.parse(data);
	}
	return null;
}

/**
 * Save trade state to JSON file.
 */
function saveTradeState(tradeState) {
	fs.writeFileSync(TRADE_STATE_FILE, JSON.stringify(tradeState, null, 2));
}

/**
 * Clear trade state by deleting the file.
 */
function clearTradeState() {
	if (fs.existsSync(TRADE_STATE_FILE)) {
		fs.unlinkSync(TRADE_STATE_FILE);
	}
}

module.exports = {
	loadTradeState,
	saveTradeState,
	clearTradeState,
};
