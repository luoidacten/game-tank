// ==========================================
// Evo 3/4 — phần HÌNH ẢNH dùng chung: nút Skill (vẽ canvas), vòng Nộ, băng tên Tuyệt Kỹ,
// màn mở Tuyệt Kỹ (tối nền, vạch tập trung, zoom nhẹ), âm thanh. Chỉ ĐỌC trạng thái, không đổi mô phỏng.
// Body khai báo nhận diện bằng EvoFx.theme(id, {...}) trong js/characters/<id>/evo.js:
//   c1 (màu chính), c2 (màu nhấn), dark (nền), name/slogan băng tên,
//   icon(g, mode, t)  vẽ icon trong hộp −12..12 (mode 'skill' | 'ult'),
//   need(p)           chuỗi ngắn khi Nộ đầy nhưng thiếu điều kiện tung ("cần 3 ụ · 2/3"),
//   sfx               [[trễ ms, tần số, kiểu sóng, thời lượng s, âm lượng], ...] khi tung Tuyệt Kỹ.
// ==========================================
const EVO_BANNER_TICKS = 84; // khớp EvoSystem.tick (p.ultBannerTicks = 84)

const EvoFx = {
    themes: {},
    theme(id, def) { this.themes[id] = def; },
    get(p) {
        const t = (p && this.themes[p.weapon]) || {};
        return {
            c1: '#38bdf8', c2: '#f97316', dark: '#0b1424', slogan: '', icon: null, need: null, sfx: null,
            ...t,
        };
    },
    glow() { return typeof Quality !== 'undefined' ? Quality.cfg.glow : 1; },
    low() { return typeof Quality !== 'undefined' && Quality.level === 'low'; },
    clamp01(v) { return Math.max(0, Math.min(1, v)); },
    ease(v) { v = this.clamp01(v); return 1 - (1 - v) * (1 - v) * (1 - v); },

    // ---------- Âm thanh ----------
    sound(list) {
        if (typeof soundSystem === 'undefined' || !soundSystem || soundSystem.muted || !list) return;
        for (const [ms, f, type, dur, vol] of list) {
            const go = () => soundSystem.playTone(f, type || 'sine', dur || 0.15, vol || 0.15, 0.001);
            if (ms > 0) setTimeout(go, ms); else go();
        }
    },
    soundRageFull() { this.sound([[0, 1318, 'sine', 0.12, 0.12], [60, 1760, 'sine', 0.18, 0.1], [90, 98, 'sawtooth', 0.35, 0.16]]); },
    soundUlt(th) {
        this.sound([[0, 70, 'sawtooth', 0.55, 0.22], [0, 220, 'triangle', 0.25, 0.12], [80, 440, 'triangle', 0.2, 0.1], [150, 880, 'sine', 0.3, 0.08]]);
        if (th.sfx) this.sound(th.sfx);
    },

    // ---------- Icon mặc định + tiện ích vẽ icon ----------
    defaultIcon(g, mode) {
        g.beginPath();
        if (mode === 'ult') { // ngọn lửa Nộ
            g.moveTo(0, -12); g.bezierCurveTo(8, -4, 10, 4, 0, 11); g.bezierCurveTo(-10, 4, -8, -4, -2, -8);
            g.bezierCurveTo(-2, -2, 2, -2, 0, -12);
            g.fill();
        } else { // tia chớp
            g.moveTo(3, -12); g.lineTo(-7, 2); g.lineTo(-1, 2); g.lineTo(-3, 12); g.lineTo(7, -2); g.lineTo(1, -2); g.closePath(); g.fill();
        }
    },
    roundRect(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); },

    // ---------- Nút Skill ----------
    BTN: 56, PAD: 12,
    ensureButton(btn) {
        if (btn._evo) return btn._evo;
        btn.innerHTML = '';
        const cv = document.createElement('canvas');
        cv.className = 'evo-skill-cv';
        const need = document.createElement('span');
        need.className = 'evo-skill-need'; need.hidden = true;
        btn.appendChild(cv); btn.appendChild(need);
        btn._evo = { cv, need, g: cv.getContext('2d'), dpr: 0, cdWas: 0, flashT: 0, fullT: 0, wasFull: false, lastNeed: '' };
        return btn._evo;
    },
    // mode: 'skill' | 'cd' | 'full' | 'blocked' | 'active'
    drawButton(btn, p, cfg, now) {
        const st = this.ensureButton(btn), th = this.get(p);
        const size = this.BTN + this.PAD * 2, dpr = Math.min(2, window.devicePixelRatio || 1);
        if (st.dpr !== dpr) { st.dpr = dpr; st.cv.width = st.cv.height = Math.round(size * dpr); }
        const g = st.g, glow = this.glow(), t = now / 1000;
        const rage = Math.max(0, Math.min(100, (p.rageUnits || 0) / 100));
        const full = rage >= 100, ready = !full || EvoSystem.ready(p);
        const active = p.ultActiveTicks > 0;
        const cdTot = Math.max(1, (cfg.cooldown || 10) * 60), cd = p.skillCd || 0;
        // nhịp: hồi xong CD -> loé; vừa đầy Nộ -> phồng 0.4s
        if (st.cdWas > 0 && cd <= 0 && !full) st.flashT = now;
        st.cdWas = cd;
        if (full && !st.wasFull) { st.fullT = now; if (ready) this.soundRageFull(); }
        st.wasFull = full;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, size, size);
        const c = size / 2, R = this.BTN / 2;
        g.save(); g.translate(c, c);
        // phồng khi biến hình
        const pop = this.clamp01((now - st.fullT) / 400);
        let sc = full && pop < 1 ? 1 + 0.22 * Math.sin(pop * Math.PI) : 1;
        if (full && ready && !active) sc *= 1 + 0.035 * Math.sin(t * 9);
        g.scale(sc, sc);

        // --- Hào quang nền khi đầy Nộ ---
        if (full && ready && !active) {
            const halo = g.createRadialGradient(0, 0, R * 0.6, 0, 0, R + this.PAD);
            halo.addColorStop(0, th.c2 + 'aa'); halo.addColorStop(1, th.c2 + '00');
            g.fillStyle = halo; g.beginPath(); g.arc(0, 0, R + this.PAD, 0, Math.PI * 2); g.fill();
        }
        // --- Đĩa nút ---
        const disc = g.createRadialGradient(-R * 0.3, -R * 0.4, 1, 0, 0, R);
        disc.addColorStop(0, this.mix(th.c1, th.dark, 0.35) + (full && !ready ? '55' : 'dd'));
        disc.addColorStop(0.55, th.dark);
        disc.addColorStop(1, '#03060d');
        g.fillStyle = disc; g.beginPath(); g.arc(0, 0, R - 4, 0, Math.PI * 2); g.fill();
        // viền trong màu đội (nhỏ) + vạch kim loại
        g.lineWidth = 1.5; g.strokeStyle = (p.id === 1 ? '#3498db' : '#e74c3c') + 'cc';
        g.beginPath(); g.arc(0, 0, R - 4.5, 0, Math.PI * 2); g.stroke();

        // --- Icon ---
        const mode = full || active ? 'ult' : 'skill';
        g.save();
        const dim = (cd > 0 && !full && !active) ? 0.38 : (full && !ready ? 0.45 : 1);
        g.globalAlpha = dim;
        const ic = full && ready ? th.c2 : th.c1;
        g.fillStyle = full && !ready ? '#94a3b8' : '#f8fafc';
        g.strokeStyle = full && !ready ? '#94a3b8' : '#f8fafc';
        g.shadowColor = full && !ready ? 'transparent' : ic; g.shadowBlur = 8 * glow;
        g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 2.4;
        const k = { t, c1: th.c1, c2: th.c2, full, ready, team: p.id === 1 ? '#3498db' : '#e74c3c' };
        g.scale(0.92, 0.92);
        if (th.icon) th.icon(g, mode, k); else this.defaultIcon(g, mode);
        g.restore();

        // --- Hồi chiêu: quét tròn ngược chiều kim đồng hồ + số giây ---
        if (cd > 0 && !full && !active) {
            const f = Math.min(1, cd / cdTot), a0 = -Math.PI / 2;
            g.fillStyle = 'rgba(2,6,16,.62)';
            g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R - 4, a0, a0 - f * Math.PI * 2, true); g.closePath(); g.fill();
            g.strokeStyle = th.c1; g.lineWidth = 1.5; g.globalAlpha = 0.9;
            g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a0 - f * Math.PI * 2) * (R - 4), Math.sin(a0 - f * Math.PI * 2) * (R - 4)); g.stroke();
            g.globalAlpha = 1;
            this.text(g, cd < 180 ? (cd / 60).toFixed(1) : String(Math.ceil(cd / 60)), 0, 1, cd < 180 ? 15 : 17, '#ffffff', th.c1, glow);
        }
        // --- Tuyệt Kỹ đang chạy: vòng đếm ngược màu body ---
        if (active) {
            const tot = Math.max(1, cfg.ultimateTicks || 60), f = Math.min(1, p.ultActiveTicks / tot);
            g.strokeStyle = th.c2; g.lineWidth = 3; g.shadowColor = th.c2; g.shadowBlur = 10 * glow;
            g.beginPath(); g.arc(0, 0, R - 7, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); g.stroke();
            g.shadowBlur = 0;
            g.fillStyle = 'rgba(2,6,16,.45)'; g.beginPath(); g.arc(0, 0, R - 9, 0, Math.PI * 2); g.fill();
            this.text(g, String(Math.ceil(p.ultActiveTicks / 60)), 0, 1, 18, '#fff', th.c2, glow);
        }

        // --- Vòng Nộ (ngoài, dày 5px): đổ từ đáy theo chiều kim đồng hồ, cam -> đỏ ---
        const rr = R - 1;
        g.lineWidth = 5; g.lineCap = 'butt';
        g.strokeStyle = 'rgba(8,12,22,.95)'; g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 1; g.strokeStyle = 'rgba(148,163,184,.25)';
        g.beginPath(); g.arc(0, 0, rr + 3, 0, Math.PI * 2); g.stroke();
        if (!active) {
            const a0 = Math.PI / 2, a1 = a0 + (rage / 100) * Math.PI * 2;
            let grad;
            if (full && !ready) grad = '#64748b';
            else if (g.createConicGradient) {
                grad = g.createConicGradient(a0, 0, 0);
                grad.addColorStop(0, '#fde047'); grad.addColorStop(0.45, '#fb923c'); grad.addColorStop(0.85, '#ef4444'); grad.addColorStop(1, '#f43f5e');
            } else grad = '#fb923c';
            if (rage > 0) {
                const hot = rage >= 80 && ready;
                const beat = hot ? 0.5 + 0.5 * Math.sin(t * (full ? 10 : 7)) : 0;
                g.lineWidth = 5 + beat * 1.2; g.lineCap = 'butt'; g.strokeStyle = grad;
                g.shadowColor = full && !ready ? 'transparent' : '#f97316'; g.shadowBlur = (hot ? 8 + 10 * beat : 4) * glow;
                if (full && !ready) g.setLineDash([5, 3.5]);
                g.beginPath(); g.arc(0, 0, rr, a0, a1); g.stroke();
                g.setLineDash([]); g.shadowBlur = 0;
                // đầu vòng sáng
                if (!full) {
                    g.fillStyle = '#fff7d6'; g.beginPath(); g.arc(Math.cos(a1) * rr, Math.sin(a1) * rr, 2.2, 0, Math.PI * 2); g.fill();
                }
                // vạch chia 4 mốc
                g.strokeStyle = 'rgba(2,6,16,.8)'; g.lineWidth = 1.2;
                for (let i = 1; i < 4; i++) {
                    const a = a0 + i * Math.PI / 2;
                    g.beginPath(); g.moveTo(Math.cos(a) * (rr - 3), Math.sin(a) * (rr - 3)); g.lineTo(Math.cos(a) * (rr + 3), Math.sin(a) * (rr + 3)); g.stroke();
                }
            }
            // đầy Nộ + sẵn sàng: vệt sáng chạy vòng + hạt lửa
            if (full && ready) {
                const sa = t * 4.2;
                g.strokeStyle = '#fff7d6'; g.lineWidth = 2.5; g.lineCap = 'round';
                g.shadowColor = '#fde047'; g.shadowBlur = 10 * glow;
                g.beginPath(); g.arc(0, 0, rr, sa, sa + 0.7); g.stroke();
                g.beginPath(); g.arc(0, 0, rr, sa + Math.PI, sa + Math.PI + 0.7); g.stroke();
                g.shadowBlur = 0;
                const n = this.low() ? 4 : 8;
                for (let i = 0; i < n; i++) {
                    const ph = (t * 0.9 + i / n) % 1, a = i * 2.39996 + t * 0.6;
                    const d = rr + 2 + ph * 9;
                    g.globalAlpha = (1 - ph) * 0.9;
                    g.fillStyle = i % 2 ? '#fde047' : '#fb7185';
                    g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 1.8 * (1 - ph) + 0.6, 0, Math.PI * 2); g.fill();
                }
                g.globalAlpha = 1;
            }
            // thiếu điều kiện: huy hiệu khoá
            if (full && !ready) {
                g.save(); g.translate(R * 0.62, R * 0.62);
                g.fillStyle = '#0f172a'; g.strokeStyle = '#94a3b8'; g.lineWidth = 1.5;
                g.beginPath(); g.arc(0, 0, 8.5, 0, Math.PI * 2); g.fill(); g.stroke();
                g.fillStyle = '#e2e8f0'; g.fillRect(-3.5, -0.5, 7, 5.5);
                g.strokeStyle = '#e2e8f0'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, -1, 2.6, Math.PI, 0); g.stroke();
                g.restore();
            }
        }
        // loé khi hồi xong CD
        const fl = (now - st.flashT) / 280;
        if (fl >= 0 && fl < 1) {
            g.strokeStyle = th.c1; g.globalAlpha = 1 - fl; g.lineWidth = 3 * (1 - fl) + 1;
            g.beginPath(); g.arc(0, 0, R - 4 + fl * 10, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        }
        // vòng nổ khi vừa đầy
        if (full && pop < 1) {
            g.strokeStyle = '#fde047'; g.globalAlpha = 1 - pop; g.lineWidth = 3;
            g.beginPath(); g.arc(0, 0, R + pop * 12, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        }
        g.restore();

        // --- Nhãn điều kiện thiếu ---
        const needTxt = full && !ready ? ((th.need && th.need(p)) || 'Chưa đủ điều kiện') : '';
        if (needTxt !== st.lastNeed) { st.need.textContent = needTxt; st.need.hidden = !needTxt; st.lastNeed = needTxt; }
        btn.classList.toggle('evo-ultimate', full && ready && !active);
        btn.classList.toggle('evo-blocked', full && !ready);
        return { full, ready };
    },
    text(g, s, x, y, px, fill, glowCol, glow) {
        g.save();
        g.font = `900 ${px}px Orbitron, 'Arial Black', Arial, sans-serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 3; g.strokeStyle = 'rgba(2,6,16,.9)'; g.strokeText(s, x, y);
        g.shadowColor = glowCol; g.shadowBlur = 8 * glow; g.fillStyle = fill; g.fillText(s, x, y);
        g.restore();
    },
    mix(a, b, k) {
        const pa = this.rgb(a), pb = this.rgb(b);
        const h = v => Math.round(v).toString(16).padStart(2, '0');
        return '#' + [0, 1, 2].map(i => h(pa[i] + (pb[i] - pa[i]) * k)).join('');
    },
    rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); },
    rgba(h, a) { const [r, g, b] = this.rgb(h); return `rgba(${r},${g},${b},${a})`; },

    // ---------- Băng tên Tuyệt Kỹ ----------
    ensureBanner(el) {
        if (el._evo) return el._evo;
        el.innerHTML = '<div class="evo-banner-bar"><canvas class="evo-banner-ico"></canvas><div class="evo-banner-txt"><b></b><small></small></div></div>';
        const ico = el.querySelector('canvas');
        ico.width = ico.height = 88;
        el._evo = { bar: el.firstChild, ico, b: el.querySelector('b'), s: el.querySelector('small'), key: '' };
        return el._evo;
    },
    updateBanner(el, p, cfg, online) {
        const st = this.ensureBanner(el), th = this.get(p);
        const ticks = p.ultBannerTicks || 0, e = EVO_BANNER_TICKS - ticks;
        const key = (p.ultBannerName || '') + '|' + p.weapon;
        if (st.key !== key) {
            st.key = key;
            st.b.textContent = p.ultBannerName || cfg && cfg.ultimateName || 'TUYỆT KỸ';
            st.s.textContent = th.slogan || (cfg && cfg.name) || '';
            el.style.setProperty('--evo-c1', th.c1); el.style.setProperty('--evo-c2', th.c2);
            el.style.setProperty('--evo-bg', `linear-gradient(90deg, ${th.dark} 0%, ${this.rgba(this.mix(th.c1, th.dark, 0.25), 0.95)} 22%, ${this.rgba(this.mix(th.c1, th.dark, 0.6), 0.97)} 66%, ${this.rgba(th.dark, 0)} 100%)`);
            const len = st.b.textContent.length;
            st.b.style.fontSize = len > 20 ? '15px' : len > 14 ? '17px' : '';
            const g = st.ico.getContext('2d');
            g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 88, 88);
            g.translate(44, 44); g.scale(2.6, 2.6);
            g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round';
            g.shadowColor = th.c2; g.shadowBlur = 6;
            const k = { t: 0, c1: th.c1, c2: th.c2, full: true, ready: true, team: p.id === 1 ? '#3498db' : '#e74c3c' };
            if (th.icon) th.icon(g, 'ult', k); else this.defaultIcon(g, 'ult');
        }
        // nằm giữa xe và nút: phủ dải nhãn PLAYER + mép sân phía người tung, không che giữa sân / nút
        const gc = document.getElementById('gameContainer');
        if (gc) {
            const r = gc.getBoundingClientRect(), side = el.id.endsWith('2') ? 2 : 1;
            el.style.left = r.left + 'px'; el.style.width = r.width + 'px';
            el.style.top = (side === 1 ? r.bottom - 24 : r.top - 28) + 'px';
        }
        // trượt vào 0.15s – giữ – mờ 0.25s
        const inK = this.ease(e / 9), outK = this.clamp01(ticks / 15);
        st.bar.style.transform = `translateX(${(1 - inK) * -110}%) skewX(-12deg)`;
        st.bar.style.opacity = String(Math.min(inK * 1.2, outK));
        el.classList.toggle('evo-banner-flat', !!online); // online: băng đối thủ không xoay ngược
    },

    // ---------- Màn mở Tuyệt Kỹ (vẽ trong world-space) ----------
    casters() {
        const list = [];
        if (typeof gameState === 'undefined' || !FEATURE_EVO34) return list;
        for (const p of [p1, p2]) if (p && p.ultBannerTicks > 0 && p.hp > 0) list.push(p);
        return list;
    },
    // 0..1: bao của lớp tối nền
    dimK(p) {
        const e = EVO_BANNER_TICKS - p.ultBannerTicks;
        return this.ease(e / 6) * (1 - this.clamp01((e - 34) / 20));
    },
    under() {
        for (const p of this.casters()) {
            const th = this.get(p), k = this.dimK(p);
            if (k <= 0.01) continue;
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2, W = canvas.width, H = canvas.height;
            ctx.save();
            const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(W, H) * 0.9);
            g.addColorStop(0, this.rgba(th.dark, 0.12 * k));
            g.addColorStop(0.35, `rgba(2,4,12,${0.42 * k})`);
            g.addColorStop(1, `rgba(0,0,0,${0.62 * k})`);
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            // vệt sáng màu body chạy dọc làn người tung
            const e = EVO_BANNER_TICKS - p.ultBannerTicks;
            const lane = this.ease(e / 10) * (1 - this.clamp01((e - 20) / 24));
            if (lane > 0.01) {
                const lg = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
                lg.addColorStop(0, this.rgba(th.c1, 0)); lg.addColorStop(0.5, this.rgba(th.c1, 0.22 * lane)); lg.addColorStop(1, this.rgba(th.c1, 0));
                ctx.fillStyle = lg; ctx.fillRect(cx - 60, 0, 120, H);
            }
            ctx.restore();
        }
    },
    over() {
        const low = this.low(), glow = this.glow();
        for (const p of this.casters()) {
            const th = this.get(p), e = EVO_BANNER_TICKS - p.ultBannerTicks;
            if (e > 30) continue;
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2, W = canvas.width, H = canvas.height;
            ctx.save();
            // vạch tập trung (anime) từ mép vào xe
            const a = 1 - this.clamp01(e / 26);
            const n = low ? 14 : 30, far = Math.hypot(W, H);
            ctx.strokeStyle = this.rgba('#ffffff', 0.55 * a);
            for (let i = 0; i < n; i++) {
                const ang = (i / n) * Math.PI * 2 + ((i * 7919) % 13) * 0.02;
                const len = 0.45 + ((i * 31) % 7) / 14;
                const r0 = 70 + e * 6 + ((i * 17) % 5) * 12;
                ctx.lineWidth = 1 + ((i * 13) % 3);
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
                ctx.lineTo(cx + Math.cos(ang) * (r0 + far * len), cy + Math.sin(ang) * (r0 + far * len));
                ctx.stroke();
            }
            // sóng xung kích quanh xe
            const s = this.clamp01(e / 18);
            if (s < 1) {
                ctx.globalAlpha = 1 - s;
                ctx.strokeStyle = th.c2; ctx.lineWidth = 6 * (1 - s) + 1.5;
                ctx.shadowColor = th.c2; ctx.shadowBlur = 16;
                ctx.beginPath(); ctx.arc(cx, cy, 20 + s * 120, 0, Math.PI * 2); ctx.stroke();
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, 14 + s * 80, 0, Math.PI * 2); ctx.stroke();
                ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            }
            // chớp ngang qua xe (vệt sáng)
            const f = 1 - this.clamp01(e / 12);
            if (f > 0) {
                const hg = ctx.createLinearGradient(0, cy - 16, 0, cy + 16);
                hg.addColorStop(0, this.rgba(th.c2, 0)); hg.addColorStop(0.5, this.rgba('#ffffff', 0.75 * f)); hg.addColorStop(1, this.rgba(th.c2, 0));
                ctx.fillStyle = hg; ctx.fillRect(0, cy - 16 * (0.4 + f), W, 32 * (0.4 + f));
            }
            ctx.restore();
        }
    },
    // zoom nhẹ vào người tung ~0.6s (không chen vào camera kết liễu)
    cam() {
        let best = null;
        for (const p of this.casters()) {
            const e = EVO_BANNER_TICKS - p.ultBannerTicks;
            if (e > 40) continue;
            const z = 0.055 * Math.sin(this.clamp01(e / 40) * Math.PI) ;
            if (!best || p.ultBannerTicks > best.t) best = { t: p.ultBannerTicks, x: p.x + p.w / 2, y: (p.y + p.h / 2) * 0.6 + canvas.height * 0.2, zoom: 1 + z };
        }
        return best;
    },

    // ---------- Vòng lặp UI (thay EvoSystem.ui) ----------
    seen: {},
    ui() {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const online = onlineManager.isOnline;
        for (const side of [1, 2]) {
            const btn = document.getElementById(`evo-skill-${side}`);
            if (!btn) continue;
            const p = online && onlineManager.role === 'guest' ? (side === 1 ? p2 : p1) : (side === 1 ? p1 : p2);
            const cfg = EvoSystem.config(p), active = gameState.phase === 'playing';
            btn.hidden = !cfg || !active || (online && side === 2);
            const banner = document.getElementById(`evo-banner-${side}`);
            const showBanner = !!(FEATURE_EVO34 && active && p && p.ultBannerTicks > 0);
            banner.hidden = !showBanner;
            if (showBanner) this.updateBanner(banner, p, cfg, online);
            // âm thanh lúc tung (phát hiện cạnh lên, chạy được cả trên máy guest)
            if (p) {
                const prev = this.seen[p.id] || 0, cur = p.ultBannerTicks || 0;
                if (cur > prev && active) this.soundUlt(this.get(p));
                this.seen[p.id] = cur;
            }
            if (btn.hidden) continue;
            const s = this.drawButton(btn, p, cfg, now);
            const title = s.full ? `${cfg.ultimateName}${s.ready ? '' : ' — Chưa đủ điều kiện'}` : cfg.name;
            if (btn.title !== title) { btn.title = title; btn.setAttribute('aria-label', title); }
            if (s.full && btn.dataset.full !== 'true' && navigator.vibrate) { try { navigator.vibrate(10); } catch (e) {} }
            btn.dataset.full = String(s.full);
        }
    },
};

// Hiệu ứng chung của EvoBodyKit: loé vòng (flash) và tia (beam) đẹp hơn.
if (typeof EvoBodyKit !== 'undefined') {
    EvoBodyKit.effects.flash = {
        draw(f) {
            const k = 1 - f.life / f.maxLife, col = f.color || '#67e8f9';
            ctx.save();
            ctx.globalAlpha = Math.min(1, f.life / 14);
            ctx.shadowColor = col; ctx.shadowBlur = 14;
            ctx.strokeStyle = col; ctx.lineWidth = 4 * (1 - k) + 1;
            ctx.beginPath(); ctx.arc(f.x, f.y, 14 + EvoFx.ease(k) * 42, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(f.x, f.y, 10 + EvoFx.ease(k) * 28, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = col;
            for (let i = 0; i < 10; i++) {
                const a = i * 0.628 + 0.3, d = 16 + EvoFx.ease(k) * 50;
                ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(a);
                ctx.fillRect(-5 * (1 - k) - 1, -1, 10 * (1 - k) + 2, 2);
                ctx.restore();
            }
            ctx.restore();
        },
    };
    EvoBodyKit.effects.beam = {
        draw(f) {
            const k = f.life / f.maxLife, col = f.color || '#67e8f9', w = f.width || 10;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.min(1, k * 1.4);
            ctx.shadowColor = col; ctx.shadowBlur = 22;
            ctx.strokeStyle = col; ctx.lineWidth = w * (0.6 + 0.6 * k);
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, f.end); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, w * 0.3 * k);
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, f.end); ctx.stroke();
            // vòng nổ ở điểm cuối
            ctx.strokeStyle = col; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(f.x, f.end, w * (1.6 - k), 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        },
    };
}

// Vẽ thêm theo body quanh xe: EvoFx.body(id, { under(p), over(p) }) — chỉ đọc trạng thái.
EvoFx.bodyDraw = {};
EvoFx.body = function (id, hooks) { this.bodyDraw[id] = hooks; };
(function () {
    const draw = Player.prototype.draw;
    Player.prototype.draw = function () {
        const h = FEATURE_EVO34 && this.hp > 0 && EvoFx.bodyDraw[this.weapon];
        if (h && h.under) { ctx.save(); try { h.under(this); } catch (e) {} ctx.restore(); }
        const r = draw.apply(this, arguments);
        if (h && h.over) { ctx.save(); try { h.over(this); } catch (e) {} ctx.restore(); }
        return r;
    };
})();

// Lớp vẽ (gọi từ js/render/render.js) + camera zoom nhẹ
function evoFxUnder() { if (FEATURE_EVO34) EvoFx.under(); }
function evoFxOver() { if (FEATURE_EVO34) EvoFx.over(); }
(function () {
    if (typeof computeFinisherCam !== 'function') return;
    const cam = computeFinisherCam;
    computeFinisherCam = function () {
        const c = cam.apply(this, arguments);
        if (c || !FEATURE_EVO34) return c;
        const u = EvoFx.cam();
        return u ? fcamClamp(u) : null;
    };
})();
