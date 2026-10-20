// ==========================================
// Juggernaut (juggernaut) — Hình ảnh: xe bọc thép hạng nặng (giáp lớp, đinh tán, xích quấn, lõi
// nung chảy), đạn Phá Xiềng / Bá Khí, Sóng Phản Chấn, Giáp Phản Chấn, kết liễu PHÁ XIỀNG.
// Chỉ đọc state -> an toàn online.
// ==========================================

function jgNow() { return Date.now() / 1000; }
function jgEase(k) { return 1 - Math.pow(1 - k, 3); }

// Mắt xích (tâm x,y, góc a, cỡ s)
function jgLink(x, y, a, s, color, lw) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(a);
    ctx.strokeStyle = color; ctx.lineWidth = lw || s * 0.35;
    ctx.beginPath();
    if (ctx.ellipse) ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2); else ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

// ---------- Xe ----------
registerTankArt('juggernaut', (p, k) => {
    const t = k.t;
    const core = k.full ? JG_GOLD : (k.evo2 ? JG_RED : JG_ORANGE);
    const rec = (p.jgRecoil || 0) / 10;
    // bánh xích dày
    TA.treads(-16.5, 6, -14, 15, t, '#0f141c', '#3f4856');
    // giáp chân xích
    ctx.fillStyle = '#273140';
    TA.rr(-17, -15, 7.5, 3, 1); ctx.fill(); TA.rr(9.5, -15, 7.5, 3, 1); ctx.fill();
    // thân chính (bát giác dày)
    ctx.fillStyle = TA.metal(-11, 11, '#1e2633', '#5b6778');
    ctx.beginPath();
    ctx.moveTo(-8, -13); ctx.lineTo(8, -13); ctx.lineTo(11.5, -9); ctx.lineTo(11.5, 10); ctx.lineTo(8, 14);
    ctx.lineTo(-8, 14); ctx.lineTo(-11.5, 10); ctx.lineTo(-11.5, -9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // lớp giáp chồng (tấm trước)
    ctx.fillStyle = TA.vgrad(-12, -2, '#64748b', '#334155');
    ctx.beginPath(); ctx.moveTo(-9, -11); ctx.lineTo(9, -11); ctx.lineTo(10, -4); ctx.lineTo(-10, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#0b1018'; ctx.lineWidth = 0.6; ctx.stroke();
    // đinh tán
    ctx.fillStyle = '#cbd5e1';
    for (const [rx, ry] of [[-9.5, -7.5], [9.5, -7.5], [-9.8, 3], [9.8, 3], [-6.5, 12], [6.5, 12]]) { ctx.beginPath(); ctx.arc(rx, ry, 0.75, 0, Math.PI * 2); ctx.fill(); }
    // xích quấn chéo thân
    const chainC = k.evo1 ? '#d4a373' : '#9ca3af';
    // tháp pháo
    ctx.fillStyle = TA.metal(-7, 7, '#283241', '#6b7a8f');
    TA.rr(-7, -6, 14, 13, 3); ctx.fill();
    ctx.strokeStyle = '#0b1018'; ctx.lineWidth = 0.6; ctx.stroke();
    // xích quấn chéo tháp pháo (đứt ở giữa)
    for (let i = 0; i < 7; i++) { if (i === 3) continue; jgLink(-9.5 + i * 3.2, 8 - i * 2.1, -0.58 + (i % 2 ? Math.PI / 2 : 0), 1.5, chainC, 0.7); }
    // nòng to + hãm thanh
    const by = -6 + rec * 3;
    TA.barrel(0, by, 10, 5.4, '#a3b1c2');
    ctx.fillStyle = '#334155'; TA.rr(-4.2, by - 14, 8.4, 4.5, 1); ctx.fill();
    ctx.fillStyle = core; TA.glow(core, 6); ctx.fillRect(-3.2, by - 13.4, 6.4, 0.9); TA.noGlow();
    // lõi nung chảy (khe mắt)
    const pulse = 0.65 + 0.35 * Math.sin(t * 5);
    ctx.fillStyle = core; ctx.globalAlpha *= pulse; TA.glow(core, 10);
    TA.rr(-4.5, 0, 9, 2.4, 1); ctx.fill(); TA.noGlow();
    ctx.globalAlpha /= pulse;
    // tấm giáp sau + ống xả
    ctx.fillStyle = '#1b2230'; TA.rr(-8, 9, 16, 4, 1.2); ctx.fill();
    ctx.fillStyle = core; ctx.globalAlpha *= 0.6;
    ctx.fillRect(-6, 13, 2.5, 1.4); ctx.fillRect(3.5, 13, 2.5, 1.4);
    ctx.globalAlpha /= 0.6;
    // tầng Bá Khí: 3 vạch sáng trên tháp
    const st = p.jgStacks || 0;
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < st ? JG_GOLD : 'rgba(255,255,255,0.12)';
        if (i < st) TA.glow(JG_AMBER, 5);
        ctx.fillRect(-4.5 + i * 3.4, 4.2, 2.4, 1.3); TA.noGlow();
    }
    // Full Evo: sừng giáp vàng
    if (k.full) {
        ctx.fillStyle = JG_GOLD; TA.glow(JG_AMBER, 6);
        ctx.beginPath(); ctx.moveTo(-11.5, -9); ctx.lineTo(-14, -15); ctx.lineTo(-9, -12); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(11.5, -9); ctx.lineTo(14, -15); ctx.lineTo(9, -12); ctx.closePath(); ctx.fill();
        TA.noGlow();
    }
});

// ---------- Đạn ----------
function jgDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, emp = b.jgEmp;
    const col = emp ? (b.jgKind ? JG_KIND[b.jgKind].c : JG_GOLD) : JG_ORANGE;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = emp ? 7 : 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - (b.vy || 0) * (emp ? 4 : 2.5)); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    jgShell(x, y, b.w, b.h, b.vy < 0 ? 1 : -1, col, emp);
    ctx.restore();
}
// Vỏ đạn pháo hạng nặng (dir 1 = mũi hướng lên)
function jgShell(x, y, w, h, dir, col, emp) {
    ctx.save();
    ctx.translate(x, y); if (dir < 0) ctx.rotate(Math.PI);
    ctx.shadowBlur = emp ? 16 : 8; ctx.shadowColor = col;
    ctx.fillStyle = emp ? '#fff7d6' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, -h / 2); ctx.quadraticCurveTo(w / 2, -h * 0.2, w / 2, h * 0.1);
    ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.lineTo(-w / 2, h * 0.1);
    ctx.quadraticCurveTo(-w / 2, -h * 0.2, 0, -h / 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = col; ctx.fillRect(-w / 2, h * 0.12, w, h * 0.14);
    ctx.fillStyle = '#334155'; ctx.fillRect(-w / 2, h * 0.36, w, h * 0.14);
    ctx.restore();
}
function jgDrawSlug(s) {
    const x = s.x + s.w / 2, y = s.y + s.h / 2, t = jgNow();
    const col = s.kind ? JG_KIND[s.kind].c : JG_GOLD;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x, y, x, y - s.vy * 6);
    g.addColorStop(0, 'rgba(253, 224, 71, 0.75)'); g.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = g; ctx.fillRect(x - 6, Math.min(y, y - s.vy * 6), 12, Math.abs(s.vy * 6));
    ctx.globalCompositeOperation = 'source-over';
    // xích xoáy quanh đạn
    for (let i = 0; i < 4; i++) {
        const a = t * 14 + i * Math.PI / 2;
        jgLink(x + Math.cos(a) * 10, y + Math.sin(a) * 6, a, 2.4, JG_AMBER, 1);
    }
    jgShell(x, y, s.w, s.h, s.vy < 0 ? 1 : -1, col, true);
    ctx.restore();
}
function jgDrawWave(w) {
    const k = Math.min(1, w.t / 10), up = w.vy < 0 ? 1 : -1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
        const yy = w.y + up * i * 7;
        ctx.strokeStyle = `rgba(251, 146, 60, ${(0.85 - i * 0.25) * (w.hit ? 0.4 : 1)})`;
        ctx.lineWidth = 4 - i;
        ctx.beginPath();
        ctx.ellipse(w.x, yy + up * 10, w.hw * k * (1 - i * 0.12), 12, 0, up > 0 ? Math.PI * 1.1 : Math.PI * 0.1, up > 0 ? Math.PI * 1.9 : Math.PI * 0.9);
        ctx.stroke();
    }
    ctx.restore();
}
function jgDrawImpact(f) {
    const k = f.t / f.dur, R = (f.big ? 34 : 16) * jgEase(k);
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.big ? JG_GOLD : JG_ORANGE; ctx.lineWidth = f.big ? 2.2 : 1.4;
    ctx.shadowBlur = 8; ctx.shadowColor = JG_ORANGE;
    ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.stroke();
    if (f.big) {
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
            const a = f.seed + i * 1.05;
            ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * 6, f.y + Math.sin(a) * 6);
            ctx.lineTo(f.x + Math.cos(a + 0.2) * R * 0.7, f.y + Math.sin(a + 0.2) * R * 0.7);
            ctx.lineTo(f.x + Math.cos(a - 0.1) * R * 1.2, f.y + Math.sin(a - 0.1) * R * 1.2); ctx.stroke();
        }
    }
    ctx.restore();
}

// ---------- Kết liễu PHÁ XIỀNG ----------
function jgDrawFinisher(f) {
    // vết nứt mặt đất toả ra
    const t = f.t, k = jgEase(Math.min(1, t / 26)), fade = t > 80 ? Math.max(0, 1 - (t - 80) / 40) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = JG_ORANGE; ctx.shadowBlur = 10; ctx.shadowColor = JG_RED; ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        const a = f.seed + i * (Math.PI * 2 / 10), L = (70 + (i % 3) * 30) * k;
        ctx.beginPath(); ctx.moveTo(f.x, f.y);
        let px = f.x, py = f.y;
        for (let j = 1; j <= 4; j++) {
            const jj = j / 4, wob = Math.sin(f.seed * 3 + i * 7 + j * 5) * 0.35;
            px = f.x + Math.cos(a + wob) * L * jj; py = f.y + Math.sin(a + wob) * L * jj * 0.7;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    ctx.restore();
}
function jgDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 6 ? t / 6 : (t < 70 ? 1 : Math.max(0, 1 - (t - 70) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(20, 8, 2, ${0.5 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // sóng chấn động
    for (let i = 0; i < 3; i++) {
        const tt = t - i * 8;
        if (tt <= 0 || tt > 50) continue;
        const k = jgEase(tt / 50);
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.8 * (1 - k)})`; ctx.lineWidth = 6 * (1 - k) + 1;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, 20 + 170 * k, 12 + 100 * k, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // xích gãy văng tứ phía
    if (t < 100) {
        const k = jgEase(Math.min(1, t / 45)), fade = t > 65 ? 1 - (t - 65) / 35 : 1;
        for (let i = 0; i < 16; i++) {
            const a = f.seed + i * (Math.PI * 2 / 16), d = 10 + (90 + (i % 4) * 25) * k;
            jgLink(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.75 + k * k * 20, a + t * 0.25 * (i % 2 ? 1 : -1), 4, `rgba(212, 163, 115, ${fade})`, 1.8);
        }
    }
    // chớp sáng lõi
    if (t < 30) {
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 90);
        g.addColorStop(0, `rgba(255, 237, 160, ${0.8 * (1 - t / 30)})`); g.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 90, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    if (t >= 14 && t < 118) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 14) / 6) * (t > 98 ? 1 - (t - 98) / 20 : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = JG_RED; ctx.fillStyle = JG_GOLD;
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 84 : -76)));
        const sc = 1 + Math.max(0, 1 - (t - 14) / 7) * 0.6;
        const shake = t < 30 ? (Math.random() - 0.5) * 3 : 0;
        ctx.translate(W / 2 + shake, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '⛓ PHÁ XIỀNG ⛓', 0, 0); else ctx.fillText('⛓ PHÁ XIỀNG ⛓', 0, 0);
        ctx.restore();
    }
}
function jgFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof JgFinisher && e.active) e.drawOver();
}

// ---------- Quanh xe + HUD ----------
Object.assign(CharHooks.registry.juggernaut, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = jgNow();
        ctx.save();
        // giữ nút: vòng nạp Giáp
        const h = this.jgHold || 0;
        if (h > 6 && !this.jgHoldUsed) {
            ctx.strokeStyle = this.jgShieldCd > 0 ? '#64748b' : JG_ORANGE; ctx.shadowColor = JG_ORANGE; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.82, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / JG_HOLD)); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Giáp Phản Chấn: lục giác xoay
        if (this.jgShieldT > 0) {
            const a = Math.min(1, this.jgShieldT / 15);
            ctx.globalAlpha = a;
            ctx.strokeStyle = jgE2(this) ? JG_RED : JG_ORANGE; ctx.lineWidth = 2.2; ctx.shadowBlur = 12; ctx.shadowColor = ctx.strokeStyle;
            ctx.fillStyle = 'rgba(251, 146, 60, 0.12)';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const an = t * 1.5 + i * Math.PI / 3, r = this.w * 0.88; ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        }
        // Miễn nhiễm: xích vỡ quanh xe
        if (this.jgImmFx > 0) {
            const k = 1 - this.jgImmFx / 24;
            for (let i = 0; i < 8; i++) {
                const an = i * Math.PI / 4 + k;
                jgLink(cx + Math.cos(an) * this.w * (0.55 + k * 0.7), cy + Math.sin(an) * this.h * (0.55 + k * 0.7), an, 3, `rgba(212, 163, 115, ${1 - k})`, 1.3);
            }
        }
        if (this.jgAbsFx > 0) {
            const k = 1 - this.jgAbsFx / 30;
            ctx.strokeStyle = `rgba(253, 224, 71, ${1 - k})`; ctx.lineWidth = 3 * (1 - k) + 0.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + k * 0.9), 0, Math.PI * 2); ctx.stroke();
        }
        // tốc độ +20%: vệt bụi
        if (this.jgSpdT > 0) {
            ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
            const by = this.id === 1 ? this.y + this.h + 2 : this.y - 4;
            for (let i = 0; i < 3; i++) ctx.fillRect(this.x + 3 + i * (this.w - 8) / 2 + Math.sin(t * 20 + i) * 1.5, by, 2, 2);
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudFrame !== 'function') return;
        const F = hudFrame(this);
        const d0 = 12; // = hudRowY(p, 'extra')
        const st = this.jgStacks || 0, store = this.jgStore || [];
        ctx.save();
        // 3 ô Bá Khí (màu theo khống chế lưu giữ)
        for (let i = 0; i < 3; i++) {
            const lx = -16 + i * 11;
            ctx.fillStyle = 'rgba(4, 8, 18, 0.9)'; hudRRect(F, lx, d0 - 1, 10, 6, 1.5); ctx.fill();
            const on = i < st;
            const col = on ? (store[i] ? JG_KIND[store[i]].c : JG_GOLD) : 'rgba(255,255,255,0.12)';
            ctx.fillStyle = col;
            if (on) { ctx.shadowBlur = 6; ctx.shadowColor = col; }
            hudFill(F, lx + 1.5, d0 + 0.5, 7, 3);
            ctx.shadowBlur = 0;
        }
        // hồi Giáp (phải) & hồi nội tại (trái)
        const rs = hudRect(F, 22, d0 + 2, 0, 0);
        ctx.strokeStyle = this.jgShieldCd > 0 ? 'rgba(255,255,255,0.25)' : JG_ORANGE; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(rs[0], rs[1], 2.4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (this.jgShieldCd || 0) / JG_SHIELD_CD)); ctx.stroke();
        const ls = hudRect(F, -21, d0 + 2, 0, 0);
        ctx.fillStyle = this.jgIcd > 0 ? 'rgba(255,255,255,0.2)' : JG_GOLD;
        ctx.beginPath(); ctx.arc(ls[0], ls[1], 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
});

function jgRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('juggernaut', p => {
        const h = p.jgHold || 0;
        if (p.jgShieldT > 0) return { pct: p.jgShieldT / JG_SHIELD_T, ready: true, color: JG_ORANGE, label: 'GIÁP PHẢN CHẤN', btnIcon: '⬢' };
        if (h > 6 && !p.jgHoldUsed) return { pct: Math.min(1, h / JG_HOLD), ready: false, color: JG_ORANGE, label: p.jgShieldCd > 0 ? 'GIÁP ' + Math.ceil(p.jgShieldCd / 60) + 's' : 'GIÁP', btnIcon: '⬢', dim: p.jgShieldCd > 0 };
        const st = p.jgStacks || 0, k = (p.jgStore || [])[0];
        if (st > 0) return { pct: st / 3, ready: true, color: k ? JG_KIND[k].c : JG_GOLD, label: 'BÁ KHÍ' + (k ? ' · ' + JG_KIND[k].n : '') + ' x' + st, btnIcon: '⛓', segments: 3, lit: st };
        return { idle: true, pct: 0, ready: false, color: JG_ORANGE, label: 'PHÁ XIỀNG', btnIcon: '⛓', segments: 3, lit: 0 };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', jgRegisterHUD);
