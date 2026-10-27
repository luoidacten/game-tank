// ==========================================
// Cổng Không Gian (portal) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    triggerPortalEffect() {
        const now = Date.now();
        const hasEvo1 = this.hasUpgrade('evo_portal_1');
        const hasEvo2 = this.hasUpgrade('evo_portal_2');
        const isFullEvo = hasEvo1 && hasEvo2 && hasFullEvo(this, 'portal');

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
        if (this.weapon === 'portal' && isGrounded(this)) {
            this.x = Math.max(0, Math.min(canvas.width - this.w, this.x)); // Sa Lầy: không xuyên mép
        } else if (this.weapon === 'portal') {
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
            let isFullEvo = (hasFullEvo(this, 'portal'));

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
// Evo 1 "Cổng Cường Hóa": tự mở Cổng Bắn trên NỬA SÂN CỦA MÌNH, mỗi cổng ngắm & bắn vào kẻ thù.
// - Mọi lần mở cổng đi qua 1 hồi chiêu chung 5s (300 tick); đi xuyên mép màn hình KHÔNG còn hồi chiêu ngay.
// - Giới hạn số cổng đang mở cùng lúc: 2 (Evo 1) / 3 (Full Evo). Đủ cổng -> chờ có chỗ trống mới mở.
// - Trước mỗi phát: tia ngắm nét đứt bám theo địch, rồi KHOÁ hướng 0.4s (đỏ, nhấp nháy) -> bắn thẳng
//   theo hướng đã khoá để đối thủ kịp né.
// ==========================================
const PORTAL_GATE_CD = 300;     // 5s
const PORTAL_GATE_LOCK = 24;    // 0.4s cảnh báo (khoá hướng) trước mỗi phát
const PORTAL_GATE_GAP = 44;     // nhịp giữa các phát của 1 cổng

function portalGateCap(p) { return (hasFullEvo(p, 'portal')) ? 3 : 2; }
function portalActiveGates(p) {
    let n = 0;
    for (const g of bodyEffects) if (g instanceof PortalGate && g.active && g.owner === p) n++;
    return n;
}

class PortalGate {
    constructor(owner, x, y, delay) {
        this.owner = owner;
        this.x = x; this.y = y;
        this.r = 17;
        this.age = 0;
        this.life = 200 + delay; this.maxLife = this.life;
        this.delay = delay;           // mở lần lượt cho đẹp
        this.shots = 3;
        this.fireTimer = 44;          // >= PORTAL_GATE_LOCK: phát đầu luôn có cảnh báo
        this.aimX = x; this.aimY = y; // điểm ngắm (khoá khi fireTimer <= PORTAL_GATE_LOCK)
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        if (this.delay > 0) { this.delay--; return; }
        this.age++;
        const enemy = this.owner === p1 ? p2 : p1;
        if (this.shots > 0 && enemy && enemy.hp > 0) {
            this.fireTimer--;
            // Còn bám mục tiêu -> cập nhật điểm ngắm; vào 0.4s cuối thì khoá cứng
            if (this.fireTimer > PORTAL_GATE_LOCK) { this.aimX = enemy.x + enemy.w / 2; this.aimY = enemy.y + enemy.h / 2; }
            if (this.fireTimer <= 0) {
                this.fireTimer = PORTAL_GATE_GAP;
                this.shots--;
                const v = aimVelocity(this.x, this.y, { x: this.aimX, y: this.aimY, w: 0, h: 0, vx: 0 }, C.bulletSpeed * 1.5, false);
                spawnBullet(this.owner, { x: this.x - 3, y: this.y - 3, vx: v.vx, vy: v.vy, dmg: this.owner.damage * 0.6, isPortalShot: true });
                spawnSparkParticles(this.x, this.y, '#c084fc', 6);
            }
        }
        if (this.shots <= 0 && this.life > 20) this.life = 20; // bắn xong thì đóng dần
    }
    draw() {
        if (!this.active || this.delay > 0) return;
        portalGateDrawAim(this);
        this.drawBody();
        portalGateDrawCore(this);
    }
    // Thân cổng mặc định (tank-art/curse.js ghi đè bằng bản đẹp hơn)
    drawBody() {
        const k = Math.max(0.05, Math.min(1, this.age / 12, this.life / 20));
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

// Tia ngắm: nét đứt tím khi còn bám mục tiêu; khoá 0.4s cuối -> tia đỏ dày dần + vòng thu nhỏ tại điểm khoá
function portalGateDrawAim(g) {
    if (!(g.shots > 0) || g.life <= 20) return;
    const locked = g.fireTimer <= PORTAL_GATE_LOCK;
    const dx = g.aimX - g.x, dy = g.aimY - g.y;
    const d = Math.hypot(dx, dy) || 1;
    const L = d + 50; // kéo quá mục tiêu một chút
    ctx.save();
    ctx.lineCap = 'round';
    if (locked) {
        const blink = 0.5 + 0.5 * Math.sin(Date.now() / 45);
        const prog = 1 - g.fireTimer / PORTAL_GATE_LOCK;
        ctx.strokeStyle = `rgba(255, 60, 90, ${0.45 + 0.45 * blink})`;
        ctx.shadowColor = '#ff2d55'; ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5 + prog * 2.5;
    } else {
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
        ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 6;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 6]);
        ctx.lineDashOffset = -Date.now() / 30;
    }
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + dx / d * L, g.y + dy / d * L); ctx.stroke();
    if (locked) {
        const rr = 6 + 16 * (g.fireTimer / PORTAL_GATE_LOCK);
        ctx.setLineDash([]); ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#ff2d55';
        ctx.beginPath(); ctx.arc(g.aimX, g.aimY, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g.aimX - rr - 4, g.aimY); ctx.lineTo(g.aimX - rr + 3, g.aimY);
        ctx.moveTo(g.aimX + rr + 4, g.aimY); ctx.lineTo(g.aimX + rr - 3, g.aimY);
        ctx.stroke();
    }
    ctx.restore();
}
// Lõi đỏ phồng lên trong lòng cổng khi đang khoá bắn
function portalGateDrawCore(g) {
    if (!(g.shots > 0) || g.fireTimer > PORTAL_GATE_LOCK || g.life <= 20) return;
    const prog = 1 - g.fireTimer / PORTAL_GATE_LOCK;
    ctx.save();
    ctx.fillStyle = '#ff2d55'; ctx.shadowColor = '#ff2d55'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(g.x, g.y, 2 + 4 * prog, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(g.x, g.y, 1 + 1.5 * prog, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Mở Cổng Bắn — điểm vào DUY NHẤT; tôn trọng hồi chiêu & giới hạn số cổng.
function portalOpenGates(p) {
    if (!p || (p.portalGateCD || 0) > 0) return false;
    const free = portalGateCap(p) - portalActiveGates(p);
    if (free <= 0) return false;  // đủ cổng -> chờ
    const midY = canvas.height / 2;
    const myY = p.y + p.h / 2;
    for (let i = 0; i < free; i++) {
        // Chỉ trong nửa sân của mình: từ trước mũi xe (20%) tới gần vạch giữa (85%)
        const y = myY + (midY - myY) * (0.2 + Math.random() * 0.65);
        const x = 30 + Math.random() * (canvas.width - 60);
        bodyEffects.push(new PortalGate(p, x, y, i * 8));
    }
    p.portalGateCD = PORTAL_GATE_CD;
    addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 16, `MỞ CỔNG x${free}! 🌀`, '#c084fc', 13);
    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    return true;
}

CharHooks.register('portal', {
    setup() { this.portalGateCD = 90; this.portalWrapCount = 0; return false; },
    update() {
        if (!this.hasUpgrade('evo_portal_1')) return;
        if (this.portalGateCD > 0) { this.portalGateCD--; return; }
        portalOpenGates(this);
    },
});

// HUD: vòng hồi chiêu mở cổng + chấm = số cổng đang mở / tối đa
function portalRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('portal', p => {
        if (!p.hasUpgrade('evo_portal_1')) return null;
        const cap = portalGateCap(p), act = portalActiveGates(p);
        const cd = p.portalGateCD || 0;
        const base = { color: '#c084fc', pips: act, pipMax: cap, pipColor: '#22d3ee', btnIcon: '🌀' };
        if (cd > 0) return Object.assign(base, { pct: 1 - cd / PORTAL_GATE_CD, ready: false, label: 'CỔNG ' + (cd / 60).toFixed(1) + 's' });
        if (act >= cap) return Object.assign(base, { pct: 1, ready: false, label: `CỔNG ĐẦY ${act}/${cap}` });
        return Object.assign(base, { pct: 1, ready: true, label: 'MỞ CỔNG!' });
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', portalRegisterHUD);
