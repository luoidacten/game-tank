// ==========================================
// Kẻ Thu Thập (collector) — Hình ảnh: xe giám tuyển bảo tàng, cổng dữ liệu + Hologram bán trong suốt,
// kết liễu ĐÓNG HỘP SƯU TẦM (khung kính trưng bày + nhãn COLLECTED #99).
// ==========================================

registerTankArt('collector', (p, k) => {
    const t = k.t, kc = COL_COLOR[p.colKind] || '#e2e8f0', fl = p.colFlash > 0;
    TA.treads(-14, 5, -12, 14, t, '#0f172a', '#155e75');
    ctx.fillStyle = TA.vgrad(-8, 12, '#134e4a', '#0b1220');
    TA.rr(-10, -6, 20, 18, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-10, -6, 20, 18, 4); ctx.stroke();
    // nắp tủ kính trưng bày trên thân xe
    ctx.fillStyle = 'rgba(103,232,249,0.18)'; TA.rr(-7, -1, 14, 11, 2); ctx.fill();
    ctx.strokeStyle = COL_GOLD; ctx.lineWidth = 0.9; TA.rr(-7, -1, 14, 11, 2); ctx.stroke();
    // viên đạn đang cầm lơ lửng trong tủ
    TA.glow(kc, fl ? 12 : 6);
    ctx.fillStyle = kc; ctx.beginPath(); ctx.arc(0, 4.5 + Math.sin(t * 3) * 0.8, 2.6 + (fl ? 1.2 : 0), 0, Math.PI * 2); ctx.fill();
    TA.noGlow();
    TA.barrel(0, -4, 11, 3.6, '#e2e8f0', kc);
    // nhãn giá nhỏ hai bên
    ctx.fillStyle = COL_GOLD; ctx.fillRect(-12, 0, 2, 4); ctx.fillRect(10, 0, 2, 4);
    if (p.colCd <= 0) { ctx.fillStyle = COL_CYAN; ctx.beginPath(); ctx.arc(0, -1.8, 1, 0, Math.PI * 2); ctx.fill(); }
    if (k.evo1) { ctx.strokeStyle = COL_CYAN; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4.5, 8.3, t * 2, t * 2 + Math.PI * 1.1); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = COL_GOLD; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4.5, 8.3, -t * 2, -t * 2 + Math.PI * 1.1); ctx.stroke(); }
});

// vòng giữ 0.5s Khui Kho + cổng dữ liệu khi triệu hồi
Object.assign(CharHooks.registry.collector, {
    draw() {
        if (this.colHold > 2 && this.colHold < COL_HOLD && this.colCd <= 0 && typeof drawReloadRing === 'function') drawReloadRing(this, this.colHold / COL_HOLD, COL_CYAN);
        if (this.colGate > 0) {
            const a = this.colGate / 20, cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            ctx.save(); ctx.globalAlpha = a * 0.7; ctx.strokeStyle = COL_CYAN; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(cx, cy, 20 + (1 - a) * 8, 8, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    },
});

// ---------- Hologram ----------
function colDrawMiniTank(c, alpha, t, label, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.fillStyle = c + '55'; TA.rr(-11, -9, 22, 20, 4); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = 1.2; TA.rr(-11, -9, 22, 20, 4); ctx.stroke();
    ctx.fillStyle = c + '99'; ctx.fillRect(-15, -10, 4, 22); ctx.fillRect(11, -10, 4, 22);
    ctx.fillStyle = c; ctx.fillRect(-2, -20, 4, 13);
    ctx.shadowBlur = 0;
    // vạch quét hologram
    ctx.strokeStyle = c; ctx.lineWidth = 0.6; ctx.globalAlpha = alpha * 0.6;
    const off = (t * 0.7 + seed) % 4;
    for (let y = -10 + off; y < 12; y += 4) { ctx.beginPath(); ctx.moveTo(-15, y); ctx.lineTo(15, y); ctx.stroke(); }
    ctx.restore();
}

function colDrawHolo(h) {
    const t = h.t, c = COL_HOLO_COLOR[h.kind] || '#fff';
    const fadeIn = Math.min(1, t / 12), fadeOut = Math.min(1, (h.end - t) / 10);
    const a = 0.75 * Math.max(0, Math.min(fadeIn, fadeOut)) * (t % 23 < 2 ? 0.55 : 1);   // chớp nhẹ như tín hiệu nhiễu
    const flip = h.ownerId === 2;
    // cổng dữ liệu dưới chân
    ctx.save(); ctx.translate(h.x, h.y);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(h.x, h.y);
    if (flip) ctx.rotate(Math.PI);
    colDrawMiniTank(c, a, t, COL_HOLO_NAME[h.kind], h.seed);
    ctx.restore();
    // tên + (Sniper) tia ngắm
    ctx.save(); ctx.globalAlpha = a; ctx.font = "700 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = c;
    ctx.fillText(COL_HOLO_NAME[h.kind], h.x, h.y + (flip ? 30 : -24));
    ctx.restore();
    if (h.kind === 'sniper' && t < 46) {
        const sy = flip ? h.y + 14 : h.y - 16, L = 900;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = h.locked ? '#ff2244' : 'rgba(255,90,90,0.55)'; ctx.lineWidth = h.locked ? 2 : 1;
        if (!h.locked) ctx.setLineDash([6, 5]);
        ctx.shadowColor = '#ff2244'; ctx.shadowBlur = h.locked ? 10 : 4;
        ctx.beginPath(); ctx.moveTo(h.x, sy); ctx.lineTo(h.x + Math.cos(h.ang) * L, sy + Math.sin(h.ang) * L); ctx.stroke();
        ctx.restore();
    }
}

// ---------- Kết liễu: ĐÓNG HỘP SƯU TẦM ----------
function colDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const outA = t > COLF_DUR - 30 ? Math.max(0, (COLF_DUR - t) / 30) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(2, 12, 24, ${0.55 * Math.min(1, t / 10) * outA})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'lighter';
    // 10 Hologram xếp hàng ngang trên làn người thắng
    const kinds = COL_HOLO_KINDS, step = W / (kinds.length + 1);
    for (let i = 0; i < kinds.length; i++) {
        const st = 6 + i * 4, c = COL_HOLO_COLOR[kinds[i]];
        if (t < st) continue;
        const x = step * (i + 1), a = Math.min(1, (t - st) / 10) * outA * (t > COLF_VOLLEY + 22 ? Math.max(0, 1 - (t - COLF_VOLLEY - 22) / 18) : 1);
        ctx.save(); ctx.translate(x, f.ly); if (f.team === 2) ctx.rotate(Math.PI);
        colDrawMiniTank(c, a * 0.9, t, '', i);
        ctx.restore();
        // khai hỏa tổng lực: tia bắn tới nạn nhân
        if (t >= COLF_VOLLEY && t < COLF_VOLLEY + 16) {
            const k = (t - COLF_VOLLEY) / 16;
            ctx.save(); ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = c; ctx.lineWidth = 3 - k * 2; ctx.shadowColor = c; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(x, f.ly); ctx.lineTo(x + (f.x - x) * Math.min(1, k * 2.2), f.ly + (f.y - f.ly) * Math.min(1, k * 2.2)); ctx.stroke();
            ctx.restore();
        }
    }
    // khung kính trưng bày rơi xuống
    if (t >= COLF_DROP - 30) {
        const k = Math.min(1, (t - (COLF_DROP - 30)) / 30), ease = k * k;
        const bw = 92, bh = 104, cy = f.y - 8, y = -bh + (cy - (-bh)) * ease, landed = t >= COLF_DROP;
        ctx.save(); ctx.globalAlpha = outA;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = landed ? 'rgba(125, 211, 252, 0.28)' : 'rgba(125, 211, 252, 0.16)';
        ctx.fillRect(f.x - bw / 2, y - bh / 2, bw, bh);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = COL_GOLD; ctx.lineWidth = 3; ctx.shadowColor = COL_GOLD; ctx.shadowBlur = 12;
        ctx.strokeRect(f.x - bw / 2, y - bh / 2, bw, bh);
        ctx.strokeStyle = COL_CYAN; ctx.lineWidth = 1; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(f.x - bw / 2 + 8, y - bh / 2 + 6); ctx.lineTo(f.x - bw / 2 + 24, y - bh / 2 + 6); ctx.moveTo(f.x - bw / 2 + 8, y - bh / 2 + 6); ctx.lineTo(f.x - bw / 2 + 8, y - bh / 2 + 22); ctx.stroke();
        if (landed) {   // băng phủ + nhãn giá
            ctx.fillStyle = 'rgba(186, 230, 253, 0.18)'; ctx.fillRect(f.x - bw / 2 + 4, y - bh / 2 + 4, bw - 8, bh - 8);
            const tagA = Math.min(1, (t - COLF_DROP - 8) / 10);
            if (tagA > 0) {
                ctx.globalAlpha = outA * tagA; ctx.globalCompositeOperation = 'source-over';
                const ty = y + bh / 2 + 6;
                ctx.fillStyle = '#fef3c7'; TA.rr(f.x - 46, ty, 92, 22, 3); ctx.fill();
                ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = '#7c2d12'; ctx.font = "800 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('COLLECTED #99', f.x, ty + 11);
            }
        }
        ctx.restore();
    }
    ctx.restore();
    if (t >= COLF_DROP + 14 && t < COLF_DUR) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - COLF_DROP - 14) / 8) * outA;
        ctx.font = "900 21px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 16; ctx.shadowColor = COL_CYAN; ctx.fillStyle = '#ecfeff';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 125 : -135)));
        ctx.translate(W / 2, ty);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'ĐÓNG HỘP SƯU TẦM!', 0, 0); else ctx.fillText('ĐÓNG HỘP SƯU TẦM!', 0, 0);
        ctx.restore();
    }
}
