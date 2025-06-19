from typing import Dict, List, Optional
import asyncio
import json
import websockets
import time
from datetime import datetime
from config import *
import requests
from termcolor import cprint

class TokenDetector:
    def __init__(self):
        self.processed_tokens = set()
        self.last_check_time = time.time()
        self.trades_this_hour = 0
        self.hour_start = time.time()
        
    async def monitor_new_tokens(self):
        """Monitor new token listings and liquidity additions"""
        ws_url = f"wss://api.mainnet-beta.solana.com"
        
        subscription = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "programSubscribe",
            "params": [
                RAYDIUM_V4_PROGRAM_ID,
                {"encoding": "jsonParsed", "commitment": "confirmed"}
            ]
        }
        
        while True:
            try:
                async with websockets.connect(ws_url) as websocket:
                    await websocket.send(json.dumps(subscription))
                    
                    while True:
                        msg = await websocket.recv()
                        data = json.loads(msg)
                        
                        if "params" in data:
                            await self.process_transaction(data["params"])
                            
            except Exception as e:
                cprint(f"WebSocket error: {str(e)}", "red")
                await asyncio.sleep(5)  # Wait before reconnecting
                
    async def process_transaction(self, tx_data: Dict):
        """Process incoming transactions for new token listings"""
        try:
            # Reset hourly trade counter if an hour has passed
            current_time = time.time()
            if current_time - self.hour_start > 3600:
                self.trades_this_hour = 0
                self.hour_start = current_time
                
            if self.trades_this_hour >= MAX_TRADES_PER_HOUR:
                return
                
            # Extract token information
            token_address = self.extract_token_address(tx_data)
            if not token_address or token_address in self.processed_tokens:
                return
                
            # Check token validity
            if not self.is_valid_token(token_address):
                return
                
            # Check liquidity
            liquidity = await self.check_liquidity(token_address)
            if liquidity < MIN_LIQUIDITY_THRESHOLD:
                return
                
            # Signal trading opportunity
            await self.signal_trade(token_address)
            self.processed_tokens.add(token_address)
            self.trades_this_hour += 1
            
        except Exception as e:
            cprint(f"Error processing transaction: {str(e)}", "red")
            
    def extract_token_address(self, tx_data: Dict) -> Optional[str]:
        """Extract token address from transaction data"""
        try:
            # Implementation depends on specific DEX transaction structure
            # This is a simplified example
            if "value" in tx_data and "accountData" in tx_data["value"]:
                account_data = tx_data["value"]["accountData"]
                # Extract token address based on DEX-specific logic
                return account_data.get("tokenAddress")
        except Exception as e:
            cprint(f"Error extracting token address: {str(e)}", "red")
        return None
        
    def is_valid_token(self, token_address: str) -> bool:
        """Check if token is valid and not in blacklist"""
        if token_address in DO_NOT_TRADE_LIST:
            return False
            
        # Add additional token validation logic here
        # - Check token metadata
        # - Verify contract code
        # - Check for honeypot characteristics
        return True
        
    async def check_liquidity(self, token_address: str) -> float:
        """Check token liquidity across DEXes"""
        try:
            # Query DEX API or contract for liquidity info
            url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"
            response = requests.get(url)
            data = response.json()
            
            total_liquidity = 0
            if "pairs" in data:
                for pair in data["pairs"]:
                    if "liquidity" in pair and "usd" in pair["liquidity"]:
                        total_liquidity += float(pair["liquidity"]["usd"])
                        
            return total_liquidity
            
        except Exception as e:
            cprint(f"Error checking liquidity: {str(e)}", "red")
            return 0
            
    async def signal_trade(self, token_address: str):
        """Signal a trading opportunity"""
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = f"🎯 New Trading Opportunity Detected!\n"\
                 f"Time: {now}\n"\
                 f"Token: {token_address}\n"
                 
        cprint(message, "green")
        
        # Send notifications if configured
        if DISCORD_WEBHOOK:
            self.send_discord_notification(message)
        if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
            self.send_telegram_notification(message)
            
    def send_discord_notification(self, message: str):
        """Send notification to Discord"""
        if not DISCORD_WEBHOOK:
            return
            
        try:
            requests.post(DISCORD_WEBHOOK, json={"content": message})
        except Exception as e:
            cprint(f"Error sending Discord notification: {str(e)}", "red")
            
    def send_telegram_notification(self, message: str):
        """Send notification to Telegram"""
        if not (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID):
            return
            
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }
            requests.post(url, json=payload)
        except Exception as e:
            cprint(f"Error sending Telegram notification: {str(e)}", "red") 