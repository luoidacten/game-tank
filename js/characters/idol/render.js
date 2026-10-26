// ==========================================
// Idol — vẽ xe, đạn, Sân Khấu nhuộm nền sân, HUD, kết liễu GRAND FINALE
// ==========================================
function idolT() { return Date.now() / 1000; }
function idolRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function idolRand(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function idolHeartPath(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45);
    ctx.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
    ctx.closePath();
}
function idolStar(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath();
}

// ---------- Xe: xe sân khấu hồng-trắng, nòng micro, ngôi sao LED ----------
registerTankArt('idol', (p, k) => {
    const t = k.t, st = p.idolStage >= 0 && p.idolStageT > 0 ? IDOL_STAGES[p.idolStage] : null, acc = st ? st.c : IDOL_PINK;
    TA.treads(-13, 4, -11, 12, t, '#2a0f2a', '#7e2a6e');
    ctx.fillStyle = TA.vgrad(-10, 12, '#ffe4f6', '#c0268f');
    TA.rr(-9.5, -8, 19, 19, 5); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.1; TA.rr(-9.5, -8, 19, 19, 5); ctx.stroke();
    // dải LED chạy viền
    for (let i = 0; i < 6; i++) {
        const on = Math.floor(t * 8 + i) % 3 === 0;
        ctx.fillStyle = on ? IDOL_GOLD : idolRgba(acc, 0.6);
        ctx.fillRect(-8 + i * 3, 9, 1.6, 1.4);
    }
    // micro (nòng)
    const rc = (p.idolRecoil || 0) * 0.3;
    ctx.fillStyle = TA.metal(-1.6, 1.6, '#475569', '#f1f5f9'); ctx.fillRect(-1.3, -15 + rc, 2.6, 9);
    TA.glow(acc, 8);
    ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(0, -16 + rc, 3.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 0.5;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-3, -16 + rc + i); ctx.lineTo(3, -16 + rc + i); ctx.stroke(); }
    // ngôi sao lõi
    ctx.fillStyle = acc; idolStar(0, 2, 5.2 + Math.sin(t * 5) * 0.4, t * 0.8); ctx.fill();
    ctx.fillStyle = '#fff'; idolStar(0, 2, 2.2, t * 0.8); ctx.fill();
    TA.noGlow();
    if (k.evo1) { ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 2, 8, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 2, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
});

// ---------- Đạn ----------
function idolDrawWave(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = idolT(), d = b.vy < 0 ? -1 : 1;
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = IDOL_PINK; ctx.strokeStyle = '#ffd1f3'; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 1 - i * 0.28; ctx.lineWidth = 2.4 - i * 0.6;
        ctx.beginPath(); ctx.arc(cx, cy - d * (i * 5 - 6), b.w / 2 + i * 2, d < 0 ? Math.PI * 1.15 : Math.PI * 0.15, d < 0 ? Math.PI * 1.85 : Math.PI * 0.85); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = IDOL_GOLD; ctx.font = "bold 9px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.floor(t * 4) % 2 ? '♪' : '♫', cx + Math.sin(t * 9) * 3, cy);
    ctx.restore();
}
function idolDrawHeart(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = idolT(), r = b.w * 0.55 * (1 + 0.1 * Math.sin(t * 14));
    ctx.save();
    ctx.shadowBlur = 16; ctx.shadowColor = '#ff4f9a';
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r * 1.4);
    g.addColorStop(0, '#fff'); g.addColorStop(0.35, '#ff9de6'); g.addColorStop(1, '#e11d74');
    ctx.fillStyle = g; idolHeartPath(cx, cy, r); ctx.fill();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffd1f3'; ctx.lineWidth = 1; idolHeartPath(cx, cy - (b.vy < 0 ? -8 : 8), r * 0.6); ctx.stroke();
    ctx.restore();
}

// ---------- Thực thể ----------
function idolDrawBeam(o) {
    const k = 1 - o.t / o.dur, top = Math.min(o.y0, o.y1), h = Math.abs(o.y1 - o.y0), col = o.kind ? '#ff2d55' : IDOL_GOLD;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const w = o.w * (0.4 + 0.6 * k);
    ctx.globalAlpha = 0.35 * k; ctx.fillStyle = col; ctx.fillRect(o.x - w, top, w * 2, h);
    ctx.globalAlpha = 0.9 * k; ctx.shadowBlur = 24; ctx.shadowColor = col; ctx.fillStyle = '#fff';
    ctx.fillRect(o.x - w * 0.25, top, w * 0.5, h);
    // nốt nhạc trôi dọc tia
    ctx.fillStyle = col; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    for (let i = 0; i < 6; i++) { const yy = top + ((i * 97 + o.t * 9) % Math.max(1, h)); ctx.fillText(i % 2 ? '♪' : '♫', o.x + Math.sin(i * 2 + o.t * 0.4) * w, yy); }
    ctx.restore();
}
function idolDrawTrail(o) {
    const k = Math.min(1, (o.dur - o.t) / 30);
    ctx.save();
    ctx.globalAlpha = 0.45 * k;
    const g = ctx.createLinearGradient(o.x - 30, 0, o.x + 30, 0);
    g.addColorStop(0, 'rgba(168,85,247,0)'); g.addColorStop(0.5, 'rgba(216,180,254,0.9)'); g.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.fillStyle = g; ctx.fillRect(o.x - 30, o.y - 26, 60, 52);
    ctx.globalAlpha = 0.8 * k; ctx.fillStyle = '#f5d0fe';
    for (let i = 0; i < 5; i++) { idolStar(o.x - 20 + i * 10, o.y + Math.sin(o.t * 0.1 + i) * 14, 2.2, o.t * 0.05); ctx.fill(); }
    ctx.restore();
}
function idolDrawRing(o) {
    const k = o.t / o.dur;
    ctx.save();
    ctx.globalAlpha = 1 - k; ctx.strokeStyle = o.color; ctx.shadowBlur = 14; ctx.shadowColor = o.color;
    for (let i = 0; i < 3; i++) { ctx.lineWidth = 3 - i; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (0.3 + k * 0.8) - i * 8, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
}
function idolDrawGift(o) {
    const bob = o.t >= o.land ? Math.sin(o.t * 0.12) * 1.5 : 0, x = o.x, y = o.y + bob;
    ctx.save();
    ctx.shadowBlur = 12; ctx.shadowColor = IDOL_PINK;
    ctx.fillStyle = '#ff7ad9'; ctx.fillRect(x - 7, y - 5, 14, 11);
    ctx.fillStyle = IDOL_GOLD; ctx.fillRect(x - 1.5, y - 5, 3, 11); ctx.fillRect(x - 8, y - 7, 16, 3);
    ctx.beginPath(); ctx.ellipse(x - 3, y - 9, 3, 2, -0.5, 0, Math.PI * 2); ctx.ellipse(x + 3, y - 9, 3, 2, 0.5, 0, Math.PI * 2); ctx.fill();
    if (o.life - o.t < 90 && Math.floor(o.t / 6) % 2) { ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff'; ctx.fillRect(x - 7, y - 7, 14, 13); }
    ctx.restore();
}
function idolDrawStick(o) {
    ctx.save();
    if (o.t < o.warn) {
        const k = o.t / o.warn;
        ctx.strokeStyle = IDOL_PINK; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.shadowBlur = 8; ctx.shadowColor = IDOL_PINK;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = idolRgba(IDOL_PINK, 0.15 + 0.15 * k); ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.arc(o.x, o.y, o.r, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.closePath(); ctx.fill();
        // Lightstick rơi xuống
        const sy = o.y - (1 - k) * 160;
        ctx.save(); ctx.translate(o.x, sy); ctx.rotate(o.t * 0.3);
        ctx.fillStyle = '#334155'; ctx.fillRect(-1.5, 2, 3, 8);
        ctx.fillStyle = IDOL_GOLD; ctx.shadowBlur = 14; ctx.shadowColor = IDOL_GOLD; ctx.beginPath(); ctx.arc(0, -2, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    ctx.restore();
}

// ---------- Nền sân: Sân Khấu nhuộm màu + đèn spotlight (vẽ ngay sau sàn) ----------
function idolFxUnder() {
    if (typeof p1 === 'undefined' || !p1 || !p2) return;
    const W = canvas.width, H = canvas.height, t = idolT();
    for (const p of [p1, p2]) {
        if (!idolIs(p) || !(p.idolStageT > 0) || !(p.idolStage >= 0)) continue;
        const fade = Math.min(1, p.idolStageT / 40, (p.idolStageMax - p.idolStageT + 1) / 30);
        const list = [[p.idolStage, 1]];
        if (idolFull(p)) for (let s = 0; s < 3; s++) if (s !== p.idolStage) list.push([s, 0.5]);
        ctx.save();
        for (const [s, k] of list) {
            const S = IDOL_STAGES[s], a = fade * k;
            // màu phủ toàn sân
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, idolRgba(S.c, 0.10 * a)); g.addColorStop(0.5, idolRgba(S.c2, 0.05 * a)); g.addColorStop(1, idolRgba(S.c, 0.10 * a));
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
        ctx.globalCompositeOperation = 'lighter';
        // spotlight quét từ làn Idol
        const base = p.id === 1 ? H : 0, dir = p.id === 1 ? -1 : 1;
        list.forEach(([s, k], li) => {
            const S = IDOL_STAGES[s];
            for (let i = 0; i < 2; i++) {
                const ox = W * (0.15 + 0.7 * i) + Math.sin(t * 0.7 + i * 3 + li) * 20;
                const tx = W / 2 + Math.sin(t * (0.9 + 0.2 * li) + i * Math.PI + li * 2) * W * 0.42, ty = base + dir * H * 0.95;
                const cg = ctx.createLinearGradient(ox, base, tx, ty);
                cg.addColorStop(0, idolRgba(i ? S.c2 : S.c, 0.16 * fade * k)); cg.addColorStop(1, idolRgba(S.c, 0));
                ctx.fillStyle = cg;
                ctx.beginPath(); ctx.moveTo(ox - 6, base); ctx.lineTo(tx - 70, ty); ctx.lineTo(tx + 70, ty); ctx.lineTo(ox + 6, base); ctx.closePath(); ctx.fill();
            }
        });
        // hạt lấp lánh
        const S0 = IDOL_STAGES[p.idolStage];
        ctx.fillStyle = idolRgba(s0c(S0), 0.5 * fade);
        for (let i = 0; i < 18; i++) {
            const x = idolRand(i) * W, y = (idolRand(i + 50) * H + t * 30 * (p.idolStage === 0 ? -1 : 1) * (0.5 + idolRand(i + 9))) % H;
            ctx.fillRect(x, (y + H) % H, 1.6, 1.6);
        }
        ctx.restore();
    }
}
function s0c(S) { return S.id === 'rock' ? '#ffb347' : (S.id === 'pop' ? '#a5f3fc' : '#e9d5ff'); }

// ---------- Vẽ quanh xe ----------
CharHooks.register('idol', Object.assign(CharHooks.registry.idol || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = idolT(), d = idolDir(p);
        ctx.save();
        // Lướt Vũ Đạo: vệt nốt nhạc
        if (p.idolLM) {
            ctx.globalAlpha = 0.6; ctx.fillStyle = IDOL_PINK; ctx.shadowBlur = 10; ctx.shadowColor = IDOL_PINK;
            for (let i = 1; i <= 3; i++) { ctx.globalAlpha = 0.5 - i * 0.12; ctx.fillRect(p.x + 2, p.y - d * i * 12, p.w - 4, p.h); }
            ctx.globalAlpha = 1;
        }
        // Mở Sân Khấu / đổi Phong Cách
        if (p.idolStageFx > 0 && p.idolStage >= 0) { const k = 1 - p.idolStageFx / 40; ctx.globalAlpha = 1 - k; ctx.strokeStyle = IDOL_STAGES[p.idolStage].c; ctx.lineWidth = 4; ctx.shadowBlur = 16; ctx.shadowColor = ctx.strokeStyle; ctx.beginPath(); ctx.arc(cx, cy, 20 + k * 120, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
        if (p.idolSwapFx > 0) { const k = 1 - p.idolSwapFx / 20; ctx.globalAlpha = 1 - k; ctx.strokeStyle = IDOL_STYLES[p.idolStyle || 0].c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, p.w * (0.7 + k), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
        // Vòng giữ nút: hồng = nhả để đổi Phong Cách; vàng = sắp mở Sân Khấu
        const h = p.idolHold || 0;
        if (h > 6 && !p.idolHoldUsed) {
            const sw = idolHoldSwap(p), sg = idolHoldStage(p), canStage = !(p.idolStageCd > 0) && !(p.idolStageT > 0);
            ctx.lineWidth = 2.2; ctx.shadowBlur = 10;
            ctx.strokeStyle = h >= sw ? (canStage ? IDOL_GOLD : IDOL_STYLES[((p.idolStyle || 0) + 1) % 3].c) : 'rgba(255,79,216,0.45)';
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.min(1, h / (canStage ? sg : sw)) * Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Chọn Sân Khấu: 3 biểu tượng xoay vòng trên đầu xe
        if (p.idolSel) {
            const idx = Math.floor(p.idolSelT / IDOL_SEL_CYCLE) % 3, oy = cy + d * (p.h + 20);
            for (let i = 0; i < 3; i++) {
                const S = IDOL_STAGES[i], on = i === idx, x = cx + (i - 1) * 24;
                ctx.globalAlpha = on ? 1 : 0.4;
                ctx.fillStyle = 'rgba(10,4,18,0.85)'; ctx.strokeStyle = S.c; ctx.lineWidth = on ? 2.5 : 1; ctx.shadowBlur = on ? 14 : 0; ctx.shadowColor = S.c;
                ctx.beginPath(); ctx.arc(x, oy, on ? 11 : 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.shadowBlur = 0; ctx.font = `${on ? 12 : 9}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(S.icon, x, oy + 1);
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    },
    drawUI() {
        const p = this;
        if (p.hp <= 0 || typeof hudExtraBar !== 'function') return;
        const e = idolEnemy(p), t = idolT();
        // Địch đang Mê Hoặc: trái tim xoay quanh
        if (e && e.hp > 0 && e.idolCharmT > 0) {
            const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
            ctx.save();
            ctx.fillStyle = '#ff7ad9'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff4f9a';
            for (let i = 0; i < 4; i++) { const a = t * 3 + i * Math.PI / 2; idolHeartPath(ex + Math.cos(a) * e.w * 0.85, ey + Math.sin(a) * e.h * 0.6, 4); ctx.fill(); }
            if (e.idolMark) { ctx.strokeStyle = '#ff2d55'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex, ey, e.w * 0.95, 0, Math.PI * 2); ctx.stroke(); }
            ctx.restore();
        }
        // Thanh Náo Nhiệt (vạch 80 = mốc tích Fan)
        hudExtraBar(p, 0, p.ammo / (p.maxAmmo || 100), p.ammo >= 80 ? IDOL_GOLD : IDOL_PINK, { h: 2.5, marks: [0.2, 0.8] });
        // Thanh Sân Khấu (đang mở) hoặc CD Sân Khấu
        if (p.idolStageT > 0 && p.idolStage >= 0) hudExtraBar(p, 1, p.idolStageT / (p.idolStageMax || 900), IDOL_STAGES[p.idolStage].c, { h: 2 });
        else hudExtraBar(p, 1, 1 - (p.idolStageCd || 0) / (p.idolStageCdMax || 1800), p.idolStageCd > 0 ? '#64748b' : IDOL_GOLD, { h: 2 });
        // Bảng Phong Cách + Fan trước mũi xe
        const F = hudFrame(p), dI = hudNearD(p, 3, 10);
        ctx.save();
        const locked = idolEvoLocked(p);
        const W = 74;
        ctx.fillStyle = 'rgba(14,4,20,0.86)'; ctx.strokeStyle = IDOL_PINK; ctx.lineWidth = 1;
        hudRRect(F, -W / 2, dI, W, 10, 5); ctx.fill(); ctx.stroke();
        for (let i = 0; i < 3; i++) {
            const S = IDOL_STYLES[i], cur = i === (p.idolStyle || 0), cd = (p.idolCd && p.idolCd[i]) || 0, mx = (p.idolCdMax && p.idolCdMax[i]) || S.cd;
            const lx = -W / 2 + 8 + i * 11, x = F.X(lx), y = F.Y(dI + 5);
            ctx.globalAlpha = cur ? 1 : 0.45;
            ctx.fillStyle = cd > 0 || p.ammo < S.cost ? '#475569' : S.c;
            ctx.beginPath(); ctx.arc(x, y, cur ? 3.6 : 2.8, 0, Math.PI * 2); ctx.fill();
            if (cd > 0) { ctx.strokeStyle = S.c; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 4.4, -Math.PI / 2, -Math.PI / 2 + (1 - cd / mx) * Math.PI * 2); ctx.stroke(); }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff9de6'; ctx.font = "800 7px 'Orbitron', Arial";
        hudText(F, `♥${idolFans(p)}`, W / 2 - 14, dI + 5.2, 'center');
        if (locked.length) {
            ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 4);
            ctx.fillStyle = '#94a3b8'; ctx.font = "800 6.5px 'Orbitron', Arial";
            hudText(F, '🔒 EVO TẠM KHÓA', 0, dI - 5, 'center');
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    },
}));

if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(p => p.idolCharmT > 0 ? { g: 'heart', c: '#ff7ad9', l: 'MÊ HOẶC', t: (p.idolCharmT / 60).toFixed(1) } : null);
}

// ---------- Kết liễu GRAND FINALE ----------
function idolDrawFinisherOver(o) {
    const W = canvas.width, H = canvas.height, t = o.t, x = o.x, y = o.y;
    ctx.save();
    // 1) Spotlight từ 4 góc hội tụ vào xe địch (0..70)
    const conv = Math.min(1, t / 50), fadeS = t > 150 ? Math.max(0, 1 - (t - 150) / 30) : 1;
    ctx.fillStyle = `rgba(4,0,10,${0.45 * conv * fadeS})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const srcs = [[0, 0], [W, 0], [0, H], [W, H], [W / 2, 0], [W / 2, H]];
    srcs.forEach(([sx, sy], i) => {
        const tx = sx + (x - sx) * (0.4 + 0.6 * conv), ty = sy + (y - sy) * (0.4 + 0.6 * conv) + Math.sin(t * 0.1 + i) * (1 - conv) * 80;
        const ang = Math.atan2(ty - sy, tx - sx), L = Math.hypot(tx - sx, ty - sy), spread = 34;
        const g = ctx.createLinearGradient(sx, sy, tx, ty);
        const col = i % 3 === 0 ? '#ff4fd8' : (i % 3 === 1 ? '#ffe066' : '#22d3ee');
        g.addColorStop(0, idolRgba(col, 0.05)); g.addColorStop(1, idolRgba(col, 0.32 * fadeS));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(tx + Math.cos(ang + Math.PI / 2) * spread, ty + Math.sin(ang + Math.PI / 2) * spread);
        ctx.lineTo(tx - Math.cos(ang + Math.PI / 2) * spread, ty - Math.sin(ang + Math.PI / 2) * spread);
        ctx.closePath(); ctx.fill();
        void L;
    });
    ctx.fillStyle = idolRgba('#fff4fd', 0.35 * conv * fadeS); ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // 2) Pháo giấy & lightstick bùng nổ (62..170)
    if (t >= 62) {
        const k = t - 62;
        for (let i = 0; i < 70; i++) {
            const a = idolRand(i) * Math.PI * 2, sp = 2 + idolRand(i + 7) * 5;
            const px = x + Math.cos(a) * sp * k * 0.9, py = y + Math.sin(a) * sp * k * 0.9 + 0.02 * k * k;
            if (px < -10 || px > W + 10 || py < -10 || py > H + 10) continue;
            ctx.save(); ctx.translate(px, py); ctx.rotate(k * 0.2 + i);
            ctx.globalAlpha = Math.max(0, 1 - k / 120);
            ctx.fillStyle = ['#ff4fd8', '#ffe066', '#22d3ee', '#a855f7', '#fff'][i % 5];
            ctx.fillRect(-2.5, -1.2, 5, 2.4);
            ctx.restore();
        }
        // Lightstick đám đông vẫy hai bên mép sân
        ctx.globalAlpha = Math.min(1, k / 20) * fadeS;
        for (let i = 0; i < 24; i++) {
            const side = i % 2, lx = side ? W - 10 - idolRand(i) * 40 : 10 + idolRand(i) * 40, ly = 40 + (i / 24) * (H - 80);
            const sw = Math.sin(t * 0.25 + i) * 0.5;
            ctx.save(); ctx.translate(lx, ly); ctx.rotate(sw + (side ? -0.3 : 0.3));
            ctx.fillStyle = '#1e293b'; ctx.fillRect(-1.2, 0, 2.4, 10);
            const c = ['#ff4fd8', '#ffe066', '#22d3ee'][i % 3];
            ctx.fillStyle = c; ctx.shadowBlur = 12; ctx.shadowColor = c; ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }
    // 3) Rèm nhung đỏ khép lại (120..170) + chữ SOLD OUT!
    if (t >= 120) {
        const c = fcamEase((t - 120) / 45), half = W / 2 * c;
        for (const side of [0, 1]) {
            const x0 = side ? W - half : 0;
            const g = ctx.createLinearGradient(x0, 0, x0 + half, 0);
            for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? '#7f0d1f' : '#c0122e');
            ctx.fillStyle = g; ctx.fillRect(x0, 0, half, H);
            // viền vàng mép rèm
            ctx.fillStyle = '#facc15'; ctx.fillRect(side ? x0 : x0 + half - 3, 0, 3, H);
        }
        // diềm trên
        ctx.fillStyle = '#8b0a1d'; ctx.fillRect(0, 0, W, 26);
        ctx.fillStyle = '#facc15';
        for (let i = 0; i < W; i += 18) { ctx.beginPath(); ctx.arc(i + 9, 26, 9, 0, Math.PI); ctx.fill(); }
        if (t >= 160) {
            const k = Math.min(1, (t - 160) / 14), s = 1 + (1 - k) * 0.8;
            ctx.save();
            ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.globalAlpha = k;
            ctx.font = "900 40px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowBlur = 24; ctx.shadowColor = '#ff4fd8'; ctx.lineWidth = 5; ctx.strokeStyle = '#3b0010';
            const guest = typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest';
            if (guest) ctx.rotate(Math.PI);   // chữ đọc xuôi cho máy khách (sân bị xoay 180°)
            const drawT = (s2, yy) => { ctx.strokeText(s2, 0, yy); ctx.fillText(s2, 0, yy); };
            ctx.fillStyle = '#ffe066'; drawT('SOLD OUT!', 0);
            ctx.font = "800 12px 'Orbitron', Arial"; ctx.shadowBlur = 10; ctx.fillStyle = '#ffd1f3'; ctx.lineWidth = 3;
            drawT('★ GRAND FINALE ★', 36);
            ctx.restore();
        }
    }
    ctx.restore();
}
