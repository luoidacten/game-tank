// ==========================================
// Player — Vòng cập nhật & xử lý phím bắn (phần dùng chung)
// ==========================================

Object.assign(Player.prototype, {
    update() {

        this.updateBullets();
        const inp = (this.id === 1) ? inputs.p1 : inputs.p2;
        const now = Date.now();

        // Xử lý hiệu ứng Chảy Máu (Bleed)
        if (this.bleedTimer > 0) {
            this.bleedTimer--;
            if (this.bleedTimer % 12 === 0) {
                let bleedAmt = this.bleedDmg || (this.maxHp * 0.02);
                this.hp = Math.max(0.05, this.hp - bleedAmt);
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2 + (Math.random() - 0.5) * 20, this.y - 12, `-${bleedAmt.toFixed(2)} 🩸`, "#ff0055", 11);
                if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ff0055", 3);
            }
        }

        // Xử lý hiệu ứng Mù Bảng Điều Khiển (Blindness)
        if (this.blindTimer > 0) {
            this.blindTimer--;
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);
            if (isMyTank) {
                const ctrlEl = (this.id === 1 || isOnline) ? document.getElementById('p1-controls') : document.getElementById('p2-controls');
                if (ctrlEl && !ctrlEl.classList.contains('blinded-hud')) {
                    ctrlEl.classList.add('blinded-hud');
                }
            }
        } else {
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);
            if (isMyTank) {
                const ctrlEl = (this.id === 1 || isOnline) ? document.getElementById('p1-controls') : document.getElementById('p2-controls');
                if (ctrlEl && ctrlEl.classList.contains('blinded-hud')) {
                    ctrlEl.classList.remove('blinded-hud');
                }
            }
        }
        // --- FIX LỖI 6 NÒNG: KHAI BÁO EFFECTIVE INPUT Ở TRÊN CÙNG ---
        let effectiveInp = { l: inp.l, r: inp.r, s: inp.s };
        // TẦNG 4+: QUÁ TẢI ĐẦU VÀO (CHỈ DELAY NÚT BẮN & CHỈ TÁC DỤNG LÚC NHẤP)
        if (this.confusionStacks >= 4) {
            this.inputDelayQueue.push(inp.s); // Chỉ lưu lịch sử của nút Bắn
            let delayFrames = Math.min((this.confusionStacks - 3) * 10, 25); // Trễ tối đa ~0.4s

            if (this.inputDelayQueue.length > delayFrames) {
                let delayedS = this.inputDelayQueue.shift();
                // Kích hoạt: Nhấp thì bị trễ (đợi lấy delayedS ra).
                // Giữ nguyên nút bắn thì sau khoảng delay ban đầu, game sẽ nhận liên tục là true.
                effectiveInp.s = delayedS;
            } else {
                effectiveInp.s = false; // Đang trong tích tắc delay ban đầu
            }
            // Không can thiệp vào effectiveInp.l và effectiveInp.r nữa (Cho phép di chuyển mượt)
        } else {
            this.inputDelayQueue = [];
        }

        // TẦNG 1-3+: LOẠN ẢNH (Đảo ngược ngắt quãng)
        if (this.confusionStacks > 0) {
            if (Math.random() < 0.05 * this.confusionStacks) {
                this.confusionTimer = 15 + Math.random() * 30; // Giật cục random từ 0.25s - 0.75s
            }
            if (this.confusionTimer > 0) {
                this.confusionTimer--;
                let tempL = effectiveInp.l;
                effectiveInp.l = effectiveInp.r;
                effectiveInp.r = tempL;
            }
        }
        if (this.silenceTimer > 0) {
            effectiveInp.s = false; // Bị câm lặng -> ép nút bắn thành false
        }
        // -------------------------------------------------------------

        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
            ctx.fillRect(this.x - 5, this.y - 5, this.w + 10, this.h + 10);
            return;
        }
        this.updateIce();
        

        if (this.slowTimer > 0) this.slowTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.silenceTimer > 0) this.silenceTimer--;// ... các timer khác cũng giảm dần tương tự ...

        // 1. Gojo Passive Cursed Energy Regen (chỉ hồi khi không bị tấn công trong 2.5s)
        if (this.chuLucRegenCooldown > 0) {
            this.chuLucRegenCooldown--;
        } else if (this.weapon === 'the_strongest' && this.chuLuc < this.maxChuLuc) {
            this.chuLuc = Math.min(this.chuLuc + this.chuLucRegenRate, this.maxChuLuc);
        }
        // 2. Logic Hất tung (Knockback) - Chỉ tác động theo trục ngang (X)
        if (Math.abs(this.kbX) > 0.1) {
            this.x += this.kbX;
            this.kbX *= 0.85;

            // Check va chạm tường khi bị hất
            let hitWall = false;
            if (this.x <= 0) { this.x = 0; hitWall = true; }
            if (this.x + this.w >= canvas.width) { this.x = canvas.width - this.w; hitWall = true; }

            // Gây sát thương nếu đập tường do đòn Đỏ
            if (hitWall && this.kbFromRed) {
                this.takeDamage(2, null, { isEnvironmental: true }); // Dame đập tường
                this.kbFromRed = false; // Chỉ nhận dame 1 lần
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'red', 0, this));
                this.kbX = 0;
            }
        }
        this.kbY = 0; // Triệt tiêu hoàn toàn lực hất theo phương dọc
        //logic Axit-kỹ sư//
        if (this.acidBurnTimer > 0) {
            this.acidBurnTimer--;
            // Hiệu ứng visual khi bị cháy acid
            if (this.acidBurnTimer % 10 === 0) {
                ctx.fillStyle = "#32CD32";
                ctx.fillRect(this.x + Math.random() * this.w, this.y + Math.random() * this.h, 4, 4);
                if (this.weapon === 'the_strongest') {
                    this.takeDamage(0.15, null, { isEnvironmental: true });
                } else if (this.hp > 1) {
                    this.hp = Math.max(1, this.hp - 0.15);
                }
            }
        }
        // ==========================================
        // --- LOGIC NHÀ PHÁT MINH (INVENTOR) ---
        // ==========================================
        this.updateInventor(inp, now, effectiveInp);

        // --- BINDING CURSE COUNTDOWN ---
        if (this.bindingCurseTimer > 0) {
            this.bindingCurseTimer--;
            if (this.bindingCurseTimer <= 0) {
                this.bindingCurseStacks = 0;
            }
        }

        // ==========================================
        // --- LOGIC KẺ SÁNG TẠO (CREATOR) ---
        // ==========================================
        this.updateCreator(inp);

        // ==========================================
        // --- LOGIC CHIÊU HỒN SƯ (NECROMANCER) ---
        // ==========================================
        this.updateNecromancer(now, effectiveInp);

        // ==========================================
        // --- LOGIC THIÊN TÀI (GENIUS) ---
        // ==========================================
        if (this.updateGenius(now, effectiveInp)) return;

        // ==========================================
        // --- LOGIC MAGICIAN (AI PHÂN ẢNH & KỸ NĂNG) ---
        // ==========================================
        this.updateMagician(now, effectiveInp);
        // --- LOGIC ĐỐT MÁU (FURNACE) ---
        if (this.burnTimer > 0) {
            this.burnTimer--;
            // Mỗi giây (60 frames) trừ máu
            if (this.burnTimer % 60 === 0 && this.hp > 1) {
                // Sát thương 0.05/s nhân với số stack cộng dồn
                this.hp -= (0.1 * this.burnStacks);
                if (this.hp < 1) this.hp = 1; // Không để chết vì Đốt
            }

            // [MỚI] Hết giờ -> Giảm dần 1 stack mỗi lần thay vì mất hết
            if (this.burnTimer <= 0 && this.burnStacks > 0) {
                this.burnStacks--; // Rớt 1 stack
                if (this.burnStacks > 0) {
                    // Nếu vẫn còn stack, duy trì thêm 1 giây (60 frames) để rớt từ từ
                    this.burnTimer = 60;
                }
            }
        }

        // --- LOGIC HỒI NỘI NĂNG (ENERGY REGEN) ---
        if (this.weapon === 'water_gun' || this.weapon === 'furnace') {
            // Evo 2 Súng Nước: Hồi liên tục 0.5%/s bất chấp hoàn cảnh
            if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_2')) {
                this.energy = Math.min(this.maxEnergy, this.energy + (0.5 / 60));
            }

            // Dừng bắn 1 giây (1000ms) bắt đầu hồi nội năng
            if (now - this.lastShot > 1000) {
                let regenRate = 10 / 60; // Base: 10%/giây
                if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_1')) {
                    regenRate = 15 / 60; // Evo 1: 15%/giây
                }
                this.energy = Math.min(this.maxEnergy, this.energy + regenRate);
            }
        }

        // --- GHI HÌNH QUÁ KHỨ (PARADOX) ---
        // Duplicate Paradox recording block removed

        // --- GHI HÌNH QUÁ KHỨ (PARADOX) ---
        this.updateParadox();

        // handleShooting called once at end of update
        // [FIX LỖI 1] - ĐÁNH DẤU LỊCH SỬ CHỈ KHI ĐẠN THỰC SỰ ĐƯỢC BẮN RA (Bỏ qua những frame đang chờ Cooldown)
        this.updateParadox2(now);
        // ... trong phương thức update() ...

        this.updateGhost();

        // --- LOGIC AAA (AUTO FIRE) ---
        this.updateAaa();
        this.updateEngineer(inp);

        // ==========================================
        // --- LOGIC SẤM CHỚP (THUNDER) ---
        // ==========================================
        this.updateThunder();

        // ==========================================
        // --- LOGIC NAM CHÂM (MAGNET) ---
        // ==========================================
        if (this.updateMagnet()) return;

        // Đếm lùi nhiễm từ tính trên người chơi
        if (this.infectedPolarityTimer > 0) {
            this.infectedPolarityTimer--;
            if (this.infectedPolarityTimer <= 0) {
                this.infectedPolarity = 0;
            }
        }

        // ==========================================
        // --- LOGIC VUA ĐẦU BẾP (SUKUNA) ---
        // ==========================================
        if (this.updateSukuna(now, effectiveInp)) return;

        // --- LOGIC CUỒNG PHONG (STORM) ---
        if (this.updateStorm(effectiveInp)) return;
        // --- LOGIC FULL EVO: PHONG TRẢM (WIND SLASH) ---
        this.updateWindSlash();

        // --- LOGIC FULL EVO: CUỒNG PHONG (STORM) ---
        this.updateStorm2();

        this.updateSmg(now);

        // --- LOGIC TANK HÚC ---
        if (this.updateTank()) return;

        // --- NỘI TẠI KIẾM THỂ THỦ ---
        if ((this.weapon === 'blade_god' || this.weapon === 'van_kiem') && this.shield > 0 && !this.swordShieldActive) {
            this.shield--; // Chuyển hóa 1 lớp khiên thường thành Kiếm Thể
            this.swordShieldActive = true;
            this.swordShieldTimer = 60; // 5s
            this.swordShieldHits = 1;
        }

        if (this.swordShieldActive) {
            this.swordShieldTimer--;
            if (this.swordShieldTimer <= 0 || this.swordShieldHits <= 0) {
                // Đổi xong hoặc hết giờ -> Bắn trả kiếm
                this.swordShieldActive = false;
                let count = 3;
                let isHoming = false;
                let dirY = (this.id === 1) ? -1 : 1;

                for (let k = 0; k < count; k++) {
                    let angle = (Math.PI / count) * k - Math.PI / 2;
                    floatingSwords.push(new FloatingSword(this.x + this.w / 2, this.y, 10, 30, Math.cos(angle) * 10, dirY * 10, 0, this.damage, false, isHoming, this));
                }
            }
        }
        // ==========================================
        // --- LOGIC MIRROR (HOÁN ĐỔI VÀ BUFF GƯƠNG VỠ) ---
        // ==========================================
        this.updateMirror(effectiveInp);

        // --- DI CHUYỂN BÌNH THƯỜNG ---

        CharHooks.call(this, 'update', inp, effectiveInp, now);

        let currentSpeed = this.speed;
        if (this.slowTimer > 0) currentSpeed *= 0.5;
        if (this.acidBurnTimer > 0) currentSpeed *= 0.75;
        if (this.acidZoneSlow > 0) { currentSpeed *= 0.75; this.acidZoneSlow--; }
        currentSpeed = this.updateGenius2(currentSpeed);
        currentSpeed = this.updateVanKiem(currentSpeed);
        currentSpeed = this.updateSniper(currentSpeed);
        // THÊM BUFF TỐC ĐỘ CHO MIRROR
        currentSpeed = this.updateMirror2(currentSpeed);
        // BUFF TỐC ĐỘ CHO GHOST KHI TÀNG HÌNH (VÔ ẢNH)
        currentSpeed = this.updateGhost2(currentSpeed);
        // ==========================================
        // --- GIẢM TỐC ĐỘ SUKUNA KHI CẠN CHÚ LỰC ---
        // ==========================================
        currentSpeed = this.updateSukuna2(currentSpeed);
        // ==========================================
        // --- LOGIC CUNG (BODY TỤ LỰC & MƯA TÊN) ---
        // ==========================================
        // Thêm vào đầu phần logic Cung trong Player.update()
        if (this.weapon === 'cung') {
            let isFullEvo = this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2');
            let inp = effectiveInp;
            let enemy = (this.id === 1) ? p2 : p1;

            // Mưa toàn màn hình lặp lại mỗi 8 giây (Full Evo)
            if (isFullEvo) {
                if (this.globalRainTimer === undefined) this.globalRainTimer = 0;
                this.globalRainTimer++;
                if (this.globalRainTimer >= 480) { // 8 giây * 60fps
                    arrowRains.push(new ArrowRain(this, 0, 0, 0, true)); // Gọi mưa global
                    this.globalRainTimer = 0;
                }
            }

            // Giảm CD Mưa Tên (Full Evo giảm 8s -> còn 2s, mặc định 10s)
            let maxRainCD = isFullEvo ? 2000 : 10000;
            if (this.rainCD > 0) this.rainCD -= 1000 / 60;

            // Nội tại Nhạy Bén: Đếm ngược hồi chiêu né đạn (8s = 480 frames, Full Evo 5s = 300 frames)
            if (this.bowDodgeCooldown > 0) {
                this.bowDodgeCooldown--;
                if (this.bowDodgeCooldown <= 0) {
                    this.bowDodgeReady = true;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 10, "⚡ NHẠY BÉN SẴN SÀNG", "#00ffcc", 13);
                }
            }

            // 1. LOGIC LƯỚT (DASH) - Nội tại Cơ Động
            if (this.isDashing) {
                let dx = this.dashTargetX - this.x;
                let dy = this.dashTargetY - this.y;
                let dist = Math.hypot(dx, dy);

                if (dist < 5 || this.x <= 0 || this.x + this.w >= canvas.width || this.y <= 0 || this.y + this.h >= canvas.height) {
                    this.isDashing = false;
                    // Full Evo: Lướt xong hồi Full đạn
                    if (isFullEvo) this.ammo = this.maxAmmo;
                } else {
                    // Tốc độ lướt một quãng ngắn
                    this.x += (dx / dist) * 15;
                    this.y += (dy / dist) * 15;
                }
                return; // Đang lướt thì không làm hành động khác
            }

            // 2. TỤ LỰC CUNG: GIỮ NÚT ĐỂ KÉO (nạp nhanh x1.6), NHẢ RA ĐỂ BẮN
            this.prevInpS = !!inp.s;
            if (inp.s && !this.bowIsCharging && this.ammo > 0) {
                this.bowIsCharging = true;
                this.bowChargeTimer = 0;
                this.crosshairX = enemy.x + enemy.w / 2;
                this.crosshairY = enemy.y + enemy.h / 2;
            } else if (!inp.s && this.bowIsCharging) {
                let chargeSec = this.bowChargeTimer / 60;
                this.fireBow(chargeSec, isFullEvo);
                this.triggerBowDodgeDash(inp);
                this.bowIsCharging = false;
                this.bowChargeTimer = 0;
            }

            // Trong lúc đang tụ lực (đầy lực thì giữ nguyên tới khi nhả nút)
            if (this.bowIsCharging) {
                this.bowChargeTimer = Math.min(150, this.bowChargeTimer + 1.6);
                let chargeSec = this.bowChargeTimer / 60;

                // Tốc độ di chuyển chỉ bị giảm 15% (currentSpeed *= 0.85)
                currentSpeed *= 0.85;

                // Cập nhật hồng tâm đuổi theo địch khi chargeSec >= 2s
                if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2')) {
                    let dx = (enemy.x + enemy.w / 2) - this.crosshairX;
                    let dy = (enemy.y + enemy.h / 2) - this.crosshairY;
                    this.crosshairX += dx * 0.1;
                    this.crosshairY += dy * 0.1;
                    let shrinkRatio = Math.min((chargeSec - 2) / 1.5, 1);
                    this.crosshairRadius = 150 - (shrinkRatio * 120);
                }
            }

            // Vẽ vùng hồng tâm cảnh báo
            if (this.bowChargeTimer / 60 >= 2 && this.hasUpgrade('evo_cung_2')) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.crosshairX, this.crosshairY, this.crosshairRadius, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }

        // ==========================================
        // --- LOGIC SHADOW HUNTER UPDATE ---
        // ==========================================
        currentSpeed = this.updateShadowHunter(now, currentSpeed);

        // ==========================================
        // --- LOGIC SHORTGUN UPDATE ---
        // ==========================================
        this.updateShortgunATK();

        // ==========================================
        // --- MOTION BLUR / GHOST TRAIL TRACKING ---
        // ==========================================
        let isDashingMotion = this.isDashing || this.isShortgunDashing || (this.weapon === 'tank' && this.isCharging) || (this.weapon === 'magician' && this.magicianSpeedBuff > 0);
        if (isDashingMotion) {
            if (!this.trailHistory) this.trailHistory = [];
            this.trailHistory.unshift({ x: this.x, y: this.y, w: this.w, h: this.h, color: this.color });
            if (this.trailHistory.length > 5) this.trailHistory.pop();
        } else if (this.trailHistory && this.trailHistory.length > 0) {
            this.trailHistory.pop();
        }

        // ==========================================
        // --- GIẢM TỐC 6 NÒNG DỰA TRÊN NHIỆT & XẢ ĐẠN ---
        currentSpeed = this.updateSixBarrel(effectiveInp, currentSpeed);
        // --- GIẢM TỐC KHI NIỆM CHÚ GOJO & SUKUNA ---
        currentSpeed = this.updateTheStrongest(currentSpeed);
        currentSpeed = this.updateSukuna3(currentSpeed);
        // --- GIẢM TỐC KHI PHUN LIÊN TỤC ---
        if (inp.s && this.energyChargeTimer >= 60) {
            if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_1')) {
                currentSpeed *= 0.2; // Súng nước kéo nặng -> Giảm tốc mạnh
            }
            if (this.weapon === 'furnace' && this.hasUpgrade('evo_furnace_1')) {
                currentSpeed *= 0.1; // Lò nung -> Chậm vừa
            }
        }

        // Trạng thái chung (vùng làm chậm...) & hook tốc độ của body mới
        currentSpeed *= (this.statusSpeedMult === undefined ? 1 : this.statusSpeedMult);
        if (CharHooks.has(this, 'speed')) currentSpeed = CharHooks.call(this, 'speed', currentSpeed);

        const prevXForStone = this.x;
        if (inp.l) this.x -= currentSpeed;
        if (inp.r) this.x += currentSpeed;

        this.updatePortal();
        if (bodyEffects.length) resolveStoneBlocking(this, prevXForStone);

        // Tự động hồi đạn lẻ theo thời gian (Chặn khi Shadow Hunter đang tàng hình)
        if (this.weapon !== 'tank' && this.weapon !== 'sniper' && this.weapon !== 'smg' && !(this.weapon === 'shadow_hunter' && this.stealthActive)) {
            if (this.ammo < this.maxAmmo && now - this.lastShot > this.reloadTime) {
                if (now - this.lastReload > 500) { this.ammo++; this.lastReload = now; }
            }
        }
        // --- LOGIC SNIPER (RELOAD VÀ TẠO TƯỜNG) ---
        currentSpeed = this.updateSniper2(now, effectiveInp, currentSpeed);
        // --- LOGIC NHIỆT (SIX BARREL) ---
        this.updateSixBarrel2(effectiveInp);

        // Truyền input đã được xử lý câm lặng vào hàm bắn
        this.handleShooting(effectiveInp, now);

    },

    handleShooting(inp, now) {
        if (this.weapon === 'cung') return;
        if (CharHooks.call(this, 'shoot', inp, now) === true) return;

        // ==========================================
        // SHADOW HUNTER
        // ==========================================
        if (this.shootShadowHunter(inp, now)) return;

        // ==========================================
        // SHORTGUN
        // ==========================================
        if (this.shootShortgunATK(inp, now)) return;

        // ==========================================
        // --- CHẶN ĐẠN THƯỜNG CỦA SUKUNA ---
        // ==========================================
        if (this.shootSukuna(inp, now)) return;
        // ==========================================
        // SNIPER
        // ==========================================
        if (this.shootSniper(inp, now)) return;
        // ==========================================
        // MIRROR
        // ==========================================
        if (this.shootMirror(inp, now)) return;
        // ==========================================
        // --- LOGIC MAGICIAN (KỸ NĂNG CHỦ ĐỘNG) ---
        // ==========================================
        if (this.shootMagician(inp, now)) return;
        if (this.shootTheStrongest(inp)) return;
        // --- LOGIC BẮN 6 NÒNG (SIX BARREL) ---
        if (this.shootSixBarrel(inp, now)) return;
        // --- LOGIC PARADOX ---
        // --- LOGIC PARADOX (ACTIVE PARADOX) ---
        // --- LOGIC PARADOX (ACTIVE PARADOX) ---
        if (this.shootParadox(inp, now)) return;
        // --- LOGIC SÚNG NƯỚC (WATER GUN) ---
        if (this.shootWaterGun(inp, now)) return;

        // --- LOGIC LÒ NUNG (FURNACE) ---
        if (this.shootFurnace(inp, now)) return;
        // --- LOGIC KIẾM TRẬN (VAN KIEM) ---
        if (this.shootVanKiem(inp)) return;

        // --- LOGIC KIẾM TÔN (BLADE GOD) ---
        if (this.shootBladeGod(inp, now)) return;
        if (this.shootTank(inp)) return;
        // --- LOGIC CUỒNG PHONG (STORM) - TỰ TỤ LỰC & NHẤN ĐỂ XUẤT CHIÊU ---
        if (this.shootStorm(inp)) return;

        // 3. LOGIC PHONG TRẢM (WIND SLASH) - FIX LỖI NẠP ĐẠN
        if (this.shootWindSlash(inp, now)) return;
        /// (aaa)
        if (this.shootAaa(inp, now)) return;

        if (this.shootOverload(inp, now)) return;
        if (this.shootLazerCharge(inp, now)) return;

        if (this.shootRocket(inp, now)) return;
        if (this.shootEngineer(inp, now)) return;

        if (this.shootThunder(inp, now)) return;

        if (this.shootMagnet(inp, now)) return;

        // --- LOGIC PORTAL (MỚI) ---
        if (this.shootPortal(inp, now)) return;

        if (this.shootSmg(inp, now)) return;
        if (this.weapon === 'necromancer' || this.weapon === 'genius') {
            return;
        }
        if (inp.s) {
            if (this.ammo > 0 && now - this.lastShot > 500) {
                this.fireBullet(1);
                this.ammo--;
                this.lastShot = now;
                inp.s = false;

            }
        }
    }
});
