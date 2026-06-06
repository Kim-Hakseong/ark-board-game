import { describe, it, expect } from "vitest";
import { CELLS, TRACK_LENGTH, getCell, type CellKind } from "./cells";

describe("data/cells — 무결성", () => {
  it("정확히 30칸", () => {
    expect(CELLS.length).toBe(TRACK_LENGTH);
  });

  it("인덱스 1~30 중복 없이 모두 포함", () => {
    const indices = CELLS.map((c) => c.index).sort((a, b) => a - b);
    expect(indices).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("종류 분포 — WORD 10 / SHARE 8 / MISSION 7 / EVENT 5 (PRD §6)", () => {
    const counts: Record<CellKind, number> = {
      WORD: 0,
      SHARE: 0,
      MISSION: 0,
      EVENT: 0,
    };
    for (const c of CELLS) counts[c.kind] += 1;
    expect(counts).toEqual({ WORD: 10, SHARE: 8, MISSION: 7, EVENT: 5 });
  });

  it("WORD 칸 위치 — PRD 표 그대로", () => {
    const wordIndices = CELLS.filter((c) => c.kind === "WORD").map((c) => c.index);
    expect(wordIndices).toEqual([1, 4, 6, 9, 13, 16, 18, 21, 24, 28]);
  });

  it("SHARE 칸 위치 — PRD 표 그대로", () => {
    const shareIndices = CELLS.filter((c) => c.kind === "SHARE").map((c) => c.index);
    expect(shareIndices).toEqual([3, 8, 11, 15, 19, 23, 27, 30]);
  });

  it("MISSION 칸 위치 — PRD 표 그대로", () => {
    const missionIndices = CELLS.filter((c) => c.kind === "MISSION").map((c) => c.index);
    expect(missionIndices).toEqual([2, 7, 12, 17, 22, 26, 29]);
  });

  it("EVENT 칸 위치 — PRD 표 그대로", () => {
    const eventIndices = CELLS.filter((c) => c.kind === "EVENT").map((c) => c.index);
    expect(eventIndices).toEqual([5, 10, 14, 20, 25]);
  });

  it("WORD 10문제 모두 4지선다 + 정답 인덱스 유효", () => {
    const wordCells = CELLS.filter((c) => c.kind === "WORD");
    for (const c of wordCells) {
      if (c.kind !== "WORD") continue;
      expect(c.choices.length).toBe(4);
      expect(c.correctIndex).toBeGreaterThanOrEqual(0);
      expect(c.correctIndex).toBeLessThanOrEqual(3);
      expect(c.question.length).toBeGreaterThan(0);
      expect(c.explanation.length).toBeGreaterThan(0);
      for (const choice of c.choices) {
        expect(choice.length).toBeGreaterThan(0);
      }
    }
  });

  it("SHARE/MISSION 칸 — prompt 비어있지 않음", () => {
    for (const c of CELLS) {
      if (c.kind === "SHARE" || c.kind === "MISSION") {
        expect(c.prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it("EVENT 5종 — 효과 (밸런스 조정 반영)", () => {
    const event5 = CELLS.find((c) => c.index === 5);
    const event10 = CELLS.find((c) => c.index === 10);
    const event14 = CELLS.find((c) => c.index === 14);
    const event20 = CELLS.find((c) => c.index === 20);
    const event25 = CELLS.find((c) => c.index === 25);

    // 밸런스 조정: 5번 -2→-3, 14번 skip→backToStart, 25번 +1→+2
    expect(event5?.kind === "EVENT" && event5.effect).toEqual({ type: "moveBack", steps: 3 });
    expect(event10?.kind === "EVENT" && event10.effect).toEqual({ type: "tokenDelta", delta: 1 });
    expect(event14?.kind === "EVENT" && event14.effect).toEqual({ type: "backToStart" });
    expect(event20?.kind === "EVENT" && event20.effect).toEqual({ type: "moveForward", steps: 3 });
    expect(event25?.kind === "EVENT" && event25.effect).toEqual({ type: "advanceOther", steps: 2 });
  });

  it("PRD §6 핵심 문구 — 글자 단위 보존 (샘플 점검)", () => {
    const c1 = getCell(1);
    expect(c1?.kind === "WORD" && c1.explanation).toBe("창 6:3 — 그들의 날은 일백 이십년이 되리라");

    const c16 = getCell(16);
    expect(c16?.kind === "WORD" && c16.question).toBe(
      "벧후 3:9 — 아무도 멸망치 않고 다 (___)하기에 이르기를 원하시느니라",
    );

    const c13 = getCell(13);
    expect(c13?.kind === "WORD" && c13.explanation).toBe("창 7:16 — 여호와께서 그를 닫아 넣으시니라");

    const c25 = getCell(25);
    expect(c25?.kind === "EVENT" && c25.line).toBe(
      "유일하게 '남을 앞으로 보내는' 칸 — 이것이 전도입니다.",
    );
  });
});
