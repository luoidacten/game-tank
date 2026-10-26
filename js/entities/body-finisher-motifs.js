// ============================================================
// BF_MOTIFS – hàm vẽ KẾT LIỄU riêng cho từng thân (dùng với BodyFinisher trong body-finisher.js).
// Mỗi hàm (f, c, t, W, H): f = thực thể (x,y tâm nạn nhân; ox,oy người ra đòn; vw,vh; team; seed),
// c = cấu hình BODY_FINISHERS, t = tick 0..120 (ra đòn chính ở BF_HIT = 60). Chỉ vẽ, không đổi state.
// bfDraw đã bọc save/restore, lớp tối nền, chớp sáng, ký hiệu lớn và chữ tiêu đề.
// ============================================================
const BF_TAU = Math.PI * 2;
function bfE(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
function bfAway(f) { return f.team === 1 ? -1 : 1; } // phía "trời" (xa người ra đòn)
function bfOA(f) { return Math.atan2(f.oy - f.y, f.ox - f.x); } // góc từ nạn nhân tới người ra đòn
function bfGuest() { return typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest'; }
function bfLerp(a, b, k) { return a + (b - a) * k; }
function bfText(s, x, y, size, col, glow) {
    ctx.save(); ctx.translate(x, y); if (bfGuest()) ctx.rotate(Math.PI);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `900 ${Math.round(size)}px 'Orbitron', Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, size / 5); ctx.strokeStyle = '#000'; ctx.shadowBlur = 14; ctx.shadowColor = glow || col;
    ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore();
}
// bóng nạn nhân (khi hiệu ứng cần di chuyển / bóp méo nạn nhân)
function bfBody(x, y, w, h, rot, a, col, sx, sy) {
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(sx || 1, sy || 1);
    ctx.globalAlpha *= a; ctx.shadowBlur = 10; ctx.shadowColor = col || '#94a3b8';
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = col || '#94a3b8'; ctx.lineWidth = 2;
    ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#475569'; ctx.fillRect(-w * 0.12, -h * 0.75, w * 0.24, h * 0.55);
    ctx.restore();
}
function bfPoly(pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
// lưỡi kiếm dọc trục -y, chuôi tại gốc
function bfSword(len, wd, col, edge) {
    ctx.fillStyle = col; bfPoly([[0, -len], [wd, -len + wd * 3], [wd * 0.8, 0], [-wd * 0.8, 0], [-wd, -len + wd * 3]]); ctx.fill();
    ctx.strokeStyle = edge || '#ffffff'; ctx.lineWidth = Math.max(1, wd * 0.25);
    ctx.beginPath(); ctx.moveTo(0, -len + 2); ctx.lineTo(0, -2); ctx.stroke();
    ctx.fillStyle = edge || '#ffffff'; ctx.fillRect(-wd * 2.2, 0, wd * 4.4, Math.max(1.5, wd * 0.7));
    ctx.fillStyle = '#475569'; ctx.fillRect(-wd * 0.45, wd * 0.7, wd * 0.9, len * 0.2);
}
function bfZap(x0, y0, x1, y1, seg, jit, seed, col, lw) {
    for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass ? '#ffffff' : col; ctx.lineWidth = pass ? Math.max(1, lw * 0.35) : lw;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        for (let j = 1; j <= seg; j++) {
            const k = j / seg, jt = j === seg ? 0 : (bfR(seed, j) - 0.5) * jit;
            const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
            ctx.lineTo(bfLerp(x0, x1, k) + nx / L * jt, bfLerp(y0, y1, k) + ny / L * jt);
        }
        ctx.stroke();
    }
}
function bfCracks(x, y, n, len, seed, col, lw) {
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1.4;
    for (let i = 0; i < n; i++) {
        let px = x, py = y, a = i / n * BF_TAU + bfR(seed, i) * 0.5; ctx.beginPath(); ctx.moveTo(px, py);
        for (let j = 0; j < 4; j++) { a += (bfR(seed, i * 5 + j) - 0.5) * 0.8; const l = len * (0.2 + j * 0.1); px += Math.cos(a) * l; py += Math.sin(a) * l; ctx.lineTo(px, py); }
        ctx.stroke();
    }
}
function bfDisc(x, y, r, inner, outer, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
    g.addColorStop(0, bfA('#ffffff', a)); g.addColorStop(0.35, bfA(inner, a * 0.9)); g.addColorStop(1, bfA(outer, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r), 0, BF_TAU); ctx.fill();
}
function bfShards(f, n, maxD, col, col2, k, size) {
    for (let i = 0; i < n; i++) {
        const a = bfR(f.seed, i + 20) * BF_TAU, d = 8 + k * (maxD * (0.35 + bfR(f.seed, i) * 0.65)), s = (size || 6) * (0.6 + bfR(f.seed, i + 5) * 0.8);
        ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(a + k * 7 * (i % 2 ? 1 : -1));
        ctx.fillStyle = bfA(i % 3 ? col : col2, 1 - k);
        bfPoly([[-s, 0], [0, -s * 0.5], [s * 0.8, s * 0.2], [0, s * 0.6]]); ctx.fill(); ctx.restore();
    }
}
function bfFlame(x, y, r, h, col, a) { // lưỡi lửa hướng -y
    ctx.fillStyle = bfA(col, a); ctx.beginPath(); ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x - r, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + r, y - h * 0.6, x + r, y);
    ctx.arc(x, y, r, 0, Math.PI); ctx.fill();
}

const BF_MOTIFS = {
    // Xe Tiền: mưa xu + tiền giấy, máy tính tiền bật ngăn kéo "KA-CHING!"
    money_tank(f, c, t) {
        const x = f.x, y = f.y, A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 40), ra = bfE(t, 18, 30);
        if (ra > 0) {
            const pop = bfE(t, BF_HIT, BF_HIT + 6), sh = t >= BF_HIT && t < BF_HIT + 10 ? Math.sin(t * 3) * 3 : 0;
            ctx.save(); ctx.translate(x + sh, y + A * 62); ctx.globalAlpha *= ra * (1 - post * 0.5); ctx.scale(0.7 + 0.3 * ra, 0.7 + 0.3 * ra);
            bfGlow(c.c, 16);
            ctx.fillStyle = '#92400e'; ctx.fillRect(-34, -12, 68, 28); ctx.fillStyle = c.c; ctx.fillRect(-34, -12, 68, 4);
            ctx.fillStyle = '#0f172a'; ctx.fillRect(-22, -30, 44, 17); ctx.strokeStyle = c.c; ctx.lineWidth = 1.5; ctx.strokeRect(-22, -30, 44, 17);
            ctx.shadowBlur = 0; ctx.fillStyle = '#4ade80'; ctx.font = "700 10px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.save(); ctx.translate(0, -21.5); if (bfGuest()) ctx.rotate(Math.PI); ctx.fillText('$' + Math.floor(bfE(t, 18, BF_HIT) * 99999), 0, 0); ctx.restore();
            ctx.fillStyle = '#fde68a'; for (let i = 0; i < 8; i++) ctx.fillRect(-26 + (i % 4) * 13, -5 + Math.floor(i / 4) * 8, 9, 5);
            ctx.fillStyle = '#b45309'; ctx.fillRect(-30, 16, 60, 4 + pop * 12); ctx.fillStyle = c.c2; ctx.fillRect(-24, 18 + pop * 8, 48, pop * 6);
            ctx.restore();
        }
        for (let i = 0; i < 22; i++) {
            const t0 = 4 + i * 2.3, k = bfE(t, t0, t0 + 14); if (k <= 0) continue;
            let px = x + (bfR(f.seed, i) - 0.5) * 84, py = y + A * 240 * (1 - k * k) + (bfR(f.seed, i + 9) - 0.5) * 18;
            if (post > 0) { const a = bfR(f.seed, i + 30) * BF_TAU, d = post * (50 + bfR(f.seed, i + 40) * 110); px += Math.cos(a) * d; py += Math.sin(a) * d; }
            ctx.save(); ctx.translate(px, py); ctx.globalAlpha *= 1 - post;
            if (i % 3 === 2) {
                ctx.rotate(Math.sin(t * 0.2 + i) * 0.7); ctx.fillStyle = '#16a34a'; ctx.fillRect(-10, -5, 20, 10);
                ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 1; ctx.strokeRect(-8, -3.5, 16, 7); ctx.fillStyle = '#bbf7d0'; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, BF_TAU); ctx.fill();
            } else {
                ctx.scale(Math.max(0.2, Math.abs(Math.cos(t * 0.25 + i))), 1); bfGlow(c.c, 8);
                ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, BF_TAU); ctx.fill();
                ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#a16207'; ctx.font = '900 9px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 0.5);
            }
            ctx.restore();
        }
        if (t >= BF_HIT && t < BF_HIT + 44) bfText('KA-CHING!', x, y + A * 18, 24 * (1.5 - 0.5 * bfE(t, BF_HIT, BF_HIT + 8)), c.c, '#fff');
    },
    // Xe TANK: cỗ xe khổng lồ lao húc từ phía người lái, nạn nhân bẹp dúm
    tank(f, c, t) {
        const oa = bfOA(f), dx = Math.cos(oa), dy = Math.sin(oa), k = bfE(t, 12, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        const d = 230 * (1 - k * k * k) + 30 - post * 8;
        // nạn nhân bẹp và bị đẩy lùi
        if (post > 0) bfBody(f.x - dx * post * 24, f.y - dy * post * 24, f.vw, f.vh, oa - Math.PI / 2, 1 - post * 0.6, c.c, 1 + post * 0.3, 1 - post * 0.55);
        ctx.save(); ctx.translate(f.x + dx * d, f.y + dy * d); ctx.rotate(oa - Math.PI / 2);
        // vệt tốc độ & bụi
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 7; i++) { const lx = -24 + i * 8, ln = 30 + bfR(f.seed, i) * 40; ctx.strokeStyle = bfA(c.c2, 0.5 * (1 - post) * (k < 1 ? 1 : 0.3)); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 30); ctx.lineTo(lx, 30 + ln); ctx.stroke(); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= 1 - post * 0.7;
        bfGlow(c.c, 18);
        for (const sx of [-1, 1]) {
            ctx.fillStyle = '#1f2937'; ctx.fillRect(sx * 22 - 7, -30, 14, 60);
            ctx.fillStyle = '#4b5563'; for (let j = 0; j < 7; j++) ctx.fillRect(sx * 22 - 7, -30 + ((j * 9 + t * 4) % 60), 14, 3);
        }
        const g = ctx.createLinearGradient(-16, -26, 16, 26); g.addColorStop(0, c.c2); g.addColorStop(1, c.c);
        ctx.fillStyle = g; ctx.fillRect(-16, -24, 32, 50);
        ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(0, 4, 11, 0, BF_TAU); ctx.fill();
        ctx.fillStyle = '#9ca3af'; ctx.fillRect(-32, -40, 64, 9); // lưỡi ủi
        ctx.fillStyle = '#e5e7eb'; for (let j = 0; j < 6; j++) bfPoly([[-30 + j * 11, -40], [-25 + j * 11, -50], [-20 + j * 11, -40]]), ctx.fill();
        ctx.restore();
        if (post > 0) {
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 16);
            bfRing(f.x, f.y, 20 + post * 120, bfA(c.c, 1 - post), 7 * (1 - post) + 1);
            bfShards(f, 14, 130, '#9ca3af', c.c, post, 6);
            for (let i = 0; i < 6; i++) { const a = oa + Math.PI + (i - 2.5) * 0.35, r = 30 + post * 70; ctx.fillStyle = bfA('#a8a29e', 0.35 * (1 - post)); ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 14 + post * 18, 0, BF_TAU); ctx.fill(); }
        }
    },
    // Pháo Băng: khối tinh thể lục giác bọc kín nạn nhân rồi vỡ toang
    ice(f, c, t) {
        const x = f.x, y = f.y, g = bfE(t, 6, 42), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.translate(x, y);
        if (t < BF_HIT) {
            const R = (f.vw * 0.75 + 14) * g;
            bfGlow(c.c, 18); ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 8; i++) { // gai băng
                const a = i / 8 * BF_TAU + 0.2, L = R + (16 + bfR(f.seed, i) * 22) * g;
                ctx.save(); ctx.rotate(a); ctx.fillStyle = bfA(c.c, 0.5); bfPoly([[R * 0.7, -6], [L, 0], [R * 0.7, 6]]); ctx.fill(); ctx.restore();
            }
            const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * BF_TAU + Math.PI / 6; pts.push([Math.cos(a) * R, Math.sin(a) * R * 1.15]); }
            const gr = ctx.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, bfA(c.c2, 0.55)); gr.addColorStop(0.5, bfA(c.c, 0.3)); gr.addColorStop(1, bfA('#ffffff', 0.5));
            ctx.fillStyle = gr; bfPoly(pts); ctx.fill(); ctx.strokeStyle = bfA(c.c2, 0.95); ctx.lineWidth = 2; ctx.stroke();
            ctx.strokeStyle = bfA('#ffffff', 0.4); ctx.lineWidth = 1; pts.forEach(p => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
            ctx.font = "700 12px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = bfA('#ffffff', 0.9 * g);
            for (let i = 0; i < 6; i++) { const a = t * 0.04 + i / 6 * BF_TAU; ctx.fillText('❄', Math.cos(a) * (R + 30), Math.sin(a) * (R + 30)); }
            if (t > 42) { ctx.shadowBlur = 0; bfCracks(0, 0, Math.min(9, 2 + Math.floor((t - 42) / 2)), R * 1.4, f.seed, '#ffffff', 1.4); }
        } else {
            ctx.translate(-x, -y); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 10);
            bfShards(f, 18, 150, c.c, c2safe(c), post, 11);
            for (let i = 0; i < 14; i++) { const a = bfR(f.seed, i + 60) * BF_TAU, d = post * (40 + bfR(f.seed, i + 61) * 90); ctx.fillStyle = bfA('#ffffff', 0.8 * (1 - post)); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.8, 0, BF_TAU); ctx.fill(); }
            bfRing(x, y, 14 + post * 100, bfA(c.c2, 1 - post), 3);
        }
        ctx.restore();
    },
    // Đạn Lớn: quả cầu khổng lồ lăn tới, va chạm tạo hố & sóng xung kích
    big_bullet(f, c, t) {
        const k = bfE(t, 10, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 45), e = k * k;
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            const bx = bfLerp(f.ox, f.x, e), by = bfLerp(f.oy, f.y, e), r = 12 + 18 * k;
            for (let i = 5; i >= 1; i--) { const kk = Math.max(0, e - i * 0.05); bfDisc(bfLerp(f.ox, f.x, kk), bfLerp(f.oy, f.y, kk), r * (1 - i * 0.12), c.c, c.c, 0.18); }
            bfGlow(c.c, 30); bfDisc(bx, by, r * 1.6, c.c2, c.c, 0.95);
            ctx.fillStyle = bfA('#ffffff', 0.9); ctx.beginPath(); ctx.arc(bx - r * 0.3, by - r * 0.3, r * 0.3, 0, BF_TAU); ctx.fill();
        } else {
            ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(10,6,4,${0.7 * (1 - post * 0.5)})`;
            ctx.beginPath(); ctx.ellipse(f.x, f.y, 26 + post * 30, 22 + post * 26, 0, 0, BF_TAU); ctx.fill();
            bfCracks(f.x, f.y, 10, 120, f.seed, bfA(c.c, 1 - post * 0.5), 2.2);
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 24);
            bfDisc(f.x, f.y, 30 + post * 170, c.c2, c.c, 0.8 * (1 - post));
            for (let w = 0; w < 3; w++) { const kk = bfE(t, BF_HIT + w * 6, BF_HIT + w * 6 + 34); if (kk > 0 && kk < 1) bfRing(f.x, f.y, 26 + kk * 190, bfA(w % 2 ? c.c2 : c.c, 1 - kk), 10 * (1 - kk) + 1); }
        }
    },
    // Shotgun: 3 phát bơm nòng tỏa nón đạn chì + vỏ đạn đỏ văng ra
    shotgun(f, c, t) {
        const oa = bfOA(f) + Math.PI, post = bfE(t, BF_HIT, BF_HIT + 40), D = Math.hypot(f.x - f.ox, f.y - f.oy) + 40;
        ctx.globalCompositeOperation = 'lighter';
        [24, 42, 60].forEach((t0, s) => {
            const age = t - t0; if (age < 0) return;
            if (age < 9) {
                const a = 1 - age / 9; bfGlow(c.c, 18);
                ctx.fillStyle = bfA(c.c, 0.25 * a); ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.arc(f.ox, f.oy, D, oa - 0.28, oa + 0.28); ctx.closePath(); ctx.fill();
                for (let i = 0; i < 5; i++) {
                    const pa = oa + (i - 2) * 0.12 + (bfR(f.seed, i + s * 7) - 0.5) * 0.05, r1 = D * Math.min(1, age / 4), r0 = Math.max(0, r1 - 50);
                    ctx.strokeStyle = bfA(i % 2 ? c.c2 : '#ffffff', a); ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(f.ox + Math.cos(pa) * r0, f.oy + Math.sin(pa) * r0); ctx.lineTo(f.ox + Math.cos(pa) * r1, f.oy + Math.sin(pa) * r1); ctx.stroke();
                }
                bfDisc(f.ox + Math.cos(oa) * 18, f.oy + Math.sin(oa) * 18, 22 * a + 6, c.c2, c.c, a);
            }
            // vỏ đạn văng
            const sk = Math.min(1, age / 30); if (sk < 1) {
                const sa = oa + Math.PI / 2 * (s % 2 ? 1 : -1) + 0.4, sx = f.ox + Math.cos(sa) * (14 + sk * 60), sy = f.oy + Math.sin(sa) * (14 + sk * 60);
                ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.translate(sx, sy); ctx.rotate(age * 0.5); ctx.globalAlpha *= 1 - sk;
                ctx.fillStyle = '#dc2626'; ctx.fillRect(-3, -7, 6, 10); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-3, 3, 6, 4); ctx.restore();
            }
            // lỗ đạn trên nạn nhân
            ctx.save(); ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < 5; i++) { ctx.fillStyle = bfA('#111827', 1 - post); ctx.beginPath(); ctx.arc(f.x + (bfR(f.seed, i + s * 11) - 0.5) * f.vw, f.y + (bfR(f.seed, i + s * 13) - 0.5) * f.vh, 2.4, 0, BF_TAU); ctx.fill(); }
            ctx.restore();
        });
        if (post > 0) { bfGlow(c.c, 16); bfShards(f, 16, 120, c.c, '#9ca3af', post, 5); bfRing(f.x, f.y, 18 + post * 90, bfA(c.c, 1 - post), 4); }
    },
    // Cuộn Quá Tải: thanh năng lượng tự tụ đầy 100%, 4 cuộn tesla phóng điện, xung EMP
    overload(f, c, t) {
        const x = f.x, y = f.y, k = bfE(t, 6, BF_HIT - 4), post = bfE(t, BF_HIT, BF_HIT + 40);
        // thanh năng lượng
        const bx = x + f.vw / 2 + 34, bh = 70;
        ctx.save(); ctx.globalAlpha *= 1 - post;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(bx - 7, y - bh / 2, 14, bh); ctx.strokeStyle = c.c; ctx.lineWidth = 2; ctx.strokeRect(bx - 7, y - bh / 2, 14, bh);
        const fc = k < 0.5 ? '#4ade80' : k < 0.85 ? '#facc15' : (Math.floor(t / 3) % 2 ? '#ef4444' : '#ffffff');
        bfGlow(fc, 12); ctx.fillStyle = fc; ctx.fillRect(bx - 5, y + bh / 2 - 2 - (bh - 4) * k, 10, (bh - 4) * k);
        ctx.restore();
        bfText(Math.round(k * 100) + '%', bx, y - bh / 2 - 12, 12, fc);
        ctx.globalCompositeOperation = 'lighter';
        const nodes = []; for (let i = 0; i < 4; i++) { const a = i / 4 * BF_TAU + Math.PI / 4 + t * 0.02; nodes.push([x + Math.cos(a) * 50, y + Math.sin(a) * 50]); }
        nodes.forEach(([nx, ny], i) => {
            ctx.save(); ctx.translate(nx, ny); bfGlow(c.c, 14); ctx.fillStyle = bfA(c.c, 0.9 * (1 - post));
            bfPoly([[0, -9], [7, 0], [0, 9], [-7, 0]]); ctx.fill(); ctx.strokeStyle = bfA('#ffffff', 1 - post); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
            if (t > 14 && t < BF_HIT && bfR(f.seed + Math.floor(t / 2), i) < 0.3 + k * 0.6) {
                // nút chẵn nối nút kế (nút kế có thể chưa tính -> nối vào tâm), nút lẻ phóng vào nạn nhân
                const nb = nodes[(i + 1) % 4], tx = i % 2 || !nb ? x : nb[0], ty = i % 2 || !nb ? y : nb[1];
                bfGlow(c.c2, 14); bfZap(nx, ny, tx, ty, 6, 16, f.seed + t + i, c.c2, 2.5);
            }
        });
        if (post > 0) {
            bfGlow(c.c2, 20);
            for (let w = 0; w < 2; w++) { const kk = bfE(t, BF_HIT + w * 8, BF_HIT + w * 8 + 30); if (kk > 0 && kk < 1) bfRing(x, y, 20 + kk * 160, bfA(w ? c.c : c.c2, 1 - kk), 8 * (1 - kk) + 1); }
            if (post < 0.6) for (let i = 0; i < 8; i++) { const a = i / 8 * BF_TAU + f.seed; bfZap(x, y, x + Math.cos(a) * (30 + post * 120), y + Math.sin(a) * (30 + post * 120), 5, 18, f.seed + i + t, c.c, 2.5); }
        }
    },
    // Tiểu Liên: sấy cạn băng 18 viên, lỗ đạn dày đặc, đếm ngược ổ đạn
    smg(f, c, t) {
        const oa = bfOA(f), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        let fired = 0;
        for (let i = 0; i < 18; i++) {
            const t0 = 8 + i * 2.8, k = (t - t0) / 5; if (k < 0) continue; fired++;
            const hx = f.x + (bfR(f.seed, i) - 0.5) * f.vw * 0.9, hy = f.y + (bfR(f.seed, i + 30) - 0.5) * f.vh * 0.9;
            if (k <= 1) {
                bfGlow(c.c, 10); const sx = f.ox + (bfR(f.seed, i + 60) - 0.5) * 6, sy = f.oy;
                const px = bfLerp(sx, hx, k), py = bfLerp(sy, hy, k), qx = bfLerp(sx, hx, Math.max(0, k - 0.3)), qy = bfLerp(sy, hy, Math.max(0, k - 0.3));
                ctx.strokeStyle = bfA(c.c, 0.95); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
                if (k < 0.3) bfDisc(f.ox - Math.cos(oa) * 16, f.oy - Math.sin(oa) * 16, 12, c.c2, c.c, 0.9);
            } else {
                ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= 1 - post;
                ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, BF_TAU); ctx.fill();
                ctx.strokeStyle = c.c; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
                if (k < 2) { ctx.fillStyle = bfA(c.c2, 2 - k); ctx.beginPath(); ctx.arc(hx, hy, 6 * (k - 1) + 2, 0, BF_TAU); ctx.fill(); }
            }
        }
        // ổ đạn đếm ngược
        const left = 18 - fired, mx = f.x - f.vw / 2 - 30;
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= 1 - post;
        for (let i = 0; i < 18; i++) { ctx.fillStyle = i < left ? c.c : '#374151'; ctx.fillRect(mx - 5, f.y + 34 - i * 4, 10, 3); }
        ctx.restore();
        if (t < BF_HIT + 30) bfText(left > 0 ? String(left) : 'CẠN BĂNG!', mx, f.y - 46, left > 0 ? 14 : 13, left > 0 ? c.c2 : '#ef4444');
        if (post > 0) { bfGlow(c.c, 14); bfShards(f, 12, 100, c.c, c.c2, post, 5); }
    },
    // Lazer Xuyên Phá: tụ năng lượng ở nòng rồi tia khổng lồ xuyên thủng ra khỏi màn hình
    lazer_charge(f, c, t) {
        const ux = (f.x - f.ox), uy = (f.y - f.oy), L = Math.hypot(ux, uy) || 1, dx = ux / L, dy = uy / L;
        const k = bfE(t, 6, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        const cx = f.ox + dx * 20, cy = f.oy + dy * 20;
        if (t < BF_HIT) {
            for (let i = 0; i < 16; i++) { const a = bfR(f.seed, i) * BF_TAU + t * 0.08, r = 80 * (1 - ((t * 0.04 + bfR(f.seed, i + 3)) % 1)); ctx.fillStyle = bfA(c.c2, 0.9); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, BF_TAU); ctx.fill(); }
            bfGlow(c.c, 30); bfDisc(cx, cy, 8 + 26 * k, c.c, c.c, 0.95);
            ctx.strokeStyle = bfA(c.c, 0.35 + 0.4 * (Math.floor(t / 3) % 2)); ctx.lineWidth = 1.2; ctx.setLineDash([6, 6]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * 1400, cy + dy * 1400); ctx.stroke(); ctx.setLineDash([]);
        } else {
            const w = 44 * (1 - post) * Math.min(1, (t - BF_HIT) / 3);
            bfGlow(c.c, 34);
            [[c.c, w + 10, 0.7], [c.c2, w * 0.6 + 3, 0.9], ['#ffffff', w * 0.25 + 1, 1]].forEach(([col, lw, a]) => { ctx.strokeStyle = bfA(col, a); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * 1400, cy + dy * 1400); ctx.stroke(); });
            // lỗ thủng + vòng xoắn dọc tia
            for (let i = 0; i < 5; i++) { const d = ((t - BF_HIT) * 12 + i * 60) % 300; ctx.save(); ctx.translate(cx + dx * d, cy + dy * d); ctx.rotate(Math.atan2(dy, dx)); ctx.strokeStyle = bfA(c.c2, 0.7 * (1 - post)); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 5, w * 0.8 + 6, 0, 0, BF_TAU); ctx.stroke(); ctx.restore(); }
            bfRing(f.x, f.y, 10 + post * 60, bfA('#ffffff', 1 - post), 3);
        }
    },
    // Lazer Pháo: xả dòng laser ngày càng dày, nạn nhân nóng đỏ rồi chảy thành vũng
    lazer_auto(f, c, t) {
        const heat = bfE(t, 8, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT + 6) {
            const iv = Math.max(2, Math.round(9 - heat * 7));
            for (let s = 0; s < 4; s++) {
                const t0 = Math.floor(t / iv) * iv - s * iv, age = t - t0; if (t0 < 8) continue;
                const k = age / (iv * 2); if (k > 1) continue;
                const k0 = Math.max(0, k - 0.25); bfGlow(c.c, 12);
                ctx.strokeStyle = bfA(c.c, 0.9); ctx.lineWidth = 3.5;
                ctx.beginPath(); ctx.moveTo(bfLerp(f.ox, f.x, k0), bfLerp(f.oy, f.y, k0)); ctx.lineTo(bfLerp(f.ox, f.x, k), bfLerp(f.oy, f.y, k)); ctx.stroke();
            }
        }
        // nạn nhân nóng đỏ
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        const melt = post, hc = heat < 0.6 ? c.c : c.c2;
        ctx.globalAlpha *= 0.4 + 0.5 * heat; ctx.shadowColor = hc; ctx.shadowBlur = 10 + heat * 20; ctx.fillStyle = hc;
        ctx.fillRect(f.x - f.vw / 2, f.y - f.vh / 2 + f.vh * melt * 0.6, f.vw, f.vh * (1 - melt * 0.8));
        ctx.restore();
        // vũng kim loại nóng chảy
        if (t > 40) {
            const pk = bfE(t, 40, BF_HIT + 30); ctx.fillStyle = bfA(c.c2, 0.6 * (1 - post * 0.5)); bfGlow(c.c2, 16);
            ctx.beginPath(); ctx.ellipse(f.x, f.y + f.vh * 0.3, f.vw * 0.4 + pk * 30, f.vh * 0.2 + pk * 14, 0, 0, BF_TAU); ctx.fill();
            for (let i = 0; i < 5; i++) { const px = f.x + (i - 2) * 9, ln = pk * (8 + bfR(f.seed, i) * 18); ctx.fillStyle = bfA(c.c2, 0.8); ctx.fillRect(px - 2, f.y + f.vh / 2 - 2, 4, ln); ctx.beginPath(); ctx.arc(px, f.y + f.vh / 2 - 2 + ln, 3, 0, BF_TAU); ctx.fill(); }
        }
        // hơi nóng bốc
        for (let i = 0; i < 6; i++) { const ph = ((t * 0.03 + bfR(f.seed, i)) % 1); ctx.strokeStyle = bfA(c.c2, 0.5 * (1 - ph) * heat); ctx.lineWidth = 1.5; ctx.beginPath(); const hx = f.x + (i - 2.5) * 8, hy = f.y - f.vh / 2 - ph * 50; ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 6, hx, hy - 12); ctx.quadraticCurveTo(hx - 6, hy - 18, hx, hy - 24); ctx.stroke(); }
        if (post > 0) bfRing(f.x, f.y, 14 + post * 90, bfA(c.c, 1 - post), 4);
    },
    // Pháo Tên Lửa: dàn tên lửa lao từ trời xuống, khóa mục tiêu từng điểm
    rocket(f, c, t) {
        const A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 40);
        for (let i = 0; i < 7; i++) {
            const last = i === 6, t0 = last ? 44 : 12 + i * 6, tl = t0 + 16;
            const tx = last ? f.x : f.x + (bfR(f.seed, i) - 0.5) * 140, ty = last ? f.y : f.y + (bfR(f.seed, i + 7) - 0.5) * 110;
            const sx = tx + (bfR(f.seed, i + 14) - 0.5) * 120, sy = ty + A * 320;
            const k = bfE(t, t0, tl), age = t - tl;
            if (t >= t0 - 10 && age < 0) { // dấu khóa mục tiêu
                ctx.save(); ctx.translate(tx, ty); ctx.rotate(t * 0.1); ctx.strokeStyle = bfA('#ef4444', 0.9); ctx.lineWidth = 2; const r = last ? 16 : 9;
                for (let q = 0; q < 4; q++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(r, r - 5); ctx.lineTo(r, r); ctx.lineTo(r - 5, r); ctx.stroke(); }
                ctx.restore();
            }
            if (k > 0 && k < 1) {
                const e = k * k, mx = bfLerp(sx, tx, e), my = bfLerp(sy, ty, e), ang = Math.atan2(ty - sy, tx - sx);
                for (let s = 1; s <= 5; s++) { const kk = Math.max(0, e - s * 0.06); ctx.fillStyle = `rgba(148,163,184,${0.35 - s * 0.05})`; ctx.beginPath(); ctx.arc(bfLerp(sx, tx, kk), bfLerp(sy, ty, kk), 3 + s * 1.6, 0, BF_TAU); ctx.fill(); }
                ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); const sc = last ? 1.8 : 1; ctx.scale(sc, sc);
                ctx.fillStyle = '#e5e7eb'; ctx.fillRect(-12, -3, 16, 6); ctx.fillStyle = '#ef4444'; bfPoly([[4, -3], [10, 0], [4, 3]]); ctx.fill();
                ctx.fillStyle = '#6b7280'; bfPoly([[-12, -3], [-15, -7], [-8, -3]]); ctx.fill(); bfPoly([[-12, 3], [-15, 7], [-8, 3]]); ctx.fill();
                ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 14); bfDisc(-15, 0, 7, c.c2, c.c, 0.9);
                ctx.restore();
            } else if (age >= 0 && age < 22) {
                const a = age / 22; ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 18);
                bfDisc(tx, ty, (last ? 60 : 26) * (0.4 + a), c.c2, c.c, 1 - a); bfRing(tx, ty, (last ? 30 : 12) + a * (last ? 120 : 40), bfA(c.c, 1 - a), 3); ctx.restore();
            }
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfShards(f, 14, 130, c.c, '#6b7280', post, 5); }
    },
    // Cổng Không Gian: cổng xoáy mở dưới nạn nhân, hút xoắn vào rồi đóng sập
    portal(f, c, t) {
        const open = bfE(t, 6, 26), suck = bfE(t, 26, BF_HIT), close = bfE(t, BF_HIT, BF_HIT + 16), post = bfE(t, BF_HIT, BF_HIT + 40);
        const R = 48 * open * (1 - close);
        ctx.save(); ctx.translate(f.x, f.y);
        if (R > 1) {
            ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
            g.addColorStop(0, '#000'); g.addColorStop(0.6, bfA('#1e1b4b', 0.95)); g.addColorStop(1, bfA(c.c, 0.2));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, BF_TAU); ctx.fill();
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 18);
            for (let i = 0; i < 6; i++) { const a0 = t * 0.12 + i / 6 * BF_TAU; ctx.strokeStyle = bfA(i % 2 ? c.c2 : c.c, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * (0.55 + (i % 3) * 0.2), a0, a0 + 1.6); ctx.stroke(); }
            bfRing(0, 0, R, bfA(c.c2, 1), 3);
        }
        // nạn nhân bị hút xoắn vào
        if (t >= 26 && t < BF_HIT + 4) bfBody(0, 0, f.vw, f.vh, suck * suck * 8, 1 - suck * 0.6, c.c, 1 - suck * 0.9, 1 - suck * 0.9);
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) for (let i = 0; i < 18; i++) { const ph = (t * 0.025 + bfR(f.seed, i)) % 1, a = bfR(f.seed, i + 5) * BF_TAU + ph * 6, r = 140 * (1 - ph) + 6; ctx.fillStyle = bfA(i % 2 ? c.c2 : c.c, ph); ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.5 + ph * 2, 0, BF_TAU); ctx.fill(); }
        if (post > 0) { bfGlow(c.c2, 24); ctx.strokeStyle = bfA('#ffffff', 1 - post); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-90 * post - 10, 0); ctx.lineTo(90 * post + 10, 0); ctx.stroke(); bfRing(0, 0, 10 + post * 110, bfA(c.c, 1 - post), 3); }
        ctx.restore();
    },
    // Axit Hóa: vũng axit loang, bọt sủi, nạn nhân thủng lỗ chỗ, khói độc sọ người
    acid(f, c, t) {
        const k = bfE(t, 6, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 7; i++) { const a = bfR(f.seed, i) * BF_TAU, d = 14 * k + bfR(f.seed, i + 3) * 18 * k + post * 30; ctx.fillStyle = bfA(c.c, 0.4); ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.7, (16 + bfR(f.seed, i + 9) * 14) * k + post * 16, 0, BF_TAU); ctx.fill(); }
        // lỗ ăn mòn trên nạn nhân
        for (let i = 0; i < 8; i++) { const hk = bfE(t, 14 + i * 5, 26 + i * 5); if (hk <= 0) continue; ctx.fillStyle = bfA('#1a2e05', 0.9 * (1 - post)); ctx.beginPath(); ctx.arc(f.x + (bfR(f.seed, i + 40) - 0.5) * f.vw * 0.8, f.y + (bfR(f.seed, i + 50) - 0.5) * f.vh * 0.8, 1 + hk * 4, 0, BF_TAU); ctx.fill(); }
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 14; i++) { // bọt sủi
            const ph = (t * (0.03 + bfR(f.seed, i) * 0.02) + bfR(f.seed, i + 1)) % 1, bx = f.x + (bfR(f.seed, i + 2) - 0.5) * (60 + post * 60), by = f.y + (bfR(f.seed, i + 4) - 0.5) * 40;
            ctx.strokeStyle = bfA(i % 3 ? c.c : c.c2, (1 - ph) * k); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 2 + ph * 6, 0, BF_TAU); ctx.stroke();
        }
        for (let i = 0; i < 5; i++) { const ph = (t * 0.02 + i * 0.2) % 1; ctx.fillStyle = bfA(c.c2, 0.25 * (1 - ph) * k); ctx.beginPath(); ctx.arc(f.x + Math.sin(i * 2 + t * 0.05) * 20, f.y - ph * 90, 12 + ph * 16, 0, BF_TAU); ctx.fill(); }
        if (t >= BF_HIT - 4) { const sk = bfE(t, BF_HIT - 4, BF_HIT + 30); bfText('☠', f.x, f.y - 20 - sk * 40, 34 + sk * 10, c.c, c.c2); }
        if (post > 0) { bfGlow(c.c, 12); for (let i = 0; i < 12; i++) { const a = i / 12 * BF_TAU, d = 20 + post * 100; ctx.fillStyle = bfA(c.c, 1 - post); ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 4 * (1 - post) + 1, 0, BF_TAU); ctx.fill(); } }
    },
    // Kỹ Sư: 3 ụ súng thả xuống quanh nạn nhân, đồng loạt khai hỏa hội tụ
    engineer(f, c, t) {
        const post = bfE(t, BF_HIT, BF_HIT + 40);
        for (let i = 0; i < 3; i++) {
            const t0 = 6 + i * 7, k = bfE(t, t0, t0 + 10); if (k <= 0) continue;
            const a = -Math.PI / 2 + i / 3 * BF_TAU + 0.3, tx = f.x + Math.cos(a) * 74, ty = f.y + Math.sin(a) * 74, aim = a + Math.PI;
            const drop = (1 - k) * 60;
            ctx.save(); ctx.translate(tx, ty - drop); ctx.globalAlpha *= k * (1 - post * 0.6);
            ctx.fillStyle = '#334155'; bfPoly([[-12, -7], [-6, -12], [6, -12], [12, -7], [12, 7], [6, 12], [-6, 12], [-12, 7]]); ctx.fill();
            ctx.strokeStyle = c.c2; ctx.lineWidth = 2; ctx.stroke();
            ctx.rotate(aim); ctx.fillStyle = c.c2; ctx.fillRect(0, -3, 18, 6); ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(0, 0, 6, 0, BF_TAU); ctx.fill();
            ctx.restore();
            // tia đạn
            if (t > 28 && t < BF_HIT + 6 && (t + i * 2) % 6 < 2) {
                ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 12); ctx.strokeStyle = bfA(c.c, 1); ctx.lineWidth = t >= BF_HIT ? 5 : 2.5;
                ctx.beginPath(); ctx.moveTo(tx + Math.cos(aim) * 18, ty + Math.sin(aim) * 18); ctx.lineTo(f.x + (bfR(f.seed, t + i) - 0.5) * 12, f.y + (bfR(f.seed, t + i + 9) - 0.5) * 12); ctx.stroke();
                bfDisc(tx + Math.cos(aim) * 20, ty + Math.sin(aim) * 20, 9, c.c2, c.c, 0.9); ctx.restore();
            }
        }
        // cờ lê xoay ở tâm
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(t * 0.15); ctx.globalAlpha *= bfE(t, 20, 30) * (1 - post);
        ctx.strokeStyle = c.c; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(0, 0, 26, 0, BF_TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 16); bfDisc(f.x, f.y, 20 + post * 90, c.c2, c.c, 1 - post); bfShards(f, 12, 110, '#cbd5e1', c.c, post, 5); }
    },
    // Ghost: các vong linh lượn vòng, túm lấy và kéo nạn nhân bay lên tan biến
    ghost(f, c, t) {
        const A = bfAway(f), grab = bfE(t, 30, BF_HIT), lift = bfE(t, BF_HIT - 10, BF_HIT + 40);
        const vx = f.x, vy = f.y + A * lift * 110;
        bfBody(vx, vy, f.vw, f.vh, Math.sin(t * 0.2) * 0.2 * lift, 1 - lift, c.c, 1 - lift * 0.4, 1 - lift * 0.4);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
            const a = i / 6 * BF_TAU + t * (0.08 - grab * 0.05), r = bfLerp(90, f.vw * 0.6, grab);
            const gx = vx + Math.cos(a) * r, gy = vy + Math.sin(a) * r * 0.8, al = bfE(t, 4 + i * 3, 14 + i * 3) * (1 - lift * 0.8);
            if (al <= 0) continue;
            ctx.save(); ctx.translate(gx, gy); ctx.rotate(a + Math.PI / 2 + (grab > 0.5 ? Math.PI : 0) * 0); bfGlow(c.c2, 16);
            ctx.fillStyle = bfA(c.c, 0.75 * al); ctx.beginPath(); ctx.arc(0, 0, 9, Math.PI, 0);
            for (let w = 0; w <= 4; w++) ctx.lineTo(9 - w * 4.5, 10 + (w % 2 ? -4 : 3) + Math.sin(t * 0.4 + w + i) * 2 + 8);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = bfA('#1e1b4b', al); ctx.beginPath(); ctx.arc(-3, -1, 1.8, 0, BF_TAU); ctx.arc(3, -1, 1.8, 0, BF_TAU); ctx.fill();
            ctx.restore();
            if (grab > 0.3) { ctx.strokeStyle = bfA(c.c2, 0.6 * al); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(vx, vy); ctx.stroke(); }
        }
        if (lift > 0.2) for (let i = 0; i < 10; i++) { const ph = (t * 0.03 + bfR(f.seed, i)) % 1; ctx.fillStyle = bfA(c.c, 0.6 * (1 - ph)); ctx.beginPath(); ctx.arc(vx + (bfR(f.seed, i + 3) - 0.5) * 50, vy - A * ph * -60, 2, 0, BF_TAU); ctx.fill(); }
    },
    // Pháo Cao Xạ: đèn pha quét trời, các cụm khói pháo phòng không nổ quanh mục tiêu
    aaa(f, c, t, W, H) {
        const A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        for (let s = 0; s < 2; s++) { // đèn pha
            const bx = f.x + (s ? 140 : -140), by = f.y - A * 200, ang = Math.atan2(f.y - by, f.x - bx) + Math.sin(t * 0.06 + s * 2) * 0.35 * (1 - bfE(t, 30, 50));
            const g = ctx.createLinearGradient(bx, by, bx + Math.cos(ang) * 400, by + Math.sin(ang) * 400); g.addColorStop(0, bfA('#fef9c3', 0.35)); g.addColorStop(1, bfA('#fef9c3', 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ang - 0.08) * 400, by + Math.sin(ang - 0.08) * 400); ctx.lineTo(bx + Math.cos(ang + 0.08) * 400, by + Math.sin(ang + 0.08) * 400); ctx.closePath(); ctx.fill();
        }
        for (let i = 0; i < 12; i++) {
            const last = i >= 9, t0 = last ? 52 + (i - 9) * 3 : 12 + i * 4.5, age = t - t0; if (age < 0 || age > 50) continue;
            const px = f.x + (last ? (i - 10) * 14 : (bfR(f.seed, i) - 0.5) * 170), py = f.y + (last ? 0 : (bfR(f.seed, i + 5) - 0.5) * 150), a = age / 50;
            if (age < 6) { bfGlow(c.c, 16); bfDisc(px, py, 10 + age * 3, c.c2, c.c, 1); }
            ctx.save(); ctx.globalCompositeOperation = 'source-over';
            for (let q = 0; q < 4; q++) { ctx.fillStyle = `rgba(41,37,36,${0.55 * (1 - a)})`; ctx.beginPath(); ctx.arc(px + Math.cos(q * 1.6 + i) * 6, py + Math.sin(q * 1.6 + i) * 6, 6 + a * 14, 0, BF_TAU); ctx.fill(); }
            ctx.restore();
            if (age < 14) for (let q = 0; q < 6; q++) { const sa = q / 6 * BF_TAU + i, d = age * 4; ctx.fillStyle = bfA(c.c2, 1 - age / 14); ctx.fillRect(px + Math.cos(sa) * d - 1, py + Math.sin(sa) * d - 1, 2.5, 2.5); }
        }
        if (post > 0) bfRing(f.x, f.y, 20 + post * 120, bfA(c.c, 1 - post), 5);
    },
    // Kiếm Trận: vòng kiếm xoay quanh nạn nhân, đồng loạt chụm vào
    van_kiem(f, c, t) {
        const conv = bfE(t, 46, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        const n = 14, rot = t * 0.02 + bfE(t, 20, 46) * 2;
        bfGlow(c.c, 12); if (t < BF_HIT) bfRing(f.x, f.y, 90 * (1 - conv) + 10, bfA(c.c, 0.4), 1.5);
        for (let i = 0; i < n; i++) {
            const ap = bfE(t, 4 + i * 2.4, 12 + i * 2.4); if (ap <= 0 || t >= BF_HIT + 2) continue;
            const a = i / n * BF_TAU + rot, r = (92 - conv * conv * 82) * (0.6 + 0.4 * ap);
            ctx.save(); ctx.translate(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); ctx.rotate(a - Math.PI / 2); ctx.globalAlpha *= ap;
            bfSword(28, 3.2, i % 2 ? c.c : c.c2, '#ffffff'); ctx.restore();
        }
        if (post > 0) { bfGlow(c.c, 22); for (let i = 0; i < n; i++) { const a = i / n * BF_TAU + rot, r0 = post * 40, r1 = 20 + post * 170; ctx.strokeStyle = bfA(i % 2 ? c.c : c.c2, 1 - post); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); ctx.stroke(); } bfDisc(f.x, f.y, 30 + post * 50, c.c2, c.c, 1 - post); }
    },
    // Súng Nước: thủy long uốn lượn từ nòng lao tới, nước bắn tung tóe + gợn sóng
    water_gun(f, c, t) {
        const k = bfE(t, 12, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        const dx = f.x - f.ox, dy = f.y - f.oy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        const P = s => { const amp = 26 * Math.sin(s * Math.PI) ; const w = Math.sin(s * 9 - t * 0.35) * amp; return [f.ox + dx * s + nx * w, f.oy + dy * s + ny * w]; };
        ctx.globalCompositeOperation = 'lighter';
        if (t >= 12 && post < 1) {
            const head = Math.min(1, k + post * 0.2), tail = post * 1.1;
            bfGlow(c.c, 20);
            [[c.c, 16, 0.55], [c.c2, 7, 0.8], ['#ffffff', 2, 0.9]].forEach(([col, lw, a]) => {
                ctx.strokeStyle = bfA(col, a * (1 - post)); ctx.lineWidth = lw * (1 - post * 0.5); ctx.beginPath();
                for (let s = tail; s <= head; s += 0.03) { const p = P(Math.min(s, 1)); s === tail ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); }
                ctx.stroke();
            });
            if (t < BF_HIT + 4) { // đầu rồng
                const p = P(head), q = P(Math.max(0, head - 0.04)), ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
                ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang);
                ctx.fillStyle = bfA(c.c, 0.95); ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, BF_TAU); ctx.fill();
                ctx.strokeStyle = bfA(c.c2, 1); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-18, -16); ctx.moveTo(-6, 8); ctx.lineTo(-18, 16); ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, -4, 2.4, 0, BF_TAU); ctx.arc(4, 4, 2.4, 0, BF_TAU); ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, -3); ctx.lineTo(8, 0); ctx.lineTo(14, 3); ctx.stroke();
                ctx.restore();
            }
        }
        if (post > 0) {
            for (let i = 0; i < 3; i++) { const kk = bfE(t, BF_HIT + i * 7, BF_HIT + i * 7 + 30); if (kk > 0 && kk < 1) { ctx.strokeStyle = bfA(c.c2, 1 - kk); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(f.x, f.y, 14 + kk * 110, 10 + kk * 80, 0, 0, BF_TAU); ctx.stroke(); } }
            for (let i = 0; i < 16; i++) { const a = bfR(f.seed, i) * BF_TAU, d = post * (40 + bfR(f.seed, i + 3) * 90), hgt = Math.sin(post * Math.PI) * 20; ctx.fillStyle = bfA(c.c, 1 - post); ctx.beginPath(); ctx.ellipse(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d - hgt, 3, 4.5, a, 0, BF_TAU); ctx.fill(); }
        }
    },
    // Lò Nung: lồng lò sắt nhốt nạn nhân, 5 tầng Đốt thắp dần, cột lửa phun trào
    furnace(f, c, t) {
        const A = bfAway(f), k = bfE(t, 4, 16), heat = bfE(t, 10, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        const bw = f.vw + 22, bh = f.vh + 22;
        // lửa bên trong
        ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 14);
        for (let i = 0; i < 9; i++) { const ph = (t * 0.06 + bfR(f.seed, i)) % 1; bfFlame(f.x - bw / 2 + 8 + i * (bw - 16) / 8, f.y + bh / 2 - 4, 5 + heat * 3, (12 + heat * 26) * (1 - ph * 0.5) * (1 + post), i % 2 ? c.c : c.c2, 0.7 * (1 - post * 0.5)); }
        // lồng lò
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= k * (1 - post); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#57534e'; ctx.lineWidth = 5; ctx.strokeRect(f.x - bw / 2, f.y - bh / 2, bw, bh);
        ctx.strokeStyle = bfA('#78716c', 1); ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(f.x - bw / 2 + i * bw / 5, f.y - bh / 2); ctx.lineTo(f.x - bw / 2 + i * bw / 5, f.y + bh / 2); ctx.stroke(); }
        ctx.strokeStyle = bfA(c.c, heat); ctx.lineWidth = 1.5; ctx.strokeRect(f.x - bw / 2 - 3, f.y - bh / 2 - 3, bw + 6, bh + 6);
        ctx.restore();
        // 5 tầng Đốt
        for (let i = 0; i < 5; i++) { const on = t >= 14 + i * 9; const sx = f.x + (i - 2) * 18, sy = f.y + A * (bh / 2 + 18); ctx.save(); ctx.globalCompositeOperation = on ? 'lighter' : 'source-over'; bfGlow(c.c, on ? 12 : 0); bfFlame(sx, sy + 5, 5, 14, on ? c.c : '#44403c', (on ? 1 : 0.8) * (1 - post)); ctx.restore(); }
        if (post > 0) { // cột lửa
            bfGlow(c.c, 30); const w = 40 * (1 - post * 0.6), h = 260 * Math.min(1, post * 4);
            const g = ctx.createLinearGradient(0, f.y, 0, f.y + A * h); g.addColorStop(0, bfA('#ffffff', 0.9 * (1 - post))); g.addColorStop(0.3, bfA(c.c, 0.8 * (1 - post))); g.addColorStop(1, bfA(c.c2, 0));
            ctx.fillStyle = g; ctx.fillRect(f.x - w / 2, Math.min(f.y, f.y + A * h), w, h);
            bfRing(f.x, f.y, 20 + post * 100, bfA(c.c, 1 - post), 5);
        }
    },
    // Âm Dương Sư: thái cực đồ xoay dưới chân, bùa chú bay tới dán lên nạn nhân rồi kích nổ
    am_duong_su(f, c, t) {
        const k = bfE(t, 4, 18), post = bfE(t, BF_HIT, BF_HIT + 40), R = 56 * k * (1 + post * 0.5);
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(t * 0.05 * (1 + post * 4)); ctx.globalAlpha *= 0.75 * (1 - post);
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); ctx.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); ctx.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2); ctx.fill();
        ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, 0, R, Math.PI / 2, -Math.PI / 2); ctx.arc(0, -R / 2, R / 2, -Math.PI / 2, Math.PI / 2, false); ctx.arc(0, R / 2, R / 2, -Math.PI / 2, Math.PI / 2, true); ctx.fill();
        ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, -R / 2, R / 7, 0, BF_TAU); ctx.fill(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, R / 2, R / 7, 0, BF_TAU); ctx.fill();
        ctx.strokeStyle = c.c2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, BF_TAU); ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 6; i++) {
            const t0 = 12 + i * 6, kk = bfE(t, t0, t0 + 10); if (kk <= 0) continue;
            const a = i / 6 * BF_TAU + 0.3, sx = f.x + Math.cos(a) * 200, sy = f.y + Math.sin(a) * 200;
            const tx = f.x + (bfR(f.seed, i) - 0.5) * f.vw * 0.8, ty = f.y + (bfR(f.seed, i + 4) - 0.5) * f.vh * 0.8;
            const px = bfLerp(sx, tx, kk), py = bfLerp(sy, ty, kk);
            if (t < BF_HIT + 2) {
                ctx.save(); ctx.translate(px, py); ctx.rotate(a + (1 - kk) * 6); bfGlow(c.c2, 8);
                ctx.fillStyle = '#fde68a'; ctx.fillRect(-5, -9, 10, 18); ctx.strokeStyle = c.c2; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.moveTo(-3, -2); ctx.lineTo(3, -2); ctx.moveTo(-3, 3); ctx.lineTo(3, 3); ctx.stroke(); ctx.restore();
            } else if (post < 0.6) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 16); bfDisc(tx, ty, 10 + post * 50, i % 2 ? '#ffffff' : c.c2, c.c2, 1 - post / 0.6); ctx.restore(); }
        }
    },
    // 6 Nòng: cụm 6 nòng quay tít, màn đạn dày đặc + vỏ đạn đồng tuôn xối xả
    six_barrel(f, c, t) {
        const oa = bfOA(f) + Math.PI, spin = bfE(t, 4, 28), post = bfE(t, BF_HIT, BF_HIT + 40);
        const gx = f.ox + Math.cos(oa) * 30, gy = f.oy + Math.sin(oa) * 30;
        ctx.save(); ctx.translate(gx, gy); ctx.rotate(oa); ctx.globalAlpha *= 1 - post * 0.5;
        ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, BF_TAU); ctx.fill();
        const ang = t * t * 0.004 * spin;
        for (let i = 0; i < 6; i++) { const a = ang + i / 6 * BF_TAU, cy = Math.sin(a) * 11, dep = Math.cos(a); ctx.fillStyle = dep > 0 ? '#d1d5db' : '#6b7280'; ctx.fillRect(0, cy - 2.6, 26, 5.2); }
        ctx.fillStyle = t > 28 ? bfA(c.c2, 0.6 + 0.4 * post) : '#9ca3af'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, BF_TAU); ctx.fill();
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        if (t > 28 && t < BF_HIT + 8) {
            bfGlow(c.c, 14);
            for (let i = 0; i < 9; i++) { const s = ((t * 0.18 + i / 9) % 1), jx = (bfR(f.seed, i + t) - 0.5) * 16, ex = bfLerp(gx, f.x + jx, s), ey = bfLerp(gy, f.y + jx * 0.5, s), sx2 = bfLerp(gx, f.x + jx, Math.max(0, s - 0.12)), sy2 = bfLerp(gy, f.y + jx * 0.5, Math.max(0, s - 0.12)); ctx.strokeStyle = bfA(i % 2 ? c.c : c.c2, 0.9); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(ex, ey); ctx.stroke(); }
            bfDisc(gx + Math.cos(oa) * 32, gy + Math.sin(oa) * 32, 14 + Math.random() * 0, c.c2, c.c, 0.9);
            for (let i = 0; i < 4; i++) { const a = bfR(f.seed, t + i) * BF_TAU, d = 6 + bfR(f.seed, t + i + 2) * 22; ctx.fillStyle = bfA('#fff7ed', 0.9); ctx.fillRect(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 2.5, 2.5); }
        }
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 14; i++) { const t0 = 30 + i * 3, kk = bfE(t, t0, t0 + 24); if (kk <= 0 || kk >= 1) continue; const sa = oa + Math.PI / 2 + (bfR(f.seed, i) - 0.5) * 0.8; ctx.save(); ctx.translate(gx + Math.cos(sa) * kk * 70, gy + Math.sin(sa) * kk * 70 + kk * kk * 20); ctx.rotate(kk * 10 + i); ctx.globalAlpha *= 1 - kk; ctx.fillStyle = '#d97706'; ctx.fillRect(-1.5, -4, 3, 8); ctx.restore(); }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfShards(f, 14, 110, c.c, c.c2, post, 4); bfRing(f.x, f.y, 14 + post * 80, bfA(c.c, 1 - post), 3); }
    },
    // Kẻ Mạnh Nhất: Gojo niệm Xanh + Đỏ ngay trước nòng (camera cận cảnh) -> hợp thành Tím -> Tím lao qua sân
    // (camera bám theo) -> nổ xóa sổ không gian tại mục tiêu, sóng xung kích lan khắp màn hình
    the_strongest(f, c, t, W, H) {
        const A = bfAway(f), px = f.ox, py = f.oy + A * 34;
        const k = bfE(t, 4, 36), merge = bfE(t, 30, 44), post = bfE(t, BF_HIT, BF_HIT + 50);
        const fly = typeof fcamEase === 'function' ? fcamEase(bfE(t, 44, BF_HIT)) : bfE(t, 44, BF_HIT);
        ctx.globalCompositeOperation = 'lighter';
        if (t < 44) {
            // cột sáng + vòng ấn dưới chân người niệm
            const a0 = Math.min(1, t / 8);
            ctx.save(); ctx.globalAlpha *= a0;
            const pg = ctx.createLinearGradient(f.ox - 22, 0, f.ox + 22, 0);
            pg.addColorStop(0, 'rgba(168,85,247,0)'); pg.addColorStop(0.5, 'rgba(233,213,255,0.55)'); pg.addColorStop(1, 'rgba(168,85,247,0)');
            ctx.fillStyle = pg; ctx.fillRect(f.ox - 22, f.oy - 260, 44, 520);
            bfGlow(c.c, 14); ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 2;
            bfRing(f.ox, f.oy, 40 - k * 6, bfA('#e9d5ff', 0.8), 2); ctx.setLineDash([]);
            bfRing(f.ox, f.oy, 28 + 4 * Math.sin(t * 0.4), bfA(c.c, 0.6), 1.5);
            ctx.restore();
            // Xanh & Đỏ xoay quanh rồi hợp vào điểm trước nòng
            const d = 46 * (1 - k * k) + 6, sp = t * (0.18 + k * 0.25);
            [[0, '#3b82f6', '#dbeafe'], [Math.PI, '#ef4444', '#fee2e2']].forEach(([off, col, hi]) => {
                const ox = px + Math.cos(sp + off) * d, oy = py + Math.sin(sp + off) * d * 0.7;
                bfGlow(col, 26); bfDisc(ox, oy, 15 + 4 * Math.sin(t * 0.5 + off), hi, col, 0.95);
                ctx.strokeStyle = bfA(col, 0.55); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, d, sp + off - 1.1, sp + off); ctx.stroke();
            });
            if (merge > 0) { bfGlow(c.c, 40); bfDisc(px, py, 8 + merge * 26, '#f5f3ff', c.c, merge); }
        } else {
            // vị trí khối Tím: trước mốc chạm bám đúng nhịp camera, sau đó xuyên tiếp tới mép sân
            const after = bfE(t, BF_HIT, BF_HIT + 26);
            const ex = bfLerp(f.x, f.x + (f.x - px) * 0.6, after), ey = bfLerp(f.y, A < 0 ? -80 : H + 80, after);
            const cx = t < BF_HIT ? bfLerp(px, f.x, fly) : ex, cy = t < BF_HIT ? bfLerp(py, f.y, fly) : ey;
            const R = 34 + fly * 10, fade = 1 - bfE(t, BF_HIT + 30, BF_DUR - 10);
            // vệt không gian bị xóa
            ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(0,0,0,${0.8 * fade})`;
            ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(cy - py, cx - px));
            const L = Math.hypot(cx - px, cy - py); ctx.fillRect(0, -R, L, R * 2);
            ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = bfA(c.c, 0.8 * fade); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(L, -R); ctx.moveTo(0, R); ctx.lineTo(L, R); ctx.stroke();
            ctx.restore();
            if (fade > 0.05) {
                ctx.globalAlpha *= fade;
                bfGlow(c.c, 40); bfDisc(cx, cy, R * 1.6, '#f5f3ff', c.c, 1);
                ctx.strokeStyle = bfA('#ef4444', 0.85); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, t * 0.3, t * 0.3 + 2.5); ctx.stroke();
                ctx.strokeStyle = bfA('#60a5fa', 0.85); ctx.beginPath(); ctx.arc(cx, cy, R, t * 0.3 + Math.PI, t * 0.3 + Math.PI + 2.5); ctx.stroke();
            }
            if (post > 0) {
                // nổ xóa sổ: quả cầu tím phình to + vòng méo không gian + sóng xung kích khắp màn hình
                ctx.globalAlpha = 1;
                bfGlow(c.c, 50); bfDisc(f.x, f.y, 40 + post * 150, '#faf5ff', c.c, 1 - post);
                for (let i = 0; i < 4; i++) {
                    const q = bfE(t, BF_HIT + i * 6, BF_HIT + i * 6 + 40); if (q <= 0 || q >= 1) continue;
                    bfRing(f.x, f.y, 20 + q * Math.max(W, H) * 1.1, bfA(i % 2 ? '#60a5fa' : '#ef4444', 0.8 * (1 - q)), 6 * (1 - q) + 1);
                }
                for (let i = 0; i < 3; i++) {
                    const q = bfE(t, BF_HIT + 4 + i * 8, BF_HIT + 40 + i * 8); if (q <= 0 || q >= 1) continue;
                    ctx.strokeStyle = bfA('#e9d5ff', 0.5 * (1 - q)); ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(f.x, f.y, 30 + q * 140, (30 + q * 140) * 0.55, t * 0.05 + i, 0, BF_TAU); ctx.stroke();
                }
                bfShards(f, 18, 160, c.c, '#93c5fd', post, 4);
            }
        }
    },
    // Sniper: ống ngắm khóa mục tiêu (kiểu gốc) + chữ HEADSHOT
    sniper(f, c, t, W, H) {
        // tia laser ngắm từ nòng (camera cận cảnh xạ thủ) + viên đạn vạch đường bay qua sân (camera bám theo)
        if (t < BF_HIT) {
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow('#f43f5e', 8);
            ctx.strokeStyle = bfA('#f43f5e', (0.35 + 0.3 * Math.sin(t * 0.6)) * Math.min(1, t / 8)); ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(f.x, f.y); ctx.stroke();
            bfGlow(c.c, 16); bfDisc(f.ox, f.oy + bfAway(f) * 16, 6 + 3 * Math.sin(t * 0.8), '#fff', c.c, 0.9);
            if (t >= 44) {
                const u = typeof fcamEase === 'function' ? fcamEase(bfE(t, 44, BF_HIT)) : bfE(t, 44, BF_HIT);
                const bx = bfLerp(f.ox, f.x, u), by = bfLerp(f.oy, f.y, u), tx = bfLerp(f.ox, f.x, Math.max(0, u - 0.25)), ty = bfLerp(f.oy, f.y, Math.max(0, u - 0.25));
                ctx.strokeStyle = bfA(c.c, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.stroke();
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bfLerp(tx, bx, 0.5), bfLerp(ty, by, 0.5)); ctx.lineTo(bx, by); ctx.stroke();
                bfDisc(bx, by, 7, '#fff', c.c, 1);
                if (t < 48) bfRing(f.ox, f.oy, 10 + (t - 44) * 8, bfA('#fff', 1 - (t - 44) / 4), 2);
            }
            ctx.restore();
        }
        BF_STYLES.scope(f, c, t, W, H);
        if (t >= BF_HIT + 2 && t < BF_HIT + 50) bfText('HEADSHOT', f.x, f.y + bfAway(f) * 50, 18 * (1.4 - 0.4 * bfE(t, BF_HIT + 2, BF_HIT + 10)), c.c2, '#fff');
    },
    // Bow: loạt tên bắn vòng cầu từ trời cắm tua tủa quanh nạn nhân
    cung(f, c, t) {
        const A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 40);
        for (let i = 0; i < 18; i++) {
            const t0 = 6 + i * 2.8 - (i === 17 ? 4 : 0), k = bfE(t, t0, t0 + 14); if (k <= 0) continue;
            const tx = f.x + (i === 17 ? 0 : (bfR(f.seed, i) - 0.5) * 110), ty = f.y + (i === 17 ? 0 : (bfR(f.seed, i + 5) - 0.5) * 90);
            const sx = f.ox + (bfR(f.seed, i + 9) - 0.5) * 60, sy = f.oy, cx = (sx + tx) / 2 + (bfR(f.seed, i + 13) - 0.5) * 80, cy = Math.min(sy, ty) * (A < 0 ? 1 : 0) + Math.max(sy, ty) * (A > 0 ? 1 : 0) + A * 160;
            const q = (s) => [(1 - s) * (1 - s) * sx + 2 * (1 - s) * s * cx + s * s * tx, (1 - s) * (1 - s) * sy + 2 * (1 - s) * s * cy + s * s * ty];
            const p = q(k), p0 = q(Math.max(0, k - 0.06)), ang = Math.atan2(p[1] - p0[1], p[0] - p0[0]);
            ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.globalAlpha *= 1 - post * 0.8;
            const len = i === 17 ? 34 : 20, stuck = k >= 1;
            if (!stuck) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 10); ctx.strokeStyle = bfA(c.c, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-len - 16, 0); ctx.lineTo(-len, 0); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
            const vis = stuck ? 0.6 : 1; // mũi cắm vào đất
            ctx.strokeStyle = '#a16207'; ctx.lineWidth = i === 17 ? 3 : 2; ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(stuck ? -len * (1 - vis) : 0, 0); ctx.stroke();
            ctx.fillStyle = c.c; bfPoly([[-len, 0], [-len - 6, -4], [-len - 3, 0], [-len - 6, 4]]); ctx.fill();
            if (!stuck) { ctx.fillStyle = c.c2; bfPoly([[5, 0], [-1, -3.5], [-1, 3.5]]); ctx.fill(); }
            else { ctx.fillStyle = bfA('#000', 0.5); ctx.beginPath(); ctx.ellipse(0, 0, 3, 2, 0, 0, BF_TAU); ctx.fill(); }
            ctx.restore();
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 18); bfRing(f.x, f.y, 16 + post * 100, bfA(c.c, 1 - post), 4); bfShards(f, 10, 100, c.c, c.c2, post, 4); }
    },
    // Mirror: 4 tấm gương bao vây phản chiếu nạn nhân, tia sáng dội qua lại rồi gương vỡ tan
    mirror(f, c, t) {
        const k = bfE(t, 6, 26), post = bfE(t, BF_HIT, BF_HIT + 40);
        const pos = [[-1, 0], [1, 0], [0, -1], [0, 1]], D = 58;
        if (t < BF_HIT) pos.forEach(([px, py], i) => {
            const mx = f.x + px * D * (2 - k), my = f.y + py * D * (2 - k);
            ctx.save(); ctx.translate(mx, my); ctx.rotate(px ? 0 : Math.PI / 2); ctx.globalAlpha *= k;
            const g = ctx.createLinearGradient(-8, -26, 8, 26); g.addColorStop(0, bfA(c.c, 0.85)); g.addColorStop(0.5, bfA(c.c2, 0.45)); g.addColorStop(1, bfA('#ffffff', 0.8));
            ctx.fillStyle = g; ctx.fillRect(-6, -28, 12, 56); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5; ctx.strokeRect(-6, -28, 12, 56);
            ctx.strokeStyle = bfA('#ffffff', 0.9); ctx.lineWidth = 1.5; const sh = ((t * 2 + i * 14) % 70) - 35; ctx.beginPath(); ctx.moveTo(-5, sh); ctx.lineTo(5, sh - 8); ctx.stroke();
            ctx.restore();
            bfBody(f.x + px * D * 1.55, f.y + py * D * 1.55, f.vw * 0.5, f.vh * 0.5, 0, 0.35 * k, c.c2); // bóng phản chiếu
        });
        if (t > 26 && t < BF_HIT) { // tia dội giữa các gương
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 14); ctx.strokeStyle = bfA('#ffffff', 0.9); ctx.lineWidth = 2;
            const kk = bfE(t, 26, BF_HIT), seq = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, 0], [1, 0], [0, -1], [0, 1]], n = Math.floor(kk * seq.length);
            ctx.beginPath(); ctx.moveTo(f.x + seq[0][0] * D, f.y + seq[0][1] * D);
            for (let i = 1; i <= n && i < seq.length; i++) ctx.lineTo(f.x + seq[i][0] * D, f.y + seq[i][1] * D);
            ctx.stroke();
        }
        if (post > 0) {
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 12);
            pos.forEach(([px, py], i) => { for (let s = 0; s < 6; s++) { const a = Math.atan2(py, px) + (bfR(f.seed, i * 6 + s) - 0.5) * 1.6, d = D + post * (30 + bfR(f.seed, s + i) * 90), sz = 5 + bfR(f.seed, s + 40) * 7; ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(post * 8 + s); ctx.fillStyle = bfA(s % 2 ? c.c : c.c2, 1 - post); bfPoly([[0, -sz], [sz * 0.6, sz * 0.5], [-sz * 0.5, sz * 0.4]]); ctx.fill(); ctx.strokeStyle = bfA('#ffffff', 1 - post); ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); } });
            if (post < 0.4) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.strokeStyle = bfA('#ffffff', 1 - post / 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x - Math.cos(a) * 30, f.y - Math.sin(a) * 30); ctx.lineTo(f.x + Math.cos(a) * 30, f.y + Math.sin(a) * 30); ctx.stroke(); }
        }
    },
    // Vua Đầu Bếp: điện thờ Phục Ma hiện sau lưng, lĩnh vực Giải/Bát chém băm vụn nạn nhân
    sukuna(f, c, t) {
        const A = bfAway(f), k = bfE(t, 4, 24), dens = bfE(t, 20, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        // điện thờ (cổng torii)
        ctx.save(); ctx.translate(f.x, f.y + A * 50); if (A > 0) ctx.rotate(Math.PI); ctx.globalAlpha *= k * 0.85 * (1 - post * 0.5); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-46, -40, 8, 60); ctx.fillRect(38, -40, 8, 60);
        ctx.fillStyle = c.c; ctx.beginPath(); ctx.moveTo(-64, -50); ctx.quadraticCurveTo(0, -60, 64, -50); ctx.lineTo(60, -42); ctx.quadraticCurveTo(0, -50, -60, -42); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#991b1b'; ctx.fillRect(-52, -32, 104, 6);
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= k * 0.5 * (1 - post); ctx.strokeStyle = c.c; ctx.lineWidth = 1.5; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(f.x, f.y, 100, 0, BF_TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        // nhát chém dày đặc
        ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 10);
        if (t < BF_HIT + 6) { const n = Math.floor(4 + dens * 22); for (let i = 0; i < n; i++) { const sd = f.seed + Math.floor(t / 3) * 0.37, px = f.x + (bfR(sd, i) - 0.5) * 180 * (0.4 + 0.6 * (1 - dens)), py = f.y + (bfR(sd, i + 40) - 0.5) * 180 * (0.4 + 0.6 * (1 - dens)), a = bfR(sd, i + 80) * Math.PI, l = 10 + bfR(sd, i + 90) * 18; ctx.strokeStyle = bfA(i % 3 ? c.c2 : '#ffffff', 0.9); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - Math.cos(a) * l, py - Math.sin(a) * l); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); ctx.stroke(); } }
        if (post > 0) { // băm thành 9 mảnh
            ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
            for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) { const s = f.vw / 3; ctx.save(); ctx.translate(f.x + gx * (s + post * 40), f.y + gy * (s + post * 40)); ctx.rotate(post * (gx + gy) * 1.5); ctx.globalAlpha *= 1 - post; ctx.fillStyle = '#1e293b'; ctx.fillRect(-s / 2, -s / 2, s - 1, s - 1); ctx.strokeStyle = c.c; ctx.lineWidth = 1.5; ctx.strokeRect(-s / 2, -s / 2, s - 1, s - 1); ctx.restore(); }
        }
    },
    // Paradox: đồng hồ cát lật ngược, tàn ảnh tua ngược, nạn nhân tách thành 3 dòng thời gian
    paradox(f, c, t) {
        const k = bfE(t, 4, 20), flip = bfE(t, 28, 42), post = bfE(t, BF_HIT, BF_HIT + 45);
        // tàn ảnh tua ngược
        if (t < BF_HIT) for (let i = 4; i >= 1; i--) { const rw = bfE(t, 10, BF_HIT) * 0 + (1 - flip) * 1 + flip * (1 - bfE(t, 42, BF_HIT)); const off = i * 16 * rw; bfBody(f.x + Math.cos(i * 1.7) * off, f.y + Math.sin(i * 1.7) * off, f.vw, f.vh, 0, 0.25 * k, i % 2 ? c.c : c.c2); }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(flip * Math.PI); ctx.globalAlpha *= k * (1 - post); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 14);
        ctx.strokeStyle = bfA(c.c, 1); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-22, -34); ctx.lineTo(22, -34); ctx.lineTo(3, 0); ctx.lineTo(22, 34); ctx.lineTo(-22, 34); ctx.lineTo(-3, 0); ctx.closePath(); ctx.stroke();
        const sand = flip < 1 ? 1 - bfE(t, 6, 28) : bfE(t, 42, BF_HIT); ctx.fillStyle = bfA(c.c2, 0.8);
        bfPoly([[-18 * sand, -30 + 26 * (1 - sand)], [18 * sand, -30 + 26 * (1 - sand)], [2, -4], [-2, -4]]); if (sand > 0.05) ctx.fill();
        bfPoly([[-18 * (1 - sand), 30], [18 * (1 - sand), 30], [2, 30 - 26 * (1 - sand)], [-2, 30 - 26 * (1 - sand)]]); if (sand < 0.95) ctx.fill();
        ctx.fillRect(-1, -4, 2, 8);
        ctx.restore();
        if (post > 0) { // 3 dòng thời gian tách rời
            ctx.globalCompositeOperation = 'lighter';
            [[c.c, -1], ['#ffffff', 0], [c.c2, 1]].forEach(([col, s], i) => { bfBody(f.x + s * post * 60, f.y - Math.abs(s) * post * 20 * (i - 1), f.vw, f.vh, s * post, (1 - post) * 0.8, col); });
            bfRing(f.x, f.y, 20 + post * 90, bfA(c.c2, 1 - post), 3);
            for (let i = 0; i < 6; i++) { const y = f.y + (bfR(f.seed + Math.floor(t / 2), i) - 0.5) * 140; ctx.fillStyle = bfA(i % 2 ? c.c : c.c2, 0.3 * (1 - post)); ctx.fillRect(f.x - 120, y, 240, 2 + bfR(f.seed, i) * 5); }
        }
    },
    // Nhà Ảo Thuật: mũ chóp úp xuống, rèm đỏ khép lại… mở ra chỉ còn bồ câu bay đi
    magician(f, c, t) {
        const A = bfAway(f), hat = bfE(t, 6, 30), cur = bfE(t, 30, 54), open = bfE(t, BF_HIT, BF_HIT + 18), post = bfE(t, BF_HIT, BF_HIT + 45);
        if (t < BF_HIT) {
            const hy = f.y + A * 120 * (1 - hat) - 4;
            ctx.save(); ctx.translate(f.x, hy); ctx.globalAlpha *= Math.min(1, hat * 3);
            ctx.fillStyle = '#0f0f14'; ctx.fillRect(-22, -6, 44, 8); ctx.fillRect(-14, -36, 28, 32); ctx.fillStyle = c.c; ctx.fillRect(-14, -12, 28, 6);
            ctx.restore();
            for (let i = 0; i < 8; i++) { const a = t * 0.15 + i / 8 * BF_TAU, r = 30 + 10 * Math.sin(t * 0.1 + i); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = bfA(bfPal(c, i), 0.9 * hat); ctx.translate(f.x + Math.cos(a) * r, hy - 14 + Math.sin(a) * r * 0.6); ctx.rotate(-a); bfPoly([[0, -4], [1.2, -1.2], [4, 0], [1.2, 1.2], [0, 4], [-1.2, 1.2], [-4, 0], [-1.2, -1.2]]); ctx.fill(); ctx.restore(); }
        }
        // rèm nhung
        const cw = 100 * (cur * (1 - open)), ch = 160;
        if (cw > 1) for (const s of [-1, 1]) {
            ctx.save(); ctx.translate(f.x + s * 100, f.y); const g = ctx.createLinearGradient(-s * cw, 0, 0, 0); g.addColorStop(0, '#991b1b'); g.addColorStop(1, '#450a0a');
            ctx.fillStyle = g; ctx.fillRect(s < 0 ? 0 : -cw, -ch / 2, cw, ch);
            ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; for (let i = 1; i < 5; i++) { const lx = (s < 0 ? 0 : -cw) + i * cw / 5; ctx.beginPath(); ctx.moveTo(lx, -ch / 2); ctx.lineTo(lx, ch / 2); ctx.stroke(); }
            ctx.fillStyle = c.c2; ctx.fillRect(s < 0 ? 0 : -cw, -ch / 2, cw, 5); ctx.restore();
        }
        if (open > 0) { // bồ câu & bài
            for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 * -A + (i - 3) * 0.35, d = post * (60 + i * 12), px = f.x + Math.cos(a) * d * (i % 2 ? 1 : 0.8), py = f.y + Math.sin(a) * d; const fl = Math.sin(t * 0.8 + i) * 5; ctx.save(); ctx.translate(px, py); ctx.globalAlpha *= 1 - post * 0.7; ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3.5, 0, 0, BF_TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(-9, -fl - 3); ctx.lineTo(-3, -1); ctx.moveTo(1, 0); ctx.lineTo(9, -fl - 3); ctx.lineTo(3, -1); ctx.fill(); ctx.restore(); }
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 14);
            for (let i = 0; i < 6; i++) { const a = bfR(f.seed, i) * BF_TAU, d = post * 110; ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(post * 6 + i); ctx.fillStyle = bfA('#f8fafc', 1 - post); ctx.fillRect(-5, -7, 10, 14); ctx.fillStyle = bfA(i % 2 ? '#ef4444' : '#111', 1 - post); ctx.font = '900 9px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♠♥♦♣'[i % 4], 0, 0); ctx.restore(); }
            if (post < 0.7) bfText('TA-DA!', f.x, f.y, 22, c.c2, c.c);
        }
    },
    // Nhà Phát Minh: phi đội drone bay ngang thả bom, chấm laser đánh dấu
    inventor(f, c, t) {
        const A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 40);
        for (let d = 0; d < 3; d++) {
            const k = bfE(t, 6 + d * 5, 70 + d * 5), dxp = bfLerp(-220, 220, k), dyp = A * (60 + d * 22) + (d - 1) * 10;
            const px = f.x + dxp * (d % 2 ? -1 : 1), py = f.y + dyp;
            if (k > 0 && k < 1) {
                ctx.save(); ctx.translate(px, py); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); ctx.stroke();
                ctx.fillStyle = '#1e293b'; ctx.fillRect(-7, -7, 14, 14); ctx.fillStyle = c.c; ctx.fillRect(-3, -3, 6, 6);
                for (const [rx, ry] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) { ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * 0.9); ctx.strokeStyle = bfA(c.c2, 0.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.restore(); }
                ctx.restore();
                if (t > 24 && t < BF_HIT) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = bfA('#ef4444', 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(f.x + (d - 1) * 12, f.y); ctx.stroke(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(f.x + (d - 1) * 12, f.y, 2.5, 0, BF_TAU); ctx.fill(); ctx.restore(); }
            }
            // bom rơi (nhìn từ trên: to dần)
            for (let b = 0; b < 2; b++) {
                const t0 = 36 + d * 4 + b * 8, bk = bfE(t, t0, t0 + 14), bx = f.x + (d - 1) * 16 + (b - 0.5) * 10, by = f.y + (b - 0.5) * 12;
                if (bk > 0 && bk < 1) { ctx.fillStyle = '#111827'; ctx.strokeStyle = c.c2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by + A * (1 - bk) * 50, 2 + bk * 5, 0, BF_TAU); ctx.fill(); ctx.stroke(); }
                const age = t - t0 - 14; if (age >= 0 && age < 18) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 16); bfDisc(bx, by, 14 + age * 2.5, c.c2, '#f97316', 1 - age / 18); ctx.restore(); }
            }
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfRing(f.x, f.y, 20 + post * 100, bfA(c.c, 1 - post), 4); bfShards(f, 10, 100, c.c2, '#64748b', post, 5); }
    },
    // Shadow Hunter: bóng tối khép kín, đôi mắt đỏ hiện sau lưng, vết vuốt 3 đường + máu rỉ
    shadow_hunter(f, c, t, W, H) {
        const A = bfAway(f), dark = bfE(t, 6, 44), post = bfE(t, BF_HIT, BF_HIT + 45);
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        const R = bfLerp(Math.max(W, H), 70, dark) * (1 + post * 2);
        const g = ctx.createRadialGradient(f.x, f.y, R * 0.4, f.x, f.y, R); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(3,0,10,${0.92 * (1 - post)})`);
        ctx.fillStyle = g; ctx.fillRect(f.x - 1000, f.y - 1000, 2000, 2000); ctx.restore();
        if (t > 26 && t < BF_HIT + 30) { // mắt đỏ
            const ea = bfE(t, 26, 34) * (1 - bfE(t, BF_HIT + 10, BF_HIT + 30)), blink = (t % 40) < 3 ? 0.2 : 1;
            ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 20); ctx.fillStyle = bfA(c.c2, ea);
            for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(f.x + s * 14, f.y + A * 44, 7, 2.6 * blink, s * -0.25, 0, BF_TAU); ctx.fill(); }
        }
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { // 3 đường vuốt
            const k = bfE(t, 50 + i * 2, 58 + i * 2); if (k <= 0) continue; const fade = 1 - post;
            const ox = (i - 1) * 13; bfGlow(c.c2, 14); ctx.strokeStyle = bfA(c.c2, fade); ctx.lineWidth = 5 * fade + 1;
            ctx.beginPath(); ctx.moveTo(f.x + ox - 36, f.y - 46); ctx.quadraticCurveTo(f.x + ox + 4, f.y, bfLerp(f.x + ox - 36, f.x + ox + 30, k), bfLerp(f.y - 46, f.y + 48, k)); ctx.stroke();
            ctx.strokeStyle = bfA('#ffffff', fade); ctx.lineWidth = 1.5; ctx.stroke();
        }
        if (post > 0) { ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; for (let i = 0; i < 9; i++) { const px = f.x + (i - 4) * 7, l = post * (10 + bfR(f.seed, i) * 30); ctx.fillStyle = bfA('#b91c1c', 1 - post * 0.6); ctx.fillRect(px - 1.5, f.y + (i % 3 - 1) * 8, 3, l); ctx.beginPath(); ctx.arc(px, f.y + (i % 3 - 1) * 8 + l, 2.6, 0, BF_TAU); ctx.fill(); } }
    },
    // Shortgun: quét radar 180px, lướt áp sát để lại tàn ảnh, nón bộc phá nổ định hướng
    shortgunATK(f, c, t) {
        const oa = bfOA(f), dx = Math.cos(oa), dy = Math.sin(oa), dash = bfE(t, 18, 34), charge = bfE(t, 34, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        if (t < 22) { const sa = bfE(t, 2, 20); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = bfA(c.c, 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.ox, f.oy, 180 * sa, oa + Math.PI - 1.6, oa + Math.PI + 1.6); ctx.stroke(); ctx.restore(); }
        const nx = f.x + dx * 40, ny = f.y + dy * 40;
        if (t >= 18) for (let i = 0; i < 4; i++) { const kk = Math.max(0, dash - i * 0.12); bfBody(bfLerp(f.ox, nx, kk), bfLerp(f.oy, ny, kk), f.vw * 0.9, f.vh * 0.9, oa + Math.PI / 2, (i ? 0.25 : 0.7) * (1 - post), c.c); }
        const ca = oa + Math.PI; // nón hướng về nạn nhân
        ctx.globalCompositeOperation = 'lighter';
        if (t >= 34 && t < BF_HIT) { const pul = 0.3 + 0.4 * (Math.floor(t / 3) % 2); ctx.fillStyle = bfA(c.c2, pul * charge); ctx.beginPath(); ctx.moveTo(nx, ny); ctx.arc(nx, ny, 90, ca - 0.5, ca + 0.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = bfA(c.c, 0.9); ctx.lineWidth = 2; ctx.stroke(); }
        if (post > 0) {
            bfGlow(c.c, 26); const R = 40 + post * 200;
            const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, R); g.addColorStop(0, bfA('#ffffff', 0.9 * (1 - post))); g.addColorStop(0.4, bfA(c.c, 0.8 * (1 - post))); g.addColorStop(1, bfA(c.c2, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.arc(nx, ny, R, ca - 0.55, ca + 0.55); ctx.closePath(); ctx.fill();
            for (let i = 0; i < 12; i++) { const a = ca + (bfR(f.seed, i) - 0.5) * 1.1, r0 = post * 60 + bfR(f.seed, i + 3) * 30, r1 = r0 + 26; ctx.strokeStyle = bfA(i % 2 ? c.c2 : '#fde68a', 1 - post); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(nx + Math.cos(a) * r0, ny + Math.sin(a) * r0); ctx.lineTo(nx + Math.cos(a) * r1, ny + Math.sin(a) * r1); ctx.stroke(); }
        }
    },
    // Nam Châm: 2 cực N/S khổng lồ ép từ 2 bên, đường sức từ, nạn nhân bị bóp dẹp
    magnet(f, c, t) {
        const k = bfE(t, 6, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40), e = k * k;
        const gap = bfLerp(150, f.vw / 2 + 12, e) - post * 4;
        if (t > 14 && t < BF_HIT + 10) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t; for (let i = -2; i <= 2; i++) { ctx.strokeStyle = bfA(i % 2 ? c.c : c.c2, 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(f.x - gap + 14, f.y + i * 6); ctx.quadraticCurveTo(f.x, f.y + i * 22, f.x + gap - 14, f.y + i * 6); ctx.stroke(); } ctx.setLineDash([]); ctx.restore(); }
        const sq = Math.min(1, Math.max(0, (f.vw / 2 + 30 - gap) / 30)) + post * 0.3;
        bfBody(f.x, f.y, f.vw, f.vh, 0, 1 - post * 0.8, c.c, Math.max(0.15, 1 - sq * 0.75), 1 + sq * 0.25);
        for (const s of [-1, 1]) {
            const col = s < 0 ? c.c : c.c2;
            ctx.save(); ctx.translate(f.x + s * gap, f.y); if (s > 0) ctx.scale(-1, 1); ctx.globalAlpha *= bfE(t, 2, 10) * (1 - post * 0.5);
            ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-30, -26); ctx.arc(-30, 0, 26, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(0, 26); ctx.lineTo(0, 12); ctx.lineTo(-30, 12); ctx.arc(-30, 0, 12, Math.PI / 2, -Math.PI / 2); ctx.lineTo(0, -12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e5e7eb'; ctx.fillRect(-10, -26, 10, 14); ctx.fillRect(-10, 12, 10, 14);
            ctx.restore();
            bfText(s < 0 ? 'N' : 'S', f.x + s * (gap + 44), f.y, 14, col);
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 16); for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, kk = post, py = f.y + (bfR(f.seed, i) - 0.5) * 40; ctx.fillStyle = bfA('#cbd5e1', 1 - kk); ctx.fillRect(bfLerp(f.x, f.x + s * (gap + 8), Math.min(1, kk * 2)) - 2, py - 2, 4, 4); } bfRing(f.x, f.y, 10 + post * 80, bfA(c.c, 1 - post), 3); bfRing(f.x, f.y, 6 + post * 60, bfA(c.c2, 1 - post), 3); }
    },
    // Tiến Hóa: chuỗi xoắn kép DNA quấn quanh, mũi tên lên cấp, bùng nổ đột biến
    evolution(f, c, t) {
        const k = bfE(t, 4, 24), shrink = bfE(t, 40, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            const Hh = 80 * k * (1 - shrink * 0.7), amp = 26 * (1 - shrink * 0.6);
            for (let i = 0; i <= 20; i++) {
                const s = i / 20, yy = f.y - Hh + s * Hh * 2, ph = s * 9 + t * 0.15, x1 = f.x + Math.sin(ph) * amp, x2 = f.x - Math.sin(ph) * amp, front = Math.cos(ph) > 0;
                if (i % 2 === 0) { ctx.strokeStyle = bfA('#ffffff', 0.35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke(); }
                bfGlow(c.c, 8); ctx.fillStyle = bfA(c.c, front ? 1 : 0.4); ctx.beginPath(); ctx.arc(x1, yy, 3.4, 0, BF_TAU); ctx.fill();
                ctx.fillStyle = bfA(c.c2, front ? 0.4 : 1); ctx.beginPath(); ctx.arc(x2, yy, 3.4, 0, BF_TAU); ctx.fill();
            }
            for (let i = 0; i < 6; i++) { const ph = (t * 0.03 + i / 6) % 1; ctx.fillStyle = bfA(c.c, (1 - ph) * k); ctx.font = "900 12px Arial"; ctx.textAlign = 'center'; ctx.fillText('▲', f.x + (i - 2.5) * 22, f.y + 40 - ph * 90); }
        } else {
            bfGlow(c.c, 26);
            ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(post * 2);
            for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillStyle = bfA(i % 2 ? c.c : c.c2, 0.6 * (1 - post)); ctx.beginPath(); ctx.ellipse(0, -30 - post * 60, 12 + post * 10, 30 + post * 30, 0, 0, BF_TAU); ctx.fill(); }
            ctx.restore();
            bfDisc(f.x, f.y, 30 + post * 60, c.c2, c.c, 1 - post);
            if (post < 0.75) bfText('EVO!', f.x, f.y, 22 * (1.3 - 0.3 * bfE(t, BF_HIT, BF_HIT + 8)), c.c2, c.c);
        }
    },
    // Trối Chết: 4 sợi xích từ 4 góc khóa chặt, ổ khóa sập lại, đầu lâu hiện lên
    death_lock(f, c, t) {
        const reach = bfE(t, 8, 38), lock = bfE(t, 40, 52), post = bfE(t, BF_HIT, BF_HIT + 40);
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + Math.PI / 4, r0 = 220, r1 = bfLerp(r0, 18, reach) - post * 0;
            const sx = f.x + Math.cos(a) * r0, sy = f.y + Math.sin(a) * r0, ex = f.x + Math.cos(a) * r1, ey = f.y + Math.sin(a) * r1;
            const L = Math.hypot(ex - sx, ey - sy), n = Math.floor(L / 11);
            ctx.save(); ctx.globalAlpha *= 1 - post * 0.6; ctx.lineWidth = 3; bfGlow(c.c, t >= BF_HIT ? 14 : 4);
            for (let j = 0; j < n; j++) { const kx = sx + (ex - sx) * (j / n), ky = sy + (ey - sy) * (j / n); ctx.strokeStyle = j % 2 ? c.c2 : '#cbd5e1'; ctx.beginPath(); ctx.ellipse(kx, ky, 6, 3.2, a + (j % 2 ? Math.PI / 2 : 0), 0, BF_TAU); ctx.stroke(); }
            ctx.restore();
        }
        if (t >= 34) { // ổ khóa
            ctx.save(); ctx.translate(f.x, f.y); if (bfGuest()) ctx.rotate(Math.PI); const a0 = bfE(t, 34, 40); ctx.globalAlpha *= a0 * (1 - post); ctx.scale(1 + 0.3 * (1 - a0), 1 + 0.3 * (1 - a0));
            bfGlow(c.c, 18); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -10 - (1 - lock) * 10, 11, Math.PI, 0); ctx.lineTo(11, -10 + lock * 6 - (1 - lock) * 10); ctx.moveTo(-11, -10 - (1 - lock) * 10); ctx.lineTo(-11, -4); ctx.stroke();
            ctx.fillStyle = c.c; ctx.fillRect(-17, -6, 34, 26); ctx.fillStyle = '#0f0f14'; ctx.beginPath(); ctx.arc(0, 5, 4, 0, BF_TAU); ctx.fill(); ctx.fillRect(-1.5, 5, 3, 9);
            ctx.restore();
        }
        if (post > 0) bfText('☠', f.x, f.y - 6, 40 + post * 14, c.c2, c.c);
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfRing(f.x, f.y, 20 + post * 90, bfA(c.c, 1 - post), 4); }
    },
    // Kẻ Sáng Tạo: lưới bản vẽ, khối lập phương khung dây dựng dần quanh nạn nhân rồi nén nát
    creator(f, c, t) {
        const g = bfE(t, 2, 14), build = bfE(t, 14, 46), comp = bfE(t, 48, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.globalAlpha *= g * 0.35 * (1 - post); ctx.strokeStyle = c.c; ctx.lineWidth = 1;
        for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(f.x + i * 20, f.y - 80); ctx.lineTo(f.x + i * 20, f.y + 80); ctx.moveTo(f.x - 80, f.y + i * 20); ctx.lineTo(f.x + 80, f.y + i * 20); ctx.stroke(); }
        ctx.restore();
        if (t < BF_HIT + 4) {
            const s = 40 * (1 - comp * 0.65), o = s * 0.5, P = [[-s, -s], [s, -s], [s, s], [-s, s]].map(p => [f.x + p[0] - o * 0.5, f.y + p[1] + o * 0.5]), Q = P.map(p => [p[0] + o, p[1] - o]);
            const E = []; for (let i = 0; i < 4; i++) { E.push([P[i], P[(i + 1) % 4]]); E.push([Q[i], Q[(i + 1) % 4]]); E.push([P[i], Q[i]]); }
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 12);
            if (comp > 0) { ctx.fillStyle = bfA(c.c, 0.25 + comp * 0.4); bfPoly(Q); ctx.fill(); bfPoly(P); ctx.fill(); }
            const n = build * E.length;
            E.forEach(([a, b], i) => { const kk = Math.max(0, Math.min(1, n - i)); if (kk <= 0) return; ctx.strokeStyle = bfA(i % 3 ? c.c : c.c2, 1); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bfLerp(a[0], b[0], kk), bfLerp(a[1], b[1], kk)); ctx.stroke(); ctx.fillStyle = c.c2; ctx.fillRect(a[0] - 2, a[1] - 2, 4, 4); });
            ctx.restore();
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 14); for (let i = 0; i < 12; i++) { const a = bfR(f.seed, i) * BF_TAU, d = 10 + post * (60 + bfR(f.seed, i + 4) * 80); ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(post * 5); ctx.fillStyle = bfA(i % 2 ? c.c : c.c2, 1 - post); bfPoly([[0, -6], [5, 0], [0, 6], [-5, 0]]); ctx.fill(); ctx.restore(); } bfRing(f.x, f.y, 14 + post * 90, bfA(c.c, 1 - post), 3); }
    },
    // Chiêu Hồn Sư: bàn tay xương trồi lên từ đất túm lấy, kéo nạn nhân chìm xuống, hồn lửa xanh
    necromancer(f, c, t) {
        const rise = bfE(t, 8, 36), grip = bfE(t, 36, 46), sink = bfE(t, 44, BF_HIT + 16), post = bfE(t, BF_HIT, BF_HIT + 45);
        ctx.save(); ctx.fillStyle = `rgba(5,20,10,${0.7 * rise})`; ctx.beginPath(); ctx.ellipse(f.x, f.y, 56, 40, 0, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = bfA(c.c, 0.6 * rise); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        bfBody(f.x, f.y, f.vw, f.vh, 0, 1 - sink, c.c, 1 - sink * 0.7, 1 - sink * 0.7);
        for (let i = 0; i < 5; i++) {
            const a = i / 5 * BF_TAU + 0.4, d = bfLerp(48, 20, grip), hx = f.x + Math.cos(a) * d, hy = f.y + Math.sin(a) * d * 0.8, h = 26 * rise * (1 - sink * 0.8);
            if (h <= 1) continue;
            ctx.save(); ctx.translate(hx, hy); ctx.rotate(a + Math.PI / 2 + Math.PI); bfGlow(c.c, 10); ctx.strokeStyle = '#e7e5e4'; ctx.lineCap = 'round';
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h * 0.6); ctx.stroke();
            ctx.lineWidth = 2.2; for (let fi = 0; fi < 4; fi++) { const fx = (fi - 1.5) * 3.5, cu = grip * 0.9; ctx.beginPath(); ctx.moveTo(fx, -h * 0.6); ctx.lineTo(fx + Math.sin(cu) * h * 0.3 * (fi < 2 ? -0.3 : 0.3), -h * 0.6 - Math.cos(cu) * h * 0.4); ctx.stroke(); }
            ctx.restore();
        }
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 8; i++) { const ph = (t * 0.035 + bfR(f.seed, i)) % 1, px = f.x + (bfR(f.seed, i + 5) - 0.5) * 100; bfGlow(c.c, 10); bfFlame(px, f.y + 30 - ph * 60, 4 * (1 - ph) + 1, 12 * (1 - ph) + 4, i % 3 ? c.c : c.c2, 0.7 * (1 - ph) * rise * (1 - post)); }
        if (post > 0) { const sy = f.y - post * 90; bfGlow(c.c, 20); ctx.fillStyle = bfA(c.c, 0.8 * (1 - post)); ctx.beginPath(); ctx.arc(f.x, sy, 10, Math.PI, 0); ctx.quadraticCurveTo(f.x + 10, sy + 20, f.x, sy + 26); ctx.quadraticCurveTo(f.x - 10, sy + 20, f.x - 10, sy); ctx.fill(); bfText('☠', f.x, f.y, 30, c.c, c.c2); }
    },
    // Thiên Tài: bánh răng cưa khổng lồ hạ xuống nghiến nát, tia lửa bắn, bánh răng con quay quanh
    genius(f, c, t) {
        const A = bfAway(f), k = bfE(t, 8, 40), post = bfE(t, BF_HIT, BF_HIT + 40);
        const gear = (x, y, r, n, rot, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r : r * 0.8, a0 = i / (n * 2) * BF_TAU, a1 = (i + 1) / (n * 2) * BF_TAU; ctx.arc(0, 0, rr, a0, a1); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = bfA('#ffffff', 0.5); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, BF_TAU); ctx.stroke(); ctx.restore(); };
        const gy = f.y + A * 140 * (1 - k * k) * (1 - post), spin = t * (0.05 + bfE(t, 30, BF_HIT) * 0.35);
        ctx.save(); ctx.globalAlpha *= 1 - post * 0.6; bfGlow(c.c, 14);
        for (let i = 0; i < 3; i++) { const a = t * 0.06 + i / 3 * BF_TAU; gear(f.x + Math.cos(a) * 70, f.y + Math.sin(a) * 70, 12, 8, -t * 0.2, c.c2); }
        gear(f.x, gy, 42, 14, spin, c.c);
        ctx.restore();
        if (t > 38 && t < BF_HIT + 20) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 10); for (let i = 0; i < 10; i++) { const s = bfR(f.seed + t, i), a = (s - 0.5) * 1.6 + (A < 0 ? 0 : Math.PI), l = 20 + bfR(f.seed + t, i + 4) * 50; const bx = f.x + (bfR(f.seed + t, i + 8) - 0.5) * 30, by = f.y; ctx.strokeStyle = bfA(i % 2 ? c.c2 : '#fde68a', 0.9); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * l, by + Math.sin(a) * l * 0.5 + 20); ctx.stroke(); } }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfShards(f, 14, 120, '#94a3b8', c.c2, post, 6); bfRing(f.x, f.y, 20 + post * 100, bfA(c.c, 1 - post), 4); }
    },
    // Kiếm Khách: 3 phi kiếm vạch tam giác trận quanh nạn nhân rồi cùng đâm xuyên tâm
    kiem_khach(f, c, t) {
        const tr = bfE(t, 10, 44), dive = bfE(t, 48, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40), R = 70;
        const V = [0, 1, 2].map(i => { const a = -Math.PI / 2 + i / 3 * BF_TAU; return [f.x + Math.cos(a) * R, f.y + Math.sin(a) * R]; });
        ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 16);
        ctx.strokeStyle = bfA(c.c2, 0.85 * (1 - post)); ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) { const a = V[i], b = V[(i + 1) % 3]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bfLerp(a[0], b[0], tr), bfLerp(a[1], b[1], tr)); ctx.stroke(); }
        if (tr >= 1 && t < BF_HIT) { ctx.fillStyle = bfA(c.c2, 0.12 + 0.08 * Math.sin(t * 0.5)); bfPoly(V); ctx.fill(); }
        for (let i = 0; i < 3; i++) {
            if (t < 10 || t >= BF_HIT + 2) continue;
            const a = V[i], b = V[(i + 1) % 3]; let px = bfLerp(a[0], b[0], tr), py = bfLerp(a[1], b[1], tr), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
            if (dive > 0) { px = bfLerp(b[0], f.x, dive * dive); py = bfLerp(b[1], f.y, dive * dive); ang = Math.atan2(f.y - b[1], f.x - b[0]) + Math.PI / 2; }
            ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.translate(0, 18); bfSword(36, 4, c.c, c.c2); ctx.restore();
        }
        if (post > 0) { bfGlow(c.c2, 20); for (let i = 0; i < 3; i++) { const a = Math.atan2(V[i][1] - f.y, V[i][0] - f.x) + Math.PI; ctx.strokeStyle = bfA(c.c2, 1 - post); ctx.lineWidth = 4 * (1 - post) + 1; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * (30 + post * 150), f.y + Math.sin(a) * (30 + post * 150)); ctx.stroke(); } bfDisc(f.x, f.y, 20 + post * 40, c.c, c.c2, 1 - post); }
    },
    // Bình Phun: vòi phun nón sương 3 chất (Lửa/Axit/Băng), lớp phủ đạt 100% rồi phản ứng bùng cháy
    sprayer(f, c, t) {
        const oa = bfOA(f) + Math.PI, cov = bfE(t, 10, BF_HIT - 4), post = bfE(t, BF_HIT, BF_HIT + 40), D = Math.hypot(f.x - f.ox, f.y - f.oy);
        const cols = c.pal || [c.c, '#84cc16', c.c2];
        if (t < BF_HIT) {
            for (let i = 0; i < 22; i++) { const ph = (t * 0.03 + i / 22) % 1, sp = (bfR(f.seed, i) - 0.5) * 0.5 * ph, r = 20 + ph * (D + 10); ctx.fillStyle = bfA(cols[i % 3], 0.35 * (1 - ph * 0.5)); ctx.beginPath(); ctx.arc(f.ox + Math.cos(oa + sp) * r, f.oy + Math.sin(oa + sp) * r, 4 + ph * 16, 0, BF_TAU); ctx.fill(); }
        }
        // lớp phủ 3 màu trên nạn nhân
        ctx.save(); ctx.globalAlpha *= 0.75 * (1 - post); for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(f.x - f.vw / 2, f.y + f.vh / 2 - f.vh * cov * (3 - i) / 3, f.vw, f.vh * cov / 3); } ctx.restore();
        const bw = 70, by = f.y - f.vh / 2 - 22;
        ctx.save(); ctx.globalAlpha *= 1 - post; ctx.fillStyle = '#0f172a'; ctx.fillRect(f.x - bw / 2, by - 4, bw, 8); for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(f.x - bw / 2 + i * bw / 3 * cov, by - 3, bw / 3 * cov, 6); } ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.strokeRect(f.x - bw / 2, by - 4, bw, 8); ctx.restore();
        if (t < BF_HIT + 20) bfText('PHỦ ' + Math.round(cov * 100) + '%', f.x, by - 14, 11, cov >= 1 ? '#ffffff' : c.c2);
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = i / 3 * BF_TAU + post * 2, d = post * 40; bfGlow(cols[i], 20); bfDisc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 30 + post * 60, cols[i], cols[i], 0.9 * (1 - post)); } }
    },
    // Tùy Biến: 4 mô-đun bay tới gắn quanh nạn nhân, sáng lần lượt, bắn tia chữ thập
    customize(f, c, t) {
        const post = bfE(t, BF_HIT, BF_HIT + 40), icons = ['⚙', '✚', '➤', '◆'], cols = [c.c, '#4ade80', c.c2, '#facc15'];
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2, k = bfE(t, 8 + i * 6, 20 + i * 6); if (k <= 0) continue;
            const d = bfLerp(180, f.vw / 2 + 14, k * k), mx = f.x + Math.cos(a) * d, my = f.y + Math.sin(a) * d, lit = t >= 40 + i * 4;
            if (k < 1) { ctx.save(); ctx.strokeStyle = bfA(cols[i], 0.5); ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.restore(); }
            ctx.save(); ctx.translate(mx, my); ctx.rotate((1 - k) * 4); ctx.globalAlpha *= 1 - post * 0.8; bfGlow(cols[i], lit ? 18 : 4);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(-11, -11, 22, 22); ctx.strokeStyle = cols[i]; ctx.lineWidth = 2.5; ctx.strokeRect(-11, -11, 22, 22);
            ctx.fillStyle = lit ? cols[i] : '#64748b'; ctx.font = "900 13px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icons[i], 0, 1);
            ctx.restore();
            if (lit && t < BF_HIT) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = bfA(cols[i], 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.restore(); }
        }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; const w = 26 * (1 - post) + 2; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; bfGlow(cols[i], 24); ctx.strokeStyle = bfA(cols[i], 0.9 * (1 - post * 0.5)); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * 600, f.y + Math.sin(a) * 600); ctx.stroke(); ctx.strokeStyle = bfA('#ffffff', 1 - post); ctx.lineWidth = w * 0.3; ctx.stroke(); } bfDisc(f.x, f.y, 30, '#ffffff', c.c, 1 - post); }
    },
    // Kiếm Sư: Ngũ Hành – 5 phi kiếm nguyên tố ở 5 đỉnh, nối thành ngôi sao rồi hội tụ
    kiem_su(f, c, t) {
        const cols = c.pal, el = ['金', '木', '火', '土', '水'], star = bfE(t, 20, 46), conv = bfE(t, 48, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40), R = 78 * (1 - conv * conv);
        const V = [0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i / 5 * BF_TAU + t * 0.01; return [f.x + Math.cos(a) * R, f.y + Math.sin(a) * R, a]; });
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            const ord = [0, 2, 4, 1, 3, 0], n = star * 5; ctx.lineWidth = 2.2;
            for (let i = 0; i < 5; i++) { const kk = Math.max(0, Math.min(1, n - i)); if (kk <= 0) break; const a = V[ord[i]], b = V[ord[i + 1]]; bfGlow(cols[ord[i]], 12); ctx.strokeStyle = bfA(cols[ord[i]], 0.9); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bfLerp(a[0], b[0], kk), bfLerp(a[1], b[1], kk)); ctx.stroke(); }
            bfRing(f.x, f.y, R + 8, bfA('#ffffff', 0.3 * star), 1.5);
        }
        if (t < BF_HIT + 2) V.forEach((v, i) => { const ap = bfE(t, 4 + i * 3, 12 + i * 3); if (ap <= 0) return; ctx.save(); ctx.translate(v[0], v[1]); ctx.rotate(v[2] - Math.PI / 2); ctx.globalAlpha *= ap; bfGlow(cols[i], 14); bfSword(30, 3.6, cols[i], '#ffffff'); ctx.restore(); if (conv < 0.5) bfText(el[i], f.x + Math.cos(v[2]) * (R + 26), f.y + Math.sin(v[2]) * (R + 26), 13, cols[i]); });
        if (post > 0) { for (let i = 0; i < 5; i++) { const kk = bfE(t, BF_HIT + i * 3, BF_HIT + i * 3 + 30); if (kk > 0 && kk < 1) { bfGlow(cols[i], 14); bfRing(f.x, f.y, 14 + kk * 120, bfA(cols[i], 1 - kk), 4); } } }
    },
    // Cao Bồi: mặt trời giữa trưa, ổ quay 6 viên xoay, 6 phát BANG xếp lỗ đạn lục giác
    revolver(f, c, t) {
        const A = bfAway(f), sun = bfE(t, 2, 16), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow('#fde047', 30); bfDisc(f.x + 70, f.y + A * 120, 36 * sun, '#fde047', '#f97316', 0.5 * (1 - post)); ctx.restore();
        let shot = 0;
        for (let i = 0; i < 6; i++) {
            const t0 = 14 + i * 8 - (i === 5 ? 2 : 0), age = t - t0; if (age < 0) continue; shot++;
            const a = i / 6 * BF_TAU - Math.PI / 2, hx = f.x + Math.cos(a) * f.vw * 0.28, hy = f.y + Math.sin(a) * f.vh * 0.28;
            if (age < 5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 16); ctx.strokeStyle = bfA('#ffffff', 1 - age / 5); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(hx, hy); ctx.stroke(); bfDisc(f.ox, f.oy, 16, c.c, c.c, 1 - age / 5); ctx.restore(); }
            if (age < 12) bfText('BANG', hx + Math.cos(a) * 40, hy + Math.sin(a) * 40, 11 + (12 - age) * 0.4, c.c, c.c2);
            ctx.save(); ctx.globalAlpha *= 1 - post * 0.7; ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(hx, hy, 3.2, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = c.c; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
        }
        // ổ quay
        const cx = f.x - f.vw / 2 - 40, cy = f.y;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-shot * Math.PI / 3 * 0 - Math.min(shot, 6) * Math.PI / 3); ctx.globalAlpha *= 1 - post;
        ctx.fillStyle = '#57534e'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = c.c; ctx.lineWidth = 1.5; ctx.stroke();
        for (let i = 0; i < 6; i++) { const a = i / 6 * BF_TAU; ctx.fillStyle = i < 6 - shot ? '#fbbf24' : '#1c1917'; ctx.beginPath(); ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 4, 0, BF_TAU); ctx.fill(); }
        ctx.restore();
        if (post > 0) { ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 4; i++) { const ph = post + i * 0.1; ctx.fillStyle = `rgba(203,213,225,${0.3 * (1 - post)})`; ctx.beginPath(); ctx.arc(f.ox + Math.sin(ph * 6 + i) * 8, f.oy + A * -ph * 40, 6 + i * 3, 0, BF_TAU); ctx.fill(); } }
    },
    // DJ: thanh EQ xếp vòng nhảy theo nhịp, nhịp dồn dập dần, BASS DROP sóng âm khổng lồ
    dj(f, c, t) {
        const post = bfE(t, BF_HIT, BF_HIT + 45), iv = t < 30 ? 12 : t < 46 ? 8 : 4, beat = 1 - (t % iv) / iv;
        const pal = c.pal;
        ctx.globalCompositeOperation = 'lighter';
        const n = 20, R = 46 + post * 20;
        for (let i = 0; i < n; i++) {
            const a = i / n * BF_TAU + t * 0.01, lv = t >= BF_HIT ? (1 - post) * (0.7 + 0.3 * bfR(f.seed + t, i)) : (0.25 + 0.75 * beat * bfR(f.seed + Math.floor(t / iv), i)) * bfE(t, 4, 16);
            const L = 6 + lv * 46, col = pal[i % pal.length];
            ctx.save(); ctx.translate(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R); ctx.rotate(a); bfGlow(col, 10);
            for (let s = 0; s < Math.ceil(L / 6); s++) { ctx.fillStyle = bfA(col, 0.9 - s * 0.08); ctx.fillRect(s * 6, -3.5, 4.5, 7); }
            ctx.restore();
        }
        if (t < BF_HIT) { bfRing(f.x, f.y, 30 + beat * 10, bfA(pal[Math.floor(t / iv) % pal.length], 0.7 * beat), 3); ctx.fillStyle = bfA('#111827', 0.9); }
        // loa
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= 1 - post * 0.5; ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(f.x, f.y, 24 + beat * 3, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = c.c2; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(f.x, f.y, 9 + beat * 4, 0, BF_TAU); ctx.fill(); ctx.restore();
        if (t >= 46 && t < BF_HIT) bfText(t < 52 ? '3' : t < 56 ? '2' : '1', f.x, f.y, 18, '#ffffff', c.c);
        if (t >= BF_HIT) {
            for (let w = 0; w < 4; w++) { const kk = bfE(t, BF_HIT + w * 5, BF_HIT + w * 5 + 32); if (kk > 0 && kk < 1) { bfGlow(pal[w], 20); bfRing(f.x, f.y, 24 + kk * 200, bfA(pal[w], 1 - kk), 12 * (1 - kk) + 2); } }
            if (post < 0.8) bfText('DROP!', f.x, f.y, 26 * (1.4 - 0.4 * bfE(t, BF_HIT, BF_HIT + 8)), c.c, c.c2);
        }
    },
    // Móc Thép: móc câu phóng theo xích, ngoạm nạn nhân, giật mạnh về phía chủ rồi nện
    steel_hook(f, c, t) {
        const out = bfE(t, 8, 26), yank = bfE(t, 40, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        const pull = yank * yank * 0.42, vx = bfLerp(f.x, f.ox, pull), vy = bfLerp(f.y, f.oy, pull);
        const hx = t < 26 ? bfLerp(f.ox, f.x, out) : vx, hy = t < 26 ? bfLerp(f.oy, f.y, out) : vy, ang = Math.atan2(f.y - f.oy, f.x - f.ox);
        if (t >= 26) bfBody(vx, vy, f.vw, f.vh, yank * 0.6 * Math.sin(t * 0.7) * (1 - post), 1 - post, c.c2, 1, 1 - post * 0.4);
        if (t >= 8 && post < 1) {
            const L = Math.hypot(hx - f.ox, hy - f.oy), n = Math.floor(L / 10);
            ctx.save(); ctx.globalAlpha *= 1 - post; bfGlow(c.c2, t >= 26 && t < 32 ? 16 : 4);
            for (let j = 0; j < n; j++) { const kx = bfLerp(f.ox, hx, j / n), ky = bfLerp(f.oy, hy, j / n) + (yank > 0 ? 0 : Math.sin(j * 0.6 + t * 0.4) * 3); ctx.strokeStyle = j % 2 ? '#cbd5e1' : '#64748b'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(kx, ky, 5.5, 3, ang + (j % 2 ? Math.PI / 2 : 0), 0, BF_TAU); ctx.stroke(); }
            ctx.translate(hx, hy); ctx.rotate(ang); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(8, 0); ctx.arc(8, 8, 8, -Math.PI / 2, Math.PI * 0.75); ctx.moveTo(8, 0); ctx.arc(8, -8, 8, Math.PI / 2, -Math.PI * 0.75, true); ctx.stroke();
            ctx.restore();
        }
        if (t >= 26 && t < 34) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 16); bfDisc(f.x, f.y, 20, c.c2, c.c2, 1 - (t - 26) / 8); ctx.restore(); }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c2, 18); bfRing(vx, vy, 16 + post * 110, bfA(c.c2, 1 - post), 6 * (1 - post) + 1); bfDisc(vx, vy, 30 + post * 40, '#ffffff', c.c2, 1 - post); }
    },
    // Kiếm Vũ: 1 thanh bản mệnh kiếm múa đường hoa hồng, cánh hoa rơi, rồi bổ thẳng xuống
    kiem_vu(f, c, t) {
        const A = bfAway(f), dance = bfE(t, 6, 48), dive = bfE(t, 48, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        const rose = s => { const th = s * BF_TAU * 2, r = 70 * Math.cos(2 * th) ; return [f.x + Math.cos(th) * r, f.y + Math.sin(th) * r]; };
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            bfGlow(c.c2, 12); ctx.strokeStyle = bfA(c.c2, 0.55); ctx.lineWidth = 2.2; ctx.beginPath();
            const s0 = Math.max(0, dance - 0.45); for (let s = s0; s <= dance; s += 0.008) { const p = rose(s); s === s0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); } ctx.stroke();
            let p = rose(dance), q = rose(Math.max(0, dance - 0.01)), ang = Math.atan2(p[1] - q[1], p[0] - q[0]) + Math.PI / 2;
            if (dive > 0) { p = [f.x, bfLerp(f.y + A * 90, f.y, dive * dive)]; ang = A < 0 ? Math.PI : 0; }
            ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); bfGlow(c.c, 18); ctx.translate(0, 20); bfSword(42, 4.5, c.c, '#ffffff'); ctx.restore();
        }
        for (let i = 0; i < 16; i++) { const ph = (t * 0.012 + bfR(f.seed, i)) % 1, px = f.x + (bfR(f.seed, i + 3) - 0.5) * 180 + Math.sin(t * 0.05 + i) * 10, py = f.y - 90 + ph * 180; const pp = post > 0 ? post * 60 : 0, a = Math.atan2(py - f.y, px - f.x); ctx.save(); ctx.translate(px + Math.cos(a) * pp, py + Math.sin(a) * pp); ctx.rotate(t * 0.05 + i); ctx.fillStyle = bfA(i % 2 ? c.c2 : '#fbcfe8', 0.7 * bfE(t, 4, 14) * (1 - post)); ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, BF_TAU); ctx.fill(); ctx.restore(); }
        if (post > 0) { bfGlow(c.c, 20); for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(i / 5 * BF_TAU + post); ctx.fillStyle = bfA(i % 2 ? c.c : c.c2, 0.7 * (1 - post)); ctx.beginPath(); ctx.ellipse(0, -24 - post * 50, 12, 24 + post * 20, 0, 0, BF_TAU); ctx.fill(); ctx.restore(); } }
    },
    // T-Zero: ấn Thiên Luật lục giác trên trời, các vòng luật giáng dần xuống, trụ trời xuyên thẳng
    t_zero(f, c, t, W, H) {
        const A = bfAway(f), k = bfE(t, 4, 22), post = bfE(t, BF_HIT, BF_HIT + 40), sy = f.y + A * 150;
        ctx.globalCompositeOperation = 'lighter';
        const hex = (x, y, r, rot, col, lw) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * BF_TAU; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.5) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.5); } ctx.stroke(); ctx.restore(); };
        bfGlow(c.c, 16);
        if (t < BF_HIT + 20) { hex(f.x, sy, 60 * k, t * 0.03, bfA(c.c, 0.9 * (1 - post)), 2.5); hex(f.x, sy, 42 * k, -t * 0.05, bfA(c.c2, 0.8 * (1 - post)), 1.5); }
        for (let i = 0; i < 5; i++) { const t0 = 16 + i * 8, kk = bfE(t, t0, t0 + 18); if (kk <= 0 || kk >= 1) continue; hex(f.x, bfLerp(sy, f.y, kk), 50 * (1 - kk * 0.6), i, bfA(i % 2 ? c.c2 : c.c, 1 - kk * 0.3), 2); }
        if (t >= 30 && t < BF_HIT) { ctx.strokeStyle = bfA(c.c, 0.4); ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(f.x, sy); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.setLineDash([]); }
        if (t >= BF_HIT && post < 1) {
            const w = 36 * (1 - post) * Math.min(1, (t - BF_HIT) / 3), top = f.y + A * 900;
            bfGlow(c.c, 30); [[c.c, w + 8, 0.6], [c.c2, w * 0.5 + 2, 0.9]].forEach(([col, lw, a]) => { ctx.strokeStyle = bfA(col, a); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(f.x, top); ctx.lineTo(f.x, f.y); ctx.stroke(); });
            hex(f.x, f.y, 30 + post * 120, post, bfA(c.c, 1 - post), 4); hex(f.x, f.y, 20 + post * 80, -post, bfA(c.c2, 1 - post), 2);
        }
    },
    // Raven - Oca: bầy quạ lượn vòng trên đầu, lần lượt bổ nhào, lông vũ đen tung bay
    raven_oca(f, c, t) {
        const A = bfAway(f), post = bfE(t, BF_HIT, BF_HIT + 45), mark = bfE(t, 10, 20);
        if (t < BF_HIT + 6) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(t * 0.05); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 12); ctx.strokeStyle = bfA(c.c, 0.9 * mark); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 20, 0, BF_TAU); ctx.moveTo(-28, 0); ctx.lineTo(-12, 0); ctx.moveTo(28, 0); ctx.lineTo(12, 0); ctx.moveTo(0, -28); ctx.lineTo(0, -12); ctx.moveTo(0, 28); ctx.lineTo(0, 12); ctx.stroke(); ctx.restore(); }
        for (let i = 0; i < 9; i++) {
            const td = 36 + i * 2.6, dv = bfE(t, td, td + 8); if (t < 4 + i * 2 || dv >= 1) continue;
            const a = t * 0.07 + i / 9 * BF_TAU, cx = f.x + Math.cos(a) * 80, cy = f.y + A * 70 + Math.sin(a) * 30;
            const px = bfLerp(cx, f.x, dv), py = bfLerp(cy, f.y, dv), ang = dv > 0 ? Math.atan2(f.y - cy, f.x - cx) : a + Math.PI / 2, fl = Math.sin(t * 0.7 + i) * 6 * (1 - dv);
            ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = c.c; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-2, -2); ctx.lineTo(-6, -12 - fl); ctx.lineTo(-4, -2); ctx.lineTo(-10, 0); ctx.lineTo(-4, 2); ctx.lineTo(-6, 12 + fl); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(5, -1, 1.2, 0, BF_TAU); ctx.fill(); ctx.restore();
        }
        if (t > 40) for (let i = 0; i < 14; i++) { const k = bfE(t, 40 + i, BF_HIT + 40), a = bfR(f.seed, i) * BF_TAU, d = k * (30 + bfR(f.seed, i + 5) * 90); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d + k * 20); ctx.rotate(a + k * 4); ctx.globalAlpha *= 1 - k; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.2, 0, 0, BF_TAU); ctx.fill(); ctx.strokeStyle = c.c; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke(); ctx.restore(); }
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 18); bfRing(f.x, f.y, 14 + post * 100, bfA(c.c, 1 - post), 4); }
    },
    // Tia Lazer: tia liên tục quét qua lại, để lại vệt cháy xém trên mặt đất, rồi khóa tâm thiêu rụi
    lazer_beam(f, c, t) {
        const sw = bfE(t, 14, 52), post = bfE(t, BF_HIT, BF_HIT + 40), lock = bfE(t, 50, BF_HIT);
        const dx = f.x - f.ox, dy = f.y - f.oy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        const off = s => Math.sin(s * Math.PI * 5) * 70 * (1 - s * 0.4);
        // vệt cháy xém
        if (t > 14) { ctx.save(); ctx.globalAlpha *= 1 - post * 0.5; ctx.strokeStyle = 'rgba(28,10,4,0.9)'; ctx.lineWidth = 7; ctx.beginPath(); for (let s = 0; s <= sw; s += 0.01) { const o = off(s); s ? ctx.lineTo(f.x + nx * o, f.y + ny * o) : ctx.moveTo(f.x + nx * o, f.y + ny * o); } ctx.stroke(); ctx.strokeStyle = bfA(c.c, 0.7); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
        ctx.globalCompositeOperation = 'lighter';
        if (t >= 14 && post < 1) {
            const o = off(sw) * (1 - lock), ex = f.x + nx * o, ey = f.y + ny * o, w = t >= BF_HIT ? 18 * (1 - post) + 4 : 6;
            bfGlow(c.c, 24); [[c.c, w + 4, 0.8], [c.c2, w * 0.5 + 1, 1]].forEach(([col, lw, a]) => { ctx.strokeStyle = bfA(col, a); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke(); });
            bfDisc(ex, ey, 14 + w, c.c2, c.c, 0.9);
            for (let i = 0; i < 3; i++) { const a = bfR(f.seed, t + i) * BF_TAU; ctx.fillStyle = bfA(c.c2, 0.9); ctx.fillRect(ex + Math.cos(a) * 12, ey + Math.sin(a) * 12, 2.5, 2.5); }
        }
        if (post > 0) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha *= 1 - post; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fillStyle = '#fff7ed'; ctx.fillRect(f.x - f.vw / 2, f.y - f.vh / 2, f.vw, f.vh); ctx.restore(); bfRing(f.x, f.y, 14 + post * 100, bfA(c.c, 1 - post), 4); }
    },
    // Y Sư: sinh lực (đốm xanh) bị rút về chủ, nhịp tim điện tâm đồ chậm dần rồi thẳng băng
    healer(f, c, t, W) {
        const post = bfE(t, BF_HIT, BF_HIT + 45), A = bfAway(f);
        // điện tâm đồ
        const ey = f.y + A * 54, x0 = f.x - 150, x1 = f.x + 150, head = ((t * 4) % 300);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(t >= BF_HIT ? '#ef4444' : c.c, 10); ctx.strokeStyle = bfA(t >= BF_HIT ? '#ef4444' : c.c, 0.95); ctx.lineWidth = 2.2; ctx.beginPath();
        const per = t < 30 ? 60 : t < 50 ? 90 : 160, amp = t >= BF_HIT ? 0 : 1 - bfE(t, 30, BF_HIT) * 0.6;
        for (let x = x0; x <= x0 + (t >= BF_HIT ? 300 : head); x += 3) { const ph = ((x - x0) % per) / per; let yy = 0; if (ph > 0.4 && ph < 0.46) yy = -26 * amp; else if (ph >= 0.46 && ph < 0.52) yy = 18 * amp; else if (ph > 0.36 && ph <= 0.4) yy = 6 * amp; x === x0 ? ctx.moveTo(x, ey + yy) : ctx.lineTo(x, ey + yy); }
        ctx.stroke(); ctx.restore();
        if (t >= BF_HIT && post < 0.8) bfText('— 0 —', x1 - 30, ey - 16, 11, '#ef4444');
        // dấu thập xanh tàn dần
        ctx.save(); ctx.translate(f.x, f.y); ctx.globalAlpha *= bfE(t, 4, 14) * (1 - post); const g = bfE(t, 20, BF_HIT);
        ctx.fillStyle = `rgb(${Math.round(bfLerp(74, 100, g))},${Math.round(bfLerp(222, 116, g))},${Math.round(bfLerp(128, 139, g))})`; ctx.fillRect(-6, -20, 12, 40); ctx.fillRect(-20, -6, 40, 12); ctx.restore();
        // sinh lực bị rút
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT + 10) for (let i = 0; i < 12; i++) { const ph = (t * 0.025 + i / 12) % 1; if (t < 8) continue; const mx = (f.x + f.ox) / 2 + (bfR(f.seed, i) - 0.5) * 120, my = (f.y + f.oy) / 2; const px = (1 - ph) * (1 - ph) * f.x + 2 * (1 - ph) * ph * mx + ph * ph * f.ox, py = (1 - ph) * (1 - ph) * f.y + 2 * (1 - ph) * ph * my + ph * ph * f.oy; bfGlow(c.c, 10); ctx.fillStyle = bfA(i % 3 ? c.c : c.c2, 0.9); ctx.beginPath(); ctx.arc(px, py, 3.2, 0, BF_TAU); ctx.fill(); }
        if (post > 0) { bfDisc(f.ox, f.oy, 20 + post * 30, c.c2, c.c, 0.6 * (1 - post)); bfRing(f.x, f.y, 14 + post * 70, bfA('#94a3b8', 1 - post), 3); }
    },
    // Gemini: 2 sao song tử xoắn quanh nhau, tách ra 2 phía rồi chém chéo chữ X cùng lúc
    gemini(f, c, t) {
        const orb = bfE(t, 4, 44), sep = bfE(t, 44, BF_HIT - 2), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            for (let s = 0; s < 2; s++) {
                const col = s ? c.c2 : c.c;
                for (let tr = 6; tr >= 0; tr--) {
                    const tt = t - tr * 1.5, a = tt * 0.16 + s * Math.PI, r = 60 * (1 - orb * 0.5), ox = Math.cos(a) * r, oy = Math.sin(a) * r * 0.5;
                    const px = bfLerp(f.x + ox, f.x + (s ? 110 : -110), sep), py = bfLerp(f.y + oy, f.y + (s ? -80 : -80) * (s ? -1 : 1), sep);
                    bfGlow(col, tr ? 4 : 20); ctx.fillStyle = bfA(col, tr ? 0.25 : 1); ctx.beginPath(); ctx.arc(px, py, tr ? 6 - tr * 0.6 : 9, 0, BF_TAU); ctx.fill();
                }
            }
        } else {
            for (let s = 0; s < 2; s++) {
                const col = s ? c.c2 : c.c, k = bfE(t, BF_HIT, BF_HIT + 6), sx = f.x + (s ? 110 : -110), sy = f.y + (s ? 80 : -80), ex = f.x - (s ? 110 : -110), ey = f.y - (s ? 80 : -80);
                bfGlow(col, 24); ctx.strokeStyle = bfA(col, 1 - post); ctx.lineWidth = 9 * (1 - post) + 1; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bfLerp(sx, ex, k), bfLerp(sy, ey, k)); ctx.stroke();
                ctx.strokeStyle = bfA('#ffffff', 1 - post); ctx.lineWidth = 2; ctx.stroke();
            }
            bfDisc(f.x, f.y, 20 + post * 60, '#ffffff', c.c2, 1 - post);
        }
    },
    // Huyết Ma: trăng máu mọc, máu bị hút lên thành cầu huyết, rồi gai máu trồi lên từ đất
    blood_lord(f, c, t) {
        const A = bfAway(f), moon = bfE(t, 2, 20), suck = bfE(t, 10, 50), comp = bfE(t, 50, BF_HIT), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 30); bfDisc(f.x - 60, f.y + A * 140, 44 * moon, c.c, '#7f1d1d', 0.45 * (1 - post)); ctx.restore();
        const oy = f.y + A * 60, R = (6 + suck * 22) * (1 - comp * 0.5);
        ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            for (let i = 0; i < 16; i++) { const ph = (t * 0.04 + i / 16) % 1; if (t < 10) continue; const sx = f.x + (bfR(f.seed, i) - 0.5) * f.vw, sy = f.y + (bfR(f.seed, i + 3) - 0.5) * f.vh; const px = bfLerp(sx, f.x, ph) + Math.sin(ph * 8 + i) * 6, py = bfLerp(sy, oy, ph); ctx.fillStyle = bfA(i % 2 ? c.c : '#fca5a5', 0.8); ctx.beginPath(); ctx.arc(px, py, 2.2, 0, BF_TAU); ctx.fill(); }
            bfGlow(c.c, 24); bfDisc(f.x, oy, R * 1.6, c.c, '#7f1d1d', 0.95);
        } else {
            ctx.globalCompositeOperation = 'source-over'; bfGlow(c.c, 12);
            for (let i = 0; i < 12; i++) { const a = i / 12 * BF_TAU + bfR(f.seed, i) * 0.3, r0 = 10 + bfR(f.seed, i + 2) * 20, h = Math.sin(Math.min(1, post * 3) * Math.PI / 2) * (40 + bfR(f.seed, i + 5) * 40) * (1 - Math.max(0, post - 0.6) * 2.5); if (h <= 0) continue; ctx.save(); ctx.translate(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.rotate(a + Math.PI / 2); const g = ctx.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, '#7f1d1d'); g.addColorStop(1, c.c2); ctx.fillStyle = g; bfPoly([[-5, 0], [0, -h], [5, 0]]); ctx.fill(); ctx.restore(); }
            ctx.globalCompositeOperation = 'lighter'; bfRing(f.x, f.y, 14 + post * 90, bfA(c.c, 1 - post), 4);
        }
    },
    // Cuồng Chiến Binh: hào quang cuồng nộ, 4 nhát rìu lưỡi liềm nặng nề nện xuống, đất nứt
    berserker(f, c, t, W, H) {
        const rage = bfE(t, 2, 20), post = bfE(t, BF_HIT, BF_HIT + 40);
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; const pul = 0.5 + 0.5 * Math.sin(t * 0.4);
        const g = ctx.createRadialGradient(f.x, f.y, 60, f.x, f.y, 360); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, bfA('#7f1d1d', 0.5 * rage * pul * (1 - post)));
        ctx.fillStyle = g; ctx.fillRect(f.x - 1000, f.y - 1000, 2000, 2000); ctx.restore();
        const hits = [18, 30, 42, 56];
        hits.forEach((t0, i) => {
            const age = t - t0; if (age < 0) return;
            const ang = [0.6, -0.7, 2.4, Math.PI / 2][i];
            if (age < 10) {
                const a = 1 - age / 10, sw = Math.min(1, age / 3);
                ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 22);
                ctx.fillStyle = bfA(i === 3 ? c.c2 : c.c, a * 0.9); ctx.beginPath(); ctx.arc(0, -40, 70, Math.PI * (0.15 + 0.7 * (1 - sw)), Math.PI * 0.85); ctx.arc(0, -20, 64, Math.PI * 0.85, Math.PI * (0.15 + 0.7 * (1 - sw)), true); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
            ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.globalAlpha *= 1 - post * 0.7; bfCracks(f.x + Math.cos(ang) * 6, f.y + Math.sin(ang) * 6, 3, 60 + i * 14, f.seed + i, bfA('#fca5a5', 0.8), 2); ctx.restore();
        });
        if (post > 0) { ctx.globalCompositeOperation = 'lighter'; bfGlow(c.c, 18); bfShards(f, 16, 140, c.c, '#78716c', post, 7); bfRing(f.x, f.y, 20 + post * 120, bfA(c.c2, 1 - post), 6); }
    },
};
function c2safe(c) { return c.c2 || '#ffffff'; }
