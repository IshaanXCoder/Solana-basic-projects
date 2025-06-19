import { NextResponse } from 'next/server';
import { getTokenFromLLM } from '../../../../langchain/src/get-token-from-llm';

export async function POST(req: Request) {
  try {
    const { tweetContent } = await req.json();
    
    if (!tweetContent) {
      return NextResponse.json(
        { error: 'Missing tweet content' },
        { status: 400 }
      );
    }

    const tokenAddress = await getTokenFromLLM(tweetContent);
    return NextResponse.json({ tokenAddress });
  } catch (error) {
    console.error('Error analyzing tweet:', error);
    return NextResponse.json(
      { error: 'Failed to analyze tweet' },
      { status: 500 }
    );
  }
} 