// ==========================================
// thunder (thunder) — Logic (cập nhật, bắn, kỹ năng)
// ------------------------------------------
// Lôi Phong Thương: tối đa 3 (Evo: 5, Full Evo: 9). Mất hết thương (bị phá hủy) -> phạt 5s rồi tự hồi.
// Lôi Minh (3 tầng -> Thiên Kiếp) CHỈ tích từ: Thu Thương (mỗi 3 cây), Lôi Trảm, thương phóng ra trúng địch.
// Lôi Trảm (giữ >1s): dịch chuyển chém ở từng cây thương (càng nhiều thương càng nhanh, tối đa 3s),
//   xong được buff tốc chạy + sát thương ngắn và 1-3 cây thương rơi từ trời xuống địch (báo trước 3s).
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
const THUNDER_REGEN = 300;         // 5s phạt khi mất hết thương
const THUNDER_SLASH_R = 80;        // bán kính nhát Lôi Trảm chính (rộng hơn bản cũ 60)
const THUNDER_SUB_WARN = 20;       // cảnh báo nhát chém phụ (Evo 2)
const THUNDER_SKYSPEAR_WARN = 180; // 3s cảnh báo thương rơi từ trời
const THUNDER_BUFF_TICKS = 150;    // 2.5s buff sau Lôi Trảm
const THUNDER_BUFF_SPD = 1.2;
const THUNDER_BUFF_DMG = 1.15;

// Số thương tối đa: 3 / có Evo: 5 / Full Evo: 9
function thunderSpearCap(p) {
    // Số thương cầm trên tay luôn tối đa 3 (kể cả Full Evo); thương rơi từ trời trên sân không bị giới hạn
    return 3;
}
function thunderDmg(p, base) {
    return base * ((p.damage || 1) + (p.dmgBuff || 0)) * ((p.thunderBuffTimer || 0) > 0 ? THUNDER_BUFF_DMG : 1);
}
function thunderMyPlanted(p) { return (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === p); }

// Thương chạm mép sân: nổ AoE + cắm lại (gọi từ bullets.js)
function thunderSpearPlant(owner, b) {
    const enemy = (owner.id === 1) ? p2 : p1;
    explosions.push(new Explosion(b.x, b.y, 45, 'rgba(255, 255, 0,', 0, owner)); // chỉ hình ảnh (sát thương tính 1 lần bên dưới)
    if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - b.x, (enemy.y + enemy.h / 2) - b.y) <= 45) {
        const dealt = enemy.takeDamage(thunderDmg(owner, 0.9), owner);
        if (owner.hasUpgrade && owner.hasUpgrade('evo_thun_1')) {
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 45);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
        }
        if (dealt > 0 && !b.thLm) { b.thLm = true; owner.thunderGainLoiMinh(); }
    }
    thunderPlantedSpears.push({
        id: Math.random(), owner,
        x: Math.max(10, Math.min(canvas.width - 10, b.x)),
        y: Math.max(10, Math.min(canvas.height - 10, b.y)),
        angle: Math.atan2(b.vy, b.vx)
    });
}

// Thương phóng ra trúng địch -> +1 Lôi Minh (mỗi cây tối đa 1 lần)
BulletHooks.register('thunder_spear', {
    hit(b, attacker, victim, dmg) {
        if (dmg > 0 && !b.thLm && attacker && attacker.thunderGainLoiMinh) { b.thLm = true; attacker.thunderGainLoiMinh(); }
    },
});

Object.assign(Player.prototype, {
    thunderGainLoiMinh() {
        if ((this.thunderLoiMinhTimer || 0) > 0 || this.thunderSky) return; // đang Thiên Kiếp: không tích
        this.thunderLoiMinhStacks = Math.min(3, (this.thunderLoiMinhStacks || 0) + 1);
        addFloatingText(this.x + this.w / 2, this.y - 24, `LÔI MINH ${this.thunderLoiMinhStacks}/3 ⚡`, "#ffeb3b", 11);
        if (this.thunderLoiMinhStacks >= 3 && !this.thunderIsSlashing) this.activateThienKiep();
    },

    triggerThunderAction(held, now) {
        if ((this.thunderRegenTimer || 0) > 0 && held < 30) {
            addFloatingText(this.x + this.w / 2, this.y - 14, `HỒI THƯƠNG (${(this.thunderRegenTimer / 60).toFixed(1)}s) ⏳`, "#ff9100", 11);
            return;
        }
        if (held < 30) {
            // Nhấp (< 0.5s): Phóng 1 Lôi Phong Thương xuyên qua mọi vật thể/kẻ địch
            if ((this.thunderActionCooldown || 0) > 0) {
                let secLeft = ((this.thunderActionCooldown || 0) / 60).toFixed(1);
                addFloatingText(this.x + this.w / 2, this.y - 14, `HỒI CHIÊU (${secLeft}s)! ⏳`, "#aaa", 11);
                return;
            }
            if (now - (this.lastShot || 0) < 350) return; // Chống lỗi spam bắn liên tục
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
                    dmg: thunderDmg(this, 0.9),
                    owner: this,
                    hook: 'thunder_spear',
                    isThunderSpear: true,
                    isPiercing: true,
                    hitIds: [],
                    bounceCount: 0
                });
                this.lastShot = now;
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            } else {
                // Hết thương trong tay -> tự Thu Thương (cảnh báo 0.25s)
                this.startThunderRecall(false);
            }
        } else if (held >= 30 && held <= 60) {
            this.startThunderRecall(false);       // Giữ vừa (0.5s - 1s): Thu Thương
        } else {
            this.startThunderSlashSequence();     // Giữ lâu (> 1s): Lôi Trảm
        }
    },

    startThunderRecall(instant = false) {
        if (thunderMyPlanted(this).length === 0) {
            addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        if (this.thunderIsRecallWarning) return;
        this.thunderIsRecallWarning = true;
        this.thunderRecallWarningTimer = 15; // 0.25s cảnh báo
        addFloatingText(this.x + this.w / 2, this.y - 15, "THU THƯƠNG! ⚡", "#ffff00", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    // Thu Thương: mỗi cây thương (kể cả thương rơi từ trời) hóa tia sét lao vút về xe
    executeThunderRecall() {
        const mySpears = thunderMyPlanted(this);
        if (mySpears.length === 0) return;
        const inKiep = (this.thunderLoiMinhTimer || 0) > 0;
        const speed = inKiep ? 34 : 26;
        triggerScreenShake(5, 8);
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
        this.thunderRecallHits = 0; // sát thương giảm dần nếu nhiều tia trúng cùng lúc
        mySpears.forEach(s => {
            bodyEffects.push(new ThunderReturnBolt(s.x, s.y, this, speed, thunderDmg(this, 0.7)));
            explosions.push(new Explosion(s.x, s.y, 28, 'rgba(255, 255, 0,', 0, this));
            spawnSparkParticles(s.x, s.y, '#ffff00', 6);
        });
        // Về tay tối đa = giới hạn (thương thừa từ trời không cộng vượt giới hạn)
        this.thunderSpears = thunderSpearCap(this);
        this.thunderRegenTimer = 0;
        this.thunderActionCooldown = 60; // 1s trước khi ném lại
        this.lastShot = Date.now();
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        if (inKiep) return; // Đang Thiên Kiếp: không tích thêm Lôi Minh
        this.thunderConsumedSpears = (this.thunderConsumedSpears || 0) + mySpears.length;
        while (this.thunderConsumedSpears >= 3 && !((this.thunderLoiMinhTimer || 0) > 0)) {
            this.thunderConsumedSpears -= 3;
            this.thunderGainLoiMinh();
        }
        if ((this.thunderLoiMinhTimer || 0) > 0) this.thunderConsumedSpears = 0;
    },

    // ---------- Lôi Trảm ----------
    startThunderSlashSequence() {
        const mySpears = thunderMyPlanted(this);
        if (mySpears.length === 0) {
            addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        const n = mySpears.length;
        this.thunderSlashQueue = mySpears.map(s => ({ x: s.x, y: s.y }));
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        this.thunderIsSlashing = true;
        this.thunderSlashIndex = 0;
        // Càng nhiều thương càng nhanh: (n+1) nhịp <= 3s
        this.thunderSlashInterval = Math.max(12, Math.min(24, 26 - 2 * n, Math.floor(180 / (n + 1))));
        this.thunderSlashTimer = Math.floor(this.thunderSlashInterval / 2); // nhát đầu ra nhanh
        this.thunderSlashHits = 0;
        this.thunderSlashStun = false;
        this.thunderSlashWave = (this.thunderSlashWave || 0) + 1;
        this.thunderOriginPos = { x: this.x, y: this.y };
        this.isInvulnerable = true;
        addFloatingText(this.x + this.w / 2, this.y - 18, `LÔI TRẢM x${n}! ⚡`, "#ffff00", 16);
    },

    // Hệ số giảm dần khi trúng nhiều đòn trong cùng 1 chuỗi Lôi Trảm
    thunderSlashFalloff() { return Math.max(0.15, 1 - 0.2 * (this.thunderSlashHits || 0)); },

    thunderSlashStep() {
        const sp = this.thunderSlashQueue[this.thunderSlashIndex];
        this.thunderSlashIndex++;
        const k = this.thunderSlashIndex;            // số thương đã gom (1..n)
        const e1 = this.hasUpgrade('evo_thun_1'), e2 = this.hasUpgrade('evo_thun_2');
        const full = e1 && e2;
        const fromX = this.x + this.w / 2, fromY = this.y + this.h / 2;
        this.x = Math.max(0, Math.min(canvas.width - this.w, sp.x - this.w / 2));
        this.y = Math.max(0, Math.min(canvas.height - this.h, sp.y - this.h / 2));
        const toX = this.x + this.w / 2, toY = this.y + this.h / 2;
        // Evo 1: càng gom nhiều thương, nhát chém chính càng to & mạnh
        const R = e1 ? Math.min(130, THUNDER_SLASH_R + 8 * (k - 1)) : THUNDER_SLASH_R;
        const mult = e1 ? Math.min(1.6, 1 + 0.12 * (k - 1)) : 1;
        const dmg = thunderDmg(this, 1.3) * mult;
        // [HÌNH ẢNH] tia sét nối điểm cũ -> mới, bóng mờ, 2 nhát quét rộng
        fxBolt(fromX, fromY, toX, toY, '#fff176', 14, 3.5, 18);
        const ang = Math.atan2(toY - fromY, toX - fromX);
        fxSweep(toX, toY, R * 0.85, ang - 2.3, ang + 2.3, '#ffeb3b', 14, 13);
        fxSweep(toX, toY, R * 0.62, ang + Math.PI + 2.0, ang + Math.PI - 2.0, '#80deea', 16, 8);
        explosions.push(new Explosion(toX, toY, R, 'rgba(255, 255, 0,', 0, this));
        this.thunderAfterImage = { x: fromX, y: fromY, t: 14 };
        const enemy = (this.id === 1) ? p2 : p1;
        if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - toX, (enemy.y + enemy.h / 2) - toY) <= R + enemy.w / 2) {
            const dealt = enemy.takeDamage(dmg * this.thunderSlashFalloff(), this);
            if (dealt > 0) this.thunderSlashHits = (this.thunderSlashHits || 0) + 1;
            fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#fff176', 26);
            if (e1 && !this.thunderSlashStun) {
                this.thunderSlashStun = true; // choáng 1 lần mỗi chuỗi
                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 45);
                addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
            }
        }
        // Evo 2: mọi cây thương CÒN LẠI trên sân chém phụ (nửa sát thương, có cảnh báo); Full Evo: = nhát chính
        if (e2) {
            this.thunderSlashWave = (this.thunderSlashWave || 0) + 1;
            for (let j = this.thunderSlashIndex; j < this.thunderSlashQueue.length; j++) {
                const o = this.thunderSlashQueue[j];
                bodyEffects.push(new ThunderStrike(o.x, o.y, this, dmg * (full ? 1 : 0.5), full ? R * 0.8 : R * 0.55, THUNDER_SUB_WARN, 'sub', this.thunderSlashWave));
            }
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
    },

    thunderSlashEnd() {
        const n = (this.thunderSlashQueue || []).length;
        if (this.thunderOriginPos) {
            const fx0 = this.x + this.w / 2, fy0 = this.y + this.h / 2;
            this.x = this.thunderOriginPos.x;
            this.y = this.thunderOriginPos.y;
            fxBolt(fx0, fy0, this.x + this.w / 2, this.y + this.h / 2, '#80deea', 12, 3, 14);
        }
        this.thunderIsSlashing = false;
        this.isInvulnerable = false;
        this.thunderSlashQueue = [];
        this.thunderSpears = thunderSpearCap(this);
        this.thunderRegenTimer = 0;
        this.thunderActionCooldown = 45;
        this.lastShot = Date.now();
        // Buff nhẹ: tốc chạy + sát thương
        this.thunderBuffTimer = THUNDER_BUFF_TICKS;
        addFloatingText(this.x + this.w / 2, this.y - 22, "LÔI TỐC! +SPD +DMG ⚡", "#80deea", 12);
        // 1-3 cây thương rơi từ trời xuống địch (báo trước 3s)
        const enemy = (this.id === 1) ? p2 : p1;
        if (enemy) {
            const cnt = Math.min(3, 1 + Math.floor((n - 1) / 2));
            const ex = enemy.x + enemy.w / 2, ey = thunderLaneY(enemy) + enemy.h / 2;
            for (let i = 0; i < cnt; i++) {
                const off = cnt === 1 ? 0 : (i - (cnt - 1) / 2) * 62;
                const x = Math.max(20, Math.min(canvas.width - 20, ex + off + (Math.random() * 2 - 1) * 18));
                bodyEffects.push(new ThunderStrike(x, ey, this, thunderDmg(this, 0.6), 30, THUNDER_SKYSPEAR_WARN + i * 10, 'sky'));
            }
        }
        this.thunderGainLoiMinh();
    },

    activateThienKiep() {
        this.thunderLoiMinhStacks = 0;
        this.thunderConsumedSpears = 0;
        let hasEvo2 = this.hasUpgrade('evo_thun_2');
        this.thunderLoiMinhTimer = hasEvo2 ? 480 : 300; // 8s hoặc 5s
        if (hasEvo2) {
            this.thunderShieldHits = 3;
        }
        addFloatingText(this.x + this.w / 2, this.y - 20, "⚡ THIÊN KIẾP KÍCH HOẠT! ⚡", "#ffd700", 16);
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
            enemy.takeDamage(thunderDmg(this, 0.9), this);
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
            enemy.takeDamage(thunderDmg(this, 2.2), this);
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
        this.thunderSpears = thunderSpearCap(this);
        this.thunderRegenTimer = 0;
        fxBolt(c.x, c.y, this.x + this.w / 2, this.y + this.h / 2, '#80deea', 12, 2.5, 16);
    },

    // [setupForNewRound] thunder
    setupThunder() {
        if (this.weapon === 'thunder') {
            this.speed *= 1.3;
            this.thunderSpears = thunderSpearCap(this);
            this.thunderRegenTimer = 0;
            this.thunderBuffTimer = 0;
            this.thunderHoldFrames = 0;
            this.thunderLoiMinhStacks = 0;
            this.thunderLoiMinhTimer = 0;
            this.thunderShieldHits = 0;
            this.thunderIsRecallWarning = false;
            this.thunderRecallWarningTimer = 0;
            this.thunderRecallHits = 0;
            this.thunderIsSlashing = false;
            this.thunderSlashQueue = [];
            this.thunderSlashIndex = 0;
            this.thunderSlashTimer = 0;
            this.thunderSlashInterval = 24;
            this.thunderSlashHits = 0;
            this.thunderSlashWave = 0;
            this.thunderSubHitWave = 0;
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

    // Mất hết thương (không còn trong tay / cắm trên sân / đang bay) -> phạt 5s rồi hồi đầy
    updateThunderRegen() {
        const cap = thunderSpearCap(this);
        if ((this.thunderSpears || 0) > cap) this.thunderSpears = cap;
        if ((this.thunderSpears || 0) > 0) { this.thunderRegenTimer = 0; return; }
        if ((this.thunderRegenTimer || 0) > 0) {
            if (--this.thunderRegenTimer <= 0) {
                this.thunderRegenTimer = 0;
                this.thunderSpears = cap;
                addFloatingText(this.x + this.w / 2, this.y - 16, `+${cap} LÔI PHONG THƯƠNG ⚡`, "#ffff00", 12);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#fff176', 12);
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
            }
            return;
        }
        if (this.thunderIsSlashing || this.thunderIsRecallWarning || this.thunderSky) return;
        if (thunderMyPlanted(this).length > 0) return;
        if (this.bullets.some(b => b.isThunderSpear)) return;
        if (bodyEffects.some(e => e.active && e.owner === this && (e instanceof ThunderReturnBolt || (e instanceof ThunderStrike && e.kind === 'sky')))) return;
        this.thunderRegenTimer = THUNDER_REGEN;
        addFloatingText(this.x + this.w / 2, this.y - 16, "MẤT HẾT THƯƠNG! HỒI 5s ⏳", "#ff9100", 12);
    },

    // [update] thunder
    updateThunder() {
        if (this.weapon === 'thunder') {
            // Hồi chiêu sau khi thu thương / dùng kỹ năng
            if ((this.thunderActionCooldown || 0) > 0) this.thunderActionCooldown--;
            if ((this.thunderBuffTimer || 0) > 0) this.thunderBuffTimer--;
            if ((this.thunderDashCd || 0) > 0 && !this.thunderDashState) this.thunderDashCd--;
            if (this.thunderAfterImage && --this.thunderAfterImage.t <= 0) this.thunderAfterImage = null;
            this.updateThunderRegen();

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

            // 2. Lôi Trảm
            if (this.thunderIsSlashing) {
                this.thunderSlashTimer = (this.thunderSlashTimer || 0) + 1;
                if (this.thunderSlashTimer >= (this.thunderSlashInterval || 24)) {
                    this.thunderSlashTimer = 0;
                    if (this.thunderSlashQueue && this.thunderSlashIndex < this.thunderSlashQueue.length) this.thunderSlashStep();
                    else this.thunderSlashEnd();
                }
            }

            // 3. Thời gian Thiên Kiếp -> gần hết giờ tự bay lên trời (Thiên Lôi Giáng)
            if (this.thunderLoiMinhTimer > 0) {
                const busy = this.thunderDashState || (this.thunderRaycastWarningTimer || 0) > 0 || this.thunderIsRecallWarning;
                if (!busy || this.thunderLoiMinhTimer > 1) this.thunderLoiMinhTimer--;
                if (this.thunderLoiMinhTimer % 12 === 0) {
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
                    bodyEffects.push(new ThunderStrike(x, y, this, thunderDmg(this, 0.8), 40, 60));
                }
            }
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
