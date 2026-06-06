import { useEffect, useState } from "react";
import { getAnimal } from "../../data/animals";
import { getCell } from "../../data/cells";
import type { GameState } from "../../logic/types";

interface QuizOverlayProps {
  state: GameState;
  onContinue: () => void; // 결과 모달 닫고 턴 진행
}

export function QuizOverlay({ state, onContinue }: QuizOverlayProps) {
  const quiz = state.quiz!;
  const cell = getCell(quiz.cellIndex);
  if (!cell || cell.kind !== "WORD") return null;

  const stoppedPlayer = state.players.find((p) => p.id === quiz.stoppedPlayerId);
  const stoppedAnimal = stoppedPlayer ? getAnimal(stoppedPlayer.animalId) : null;
  const closed = quiz.closed;

  return (
    <div className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-12">
      <div className="bg-cream rounded-3xl w-full max-w-5xl p-10 shadow-2xl border-4 border-word-edge">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="text-xl font-display text-word-edge mb-2">
              📖 말씀 퀴즈 · {cell.index}번 칸
            </div>
            <div className="text-sm opacity-70 mb-4">
              {stoppedAnimal?.emoji} {stoppedPlayer?.name}님이 멈춘 칸 — 전원 참여
            </div>
            <h2 className="font-display text-5xl leading-tight">{cell.question}</h2>
          </div>
          {!closed && <TimerRing deadlineMs={quiz.deadlineMs} />}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {cell.choices.map((choice, i) => {
            const isCorrect = i === cell.correctIndex;
            const reveal = closed;
            return (
              <div
                key={i}
                className={[
                  "rounded-2xl p-5 border-2 font-display text-3xl flex items-center gap-3 transition",
                  reveal && isCorrect
                    ? "bg-grace/40 border-grace"
                    : "bg-white border-word-edge/30",
                ].join(" ")}
              >
                <span className="text-4xl">{"①②③④"[i]}</span>
                <span>{choice}</span>
                {reveal && isCorrect && <span className="ml-auto text-3xl">✅</span>}
              </div>
            );
          })}
        </div>

        {!closed && <ResponseStrip state={state} />}

        {closed && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="bg-white/70 rounded-2xl p-5 text-2xl">
              💡 {cell.explanation}
            </div>
            <WinnersStrip state={state} correctIndex={cell.correctIndex} />
            <button
              type="button"
              onClick={onContinue}
              className="self-end px-8 py-4 rounded-2xl bg-ark-gold text-white font-display text-2xl shadow-lg"
            >
              계속 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimerRing({ deadlineMs }: { deadlineMs: number }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)),
  );
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [deadlineMs]);
  const pulse = remaining <= 5;
  return (
    <div
      className={[
        "w-32 h-32 rounded-full border-4 flex items-center justify-center font-display text-5xl shrink-0",
        pulse ? "border-ark-gold text-ark-gold animate-pulse" : "border-word-edge text-word-edge",
      ].join(" ")}
    >
      {remaining}
    </div>
  );
}

function ResponseStrip({ state }: { state: GameState }) {
  const quiz = state.quiz!;
  return (
    <div className="flex items-center gap-3 mt-6 flex-wrap">
      <span className="text-sm opacity-60 font-display">응답</span>
      {state.players.map((p) => {
        const a = getAnimal(p.animalId);
        const answered = quiz.answers[p.id] !== undefined;
        return (
          <div
            key={p.id}
            className={[
              "w-10 h-10 rounded-full flex items-center justify-center text-xl shadow",
              answered ? "bg-grace text-white" : "bg-white opacity-50",
            ].join(" ")}
            title={p.name}
          >
            {a?.emoji}
          </div>
        );
      })}
    </div>
  );
}

function WinnersStrip({
  state,
  correctIndex,
}: {
  state: GameState;
  correctIndex: number;
}) {
  const winners = state.players.filter(
    (p) => state.quiz!.answers[p.id] === correctIndex,
  );
  if (winners.length === 0)
    return <div className="text-base opacity-60">정답자 없음</div>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-base opacity-60 font-display">정답</span>
      {winners.map((p) => {
        const a = getAnimal(p.animalId);
        return (
          <div
            key={p.id}
            className="flex items-center gap-1 bg-grace/30 rounded-full px-3 py-1 font-display animate-bounce"
          >
            <span className="text-xl">{a?.emoji}</span>
            <span>{p.name}</span>
            <span className="text-xs opacity-70">+1🪙</span>
          </div>
        );
      })}
    </div>
  );
}
