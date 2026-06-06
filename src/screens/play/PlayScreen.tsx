import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAnimal } from "../../data/animals";
import { getCell } from "../../data/cells";
import {
  clearControllerProfile,
  loadControllerProfile,
  saveControllerProfile,
  type ControllerProfile,
} from "../../logic/storage";
import type { GameState } from "../../logic/types";
import { useControllerGame } from "../../realtime/useControllerGame";
import type { Action } from "../../realtime/types";
import { Entry } from "./Entry";
import { MyTurnDice } from "./MyTurnDice";
import { MyTurnInvite } from "./MyTurnInvite";
import { MyResultCard } from "../host/Results";
import { MAX_PLAYERS } from "../../logic/state";

export function PlayScreen() {
  const [searchParams] = useSearchParams();
  const roomCode = (searchParams.get("room") ?? "").toUpperCase().trim();
  const [profile, setProfile] = useState<ControllerProfile | null>(() => {
    const p = loadControllerProfile();
    return p && roomCode && p.roomCode === roomCode ? p : null;
  });

  if (!roomCode) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-cream text-ink text-center">
        <div>
          <h1 className="font-display text-3xl mb-2">잘못된 입장 링크</h1>
          <p className="opacity-70">호스트 화면의 QR을 다시 찍어주세요.</p>
        </div>
      </main>
    );
  }

  return (
    <PlayInner
      roomCode={roomCode}
      profile={profile}
      onSetProfile={setProfile}
    />
  );
}

interface PlayInnerProps {
  roomCode: string;
  profile: ControllerProfile | null;
  onSetProfile: (p: ControllerProfile | null) => void;
}

function PlayInner({ roomCode, profile, onSetProfile }: PlayInnerProps) {
  const { state, send, connected } = useControllerGame({
    roomCode,
    playerId: profile?.playerId ?? "anon",
  });

  // 정상 입장한 플레이어인지 확인
  const myPlayer = useMemo(
    () =>
      profile && !profile.isTeacher
        ? (state?.players.find((p) => p.id === profile.playerId) ?? null)
        : null,
    [profile, state],
  );

  // 학생 입장 후, 호스트가 join을 인식 못 했으면 재송신
  const pendingJoin = profile && !profile.isTeacher && state && !myPlayer && state.phase === "lobby";
  useEffect(() => {
    if (!pendingJoin || !profile) return;
    const t = setTimeout(() => {
      send({
        type: "join",
        playerId: profile.playerId,
        name: profile.name,
        animalId: profile.animalId,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [pendingJoin, profile, send]);

  const handleJoin = useCallback(
    (p: ControllerProfile) => {
      saveControllerProfile(p);
      onSetProfile(p);
      if (!p.isTeacher) {
        send({
          type: "join",
          playerId: p.playerId,
          name: p.name,
          animalId: p.animalId,
        });
      }
    },
    [onSetProfile, send],
  );

  const handleReset = useCallback(() => {
    clearControllerProfile();
    onSetProfile(null);
  }, [onSetProfile]);

  if (!profile) {
    return <Entry roomCode={roomCode} state={state} onJoin={handleJoin} />;
  }

  return (
    <main className="min-h-screen p-4 bg-cream text-ink flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="text-sm opacity-60">
          {connected ? "연결됨" : "연결 중…"} · 방 {roomCode}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm opacity-60 underline"
        >
          입장 해제
        </button>
      </header>

      {profile.isTeacher ? (
        <TeacherStub state={state} send={send} />
      ) : (
        <PlayerStub state={state} profile={profile} send={send} />
      )}
    </main>
  );
}

function PlayerStub({
  state,
  profile,
  send,
}: {
  state: GameState | null;
  profile: ControllerProfile;
  send: (a: Action) => void;
}) {
  const animal = getAnimal(profile.animalId);
  const me = state?.players.find((p) => p.id === profile.playerId);
  const currentTurnId = state?.players[state?.currentTurnIdx ?? 0]?.id ?? null;
  const isMyTurn = currentTurnId === profile.playerId;
  const phase = state?.phase;
  const inGame = phase === "playing" || phase === "rain";

  return (
    <div className="flex flex-col gap-4 flex-1">
      <MyCard animal={animal?.emoji} name={profile.name} me={me} phase={phase} />

      {phase === "lobby" && (
        <div className="bg-white/70 rounded-2xl p-6 text-center">
          <div className="font-display text-xl">친구들을 기다리고 있어요</div>
          <div className="text-sm opacity-60 mt-2">
            {state?.players.length ?? 0}명 입장 — 교사가 [게임 시작]을 누를 거예요.
          </div>
        </div>
      )}

      {inGame && !isMyTurn && (
        <WaitingTurn state={state!} currentTurnId={currentTurnId} />
      )}

      {inGame && isMyTurn && me && !me.arrived && !state?.quiz && !state?.activeCell && (
        <MyTurnDice
          onRoll={(dice) =>
            send({ type: "roll", playerId: profile.playerId, dice })
          }
        />
      )}

      {inGame && isMyTurn && me?.arrived && (
        <MyTurnInvite
          candidates={state!.players.filter((p) => !p.arrived)}
          onInvite={(targetId) =>
            send({ type: "invite", playerId: profile.playerId, targetId })
          }
          onSkip={() => send({ type: "skipInvite", playerId: profile.playerId })}
        />
      )}

      {state?.quiz && !state.quiz.closed && (
        <QuizPanel state={state} myPlayerId={profile.playerId} send={send} />
      )}

      {state?.activeCell?.awaitingGraceTarget &&
        state.activeCell.triggeredByPlayerId === profile.playerId && (
          <GracePicker
            state={state}
            onPick={(targetId) =>
              send({
                type: "graceTarget",
                playerId: profile.playerId,
                targetId,
              })
            }
          />
        )}

      {phase === "ended" && state && (
        <MyResultCard state={state} myPlayerId={profile.playerId} />
      )}
    </div>
  );
}

function MyCard({
  animal,
  name,
  me,
  phase,
}: {
  animal: string | undefined;
  name: string;
  me: GameState["players"][number] | undefined;
  phase: GameState["phase"] | undefined;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
      <div className="text-6xl">{animal}</div>
      <div className="flex-1">
        <div className="font-display text-2xl">{name}</div>
        <div className="text-sm opacity-70">
          {me
            ? `${me.arrived ? "방주 도착 🛟" : `${me.position}칸`} · 토큰 ${me.tokens}`
            : "로비 입장 중…"}
        </div>
      </div>
      {phase === "rain" && (
        <div className="text-sm font-display bg-rain/30 text-ink rounded-full px-3 py-1">
          비
        </div>
      )}
    </div>
  );
}

function WaitingTurn({
  state,
  currentTurnId,
}: {
  state: GameState;
  currentTurnId: string | null;
}) {
  const current = state.players.find((p) => p.id === currentTurnId);
  const currentAnimal = current ? getAnimal(current.animalId) : null;
  return (
    <div className="bg-white/70 rounded-2xl p-5 flex flex-col items-center gap-2">
      <div className="text-sm opacity-60">지금은</div>
      <div className="text-5xl">{currentAnimal?.emoji}</div>
      <div className="font-display text-xl">{current?.name ?? "—"} 차례</div>
      {state.countdown.active && (
        <div className="mt-2 text-sm font-display text-rain">
          문이 닫히기까지 D-{state.countdown.daysLeft}
        </div>
      )}
    </div>
  );
}

function QuizPanel({
  state,
  myPlayerId,
  send,
}: {
  state: GameState;
  myPlayerId: string;
  send: (a: Action) => void;
}) {
  const quiz = state.quiz!;
  const myAnswer = quiz.answers[myPlayerId];
  // 셀 콘텐츠는 데이터에서 직접 읽음 (호스트가 같은 데이터를 가짐)
  const cell = getCell(quiz.cellIndex);
  if (!cell || cell.kind !== "WORD") return null;
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <div className="text-sm opacity-60">말씀 퀴즈 ({quiz.cellIndex}번 칸)</div>
      <div className="font-display text-lg leading-snug">{cell.question}</div>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {cell.choices.map((choice, i) => {
          const selected = myAnswer === i;
          return (
            <button
              type="button"
              key={i}
              disabled={myAnswer !== undefined}
              onClick={() =>
                send({ type: "answer", playerId: myPlayerId, choice: i })
              }
              className={[
                "w-full text-left px-4 py-3 rounded-xl border-2 transition",
                selected
                  ? "bg-ark-gold/20 border-ark-gold"
                  : myAnswer !== undefined
                    ? "bg-gray-100 border-gray-200 opacity-50"
                    : "bg-white border-word-edge/40 active:scale-[0.98]",
              ].join(" ")}
            >
              <span className="font-display text-base mr-2">{"①②③④"[i]}</span>
              {choice}
            </button>
          );
        })}
      </div>
      {myAnswer !== undefined && (
        <div className="text-center text-sm opacity-70 mt-2">제출됨 — 마감 대기 중</div>
      )}
    </div>
  );
}

function GracePicker({
  state,
  onPick,
}: {
  state: GameState;
  onPick: (targetId: string) => void;
}) {
  const candidates = state.players.filter((p) => !p.arrived);
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <div className="font-display text-xl">은혜 — 한 명을 +1칸</div>
      <div className="text-sm opacity-60">전도의 순간입니다.</div>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {candidates.map((p) => {
          const a = getAnimal(p.animalId);
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onPick(p.id)}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-cream border-2 border-ink/10 active:scale-95"
            >
              <span className="text-4xl">{a?.emoji}</span>
              <span className="text-xs font-display mt-1">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function TeacherStub({
  state,
  send,
}: {
  state: GameState | null;
  send: (a: Action) => void;
}) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const phase = state?.phase ?? "lobby";
  const awaitingJudge = state?.activeCell?.awaitingJudge === true;
  const awaitingConfirm = state?.activeCell?.awaitingConfirm === true;
  const currentTurnPlayer = state?.players[state?.currentTurnIdx ?? 0];

  return (
    <div className="bg-ink text-cream rounded-2xl p-5 flex flex-col gap-3">
      <div className="font-display text-2xl">진행자 모드</div>
      <div className="text-sm opacity-70">
        페이즈: {phase} · 인원 {state?.players.length ?? 0}/{MAX_PLAYERS} ·{" "}
        {state?.countdown.active ? `D-${state.countdown.daysLeft}` : "비 전"}
      </div>

      {/* 판정 우선 노출 — 게임 중 가장 자주 쓰는 버튼 */}
      {awaitingJudge && (
        <div className="bg-cream text-ink rounded-2xl p-3 flex flex-col gap-2 mt-1">
          <div className="text-sm opacity-70 font-display">SHARE/MISSION 판정</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => send({ type: "judge", verdict: "success" })}
              className="bg-grace text-white font-display text-xl py-4 rounded-xl"
            >
              ✓ 성공
            </button>
            <button
              type="button"
              onClick={() => send({ type: "judge", verdict: "pass" })}
              className="bg-mission-edge text-white font-display text-xl py-4 rounded-xl"
            >
              ✗ 패스
            </button>
          </div>
        </div>
      )}
      {awaitingConfirm && (
        <button
          type="button"
          onClick={() => send({ type: "confirm" })}
          className="bg-event text-ink font-display text-xl py-4 rounded-xl"
        >
          [확인] 다음 턴으로
        </button>
      )}

      {phase === "lobby" && (
        <button
          type="button"
          onClick={() => send({ type: "phase", cmd: "start" })}
          disabled={(state?.players.length ?? 0) < 2}
          className="bg-ark-gold text-ink font-display text-xl py-4 rounded-2xl disabled:opacity-40"
        >
          게임 시작
        </button>
      )}

      {(phase === "playing" || phase === "rain") && (
        <>
          <div className="text-xs opacity-60 font-display mt-1">진행 제어</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => send({ type: "phase", cmd: "rain" })}
              disabled={state?.countdown.active}
              className="bg-rain text-ink py-3 rounded-xl disabled:opacity-40 font-display"
            >
              🌧 비 내리기
            </button>
            <button
              type="button"
              onClick={() => send({ type: "phase", cmd: "nextDay" })}
              disabled={!state?.countdown.active}
              className="bg-rain/70 text-ink py-3 rounded-xl disabled:opacity-40 font-display"
            >
              D-1
            </button>
          </div>
          {currentTurnPlayer && !state?.activeCell && !state?.quiz && (
            <button
              type="button"
              onClick={() =>
                send({ type: "skipInvite", playerId: currentTurnPlayer.id })
              }
              className="bg-cream/20 text-cream py-3 rounded-xl"
            >
              현재 턴 강제 스킵 ({currentTurnPlayer.name})
            </button>
          )}
        </>
      )}

      {phase !== "ended" && (
        confirmEnd ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                send({ type: "phase", cmd: "end" });
                setConfirmEnd(false);
              }}
              className="bg-mission text-ink py-3 rounded-xl font-display"
            >
              정말 종료
            </button>
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className="bg-cream/10 text-cream py-3 rounded-xl"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="bg-cream/10 text-cream py-3 rounded-xl text-sm"
          >
            게임 종료…
          </button>
        )
      )}
    </div>
  );
}
