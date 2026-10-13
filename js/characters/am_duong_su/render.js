// ==========================================
// Âm Dương Sư (am_duong_su) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Âm Dương Sư — trả về drawColor mới
    drawAmDuongSu(drawColor) {
        if (this.weapon === 'am_duong_su') {
            drawColor = this.isAmChu ? "#2c3e5080" : "#f1c40f";
            ctx.fillStyle = this.isAmChu ? "#2c3e50" : "#f1c40f";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
        return drawColor;
    }
});
