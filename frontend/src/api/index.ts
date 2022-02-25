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

export type FrontendOptions = {
  selfSignupEnabled: boolean;
  showLoginButton: boolean;
  allowDemoDownload: boolean;
};

type ErrorCode = 400 | 401 | 403 | 404 | 405 | 418 | 429 | 500 | 501 | 502;

export class APIError extends Error {
  public code: number;
  constructor(code: number, ...params: any[]) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }

    this.code = code;
  }
}

export class DataAPI {
  private endpoint = "/api/v1";
  private jwtKeyName = "puggies-login-token";

  private getLoginToken(): string | null {
    return localStorage.getItem(this.jwtKeyName);
  }

  private async fetch<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    body?: any
  ): Promise<{ code: 200; res: T } | { code: ErrorCode; error: string }> {
    const res = await fetch(`${this.endpoint}${url}`, {
      method: method,
      headers: {
        "Content-Type": body !== undefined ? "application/json" : "text/plain",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    const code = res.status;
    if (code !== 200) return { code: code as ErrorCode, error: json.error };
    return { code, res: json.message as T };
  }

  private async fetchAuthed<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    body?: any
  ): Promise<{ code: 200; res: T } | { code: ErrorCode; error: string }> {
    const token = this.getLoginToken();
    if (token === null) {
      return { code: 401, error: "Not logged in" };
    }

    const res = await fetch(`${this.endpoint}${url}`, {
      method: method,
      headers: {
        "Content-Type": body !== undefined ? "application/json" : "text/plain",
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    const code = res.status;
    if (code !== 200) return { code: code as ErrorCode, error: json.error };
    return { code, res: json.message as T };
  }

  /********************************************************/
  /*                    Public Methods                    */
  /********************************************************/

  public async login(username: string, password: string): Promise<string> {
    const r = await this.fetch<string>("POST", "/login", {
      username,
      password,
    });

    if (r.code === 200) {
      localStorage.setItem(this.jwtKeyName, r.res);
      return r.res;
    }
    throw new APIError(r.code, `Failed to login (HTTP ${r.code}): ${r.error}`);
  }

  public async register(input: RegisterInput): Promise<string> {
    const r = await this.fetch<string>("POST", "/register", input);
    if (r.code === 200) {
      localStorage.setItem(this.jwtKeyName, r.res);
      return r.res;
    }
    throw new APIError(
      r.code,
      `Failed to register (HTTP ${r.code}): ${r.error}`
    );
  }

  public async logout() {
    const r = await this.fetchAuthed("POST", "/logout");
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to logout (HTTP ${r.code}): ${r.error}`
      );
    }

    localStorage.removeItem(this.jwtKeyName);
  }

  public async userInfo(): Promise<User | undefined> {
    const r = await this.fetchAuthed<User>("GET", "/userinfo");
    if (r.code === 401) {
      return undefined;
    }

    if (r.code === 200) {
      return r.res;
    }
    throw new APIError(
      r.code,
      `Failed to fetch user info (HTTP ${r.code}): ${r.error}`
    );
  }

  public async deleteMatch(id: string): Promise<void> {
    const r = await this.fetchAuthed<string>(
      "DELETE",
      `/matches/${encodeURIComponent(id)}`
    );
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to delete match (HTTP ${r.code}): ${r.error}`
      );
    }
  }

  public async fullDeleteMatch(id: string): Promise<void> {
    const r = await this.fetchAuthed<string>(
      "DELETE",
      `/fulldelete/matches/${encodeURIComponent(id)}`
    );
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to restore match (HTTP ${r.code}): ${r.error}`
      );
    }
  }

  public async triggerRescan(): Promise<void> {
    const r = await this.fetchAuthed<string>("PATCH", `/rescan`);
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to trigger demo rescan (HTTP ${r.code}): ${r.error}`
      );
    }
  }

  public async updateMatchMeta(
    id: string,
    meta: Required<UserMeta>
  ): Promise<void> {
    const r = await this.fetchAuthed<string>(
      "PUT",
      `/usermeta/${encodeURIComponent(id)}`,
      meta
    );
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to update usermeta (HTTP ${r.code}): ${r.error}`
      );
    }
  }

  public async options(): Promise<FrontendOptions> {
    const r = await this.fetch<FrontendOptions>("GET", "/options");
    if (r.code === 200) {
      return r.res;
    }
    throw new APIError(
      r.code,
      `Failed to fetch frontend options (HTTP ${r.code}): ${r.error}`
    );
  }

  public async userMeta(id: string): Promise<UserMeta | undefined> {
    const r = await this.fetch<UserMeta>(
      "GET",
      `/usermeta/${encodeURIComponent(id)}`
    );
    if (r.code === 404) {
      return undefined;
    } else if (r.code === 200) {
      return r.res ?? undefined;
    } else {
      console.error(
        `Failed to fetch user metadata (HTTP ${r.code}): ${r.error}`
      );
    }
    return undefined;
  }

  public async match(id: string): Promise<Match | undefined> {
    const r = await this.fetch<Match>(
      "GET",
      `/matches/${encodeURIComponent(id)}`
    );
    if (r.code === 404) {
      return undefined;
    } else if (r.code === 200) {
      return r.res ?? undefined;
    } else {
      throw new APIError(
        r.code,
        `Failed to fetch user match (HTTP ${r.code}): ${r.error}`
      );
    }
  }

  public async matches(): Promise<MatchInfo[]> {
    const r = await this.fetch<MatchInfo[]>("GET", "/history");
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to fetch match history (HTTP ${r.code}): ${r.error}`
      );
    }
    return r.res.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }

  public async deletedMatches(): Promise<MatchInfo[]> {
    const r = await this.fetchAuthed<MatchInfo[]>("GET", "/deletedMatches");
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to fetch deleted matches (HTTP ${r.code}): ${r.error}`
      );
    }
    return r.res.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }

  public async users(): Promise<User[]> {
    const r = await this.fetchAuthed<User[]>("GET", `/users`);
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to fetch users (HTTP ${r.code}): ${r.error}`
      );
    }
    return r.res;
  }

  public async user(username: string): Promise<User> {
    const r = await this.fetchAuthed<User>(
      "GET",
      `/users/${encodeURIComponent(username)}`
    );
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to fetch user (HTTP ${r.code}): ${r.error}`
      );
    }
    return r.res;
  }

  public async deleteUser(username: string): Promise<void> {
    const r = await this.fetchAuthed<void>(
      "DELETE",
      `/users/${encodeURIComponent(username)}`
    );
    if (r.code !== 200) {
      throw new APIError(
        r.code,
        `Failed to delete user (HTTP ${r.code}): ${r.error}`
      );
    }
  }
}
