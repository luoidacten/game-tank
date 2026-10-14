// ==========================================
// Cổng Không Gian (portal) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    triggerPortalEffect() {
        const now = Date.now();
        const hasEvo1 = this.hasUpgrade('evo_portal_1');
        const hasEvo2 = this.hasUpgrade('evo_portal_2');
        const isFullEvo = hasEvo1 && hasEvo2;

        // Evo 1: Đạn nổ (Cũ - giữ nguyên)
        if (hasEvo1) this.nextShotExplosive = true;

        // --- LOGIC TĂNG TỐC & BONUS ---
        if (hasEvo2) {
            const MAX_SPEED_CAP = 20; // Giới hạn tốc độ là 60

            if (isFullEvo) {
                // =================================================
                // TRƯỜNG HỢP 1: FULL EVO (Evo 1 + Evo 2)
                // =================================================

                // 1. Luôn hồi đầy đạn & Tăng tốc đạn (Không có Cooldown)
                this.ammo = this.maxAmmo;
                this.portalBulletSpeedBonus += 1.5;

                // 2. Logic Tốc độ & Bonus
                if (this.speed < MAX_SPEED_CAP) {
                    // Chưa max tốc -> Cộng 6 tốc (Không hồi chiêu)
                    this.speed += 6;
                    if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                    // Hiệu ứng visual tăng tốc
                    ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                    ctx.fillText("SPEED UP+++", this.x, this.y - 10);
                } else {
                    // Đã Max tốc -> Check Cooldown 6s để Hồi Máu & Tăng Dame
                    if (now - this.lastPortalFullBonus > 6000) {

                        // Hồi 1 HP
                        this.hp = Math.min(this.hp + 1, this.maxHp);

                        // Tăng Dame vĩnh viễn (Buff khủng)
                        this.damage += 1;

                        this.lastPortalFullBonus = now;

                        // Hiệu ứng Visual đặc biệt
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'gold', 0, this));
                        ctx.fillStyle = "gold"; ctx.font = "bold 14px Arial";
                        ctx.fillText("OVERDRIVE!", this.x - 10, this.y - 20);
                    }
                }

            } else {
                // =================================================
                // TRƯỜNG HỢP 2: CHỈ CÓ EVO 2 (Gia Tốc)
                // =================================================
                // Giữ logic cũ: Cooldown 1s, cộng 2 tốc
                if (now - this.lastPortalBoost > 1000) {
                    this.ammo = this.maxAmmo;

                    if (this.speed < MAX_SPEED_CAP) {
                        this.speed += 2;
                        if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                        ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                        ctx.fillText("Speed Up", this.x, this.y - 10);
                    }
                    this.lastPortalBoost = now;
                }
            }
        }
    },

    // [update] Cổng Không Gian
    updatePortal() {
        if (this.weapon === 'portal') {
            if (this.x < -this.w) { this.x = canvas.width; this.portalWrapCount = (this.portalWrapCount || 0) + 1; this.triggerPortalEffect(); }
            else if (this.x > canvas.width) { this.x = -this.w; this.portalWrapCount = (this.portalWrapCount || 0) + 1; this.triggerPortalEffect(); }
        } else {
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.w) this.x = canvas.width - this.w;
        }
    },

    // [handleShooting] Cổng Không Gian — trả về true nếu cần dừng handleShooting()
    shootPortal(inp, now) {
        if (this.weapon === 'portal') {
            let isFullEvo = (this.hasUpgrade('evo_portal_1') && this.hasUpgrade('evo_portal_2'));

            if (inp.s) {
                // Nếu Full Evo -> Chế độ Sấy (Auto fire)
                if (isFullEvo) {
                    // Tốc độ bắn nhanh (150ms)
                    if (this.ammo > 0 && now - this.lastShot > 150) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                // Nếu chưa Full Evo -> Bắn từng viên (Semi-auto)
                else {
                    if (this.ammo > 0 && now - this.lastShot > 500) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                        inp.s = false; // Bắt buộc nhả phím
                    }
                }
            }
            return true;
        }
    }
});

// ==========================================
// [MỚI] Evo 1 "Cổng Cường Hóa": tự mở các Cổng Bắn trên sân, mỗi cổng nhắm & bắn vào kẻ thù.
// Hồi chiêu 6s; mỗi lần đi xuyên mép màn hình (qua cổng) thì hồi chiêu ngay lập tức.
// Full Evo: số cổng mở x3.
// ==========================================
const PORTAL_GATE_CD = 360;

class PortalGate {
    constructor(owner, x, y, delay) {
        this.owner = owner;
        this.x = x; this.y = y;
        this.r = 17;
        this.life = 170 + delay; this.maxLife = this.life;
        this.delay = delay;           // mở lần lượt cho đẹp
        this.shots = 3;
        this.fireTimer = 40 + delay;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        if (this.delay > 0) { this.delay--; return; }
        const enemy = this.owner === p1 ? p2 : p1;
        if (this.shots > 0 && --this.fireTimer <= 0 && enemy && enemy.hp > 0) {
            this.fireTimer = 32;
            this.shots--;
            const v = aimVelocity(this.x, this.y, enemy, C.bulletSpeed * 1.5, true);
            spawnBullet(this.owner, { x: this.x - 3, y: this.y - 3, vx: v.vx, vy: v.vy, dmg: this.owner.damage * 0.6, isPortalShot: true });
            spawnSparkParticles(this.x, this.y, '#c084fc', 5);
        }
        if (this.shots <= 0 && this.life > 20) this.life = 20; // bắn xong thì đóng dần
    }
    draw() {
        if (!this.active) return;
        // Cổng mở ra (phóng to) rồi thu nhỏ khi sắp đóng
        const k = this.delay > 0 ? 0 : Math.max(0.05, Math.min(1, (170 - this.life) / 12, this.life / 20));
        if (k <= 0) return;
        const t = Date.now() / 200;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(k, k);
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, this.r + 4);
        g.addColorStop(0, 'rgba(10, 0, 30, 0.95)'); g.addColorStop(0.6, 'rgba(126, 34, 206, 0.8)'); g.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, 0, this.r + 4, (this.r + 4) * 0.75, 0, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.shadowBlur = 12;
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = i % 2 ? '#22d3ee' : '#c084fc'; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.ellipse(0, 0, this.r - i * 3, (this.r - i * 3) * 0.75, 0, t + i * 2, t + i * 2 + 3.6); ctx.stroke();
        }
        ctx.restore();
    }
}

function portalOpenGates(p) {
    const enemy = p === p1 ? p2 : p1;
    const full = p.hasUpgrade('evo_portal_1') && p.hasUpgrade('evo_portal_2');
    const n = full ? 6 : 2;
    const myY = p.y + p.h / 2, enY = enemy ? enemy.y + enemy.h / 2 : canvas.height / 2;
    for (let i = 0; i < n; i++) {
        // Rải cổng trong khoảng giữa 2 làn, lệch về phía địch
        const y = myY + (enY - myY) * (0.35 + Math.random() * 0.4);
        const x = 30 + Math.random() * (canvas.width - 60);
        bodyEffects.push(new PortalGate(p, x, y, i * 8));
    }
    p.portalGateCD = PORTAL_GATE_CD;
    addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 16, `MỞ CỔNG x${n}! 🌀`, '#c084fc', 13);
    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
}

CharHooks.register('portal', {
    setup() { this.portalGateCD = 90; this.portalWrapCount = 0; return false; },
    update() {
        if (!this.hasUpgrade('evo_portal_1')) return;
        // Đi xuyên mép màn hình (wrap) -> hồi chiêu mở cổng ngay
        if ((this.portalWrapCount || 0) !== (this.portalWrapSeen || 0)) { this.portalWrapSeen = this.portalWrapCount; this.portalGateCD = 0; }
        if (this.portalGateCD > 0) { this.portalGateCD--; return; }
        portalOpenGates(this);
    },
});
