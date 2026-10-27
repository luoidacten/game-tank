// ==========================================
// Chất lượng đồ hoạ thích ứng: high / medium / low (tự chọn theo FPS đo được, hoặc chọn tay)
// ==========================================
// high  : DPR tối đa 2, phát sáng (shadowBlur) đầy đủ, 100% hạt
// medium: DPR tối đa 1.5, phát sáng 50%, 60% hạt
// low   : DPR 1, tắt phát sáng, 30% hạt, nền sân giản lược, bỏ bớt mưa
// Áp dụng cả chơi offline lẫn online (mỗi máy tự chọn, không ảnh hưởng mô phỏng / đồng bộ).
const QUALITY_LEVELS = {
    high:   { maxDpr: 2,   glow: 1,   particles: 1,   label: 'CAO' },
    medium: { maxDpr: 1.5, glow: 0.5, particles: 0.6, label: 'TRUNG BÌNH' },
    low:    { maxDpr: 1,   glow: 0,   particles: 0.3, label: 'THẤP' },
};
const QUALITY_ORDER = ['high', 'medium', 'low'];

const Quality = {
    level: 'high',
    auto: true,           // tự hạ cấp khi FPS thấp
    avg: 16.7, slowTime: 0, cooldown: 0,
    get cfg() { return QUALITY_LEVELS[this.level]; },
    get particleMult() { return this.cfg.particles; },

    init() {
        let saved = null;
        try { saved = localStorage.getItem('cy_quality'); } catch (e) {}
        if (saved && QUALITY_LEVELS[saved]) { this.auto = false; this.set(saved, true); }
        else {
            this.auto = true;
            // Máy rất yếu: bắt đầu từ mức trung bình
            const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
            this.set(weak ? 'medium' : 'high', true);
        }
        this._installGlow();
        this.updateButtons();
    },

    // Bọc ctx.shadowBlur: nhân hệ số phát sáng của mức hiện tại (0 = tắt hẳn, rẻ nhất)
    _installGlow() {
        if (this._glowOk || typeof ctx === 'undefined') return;
        const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
        if (!d || !d.set) return;
        try {
            Object.defineProperty(ctx, 'shadowBlur', {
                get() { return d.get.call(ctx); },
                set(v) { d.set.call(ctx, Quality.cfg.glow === 1 ? v : v * Quality.cfg.glow); },
                configurable: true,
            });
            this._glowOk = true;
        } catch (e) {}
    },

    set(level, silent) {
        if (!QUALITY_LEVELS[level]) return;
        const changed = level !== this.level;
        this.level = level;
        if (typeof Display !== 'undefined') {
            Display.maxDpr = this.cfg.maxDpr;
            Display.lowQuality = level === 'low';
        }
        try { ctx.shadowBlur = 0; } catch (e) {}
        document.body.classList.toggle('low-quality', level === 'low');
        document.body.classList.toggle('mid-quality', level === 'medium');
        if (typeof canvas !== 'undefined' && canvas.applySize) canvas.applySize();
        if (typeof arenaFloorCache !== 'undefined') arenaFloorCache = null;
        this.slowTime = 0; this.cooldown = 4000;
        if (changed && !silent && typeof addFloatingText === 'function' && typeof gameState !== 'undefined' && gameState.phase === 'playing')
            addFloatingText(canvas.width / 2, canvas.height / 2, 'ĐỒ HOẠ: ' + this.cfg.label + ' ⚡', '#94a3b8', 12);
        this.updateButtons();
    },

    // Chọn tay (null = tự động)
    choose(level) {
        if (level && QUALITY_LEVELS[level]) {
            this.auto = false;
            try { localStorage.setItem('cy_quality', level); } catch (e) {}
            this.set(level, true);
        } else {
            this.auto = true;
            try { localStorage.removeItem('cy_quality'); } catch (e) {}
            this.avg = 16.7;
            this.set('high', true);
        }
    },

    // Vòng: TỰ ĐỘNG -> CAO -> TRUNG BÌNH -> THẤP -> TỰ ĐỘNG
    cycle() {
        if (this.auto) this.choose('high');
        else if (this.level === 'high') this.choose('medium');
        else if (this.level === 'medium') this.choose('low');
        else this.choose(null);
    },

    updateButtons() {
        const txt = '🖥 ĐỒ HOẠ: ' + (this.auto ? 'TỰ ĐỘNG (' + this.cfg.label + ')' : this.cfg.label);
        document.querySelectorAll('.quality-toggle').forEach(b => { b.textContent = txt; });
    },

    // Mỗi khung hình (dt ms): trung bình > ~22ms (< 45 FPS) liên tục 3 giây -> hạ 1 mức
    sample(dt) {
        if (dt <= 0 || dt > 120) return; // khung bị gián đoạn (đổi tab...)
        this.avg = this.avg * 0.95 + dt * 0.05;
        if (!this.auto || this.level === 'low') return;
        if (this.cooldown > 0) { this.cooldown -= dt; return; }
        if (this.avg > 22) this.slowTime += dt; else this.slowTime = Math.max(0, this.slowTime - dt);
        if (this.slowTime > 3000) {
            this.set(QUALITY_ORDER[QUALITY_ORDER.indexOf(this.level) + 1]);
            this.avg = 16.7;
        }
    },

    fps() { return Math.round(1000 / Math.max(1, this.avg)); },
};

Quality.init();
document.querySelectorAll('.quality-toggle').forEach(b => b.addEventListener('click', () => {
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted) soundSystem.playClick();
    Quality.cycle();
}));
