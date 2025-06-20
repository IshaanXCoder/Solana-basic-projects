import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Proj2VotingDappBlinks } from "../target/types/proj_2_voting_dapp_blinks";

describe("proj-2-voting-dapp-blinks", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.proj2VotingDappBlinks as Program<Proj2VotingDappBlinks>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
