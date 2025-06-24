/// <reference types="jest" />

import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { TokenLottery } from '../target/types/token_lottery'

describe('token_lottery', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet = provider.wallet as anchor.Wallet; 

  const program = anchor.workspace.Basic as Program<TokenLottery>

  it('should init config', async () => {
      // Derive the PDA for token_lottery account
      const [tokenLotteryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token_lottery")],
        program.programId
      );

      const tx = await program.methods.initializeConfig(
        new anchor.BN(0),
        new anchor.BN(1822712025),
        new anchor.BN(10000),
      )
      .accounts({
        payer: wallet.publicKey,
        tokenLottery: tokenLotteryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
      
      console.log('Transaction signature:', tx);
      
      // Verify the account was created and initialized correctly
      const tokenLotteryAccount = await program.account.tokenLottery.fetch(tokenLotteryPda);
      console.log('Token lottery account:', tokenLotteryAccount);
  })
})

