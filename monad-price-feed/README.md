# Monad Price Feed

A full-stack dApp for real-time cryptocurrency price feeds, powered by the Pyth Oracle and deployed on Monad. Includes a smart contract for on-chain price storage and a sleek Next.js dashboard for live and on-chain price comparison.

## Features
- **Smart Contract**: Solidity contract to store and update prices from Pyth Oracle (see `contracts/src/PriceFeed.sol`).
- **Frontend**: Next.js dashboard to view live and on-chain prices, connect wallet, and push updates.
- **Monad Integration**: Designed for fast, low-cost price updates on Monad chain.

## Project Structure
- `contracts/` — Solidity smart contract (Foundry)
- `frontend/` — Next.js + React dashboard UI

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### Smart Contract
```bash
cd contracts
forge build     # Build contracts
forge test      # Run tests
```

---

- Update contract address in the frontend via `.env` or `NEXT_PUBLIC_CONTRACT_ADDRESS` as needed.
- Powered by [Pyth Network](https://pyth.network/) and [Monad](https://monad.xyz/).
