// ==========================================
// necromancer (necromancer) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] necromancer
    drawUIForNecromancer(uiY, subUiY) {
        if (this.weapon === 'necromancer') {
            let necroY = (this.id === 1) ? this.y - 8 : this.y + this.h + 16;
            let lockedText = (this.lockedSouls > 0) ? ` (🔒${this.lockedSouls})` : '';
            ctx.fillStyle = "#00e676";
            ctx.font = "bold 9px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, `👻 ${this.currentSouls || 0}/${this.maxSouls || 6}${lockedText}`, this.x + this.w / 2, necroY);

            // Soul Shield bar
            let soulBarY = (this.id === 1) ? uiY - 6 : subUiY + 8;
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(this.x - 4, soulBarY, this.w + 8, 4);
            let soulRatio = Math.max(0, Math.min(1, (this.currentSouls || 0) / (this.maxSouls || 6)));
            ctx.fillStyle = "#00e676";
            ctx.fillRect(this.x - 4, soulBarY, (this.w + 8) * soulRatio, 4);

            // Summon Charge Progress
            if (this.necroChargeFrames > 0) {
                let tierText = "👻 BẮN PHÉP";
                let tierColor = "#00e676";
                if (this.necroChargeFrames >= 90) {
                    tierText = "💀 CAO CẤP (6👻)";
                    tierColor = "#ab47bc";
                } else if (this.necroChargeFrames >= 60) {
                    tierText = "🏹 XẠ THỦ (4👻)";
                    tierColor = "#29b6f6";
                } else if (this.necroChargeFrames >= 30) {
                    tierText = "💣 CẢM TỬ (2👻)";
                    tierColor = "#ff7043";
                }
                let chargeY = (this.id === 1) ? soulBarY - 8 : soulBarY + 12;
                ctx.fillStyle = tierColor;
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, tierText, this.x + this.w / 2, chargeY);
            }
        }
    }
});
