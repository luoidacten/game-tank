// ==========================================
// Xe TANK (tank) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Xe TANK
    drawTank(bx, by) {
        if (this.weapon === 'tank') {
            ctx.fillStyle = "#555";
            let spikeY = (this.id === 1) ? this.y - 10 : this.y + this.h;
            ctx.beginPath();
            ctx.moveTo(this.x, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w / 2, spikeY);
            ctx.fill();
        } else {
            ctx.fillRect(bx, by, 8, 20);
        }
    }
});

// HUD nội tại: vòng hồi khiên quanh xe (đầy vòng = +1 khiên) + viền phát sáng khi đang lao (giảm sát thương)
CharHooks.register('tank', {
    drawUI() {
        if (this.hp <= 0) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const R = Math.max(this.w, this.h) * 0.5 + 9;
        const limit = this.tankShieldLimit ? this.tankShieldLimit() : 360;
        const ratio = Math.min(1, (this.passiveShieldTimer || 0) / limit);
        const t = Date.now() / 16; // chỉ dùng cho nhấp nháy hình ảnh
        ctx.save();
        // Nền vòng
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        // Tiến độ hồi khiên (cam -> xanh ngọc khi sắp đầy)
        const near = ratio > 0.85;
        const col = near ? "#00f0ff" : "#ff9f43";
        ctx.strokeStyle = col;
        ctx.shadowColor = col; ctx.shadowBlur = near ? 12 : 6;
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); ctx.stroke();
        const a = -Math.PI / 2 + Math.PI * 2 * ratio;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 2.2, 0, Math.PI * 2); ctx.fill();
        // Đang lao: giáp húc (giảm sát thương)
        if (this.dashState > 0) {
            const pulse = 0.55 + 0.45 * Math.sin(t * 0.5);
            ctx.strokeStyle = `rgba(255,200,80,${0.5 + 0.4 * pulse})`;
            ctx.shadowColor = "#ffb300"; ctx.shadowBlur = 16;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(this.x - 4, this.y - 4, this.w + 8, this.h + 8);
        } else if ((this.tankDashCooldown || 0) <= 0) {
            // Lao húc sẵn sàng: vòng ngoài nhấp nháy nhẹ
            ctx.strokeStyle = `rgba(255,159,67,${0.3 + 0.2 * Math.sin(t * 0.15)})`;
            ctx.lineWidth = 1.5; ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(cx, cy, R + 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
});
