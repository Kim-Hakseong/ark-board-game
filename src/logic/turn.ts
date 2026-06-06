import { type EventCell, getCell } from "../data/cells";
import {
  applyBackwardEffect,
  applyDiceMove,
  applyForwardEffect,
} from "./movement";
import { advanceTurn } from "./state";
import type { GameState, Player } from "./types";

export const QUIZ_TIME_MS = 15_000;
export const INVITE_TIME_MS = 15_000;

// PRD §4.5: 1등 +5, 2등 +3, 3등 +2, 4등 이하 +1
export const ARRIVAL_BONUSES = [5, 3, 2, 1] as const;

export function bonusForRank(rank: number): number {
  return ARRIVAL_BONUSES[rank - 1] ?? 1;
}

function tickSeq(state: GameState): GameState {
  return { ...state, seq: state.seq + 1 };
}

function updatePlayer(
  state: GameState,
  playerId: string,
  fn: (p: Player) => Player,
): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? fn(p) : p)),
  };
}

function markArrival(state: GameState, playerId: string): GameState {
  const arrivalsCount = state.players.filter((p) => p.arrived).length;
  const rank = arrivalsCount + 1;
  const bonus = bonusForRank(rank);
  let s = updatePlayer(state, playerId, (p) => ({
    ...p,
    position: 31,
    arrived: true,
    arrivalRank: rank,
    tokens: p.tokens + bonus,
  }));
  // 첫 도착 시 비 카운트다운 자동 트리거 (PRD §4.4)
  if (rank === 1 && !s.countdown.active) {
    s = {
      ...s,
      countdown: { active: true, daysLeft: 7 },
      phase: "rain",
    };
  }
  // 전원 도착 시 즉시 종료
  if (s.players.every((p) => p.arrived)) {
    s = { ...s, phase: "ended" };
  }
  return s;
}

// 주사위 굴림 처리. 현재 턴 플레이어의 dice만 수용. 도착자는 무시(초청 사용).
export function handleDiceRoll(
  state: GameState,
  playerId: string,
  dice: number,
): GameState {
  if (state.phase !== "playing" && state.phase !== "rain") return state;
  if (state.players[state.currentTurnIdx]?.id !== playerId) return state;
  if (state.activeCell || state.quiz) return state;
  if (dice < 1 || dice > 6) return state;
  const player = state.players[state.currentTurnIdx];
  if (player.arrived) return state;

  const move = applyDiceMove(player.position, dice);
  let s = tickSeq(state);
  s = { ...s, lastDiceRoll: dice };
  s = updatePlayer(s, playerId, (p) => ({ ...p, position: move.newPos }));

  if (move.arrived) {
    s = markArrival(s, playerId);
    if (s.phase !== "ended") s = advanceTurn(s);
    return s;
  }

  if (!move.triggerContent) {
    // 반사칸: 콘텐츠 미발동
    return advanceTurn(s);
  }

  return triggerCellContent(s, playerId, move.newPos);
}

function triggerCellContent(
  state: GameState,
  playerId: string,
  cellIndex: number,
): GameState {
  const cell = getCell(cellIndex);
  if (!cell) return advanceTurn(state);

  if (cell.kind === "WORD") {
    return {
      ...state,
      quiz: {
        cellIndex,
        stoppedPlayerId: playerId,
        deadlineMs: 0, // 어댑터 통합 시 호스트가 채움
        answers: {},
        closed: false,
      },
    };
  }
  if (cell.kind === "SHARE" || cell.kind === "MISSION") {
    return {
      ...state,
      activeCell: {
        index: cellIndex,
        triggeredByPlayerId: playerId,
        awaitingJudge: true,
        awaitingConfirm: false,
        awaitingGraceTarget: false,
      },
    };
  }
  return applyEvent(state, playerId, cell);
}

function applyEvent(state: GameState, playerId: string, cell: EventCell): GameState {
  const effect = cell.effect;
  let s = state;
  let awaitGrace = false;

  if (effect.type === "moveBack") {
    const player = s.players.find((p) => p.id === playerId)!;
    const r = applyBackwardEffect(player.position, effect.steps);
    s = updatePlayer(s, playerId, (p) => ({ ...p, position: r.newPos }));
  } else if (effect.type === "moveForward") {
    const player = s.players.find((p) => p.id === playerId)!;
    const r = applyForwardEffect(player.position, effect.steps);
    s = updatePlayer(s, playerId, (p) => ({ ...p, position: r.newPos }));
    if (r.arrived) s = markArrival(s, playerId);
  } else if (effect.type === "tokenDelta") {
    s = updatePlayer(s, playerId, (p) => ({
      ...p,
      tokens: p.tokens + effect.delta,
    }));
  } else if (effect.type === "skipTurn") {
    s = updatePlayer(s, playerId, (p) => ({ ...p, pendingSkip: true }));
  } else if (effect.type === "backToStart") {
    // catch-up: 처음(0)으로 돌아감. 콘텐츠 미발동.
    s = updatePlayer(s, playerId, (p) => ({ ...p, position: 0 }));
  } else if (effect.type === "advanceOther") {
    awaitGrace = true;
  }

  s = {
    ...s,
    activeCell: {
      index: cell.index,
      triggeredByPlayerId: playerId,
      awaitingJudge: false,
      awaitingConfirm: !awaitGrace,
      awaitingGraceTarget: awaitGrace,
    },
  };
  return s;
}

// 교사 [확인] — EVENT 자동 처리 후 다음 턴.
export function handleEventConfirm(state: GameState): GameState {
  if (!state.activeCell?.awaitingConfirm) return state;
  let s = tickSeq(state);
  s = { ...s, activeCell: null };
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// EVENT 25(은혜) — 멈춘 플레이어가 미도착 1명을 골라 전진. steps는 셀의 effect에서 읽음.
export function handleGraceSelect(state: GameState, targetId: string): GameState {
  if (!state.activeCell?.awaitingGraceTarget) return state;
  const target = state.players.find((p) => p.id === targetId);
  if (!target || target.arrived) return state;
  const cell = getCell(state.activeCell.index);
  if (!cell || cell.kind !== "EVENT" || cell.effect.type !== "advanceOther") return state;
  const steps = cell.effect.steps;

  let s = tickSeq(state);
  const r = applyForwardEffect(target.position, steps);
  s = updatePlayer(s, targetId, (p) => ({ ...p, position: r.newPos }));
  if (r.arrived) s = markArrival(s, targetId);
  s = { ...s, activeCell: null };
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// SHARE/MISSION 교사 판정. success: 토큰+1·자리 유지 / pass: 1칸 뒤로 (PRD §4.2).
export function handleJudge(
  state: GameState,
  verdict: "success" | "pass",
): GameState {
  if (!state.activeCell?.awaitingJudge) return state;
  const playerId = state.activeCell.triggeredByPlayerId;
  let s = tickSeq(state);
  if (verdict === "success") {
    s = updatePlayer(s, playerId, (p) => ({ ...p, tokens: p.tokens + 1 }));
  } else {
    const player = s.players.find((p) => p.id === playerId)!;
    const r = applyBackwardEffect(player.position, 1);
    s = updatePlayer(s, playerId, (p) => ({ ...p, position: r.newPos }));
  }
  s = { ...s, activeCell: null };
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// WORD 퀴즈 응답. **굴린 사람(stoppedPlayerId)만** 응답 가능. 첫 답만 인정.
// (PRD §4.2 원본은 '전원 참여'였으나 운영자 요청으로 변경.)
// 멈춘 자가 답하면 즉시 마감.
export function handleQuizAnswer(
  state: GameState,
  playerId: string,
  choiceIndex: number,
): GameState {
  if (!state.quiz || state.quiz.closed) return state;
  if (choiceIndex < 0 || choiceIndex > 3) return state;
  if (playerId !== state.quiz.stoppedPlayerId) return state;
  if (state.quiz.answers[playerId] !== undefined) return state;

  let s = tickSeq(state);
  s = {
    ...s,
    quiz: {
      ...state.quiz,
      answers: { ...state.quiz.answers, [playerId]: choiceIndex },
    },
  };
  return closeQuizInternal(s);
}

// 타이머 만료/외부 트리거로 마감 → 채점.
export function closeQuiz(state: GameState): GameState {
  if (!state.quiz || state.quiz.closed) return state;
  return closeQuizInternal(tickSeq(state));
}

function closeQuizInternal(state: GameState): GameState {
  if (!state.quiz) return state;
  const cell = getCell(state.quiz.cellIndex);
  if (!cell || cell.kind !== "WORD") return state;

  // 굴린 사람만 채점. 다른 플레이어는 변동 없음 (운영자 요청, PRD §4.2 변경).
  const correctIdx = cell.correctIndex;
  const stoppedId = state.quiz.stoppedPlayerId;
  const ans = state.quiz.answers[stoppedId];
  let s = state;
  if (ans === correctIdx) {
    s = updatePlayer(s, stoppedId, (p) => ({ ...p, tokens: p.tokens + 1 }));
  } else {
    const player = s.players.find((p) => p.id === stoppedId);
    if (player) {
      const r = applyBackwardEffect(player.position, 1);
      s = updatePlayer(s, stoppedId, (p) => ({ ...p, position: r.newPos }));
    }
  }

  return { ...s, quiz: { ...state.quiz, closed: true } };
}

// 호스트가 결과 모달을 닫고 다음 턴으로 진행.
export function finalizeQuiz(state: GameState): GameState {
  if (!state.quiz?.closed) return state;
  let s = tickSeq(state);
  s = { ...s, quiz: null };
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// 도착자(초청자) 턴 — 미도착 1명에게 +1칸 전진 (PRD §4.3).
export function handleInvite(
  state: GameState,
  inviterId: string,
  targetId: string,
): GameState {
  if (state.phase !== "playing" && state.phase !== "rain") return state;
  if (state.players[state.currentTurnIdx]?.id !== inviterId) return state;
  if (state.activeCell || state.quiz) return state;
  const inviter = state.players[state.currentTurnIdx];
  if (!inviter.arrived) return state;
  const target = state.players.find((p) => p.id === targetId);
  if (!target || target.arrived) return state;

  let s = tickSeq(state);
  const r = applyForwardEffect(target.position, 1);
  s = updatePlayer(s, targetId, (p) => ({ ...p, position: r.newPos }));
  if (r.arrived) s = markArrival(s, targetId);
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// 도착자 턴 자동 스킵(15초 무선택 시) — PRD §4.3.
export function skipInvite(state: GameState, inviterId: string): GameState {
  if (state.players[state.currentTurnIdx]?.id !== inviterId) return state;
  const inviter = state.players[state.currentTurnIdx];
  if (!inviter.arrived) return state;
  let s = tickSeq(state);
  if (s.phase !== "ended") s = advanceTurn(s);
  return s;
}

// 교사 [비 내리기] — 수동 비 카운트다운 트리거 (PRD §4.4).
export function triggerRain(state: GameState): GameState {
  if (state.phase === "ended") return state;
  if (state.countdown.active) return state;
  return {
    ...state,
    seq: state.seq + 1,
    phase: "rain",
    countdown: { active: true, daysLeft: 7 },
  };
}

// 교사 [하루 넘기기] — 비 활성 중 daysLeft -1 (PRD §4.4).
export function advanceDay(state: GameState): GameState {
  if (!state.countdown.active) return state;
  if (state.phase === "ended") return state;
  const daysLeft = Math.max(0, state.countdown.daysLeft - 1);
  const next = {
    ...state,
    seq: state.seq + 1,
    countdown: { ...state.countdown, daysLeft },
  };
  if (daysLeft === 0) return { ...next, phase: "ended" as const };
  return next;
}

// 교사 [게임 종료] — 즉시 결과 전환 (PRD §4.4).
export function endGame(state: GameState): GameState {
  if (state.phase === "ended") return state;
  return { ...state, seq: state.seq + 1, phase: "ended" };
}
