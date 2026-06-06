import { useCallback, useEffect, useMemo, useState } from "react";
import { generatePin, generateRoomCode } from "../../lib/codes";
import { sound } from "../../lib/sound";
import { useSoundEffects } from "../../lib/useSoundEffects";
import {
  loadHostActiveRoom,
  saveHostActiveRoom,
  type HostActiveRoom,
} from "../../logic/storage";
import { useHostGame } from "../../realtime/useHostGame";
import { Board } from "./Board";
import { CellOverlay } from "./CellOverlay";
import { Lobby } from "./Lobby";
import { QuizOverlay } from "./QuizOverlay";
import { Results } from "./Results";

function getOrCreateActiveRoom(): HostActiveRoom {
  const restored = loadHostActiveRoom();
  if (restored) return restored;
  const room = { roomCode: generateRoomCode(), teacherPin: generatePin() };
  saveHostActiveRoom(room);
  return room;
}

const OVERLAY_DELAY_MS = 1500;

function useDelayedOverlay(key: number | null | undefined): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (key == null) {
      setReady(false);
      return;
    }
    setReady(false);
    const t = window.setTimeout(() => setReady(true), OVERLAY_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [key]);
  return ready;
}

export function HostScreen() {
  const [room] = useState<HostActiveRoom>(() => getOrCreateActiveRoom());
  const { state, adapter, apply } = useHostGame(room);
  const [muted, setMuted] = useState<boolean>(() => sound.isMuted);

  useSoundEffects(state);

  const quizReady = useDelayedOverlay(state.quiz?.cellIndex ?? null);
  const cellReady = useDelayedOverlay(state.activeCell?.index ?? null);

  useEffect(() => {
    document.title = `방주로 가는 길 — ${room.roomCode}`;
  }, [room.roomCode]);

  // 첫 user gesture에 AudioContext unlock (Safari 정책).
  useEffect(() => {
    const handler = () => sound.unlock();
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const toggleMute = useCallback(() => {
    sound.unlock();
    const m = sound.toggle();
    setMuted(m);
  }, []);

  const joinUrl = useMemo(() => {
    if (typeof window === "undefined") return `/play?room=${room.roomCode}`;
    return `${window.location.origin}/play?room=${room.roomCode}`;
  }, [room.roomCode]);

  const isMock = adapter?.kind === "mock";

  return (
    <div className="relative min-h-screen bg-cream">
      {isMock && (
        <div className="bg-ark-gold/20 text-ink text-center py-2 font-display text-base">
          ⚠️ 로컬 mock 모드 ({adapter?.mockReason}). 실시간 동기화는 같은 브라우저 탭 사이만 동작합니다.
        </div>
      )}

      {/* 음소거 토글 (우상단 고정) */}
      <button
        type="button"
        onClick={toggleMute}
        className="fixed top-3 right-3 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur border-2 border-ink/10 shadow-lg text-2xl flex items-center justify-center"
        title={muted ? "효과음 켜기" : "효과음 끄기"}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {state.phase === "lobby" && (
        <Lobby
          state={state}
          joinUrl={joinUrl}
          showTestStart={isMock}
          onTestStart={() => apply({ type: "phase", cmd: "start" })}
          onKick={(playerId) => apply({ type: "leave", playerId })}
        />
      )}

      {(state.phase === "playing" || state.phase === "rain") && (
        <>
          <Board
            state={state}
            onKick={(playerId) => apply({ type: "leave", playerId })}
          />
          {state.activeCell && cellReady && <CellOverlay state={state} />}
          {state.quiz && quizReady && (
            <QuizOverlay
              state={state}
              onContinue={() => apply({ type: "finalizeQuiz" })}
            />
          )}
        </>
      )}

      {state.phase === "ended" && (
        <Results
          state={state}
          onReset={() => apply({ type: "phase", cmd: "reset" })}
        />
      )}
    </div>
  );
}
