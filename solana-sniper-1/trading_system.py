import asyncio
from typing import Dict, Optional
import time
from datetime import datetime
import base58
import requests
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
from solana.system_program import TransactionInstruction
from spl.token.instructions import get_associated_token_address
from termcolor import cprint
from config import *

class TradingSystem:
    def __init__(self):
        self.client = AsyncClient(RPC_ENDPOINT)
        self.private_key = base58.b58decode(PRIVATE_KEY)
        self.active_trades = {}
        
    async def execute_trade(self, token_address: str, price_data: Dict):
        """Execute a trade for a newly detected token"""
        try:
            # Check if we're already trading this token
            if token_address in self.active_trades:
                return
                
            # Validate current price and liquidity
            if not await self.validate_trading_conditions(token_address, price_data):
                return
                
            # Calculate trade size and slippage
            trade_size = USDC_SIZE
            max_slippage = price_data['price'] * (1 + MAX_SLIPPAGE)
            
            # Create and sign transaction
            transaction = await self.create_swap_transaction(
                token_address,
                trade_size,
                max_slippage
            )
            
            if not transaction:
                return
                
            # Execute trade
            signature = await self.client.send_transaction(
                transaction,
                opts={"skip_preflight": True}  # Skip preflight for faster execution
            )
            
            # Monitor trade status
            success = await self.monitor_transaction(signature)
            
            if success:
                self.active_trades[token_address] = {
                    'entry_price': price_data['price'],
                    'entry_time': time.time(),
                    'size': trade_size,
                    'stop_loss': price_data['price'] * (1 + STOP_LOSS_PERCENTAGE),
                    'take_profit': price_data['price'] * (1 + TAKE_PROFIT_PERCENTAGE)
                }
                
                await self.notify_trade_execution(token_address, price_data['price'], trade_size)
                
        except Exception as e:
            cprint(f"Error executing trade: {str(e)}", "red")
            
    async def validate_trading_conditions(self, token_address: str, price_data: Dict) -> bool:
        """Validate if trading conditions are met"""
        try:
            # Check minimum liquidity
            if price_data['liquidity'] < MIN_LIQUIDITY_THRESHOLD:
                return False
                
            # Check if token is in blacklist
            if token_address in DO_NOT_TRADE_LIST:
                return False
                
            # Check trading volume
            if price_data['volume_24h'] < MIN_LIQUIDITY_THRESHOLD * 2:  # Volume should be at least 2x liquidity
                return False
                
            # Add more validation as needed
            return True
            
        except Exception as e:
            cprint(f"Error validating trading conditions: {str(e)}", "red")
            return False
            
    async def create_swap_transaction(
        self,
        token_address: str,
        amount: float,
        max_slippage: float
    ) -> Optional[Transaction]:
        """Create a swap transaction"""
        try:
            # Get associated token account
            token_account = get_associated_token_address(MY_ADDRESS, token_address)
            
            # Create transaction instruction
            instruction = TransactionInstruction(
                program_id=RAYDIUM_V4_PROGRAM_ID,
                data=self.encode_swap_instruction(amount, max_slippage),
                keys=[
                    # Add necessary account metas
                    # This will depend on the specific DEX being used
                ]
            )
            
            # Create and sign transaction
            transaction = Transaction()
            transaction.add(instruction)
            
            return transaction
            
        except Exception as e:
            cprint(f"Error creating swap transaction: {str(e)}", "red")
            return None
            
    def encode_swap_instruction(self, amount: float, max_slippage: float) -> bytes:
        """Encode swap instruction data"""
        # Implementation depends on the specific DEX being used
        # This is a placeholder
        return bytes([])
        
    async def monitor_transaction(self, signature: str) -> bool:
        """Monitor transaction status"""
        try:
            # Wait for transaction confirmation
            status = await self.client.confirm_transaction(signature)
            return status.value.err is None
            
        except Exception as e:
            cprint(f"Error monitoring transaction: {str(e)}", "red")
            return False
            
    async def monitor_positions(self):
        """Monitor and manage open positions"""
        while True:
            try:
                for token_address, trade_data in list(self.active_trades.items()):
                    # Get current price
                    current_price = await self.get_current_price(token_address)
                    
                    if not current_price:
                        continue
                        
                    # Check stop loss
                    if current_price <= trade_data['stop_loss']:
                        await self.close_position(token_address, 'Stop Loss')
                        continue
                        
                    # Check take profit
                    if current_price >= trade_data['take_profit']:
                        await self.close_position(token_address, 'Take Profit')
                        continue
                        
                await asyncio.sleep(1)  # Avoid too frequent checks
                
            except Exception as e:
                cprint(f"Error monitoring positions: {str(e)}", "red")
                await asyncio.sleep(5)
                
    async def close_position(self, token_address: str, reason: str):
        """Close a trading position"""
        try:
            trade_data = self.active_trades[token_address]
            
            # Create and execute sell transaction
            transaction = await self.create_swap_transaction(
                token_address,
                trade_data['size'],
                MAX_SLIPPAGE
            )
            
            if transaction:
                signature = await self.client.send_transaction(
                    transaction,
                    opts={"skip_preflight": True}
                )
                
                success = await self.monitor_transaction(signature)
                
                if success:
                    current_price = await self.get_current_price(token_address)
                    pnl = (current_price - trade_data['entry_price']) / trade_data['entry_price']
                    await self.notify_position_closed(token_address, pnl, reason)
                    del self.active_trades[token_address]
                    
        except Exception as e:
            cprint(f"Error closing position: {str(e)}", "red")
            
    async def get_current_price(self, token_address: str) -> Optional[float]:
        """Get current token price"""
        try:
            # Query DEX API or contract for current price
            url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"
            response = requests.get(url)
            data = response.json()
            
            if "pairs" in data and len(data["pairs"]) > 0:
                return float(data["pairs"][0]["priceUsd"])
                
        except Exception as e:
            cprint(f"Error getting current price: {str(e)}", "red")
            
        return None
        
    async def notify_trade_execution(self, token_address: str, price: float, size: float):
        """Notify about trade execution"""
        message = f"🚀 Trade Executed!\n"\
                 f"Token: {token_address}\n"\
                 f"Price: ${price:.6f}\n"\
                 f"Size: ${size:.2f}\n"\
                 f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                 
        cprint(message, "green")
        
        if DISCORD_WEBHOOK:
            requests.post(DISCORD_WEBHOOK, json={"content": message})
            
        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }
            requests.post(url, json=payload)
            
    async def notify_position_closed(self, token_address: str, pnl: float, reason: str):
        """Notify about position closure"""
        message = f"💰 Position Closed - {reason}\n"\
                 f"Token: {token_address}\n"\
                 f"PNL: {pnl:.2%}\n"\
                 f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                 
        color = "green" if pnl > 0 else "red"
        cprint(message, color)
        
        if DISCORD_WEBHOOK:
            requests.post(DISCORD_WEBHOOK, json={"content": message})
            
        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }
            requests.post(url, json=payload) 