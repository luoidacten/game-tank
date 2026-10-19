// ==========================================
// Player — Vẽ xe, thanh máu, UI (phần dùng chung)
// ==========================================

Object.assign(Player.prototype, {
    draw() {
        if (this.hp <= 0) return; // Nạn nhân bị nổ tung và biến mất

        const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
        const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);

        // Hiệu ứng tàng hình (Ghost Vô Ảnh, Magician Tàng Hình, Shadow Hunter Vô Hình)
        let isStealth = (this.weapon === 'ghost' && this.isGhostActive) ||
                        (this.weapon === 'magician' && this.invisTimer > 0) ||
                        (this.weapon === 'shadow_hunter' && this.stealthActive);

        if (isStealth) {
            if (isOnline && !isMyTank) {
                // ẨN HOÀN TOÀN 100% trên màn hình đối thủ ở chế độ Online (WebRTC P2P)
                return;
            }
            // Trên màn hình bản thân: hiển thị dạng bán trong suốt để tự quan sát và điều khiển
            ctx.globalAlpha = 0.28;
        }

        // Render Motion Blur / Ghost Trail afterimages trước khi vẽ xe chính
        if (this.trailHistory && this.trailHistory.length > 0) {
            for (let t = 0; t < this.trailHistory.length; t++) {
                let tr = this.trailHistory[t];
                let trAlpha = 0.35 * (1 - (t + 1) / (this.trailHistory.length + 1));
                ctx.save();
                ctx.globalAlpha = trAlpha;
                ctx.fillStyle = tr.color || this.color;
                ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
                ctx.restore();
            }
        }

        // Shortgun Cone Telegraph (Vệt hình nón đỏ cảnh báo tấn công 0.5s)
        this.drawShortgunATK();

        // --- ĐỔI MÀU NHÂN VẬT THEO TRẠNG THÁI ---
        let drawColor = this.color;
        if (this.freezeTimer > 0) drawColor = "#aaddff"; // Đóng băng (Trắng xanh)
        else if (this.burnTimer > 0 && this.slowTimer > 0) drawColor = "#cc55cc"; // Vừa cháy vừa chậm (Tím)
        else if (this.burnTimer > 0) drawColor = "#ff33337a"; // Bị Đốt (Đỏ rực)
        else if (this.silenceTimer > 0) drawColor = "#24006d49"; // <--- THÊM DÒNG NÀY: Câm Lặng (Tím sẫm)
        else if (this.slowTimer > 0) drawColor = "#3399ff67"; // Bị Chậm (Xanh biển rực)
        drawColor = this.drawAmDuongSu(drawColor);

        // Hình xe hiện đại theo từng body (js/render/tank-art*.js); body chưa có art -> khối cũ
        if (!(typeof drawTankArt === 'function' && drawTankArt(this, drawColor))) {
            ctx.fillStyle = drawColor;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            ctx.fillStyle = "#fff";
            let bx = this.x + this.w / 2 - 4;
            let by = (this.id === 1) ? this.y - 15 : this.y + this.h;
            if (this.weapon === 'smg') bx += (Math.random() - 0.5) * 8;
            this.drawTank(bx, by);
        }

        // Vẽ Drones của Nhà Phát Minh
        this.drawInventor();

        // Vẽ Lưới Điện Phản Pháo
        this.drawInventor2();

        // Vẽ vòng kiếm bảo vệ (Kiếm Thể Thủ)
        if (this.swordShieldActive) {
            ctx.save();
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.rotate(Date.now() / 200); // Xoay tròn

            for (let i = 0; i < this.swordShieldHits; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.swordShieldHits) * i);
                ctx.translate(0, -40); // Bán kính quỹ đạo
                if (typeof swDrawShieldSword === 'function') swDrawShieldSword(this);
                else drawGlowingSword(-4, -10, 8, 20, (this.id === 1) ? '#3498db' : '#e74c3c', this.id === 1 ? -1 : 1);
                ctx.restore();
            }
            ctx.restore();
        }
        // ==========================================
        // --- ĐỒ HỌA MAGICIAN (TÀNG HÌNH & BÓNG) ---
        // ==========================================
        this.drawMagician();
        // cho mirro
        // --- VẼ BẢN SAO VÀ ẢNH CHIẾU CỦA MIRROR ---
        // Thay thế toàn bộ đoạn vẽ của Mirror bằng đoạn code chuẩn hóa này:
        // --- VẼ BẢN SAO VÀ ẢNH CHIẾU CỦA MIRROR ---
        this.drawMirror();
        // Paradox
        // ==========================================
        // --- VẼ ẢO ẢNH CỦA PARADOX ---
        // ==========================================
        this.drawParadox();
        // sukuna
        // --- ĐỒ HỌA SUKUNA (THANH CHÚ LỰC & LÃNH ĐỊA) ---
        // --- ĐỒ HỌA SUKUNA (LÃNH ĐỊA & THANH CHÚ LỰC) ---
        this.drawSukuna();
        // cho sniper
        // --- VẼ UI SNIPER ---
        this.drawSniper();

        // Xử lý độ mờ cho Ghost
        this.drawGhost();

        // Vẽ Phantom (Bóng ma) - Evo 2 Ghost
        this.drawGhost2();

        // Lazer Xuyên Phá: mức tụ lực đã hiện trên hình xe (thanh tụ lực dọc thân) + HUD cường hóa
        if (this.weapon === 'lazer_charge' && this.chargeLevel > 0 && !(typeof TANK_ART !== 'undefined' && TANK_ART[this.weapon])) {
            let cColor = (this.weapon === 'lazer_charge') ? `rgb(0, ${this.chargeLevel * 35}, 255)` : `rgb(255, ${255 - this.chargeLevel * 30}, 0)`;
            ctx.fillStyle = cColor;
            ctx.fillRect(this.x, this.y + this.h / 2 - 5, this.w * (this.chargeLevel / 7), 10);
        }
        this.drawWindSlash();
        // Với Storm: Hiệu ứng hào quang khi tự tụ lực
        this.drawStorm();

        // Hiệu ứng Lưới Điện & Ép Xung của Nhà Phát Minh
        this.drawInventor3();

        if (this.shield > 0) {
            ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 1.2, 0, Math.PI * 2); ctx.stroke();
        }
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = this.color;
        // ... (Code vẽ cũ)

        // Reset Alpha ở cuối hàm draw
        ctx.globalAlpha = 1.0;

        CharHooks.call(this, 'draw');
        this.drawUI();

        this.bullets.forEach(b => {
            if (b.hook && BulletHooks.registry[b.hook] && BulletHooks.registry[b.hook].draw) { BulletHooks.call(b, 'draw'); return; }
            // Đòn đặc biệt Sukuna / Gojo (js/render/tank-art/curse.js)
            if (typeof curseBulletDraw === 'function' && curseBulletDraw(b, this)) return;
            // --- VẼ TIA SÁNG NEON (NƯỚC / LỬA) ---
            if (b.isWater || b.isFurnace) {
                // Art riêng (js/render/tank-art/heavy.js): cầu lửa / giọt nước / tia phun
                if (typeof BULLET_ART !== 'undefined' && BULLET_ART[b.owner.weapon]) { drawBulletArt(b, (b.owner.id === 1) ? '#3498db' : '#e74c3c', b.owner); return; }
                ctx.save();
                ctx.globalCompositeOperation = "lighter";

                let neonColor = b.isWater ? "#00ffff" : "#ff4500"; // Cyan cho nước, Cam đỏ cho lửa
                ctx.shadowBlur = 15;
                ctx.shadowColor = neonColor;
                ctx.strokeStyle = "white"; // Lõi sáng trắng

                // Xoay đạn theo hướng bay
                let angle = Math.atan2(b.vy, b.vx);
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.lineCap = "round"; // Tạo 2 đầu bo tròn (viên thuốc)
                ctx.lineWidth = b.w;   // Độ dày

                // Vẽ thân đạn
                ctx.moveTo(-b.h / 2, 0);
                ctx.lineTo(b.h / 2, 0);
                ctx.stroke();

                // Vẽ thêm một lớp nhỏ ở giữa để lõi rực hơn
                ctx.lineWidth = b.w * 0.4;
                ctx.stroke();

                ctx.restore();
                return; // Bỏ qua đoạn vẽ đạn tròn/vuông bên dưới
            }
            // Xác định màu dựa trên chủ sở hữu hiện tại (quan trọng cho đạn phản)
            let bulletColor = (b.owner.id === 1) ? "#3498db" : "#e74c3c";

            if (b.isPiercing) bulletColor = "#9b59b6";       // Tím (Xuyên)
            else if (b.isIce) bulletColor = "#00ffff";       // Xanh băng
            else if (b.isExplosive) bulletColor = "#ff5050"; // Hồng (Nổ)
            else if (b.isRocket) bulletColor = (this.hasUpgrade('evo_rocket_1')) ? '#00ff00' : '#ff5500'; // Rocket
            else if (b.isAmChu) bulletColor = "#2c3e50";     // Âm
            else if (b.isDuongChu) bulletColor = "#f1c40f";  // Dương
            else if (b.type === 'purple') bulletColor = "purple"; // Cầu Hủy Diệt
            else if (b.type === 'shadow_empowered') bulletColor = "#9b59b6"; // Shadow Hunter
            else if (b.type === 'shortgun_pellet') bulletColor = "#ff6600";  // Shortgun
            else if (b.type === 'cannonball') bulletColor = "#222222";       // Cannonball

            // Render Motion Blur / Ghost Trail cho đạn bay nhanh
            if (b.trailHistory && b.trailHistory.length > 0) {
                for (let t = 0; t < b.trailHistory.length; t++) {
                    let tr = b.trailHistory[t];
                    let trAlpha = 0.35 * (1 - (t + 1) / (b.trailHistory.length + 1));
                    ctx.save();
                    ctx.globalAlpha = trAlpha;
                    ctx.fillStyle = bulletColor;
                    ctx.beginPath();
                    ctx.arc(tr.x + tr.w / 2, tr.y + tr.h / 2, tr.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            if (b.isGhost) {
                if (b.isFlicker) {
                    // CƠ CHẾ KHÓ NHÌN:

                    // 1. Rất mờ (Alpha thấp)
                    ctx.globalAlpha = 0.3;

                    // 2. Nhấp nháy ngẫu nhiên (50% cơ hội không vẽ frame này -> tạo cảm giác đứt quãng)
                    // Nếu có Evo 1 thì tỉ lệ ẩn cao hơn (khó nhìn hơn nữa)
                    let flickerRate = this.hasUpgrade('evo_ghost_1') ? 0.7 : 0.4;
                    if (Math.random() < flickerRate) {
                        ctx.globalAlpha = 1.0; // Reset alpha để không ảnh hưởng đạn sau
                        return; // Bỏ qua không vẽ frame này
                    }

                    // Đạn Ghost khi vô ảnh sẽ có màu trắng mờ hoặc xám nhạt cho khó thấy trên nền
                    bulletColor = "rgba(200, 200, 200, 0.5)";
                } else {
                    // Đạn Ghost thường (không vô ảnh)
                    ctx.globalAlpha = 0.8;
                }
            }

            ctx.fillStyle = bulletColor;

            // Vẽ Kiếm Khí (Wind Blade)
            // Vẽ Kiếm Khí (Wind Blade) HOẶC Nhát chém Sukuna
            // Phong Trảm: lưỡi gió trăng khuyết (js/render/tank-art/swords.js)
            if (b.isWindBlade && typeof swDrawWindBlade === 'function') { ctx.globalAlpha = 1; swDrawWindBlade(b); return; }
            // Cuồng Phong: Hư Ảnh -> lốc xoáy
            if (b.isStormPhantom && typeof swDrawStormPhantom === 'function') { ctx.globalAlpha = 1; swDrawStormPhantom(b); return; }
            if (b.isWindBlade || b.isSukunaSlash) {
                ctx.save();
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);

                let rotation = b.rotation || 0;

                // --- THÊM ĐOẠN NÀY ĐỂ NHÁT CHÉM SUKUNA NẰM NGANG THEO HƯỚNG BAY ---
                if (b.isSukunaSlash) {
                    rotation = Math.atan2(b.vy, b.vx);
                }
                // ------------------------------------------------------------------

                ctx.rotate(rotation);

                // Lưỡi liềm: các bóng mờ phía sau (vệt chém mượt) + thân chính + lõi trắng
                const crescent = (scale) => {
                    ctx.beginPath();
                    ctx.arc(0, 0, b.w / 2 * scale, -Math.PI / 2, Math.PI / 2, false);
                    ctx.bezierCurveTo(b.w / 4 * scale, b.w / 2 * scale, b.w / 4 * scale, -b.w / 2 * scale, 0, -b.w / 2 * scale);
                };
                ctx.shadowBlur = 14; ctx.shadowColor = bulletColor;
                for (let g = 3; g >= 1; g--) {
                    ctx.save();
                    ctx.translate(-g * 6, 0);
                    ctx.globalAlpha = 0.18 * (4 - g) / 3;
                    crescent(1 - g * 0.06);
                    ctx.fill();
                    ctx.restore();
                }
                crescent(1);
                ctx.fill();
                ctx.globalAlpha = 0.85;
                ctx.fillStyle = '#ffffff';
                ctx.save(); ctx.translate(b.w * 0.06, 0); crescent(0.6); ctx.fill(); ctx.restore();
                ctx.restore();
                return;
            }

            // Vẽ Bóng Hư Ảnh (Storm Shadow)
            if (b.isStormShadow && typeof swDrawStormShadow === 'function') { swDrawStormShadow(b); return; }
            if (b.isStormShadow) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = (b.owner.id === 1) ? "#3498db" : "#e74c3c";
                ctx.fillRect(b.x, b.y, b.w, b.h); // Vẽ hình vuông giống player
                ctx.globalAlpha = 1;
                ctx.restore();
                return;
            }

            // --- THÊM ĐOẠN NÀY ĐỂ VẼ KIẾM MÀU (Bao gồm Kiếm Hư Vô màu tím) ---
            if (b.type === 'hu_vo') {
                if (typeof swDrawHuVoSword === 'function') swDrawHuVoSword(b); // Ám Kiếm (swords.js)
                else drawGlowingSword(b.x, b.y, b.w, b.h, '#8a2be2', b.vy < 0 ? -1 : 1); // Vẽ kiếm tím
                return;
            }

            if (b.isFloatingSwordGraphic) {
                // b.color được lưu từ class FloatingSword truyền sang
                if (!(typeof swDrawFloatingBullet === 'function' && swDrawFloatingBullet(b)))
                    drawGlowingSword(b.x, b.y, b.w, b.h, b.color || bulletColor, b.owner.id === 1 ? -1 : 1);
                return;
            }

            if (b.isThunderSpear) {
                ctx.save();
                let angle = Math.atan2(b.vy, b.vx);
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(angle);
                // Vệt sét phía sau cây giáo đang bay
                ctx.strokeStyle = 'rgba(255, 245, 157, 0.5)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-b.h / 2 - 4, 0); ctx.lineTo(-b.h / 2 - 14, 3); ctx.lineTo(-b.h / 2 - 22, -2); ctx.lineTo(-b.h / 2 - 34, 1); ctx.stroke();
                drawThunderSpearShape(b.h + 10, 1, true);
                ctx.restore();
                return;
            }

            if (b.isMagnetBullet) {
                if (typeof drawMagnetBulletArt === 'function') { drawMagnetBulletArt(b); return; }
                ctx.save();
                let isPos = (b.polarity === 1);
                ctx.fillStyle = isPos ? "#ff3300" : "#00aaff";
                ctx.shadowColor = isPos ? "#ff3300" : "#00aaff";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(isPos ? "+" : "-", b.x + b.w / 2, b.y + b.h / 2);
                ctx.restore();
                return;
            }

            // -----------------------------------------------------------------
            // Hình ảnh đạn theo loại (sao chổi, laser, mũi xuyên, cầu nổ, tinh thể băng, tên lửa...) - js/render/bullet-art.js
            drawBulletArt(b, bulletColor, this);
            ctx.globalAlpha = 1.0;
        });
    },

    drawUI() {
        // Tàng hình: Ẩn hoàn toàn thanh HP, đạn và khiên để không lộ vị trí
        if ((this.weapon === 'ghost' && this.isGhostActive) || (this.weapon === 'magician' && this.invisTimer > 0) || (this.weapon === 'shadow_hunter' && this.stealthActive)) {
            return;
        }

        // Toạ độ hàng UI cũ (giữ nguyên cho code UI riêng của từng body)
        let uiY, subUiY;
        if (this.id === 1) {
            uiY = Math.min(canvas.height - 18, this.y + this.h + 4);
        } else {
            uiY = Math.max(10, this.y - 15);
        }
        subUiY = uiY + 7;

        // HUD chung: HP (vạch mỗi 1 HP + số), khiên, đạn, hiệu ứng — js/render/tank-hud.js
        drawTankHUD(this);

        ctx.save();
        // UI riêng của body
        this.drawUIForInventor();
        this.drawUIForNecromancer(uiY, subUiY);
        this.drawUIForGenius(uiY, subUiY);
        this.drawUIForCung(uiY, subUiY);
        this.drawUIForCung2(uiY, subUiY);
        this.drawUIForThunder(uiY, subUiY);
        this.drawUIForMagnet(uiY, subUiY);

        // Huy hiệu cực tính bị nhiễm (Magnet)
        if (this.infectedPolarityTimer > 0) {
            let infY = (this.id === 1) ? this.y - 20 : this.y + this.h + 20;
            let isPos = (this.infectedPolarity === 1);
            ctx.fillStyle = isPos ? "rgba(255, 60, 0, 0.85)" : "rgba(0, 180, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, infY, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPos ? "+" : "-", this.x + this.w / 2, infY);
            ctx.textBaseline = "alphabetic";
        }

        this.drawUIForEvolution();

        ctx.restore();
        CharHooks.call(this, 'drawUI');
    }
});
