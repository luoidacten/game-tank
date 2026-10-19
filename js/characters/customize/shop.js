// ==========================================
// Tùy Biến (customize) — Bảng lắp ráp trong shop
// Chia theo nhóm (cột cuộn dọc), mỗi ô ghi rõ: đang lắp / cấp hiện tại (chấm cấp), giá CP, hiệu ứng hiện tại -> cấp kế.
// ==========================================

const CU_GROUPS = [
    ['fire', 'LỐI BẮN', 'Chọn 1 · đổi 1 CP · cấp giữ khi đổi'],
    ['bullet', 'DẠNG ĐẠN', 'Chọn 1 · đổi 1 CP · cấp giữ khi đổi'],
    ['trait', 'TÍNH CHẤT', 'Lắp nhiều · mỗi loại có cấp · chỉ 1 loại Vũng'],
    ['stat', 'CHỈ SỐ', 'Nâng mãi · tiêu CP dư'],
    ['size', 'KÍCH THƯỚC', 'Chọn 1 · đổi 1 CP'],
    ['passive', 'NỘI TẠI', 'Full Evo · chọn miễn phí'],
];

function cuInjectStyle() {
    if (document.getElementById('cu-shop-style')) return;
    const st = document.createElement('style');
    st.id = 'cu-shop-style';
    st.textContent = `
.cu-sec{flex:0 0 auto;width:160px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;gap:5px;overflow-y:auto;overflow-x:hidden;padding:2px 2px 6px;scrollbar-width:none}
.cu-sec::-webkit-scrollbar{display:none}
.player-column .card.cu-side{width:76px;height:auto;align-self:stretch;margin:4px 0}
.cu-head{position:sticky;top:0;z-index:2;background:rgba(10,14,24,.96);border-bottom:1px solid #f59e0b;padding:3px 4px 4px;font-family:Orbitron,monospace}
.cu-head b{display:block;color:#fbbf24;font-size:10.5px;letter-spacing:.6px}
.cu-head span{display:block;color:#94a3b8;font-size:8.5px;line-height:1.2}
.player-column .card.cu-opt{box-sizing:border-box;width:100%;max-width:100%;height:auto;min-height:0;flex:0 0 auto;padding:5px 6px;align-items:stretch;text-align:left;gap:2px;border-radius:9px;border-color:rgba(148,163,184,.35)}
.player-column .card.cu-opt:hover{transform:none}
.cu-opt .cu-top{display:flex;align-items:center;gap:4px;font-family:Orbitron,monospace;font-size:10px;font-weight:800;color:#f8fafc}
.cu-opt .cu-top .cu-nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cu-opt .cu-cost{flex:0 0 auto;font-size:9px;padding:1px 5px;border-radius:8px;background:#f59e0b;color:#111;font-weight:900}
.cu-opt .cu-pips{display:flex;gap:2px;margin:1px 0}
.cu-opt .cu-pips i{width:9px;height:4px;border-radius:2px;background:#334155}
.cu-opt .cu-pips i.on{background:#22d3ee;box-shadow:0 0 4px #22d3ee}
.cu-opt .cu-pips em{font-style:normal;font-size:8.5px;color:#94a3b8;margin-left:3px;line-height:4px}
.cu-opt .cu-tx{font-size:9px;color:#cbd5e1;line-height:1.25}
.cu-opt .cu-nx{font-size:9px;color:#86efac;line-height:1.25}
.cu-opt .cu-note{font-size:8.5px;color:#fda4af}
.player-column .card.cu-opt.cu-on{border:1.5px solid #22c55e;background:linear-gradient(160deg,#0f2a1c,#08150f)}
.cu-opt.cu-on .cu-cost{background:#22c55e}
.player-column .card.cu-opt.cu-maxed{border:1.5px solid #22c55e;background:linear-gradient(160deg,#0f2a1c,#08150f)!important;opacity:1}
.cu-opt.cu-maxed .cu-cost{background:#64748b;color:#fff}
.cu-opt.cu-poor{opacity:.55}
.cu-opt.cu-locked{opacity:.4;pointer-events:none;filter:grayscale(.7)}
.player-column .card.cu-opt.cu-vip{border-color:#d946ef}
.cu-opt.cu-flash{animation:cuFlash .35s}
@keyframes cuFlash{0%,100%{filter:none}50%{filter:brightness(1.8)}}
`;
    document.head.appendChild(st);
}

function cuPips(info) {
    if (info.lv === undefined) return '';
    const max = info.max || 0;
    if (!max) return `<div class="cu-pips"><em>Lv ${info.lv}</em></div>`;
    let s = '';
    for (let k = 1; k <= max; k++) s += `<i class="${k <= info.lv ? 'on' : ''}"></i>`;
    return `<div class="cu-pips">${s}<em>Lv ${info.lv}/${max}</em></div>`;
}

function cuRenderPanel(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    cuInjectStyle();
    const p = playerId === 'p1' ? p1 : p2;
    const d = cuNormalize(p);
    cuApplyVip(p);
    const fullEvo = p.hasUpgrade('evo_cu_1') && p.hasUpgrade('evo_cu_2');
    const keepScroll = container.scrollLeft;
    const secScroll = [...container.querySelectorAll('.cu-sec')].map(s => s.scrollTop);
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `TÙY BIẾN — CÒN ${d.cp} CP${cuVip(p) ? ' · VIP' : ''}`;
    const changed = () => {
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
        cuRenderPanel(playerId);
    };

    const back = document.createElement('div');
    back.className = 'card cu-side';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = `<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>${d.cp} CP</p>`;
    back.onclick = () => { updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);

    const auto = document.createElement('div');
    auto.className = 'card cu-side';
    auto.style.border = '2px solid #22d3ee';
    auto.innerHTML = `<h4 style="color:#67e8f9">⚡ TỰ LẮP</h4><p>Tiêu hết CP theo gợi ý (Nổ, Chí Mạng, Dame...)</p><p style="color:#67e8f9">${d.cp} CP</p>`;
    auto.onclick = () => { if (cuAutoSpend(p) > 0) changed(); };
    container.appendChild(auto);

    for (const [g, label, hint] of CU_GROUPS) {
        if (g === 'passive' && !fullEvo) continue;
        if (g === 'bullet' && d.fire === 'ram') continue;
        const sec = document.createElement('div');
        sec.className = 'cu-sec';
        sec.innerHTML = `<div class="cu-head"><b>${label}</b><span>${hint}</span></div>`;
        for (const part of CU_PARTS[g]) {
            const info = cuOptInfo(p, g, part.id);
            const card = document.createElement('div');
            const on = info.state === 'up' || info.state === 'on' || (info.state === 'max');
            const cls = ['card', 'cu-opt'];
            if (on && info.state !== 'max') cls.push('cu-on');
            if (info.state === 'max') cls.push('cu-maxed', 'sold');
            if (info.state === 'locked') cls.push('cu-locked');
            if (part.vip) cls.push('cu-vip');
            const can = ['buy', 'swap', 'up'].includes(info.state);
            if (can && d.cp < info.cost) cls.push('cu-poor');
            card.className = cls.join(' ');
            let badge;
            if (info.state === 'max') badge = 'MAX';
            else if (info.state === 'on') badge = g === 'passive' ? 'ĐANG CHỌN' : 'ĐANG LẮP';
            else if (info.state === 'locked') badge = '🔒 VIP';
            else if (info.state === 'pick') badge = 'CHỌN';
            else badge = `${info.state === 'up' ? '▲ ' : (info.state === 'swap' ? '⇄ ' : '+ ')}${info.cost} CP`;
            const owned = (g === 'fire' || g === 'bullet') ? d[g] === part.id : (g === 'trait' ? !!d.traits[part.id] : (g === 'stat' ? !!d.stats[part.id] : false));
            const pips = (g === 'fire' || g === 'bullet') ? (owned ? cuPips(info) : '') : (g === 'trait' || g === 'stat' ? (info.lv ? cuPips(info) : '') : '');
            const nowTx = info.now ? `<div class="cu-tx">${info.now}</div>` : '';
            const nextTx = info.next ? `<div class="cu-nx">${info.lv ? 'Lv' + (info.lv + 1) + ': ' : ''}${info.next}</div>` : '';
            const note = info.note ? `<div class="cu-note">${info.note}</div>` : '';
            const tag = (on && g !== 'passive' && g !== 'size' && info.state !== 'max') ? '✔ ' : '';
            card.innerHTML = `<div class="cu-top"><span>${part.icon || ''}</span><span class="cu-nm">${tag}${part.name}</span><span class="cu-cost">${badge}</span></div>${pips}${info.state === 'up' ? nowTx + nextTx : (g === 'stat' ? nextTx : nowTx)}${note}`;
            if (can || info.state === 'pick') {
                card.onclick = () => {
                    if (cuApplyPart(p, g, part.id)) changed();
                    else { card.classList.remove('cu-flash'); void card.offsetWidth; card.classList.add('cu-flash'); }
                };
            }
            sec.appendChild(card);
        }
        container.appendChild(sec);
    }
    container.scrollLeft = keepScroll;
    container.querySelectorAll('.cu-sec').forEach((s, i) => { if (secScroll[i]) s.scrollTop = secScroll[i]; });
}
