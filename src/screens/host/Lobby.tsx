import { QRCodeSVG } from "qrcode.react";
import { TvCanvas } from "../../components/TvCanvas";
import { getAnimal } from "../../data/animals";
import { MAX_PLAYERS } from "../../logic/state";
import type { GameState } from "../../logic/types";

interface LobbyProps {
  state: GameState;
  joinUrl: string;
  onTestStart?: () => void;
  showTestStart?: boolean;
}

export function Lobby({ state, joinUrl, onTestStart, showTestStart }: LobbyProps) {
  const canStart = state.players.length >= 2;
  // 갤러리 슬롯: 입장 인원 ≤ 10이면 10슬롯, 그 외엔 인원에 맞춰 늘림
  const slots = Math.max(10, state.players.length);

  return (
    <TvCanvas>
      <div className="lobby-root paper-noise" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <LobbyScape />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "grid",
            gridTemplateColumns: "560px 1fr",
            gridTemplateRows: "auto 1fr",
            gap: 40,
            padding: "48px 56px 56px",
          }}
        >
          {/* 타이틀 플라크 */}
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 28 }}>
            <ArkIcon />
            <div style={{ lineHeight: 1 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  background: "var(--grace)",
                  padding: "6px 20px",
                  borderRadius: 16,
                  border: "4px solid #fff",
                  boxShadow: "var(--sh-soft)",
                  transform: "rotate(-2deg)",
                  marginBottom: 12,
                }}
              >
                교회 토요교제 · 실시간 게임
              </span>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 84,
                  color: "var(--ark-deep)",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  WebkitTextStroke: "7px #fff",
                  paintOrder: "stroke fill",
                  textShadow: "0 7px 0 rgba(201,127,30,.35), 0 12px 16px rgba(74,59,42,.25)",
                }}
              >
                방주로 가는 길
              </h1>
            </div>
          </div>

          {/* 입장 카드 */}
          <div
            style={{
              alignSelf: "start",
              background: "var(--paper)",
              borderRadius: "var(--r-card)",
              border: "7px solid #fff",
              boxShadow: "var(--sh-deep)",
              padding: "30px 28px",
              transform: "rotate(-1.5deg)",
              position: "relative",
            }}
          >
            {/* 마스킹 테이프 */}
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%) rotate(-3deg)",
                width: 140,
                height: 32,
                background: "rgba(232,163,61,.55)",
                borderRadius: 4,
                boxShadow: "var(--sh-soft)",
              }}
            />
            <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink)", textAlign: "center" }}>
              📱 폰으로 입장하세요
            </h2>
            <div
              style={{
                width: 320,
                height: 320,
                margin: "0 auto",
                background: "#fff",
                border: "6px solid var(--ink)",
                borderRadius: 18,
                padding: 14,
                boxShadow: "var(--sh-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCodeSVG value={joinUrl} size={278} level="M" />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              <CodeBox label="방 코드" value={state.roomCode} variant="gold" />
              <CodeBox label="교사 PIN" value={state.teacherPin} variant="blue" />
            </div>
            <div style={{ marginTop: 14, fontSize: 16, color: "var(--ink-soft)", textAlign: "center", lineHeight: 1.5 }}>
              {joinUrl}
            </div>
          </div>

          {/* 갤러리 */}
          <div style={{ alignSelf: "start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 38,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  textShadow: "0 3px 0 rgba(0,0,0,.18)",
                }}
              >
                입장한 친구들
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  color: "var(--ark-deep)",
                  background: "var(--paper)",
                  whiteSpace: "nowrap",
                  border: "5px solid #fff",
                  borderRadius: 20,
                  padding: "4px 18px",
                  boxShadow: "var(--sh-soft)",
                }}
              >
                {state.players.length}/{MAX_PLAYERS}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "20px 14px",
              }}
            >
              {Array.from({ length: slots }, (_, i) => {
                const p = state.players[i];
                if (!p) return <EmptySlot key={`empty-${i}`} />;
                const a = getAnimal(p.animalId);
                return (
                  <FriendStand
                    key={p.id}
                    emoji={a?.emoji ?? "❓"}
                    name={p.name}
                    delay={i * 70}
                  />
                );
              })}
            </div>

            {showTestStart && (
              <div style={{ marginTop: 28 }}>
                <button
                  type="button"
                  onClick={onTestStart}
                  disabled={!canStart}
                  style={{
                    padding: "16px 32px",
                    borderRadius: 20,
                    background: canStart ? "var(--ark-gold)" : "#cdb89a",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    border: "5px solid #fff",
                    boxShadow: "var(--sh-pop)",
                    cursor: canStart ? "pointer" : "not-allowed",
                  }}
                >
                  [데모] 게임 시작 {canStart ? "" : "(2명 이상 필요)"}
                </button>
              </div>
            )}
            {!showTestStart && (
              <div style={{ marginTop: 24, fontSize: 22, color: "rgba(255,255,255,.85)", textShadow: "0 2px 0 rgba(0,0,0,.18)" }}>
                교사가 모바일에서 PIN을 입력해 [게임 시작]을 눌러주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </TvCanvas>
  );
}

function CodeBox({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "gold" | "blue";
}) {
  const palette =
    variant === "gold"
      ? {
          bg: "linear-gradient(180deg,#fff5e2,#ffe9c4)",
          border: "var(--ark-gold)",
          color: "var(--ark-deep)",
          fontSize: 50,
        }
      : {
          bg: "linear-gradient(180deg,#eef3fb,#dde7f5)",
          border: "#8FA3BF",
          color: "#5d77a0",
          fontSize: 44,
        };
  return (
    <div
      style={{
        flex: 1,
        background: palette.bg,
        border: `5px solid ${palette.border}`,
        borderRadius: 20,
        padding: "10px 6px 12px",
        textAlign: "center",
        boxShadow: "var(--sh-soft)",
      }}
    >
      <small style={{ display: "block", fontSize: 20, color: "var(--ink-soft)", fontFamily: "var(--font-display)" }}>
        {label}
      </small>
      <b
        style={{
          fontFamily: "var(--font-display)",
          fontSize: palette.fontSize,
          letterSpacing: variant === "gold" ? 5 : 7,
          color: palette.color,
          lineHeight: 1,
        }}
      >
        {value}
      </b>
    </div>
  );
}

function FriendStand({ emoji, name, delay }: { emoji: string; name: string; delay: number }) {
  return (
    <div
      style={{
        textAlign: "center",
        animation: "pop .5s var(--ease-pop) backwards",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          width: 124,
          height: 134,
          margin: "0 auto 8px",
          borderRadius: "50px 50px 24px 24px",
          background: "linear-gradient(180deg, var(--paper), #f4e9d6)",
          border: "6px solid #fff",
          boxShadow: "var(--sh-pop)",
          display: "grid",
          placeItems: "center",
          position: "relative",
        }}
      >
        <span style={{ fontSize: 68, lineHeight: 1 }}>{emoji}</span>
        <span
          style={{
            content: "''",
            position: "absolute",
            bottom: -16,
            left: "50%",
            transform: "translateX(-50%)",
            width: 86,
            height: 18,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(74,59,42,.3), transparent 70%)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          color: "var(--ink)",
          whiteSpace: "nowrap",
          background: "rgba(255,251,243,.9)",
          borderRadius: 14,
          padding: "2px 10px",
          display: "inline-block",
        }}
      >
        {name}
      </span>
    </div>
  );
}

function EmptySlot() {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 124,
          height: 134,
          margin: "0 auto 8px",
          borderRadius: "50px 50px 24px 24px",
          background: "rgba(255,251,243,.35)",
          border: "6px dashed rgba(255,255,255,.7)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span style={{ fontSize: 44, opacity: 0.5 }}>＋</span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink-soft)" }}>
        대기중
      </span>
    </div>
  );
}

function ArkIcon() {
  return (
    <svg
      style={{ width: 116, height: 100, flex: "none", filter: "drop-shadow(0 10px 10px rgba(74,59,42,.3))" }}
      viewBox="0 0 150 130"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="75" cy="80" rx="78" ry="42" fill="#FFE9A8" opacity=".55" />
      <path
        d="M10 78 Q75 116 140 78 L128 104 Q75 128 22 104 Z"
        fill="#D9A86A"
        stroke="#8A5A2E"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect x="38" y="36" width="74" height="44" rx="8" fill="#E7C68C" stroke="#8A5A2E" strokeWidth="5" />
      <path
        d="M30 38 L75 12 L120 38 Z"
        fill="#C8763E"
        stroke="#8A5A2E"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M64 80 V58 a11 11 0 0 1 22 0 V80 Z" fill="#FFF6D8" stroke="#8A5A2E" strokeWidth="4" />
    </svg>
  );
}

function LobbyScape() {
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
          <linearGradient id="lobbySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CDEAF5" />
            <stop offset="1" stopColor="#EAF6EE" />
          </linearGradient>
          <radialGradient id="lobbySun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6D8" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#lobbySky)" />
        <circle cx="1620" cy="200" r="260" fill="url(#lobbySun)" />
        <circle cx="1620" cy="200" r="90" fill="#FFE07A" />
        <g fill="none" strokeWidth="22" opacity=".5">
          <path d="M120 720 A 840 840 0 0 1 1800 720" stroke="#E58B8B" />
          <path d="M150 730 A 810 810 0 0 1 1770 730" stroke="#E6B36A" />
          <path d="M180 740 A 780 780 0 0 1 1740 740" stroke="#E6D673" />
          <path d="M210 750 A 750 750 0 0 1 1710 750" stroke="#94C97E" />
          <path d="M240 760 A 720 720 0 0 1 1680 760" stroke="#7FB6D6" />
        </g>
        <g fill="#fff" opacity=".9">
          <ellipse cx="400" cy="180" rx="120" ry="46" />
          <ellipse cx="480" cy="160" rx="76" ry="42" />
          <ellipse cx="1180" cy="140" rx="110" ry="44" />
        </g>
        <path d="M0 760 Q 480 690 980 760 T 1920 760 V1080 H0 Z" fill="#CFE3AE" />
        <path d="M0 880 Q 520 820 1040 880 T 1920 900 V1080 H0 Z" fill="#BBD68E" />
        <g transform="translate(150 840)">
          <rect x="-12" y="0" width="24" height="60" rx="8" fill="#9C6B3E" />
          <circle cx="0" cy="-18" r="56" fill="#8FBF6B" />
          <circle cx="-34" cy="6" r="38" fill="#9FCB78" />
        </g>
        <g transform="translate(1780 860) scale(.9)">
          <rect x="-12" y="0" width="24" height="60" rx="8" fill="#9C6B3E" />
          <circle cx="0" cy="-18" r="56" fill="#7FB05E" />
        </g>
      </svg>
    </div>
  );
}
