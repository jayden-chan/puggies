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

import { Match, MatchInfo, UserMeta } from "../types";

export type User = {
  username: string;
  displayName: string;
  email: string;
  roles: string[];
  steamId: string | undefined;
};

export type RegisterInput = {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
  steamId?: string;
};

export class DataAPI {
  private endpoint = "/api/v1";
  private jwtKeyName = "puggies-login-token";

  public async login(username: string, password: string): Promise<string> {
    const res = await fetch(`${this.endpoint}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();

    if (res.status === 200) {
      const token = json.message;
      localStorage.setItem(this.jwtKeyName, token);
      return token;
    } else {
      throw new Error(`Failed to login (HTTP ${res.status}): ${json.message}`);
    }
  }

  public async register(input: RegisterInput): Promise<string> {
    const res = await fetch(`${this.endpoint}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const json = await res.json();

    if (res.status === 200) {
      const token = json.message;
      localStorage.setItem(this.jwtKeyName, token);
      return token;
    } else {
      throw new Error(
        `Failed to register (HTTP ${res.status}): ${json.message}`
      );
    }
  }

  public async logout() {
    const token = this.getLoginToken();
    if (token === null) {
      return;
    }

    const res = await fetch(`${this.endpoint}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 200) {
      throw new Error(`Failed to logout: HTTP ${res.status}`);
    }

    localStorage.removeItem(this.jwtKeyName);
  }

  public getLoginToken(): string | null {
    return localStorage.getItem(this.jwtKeyName);
  }

  public async getUserInfo(): Promise<User | undefined> {
    const token = this.getLoginToken();
    if (token === null) {
      return undefined;
    }

    const res = await fetch(`${this.endpoint}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 404) {
      return await res.json();
    }
    return undefined;
  }

  public async deleteMatch(id: string): Promise<void> {
    const token = this.getLoginToken();
    if (token === null) {
      return;
    }

    const res = await fetch(`${this.endpoint}/matches/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (res.status !== 200) {
      throw new Error(
        `Failed to delete match (HTTP ${res.status}): ${json.message}`
      );
    }
  }

  public async updateMatchMeta(
    id: string,
    meta: Required<UserMeta>
  ): Promise<void> {
    const token = this.getLoginToken();
    if (token === null) {
      return;
    }

    const res = await fetch(`${this.endpoint}/usermeta/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    });

    const json = await res.json();
    if (res.status !== 200) {
      throw new Error(
        `Failed to update usermeta (HTTP ${res.status}): ${json.message}`
      );
    }
  }

  public async selfSignupEnabled(): Promise<boolean> {
    const res = await fetch(`${this.endpoint}/canselfsignup`);
    if (res.status !== 200) {
      return false;
    }
    const json = await res.json();
    return json.message;
  }

  public async fetchMatch(id: string): Promise<Match | undefined> {
    const res = await fetch(`${this.endpoint}/matches/${id}`);
    if (res.status === 404) {
      return undefined;
    }
    return await res.json();
  }

  public async fetchUserMeta(id: string): Promise<UserMeta | undefined> {
    const res = await fetch(`${this.endpoint}/usermeta/${id}`);
    if (res.status === 404) {
      return undefined;
    }

    const json = res.json();
    // this is our "404" state for the user meta since we
    // want to avoid flooding the console with 404 errors
    if (json === null) {
      return undefined;
    }
    return json;
  }

  public async fetchMatches(): Promise<MatchInfo[]> {
    const results = (await (
      await fetch(`${this.endpoint}/history`)
    ).json()) as MatchInfo[];

    return results.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }
}
