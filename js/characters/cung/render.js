// ==========================================
// cung (cung) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] cung
    drawUIForCung(uiY, subUiY) {
        if (this.weapon === 'cung' && this.bowChargeTimer > 0) {
            let chargeSec = this.bowChargeTimer / 60;
            let barColor = "white";
            let stateText = "1 SHOT";
            if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2') && this.rainCD <= 0) {
                barColor = "red"; stateText = "RAIN ARROWS";
            } else if (chargeSec >= 1.0) {
                barColor = "cyan"; stateText = "3 SPREAD";
            } else if (chargeSec >= 0.5) {
                barColor = "lime"; stateText = "3 BURST";
            }

            ctx.fillStyle = barColor;
            let chargeProgress = Math.min(this.bowChargeTimer / 120, 1);
            let cungBarY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            ctx.fillRect(this.x - 4, cungBarY, (this.w + 8) * chargeProgress, 4);
            ctx.font = "bold 10px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, stateText, this.x + this.w / 2, cungBarY - 4);
        }
    },

    // [drawUI] cung
    drawUIForCung2(uiY, subUiY) {
        if (this.weapon === 'cung') {
            let dodgeY = (this.id === 1) ? uiY - 10 : subUiY + 14;
            ctx.save();
            if (this.bowDodgeReady) {
                ctx.fillStyle = "#00ffcc";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, "💨 NÉ ĐÒN", this.x + this.w / 2, dodgeY);
            } else if (this.bowDodgeCooldown > 0) {
                let secLeft = (this.bowDodgeCooldown / 60).toFixed(1);
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `💨 NÉ ${secLeft}s`, this.x + this.w / 2, dodgeY);
            }
            ctx.restore();
        }
    }
});
