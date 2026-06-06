// Web Audio API 기반 합성 효과음. 외부 파일 없음.
// 호스트(TV) 화면에서만 사용 권장. 학생 폰은 Vibration API 유지.
// 첫 user gesture 후에만 AudioContext 활성화 (Safari 정책).

type EnvelopeOpts = {
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  peak?: number;
};

const STORAGE_KEY = "ark:sound:muted";

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveMuted(m: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = loadMuted();
  private masterVolume = 0.45;

  ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.masterVolume;
      this.master.connect(this.ctx.destination);
    } catch {
      return null;
    }
    return this.ctx;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    saveMuted(m);
    if (this.master) this.master.gain.value = m ? 0 : this.masterVolume;
  }

  toggle(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // 사용자 제스처 핸들러에서 호출. Safari 정책 우회.
  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  }

  private envelope(node: GainNode, opts: EnvelopeOpts = {}): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const { attack = 0.005, decay = 0.05, sustain = 0.7, release = 0.1, peak = 1 } = opts;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + attack);
    node.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustain), t + attack + decay);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay + release);
  }

  private tone(opts: {
    type?: OscillatorType;
    freq: number;
    duration: number;
    env?: EnvelopeOpts;
    detune?: number;
    pitchTo?: number; // 글리산도 종료 주파수
  }): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(opts.freq, ctx.currentTime);
    if (opts.pitchTo) {
      osc.frequency.exponentialRampToValueAtTime(opts.pitchTo, ctx.currentTime + opts.duration);
    }
    if (opts.detune) osc.detune.value = opts.detune;
    const gain = ctx.createGain();
    osc.connect(gain).connect(this.master);
    this.envelope(gain, opts.env);
    osc.start();
    osc.stop(ctx.currentTime + opts.duration + 0.05);
  }

  private noiseBurst(duration: number, env: EnvelopeOpts = {}, filterFreq = 1000): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    src.connect(filter).connect(gain).connect(this.master);
    this.envelope(gain, env);
    src.start();
    src.stop(ctx.currentTime + duration + 0.05);
  }

  // ─────────────── ★★★ 효과음 ───────────────

  // 데굴데굴 — 화이트노이즈 wobble
  diceTumble(): void {
    this.noiseBurst(0.5, { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.3, peak: 0.5 }, 600);
  }

  // 주사위 결과 reveal — 짧은 톡
  dicePop(): void {
    this.tone({
      type: "sine",
      freq: 320,
      pitchTo: 220,
      duration: 0.15,
      env: { attack: 0.002, decay: 0.04, sustain: 0.5, release: 0.08, peak: 0.7 },
    });
  }

  // 퀴즈 열림 — 두 음 상승 종
  quizOpen(): void {
    this.tone({ type: "triangle", freq: 523.25, duration: 0.18, env: { peak: 0.4 } });
    setTimeout(() => {
      this.tone({ type: "triangle", freq: 783.99, duration: 0.25, env: { peak: 0.5 } });
    }, 130);
  }

  // 정답 — 메이저 아르페지오 C-E-G
  correct(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.tone({
          type: "triangle",
          freq: f,
          duration: 0.22,
          env: { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.15, peak: 0.55 },
        });
      }, i * 80);
    });
  }

  // 오답 — 단2도 하강
  wrong(): void {
    this.tone({
      type: "sine",
      freq: 392,
      duration: 0.18,
      env: { peak: 0.45 },
    });
    setTimeout(() => {
      this.tone({
        type: "sine",
        freq: 311.13,
        duration: 0.25,
        env: { attack: 0.005, decay: 0.05, sustain: 0.5, release: 0.2, peak: 0.45 },
      });
    }, 140);
  }

  // 5초 이하 카운트다운 tick
  tick(): void {
    this.tone({
      type: "square",
      freq: 1200,
      duration: 0.04,
      env: { attack: 0.001, decay: 0.01, sustain: 0.2, release: 0.02, peak: 0.25 },
    });
  }

  // 학생 입장 (로비)
  joinBleep(): void {
    this.tone({ type: "sine", freq: 660, duration: 0.1, env: { peak: 0.4 } });
    setTimeout(() => {
      this.tone({ type: "sine", freq: 990, duration: 0.15, env: { peak: 0.45 } });
    }, 80);
  }

  // 게임 시작 — 짧은 팡파레
  gameStart(): void {
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.tone({
          type: "sawtooth",
          freq: f,
          duration: 0.18,
          env: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.1, peak: 0.35 },
        });
      }, i * 100);
    });
  }
}

// 싱글톤
export const sound = new SoundEngine();
