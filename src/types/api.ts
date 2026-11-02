export type ApiResponse<T> = T;

export interface Country {
  leagueSeason: string;
  countryId: number;
  countryName: string;
  countryFlag: string;
}

export interface League {
  leagueSeason: string;
  countryId: number;
  countryName: string;
  countryFlag: string;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
}
export interface Team {
  leagueSeason: string;
  countryName: string;
  countryFlag: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
}
export interface Coach {
  id: number;
  name: string;
  age: string;
  nationality: string;
  photo: string;
  careers: Career[];
}
export interface Career {
  teamId: number;
  teamName: string;
  teamLogo: string;
  startDate: string;
  endDate: string;
}
export interface Player {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}
export interface TeamWithPlayer {
  teamId: number;
  players: Player[];
}
export interface Match {
  fixtureId: number;

  fixtureDate: string;
  fixtureStatusShort: string;
  fixtureStatusLong?: string;
  /** 진행 중일 때 경과 분 (예: 67) */
  fixtureStatusElapsed?: number | null;
  /** 추가 시간 (예: 45'+2' 의 2) */
  fixtureStatusExtra?: number | null;
  leagueId?: number;
  leagueName: string;
  leagueSeason: string;
  leagueRound: string;

  teamsHomeId: number;
  teamsHomeName: string;
  teamsHomeLogo: string;
  teamsAwayId: number;
  teamsAwayName: string;
  teamsAwayLogo: string;

  goalsHome: string;
  goalsAway: string;
  scoreHalftimeHome: string;
  scoreHalftimeAway: string;
  scoreFulltimeHome: string;
  scoreFulltimeAway: string;
}

export interface MatchEvent {
  fixtureId: number;
  timeElapsed: number;
  timeExtra: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  playerId: number;
  playerName: string;
  assistId: number;
  assistName: string;
  eventType: string;
  detail: string;
  comments: string;
}

/** SSE "match" 이벤트 페이로드 (백엔드 LiveUpdate) */
export interface LiveUpdate {
  match: Match;
  events: MatchEvent[];
  updatedAt: string;
}
