// ==========================================
// HƯỚNG DẪN TƯỚNG — modal trực quan, ngắn gọn (mở từ nút "📖 HƯỚNG DẪN" trên thẻ chọn Body)
// Dữ liệu: BODY_GUIDES (js/data/body-guides.js); thiếu entry -> tự sinh từ desc
// ==========================================

// --- Tự sinh hướng dẫn từ desc khi body chưa có entry ---
function autoBodyGuide(mod) {
    const desc = String((mod && mod.desc) || '').replace(/^"[^"]*"\s*/, '');
    const parts = desc.split(/\s*\|\s*|\.\s+|\.$/).map(s => s.trim()).filter(Boolean);
    const isStat = s => /^(HP|Dame|Đạn|Tốc|Nhịp)\b|^HP\s*:?\s*\d/i.test(s);
    const short = (s, n) => { const w = s.split(/\s+/); return w.length > n ? w.slice(0, n).join(' ') + '…' : s; };
    const controls = [], passive = [];
    parts.forEach(s => {
        if (isStat(s)) return;
        const hold = s.match(/Giữ[^0-9.]{0,12}([0-9]+(?:\.[0-9]+)?)\s*s/i);
        if (hold) {
            const rest = s.replace(/^.*?s\s*[:\-–]?\s*/, '');
            const nm = rest.split(/[(:,.\-–]/)[0].trim().split(/\s+/).slice(0, 3).join(' ') || 'Giữ';
            controls.push({ input: 'HOLD ' + hold[1] + 's', name: nm.charAt(0).toUpperCase() + nm.slice(1), what: short(rest, 12) });
        } else if (/^(Nhấp đúp|Chạm đúp)/i.test(s)) {
            controls.push({ input: 'TAP x2', name: 'Nhấp đúp', what: short(s.replace(/^[^:]*:\s*/, ''), 12) });
        } else if (/^(Nhấp|Bấm|Nhấn)/i.test(s)) {
            controls.push({ input: 'TAP', name: 'Nhấp', what: short(s.replace(/^[^:]*:\s*/, ''), 12) });
        } else if (/^Giữ/i.test(s)) {
            controls.push({ input: 'HOLD', name: 'Giữ', what: short(s.replace(/^Giữ\s*[:]?\s*/i, ''), 12) });
        } else if (passive.length < 2) passive.push(short(s, 12));
    });
    if (!controls.length) controls.push({ input: 'TAP', name: 'Bắn', what: 'Nhấp nút Bắn để tấn công' });
    const ev = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[mod.id]) || [];
    const evoTxt = e => e ? short(e.name + ': ' + e.desc, 10) : '—';
    return {
        tag: short(passive[0] || mod.name, 8), diff: 3, controls: controls.slice(0, 4),
        passive: passive.slice(0, 2), evo: { e1: evoTxt(ev[0]), e2: evoTxt(ev[1]), full: 'Sở hữu cả 2 Evo' }, tips: [],
        auto: true
    };
}

function getBodyGuide(id) {
    const mod = (MODULES.BODY || []).find(m => m.id === id);
    if (!mod) return null;
    const g = (typeof BODY_GUIDES !== 'undefined' && BODY_GUIDES[id]) || autoBodyGuide(mod);
    return { mod, g };
}

// Số giây của 1 thao tác giữ ('HOLD 0.5s' -> 0.5, 'HOLD <1.75s' -> 0 (nhả sớm), 'HOLD' -> null)
function guideHoldSec(input) {
    if (!/^HOLD/i.test(input)) return null;
    if (/</.test(input)) return 0;
    const m = input.match(/([0-9]+(?:\.[0-9]+)?)\s*s/);
    return m ? parseFloat(m[1]) : null;
}

// --- Vẽ art xe lên canvas nhỏ (mượn ctx chính rồi trả nguyên trạng, đồng bộ nên không nháy) ---
let _guideBackup = null;
function drawGuideArt(cv, id, evo, team) {
    const out = cv.getContext('2d');
    const S = cv.width;
    out.clearRect(0, 0, S, S);
    const mod = (MODULES.BODY || []).find(m => m.id === id);
    const mainCv = (typeof ctx !== 'undefined' && ctx) ? ctx.canvas : null;
    if (!mainCv || mainCv.width < S || mainCv.height < S || typeof TANK_ART === 'undefined' || !TANK_ART[id]) {
        // Không có art: khối màu đơn giản
        out.fillStyle = team === 2 ? '#e74c3c' : '#3498db';
        out.beginPath(); out.roundRect ? out.roundRect(S * 0.2, S * 0.2, S * 0.6, S * 0.6, S * 0.1) : out.rect(S * 0.2, S * 0.2, S * 0.6, S * 0.6); out.fill();
        return;
    }
    const main = mainCv;
    if (!_guideBackup) _guideBackup = document.createElement('canvas');
    _guideBackup.width = S; _guideBackup.height = S;
    const bk = _guideBackup.getContext('2d');
    bk.clearRect(0, 0, S, S);
    bk.drawImage(main, 0, 0, S, S, 0, 0, S, S);
    ctx.save();
    try {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, S, S);
        const fp = (typeof Player === 'function') ? new Player(team || 1, team === 2 ? '#e74c3c' : '#3498db') : { id: 1, upgrades: [], hasUpgrade(u) { return this.upgrades.includes(u); } };
        const list = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[id]) || [];
        fp.weapon = id;
        fp.upgrades = [id];
        if (evo >= 1 && list[0]) fp.upgrades.push(list[0].id);
        if (evo >= 2 && list[1]) fp.upgrades.push(list[1].id);
        if (evo >= 3) list.forEach(e => { if (!fp.upgrades.includes(e.id)) fp.upgrades.push(e.id); });
        fp.w = fp.h = 32; fp.x = 0; fp.y = 0;
        fp.hp = fp.maxHp = (mod && mod.stats && mod.stats.hp) || 5;
        fp.ammo = fp.maxAmmo = (mod && mod.stats && mod.stats.ammo) || 3;
        const sc = S / 32 * 0.78;
        ctx.translate(S / 2, S / 2);
        // Xe P2 tự lật dọc khi vẽ -> lật lại để nòng luôn hướng "lên" so với người xem thẻ (cột P2 đã xoay 180°)
        if (fp.id === 2) ctx.scale(1, -1);
        ctx.scale(sc, sc);
        ctx.translate(-16, -16);
        drawTankArt(fp, fp.color);
    } catch (e) { /* bỏ qua lỗi vẽ */ }
    ctx.restore();
    out.drawImage(main, 0, 0, S, S, 0, 0, S, S);
    // Trả lại vùng của canvas chính
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(_guideBackup, 0, 0);
    ctx.restore();
}

// --- CSS (chèn 1 lần) ---
function ensureGuideCss() {
    if (document.getElementById('bodyGuideCss')) return;
    const st = document.createElement('style');
    st.id = 'bodyGuideCss';
    st.textContent = `
.bg-guide-btn{display:block;width:100%;margin:4px 0 2px;padding:5px 4px;font-size:11px;font-weight:800;letter-spacing:.5px;color:#e0f2fe;background:linear-gradient(90deg,rgba(14,165,233,.35),rgba(168,85,247,.35));border:1px solid #38bdf8;border-radius:8px;cursor:pointer;box-shadow:0 0 8px rgba(56,189,248,.35)}
.bg-guide-btn:active{transform:scale(.97)}
#bodyGuideModal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.78);backdrop-filter:blur(3px);padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));box-sizing:border-box;touch-action:manipulation}
#bodyGuideModal .bg-box{position:relative;width:100%;max-width:400px;max-height:92vh;max-height:calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;background:linear-gradient(180deg,#0f172a,#111827 60%,#0b1020);border:1.5px solid #38bdf8;border-radius:16px;box-shadow:0 0 24px rgba(56,189,248,.45),inset 0 0 18px rgba(168,85,247,.15);color:#e2e8f0;padding:12px 12px 14px;box-sizing:border-box;font-family:inherit;text-align:left}
#bodyGuideModal .bg-x{position:sticky;float:right;top:0;margin:-6px -6px 0 0;z-index:3;width:44px;height:44px;border-radius:50%;border:1px solid #475569;background:#1e293b;color:#f8fafc;font-size:16px;cursor:pointer;line-height:42px;padding:0;touch-action:manipulation}
.bg-head{display:flex;gap:10px;align-items:center}
.bg-art{flex:0 0 auto;width:92px;height:92px;border-radius:14px;background:radial-gradient(circle at 50% 45%,rgba(56,189,248,.25),rgba(15,23,42,.9) 70%);border:1px solid rgba(56,189,248,.45)}
.bg-name{font-size:19px;font-weight:900;color:#fff;text-shadow:0 0 8px rgba(56,189,248,.8);line-height:1.15}
.bg-tag{font-size:12.5px;color:#7dd3fc;margin:2px 0 3px;font-weight:600}
.bg-stars{font-size:13px;color:#facc15;letter-spacing:1px}
.bg-stars small{color:#94a3b8;font-size:10px;letter-spacing:0;margin-left:4px}
.bg-head .role-badges{justify-content:flex-start;margin:3px 0 0}
.bg-stats{display:flex;gap:5px;margin:8px 0 2px;flex-wrap:wrap}
.bg-stat{flex:1 1 0;min-width:60px;text-align:center;font-size:11px;background:rgba(30,41,59,.85);border:1px solid #334155;border-radius:8px;padding:3px 2px;color:#cbd5e1}
.bg-stat b{display:block;font-size:14px;color:#fff}
.bg-sec{margin-top:10px}
.bg-sec h5{margin:0 0 5px;font-size:11.5px;letter-spacing:1.5px;color:#a5b4fc;font-weight:900}
.bg-ctl{display:flex;align-items:center;gap:8px;background:rgba(30,41,59,.7);border:1px solid #334155;border-radius:10px;padding:6px 7px;margin-bottom:5px}
.bg-chip{flex:0 0 auto;min-width:74px;text-align:center;border-radius:8px;padding:4px 5px;font-size:11px;font-weight:900;color:#fff;line-height:1.15}
.bg-chip .ic{font-size:16px;display:block}
.bg-chip.tap{background:linear-gradient(180deg,#0ea5e9,#0369a1);box-shadow:0 0 8px rgba(14,165,233,.5)}
.bg-chip.dbl{background:linear-gradient(180deg,#a855f7,#6b21a8);box-shadow:0 0 8px rgba(168,85,247,.5)}
.bg-chip.hold{background:linear-gradient(180deg,#f59e0b,#b45309);box-shadow:0 0 8px rgba(245,158,11,.5)}
.bg-chip.auto{background:linear-gradient(180deg,#22c55e,#15803d);box-shadow:0 0 8px rgba(34,197,94,.45)}
.bg-chip.dir{background:linear-gradient(180deg,#ec4899,#9d174d);box-shadow:0 0 8px rgba(236,72,153,.45)}
.bg-fill{height:5px;margin-top:3px;border-radius:3px;background:rgba(0,0,0,.45);overflow:hidden}
.bg-fill i{display:block;height:100%;width:0;background:#fff7ae;border-radius:3px;animation:bgFill var(--d) linear infinite}
@keyframes bgFill{0%{width:0}85%{width:100%}100%{width:100%}}
.bg-ctl .bg-txt{flex:1;min-width:0;font-size:12px;color:#cbd5e1;line-height:1.3}
.bg-ctl .bg-txt b{color:#fff;font-size:13px;display:block}
.bg-tl{position:relative;height:58px;margin:4px 6px 2px;}
.bg-tl .bar{position:absolute;left:0;right:0;top:22px;height:6px;border-radius:3px;background:linear-gradient(90deg,#334155,#f59e0b)}
.bg-tl .cur{position:absolute;top:18px;z-index:1;width:3px;height:14px;background:#fff;border-radius:2px;box-shadow:0 0 6px #fff;animation:bgCur var(--d) linear infinite}
@keyframes bgCur{0%{left:0}90%{left:100%}100%{left:100%}}
.bg-tl .mk{position:absolute;top:-2px;width:96px;text-align:center;font-size:9.5px;color:#fde68a;font-weight:800;line-height:1.15}
.bg-tl .mk.lo{top:32px}
.bg-tl .dot{position:absolute;top:19px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#fbbf24;border:2px solid #0f172a;box-shadow:0 0 6px #fbbf24;box-sizing:border-box}
#bodyGuideModal.flip .bg-box{transform:rotate(180deg)}
.bg-tl .mk span{display:block;color:#94a3b8;font-weight:600}
.bg-pas{background:linear-gradient(90deg,rgba(34,197,94,.14),rgba(30,41,59,.6));border:1px solid rgba(34,197,94,.45);border-radius:10px;padding:6px 9px;font-size:12px;line-height:1.4}
.bg-pas div:before{content:'✦ ';color:#4ade80}
.bg-evo{display:flex;gap:5px}
.bg-ev{flex:1 1 0;min-width:0;background:rgba(30,41,59,.75);border:1px solid #475569;border-radius:10px;padding:4px 4px 6px;text-align:center;font-size:10.5px;line-height:1.3;color:#cbd5e1}
.bg-ev canvas{width:44px;height:44px;display:block;margin:0 auto}
.bg-ev b{display:block;font-size:10.5px;color:#fff;margin-bottom:1px}
.bg-ev.full{border-color:#facc15;box-shadow:0 0 10px rgba(250,204,21,.35)}
.bg-ev.full b{color:#fde047}
.bg-tips{font-size:12px;line-height:1.4;color:#fef3c7}
.bg-tips div:before{content:'💡 '}
.bg-desc{font-size:12.5px;line-height:1.45;color:#cbd5e1;background:rgba(30,41,59,.6);border:1px solid #334155;border-radius:10px;padding:7px 9px}
.bg-desc .bg-collab{margin-top:5px;color:#ffd166;font-weight:700}
.bg-auto{font-size:10px;color:#64748b;margin-top:8px;text-align:center}
`;
    document.head.appendChild(st);
}

function closeBodyGuide() {
    const m = document.getElementById('bodyGuideModal');
    if (m) m.remove();
    document.removeEventListener('keydown', guideEscKey);
    if (window._bodyGuideRaf) { cancelAnimationFrame(window._bodyGuideRaf); window._bodyGuideRaf = 0; }
}

function guideEscKey(e) { if (e.key === 'Escape') closeBodyGuide(); }
function guideEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function openBodyGuide(id, team, flip) {
    const data = getBodyGuide(id);
    if (!data) return;
    ensureGuideCss();
    closeBodyGuide();
    const { mod, g } = data;
    const evoList = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[id]) || [];
    const diff = Math.max(1, Math.min(5, g.diff || 3));
    const DIFF_TXT = ['', 'Rất dễ', 'Dễ', 'Vừa', 'Khó', 'Rất khó'];
    const st = mod.stats || {};

    // Thao tác giữ có số giây -> mốc trên timeline
    const holds = g.controls.map(c => ({ c, sec: guideHoldSec(c.input) })).filter(h => h.sec != null);
    const maxHold = Math.max(1, ...holds.map(h => h.sec));
    const ctlHtml = g.controls.map(c => {
        const inp = String(c.input || 'TAP');
        let cls = 'tap', ic = '👆', label = inp;
        if (/x2|ĐÚP|DOUBLE/i.test(inp)) { cls = 'dbl'; ic = '✌️'; label = 'TAP x2'; }
        else if (/^HOLD/i.test(inp)) { cls = 'hold'; ic = '✋'; label = inp.replace(/^HOLD\s*/i, '') ? 'HOLD ' + inp.replace(/^HOLD\s*/i, '') : 'GIỮ'; }
        else if (/^AUTO/i.test(inp)) { cls = 'auto'; ic = '⚙️'; label = 'TỰ ĐỘNG'; }
        else if (/←|→/.test(inp)) { cls = 'dir'; ic = '↔️'; label = '← / →'; }
        else if (/lại/i.test(inp)) { ic = '👆👆'; label = 'TAP LẦN 2'; }
        const sec = guideHoldSec(inp);
        const fill = sec ? `<div class="bg-fill"><i style="--d:${Math.max(0.6, sec * 1.15).toFixed(2)}s"></i></div>` : '';
        return `<div class="bg-ctl"><div class="bg-chip ${cls}"><span class="ic">${ic}</span>${guideEsc(label)}${fill}</div><div class="bg-txt"><b>${guideEsc(c.name)}</b>${guideEsc(c.what)}</div></div>`;
    }).join('');

    let tlHtml = '';
    if (holds.length >= 2) {
        const total = maxHold * 1.12;
        const marks = holds.slice().sort((a, b) => a.sec - b.sec).map((h, i) => {
            const pct = Math.min(100, h.sec / total * 100);
            const lbl = `left:clamp(0px, calc(${pct.toFixed(1)}% - 48px), calc(100% - 96px))`;
            return `<div class="dot" style="left:${pct.toFixed(1)}%"></div><div class="mk${i % 2 ? ' lo' : ''}" style="${lbl}">${guideEsc(h.c.name)}<span>${h.sec ? h.sec + 's' : 'nhả sớm'}</span></div>`;
        }).join('');
        tlHtml = `<div class="bg-sec"><h5>⏱ MỐC GIỮ NÚT</h5><div class="bg-tl" style="--d:${(total + 0.4).toFixed(2)}s"><div class="bar"></div>${marks}<div class="cur" style="--d:${(total + 0.4).toFixed(2)}s"></div></div></div>`;
    }

    const evoNames = [evoList[0] ? evoList[0].name : 'Evo 1', evoList[1] ? evoList[1].name : 'Evo 2', '★ FULL EVO'];
    const evoTxt = [g.evo && g.evo.e1, g.evo && g.evo.e2, g.evo && g.evo.full];
    const evoHtml = evoNames.map((n, i) => `<div class="bg-ev${i === 2 ? ' full' : ''}"><canvas width="88" height="88" data-evo="${i + 1}"></canvas><b>${i < 2 ? 'EVO ' + (i + 1) + ' · ' + guideEsc(n) : '★ FULL EVO'}</b>${guideEsc(evoTxt[i] || '—')}</div>`).join('');

    const statHtml = `<div class="bg-stats"><div class="bg-stat">❤️ HP<b>${st.hp != null ? st.hp : '?'}</b></div><div class="bg-stat">💥 Dame<b>${st.dmg != null ? st.dmg : '?'}</b></div><div class="bg-stat">🔫 Đạn<b>${st.ammo == null ? '?' : (st.ammo >= 999 ? '∞' : (st.ammo === 0 ? '—' : st.ammo))}</b></div></div>`;

    const wrap = document.createElement('div');
    wrap.id = 'bodyGuideModal';
    if (flip) wrap.classList.add('flip');
    wrap.innerHTML = `<div class="bg-box" role="dialog" aria-label="Hướng dẫn ${guideEsc(mod.name)}">
        <button type="button" class="bg-x" aria-label="Đóng">✕</button>
        <div class="bg-head"><canvas class="bg-art" width="184" height="184"></canvas>
          <div style="min-width:0"><div class="bg-name">${guideEsc(mod.name)}</div><div class="bg-tag">${guideEsc(g.tag)}</div>
          <div class="bg-stars">${'★'.repeat(diff)}<span style="color:#475569">${'★'.repeat(5 - diff)}</span><small>${DIFF_TXT[diff]}</small></div>
          ${typeof roleBadges === 'function' ? roleBadges(mod) : ''}</div></div>
        ${statHtml}
        <div class="bg-sec"><h5>🎮 ĐIỀU KHIỂN</h5>${ctlHtml}</div>
        ${tlHtml}
        ${g.passive && g.passive.length ? `<div class="bg-sec"><h5>✨ NỘI TẠI</h5><div class="bg-pas">${g.passive.map(p => `<div>${guideEsc(p)}</div>`).join('')}</div></div>` : ''}
        <div class="bg-sec"><h5>⬆ TIẾN HÓA</h5><div class="bg-evo">${evoHtml}</div></div>
        ${g.tips && g.tips.length ? `<div class="bg-sec"><h5>MẸO</h5><div class="bg-tips">${g.tips.map(t => `<div>${guideEsc(t)}</div>`).join('')}</div></div>` : ''}
        <div class="bg-sec"><h5>📜 MÔ TẢ ĐẦY ĐỦ</h5><div class="bg-desc">${guideEsc(mod.desc)}${typeof collabBonusOf === 'function' && collabBonusOf(id) ? `<div class="bg-collab">★ Tướng COLLAB: đối thủ được bù +$${collabBonusOf(id)} đầu trận</div>` : ''}${typeof GAMBLER_BODIES !== 'undefined' && GAMBLER_BODIES.includes(id) ? '<div class="bg-collab">🎲 Cờ Bạc: Reroll đầu tiên mỗi hiệp miễn phí, +1 ô lựa chọn shop &amp; G.E.A.R</div>' : ''}</div></div>
        ${g.auto ? '<div class="bg-auto">(tự tóm tắt từ mô tả)</div>' : ''}
    </div>`;
    const stop = e => e.stopPropagation();
    wrap.addEventListener('click', e => { if (e.target === wrap) closeBodyGuide(); });
    wrap.querySelector('.bg-box').addEventListener('click', stop);
    wrap.querySelector('.bg-x').addEventListener('click', e => { e.stopPropagation(); closeBodyGuide(); });
    document.body.appendChild(wrap);
    document.addEventListener('keydown', guideEscKey);

    const tm = team === 2 ? 2 : 1;
    wrap.querySelectorAll('.bg-ev canvas').forEach(cv => drawGuideArt(cv, id, +cv.dataset.evo, tm));
    const big = wrap.querySelector('.bg-art');
    drawGuideArt(big, id, 0, tm);
    // Art lớn chuyển động nhẹ (art dùng thời gian thực) — ~15 fps cho nhẹ máy
    let last = 0;
    const loop = ts => {
        if (!document.getElementById('bodyGuideModal')) return;
        if (ts - last > 66) { last = ts; drawGuideArt(big, id, 0, tm); }
        window._bodyGuideRaf = requestAnimationFrame(loop);
    };
    window._bodyGuideRaf = requestAnimationFrame(loop);
}

// Nút mở hướng dẫn cho thẻ chọn Body (dùng ở shop-ui.js)
function makeBodyGuideButton(id, team) {
    ensureGuideCss();
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bg-guide-btn';
    b.textContent = '📖 HƯỚNG DẪN';
    b.onclick = e => {
        e.stopPropagation(); e.preventDefault();
        // Khung chọn đang bị xoay 180° (P2 ngồi đối diện) -> lật modal theo
        let flip = false;
        for (let el = b; el && el !== document.body; el = el.parentElement) {
            const t = getComputedStyle(el).transform;
            if (t && t.startsWith('matrix(-1')) flip = !flip;
        }
        openBodyGuide(id, team, flip);
    };
    return b;
}

// ==========================================
// CẨM NANG TƯỚNG — danh sách mọi Body (tìm kiếm + lọc vai trò), chạm 1 tướng -> mở hướng dẫn
// Mở từ nút "📚 CẨM NANG TƯỚNG" ở sảnh chính
// ==========================================
function ensureCodexCss() {
    if (document.getElementById('bodyCodexCss')) return;
    const st = document.createElement('style');
    st.id = 'bodyCodexCss';
    st.textContent = `
#bodyCodexModal{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.82);backdrop-filter:blur(3px);padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));box-sizing:border-box;touch-action:manipulation}
#bodyCodexModal .cx-box{position:relative;display:flex;flex-direction:column;width:100%;max-width:560px;height:92vh;height:calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom));background:linear-gradient(180deg,#0f172a,#111827 60%,#0b1020);border:1.5px solid #a855f7;border-radius:16px;box-shadow:0 0 24px rgba(168,85,247,.45),inset 0 0 18px rgba(56,189,248,.12);color:#e2e8f0;box-sizing:border-box;font-family:inherit;overflow:hidden}
.cx-top{flex:0 0 auto;padding:10px 10px 6px;border-bottom:1px solid #1e293b}
.cx-title{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:900;color:#fff;text-shadow:0 0 8px rgba(168,85,247,.8)}
.cx-title span{flex:1}
.cx-x{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:1px solid #475569;background:#1e293b;color:#f8fafc;font-size:16px;cursor:pointer;padding:0;touch-action:manipulation}
.cx-search{width:100%;box-sizing:border-box;margin:6px 0;padding:9px 11px;font-size:16px;border-radius:10px;border:1px solid #38bdf8;background:#0b1222;color:#fff;outline:none;font-family:inherit}
.cx-search:focus{box-shadow:0 0 10px rgba(56,189,248,.5)}
.cx-chips{display:flex;gap:5px;overflow-x:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x;padding-bottom:2px;scrollbar-width:none}
.cx-chips::-webkit-scrollbar{display:none}
.cx-chip{flex:0 0 auto;padding:7px 11px;font-size:12px;font-weight:800;border-radius:999px;border:1px solid #475569;background:#1e293b;color:#cbd5e1;cursor:pointer;touch-action:manipulation;white-space:nowrap;font-family:inherit}
.cx-chip.on{background:linear-gradient(90deg,rgba(14,165,233,.55),rgba(168,85,247,.55));border-color:#38bdf8;color:#fff;box-shadow:0 0 8px rgba(56,189,248,.45)}
.cx-count{font-size:11px;color:#94a3b8;margin-top:4px}
.cx-grid{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:7px;padding:8px 10px 14px;align-content:start}
.cx-card{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px 7px;border-radius:12px;border:1px solid #334155;background:rgba(30,41,59,.7);cursor:pointer;color:#e2e8f0;font-family:inherit;touch-action:pan-y;text-align:center}
.cx-card:active{transform:scale(.96);border-color:#38bdf8}
.cx-card canvas{width:58px;height:58px;border-radius:10px;background:radial-gradient(circle at 50% 45%,rgba(56,189,248,.22),rgba(15,23,42,.9) 70%)}
.cx-card b{font-size:11.5px;line-height:1.2;color:#fff;word-break:break-word}
.cx-card small{font-size:9.5px;color:#7dd3fc}
.cx-empty{grid-column:1/-1;text-align:center;color:#64748b;padding:30px 0;font-size:13px}
`;
    document.head.appendChild(st);
}

function closeBodyCodex() {
    const m = document.getElementById('bodyCodexModal');
    if (m) m.remove();
    document.removeEventListener('keydown', codexEscKey);
}
function codexEscKey(e) { if (e.key === 'Escape' && !document.getElementById('bodyGuideModal')) closeBodyCodex(); }
function codexNorm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase(); }

function openBodyCodex() {
    ensureGuideCss(); ensureCodexCss(); closeBodyCodex();
    const ROLES = ['Đối Đầu', 'Kiểm Soát', 'Cơ Động', 'Sinh Tồn'];
    const icon = r => (typeof ROLE_ICON !== 'undefined' && ROLE_ICON[r]) || '';
    const bodies = ((typeof MODULES !== 'undefined' && MODULES.BODY) || []).filter(m => m && m.id);
    const wrap = document.createElement('div');
    wrap.id = 'bodyCodexModal';
    wrap.innerHTML = `<div class="cx-box" role="dialog" aria-label="Cẩm Nang Tướng">
      <div class="cx-top"><div class="cx-title"><span>📚 CẨM NANG TƯỚNG</span><button type="button" class="cx-x" aria-label="Đóng">✕</button></div>
      <input class="cx-search" type="search" placeholder="🔍 Tìm tướng..." autocomplete="off">
      <div class="cx-chips"><button type="button" class="cx-chip on" data-role="">Tất cả</button>${ROLES.map(r => `<button type="button" class="cx-chip" data-role="${r}">${icon(r)} ${r}</button>`).join('')}</div>
      <div class="cx-count"></div></div>
      <div class="cx-grid"></div></div>`;
    document.body.appendChild(wrap);
    document.addEventListener('keydown', codexEscKey);
    const grid = wrap.querySelector('.cx-grid'), search = wrap.querySelector('.cx-search'), count = wrap.querySelector('.cx-count');
    let role = '', drawJob = 0;
    const render = () => {
        const q = codexNorm(search.value.trim());
        const list = bodies.filter(m => (!role || (m.role || []).includes(role)) && (!q || codexNorm(m.name + ' ' + m.id).includes(q)));
        count.textContent = list.length + ' / ' + bodies.length + ' tướng';
        grid.innerHTML = list.length ? list.map(m => `<button type="button" class="cx-card" data-id="${guideEsc(m.id)}"><canvas width="88" height="88"></canvas><b>${guideEsc(m.name)}</b><small>${(m.role && m.role[0]) ? icon(m.role[0]) + ' ' + guideEsc(m.role[0]) : '&nbsp;'}</small></button>`).join('') : '<div class="cx-empty">Không tìm thấy tướng nào</div>';
        grid.scrollTop = 0;
        // Vẽ art theo từng đợt nhỏ để không giật máy
        const cards = [...grid.querySelectorAll('.cx-card')];
        const job = ++drawJob;
        let i = 0;
        const step = () => {
            if (job !== drawJob || !document.getElementById('bodyCodexModal')) return;
            const end = Math.min(cards.length, i + 8);
            for (; i < end; i++) drawGuideArt(cards[i].querySelector('canvas'), cards[i].dataset.id, 0, 1);
            if (i < cards.length) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    // Chạm = mở; vuốt cuộn thì không mở nhầm
    let downY = null;
    grid.addEventListener('pointerdown', e => { downY = e.clientY; });
    grid.addEventListener('click', e => {
        const c = e.target.closest('.cx-card');
        if (!c) return;
        if (downY != null && Math.abs(e.clientY - downY) > 12) { downY = null; return; }
        downY = null;
        openBodyGuide(c.dataset.id, 1, false);
    });
    wrap.querySelector('.cx-chips').addEventListener('click', e => {
        const b = e.target.closest('.cx-chip');
        if (!b) return;
        role = b.dataset.role;
        wrap.querySelectorAll('.cx-chip').forEach(x => x.classList.toggle('on', x === b));
        render();
    });
    search.addEventListener('input', render);
    wrap.addEventListener('click', e => { if (e.target === wrap) closeBodyCodex(); });
    wrap.querySelector('.cx-x').addEventListener('click', e => { e.stopPropagation(); closeBodyCodex(); });
    render();
}
