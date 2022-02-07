import { getDateInfo } from "../data";
import { Match, MatchInfo } from "../types";

export class DataAPI {
  private endpoint =
    process.env.REACT_APP_PUGGIES_API_ENDPOINT ?? process.env.PUBLIC_URL;

  public async fetchMatch(info: MatchInfo): Promise<Match> {
    return (await fetch(`${this.endpoint}/matches/${info.id}.json`)).json();
  }

  public async fetchMatches(): Promise<MatchInfo[]> {
    const results = (await (
      await fetch(`${this.endpoint}/history.json`)
    ).json()) as MatchInfo[];

    return results.sort((a, b) => {
      const [, aTs] = getDateInfo(a.id);
      const [, bTs] = getDateInfo(b.id);
      return bTs - aTs;
    });
  }
}
