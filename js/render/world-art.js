// ==========================================
// Hình ảnh Thùng tiếp tế, Xe Tiền, Xe Tiền Tấn Công (chỉ vẽ, không đổi logic)
// Ghi đè phương thức draw() của các class trong js/entities/world.js và money_tank/logic.js
// ==========================================

const CRATE_STYLE = {
    coin:    { c: '#facc15', icon: 'coin' },
    hp:      { c: '#22c55e', icon: 'cross' },
    ammo:    { c: '#fb923c', icon: 'ammo' },
    shield:  { c: '#38bdf8', icon: 'shield' },
    dmg:     { c: '#c084fc', icon: 'sword' },
    boom:    { c: '#ef4444', icon: 'boom' },
    gear:    { c: '#2dd4bf', icon: 'gear' },
    bullets: { c: '#ff9f1a', icon: 'burst' },
};

function roundRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Biểu tượng vector trong tâm (0,0), bán kính ~s
function drawCrateIcon(icon, s, col) {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (icon === 'coin') {
        ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7c5800'; ctx.font = `bold ${Math.round(s * 1.5)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1); ctx.textBaseline = 'alphabetic';
    } else if (icon === 'cross') {
        const a = s * 0.38;
        ctx.fillRect(-a, -s, a * 2, s * 2); ctx.fillRect(-s, -a, s * 2, a * 2);
    } else if (icon === 'ammo') {
        for (let i = -1; i <= 1; i++) {
            const x = i * s * 0.65;
            ctx.fillRect(x - s * 0.22, -s * 0.35, s * 0.44, s * 1.25);
            ctx.beginPath(); ctx.moveTo(x - s * 0.22, -s * 0.35); ctx.lineTo(x, -s); ctx.lineTo(x + s * 0.22, -s * 0.35); ctx.fill();
        }
    } else if (icon === 'shield') {
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, -s * 0.6); ctx.lineTo(s * 0.75, s * 0.35); ctx.lineTo(0, s); ctx.lineTo(-s * 0.75, s * 0.35); ctx.lineTo(-s * 0.9, -s * 0.6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -s * 0.6); ctx.lineTo(0, s * 0.6); ctx.stroke();
    } else if (icon === 'sword') {
        ctx.save(); ctx.rotate(-Math.PI / 4);
        ctx.beginPath(); ctx.moveTo(0, -s * 1.15); ctx.lineTo(s * 0.22, -s * 0.2); ctx.lineTo(-s * 0.22, -s * 0.2); ctx.closePath(); ctx.fill();
        ctx.fillRect(-s * 0.22, -s * 0.2, s * 0.44, s * 0.6);
        ctx.fillRect(-s * 0.55, s * 0.32, s * 1.1, s * 0.18); ctx.fillRect(-s * 0.1, s * 0.5, s * 0.2, s * 0.5);
        ctx.restore();
    } else if (icon === 'boom') {
        ctx.beginPath(); ctx.arc(0, s * 0.15, s * 0.78, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fde68a'; ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.45); ctx.quadraticCurveTo(s * 0.7, -s, s * 1.0, -s * 0.9); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 1.0, -s * 0.9, 1.8 + Math.sin(Date.now() / 60) * 0.8, 0, Math.PI * 2); ctx.fill();
    } else if (icon === 'gear') {
        ctx.save(); ctx.rotate(Date.now() / 900);
        for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-s * 0.18, -s, s * 0.36, s * 0.45); }
        ctx.beginPath(); ctx.arc(0, 0, s * 0.68, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b1220'; ctx.beginPath(); ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    } else if (icon === 'burst') {
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + Date.now() / 1200;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.35, Math.sin(a) * s * 0.35); ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2); ctx.fill();
    }
}

Crate.prototype.draw = function () {
    if (!this.active) return;
    const st = CRATE_STYLE[this.type] || CRATE_STYLE.coin;
    const t = Date.now();
    const lifePct = Math.max(0, 1 - (t - this.spawnTime) / this.lifeTime);
    const bob = Math.sin(t / 300 + this.x) * 1.5;
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2 + bob;
    const blinkOut = lifePct < 0.2 && Math.floor(t / 120) % 2 === 0;
    ctx.save();
    if (blinkOut) ctx.globalAlpha = 0.45;
    // Bóng đổ dưới đất
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(this.x + this.w / 2, this.y + this.h + 3, this.w * 0.45, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Hào quang nhịp đập
    const pulse = 0.5 + 0.5 * Math.sin(t / 220);
    ctx.shadowBlur = 10 + pulse * 8; ctx.shadowColor = st.c;
    // Thân hộp kim loại tối + viền neon
    const x = cx - this.w / 2, y = cy - this.h / 2;
    const g = ctx.createLinearGradient(x, y, x, y + this.h);
    g.addColorStop(0, '#1f2a3d'); g.addColorStop(1, '#0b1220');
    ctx.fillStyle = g;
    roundRectPath(x, y, this.w, this.h, 5); ctx.fill();
    ctx.strokeStyle = st.c; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    // Góc bọc thép
    ctx.fillStyle = st.c;
    [[x, y], [x + this.w - 5, y], [x, y + this.h - 5], [x + this.w - 5, y + this.h - 5]].forEach(([px, py]) => ctx.fillRect(px, py, 5, 5));
    // Biểu tượng (xoay 180° khi xem từ phía khách online để không bị ngược)
    ctx.translate(cx, cy);
    const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    if (isGuestView) ctx.rotate(Math.PI);
    ctx.shadowBlur = 6; ctx.shadowColor = st.c;
    drawCrateIcon(st.icon, this.w * 0.3, st.c);
    ctx.restore();
    // Vòng thời gian còn lại
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifePct); ctx.stroke();
    ctx.restore();
};

MoneyTruck.prototype.draw = function () {
    if (!this.active) return;
    if (!this.maxHp) this.maxHp = Math.max(6, this.hp);
    const x = this.x, y = this.y, w = this.w, h = this.h, d = this.dir || 1;
    ctx.save();
    // bóng
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w * 0.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // bánh xe
    ctx.fillStyle = '#111';
    [x + w * 0.22, x + w * 0.78].forEach(wx => { ctx.beginPath(); ctx.arc(wx, y + h - 1, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#9ca3af';
    [x + w * 0.22, x + w * 0.78].forEach(wx => { ctx.beginPath(); ctx.arc(wx, y + h - 1, 2, 0, Math.PI * 2); ctx.fill(); });
    // thùng xe bọc thép (tím đậm + viền vàng)
    const cargoW = w * 0.68;
    const cargoX = d === 1 ? x : x + w - cargoW;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7e3fb8'); g.addColorStop(1, '#3b1263');
    ctx.fillStyle = g;
    ctx.shadowBlur = 10; ctx.shadowColor = '#c084fc';
    roundRectPath(cargoX, y, cargoW, h - 4, 4); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.stroke();
    // đinh tán
    ctx.fillStyle = '#e9d5ff';
    for (let i = 0; i < 4; i++) { ctx.fillRect(cargoX + 4 + i * (cargoW - 10) / 3, y + 3, 2, 2); ctx.fillRect(cargoX + 4 + i * (cargoW - 10) / 3, y + h - 9, 2, 2); }
    // ca-bin
    const cabW = w - cargoW - 1;
    const cabX = d === 1 ? x + cargoW + 1 : x;
    ctx.fillStyle = '#5b21b6';
    roundRectPath(cabX, y + 5, cabW, h - 9, 4); ctx.fill();
    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(d === 1 ? cabX + cabW - 7 : cabX + 2, y + 8, 5, 8); // kính lái
    // đèn pha
    ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 8; ctx.shadowColor = '#fef08a';
    ctx.beginPath(); ctx.arc(d === 1 ? x + w : x, y + h - 10, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // logo đồng xu
    const lx = cargoX + cargoW / 2, ly = y + (h - 4) / 2;
    ctx.fillStyle = '#facc15'; ctx.shadowBlur = 8; ctx.shadowColor = '#facc15';
    ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#7c5800'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    drawWorldText(ctx, '$', lx, ly + 3.5);
    // thanh máu
    const pct = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 4, y - 8, w - 8, 4);
    ctx.fillStyle = pct > 0.5 ? '#facc15' : (pct > 0.25 ? '#fb923c' : '#ef4444');
    ctx.fillRect(x + 4, y - 8, (w - 8) * pct, 4);
    ctx.restore();
};

if (typeof AttackTruck !== 'undefined') AttackTruck.prototype.draw = function () {
    if (!this.active) return;
    const x = this.x, y = this.y, w = this.w, h = this.h, up = this.dirY < 0;
    const t = Date.now();
    ctx.save();
    // vệt lửa phản lực phía sau
    const fy = up ? y + h : y;
    const fl = 10 + Math.random() * 8 + this.speed * 1.2;
    const fg = ctx.createLinearGradient(0, fy, 0, fy + (up ? fl : -fl));
    fg.addColorStop(0, 'rgba(255,220,120,0.95)'); fg.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(x + 5, fy); ctx.lineTo(x + w / 2, fy + (up ? fl : -fl)); ctx.lineTo(x + w - 5, fy); ctx.closePath(); ctx.fill();
    // thân xe vàng kim
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#a16207'); g.addColorStop(0.5, '#fde047'); g.addColorStop(1, '#a16207');
    ctx.fillStyle = g; ctx.shadowBlur = 12; ctx.shadowColor = '#facc15';
    roundRectPath(x, y, w, h, 6); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();
    // mũi xe húc (phía trước)
    ctx.fillStyle = '#e5e7eb';
    const ny = up ? y : y + h;
    ctx.beginPath(); ctx.moveTo(x + 2, ny + (up ? 6 : -6)); ctx.lineTo(x + w / 2, ny + (up ? -5 : 5)); ctx.lineTo(x + w - 2, ny + (up ? 6 : -6)); ctx.closePath(); ctx.fill();
    // kính lái
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 5, up ? y + 7 : y + h - 13, w - 10, 6);
    // ký hiệu $
    ctx.fillStyle = '#422006'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    drawWorldText(ctx, '$', x + w / 2, y + h / 2 + (up ? 8 : -2));
    // đèn nháy
    ctx.fillStyle = Math.floor(t / 100) % 2 ? '#ef4444' : '#3b82f6';
    ctx.fillRect(x + w / 2 - 2, y + h / 2 - 2 + (up ? 0 : 0), 4, 3);
    ctx.restore();
};
