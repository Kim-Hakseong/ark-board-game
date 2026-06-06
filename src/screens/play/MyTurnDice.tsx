import { useRef, useState } from "react";
import { AnimatedDice } from "../../components/AnimatedDice";
import { vibrate } from "../../hooks/useShakeDetection";

interface MyTurnDiceProps {
  onRoll: (dice: number) => void;
}

const ROLL_DURATION = 700;

export function MyTurnDice({ onRoll }: MyTurnDiceProps) {
  const [dice, setDice] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<number | null>(null);
  const submittedRef = useRef(false);

  const startRoll = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = Math.floor(Math.random() * 6) + 1;
    setDice(result);
    setTrigger((t) => (t ?? 0) + 1);
    vibrate([60, 40, 100]);
    // 호스트가 같은 시점에 애니메이션을 시작할 수 있게 즉시 송신
    onRoll(result);
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-4">
      <div className="text-center">
        <div className="text-xl opacity-70 mb-1">내 차례!</div>
        <div className="font-display text-3xl">
          {dice == null ? "주사위를 굴려보세요" : "굴렸어요!"}
        </div>
      </div>

      <AnimatedDice value={dice} trigger={trigger} size="xl" durationMs={ROLL_DURATION} />

      <button
        type="button"
        onClick={startRoll}
        disabled={submittedRef.current}
        className="w-full py-5 rounded-2xl bg-ark-gold text-white font-display text-2xl shadow-lg disabled:opacity-40 active:scale-95"
      >
        🎲 굴리기
      </button>
    </div>
  );
}
