import { useEffect, useRef } from "react";

interface UseShakeOptions {
  enabled: boolean;
  threshold?: number; // 가속도 변화 임계값 (m/s^2)
  cooldownMs?: number;
  onShake: () => void;
}

// 흔들기 감지. iOS는 motion 권한이 별도 요청 필요(requestMotionPermission 참고).
export function useShakeDetection({
  enabled,
  threshold = 22,
  cooldownMs = 800,
  onShake,
}: UseShakeOptions) {
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") return;

    let last: { x: number; y: number; z: number } | null = null;
    let lastFireAt = 0;

    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const cur = { x: a.x, y: a.y, z: a.z };
      if (last) {
        const dx = cur.x - last.x;
        const dy = cur.y - last.y;
        const dz = cur.z - last.z;
        const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const now = Date.now();
        if (delta > threshold && now - lastFireAt > cooldownMs) {
          lastFireAt = now;
          onShakeRef.current();
        }
      }
      last = cur;
    };
    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [enabled, threshold, cooldownMs]);
}

type Perm = "granted" | "denied" | "default";

// iOS 13+ Safari는 DeviceMotionEvent.requestPermission() 호출 필요(유저 제스처 안에서).
export async function requestMotionPermission(): Promise<Perm> {
  if (typeof DeviceMotionEvent === "undefined") return "denied";
  const Ev = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<Perm>;
  };
  if (typeof Ev.requestPermission === "function") {
    try {
      return await Ev.requestPermission();
    } catch {
      return "denied";
    }
  }
  return "granted";
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined") return;
  navigator.vibrate?.(pattern);
}
