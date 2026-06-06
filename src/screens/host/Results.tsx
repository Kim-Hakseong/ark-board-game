import { TvCanvas } from "../../components/TvCanvas";
import { getAnimal } from "../../data/animals";
import { FINAL_MESSAGE } from "../../data/cells";
import { computeResults, type ResultEntry } from "../../logic/results";
import type { GameState } from "../../logic/types";

interface ResultsProps {
  state: GameState;
  onReset?: () => void;
}

export function Results({ state, onReset }: ResultsProps) {
  const entries = computeResults(state);
  // 메달 포디움: 1~3위
  const podium = entries.slice(0, 3);
  // 갑판 동물 (도착자 우선 + 나머지)
  const deckOrder = [...entries.filter((e) => e.arrived), ...entries.filter((e) => !e.arrived)];

  return (
    <TvCanvas>
      <div className="res-root paper-noise" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <ResultsScape />

        {/* 타이틀 */}
        <div style={{ position: "absolute", top: 36, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              color: "#fff",
              background: "var(--grace)",
              whiteSpace: "nowrap",
              padding: "6px 20px",
              borderRadius: 16,
              border: "4px solid #fff",
              boxShadow: "var(--sh-soft)",
              display: "inline-block",
              transform: "rotate(-1.5deg)",
            }}
          >
            모두 무사히 도착했어요
          </span>
          <h1
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-display)",
              fontSize: 72,
              color: "var(--ark-deep)",
              lineHeight: 1,
              whiteSpace: "nowrap",
              WebkitTextStroke: "7px #fff",
              paintOrder: "stroke fill",
              textShadow: "0 7px 0 rgba(201,127,30,.35), 0 12px 16px rgba(74,59,42,.25)",
            }}
          >
            다 함께 방주로!
          </h1>
        </div>

        {/* 새 게임 버튼 (호스트) */}
        {onReset && (
          <button
            type="button"
            onClick={() => {
              if (confirm("새 게임을 시작합니다. 점수가 초기화돼요. 진행할까요?")) {
                onReset();
              }
            }}
            style={{
              position: "absolute",
              top: 36,
              right: 36,
              zIndex: 10,
              padding: "12px 24px",
              borderRadius: 20,
              background: "var(--paper)",
              color: "var(--ark-deep)",
              fontFamily: "var(--font-display)",
              fontSize: 22,
              border: "5px solid var(--ark-gold)",
              boxShadow: "var(--sh-pop)",
              cursor: "pointer",
            }}
          >
            🔄 새 게임
          </button>
        )}

        {/* 방주 + 갑판 동물 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 180,
            transform: "translateX(-50%)",
            width: 1180,
            height: 320,
            zIndex: 5,
          }}
        >
          {/* 갑판 위 동물 줄세움 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 40,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              zIndex: 6,
              flexWrap: "wrap",
              maxWidth: 1180,
              margin: "0 auto",
            }}
          >
            {deckOrder.map((e, i) => {
              const a = getAnimal(e.animalId);
              return (
                <span
                  key={e.playerId}
                  style={{
                    fontSize: 64,
                    filter: "drop-shadow(0 5px 4px rgba(74,59,42,.3))",
                    animation: "wave 2.4s ease-in-out infinite",
                    animationDelay: `${(i % 4) * 0.15}s`,
                  }}
                  title={`${e.name}${e.arrived ? ` · ${e.arrivalRank}등 도착` : ""}`}
                >
                  {a?.emoji}
                </span>
              );
            })}
          </div>
          <svg
            viewBox="0 0 1180 320"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 16px 18px rgba(74,59,42,.28))",
            }}
          >
            <defs>
              <linearGradient id="resHull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#D9A86A" />
                <stop offset="1" stopColor="#B07C3E" />
              </linearGradient>
            </defs>
            <ellipse cx="590" cy="220" rx="560" ry="110" fill="#FFE9A8" opacity="0.45" />
            <path
              d="M40 140 Q 590 290 1140 140 L1070 280 Q 590 340 110 280 Z"
              fill="url(#resHull)"
              stroke="#8A5A2E"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <g stroke="#9C6B3E" strokeWidth="6" opacity="0.7">
              <path d="M120 240 Q 590 312 1060 240" fill="none" />
              <path d="M90 200 Q 590 280 1090 200" fill="none" />
            </g>
            <rect x="150" y="110" width="880" height="40" rx="14" fill="#E7C68C" stroke="#8A5A2E" strokeWidth="7" />
            <g stroke="#8A5A2E" strokeWidth="6">
              <line x1="250" y1="110" x2="250" y2="150" />
              <line x1="400" y1="110" x2="400" y2="150" />
              <line x1="590" y1="110" x2="590" y2="150" />
              <line x1="780" y1="110" x2="780" y2="150" />
              <line x1="930" y1="110" x2="930" y2="150" />
            </g>
            <line x1="590" y1="110" x2="590" y2="50" stroke="#8A5A2E" strokeWidth="6" />
            <path d="M590 54 L660 68 L590 82 Z" fill="#E8A33D" />
          </svg>
        </div>

        {/* 메달 포디움 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 220,
            transform: "translateX(-50%)",
            zIndex: 7,
            display: "flex",
            alignItems: "flex-end",
            gap: 26,
          }}
        >
          {podium[1] && <MedalCard entry={podium[1]} rank={2} />}
          {podium[0] && <MedalCard entry={podium[0]} rank={1} />}
          {podium[2] && <MedalCard entry={podium[2]} rank={3} />}
        </div>

        {/* 마무리 메시지 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 28,
            transform: "translateX(-50%)",
            zIndex: 7,
            width: 1500,
            background: "var(--paper)",
            borderRadius: 24,
            border: "6px solid #fff",
            boxShadow: "var(--sh-deep)",
            padding: "22px 44px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ark-deep)" }}>
            방주 문은 정확한 때에만 열렸습니다.
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 23, color: "var(--ink)", lineHeight: 1.5, marginTop: 6 }}>
            {/* PRD §6.5 — 글자 단위 보존. 두 번째 줄은 FINAL_MESSAGE의 나머지 부분. */}
            {FINAL_MESSAGE.replace("방주 문은 정확한 때에만 열렸습니다. ", "")}
          </div>
        </div>

        <Confetti />
      </div>
    </TvCanvas>
  );
}

// ────────────────────────────────────────────────────────────
function MedalCard({ entry, rank }: { entry: ResultEntry; rank: number }) {
  const animal = getAnimal(entry.animalId);
  const isFirst = rank === 1;
  const medalColor =
    rank === 1
      ? "linear-gradient(180deg,#FFE08A,#E8A33D)"
      : rank === 2
        ? "linear-gradient(180deg,#EAEef2,#B9C4cf)"
        : "linear-gradient(180deg,#F0CBA0,#C98E54)";
  const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

  return (
    <div
      style={{
        background: "var(--paper)",
        borderRadius: 26,
        border: isFirst ? "6px solid var(--ark-gold)" : "6px solid #fff",
        boxShadow: "var(--sh-deep)",
        width: isFirst ? 270 : 230,
        padding: isFirst ? "30px 18px 20px" : "22px 18px 20px",
        textAlign: "center",
        position: "relative",
        transform: isFirst ? "translateY(-26px)" : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          width: 62,
          height: 62,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 32,
          background: medalColor,
          border: "5px solid #fff",
          boxShadow: "var(--sh-soft)",
        }}
      >
        {medalEmoji}
      </div>
      <div style={{ fontSize: isFirst ? 84 : 64, filter: "drop-shadow(0 4px 3px rgba(74,59,42,.3))", marginTop: isFirst ? 18 : 12 }}>
        {animal?.emoji}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--ink)", marginTop: 2 }}>
        {entry.name}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--ink-soft)", marginTop: 2 }}>
        {entry.arrived ? `${entry.arrivalRank}등 도착` : `${entry.position}칸`}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "var(--font-display)",
          fontSize: 20,
          color: "var(--ark-deep)",
          background: "linear-gradient(180deg,#fff5e2,#ffe9c4)",
          borderRadius: 14,
          padding: "6px 4px",
          border: "3px solid var(--ark-gold)",
        }}
      >
        {entry.total}점 · 도착 +{entry.arrivalBonus} / 토큰 {entry.tokensExcludingBonus}
      </div>
    </div>
  );
}

// 컨트롤러용 내 결과 카드
export function MyResultCard({
  state,
  myPlayerId,
}: {
  state: GameState;
  myPlayerId: string;
}) {
  const entries = computeResults(state);
  const mine = entries.find((e) => e.playerId === myPlayerId);
  if (!mine) return null;
  const animal = getAnimal(mine.animalId);
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-3">
      <div className="font-display text-2xl">🌈 결과</div>
      <div className="text-5xl">{animal?.emoji}</div>
      <div className="font-display text-xl">{mine.name}</div>
      <div className="font-display text-5xl text-ark-gold">{mine.total}점</div>
      <div className="text-sm opacity-70">
        도착 +{mine.arrivalBonus} / 토큰 {mine.tokensExcludingBonus} · 최종 {mine.finalRank}등
      </div>
      <div className="text-xs opacity-60 mt-2 text-center leading-relaxed">{FINAL_MESSAGE}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#E58B8B", "#E6D673", "#94C97E", "#7FB6D6", "#9C8FD0", "#E8A33D"];
  const pieces = Array.from({ length: 50 });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8, overflow: "hidden" }}>
      {pieces.map((_, i) => (
        <i
          key={i}
          style={{
            position: "absolute",
            top: -20,
            left: `${(i * 17) % 100}%`,
            width: 12,
            height: 16,
            borderRadius: 3,
            opacity: 0.9,
            background: colors[i % colors.length],
            transform: `rotate(${(i * 31) % 360}deg)`,
            animation: `drop ${2.4 + (i % 5) * 0.4}s linear infinite`,
            animationDelay: `${-(i % 10) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function ResultsScape() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="resSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CFEAF6" />
            <stop offset="1" stopColor="#FBEAD2" />
          </linearGradient>
          <radialGradient id="resSun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6D8" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="resWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFE3F2" />
            <stop offset="1" stopColor="#A6D0E8" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#resSky)" />
        <circle cx="960" cy="300" r="320" fill="url(#resSun)" />
        <g fill="none" strokeWidth="32" opacity="0.7">
          <path d="M160 760 A 800 800 0 0 1 1760 760" stroke="#E58B8B" />
          <path d="M204 766 A 756 756 0 0 1 1716 766" stroke="#E6A35C" />
          <path d="M248 772 A 712 712 0 0 1 1672 772" stroke="#E6D673" />
          <path d="M292 778 A 668 668 0 0 1 1628 778" stroke="#94C97E" />
          <path d="M336 784 A 624 624 0 0 1 1584 784" stroke="#7FB6D6" />
          <path d="M380 790 A 580 580 0 0 1 1540 790" stroke="#9C8FD0" />
        </g>
        <g fill="#fff" opacity="0.9">
          <ellipse cx="320" cy="220" rx="120" ry="46" />
          <ellipse cx="400" cy="200" rx="76" ry="40" />
          <ellipse cx="1560" cy="240" rx="110" ry="44" />
          <ellipse cx="1640" cy="220" rx="70" ry="36" />
        </g>
        <path d="M0 720 Q 480 680 960 716 T 1920 720 V1080 H0 Z" fill="url(#resWater)" />
        <g stroke="#E8F4F8" strokeWidth="5" fill="none" opacity="0.7" strokeLinecap="round">
          <path d="M180 820 Q 280 800 380 820" />
          <path d="M1480 860 Q 1580 840 1680 860" />
          <path d="M700 900 Q 820 878 940 900" />
        </g>
      </svg>
    </div>
  );
}
