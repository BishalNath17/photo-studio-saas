import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  token: null,
  shop: null,
  setUser: (userData, token) => set({ user: userData, token }),
  logout: () => set({ user: null, token: null, shop: null }),
  setShop: (shopData) => set({ shop: shopData }),
}));
