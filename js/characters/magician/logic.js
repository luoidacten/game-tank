// ==========================================
// magician (magician) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

const MAG_CLONE_CD = 600; // hồi chiêu Phân Ảnh Khiên: 10s

// ------------------------------------------
// THOÁT CHẾT: sắp nhận đòn chí mạng -> huỷ cái chết, dịch chuyển tới chỗ khác trên làn,
// để lại 1 phân ảnh mồi ở chỗ cũ. 1 lần/hiệp (Full Evo: 2 lần).
// ------------------------------------------
function magEscapeTargetX(p) {
    const enemy = p.id === 1 ? p2 : p1;
    const minX = 6, maxX = canvas.width - p.w - 6;
    const ox = p.x;
    let best = null, bestScore = -1e9;
    for (let x = minX; x <= maxX; x += 8) {
        const far = Math.abs(x - ox);
        let score = Math.min(far, 220) + Math.random() * 40;
        if (far < 110) score -= 400; // phải đi đủ xa
        // tránh cột có đạn địch đang lao tới
        if (enemy && enemy.bullets) {
            for (const b of enemy.bullets) {
                const towards = p.id === 1 ? b.vy > 0 : b.vy < 0;
                if (towards && Math.abs(b.x + (b.w || 0) / 2 - (x + p.w / 2)) < p.w) score -= 60;
            }
        }
        // tránh đứng thẳng hàng nòng địch
        if (enemy && Math.abs(enemy.x + enemy.w / 2 - (x + p.w / 2)) < 30) score -= 50;
        if (score > bestScore) { bestScore = score; best = x; }
    }
    return Math.max(0, Math.min(canvas.width - p.w, best === null ? ox : best));
}

function magTryEscape(p) {
    if (p.weapon !== 'magician' || !((p.magEscapeLeft || 0) > 0)) return false;
    p.magEscapeLeft--;
    const oldX = p.x, oldY = p.y;
    // Phân ảnh mồi đứng ở chỗ cũ (rõ nét, ăn đạn ngay -> kích hoạt Bẫy Nổ)
    if (!p.illusions) p.illusions = [];
    if (p.illusions.length >= 2) p.illusions.shift();
    const now = Date.now();
    p.illusions.push({
        x: oldX, y: oldY, w: p.w, h: p.h,
        hp: Math.max(p.hp, 1), maxHp: p.maxHp || 1,
        type: 'dash', vx: 0, decoy: true,
        spawnTime: now, lifeTime: 20000, invisTimer: 0,
        ammo: p.ammo, maxAmmo: p.maxAmmo || 7,
        lastShot: now, behaviorTimer: 0
    });
    p.x = magEscapeTargetX(p);
    p.hp = Math.min(p.maxHp, Math.max(p.hp, 1));
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 60); // 1s bất tử
    p.invisTimer = Math.max(p.invisTimer || 0, 60);
    p.bleedTimer = 0; p.burnTimer = 0; p.acidBurnTimer = 0; // không chết lại ngay vì sát thương theo thời gian
    p.kbX = 0;
    const cy = oldY + p.h / 2;
    magHatRain(p, oldX + p.w / 2, 4, 34, true);
    magHatRain(p, p.x + p.w / 2, 3, 22);
    explosions.push(new Explosion(oldX + p.w / 2, cy, 70, 'rgba(160, 150, 190, 0.75)', 0, p));
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 40, 'magenta', 0, p));
    addFloatingText(oldX + p.w / 2, oldY + (p.id === 1 ? -26 : p.h + 30), 'THOÁT CHẾT!', '#e056fd', 18);
    triggerScreenShake(5, 12);
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playRevive) soundSystem.playRevive();
    return true;
}

CharHooks.register('magician', {
    beforeLethal() { return magTryEscape(this); },
    drawUI() { if (typeof magDrawEscapeHats === 'function') magDrawEscapeHats(this); },
});

Object.assign(Player.prototype, {
    // [setupForNewRound] magician
    setupMagician() {
        if (this.weapon === 'magician') {
            this.illusions = []; // Mảng chứa các phân ảnh
            this.magicianCharge = 0; // Thời gian giữ nút s
            this.invisTimer = 0; // Thời gian tàng hình
            this.magicianSpeedBuff = 0; // Buff tốc khi hoán đổi

            // Trạng thái Debuff trên người (Để gán cho địch khi bắn trúng)
            this.confusionStacks = 0; // Tầng Loạn Ảnh
            this.vulnerableStacks = 0; // Tầng Suy Yếu (Debuff Stack)
            this.confusionTimer = 0; // Thời gian duy trì đảo ngược phím
            this.confusionActive = false; // Trạng thái đang bị đảo phím

            this.inputDelayQueue = []; // Hàng đợi lệnh delay (Tầng 4)
            this.jumpscareTimer = 0; // Kích hoạt bóng ma hù dọa

            this.fakeCrates = []; // Hòm ảo
            this.fakeBullets = []; // Đạn ảo

            // Phân Ảnh Khiên (giữ 0.5s): hồi chiêu riêng 10s (tick)
            this.magCloneCd = 0;
            // Thoát Chết: 1 lần/hiệp, Full Evo 2 lần
            this.magEscapeMax = (this.hasUpgrade('evo_mag_1') && this.hasUpgrade('evo_mag_2')) ? 2 : 1;
            this.magEscapeLeft = this.magEscapeMax;
        }
    },

    // [update] magician
    updateMagician(now, effectiveInp) {
        if (this.weapon === 'magician') {
            // Tốc độ cơ bản nhanh hơn (Khắc phục việc không có speedMult)
            let baseSpd = C.baseSpeed * 1.3;
            if (this.magicianSpeedBuff > 0) {
                this.magicianSpeedBuff--;
                baseSpd *= 1.5; // Tăng mạnh tốc sau khi đổi vị trí
            }

            // Xử lý Tàng hình & Vô địch
            if (this.invisTimer > 0) this.invisTimer--;
            if (this.magCloneCd > 0) this.magCloneCd--;

            // Cập nhật tốc độ lướt (Ghi đè logic di chuyển cơ bản nếu cần, hoặc cộng thêm vào vx)
            if (effectiveInp.l) this.x -= (baseSpd - C.baseSpeed); // Bù thêm phần chênh lệch tốc độ
            if (effectiveInp.r) this.x += (baseSpd - C.baseSpeed);

            // --- AI ĐIỀU KHIỂN PHÂN ẢNH ---
            const enemy = this.id === 1 ? p2 : p1;
            let hasEvo1 = this.hasUpgrade('evo_mag_1');
            let hasEvo2 = this.hasUpgrade('evo_mag_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            for (let i = this.illusions.length - 1; i >= 0; i--) {
                let ill = this.illusions[i];
                let age = now - ill.spawnTime;

                if (age > ill.lifeTime) { this.illusions.splice(i, 1); continue; }
                if (ill.invisTimer > 0) ill.invisTimer--;
                if (ill.speedBuff > 0) ill.speedBuff--;

                let illSpd = C.baseSpeed * (ill.speedBuff > 0 ? 1.5 : 1);

                if (ill.type === 'ghost') {
                    ill.behaviorTimer--;

                    // 1. Nhận diện & Né đạn (Hoạt động mượt hơn)
                    let nearBullet = false; let incomingBullet = null;
                    for (let b of enemy.bullets) {
                        let dist = Math.hypot(b.x - (ill.x + ill.w / 2), b.y - (ill.y + ill.h / 2));
                        if (dist < 80) { nearBullet = true; incomingBullet = b; break; }
                    }

                    if (nearBullet && Math.random() < (isFullEvo ? 0.8 : 0.6)) {
                        ill.vx = incomingBullet.x > ill.x ? -illSpd : illSpd;
                        ill.behaviorTimer = 20; // Khóa hướng lùi né trong 20 frames
                    }
                    // 2. Logic Thay đổi hành vi theo Evo
                    else if (ill.behaviorTimer <= 0) {
                        ill.behaviorTimer = 30 + Math.random() * 60; // Nghĩ lại hành động sau 0.5 - 1.5s

                        if (isFullEvo) {
                            // FULL EVO AI: Ép góc, Lách nhẹ, Bám đuổi
                            let dx = enemy.x - ill.x;
                            let rand = Math.random();
                            if (rand < 0.4) { // 40% Đi theo trục X của địch để ép góc
                                ill.vx = dx > 0 ? illSpd : -illSpd;
                            } else if (rand < 0.6) { // 20% Đứng im giả dạng
                                ill.vx = 0;
                            } else { // 40% Đi lang thang nhử đạn
                                ill.vx = (Math.random() > 0.5 ? 1 : -1) * illSpd;
                            }
                        } else if (hasEvo2) {
                            // EVO 2 AI: Đổi hướng ngẫu nhiên không cần đợi chạm tường
                            ill.vx = (Math.random() > 0.5 ? 1 : -1) * illSpd;
                        }
                    }

                    ill.x += ill.vx;
                    // Chạm tường vẫn phải quay đầu
                    if (ill.x < 0) { ill.x = 0; ill.vx *= -1; ill.behaviorTimer = 0; }
                    if (ill.x + ill.w > canvas.width) { ill.x = canvas.width - ill.w; ill.vx *= -1; ill.behaviorTimer = 0; }
                }

                // 3. Logic Hồi Đạn cho Phân Ảnh (Giả lập giống hệt Player)
                if (now - ill.lastShot > C.reloadTime) {
                    ill.ammo = ill.maxAmmo;
                }

                // 4. Logic Bắn Đạn Thông Minh
                let wantToShoot = false;
                if (isFullEvo) {
                    let dx = enemy.x - ill.x;
                    if (Math.abs(dx) < 35 && Math.random() < 0.7) {
                        wantToShoot = true; // Nếu địch nằm ngay trên đầu/dưới chân -> Bắn quyết liệt
                    } else if (Math.random() < 0.03) {
                        wantToShoot = true; // Bắn ép góc/dọa dẫm ngẫu nhiên
                    }
                } else if (hasEvo2) {
                    if (Math.random() < 0.04) wantToShoot = true; // Bắn ngẫu nhiên vừa phải
                } else {
                    if (Math.random() < 0.015) wantToShoot = true; // Bắn hên xui (Base)
                }

                if (wantToShoot && ill.ammo > 0 && now - ill.lastShot > 500) {
                    let dirY = this.id === 1 ? -1 : 1;
                    this.bullets.push({
                        type: 'normal',
                        x: ill.x + ill.w / 2 - 2.5,
                        y: this.id === 1 ? ill.y : ill.y + ill.h,
                        w: 5, h: 5, vx: 0, vy: dirY * C.bulletSpeed,
                        dmg: this.damage * 0.25, owner: this, bounceCount: 0, hitIds: [], isPiercing: false
                    });
                    ill.ammo--;
                    ill.lastShot = now;
                }
            }

            // TẦNG 3: BÓNG MA HÙ DỌA (Đạn ảo)
            if (enemy.confusionStacks >= 3) {
                this.jumpscareTimer++;
                if (this.jumpscareTimer > 180 + Math.random() * 180) {
                    this.jumpscareTimer = 0;
                    let dirY = this.id === 1 ? -1 : 1;
                    this.fakeBullets.push({
                        x: enemy.x + (Math.random() > 0.5 ? 50 : -50),
                        y: this.id === 1 ? enemy.y + 120 : enemy.y - 120,
                        w: 5, h: 5, vx: 0, vy: -dirY * C.bulletSpeed // Bay ngược thẳng vào đối thủ
                    });
                }
            }

            // Di chuyển đạn ảo
            for (let i = this.fakeBullets.length - 1; i >= 0; i--) {
                let fb = this.fakeBullets[i];
                fb.x += fb.vx || 0; fb.y += fb.vy;
                if (fb.y < 0 || fb.y > canvas.height) this.fakeBullets.splice(i, 1);
            }
        }
    },

    // [handleShooting] magician — trả về true nếu cần dừng handleShooting()
    shootMagician(inp, now) {
        if (this.weapon === 'magician') {
            let hasEvo1 = this.hasUpgrade('evo_mag_1');
            let hasEvo2 = this.hasUpgrade('evo_mag_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // ==========================================
            // --- LOGIC MAGICIAN (KỸ NĂNG CHỦ ĐỘNG) ---
            // ==========================================
            if (this.weapon === 'magician') {
                let hasEvo1 = this.hasUpgrade('evo_mag_1');
                let hasEvo2 = this.hasUpgrade('evo_mag_2');
                let isFullEvo = hasEvo1 && hasEvo2;

                if (inp.s) {
                    this.magicianCharge++;
                } else {
                    if (this.magicianCharge > 0) {
                        // MỐC 3 (EVO 1): HOÁN ĐỔI CHỦ ĐỘNG (Giữ > 60 frames ~ 1s)
                        if (this.magicianCharge >= 60 && hasEvo1 && this.illusions.length > 0) {
                            let targetIllusion = this.illusions[0]; // First in, first out

                            // Hoán đổi vị trí
                            let tempX = this.x; let tempY = this.y;
                            this.x = targetIllusion.x; this.y = targetIllusion.y;
                            targetIllusion.x = tempX; targetIllusion.y = tempY;

                            this.invisTimer = 30; // Tàng hình 0.5s lúc đổi
                            this.shield = (this.shield || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);

                            // =====================================
                            // ĐOẠN CODE MỚI ĐƯỢC CHÈN VÀO ĐÂY
                            // =====================================
                            targetIllusion.type = 'ghost'; // Dù là bóng đứng im cũng sẽ thành bóng biết đi

                            // Phân ảnh di chuyển NGƯỢC HƯỚNG bạn đang đi
                            if (inp.l) {
                                targetIllusion.vx = C.baseSpeed; // Bạn qua trái -> Bóng qua phải
                            } else if (inp.r) {
                                targetIllusion.vx = -C.baseSpeed; // Bạn qua phải -> Bóng qua trái
                            } else {
                                // Nếu bạn không di chuyển, bóng đi ngẫu nhiên
                                targetIllusion.vx = (Math.random() > 0.5 ? 1 : -1) * C.baseSpeed;
                            }

                            // Buff tốc độ
                            this.magicianSpeedBuff = 90;
                            targetIllusion.speedBuff = 90;
                            // =====================================

                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'magenta', 0, this));
                        }                        
                        // MỐC 2 đang hồi chiêu (10s): không tạo phân ảnh/khiên -> nhả thành 1 phát bắn thường
                        else if (this.magicianCharge >= 30 && this.magCloneCd > 0) {
                            addFloatingText(this.x + this.w / 2, this.y - 15, `PHÂN ẢNH ⌛ ${Math.ceil(this.magCloneCd / 60)}s`, "#b98cff", 12);
                            if (this.ammo > 0 && now - this.lastShot > 500) {
                                this.fireBullet(1);
                                this.ammo--;
                                this.lastShot = now;
                            }
                        }
                        // MỐC 2: TẨU THOÁT & ĐÁNH LẠC HƯỚNG (Giữ >= 30 frames ~ 0.5s) — hồi chiêu riêng 10s
                        else if (this.magicianCharge >= 30) {
                            this.magCloneCd = MAG_CLONE_CD;
                            let isMoving = inp.l || inp.r;

                            // Xác định máu và đạn tối đa an toàn
                            let myMaxHp = this.maxHp || 1;
                            let myMaxAmmo = this.maxAmmo || 6;

                            // Xóa bóng cũ nếu vượt giới hạn (Tối đa 2 bóng)
                            if (this.illusions.length >= 2) this.illusions.shift();

                            if (isMoving) {
                                // NỘI TẠI 2: MÀN TRÌNH DIỄN TẨU THOÁT
                                let dashDir = inp.l ? -1 : 1;

                                // Tạo bóng ĐỨNG YÊN tại vị trí cũ
                                this.illusions.push({
                                    x: this.x, y: this.y, w: this.w, h: this.h,
                                    hp: this.hp, maxHp: myMaxHp,
                                    type: 'dash', vx: 0,
                                    spawnTime: now, lifeTime: 20000, invisTimer: 45,
                                    // [ĐÃ FIX LỖI] Ảo ảnh ra đời với số đạn bằng y hệt bản thể
                                    ammo: this.ammo, maxAmmo: myMaxAmmo,
                                    lastShot: now, behaviorTimer: 0
                                });

                                // Bản thể lướt đi và tàng hình 1.25s (75 frames)
                                this.x += dashDir * 80;
                                this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
                                this.invisTimer = 75;
                                this.shield = (this.shield || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);

                                // Full Evo cường hóa: Hồi đầy đạn (Hồi cho bản thể thật sau khi lướt)
                                if (isFullEvo) this.ammo = myMaxAmmo;
                                magHatRain(this, this.illusions[this.illusions.length - 1].x + this.w / 2, 3, 26);

                            } else {
                                // NỘI TẠI 3: MÀN TRÌNH DIỄN ĐÁNH LẠC HƯỚNG (Đứng yên)
                                let ghostDir = Math.random() > 0.5 ? 1 : -1;
                                // [FIX] Nếu sát mép thì cho bóng xuất hiện về phía còn trống, không lọt ra ngoài sân
                                if (this.x + this.w + 20 > canvas.width - this.w) ghostDir = -1;
                                else if (this.x - 20 < this.w) ghostDir = 1;
                                let ghostX = Math.max(0, Math.min(canvas.width - this.w, this.x + ghostDir * 20));

                                // Tạo bóng BIẾT ĐI ở vị trí bên cạnh
                                this.illusions.push({
                                    x: ghostX, y: this.y, w: this.w, h: this.h,
                                    hp: this.hp, maxHp: myMaxHp,
                                    type: 'ghost', vx: ghostDir * C.baseSpeed,
                                    spawnTime: now, lifeTime: 20000, invisTimer: 45,
                                    // [ĐÃ FIX LỖI] Ảo ảnh ra đời với số đạn bằng y hệt bản thể
                                    ammo: this.ammo, maxAmmo: myMaxAmmo,
                                    lastShot: now, behaviorTimer: 0
                                });

                                // Bản thể đứng yên, tàng hình 0.75s, Vô địch 0.25s (Full Evo 0.5s)
                                this.invisTimer = 45;
                                this.invincibleTimer = isFullEvo ? 30 : 15;
                                this.shield = (this.shield || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);
                                magHatRain(this, ghostX + this.w / 2, 3, 26);
                            }
                        }
                        // MỐC 1: BẮN THƯỜNG (< 0.5s)
                        else if (this.ammo > 0 && now - this.lastShot > 500) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;

                            // Tầng 2 Loạn Ảnh: Đạn Nhân Đôi (Bắn thêm 1 viên ảo)
                            const enemy = this.id === 1 ? p2 : p1;
                            if (enemy.confusionStacks >= 2) {
                                let dirY = this.id === 1 ? -1 : 1;
                                this.fakeBullets.push({
                                    x: this.x + this.w / 2 + (Math.random() > 0.5 ? 15 : -15),
                                    y: this.y, w: 5, h: 5,
                                    vx: (Math.random() - 0.5) * 2, vy: dirY * C.bulletSpeed
                                });
                            }
                        }
                        this.magicianCharge = 0;
                    }
                }
                return true; // Quan trọng: Return để ngắt dòng chảy code bắn gốc
            }
        }
    }
});
