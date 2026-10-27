// ==========================================
// Kẻ Thu Thập — Bảo Tàng Chiến Tranh (collector) — Logic
// Nội tại: mỗi 2–8s (Evo 2: 1.5–4.5s) mở cổng dữ liệu, triệu hồi 1 Hologram của 1 trong 10 body cơ bản (xem summons.js).
// Kỹ năng: GIỮ bắn 0.5s -> Khui Kho Vũ Khí (CD 12s, Evo 1: 6s): nạp đầy + đổi loại đạn ngẫu nhiên (10 loại, không trùng).
// Evo 1: +1 đạn, nạp nhanh 25%, sau đổi: +25% tốc 1.5s & 2 phát đầu +30% dame. Evo 2: Hologram 100% dame + hiệu ứng Evo 1,
//        mỗi lần đổi đạn gọi thêm 1 Hologram. Full: 50% gọi 2 Hologram; đạn thu thập mang hiệu ứng Full Evo của body gốc
//        (bản rút gọn: áp qua nâng cấp tạm thời lúc bắn — hiệu ứng nằm ở fireBullet/hàm bắn; hiệu ứng lúc trúng dùng bản thường).
// ==========================================

const COL_HOLD = 30, COL_CD = 720, COL_CD_E1 = 360;
const COL_GUN = ['ice', 'fire_cannon', 'big_bullet', 'shotgun', 'rocket', 'sniper', 'acid', 'kiem_su', 'cluster_gun', 'joker'];
// Số đạn / hệ số nạp / hệ số sát thương (nhân vào p.damage = 1.0) / giãn cách bắn (ms) từng loại
const COL_AMMO = { basic: 5, ice: 5, fire_cannon: 4, big_bullet: 2, shotgun: 2, rocket: 3, sniper: 5, acid: 2, kiem_su: 5, cluster_gun: 2, joker: 5 };
const COL_RELOAD = { basic: 1, ice: 1, fire_cannon: 1, big_bullet: 1.3, shotgun: 1.3, rocket: 1.2, sniper: 1.5, acid: 1.5, kiem_su: 0.9, cluster_gun: 1.4, joker: 0.9 };
const COL_DMG = { basic: 1, ice: 1, fire_cannon: 1, big_bullet: 2, shotgun: 1, rocket: 1.15, sniper: 2, acid: 0.5, kiem_su: 1, cluster_gun: 1, joker: 1 };
const COL_GAP = { sniper: 400, fire_cannon: 450, cluster_gun: 400 };
const COL_NAME = { basic: 'ĐẠN THƯỜNG', ice: 'PHÁO BĂNG', fire_cannon: 'PHÁO LỬA', big_bullet: 'ĐẠN LỚN', shotgun: 'SHOTGUN', rocket: 'TÊN LỬA', sniper: 'SNIPER', acid: 'AXIT', kiem_su: 'PHI KIẾM', cluster_gun: 'PHÂN MẢNH', joker: 'BÀI PHÓNG' };
const COL_COLOR = { basic: '#e2e8f0', ice: '#7dd3fc', fire_cannon: '#fb923c', big_bullet: '#f87171', shotgun: '#fbbf24', rocket: '#f97316', sniper: '#a3e635', acid: '#c084fc', kiem_su: '#facc15', cluster_gun: '#34d399', joker: '#f472b6' };
const COL_CYAN = '#67e8f9', COL_GOLD = '#fcd34d';

function colE1(p) { return p.hasUpgrade('evo_col_1'); }
function colE2(p) { return p.hasUpgrade('evo_col_2'); }
function colFull(p) { return colE1(p) && colE2(p) && hasFullEvo(p, 'collector'); }
function colIs(p) { return p && p.weapon === 'collector'; }
function colTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function colNextSummon(p) { return colE2(p) ? 90 + Math.floor(Math.random() * 181) : 120 + Math.floor(Math.random() * 361); }
// Nâng cấp tạm cho đạn thu thập: Full Evo mang hiệu ứng Full Evo của body gốc
function colGunUps(p, kind) { return colFull(p) ? colUps(kind, 3) : []; }

function colSummon(p, n) {
    const W = canvas.width, xs = [];
    for (let i = 0; i < n; i++) {
        let x = 30 + Math.random() * (W - 60);
        for (let tries = 0; tries < 12 && xs.some(v => Math.abs(v - x) < 70); tries++) x = 30 + Math.random() * (W - 60);
        xs.push(x);
        const kind = COL_HOLO_KINDS[Math.floor(Math.random() * COL_HOLO_KINDS.length)];
        bodyEffects.push(new ColHolo(p, x, kind));
        spawnSparkParticles(x, p.y + p.h / 2, COL_HOLO_COLOR[kind], 8);
    }
    colSfx('playClick');
}

function colApplyKind(p, kind) {
    p.colKind = kind;
    p.maxAmmo = COL_AMMO[kind] + (colE1(p) ? 1 : 0);
    p.ammo = p.maxAmmo;
    p.reloadTime = C.reloadTime * COL_RELOAD[kind] * (colE1(p) ? 0.75 : 1);
}

function colSwitch(p) {
    const pool = COL_GUN.filter(k => k !== p.colKind);
    const kind = pool[Math.floor(Math.random() * pool.length)];
    colApplyKind(p, kind);
    p.colCd = colE1(p) ? COL_CD_E1 : COL_CD;
    p.colFlash = 24;
    if (colE1(p)) { p.colSpdT = 90; p.colBoost = 2; }
    if (kind === 'fire_cannon') p.colFcUsed = true;
    if (kind === 'joker') p.colJkUsed = true;
    colTxt(p, 'KHUI KHO: ' + COL_NAME[kind], COL_COLOR[kind], 12);
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 36, 'rgba(103, 232, 249,', 0, null));
    colSfx('playPowerup');
    if (colE2(p)) colSummon(p, 1);
}

function colFire(p, now) {
    const kind = p.colKind || 'basic', ups = colGunUps(p, kind);
    const n0 = p.bullets.length;
    let selfAmmo = true;
    colAs(p, kind, ups, null, () => {
        if (kind === 'kiem_su') ksFire(p);
        else if (kind === 'cluster_gun') { cgFire(p, now); selfAmmo = false; }
        else if (kind === 'joker') jkSpawnCard(p, ['H', 'D', 'C', 'S'][Math.floor(Math.random() * 4)], 0, 1);
        else if (kind === 'fire_cannon') {
            p.fcShots = (p.fcShots || 0) + 1;
            const big = p.fcShots % 3 === 0;
            p.fireBullet(COL_DMG[kind]);
            for (let i = n0; i < p.bullets.length; i++) {
                const b = p.bullets[i];
                b.hook = 'fire_cannon';
                if (big) { b.fcBig = 1; b.x -= 5; b.w += 10; b.h += 10; b.vx *= 1.4; b.vy *= 1.4; }
            }
        } else p.fireBullet(COL_DMG[kind]);
    });
    if (p.colBoost > 0) {
        for (let i = n0; i < p.bullets.length; i++) p.bullets[i].dmg *= 1.3;
        p.colBoost--;
    }
    if (selfAmmo) p.ammo--;
    p.lastShot = now;
}

CharHooks.register('collector', {
    setup() {
        this.colKind = 'basic'; this.colCd = 0; this.colHold = 0; this.colPrevS = false; this.colUsed = false;
        this.colSpdT = 0; this.colBoost = 0; this.colFlash = 0; this.colFcUsed = false; this.colJkUsed = false;
        this.colSumT = colNextSummon(this); this.colGate = 0;
        colApplyKind(this, 'basic');
    },
    update() {
        if (this.colCd > 0) this.colCd--;
        if (this.colSpdT > 0) this.colSpdT--;
        if (this.colFlash > 0) this.colFlash--;
        if (this.colGate > 0) this.colGate--;
        // nội tại: gọi Hologram
        if (this.hp > 0 && gameState.phase === 'playing' && --this.colSumT <= 0) {
            this.colSumT = colNextSummon(this);
            this.colGate = 20;
            colSummon(this, colFull(this) && Math.random() < 0.5 ? 2 : 1);
        }
        // các bộ đếm riêng của đạn mượn từ body khác
        if (typeof cgUpdateBullets === 'function' && this.bullets.some(b => b.hook === 'cluster_gun')) colAs(this, 'cluster_gun', colGunUps(this, 'cluster_gun'), null, () => cgUpdateBullets(this));
        if (this.colFcUsed && CharHooks.registry.fire_cannon && CharHooks.registry.fire_cannon.update) CharHooks.registry.fire_cannon.update.call(this);
        if (this.colJkUsed && typeof jkTickEnemy === 'function') jkTickEnemy(this);
    },
    speed(cur) { return this.colSpdT > 0 ? cur * 1.25 : cur; },
    shoot(inp, now) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.colHold = 0; this.colPrevS = s; return true; }
        if (s) {
            this.colHold++;
            if (this.colHold >= COL_HOLD && !this.colUsed) {
                this.colUsed = true;
                if (this.colCd <= 0) colSwitch(this);
                else colTxt(this, 'HỒI ' + Math.ceil(this.colCd / 60) + 's', '#94a3b8', 10);
            }
        } else {
            if (this.colPrevS && !this.colUsed && this.ammo > 0 && now - this.lastShot > (COL_GAP[this.colKind] || 250)) colFire(this, now);
            this.colHold = 0; this.colUsed = false;
        }
        this.colPrevS = s;
        return true;
    },
});

// Kết liễu ĐÓNG HỘP SƯU TẦM
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = orig.call(this, amount, attacker, options);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && colIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new ColFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Bot: 'switch' | 'tap' | null ----------
function colBotAction(bot, enemy, aligned) {
    if (!enemy || !(enemy.hp > 0)) return null;
    if (bot.colCd <= 0 && (bot.ammo <= 0 || (bot.colKind === 'basic' && Math.random() < 0.02))) return 'switch';
    return aligned && bot.ammo > 0 ? 'tap' : null;
}
