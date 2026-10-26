// ============================================================
// Kết liễu ĐIỆN ẢNH cho Kiếm Tôn / Kazuki / Chrono & Neo (ghi đè BF_MOTIFS, cfg.own: tự vẽ tiêu đề + khung).
// Dùng khung chung js/render/finisher-cinema.js. Chỉ vẽ, không đổi state; toạ độ thế giới.
// ============================================================
// Ấn văn cổ trên lưỡi đại kiếm Kiếm Tôn (các nét [x1,y1,x2,y2])
const BG_RUNES = [
    [[0, -5, 0, 5], [0, -5, 4, -2], [0, -1, 4, 2]],
    [[0, -5, 0, 5], [-3, -2, 0, -5], [3, -2, 0, -5]],
    [[0, -5, 3, 0], [3, 0, 0, 5], [0, 5, -3, 0], [-3, 0, 0, -5]],
    [[0, -5, 0, 5], [0, -1, -3, -5], [0, -1, 3, -5]],
    [[-3, -4, 3, 4], [3, -4, -3, 4], [-3, 0, 3, 0]],
];
function bgRune(i) { ctx.beginPath(); for (const sg of BG_RUNES[i % BG_RUNES.length]) { ctx.moveTo(sg[0], sg[1]); ctx.lineTo(sg[2], sg[3]); } ctx.stroke(); }
// Đại kiếm: dọc trục -y, gốc = tâm chắn kiếm, mũi tại (0,-L). lit 0..1: ấn văn sáng dần; aura: kiếm khí
function bgGreatsword(L, BW, lit, aura, t, c, c2) {
    const tipY = -L, sh = -L + BW * 2.8;
    ctx.globalCompositeOperation = 'source-over';
    if (aura > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = c2; ctx.shadowBlur = 24;
        for (let j = 0; j < 2; j++) {
            const s = 1.45 + j * 0.55 + Math.sin(t * 0.45 + j * 2) * 0.08;
            ctx.fillStyle = bfA(j ? c2 : c, aura * (j ? 0.16 : 0.28));
            bfPoly([[0, tipY - 16 * s], [BW * s, sh], [BW * 0.9 * s, 10], [-BW * 0.9 * s, 10], [-BW * s, sh]]); ctx.fill();
        }
        ctx.restore();
    }
    const g = ctx.createLinearGradient(-BW, 0, BW, 0);
    g.addColorStop(0, '#475569'); g.addColorStop(0.42, '#e2e8f0'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.58, '#cbd5e1'); g.addColorStop(1, '#334155');
    ctx.fillStyle = g; ctx.shadowColor = c; ctx.shadowBlur = 16;
    bfPoly([[0, tipY], [BW, sh], [BW * 0.82, -4], [-BW * 0.82, -4], [-BW, sh]]); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15,23,42,0.28)'; bfPoly([[0, tipY], [BW, sh], [BW * 0.82, -4], [0, -4]]); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-BW * 0.82, -4); ctx.lineTo(-BW, sh); ctx.lineTo(0, tipY); ctx.lineTo(BW, sh); ctx.lineTo(BW * 0.82, -4); ctx.stroke();
    // rãnh giữa lưỡi
    ctx.strokeStyle = bfA(c, 0.45 + 0.55 * lit); ctx.lineWidth = 3; if (lit > 0) { ctx.shadowColor = c; ctx.shadowBlur = 10 * lit; }
    ctx.beginPath(); ctx.moveTo(0, sh + 8); ctx.lineTo(0, -12); ctx.stroke(); ctx.shadowBlur = 0;
    const nR = 6, step = (L - BW * 3.6 - 26) / (nR - 1);
    for (let i = 0; i < nR; i++) {
        const on = Math.max(0, Math.min(1, lit * nR - i));
        ctx.save(); ctx.translate(0, -26 - i * step);
        ctx.fillStyle = 'rgba(15,23,42,0.75)'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, BF_TAU); ctx.fill();
        ctx.strokeStyle = on > 0 ? bfA(i % 2 ? c2 : '#fff7d6', 0.35 + 0.65 * on) : 'rgba(100,116,139,0.8)';
        ctx.lineWidth = 1.6; if (on > 0) { ctx.shadowColor = c2; ctx.shadowBlur = 12 * on; }
        bgRune(i);
        ctx.restore();
    }
    // chắn kiếm cánh vàng + ngọc tím
    const gg = ctx.createLinearGradient(0, -10, 0, 8); gg.addColorStop(0, '#fff7d6'); gg.addColorStop(0.5, c); gg.addColorStop(1, '#a16207');
    ctx.fillStyle = gg; ctx.shadowColor = c; ctx.shadowBlur = 10;
    bfPoly([[-BW * 2.7, -12], [-BW * 1.1, -4], [-BW * 0.6, -10], [0, -5], [BW * 0.6, -10], [BW * 1.1, -4], [BW * 2.7, -12], [BW * 1.6, 7], [-BW * 1.6, 7]]); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1; ctx.stroke();
    bfDisc(0, 0, 11, c2, c2, 0.9); ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, BF_TAU); ctx.fill();
    ctx.fillStyle = '#1e1b4b'; ctx.fillRect(-BW * 0.4, 7, BW * 0.8, 56);
    ctx.strokeStyle = bfA(c, 0.8); ctx.lineWidth = 1.4;
    ctx.beginPath(); for (let y = 10; y < 60; y += 7) { ctx.moveTo(-BW * 0.4, y); ctx.lineTo(BW * 0.4, y + 4); } ctx.stroke();
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 69, 8, 0, BF_TAU); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 69, 3.5, 0, BF_TAU); ctx.fill();
}
// Trận pháp triệu kiếm dưới chân Kiếm Tôn
function bgSigil(x, y, r, a, rot, c, c2) {
    if (a <= 0 || r < 2) return;
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = c2; ctx.shadowBlur = 14;
    ctx.globalAlpha *= a;
    bfRing(0, 0, r, bfA(c, 0.9), 2); bfRing(0, 0, r * 0.82, bfA(c2, 0.7), 1.2);
    ctx.save(); ctx.rotate(rot); ctx.setLineDash([6, 5]); bfRing(0, 0, r * 0.92, bfA(c, 0.6), 2.5); ctx.setLineDash([]);
    ctx.strokeStyle = bfA(c2, 0.8); ctx.lineWidth = 1.4;
    for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) { const an = s * Math.PI / 3 + i * BF_TAU / 3, px = Math.cos(an) * r * 0.8, py = Math.sin(an) * r * 0.8; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
    ctx.rotate(-rot * 1.6); ctx.strokeStyle = bfA('#fff7d6', 0.85); ctx.lineWidth = 1.2;
    for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * BF_TAU / 12); ctx.translate(0, -r * 0.87); ctx.scale(0.7, 0.7); bgRune(i); ctx.restore(); }
    ctx.restore();
}
// Katana Kazuki: dọc trục -y, gốc = tsuba
function kzKatana(len, col) {
    const g = ctx.createLinearGradient(-3, 0, 3, 0); g.addColorStop(0, '#94a3b8'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#64748b');
    ctx.fillStyle = g; ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(-2.4, 0); ctx.quadraticCurveTo(-4.2, -len * 0.55, 3.2, -len); ctx.quadraticCurveTo(0.6, -len * 0.5, 2.8, 0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = bfA(col, 0.9); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(1.4, -5); ctx.quadraticCurveTo(-0.4, -len * 0.52, 3, -len + 4); ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = col; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 1.5, 8, 3, 0, 0, BF_TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.fillRect(-2.6, 4, 5.2, 28);
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); for (let y = 6; y < 31; y += 5) { ctx.moveTo(-2.6, y); ctx.lineTo(2.6, y + 2.5); ctx.moveTo(2.6, y); ctx.lineTo(-2.6, y + 2.5); } ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(-3, 31, 6, 3);
}
// Ấn lục giác chữ A / B
function kzSeal(x, y, r, letter, col, a) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); if (bfGuest()) ctx.rotate(Math.PI); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(2,6,23,0.85)'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 12;
    bfPoly([0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * Math.PI / 3 + Math.PI / 6) * r, Math.sin(i * Math.PI / 3 + Math.PI / 6) * r])); ctx.fill(); ctx.stroke();
    ctx.font = `900 ${Math.round(r * 1.1)}px 'Orbitron', Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText(letter, 0, 1); ctx.restore();
}
// Nhát chém lưỡi liềm xuyên màn hình
function kzSlash(x, y, ang, len, wd, col, grow, a) {
    if (a <= 0 || grow <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
    const x0 = -len, x1 = -len + 2 * len * grow;
    const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, bfA(col, 0)); g.addColorStop(0.7, bfA(col, 0.85 * a)); g.addColorStop(1, bfA('#ffffff', a));
    ctx.fillStyle = g; ctx.shadowColor = col; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.quadraticCurveTo(0, -wd * 1.6, x1, 0); ctx.quadraticCurveTo(0, wd * 0.5, x0, 0); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = bfA('#ffffff', a);
    ctx.beginPath(); ctx.moveTo(x0 * 0.7, 0); ctx.quadraticCurveTo(0, -wd * 0.5, x1, 0); ctx.quadraticCurveTo(0, wd * 0.12, x0 * 0.7, 0); ctx.fill();
    ctx.restore();
}
// Mặt đồng hồ Chrono & Neo: bánh răng đồng (ngoài) + mặt số neon (trong)
function cnClock(x, y, R, t, G, N, a, lit) {
    if (a <= 0 || R < 3) return;
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(8,10,24,0.72)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, BF_TAU); ctx.fill();
    ctx.save(); ctx.rotate(t * 0.012); ctx.beginPath();
    for (let i = 0; i < 48; i++) { const an = i / 48 * BF_TAU, r = (i % 4 < 2) ? R + 9 : R + 1; i ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
    ctx.closePath(); ctx.strokeStyle = G; ctx.lineWidth = 2.2; ctx.shadowColor = G; ctx.shadowBlur = 12; ctx.stroke(); ctx.restore();
    ctx.shadowBlur = 0; bfRing(0, 0, R - 4, bfA(G, 0.9), 1.5);
    ctx.save(); ctx.rotate(-t * 0.03); ctx.setLineDash([10, 6]); ctx.shadowColor = N; ctx.shadowBlur = 10; bfRing(0, 0, R - 14, bfA(N, 0.9), 2); ctx.setLineDash([]); ctx.restore();
    // vạch giây neon sáng dần
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i += 2) { const an = i / 60 * BF_TAU - Math.PI / 2, on = i / 60 < lit; ctx.fillStyle = on ? N : 'rgba(34,211,238,0.18)'; ctx.fillRect(Math.cos(an) * (R - 22) - 1, Math.sin(an) * (R - 22) - 1, 2, 2); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = G; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const an = i / 12 * BF_TAU, l = i % 3 ? 5 : 10; ctx.beginPath(); ctx.moveTo(Math.cos(an) * (R - 28), Math.sin(an) * (R - 28)); ctx.lineTo(Math.cos(an) * (R - 28 - l), Math.sin(an) * (R - 28 - l)); ctx.stroke(); }
    ctx.font = "800 10px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fde68a';
    ['XII', 'III', 'VI', 'IX'].forEach((s, i) => { const an = i * Math.PI / 2 - Math.PI / 2; ctx.save(); ctx.translate(Math.cos(an) * (R - 48), Math.sin(an) * (R - 48)); if (bfGuest()) ctx.rotate(Math.PI); ctx.fillText(s, 0, 0); ctx.restore(); });
    ctx.restore();
}
function cnHand(x, y, ang, len, wd, col, neon) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.shadowColor = col; ctx.shadowBlur = neon ? 16 : 8;
    if (neon) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(len, 0); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = wd * 0.35; ctx.stroke(); }
    else { ctx.fillStyle = col; bfPoly([[-12, 0], [0, -wd], [len * 0.7, -wd * 0.4], [len, 0], [len * 0.7, wd * 0.4], [0, wd]]); ctx.fill(); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#fff7d6'; ctx.beginPath(); ctx.arc(len * 0.55, 0, wd * 0.45, 0, BF_TAU); ctx.fill(); }
    ctx.restore();
}
function fcStdTitle(t, t1, t2, o) {
    fcTitle(t1, t2, bfE(t, BF_HIT + 4, BF_HIT + 14), Object.assign({ alpha: 1 - bfE(t, 104, 118), sw: bfE(t, BF_HIT + 8, BF_HIT + 34) * 1.2 - 0.1 }, o));
}

Object.assign(BF_MOTIFS, {
    // Kiếm Tôn – PHÁ THIÊN KIẾM: đại kiếm hiện sau lưng Kiếm Tôn (trận pháp + ấn văn + kiếm khí), lùi đà rồi phóng xuyên thủng đối thủ
    blade_god(f, c, t) {
        const C = c.c, C2 = c.c2, L = 200, BW = 15;
        let ux = f.x - f.ox, uy = f.y - f.oy; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;   // hướng Kiếm Tôn -> nạn nhân
        const px = -uy, py = ux;
        const sum = bfE(t, 2, 24), lit = bfE(t, 14, 44), rec = bfE(t, 38, 50), fly = bfE(t, 50, BF_HIT), post = bfE(t, BF_HIT, 120);
        const e = fly * fly * fly, out = 1 - bfE(t, 86, 112);
        // điểm triệu kiếm: phía Kiếm Tôn, nhưng kẹp trong tầm nhìn khi camera kết liễu dí sát nạn nhân
        const dd = Math.min(ul, 250), ax = f.x - ux * dd, ay = f.y - uy * dd;
        const g0x = ax - ux * 6, g0y = ay - uy * 6;
        const gpx = g0x - ux * 22 * rec, gpy = g0y - uy * 22 * rec;
        const g1x = f.x + ux * (62 - L), g1y = f.y + uy * (62 - L);
        const vib = t >= BF_HIT ? Math.sin(t * 2.7) * 4 * (1 - bfE(t, BF_HIT, BF_HIT + 16)) : (t > 30 && t < 50 ? Math.sin(t * 3.1) * 1.2 * lit : 0);
        const gx = bfLerp(gpx, g1x, e) + px * vib, gy = bfLerp(gpy, g1y, e) + py * vib;
        const rot = Math.atan2(ux, -uy);
        // 1) trận pháp dưới chân Kiếm Tôn + tia sáng
        bgSigil(ax, ay, 66 * fcOut(sum), sum * (1 - bfE(t, BF_HIT, BF_HIT + 20)), t * 0.03, C, C2);
        if (t < BF_HIT) fcRays(ax, ay, 10, 130 * sum, C2, 0.22 * sum, t * 0.012, 0.07);
        // 2) kiếm khí bốc lên từ lưỡi khi tích lực
        if (t >= 12 && t < BF_HIT) {
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 22; i++) {
                const s = bfR(f.seed, i), ph = (t * 0.045 + bfR(f.seed, i + 30)) % 1, side = i % 2 ? 1 : -1;
                const along = s * L, off = side * (BW * (1 - s * 0.6) + ph * 26);
                ctx.fillStyle = bfA(i % 3 ? C2 : C, lit * (1 - ph));
                ctx.beginPath(); ctx.arc(gx + ux * along + px * off, gy + uy * along + py * off, 2.2 * (1 - ph) + 0.6, 0, BF_TAU); ctx.fill();
            }
            ctx.restore();
        }
        // 3) bóng đuổi + vạch tốc độ khi phóng
        if (fly > 0 && t < BF_HIT + 5) {
            const tf = 1 - bfE(t, BF_HIT, BF_HIT + 5);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let k = 1; k <= 3; k++) {
                const fk = Math.max(0, fly - k * 0.14), ek = fk * fk * fk;
                const hx = bfLerp(gpx, g1x, ek), hy = bfLerp(gpy, g1y, ek);
                ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot); ctx.fillStyle = bfA(C2, 0.28 / k * tf);
                bfPoly([[0, -L], [BW * 1.2, -L + BW * 3], [BW, 0], [-BW, 0], [-BW * 1.2, -L + BW * 3]]); ctx.fill(); ctx.restore();
            }
            ctx.strokeStyle = bfA('#ffffff', 0.7 * tf); ctx.lineWidth = 1.5;
            for (let i = 0; i < 12; i++) {
                const o = (bfR(f.seed, i + 60) - 0.5) * 90, l = 80 + bfR(f.seed, i + 70) * 120, bx = gx + ux * L * 0.8, by = gy + uy * L * 0.8;
                ctx.beginPath(); ctx.moveTo(bx + px * o, by + py * o); ctx.lineTo(bx + px * o - ux * l, by + py * o - uy * l); ctx.stroke();
            }
            ctx.restore();
        }
        fcZoomLines(f.x, f.y, 26, 60, 420, '#fff7d6', 0.35 * bfE(t, 44, 54) * (1 - bfE(t, BF_HIT + 4, BF_HIT + 14)), f.seed, t);
        // 4) chấn động: tia sáng + nứt vỡ
        if (t >= BF_HIT) {
            const pk = fcOut(Math.min(1, post * 4));
            fcRays(f.x, f.y, 14, 300 * pk, C, 0.75 * (1 - post), f.seed + post * 0.4, 0.06);
            ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.globalAlpha *= 1 - post * 0.5;
            bfCracks(f.x, f.y, 9, 170 * pk, f.seed, 'rgba(8,8,14,0.9)', 4);
            ctx.globalCompositeOperation = 'lighter'; bfGlow(C, 10); bfCracks(f.x, f.y, 9, 170 * pk, f.seed, bfA(C, 0.9), 1.6);
            ctx.restore();
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fl = bfE(t, BF_HIT, BF_HIT + 14); bfDisc(f.x, f.y, 70 * (1 - fl) + 4, '#ffffff', C, 1 - fl); ctx.restore();
        }
        // 5) đại kiếm
        if (sum > 0 && out > 0) {
            ctx.save(); ctx.translate(gx, gy); ctx.rotate(rot); ctx.globalAlpha *= sum * out;
            const sc = 0.75 + 0.25 * fcOut(sum); ctx.scale(sc, sc);
            bgGreatsword(L, BW, lit, t >= BF_HIT ? 1 - post * 0.7 : lit, t, C, C2);
            if (sum < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = bfA('#ffffff', 1 - sum); ctx.fillRect(-BW * 3, -L * sum - 2, BW * 6, 4); }
            ctx.restore();
        }
        // kiếm tan thành bụi sáng
        if (t > 82) {
            const k = bfE(t, 82, 118);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 26; i++) {
                const s = bfR(f.seed, i + 90), ph = Math.min(1, k * (1.2 + bfR(f.seed, i + 95))), w = (bfR(f.seed, i + 99) - 0.5) * BW * 2, sd = i % 2 ? 1 : -1;
                const bx = gx + ux * s * L + px * w, by = gy + uy * s * L + py * w;
                ctx.fillStyle = bfA(i % 2 ? C : C2, 1 - ph);
                ctx.beginPath(); ctx.arc(bx + px * sd * ph * 30 - ux * ph * 20, by + py * sd * ph * 30 - uy * ph * 20, 1.8, 0, BF_TAU); ctx.fill();
            }
            ctx.restore();
        }
        if (t >= BF_HIT) {
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(C2, 16);
            bfRing(f.x, f.y, 20 + post * 170, bfA(C, 1 - post), 5 * (1 - post) + 1); bfRing(f.x, f.y, 12 + post * 110, bfA(C2, (1 - post) * 0.9), 3);
            bfShards(f, 16, 160, C, '#fff7d6', post, 6);
            ctx.restore();
        }
        // 6) khung điện ảnh + tiêu đề
        fcVignette(0.55 * fcBarK(t, 14, 100, 120), '#0b0618');
        fcLetterbox(fcBarK(t, 12, 104, 120), C);
        fcStdTitle(t, 'PHÁ THIÊN KIẾM', 'KIẾM TÔN · VẠN KIẾM QUY TÔNG', { c: C2, c2: C, size: 30 });
    },
    // Kazuki – SONG KIẾM VÔ NIỆM: 2 katana [A]/[B] hiện ra, khoảnh khắc tĩnh lặng, chém chữ X xuyên màn hình – nạn nhân tách 4 mảnh
    kazuki(f, c, t, W) {
        const A = '#60a5fa', B = '#e2e8f0', V = '#a78bfa';
        const app = bfE(t, 4, 24), still = bfE(t, 24, 44), go = bfE(t, 44, 48), post = bfE(t, BF_HIT, 120);
        const LL = Math.max(W, 420) * 0.85;
        // 1) vòng kiếm ý + 2 katana bắt chéo + ấn A/B
        if (t < 50) {
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(A, 12);
            ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(t * 0.02); ctx.setLineDash([2, 7]); bfRing(0, 0, 96 * fcOut(app), bfA(B, 0.5 * (1 - go)), 1.4); ctx.setLineDash([]); ctx.restore();
            bfRing(f.x, f.y, 84 * fcOut(app), bfA(A, 0.35 * (1 - go)), 1);
            ctx.restore();
            for (const s of [-1, 1]) {
                const col = s < 0 ? A : B, ang = s * (Math.PI / 4 + 0.25 * (1 - fcOut(app)));
                ctx.save(); ctx.translate(bfLerp(f.x + s * 70, f.x, go), f.y); ctx.rotate(ang); ctx.globalAlpha *= app * (1 - go);
                ctx.translate(0, 78); kzKatana(156, col);
                if (still > 0) { const gp = ((t - 24) * 6 + (s > 0 ? 60 : 0)) % 156; ctx.globalCompositeOperation = 'lighter'; bfDisc(1.5, -gp, 9, '#ffffff', col, 0.9 * still); }
                ctx.restore();
                kzSeal(f.x + s * 92, f.y + (s < 0 ? -52 : 52), 13, s < 0 ? 'A' : 'B', col, app * (1 - bfE(t, 40, 48)));
            }
        }
        fcZoomLines(f.x, f.y, 30, 50, 420, B, 0.32 * still * (1 - bfE(t, BF_HIT + 6, BF_HIT + 16)), f.seed, t);
        // 2) nhát A (t=48) rồi nhát B (t=54) xuyên màn hình
        [[48, -Math.PI / 4, A], [54, Math.PI / 4, B]].forEach(([t0, an, col], i) => {
            if (t < t0) return;
            const gr = fcOut(bfE(t, t0, t0 + 4)), lin = 1 - bfE(t, BF_HIT + 10, 110);
            kzSlash(f.x, f.y, an, LL, (t < BF_HIT + 6 ? 10 : 4) * (0.4 + 0.6 * lin), col, gr, lin);
            if (t < t0 + 14) {
                const k = bfE(t, t0, t0 + 14);
                kzSeal(f.x + Math.cos(an) * 110, f.y + Math.sin(an) * 110, 11 + 5 * (1 - k), i ? 'B' : 'A', i ? V : A, 1 - k);
            }
        });
        // 3) va chạm chữ X
        if (t >= BF_HIT) {
            const pk = fcOut(Math.min(1, post * 4)), fl = bfE(t, BF_HIT, BF_HIT + 12);
            fcRays(f.x, f.y, 4, 360 * pk, A, 0.8 * (1 - post), Math.PI / 4, 0.05);
            fcRays(f.x, f.y, 12, 200 * pk, V, 0.45 * (1 - post), f.seed, 0.05);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            bfDisc(f.x, f.y, 60 * (1 - fl) + 3, '#ffffff', A, 1 - fl);
            bfGlow(A, 14); bfRing(f.x, f.y, 18 + post * 150, bfA(A, 1 - post), 4 * (1 - post) + 1); bfRing(f.x, f.y, 10 + post * 100, bfA(V, (1 - post) * 0.8), 2);
            ctx.shadowBlur = 0;
            for (let i = 0; i < 24; i++) {
                const an = Math.PI / 4 + (i % 4) * Math.PI / 2 + (bfR(f.seed, i) - 0.5) * 0.5, d = (20 + bfR(f.seed, i + 9) * 140) * pk;
                ctx.fillStyle = bfA(i % 2 ? A : B, 1 - post); ctx.beginPath(); ctx.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d, 2 * (1 - post) + 0.6, 0, BF_TAU); ctx.fill();
            }
            ctx.restore();
            ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
            for (let q = 0; q < 4; q++) {
                const a = q * Math.PI / 2, d = fcOut(post) * 34;
                ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(a + post * 0.7); ctx.globalAlpha *= 1 - bfE(t, 80, 112);
                ctx.fillStyle = '#1e293b'; ctx.strokeStyle = q % 2 ? B : A; ctx.lineWidth = 1.5;
                bfPoly([[0, 0], [f.vw * 0.55, -f.vw * 0.55], [f.vw * 0.55, f.vw * 0.55]]); ctx.fill(); ctx.stroke(); ctx.restore();
            }
            ctx.restore();
        }
        // 4) khung điện ảnh + COLLAB + tiêu đề
        fcVignette((0.35 + 0.35 * still) * fcBarK(t, 14, 100, 120), '#020617');
        const bh = fcLetterbox(fcBarK(t, 10, 104, 120), A);
        fcBadge(bfE(t, 6, 20) * (1 - bfE(t, 104, 116)), 'KAZUKI', A, bh);
        fcStdTitle(t, 'SONG KIẾM VÔ NIỆM', '[A] TẢ TRẢM ✕ HỮU TRẢM [B]', { c: A, c2: '#dbeafe', size: 28 });
    },
    // Chrono & Neo – HAI THỜI ĐẠI, MỘT KẾT CỤC: 2 đồng hồ (đồng cổ / neon) hợp nhất, kim quay về 12 giờ, thời gian vỡ vụn
    chrononeo(f, c, t, W, H) {
        const G = c.c, N = c.c2, M = '#f0abfc';
        const app = bfE(t, 2, 22), mv = bfE(t, 6, 30), lock = bfE(t, 14, 56), post = bfE(t, BF_HIT, 120);
        const R = 104 * fcOut(bfE(t, 18, 40));
        // 1) vạch quét neon toàn màn hình (Neo)
        if (t < 104) {
            ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 0;
            ctx.fillStyle = bfA(N, 0.05 * app); for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 1);
            const by = (t * 9) % (H + 80) - 40, gb = ctx.createLinearGradient(0, by - 30, 0, by + 30);
            gb.addColorStop(0, bfA(N, 0)); gb.addColorStop(0.5, bfA(N, 0.12 * app)); gb.addColorStop(1, bfA(N, 0));
            ctx.fillStyle = gb; ctx.fillRect(0, by - 30, W, 60); ctx.restore();
        }
        // 2) hai đồng hồ nhỏ bay từ 2 phía vào hợp nhất
        if (t < 40) {
            for (const s of [-1, 1]) {
                const col = s < 0 ? G : N, x = f.x + s * 130 * (1 - mv * mv), a = app * (1 - bfE(t, 28, 40));
                ctx.save(); ctx.translate(x, f.y); ctx.globalAlpha *= a; bfGlow(col, 14);
                ctx.fillStyle = 'rgba(15,23,42,0.8)'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
                for (let i = 0; i < 12; i++) { const an = i / 12 * BF_TAU; ctx.fillStyle = col; ctx.fillRect(Math.cos(an) * 20 - 1.2, Math.sin(an) * 20 - 1.2, 2.4, 2.4); }
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(s * t * 0.3) * 16, Math.sin(s * t * 0.3) * 16); ctx.stroke();
                ctx.restore();
                ctx.save(); ctx.globalAlpha *= a; bfText(s < 0 ? 'CHRONO' : 'NEO', x, f.y + 40, 9, col); ctx.restore();
            }
        }
        // 3) đồng hồ lớn + 2 kim (kim đồng tích tắc, kim neon quét ngược) cùng về 12 giờ
        if (t < BF_HIT + 2) {
            cnClock(f.x, f.y, R, t, G, N, app, lock);
            const e = fcOut(lock), step = Math.floor((1 - e) * 10) / 10;
            if (R > 20) {
                cnHand(f.x, f.y, -Math.PI / 2 + step * 2.6, R * 0.55, 6, G, false);
                cnHand(f.x, f.y, -Math.PI / 2 - (1 - e) * 5.4, R * 0.78, 3.5, N, true);
            }
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfDisc(f.x, f.y, 10, '#ffffff', G, app); ctx.restore();
        }
        // 4) thời gian tách đôi: bóng vàng / xanh lệch quanh nạn nhân + nhiễu glitch
        if (t >= 26 && t < BF_HIT + 14) {
            const o = 4 + 3 * Math.sin(t * 0.7), a = 0.45 * bfE(t, 26, 36);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            bfBody(f.x - o, f.y, f.vw, f.vh, 0, a, G); bfBody(f.x + o, f.y + 1, f.vw, f.vh, 0, a, N);
            ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 0;
            for (let i = 0; i < 6; i++) {
                const r = bfR(f.seed + Math.floor(t / 2), i), r2 = bfR(f.seed + Math.floor(t / 2), i + 7);
                ctx.fillStyle = bfA(i % 2 ? N : M, 0.5 * bfE(t, 40, 50));
                ctx.fillRect(f.x - 70 + r * 80, f.y - 50 + r2 * 100, 30 + r2 * 70, 2 + r * 4);
            }
            ctx.restore();
        }
        fcZoomLines(f.x, f.y, 28, 70, 420, N, 0.28 * bfE(t, 40, 54) * (1 - bfE(t, BF_HIT + 4, BF_HIT + 14)), f.seed, t);
        // 5) 12 giờ điểm: mặt kính vỡ, sóng thời gian
        if (t >= BF_HIT) {
            const pk = fcOut(Math.min(1, post * 4)), fl = bfE(t, BF_HIT, BF_HIT + 12);
            fcRays(f.x, f.y, 12, 280 * pk, N, 0.7 * (1 - post), f.seed, 0.06);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            bfDisc(f.x, f.y, 70 * (1 - fl) + 3, '#ffffff', G, 1 - fl);
            bfGlow(N, 16);
            for (let j = 0; j < 3; j++) { const k = bfE(t, BF_HIT + j * 6, BF_HIT + 40 + j * 6); if (k > 0 && k < 1) bfRing(f.x, f.y, 62 + k * 160, bfA(j % 2 ? G : N, 1 - k), 3 * (1 - k) + 1); }
            bfShards(f, 18, 170, N, G, post, 9);
            for (let i = 0; i < 12; i++) { const a = i / 12 * BF_TAU, r = 80 + pk * 90; ctx.save(); ctx.translate(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); ctx.rotate(a + post * 5); ctx.fillStyle = bfA(i % 3 ? G : '#fde68a', 1 - post); ctx.fillRect(-2, -6, 4, 12); ctx.restore(); }
            ctx.restore();
            const tk = bfE(t, BF_HIT, BF_HIT + 6) * (1 - bfE(t, 96, 110));
            if (tk > 0) { ctx.save(); ctx.globalAlpha *= tk; bfText('00:00', f.x, f.y + (f.oy > f.y ? 56 : -56), 16, N, N); ctx.restore(); }
        }
        // 6) khung điện ảnh + COLLAB + tiêu đề
        fcVignette(0.5 * fcBarK(t, 14, 100, 120), '#020617');
        const bh = fcLetterbox(fcBarK(t, 10, 104, 120), G);
        fcBadge(bfE(t, 6, 20) * (1 - bfE(t, 104, 116)), 'CHRONO & NEO', N, bh);
        fcStdTitle(t, 'HAI THỜI ĐẠI', 'MỘT KẾT CỤC', { c: G, c2: N, size: 30 });
    },
});
