// ==========================================
// Tùy Biến (customize) — Logic: xe lắp ghép mô-đun
// ------------------------------------------
// Mỗi hiệp nhận Điểm Tùy Chỉnh (CP). Tiêu CP để:
//   - Đổi Lối Bắn / Dạng Đạn / Kích Thước (1 CP) — chỉ lắp 1 loại mỗi nhóm
//   - Nâng cấp Lối Bắn / Dạng Đạn đang lắp (Lv), cấp giữ nguyên khi đổi loại
//   - Lắp & nâng cấp Tính Chất Đạn (nhiều loại cùng lúc, mỗi loại có cấp)
//   - Chỉ Số (Máu, Dame, Đạn, Tốc, Nạp, Khiên) nâng mãi -> CP dư luôn có chỗ tiêu
// Toàn bộ trạng thái nằm trong p.cuData (JSON thuần) -> đồng bộ online qua loadout.
// ==========================================

const CU_SLOT_MAX = 3;           // cấp tối đa của Lối Bắn / Dạng Đạn (Gói VIP: +1)
const CU_PARTS = {
    fire: [
        { id: 'tap', name: 'Tap', icon: '🎯', lv: L => `Nhấp bắn từng viên. ${4 + L} đạn, dame x${(1 + 0.15 * L).toFixed(2)}, hồi ${300 - 40 * L}ms.` },
        { id: 'burst', name: 'Loạt Đạn', icon: '🔫', lv: L => `Nhấp bắn loạt ${3 + L} viên (mỗi viên 50% dame). ${3 + Math.floor(L / 2)} băng.` },
        { id: 'shotgun', name: 'Shotgun', icon: '💥', lv: L => `Bắn chùm ${5 + L} tia tỏa, mỗi tia ${Math.round((45 + 5 * L))}% dame. ${3 + Math.floor(L / 2)} đạn.` },
        { id: 'smg', name: 'SMG', icon: '⚙️', lv: L => `Giữ để sấy. ${12 + 4 * L} đạn, mỗi viên ${35 + 4 * L}% dame, nhịp ${Math.max(3, 6 - L)} tick.` },
        { id: 'charge', name: 'Tích Tụ', icon: '🔋', lv: L => `Giữ tụ lực ${((90 - 15 * L) / 60).toFixed(2)}s, nhả đạn to tới x${(3 + 0.4 * L).toFixed(1)} dame. ${3 + Math.floor(L / 2)} đạn.` },
        { id: 'ram', name: 'Tiến Công', icon: '🐏', lv: L => `Không bắn. Nhấn để lao tông địch: x${(2.5 + 0.3 * L).toFixed(1)} dame, hồi ${((150 - 25 * L) / 60).toFixed(1)}s.` },
    ],
    bullet: [
        { id: 'round', name: 'Đạn Tròn', icon: '⚪', lv: L => `Đạn cơ bản, cân bằng. Lv: +${10 * L}% dame, +${8 * L}% tốc đạn.` },
        { id: 'laser', name: 'Đạn Thẳng', icon: '➖', lv: L => `Bay cực nhanh, mảnh. +${10 * L}% dame.` },
        { id: 'sword', name: 'Đạn Kiếm', icon: '🗡️', lv: L => `Lưỡi kiếm nhanh, hitbox dài. +${10 * L}% dame.` },
        { id: 'cannon', name: 'Đạn Pháo', icon: '💣', lv: L => `Chậm, x1.4 dame, nổ khi tới làn địch / chạm mục tiêu. +${10 * L}% dame.` },
        { id: 'split', name: 'Đạn Tách', icon: '✳️', lv: L => `Tới giữa sân tách thành ${3 + Math.floor(L / 2)} mảnh tỏa (mỗi mảnh 60%). +${10 * L}% dame.` },
    ],
    trait: [
        { id: 'explosive', name: 'Nổ', icon: '🔥', max: 3, lv: L => `Chạm mục tiêu nổ lan bán kính ${30 + 8 * L}, ${Math.round((0.3 + 0.12 * L) * 100)}% dame.` },
        { id: 'piercing', name: 'Xuyên', icon: '🗲', max: 3, lv: L => 'Xuyên vật cản & địch' + (L > 1 ? `, +${12 * (L - 1)}% dame.` : '.') },
        { id: 'crit', name: 'Chí Mạng', icon: '❗', max: 3, lv: L => `${10 + 8 * L}% cơ hội gây x2 dame.` },
        { id: 'leech', name: 'Hút Máu', icon: '🩸', max: 3, lv: L => `Mỗi lần trúng hồi ${(0.12 * L).toFixed(2)} Máu.` },
        { id: 'twin', name: 'Song Nòng', icon: '⏸️', max: 2, lv: L => `Mỗi phát bắn kèm ${L} viên phụ song song (35% dame).` },
        { id: 'hitscan', name: 'Hitscan', icon: '⚡', max: 1, lv: () => 'Trúng tức thì sau tia cảnh báo 0.5s (Tap / Loạt / Shotgun / Tích Tụ).' },
        { id: 'hz_acid', name: 'Vũng Axit', icon: '🧪', max: 3, zone: true, lv: L => `Để lại vũng ăn mòn & suy yếu (cỡ ${30 + 6 * L}, ${((150 + 45 * L) / 60).toFixed(1)}s).` },
        { id: 'hz_ice', name: 'Vũng Băng', icon: '❄️', max: 3, zone: true, lv: L => `Để lại vũng làm chậm sâu (cỡ ${30 + 6 * L}, ${((150 + 45 * L) / 60).toFixed(1)}s).` },
        { id: 'hz_fire', name: 'Vũng Lửa', icon: '♨️', max: 3, zone: true, lv: L => `Để lại vũng thiêu đốt (cỡ ${30 + 6 * L}, ${((150 + 45 * L) / 60).toFixed(1)}s).` },
        { id: 'hz_silence', name: 'Vùng Câm Lặng', icon: '🔇', max: 3, zone: true, lv: L => `Đứng vào bị khóa nút bắn (cỡ ${30 + 6 * L}, ${((150 + 45 * L) / 60).toFixed(1)}s).` },
        { id: 'homing', name: 'Tự Ngắm', icon: '🧭', max: 3, vip: true, lv: L => `Đạn bẻ lái về phía địch (lực bẻ ${L}/4).` },
        { id: 'sticky', name: 'Đạn Hút', icon: '🧲', max: 3, vip: true, lv: L => `Trúng địch kéo họ về phía bạn (lực ${6 + 2 * L}) + làm chậm.` },
        { id: 'bounce', name: 'Nảy Tường', icon: '↩️', max: 3, vip: true, lv: L => `Đạn bay chéo, nảy tường ${L + 1} lần, mỗi lần +${(0.2 + 0.1 * L).toFixed(1)} dame.` },
    ],
    stat: [
        { id: 'st_hp', name: 'Giáp', icon: '❤️', lv: L => `+${L} Máu tối đa.` },
        { id: 'st_dmg', name: 'Hỏa Lực', icon: '⚔️', lv: L => `+${8 * L}% sát thương.` },
        { id: 'st_ammo', name: 'Băng Đạn', icon: '📦', lv: L => `+${L} đạn (SMG: +${3 * L}).` },
        { id: 'st_speed', name: 'Động Cơ', icon: '💨', max: 6, lv: L => `+${5 * L}% tốc chạy.` },
        { id: 'st_reload', name: 'Nạp Nhanh', icon: '⏱️', max: 6, lv: L => `-${8 * L}% thời gian nạp đạn.` },
        { id: 'st_shield', name: 'Khiên', icon: '🛡️', max: 3, lv: L => `Vào hiệp với ${L} khiên.` },
    ],
    size: [
        { id: 'normal', name: 'Chuẩn', icon: '◻️', lv: () => 'Xe 30x30.' },
        { id: 'small', name: 'Thu Nhỏ', icon: '▫️', lv: () => 'Xe 24x24, tốc độ +30%, -1 Máu.' },
        { id: 'large', name: 'Phóng To', icon: '⬛', lv: () => 'Xe 38x38, tốc độ -20%, +4 Máu.' },
    ],
    passive: [
        { id: 'revive', name: 'Thập Tử Nhất Sinh', icon: '✝️', lv: () => 'Về 0 HP hồi sinh 1 lần/hiệp với 2 Máu kèm 3s bất tử.' },
        { id: 'vo_anh', name: 'Vô Ảnh', icon: '👻', lv: () => 'Mỗi 8s tự tàng hình miễn nhiễm 1.5s.' },
        { id: 'tap_trung', name: 'Tập Trung Tuyệt Đối', icon: '🧘', lv: () => 'Mất khiên -> né mọi đòn 3s.' },
        { id: 'phan_luc', name: 'Phản Lực', icon: '🌀', lv: () => 'Trúng địch đẩy lùi họ; mỗi 3 lần trúng +1 khiên.' },
    ],
};
const CU_PART_BY_ID = {};
Object.values(CU_PARTS).forEach(list => list.forEach(x => CU_PART_BY_ID[x.id] = x));

function cuNewData() {
    return { fire: 'tap', bullet: 'round', size: 'normal', lv: { fire: 0, bullet: 0 }, traits: {}, stats: {}, passive: null, cp: 0, vip: false };
}
// Dữ liệu cũ (traits dạng mảng / lối bắn Hold đã bỏ) -> chuẩn mới
function cuNormalize(p) {
    let d = p.cuData;
    if (!d) d = p.cuData = cuNewData();
    if (Array.isArray(d.traits)) { const o = {}; d.traits.forEach(t => o[t] = 1); d.traits = o; }
    if (!d.traits) d.traits = {};
    if (!d.stats) d.stats = {};
    if (!d.lv) d.lv = { fire: 0, bullet: 0 };
    if (!CU_PART_BY_ID[d.fire] || d.fire === 'hold') d.fire = 'tap';
    if (!CU_PART_BY_ID[d.bullet]) d.bullet = 'round';
    return d;
}
function cuPower(p) { return p.hasUpgrade('evo_cu_2') ? 1.3 : 1; }
function cuVip(p) { return p.hasUpgrade('evo_cu_1'); }
function cuLv(p, t) { return (p.cuData && p.cuData.traits && p.cuData.traits[t]) || 0; }
function cuHas(p, t) { return cuLv(p, t) > 0; }
function cuStat(p, s) { return (p.cuData && p.cuData.stats && p.cuData.stats[s]) || 0; }
function cuSlotLv(p, g) { return (p.cuData && p.cuData.lv && p.cuData.lv[g]) || 0; }
function cuHazard(p) { const t = Object.keys(p.cuData.traits).find(x => x.startsWith('hz_')); return t ? t.slice(3) : null; }
function cuSlotMax(p) { return CU_SLOT_MAX + (cuVip(p) ? 1 : 0); }
function cuTraitMax(p, id) { const m = CU_PART_BY_ID[id].max || 1; return m > 1 && cuVip(p) ? m + 1 : m; }
function cuStatMax(p, id) { return CU_PART_BY_ID[id].max || 99; }

// Gói VIP: lần đầu sở hữu -> mọi mô-đun đã lắp +1 cấp miễn phí, +2 CP
function cuApplyVip(p) {
    const d = cuNormalize(p);
    if (!cuVip(p) || d.vip) return false;
    d.vip = true;
    d.lv.fire = Math.min(cuSlotMax(p), d.lv.fire + 1);
    d.lv.bullet = Math.min(cuSlotMax(p), d.lv.bullet + 1);
    for (const t of Object.keys(d.traits)) d.traits[t] = Math.min(cuTraitMax(p, t), d.traits[t] + 1);
    d.cp += 2;
    return true;
}

// Thông tin 1 lựa chọn cho shop: trạng thái, giá, hiệu ứng hiện tại / cấp kế
//   state: 'buy' | 'swap' | 'up' | 'max' | 'locked' | 'pick' | 'on'
function cuOptInfo(p, group, id) {
    const d = p.cuData, part = CU_PART_BY_ID[id];
    if (group === 'fire' || group === 'bullet') {
        const L = d.lv[group];
        if (d[group] === id) {
            if (L >= cuSlotMax(p)) return { state: 'max', lv: L, max: cuSlotMax(p), now: part.lv(L) };
            return { state: 'up', lv: L, max: cuSlotMax(p), cost: 1 + Math.floor(L / 2), now: part.lv(L), next: part.lv(L + 1) };
        }
        return { state: 'swap', lv: L, max: cuSlotMax(p), cost: 1, now: part.lv(L), note: L ? `Giữ cấp Lv${L}` : '' };
    }
    if (group === 'size') return d.size === id ? { state: 'on', now: part.lv(0) } : { state: 'swap', cost: 1, now: part.lv(0) };
    if (group === 'passive') return d.passive === id ? { state: 'on', now: part.lv(0) } : { state: 'pick', cost: 0, now: part.lv(0) };
    if (group === 'trait') {
        if (part.vip && !cuVip(p)) return { state: 'locked', now: part.lv(1), note: 'Cần Gói VIP' };
        const L = d.traits[id] || 0, M = cuTraitMax(p, id);
        if (L >= M) return { state: 'max', lv: L, max: M, now: part.lv(L) };
        if (!L) {
            const rep = part.zone ? Object.keys(d.traits).find(t => t.startsWith('hz_')) : null;
            return { state: 'buy', lv: 0, max: M, cost: 1, now: part.lv(1), note: rep ? `Thay ${CU_PART_BY_ID[rep].name}` : '' };
        }
        return { state: 'up', lv: L, max: M, cost: 1 + Math.floor(L / 2), now: part.lv(L), next: part.lv(L + 1) };
    }
    if (group === 'stat') {
        const L = d.stats[id] || 0, M = cuStatMax(p, id);
        if (L >= M) return { state: 'max', lv: L, max: M, now: part.lv(L) };
        return { state: L ? 'up' : 'buy', lv: L, max: M < 99 ? M : null, cost: (id === 'st_shield' ? 2 : 1) + Math.floor(L / 3), now: L ? part.lv(L) : '', next: part.lv(L + 1) };
    }
    return { state: 'locked' };
}

// Mua / lắp / nâng 1 mô-đun
function cuApplyPart(p, group, id) {
    const d = cuNormalize(p);
    const info = cuOptInfo(p, group, id);
    if (group === 'passive') {
        if (!(p.hasUpgrade('evo_cu_1') && p.hasUpgrade('evo_cu_2')) || info.state !== 'pick') return false;
        d.passive = id; // Nội tại Full Evo: chọn miễn phí, đổi được
        return true;
    }
    if (!['buy', 'swap', 'up'].includes(info.state) || d.cp < info.cost) return false;
    if (group === 'fire' || group === 'bullet') {
        if (info.state === 'up') d.lv[group]++; else d[group] = id;
    } else if (group === 'size') d.size = id;
    else if (group === 'trait') {
        if (info.state === 'buy' && CU_PART_BY_ID[id].zone) Object.keys(d.traits).forEach(t => { if (t.startsWith('hz_')) delete d.traits[t]; }); // 1 loại vùng
        d.traits[id] = (d.traits[id] || 0) + 1;
    } else if (group === 'stat') d.stats[id] = (d.stats[id] || 0) + 1;
    d.cp -= info.cost;
    return true;
}

// Bot / nút TỰ LẮP: tiêu hết CP theo thứ tự ưu tiên hợp lý
function cuAutoSpend(p) {
    const d = cuNormalize(p);
    let n = 0;
    // Xe mới (Tap Lv0, chưa lắp gì) -> đổi sang Loạt Đạn trước
    if (d.fire === 'tap' && !d.lv.fire && !Object.keys(d.traits).length && d.cp >= 2) { cuApplyPart(p, 'fire', 'burst'); n++; }
    const plan = [['trait', 'explosive'], ['fire'], ['trait', 'crit'], ['stat', 'st_dmg'], ['bullet'],
        ['trait', 'leech'], ['trait', 'twin'], ['trait', 'homing'], ['stat', 'st_hp'], ['stat', 'st_shield'], ['stat', 'st_reload']];
    for (let guard = 0; guard < 30 && d.cp > 0; guard++) {
        let bought = false; // mỗi vòng mua mỗi món 1 lần -> dàn đều, không dồn hết vào 1 món
        for (const [g, id0] of plan) {
            if (d.cp <= 0) break;
            const id = id0 || d[g]; // Lối Bắn / Dạng Đạn: nâng cấp loại đang lắp
            if (cuApplyPart(p, g, id)) { bought = true; n++; }
        }
        if (!bought) { // còn dư: dồn vào chỉ số không giới hạn
            if (!cuApplyPart(p, 'stat', (d.stats.st_hp || 0) > (d.stats.st_dmg || 0) ? 'st_dmg' : 'st_hp')) break;
            n++;
        }
    }
    const full = p.hasUpgrade('evo_cu_1') && p.hasUpgrade('evo_cu_2');
    if (full && !d.passive) { d.passive = 'revive'; n++; }
    return n;
}

// Kiểu bắn cho Smart Bot theo lối bắn đang lắp
function cuBotFireStyle(p) {
    const f = p.cuData && p.cuData.fire;
    if (f === 'smg') return 'stream';
    if (f === 'charge') return 'hold:' + Math.max(45, 90 - 15 * cuSlotLv(p, 'fire'));
    return 'tap';
}

// Bắn 1 viên theo dạng đạn & tính chất đã lắp
function cuSpawn(p, ang = 0, dmgMult = 1, sizeMult = 1, opt = {}) {
    const d = p.cuData;
    const dirY = p.id === 1 ? -1 : 1;
    const kind = opt.kind || d.bullet;
    const T = { round: [4.8, 6, 6], laser: [11, 4, 16], sword: [8, 6, 18], cannon: [3.6, 11, 11], split: [4.4, 8, 8] }[kind] || [4.8, 6, 6];
    const Lb = d.lv.bullet;
    const spd = T[0] * (1 + 0.08 * Lb) * (opt.spdMult || 1);
    const w = T[1] * sizeMult, h = T[2] * sizeMult;
    const enemy = p === p1 ? p2 : p1;
    // Nảy Tường: đạn thẳng được bắn chéo luân phiên để chạm mép sân
    if (cuHas(p, 'bounce') && ang === 0 && !opt.sub) { p.cuBounceSide = -(p.cuBounceSide || 1); ang = 0.28 * p.cuBounceSide; }
    let dmg = p.damage * dmgMult * (kind === 'cannon' ? 1.4 : 1) * (1 + 0.1 * Lb);
    if (cuHas(p, 'piercing')) dmg *= 1 + 0.12 * (cuLv(p, 'piercing') - 1);
    const crit = !opt.noCrit && cuHas(p, 'crit') && Math.random() < 0.1 + 0.08 * cuLv(p, 'crit');
    if (crit) dmg *= 2;
    const ox = opt.ox || 0;
    const b = spawnBullet(p, {
        x: (opt.x !== undefined ? opt.x : p.x + p.w / 2) + ox - w / 2,
        y: opt.y !== undefined ? opt.y : (dirY < 0 ? p.y - h : p.y + p.h), w, h,
        vx: Math.sin(ang) * spd, vy: dirY * Math.cos(ang) * spd,
        dmg, isPiercing: cuHas(p, 'piercing'), isLazer: kind === 'laser',
        hook: 'customize', cuKind: kind, swordDir: dirY, cuBounces: 0, cuCrit: crit,
        cuHome: cuHas(p, 'homing') ? 0.02 + 0.012 * cuLv(p, 'homing') : 0,
        cuSplit: kind === 'split' && !opt.sub, cuStartY: p.y + p.h / 2,
        cuTargetY: enemy ? enemy.y + enemy.h / 2 : null,
    });
    // Song Nòng: viên phụ song song
    if (!opt.sub && cuHas(p, 'twin')) {
        const n = cuLv(p, 'twin');
        for (let k = 1; k <= n; k++) {
            const side = k % 2 ? 1 : -1, off = side * (8 + 5 * Math.ceil(k / 2) - 5 + p.w * 0.25);
            cuSpawn(p, ang, dmgMult * 0.35, sizeMult * 0.8, { sub: true, ox: off, noCrit: true });
        }
    }
    return b;
}

// Hiệu ứng khi đạn chạm (mục tiêu / vật cản / mép sân)
function cuImpact(p, x, y, victim, dealt) {
    if (!p || !p.cuData) return; // đạn bị phản (Cuồng Phong) đổi chủ
    const pw = cuPower(p);
    const ex = cuLv(p, 'explosive');
    if (ex || p.cuData.bullet === 'cannon') {
        const L = ex + (p.cuData.bullet === 'cannon' ? 1 : 0); // Đạn Pháo: nổ sẵn như Nổ Lv1, cộng dồn với Nổ
        explosions.push(new Explosion(x, y, (30 + 8 * L) * pw, 'rgba(255, 140, 0,', (0.3 + 0.12 * L) * p.damage * pw, p));
    }
    const hz = cuHazard(p);
    if (hz) { const L = cuLv(p, 'hz_' + hz); bodyEffects.push(new BodyZone(x, y, (30 + 6 * L) * pw, hz, p, 150 + 45 * L, pw * (1 + 0.15 * (L - 1)))); }
    if (victim && victim !== p && victim.takeDamage) {
        if (cuHas(p, 'sticky')) {
            victim.kbX = Math.sign((p.x + p.w / 2) - (victim.x + victim.w / 2)) * (6 + 2 * cuLv(p, 'sticky')) * pw;
            victim.slowTimer = Math.max(victim.slowTimer || 0, 40);
        }
        if (cuHas(p, 'leech') && p.hp > 0 && (dealt === undefined || dealt > 0)) {
            p.hp = Math.min(p.maxHp, p.hp + 0.12 * cuLv(p, 'leech') * pw);
        }
        if (p.cuData.passive === 'phan_luc') {
            victim.kbX = Math.sign((victim.x + victim.w / 2) - (p.x + p.w / 2)) * 8;
            p.cuHitCount = (p.cuHitCount || 0) + 1;
            if (p.cuHitCount % 3 === 0) { p.shield = (p.shield || 0) + 1; addFloatingText(p.x + p.w / 2, p.y - 12, '+1 KHIÊN ẢO', '#00f0ff', 12); }
        }
    }
}

BulletHooks.register('customize', {
    hit(b, attacker, victim, dealt) {
        if (b.cuCrit) addFloatingText(victim.x + victim.w / 2, victim.y - 8, 'CHÍ MẠNG!', '#facc15', 12);
        cuImpact(attacker, b.x, b.y, victim, dealt);
        if (b.cuKind === 'cannon') b.cuDone = true;
    },
    obstacle(b, owner, obj) { cuImpact(owner, b.x, b.y, null); },
    edge(b, owner) {
        if (b.cuDone || !owner.cuData) return undefined; // đạn pháo đã nổ / đạn bị phản
        // Nảy tường (VIP): chỉ mép trái/phải
        const maxB = cuLv(owner, 'bounce') + 1;
        if (cuHas(owner, 'bounce') && (b.cuBounces || 0) < maxB && (b.x <= 0 || b.x + b.w >= canvas.width) && b.y > 0 && b.y < canvas.height) {
            b.vx = -b.vx || (b.x <= 0 ? 2 : -2);
            b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x));
            b.cuBounces = (b.cuBounces || 0) + 1;
            b.dmg += (0.2 + 0.1 * cuLv(owner, 'bounce')) * cuPower(owner);
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, '#a3e635', 5);
            return 'keep';
        }
        cuImpact(owner, b.x + b.w / 2, b.y + b.h / 2, null);
        return undefined;
    },
    draw(b) { cuDrawBullet(b); },
});

CharHooks.register('customize', {
    setup() {
        const d = cuNormalize(this);
        cuApplyVip(this);
        const L = d.lv.fire;
        const fire = d.fire;
        this.maxAmmo = { tap: 4 + L, burst: 3 + Math.floor(L / 2), shotgun: 3 + Math.floor(L / 2), smg: 12 + 4 * L, charge: 3 + Math.floor(L / 2), ram: 0 }[fire];
        if (fire !== 'ram') this.maxAmmo += cuStat(this, 'st_ammo') * (fire === 'smg' ? 3 : 1);
        if (fire === 'smg') this.damage *= 0.35 + 0.04 * L;
        if (fire === 'tap') this.damage *= 1 + 0.15 * L;
        this.damage *= 1 + 0.08 * cuStat(this, 'st_dmg');
        this.maxHp += cuStat(this, 'st_hp');
        this.speed *= 1 + 0.05 * cuStat(this, 'st_speed');
        this.reloadTime *= Math.max(0.4, 1 - 0.08 * cuStat(this, 'st_reload'));
        if (cuStat(this, 'st_shield')) this.shield = Math.max(this.shield || 0, cuStat(this, 'st_shield'));
        if (d.size === 'small') { this.w = 24; this.h = 24; this.speed *= 1.3; this.maxHp = Math.max(1, this.maxHp - 1); }
        if (d.size === 'large') { this.w = 38; this.h = 38; this.speed *= 0.8; this.maxHp += 4; }
        this.cuCharge = 0; this.cuDash = 0; this.cuDashCd = 0; this.cuPrevS = false; this.cuBurst = 0; this.cuBurstT = 0;
        this.cuSmgTick = 0; this.cuReviveUsed = false; this.cuVoAnh = 0; this.cuFocus = 0; this.cuHitCount = 0;
        this.cuHomeY = null;
    },

    update() {
        const d = this.cuData;
        const enemy = this === p1 ? p2 : p1;
        const midY = canvas.height / 2;
        const spawned = [];
        for (const b of this.bullets) {
            if (b.hook !== 'customize') continue;
            // Tự Ngắm: bẻ lái từ từ về phía địch
            if (b.cuHome && enemy && enemy.hp > 0 && !b.cuDone) {
                const ta = Math.atan2(enemy.y + enemy.h / 2 - (b.y + b.h / 2), enemy.x + enemy.w / 2 - (b.x + b.w / 2));
                let ca = Math.atan2(b.vy, b.vx), df = ta - ca;
                while (df <= -Math.PI) df += Math.PI * 2;
                while (df > Math.PI) df -= Math.PI * 2;
                const toward = (b.vy < 0) === (enemy.y < b.y); // chỉ bẻ khi địch còn ở phía trước
                if (toward) { ca += Math.sign(df) * Math.min(Math.abs(df), b.cuHome * homingTurnScale(b, this.id, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2)); const s = Math.hypot(b.vx, b.vy); b.vx = Math.cos(ca) * s; b.vy = Math.sin(ca) * s; }
            }
            // Đạn Tách: qua giữa sân thì tách thành nhiều mảnh tỏa
            if (b.cuSplit && ((b.vy < 0 && b.y < midY) || (b.vy > 0 && b.y > midY))) {
                b.cuSplit = false;
                const n = 3 + Math.floor(d.lv.bullet / 2), base = Math.atan2(b.vx, Math.abs(b.vy));
                b.dmg *= 0.6; b.w = b.h = 6;
                for (let k = 1; k < n; k++) {
                    const a = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.32;
                    spawned.push([a, b.dmg, b.x + b.w / 2, b.y]);
                }
                if (typeof spawnSparkParticles === 'function') spawnSparkParticles(b.x + b.w / 2, b.y, '#e879f9', 6);
            }
            // Đạn pháo nổ khi tới làn đối thủ
            if (b.cuKind === 'cannon' && !b.cuDone && b.cuTargetY !== null &&
                ((b.vy < 0 && b.y + b.h / 2 <= b.cuTargetY) || (b.vy > 0 && b.y + b.h / 2 >= b.cuTargetY))) {
                b.cuDone = true; b.active = false;
                cuImpact(this, b.x + b.w / 2, b.y + b.h / 2, null);
                b.x = -999; // ra khỏi sân -> bị xoá ở lượt cập nhật đạn kế tiếp
            }
        }
        for (const [a, dmg, x, y] of spawned) {
            const nb = cuSpawn(this, a, 1, 1, { sub: true, kind: 'split', x, y, noCrit: true });
            nb.dmg = dmg; nb.w = nb.h = 6; nb.cuSplit = false; nb.cuHome = 0;
        }
        // Loạt Đạn: các viên còn lại của loạt
        if (this.cuBurst > 0 && --this.cuBurstT <= 0) {
            this.cuBurst--; this.cuBurstT = 5;
            cuFireOne(this, 0.5, 0.9);
        }
        // Lao húc (Tiến Công)
        if (this.cuDashCd > 0) this.cuDashCd--;
        if (this.cuHomeY === null) this.cuHomeY = this.y;
        if (this.cuDash > 0) {
            this.cuDash--;
            const dirY = this.id === 1 ? -1 : 1;
            this.y += dirY * 14;
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                const dealt = enemy.takeDamage((2.5 + 0.3 * d.lv.fire) * this.damage * cuPower(this), this);
                enemy.kbX = Math.sign((enemy.x + enemy.w / 2) - (this.x + this.w / 2) || 1) * 10;
                cuImpact(this, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy, dealt);
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 40, '#ff5722', 0, this));
                this.cuDash = 0;
            }
            if (this.y < 20 || this.y + this.h > canvas.height - 22) this.cuDash = 0;
        } else if (Math.abs(this.y - this.cuHomeY) > 0.5) {
            this.y += (this.cuHomeY - this.y) * 0.2;
            if (Math.abs(this.y - this.cuHomeY) < 1) this.y = this.cuHomeY;
        }
        // Nội tại Full Evo
        if (d.passive === 'vo_anh' && ++this.cuVoAnh >= 480) { this.cuVoAnh = 0; this.invincibleTimer = Math.max(this.invincibleTimer || 0, 90); addFloatingText(this.x + this.w / 2, this.y - 14, 'VÔ ẢNH 👻', '#cbd5e1', 13); }
        if (this.cuFocus > 0) this.cuFocus--;
    },

    shoot(inp, now) {
        const d = this.cuData;
        const L = d.lv.fire;
        const pressed = inp.s && !this.cuPrevS;
        const released = !inp.s && this.cuPrevS;
        this.cuPrevS = !!inp.s;
        const snd = () => { if (soundSystem && !soundSystem.muted) soundSystem.playShoot('normal'); };
        switch (d.fire) {
            case 'tap':
                if (pressed && this.ammo > 0 && now - this.lastShot > 300 - 40 * L) { cuFireOne(this); this.ammo--; this.lastShot = now; snd(); }
                break;
            case 'burst':
                if (pressed && this.ammo > 0 && this.cuBurst <= 0 && now - this.lastShot > 450) {
                    cuFireOne(this, 0.5, 0.9); this.cuBurst = 2 + L; this.cuBurstT = 5;
                    this.ammo--; this.lastShot = now; snd();
                }
                break;
            case 'shotgun':
                if (pressed && this.ammo > 0 && now - this.lastShot > 500) {
                    const n = 5 + L, per = 0.45 + 0.05 * L;
                    if (cuHas(this, 'hitscan')) cuFireOne(this, per * n * 0.6);
                    else for (let k = 0; k < n; k++) cuSpawn(this, (k - (n - 1) / 2) * (0.5 / (n - 1)), per);
                    this.ammo--; this.lastShot = now; snd();
                }
                break;
            case 'smg':
                if (inp.s && this.ammo > 0 && ++this.cuSmgTick % Math.max(3, 6 - L) === 1) { cuSpawn(this, (Math.random() - 0.5) * 0.12, 1, 0.8); this.ammo--; this.lastShot = now; }
                if (!inp.s) this.cuSmgTick = 0;
                break;
            case 'charge': {
                const full = 90 - 15 * L;
                if (inp.s && this.ammo > 0) this.cuCharge = Math.min(full, this.cuCharge + 1);
                if (released && this.cuCharge > 0 && this.ammo > 0) {
                    const k = this.cuCharge / full;
                    cuFireOne(this, 1 + (2 + 0.4 * L) * k, 1 + 1.6 * k);
                    this.ammo--; this.lastShot = now; this.cuCharge = 0; snd();
                }
                break;
            }
            case 'ram':
                if (pressed && this.cuDash <= 0 && this.cuDashCd <= 0) {
                    this.cuHomeY = this.y; this.cuDash = 40; this.cuDashCd = 150 - 25 * L;
                    if (soundSystem && !soundSystem.muted) soundSystem.playDash();
                }
                break;
        }
        return true;
    },

    beforeDamage() {
        if (this.cuData.passive === 'tap_trung' && this.cuFocus > 0) { addFloatingText(this.x + this.w / 2, this.y - 10, 'NÉ!', '#7dd3fc', 13); return true; }
        return false;
    },
    shieldBreak() { if (this.cuData.passive === 'tap_trung') this.cuFocus = 180; },
    beforeLethal() {
        if (this.cuData.passive === 'revive' && !this.cuReviveUsed) {
            this.cuReviveUsed = true; this.hp = Math.min(this.maxHp, 2); this.invincibleTimer = 180;
            addFloatingText(this.x + this.w / 2, this.y - 22, 'THẬP TỬ NHẤT SINH!', '#ffd700', 15);
            if (soundSystem && !soundSystem.muted) soundSystem.playRevive();
            return true;
        }
        return false;
    },

    roundEnd(result) {
        const d = cuNormalize(this);
        let gain = 2;
        if (result === 'lose') gain += 1;
        if ((this.loseStreak || 0) >= 2) gain += 1;
        if (this.hasUpgrade('evo_cu_2')) gain += 1;
        d.cp += gain;
    },

    shopButtons(container, playerId) {
        const d = cuNormalize(this);
        const vipNow = cuApplyVip(this); // vừa mua Gói VIP -> nâng cấp mô-đun cũ ngay
        if (vipNow && typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
        const btn = document.createElement('div');
        btn.className = 'card';
        btn.style.border = '2px solid #f59e0b';
        btn.style.background = 'linear-gradient(160deg,#3a2306,#1a1004)';
        const traits = Object.keys(d.traits).map(t => CU_PART_BY_ID[t].icon).join('');
        btn.innerHTML = `<h4 style="color:#fbbf24">🔧 TÙY BIẾN</h4><p>${CU_PART_BY_ID[d.fire].icon} ${CU_PART_BY_ID[d.fire].name} Lv${d.lv.fire}<br>${d.fire === 'ram' ? '' : CU_PART_BY_ID[d.bullet].icon + ' ' + CU_PART_BY_ID[d.bullet].name + ' Lv' + d.lv.bullet}<br>${traits}${vipNow ? '<br><b style="color:#fde047">VIP: +1 cấp mọi mô-đun!</b>' : ''}</p><p style="color:#fbbf24">${d.cp} CP</p>`;
        btn.onclick = () => cuRenderPanel(playerId);
        container.appendChild(btn);
    },
});

// Bắn 1 phát theo lối bắn hiện tại (Hitscan nếu có)
function cuFireOne(p, dmgMult = 1, sizeMult = 1) {
    if (cuHas(p, 'hitscan')) {
        let dmg = p.damage * dmgMult * (1 + 0.1 * p.cuData.lv.bullet);
        if (cuHas(p, 'crit') && Math.random() < 0.1 + 0.08 * cuLv(p, 'crit')) dmg *= 2;
        bodyEffects.push(new HitscanTelegraph(p, p.x + p.w / 2, dmg, '#ff2244', 30, 'customize'));
    } else cuSpawn(p, 0, dmgMult, sizeMult);
}
