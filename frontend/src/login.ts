import create from "zustand";
import { DataAPI, User } from "./api";

const api = new DataAPI();

type LoginStore = {
  loggedIn: boolean;
  user: User | undefined;
  updateLoggedIn: () => Promise<void>;
  updateUser: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useLoginStore = create<LoginStore>((set) => ({
  loggedIn: false,
  user: undefined,
  updateLoggedIn: async () => {
    const token = api.getLoginToken();
    set({ loggedIn: token !== null });
  },
  updateUser: async () => {
    const token = api.getLoginToken();
    if (token === null) {
      return;
    }
    const user = await api.getUserInfo(token);
    set({ user });
  },
  login: async (username, password) => {
    const token = await api.login(username, password);
    const user = await api.getUserInfo(token);
    set({ loggedIn: true, user });
  },
  logout: () => {
    api.logout();
    set({ loggedIn: false, user: undefined });
  },
}));
