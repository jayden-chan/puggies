import create from "zustand";
import { DataAPI, User } from "./api";

const api = new DataAPI();

type LoginStore = {
  loggedIn: boolean;
  user: User | undefined;
  updateLoggedIn: () => Promise<void>;
  updateUser: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useLoginStore = create<LoginStore>((set) => ({
  loggedIn: false,
  user: undefined,
  updateLoggedIn: async () => {
    const token = api.getLoginToken();
    set({ loggedIn: token !== null });
  },
  updateUser: async () => {
    const user = await api.getUserInfo();
    set({ user });
  },
  login: async (username, password) => {
    await api.login(username, password);
    const user = await api.getUserInfo();
    set({ loggedIn: true, user });
  },
  logout: async () => {
    await api.logout();
    set({ loggedIn: false, user: undefined });
  },
}));
