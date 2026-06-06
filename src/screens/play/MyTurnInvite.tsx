import { useEffect, useState } from "react";
import { getAnimal } from "../../data/animals";
import type { Player } from "../../logic/types";

interface MyTurnInviteProps {
  candidates: Player[]; // 미도착자만
  onInvite: (targetId: string) => void;
  onSkip: () => void;
  timeoutMs?: number;
}

// PRD §4.3 — 도착자 턴: 미도착자 1명 선택 +1칸, 15초 무선택 시 자동 스킵
export function MyTurnInvite({
  candidates,
  onInvite,
  onSkip,
  timeoutMs = 15_000,
}: MyTurnInviteProps) {
  const [remaining, setRemaining] = useState(Math.ceil(timeoutMs / 1000));

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((timeoutMs - (Date.now() - start)) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        onSkip();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [timeoutMs, onSkip]);

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="text-center">
        <div className="font-display text-3xl">누구를 초청할까요?</div>
        <div className="text-base opacity-70 mt-1">
          한 명을 골라 +1칸 보내줄 수 있어요.
        </div>
      </div>

      <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-ark-gold transition-all"
          style={{ width: `${(remaining / Math.ceil(timeoutMs / 1000)) * 100}%` }}
        />
      </div>
      <div className="text-center text-sm opacity-60">{remaining}초</div>

      {candidates.length === 0 ? (
        <div className="text-center opacity-60 italic mt-4">초청할 수 있는 친구가 없어요.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {candidates.map((p) => {
            const animal = getAnimal(p.animalId);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => onInvite(p.id)}
                className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-ink/10 active:scale-95"
              >
                <span className="text-4xl">{animal?.emoji}</span>
                <span className="text-xs font-display mt-1">{p.name}</span>
                <span className="text-[10px] opacity-60">{p.position}칸</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="mt-auto py-3 rounded-xl bg-ink/10 text-base"
      >
        건너뛰기
      </button>
    </div>
  );
}
