import { useState } from "react";
import { ANIMALS } from "../../data/animals";
import { generatePlayerId } from "../../lib/codes";
import { MAX_PLAYERS } from "../../logic/state";
import type { ControllerProfile } from "../../logic/storage";
import type { GameState } from "../../logic/types";

interface EntryProps {
  roomCode: string;
  state: GameState | null;
  onJoin: (profile: ControllerProfile) => void;
}

type Mode = "student" | "teacher";

export function Entry({ roomCode, state, onJoin }: EntryProps) {
  const [mode, setMode] = useState<Mode>("student");
  const [name, setName] = useState("");
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const takenAnimalIds = new Set(state?.players.map((p) => p.animalId) ?? []);
  const lobbyFull = (state?.players.length ?? 0) >= MAX_PLAYERS;

  const handleSubmit = () => {
    setError(null);
    if (mode === "student") {
      if (!state) return setError("호스트와 연결 중입니다. 잠시만요.");
      if (!name.trim()) return setError("이름을 입력해주세요.");
      if (!animalId) return setError("동물을 골라주세요.");
      if (takenAnimalIds.has(animalId)) return setError("다른 친구가 먼저 골랐어요. 다시 선택해주세요.");
      if (lobbyFull) return setError(`정원이 다 찼어요 (최대 ${MAX_PLAYERS}명).`);
      if (state.phase !== "lobby") return setError("이미 게임이 시작되었어요.");
      const playerId = generatePlayerId();
      const profile: ControllerProfile = {
        roomCode,
        playerId,
        playerToken: generatePlayerId(),
        name: name.trim(),
        animalId,
      };
      onJoin(profile);
    } else {
      if (!state) return setError("호스트와 연결 중입니다.");
      if (pin !== state.teacherPin) return setError("PIN이 맞지 않아요.");
      const profile: ControllerProfile = {
        roomCode,
        playerId: `teacher-${generatePlayerId()}`,
        playerToken: generatePlayerId(),
        name: "진행자",
        animalId: "",
        isTeacher: true,
      };
      onJoin(profile);
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink p-6 flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-3xl">방주로 가는 길</h1>
        <p className="text-base opacity-70 mt-1">
          방 코드 <span className="font-display text-ark-gold">{roomCode}</span>
          {state ? ` · 입장 ${state.players.length}/${MAX_PLAYERS}` : " · 연결 중…"}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-1 shadow">
        <button
          type="button"
          onClick={() => setMode("student")}
          className={`py-3 rounded-xl font-display text-lg ${mode === "student" ? "bg-ark-gold text-white" : "text-ink/70"}`}
        >
          학생으로 입장
        </button>
        <button
          type="button"
          onClick={() => setMode("teacher")}
          className={`py-3 rounded-xl font-display text-lg ${mode === "teacher" ? "bg-ink text-cream" : "text-ink/70"}`}
        >
          진행자(교사)
        </button>
      </div>

      {mode === "student" && (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-lg opacity-80">이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={6}
              placeholder="2~6글자"
              className="px-4 py-3 rounded-xl border-2 border-ink/20 bg-white text-xl"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-lg opacity-80">동물 선택</span>
            <div className="grid grid-cols-4 gap-3">
              {ANIMALS.map((a) => {
                const taken = takenAnimalIds.has(a.id);
                const selected = animalId === a.id;
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => !taken && setAnimalId(a.id)}
                    disabled={taken}
                    className={[
                      "aspect-square flex flex-col items-center justify-center rounded-2xl text-4xl border-2 transition",
                      taken
                        ? "bg-gray-100 border-gray-200 opacity-40 cursor-not-allowed"
                        : selected
                          ? "bg-ark-gold/20 border-ark-gold scale-105"
                          : "bg-white border-ink/10",
                    ].join(" ")}
                  >
                    <span>{a.emoji}</span>
                    <span className="text-xs font-display mt-1">{a.name}</span>
                    {taken && <span className="text-[10px] opacity-60">🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {mode === "teacher" && (
        <label className="flex flex-col gap-2">
          <span className="text-lg opacity-80">교사 PIN (4자리)</span>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="0000"
            className="px-4 py-3 rounded-xl border-2 border-ink/20 bg-white text-2xl font-display tracking-widest text-center"
          />
        </label>
      )}

      {error && (
        <div className="bg-mission/30 border-2 border-mission-edge rounded-xl px-4 py-3 text-base">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-auto py-5 rounded-2xl bg-ark-gold text-white font-display text-2xl shadow-lg active:scale-95"
      >
        입장
      </button>
    </main>
  );
}
