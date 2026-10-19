// ==========================================
// Axit Hóa (acid) — Vật triệu hồi / thực thể riêng
// ==========================================

// ------------------------------------------
// Axit ăn mòn vật thể (không phải body): mọi đạn/vùng Axit gây x10 sát thương + 50% Max HP
// lên vật cản, công trình, xe tiền/phương tiện và vật triệu hồi.
// acidObjMaxHp(o): Max HP của vật thể (vật không có maxHp -> ghi nhớ HP lúc trúng axit lần đầu).
// acidObjDmg(o, base): sát thương 1 đòn axit (base = sát thương gốc lên người chơi).
// ------------------------------------------
function acidObjMaxHp(o) {
    if (!o) return 0;
    if (typeof o.maxHp === 'number' && o.maxHp > 0) return o.maxHp;
    if (typeof o.getMaxHp === 'function') return o.getMaxHp();
    if (typeof o.acidMaxHp !== 'number') o.acidMaxHp = typeof o.hp === 'number' ? o.hp : 1;
    return o.acidMaxHp;
}
function acidObjDmg(o, base) { return (base || 0) * 10 + acidObjMaxHp(o) * 0.5; }
function acidIsTruck(o) { return (typeof MoneyTruck !== 'undefined' && o instanceof MoneyTruck) || (typeof AttackTruck !== 'undefined' && o instanceof AttackTruck); }

// Gây sát thương axit lên vật thể bất kỳ (tự xử lý takeDamage / takeHit / hp, phá thùng, thưởng xe tiền)
function acidDamageObj(o, dmg, attacker) {
    if (!o || o.active === false || o.isImmortal || dmg <= 0) return;
    if (typeof Crate !== 'undefined' && o instanceof Crate) {
        o.active = false; crateOnBreak(o, attacker); grantCrateLoot(o, attacker); return;
    }
    if (typeof o.takeDamage === 'function') { o.takeDamage(dmg, attacker); return; }
    if (typeof o.takeHit === 'function') { o.takeHit(dmg, attacker); return; }
    if (typeof o.hp !== 'number') return;
    o.hp -= dmg;
    if (o.hp <= 0) {
        o.active = false;
        if (typeof MoneyTruck !== 'undefined' && o instanceof MoneyTruck && attacker) {
            const m = attacker.weapon === 'money_tank' ? 60 : 30;
            if (attacker.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
            addFloatingText(o.x + o.w / 2, o.y - 8, `+${m}$`, '#ffd700', 12);
        }
        explosions.push(new Explosion(o.x + (o.w || 0) / 2, o.y + (o.h || 0) / 2, 35, '#b44dff', 0, attacker));
    }
}

// Danh sách vật thể axit ăn mòn được (không thuộc phe attacker)
function acidObjectsFor(attacker) {
    const out = [];
    const add = (o) => {
        if (!o || o.active === false || o === p1 || o === p2 || typeof o.x !== 'number' || !o.w) return;
        if (o.owner && (o.owner === attacker || (o.owner.owner && o.owner.owner === attacker))) return;
        out.push(o);
    };
    [typeof moneyTrucks !== 'undefined' ? moneyTrucks : [], typeof turrets !== 'undefined' ? turrets : [],
        typeof creatorTurrets !== 'undefined' ? creatorTurrets : [], typeof creatorDrones !== 'undefined' ? creatorDrones : [],
        typeof creatorRobots !== 'undefined' ? creatorRobots : [], typeof necroMinions !== 'undefined' ? necroMinions : [],
        typeof ghostDecoys !== 'undefined' ? ghostDecoys : [], typeof bastions !== 'undefined' ? bastions : [],
        typeof sniperWalls !== 'undefined' ? sniperWalls : [], typeof confinementCages !== 'undefined' ? confinementCages : []]
        .forEach(l => (l || []).forEach(add));
    if (typeof bodyEffects !== 'undefined') bodyEffects.forEach(e => {
        if (e.isStone || (typeof AttackTruck !== 'undefined' && e instanceof AttackTruck) || (typeof ThrownMecha !== 'undefined' && e instanceof ThrownMecha)) add(e);
    });
    const enemy = attacker === p1 ? p2 : p1;
    if (enemy && Array.isArray(enemy.drones)) enemy.drones.forEach(add);
    if (enemy && enemy.creatorShield && enemy.creatorShield.active) add(enemy.creatorShield);
    return out;
}

// Vùng axit ăn mòn vật thể: inside(o) -> bool; base = sát thương/tick lên người chơi.
// Mỗi tick x10 sát thương; mỗi khi pulse (1 lần/giây) thêm 50% Max HP. truckMult: hệ số riêng cho xe.
function acidZoneTickObjects(attacker, inside, base, pulse, truckMult = 1) {
    for (const o of acidObjectsFor(attacker)) {
        if (!inside(o)) continue;
        let d = base * 10 + (pulse ? acidObjMaxHp(o) * 0.5 : 0);
        if (acidIsTruck(o)) d *= truckMult;
        acidDamageObj(o, d, attacker);
    }
}

// --- Vùng Ăn Mòn (đạn cường hóa của Axit Hóa): màu tím, rút cả HP lẫn Max HP + làm chậm ---
class AcidZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.r = 50;
        this.active = true;
        this.lifeTime = 60;
        this.age = 0;
        if (owner.hasUpgrade('evo_acid_1')) {
            this.r = 100;
            this.lifeTime = 120;
        }
        zoneFit(this);
    }

    update() {
        if (!this.active) return;
        this.lifeTime--; this.age++;
        if (this.lifeTime <= 0) this.active = false;

        let isEvo1 = this.owner.hasUpgrade('evo_acid_1');
        let isEvo2 = this.owner.hasUpgrade('evo_acid_2');
        let erosionRate = isEvo1 ? 0.06 : 0.03;
        let burnRate = isEvo1 ? 0.1 : 0.05;
        // Ngưỡng kết liễu: Evo2 = 2, không có Evo2 = 0 (không kết liễu)
        let killThreshold = isEvo2 ? 2 : 0;

        // 1. Ăn mòn địch: rút HP & Max HP, làm chậm
        const enemy = (this.owner.id === 1) ? p2 : p1;
        let d = zoneDist(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
        if (d < this.r) {
            enemy.acidZoneSlow = 10;
            addStatusSlow(enemy, 0.6); // Vùng Ăn Mòn: chậm thêm
            if (enemy.weapon === 'the_strongest') {
                enemy.takeDamage(burnRate, this.owner, { isEnvironmental: true });
            } else if (enemy.shield > 0) {
                if (this.lifeTime % 10 === 0) enemy.shield--;
            } else {
                enemy.maxHp = Math.max(1, enemy.maxHp - erosionRate);
                if (enemy.hp > enemy.maxHp) enemy.hp = enemy.maxHp;
                if (enemy.hp > killThreshold) {
                    enemy.hp -= burnRate;
                    if (enemy.hp < 1 && killThreshold === 0) enemy.hp = 1;
                }
            }
        }

        // 2. Vật thể (công trình, xe tiền, triệu hồi, vật cản): x10 sát thương + 50% Max HP mỗi giây
        acidZoneTickObjects(this.owner,
            (o) => zoneDist(this.x - (o.x + o.w / 2), this.y - (o.y + o.h / 2)) < this.r + Math.max(o.w, o.h) / 2,
            burnRate, this.age % 60 === 1);
    }

    draw() {
        if (!this.active) return;
        const k = Math.min(1, this.lifeTime / 20);
        const t = this.age || 0;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.beginPath();
        zoneRectPath(this.x, this.y, this.r);
        ctx.fillStyle = 'rgba(150, 40, 255, 0.28)';
        ctx.fill();
        ctx.shadowBlur = 14; ctx.shadowColor = '#c026ff';
        ctx.strokeStyle = (Math.floor(t / 6) % 2 === 0) ? '#d946ef' : '#a855f7';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 5]); ctx.lineDashOffset = -t * 0.8;
        ctx.stroke(); ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        // Bọt ăn mòn sủi lên
        for (let i = 0; i < 7; i++) {
            const a = i * 2.39 + this.x * 0.01;
            const ph = (t * 0.03 + i * 0.37) % 1;
            const bx = this.x + Math.cos(a) * this.r * ZONE_AX * 0.75;
            const by = this.y + Math.sin(a * 1.7) * this.r * ZONE_AY * 0.6 - ph * 8;
            ctx.globalAlpha = k * (1 - ph);
            ctx.fillStyle = i % 2 ? '#f0abfc' : '#c084fc';
            ctx.beginPath(); ctx.arc(bx, by, 1.5 + ph * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = k * 0.9;
        ctx.fillStyle = '#f5d0fe'; ctx.font = 'bold 8px "Orbitron", Arial'; ctx.textAlign = 'center';
        drawWorldText(ctx, 'ĂN MÒN', this.x, this.y + 3);
        ctx.restore();
    }
}
