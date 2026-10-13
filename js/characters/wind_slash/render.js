// ==========================================
// Phong Trảm (wind_slash) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Phong Trảm
    drawWindSlash() {
        if (this.weapon === 'wind_slash') {
            ctx.fillStyle = (this.chargeLevel >= 6.9) ? "red" : "yellow";
            ctx.fillRect(this.x, this.y - 10, this.w * (this.chargeLevel / 7), 5);
        }
    }
});
