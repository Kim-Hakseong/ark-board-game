import type { GameState } from "../logic/types";

// PRD §5 — 컨트롤러 → 호스트 broadcast 'action'.
// 호스트 → 전체 broadcast 'state' (전체 GameState).
export type Action =
  | { type: "join"; playerId: string; name: string; animalId: string }
  | { type: "leave"; playerId: string }
  | { type: "roll"; playerId: string; dice: number }
  | { type: "answer"; playerId: string; choice: number }
  | { type: "invite"; playerId: string; targetId: string }
  | { type: "skipInvite"; playerId: string }
  | { type: "graceTarget"; playerId: string; targetId: string }
  | { type: "judge"; verdict: "success" | "pass" }
  | { type: "confirm" } // EVENT 자동 처리 후 [확인]
  | { type: "closeQuiz" } // 타이머 만료
  | { type: "finalizeQuiz" } // 결과 모달 닫기
  | { type: "phase"; cmd: "start" | "rain" | "nextDay" | "end" }
  | { type: "resync"; playerId: string };

export interface RealtimeAdapter {
  readonly kind: "mock" | "supabase";
  readonly mockReason?: string;
  subscribe(roomCode: string): Promise<void>;
  unsubscribe(): Promise<void>;
  sendAction(action: Action): void;
  sendState(state: GameState): void;
  onAction(handler: (a: Action) => void): () => void;
  onState(handler: (s: GameState) => void): () => void;
}

export type RealtimeMessage =
  | { kind: "action"; payload: Action }
  | { kind: "state"; payload: GameState };
