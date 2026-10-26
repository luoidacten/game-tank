// ==========================================
// Huyết Ma (blood_lord) — Render: xe dơi máu neon, đạn máu, Bầy Dơi, Huyết Tiễn,
// Huyết Cầu, vòng Bóng Ma Màn Đêm, thanh Bể Máu & HUD nút Bắn
// ==========================================

// Dơi nhỏ (biểu tượng) tại (x, y), sải cánh w, góc vỗ f (0..1)
function bdDrawBat(x, y, w, f, color, alpha = 1, rot = 0) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    const h = w * (0.18 + 0.22 * f);
    ctx.beginPath();
    ctx.moveTo(0, -w * 0.08);
    ctx.quadraticCurveTo(w * 0.25, -h - w * 0.1, w * 0.5, -h * 0.4);
    ctx.quadraticCurveTo(w * 0.36, -h * 0.05, w * 0.3, h * 0.25);
    ctx.quadraticCurveTo(w * 0.18, 0, w * 0.08, w * 0.12);
    ctx.lineTo(0, w * 0.06);
    ctx.lineTo(-w * 0.08, w * 0.12);
    ctx.quadraticCurveTo(-w * 0.18, 0, -w * 0.3, h * 0.25);
    ctx.quadraticCurveTo(-w * 0.36, -h * 0.05, -w * 0.5, -h * 0.4);
    ctx.quadraticCurveTo(-w * 0.25, -h - w * 0.1, 0, -w * 0.08);
    ctx.fill();
    ctx.restore();
}

registerTankArt('blood_lord', (p, k) => {
    const t = k.t;
    const FC = BD_COL[p.bdForm || 0];   // màu dạng hiện tại
    const frac = Math.min(1, (p.bdPool || 0) / bdPoolMax(p));
    // Dạng dơi bất tử khi lao (Huyết Phá)
    if (p.bdMode === 'dash') {
        TA.glow(BD_RED, 14);
        const f = 0.5 + 0.5 * Math.sin(t * 40);
        bdDrawBat(0, 2, 32, f, '#2a0610');
        ctx.strokeStyle = BD_RED; ctx.lineWidth = 1.2; TA.noGlow();
        bdDrawBat(0, 2, 26, f, BD_RED, 0.55);
        ctx.fillStyle = '#fff'; TA.glow('#fff', 6);
        ctx.beginPath(); ctx.arc(-2, -1, 1, 0, Math.PI * 2); ctx.arc(2, -1, 1, 0, Math.PI * 2); ctx.fill();
        TA.noGlow();
        return;
    }
    TA.treads(-14.5, 3.5, -9, 13, t, '#12040a', '#4c0519');
    // Cánh dơi hai bên (vỗ nhẹ)
    const flap = Math.sin(t * 3) * 0.8;
    [-1, 1].forEach(sd => {
        ctx.save();
        ctx.scale(sd, 1);
        const g = ctx.createLinearGradient(4, 0, 16, 0);
        g.addColorStop(0, '#3b0a1a'); g.addColorStop(1, '#14030a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(5, -7);
        ctx.lineTo(15.5, -12 - flap);
        ctx.lineTo(15.5, 4);
        ctx.quadraticCurveTo(13, 2, 11.5, 6);
        ctx.quadraticCurveTo(9.5, 3.5, 7.5, 8);
        ctx.lineTo(5, 7);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = FC; ctx.lineWidth = 0.9; TA.glow(FC, 5); ctx.stroke(); TA.noGlow();
        // gân cánh
        ctx.strokeStyle = 'rgba(255,31,75,0.45)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(6, -5); ctx.lineTo(15, -10 - flap); ctx.moveTo(6, -1); ctx.lineTo(11.5, 5.5); ctx.stroke();
        // Evo 2: gai vai
        if (k.evo2) {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath(); ctx.moveTo(14.5, -11 - flap); ctx.lineTo(16, -15.5); ctx.lineTo(15.8, -10.5); ctx.fill();
        }
        ctx.restore();
    });
    // Nòng: răng nanh đôi
    ctx.fillStyle = TA.metal(-2, 2, '#4c0519', '#fda4af');
    TA.rr(-1.6, -15, 3.2, 8, 1.2); ctx.fill();
    ctx.fillStyle = FC; TA.glow(FC, 8); ctx.fillRect(-2, -15.5, 4, 1.6); TA.noGlow();
    ctx.fillStyle = '#f8fafc';
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 3, -9); ctx.lineTo(sd * 4.6, -9); ctx.lineTo(sd * 3.6, -13); ctx.fill(); });
    // Thân: khiên lục giác
    ctx.save();
    TA.glow(k.teamGlow, 7);
    ctx.fillStyle = TA.metal(-8, 8, '#1a0610', '#4a0d22');
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(7.5, -6); ctx.lineTo(8, 6); ctx.lineTo(0, 12); ctx.lineTo(-8, 6); ctx.lineTo(-7.5, -6);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    // Lõi Bể Máu: bình cầu, mực máu = % Bể Máu
    const R = 5.2;
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 1, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#12020a'; ctx.fillRect(-R, 1 - R, R * 2, R * 2);
    const lvl = 1 + R - frac * R * 2;
    const lg = ctx.createLinearGradient(0, lvl, 0, 1 + R);
    lg.addColorStop(0, '#ff4d6d'); lg.addColorStop(1, '#7f0a24');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(-R, lvl);
    for (let xx = -R; xx <= R; xx += 1) ctx.lineTo(xx, lvl + Math.sin(xx * 1.2 + t * 6) * 0.5);
    ctx.lineTo(R, 1 + R); ctx.lineTo(-R, 1 + R); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = FC; ctx.lineWidth = 1.3;
    TA.glow(FC, 5 + frac * 10);
    ctx.beginPath(); ctx.arc(0, 1, R, 0, Math.PI * 2); ctx.stroke();
    TA.noGlow();
    // Vừa đổi dạng: chớp màu dạng mới lên thân
    if (p.bdSwitchFx > 0) {
        const q = p.bdSwitchFx / 30;
        ctx.save();
        ctx.globalAlpha = q * 0.85; ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = FC; TA.glow(FC, 14);
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(7.5, -6); ctx.lineTo(8, 6); ctx.lineTo(0, 12); ctx.lineTo(-8, 6); ctx.lineTo(-7.5, -6);
        ctx.closePath(); ctx.fill();
        TA.noGlow(); ctx.restore();
    }
    // Mắt
    ctx.fillStyle = k.evo1 ? '#d8b4fe' : '#ffe4e6';
    TA.glow(k.evo1 ? BD_VIOLET : BD_RED, 6);
    ctx.beginPath(); ctx.moveTo(-5, -5.5); ctx.lineTo(-2, -4.2); ctx.lineTo(-4.6, -3.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -5.5); ctx.lineTo(2, -4.2); ctx.lineTo(4.6, -3.6); ctx.fill();
    TA.noGlow();
    // Full Evo: sừng vương miện
    if (k.full) {
        ctx.fillStyle = '#fde68a'; TA.glow('#fbbf24', 6);
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 5.5, -7); ctx.lineTo(sd * 7.5, -12.5); ctx.lineTo(sd * 3.5, -8); ctx.fill(); });
        TA.noGlow();
    }
    // Bóng Ma Màn Đêm sẵn sàng: hào quang tím
    if (p.bdNight) {
        ctx.strokeStyle = BD_VIOLET; ctx.lineWidth = 1; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.arc(0, 1, R + 2.5, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
});

// Đạn máu: giọt máu neon
registerBulletArt('blood_lord', (b, color, owner, k) => {
    const L = 7;
    const g = ctx.createLinearGradient(-L * 2.4, 0, L, 0);
    g.addColorStop(0, 'rgba(255,31,75,0)'); g.addColorStop(1, 'rgba(255,31,75,0.55)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-L * 2.4, 0); ctx.lineTo(0, -2.6); ctx.lineTo(0, 2.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = BD_RED; ctx.shadowColor = BD_RED; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(L * 0.8, 0);
    ctx.quadraticCurveTo(0, -3.8, -2.6, 0);
    ctx.quadraticCurveTo(0, 3.8, L * 0.8, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath(); ctx.arc(1.2, -0.6, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 0, 3.4, 0, Math.PI * 2); ctx.stroke();
    return true;
});

// Vùng Bầy Dơi / Đại Tiệc Máu
function bdDrawBatZone(z) {
    const life = z.life / z.maxLife;
    const fadeIn = Math.min(1, z.t / 10);
    const a = Math.min(1, life * 3) * fadeIn;
    // Nở ra mượt lúc xuất hiện (ease-out)
    const grow = 1 - Math.pow(1 - fadeIn, 3);
    const R = z.r * (0.6 + 0.4 * grow);
    const C1 = z.feast ? '#c084fc' : '#ff4d6d';            // viền chính
    const C2 = z.feast ? 'rgba(177,77,255,' : 'rgba(255,31,75,';
    const t = z.t;
    const TAU = Math.PI * 2;
    ctx.save();
    ctx.globalAlpha = a;
    // Quầng sáng ngoài
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(z.x, z.y, R * 0.7, z.x, z.y, R * 1.25);
    halo.addColorStop(0, C2 + '0)'); halo.addColorStop(0.75, C2 + '0.22)'); halo.addColorStop(1, C2 + '0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(z.x, z.y, R * 1.25, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // Đĩa máu (tâm tối, mép đỏ) — nhịp tim nhẹ
    const beat = 1 + 0.03 * Math.sin(t * 0.25);
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, R * beat);
    g.addColorStop(0, z.feast ? 'rgba(40,6,60,0.55)' : 'rgba(50,0,14,0.55)');
    g.addColorStop(0.65, C2 + '0.22)');
    g.addColorStop(1, C2 + '0.42)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(z.x, z.y, R * beat, 0, TAU); ctx.fill();
    // Sóng hút vào tâm mỗi nhịp sát thương
    const k = (t % z.every) / z.every;
    ctx.strokeStyle = C2 + (0.65 * k).toFixed(3) + ')'; ctx.lineWidth = 1 + 2 * (1 - k);
    ctx.beginPath(); ctx.arc(z.x, z.y, Math.max(1, R * (1 - 0.8 * k)), 0, TAU); ctx.stroke();
    // Vòng ngoài sáng + vòng nét đứt xoay ngược nhau
    ctx.shadowColor = C1; ctx.shadowBlur = 12;
    ctx.strokeStyle = C1; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(z.x, z.y, R, 0, TAU); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.2; ctx.strokeStyle = z.feast ? 'rgba(233,213,255,0.7)' : 'rgba(255,208,218,0.7)';
    ctx.setLineDash([R * 0.18, R * 0.1]); ctx.lineDashOffset = -t * 0.9;
    ctx.beginPath(); ctx.arc(z.x, z.y, R * 0.82, 0, TAU); ctx.stroke();
    ctx.setLineDash([3, 6]); ctx.lineDashOffset = t * 0.6;
    ctx.beginPath(); ctx.arc(z.x, z.y, R * 0.55, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    // Vạch rune quanh vòng ngoài
    ctx.strokeStyle = C2 + '0.75)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
        const an = i * TAU / 12 + t * 0.012;
        ctx.beginPath();
        ctx.moveTo(z.x + Math.cos(an) * R * 0.9, z.y + Math.sin(an) * R * 0.9);
        ctx.lineTo(z.x + Math.cos(an) * R * 0.98, z.y + Math.sin(an) * R * 0.98);
        ctx.stroke();
    }
    // Vòng thời gian còn lại
    ctx.strokeStyle = 'rgba(255,240,244,0.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(z.x, z.y, R + 4, -Math.PI / 2, -Math.PI / 2 + TAU * life); ctx.stroke();
    // Giọt máu xoắn ốc chảy vào tâm (hút máu)
    ctx.fillStyle = z.feast ? '#e9d5ff' : '#ff8fa3';
    const n = z.feast ? 18 : 14;
    for (let i = 0; i < n; i++) {
        const ph = (t * 0.018 + i / n) % 1;
        const rr = R * (1 - ph) * 0.95;
        const an = i * 2.39996 + ph * 3.2;
        ctx.globalAlpha = a * Math.min(1, ph * 4) * (1 - ph * 0.6);
        ctx.beginPath(); ctx.arc(z.x + Math.cos(an) * rr, z.y + Math.sin(an) * rr, 1.1 + 1.2 * (1 - ph), 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = a;
    // Dòng máu từ mục tiêu bị hút về tâm
    if (z.leechT > 0) {
        const lk = z.leechT / 14;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = C2 + (0.7 * lk).toFixed(3) + ')'; ctx.lineWidth = 2.5 * lk + 0.5;
        ctx.beginPath(); ctx.moveTo(z.leechX, z.leechY);
        ctx.quadraticCurveTo((z.leechX + z.x) / 2 + 14, (z.leechY + z.y) / 2 - 10, z.x, z.y); ctx.stroke();
        ctx.fillStyle = '#ffe4e6';
        for (let i = 0; i < 4; i++) {
            const q = ((1 - lk) + i / 4) % 1;
            const mx = (z.leechX + z.x) / 2 + 14, my = (z.leechY + z.y) / 2 - 10;
            const px = (1 - q) * (1 - q) * z.leechX + 2 * (1 - q) * q * mx + q * q * z.x;
            const py = (1 - q) * (1 - q) * z.leechY + 2 * (1 - q) * q * my + q * q * z.y;
            ctx.beginPath(); ctx.arc(px, py, 1.6, 0, TAU); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    // Bầy dơi bay vòng tròn
    const nb = z.feast ? 12 : 9;
    for (let i = 0; i < nb; i++) {
        const sp = (0.035 + (i % 3) * 0.012) * (i % 2 ? 1 : -1);
        const an = t * sp + i * TAU / nb;
        const rr = R * (0.38 + 0.5 * ((i * 37) % 10) / 10);
        const bx = z.x + Math.cos(an) * rr, by = z.y + Math.sin(an) * rr;
        const f = 0.5 + 0.5 * Math.sin(t * 0.6 + i);
        bdDrawBat(bx, by, 9 + (i % 3) * 2.5, f, i % 3 === 0 ? C1 : '#1a0610', 0.95, an + (sp > 0 ? Math.PI / 2 : -Math.PI / 2));
    }
    // Lõi tâm
    const cg = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, R * 0.22);
    cg.addColorStop(0, 'rgba(255,240,244,0.9)'); cg.addColorStop(1, C2 + '0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(z.x, z.y, R * 0.22, 0, TAU); ctx.fill();
    if (z.feast) {
        ctx.fillStyle = 'rgba(255,240,250,0.95)'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.shadowColor = BD_VIOLET; ctx.shadowBlur = 6;
        ctx.fillText('ĐẠI TIỆC MÁU', z.x, z.y - R * 0.3);
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

// Huyết Tiễn: cảnh báo rồi tia máu
function bdDrawLaser(L) {
    const o = L.owner;
    const dir = bdDir(o);
    const from = L.fromY;
    const to = L.stopY != null ? L.stopY : (dir < 0 ? 0 : canvas.height);
    const top = Math.min(from, to), h = Math.abs(to - from);
    ctx.save();
    if (L.warn > 0) {
        const k = 1 - L.warn / L.maxWarn;
        ctx.fillStyle = `rgba(255,31,75,${0.06 + 0.14 * k})`;
        ctx.fillRect(L.x - L.halfW, top, L.halfW * 2, h);
        ctx.strokeStyle = `rgba(255,60,90,${0.5 + 0.4 * k})`; ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]); ctx.lineDashOffset = -k * 30;
        ctx.beginPath();
        ctx.moveTo(L.x - L.halfW, top); ctx.lineTo(L.x - L.halfW, top + h);
        ctx.moveTo(L.x + L.halfW, top); ctx.lineTo(L.x + L.halfW, top + h);
        ctx.stroke(); ctx.setLineDash([]);
        // lõi thu hẹp dần
        ctx.fillStyle = `rgba(255,208,218,${0.3 + 0.5 * k})`;
        ctx.fillRect(L.x - 0.6 - (1 - k) * 2, top, 1.2 + (1 - k) * 4, h);
    } else {
        const a = 1 - L.flash / 12;
        ctx.globalAlpha = a;
        ctx.globalCompositeOperation = 'lighter';
        const w = L.halfW * 2 * (1 + 0.3 * Math.sin(L.flash));
        const g = ctx.createLinearGradient(L.x - w, 0, L.x + w, 0);
        g.addColorStop(0, 'rgba(255,31,75,0)'); g.addColorStop(0.3, 'rgba(255,31,75,0.9)');
        g.addColorStop(0.5, 'rgba(255,240,244,1)'); g.addColorStop(0.7, 'rgba(255,31,75,0.9)'); g.addColorStop(1, 'rgba(255,31,75,0)');
        ctx.fillStyle = g;
        ctx.shadowColor = BD_RED; ctx.shadowBlur = 20;
        ctx.fillRect(L.x - w, top, w * 2, h);
        // giọt máu bắn dọc tia
        ctx.fillStyle = '#ff8fa3';
        for (let i = 0; i < 6; i++) {
            const yy = top + ((i * 97 + L.flash * 23) % Math.max(1, h));
            ctx.beginPath(); ctx.arc(L.x + Math.sin(i * 7 + L.flash) * w, yy, 1.4, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
}

// Huyết Cầu
function bdDrawOrb(b) {
    const R = b.r;
    const pulse = 1 + 0.08 * Math.sin(b.t * 0.4);
    ctx.save();
    // đuôi
    const dir = b.vy < 0 ? 1 : -1;
    const tg = ctx.createLinearGradient(b.x, b.y, b.x, b.y + dir * R * 5);
    tg.addColorStop(0, 'rgba(255,31,75,0.55)'); tg.addColorStop(1, 'rgba(255,31,75,0)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(b.x - R * 0.9, b.y); ctx.lineTo(b.x + R * 0.9, b.y); ctx.lineTo(b.x, b.y + dir * R * 5); ctx.closePath(); ctx.fill();
    const g = ctx.createRadialGradient(b.x - R * 0.3, b.y - R * 0.3, R * 0.1, b.x, b.y, R * 1.8 * pulse);
    g.addColorStop(0, '#ffe4e6'); g.addColorStop(0.3, '#ff4d6d'); g.addColorStop(0.65, '#9b0a2a'); g.addColorStop(1, 'rgba(155,10,42,0)');
    ctx.fillStyle = g;
    ctx.shadowColor = BD_RED; ctx.shadowBlur = b.big ? 24 : 10;
    ctx.beginPath(); ctx.arc(b.x, b.y, R * 1.8 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (b.big) {
        ctx.strokeStyle = 'rgba(216,180,254,0.8)'; ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]); ctx.lineDashOffset = b.t;
        ctx.beginPath(); ctx.arc(b.x, b.y, R * 1.25, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < 3; i++) {
            const a = b.t * 0.12 + i * 2.094;
            bdDrawBat(b.x + Math.cos(a) * R * 1.5, b.y + Math.sin(a) * R * 1.5, 8, 0.5 + 0.5 * Math.sin(b.t * 0.5 + i), '#1a0610', 0.9, a);
        }
    }
    ctx.restore();
}

// Vòng cảnh báo Bóng Ma Màn Đêm (giống Thiên của Hoa Ảnh)
function bdDrawSkyCircle(p) {
    const c = p.bdCircle;
    if (!c) return;
    const R = c.r;
    ctx.save();
    if (c.landing > 0) {
        const lk = 1 - c.landing / (c.landMax || 30);
        const blink = 0.5 + 0.5 * Math.sin(lk * Math.PI * 10);
        ctx.fillStyle = `rgba(255, 20, 60, ${0.28 + 0.24 * lk})`;
        ctx.shadowBlur = 16; ctx.shadowColor = '#ff1e3c';
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff1e3c'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.55 + 0.4 * blink})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.x, c.y, R + R * 1.1 * (1 - lk), 0, Math.PI * 2); ctx.stroke();
        bdDrawBat(c.x, c.y, 26 + 10 * lk, 0.5 + 0.5 * Math.sin(lk * 20), '#1a0610', 0.95);
        if (lk > 0.5) {
            const fk = (lk - 0.5) / 0.5, dir = bdDir(p);
            const top = c.y + dir * 220 * (1 - fk);
            ctx.globalCompositeOperation = 'lighter';
            const lg = ctx.createLinearGradient(c.x, top, c.x, c.y);
            lg.addColorStop(0, 'rgba(177,77,255,0)'); lg.addColorStop(1, 'rgba(255,90,120,0.85)');
            ctx.fillStyle = lg;
            ctx.fillRect(c.x - 8, Math.min(top, c.y), 16, Math.abs(c.y - top));
        }
        ctx.restore();
        return;
    }
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, R);
    g.addColorStop(0, 'rgba(177,77,255,0.08)'); g.addColorStop(1, 'rgba(255,31,75,0.25)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]); ctx.lineDashOffset = -c.t * 0.8;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(216,180,254,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(c.x, c.y, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - c.t / c.max)); ctx.stroke();
    for (let i = 0; i < 5; i++) {
        const a = c.t * 0.04 + i * Math.PI * 2 / 5;
        bdDrawBat(c.x + Math.cos(a) * R * 0.68, c.y + Math.sin(a) * R * 0.68, 10, 0.5 + 0.5 * Math.sin(c.t * 0.3 + i), '#ff4d6d', 0.8, a + Math.PI / 2);
    }
    bdDrawBat(c.x, c.y, 18, 0.5 + 0.5 * Math.sin(c.t * 0.25), '#1a0610', 0.9);
    ctx.restore();
}

CharHooks.register('blood_lord', Object.assign(CharHooks.registry.blood_lord || {}, {
    draw() {
        // Vệt dơi khi lao
        if (this.bdMode === 'dash' && this.bdTrail && this.bdTrail.length) {
            ctx.save();
            this.bdTrail.forEach((yy, i) => {
                if (i === 0) return;
                bdDrawBat(this.x + this.w / 2, yy + this.h / 2, 24 - i * 2, 0.5, BD_RED, 0.35 - i * 0.05, this.id === 1 ? 0 : Math.PI);
            });
            ctx.restore();
        }
        if (this.bdMode === 'sky') bdDrawSkyCircle(this);
        // Đổi dạng: 2 vòng sóng màu dạng mới tỏa ra
        if (this.bdMode === 'idle' && this.bdSwitchFx > 0) {
            const q = 1 - this.bdSwitchFx / 30, cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            const col = BD_COL[this.bdForm || 0];
            ctx.save();
            ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
            ctx.globalAlpha = 1 - q; ctx.lineWidth = 3 * (1 - q) + 0.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.6 + q * 34, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = (1 - q) * 0.6;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.5 + q * 20, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    },
    drawUI() {
        if (this.bdMode !== 'idle' || typeof hudRowY !== 'function') return;
        // Thanh Bể Máu ở hàng "extra" (dưới thanh đạn)
        const max = bdPoolMax(this), frac = Math.min(1, (this.bdPool || 0) / max);
        const y = hudRowY(this, 'extra') + (this.id === 1 ? 1 : -3);
        const x = this.x - 2, w = this.w + 4;
        ctx.save();
        ctx.fillStyle = 'rgba(20,2,8,0.85)';
        ctx.fillRect(x, y, w, 2.6);
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, '#9b0a2a'); g.addColorStop(1, frac >= 0.5 ? '#ff4d6d' : '#d61f45');
        ctx.fillStyle = g;
        ctx.shadowColor = BD_RED; ctx.shadowBlur = frac >= 1 ? 8 : 3;
        ctx.fillRect(x, y, w * frac, 2.6);
        ctx.shadowBlur = 0;
        // vạch 50%
        ctx.fillStyle = '#ffd0da';
        ctx.fillRect(x + w * 0.5 - 0.4, y - 0.6, 0.8, 3.8);
        ctx.restore();
        bdDrawFormBadge(this);
    },
}));

// Huy hiệu dạng hiện tại cạnh xe: icon lớn + màu + tên; dạng kế tiếp (xem trước); vòng giữ để đổi; % hút máu
function bdDrawFormBadge(p) {
    const f = p.bdNight ? -1 : (p.bdForm || 0), nx = ((p.bdForm || 0) + 1) % 4;
    const col = f < 0 ? BD_VIOLET : BD_COL[f];
    const left = p.x > 42;
    const bx = left ? p.x - 21 : p.x + p.w + 21, by = p.y + p.h / 2;
    const pop = p.bdSwitchFx > 0 ? 1 + 0.35 * (p.bdSwitchFx / 30) : 1;
    ctx.save();
    ctx.translate(bx, by);
    const flipT = typeof hudTextFlip === 'function' && hudTextFlip(p);
    if (flipT) ctx.rotate(Math.PI);
    ctx.scale(pop, pop);
    // nền + viền màu dạng
    ctx.fillStyle = 'rgba(14,2,8,0.92)';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 8;
    ctx.stroke(); ctx.shadowBlur = 0;
    // vòng tiến độ giữ nút để đổi dạng (màu dạng kế tiếp)
    if (p.bdHoldValid && p.bdHold > 2) {
        ctx.strokeStyle = BD_COL[nx]; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, 0, 12.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.bdHold / BD_HOLD_TICKS)); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '12px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(f < 0 ? '🦇' : BD_ICON[f], 0, 0.5);
    // tên dạng
    ctx.font = 'bold 7px sans-serif'; ctx.fillStyle = col;
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.fillText(f < 0 ? 'BÓNG MA' : BD_NAME[f], 0, -15.5);
    // % hút máu (Huyết Tế)
    ctx.font = 'bold 6.5px sans-serif'; ctx.fillStyle = '#ffb3c1';
    ctx.fillText(`🩸${Math.round(bdLifesteal(p) * 100)}%`, 0, 16.5);
    ctx.shadowBlur = 0;
    // xem trước dạng kế tiếp
    if (f >= 0) {
        const px = (left ? -1 : 1) * (flipT ? -1 : 1) * 14, py = 0; // phía ngoài (xa xe)
        ctx.fillStyle = 'rgba(14,2,8,0.95)';
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = BD_COL[nx]; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = '6px sans-serif'; ctx.fillStyle = '#fff';
        ctx.fillText(BD_ICON[nx], px, py + 0.3);
    }
    ctx.restore();
}

// HUD nút Bắn: dạng bắn hiện tại + vòng Bể Máu (HUD scripts nạp sau body -> đăng ký lúc load)
function bdRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    const COL = BD_COL;
    registerEmpowerHUD('blood_lord', p => {
        const max = bdPoolMax(p), pool = p.bdPool || 0, pct = Math.min(1, pool / max);
        const pips = { pips: Math.max(0, Math.floor(p.ammo || 0)), pipMax: 6, pipColor: '#ffd0da' };
        if (p.bdMode === 'swarm' && p.bdGainLock > 0 && !p.bdTrail?.length) return Object.assign({ pct: 1, ready: false, color: BD_VIOLET, btnIcon: '🦇', label: 'ĐẠI TIỆC MÁU' }, pips);
        if (p.bdMode === 'sky') return Object.assign({ pct: 1, ready: true, color: BD_VIOLET, btnIcon: '🦇', label: 'ĐÁP ▼' }, pips);
        if (p.bdNight) return Object.assign({ pct: 1, ready: true, color: BD_VIOLET, btnIcon: '🦇', label: 'BÓNG MA MÀN ĐÊM' }, pips);
        const f = p.bdForm || 0;
        const ready = f === 3 && pct >= 0.5;
        const noHp = (f === 1 || f === 2) && !bdHpOk(p);
        const noAmmo = (p.ammo || 0) < BD_AMMO[f];
        return Object.assign({
            pct, ready, color: noHp ? '#64748b' : COL[f], btnIcon: BD_ICON[f], dim: noHp || noAmmo,
            label: noHp ? 'THIẾU MÁU' : (p.bdSwitched ? `${BD_NAME[f]} ✓ thả nút` : `${BD_NAME[f]} ▸${BD_ICON[(f + 1) % 4]} · 🩸${Math.round(bdLifesteal(p) * 100)}%`), idle: !ready,
        }, pips);
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', bdRegisterHUD);
