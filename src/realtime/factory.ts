import { MockRealtimeAdapter } from "./mockAdapter";
import { SupabaseRealtimeAdapter } from "./supabaseAdapter";
import type { RealtimeAdapter } from "./types";

// 환경변수 기반 어댑터 선택. Supabase 키가 없으면 자동으로 mock 사용 + 경고 배너 노출.
export function createAdapter(env: Record<string, string | undefined> = readEnv()): RealtimeAdapter {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return new MockRealtimeAdapter("Supabase 환경변수 없음 — 로컬 mock 모드");
  }
  return new SupabaseRealtimeAdapter(url, key);
}

function readEnv(): Record<string, string | undefined> {
  try {
    // Vite는 import.meta.env로 노출. 빌드 시 정적 치환.
    return import.meta.env as unknown as Record<string, string | undefined>;
  } catch {
    return {};
  }
}
