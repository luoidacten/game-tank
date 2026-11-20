// ==========================================
// MẢNH KÝ ỨC 1 — THE TRAIN: giao diện (sảnh chọn chế độ, thẻ Ký Ức, thắng / thua)
// DOM được tạo bằng JS (style ở train.css), không đụng vào luồng menu có sẵn.
// ==========================================

const TrainUI = {
    coop: false,
    anim: 0,
    picked: -1,

    el(id) { return document.getElementById(id); },
    load() { try { return JSON.parse(localStorage.getItem('trainProgress') || '{}') || {}; } catch (e) { return {}; } },
    save(d) { try { localStorage.setItem('trainProgress', JSON.stringify(d)); } catch (e) { } },

    build() {
        if (this.el('trainModal')) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = `
<div id="trainModal" class="train-overlay" style="display:none">
  <div class="train-panel">
    <div class="train-kicker">MẢNH KÝ ỨC 1</div>
    <h2 class="train-title">THE TRAIN</h2>
    <canvas id="trainLobbyArt" class="train-art" width="360" height="130"></canvas>
    <div class="train-flow">
      <span>PHASE 1</span><i>→</i><span>🛒</span><i>→</i><span>🃏 KÝ ỨC</span><i>→</i><span>PHASE 2</span><i>→</i><span>PHASE 3</span><i>→</i><span>🏆</span>
    </div>
    <ul class="train-tips">
      <li>Đoàn tàu 8 toa chạy ngang giữa sân, <b>dừng lộ 3 toa</b> rồi chạy tiếp.</li>
      <li>Chỉ toa trong màn hình bắn & bị bắn. <b>Tàu đang chạy chắn đạn.</b></li>
      <li>Phá toa: các toa còn lại <b>+15% sức mạnh</b>. Đầu Tàu có khiên tới khi mất 3 toa.</li>
      <li>Chết giữa Phase: chơi lại Phase đó, <b>giữ đồ đã mua</b>.</li>
    </ul>
    <div class="train-modes">
      <button id="trainSoloBtn" class="train-mode-btn active"><b>🧍 1 NGƯỜI</b><small>Bạn ở làn dưới</small></button>
      <button id="trainCoopBtn" class="train-mode-btn"><b>👥 CO-OP</b><small>2 người cùng máy · máu boss ×1.6</small></button>
    </div>
    <div id="trainRecord" class="train-record"></div>
    <button id="trainStartBtn" class="glow-btn btn-primary train-start">▶ VÀO ĐOÀN TÀU</button>
    <button id="trainCloseBtn" class="glow-btn btn-dark">← QUAY LẠI</button>
  </div>
</div>
<div id="trainMemory" class="train-overlay train-memory" style="display:none">
  <div class="train-memory-head">
    <div class="train-kicker">CHỌN KÝ ỨC</div>
    <h2 id="trainMemoryTitle" class="train-title small">PHASE 2</h2>
    <div class="train-memory-sub">Mỗi thẻ = <b>buff cho bạn</b> + <b>dạng Phase kế tiếp</b> + <b>buff cho boss</b>. ★ càng cao: thưởng càng mạnh, boss càng khó.</div>
  </div>
  <div id="trainCards" class="train-cards"></div>
  <button id="trainMemoryOk" class="glow-btn btn-primary train-start" disabled>CHỌN 1 THẺ</button>
</div>
<div id="trainResult" class="train-overlay" style="display:none">
  <div class="train-panel">
    <div id="trainResultKicker" class="train-kicker">MẢNH KÝ ỨC 1</div>
    <h2 id="trainResultTitle" class="train-title">THẤT BẠI</h2>
    <div id="trainResultBody" class="train-result-body"></div>
    <div id="trainResultBtns" class="train-result-btns"></div>
  </div>
</div>
<div id="trainToast" class="train-toast"></div>`;
        const host = this.el('gameContainer') || document.body;
        while (wrap.firstElementChild) host.appendChild(wrap.firstElementChild);
        const on = (id, fn) => { const e = this.el(id); if (e) e.addEventListener('click', fn); };
        on('trainSoloBtn', () => this.setCoop(false));
        on('trainCoopBtn', () => this.setCoop(true));
        on('trainCloseBtn', () => this.closeAll());
        on('trainStartBtn', () => { this.closeAll(); TrainMode.start(this.coop); });
        on('trainMemoryOk', () => this.confirmMemory());
    },

    setCoop(v) {
        this.coop = v;
        this.el('trainSoloBtn').classList.toggle('active', !v);
        this.el('trainCoopBtn').classList.toggle('active', v);
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    },

    openLobby() {
        this.build();
        const m = this.el('trainModal');
        m.style.display = 'flex';
        const rec = this.load();
        const r = this.el('trainRecord');
        if (r) r.innerHTML = (rec.clears || rec.coopClears) ? `🏆 Đã hoàn thành: ${rec.clears || 0} lần (1 người) · ${rec.coopClears || 0} lần (co-op)` : 'Chưa hoàn thành Mảnh Ký Ức nào';
        this.startAnim();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    },

    startAnim() {
        cancelAnimationFrame(this.anim);
        let t = 0;
        const step = () => {
            const cvs = [...document.querySelectorAll('.train-overlay canvas.train-art')].filter(c => c.offsetParent !== null);
            if (!cvs.length) return;
            t += 1;
            cvs.forEach(c => { try { trainDrawPreview(c, c.dataset.variant || 'p1', t); } catch (e) { } });
            this.anim = requestAnimationFrame(step);
        };
        document.querySelectorAll('.train-overlay canvas.train-art').forEach(c => { try { trainDrawPreview(c, c.dataset.variant || 'p1', 0); } catch (e) { } });
        this.anim = requestAnimationFrame(step);
    },

    closeAll() {
        ['trainModal', 'trainMemory', 'trainResult'].forEach(id => { const e = this.el(id); if (e) e.style.display = 'none'; });
        cancelAnimationFrame(this.anim);
    },

    flash(msg) {
        this.build();
        const t = this.el('trainToast');
        if (!t) return;
        t.textContent = msg;
        t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2200);
    },

    // ---------- Thẻ Ký Ức ----------
    showMemoryPick(cards, onPick) {
        this.build();
        this.onPick = onPick;
        this.cards = cards || trainBuildMemoryCards(TrainMode.phase);
        this.picked = -1;
        this.el('trainMemoryTitle').textContent = `TRƯỚC PHASE ${TrainMode.phase}`;
        const box = this.el('trainCards');
        box.innerHTML = '';
        this.cards.forEach((c, i) => {
            const v = TRAIN_VARIANTS[c.variant];
            const pb = TRAIN_PLAYER_BUFFS[c.playerBuff];
            const col = TRAIN_STAR_COLORS[c.star] || '#38e8ff';
            const d = document.createElement('div');
            d.className = `train-card star-${c.star}`;
            d.style.setProperty('--tc', col);
            d.style.animationDelay = `${i * 0.12}s`;
            d.innerHTML = `
  <div class="tc-top">
    <canvas class="train-art" data-variant="${c.variant}" width="220" height="92"></canvas>
    <div class="tc-head">
      <div class="tc-stars">${'★'.repeat(c.star)}<span>${'★'.repeat(3 - c.star)}</span></div>
      <div class="tc-code">PHASE ${v.code}${v.fallback ? ' · <em>DỰ PHÒNG</em>' : ''}</div>
      <div class="tc-name">${v.name}</div>
    </div>
  </div>
  <div class="tc-desc">${v.desc}</div>
  <div class="tc-row">
    <div class="tc-sec tc-me"><b>🎁 ${pb.icon} ${pb.name}</b><small>${pb.desc}</small></div>
    <div class="tc-sec tc-boss"><b>💀 BOSS</b><small>${c.bossBuffs.map(b => `${TRAIN_BOSS_BUFFS[b].icon} ${TRAIN_BOSS_BUFFS[b].name}`).join('<br>')}</small></div>
  </div>`;
            d.addEventListener('click', () => this.selectCard(i));
            box.appendChild(d);
        });
        const ok = this.el('trainMemoryOk');
        ok.disabled = true; ok.textContent = 'CHỌN 1 THẺ';
        this.el('trainMemory').style.display = 'flex';
        this.startAnim();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },
    selectCard(i) {
        this.picked = i;
        [...this.el('trainCards').children].forEach((d, j) => d.classList.toggle('picked', j === i));
        const ok = this.el('trainMemoryOk');
        ok.disabled = false;
        ok.textContent = `✔ NHẬN KÝ ỨC ${'★'.repeat(this.cards[i].star)}`;
        if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
    },
    confirmMemory() {
        if (this.picked < 0) return;
        const card = this.cards[this.picked];
        this.el('trainMemory').style.display = 'none';
        cancelAnimationFrame(this.anim);
        const fn = this.onPick; this.onPick = null;
        if (fn) fn(card);
    },

    // ---------- Cửa hàng: dải Ký Ức đã có ----------
    decorateShop() {
        const scr = this.el('upgradeScreen');
        if (!scr) return;
        let s = this.el('trainShopStrip');
        if (!s) { s = document.createElement('div'); s.id = 'trainShopStrip'; s.className = 'train-shop-strip'; scr.insertBefore(s, scr.firstChild); }
        const run = TrainMode.run;
        const buffs = (run && run.buffs.length) ? run.buffs.map(b => `<span>${TRAIN_PLAYER_BUFFS[b].icon} ${TRAIN_PLAYER_BUFFS[b].name}</span>`).join('') : '<span class="dim">Chưa có Ký Ức</span>';
        s.innerHTML = `<b>🚂 PHASE ${TrainMode.phase}/3</b>${buffs}`;
        s.style.display = TrainMode.active ? '' : 'none';
    },

    // ---------- Thắng / thua ----------
    showLost() {
        this.build();
        this.el('trainResultKicker').textContent = `MẢNH KÝ ỨC 1 · PHASE ${TrainMode.phase}`;
        this.el('trainResultTitle').textContent = 'BỊ HẠ GỤC';
        this.el('trainResultTitle').className = 'train-title lose';
        this.el('trainResultBody').innerHTML = `<p>Đoàn tàu vẫn chạy... Chơi lại <b>Phase ${TrainMode.phase}</b> — giữ nguyên body, Evo, module & tiền đã có.</p>`;
        const btns = this.el('trainResultBtns');
        btns.innerHTML = '';
        this.btn(btns, '↻ CHƠI LẠI PHASE', 'btn-primary', () => TrainMode.retryPhase(), 'trainRetryBtn');
        this.btn(btns, '⌂ VỀ MENU', 'btn-dark', () => TrainMode.backToMenu(), 'trainMenuBtn');
        this.el('trainResult').style.display = 'flex';
    },
    showVictory() {
        this.build();
        const run = TrainMode.run || { buffs: [], history: [] };
        const rec = this.load();
        if (TrainMode.coop) rec.coopClears = (rec.coopClears || 0) + 1; else rec.clears = (rec.clears || 0) + 1;
        this.save(rec);
        this.el('trainResultKicker').textContent = 'MẢNH KÝ ỨC 1';
        this.el('trainResultTitle').textContent = 'HOÀN THÀNH!';
        this.el('trainResultTitle').className = 'train-title win';
        const hist = run.history.map(h => { const v = TRAIN_VARIANTS[h.variant]; return `<span>${v.code} ${v.name}</span>`; }).join('<i>→</i>');
        const buffs = run.buffs.map(b => `<span>${TRAIN_PLAYER_BUFFS[b].icon} ${TRAIN_PLAYER_BUFFS[b].name}</span>`).join('') || '<span>—</span>';
        this.el('trainResultBody').innerHTML = `
  <div class="train-trophy">🏆</div>
  <div class="train-stats">
    <div><b>${run.cars}</b><small>toa bị phá</small></div>
    <div><b>${run.minions}</b><small>lính bị diệt</small></div>
    <div><b>${run.deaths}</b><small>lần ngã</small></div>
  </div>
  <div class="train-hist">${hist}</div>
  <div class="train-chips">${buffs}</div>`;
        const btns = this.el('trainResultBtns');
        btns.innerHTML = '';
        this.btn(btns, '🔥 THIÊU ĐỐT (sắp ra mắt)', 'btn-dark', null, 'trainBurnBtn').disabled = true;
        this.btn(btns, '↻ CHƠI LƯỢT MỚI', 'btn-primary', () => { const c = TrainMode.coop; TrainMode.exit(); TrainMode.start(c); }, 'trainAgainBtn');
        this.btn(btns, '⌂ VỀ MENU', 'btn-dark', () => TrainMode.backToMenu(), 'trainMenuBtn');
        this.el('trainResult').style.display = 'flex';
        if (soundSystem && !soundSystem.muted) soundSystem.playWin();
    },
    btn(box, label, cls, fn, id) {
        const b = document.createElement('button');
        b.className = `glow-btn ${cls}`; b.innerHTML = label; if (id) b.id = id;
        if (fn) b.addEventListener('click', fn);
        box.appendChild(b);
        return b;
    },
};

window.addEventListener('load', () => {
    TrainUI.build();
    const b = document.getElementById('openTrainBtn');
    if (b) b.addEventListener('click', () => TrainUI.openLobby());
});
