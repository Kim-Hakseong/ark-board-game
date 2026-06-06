import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { GameState } from "../logic/types";
import type { Action, RealtimeAdapter } from "./types";

// PRD §5 — 채널 'ark:{ROOM_CODE}'에 broadcast 이벤트 action/state.
// self:false 기본값 → 자기 자신은 수신하지 않음 (호스트는 자기 state 재수신 불필요).
export class SupabaseRealtimeAdapter implements RealtimeAdapter {
  readonly kind = "supabase" as const;
  private client: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private actionHandlers = new Set<(a: Action) => void>();
  private stateHandlers = new Set<(s: GameState) => void>();

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
      auth: { persistSession: false },
    });
  }

  async subscribe(roomCode: string): Promise<void> {
    if (this.channel) await this.unsubscribe();
    const channel = this.client.channel(`ark:${roomCode}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "action" }, ({ payload }) => {
        for (const h of this.actionHandlers) h(payload as Action);
      })
      .on("broadcast", { event: "state" }, ({ payload }) => {
        for (const h of this.stateHandlers) h(payload as GameState);
      });

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("Supabase subscribe timeout"));
      }, 10_000);
      channel.subscribe((status) => {
        if (settled) return;
        if (status === "SUBSCRIBED") {
          settled = true;
          clearTimeout(timer);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          settled = true;
          clearTimeout(timer);
          reject(new Error(`Supabase subscribe failed: ${status}`));
        }
      });
    });
    this.channel = channel;
  }

  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await this.client.removeChannel(this.channel);
      this.channel = null;
    }
  }

  sendAction(action: Action): void {
    this.channel?.send({ type: "broadcast", event: "action", payload: action });
  }

  sendState(state: GameState): void {
    this.channel?.send({ type: "broadcast", event: "state", payload: state });
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
