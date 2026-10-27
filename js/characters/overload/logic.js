// ==========================================
// Cuộn Quá Tải (overload) — Logic (tụ lực, thanh phụ, đạn sạc, EMP)
// ------------------------------------------
// Thanh CHÍNH tự tụ theo thời gian (2.4s). Đầy -> phát bắn kế tiếp là ĐẠN SẠC (nổ xung kích điện).
// Evo 1: +1 thanh PHỤ, chỉ nạp khi thanh chính đã đầy -> trữ được 2 đạn sạc, bắn liền 2 phát.
// Evo 2: đạn sạc nổ phát ra VÒNG EMP rộng hơn vụ nổ: Câm Lặng địch 2s + vô hiệu vật triệu hồi 2s.
// FULL EVO: +4 thanh phụ nữa (5 thanh phụ nạp ĐỒNG THỜI), vụ nổ & vòng EMP to hơn hẳn.
// Mọi trạng thái là số/mảng thường trên player -> đồng bộ online được.
// ==========================================

const OV_MAIN_TICKS = 144;   // 2.4s nạp đầy thanh chính
const OV_AUX_TICKS = 150;    // 2.5s nạp đầy 1 thanh phụ
const OV_CHAIN_GAP = 12;     // khoảng nghỉ giữa 2 đạn sạc bắn liền
const OV_SHOT_DELAY = 18;    // nghỉ 0.3s sau phát thường rồi mới tụ tiếp
const OV_EMP_TICKS = 120;    // EMP: câm lặng / vô hiệu 2s

function ovAuxCount(p) {
    if (!p.hasUpgrade('evo_over_1')) return 0;
    return p.hasUpgrade('evo_over_2') ? 5 : 1;
}
function ovIsFull(p) { return hasFullEvo(p, 'overload'); }
// Số đạn sạc đang trữ (thanh chính đầy + các thanh phụ đầy)
function ovStored(p) {
    if ((p.ovMain || 0) < 1) return 0;
    return 1 + (p.ovAux || []).filter(v => v >= 1).length;
}
function ovBlastR(p) { return ovIsFull(p) ? 85 : 42; } // [NERF] vụ nổ đạn sạc nhỏ hơn (nhiều khi chưa Full Evo)
function ovEmpR(p) { return ovIsFull(p) ? 175 : 115; }

// ---------- Vô hiệu hoá vật triệu hồi / thiết bị (EMP) ----------
// Bọc update()/shoot() của các class triệu hồi: empDisabled > 0 -> ĐỨNG IM (không di chuyển) & không bắn.
const OV_EMP_CLASSES = ['Turret', 'CreatorTurret', 'CreatorDrone', 'CreatorRobot', 'NecroMinion', 'GhostDecoy', 'ShadowTrap', 'InventorDrone', 'AttackTruck', 'ThrownMecha'];
function ovPatchEmpClasses() {
    for (const name of OV_EMP_CLASSES) {
        let K;
        try { K = eval(name); } catch (e) { K = null; } // class khai báo top-level không nằm trên window
        if (typeof K !== 'function' || !K.prototype || K.prototype.__ovEmp) continue;
        const proto = K.prototype;
        proto.__ovEmp = true;
        if (typeof proto.update === 'function') {
            const orig = proto.update;
            proto.update = function (...a) {
                if (this.empDisabled > 0) { this.empDisabled--; return; }
                return orig.apply(this, a);
            };
        }
        for (const m of ['shoot', 'fire']) {
            if (typeof proto[m] !== 'function') continue;
            const o2 = proto[m];
            proto[m] = function (...a) { if (this.empDisabled > 0) return; return o2.apply(this, a); };
        }
    }
}

function ovEnemySummons(enemy) {
    const out = [];
    const add = (o) => { if (o && o.active !== false && o.owner === enemy && typeof o.x === 'number') out.push(o); };
    const lists = [typeof turrets !== 'undefined' ? turrets : [], typeof creatorTurrets !== 'undefined' ? creatorTurrets : [],
        typeof creatorDrones !== 'undefined' ? creatorDrones : [], typeof creatorRobots !== 'undefined' ? creatorRobots : [],
        typeof necroMinions !== 'undefined' ? necroMinions : [], typeof ghostDecoys !== 'undefined' ? ghostDecoys : [],
        typeof shadowTraps !== 'undefined' ? shadowTraps : []];
    lists.forEach(l => (l || []).forEach(add));
    if (typeof bodyEffects !== 'undefined') bodyEffects.forEach(e => {
        if ((typeof AttackTruck !== 'undefined' && e instanceof AttackTruck) || (typeof ThrownMecha !== 'undefined' && e instanceof ThrownMecha)) add(e);
    });
    if (enemy.creatorDrone) add(enemy.creatorDrone);
    if (Array.isArray(enemy.drones)) enemy.drones.forEach(add);
    return out;
}

function ovMark(target, kind) {
    const ex = bodyEffects.find(e => e instanceof OvEmpMark && e.active && e.target === target);
    if (ex) { ex.t = 0; ex.life = OV_EMP_TICKS; return; }
    bodyEffects.push(new OvEmpMark(target, kind, OV_EMP_TICKS));
}

function ovEmp(owner, x, y) {
    ovPatchEmpClasses();
    const R = ovEmpR(owner);
    const enemy = owner.id === 1 ? p2 : p1;
    bodyEffects.push(new OvEmpRing(x, y, R));
    let hits = 0, ownerHit = false;
    if (enemy && enemy.hp > 0) {
        const nx = Math.max(enemy.x, Math.min(x, enemy.x + enemy.w)), ny = Math.max(enemy.y, Math.min(y, enemy.y + enemy.h));
        if (Math.hypot(x - nx, y - ny) <= R) {
            enemy.silenceTimer = Math.max(enemy.silenceTimer || 0, OV_EMP_TICKS);
            ovMark(enemy, 'player');
            addFloatingText(enemy.x + enemy.w / 2, enemy.id === 1 ? enemy.y - 16 : enemy.y + enemy.h + 22, 'EMP · CÂM LẶNG', '#c4b5fd', 12);
            hits++; ownerHit = true;
        }
    }
    if (enemy) {
        for (const o of ovEnemySummons(enemy)) {
            const cx = o.x + (o.w || 0) / 2, cy = o.y + (o.h || 0) / 2;
            // Chủ dính EMP -> toàn bộ vật triệu hồi của chủ cũng bị đóng băng (bất kể khoảng cách)
            if (!ownerHit && Math.hypot(cx - x, cy - y) > R + Math.max(o.w || 0, o.h || 0) / 2) continue;
            o.empDisabled = Math.max(o.empDisabled || 0, OV_EMP_TICKS);
            ovMark(o, 'obj');
            hits++;
        }
    }
    // Vật triệu hồi lưu trên player (vd. Oca của Raven) -> helper chung
    if (enemy && typeof disableSummonEMP === 'function' && disableSummonEMP(enemy, OV_EMP_TICKS, x, y, R, ownerHit)) hits++;
    if (hits) spawnSparkParticles(x, y, '#a5f3fc', 14);
}

// Vụ nổ của đạn sạc (gọi 1 lần / viên)
function ovBurst(b, owner) {
    if (!b || b.ovBurst || !owner) return;
    b.ovBurst = true;
    const x = b.x + b.w / 2;
    const y = Math.max(4, Math.min(canvas.height - 4, b.y + b.h / 2));
    const full = ovIsFull(owner);
    explosions.push(new Explosion(x, y, ovBlastR(owner), 'rgba(0, 240, 255,', full ? 1.25 : 0.5, owner)); // [NERF] 1 -> 0.5, Full 1.5 -> 1.25
    spawnSparkParticles(x, y, '#00f0ff', full ? 22 : 12);
    triggerScreenShake(full ? 7 : 4, 12);
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
    if (owner.hasUpgrade('evo_over_2')) ovEmp(owner, x, y);
}

BulletHooks.register('overload', {
    hit(b, attacker) { ovBurst(b, attacker); },
    edge(b, owner) { ovBurst(b, owner); },
    obstacle(b, owner) { ovBurst(b, owner); },
});

CharHooks.register('overload', {
    setup() {
        ovPatchEmpClasses();
        this.ovMain = 0;
        this.ovAux = new Array(ovAuxCount(this)).fill(0);
        this.ovCd = 0;
        this.ovPrevS = false;
        this.ovFlash = 0;
        this.chargeLevel = 0;
    },

    update() {
        const n = ovAuxCount(this);
        if (!Array.isArray(this.ovAux) || this.ovAux.length !== n) this.ovAux = new Array(n).fill(0);
        if (this.ovFlash > 0) this.ovFlash--;
        if (this.ovCd > 0) { this.ovCd--; }
        else if (this.ovMain < 1) {
            this.ovMain = Math.min(1, this.ovMain + 1 / OV_MAIN_TICKS);
            if (this.ovMain >= 1) this.ovFlash = 20;
        } else {
            // Thanh chính đầy -> các thanh phụ nạp ĐỒNG THỜI
            for (let i = 0; i < n; i++) {
                if (this.ovAux[i] < 1) {
                    this.ovAux[i] = Math.min(1, this.ovAux[i] + 1 / OV_AUX_TICKS);
                    if (this.ovAux[i] >= 1) this.ovFlash = 20;
                }
            }
        }
        this.chargeLevel = this.ovMain * 7;
    },

    shoot(inp, now) {
        const pressed = inp.s && !this.ovPrevS;
        this.ovPrevS = !!inp.s;
        if (!pressed || this.ammo <= 0 || this.ovCd > 0) return true;

        if (this.ovMain >= 1) {
            // ĐẠN SẠC
            this.fireBullet(1.2 + 7 * 1.3, true);
            const b = this.bullets[this.bullets.length - 1];
            if (b && b.isFullCharge) { b.hook = 'overload'; b.ovFull = ovIsFull(this); }
            const k = (this.ovAux || []).findIndex(v => v >= 1);
            if (k >= 0) {
                // Chuyển năng lượng thanh phụ sang thanh chính -> bắn liền phát nữa
                for (let i = k; i < this.ovAux.length - 1; i++) this.ovAux[i] = this.ovAux[i + 1];
                this.ovAux[this.ovAux.length - 1] = 0;
                this.ovMain = 1;
                this.ovCd = OV_CHAIN_GAP;
            } else {
                this.ovMain = 0;
                this.ovCd = OV_SHOT_DELAY;
            }
            triggerScreenShake(2, 6);
        } else {
            // Phát thường (lực theo thanh chính hiện tại)
            this.fireBullet(1.2 + this.ovMain * 7 * 1.3, false);
            this.ovMain = 0;
            this.ovCd = OV_SHOT_DELAY;
        }
        this.ammo--; this.lastShot = now;
        this.chargeLevel = this.ovMain * 7;
        return true;
    },
});

// Body cũ gọi shootOverload trong handleShooting: hook 'shoot' đã xử lý trước nên chỉ cần trả false.
Object.assign(Player.prototype, {
    shootOverload() { return false; }
});
