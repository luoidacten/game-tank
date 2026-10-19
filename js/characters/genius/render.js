// ==========================================
// genius (genius) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] genius
    drawUIForGenius(uiY, subUiY) {
        if (this.weapon === 'genius') {
            // Hàng thanh riêng xếp sau HUD chung (không đè lên thân xe / Mecha)
            const rowY = (i) => (typeof hudRowY === 'function')
                ? (this.id === 1 ? hudRowY(this, 'extra') + 1 + i * 5 : hudRowY(this, 'extra') - 4 - i * 5)
                : (this.id === 1 ? uiY - 6 - i * 6 : subUiY + 6 + i * 6);
            if (!this.isPilotingMecha) {
                let genY = (this.id === 1) ? this.y - 8 : this.y + this.h + 16;
                ctx.fillStyle = "#ffb74d";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚙️ BR: ${this.gears || 0} | 🔩 LK: ${this.components || 0}`, this.x + this.w / 2, genY);

                if (this.mechaSummonHold > 0) {
                    let summonProgress = Math.min(1, this.mechaSummonHold / 40);
                    let summonY = rowY(0);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                    ctx.fillRect(this.x - 4, summonY, this.w + 8, 4);
                    ctx.fillStyle = "#ff9800";
                    ctx.fillRect(this.x - 4, summonY, (this.w + 8) * summonProgress, 4);
                    drawWorldText(ctx, "TRIỆU HỒI MECHA...", this.x + this.w / 2, (this.id === 1) ? summonY + 12 : summonY - 4);
                }
            } else {
                let mechaY = (this.id === 1) ? this.y - 10 : this.y + this.h + 18;
                let modeNames = ["", "1:BẮN", "2:PHÁO", "3:SMG", "4:ĐẤM", "5:KHIÊN"];
                let curModeName = modeNames[this.mechaMode] || `M${this.mechaMode}`;

                // Mecha HP & Energy Bar
                let mHpRatio = Math.max(0, Math.min(1, (this.mechaHp || 0) / (this.mechaMaxHp || 1)));
                let mEnRatio = Math.max(0, Math.min(1, (this.mechaEnergy || 0) / (this.mechaMaxEnergy || 1)));
                let mBarY1 = rowY(0);
                let mBarY2 = rowY(1);

                // Mecha HP bar
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(this.x - 4, mBarY1, this.w + 8, 4);
                ctx.fillStyle = "#ff9800";
                ctx.fillRect(this.x - 4, mBarY1, (this.w + 8) * mHpRatio, 4);

                // Mecha Energy bar
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(this.x - 4, mBarY2, this.w + 8, 4);
                ctx.fillStyle = "#00e5ff";
                ctx.fillRect(this.x - 4, mBarY2, (this.w + 8) * mEnRatio, 4);

                // Mecha Mode badge & Armor text
                let armorInfo = (this.mechaVirtualArmor > 0) ? ` (+${this.mechaVirtualArmor} Giáp)` : '';
                ctx.fillStyle = "#ffd54f";
                ctx.font = "bold 8.5px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `🤖 [${curModeName}] NL:${Math.floor(this.mechaEnergy || 0)}${armorInfo}`, this.x + this.w / 2, mechaY);

                // Self-destruct hold indicator
                if (this.mechaSelfDestructHold > 0) {
                    let sdProgress = Math.min(1, this.mechaSelfDestructHold / 180);
                    ctx.fillStyle = "#f44336";
                    ctx.fillRect(this.x - 4, rowY(2), (this.w + 8) * sdProgress, 4);
                    drawWorldText(ctx, `💥 TỰ BẠO: ${(this.mechaSelfDestructHold/60).toFixed(1)}s`, this.x + this.w / 2, (this.id === 1) ? rowY(2) + 12 : rowY(2) - 4);
                }
            }
        }
    }
});
