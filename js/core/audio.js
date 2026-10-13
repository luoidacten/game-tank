// ==========================================
// Hệ thống âm thanh (Web Audio)
// ==========================================

// ============================================================================
// PROCEDURAL SOUND SYSTEM (WEB AUDIO API - 100% SELF-CONTAINED)
// ============================================================================
class WebAudioSoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    playTone(freq, type, duration, startVol = 0.2, endVol = 0.001) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    }
    playShoot(type = 'normal') {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            if (type === 'laser') {
                this.playTone(880, 'sine', 0.12, 0.2, 0.01);
            } else if (type === 'cannon') {
                this.playTone(160, 'sawtooth', 0.18, 0.3, 0.01);
            } else {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(480, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.09);
                gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.09);
            }
        } catch(e) {}
    }
    playLaser() {
        this.playShoot('laser');
    }
    playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, this.ctx.currentTime);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch(e) {}
    }
    playHit() {
        this.playTone(220, 'square', 0.07, 0.15, 0.01);
    }
    playClick() {
        this.playTone(600, 'sine', 0.05, 0.1, 0.01);
    }
    playDash() {
        this.playTone(180, 'sawtooth', 0.12, 0.2, 0.01);
    }
    playShieldBreak() {
        this.playTone(700, 'triangle', 0.15, 0.25, 0.01);
        setTimeout(() => this.playTone(320, 'sawtooth', 0.2, 0.2, 0.01), 40);
    }
    playCoin() {
        this.playTone(987.77, 'sine', 0.08, 0.15, 0.01);
        setTimeout(() => this.playTone(1318.51, 'sine', 0.15, 0.15, 0.01), 70);
    }
    playPowerup() {
        this.playTone(330, 'triangle', 0.09, 0.15, 0.01);
        setTimeout(() => this.playTone(440, 'triangle', 0.09, 0.15, 0.01), 70);
        setTimeout(() => this.playTone(660, 'triangle', 0.16, 0.2, 0.01), 140);
    }
    playRevive() {
        this.playTone(261.63, 'sine', 0.15, 0.2, 0.01);
        setTimeout(() => this.playTone(329.63, 'sine', 0.15, 0.2, 0.01), 90);
        setTimeout(() => this.playTone(392.00, 'sine', 0.15, 0.2, 0.01), 180);
        setTimeout(() => this.playTone(523.25, 'sine', 0.35, 0.25, 0.01), 270);
    }
    playWin() {
        this.playTone(523.25, 'sine', 0.15, 0.2, 0.01);
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2, 0.01), 140);
        setTimeout(() => this.playTone(783.99, 'sine', 0.15, 0.2, 0.01), 280);
        setTimeout(() => this.playTone(1046.50, 'sine', 0.45, 0.3, 0.01), 420);
    }
}
const soundSystem = new WebAudioSoundSystem();
