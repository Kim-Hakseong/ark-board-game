import { useEffect, useMemo, useState } from "react";
import { generatePin, generateRoomCode } from "../../lib/codes";
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

export function HostScreen() {
  const [room] = useState<HostActiveRoom>(() => getOrCreateActiveRoom());
  const { state, adapter, apply } = useHostGame(room);

  useEffect(() => {
    document.title = `방주로 가는 길 — ${room.roomCode}`;
  }, [room.roomCode]);

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

      {state.phase === "lobby" && (
        <Lobby
          state={state}
          joinUrl={joinUrl}
          showTestStart={isMock}
          onTestStart={() => apply({ type: "phase", cmd: "start" })}
        />
      )}

      {(state.phase === "playing" || state.phase === "rain") && (
        <>
          <Board state={state} />
          {state.activeCell && <CellOverlay state={state} />}
          {state.quiz && (
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
