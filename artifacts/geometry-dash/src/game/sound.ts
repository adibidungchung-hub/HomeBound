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

  toggleMute(): boolean {
    this.setMuted(!this._muted);
    return this._muted;
  }
}

export const soundManager = new SoundManager();
