import { useEffect, useRef } from "react";
import { getCell } from "../data/cells";
import type { GameState } from "../logic/types";
import { sound } from "./sound";

// state 변화를 감지해 적절한 효과음을 재생. 호스트(TV)에서만 사용.
export function useSoundEffects(state: GameState): void {
  const prev = useRef<GameState | null>(null);

  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (!p) return; // 초기 마운트는 무음

    // 학생 입장
    if (state.players.length > p.players.length) {
      sound.joinBleep();
    }

    // 게임 시작
    if (
      p.phase === "lobby" &&
      (state.phase === "playing" || state.phase === "rain")
    ) {
      sound.gameStart();
    }

    // 주사위 굴림 → 데굴 + 0.6s 후 톡
    if (p.lastDiceRoll == null && state.lastDiceRoll != null) {
      sound.diceTumble();
      window.setTimeout(() => sound.dicePop(), 600);
    }

    // 퀴즈 오픈
    if (!p.quiz && state.quiz) {
      sound.quizOpen();
    }

    // 퀴즈 마감 (멈춘 자가 정답인지로 판별)
    if (p.quiz && !p.quiz.closed && state.quiz?.closed) {
      const cell = getCell(state.quiz.cellIndex);
      if (cell?.kind === "WORD") {
        const stoppedAnswer = state.quiz.answers[state.quiz.stoppedPlayerId];
        if (stoppedAnswer === cell.correctIndex) {
          sound.correct();
        } else {
          sound.wrong();
        }
      }
    }
  }, [state]);
}
