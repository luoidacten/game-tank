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
        }
    }
});
