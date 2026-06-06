import type { GameState, Player } from "./types";

export const COUNTDOWN_START_DAYS = 7;

export function initGame(opts: { roomCode: string; teacherPin: string }): GameState {
  return {
    seq: 0,
    phase: "lobby",
    roomCode: opts.roomCode,
    teacherPin: opts.teacherPin,
    players: [],
    currentTurnIdx: 0,
    roundsCompleted: 0,
    countdown: { active: false, daysLeft: COUNTDOWN_START_DAYS },
    activeCell: null,
    quiz: null,
    lastDiceRoll: null,
  };
}

export function addPlayer(
  state: GameState,
  player: Pick<Player, "id" | "name" | "animalId">,
): GameState {
  if (state.phase !== "lobby") return state;
  if (state.players.some((p) => p.id === player.id)) return state;
  if (state.players.some((p) => p.animalId === player.animalId)) return state;
  if (state.players.length >= 8) return state;

  const newPlayer: Player = {
    id: player.id,
    name: player.name,
    animalId: player.animalId,
    position: 0,
    tokens: 0,
    arrived: false,
    arrivalRank: null,
    pendingSkip: false,
  };
  return {
    ...state,
    seq: state.seq + 1,
    players: [...state.players, newPlayer],
  };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  if (state.phase !== "lobby") return state;
  if (!state.players.some((p) => p.id === playerId)) return state;
  return {
    ...state,
    seq: state.seq + 1,
    players: state.players.filter((p) => p.id !== playerId),
  };
}

export function startGame(state: GameState): GameState {
  if (state.phase !== "lobby") return state;
  if (state.players.length < 2) return state;
  return {
    ...state,
    seq: state.seq + 1,
    phase: "playing",
    currentTurnIdx: 0,
  };
}

// 다음 턴으로 진행. 한 바퀴 완료 시 roundsCompleted +1, 비 카운트다운 활성이면 daysLeft -1.
// D-0 도달 시 phase = "ended" (PRD §4.4).
// pendingSkip이 있는 플레이어는 자기 차례에서 자동으로 한 번 더 진행됨(턴 소비 후 클리어).
export function advanceTurn(state: GameState): GameState {
  if (state.players.length === 0) return state;
  if (state.phase !== "playing" && state.phase !== "rain") return state;

  return advanceTurnInternal(state, state.players.length);
}

function advanceTurnInternal(state: GameState, safety: number): GameState {
  if (safety <= 0) return state; // 전원 skip 같은 비정상 케이스 방지

  const n = state.players.length;
  const nextIdx = (state.currentTurnIdx + 1) % n;
  const didLap = nextIdx === 0;

  let next: GameState = {
    ...state,
    currentTurnIdx: nextIdx,
    seq: state.seq + 1,
    activeCell: null,
    quiz: null,
    lastDiceRoll: null,
  };

  if (didLap) {
    next = { ...next, roundsCompleted: state.roundsCompleted + 1 };
    if (state.countdown.active) {
      const daysLeft = Math.max(0, state.countdown.daysLeft - 1);
      next = {
        ...next,
        countdown: { ...state.countdown, daysLeft },
      };
      if (daysLeft === 0) {
        return { ...next, phase: "ended" };
      }
    }
  }

  // pendingSkip 처리: 다음 차례 플레이어가 쉬어야 하면 플래그 클리어 후 한 번 더 진행
  const nextPlayer = next.players[nextIdx];
  if (nextPlayer.pendingSkip) {
    const players = next.players.map((p, i) =>
      i === nextIdx ? { ...p, pendingSkip: false } : p,
    );
    return advanceTurnInternal({ ...next, players }, safety - 1);
  }

  return next;
}
