// ==========================================
// Kẻ Thu Thập (collector) — Vật triệu hồi: Bản Sao Hologram (ColHolo) + Kết liễu ĐÓNG HỘP SƯU TẦM (ColFinisher)
// Hologram: đứng trên làn của chủ, không chặn đạn, không bị chọn làm mục tiêu, thực hiện ĐÚNG 1 lượt tấn công rồi tan.
// Đạn được bắn bằng chính fireBullet() của body gốc (tạm hoán đổi weapon/vị trí/sát thương của chủ trong 1 lệnh gọi)
// -> đạn giống hệt bản gốc (băng, lửa, tên lửa, sniper...). Mọi trạng thái là trường thuần -> đồng bộ online.
// ==========================================

const COL_HOLO_KINDS = ['basic', 'big_bullet', 'ice', 'fire_cannon', 'shotgun', 'rocket', 'smg', 'lazer_auto', 'lazer_charge', 'sniper'];
// Sát thương gốc của 1 lượt (x70% hoặc x100% ở Evo 2)
const COL_HOLO_DMG = { basic: 1.2, big_bullet: 2.0, ice: 1.0, fire_cannon: 1.0, shotgun: 1.0, rocket: 1.15, smg: 0.9, lazer_auto: 1.0, lazer_charge: 3.0, sniper: 2.0 };
const COL_HOLO_COLOR = { basic: '#94a3b8', big_bullet: '#f87171', ice: '#7dd3fc', fire_cannon: '#fb923c', shotgun: '#fbbf24', rocket: '#f97316', smg: '#facc15', lazer_auto: '#22d3ee', lazer_charge: '#ff3355', sniper: '#a3e635' };
const COL_HOLO_NAME = { basic: 'CƠ BẢN', big_bullet: 'ĐẠN LỚN', ice: 'PHÁO BĂNG', fire_cannon: 'PHÁO LỬA', shotgun: 'SHOTGUN', rocket: 'TÊN LỬA', smg: 'TIỂU LIÊN', lazer_auto: 'LAZER PHÁO', lazer_charge: 'LAZER XUYÊN', sniper: 'SNIPER' };
// Evo 1 của body gốc áp lên Hologram ở Evo 2 (mặc định = evo thứ nhất trong EVOLUTIONS)
const COL_HOLO_UPS = { sniper: ['evo_sniper_2'] };
const COL_LA_CD = [18, 41, 61, 78, 92, 103, 113, 123];     // 8 tia Lazer Pháo, nhịp tăng dần

function colOwnerOf(id) { return id === 1 ? p1 : p2; }
function colSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function colUps(kind, tier) {
    const L = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[kind]) || [];
    return L.slice(0, tier >= 3 ? L.length : tier).map(e => e.id);
}
// Chạy fn với chủ "hóa thân" thành body `kind` (weapon, nâng cấp, vị trí, sát thương tạm thời), xong khôi phục.
function colAs(o, kind, ups, over, fn) {
    const sv = { weapon: o.weapon, upgrades: o.upgrades, damage: o.damage, dmgBuff: o.dmgBuff, x: o.x };
    o.weapon = kind; o.upgrades = ups;
    if (over) Object.assign(o, over);
    try { return fn(); } finally { Object.assign(o, sv); }
}

// Tia Xuyên Phá của Hologram (cột cảnh báo do scheduleHitscan lo, đây là phát bắn)
function colHoloBeam(ownerId, hx, dmg, wide) {
    const o = colOwnerOf(ownerId); if (!o || !o.bullets) return;
    const bw = wide ? 30 : 10, bx = hx - bw / 2;
    const by = o.id === 1 ? 0 : o.y + o.h, bh = o.id === 1 ? o.y : canvas.height - (o.y + o.h);
    if (typeof Beam === 'function') { const b = new Beam(bx, by, bw, bh, o.id, !!wide); b.gmHit = true; beams.push(b); }
    const e = o.id === 1 ? p2 : p1;
    if (e && e.hp > 0 && rectIntersect(bx, by, bw, bh, e.x, e.y, e.w, e.h)) {
        e.takeDamage(dmg, o);
        if (typeof fxSlashHit === 'function') fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, '#7dd3fc', 30);
    }
    colSfx('playLaser'); triggerScreenShake(3, 8);
}

class ColHolo {
    constructor(owner, x, kind) {
        this.ownerId = owner.id; this.x = x; this.y = owner.y + owner.h / 2; this.kind = kind;
        this.e2 = owner.hasUpgrade('evo_col_2');
        this.k = this.e2 ? 1 : 0.7;
        this.t = 0; this.active = true; this.shots = 0; this.ang = owner.id === 1 ? -Math.PI / 2 : Math.PI / 2; this.locked = false;
        this.end = { smg: 18 + 17 * 5 + 16, lazer_auto: 123 + 16, lazer_charge: 6 + 72 + 16, sniper: 62 }[kind] || 38;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    shot(o, mult) {
        const kind = this.kind;
        const ups = this.e2 ? (COL_HOLO_UPS[kind] || colUps(kind, 1)) : [];
        const raw = COL_HOLO_DMG[kind] * this.k;
        const n0 = o.bullets.length;
        colAs(o, kind, ups, { x: this.x - o.w / 2, damage: raw, dmgBuff: 0 }, () => o.fireBullet(mult || 1));
        return o.bullets.slice(n0);
    }
    update() {
        if (!this.active) return;
        const o = colOwnerOf(this.ownerId), e = o && (o.id === 1 ? p2 : p1);
        if (!o || o.hp <= 0 || gameState.phase !== 'playing') { this.active = false; return; }
        this.y = o.y + o.h / 2;
        const t = ++this.t, kind = this.kind;
        if (t === 1) colSfx('playClick');
        if (kind === 'sniper' && e) {
            const sx = this.x, sy = o.id === 1 ? o.y - 16 : o.y + o.h;
            if (t < 30) this.ang = Math.atan2((e.y + e.h / 2) - sy, (e.x + e.w / 2) - sx);   // theo dõi 0.5s, khóa 0.25s cuối
            else this.locked = true;
            if (t === 45) {
                const bs = this.shot(o);
                for (const b of bs) if (!b.isRaycast) {
                    const sp = Math.hypot(b.vx, b.vy) || 1; b.vx = Math.cos(this.ang) * sp; b.vy = Math.sin(this.ang) * sp;
                }
                spawnSparkParticles(sx, sy, COL_HOLO_COLOR.sniper, 8);
            }
        } else if (kind === 'smg') {
            if (t >= 18 && (t - 18) % 5 === 0 && this.shots < 18) {
                o.smgSprayCount = this.shots;
                this.shot(o); this.shots++;
            }
        } else if (kind === 'lazer_auto') {
            if (this.shots < 8 && t === COL_LA_CD[this.shots]) {
                const hot = this.e2 || this.shots >= 7;
                const bs = this.shot(o, hot ? 0.55 * 1.35 : 0.55);
                for (const b of bs) if (hot) { b.laHot = true; b.x -= 1.5; b.w += 3; }
                this.shots++;
            }
        } else if (kind === 'lazer_charge') {
            if (t === 6) {
                const hx = this.x, id = this.ownerId, dmg = COL_HOLO_DMG.lazer_charge * this.k, wide = this.e2;
                scheduleHitscan(o, 72, '#ff3355', wide ? 34 : 14, () => colHoloBeam(id, hx, dmg, wide), hx);
            }
        } else if (t === 22) {
            const bs = this.shot(o);
            if (kind === 'fire_cannon') for (const b of bs) {
                b.hook = 'fire_cannon'; b.fcBig = 1;
                b.x -= 5; b.w += 10; b.h += 10; b.vx *= 1.4; b.vy *= 1.4;
            }
        }
        if (t >= this.end) this.active = false;
    }
    draw() { if (this.active && typeof colDrawHolo === 'function') colDrawHolo(this); }
}

// ---------- Kết liễu: ĐÓNG HỘP SƯU TẦM ----------
const COLF_DUR = 230, COLF_VOLLEY = 84, COLF_DROP = 112;
class ColFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ly = owner.y + owner.h / 2;              // làn của người thắng (hàng Hologram)
        this.t = 0; this.dur = COLF_DUR; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === COLF_VOLLEY) { colSfx('playExplosion'); triggerScreenShake(8, 14); spawnSparkParticles(this.x, this.y, '#67e8f9', 24); }
        if (this.t === COLF_DROP + 10) { colSfx('playExplosion'); triggerScreenShake(14, 22); explosions.push(new Explosion(this.x, this.y, 70, 'rgba(103, 232, 249,', 0, null)); }
        if (this.t === 150) colSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof colDrawFinisher === 'function') colDrawFinisher(this); }
}
function colFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof ColFinisher && e.active) e.drawOver();
}
