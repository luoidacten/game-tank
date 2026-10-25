// ==========================================
// Siêu Năng (psychokinesis) — Hình ảnh: xe lơ lửng (đệm phản trọng lực thay xích) với lõi não tím-cyan, hào quang
// xanh lơ; Đạn Niệm Lực, đạn bắt giữ (hào quang cyan + nhấp nhô), Vùng Niệm Lực, đường ngắm Khoá Tâm, HUD,
// kết liễu "TÂM NIỆM NGHIỀN NÁT". Chỉ đọc state -> an toàn online.
// ==========================================

function psyNow() { return Date.now() / 1000; }

// ---------- Xe ----------
registerTankArt('psychokinesis', (p, k) => {
    const t = k.t, on = (p.psyField || 0) > 0 || (p.psyLockT || 0) > 0;
    const bob = Math.sin(t * 3) * 0.9;
    ctx.save(); ctx.translate(0, bob);
    // bóng đổ dưới đất (xe lơ lửng)
    ctx.fillStyle = 'rgba(0, 242, 255, 0.12)';
    ctx.beginPath(); ctx.ellipse(0, 2 - bob, 15, 13, 0, 0, Math.PI * 2); ctx.fill();
    // 2 đệm phản trọng lực
    for (const sx of [-12.5, 12.5]) {
        const g = ctx.createLinearGradient(sx - 3, 0, sx + 3, 0);
        g.addColorStop(0, '#0b1324'); g.addColorStop(0.5, '#1e293b'); g.addColorStop(1, '#0b1324');
        ctx.fillStyle = g; TA.rr(sx - 3, -11, 6, 22, 3); ctx.fill();
        ctx.fillStyle = `rgba(0, 242, 255, ${0.55 + 0.35 * Math.sin(t * 8 + sx)})`; TA.glow(PSY_CYAN, 8);
        for (let i = 0; i < 3; i++) { TA.rr(sx - 1.6, -8 + i * 6.5, 3.2, 3, 1.2); ctx.fill(); }
        TA.noGlow();
    }
    // thân bát giác tím than
    ctx.fillStyle = TA.metal(-10, 10, '#1e1b4b', '#4c1d95');
    ctx.beginPath(); ctx.moveTo(-6, -11); ctx.lineTo(6, -11); ctx.lineTo(10, -6); ctx.lineTo(10, 7); ctx.lineTo(6, 11); ctx.lineTo(-6, 11); ctx.lineTo(-10, 7); ctx.lineTo(-10, -6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // mạch thần kinh
    ctx.strokeStyle = 'rgba(165, 243, 252, 0.45)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-4, 2); ctx.lineTo(-4, -4); ctx.moveTo(8, 6); ctx.lineTo(4, 2); ctx.lineTo(4, -4); ctx.moveTo(0, 6); ctx.lineTo(0, 10); ctx.stroke();
    // lõi não / mắt thứ ba
    const pulse = 0.5 + 0.5 * Math.sin(t * (on ? 12 : 4));
    const core = ctx.createRadialGradient(0, -1, 0.5, 0, -1, 7);
    core.addColorStop(0, '#ffffff'); core.addColorStop(0.35, PSY_CYAN); core.addColorStop(0.75, k.full ? PSY_VIO : '#0e7490'); core.addColorStop(1, 'rgba(14, 116, 144, 0)');
    TA.glow(PSY_CYAN, 10 + pulse * 8);
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, -1, 6.5, 0, Math.PI * 2); ctx.fill();
    TA.noGlow();
    ctx.fillStyle = '#0b1324'; ctx.beginPath(); ctx.ellipse(0, -1, 1.2, 2.6 - pulse, 0, 0, Math.PI * 2); ctx.fill();
    // 3 mảnh vỡ quay quanh lõi (telekinesis)
    ctx.save(); ctx.rotate(t * (on ? 4 : 1.6));
    for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.fillStyle = i === 0 && k.evo1 ? PSY_VIO : PSY_SOFT; TA.glow(PSY_CYAN, 5);
        ctx.beginPath(); ctx.moveTo(0, -9.5); ctx.lineTo(1.6, -8); ctx.lineTo(0, -6.8); ctx.lineTo(-1.6, -8); ctx.closePath(); ctx.fill();
    }
    TA.noGlow(); ctx.restore();
    // đầu phát mũi xe
    ctx.fillStyle = '#0e7490'; TA.rr(-3, -14.5, 6, 4, 1.5); ctx.fill();
    ctx.fillStyle = PSY_CYAN; TA.glow(PSY_CYAN, 6); TA.rr(-1.5, -15.5, 3, 2, 1); ctx.fill(); TA.noGlow();
    if (k.evo2) { ctx.strokeStyle = 'rgba(167, 139, 250, 0.7)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, -1, 9.5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    // hào quang cyan
    ctx.strokeStyle = `rgba(0, 242, 255, ${(on ? 0.55 : 0.25) + 0.2 * pulse})`; ctx.lineWidth = on ? 1.6 : 1; TA.glow(PSY_CYAN, on ? 14 : 8);
    ctx.beginPath(); ctx.arc(0, 0, 15.5, t * 1.5, t * 1.5 + Math.PI * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 15.5, t * 1.5 + Math.PI, t * 1.5 + Math.PI * 1.8); ctx.stroke();
    TA.noGlow();
    ctx.restore();
});

// ---------- Đạn Niệm Lực ----------
function psyDrawOrb(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = psyNow();
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    ctx.save();
    if (b.psyGo && sp > 5 && !b.psyCap) { // vệt sáng dài khi phóng
        const ux = b.vx / sp, uy = b.vy / sp;
        const g = ctx.createLinearGradient(cx, cy, cx - ux * 46, cy - uy * 46);
        g.addColorStop(0, 'rgba(0, 242, 255, 0.85)'); g.addColorStop(1, 'rgba(0, 242, 255, 0)');
        ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - ux * 46, cy - uy * 46); ctx.stroke();
    }
    const hover = b.psyT > 0 || b.psyCap > 0;
    const a = hover ? (b.psyAim !== undefined ? b.psyAim : Math.atan2(b.vy || -1, b.vx || 0)) : Math.atan2(b.vy, b.vx);
    // hào quang
    const R = 9 + (hover ? Math.sin(t * 10 + (b.psyPh || 0)) * 1.5 : 0);
    const gl = ctx.createRadialGradient(cx, cy, 1, cx, cy, R);
    gl.addColorStop(0, 'rgba(0, 242, 255, 0.55)'); gl.addColorStop(1, 'rgba(0, 242, 255, 0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // mảnh tinh thể nhọn
    ctx.translate(cx, cy); ctx.rotate(a);
    ctx.shadowBlur = 12; ctx.shadowColor = PSY_CYAN;
    ctx.fillStyle = '#e0fdff';
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(0, 3.2); ctx.lineTo(-5, 0); ctx.lineTo(0, -3.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PSY_CYAN; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(0, 1.6); ctx.lineTo(-2.5, 0); ctx.lineTo(0, -1.6); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (b.psyCap > 0) psyDrawAura(b, cx, cy);
}

// Hào quang xanh lơ quanh đạn bị bắt
function psyDrawAura(b, cx, cy) {
    const t = psyNow(), r = Math.max(6, Math.max(b.w || 6, b.h || 6) * 0.75 + 3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = b.psyCap === 3 ? PSY_VIO : PSY_CYAN; ctx.lineWidth = 1.4; ctx.shadowBlur = 10; ctx.shadowColor = PSY_CYAN;
    ctx.globalAlpha = 0.65 + 0.3 * Math.sin(t * 9 + (b.psyPh || 0));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    const a0 = t * 3 + (b.psyPh || 0);
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, a0, a0 + 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, a0 + Math.PI, a0 + Math.PI + 1.2); ctx.stroke();
    ctx.restore();
}

// Đạn địch bị bắt giữ: vẽ bằng hình gốc (hook gốc / art body gốc) + hào quang cyan
function psyDrawCap(b) {
    const cx = b.x + (b.w || 6) / 2, cy = b.y + (b.h || 6) / 2;
    const oo = b.psyOId === 1 ? p1 : (b.psyOId === 2 ? p2 : null);
    const svx = b.vx, svy = b.vy;
    if (b.psyCap > 0 && !b.vx && !b.vy) { b.vx = (b.psyOVx || 0) * 1e-3; b.vy = (b.psyOVy || 0) * 1e-3; } // giữ hướng mũi đạn khi đứng yên
    try {
        if (b.psyBomb) {
            ctx.save(); ctx.fillStyle = '#334155'; ctx.strokeStyle = PSY_CYAN; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.arc(cx + 3, cy - 4, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else if (b.psyHs || b.psyEnv === 'ent') {
            // Đạn Năng Lượng (tia bị chặn) / đạn thực thể bị bắt: lõi sáng + vòng xoáy
            const hs = !!b.psyHs, r = hs ? 4 + Math.min(3, b.dmg || 1) * 1.6 : Math.max(4, (b.w || 8) / 2), t = Date.now() / 1000;
            const col = hs ? PSY_VIO : PSY_CYAN;
            ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = col;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, hs ? '#ddd6fe' : '#a5f3fc'); g.addColorStop(1, hs ? 'rgba(167,139,250,0.15)' : 'rgba(0,242,255,0.15)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = col; ctx.lineWidth = 1.3;
            for (let k = 0; k < 2; k++) { const a0 = t * 6 + k * Math.PI; ctx.beginPath(); ctx.arc(cx, cy, r + 3, a0, a0 + 1.6); ctx.stroke(); }
            ctx.restore();
        } else if (b.psyEnv) {
            // đạn môi trường (Xe Tấn Công / Thùng Đạn) bị bắt
            const r = b.psyEnv === 'shell' ? 6 : (b.psyEnv === 'smg' ? 3 : 3.2);
            ctx.save(); ctx.fillStyle = b.psyEnv === 'smg' ? '#ff4d4d' : '#ffb347'; ctx.strokeStyle = '#7a3a00'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else {
            const h = b.psyOH && BulletHooks.registry[b.psyOH];
            if (h && h.draw) { const hk = b.hook; b.hook = b.psyOH; try { h.draw(b); } finally { b.hook = hk; } }
            else if (typeof drawBulletArt === 'function' && oo) drawBulletArt(b, oo.id === 1 ? '#3498db' : '#e74c3c', oo);
            else { ctx.fillStyle = '#e0fdff'; ctx.fillRect(b.x, b.y, b.w || 6, b.h || 6); }
        }
    } catch (err) { }
    b.vx = svx; b.vy = svy;
    if (b.psyCap > 0) psyDrawAura(b, cx, cy);
    else if (b.psyRel && Math.hypot(b.vx, b.vy) > 1) { // vệt cyan khi phóng trả
        const sp = Math.hypot(b.vx, b.vy), ux = b.vx / sp, uy = b.vy / sp;
        ctx.save(); ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.shadowBlur = 8; ctx.shadowColor = PSY_CYAN;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - ux * 22, cy - uy * 22); ctx.stroke(); ctx.restore();
    }
}

// ---------- Sóng giải phóng ----------
function psyDrawWave(f) {
    const k = f.t / f.dur;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.kind ? PSY_VIO : PSY_CYAN; ctx.lineWidth = 3 * (1 - k) + 1; ctx.shadowBlur = 16; ctx.shadowColor = PSY_CYAN;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.4 + 0.8 * k), 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.2 + 0.6 * k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

// ---------- Quanh xe: Vùng Niệm Lực, đường ngắm ----------
Object.assign(CharHooks.registry.psychokinesis, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = psyNow();
        const on = (this.psyField || 0) > 0 || (this.psyLockT || 0) > 0;
        ctx.save();
        if (on) {
            const R = psyR(this), k = this.psyLockT > 0 ? 0.6 : 1;
            const g = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
            g.addColorStop(0, 'rgba(0, 242, 255, 0.02)'); g.addColorStop(0.75, `rgba(0, 242, 255, ${0.07 * k})`); g.addColorStop(1, `rgba(0, 242, 255, ${0.2 * k})`);
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
            // viền + gợn sóng
            ctx.strokeStyle = `rgba(0, 242, 255, ${0.55 * k + 0.2 * Math.sin(t * 6)})`; ctx.lineWidth = 2; ctx.shadowBlur = 14; ctx.shadowColor = PSY_CYAN;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1; ctx.setLineDash([4, 10]); ctx.lineDashOffset = -t * 30;
            ctx.strokeStyle = `rgba(165, 243, 252, ${0.35 * k})`;
            ctx.beginPath(); ctx.arc(cx, cy, R - 12, 0, Math.PI * 2); ctx.stroke();
            ctx.lineDashOffset = t * 20; ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 * k})`;
            ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            for (let i = 0; i < 3; i++) { // sóng lan
                const q = ((t * 0.8 + i / 3) % 1);
                ctx.strokeStyle = `rgba(0, 242, 255, ${0.25 * (1 - q) * k})`;
                ctx.beginPath(); ctx.arc(cx, cy, R * q, 0, Math.PI * 2); ctx.stroke();
            }
            // thanh thời gian vùng
            if (this.psyField > 0 && !(this.psyLockT > 0)) {
                const tk = this.psyField / Math.max(1, this.psyFieldMax);
                ctx.strokeStyle = '#e0fdff'; ctx.lineWidth = 2.5; ctx.shadowBlur = 8; ctx.shadowColor = PSY_CYAN;
                ctx.beginPath(); ctx.arc(cx, cy, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * tk); ctx.stroke();
                ctx.shadowBlur = 0;
            }
            // dây niệm lực tới từng viên đang giữ
            ctx.lineWidth = 0.8;
            for (const b of this.bullets) {
                if (!(b.psyCap > 0)) continue;
                const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
                ctx.strokeStyle = 'rgba(0, 242, 255, 0.16)';
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo((cx + bx) / 2 + Math.sin(t * 3 + by) * 10, (cy + by) / 2, bx, by); ctx.stroke();
            }
        }
        // đường chỉ tâm khoá mục tiêu
        if (this.psyLockT > 0) {
            const e = this.id === 1 ? p2 : p1;
            const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
            ctx.setLineDash([5, 6]); ctx.lineDashOffset = -t * 60;
            for (const b of this.bullets) {
                if (b.psyCap !== 3) continue;
                const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
                ctx.strokeStyle = `rgba(167, 139, 250, ${0.25 + 0.2 * Math.sin(t * 20)})`; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.strokeStyle = PSY_VIO; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = PSY_VIO;
            const rr = 20 + Math.sin(t * 14) * 3;
            ctx.beginPath(); ctx.arc(ex, ey, rr, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex - rr - 6, ey); ctx.lineTo(ex - rr + 6, ey); ctx.moveTo(ex + rr - 6, ey); ctx.lineTo(ex + rr + 6, ey);
            ctx.moveTo(ex, ey - rr - 6); ctx.lineTo(ex, ey - rr + 6); ctx.moveTo(ex, ey + rr - 6); ctx.lineTo(ex, ey + rr + 6); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Evo 2: chặn tia ở rìa vùng
        if (this.psyHsFx > 0) {
            const q = this.psyHsFx / 14, ex = this.psyHsX, ey = this.psyHsY;
            ctx.strokeStyle = `rgba(196, 181, 253, ${q})`; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = PSY_VIO;
            const a = Math.atan2(ey - cy, ex - cx), R = psyR(this);
            ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, a - 0.35, a + 0.35); ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${q})`; ctx.beginPath(); ctx.arc(ex, ey, 3 + 6 * (1 - q), 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
        // tụ lực khi giữ nút
        if (this.psyPrevS && !this.psyUsed && this.psyHold > 8) {
            const N = this.psyField > 0 ? psyLockN(this) : PSY_HOLD, kk = Math.min(1, this.psyHold / N);
            ctx.strokeStyle = this.psyField > 0 ? PSY_VIO : PSY_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = PSY_CYAN;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kk); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        if (this.psyPushFx > 0) {
            const q = 1 - this.psyPushFx / 10;
            ctx.strokeStyle = `rgba(0, 242, 255, ${1 - q})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + q * 0.6), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudExtraBar !== 'function') return;
        if (this.psyField > 0 && !(this.psyLockT > 0)) hudExtraBar(this, 0, this.psyField / Math.max(1, this.psyFieldMax), PSY_CYAN, { h: 2 });
        else if (this.psyCd > 0) hudExtraBar(this, 0, 1 - this.psyCd / Math.max(1, this.psyCdMax), '#64748b', { h: 2 });
    },
});

// ---------- Kết liễu "TÂM NIỆM NGHIỀN NÁT" ----------
function psyDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 125 ? Math.max(0, 1 - (t - 125) / 25) : 1;
    ctx.save();
    // màn hình phủ ánh xanh lơ
    ctx.fillStyle = `rgba(0, 30, 40, ${Math.min(0.5, t / 16 * 0.5) * fade})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.fillStyle = `rgba(0, 242, 255, ${(0.06 + 0.04 * Math.sin(t * 0.5)) * fade})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // xác xe bị nhấc bổng (0-60), bóp nghẹt (60-92), nổ tung (92+)
    const lift = Math.min(1, t / 60), ly = f.y - 40 * (1 - Math.pow(1 - lift, 3));
    if (t < 92) {
        const sq = t < 60 ? 1 : 1 - (t - 60) / 32 * 0.65;
        const jit = t >= 60 ? (Math.random() - 0.5) * 3 : 0;
        ctx.save(); ctx.translate(f.x + jit, ly + jit); ctx.rotate(Math.sin(t * 0.15) * 0.25);
        ctx.scale(sq, sq * (t >= 60 ? 0.9 + 0.1 * Math.sin(t) : 1));
        ctx.fillStyle = '#1f2937'; ctx.strokeStyle = PSY_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 18; ctx.shadowColor = PSY_CYAN;
        TA.rr(-f.vw / 2, -f.vh / 2, f.vw, f.vh, 4); ctx.fill(); ctx.stroke();
        ctx.restore();
        // vòng bóp nghẹt
        const r = t < 60 ? 46 - lift * 10 : 36 - (t - 60) / 32 * 24;
        ctx.strokeStyle = `rgba(0, 242, 255, 0.85)`; ctx.lineWidth = 2.5; ctx.shadowBlur = 14; ctx.shadowColor = PSY_CYAN;
        for (let i = 0; i < 3; i++) { const a0 = t * 0.2 * (i % 2 ? -1 : 1) + i * 2; ctx.beginPath(); ctx.arc(f.x, ly, r + i * 6, a0, a0 + Math.PI * 1.3); ctx.stroke(); }
        ctx.shadowBlur = 0;
        // dây niệm lực từ Siêu Năng
        ctx.strokeStyle = 'rgba(165, 243, 252, 0.4)'; ctx.lineWidth = 1.2;
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.quadraticCurveTo((f.ox + f.x) / 2 + i * 60, (f.oy + ly) / 2, f.x, ly); ctx.stroke(); }
    } else {
        // hàng trăm mảnh vụn
        const k = Math.min(1, (t - 92) / 50);
        for (let i = 0; i < 90; i++) {
            const a = i * 2.399, sp = 30 + (i * 37 % 100) * 1.4;
            const x = f.x + Math.cos(a) * sp * k, y = ly + Math.sin(a) * sp * k + k * k * 40;
            ctx.save(); ctx.globalAlpha = (1 - k) * fade; ctx.translate(x, y); ctx.rotate(a + k * 6);
            ctx.fillStyle = i % 3 ? '#334155' : PSY_CYAN;
            const s = 1.5 + (i % 4);
            ctx.fillRect(-s / 2, -s / 2, s, s * 0.7);
            ctx.restore();
        }
        ctx.globalAlpha = (1 - k) * fade; ctx.strokeStyle = '#e0fdff'; ctx.lineWidth = 4 * (1 - k) + 1; ctx.shadowBlur = 20; ctx.shadowColor = PSY_CYAN;
        ctx.beginPath(); ctx.arc(f.x, ly, 20 + k * 120, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    ctx.restore();
    // chữ
    if (t >= 8 && t < 140) {
        const a = Math.min(1, (t - 8) / 8) * fade;
        const cxv = typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active ? fatalCinematic.victimY : H / 2;
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(cxv, cyv - 120);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = 1 + Math.max(0, 1 - (t - 8) / 8) * 0.4; ctx.scale(sc, sc);
        ctx.font = "900 22px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#082f49';
        ctx.fillStyle = '#e0fdff'; ctx.shadowBlur = 18; ctx.shadowColor = PSY_CYAN;
        ctx.strokeText('TÂM NIỆM NGHIỀN NÁT', 0, 0); ctx.fillText('TÂM NIỆM NGHIỀN NÁT', 0, 0);
        ctx.restore();
    }
}
function psyFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof PsyFinisher && e.active) e.drawOver();
}

function psyRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('psychokinesis', p => {
        const seg = { segments: p.maxAmmo || 6, lit: p.ammo || 0 };
        if (p.psyLockT > 0) return Object.assign({ pct: 1, ready: true, color: PSY_VIO, label: 'KHOÁ TÂM!', btnIcon: '🎯' }, seg);
        if (p.psyField > 0) {
            const n = (p.bullets || []).filter(b => b.psyCap > 0).length;
            if (p.psyPrevS && !p.psyUsed && p.psyHold > 6) return Object.assign({ pct: Math.min(1, p.psyHold / psyLockN(p)), ready: false, color: PSY_VIO, label: 'KHOÁ TÂM...', btnIcon: '🎯' }, seg);
            return Object.assign({ pct: p.psyField / Math.max(1, p.psyFieldMax), ready: true, color: PSY_CYAN, label: 'NHẤP: PHẢN x' + n, btnIcon: '🌀' }, seg);
        }
        if (p.psyPrevS && !p.psyUsed && p.psyHold > 8 && !(p.psyCd > 0)) return Object.assign({ pct: Math.min(1, p.psyHold / PSY_HOLD), ready: false, color: PSY_CYAN, label: 'VÙNG NIỆM LỰC...', btnIcon: '🧠' }, seg);
        if (p.psyCd > 0) return Object.assign({ pct: 1 - p.psyCd / Math.max(1, p.psyCdMax), ready: false, color: '#64748b', label: 'VÙNG ' + Math.ceil(p.psyCd / 60) + 's', btnIcon: '🧠', dim: true }, seg);
        return Object.assign({ pct: 1, ready: true, color: PSY_CYAN, label: 'GIỮ: VÙNG NIỆM LỰC', btnIcon: '🧠' }, seg);
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', psyRegisterHUD);
