// ==========================================
// Bình Phun (sprayer) — Logic: phun hình nón, lớp phủ Lửa / Axit / Băng
// ==========================================

const SP_CHEMS = ['fire', 'acid', 'ice'];
const SP_CHEM_NAME = { fire: 'NÓNG 🔥', acid: 'AXIT 🧪', ice: 'LẠNH ❄️' };
const SP_CHEM_COLOR = { fire: '#ff6a1a', acid: '#7bf85c', ice: '#5ee7ff' };
// Tầm phun theo trục dọc: tới hết làn đối thủ. Nón mở từ 8px ở nòng tới ~48px ở cuối.
function spMaxRange() { return canvas.height - 30; }
const SP_HALF_NEAR = 8, SP_HALF_FAR = 48;
// [ĐỔI] Luồng phun bay ra từ từ (spFront tăng dần); chỉ khi chạm tầm tối đa (hoặc vật cản) mới mở rộng
// sang hai bên (spWiden 0 -> 1). Khi chưa mở, luồng chỉ là tia hẹp.
const SP_FRONT_SPEED = 7;      // px mỗi tick
const SP_WIDEN_TICKS = 24;     // thời gian mở rộng sau khi chạm tầm tối đa
function spHalfWidth(fwd, p) {
    const w = p && typeof p.spWiden === 'number' ? p.spWiden : 1;
    return SP_HALF_NEAR + (SP_HALF_FAR - SP_HALF_NEAR) * Math.max(0, Math.min(1, fwd / spMaxRange())) * w;
}
const SP_COAT_RATE = 55;       // % lớp phủ mỗi giây khi đứng trong luồng

function spIsFullEvo(p) { return p.hasUpgrade('evo_spray_1') && p.hasUpgrade('evo_spray_2'); }

function spNozzle(p) {
    const dirY = p.id === 1 ? -1 : 1;
    return { x: p.x + p.w / 2, y: dirY < 0 ? p.y : p.y + p.h, dirY };
}

// Đoạn thẳng (x1,y1)-(x2,y2) có cắt hình chữ nhật không (Liang–Barsky)
function segHitsRect(x1, y1, x2, y2, r) {
    let t0 = 0, t1 = 1;
    const dx = x2 - x1, dy = y2 - y1;
    const ps = [-dx, dx, -dy, dy];
    const qs = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
    for (let i = 0; i < 4; i++) {
        if (ps[i] === 0) { if (qs[i] < 0) return false; continue; }
        const t = qs[i] / ps[i];
        if (ps[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
        else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return true;
}

// Vật cản chặn luồng phun (của phía đối thủ hoặc trung lập)
function spBlockers(p) {
    const list = [];
    sniperWalls.forEach(w => { if (w.active) list.push(w); });
    if (movingObstacle && movingObstacle.active) list.push(movingObstacle);
    bastions.forEach(b => { if (b.active) list.push(b); });
    moneyTrucks.forEach(t => { if (t.active) list.push(t); });
    const enemy = p === p1 ? p2 : p1;
    if (enemy && enemy.creatorShield && enemy.creatorShield.active) list.push(enemy.creatorShield);
    bodyEffects.forEach(s => { if (s.isStone && s.active && s.owner !== p) list.push(s); });
    return list;
}

// Mục tiêu có nằm trong hình nón không (theo tâm)
function spInCone(p, n, rect, range) {
    const tx = rect.x + rect.w / 2, ty = rect.y + rect.h / 2;
    const fwd = (ty - n.y) * n.dirY;
    if (fwd < -rect.h / 2 || fwd > range + rect.h / 2) return false;
    const halfW = spHalfWidth(fwd, p) + rect.w / 2;
    return Math.abs(tx - n.x) <= halfW;
}

// Tầm phun thực tế dọc trục giữa (bị cắt bởi vật cản gần nhất)
function spEffectiveRange(p, n, blockers) {
    let r = spMaxRange();
    for (const b of blockers) {
        if (n.x < b.x - 4 || n.x > b.x + b.w + 4) continue;
        const near = n.dirY < 0 ? n.y - (b.y + b.h) : b.y - n.y;
        if (near >= -2 && near < r) r = Math.max(0, near);
    }
    return r;
}

function spCoatOf(v) {
    if (!v.spCoat) { v.spCoat = { fire: 0, acid: 0, ice: 0 }; v.spIdle = { fire: 999, acid: 999, ice: 999 }; v.spAcc = { fire: 0, acid: 0, ice: 0 }; v.spSilenced = false; }
    return v.spCoat;
}

// Áp hiệu ứng lên vật cản bị phun
function spAffectStructure(p, obj, chem, full) {
    if (chem === 'fire') {
        obj.spFire = (obj.spFire || 0) + SP_COAT_RATE / 60;
        if (obj.spFire >= 100) {
            obj.spFire = 0;
            if (typeof obj.hp === 'number' && !obj.isImmortal) obj.hp -= full ? 7 : 5;
            explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, full ? 60 : 45, 'orange', 0, p));
            if (typeof obj.hp === 'number' && obj.hp <= 0) obj.active = false;
        }
    } else if (chem === 'acid') {
        // Axit ăn mòn vật cản nhân tạo cực mạnh (x5)
        if (typeof obj.hp === 'number' && !obj.isImmortal) {
            obj.hp -= (full ? 2.5 : 1.25) / 60 * (obj.maxHp ? Math.max(1, obj.maxHp / 10) : 1);
            if (obj.hp <= 0) { obj.active = false; explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 35, '#7bf85c', 0, p)); }
        }
    } else if (chem === 'ice') {
        // Làm chậm vật cản di động / xe tiền đang hứng luồng phun
        if (typeof obj.vx === 'number') obj.x -= obj.vx * 0.6;
        else if (typeof obj.speed === 'number' && typeof obj.dir === 'number') obj.x -= obj.dir * obj.speed * 0.6;
    }
}

function spUpdateCoats(p, enemy, full) {
    const coat = spCoatOf(enemy);
    const hasEvo2 = p.hasUpgrade('evo_spray_2');
    for (const c of SP_CHEMS) {
        if (coat[c] <= 0) { coat[c] = 0; continue; }
        enemy.spIdle[c]++;
        const delay = c === 'fire' ? 8 : (hasEvo2 ? 150 : 60);
        if (enemy.spIdle[c] > delay) coat[c] = Math.max(0, coat[c] - (c === 'fire' ? 80 : 40) / 60);
        const k = coat[c] / 100;
        if (c === 'fire') {
            enemy.spAcc.fire += 0.25 / 60;
        } else if (c === 'acid') {
            enemy.spAcc.acid += enemy.maxHp * 0.0125 * (full ? 2 : 1) / 60;
            addStatusVuln(enemy, 0.3 * k);
            if (coat.acid >= 99) { enemy.silenceTimer = Math.max(enemy.silenceTimer || 0, 2); enemy.spSilenced = true; }
            else if (enemy.spSilenced) { enemy.spSilenced = false; if (full) enemy.silenceTimer = Math.max(enemy.silenceTimer || 0, 60); }
        } else if (c === 'ice') {
            enemy.spAcc.ice += 0.125 / 60;
            addStatusSlow(enemy, 1 - (full ? 0.7 : 0.6) * k);
        }
        if (enemy.spAcc[c] >= 0.125) {
            const dmg = enemy.spAcc[c]; enemy.spAcc[c] = 0;
            enemy.takeDamage(dmg, p, { isDot: true });
        }
    }
}

function spApplySpray(p) {
    const enemy = p === p1 ? p2 : p1;
    const n = spNozzle(p);
    const chem = p.spChem;
    const full = spIsFullEvo(p);
    const blockers = spBlockers(p);
    const reach = spEffectiveRange(p, n, blockers);
    p.spFront = Math.min(spMaxRange(), (p.spFront || 0) + SP_FRONT_SPEED);
    p.spRange = Math.min(reach, p.spFront);
    if (p.spFront >= reach) p.spWiden = Math.min(1, (p.spWiden || 0) + 1 / SP_WIDEN_TICKS);
    const front = p.spFront;

    // Vật cản trong luồng phun hứng hiệu ứng
    let firstBlocker = null, firstDist = 1e9;
    for (const b of blockers) {
        if (!spInCone(p, n, b, front)) continue;
        spAffectStructure(p, b, chem, full);
        const dist = Math.abs((b.y + b.h / 2) - n.y);
        if (dist < firstDist) { firstDist = dist; firstBlocker = b; }
    }
    // Ụ súng / ụ triệu hồi của đối thủ: axit làm tan chảy
    [...turrets, ...creatorTurrets].forEach(t => {
        if (t.active && t.owner !== p && spInCone(p, n, t, front)) spAffectStructure(p, t, chem, full);
    });

    // Đối thủ: trong nón và không bị vật cản che
    if (enemy && enemy.hp > 0 && spInCone(p, n, enemy, front)) {
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        const blocked = blockers.some(b => segHitsRect(n.x, n.y, ex, ey, b));
        if (!blocked) {
            const coat = spCoatOf(enemy);
            coat[chem] = Math.min(100, coat[chem] + SP_COAT_RATE / 60);
            enemy.spIdle[chem] = 0;
            if (coat[chem] >= 100) spTrigger(p, enemy, chem, full);
        }
    }

    // Evo 2: phun liên tục để lại vũng hiệu ứng (dưới chân vật cản nếu bị chặn)
    if (p.hasUpgrade('evo_spray_2') && ++p.spZoneTick >= 60) {
        p.spZoneTick = 0;
        let zx = n.x, zy = n.y + n.dirY * Math.max(30, p.spRange * 0.85);
        if (firstBlocker && p.spRange < spMaxRange()) { zx = firstBlocker.x + firstBlocker.w / 2; zy = n.dirY < 0 ? firstBlocker.y + firstBlocker.h + 14 : firstBlocker.y - 14; }
        bodyEffects.push(new BodyZone(zx, zy, 34, chem, p, 180, full ? 1.3 : 1));
    }
}

// Lớp phủ đạt 100%
function spTrigger(p, enemy, chem, full) {
    const coat = spCoatOf(enemy);
    const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
    if (chem === 'fire') {
        coat.fire = 0;
        enemy.takeDamage(full ? 7 : 5, p);
        explosions.push(new Explosion(ex, ey, full ? 90 : 55, 'rgba(255, 100, 0,', 0, p));
        triggerScreenShake(6, 10);
        addFloatingText(ex, enemy.y - 16, 'BỘC PHÁT! 🔥', '#ff6a1a', 15);
    } else if (chem === 'acid') {
        if (!enemy.spSilenced) addFloatingText(ex, enemy.y - 16, 'CÂM LẶNG! 🧪', '#7bf85c', 14);
    } else if (chem === 'ice') {
        enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, full ? 150 : 120);
        coat.ice = 25;
        explosions.push(new Explosion(ex, ey, 50, '#5ee7ff', 0, p));
        addFloatingText(ex, enemy.y - 16, 'ĐÓNG BĂNG! ❄️', '#5ee7ff', 15);
    }
}

CharHooks.register('sprayer', {
    setup() {
        this.maxAmmo = 0; this.ammo = 0;
        this.spEnergy = 100; this.spOn = false; this.spChem = this.spChem || 'fire';
        this.spHold = 0; this.spPrevS = false; this.spRegenDelay = 0; this.spZoneTick = 0;
        this.spRange = 0; this.spFront = 0; this.spWiden = 0; this.spLock = false;
    },

    update() {
        const evo1 = this.hasUpgrade('evo_spray_1');
        if (this.silenceTimer > 0 || this.freezeTimer > 0) this.spOn = false;
        if (this.spOn) {
            this.spEnergy -= (evo1 ? 15.4 : 22) / 60;
            addStatusVuln(this, 0.2); // Suy Yếu khi đang phun
            if (this.spEnergy <= 0) { this.spEnergy = 0; this.spOn = false; this.spLock = true; addFloatingText(this.x + this.w / 2, this.y - 14, 'HẾT NĂNG LƯỢNG!', '#94a3b8', 12); }
            this.spRegenDelay = 24;
            spApplySpray(this);
        } else {
            this.spZoneTick = 0;
            this.spFront = 0; this.spWiden = 0;
            if (this.spRegenDelay > 0) this.spRegenDelay--;
            else this.spEnergy = Math.min(100, this.spEnergy + (evo1 ? 27 : 18) / 60);
            if (this.spLock && this.spEnergy >= 30) this.spLock = false;
        }
        const enemy = this === p1 ? p2 : p1;
        if (enemy && enemy.spCoat) spUpdateCoats(this, enemy, spIsFullEvo(this));
    },

    speed(s) { return this.spOn ? s * 0.7 : s; },

    shoot(inp) {
        if (inp.s) {
            this.spHold++;
            if (this.spHold === 30) {
                this.spChem = SP_CHEMS[(SP_CHEMS.indexOf(this.spChem) + 1) % SP_CHEMS.length];
                addFloatingText(this.x + this.w / 2, this.y - 16, `CHẤT: ${SP_CHEM_NAME[this.spChem]}`, SP_CHEM_COLOR[this.spChem], 13);
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            }
        } else {
            if (this.spHold > 0 && this.spHold < 30) {
                if (this.spOn) this.spOn = false;
                else if (!this.spLock && this.spEnergy > 5) this.spOn = true;
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            }
            this.spHold = 0;
        }
        return true;
    },
});
