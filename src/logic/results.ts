import { bonusForRank } from "./turn";
import type { GameState } from "./types";

// PRD §4.5 — 결과 화면용 점수 분해 ("도착 +5 / 토큰 7 = 12점")
export interface ResultEntry {
  playerId: string;
  name: string;
  animalId: string;
  arrived: boolean;
  arrivalRank: number | null;
  arrivalBonus: number; // 도착 보너스
  tokensExcludingBonus: number; // 누적 토큰 - 도착 보너스
  total: number; // 최종 점수
  position: number; // 종료 시점 칸 위치
  finalRank: number; // 1부터
}

// 순위 정렬: 도착자 먼저(arrivalRank asc), 미도착자는 total desc → position desc → name asc
export function computeResults(state: GameState): ResultEntry[] {
  const entries = state.players.map((p) => {
    const arrivalBonus = p.arrived && p.arrivalRank ? bonusForRank(p.arrivalRank) : 0;
    return {
      playerId: p.id,
      name: p.name,
      animalId: p.animalId,
      arrived: p.arrived,
      arrivalRank: p.arrivalRank,
      arrivalBonus,
      tokensExcludingBonus: p.tokens - arrivalBonus,
      total: p.tokens,
      position: p.position,
      finalRank: 0,
    };
  });

  entries.sort((a, b) => {
    if (a.arrived !== b.arrived) return a.arrived ? -1 : 1;
    if (a.arrived && b.arrived) {
      return (a.arrivalRank ?? 999) - (b.arrivalRank ?? 999);
    }
    // 둘 다 미도착
    if (a.total !== b.total) return b.total - a.total;
    if (a.position !== b.position) return b.position - a.position;
    return a.name.localeCompare(b.name);
  });

  return entries.map((e, i) => ({ ...e, finalRank: i + 1 }));
}
