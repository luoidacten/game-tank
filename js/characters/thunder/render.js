// ==========================================
// thunder (thunder) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] thunder
    drawUIForThunder(uiY, subUiY) {
        if (this.weapon === 'thunder') {
            let spearY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            let startX = this.x + this.w / 2 - 18;
            // (Số giáo hiện tại được thể hiện bằng giá giáo sau lưng - xem CharHooks 'thunder'.draw)
            void startX;
            if (this.thunderLoiMinhTimer > 0) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚡ THIÊN KIẾP (${Math.ceil(this.thunderLoiMinhTimer / 60)}s)`, this.x + this.w / 2, spearY - 5);
            } else if (this.thunderLoiMinhStacks > 0) {
                ctx.fillStyle = "#ffffaa";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `LÔI MINH: ${this.thunderLoiMinhStacks}/3`, this.x + this.w / 2, spearY - 5);
            }
            if (this.thunderShieldHits > 0) {
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            }
        }
    }
});

// Hình ảnh đặc trưng của Lôi Thần (vẽ sau thân xe)
CharHooks.register('thunder', {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const back = this.id === 1 ? 1 : -1; // phía sau lưng (ngược hướng địch)
        // 1. Giá giáo sau lưng: số cây = số giáo đang cầm, xòe hình quạt
        const n = this.thunderSpears || 0;
        for (let i = 0; i < 3; i++) {
            const off = i - 1;                     // -1, 0, 1: xòe quạt
            const has = i < n;
            ctx.save();
            ctx.translate(cx + off * 10, cy + back * (this.h / 2 - 2));
            ctx.rotate(back * Math.PI / 2 - off * 0.75 * back); // mũi giáo chĩa ra sau lưng, xòe quạt
            ctx.translate(11, 0);
            if (has) drawThunderSpearShape(17, 1, (Math.floor(Date.now() / 90) + i) % 5 === 0);
            else { ctx.globalAlpha = 0.18; drawThunderSpearShape(17, 1, false); } // ô trống: bóng mờ
            ctx.restore();
        }
        // 2. Cảnh báo Lôi Minh: thân xe hóa thành tia sét (viền chớp + cung điện quanh xe)
        if ((this.thunderRaycastWarningTimer || 0) > 0) {
            const k = 1 - this.thunderRaycastWarningTimer / 15;
            ctx.save();
            ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 30);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowBlur = 25; ctx.shadowColor = '#fff176';
            ctx.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            ctx.strokeStyle = '#80deea'; ctx.lineWidth = 2;
            for (let a = 0; a < 4; a++) {
                const r = this.w * (0.7 + 0.3 * k), ang = Date.now() / 80 + a * Math.PI / 2;
                ctx.beginPath(); ctx.arc(cx, cy, r, ang, ang + 0.9); ctx.stroke();
            }
            ctx.restore();
        }
        // 3. Vừa phóng Lôi Minh: bóng sét lao tới cuối sân rồi quay về
        if ((this.thunderDashFx || 0) > 0 && typeof this.thunderDashToY === 'number') {
            const t = 1 - this.thunderDashFx / 18;              // 0..1
            const go = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;       // đi rồi về
            const gy = cy + (this.thunderDashToY - cy) * go;
            ctx.save();
            for (let j = 0; j < 5; j++) {                        // bóng mờ kéo dài
                const yy = cy + (gy - cy) * (1 - j * 0.12);
                ctx.globalAlpha = 0.5 - j * 0.09;
                ctx.fillStyle = j === 0 ? '#ffffff' : '#fff176';
                ctx.shadowBlur = 20; ctx.shadowColor = '#fff176';
                ctx.fillRect(cx - this.w / 2 + 3, yy - this.h / 2 + 3, this.w - 6, this.h - 6);
            }
            ctx.restore();
        }
        // 4. Bóng tàn ảnh khi Lôi Trảm dịch chuyển
        if (this.thunderAfterImage) {
            const a = this.thunderAfterImage;
            ctx.save();
            ctx.globalAlpha = a.t / 14 * 0.6;
            ctx.fillStyle = '#fff59d'; ctx.shadowBlur = 16; ctx.shadowColor = '#ffeb3b';
            ctx.fillRect(a.x - this.w / 2, a.y - this.h / 2, this.w, this.h);
            ctx.restore();
        }
        // 5. Đang Lôi Trảm: điện bao quanh xe
        if (this.thunderIsSlashing) {
            ctx.save();
            ctx.strokeStyle = '#fff176'; ctx.lineWidth = 1.5; ctx.shadowBlur = 12; ctx.shadowColor = '#fff176';
            for (let a = 0; a < 3; a++) {
                const ang = Date.now() / 60 + a * 2.1;
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, ang, ang + 0.7); ctx.stroke();
            }
            ctx.restore();
        }
    },
});
