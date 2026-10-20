// ==========================================
// Đạn Lớn (big_bullet) — Logic Full Evo (Xuyên Thấu sau khi nảy + Phân Mảnh 360°)
// ------------------------------------------
// Mọi viên đạn của Đạn Lớn mang b.hook = 'big_bullet' (vẽ quả cầu tròn phát sáng, không đuôi).
// Full Evo (evo_big_1 + evo_big_2):
//  1. Evo Bóng Cao Su: nảy tối đa 7 lần (Full Evo 9), càng nảy càng to; nảy đủ -> tự nổ khi tới giữa sân.
//     Full Evo: từ lần nảy thứ 2 đạn hóa Xuyên Thấu (xuyên mọi vật cản, vẫn trúng địch).
//  2. Khi đạn kết thúc (trúng, bị phá, chạm mép, tới giữa sân) -> nổ thành vòng đạn nhỏ 360° (chỉ hại địch).
// ==========================================

const BIG_FRAG_COUNT = 20;
const BIG_FRAG_SPEED = 4.4;
const BIG_FRAG_MAX_HITS = 2;

// Vòng mảnh đạn 360° (giống Thùng Đạn ✸ nhưng chỉ trúng đối thủ của người bắn)
class BigBulletBurst extends CrateBurst {
    constructor(x, y, owner, dmg) {
        super(x, y, owner, true);
        this.dmg = dmg;
        this.life = 150;
        this.ownerSide = owner ? owner.id : 1;
        this.ring = 0; // vòng sóng nổ (hình ảnh)
        this.pellets = [];
        const off = Math.random() * Math.PI * 2 / BIG_FRAG_COUNT;
        for (let i = 0; i < BIG_FRAG_COUNT; i++) {
            const a = off + i * Math.PI * 2 / BIG_FRAG_COUNT;
            this.pellets.push({ x, y, vx: Math.cos(a) * BIG_FRAG_SPEED, vy: Math.sin(a) * BIG_FRAG_SPEED, on: true });
        }
        this.cx = x; this.cy = y;
        this.hits = 0;       // mỗi vòng mảnh trúng địch tối đa BIG_FRAG_MAX_HITS lần
        // Nổ ngay trên người địch (đạn lớn vừa trúng) -> mảnh không trúng lại mục tiêu đó
        const en = owner === p1 ? p2 : p1;
        this.skipEnemy = !!(en && x > en.x - 6 && x < en.x + en.w + 6 && y > en.y - 6 && y < en.y + en.h + 6);
    }
    update() {
        if (!this.active) return;
        this.ring++;
        if (--this.life <= 0) { this.active = false; return; }
        const owner = this.breakerId === 1 ? p1 : (this.breakerId === 2 ? p2 : null);
        const enemy = owner === p1 ? p2 : p1;
        let alive = 0;
        for (const b of this.pellets) {
            if (!b.on) continue;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -10 || b.x > canvas.width + 10 || b.y < -10 || b.y > canvas.height + 10) { b.on = false; continue; }
            // Tường Sniper của đối thủ chặn mảnh đạn
            for (const w of (typeof sniperWalls !== 'undefined' ? sniperWalls : [])) {
                if (w.active && w.owner !== owner && rectIntersect(b.x - 3, b.y - 3, 6, 6, w.x, w.y, w.w, w.h)) {
                    if (typeof w.takeHit === 'function') w.takeHit(this.dmg, owner);
                    b.on = false; break;
                }
            }
            if (!b.on) continue;
            if (enemy && enemy.hp > 0 && !this.skipEnemy && this.hits < BIG_FRAG_MAX_HITS && rectIntersect(b.x - 3, b.y - 3, 6, 6, enemy.x, enemy.y, enemy.w, enemy.h)) {
                enemy.takeDamage(this.dmg, owner);
                this.hits++;
                spawnSparkParticles(b.x, b.y, '#ffd166', 6);
                b.on = false;
            }
            if (b.on) alive++;
        }
        if (!alive) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const col = this.ownerSide === 1 ? '#5ad1ff' : '#ff6b6b';
        ctx.save();
        // Vòng sóng nổ ban đầu
        if (this.ring < 16) {
            const k = this.ring / 16;
            ctx.globalAlpha = 1 - k;
            ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowBlur = 14; ctx.shadowColor = col;
            ctx.beginPath(); ctx.arc(this.cx, this.cy, 8 + k * 46, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Mảnh đạn: viên tròn nhỏ phát sáng
        ctx.shadowBlur = 10; ctx.shadowColor = col;
        for (const b of this.pellets) {
            if (!b.on) continue;
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(b.x, b.y, 3.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        for (const b of this.pellets) {
            if (!b.on) continue;
            ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

function bigIsFullEvo(p) { return !!p && p.weapon === 'big_bullet' && p.hasUpgrade('evo_big_1') && p.hasUpgrade('evo_big_2'); }

// Nổ phân mảnh tại tâm viên đạn
function bigFragment(owner, x, y, bulletDmg) {
    const dmg = Math.max(0.5, (bulletDmg || owner.damage || 2) * 0.35);
    bodyEffects.push(new BigBulletBurst(x, y, owner, dmg));
    explosions.push(new Explosion(x, y, 34, owner.id === 1 ? 'rgba(90, 209, 255,' : 'rgba(255, 107, 107,', 0, owner));
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
}

// Số lần nảy tối đa (Evo Bóng Cao Su: 7, Full Evo: 9) trước khi đạn tự nổ ở giữa sân
function bigMaxBounce(p) { return bigIsFullEvo(p) ? 9 : 7; }
// Gọi trong bullets.js mỗi lần đạn nảy tường
function bigOnBounce(b, owner) {
    // Càng nảy bóng càng to (đã có sẵn tăng to/dame riêng cho Full Evo trong bullets.js)
    if (!b.isFullEvoBig) { b.w = Math.min(56, (b.w || 10) + 3); b.h = Math.min(56, (b.h || 10) + 3); }
    // Full Evo: từ lần nảy thứ 2 đạn hóa Xuyên Thấu (xuyên mọi vật cản), vẫn tiếp tục nảy
    if (b.isFullEvoBig && b.bounceCount >= 2 && !b.bigPierce) { b.bigPierce = true; b.isPiercing = true; }
    // Nảy đủ số lần -> lần chạy tới giữa sân kế tiếp sẽ tự nổ
    if (owner && b.bounceCount >= bigMaxBounce(owner)) {
        b.bigFinal = true;
        b.bigMidSide = Math.sign((b.y + b.h / 2) - canvas.height / 2) || 1;
    }
}

// Theo dõi đạn Full Evo (chỉ chạy nơi mô phỏng, không nằm trong state đồng bộ)
const _bigTrack = { 1: [], 2: [] };

CharHooks.register('big_bullet', {
    setup() { _bigTrack[this.id] = []; },
    update() {
        if (typeof gameState !== 'undefined' && gameState.phase !== 'playing') return;
        const mid = canvas.height / 2, full = bigIsFullEvo(this);
        // 1. Đạn đã nảy đủ số lần chạy tới giữa sân -> tự nổ (Full Evo: nổ phân mảnh ở bước 2)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            if (b.owner !== this || b.hook !== 'big_bullet') continue;
            const side = Math.sign((b.y + b.h / 2) - mid);
            const reachedMid = b.bigFinal && (side === 0 || side !== b.bigMidSide);
            if (reachedMid || (full && b.bigPierce && b.bigDone)) {
                this.bullets.splice(i, 1);
                if (!full) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, Math.max(30, b.w * 1.2), this.id === 1 ? 'rgba(90, 209, 255,' : 'rgba(255, 107, 107,', (b.dmg || 2) * 0.5, this));
            }
        }
        if (!full) { _bigTrack[this.id] = []; return; }
        // 2. Đạn đã theo dõi nhưng không còn -> nổ phân mảnh tại vị trí cuối
        const live = new Set(this.bullets);
        for (const t of _bigTrack[this.id]) {
            if (!live.has(t.b) && t.b.owner === this) bigFragment(this, t.x, t.y, t.b.dmg);
        }
        // 3. Cập nhật danh sách theo dõi
        _bigTrack[this.id] = this.bullets.filter(b => b.isFullEvoBig && b.owner === this).map(b => ({ b, x: Math.max(0, Math.min(canvas.width, b.x + b.w / 2)), y: Math.max(0, Math.min(canvas.height, b.y + b.h / 2)) }));
    },
});

BulletHooks.register('big_bullet', {
    // Xuyên Thấu: trúng địch thì kết thúc (nổ phân mảnh)
    hit(b) { if (b.bigPierce) b.bigDone = true; },
    // Xuyên Thấu: đi xuyên vật cản (tường Sniper địch vẫn chặn — xử lý trước hook này)
    obstacle(b) { if (b.bigPierce) return 'pass'; return undefined; },
    // Quả cầu tròn phát sáng, không đuôi
    draw(b) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const r = Math.max(3, Math.min(b.w, b.h) / 2);
        const col = (b.owner && b.owner.id === 1) ? '#3498db' : '#e74c3c';
        ctx.save();
        ctx.shadowBlur = b.bigPierce ? 22 : 14; ctx.shadowColor = b.bigPierce ? '#e9d5ff' : col;
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.15, cx, cy, r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.45, col);
        g.addColorStop(1, b.bigPierce ? '#a855f7' : col);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        if (b.bigPierce) { // vành sáng nhấp nháy khi đang Xuyên Thấu
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(233, 213, 255, ${0.55 + 0.35 * Math.sin(Date.now() / 60)})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
});
