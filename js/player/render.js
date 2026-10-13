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

        ctx.fillStyle = drawColor;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.fillStyle = "#fff";
        let bx = this.x + this.w / 2 - 4;
        let by = (this.id === 1) ? this.y - 15 : this.y + this.h;
        if (this.weapon === 'smg') bx += (Math.random() - 0.5) * 8;
        this.drawTank(bx, by);

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
                drawGlowingSword(-4, -10, 8, 20, (this.id === 1) ? '#3498db' : '#e74c3c', this.id === 1 ? -1 : 1);
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

        // Vẽ UI Reload tụ lực
        if (this.sniperChargeTimer > 0) {
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x, this.y - 10, this.w * (this.sniperChargeTimer / 60), 5);
        }
        if (this.sniperReloading) {
            ctx.fillStyle = "orange";
            ctx.fillText("RELOADING...", this.x, this.y - 15);
            let reloadMax = (this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2')) ? 150 : 180;
            ctx.fillRect(this.x, this.y - 10, this.w * (1 - this.sniperReloadTimer / reloadMax), 5);
        }
        // Xử lý độ mờ cho Ghost
        this.drawGhost();

        // Vẽ Phantom (Bóng ma) - Evo 2 Ghost
        this.drawGhost2();

        if ((this.weapon === 'overload' || this.weapon === 'lazer_charge') && this.chargeLevel > 0) {
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
            // --- VẼ TIA SÁNG NEON (NƯỚC / LỬA) ---
            if (b.isWater || b.isFurnace) {
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

                ctx.beginPath();
                // 1. Vẽ lưng cong (Nửa vòng tròn)
                ctx.arc(0, 0, b.w / 2, -Math.PI / 2, Math.PI / 2, false);

                // 2. Vẽ bụng lõm (Bezier Curve) - Tạo hình khuyết
                ctx.bezierCurveTo(b.w / 4, b.w / 2, b.w / 4, -b.w / 2, 0, -b.w / 2);

                ctx.fill();
                ctx.shadowBlur = 10; ctx.shadowColor = bulletColor;
                ctx.fill();
                ctx.restore();
                return;
            }

            // Vẽ Bóng Hư Ảnh (Storm Shadow)
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
                drawGlowingSword(b.x, b.y, b.w, b.h, '#8a2be2', b.vy < 0 ? -1 : 1); // Vẽ kiếm tím
                return;
            }

            if (b.isFloatingSwordGraphic) {
                // b.color được lưu từ class FloatingSword truyền sang
                drawGlowingSword(b.x, b.y, b.w, b.h, b.color || bulletColor, b.owner.id === 1 ? -1 : 1);
                return;
            }

            if (b.isThunderSpear) {
                ctx.save();
                let angle = Math.atan2(b.vy, b.vx);
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(angle);
                ctx.fillStyle = "#ffff00";
                ctx.shadowColor = "#ffff00";
                ctx.shadowBlur = 12;
                ctx.fillRect(-b.h / 2, -b.w / 2, b.h, b.w);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-b.h / 4, -b.w / 4, b.h / 2, b.w / 2);
                ctx.restore();
                return;
            }

            if (b.isMagnetBullet) {
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
            if (this.weapon === 'lazer_auto') ctx.fillRect(b.x, b.y, b.w, b.h);
            else { ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1.0;
        });
    },

    drawUI() {
        // Tàng hình: Ẩn hoàn toàn thanh HP, đạn và khiên để không lộ vị trí
        if ((this.weapon === 'ghost' && this.isGhostActive) || (this.weapon === 'magician' && this.invisTimer > 0) || (this.weapon === 'shadow_hunter' && this.stealthActive)) {
            return;
        }

        // P1 (ở dưới): Vẽ PHÍA DƯỚI gầm xe
        // P2 (ở trên): Vẽ PHÍA TRÊN nóc xe
        let uiY;
        let subUiY;
        let shieldY;

        if (this.id === 1) {
            uiY = Math.min(canvas.height - 18, this.y + this.h + 4);
            subUiY = uiY + 7;
            shieldY = uiY + 14;
        } else {
            uiY = Math.max(10, this.y - 15);
            subUiY = uiY + 7;
            shieldY = uiY - 5;
        }

        // Smooth Ghost HP Tracking
        if (this.ghostHp === undefined) this.ghostHp = this.hp;
        if (this.ghostHp > this.hp) {
            this.ghostHp -= 0.05;
            if (this.ghostHp < this.hp) this.ghostHp = this.hp;
        } else if (this.ghostHp < this.hp) {
            this.ghostHp = this.hp;
        }

        // 1. Health Bar Background & Ghost Bar
        ctx.save();
        ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.fillRect(this.x - 4, uiY, this.w + 8, 6);
        ctx.strokeRect(this.x - 4, uiY, this.w + 8, 6);

        // Ghost Damage Bar
        let ghostWidth = Math.max(0, (this.ghostHp / this.maxHp) * (this.w + 8));
        ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
        ctx.fillRect(this.x - 4, uiY, ghostWidth, 6);

        // Active Health Bar (Neon Cyan cho P1, Neon Ruby/Pink cho P2)
        let hpWidth = Math.max(0, (this.hp / this.maxHp) * (this.w + 8));
        ctx.fillStyle = (this.id === 1) ? "#00f0ff" : "#ff0055";
        ctx.fillRect(this.x - 4, uiY, hpWidth, 6);

        // 2. Shield Indicator (Orbs)
        if (this.shield > 0) {
            ctx.fillStyle = "#00ffff";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#00ffff";
            let orbSpacing = Math.min(9, (this.w + 4) / Math.max(1, this.shield));
            for (let s = 0; s < this.shield; s++) {
                ctx.beginPath();
                ctx.arc(this.x + 2 + s * orbSpacing, shieldY, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        // 3. Thanh Đạn / Tài Nguyên
        if (this.weapon === 'water_gun' || this.weapon === 'furnace' || this.weapon === 'six_barrel' || this.weapon === 'the_strongest' || this.weapon === 'sukuna' || this.weapon === 'van_kiem' || this.weapon === 'tank' || this.weapon === 'storm') {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(this.x - 4, subUiY, this.w + 8, 4);

            let barColor = "#3498db";
            let ratio = 0;

            if (this.weapon === 'water_gun') { barColor = "#00bfff"; ratio = this.energy / this.maxEnergy; }
            else if (this.weapon === 'furnace') { barColor = "#ff6600"; ratio = this.energy / this.maxEnergy; }
            else if (this.weapon === 'six_barrel') {
                barColor = (this.isOverheated) ? "#ff0000" : (this.heat >= 75 ? "#ff3300" : (this.heat >= 50 ? "#ff9900" : "#ffd700"));
                ratio = this.heat / 100;
            }
            else if (this.weapon === 'the_strongest') {
                barColor = "#00ffff";
                ratio = this.chuLuc / this.maxChuLuc;
            }
            else if (this.weapon === 'sukuna') {
                barColor = "#e74c3c";
                ratio = (this.cursedEnergy || 0) / 100;
            }
            else if (this.weapon === 'van_kiem') {
                barColor = "#9b59b6";
                ratio = Math.min(1, (this.stanceSwordsAccumulated || 0) / 8);
            }
            else if (this.weapon === 'tank') {
                barColor = "#e67e22";
                ratio = 1;
            }
            else if (this.weapon === 'storm') {
                barColor = "#2ecc71";
                ratio = this.stormChargeRatio || 0;
            }

            ctx.fillStyle = barColor;
            ctx.shadowBlur = 6;
            ctx.shadowColor = barColor;
            ctx.fillRect(this.x - 4, subUiY, (this.w + 8) * Math.min(1, Math.max(0, ratio)), 4);
            ctx.shadowBlur = 0;
        }
        else if (this.maxAmmo > 0 && this.maxAmmo < 100) {
            // Ammo Pips
            if (this.sniperReloading) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, "RELOADING...", this.x + this.w / 2, subUiY + 5);
            } else {
                for (let i = 0; i < this.maxAmmo; i++) {
                    ctx.fillStyle = (i < this.ammo) ? "#ffd700" : "rgba(255, 255, 255, 0.15)";
                    let dotsize = ((this.w + 8) / this.maxAmmo) - 1.5;
                    if (dotsize < 2) dotsize = 2;
                    ctx.fillRect(this.x - 4 + i * (dotsize + 1.5), subUiY, dotsize, 4);
                }
            }
        }

        // Inventor Linh Kiện (LK) Display
        this.drawUIForInventor();

        // Chiêu Hồn Sư (Necromancer) HUD
        this.drawUIForNecromancer(uiY, subUiY);

        // Thiên Tài (Genius) HUD
        this.drawUIForGenius(uiY, subUiY);

        // Cung Charge Bar & State
        this.drawUIForCung(uiY, subUiY);

        // Bow Nhạy Bén (Dodge) Status Indicator
        this.drawUIForCung2(uiY, subUiY);

        // Status Badges (Burn, Silence)
        if (this.burnStacks > 0) {
            for (let k = 0; k < this.burnStacks; k++) {
                ctx.fillStyle = "#ff6600";
                ctx.fillRect(this.x + k * 7, (this.id === 1) ? uiY - 12 : subUiY + 12, 5, 5);
            }
        }

        if (this.silenceTimer > 0 && this.freezeTimer <= 0) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, "SILENCE", this.x + this.w / 2, (this.id === 1) ? uiY - 14 : subUiY + 22);
        }

        // Thunder HUD
        this.drawUIForThunder(uiY, subUiY);

        // Magnet HUD
        this.drawUIForMagnet(uiY, subUiY);

        // Infected Polarity Badge
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

        // Evolution HUD
        this.drawUIForEvolution();

        ctx.restore();
        CharHooks.call(this, 'drawUI');
    }
});
