// ==========================================
// Xe Tiền (money_tank) — Logic (cập nhật, bắn, kỹ năng)
// ------------------------------------------
// Body "farm tiền": đầu trận yếu, mua CẤP ĐỘ trong shop để mạnh dần.
//  - Cấp 3: Khiên + 2 HP | Cấp 4: Đạn xuyên + 0.5 dame | Cấp 5: Đạn nổ
//  - Cấp 6 (cuối) "Đế Chế Tiền Tệ": +3 HP, +2 đạn, +1 dame, 2 khiên đầu hiệp
//  - Evo 1 Tiền Tấn Công: định kỳ phóng 1 xe tiền (Full Evo: 3 xe LẦN LƯỢT) trên 1 cột dọc ngẫu nhiên gần địch,
//    mỗi xe có CẢNH BÁO đường chạy 2s trước khi lao (đối thủ kịp né), nổ khi chạm tường
//  - Evo 2 Sức Mạnh Đồng Tiền: mọi nâng cấp -25%; mỗi 100$ tiêu (tối đa 2500$) nhận 1 mốc thưởng vĩnh viễn
//  - Full Evo: mọi mặt hàng -50%, nhiều xe tiền trên sân hơn, 3 xe tấn công lần lượt mỗi 5s
// ==========================================

const MT_MILESTONE_STEP = 100, MT_MILESTONE_MAX = 2500;
// Thưởng theo mốc (xoay vòng); mỗi 5 mốc (500$) thêm 1 khiên đầu hiệp
const MT_MILESTONE_REWARDS = [
    { k: 'hp', v: 1, txt: '+1 HP' },
    { k: 'dmg', v: 0.15, txt: '+0.15 Dame' },
    { k: 'ammo', v: 1, txt: '+1 Đạn' },
    { k: 'speed', v: 0.15, txt: '+0.15 Tốc' },
    { k: 'shield', v: 1, txt: '+1 Khiên đầu hiệp' },
];

function mtIsFull(p) { return p.weapon === 'money_tank' && hasFullEvo(p, 'money_tank'); }
// Hệ số giá trong shop cho Xe Tiền (Evo 2: -25%, Full Evo: -50%)
function mtPriceMult(p) {
    if (!p || p.weapon !== 'money_tank') return 1;
    if (mtIsFull(p)) return 0.5;
    if (p.hasUpgrade('evo_money_2')) return 0.75;
    return 1;
}

// Ghi nhận tiền đã tiêu trong shop -> mở mốc thưởng (chỉ tính từ lúc có Evo 2)
function mtOnSpend(p, amount) {
    if (gameState._noSpendTrack || !p || p.weapon !== 'money_tank' || !p.hasUpgrade('evo_money_2') || amount <= 0) return;
    const d = p.mtSpend || (p.mtSpend = { spent: 0, got: 0, bonus: { hp: 0, dmg: 0, ammo: 0, speed: 0, shield: 0 } });
    d.spent = Math.min(MT_MILESTONE_MAX, d.spent + amount);
    const reach = Math.floor(d.spent / MT_MILESTONE_STEP);
    while (d.got < reach) {
        const r = MT_MILESTONE_REWARDS[d.got % MT_MILESTONE_REWARDS.length];
        d.bonus[r.k] += r.v;
        d.got++;
        d.lastTxt = `MỐC ${d.got * MT_MILESTONE_STEP}$: ${r.txt}`;
    }
}

// Theo dõi mọi khoản trừ tiền trong màn shop (mua thẻ, cấp độ, đổi hàng, chợ...)
(function installCoinTracker() {
    ['p1Coins', 'p2Coins'].forEach((key, i) => {
        let val = gameState[key] || 0;
        Object.defineProperty(gameState, key, {
            configurable: true, enumerable: true,
            get() { return val; },
            set(v) {
                const old = val;
                val = v;
                if (v < old && gameState.phase === 'upgrade' && typeof p1 !== 'undefined') mtOnSpend(i === 0 ? p1 : p2, old - v);
            },
        });
    });
})();

Object.assign(Player.prototype, {
    // [setupForNewRound] Xe Tiền
    setupMoneyTank() {
        if (this.weapon !== 'money_tank') return;
        const lv = this.upgradeLevel || 0;
        if (lv > 0) {
            this.maxHp += 1 * lv;
            this.damage += 1.125 * lv;
            this.maxAmmo += 1 * lv;
            this.speed += 0.5;
        }
        if (lv >= 3) this.maxHp += 2;
        if (lv >= 4) this.damage += 0.5;
        if (lv >= 6) { this.maxHp += 3; this.maxAmmo += 2; this.damage += 1; }
        const b = this.mtSpend && this.mtSpend.bonus;
        if (b) { this.maxHp += b.hp; this.damage += b.dmg; this.maxAmmo += b.ammo; this.speed += b.speed; }
    }
});

// --- Xe tiền tấn công: lao thẳng từ làn của chủ về phía địch, nổ khi chạm tường ---
class AttackTruck {
    constructor(owner, x, full) {
        this.owner = owner;
        this.w = 24; this.h = 38;
        this.x = Math.max(0, Math.min(canvas.width - this.w, x - this.w / 2));
        this.dirY = owner.id === 1 ? -1 : 1;
        this.y = owner.id === 1 ? owner.y - this.h - 4 : owner.y + owner.h + 4;
        this.speed = 2.5; this.maxSpeed = full ? 11 : 9;
        this.dmg = full ? 2 : 1.5;          // sát thương khi tông trúng trên đường đi
        this.boomDmg = full ? 2.5 : 1.5;    // sát thương vụ nổ ở tường (bán kính 45)
        this.hitEnemy = false;
        this.hitIds = [];
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.speed = Math.min(this.maxSpeed, this.speed + 0.35);
        this.y += this.dirY * this.speed;
        const enemy = this.owner === p1 ? p2 : p1;
        const enemyImmuneTruck = !!(enemy && typeof enemy.hasGear === 'function' && (enemy.hasGear('gear_ally_crate_s') || enemy.hasGear('gear_ally_crate_p')));
        if (!this.hitEnemy && !enemyImmuneTruck && enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            this.hitEnemy = true;
            enemy.takeDamage(this.dmg, this.owner);
            spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ffd700', 10);
        }
        if (!this.gmTw && typeof gmTwinAlso === 'function' && gmTwinAlso(enemy, t => rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h), this.dmg, this.owner)) this.gmTw = true; // Gemini: Bản Sao AI
        // Tông xe tiền trung lập / thùng tiếp tế trên đường -> phá như bắn trúng (vẫn nhận tiền)
        moneyTrucks.forEach(t => {
            if (!t.active || this.hitIds.includes(t) || !rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) return;
            this.hitIds.push(t);
            t.hp -= 4;
            if (t.hp <= 0) {
                t.active = false;
                if (this.owner.id === 1) gameState.p1Coins += 100; else gameState.p2Coins += 100;
                addFloatingText(t.x + t.w / 2, t.y - 8, '+100$', '#ffd700', 13);
                explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, this.owner));
                if (typeof onGearTruckDestroyed === 'function') onGearTruckDestroyed(t, this.owner);
            }
        });
        crates.forEach(c => {
            if (!c.active || !rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) return;
            c.active = false;
            crateOnBreak(c, this.owner);
            grantCrateLoot(c, this.owner);
        });
        const atWall = this.dirY < 0 ? this.y <= 0 : this.y + this.h >= canvas.height;
        if (atWall) this.explode();
    }
    explode() {
        this.active = false;
        const cx = this.x + this.w / 2, cy = this.dirY < 0 ? this.y + 10 : this.y + this.h - 10;
        explosions.push(new Explosion(cx, cy, 45, 'rgba(255,215,0,', 0, this.owner));
        const enemy = this.owner === p1 ? p2 : p1;
        const enemyImmuneTruck = !!(enemy && typeof enemy.hasGear === 'function' && (enemy.hasGear('gear_ally_crate_s') || enemy.hasGear('gear_ally_crate_p')));
        if (!enemyImmuneTruck && enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - cx, enemy.y + enemy.h / 2 - cy) < 45 + enemy.w / 2) enemy.takeDamage(this.boomDmg, this.owner);
        if (typeof gmTwinAlso === 'function') gmTwinAlso(enemy, t => Math.hypot(t.x + t.w / 2 - cx, t.y + t.h / 2 - cy) < 45 + t.w / 2, this.boomDmg, this.owner);
        triggerScreenShake(4, 8);
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 3, this.dirY < 0 ? this.y + 3 : this.y + this.h - 13, this.w - 6, 10);
        ctx.fillStyle = '#3b2a00'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
        ctx.fillText('$', this.x + this.w / 2, this.y + this.h / 2 + 4);
        // vệt lửa phía sau
        ctx.fillStyle = 'rgba(255,140,0,0.6)';
        const ty = this.dirY < 0 ? this.y + this.h : this.y - 8;
        ctx.fillRect(this.x + 6, ty, this.w - 12, 8);
        ctx.restore();
    }
}

// --- Cảnh báo đường chạy của xe tấn công: cột dọc nhấp nháy 2s rồi mới phóng xe ---
const MT_WARN_TICKS = 120;
class MtTruckWarn {
    constructor(owner, x, full) {
        this.team = owner.id; this.full = !!full;
        this.w = 24;
        this.x = Math.max(0, Math.min(canvas.width - this.w, x - this.w / 2));
        this.t = MT_WARN_TICKS; this.max = MT_WARN_TICKS;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.t > 0) return;
        this.active = false;
        const owner = this.team === 1 ? p1 : p2;
        if (!owner || owner.hp <= 0) return;
        bodyEffects.push(new AttackTruck(owner, this.x + this.w / 2, this.full));
        if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted) soundSystem.playDash();
    }
    draw() {
        if (!this.active) return;
        const owner = this.team === 1 ? p1 : p2;
        if (!owner) return;
        const k = 1 - this.t / this.max; // 0 -> 1
        const up = this.team === 1;
        const y0 = up ? 0 : owner.y + owner.h, y1 = up ? owner.y : canvas.height;
        const blink = Math.floor(this.t / 8) % 2 === 0;
        ctx.save();
        // dải cột mờ dần đậm lên
        ctx.fillStyle = `rgba(255, ${blink ? 60 : 200}, 0, ${0.07 + 0.16 * k})`;
        ctx.fillRect(this.x, y0, this.w, y1 - y0);
        // 2 mép nét đứt chạy theo hướng xe
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + 0.45 * k})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = (up ? 1 : -1) * (this.max - this.t) * 0.8;
        ctx.beginPath();
        ctx.moveTo(this.x, y0); ctx.lineTo(this.x, y1);
        ctx.moveTo(this.x + this.w, y0); ctx.lineTo(this.x + this.w, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        // mũi tên chỉ hướng lao + đếm ngược
        const cx = this.x + this.w / 2, dir = up ? -1 : 1;
        ctx.fillStyle = blink ? '#ff3b3b' : '#ffd700';
        for (let i = 0; i < 3; i++) {
            const ay = (up ? y1 - 40 : y0 + 40) + dir * (i * 70 + ((this.max - this.t) * 1.5) % 70);
            if (ay < y0 || ay > y1) continue;
            ctx.beginPath();
            ctx.moveTo(cx, ay + dir * 7); ctx.lineTo(cx - 7, ay - dir * 3); ctx.lineTo(cx + 7, ay - dir * 3);
            ctx.closePath(); ctx.fill();
        }
        ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
        const ty = up ? 18 : canvas.height - 10;
        ctx.fillText('⚠ ' + (this.t / 60).toFixed(1) + 's', cx, ty);
        ctx.restore();
    }
}

// Phần thưởng cơ bản khi phá thùng bằng đường khác (xe tấn công, axit...)
function grantCrateLoot(c, p) {
    if (!c || !p) return;
    if (c.isMimic) triggerMimicExplosion(c, p);
    if (c.type === 'hp') p.hp = Math.min(p.hp + 1, p.maxHp);
    if (c.type === 'ammo') p.onCollectAmmoCrate(c);
    if (c.type === 'shield') p.shield++;
    if (c.type === 'dmg') p.dmgBuff++;
    if (c.type === 'coin') { const m = p.weapon === 'money_tank' ? 70 : 35; if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m; }
    if (c.type === 'gear') { p.ammo = Math.min(p.maxAmmo, p.ammo + 1); if (p.weapon === 'genius') p.gears = (p.gears || 0) + 1; if (p.weapon === 'inventor') p.components = (p.components || 0) + 5; }
    if (p.weapon === 'evolution') p.onEvolutionCrateEat(c.type);
    explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 30, 'rgba(255,255,255,', 0, p));
}

CharHooks.register('money_tank', {
    setup() {
        const lv = this.upgradeLevel || 0;
        const b = this.mtSpend && this.mtSpend.bonus;
        if (lv >= 6) this.shield = Math.max(this.shield || 0, 2);
        if (b && b.shield) this.shield = (this.shield || 0) + b.shield;
        this.mtAtkTimer = 120;
        this.mtQueue = 0; this.mtQueueT = 0;
        return false;
    },
    update() {
        if (!this.hasUpgrade('evo_money_atk')) return;
        const full = mtIsFull(this);
        // Hàng chờ: các xe được báo trước LẦN LƯỢT (cách nhau 1s), mỗi xe 1 cột dọc ngẫu nhiên quanh địch
        if (this.mtQueue > 0 && --this.mtQueueT <= 0) {
            this.mtQueue--;
            this.mtQueueT = 60;
            const enemy = this === p1 ? p2 : p1;
            const ex = enemy ? enemy.x + enemy.w / 2 : canvas.width / 2;
            const x = Math.max(12, Math.min(canvas.width - 12, ex + (Math.random() * 2 - 1) * 80));
            bodyEffects.push(new MtTruckWarn(this, x, full));
        }
        if (--this.mtAtkTimer > 0) return;
        this.mtAtkTimer = full ? 300 : 480; // Full Evo: 5s / lần, thường: 8s / lần
        this.mtQueue = full ? 3 : 1; this.mtQueueT = 0;
        const cx = this.x + this.w / 2;
        addFloatingText(cx, this.id === 1 ? this.y - 16 : this.y + this.h + 16, 'TIỀN TẤN CÔNG! 💰', '#ffd700', 13);
    },
    shopButtons(container) {
        const d = this.mtSpend;
        if (!this.hasUpgrade('evo_money_2')) return;
        const card = document.createElement('div');
        card.className = 'card sold';
        card.style.border = '2px solid gold';
        const spent = d ? d.spent : 0;
        const next = Math.min(MT_MILESTONE_MAX, (Math.floor(spent / MT_MILESTONE_STEP) + 1) * MT_MILESTONE_STEP);
        card.innerHTML = `<h4 style="color:#ffd700">💰 SỨC MẠNH ĐỒNG TIỀN</h4><p>Đã tiêu ${spent}/${MT_MILESTONE_MAX}$ · ${d ? d.got : 0} mốc` +
            `${spent < MT_MILESTONE_MAX ? `<br>Mốc kế: ${next}$` : '<br>ĐÃ ĐỦ MỐC'}${d && d.lastTxt ? `<br><span style="color:#facc15">${d.lastTxt}</span>` : ''}</p>` +
            `<p style="color:#4ade80">Giảm giá ${Math.round((1 - mtPriceMult(this)) * 100)}%</p>`;
        container.appendChild(card);
    },
});
