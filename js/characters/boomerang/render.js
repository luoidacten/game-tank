// ==========================================
// Boomerang (boomerang) — Hình ảnh: xe thợ săn xanh lục neon với 2 giá gắn boomerang (trái: Trọng Luân chữ V,
// phải: Nguyệt Luân lưỡi liềm) cho biết chiếc nào đang trên tay; boomerang xoay, lốc xoáy phóng to, vạch chỉ
// đường xanh lá khi bay về, Bão Kiếm Khí, HUD, kết liễu "KHÔNG LỐI THOÁT". Chỉ đọc state -> an toàn online.
// ==========================================

function bmNow() { return Date.now() / 1000; }

// Boomerang chữ V (Trọng Luân) tâm (0,0), cỡ s
function bmShapeV(s, col, glow) {
    if (glow) TA.glow(col, glow);
    const g = ctx.createLinearGradient(-s, 0, s, 0);
    g.addColorStop(0, '#065f46'); g.addColorStop(0.5, col); g.addColorStop(1, '#065f46');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.55);
    ctx.quadraticCurveTo(-s * 0.55, -s * 0.35, 0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.35, s, s * 0.55);
    ctx.quadraticCurveTo(s * 0.82, s * 0.7, s * 0.68, s * 0.5);
    ctx.quadraticCurveTo(s * 0.32, -s * 0.05, 0, -s * 0.08);
    ctx.quadraticCurveTo(-s * 0.32, -s * 0.05, -s * 0.68, s * 0.5);
    ctx.quadraticCurveTo(-s * 0.82, s * 0.7, -s, s * 0.55);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = 'rgba(236, 253, 245, 0.85)'; ctx.lineWidth = Math.max(0.5, s * 0.08); ctx.stroke();
    ctx.fillStyle = '#ecfdf5'; ctx.beginPath(); ctx.arc(0, -s * 0.28, s * 0.1, 0, Math.PI * 2); ctx.fill();
}
// Boomerang lưỡi liềm (Nguyệt Luân)
function bmShapeC(s, col, glow) {
    if (glow) TA.glow(col, glow);
    const g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, '#ecfeff'); g.addColorStop(0.5, col); g.addColorStop(1, '#155e75');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, s, -Math.PI * 0.85, Math.PI * 0.85);
    ctx.arc(-s * 0.45, 0, s * 0.72, Math.PI * 0.72, -Math.PI * 0.72, true);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = 'rgba(236, 254, 255, 0.85)'; ctx.lineWidth = Math.max(0.5, s * 0.08); ctx.stroke();
}

// ---------- Xe ----------
registerTankArt('boomerang', (p, k) => {
    const t = k.t, buff = (p.bmBuffT || 0) > 0;
    TA.treads(-15.5, 5, -12, 13, t, '#0b1f17', '#166534');
    // thân lục giác xanh rừng
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#064e3b', '#10b981');
    ctx.beginPath(); ctx.moveTo(-10.5, -6); ctx.lineTo(-6, -11); ctx.lineTo(6, -11); ctx.lineTo(10.5, -6); ctx.lineTo(10.5, 9); ctx.lineTo(6, 12); ctx.lineTo(-6, 12); ctx.lineTo(-10.5, 9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // vân gió
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 3, 6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 3, 3.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    // lõi xoay giữa
    const core = ctx.createRadialGradient(0, 0, 0.5, 0, 0, 5.5);
    core.addColorStop(0, '#f0fdf4'); core.addColorStop(0.5, buff ? BM_GOLD : BM_GREEN); core.addColorStop(1, '#064e3b');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.rotate(t * 5);
    ctx.strokeStyle = '#ecfdf5'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2.5, -1.5, 3.8, -3.6); ctx.stroke(); }
    ctx.restore();
    // 2 giá gắn: trái = Thẳng, phải = Vòng Cung
    const mounts = [
        { x: -7, st: p.bmSSt, cd: p.bmSCd, max: (p.bmSCd || 0) > 60 ? (k.evo1 ? 270 : 480) : 30, col: BM_GREEN, sh: bmShapeV },
        { x: 7, st: p.bmCSt, cd: p.bmCCd, max: (p.bmCCd || 0) > 6 ? BM_CURVE_MISS_CD : 6, col: BM_CYAN, sh: bmShapeC },
    ];
    mounts.forEach((m, i) => {
        const sel = (p.bmSel || 0) === i;
        ctx.save(); ctx.translate(m.x, -12.5);
        // giá đỡ
        ctx.fillStyle = '#022c22'; TA.rr(-4.5, -1, 9, 4, 1.2); ctx.fill();
        if (sel) { ctx.strokeStyle = m.col; ctx.lineWidth = 0.9; TA.glow(m.col, 6); TA.rr(-5.5, -7.5, 11, 11, 3); ctx.stroke(); TA.noGlow(); }
        if (m.st === 'hand') {
            ctx.rotate(i ? Math.sin(t * 3) * 0.15 : 0);
            m.sh(i ? 4.2 : 5, m.col, sel ? 8 : 3);
        } else {
            ctx.globalAlpha = 0.45; ctx.strokeStyle = m.col; ctx.lineWidth = 0.7; ctx.setLineDash([1.2, 1.2]);
            ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
            if (m.st === 'cd' && m.cd > 0) {
                ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(0, -2, 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - m.cd / m.max)); ctx.stroke();
            }
        }
        ctx.restore();
    });
    if (k.evo2) { ctx.fillStyle = BM_TEAL; TA.rr(-16, -2, 3, 6, 1); ctx.fill(); TA.rr(13, -2, 3, 6, 1); ctx.fill(); }
    if (k.full) {
        ctx.strokeStyle = `rgba(74, 222, 128, ${0.45 + 0.35 * Math.sin(t * 4)})`; ctx.lineWidth = 1.1; TA.glow(BM_GREEN, 8);
        ctx.beginPath(); ctx.arc(0, 1, 13.5, t * 2, t * 2 + Math.PI * 0.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 1, 13.5, t * 2 + Math.PI, t * 2 + Math.PI * 1.7); ctx.stroke(); TA.noGlow();
    }
});

// ---------- Chiếc Thẳng ----------
function bmDrawStraight(b) {
    const o = bmTeam(b.team), t = bmNow();
    ctx.save();
    // vạch chỉ đường xanh lá (trục x cố định) — đậm hơn khi bay về
    if (o && o.hp > 0) {
        const oy = o.y + o.h / 2, a = b.st === 'ret' ? 0.55 : (b.st === 'spin' ? 0.28 : 0.14);
        ctx.strokeStyle = `rgba(74, 222, 128, ${a})`; ctx.lineWidth = 2; ctx.setLineDash([6, 7]);
        ctx.lineDashOffset = (b.st === 'ret' ? 1 : -1) * t * 40 * b.dir;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, oy); ctx.stroke(); ctx.setLineDash([]);
        // điểm đón trên làn mình
        ctx.strokeStyle = `rgba(134, 239, 172, ${a + 0.15})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(b.x, oy, 16, 5, 0, 0, Math.PI * 2); ctx.stroke();
        if (b.st === 'ret') {
            ctx.fillStyle = `rgba(74, 222, 128, ${0.1 + 0.08 * Math.sin(t * 12)})`;
            ctx.fillRect(b.x - 14, Math.min(b.y, oy), 28, Math.abs(oy - b.y));
        }
    }
    if (b.st === 'spin') {
        // lốc xoáy cưa gió r=55
        const r = b.r;
        const g = ctx.createRadialGradient(b.x, b.y, r * 0.15, b.x, b.y, r);
        g.addColorStop(0, 'rgba(240, 253, 244, 0.35)'); g.addColorStop(0.6, 'rgba(74, 222, 128, 0.16)'); g.addColorStop(1, 'rgba(16, 185, 129, 0.03)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.75)'; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = BM_GREEN;
        for (let i = 0; i < 3; i++) {
            const a0 = b.ang * (1 + i * 0.25) + i * 2.1, rr = r * (0.55 + i * 0.2);
            ctx.beginPath(); ctx.arc(b.x, b.y, rr, a0, a0 + Math.PI * 0.9); ctx.stroke();
        }
        ctx.shadowBlur = 0;
        if (o && bmE2(o)) { // xé giáp: vòng gai đỏ cam
            ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]); ctx.lineDashOffset = -t * 50;
            ctx.beginPath(); ctx.arc(b.x, b.y, r - 3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
        // thanh thời gian xoay
        const k = 1 - b.spinT / b.spinMax;
        ctx.strokeStyle = b.combo ? BM_GOLD : '#bbf7d0'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(b.x, b.y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    }
    // thân boomerang (vệt mờ khi bay)
    const s = b.st === "spin" ? Math.min(30, 13 + b.r * 0.32) : 13 + (b.r - BM_R0) * 0.3;
    if (b.st !== 'spin') {
        ctx.globalAlpha = 0.25;
        for (let i = 1; i <= 2; i++) { ctx.save(); ctx.translate(b.x, b.y - (b.st === 'out' ? b.dir : -b.dir) * i * 9); ctx.rotate(b.ang - i * 0.5); bmShapeV(s, BM_GREEN, 0); ctx.restore(); }
        ctx.globalAlpha = 1;
    }
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang); bmShapeV(s, BM_GREEN, 12); ctx.restore();
    ctx.restore();
}

// ---------- Chiếc Vòng Cung (quỹ đạo elip báo trước) ----------
function bmDrawCurve(b) {
    const t = bmNow(), TAU = Math.PI * 2;
    ctx.save();
    // cả elip: nét đứt mờ cho địch đọc đường né
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.16)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.ellipse(b.x0, b.cy, Math.max(1, b.b), Math.abs(b.ay), 0, 0, TAU); ctx.stroke();
    // phần còn lại phía trước: sáng hơn, nét đứt chạy theo hướng bay
    const th0 = b.th || 0, n = 40;
    ctx.strokeStyle = th0 < Math.PI ? 'rgba(103, 232, 249, 0.5)' : 'rgba(103, 232, 249, 0.38)';
    ctx.lineWidth = 2; ctx.lineDashOffset = -t * 40; ctx.shadowBlur = 6; ctx.shadowColor = BM_CYAN;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
        const th = th0 + (TAU - th0) * i / n, p = b.pos(th);
        const x = p.x + (i === 0 ? (b.bend || 0) : 0);
        if (i === 0) ctx.moveTo(b.x, b.y); else ctx.lineTo(x, p.y);
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
    // đỉnh ném (điểm đón): vòng đánh dấu
    const o = bmTeam(b.team);
    const cr = o ? bmCurveCatchR(o) * 0.6 + 8 : 16, ret = th0 > Math.PI;
    ctx.strokeStyle = `rgba(165, 243, 252, ${ret ? 0.55 + 0.25 * Math.sin(t * 10) : 0.3})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(b.x0 + (b.bend || 0), b.y0, cr, cr * 0.38, 0, 0, TAU); ctx.stroke();
    // vệt mờ phía sau
    ctx.globalAlpha = 0.22;
    for (let i = 1; i <= 3; i++) {
        const p = b.pos(Math.max(0, th0 - i * 0.07));
        ctx.save(); ctx.translate(p.x + (b.bend || 0), p.y); ctx.rotate(b.ang - i * 0.4 * b.side); bmShapeC(9, BM_CYAN, 0); ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang); bmShapeC(10, BM_CYAN, 12); ctx.restore();
    ctx.restore();
}

// ---------- Bão Kiếm Khí ----------
function bmDrawBlast(f) {
    const k = f.t / f.dur;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = BM_GOLD; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = BM_GREEN;
    ctx.beginPath(); ctx.arc(f.x, f.y, BM_CROSS_R * Math.min(1, k * 2.5), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ecfdf5'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + k * 3, r0 = 20 + k * 40, r1 = r0 + 40;
        ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.quadraticCurveTo(f.x + Math.cos(a + 0.4) * (r0 + 20), f.y + Math.sin(a + 0.4) * (r0 + 20), f.x + Math.cos(a + 0.6) * r1, f.y + Math.sin(a + 0.6) * r1); ctx.stroke();
    }
    ctx.restore();
}
function bmDrawCatch(f) {
    const k = f.t / f.dur, col = f.kind ? BM_CYAN : BM_GREEN;
    ctx.save();
    // chớp sáng + 2 vòng lan
    if (k < 0.25) { ctx.globalAlpha = (0.25 - k) * 3; ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.arc(f.x, f.y, 26, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1 - k;
    ctx.shadowBlur = 14; ctx.shadowColor = col;
    ctx.strokeStyle = col; ctx.lineWidth = 3 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(f.x, f.y, 10 + 34 * Math.sqrt(k), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = BM_GOLD; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(f.x, f.y, 6 + 52 * k, 0, Math.PI * 2); ctx.stroke();
    // lấp lánh hình sao 4 cánh bay ra
    ctx.fillStyle = '#fefce8';
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + f.seed, r = 12 + 30 * k + (i % 2) * 8, s = (i % 2 ? 2.4 : 3.6) * (1 - k * 0.7);
        const x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(x, y - s * 1.6); ctx.lineTo(x + s * 0.4, y - s * 0.4); ctx.lineTo(x + s * 1.6, y); ctx.lineTo(x + s * 0.4, y + s * 0.4);
        ctx.lineTo(x, y + s * 1.6); ctx.lineTo(x - s * 0.4, y + s * 0.4); ctx.lineTo(x - s * 1.6, y); ctx.lineTo(x - s * 0.4, y - s * 0.4); ctx.closePath(); ctx.fill();
    }
    // chữ "BẮT!" bật nảy
    const pop = k < 0.2 ? 0.6 + k * 4 : 1.4 - Math.min(0.4, (k - 0.2) * 1.2);
    const ty = f.y + (f.team === 1 ? -54 : 58) - k * 12 * (f.team === 1 ? 1 : -1);
    ctx.font = `900 ${Math.round(15 * pop)}px 'Orbitron', Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = f.kind ? '#cffafe' : '#fef9c3';
    ctx.shadowBlur = 12; ctx.shadowColor = col;
    drawWorldText(ctx, 'BẮT!', f.x, ty);
    ctx.restore();
}
function bmDrawBlade(b) {
    ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate((b.bmAng || 0) + Math.PI / 2);
    ctx.fillStyle = '#bbf7d0'; ctx.shadowBlur = 8; ctx.shadowColor = BM_GREEN;
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(6, 0, 0, 9); ctx.quadraticCurveTo(3, 0, 0, -9); ctx.fill();
    ctx.restore();
}

// ---------- Quanh xe ----------
Object.assign(CharHooks.registry.boomerang, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = bmNow();
        ctx.save();
        if ((this.bmBuffT || 0) > 0) { // Hứng Khởi: vòng gió vàng-lục quay quanh xe
            ctx.strokeStyle = `rgba(253, 224, 71, ${0.5 + 0.3 * Math.sin(t * 10)})`; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = BM_GREEN;
            for (let i = 0; i < (this.bmBuffN > 1 ? 3 : 2); i++) { const a = t * 6 + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.82, a, a + 1.1); ctx.stroke(); }
            ctx.shadowBlur = 0;
        }
        if (this.bmCatchFx > 0) {
            const k = 1 - this.bmCatchFx / 24;
            ctx.strokeStyle = `rgba(74, 222, 128, ${1 - k})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + k * 1.2), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudExtraBar !== 'function') return;
        if ((this.bmBuffT || 0) > 0) hudExtraBar(this, 0, this.bmBuffT / (bmE1(this) ? 210 : 180), BM_GOLD, { h: 2 });
        else if (this.bmSSt === 'cd' && this.bmSCd > 30) hudExtraBar(this, 0, 1 - this.bmSCd / (bmE1(this) ? 270 : 480), '#f87171', { h: 2 });
    },
});

// ---------- Kết liễu "KHÔNG LỐI THOÁT" ----------
function bmDrawFinisherOver(f) {
    const t = f.t, W = canvas.width;
    ctx.save();
    // nền tối + lốc xoáy lục quanh mục tiêu
    const dim = t < 110 ? Math.min(0.55, t / 20 * 0.55) : 0.55 * (1 - (t - 110) / 30);
    ctx.fillStyle = `rgba(2, 20, 12, ${dim})`; ctx.fillRect(-W, -canvas.height, W * 3, canvas.height * 3);
    const spin = t < 40 ? 0 : (t - 40);
    // 2 boomerang khổng lồ: bay chéo vào (0-40), xoay siêu thanh khoá mục tiêu (40-96), bay về tay (96-140)
    for (let i = 0; i < 2; i++) {
        const sd = i ? 1 : -1;
        let x, y, s = 22, ang;
        if (t < 40) {
            // ném từ tay người thắng, 2 chiếc vòng cung hai bên rồi khoá vào mục tiêu (camera bám theo)
            const k = typeof fcamEase === 'function' ? fcamEase(t / 40) : t / 40, a = 1 - k;
            const sx = f.ox + sd * 14, sy = f.oy;
            const qx = (f.ox + f.x) / 2 + sd * 150, qy = (f.oy + f.y) / 2;
            x = a * a * sx + 2 * a * k * qx + k * k * (f.x + sd * 34); y = a * a * sy + 2 * a * k * qy + k * k * f.y;
            ang = t * 0.5 * sd;
        } else if (t < 96) {
            const a = spin * 0.45 + i * Math.PI;
            x = f.x + Math.cos(a) * 34; y = f.y + Math.sin(a) * 34; ang = spin * 1.2;
            // vệt quỹ đạo siêu thanh
            ctx.strokeStyle = 'rgba(134, 239, 172, 0.5)'; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.arc(f.x, f.y, 34, a - 1.4, a); ctx.stroke();
        } else {
            const k = Math.min(1, (t - 96) / 30), e = k * k;
            x = f.x + (f.ox - f.x) * e + sd * 30 * (1 - e); y = f.y + (f.oy - f.y) * e; ang = t * 0.6; s = 22 - 10 * e;
        }
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); (i ? bmShapeC : bmShapeV)(s, i ? BM_CYAN : BM_GREEN, 18); ctx.restore();
    }
    // xẻ làm tư: 2 nhát chéo (66) + 2 nhát thẳng (84), rồi 4 mảnh tách rời
    const cuts = [[66, Math.PI / 4], [66, -Math.PI / 4], [84, 0], [84, Math.PI / 2]];
    for (const [ct, a] of cuts) {
        if (t < ct || t > ct + 20) continue;
        const k = (t - ct) / 20, L = 90 * Math.min(1, k * 3);
        ctx.strokeStyle = `rgba(240, 253, 244, ${1 - k})`; ctx.lineWidth = 4 * (1 - k) + 1; ctx.shadowBlur = 16; ctx.shadowColor = BM_GREEN;
        ctx.beginPath(); ctx.moveTo(f.x - Math.cos(a) * L, f.y - Math.sin(a) * L); ctx.lineTo(f.x + Math.cos(a) * L, f.y + Math.sin(a) * L); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    if (t >= 86 && t < 135) {
        const k = (t - 86) / 49;
        for (let q = 0; q < 4; q++) {
            const a = q * Math.PI / 2 + Math.PI / 4, d = 6 + k * 40;
            ctx.save(); ctx.globalAlpha = 1 - k;
            ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d + k * k * 30); ctx.rotate(k * (q % 2 ? 2 : -2));
            ctx.fillStyle = '#1f2937'; ctx.strokeStyle = BM_GREEN; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(f.vw / 2, 0); ctx.lineTo(0, f.vh / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
        }
    }
    ctx.restore();
    // chữ
    if (t >= 8 && t < 130) {
        const a = Math.min(1, (t - 8) / 8) * (t > 110 ? (130 - t) / 20 : 1);
        const cxv = typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active ? fatalCinematic.victimY : canvas.height / 2;
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(cxv, cyv - 110);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = 1 + Math.max(0, 1 - (t - 8) / 8) * 0.4; ctx.scale(sc, sc);
        ctx.font = "900 26px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#022c22';
        ctx.fillStyle = '#bbf7d0'; ctx.shadowBlur = 18; ctx.shadowColor = BM_GREEN;
        ctx.strokeText('KHÔNG LỐI THOÁT', 0, 0); ctx.fillText('KHÔNG LỐI THOÁT', 0, 0);
        ctx.restore();
    }
}
function bmFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof BmFinisher && e.active) e.drawOver();
}

function bmRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('boomerang', p => {
        const i = p.bmSel || 0, st = i ? p.bmCSt : p.bmSSt, col = i ? BM_CYAN : BM_GREEN;
        const name = i ? 'NGUYỆT LUÂN' : 'TRỌNG LUÂN', icon = i ? '🌙' : '🪃';
        const lit = (p.bmSSt === 'hand' ? 1 : 0) + (p.bmCSt === 'hand' ? 1 : 0);
        if (p.bmPrevS && !p.bmUsed && p.bmHold > 4) {
            const k = Math.min(1, p.bmHold / bmSwitchN(p));
            return { pct: k, ready: false, color: i ? BM_GREEN : BM_CYAN, label: 'ĐỔI...', btnIcon: '🔄', segments: 2, lit };
        }
        if (st === 'hand') return { pct: 1, ready: true, color: col, label: name, btnIcon: icon, segments: 2, lit };
        if (st === 'cd' && i && p.bmCCd > 6) return { pct: 1 - p.bmCCd / BM_CURVE_MISS_CD, ready: false, color: '#f87171', label: 'TRƯỢT ' + Math.ceil(p.bmCCd / 60) + 's', btnIcon: icon, dim: true, segments: 2, lit };
        if (st === 'cd' && !i && p.bmSCd > 30) { const M = bmE1(p) ? 270 : 480; return { pct: 1 - p.bmSCd / M, ready: false, color: '#f87171', label: 'NHẶT ' + Math.ceil(p.bmSCd / 60) + 's', btnIcon: icon, dim: true, segments: 2, lit }; }
        return { pct: 0.5, ready: false, color: col, label: name + ' ĐANG BAY', btnIcon: icon, dim: true, segments: 2, lit };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', bmRegisterHUD);
