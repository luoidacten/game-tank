// ==========================================
// Shotgun Tấn Công (shortgunATK) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireShortgunBurst(isFullEvo, hasEvo1, hasEvo2) {
        let dirY = (this.id === 1) ? -1 : 1;
        let isDouble = this.shortgunDoubleTap;
        let dmgMultiplier = isDouble ? 2 : 1;
        let pelletCount = isDouble ? 8 : 5;
        let coneSpread = 0.45;
        let startX = this.x + this.w / 2;
        let startY = (this.id === 1) ? this.y - 6 : this.y + this.h + 6;

        let baseDmg = this.damage * dmgMultiplier;
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('cannon');
        triggerScreenShake(isDouble ? 8 : 4, 8);

        for (let i = 0; i < pelletCount; i++) {
            let angle = (i / (pelletCount - 1) - 0.5) * coneSpread;
            let vx = Math.sin(angle) * (C.bulletSpeed * 1.5);
            let vy = dirY * Math.cos(angle) * (C.bulletSpeed * 1.5);

            this.bullets.push({
                type: 'shortgun_pellet',
                x: startX - 3.5, y: startY - 3.5, w: 7, h: 7,
                vx: vx, vy: vy,
                dmg: baseDmg,
                owner: this,
                isShortgun: true,
                isPiercing: false,
                isBurn: hasEvo1,
                hitIds: [], bounceCount: 0,
                trailHistory: [],
                spawnTime: Date.now()
            });
        }

        // Evo 1: Dragon Strike leaves FireZone for 3s (180 ticks)
        if (hasEvo1) {
            let coneLen = 140;
            shortgunFireZones.push(new ShortgunFireZone(startX, startY, dirY, coneLen, coneSpread, 180, this));
        }

        this.shortgunDoubleTap = false;
    },

    triggerShortgunAttack() {
        this.isShortgunDashing = true;
        this.shortgunDashState = 1; // 1: Lao thẳng lên như tank, 2: Rút lui về vị trí ban đầu
        this.shortgunStartY = this.y;
        this.shortgunDashSpeed = 22;
        this.lastShotgunDashTime = Date.now();
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "XUNG PHONG! ⏩", "#ff6600", 13);
        if (soundSystem && !soundSystem.muted) {
            if (typeof soundSystem.playDash === 'function') soundSystem.playDash();
            else soundSystem.playPowerup();
        }
    },

    // [setupForNewRound] Shotgun Tấn Công
    setupShortgunATK() {
        if (this.weapon === 'shortgunATK') {
            this.speed *= 1.25;
            this.isShortgunDashing = false;
            this.shortgunDashState = 0;
            this.shortgunStartY = 0;
            this.shortgunDashSpeed = 22;
            this.shortgunTelegraphTimer = 0;
            this.shortgunDoubleTap = false;
            this.shortgunTargetX = 0;
            this.shortgunTargetY = 0;
            this.shortgunConeOriginX = 0;
            this.shortgunConeOriginY = 0;
            if (this.shortgunBonusMaxHp) this.maxHp += this.shortgunBonusMaxHp;
            if (this.shortgunBonusDmg) this.damage += this.shortgunBonusDmg;
        }
    },

    // [update] Shotgun Tấn Công
    updateShortgunATK() {
        if (this.weapon === 'shortgunATK') {
            let hasEvo1 = this.hasUpgrade('evo_sg_1');
            let hasEvo2 = this.hasUpgrade('evo_sg_2');
            let isFullEvo = hasEvo1 && hasEvo2;
            let dirY = (this.id === 1) ? -1 : 1;

            // 1. Dash lao thẳng lên như tank, dừng lại khi có kẻ địch trong tầm bắn
            if (this.shortgunDashState === 1) {
                this.y += dirY * (this.shortgunDashSpeed || 22);

                // Quét tìm kẻ địch / mục tiêu trong phạm vi bắn trúng
                let myMidX = this.x + this.w / 2;
                let myFrontY = (dirY === -1) ? this.y : this.y + this.h;
                let targets = [];
                let enemy = (this.id === 1) ? p2 : p1;
                if (enemy && enemy.hp > 0) targets.push(enemy);
                if (typeof crates !== 'undefined') targets.push(...crates.filter(c => c.active));
                if (typeof moneyTrucks !== 'undefined') targets.push(...moneyTrucks.filter(t => t.active));
                if (typeof turrets !== 'undefined') targets.push(...turrets.filter(t => t.active && t.owner.id !== this.id));
                if (enemy && enemy.drones) targets.push(...enemy.drones.filter(d => d.active));

                let targetInRange = false;
                for (let t of targets) {
                    let tx = t.x + (t.w || 30) / 2;
                    let ty = t.y + (t.h || 30) / 2;
                    let dy = (ty - myFrontY) * dirY;
                    let dx = Math.abs(tx - myMidX);
                    // Phạm vi bắn trúng của shotgun: cách phía trước <= 130px và lệch ngang <= 65px
                    if (dy >= -10 && dy <= 130 && dx <= 65) {
                        targetInRange = true;
                        break;
                    }
                }

                // Dừng lại nếu gặp mục tiêu trong tầm bắn hoặc chạm tường biên
                let hitWall = (dirY === -1 && this.y <= 25) || (dirY === 1 && this.y >= canvas.height - this.h - 25);
                if (targetInRange || hitWall) {
                    this.shortgunDashState = 2; // Chuyển sang giai đoạn rút lui về baseline
                    this.fireShortgunBurst(isFullEvo, hasEvo1, hasEvo2);
                }
            } else if (this.shortgunDashState === 2) {
                // Rút lui về lại vị trí baseline ban đầu
                let returnDirY = (this.id === 1) ? 1 : -1;
                this.y += returnDirY * ((this.shortgunDashSpeed || 22) * 0.7);
                if ((this.id === 1 && this.y >= this.shortgunStartY) || (this.id === 2 && this.y <= this.shortgunStartY)) {
                    this.y = this.shortgunStartY;
                    this.shortgunDashState = 0;
                    this.isShortgunDashing = false;
                }
            }
        }
    },

    // [handleShooting] Shotgun Tấn Công — trả về true nếu cần dừng handleShooting()
    shootShortgunATK(inp, now) {
        if (this.weapon === 'shortgunATK') {
            let hasEvo1 = this.hasUpgrade('evo_sg_1');
            let hasEvo2 = this.hasUpgrade('evo_sg_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (inp.s) {
                // Double Tap detection trong lúc lao: cần khoảng đệm >= 200ms để chống double input
                if (this.shortgunDashState === 1) {
                    if (!this.shortgunDoubleTap && (now - (this.lastShotgunDashTime || 0) >= 200)) {
                        this.shortgunDoubleTap = true;
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "DOUBLE TAP! ⚡", "#ffaa00", 14);
                        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    }
                    inp.s = false;
                    return true;
                }

                if (this.ammo > 0 && now - this.lastShot > 400 && this.shortgunDashState !== 2) {
                    this.ammo--;
                    this.lastShot = now;
                    this.triggerShortgunAttack();
                    inp.s = false;
                }
            }
            return true;
        }
    }
});
