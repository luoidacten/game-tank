// ==========================================
// Ghost (ghost) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Ghost
    drawGhost() {
        if (this.weapon === 'ghost') {
            if (this.isGhostActive) {
                ctx.save();
                ctx.globalAlpha = 0.4; // Mờ nhân vật chính

                // A. Vẽ vòng hào quang xoay quanh
                ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
                ctx.rotate(Date.now() / 200); // Xoay vòng tròn

                ctx.beginPath();
                // Vẽ vòng đứt đoạn
                ctx.arc(0, 0, this.w, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.strokeStyle = (this.id === 1) ? "#85c1e9" : "#f1948a"; // Màu nhạt theo player
                ctx.setLineDash([10, 10]);
                ctx.stroke();

                ctx.restore(); // Trả lại trạng thái canvas

                // B. Vẽ chữ thông báo trạng thái
                ctx.fillStyle = "white";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.fillText("VÔ ẢNH", this.x + this.w / 2, this.y - 10);

                // C. Thanh thời gian hiệu lực còn lại (nhỏ màu trắng trên đầu)
                ctx.fillStyle = "white";
                ctx.fillRect(this.x, this.y - 5, this.w * (this.ghostActiveTimer / this.ghostDuration), 2);

            } else {
                ctx.globalAlpha = 1.0;

                // [MỚI] Thanh hồi chiêu (Màu Xám) - Để biết bao giờ có lại
                // Vẽ thanh loading bên dưới nhân vật hoặc trên đầu
                if (this.ghostTimer > 0) {
                    ctx.fillStyle = "gray";
                    ctx.fillRect(this.x, this.y - 5, this.w * (this.ghostTimer / this.ghostCooldown), 2);
                }
            }
        }
    },

    // [draw] Ghost
    drawGhost2() {
        if (this.weapon === 'ghost' && this.hasPhantom && this.posHistory.length > 20) {
            let oldPos = this.posHistory[0]; // Vị trí cách đây 20 frame
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = this.color;
            ctx.fillRect(oldPos.x, oldPos.y, this.w, this.h);
            ctx.restore();
        }
    }
});
