# AI-Enhanced agent (AISolBot)

This **AI-powered trading agent** trades meme coin** using:

-  [ccxt](https://github.com/ccxt/ccxt) to connect to the exchange.
-  [technicalindicators](https://github.com/anandanand84/technicalindicators) for classic indicators (e.g. MACD, Stoch RSI, Bollinger Bands, ATR).
-  **Custom AI predictions** (via a pre-trained model) to further refine when to enter a **long** trade.

> **Disclaimer**: No trading strategy guarantees profits. **Use at your own risk**.

---

## Features

1. **Modular Architecture**

   -  **`exchange.js`**: Connects to Exchange via ccxt.
   -  **`indicators.js`**: Computes traditional indicators (MACD, Stoch RSI, Bollinger, ATR, SMA).
   -  **`aiModel.js`**: Loads a **TensorFlow.js** (or other) AI model and predicts the probability of an upward price move.
   -  **`tradeLogic.js`**: Combines AI predictions + classic indicators to decide when to **buy** and sets stop loss + take profit.
   -  **`stateManager.js`**: Saves active trade details in a JSON file.
   -  **`config.js`**: Stores configuration (timeframe, fees, risk level, etc.).
   -  **`main.js`** (entry): Runs the trading loop.

2. **Bullish-Only Trading**

   -  Bot checks if price is above the **200-SMA** (long-term bullish).
   -  Checks **MACD** for short-term bullishness.
   -  **AI** predicts the probability of an upward move given current data.

3. **Risk Management**

   -  Trades only **20%** of your available USDT per entry.
   -  Uses **ATR-based stop loss** and **take profit** to exit.

4. **Continuous Monitoring**
   -  Loops indefinitely, checking if it’s time to **buy** (only goes long).
   -  Watches open positions until a stop loss or take profit triggers, then repeats.

---

## Requirements

-  **Node.js** (v20+ recommended)
-  **npm** or **yarn**
-  An **Exchange** account with **API key** and **secret**
-  **TensorFlow.js** (or another AI framework) for loading the model in Node:

## Installation

1. **Clone** this repository:

   ```bash
   git clone https://github.com/chainwxy/AISolBot.git

   cd AISolBot
   ```

2. **Install** Dependencies:

   ```bash
   yarn
   ```

3. **Set Up Your** .env:

   ```bash
   API_KEY=YOUR_EXCHANGE_API_KEY
   SECRET_KEY=YOUR_EXCHANGE_SECRET_KEY
   ```

4. **Start the Bot**:

   ```bash
   node bot.js
   ```
