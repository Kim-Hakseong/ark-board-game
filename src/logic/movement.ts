import { ARK_INDEX, START_INDEX } from "../data/cells";

export interface MoveResult {
  newPos: number;
  arrived: boolean; // ARK(31) 정확 도착
  bounced: boolean; // ARK에서 반사
  triggerContent: boolean; // 도착칸 콘텐츠 발동 여부 (PRD §4.1: 반사칸/이벤트이동/도착 = false)
}

// 주사위 굴림 결과 이동. PRD §4.1.5 — ARK 정확 도달 시 입장, 초과 시 반사(콘텐츠 미발동).
export function applyDiceMove(currentPos: number, dice: number): MoveResult {
  const target = currentPos + dice;
  if (target === ARK_INDEX) {
    return { newPos: ARK_INDEX, arrived: true, bounced: false, triggerContent: false };
  }
  if (target < ARK_INDEX) {
    return { newPos: target, arrived: false, bounced: false, triggerContent: true };
  }
  // 초과 → 반사: over = target - 31, newPos = 31 - over
  const over = target - ARK_INDEX;
  return {
    newPos: ARK_INDEX - over,
    arrived: false,
    bounced: true,
    triggerContent: false,
  };
}

// EVENT 등 효과로 인한 전진. 콘텐츠 미발동(연쇄 방지). ARK 도착/반사 규칙은 동일 적용.
export function applyForwardEffect(currentPos: number, steps: number): MoveResult {
  const target = currentPos + steps;
  if (target === ARK_INDEX) {
    return { newPos: ARK_INDEX, arrived: true, bounced: false, triggerContent: false };
  }
  if (target < ARK_INDEX) {
    return { newPos: target, arrived: false, bounced: false, triggerContent: false };
  }
  const over = target - ARK_INDEX;
  return { newPos: ARK_INDEX - over, arrived: false, bounced: true, triggerContent: false };
}

// 후진. START(0) 아래로는 가지 않음.
export function applyBackwardEffect(currentPos: number, steps: number): MoveResult {
  const newPos = Math.max(START_INDEX, currentPos - steps);
  return { newPos, arrived: false, bounced: false, triggerContent: false };
}

// 1~6 균등. 테스트 시 rng 주입 가능.
export function rollDice(rng: () => number = Math.random): number {
  return Math.floor(rng() * 6) + 1;
}
