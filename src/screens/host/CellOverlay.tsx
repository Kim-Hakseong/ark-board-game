import { getAnimal } from "../../data/animals";
import { getCell } from "../../data/cells";
import type { GameState } from "../../logic/types";

interface CellOverlayProps {
  state: GameState;
}

// SHARE / MISSION 진행 카드 + EVENT 효과 표시. 교사가 모바일에서 [성공/패스/확인]을 누름.
export function CellOverlay({ state }: CellOverlayProps) {
  const active = state.activeCell;
  if (!active) return null;
  const cell = getCell(active.index);
  if (!cell) return null;
  const player = state.players.find((p) => p.id === active.triggeredByPlayerId);
  const animal = player ? getAnimal(player.animalId) : null;

  return (
    <div className="fixed inset-0 z-30 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-12">
      <div className="bg-cream rounded-3xl w-full max-w-3xl p-10 shadow-2xl border-4 border-ink/10">
        {cell.kind === "SHARE" && (
          <ShareCard prompt={cell.prompt} actor={`${animal?.emoji} ${player?.name}`} />
        )}
        {cell.kind === "MISSION" && (
          <MissionCard prompt={cell.prompt} actor={`${animal?.emoji} ${player?.name}`} />
        )}
        {cell.kind === "EVENT" && (
          <EventCard
            name={cell.name}
            line={cell.line}
            actor={`${animal?.emoji} ${player?.name}`}
            awaitingGrace={active.awaitingGraceTarget}
          />
        )}
        <div className="text-center text-base opacity-60 mt-8 font-display">
          {active.awaitingJudge && "교사의 [성공]/[패스] 판정을 기다립니다"}
          {active.awaitingConfirm && "교사의 [확인]을 기다립니다"}
          {active.awaitingGraceTarget && "멈춘 친구가 대상을 고르는 중…"}
        </div>
      </div>
    </div>
  );
}

function ShareCard({ prompt, actor }: { prompt: string; actor: string }) {
  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div className="text-xl font-display text-share-edge">💬 나눔</div>
      <div className="text-base opacity-70 font-display">{actor}</div>
      <h2 className="font-display text-4xl leading-snug">{prompt}</h2>
    </div>
  );
}

function MissionCard({ prompt, actor }: { prompt: string; actor: string }) {
  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div className="text-xl font-display text-mission-edge">⭐ 미션</div>
      <div className="text-base opacity-70 font-display">{actor}</div>
      <h2 className="font-display text-4xl leading-snug">{prompt}</h2>
    </div>
  );
}

function EventCard({
  name,
  line,
  actor,
  awaitingGrace,
}: {
  name: string;
  line: string;
  actor: string;
  awaitingGrace: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div className="text-xl font-display text-event-edge">⚡ 이벤트</div>
      <div className="text-base opacity-70 font-display">{actor}</div>
      <h2 className="font-display text-5xl leading-snug">{name}</h2>
      <p className="text-2xl leading-snug opacity-90 max-w-2xl">{line}</p>
      {awaitingGrace && (
        <div className="text-base font-display mt-2 bg-grace/30 px-4 py-2 rounded-xl">
          🤝 멈춘 친구가 한 명을 +1칸 보내줍니다.
        </div>
      )}
    </div>
  );
}
