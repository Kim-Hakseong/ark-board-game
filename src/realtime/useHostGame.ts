import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dispatch } from "../logic/dispatch";
import { initGame } from "../logic/state";
import { loadHostState, saveHostState } from "../logic/storage";
import type { GameState } from "../logic/types";
import { createAdapter } from "./factory";
import type { Action, RealtimeAdapter } from "./types";

export interface UseHostGameOptions {
  roomCode: string;
  teacherPin: string;
}

export interface HostGameApi {
  state: GameState;
  adapter: RealtimeAdapter | null;
  apply: (action: Action) => void; // 호스트 측에서 직접 액션 트리거 (교사 패널 등)
}

// 호스트(TV)에서 사용. 어댑터 구독 + 액션 디스패치 + 자동 broadcast + localStorage 영속화.
export function useHostGame(opts: UseHostGameOptions): HostGameApi {
  const { roomCode, teacherPin } = opts;
  const [state, setState] = useState<GameState>(() => {
    const restored = loadHostState(roomCode);
    if (restored && restored.teacherPin === teacherPin) return restored;
    return initGame({ roomCode, teacherPin });
  });
  const stateRef = useRef(state);
  const adapterRef = useRef<RealtimeAdapter | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const apply = useCallback((action: Action) => {
    const current = stateRef.current;
    const next = dispatch(current, action);
    if (next === current) return;
    stateRef.current = next;
    setState(next);
    saveHostState(next);
    adapterRef.current?.sendState(next);
  }, []);

  useEffect(() => {
    const adapter = createAdapter();
    adapterRef.current = adapter;
    let unregAction: (() => void) | null = null;
    let cancelled = false;

    adapter.subscribe(roomCode).then(() => {
      if (cancelled) return;
      unregAction = adapter.onAction((action) => {
        if (action.type === "resync") {
          adapter.sendState(stateRef.current);
          return;
        }
        apply(action);
      });
      // 첫 구독 시 현재 state 즉시 송신 (지각 입장 컨트롤러를 위한)
      adapter.sendState(stateRef.current);
    });

    return () => {
      cancelled = true;
      unregAction?.();
      adapter.unsubscribe();
      adapterRef.current = null;
    };
  }, [roomCode, apply]);

  // WORD 퀴즈 타이머
  useEffect(() => {
    if (!state.quiz || state.quiz.closed) return;
    const remaining = state.quiz.deadlineMs - Date.now();
    if (remaining <= 0) {
      apply({ type: "closeQuiz" });
      return;
    }
    const id = window.setTimeout(() => apply({ type: "closeQuiz" }), remaining);
    return () => window.clearTimeout(id);
  }, [state.quiz, apply]);

  return useMemo(
    () => ({ state, adapter: adapterRef.current, apply }),
    [state, apply],
  );
}
