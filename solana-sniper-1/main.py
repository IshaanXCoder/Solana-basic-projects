from termcolor import cprint, colored
from config import *
import warnings
warnings.filterwarnings("ignore")  # Suppresses Python runtime warnings that may come from libraries/dependencies
                                  # Common sources: deprecated features, numerical issues in numpy/pandas,
                                  # or API usage warnings from web3/blockchain libraries
import math, os
import requests
import pandas as pd
import numpy as np
import time
from datetime import datetime 
import nice_funcs as n
import schedule
from io import StringIO
import base64
import json
import ccxt
import asyncio
from token_detector import TokenDetector
from trading_system import TradingSystem

class SolanaSniper:
    def __init__(self):
        self.token_detector = TokenDetector()
        self.trading_system = TradingSystem()
        
    async def start(self):
        """Start the sniper bot"""
        try:
            cprint(f"Starting Solana Sniper Bot at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "white", "on_green")
            cprint(f"Monitoring DEXes for new tokens...", "white", "on_blue")
            
            # Start monitoring positions in background
            asyncio.create_task(self.trading_system.monitor_positions())
            
            # Start token detection
            await self.token_detector.monitor_new_tokens()
            
        except Exception as e:
            cprint(f"Error in main loop: {str(e)}", "red")
            
    async def handle_new_token(self, token_address: str, price_data: dict):
        """Handle newly detected token"""
        try:
            await self.trading_system.execute_trade(token_address, price_data)
        except Exception as e:
            cprint(f"Error handling new token: {str(e)}", "red")

async def main():
    """Main entry point"""
    bot = SolanaSniper()
    await bot.start()

if __name__ == "__main__":
    # Run the bot
    asyncio.run(main())

def bot():
    now = datetime.now()
    cprint(f"Starting bot at {now.strftime('%H:%M:%S')}", "white", "on_green")

    open_positions_df = fetch_open_positions(MY_ADDRESS)
    #open positions means that the bot has bought the token and is holding it

    # we dont want sol to be in the open positions df so drop it
    sol_df = open_positions_df[open_positions_df ['Mint Address'] == SOL_ADDRESS]
    while sol_df ['Amount']. values < 0.005:
        cprint(f'ERROR: SOL BALANCE IS LESS THAN .005', 'white', 'on_red')
        time. sleep (20)
        sol_df = fetch_wallet_toke_single(MY_ADDRESS, SOL_ADDRESS)

    cprint(f'SOL BALANCE{sol_df["Amount"].values}', 'white', 'on_light_blue ')

    #winning positions df
    winning_positions_df = open_positions_df[open_positions_df['USD Value'] > SELL_AT_MULTIPLE * USDC_SIZE ]
    for index, row in winning_positions_df.iterrows():
        token_mint_address = row['Mint Address']
        cprint(f'WINNING POSITION: {token_mint_address}', 'white', 'on_green')
        if token_mint_address in DO_NOT_TRADE_LIST:
            pnl_close(token_mint_address) 
        
        sl_size = USDC_SIZE * (1 + STOP_LOSS_PERCENTAGE)
        
        # drop all rows that show 0 in usd value
        losing_positions_df = open_positions_df[open_positions_df['USD Value'] < sl_size]
        losing_positions_df = losing_positions_df[losing_positions_df['USD Value'] != 0]
        for index, row in losing_positions_df.iterrows():
            token_mint_address = row['Mint Address']
            if token_mint_address not in DO_NOT_TRADE_LIST:
                print(f'skipping trading for {token_mint_address [-4:]} bc its in the do not trade list')
                continue

            cprint('done closing losing positions', 'white', 'on_magneta')