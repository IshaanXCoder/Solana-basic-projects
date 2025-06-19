import { Transaction, VersionedTransaction, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import axios from 'axios';
import { API_URLS } from '@raydium-io/raydium-sdk-v2';

// Initialize Solana connection
export const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

export async function swap(tokenAddress: string, amount: number, wallet: any) {
    try {
        console.log('\nInitiating swap...');
        console.log('Input: ', amount / LAMPORTS_PER_SOL, 'SOL');
        console.log('Output Token:', tokenAddress);

        // Get swap quote
        const { data: swapResponse } = await axios.get(
            `${API_URLS.SWAP_HOST}/compute/swap-base-in`, {
                params: {
                    inputMint: NATIVE_MINT.toString(),
                    outputMint: tokenAddress,
                    amount: amount.toString(),
                    slippageBps: 1000, // 10%
                    txVersion: 'V0'
                }
            }
        );

        console.log('Swap quote received:', swapResponse);

        // Get transaction data
        const { data: txResponse } = await axios.post(
            `${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
                swapResponse,
                txVersion: 'V0',
                wallet: wallet.publicKey.toString(),
                wrapSol: true,
                unwrapSol: false,
                computeUnitPriceMicroLamports: "1000"
            }
        );

        console.log('Transaction response:', txResponse);

        if (!txResponse.data?.[0]?.transaction) {
            throw new Error('No transaction data in response');
        }

        // Deserialize and sign transaction
        const transaction = VersionedTransaction.deserialize(
            Buffer.from(txResponse.data[0].transaction, 'base64')
        );

        // Sign with connected wallet
        const signedTx = await wallet.signTransaction(transaction);
        
        // Send and confirm transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        console.log('Transaction sent, waiting for confirmation...');
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature
        });
        
        console.log('✅ Swap completed successfully!');
        console.log('Transaction signature:', signature);
        return signature;
    } catch (error: any) {
        console.error('Swap failed:', error.message);
        if ('response' in error && error.response?.data) {
            console.error('API Error details:', error.response.data);
        }
        throw error;
    }
} 