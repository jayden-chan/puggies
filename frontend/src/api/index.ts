import { Match } from "../types";

export type MatchInfo = {
  id: string;
  dateString: string;
  dateTimestamp: number;
  map: string;
  teamARounds: number;
  teamBRounds: number;
  teamATitle: string;
  teamBTitle: string;
};

export class DataAPI {
  private endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async fetchMatch(info: MatchInfo): Promise<Match> {
    return (await fetch(`${this.endpoint}/matches/${info.id}.json`)).json();
  }

  public async fetchMatches(): Promise<MatchInfo[]> {
    const results = (await (
      await fetch(`${this.endpoint}/matchInfo.json`)
    ).json()) as MatchInfo[];

    return results.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }
}
