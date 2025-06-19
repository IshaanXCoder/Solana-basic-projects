import { NextResponse } from 'next/server';
import { swap } from '../../../../langchain/src/swap';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function POST(req: Request) {
  try {
    const { tokenAddress, amount = 0.001 } = await req.json();
    
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing token address' },
        { status: 400 }
      );
    }

    const solAmount = amount * LAMPORTS_PER_SOL;
    const result = await swap(tokenAddress, solAmount);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error performing swap:', error);
    return NextResponse.json(
      { error: 'Failed to perform swap' },
      { status: 500 }
    );
  }
} 