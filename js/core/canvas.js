// ==========================================
// Canvas & kích thước sân đấu
// ==========================================



const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
