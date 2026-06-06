import { afterEach, describe, expect, it } from "vitest";
import { initGame } from "../logic/state";
import { MockRealtimeAdapter } from "./mockAdapter";
import type { Action } from "./types";

const ROOM = "ABCD";

const adapters: MockRealtimeAdapter[] = [];

afterEach(async () => {
  await Promise.all(adapters.map((a) => a.unsubscribe()));
  adapters.length = 0;
});

function newAdapter() {
  const a = new MockRealtimeAdapter("test");
  adapters.push(a);
  return a;
}

// jsdom 환경에서 BroadcastChannel은 같은 window 내에서만 동작.
// MessagePort 비동기라 microtask로 전달됨 → await로 처리.
function flush() {
  return new Promise((r) => setTimeout(r, 0));
}

describe("MockRealtimeAdapter", () => {
  it("kind=mock, mockReason 설정", () => {
    const a = newAdapter();
    expect(a.kind).toBe("mock");
    expect(a.mockReason).toBe("test");
  });

  it("동일 채널 두 어댑터 — action broadcast (송신자 제외)", async () => {
    const host = newAdapter();
    const controller = newAdapter();
    await host.subscribe(ROOM);
    await controller.subscribe(ROOM);

    const received: Action[] = [];
    host.onAction((a) => received.push(a));

    const action: Action = { type: "roll", playerId: "p1", dice: 4 };
    controller.sendAction(action);
    await flush();

    expect(received).toEqual([action]);
  });

  it("state broadcast — 컨트롤러 수신", async () => {
    const host = newAdapter();
    const controller = newAdapter();
    await host.subscribe(ROOM);
    await controller.subscribe(ROOM);

    const received: number[] = [];
    controller.onState((s) => received.push(s.seq));

    const state = initGame({ roomCode: ROOM, teacherPin: "1234" });
    host.sendState({ ...state, seq: 42 });
    await flush();

    expect(received).toEqual([42]);
  });

  it("unsubscribe 후 메시지 미수신", async () => {
    const host = newAdapter();
    const controller = newAdapter();
    await host.subscribe(ROOM);
    await controller.subscribe(ROOM);

    const received: Action[] = [];
    host.onAction((a) => received.push(a));

    await controller.unsubscribe();
    controller.sendAction({ type: "roll", playerId: "p1", dice: 1 });
    await flush();
    expect(received).toEqual([]);
  });

  it("다른 룸 코드는 격리", async () => {
    const a = newAdapter();
    const b = newAdapter();
    await a.subscribe("ROOMA");
    await b.subscribe("ROOMB");

    const got: Action[] = [];
    a.onAction((x) => got.push(x));
    b.sendAction({ type: "roll", playerId: "p1", dice: 1 });
    await flush();
    expect(got).toEqual([]);
  });

  it("핸들러 unregister 함수 동작", async () => {
    const host = newAdapter();
    const controller = newAdapter();
    await host.subscribe(ROOM);
    await controller.subscribe(ROOM);

    const got: Action[] = [];
    const unreg = host.onAction((a) => got.push(a));
    controller.sendAction({ type: "roll", playerId: "p1", dice: 1 });
    await flush();
    expect(got.length).toBe(1);

    unreg();
    controller.sendAction({ type: "roll", playerId: "p2", dice: 2 });
    await flush();
    expect(got.length).toBe(1);
  });
});
