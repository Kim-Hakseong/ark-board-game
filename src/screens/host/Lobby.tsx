import { QRCodeSVG } from "qrcode.react";
import { getAnimal } from "../../data/animals";
import { MAX_PLAYERS } from "../../logic/state";
import type { GameState } from "../../logic/types";

interface LobbyProps {
  state: GameState;
  joinUrl: string;
  onTestStart?: () => void; // mock 모드에서 호스트 측 임시 시작 (PRD는 교사 모바일에서 트리거)
  showTestStart?: boolean;
}

export function Lobby({ state, joinUrl, onTestStart, showTestStart }: LobbyProps) {
  const canStart = state.players.length >= 2;
  return (
    <div className="min-h-screen p-12 grid grid-cols-[1fr_auto] gap-12 items-center bg-cream text-ink">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-7xl leading-tight">방주로 가는 길</h1>
        <p className="text-2xl opacity-80">QR을 찍어서 입장하세요. 동물 캐릭터는 선점제입니다.</p>

        <div className="flex items-end gap-12">
          <div>
            <div className="text-xl opacity-60 mb-2">방 코드</div>
            <div className="font-display text-9xl tracking-widest text-ark-gold">
              {state.roomCode}
            </div>
          </div>
          <div>
            <div className="text-xl opacity-60 mb-2">교사 PIN</div>
            <div className="font-display text-7xl tracking-widest text-ink/80">
              {state.teacherPin}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xl opacity-60 mb-3">
            입장한 친구들 ({state.players.length}/{MAX_PLAYERS})
          </div>
          <div className="flex flex-wrap gap-3">
            {state.players.map((p) => {
              const animal = getAnimal(p.animalId);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-2xl animate-[fadeIn_0.3s_ease]"
                >
                  <span className="text-4xl">{animal?.emoji ?? "❓"}</span>
                  <span className="font-display">{p.name}</span>
                </div>
              );
            })}
            {state.players.length === 0 && (
              <div className="text-2xl opacity-50 italic">아직 아무도 입장하지 않았어요.</div>
            )}
          </div>
        </div>

        {showTestStart && (
          <button
            type="button"
            onClick={onTestStart}
            disabled={!canStart}
            className="self-start mt-6 px-8 py-4 rounded-2xl bg-ark-gold text-white font-display text-2xl shadow-lg disabled:opacity-40"
          >
            [데모] 게임 시작 {canStart ? "" : "(2명 이상 필요)"}
          </button>
        )}
        {!showTestStart && (
          <div className="mt-6 text-xl opacity-60">
            교사가 모바일에서 PIN을 입력해 [게임 시작]을 눌러주세요.
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-xl">
        <QRCodeSVG value={joinUrl} size={320} level="M" />
        <div className="font-display text-xl opacity-70 break-all max-w-[320px] text-center">
          {joinUrl}
        </div>
      </div>
    </div>
  );
}
