// 동물 캐릭터. v1은 이모지, SVG 교체 가능 구조 유지.
// 노아의 방주에 있었다고 추측되는 + 귀여운 동물 16종 (PRD §3 8종 + 확장 8종).

export interface Animal {
  id: string;
  name: string;
  emoji: string;
}

export const ANIMALS: readonly Animal[] = [
  // PRD §3 원본 8종
  { id: "dove", name: "비둘기", emoji: "🕊️" },
  { id: "lion", name: "사자", emoji: "🦁" },
  { id: "elephant", name: "코끼리", emoji: "🐘" },
  { id: "giraffe", name: "기린", emoji: "🦒" },
  { id: "turtle", name: "거북이", emoji: "🐢" },
  { id: "rabbit", name: "토끼", emoji: "🐰" },
  { id: "fox", name: "여우", emoji: "🦊" },
  { id: "sheep", name: "양", emoji: "🐑" },
  // 확장 8종
  { id: "bear", name: "곰", emoji: "🐻" },
  { id: "tiger", name: "호랑이", emoji: "🐯" },
  { id: "deer", name: "사슴", emoji: "🦌" },
  { id: "hedgehog", name: "고슴도치", emoji: "🦔" },
  { id: "cow", name: "소", emoji: "🐮" },
  { id: "pig", name: "돼지", emoji: "🐷" },
  { id: "chicken", name: "닭", emoji: "🐔" },
  { id: "horse", name: "말", emoji: "🐴" },
];

export function getAnimal(id: string): Animal | undefined {
  return ANIMALS.find((a) => a.id === id);
}
