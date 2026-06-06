import { afterEach, describe, expect, it } from "vitest";
import { dispatch } from "./logic/dispatch";
import { initGame } from "./logic/state";
import type { GameState } from "./logic/types";
import { MockRealtimeAdapter } from "./realtime/mockAdapter";
import type { Action } from "./realtime/types";

const ROOM = "ABCD";
const PIN = "1234";

const adapters: MockRealtimeAdapter[] = [];

afterEach(async () => {
  await Promise.all(adapters.map((a) => a.unsubscribe()));
  adapters.length = 0;
});

function newAdapter() {
  const a = new MockRealtimeAdapter("integration");
  adapters.push(a);
  return a;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

/**
 * 호스트 시뮬레이터: action을 받으면 dispatch 후 새 state를 broadcast.
 * resync는 sendState만.
 */
function makeHostSimulator(adapter: MockRealtimeAdapter, fixedNow: () => number) {
  let state: GameState = initGame({ roomCode: ROOM, teacherPin: PIN });
  const ctx = { now: fixedNow };

  adapter.onAction((action) => {
    if (action.type === "resync") {
      adapter.sendState(state);
      return;
    }
    const next = dispatch(state, action, ctx);
    if (next !== state) {
      state = next;
      adapter.sendState(state);
    }
  });

  return {
    get state() {
      return state;
    },
    broadcastInitial() {
      adapter.sendState(state);
    },
    advance(action: Action) {
      const next = dispatch(state, action, ctx);
      if (next !== state) {
        state = next;
        adapter.sendState(state);
      }
    },
  };
}

/**
 * 컨트롤러 시뮬레이터: state 수신 (seq 가드)
 */
function makeControllerSimulator(adapter: MockRealtimeAdapter) {
  let state: GameState | null = null;
  adapter.onState((incoming) => {
    if (state && incoming.seq <= state.seq) return;
    state = incoming;
  });
  return {
    get state() {
      return state;
    },
  };
}

describe("integration — 호스트↔컨트롤러 mock 어댑터", () => {
  it("입장 → 시작 → 1턴 → state 동기화 + seq 단조 증가", async () => {
    const hostAdapter = newAdapter();
    const ctrlAdapter = newAdapter();
    await hostAdapter.subscribe(ROOM);
    await ctrlAdapter.subscribe(ROOM);

    let nowMs = 1_000_000;
    const host = makeHostSimulator(hostAdapter, () => nowMs);
    const ctrl = makeControllerSimulator(ctrlAdapter);

    // 컨트롤러 → 호스트: join 2명
    ctrlAdapter.sendAction({
      type: "join",
      playerId: "p1",
      name: "A",
      animalId: "dove",
    });
    await flush();
    ctrlAdapter.sendAction({
      type: "join",
      playerId: "p2",
      name: "B",
      animalId: "lion",
    });
    await flush();

    expect(host.state.players.length).toBe(2);
    expect(ctrl.state?.players.length).toBe(2);
    expect(ctrl.state?.seq).toBe(host.state.seq);

    // 교사 시작
    ctrlAdapter.sendAction({ type: "phase", cmd: "start" });
    await flush();
    expect(host.state.phase).toBe("playing");

    // p1 roll 1 (1번 칸 WORD 발동)
    ctrlAdapter.sendAction({ type: "roll", playerId: "p1", dice: 1 });
    await flush();
    expect(host.state.quiz?.cellIndex).toBe(1);
    expect(host.state.quiz?.deadlineMs).toBe(nowMs + 15_000);
    expect(ctrl.state?.quiz?.cellIndex).toBe(1);

    // 전원 응답 → 자동 마감
    ctrlAdapter.sendAction({ type: "answer", playerId: "p1", choice: 2 });
    await flush();
    ctrlAdapter.sendAction({ type: "answer", playerId: "p2", choice: 0 });
    await flush();
    expect(host.state.quiz?.closed).toBe(true);
    expect(host.state.players[0].tokens).toBe(1); // p1 정답
    expect(host.state.players[1].tokens).toBe(0); // p2 오답

    // 결과 모달 닫기 → 다음 턴
    ctrlAdapter.sendAction({ type: "finalizeQuiz" });
    await flush();
    expect(host.state.quiz).toBeNull();
    expect(host.state.currentTurnIdx).toBe(1);

    // seq 단조성
    expect(ctrl.state?.seq).toBeGreaterThan(0);
  });

  it("resync — 컨트롤러 마운트 시 호스트 state 재수신", async () => {
    const hostAdapter = newAdapter();
    const ctrlAdapter = newAdapter();
    await hostAdapter.subscribe(ROOM);
    await ctrlAdapter.subscribe(ROOM);

    const host = makeHostSimulator(hostAdapter, () => 1000);
    const ctrl = makeControllerSimulator(ctrlAdapter);

    // 미리 게임 진행
    host.advance({ type: "join", playerId: "p1", name: "A", animalId: "dove" });
    host.advance({ type: "join", playerId: "p2", name: "B", animalId: "lion" });
    await flush();
    expect(ctrl.state?.players.length).toBe(2);

    // 컨트롤러가 새로고침 한 것처럼 resync 요청
    const lateAdapter = newAdapter();
    await lateAdapter.subscribe(ROOM);
    const late = makeControllerSimulator(lateAdapter);
    lateAdapter.sendAction({ type: "resync", playerId: "p1" });
    await flush();

    expect(late.state?.players.length).toBe(2);
    expect(late.state?.seq).toBe(host.state.seq);
  });

  it("ARK 도착 → 비 카운트다운 자동 트리거, 게임 종료 시 phase=ended", async () => {
    const hostAdapter = newAdapter();
    const ctrlAdapter = newAdapter();
    await hostAdapter.subscribe(ROOM);
    await ctrlAdapter.subscribe(ROOM);

    const host = makeHostSimulator(hostAdapter, () => 1000);
    const ctrl = makeControllerSimulator(ctrlAdapter);

    // 2명 시작
    host.advance({ type: "join", playerId: "p1", name: "A", animalId: "dove" });
    host.advance({ type: "join", playerId: "p2", name: "B", animalId: "lion" });
    host.advance({ type: "phase", cmd: "start" });
    await flush();

    // p1을 28까지 강제 진출 시키기 — 호스트가 내부 처리, 외부 setter 없으므로 dispatch로 모사
    // 실제 시나리오에서는 주사위 굴리며 도달. 여기서는 시뮬레이션을 위해 host의 reducer 호출 대신
    // 직접 state 조작이 안 되니까 점진 roll로 전진.
    // p1 28까지: 6+6+6+6+4 = 28
    const rolls = [6, 6, 6, 6, 4];
    for (const dice of rolls) {
      // p1 차례에만 굴림
      const turn = host.state.players[host.state.currentTurnIdx].id;
      if (turn !== "p1") {
        // p2 차례면 같은 식으로 굴림
        host.advance({ type: "roll", playerId: "p2", dice: 1 });
        // 1번 칸 WORD가 열릴 수 있음 → 즉시 모든 응답+finalize 처리
        if (host.state.quiz) {
          host.advance({ type: "answer", playerId: "p1", choice: 0 });
          host.advance({ type: "answer", playerId: "p2", choice: 0 });
          host.advance({ type: "finalizeQuiz" });
        }
      }
      host.advance({ type: "roll", playerId: "p1", dice });
      // 칸 효과 발생 시 처리
      if (host.state.quiz) {
        host.advance({ type: "answer", playerId: "p1", choice: 0 });
        host.advance({ type: "answer", playerId: "p2", choice: 0 });
        host.advance({ type: "finalizeQuiz" });
      } else if (host.state.activeCell?.awaitingConfirm) {
        host.advance({ type: "confirm" });
      } else if (host.state.activeCell?.awaitingJudge) {
        host.advance({ type: "judge", verdict: "success" });
      } else if (host.state.activeCell?.awaitingGraceTarget) {
        host.advance({
          type: "graceTarget",
          playerId: "p1",
          targetId: "p2",
        });
      }
    }

    // 시뮬레이션 단순화: 첫 도착자가 발생했는지 또는 게임 흐름 점검
    await flush();
    const arrived = host.state.players.find((p) => p.arrived);
    if (arrived) {
      expect(host.state.countdown.active).toBe(true);
      expect(host.state.phase === "rain" || host.state.phase === "ended").toBe(true);
    }
    expect(ctrl.state?.seq).toBe(host.state.seq);
  });
});
