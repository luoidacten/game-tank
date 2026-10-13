// ==========================================
// mirror (mirror) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] mirror
    drawMirror() {
        if (this.weapon === 'mirror') {
            // Tọa độ bản sao (Chỉ đối xứng ngang)
            let cx = canvas.width - (this.x + this.w);
            let cy = this.y;

            // 1. VẼ BẢN SAO CỦA MÌNH
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.color;
            ctx.fillRect(cx, cy, this.w, this.h);

            ctx.fillStyle = "#fff";
            let cbx = cx + this.w / 2 - 4;
            let cby = (this.id === 1) ? cy - 20 : cy + this.h;
            ctx.fillRect(cbx, cby, 8, 20);

            if (this.mirrorCharge > 0) {
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.x, this.y - 10, this.w * (this.mirrorCharge / 60), 4);
                ctx.fillRect(cx, cy - 10, this.w * (this.mirrorCharge / 60), 4);
            }
            ctx.restore();

            // 2. VẼ ẢNH CHIẾU KẺ THÙ (Evo 2)
            if (this.enemyClone && this.enemyClone.active) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = (this.id === 1) ? p2.color : p1.color;
                ctx.fillRect(this.enemyClone.x, this.enemyClone.y, this.w, this.h);

                ctx.strokeStyle = "magenta"; ctx.lineWidth = 2;
                ctx.strokeRect(this.enemyClone.x, this.enemyClone.y, this.w, this.h);
                ctx.restore();
            }

            // 3. VẼ ẢNH CHIẾU TAN VỠ (Full Evo)
            if (this.shatteredClone && this.shatteredClone.active) {
                ctx.save();
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = "cyan"; // Trông như khối kính
                ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y, this.w, this.h);

                ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
                ctx.strokeRect(this.shatteredClone.x, this.shatteredClone.y, this.w, this.h);

                ctx.fillStyle = "white"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
                ctx.fillText("PHÁ TÔI!", this.shatteredClone.x + this.w / 2, this.shatteredClone.y - 10);

                // Máu của kính
                ctx.fillStyle = "red"; ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y - 5, this.w, 3);
                ctx.fillStyle = "#0f0"; ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y - 5, this.w * (this.shatteredClone.hp / 5), 3);
                ctx.restore();
            }
        }
    }
});
