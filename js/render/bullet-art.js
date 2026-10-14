// ==========================================
// Hình ảnh đạn (vẽ theo loại, hướng theo vận tốc)
// ------------------------------------------
// Dùng cho đạn "mặc định" của mọi body (đạn có kiểu riêng như kiếm, sét, sóng âm... vẫn tự vẽ).
// Chỉ dùng hình học + gradient nhẹ, không lưu trạng thái -> chạy giống nhau ở host & guest.
// ==========================================

function bulletKind(b, owner) {
    if (b.type === 'cannonball' || b.isCannonball) return 'cannon';
    if (b.isRocket) return 'rocket';
    if (b.type === 'purple') return 'purple';
    if (b.isAmChu || b.isDuongChu) return 'taiji';
    if (b.isIce) return 'ice';
    if (b.isExplosive) return 'explosive';
    if (b.type === 'shortgun_pellet' || b.isShortgun) return 'pellet';
    if (b.isRaycast || b.isSniperBullet) return 'sniper';
    if (owner && owner.weapon === 'lazer_auto') return 'laser';
    if (b.isPiercing) return 'pierce';
    return 'normal';
}

function drawBulletArt(b, color, owner) {
    const kind = bulletKind(b, owner);
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const vx = b.vx || 0, vy = b.vy || 0;
    const sp = Math.hypot(vx, vy) || 1;
    const ang = Math.atan2(vy, vx);
    const r = Math.max(2, Math.min(b.w, b.h) / 2);
    const t = Date.now();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    const tail = Math.min(46, 6 + sp * 3.2);

    if (kind === 'normal' || kind === 'pellet') {
        // Sao chổi: đuôi gradient + đầu sáng lõi trắng
        const L = kind === 'pellet' ? tail * 0.6 : tail;
        const g = ctx.createLinearGradient(-L, 0, 0, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, color);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -r * 0.9); ctx.lineTo(0, r * 0.9); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(r * 0.2, 0, r * 0.6, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'laser' || kind === 'sniper') {
        // Tia laser: thanh dài bo tròn, lõi trắng
        const L = Math.max(b.h, b.w, kind === 'sniper' ? 26 : 16);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 14; ctx.shadowColor = color;
        ctx.strokeStyle = color; ctx.lineWidth = r * 2.2;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.2, r * 0.8);
        ctx.beginPath(); ctx.moveTo(-L * 0.8, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
    } else if (kind === 'pierce') {
        // Mũi nhọn xuyên giáp
        const L = Math.max(10, r * 4);
        ctx.shadowBlur = 12; ctx.shadowColor = color;
        const g = ctx.createLinearGradient(-L - tail * 0.5, 0, L, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, color); g.addColorStop(1, '#ffffff');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, -r * 1.1); ctx.lineTo(-L - tail * 0.5, 0); ctx.lineTo(0, r * 1.1); ctx.closePath(); ctx.fill();
    } else if (kind === 'explosive') {
        // Quả cầu năng lượng đỏ nhấp nháy + vòng cảnh báo
        const pulse = 1 + Math.sin(t / 60) * 0.18;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2 * pulse);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#ffb199'); g.addColorStop(0.7, color); g.addColorStop(1, 'rgba(255,60,60,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, r * 2 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,220,200,0.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, r * 2.4, t / 120, t / 120 + 4); ctx.stroke();
    } else if (kind === 'ice') {
        // Tinh thể băng
        ctx.shadowBlur = 10; ctx.shadowColor = '#7df9ff';
        ctx.fillStyle = 'rgba(180, 250, 255, 0.95)';
        ctx.beginPath(); ctx.moveTo(r * 2.2, 0); ctx.lineTo(0, -r * 1.2); ctx.lineTo(-r * 1.6, 0); ctx.lineTo(0, r * 1.2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(r * 2.2, 0); ctx.lineTo(-r * 1.6, 0); ctx.moveTo(0, -r * 1.2); ctx.lineTo(0, r * 1.2); ctx.stroke();
        ctx.fillStyle = 'rgba(200,255,255,0.6)';
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(-r * 1.6 - i * 5, Math.sin(t / 90 + i) * 3, 1.2, 0, Math.PI * 2); ctx.fill(); }
    } else if (kind === 'rocket') {
        // Tên lửa: thân, mũi, cánh, lửa đuôi
        const L = Math.max(12, b.h, b.w) * 0.9;
        const flame = 6 + Math.random() * 6 + sp;
        const fg = ctx.createLinearGradient(-L / 2 - flame, 0, -L / 2, 0);
        fg.addColorStop(0, 'rgba(255,200,0,0)'); fg.addColorStop(0.5, 'rgba(255,140,0,0.8)'); fg.addColorStop(1, '#fff3b0');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.moveTo(-L / 2 - flame, 0); ctx.lineTo(-L / 2, -r); ctx.lineTo(-L / 2, r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(-L / 2, -r * 0.8, L * 0.75, r * 1.6);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(L * 0.25, -r * 0.8); ctx.lineTo(L / 2 + 3, 0); ctx.lineTo(L * 0.25, r * 0.8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-L / 2, -r * 0.8); ctx.lineTo(-L / 2 - 3, -r * 1.7); ctx.lineTo(-L / 4, -r * 0.8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-L / 2, r * 0.8); ctx.lineTo(-L / 2 - 3, r * 1.7); ctx.lineTo(-L / 4, r * 0.8); ctx.closePath(); ctx.fill();
    } else if (kind === 'cannon') {
        // Đạn pháo: khối cầu thép + vệt khói
        ctx.fillStyle = 'rgba(160,160,160,0.25)';
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(-i * r * 1.3, Math.sin(t / 100 + i) * 2, r * (1 - i * 0.2), 0, Math.PI * 2); ctx.fill(); }
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.2, 0, 0, r * 1.2);
        g.addColorStop(0, '#9ca3af'); g.addColorStop(1, '#111827');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'purple') {
        // Hư Thức Tử: cầu tím xoáy đỏ-xanh
        const R = r * 1.3;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.6);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#c084fc'); g.addColorStop(0.75, '#6d28d9'); g.addColorStop(1, 'rgba(76,29,149,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(248,113,113,0.8)'; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, t / 80, t / 80 + 2.2); ctx.stroke();
        ctx.strokeStyle = 'rgba(96,165,250,0.8)'; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, t / 80 + Math.PI, t / 80 + Math.PI + 2.2); ctx.stroke();
    } else if (kind === 'taiji') {
        // Âm (đen) / Dương (vàng): bùa xoay
        ctx.rotate(t / 150);
        ctx.fillStyle = b.isAmChu ? '#111827' : '#facc15';
        ctx.strokeStyle = b.isAmChu ? '#a5b4fc' : '#fff7ae'; ctx.lineWidth = 1.2;
        ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
        const R = Math.max(6, r * 1.6);
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // nửa lưỡi liềm âm dương + chấm mắt
        ctx.fillStyle = b.isAmChu ? '#a5b4fc' : '#92400e';
        ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); ctx.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); ctx.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false); ctx.fill();
        ctx.fillStyle = b.isAmChu ? '#111827' : '#facc15';
        ctx.beginPath(); ctx.arc(0, -R / 2, R * 0.16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
