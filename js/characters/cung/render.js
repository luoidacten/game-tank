// ==========================================
// Cung (cung) — Hình ảnh: xe cung phản khúc, mũi tên theo kiểu bắn, hồng tâm Ngắm
// Biểu tượng kiểu bắn + tiến độ giữ nút: provider 'cung' trong js/render/empower-providers.js
// ==========================================

Object.assign(Player.prototype, {
    // (giữ cho js/player/render.js) — HUD Cung đã chuyển sang provider + chip 'NÉ' trong tank-hud.js
    drawUIForCung() { },
    drawUIForCung2() { },
});

registerTankArt('cung', (p, k) => {
    const t = k.t;
    const M = BOW_MODES[p.bowMode || 0];
    const aim = !!p.bowAiming;
    const accent = aim ? '#ff3355' : M.color;
    const limb = k.full ? '#ffd23f' : (k.evo1 ? '#e2e8f0' : '#cbd5e1');
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);

    TA.treads(-15.5, 4, -8, 14, t, '#0b1220', '#334155');

    // Thân mũi nhọn
    ctx.fillStyle = TA.vgrad(-12, 13, '#1e293b', '#0b1220');
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(10, -6); ctx.lineTo(11, 12); ctx.lineTo(-11, 12); ctx.lineTo(-10, -6); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 1; TA.glow(accent, 5 + pulse * 4); ctx.stroke(); TA.noGlow();

    // Ống tên phía sau: lông đuôi theo màu đội
    ctx.fillStyle = '#3b2a1a'; TA.rr(-4, 4, 8, 8, 2); ctx.fill();
    ctx.strokeStyle = '#a16207'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = k.team;
    [-2.4, 0, 2.4].forEach((x, i) => {
        if (i >= Math.min(3, p.ammo)) ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.moveTo(x, 3.5); ctx.lineTo(x - 1.2, 6.5); ctx.lineTo(x + 1.2, 6.5); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Lõi / biểu tượng Evo 2 (hồng tâm)
    if (k.evo2) {
        ctx.strokeStyle = aim ? '#ff3355' : '#ff7a8a'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, -2, 3.2, 0, Math.PI * 2); ctx.moveTo(-5, -2); ctx.lineTo(5, -2); ctx.moveTo(0, -7); ctx.lineTo(0, 3); ctx.stroke();
    }
    ctx.fillStyle = k.team; TA.glow(k.team, 6);
    ctx.beginPath(); ctx.arc(0, -2, 1.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow();

    // Cung phản khúc
    const draw = aim ? 1 : (p.bowMode === 0 ? (p.bowDraw || 0) : (p.bowCD > 0 ? 0.2 : 0.6));
    const vib = (p.bowRecoil || 0) > 0 ? Math.sin(t * 90) * (p.bowRecoil || 0) * 0.15 : 0;
    const ny = -4 + draw * 9 + vib;
    ctx.strokeStyle = limb; ctx.lineWidth = 2; TA.glow(k.full ? '#ffd23f' : accent, k.full ? 8 : 4);
    ctx.beginPath();
    ctx.moveTo(-15, -2); ctx.quadraticCurveTo(-13.5, -6, -11.5, -6.5);
    ctx.quadraticCurveTo(-6, -15.5, 0, -12);
    ctx.quadraticCurveTo(6, -15.5, 11.5, -6.5);
    ctx.quadraticCurveTo(13.5, -6, 15, -2);
    ctx.stroke(); TA.noGlow();
    if (k.evo1) { // lưỡi trên đầu cung
        ctx.fillStyle = accent;
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 15, -2); ctx.lineTo(sd * 15.6, -6); ctx.lineTo(sd * 13, -4); ctx.closePath(); ctx.fill(); });
    }
    // Dây cung
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-15, -2); ctx.lineTo(0, ny); ctx.lineTo(15, -2); ctx.stroke();

    // Mũi tên đặt trên dây (theo kiểu bắn)
    const ready = aim || (p.bowCD <= 0 && p.ammo > 0);
    if (ready) {
        const arrows = aim ? [0] : (p.bowMode === 2 ? (k.evo1 ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.22, 0, 0.22]) : (p.bowMode === 1 ? [-0.06, 0.06] : [0]));
        const len = Math.max(10, Math.min(15.5, 10 + draw * 6)) + (p.bowMode === 0 || aim ? 0 : -2);
        arrows.forEach(a => {
            ctx.save();
            ctx.translate(0, ny); ctx.rotate(-Math.PI / 2 + a); ctx.translate(len / 2 - 1, 0); // đuôi tên đặt trên dây
            ctx.globalAlpha = a === 0 ? 1 : 0.8;
            bowDrawArrowShape(len, '#f1f5f9', accent, p.bowMode === 0 && !aim ? 0.6 + 0.35 * draw : 0.55);
            ctx.restore();
        });
        if (p.bowMode === 0 && draw >= 1 && !aim) { // căng tối đa: tia sáng ở mũi tên
            ctx.fillStyle = `rgba(255,220,120,${0.5 + 0.5 * pulse})`; TA.glow('#ffd23f', 10);
            ctx.beginPath(); ctx.arc(0, ny - len, 1.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
        }
    }
});

registerBulletArt('cung', (b, color, owner, k) => {
    if (b.type !== 'arrow') return false;
    const kind = b.bowKind || 'charge';
    let L, head, glow, sc;
    if (kind === 'rapid') { L = 12; head = '#3dffb0'; glow = 4; sc = 0.6; }
    else if (kind === 'triple') { L = 14; head = '#38c8ff'; glow = 6; sc = 0.7; }
    else { const c = b.bowC || 0; L = 15 + 15 * c; head = b.isPiercing ? '#ffffff' : (c >= 1 ? '#ffd23f' : '#ffb347'); glow = 4 + 10 * c; sc = 0.75 + 0.6 * c; }
    // vệt sáng phía sau
    const g = ctx.createLinearGradient(-L * 1.7, 0, -L * 0.3, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, head);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-L * 1.7, 0); ctx.lineTo(-L * 0.3, -1.6 * sc); ctx.lineTo(-L * 0.3, 1.6 * sc); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    if (kind === 'charge' && (b.bowC || 0) >= 1) { // hào quang mũi tụ lực tối đa
        ctx.fillStyle = b.isPiercing ? 'rgba(255,255,255,0.18)' : 'rgba(255,200,60,0.18)';
        ctx.beginPath(); ctx.ellipse(0, 0, L * 0.75, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
    }
    TA.glow(head, glow);
    // thân + đầu + lông (lông đuôi màu đội)
    const h = L / 2;
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.3 * sc;
    ctx.beginPath(); ctx.moveTo(-h, 0); ctx.lineTo(h - 3 * sc, 0); ctx.stroke();
    ctx.fillStyle = head;
    ctx.beginPath(); ctx.moveTo(h + 3 * sc, 0); ctx.lineTo(h - 4.5 * sc, -3.2 * sc); ctx.lineTo(h - 3 * sc, 0); ctx.lineTo(h - 4.5 * sc, 3.2 * sc); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.fillStyle = k.team;
    for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(-h + 5 * sc, 0); ctx.lineTo(-h - 1.5 * sc, s * 3.4 * sc); ctx.lineTo(-h + 0.5 * sc, 0); ctx.closePath(); ctx.fill();
    }
    return true;
});

// Hồng tâm Ngắm (đuổi theo địch, thu hẹp dần)
Object.assign(CharHooks.registry.cung, {
    draw() {
        if (!this.bowAiming) return;
        const x = this.bowAimX, y = this.bowAimY, r = this.bowAimR;
        const k = Math.min(1, (this.bowAimT || 0) / BOW_AIM_MAX);
        const col = k < 0.5 ? '#ffb347' : '#ff3355';
        const t = Date.now() / 1000;
        ctx.save();
        // đường ngắm mờ từ cung tới hồng tâm
        ctx.strokeStyle = 'rgba(255,80,90,0.25)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, this.id === 1 ? this.y : this.y + this.h); ctx.lineTo(x, y); ctx.stroke();
        ctx.setLineDash([]);
        // vòng tối đa ban đầu (mờ)
        ctx.strokeStyle = 'rgba(255,180,80,0.18)';
        ctx.beginPath(); ctx.ellipse(x, y, BOW_AIM_R0, BOW_AIM_R0 * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
        // vùng hiện tại
        ctx.fillStyle = `rgba(255,60,70,${0.08 + 0.14 * k})`;
        ctx.strokeStyle = col; ctx.lineWidth = 1.5 + k; ctx.shadowColor = col; ctx.shadowBlur = 8 + 8 * k;
        ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // 4 ngoặc xoay
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const a = t * 2 + i * Math.PI / 2;
            ctx.beginPath(); ctx.ellipse(x, y, r + 5, (r + 5) * 0.6, 0, a - 0.25, a + 0.25); ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // tâm chữ thập
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
        // nhãn hệ số sát thương
        ctx.fillStyle = col; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        const flip = typeof hudTextFlip === 'function' && hudTextFlip(this);
        const side = this.y > y ? 1 : -1; // nhãn ở phía người bắn (không bị mép sân che)
        ctx.translate(x, y + side * (r * 0.6 + 12)); if (flip) ctx.rotate(Math.PI);
        ctx.fillText('x' + (2 + 3 * k).toFixed(1), 0, 3);
        ctx.restore();
    },
});
