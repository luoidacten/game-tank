// ==========================================
// DJ (dj) — Hình ảnh: bàn xoay đĩa, khuông nhạc equalizer neon, sóng âm bán nguyệt, loa kép,
// và đèn báo nhịp trên NÚT BẮN (DOM) của người chơi tại máy này.
// ==========================================

const DJ_LANE_HALF = 82, DJ_LANE_H = 18; // khuông dài & cao hơn -> dễ canh nhịp

function djLaneGeom(p) {
    const cx = Math.max(DJ_LANE_HALF + 4, Math.min(canvas.width - DJ_LANE_HALF - 4, p.x + p.w / 2));
    const cy = p.id === 1 ? p.y - 26 : p.y + p.h + 26;
    return { cx, cy };
}

function djRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}

// Đĩa than xoay + tai nghe trên thân xe
function djDrawDeck(p, tick) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const pulse = p.djPulse || 0;
    const r = p.w * 0.36;
    ctx.save();
    ctx.shadowBlur = 10 + pulse * 10; ctx.shadowColor = '#ff2fd1';
    ctx.fillStyle = '#0b0b16';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; ctx.lineWidth = 0.7;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, r * (0.35 + i * 0.18), 0, Math.PI * 2); ctx.stroke(); }
    const a = tick * 0.12;
    ctx.strokeStyle = '#ff2fd1'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, a, a + 1.1); ctx.stroke();
    ctx.strokeStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, a + Math.PI, a + Math.PI + 1.1); ctx.stroke();
    ctx.fillStyle = pulse > 0.3 ? '#fff' : '#ff2fd1';
    ctx.beginPath(); ctx.arc(cx, cy, 2.2 + pulse * 1.5, 0, Math.PI * 2); ctx.fill();
    // Tai nghe (vòm phía sau xe)
    const back = p.id === 1 ? 1 : -1;
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, p.w * 0.5, back > 0 ? 0.15 : Math.PI + 0.15, back > 0 ? Math.PI - 0.15 : Math.PI * 2 - 0.15);
    ctx.stroke();
    ctx.fillStyle = '#ff2fd1';
    ctx.fillRect(p.x - 3, cy - 4, 4, 8); ctx.fillRect(p.x + p.w - 1, cy - 4, 4, 8);
    // Vòng sáng lên bậc combo
    if (p.djTierFx > 0) {
        ctx.globalAlpha = p.djTierFx / 30;
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, p.w * (1.4 - p.djTierFx / 60), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}

// Full Evo: 2 cái Loa nổi hai bên sườn xe
function djDrawSpeakers(p, tick) {
    const cy = p.y + p.h / 2 + Math.sin(tick * 0.08) * 3;
    const dir = p.id === 1 ? -1 : 1;
    [-1, 1].forEach(side => {
        const x = p.x + p.w / 2 + side * 30;
        const kick = (p.djSpkT > 0 && p.djSpkFx === side) ? p.djSpkT / 10 : 0;
        const s = 1 + kick * 0.25;
        ctx.save();
        ctx.translate(x, cy + Math.sin(tick * 0.08 + side) * 2);
        ctx.scale(s, s);
        ctx.shadowBlur = 8 + kick * 14; ctx.shadowColor = '#22d3ee';
        ctx.fillStyle = '#111827';
        djRoundRect(-7, -9, 14, 18, 3); ctx.fill();
        ctx.strokeStyle = kick > 0 ? '#ffffff' : '#22d3ee'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff2fd1';
        ctx.beginPath(); ctx.arc(0, dir * -3, 4.2 + kick * 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b0b16';
        ctx.beginPath(); ctx.arc(0, dir * -3, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(0, dir * 5, 2, 0, Math.PI * 2); ctx.fill();
        // Vòng xung âm khi loa nhả sóng
        if (kick > 0) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${kick})`; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, 12 + (1 - kick) * 10, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    });
}

// Khuông nhạc: nốt chạy từ 2 phía vào vùng tâm (Calibration Zone)
function djDrawLane(p, tick) {
    const diff = djDiffOf(p);
    const { cx, cy } = djLaneGeom(p);
    const half = DJ_LANE_HALF, h = DJ_LANE_H;
    const phase = djPhase(p, tick);
    const pc = DJ_COLORS[phase];
    const pulse = p.djPulse || 0;
    ctx.save();
    // Khung nền
    ctx.fillStyle = 'rgba(8, 6, 22, 0.78)';
    djRoundRect(cx - half, cy - h / 2, half * 2, h, 7); ctx.fill();
    // Equalizer nền nhảy theo nhịp
    const bars = 16, bw = (half * 2 - 8) / bars;
    for (let i = 0; i < bars; i++) {
        const v = 0.25 + 0.55 * Math.abs(Math.sin(tick * 0.11 + i * 1.3)) * (0.6 + pulse * 0.6);
        const bh = Math.min(h - 3, (h - 3) * v);
        ctx.fillStyle = i % 2 ? 'rgba(255, 47, 209, 0.22)' : 'rgba(34, 211, 238, 0.22)';
        ctx.fillRect(cx - half + 4 + i * bw, cy + h / 2 - 1.5 - bh, bw - 1.5, bh);
    }
    ctx.strokeStyle = diff.color; ctx.lineWidth = 1.2;
    ctx.shadowBlur = 8; ctx.shadowColor = diff.color;
    djRoundRect(cx - half, cy - h / 2, half * 2, h, 7); ctx.stroke();
    ctx.shadowBlur = 0;
    // Vùng vàng (sắp vào tâm) & vùng đỏ (hoàn hảo)
    const px = (d) => d / diff.approach * (half - 6);
    const yw = px(diff.perf + diff.yel), rw = px(diff.perf);
    ctx.fillStyle = 'rgba(255, 214, 10, 0.16)';
    ctx.fillRect(cx - yw, cy - h / 2 + 1, yw * 2, h - 2);
    ctx.fillStyle = phase === 'red' ? 'rgba(255, 23, 68, 0.55)' : 'rgba(255, 23, 68, 0.22)';
    ctx.fillRect(cx - rw, cy - h / 2 + 1, rw * 2, h - 2);
    // Nốt nhạc (2 vạch đối xứng hội tụ vào tâm)
    for (const n of (p.djNotes || [])) {
        const d = n.t - tick;
        if (d > diff.approach) continue;
        if (n.hit) {
            const age = -d;
            if (age < 0 || age > 12) continue;
            ctx.globalAlpha = 1 - age / 12;
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, 6 + age * 1.6, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
            continue;
        }
        const off = px(Math.max(-diff.perf * 2, d));
        const late = d < -diff.perf;
        const col = late ? 'rgba(148, 163, 184, 0.5)' : (Math.abs(d) <= diff.perf ? '#ff1744' : (d <= diff.perf + diff.yel ? '#ffd60a' : '#5b8cff'));
        ctx.globalAlpha = late ? 0.5 : Math.min(1, 0.35 + (1 - d / diff.approach));
        ctx.fillStyle = col; ctx.shadowBlur = late ? 0 : 6; ctx.shadowColor = col;
        ctx.beginPath();
        [-1, 1].forEach(s => { if (ctx.roundRect) ctx.roundRect(cx + s * off - 2, cy - h / 2 + 2, 4, h - 4, 2); else ctx.rect(cx + s * off - 2, cy - h / 2 + 2, 4, h - 4); });
        ctx.fill();
        // Nốt Đôi: viền trắng + chấm nối 2 nhịp liên tiếp
        if (n.dbl && !late) {
            ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
            ctx.beginPath();
            [-1, 1].forEach(s => { if (ctx.roundRect) ctx.roundRect(cx + s * off - 2.5, cy - h / 2 + 1.5, 5, h - 3, 2); else ctx.rect(cx + s * off - 2.5, cy - h / 2 + 1.5, 5, h - 3); });
            ctx.stroke();
            if (n.dbl === 1) {
                const off2 = px(Math.max(-diff.perf * 2, d + diff.dblGap));
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'; ctx.setLineDash([2, 2]);
                ctx.beginPath();
                [-1, 1].forEach(s => { ctx.moveTo(cx + s * off, cy); ctx.lineTo(cx + s * off2, cy); });
                ctx.stroke(); ctx.setLineDash([]);
            }
        }
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    // Vòng tâm chuẩn
    ctx.strokeStyle = pc; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = pc;
    ctx.beginPath(); ctx.arc(cx, cy, 5.5 + pulse * 2.5, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    // Nhãn độ khó (trái) & lượt bảo hộ (phải)
    ctx.font = 'bold 7px "Orbitron", Arial';
    // Nhãn nằm phía "trên" khuông theo góc nhìn của người chơi (P2: phía y lớn hơn)
    const labY = p.id === 1 ? cy - h / 2 - 2.5 : cy + h / 2 + 8.5;
    const dotY = p.id === 1 ? cy - h / 2 - 4.5 : cy + h / 2 + 4.5;
    ctx.textAlign = 'center'; ctx.fillStyle = diff.color;
    drawWorldText(ctx, diff.short, cx - half + 9, labY);
    const g = djMaxGuards(p);
    for (let i = 0; i < g; i++) {
        ctx.fillStyle = i < (p.djGuards || 0) ? '#4ade80' : 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(cx + half - 4 - i * 5, dotY, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    // Combo
    const combo = p.djCombo || 0;
    const ty = p.id === 1 ? cy - h / 2 - 3 : cy + h / 2 + 10;
    if (combo > 0) {
        ctx.textAlign = 'center';
        ctx.font = `900 ${10 + Math.min(4, djTier(p) * 0.4) + pulse * 2}px "Orbitron", Arial`;
        ctx.fillStyle = combo >= 120 ? '#ff7ae6' : (combo >= 60 ? '#ff9a3c' : (combo >= 30 ? '#facc15' : '#e2e8f0'));
        ctx.shadowBlur = 8; ctx.shadowColor = ctx.fillStyle;
        drawWorldText(ctx, `x${combo}`, cx, ty);
        ctx.shadowBlur = 0;
    }
    // Phản hồi bấm
    const fb = p.djFb;
    if (fb && tick - fb.t < 24) {
        const k = 1 - (tick - fb.t) / 24;
        const txt = { perfect: 'PERFECT!', miss: 'LOẠN ÂM', guard: 'BẢO HỘ', auto: 'AUTO!' }[fb.k] || '';
        const col = { perfect: '#ff2fd1', miss: '#94a3b8', guard: '#4ade80', auto: '#facc15' }[fb.k] || '#fff';
        ctx.globalAlpha = k;
        ctx.font = 'bold 8px "Orbitron", Arial'; ctx.textAlign = 'center'; ctx.fillStyle = col;
        const dy = (p.id === 1 ? -1 : 1) * (12 + (1 - k) * 8);
        drawWorldText(ctx, txt, cx + half * 0.62, ty + dy * 0.4 + (p.id === 1 ? -2 : 2));
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

Object.assign(CharHooks.registry.dj, {
    draw() {
        const tick = djViewTick(this);
        djDrawDeck(this, tick);
        if (djFull(this)) djDrawSpeakers(this, tick);
        // Giữ nút: vòng tiến trình đổi bản nhạc
        if (this.djHold > 6 && this.djHold < DJ_HOLD_TICKS && this.djPrevS) {
            ctx.save();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.djHold / DJ_HOLD_TICKS); ctx.stroke();
            ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0) return;
        djDrawLane(this, djViewTick(this));
        djSyncShootButtons();
    },
});

// ---- Đạn sóng âm hình bán nguyệt ----
BulletHooks.registry.dj.draw = function (b) {
    const dir = b.djDir || (b.vy < 0 ? -1 : 1);
    const cx = b.x + b.w / 2;
    const yf = dir < 0 ? b.y : b.y + b.h;      // mép trước
    const yb = dir < 0 ? b.y + b.h : b.y;      // mép sau
    const col = b.djKind === 'perfect' ? '#ff2fd1' : (b.djKind === 'speaker' ? '#22d3ee' : '#8193c4');
    const half = b.w / 2;
    const crescent = (scale, alpha, offY) => {
        const hw = half * scale, y1 = yb + offY, y0 = yf + offY;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(cx - hw, y1);
        ctx.quadraticCurveTo(cx, y0 + dir * b.h * 0.7, cx + hw, y1);
        ctx.quadraticCurveTo(cx, y0 - dir * b.h * 0.15, cx - hw, y1);
        ctx.closePath();
        ctx.fill();
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = col; ctx.shadowBlur = 12; ctx.shadowColor = col;
    // Dư âm phía sau
    crescent(0.8, 0.22, -dir * b.h * 1.3);
    crescent(0.9, 0.38, -dir * b.h * 0.65);
    crescent(1, 0.95, 0);
    // Lõi trắng
    ctx.shadowBlur = 0; ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = b.djKind === 'perfect' ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(cx - half * 0.8, yb - dir * 1);
    ctx.quadraticCurveTo(cx, yf + dir * b.h * 0.45, cx + half * 0.8, yb - dir * 1);
    ctx.stroke();
    // Thuộc tính Evo 2: viền vàng (xuyên) / lõi cam (nổ)
    if (b.isPiercing || b.djBoom) {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = b.djBoom ? '#ff9a3c' : '#facc15'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - half, yb);
        ctx.quadraticCurveTo(cx, yf + dir * b.h * 0.8, cx + half, yb);
        ctx.stroke();
    }
    ctx.restore();
};

// ==========================================
// Đèn báo nhịp trên NÚT BẮN (DOM) — chỉ cho xe điều khiển tại máy này.
// Khôi phục kiểu gốc khi không còn DJ / hết hiệp / đổi bố cục điều khiển.
// ==========================================
let djStyledButtons = [];

function djLocalButtons() {
    const out = [];
    if (typeof gameState === 'undefined' || gameState.phase !== 'playing' || typeof p1 === 'undefined' || !p1) return out;
    const online = typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline;
    if (online) {
        const me = onlineManager.role === 'host' ? p1 : p2;
        if (me && me.weapon === 'dj') out.push([document.querySelector('#p1-controls .btn-shoot'), me]);
    } else {
        if (p1.weapon === 'dj') out.push([document.querySelector('#p1-controls .btn-shoot'), p1]);
        const p2Bot = typeof botAI !== 'undefined' && botAI && botAI.enabled;
        if (p2 && p2.weapon === 'dj' && !p2Bot) out.push([document.querySelector('#p2-controls .btn-shoot'), p2]);
    }
    return out.filter(([el, p]) => el && p.hp > 0);
}

function djRestoreButton(el) {
    el.style.removeProperty('background');
    el.style.removeProperty('border-color');
    el.style.removeProperty('box-shadow');
    el.removeAttribute('data-dj-phase');
}

function djSyncShootButtons() {
    const list = djLocalButtons();
    const owned = list.map(([el]) => el);
    djStyledButtons = djStyledButtons.filter(el => {
        if (owned.includes(el)) return true;
        djRestoreButton(el); return false;
    });
    for (const [el, p] of list) {
        const ph = djPhase(p);
        if (!djStyledButtons.includes(el)) djStyledButtons.push(el);
        if (el.getAttribute('data-dj-phase') === ph) continue;
        el.setAttribute('data-dj-phase', ph);
        const STY = {
            blue: ['linear-gradient(150deg, #3b6bff 0%, #1d3fb8 60%, #0b1a5c 100%)', '#5b8cff', '0 6px 0 #071036, 0 0 18px rgba(59, 107, 255, 0.55)'],
            yellow: ['linear-gradient(150deg, #ffe45c 0%, #f5b700 60%, #8a5a00 100%)', '#fff3a3', '0 6px 0 #3d2800, 0 0 26px rgba(255, 214, 10, 0.8)'],
            red: ['linear-gradient(150deg, #ff4d6d 0%, #e0002a 60%, #6b0014 100%)', '#ffffff', '0 6px 0 #2b0008, 0 0 34px rgba(255, 23, 68, 1)'],
            lock: ['linear-gradient(150deg, #64748b 0%, #475569 60%, #1e293b 100%)', '#94a3b8', '0 6px 0 #0f172a'],
        }[ph];
        el.style.setProperty('background', STY[0]);
        el.style.setProperty('border-color', STY[1]);
        el.style.setProperty('box-shadow', STY[2]);
    }
}

// Vòng riêng mỗi khung hình (kể cả khi DJ không còn được vẽ) để khôi phục nút đúng lúc
(function djButtonLoop() {
    try { if (djStyledButtons.length || djLocalButtons().length) djSyncShootButtons(); } catch (e) { }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(djButtonLoop);
})();
