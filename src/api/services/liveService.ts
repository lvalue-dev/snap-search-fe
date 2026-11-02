import { LiveUpdate, Match } from "@/types/api";
import { apiClient, BASE_URL } from "../config";

/** 진행 중/예정 상태 판별 (백엔드 FixtureSnapshot.LIVE_STATUSES 와 동일) */
export const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
export const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"]);

export const isLiveStatus = (status?: string) => !!status && LIVE_STATUSES.has(status);
export const isFinishedStatus = (status?: string) => !!status && FINISHED_STATUSES.has(status);

export const liveService = {
  /** 현재 진행 중인 경기 */
  getLiveMatches: async (): Promise<Match[]> => {
    const { data } = await apiClient.get<Match[]>("/api/live");
    return data;
  },

  /** 특정 날짜(KST)의 경기. date 생략 시 오늘 */
  getMatchesByDate: async (date?: string): Promise<Match[]> => {
    const { data } = await apiClient.get<Match[]>("/api/live/by-date", { params: { date } });
    return data;
  },

  /**
   * SSE 구독. 서버가 변경된 경기만 "match" 이벤트로 push 한다.
   * 반환된 함수를 호출하면 연결을 닫는다. EventSource 는 끊기면 브라우저가 자동 재연결한다.
   */
  subscribe: (onUpdate: (update: LiveUpdate) => void, onStatus?: (connected: boolean) => void) => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return () => {};

    const source = new EventSource(`${BASE_URL}/api/live/stream`);
    source.addEventListener("connected", () => onStatus?.(true));
    source.addEventListener("match", (e) => {
      try {
        onUpdate(JSON.parse((e as MessageEvent).data) as LiveUpdate);
      } catch (err) {
        console.error("[live] malformed update", err);
      }
    });
    source.onerror = () => onStatus?.(false);
    return () => source.close();
  },
};
