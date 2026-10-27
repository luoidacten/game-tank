// ==========================================
// The Admin — ADMIN TERMINAL SHOP (mở từ thẻ trong shop thường)
// Mua Luật ($25 x2 theo tổng số Luật), ĐK ($15 x2 / Luật), KQ ($20 x2 / Luật). XÓA: hoàn 50% & giá tự lùi bậc.
// Shop đầu tiên: đổi miễn phí ĐK/KQ của Luật #1. Lên FULL EVO: tặng 1 ĐK/KQ Lớn miễn phí.
// Giao diện: hàng ngang các bảng Luật (cuộn ngang), mỗi bảng tự cuộn dọc -> dùng tốt trên điện thoại.
// ==========================================

const TAD_UI = { p1: null, p2: null };   // trạng thái giao diện (không phải dữ liệu trận)

function tadPid(p) { return p.id === 1 ? 'p1' : 'p2'; }
function tadSpend(p, n) {
    if (n <= 0) return true;
    if (tadCoins(p) < n) return false;
    if (p.id === 1) gameState.p1Coins -= n; else gameState.p2Coins -= n;
    return true;
}
function tadRefund(p, n) { n = Math.floor(n * 0.5); if (n > 0) { if (p.id === 1) gameState.p1Coins += n; else gameState.p2Coins += n; } return n; }
function tadGift(p) {
    const d = tadData(p);
    if (tadFull(p) && !d.fullGift) { d.fullGift = 1; d.freeBig = 1; }
}
function tadItemPrice(p, r, kind, id) {
    const it = kind === 'c' ? tadCond(id) : tadRes(id);
    if (it && it.tier === 3 && tadData(p).freeBig > 0) return 0;
    return kind === 'c' ? tadCondPrice(r) : tadResPrice(r);
}
function tadCanAdd(p, r, kind) { return (kind === 'c' ? r.conds.length : r.results.length) < tadMaxSlots(p); }

// ---------- Thao tác mua / xóa (dùng chung cho người & bot) ----------
function tadBuyRule(p) {
    const d = tadData(p);
    if (d.rules.length >= tadMaxRules(p)) return false;
    const price = tadRulePrice(p);
    if (!tadSpend(p, price)) return false;
    const r = tadNewRule(); r.paid = price; d.rules.push(r);
    return true;
}
function tadBuyItem(p, ri, kind, id) {
    const d = tadData(p), r = d.rules[ri], it = kind === 'c' ? tadCond(id) : tadRes(id);
    if (!r || !it || !tadTierOk(p, it.tier) || !tadCanAdd(p, r, kind)) return false;
    const arr = kind === 'c' ? r.conds : r.results;
    if (arr.indexOf(id) >= 0) return false;
    const price = tadItemPrice(p, r, kind, id);
    if (!tadSpend(p, price)) return false;
    if (it.tier === 3 && d.freeBig > 0 && price === 0) d.freeBig--;
    arr.push(id); (kind === 'c' ? r.cp : r.rp).push(price);
    return true;
}
function tadDelItem(p, ri, kind, k) {
    const r = tadData(p).rules[ri];
    if (!r) return 0;
    const arr = kind === 'c' ? r.conds : r.results, pa = kind === 'c' ? r.cp : r.rp;
    if (k < 0 || k >= arr.length) return 0;
    arr.splice(k, 1);
    return tadRefund(p, pa.splice(k, 1)[0] || 0);
}
function tadDelRule(p, ri) {
    const d = tadData(p), r = d.rules[ri];
    if (!r) return 0;
    d.rules.splice(ri, 1);
    return tadRefund(p, (r.paid || 0) + r.cp.reduce((a, b) => a + b, 0) + r.rp.reduce((a, b) => a + b, 0));
}
// Shop đầu tiên: đổi miễn phí ĐK/KQ cơ bản đang được tặng ở Luật #1
function tadSwapFree(p, kind, k, id) {
    const d = tadData(p), r = d.rules[0], it = kind === 'c' ? tadCond(id) : tadRes(id);
    if (!d.freePick || !r || !it || it.tier !== 0) return false;
    const arr = kind === 'c' ? r.conds : r.results, pa = kind === 'c' ? r.cp : r.rp;
    if ((pa[k] || 0) !== 0 || arr.indexOf(id) >= 0) return false;
    arr[k] = id;
    return true;
}

function tadAfterChange(playerId) {
    tadSfx('playPowerup');
    if (typeof updateShopTitle === 'function') updateShopTitle();
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
    tadRenderShop(playerId);
}

// ---------- Thẻ trong shop thường ----------
function tadShopButton(p, container, playerId) {
    tadGift(p);
    const d = tadData(p);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.border = '2px solid ' + TAD_GREEN;
    card.style.background = '#03150f';
    card.dataset.icon = '🖥️';
    const icons = d.rules.map(r => (r.conds.map(c => tadCond(c).ic).join('') || '∅') + '→' + (r.results.map(k => tadRes(k).ic).join('') || '∅')).join('<br>');
    const note = d.freePick ? '<br><span style="color:#fcd34d">★ Chọn lại Luật #1 miễn phí</span>' : (d.freeBig ? '<br><span style="color:#fcd34d">★ Tặng 1 ĐK/KQ Lớn</span>' : '');
    card.innerHTML = `<h4 style="color:${TAD_GREEN}">ADMIN TERMINAL</h4><p>${d.rules.length} Luật<br>${icons}${note}</p><p style="color:${TAD_GREEN};font-weight:bold">&gt;_ MỞ</p>`;
    // addEventListener (không dùng onclick): bot tự mua qua tadBotShop, không bấm thẻ này
    card.addEventListener('click', () => { TAD_UI[playerId] = null; tadRenderShop(playerId); });
    container.appendChild(card);
}

function tadBtn(label, color, onClick, disabled) {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = label;
    b.style.cssText = `display:block;width:100%;margin:4px 0;padding:6px 6px;border-radius:7px;border:1px solid ${color};background:${disabled ? 'rgba(30,41,59,0.6)' : 'rgba(2,20,16,0.85)'};color:${disabled ? '#64748b' : color};font:700 11px Arial,sans-serif;text-align:left;cursor:pointer;touch-action:manipulation;`;
    if (!disabled && onClick) b.onclick = (ev) => { ev.stopPropagation(); onClick(); };
    return b;
}

function tadPanel(accent) {
    const el = document.createElement('div');
    el.className = 'tad-rule';
    el.style.cssText = `flex:0 0 212px;width:212px;height:100%;max-height:100%;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-y;` +
        `padding:8px;border:2px solid ${accent};border-radius:12px;background:linear-gradient(180deg,rgba(3,26,20,0.95),rgba(2,8,14,0.95));box-shadow:0 0 12px ${accent}55 inset;color:#d1fae5;font:11px Arial,sans-serif;scroll-snap-align:start;`;
    return el;
}

function tadRenderShop(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const p = playerId === 'p1' ? p1 : p2;
    tadGift(p);
    const d = tadData(p), coins = tadCoins(p), ui = TAD_UI[playerId];
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `🖥️ ADMIN TERMINAL — $${coins} · ${d.rules.length}/${isFinite(tadMaxRules(p)) ? tadMaxRules(p) : '∞'} Luật`;
    const back = document.createElement('div');
    back.className = 'card';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = '<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>🔙</p>';
    back.onclick = () => { TAD_UI[playerId] = null; if (typeof updateShopTitle === 'function') updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);
    const slots = tadMaxSlots(p), slotTxt = isFinite(slots) ? slots : '∞';

    d.rules.forEach((r, ri) => {
        const el = tadPanel(ui && ui.ri === ri ? TAD_GOLD : TAD_GREEN);
        container.appendChild(el);
        if (ui && ui.ri === ri) { tadRenderPicker(el, p, playerId, r, ri, ui); return; }
        const mult = tadPow(r);
        el.innerHTML = `<div style="font:900 13px 'Orbitron',Arial;color:${TAD_GREEN};letter-spacing:1px">RULE #${ri + 1}</div>` +
            `<div style="color:#94a3b8;font-size:10px;margin-bottom:4px">Hiệu lực KQ ×${mult.toFixed(2)}</div>` +
            `<div style="color:${TAD_CYAN};font-weight:700">IF (bất kỳ) · ${r.conds.length}/${slotTxt}</div>`;
        r.conds.forEach((c, k) => {
            const it = tadCond(c), free = d.freePick && ri === 0 && !(r.cp[k] > 0);
            el.appendChild(tadBtn(`${it.ic} ${it.n}<br><span style="font-weight:400;color:#94a3b8">${it.d}</span><br>` +
                (free ? '<span style="color:#fcd34d">★ đổi miễn phí</span>' : `<span style="color:#f87171">✕ XÓA +$${Math.floor((r.cp[k] || 0) / 2)}</span>`), TAD_CYAN,
                () => { if (free) TAD_UI[playerId] = { ri, kind: 'c', swap: k }; else tadDelItem(p, ri, 'c', k); tadAfterChange(playerId); }));
        });
        if (tadCanAdd(p, r, 'c')) { const pr = tadCondPrice(r); el.appendChild(tadBtn(`+ THÊM ĐIỀU KIỆN · $${pr}`, coins >= pr || d.freeBig ? TAD_GREEN : '#ef4444', () => { TAD_UI[playerId] = { ri, kind: 'c', swap: -1 }; tadRenderShop(playerId); })); }
        else el.appendChild(tadBtn('ĐK: ĐẠT GIỚI HẠN (Evo mở thêm)', '#64748b', null, true));
        el.insertAdjacentHTML('beforeend', `<div style="color:${TAD_GOLD};font-weight:700;margin-top:6px">THEN (đồng loạt) · ${r.results.length}/${slotTxt}</div>`);
        r.results.forEach((c, k) => {
            const it = tadRes(c), free = d.freePick && ri === 0 && !(r.rp[k] > 0);
            el.appendChild(tadBtn(`${it.ic} ${it.n}<br><span style="font-weight:400;color:#94a3b8">${it.d}</span><br>` +
                (free ? '<span style="color:#fcd34d">★ đổi miễn phí</span>' : `<span style="color:#f87171">✕ XÓA +$${Math.floor((r.rp[k] || 0) / 2)}</span>`), TAD_GOLD,
                () => { if (free) TAD_UI[playerId] = { ri, kind: 'r', swap: k }; else tadDelItem(p, ri, 'r', k); tadAfterChange(playerId); }));
        });
        if (tadCanAdd(p, r, 'r')) { const pr = tadResPrice(r); el.appendChild(tadBtn(`+ THÊM KẾT QUẢ · $${pr}`, coins >= pr || d.freeBig ? TAD_GREEN : '#ef4444', () => { TAD_UI[playerId] = { ri, kind: 'r', swap: -1 }; tadRenderShop(playerId); })); }
        else el.appendChild(tadBtn('KQ: ĐẠT GIỚI HẠN (Evo mở thêm)', '#64748b', null, true));
        const refund = Math.floor(((r.paid || 0) + r.cp.reduce((a, b) => a + b, 0) + r.rp.reduce((a, b) => a + b, 0)) / 2);
        el.appendChild(tadBtn(`🗑 XÓA LUẬT #${ri + 1} · hoàn $${refund}`, '#f87171', () => { tadDelRule(p, ri); tadAfterChange(playerId); }));
    });

    const add = tadPanel(TAD_GREEN);
    const canRule = d.rules.length < tadMaxRules(p), rp = tadRulePrice(p);
    add.innerHTML = `<div style="font:900 13px 'Orbitron',Arial;color:${TAD_GREEN}">+ NEW RULE</div><div style="color:#94a3b8;font-size:10px;margin:4px 0">Mỗi Luật: ĐK nào nổ cũng chạy mọi KQ. Từ ĐK thứ 2: +15% hiệu lực.<br>Giới hạn: ${isFinite(tadMaxRules(p)) ? tadMaxRules(p) : '∞'} Luật, ${slotTxt} ĐK + ${slotTxt} KQ / Luật.</div>`;
    add.appendChild(canRule ? tadBtn(`MUA LUẬT #${d.rules.length + 1} · $${rp}`, coins >= rp ? TAD_GREEN : '#ef4444', () => { if (tadBuyRule(p)) tadAfterChange(playerId); })
        : tadBtn('ĐẠT GIỚI HẠN LUẬT (Evo 2: 5, FULL: ∞)', '#64748b', null, true));
    container.appendChild(add);
    if (typeof polishShopContainer === 'function') polishShopContainer(container);
}

function tadRenderPicker(el, p, playerId, r, ri, ui) {
    const d = tadData(p), coins = tadCoins(p), list = ui.kind === 'c' ? TAD_CONDS : TAD_RES, have = ui.kind === 'c' ? r.conds : r.results;
    const swap = ui.swap >= 0;
    el.innerHTML = `<div style="font:900 12px 'Orbitron',Arial;color:${TAD_GOLD}">RULE #${ri + 1} · ${swap ? 'ĐỔI MIỄN PHÍ' : (ui.kind === 'c' ? 'CHỌN ĐIỀU KIỆN' : 'CHỌN KẾT QUẢ')}</div>`;
    el.appendChild(tadBtn('↩ HỦY', '#f87171', () => { TAD_UI[playerId] = null; tadRenderShop(playerId); }));
    for (const it of list) {
        if (have.indexOf(it.id) >= 0) continue;
        if (swap && it.tier !== 0) continue;
        const locked = !tadTierOk(p, it.tier), price = swap ? 0 : tadItemPrice(p, r, ui.kind, it.id), poor = coins < price;
        const tag = it.tier === 3 ? ' <span style="color:#fcd34d">[LỚN]</span>' : (it.tier === 2 ? ' <span style="color:#a78bfa">[EVO 2]</span>' : '');
        const foot = locked ? `🔒 ${it.tier === 3 ? 'FULL EVO' : 'EVO 2'}` : (price === 0 ? '<span style="color:#4ade80">MIỄN PHÍ</span>' : `<span style="color:${poor ? '#ef4444' : TAD_GREEN}">$${price}</span>`);
        el.appendChild(tadBtn(`${String(it.id).padStart(2, '0')} ${it.ic} ${it.n}${tag}<br><span style="font-weight:400;color:#94a3b8">${it.d}</span><br>${foot}`,
            ui.kind === 'c' ? TAD_CYAN : TAD_GOLD,
            () => {
                const ok = swap ? tadSwapFree(p, ui.kind, ui.swap, it.id) : tadBuyItem(p, ri, ui.kind, it.id);
                if (ok) { TAD_UI[playerId] = null; tadAfterChange(playerId); }
            }, locked || poor));
    }
}

// ---------- Bot: tự lập trình theo ưu tiên ----------
const TAD_BOT_C = [19, 20, 2, 1, 6, 15, 11, 13, 18, 3, 4, 12, 10, 7, 9, 5, 8, 14, 16, 17, 21];
const TAD_BOT_R = [17, 19, 5, 13, 1, 16, 9, 3, 12, 2, 14, 18, 4, 6, 7, 8, 10, 11, 15];
function tadBotShop(p) {
    tadGift(p);
    const d = tadData(p);
    const evoLeft = (EVOLUTIONS.the_admin || []).some(e => !p.hasUpgrade(e.id) && (typeof evoShopAvailable !== 'function' || evoShopAvailable(p, e)));
    const floor = evoLeft ? Math.floor(tadCoins(p) * 0.55) : 0;   // để dành tiền cho Evo
    const pick = (order, r, kind) => order.find(id => { const it = kind === 'c' ? tadCond(id) : tadRes(id); return tadTierOk(p, it.tier) && (kind === 'c' ? r.conds : r.results).indexOf(id) < 0; });
    for (let guard = 0; guard < 24; guard++) {
        const opts = [];
        d.rules.forEach((r, ri) => {
            if (tadCanAdd(p, r, 'r')) { const id = pick(TAD_BOT_R, r, 'r'); if (id) opts.push({ pri: r.results.length ? 1 : 4, cost: tadItemPrice(p, r, 'r', id), go: () => tadBuyItem(p, ri, 'r', id) }); }
            if (tadCanAdd(p, r, 'c')) { const id = pick(TAD_BOT_C, r, 'c'); if (id) opts.push({ pri: r.conds.length ? 1.2 : 4, cost: tadItemPrice(p, r, 'c', id), go: () => tadBuyItem(p, ri, 'c', id) }); }
        });
        if (d.rules.length < tadMaxRules(p)) opts.push({ pri: 2, cost: tadRulePrice(p), need: tadRulePrice(p) + 35, go: () => tadBuyRule(p) });
        const ok = opts.filter(o => (o.need || o.cost) <= tadCoins(p) - floor || o.cost === 0).sort((a, b) => b.pri / Math.max(5, b.cost) - a.pri / Math.max(5, a.cost));
        if (!ok.length || !ok[0].go()) break;
    }
}
