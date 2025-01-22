// main.js
const { executeTrade } = require('./tradeLogic');

(async () => {
	console.log('Starting trading bot...');

	while (true) {
		await executeTrade();
		// For a 5m timeframe, you might wait more than 1 second here to reduce API calls
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
})();
