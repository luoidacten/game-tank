// ==========================================
// paradox (paradox) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] paradox
    setupParadox() {
        if (this.weapon === 'paradox') {
            this.paradoxHistory = [];      // Lưu trữ {x, y, hp, shot} trong 3 giây (180 frame)
            this.enemyHistory = [];        // Lưu trữ {x, y} của địch trong 3 giây
            this.paradoxCooldown = 0;      // Hồi chiêu 12s hoặc 7s
            this.paradoxCharge = 0;        // Tụ lực giữ nút

            this.enemyTimeMarks = 0;       // Số tầng ấn thời gian trên người địch
            this.enemyStationaryShadow = null; // Bóng đứng yên (Evo 1)
        }
    },

    // [update] paradox
    updateParadox() {
        if (this.weapon === 'paradox') {
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && hasEvo2;

            // Tạm thời khởi tạo shot: false, sẽ được kiểm tra lại ĐÚNG THỜI ĐIỂM BẮN ở bên dưới
            this.paradoxHistory.push({ x: this.x, y: this.y, hp: this.hp, shot: false });

            // RÚT NGẮN XUỐNG 3 GIÂY (180 FRAMES)
            if (this.paradoxHistory.length > 180) {
                let oldest = this.paradoxHistory.shift();

                // EVO 2: Bóng ma tự động tái hiện lại CHÍNH XÁC phát bắn của 3s trước
                if (hasEvo2 && oldest.shot) {
                    let dmgMult = isFullEvo ? 1.0 : 0.5; // Full Evo = 100% dame, Evo 2 = 50% dame
                    let dirY = (this.id === 1) ? -1 : 1;

                    this.bullets.push({
                        type: 'normal',
                        x: oldest.x + this.w / 2 - 2.5,
                        y: (this.id === 1) ? oldest.y : oldest.y + this.h,
                        w: 5, h: 5,
                        vx: 0, vy: dirY * C.bulletSpeed,
                        dmg: this.damage * dmgMult,
                        owner: this, bounceCount: 0, hitIds: [], isPiercing: false
                    });

                    explosions.push(new Explosion(oldest.x + this.w / 2, oldest.y + this.h / 2, 20, 'cyan', 0, this));
                }
            }

            // Lưu tọa độ địch
            const enemy = (this.id === 1) ? p2 : p1;
            this.enemyHistory.push({ x: enemy.x, y: enemy.y });
            if (this.enemyHistory.length > 180) this.enemyHistory.shift();

            if (this.paradoxCooldown > 0) this.paradoxCooldown--;
        }
    },

    // [update] paradox
    updateParadox2(now) {
        if (this.weapon === 'paradox' && this.paradoxHistory.length > 0) {
            if (this.lastShot === now) {
                this.paradoxHistory[this.paradoxHistory.length - 1].shot = true;
            }
        }
    },

    // [handleShooting] paradox — trả về true nếu cần dừng handleShooting()
    shootParadox(inp, now) {
        if (this.weapon === 'paradox') {
            let hasEvo1 = this.hasUpgrade('evo_paradox_1');
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (this.paradoxCooldown <= 0) {
                if (inp.s) {
                    this.paradoxCharge++;
                } else {
                    // NHẢ NÚT -> Kiểm tra xem đã sạc đủ các mốc chưa (Giữ ngắn 20 frame ~0.33s là tua ngược)
                    if (this.paradoxCharge >= 20 && this.paradoxHistory.length > 0) {

                        let pastSelf = this.paradoxHistory[0]; // Bản thân 3s trước
                        const enemy = (this.id === 1) ? p2 : p1;
                        let pastEnemy = this.enemyHistory[0] || { x: enemy.x, y: enemy.y }; // Địch 3s trước

                        // [FIX LỖI 2] HÀM KÉO ĐỊCH: Luôn ưu tiên tuyệt đối Bóng Đứng Yên của Evo 1
                        let pullEnemy = () => {
                            if (hasEvo1 && this.enemyStationaryShadow) {
                                // Ưu tiên 1: Kéo về Dấu Ấn (Bóng đứng yên)
                                enemy.x = this.enemyStationaryShadow.x;
                                enemy.y = this.enemyStationaryShadow.y;
                                enemy.freezeTimer = 90; // Choáng 1.5s
                                this.enemyStationaryShadow = null; // Xóa ấn sau khi kéo
                                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
                            } else if (isFullEvo) {
                                // Ưu tiên 2: Kéo về quá khứ 3s (Chỉ kéo khi đối thủ KHÔNG bị dính Dấu Ấn)
                                enemy.x = pastEnemy.x;
                                enemy.y = pastEnemy.y;
                                enemy.freezeTimer = 90; // Choáng 1.5s
                                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
                            }
                        };

                        // MỐC 2: Giữ đủ 1 giây (60 frame - Chỉ Full Evo) - Kéo mỗi đối thủ
                        if (isFullEvo && this.paradoxCharge >= 60) {
                            pullEnemy();
                        }
                        // MỐC 1: Giữ ngắn (>= 20 frame ~0.33s) -> Tua lại bản thân (Kèm tua địch nếu có)
                        else {
                            // Tua bản thân
                            this.x = pastSelf.x;
                            this.y = pastSelf.y;
                            this.hp = pastSelf.hp;
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 60, 'cyan', 0, this));

                            // Tự động bắn lặp lại các phát đạn đã bắn trong 3s trước đó
                            let pastShots = this.paradoxHistory.filter(h => h.shot).length;
                            if (pastShots > 0) {
                                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, `TUA NGƯỢC BẮN LẶP LẠI x${pastShots}! ⏳`, '#00f0ff', 14);
                                for (let s = 0; s < pastShots; s++) {
                                    setTimeout(() => {
                                        if (typeof gameState !== 'undefined' && gameState.phase === 'playing') {
                                            this.fireBullet(hasEvo2 ? 1.5 : 1.0, false, 'paradox_echo');
                                        }
                                    }, s * 120);
                                }
                            }

                            // Tiến hành kéo địch (Sẽ tự động xét ưu tiên Dấu Ấn bên trong hàm)
                            if (hasEvo1) {
                                pullEnemy();
                            }
                        }

                        // Hồi chiêu giảm mạnh: Evo 2 còn 7s (420 frames), gốc 12s (720 frames)
                        this.paradoxCooldown = hasEvo2 ? 420 : 720;
                        this.paradoxCharge = 0;

                    } else if (this.paradoxCharge > 0 && this.paradoxCharge < 20) {
                        // Bấm rất nhẹ (< 20 frame) -> Bắn đạn thường
                        if (this.ammo > 0 && now - this.lastShot > 500) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;
                        }
                        this.paradoxCharge = 0;
                    }
                }
            } else {
                // Đang hồi chiêu -> Bắn bình thường không tụ lực
                if (inp.s && this.ammo > 0 && now - this.lastShot > 500) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return true;
        }
    }
});
