// ==========================================
// creator (creator) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] creator
    setupCreator() {
        if (this.weapon === 'creator') {
            this.creatorTurrets = [];
            this.creatorShield = null;
            this.creatorShieldCooldown = 0;
            this.creatorShieldHoldFrames = 0;
            this.creatorTurretTimer = 0;
            this.creatorRobotTimer = 0;
            this.creatorDrone = new CreatorDrone(this);
            this.creatorRobot = null;
        } else {
            this.creatorDrone = null;
            this.creatorRobot = null;
        }
    },

    // [update] creator
    updateCreator(inp) {
        if (this.weapon === 'creator') {
            // 1. Ụ Súng Tự Ngắm (Cứ mỗi 10s tự động triển khai 1 Ụ súng, tối đa 2 ụ cùng lúc)
            const capLvl = bodyShopLvl(this, 'cr_turret_cap'); // Xưởng: +1 ụ tối đa, -2s mỗi cấp
            this.creatorTurretTimer = (this.creatorTurretTimer || 0) + 1;
            if (this.creatorTurretTimer >= 600 - 120 * capLvl) {
                this.creatorTurretTimer = 0;
                let activeTurrets = creatorTurrets.filter(t => t.owner === this && t.active);
                if (activeTurrets.length < 2 + capLvl) {
                    let sideY = (this.id === 1) ? this.y - 35 : this.y + this.h + 15;
                    // [FIX] Thử bên trái rồi bên phải xe; tránh đặt ụ mới chồng lên ụ cũ
                    let candidates = [this.x - 30, this.x + this.w + 10, this.x - 60, this.x + this.w + 40, this.x + this.w / 2 - 10];
                    let sideX = null;
                    for (let cx of candidates) {
                        let clamped = Math.max(20, Math.min(canvas.width - 40, cx));
                        if (!activeTurrets.some(t => Math.abs(t.x - clamped) < 26 && Math.abs(t.y - sideY) < 26)) { sideX = clamped; break; }
                    }
                    if (sideX === null) sideX = Math.max(20, Math.min(canvas.width - 40, this.x - 30));
                    let newTurret = new CreatorTurret(this, sideX, sideY);
                    creatorTurrets.push(newTurret);
                    explosions.push(new Explosion(sideX + 10, sideY + 10, 25, '#00e5ff', 0, this));
                    if (typeof addFloatingText === 'function') addFloatingText(sideX, sideY - 10, "Ụ SÚNG TRIỂN KHAI! 🛠️", "#00e5ff", 12);
                }
            }

            // 2. Khiên Thép Chắn Đạn (Nhấn giữ phím Bắn để dựng tường khiên chắn đạn phía trước)
            if (this.creatorShieldCooldown > 0) {
                this.creatorShieldCooldown--;
            }

            if (inp.s) {
                this.creatorShieldHoldFrames = (this.creatorShieldHoldFrames || 0) + 1;
                if (this.creatorShieldHoldFrames >= 15 && !this.creatorShield && this.creatorShieldCooldown <= 0) {
                    this.creatorShield = new CreatorShield(this);
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "DỰNG KHIÊN THÉP! 🛡️", "#00e5ff", 14);
                    if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
                }
            } else {
                this.creatorShieldHoldFrames = 0;
            }

            if (this.creatorShield) {
                this.creatorShield.update();
                if (!this.creatorShield.active) {
                    this.creatorShield = null;
                }
            }

            // 3. Drone Không Kích Tự Hành (Bay tuần tra xả pháo đôi)
            if (this.creatorDrone) {
                this.creatorDrone.update();
            }

            // 5. Trạm Bảo Trì (Xưởng): ụ súng, drone, robot tự sửa 0.3 HP/s
            if (bodyShopLvl(this, 'cr_repair') > 0) {
                const heal = (o) => { if (o && o.active && o.hp > 0 && o.maxHp) o.hp = Math.min(o.maxHp, o.hp + 0.005); };
                creatorTurrets.forEach(t => { if (t.owner === this) heal(t); });
                if (this.creatorRobot) heal(this.creatorRobot);
                if (this.creatorDrone && this.creatorDrone.active) this.creatorDrone.hp = Math.min(this.creatorDrone.getMaxHp(), this.creatorDrone.hp + 0.005);
            }

            // 4. Robot Tự Động (Evo 2: xuất xưởng sau 10s đầu trận, sớm hơn 3s mỗi cấp Khung Titan)
            if (this.hasUpgrade('evo_cr_2')) {
                let timePlayed = Date.now() - gameState.roundStartTime;
                if (timePlayed >= 10000 - 3000 * bodyShopLvl(this, 'cr_robot') && !this.creatorRobot) {
                    this.creatorRobot = new CreatorRobot(this);
                    creatorRobots.push(this.creatorRobot);
                }
                if (this.creatorRobot) {
                    this.creatorRobot.update();
                }
            }
        }
    }
});
