// ==========================================
// Bình Phun (sprayer) — Logic: phun hình nón, lớp phủ Lửa / Axit / Băng
// ==========================================

const SP_CHEMS = ['fire', 'acid', 'ice'];
const SP_CHEM_NAME = { fire: 'NÓNG 🔥', acid: 'AXIT 🧪', ice: 'LẠNH ❄️' };
const SP_CHEM_COLOR = { fire: '#ff6a1a', acid: '#7bf85c', ice: '#5ee7ff' };
// Tầm phun theo trục dọc: tới hết làn đối thủ. Nón mở từ 8px ở nòng tới ~48px ở cuối.
function spMaxRange() { return canvas.height - 30; }
const SP_HALF_NEAR = 8, SP_HALF_FAR = 48, SP_HALF_FAR_FULL = 72;
const SP_ACID_OBJ_DPS = 2;      // Axit: 2 sát thương/giây lên mọi đối tượng không phải body
// [ĐỔI] Luồng phun bay ra từ từ (spFront tăng dần); chỉ khi chạm tầm tối đa (hoặc vật cản) mới mở rộng
// sang hai bên (spWiden 0 -> 1). Khi chưa mở, luồng chỉ là tia hẹp.
const SP_FRONT_SPEED = 7;      // px mỗi tick
const SP_WIDEN_TICKS = 24;     // thời gian mở rộng sau khi chạm tầm tối đa
function spHalfWidth(fwd, p) {
    const w = p && typeof p.spWiden === 'number' ? p.spWiden : 1;
    const far = (p && spIsFullEvo(p)) ? SP_HALF_FAR_FULL : SP_HALF_FAR; // Full Evo: góc phun rộng hơn
    return SP_HALF_NEAR + (far - SP_HALF_NEAR) * Math.max(0, Math.min(1, fwd / spMaxRange())) * w;
}
const SP_COAT_RATE = 55;       // % lớp phủ mỗi giây khi đứng trong luồng
const SP_SWITCH_HOLD = 22;     // [BUFF] giữ 0.37s đổi chất (cũ 0.5s)
// [MỚI] NGẤM SÂU: mỗi lần lớp phủ bùng (Nổ / Câm Lặng / Đóng Băng) -> địch +1 tầng Ngấm (tối đa 3, 8s, làm mới khi cộng)
//   mỗi tầng: +15% tốc phủ & +10% sát thương mọi lớp phủ / Nổ. Đủ 3 tầng: lớp phủ không còn phai.
const SP_SOAK_MAX = 3, SP_SOAK_DUR = 480;
function spSoak(v) { return (v && v.spSoakT > 0) ? (v.spSoak || 0) : 0; }
function spAddSoak(p, v) {
    v.spSoak = Math.min(SP_SOAK_MAX, spSoak(v) + 1); v.spSoakT = SP_SOAK_DUR;
    addFloatingText(v.x + v.w / 2, v.y + (v.id === 1 ? -30 : v.h + 30), 'NGẤM SÂU x' + v.spSoak, '#e879f9', 12);
}

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
        // Axit lên vật thể xử lý trong spAcidObjects (x10 sát thương + 50% Max HP)
    } else if (chem === 'ice') {
        // Làm chậm vật cản di động / xe tiền đang hứng luồng phun
        if (typeof obj.vx === 'number') obj.x -= obj.vx * 0.6;
        else if (typeof obj.speed === 'number' && typeof obj.dir === 'number') obj.x -= obj.dir * obj.speed * 0.6;
    }
}

function spUpdateCoats(p, enemy, full) {
    const coat = spCoatOf(enemy);
    if (enemy.spSoakT > 0 && --enemy.spSoakT <= 0) enemy.spSoak = 0;
    const hasEvo2 = p.hasUpgrade('evo_spray_2');
    for (const c of SP_CHEMS) {
        if (coat[c] <= 0) { coat[c] = 0; continue; }
        enemy.spIdle[c]++;
        const delay = c === 'fire' ? 8 : (hasEvo2 ? 150 : 60);
        if (enemy.spIdle[c] > delay && spSoak(enemy) < SP_SOAK_MAX) coat[c] = Math.max(0, coat[c] - (c === 'fire' ? 80 : 40) / 60);
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
            const dmg = enemy.spAcc[c] * (1 + 0.1 * spSoak(enemy)); enemy.spAcc[c] = 0;
            enemy.takeDamage(dmg, p, { isDot: true });
        }
    }
}

function spApplySpray(p) {
    const enemy = p === p1 ? p2 : p1;
    const n = spNozzle(p);
    const chem = p.spChem;
    const full = spIsFullEvo(p);
    // Full Evo: phun cùng lúc cả 3 chất
    const chems = full ? SP_CHEMS : [chem];
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
        chems.forEach(c => spAffectStructure(p, b, c, full));
        const dist = Math.abs((b.y + b.h / 2) - n.y);
        if (dist < firstDist) { firstDist = dist; firstBlocker = b; }
    }
    // Ụ súng / ụ triệu hồi của đối thủ: axit làm tan chảy
    [...turrets, ...creatorTurrets].forEach(t => {
        if (t.active && t.owner !== p && spInCone(p, n, t, front)) chems.forEach(c => spAffectStructure(p, t, c, full));
    });
    // Axit ăn mòn mọi đối tượng không phải body: thùng tiếp tế, triệu hồi & công trình của đối thủ
    if (chems.includes('acid')) spAcidObjects(p, n, front, blockers);

    // Đối thủ: trong nón và không bị vật cản che
    if (enemy && enemy.hp > 0 && spInCone(p, n, enemy, front)) {
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        const blocked = blockers.some(b => segHitsRect(n.x, n.y, ex, ey, b));
        if (!blocked) {
            const coat = spCoatOf(enemy);
            for (const c of chems) {
                coat[c] = Math.min(100, coat[c] + SP_COAT_RATE * (1 + 0.15 * spSoak(enemy)) / 60);
                enemy.spIdle[c] = 0;
                if (coat[c] >= 100) spTrigger(p, enemy, c, full);
            }
        }
    }

    // Evo 2: phun liên tục để lại vũng hiệu ứng (dưới chân vật cản nếu bị chặn)
    if (p.hasUpgrade('evo_spray_2') && ++p.spZoneTick >= 60) {
        p.spZoneTick = 0;
        let zx = n.x, zy = n.y + n.dirY * Math.max(30, p.spRange * 0.85);
        if (firstBlocker && p.spRange < spMaxRange()) { zx = firstBlocker.x + firstBlocker.w / 2; zy = n.dirY < 0 ? firstBlocker.y + firstBlocker.h + 14 : firstBlocker.y - 14; }
        chems.forEach((c, i) => bodyEffects.push(new BodyZone(zx + (i - (chems.length - 1) / 2) * 22, zy, full ? 26 : 34, c, p, 180, full ? 1.3 : 1)));
    }
}

// Axit: mọi đòn Axit lên vật thể = x10 sát thương + 50% Max HP. Luồng phun: SP_ACID_OBJ_DPS (=10 x 0.2)/giây
// + mỗi 1s hứng luồng (lần đầu sau 0.5s) mất thêm 50% Max HP. Xe (xe tiền / xe tấn công) bị đốt nhanh gấp 3.
function spAcidObjects(p, n, front, blockers) {
    const dmg = SP_ACID_OBJ_DPS / 60;
    const visible = (o) => {
        const ox = o.x + (o.w || 0) / 2, oy = o.y + (o.h || 0) / 2;
        return !blockers.some(b => b !== o && segHitsRect(n.x, n.y, ox, oy, b));
    };
    const hit = (o) => {
        if (!o || o.active === false || o === p || o === p1 || o === p2 || (o.owner && o.owner === p)) return;
        if (typeof o.x !== 'number' || !o.w) return;
        if (!spInCone(p, n, o, front)) return;
        if (o.isImmortal || !visible(o)) return;
        if (o instanceof Crate) {
            o.spAcid = (o.spAcid || 0) + dmg * 10;
            if (o.spAcid >= 0.5) { o.active = false; crateOnBreak(o, p); grantCrateLoot(o, p); }
            return;
        }
        o.spAcidT = (o.spAcidT || 0) + 1;
        let d = dmg + (o.spAcidT % 60 === 30 ? acidObjMaxHp(o) * 0.5 : 0);
        if (acidIsTruck(o)) d *= 3;
        acidDamageObj(o, d, p);
    };
    crates.forEach(hit);
    moneyTrucks.forEach(hit);
    [turrets, creatorTurrets, necroMinions, creatorDrones, creatorRobots, ghostDecoys, confinementCages, bastions, sniperWalls].forEach(list => (list || []).forEach(hit));
    bodyEffects.forEach(e => { if (e.isStone || e instanceof AttackTruck || e instanceof ThrownMecha) hit(e); });
    const enemy = p === p1 ? p2 : p1;
    if (enemy && Array.isArray(enemy.drones)) enemy.drones.forEach(hit);
}

// Lớp phủ đạt 100%
function spTrigger(p, enemy, chem, full) {
    const coat = spCoatOf(enemy);
    const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
    if (chem === 'fire') {
        coat.fire = 0;
        enemy.takeDamage((full ? 7 : 5) * (1 + 0.1 * spSoak(enemy)), p);
        spAddSoak(p, enemy);
        explosions.push(new Explosion(ex, ey, full ? 90 : 55, 'rgba(255, 100, 0,', 0, p));
        triggerScreenShake(6, 10);
        addFloatingText(ex, enemy.y - 16, 'BỘC PHÁT! 🔥', '#ff6a1a', 15);
    } else if (chem === 'acid') {
        if (!enemy.spSilenced) { addFloatingText(ex, enemy.y - 16, 'CÂM LẶNG! 🧪', '#7bf85c', 14); spAddSoak(p, enemy); }
    } else if (chem === 'ice') {
        enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, full ? 150 : 120);
        coat.ice = 25;
        spAddSoak(p, enemy);
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
        const en = this === p1 ? p2 : p1; if (en) { en.spSoak = 0; en.spSoakT = 0; }
    },

    update() {
        const evo1 = this.hasUpgrade('evo_spray_1');
        if (this.silenceTimer > 0 || this.freezeTimer > 0) this.spOn = false;
        if (this.spOn) {
            this.spEnergy -= (spIsFullEvo(this) ? 9 : (evo1 ? 14 : 19)) / 60; // Full Evo: phun lâu hơn
            addStatusVuln(this, 0.12); // Suy Yếu khi đang phun
            if (this.spEnergy <= 0) { this.spEnergy = 0; this.spOn = false; this.spLock = true; addFloatingText(this.x + this.w / 2, this.y - 14, 'HẾT NĂNG LƯỢNG!', '#94a3b8', 12); }
            this.spRegenDelay = 24;
            spApplySpray(this);
        } else {
            this.spZoneTick = 0;
            this.spFront = 0; this.spWiden = 0;
            if (this.spRegenDelay > 0) this.spRegenDelay--;
            else this.spEnergy = Math.min(100, this.spEnergy + (evo1 ? 27 : 18) / 60);
            if (this.spLock && this.spEnergy >= 20) { this.spLock = false; addFloatingText(this.x + this.w / 2, this.y - 14, 'SẴN SÀNG!', SP_CHEM_COLOR[this.spChem], 11); }
        }
        const enemy = this === p1 ? p2 : p1;
        if (enemy && enemy.spCoat) spUpdateCoats(this, enemy, spIsFullEvo(this));
    },

    speed(s) { return this.spOn ? s * 0.82 : s; },

    shoot(inp) {
        if (inp.s) {
            this.spHold++;
            if (this.spHold === SP_SWITCH_HOLD) {
                this.spChem = SP_CHEMS[(SP_CHEMS.indexOf(this.spChem) + 1) % SP_CHEMS.length];
                addFloatingText(this.x + this.w / 2, this.y - 16, `CHẤT: ${SP_CHEM_NAME[this.spChem]}`, SP_CHEM_COLOR[this.spChem], 13);
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            }
        } else {
            if (this.spHold > 0 && this.spHold < SP_SWITCH_HOLD) {
                if (this.spOn) this.spOn = false;
                else if (!this.spLock && this.spEnergy > 5) this.spOn = true;
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            }
            this.spHold = 0;
        }
        return true;
    },
});

// Bot: chất muốn dùng — địch đang Đóng Băng / đã có Băng dày -> Lửa để Nổ; địch đang chạy thoát -> Băng
function spBotWantChem(p, e) {
    if (!e || spIsFullEvo(p)) return p.spChem;
    const c = e.spCoat || { fire: 0, acid: 0, ice: 0 };
    if ((e.freezeTimer || 0) > 30 || c.fire > 40) return 'fire';
    if (c.ice < 70 && c.fire < 10 && (e.hp > e.maxHp * 0.5)) return 'ice';
    return 'fire';
}
