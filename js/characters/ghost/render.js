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
                // C. Thời gian Vô Ảnh còn lại: thanh trắng ở hàng phụ HUD + biểu tượng mắt
                const bar = hudExtraBar(this, 0, this.ghostActiveTimer / this.ghostDuration, '#ffffff', { h: 2.5 });
                ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.2;
                hudGlyphAt('blind', bar.F.X(-bar.BW / 2 - 7), bar.F.Y(bar.d + 1.2), bar.F);

            } else {
                ctx.globalAlpha = 1.0;

                // [MỚI] Thanh hồi chiêu (Màu Xám) - Để biết bao giờ có lại
                // Vẽ thanh loading bên dưới nhân vật hoặc trên đầu
                if (this.ghostTimer > 0) {
                    hudExtraBar(this, 0, this.ghostTimer / this.ghostCooldown, '#94a3b8', { h: 2, glow: 0 });
                }
            }
        }
    },

    // [draw] Ghost
    drawGhost2() {
        if (this.weapon === 'ghost' && this.hasPhantom && this.posHistory.length > 20) {
            let oldPos = this.posHistory[0]; // Vị trí cách đây 20 frame
            ctx.save();
            // Hư Ảnh: vẽ lại chính xe Ghost mờ, phủ xanh lạnh
            if (!((typeof coreSmallArtAt === 'function') && coreSmallArtAt(this, oldPos.x, oldPos.y, 0.4, '#7dd3fc'))) {
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = this.color;
                ctx.fillRect(oldPos.x, oldPos.y, this.w, this.h);
            }
            ctx.restore();
        }
    }
});
