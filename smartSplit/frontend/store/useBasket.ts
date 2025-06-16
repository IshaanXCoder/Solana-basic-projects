import { create } from "zustand";

type TokenBasket = {
  [tokenSymbol: string]: number; // e.g., { JUP: 40, BONK: 60 }
};

type BasketStore = {
  amount: number;
  basket: TokenBasket;
  setAmount: (amount: number) => void;
  setBasket: (basket: TokenBasket) => void;
  reset: () => void;
};

export const useBasket = create<BasketStore>((set) => ({
  amount: 100,
  basket: {},
  setAmount: (amount) => set({ amount }),
  setBasket: (basket) => set({ basket }),
  reset: () => set({ amount: 100, basket: {} })
}));

//this code is for the basket store, it is used to store the amount of tokens in the basket and the basket itself