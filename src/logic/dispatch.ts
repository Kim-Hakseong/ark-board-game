import type { Action } from "../realtime/types";
import { addPlayer, removePlayer, resetGame, startGame } from "./state";
import {
  advanceDay,
  closeQuiz,
  endGame,
  finalizeQuiz,
  handleDiceRoll,
  handleEventConfirm,
  handleGraceSelect,
  handleInvite,
  handleJudge,
  handleQuizAnswer,
  QUIZ_TIME_MS,
  skipInvite,
  triggerRain,
} from "./turn";
import type { GameState } from "./types";

export interface DispatchContext {
  now: () => number;
}

const DEFAULT_CTX: DispatchContext = { now: Date.now };

// 호스트가 수신한 Action을 GameState 변환에 적용.
// 새 퀴즈가 열린 경우 deadlineMs를 now+15s로 채움.
export function dispatch(
  state: GameState,
  action: Action,
  ctx: DispatchContext = DEFAULT_CTX,
): GameState {
  switch (action.type) {
    case "join":
      return addPlayer(state, {
        id: action.playerId,
        name: action.name,
        animalId: action.animalId,
      });
    case "leave":
      return removePlayer(state, action.playerId);
    case "roll": {
      const next = handleDiceRoll(state, action.playerId, action.dice);
      if (next.quiz && next.quiz !== state.quiz && next.quiz.deadlineMs === 0) {
        return { ...next, quiz: { ...next.quiz, deadlineMs: ctx.now() + QUIZ_TIME_MS } };
      }
      return next;
    }
    case "answer":
      return handleQuizAnswer(state, action.playerId, action.choice);
    case "closeQuiz":
      return closeQuiz(state);
    case "finalizeQuiz":
      return finalizeQuiz(state);
    case "judge":
      return handleJudge(state, action.verdict);
    case "confirm":
      return handleEventConfirm(state);
    case "graceTarget":
      return handleGraceSelect(state, action.targetId);
    case "invite":
      return handleInvite(state, action.playerId, action.targetId);
    case "skipInvite":
      return skipInvite(state, action.playerId);
    case "phase":
      switch (action.cmd) {
        case "start":
          return startGame(state);
        case "rain":
          return triggerRain(state);
        case "nextDay":
          return advanceDay(state);
        case "end":
          return endGame(state);
        case "reset":
          return resetGame(state);
        default:
          return state;
      }
    case "resync":
      // resync는 state 변경 없음. 호스트가 별도로 sendState 호출해 재송신.
      return state;
    default:
      return state;
  }
}
