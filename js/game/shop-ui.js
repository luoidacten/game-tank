// ==========================================
// Màn hình nâng cấp & cửa hàng giữa các hiệp
// ==========================================



// Module chân: mỗi lần đã mua làm giá tăng thêm 50% giá gốc.
// Động Cơ giới hạn 3 lần (chống "ma tốc độ"), đủ rồi thì không xuất hiện trong shop nữa.
const FEET_PRICE_STEP = 0.5;
const FEET_MAX = { speed: 3 };
function feetOwnedCount(player, id) {
    const total = (player.upgrades || []).filter(u => u === id).length;
    const free = (player.gearFreeFeetUpgrades || []).filter(u => u === id).length;
    return Math.max(0, total - free);
}
function feetTotalCount(player, id) { return (player.upgrades || []).filter(u => u === id).length; }
function feetMaxed(player, id) {
    if (id === 'speed' && player && typeof player.hasGear === 'function' && (player.hasGear('gear_uncap_speed_g') || player.hasGear('gear_speed_heal_p'))) return false;
    return FEET_MAX[id] !== undefined && feetTotalCount(player, id) >= FEET_MAX[id];
}
// Bánh Xích: 3 lần đầu x1.25 (hoặc 6 lần đầu nếu có G.E.A.R #22 Bánh Xích Hạng Nặng), sau đó hiệu quả giảm dần
function feetDamageMult(n, player) {
    const flatCap = (player && typeof player.hasGear === 'function' && player.hasGear('gear_heavy_tread_s')) ? 6 : 3;
    return n <= flatCap ? 1.25 : 1 + 0.25 * Math.pow(0.6, n - flatCap);
}
// Lợi Tức: tiền nhận mỗi hiệp không chỉ cộng dồn mà còn nhân thêm 20% mỗi tầng
// (1 tầng 30$, 2 tầng 72$, 3 tầng 126$, 4 tầng 192$...; Xe Tiền gấp đôi)
function interestIncome(n, isMoneyTank) {
    if (n <= 0) return 0;
    return Math.round(n * (isMoneyTank ? 60 : 30) * (1 + 0.2 * (n - 1)));
}
function shopItemPrice(player, item) {
    if (item.type === 'feet' && player && player._gearFreeFootAvailable) return 0;
    const base = item.cost || 10;
    let m = typeof mtPriceMult === 'function' ? mtPriceMult(player) : 1; // Xe Tiền Evo 2 / Full Evo giảm giá
    if (player && typeof player.hasGear === 'function') {
        if (item.type === 'feet' && player.hasGear('gear_discount_s')) m *= 0.75; // #4 Giảm Giá (-25% Module Chân)
        if (player.hasGear('gear_discount_g')) m *= 0.70; // #5 Giảm Giá++ (-30% mọi mặt hàng)
        if (item.id === 'speed' && player.hasGear('gear_uncap_speed_g')) m *= 0.80; // #15 (-20% giá Động Cơ)
    }
    if (item.type !== 'feet') return Math.max(1, Math.round(base * m));
    return Math.max(1, Math.round(base * (1 + FEET_PRICE_STEP * feetOwnedCount(player, item.id)) * m));
}

function triggerGearVipShop(player, playerId, item) {
    if (!player || !item || item.type !== 'feet' || typeof player.hasGear !== 'function' || !player.hasGear('gear_vip_shop_g')) return;
    player._gearVipFootBoughtCount = (player._gearVipFootBoughtCount || 0) + 1;
    if (player._gearVipFootBoughtCount % 3 === 0) {
        const bonusPool = ['armor', 'damage', 'speed'];
        const pick = bonusPool[Math.floor(Math.random() * bonusPool.length)];
        if (!Array.isArray(player.gearFreeFeetUpgrades)) player.gearFreeFeetUpgrades = [];
        player.gearFreeFeetUpgrades.push(pick);
        const names = { armor: '+1 Giáp Thép', damage: '+1 Bánh Xích', speed: '+1 Động Cơ' };
        if (typeof addFloatingText === 'function') {
            addFloatingText(player.x + player.w / 2, player.y - 24, `KHÁCH VIP: TẶNG ${names[pick]}! 🎁`, '#facc15', 14);
        }
    }
}

// Huy hiệu vai trò của body (vai trò chính đứng đầu, nổi bật hơn)
const ROLE_ICON = { 'Đối Đầu': '⚔️', 'Kiểm Soát': '🕸️', 'Cơ Động': '⚡', 'Sinh Tồn': '🛡️' };
// Tướng Collab (rất mạnh): huy hiệu riêng ở phần chọn tướng; chọn tướng Collab -> đối thủ được bù tiền đầu game
const COLLAB_BONUS = { kazuki: 150, joker: 150, raven_oca: 120, chrononeo: 150, tsukiyo: 150 };
function collabBonusOf(id) { return COLLAB_BONUS[id] || 0; }
function collabBadge(mod) {
    const b = mod && collabBonusOf(mod.id);
    return b ? `<div class="role-badges"><span class="role-badge main" style="background:linear-gradient(90deg,#ff2bd6,#ffb300);color:#fff;border-color:#ffd166;box-shadow:0 0 8px #ff2bd6">★ COLLAB</span><span class="role-badge" style="color:#ffd166;border-color:#ffb300">Đối thủ +$${b}</span></div>` : '';
}
// Gọi ở đầu hiệp 1 (1 lần/trận): bù tiền cho đối thủ của tướng Collab
function applyCollabBonus() {
    if (gameState.round !== 1 || gameState.collabBonusDone || !p1 || !p2) return;
    gameState.collabBonusDone = true;
    const isGuest = typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest';
    [[p1, p2], [p2, p1]].forEach(([pick, opp]) => {
        const b = collabBonusOf(pick.weapon);
        if (!b) return;
        if (!isGuest) { if (opp.id === 1) gameState.p1Coins += b; else gameState.p2Coins += b; } // tiền đồng bộ từ host
        addFloatingText(opp.x + opp.w / 2, opp.id === 1 ? opp.y - 26 : opp.y + opp.h + 30, `+$${b} bù Collab`, '#ffd166', 16);
    });
    if (typeof updateScoreBoard === 'function') updateScoreBoard();
}
function roleBadges(mod) {
    if (!mod || !mod.role || !mod.role.length) return collabBadge(mod);
    return collabBadge(mod) + '<div class="role-badges">' + mod.role.map((r, i) =>
        `<span class="role-badge${i === 0 ? ' main' : ''}" data-role="${r}">${ROLE_ICON[r] || ''} ${r}</span>`).join('') + '</div>';
}

function showUpgradeScreen() {
    gameState.phase = 'upgrade';
    const upgScreen = document.getElementById('upgradeScreen');
    if (upgScreen) upgScreen.style.display = 'flex';

    gameState.p1Ready = false;
    gameState.p2Ready = false;

    const p1Status = document.getElementById('p1-ready-status');
    const p2Status = document.getElementById('p2-ready-status');
    if (p1Status) {
        p1Status.classList.remove('is-ready');
        p1Status.innerHTML = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') 
            ? '🔵 ĐỐI THỦ: ĐANG CHỌN...' : '🔵 BẠN: CHƯA SẴN SÀNG';
    }
    if (p2Status) {
        p2Status.classList.remove('is-ready');
        p2Status.innerHTML = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') 
            ? '🔴 ĐỐI THỦ: ĐANG CHỌN...' : '🔴 BẠN: CHƯA SẴN SÀNG';
    }

    // Reset ưu đãi G.E.A.R đầu mỗi hiệp cửa hàng (#103 Reroll miễn phí, #3 Module Chân 0$)
    [p1, p2].forEach(pl => {
        if (!pl) return;
        if (pl._gearShopRound !== gameState.round) {
            pl._gearShopRound = gameState.round;
            pl._gearFreeRerollAvailable = typeof pl.hasGear === 'function' && pl.hasGear('gear_starter_p');
            pl._gearFreeFootAvailable = typeof pl.hasGear === 'function' && pl.hasGear('gear_free_foot_s');
            pl._gamblerFreeReroll = isGamblerBody(pl); // Nội tại Cờ Bạc: Reroll đầu tiên mỗi hiệp miễn phí
        }
    });

    // In Online Mode: Only render cards for yourself, cleanly centered
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        if (gameState.round === 1) {
            const roleColor = (onlineManager.role === 'guest') ? 'ĐỎ' : 'XANH';
            document.getElementById('roundTitleText').innerText = `ROUND 1 - CHỌN BODY (BẠN: ${roleColor})`;
            if (onlineManager.role === 'guest') {
                renderStandardCards('p2', MODULES.BODY);
            } else {
                renderStandardCards('p1', MODULES.BODY);
            }
            return;
        }

        const myPid = (onlineManager.role === 'guest') ? 'p2' : 'p1';
        if (typeof showGearSelectionIfNeeded === 'function') {
            showGearSelectionIfNeeded(myPid, () => {
                updateShopTitle();
                renderShop(myPid);
            });
        } else {
            updateShopTitle();
            renderShop(myPid);
        }
        return;
    }

    if (gameState.round === 1) {
        document.getElementById('roundTitleText').innerText = "ROUND 1 - CHỌN VŨ KHÍ";
        renderStandardCards('p1', MODULES.BODY);
        renderStandardCards('p2', MODULES.BODY);

        // Giải Đấu PVE: bot chọn đúng body của vòng
        if (typeof PVE !== 'undefined' && PVE.active) {
            setTimeout(() => { if (gameState.phase === 'upgrade' && !gameState.p2Ready) PVE.botPickBody(); }, 300);
            return;
        }
        // Tự động chọn vũ khí cho Bot trong phòng luyện tập
        if (typeof botAI !== 'undefined' && botAI.enabled) {
            setTimeout(() => {
                if (gameState.phase === 'upgrade' && !gameState.p2Ready) {
                    const p2Cards = document.querySelectorAll('#p2-upgrades .card');
                    if (p2Cards.length > 0) {
                        p2Cards[0].click();
                    } else {
                        handlePlayerReady('p2');
                    }
                }
            }, 300);
        }
        return;
    }

    updateShopTitle();
    const openP1Shop = () => { updateShopTitle(); renderShop('p1'); };
    const openP2Shop = () => {
        updateShopTitle();
        renderShop('p2');
        // Giải Đấu PVE: bot tự mua đồ rồi sẵn sàng
        if (typeof PVE !== 'undefined' && PVE.active) {
            setTimeout(() => { if (gameState.phase === 'upgrade' && !gameState.p2Ready) PVE.botShop(); }, 400);
            return;
        }
        // Tự động sẵn sàng cho Bot trong Shop ở các round tiếp theo
        if (typeof botAI !== 'undefined' && botAI.enabled) {
            setTimeout(() => {
                if (gameState.phase === 'upgrade' && !gameState.p2Ready) {
                    handlePlayerReady('p2');
                }
            }, 300);
        }
    };

    if (typeof showGearSelectionIfNeeded === 'function') {
        showGearSelectionIfNeeded('p1', openP1Shop);
        showGearSelectionIfNeeded('p2', openP2Shop);
    } else {
        openP1Shop();
        openP2Shop();
    }
}

function renderStandardCards(playerId, list) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const player = (playerId === 'p1') ? p1 : p2;

    if (!player._bodySelectionState || player._bodySelectionState.round !== gameState.round) {
        const initial = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
        player._bodySelectionState = {
            round: gameState.round,
            choices: initial,
            rerolledSlots: initial.map(() => false),
            seenIds: new Set(initial.map(m => m.id)),
            justRerolledSlot: -1
        };
    }

    const state = player._bodySelectionState;
    const shuffled = state.choices;
    container.innerHTML = "";

    shuffled.forEach((mod, slotIdx) => {
        const isRerolled = !!state.rerolledSlots[slotIdx];
        const div = document.createElement('div');
        div.className = 'card pick-card' +
            (collabBonusOf(mod.id) ? ' collab-card' : '') +
            (state.justRerolledSlot === slotIdx ? ' gear-card-reroll-anim' : '');
        if (collabBonusOf(mod.id)) {
            div.style.border = '2px solid #ff2bd6';
            div.style.boxShadow = '0 0 14px rgba(255,43,214,0.65), inset 0 0 10px rgba(255,179,0,0.25)';
        }
        div.innerHTML = `
            <h4>${collabBonusOf(mod.id) ? '★ ' : ''}${mod.name}</h4>
            ${roleBadges(mod)}
            <p>${mod.desc}</p>
            <button type="button" class="gear-card-reroll-btn${isRerolled ? ' is-used' : ''}" ${isRerolled ? 'disabled' : ''} title="${isRerolled ? 'Ô này đã dùng lượt đổi lại' : 'Đổi lại riêng vũ khí ở ô này (1 lần/ô)'}">
                ${isRerolled ? '✔ ĐÃ ĐỔI' : '🔄 ĐỔI LẠI'}
            </button>
        `;

        const rerollBtn = div.querySelector('.gear-card-reroll-btn');
        if (rerollBtn) {
            rerollBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (state.rerolledSlots[slotIdx]) return;
                const currentIds = new Set(state.choices.map(m => m && m.id).filter(Boolean));
                let pool = list.filter(m => !state.seenIds.has(m.id) && !currentIds.has(m.id));
                if (pool.length === 0) pool = list.filter(m => !currentIds.has(m.id));
                if (pool.length > 0) {
                    const replacement = pool[Math.floor(Math.random() * pool.length)];
                    state.choices[slotIdx] = replacement;
                    state.seenIds.add(replacement.id);
                    state.rerolledSlots[slotIdx] = true;
                    state.justRerolledSlot = slotIdx;
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick ? soundSystem.playClick() : soundSystem.playPowerup();
                    renderStandardCards(playerId, list);
                }
            };
        }

        div.onclick = () => {
            player._bodySelectionState = null;
            player.addUpgrade(mod.id); soundSystem.playPowerup();
            const rb = div.querySelector('.gear-card-reroll-btn');
            if (rb) rb.remove();
            // Chuyển sang bước chọn G.E.A.R Mốc 1 ngay sau khi chọn Body ở Hiệp 1
            if (typeof showGearSelectionIfNeeded === 'function') {
                showGearSelectionIfNeeded(playerId, () => {
                    container.innerHTML = '';
                    div.style.background = '#27ae60';
                    div.style.cursor = 'default'; div.onclick = null;
                    container.appendChild(div);
                    if (typeof renderEquippedGearStrip === 'function') renderEquippedGearStrip(playerId, container);
                    handlePlayerReady(playerId);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
                        onlineManager.sendLoadout(playerId);
                        onlineManager.sendReady(playerId);
                    }
                });
                return;
            }
            container.innerHTML = '';
            div.style.background = '#27ae60';
            div.style.cursor = 'default'; div.onclick = null;
            container.appendChild(div);
            handlePlayerReady(playerId);
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
                onlineManager.sendLoadout(playerId);
                onlineManager.sendReady(playerId);
            }
        };
        container.appendChild(div);
    });
    state.justRerolledSlot = -1;
}

// Nội tại Cờ Bạc (docs/BODY_MOI_4.md): Joker, Jack - 6 Lỗ, COC -> Reroll đầu tiên mỗi hiệp miễn phí, +1 ô lựa chọn shop & G.E.A.R
const GAMBLER_BODIES = ['joker', 'jack_6_lo', 'coc'];
function isGamblerBody(p) {
    if (!p) return false;
    if (GAMBLER_BODIES.includes(p.weapon)) return true;
    return Array.isArray(p.upgrades) && p.upgrades.some(u => GAMBLER_BODIES.includes(u));
}

function renderShop(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;
    const coins = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;

    if (player.rerollCount === undefined) player.rerollCount = 0;

    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#c0392b';
    let rerollMult = typeof mtPriceMult === 'function' ? mtPriceMult(player) : 1;
    if (player && typeof player.hasGear === 'function') {
        if (player.hasGear('gear_discount_g')) rerollMult *= 0.70;
    }
    const gamblerFree = !!player._gamblerFreeReroll && isGamblerBody(player);
    const rerollCost = (player._gearFreeRerollAvailable || gamblerFree) ? 0 : Math.max(2, Math.round(5 * rerollMult));
    rerollBtn.innerHTML = `<h4>REROLL</h4><p>Đổi hàng</p><p style="color:yellow">${rerollCost === 0 ? 'MIỄN PHÍ' : '$' + rerollCost}</p>` +
        (gamblerFree ? `<p class="gambler-free-tag" style="color:#fcd34d; font-size:10px; font-weight:bold; margin-top:2px;">🎲 Cờ Bạc: Reroll miễn phí</p>` : '');
    rerollBtn.onclick = () => {
        if ((playerId === 'p1' ? gameState.p1Coins : gameState.p2Coins) >= rerollCost) {
            if (gamblerFree) {
                player._gamblerFreeReroll = false;
            } else if (player._gearFreeRerollAvailable) {
                player._gearFreeRerollAvailable = false;
            } else {
                if (playerId === 'p1') gameState.p1Coins -= rerollCost; else gameState.p2Coins -= rerollCost;
            }
            player.rerollCount++;
            soundSystem.playCoin();
            updateShopTitle();
            renderShop(playerId, false);
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
        }
    };
    container.appendChild(rerollBtn);

    // [FIX] Chỉ hiện Gói Nâng Cấp khi cầm XE TIỀN
    if (player.weapon === 'money_tank') {
        if (player.upgradeLevel < 6) {
            let mtUpgradeMult = mtPriceMult(player);
            if (typeof player.hasGear === 'function' && player.hasGear('gear_discount_g')) {
                mtUpgradeMult *= 0.70;
            }
            let cost = Math.max(1, Math.round(15 * Math.pow(2, player.upgradeLevel) * mtUpgradeMult));
            let nextLvl = player.upgradeLevel + 1;
            let bonusText = "";
            if (nextLvl === 3) bonusText = "<br>(Mở khóa: KHIÊN + 2 HP)";
            if (nextLvl === 4) bonusText = "<br>(Mở khóa: ĐẠN XUYÊN + 0.5 DAME)";
            if (nextLvl === 5) bonusText = "<br>(Mở khóa: ĐẠN NỔ)";
            if (nextLvl === 6) bonusText = "<br>(ĐẾ CHẾ TIỀN TỆ: +3 HP, +2 Đạn, +1 Dame, 2 Khiên)";

            let upgradeBtn = document.createElement('div');
            upgradeBtn.className = 'card';
            upgradeBtn.style.border = '2px solid gold';
            upgradeBtn.dataset.icon = '📈';
            upgradeBtn.innerHTML = `<h4>CẤP ĐỘ ${nextLvl}</h4><p>+1 HP, Dame, Đạn, Tốc.${bonusText}</p><p style="color:#f1c40f;">$${cost}</p>`;
            upgradeBtn.onclick = () => {
                let curMoney = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (curMoney >= cost) {
                    if (playerId === 'p1') gameState.p1Coins -= cost; else gameState.p2Coins -= cost;
                    player.upgradeLevel++;
                    soundSystem.playPowerup();
                    updateShopTitle();
                    renderShop(playerId, true);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                }
            };
            container.appendChild(upgradeBtn);
        } else {
            let winBtn = document.createElement('div');
            winBtn.className = 'card';
            winBtn.style.background = '#f39c12';
            winBtn.style.border = '3px solid white';
            winBtn.dataset.icon = '👑';
            winBtn.innerHTML = `<h4>PAY TO WIN</h4><p>THẮNG LUÔN.</p><p style="color:white; font-size:1.2em">$500</p>`;
            winBtn.onclick = () => {
                let curMoney = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (curMoney >= 500) {
                    // Online guest: gửi yêu cầu cho host xử lý (host trừ tiền & kết thúc hiệp)
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                        onlineManager.sendNetworkMessage({ type: 'PAY_TO_WIN' });
                        return;
                    }
                    // [FIX] Trước đây không trừ 500$
                    if (playerId === 'p1') gameState.p1Coins -= 500; else gameState.p2Coins -= 500;
                    endRound(playerId === 'p1' ? 1 : 2);
                    document.getElementById('upgradeScreen').style.display = 'none';
                }
            };
            container.appendChild(winBtn);
        }
    }

    // Smart Shop: Caching & Cơ chế Bảo Hiểm (Pity System)
    if (!keepItems || !player.currentShopItems) {
        let poolFeet = MODULES.FEET.filter(f => !feetMaxed(player, f.id));
        let availableEvos = [];
        const weaponEvos = EVOLUTIONS[player.weapon];
        if (weaponEvos) {
            availableEvos = weaponEvos.filter(e => !player.upgrades.includes(e.id));
        }

        let shopItems = [];
        if (player.rerollCount >= 3 && availableEvos.length > 0) {
            let guaranteedEvo = availableEvos[Math.floor(Math.random() * availableEvos.length)];
            shopItems.push(guaranteedEvo);
            let remainingPool = poolFeet.concat(availableEvos.filter(e => e.id !== guaranteedEvo.id));
            remainingPool.sort(() => 0.5 - Math.random());
            shopItems.push(remainingPool[0]);
            if (isGamblerBody(player) && remainingPool[1]) shopItems.push(remainingPool[1]); // Cờ Bạc: +1 ô
            player.rerollCount = 0;
        } else {
            let generalPool = poolFeet.concat(availableEvos).sort(() => 0.5 - Math.random());
            shopItems = generalPool.slice(0, 2 + (isGamblerBody(player) ? 1 : 0)); // Cờ Bạc: +1 ô
            if (shopItems.some(it => it.type === 'evo')) player.rerollCount = 0;
        }

        player.currentShopItems = shopItems;
        player.boughtShopItems = []; // "ĐÃ MUA" chỉ tính trong lượt hàng hiện tại
    }

    player.currentShopItems.forEach(item => {
        const price = shopItemPrice(player, item);
        const card = document.createElement('div');

        if (player.boughtShopItems && player.boughtShopItems.includes(item.id)) {
            card.className = 'card sold';
            card.innerHTML = `<h4>${item.name}</h4><p>ĐÃ MUA</p>`;
            card.dataset.icon = SHOP_ICON[item.id] || (item.type === 'evo' ? '🧬' : '');
        } else {
            if (item.type === 'evo') card.className = 'card evo-card';
            else card.className = 'card';

            const owned = item.type === 'feet' ? feetTotalCount(player, item.id) : 0;
            const cap = (item.id === 'speed' && player && typeof player.hasGear === 'function' && (player.hasGear('gear_uncap_speed_g') || player.hasGear('gear_speed_heal_p'))) ? undefined : FEET_MAX[item.id];
            const lvlTxt = owned > 0 || cap ? ` <span style="color:#94a3b8">(${cap ? `${owned}/${cap}` : `đã có ${owned}`})</span>` : '';
            let extra = '';
            if (item.id === 'damage') extra = `<br><span style="color:#facc15">Lần này: x${feetDamageMult(owned + 1, player).toFixed(2)} sát thương</span>`;
            if (item.id === 'interest') extra = `<br><span style="color:#facc15">Mỗi hiệp: ${interestIncome(owned, player.weapon === 'money_tank')}$ → ${interestIncome(owned + 1, player.weapon === 'money_tank')}$</span>`;
            const priceLabel = price === 0 ? 'MIỄN PHÍ' : ('$' + price);
            card.innerHTML = `<h4>${item.name}${lvlTxt}</h4><p>${item.desc}${extra}</p><p style="color:#f1c40f; font-weight:bold">${priceLabel}</p>`;
            card.dataset.icon = SHOP_ICON[item.id] || (item.type === 'evo' ? '🧬' : '');

            card.onclick = () => {
                const currentCoin = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (currentCoin >= price) {
                    const wasFreeFoot = (item.type === 'feet' && price === 0 && player._gearFreeFootAvailable);
                    if (!player.addUpgrade(item.id)) return; // Động Cơ đã đủ giới hạn
                    if (wasFreeFoot) {
                        player._gearFreeFootAvailable = false;
                    } else {
                        if (playerId === 'p1') gameState.p1Coins -= price; else gameState.p2Coins -= price;
                    }
                    triggerGearVipShop(player, playerId, item);
                    updateShopTitle();
                    soundSystem.playPowerup();
                    if (!player.boughtShopItems) player.boughtShopItems = [];
                    player.boughtShopItems.push(item.id);
                    renderShop(playerId, true);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                }
            };
        }
        container.appendChild(card);
    });

    // Nút riêng của các body đăng ký qua CharHooks (Luyện Kiếm, Tùy Biến...)
    CharHooks.call(player, 'shopButtons', container, playerId);

    // Nút độc quyền cho Nhà Phát Minh: MỞ CHỢ LINH KIỆN
    if (player.weapon === 'inventor') {
        const invBtn = document.createElement('div');
        invBtn.className = 'card';
        invBtn.style.border = '2px solid #00ffcc';
        invBtn.style.background = '#1a1a2e';
        invBtn.innerHTML = `<h4>⚙ CHỢ LINH KIỆN</h4><p>Nâng cấp Công Nghệ</p><p style="color:#00ffcc; font-weight:bold">LK: ${player.components || 0}</p>`;
        invBtn.onclick = () => {
            renderInventorShop(playerId, false);
        };
        container.appendChild(invBtn);
    }

    // Nút độc quyền cho Thiên Tài: MỞ CHỢ ĐEN ROBOT
    if (player.weapon === 'genius') {
        const genBtn = document.createElement('div');
        genBtn.className = 'card';
        genBtn.style.border = '2px solid #ab47bc';
        genBtn.style.background = '#2c1033';
        genBtn.innerHTML = `<h4>🤖 CHỢ ĐEN ROBOT</h4><p>Nâng cấp Mecha</p><p style="color:#e040fb; font-weight:bold">BR: ${player.gears || 0} | LK: ${player.components || 0}</p>`;
        genBtn.onclick = () => {
            renderGeniusBlackMarket(playerId, false);
        };
        container.appendChild(genBtn);
    }

    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid white';
    readyBtn.innerHTML = `<h4>SẴN SÀNG</h4>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
            onlineManager.sendLoadout(playerId);
            onlineManager.sendReady(playerId);
        }
    };
    container.appendChild(readyBtn);
    if (typeof renderEquippedGearStrip === 'function') renderEquippedGearStrip(playerId, container);
}

function renderInventorShop(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;

    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) roundTitle.innerText = `CHỢ LINH KIỆN (Sở hữu: ${player.components || 0} LK)`;

    if (!player.invUpgrades) player.invUpgrades = {};

    // Đếm số lượng nâng cấp thông thường đã đạt cấp tối đa (tổng 18 nâng cấp)
    const regularItems = INVENTOR_SHOP.filter(item => item.type !== 'fullevo');
    let maxedCount = 0;
    regularItems.forEach(item => {
        let lvl = player.invUpgrades[item.id] || 0;
        if (lvl === true) lvl = 1;
        if (lvl >= item.maxLvl) maxedCount++;
    });

    // 1. Nút QUAY LẠI Cửa Hàng Thường
    const backBtn = document.createElement('div');
    backBtn.className = 'card';
    backBtn.style.background = '#2c3e50';
    backBtn.style.border = '2px solid #e74c3c';
    backBtn.innerHTML = `
        <h4 style="color:#ff6b6b; font-size:12px;">QUAY LẠI</h4>
        <p style="font-size:9px; color:#cbd5e1;">Về Cửa Hàng Thường</p>
        <p style="color:#e74c3c; font-size:16px; margin-top:2px;">🔙</p>
    `;
    backBtn.onclick = () => {
        updateShopTitle();
        renderShop(playerId, true);
    };
    container.appendChild(backBtn);

    // 2. Nút REROLL CHỢ LINH KIỆN (1 Linh Kiện)
    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#1a2744';
    rerollBtn.style.border = '2px solid #3b82f6';
    let canReroll = (player.components || 0) >= 1;
    rerollBtn.innerHTML = `
        <h4 style="color:#60a5fa; font-size:12px;">🔄 ĐỔI HÀNG</h4>
        <p style="font-size:9px; color:#93c5fd;">Đổi 3 nâng cấp mới</p>
        <p style="color:${canReroll ? '#00e5ff' : '#ef4444'}; font-size:11px; font-weight:bold; margin-top:2px;">-1 LINH KIỆN</p>
    `;
    rerollBtn.onclick = () => {
        if ((player.components || 0) >= 1) {
            player.components -= 1;
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
            renderInventorShop(playerId, false);
        }
    };
    container.appendChild(rerollBtn);

    // 3. Random 3 nâng cấp từ INVENTOR_SHOP (không filter danh mục)
    if (!keepItems || !player._invShopItems) {
        // Lọc ra các item còn có thể mua (chưa max, hoặc Full Evo khi đã đủ 18)
        let availablePool = INVENTOR_SHOP.filter(item => {
            let lvl = player.invUpgrades[item.id] || 0;
            if (lvl === true) lvl = 1;
            if (item.type === 'fullevo') {
                let isFullOwned = player.isFullEvoInventor || (player.invUpgrades && player.invUpgrades['inv_full_evo']);
                return !isFullOwned && maxedCount >= 18;
            }
            if (item.type === 'evo2' && !player.hasUpgrade('evo_inv_2')) return false;
            return lvl < item.maxLvl;
        });
        availablePool.sort(() => 0.5 - Math.random());
        player._invShopItems = availablePool.slice(0, 3);
    }

    const invDiscountMult = (player && typeof player.hasGear === 'function' && player.hasGear('gear_discount_g')) ? 0.70 : 1;

    player._invShopItems.forEach(item => {
        let currentLvl = player.invUpgrades[item.id] || 0;
        if (currentLvl === true) currentLvl = 1;
        let price = Math.max(1, Math.floor(item.cost * Math.pow(2, currentLvl) * invDiscountMult));

        const card = document.createElement('div');
        card.className = 'card';

        let catTag = '[BẢN THÂN]';
        let catColor = '#00f0ff';
        if (item.type === 'drone') { catTag = '[DRONE]'; catColor = '#2ecc71'; }
        else if (item.type === 'evo2') { catTag = '[EVO 2]'; catColor = '#a855f7'; }
        else if (item.type === 'fullevo') { catTag = '[TỐI THƯỢNG]'; catColor = '#f1c40f'; }

        if (item.type === 'fullevo') {
            const fullEvoCost = Math.max(1, Math.floor(15 * invDiscountMult));
            card.style.border = '2px solid gold';
            card.style.boxShadow = '0 0 14px gold';
            card.style.background = 'linear-gradient(135deg, #1e1b4b, #312e81)';
            let canAfford = (player.components || 0) >= fullEvoCost;
            card.innerHTML = `
                <span style="font-size:9px; color:gold; font-weight:bold;">${catTag}</span>
                <h4 style="color:gold; font-size:11px;">FULL EVO ⭐</h4>
                <p style="font-size:9px; color:#fef3c7;">4 Drone, 200% stats, giảm 60% CD!</p>
                <p style="color:${canAfford ? 'gold' : '#ef4444'}; font-weight:bold; font-size:12px;">${fullEvoCost} LK</p>
            `;
            card.onclick = () => {
                if ((player.components || 0) >= fullEvoCost) {
                    player.components -= fullEvoCost;
                    player.isFullEvoInventor = true;
                    player.invUpgrades['inv_full_evo'] = 1;
                    if (!player.upgrades.includes('inv_full_evo')) player.upgrades.push('inv_full_evo');
                    if (!player.upgrades.includes('evo_inv_1')) player.addUpgrade('evo_inv_1');
                    if (!player.upgrades.includes('evo_inv_2')) player.addUpgrade('evo_inv_2');
                    player.drones = [
                        new InventorDrone(player, -75, 0),
                        new InventorDrone(player, -25, 1),
                        new InventorDrone(player, 25, 2),
                        new InventorDrone(player, 75, 3)
                    ];
                    soundSystem.playPowerup();
                    if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 20, "FULL EVO UNLOCKED! 🔥", "gold", 16);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                    renderInventorShop(playerId, false);
                }
            };
        } else {
            let lvlText = item.maxLvl > 1 ? ` (Lv ${currentLvl + 1}/${item.maxLvl})` : '';
            let canAfford = (player.components || 0) >= price;
            card.style.background = '#1a252c';
            card.style.border = `2px solid ${catColor}`;

            card.innerHTML = `
                <span style="font-size:9px; color:${catColor};">${catTag}</span>
                <h4 style="color:${catColor}; font-size:11px;">${item.name}${lvlText}</h4>
                <p style="font-size:9px; color:#cbd5e1;">${item.desc}</p>
                <p style="color:${canAfford ? '#fbbf24' : '#ef4444'}; font-weight:bold; font-size:12px;">${price} LK</p>
            `;

            card.onclick = () => {
                if ((player.components || 0) >= price) {
                    player.components -= price;
                    player.invUpgrades[item.id] = (item.maxLvl > 1) ? (currentLvl + 1) : 1;
                    if (!player.upgrades.includes(item.id)) player.upgrades.push(item.id);
                    soundSystem.playPowerup();
                    if (item.id === 'inv_giap') { player.maxHp += 1; player.hp += 1; }
                    if (item.id === 'inv_tangcuong') { player.maxAmmo += 2; player.ammo += 2; }
                    if (item.id === 'inv_bodam') { player.speed *= 1.1; }
                    renderInventorShop(playerId, false);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                }
            };
        }

        container.appendChild(card);
    });

    // Hiển thị Full Evo status nếu đã sở hữu hoặc chưa đủ điều kiện (luôn hiện)
    let isFullOwned = player.isFullEvoInventor || (player.invUpgrades && player.invUpgrades['inv_full_evo']);
    if (isFullOwned) {
        const feCard = document.createElement('div');
        feCard.className = 'card sold';
        feCard.style.border = '2px solid gold';
        feCard.style.background = 'linear-gradient(135deg, #1e1b4b, #b45309)';
        feCard.innerHTML = `<h4 style="color:gold; font-size:11px;">FULL EVO ✔</h4><p style="font-size:9px; color:#fef3c7;">4 Drone tối thượng đã kích hoạt!</p>`;
        container.appendChild(feCard);
    } else if (maxedCount < 18) {
        const feCard = document.createElement('div');
        feCard.className = 'card';
        feCard.style.border = '2px dashed #f59e0b';
        feCard.style.background = 'rgba(20, 20, 30, 0.9)';
        feCard.style.opacity = '0.7';
        feCard.innerHTML = `<h4 style="color:#f59e0b; font-size:11px;">FULL EVO 🔒</h4><p style="font-size:9px; color:#cbd5e1;">Max 18 nâng cấp để mở! (${maxedCount}/18)</p>`;
        container.appendChild(feCard);
    }

    // 4. Nút SẴN SÀNG
    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid #2ecc71';
    readyBtn.style.background = '#14532d';
    readyBtn.innerHTML = `<h4 style="color:#4ade80; font-size:12px;">SẴN SÀNG</h4><p style="font-size:9px; color:#bbf7d0;">Vào trận ngay</p><p style="color:#2ecc71; font-size:16px;">✔</p>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
            onlineManager.sendLoadout(playerId);
            onlineManager.sendReady(playerId);
        }
    };
    container.appendChild(readyBtn);
}

function renderGeniusBlackMarket(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;

    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) roundTitle.innerText = `CHỢ ĐEN ROBOT (Bánh Răng: ${player.gears || 0} | LK: ${player.components || 0})`;

    if (!player.geniusUpgrades) player.geniusUpgrades = {};
    if (player.geniusPurchaseCount === undefined) player.geniusPurchaseCount = 0;

    const genDiscountMult = (player && typeof player.hasGear === 'function' && player.hasGear('gear_discount_g')) ? 0.70 : 1;
    let cost = Math.max(1, Math.floor(3 * Math.pow(2, player.geniusPurchaseCount) * genDiscountMult));

    // 1. Nút QUAY LẠI Cửa Hàng Thường
    const backBtn = document.createElement('div');
    backBtn.className = 'card';
    backBtn.style.background = '#2c3e50';
    backBtn.style.border = '2px solid #e74c3c';
    backBtn.innerHTML = `
        <h4 style="color:#ff6b6b; font-size:12px;">QUAY LẠI</h4>
        <p style="font-size:9px; color:#cbd5e1;">Về Cửa Hàng Thường</p>
        <p style="color:#e74c3c; font-size:16px; margin-top:2px;">🔙</p>
    `;
    backBtn.onclick = () => {
        updateShopTitle();
        renderShop(playerId, true);
    };
    container.appendChild(backBtn);

    // 2. Nút REROLL CHỢ ĐEN (1 Linh Kiện)
    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#3e2723';
    rerollBtn.style.border = '2px solid #d7ccc8';
    let canReroll = (player.components || 0) >= 1;
    rerollBtn.innerHTML = `
        <h4 style="color:#ffcc80; font-size:12px;">REROLL CHỢ ĐEN</h4>
        <p style="font-size:9px; color:#ffe0b2;">Đổi 3 nâng cấp mới</p>
        <p style="color:${canReroll ? '#00e5ff' : '#ef4444'}; font-size:11px; font-weight:bold; margin-top:2px;">-1 LINH KIỆN</p>
    `;
    rerollBtn.onclick = () => {
        if ((player.components || 0) >= 1) {
            player.components -= 1;
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
            renderGeniusBlackMarket(playerId, false);
        } else {
            if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 15, "CẦN 1 LINH KIỆN! 🔩", "#ff5722", 13);
        }
    };
    container.appendChild(rerollBtn);

    // 3. Chọn 3 nâng cấp ngẫu nhiên từ GENIUS_BLACK_MARKET
    if (!keepItems || !player.currentGeniusShopItems) {
        let pool = [...GENIUS_BLACK_MARKET];
        pool.sort(() => 0.5 - Math.random());
        player.currentGeniusShopItems = pool.slice(0, 3);
    }

    player.currentGeniusShopItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.border = '2px solid #ab47bc';
        card.style.background = '#1a0926';

        let currentLvl = player.geniusUpgrades[item.id] || 0;
        let lvlBadge = currentLvl > 0 ? `<span style="color:#00e676; font-size:10px;"> (Cấp ${currentLvl})</span>` : '';
        let canAfford = (player.gears || 0) >= cost;

        card.innerHTML = `
            <span style="font-size:9px; color:#ba68c8;">ROBOT MODULE</span>
            <h4 style="color:#e1bee7; font-size:11px;">${item.name}${lvlBadge}</h4>
            <p style="font-size:9px; color:#d1c4e9;">${item.desc}</p>
            <p style="color:${canAfford ? '#ff9800' : '#ef4444'}; font-weight:bold; font-size:12px;">⚙️ ${cost} Bánh Răng</p>
        `;

        card.onclick = () => {
            if ((player.gears || 0) >= cost) {
                player.gears -= cost;
                player.geniusPurchaseCount++;
                player.geniusUpgrades[item.id] = (player.geniusUpgrades[item.id] || 0) + 1;
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                renderGeniusBlackMarket(playerId, true);
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
            } else {
                if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 15, `CẦN ${cost} BÁNH RĂNG! ⚙️`, "#ff5722", 13);
            }
        };
        container.appendChild(card);
    });

    // 4. Nút SẴN SÀNG
    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid #2ecc71';
    readyBtn.style.background = '#14532d';
    readyBtn.innerHTML = `<h4 style="color:#4ade80; font-size:12px;">SẴN SÀNG</h4><p style="font-size:9px; color:#bbf7d0;">Vào trận ngay</p><p style="color:#2ecc71; font-size:16px;">✔</p>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
            onlineManager.sendLoadout(playerId);
            onlineManager.sendReady(playerId);
        }
    };
    container.appendChild(readyBtn);
}

function streakNote(p) {
    const b = p && p.lastStreakBonus;
    return b && gameState.round > 1 ? ` [+${b.bonus}$ ${b.notes.join(' + ')}]` : '';
}

function updateShopTitle() {
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        const isGuest = onlineManager.role === 'guest';
        const myCoin = isGuest ? gameState.p2Coins : gameState.p1Coins;
        const myColor = isGuest ? 'ĐỎ' : 'XANH';
        document.getElementById('roundTitleText').innerText = `CỬA HÀNG (BẠN: ${myColor} • $${myCoin})${streakNote(isGuest ? p2 : p1)}`;
        return;
    }
    document.getElementById('roundTitleText').innerText = `SHOP (Coin: P1:${gameState.p1Coins}${streakNote(p1)} - P2:${gameState.p2Coins}${streakNote(p2)})`;
}

function canPlayerReady(pid, fromRemote = false) {
    if (gameState.phase !== 'upgrade') return false;
    const player = (pid === 'p1') ? p1 : p2;
    if (!player) return false;

    // Nếu là gói READY gửi từ đối thủ qua mạng P2P thì luôn chấp nhận
    if (fromRemote) return true;

    // 1. Ở Hiệp 1: Bắt buộc phải đã chọn Body (Vũ Khí)
    if (gameState.round === 1) {
        const bodyIds = MODULES.BODY.map(m => m.id);
        const hasPickedBody = (player.upgrades || []).some(u => bodyIds.includes(u));
        if (!hasPickedBody) return false;
    }

    // 2. Ở các mốc mở G.E.A.R (R1, R2/R3 BO3, R3/R5 BO5): Bắt buộc phải đã chọn G.E.A.R của mốc đó
    if (typeof getGearMilestoneIndex === 'function') {
        const milestoneIdx = getGearMilestoneIndex(gameState.round);
        if (milestoneIdx >= 0) {
            const picked = Array.isArray(player.gearPickedMilestones) && player.gearPickedMilestones.includes(milestoneIdx);
            if (!picked) return false;
        }
    }

    // 3. Nếu trên bảng của người chơi đang còn thẻ bắt buộc phải chọn (.gear-card chưa xác nhận)
    const container = document.getElementById(`${pid}-upgrades`);
    if (container && container.querySelector('.gear-card:not(.gear-picked-confirm)')) {
        return false;
    }

    return true;
}

function handlePlayerReady(pid, fromRemote = false) {
    if (!canPlayerReady(pid, fromRemote)) {
        const container = document.getElementById(`${pid}-upgrades`);
        if (container) {
            container.querySelectorAll('.pick-card, .gear-card').forEach(c => {
                c.classList.remove('must-pick-shake');
                void c.offsetWidth;
                c.classList.add('must-pick-shake');
            });
        }
        const statusEl = document.getElementById(`${pid}-ready-status`);
        if (statusEl && !statusEl.classList.contains('is-ready')) {
            const isPickingGear = container && container.querySelector('.gear-card');
            statusEl.innerHTML = isPickingGear
                ? '⚠️ HÃY CHỌN 1 LÕI G.E.A.R TRƯỚC!'
                : '⚠️ HÃY CHỌN VŨ KHÍ & G.E.A.R TRƯỚC!';
        }
        return false;
    }

    if (pid === 'p1') gameState.p1Ready = true; else gameState.p2Ready = true;

    // Đổi màu thẻ Sẵn Sàng trên UI
    let btnUI = document.getElementById(`ready-btn-${pid}`);
    if (btnUI) {
        btnUI.style.background = '#2980b9';
        btnUI.innerHTML = '<h4>ĐANG CHỜ...</h4>';
        btnUI.onclick = null;
    }

    // Cập nhật huy hiệu trạng thái sẵn sàng trên UI
    const p1Status = document.getElementById('p1-ready-status');
    const p2Status = document.getElementById('p2-ready-status');
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        if (onlineManager.role === 'host') {
            if (p1Status && gameState.p1Ready) {
                p1Status.classList.add('is-ready');
                p1Status.innerHTML = '🔵 BẠN (P1): ĐÃ SẴN SÀNG ✔';
            }
            if (p2Status && gameState.p2Ready) {
                p2Status.classList.add('is-ready');
                p2Status.innerHTML = '🔴 ĐỐI THỦ: ĐÃ SẴN SÀNG ✔';
            }
        } else {
            if (p2Status && gameState.p2Ready) {
                p2Status.classList.add('is-ready');
                p2Status.innerHTML = '🔴 BẠN (P2): ĐÃ SẴN SÀNG ✔';
            }
            if (p1Status && gameState.p1Ready) {
                p1Status.classList.add('is-ready');
                p1Status.innerHTML = '🔵 ĐỐI THỦ: ĐÃ SẴN SÀNG ✔';
            }
        }
    } else {
        if (p1Status && gameState.p1Ready) { p1Status.classList.add('is-ready'); p1Status.innerHTML = 'P1: ĐÃ SẴN SÀNG'; }
        if (p2Status && gameState.p2Ready) { p2Status.classList.add('is-ready'); p2Status.innerHTML = 'P2: ĐÃ SẴN SÀNG'; }
    }

    if (gameState.p1Ready && gameState.p2Ready) {
        // [FIX LỖI TĂNG TỐC]: Khóa cờ ngay lập tức để không bị gọi setTimeout nhiều lần
        gameState.p1Ready = false;
        gameState.p2Ready = false;

        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
            if (onlineManager.role === 'host') {
                // Chọn map trước để gửi cho guest cùng lúc
                if (!gameState.selectedMapMode || gameState.selectedMapMode === 'random') {
                    const mapList = ['classic', 'bastion', 'artillery', 'overdrive', 'fast_shrink', 'rush_hour', 'supply_drop'];
                    gameState.currentMap = mapList[Math.floor(Math.random() * mapList.length)];
                } else {
                    gameState.currentMap = gameState.selectedMapMode;
                }
                gameState.mapPreselected = true;
                onlineManager.sendStartRound();
                setTimeout(startRound, 400);
            }
        } else {
            setTimeout(startRound, 500);
        }
    }
    return true;
}


// ==========================================
// Trang trí thẻ shop (neon-cyber): icon, nhãn giá, trạng thái mua được / thiếu tiền / đã có / khoá.
// Chạy tự động sau mỗi lần một bảng shop (kể cả bảng riêng của body) vẽ lại -> không đổi logic mua bán.
// ==========================================
const SHOP_ICON = { speed: '⚡', armor: '🛡️', damage: '⛓️', interest: '💹' };
const SHOP_LEAD_EMOJI = /^\s*((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍\p{Extended_Pictographic})*)\s*/u;
const SHOP_PRICE_RE = /\$\s?(\d+)|(-?\d+)\s*(LK|LINH KIỆN|Bánh Răng|CP)\b|^\s*(\d+)\s*(LK|CP)\s*$/i;

function shopWallet(player, playerId, unit) {
    unit = (unit || '$').toUpperCase();
    if (unit === '$') return playerId === 'p1' ? gameState.p1Coins : gameState.p2Coins;
    if (unit === 'LK' || unit === 'LINH KIỆN') return player.components || 0;
    if (unit === 'BÁNH RĂNG') return player.gears || 0;
    if (unit === 'CP') return player.cuData ? (player.cuData.cp || 0) : 0;
    return null;
}

function polishShopContainer(container) {
    if (!container || !container.firstElementChild) return;
    if (container.querySelector('.pick-card')) { container.classList.remove('shop-mode'); return; }
    container.classList.add('shop-mode');
    const playerId = container.id.startsWith('p2') ? 'p2' : 'p1';
    const player = playerId === 'p1' ? p1 : p2;
    for (const card of container.children) {
        if (!card.classList.contains('card') || card.dataset.polished) continue;
        card.dataset.polished = '1';
        card.classList.add('shop-card');
        const h4 = card.querySelector('h4');
        const title = h4 ? h4.textContent : '';
        const txt = card.textContent;
        let kind = '';
        if (card.id && card.id.startsWith('ready-btn')) kind = 'ready';
        else if (/QUAY LẠI/.test(title)) kind = 'back';
        else if (/REROLL|ĐỔI HÀNG/.test(title)) kind = 'reroll';
        if (kind) card.classList.add('shop-' + kind);
        if (card.classList.contains('sold')) card.classList.add(/🔒/.test(txt) ? 'is-locked' : (/ĐÃ MUA|✔|ĐÃ CHỌN/.test(txt) ? 'is-owned' : (/—/.test(txt) ? 'is-muted' : 'is-info')));
        else if (/🔒/.test(txt) && !/✔|★/.test(txt)) card.classList.add('is-locked');

        // Màu nhấn lấy từ viền / nền inline cũ, rồi bỏ style inline để CSS chung lo phần còn lại
        const st = card.style;
        const accent = (kind === 'ready' ? '#22c55e' : '') || (st.borderColor && st.borderColor !== 'initial' ? st.borderColor : '') ||
            (/^(#|rgb)/.test(st.backgroundColor || '') ? st.backgroundColor : '') ||
            ({ ready: '#22c55e', back: '#f87171', reroll: '#f43f5e' })[kind] ||
            (card.classList.contains('evo-card') ? '#d946ef' : '#00f0ff');
        if (st.borderStyle === 'dashed') card.classList.add('is-locked');
        card.style.cssText = '';
        card.style.setProperty('--accent', accent);

        // Icon: emoji đầu tiêu đề -> huy hiệu tròn; hoặc icon mặc định theo loại
        let icon = card.dataset.icon || '';
        if (h4) {
            const m = h4.innerHTML.match(SHOP_LEAD_EMOJI);
            if (m) { if (!icon) icon = m[1]; h4.innerHTML = h4.innerHTML.slice(m[0].length); }
        }
        const tag = card.querySelector(':scope > span');
        if (!icon && tag) icon = ({ 'DRONE': '🛸', 'BẢN THÂN': '🔧', 'EVO 2': '🧬', 'TỐI THƯỢNG': '⭐', 'ROBOT MODULE': '🤖' })[tag.textContent.replace(/[\[\]]/g, '').trim()] || '';
        if (!icon) icon = ({ ready: '✔', back: '↩', reroll: '🔄' })[kind] || (card.classList.contains('evo-card') ? '🧬' : '');
        if (icon) {
            const ico = document.createElement('div');
            ico.className = 'card-ico';
            ico.textContent = icon;
            card.insertBefore(ico, card.firstChild);
        }
        if (tag && tag !== h4) tag.classList.add('cat-tag');

        // Nhãn giá / trạng thái ở cuối thẻ
        const ps = card.querySelectorAll(':scope > p');
        const last = ps.length ? ps[ps.length - 1] : null;
        if (last && (ps.length > 1 || kind)) {
            const t = last.textContent.trim();
            const m = t.match(SHOP_PRICE_RE);
            if (m && kind !== 'back') {
                last.classList.add('price-tag');
                last.style.color = '';
                const amount = Math.abs(parseInt(m[1] || m[2] || m[4], 10));
                const unit = m[1] ? '$' : (m[3] || m[5]);
                const have = shopWallet(player, playerId, unit);
                if (have !== null && !card.classList.contains('sold')) card.classList.add(have >= amount ? 'can-buy' : 'cant-buy');
            } else if (t.length <= 40) {
                last.classList.add('status-tag');
            }
        }
    }
}

(function initShopPolish() {
    const run = () => ['p1-upgrades', 'p2-upgrades'].forEach(id => {
        const el = document.getElementById(id);
        if (!el || el._shopObs) return;
        el._shopObs = new MutationObserver(() => polishShopContainer(el));
        el._shopObs.observe(el, { childList: true });
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
