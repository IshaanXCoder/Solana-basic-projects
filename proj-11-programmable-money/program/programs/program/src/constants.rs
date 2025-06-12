use anchor_lang::prelude::*;

pub const SEED_CONFIG_ACCOUNT: &[u8] = b"config";
pub const SEED_MINT_ACCOUNT: &[u8] = b"mint";
pub const MINT_DECIMALS: u8 = 9;
pub const LIQUIDATION_THRESHOLD: u64 = 50; //200% over colaterialised
pub const LIQUIDATION_BONUS: u64 = 10; //10% bonus for liquidators
pub const MIN_HEALTH: u64 = 1; // account will be liqudiated if health factor is less than 1
