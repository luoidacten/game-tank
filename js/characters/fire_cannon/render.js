// ==========================================
// Pháo Lửa (fire_cannon) — Hình ảnh: art xe, đạn lửa / hỏa cầu, vùng lửa & tường lửa, lửa cháy trên địch
// Chỉ đọc state -> host & guest vẽ giống nhau.
// ==========================================

// --- Art xe (lưới -16..16, nòng hướng lên) ---
registerTankArt('fire_cannon', (p, k) => {
    const PI2 = Math.PI * 2;
    const lin = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(s => g.addColorStop(s[0], s[1])); return g; };
    const flick = (i) => 0.75 + 0.25 * Math.sin(k.t * 9 + i * 1.7);
    TA.treads(-15.5, 4, -11, 13, k.t, '#2a0d06', '#7c2d12');
    TA.treads(11.5, 4, -11, 13, k.t, '#2a0d06', '#7c2d12');
    // Evo 1: ống xả dung nham sau xe
    if (k.evo1 || k.full) {
        for (const sx of [-6, 6]) {
            ctx.fillStyle = '#3f1d0b'; TA.rr(sx - 2.5, 10, 5, 6, 1.2); ctx.fill();
            ctx.save(); TA.glow('#ff7a1a', 8);
            ctx.fillStyle = `rgba(255,${140 + 60 * flick(sx)},40,0.9)`;
            ctx.beginPath(); ctx.ellipse(sx, 16.5, 2.2, 1.6 + flick(sx) * 1.6, 0, 0, PI2); ctx.fill();
            ctx.restore();
        }
    }
    // thân lục giác thép nung
    ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(8, -12); ctx.lineTo(11.5, -6); ctx.lineTo(11.5, 10); ctx.lineTo(8, 14); ctx.lineTo(-8, 14); ctx.lineTo(-11.5, 10); ctx.lineTo(-11.5, -6); ctx.closePath();
    ctx.fillStyle = lin(0, -12, 0, 14, [[0, '#7f1d1d'], [0.5, '#451a03'], [1, '#1c0a03']]);
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.2; ctx.stroke();
    // khe dung nham phát sáng
    ctx.save(); TA.glow('#ff6a1a', 6);
    ctx.strokeStyle = `rgba(255,${110 + 80 * flick(1)},30,0.95)`; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-5, 0); ctx.lineTo(-8, 7); ctx.moveTo(9, -4); ctx.lineTo(5, 0); ctx.lineTo(8, 7); ctx.stroke();
    ctx.restore();
    // vây tản nhiệt hai bên
    ctx.fillStyle = '#9a3412';
    for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(s * 11.5, -5); ctx.lineTo(s * 15.5, -9); ctx.lineTo(s * 15.5, -4); ctx.lineTo(s * 11.5, 0); ctx.closePath(); ctx.fill();
    }
    // nòng pháo nung đỏ
    ctx.fillStyle = lin(-2.6, 0, 2.6, 0, [[0, '#431407'], [0.5, '#f97316'], [1, '#431407']]);
    TA.rr(-2.6, -14, 5.2, 12.5, 1.2); ctx.fill();
    ctx.strokeStyle = 'rgba(20,5,0,0.7)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = '#1c0a03'; TA.rr(-3.4, -15.2, 6.8, 2.4, 0.8); ctx.fill();
    // ngọn lửa nhỏ ở miệng nòng
    ctx.save(); TA.glow('#ffb020', 10);
    const fh = 2.5 + flick(3) * 2.5;
    ctx.fillStyle = 'rgba(255,190,60,0.95)';
    ctx.beginPath(); ctx.moveTo(-2.2, -15); ctx.quadraticCurveTo(0, -15 - fh * 1.6, 2.2, -15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,220,0.95)';
    ctx.beginPath(); ctx.moveTo(-1, -15); ctx.quadraticCurveTo(0, -15 - fh * 0.8, 1, -15); ctx.closePath(); ctx.fill();
    ctx.restore();
    // tháp pháo lõi magma
    ctx.beginPath(); ctx.arc(0, 2, 6.3, 0, PI2);
    const g = ctx.createRadialGradient(-1.5, 0.5, 0.5, 0, 2, 6.5);
    g.addColorStop(0, '#fff7cc'); g.addColorStop(0.35, '#fb923c'); g.addColorStop(1, '#7c2d12');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#fed7aa'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); TA.glow(k.team, 10); ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 2, 2.4, 0, PI2); ctx.fill(); ctx.restore();
    // Evo 2: vòng ấn Bạo Viêm
    if (k.evo2 || k.full) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,200,80,0.8)'; ctx.lineWidth = 0.8; ctx.setLineDash([1.5, 1.5]);
        ctx.beginPath(); ctx.arc(0, 2, 8.4, 0, PI2); ctx.stroke(); ctx.restore();
    }
    // Full Evo: vòng lửa xoay quanh tháp pháo
    if (k.full) {
        ctx.save(); ctx.translate(0, 2); ctx.rotate(k.t * 1.6); TA.glow('#ff7a1a', 8);
        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.fillStyle = i % 2 ? 'rgba(255,120,30,0.9)' : 'rgba(255,210,90,0.9)';
            ctx.beginPath(); ctx.moveTo(-1.4, -9.5); ctx.quadraticCurveTo(0, -13.5 - flick(i) * 1.5, 1.4, -9.5); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
});

// --- Đạn lửa / Hỏa Cầu ---
function fcDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const r = Math.max(3, b.w / 2);
    const dir = b.vy < 0 ? 1 : -1; // đuôi lửa phía sau đạn
    const t = Date.now() / 50;
    ctx.save();
    // đuôi lửa
    const tail = r * (b.fcBig ? 5 : 4);
    const g = ctx.createLinearGradient(cx, cy, cx, cy + dir * tail);
    g.addColorStop(0, 'rgba(255,170,40,0.85)'); g.addColorStop(0.5, 'rgba(255,70,20,0.45)'); g.addColorStop(1, 'rgba(120,20,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx - r * 0.95, cy); ctx.quadraticCurveTo(cx + Math.sin(t) * r * 0.5, cy + dir * tail * 0.7, cx, cy + dir * tail); ctx.quadraticCurveTo(cx - Math.sin(t) * r * 0.5, cy + dir * tail * 0.7, cx + r * 0.95, cy); ctx.closePath(); ctx.fill();
    // thân
    ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = b.fcBig ? 20 : 12;
    const rg = ctx.createRadialGradient(cx, cy - dir * r * 0.2, 0, cx, cy, r * 1.15);
    rg.addColorStop(0, '#fffbe6'); rg.addColorStop(0.4, '#ffc24a'); rg.addColorStop(0.8, '#ff5a14'); rg.addColorStop(1, 'rgba(180,30,0,0.2)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2); ctx.fill();
    if (b.fcBig) {
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,230,150,0.8)'; ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) { const a = t * 0.3 + i * 1.2566; ctx.moveTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3); ctx.lineTo(cx + Math.cos(a) * r * 1.7, cy + Math.sin(a) * r * 1.7); }
        ctx.stroke();
    }
    ctx.restore();
}

// --- Vùng lửa / Tường lửa ---
function fcDrawZone(z) {
    const hw = z.hw * z.grow, hh = z.hh;
    const fade = Math.min(1, z.life / 30);
    const t = z.t;
    ctx.save();
    ctx.globalAlpha = fade;
    // nền than hồng
    const g = ctx.createLinearGradient(z.x, z.y - hh, z.x, z.y + hh);
    g.addColorStop(0, 'rgba(255,90,20,0.16)'); g.addColorStop(0.5, z.wall ? 'rgba(255,110,20,0.5)' : 'rgba(255,90,20,0.4)'); g.addColorStop(1, 'rgba(255,90,20,0.10)');
    ctx.fillStyle = g;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(z.x - hw, z.y - hh, hw * 2, hh * 2, 10); else ctx.rect(z.x - hw, z.y - hh, hw * 2, hh * 2);
    ctx.fill();
    ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 10;
    ctx.strokeStyle = z.wall ? '#ffb020' : '#ff6a1a'; ctx.lineWidth = z.wall ? 2.2 : 1.5;
    ctx.setLineDash(z.wall ? [] : [6, 4]); ctx.lineDashOffset = -t * 0.6;
    ctx.stroke(); ctx.setLineDash([]);
    // lưỡi lửa nhảy múa
    const n = Math.max(3, Math.round(hw / 9));
    for (let i = 0; i < n; i++) {
        const fx = z.x - hw + (i + 0.5) * (hw * 2 / n);
        const ph = Math.sin(t * 0.25 + i * 2.1) * 0.5 + 0.5;
        const fh = (z.wall ? 20 : 12) * (0.55 + ph * 0.6);
        const base = z.y + hh * 0.35;
        ctx.fillStyle = `rgba(255,${90 + Math.floor(ph * 110)},30,0.85)`;
        ctx.beginPath(); ctx.moveTo(fx - 4, base); ctx.quadraticCurveTo(fx + Math.sin(t * 0.3 + i) * 3, base - fh * 1.2, fx, base - fh); ctx.quadraticCurveTo(fx + 1, base - fh * 0.5, fx + 4, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,170,0.8)';
        ctx.beginPath(); ctx.moveTo(fx - 1.6, base); ctx.quadraticCurveTo(fx, base - fh * 0.6, fx + 1.6, base); ctx.closePath(); ctx.fill();
    }
    // tàn lửa bay lên
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,200,90,0.9)';
    for (let i = 0; i < n; i++) {
        const f = ((t * 1.3 + i * 37) % 60) / 60;
        const ex = z.x - hw + ((i * 53 + 17) % 100) / 100 * hw * 2 + Math.sin(t * 0.1 + i) * 3;
        ctx.globalAlpha = fade * (1 - f);
        ctx.fillRect(ex, z.y + hh * 0.3 - f * (hh * 2 + 10), 1.6, 1.6);
    }
    ctx.restore();
}

Object.assign(CharHooks.registry.fire_cannon, {
    draw() {
        // Lửa cháy trên người đối thủ đang bị Đốt
        const e = fcEnemyOf(this);
        if (!e || !(e.fcBurnT > 0) || !(e.burnTimer > 0) || e.fcBurnOwner !== this.id || e.hp <= 0) return;
        const st = Math.max(1, e.fcBurnSt || 1), t = Date.now() / 60;
        ctx.save();
        ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 10;
        const cx = e.x + e.w / 2, top = e.id === 1 ? e.y + 4 : e.y + e.h - 4, up = e.id === 1 ? -1 : 1;
        for (let i = 0; i < 2 + st * 2; i++) {
            const fx = e.x + 4 + ((i * 41) % 100) / 100 * (e.w - 8);
            const ph = Math.sin(t * 0.9 + i * 1.9) * 0.5 + 0.5;
            const fh = (7 + st * 3) * (0.6 + ph * 0.5);
            ctx.fillStyle = `rgba(255,${100 + Math.floor(ph * 100)},30,0.8)`;
            ctx.beginPath(); ctx.moveTo(fx - 3, top); ctx.quadraticCurveTo(fx, top + up * fh * 1.3, fx + 3, top); ctx.closePath(); ctx.fill();
        }
        if (this.hasUpgrade('evo_fc_2')) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffd166'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
            ctx.textAlign = 'left'; ctx.fillText('🔥x' + st, e.x + e.w + 4, e.y + e.h / 2 + 4);
        }
        ctx.restore();
    },
    drawUI() {
        // 3 chấm: phát thứ 3 là Hỏa Cầu
        const k = (this.fcShots || 0) % 3;
        // cột dọc bên trái xe, chấm thứ 3 (Hỏa Cầu) ở phía trước
        const x = this.x - 7, dir = this.id === 1 ? -1 : 1;
        const y0 = this.y + this.h / 2 - dir * 10;
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const on = i < k;
            ctx.fillStyle = on ? '#ff7a1a' : (i === 2 ? 'rgba(120,50,10,0.85)' : 'rgba(80,30,10,0.75)');
            if (on) { ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 6; } else ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(x, y0 + dir * i * 10, i === 2 ? 3 : 2.3, 0, Math.PI * 2); ctx.fill();
        }
        if (k === 2) {
            ctx.shadowColor = '#ffb020'; ctx.shadowBlur = 8; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(x, y0 + dir * 20, 4.5 + Math.sin(Date.now() / 120), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
});
