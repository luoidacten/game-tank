// ==========================================
// Phong Trảm (wind_slash) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Phong Trảm
    drawWindSlash() {
        if (this.weapon === 'wind_slash') {
            // Thanh lực ở hàng phụ HUD (vòng 7 ô cạnh xe vẫn ở empower HUD)
            if (this.chargeLevel > 0 && typeof hudExtraBar === 'function')
                hudExtraBar(this, 0, this.chargeLevel / 7, this.chargeLevel >= 6.9 ? '#ff3b3b' : '#facc15', { h: 3, marks: [1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7] });
        }
    }
});
