// Node 25는 실험적 localStorage를 노출하지만 setItem/clear가 미구현인 stub.
// jsdom의 localStorage를 신뢰하지 않고 자체 메모리 구현을 강제 주입.

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

function install(name: "localStorage" | "sessionStorage") {
  const storage = new MemoryStorage();
  try {
    Object.defineProperty(globalThis, name, {
      value: storage,
      writable: true,
      configurable: true,
    });
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    try {
      Object.defineProperty(window, name, {
        value: storage,
        writable: true,
        configurable: true,
      });
    } catch {
      /* ignore */
    }
  }
}

install("localStorage");
install("sessionStorage");
