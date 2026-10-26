// ==========================================
// Idol — CỬA HÀNG YÊU THÍCH (💗) + điều kiện Fan cho Evo trong shop thường
// ------------------------------------------
// Cuối mỗi hiệp: mỗi 1 Fan = +2💗 (logic.js roundEnd). Mở từ nút trong shop thường (shopButtons).
// Giá mỗi món ĐỘC LẬP: món nhiều Lv chỉ tăng giá CỦA CHÍNH NÓ (x2 mỗi Lv đã mua).
// ==========================================
const IDOL_FAN_SHOP = [
    { k: 'stick', name: 'Lightstick Cổ Vũ', icon: '🪄', cost: 8, max: 3, desc: lv => `Đạn Sóng Âm +0.25 Dame & nhanh +25% (Lv ${lv}/3)` },
    { k: 'guard', name: 'Bảo Vệ Thần Tượng', icon: '🛡️', cost: 12, max: 1, desc: () => 'Mỗi khi mở Buổi Trình Diễn: +1 Khiên & xoá mọi hiệu ứng xấu' },
    { k: 'ad', name: 'Hợp Đồng Quảng Cáo', icon: '📜', cost: 14, max: 1, desc: () => 'Cuối hiệp mỗi 3 Fan +$5 (tối đa +$25/hiệp)' },
    { k: 'encore', name: 'Encore!', icon: '🎤', cost: 18, max: 1, desc: () => 'Buổi Trình Diễn 15s → 20s' },
];
function idolFanItemPrice(p, it) { return it.cost * Math.pow(2, idolLv(p, it.k)); }

// Evo bị khoá trong shop thường khi chưa đủ Fan -> trả về chữ hiển thị
function idolEvoLockText(p, item) {
    const need = IDOL_EVO_FANS[item.id];
    if (!need) return null;
    const f = idolFans(p);
    if (f >= need) return null;
    return `CẦN ≥ ${need} FAN (đang có ${f})`;
}

function idolFanShopButton(p, container, playerId) {
    const d = idolData(p);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.border = '2px solid ' + IDOL_PINK;
    card.style.background = '#2a0c27';
    card.dataset.icon = '💗';
    const last = d.last ? `<br><span style="color:#fbcfe8">Hiệp trước: +${d.last.pts}💗${d.last.ad ? ` · +$${d.last.ad}` : ''}</span>` : '';
    const locks = idolEvoLocked(p).length ? `<br><span style="color:#94a3b8">🔒 EVO TẠM KHÓA (thiếu Fan)</span>` : '';
    card.innerHTML = `<h4 style="color:${IDOL_PINK}">💗 CỬA HÀNG YÊU THÍCH</h4><p>Fan: <b>${d.fans}</b> · Evo cần 6 / 12 / 18 Fan${last}${locks}</p><p style="color:#ff9de6;font-weight:bold">${d.pts}💗</p>`;
    card.onclick = () => idolRenderFanShop(playerId);
    container.appendChild(card);
}

function idolRenderFanShop(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const p = playerId === 'p1' ? p1 : p2;
    const d = idolData(p);
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `💗 CỬA HÀNG YÊU THÍCH — ${d.pts}💗 · ${d.fans} Fan`;
    const back = document.createElement('div');
    back.className = 'card';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = '<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>🔙</p>';
    back.onclick = () => { if (typeof updateShopTitle === 'function') updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);
    for (const it of IDOL_FAN_SHOP) {
        const lv = idolLv(p, it.k), maxed = lv >= it.max, price = idolFanItemPrice(p, it);
        const card = document.createElement('div');
        card.className = 'card' + (maxed ? ' sold' : '');
        card.dataset.icon = it.icon;
        card.style.border = '2px solid ' + (maxed ? '#64748b' : IDOL_PINK);
        card.innerHTML = `<h4 style="color:#ff9de6">${it.name}${it.max > 1 ? ` <span style="color:#94a3b8">(${lv}/${it.max})</span>` : ''}</h4><p>${it.desc(lv)}</p>` +
            `<p style="color:${maxed ? '#4ade80' : (d.pts >= price ? '#ff9de6' : '#ef4444')};font-weight:bold">${maxed ? '✔ ĐÃ MUA' : price + '💗'}</p>`;
        if (!maxed) card.onclick = () => {
            if (d.pts < price) return;
            d.pts -= price;
            d.lv[it.k] = lv + 1;
            if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted) soundSystem.playPowerup();
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
            idolRenderFanShop(playerId);
        };
        container.appendChild(card);
    }
    if (typeof polishShopContainer === 'function') polishShopContainer(container);
}
