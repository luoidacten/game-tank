// ==========================================
// Kẻ Mạnh Nhất (the_strongest) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireGojoBlue(isEvo2, enemy) {
        let dirY = (this.id === 1) ? -1 : 1;
        let speed = 16;

        this.bullets.push({
            type: 'gojo_blue',
            x: this.x + this.w / 2 - 10,
            y: (this.id === 1) ? this.y - 20 : this.y + this.h,
            w: 20, h: 20,
            vx: 0,
            vy: dirY * speed,
            dmg: this.damage,
            owner: this,
            isEvo2: isEvo2,
            iscanshoot: true,
            startX: this.x,
            startY: this.y,
            isPiercing: false,
            hitIds: []
        });

        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(0, 0, 255, 0.2)', 0, this));
    },

    fireGojoRed(isEvo2, enemy) {
        // 1. Cài đặt thông số tia Red (Evo 2 thì tia to hơn, choáng hợp lý)
        const beamW = isEvo2 ? 22 : 12;
        const stunFrames = isEvo2 ? 14 : 8; // Số frame làm choáng (đã nerf cân bằng)
        const beamX = this.x + this.w / 2 - beamW / 2;

        // Tọa độ Y và Chiều cao của tia (Bắn thẳng về phía đối diện)
        let bRy = (this.id === 1) ? 0 : this.y + this.h;
        let bRh = (this.id === 1) ? this.y : canvas.height - (this.y + this.h);
        const swBlk = sniperWallClipBeam(this, beamX, bRy, beamW, bRh, this.id === 1 ? -1 : 1, this.damage / 2); // Tường Sniper chặn tia
        if (swBlk) { bRy = swBlk.y; bRh = swBlk.h; }

        // 2. Vẽ tia (Tận dụng array beams của bạn)
        const redBeam = new Beam(beamX, bRy, beamW, bRh, this.id, isEvo2);
        redBeam.isGojoRed = true; // hình tia Đỏ riêng (curse.js)
        beams.push(redBeam);

        // Thêm một vụ nổ nhỏ ngay họng súng để tạo cảm giác "Bắn Đỏ"
        explosions.push(new Explosion(this.x + this.w / 2, (this.id === 1) ? this.y : this.y + this.h, beamW + 20, 'rgba(255, 0, 0, 0.7)', 0, this));

        // 3. Xử lý va chạm với Kẻ địch (Gây Dmg + Choáng)
        if (rectIntersect(beamX, bRy, beamW, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(this.damage / 2, this);

            // [ĐẶC TRƯNG CỦA GOJO RED]: Làm choáng
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, stunFrames);

            // Hiệu ứng nổ đỏ đùng đùng trên người kẻ địch
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'rgba(255, 0, 0, 0.9)', 0, this));
        }

        // 4. Tương tác môi trường: Phá hòm (Giữ nguyên logic cực tốt của bạn)
        crates.forEach(c => {
            if (c.active && rectIntersect(beamX, bRy, beamW, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                crateOnBreak(c, this);
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 0, null));
                if (c.type === 'coin') {
                    let money = 30;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        // 5. Tương tác môi trường: Bắn xe chở tiền
        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(beamX, bRy, beamW, bRh, t.x, t.y, t.w, t.h)) {
                let dmgToTruck = 10; // Đỏ bắn cháy xe nhanh hơn
                t.hp -= dmgToTruck;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,0,0,', 5, this));
                }
            }
        });
    },

    fireGojoPurple(isEvo2) {
        // Hư Thức: Tử — tụ Xanh + Đỏ 0.75s tại nòng (có cảnh báo) rồi phóng cầu tím huỷ diệt
        let dirY = (this.id === 1) ? -1 : 1;
        this.bullets.push({
            type: 'purple',
            x: this.x + this.w / 2 - 22,
            y: (this.id === 1) ? this.y - 44 : this.y + this.h,
            w: 44, h: 44,
            vx: 0,
            vy: dirY * 1, // Ban đầu bay rất chậm
            dmg: 2.9, // [BUFF] 2.2 -> 2.9 (+30%)
            owner: this,
            isPiercing: true,
            isEvo2: !!isEvo2,
            chargeTimer: 45, maxCharge: 45,
            hitIds: []
        });
        this.gojoPurpleBanner = 120; // Thông báo HUD "HƯ THỨC: TỬ"
        triggerScreenShake(6, 20);
        if (soundSystem && !soundSystem.muted && soundSystem.playPowerup) soundSystem.playPowerup();
    },

    // [setupForNewRound] Kẻ Mạnh Nhất
    setupTheStrongest() {
        if (this.weapon === 'the_strongest') {
            this.maxHp = 1; this.hp = 1;
            this.damage = 2;
            this.maxAmmo = 0; this.ammo = 0;

            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            this.maxChuLuc = hasSixEyes ? 85 : 75;
            this.chuLuc = this.maxChuLuc;
            this.chuLucRegenRate = hasSixEyes ? 0.20 : 0.12;
            this.chuLucRegenCooldown = 0;

            this.gojoChargeTimer = 0;
            this.gojoDomainTimer = 0;
            this.gojoPurpleBanner = 0;
            this.usedBlue = false;
            this.usedRed = false;
            this.canshotActive = true;
            // Trạng thái nút bắn (đếm tick, không dùng setTimeout -> không kẹt giữa các hiệp / online)
            this.gojoCd = 0; this.gojoQueue = ''; this.gojoQueueT = 0;
            this.gojoPrevS = false; this.gojoHeld = 0; this.gojoSkipRelease = false;
            this.gojoSinceRel = 999; this.gojoLastTapLen = 999;
            this.jjkBfCd = 0;
        }
    },

    // [update] Kẻ Mạnh Nhất — trả về currentSpeed mới
    updateTheStrongest(currentSpeed) {
        if (this.weapon === 'the_strongest') {
            if ((this.gojoDomainTimer || 0) > GOJO_DOMAIN_FREE) return 0; // 4s đầu Lãnh Địa: đứng yên niệm
            if ((this.gojoChargeTimer || 0) > 0) currentSpeed *= 0.35; // Làm chậm khi đang gồng niệm Chú Lực / Lãnh Địa
        }
        return currentSpeed;
    },

    // Bắn Xanh / Đỏ (khi đang hồi chiêu thì xếp hàng thay vì nuốt mất thao tác)
    gojoCast(kind, hasSixEyes, enemy) {
        if (kind === 'red') {
            if (this.chuLuc < 50) { addFloatingText(this.x + this.w / 2, this.y - 12, 'THIẾU CHÚ LỰC', '#94a3b8', 11); return; }
            if (this.gojoCd > 0) { this.gojoQueue = 'red'; this.gojoQueueT = 40; return; }
            this.chuLuc -= 50;
            this.usedRed = true;
            this.gojoCd = 60;
            // Cảnh báo 0.5s (khoá cột, người bắn đứng yên) rồi mới bắn tia Đỏ hitscan
            const redWarn = scheduleHitscan(this, 30, '#ff3b3b', hasSixEyes ? 30 : 20, () => this.fireGojoRed(hasSixEyes, enemy));
            if (redWarn) redWarn.isGojoRed = true;
        } else {
            if (this.chuLuc < 15) { addFloatingText(this.x + this.w / 2, this.y - 12, 'THIẾU CHÚ LỰC', '#94a3b8', 11); return; }
            if (this.gojoCd > 0) { this.gojoQueue = 'blue'; this.gojoQueueT = 30; return; }
            this.chuLuc -= 15;
            this.usedBlue = true;
            this.gojoCd = 30;
            this.fireGojoBlue(hasSixEyes, enemy);
        }
        this.gojoQueue = '';
        this.canshotActive = this.gojoCd <= 0;
        // Tím: đã dùng cả Xanh & Đỏ và còn >= 60% Chú Lực
        if (this.hasUpgrade('evo_strongest_1') && this.usedBlue && this.usedRed && this.chuLuc >= this.maxChuLuc * 0.6) {
            this.chuLuc -= this.maxChuLuc * 0.6;
            this.invincibleTimer = 0;
            this.fireGojoPurple(hasSixEyes);
            this.usedBlue = false;
            this.usedRed = false; // Xóa combo sau khi tung Tím
        }
    },

    // [handleShooting] Kẻ Mạnh Nhất — trả về true nếu cần dừng handleShooting()
    shootTheStrongest(inp) {
        if (this.weapon === 'the_strongest') {
            if (this.gojoDomainTimer > 0) this.gojoDomainTimer--;
            if (this.gojoPurpleBanner > 0) this.gojoPurpleBanner--;
            if (this.gojoCd > 0) this.gojoCd--;
            if (this.jjkBfCd > 0) this.jjkBfCd--;
            if (this.gojoSinceRel < 999) this.gojoSinceRel++;
            this.canshotActive = this.gojoCd <= 0;
            const enemy = (this.id === 1) ? p2 : p1;
            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            let hasPurple = this.hasUpgrade('evo_strongest_1');

            // Vô Lượng Không Xứ: địch bị câm lặng + chậm suốt 5s
            if (this.gojoDomainTimer > 0 && enemy && enemy.hp > 0) addStatusSlow(enemy, 0.5);

            // Đang niệm Lãnh Địa (4s đầu) / bị câm lặng: huỷ niệm, phải nhả nút rồi bấm lại
            if (this.gojoDomainTimer > GOJO_DOMAIN_FREE || this.silenceTimer > 0) {
                this.gojoChargeTimer = 0; this.gojoHeld = 0; this.gojoQueue = '';
                this.gojoSkipRelease = !!inp.s; this.gojoPrevS = !!inp.s;
                return true;
            }

            // Lệnh xếp hàng (bấm trong lúc hồi chiêu)
            if (this.gojoQueue) {
                if (--this.gojoQueueT <= 0) this.gojoQueue = '';
                else if (this.gojoCd <= 0) this.gojoCast(this.gojoQueue, hasSixEyes, enemy);
            }

            const pressed = inp.s && !this.gojoPrevS;
            const released = !inp.s && this.gojoPrevS;
            this.gojoPrevS = !!inp.s;

            if (pressed) {
                this.gojoChargeTimer = 0; this.gojoHeld = 0; this.gojoSkipRelease = false;
                // Hắc Thiểm: nhấp đúp nhanh (lần 2 trong 0.2s sau một cú nhấp)
                if (this.jjkTryBlackFlash()) this.gojoSkipRelease = true;
            }

            if (inp.s) {
                // Bị trúng đòn ngắt niệm (combat.js đặt gojoChargeTimer = 0) -> lần nhả này không ra chiêu
                if (this.gojoHeld > 0 && this.gojoChargeTimer === 0 && !this.gojoSkipRelease) {
                    this.gojoSkipRelease = true;
                    addFloatingText(this.x + this.w / 2, this.y - 12, 'NGẮT NIỆM', '#f87171', 11);
                }
                this.gojoHeld++;
                if (!this.gojoSkipRelease) {
                    this.gojoChargeTimer++;
                    if (this.gojoChargeTimer === 60) {
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(255, 0, 0, 0.4)', 0, this));
                    } else if (this.gojoChargeTimer === 300 && hasPurple) {
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'rgba(147, 197, 253,', 0, this));
                    }
                }
            } else if (released) {
                const ch = this.gojoChargeTimer;
                this.gojoLastTapLen = this.gojoHeld;
                this.gojoSinceRel = 0;
                this.gojoHeld = 0;
                this.gojoChargeTimer = 0;
                if (!this.gojoSkipRelease && ch > 0) {
                    // 1. Bành Trướng Lãnh Địa (giữ 5s, tốn 75% Chú Lực): 4s đứng yên niệm + 1s cuối di chuyển
                    if (ch >= 300 && hasPurple && this.chuLuc >= this.maxChuLuc * 0.75) {
                        this.chuLuc -= this.maxChuLuc * 0.75;
                        this.invincibleTimer = 0;
                        enemy.silenceTimer = Math.max(enemy.silenceTimer || 0, GOJO_DOMAIN_TICKS); // câm lặng suốt Lãnh Địa
                        enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60); // choáng 1s đầu
                        this.gojoDomainTimer = GOJO_DOMAIN_TICKS;
                        this.gojoQueue = '';
                        this.usedBlue = false;
                        this.usedRed = false;
                    }
                    // 2. Đỏ (giữ >= 1s, tốn 50) | 3. Xanh (nhấp, tốn 15)
                    else this.gojoCast(ch >= 60 ? 'red' : 'blue', hasSixEyes, enemy);
                }
                this.gojoSkipRelease = false;
            }
            return true;
        }
    },

    // ==========================================
    // HẮC THIỂM (Black Flash) — dùng chung Kẻ Mạnh Nhất & Vua Đầu Bếp
    // Nhấp đúp nhanh: cú đánh chú lực đen-đỏ bay cực nhanh, choáng 0.3s. Hồi 6s.
    // ==========================================
    jjkTryBlackFlash() {
        const isGojo = this.weapon === 'the_strongest';
        const sinceRel = isGojo ? this.gojoSinceRel : this.skSinceRel;
        const lastLen = isGojo ? this.gojoLastTapLen : this.skLastTapLen;
        if (!(sinceRel <= 12 && lastLen <= 10) || (this.jjkBfCd || 0) > 0) return false;
        const cost = isGojo ? 20 : 15;
        if (isGojo) { if (this.chuLuc < cost) return false; this.chuLuc -= cost; }
        else { if ((this.cursedEnergy || 0) < cost) return false; this.cursedEnergy -= cost; }
        this.jjkBfCd = 360;
        const dir = this.id === 1 ? -1 : 1;
        spawnBullet(this, {
            hook: 'jjk_black_flash', isBlackFlash: true,
            x: this.x + this.w / 2 - 7, y: this.id === 1 ? this.y - 28 : this.y + this.h + 2,
            w: 14, h: 26, vx: 0, vy: dir * 22,
            dmg: isGojo ? 1.3 : 1.1, seed: (this.jjkBfSeed = ((this.jjkBfSeed || 0) + 1) % 997)
        });
        const cx = this.x + this.w / 2, cy = this.id === 1 ? this.y : this.y + this.h;
        explosions.push(new Explosion(cx, cy, 34, 'rgba(220, 20, 40,', 0, this));
        spawnSparkParticles(cx, cy, '#ff1f3d', 14);
        addFloatingText(cx, this.y - 16, 'HẮC THIỂM', '#ff2a4a', 15);
        triggerScreenShake(4, 8);
        if (soundSystem && !soundSystem.muted && soundSystem.playLaser) soundSystem.playLaser();
        return true;
    }
});

// Lãnh Địa Vô Lượng Không Xứ: tổng 5s (300 tick), 1s cuối (60 tick) mới được di chuyển / ra chiêu
const GOJO_DOMAIN_TICKS = 300;
const GOJO_DOMAIN_FREE = 60;

BulletHooks.register('jjk_black_flash', {
    hit(b, attacker, victim, dmg) {
        if (!victim) return;
        if (typeof victim.takeDamage === 'function') victim.freezeTimer = Math.max(victim.freezeTimer || 0, 18);
        const x = victim.x + (victim.w || 0) / 2, y = victim.y + (victim.h || 0) / 2;
        explosions.push(new Explosion(x, y, 46, 'rgba(10, 0, 0,', 0, attacker));
        explosions.push(new Explosion(x, y, 30, 'rgba(255, 30, 50,', 0, attacker));
        spawnSparkParticles(x, y, '#ff1f3d', 18);
        spawnSparkParticles(x, y, '#111111', 10);
        addFloatingText(x, y - 20, 'HẮC THIỂM!', '#ff2a4a', 17);
        triggerScreenShake(6, 10);
    },
    draw(b) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const up = b.vy < 0 ? -1 : 1;
        const t = Math.floor(Date.now() / 50);
        ctx.save();
        // Quầng đỏ
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
        g.addColorStop(0, 'rgba(255,40,60,0.55)'); g.addColorStop(1, 'rgba(120,0,10,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
        // Vệt đen phía sau
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.lineTo(cx, cy - up * 46); ctx.closePath(); ctx.fill();
        // Tia sét đỏ-đen ngoằn ngoèo
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = k === 0 ? '#050005' : (k === 1 ? '#ff1f3d' : '#ffd0d6');
            ctx.lineWidth = k === 0 ? 5 : (k === 1 ? 2.4 : 1);
            ctx.shadowBlur = k === 1 ? 12 : 0; ctx.shadowColor = '#ff1f3d';
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const hh = Math.sin((t + i * 7 + (b.seed || 0)) * 12.9898) * 43758.5453;
                const jx = (hh - Math.floor(hh) - 0.5) * 12;
                const yy = cy + up * (14 - i * 9);
                if (i === 0) ctx.moveTo(cx + jx * 0.3, yy); else ctx.lineTo(cx + jx, yy);
            }
            ctx.stroke();
        }
        // Lõi đen viền đỏ
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff1f3d';
        ctx.fillStyle = '#000'; ctx.strokeStyle = '#ff3b55'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy + up * 8, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
    }
});

// Vụ nổ Hư Thức: Tử (chỉ hình ảnh; sát thương do Explosion ở js/player/bullets.js) — vẽ ở js/render/tank-art/curse.js
class GjPurpleBlast {
    constructor(x, y, r) { this.x = x; this.y = y; this.r = r; this.t = 0; this.dur = 70; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof drawGojoPurpleBlast === 'function') drawGojoPurpleBlast(this); }
}
