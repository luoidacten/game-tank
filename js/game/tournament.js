// ==========================================
// GIẢI ĐẤU (Tournament) — vòng tròn tính điểm trên 1 máy chủ (host)
// 3–12 người, xếp lịch theo "phương pháp vòng tròn" (circle method, có lượt nghỉ khi số lẻ).
// Mỗi trận chơi 1v1 cùng máy: P1 (dưới) = người đầu, P2 (trên) = người sau.
// Kết thúc trận -> tự ghi kết quả -> về bảng giải với bảng xếp hạng cập nhật.
// Trạng thái lưu localStorage để tải lại trang không mất giải.
// (Tương lai: cho người chơi online vào phòng của host và gán vào 1 slot — chưa làm.)
// ==========================================

const TOURNEY_KEY = 'cybertank_tourney_v1';
const TOURNEY_COLORS = ['#00f0ff', '#ff0055', '#facc15', '#2ecc71', '#a855f7', '#fb923c', '#38bdf8', '#f472b6', '#84cc16', '#e11d48', '#14b8a6', '#eab308'];

// Lịch vòng tròn: trả về mảng vòng, mỗi vòng = [{a,b}] (b === null -> a được nghỉ)
function tourneySchedule(n) {
    const ids = [];
    for (let i = 0; i < n; i++) ids.push(i);
    if (n % 2) ids.push(null);
    const m = ids.length, rounds = [];
    let arr = ids.slice();
    for (let r = 0; r < m - 1; r++) {
        const round = [];
        for (let i = 0; i < m / 2; i++) {
            let a = arr[i], b = arr[m - 1 - i];
            // Đảo sân xen kẽ cho công bằng (ai ở dưới / trên)
            if ((i === 0 && r % 2 === 1)) { const t = a; a = b; b = t; }
            if (a === null) { a = b; b = null; }
            round.push({ a, b, res: null });
        }
        // Đưa lượt nghỉ xuống cuối danh sách vòng
        round.sort((x, y) => (x.b === null) - (y.b === null));
        rounds.push(round);
        // Xoay: giữ phần tử đầu, xoay phần còn lại
        arr = [arr[0], arr[m - 1], ...arr.slice(1, m - 1)];
    }
    return rounds;
}

// Bảng xếp hạng: điểm -> hiệu số hiệp -> số hiệp thắng -> số trận thắng -> đối đầu -> tên
function tourneyStandings(st) {
    const rows = st.players.map((p, i) => ({ i, name: p.name, color: p.color, pl: 0, w: 0, d: 0, l: 0, rw: 0, rl: 0, pts: 0 }));
    const h2h = {};
    st.rounds.forEach(rd => rd.forEach(m => {
        if (m.b === null || !m.res) return;
        const A = rows[m.a], B = rows[m.b], r = m.res;
        A.pl++; B.pl++;
        A.rw += r.sa; A.rl += r.sb; B.rw += r.sb; B.rl += r.sa;
        if (r.sa === r.sb) { A.d++; B.d++; A.pts += st.pts.draw; B.pts += st.pts.draw; }
        else {
            const W = r.sa > r.sb ? A : B, L = W === A ? B : A;
            W.w++; L.l++; W.pts += st.pts.win; L.pts += st.pts.loss;
            h2h[W.i + '>' + L.i] = 1;
        }
    }));
    rows.forEach(r => { r.diff = r.rw - r.rl; });
    rows.sort((x, y) => (y.pts - x.pts) || (y.diff - x.diff) || (y.rw - x.rw) || (y.w - x.w)
        || ((h2h[y.i + '>' + x.i] ? 1 : 0) - (h2h[x.i + '>' + y.i] ? 1 : 0))
        || x.name.localeCompare(y.name) || (x.i - y.i));
    rows.forEach((r, k) => { r.rank = k + 1; });
    return rows;
}

const TOURNEY = {
    state: null,
    active: false,      // đang chơi 1 trận của giải
    match: null,        // {r, m}
    saved: null,
    view: 'setup',
    draft: null,
    _retTimer: null,
    _fxTimer: null,

    load() {
        try { const s = JSON.parse(localStorage.getItem(TOURNEY_KEY) || 'null'); if (s && s.v === 1 && Array.isArray(s.rounds)) return s; } catch (e) { }
        return null;
    },
    save() {
        try { if (this.state) localStorage.setItem(TOURNEY_KEY, JSON.stringify(this.state)); else localStorage.removeItem(TOURNEY_KEY); } catch (e) { }
        this.updateMenuCard();
    },
    esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    el(id) { return document.getElementById(id); },
    // Tiêu đề: emoji đầu (nếu có) làm biểu tượng, phần chữ tô gradient
    headHtml(icon) {
        const st = this.state, mt = /^(\p{Extended_Pictographic}\uFE0F?)\s*(.*)$/u.exec(st.title || '');
        const ic = icon || (mt ? mt[1] : (st.theme ? '🎂' : '🏆'));
        return `<div class="tf-head"><span class="tf-cake">${ic}</span><h2>${this.esc(mt ? mt[2] : st.title)}</h2></div>`;
    },

    totalMatches(st) { let n = 0; st.rounds.forEach(rd => rd.forEach(m => { if (m.b !== null) n++; })); return n; },
    playedMatches(st) { let n = 0; st.rounds.forEach(rd => rd.forEach(m => { if (m.b !== null && m.res) n++; })); return n; },
    nextMatch(st) {
        for (let r = 0; r < st.rounds.length; r++) for (let m = 0; m < st.rounds[r].length; m++) {
            const x = st.rounds[r][m];
            if (x.b !== null && !x.res) return { r, m };
        }
        return null;
    },

    // ---------- DOM ----------
    init() {
        const ov = document.createElement('div');
        ov.id = 'tourneyOverlay';
        ov.className = 'menu-overlay tourney-overlay';
        ov.style.display = 'none';
        ov.innerHTML = '<div class="tourney-fx" id="tourneyFx"></div><div class="tourney-wrap" id="tourneyWrap"></div>';
        (this.el('gameContainer') || document.body).appendChild(ov);
        ov.addEventListener('click', (e) => this.onClick(e));
        ov.addEventListener('input', (e) => this.onInput(e));

        // Nút ở màn kết thúc trận
        const acts = document.querySelector('#endScreen .end-actions');
        if (acts) {
            const b = document.createElement('button');
            b.id = 'tourneyBackBtn';
            b.className = 'glow-btn btn-primary';
            b.style.display = 'none';
            b.innerHTML = '🏆 VỀ BẢNG GIẢI ĐẤU';
            b.addEventListener('click', () => this.returnToHub());
            acts.insertBefore(b, acts.firstChild);
        }
        // Thoát trận giữa chừng (menu tạm dừng) -> về bảng giải, trận vẫn chưa đấu
        const back = this.el('backToMainMenuBtn');
        if (back) back.addEventListener('click', () => { if (this.active) this.returnToHub(true); });
        const open = this.el('openTourneyBtn');
        if (open) open.addEventListener('click', () => this.open());
        this.state = this.load();
        this.updateMenuCard();
    },

    updateMenuCard() {
        const s = this.el('tourneyMenuSub');
        if (!s) return;
        const st = this.state;
        if (st && st.status !== 'done') s.textContent = `▶ Tiếp tục: ${this.playedMatches(st)}/${this.totalMatches(st)} trận · ${st.players.length} người`;
        else s.textContent = '3–12 người · vòng tròn tính điểm · 1 máy làm chủ';
    },

    open() {
        this.state = this.load();
        const ov = this.el('tourneyOverlay');
        const mm = this.el('mainMenu');
        if (mm) mm.style.display = 'none';
        ov.style.display = 'flex';
        if (!this.state) this.showSetup();
        else if (this.state.status === 'done') this.showPodium();
        else this.showResume();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    },
    closeToMenu() {
        this.el('tourneyOverlay').style.display = 'none';
        this.stopFx();
        const mm = this.el('mainMenu');
        if (mm) mm.style.display = 'flex';
        this.updateMenuCard();
    },
    setTheme(on) {
        const ov = this.el('tourneyOverlay');
        if (ov) ov.classList.toggle('bday', !!on);
        if (on) this.startFx(); else this.stopFx();
    },
    render(html) {
        const w = this.el('tourneyWrap');
        w.innerHTML = html;
        const ov = this.el('tourneyOverlay');
        if (ov) ov.scrollTop = 0;
    },

    // ---------- Hiệu ứng sinh nhật: bóng bay + pháo giấy ----------
    startFx(burst) {
        const fx = this.el('tourneyFx');
        if (!fx) return;
        if (!this._fxTimer) {
            const spawn = () => {
                if (fx.childElementCount > 40) return;
                const b = document.createElement('span');
                b.className = 'tf-balloon';
                b.textContent = '🎈';
                b.style.left = (Math.random() * 92) + '%';
                b.style.animationDuration = (7 + Math.random() * 5) + 's';
                b.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`;
                fx.appendChild(b);
                setTimeout(() => b.remove(), 12500);
            };
            for (let i = 0; i < 4; i++) spawn();
            this._fxTimer = setInterval(spawn, 1800);
        }
        if (burst) this.confetti(burst);
    },
    confetti(n) {
        const fx = this.el('tourneyFx');
        if (!fx) return;
        for (let i = 0; i < n; i++) {
            const c = document.createElement('i');
            c.className = 'tf-confetti';
            c.style.left = (Math.random() * 100) + '%';
            c.style.background = TOURNEY_COLORS[i % TOURNEY_COLORS.length];
            c.style.animationDelay = (Math.random() * 1.2) + 's';
            c.style.animationDuration = (2.6 + Math.random() * 2.4) + 's';
            c.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
            fx.appendChild(c);
            setTimeout(() => c.remove(), 6500);
        }
    },
    stopFx() {
        if (this._fxTimer) { clearInterval(this._fxTimer); this._fxTimer = null; }
        const fx = this.el('tourneyFx');
        if (fx) fx.innerHTML = '';
    },

    // ---------- MÀN THIẾT LẬP ----------
    showSetup() {
        this.view = 'setup';
        if (!this.draft) this.draft = {
            title: '🎂 GIẢI ĐẤU SINH NHẬT', theme: true, winScore: 2, classic: false,
            pts: { win: 3, draw: 1, loss: -1 },
            players: ['', '', '', ''].map((_, i) => ({ name: '', color: TOURNEY_COLORS[i] })),
        };
        const d = this.draft;
        this.setTheme(d.theme);
        const rows = d.players.map((p, i) => `
            <div class="tf-prow">
                <span class="tf-pnum">${i + 1}</span>
                <input class="tf-in" data-k="name" data-i="${i}" maxlength="14" placeholder="Người chơi ${i + 1}" value="${this.esc(p.name)}">
                <input class="tf-color" type="color" data-k="color" data-i="${i}" value="${p.color}" title="Màu đại diện">
                <button class="tf-x" data-act="delp" data-i="${i}" ${d.players.length <= 3 ? 'disabled' : ''} title="Xoá">✕</button>
            </div>`).join('');
        const opt = (k, v, label) => `<button class="mode-btn ${d[k] === v ? 'active' : ''}" data-act="opt" data-k="${k}" data-v="${v}">${label}</button>`;
        this.render(`
            <div class="tf-card">
                <div class="tf-head"><span class="tf-cake">${d.theme ? '🎂' : '🏆'}</span><h2>TẠO GIẢI ĐẤU</h2></div>
                <label class="tf-lbl">TÊN GIẢI</label>
                <input class="tf-in tf-wide" data-k="title" maxlength="40" value="${this.esc(d.title)}">
                <label class="tf-lbl">NGƯỜI CHƠI (${d.players.length}/12)</label>
                <div class="tf-plist">${rows}</div>
                <button class="glow-btn btn-dark tf-btn" data-act="addp" ${d.players.length >= 12 ? 'disabled' : ''}>＋ THÊM NGƯỜI CHƠI</button>
                <label class="tf-lbl">THỂ THỨC MỖI TRẬN</label>
                <div class="mode-options">${opt('winScore', 2, 'CHẠM 2')}${opt('winScore', 3, 'CHẠM 3')}</div>
                <label class="tf-lbl">LUẬT CHƠI</label>
                <div class="mode-options">${opt('classic', false, '⚙️ G.E.A.R')}${opt('classic', true, '🏛️ CỔ ĐIỂN')}</div>
                <label class="tf-lbl">ĐIỂM GIẢI</label>
                <div class="tf-pts">
                    <span>Thắng<input class="tf-in tf-num" type="number" data-k="pwin" value="${d.pts.win}"></span>
                    <span>Hoà<input class="tf-in tf-num" type="number" data-k="pdraw" value="${d.pts.draw}"></span>
                    <span>Thua<input class="tf-in tf-num" type="number" data-k="ploss" value="${d.pts.loss}"></span>
                </div>
                <button class="glow-btn tf-btn tf-toggle ${d.theme ? 'on' : ''}" data-act="theme">🎉 GIAO DIỆN SINH NHẬT: ${d.theme ? 'BẬT' : 'TẮT'}</button>
                <div class="tf-err" id="tfErr"></div>
                <button class="glow-btn btn-primary tf-btn" data-act="create">🏁 TẠO GIẢI &amp; XẾP LỊCH</button>
                <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>
                <p class="tf-note">Mỗi trận chơi trên máy này (2 người cùng máy). Chơi online theo slot: sẽ có trong bản sau.</p>
            </div>`);
    },
    onInput(e) {
        const t = e.target, d = this.draft;
        if (!d || this.view !== 'setup' || !t.dataset) return;
        const k = t.dataset.k, i = +t.dataset.i;
        if (k === 'name') d.players[i].name = t.value;
        else if (k === 'color') d.players[i].color = t.value;
        else if (k === 'title') d.title = t.value;
        else if (k === 'pwin') d.pts.win = Math.round(+t.value || 0);
        else if (k === 'pdraw') d.pts.draw = Math.round(+t.value || 0);
        else if (k === 'ploss') d.pts.loss = Math.round(+t.value || 0);
    },
    create() {
        const d = this.draft;
        const players = d.players.map((p, i) => ({ name: (p.name || '').trim() || `Người ${i + 1}`, color: p.color }));
        const names = players.map(p => p.name.toLowerCase());
        if (players.length < 3 || players.length > 12) return this.err('Cần 3–12 người chơi.');
        if (new Set(names).size !== names.length) return this.err('Tên người chơi bị trùng.');
        this.state = {
            v: 1, title: (d.title || '').trim() || '🏆 GIẢI ĐẤU', theme: !!d.theme, winScore: d.winScore, classic: !!d.classic,
            pts: { win: d.pts.win, draw: d.pts.draw, loss: d.pts.loss }, players,
            rounds: tourneySchedule(players.length), status: 'running', lastRanks: null, lastMatch: null,
        };
        this.save();
        this.draft = null;
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        this.showHub();
        if (this.state.theme) this.confetti(60);
    },
    err(msg) { const e = this.el('tfErr'); if (e) e.textContent = msg; return false; },

    // ---------- MÀN TIẾP TỤC ----------
    showResume() {
        this.view = 'resume';
        const st = this.state;
        this.setTheme(st.theme);
        this.render(`
            <div class="tf-card">
                ${this.headHtml()}
                <p class="tf-note">Đang có giải đấu dở: ${this.playedMatches(st)}/${this.totalMatches(st)} trận · ${st.players.length} người chơi.</p>
                <button class="glow-btn btn-primary tf-btn" data-act="hub">▶ TIẾP TỤC</button>
                <button class="glow-btn btn-secondary tf-btn" data-act="new">🆕 GIẢI MỚI</button>
                <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>
            </div>`);
    },

    // ---------- BẢNG GIẢI (HUB) ----------
    pname(i, cls) {
        const p = this.state.players[i];
        return `<b class="tf-name ${cls || ''}" style="--pc:${p.color}">${this.esc(p.name)}</b>`;
    },
    standingsHtml(rows, animate) {
        const st = this.state, last = animate ? st.lastRanks : null;
        const body = rows.map(r => {
            const prev = last ? last[r.i] : null;
            const delta = prev ? prev - r.rank : 0;
            const mv = delta > 0 ? `<span class="tf-up">▲${delta}</span>` : delta < 0 ? `<span class="tf-down">▼${-delta}</span>` : '';
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank;
            return `<tr class="tf-row" data-pi="${r.i}" data-shift="${delta}">
                <td class="tf-rk">${medal}</td>
                <td class="tf-nm"><span class="tf-dot" style="background:${r.color}"></span>${this.esc(r.name)} ${mv}</td>
                <td class="tf-pt">${r.pts}</td><td>${r.w}-${r.d}-${r.l}</td><td>${r.diff > 0 ? '+' : ''}${r.diff}</td></tr>`;
        }).join('');
        return `<div class="tf-tablewrap"><table class="tf-table"><thead><tr><th>#</th><th>NGƯỜI CHƠI</th><th>Đ</th><th>T-H-B</th><th>HS</th></tr></thead><tbody>${body}</tbody></table></div>`;
    },
    animateRows() {
        // FLIP: hàng đổi hạng trượt từ vị trí cũ về vị trí mới
        document.querySelectorAll('#tourneyWrap .tf-row').forEach(tr => {
            const sh = +tr.dataset.shift || 0;
            if (!sh) return;
            tr.style.transition = 'none';
            tr.style.transform = `translateY(${sh * tr.offsetHeight}px)`;
            tr.classList.add(sh > 0 ? 'tf-rise' : 'tf-fall');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                tr.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.9, 0.25, 1)';
                tr.style.transform = 'translateY(0)';
            }));
        });
    },
    scheduleHtml() {
        const st = this.state, nx = this.nextMatch(st);
        return st.rounds.map((rd, r) => `
            <div class="tf-round"><div class="tf-rtitle">VÒNG ${r + 1}</div>
            ${rd.map((m, k) => {
                if (m.b === null) return `<div class="tf-match bye">${this.pname(m.a)} <span class="tf-vs">nghỉ</span></div>`;
                const cur = nx && nx.r === r && nx.m === k;
                const res = m.res ? `<span class="tf-score">${m.res.sa} - ${m.res.sb}${m.res.ff ? ' <small>(BỎ)</small>' : ''}</span>` : `<span class="tf-vs">${cur ? 'TIẾP THEO' : 'vs'}</span>`;
                const wa = m.res && m.res.sa > m.res.sb ? 'win' : '', wb = m.res && m.res.sb > m.res.sa ? 'win' : '';
                return `<div class="tf-match ${cur ? 'cur' : ''} ${m.res ? 'done' : ''}">${this.pname(m.a, wa)} ${res} ${this.pname(m.b, wb)}</div>`;
            }).join('')}</div>`).join('');
    },
    showHub(animate) {
        const st = this.state;
        if (!st) return this.showSetup();
        if (st.status === 'done') return this.showPodium();
        this.view = 'hub';
        this.setTheme(st.theme);
        const nx = this.nextMatch(st);
        const rows = tourneyStandings(st);
        let card = '';
        if (nx) {
            const m = st.rounds[nx.r][nx.m];
            card = `<div class="tf-next">
                <div class="tf-ntitle">VÒNG ${nx.r + 1} · TRẬN ${this.playedMatches(st) + 1}/${this.totalMatches(st)} · CHẠM ${st.winScore} · ${st.classic ? 'CỔ ĐIỂN' : 'G.E.A.R'}</div>
                <div class="tf-vsline">${this.pname(m.a, 'big')}<span class="tf-vsbig">VS</span>${this.pname(m.b, 'big')}</div>
                <div class="tf-sides"><span>⬇ Dưới (P1)</span><span>Trên (P2) ⬆</span></div>
                <button class="glow-btn btn-primary tf-btn tf-start" data-act="start">▶ BẮT ĐẦU</button>
                <button class="glow-btn btn-dark tf-btn" data-act="forfeit">⏭ BỎ TRẬN</button>
            </div>`;
        }
        let lastHtml = '';
        if (animate && st.lastMatch) {
            const lm = st.rounds[st.lastMatch.r][st.lastMatch.m];
            if (lm && lm.res) lastHtml = `<div class="tf-last">Kết quả: ${this.pname(lm.a)} <b>${lm.res.sa} - ${lm.res.sb}</b> ${this.pname(lm.b)}</div>`;
        }
        this.render(`
            <div class="tf-card">
                ${this.headHtml()}
                ${lastHtml}${card}
                <div class="tf-sec">📊 BẢNG XẾP HẠNG <small>(Thắng ${st.pts.win > 0 ? '+' : ''}${st.pts.win} · Hoà ${st.pts.draw > 0 ? '+' : ''}${st.pts.draw} · Thua ${st.pts.loss > 0 ? '+' : ''}${st.pts.loss})</small></div>
                ${this.standingsHtml(rows, animate)}
                <div class="tf-sec">🗓️ LỊCH ĐẤU</div>
                <div class="tf-sched">${this.scheduleHtml()}</div>
                <div class="tf-actions">
                    <button class="glow-btn btn-secondary tf-btn" data-act="endearly">🏁 KẾT THÚC SỚM</button>
                    <button class="glow-btn btn-secondary tf-btn" data-act="new">🆕 GIẢI MỚI</button>
                    <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>
                </div>
            </div>`);
        if (animate) { this.animateRows(); if (st.theme) this.confetti(30); }
    },

    showForfeit() {
        const st = this.state, nx = this.nextMatch(st);
        if (!nx) return;
        const m = st.rounds[nx.r][nx.m];
        this.view = 'forfeit';
        this.render(`
            <div class="tf-card">
                <div class="tf-head"><h2>⏭ BỎ TRẬN</h2></div>
                <div class="tf-vsline">${this.pname(m.a, 'big')}<span class="tf-vsbig">VS</span>${this.pname(m.b, 'big')}</div>
                <p class="tf-note">Chọn kết quả xử cho trận này:</p>
                <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="a">${this.esc(st.players[m.a].name)} bỏ cuộc → ${this.esc(st.players[m.b].name)} thắng</button>
                <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="b">${this.esc(st.players[m.b].name)} bỏ cuộc → ${this.esc(st.players[m.a].name)} thắng</button>
                <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="d">🤝 Xử HOÀ</button>
                <button class="glow-btn btn-dark tf-btn" data-act="hub">← HUỶ</button>
            </div>`);
    },
    confirmBox(text, act) {
        this.view = 'confirm';
        this.render(`<div class="tf-card"><div class="tf-head"><h2>XÁC NHẬN</h2></div><p class="tf-note">${text}</p>
            <button class="glow-btn btn-primary tf-btn" data-act="${act}">✔ ĐỒNG Ý</button>
            <button class="glow-btn btn-dark tf-btn" data-act="hub">← HUỶ</button></div>`);
    },

    // Ghi kết quả 1 trận (sa: số hiệp của a, sb: của b)
    record(r, m, sa, sb, ff) {
        const st = this.state;
        if (!st || !st.rounds[r] || !st.rounds[r][m]) return;
        const before = {};
        tourneyStandings(st).forEach(x => { before[x.i] = x.rank; });
        st.rounds[r][m].res = { sa, sb, ff: !!ff };
        st.lastRanks = before;
        st.lastMatch = { r, m };
        if (!this.nextMatch(st)) st.status = 'done';
        this.save();
    },
    forfeit(v) {
        const st = this.state, nx = this.nextMatch(st);
        if (!nx) return;
        const W = st.winScore;
        if (v === 'a') this.record(nx.r, nx.m, 0, W, true);
        else if (v === 'b') this.record(nx.r, nx.m, W, 0, true);
        else this.record(nx.r, nx.m, 0, 0, true);
        this.showHub(true);
    },

    // ---------- CHƠI TRẬN ----------
    startMatch() {
        const st = this.state, nx = this.nextMatch(st);
        if (!nx) return;
        const m = st.rounds[nx.r][nx.m];
        this.match = nx;
        this.active = true;
        if (!this.saved) this.saved = { winScore: gameState.winScore, classic: gameState.classicMode };
        gameState.winScore = st.winScore;
        gameState.classicMode = st.classic;
        if (typeof PVE !== 'undefined' && PVE.active) PVE.exit();
        if (typeof botAI !== 'undefined') botAI.enabled = false;
        this.stopFx();
        this.el('tourneyOverlay').style.display = 'none';
        const tb = this.el('trainingToolbar'); if (tb) tb.style.display = 'none';
        const p2c = this.el('p2-controls'); if (p2c) p2c.style.display = 'flex';
        startBattle();
        this.applyNames(st.players[m.a], st.players[m.b]);
        if (typeof updateCanvasDimensions === 'function') updateCanvasDimensions();
    },
    applyNames(A, B) {
        const short = (s) => s.length > 9 ? s.slice(0, 8) + '…' : s;
        const t1 = document.querySelector('.p1-tag'), t2 = document.querySelector('.p2-tag');
        if (t1) t1.innerHTML = `🔵 ${this.esc(A.name)} · 🏆`;
        if (t2) t2.innerHTML = `🔴 ${this.esc(B.name)} · 🏆`;
        const s1 = document.querySelector('.p1-side .side-tag'), s2 = document.querySelector('.p2-side .side-tag');
        if (s1) { s1.textContent = short(A.name); s1.classList.add('tf-hudname'); }
        if (s2) { s2.textContent = short(B.name); s2.classList.add('tf-hudname'); }
    },
    restoreHud() {
        const t1 = document.querySelector('.p1-tag'), t2 = document.querySelector('.p2-tag');
        if (t1) t1.innerHTML = '🔵 PLAYER 1 (BLUE)';
        if (t2) t2.innerHTML = '🔴 PLAYER 2 (RED)';
        const s1 = document.querySelector('.p1-side .side-tag'), s2 = document.querySelector('.p2-side .side-tag');
        if (s1) { s1.textContent = 'P1'; s1.classList.remove('tf-hudname'); }
        if (s2) { s2.textContent = 'P2'; s2.classList.remove('tf-hudname'); }
        const rb = this.el('restartBtn'), bb = this.el('backToMenuFromEndBtn'), tb = this.el('tourneyBackBtn');
        if (rb) rb.style.display = '';
        if (bb) bb.style.display = '';
        if (tb) tb.style.display = 'none';
    },

    // Gọi từ round.js khi 1 bên đạt đủ số hiệp thắng
    onMatchEnd(s1, s2) {
        if (!this.active || !this.match) return;
        const st = this.state, { r, m } = this.match;
        const mt = st.rounds[r][m];
        this.record(r, m, s1, s2, false);
        const W = s1 > s2 ? st.players[mt.a] : st.players[mt.b];
        const pts = st.pts.win;
        setTimeout(() => {
            if (!this.active) return;
            const fw = this.el('finalWinner'), fs = this.el('finalScoreSummary');
            if (fw) fw.innerText = `${W.name} THẮNG!`;
            if (fs) fs.innerText = `${st.players[mt.a].name} ${s1} - ${s2} ${st.players[mt.b].name} · ${pts >= 0 ? '+' : ''}${pts} điểm giải`;
            const rb = this.el('restartBtn'), bb = this.el('backToMenuFromEndBtn'), tb = this.el('tourneyBackBtn');
            if (rb) rb.style.display = 'none';
            if (bb) bb.style.display = 'none';
            if (tb) tb.style.display = '';
            const es = this.el('endScreen');
            if (es) es.style.display = 'block';
            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        }, 1200);
    },

    // Về bảng giải (sau trận hoặc thoát giữa chừng: aborted -> trận chưa ghi)
    returnToHub(aborted) {
        this.active = false;
        this.match = null;
        if (this.saved) { gameState.winScore = this.saved.winScore; gameState.classicMode = this.saved.classic; this.saved = null; }
        this.restoreHud();
        ['endScreen', 'upgradeScreen', 'pauseMenuModal', 'mainMenu'].forEach(id => { const e = this.el(id); if (e) e.style.display = 'none'; });
        gameState.phase = 'menu';
        gameState.isPaused = false;
        if (typeof animationId !== 'undefined') cancelAnimationFrame(animationId);
        this.state = this.load() || this.state;
        this.el('tourneyOverlay').style.display = 'flex';
        if (this.state && this.state.status === 'done') this.showPodium(true);
        else this.showHub(!aborted);
    },

    // ---------- CHUNG KẾT: BỤC VINH QUANG ----------
    showPodium(celebrate) {
        const st = this.state;
        this.view = 'podium';
        if (st.status !== 'done') { st.status = 'done'; this.save(); }
        this.setTheme(st.theme);
        const rows = tourneyStandings(st);
        const step = (r, cls, medal) => r ? `<div class="tf-pod ${cls}">
            <div class="tf-medal">${medal}</div>
            <div class="tf-podname" style="--pc:${r.color}">${this.esc(r.name)}</div>
            <div class="tf-podpts">${r.pts} điểm</div>
            <div class="tf-block">${r.rank}</div></div>` : '';
        this.render(`
            <div class="tf-card tf-final">
                ${st.theme ? '<div class="tf-bday">🎂 Chúc mừng sinh nhật! 🎉</div>' : ''}
                ${this.headHtml('🏆')}
                <div class="tf-champ">NHÀ VÔ ĐỊCH: <b style="color:${rows[0].color}">${this.esc(rows[0].name)}</b></div>
                <div class="tf-podium">${step(rows[1], 'p2nd', '🥈')}${step(rows[0], 'p1st', '🥇')}${step(rows[2], 'p3rd', '🥉')}</div>
                <div class="tf-sec">📊 BẢNG XẾP HẠNG CHUNG CUỘC</div>
                ${this.standingsHtml(rows, false)}
                <div class="tf-sec">🗓️ KẾT QUẢ CÁC VÒNG</div>
                <div class="tf-sched">${this.scheduleHtml()}</div>
                <div class="tf-actions">
                    <button class="glow-btn btn-primary tf-btn" data-act="new">🆕 GIẢI MỚI</button>
                    <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>
                </div>
            </div>`);
        if (st.theme) this.startFx(celebrate === false ? 0 : 120);
        else this.confetti(50);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    onClick(e) {
        const b = e.target.closest('[data-act]');
        if (!b || b.disabled) return;
        const act = b.dataset.act, d = this.draft;
        if (soundSystem && !soundSystem.muted && soundSystem.playClick) soundSystem.playClick();
        switch (act) {
            case 'menu': this.closeToMenu(); break;
            case 'addp': if (d.players.length < 12) { d.players.push({ name: '', color: TOURNEY_COLORS[d.players.length % 12] }); this.showSetup(); } break;
            case 'delp': if (d.players.length > 3) { d.players.splice(+b.dataset.i, 1); this.showSetup(); } break;
            case 'opt': {
                const k = b.dataset.k;
                d[k] = k === 'classic' ? b.dataset.v === 'true' : +b.dataset.v;
                this.showSetup(); break;
            }
            case 'theme': d.theme = !d.theme; this.showSetup(); break;
            case 'create': this.create(); break;
            case 'hub': this.showHub(); break;
            case 'start': this.startMatch(); break;
            case 'forfeit': this.showForfeit(); break;
            case 'ff': this.forfeit(b.dataset.v); break;
            case 'endearly': this.confirmBox('Kết thúc giải ngay? Các trận chưa đấu sẽ bị bỏ qua và trao giải theo bảng xếp hạng hiện tại.', 'doend'); break;
            case 'doend': this.state.status = 'done'; this.save(); this.showPodium(true); break;
            case 'new':
                if (this.state && this.state.status !== 'done' && this.view !== 'confirm') this.confirmBox('Huỷ giải đang chơi và tạo giải mới? Kết quả hiện tại sẽ bị xoá.', 'donew');
                else this.newTourney();
                break;
            case 'donew': this.newTourney(); break;
        }
    },
    newTourney() {
        const old = this.state;
        this.state = null;
        this.save();
        this.draft = old ? {
            title: old.title, theme: old.theme, winScore: old.winScore, classic: old.classic, pts: { ...old.pts },
            players: old.players.map(p => ({ name: p.name, color: p.color })),
        } : null;
        this.showSetup();
    },
};
