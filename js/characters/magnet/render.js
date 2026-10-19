// ==========================================
// magnet (magnet) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] magnet
    drawUIForMagnet(uiY, subUiY) {
        if (this.weapon === 'magnet') {
            let badgeY = (this.id === 1) ? uiY - 14 : subUiY + 14;
            let isPos = (this.magnetPolarity === 1);
            ctx.fillStyle = isPos ? "#ff3300" : "#00aaff";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, badgeY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPos ? "+" : "-", this.x + this.w / 2, badgeY);
            ctx.textBaseline = "alphabetic";
            if (this.isPolarDashing) this.drawPolarDashFx();
        }
    },

    // Lướt Cực Tính: vệt từ trường phía sau + tia từ lực nối tới mục tiêu khác cực
    drawPolarDashFx() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const isPos = (this.magnetPolarity === 1);
        const col = isPos ? '#ff4400' : '#00d0ff';
        const rgb = isPos ? '255, 80, 20' : '0, 200, 255';
        const back = (this.id === 1) ? 1 : -1;
        const t = this.polarDashT || 0;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (this.polarDashPhase === 1) {
            // Vệt lao
            const g = ctx.createLinearGradient(cx, cy, cx, cy + back * 90);
            g.addColorStop(0, `rgba(${rgb}, 0.55)`); g.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(cx - this.w / 2, cy); ctx.lineTo(cx + this.w / 2, cy); ctx.lineTo(cx + 4, cy + back * 90); ctx.lineTo(cx - 4, cy + back * 90);
            ctx.closePath(); ctx.fill();
            // Tia từ lực tới mục tiêu
            const tg = this.polarDashTarget;
            if (tg) {
                const tx = this.polarDashKind === 'enemy' ? tg.x + tg.w / 2 : tg.x;
                const ty = this.polarDashKind === 'enemy' ? tg.y + tg.h / 2 : tg.y;
                ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = col;
                ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 3;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
                ctx.setLineDash([]);
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
                const k = (t % 12) / 12;
                ctx.beginPath(); ctx.arc(tx, ty, 26 - 16 * k, 0, Math.PI * 2); ctx.stroke();
            }
            // Khiên từ quanh xe (bất khả xâm phạm khi lao)
            ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.shadowBlur = 16; ctx.shadowColor = col;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.75 + Math.sin(t * 0.8) * 2, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(${rgb}, 0.5)`; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.7, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
});

// Gợi ý trên sân: có mục tiêu KHÁC CỰC phía trước & Lướt đã hồi -> tia đứt nét nối tới mục tiêu
Player.prototype.drawMagnetDashCue = function () {
    if (this.weapon !== 'magnet' || this.isPolarDashing || this.polarDashCd > 0 || this.hp <= 0) return;
    const f = this.findPolarDashTarget();
    if (!f) return;
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    const tx = f.kind === 'enemy' ? f.t.x + f.t.w / 2 : f.t.x;
    const ty = f.kind === 'enemy' ? f.t.y + f.t.h / 2 : f.t.y;
    const col = this.magnetPolarity === 1 ? '#ff5533' : '#33aaff';
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 8);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = col;
    ctx.setLineDash([3, 6]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    const k = (t * 1.6) % 1;
    ctx.beginPath(); ctx.arc(tx, ty, 30 - 12 * k, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
};

// Trạng thái từ tính trên xe bị Nam Châm ảnh hưởng:
//   ẤN TỪ  -> vùng từ toả quanh xe + ấn xoay sáng rõ có dấu +/− và vòng đếm thời gian
//   NHIỄM TỪ -> chỉ vài tia lửa mờ quanh xe (không phải mục tiêu Lướt)
function drawMagnetStatus(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const t = Date.now() / 1000;
    if (p.magSealTimer > 0 && p.magSealPol) {
        const pos = p.magSealPol === 1;
        const c = pos ? '#ff4422' : '#1ea7ff', rgb = pos ? '255, 70, 30' : '30, 167, 255';
        const R = p.magSealAura || 34;
        const left = p.magSealTimer / (p.magSealMax || 360);
        const blink = p.magSealTimer < 90 ? (0.55 + 0.45 * Math.sin(t * 20)) : 1;
        ctx.save();
        ctx.globalAlpha = blink;
        // vùng từ toả quanh xe
        const g = ctx.createRadialGradient(cx, cy, p.w * 0.4, cx, cy, R);
        g.addColorStop(0, `rgba(${rgb}, 0)`); g.addColorStop(0.75, `rgba(${rgb}, 0.12)`); g.addColorStop(1, `rgba(${rgb}, 0.28)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${rgb}, 0.55)`; ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 4]); ctx.lineDashOffset = (pos ? -1 : 1) * t * 30;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // ấn xoay: vòng kép + 4 dấu cực quay quanh xe
        ctx.shadowBlur = 12; ctx.shadowColor = c;
        ctx.strokeStyle = c; ctx.lineWidth = 2;
        const r1 = p.w * 0.78;
        ctx.beginPath(); ctx.arc(cx, cy, r1, 0, Math.PI * 2); ctx.stroke();
        const a0 = t * (pos ? 2.2 : -2.2);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
            const a = a0 + i * Math.PI / 2;
            ctx.beginPath(); ctx.arc(cx, cy, r1 + 4, a, a + 0.7); ctx.stroke();
        }
        for (let i = 0; i < 4; i++) {
            const a = a0 + Math.PI / 4 + i * Math.PI / 2;
            const sx = cx + Math.cos(a) * (r1 + 4), sy = cy + Math.sin(a) * (r1 + 4);
            ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx, sy, 4.2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(sx - 2, sy); ctx.lineTo(sx + 2, sy);
            if (pos) { ctx.moveTo(sx, sy - 2); ctx.lineTo(sx, sy + 2); }
            ctx.stroke();
        }
        // huy hiệu ẤN lớn phía trước xe + vòng thời gian còn lại
        const by = (p.id === 1) ? p.y - 22 : p.y + p.h + 22;
        ctx.fillStyle = 'rgba(6, 10, 20, 0.85)'; ctx.beginPath(); ctx.arc(cx, by, 10.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, by, 7.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, by, 10.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 3.6, by); ctx.lineTo(cx + 3.6, by);
        if (pos) { ctx.moveTo(cx, by - 3.6); ctx.lineTo(cx, by + 3.6); }
        ctx.stroke();
        ctx.restore();
        return;
    }
    if (p.infectedPolarityTimer > 0 && p.infectedPolarity) {
        const pos = p.infectedPolarity === 1;
        const c = pos ? 'rgba(255, 110, 80,' : 'rgba(110, 190, 255,';
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const a = t * 3 + i * 2.1;
            const r = p.w * 0.62 + Math.sin(t * 9 + i) * 3;
            const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
            ctx.lineWidth = 1.4; ctx.strokeStyle = c + (0.5 + 0.3 * Math.sin(t * 13 + i)) + ')'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a + 1.6) * 4, sy + Math.sin(a + 1.6) * 4); ctx.lineTo(sx + Math.cos(a + 0.6) * 7, sy + Math.sin(a + 0.6) * 7); ctx.stroke();
        }
        const by = (p.id === 1) ? p.y - 14 : p.y + p.h + 14;
        ctx.fillStyle = c + '0.4)'; ctx.beginPath(); ctx.arc(cx, by, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
