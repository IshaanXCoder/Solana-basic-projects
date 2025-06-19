import { NextResponse } from 'next/server';
import { getTweets } from '@/langchain/src/get-tweets';

export async function POST(req: Request) {
  try {
    const { userId, userName } = await req.json();
    
    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'Missing userId or userName' },
        { status: 400 }
      );
    }

    const tweets = await getTweets(userId, userName);
    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
} 