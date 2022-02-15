/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

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
