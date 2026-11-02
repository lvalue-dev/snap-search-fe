"use client";

import { liveService } from "@/api/services/liveService";
import { LiveUpdate, Match } from "@/types/api";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";

/**
 * 앱 전역에서 한 번만 마운트. SSE 로 받은 갱신을 react-query 캐시에 바로 반영한다.
 *  - ["matchList", teamId, season]  : 팀 경기 목록 안의 해당 경기 교체
 *  - ["upcomingMatchInfo", ...]      : 다가오는 경기 카드 갱신
 *  - ["todayMatches", ...]           : 오늘의 경기 목록
 *  - ["matchEvents", fixtureId]      : 이벤트 타임라인 교체 (서버가 함께 보내줌)
 */
export function useLiveUpdates() {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const replaceInList = (old: Match[] | null | undefined, match: Match) =>
      old ? old.map((m) => (m.fixtureId === match.fixtureId ? { ...m, ...match } : m)) : old;

    const unsubscribe = liveService.subscribe((update: LiveUpdate) => {
      const { match, events } = update;
      queryClient.setQueriesData<Match[] | null | undefined>(["matchList"], (old) => replaceInList(old, match));
      queryClient.setQueriesData<Match[] | null | undefined>(["todayMatches"], (old) => replaceInList(old, match));
      queryClient.setQueriesData<Match | null | undefined>(["upcomingMatchInfo"], (old) =>
        old && old.fixtureId === match.fixtureId ? { ...old, ...match } : old
      );
      if (events && events.length > 0) {
        queryClient.setQueryData(["matchEvents", match.fixtureId], events);
      }
    }, setConnected);

    return unsubscribe;
  }, [queryClient]);

  return { connected };
}

/** 레이아웃에 끼워 넣는 무표시 컴포넌트 */
export function LiveUpdatesBridge() {
  useLiveUpdates();
  return null;
}
