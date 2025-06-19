# Wallet Configuration
MY_ADDRESS = "YOUR_WALLET_ADDRESS"  # Replace with your wallet address
PRIVATE_KEY = "YOUR_PRIVATE_KEY"    # Replace with your private key

# RPC Configuration
RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"  # Or your preferred RPC endpoint

# Token Configuration
SOL_ADDRESS = "So11111111111111111111111111111111111111112"
USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

# Trading Parameters
USDC_SIZE = 10  # Amount in USDC to trade per position
STOP_LOSS_PERCENTAGE = -0.05  # 5% stop loss
TAKE_PROFIT_PERCENTAGE = 0.20  # 20% take profit
SELL_AT_MULTIPLE = 2.0  # Sell when price doubles

# Risk Management
MAX_TRADES_PER_HOUR = 5
MIN_LIQUIDITY_THRESHOLD = 1000  # Minimum liquidity in USDC
MAX_SLIPPAGE = 0.03  # Maximum allowed slippage 3%
GAS_ADJUSTMENT = 1.5  # Multiply estimated gas by this factor

# Blacklist
DO_NOT_TRADE_LIST = [
    # Add known scam tokens or tokens you want to avoid
]

# DEX Configuration
RAYDIUM_V4_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
ORCA_WHIRLPOOL_PROGRAM_ID = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"

# Monitoring Configuration
DISCORD_WEBHOOK = ""  # Optional: Add Discord webhook for notifications
TELEGRAM_BOT_TOKEN = ""  # Optional: Add Telegram bot token
TELEGRAM_CHAT_ID = ""  # Optional: Add Telegram chat ID

# social checks
DROP_IF_NO_WEBSITE = False
DROP_IF_NO_TELEGRAM = False
DROP_IF_NO_TWITTER = False
ONLY_KEEP_ACTIVE_WEBSITES = True

# secuirty checks
#if top 10 holders > 70% of the supply, drop it
TOP10_HOLDER_PERCENT_MAX = 0.7
DROP_IF_MUTABLE_METADATA = False
DROP_IF_2022_PROGRAM = True