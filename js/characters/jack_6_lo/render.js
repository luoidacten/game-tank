// ==========================================
// Jack - 6 Lỗ — Hình ảnh: xe sòng bạc (nỉ xanh viền vàng, mũ cao bồi, chất bài), ổ quay 6 lỗ xoay,
// đồng xu định mệnh tung trên xe, hào quang Luck / xích Nợ, HUD, ổ đạn Cò Quay Nga, kết liễu JACKPOT 777!
// Chỉ đọc state -> an toàn online.
// ==========================================

function jlNow() { return Date.now() / 1000; }

// Ổ quay 6 lỗ (toạ độ cục bộ), pulled = số lỗ đã bóp
function jlCylinder(x, y, r, rot, pulled, boy, hl) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = TA.metal(-r, r, '#334155', boy ? '#e9d5ff' : '#cbd5e1');
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx.arc(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25, r * 0.78, a - 0.6, a + 0.6); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = boy ? JL_PURP : JL_GOLD; ctx.lineWidth = r * 0.12; ctx.stroke();
    for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 - Math.PI / 2;
        const used = i < pulled, cur = boy && i === pulled;
        ctx.fillStyle = used ? '#0f172a' : (cur ? (hl ? '#fde68a' : '#f59e0b') : '#78350f');
        if (cur) TA.glow(JL_GOLD, 6);
        ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.2, 0, Math.PI * 2); ctx.fill();
        TA.noGlow();
    }
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Xe Jack ----------
registerTankArt('jack_6_lo', (p, k) => {
    const t = k.t, rec = (p.jlRecoil || 0) / 14, boy = p.jlMode === 'boy';
    TA.treads(-15, 4.4, -11, 13, t, '#1c1917', '#78350f');
    // thân nỉ xanh sòng bạc, viền vàng
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#064e3b', '#059669');
    TA.rr(-10.5, -9.5, 21, 22, 5); ctx.fill();
    ctx.strokeStyle = JL_GOLD; ctx.lineWidth = 1.2; TA.glow(JL_GOLD, p.jlLuck > 0 ? 10 : 3); ctx.stroke(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.8; TA.rr(-9, -8, 18, 19, 4); ctx.stroke();
    // chất bài 2 bên
    ctx.font = "bold 5px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fecaca'; ctx.fillText('♦', -7, 7.5); ctx.fillText('♥', 7, 7.5);
    ctx.fillStyle = '#e2e8f0'; ctx.fillText('♠', -7, -5.5); ctx.fillText('♣', 7, -5.5);
    // nòng súng lục (The BOY: nòng tím dài)
    const ny = -6 + rec * 3, nl = boy ? 13 : 10;
    TA.glow(boy ? JL_PURP : JL_GOLD, boy ? 10 : 4);
    TA.barrel(0, ny, nl, boy ? 3.4 : 2.8, boy ? '#e9d5ff' : '#e2e8f0', boy ? JL_PURP : JL_GOLD);
    TA.noGlow();
    // ổ quay 6 lỗ (xoay theo số phát)
    const rot = (p.jlCylRot || 0) * Math.PI / 3 + (p.jlDrawFx > 0 ? p.jlDrawFx * 0.5 : 0);
    jlCylinder(0, -0.5, 6.4, rot, boy ? p.jlPulled : 0, boy, (p.jlPullFx || 0) > 0);
    // mũ cao bồi phía sau
    ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.ellipse(0, 9.5, 8.5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#92400e'; TA.rr(-4.5, 7.2, 9, 4.2, 2); ctx.fill();
    ctx.fillStyle = k.evo2 ? JL_PURP : JL_RED; ctx.fillRect(-4.5, 9.6, 9, 1);
    if (k.evo1) { ctx.fillStyle = JL_GOLD; ctx.beginPath(); ctx.arc(0, 8.6, 1, 0, Math.PI * 2); ctx.fill(); }
    if (k.full) { // xúc xắc vàng 2 bên
        TA.glow(JL_GOLD, 6); ctx.fillStyle = '#fef3c7';
        TA.rr(-14.5, -15, 5, 5, 1); ctx.fill(); TA.rr(9.5, -15, 5, 5, 1); ctx.fill(); TA.noGlow();
        ctx.fillStyle = '#b91c1c';
        [[-12, -12.5], [12, -12.5], [-13.2, -13.7], [10.8, -11.3]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 0.6, 0, Math.PI * 2); ctx.fill(); });
    }
});

// ---------- Đạn ----------
// Đạn The Hand: mỗi loại 1 màu / hình riêng (đọc b.jlT)
function jlDrawHanderBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, an = Math.atan2(b.vy || 0, b.vx || 0), t = jlNow();
    const A = (typeof JL_AMMO !== 'undefined' && JL_AMMO[b.jlT]) || { k: 'gold', c: JL_GOLD };
    const c = A.c, k = A.k;
    ctx.save(); ctx.translate(x, y);
    if (k === 'smoke' || k === 'curse') { // khối khói cuộn
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 4; i++) {
            const a = t * 5 + i * 1.6, r = 4 + (i % 2) * 1.5;
            ctx.fillStyle = k === 'curse' ? (i % 2 ? 'rgba(75,85,99,0.75)' : 'rgba(126,34,206,0.45)') : (i % 2 ? 'rgba(148,163,184,0.7)' : 'rgba(226,232,240,0.55)');
            ctx.beginPath(); ctx.arc(Math.cos(a) * 3, Math.sin(a) * 3 - (b.vy > 0 ? -i : i) * 2.2, r, 0, Math.PI * 2); ctx.fill();
        }
        if (k === 'curse') { ctx.globalAlpha = 1; ctx.font = '7px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💀', 0, 0); }
        ctx.restore(); return;
    }
    if (k === 'toy') { // bóng nhựa lắc lư
        const wob = Math.sin(t * 18) * 2;
        ctx.translate(wob, 0);
        ctx.fillStyle = '#f472b6'; ctx.shadowBlur = 6; ctx.shadowColor = '#f472b6';
        ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-1.2, -1.2, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); return;
    }
    ctx.rotate(an);
    const L = k === 'pierce' ? 26 : (k === 'gold' ? 22 : 16);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(-L, 0, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c);
    ctx.strokeStyle = g; ctx.globalAlpha = 0.8; ctx.lineWidth = k === 'gold' || k === 'blast' ? 3.4 : 2.2;
    ctx.beginPath(); ctx.moveTo(-L, 0);
    if (k === 'shock') { for (let i = 1; i <= 4; i++) ctx.lineTo(-L + i * L / 4, (i % 2 ? 2.5 : -2.5) * Math.sin(t * 30 + i)); }
    else ctx.lineTo(0, 0);
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = b.jlCrit ? 14 : 9; ctx.shadowColor = c; ctx.fillStyle = c;
    const S = k === 'gold' || k === 'blast' ? 1.35 : 1, Lb = 4.6 * S, W = 2.2 * S;
    if (k === 'ice') { // tinh thể băng
        ctx.beginPath(); ctx.moveTo(Lb + 1, 0); ctx.lineTo(0, -W - 0.6); ctx.lineTo(-Lb, 0); ctx.lineTo(0, W + 0.6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#eff6ff'; ctx.lineWidth = 0.7; ctx.stroke();
    } else if (k === 'poison' || k === 'blood') { // giọt
        ctx.beginPath(); ctx.arc(-0.5, 0, W + 0.5, Math.PI / 2, -Math.PI / 2); ctx.quadraticCurveTo(Lb, -W * 0.3, Lb + 1.5, 0); ctx.quadraticCurveTo(Lb, W * 0.3, -0.5, W + 0.5); ctx.fill();
    } else if (k === 'hype') { // viên trắng viền vàng
        ctx.beginPath(); ctx.moveTo(-Lb, -W); ctx.lineTo(Lb * 0.4, -W); ctx.quadraticCurveTo(Lb + 1.5, 0, Lb * 0.4, W); ctx.lineTo(-Lb, W); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = JL_GOLD; ctx.lineWidth = 0.8; ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(-Lb, -W); ctx.lineTo(Lb * 0.4, -W); ctx.quadraticCurveTo(Lb + 1.5, 0, Lb * 0.4, W); ctx.lineTo(-Lb, W); ctx.closePath(); ctx.fill();
        if (k === 'gold' || b.jlCrit) { ctx.fillStyle = '#fff7ed'; ctx.fillRect(-Lb * 0.6, -W * 0.35, Lb, W * 0.5); }
        if (k === 'blast') { ctx.fillStyle = '#7c2d12'; ctx.fillRect(-Lb * 0.2, -W, 1.2, W * 2); }
    }
    ctx.restore();
}
// Ổ đạn 6 icon cạnh xe (The Hand, mặc định bên trái vì bên phải có vòng chỉ báo chung): viên kế tiếp sáng, viên đã bắn mờ
function jlDrawAmmoCyl(p) {
    if (p.jlMode === 'boy' || !p.jlCyl || !p.jlCyl.length || typeof JL_AMMO === 'undefined') return;
    const side = p.x - 42 > 0 ? -1 : 1, cx = p.x + p.w / 2 + (side < 0 ? -(p.w / 2 + 22) : p.w / 2 + 48), cy = p.y + p.h / 2 + (p.id === 1 ? -3 : 3), idx = p.jlCylIdx || 0;
    const R = 14, rot = -idx * Math.PI / 3, load = (p.jlLoadFx || 0) / 30;
    const guest = typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest';
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(15,23,42,0.72)'; ctx.strokeStyle = p.jlReload > 0 ? '#64748b' : JL_GOLD; ctx.lineWidth = 1.2;
    ctx.shadowBlur = 8; ctx.shadowColor = p.jlReload > 0 ? '#475569' : JL_GOLD;
    ctx.beginPath(); ctx.arc(0, 0, R + 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    if (p.jlReload > 0) { // vòng nạp
        const k = 1 - p.jlReload / jlReloadTicks(p);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    }
    ctx.font = '8px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 6; i++) {
        const a = (i - idx) * Math.PI / 3 + (p.id === 1 ? -Math.PI / 2 : Math.PI / 2) + load * 3, A = JL_AMMO[p.jlCyl[i]];
        const used = i < idx || p.jlReload > 0, next = !used && i === idx;
        const x = Math.cos(a) * R, y = Math.sin(a) * R;
        ctx.globalAlpha = used ? 0.22 : 1;
        ctx.fillStyle = used ? '#0f172a' : 'rgba(2,6,23,0.85)';
        if (next) { ctx.shadowBlur = 8; ctx.shadowColor = A.c; }
        ctx.strokeStyle = A.c; ctx.lineWidth = next ? 1.6 : 0.9;
        ctx.beginPath(); ctx.arc(x, y, next ? 6 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.save(); ctx.translate(x, y); if (guest) ctx.rotate(Math.PI); ctx.fillText(A.ic, 0, 0.5); ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    void rot;
}
// Đạn Khói Mù: phủ khói lên hàng HUD của địch (che HP / đạn / chỉ báo)
function jlDrawBlindSmoke(e) {
    if (!e || !(e.jlBlindT > 0) || e.hp <= 0) return;
    const k = Math.min(1, e.jlBlindT / 12), t = jlNow(), cx = e.x + e.w / 2;
    const y0 = e.id === 1 ? e.y + e.h + 1 : e.y - 26, y1 = y0 + 25;
    ctx.save(); ctx.globalAlpha = 0.92 * k;
    for (let i = 0; i < 9; i++) {
        const fx = cx + (i - 4) * 8 + Math.sin(t * 2 + i) * 3, fy = (y0 + y1) / 2 + Math.cos(t * 2.4 + i * 1.7) * 6;
        ctx.fillStyle = i % 2 ? 'rgba(71,85,105,0.95)' : 'rgba(148,163,184,0.9)';
        ctx.beginPath(); ctx.arc(fx, fy, 9 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = k; ctx.font = "900 7px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.translate(cx, (y0 + y1) / 2);
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
    ctx.strokeText('💨 MÙ', 0, 0); ctx.fillText('💨 MÙ', 0, 0);
    ctx.restore();
}
function jlDrawBoyBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, r = b.w / 2, t = jlNow();
    const c = b.jlJackpot ? JL_GOLD : (b.jlCh === 1 ? '#fbbf24' : (b.jlCh <= 3 ? '#fb923c' : '#cbd5e1'));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.35, b.jlJackpot ? 'rgba(252,211,77,0.7)' : 'rgba(168,85,247,0.55)'); g.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 16; ctx.shadowColor = c; ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (b.jlJackpot) {
        ctx.strokeStyle = '#fff7ed'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "900 9px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#7c2d12';
        ctx.fillText('100', x, y);
    } else if (b.jlCh === 1) { ctx.fillStyle = '#7c2d12'; ctx.font = "900 8px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', x, y + 0.5); }
    ctx.restore();
}

// ---------- Đồng xu tung, hào quang Luck / Nợ, ổ Cò Quay Nga ----------
function jlDrawCoin(p) {
    const f = p.jlFlipFx || 0; if (f <= 0) return;
    const k = 1 - f / 42, cx = p.x + p.w / 2, base = p.id === 1 ? p.y - 22 : p.y + p.h + 22, up = p.id === 1 ? -1 : 1;
    const hgt = Math.sin(Math.min(1, k / 0.7) * Math.PI) * 18, y = base + up * hgt;
    const landed = k >= 0.7, heads = p.jlFlipRes === 1;
    const sx = landed ? 1 : Math.cos(k * 40);
    ctx.save(); ctx.translate(cx, y); ctx.scale(Math.max(0.2, Math.abs(sx)), 1);
    const face = landed ? heads : sx > 0;
    ctx.shadowBlur = 14; ctx.shadowColor = landed ? (heads ? JL_GOLD : JL_RED) : JL_GOLD;
    const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
    g.addColorStop(0, '#fff7ed'); g.addColorStop(0.5, face ? '#fbbf24' : '#b45309'); g.addColorStop(1, face ? '#b45309' : '#78350f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = landed && !heads ? '#fecaca' : '#7c2d12';
    ctx.font = "900 8px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(landed ? (heads ? '$' : '✕') : (face ? '$' : '✕'), 0, 0.5);
    ctx.restore();
}
function jlDrawAura(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = jlNow();
    ctx.save();
    if (p.jlLuck > 0) {
        ctx.strokeStyle = 'rgba(252,211,77,0.75)'; ctx.lineWidth = 1.6; ctx.shadowBlur = 12; ctx.shadowColor = JL_GOLD;
        ctx.setLineDash([3, 4]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.85, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "8px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 3; i++) { const a = t * 1.6 + i * Math.PI * 2 / 3; ctx.fillText('🍀', cx + Math.cos(a) * p.w * 0.85, cy + Math.sin(a) * p.w * 0.85); }
    } else if (p.jlDebt > 0) {
        const n = Math.min(8, p.jlDebt);
        ctx.strokeStyle = `rgba(239,68,68,${0.35 + 0.05 * n})`; ctx.lineWidth = 1.2;
        for (let i = 0; i < n; i++) {
            const a = i * Math.PI * 2 / n + t * 0.4, r = p.w * 0.78;
            ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, 1.6, a, 0, Math.PI * 2); ctx.stroke();
        }
    }
    if (p.jlHypeT > 0) {
        ctx.strokeStyle = 'rgba(248,250,252,0.85)'; ctx.lineWidth = 1.4; ctx.shadowBlur = 10; ctx.shadowColor = '#f8fafc';
        ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.72, t * 6, t * 6 + Math.PI * 1.4); ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (p.jlCurseT > 0) {
        for (let i = 0; i < 5; i++) {
            const a = t * 2 + i * 1.26;
            ctx.fillStyle = i % 2 ? 'rgba(75,85,99,0.5)' : 'rgba(126,34,206,0.35)';
            ctx.beginPath(); ctx.arc(cx + Math.cos(a) * p.w * 0.5, cy + Math.sin(a) * p.h * 0.5, 6, 0, Math.PI * 2); ctx.fill();
        }
    }
    if (p.jlBackFx > 0) {
        const k = p.jlBackFx / 40;
        ctx.fillStyle = `rgba(30,41,59,${0.55 * k})`; ctx.beginPath(); ctx.arc(cx, cy, p.w * (1.3 - k * 0.4), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
function jlDrawRoulette(p) {
    if (p.jlMode !== 'boy') return;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2 + (p.id === 1 ? -p.h - 26 : p.h + 26), t = jlNow();
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,0.75)'; ctx.strokeStyle = JL_PURP; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = JL_PURP;
    ctx.beginPath(); ctx.arc(cx, cy, 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    // vòng hồi bóp cò
    const gap = jlPullGap(p), k = 1 - Math.min(1, (p.jlPullCd || 0) / gap);
    ctx.strokeStyle = k >= 1 ? JL_GOLD : 'rgba(168,85,247,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    jlCylinder(cx, cy, 15, -(p.jlPulled || 0) * Math.PI / 3 + Math.sin(t * 8) * 0.03, p.jlPulled, true, (p.jlPullFx || 0) > 0);
    ctx.font = "900 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    const s = (p.jlPulled || 0) + '/6';
    ctx.save(); ctx.translate(cx, cy + (p.id === 1 ? -27 : 27));
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
    ctx.strokeText('THE BOY ' + s, 0, 0); ctx.fillText('THE BOY ' + s, 0, 0); ctx.restore();
    ctx.restore();
}

CharHooks.register('jack_6_lo', Object.assign(CharHooks.registry.jack_6_lo || {}, {
    draw() {
        jlDrawAura(this);
        if (this.jlHold > 6 && this.jlMode !== 'boy' && !(this.jlBoyCd > 0)) {
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2, k = Math.min(1, this.jlHold / JL_HOLD);
            ctx.save(); ctx.strokeStyle = JL_PURP; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = JL_PURP;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.restore();
        }
        jlDrawRoulette(this);
        jlDrawAmmoCyl(this);
        jlDrawCoin(this);
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudRowY !== 'function') return;
        const y = hudRowY(this, 'extra') + (this.id === 1 ? 2 : -2), cx = this.x + this.w / 2, w = 26;
        ctx.save();
        if (this.jlLuck > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(cx - w / 2, y - 1.5, w, 3);
            ctx.fillStyle = JL_GOLD; ctx.shadowBlur = 6; ctx.shadowColor = JL_GOLD;
            ctx.fillRect(cx - w / 2, y - 1.5, w * Math.min(1, this.jlLuck / Math.max(1, this.jlLuckMax)), 3);
        } else {
            const n = this.jlDebt || 0, m = Math.min(n, 8);
            for (let i = 0; i < m; i++) { ctx.fillStyle = JL_RED; ctx.beginPath(); ctx.arc(cx + (i - (m - 1) / 2) * 4.5, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
            if (n > 8) { ctx.font = "bold 6px Arial"; ctx.fillStyle = JL_RED; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('+' + (n - 8), cx + 20, y); }
            if (!n) { // vòng chờ tung xu
                const k = 1 - Math.max(0, this.jlFlipT || 0) / jlFlipEvery(this);
                ctx.strokeStyle = 'rgba(252,211,77,0.7)'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(cx, y, 2.4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            }
        }
        ctx.restore();
    },
}));

// ---------- Kết liễu "JACKPOT 777!" ----------
function jlDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 118 ? Math.max(0, 1 - (t - 118) / 22) : 1;
    ctx.save();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(20, 8, 2, ${0.62 * Math.min(1, t / 10) * fade})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.globalAlpha = fade;
    // pháo hoa
    const bursts = [[10, 0.25, 0.3], [24, 0.75, 0.25], [38, 0.5, 0.18], [52, 0.2, 0.65], [64, 0.8, 0.7], [78, 0.45, 0.45]];
    const cols = [JL_GOLD, '#f472b6', JL_GREEN, '#60a5fa', '#f87171', '#fef3c7'];
    bursts.forEach(([t0, fx, fy], bi) => {
        const k = (t - t0) / 40; if (k <= 0 || k > 1) return;
        const bx = W * fx, by = H * fy, R = 26 + 70 * Math.sqrt(k);
        ctx.fillStyle = cols[bi % cols.length]; ctx.globalAlpha = fade * (1 - k);
        ctx.shadowBlur = 10; ctx.shadowColor = cols[bi % cols.length];
        for (let i = 0; i < 18; i++) {
            const a = i * Math.PI * 2 / 18 + bi;
            ctx.beginPath(); ctx.arc(bx + Math.cos(a) * R, by + Math.sin(a) * R + k * k * 20, 2.2 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
        }
    });
    ctx.shadowBlur = 0; ctx.globalAlpha = fade;
    // mưa tiền vàng
    for (let i = 0; i < 46; i++) {
        const sx = ((i * 97.13 + f.seed * 31) % W), sp = 3.2 + (i % 5) * 0.8, d = (i * 13) % 50;
        const y = -20 + (t - d) * sp; if (t < d || y > H + 20) continue;
        const sc = Math.cos((t + i * 7) * 0.25);
        ctx.save(); ctx.translate(sx + Math.sin((t + i) * 0.08) * 8, y); ctx.scale(Math.max(0.15, Math.abs(sc)), 1);
        ctx.fillStyle = sc > 0 ? '#fbbf24' : '#b45309'; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 4.2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
    // chữ + 3 ô 777
    if (t >= 8) {
        const a = Math.min(1, (t - 8) / 8) * fade;
        const cxv = typeof fatalCinematic !== 'undefined' && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = typeof fatalCinematic !== 'undefined' && fatalCinematic.active ? fatalCinematic.victimY : H / 2;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(Math.max(110, Math.min(W - 110, cxv)), cyv + (f.team === 1 ? 120 : -120));
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = t < 18 ? 1.5 - (t - 8) / 10 * 0.5 : 1; ctx.scale(sc, sc);
        // máy đánh bạc 3 ô
        ctx.fillStyle = 'rgba(69,10,10,0.9)'; ctx.strokeStyle = JL_GOLD; ctx.lineWidth = 3; ctx.shadowBlur = 18; ctx.shadowColor = JL_GOLD;
        TA.rr(-78, -48, 156, 44, 8); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        for (let i = 0; i < 3; i++) {
            const stop = 14 + i * 9, spin = t < stop;
            ctx.fillStyle = '#fff7ed'; TA.rr(-70 + i * 48, -43, 44, 34, 5); ctx.fill();
            ctx.font = "900 26px 'Orbitron', Arial"; ctx.fillStyle = spin ? '#64748b' : JL_RED;
            const sym = spin ? ['♠', '♦', '$', '♣'][Math.floor(t / 2 + i) % 4] : '7';
            ctx.fillText(sym, -48 + i * 48, -25);
        }
        if (t >= 34) {
            ctx.font = "900 26px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
            ctx.shadowBlur = 20; ctx.shadowColor = JL_GOLD; ctx.fillStyle = JL_GOLD;
            ctx.strokeText('JACKPOT 777!', 0, 20); ctx.fillText('JACKPOT 777!', 0, 20);
        }
        ctx.restore();
    }
}
function jlFxOver() {
    if (typeof p1 !== 'undefined' && typeof p2 !== 'undefined') [p1, p2].forEach(p => { if (jlIs(p)) jlDrawBlindSmoke(jlEnemy(p)); });
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof JlFinisher && e.active) e.drawOver();
}

function jlRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('jack_6_lo', p => {
        if (p.jlMode === 'boy') {
            const gap = jlPullGap(p);
            return { pct: 1 - Math.min(1, (p.jlPullCd || 0) / gap), ready: !(p.jlPullCd > 0), color: JL_PURP, label: 'BÓP CÒ ' + (p.jlPulled || 0) + '/6', btnIcon: '🔫' };
        }
        if (p.jlBoyCd > 0) return { pct: 1 - p.jlBoyCd / Math.max(1, p.jlBoyCdMax), ready: false, color: '#64748b', label: 'THE BOY ' + Math.ceil(p.jlBoyCd / 60) + 's', btnIcon: '🎲', dim: true };
        if (p.jlHold > 0) return { pct: Math.min(1, p.jlHold / JL_HOLD), ready: p.jlHold >= JL_HOLD, color: JL_PURP, label: 'RÚT THE BOY...', btnIcon: '🔫' };
        if (p.jlReload > 0) return { pct: 1 - p.jlReload / jlReloadTicks(p), ready: false, color: '#94a3b8', label: 'NẠP ĐẠN', btnIcon: '🎲', dim: true };
        const nx = p.jlCyl && typeof JL_AMMO !== 'undefined' ? JL_AMMO[p.jlCyl[p.jlCylIdx || 0]] : null;
        return { pct: 1, ready: true, color: nx ? nx.c : JL_GOLD, label: nx ? 'KẾ: ' + nx.n : 'GIỮ: THE BOY', btnIcon: nx ? nx.ic : '🎲' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', jlRegisterHUD);
