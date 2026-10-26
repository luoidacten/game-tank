// ==========================================
// Shop riêng theo body cho Kẻ Sáng Tạo (Xưởng Sáng Chế - Tinh Hoa ✦) và Kỹ Sư (Kho Phụ Tùng - Phụ Tùng 🔩)
// - Tiền tệ kiếm từ lối chơi của chính body: sát thương / hạ gục do vật triệu hồi, ụ súng gây ra + thưởng cuối hiệp
// - Giá theo TỪNG món (chỉ món vừa mua tăng giá), giữ suốt trận (Player tạo mới mỗi trận), đồng bộ online qua NET_LOADOUT_KEYS
// ==========================================

const BODY_SHOPS = {
    creator: {
        list: () => CREATOR_WORKSHOP, upKey: 'crUpgrades', curKey: 'crEssence', accKey: 'crEssenceAcc',
        unit: 'Tinh Hoa', sym: '✦', title: 'XƯỞNG SÁNG CHẾ', sub: 'Nâng cấp Ụ Súng, Drone & Robot', tag: 'SÁNG CHẾ',
        color: '#22d3ee', bg: '#06222e', icon: '✦',
        isSrc: b => !!(b && (b.isCreatorTurretBullet || b.isCreatorDroneBullet || b.isCreatorRobotBullet))
    },
    engineer: {
        list: () => ENGINEER_DEPOT, upKey: 'engUpgrades', curKey: 'engParts', accKey: 'engPartsAcc',
        unit: 'Phụ Tùng', sym: '🔩', title: 'KHO PHỤ TÙNG', sub: 'Nâng cấp Ụ Súng', tag: 'PHỤ TÙNG',
        color: '#facc15', bg: '#2a2105', icon: '🔩',
        isSrc: b => !!(b && b.isTurretBullet)
    }
};
const BODY_SHOP_RATE = 3;        // tiền tệ / 1 sát thương do vật triệu hồi gây ra
const BODY_SHOP_KILL_BONUS = 4;  // vật triệu hồi kết liễu đối thủ
const BODY_SHOP_PRICE_GROWTH = 1.6;

function bodyShopCfg(p) { return p ? BODY_SHOPS[p.weapon] || null : null; }

// Cấp của một nâng cấp (cr_* -> crUpgrades, eng_* -> engUpgrades)
function bodyShopLvl(p, id) {
    if (!p) return 0;
    const u = id.startsWith('cr_') ? p.crUpgrades : p.engUpgrades;
    return (u && u[id]) || 0;
}

function bodyShopItemCost(p, item) {
    const lvl = bodyShopLvl(p, item.id);
    const disc = (p && typeof p.hasGear === 'function' && p.hasGear('gear_discount_g')) ? 0.70 : 1;
    return Math.max(1, Math.round(item.cost * Math.pow(BODY_SHOP_PRICE_GROWTH, lvl) * disc));
}
function bodyShopItemMaxed(p, item) { return bodyShopLvl(p, item.id) >= (item.maxLvl || 1); }
function bodyShopItemLocked(p, item) { return !!item.needEvo && !(p.hasUpgrade && p.hasUpgrade(item.needEvo)); }

// Ghi nhận sát thương do vật triệu hồi / ụ súng gây ra lên đối thủ
function bodyShopCredit(owner, dmg, victim) {
    const cfg = bodyShopCfg(owner);
    if (!cfg || !(dmg > 0) || (typeof gameState !== 'undefined' && gameState.phase !== 'playing')) return;
    let acc = (owner[cfg.accKey] || 0) + dmg * BODY_SHOP_RATE;
    if (victim && victim.hp <= 0) {
        acc += BODY_SHOP_KILL_BONUS;
        if (typeof addFloatingText === 'function') addFloatingText(owner.x + owner.w / 2, owner.y - 28, `HẠ GỤC +${BODY_SHOP_KILL_BONUS} ${cfg.sym}`, cfg.color, 13);
    }
    const whole = Math.floor(acc);
    if (whole > 0) {
        owner[cfg.curKey] = (owner[cfg.curKey] || 0) + whole;
        acc -= whole;
    }
    owner[cfg.accKey] = acc;
}

// Gọi từ checkHits sau khi đạn trúng người chơi
function onBodyShopBulletHit(attacker, victim, b, dealt) {
    const cfg = bodyShopCfg(attacker);
    if (cfg && cfg.isSrc(b)) bodyShopCredit(attacker, dealt, victim);
}

// Thưởng cuối hiệp (thua nhận nhiều hơn để gỡ)
function bodyShopRoundIncome(winnerId) {
    [p1, p2].forEach(p => {
        const cfg = bodyShopCfg(p);
        if (!cfg) return;
        const amt = winnerId === 0 ? 2 : (winnerId === p.id ? 2 : 3);
        p[cfg.curKey] = (p[cfg.curKey] || 0) + amt;
        if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 30, `+${amt} ${cfg.sym} ${cfg.unit.toUpperCase()}`, cfg.color, 13);
    });
}

function bodyShopBuy(p, item) {
    const cfg = bodyShopCfg(p);
    if (!cfg || bodyShopItemMaxed(p, item) || bodyShopItemLocked(p, item)) return false;
    const cost = bodyShopItemCost(p, item);
    if ((p[cfg.curKey] || 0) < cost) return false;
    p[cfg.curKey] -= cost;
    if (!p[cfg.upKey]) p[cfg.upKey] = {};
    p[cfg.upKey][item.id] = (p[cfg.upKey][item.id] || 0) + 1;
    return true;
}

// Thẻ mở shop riêng trong cửa hàng thường
function bodyShopButton(player, container, playerId) {
    const cfg = bodyShopCfg(player);
    if (!cfg) return;
    const btn = document.createElement('div');
    btn.className = 'card';
    btn.dataset.icon = cfg.icon;
    btn.style.border = `2px solid ${cfg.color}`;
    btn.style.background = cfg.bg;
    btn.innerHTML = `<h4>${cfg.title}</h4><p>${cfg.sub}</p><p style="color:${cfg.color}; font-weight:bold">Đang có: ${player[cfg.curKey] || 0} ${cfg.sym}</p>`;
    btn.onclick = () => renderBodyShop(playerId);
    container.appendChild(btn);
}

function renderBodyShop(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    const player = (playerId === 'p1') ? p1 : p2;
    const cfg = bodyShopCfg(player);
    if (!container || !cfg) return;
    container.innerHTML = '';
    if (!player[cfg.upKey]) player[cfg.upKey] = {};
    const have = player[cfg.curKey] || 0;
    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) roundTitle.innerText = `${cfg.title} (${cfg.unit}: ${have} ${cfg.sym})`;

    const backBtn = document.createElement('div');
    backBtn.className = 'card';
    backBtn.style.background = '#2c3e50';
    backBtn.style.border = '2px solid #e74c3c';
    backBtn.innerHTML = `<h4 style="color:#ff6b6b; font-size:12px;">QUAY LẠI</h4><p style="font-size:9px; color:#cbd5e1;">Về Cửa Hàng Thường</p><p style="color:#e74c3c; font-size:16px; margin-top:2px;">🔙</p>`;
    backBtn.onclick = () => { updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(backBtn);

    cfg.list().forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = item.icon || cfg.icon;
        card.style.border = `2px solid ${cfg.color}`;
        card.style.background = cfg.bg;
        const lvl = bodyShopLvl(player, item.id);
        const lvlBadge = `<span style="color:#00e676; font-size:10px;"> (${lvl}/${item.maxLvl || 1})</span>`;
        const head = `<span style="font-size:9px; color:${cfg.color};">${cfg.tag}</span><h4 style="font-size:11px;">${item.name}${lvlBadge}</h4><p style="font-size:9px; color:#d1d5db;">${item.desc}</p>`;
        if (bodyShopItemMaxed(player, item)) {
            card.classList.add('sold');
            card.innerHTML = head + `<p style="color:#00e676; font-weight:bold; font-size:12px;">✔ ĐÃ MUA TỐI ĐA</p>`;
        } else if (bodyShopItemLocked(player, item)) {
            card.classList.add('sold');
            card.innerHTML = head + `<p style="color:#94a3b8; font-weight:bold; font-size:11px;">🔒 Cần Evo 2</p>`;
        } else {
            const cost = bodyShopItemCost(player, item);
            card.innerHTML = head + `<p style="font-weight:bold; font-size:12px;">${cfg.sym} ${cost} ${cfg.unit}</p>`;
            card.onclick = () => {
                if (bodyShopBuy(player, item)) {
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    renderBodyShop(playerId);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                } else if (typeof addFloatingText === 'function') {
                    addFloatingText(player.x + player.w / 2, player.y - 15, `CẦN ${cost} ${cfg.unit.toUpperCase()}! ${cfg.sym}`, '#ff5722', 13);
                }
            };
        }
        container.appendChild(card);
    });

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

// Bot: mua món có (ưu tiên / giá) cao nhất còn đủ tiền, lặp đến khi hết tiền -> nâng đều nhờ giá tăng theo từng món
function bodyShopBotBuy(player) {
    const cfg = bodyShopCfg(player);
    if (!cfg) return;
    for (let guard = 0; guard < 40; guard++) {
        const have = player[cfg.curKey] || 0;
        const cands = cfg.list().filter(it => !bodyShopItemMaxed(player, it) && !bodyShopItemLocked(player, it) && bodyShopItemCost(player, it) <= have);
        if (!cands.length) return;
        cands.sort((a, b) => (b.pri / bodyShopItemCost(player, b)) - (a.pri / bodyShopItemCost(player, a)));
        if (!bodyShopBuy(player, cands[0])) return;
    }
}
