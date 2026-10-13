// ==========================================
// paradox (paradox) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] paradox
    drawParadox() {
        if (this.weapon === 'paradox') {
            const drawTether = (x1, y1, x2, y2, color) => {
                ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.restore();
            };
            const enemy = (this.id === 1) ? p2 : p1;
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2');

            // 1. VẼ BÓNG BẢN THÂN (3 GIÂY TRƯỚC)
            if (this.paradoxHistory && this.paradoxHistory.length > 0) {
                let pShadow = this.paradoxHistory[0];
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = "cyan";
                ctx.fillRect(pShadow.x, pShadow.y, this.w, this.h);
                ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 10px Arial";
                ctx.fillText("3s", pShadow.x + this.w / 2, pShadow.y - 5);
                ctx.restore();
                drawTether(this.x + this.w / 2, this.y + this.h / 2, pShadow.x + this.w / 2, pShadow.y + this.h / 2, "rgba(0, 255, 255, 0.3)");
            }

            // 2. VẼ UI TỤ LỰC (2 MỐC)
            if (this.paradoxCharge > 0) {
                let chargeColor = (this.paradoxCharge >= 120 && isFullEvo) ? "magenta" : "cyan";
                let fillRatio = Math.min(this.paradoxCharge / (isFullEvo ? 120 : 60), 1);

                ctx.fillStyle = chargeColor;
                ctx.fillRect(this.x, this.y - 10, this.w * fillRatio, 5);

                ctx.fillStyle = "white"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
                let text = this.paradoxCharge >= 120 ? "FORCE REWIND" : (this.paradoxCharge >= 60 ? "REWIND READY" : "");
                ctx.fillText(text, this.x + this.w / 2, this.y - 15);
            }

            // Vẽ hồi chiêu
            if (this.paradoxCooldown > 0) {
                ctx.fillStyle = "gray";
                let maxCd = this.hasUpgrade('evo_paradox_2') ? 420 : 720;
                ctx.fillRect(this.x, this.y + this.h + 5, this.w * (this.paradoxCooldown / maxCd), 3);
            }

            // 2. VẼ BÓNG ĐỨNG YÊN CỦA ĐỊCH (EVO 1 - DẤU ẤN)
            if (this.enemyStationaryShadow) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = "magenta";
                ctx.fillRect(this.enemyStationaryShadow.x, this.enemyStationaryShadow.y, this.w, this.h);

                // Viền nhấp nháy cho bóng điểm đánh dấu
                ctx.strokeStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? "white" : "magenta";
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.strokeRect(this.enemyStationaryShadow.x - 2, this.enemyStationaryShadow.y - 2, this.w + 4, this.h + 4);

                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "bold 10px Arial";
                ctx.fillText("MARK", this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y - 5);
                ctx.restore();

                // Vẽ dây nối từ Địch tới Điểm Đánh Dấu
                drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y + this.h / 2, "rgba(255, 0, 255, 0.4)");
            }

            // 3. VẼ BÓNG 5 GIÂY CỦA ĐỊCH (FULL EVO)
            // Chỉ vẽ dây nối nếu Địch chưa bị dính Bóng Đứng Yên (ưu tiên Bóng Đứng Yên)
            if (this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2') && this.enemyHistory && this.enemyHistory.length > 0) {
                let eShadow = this.enemyHistory[0];

                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = enemy.color; // Bóng màu của địch
                ctx.fillRect(eShadow.x, eShadow.y, this.w, this.h);

                ctx.strokeStyle = "purple";
                ctx.lineWidth = 2;
                ctx.strokeRect(eShadow.x, eShadow.y, this.w, this.h);
                ctx.restore();

                // Nối dây nếu địch chưa bị Mark
                if (!this.enemyStationaryShadow) {
                    drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, eShadow.x + this.w / 2, eShadow.y + this.h / 2, "rgba(128, 0, 128, 0.3)");
                }
            }
        }
    }
});
