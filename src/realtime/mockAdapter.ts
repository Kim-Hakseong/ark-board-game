import type { GameState } from "../logic/types";
import type { Action, RealtimeAdapter, RealtimeMessage } from "./types";

// BroadcastChannel 기반 mock. 동일 origin 내 모든 탭에 메시지 전달.
// Supabase Realtime 환경변수가 없을 때 또는 테스트에서 사용.
// 한계: 다른 디바이스 간 통신 불가(현장 운영은 supabaseAdapter 사용).
export class MockRealtimeAdapter implements RealtimeAdapter {
  readonly kind = "mock" as const;
  readonly mockReason: string;
  private channel: BroadcastChannel | null = null;
  private actionHandlers = new Set<(a: Action) => void>();
  private stateHandlers = new Set<(s: GameState) => void>();

  constructor(reason = "Supabase 환경변수 없음 — BroadcastChannel mock 사용 중") {
    this.mockReason = reason;
  }

  async subscribe(roomCode: string): Promise<void> {
    this.channel?.close();
    if (typeof BroadcastChannel === "undefined") {
      throw new Error("BroadcastChannel 미지원 환경입니다.");
    }
    const channel = new BroadcastChannel(`ark:${roomCode}`);
    channel.onmessage = (e) => {
      const msg = e.data as RealtimeMessage;
      if (msg?.kind === "action") {
        for (const h of this.actionHandlers) h(msg.payload);
      } else if (msg?.kind === "state") {
        for (const h of this.stateHandlers) h(msg.payload);
      }
    };
    this.channel = channel;
  }

  async unsubscribe(): Promise<void> {
    this.channel?.close();
    this.channel = null;
  }

  sendAction(action: Action): void {
    this.channel?.postMessage({ kind: "action", payload: action } satisfies RealtimeMessage);
  }

  sendState(state: GameState): void {
    this.channel?.postMessage({ kind: "state", payload: state } satisfies RealtimeMessage);
  }

  onAction(handler: (a: Action) => void): () => void {
    this.actionHandlers.add(handler);
    return () => {
      this.actionHandlers.delete(handler);
    };
  }

  onState(handler: (s: GameState) => void): () => void {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }
}
