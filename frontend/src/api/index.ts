import { Match, MatchInfo, UserMeta } from "../types";

export class DataAPI {
  private endpoint =
    process.env.REACT_APP_PUGGIES_API_ENDPOINT ?? process.env.PUBLIC_URL;

  public async fetchMatch(id: string): Promise<Match> {
    return (await fetch(`${this.endpoint}/matches/${id}.json`)).json();
  }

  public async fetchUserMeta(): Promise<UserMeta> {
    return (await fetch(`${this.endpoint}/usermeta.json`)).json();
  }

  public async fetchMatches(): Promise<MatchInfo[]> {
    const results = (await (
      await fetch(`${this.endpoint}/history.json`)
    ).json()) as MatchInfo[];

    return results.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }
}
