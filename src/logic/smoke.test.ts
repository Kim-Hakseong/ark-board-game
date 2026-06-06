import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("환경이 살아있다", () => {
    expect(1 + 1).toBe(2);
  });
});
