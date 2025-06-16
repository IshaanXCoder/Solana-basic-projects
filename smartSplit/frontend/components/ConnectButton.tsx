"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ConnectButton = () => {
  return (
    <div className="p-4">
      <WalletMultiButton />
    </div>
  );
};