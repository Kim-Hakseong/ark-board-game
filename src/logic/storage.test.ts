import { beforeEach, describe, expect, it } from "vitest";
import {
  clearControllerProfile,
  clearHostState,
  loadControllerProfile,
  loadHostState,
  saveControllerProfile,
  saveHostState,
} from "./storage";
import { initGame } from "./state";

beforeEach(() => {
  localStorage.clear();
});

describe("storage — 호스트 state 복구", () => {
  it("저장 후 로드", () => {
    const s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    saveHostState(s);
    const loaded = loadHostState("ABCD");
    expect(loaded?.roomCode).toBe("ABCD");
    expect(loaded?.phase).toBe("lobby");
  });

  it("다른 룸 코드로 로드 시 null", () => {
    const s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    saveHostState(s);
    expect(loadHostState("ZZZZ")).toBeNull();
  });

  it("clear 후 로드 시 null", () => {
    const s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    saveHostState(s);
    clearHostState("ABCD");
    expect(loadHostState("ABCD")).toBeNull();
  });

  it("저장된 게 없으면 null", () => {
    expect(loadHostState("NONE")).toBeNull();
  });

  it("손상된 JSON은 null로 폴백", () => {
    localStorage.setItem("ark:host:BAD", "not-json{");
    expect(loadHostState("BAD")).toBeNull();
  });
});

describe("storage — 컨트롤러 프로필 복구", () => {
  it("저장 후 로드", () => {
    saveControllerProfile({
      roomCode: "ABCD",
      playerId: "p1",
      playerToken: "tok",
      name: "철수",
      animalId: "dove",
    });
    const p = loadControllerProfile();
    expect(p?.playerId).toBe("p1");
    expect(p?.name).toBe("철수");
  });

  it("clear 동작", () => {
    saveControllerProfile({
      roomCode: "ABCD",
      playerId: "p1",
      playerToken: "tok",
      name: "A",
      animalId: "dove",
    });
    clearControllerProfile();
    expect(loadControllerProfile()).toBeNull();
  });
});
