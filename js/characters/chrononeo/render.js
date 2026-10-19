// ==========================================
// Chrono & Neo (chrononeo) — Hình ảnh: xe 2 thế, đạn đồng / đạn neon, Ảnh Chiếu, Phân Thân, HUD đồng hồ cát
// ==========================================

// --- Xe: vẽ trong lưới 32×32 (−16..16), nòng hướng −y ---
function cnArt(st, p, k, ghost) {
    const t = k.t;
    const kick = (p.cnKick || 0) * 0.35;
    if (st === 'chrono') {
        // Bánh xích bánh răng đồng
        TA.treads(-15, 5, -12, 14, t, '#2a1a0c', '#7c4a1c');
        // Nòng trọng pháo
        TA.barrel(0, -4 + kick, 12, 5.4, '#e8c37a', CN_GOLD);
        ctx.fillStyle = '#5b3410'; TA.rr(-3.6, -12 + kick, 7.2, 2.4, 1); ctx.fill(); // vòng nòng
        // Thân bát giác
        ctx.fillStyle = TA.metal(-10, 10, '#4a2a10', '#a8662a');
        ctx.beginPath();
        ctx.moveTo(-6, -9); ctx.lineTo(6, -9); ctx.lineTo(10, -5); ctx.lineTo(10, 9); ctx.lineTo(6, 13); ctx.lineTo(-6, 13); ctx.lineTo(-10, 9); ctx.lineTo(-10, -5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
        // Mặt đồng hồ
        TA.glow(CN_GOLD, ghost ? 4 : 10);
        ctx.fillStyle = '#1a0f05'; ctx.beginPath(); ctx.arc(0, 2, 7.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = CN_GOLD; ctx.lineWidth = 1.4; ctx.stroke();
        TA.noGlow();
        ctx.strokeStyle = 'rgba(255,223,138,0.7)'; ctx.lineWidth = 0.7;
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5.4, 2 + Math.sin(a) * 5.4); ctx.lineTo(Math.cos(a) * 6.6, 2 + Math.sin(a) * 6.6); ctx.stroke();
        }
        // kim
        ctx.strokeStyle = '#fff4c2'; ctx.lineWidth = 1.1;
        const a1 = t * 2.2, a2 = t * 0.4;
        ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(Math.cos(a1) * 5, 2 + Math.sin(a1) * 5); ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(Math.cos(a2) * 3.4, 2 + Math.sin(a2) * 3.4); ctx.stroke();
        ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 2, 1.2, 0, Math.PI * 2); ctx.fill();
    } else {
        // Neo: thân thon, đèn neon, 2 nòng mảnh
        TA.treads(-15, 4, -10, 13, t * 1.6, '#060b16', '#1e3a5f');
        TA.barrel(-3.2, -6 + kick, 10, 2.4, '#bff6ff', CN_CYAN);
        TA.barrel(3.2, -6 + kick * 0.6, 10, 2.4, '#bff6ff', CN_CYAN);
        ctx.fillStyle = TA.vgrad(-10, 14, '#0f1d33', '#050a14');
        ctx.beginPath();
        ctx.moveTo(0, -11); ctx.lineTo(9, -4); ctx.lineTo(10, 10); ctx.lineTo(5, 14); ctx.lineTo(-5, 14); ctx.lineTo(-10, 10); ctx.lineTo(-9, -4); ctx.closePath(); ctx.fill();
        TA.glow(CN_CYAN, ghost ? 4 : 10);
        ctx.strokeStyle = CN_CYAN; ctx.lineWidth = 1.2; ctx.stroke();
        // vạch neon chạy
        ctx.strokeStyle = k.team; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-7, 9); ctx.lineTo(-3, -2); ctx.moveTo(7, 9); ctx.lineTo(3, -2); ctx.stroke();
        TA.noGlow();
        // lõi lục giác
        ctx.fillStyle = '#0a1426'; ctx.strokeStyle = '#7ff3ff'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx.lineTo(Math.cos(a) * 5, 4 + Math.sin(a) * 5); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        const pulse = 0.5 + 0.5 * Math.sin(t * 6);
        ctx.fillStyle = `rgba(34,227,255,${0.5 + 0.5 * pulse})`;
        ctx.beginPath(); ctx.arc(0, 4, 2 + pulse, 0, Math.PI * 2); ctx.fill();
    }
    // Đồng hồ cát nhỏ ở đuôi xe (phát sáng khi Thời Khắc đầy)
    if (!ghost && p.cnGlass !== undefined) {
        const max = cnGlassMax(p), f = Math.min(1, (p.cnGlass || 0) / max), ready = f >= 1;
        ctx.save(); ctx.translate(0, 12.2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; TA.rr(-3.4, -2.8, 6.8, 5.6, 1); ctx.fill();
        if (ready) TA.glow('#fff4c2', 8);
        ctx.strokeStyle = ready ? '#fff4c2' : 'rgba(255,223,138,0.8)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-2.4, -2.2); ctx.lineTo(2.4, -2.2); ctx.lineTo(-2.4, 2.2); ctx.lineTo(2.4, 2.2); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = st === 'chrono' ? CN_GOLD : CN_CYAN;
        // cát trên vơi, cát dưới đầy
        const top = (1 - f) * 1.9, bot = f * 1.9;
        if (top > 0.1) { ctx.beginPath(); ctx.moveTo(-top, -0.2 - top); ctx.lineTo(top, -0.2 - top); ctx.lineTo(0, -0.2); ctx.closePath(); ctx.fill(); }
        if (bot > 0.1) { ctx.beginPath(); ctx.moveTo(-bot * 1.2, 2); ctx.lineTo(bot * 1.2, 2); ctx.lineTo(0, 2 - bot); ctx.closePath(); ctx.fill(); }
        TA.noGlow(); ctx.restore();
    }
}

registerTankArt('chrononeo', (p, k) => {
    // Hiệu ứng vừa chuyển thế: vòng bánh răng / tia điện
    if (p.cnSwFlash > 0) {
        ctx.save(); ctx.globalAlpha = p.cnSwFlash / 16;
        ctx.strokeStyle = p.cnSt === 'chrono' ? CN_GOLD : CN_CYAN; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 15.5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    cnArt(p.cnSt || 'chrono', p, k, false);
    // giảm sát thương (Chrono vừa vào thế): giáp đồng mờ
    if (p.cnDR > 0) {
        ctx.save(); ctx.globalAlpha = Math.min(1, p.cnDR / 20) * 0.5;
        ctx.strokeStyle = CN_GOLD; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]);
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
});

// Vẽ bóng xe (Ảnh Chiếu / Phân Thân) tại tâm (cx, cy)
function cnDrawGhostTank(p, cx, cy, st, alpha, tint) {
    if (!p) return;
    const s = p.w / 32;
    const tc = TEAM_COLORS[p.id] || TEAM_COLORS[1];
    const k = Object.assign({ t: Date.now() / 1000, s }, tc, tankArtEvoState(p));
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (tint) {
        ctx.fillStyle = tint; ctx.globalAlpha *= 0.35;
        ctx.beginPath(); ctx.ellipse(cx, cy, p.w * 0.62, p.h * 0.58, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha /= 0.35;
    }
    ctx.translate(cx, cy);
    ctx.scale(s, p.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { cnArt(st, { cnKick: p.cnTwKick || 0 }, k, true); } catch (e) { }
    ctx.restore();
}

// --- Đạn ---
registerBulletArt('chrononeo', (b, color, owner, k) => {
    const kind = b.cnKind;
    if (kind === 'chrono') {
        // Đạn đồng: lõi vàng + vòng bánh răng xoay + đuôi lửa
        const R = b.cnTwin ? 4 : 5.5;
        const g = ctx.createLinearGradient(-28, 0, 0, 0);
        g.addColorStop(0, 'rgba(184,116,42,0)'); g.addColorStop(1, 'rgba(245,185,66,0.8)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(0, -R); ctx.lineTo(0, R); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 14; ctx.shadowColor = CN_GOLD;
        const cg = ctx.createRadialGradient(-1, -1, 0, 0, 0, R);
        cg.addColorStop(0, '#fff4c2'); cg.addColorStop(0.5, CN_GOLD); cg.addColorStop(1, CN_BRONZE);
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.rotate(k.t / 90);
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(R + 0.5, 0); ctx.lineTo(R + 2.5, 0); ctx.stroke(); }
        return true;
    }
    if (kind === 'home') {
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(-22, 0, 4, 0);
        g.addColorStop(0, 'rgba(245,185,66,0)'); g.addColorStop(1, '#ffdf8a');
        ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(2, 0); ctx.stroke();
        ctx.shadowBlur = 12; ctx.shadowColor = b.cnStun ? '#ffffff' : CN_GOLD;
        ctx.fillStyle = b.cnStun ? '#ffffff' : CN_GOLD;
        ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-2, -4); ctx.lineTo(0, 0); ctx.lineTo(-2, 4); ctx.closePath(); ctx.fill();
        return true;
    }
    if (kind === 'neo' || kind === 'cone' || kind === 'echo' || kind === 'lotus') {
        const c = kind === 'echo' ? CN_VIOLET : (kind === 'lotus' ? '#ff9ad5' : CN_CYAN);
        const L = kind === 'cone' ? 14 : 18;
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10; ctx.shadowColor = c;
        ctx.strokeStyle = c; ctx.lineWidth = kind === 'cone' ? 4 : 3;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(3, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-L * 0.45, 0); ctx.lineTo(4, 0); ctx.stroke();
        if (kind === 'lotus') { ctx.fillStyle = '#ffd1f0'; ctx.beginPath(); ctx.arc(2, 0, 2.4, 0, Math.PI * 2); ctx.fill(); }
        return true;
    }
    return false;
});

// --- Vẽ thêm trên sân ---
Object.assign(CharHooks.registry.chrononeo, {
    draw() {
        const t = Date.now();
        ctx.save();
        // chớp nòng / nón đạn
        (this.cnFx || []).forEach(f => {
            const a = f.life / f.max;
            if (f.k === 'flash') {
                ctx.globalAlpha = a; ctx.fillStyle = f.c; ctx.shadowBlur = 12; ctx.shadowColor = f.c;
                ctx.beginPath(); ctx.arc(f.x, f.y, (f.big ? 7 : 4) * (0.6 + a * 0.6), 0, Math.PI * 2); ctx.fill();
            } else if (f.k === 'cone') {
                const d = cnDir(this);
                ctx.globalAlpha = a * 0.45; ctx.fillStyle = CN_CYAN;
                ctx.beginPath(); ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x - 70, f.y + d * 110); ctx.lineTo(f.x + 70, f.y + d * 110); ctx.closePath(); ctx.fill();
            }
        });
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        // Neo lướt / tăng tốc: vệt ảnh
        if (this.cnSt === 'neo' && (this.cnBoost > 0 || this.cnDashT > 0)) {
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = CN_CYAN; ctx.lineWidth = 1.5;
            const dir = this.cnFace || 1;
            for (let i = 1; i <= 3; i++) {
                const yy = this.y + this.h * (i / 4);
                ctx.beginPath(); ctx.moveTo(this.x + (dir > 0 ? -2 : this.w + 2), yy); ctx.lineTo(this.x + (dir > 0 ? -10 - i * 3 : this.w + 10 + i * 3), yy); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        // Không Thể Cản Phá
        if (this.cnUnstop > 0) {
            ctx.strokeStyle = '#fff4c2'; ctx.lineWidth = 2; ctx.shadowBlur = 14; ctx.shadowColor = CN_GOLD;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.78, t / 120, t / 120 + 4.6); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Phân Thân Nghịch Đảo
        if (cnFull(this) && Number.isFinite(this.cnTwX) && this.hp > 0) {
            const st = this.cnTwSt || 'neo';
            const cy = this.y + this.h / 2;
            ctx.globalAlpha = 0.25; ctx.strokeStyle = st === 'chrono' ? CN_GOLD : CN_CYAN; ctx.setLineDash([2, 4]);
            ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, cy); ctx.lineTo(this.cnTwX, cy); ctx.stroke();
            ctx.setLineDash([]); ctx.globalAlpha = 1;
            cnDrawGhostTank(this, this.cnTwX, cy, st, 0.8, st === 'chrono' ? CN_GOLD : CN_CYAN);
        }
        // Liên Hoa: hoa sen xoay quanh 2 xe
        if (this.cnLotus > 0) {
            const srcs = [this.x + this.w / 2];
            if (Number.isFinite(this.cnTwX)) srcs.push(this.cnTwX);
            srcs.forEach(x => {
                ctx.save(); ctx.translate(x, this.y + this.h / 2); ctx.rotate(t / 300);
                ctx.globalAlpha = 0.6; ctx.fillStyle = 'rgba(255,154,213,0.35)'; ctx.strokeStyle = '#ffd1f0'; ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    ctx.rotate(Math.PI / 4);
                    ctx.beginPath(); ctx.ellipse(0, -22, 5, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                }
                ctx.restore();
            });
        }
        ctx.restore();
    },

    drawUI() {
        // Băng đạn thế còn lại (nạp ngầm): dải mảnh ngay ngoài dải đạn chung, màu thế kia
        if (this.hp <= 0) return;
        const oSt = this.cnSt === 'chrono' ? 'neo' : 'chrono';
        const oMax = cnMaxOf(this, oSt);
        const y = typeof hudRowY === 'function' ? hudRowY(this, 'extra') + (this.id === 1 ? 1 : -3) : (this.id === 1 ? this.y + this.h + 13 : this.y - 15);
        const x0 = this.x - 2, W = this.w + 4;
        const seg = W / oMax;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x0 - 1, y - 0.5, W + 2, 3);
        const c = oSt === 'chrono' ? CN_GOLD : CN_CYAN;
        for (let i = 0; i < oMax; i++) {
            ctx.fillStyle = i < (this.cnOther || 0) ? c : 'rgba(255,255,255,0.12)';
            ctx.globalAlpha = i < (this.cnOther || 0) ? 0.75 : 1;
            ctx.fillRect(x0 + i * seg + 0.4, y, Math.max(0.6, seg - 0.8), 2);
        }
        ctx.globalAlpha = 1;
        // Điểm Thời Đại: chấm bánh răng nhỏ ở đầu dải (sáng dần theo tiến độ farm)
        const f = cnFull(this) ? 1 : Math.min(1, (this.cnEra || 0) / CN_ERA_MAX);
        const gx = x0 - 6, gy = y + 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = this.cnLvlFlash > 0 ? '#ffffff' : CN_GOLD;
        ctx.beginPath(); ctx.arc(gx, gy, 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.03, f)); ctx.stroke();
        ctx.restore();
    },
});

// --- HUD vòng cạnh xe + nút Bắn ---
let CN_GLYPH_PCT = 0, CN_GLYPH_ST = 'chrono';
function cnRegisterHUD() {
    if (typeof HUD_GLYPH !== 'undefined') {
        HUD_GLYPH.cnGlass = (x, y) => { // đồng hồ cát, cát chảy theo tiến độ Thời Khắc
            const f = CN_GLYPH_PCT;
            ctx.beginPath(); ctx.moveTo(x - 3.2, y - 4); ctx.lineTo(x + 3.2, y - 4); ctx.lineTo(x - 3.2, y + 4); ctx.lineTo(x + 3.2, y + 4); ctx.closePath(); ctx.stroke();
            const top = (1 - f) * 2.6, bot = f * 2.6;
            if (top > 0.1) { ctx.beginPath(); ctx.moveTo(x - top, y - top - 0.3); ctx.lineTo(x + top, y - top - 0.3); ctx.lineTo(x, y - 0.3); ctx.closePath(); ctx.fill(); }
            if (bot > 0.1) { ctx.beginPath(); ctx.moveTo(x - bot * 1.2, y + 3.6); ctx.lineTo(x + bot * 1.2, y + 3.6); ctx.lineTo(x, y + 3.6 - bot); ctx.closePath(); ctx.fill(); }
        };
        HUD_GLYPH.cnSwap = (x, y) => { // 2 mũi tên đổi thế
            ctx.beginPath(); ctx.moveTo(x - 4, y - 1.5); ctx.lineTo(x + 3, y - 1.5); ctx.moveTo(x + 1, y - 3.5); ctx.lineTo(x + 3, y - 1.5); ctx.lineTo(x + 1, y + 0.5);
            ctx.moveTo(x + 4, y + 2); ctx.lineTo(x - 3, y + 2); ctx.moveTo(x - 1, y); ctx.lineTo(x - 3, y + 2); ctx.lineTo(x - 1, y + 4); ctx.stroke();
        };
    }
    registerEmpowerHUD('chrononeo', p => {
        const chrono = p.cnSt === 'chrono';
        const color = chrono ? CN_GOLD : CN_CYAN;
        const max = cnGlassMax(p);
        const pct = Math.min(1, (p.cnGlass || 0) / max);
        CN_GLYPH_PCT = pct; CN_GLYPH_ST = p.cnSt;
        const lotus = cnFull(p) ? { pips: p.cnEmpCount || 0, pipMax: 2, pipColor: '#ff9ad5' } : {};
        if (p.cnHold > 4 && p.cnHold < CN_HOLD) {
            return Object.assign({ pct: p.cnHold / CN_HOLD, ready: false, color: chrono ? CN_CYAN : CN_GOLD, icon: 'cnSwap', btnIcon: chrono ? '⚡' : '🕰️', label: '⇄' }, lotus);
        }
        const base = { pct, ready: pct >= 1, color: pct >= 1 ? '#fff4c2' : color, icon: 'cnGlass', btnIcon: pct >= 1 ? '⏳' : (chrono ? '🕰️' : '⚡'),
            label: (chrono ? 'CHRONO' : 'NEO') + (p.cnSwCd > 0 ? ' ' + (p.cnSwCd / 60).toFixed(1) + 's' : ' ⇄') };
        if (p.cnLotus > 0) { base.btnIcon = '🪷'; base.label = 'LIÊN HOA'; }
        return Object.assign(base, lotus);
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', cnRegisterHUD);
