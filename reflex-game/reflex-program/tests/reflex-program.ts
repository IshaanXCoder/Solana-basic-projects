import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ReflexProgram } from "../target/types/reflex_program";

describe("reflex-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ReflexProgram as Program<ReflexProgram>;

});
