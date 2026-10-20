// ==========================================
// Hệ thống Lõi Công Nghệ G.E.A.R (#1 – #150)
// ------------------------------------------
// • Quay trước 3 bậc G.E.A.R đầu trận với cơ chế Dynamic Tier Decay (60/30/10, giảm 50% trọng số khi đã ra).
// • Mở chọn G.E.A.R tại 3 mốc:
//   - BO3 (winScore <= 2): Hiệp 1, Hiệp 2, Hiệp 3
//   - BO5 / BO7 (winScore >= 3): Hiệp 1, Hiệp 3, Hiệp 5
// • Lọc theo Giai Đoạn (EARLY, EARLY_MID, MID_LATE, ALL), Khóa Cùng Dòng (familyId khi đã chọn),
//   Khóa Chéo (incompatibleWith 2 chiều), Vai Trò Chính (roleReq), Body độc quyền / loại trừ và cond(player).
// ==========================================

// ------------------------------------------
// 1. THUẬT TOÁN QUAY BẬC & LỌC G.E.A.R
// ------------------------------------------
function weightedRandomGearTier(weights) {
    const total = (weights.SILVER || 0) + (weights.GOLD || 0) + (weights.PRISMATIC || 0);
    let r = Math.random() * total;
    for (const tier of ['SILVER', 'GOLD', 'PRISMATIC']) {
        r -= (weights[tier] || 0);
        if (r <= 0) return tier;
    }
    return 'SILVER';
}

function generateMatchGearTiers() {
    const weights = { SILVER: 60, GOLD: 30, PRISMATIC: 10 };
    const matchTiers = [];
    for (let i = 0; i < 3; i++) {
        const pickedTier = weightedRandomGearTier(weights);
        matchTiers.push(pickedTier);
        const decayed = weights[pickedTier] * 0.5;
        weights[pickedTier] -= decayed;
        for (const tier of ['SILVER', 'GOLD', 'PRISMATIC']) {
            if (tier !== pickedTier) weights[tier] += decayed / 2;
        }
    }
    return matchTiers;
}

function getGearMilestoneIndex(round) {
    const r = round || (typeof gameState !== 'undefined' ? gameState.round : 1) || 1;
    const winScore = (typeof gameState !== 'undefined' && gameState.winScore) ? gameState.winScore : 3;
    if (winScore <= 2) {
        // BO3: Hiệp 1, Hiệp 2, Hiệp 3
        if (r === 1) return 0;
        if (r === 2) return 1;
        if (r === 3) return 2;
        return -1;
    } else {
        // BO5 / BO7: Hiệp 1, Hiệp 3, Hiệp 5
        if (r === 1) return 0;
        if (r === 3) return 1;
        if (r === 5) return 2;
        return -1;
    }
}

function ensurePlayerGearState(player) {
    if (!player) return;
    if (!Array.isArray(player.equippedGears)) player.equippedGears = [];
    if (!Array.isArray(player.gearPickedMilestones)) player.gearPickedMilestones = [];
    if (!Array.isArray(player.gearFreeFeetUpgrades)) player.gearFreeFeetUpgrades = [];
    if (!Array.isArray(gameState.matchGearTiers) || gameState.matchGearTiers.length < 3) {
        gameState.matchGearTiers = generateMatchGearTiers();
    }
    if (!Array.isArray(player.gearTiers) || player.gearTiers.length < 3) {
        player.gearTiers = [...gameState.matchGearTiers];
    }
}

function syncPlayerBodyPreviewForGear(player) {
    if (!player) return;
    const bodyIds = MODULES.BODY.map(m => m.id);
    const myBodyId = (player.upgrades || []).find(u => bodyIds.includes(u)) || player.weapon || 'basic';
    player.weapon = myBodyId;
    const modInfo = MODULES.BODY.find(m => m.id === myBodyId);
    if (gameState.round === 1 && modInfo && modInfo.stats) {
        let hp = modInfo.stats.hp || 6;
        const w = (modInfo.size && modInfo.size.w) ? modInfo.size.w : C.tankW;
        if (w >= 38) hp += 5;
        else if (w >= 37) hp += 4;
        else if (w >= 36) hp += 3;
        else if (w >= 34) hp += 2;
        else if (w > 30) hp += 1;
        player.maxHp = hp;
        player.maxAmmo = modInfo.stats.ammo || 5;
    }
    if (myBodyId === 'basic' && player.mainEgg === undefined) {
        player.mainEgg = Math.random() < 0.08;
    }
}

function canGearAppearForPlayer(g, player, milestoneIdx, targetTier, ignoreTier = false) {
    if (!g || !player) return false;
    ensurePlayerGearState(player);
    syncPlayerBodyPreviewForGear(player);

    // 1. Kiểm tra Bậc (Tier)
    if (!ignoreTier && g.tier !== targetTier) return false;

    // 2. Kiểm tra Giai Đoạn (Stage: 0 = R1, 1 = Giữa trận, 2 = Cuối trận)
    const st = g.stage || 'ALL';
    if (milestoneIdx === 0 && !['EARLY', 'EARLY_MID', 'ALL'].includes(st)) return false;
    if (milestoneIdx === 1 && !['EARLY_MID', 'MID_LATE', 'ALL'].includes(st)) return false;
    if (milestoneIdx === 2 && !['MID_LATE', 'ALL'].includes(st)) return false;

    // 3. Không trùng G.E.A.R đã sở hữu
    if (player.equippedGears.includes(g.id)) return false;

    // 4. Khóa Cùng Dòng (familyId) — chỉ khóa khi người chơi ĐÃ CHỌN 1 lõi thuộc dòng đó
    if (g.familyId) {
        const pickedSameFamily = player.equippedGears.some(eqId => {
            const eq = GEAR_BY_ID[eqId];
            return eq && eq.familyId === g.familyId;
        });
        if (pickedSameFamily) return false;
    }

    // 5. Khóa Cấm Đi Chung 2 chiều (incompatibleWith)
    if (Array.isArray(g.incompatibleWith)) {
        if (g.incompatibleWith.some(badId => player.equippedGears.includes(badId))) return false;
    }
    const reverseIncompat = player.equippedGears.some(eqId => {
        const eq = GEAR_BY_ID[eqId];
        return eq && Array.isArray(eq.incompatibleWith) && eq.incompatibleWith.includes(g.id);
    });
    if (reverseIncompat) return false;

    // 6. Kiểm tra Body & Vai Trò Chính (role[0])
    const bodyId = player.weapon || 'basic';
    const mod = MODULES.BODY.find(m => m.id === bodyId);
    const mainRole = (mod && Array.isArray(mod.role) && mod.role.length > 0) ? mod.role[0] : null;

    if (g.roleReq && g.roleReq !== mainRole) return false;
    if (Array.isArray(g.bodies) && !g.bodies.includes(bodyId)) {
        // Cho phép Cường Hóa Triệu Hồi (#67, #68) xuất hiện nếu người chơi đã sở hữu G.E.A.R gọi Drone/Trụ
        const summonGearIds = ['gear_free_drone_g', 'gear_sup_heal_beacon_g', 'gear_sup_tesla_coil_g', 'gear_sup_frost_totem_s', 'gear_sup_decoy_holo_s', 'gear_sup_shield_drone_g', 'gear_sup_ammo_turret_s', 'gear_sup_mecha_core_p'];
        const hasSummonGear = (g.id === 'gear_summon_buff_s' || g.id === 'gear_summon_army_g') &&
            (player.equippedGears.some(id => summonGearIds.includes(id)) || (player.equippedGears.includes('gear_all_in_gamble_p') && player.gearJackpot === 5));
        if (!hasSummonGear) return false;
    }
    if (Array.isArray(g.excludeBodies) && g.excludeBodies.includes(bodyId)) return false;

    // 7. Điều kiện động (cond)
    if (typeof g.cond === 'function') {
        try {
            if (!g.cond(player)) return false;
        } catch (e) {
            return false;
        }
    }

    return true;
}

function rollPlayerGearChoices(player, milestoneIdx) {
    ensurePlayerGearState(player);
    const targetTier = player.gearTiers[milestoneIdx] || 'SILVER';
    let pool = GEARS.filter(g => canGearAppearForPlayer(g, player, milestoneIdx, targetTier, false));

    // Fallback an toàn nếu bể của bậc đó quá hẹp (< 3 lõi)
    if (pool.length < 3) {
        const extra = GEARS.filter(g => !pool.includes(g) && canGearAppearForPlayer(g, player, milestoneIdx, targetTier, true));
        pool = pool.concat(extra);
    }

    // Ưu tiên nhẹ cho các G.E.A.R độc quyền theo Xe hoặc theo Vai Trò để người chơi dễ gặp lõi hợp tướng
    const weightedPool = [];
    pool.forEach(g => {
        let copies = 1;
        if (Array.isArray(g.bodies) && g.bodies.length <= 4) copies = 2;
        for (let i = 0; i < copies; i++) weightedPool.push(g);
    });

    const chosen = [];
    const usedIds = new Set();
    const usedFamiliesInHand = new Set();
    const shuffled = [...weightedPool].sort(() => 0.5 - Math.random());

    for (const g of shuffled) {
        if (usedIds.has(g.id)) continue;
        if (g.familyId && usedFamiliesInHand.has(g.familyId)) continue;
        usedIds.add(g.id);
        if (g.familyId) usedFamiliesInHand.add(g.familyId);
        chosen.push(g);
        if (chosen.length >= 3) break;
    }

    // Nếu vẫn chưa đủ 3 (do lọc family trong cùng 1 lượt), lấy bù từ pool
    if (chosen.length < 3) {
        for (const g of pool) {
            if (!usedIds.has(g.id)) {
                usedIds.add(g.id);
                chosen.push(g);
                if (chosen.length >= 3) break;
            }
        }
    }

    return chosen;
}

// ------------------------------------------
// 2. KÍCH HOẠT HIỆU ỨNG TỨC THÌ KHI CHỌN G.E.A.R
// ------------------------------------------
function addPlayerCoins(player, amount) {
    if (!player || !amount) return;
    if (player.id === 1) gameState.p1Coins += amount;
    else gameState.p2Coins += amount;
}

function getPlayerCoins(player) {
    if (!player) return 0;
    return player.id === 1 ? gameState.p1Coins : gameState.p2Coins;
}

function applyGearImmediateEffect(player, gearId) {
    if (!player || !gearId) return;
    ensurePlayerGearState(player);
    syncPlayerBodyPreviewForGear(player);

    const opp = (player.id === 1) ? p2 : p1;

    switch (gearId) {
        case 'gear_free_foot_s': // #3 Cửa Hàng Gian Lận: 1 Module Chân miễn phí mỗi hiệp
            player._gearFreeFootAvailable = true;
            break;
        case 'gear_discount_s': // #4 Giảm Giá: +$15
            addPlayerCoins(player, 15);
            break;
        case 'gear_discount_g': // #5 Giảm Giá++: +$30
            addPlayerCoins(player, 30);
            break;
        case 'gear_interest_cap_s': // #7 Quỹ Đầu Tư Mạo Hiểm: +1 Lợi Tức miễn phí
            player.upgrades.push('interest');
            break;
        case 'gear_tycoon_p': // #8 Tài Phiệt Phố Alano: +$100 & +2 Lợi Tức
            addPlayerCoins(player, 100);
            player.upgrades.push('interest', 'interest');
            break;
        case 'gear_early_evo_p': { // #12 Tiến Hóa Sớm
            const evos = EVOLUTIONS[player.weapon] || [];
            const unowned = evos.filter(e => !player.upgrades.includes(e.id)).sort((a, b) => (a.cost || 0) - (b.cost || 0));
            if (unowned.length > 0) {
                player.addUpgrade(unowned[0].id);
            } else {
                addPlayerCoins(player, 220);
                player.gearEarlyEvoFallback = true;
            }
            break;
        }
        case 'gear_uncap_speed_g': // #15 Phá Bỏ Giới Hạn Gia Tốc: +1 Động Cơ miễn phí
            player.gearFreeFeetUpgrades.push('speed');
            break;
        case 'gear_infinite_stat_p': // #18 Chỉ Số Vô Tận: khởi đầu 1 tầng
            player.gearInfiniteStacks = Math.max(1, player.gearInfiniteStacks || 1);
            break;
        case 'gear_all_in_gamble_p': { // #19 Ván Cược Tất Thắng: quay 1 trong 5 Độc Đắc
            if (!player.gearJackpot) {
                player.gearJackpot = Math.floor(Math.random() * 5) + 1;
                if (player.gearJackpot === 1) {
                    addPlayerCoins(player, 250);
                }
            }
            break;
        }
        case 'gear_heavy_tread_s': // #22 Bánh Xích Hạng Nặng: +1 Bánh Xích miễn phí
            player.gearFreeFeetUpgrades.push('damage');
            break;
        case 'gear_starter_s': // #101 Gói Khởi Đầu: +$30 + 1 Khiên R1
            addPlayerCoins(player, 30);
            player.gearStarterShieldR1 = true;
            break;
        case 'gear_starter_g': // #102 Gói Khởi Đầu++: +$30 + 1 Khiên mỗi hiệp
            addPlayerCoins(player, 30);
            break;
        case 'gear_starter_p': // #103 Gói Khởi Đầu Tối Thượng: +$45 + 1 Reroll Free mỗi Shop + 1 Khiên mỗi hiệp
            addPlayerCoins(player, 45);
            player._gearFreeRerollAvailable = true;
            break;
        case 'gear_glitter_next_s': // #104 Tiền Vàng Và Lấp Lánh: +$15 & mốc 2 của BẠN thành PRISMATIC
            addPlayerCoins(player, 15);
            if (Array.isArray(player.gearTiers) && player.gearTiers.length > 1) {
                player.gearTiers[1] = 'PRISMATIC';
            }
            break;
        case 'gear_money_lv2_g': // #105 Tiền Mua Quyền: Xe Tiền +2 Cấp Độ ngay lập tức
            player.upgradeLevel = Math.min(6, (player.upgradeLevel || 0) + 2);
            break;
        case 'gear_protagonist_p': // #106 Ta Là Nhân Vật Chính: Biến thành MAIN, đối thủ +$200
            player.mainEgg = true;
            player.mainAwakened = true;
            player.isMainChar = true;
            ['evo_basic_1', 'evo_basic_2'].forEach(id => {
                if (!player.hasUpgrade(id)) player.upgrades.push(id);
            });
            if (!player._protagonistBonusPaid) {
                player._protagonistBonusPaid = true;
                const isOnlineGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
                if (!isOnlineGuest && opp) {
                    addPlayerCoins(opp, 200);
                }
            }
            break;
        case 'gear_tac_mystery_box_s': // #141 Hộp Bí Ẩn Đầu Hiệp: +$20 ngay khi chọn
            addPlayerCoins(player, 20);
            break;
        case 'gear_hero_adapt_p': // #149 Đột Biến Vô Cực: +$80 vàng ngay khi chọn
            addPlayerCoins(player, 80);
            break;
    }
}

function getJackpotDesc(jackpotId) {
    const names = {
        1: '🎰 ĐỘC ĐẮC [1]: THẦN TÀI (+$250)',
        2: '🎰 ĐỘC ĐẮC [2]: BẤT TỬ THÂN (+6 HP & Hồi 0.4 HP/s)',
        3: '🎰 ĐỘC ĐẮC [3]: CUỒNG SÁT (+55% Dame & Xuyên Khiên)',
        4: '🎰 ĐỘC ĐẮC [4]: THẦN TỐC (+45% Tốc chạy & +40% Tốc bắn)',
        5: '🎰 ĐỘC ĐẮC [5]: SONG BẢN (+2 Khiên & 1 Drone 100% Dame)'
    };
    return names[jackpotId] || '';
}

// ------------------------------------------
// 3. GIAO DIỆN CHỌN G.E.A.R (TRONG SHOP / ĐẦU HIỆP)
// ------------------------------------------
function renderEquippedGearStrip(playerOrId, container = null) {
    const player = typeof playerOrId === 'string' ? (playerOrId === 'p1' ? p1 : p2) : playerOrId;
    if (!player) return '';
    ensurePlayerGearState(player);
    if (!player.equippedGears.length) return '';
    const badges = player.equippedGears.map(id => {
        const g = GEAR_BY_ID[id];
        if (!g) return '';
        const tInfo = GEAR_TIERS[g.tier] || GEAR_TIERS.SILVER;
        const extra = (id === 'gear_all_in_gamble_p' && player.gearJackpot) ? ` (${getJackpotDesc(player.gearJackpot)})` : '';
        return `<span class="gear-mini-pill tier-${g.tier.toLowerCase()}" title="${g.name}: ${g.desc}${extra}">${tInfo.icon} ${g.name}</span>`;
    }).join('');
    const html = `<div class="gear-equipped-strip">${badges}</div>`;
    if (container && typeof container.appendChild === 'function') {
        const wrap = document.createElement('div');
        wrap.className = 'gear-equipped-strip-wrap';
        wrap.innerHTML = html;
        container.appendChild(wrap);
    }
    return html;
}

function showGearSelectionIfNeeded(playerId, onComplete) {
    const player = (playerId === 'p1') ? p1 : p2;
    if (!player) { if (onComplete) onComplete(); return; }
    ensurePlayerGearState(player);

    const milestoneIdx = getGearMilestoneIndex(gameState.round);
    if (milestoneIdx < 0 || player.gearPickedMilestones.includes(milestoneIdx)) {
        if (onComplete) onComplete();
        return;
    }

    renderGearSelection(playerId, milestoneIdx, onComplete);
}

function renderGearSelection(playerId, milestoneIdx, onComplete) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) { if (onComplete) onComplete(); return; }
    const player = (playerId === 'p1') ? p1 : p2;
    ensurePlayerGearState(player);

    const tierKey = player.gearTiers[milestoneIdx] || 'SILVER';
    const tierInfo = GEAR_TIERS[tierKey] || GEAR_TIERS.SILVER;

    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) {
        const tierLabel = `${tierInfo.icon} BẬC ${tierInfo.name.toUpperCase()}`;
        roundTitle.innerText = `HIỆP ${gameState.round} — CHỌN LÕI G.E.A.R #${milestoneIdx + 1} (${tierLabel})`;
    }

    container.innerHTML = '';
    const choices = rollPlayerGearChoices(player, milestoneIdx);

    choices.forEach(g => {
        const tInfo = GEAR_TIERS[g.tier] || GEAR_TIERS.SILVER;
        const div = document.createElement('div');
        div.className = `card pick-card gear-card gear-tier-${g.tier.toLowerCase()}`;

        let tagLabel = '⚡ CHUNG';
        if (Array.isArray(g.bodies) && g.bodies.length === 1) {
            const bMod = MODULES.BODY.find(m => m.id === g.bodies[0]);
            tagLabel = `🌟 ĐỘC QUYỀN: ${bMod ? bMod.name : g.bodies[0]}`;
        } else if (Array.isArray(g.bodies) && g.bodies.length > 1) {
            tagLabel = `🎯 NHÓM TƯỚNG`;
        } else if (g.roleReq) {
            tagLabel = `${ROLE_ICON[g.roleReq] || '⚔️'} HỆ ${g.roleReq.toUpperCase()}`;
        }

        div.innerHTML = `
            <div class="gear-tier-header">
                <span class="gear-tier-badge">${tInfo.icon} ${tInfo.name}</span>
                <span class="gear-cat-badge">${tagLabel}</span>
            </div>
            <h4 class="gear-title">${g.name}</h4>
            <p class="gear-desc">${g.desc}</p>
        `;

        div.onclick = () => {
            if (player.gearPickedMilestones.includes(milestoneIdx)) return;
            player.gearPickedMilestones.push(milestoneIdx);
            player.addGear(g.id);
            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();

            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
                onlineManager.sendLoadout(playerId);
            }

            // Hiển thị phản hồi ngắn hoặc chuyển tiếp mượt sang bước kế tiếp
            if (gameState.round === 1) {
                container.innerHTML = '';
                div.classList.add('gear-picked-confirm');
                div.style.cursor = 'default';
                div.onclick = null;
                if (g.id === 'gear_all_in_gamble_p' && player.gearJackpot) {
                    const jpEl = document.createElement('div');
                    jpEl.style.cssText = 'color:#fde047;font-weight:bold;font-size:10px;margin-top:4px;';
                    jpEl.textContent = getJackpotDesc(player.gearJackpot);
                    div.appendChild(jpEl);
                }
                container.appendChild(div);
                if (onComplete) onComplete();
            } else {
                updateShopTitle();
                if (onComplete) onComplete();
            }
        };

        container.appendChild(div);
    });

    // Tự động chọn G.E.A.R cho Bot (Practice hoặc PVE) nếu đây là p2
    if (playerId === 'p2' && ((typeof botAI !== 'undefined' && botAI.enabled) || (typeof PVE !== 'undefined' && PVE.active))) {
        setTimeout(() => {
            if (gameState.phase === 'upgrade' && !player.gearPickedMilestones.includes(milestoneIdx)) {
                const cards = container.querySelectorAll('.gear-card');
                if (cards.length > 0) {
                    const pickIdx = Math.floor(Math.random() * cards.length);
                    cards[pickIdx].click();
                } else if (onComplete) {
                    onComplete();
                }
            }
        }, 260);
    }
}

// ------------------------------------------
// 4. VẬT TRIỆU HỒI & THỰC THỂ SÂN ĐẤU CỦA G.E.A.R
// ------------------------------------------

// Drone hỗ trợ từ #19 (Song Bản), #70 (Trợ Thủ Drone Tự Động), #132 (Drone Hộ Vệ Quang Khiên), #134 (Mecha Core)
class GearSupportDrone {
    constructor(owner, mode = 'free_drone') {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.mode = mode; // 'jackpot' | 'free_drone' | 'shield_drone'
        this.w = 18;
        this.h = 18;
        const hpMult = (owner && owner.hasGear && owner.hasGear('gear_summon_army_g')) ? 1.5
            : ((owner && owner.hasGear && owner.hasGear('gear_summon_buff_s')) ? 1.3 : 1);
        this.maxHp = (mode === 'jackpot' ? 5 : 3.5) * hpMult;
        this.hp = this.maxHp;
        this.x = owner ? owner.x + owner.w + 14 : 100;
        this.y = owner ? owner.y : 100;
        this.fireTimer = 60;
        this.shieldTimer = 360;
        this.orbitPhase = Math.random() * Math.PI * 2;
        this.empTimer = 0;
        this.active = true;
    }
    takeDamage(dmg) {
        if (this.mode === 'free_drone') return; // #70 Drone Không Kích không thể bị bắn trúng
        this.hp -= dmg;
        if (this.hp <= 0 && this.active) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 28, '#38bdf8', 0, this.owner));
            triggerGearSummonMartyr(this.owner, this.x + this.w / 2, this.y + this.h / 2);
        }
    }
    update() {
        if (!this.active) return;
        const owner = this.team === 1 ? p1 : p2;
        if (!owner || owner.hp <= 0) { this.active = false; return; }
        this.owner = owner;

        // #95 Gia Tộc Cơ Khí Alano: miễn nhiễm EMP & hồi 0.3 HP/s
        if (owner.hasGear && owner.hasGear('gear_hero_family_p')) {
            this.empTimer = 0;
            this.hp = Math.min(this.maxHp, this.hp + 0.3 / 60);
        }
        if (this.empTimer > 0) { this.empTimer--; return; }

        this.orbitPhase += 0.06;
        const baseOff = this.mode === 'jackpot' ? -28 : (this.mode === 'shield_drone' ? -24 : 28);
        const offsetX = baseOff + Math.cos(this.orbitPhase) * 10;
        const targetX = Math.max(6, Math.min(canvas.width - this.w - 6, owner.x + owner.w / 2 - this.w / 2 + offsetX));
        const targetY = owner.id === 1 ? owner.y + 4 : owner.y + owner.h - this.h - 4;
        this.x += (targetX - this.x) * 0.22;
        this.y += (targetY - this.y) * 0.22;

        // #132 Drone Hộ Vệ Quang Khiên: mỗi 6s nạp +0.75 Giáp Trắng (tối đa 2.25)
        if (this.mode === 'shield_drone') {
            if (--this.shieldTimer <= 0) {
                this.shieldTimer = 360;
                owner.gearWhiteShield = Math.min(Math.max(owner.gearWhiteShield || 0, 2.25), (owner.gearWhiteShield || 0) + 0.75 * getGearHealMult(owner));
                addFloatingText(owner.x + owner.w / 2, owner.y - 14, '+0.75 GIÁP TRẮNG 🛡️', '#38bdf8', 11);
            }
        }

        const rateMult = (owner.hasGear && owner.hasGear('gear_summon_army_g')) ? 1.3 : 1;
        this.fireTimer -= rateMult;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.mode === 'jackpot' ? 75 : (this.mode === 'shield_drone' ? 120 : 150);
            const enemy = owner.id === 1 ? p2 : p1;
            if (enemy && enemy.hp > 0) {
                const dirY = owner.id === 1 ? -1 : 1;
                let dmg = this.mode === 'jackpot' ? (owner.damage * 0.85) : (this.mode === 'shield_drone' ? 0.25 : 0.45);
                if (owner.hasGear && owner.hasGear('gear_summon_buff_s')) dmg *= 1.2;
                const ang = Math.atan2((enemy.y + enemy.h / 2) - (this.y + this.h / 2), (enemy.x + enemy.w / 2) - (this.x + this.w / 2));
                const spd = C.bulletSpeed * 1.15;
                owner.bullets.push({
                    x: this.x + this.w / 2 - 3,
                    y: dirY < 0 ? this.y - 6 : this.y + this.h + 2,
                    w: 6, h: 8,
                    vx: this.mode === 'free_drone' ? Math.cos(ang) * spd * 0.35 : 0,
                    vy: dirY * spd,
                    dmg: dmg,
                    owner: owner,
                    isGearDroneBullet: true,
                    hitIds: [], bounceCount: 0
                });
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const col = this.mode === 'jackpot' ? '#facc15' : (this.mode === 'shield_drone' ? '#a855f7' : '#38bdf8');
        ctx.shadowBlur = 10; ctx.shadowColor = col;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Bẫy Mìn Tự Động (#74 Chuyên Gia Rải Mìn)
class GearMine {
    constructor(owner, x, y) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
        this.life = 900; // 15s
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const owner = this.team === 1 ? p1 : p2;
        const enemy = this.team === 1 ? p2 : p1;
        if (!enemy || enemy.hp <= 0) return;

        // Chặn đạn địch bay qua mìn
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                if (!b.isPiercing) enemy.bullets.splice(i, 1);
                this.detonate(owner, enemy);
                return;
            }
        }

        // Nổ nếu kẻ địch lao vào mìn
        if (rectIntersect(this.x - 6, this.y - 6, this.w + 12, this.h + 12, enemy.x, enemy.y, enemy.w, enemy.h)) {
            enemy.takeDamage(0.8, owner);
            this.detonate(owner, enemy);
        }
    }
    detonate(owner, enemy) {
        if (!this.active) return;
        this.active = false;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        explosions.push(new Explosion(cx, cy, 42, 'rgba(251, 146, 60,', 0.8, owner));
        spawnSparkParticles(cx, cy, '#fb923c', 10);
    }
    draw() {
        if (!this.active) return;
        const blink = Math.floor(Date.now() / 200) % 2 === 0;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = blink ? '#ef4444' : '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = blink ? '#ef4444' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Tường Chắn Di Động (#77)
class GearBarrierWall {
    constructor(owner) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.w = 56;
        this.h = 10;
        this.x = owner ? Math.max(10, Math.min(canvas.width - this.w - 10, owner.x + owner.w / 2 - this.w / 2)) : 100;
        this.y = owner ? (owner.id === 1 ? owner.y - 24 : owner.y + owner.h + 14) : 100;
        const hpMult = (owner && owner.hasGear && owner.hasGear('gear_summon_pack_g')) ? 1.35 : 1;
        this.maxHp = 3.0 * hpMult;
        this.hp = this.maxHp;
        this.life = 360; // 6s
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0 || this.hp <= 0) {
            this.active = false;
            return;
        }
        const owner = this.team === 1 ? p1 : p2;
        const enemy = this.team === 1 ? p2 : p1;
        if (!enemy || !Array.isArray(enemy.bullets)) return;

        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                let d = b.dmg || 1;
                if (enemy.hasGear && enemy.hasGear('gear_shield_breaker_g')) d *= 2;
                this.hp -= d;
                spawnSparkParticles(b.x, b.y, '#38bdf8', 5);
                if (!b.isPiercing) enemy.bullets.splice(i, 1);
                if (this.hp <= 0) {
                    this.active = false;
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, '#38bdf8', 0, owner));
                    triggerGearSummonMartyr(owner, this.x + this.w / 2, this.y + this.h / 2);
                    break;
                }
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const pct = Math.max(0, Math.min(1, this.hp / this.maxHp));
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(this.x + 2, this.y + 2, (this.w - 4) * pct, 3);
        ctx.restore();
    }
}

// Gương Phản Xạ Giữa Sân (#79)
class GearCenterPrism {
    constructor(owner) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.w = 64;
        this.h = 14;
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height / 2 - this.h / 2 + (this.team === 1 ? 14 : -14);
        this.vx = this.team === 1 ? 1.4 : -1.4;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        const owner = this.team === 1 ? p1 : p2;
        if (!owner || owner.hp <= 0) { this.active = false; return; }
        this.x += this.vx;
        if (this.x <= 30 || this.x + this.w >= canvas.width - 30) {
            this.vx *= -1;
        }
        // Nhân đôi đạn của chủ sở hữu khi bay xuyên qua Lăng Kính
        if (Array.isArray(owner.bullets)) {
            const len = owner.bullets.length;
            for (let i = 0; i < len; i++) {
                const b = owner.bullets[i];
                if (!b || b._prismSplit || b.type === 'purple' || b.type === 'gojo_blue' || b.isStormPhantom) continue;
                if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                    b._prismSplit = true;
                    b.dmg = (b.dmg || 1) * 1.25;
                    const clone = Object.assign({}, b, {
                        x: b.x + 10,
                        vx: (b.vx || 0) + (Math.random() < 0.5 ? 0.9 : -0.9),
                        hitIds: Array.isArray(b.hitIds) ? [...b.hitIds] : [],
                        _prismSplit: true
                    });
                    b.x -= 6;
                    owner.bullets.push(clone);
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#f0abfc', 6);
                }
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.75)');
        grad.addColorStop(0.5, 'rgba(244, 114, 182, 0.9)');
        grad.addColorStop(1, 'rgba(250, 204, 21, 0.75)');
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#e879f9';
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, this.y - 3);
        ctx.lineTo(this.x + this.w, cy);
        ctx.lineTo(cx, this.y + this.h + 3);
        ctx.lineTo(this.x, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Dư Ảnh Quang Học (#60)
class GearMirage {
    constructor(owner, x, y) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.x = x;
        this.y = y;
        this.w = owner ? owner.w : 30;
        this.h = owner ? owner.h : 30;
        this.life = 90; // 1.5s
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const owner = this.team === 1 ? p1 : p2;
        const enemy = this.team === 1 ? p2 : p1;
        if (!enemy || !Array.isArray(enemy.bullets)) return;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                if (!b.isPiercing) enemy.bullets.splice(i, 1);
                this.active = false;
                const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                explosions.push(new Explosion(cx, cy, 48, 'rgba(56, 189, 248,', 0.5, owner));
                enemy.slowTimer = Math.max(enemy.slowTimer || 0, 90);
                triggerGearSummonMartyr(owner, cx, cy);
                break;
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0.2, (this.life / 90) * 0.65);
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

// Hộp Quà Trêu Ngươi (#41 Chỉ Là 1 Trò Đùa!)
class GearPrankBox {
    constructor(owner, x, y) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.x = x;
        this.y = y;
        this.w = 24;
        this.h = 24;
        this.life = 90; // 1.5s rồi nổ pháo giấy
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) {
            this.active = false;
            const owner = this.team === 1 ? p1 : p2;
            const enemy = this.team === 1 ? p2 : p1;
            const cx = this.x + 12, cy = this.y + 12;
            explosions.push(new Explosion(cx, cy, 55, 'rgba(244, 114, 182,', 0.6, owner));
            spawnSparkParticles(cx, cy, '#f472b6', 14);
            if (enemy && enemy.hp > 0) {
                enemy.confusionStacks = Math.min(3, (enemy.confusionStacks || 0) + 1);
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#ec4899';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎁', this.x + 12, this.y + 17);
        ctx.restore();
    }
}

// Tia Sét Bão Từ Trường (#76 Cơn Bão Từ Trường)
class GearStormBolt {
    constructor(owner, x, y, isAllyZone = false) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.x = x;
        this.y = y;
        this.r = isAllyZone ? 34 : 28;
        this.isAllyZone = isAllyZone;
        this.warnTimer = isAllyZone ? 0 : 48; // 0.8s cảnh báo trước khi giáng sét
        this.life = isAllyZone ? 180 : 18;
        this.struck = false;
        this.healed = false;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        const owner = this.team === 1 ? p1 : p2;
        const enemy = this.team === 1 ? p2 : p1;
        if (this.isAllyZone) {
            if (--this.life <= 0) { this.active = false; return; }
            if (owner && owner.hp > 0 && Math.hypot((owner.x + owner.w / 2) - this.x, (owner.y + owner.h / 2) - this.y) <= this.r + owner.w / 2) {
                if (!this.healed) {
                    this.healed = true;
                    owner.hp = Math.min(owner.maxHp, owner.hp + 0.5);
                    addFloatingText(owner.x + owner.w / 2, owner.y - 14, '+0.5 HP ⚡', '#38bdf8', 12);
                }
                owner.gearStormAtkSpdTimer = 60;
            }
            return;
        }
        if (this.warnTimer > 0) {
            this.warnTimer--;
            return;
        }
        if (!this.struck) {
            this.struck = true;
            if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - this.x, (enemy.y + enemy.h / 2) - this.y) <= this.r + enemy.w / 2) {
                enemy.takeDamage(1.2, owner);
                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 30);
            }
            spawnSparkParticles(this.x, this.y, '#38bdf8', 12);
        }
        if (--this.life <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        if (this.isAllyZone) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.warnTimer > 0) {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
            ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(this.x, 0);
            ctx.lineTo(this.x - 8, this.y * 0.5);
            ctx.lineTo(this.x + 8, this.y * 0.75);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
        ctx.restore();
    }
}

function triggerGearSummonMartyr(owner, x, y) {
    if (!owner || !owner.hasGear) return;
    if (!owner.hasGear('gear_summon_overload_p') && !owner.hasGear('gear_summon_martyr_p')) return;
    const enemy = owner.id === 1 ? p2 : p1;
    owner.gearWhiteShield = Math.min(5, (owner.gearWhiteShield || 0) + 0.4);
    addFloatingText(owner.x + owner.w / 2, owner.y - 14, '+0.4 GIÁP TRẮNG 🛡️', '#e2e8f0', 11);
    if (enemy && enemy.hp > 0) {
        const ang = Math.atan2((enemy.y + enemy.h / 2) - y, (enemy.x + enemy.w / 2) - x);
        owner.bullets.push({
            x: x - 4, y: y - 4, w: 8, h: 8,
            vx: Math.cos(ang) * 7.5, vy: Math.sin(ang) * 7.5,
            dmg: 0.8, owner: owner,
            isPiercing: false, hitIds: [], bounceCount: 0
        });
    }
}

// Đa Thực Thể Thiết Bị Hỗ Trợ & Hiệu Ứng Sân Đấu (#57, #75, #110, #123–#135)
class GearFieldDevice {
    constructor(owner, mode, x = 0, y = 0, extra = {}) {
        this.owner = owner;
        this.team = owner ? owner.id : 1;
        this.mode = mode;
        this.x = x;
        this.y = y;
        this.w = extra.w || 22;
        this.h = extra.h || 22;
        this.r = extra.r || 36;
        const hpMult = (owner && owner.hasGear && owner.hasGear('gear_summon_army_g')) ? 1.5
            : ((owner && owner.hasGear && owner.hasGear('gear_summon_buff_s')) ? 1.3 : 1);
        this.maxHp = (extra.hp || 3.0) * hpMult;
        this.hp = this.maxHp;
        const durMult = (owner && owner.hasGear && owner.hasGear('gear_summon_buff_s')) ? 1.2 : 1;
        this.life = Math.round((extra.life || 360) * durMult);
        this.maxLife = this.life;
        this.timer = extra.timer || 60;
        this.vx = extra.vx || 0;
        this.minX = extra.minX || 0;
        this.maxX = extra.maxX || 500;
        this.shieldTicks = (owner && owner.hasGear && owner.hasGear('gear_summon_army_g')) ? 180 : 0;
        this.active = true;
    }
    takeDamage(dmg) {
        if (this.shieldTicks > 0) {
            this.shieldTicks = 0;
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#fde047', 6);
            return;
        }
        this.hp -= dmg;
        if (this.hp <= 0 && this.active) {
            this.active = false;
            const owner = this.team === 1 ? p1 : p2;
            const enemy = this.team === 1 ? p2 : p1;
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            if (this.mode === 'holo_decoy') {
                explosions.push(new Explosion(cx, cy, 48, 'rgba(56, 189, 248,', 0.5, owner));
                if (enemy && enemy.hp > 0) enemy.slowTimer = Math.max(enemy.slowTimer || 0, 90);
            } else {
                explosions.push(new Explosion(cx, cy, 28, '#38bdf8', 0, owner));
            }
            triggerGearSummonMartyr(owner, cx, cy);
        }
    }
    checkEnemyBulletHit(enemy, owner) {
        if (!enemy || !Array.isArray(enemy.bullets)) return;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                if (this.mode === 'mirror_wall') {
                    // #135 Màn Chắn Khúc Xạ: phản ngược 180 độ viên đạn địch đầu tiên!
                    const reflected = Object.assign({}, b, {
                        vx: -(b.vx || 0),
                        vy: -(b.vy || (this.team === 1 ? 6 : -6)),
                        dmg: b.dmg || enemy.damage || 1,
                        owner: owner,
                        hitIds: [],
                        _gearReflected: true
                    });
                    enemy.bullets.splice(i, 1);
                    owner.bullets.push(reflected);
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#f0abfc', 12);
                    addFloatingText(this.x + this.w / 2, this.y - 10, 'PHẢN ĐẠN 180°! 🪞', '#f0abfc', 12);
                    this.active = false;
                    return;
                }
                let d = b.dmg || 1;
                if (enemy.hasGear && enemy.hasGear('gear_shield_breaker_g')) d *= 2;
                if (!b.isPiercing) enemy.bullets.splice(i, 1);
                this.takeDamage(d);
                if (!this.active) return;
            }
        }
    }
    update() {
        if (!this.active) return;
        if (this.shieldTicks > 0) this.shieldTicks--;
        const owner = this.team === 1 ? p1 : p2;
        const enemy = this.team === 1 ? p2 : p1;
        if (!owner || owner.hp <= 0) { this.active = false; return; }

        if (--this.life <= 0) {
            if (this.mode === 'artillery') {
                // #75 Pháo Kích Hỗ Trợ nổ khi hết thời gian cảnh báo
                explosions.push(new Explosion(this.x, this.y, 44, 'rgba(239, 68, 68,', 1.0, owner));
                spawnSparkParticles(this.x, this.y, '#ef4444', 12);
            } else if (this.mode === 'blackhole') {
                // #110 Hố Đen sập nổ
                explosions.push(new Explosion(this.x, this.y, 56, 'rgba(168, 85, 247,', 0.8, owner));
                spawnSparkParticles(this.x, this.y, '#a855f7', 14);
            }
            this.active = false;
            return;
        }

        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;

        switch (this.mode) {
            case 'prison': { // #57 Ngục Tù Không Gian 1D: khóa kẻ địch giữa minX và maxX
                if (enemy && enemy.hp > 0 && !(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
                    if (enemy.x < this.minX) enemy.x = this.minX;
                    if (enemy.x + enemy.w > this.maxX) enemy.x = Math.max(0, this.maxX - enemy.w);
                }
                break;
            }
            case 'blackhole': { // #110 Đạn Hố Đen: hút ghì kẻ địch về tâm (this.x, this.y) + làm chậm 45%
                if (enemy && enemy.hp > 0) {
                    const ex = enemy.x + enemy.w / 2;
                    if (Math.abs(ex - this.x) < 130) {
                        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 20);
                        if (!(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
                            enemy.x += Math.sign(this.x - ex) * 1.65;
                        }
                    }
                }
                break;
            }
            case 'heal_beacon': { // #123 Trạm Quân Y Dã Chiến: hồi 0.35 HP/s + 15% tốc bắn trong bán kính 75px
                this.checkEnemyBulletHit(enemy, owner);
                const dist = Math.hypot((owner.x + owner.w / 2) - cx, (owner.y + owner.h / 2) - cy);
                if (dist <= 80) {
                    owner.gearBeaconBuffTimer = 20;
                    if (this.life % 30 === 0 && owner.hp < owner.maxHp) {
                        const heal = 0.175 * getGearHealMult(owner);
                        owner.hp = Math.min(owner.maxHp, owner.hp + heal);
                        addFloatingText(owner.x + owner.w / 2, owner.y - 12, `+${heal.toFixed(2)} HP ✚`, '#4ade80', 10);
                    }
                }
                break;
            }
            case 'tesla_coil': { // #125 Cột Thu Lôi Từ Trường: mỗi 2s giật điện kẻ địch 0.45 dame + chậm
                this.checkEnemyBulletHit(enemy, owner);
                if (--this.timer <= 0) {
                    this.timer = (owner.hasGear && owner.hasGear('gear_summon_army_g')) ? 90 : 120;
                    if (enemy && enemy.hp > 0) {
                        let d = 0.45 * ((owner.hasGear && owner.hasGear('gear_summon_buff_s')) ? 1.2 : 1);
                        enemy.takeDamage(d, owner);
                        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 60);
                        spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#38bdf8', 8);
                        this.zapFlash = 10;
                    }
                }
                if (this.zapFlash > 0) this.zapFlash--;
                break;
            }
            case 'frost_totem': { // #126 Cọc Băng Hàn Khí: làm chậm địch & giảm 20% tốc đạn địch bay ngang
                this.checkEnemyBulletHit(enemy, owner);
                if (enemy && enemy.hp > 0 && this.life % 30 === 0) {
                    enemy.slowTimer = Math.max(enemy.slowTimer || 0, 40);
                }
                if (enemy && Array.isArray(enemy.bullets)) {
                    enemy.bullets.forEach(b => {
                        if (!b._totemSlowed && Math.hypot(b.x - cx, b.y - cy) <= 95) {
                            b._totemSlowed = true;
                            b.vx *= 0.8;
                            b.vy *= 0.8;
                        }
                    });
                }
                break;
            }
            case 'satellite_laser': { // #128 Vệ Tinh Quỹ Đạo: tia laser vũ trụ bám đuổi kẻ địch trong 1.2s
                if (enemy && enemy.hp > 0) {
                    const targetX = enemy.x + enemy.w / 2;
                    this.x += Math.sign(targetX - this.x) * Math.min(2.4, Math.abs(targetX - this.x));
                    if (Math.abs(targetX - this.x) <= 22 && this.life % 12 === 0) {
                        enemy.takeDamage(0.24, owner);
                        enemy.gearBurnTimer = Math.max(enemy.gearBurnTimer || 0, 60);
                        spawnSparkParticles(this.x, enemy.y + enemy.h / 2, '#38bdf8', 5);
                    }
                }
                break;
            }
            case 'holo_decoy': { // #129 Máy Chiếu Phân Thân: tự di chuyển tuần tra trên làn
                this.x += this.vx;
                if (this.x <= 20 || this.x + this.w >= canvas.width - 20) this.vx *= -1;
                this.checkEnemyBulletHit(enemy, owner);
                break;
            }
            case 'supply_pod': { // #130 Khoang Tiếp Tế Không Gian: chạm vào nhận buff + $5
                if (rectIntersect(this.x - 6, this.y - 6, this.w + 12, this.h + 12, owner.x, owner.y, owner.w, owner.h)) {
                    this.active = false;
                    addPlayerCoins(owner, 5);
                    const roll = Math.floor(Math.random() * 4);
                    if (roll === 0) {
                        owner.hp = Math.min(owner.maxHp, owner.hp + 1.0 * getGearHealMult(owner));
                        addFloatingText(cx, cy - 12, 'KHOANG TIẾP TẾ: +1.0 HP & +$5 📦', '#4ade80', 12);
                    } else if (roll === 1) {
                        owner.gearWhiteShield = Math.min(4.0, (owner.gearWhiteShield || 0) + 1.0);
                        addFloatingText(cx, cy - 12, 'KHOANG TIẾP TẾ: +1.0 GIÁP & +$5 🛡️', '#38bdf8', 12);
                    } else if (roll === 2) {
                        owner.ammo = owner.maxAmmo;
                        addFloatingText(cx, cy - 12, 'KHOANG TIẾP TẾ: ĐẦY ĐẠN & +$5 🔋', '#facc15', 12);
                    } else {
                        owner.gearSupplyDmgTimer = 240;
                        addFloatingText(cx, cy - 12, 'KHOANG TIẾP TẾ: +25% DAME & +$5 🔥', '#f97316', 12);
                    }
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                }
                break;
            }
            case 'gravity_well': { // #131 Cọc Trọng Trường: kéo địch mỗi giây & khiến địch chịu +20% sát thương
                if (enemy && enemy.hp > 0) {
                    const ex = enemy.x + enemy.w / 2;
                    if (Math.abs(ex - this.x) <= 125) {
                        enemy.gearInGravityWellTimer = 20;
                        if (this.life % 45 === 0 && !(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
                            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + Math.sign(this.x - ex) * 24));
                            spawnSparkParticles(ex, enemy.y + enemy.h / 2, '#c084fc', 6);
                        }
                    }
                }
                break;
            }
            case 'ammo_turret': { // #133 Trạm Tiếp Đạn & Hỏa Lực: đi theo sau lưng chủ nhân, mỗi 3s nạp 1 đạn + bắn 0.3 dame
                const targetX = owner.x + owner.w / 2 - this.w / 2;
                const targetY = owner.id === 1 ? Math.min(canvas.height - 20, owner.y + owner.h + 4) : Math.max(4, owner.y - 18);
                this.x += (targetX - this.x) * 0.25;
                this.y += (targetY - this.y) * 0.25;
                if (--this.timer <= 0) {
                    this.timer = 180;
                    owner.ammo = Math.min(owner.maxAmmo, (owner.ammo || 0) + 1);
                    if (owner.weapon === 'water_gun' || owner.weapon === 'furnace') owner.energy = Math.min(owner.maxEnergy || 100, (owner.energy || 0) + 12);
                    if (enemy && enemy.hp > 0) {
                        const dirY = owner.id === 1 ? -1 : 1;
                        owner.bullets.push({
                            x: this.x + this.w / 2 - 3, y: dirY < 0 ? owner.y - 6 : owner.y + owner.h + 2,
                            w: 5, h: 7, vx: 0, vy: dirY * C.bulletSpeed * 1.1,
                            dmg: 0.3, owner: owner, isGearDroneBullet: true, hitIds: [], bounceCount: 0
                        });
                    }
                }
                break;
            }
            case 'mirror_wall': { // #135 Màn Chắn Khúc Xạ: đi theo trước mặt xe
                this.x = Math.max(6, Math.min(canvas.width - this.w - 6, owner.x + owner.w / 2 - this.w / 2));
                this.y = owner.id === 1 ? owner.y - 18 : owner.y + owner.h + 8;
                this.checkEnemyBulletHit(enemy, owner);
                break;
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        if (this.mode === 'prison') {
            ctx.strokeStyle = '#e879f9';
            ctx.fillStyle = 'rgba(232, 121, 249, 0.25)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10; ctx.shadowColor = '#e879f9';
            ctx.fillRect(this.minX - 4, this.y - 18, 6, 36);
            ctx.fillRect(this.maxX - 2, this.y - 18, 6, 36);
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(this.minX, this.y);
            ctx.lineTo(this.maxX, this.y);
            ctx.stroke();
        } else if (this.mode === 'artillery') {
            ctx.strokeStyle = '#ef4444';
            ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fca5a5';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎯', this.x, this.y + 4);
        } else if (this.mode === 'blackhole') {
            const pulse = 22 + Math.sin(Date.now() * 0.02) * 5;
            ctx.fillStyle = '#090214';
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 16; ctx.shadowColor = '#9333ea';
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.mode === 'heal_beacon') {
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
            ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 75, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#14532d';
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✚', cx, cy + 4);
        } else if (this.mode === 'tesla_coil') {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10; ctx.shadowColor = '#38bdf8';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', cx, cy + 4);
            if (this.zapFlash > 0) {
                const enemy = this.team === 1 ? p2 : p1;
                if (enemy) {
                    ctx.strokeStyle = '#7dd3fc';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                    ctx.stroke();
                }
            }
        } else if (this.mode === 'frost_totem') {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
            ctx.beginPath();
            ctx.arc(cx, cy, 85, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#083344';
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 2;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#67e8f9';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❄️', cx, cy + 4);
        } else if (this.mode === 'satellite_laser') {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 10;
            ctx.shadowBlur = 18; ctx.shadowColor = '#22d3ee';
            ctx.globalAlpha = 0.75;
            ctx.beginPath();
            ctx.moveTo(this.x, 0);
            ctx.lineTo(this.x, canvas.height);
            ctx.stroke();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, 0);
            ctx.lineTo(this.x, canvas.height);
            ctx.stroke();
        } else if (this.mode === 'holo_decoy') {
            ctx.globalAlpha = 0.65;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 2]);
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        } else if (this.mode === 'supply_pod') {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8; ctx.shadowColor = '#facc15';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📦', cx, cy + 4);
        } else if (this.mode === 'gravity_well') {
            ctx.strokeStyle = '#c084fc';
            ctx.fillStyle = 'rgba(192, 132, 252, 0.16)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 70, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#e879f9';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.mode === 'ammo_turret') {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 1.8;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        } else if (this.mode === 'mirror_wall') {
            ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
            ctx.strokeStyle = '#f9a8d4';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10; ctx.shadowColor = '#ec4899';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
        ctx.restore();
    }
}

// ------------------------------------------
// 5. HOOKS VẬN HÀNH 150 LÕI G.E.A.R TRONG TRẬN ĐẤU
// ------------------------------------------

// Tốc độ bắn / nạp đạn động trong hiệp từ G.E.A.R
function getGearFireRateMult(p) {
    if (!p || !p.hasGear) return 1;
    let m = 1;
    if (p.hasGear('gear_headstart_s') && (p.gearRoundTicks || 0) <= 600) m *= 1.25;
    if (p.hasGear('gear_sudden_death_s') && p.gearSuddenDeathTriggered) m *= 1.25;
    if (p.hasGear('gear_duel_master_g') && p.gearAlignedWithEnemy) m *= 1.20;
    if (p.hasGear('gear_gatling_heat_s') && (p.gearGatlingStacks || 0) > 0) m *= (1 + 0.02 * p.gearGatlingStacks);
    if (p.hasGear('gear_hero_swords_p')) m *= 1.25;
    if (p.hasGear('gear_hero_gatling_g')) m *= 1.25;
    if (p.hasGear('gear_tac_berserk_g')) {
        const missingPct = Math.max(0, 1 - (p.hp / Math.max(1, p.maxHp)));
        const stacks = Math.min(9, Math.floor(missingPct * 10));
        if (stacks > 0) m *= (1 + 0.05 * stacks);
    }
    if (p.hasGear('gear_sup_speed_rail_s')) {
        const cx = p.x + p.w / 2;
        if (Math.abs(cx - canvas.width / 2) <= 75) m *= 1.15;
    }
    if ((p.gearStormAtkSpdTimer || 0) > 0) m *= 1.25;
    if ((p.gearBeaconBuffTimer || 0) > 0) m *= 1.15;
    if ((p.gearCritSpdTimer || 0) > 0) m *= 1.20;
    if ((p.gearAdrenalineTimer || 0) > 0) m *= 1.35;
    if ((p.gearOverclockActive || 0) > 0) m *= 1.50;
    if ((p.gearExhaustTimer || 0) > 0) m *= 0.70; // Bị #58 Nhiễu Sóng Tâm Trí làm chậm nạp
    if ((p.gearEmpSlowReloadTimer || 0) > 0) m *= 0.70; // Bị #118 Micro-EMP làm chậm nạp
    return m;
}

// Hệ số sát thương động trong giao tranh (theo vị trí, máu, thời gian...)
function getGearDynamicDamageMult(attacker, victim, bullet = null) {
    if (!attacker || !attacker.hasGear) return 1;
    let mult = 1;

    // #24 Chiến Binh Bền Bỉ: +8% mỗi 10s (tối đa +40%)
    if (attacker.hasGear('gear_scaling_time_g')) {
        const stacks = Math.min(5, Math.floor((attacker.gearRoundTicks || 0) / 600));
        mult *= (1 + 0.08 * stacks);
    }
    // #51 Bản Năng Đấu Sĩ: đối diện trực tiếp (< 40px) +18%
    if (attacker.hasGear('gear_duel_instinct_s') && victim) {
        const dx = Math.abs((attacker.x + attacker.w / 2) - (victim.x + victim.w / 2));
        if (dx < 40) mult *= 1.18;
    }
    // #52 Chuyên Gia Quyết Đấu: đối diện (< 45px) +25% + cộng dồn 4%/hit (tối đa +20%)
    if (attacker.hasGear('gear_duel_master_g') && victim) {
        const dx = Math.abs((attacker.x + attacker.w / 2) - (victim.x + victim.w / 2));
        if (dx < 45) mult *= 1.25;
        if ((attacker.gearDuelMasterStacks || 0) > 0) {
            mult *= (1 + 0.04 * Math.min(5, attacker.gearDuelMasterStacks));
        }
    }
    // #53 Xung Kích Khát Máu: khi máu địch < 50% HP -> +30% Sát thương
    if (attacker.hasGear('gear_duel_frenzy_p') && victim) {
        if ((victim.hp / Math.max(1, victim.maxHp)) < 0.5) mult *= 1.30;
        else if ((attacker.gearFrenzyStacks || 0) > 0) mult *= (1 + 0.05 * Math.min(6, attacker.gearFrenzyStacks));
    }
    // #54 Đấu Tay Đôi Công Bằng: +30% Sát thương nếu trên sân đang có vật triệu hồi / tường chắn của địch
    if (attacker.hasGear('gear_duel_honor_g') && victim) {
        const hasEnemySummon = (typeof turrets !== 'undefined' && turrets.some(t => t.owner === victim && t.active)) ||
            (typeof creatorTurrets !== 'undefined' && creatorTurrets.some(t => t.owner === victim && t.active)) ||
            (typeof creatorRobots !== 'undefined' && creatorRobots.some(r => r.owner === victim && r.active)) ||
            (Array.isArray(victim.drones) && victim.drones.some(d => d.active)) ||
            (typeof bodyEffects !== 'undefined' && bodyEffects.some(e => e && e.active && (e.owner === victim || e.team === victim.id)));
        if (hasEnemySummon) mult *= 1.30;
    }
    // #56 Bậc Thầy Phong Tỏa: địch đang chịu Khống Chế -> +20% sát thương
    if ((attacker.hasGear('gear_ctrl_master_g') || attacker.hasGear('gear_ctrl_torment_g')) && victim && isPlayerAfflictedByCC(victim)) {
        mult *= 1.20;
    }
    // #60 Ảo Ảnh Gia Tốc: phát bắn kế tiếp sau khi tạo Phân Ảnh +25% Sát thương
    if (attacker.hasGear('gear_mob_mirage_g') && attacker.gearMirageBonusShot) {
        attacker.gearMirageBonusShot = false;
        mult *= 1.25;
    }
    // #61 Siêu Thanh Vô Ảnh: mỗi 20% tốc chạy cộng thêm (so với 3.5) -> +12% Sát thương
    if (attacker.hasGear('gear_mob_phantom_p')) {
        const spdRatio = Math.max(0, (attacker.speed - 3.5) / 3.5);
        const tiers = Math.min(5, Math.floor(spdRatio / 0.2));
        if (tiers > 0) mult *= (1 + 0.12 * tiers);
    }
    // #78 Khế Ước Đột Tử: khi Bo bắt đầu thu hẹp -> +30% sát thương
    if (attacker.hasGear('gear_early_zone_g') && attacker.gearInSuddenDeathZone) {
        mult *= 1.30;
    }
    // #80 Thợ Săn Khổng Lồ: địch nhiều máu hơn hoặc to hơn
    if (attacker.hasGear('gear_giant_slayer_s') && victim) {
        const hpDiff = (victim.maxHp || 6) - (attacker.maxHp || 6);
        if (hpDiff >= 4) mult *= 1.35;
        else if (hpDiff > 0 || (victim.w || 30) > 30) mult *= 1.20;
    }
    // #98 Đồng Tâm Hiệp Lực: đứng gần bản sao / sau khi đổi chỗ -> +25% sát thương
    if (attacker.hasGear('gear_hero_twins_g') && (attacker.gearTwinSynergyTimer || 0) > 0) {
        mult *= 1.25;
    }
    // #35 Tay Súng Thiện Xạ: đạn bay càng xa sát thương càng tăng (tối đa +25%)
    if (attacker.hasGear('gear_sniper_scope_g') && bullet && typeof bullet._gearSpawnY === 'number') {
        const distY = Math.abs((bullet.y || 0) - bullet._gearSpawnY);
        const maxDist = Math.max(200, canvas.height * 0.75);
        const bonus = Math.min(0.25, (distY / maxDist) * 0.25);
        mult *= (1 + bonus);
    }
    // #130 Khoang Tiếp Tế Không Gian buff +25% Dame
    if ((attacker.gearSupplyDmgTimer || 0) > 0) {
        mult *= 1.25;
    }
    // #131 Cọc Trọng Trường: mục tiêu trong vùng trọng trường chịu +20% sát thương
    if (victim && (victim.gearInGravityWellTimer || 0) > 0) {
        mult *= 1.20;
    }
    // #136 Cuồng Nộ Tuyệt Cảnh: mỗi 10% máu đã mất -> +6% Sát thương
    if (attacker.hasGear('gear_tac_berserk_g')) {
        const missingPct = Math.max(0, 1 - (attacker.hp / Math.max(1, attacker.maxHp)));
        const stacks = Math.min(9, Math.floor(missingPct * 10));
        if (stacks > 0) mult *= (1 + 0.06 * stacks);
    }
    // #141 Hộp Bí Ẩn Đầu Hiệp buff Cuồng Nộ +30% Dame
    if ((attacker.gearMysteryDmgTimer || 0) > 0) {
        mult *= 1.30;
    }
    // #144 Áp Suất Nguyên Tố Cực Đại: mục tiêu đang dính Đốt/Ướt/Axit/Chậm chịu thêm +18% sát thương
    if (attacker.hasGear('gear_hero_elemental_g') && victim && isPlayerAfflictedByCC(victim)) {
        mult *= 1.18;
    }

    return mult;
}

function isPlayerAfflictedByCC(p) {
    if (!p) return false;
    return (p.slowTimer > 0 || p.freezeTimer > 0 || p.silenceTimer > 0 || p.burnTimer > 0 ||
            p.gearBurnTimer > 0 || (p.gearVenomStacks || 0) > 0 ||
            p.acidBurnTimer > 0 || p.bleedTimer > 0 || p.bindingCurseStacks > 0 ||
            p.confusionStacks > 0 || p.mvFrostT > 0 || (p.statusSpeedMult !== undefined && p.statusSpeedMult < 0.99));
}

// Khởi tạo tất cả G.E.A.R vào đầu mỗi hiệp (gọi cuối setupForNewRound)
function applyGearsOnRoundSetup(p) {
    if (!p) return;
    ensurePlayerGearState(p);

    // 0. Áp dụng các nâng cấp Chân miễn phí từ #11, #15, #22 (không làm tăng giá Shop)
    if (Array.isArray(p.gearFreeFeetUpgrades)) {
        p.gearFreeFeetUpgrades.forEach(uId => {
            if (uId === 'speed') p.speed += 1.5;
            if (uId === 'armor') p.maxHp += 1;
            if (uId === 'damage') p.damage *= 1.25;
        });
    }

    // Thưởng vĩnh viễn từ #6 Lật Kèo
    if (p.gearBonusMaxHp) p.maxHp += p.gearBonusMaxHp;
    if (p.gearComebackDmgBuff) {
        p.damage *= (1 + p.gearComebackDmgBuff);
    }
    // Fallback của #12 Tiến Hóa Sớm nếu đã full evo trước đó
    if (p.gearEarlyEvoFallback) {
        p.maxHp *= 1.25;
        p.damage *= 1.25;
        p.speed *= 1.25;
    }

    // #8 Tài Phiệt Phố Alano: mỗi $50 giữ lại (tối đa $250) -> +8% Dame & +0.5 Giáp Trắng
    p.gearWhiteShield = 0;
    if (p.hasGear('gear_tycoon_p')) {
        const stacks = Math.min(5, Math.floor(getPlayerCoins(p) / 50));
        if (stacks > 0) {
            p.damage *= (1 + 0.08 * stacks);
            p.gearWhiteShield += 0.5 * stacks;
        }
    }

    // #16 Đột Phá Tốc Ảnh: +18% Tốc chạy
    if (p.hasGear('gear_speed_heal_p')) {
        p.speed *= 1.18;
    }

    // #17 Cơn Mưa Chỉ Số
    if (p.hasGear('gear_stat_rain_g')) {
        p.maxHp += 2.0;
        p.damage *= 1.20;
        p.speed *= 1.12;
        if (GEAR_BODY_GROUPS.AMMO_BODIES.includes(p.weapon)) {
            p.maxAmmo += 1;
        } else {
            p.reloadTime *= 0.85;
        }
    }

    // #18 Chỉ Số Vô Tận
    if (p.hasGear('gear_infinite_stat_p')) {
        const st = Math.max(1, p.gearInfiniteStacks || 1);
        p.maxHp += 1.0 * st;
        p.damage *= Math.pow(1.12, st);
        p.speed *= Math.pow(1.06, st);
        const extraAmmo = Math.floor(st / 2);
        if (extraAmmo > 0) {
            if (GEAR_BODY_GROUPS.AMMO_BODIES.includes(p.weapon)) p.maxAmmo += extraAmmo;
            else p.reloadTime *= Math.pow(0.92, extraAmmo);
        }
    }

    // #19 Ván Cược Tất Thắng
    if (p.hasGear('gear_all_in_gamble_p')) {
        if (p.gearJackpot === 2) p.maxHp += 6.0;
        if (p.gearJackpot === 3) p.damage *= 1.55;
        if (p.gearJackpot === 4) { p.speed *= 1.45; p.reloadTime *= 0.65; }
        if (p.gearJackpot === 5) {
            p.shield = (p.shield || 0) + 2;
            if (typeof bodyEffects !== 'undefined' && gameState.phase === 'playing') bodyEffects.push(new GearSupportDrone(p, 'jackpot'));
        }
    }

    // #20 Thu Nhỏ Siêu Thanh (-20% kích thước, +12% tốc độ)
    if (p.hasGear('gear_mini_tank_s')) {
        p.w = Math.max(18, Math.round(p.w * 0.8));
        p.h = Math.max(18, Math.round(p.h * 0.8));
        p.speed *= 1.12;
    }

    // #21 Pháo Đài Khổng Lồ (+25% kích thước, +4 HP, +20% Dame, miễn nhiễm đẩy lùi)
    if (p.hasGear('gear_giant_tank_g')) {
        p.w = Math.round(p.w * 1.25);
        p.h = Math.round(p.h * 1.25);
        p.maxHp += 4.0;
        p.damage *= 1.20;
    }

    // #26 Cân Bằng Tuyệt Đối (số cấp Giáp Thép == Bánh Xích)
    if (p.hasGear('gear_harmonic_s')) {
        if (feetOwnedCount(p, 'armor') === feetOwnedCount(p, 'damage')) {
            p.maxHp += 1.5;
            p.damage *= 1.15;
        }
    }

    // #27 Đạn To (+10% Dame)
    if (p.hasGear('gear_big_shot_s')) {
        p.damage *= 1.10;
    }

    // #36 Băng Đạn Mở Rộng
    if (p.hasGear('gear_extra_mag_s')) {
        const oneAmmoBodies = ['wind_slash', 'acid', 'aaa', 'steel_hook', 'evolution'];
        if (oneAmmoBodies.includes(p.weapon)) {
            p.maxAmmo += 1;
            p.reloadTime *= 0.85;
        } else {
            p.maxAmmo += 2;
        }
    }

    // #37 Nạp Đạn Ma Thuật
    if (p.hasGear('gear_fast_reload_g')) {
        p.reloadTime *= 0.65;
    }

    // #42 Lá Chắn Khởi Đầu & #43 Máy Tạo Khiên Tự Động
    if (p.hasGear('gear_start_shield_s') || p.hasGear('gear_auto_shield_p')) {
        p.shield = (p.shield || 0) + 1;
    }

    // #44 Giáp Phản Đòn (+1.5 Max HP)
    if (p.hasGear('gear_thorn_armor_g')) {
        p.maxHp += 1.5;
    }

    // #59 Bộ Pháp Linh Hoạt (+10% tốc chạy)
    if (p.hasGear('gear_mob_step_s')) {
        p.speed *= 1.10;
    }

    // #61 Siêu Thanh Vô Ảnh (+20% tốc chạy)
    if (p.hasGear('gear_mob_phantom_p')) {
        p.speed *= 1.20;
    }

    // #63 Giáp Cốt Thép (+2.0 Max HP)
    if (p.hasGear('gear_surv_plate_s') || p.hasGear('gear_surv_colossus_s')) {
        p.maxHp += 2.0;
    }

    // #64 Pháo Đài Sinh Học (+3.0 Max HP)
    if (p.hasGear('gear_surv_fortress_g')) {
        p.maxHp += 3.0;
    }

    // #65 Trái Tim Bất Diệt (+35% Max HP)
    if (p.hasGear('gear_surv_titan_p')) {
        p.maxHp = Math.round(p.maxHp * 1.35 * 10) / 10;
    }

    // #69 Bầy Đàn Tối Thượng (+1 giới hạn triệu hồi)
    if (p.hasGear('gear_summon_overload_p')) {
        if (typeof p.maxSouls === 'number') p.maxSouls += 2;
    }

    // #95 Gia Tộc Cơ Khí Alano (+3 Linh Kiện & Bánh Răng mỗi đầu hiệp)
    if (p.hasGear('gear_hero_family_p') && gameState.phase === 'playing') {
        if (p.gearAlanoLastRound !== gameState.round) {
            p.gearAlanoLastRound = gameState.round;
            p.components = (p.components || 0) + 3;
            p.gears = (p.gears || 0) + 3;
        }
    }

    // #99 Huyết Hải Vô Biên (+2.5 Max HP)
    if (p.hasGear('gear_hero_blood_g')) {
        p.maxHp += 2.5;
    }

    // #101 Gói Khởi Đầu (1 Khiên ở Hiệp 1)
    if (p.hasGear('gear_starter_s') && gameState.round === 1) {
        p.shield = (p.shield || 0) + 1;
    }

    // #102 Gói Khởi Đầu++ & #103 Gói Khởi Đầu Tối Thượng (1 Khiên ở mọi hiệp)
    if (p.hasGear('gear_starter_g') || p.hasGear('gear_starter_p')) {
        p.shield = (p.shield || 0) + 1;
    }

    // #132 Drone Hộ Vệ Quang Khiên: +0.75 Giáp Trắng đầu hiệp
    if (p.hasGear('gear_sup_shield_drone_g')) {
        p.gearWhiteShield = (p.gearWhiteShield || 0) + 0.75;
    }

    // #137 Bước Chân Hỏa Ngục (+12% Tốc chạy)
    if (p.hasGear('gear_tac_fire_trail_s')) {
        p.speed *= 1.12;
    }

    // #141 Hộp Bí Ẩn Đầu Hiệp: mở ngẫu nhiên 1 trong 5 Siêu Buff
    p.gearMysteryDmgTimer = 0;
    p.gearMysterySpdTimer = 0;
    if (p.hasGear('gear_tac_mystery_box_s') && gameState.phase === 'playing') {
        const roll = Math.floor(Math.random() * 5);
        if (roll === 0) p.shield = (p.shield || 0) + 1;
        else if (roll === 1) p.gearMysteryDmgTimer = 480;
        else if (roll === 2) p.gearMysterySpdTimer = 480;
        else if (roll === 3) p.gearWhiteShield = (p.gearWhiteShield || 0) + 1.5;
        else if (p.gearMysteryCoinLastRound !== gameState.round) {
            p.gearMysteryCoinLastRound = gameState.round;
            addPlayerCoins(p, 20);
        }
    }

    // #144 Áp Suất Nguyên Tố Cực Đại (+25% Dame & +30% hồi đạn/NL)
    if (p.hasGear('gear_hero_elemental_g')) {
        p.damage *= 1.25;
        p.reloadTime *= 0.75;
    }

    // #148 Bá Vương Tuyệt Đối (+25% Dame & +2.5 Max HP)
    if (p.hasGear('gear_hero_apex_p')) {
        p.maxHp += 2.5;
        p.damage *= 1.25;
    }

    // #149 Đột Biến Vô Cực (+22% toàn bộ chỉ số & +1.0 Giáp Trắng)
    if (p.hasGear('gear_hero_adapt_p')) {
        p.maxHp = Math.round(p.maxHp * 1.22 * 10) / 10;
        p.damage *= 1.22;
        p.speed *= 1.22;
        p.reloadTime *= 0.80;
        p.gearWhiteShield = (p.gearWhiteShield || 0) + 1.0;
    }

    // #25 Đánh Đổi Liều Lĩnh (-30% Max HP, +45% Dame) — tính sau khi đã cộng máu
    if (p.hasGear('gear_glass_cannon_g')) {
        p.maxHp = Math.max(1, Math.round(p.maxHp * 0.7 * 10) / 10);
        p.damage *= 1.45;
    }

    // #82 Đổi Máu Lấy Sức Mạnh: tính lượng Max HP cộng thêm so với gốc của Body
    if (p.hasGear('gear_blood_pact_p')) {
        const mod = MODULES.BODY.find(m => m.id === p.weapon);
        const rawBaseHp = (mod && mod.stats && mod.stats.hp) ? mod.stats.hp : 6;
        const bonusHp = Math.max(0, p.maxHp - rawBaseHp);
        p.gearBloodPactHpBonus = bonusHp;
        if (bonusHp > 0) {
            p.damage *= (1 + 0.12 * bonusHp);
            p.reloadTime *= Math.max(0.35, 1 - 0.06 * bonusHp);
        }
    }

    // #65 Trái Tim Bất Diệt: đòn bắn gây thêm sát thương bằng 6% Max HP (quy đổi hợp lý theo tốc bắn)
    if (p.hasGear('gear_surv_titan_p')) {
        const isRapid = GEAR_BODY_GROUPS.RAPID_BODIES.includes(p.weapon);
        p.damage += p.maxHp * (isRapid ? 0.02 : 0.06);
    }

    // Đặt lại các bộ đếm trong hiệp
    p.gearRoundTicks = 0;
    p.gearMoveAcc = 0;
    p.gearMirageMoveAcc = 0;
    p.gearLastX = p.x;
    p.gearLastDir = 0;
    p.gearSameDirTicks = 0;
    p.gearMomentumShotReady = false;
    p.gearStepSpdTimer = 0;
    p.gearStepCd = 0;
    p.gearMirageCd = 0;
    p.gearMirageBonusShot = false;
    p.gearPhantomCd = 0;
    p.gearPhantomEvasionTimer = 0;
    p.gearHitAndRunCd = 0;
    p.gearHitAndRunTimer = 0;
    p.gearPullCd = 0;
    p.gearKnockbackHitCount = 0;
    p.gearFrostAmmoCd = 0;
    p.gearFirstStrikeTimer = 600;
    p.gearFirstStrikeReady = true;
    p.gearPrankUsedThisRound = false;
    p.gearAutoShieldTimer = 720;
    p.gearThornCd = 0;
    p.gearBulletEaterTimer = 0;
    p.gearBulletEaterActive = 60;
    p.gearSuddenDeathTriggered = false;
    p.gearNoDmgTicks = 0;
    p.gearDuelMasterStacks = 0;
    p.gearFrenzyStacks = 0;
    p.gearFrenzyTimer = 0;
    p.gearStandStillTicks = 0;
    p.gearPrisonTimer = 600;
    p.gearPrisonReady = true;
    p.gearQuakeLostHpAcc = 0;
    p.gearSwordAuraTimer = 240;
    p.gearMineTimer = 240;
    p.gearArtilleryTimer = 360;
    p.gearStormMapTimer = 240;
    p.gearWallTimer = 840;
    p.gearAmmoGoldHits = 0;
    p.gearAmmoGoldEarned = 0;
    p.gearBasicShotCount = 0;
    p.gearIceFreezeHits = 0;
    p.gearIceFreezeCd = 0;
    p.gearSwordRainCount = 0;
    p.gearJjkShieldCd = 0;
    p.gearMarksmanConsecHits = 0;
    p.gearMartialCd = 0;
    p.gearRainQueue = [];
    // Bộ đếm cho #107 – #150
    p.gearChainVoltHits = 0;
    p.gearThunderGodStacks = 0;
    p.gearBoomerangTimer = 240;
    p.gearBoomerangReady = true;
    p.gearBlackholeTimer = 540;
    p.gearBlackholeReady = true;
    p.gearVenomStacks = 0;
    p.gearVenomTimer = 0;
    p.gearCritSpdTimer = 0;
    p.gearDeathMarkHits = 0;
    p.gearDeathMarkSpdTimer = 0;
    p.gearMicroEmpTimer = 420;
    p.gearMicroEmpReady = true;
    p.gearSoulBurnCd = 0;
    p.gearOverchargeStacks = 0;
    p.gearOverchargeIdleTicks = 0;
    p.gearTwinFangCount = 0;
    p.gearBeaconTimer = 720;
    p.gearBeaconBuffTimer = 0;
    p.gearTrophyTimer = 210;
    p.gearTeslaTimer = 780;
    p.gearFrostTotemTimer = 480;
    p.gearSatelliteTimer = 360;
    p.gearHoloDecoyTimer = 420;
    p.gearSupplyPodTimer = 540;
    p.gearSupplyDmgTimer = 0;
    p.gearGravityWellTimer = 540;
    p.gearInGravityWellTimer = 0;
    p.gearMechaShotCount = 0;
    p.gearMirrorWallTimer = 720;
    p.gearFireTrailCd = 0;
    p.gearAdrenalineTimer = 0;
    p.gearAdrenalineLowTriggered = false;
    p.gearSecondWindTriggered = false;
    p.gearOverclockTimer = 480;
    p.gearOverclockActive = 0;
    p.gearMysticCd = 0;
    p.gearGatlingRocketCount = 0;
    p.gearThunderMagCd = 0;
    p.gearApexShockCd = 0;
    p.gearCloneArmyCd = 0;

    // Triệu hồi đầu hiệp trên sân (chỉ tạo khi đang ở phase playing)
    if (typeof gameState !== 'undefined' && gameState.phase === 'playing' && typeof bodyEffects !== 'undefined') {
        if (p.hasGear('gear_free_drone_g') || p.hasGear('gear_summon_pack_g')) {
            bodyEffects.push(new GearSupportDrone(p, 'free_drone'));
        }
        if (p.hasGear('gear_sup_shield_drone_g')) {
            bodyEffects.push(new GearSupportDrone(p, 'shield_drone'));
        }
        if (p.hasGear('gear_sup_mecha_core_p')) {
            bodyEffects.push(new GearSupportDrone(p, 'free_drone'));
            bodyEffects.push(new GearFieldDevice(p, 'tesla_coil', Math.max(24, p.x - 36), p.y, { hp: 3.5, life: 480, timer: 90 }));
        }
        if (p.hasGear('gear_sup_heal_beacon_g')) {
            bodyEffects.push(new GearFieldDevice(p, 'heal_beacon', Math.min(canvas.width - 40, p.x + p.w + 16), p.y, { hp: 3.0, life: 420 }));
        }
        if (p.hasGear('gear_sup_tesla_coil_g')) {
            bodyEffects.push(new GearFieldDevice(p, 'tesla_coil', Math.max(24, p.x - 36), p.y, { hp: 3.5, life: 480, timer: 100 }));
        }
        if (p.hasGear('gear_sup_ammo_turret_s')) {
            bodyEffects.push(new GearFieldDevice(p, 'ammo_turret', p.x, p.y, { w: 14, h: 14, hp: 99, life: 99999, timer: 180 }));
        }
        if (p.hasGear('gear_sup_mirror_wall_g')) {
            bodyEffects.push(new GearFieldDevice(p, 'mirror_wall', p.x, p.y, { w: 48, h: 8, hp: 3.0, life: 180 }));
        }
        if (p.hasGear('gear_auto_wall_g')) {
            bodyEffects.push(new GearBarrierWall(p));
        }
        if (p.hasGear('gear_center_prism_p')) {
            bodyEffects.push(new GearCenterPrism(p));
        }
    }

    // Đồng bộ lại HP, Ammo và lưu reloadTime gốc đầu hiệp
    p._baseRoundReloadTime = p.reloadTime;
    p.hp = p.maxHp;
    p.ammo = p.maxAmmo;
}

// Cập nhật mỗi tick vật lý cho từng người chơi
function updatePlayerGearsTick(p) {
    if (!p || p.hp <= 0 || gameState.phase !== 'playing') return;
    if (!Array.isArray(p.equippedGears) || p.equippedGears.length === 0) {
        // Vẫn phải giảm các debuff do G.E.A.R của đối thủ gây lên p
        tickGearDebuffsOnTarget(p);
        if (p._baseRoundReloadTime) {
            p.reloadTime = Math.max(40, p._baseRoundReloadTime / getGearFireRateMult(p));
        }
        return;
    }

    tickGearDebuffsOnTarget(p);
    p.gearRoundTicks = (p.gearRoundTicks || 0) + 1;
    if (p._baseRoundReloadTime) {
        p.reloadTime = Math.max(40, p._baseRoundReloadTime / getGearFireRateMult(p));
    }
    const enemy = (p.id === 1) ? p2 : p1;
    const inp = (p.id === 1) ? inputs.p1 : inputs.p2;

    // Kiểm tra đứng đối diện kẻ địch
    if (enemy && enemy.hp > 0) {
        const dx = Math.abs((p.x + p.w / 2) - (enemy.x + enemy.w / 2));
        p.gearAlignedWithEnemy = dx < 45;
    } else {
        p.gearAlignedWithEnemy = false;
    }

    // #21 Pháo Đài Khổng Lồ: miễn nhiễm đẩy lùi ngang
    if (p.hasGear('gear_giant_tank_g')) {
        p.kbX = 0;
    }

    // #50 Ý Chí Bất Khuất: giảm 40% thời gian Khống Chế (tốc độ đếm lùi CC nhanh hơn)
    if (p.hasGear('gear_tenacity_s')) {
        if (p.gearRoundTicks % 2 === 0) {
            if (p.freezeTimer > 0) p.freezeTimer--;
            if (p.slowTimer > 0) p.slowTimer--;
            if (p.silenceTimer > 0) p.silenceTimer--;
            if (p.blindTimer > 0) p.blindTimer--;
            if (p.bindingCurseTimer > 0) p.bindingCurseTimer--;
            if (p.mvFrostT > 0) p.mvFrostT--;
        }
    }

    // Theo dõi di chuyển ngang (#16, #54, #59, #60, #61)
    const curX = p.x;
    const stepX = (typeof p.gearLastX === 'number') ? (curX - p.gearLastX) : 0;
    const absStep = Math.abs(stepX);
    p.gearLastX = curX;

    // #89 Ma Trận Cổng Xoáy: dịch chuyển / đi xuyên mép sân
    if (p.hasGear('gear_hero_portal_g') && absStep > canvas.width * 0.4) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        explosions.push(new Explosion(cx, cy, 70, 'rgba(168, 85, 247,', 0, p));
        if (enemy && Array.isArray(enemy.bullets)) {
            enemy.bullets = enemy.bullets.filter(b => Math.hypot(b.x - cx, b.y - cy) > 95);
        }
        if (enemy && enemy.hp > 0 && !(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
            const dir = Math.sign(cx - (enemy.x + enemy.w / 2));
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dir * 30));
        }
    }

    if (absStep > 0.1 && absStep < 60) {
        p.gearMoveAcc = (p.gearMoveAcc || 0) + absStep;
        // #16 Đột Phá Tốc Ảnh: mỗi 200px hồi +0.35 HP
        if (p.hasGear('gear_speed_heal_p') && p.gearMoveAcc >= 200) {
            p.gearMoveAcc -= 200;
            let heal = 0.35 * getGearHealMult(p);
            p.hp = Math.min(p.maxHp, p.hp + heal);
            addFloatingText(p.x + p.w / 2, p.y - 12, `+${heal.toFixed(2)} HP ⚡`, '#38bdf8', 11);
        }

        const dir = Math.sign(stepX);
        if (dir === p.gearLastDir) {
            p.gearSameDirTicks = (p.gearSameDirTicks || 0) + 1;
            if (p.hasGear('gear_mob_momentum_s') && p.gearSameDirTicks >= 72) {
                p.gearMomentumShotReady = true;
            }
        } else {
            // Đổi hướng đột ngột khi đang chạy
            if (p.gearLastDir !== 0 && p.gearSameDirTicks >= 10) {
                triggerGearMobilityAction(p, curX - stepX, p.y);
            }
            p.gearLastDir = dir;
            p.gearSameDirTicks = 1;
        }
        // #60 Ảo Ảnh Gia Tốc: chạy đủ 250px cũng tạo Phân Ảnh
        if (p.hasGear('gear_mob_mirage_g')) {
            p.gearMirageMoveAcc = (p.gearMirageMoveAcc || 0) + absStep;
            if (p.gearMirageMoveAcc >= 250) {
                p.gearMirageMoveAcc -= 250;
                triggerGearMobilityAction(p, curX - stepX, p.y);
            }
        }
        p.gearStandStillTicks = 0;
    } else {
        p.gearSameDirTicks = 0;
        if (inp && inp.s) p.gearStandStillTicks = (p.gearStandStillTicks || 0) + 1;
        else p.gearStandStillTicks = 0;
    }

    // Phát hiện kích hoạt Lướt / Tàng hình để kích hoạt #59, #60, #61, #72, #137, #147
    const isNowDashingOrStealth = !!(p.isDashing || p.isShortgunDashing || (p.weapon === 'tank' && p.dashState > 0) || p.isGhostActive || p.stealthActive || p.isPolarDashing);
    if (isNowDashingOrStealth && !p._gearPrevMobilityState) {
        triggerGearMobilityAction(p, p.x, p.y);
        // #72 Lao Húc Không Phanh: nhận 1.5 Giáp Trắng & làm chậm địch
        if (p.hasGear('gear_ram_master_g')) {
            p.gearWhiteShield = Math.min(4.0, (p.gearWhiteShield || 0) + 1.5 * getGearHealMult(p));
            if (enemy && enemy.hp > 0) enemy.slowTimer = Math.max(enemy.slowTimer || 0, 90);
            addFloatingText(p.x + p.w / 2, p.y - 14, '+1.5 GIÁP LAO HÚC 🛡️', '#facc15', 12);
        }
        // #90 Ám Ảnh Kinh Hoàng: tăng +0.75s thời gian Vô Ảnh / Vô Hình
        if (p.hasGear('gear_hero_ghost_g') && (p.isGhostActive || p.stealthActive)) {
            if (typeof p.ghostTimer === 'number') p.ghostTimer += 45;
            if (typeof p.stealthTimer === 'number') p.stealthTimer += 45;
            p.gearGhostAmbushReady = true;
        }
    }
    p._gearPrevMobilityState = isNowDashingOrStealth;

    // #13 Kẻ Cướp Tiếp Tế: hút nhẹ các thùng có lợi về phía trục X của bạn
    if (p.hasGear('gear_crate_magnet_s') && typeof crates !== 'undefined') {
        const myCX = p.x + p.w / 2;
        crates.forEach(c => {
            if (!c || !c.active || c.type === 'boom' || c.type === 'bullets' || c.isMimic) return;
            const cCX = c.x + c.w / 2;
            if (Math.abs(myCX - cCX) > 8) {
                c.x += Math.sign(myCX - cCX) * 0.45;
            }
        });
    }

    // #19 (Độc đắc 2: Bất Tử Thân): hồi 0.4 HP/s
    if (p.hasGear('gear_all_in_gamble_p') && p.gearJackpot === 2 && p.gearRoundTicks % 30 === 0) {
        p.hp = Math.min(p.maxHp, p.hp + 0.2 * getGearHealMult(p));
    }

    // #28 Mưa Đạn: xử lý hàng chờ bắn bồi sau 0.15s (9 ticks)
    if (Array.isArray(p.gearRainQueue) && p.gearRainQueue.length > 0) {
        for (let i = p.gearRainQueue.length - 1; i >= 0; i--) {
            const q = p.gearRainQueue[i];
            if (--q.delay <= 0) {
                p.gearRainQueue.splice(i, 1);
                const dirY = p.id === 1 ? -1 : 1;
                p.bullets.push({
                    x: p.x + p.w / 2 - 3,
                    y: dirY < 0 ? p.y - 8 : p.y + p.h + 2,
                    w: 6, h: 8,
                    vx: q.vx || 0,
                    vy: q.vy || (dirY * C.bulletSpeed * 1.15),
                    dmg: Math.max(0.15, (q.dmg || p.damage) * 0.4),
                    owner: p,
                    isGearBonusShot: true,
                    hitIds: [], bounceCount: 0
                });
            }
        }
    }

    // #29 Đạn Từ Tính (Kéo Ngang): kiểm tra đạn bay sượt qua cách địch < 45px
    if (p.hasGear('gear_horizontal_pull_g')) {
        if ((p.gearPullCd || 0) > 0) p.gearPullCd--;
        else if (enemy && enemy.hp > 0 && Array.isArray(p.bullets)) {
            const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
            for (const b of p.bullets) {
                const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
                if (Math.abs(by - ey) < 28 && Math.abs(bx - ex) < 45 && Math.abs(bx - ex) > 4) {
                    if (!(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
                        const pullDir = Math.sign(bx - ex);
                        enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + pullDir * Math.min(25, Math.abs(bx - ex))));
                        spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#a855f7', 6);
                        p.gearPullCd = 150; // CD 2.5s
                    }
                    break;
                }
            }
        }
    }

    // #38 Lõi Năng Lượng Vĩnh Cửu: +30% hồi năng lượng / hạ nhiệt
    if (p.hasGear('gear_energy_core_g')) {
        if (p.weapon === 'water_gun' || p.weapon === 'furnace') {
            p.energy = Math.min(p.maxEnergy || 100, (p.energy || 0) + 0.05);
        } else if (p.weapon === 'six_barrel' && (p.heat || 0) > 0) {
            p.heat = Math.max(0, p.heat - 0.12);
        } else if (p.weapon === 'lazer_auto' && (p.laHeat || 0) > 0) {
            p.laHeat = Math.max(0, p.laHeat - 0.12);
        } else if (p.weapon === 'the_strongest' && (p.chuLucRegenCooldown || 0) <= 0) {
            p.chuLuc = Math.min(p.maxChuLuc || 100, (p.chuLuc || 0) + 0.08);
        } else if (p.weapon === 'sukuna' && (p.sukunaCeLockTimer || 0) <= 0) {
            p.cursedEnergy = Math.min(100, (p.cursedEnergy || 0) + 0.08);
        } else if (p.weapon === 'necromancer' && (p.necroRegenCooldown || 0) <= 0) {
            const cap = (p.maxSouls || 10) - (p.lockedSouls || 0);
            p.currentSouls = Math.min(cap, (p.currentSouls || 0) + 0.02);
        }
    }

    // #39 Phát Bắn Đầu Tiên: làm mới mỗi 10s
    if (p.hasGear('gear_first_strike_s') && !p.gearFirstStrikeReady) {
        if (--p.gearFirstStrikeTimer <= 0) {
            p.gearFirstStrikeReady = true;
            p.gearFirstStrikeTimer = 600;
        }
    }

    // #43 Máy Tạo Khiên Tự Động: mỗi 12s tạo 1 lớp Khiên (tối đa tích 2 lớp)
    if (p.hasGear('gear_auto_shield_p')) {
        if (--p.gearAutoShieldTimer <= 0) {
            p.gearAutoShieldTimer = 720;
            if ((p.shield || 0) < 2) {
                p.shield = (p.shield || 0) + 1;
                addFloatingText(p.x + p.w / 2, p.y - 14, '+1 KHIÊN TỰ ĐỘNG 🛡️', '#38bdf8', 12);
            }
        }
    }

    // #44 Giáp Phản Đòn CD
    if ((p.gearThornCd || 0) > 0) p.gearThornCd--;

    // #45 Hấp Thụ Đạn Đạo: mỗi 8s bật màng từ trường 1.0s
    if (p.hasGear('gear_bullet_eater_g')) {
        if ((p.gearBulletEaterActive || 0) > 0) {
            p.gearBulletEaterActive--;
        } else {
            p.gearBulletEaterTimer = (p.gearBulletEaterTimer || 0) + 1;
            if (p.gearBulletEaterTimer >= 480) {
                p.gearBulletEaterTimer = 0;
                p.gearBulletEaterActive = 60;
            }
        }
    }

    // #46 Chiến Binh Vòng Bo (Đột Tử): kích hoạt ở giây 45 hoặc khi Bo thu hẹp
    const timePlayed = Date.now() - (gameState.roundStartTime || Date.now());
    const zs = (typeof getZoneState === 'function') ? getZoneState(timePlayed) : null;
    p.gearInSuddenDeathZone = !!zs;
    if (p.hasGear('gear_sudden_death_s') && !p.gearSuddenDeathTriggered && (timePlayed >= 45000 || zs)) {
        p.gearSuddenDeathTriggered = true;
        p.hp = Math.min(p.maxHp, p.hp + 2.5 * getGearHealMult(p));
        p.shield = (p.shield || 0) + 1;
        addFloatingText(p.x + p.w / 2, p.y - 16, 'CHIẾN BINH VÒNG BO! +2.5 HP & +1 KHIÊN 🔥', '#facc15', 14);
    }

    // #48 Hồi Máu Chiến Trường: sau 4s (240 ticks) không nhận sát thương -> hồi 0.25 HP/s
    p.gearNoDmgTicks = (p.gearNoDmgTicks || 0) + 1;
    if (p.hasGear('gear_combat_regen_s') && p.gearNoDmgTicks >= 240 && p.gearRoundTicks % 30 === 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + 0.125 * getGearHealMult(p));
    }

    // #53 Xung Kích Khát Máu timer
    if ((p.gearFrenzyTimer || 0) > 0) {
        if (--p.gearFrenzyTimer <= 0) p.gearFrenzyStacks = 0;
    }

    // #56 Xiềng Xích Đọa Đầy: địch đang dính CC chịu thêm 0.15 sát thương bóng tối mỗi giây
    if (p.hasGear('gear_ctrl_torment_g') && enemy && enemy.hp > 0 && p.gearRoundTicks % 60 === 0 && isPlayerAfflictedByCC(enemy)) {
        enemy.hp = Math.max(0.1, enemy.hp - 0.15);
        addFloatingText(enemy.x + enemy.w / 2, enemy.y - 10, '-0.15 ⛓️', '#c084fc', 11);
    }

    // #57 Ngục Tù Không Gian 1D timer
    if (p.hasGear('gear_ctrl_prison_p') && !p.gearPrisonReady) {
        if (--p.gearPrisonTimer <= 0) {
            p.gearPrisonReady = true;
            p.gearPrisonTimer = 600;
        }
    }

    // Cooldowns của nhóm Cơ Động (#59, #60, #61, #62, #137)
    if ((p.gearStepCd || 0) > 0) p.gearStepCd--;
    if ((p.gearStepSpdTimer || 0) > 0) p.gearStepSpdTimer--;
    if ((p.gearMirageCd || 0) > 0) p.gearMirageCd--;
    if ((p.gearPhantomCd || 0) > 0) p.gearPhantomCd--;
    if ((p.gearPhantomEvasionTimer || 0) > 0) p.gearPhantomEvasionTimer--;
    if ((p.gearHitAndRunCd || 0) > 0) p.gearHitAndRunCd--;
    if ((p.gearHitAndRunTimer || 0) > 0) p.gearHitAndRunTimer--;
    if ((p.gearFireTrailCd || 0) > 0) p.gearFireTrailCd--;

    // #64 Pháo Đài Sinh Học: khi máu < 50% Max HP, tự hồi +0.35 HP/giây
    if ((p.hasGear('gear_surv_fortress_g') || p.hasGear('gear_surv_undying_g')) && p.gearRoundTicks % 30 === 0 && (p.hp / Math.max(1, p.maxHp)) < 0.5) {
        const heal = 0.175 * getGearHealMult(p);
        p.hp = Math.min(p.maxHp, p.hp + heal);
    }

    // #65 Trái Tim Bất Diệt: mỗi 8s tỏa sóng làm chậm đạn địch trong tầm 120px đi 30%
    if (p.hasGear('gear_surv_titan_p') && p.gearRoundTicks % 480 === 0 && enemy && Array.isArray(enemy.bullets)) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        explosions.push(new Explosion(cx, cy, 90, 'rgba(56, 189, 248,', 0, p));
        enemy.bullets.forEach(b => {
            if (Math.hypot(b.x - cx, b.y - cy) <= 120 && !b._titanSlowed) {
                b._titanSlowed = true;
                b.vx *= 0.7;
                b.vy *= 0.7;
            }
        });
    }

    // #71 Kiếm Khí Hộ Thể: mỗi 4s (240 ticks) chém tan 1 viên đạn địch gần xe & phóng kiếm khí 0.6 dame
    if (p.hasGear('gear_sword_aura_g')) {
        if ((p.gearSwordAuraTimer || 0) > 0) p.gearSwordAuraTimer--;
        else if (enemy && Array.isArray(enemy.bullets)) {
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            const idx = enemy.bullets.findIndex(b => !b.isPiercing && Math.hypot(b.x - cx, b.y - cy) <= 75);
            if (idx !== -1) {
                p.gearSwordAuraTimer = 240;
                const b = enemy.bullets[idx];
                spawnSparkParticles(b.x, b.y, '#38bdf8', 10);
                enemy.bullets.splice(idx, 1);
                const dirY = p.id === 1 ? -1 : 1;
                p.bullets.push({
                    x: cx - 5, y: dirY < 0 ? p.y - 10 : p.y + p.h + 2,
                    w: 10, h: 14, vx: 0, vy: dirY * C.bulletSpeed * 1.35,
                    dmg: 0.6, owner: p, isGearBonusShot: true, hitIds: [], bounceCount: 0
                });
                addFloatingText(cx, p.y - 14, 'KIẾM KHÍ HỘ THỂ! ⚔️', '#38bdf8', 11);
            }
        }
    }

    // #73 Tụ Lực Siêu Tốc: giảm 30% thời gian giữ nút Bắn để đạt tối đa lực tụ
    if ((p.hasGear('gear_fast_charge_s') || p.hasGear('gear_charge_shield_g')) && inp && inp.s && p.gearRoundTicks % 3 === 0) {
        if (typeof p.bowChargeTimer === 'number' && p.bowChargeTimer > 0) p.bowChargeTimer++;
        if (typeof p.lazerCharge === 'number' && p.lazerCharge > 0) p.lazerCharge++;
        if (typeof p.chargeLevel === 'number' && p.weapon !== 'wind_slash' && p.chargeLevel > 0) p.chargeLevel += 0.3;
        if (typeof p.gojoChargeTimer === 'number' && p.gojoChargeTimer > 0) p.gojoChargeTimer++;
        if (typeof p.sukunaChargeTimer === 'number' && p.sukunaChargeTimer > 0) p.sukunaChargeTimer++;
        if (typeof p.stormChargeTimer === 'number' && p.stormChargeTimer > 0) p.stormChargeTimer++;
    }

    // #74 Bẫy Mìn Giữa Sân: mỗi 8s (480 ticks) thả 1 mìn tàng hình trên làn kẻ địch
    if (p.hasGear('gear_minefield_s') || p.hasGear('gear_mine_layer_s')) {
        if (--p.gearMineTimer <= 0) {
            p.gearMineTimer = 480;
            const activeMines = bodyEffects.filter(e => e instanceof GearMine && e.team === p.id && e.active);
            if (activeMines.length >= 2) activeMines[0].active = false;
            if (enemy && enemy.hp > 0) {
                const pt = laneTargetPoint(enemy, 90);
                bodyEffects.push(new GearMine(p, pt.x - 8, pt.y - 8));
            }
        }
    }

    // #75 Pháo Kích Hỗ Trợ: mỗi 7s (420 ticks) gọi 2 quả đạn Pháo Kích rơi xuống làn kẻ địch
    if (p.hasGear('gear_artillery_call_g')) {
        if (--p.gearArtilleryTimer <= 0) {
            p.gearArtilleryTimer = 420;
            if (enemy && enemy.hp > 0) {
                for (let k = 0; k < 2; k++) {
                    const pt = laneTargetPoint(enemy, 75);
                    bodyEffects.push(new GearFieldDevice(p, 'artillery', pt.x, pt.y, { life: 90 }));
                }
            }
        }
    }

    // #76 Cơn Bão Từ Trường: mỗi 5s (300 ticks) giáng 3 tia sét xuống làn địch + 1 vùng sét đồng minh
    if (p.hasGear('gear_map_storm_p')) {
        if (--p.gearStormMapTimer <= 0) {
            p.gearStormMapTimer = 300;
            if (enemy && enemy.hp > 0) {
                for (let k = 0; k < 3; k++) {
                    const pt = laneTargetPoint(enemy, 110);
                    bodyEffects.push(new GearStormBolt(p, pt.x, pt.y, false));
                }
            }
            const allyX = Math.max(40, Math.min(canvas.width - 40, p.x + p.w / 2 + (Math.random() - 0.5) * 90));
            const allyY = p.y + p.h / 2;
            bodyEffects.push(new GearStormBolt(p, allyX, allyY, true));
        }
    }

    // #77 Tường Chắn Di Động: mỗi 14s (840 ticks) dựng tường chắn trước mặt
    if (p.hasGear('gear_auto_wall_g')) {
        if (--p.gearWallTimer <= 0) {
            p.gearWallTimer = 840;
            bodyEffects.push(new GearBarrierWall(p));
        }
    }

    // #84 Chiến Xa Thiết Giáp (Tank): cho phép bẻ lái ngang nhẹ khi đang lao húc
    if (p.hasGear('gear_hero_tank_g') && p.weapon === 'tank' && p.dashState > 0 && inp) {
        if (inp.l) p.x = Math.max(0, p.x - 1.8);
        if (inp.r) p.x = Math.min(canvas.width - p.w, p.x + 1.8);
    }

    // #85 Độ Không Tuyệt Đối CD
    if ((p.gearIceFreezeCd || 0) > 0) p.gearIceFreezeCd--;

    // #87 Phản Ứng Dây Chuyền (Overload): tụ thanh năng lượng nhanh hơn
    if (p.hasGear('gear_hero_overload_g') && p.weapon === 'overload' && !p.isOverloaded) {
        p.overloadCharge = Math.min(100, (p.overloadCharge || 0) + 0.18);
    }

    // #92 Lãnh Địa Bất Diệt CD
    if ((p.gearJjkShieldCd || 0) > 0) p.gearJjkShieldCd--;

    // #95 Gia Tộc Cơ Khí Alano: hồi 0.3 HP/s cho công trình/vật triệu hồi
    if (p.hasGear('gear_hero_family_p') && p.gearRoundTicks % 30 === 0) {
        if (typeof turrets !== 'undefined') turrets.forEach(t => { if (t.owner === p && t.active) t.hp = Math.min(t.maxHp || 6, t.hp + 0.15); });
        if (typeof creatorTurrets !== 'undefined') creatorTurrets.forEach(t => { if (t.owner === p && t.active) t.hp = Math.min(t.maxHp || 8, t.hp + 0.15); });
        if (typeof creatorRobots !== 'undefined') creatorRobots.forEach(r => { if (r.owner === p && r.active) r.hp = Math.min(r.maxHp || 10, r.hp + 0.15); });
        if (Array.isArray(p.drones)) p.drones.forEach(d => { if (d.active && d.hp < d.maxHp) d.hp = Math.min(d.maxHp, d.hp + 0.15); });
    }

    // #98 Đồng Tâm Hiệp Lực: kiểm tra khoảng cách tới bản sao / Phi Ảnh
    if (p.hasGear('gear_hero_twins_g')) {
        if ((p.gearTwinSynergyTimer || 0) > 0) p.gearTwinSynergyTimer--;
        const myCX = p.x + p.w / 2;
        if (p.weapon === 'mirror' && p.shatteredClone && p.shatteredClone.active && Math.abs(myCX - (p.shatteredClone.x + p.w / 2)) < 120) {
            p.gearTwinSynergyTimer = Math.max(p.gearTwinSynergyTimer || 0, 30);
        }
        if (typeof bodyEffects !== 'undefined') {
            for (const ef of bodyEffects) {
                if (!ef || !ef.active) continue;
                if ((ef.owner === p || ef.team === p.id) && (ef.constructor.name === 'GeminiTwin' || ef.constructor.name === 'ClClone' || ef.constructor.name === 'JpFlyby')) {
                    if (Math.abs(myCX - (ef.x + (ef.w || 0) / 2)) < 120) {
                        p.gearTwinSynergyTimer = Math.max(p.gearTwinSynergyTimer || 0, 30);
                    }
                }
            }
        }
    }

    // #100 Bậc Thầy Võ Đạo CD
    if ((p.gearMartialCd || 0) > 0) p.gearMartialCd--;

    // ---------------------------------------------------------
    // XỬ LÝ TICK CHO 44 LÕI MỚI (#107 – #150)
    // ---------------------------------------------------------
    // #109 Đạn Hồi Tuyển (Boomerang) timer
    if (p.hasGear('gear_atk_boomerang_g') && !p.gearBoomerangReady) {
        if (--p.gearBoomerangTimer <= 0) {
            p.gearBoomerangReady = true;
            p.gearBoomerangTimer = 240;
        }
    }
    // #110 Đạn Hố Đen timer
    if (p.hasGear('gear_atk_blackhole_p') && !p.gearBlackholeReady) {
        if (--p.gearBlackholeTimer <= 0) {
            p.gearBlackholeReady = true;
            p.gearBlackholeTimer = 540;
        }
    }
    // #118 Micro-EMP timer
    if (p.hasGear('gear_atk_emp_pulse_s') && !p.gearMicroEmpReady) {
        if (--p.gearMicroEmpTimer <= 0) {
            p.gearMicroEmpReady = true;
            p.gearMicroEmpTimer = 420;
        }
    }
    // #119 Đạn Thiêu Đốt Linh Hồn CD
    if ((p.gearSoulBurnCd || 0) > 0) p.gearSoulBurnCd--;

    // #121 Nòng Súng Tụ Điện: mỗi giây không bắn tích 1 tầng (tối đa 4)
    if (p.hasGear('gear_atk_overcharge_s') && (p.gearOverchargeStacks || 0) < 4) {
        p.gearOverchargeIdleTicks = (p.gearOverchargeIdleTicks || 0) + 1;
        if (p.gearOverchargeIdleTicks >= 60) {
            p.gearOverchargeIdleTicks = 0;
            p.gearOverchargeStacks = Math.min(4, (p.gearOverchargeStacks || 0) + 1);
        }
    }

    // #123 Trạm Quân Y Dã Chiến: mỗi 12s (720 ticks)
    if (p.hasGear('gear_sup_heal_beacon_g')) {
        if (--p.gearBeaconTimer <= 0) {
            p.gearBeaconTimer = 720;
            bodyEffects.push(new GearFieldDevice(p, 'heal_beacon', Math.max(24, Math.min(canvas.width - 44, p.x + (Math.random() < 0.5 ? -36 : p.w + 14))), p.y, { hp: 3.0, life: 420 }));
        }
    }

    // #124 Hệ Thống Đánh Chặn (Trophy ADS): mỗi 3.5s (210 ticks) xóa 1 viên đạn địch bay tới gần
    if (p.hasGear('gear_sup_trophy_ads_g')) {
        if ((p.gearTrophyTimer || 0) > 0) p.gearTrophyTimer--;
        else if (enemy && Array.isArray(enemy.bullets)) {
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            const idx = enemy.bullets.findIndex(b => !b.isPiercing && Math.hypot(b.x - cx, b.y - cy) <= 95);
            if (idx !== -1) {
                p.gearTrophyTimer = 210;
                const b = enemy.bullets[idx];
                spawnSparkParticles(b.x, b.y, '#4ade80', 10);
                enemy.bullets.splice(idx, 1);
                addFloatingText(cx, p.y - 12, 'TROPHY ĐÁNH CHẶN! 🛰️', '#4ade80', 10);
            }
        }
    }

    // #125 Cột Thu Lôi Từ Trường: mỗi 13s (780 ticks)
    if (p.hasGear('gear_sup_tesla_coil_g')) {
        if (--p.gearTeslaTimer <= 0) {
            p.gearTeslaTimer = 780;
            bodyEffects.push(new GearFieldDevice(p, 'tesla_coil', Math.max(24, Math.min(canvas.width - 44, p.x - 36)), p.y, { hp: 3.5, life: 480, timer: 100 }));
        }
    }

    // #126 Cọc Băng Hàn Khí: mỗi 10s (600 ticks) ở giữa sân
    if (p.hasGear('gear_sup_frost_totem_s')) {
        if (--p.gearFrostTotemTimer <= 0) {
            p.gearFrostTotemTimer = 600;
            const tx = Math.max(40, Math.min(canvas.width - 60, p.x + p.w / 2 - 11));
            const ty = canvas.height / 2 + (p.id === 1 ? 26 : -48);
            bodyEffects.push(new GearFieldDevice(p, 'frost_totem', tx, ty, { hp: 2.5, life: 360 }));
        }
    }

    // #128 Vệ Tinh Quỹ Đạo (Orbital Laser): mỗi 6.5s (390 ticks)
    if (p.hasGear('gear_sup_satellite_p')) {
        if (--p.gearSatelliteTimer <= 0) {
            p.gearSatelliteTimer = 390;
            if (enemy && enemy.hp > 0) {
                bodyEffects.push(new GearFieldDevice(p, 'satellite_laser', enemy.x + enemy.w / 2, enemy.y, { life: 72 }));
                addFloatingText(p.x + p.w / 2, p.y - 16, 'VỆ TINH QUỸ ĐẠO! 🛰️', '#38bdf8', 12);
            }
        }
    }

    // #129 Máy Chiếu Phân Thân (Holo-Decoy): mỗi 9s (540 ticks)
    if (p.hasGear('gear_sup_decoy_holo_s')) {
        if (--p.gearHoloDecoyTimer <= 0) {
            p.gearHoloDecoyTimer = 540;
            bodyEffects.push(new GearFieldDevice(p, 'holo_decoy', p.x, p.y, { w: p.w, h: p.h, hp: 1.5, life: 300, vx: (Math.random() < 0.5 ? 2.2 : -2.2) }));
        }
    }

    // #130 Khoang Tiếp Tế Không Gian: mỗi 11s (660 ticks)
    if (p.hasGear('gear_sup_supply_pod_g')) {
        if (--p.gearSupplyPodTimer <= 0) {
            p.gearSupplyPodTimer = 660;
            const px = Math.max(30, Math.min(canvas.width - 54, p.x + (Math.random() - 0.5) * 140));
            bodyEffects.push(new GearFieldDevice(p, 'supply_pod', px, p.y + 2, { w: 22, h: 22, hp: 99, life: 420 }));
        }
    }

    // #131 Cọc Trọng Trường: mỗi 11s (660 ticks) cắm xuống làn địch
    if (p.hasGear('gear_sup_gravity_well_g')) {
        if (--p.gearGravityWellTimer <= 0) {
            p.gearGravityWellTimer = 660;
            if (enemy && enemy.hp > 0) {
                bodyEffects.push(new GearFieldDevice(p, 'gravity_well', enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, { life: 210 }));
            }
        }
    }

    // #135 Màn Chắn Khúc Xạ: mỗi 12s (720 ticks)
    if (p.hasGear('gear_sup_mirror_wall_g')) {
        if (--p.gearMirrorWallTimer <= 0) {
            p.gearMirrorWallTimer = 720;
            bodyEffects.push(new GearFieldDevice(p, 'mirror_wall', p.x, p.y, { w: 48, h: 8, hp: 3.0, life: 180 }));
        }
    }

    // #138 Ma Trận Làm Chậm Thời Gian (Bullet Time): làm chậm 45% đạn địch bay vào bán kính 115px quanh xe
    if (p.hasGear('gear_tac_bullet_time_p') && enemy && Array.isArray(enemy.bullets)) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        enemy.bullets.forEach(b => {
            if (!b._bulletTimeSlowed && Math.hypot(b.x - cx, b.y - cy) <= 115) {
                b._bulletTimeSlowed = true;
                b.vx = (b.vx || 0) * 0.55;
                b.vy = (b.vy || 0) * 0.55;
            }
        });
    }

    // #139 Hưng Phấn Tác Chiến: kiểm tra máu địch xuống < 35% lần đầu
    if (p.hasGear('gear_tac_adrenaline_g') && !p.gearAdrenalineLowTriggered && enemy && enemy.hp > 0 && (enemy.hp / Math.max(1, enemy.maxHp)) < 0.35) {
        p.gearAdrenalineLowTriggered = true;
        triggerGearAdrenaline(p);
    }

    // #142 Quá Tải Chu Kỳ (Overclock): mỗi 8s (480 ticks) bật Quá Tải 2.5s (150 ticks)
    if (p.hasGear('gear_tac_overclock_g')) {
        if ((p.gearOverclockActive || 0) > 0) {
            p.gearOverclockActive--;
        } else if (--p.gearOverclockTimer <= 0) {
            p.gearOverclockTimer = 480;
            p.gearOverclockActive = 150;
            addFloatingText(p.x + p.w / 2, p.y - 16, 'QUÁ TẢI CHU KỲ! ⚡🔥', '#facc15', 13);
        }
    }

    // Cooldowns của Nhóm 12 (#143, #147, #148, #150)
    if ((p.gearMysticCd || 0) > 0) p.gearMysticCd--;
    if ((p.gearThunderMagCd || 0) > 0) p.gearThunderMagCd--;
    if ((p.gearApexShockCd || 0) > 0) p.gearApexShockCd--;
    if ((p.gearCloneArmyCd || 0) > 0) p.gearCloneArmyCd--;
}

function triggerGearAdrenaline(p) {
    if (!p) return;
    p.gearAdrenalineTimer = 210; // 3.5s
    p.hp = Math.min(p.maxHp, p.hp + 0.8 * getGearHealMult(p));
    addFloatingText(p.x + p.w / 2, p.y - 18, 'HƯNG PHẤN! +0.8 HP & TĂNG TỐC 🔥', '#facc15', 13);
}

function tickGearDebuffsOnTarget(p) {
    if (!p) return;
    if ((p.gearBurnTimer || 0) > 0) {
        p.gearBurnTimer--;
        if (p.gearBurnTimer % 30 === 0 && p.hp > 0.2) {
            let d = 0.1;
            if (p.hasGear && p.hasGear('gear_tenacity_s')) d *= 0.7;
            p.hp = Math.max(0.1, p.hp - d);
            addFloatingText(p.x + p.w / 2, p.y - 10, `-${d.toFixed(2)} 🔥`, '#fb923c', 10);
        }
    }
    // #111 Đạn Độc Tố Cộng Dồn
    if ((p.gearVenomTimer || 0) > 0) {
        p.gearVenomTimer--;
        if (p.gearVenomTimer % 30 === 0 && (p.gearVenomStacks || 0) > 0 && p.hp > 0.2) {
            let d = 0.04 * p.gearVenomStacks;
            if (p.hasGear && p.hasGear('gear_tenacity_s')) d *= 0.7;
            p.hp = Math.max(0.1, p.hp - d);
            addFloatingText(p.x + p.w / 2, p.y - 10, `-${d.toFixed(2)} ☣️`, '#4ade80', 10);
        }
        if (p.gearVenomTimer <= 0) p.gearVenomStacks = 0;
    }
    if ((p.gearShreddedTimer || 0) > 0) p.gearShreddedTimer--;
    if ((p.gearExhaustTimer || 0) > 0) p.gearExhaustTimer--;
    if ((p.gearEmpSlowReloadTimer || 0) > 0) p.gearEmpSlowReloadTimer--;
    if ((p.gearStormAtkSpdTimer || 0) > 0) p.gearStormAtkSpdTimer--;
    if ((p.gearBeaconBuffTimer || 0) > 0) p.gearBeaconBuffTimer--;
    if ((p.gearCritSpdTimer || 0) > 0) p.gearCritSpdTimer--;
    if ((p.gearDeathMarkSpdTimer || 0) > 0) p.gearDeathMarkSpdTimer--;
    if ((p.gearSupplyDmgTimer || 0) > 0) p.gearSupplyDmgTimer--;
    if ((p.gearInGravityWellTimer || 0) > 0) p.gearInGravityWellTimer--;
    if ((p.gearAdrenalineTimer || 0) > 0) p.gearAdrenalineTimer--;
    if ((p.gearMysteryDmgTimer || 0) > 0) p.gearMysteryDmgTimer--;
    if ((p.gearMysterySpdTimer || 0) > 0) p.gearMysterySpdTimer--;
}

function getGearHealMult(p) {
    if (!p || !p.hasGear) return 1;
    let m = 1;
    if ((p.hasGear('gear_surv_fortress_g') || p.hasGear('gear_surv_undying_g')) && (p.hp / Math.max(1, p.maxHp)) < 0.5) {
        m *= 1.3;
    }
    if ((p.gearVenomStacks || 0) > 0) {
        m *= Math.max(0.7, 1 - 0.06 * p.gearVenomStacks);
    }
    return m;
}

function triggerGearMobilityAction(p, oldX, oldY) {
    if (!p || !p.hasGear) return;
    if (p.hasGear('gear_mob_step_s') && (p.gearStepCd || 0) <= 0) {
        p.gearStepCd = 180;
        p.gearStepSpdTimer = 48; // +25% tốc chạy 0.8s
    }
    if (p.hasGear('gear_mob_mirage_g') && (p.gearMirageCd || 0) <= 0) {
        p.gearMirageCd = 240;
        p.gearMirageBonusShot = true;
        bodyEffects.push(new GearMirage(p, oldX, oldY));
    }
    if (p.hasGear('gear_mob_phantom_p') && (p.gearPhantomCd || 0) <= 0) {
        p.gearPhantomCd = 240;
        p.gearPhantomEvasionTimer = 72;
    }
    // #137 Bước Chân Hỏa Ngục: phóng 2 Cầu Lửa về phía địch khi lướt / đổi hướng nhanh
    if (p.hasGear('gear_tac_fire_trail_s') && (p.gearFireTrailCd || 0) <= 0) {
        p.gearFireTrailCd = 150;
        const dirY = p.id === 1 ? -1 : 1;
        [-1.2, 1.2].forEach(vx => {
            p.bullets.push({
                x: p.x + p.w / 2 - 4, y: dirY < 0 ? p.y - 6 : p.y + p.h + 2,
                w: 8, h: 8, vx: vx, vy: dirY * C.bulletSpeed * 1.15,
                dmg: 0.4, owner: p, isGearBonusShot: true, _gearFireball: true,
                hitIds: [], bounceCount: 0
            });
        });
    }
}

// Xử lý đạn mới được bắn ra (áp dụng cho cả fireBullet và spawnBullet)
function onGearBulletSpawned(p, b) {
    if (!p || !b || !p.hasGear || b._gearProcessed) return;
    b._gearProcessed = true;
    b._gearSpawnY = b.y;

    // #25 Đánh Đổi Liều Lĩnh: +15% tốc đạn
    if (p.hasGear('gear_glass_cannon_g')) {
        b.vx = (b.vx || 0) * 1.15;
        b.vy = (b.vy || 0) * 1.15;
    }

    // #27 Đạn To: +35% kích thước đạn
    if (p.hasGear('gear_big_shot_s')) {
        const cx = b.x + (b.w || 6) / 2;
        b.w = Math.round((b.w || 6) * 1.35);
        b.h = Math.round((b.h || 6) * 1.35);
        b.x = cx - b.w / 2;
    }

    // #35 Tay Súng Thiện Xạ: +35% tốc đạn
    if (p.hasGear('gear_sniper_scope_g')) {
        b.vx = (b.vx || 0) * 1.35;
        b.vy = (b.vy || 0) * 1.35;
    }

    // #53 Xung Kích Khát Máu: khi máu địch < 50% HP, đạn bay nhanh +40% & xuyên vật triệu hồi
    if (p.hasGear('gear_duel_frenzy_p')) {
        const enemy = p.id === 1 ? p2 : p1;
        if (enemy && enemy.hp > 0 && (enemy.hp / Math.max(1, enemy.maxHp)) < 0.5) {
            b.vx = (b.vx || 0) * 1.40;
            b.vy = (b.vy || 0) * 1.40;
            b.isPiercing = true;
        }
    }

    // #62 Bắn Khi Đang Chạy: vừa di chuyển vừa bắn -> đạn bay nhanh +25%
    if (p.hasGear('gear_mob_run_gun_s')) {
        const inp = p.id === 1 ? inputs.p1 : inputs.p2;
        if (inp && (inp.l || inp.r)) {
            b.vx = (b.vx || 0) * 1.25;
            b.vy = (b.vy || 0) * 1.25;
        }
    }

    // #39 Phát Bắn Đầu Tiên: bay nhanh + +0.8 sát thương
    if (p.hasGear('gear_first_strike_s') && p.gearFirstStrikeReady && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearFirstStrikeReady = false;
        p.gearFirstStrikeTimer = 600;
        b.vx = (b.vx || 0) * 1.45;
        b.vy = (b.vy || 0) * 1.45;
        b.dmg = (b.dmg || p.damage) + 0.8;
        b._isFirstStrike = true;
    }

    // #83 Đạn Pháo Cải Tiến (Basic): mỗi viên thứ 4 to gấp đôi, x1.5 dame nổ lan & hồi +0.5 HP khi trúng
    if (p.hasGear('gear_hero_basic_g') && p.weapon === 'basic' && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearBasicShotCount = (p.gearBasicShotCount || 0) + 1;
        if (p.gearBasicShotCount % 4 === 0) {
            const cx = b.x + (b.w || 6) / 2;
            b.w = (b.w || 6) * 2;
            b.h = (b.h || 6) * 2;
            b.x = cx - b.w / 2;
            b.dmg = (b.dmg || p.damage) * 1.5;
            b.isExplosive = true;
            b._gearBasicCannon = true;
        }
    }

    // #90 Ám Ảnh Kinh Hoàng (Ghost / Shadow Hunter): phát đầu thoát tàng hình x1.4 dame & hồi 1 đạn
    if (p.hasGear('gear_hero_ghost_g') && p.gearGhostAmbushReady && !b.isGearBonusShot) {
        p.gearGhostAmbushReady = false;
        b.dmg = (b.dmg || p.damage) * 1.4;
        p.ammo = Math.min(p.maxAmmo, (p.ammo || 0) + 1);
        addFloatingText(p.x + p.w / 2, p.y - 16, 'ÁM SÁT CHÍ MẠNG! x1.4 💥', '#a855f7', 13);
    }

    // #91 Vạn Kiếm Triều Tông: +25% tốc phóng kiếm & mỗi 6 thanh kiếm giáng 1 Thần Kiếm Khổng Lồ
    if (p.hasGear('gear_hero_swords_p') && !b.isGearBonusShot && !b.isGearDroneBullet) {
        b.vx = (b.vx || 0) * 1.25;
        b.vy = (b.vy || 0) * 1.25;
        p.gearSwordRainCount = (p.gearSwordRainCount || 0) + 1;
        if (p.gearSwordRainCount % 6 === 0) {
            const enemy = p.id === 1 ? p2 : p1;
            if (enemy && enemy.hp > 0 && typeof SkyStrike !== 'undefined') {
                const pt = laneTargetPoint(enemy, 45);
                bodyEffects.push(new SkyStrike(pt.x, pt.y, p, 1.5, 42, 75));
                addFloatingText(p.x + p.w / 2, p.y - 18, 'VẠN KIẾM TRIỀU TÔNG! 🗡️', '#ffd700', 13);
            }
        }
    }

    // #93 Phát Bắn Bách Phát Bách Trúng: trúng 2 phát liên tiếp -> phát thứ 3 +0.8 dame chuẩn & Choáng 0.5s
    if (p.hasGear('gear_hero_marksman_g') && (p.gearMarksmanConsecHits || 0) >= 2 && !b.isGearBonusShot) {
        p.gearMarksmanConsecHits = 0;
        b.dmg = (b.dmg || p.damage) + 0.8;
        b._gearTrueShot = true;
        addFloatingText(p.x + p.w / 2, p.y - 16, 'BÁCH PHÁT BÁCH TRÚNG! 🎯', '#facc15', 13);
    }

    // #97 Xích Tử Thần Nung Đỏ: đạn Cấm Chế của Death Lock bay nhanh +35%
    if (p.hasGear('gear_hero_hook_g') && b.isConfinementBullet) {
        b.vx = (b.vx || 0) * 1.35;
        b.vy = (b.vy || 0) * 1.35;
    }

    // #100 Bậc Thầy Võ Đạo: đòn cường hóa hồi +0.6 HP & +1 Khiên (CD 4s)
    if (p.hasGear('gear_hero_martial_p') && (p.gearMartialCd || 0) <= 0 && !b.isGearBonusShot) {
        p.gearMartialCd = 240;
        p.shield = (p.shield || 0) + 1;
        p.hp = Math.min(p.maxHp, p.hp + 0.6 * getGearHealMult(p));
        addFloatingText(p.x + p.w / 2, p.y - 16, 'VÕ ĐẠO! +1 KHIÊN & +0.6 HP 🥋', '#f472b6', 12);
    }

    // #109 Đạn Hồi Tuyển (Boomerang): đánh dấu phát đạn vòng ngược về
    if (p.hasGear('gear_atk_boomerang_g') && p.gearBoomerangReady && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearBoomerangReady = false;
        p.gearBoomerangTimer = 240;
        b._gearBoomerang = true;
    }

    // #113 Lăng Kính Chí Mạng (25% x1.5) & #114 Tuyệt Kỹ Tử Điểm (35% x1.85 + hồi 1 đạn)
    if (!b.isGearDroneBullet && (p.hasGear('gear_atk_crit_s') || p.hasGear('gear_atk_crit_master_p'))) {
        const isMaster = p.hasGear('gear_atk_crit_master_p');
        const critChance = isMaster ? 0.35 : 0.25;
        if (Math.random() < critChance) {
            b.dmg = (b.dmg || p.damage) * (isMaster ? 1.85 : 1.50);
            b._gearCrit = true;
            if (isMaster) {
                p.ammo = Math.min(p.maxAmmo, (p.ammo || 0) + 1);
                if (p.weapon === 'water_gun' || p.weapon === 'furnace') p.energy = Math.min(p.maxEnergy || 100, (p.energy || 0) + 15);
                p.gearCritSpdTimer = 90;
            }
        }
    }

    // #117 Đạn Dẫn Đường Từ Tính: gắn cờ dẫn đường mềm
    if (p.hasGear('gear_atk_homing_g') && !b.isGearDroneBullet) {
        b._gearHoming = true;
    }

    // #120 Đạn Xuyên Không (Phase Shot): bắn xuyên qua thùng, xe tiền và vật triệu hồi
    if (p.hasGear('gear_atk_phase_pierce_g')) {
        b.isPiercing = true;
    }

    // #121 Nòng Súng Tụ Điện: tiêu thụ tầng Tụ Điện để tăng +18% Dame & +15% kích thước mỗi tầng
    if (p.hasGear('gear_atk_overcharge_s') && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearOverchargeIdleTicks = 0;
        const st = p.gearOverchargeStacks || 0;
        if (st > 0) {
            p.gearOverchargeStacks = 0;
            b.dmg = (b.dmg || p.damage) * (1 + 0.18 * st);
            const szMult = 1 + 0.15 * st;
            const cx = b.x + (b.w || 6) / 2;
            b.w = Math.round((b.w || 6) * szMult);
            b.h = Math.round((b.h || 6) * szMult);
            b.x = cx - b.w / 2;
            addFloatingText(p.x + p.w / 2, p.y - 16, `TỤ ĐIỆN x${st}! ⚡`, '#38bdf8', 11);
        }
    }

    // #122 Nanh Kép Song Hành: mỗi phát thứ 2 tách thành 2 viên song song (mỗi viên 65% dame = tổng 130%)
    if (p.hasGear('gear_atk_twin_fang_g') && !b.isGearBonusShot && !b.isGearDroneBullet && !b._twinFangClone) {
        p.gearTwinFangCount = (p.gearTwinFangCount || 0) + 1;
        if (p.gearTwinFangCount % 2 === 0) {
            b.dmg = (b.dmg || p.damage) * 0.65;
            b._twinFangClone = true;
            const twin = Object.assign({}, b, {
                x: b.x + 11,
                hitIds: Array.isArray(b.hitIds) ? [...b.hitIds] : [],
                _gearProcessed: true,
                _twinFangClone: true
            });
            b.x -= 5;
            p.bullets.push(twin);
        }
    }

    // #134 Lõi Pháo Đài Cơ Giới (Mecha Core): mỗi 5 phát bắn kích hoạt loạt đạn Pháo Điện đồng loạt
    if (p.hasGear('gear_sup_mecha_core_p') && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearMechaShotCount = (p.gearMechaShotCount || 0) + 1;
        if (p.gearMechaShotCount % 5 === 0 && typeof bodyEffects !== 'undefined') {
            const enemy = p.id === 1 ? p2 : p1;
            const dirY = p.id === 1 ? -1 : 1;
            bodyEffects.forEach(ef => {
                if (ef && ef.active && ef.team === p.id && (ef instanceof GearSupportDrone || (ef instanceof GearFieldDevice && ef.mode === 'tesla_coil'))) {
                    const ang = enemy ? Math.atan2((enemy.y + enemy.h / 2) - ef.y, (enemy.x + enemy.w / 2) - ef.x) : (dirY < 0 ? -Math.PI / 2 : Math.PI / 2);
                    p.bullets.push({
                        x: ef.x + (ef.w || 18) / 2 - 4, y: ef.y,
                        w: 8, h: 10,
                        vx: Math.cos(ang) * 7.5, vy: Math.sin(ang) * 7.5,
                        dmg: 0.65, owner: p, isGearDroneBullet: true, _gearProcessed: true,
                        hitIds: [], bounceCount: 0
                    });
                }
            });
            addFloatingText(p.x + p.w / 2, p.y - 16, 'PHÁO ĐÀI ĐỒNG LOẠT! 🚀', '#facc15', 11);
        }
    }

    // #142 Quá Tải Chu Kỳ (Overclock): trong 2.5s Quá Tải hoàn lại đạn & tăng +15% sát thương đạn
    if ((p.gearOverclockActive || 0) > 0 && !b.isGearBonusShot && !b.isGearDroneBullet) {
        b.dmg = (b.dmg || p.damage) * 1.15;
        p.ammo = Math.min(p.maxAmmo, (p.ammo || 0) + 1);
    }

    // #143 Bí Thuật Hắc Ám & Âm Dương: phóng kèm 1 Linh Hỏa dẫn đường 0.55 dame + hồi 0.3 HP (CD 2.5s)
    if (p.hasGear('gear_hero_mystic_p') && (p.gearMysticCd || 0) <= 0 && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearMysticCd = 150;
        p.hp = Math.min(p.maxHp, p.hp + 0.3 * getGearHealMult(p));
        const dirY = p.id === 1 ? -1 : 1;
        p.bullets.push({
            x: p.x + p.w / 2 - 4, y: dirY < 0 ? p.y - 8 : p.y + p.h + 2,
            w: 8, h: 8, vx: 0, vy: dirY * C.bulletSpeed * 1.1,
            dmg: 0.55, owner: p, isGearBonusShot: true, _gearHoming: true, _gearProcessed: true,
            hitIds: [], bounceCount: 0
        });
    }

    // #145 Đầu Đạn Hạt Nhân Chiến Thuật: +30% tốc đạn
    if (p.hasGear('gear_hero_heavy_ord_g')) {
        b.vx = (b.vx || 0) * 1.30;
        b.vy = (b.vy || 0) * 1.30;
    }

    // #146 Cơn Bão Chì Liên Thanh (SMG / Six Barrel): mỗi 8 viên bắn kèm 1 Tên Lửa Mini dẫn đường 0.6 dame
    if (p.hasGear('gear_hero_gatling_g') && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearGatlingRocketCount = (p.gearGatlingRocketCount || 0) + 1;
        if (p.gearGatlingRocketCount % 8 === 0) {
            const dirY = p.id === 1 ? -1 : 1;
            p.bullets.push({
                x: p.x + p.w / 2 - 4, y: dirY < 0 ? p.y - 8 : p.y + p.h + 2,
                w: 8, h: 12, vx: 0, vy: dirY * C.bulletSpeed * 1.25,
                dmg: 0.6, owner: p, isExplosive: true, isGearBonusShot: true, _gearHoming: true, _gearProcessed: true,
                hitIds: [], bounceCount: 0
            });
        }
    }

    // #147 Cộng Hưởng Điện Từ Bão Tố (Thunder / Magnet / Storm): mỗi 5s nhận +1.0 Giáp Trắng & phóng xung điện 0.6 dame + kéo địch
    if (p.hasGear('gear_hero_thunder_mag_g') && (p.gearThunderMagCd || 0) <= 0 && !b.isGearBonusShot) {
        p.gearThunderMagCd = 300;
        p.gearWhiteShield = Math.min(4.0, (p.gearWhiteShield || 0) + 1.0 * getGearHealMult(p));
        const enemy = p.id === 1 ? p2 : p1;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        explosions.push(new Explosion(cx, cy, 85, 'rgba(56, 189, 248,', 0, p));
        if (enemy && enemy.hp > 0) {
            enemy.takeDamage(0.6, p);
            if (!(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
                const dir = Math.sign(cx - (enemy.x + enemy.w / 2));
                enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dir * 30));
            }
        }
    }

    // #148 Bá Vương Tuyệt Đối: tạo sóng xung kích xóa đạn địch trước mặt (CD 3s)
    if (p.hasGear('gear_hero_apex_p') && (p.gearApexShockCd || 0) <= 0 && !b.isGearBonusShot) {
        p.gearApexShockCd = 180;
        const enemy = p.id === 1 ? p2 : p1;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        if (enemy && Array.isArray(enemy.bullets)) {
            enemy.bullets = enemy.bullets.filter(eb => Math.hypot(eb.x - cx, eb.y - cy) > 95);
        }
    }

    // #150 Liên Minh Bóng Tối: mỗi 4s bắn bồi 2 tia Đạn Ảnh 0.35 dame & hồi +0.25 HP
    if (p.hasGear('gear_hero_clone_army_g') && (p.gearCloneArmyCd || 0) <= 0 && !b.isGearBonusShot && !b.isGearDroneBullet) {
        p.gearCloneArmyCd = 240;
        p.hp = Math.min(p.maxHp, p.hp + 0.25 * getGearHealMult(p));
        const dirY = p.id === 1 ? -1 : 1;
        [-14, 14].forEach(offX => {
            p.bullets.push({
                x: p.x + p.w / 2 + offX - 3, y: dirY < 0 ? p.y - 6 : p.y + p.h + 2,
                w: 6, h: 10, vx: 0, vy: dirY * C.bulletSpeed * 1.2,
                dmg: 0.35, owner: p, isGearBonusShot: true, _gearProcessed: true,
                hitIds: [], bounceCount: 0
            });
        });
    }

    // #28 Mưa Đạn: xếp hàng bắn bồi 1 viên phụ sau 0.15s (9 ticks), tối đa 1 lần mỗi 8 ticks để tránh tràn
    if (p.hasGear('gear_bullet_rain_p') && !b.isGearBonusShot && !b.isGearDroneBullet && !b.isMiniSplit) {
        const nowTick = p.gearRoundTicks || 0;
        if (nowTick - (p._lastRainQueueTick || -99) >= 8) {
            p._lastRainQueueTick = nowTick;
            if (!Array.isArray(p.gearRainQueue)) p.gearRainQueue = [];
            p.gearRainQueue.push({ delay: 9, vx: b.vx, vy: b.vy, dmg: b.dmg });
        }
    }
}

// Xử lý khi đạn của attacker trúng trực tiếp victim (gọi trong checkHits)
function onGearBulletHitPlayer(attacker, victim, b, dealtDmg) {
    if (!attacker || !victim || !attacker.hasGear) return;

    // #29 Đạn Từ Tính (Kéo Ngang): kéo địch 25px về tâm đạn (CD 2.5s)
    if (attacker.hasGear('gear_horizontal_pull_g') && (attacker.gearPullCd || 0) <= 0) {
        if (!(victim.hasGear && victim.hasGear('gear_giant_tank_g'))) {
            const bx = b ? (b.x + (b.w || 6) / 2) : (attacker.x + attacker.w / 2);
            const vx = victim.x + victim.w / 2;
            const dir = Math.sign(bx - vx);
            victim.x = Math.max(0, Math.min(canvas.width - victim.w, victim.x + dir * Math.min(25, Math.abs(bx - vx))));
            attacker.gearPullCd = 150;
        }
    }

    // #30 Sóng Chấn Động (Đẩy Ngang): mỗi phát thứ 3 đẩy trượt 50px + chậm 25% (đập tường +0.5 dame)
    if (attacker.hasGear('gear_side_knockback_s')) {
        attacker.gearKnockbackHitCount = (attacker.gearKnockbackHitCount || 0) + 1;
        if (attacker.gearKnockbackHitCount % 3 === 0) {
            victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
            if (!(victim.hasGear && victim.hasGear('gear_giant_tank_g'))) {
                const dir = (victim.x + victim.w / 2 >= canvas.width / 2) ? 1 : -1;
                const newX = victim.x + dir * 50;
                if (newX <= 0 || newX + victim.w >= canvas.width) {
                    victim.x = Math.max(0, Math.min(canvas.width - victim.w, newX));
                    victim.takeDamage(0.5, attacker, { isEnvironmental: true });
                    addFloatingText(victim.x + victim.w / 2, victim.y - 16, 'ĐẬP TƯỜNG! -0.5 💥', '#f97316', 13);
                } else {
                    victim.x = newX;
                }
            }
        }
    }

    // #32 Đạn Băng Giá: làm chậm 20% trong 1.5s (CD 3s)
    if (attacker.hasGear('gear_frost_ammo_s') && (attacker.gearFrostAmmoCd || 0) <= 0) {
        attacker.gearFrostAmmoCd = 180;
        const dur = attacker.hasGear('gear_ctrl_duration_s') ? 112 : 90;
        victim.slowTimer = Math.max(victim.slowTimer || 0, dur);
    }

    // #33 Đạn Nhiệt Hạch: đốt 0.4 sát thương trong 2s (120 ticks)
    if (attacker.hasGear('gear_burn_ammo_s')) {
        victim.gearBurnTimer = 120;
    }

    // #37 Nạp Đạn Ma Thuật: trúng địch rút ngắn 0.25s (250ms) thời gian nạp đạn
    if (attacker.hasGear('gear_fast_reload_g')) {
        attacker.lastShot = (attacker.lastShot || Date.now()) - 250;
        attacker.lastReload = (attacker.lastReload || 0) - 250;
    }

    // #40 Đạn Phân Hạch Nhỏ: văng 2 mảnh đạn nhỏ sang Trái - Phải (0.25 dame)
    if (attacker.hasGear('gear_mini_split_g') && b && !b.isMiniSplit) {
        const hitX = victim.x + victim.w / 2, hitY = victim.y + victim.h / 2;
        [-1, 1].forEach(dir => {
            attacker.bullets.push({
                x: hitX + dir * (victim.w / 2 + 4),
                y: hitY - 3,
                w: 5, h: 5,
                vx: dir * 6.5, vy: 0,
                dmg: 0.25, owner: attacker,
                isMiniSplit: true,
                hitIds: [victim], bounceCount: 0
            });
        });
    }

    // #52 Chuyên Gia Quyết Đấu: cộng dồn +4% dame mỗi phát trúng liên tiếp (tối đa 5 tầng)
    if (attacker.hasGear('gear_duel_master_g')) {
        attacker.gearDuelMasterStacks = Math.min(5, (attacker.gearDuelMasterStacks || 0) + 1);
    }

    // #53 Xung Kích Khát Máu: tích tới 6 tầng Cuồng Huyết, đủ 6 tầng hồi +0.15 HP mỗi đòn
    if (attacker.hasGear('gear_duel_frenzy_p')) {
        attacker.gearFrenzyStacks = Math.min(6, (attacker.gearFrenzyStacks || 0) + 1);
        attacker.gearFrenzyTimer = 240; // 4s
        if (attacker.gearFrenzyStacks >= 6) {
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.15 * getGearHealMult(attacker));
        }
    }

    // #57 Ngục Tù Không Gian 1D: mỗi 10s phát trúng dựng 2 Cột Chắn Năng Lượng cách địch 85px Trái/Phải trong 2.5s
    if (attacker.hasGear('gear_ctrl_prison_p') && attacker.gearPrisonReady) {
        attacker.gearPrisonReady = false;
        attacker.gearPrisonTimer = 600;
        const vcx = victim.x + victim.w / 2;
        const minX = Math.max(8, vcx - 85);
        const maxX = Math.min(canvas.width - 8, vcx + 85);
        bodyEffects.push(new GearFieldDevice(attacker, 'prison', vcx, victim.y + victim.h / 2, { minX, maxX, life: 150 }));
        addFloatingText(vcx, victim.y - 18, 'NGỤC TÙ 1D! ⛓️', '#e879f9', 13);
    }

    // #58 Nhiễu Sóng Tâm Trí: làm chậm 30% tốc nạp / hồi năng lượng của địch trong 2.0s
    if (attacker.hasGear('gear_ctrl_jammer_g') || attacker.hasGear('gear_ctrl_exhaust_s')) {
        victim.gearExhaustTimer = 120;
    }

    // #81 Thuật Giả Kim Đạn Đạo: mỗi 15 lần bắn trúng nhận +$10 (tối đa $40/hiệp)
    if (attacker.hasGear('gear_ammo_to_gold_s') && (attacker.gearAmmoGoldEarned || 0) < 40) {
        attacker.gearAmmoGoldHits = (attacker.gearAmmoGoldHits || 0) + 1;
        if (attacker.gearAmmoGoldHits >= 15) {
            attacker.gearAmmoGoldHits = 0;
            attacker.gearAmmoGoldEarned = (attacker.gearAmmoGoldEarned || 0) + 10;
            addPlayerCoins(attacker, 10);
            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 16, '+$10 GIẢ KIM 💰', '#facc15', 13);
        }
    }

    // #83 Đạn Pháo Cải Tiến (Basic): viên thứ 4 hồi +0.5 HP khi trúng
    if (b && b._gearBasicCannon) {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.5 * getGearHealMult(attacker));
        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 14, '+0.5 HP 🎯', '#4ade80', 12);
    }

    // #85 Độ Không Tuyệt Đối (Ice): trúng địch đang đứng trên Vùng Băng / bị làm chậm 4 phát -> Đóng băng 1.25s (CD 8s)
    if (attacker.hasGear('gear_hero_ice_g') && attacker.weapon === 'ice' && (attacker.gearIceFreezeCd || 0) <= 0) {
        if (victim.slowTimer > 0) {
            attacker.gearIceFreezeHits = (attacker.gearIceFreezeHits || 0) + 1;
            if (attacker.gearIceFreezeHits >= 4) {
                attacker.gearIceFreezeHits = 0;
                attacker.gearIceFreezeCd = 480;
                victim.freezeTimer = Math.max(victim.freezeTimer || 0, 75);
                addFloatingText(victim.x + victim.w / 2, victim.y - 18, 'ĐỘ KHÔNG TUYỆT ĐỐI! ❄️', '#00ffff', 14);
            }
        }
    }

    // #87 Phản Ứng Dây Chuyền (Overload): đạn sạc trúng đích nạp lại 40% thanh năng lượng
    if (attacker.hasGear('gear_hero_overload_g') && attacker.weapon === 'overload' && b && b.isFullCharge) {
        attacker.overloadCharge = Math.min(100, (attacker.overloadCharge || 0) + 40);
    }

    // #93 Phát Bắn Bách Phát Bách Trúng: đếm số phát trúng liên tiếp & xử lý Choáng 0.5s ở phát thứ 3
    if (attacker.hasGear('gear_hero_marksman_g')) {
        if (b && b._gearTrueShot) {
            victim.freezeTimer = Math.max(victim.freezeTimer || 0, 30);
        } else {
            attacker.gearMarksmanConsecHits = (attacker.gearMarksmanConsecHits || 0) + 1;
        }
    }

    // #97 Xích Tử Thần Nung Đỏ: trúng Trói Chết đốt & câm lặng thêm 1.0s
    if (attacker.hasGear('gear_hero_hook_g') && (attacker.weapon === 'death_lock' || attacker.weapon === 'steel_hook')) {
        victim.gearBurnTimer = Math.max(victim.gearBurnTimer || 0, 90);
        victim.silenceTimer = Math.max(victim.silenceTimer || 0, (victim.silenceTimer || 0) + 60);
    }

    // ---------------------------------------------------------
    // HIỆU ỨNG TRÚNG ĐÍCH CỦA 44 LÕI MỚI (#107 – #150)
    // ---------------------------------------------------------
    const vcx = victim.x + victim.w / 2, vcy = victim.y + victim.h / 2;

    if (b && b._gearCrit) {
        addFloatingText(vcx, victim.y - 18, 'CHÍ MẠNG! 💥', '#ef4444', 13);
        spawnSparkParticles(vcx, vcy, '#ef4444', 8);
    }
    if (b && b._gearFireball) {
        victim.gearBurnTimer = Math.max(victim.gearBurnTimer || 0, 90);
    }

    // #107 Đạn Giật Sét (Chain Volt): mỗi phát thứ 3 giật 0.45 dame điện + tê liệt 0.3s & lan sang công trình địch
    if (attacker.hasGear('gear_atk_chain_lightning_g')) {
        attacker.gearChainVoltHits = (attacker.gearChainVoltHits || 0) + 1;
        if (attacker.gearChainVoltHits % 3 === 0) {
            victim.takeDamage(0.45, attacker, { isEnvironmental: true });
            victim.slowTimer = Math.max(victim.slowTimer || 0, 30);
            spawnSparkParticles(vcx, vcy, '#38bdf8', 12);
            addFloatingText(vcx, victim.y - 16, 'GIẬT SÉT! -0.45 ⚡', '#38bdf8', 12);
            if (typeof turrets !== 'undefined') turrets.forEach(t => { if (t.owner === victim && t.active) t.hp -= 0.6; });
            if (typeof creatorTurrets !== 'undefined') creatorTurrets.forEach(t => { if (t.owner === victim && t.active) t.hp -= 0.6; });
        }
    }

    // #108 Lôi Thần Giáng Thế: đủ 4 Điện Tích giáng cột sét 1.3 dame chuẩn, xóa 1 Khiên & Choáng 0.6s
    if (attacker.hasGear('gear_atk_thunder_god_p')) {
        attacker.gearThunderGodStacks = (attacker.gearThunderGodStacks || 0) + 1;
        if (attacker.gearThunderGodStacks >= 4) {
            attacker.gearThunderGodStacks = 0;
            if ((victim.shield || 0) > 0) victim.shield--;
            victim.takeDamage(1.3, attacker, { bypassShield: true, isEnvironmental: true });
            victim.freezeTimer = Math.max(victim.freezeTimer || 0, 36);
            bodyEffects.push(new GearStormBolt(attacker, vcx, vcy, false));
            addFloatingText(vcx, victim.y - 22, 'LÔI THẦN GIÁNG THẾ! -1.3 ⚡', '#fde047', 14);
        }
    }

    // #110 Đạn Hố Đen (Singularity): mỗi 9s tạo Hố Đen hút ghì kẻ địch 2.0s rồi nổ 0.8 dame
    if (attacker.hasGear('gear_atk_blackhole_p') && attacker.gearBlackholeReady) {
        attacker.gearBlackholeReady = false;
        attacker.gearBlackholeTimer = 540;
        bodyEffects.push(new GearFieldDevice(attacker, 'blackhole', vcx, vcy, { life: 120 }));
        addFloatingText(vcx, victim.y - 18, 'HỐ ĐEN TRỌNG TRƯỜNG! 🌌', '#a855f7', 13);
    }

    // #111 Đạn Độc Tố Cộng Dồn & #112 Đạn Dịch Hạch Bùng Phát
    if (attacker.hasGear('gear_atk_venom_s') || attacker.hasGear('gear_atk_plague_g')) {
        victim.gearVenomStacks = Math.min(5, (victim.gearVenomStacks || 0) + 1);
        victim.gearVenomTimer = 240; // 4s
        if (attacker.hasGear('gear_atk_plague_g') && victim.gearVenomStacks >= 4) {
            victim.gearVenomStacks = 0;
            victim.takeDamage(0.9, attacker, { isEnvironmental: true });
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.4 * getGearHealMult(attacker));
            explosions.push(new Explosion(vcx, vcy, 50, 'rgba(74, 222, 128,', 0, attacker));
            if (typeof AcidPool !== 'undefined' && typeof acidPools !== 'undefined') {
                acidPools.push(new AcidPool(vcx, vcy, 48, 150, attacker));
            }
            addFloatingText(vcx, victim.y - 20, 'DỊCH HẠCH BÙNG PHÁT! -0.9 ☣️', '#4ade80', 13);
        }
    }

    // #115 Ấn Tử Thần (3 Đòn): đòn thứ 3 gây 12% máu đã mất của địch (0.5 -> 1.8) & +20% tốc chạy 1.5s
    if (attacker.hasGear('gear_atk_death_mark_g')) {
        attacker.gearDeathMarkHits = (attacker.gearDeathMarkHits || 0) + 1;
        if (attacker.gearDeathMarkHits >= 3) {
            attacker.gearDeathMarkHits = 0;
            const missingHp = Math.max(0, victim.maxHp - victim.hp);
            const bonusDmg = Math.max(0.5, Math.min(1.8, missingHp * 0.12));
            victim.takeDamage(bonusDmg, attacker, { isEnvironmental: true });
            attacker.gearDeathMarkSpdTimer = 90;
            spawnSparkParticles(vcx, vcy, '#ef4444', 12);
            addFloatingText(vcx, victim.y - 20, `ẤN TỬ THẦN! -${bonusDmg.toFixed(2)} ☠️`, '#ef4444', 13);
        }
    }

    // #116 Mảnh Vỡ Kim Cương: trúng mục tiêu đang dính CC nổ thêm +0.45 sát thương
    if (attacker.hasGear('gear_atk_shatter_ice_g') && isPlayerAfflictedByCC(victim)) {
        victim.takeDamage(0.45, attacker, { isEnvironmental: true });
        spawnSparkParticles(vcx, vcy, '#67e8f9', 8);
    }

    // #118 Đạn Xung Điện Từ (Micro-EMP): mỗi 7s xóa 1.0 Giáp Trắng, tê liệt triệu hồi 2.5s & làm chậm nạp 30%
    if (attacker.hasGear('gear_atk_emp_pulse_s') && attacker.gearMicroEmpReady) {
        attacker.gearMicroEmpReady = false;
        attacker.gearMicroEmpTimer = 420;
        victim.gearWhiteShield = Math.max(0, (victim.gearWhiteShield || 0) - 1.0);
        victim.gearEmpSlowReloadTimer = 150;
        if (!(victim.hasGear && victim.hasGear('gear_hero_family_p'))) {
            if (typeof turrets !== 'undefined') turrets.forEach(t => { if (t.owner === victim) t.lastShot = Date.now() + 2500; });
            if (typeof creatorTurrets !== 'undefined') creatorTurrets.forEach(t => { if (t.owner === victim) t.fireCooldown = 150; });
            if (Array.isArray(victim.drones)) victim.drones.forEach(d => { d.fireCooldown = 150; });
        }
        addFloatingText(vcx, victim.y - 18, 'MICRO-EMP! ⚡', '#38bdf8', 12);
    }

    // #119 Đạn Thiêu Đốt Linh Hồn: gây thêm 3% Max HP sát thương chuẩn & rút 10% Năng Lượng / kéo dài nạp đạn (CD 1.2s)
    if (attacker.hasGear('gear_atk_soul_burn_g') && (attacker.gearSoulBurnCd || 0) <= 0) {
        attacker.gearSoulBurnCd = 72;
        const soulDmg = Math.max(0.15, (victim.maxHp || 6) * 0.03);
        victim.hp = Math.max(0.1, victim.hp - soulDmg);
        if (typeof victim.energy === 'number' && victim.energy > 0) victim.energy = Math.max(0, victim.energy - 10);
        if (typeof victim.chuLuc === 'number' && victim.chuLuc > 0) victim.chuLuc = Math.max(0, victim.chuLuc - 10);
        if (typeof victim.cursedEnergy === 'number' && victim.cursedEnergy > 0) victim.cursedEnergy = Math.max(0, victim.cursedEnergy - 10);
        victim.lastReload = (victim.lastReload || 0) + 180;
    }

    // #144 Áp Suất Nguyên Tố Cực Đại: làm chậm 20%
    if (attacker.hasGear('gear_hero_elemental_g')) {
        victim.slowTimer = Math.max(victim.slowTimer || 0, 75);
    }

    // #145 Đầu Đạn Hạt Nhân Chiến Thuật: văng 3 mảnh đạn nổ 0.3 dame & làm chậm 30%
    if (attacker.hasGear('gear_hero_heavy_ord_g') && b && !b.isMiniSplit) {
        victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
        explosions.push(new Explosion(vcx, vcy, 44, 'rgba(251, 146, 60,', 0.3, attacker));
    }
}

// Xử lý phần thưởng cuối hiệp từ G.E.A.R (gọi trong endRound)
function applyGearsOnRoundEnd(winnerId) {
    if (typeof p1 === 'undefined' || typeof p2 === 'undefined') return;
    [p1, p2].forEach(p => {
        if (!p || !p.hasGear) return;
        const enemy = (p.id === 1) ? p2 : p1;
        const lost = (winnerId !== 0 && winnerId !== p.id);

        // #6 Lật Kèo: chuỗi thua >= 2 -> +$70, +1 Max HP vĩnh viễn, +15% Dame hiệp sau
        if (p.hasGear('gear_comeback_g')) {
            if ((p.loseStreak || 0) >= 2) {
                addPlayerCoins(p, 70);
                p.gearBonusMaxHp = (p.gearBonusMaxHp || 0) + 1;
                p.gearComebackDmgBuff = 0.15;
                addFloatingText(p.x + p.w / 2, p.y - 42, 'LẬT KÈO! +$70 & +1 MAX HP 🔥', '#facc15', 14);
            } else {
                p.gearComebackDmgBuff = 0;
            }
        }

        // #14 Bảo Hiểm Sinh Mạng: thua khi địch còn < 1.5 HP -> hoàn +$45
        if (p.hasGear('gear_insurance_s') && lost && enemy && enemy.hp < 1.5) {
            addPlayerCoins(p, 45);
            addFloatingText(p.x + p.w / 2, p.y - 24, '+$45 BẢO HIỂM 🛡️', '#38bdf8', 13);
        }

        // #18 Chỉ Số Vô Tận: kết thúc mỗi hiệp cộng thêm 1 tầng chỉ số vĩnh viễn
        if (p.hasGear('gear_infinite_stat_p')) {
            p.gearInfiniteStacks = (p.gearInfiniteStacks || 1) + 1;
        }
    });
}

// Xử lý khi phá Thùng Tiếp Tế (#9 Thợ Săn Tiền Thưởng, #10 Thùng Đồ Đột Biến)
function onGearCrateBroken(c, opener) {
    if (!c || !opener || !opener.hasGear) return;
    if (opener.hasGear('gear_bounty_s')) {
        addPlayerCoins(opener, 8);
        addFloatingText(opener.x + opener.w / 2, opener.y - 20, '+$8 TIỀN THƯỞNG 💰', '#facc15', 12);
    }
    if (opener.hasGear('gear_super_crate_g') && !c.isMimic) {
        const goodTypes = ['hp', 'ammo', 'shield', 'dmg', 'gear', 'coin', 'immune', 'haste'];
        if (goodTypes.includes(c.type)) {
            opener.gearSuperCrateSpdTimer = 120;
            if (c.type === 'hp') opener.hp = Math.min(opener.maxHp, opener.hp + 1);
            else if (c.type === 'shield') opener.shield = (opener.shield || 0) + 1;
            else if (c.type === 'dmg') opener.dmgBuff = (opener.dmgBuff || 0) + 1;
            else if (c.type === 'gear') {
                opener.ammo = Math.min(opener.maxAmmo, opener.ammo + 1);
                if (opener.weapon === 'genius') opener.gears = (opener.gears || 0) + 1;
                if (opener.weapon === 'inventor') opener.components = (opener.components || 0) + (opener.hasUpgrade('evo_inv_1') ? 8 : 5);
            }
            addFloatingText(opener.x + opener.w / 2, opener.y - 26, 'ĐỘT BIẾN x2! ⚡', '#4ade80', 12);
        }
    }
}

// Xử lý khi bắn nổ Xe Tiền (#2 Đại Đội Tiếp Tế Phản Công, #9 Thợ Săn Tiền Thưởng)
function onGearTruckDestroyed(t, attacker) {
    if (!t || !attacker || !attacker.hasGear) return;
    if (attacker.hasGear('gear_bounty_s')) {
        addPlayerCoins(attacker, 15);
        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 20, '+$15 SĂN XE TIỀN 💰', '#facc15', 13);
    }
    if (attacker.hasGear('gear_ally_crate_p') && typeof AttackTruck !== 'undefined' && typeof bodyEffects !== 'undefined') {
        bodyEffects.push(new AttackTruck(attacker, t.x + t.w / 2, false));
        addFloatingText(t.x + t.w / 2, t.y - 10, 'PHẢN CÔNG! 🚛🔥', '#f97316', 13);
    }
}

// ------------------------------------------
// 6. CÀI ĐẶT WRAPPER LÊN PLAYER & HỆ THỐNG HIỆN CÓ
// ------------------------------------------
(function installGearSystemWrappers() {
    // 1. Setup cuối mỗi hiệp
    const origSetup = Player.prototype.setupForNewRound;
    Player.prototype.setupForNewRound = function () {
        const res = origSetup.apply(this, arguments);
        applyGearsOnRoundSetup(this);
        return res;
    };

    function getPlayerGearSpeedMult(p) {
        if (!p || !p.hasGear) return 1;
        let spdMult = 1;
        if (p.hasGear('gear_headstart_s') && (p.gearRoundTicks || 0) <= 600) spdMult *= 1.25;
        if (p.hasGear('gear_duel_frenzy_p') && (p.gearFrenzyStacks || 0) > 0) spdMult *= (1 + 0.04 * Math.min(6, p.gearFrenzyStacks));
        if (p.hasGear('gear_mob_momentum_s') && (p.gearSameDirTicks || 0) >= 72) spdMult *= 1.15;
        if (p.hasGear('gear_sup_speed_rail_s') && Math.abs((p.x + p.w / 2) - canvas.width / 2) <= 75) spdMult *= 1.28;
        if (p.hasGear('gear_tac_berserk_g')) {
            const missingPct = Math.max(0, 1 - (p.hp / Math.max(1, p.maxHp)));
            const stacks = Math.min(9, Math.floor(missingPct * 10));
            if (stacks > 0) spdMult *= (1 + 0.04 * stacks);
        }
        if ((p.gearStepSpdTimer || 0) > 0) spdMult *= 1.25;
        if ((p.gearHitAndRunTimer || 0) > 0) spdMult *= 1.25;
        if ((p.gearAegisSpdTimer || 0) > 0) spdMult *= 1.20;
        if ((p.gearSuperCrateSpdTimer || 0) > 0) spdMult *= 1.20;
        if ((p.gearDeathMarkSpdTimer || 0) > 0) spdMult *= 1.20;
        if ((p.gearAdrenalineTimer || 0) > 0) spdMult *= 1.35;
        if ((p.gearMysterySpdTimer || 0) > 0) spdMult *= 1.30;
        return spdMult;
    }

    // 2. getSpeed wrapper
    const origGetSpeed = Player.prototype.getSpeed;
    Player.prototype.getSpeed = function () {
        return origGetSpeed.apply(this, arguments) * getPlayerGearSpeedMult(this);
    };

    // 3. update wrapper
    const origUpdate = Player.prototype.update;
    Player.prototype.update = function () {
        updatePlayerGearsTick(this);
        if ((this.gearAegisSpdTimer || 0) > 0) this.gearAegisSpdTimer--;
        if ((this.gearSuperCrateSpdTimer || 0) > 0) this.gearSuperCrateSpdTimer--;

        // Tạm thời nhân this.speed với buff tốc độ G.E.A.R trong tick di chuyển
        const baseSpd = this.speed;
        const spdMult = getPlayerGearSpeedMult(this);

        this.speed = baseSpd * spdMult;
        const prevBulletsLen = Array.isArray(this.bullets) ? this.bullets.length : 0;
        const res = origUpdate.apply(this, arguments);
        this.speed = baseSpd;

        // Xử lý mọi viên đạn mới vừa được bắn ra trong tick này
        if (Array.isArray(this.bullets) && this.bullets.length > prevBulletsLen) {
            for (let i = prevBulletsLen; i < this.bullets.length; i++) {
                onGearBulletSpawned(this, this.bullets[i]);
            }
        }
        return res;
    };

    // 4. fireBullet wrapper (#86 Bổ Củi Đôi cho Shotgun & áp dụng hiệu ứng đạn)
    const origFireBullet = Player.prototype.fireBullet;
    Player.prototype.fireBullet = function (multiplier, isFullCharge = false, type = 'normal') {
        const prevLen = Array.isArray(this.bullets) ? this.bullets.length : 0;
        const res = origFireBullet.apply(this, arguments);

        if (this.hasGear && this.hasGear('gear_hero_shotgun_g') && (this.weapon === 'shotgun' || this.weapon === 'shortgunATK') && type !== 'shot_wave') {
            const inp = this.id === 1 ? inputs.p1 : inputs.p2;
            const dashDir = (inp && inp.l) ? -1 : ((inp && inp.r) ? 1 : 0);
            if (dashDir !== 0) {
                this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + dashDir * 16));
            }
            const dirY = this.id === 1 ? -1 : 1;
            const spd = C.bulletSpeed * 1.4;
            [-0.52, 0.52].forEach(ang => {
                this.bullets.push({
                    x: this.x + this.w / 2 - 3,
                    y: dirY < 0 ? this.y - 6 : this.y + this.h,
                    w: 5, h: 5,
                    vx: ang * spd, vy: dirY * spd,
                    dmg: this.damage, owner: this,
                    hitIds: [], bounceCount: 0
                });
            });
        }

        if (Array.isArray(this.bullets) && this.bullets.length > prevLen) {
            for (let i = prevLen; i < this.bullets.length; i++) {
                onGearBulletSpawned(this, this.bullets[i]);
            }
        }
        return res;
    };

    // 5. updateBullets wrapper (#31 Đạn Nảy Cao Su, #88 Tia Khúc Xạ Gương, #93 hụt đạn)
    const origUpdateBullets = Player.prototype.updateBullets;
    Player.prototype.updateBullets = function () {
        if (Array.isArray(this.bullets)) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                if (!b) continue;
                onGearBulletSpawned(this, b);

                // #31 Đạn Nảy Cao Su: chạm tường biên 2 bên hoặc tường sau lưng địch thì nảy lại 1 lần (75% dame)
                if (this.hasGear && this.hasGear('gear_ricochet_g') && !b._gearBounced && (b.bounceCount || 0) === 0 && b.type !== 'purple' && b.type !== 'gojo_blue') {
                    const nextX = b.x + (b.vx || 0);
                    const nextY = b.y + (b.vy || 0);
                    if (nextX <= 0 || nextX + (b.w || 6) >= canvas.width) {
                        b._gearBounced = true;
                        b.bounceCount = (b.bounceCount || 0) + 1;
                        b.vx = -(b.vx || 0);
                        b.dmg = (b.dmg || 1) * 0.75;
                        b.hitIds = [];
                    } else if ((this.id === 1 && nextY <= 0) || (this.id === 2 && nextY + (b.h || 6) >= canvas.height)) {
                        b._gearBounced = true;
                        b.bounceCount = (b.bounceCount || 0) + 1;
                        b.vy = -(b.vy || 0);
                        if (!b.vx) b.vx = (Math.random() < 0.5 ? 1.5 : -1.5);
                        b.dmg = (b.dmg || 1) * 0.75;
                        b.hitIds = [];
                    }
                }

                // #88 Tia Khúc Xạ Gương: đạn Lazer chạm tường sau lưng địch phản chiếu chéo 1 tia phụ (50% dame)
                if (this.hasGear && this.hasGear('gear_hero_lazer_g') && !b._lazerReflected) {
                    const nextY = b.y + (b.vy || 0);
                    if ((this.id === 1 && nextY <= 4) || (this.id === 2 && nextY + (b.h || 6) >= canvas.height - 4)) {
                        b._lazerReflected = true;
                        const enemy = this.id === 1 ? p2 : p1;
                        const dirX = (enemy && (enemy.x + enemy.w / 2) >= b.x) ? 1 : -1;
                        const dirY = this.id === 1 ? 1 : -1;
                        this.bullets.push({
                            x: b.x, y: this.id === 1 ? 6 : canvas.height - 14,
                            w: 5, h: 14,
                            vx: dirX * 5.5, vy: dirY * 6.5,
                            dmg: (b.dmg || this.damage) * 0.5,
                            owner: this, isPiercing: true,
                            _lazerReflected: true, hitIds: [], bounceCount: 0
                        });
                    }
                }

                // #93 Phát Bắn Bách Phát Bách Trúng: nếu đạn bay ra khỏi sân mà chưa trúng ai -> reset chuỗi trúng
                if (this.hasGear && this.hasGear('gear_hero_marksman_g')) {
                    const nextY = b.y + (b.vy || 0);
                    if (nextY <= 0 || nextY >= canvas.height) {
                        if (!Array.isArray(b.hitIds) || b.hitIds.length === 0) {
                            this.gearMarksmanConsecHits = 0;
                        }
                    }
                }

                // #109 Đạn Hồi Tuyển (Boomerang): bay tới cuối sân thì đảo chiều quay về vị trí xe chủ nhân (85% dame)
                if (b._gearBoomerang && !b._boomerangReturning) {
                    const nextY = b.y + (b.vy || 0);
                    if ((this.id === 1 && nextY <= 12) || (this.id === 2 && nextY + (b.h || 6) >= canvas.height - 12)) {
                        b._boomerangReturning = true;
                        b.vy = -(b.vy || 0) * 0.9;
                        b.dmg = (b.dmg || this.damage) * 0.85;
                        b.hitIds = [];
                    }
                }
                if (b._boomerangReturning) {
                    const myCX = this.x + this.w / 2;
                    b.vx = Math.sign(myCX - b.x) * Math.min(2.6, Math.abs(myCX - b.x) * 0.08);
                }

                // #117 Đạn Dẫn Đường Từ Tính (Homing): uốn cong nhẹ quỹ đạo về trục X của tướng địch
                if (b._gearHoming) {
                    const enemy = this.id === 1 ? p2 : p1;
                    if (enemy && enemy.hp > 0) {
                        const targetX = enemy.x + enemy.w / 2;
                        const diffX = targetX - (b.x + (b.w || 6) / 2);
                        b.vx = Math.max(-3.2, Math.min(3.2, (b.vx || 0) + Math.sign(diffX) * 0.14));
                    }
                }
            }
        }
        return origUpdateBullets.apply(this, arguments);
    };

    // 6. takeDamage wrapper (tất cả cơ chế phòng thủ, giảm sát thương, khiên trắng, phản đòn, thoát hiểm, hút máu...)
    const origTakeDamage = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker = null, options = {}) {
        if (this.hp <= 0 || gameState.phase !== 'playing') return 0;

        const isDirectCombat = attacker && attacker !== this && !options.isEnvironmental;

        // #45 Hấp Thụ Đạn Đạo: màng từ trường nuốt chửng đòn đánh và hồi +0.5 HP
        if (isDirectCombat && this.hasGear && this.hasGear('gear_bullet_eater_g') && (this.gearBulletEaterActive || 0) > 0 && !options.unavoidable) {
            this.gearBulletEaterActive = 0;
            this.gearBulletEaterTimer = 0;
            this.hp = Math.min(this.maxHp, this.hp + 0.5 * getGearHealMult(this));
            addFloatingText(this.x + this.w / 2, this.y - 14, 'HẤP THỤ ĐẠN! +0.5 HP 🧲', '#38bdf8', 13);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#38bdf8', 10);
            return 0;
        }

        // #61 Siêu Thanh Vô Ảnh: tỉ lệ tự né đạn thường theo tốc độ di chuyển (tối đa 25%) hoặc sau khi lướt
        if (isDirectCombat && this.hasGear && this.hasGear('gear_mob_phantom_p') && !options.unavoidable) {
            const spdRatio = Math.max(0, (this.speed - 3.5) / 3.5);
            const dodgeChance = Math.min(0.25, Math.floor(spdRatio / 0.2) * 0.08 + ((this.gearPhantomEvasionTimer || 0) > 0 ? 0.15 : 0));
            if (dodgeChance > 0 && Math.random() < dodgeChance) {
                addFloatingText(this.x + this.w / 2, this.y - 12, 'SIÊU THANH NÉ! 💨', '#38bdf8', 13);
                return 0;
            }
        }

        // #92 Lãnh Địa Bất Diệt (Gojo / Sukuna): khi đang gồng niệm, chặn 1 đòn để không bị ngắt niệm (CD 10s)
        if (isDirectCombat && this.hasGear && this.hasGear('gear_hero_jjk_p') && (this.gearJjkShieldCd || 0) <= 0) {
            if ((this.gojoChargeTimer || 0) > 0 || (this.sukunaChargeTimer || 0) > 0) {
                this.gearJjkShieldCd = 600;
                addFloatingText(this.x + this.w / 2, this.y - 16, 'KHIÊN CHÚ LỰC! ✨', '#c084fc', 14);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#c084fc', 12);
                return 0;
            }
        }

        // Hệ số sát thương động của Attacker (#24, #51, #52, #53, #56, #59, #72, #78, #80, #98)
        if (isDirectCombat && attacker.hasGear) {
            amount *= getGearDynamicDamageMult(attacker, this);
            if ((this.gearShreddedTimer || 0) > 0) amount += 0.15; // #68 Phá Giáp
            // #19 (Độc đắc 3: Cuồng Sát): Xuyên Khiên
            if (attacker.hasGear('gear_all_in_gamble_p') && attacker.gearJackpot === 3) {
                options = Object.assign({}, options, { bypassShield: true });
            }
        }

        // #34 Đạn Phá Giáp: nếu mục tiêu có Khiên, 35% sát thương vẫn xuyên qua trừ vào máu
        let shieldPierceDmg = 0;
        if (isDirectCombat && attacker.hasGear && attacker.hasGear('gear_shield_breaker_g') && this.shield > 0 && !options.bypassShield) {
            shieldPierceDmg = amount * 0.35;
        }

        // Giảm sát thương nhận vào từ G.E.A.R của nạn nhân (#24, #44, #54, #63, #69, #78, #98)
        let dmgReducMult = 1;
        if (this.hasGear) {
            if (this.hasGear('gear_scaling_time_g')) {
                const stacks = Math.min(5, Math.floor((this.gearRoundTicks || 0) / 600));
                dmgReducMult *= (1 - 0.05 * stacks);
            }
            if (isDirectCombat && this.hasGear('gear_thorn_armor_g')) dmgReducMult *= 0.90;
            if (this.hasGear('gear_duel_standoff_g') && (this.gearStandStillTicks || 0) >= 36) dmgReducMult *= 0.85;
            if (this.hasGear('gear_surv_colossus_s') && (this.hp / Math.max(1, this.maxHp)) < 0.5) dmgReducMult *= 0.85;
            if (this.hasGear('gear_charge_shield_g')) {
                const inp = this.id === 1 ? inputs.p1 : inputs.p2;
                if (inp && inp.s && ((this.bowChargeTimer || 0) >= 30 || (this.lazerCharge || 0) >= 30 || (this.gojoChargeTimer || 0) >= 30 || (this.sukunaChargeTimer || 0) >= 30 || (this.stormChargeTimer || 0) >= 30)) {
                    dmgReducMult *= 0.75;
                }
            }
            if (this.hasGear('gear_hero_twins_g') && (this.gearTwinSynergyTimer || 0) > 0) dmgReducMult *= 0.75;
            if (options.isEnvironmental && this.hasGear('gear_early_zone_g')) dmgReducMult *= 0.50;
        }

        // #53 Xung Kích Khát Máu (6 tầng) hoặc #148 Bá Vương Tuyệt Đối: bỏ qua 50% hiệu ứng giảm sát thương của địch
        if (isDirectCombat && attacker.hasGear && ((attacker.hasGear('gear_duel_frenzy_p') && (attacker.gearFrenzyStacks || 0) >= 6) || attacker.hasGear('gear_hero_apex_p')) && dmgReducMult < 1) {
            dmgReducMult = 1 - (1 - dmgReducMult) * 0.5;
        }
        amount *= dmgReducMult;

        // #63 Giáp Cốt Thép: giảm 0.15 sát thương từ mọi đòn đánh trực tiếp (tối thiểu 0.1)
        if (isDirectCombat && this.hasGear && this.hasGear('gear_surv_plate_s') && amount > 0.1) {
            amount = Math.max(0.1, amount - 0.15);
        }

        // Hấp thụ bằng Giáp Trắng (gearWhiteShield từ #8, #49, #71, #72, #130, #132, #140, #147, #149)
        if ((this.gearWhiteShield || 0) > 0 && !options.bypassShield) {
            const wsMult = (isDirectCombat && attacker.hasGear && attacker.hasGear('gear_shield_breaker_g')) ? 2 : 1;
            const needed = amount * wsMult;
            if (this.gearWhiteShield >= needed) {
                this.gearWhiteShield -= needed;
                addFloatingText(this.x + this.w / 2, this.y - 12, `-${amount.toFixed(1)} GIÁP TRẮNG 🛡️`, '#e2e8f0', 12);
                return 0;
            } else {
                const absorbed = this.gearWhiteShield / wsMult;
                amount -= absorbed;
                this.gearWhiteShield = 0;
                onGearShieldBroken(this, attacker);
            }
        }

        // #47 Giáp Chống Sốc Sát Thương: không mất quá 35% Max HP từ 1 đòn (trừ tia One-shot Full Evo >= 50 dame)
        if (this.hasGear && this.hasGear('gear_anti_burst_g') && amount < 50) {
            const maxAllowed = this.maxHp * 0.35;
            if (amount > maxAllowed) {
                amount = maxAllowed;
            }
        }

        const prevShield = this.shield || 0;
        const prevHp = this.hp;

        // #41 Chỉ Là 1 Trò Đùa!: chặn đòn chí tử 1 lần mỗi hiệp
        if (this.hasGear && this.hasGear('gear_just_a_prank_g') && !this.gearPrankUsedThisRound && prevShield <= 0 && (this.hp - amount <= 0) && amount < 500) {
            this.gearPrankUsedThisRound = true;
            const oldX = this.x, oldY = this.y;
            bodyEffects.push(new GearPrankBox(this, oldX, oldY));
            this.x = (this.x + this.w / 2 < canvas.width / 2) ? (canvas.width - this.w - 30 - Math.random() * 60) : (30 + Math.random() * 60);
            this.hp = Math.max(1.2, this.maxHp * 0.2);
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 120); // 2.0s bất tử
            addFloatingText(this.x + this.w / 2, this.y - 18, 'CHỈ LÀ 1 TRÒ ĐÙA! 🤡✨', '#f472b6', 15);
            spawnSparkParticles(oldX + this.w / 2, oldY + this.h / 2, '#f472b6', 16);
            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
            return 0;
        }

        const dealt = origTakeDamage.call(this, amount, attacker, options);

        // Nếu Khiên vừa bị vỡ -> kích hoạt #66, #84, #139
        if (prevShield > 0 && (this.shield || 0) < prevShield) {
            onGearShieldBroken(this, attacker);
            if (shieldPierceDmg > 0 && this.hp > 0) {
                this.hp = Math.max(0.1, this.hp - shieldPierceDmg);
                addFloatingText(this.x + this.w / 2, this.y - 22, `-${shieldPierceDmg.toFixed(2)} XUYÊN KHIÊN!`, '#facc15', 12);
            }
        }

        if (this.hp < prevHp) {
            const actualHpLost = prevHp - this.hp;

            // #66 Phản Chấn Hạng Nặng: mỗi khi mất đủ 2.0 HP tích lũy -> phóng Sóng Chấn Động xóa đạn + gây 1.0 dame & Làm Chậm
            if (this.hasGear && this.hasGear('gear_surv_quake_g') && this.hp > 0) {
                this.gearQuakeLostHpAcc = (this.gearQuakeLostHpAcc || 0) + actualHpLost;
                if (this.gearQuakeLostHpAcc >= 2.0) {
                    this.gearQuakeLostHpAcc -= 2.0;
                    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                    const enemy = this.id === 1 ? p2 : p1;
                    explosions.push(new Explosion(cx, cy, 110, 'rgba(250, 204, 21,', 0, this));
                    if (enemy && Array.isArray(enemy.bullets)) {
                        enemy.bullets = enemy.bullets.filter(eb => Math.hypot(eb.x - cx, eb.y - cy) > 130);
                    }
                    if (enemy && enemy.hp > 0) {
                        enemy.takeDamage(1.0, this, { isEnvironmental: true });
                        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 90);
                    }
                    addFloatingText(cx, this.y - 18, 'PHẢN CHẤN HẠNG NẶNG! 💥', '#facc15', 13);
                }
            }

            // #140 Hơi Thở Thứ Hai: lần đầu tụt xuống < 35% Max HP -> giải CC, +2.5 Giáp Trắng & xóa đạn xung quanh
            if (this.hasGear && this.hasGear('gear_tac_second_wind_g') && !this.gearSecondWindTriggered && this.hp > 0 && (this.hp / Math.max(1, this.maxHp)) < 0.35) {
                this.gearSecondWindTriggered = true;
                this.freezeTimer = 0;
                this.slowTimer = 0;
                this.silenceTimer = 0;
                this.burnTimer = 0;
                this.gearBurnTimer = 0;
                this.gearVenomStacks = 0;
                this.gearWhiteShield = (this.gearWhiteShield || 0) + 2.5 * getGearHealMult(this);
                const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                const enemy = this.id === 1 ? p2 : p1;
                if (enemy && Array.isArray(enemy.bullets)) {
                    enemy.bullets = enemy.bullets.filter(eb => Math.hypot(eb.x - cx, eb.y - cy) > 110);
                }
                addFloatingText(cx, this.y - 18, 'HƠI THỞ THỨ HAI! +2.5 GIÁP TRẮNG 🛡️', '#38bdf8', 14);
            }
        }

        if (this.hp < prevHp && isDirectCombat) {
            this.gearNoDmgTicks = 0;

            // #44 Giáp Phản Đòn: phóng tia phản đòn 0.4 sát thương (CD 1.5s)
            if (this.hasGear && this.hasGear('gear_thorn_armor_g') && (this.gearThornCd || 0) <= 0) {
                this.gearThornCd = 90;
                const ang = Math.atan2((attacker.y + attacker.h / 2) - (this.y + this.h / 2), (attacker.x + attacker.w / 2) - (this.x + this.w / 2));
                this.bullets.push({
                    x: this.x + this.w / 2 - 3, y: this.y + this.h / 2 - 3,
                    w: 6, h: 10,
                    vx: Math.cos(ang) * 8.5, vy: Math.sin(ang) * 8.5,
                    dmg: 0.4, owner: this,
                    isPiercing: false, hitIds: [], bounceCount: 0
                });
            }

            // #49 Hút Máu Toàn Phần cho Attacker: hút 20% sát thương gây ra, dư chuyển thành Giáp Trắng (tối đa 3.0)
            const actualHpLost = prevHp - this.hp;
            if (attacker.hasGear && attacker.hasGear('gear_omnivamp_p') && actualHpLost > 0 && attacker.hp > 0) {
                const vamp = actualHpLost * 0.20 * getGearHealMult(attacker);
                if (attacker.hp + vamp <= attacker.maxHp) {
                    attacker.hp += vamp;
                } else {
                    const over = (attacker.hp + vamp) - attacker.maxHp;
                    attacker.hp = attacker.maxHp;
                    attacker.gearWhiteShield = Math.min(3.0, (attacker.gearWhiteShield || 0) + over);
                }
            }

            // #72 Đòn Kết Liễu Lạnh Lùng: máu địch xuống dưới 8% Max HP -> Kết liễu ngay lập tức!
            if (attacker.hasGear && attacker.hasGear('gear_execute_coup_g') && this.hp > 0 && (this.hp / Math.max(1, this.maxHp)) <= 0.08) {
                this.hp = 0;
                this.ghostHp = 0;
                addFloatingText(this.x + this.w / 2, this.y - 22, 'KẾT LIỄU! ☠️', '#ef4444', 16);
                if (gameState.phase === 'playing') triggerFatalCinematic(attacker.id, this);
            }
        }

        return dealt;
    };

    // 7. onCollectAmmoCrate wrapper (#10 Thùng Đồ Đột Biến)
    const origCollectAmmo = Player.prototype.onCollectAmmoCrate;
    Player.prototype.onCollectAmmoCrate = function (crate = null) {
        const res = origCollectAmmo.apply(this, arguments);
        if (this.hasGear && this.hasGear('gear_super_crate_g')) {
            this.gearSuperCrateSpdTimer = 120; // +20% tốc chạy 2s
            if (this.weapon === 'water_gun' || this.weapon === 'furnace') this.energy = this.maxEnergy || 100;
            else if (this.weapon === 'the_strongest') this.chuLuc = this.maxChuLuc || 100;
            else if (this.weapon === 'sukuna') this.cursedEnergy = 100;
        }
        return res;
    };
})();

function onGearShieldBroken(player, attacker) {
    if (!player || !player.hasGear) return;
    const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
    const enemy = player.id === 1 ? p2 : p1;

    // #66 Khiên Chắn Phản Xung: xóa đạn thường trong bán kính 110px & +20% tốc chạy 2s
    if (player.hasGear('gear_surv_aegis_g')) {
        player.gearAegisSpdTimer = 120;
        explosions.push(new Explosion(cx, cy, 85, 'rgba(56, 189, 248,', 0, player));
        if (enemy && Array.isArray(enemy.bullets)) {
            enemy.bullets = enemy.bullets.filter(b => Math.hypot(b.x - cx, b.y - cy) > 110);
        }
        addFloatingText(cx, player.y - 16, 'PHẢN XUNG! XÓA ĐẠN 🛡️', '#38bdf8', 12);
    }

    // #84 Chiến Xa Thiết Giáp (Tank): khiên vỡ nổ đẩy trượt và làm chậm địch
    if (player.hasGear('gear_hero_tank_g') && player.weapon === 'tank' && enemy && enemy.hp > 0) {
        explosions.push(new Explosion(cx, cy, 75, 'rgba(251, 146, 60,', 0.4, player));
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 90);
        if (!(enemy.hasGear && enemy.hasGear('gear_giant_tank_g'))) {
            const dir = (enemy.x + enemy.w / 2 >= cx) ? 1 : -1;
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dir * 35));
        }
    }

    // #139 Hưng Phấn Tác Chiến: khi attacker bắn vỡ Khiên hoặc Giáp Trắng của mục tiêu -> attacker nhận Hưng Phấn
    if (attacker && attacker.hasGear && attacker.hasGear('gear_tac_adrenaline_g')) {
        triggerGearAdrenaline(attacker);
    }
}

// ------------------------------------------
// 7. HUD CHIP HIỂN THỊ G.E.A.R & GIÁP TRẮNG TRÊN SÂN
// ------------------------------------------
if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(
        p => (p.gearWhiteShield || 0) >= 0.1 ? { g: 'guard', c: '#e2e8f0', l: 'GIÁP', t: (Math.round(p.gearWhiteShield * 10) / 10).toString() } : null,
        p => (p.gearFrenzyStacks || 0) > 0 ? { g: 'sword', c: '#ef4444', l: 'CUỒNG×' + p.gearFrenzyStacks, t: '' } : null,
        p => (p.gearVenomStacks || 0) > 0 ? { g: 'skull', c: '#4ade80', l: 'ĐỘC×' + p.gearVenomStacks, t: '' } : null,
        p => (p.gearOverclockActive || 0) > 0 ? { g: 'bolt', c: '#facc15', l: 'QUÁ TẢI', t: (p.gearOverclockActive / 60).toFixed(1) } : null,
        p => (p.gearAdrenalineTimer || 0) > 0 ? { g: 'up', c: '#f97316', l: 'HƯNG PHẤN', t: (p.gearAdrenalineTimer / 60).toFixed(1) } : null,
        p => (p.hasGear && p.hasGear('gear_bullet_eater_g') && (p.gearBulletEaterActive || 0) > 0) ? { g: 'guard', c: '#38bdf8', l: 'HẤP THỤ', t: '' } : null
    );
}

// ------------------------------------------
// 8. MODAL THỬ NGHIỆM G.E.A.R TRONG PHÒNG TẬP (PRACTICE SANDBOX)
// ------------------------------------------
const PracticeGearModal = {
    targetPlayerId: 'p1',
    filterTier: 'ALL',
    searchQuery: '',

    open(playerId = 'p1') {
        this.targetPlayerId = playerId;
        let modal = document.getElementById('practiceGearModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'practiceGearModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-card bot-weapon-card gear-sandbox-modal">
                    <div class="modal-header">
                        <h2 id="gearSandboxTitle">⚙️ LẮP LÕI G.E.A.R (150 LÕI)</h2>
                        <button id="closeGearSandboxBtn" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body bot-weapon-content">
                        <div class="gear-sandbox-controls">
                            <div class="gear-sandbox-tabs">
                                <button class="gear-filter-btn active" data-tier="ALL">TẤT CẢ (150)</button>
                                <button class="gear-filter-btn" data-tier="SILVER">🥈 BẠC</button>
                                <button class="gear-filter-btn" data-tier="GOLD">🥇 VÀNG</button>
                                <button class="gear-filter-btn" data-tier="PRISMATIC">💎 LĂNG KÍNH</button>
                                <button class="gear-filter-btn" data-tier="FIT">🎯 HỢP XE HIỆN TẠI</button>
                            </div>
                            <div class="gear-sandbox-search-row">
                                <input type="text" id="gearSandboxSearch" class="online-input" placeholder="🔍 Tìm theo tên, #số hoặc mô tả G.E.A.R..." style="padding:6px 10px;font-size:12px;">
                                <button id="clearEquippedGearsBtn" class="tb-btn btn-exit" style="width:auto;padding:6px 12px;">🗑️ XÓA HẾT G.E.A.R</button>
                            </div>
                        </div>
                        <div id="gearSandboxEquippedBar" class="gear-sandbox-equipped-bar"></div>
                        <div id="gearSandboxGrid" class="bot-weapon-grid"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="closeGearSandboxFooterBtn" class="glow-btn btn-secondary">ĐÓNG</button>
                    </div>
                </div>
            `;
            document.getElementById('gameContainer').appendChild(modal);

            document.getElementById('closeGearSandboxBtn').onclick = () => this.close();
            document.getElementById('closeGearSandboxFooterBtn').onclick = () => this.close();
            document.getElementById('gearSandboxSearch').oninput = (e) => {
                this.searchQuery = (e.target.value || '').toLowerCase();
                this.render();
            };
            document.getElementById('clearEquippedGearsBtn').onclick = () => {
                const p = this.targetPlayerId === 'p1' ? p1 : p2;
                if (p) {
                    p.equippedGears = [];
                    p.gearFreeFeetUpgrades = [];
                    p.gearBonusMaxHp = 0;
                    p.gearInfiniteStacks = 0;
                    p.gearJackpot = 0;
                    p.setupForNewRound();
                    this.render();
                }
            };
            modal.querySelectorAll('.gear-filter-btn').forEach(btn => {
                btn.onclick = () => {
                    modal.querySelectorAll('.gear-filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterTier = btn.dataset.tier;
                    this.render();
                };
            });
        }
        modal.style.display = 'flex';
        this.render();
    },

    close() {
        const modal = document.getElementById('practiceGearModal');
        if (modal) modal.style.display = 'none';
    },

    render() {
        const p = this.targetPlayerId === 'p1' ? p1 : p2;
        if (!p) return;
        ensurePlayerGearState(p);

        const titleEl = document.getElementById('gearSandboxTitle');
        if (titleEl) {
            titleEl.innerText = this.targetPlayerId === 'p1'
                ? `⚙️ G.E.A.R CỦA BẠN (Đang lắp: ${p.equippedGears.length})`
                : `🤖 G.E.A.R CỦA BOT (Đang lắp: ${p.equippedGears.length})`;
        }

        const eqBar = document.getElementById('gearSandboxEquippedBar');
        if (eqBar) {
            eqBar.innerHTML = p.equippedGears.length
                ? renderEquippedGearStrip(p)
                : '<span style="color:#94a3b8;font-size:11px;">Chưa trang bị lõi G.E.A.R nào. Nhấp vào thẻ bên dưới để Bật / Tắt thử nghiệm ngay!</span>';
        }

        const grid = document.getElementById('gearSandboxGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const list = GEARS.filter(g => {
            if (this.filterTier === 'FIT') {
                if (Array.isArray(g.bodies) && !g.bodies.includes(p.weapon)) return false;
                if (Array.isArray(g.excludeBodies) && g.excludeBodies.includes(p.weapon)) return false;
                const mod = MODULES.BODY.find(m => m.id === p.weapon);
                const mainRole = (mod && mod.role && mod.role[0]) || null;
                if (g.roleReq && g.roleReq !== mainRole) return false;
            } else if (this.filterTier !== 'ALL' && g.tier !== this.filterTier) {
                return false;
            }
            if (this.searchQuery) {
                const hay = `#${g.num} ${g.name} ${g.id} ${g.desc}`.toLowerCase();
                if (!hay.includes(this.searchQuery)) return false;
            }
            return true;
        });

        list.forEach(g => {
            const owned = p.equippedGears.includes(g.id);
            const tInfo = GEAR_TIERS[g.tier] || GEAR_TIERS.SILVER;
            const item = document.createElement('div');
            item.className = `bot-weapon-item gear-sandbox-item tier-${g.tier.toLowerCase()}` + (owned ? ' current' : '');
            item.innerHTML = `
                <div class="bwi-name" style="color:${tInfo.color}">${tInfo.icon} #${g.num} — ${g.name} ${owned ? '✔' : ''}</div>
                <div class="bwi-stats">Bậc: ${tInfo.name} • Giai đoạn: ${g.stage || 'ALL'}</div>
                <div class="bwi-desc">${g.desc}</div>
            `;
            item.onclick = () => {
                if (owned) {
                    p.equippedGears = p.equippedGears.filter(id => id !== g.id);
                } else {
                    p.addGear(g.id);
                }
                const curX = p.x;
                p.setupForNewRound();
                p.x = curX;
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                this.render();
            };
            grid.appendChild(item);
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const btnP1Gear = document.getElementById('btnOpenPlayerGearModal');
    if (btnP1Gear) btnP1Gear.addEventListener('click', () => PracticeGearModal.open('p1'));
    const btnP2Gear = document.getElementById('btnOpenBotGearModal');
    if (btnP2Gear) btnP2Gear.addEventListener('click', () => PracticeGearModal.open('p2'));
});
