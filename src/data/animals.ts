// PRD §3 — 동물 캐릭터 8종. v1은 이모지, SVG 교체 가능 구조 유지.

export interface Animal {
  id: string;
  name: string;
  emoji: string;
}

export const ANIMALS: readonly Animal[] = [
  { id: "dove", name: "비둘기", emoji: "🕊️" },
  { id: "lion", name: "사자", emoji: "🦁" },
  { id: "elephant", name: "코끼리", emoji: "🐘" },
  { id: "giraffe", name: "기린", emoji: "🦒" },
  { id: "turtle", name: "거북이", emoji: "🐢" },
  { id: "rabbit", name: "토끼", emoji: "🐰" },
  { id: "fox", name: "여우", emoji: "🦊" },
  { id: "sheep", name: "양", emoji: "🐑" },
];

export function getAnimal(id: string): Animal | undefined {
  return ANIMALS.find((a) => a.id === id);
}
