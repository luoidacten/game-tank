// ==========================================
// Raven - Oca (raven_oca) — Hình ảnh
// Xe tàng hình than chì viền neon (Tiểu Liên: nòng đôi ngắn + trống đạn cyan / Sniper: nòng dài + ống ngắm hồng),
// Oca chim săn cơ khí, Bom Khói, tia ngắm, dấu radar, bom Oca, vệt đạn; HUD trên nút Bắn & vòng hồi chiêu.
// Chỉ đọc state trên player -> guest online thấy giống host.
// ==========================================

registerTankArt('raven_oca', (p, k) => {
    const t = k.t;
    const sn = p.rvMode === 'sniper';
    const acc = sn ? RV_PINK : RV_CYAN;
    const kick = (p.rvKick || 0) * 0.35;
    // Bánh xích mảnh
    TA.treads(-15, 4, -11, 13, t, '#0b1020', '#334155');
    // Nòng (sau thân để chân nòng bị thân che)
    if (sn) {
        TA.barrel(0, -6 + kick, 10, 2.6, '#e2e8f0', RV_PINK);
        // ống giảm thanh & ống ngắm
        ctx.fillStyle = '#111827'; TA.rr(-1.9, -15 + kick, 3.8, 3, 1); ctx.fill();
        ctx.fillStyle = '#1f2937'; TA.rr(2.2, -9 + kick, 2.6, 6, 1.2); ctx.fill();
        ctx.fillStyle = RV_PINK; TA.glow(RV_PINK, 6);
        ctx.beginPath(); ctx.arc(3.5, -9.2 + kick, 1, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    } else {
        TA.barrel(-2.2, -6 + kick, 7, 2.2, '#cbd5e1', RV_CYAN);
        TA.barrel(2.2, -6 + kick, 7, 2.2, '#cbd5e1', RV_CYAN);
    }
    // Thân: khối tàng hình góc cạnh hình cánh quạ
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-12, 12, '#0f172a', '#334155');
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(6, -8); ctx.lineTo(12.5, -2); ctx.lineTo(11, 8); ctx.lineTo(6, 12.5);
    ctx.lineTo(0, 10.5); ctx.lineTo(-6, 12.5); ctx.lineTo(-11, 8); ctx.lineTo(-12.5, -2); ctx.lineTo(-6, -8);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    // Lông vũ giáp (vạch neon xếp lớp) — Evo 1: răng cưa vàng
    ctx.strokeStyle = acc; ctx.lineWidth = 1; ctx.globalAlpha = 0.85;
    [-1, 1].forEach(sd => {
        ctx.beginPath();
        ctx.moveTo(sd * 4, -5); ctx.lineTo(sd * 10.5, -1);
        ctx.moveTo(sd * 4.5, 0); ctx.lineTo(sd * 10, 4.5);
        ctx.moveTo(sd * 4.5, 5); ctx.lineTo(sd * 8, 9.5);
        ctx.stroke();
        if (k.evo1) {
            ctx.fillStyle = '#fde047';
            for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sd * 12.4, -1 + i * 3); ctx.lineTo(sd * 14, 0.4 + i * 3); ctx.lineTo(sd * 12, 1.6 + i * 3); ctx.fill(); }
        }
    });
    ctx.globalAlpha = 1;
    // Evo 2: hai ống bom trên vai
    if (k.evo2) {
        [-1, 1].forEach(sd => {
            ctx.fillStyle = '#1e293b'; TA.rr(sd * 8 - 1.8, 6, 3.6, 5, 1.2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.fillRect(sd * 8 - 1.2, 6.4, 2.4, 1.2);
        });
    }
    // Tháp: đầu quạ với mắt neon
    const tg = ctx.createRadialGradient(-1, -1, 0.5, 0, 0.5, 6.2);
    tg.addColorStop(0, '#475569'); tg.addColorStop(1, '#0b1120');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(0, -6.5); ctx.lineTo(5.2, -1); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.lineTo(-5.2, -1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = acc; TA.glow(acc, 8);
    const blink = (t % 3) < 0.1 ? 0.3 : 1;
    ctx.beginPath(); ctx.ellipse(-2, -1.2, 1.3, 0.8 * blink, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, -1.2, 1.3, 0.8 * blink, 0.4, 0, Math.PI * 2); ctx.fill();
    TA.noGlow();
    // Lõi đội phía sau
    ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 8, 1.5, 0, Math.PI * 2); ctx.fill();
    // Full Evo: lông vũ năng lượng hai bên
    if (k.full) {
        ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 5);
        ctx.fillStyle = RV_VIOLET; TA.glow(RV_VIOLET, 8);
        [-1, 1].forEach(sd => {
            ctx.beginPath(); ctx.moveTo(sd * 11, 2); ctx.lineTo(sd * 15.5, 9); ctx.lineTo(sd * 10, 7); ctx.closePath(); ctx.fill();
        });
        TA.noGlow(); ctx.globalAlpha = 1;
    }
});

// Đạn: Tiểu Liên = vệt cyan ngắn, Sniper = tia hồng dài lõi trắng (khóa radar: vòng xoắn tím)
registerBulletArt('raven_oca', (b, color, owner, k) => {
    if (b.rvKind === 'sniper') {
        let L = 46;
        if (typeof b.rvSX === 'number') L = Math.min(L, Math.hypot(b.x + b.w / 2 - b.rvSX, b.y + b.h / 2 - b.rvSY));
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const g = ctx.createLinearGradient(-L, 0, 6, 0);
        g.addColorStop(0, 'rgba(244,114,182,0)'); g.addColorStop(1, b.rvMarkedShot ? '#c084fc' : RV_PINK);
        ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.shadowBlur = 14; ctx.shadowColor = RV_PINK;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(7, 0); ctx.stroke();
        if (b.rvMarkedShot) {
            ctx.strokeStyle = 'rgba(167,139,250,0.8)'; ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = -L * 0.8; x <= 4; x += 2) ctx.lineTo(x, Math.sin(x * 0.6 + k.t / 30) * 3);
            ctx.stroke();
        }
        return true;
    }
    ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(-14, 0, 4, 0);
    g.addColorStop(0, 'rgba(34,211,238,0)'); g.addColorStop(1, RV_CYAN);
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.shadowBlur = 8; ctx.shadowColor = RV_CYAN;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ecfeff';
    ctx.beginPath(); ctx.ellipse(2, 0, 2.6, 1.3, 0, 0, Math.PI * 2); ctx.fill();
    if (owner && rvE1(owner)) { ctx.fillStyle = '#fde047'; ctx.fillRect(-1, -2.2, 1.4, 1.2); ctx.fillRect(-1, 1, 1.4, 1.2); }
    return true;
});

// Oca: chim săn cơ khí (vẽ ở toạ độ sân)
function rvDrawOca(p, alpha) {
    const x = p.rvOcaX, y = p.rvOcaY;
    const t = Date.now() / 1000;
    const diving = p.rvOcaSt === 'dive';
    const flap = Math.sin((p.rvOcaFlap || 0) * (diving ? 0.1 : 0.35));
    const e = rvEnemy(p);
    // hướng mũi: lao -> về phía địch; bay lượn -> về phía sân địch
    let ang = rvDir(p) < 0 ? -Math.PI / 2 : Math.PI / 2;
    if (diving && e) ang = Math.atan2(e.y + e.h / 2 - y, e.x + e.w / 2 - x);
    ang += Math.max(-0.5, Math.min(0.5, (p.rvOcaFace || 0) * 0.4));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(1.3, 1.3); // +y hình = đuôi
    const col = rvFull(p) ? '#e9d5ff' : RV_VIOLET;
    const hurt = p.rvOcaHurt > 0;
    // vệt lao
    if (diving) {
        const g = ctx.createLinearGradient(0, 0, 0, 30);
        g.addColorStop(0, 'rgba(34,211,238,0.6)'); g.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5, 2); ctx.lineTo(5, 2); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur = 10; ctx.shadowColor = col;
    // cánh (gập khi lao)
    const span = diving ? 6 : 11, lift = flap * 4;
    ctx.fillStyle = hurt ? '#ffffff' : '#1e1b4b';
    ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    [-1, 1].forEach(sd => {
        ctx.beginPath();
        ctx.moveTo(sd * 2, -2);
        ctx.lineTo(sd * span, -3 - lift); ctx.lineTo(sd * (span + 1), 1 - lift * 0.4);
        ctx.lineTo(sd * (span - 3), 2); ctx.lineTo(sd * (span - 5), 4.5); ctx.lineTo(sd * 2, 3);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    // thân + đuôi
    ctx.fillStyle = hurt ? '#ffffff' : '#312e81';
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(2.4, -2); ctx.lineTo(1.8, 4); ctx.lineTo(3.5, 8); ctx.lineTo(0, 6.5); ctx.lineTo(-3.5, 8); ctx.lineTo(-1.8, 4); ctx.lineTo(-2.4, -2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    // mắt
    ctx.fillStyle = p.rvMode === 'sniper' ? RV_PINK : RV_CYAN;
    ctx.beginPath(); ctx.arc(0, -4, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Thanh máu nhỏ (Full Evo: biểu tượng vô hạn)
    if (alpha > 0.5) {
        ctx.save();
        const by = y + (rvDir(p) < 0 ? 13 : -15);
        if (rvFull(p)) {
            ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.ellipse(x - 2.5, by + 1, 2.5, 1.6, 0, 0, Math.PI * 2); ctx.ellipse(x + 2.5, by + 1, 2.5, 1.6, 0, 0, Math.PI * 2); ctx.stroke();
        } else {
            const k = Math.max(0, p.rvOcaHp / Math.max(0.01, p.rvOcaMaxHp));
            ctx.fillStyle = 'rgba(6,10,20,0.8)'; ctx.fillRect(x - 11, by, 22, 3);
            ctx.fillStyle = k > 0.5 ? RV_VIOLET : '#f87171'; ctx.fillRect(x - 10.5, by + 0.5, 21 * k, 2);
        }
        ctx.restore();
    }
}

function rvIsMine(p) {
    const online = typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline;
    return !online || (onlineManager.role === 'host' ? p.id === 1 : p.id === 2);
}

Object.assign(CharHooks.registry.raven_oca, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now();
        ctx.save();
        // Bom Khói
        if (this.rvSmokeT > 0) {
            const a = Math.min(1, this.rvSmokeT / 30) * Math.min(1, (this.rvSmokeMaxT - this.rvSmokeT + 6) / 12);
            ctx.globalAlpha = a;
            for (let i = 0; i < 9; i++) {
                const ox = Math.sin(i * 2.3 + t / 700) * RV_SMOKE_W * 0.65, oy = Math.cos(i * 1.7 + t / 900) * RV_SMOKE_H * 0.55;
                const r = 16 + (i % 3) * 5;
                const g = ctx.createRadialGradient(this.rvSmokeX + ox, this.rvSmokeY + oy, 0, this.rvSmokeX + ox, this.rvSmokeY + oy, r);
                g.addColorStop(0, 'rgba(148,163,184,0.55)'); g.addColorStop(1, 'rgba(100,116,139,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.rvSmokeX + ox, this.rvSmokeY + oy, r, 0, Math.PI * 2); ctx.fill();
            }
            // viền vùng + thời gian còn lại
            ctx.strokeStyle = 'rgba(203,213,225,0.35)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(this.rvSmokeX, this.rvSmokeY, RV_SMOKE_W, RV_SMOKE_H, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(226,232,240,0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.rvSmokeX, this.rvSmokeY, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.rvSmokeT / this.rvSmokeMaxT); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Bóng lướt
        (this.rvFx || []).forEach(f => {
            if (f.k === 'ghost') {
                ctx.globalAlpha = 0.35 * f.life / f.max;
                ctx.fillStyle = RV_CYAN; TA.rr(f.x + 3, f.y + 3, this.w - 6, this.h - 6, 4); ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        // Vòng giữ nút đổi súng
        if (this.rvHold > 4 && this.rvHold < RV_HOLD) {
            const nextC = this.rvMode === 'smg' ? RV_PINK : RV_CYAN;
            ctx.strokeStyle = this.rvSwCd > 0 ? '#64748b' : nextC; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.rvHold / RV_HOLD); ctx.stroke();
        }
        if (this.rvSwFlash > 0) {
            ctx.globalAlpha = this.rvSwFlash / 14;
            ctx.strokeStyle = this.rvMode === 'sniper' ? RV_PINK : RV_CYAN; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (1.3 - this.rvSwFlash / 28), 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Tia ngắm Sniper
        if (this.rvAimT > 0) {
            const m = rvMuzzle(this), e = rvEnemy(this);
            const marked = rvMarked(this);
            const prog = 1 - this.rvAimT / RV_AIM;
            let tx = m.x, ty = rvDir(this) < 0 ? 0 : canvas.height;
            if (marked && e) { tx = e.x + e.w / 2; ty = e.y + e.h / 2; }
            ctx.strokeStyle = `rgba(244,114,182,${0.25 + 0.6 * prog})`;
            ctx.lineWidth = 0.8 + prog * 1.6;
            ctx.setLineDash(prog > 0.7 ? [] : [6, 5]);
            ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = RV_PINK; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
        }
        // Lửa đầu nòng, sóng xung kích, dấu trúng
        (this.rvFx || []).forEach(f => {
            const a = f.life / f.max;
            if (f.k === 'flash') {
                ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
                const R = (f.big ? 13 : 7) * (0.5 + 0.6 * a);
                const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
                g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, f.c); g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            } else if (f.k === 'wave') {
                ctx.globalAlpha = a; ctx.strokeStyle = RV_CYAN; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(f.x, f.y, 10 + (1 - a) * 40, 6 + (1 - a) * 18, 0, 0, Math.PI * 2); ctx.stroke();
            } else if (f.k === 'hitmark') {
                ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
                const r = 6 + (1 - a) * 6;
                ctx.beginPath();
                [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { ctx.moveTo(f.x + sx * r, f.y + sy * r); ctx.lineTo(f.x + sx * (r + 5), f.y + sy * (r + 5)); });
                ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    drawUI() {
        const e = rvEnemy(this);
        const t = Date.now();
        ctx.save();
        // Bom Oca: vòng cảnh báo đỏ + quả bom rơi
        (this.rvBombs || []).forEach(bm => {
            const k = 1 - bm.t / bm.max;
            ctx.strokeStyle = `rgba(255,60,60,${0.45 + 0.5 * k})`; ctx.fillStyle = `rgba(255,60,60,${0.08 + 0.18 * k})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(bm.x, bm.y, 30, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(bm.x, bm.y, 30 * k, 22 * k, 0, 0, Math.PI * 2); ctx.stroke();
            const bx = bm.sx + (bm.x - bm.sx) * k, by = bm.sy + (bm.y - bm.sy) * k * k;
            ctx.fillStyle = '#111827'; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = (t % 200 < 100) ? '#ff3b3b' : '#fde047'; ctx.beginPath(); ctx.arc(bx, by - 4, 1.4, 0, Math.PI * 2); ctx.fill();
        });
        // Oca
        if (this.rvOcaSt !== 'dead') {
            const hidden = rvOcaHidden(this);
            if (!hidden) rvDrawOca(this, 1);
            else if (rvIsMine(this)) {
                // Tàng hình: chỉ chủ nhân thấy bóng mờ lấp lánh
                rvDrawOca(this, 0.22 + 0.06 * Math.sin(t / 150));
            }
            // Sóng radar & dấu đánh dấu mục tiêu
            if (rvMarked(this) && e && !(hidden && !rvIsMine(this))) {
                const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
                const ph = (t % 1200) / 1200;
                ctx.strokeStyle = `rgba(167,139,250,${0.5 * (1 - ph)})`; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(this.rvOcaX, this.rvOcaY, 10 + ph * 40, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([2, 6]); ctx.lineDashOffset = -t / 30;
                ctx.strokeStyle = 'rgba(167,139,250,0.35)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(this.rvOcaX, this.rvOcaY); ctx.lineTo(ex, ey); ctx.stroke();
                ctx.setLineDash([]);
                // tâm khóa xoay trên đầu địch
                ctx.save();
                ctx.translate(ex, ey); ctx.rotate(t / 500);
                ctx.strokeStyle = RV_VIOLET; ctx.shadowBlur = 8; ctx.shadowColor = RV_VIOLET; ctx.lineWidth = 1.6;
                const R = e.w * 0.75 + Math.sin(t / 160) * 1.5;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath(); ctx.arc(0, 0, R, i * Math.PI / 2 + 0.2, i * Math.PI / 2 + 1.1); ctx.stroke();
                }
                ctx.rotate(-t / 250);
                ctx.beginPath(); ctx.moveTo(0, -R - 5); ctx.lineTo(-3, -R - 10); ctx.lineTo(3, -R - 10); ctx.closePath();
                ctx.fillStyle = RV_VIOLET; ctx.fill();
                ctx.restore();
            }
        } else if (rvIsMine(this)) {
            // Oca hồi sinh: vòng tiến trình ở giữa sân
            const k = 1 - this.rvOcaRespawn / 420;
            const x = this.x + this.w / 2, y = canvas.height / 2;
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = 'rgba(167,139,250,0.25)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = RV_VIOLET;
            ctx.beginPath(); ctx.arc(x, y, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            ctx.fillStyle = RV_VIOLET;
            ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 3.5, y + 2); ctx.lineTo(x, y + 0.5); ctx.lineTo(x - 3.5, y + 2); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
        }
        // Trọng Thương: phần máu bị khóa xám trên đầu địch
        if (this.rvGwT > 0 && e && e.hp > 0) {
            const k = Math.min(1, this.rvGwLock / e.maxHp);
            const W = 30, x0 = e.x + e.w / 2 - W / 2;
            const y0 = e.id === 1 ? e.y - 7 : e.y + e.h + 4;
            ctx.fillStyle = 'rgba(6,10,20,0.8)'; ctx.fillRect(x0 - 1, y0 - 1, W + 2, 4);
            ctx.fillStyle = '#64748b'; ctx.fillRect(x0 + W * (1 - k), y0, W * k, 2);
            ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x0 + W * (1 - k), y0, W * k * this.rvGwT / RV_GW_TICKS, 0.8);
        }
        ctx.restore();
    },
});

// HUD chung (tank-hud.js / empower-hud.js) nạp sau file body -> đăng ký khi trang tải xong
function rvRegisterHUD() {
// --- Biểu tượng vector cho HUD (vòng cạnh xe) ---
if (typeof HUD_GLYPH !== 'undefined') {
    HUD_GLYPH.rvSmg = (x, y) => { // 3 viên đạn loạt
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x + i * 2.6, y, 0.9, 2.8, 0, 0, Math.PI * 2); ctx.fill(); }
    };
    HUD_GLYPH.rvSniper = (x, y) => { // tâm ngắm
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.moveTo(x - 4.5, y); ctx.lineTo(x - 1.5, y); ctx.moveTo(x + 1.5, y); ctx.lineTo(x + 4.5, y);
        ctx.moveTo(x, y - 4.5); ctx.lineTo(x, y - 1.5); ctx.moveTo(x, y + 1.5); ctx.lineTo(x, y + 4.5);
        ctx.stroke();
    };
}
// Chip trạng thái "Trọng Thương" trên xe trúng Sniper Evo 2
if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(p => {
        const r = p === p1 ? p2 : p1;
        if (!r || r.weapon !== 'raven_oca' || !(r.rvGwT > 0)) return null;
        return { g: 'drop', c: '#94a3b8', l: 'KHÓA HỒI', t: (r.rvGwT / 60).toFixed(1) };
    });
}

// Nút Bắn: biểu tượng súng đang cầm + vòng hồi chiêu Linh Hoạt (giữ nút -> vòng tiến trình đổi súng)
registerEmpowerHUD('raven_oca', p => {
    const sn = p.rvMode === 'sniper';
    const color = sn ? RV_PINK : RV_CYAN;
    const icon = sn ? 'rvSniper' : 'rvSmg';
    const btnIcon = sn ? '🎯' : '🔫';
    const ocaPip = { pips: rvOcaAlive(p) ? 1 : 0, pipMax: 1, pipColor: RV_VIOLET };
    if (p.rvAimT > 0) return Object.assign({ pct: 1 - p.rvAimT / RV_AIM, ready: false, color: RV_PINK, icon, btnIcon, label: 'NGẮM' }, ocaPip);
    if (p.rvSwCd > 0) {
        const mx = rvSwitchMax(p);
        return Object.assign({ pct: 1 - p.rvSwCd / mx, ready: false, color, icon, btnIcon, label: (p.rvSwCd / 60).toFixed(1) + 's' }, ocaPip);
    }
    if (p.rvHold > 4 && p.rvHold < RV_HOLD) {
        return Object.assign({ pct: p.rvHold / RV_HOLD, ready: false, color: sn ? RV_CYAN : RV_PINK, icon: sn ? 'rvSmg' : 'rvSniper', btnIcon: sn ? '🔫' : '🎯', label: '⇄' }, ocaPip);
    }
    return Object.assign({ pct: 1, ready: false, color, icon, btnIcon, label: sn ? 'SNIPER ⇄' : 'TIỂU LIÊN ⇄' }, ocaPip);
});
}
if (typeof window !== 'undefined') window.addEventListener('load', rvRegisterHUD);
