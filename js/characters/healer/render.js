// ==========================================
// Y Sư (healer) — Hình ảnh: xe y tế nano, ống Năng Lượng Sinh Mệnh, Giáp Trắng, đạn sinh học,
// ấn Kháng Hồi Phục. HUD: thanh Sinh Mệnh (hàng tài nguyên), giáp trắng phủ thanh HP, chữ thập Tái Tạo,
// vòng nạp + chấm Hấp Huyết trên nút Bắn. Chỉ đọc state -> guest online thấy giống host.
// ==========================================

function hlCross(x, y, r, w) {
    ctx.beginPath();
    ctx.rect(x - w / 2, y - r, w, r * 2);
    ctx.rect(x - r, y - w / 2, r * 2, w);
}

registerTankArt('healer', (p, k) => {
    const t = k.t;
    const lifeK = p.hlReady ? 1 : Math.max(0, Math.min(1, (p.hlLife || 0) / hlLifeReq(p)));
    const liq = p.hlReady ? HL_GOLD : HL_GREEN;
    TA.treads(-15, 4, -11, 13, t, '#1f2937', '#64748b');
    // Nòng kim tiêm: ống thủy tinh chứa dịch sinh mệnh
    ctx.fillStyle = '#cbd5e1'; TA.rr(-1, -16, 2, 4, 0.6); ctx.fill();               // kim
    ctx.fillStyle = 'rgba(226,232,240,0.35)'; TA.rr(-3, -13, 6, 9, 1.5); ctx.fill(); // ống
    ctx.fillStyle = liq; TA.glow(liq, p.hlReady ? 8 : 3);
    const lh = 8 * lifeK; TA.rr(-2.2, -4.6 - lh, 4.4, lh, 1); ctx.fill(); TA.noGlow();
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.8; TA.rr(-3, -13, 6, 9, 1.5); ctx.stroke();
    // Evo2: hai bộ phát xung hai vai
    if (k.evo2) {
        [-1, 1].forEach(sd => {
            ctx.fillStyle = '#334155'; TA.rr(sd * 8.5 - 2, -9, 4, 6, 1.4); ctx.fill();
            ctx.fillStyle = HL_LIME; TA.glow(HL_LIME, 5);
            ctx.beginPath(); ctx.arc(sd * 8.5, -9.3, 1.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
        });
    }
    // Thân: khoang y tế bo tròn màu sứ trắng
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-12.5, 12.5, '#94a3b8', '#f1f5f9');
    TA.rr(-12.5, -6, 25, 19, 6.5); ctx.fill(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    // Sọc màu đội hai bên
    ctx.fillStyle = k.team;
    TA.rr(-11, 1, 2.4, 9, 1); ctx.fill(); TA.rr(8.6, 1, 2.4, 9, 1); ctx.fill();
    // Tháp: vòm tròn với chữ thập phát sáng (nhịp tim)
    const beat = 0.75 + 0.25 * Math.pow(Math.max(0, Math.sin(t * 4)), 6);
    const dg = ctx.createRadialGradient(-1.5, 1, 0.5, 0, 2.5, 7.5);
    dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 3, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.save(); ctx.translate(0, 3); ctx.scale(beat, beat);
    ctx.fillStyle = (p.hlRegenFx > 0) ? HL_LIME : HL_GREEN; TA.glow(HL_GREEN, 7);
    hlCross(0, 0, 4.4, 2.6); ctx.fill(); TA.noGlow();
    ctx.restore();
    // Evo1: vòng giáp trắng (sáng khi có Giáp Trắng)
    if (k.evo1) {
        ctx.strokeStyle = (p.hlOver > 0) ? '#ffffff' : 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(0, 3, 9.2, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 3, 9.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    // Full Evo: ấn tím Kháng Hồi Phục trên đuôi xe
    if (k.full) {
        ctx.fillStyle = HL_ANTI; TA.glow(HL_ANTI, 6);
        ctx.beginPath(); ctx.arc(0, 12, 1.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    }
});

BulletHooks.registry.healer.draw = function (b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = Date.now();
    ctx.save();
    if (b.hlKind === 'emp') {
        const R = b.w / 2;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, HL_GOLD); g.addColorStop(0.7, 'rgba(74,222,128,0.6)'); g.addColorStop(1, 'rgba(74,222,128,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 2, 0, Math.PI * 2); ctx.fill();
        ctx.translate(cx, cy); ctx.rotate(t / 180);
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 12; ctx.shadowColor = HL_GOLD;
        hlCross(0, 0, R * 0.8, R * 0.38); ctx.fill();
        ctx.strokeStyle = HL_GREEN; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R + 3, 0, Math.PI * 1.2); ctx.stroke();
    } else if (b.hlKind === 'pulse') {
        const ang = Math.atan2(b.vy, b.vx);
        ctx.translate(cx, cy); ctx.rotate(ang);
        const tg = ctx.createLinearGradient(-22, 0, 0, 0);
        tg.addColorStop(0, 'rgba(190,242,100,0)'); tg.addColorStop(1, HL_LIME);
        ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(0, -3); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = HL_LIME;
        ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(0, -4); ctx.lineTo(-3, 0); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
    } else {
        const ang = Math.atan2(b.vy, b.vx);
        ctx.translate(cx, cy); ctx.rotate(ang);
        const tg = ctx.createLinearGradient(-18, 0, 0, 0);
        tg.addColorStop(0, 'rgba(74,222,128,0)'); tg.addColorStop(1, HL_GREEN);
        ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(0, -3.2); ctx.lineTo(0, 3.2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = HL_GREEN; ctx.shadowBlur = 10; ctx.shadowColor = HL_GREEN;
        ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; hlCross(0.5, 0, 2, 0.9); ctx.fill();
    }
    ctx.restore();
};

Object.assign(CharHooks.registry.healer, {
    draw() {
        const p = this, cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = Date.now();
        ctx.save();
        // Giáp Trắng: bong bóng lục giác trắng
        if (p.hlOver > 0) {
            const k = Math.min(1, p.hlOver / hlOverMax(p));
            ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.5 * k})`; ctx.lineWidth = 1.5 + 1.5 * k;
            ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
            const R = p.w * 0.78;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t / 1500; ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); }
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.08 * k})`; ctx.fill();
            ctx.shadowBlur = 0;
        }
        // Hồi Phục: chữ thập xanh bay lên
        if (p.hlRegenFx > 0 || p.hlHealFx > 0) {
            const f = Math.max(p.hlRegenFx / 50, p.hlHealFx / 24);
            ctx.fillStyle = HL_GREEN; ctx.globalAlpha = f; ctx.shadowBlur = 8; ctx.shadowColor = HL_GREEN;
            for (let i = 0; i < 4; i++) {
                const ph = (1 - f) + i * 0.25;
                const x = cx + Math.sin(i * 2.3) * p.w * 0.45;
                const y = cy - (p.id === 1 ? 1 : -1) * ph * 26;
                hlCross(x, y, 3, 1.4); ctx.fill();
            }
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        }
        // Ấn Kháng Hồi Phục trên địch + tia cướp máu
        const e = hlEnemy(p);
        if (e && p.hlMarkT > 0 && e.hp > 0) {
            const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
            const k = p.hlMarkT / HL_MARK;
            ctx.strokeStyle = HL_ANTI; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = HL_ANTI;
            ctx.beginPath(); ctx.arc(ex, ey, e.w * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            // chữ thập gạch chéo
            ctx.save(); ctx.translate(ex + e.w * 0.62, ey - e.h * 0.62); ctx.rotate(Math.PI / 4);
            ctx.fillStyle = HL_ANTI; hlCross(0, 0, 4, 1.8); ctx.fill(); ctx.restore();
            ctx.shadowBlur = 0;
            if (p.hlStealFx > 0) {
                ctx.globalAlpha = p.hlStealFx / 30; ctx.strokeStyle = HL_ANTI; ctx.lineWidth = 2;
                ctx.setLineDash([5, 4]); ctx.lineDashOffset = t / 20;
                ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();
    },

    drawUI() {
        const p = this;
        if (typeof hudRowY !== 'function') return;
        ctx.save();
        // Giáp Trắng: dải trắng phủ mép trên thanh HP
        if (p.hlOver > 0) {
            const BW = Math.max(40, Math.min(54, p.w + 14));
            const y = hudRowY(p, 'hp');
            const k = Math.min(1, p.hlOver / hlOverMax(p));
            const yy = p.id === 1 ? y : y - 2.5;
            ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
            ctx.fillRect(p.x + p.w / 2 - BW / 2, yy, BW * k, 2.5);
            ctx.shadowBlur = 0;
        }
        // Tái Tạo: chữ thập nhỏ bên trái xe, đầy dần theo thời gian không mất máu
        const every = healFull(p) ? HL_REGEN_FULL : HL_REGEN;
        const k = Math.min(1, (p.hlCalm || 0) / every);
        const ix = p.x - 9, iy = p.y + p.h / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; hlCross(ix, iy, 5, 2.6); ctx.fill();
        ctx.save();
        ctx.beginPath(); ctx.rect(ix - 6, iy + 5 - 10 * k, 12, 10 * k); ctx.clip();
        ctx.fillStyle = HL_GREEN; ctx.shadowBlur = k >= 0.98 ? 8 : 3; ctx.shadowColor = HL_GREEN;
        hlCross(ix, iy, 5, 2.6); ctx.fill();
        ctx.restore();
        ctx.restore();
    },
});

// HUD chung (tank-hud.js / empower-hud.js) nạp sau file body -> đăng ký khi trang tải xong
function hlRegisterHUD() {
    if (typeof HUD_RESOURCE !== 'undefined') {
        HUD_RESOURCE.healer = p => ({ c: p.hlReady ? HL_GOLD : HL_GREEN, k: p.hlReady ? 1 : (p.hlLife || 0) / hlLifeReq(p) });
    }
    if (typeof registerEmpowerHUD === 'function') {
        registerEmpowerHUD('healer', p => {
            const ls = { pips: p.hlLsCd > 0 ? 0 : 1, pipMax: 1, pipColor: '#f43f5e' };
            if (p.hlReady) return Object.assign({ pct: 1, ready: true, color: HL_GOLD, label: 'CƯỜNG HÓA', btnIcon: '✚' }, ls);
            const pct = Math.min(1, (p.hlLife || 0) / hlLifeReq(p));
            return Object.assign({ pct, ready: false, color: HL_GREEN, label: '', btnIcon: '✚', idle: pct <= 0 }, ls);
        });
    }
    if (typeof HUD_STATUS !== 'undefined') {
        // Chip Kháng Hồi Phục trên xe địch / Hấp Huyết đang hồi trên Y Sư
        HUD_STATUS.push(p => {
            const r = p === p1 ? p2 : p1;
            if (!r || r.weapon !== 'healer' || !(r.hlMarkT > 0)) return null;
            return { g: 'silence', c: HL_ANTI, l: 'KHÁNG HỒI', t: (r.hlMarkT / 60).toFixed(1) };
        });
        HUD_STATUS.push(p => {
            if (p.weapon !== 'healer' || !(p.hlLsCd > 0)) return null;
            return { g: 'drop', c: '#f43f5e', l: '', t: Math.ceil(p.hlLsCd / 60) + 's' };
        });
    }
}
if (typeof window !== 'undefined') window.addEventListener('load', hlRegisterHUD);
