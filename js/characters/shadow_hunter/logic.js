// ==========================================
// shadow_hunter (shadow_hunter) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    spawnShadowTraps() {
        // [FIX] Đặt bẫy ngay trên làn di chuyển của đối thủ (tính theo vị trí thực tế),
        // thay vì toạ độ Y cố định khiến bẫy rơi giữa sân và không bao giờ kích hoạt.
        const enemy = (this.id === 1) ? p2 : p1;
        let eh = (enemy && enemy.h) || C.tankH;
        let laneY = (this.id === 1) ? 20 + eh / 2 : canvas.height - 22 - eh / 2;
        let isFullEvo = this.hasUpgrade('evo_sh_1') && this.hasUpgrade('evo_sh_2');
        for (let k = 0; k < 2; k++) {
            // Chia đôi sân theo chiều ngang để 2 bẫy không chồng lên nhau
            let half = (canvas.width - 100) / 2;
            let trapX = 50 + k * half + Math.random() * half;
            let trapY = laneY + (Math.random() - 0.5) * 12;
            shadowTraps.push(new ShadowTrap(trapX, trapY, this, isFullEvo));
        }
    },

    fireShadowHunterEmpowered(isFullEvo, hasEvo1, hasEvo2) {
        let dirY = (this.id === 1) ? -1 : 1;
        let dmgMultiplier = hasEvo2 ? 2.0 : 1.5;
        let baseDmg = this.damage * dmgMultiplier;
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('laser');

        if (isFullEvo) {
            let beamW = 18;
            let beamX = this.x + this.w / 2 - beamW / 2;
            let beamY = (this.id === 1) ? 0 : this.y + this.h;
            let beamH = (this.id === 1) ? this.y : (canvas.height - (this.y + this.h));
            const swBlk = sniperWallClipBeam(this, beamX, beamY, beamW, beamH, dirY, baseDmg); // Tường Sniper chặn tia
            if (swBlk) { beamY = swBlk.y; beamH = swBlk.h; }
            beams.push(new Beam(beamX, beamY, beamW, beamH, this.id, true));
            triggerScreenShake(6, 10);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "SHADOW RAYCAST ⚡", "#9b59b6", 15);
        } else {
            let dotSize = 10;
            this.bullets.push({
                type: 'shadow_empowered',
                x: this.x + this.w / 2 - dotSize / 2,
                y: (this.id === 1) ? this.y - dotSize : this.y + this.h,
                w: dotSize, h: dotSize,
                vx: 0, vy: dirY * (C.bulletSpeed * 1.6),
                dmg: baseDmg,
                owner: this,
                isPiercing: hasEvo1,
                isShadowHunter: true,
                causesSilence: hasEvo2,
                causesBlind: hasEvo1,
                hitIds: [], bounceCount: 0,
                trailHistory: [],
                spawnTime: Date.now()
            });
        }
    },

    // [setupForNewRound] shadow_hunter
    setupShadowHunter() {
        if (this.weapon === 'shadow_hunter') {
            this.speed *= 1.3;
            this.stealthActive = false;
            this.stealthTimer = 0;
            this.stealthCooldown = 0;
            this.stealthEmpowered = false;
            this.shadowTrapsPlaced = false;

            if (this.hasUpgrade('evo_sh_2')) {
                this.spawnShadowTraps();
            }
        }
    },

    // [update] shadow_hunter — trả về currentSpeed mới
    updateShadowHunter(now, currentSpeed) {
        if (this.weapon === 'shadow_hunter') {
            let hasEvo2 = this.hasUpgrade('evo_sh_2');
            if (this.stealthCooldown > 0) this.stealthCooldown--;

            if (this.stealthActive) {
                this.stealthTimer--;
                this.lastShot = now; // Không tự động hồi đạn trong lúc tàng hình

                // Tăng tốc độ chạy: +40% (hoặc +60% nếu có Evo 2)
                let spdBoost = hasEvo2 ? 1.6 : 1.4;
                currentSpeed *= spdBoost;

                // Cưỡng chế thoát sau 5s (300 ticks)
                if (this.stealthTimer <= 0) {
                    this.stealthActive = false;
                    this.stealthCooldown = 480; // 8s Cooldown
                    this.stealthEmpowered = false;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "STEALTH END", "#888", 12);
                }
            }
        }
        return currentSpeed;
    },

    // [handleShooting] shadow_hunter — trả về true nếu cần dừng handleShooting()
    shootShadowHunter(inp, now) {
        if (this.weapon === 'shadow_hunter') {
            let hasEvo1 = this.hasUpgrade('evo_sh_1');
            let hasEvo2 = this.hasUpgrade('evo_sh_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (inp.s) {
                if (!this.stealthActive && this.stealthCooldown <= 0) {
                    // Tap 1: Kích hoạt Vô Hình
                    this.stealthActive = true;
                    this.stealthTimer = 300; // 5s
                    this.stealthEmpowered = true;
                    this.lastStealthActionTime = now;
                    if (hasEvo2) {
                        this.ammo = this.maxAmmo; // Nạp đầy đạn
                        this.spawnShadowTraps();
                    }
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "STEALTH 👻", "#9b59b6", 14);
                    inp.s = false;
                } else if (this.stealthActive && (now - (this.lastStealthActionTime || 0) >= 250)) {
                    // Tap 2: Thoát Vô Hình & Bắn Đòn Cường Hóa (chống double input)
                    this.stealthActive = false;
                    this.stealthCooldown = 480; // 8s CD
                    // Full Evo bắn tia hitscan -> cảnh báo 0.5s trước
                    if (isFullEvo) scheduleHitscan(this, 30, '#a855f7', 26, () => this.fireShadowHunterEmpowered(isFullEvo, hasEvo1, hasEvo2));
                    else this.fireShadowHunterEmpowered(isFullEvo, hasEvo1, hasEvo2);
                    inp.s = false;
                } else if (!this.stealthActive && this.ammo > 0 && now - this.lastShot > 400) {
                    // Bắn đạn thường khi ngoài Vô Hình
                    this.fireBullet(1, false, 'shadow_hunter_normal');
                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return true;
        }
    }
});
