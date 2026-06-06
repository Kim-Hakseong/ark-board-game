import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "../logic/types";
import { createAdapter } from "./factory";
import type { Action, RealtimeAdapter } from "./types";

export interface UseControllerGameOptions {
  roomCode: string;
  playerId: string;
}

export interface ControllerGameApi {
  state: GameState | null;
  adapter: RealtimeAdapter | null;
  send: (action: Action) => void;
  connected: boolean;
}

// 컨트롤러(모바일)에서 사용. 어댑터 구독 + state 수신(seq 가드) + action 송신 + resync 자동 요청.
export function useControllerGame(opts: UseControllerGameOptions): ControllerGameApi {
  const { roomCode, playerId } = opts;
  const [state, setState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const stateRef = useRef<GameState | null>(null);
  const adapterRef = useRef<RealtimeAdapter | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const send = useCallback((action: Action) => {
    adapterRef.current?.sendAction(action);
  }, []);

  useEffect(() => {
    const adapter = createAdapter();
    adapterRef.current = adapter;
    let unregState: (() => void) | null = null;
    let cancelled = false;

    adapter.subscribe(roomCode).then(() => {
      if (cancelled) return;
      unregState = adapter.onState((incoming) => {
        const current = stateRef.current;
        // PRD §5 — seq가 더 큰 state만 수용
        if (current && incoming.seq <= current.seq) return;
        stateRef.current = incoming;
        setState(incoming);
        setConnected(true);
      });
      // 마운트 시 호스트에 현재 state 재송신 요청
      adapter.sendAction({ type: "resync", playerId });
    });

    return () => {
      cancelled = true;
      unregState?.();
      adapter.unsubscribe();
      adapterRef.current = null;
    };
  }, [roomCode, playerId]);

  return useMemo(
    () => ({ state, adapter: adapterRef.current, send, connected }),
    [state, send, connected],
  );
}
