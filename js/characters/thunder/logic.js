// ==========================================
// thunder (thunder) — Logic (cập nhật, bắn, kỹ năng)
// ------------------------------------------
// Thiên Kiếp (Lôi Minh 3/3):
//   - Nhấp: Lôi Độn — hóa tia sét lao thẳng tới làn địch (bất tử), hút địch về phía trước,
//     cuối đường chém 1 nhát cực nhanh rồi lao về chỗ cũ.
//   - Giữ 0.5s+: Thu Thương (thương hóa tia sét bay về rất nhanh).
//   - Gần hết giờ: Thiên Lôi Giáng — bay lên trời, điều khiển vòng cảnh báo (trái/phải),
//     5s hoặc nhấp Bắn để giáng; vòng KHÓA 0.5s rồi mới giáng (Luật 11).
// ==========================================

const THUNDER_DASH_WARN = 12;      // 0.2s hóa sét trước khi lao (cột cảnh báo)
const THUNDER_DASH_SPEED = 20;     // px/tick khi lao đi
const THUNDER_DASH_BACK = 24;      // px/tick khi lao về
const THUNDER_DASH_CD = 24;        // hồi giữa 2 lần Lôi Độn (sau khi về)
const THUNDER_SKY_MAX = 300;       // 5s trên trời
const THUNDER_SKY_LOCK = 30;       // Luật 11: khóa vòng 0.5s trước khi giáng
const THUNDER_SKY_TRIGGER = 45;    // còn 0.75s Thiên Kiếp -> tự bay lên trời

Object.assign(Player.prototype, {
    triggerThunderAction(held, now) {
        if (held < 30) {
            // Nhấp (< 0.5s): Phóng 1 Lôi Phong Thương xuyên qua mọi vật thể/kẻ địch
            if ((this.thunderActionCooldown || 0) > 0) {
                if (typeof addFloatingText === 'function') {
                    let secLeft = ((this.thunderActionCooldown || 0) / 60).toFixed(1);
                    addFloatingText(this.x + this.w / 2, this.y - 14, `HỒI CHIÊU (${secLeft}s)! ⏳`, "#aaa", 11);
                }
                return;
            }
            if (now - (this.lastShot || 0) < 350) {
                return; // Chống lỗi spam bắn liên tục
            }
            if ((this.thunderSpears || 0) > 0) {
                this.thunderSpears--;
                let dirY = (this.id === 1) ? -1 : 1;
                let bSpeed = C.bulletSpeed * 2.2;
                if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
                this.bullets.push({
                    x: this.x + this.w / 2 - 4,
                    y: (this.id === 1) ? this.y - 14 : this.y + this.h + 2,
                    w: 8, h: 18,
                    vx: 0,
                    vy: dirY * bSpeed,
                    dmg: 1.0,
                    owner: this,
                    isThunderSpear: true,
                    isPiercing: true,
                    hitIds: [],
                    bounceCount: 0
                });
                this.lastShot = now;
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            } else {
                // Nếu phóng hết 3 cây thương mà vẫn bấm nhấp -> Tự động kích hoạt Thu Thương có cảnh báo 0.25s
                this.startThunderRecall(false);
            }
        } else if (held >= 30 && held <= 60) {
            // Giữ vừa (0.5s - 1s): Thu Thương
            this.startThunderRecall(false);
        } else {
            // Giữ lâu (> 1s): Trảm Lôi Liên Hoàn
            this.startThunderSlashSequence();
        }
    },

    startThunderRecall(instant = false) {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        if (this.thunderIsRecallWarning) return;
        this.thunderIsRecallWarning = true;
        this.thunderRecallWarningTimer = 15; // 0.25s cảnh báo
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "THU THƯƠNG! ⚡", "#ffff00", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    // Thu Thương: mỗi cây thương hóa thành 1 tia sét lao vút về xe (trúng địch trên đường bay)
    executeThunderRecall() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) return;
        const inKiep = (this.thunderLoiMinhTimer || 0) > 0;
        const speed = inKiep ? 34 : 26;

        triggerScreenShake(5, 8);
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();

        mySpears.forEach(s => {
            bodyEffects.push(new ThunderReturnBolt(s.x, s.y, this, speed, 1.0));
            explosions.push(new Explosion(s.x, s.y, 28, 'rgba(255, 255, 0,', 0, this));
            spawnSparkParticles(s.x, s.y, '#ffff00', 6);
        });

        let recoveredCount = mySpears.length;
        this.thunderSpears = 3;
        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi thu thương trước khi ném lại
        this.lastShot = Date.now();
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        if (inKiep) return; // Đang Thiên Kiếp: không tích thêm Lôi Minh
        this.thunderConsumedSpears = (this.thunderConsumedSpears || 0) + recoveredCount;
        if (this.thunderConsumedSpears >= 3) {
            this.thunderConsumedSpears -= 3;
            this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
            if (this.thunderLoiMinhStacks >= 3) {
                this.activateThienKiep();
            }
        }
    },

    startThunderSlashSequence() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        this.thunderSlashQueue = [...mySpears];
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        this.thunderIsSlashing = true;
        this.thunderSlashIndex = 0;
        this.thunderSlashTimer = 0;
        this.thunderOriginPos = { x: this.x, y: this.y };
        this.isInvulnerable = true;
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, "TRẢM LÔI LIÊN HOÀN! ⚡🌪", "#ffff00", 16);
    },

    activateThienKiep() {
        this.thunderLoiMinhStacks = 0;
        let hasEvo2 = this.hasUpgrade('evo_thun_2');
        this.thunderLoiMinhTimer = hasEvo2 ? 480 : 300; // 8s hoặc 5s
        if (hasEvo2) {
            this.thunderShieldHits = 3;
        }
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, "⚡ THIÊN KIẾP KÍCH HOẠT! ⚡", "#ffd700", 16);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    // ---------- Lôi Độn (Thiên Kiếp - nhấp) ----------
    startThunderDashWarning(now) {
        this.thunderRaycastWarningTimer = THUNDER_DASH_WARN; // hóa sét + cột cảnh báo đường lao
        this.thunderRaycastX = this.x + this.w / 2;
        this.lastShot = now;
        if (typeof addFloatingText === 'function') addFloatingText(this.thunderRaycastX, this.y - 15, "LÔI ĐỘN! ⚡", "#ffeb3b", 12);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    startThunderDash() {
        const enemy = (this.id === 1) ? p2 : p1;
        const eLane = thunderLaneY(enemy);
        this.thunderDashState = 1;
        this.thunderDashStartY = this.y;
        // Dừng ngay trước làn địch
        this.thunderDashEndY = (this.id === 1) ? eLane + enemy.h + 4 : eLane - this.h - 4;
        this.thunderDashT = 0;
        triggerScreenShake(3, 5);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash ? soundSystem.playDash() : soundSystem.playLaser();
    },

    // Nhát chém cực nhanh ở cuối đường lao
    thunderDashSlash() {
        const enemy = (this.id === 1) ? p2 : p1;
        const cx = this.x + this.w / 2;
        const sy = thunderLaneY(enemy) + enemy.h / 2;
        const dir = (this.id === 1) ? -1 : 1;
        const base = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
        fxSweep(cx, this.y + this.h / 2, 62, base - 1.5, base + 1.5, '#fff176', 12, 12);
        fxSweep(cx, this.y + this.h / 2, 48, base + 1.4, base - 1.4, '#80deea', 14, 7);
        fxBolt(cx - 55, sy, cx + 55, sy, '#ffffff', 10, 2.5, 10);
        triggerScreenShake(5, 7);
        if (enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - cx) < this.w / 2 + enemy.w / 2 + 26 && Math.abs(enemy.y + enemy.h / 2 - sy) < 50) {
            enemy.takeDamage(1.0 * (this.damage || 1), this);
            fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#fff176', 28);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 14, "LÔI TRẢM! ⚡", "#ffd700", 15);
            if (this.hasUpgrade('evo_thun_1')) enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 30);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
        }
    },

    updateThunderDash() {
        const st = this.thunderDashState;
        if (!st) return;
        const enemy = (this.id === 1) ? p2 : p1;
        const dir = (this.id === 1) ? -1 : 1;
        this.thunderDashT++;
        if (st === 1) {
            this.y += THUNDER_DASH_SPEED * dir;
            // Hút địch về điểm phía trước mũi sét
            const cx = this.x + this.w / 2;
            if (enemy && enemy.hp > 0) {
                const dx = cx - (enemy.x + enemy.w / 2);
                if (Math.abs(dx) < 170) {
                    const pull = 2.6;
                    enemy.x += Math.max(-pull, Math.min(pull, dx));
                    enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x));
                }
            }
            // Phá hòm trên đường lao
            crates.forEach(c => {
                if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    crateOnBreak(c, this);
                    if (typeof grantCrateLoot === 'function') grantCrateLoot(c, this);
                }
            });
            if (this.thunderDashT % 2 === 0) spawnSparkParticles(cx, this.y + this.h / 2, '#fff176', 2);
            if ((dir < 0 && this.y <= this.thunderDashEndY) || (dir > 0 && this.y >= this.thunderDashEndY) || this.thunderDashT > 60) {
                this.y = this.thunderDashEndY;
                this.thunderDashState = 2;
                this.thunderDashT = 0;
                this.thunderDashSlash();
            }
        } else if (st === 2) {
            if (this.thunderDashT >= 6) { this.thunderDashState = 3; this.thunderDashT = 0; }
        } else if (st === 3) {
            this.y -= THUNDER_DASH_BACK * dir;
            if ((dir < 0 && this.y >= this.thunderDashStartY) || (dir > 0 && this.y <= this.thunderDashStartY) || this.thunderDashT > 60) {
                this.y = this.thunderDashStartY;
                this.thunderDashState = 0;
                this.thunderDashCd = THUNDER_DASH_CD;
            }
        }
    },

    // ---------- Thiên Lôi Giáng (kết thúc Thiên Kiếp) ----------
    startThunderSky() {
        const enemy = (this.id === 1) ? p2 : p1;
        this.thunderLoiMinhTimer = 0;
        this.thunderHoldFrames = 0;
        this.thunderSkyHomeY = this.y;
        this.thunderSky = {
            x: this.x + this.w / 2, y: thunderLaneY(enemy) + enemy.h / 2,
            r: 46, t: 0, max: THUNDER_SKY_MAX, lock: 0,
        };
        fxBolt(this.x + this.w / 2, this.y + this.h / 2, this.x + this.w / 2, this.id === 1 ? -20 : canvas.height + 20, '#fff176', 16, 4, 20);
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 34, 'rgba(255, 241, 118,', 0, this));
        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#fff176', 14);
        addFloatingText(this.x + this.w / 2, this.y - 20, "⚡ THIÊN LÔI GIÁNG! ⚡", "#ffd700", 15);
        // Biến mất khỏi mặt sàn: dời xe ra ngoài sân (không thể bị nhắm / trúng)
        this.y = this.id === 1 ? canvas.height + 300 : -300 - this.h;
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    thunderSkyLock() {
        const c = this.thunderSky;
        if (!c || c.lock > 0) return;
        c.lock = THUNDER_SKY_LOCK;
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    updateThunderSky(inp) {
        const c = this.thunderSky;
        if (!c) return;
        if (c.lock > 0) {
            if (--c.lock === 0) this.thunderSkyImpact();
            return;
        }
        c.t++;
        const enemy = (this.id === 1) ? p2 : p1;
        const isBot = this.id === 2 && typeof botAI !== 'undefined' && botAI.enabled;
        const lat = 3.4;
        if (isBot && enemy) {
            const dx = enemy.x + enemy.w / 2 - c.x;
            c.x += Math.max(-lat, Math.min(lat, dx));
            if (Math.abs(dx) < 10 && c.t > 40) this.thunderSkyLock();
        } else {
            if (inp && inp.l) c.x -= lat;
            if (inp && inp.r) c.x += lat;
        }
        c.x = Math.max(c.r * 0.5, Math.min(canvas.width - c.r * 0.5, c.x));
        if (enemy) c.y = thunderLaneY(enemy) + enemy.h / 2;
        // Vòng cảnh báo: làm chậm nhẹ
        if (enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - c.x, enemy.y + enemy.h / 2 - c.y) < c.r + enemy.w / 2) addStatusSlow(enemy, 0.8);
        if (c.t >= c.max) this.thunderSkyLock();
    },

    thunderSkyImpact() {
        const c = this.thunderSky;
        const enemy = (this.id === 1) ? p2 : p1;
        const top = this.id === 1 ? -20 : canvas.height + 20;
        fxBolt(c.x, top, c.x, c.y, '#ffffff', 20, 7, 18);
        fxBolt(c.x - 30, top, c.x, c.y, '#fff176', 18, 4, 30);
        fxBolt(c.x + 30, top, c.x, c.y, '#80deea', 16, 3, 30);
        fxSweep(c.x, c.y, c.r + 10, 0, Math.PI * 2, '#fff176', 16, 6);
        explosions.push(new Explosion(c.x, c.y, c.r + 16, 'rgba(255, 241, 118,', 0, this));
        explosions.push(new Explosion(c.x, c.y, c.r * 0.6, 'rgba(255, 255, 255,', 0, this));
        spawnSparkParticles(c.x, c.y, '#fff176', 20);
        triggerScreenShake(9, 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion ? soundSystem.playExplosion() : soundSystem.playHit();
        if (enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - c.x, enemy.y + enemy.h / 2 - c.y) < c.r + enemy.w / 2) {
            enemy.takeDamage(2.5 * (this.damage || 1), this);
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 90);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 16, "THIÊN LÔI! CHOÁNG ⚡", "#ffd700", 16);
        }
        // Phá hòm trong vùng giáng
        crates.forEach(cr => {
            if (cr.active && Math.hypot(cr.x + cr.w / 2 - c.x, cr.y + cr.h / 2 - c.y) < c.r + cr.w / 2) {
                cr.active = false;
                crateOnBreak(cr, this);
                if (typeof grantCrateLoot === 'function') grantCrateLoot(cr, this);
            }
        });
        // Full Evo: để lại Lôi Vực
        if (this.hasUpgrade('evo_thun_1') && this.hasUpgrade('evo_thun_2')) {
            bodyEffects.push(new ThunderZone(c.x, c.y, 44, this, 240, 0.2));
        }
        // Lộn về làn của mình (tại hoành độ cú giáng)
        this.thunderSky = null;
        this.x = Math.max(0, Math.min(canvas.width - this.w, c.x - this.w / 2));
        this.y = (typeof this.thunderSkyHomeY === 'number') ? this.thunderSkyHomeY : thunderLaneY(this);
        this.invincibleTimer = Math.max(this.invincibleTimer || 0, 12);
        this.thunderActionCooldown = 45;
        this.thunderSpears = 3;
        fxBolt(c.x, c.y, this.x + this.w / 2, this.y + this.h / 2, '#80deea', 12, 2.5, 16);
    },

    // [setupForNewRound] thunder
    setupThunder() {
        if (this.weapon === 'thunder') {
            this.speed *= 1.3;
            this.thunderSpears = 3;
            this.thunderHoldFrames = 0;
            this.thunderLoiMinhStacks = 0;
            this.thunderLoiMinhTimer = 0;
            this.thunderShieldHits = 0;
            this.thunderIsRecallWarning = false;
            this.thunderRecallWarningTimer = 0;
            this.thunderIsSlashing = false;
            this.thunderSlashIndex = 0;
            this.thunderSlashTimer = 0;
            this.thunderOriginPos = null;
            this.thunderConsumedSpears = 0;
            this.thunderActionCooldown = 0;
            this.thunderRaycastWarningTimer = 0;
            this.thunderAfterImage = null;
            this.thunderDashState = 0;
            this.thunderDashT = 0;
            this.thunderDashCd = 0;
            this.thunderSky = null;
            this.thunderPrevS = false;
            this.thunderStormTimer = 240;
        }
    },

    // [update] thunder
    updateThunder() {
        if (this.weapon === 'thunder') {
            // Giảm hồi chiêu sau khi thu thương hoặc dùng kỹ năng (cần 1s để tiếp tục ném)
            if ((this.thunderActionCooldown || 0) > 0) {
                this.thunderActionCooldown--;
            }
            if ((this.thunderDashCd || 0) > 0 && !this.thunderDashState) this.thunderDashCd--;
            if (this.thunderAfterImage && --this.thunderAfterImage.t <= 0) this.thunderAfterImage = null;

            // Hóa sét trước khi Lôi Độn (0.2s)
            if ((this.thunderRaycastWarningTimer || 0) > 0) {
                this.thunderRaycastWarningTimer--;
                if (this.thunderRaycastWarningTimer <= 0) this.startThunderDash();
            }
            this.updateThunderDash();

            // 1. Cảnh báo Thu Thương (15 frame ~ 0.25s)
            if (this.thunderIsRecallWarning) {
                this.thunderRecallWarningTimer--;
                if (this.thunderRecallWarningTimer <= 0) {
                    this.thunderIsRecallWarning = false;
                    this.executeThunderRecall();
                }
            }

            // 2. Trảm Lôi Liên Hoàn
            if (this.thunderIsSlashing) {
                this.thunderSlashTimer = (this.thunderSlashTimer || 0) + 1;
                if (this.thunderSlashTimer >= 30) {
                    this.thunderSlashTimer = 0;
                    if (this.thunderSlashQueue && this.thunderSlashIndex < this.thunderSlashQueue.length) {
                        let sp = this.thunderSlashQueue[this.thunderSlashIndex];
                        this.thunderSlashIndex++;
                        const fromX = this.x + this.w / 2, fromY = this.y + this.h / 2;
                        this.x = Math.max(0, Math.min(canvas.width - this.w, sp.x - this.w / 2));
                        this.y = Math.max(0, Math.min(canvas.height - this.h, sp.y - this.h / 2));
                        // [HÌNH ẢNH] Lôi Trảm: tia sét nối điểm cũ -> mới, bóng mờ và 2 nhát quét kiếm sấm sét
                        const toX = this.x + this.w / 2, toY = this.y + this.h / 2;
                        fxBolt(fromX, fromY, toX, toY, '#fff176', 14, 3.5, 18);
                        const ang = Math.atan2(toY - fromY, toX - fromX);
                        fxSweep(toX, toY, 46, ang - 1.9, ang + 1.9, '#ffeb3b', 18, 12);
                        fxSweep(toX, toY, 34, ang + Math.PI + 1.6, ang + Math.PI - 1.6, '#80deea', 20, 8);
                        this.thunderAfterImage = { x: fromX, y: fromY, t: 14 };

                        let radius = 60;
                        let enemy = (this.id === 1) ? p2 : p1;
                        let hasEvo1 = this.hasUpgrade('evo_thun_1');
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, radius, 'rgba(255, 255, 0,', 1.0, this));
                        if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2)) <= radius) {
                            enemy.takeDamage(1.0, this);
                            if (hasEvo1) {
                                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                                if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
                            }
                        }
                        this.thunderSpears = Math.min(3, (this.thunderSpears || 0) + 1);
                        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
                    } else {
                        // Kết thúc chuỗi Trảm Lôi -> tốc biến về vị trí ban đầu
                        if (this.thunderOriginPos) {
                            const fx0 = this.x + this.w / 2, fy0 = this.y + this.h / 2;
                            this.x = this.thunderOriginPos.x;
                            this.y = this.thunderOriginPos.y;
                            fxBolt(fx0, fy0, this.x + this.w / 2, this.y + this.h / 2, '#80deea', 12, 3, 14);
                        }
                        this.thunderIsSlashing = false;
                        this.isInvulnerable = false;
                        this.thunderSpears = 3;
                        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi kết thúc skill
                        this.lastShot = Date.now();
                        this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
                        if (this.thunderLoiMinhStacks >= 3) {
                            this.activateThienKiep();
                        }
                    }
                }
            }

            // 3. Thời gian Thiên Kiếp -> gần hết giờ tự bay lên trời (Thiên Lôi Giáng)
            if (this.thunderLoiMinhTimer > 0) {
                const busy = this.thunderDashState || (this.thunderRaycastWarningTimer || 0) > 0 || this.thunderIsRecallWarning;
                if (!busy || this.thunderLoiMinhTimer > 1) this.thunderLoiMinhTimer--;
                if (this.thunderLoiMinhTimer % 12 === 0 && typeof spawnSparkParticles === 'function') {
                    spawnSparkParticles(this.x + Math.random() * this.w, this.y + Math.random() * this.h, "#ffd700", 2);
                }
                if (this.thunderLoiMinhTimer <= THUNDER_SKY_TRIGGER && !busy) this.startThunderSky();
            }

            // 4. Full Evo: Bão Sấm — sét ngẫu nhiên trên nửa sân đối thủ (báo trước 1s), mỗi 4-6s
            if (this.hasUpgrade('evo_thun_1') && this.hasUpgrade('evo_thun_2')) {
                this.thunderStormTimer = (this.thunderStormTimer || 0) - 1;
                if (this.thunderStormTimer <= 0) {
                    this.thunderStormTimer = 240 + Math.floor(Math.random() * 120);
                    const enemy = (this.id === 1) ? p2 : p1;
                    let x, y;
                    if (Math.random() < 0.65) {
                        // Rơi đúng làn đối thủ, lệch ngang ngẫu nhiên
                        x = Math.max(20, Math.min(canvas.width - 20, enemy.x + enemy.w / 2 + (Math.random() * 2 - 1) * 100));
                        y = thunderLaneY(enemy) + enemy.h / 2;
                    } else {
                        x = 20 + Math.random() * (canvas.width - 40);
                        const mid = canvas.height / 2;
                        y = (this.id === 1) ? 30 + Math.random() * (mid - 60) : mid + 30 + Math.random() * (mid - 60);
                    }
                    bodyEffects.push(new ThunderStrike(x, y, this, 1.0, 40, 60));
                }
            }

            // Visual tụ lực của Thunder được vẽ tại draw() để đồng bộ render loop
        }
    },

    // [handleShooting] thunder — trả về true nếu cần dừng handleShooting()
    shootThunder(inp, now) {
        if (this.weapon === 'thunder') {
            if (this.thunderIsSlashing) return true;
            const s = !!inp.s;
            const pressed = s && !this.thunderPrevS;
            this.thunderPrevS = s;
            // Trên trời: nhấp Bắn để giáng sớm
            if (this.thunderSky) {
                if (pressed && this.thunderSky.t > 20) this.thunderSkyLock();
                this.thunderHoldFrames = 0;
                return true;
            }
            if (this.thunderDashState || (this.thunderRaycastWarningTimer || 0) > 0) { this.thunderHoldFrames = 0; return true; }
            if (s) {
                this.thunderHoldFrames = (this.thunderHoldFrames || 0) + 1;
                return true;
            }
            if (this.thunderHoldFrames > 0) {
                let held = this.thunderHoldFrames;
                this.thunderHoldFrames = 0;
                if (this.thunderLoiMinhTimer > 0) {
                    // Thiên Kiếp: Nhấp = Lôi Độn; Giữ 0.5s+ = Thu Thương (nếu có thương đang cắm)
                    const hasPlanted = thunderPlantedSpears.some(sp => sp.owner === this);
                    if (held >= 30 && hasPlanted) this.startThunderRecall(false);
                    else if ((this.thunderDashCd || 0) <= 0) this.startThunderDashWarning(now);
                } else {
                    this.triggerThunderAction(held, now);
                }
            }
            return true;
        }
    }
});
