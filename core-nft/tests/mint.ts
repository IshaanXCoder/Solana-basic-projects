const anchor = require("@coral-xyz/anchor");
const { Keypair, SystemProgram, PublicKey } = require("@solana/web3.js");
const { MPL_CORE_PROGRAM_ID } = require("@metaplex-foundation/mpl-core");
require('dotenv').config();

// === 1. Setup Anchor Provider ===
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// === 2. Load the program ===
const idl = require("../target/idl/");
const programId = new anchor.web3.PublicKey("BaeFpaC2LraJdqUDfozVZEvWh9kPfvu1gKowzUku1nXx");
const program = new anchor.Program(idl, programId, provider);

// === 3. Create Keypair for the Asset ===
const asset = Keypair.generate();

// === 4. NFT Metadata ===
const uri = "https://gateway.pinata.cloud/ipfs/bafybeigj6sh3yp3ulwykboz32deavqglorov3mg4vcyvmy4yrrxscjzufe/metadata.json";
const name = "My Core NFT";

// === 5. Call the `createCoreAsset` instruction ===
(async () => {
  try {
    const tx = await program.methods
      .createCoreAsset(name, uri)
      .accounts({
        asset: asset.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([asset])
      .rpc();

    console.log("✅ NFT Minted Successfully!");
    console.log("Transaction:", tx);
    console.log("Asset Address:", asset.publicKey.toBase58());
  } catch (err) {
    console.error("❌ Error Minting NFT:", err);
    console.error("Error details:", err.toString());
  }
})();
