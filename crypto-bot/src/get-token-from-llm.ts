 import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getTokenFromLLM(contents: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: '	gemini-2.0-flash' });
    
    const prompt = `Analyze this tweet and tell me if it's discussing a potential price increase or "moon shot" for any Solana token, NFT or memecoin. If yes, extract and return ONLY the token's address. If no clear token address is mentioned or it's not about a potential price increase, return null. Tweet content: "${contents}"

Rules:
1. Only return a token address if the tweet strongly suggests a potential price increase
2. The address must be a valid Solana address (base58 encoded, typically starting with a number or letter)
3. If multiple tokens are mentioned, return the one that seems most likely to increase in price
4. Return null if:
   - No specific token is mentioned
   - The tweet is not about price increases
   - No valid address is provided
   - The tweet is bearish or negative about the token
5. Do not explain your reasoning, just return the address or null`;

    const result = await model.generateContent(prompt + "\n\n" + contents);
    const response = result.response;
    const text = response.text().trim();

    // Check if the response is a valid Solana address or null
    if (text === 'null' || text === '') {
      return null;
    }

    // Basic validation for Solana address format
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text)) {
      return text;
    }

    return null;
  } catch (error) {
    console.error('Error in getTokenFromLLM:', error);
    return null;
  }
}
