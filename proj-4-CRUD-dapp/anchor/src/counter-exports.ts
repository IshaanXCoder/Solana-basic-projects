// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CrudDappIDL from '../target/idl/crud_dapp.json'
import type { CrudDapp } from '../target/types/crud_dapp'

// Re-export the generated IDL and type
export { CrudDapp, CrudDappIDL }

// The programId is imported from the program IDL.
export const CrudDapp_PROGRAM_ID = new PublicKey(CrudDappIDL.address)

// This is a helper function to get the CrudDapp Anchor program.
export function getCrudDappProgram(provider: AnchorProvider, address?: PublicKey): Program<CrudDapp> {
  return new Program({ ...CrudDappIDL, address: address ? address.toBase58() : CrudDappIDL.address } as CrudDapp, provider)
}

// This is a helper function to get the program ID for the CrudDapp program depending on the cluster.
export function getCrudDappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the CrudDapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return CrudDapp_PROGRAM_ID
  }
}
