// ==========================================
// Cơ Bản — dạng MAIN: Evo 3/4 (có sẵn) + 2 Evo MAIN đặc biệt (bày bán, không tính ô)
// ------------------------------------------
// • Evo 3 "Bước Chân Chính Diện": chạm đúp ←/→ lướt ở mọi hiệp (hồi 2.5s, 0.15s đầu xuyên đạn) — logic.js.
// • Evo 4 Skill "Đạn Hợp Nhất" (CD 10s): dồn cả băng thành 1 viên Hợp Nhất khổng lồ xuyên thấu.
//   Nộ: nhận sát thương (khung chung) + NÉ SÁT (đạn địch lướt qua trong 20px: +6).
//   Tuyệt Kỹ "LỬA CHƯA TÀN": Cơ Hội Cuối 6s (tổ hợp 1+2+3+4 của MAIN: 8s) ở mọi hiệp, kết thúc bằng
//   một Hợp Nhất cỡ nửa sân (khoá vùng cảnh báo 0.6s trước khi bắn); kết liễu địch ≤25% máu.
// • Evo MAIN α "Hào Quang Nhân Vật Chính": né sát +1 tầng (tối đa 5, trúng đòn -1): +6% dame & tốc/tầng;
//   đủ 5 -> ánh đèn sân khấu, phát kế tiếp là Hợp Nhất + hồi 1 khiên.
// • Evo MAIN β "Ký Ức Thứ Hai": sau khi Hồi Ức đã dùng, mỗi hiệp thắng +1 Mảnh Ký Ức; đủ 2 -> Hồi Ức nạp lại
//   1 lần (hồi sinh 50% máu, bất tử 1.5s, không thức tỉnh thêm).
// Trạng thái là trường thuần trên Player; thực thể MainUltFx / MainFinaleOrb / MainMemoryFx có trong NET_CLASSES.
// Tắt FEATURE_EVO34: không có thẻ nào ở đây, mọi hàm trả về sớm.
// ==========================================

const MAIN_EVO = {
    grazePx: 20, grazeRage: 6, grazeGap: 8,           // né sát: khoảng hở ≤ 20px, tối đa 1 lần / 8 tick
    auraMax: 5, auraPer: 0.06,                        // Hào Quang
    fusionMul: 0.8, fusionCap: 1.8,                   // Đạn Hợp Nhất: tổng x0.8, trần x1.8 phát thường
    ultTicks: 360, ultTicksCombo: 480,                // Lửa Chưa Tàn 6s / 8s
    finaleCharge: 36, finaleDmgMul: 1.3, finaleExec: 0.25,
    memNeed: 2, memHp: 0.5, memInv: 90,
};
const MAIN_UI_GOLD = '#ffd56a', MAIN_UI_FIRE = '#ff7a00';

function mainHasEvo(p, slot) {
    if (!FEATURE_EVO34 || !evoIsMainBasic(p)) return false;
    const id = slot === 'a' ? 'evo_basic_main_1' : slot === 'b' ? 'evo_basic_main_2' : 'evo_basic_' + slot;
    return p.hasUpgrade(id);
}
function mainCombo(p) { return FEATURE_EVO34 && hasFullEvo(p) && fullEvoCombo(p) === '1+2+3+4'; }
function mainEnemy(p) { return p.id === 1 ? p2 : p1; }
function mainAuth() { return typeof EvoSystem === 'undefined' || EvoSystem.authoritative(); }
function mainSnd(fn) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[fn]) soundSystem[fn](); }

// ---------- Đầu hiệp ----------
function mainEvoSetup(p) {
    p.mainUltT = 0; p.mainUltMax = 0; p.mainUltReload = 0;
    p.mainAura = 0; p.mainAuraCharged = false; p.mainAuraFx = 0;
    p.mainGrazeCd = 0; p.mainGrazeFx = 0; p.mainSkillFx = 0;
    p.mainBotDash = 0; p.mainDashFx = 0;
    if (p.mainMemShards === undefined) p.mainMemShards = 0;
}

// ---------- Mỗi tick (máy chủ) ----------
function mainEvoUpdate(p, eff) {
    if (!FEATURE_EVO34 || !evoIsMainBasic(p) || gameState.phase !== 'playing') return;
    if (p.mainGrazeCd > 0) p.mainGrazeCd--;
    if (p.mainGrazeFx > 0) p.mainGrazeFx--;
    if (p.mainAuraFx > 0) p.mainAuraFx--;
    if (p.mainSkillFx > 0) p.mainSkillFx--;
    if (p.hp > 0) mainGrazeScan(p);
    // Lửa Chưa Tàn
    if (p.mainUltT > 0) {
        p.mainUltT--;
        if (p.ultActiveTicks > p.mainUltT + 1) p.ultActiveTicks = p.mainUltT + 1; // vòng đếm ngược trên nút = đúng thời lượng
        if (p.mainUltT % 6 === 0) spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, p.mainUltT % 12 ? '#ffb020' : '#ff5a00', 2);
        if (p.mainUltT === 0) mainUltEnd(p);
    }
}

// Né sát: đạn địch đi ngang qua làn xe, mép cách xe ≤ 20px mà không trúng
function mainGrazeScan(p) {
    const e = mainEnemy(p);
    if (!e || !Array.isArray(e.bullets) || p.mainGrazeCd > 0) return;
    const y0 = p.y, y1 = p.y + p.h, x0 = p.x, x1 = p.x + p.w;
    for (const b of e.bullets) {
        if (!b || b.mainGraze || !(b.w > 0)) continue;
        if (b.y > y1 || b.y + b.h < y0) continue;
        const gap = b.x > x1 ? b.x - x1 : (b.x + b.w < x0 ? x0 - (b.x + b.w) : -1);
        if (gap < 0) continue;
        b.mainGraze = true;
        if (gap > MAIN_EVO.grazePx) continue;
        mainOnGraze(p, b.x + b.w / 2, b.y + b.h / 2);
        return;
    }
}
function mainOnGraze(p, bx, by) {
    p.mainGrazeCd = MAIN_EVO.grazeGap;
    p.mainGrazeFx = 24; p.mainGrazeX = Math.round(bx); p.mainGrazeY = Math.round(by);
    if (typeof EvoSystem !== 'undefined') EvoSystem.gain(p, 'graze', MAIN_EVO.grazeRage);
    if (mainHasEvo(p, 'a') && !p.mainAuraCharged) {
        p.mainAura = Math.min(MAIN_EVO.auraMax, (p.mainAura || 0) + 1);
        p.mainAuraFx = 30;
        const tx = p.x + p.w / 2, ty = p.id === 1 ? p.y - 14 : p.y + p.h + 14;
        if (p.mainAura >= MAIN_EVO.auraMax) {
            p.mainAuraCharged = true;
            addFloatingText(tx, ty, '✦ HÀO QUANG ĐẦY — HỢP NHẤT! ✦', MAIN_UI_GOLD, 13);
            mainSnd('playPowerup');
        } else addFloatingText(tx, ty, `✦ ${p.mainAura}`, MAIN_UI_GOLD, 11);
    } else addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 12 : p.y + p.h + 12, 'NÉ SÁT', '#fde68a', 9);
}

// Đạn mới (gọi từ logic.js): Hào Quang +6% dame/tầng; Hào Quang đầy -> Hợp Nhất + 1 khiên. Trả true nếu đã xử lý xong.
function mainEvoTagBullet(p, b) {
    if (!mainHasEvo(p, 'a')) return false;
    if (p.mainAura > 0) b.dmg *= 1 + MAIN_EVO.auraPer * p.mainAura;
    if (!p.mainAuraCharged || b.hook) return false;
    p.mainAuraCharged = false; p.mainAura = 0; p.mainAuraFx = 40;
    mainMakeUnity(b, 2.6); b.dmg *= 1.5; b.mainAuraShot = true;
    p.shield = (p.shield || 0) + 1;
    addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 16, '+1 KHIÊN 🛡', '#7ff6ff', 11);
    triggerScreenShake(4, 8);
    return true;
}

// ---------- Evo 4: Skill Đạn Hợp Nhất ----------
function mainSkillFusion(p) {
    const n = Math.floor(p.ammo || 0);
    if (n < 1 || p.hp <= 0) return false;
    const base = p.damage + (p.dmgBuff || 0);
    const mul = Math.min(n * MAIN_EVO.fusionMul, MAIN_EVO.fusionCap) * (1 + (mainHasEvo(p, 'a') ? MAIN_EVO.auraPer * (p.mainAura || 0) : 0));
    const size = Math.min(40, 14 + n * 2.6);
    const dir = p.id === 1 ? -1 : 1;
    spawnBullet(p, {
        x: p.x + p.w / 2 - size / 2, y: p.id === 1 ? p.y - size : p.y + p.h,
        w: size, h: size, vx: 0, vy: dir * (C.bulletSpeed + 0.5),
        dmg: base * mul, isPiercing: true, hitIds: [], hook: 'main_fusion',
        mainFusion: true, mainTag: true, mainN: n, mainCombo: mainCombo(p),
    });
    p.ammo -= n; p.lastShot = Date.now();
    p.mainSkillFx = 22;
    explosions.push(new Explosion(p.x + p.w / 2, p.id === 1 ? p.y : p.y + p.h, 34, 'rgba(255,190,60,', 0, p));
    triggerScreenShake(5, 8);
    mainSnd('playLaser');
    addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 18 : p.y + p.h + 18, `HỢP NHẤT ×${n}`, MAIN_UI_GOLD, 13);
    return true;
}
BulletHooks.register('main_fusion', {
    hit(b, attacker, victim) {
        if (!victim || victim.hp <= 0) return;
        const cx = b.x + b.w / 2, cy = victim.y + victim.h / 2;
        spawnSparkParticles(cx, cy, '#ffd56a', 12);
        triggerScreenShake(8, 12);
        if (b.mainCombo) { // 1+2+3+4: nổ lan + làm chậm
            victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
            explosions.push(new Explosion(cx, cy, 64, 'rgba(255,130,20,', 0.5, attacker));
        } else explosions.push(new Explosion(cx, cy, 40, 'rgba(255,200,80,', 0, attacker));
    },
    draw(b) { mainDrawFusion(b); }
});

// ---------- Tuyệt Kỹ: LỬA CHƯA TÀN ----------
function mainUltimate(p) {
    if (p.hp <= 0 || p.mainUltT > 0) return false;
    const T = mainCombo(p) ? MAIN_EVO.ultTicksCombo : MAIN_EVO.ultTicks;
    p.mainUltT = T; p.mainUltMax = T;
    p.mainUltReload = p.reloadTime; p.reloadTime *= 0.75;
    p.shield = (p.shield || 0) + 1;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 30);
    p.mainDashCd = 0;
    bodyEffects.push(new MainUltFx(p));
    triggerScreenShake(10, 18);
    mainSnd('playRevive');
    return true;
}
function mainUltEnd(p) {
    if (p.mainUltReload) p.reloadTime = p.mainUltReload;
    p.mainUltReload = 0;
    if (p.hp > 0 && gameState.phase === 'playing') bodyEffects.push(new MainFinaleOrb(p));
}

// ---------- Evo MAIN β: Ký Ức Thứ Hai ----------
function mainMemoryRevive(p, attacker) {
    if (!mainHasEvo(p, 'b') || !p.mainMemReady || p.mainMemUsed) return false;
    if (!attacker || attacker === p || gameState.phase !== 'playing') return false;
    p.mainMemReady = false; p.mainMemUsed = true; p.mainMemShards = 0;
    p.hp = Math.max(1, p.maxHp * MAIN_EVO.memHp);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, MAIN_EVO.memInv);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, e = mainEnemy(p);
    if (e && Array.isArray(e.bullets)) e.bullets = e.bullets.filter(b => Math.hypot(b.x - cx, b.y - cy) > 140);
    bodyEffects.push(new MainMemoryFx(p));
    addFloatingText(cx, p.id === 1 ? p.y - 26 : p.y + p.h + 26, 'KÝ ỨC THỨ HAI — CHƯA ĐƯỢC NGÃ!', '#c4b5fd', 15);
    triggerScreenShake(10, 18);
    mainSnd('playRevive');
    return true;
}

// ---------- Hook đăng ký thêm vào body Cơ Bản ----------
(function () {
    const H = CharHooks.registry.basic;
    H.skill = function (p) { return mainSkillFusion(p || this); };
    H.ultimate = function (p) { return mainUltimate(p || this); };
    H.ultimateReady = function () { return true; };
    H.speed = function (s) {
        if (!evoIsMainBasic(this)) return s;
        if (mainHasEvo(this, 'a') && this.mainAura > 0) s *= 1 + MAIN_EVO.auraPer * this.mainAura;
        if (this.mainUltT > 0) s *= 1.2;
        return s;
    };
    const damaged = H.damaged;
    H.damaged = function (amount, attacker) {
        if (damaged) damaged.call(this, amount, attacker);
        if (amount > 0 && this.mainAura > 0 && mainHasEvo(this, 'a')) {
            this.mainAura--; this.mainAuraCharged = false; this.mainAuraFx = 20;
        }
    };
    const roundEnd = H.roundEnd;
    H.roundEnd = function (res) {
        if (roundEnd) roundEnd.call(this, res);
        if (res !== 'win' || !this.mainAwakened || this.mainMemUsed || this.mainMemReady || !mainHasEvo(this, 'b')) return;
        this.mainMemShards = (this.mainMemShards || 0) + 1;
        if (this.mainMemShards >= MAIN_EVO.memNeed) {
            this.mainMemReady = true;
            addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 24 : this.y + this.h + 24, '✦ HỒI ỨC NẠP LẠI ✦', '#c4b5fd', 14);
        } else addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 24 : this.y + this.h + 24, `MẢNH KÝ ỨC ${this.mainMemShards}/${MAIN_EVO.memNeed}`, '#c4b5fd', 12);
    };
})();

// ==========================================
// Thực thể (dữ liệu thuần, NET_CLASSES)
// ==========================================
// Khoảnh khắc tung Tuyệt Kỹ: viền điện ảnh (letterbox), ánh đèn rọi, cột lửa, vòng xung kích
class MainUltFx {
    constructor(owner) {
        this.side = owner.id; this.x = owner.x + owner.w / 2; this.y = owner.y + owner.h / 2;
        this.t = 0; this.dur = 84; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { mainDrawUltFx(this); }
}
// Hợp Nhất cỡ nửa sân cuối Lửa Chưa Tàn: khoá vùng cảnh báo trên làn địch, tụ lực rồi bắn
class MainFinaleOrb {
    constructor(owner) {
        const W = canvas.width, e = mainEnemy(owner);
        this.side = owner.id; this.dir = owner.id === 1 ? -1 : 1;
        this.zw = Math.round(W / 2);
        this.zx = Math.round(Math.max(0, Math.min(W - this.zw, owner.x + owner.w / 2 - this.zw / 2)));
        this.ox = owner.x + owner.w / 2; this.oy = owner.id === 1 ? owner.y : owner.y + owner.h;
        this.y = this.oy;
        this.ty = e ? e.y + e.h / 2 : (owner.id === 1 ? 40 : canvas.height - 40);
        this.ly = e ? (owner.id === 1 ? e.y - 8 : e.y - 8) : this.ty - 20; this.lh = e ? e.h + 16 : 40;
        this.dmg = owner.damage * MAIN_EVO.finaleDmgMul; this.combo = mainCombo(owner);
        this.t = 0; this.charge = MAIN_EVO.finaleCharge; this.hit = false; this.hitT = 0;
        this.speed = Math.max(9, Math.abs(this.ty - this.oy) / 40); this.active = true;
    }
    update() {
        this.t++;
        const owner = this.side === 1 ? p1 : p2, e = this.side === 1 ? p2 : p1;
        if (this.t === 1) mainSnd('playPowerup');
        if (this.t === this.charge) { triggerScreenShake(9, 14); mainSnd('playLaser'); }
        if (this.t > this.charge && !this.hit) {
            this.y += this.dir * this.speed;
            // Quả cầu nuốt đạn địch trên đường bay
            if (e && Array.isArray(e.bullets) && mainAuth()) e.bullets = e.bullets.filter(b => !(b.x + b.w > this.zx && b.x < this.zx + this.zw && Math.abs(b.y - this.y) < this.zw * 0.35));
            if ((this.y - this.ty) * this.dir >= 0) {
                this.hit = true; this.hitT = this.t; this.y = this.ty;
                const cx = this.zx + this.zw / 2;
                if (e && e.hp > 0 && owner && mainAuth()) {
                    const ex = e.x + e.w / 2;
                    if (ex + e.w / 2 > this.zx && ex - e.w / 2 < this.zx + this.zw) {
                        // Mặt trời nửa sân xuyên khiên: phá 1 khiên rồi vẫn gây sát thương
                        if (e.shield > 0) { e.shield--; addFloatingText(ex, e.y - 10, 'PHÁ KHIÊN!', MAIN_UI_GOLD, 12); }
                        EvoBodyKit.hit(owner, e, this.dmg, MAIN_EVO.finaleExec, { isPiercing: true, bypassShield: true });
                        if (this.combo && e.hp > 0) e.slowTimer = Math.max(e.slowTimer || 0, 120);
                        if (e.hp > 0) { e.burnTimer = Math.max(e.burnTimer || 0, 120); }
                    }
                }
                explosions.push(new Explosion(cx, this.ty, this.zw * 0.45, 'rgba(255,170,40,', 0, owner));
                explosions.push(new Explosion(cx, this.ty, this.zw * 0.25, 'rgba(255,250,220,', 0, owner));
                spawnSparkParticles(cx, this.ty, '#ffd56a', 22);
                spawnSparkParticles(cx, this.ty, '#ff5a00', 14);
                triggerScreenShake(16, 26);
                mainSnd('playExplosion');
            }
        }
        if (this.hit && this.t - this.hitT > 40) this.active = false;
        if (this.t > 400) this.active = false;
    }
    draw() { mainDrawFinaleGround(this); }
    drawOver() { mainDrawFinaleOrb(this); }
}
// Ký Ức Thứ Hai: mảnh ký ức vỡ tung, tua ngược ánh tím-vàng
class MainMemoryFx {
    constructor(owner) {
        this.side = owner.id; this.x = owner.x + owner.w / 2; this.y = owner.y + owner.h / 2;
        this.t = 0; this.dur = 70; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { mainDrawMemoryFx(this); }
}

// Lớp phủ (vẽ sau xe): gọi từ mnfFxOver (finisher.js)
function mainEvoFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e && e.active && typeof e.drawOver === 'function' && (e instanceof MainUltFx || e instanceof MainFinaleOrb || e instanceof MainMemoryFx)) e.drawOver();
}
