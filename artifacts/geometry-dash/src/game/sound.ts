class SoundManager {
  private music: HTMLAudioElement | null = null;
  private sfxPool: Map<string, HTMLAudioElement[]> = new Map();
  private sfxMultiplier: Map<string, number> = new Map();
  private _musicVolume: number;
  private _sfxVolume: number;
  private _muted = false;
  private currentSrc = "";
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this._musicVolume = parseFloat(localStorage.getItem("hb_musicVol") ?? "0.24");
    this._sfxVolume = parseFloat(localStorage.getItem("hb_sfxVol") ?? "0.65");
  }

  get musicVol(): number { return this._musicVolume; }
  get sfxVol(): number { return this._sfxVolume; }

  setMusicVol(v: number): void {
    this._musicVolume = Math.max(0, Math.min(1, v));
    try { localStorage.setItem("hb_musicVol", String(this._musicVolume)); } catch { }
    if (this.music && !this._muted) this.music.volume = this._musicVolume;
  }

  setSfxVol(v: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    try { localStorage.setItem("hb_sfxVol", String(this._sfxVolume)); } catch { }
    this.sfxPool.forEach((pool, name) => {
      const mult = this.sfxMultiplier.get(name) ?? 1;
      pool.forEach(a => { if (!this._muted) a.volume = Math.min(1, this._sfxVolume * mult); });
    });
  }

  loadMusic(src: string): void {
    if (src === this.currentSrc) return;
    this._clearFade();
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
    this.currentSrc = src;
    const a = new Audio(src);
    a.loop = true;
    a.volume = this._muted ? 0 : this._musicVolume;
    a.preload = "auto";
    this.music = a;
  }

  playMusic(): void {
    if (this.music) {
      this.music.volume = this._muted ? 0 : this._musicVolume;
      this.music.play().catch(() => { });
    }
  }

  pauseMusic(): void {
    this._clearFade();
    this.music?.pause();
  }

  resumeMusic(): void {
    this.music?.play().catch(() => { });
  }

  /** Reset volume, seek to start, and play */
  restartMusic(): void {
    if (!this.music) return;
    this._clearFade();
    this.music.currentTime = 0;
    this.music.volume = this._muted ? 0 : this._musicVolume;
    this.music.play().catch(() => { });
  }

  /** Gradually reduce music volume to 0 then pause */
  fadeMusic(durationMs = 1400): void {
    if (!this.music) return;
    this._clearFade();
    const audio = this.music;
    const startVol = audio.volume;
    const steps = 30;
    const interval = durationMs / steps;
    let step = 0;
    this.fadeTimer = setInterval(() => {
      step++;
      const ratio = 1 - step / steps;
      audio.volume = Math.max(0, startVol * ratio);
      if (step >= steps) {
        this._clearFade();
        audio.pause();
      }
    }, interval);
  }

  private _clearFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  stopMusic(): void {
    this._clearFade();
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
    this.currentSrc = "";
    this.music = null;
  }

  /** Pool-based SFX — poolSize defaults to 4; multiplier scales volume relative to global sfxVol */
  loadSfx(name: string, src: string, poolSize = 4, multiplier = 1): void {
    this.sfxMultiplier.set(name, multiplier);
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < poolSize; i++) {
      const a = new Audio(src);
      a.volume = this._muted ? 0 : Math.min(1, this._sfxVolume * multiplier);
      a.preload = "auto";
      pool.push(a);
    }
    this.sfxPool.set(name, pool);
  }

  /** Like loadMusic but returns a Promise that resolves when the audio is ready to play (with timeout fallback) */
  loadMusicAsync(src: string): Promise<void> {
    this.loadMusic(src);
    return new Promise<void>((resolve) => {
      const a = this.music;
      if (!a) { resolve(); return; }
      if (a.readyState >= 3) { resolve(); return; }
      const timer = setTimeout(resolve, 6000);
      const onReady = () => {
        clearTimeout(timer);
        a.removeEventListener("canplaythrough", onReady);
        resolve();
      };
      a.addEventListener("canplaythrough", onReady);
    });
  }

  /** Like loadSfx but returns a Promise that resolves when the first pool element is ready (with timeout fallback) */
  loadSfxAsync(name: string, src: string, poolSize = 4, multiplier = 1): Promise<void> {
    this.loadSfx(name, src, poolSize, multiplier);
    const pool = this.sfxPool.get(name);
    if (!pool || pool.length === 0) return Promise.resolve();
    const first = pool[0];
    return new Promise<void>((resolve) => {
      if (first.readyState >= 3) { resolve(); return; }
      const timer = setTimeout(resolve, 4000);
      const onReady = () => {
        clearTimeout(timer);
        first.removeEventListener("canplaythrough", onReady);
        resolve();
      };
      first.addEventListener("canplaythrough", onReady);
    });
  }

  playSfx(name: string): void {
    if (this._muted) return;
    const pool = this.sfxPool.get(name);
    if (!pool || pool.length === 0) return;
    const mult = this.sfxMultiplier.get(name) ?? 1;
    const audio = pool.find(a => a.paused || a.ended) ?? pool[0];
    audio.currentTime = 0;
    audio.volume = Math.min(1, this._sfxVolume * mult);
    audio.play().catch(() => { });
  }

  /** Synthesised meteor impact boom — deep thud + rumble */
  playSynthMeteorBoom(): void {
    if (this._muted) return;
    try {
      const ctx = new (window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>)["webkitAudioContext"])();
      const vol = Math.min(1, this._sfxVolume * 1.4);
      const sr = ctx.sampleRate;

      const addSource = (buf: AudioBuffer, gainVal: number, delay = 0) => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.value = gainVal;
        src.connect(g);
        g.connect(ctx.destination);
        src.start(ctx.currentTime + delay);
      };

      // Deep sub-bass thud (40 Hz sine, sharp decay)
      const thudLen = Math.floor(sr * 0.35);
      const thudBuf = ctx.createBuffer(1, thudLen, sr);
      const td = thudBuf.getChannelData(0);
      for (let i = 0; i < thudLen; i++) {
        const t = i / sr;
        td[i] = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 14);
      }
      addSource(thudBuf, vol);

      // Mid-range impact crack (120 Hz, very fast)
      const crackLen = Math.floor(sr * 0.12);
      const crackBuf = ctx.createBuffer(1, crackLen, sr);
      const cr = crackBuf.getChannelData(0);
      for (let i = 0; i < crackLen; i++) {
        const t = i / sr;
        cr[i] = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 40);
      }
      addSource(crackBuf, vol * 0.6, 0.01);

      // Ground rumble (filtered noise, slow decay)
      const rumbleLen = Math.floor(sr * 0.9);
      const rumbleBuf = ctx.createBuffer(1, rumbleLen, sr);
      const rd = rumbleBuf.getChannelData(0);
      for (let i = 0; i < rumbleLen; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 5) * (1 - Math.exp(-t * 30));
        rd[i] = (Math.random() * 2 - 1) * env;
      }
      const rumbleSrc = ctx.createBufferSource();
      rumbleSrc.buffer = rumbleBuf;
      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.value = 180;
      const rg = ctx.createGain();
      rg.gain.value = vol * 0.75;
      rumbleSrc.connect(lpf);
      lpf.connect(rg);
      rg.connect(ctx.destination);
      rumbleSrc.start(ctx.currentTime + 0.03);

      setTimeout(() => ctx.close().catch(() => { }), 1500);
    } catch { }
  }

  /** Synthesised rock-crumble death sound — no audio file needed */
  playSynthDeath(): void {
    if (this._muted) return;
    try {
      const ctx = new (window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>)["webkitAudioContext"])();
      const vol = Math.min(1, this._sfxVolume * 1.6);
      const sr = ctx.sampleRate;

      const addSource = (buf: AudioBuffer, gainVal: number, delay = 0) => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.value = gainVal;
        src.connect(g);
        g.connect(ctx.destination);
        src.start(ctx.currentTime + delay);
      };

      // Low stone-thud
      const thudLen = Math.floor(sr * 0.18);
      const thudBuf = ctx.createBuffer(1, thudLen, sr);
      const td = thudBuf.getChannelData(0);
      for (let i = 0; i < thudLen; i++) {
        const t = i / sr;
        td[i] = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 22);
      }
      addSource(thudBuf, vol * 0.9);

      // Rock-crumble noise burst
      const crumbleLen = Math.floor(sr * 0.55);
      const crumbleBuf = ctx.createBuffer(1, crumbleLen, sr);
      const cd = crumbleBuf.getChannelData(0);
      for (let i = 0; i < crumbleLen; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 8) * (1 - Math.exp(-t * 60));
        cd[i] = (Math.random() * 2 - 1) * env;
      }
      const src2 = ctx.createBufferSource();
      src2.buffer = crumbleBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 280;
      filter.Q.value = 0.7;
      const g2 = ctx.createGain();
      g2.gain.value = vol * 0.85;
      src2.connect(filter);
      filter.connect(g2);
      g2.connect(ctx.destination);
      src2.start(ctx.currentTime + 0.02);

      // Debris scatter ticks
      for (let k = 0; k < 4; k++) {
        const tickLen = Math.floor(sr * 0.06);
        const tickBuf = ctx.createBuffer(1, tickLen, sr);
        const tickD = tickBuf.getChannelData(0);
        for (let i = 0; i < tickLen; i++) {
          const t = i / sr;
          tickD[i] = (Math.random() * 2 - 1) * Math.exp(-t * 80);
        }
        addSource(tickBuf, vol * 0.4, 0.1 + k * 0.08);
      }

      setTimeout(() => ctx.close().catch(() => { }), 1200);
    } catch { }
  }

  get muted(): boolean { return this._muted; }

  setMuted(val: boolean): void {
    this._muted = val;
    if (this.music) this.music.volume = val ? 0 : this._musicVolume;
    this.sfxPool.forEach((pool, name) => {
      const mult = this.sfxMultiplier.get(name) ?? 1;
      pool.forEach(a => { a.volume = val ? 0 : Math.min(1, this._sfxVolume * mult); });
    });
  }

  // ── Jazz loop (endless mode) ─────────────────────────────────────────────────
  private jazzCtx: AudioContext | null = null;
  private jazzMasterGain: GainNode | null = null;
  private jazzBeat = 0;
  private jazzNextBeatTime = 0;
  private jazzSchedulerId = 0;

  private static readonly JAZZ_BPM = 90;
  private static readonly JAZZ_CHORD_FREQS: number[][] = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7: C3 E3 G3 B3
    [110.00, 130.81, 164.81, 207.65], // Am7:  A2 C3 E3 G#3
    [87.31,  110.00, 130.81, 164.81], // Fmaj7: F2 A2 C3 E3
    [98.00,  123.47, 146.83, 185.00], // G7: G2 B2 D3 F#3
  ];
  private static readonly JAZZ_BASS: number[] = [65.41, 55.00, 43.65, 49.00];

  playJazzLoop(): void {
    this.stopJazzLoop();
    if (this._muted) return;
    try {
      const ctx = new AudioContext();
      this.jazzCtx = ctx;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 2.0);
      master.connect(ctx.destination);
      this.jazzMasterGain = master;
      this.jazzBeat = 0;
      this.jazzNextBeatTime = ctx.currentTime + 0.1;
      this._jazzSchedule();
    } catch {}
  }

  private _jazzSchedule(): void {
    if (!this.jazzCtx || !this.jazzMasterGain) return;
    const ctx = this.jazzCtx;
    const beatDur = 60 / SoundManager.JAZZ_BPM;
    const lookAhead = 0.28;
    while (this.jazzNextBeatTime < ctx.currentTime + lookAhead) {
      const beat = this.jazzBeat;
      const chordIdx = Math.floor(beat / 8) % 4;
      const beatInChord = beat % 8;
      const t = this.jazzNextBeatTime;
      const chord = SoundManager.JAZZ_CHORD_FREQS[chordIdx];
      const bassFreq = SoundManager.JAZZ_BASS[chordIdx];
      // Hi-hat — accent on downbeats
      const hhVol = beat % 4 === 0 ? 0.22 : beat % 2 === 0 ? 0.13 : 0.07;
      this._jazzHiHat(ctx, t, hhVol);
      // Chord voicing on beat 0 and 4 of each 8-beat group
      if (beatInChord === 0 || beatInChord === 4) {
        chord.forEach((freq, i) => this._jazzNote(ctx, t + i * 0.025, freq, beatDur * 1.8, this._musicVolume * 0.17));
      }
      // Light off-beat stabs (swing feel)
      if (beatInChord === 2 || beatInChord === 6) {
        chord.slice(1, 3).forEach((freq, i) => this._jazzNote(ctx, t + i * 0.015, freq, beatDur * 0.7, this._musicVolume * 0.09));
      }
      // Walking bass
      if (beatInChord === 0) {
        this._jazzBass(ctx, t, bassFreq, beatDur * 1.6, this._musicVolume * 0.35);
      } else if (beatInChord === 4) {
        const nextBass = SoundManager.JAZZ_BASS[(chordIdx + 1) % 4];
        this._jazzBass(ctx, t, nextBass * 1.5, beatDur * 1.2, this._musicVolume * 0.28);
      } else if (beatInChord === 2 || beatInChord === 6) {
        this._jazzBass(ctx, t, bassFreq * 1.25, beatDur * 0.8, this._musicVolume * 0.18);
      }
      this.jazzNextBeatTime += beatDur / 2;
      this.jazzBeat++;
    }
    const delay = Math.max(10, (this.jazzNextBeatTime - lookAhead - ctx.currentTime) * 1000 - 10);
    clearTimeout(this.jazzSchedulerId as unknown as ReturnType<typeof setTimeout>);
    this.jazzSchedulerId = setTimeout(() => this._jazzSchedule(), delay) as unknown as number;
  }

  private _jazzHiHat(ctx: AudioContext, t: number, vol: number): void {
    if (!this.jazzMasterGain) return;
    const len = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.2));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(hpf); hpf.connect(g); g.connect(this.jazzMasterGain);
    src.start(t);
  }

  private _jazzNote(ctx: AudioContext, t: number, freq: number, dur: number, vol: number): void {
    if (!this.jazzMasterGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(dur, 0.05));
    osc.connect(g); g.connect(this.jazzMasterGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  private _jazzBass(ctx: AudioContext, t: number, freq: number, dur: number, vol: number): void {
    if (!this.jazzMasterGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(dur, 0.05));
    osc.connect(g); g.connect(this.jazzMasterGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  stopJazzLoop(): void {
    clearTimeout(this.jazzSchedulerId as unknown as ReturnType<typeof setTimeout>);
    this.jazzSchedulerId = 0;
    if (this.jazzMasterGain && this.jazzCtx) {
      try {
        const now = this.jazzCtx.currentTime;
        this.jazzMasterGain.gain.cancelScheduledValues(now);
        this.jazzMasterGain.gain.setValueAtTime(this.jazzMasterGain.gain.value, now);
        this.jazzMasterGain.gain.linearRampToValueAtTime(0, now + 0.5);
      } catch {}
      const ctx = this.jazzCtx;
      this.jazzCtx = null; this.jazzMasterGain = null;
      setTimeout(() => ctx.close().catch(() => {}), 600);
    }
  }

  // ── Warm ambient pad for ending cutscene ──────────────────────────────────
  private warmCtx: AudioContext | null = null;
  private warmMasterGain: GainNode | null = null;

  playWarmTone(): void {
    this.stopWarmTone();
    if (this._muted) return;
    try {
      const ctx = new AudioContext();
      this.warmCtx = ctx;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(this._musicVolume * 0.55, ctx.currentTime + 2.5);
      master.connect(ctx.destination);
      this.warmMasterGain = master;
      // Warm Cmaj7 pad: C3 E3 G3 B3
      const freqs = [130.81, 164.81, 196.00, 246.94];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i < 2 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(3.5 + i * 0.3, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.7, ctx.currentTime);
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.22 - i * 0.03, ctx.currentTime);
        osc.connect(g); g.connect(master);
        osc.start(); lfo.start();
      });
    } catch {}
  }

  stopWarmTone(): void {
    if (this.warmMasterGain && this.warmCtx) {
      try {
        const now = this.warmCtx.currentTime;
        this.warmMasterGain.gain.cancelScheduledValues(now);
        this.warmMasterGain.gain.setValueAtTime(this.warmMasterGain.gain.value, now);
        this.warmMasterGain.gain.linearRampToValueAtTime(0, now + 1.5);
      } catch {}
      const ctx = this.warmCtx;
      this.warmCtx = null; this.warmMasterGain = null;
      setTimeout(() => ctx.close().catch(() => {}), 2000);
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this._muted);
    return this._muted;
  }
}

export const soundManager = new SoundManager();
