// ==========================================
// Pháo Lửa (fire_cannon) — Logic
// Anh em lửa của Pháo Băng: đạn gây ĐỐT (sát thương theo thời gian) thay vì làm chậm,
// mỗi phát thứ 3 là HỎA CẦU để lại VÙNG LỬA trên làn địch (gây dame mỗi nhịp).
//   Evo 1 Hỏa Diệm Sơn: cứ 2 vùng lửa thì 1 vùng Đại Hỏa (to hơn, cháy lâu hơn, dame cao hơn).
//   Evo 2 Bạo Viêm: Đốt cộng dồn tới 3 tầng; Hỏa Cầu trúng địch đang cháy -> KÍCH NỔ toàn bộ tầng Đốt.
//   Full Evo: vùng lửa gần nhau HỢP NHẤT thành TƯỜNG LỬA chắn ngang làn địch (dài hơn, cháy lâu hơn).
// Toàn bộ trạng thái là trường số thuần trên player / thực thể trong bodyEffects (đồng bộ online).
// ==========================================

const FC_BURN_DUR = 90;           // 1.5s mỗi lần trúng (làm mới)
const FC_BURN_TICK = 30;          // nhịp đốt 0.5s
const FC_BURN_DMG = 0.05;         // dame mỗi nhịp mỗi tầng (Evo 2: 0.08)
const FC_ZONE_TICK = 30;          // nhịp vùng lửa 0.5s
const FC_ZONE_DMG = 0.1;          // dame mỗi nhịp vùng lửa thường (Evo 1: x1.5, Đại Hỏa x3)
const FC_MERGE_GAP = 70;          // Full Evo: 2 vùng cách nhau <= 70px (mép) thì hợp nhất

function fcEnemyOf(p) { return p === p1 ? p2 : p1; }
function fcIsFull(p) { return hasFullEvo(p, 'fire_cannon'); }
function fcMaxStacks(p) { return p.hasUpgrade('evo_fc_2') ? 3 : 1; }

// Châm lửa nạn nhân: dùng chung burnTimer của game làm "cổng" -> mọi hiệu ứng giải trạng thái (xóa burnTimer) cũng dập lửa
function fcIgnite(owner, v, addStacks) {
    if (!v || v.hp <= 0) return;
    v.fcBurnSt = Math.min(fcMaxStacks(owner), (v.fcBurnT > 0 && v.burnTimer > 0 ? (v.fcBurnSt || 0) : 0) + (addStacks || 1));
    v.fcBurnT = FC_BURN_DUR;
    v.fcBurnOwner = owner.id;
    v.burnTimer = Math.max(v.burnTimer || 0, FC_BURN_DUR + 2);
}

// --- Vùng lửa trên làn địch ---
class FcZone {
    constructor(owner, x, y, hw, hh, life, power, wall) {
        this.owner = owner;
        this.x = x; this.y = y; this.hw = hw; this.hh = hh;
        this.life = life; this.maxLife = life; this.power = power;
        this.wall = !!wall; this.grow = 0; this.t = 0;
        this.active = true;
        this.x = Math.max(hw, Math.min(canvas.width - hw, this.x));
    }
    update() {
        if (!this.active) return;
        this.t++;
        if (this.grow < 1) this.grow = Math.min(1, this.grow + 0.08);
        if (--this.life <= 0) { this.active = false; return; }
        const owner = this.owner, enemy = owner ? fcEnemyOf(owner) : null;
        if (!enemy || enemy.hp <= 0) return;
        const hw = this.hw * this.grow;
        const inside = Math.abs(enemy.x + enemy.w / 2 - this.x) < hw + enemy.w / 2 && Math.abs(enemy.y + enemy.h / 2 - this.y) < this.hh + enemy.h / 2;
        if (!inside) return;
        if (this.t % FC_ZONE_TICK === 0) {
            enemy.takeDamage(FC_ZONE_DMG * this.power, owner, { isEnvironmental: true, isDot: true });
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ff8a1a', 4);
        }
        // Đứng trong lửa: luôn bị Đốt, mỗi 1s cộng thêm 1 tầng (Evo 2 mới cộng dồn được)
        if (this.t % 60 === 0 || !(enemy.fcBurnT > 0 && enemy.burnTimer > 0)) fcIgnite(owner, enemy, 1);
    }
    draw() { if (typeof fcDrawZone === 'function') fcDrawZone(this); }
}

// Tạo vùng lửa tại toạ độ x trên làn của đối thủ (Full Evo: hợp nhất thành Tường Lửa)
function fcSpawnZone(owner, x) {
    const enemy = fcEnemyOf(owner);
    if (!enemy || typeof bodyEffects === 'undefined') return;
    const y = enemy.y + enemy.h / 2;
    let big = false;
    if (owner.hasUpgrade('evo_fc_1')) {
        owner.fcZoneCount = (owner.fcZoneCount || 0) + 1;
        big = owner.fcZoneCount % 2 === 0;
    }
    const e1 = owner.hasUpgrade('evo_fc_1');
    let hw = big ? 64 : (e1 ? 46 : 40), life = big ? 300 : (e1 ? 210 : 180), power = big ? 3 : (e1 ? 1.5 : 1);
    const hh = 22;
    if (fcIsFull(owner)) {
        // Gom mọi vùng lửa của mình ở gần -> 1 Tường Lửa
        let L = x - hw, R = x + hw, merged = 0, maxLife = life;
        for (const z of bodyEffects) {
            if (!(z instanceof FcZone) || !z.active || z.owner !== owner) continue;
            if (Math.abs(z.y - y) > 30) continue;
            if (z.x - z.hw > R + FC_MERGE_GAP || z.x + z.hw < L - FC_MERGE_GAP) continue;
            L = Math.min(L, z.x - z.hw); R = Math.max(R, z.x + z.hw);
            maxLife = Math.max(maxLife, z.life);
            z.active = false; merged++;
        }
        if (merged) {
            const nz = new FcZone(owner, (L + R) / 2, y, Math.min(canvas.width / 2, (R - L) / 2), hh, Math.max(maxLife, 300) + 60, 1.5, true);
            nz.grow = 0.85;
            bodyEffects.push(nz);
            addFloatingText(nz.x, y + (enemy.id === 1 ? -34 : 34), 'TƯỜNG LỬA!', '#ffb020', 15);
            if (typeof triggerScreenShake === 'function') triggerScreenShake(4, 10);
            return;
        }
    }
    bodyEffects.push(new FcZone(owner, x, y, hw, hh, life, power, false));
    if (big) addFloatingText(x, y + (enemy.id === 1 ? -30 : 30), 'ĐẠI HỎA!', '#ff6a1a', 13);
}

// --- Đạn ---
BulletHooks.register('fire_cannon', {
    hit(b, attacker, victim, dealt) {
        if (!victim || typeof victim.takeDamage !== 'function') return;
        const wasBurning = victim.fcBurnT > 0 && victim.burnTimer > 0 ? (victim.fcBurnSt || 0) : 0;
        // Evo 2: Hỏa Cầu trúng mục tiêu đang cháy -> KÍCH NỔ các tầng Đốt
        if (b.fcBig && wasBurning && attacker.hasUpgrade('evo_fc_2') && victim.hp > 0) {
            const bonus = 0.35 * wasBurning * (fcIsFull(attacker) ? 1.2 : 1);
            victim.takeDamage(bonus, attacker, { isEnvironmental: true });
            const cx = victim.x + victim.w / 2, cy = victim.y + victim.h / 2;
            explosions.push(new Explosion(cx, cy, 45 + 12 * wasBurning, 'rgba(255, 120, 20,', 0, attacker));
            addFloatingText(cx, victim.y + (victim.id === 1 ? -22 : victim.h + 22), 'BẠO VIÊM x' + wasBurning, '#ffd166', 14);
            if (typeof triggerScreenShake === 'function') triggerScreenShake(5, 10);
            victim.fcBurnSt = 0; victim.fcBurnT = 0;
        }
        fcIgnite(attacker, victim, 1);
        if (b.fcBig) fcSpawnZone(attacker, victim.x + victim.w / 2);
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff9a1a', b.fcBig ? 12 : 5);
    },
    edge(b, owner) {
        if (b.fcBig) fcSpawnZone(owner, b.x + b.w / 2);
    },
    draw(b) { if (typeof fcDrawBullet === 'function') fcDrawBullet(b); },
});

CharHooks.register('fire_cannon', {
    setup() {
        this.fcShots = 0; this.fcZoneCount = 0; this.fcInfernoT = 0;
        // Evo 1: vỏ thép nung +1 Máu tối đa
        if (this.hasUpgrade('evo_fc_1')) { this.maxHp += 1; this.hp = Math.min(this.maxHp, this.hp + 1); }
    },
    update() {
        const e = fcEnemyOf(this);
        // Full Evo: HỎA NGỤC mỗi 7s — dựng vùng lửa ngay dưới chân địch & châm Đốt tối đa tầng
        if (fcIsFull(this) && e && e.hp > 0 && gameState.phase === 'playing') {
            this.fcInfernoT = (this.fcInfernoT || 0) + 1;
            if (this.fcInfernoT >= 420) {
                this.fcInfernoT = 0;
                fcSpawnZone(this, e.x + e.w / 2);
                fcIgnite(this, e, 3);
                explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 70, 'rgba(255, 120, 20,', 0, this));
                addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -40 : e.h + 40), 'HỎA NGỤC!', '#ff7a1a', 16);
            }
        }
        // Đốt trên đối thủ do mình châm
        if (!e || !(e.fcBurnT > 0) || e.fcBurnOwner !== this.id) return;
        if (!(e.burnTimer > 0)) { e.fcBurnT = 0; e.fcBurnSt = 0; return; } // đã bị giải trạng thái
        e.fcBurnT--;
        if (e.fcBurnT % FC_BURN_TICK === 0 && e.hp > 0) {
            e.takeDamage((this.hasUpgrade('evo_fc_2') ? 0.08 : FC_BURN_DMG) * Math.max(1, e.fcBurnSt || 1), this, { isEnvironmental: true, isDot: true, unavoidable: true });
        }
        if (e.fcBurnT <= 0) e.fcBurnSt = 0;
    },
    shoot(inp, now) {
        if (inp.s && this.ammo > 0 && now - this.lastShot > 500) {
            this.fcShots = (this.fcShots || 0) + 1;
            const big = this.fcShots % 3 === 0;
            const n0 = this.bullets.length;
            const foe = fcEnemyOf(this);
            // Evo 2: x1.4 dame lên địch đang cháy (anh em với x1.5 dame lên địch bị chậm của Pháo Băng)
            const hot = this.hasUpgrade('evo_fc_2') && foe && foe.fcBurnT > 0 && foe.burnTimer > 0;
            this.fireBullet(1);
            for (let i = n0; i < this.bullets.length; i++) {
                const b = this.bullets[i];
                b.hook = 'fire_cannon';
                if (hot) { b.dmg *= 1.4; b.fcHot = 1; }
                if (big) {
                    b.fcBig = 1;
                    const g = this.hasUpgrade('evo_fc_1') ? 14 : 10;
                    b.x -= g / 2; b.w += g; b.h += g;
                    b.vx *= 1.4; b.vy *= 1.4;
                }
            }
            this.ammo--;
            this.lastShot = now;
            inp.s = false;
        }
        return true;
    },
});
