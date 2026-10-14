// ==========================================
// Cao Bồi (revolver) — Logic: Ổ Đạn Định Mệnh 6 viên, Fan the Hammer
// "6 viên là đủ!"
// ------------------------------------------
// - Ổ đạn cố định 6 viên (không nâng cấp nào tăng được). Chỉ nạp khi bắn cạn cả 6.
// - Nhấp: bắn điểm xạ đạn xuyên thủng. Viên thứ 6 luôn là đạn đồng: x2 sát thương, xuyên khiên.
// - Giữ 0.4s: Fan the Hammer — khóa hồng tâm 1s rồi xả toàn bộ số đạn còn lại (0.1s/viên).
// Mọi trạng thái là trường thuần trên player (đồng bộ online), bộ đếm theo tick.
// ==========================================

const REV_CYL = 6;                 // Số viên trong ổ (cố định)
const REV_HOLD_TICKS = 24;         // Giữ 0.4s -> Fan the Hammer
const REV_LOCK_TICKS = 60;         // Khóa hồng tâm 1s
const REV_FAN_INTERVAL = 6;        // 0.1s/viên
const REV_TAP_CD = 12;             // Nhịp bắn điểm xạ tối thiểu 0.2s
const REV_TAP_SPEED = 10;          // Đạn đồng tốc độ cao
const REV_FAN_SPEED = 15;          // Đạn quạt cò cực nhanh
const REV_GOLD = '#ffcc4d';
const REV_COPPER = '#ff7a2f';

function revEvo1(p) { return p.hasUpgrade('evo_rev_1'); }
function revEvo2(p) { return p.hasUpgrade('evo_rev_2'); }
function revFull(p) { return revEvo1(p) && revEvo2(p); }
function revReloadTicks(p) { return revFull(p) ? 36 : (revEvo2(p) ? 54 : 108); } // 1.8s / 0.9s / 0.6s
function revEnemy(p) { return p === p1 ? p2 : p1; }
function revDir(p) { return p.id === 1 ? -1 : 1; }
// Họng súng (offset ngang dx dùng cho khẩu thứ 2 khi Song Lục)
function revMuzzle(p, dx = 0) {
    const d = revDir(p);
    return { x: p.x + p.w / 2 + dx, y: d < 0 ? p.y - 14 : p.y + p.h + 14 };
}
// Viên sắp bắn là viên thứ mấy trong ổ (1..6) — viên cuối cùng còn lại luôn là viên 6 (đạn đồng)
function revChamber(p) { return Math.max(1, Math.min(REV_CYL, REV_CYL + 1 - p.ammo)); }

function revSfx(kind) {
    if (typeof soundSystem === 'undefined' || !soundSystem || soundSystem.muted) return;
    try {
        if (kind === 'copper') soundSystem.playShoot('cannon');
        else if (kind === 'shot') soundSystem.playShoot('normal');
        else if (kind === 'click') soundSystem.playClick();
        else if (kind === 'reload' && soundSystem.playTone) { soundSystem.playTone(1250, 'square', 0.04, 0.12); soundSystem.playTone(900, 'square', 0.05, 0.1); }
        else if (kind === 'power') soundSystem.playPowerup();
    } catch (e) {}
}

function revFx(p, fx) {
    if (!p.revFx) p.revFx = [];
    p.revFx.push(fx);
    if (p.revFx.length > 24) p.revFx.shift();
}

// Ổ đạn mới (sau khi nạp xong / hồi đầy tức thì)
function revNewCylinder(p, dmgBonus = 0) {
    p.ammo = REV_CYL;
    p.revCylId = (p.revCylId || 0) + 1;
    p.revCylShots = 0; p.revCylHits = 0; p.revCylFanned = false;
    p.revDmgBonus = dmgBonus;
    p.revReloading = false; p.revReloadT = 0;
    p.revLastAmmo = p.ammo;
}

function revInstantRefill(p, text, dmgBonus = 0) {
    revNewCylinder(p, dmgBonus);
    p.revSpinT = 18;
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -26 : p.h + 30), text, REV_GOLD, 13);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, REV_GOLD, 12);
    revSfx('power');
}

// Bắn 1 viên. opts: { fan, aimX, aimY, dx (lệch họng), twin (khẩu thứ 2 — không phải đạn đồng) }
function revFireRound(p, opts = {}) {
    const chamber = revChamber(p);
    const copper = chamber === REV_CYL && !opts.twin;
    const full = revFull(p);
    const m = revMuzzle(p, opts.dx || 0);
    const dirY = revDir(p);
    let vx = 0, vy = dirY * (opts.fan ? REV_FAN_SPEED : REV_TAP_SPEED);
    if (opts.fan && typeof opts.aimX === 'number') {
        const dx = opts.aimX - m.x, dy = opts.aimY - m.y;
        const L = Math.hypot(dx, dy) || 1;
        // Không cho bắn ngược ra sau lưng
        const ny = (dy * dirY > 0) ? dy / L : dirY * 0.2;
        const nx = dx / L;
        const NL = Math.hypot(nx, ny) || 1;
        vx = nx / NL * REV_FAN_SPEED; vy = ny / NL * REV_FAN_SPEED;
    }
    let dmg = (p.damage + (p.dmgBuff || 0) + (p.revDmgBonus || 0));
    if (copper) dmg *= full ? 2.5 : 2;          // Đạn đồng: x2 (Full Evo: Chí Mạng x2.5)
    const w = copper ? 6 : 4, h = copper ? 14 : 12;
    spawnBullet(p, {
        x: m.x - w / 2, y: dirY < 0 ? m.y - h : m.y, w, h, vx, vy, dmg,
        // Bắn điểm xạ luôn xuyên thủng; Quạt Cò chỉ xuyên khi Full Evo
        isPiercing: opts.fan ? full : true,
        hook: 'revolver', revCyl: p.revCylId, revChamber: chamber, revCopper: copper,
        revFan: !!opts.fan, revCounted: false,
        // Evo 1: viên 1-5 có 50% nổ, viên 6 luôn nổ lớn (tung xúc xắc lúc bắn trên host)
        revBoom: revEvo1(p) && (copper || Math.random() < 0.5),
        revSX: m.x, revSY: m.y,
    });
    p.revCylShots = (p.revCylShots || 0) + (opts.twin ? 0 : 1);
    revFx(p, { k: 'flash', x: m.x, y: m.y, dir: dirY, life: copper ? 8 : 5, max: copper ? 8 : 5, copper, ang: Math.atan2(vy, vx) });
    p.revKick = copper ? 6 : 4;
    p.revSpinT = 6;
    if (copper) {
        triggerScreenShake(4, 6);
        addFloatingText(m.x, m.y + dirY * 6, 'ĐẠN ĐỒNG!', REV_COPPER, 12);
    }
    revSfx(copper ? 'copper' : 'shot');
}

// Trúng đích (đạn của Cao Bồi chạm thân đối thủ)
function revOnHit(b, owner, victim) {
    if (!owner || owner.weapon !== 'revolver' || !victim) return;
    const hx = b.x + b.w / 2, hy = b.y + b.h / 2;
    const full = revFull(owner);
    if (!b.revCounted) {
        b.revCounted = true;
        if (b.revCyl === owner.revCylId) {
            if (b.revFan) owner.revFanHits = (owner.revFanHits || 0) + 1;
            else owner.revCylHits = (owner.revCylHits || 0) + 1;
        }
    }
    spawnSparkParticles(hx, hy, b.revCopper ? REV_COPPER : REV_GOLD, b.revCopper ? 10 : 5);

    // Evo 1: Đạn Độc Đắc
    if (b.revBoom) {
        if (b.revCopper) {
            explosions.push(new Explosion(hx, hy, full ? 80 : 70, 'rgba(255, 140, 40,', 0.75, owner));
            victim.freezeTimer = Math.max(victim.freezeTimer || 0, 45);
            addFloatingText(victim.x + victim.w / 2, victim.y - 16, 'CHOÁNG! 💥', REV_COPPER, 14);
            triggerScreenShake(6, 10);
        } else {
            explosions.push(new Explosion(hx, hy, 38, 'rgba(255, 205, 80,', 0.4, owner));
        }
    }

    // Full Evo: Ổ Đạn Ngũ Sắc — hiệu ứng theo thứ tự viên
    if (full) {
        const c = b.revChamber;
        if (c === 1 || c === 2) {
            victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
        } else if (c === 3 || c === 4) {
            victim.bleedTimer = Math.max(victim.bleedTimer || 0, 60);
            victim.bleedDmg = 0.08;
        } else if (c === 5) {
            victim.freezeTimer = Math.max(victim.freezeTimer || 0, 18);
        } else if (c === 6 && b.revCopper) {
            addFloatingText(victim.x + victim.w / 2, victim.y - 28, 'CHÍ MẠNG! ☠️', '#ff3b3b', 15);
        }
    }

    // Evo 2: Bách Phát Bách Trúng (bắn điểm xạ 6/6)
    if (revEvo2(owner) && !b.revFan && b.revCyl === owner.revCylId && !owner.revCylFanned && owner.revCylHits >= REV_CYL) {
        revInstantRefill(owner, 'BÁCH PHÁT BÁCH TRÚNG! +1 DMG 🤠', 1);
    }
}

// Đạn đồng xuyên giáp / xuyên khiên: tự xử lý va chạm với thân đối thủ trước bước va chạm chung
function revCopperPass(p) {
    const enemy = revEnemy(p);
    if (!enemy || enemy.hp <= 0) return;
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (!b || b.hook !== 'revolver' || !b.revCopper || b.owner !== p) continue;
        if (!b.hitIds) b.hitIds = [];
        if (b.hitIds.includes(enemy)) continue;
        if (!rectIntersect(b.x, b.y, b.w, b.h, enemy.x, enemy.y, enemy.w, enemy.h)) continue;
        b.hitIds.push(enemy);
        enemy.takeDamage(b.dmg, p, { bypassShield: true, isPiercing: true });
        revOnHit(b, p, enemy);
        if (!b.isPiercing) p.bullets.splice(i, 1);
    }
}

// Bắt đầu Fan the Hammer: khóa hồng tâm
function revStartFan(p) {
    const e = revEnemy(p);
    p.revFanPhase = 1; p.revFanT = REV_LOCK_TICKS;
    p.revMarkX = e ? e.x + e.w / 2 : p.x + p.w / 2;
    p.revMarkY = e ? e.y + e.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
    p.revCylFanned = true;
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -24 : p.h + 28), 'QUẠT CÒ! 🎯', REV_GOLD, 13);
    revSfx('click');
}

function revUpdateFan(p) {
    const e = revEnemy(p);
    // Hồng tâm bám theo mục tiêu (có độ trễ -> vẫn có thể lách người để né)
    if (e && e.hp > 0) {
        const k = p.revFanPhase === 1 ? 0.16 : 0.09;
        p.revMarkX += (e.x + e.w / 2 - p.revMarkX) * k;
        p.revMarkY += (e.y + e.h / 2 - p.revMarkY) * k;
    }
    if (p.revFanPhase === 1) {
        p.revFanT--;
        if (p.revFanT <= 0) {
            p.revFanPhase = 2; p.revFanTick = 0;
            p.revFanShots = 0; p.revFanHits = 0; p.revFanCyl = p.revCylId;
            p.revFanLeft = p.ammo; p.revCylFanned = true;
        }
        return;
    }
    if (p.revFanPhase === 2) {
        if (--p.revFanTick > 0) return;
        if (p.ammo <= 0 || p.revFanLeft <= 0) { p.revFanPhase = 0; p.revFanEval = true; return; }
        const dual = revFull(p);
        if (dual) {
            // Song Lục: rút khẩu thứ 2, mỗi nhịp 2 viên
            revFireRound(p, { fan: true, aimX: p.revMarkX, aimY: p.revMarkY, dx: -9 });
            revFireRound(p, { fan: true, aimX: p.revMarkX, aimY: p.revMarkY, dx: 9, twin: true });
            p.revFanShots += 2;
        } else {
            revFireRound(p, { fan: true, aimX: p.revMarkX, aimY: p.revMarkY });
            p.revFanShots += 1;
        }
        p.ammo--; p.revFanLeft--;
        p.lastShot = Date.now();
        p.revFanTick = REV_FAN_INTERVAL;
        if (p.ammo <= 0 || p.revFanLeft <= 0) { p.revFanPhase = 0; p.revFanEval = true; }
    }
}

// Evo 2: Thưởng Quạt Cò — sau khi mọi viên quạt đã bay xong, trúng >= 50% -> hồi đầy 6 viên
function revEvalFan(p) {
    if (!p.revFanEval) return;
    const inFlight = p.bullets.some(b => b && b.hook === 'revolver' && b.revFan && b.revCyl === p.revFanCyl);
    if (inFlight) return;
    p.revFanEval = false;
    if (!revEvo2(p) || p.revFanCyl !== p.revCylId || !p.revFanShots) return;
    if (p.revFanHits * 2 >= p.revFanShots) revInstantRefill(p, `QUẠT CÒ ${p.revFanHits}/${p.revFanShots} — NẠP ĐẦY! 🤠`);
}

BulletHooks.register('revolver', {
    // (Đạn đồng thường đã được revCopperPass xử lý trước; tới đây chỉ khi xe đang bị choáng)
    hit(b, attacker, victim) { revOnHit(b, attacker, victim); },
});

CharHooks.register('revolver', {
    setup() {
        // "6 viên là đủ!" — ép cứng ổ đạn, vô hiệu hồi đạn lẻ mặc định
        this.maxAmmo = REV_CYL;
        this.reloadTime = 1e9;
        this.revCylId = 0;
        revNewCylinder(this, 0);
        this.revHold = 0; this.revPrevS = false; this.revCd = 0;
        this.revFanPhase = 0; this.revFanT = 0; this.revFanTick = 0;
        this.revFanShots = 0; this.revFanHits = 0; this.revFanCyl = 0; this.revFanEval = false; this.revFanLeft = 0;
        this.revMarkX = 0; this.revMarkY = 0;
        this.revFx = []; this.revKick = 0; this.revSpinT = 0;
    },

    update() {
        // Ổ đạn cố định: chặn mọi nguồn tăng đạn tối đa
        this.maxAmmo = REV_CYL;
        this.reloadTime = 1e9;
        if (this.ammo > REV_CYL) this.ammo = REV_CYL;
        // Nguồn ngoài (thùng đạn...) nạp thêm -> coi như ổ mới
        if (this.ammo > (this.revLastAmmo || 0) && this.revFanPhase !== 2) {
            const keep = this.revDmgBonus || 0;
            revNewCylinder(this, this.ammo >= REV_CYL ? 0 : keep);
        }

        if (this.revCd > 0) this.revCd--;
        if (this.revKick > 0) this.revKick--;
        if (this.revSpinT > 0) this.revSpinT--;
        if (this.revFx && this.revFx.length) {
            for (const f of this.revFx) f.life--;
            this.revFx = this.revFx.filter(f => f.life > 0);
        }

        revCopperPass(this);

        // Fan the Hammer (ngắt khi bị câm lặng trong lúc ngắm)
        if (this.revFanPhase === 1 && this.silenceTimer > 0) { this.revFanPhase = 0; addFloatingText(this.x + this.w / 2, this.y - 14, 'MẤT NGẮM!', '#94a3b8', 11); }
        if (this.revFanPhase) revUpdateFan(this);
        revEvalFan(this);

        // Nạp cả ổ khi cạn sạch
        if (this.ammo <= 0 && !this.revReloading && !this.revFanPhase) {
            this.revReloading = true;
            this.revReloadT = revReloadTicks(this);
            this.revReloadMax = this.revReloadT;
        }
        if (this.revReloading) {
            if (--this.revReloadT <= 0) {
                revNewCylinder(this, 0);
                this.revSpinT = 12;
                revSfx('reload');
            }
        }
        this.revLastAmmo = this.ammo;
    },

    speed(s) { return this.revFanPhase ? s * 0.6 : s; },

    shoot(inp, now) {
        const busy = this.revFanPhase !== 0 || this.revReloading || this.ammo <= 0;
        if (inp.s) {
            this.revHold++;
            if (this.revHold === REV_HOLD_TICKS && !busy) revStartFan(this);
        } else {
            if (this.revPrevS && this.revHold < REV_HOLD_TICKS && !busy && this.revCd <= 0) {
                revFireRound(this, {});
                this.ammo--;
                this.lastShot = now;
                this.revCd = REV_TAP_CD;
            } else if (this.revPrevS && this.revHold < REV_HOLD_TICKS && this.ammo <= 0) {
                revSfx('click'); // Tạch! — ổ rỗng
            }
            this.revHold = 0;
        }
        this.revPrevS = !!inp.s;
        this.revLastAmmo = this.ammo;
        return true;
    },
});
