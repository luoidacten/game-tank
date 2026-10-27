// ==========================================
// Chrono & Neo (chrononeo) — Logic
// "Hai thời đại, một dòng chảy — kẻ làm chủ thời gian sẽ nắm giữ chiến trường!"
// ------------------------------------------
// - Tham Farm: phá Thùng / Xe Tiền / triệu hồi địch, qua mỗi hiệp -> Điểm Thời Đại (lưu trên player, giữ qua các hiệp)
//   -> băng Chrono 4 -> 10, băng Neo 10 -> 20.
// - 2 thế, 2 băng tách biệt (băng không cầm tự nạp ngầm). Giữ Bắn 0.4s = Chuyển Thế (hồi 4s, Full Evo 2s).
//   + Sang CHRONO: sóng xung kích đẩy lùi đạn/địch áp sát + giảm 25% sát thương nhận 1.5s.
//   + Sang NEO: lướt ngang + 40% tốc chạy 1.5s.
//   CHRONO: nhấp -> 1 đạn đồng x1.5 dame, xuyên vật cản, Xé Giáp (bóc thêm 1 khiên). Bắn chậm 25%, nạp băng 2.5s.
//   NEO: nhấp -> 2 viên liên tiếp x0.75. Bắn nhanh 25%, +10% tốc chạy, nạp băng 1.5s.
// - Thời Khắc: đứng 1 thế đủ 4s (Evo 1: 2.5s) -> phát nhấp kế tiếp là đòn cường hóa:
//   CHRONO: radar đánh dấu mọi mục tiêu, 0.5s Không Thể Cản Phá, xả toàn băng đạn tự tìm chia đều mục tiêu + đẩy lùi.
//   NEO: chùm 8-12 viên hình nón, Xé Giáp + chậm 35% 1.5s; để lại Ảnh Chiếu bất tử 5s tự bắn (25% dame).
// - Evo 1: Thời Khắc 2.5s; đổi thế ngay sau Thời Khắc (3s) -> băng mới nạp đầy; có Ảnh Chiếu -> hoán đổi vị trí.
// - Evo 2: +3/+6 đạn đầu hiệp, điểm từ thùng/xe tiền x2; Chrono +4 viên & viên cuối nổ choáng 0.5s;
//   Neo bắn 2 đợt, Ảnh Chiếu 8s bắn đạn làm chậm.
// - Full Evo: băng tối đa ngay (10/20), đổi thế hồi 2s, Phân Thân Nghịch Đảo (AI cầm thế ngược trên làn mình,
//   đổi thế đồng bộ + hiệu ứng tại chỗ), cứ 2 lần Thời Khắc -> Liên Hoa: 4s bão đạn rồi "Nở Rộ" phủ sân địch.
// State là trường thuần trên player / entity trong bodyEffects (đồng bộ online). Bộ đếm theo tick.
// ==========================================

const CN_HOLD = 24;
const CN_GOLD = '#f5b942', CN_BRONZE = '#b8742a', CN_CYAN = '#22e3ff', CN_VIOLET = '#b18cff';
const CN_PERFECT_WIN = 180;   // Evo 1: cửa sổ "đổi thế hoàn hảo" sau Thời Khắc
const CN_ERA_MAX = 20;

function cnE1(p) { return p.hasUpgrade('evo_cn_1'); }
function cnE2(p) { return p.hasUpgrade('evo_cn_2'); }
function cnFull(p) { return cnE1(p) && cnE2(p) && hasFullEvo(p, 'chrononeo'); }
function cnEnemy(p) { return p === p1 ? p2 : p1; }
function cnDir(p) { return p.id === 1 ? -1 : 1; }
function cnSwitchMax(p) { return cnFull(p) ? 240 : 360; } // CD đổi thế 6s (Full Evo 4s)
function cnGlassMax(p) { return cnE1(p) ? 150 : 240; }
function cnMaxC(p) {
    if (cnFull(p)) return 7;
    return Math.min(7, 3 + Math.floor((p.cnEra || 0) * 0.2) + (cnE2(p) ? 2 : 0));
}
function cnMaxN(p) {
    if (cnFull(p)) return 14;
    return Math.min(14, 8 + Math.floor((p.cnEra || 0) * 0.3) + (cnE2(p) ? 3 : 0));
}
function cnMaxOf(p, st) { return st === 'chrono' ? cnMaxC(p) : cnMaxN(p); }
function cnDmg(p) { return (p.damage || 1) + (p.dmgBuff || 0); }
function cnIsBot(p) { return p.id === 2 && typeof botAI !== 'undefined' && botAI && botAI.enabled; }
function cnSfx(kind) {
    if (typeof soundSystem === 'undefined' || !soundSystem || soundSystem.muted) return;
    try {
        if (kind === 'neo') soundSystem.playShoot('normal');
        else if (kind === 'chrono') soundSystem.playShoot('cannon');
        else if (kind === 'switch') soundSystem.playPowerup();
        else if (kind === 'click') soundSystem.playClick();
    } catch (e) { }
}
function cnFx(p, fx) {
    if (!p.cnFx) p.cnFx = [];
    p.cnFx.push(fx);
    if (p.cnFx.length > 24) p.cnFx.shift();
}

// ---------- Tham Farm ----------
function cnGainEra(p, amt, x, y) {
    if (!p || p.weapon !== 'chrononeo') return;
    const bc = cnMaxC(p), bn = cnMaxN(p);
    p.cnEra = Math.min(CN_ERA_MAX, (p.cnEra || 0) + amt);
    const dc = cnMaxC(p) - bc, dn = cnMaxN(p) - bn;
    // băng tăng -> viên mới nạp sẵn
    if (p.cnSt === 'chrono') { p.maxAmmo = cnMaxC(p); p.ammo = Math.min(p.maxAmmo, p.ammo + dc); p.cnOther = Math.min(bn + dn, (p.cnOther || 0) + dn); }
    else { p.maxAmmo = cnMaxN(p); p.ammo = Math.min(p.maxAmmo, p.ammo + dn); p.cnOther = Math.min(bc + dc, (p.cnOther || 0) + dc); }
    if (dc > 0 || dn > 0) {
        p.cnLvlFlash = 40;
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), `⌛ ${cnMaxC(p)}│${cnMaxN(p)}`, CN_GOLD, 12);
    } else if (typeof x === 'number') {
        spawnSparkParticles(x, y, CN_GOLD, 4);
    }
}

// Thùng bị phá (mọi nguồn) -> bọc hàm chung
(function () {
    if (typeof crateOnBreak !== 'function') return;
    const base = crateOnBreak;
    crateOnBreak = function (c, opener) {
        if (c && !c._broke && opener && opener.weapon === 'chrononeo') cnGainEra(opener, cnE2(opener) ? 2 : 1, c.x + c.w / 2, c.y + c.h / 2);
        return base.apply(this, arguments);
    };
})();

// Xe tiền / triệu hồi địch: đạn của mình sắp chạm -> ghi nhận; chết trong vài tick sau đó -> tính điểm (chỉ host chạy)
const CN_WATCH = [];
let cnTick = 0;
function cnEnemySummons(p) {
    const e = cnEnemy(p);
    const out = [];
    const add = (list) => (list || []).forEach(o => { if (o && o.active !== false && o.owner && o.owner !== p && (o.owner === e || o.owner.id === e.id)) out.push(o); });
    [typeof turrets !== 'undefined' ? turrets : null, typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
        typeof creatorDrones !== 'undefined' ? creatorDrones : null, typeof creatorRobots !== 'undefined' ? creatorRobots : null,
        typeof necroMinions !== 'undefined' ? necroMinions : null, typeof ghostDecoys !== 'undefined' ? ghostDecoys : null,
        typeof sniperWalls !== 'undefined' ? sniperWalls : null].forEach(add);
    if (e && e.drones) e.drones.forEach(d => { if (d && d.active !== false) out.push(d); });
    return out;
}
function cnFarmWatch(p) {
    cnTick++;
    const objs = [];
    (typeof moneyTrucks !== 'undefined' ? moneyTrucks : []).forEach(t => { if (t.active) objs.push(['truck', t]); });
    cnEnemySummons(p).forEach(o => objs.push(['summon', o]));
    if (objs.length) {
        for (const b of p.bullets) {
            if (typeof b.x !== 'number') continue;
            const pad = Math.abs(b.vx || 0) + Math.abs(b.vy || 0) + 2;
            for (const [kind, o] of objs) {
                if (typeof o.x !== 'number' || !o.w) continue;
                if (rectIntersect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2, o.x, o.y, o.w, o.h)) {
                    const w = CN_WATCH.find(x => x.o === o);
                    if (w) { w.t = cnTick; w.p = p; } else CN_WATCH.push({ o, p, t: cnTick, kind });
                }
            }
        }
    }
    for (let i = CN_WATCH.length - 1; i >= 0; i--) {
        const w = CN_WATCH[i];
        if (w.p !== p) continue;
        const dead = w.o.active === false || (typeof w.o.hp === 'number' && w.o.hp <= 0);
        if (dead) {
            cnGainEra(p, w.kind === 'truck' ? (cnE2(p) ? 6 : 3) : 2, w.o.x + (w.o.w || 0) / 2, w.o.y + (w.o.h || 0) / 2);
            CN_WATCH.splice(i, 1);
        } else if (cnTick - w.t > 6) CN_WATCH.splice(i, 1);
    }
}

// ---------- Bắn thường ----------
function cnMuzzle(p, ox = 0) { return { x: p.x + p.w / 2 + ox, y: p.y + p.h / 2 + cnDir(p) * 14 }; }

function cnFireChrono(p, scale = 1, from = null) {
    const m = from || cnMuzzle(p);
    const sp = 6.2;
    const b = spawnBullet(p, {
        x: m.x - 5, y: m.y - 5, w: 10, h: 10, vx: 0, vy: cnDir(p) * sp,
        dmg: cnDmg(p) * 1.5 * scale, isPiercing: true,
        hook: 'chrononeo', cnKind: 'chrono', cnShred: true, cnTwin: scale < 1,
    });
    if (!from) { p.cnKick = 6; triggerScreenShake(2, 4); }
    cnFx(p, { k: 'flash', x: m.x, y: m.y, life: 7, max: 7, c: CN_GOLD, big: true });
    cnSfx('chrono');
    return b;
}
function cnFireNeo(p, scale = 1, from = null, side = 0) {
    const m = from || cnMuzzle(p, side);
    const sp = 8;
    spawnBullet(p, {
        x: m.x - 2, y: m.y - 5, w: 4, h: 10, vx: 0, vy: cnDir(p) * sp,
        dmg: cnDmg(p) * 0.75 * scale,
        hook: 'chrononeo', cnKind: 'neo', cnTwin: scale < 1,
    });
    if (!from) p.cnKick = 3;
    cnFx(p, { k: 'flash', x: m.x, y: m.y, life: 4, max: 4, c: CN_CYAN });
    cnSfx('neo');
}

// ---------- Hiệu ứng chuyển thế (dùng chung cho bản thể & Phân Thân) ----------
function cnShockwave(p, cx, cy) {
    const e = cnEnemy(p);
    if (e && e.bullets) {
        for (const b of e.bullets) {
            if (typeof b.x !== 'number') continue;
            const dx = b.x + (b.w || 6) / 2 - cx, dy = b.y + (b.h || 6) / 2 - cy;
            if (Math.hypot(dx, dy) < 90) {
                // đẩy lùi: hất đạn bay ngược ra xa
                const L = Math.hypot(dx, dy) || 1, sp = Math.max(3, Math.hypot(b.vx || 0, b.vy || 0));
                b.vx = dx / L * sp; b.vy = (Math.abs(dy) < 4 ? -cnDir(p) : Math.sign(dy)) * Math.max(2, Math.abs(dy / L * sp));
                b.x += b.vx * 3; b.y += b.vy * 3;
            }
        }
    }
    if (e && e.hp > 0 && Math.abs(e.x + e.w / 2 - cx) < 70 && Math.abs(e.y + e.h / 2 - cy) < 60) e.kbX = (e.kbX || 0) + Math.sign(e.x + e.w / 2 - cx || 1) * 8;
    (typeof necroMinions !== 'undefined' ? necroMinions : []).forEach(m => {
        if (m.active && m.owner !== p && Math.hypot(m.x + m.w / 2 - cx, m.y + m.h / 2 - cy) < 80) m.y += cnDir(p) * 30;
    });
    bodyEffects.push(new CnRing(cx, cy, p, CN_GOLD, 90));
}

function cnSwitch(p, inp) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const perfect = cnE1(p) && p.cnPerfectT > 0;
    const prev = p.cnSt;
    const keep = p.ammo;
    p.cnSt = prev === 'chrono' ? 'neo' : 'chrono';
    p.maxAmmo = cnMaxOf(p, p.cnSt);
    p.ammo = Math.min(p.maxAmmo, p.cnOther || 0);
    p.cnOther = keep;
    if (perfect) {
        p.ammo = p.maxAmmo;
        spawnSparkParticles(cx, cy, '#fff4c2', 10);
        // Hoán Đổi Vị Trí với Ảnh Chiếu
        const echo = bodyEffects.find(o => o instanceof CnEcho && o.active && o.owner === p);
        if (echo) {
            const ex = echo.x;
            echo.x = p.x; p.x = Math.max(0, Math.min(canvas.width - p.w, ex));
            bodyEffects.push(new CnRing(echo.x + p.w / 2, cy, p, CN_VIOLET, 50));
            bodyEffects.push(new CnRing(p.x + p.w / 2, cy, p, CN_VIOLET, 50));
        }
        p.cnPerfectT = 0;
    }
    if (p.cnSt === 'chrono') {
        p.cnDR = 90;
        cnShockwave(p, p.x + p.w / 2, cy);
    } else {
        const dir = inp && inp.l && !inp.r ? -1 : (inp && inp.r && !inp.l ? 1 : (p.cnFace || 1));
        p.cnDashDir = dir; p.cnDashT = 8;
        p.cnBoost = 90;
    }
    p.cnGlass = 0;
    p.cnFireCd = 6; p.cnBurst = 0;
    p.cnSwCd = cnSwitchMax(p);
    p.cnSwFlash = 16;
    // Phân Thân Nghịch Đảo đổi theo (luôn ngược thế bản thể) + hiệu ứng tại chỗ
    if (cnFull(p)) {
        p.cnTwSt = p.cnSt === 'chrono' ? 'neo' : 'chrono';
        const ty = p.y + p.h / 2;
        if (p.cnTwSt === 'chrono') cnShockwave(p, p.cnTwX, ty);
        else { p.cnTwDash = 8; p.cnTwDashDir = p.cnTwX < p.x + p.w / 2 ? -1 : 1; p.cnTwBoost = 90; }
    }
    cnSfx('switch');
}

// ---------- Thời Khắc ----------
function cnCollectTargets(p) {
    const e = cnEnemy(p);
    const list = [];
    if (e && e.hp > 0) list.push(e);
    cnEnemySummons(p).forEach(o => list.push(o));
    (typeof moneyTrucks !== 'undefined' ? moneyTrucks : []).forEach(t => { if (t.active) list.push(t); });
    (typeof crates !== 'undefined' ? crates : []).forEach(c => { if (c.active) list.push(c); });
    return list;
}

function cnEmpowerChrono(p) {
    const extra = cnE2(p) ? 2 : 0;
    const n = Math.max(2, p.ammo) + extra;
    p.ammo = 0;
    const r = new CnRadar(p, n);
    CN_TARGETS.set(r, cnCollectTargets(p));
    bodyEffects.push(r);
    p.cnUnstop = 30;
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -22 : p.h + 26), '⏳ LIÊN XẠ', CN_GOLD, 14);
    triggerScreenShake(4, 10);
    cnSfx('chrono');
}

function cnNeoCone(p) {
    const m = cnMuzzle(p);
    const n = Math.min(8, 6 + Math.round((cnMaxN(p) - 8) * 0.3));
    const spread = 1.1;
    for (let i = 0; i < n; i++) {
        const a = -spread / 2 + spread * (i / (n - 1));
        const sp = 7;
        spawnBullet(p, {
            x: m.x - 2, y: m.y - 4, w: 5, h: 8, vx: Math.sin(a) * sp, vy: cnDir(p) * Math.cos(a) * sp,
            dmg: cnDmg(p) * 0.45, hook: 'chrononeo', cnKind: 'cone', cnShred: true, cnSlow: 90,
        });
    }
    cnFx(p, { k: 'cone', x: m.x, y: m.y, life: 14, max: 14 });
    cnSfx('neo');
}

function cnEmpowerNeo(p) {
    cnNeoCone(p);
    if (cnE2(p)) p.cnWave2 = 14;
    // Ảnh Chiếu Bất Tử: tối đa 1 cái, cái cũ tan
    bodyEffects.forEach(o => { if (o instanceof CnEcho && o.owner === p) o.active = false; });
    bodyEffects.push(new CnEcho(p, cnE2(p) ? 480 : 300));
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -22 : p.h + 26), '⏳ MƯA ĐẠN', CN_CYAN, 14);
    triggerScreenShake(3, 8);
}

function cnEmpower(p) {
    if (p.cnSt === 'chrono') cnEmpowerChrono(p); else cnEmpowerNeo(p);
    p.cnGlass = 0;
    p.cnPerfectT = CN_PERFECT_WIN;
    p.cnEmpFlash = 24;
    if (cnFull(p)) {
        p.cnEmpCount = (p.cnEmpCount || 0) + 1;
        if (p.cnEmpCount >= 2) {
            p.cnEmpCount = 0;
            p.cnLotus = 150; p.cnLotusSpin = 0;
            addFloatingText(canvas.width / 2, canvas.height / 2, '🪷 LIÊN HOA THỜI GIAN', '#ffd1f0', 16);
        }
    }
}

// Liên Hoa: 4s bão đạn từ bản thể & Phân Thân, kết thúc bằng loạt đại pháo "Nở Rộ" phủ sân địch
function cnLotusTick(p) {
    p.cnLotus--;
    p.cnLotusSpin = (p.cnLotusSpin || 0) + 1;
    if (p.cnLotus % 15 === 0) {
        const srcs = [{ x: p.x + p.w / 2, y: p.y + p.h / 2 }];
        if (cnFull(p) && Number.isFinite(p.cnTwX)) srcs.push({ x: p.cnTwX, y: p.y + p.h / 2 });
        srcs.forEach((s, si) => {
            for (let k = 0; k < 1; k++) {
                const a = Math.sin(p.cnLotusSpin * 0.09 + si * 1.7 + k * Math.PI) * 0.7;
                const sp = 6.5;
                spawnBullet(p, {
                    x: s.x - 3, y: s.y + cnDir(p) * 14 - 3, w: 6, h: 6, vx: Math.sin(a) * sp, vy: cnDir(p) * Math.cos(a) * sp,
                    dmg: cnDmg(p) * 0.15, hook: 'chrononeo', cnKind: 'lotus',
                });
            }
        });
    }
    if (p.cnLotus === 0) {
        const e = cnEnemy(p);
        const ly = e ? e.y + e.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
        // Nở Rộ: 3 cột pháo có khe hở để né (cảnh báo 1s), không còn phủ kín cả làn
        const off = Math.random() < 0.5 ? 0 : 1, r = 32;
        for (let i = 0; i < 3; i++) bodyEffects.push(new SkyStrike((i * 2 + off + 0.5) * canvas.width / 6, ly, p, cnDmg(p) * 0.7, r, 60));
        addFloatingText(canvas.width / 2, ly + cnDir(p) * -30, '🪷 NỞ RỘ!', '#ffd1f0', 16);
    }
}

// ---------- Phân Thân Nghịch Đảo (Full Evo) ----------
function cnTwinTick(p) {
    const e = cnEnemy(p);
    if (!Number.isFinite(p.cnTwX)) p.cnTwX = Math.max(20, Math.min(canvas.width - 20, p.x + p.w / 2 + 60));
    if (!p.cnTwSt) p.cnTwSt = p.cnSt === 'chrono' ? 'neo' : 'chrono';
    const neo = p.cnTwSt === 'neo';
    // AI: bám theo địch, giữ khoảng cách với bản thể
    let tx = e ? e.x + e.w / 2 + (neo ? Math.sin(cnTick / 40) * 40 : 0) : canvas.width / 2;
    const me = p.x + p.w / 2;
    if (Math.abs(tx - me) < 40) tx = me + (tx >= me ? 46 : -46);
    tx = Math.max(16, Math.min(canvas.width - 16, tx));
    let spd = p.speed * (neo ? 1.1 : 0.85) * (p.cnTwBoost > 0 ? 1.4 : 1);
    if (p.cnTwBoost > 0) p.cnTwBoost--;
    if (p.cnTwDash > 0) { p.cnTwDash--; p.cnTwX += p.cnTwDashDir * 5; }
    else p.cnTwX += Math.max(-spd, Math.min(spd, tx - p.cnTwX)) * 0.9;
    p.cnTwX = Math.max(14, Math.min(canvas.width - 14, p.cnTwX));
    p.cnTwVx = p.cnTwX - (p.cnTwLastX || p.cnTwX); p.cnTwLastX = p.cnTwX;
    // Bắn (50% sức mạnh) khi gần thẳng hàng
    if (p.cnTwCd > 0) p.cnTwCd--;
    const aligned = e && Math.abs(e.x + e.w / 2 - p.cnTwX) < 50;
    const from = { x: p.cnTwX, y: p.y + p.h / 2 + cnDir(p) * 14 };
    if (p.cnTwBurst > 0 && --p.cnTwBurstT <= 0) { p.cnTwBurst--; p.cnTwBurstT = 6; cnFireNeo(p, 0.5, from); }
    if (aligned && p.cnTwCd <= 0 && e.hp > 0) {
        if (neo) { cnFireNeo(p, 0.5, from); p.cnTwBurst = 1; p.cnTwBurstT = 6; p.cnTwCd = 30; }
        else { cnFireChrono(p, 0.5, from); p.cnTwCd = 50; }
        p.cnTwKick = neo ? 3 : 6;
    }
    if (p.cnTwKick > 0) p.cnTwKick--;
}

// ---------- Nạp đạn riêng 2 băng ----------
function cnReload(p) {
    // băng đang cầm
    const curMax = cnMaxOf(p, p.cnSt);
    p.maxAmmo = curMax;
    if (p.ammo > curMax) p.ammo = curMax;
    const relCur = p.cnSt === 'chrono' ? 150 : 90; // nạp đầy băng: 2.5s / 1.5s
    if (p.ammo < curMax && (p.cnIdle || 0) >= 45 && !(p.cnBurst > 0)) {
        p.cnRel = (p.cnRel || 0) + curMax / relCur;
        while (p.cnRel >= 1 && p.ammo < curMax) { p.ammo++; p.cnRel -= 1; }
    } else if (p.ammo >= curMax) p.cnRel = 0;
    // băng còn lại nạp ngầm
    const oSt = p.cnSt === 'chrono' ? 'neo' : 'chrono';
    const oMax = cnMaxOf(p, oSt);
    const relO = oSt === 'chrono' ? 150 : 90;
    if ((p.cnOther || 0) < oMax) {
        p.cnRelO = (p.cnRelO || 0) + oMax / relO;
        while (p.cnRelO >= 1 && p.cnOther < oMax) { p.cnOther++; p.cnRelO -= 1; }
    } else { p.cnOther = oMax; p.cnRelO = 0; }
}

// Đạn tự tìm của Liên Xạ: mục tiêu giữ trong WeakMap (chỉ host)
const CN_HOME = new WeakMap();
const CN_TARGETS = new WeakMap();
function cnAlive(o) { return o && o.active !== false && !(typeof o.hp === 'number' && o.hp <= 0); }
function cnSteer(p) {
    for (const b of p.bullets) {
        if (b.cnKind !== 'home') continue;
        let t = CN_HOME.get(b);
        if (!cnAlive(t)) { const e = cnEnemy(p); t = e && e.hp > 0 ? e : null; if (t) CN_HOME.set(b, t); }
        if (!t) continue;
        const tx = t.x + (t.w || 0) / 2, ty = t.y + (t.h || 0) / 2;
        const want = Math.atan2(ty - (b.y + b.h / 2), tx - (b.x + b.w / 2));
        let cur = Math.atan2(b.vy, b.vx);
        let d = want - cur;
        while (d <= -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        cur += Math.sign(d) * Math.min(Math.abs(d), 0.08 * homingTurnScale(b, p.id, tx, ty));
        const sp = Math.min(9, Math.hypot(b.vx, b.vy) + 0.12);
        b.vx = Math.cos(cur) * sp; b.vy = Math.sin(cur) * sp;
    }
}

// ==========================================
// Entity
// ==========================================
// Vòng sóng (xung kích / hoán đổi) — chỉ hình ảnh
class CnRing {
    constructor(x, y, owner, color, r) { this.x = x; this.y = y; this.owner = owner; this.color = color; this.maxR = r; this.life = 22; this.active = true; }
    update() { if (--this.life <= 0) this.active = false; }
    draw() {
        const k = 1 - this.life / 22;
        ctx.save();
        ctx.globalAlpha = (1 - k) * 0.9;
        ctx.strokeStyle = this.color; ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.shadowBlur = 14; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 8 + this.maxR * k, 0, Math.PI * 2); ctx.stroke();
        // vạch đồng hồ
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6 + k;
            const R = 8 + this.maxR * k;
            ctx.beginPath(); ctx.moveTo(this.x + Math.cos(a) * (R - 5), this.y + Math.sin(a) * (R - 5)); ctx.lineTo(this.x + Math.cos(a) * R, this.y + Math.sin(a) * R); ctx.stroke();
        }
        ctx.restore();
    }
}

// Radar Liên Xạ: quét dọc bản đồ, đánh dấu mục tiêu, xả đạn tự tìm trong 0.5s, giữ Không Thể Cản Phá
class CnRadar {
    constructor(owner, n) {
        this.owner = owner; this.n = n; this.fired = 0; this.t = 0; this.active = true;
        this.y0 = owner.y + owner.h / 2;
        this.dir = owner.id === 1 ? -1 : 1;
        this.marks = []; // [x, y, ...] để vẽ
        this.stun = cnE2(owner);
    }
    update() {
        const p = this.owner;
        this.t++;
        const tg = (CN_TARGETS.get(this) || []).filter(cnAlive);
        this.marks = [];
        tg.forEach(o => this.marks.push(o.x + (o.w || 0) / 2, o.y + (o.h || 0) / 2));
        // Không Thể Cản Phá (entity vẫn chạy khi xe bị đóng băng)
        if (p.cnUnstop > 0) {
            p.cnUnstop--;
            p.freezeTimer = 0; p.slowTimer = 0; p.kbX = 0;
            p._nextSpeedMult = 1;
        }
        const span = 30;
        while (this.fired < this.n && this.t >= 1 + this.fired * span / this.n && p.hp > 0) {
            const i = this.fired++;
            const target = tg.length ? tg[i % tg.length] : null;
            const m = cnMuzzle(p);
            const a = (i % 2 ? 1 : -1) * (0.35 + 0.5 * ((i * 0.37) % 1));
            const sp = 5;
            const b = spawnBullet(p, {
                x: m.x - 4, y: m.y - 4, w: 8, h: 8, vx: Math.sin(a) * sp, vy: this.dir * Math.cos(a) * sp,
                dmg: cnDmg(p) * 0.5, hook: 'chrononeo', cnKind: 'home', cnShred: true,
                cnStun: this.stun && i === this.n - 1,
            });
            if (target) CN_HOME.set(b, target);
            cnFx(p, { k: 'flash', x: m.x, y: m.y, life: 5, max: 5, c: CN_GOLD });
        }
        if (this.t > 60) this.active = false;
    }
    draw() {
        const k = Math.min(1, this.t / 24);
        const sweepY = this.y0 + this.dir * k * canvas.height;
        ctx.save();
        // dải quét
        const g = ctx.createLinearGradient(0, sweepY - this.dir * 40, 0, sweepY);
        g.addColorStop(0, 'rgba(245,185,66,0)'); g.addColorStop(1, 'rgba(245,185,66,0.45)');
        ctx.globalAlpha = Math.max(0, 1 - this.t / 60);
        ctx.fillStyle = g;
        ctx.fillRect(0, Math.min(sweepY, sweepY - this.dir * 40), canvas.width, 40);
        ctx.strokeStyle = CN_GOLD; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = CN_GOLD;
        ctx.beginPath(); ctx.moveTo(0, sweepY); ctx.lineTo(canvas.width, sweepY); ctx.stroke();
        // dấu khóa mục tiêu
        const t = Date.now() / 1000;
        for (let i = 0; i < this.marks.length; i += 2) {
            const x = this.marks[i], y = this.marks[i + 1];
            if ((y - this.y0) * this.dir > k * canvas.height + 10) continue;
            ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2);
            ctx.strokeStyle = '#ffdf8a'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
            for (let q = 0; q < 4; q++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -8); ctx.stroke(); }
            ctx.restore();
        }
        ctx.restore();
    }
}

// Ảnh Chiếu Bất Tử của Neo: không bị nhắm/không nhận sát thương, tự bắn 25% dame
class CnEcho {
    constructor(owner, life) {
        this.owner = owner; this.x = owner.x; this.y = owner.y; this.w = owner.w; this.h = owner.h;
        this.life = life; this.maxLife = life; this.cd = 20; this.active = true;
        this.slow = cnE2(owner);
    }
    update() {
        const p = this.owner;
        if (--this.life <= 0 || !p || p.hp <= 0) { this.active = false; return; }
        this.y = p.y; // luôn trên làn của chủ
        if (--this.cd <= 0) {
            this.cd = 30;
            const x = this.x + this.w / 2, y = this.y + this.h / 2 + cnDir(p) * 14;
            spawnBullet(p, {
                x: x - 2, y: y - 4, w: 4, h: 8, vx: 0, vy: cnDir(p) * 7.5,
                dmg: cnDmg(p) * 0.25, hook: 'chrononeo', cnKind: 'echo', cnSlow: this.slow ? 45 : 0,
            });
        }
    }
    draw() {
        if (typeof cnDrawGhostTank === 'function') cnDrawGhostTank(this.owner, this.x + this.w / 2, this.y + this.h / 2, 'neo', 0.45 * Math.min(1, this.life / 30), CN_VIOLET);
    }
}

// ==========================================
// Hook đạn
// ==========================================
BulletHooks.register('chrononeo', {
    hit(b, attacker, victim, dealt) {
        if (!victim) return;
        // Xé Giáp: bóc thêm 1 khiên
        if (b.cnShred && dealt === 0 && victim.shield > 0) {
            victim.shield--;
            addFloatingText(victim.x + victim.w / 2, victim.y - 22, 'XÉ GIÁP ⛓', CN_GOLD, 12);
            spawnSparkParticles(victim.x + victim.w / 2, victim.y + victim.h / 2, CN_GOLD, 8);
        }
        if (b.cnSlow) victim.cnSlowT = Math.max(victim.cnSlowT || 0, b.cnSlow);
        if (b.cnKind === 'home') victim.kbX = (victim.kbX || 0) + (Math.sign(b.vx) || (Math.random() < 0.5 ? -1 : 1)) * 3.5;
        if (b.cnStun) {
            victim.freezeTimer = Math.max(victim.freezeTimer || 0, 30);
            explosions.push(new Explosion(b.x, b.y, 45, 'rgba(245,185,66,', 0, attacker));
            addFloatingText(victim.x + victim.w / 2, victim.y - 22, 'CHOÁNG ✦', CN_GOLD, 13);
        }
    },
    obstacle(b, owner, obj, kind) {
        if (b.cnStun && kind !== 'crate') explosions.push(new Explosion(b.x, b.y, 40, 'rgba(245,185,66,', 0, owner));
    },
});

// ==========================================
// Hook nhân vật
// ==========================================
CharHooks.register('chrononeo', {
    setup() {
        if (typeof this.cnEra !== 'number') this.cnEra = 0;
        this.cnSt = 'chrono';
        this.maxAmmo = cnMaxC(this);
        this.cnOther = cnMaxN(this);
        this.reloadTime = 1e9; // tự quản lý nạp đạn 2 băng
        this.cnHold = 0; this.cnPrevS = false; this.cnSwCd = 0; this.cnGlass = 0;
        this.cnFireCd = 0; this.cnBurst = 0; this.cnBurstT = 0; this.cnIdle = 0; this.cnRel = 0; this.cnRelO = 0;
        this.cnDR = 0; this.cnBoost = 0; this.cnDashT = 0; this.cnUnstop = 0; this.cnWave2 = 0;
        this.cnPerfectT = 0; this.cnEmpCount = 0; this.cnLotus = 0; this.cnFx = [];
        this.cnKick = 0; this.cnSwFlash = 0; this.cnEmpFlash = 0; this.cnLvlFlash = 0; this.cnFace = 1;
        this.cnTwX = NaN; this.cnTwSt = 'neo'; this.cnTwCd = 30; this.cnTwBurst = 0; this.cnTwDash = 0; this.cnTwBoost = 0; this.cnTwKick = 0;
    },

    update(inp, eff) {
        if (this.hp <= 0) return;
        if (inp.l && !inp.r) this.cnFace = -1; else if (inp.r && !inp.l) this.cnFace = 1;
        if (this.cnSwCd > 0) this.cnSwCd--;
        if (this.cnFireCd > 0) this.cnFireCd--;
        if (this.cnDR > 0) this.cnDR--;
        if (this.cnBoost > 0) this.cnBoost--;
        if (this.cnPerfectT > 0) this.cnPerfectT--;
        if (this.cnKick > 0) this.cnKick--;
        if (this.cnSwFlash > 0) this.cnSwFlash--;
        if (this.cnEmpFlash > 0) this.cnEmpFlash--;
        if (this.cnLvlFlash > 0) this.cnLvlFlash--;
        this.cnIdle = (this.cnIdle || 0) + 1;
        if (this.cnGlass < cnGlassMax(this)) this.cnGlass++;
        if (this.cnDashT > 0) { this.cnDashT--; this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.cnDashDir * 5)); }
        // Neo: loạt 2 viên
        if (this.cnBurst > 0 && --this.cnBurstT <= 0 && this.ammo > 0) {
            this.cnBurst--; cnFireNeo(this, 1, null, 3); this.ammo--; this.cnIdle = 0;
        }
        if (this.cnWave2 > 0 && --this.cnWave2 === 0) cnNeoCone(this);
        // FX
        if (this.cnFx && this.cnFx.length) { this.cnFx.forEach(f => f.life--); this.cnFx = this.cnFx.filter(f => f.life > 0); }
        // làm chậm 35% lên địch trúng đạn Neo cường hóa / Ảnh Chiếu (Evo 2)
        const e = cnEnemy(this);
        if (e && e.cnSlowT > 0) { e.cnSlowT--; addStatusSlow(e, 0.65); }
        cnSteer(this);
        cnFarmWatch(this);
        cnReload(this);
        if (cnFull(this)) cnTwinTick(this);
        if (this.cnLotus > 0) cnLotusTick(this);
    },

    speed(s) {
        let k = 1;
        if (this.cnSt === 'neo') k *= 1.1;
        if (this.cnBoost > 0) k *= 1.4;
        return s * k;
    },

    shoot(inp) {
        // Bot: tự đổi thế khi băng hiện tại cạn
        if (cnIsBot(this) && this.cnSwCd <= 0 && this.ammo <= 0 && (this.cnOther || 0) > 1 && !(this.cnBurst > 0)) cnSwitch(this, inp);
        if (inp.s) {
            this.cnHold++;
            if (this.cnHold === CN_HOLD) {
                if (this.cnSwCd <= 0) cnSwitch(this, inp);
                else { cnSfx('click'); this.cnCdDeny = 20; }
            }
        } else {
            if (this.cnPrevS && this.cnHold < CN_HOLD) {
                if (this.cnGlass >= cnGlassMax(this) && !(this.cnSt === 'neo' && this.cnBurst > 0)) {
                    cnEmpower(this);
                    this.cnIdle = 0; this.cnFireCd = 20;
                } else if (this.cnFireCd > 0) {
                    // đang hồi phát bắn
                } else if (this.ammo <= 0) {
                    cnSfx('click');
                } else if (this.cnSt === 'chrono') {
                    cnFireChrono(this); this.ammo--; this.cnFireCd = 40; this.cnIdle = 0;
                } else {
                    cnFireNeo(this, 1, null, -3); this.ammo--; this.cnIdle = 0;
                    this.cnBurst = 1; this.cnBurstT = 6; this.cnFireCd = 24;
                }
            }
            this.cnHold = 0;
        }
        if (this.cnCdDeny > 0) this.cnCdDeny--;
        this.cnPrevS = !!inp.s;
        return true;
    },

    beforeDamage(amount, attacker, options) {
        // Chrono vừa chuyển thế: giảm 25% sát thương 1.5s
        if (this.cnDR > 0 && !(options && options._cnDR)) {
            this.takeDamage(amount * 0.75, attacker, Object.assign({}, options || {}, { _cnDR: true }));
            return true;
        }
        return false;
    },

    roundEnd() {
        this.cnEra = Math.min(CN_ERA_MAX, (this.cnEra || 0) + 3);
    },
});
