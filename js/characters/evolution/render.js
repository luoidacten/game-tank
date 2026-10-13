// ==========================================
// evolution (evolution) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] evolution
    drawUIForEvolution() {
        if (this.weapon === 'evolution') {
            let b = this.evolutionPermanentBonus || { hp: 0, dmg: 0, speed: 0 };
            let evoY = (this.id === 1) ? this.y - 6 : this.y + this.h + 16;
            ctx.fillStyle = "#2ecc71";
            ctx.font = "bold 9px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, `🧬 +${b.hp.toFixed(1)}HP +${b.dmg.toFixed(2)}D`, this.x + this.w / 2, evoY);
        }
    }
});
