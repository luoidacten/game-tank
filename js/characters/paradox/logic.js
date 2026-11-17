// ==========================================
// paradox (paradox) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

// ------------------------------------------
// VẾT NỨT THỜI GIAN: mỗi lần tua ngược / về neo để lại 1 vết nứt ở chỗ cũ (tồn tại 10s, tối đa 3).
// Khi Paradox khai hoả "dòng thời gian" (đặt neo, về neo / tua ngược, phát bắn tái hiện 3s của Evo 2)
// mọi vết nứt còn sống cùng khai hoả: tụ sáng 0.2s (cảnh báo) rồi bắn 1 viên 25% dame (Full Evo 50%).
// ------------------------------------------
const PDX_RIFT_MAX = 3;
const PDX_RIFT_LIFE = 600;
const PDX_FIRE_MS = 400;        // nhịp bắn thường (cũ 500ms)
const PDX_ECHO_DELAY = 20;      // DƯ ÂM: phát bắn lặp lại sau 0.33s từ đúng chỗ đã bắn
function pdxEchoMult(p) {
    const e1 = p.hasUpgrade('evo_paradox_1'), e2 = p.hasUpgrade('evo_paradox_2');
    return (e1 && e2 && hasLegacyFullEvo(p, 'paradox')) ? 0.6 : (e2 ? 0.5 : 0.4);
}

Object.assign(Player.prototype, {
    paradoxSpawnRift(cx, cy) {
        if (typeof bodyEffects === 'undefined' || typeof PdxRift === 'undefined') return;
        const mine = bodyEffects.filter(e => e instanceof PdxRift && e.active && e.owner === this);
        while (mine.length >= PDX_RIFT_MAX) mine.shift().active = false;
        bodyEffects.push(new PdxRift(this, cx, cy));
    },

    // Bắn thường + xếp hàng 1 phát DƯ ÂM (dữ liệu thuần -> online OK)
    paradoxShot(now) {
        this.fireBullet(1);
        this.ammo--;
        this.lastShot = now;
        if (!this.pdxEchoQ) this.pdxEchoQ = [];
        if (this.pdxEchoQ.length < 6) this.pdxEchoQ.push({ t: PDX_ECHO_DELAY, x: this.x + this.w / 2, y: this.y });
    },

    paradoxFireRifts() {
        if (typeof bodyEffects === 'undefined' || typeof PdxRift === 'undefined') return 0;
        let n = 0;
        for (const e of bodyEffects) {
            if (e instanceof PdxRift && e.active && e.owner === this && e.cd <= 0 && e.fireIn <= 0) {
                e.fireIn = 12; e.cd = 30; n++;
            }
        }
        return n;
    },

    // [setupForNewRound] paradox
    setupParadox() {
        if (this.weapon === 'paradox') {
            this.paradoxHistory = [];      // Lưu trữ {x, y, hp, shot} trong 3 giây (180 frame)
            this.enemyHistory = [];        // Lưu trữ {x, y} của địch trong 3 giây
            this.paradoxCooldown = 0;      // Hồi chiêu 12s hoặc 7s
            this.paradoxCharge = 0;        // Tụ lực giữ nút
            this.paradoxAnchor = null;     // [MỚI] Neo thời không {x, y, hp, ammo, timer}
            this.paradoxAnchorCD = 0;      // Hồi chiêu neo (20s)

            this.enemyTimeMarks = 0;       // Số tầng ấn thời gian trên người địch
            this.enemyStationaryShadow = null; // Bóng đứng yên (Evo 1)
            this.pdxEchoQ = [];            // DƯ ÂM: hàng đợi phát lặp {t, x, y}
            this.pdxShift = 0;             // NGOÀI DÒNG THỜI GIAN: miễn nhiễm ngắn sau khi tua
        }
    },

    // [update] paradox
    updateParadox() {
        if (this.weapon === 'paradox') {
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && hasEvo2 && hasLegacyFullEvo(this, 'paradox');

            // Tạm thời khởi tạo shot: false, sẽ được kiểm tra lại ĐÚNG THỜI ĐIỂM BẮN ở bên dưới
            this.paradoxHistory.push({ x: this.x, y: this.y, hp: this.hp, shot: false });

            // RÚT NGẮN XUỐNG 3 GIÂY (180 FRAMES)
            if (this.paradoxHistory.length > 180) {
                let oldest = this.paradoxHistory.shift();

                // EVO 2: Bóng ma tự động tái hiện lại CHÍNH XÁC phát bắn của 3s trước
                if (hasEvo2 && oldest.shot) {
                    let dmgMult = isFullEvo ? 1.0 : 0.6; // Full Evo = 100% dame, Evo 2 = 60% dame
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
                    this.paradoxFireRifts(); // dự đoán 3s khai hoả -> các vết nứt cùng bắn
                }
            }

            // Lưu tọa độ địch
            const enemy = (this.id === 1) ? p2 : p1;
            this.enemyHistory.push({ x: enemy.x, y: enemy.y });
            if (this.enemyHistory.length > 180) this.enemyHistory.shift();

            // DƯ ÂM: phát bắn lặp lại từ vị trí đã bắn
            if (this.pdxEchoQ && this.pdxEchoQ.length) {
                for (let i = this.pdxEchoQ.length - 1; i >= 0; i--) {
                    const q = this.pdxEchoQ[i];
                    if (--q.t > 0) continue;
                    this.pdxEchoQ.splice(i, 1);
                    if (this.hp <= 0) continue;
                    const dirY = (this.id === 1) ? -1 : 1;
                    this.bullets.push({
                        type: 'normal', x: q.x - 2.5, y: (this.id === 1) ? q.y : q.y + this.h, w: 5, h: 5,
                        vx: 0, vy: dirY * C.bulletSpeed * 1.1, dmg: (this.damage + (this.dmgBuff || 0)) * pdxEchoMult(this),
                        owner: this, bounceCount: 0, hitIds: [], isPiercing: false, pdxEcho: true
                    });
                    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(q.x, q.y + this.h / 2, '#00f0ff', 4);
                }
            }
            if (this.pdxShift > 0) this.pdxShift--;
            if (this.paradoxCooldown > 0) this.paradoxCooldown--;
            if (this.paradoxAnchorCD > 0) this.paradoxAnchorCD--;
            if (this.paradoxAnchor && --this.paradoxAnchor.timer <= 0) {
                this.paradoxAnchor = null; // Neo tồn tại 10s
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, 'NEO TAN BIẾN', '#88aaff', 12);
            }
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

    // Các mốc tụ lực (frame). 0 = mốc không dùng được lúc này.
    //   rewind: tua ngược (giảm từ 20 -> 12 frame) | pull: kéo địch (Full Evo) | anchor: mốc trống cuối -> đặt neo
    paradoxMilestones() {
        const isFullEvo = hasLegacyFullEvo(this, 'paradox');
        const pull = (isFullEvo && this.paradoxCooldown <= 0) ? 40 : 0;
        const anchor = (this.paradoxAnchorCD <= 0 && !this.paradoxAnchor) ? (isFullEvo ? 75 : 45) : 0;
        return { rewind: 12, pull, anchor };
    },

    paradoxRewind(pullOnly) {
        const hasEvo1 = this.hasUpgrade('evo_paradox_1');
        const hasEvo2 = this.hasUpgrade('evo_paradox_2');
        const isFullEvo = hasEvo1 && hasEvo2 && hasLegacyFullEvo(this, 'paradox');
        const enemy = (this.id === 1) ? p2 : p1;
        const pastSelf = this.paradoxHistory[0]; // Bản thân 3s trước
        const pastEnemy = this.enemyHistory[0] || { x: enemy.x, y: enemy.y }; // Địch 3s trước

        // Kéo địch: luôn ưu tiên tuyệt đối Bóng Đứng Yên của Evo 1
        const pullEnemy = () => {
            if (hasEvo1 && this.enemyStationaryShadow) {
                enemy.x = this.enemyStationaryShadow.x;
                enemy.y = this.enemyStationaryShadow.y;
                enemy.freezeTimer = 90; // Choáng 1.5s
                this.enemyStationaryShadow = null;
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
            } else if (isFullEvo) {
                enemy.x = pastEnemy.x;
                enemy.y = pastEnemy.y;
                enemy.freezeTimer = 90;
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
            }
        };

        const riftX = this.x + this.w / 2, riftY = this.y + this.h / 2;
        if (pullOnly) {
            // MỐC 2 (Full Evo): chỉ kéo đối thủ
            pullEnemy();
        } else if (this.paradoxAnchor) {
            // Có NEO: tua về đúng neo (vị trí, máu, đạn) rồi xoá neo
            const a = this.paradoxAnchor;
            this.x = a.x; this.y = a.y;
            this.hp = Math.min(this.maxHp, a.hp);
            this.ammo = Math.min(this.maxAmmo, a.ammo);
            this.paradoxAnchor = null;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 70, '#88aaff', 0, this));
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, 'VỀ NEO! ⚓', '#88aaff', 14);
            if (hasEvo1) pullEnemy();
            this.paradoxSpawnRift(riftX, riftY);
            this.paradoxFireRifts();
        } else {
            // MỐC 1: Tua lại bản thân 3s
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
                            this.fireBullet(hasEvo2 ? 1.6 : 1.2, false, 'paradox_echo');
                        }
                    }, s * 120);
                }
            }
            if (hasEvo1) pullEnemy();
            this.paradoxSpawnRift(riftX, riftY);
            this.paradoxFireRifts();
        }

        // NGOÀI DÒNG THỜI GIAN: tua ngược / về neo -> giải mọi hiệu ứng xấu + miễn nhiễm 0.6s
        if (!pullOnly) {
            this.freezeTimer = 0; this.slowTimer = 0; this.bleedTimer = 0; this.burnTimer = 0; this.burnStacks = 0; this.acidBurnTimer = 0;
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 36);
            this.pdxShift = 36;
        }
        // Hồi chiêu: Evo 2 còn 5.5s (330 frames), gốc 9s (540 frames)
        this.paradoxCooldown = hasEvo2 ? 330 : 540;
    },

    // [handleShooting] paradox — trả về true nếu cần dừng handleShooting()
    shootParadox(inp, now) {
        if (this.weapon === 'paradox') {
            let hasEvo1 = this.hasUpgrade('evo_paradox_1');
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = hasEvo1 && hasEvo2 && hasLegacyFullEvo(this, 'paradox');

            // Bộ đệm nhấp: nhấp sớm trong 0.2s trước khi hết nhịp vẫn được tính
            if (this.pdxBuffer > 0) {
                this.pdxBuffer--;
                if (!inp.s && !(this.paradoxCharge > 0) && this.ammo > 0 && now - this.lastShot > PDX_FIRE_MS) { this.pdxBuffer = 0; this.paradoxShot(now); return true; }
            }
            const m = this.paradoxMilestones();
            const rewindReady = this.paradoxCooldown <= 0;
            const anchorReady = m.anchor > 0;

            if (rewindReady || anchorReady) {
                if (inp.s) {
                    this.paradoxCharge++;
                } else if (this.paradoxCharge > 0) {
                    const c = this.paradoxCharge;
                    this.paradoxCharge = 0;
                    if (anchorReady && c >= m.anchor) {
                        // MỐC CUỐI (mốc trống): Đặt NEO THỜI KHÔNG - lần tua ngược kế tiếp sẽ về neo
                        this.paradoxAnchor = { x: this.x, y: this.y, hp: this.hp, ammo: this.ammo, timer: 600 };
                        this.paradoxAnchorCD = 1200;
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, '#88aaff', 0, this));
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, 'NEO THỜI KHÔNG ⚓', '#88aaff', 14);
                        this.paradoxFireRifts(); // khai hoả neo -> các vết nứt cùng bắn
                    } else if (rewindReady && c >= m.rewind && this.paradoxHistory.length > 0) {
                        this.paradoxRewind(m.pull > 0 && c >= m.pull);
                    } else if (c < m.rewind || !rewindReady) {
                        // Bấm nhẹ (hoặc tua ngược đang hồi) -> Bắn đạn thường
                        if (this.ammo > 0 && now - this.lastShot > PDX_FIRE_MS) this.paradoxShot(now);
                        else if (this.ammo > 0) this.pdxBuffer = 12; // nhấp hơi sớm -> tự bắn khi hết nhịp
                    }
                }
            } else {
                // Đang hồi chiêu -> Bắn bình thường không tụ lực
                if (inp.s && this.ammo > 0 && now - this.lastShot > PDX_FIRE_MS) {
                    this.paradoxShot(now);
                    inp.s = false;
                }
            }
            return true;
        }
    }
});
