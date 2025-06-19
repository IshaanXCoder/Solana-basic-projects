# Solana Memecoin 🚀

An automated trading bot that monitors specefic Twitter accounts for potential token launches on Solana and executes trades using the Raydium DEX(cz most of the memecoins are launched first on raydium).

## Features

- 🔍 Real-time Twitter monitoring
- 🤖 AI-powered tweet analysis using Google's Gemini (using langchain)
- 💱 Automated token swapping via Raydium 
- ⚡ Quick execution for sniping opportunities
-   Multiple RPC requests are made 

## Prerequisites

- Solana CLI
- A Solana wallet with SOL
- Twitter API key
- Google Gemini API key
- TypeScript
- Node.js (v16 or higher)

## Plans to add in future

- Clone somebody's trades
- Direct Swaps to some token (for manual trading paglus)



## Installation

1. Clone the repository:
```bash
git clone <link>
cd crypto-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
TWITTER_API_KEY=your_twitter_api_key
GEMINI_API_KEY=your_gemini_api_key
```
3.1 You can change the username and userId of the person(the one whome you want to follow up)

4. Place your Solana wallet private key in `src/id.json`:
```json
[1, 2, 3, ...] // Your private key array
```

## Configuration

- `TWEET_MAX_TIME_MS`: Time window for monitoring tweets (default: 24 hours)
- `SOL_AMOUNT`: Amount of SOL to swap (default: 0.001 SOL)
- `slippageBps`: Slippage tolerance (default: 1000 = 10%)

## Usage

1. Build the project:
```bash
npm run build
```

2. Start the bot:
```bash
press 2 among the options
```


