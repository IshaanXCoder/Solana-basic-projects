import { Transaction, VersionedTransaction, sendAndConfirmTransaction, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import axios from 'axios'
import { API_URLS } from '@raydium-io/raydium-sdk-v2'
import * as fs from 'fs'
import * as path from 'path'

const rawData = fs.readFileSync(path.join(__dirname, 'id.json'))
const secretKey = Uint8Array.from(JSON.parse(rawData.toString()))
export const owner = Keypair.fromSecretKey(secretKey)

export const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/BO3XZ1SKw5U2agTBN-5CW')

export async function swap(tokenAddress: string, amount: number) {
    try {
        console.log('\nInitiating swap...');
        console.log('Input: ', amount / LAMPORTS_PER_SOL, 'SOL');
        console.log('Output Token:', tokenAddress);

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

        const { data: txResponse } = await axios.post(
            `${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
                swapResponse,
                txVersion: 'V0',
                wallet: owner.publicKey.toBase58(),
                wrapSol: true,
                unwrapSol: false,
                computeUnitPriceMicroLamports: "1000"
            }
        );

        console.log('Transaction response:', txResponse);

        if (!txResponse.data?.[0]?.transaction) {
            throw new Error('No transaction data in response');
        }

        const transaction = VersionedTransaction.deserialize(
            Buffer.from(txResponse.data[0].transaction, 'base64')
        );
        transaction.sign([owner]);
        
        const signature = await connection.sendRawTransaction(transaction.serialize());
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