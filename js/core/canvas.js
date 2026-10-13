// ==========================================
// Canvas & kích thước sân đấu
// ==========================================



// --- CANVAS SẮC NÉT TRÊN MÀN HÌNH HiDPI (điện thoại 2x-3x) ---
// Toàn bộ game dùng canvas.width / canvas.height làm KÍCH THƯỚC LOGIC của sân.
// `canvas` là lớp bọc: đặt width/height logic -> tự nhân devicePixelRatio cho bộ đệm thật
// và scale ctx tương ứng, nên mọi toạ độ trong game giữ nguyên.
const canvasEl = document.getElementById('gameCanvas');
const ctx = canvasEl.getContext('2d');
const Display = {
    maxDpr: 2,      // giới hạn để không quá nặng trên điện thoại 3x
    lowQuality: false,
    get dpr() { return Math.max(1, Math.min(this.maxDpr, window.devicePixelRatio || 1)); },
};
const canvas = {
    el: canvasEl,
    _w: canvasEl.width,
    _h: canvasEl.height,
    get width() { return this._w; },
    set width(v) { this._w = v; this.applySize(); },
    get height() { return this._h; },
    set height(v) { this._h = v; this.applySize(); },
    applySize() {
        if (!this._w || !this._h) return;
        // Kích thước hiển thị (CSS px): local = kích thước logic; online = co giãn vừa khung, giữ tỉ lệ 420x700
        let cssW = this._w, cssH = this._h;
        if (document.body.classList.contains('online-active')) {
            const box = document.getElementById('gameContainer');
            const bw0 = box ? box.clientWidth : this._w, bh0 = box ? box.clientHeight : this._h;
            const k = Math.min(bw0 / this._w, bh0 / this._h) || 1;
            cssW = Math.floor(this._w * k); cssH = Math.floor(this._h * k);
        }
        const dpr = Display.dpr;
        const bw = Math.max(1, Math.round(cssW * dpr)), bh = Math.max(1, Math.round(cssH * dpr));
        if (canvasEl.width !== bw) canvasEl.width = bw;
        if (canvasEl.height !== bh) canvasEl.height = bh;
        canvasEl.style.width = cssW + 'px';
        canvasEl.style.height = cssH + 'px';
        ctx.setTransform(bw / this._w, 0, 0, bh / this._h, 0, 0);
    },
    getContext() { return ctx; },
    getBoundingClientRect() { return canvasEl.getBoundingClientRect(); },
    addEventListener(...a) { return canvasEl.addEventListener(...a); },
};

// --- CẤU HÌNH SÀN ĐẤU CHUẨN ONLINE MOBILE ---
const ONLINE_ARENA_WIDTH = 420;
const ONLINE_ARENA_HEIGHT = 700;

function updateCanvasDimensions() {
    const container = document.getElementById('gameContainer');
    if (!container || !canvas) return;
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        canvas.width = ONLINE_ARENA_WIDTH;
        canvas.height = ONLINE_ARENA_HEIGHT;
    } else {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    if (typeof p1 !== 'undefined' && typeof p2 !== 'undefined' && p1 && p2 && typeof gameState !== 'undefined' && gameState.phase === 'playing') {
        let oldP1Y = p1.y, oldP2Y = p2.y;
        p1.y = canvas.height - p1.h - 22;
        p2.y = 20;
        p1.x = Math.max(0, Math.min(canvas.width - p1.w, p1.x));
        p2.x = Math.max(0, Math.min(canvas.width - p2.w, p2.x));
        // [FIX] Dời các vật triệu hồi bám theo làn của chủ khi sân đổi kích thước
        let dy1 = (typeof oldP1Y === 'number') ? p1.y - oldP1Y : 0;
        let dy2 = (typeof oldP2Y === 'number') ? p2.y - oldP2Y : 0;
        const shiftList = (list) => {
            if (!Array.isArray(list)) return;
            list.forEach(o => {
                if (!o || !o.owner) return;
                let dy = (o.owner === p1) ? dy1 : (o.owner === p2 ? dy2 : 0);
                if (typeof o.y === 'number') o.y += dy;
                if (typeof o.x === 'number' && o.w) o.x = Math.max(0, Math.min(canvas.width - o.w, o.x));
            });
        };
        shiftList(turrets);
        shiftList(creatorTurrets);
        shiftList(necroMinions);
        shiftList(ghostDecoys);
        shiftList(shadowTraps);
        [p1, p2].forEach(p => {
            if (Array.isArray(p.illusions)) p.illusions.forEach(ill => { ill.y = p.y; ill.x = Math.max(0, Math.min(canvas.width - ill.w, ill.x)); });
        });
    }
}

function drawWorldText(ctx, text, x, y) {
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    } else {
        ctx.fillText(text, x, y);
    }
}
