// ==========================================
// Phi Công (jet_pilot) — Hình ảnh: mech hai chân mang chiến cơ trên lưng (Hợp Nhất), Chân (khung
// chân + pháo cối đôi, khớp neo trống), Phi Ảnh (tiêm kích cánh tam giác, lửa đốt sau), bom / pháo
// cối có cảnh báo, vệt oanh tạc, HUD nút Bắn (đang lái gì, hồi chiêu Cất Cánh / Hợp Nhất),
// kết liễu "✈ BÁ CHỦ BẦU TRỜI ✈". Chỉ đọc state -> an toàn online.
// ==========================================

function jpNow() { return Date.now() / 1000; }
function jpEase(k) { return 1 - Math.pow(1 - k, 3); }

// Chiến cơ (lưới 32, mũi hướng -y). flame: 0..1 độ dài lửa đốt sau
function jpJetShape(t, team, accent, flame, full) {
    // lửa đốt sau (afterburner) 2 ống
    if (flame > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const s of [-1, 1]) {
            const L = 7 + flame * 9 + Math.sin(t * 40 + s) * 2;
            const g = ctx.createLinearGradient(0, 10, 0, 10 + L);
            g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)'); g.addColorStop(0.7, 'rgba(251, 146, 60, 0.7)'); g.addColorStop(1, 'rgba(251, 146, 60, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(s * 3 - 2, 10); ctx.lineTo(s * 3 + 2, 10); ctx.lineTo(s * 3, 10 + L); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
    // cánh tam giác
    ctx.fillStyle = TA.metal(-15, 15, '#162033', '#3c4d68');
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(15, 7); ctx.lineTo(14, 9.5); ctx.lineTo(4, 7.5); ctx.lineTo(-4, 7.5); ctx.lineTo(-14, 9.5); ctx.lineTo(-15, 7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = team; ctx.lineWidth = 0.9; TA.glow(team, 5); ctx.stroke(); TA.noGlow();
    // vạch neon trên cánh
    ctx.strokeStyle = accent; ctx.lineWidth = 0.8; TA.glow(accent, 6);
    ctx.beginPath(); ctx.moveTo(4, 1); ctx.lineTo(13, 8); ctx.moveTo(-4, 1); ctx.lineTo(-13, 8); ctx.stroke(); TA.noGlow();
    // cánh đuôi kép
    ctx.fillStyle = '#26354d';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 3, 4); ctx.lineTo(s * 7.5, 11); ctx.lineTo(s * 4.5, 11); ctx.closePath(); ctx.fill(); }
    // thân
    ctx.fillStyle = TA.metal(-4, 4, '#1f2a3d', '#8193ad');
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.quadraticCurveTo(4, -8, 4, 2); ctx.lineTo(3.4, 10.5); ctx.lineTo(-3.4, 10.5); ctx.lineTo(-4, 2); ctx.quadraticCurveTo(-4, -8, 0, -15); ctx.fill();
    // buồng lái
    const cg = ctx.createLinearGradient(0, -10, 0, -2);
    cg.addColorStop(0, '#e0f7ff'); cg.addColorStop(1, accent);
    ctx.fillStyle = cg; TA.glow(accent, 8);
    ctx.beginPath(); ctx.ellipse(0, -6.5, 1.9, 4.2, 0, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    // ống xả
    ctx.fillStyle = '#0b0f17'; ctx.fillRect(-4.6, 9.5, 3.2, 1.8); ctx.fillRect(1.4, 9.5, 3.2, 1.8);
    // đèn đầu cánh
    const blink = Math.sin(t * 8) > 0;
    ctx.fillStyle = blink ? '#ef4444' : '#22c55e';
    ctx.fillRect(-15, 6.5, 1.4, 1.4); ctx.fillStyle = blink ? '#22c55e' : '#ef4444'; ctx.fillRect(13.6, 6.5, 1.4, 1.4);
    if (full) {
        ctx.fillStyle = JP_GOLD; TA.glow(JP_GOLD, 6);
        ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(1, -11); ctx.lineTo(0, -10); ctx.lineTo(-1, -11); ctx.closePath(); ctx.fill(); TA.noGlow();
    }
}

// Khung chân mech (lưới 32)
function jpLegsShape(t, team, accent, walk, recoil, split) {
    const sw = Math.sin(t * 9) * walk;
    for (const s of [-1, 1]) {
        const lift = s * sw;
        // đùi + cẳng
        ctx.fillStyle = TA.metal(s * 11 - 3, s * 11 + 3, '#141b28', '#4b5a72');
        TA.rr(s * 11 - 3, -9 + lift, 6, 11, 2); ctx.fill();
        ctx.fillStyle = '#2b3850'; TA.rr(s * 11 - 3.5, 1 + lift, 7, 10, 2); ctx.fill();
        // khớp gối phát sáng
        ctx.fillStyle = accent; TA.glow(accent, 6);
        ctx.beginPath(); ctx.arc(s * 11, 1.5 + lift, 1.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
        // bàn chân
        ctx.fillStyle = '#0f1520'; TA.rr(s * 11 - 5, 10 + lift, 10, 4, 1.5); ctx.fill();
        ctx.strokeStyle = team; ctx.lineWidth = 0.7; ctx.stroke();
    }
    // hông
    ctx.fillStyle = TA.metal(-9, 9, '#1a2334', '#55657f');
    ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.lineTo(8, 6); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = team; ctx.lineWidth = 0.9; TA.glow(team, 5); ctx.stroke(); TA.noGlow();
    if (split) {
        // pháo cối đôi + khớp neo trống (chờ Phi Ảnh đáp)
        const rc = recoil * 2.5;
        ctx.fillStyle = TA.metal(-6, 6, '#2a364c', '#9fb0c8');
        TA.rr(-5.5, -11 + rc, 4, 9, 1.4); ctx.fill(); TA.rr(1.5, -11 + rc, 4, 9, 1.4); ctx.fill();
        ctx.fillStyle = accent; TA.glow(accent, 6);
        ctx.fillRect(-4.5, -11.5 + rc, 2, 1.2); ctx.fillRect(2.5, -11.5 + rc, 2, 1.2); TA.noGlow();
        const pul = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.strokeStyle = accent; ctx.globalAlpha *= 0.4 + 0.5 * pul; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.arc(0, 1, 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha /= 0.4 + 0.5 * pul;
    }
}

// ---------- Xe (Hợp Nhất / Chân) ----------
registerTankArt('jet_pilot', (p, k) => {
    const t = k.t, accent = k.full ? JP_GOLD : JP_CYAN;
    const moving = Math.abs(p._vx || 0) > 0.3 ? 1 : 0.15;
    const rc = (p.jpRecoil || 0) / 10;
    if (p.jpSplit) { jpLegsShape(t, k.team, accent, moving * 1.4, rc, true); return; }
    jpLegsShape(t, k.team, accent, moving, 0, false);
    // chiến cơ gắn trên lưng (hơi thu nhỏ), 2 bệ phóng tên lửa
    ctx.save(); ctx.translate(0, -2 + rc * 1.5); ctx.scale(0.9, 0.9);
    jpJetShape(t, k.team, accent, 0.25 + 0.15 * Math.sin(t * 12), k.full);
    ctx.restore();
    const am = p.ammo || 0;
    for (let i = 0; i < 3; i++) {
        const lit = i < am;
        ctx.fillStyle = lit ? (i === 1 ? JP_FIRE : accent) : '#2a3240';
        if (lit) TA.glow(i === 1 ? JP_FIRE : accent, 5);
        TA.rr((i - 1) * 9 - 1.2, -15, 2.4, 4, 1); ctx.fill(); TA.noGlow();
    }
    if (k.evo1 || k.evo2) {
        ctx.fillStyle = accent; ctx.globalAlpha *= 0.85;
        ctx.beginPath(); ctx.arc(-14, -10, 1, 0, Math.PI * 2); ctx.arc(14, -10, 1, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha /= 0.85;
    }
});

// ---------- Phi Ảnh (vẽ ở toạ độ thế giới) ----------
function jpDrawJet(p) {
    const t = jpNow(), tc = TEAM_COLORS[p.id] || TEAM_COLORS[1];
    const full = jpFull(p), accent = full ? JP_GOLD : JP_CYAN;
    const s = 26 / 32, run = p.jpRunT > 0;
    ctx.save();
    // bóng đổ xuống sân (xa -> nhỏ)
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(p.jpJx + 8, p.jpJy + 16, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    // vệt khói phản lực
    ctx.globalCompositeOperation = 'lighter';
    const d = jpDir(p);
    ctx.strokeStyle = run ? 'rgba(251, 146, 60, 0.35)' : 'rgba(34, 211, 238, 0.18)'; ctx.lineWidth = run ? 5 : 3;
    ctx.beginPath(); ctx.moveTo(p.jpJx, p.jpJy - d * 10); ctx.lineTo(p.jpJx - (p.jpJvx || 0) * 6, p.jpJy - d * (26 + (run ? 20 : 0))); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(p.jpJx, p.jpJy);
    ctx.rotate(Math.max(-0.35, Math.min(0.35, (p.jpJvx || 0) * 0.06)) * (p.id === 1 ? 1 : -1));
    ctx.scale(s, p.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const bob = Math.sin(t * 3) * 1.2; ctx.translate(0, bob);
    try { jpJetShape(t, tc.team, accent, run ? 1 : 0.55 + 0.25 * Math.sin(t * 15), full); } catch (e) { /* bỏ qua */ }
    if ((p.jpJetFlash || 0) > 0) {
        ctx.fillStyle = '#fff'; TA.glow(accent, 10);
        ctx.beginPath(); ctx.arc(-6, -10, 1.8, 0, Math.PI * 2); ctx.arc(6, -10, 1.8, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    }
    ctx.restore();
}

// Đánh dấu đơn vị đang được điều khiển (mũi tên + "BẠN"), đơn vị còn lại hiện "AI"
function jpCtrlMarker(x, y, team, mine, label, upward) {
    ctx.save();
    const t = jpNow(), b = Math.sin(t * 6) * 2;
    ctx.font = "800 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
    if (mine) {
        ctx.fillStyle = team; ctx.shadowColor = team; ctx.shadowBlur = 8;
        const yy = y + (upward ? -1 : 1) * (6 + b);
        ctx.beginPath(); ctx.moveTo(x - 5, yy); ctx.lineTo(x + 5, yy); ctx.lineTo(x, yy + (upward ? 5 : -5)); ctx.closePath(); ctx.fill();
        ctx.fillText(label, x, yy + (upward ? -3 : 10));
    } else {
        ctx.globalAlpha = 0.75; ctx.fillStyle = '#94a3b8';
        ctx.fillText(label, x, y + (upward ? -2 : 8));
    }
    ctx.restore();
}

// ---------- Đạn ----------
function jpDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, t = jpNow();
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const col = b.jpK === 'missile' ? JP_FIRE : JP_CYAN;
    ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = b.jpK === 'missile' || b.jpK === 'shell' ? 4 : 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (b.vx || 0) * 2.4, y - (b.vy || 0) * 2.4); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
    ctx.shadowColor = col;
    if (b.jpK === 'missile') {
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(3, -5, 2.6, 5); ctx.lineTo(-2.6, 5); ctx.quadraticCurveTo(-3, -5, 0, -8); ctx.fill();
        ctx.fillStyle = JP_RED; ctx.fillRect(-2.6, -4, 5.2, 1.6);
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(-2.6, 3); ctx.lineTo(-5, 7); ctx.lineTo(-2.6, 6); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(2.6, 3); ctx.lineTo(5, 7); ctx.lineTo(2.6, 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = Math.sin(t * 50) > 0 ? '#fff7d6' : JP_FIRE;
        ctx.beginPath(); ctx.moveTo(-1.6, 6); ctx.lineTo(1.6, 6); ctx.lineTo(0, 11 + Math.random() * 3); ctx.closePath(); ctx.fill();
    } else if (b.jpK === 'shell') {
        ctx.shadowBlur = 14;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        g.addColorStop(0, '#ecfeff'); g.addColorStop(0.5, JP_CYAN); g.addColorStop(1, '#0e7490');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(165, 243, 252, 0.7)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, 8 + Math.sin(t * 20) * 1.2, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.shadowBlur = 8; ctx.fillStyle = b.jpK === 'aim' ? '#a5f3fc' : '#e0f2fe';
        TA.rr(-1.6, -4.5, 3.2, 9, 1.5); ctx.fill();
        ctx.fillStyle = JP_CYAN; ctx.fillRect(-0.8, -3.5, 1.6, 7);
    }
    ctx.restore();
}

// ---------- Bom / Pháo cối ----------
function jpDrawBomb(m) {
    ctx.save();
    if (m.delay > 0) {
        const k = 1 - m.delay / m.maxDelay, mortar = m.kind === 'mortar';
        const c = mortar ? '34, 211, 238' : '251, 146, 60';
        ctx.strokeStyle = `rgba(${c}, ${0.4 + 0.5 * k})`; ctx.fillStyle = `rgba(${c}, ${0.06 + 0.16 * k})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * k, 0, Math.PI * 2); ctx.stroke();
        // dấu ngắm
        ctx.beginPath(); ctx.moveTo(m.x - m.r - 4, m.y); ctx.lineTo(m.x - m.r + 5, m.y); ctx.moveTo(m.x + m.r + 4, m.y); ctx.lineTo(m.x + m.r - 5, m.y); ctx.stroke();
        // [MỚI] bom oanh tạc: dấu ⚠ nhấp nháy trong 1s cảnh báo
        if (!mortar) {
            ctx.fillStyle = (Math.floor(m.delay / 6) % 2) ? '#fde047' : '#f43f5e';
            ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
            ctx.fillText('⚠', m.x, m.y - m.r - 3);
        }
        // quả bom rơi (to dần)
        const sz = 2 + 3 * k;
        ctx.fillStyle = mortar ? '#a5f3fc' : '#1f2937'; ctx.strokeStyle = `rgb(${c})`; ctx.lineWidth = 1;
        ctx.shadowColor = `rgb(${c})`; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.ellipse(m.x, m.y - (1 - k) * 18, sz * 0.7, sz, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
        const k = m.boom / 18;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * (1 + k * 0.6));
        g.addColorStop(0, `rgba(255, 247, 214, ${0.8 * (1 - k)})`); g.addColorStop(0.5, `rgba(251, 146, 60, ${0.5 * (1 - k)})`); g.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (1 + k * 0.6), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function jpDrawFlyby(f) {
    const k = jpEase(Math.min(1, f.t / f.dur)), x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k;
    const tc = TEAM_COLORS[f.team] || TEAM_COLORS[1];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x, y); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(x, y); ctx.rotate(Math.atan2(f.y1 - f.y0, f.x1 - f.x0) + Math.PI / 2);
    ctx.scale(0.85, 0.85);
    jpJetShape(jpNow(), tc.team, JP_CYAN, 1, false);
    ctx.restore();
}

// ---------- Kết liễu BÁ CHỦ BẦU TRỜI ----------
function jpDrawFinisher(f) {
    if (f.t > 110) return;
    const k = f.t / 110;
    ctx.save();
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.55 * (1 - k)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, 20 + 120 * jpEase(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function jpDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const tc = TEAM_COLORS[f.team] || TEAM_COLORS[1];
    ctx.save();
    const dark = t < 10 ? t / 10 : (t < 100 ? 1 : Math.max(0, 1 - (t - 100) / 40));
    if (dark > 0) { ctx.fillStyle = `rgba(4, 10, 22, ${0.5 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // phi đội 3 chiếc bay ngang màn hình (trái -> phải) dọc làn nạn nhân
    if (t < 80) {
        const k = Math.min(1, t / 60);
        for (let j = 0; j < 3; j++) {
            const x = -60 + (W + 120) * k - j * 34, y = f.y + (j - 1) * 26 + (j === 1 ? -10 : 0);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = j === 1 ? 'rgba(253, 224, 71, 0.5)' : 'rgba(34, 211, 238, 0.4)'; ctx.lineWidth = j === 1 ? 4 : 3;
            ctx.beginPath(); ctx.moveTo(Math.max(-60, x - 220), y); ctx.lineTo(x, y); ctx.stroke();
            ctx.restore();
            ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2); ctx.scale(1.1, 1.1);
            jpJetShape(jpNow(), tc.team, j === 1 ? JP_GOLD : JP_CYAN, 1, j === 1);
            ctx.restore();
        }
    }
    // bom thả theo đường bay
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
        const td = 22 + i * 5, x = (i + 0.5) * W / 9;
        if (t > td - 12 && t < td) {
            const k = (t - (td - 12)) / 12;
            ctx.fillStyle = '#fde68a';
            ctx.beginPath(); ctx.arc(x, f.y - 40 * (1 - k), 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (t >= td && t < td + 40) {
            const k = (t - td) / 40, R = 20 + 34 * jpEase(k);
            const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, R);
            g.addColorStop(0, `rgba(255, 247, 214, ${0.85 * (1 - k)})`); g.addColorStop(0.45, `rgba(251, 146, 60, ${0.6 * (1 - k)})`); g.addColorStop(1, 'rgba(244, 63, 94, 0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, f.y, R, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
    if (t >= 40 && t < 145) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 40) / 8) * (t > 125 ? 1 - (t - 125) / 20 : 1);
        ctx.font = "900 22px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = JP_FIRE; ctx.fillStyle = JP_GOLD;
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 96 : -88)));
        const sc = 1 + Math.max(0, 1 - (t - 40) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        const s = '✈ BÁ CHỦ BẦU TRỜI ✈';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, s, 0, 0); else ctx.fillText(s, 0, 0);
        ctx.restore();
    }
}
function jpFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof JpFinisher && e.active) e.drawOver();
}

// ---------- Quanh xe ----------
Object.assign(CharHooks.registry.jet_pilot, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const tc = TEAM_COLORS[this.id] || TEAM_COLORS[1];
        ctx.save();
        // sóng năng lượng Cất Cánh
        if (this.jpWaveFx > 0) {
            const a = this.jpWaveFx / 24, R = (this.jpWaveR || 130) * (1 - a * 0.85);
            ctx.strokeStyle = JP_CYAN; ctx.shadowColor = JP_CYAN; ctx.shadowBlur = 14; ctx.globalAlpha = a; ctx.lineWidth = 3 * a + 1;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = a * 0.15; ctx.fillStyle = JP_CYAN; ctx.fill();
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        }
        if (this.jpMergeFx > 0) {
            const a = this.jpMergeFx / 24;
            ctx.strokeStyle = JP_GOLD; ctx.globalAlpha = a; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + (1 - a)), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        }
        // vòng giữ nút
        const h = this.jpHold || 0;
        if (h > 6 && !this.jpHoldUsed) {
            let need = JP_HOLD_SPLIT, col = JP_CYAN;
            if (this.jpSplit && h >= JP_HOLD_SPLIT) { need = JP_HOLD_MERGE; col = this.jpMergeCd > 0 ? '#64748b' : JP_GOLD; }
            else if (!this.jpSplit && this.jpSplitCd > 0) col = '#64748b';
            const ux = this.jpSplit && this.jpCtrl === 1 ? this.jpJx : cx, uy = this.jpSplit && this.jpCtrl === 1 ? this.jpJy : cy;
            ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(ux, uy, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / need)); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        if (this.jpSplit) {
            // dây liên kết mảnh giữa Chân & Phi Ảnh
            ctx.save();
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.22)'; ctx.setLineDash([3, 6]); ctx.lineDashOffset = -jpNow() * 30; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(this.jpJx, this.jpJy); ctx.stroke();
            ctx.restore();
            jpDrawJet(this);
            const up = this.id === 1;
            jpCtrlMarker(this.jpJx, this.jpJy + (up ? -16 : 16), tc.team, this.jpCtrl === 1, this.jpCtrl === 1 ? 'BẠN' : 'AI', up);
            jpCtrlMarker(cx, up ? this.y - 18 : this.y + this.h + 18, tc.team, this.jpCtrl === 0, this.jpCtrl === 0 ? 'BẠN' : 'AI', up);
        }
    },
});

// Nút Bắn: dạng hiện tại / giữ Cất Cánh / Đổi / Hợp Nhất + hồi chiêu
function jpRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('jet_pilot', p => {
        const h = p.jpHold || 0, mx = p.maxAmmo || 3, am = p.ammo || 0;
        const sec = n => Math.ceil(n / 60) + 's';
        if (!p.jpSplit) {
            if (h > 6 && !p.jpHoldUsed) {
                if (p.jpSplitCd > 0) return { pct: 1 - p.jpSplitCd / jpSplitCdMax(p), ready: false, color: '#64748b', label: 'CẤT CÁNH ' + sec(p.jpSplitCd), btnIcon: '🛫', dim: true };
                return { pct: Math.min(1, h / JP_HOLD_SPLIT), ready: false, color: JP_CYAN, label: 'CẤT CÁNH…', btnIcon: '🛫' };
            }
            const rdy = p.jpSplitCd <= 0;
            return { idle: true, pct: rdy ? 1 : 1 - p.jpSplitCd / jpSplitCdMax(p), ready: rdy, color: rdy ? JP_CYAN : '#64748b', label: rdy ? 'HỢP NHẤT · CẤT CÁNH ✓' : 'HỢP NHẤT · ' + sec(p.jpSplitCd), btnIcon: '🚀', segments: mx, lit: am };
        }
        const who = p.jpCtrl === 1 ? '✈ PHI ẢNH' : '⚙ CHÂN';
        if (h > 6 && !p.jpHoldUsed) {
            if (h < JP_HOLD_SPLIT) return { pct: h / JP_HOLD_SPLIT, ready: false, color: JP_CYAN, label: 'ĐỔI → ' + (p.jpCtrl === 1 ? 'CHÂN' : 'PHI ẢNH'), btnIcon: '⇄' };
            if (p.jpMergeCd > 0) return { pct: 1, ready: true, color: JP_CYAN, label: 'NHẢ: ĐỔI · HỢP NHẤT ' + sec(p.jpMergeCd), btnIcon: '⇄' };
            return { pct: Math.min(1, (h - JP_HOLD_SPLIT) / (JP_HOLD_MERGE - JP_HOLD_SPLIT)), ready: false, color: JP_GOLD, label: 'HỢP NHẤT…', btnIcon: '🛡' };
        }
        const mr = p.jpMergeCd <= 0;
        return { idle: true, pct: am / mx, ready: false, color: p.jpCtrl === 1 ? JP_CYAN : JP_FIRE, label: who + ' · ' + (mr ? 'HỢP NHẤT ✓' : 'HN ' + sec(p.jpMergeCd)), btnIcon: p.jpCtrl === 1 ? '✈' : '⚙', segments: mx, lit: am };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', jpRegisterHUD);
