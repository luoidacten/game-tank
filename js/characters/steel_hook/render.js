// ==========================================
// Móc Thép (steel_hook) — Hình ảnh: xích thép từng mắt, móc thép phát sáng,
// quạt ngắm + dự đoán quỹ đạo nảy, tời quay trên thân xe, móc phụ Evo 2
// ==========================================

const SH_STEEL = '#d5dee8', SH_STEEL_DARK = '#5b6777', SH_GLOW = '#7fdcff';

// Dự đoán quỹ đạo (chỉ tính tường sân) để vẽ đường ngắm
function shPredict(p, ang, bounces, maxLen) {
    const W = canvas.width, H = canvas.height, r = shHeadR(p);
    const n = shNose(p), d = shDir(p, ang);
    let x = n.x, y = n.y, vx = d.x, vy = d.y, len = 0, b = bounces;
    const pts = [{ x, y }];
    while (len < maxLen) {
        x += vx * 4; y += vy * 4; len += 4;
        let hit = false;
        if (x < r) { x = r; vx = Math.abs(vx); hit = true; } else if (x > W - r) { x = W - r; vx = -Math.abs(vx); hit = true; }
        if (y < r) { y = r; vy = Math.abs(vy); hit = true; } else if (y > H - r) { y = H - r; vy = -Math.abs(vy); hit = true; }
        if (hit) { pts.push({ x, y, bounce: true }); if (b-- <= 0) return pts; }
    }
    pts.push({ x, y });
    return pts;
}

// Xích: lớp phát sáng + từng mắt xích xen kẽ (ngang / nghiêng)
function shDrawChain(path, alpha = 1, tight = false) {
    if (!path || path.length < 2) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowBlur = 10; ctx.shadowColor = SH_GLOW;
    ctx.strokeStyle = tight ? 'rgba(160,225,255,0.55)' : 'rgba(120,190,240,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    let carry = 0, idx = 0;
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const L = Math.hypot(b.x - a.x, b.y - a.y);
        if (L < 0.5) continue;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        for (let s = carry; s < L; s += 7) {
            const x = a.x + (b.x - a.x) * s / L, y = a.y + (b.y - a.y) * s / L;
            ctx.save();
            ctx.translate(x, y); ctx.rotate(ang);
            if (idx++ % 2 === 0) {
                ctx.strokeStyle = SH_STEEL_DARK; ctx.lineWidth = 2.6;
                ctx.beginPath(); ctx.ellipse(0, 0, 4.4, 2.4, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.strokeStyle = SH_STEEL; ctx.lineWidth = 1.3;
                ctx.beginPath(); ctx.ellipse(0, 0, 4.4, 2.4, 0, 0, Math.PI * 2); ctx.stroke();
            } else {
                ctx.strokeStyle = SH_STEEL_DARK; ctx.lineWidth = 2.6;
                ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();
                ctx.strokeStyle = '#eef4fb'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(-3.5, 0); ctx.lineTo(3.5, 0); ctx.stroke();
            }
            ctx.restore();
            carry = s + 7 - L;
        }
        if (carry < 0) carry = 0;
    }
    ctx.restore();
}

// Chốt nảy (bu-lông sáng)
function shDrawAnchor(x, y, flash) {
    ctx.save();
    ctx.shadowBlur = flash ? 16 : 8; ctx.shadowColor = flash ? '#ffffff' : '#ffd27a';
    ctx.fillStyle = '#2a3340';
    ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = flash ? '#ffffff' : '#ffd27a'; ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#fff6d6';
    ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Đầu móc: thân + 2 ngạnh cong + mũi nhọn, phát sáng xanh thép
function shDrawHookHead(x, y, ang, scale = 1, flash = 0, color = SH_GLOW) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(scale, scale);
    ctx.shadowBlur = 14; ctx.shadowColor = flash ? '#ffffff' : color;
    const g = ctx.createLinearGradient(-8, 0, 8, 0);
    g.addColorStop(0, '#8693a3'); g.addColorStop(0.5, '#f4f8fc'); g.addColorStop(1, '#7a8696');
    ctx.strokeStyle = g; ctx.lineCap = 'round';
    // Vòng chốt
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 7, 2.6, 0, Math.PI * 2); ctx.stroke();
    // Thân
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(0, 4.5); ctx.lineTo(0, -6); ctx.stroke();
    // Hai ngạnh
    ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.quadraticCurveTo(-8, -1, -7, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.quadraticCurveTo(8, -1, 7, -8); ctx.stroke();
    ctx.fillStyle = flash ? '#ffffff' : '#e8f6ff';
    [[-7, -8], [7, -8]].forEach(([px, py]) => { ctx.beginPath(); ctx.moveTo(px - 1.8, py + 1.5); ctx.lineTo(px, py - 3); ctx.lineTo(px + 1.8, py + 1.5); ctx.fill(); });
    // Mũi giữa
    ctx.beginPath(); ctx.moveTo(-2.2, -5); ctx.lineTo(0, -11); ctx.lineTo(2.2, -5); ctx.closePath(); ctx.fill();
    ctx.restore();
}

function shHookAng(h) {
    const last = h.pts[h.pts.length - 1];
    if (h.st === 'fly') return Math.atan2(h.vy, h.vx);
    const dx = h.x - last.x, dy = h.y - last.y;
    return (Math.abs(dx) + Math.abs(dy) > 0.5) ? Math.atan2(dy, dx) : Math.atan2(h.vy || 0, h.vx || 1);
}

function shDrawStun(e) {
    const t = Date.now() / 160;
    ctx.save();
    ctx.fillStyle = '#ffe66d'; ctx.shadowBlur = 6; ctx.shadowColor = '#ffe66d';
    for (let i = 0; i < 3; i++) {
        const a = t + i * 2.09;
        const sx = e.x + e.w / 2 + Math.cos(a) * e.w * 0.6, sy = e.y + e.h / 2 + Math.sin(a) * e.h * 0.25 - e.h * 0.55;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) { const aa = k * 1.2566 - Math.PI / 2; ctx.lineTo(sx + Math.cos(aa) * 3.4, sy + Math.sin(aa) * 3.4); ctx.lineTo(sx + Math.cos(aa + 0.628) * 1.4, sy + Math.sin(aa + 0.628) * 1.4); }
        ctx.fill();
    }
    // Xích quấn quanh địch
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(213,222,232,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w * 0.68, e.h * 0.3, 0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w * 0.68, e.h * 0.3, -0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

function shDrawThrown(a) {
    ctx.save();
    ctx.translate(a.x, a.y); ctx.rotate(a.rot || 0);
    ctx.shadowBlur = 16; ctx.shadowColor = a.kind === 'truck' ? '#ffd700' : '#c4b5fd';
    if (a.kind === 'truck') {
        ctx.fillStyle = '#8e44ad'; ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText('$$$', 0, 4);
    } else if (a.kind === 'crate') {
        ctx.fillStyle = '#b07a3a'; ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        ctx.strokeStyle = '#5a3a14'; ctx.lineWidth = 2; ctx.strokeRect(-a.w / 2, -a.h / 2, a.w, a.h);
    } else {
        ctx.fillStyle = '#64748b'; ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.strokeRect(-a.w / 2, -a.h / 2, a.w, a.h);
    }
    ctx.restore();
}

Object.assign(CharHooks.registry.steel_hook, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const fwd = shFwd(this);
        const n = shNose(this);
        const scale = this.hasUpgrade('evo_hook_2') ? 1.5 : 1;
        const ph = this.shPhase;
        ctx.save();
        // --- Thân xe: tấm thép + tời quay ---
        ctx.strokeStyle = 'rgba(213,222,232,0.55)'; ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(this.x + 3, this.y + this.h * i / 4); ctx.lineTo(this.x + this.w - 3, this.y + this.h * i / 4); ctx.stroke(); }
        const spin = (ph === 'retract' || ph === 'drag' || ph === 'zip') ? Date.now() / 40 : (ph === 'fly' ? -Date.now() / 50 : 0);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.shadowBlur = 8; ctx.shadowColor = SH_GLOW;
        ctx.fillStyle = '#1f2833';
        ctx.beginPath(); ctx.arc(0, 0, this.w * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = SH_STEEL; ctx.lineWidth = 2; ctx.stroke();
        ctx.rotate(spin);
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-this.w * 0.26, 0); ctx.lineTo(this.w * 0.26, 0); ctx.stroke(); }
        ctx.fillStyle = SH_GLOW; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Bệ móc ở mũi xe
        ctx.fillStyle = '#3b4756';
        ctx.fillRect(cx - 6, fwd < 0 ? this.y - 5 : this.y + this.h, 12, 5);

        // --- Quạt ngắm & móc đang lắc ---
        if (ph === 'ready' || ph === 'cool') {
            const ang = shAngle(this);
            const charging = this.shCharge >= 0;
            const tier = charging ? Math.min(4, Math.floor(this.shCharge / SH_TIER_TICKS)) : 0;
            const base = Math.atan2(fwd, 0);
            ctx.save();
            ctx.strokeStyle = 'rgba(127,220,255,0.18)'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.arc(n.x, n.y, 30, base - SH_SWING_MAX, base + SH_SWING_MAX); ctx.stroke();
            ctx.restore();
            if (ph === 'ready') {
                const bounces = shBouncesForTier(this, tier);
                const angs = shIsFull(this) ? [ang, ang - SH_SIDE_ANGLE, ang + SH_SIDE_ANGLE] : [ang];
                angs.forEach((a, i) => {
                    const pts = shPredict(this, Math.max(-1.4, Math.min(1.4, a)), bounces, charging ? Math.min(900, 600 + 220 * bounces) : 230);
                    ctx.save();
                    ctx.setLineDash([6, 6]); ctx.lineDashOffset = -Date.now() / 30;
                    ctx.strokeStyle = charging ? `rgba(180,235,255,${i ? 0.35 : 0.7})` : 'rgba(180,235,255,0.35)';
                    ctx.lineWidth = charging ? 2 : 1.4;
                    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(q => ctx.lineTo(q.x, q.y)); ctx.stroke();
                    ctx.setLineDash([]);
                    pts.forEach(q => { if (q.bounce) { ctx.fillStyle = 'rgba(255,210,122,0.8)'; ctx.beginPath(); ctx.arc(q.x, q.y, 2.5, 0, Math.PI * 2); ctx.fill(); } });
                    ctx.restore();
                });
            }
            const d = shDir(this, ang);
            const restLen = 16 + (charging ? Math.min(4, this.shCharge / SH_TIER_TICKS) * 2 : 0);
            const hx = n.x + d.x * restLen, hy = n.y + d.y * restLen;
            shDrawChain([n, { x: hx, y: hy }], ph === 'cool' ? 0.5 : 1);
            shDrawHookHead(hx, hy, Math.atan2(d.y, d.x), scale, 0, charging && tier >= 4 ? '#ffffff' : SH_GLOW);
        }

        // --- Các móc đang ra ngoài ---
        (this.shHooks || []).forEach(h => {
            shDrawChain(shPath(h), 1, h.st !== 'fly');
            for (let i = 1; i < h.pts.length; i++) shDrawAnchor(h.pts[i].x, h.pts[i].y, h.flash > 0 && i === h.pts.length - 1);
            if (ph !== 'drag') shDrawHookHead(h.x, h.y, shHookAng(h), scale, h.flash);
            // Thanh máu đầu móc khi bị bắn
            if (h.hp < h.maxHp) {
                ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(h.x - 12, h.y - 16 * scale, 24, 3);
                ctx.fillStyle = h.hp / h.maxHp > 0.4 ? '#9fe0ff' : '#ff6b6b';
                ctx.fillRect(h.x - 12, h.y - 16 * scale, 24 * Math.max(0, h.hp / h.maxHp), 3);
            }
        });
        // Đu dây: xích phía trước xe
        if (ph === 'zip' && this.shZip) {
            const z = this.shZip;
            const rest = shSubPath(z.path, z.s, z.L);
            shDrawChain(rest, 1, true);
            const e = z.path[z.path.length - 1];
            shDrawHookHead(e.x, e.y, Math.atan2(e.y - rest[Math.max(0, rest.length - 2)].y, e.x - rest[Math.max(0, rest.length - 2)].x), scale);
            ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = SH_GLOW;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        // Địch đang bị móc / bị kéo
        const enemy = shEnemy(this);
        if (enemy && enemy.hp > 0 && (this.shHooks || []).some(h => h.st === 'enemy')) shDrawStun(enemy);
        if (enemy && enemy.hp > 0 && (ph === 'drag' || ph === 'dragBack')) shDrawStun(enemy);

        // --- Evo 2: móc phụ tự động ---
        const a = this.shAuto;
        if (a) {
            if (a.st === 'out') {
                shDrawChain([n, { x: a.x, y: a.y }], 0.85);
                shDrawHookHead(a.x, a.y, Math.atan2(a.y - n.y, a.x - n.x), 0.9, 0, '#c4b5fd');
            } else {
                ctx.save();
                ctx.strokeStyle = 'rgba(196,181,253,0.35)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(a.x - a.vx * 4, a.y - a.vy * 4); ctx.lineTo(a.x, a.y); ctx.stroke();
                ctx.restore();
                shDrawThrown(a);
            }
        }
        ctx.restore();
    },

    drawUI() {
        const cx = this.x + this.w / 2;
        const y = this.id === 1 ? this.y + this.h + 12 : this.y - 14;
        const ph = this.shPhase;
        ctx.save();
        ctx.font = 'bold 9px "Orbitron", Arial'; ctx.textAlign = 'center';
        if (ph === 'ready' && this.shCharge >= 0) {
            const tier = Math.min(4, Math.floor(this.shCharge / SH_TIER_TICKS));
            const part = tier >= 4 ? 1 : (this.shCharge % SH_TIER_TICKS) / SH_TIER_TICKS;
            for (let i = 0; i < 4; i++) {
                const px = cx - 15 + i * 10;
                ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(px - 4, y - 2, 8, 4);
                const f = i < tier ? 1 : (i === tier ? part : 0);
                ctx.fillStyle = tier >= 4 ? '#ffffff' : SH_GLOW;
                ctx.fillRect(px - 4, y - 2, 8 * f, 4);
            }
            // Số lần nảy: ghi bên cạnh xe (không bị mép sân che)
            const sideX = this.x + this.w / 2 > canvas.width - 60 ? this.x - 20 : this.x + this.w + 20;
            ctx.fillStyle = tier >= 4 ? '#ffffff' : '#bfe6ff';
            ctx.font = 'bold 11px "Orbitron", Arial';
            ctx.shadowBlur = 8; ctx.shadowColor = SH_GLOW;
            drawWorldText(ctx, `×${shBouncesForTier(this, tier)}`, sideX, this.y + this.h / 2 + 4);
            ctx.shadowBlur = 0;
        } else if (ph === 'cool') {
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.x - 4, y - 2, this.w + 8, 3);
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(this.x - 4, y - 2, (this.w + 8) * (this.shT / SH_COOLDOWN), 3);
        } else if (ph === 'hold') {
            const blink = Math.floor(Date.now() / 200) % 2 === 0;
            const hasTruck = (this.shHooks || []).some(h => h.st === 'truck');
            const hasEnemy = (this.shHooks || []).some(h => h.st === 'enemy');
            ctx.fillStyle = blink ? '#ffffff' : (hasTruck ? '#ffd700' : SH_GLOW);
            drawWorldText(ctx, hasEnemy ? 'NHẤP: LÔI XÍCH | GIỮ: CẮT' : (hasTruck ? 'SPAM BẮN: KÉO XE! 💰' : 'NHẤP: ĐU DÂY | GIỮ: CẮT'), cx, y + (this.id === 1 ? 6 : -2));
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.x - 4, y + (this.id === 1 ? 10 : -10), this.w + 8, 2);
            ctx.fillStyle = SH_GLOW; ctx.fillRect(this.x - 4, y + (this.id === 1 ? 10 : -10), (this.w + 8) * Math.max(0, 1 - this.shT / SH_HOLD_TIMEOUT), 2);
            // Giữ Bắn để cắt xích: vòng tiến trình quanh xe
            if ((this.shHoldS || 0) > 4) {
                const k = Math.min(1, this.shHoldS / SH_BREAK_TICKS);
                const cy = this.y + this.h / 2, R = this.w * 0.78;
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
                ctx.shadowBlur = 12; ctx.shadowColor = '#ff5d73';
                ctx.strokeStyle = k >= 1 ? '#ffffff' : '#ff7a8a'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffd0d6'; ctx.font = 'bold 9px "Orbitron", Arial';
                drawWorldText(ctx, 'CẮT XÍCH ✂', cx, this.id === 1 ? this.y - R + 4 : this.y + this.h + R + 2);
            }
        }
        // Evo 2: hồi móc phụ
        if (this.hasUpgrade('evo_hook_2') && !this.shAuto) {
            const k = Math.min(1, (this.shAutoT || 0) / SH_AUTO_PERIOD);
            ctx.strokeStyle = 'rgba(196,181,253,0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x + this.w + 6, this.y + this.h / 2, 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        }
        ctx.restore();
    },
});
