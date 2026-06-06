import { useEffect, useRef, useState } from "react";
import {
  requestMotionPermission,
  useShakeDetection,
  vibrate,
} from "../../hooks/useShakeDetection";

interface MyTurnDiceProps {
  onRoll: (dice: number) => void;
}

type Stage = "ready" | "rolling" | "result";

const ROLL_DURATION = 800;

export function MyTurnDice({ onRoll }: MyTurnDiceProps) {
  const [stage, setStage] = useState<Stage>("ready");
  const [dice, setDice] = useState<number | null>(null);
  const [perm, setPerm] = useState<"granted" | "denied" | "default" | "unknown">(
    typeof DeviceMotionEvent === "undefined" ? "denied" : "unknown",
  );
  const submittedRef = useRef(false);

  // 데스크탑 등에서 권한 개념 없는 경우 자동 granted
  useEffect(() => {
    if (perm !== "unknown") return;
    const Ev = DeviceMotionEvent as unknown as { requestPermission?: () => unknown };
    if (typeof Ev.requestPermission !== "function") setPerm("granted");
  }, [perm]);

  const startRoll = () => {
    if (stage !== "ready" || submittedRef.current) return;
    submittedRef.current = true;
    const result = Math.floor(Math.random() * 6) + 1;
    setStage("rolling");
    vibrate([60, 40, 100]);
    setTimeout(() => {
      setDice(result);
      setStage("result");
      onRoll(result);
    }, ROLL_DURATION);
  };

  useShakeDetection({
    enabled: stage === "ready" && perm === "granted",
    onShake: startRoll,
  });

  const requestPerm = async () => {
    const result = await requestMotionPermission();
    setPerm(result);
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-4">
      <div className="text-center">
        <div className="text-xl opacity-70 mb-1">내 차례!</div>
        <div className="font-display text-3xl">
          {stage === "ready" && "폰을 흔드세요"}
          {stage === "rolling" && "굴리는 중…"}
          {stage === "result" && "결과"}
        </div>
      </div>

      <div
        className={[
          "w-44 h-44 rounded-3xl bg-white shadow-2xl flex items-center justify-center font-display text-7xl",
          stage === "rolling" ? "animate-bounce" : "",
        ].join(" ")}
      >
        {stage === "result" ? dice : "🎲"}
      </div>

      {perm === "unknown" && (
        <button
          type="button"
          onClick={requestPerm}
          className="px-5 py-3 rounded-xl bg-ink/10 text-base"
        >
          흔들기 허용하기
        </button>
      )}
      {perm === "denied" && (
        <div className="text-xs opacity-60 text-center">
          모션 권한이 없습니다 — 아래 버튼으로 굴리세요.
        </div>
      )}

      <button
        type="button"
        onClick={startRoll}
        disabled={stage !== "ready"}
        className="w-full py-5 rounded-2xl bg-ark-gold text-white font-display text-2xl shadow-lg disabled:opacity-40 active:scale-95"
      >
        🎲 굴리기
      </button>
    </div>
  );
}
