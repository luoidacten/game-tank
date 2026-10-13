// ==========================================
// Kiếm Khách (kiem_khach) — Dữ liệu & tiến trình Bài Tập Luyện Kiếm
// ==========================================

// metric: sự kiện được đếm | need(tier): yêu cầu gốc (trước khi giảm theo Evo)
// tiers: số cấp (bài tập kỹ năng nhiều cấp) | repeat: bài chỉ số làm lại được (yêu cầu tăng dần)
const KK_QUESTS = [
    // --- Nhóm kỹ năng kiếm ---
    { id: 'mua_kiem', group: 'skill', name: 'Mưa Kiếm', tiers: 3, metric: 'fire',
      need: t => [20, 45, 80][t], reward: t => `+${t + 1} phi kiếm mỗi loạt`, task: n => `Phóng ${n} phi kiếm` },
    { id: 'kiem_vu', group: 'skill', name: 'Kiếm Vũ', tiers: 3, metric: 'targetHit',
      need: t => [10, 25, 60][t], reward: t => `Bắn chùm hình nón +${t + 1} tia`, task: n => `Trúng ${n} kiếm vào mục tiêu (địch, hòm, xe tiền, ụ súng)` },
    { id: 'pha_troi', group: 'skill', name: 'Phá Trời', tiers: 1, metric: 'obstacleHit',
      need: () => 25, reward: () => 'Phi kiếm Xuyên Thấu', task: n => `Trúng ${n} vật cản (hòm, xe tiền, ụ súng, tường)` },
    { id: 'kiem_anh', group: 'skill', name: 'Kiếm Ảnh', tiers: 3, metric: 'focusSec',
      need: t => [9, 18, 21][t], reward: t => `Tập Trung: kiếm bay x2, +${t + 1}s thời gian`, task: n => `Ở trạng thái Tập Trung tổng ${n}s` },
    { id: 'bao_kiem', group: 'skill', name: 'Bảo Kiếm', tiers: 1, metric: 'instant',
      need: () => 0, reward: () => 'Tập Trung: vô hạn đạn, giữ Bắn xả mưa kiếm', task: () => 'Cần hoàn thành 3 bài kỹ năng trước',
      available: d => kkSkillDone(d) >= 3 },
    // --- Nhóm chỉ số (làm lại được, yêu cầu tăng dần) ---
    { id: 'thoi_the', group: 'stat', name: 'Thối Thể', repeat: true, metric: 'dmgTaken',
      need: () => 3, reward: () => '+1 Máu tối đa', task: n => `Chịu ${n} sát thương` },
    { id: 'mai_kiem', group: 'stat', name: 'Mài Kiếm', repeat: true, metric: 'targetHit',
      need: () => 12, reward: () => '+0.25 Sát thương', task: n => `Bắn trúng mục tiêu ${n} lần` },
    { id: 'tich_luy', group: 'stat', name: 'Tích Lũy', repeat: true, metric: 'coins',
      need: () => 80, reward: () => 'Thưởng nóng +50$', task: n => `Có ${n}$ trong ví` },
    { id: 'bo_phap', group: 'stat', name: 'Bộ Pháp', repeat: true, metric: 'distance',
      need: () => 2500, reward: () => '+0.2 Tốc độ', task: n => `Di chuyển ${n}px` },
    { id: 'bang_dan', group: 'stat', name: 'Băng Đạn', repeat: true, metric: 'emptyMag',
      need: () => 4, reward: () => '+1 Đạn tối đa', task: n => `Bắn cạn băng đạn ${n} lần` },
    // --- 5 Bài Tập Cuối (chỉ Full Evo) ---
    { id: 'van_tinh_vu', group: 'final', name: 'Vân Tinh Vũ', metric: 'noDamage', need: () => 1,
      reward: () => '+5s Tập Trung. Né đòn khi Tập Trung -> phản kiếm. 10 phản kiếm -> 5 đại kiếm giáng trời',
      task: () => 'Không chịu sát thương từ lúc nhận tới hết hiệp' },
    { id: 'phan_anh', group: 'final', name: 'Phân Ảnh', metric: 'swordsTotal', need: () => 1000,
      reward: () => 'Bão Kiếm: thêm nhiều kiếm phụ mỗi lần bắn', task: n => `Tổng ${n} phi kiếm từ đầu trận` },
    { id: 'pha', group: 'final', name: 'Phá', metric: 'questsDone', need: () => 8,
      reward: () => 'Một phần kiếm hóa tia Hitscan trúng tức thì', task: n => `Hoàn thành ${n} bài tập` },
    { id: 'kiem_the_cuong', group: 'final', name: 'Kiếm Thế Cường', metric: 'statGate', need: () => 1,
      reward: () => '+2 HP, +1 Dame, +2 Đạn, +0.3 Tốc', task: () => 'Đạt 5 HP / 2 Dame / 6 Đạn / tốc 1.25x' },
    { id: 'co_hoi_cuoi', group: 'final', name: 'Cơ Hội Cuối', metric: 'losses', need: () => 2,
      reward: () => 'Thập Tử Nhất Sinh mỗi hiệp + tự hoàn thành 3 bài cuối khác', task: n => `Thua ${n} hiệp kể từ lúc nhận` },
];
const KK_QUEST_BY_ID = Object.fromEntries(KK_QUESTS.map(q => [q.id, q]));

function kkNewData() {
    return {
        stats: { hp: 0, dmg: 0, speed: 0, ammo: 0 },
        skill: { mua_kiem: 0, kiem_vu: 0, pha_troi: 0, kiem_anh: 0, bao_kiem: 0 },
        repeats: {},            // số lần đã làm bài chỉ số
        finals: {},             // bài cuối đã xong
        active: [],             // [{ id, tier, prog, need }]
        totalDone: 0,
        swordsTotal: 0,
        counters: 0,            // phản kiếm (Vân Tinh Vũ)
        picksLeft: 0,
        hoaThan: false,
    };
}

function kkSkillDone(d) {
    return Object.values(d.skill).reduce((a, v) => a + (v > 0 ? 1 : 0), 0);
}

function kkIsFullEvo(p) { return p.hasUpgrade('evo_kk_1') && p.hasUpgrade('evo_kk_2'); }

function kkReqMult(p) {
    if (kkIsFullEvo(p)) return 0.35;
    if (p.hasUpgrade('evo_kk_1')) return 0.5;
    return 1;
}

function kkPicksPerPhase(p) {
    if (kkIsFullEvo(p)) return 4;
    if (p.hasUpgrade('evo_kk_2')) return 2;
    return 1;
}

// Danh sách bài có thể nhận lúc này
function kkAvailableQuests(p) {
    const d = p.kkData;
    const activeIds = new Set(d.active.map(a => a.id));
    const out = [];
    for (const q of KK_QUESTS) {
        if (activeIds.has(q.id)) continue;
        if (q.group === 'final' && (!kkIsFullEvo(p) || d.finals[q.id])) continue;
        let tier = 0;
        if (q.group === 'skill') {
            tier = d.skill[q.id] || 0;
            if (tier >= (q.tiers || 1)) continue;
        }
        if (q.available && !q.available(d)) continue;
        out.push({ q, tier });
    }
    return out;
}

function kkQuestNeed(p, q, tier) {
    let n = q.need(tier);
    if (q.repeat) n = Math.round(n * Math.pow(1.5, p.kkData.repeats[q.id] || 0));
    if (q.metric === 'coins') n = q.need(tier) + 40 * (p.kkData.repeats[q.id] || 0);
    const noScale = ['instant', 'noDamage', 'statGate', 'losses'];
    if (!noScale.includes(q.metric)) n = Math.max(1, Math.round(n * kkReqMult(p)));
    return n;
}

function kkAcceptQuest(p, id) {
    const d = p.kkData;
    const entry = kkAvailableQuests(p).find(e => e.q.id === id);
    if (!entry || d.picksLeft <= 0) return false;
    d.picksLeft--;
    const a = { id, tier: entry.tier, prog: 0, need: kkQuestNeed(p, entry.q, entry.tier) };
    d.active.push(a);
    if (entry.q.metric === 'instant') kkComplete(p, a);
    return true;
}

// Cộng tiến độ cho mọi bài đang nhận có metric tương ứng
function kkProgress(p, metric, amount = 1) {
    const d = p.kkData;
    if (!d || !d.active.length) return;
    for (const a of d.active.slice()) {
        const q = KK_QUEST_BY_ID[a.id];
        if (q.metric !== metric) continue;
        a.prog += amount;
        if (a.prog >= a.need) kkComplete(p, a);
    }
}

// Bài kiểm tra theo trạng thái (không cộng dồn)
function kkCheckStateQuests(p) {
    const d = p.kkData;
    for (const a of d.active.slice()) {
        const q = KK_QUEST_BY_ID[a.id];
        let v = null;
        if (q.metric === 'coins') v = p.id === 1 ? gameState.p1Coins : gameState.p2Coins;
        else if (q.metric === 'swordsTotal') v = d.swordsTotal;
        else if (q.metric === 'questsDone') v = d.totalDone;
        else if (q.metric === 'statGate') v = (p.maxHp >= 5 && p.damage >= 2 && p.maxAmmo >= 6 && p.speed >= C.baseSpeed * 1.25) ? 1 : 0;
        if (v === null) continue;
        a.prog = Math.min(v, a.need);
        if (v >= a.need) kkComplete(p, a);
    }
}

function kkComplete(p, a) {
    const d = p.kkData;
    const q = KK_QUEST_BY_ID[a.id];
    d.active = d.active.filter(x => x !== a);
    d.totalDone++;
    if (q.group === 'skill') d.skill[q.id] = (d.skill[q.id] || 0) + 1;
    else if (q.group === 'stat') {
        d.repeats[q.id] = (d.repeats[q.id] || 0) + 1;
        if (q.id === 'thoi_the') { d.stats.hp += 1; p.maxHp += 1; p.hp += 1; }
        if (q.id === 'mai_kiem') { d.stats.dmg += 0.25; p.damage += 0.25; }
        if (q.id === 'bo_phap') { d.stats.speed += 0.2; p.speed += 0.2; }
        if (q.id === 'bang_dan') { d.stats.ammo += 1; p.maxAmmo += 1; }
        if (q.id === 'tich_luy') { if (p.id === 1) gameState.p1Coins += 50; else gameState.p2Coins += 50; }
    } else if (q.group === 'final') {
        d.finals[q.id] = true;
        if (q.id === 'kiem_the_cuong') { p.maxHp += 2; p.hp += 2; p.damage += 1; p.maxAmmo += 2; p.speed += 0.3; }
        if (q.id === 'co_hoi_cuoi') {
            // Tự hoàn thành thêm 3 bài cuối khác
            let n = 0;
            for (const id of ['van_tinh_vu', 'phan_anh', 'pha', 'kiem_the_cuong']) {
                if (n >= 3) break;
                if (d.finals[id]) continue;
                d.finals[id] = true; n++;
                d.active = d.active.filter(x => x.id !== id);
                if (id === 'kiem_the_cuong') { p.maxHp += 2; p.hp += 2; p.damage += 1; p.maxAmmo += 2; p.speed += 0.3; }
            }
        }
        if (['van_tinh_vu', 'phan_anh', 'pha', 'kiem_the_cuong', 'co_hoi_cuoi'].every(id => d.finals[id]) && !d.hoaThan) {
            d.hoaThan = true;
            p.maxHp += 2; p.hp += 2; p.damage += 0.5;
            addFloatingText(p.x + p.w / 2, p.y - 34, 'HÓA THẦN — THẦN KIẾM! ⚔️✨', '#ffd700', 17);
            explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 120, 'gold', 0, p));
            triggerScreenShake(8, 14);
        }
    }
    const tierTxt = q.tiers > 1 ? ` ${['I', 'II', 'III'][a.tier]}` : '';
    if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 22, `HOÀN THÀNH: ${q.name}${tierTxt} ✔`, '#ffd700', 13);
    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
}
