from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI
from functools import lru_cache

load_dotenv()
app = Flask(__name__)

# Configuration and constants
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
BIRDEYE_API_KEY = os.getenv("BIRDEYE_API_KEY")
BIRDEYE_BASE_URL = "https://public-api.birdeye.so"

# Validation constants
MIN_INVESTMENT = 10
MAX_INVESTMENT = 1_000_000
MAX_VOLATILITY = 30
MIN_LIQUIDITY = 100_000

if not GOOGLE_API_KEY or not BIRDEYE_API_KEY:
    raise ValueError("Missing required API keys in .env file")

llm = GoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY)

class APIError(Exception):
    """Custom exception for API-related errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

def make_birdeye_request(endpoint: str, params: Dict = None) -> Dict:
    """Make a request to Birdeye API with error handling"""
    url = f"{BIRDEYE_BASE_URL}/{endpoint}"
    headers = {
        "X-API-KEY": BIRDEYE_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    try:
        app.logger.info(f"Making request to {url}")
        response = requests.get(url, headers=headers, params=params or {})
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            error_msg = f"{error_msg} - {e.response.text}"
        raise APIError(f"Birdeye API error: {error_msg}")

@lru_cache(maxsize=100)
def get_token_metrics(token_address: str) -> Optional[Dict]:
    """Fetch and cache token metrics including price history and liquidity"""
    try:
        # Get price history
        price_data = make_birdeye_request(f"public/price_history", {
            "address": token_address,
            "type": "1H",
            "limit": 24
        })
        
        items = price_data.get("data", {}).get("items", [])
        if not items:
            return None
            
        prices = [float(p.get('value', 0)) for p in items if p.get('value')]
        if not prices:
            return None
            
        # Calculate volatility
        price_changes = [((prices[i] - prices[i-1])/prices[i-1])*100 
                        for i in range(1, len(prices))]
        volatility = (sum(abs(x) for x in price_changes) / len(price_changes) 
                    if price_changes else 0)
        
        # Get token metadata
        token_data = make_birdeye_request(f"public/token_metadata", {
            "address": token_address
        })
        
        metadata = token_data.get("data", {})
        
        # Get token info
        token_info = make_birdeye_request(f"public/token", {
            "address": token_address
        })
        
        info = token_info.get("data", {})
        
        return {
            "volatility": volatility,
            "liquidity": float(metadata.get("liquidity", 0)),
            "current_price": prices[-1],
            "price_change_24h": info.get("priceChange24h", 0),
            "market_cap": float(info.get("marketCap", 0))
        }
        
    except APIError as e:
        app.logger.error(f"Error fetching metrics for {token_address}: {str(e)}")
        return None

def get_trending_tokens(limit: int = 7) -> List[Dict]:
    """Fetch trending tokens with risk metrics and filtering"""
    try:
        # First get top tokens by volume
        response = make_birdeye_request("public/tokenlist", {
            "sort_by": "volume",
            "offset": 0,
            "limit": limit * 2  # Fetch extra for filtering
        })
        
        tokens = response.get("data", {}).get("tokens", [])
        if not isinstance(tokens, list):
            raise APIError("Invalid response format from Birdeye API")
            
        app.logger.info(f"Found {len(tokens)} tokens before filtering")
        
        analyzed_tokens = []
        for token in tokens:
            if not token.get("address"):
                continue
                
            metrics = get_token_metrics(token["address"])
            if not metrics:
                continue
                
            # Apply risk filters
            if (metrics["volatility"] > MAX_VOLATILITY or 
                metrics["liquidity"] < MIN_LIQUIDITY):
                continue
                
            analyzed_tokens.append({
                "symbol": token.get("symbol", ""),
                "name": token.get("name", ""),
                "address": token.get("address", ""),
                "volume": float(token.get("volume_usd", 0)) / 1_000_000,
                "volatility": round(metrics["volatility"], 2),
                "liquidity": round(metrics["liquidity"] / 1_000_000, 2),
                "price": metrics["current_price"],
                "price_change_24h": round(metrics["price_change_24h"], 2),
                "market_cap": round(metrics["market_cap"] / 1_000_000, 2)
            })
            
            if len(analyzed_tokens) >= limit:
                break
                
        return analyzed_tokens
        
    except APIError as e:
        app.logger.error(f"Error fetching trending tokens: {str(e)}")
        raise

def build_prompt(user_prompt: str, investment_amount: float, 
                trending_tokens: List[Dict]) -> str:
    """Build a detailed prompt for the LLM"""
    token_details = "\n".join([
        f"- {t['symbol']} (${t['price']:.4f}):\n"
        f"  Volume: ${t['volume']:.1f}M | Volatility: {t['volatility']}% | "
        f"Liquidity: ${t['liquidity']:.1f}M\n"
        f"  24h Change: {t['price_change_24h']}% | "
        f"Market Cap: ${t['market_cap']:.1f}M"
        for t in trending_tokens
    ])

    return f"""
You are a conservative Solana investment advisor focused on risk management 
and capital preservation.

Investment Amount: ${investment_amount:,.2f}
User Preferences: "{user_prompt}"

Available tokens with detailed metrics:
{token_details}

Create a diversified investment basket considering:
1. Higher liquidity reduces risk and slippage
2. Lower volatility indicates stability
3. Market cap indicates establishment and risk level
4. 24h price change shows short-term momentum
5. Volume shows trading activity and liquidity

Return a JSON with this exact structure:
{{
    "amount": {investment_amount},
    "basket": {{
        "TOKEN_SYMBOL": percentage,  // Include 4-6 tokens
        ...
    }},
    "reasoning": "Detailed explanation of strategy and risk management"
}}

Requirements:
- Only use tokens from the list above
- Percentages must total exactly 100
- More weight to stable tokens
- Consider market cap in allocation
- Explain risk management strategy
"""

def validate_llm_response(response: str, amount: float) -> Dict:
    """Validate and parse LLM response"""
    try:
        # Safely parse JSON
        parsed = json.loads(response)
        
        # Validate structure
        required_keys = {"amount", "basket", "reasoning"}
        if not all(key in parsed for key in required_keys):
            raise ValueError("Missing required keys in response")
            
        # Validate amount
        if parsed["amount"] != amount:
            raise ValueError("Amount mismatch in response")
            
        # Validate basket
        basket = parsed["basket"]
        if not isinstance(basket, dict) or not basket:
            raise ValueError("Invalid basket format")
            
        # Validate percentages
        percentages = list(basket.values())
        if not all(isinstance(p, (int, float)) for p in percentages):
            raise ValueError("Invalid percentage values")
            
        total = sum(percentages)
        if abs(total - 100) > 0.1:
            raise ValueError(f"Percentages sum to {total}, not 100")
            
        return parsed
        
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format in response")
    except Exception as e:
        raise ValueError(f"Validation error: {str(e)}")

@app.route("/generate-basket", methods=["POST"])
def generate_basket():
    """Generate investment basket based on user preferences"""
    try:
        # Validate input
        data = request.get_json()
        if not data:
            raise APIError("Missing request body", 400)
            
        user_prompt = data.get("prompt", "").strip()
        investment_amount = float(data.get("amount", 0))
        
        if not user_prompt:
            raise APIError("Prompt is required", 400)
            
        if not MIN_INVESTMENT <= investment_amount <= MAX_INVESTMENT:
            raise APIError(
                f"Investment amount must be between ${MIN_INVESTMENT:,} and "
                f"${MAX_INVESTMENT:,}", 400
            )
        
        # Get token data
        trending = get_trending_tokens(limit=7)
        if not trending:
            raise APIError("Unable to fetch token data")
            
        # Generate and validate investment strategy
        prompt = build_prompt(user_prompt, investment_amount, trending)
        llm_response = llm.invoke(prompt)
        
        result = validate_llm_response(llm_response, investment_amount)
        
        # Add token details to response
        token_map = {t["symbol"]: t for t in trending}
        basket_details = []
        
        for symbol, percentage in result["basket"].items():
            if symbol in token_map:
                token = token_map[symbol]
                basket_details.append({
                    "symbol": symbol,
                    "percentage": percentage,
                    "amount": (investment_amount * percentage / 100),
                    "price": token["price"],
                    "liquidity": token["liquidity"],
                    "volatility": token["volatility"]
                })
        
        result["basket_details"] = basket_details
        return jsonify(result)
        
    except APIError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)