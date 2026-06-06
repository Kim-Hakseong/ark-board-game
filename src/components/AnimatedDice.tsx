import { useEffect, useState } from "react";

interface AnimatedDiceProps {
  value: number | null; // null이면 idle 🎲
  // 호스트는 state.lastDiceRoll이 바뀌는 순간 새 애니메이션 시작.
  // 컨트롤러는 자기가 굴린 직후 자기 값을 받아 같은 식으로 애니메이션.
  trigger: number | string | null; // 변경되면 새 애니메이션
  size?: "sm" | "md" | "lg" | "xl";
  durationMs?: number;
}

const SIZE: Record<NonNullable<AnimatedDiceProps["size"]>, string> = {
  sm: "w-16 h-16 text-4xl rounded-xl",
  md: "w-24 h-24 text-5xl rounded-2xl",
  lg: "w-32 h-32 text-6xl rounded-2xl",
  xl: "w-44 h-44 text-7xl rounded-3xl",
};

// 주사위 면 이모지 (1~6)
const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function AnimatedDice({
  value,
  trigger,
  size = "lg",
  durationMs = 700,
}: AnimatedDiceProps) {
  const [shown, setShown] = useState<number | null>(value);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (trigger === null || trigger === undefined) {
      setShown(value);
      setRolling(false);
      return;
    }
    setRolling(true);
    const start = Date.now();
    const id = window.setInterval(() => {
      setShown(Math.floor(Math.random() * 6) + 1);
      if (Date.now() - start >= durationMs) {
        window.clearInterval(id);
        setShown(value);
        setRolling(false);
      }
    }, 70);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, durationMs]);

  // value가 null로 리셋되면 idle
  useEffect(() => {
    if (value === null && !rolling) setShown(null);
  }, [value, rolling]);

  const display = rolling && shown ? FACES[shown - 1] : (shown ?? "🎲");

  return (
    <div
      className={[
        SIZE[size],
        "bg-white shadow-2xl flex items-center justify-center font-display select-none",
        rolling ? "animate-[diceSpin_0.18s_ease-in-out_infinite]" : "transition-transform",
      ].join(" ")}
    >
      {display}
      <style>{`
        @keyframes diceSpin {
          0% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.05); }
          100% { transform: rotate(-8deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
