// ==========================================
// Shotgun Tấn Công (shortgunATK) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Shotgun Tấn Công
    drawShortgunATK() {
        if (this.weapon === 'shortgunATK' && this.shortgunTelegraphTimer > 0) {
            let dirY = (this.id === 1) ? -1 : 1;
            let startX = this.x + this.w / 2;
            let startY = (this.id === 1) ? this.y : this.y + this.h;
            let coneLen = 130;
            let coneSpread = 0.45;
            let baseAngle = (dirY === -1) ? -Math.PI / 2 : Math.PI / 2;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.arc(startX, startY, coneLen, baseAngle - coneSpread, baseAngle + coneSpread);
            ctx.closePath();
            let pulse = (Math.sin(Date.now() * 0.02) + 1) * 0.15 + 0.2;
            ctx.fillStyle = this.shortgunDoubleTap ? `rgba(255, 170, 0, ${pulse + 0.15})` : `rgba(255, 50, 50, ${pulse})`;
            ctx.fill();
            ctx.strokeStyle = this.shortgunDoubleTap ? '#ffcc00' : '#ff3333';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    }
});
