// ==========================================
// Phản Chiếu (prism) — Hình ảnh: xe lăng kính pha lê (khối tam giác khúc xạ cầu vồng), Tia Khúc Xạ,
// đạn phản (vàng khi Phản Tuyệt Đối), Khiên Kính Lấp Lánh (vòng mặt kính lục giác), Mở Kính (cửa sổ
// vàng 0.25s), tia lazer phản/khúc xạ, HUD hồi chiêu, kết liễu "VẠN KÍNH QUY QUANG". Chỉ đọc state.
// ==========================================

function prNow() { return (Date.now() % 1e6) / 1000; }

// ---------- Xe ----------
registerTankArt('prism', (p, k) => {
    const t = k.t, on = p.prOn > 0, gold = on && (p.prAge || 0) < PR_GOLDEN, rc = (p.prRecoil || 0) / 8;
    TA.treads(-13.5, 4, -11, 12, t, '#0b1220', '#334155');
    // nòng tinh thể
    TA.glow(PR_CYAN, 8);
    ctx.fillStyle = TA.metal(-1.8, 1.8, '#0e7490', '#ecfeff');
    ctx.beginPath(); ctx.moveTo(0, -17 + rc * 2.5); ctx.lineTo(2, -9); ctx.lineTo(-2, -9); ctx.closePath(); ctx.fill();
    // khối lăng kính
    TA.glow(gold ? PR_GOLD : (on ? PR_WHITE : k.teamGlow), gold ? 18 : 10);
    const g = ctx.createLinearGradient(-10, 8, 10, -10);
    g.addColorStop(0, 'rgba(14,116,144,0.95)'); g.addColorStop(0.5, gold ? '#fef9c3' : '#e0f2fe'); g.addColorStop(1, 'rgba(76,29,149,0.95)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(10, 8); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
    // mặt cắt trong
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 8); ctx.moveTo(0, -1); ctx.lineTo(-10, 8); ctx.moveTo(0, -1); ctx.lineTo(10, 8); ctx.stroke();
    // quang phổ tỏa ra phía sau
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = PR_RAINBOW[i + 1]; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 5 + i);
        ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3 + i * 1.5, 8); ctx.lineTo(-7 + i * 3.5, 12.5); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -1, 1.4 + (on ? Math.sin(t * 14) * 0.5 : 0), 0, Math.PI * 2); ctx.fill();
    if (k.evo1) { ctx.fillStyle = PR_GOLD; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 11.5, -7); ctx.lineTo(s * 13, -4); ctx.lineTo(s * 10, -4); ctx.closePath(); ctx.fill(); }); }
    if (k.evo2) { ctx.strokeStyle = 'rgba(165,243,252,0.85)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
    if (k.full) { TA.glow(PR_PINK, 10); ctx.strokeStyle = PR_PINK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 13.5, -Math.PI * 0.9, -Math.PI * 0.1); ctx.stroke(); TA.noGlow(); }
});

// ---------- Đạn ----------
function prDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = Math.atan2(b.vy || -1, b.vx || 0);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    if (b.prKind === 'shard') {
        ctx.rotate(prNow() * 12 + (b.prSpin || 0));
        ctx.fillStyle = 'rgba(224,242,254,0.9)'; ctx.shadowBlur = 8; ctx.shadowColor = PR_CYAN;
        ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-2, 3); ctx.lineTo(-3, -2.5); ctx.closePath(); ctx.fill();
        ctx.restore(); return;
    }
    const L = b.prKind === 'ref' ? (b.prFast ? 26 : 18) : 18, col = b.prFast ? PR_GOLD : PR_CYAN;
    // vệt cầu vồng
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = PR_RAINBOW[(i * 2 + 1) % 7]; ctx.globalAlpha = 0.45; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-L, (i - 1) * 1.6); ctx.lineTo(0, 0); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = b.prFast ? 16 : 10; ctx.shadowColor = col;
    ctx.strokeStyle = col; ctx.lineWidth = b.prFast ? 4 : 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(5, 0); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-L * 0.4, 0); ctx.lineTo(5, 0); ctx.stroke();
    if (b.prKind === 'ref') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(1, 3.5); ctx.lineTo(1, -3.5); ctx.closePath(); ctx.fill(); }
    ctx.restore();
}

// ---------- Tia lazer phản / khúc xạ ----------
function prDrawBeam(f) {
    const k = 1 - f.t / f.dur;
    ctx.save(); ctx.globalAlpha = Math.max(0, k); ctx.lineCap = 'round';
    if (f.kind === 'back') {
        [[16, PR_GOLD, 0.35], [8, PR_GOLD, 0.8], [3, '#fff', 1]].forEach(([w, c, a]) => {
            ctx.globalAlpha = k * a; ctx.strokeStyle = c; ctx.lineWidth = w * (0.6 + 0.4 * k); ctx.shadowBlur = 22; ctx.shadowColor = PR_GOLD;
            ctx.beginPath(); ctx.moveTo(f.x, f.y0); ctx.lineTo(f.x, f.y1); ctx.stroke();
        });
    } else {
        // khúc xạ: tách thành dải quang phổ lệch sang bên
        const dy = f.y1 > f.y0 ? 1 : -1, len = Math.abs(f.y1 - f.y0);
        for (let i = 0; i < 6; i++) {
            const ex = f.x + f.side * (120 + i * 28), ey = f.y0 + dy * len * (0.55 - i * 0.04);
            ctx.strokeStyle = PR_RAINBOW[i]; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = PR_RAINBOW[i];
            ctx.beginPath(); ctx.moveTo(f.x, f.y0); ctx.lineTo(ex, ey); ctx.stroke();
        }
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 20; ctx.shadowColor = '#fca5a5';
        ctx.beginPath(); ctx.arc(f.x, f.y0, 9 * k + 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// ---------- Kính quanh xe ----------
function prDrawGlass(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = prNow();
    const on = p.prOn > 0, gold = prGolden(p), R = p.w * 0.95 + (p.prOpenFx || 0) * 0.6;
    const col = gold ? PR_GOLD : (on ? PR_WHITE : PR_CYAN);
    const pulse = (p.prHitFx || 0) / 10;
    ctx.save();
    ctx.translate(cx, cy);
    // cửa sổ vàng: vòng đếm 0.25s
    if (gold) {
        const f = 1 - (p.prAge || 0) / PR_GOLDEN;
        ctx.strokeStyle = PR_GOLD; ctx.lineWidth = 3; ctx.shadowBlur = 14; ctx.shadowColor = PR_GOLD;
        ctx.beginPath(); ctx.arc(0, 0, R + 6, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
    }
    ctx.rotate(t * (on ? 1.2 : 0.5));
    const n = 6;
    for (let i = 0; i < n; i++) {
        const a0 = i * Math.PI * 2 / n, a1 = a0 + Math.PI * 2 / n;
        const x0 = Math.cos(a0) * R, y0 = Math.sin(a0) * R, x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R;
        const shim = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7);
        ctx.fillStyle = gold ? `rgba(253,224,71,${0.16 + 0.18 * shim})` : `rgba(165,243,252,${0.08 + 0.14 * shim + pulse * 0.2})`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x0, y0); ctx.lineTo(x1, y1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = col; ctx.globalAlpha = 0.7 + 0.3 * shim; ctx.lineWidth = 1.4; ctx.shadowBlur = 8; ctx.shadowColor = col;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.globalAlpha = 1;
        // lấp lánh
        if (shim > 0.85) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((x0 + x1) / 2, (y0 + y1) / 2, 1.6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
}
function prDrawBreak(p) {
    const k = (p.prBreakFx || 0) / 20; if (k <= 0) return;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = p.w * 0.95 + (1 - k) * 24;
    ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = PR_CYAN; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = PR_CYAN;
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + 0.3;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.lineTo(cx + Math.cos(a + 0.25) * (R - 6), cy + Math.sin(a + 0.25) * (R - 6)); ctx.stroke();
    }
    ctx.restore();
}

CharHooks.register('prism', Object.assign(CharHooks.registry.prism || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        if (prGlassOn(p)) prDrawGlass(p);
        else if (p.shield > 0) {
            // khiên chờ: viền kính mờ
            ctx.save(); ctx.strokeStyle = 'rgba(165,243,252,0.35)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.9, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        prDrawBreak(p);
        const hold = p.prHold || 0;
        if (hold > 4 && !p.prUsed) {
            const f = Math.min(1, hold / PR_HOLD), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            ctx.save(); ctx.strokeStyle = (p.prCd || 0) > 0 ? '#64748b' : PR_GOLD; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.75, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke(); ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudExtraBar !== 'function') return;
        if (this.prOn > 0) hudExtraBar(this, 0, this.prOn / prDur(this), prGolden(this) ? PR_GOLD : PR_WHITE, { h: 2.5 });
        else if (this.prGlass > 0) hudExtraBar(this, 0, this.prGlass / PR_GLASS, PR_CYAN, { h: 2.5 });
        else hudExtraBar(this, 0, 1 - (this.prCd || 0) / prCdMax(this), (this.prCd || 0) <= 0 ? PR_GOLD : 'rgba(253,224,71,0.4)', { h: 2.5 });
    },
}));

// ---------- Kết liễu "VẠN KÍNH QUY QUANG" ----------
// 0-30: gương mọc ra quanh mục tiêu | 30-120: tia sáng nảy qua lại giữa các gương (ngôi sao) | 120+: đồng loạt nổ vỡ
const PR_FIN_N = 14;
function prFinMirror(f, i) {
    const a = i * Math.PI * 2 / PR_FIN_N + f.t * 0.01, R = 70 + (i % 2) * 18;
    return { x: f.x + Math.cos(a) * R, y: f.y + Math.sin(a) * R * 0.8, a };
}
function prDrawFinisherUnder(f) {
    const t = f.t, k = Math.min(1, t / 20) * (t > 130 ? Math.max(0, 1 - (t - 130) / 30) : 1);
    ctx.save();
    const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 140);
    g.addColorStop(0, `rgba(224,242,254,${0.25 * k})`); g.addColorStop(1, 'rgba(15,23,42,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 140, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function prDrawFinisherOver(f) {
    const t = f.t;
    ctx.save();
    // màn tối nhẹ
    const dim = t < 120 ? Math.min(0.45, t / 40) : Math.max(0, 0.45 - (t - 120) / 40);
    ctx.fillStyle = `rgba(2,6,23,${dim})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const grow = Math.min(1, t / 30);
    const ms = [];
    for (let i = 0; i < PR_FIN_N; i++) ms.push(prFinMirror(f, i));
    if (t < 124) {
        // gương
        ms.forEach((m, i) => {
            if (i / PR_FIN_N > grow) return;
            ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.a + Math.PI / 2);
            const gg = ctx.createLinearGradient(-9, 0, 9, 0);
            gg.addColorStop(0, 'rgba(14,116,144,0.9)'); gg.addColorStop(0.5, '#f0f9ff'); gg.addColorStop(1, 'rgba(109,40,217,0.9)');
            ctx.fillStyle = gg; ctx.shadowBlur = 12; ctx.shadowColor = PR_RAINBOW[i % 7];
            ctx.fillRect(-9, -2.2, 18, 4.4);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.strokeRect(-9, -2.2, 18, 4.4);
            ctx.restore();
        });
        // tia sáng nảy qua lại (nhảy 5 gương mỗi bước -> ngôi sao 14 cánh)
        if (t >= 30) {
            const steps = Math.min(40, Math.floor((t - 30) / 2.2));
            ctx.lineCap = 'round';
            for (let s = Math.max(0, steps - 14); s < steps; s++) {
                const a = ms[(s * 5) % PR_FIN_N], b = ms[((s + 1) * 5) % PR_FIN_N];
                const age = (steps - s) / 14;
                ctx.globalAlpha = 1 - age;
                ctx.strokeStyle = PR_RAINBOW[s % 7]; ctx.lineWidth = 3.5; ctx.shadowBlur = 16; ctx.shadowColor = ctx.strokeStyle;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            ctx.globalAlpha = 1;
            // vết cắt trên mục tiêu
            ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
            for (let s = 0; s < Math.min(8, steps / 4); s++) {
                const an = s * 0.9 + f.seed;
                ctx.beginPath(); ctx.moveTo(f.x - Math.cos(an) * 16, f.y - Math.sin(an) * 16); ctx.lineTo(f.x + Math.cos(an) * 16, f.y + Math.sin(an) * 16); ctx.stroke();
            }
        }
    } else {
        // đồng loạt nổ vỡ: mảnh gương bay ra + vòng quang phổ
        const k = (t - 120) / 40;
        ms.forEach((m, i) => {
            for (let j = 0; j < 3; j++) {
                const an = m.a + (j - 1) * 0.5, d = k * (40 + j * 20);
                ctx.save(); ctx.translate(m.x + Math.cos(an) * d, m.y + Math.sin(an) * d); ctx.rotate(k * 8 + i + j);
                ctx.globalAlpha = Math.max(0, 1 - k); ctx.fillStyle = PR_RAINBOW[(i + j) % 7];
                ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-2, 3); ctx.lineTo(-2, -3); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        });
        for (let i = 0; i < 7; i++) {
            ctx.globalAlpha = Math.max(0, 1 - k) * 0.8;
            ctx.strokeStyle = PR_RAINBOW[i]; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(f.x, f.y, 10 + k * 150 + i * 6, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    // chữ
    if (t > 20 && t < 150) {
        ctx.globalAlpha = Math.min(1, (t - 20) / 15) * (t > 130 ? (150 - t) / 20 : 1);
        ctx.font = "bold 18px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 14; ctx.shadowColor = PR_CYAN;
        const ty = f.y < canvas.height / 2 ? f.y + 120 : f.y - 110;
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'VẠN KÍNH QUY QUANG', f.x < 100 ? 110 : Math.min(canvas.width - 110, f.x), ty);
        else ctx.fillText('VẠN KÍNH QUY QUANG', f.x, ty);
    }
    ctx.restore();
}
function prFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof PrFinisher && e.active) e.drawOver();
}
