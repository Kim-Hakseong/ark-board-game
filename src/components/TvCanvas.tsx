import { useEffect, useRef } from "react";

// 1920×1080 고정 캔버스를 뷰포트에 맞춰 균일 스케일.
// 호스트(TV) 화면 공통 셸.
export function TvCanvas({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      if (!canvasRef.current) return;
      const s = Math.min(
        window.innerWidth / 1920,
        window.innerHeight / 1080,
      );
      canvasRef.current.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="tv-stage">
      <div ref={canvasRef} className="tv-canvas">
        {children}
      </div>
    </div>
  );
}
