// ==========================================
// magician (magician) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] magician
    drawMagician() {
        if (this.weapon === 'magician') {
            // Bản thể thật tàng hình
            if (this.invisTimer > 0) ctx.globalAlpha = 0.2;

            // Vẽ các phân ảnh
            for (let ill of this.illusions) {
                ctx.save();
                // Nếu bản thể thật đang tàng hình, bóng cũng tàng hình theo. Nếu không, đậm 100%
                if (ill.invisTimer > 0 || this.invisTimer > 0) {
                    ctx.globalAlpha = 0.2;
                } else {
                    ctx.globalAlpha = 1.0; // KHÔNG BAO GIỜ BỊ MỜ SAU 5 GIÂY, LUÔN ĐẬM 100%
                }

                ctx.fillStyle = this.color;
                ctx.fillRect(ill.x, ill.y, ill.w, ill.h);

                // Vẽ nòng súng giả cho phân ảnh
                ctx.fillStyle = "#fff";
                let cbx = ill.x + ill.w / 2 - 4;
                let cby = (this.id === 1) ? ill.y - 20 : ill.y + ill.h;
                ctx.fillRect(cbx, cby, 8, 20);

                // ==========================================
                // --- VẼ THANH MÁU & ĐẠN CHO PHÂN ẢNH ---
                // ==========================================
                let isP1 = (this.id === 1);
                let hpY, ammoY;

                // 1. CĂN CHỈNH CHIỀU DỌC (TỌA ĐỘ Y)
                if (isP1) {
                    // PLAYER 1 (Bên Xanh - Nằm dưới màn hình)
                    // -> Thanh chỉ số nằm DƯỚI chân xe tăng
                    hpY = ill.y + ill.h + 6;
                    ammoY = ill.y + ill.h + 12;
                } else {
                    // PLAYER 2 (Bên Đỏ - Nằm trên màn hình)
                    // -> Thanh chỉ số nằm TRÊN đầu xe tăng (Ngược lại)
                    hpY = ill.y - 13;
                    ammoY = ill.y - 6;
                }

                let hpRatio = Math.max(0, ill.hp / ill.maxHp);
                let hpWidth = ill.w * hpRatio;

                // 2. VẼ THANH MÁU
                ctx.fillStyle = "red"; // Nền đỏ (Máu đã mất)
                ctx.fillRect(ill.x, hpY, ill.w, 4);

                ctx.fillStyle = "#0f0"; // Máu xanh
                if (isP1) {
                    // P1: Máu tụt từ phải qua trái (Căn lề trái)
                    ctx.fillRect(ill.x, hpY, hpWidth, 4);
                } else {
                    // P2: Máu tụt từ trái qua phải (Căn lề phải, đối xứng với P1)
                    ctx.fillRect(ill.x + ill.w - hpWidth, hpY, hpWidth, 4);
                }

                // 3. VẼ THANH ĐẠN
                let ammoW = ill.w / ill.maxAmmo;
                ctx.fillStyle = "yellow";
                for (let j = 0; j < ill.ammo; j++) {
                    let ammoX;
                    if (isP1) {
                        // P1: Đạn xếp từ trái sang phải
                        ammoX = ill.x + j * ammoW + 1;
                    } else {
                        // P2: Đạn xếp từ phải sang trái (Ngược lại)
                        ammoX = ill.x + ill.w - (j + 1) * ammoW + 1;
                    }
                    ctx.fillRect(ammoX, ammoY, ammoW - 1, 3);
                }
                ctx.restore(); // [FIX] thiếu restore -> độ mờ 0.2 lan ra toàn bản đồ & rò save() mỗi khung hình
            }

            // Vẽ Đạn Giả & Đạn Hù Dọa
            if (this.fakeBullets && this.fakeBullets.length > 0) {
                ctx.fillStyle = "rgba(0, 255, 255, 0.7)"; // Đạn ảo màu cyan mờ
                for (let fb of this.fakeBullets) {
                    ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
                }
            }
        }
    }
});
