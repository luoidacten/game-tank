// ==========================================
// cung (cung) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // cung 
    // --- CẬP NHẬT HÀM FIREBOW ---
    fireBow(chargeSec, isFullEvo) {
        if (this.ammo <= 0) return;
        let dirY = (this.id === 1) ? -1 : 1;

        let dmgMod = this.damage;
        let spdMod = C.bulletSpeed;
        let pierce = false;
        let dotSize = 8;

        // Xuyên thủng đưa về mốc 1s cho đồng bộ
        if (chargeSec >= 1 && this.hasUpgrade('evo_cung_1')) {
            pierce = true;
            dmgMod *= 0.5;
        }

        // --- MỐC MƯA TÊN (Tụ >= 2s) ---
        if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2')) {
            if (this.rainCD <= 0) {
                arrowRains.push(new ArrowRain(this, this.crosshairX, this.crosshairY, this.crosshairRadius));
                this.rainCD = isFullEvo ? 2000 : 10000;
                this.ammo--;
                return;
            }

        }

        // --- CÁC MỐC BẮN CUNG THƯỜNG MỚI ---

        // 1. Mốc dưới 0.5s: 1 viên thường
        if (chargeSec < 0.5) {
            dmgMod += chargeSec * 0.5;
            spdMod += chargeSec * 2;
            this.bullets.push({
                type: 'arrow',
                x: this.x + this.w / 2 - dotSize / 2, y: (this.id === 1) ? this.y - dotSize : this.y + this.h,
                w: dotSize, h: dotSize, vx: 0, vy: dirY * spdMod, dmg: dmgMod, owner: this,
                isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
            });
        }
        // 2. Mốc 0.5s đến 0.99s: Bắn 3 viên thẳng
        else if (chargeSec >= 0.5 && chargeSec < 1.0) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (gameState.phase !== 'playing') return;
                    let currStartY = (this.id === 1) ? this.y - dotSize : this.y + this.h;
                    let currStartX = this.x + this.w / 2 - dotSize / 2;
                    this.bullets.push({
                        type: 'arrow',
                        x: currStartX, y: currStartY, w: dotSize, h: dotSize,
                        vx: 0, vy: dirY * spdMod, dmg: dmgMod, owner: this,
                        isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
                    });
                }, i * 150); // Khoảng cách giữa 3 viên nhanh hơn một chút
            }
        }
        // 3. Mốc 1.0s trở lên: Bắn 3 viên hình nón (đạn tỏa)
        else if (chargeSec >= 1.0) {
            let baseAngle = (this.id === 1) ? -Math.PI / 2 : Math.PI / 2;
            let angles = [-0.25, 0, 0.25];
            let startY = (this.id === 1) ? this.y - dotSize : this.y + this.h;

            angles.forEach(angleOffset => {
                let finalAngle = baseAngle + angleOffset;
                this.bullets.push({
                    type: 'arrow',
                    x: this.x + this.w / 2 - dotSize / 2, y: startY, w: dotSize, h: dotSize,
                    vx: Math.cos(finalAngle) * spdMod, vy: Math.sin(finalAngle) * spdMod,
                    dmg: dmgMod, owner: this, isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
                });
            });
        }

        this.ammo--;
    },

    triggerBowDodgeDash(inp) {
        if (inp && (inp.l || inp.r || inp.u || inp.d)) {
            this.isDashing = true;
            let dashDist = 80;
            this.dashTargetX = this.x;
            this.dashTargetY = this.y;

            if (inp.l) this.dashTargetX -= dashDist;
            if (inp.r) this.dashTargetX += dashDist;
            if (inp.u) this.dashTargetY -= dashDist;
            if (inp.d) this.dashTargetY += dashDist;
        }
    },

    // [setupForNewRound] cung
    setupCung() {
        if (this.weapon === 'cung') {
            this.rainCD = 0;
            this.isDashing = false;
            this.dashTargetX = 0;
            this.dashTargetY = 0;
            this.bowIsCharging = false;
            this.bowChargeTimer = 0;
            this.crosshairRadius = 150;
            this.crosshairX = canvas.width / 2;
            this.crosshairY = canvas.height / 2;
            this.bowDodgeReady = true;
            this.bowDodgeCooldown = 0;

            // Full Evo: Trận mưa trên rơi xuống toàn map đầu trận
            let isFullEvo = this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2');
            if (isFullEvo) {
                arrowRains.push(new ArrowRain(this, 0, 0, 0, true)); // isGlobal = true
            }
        }
    }
});
