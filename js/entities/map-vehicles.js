// ==========================================
// Xe đặc biệt trên bản đồ (ngoài Xe Tiền) + 3 loại Thùng mới
// ------------------------------------------
// XE (nằm chung mảng moneyTrucks, kế thừa MoneyTruck -> mọi đòn đánh/phá xe sẵn có đều dùng được):
//   - XE BUFF ST  (buff): phá được -> người phá +1.5 sát thương trong 10s (mạnh hơn Thùng ST +1).
//   - XE HỒI MÁU  (heal): rất trâu; phá -> nổ ra nhiều cục hồi máu rơi dần về 2 làn, ai chạm thì ăn.
//   - XE TẤN CÔNG (atk): thù địch với CẢ 2 người chơi, ngắm & bắn (biến thể: pháo / smg / lazer có
//     cảnh báo, tia bị Tường Sniper chặn). Phá chỉ được ~$20.
//   Máu xe tăng dần theo hiệp; phá xe nào cũng có chút tiền.
//   Người phá được xác định tập trung: setter hp ghi lại số tiền 2 bên lúc xe "chết", lượt update kế tiếp
//   so sánh xem bên nào vừa được cộng tiền (mọi đường phá xe tiền đều cộng tiền) -> trả về đúng phần
//   thưởng của xe đặc biệt + kích hoạt hiệu ứng.
// THÙNG: Băng (frost), Miễn Nhiễm (immune), Tốc (haste) — xử lý trong crateOnBreak (mọi đường phá thùng).
// Toàn bộ trạng thái là trường thuần (host mô phỏng, guest chỉ vẽ).
// ==========================================

const MV_KINDS = {
    buff: { hp: 7, reward: 15, speed: 1.35, w: 46, h: 26, c: '#ff2bd6', name: 'XE BUFF ST' },
    heal: { hp: 16, reward: 20, speed: 0.7, w: 54, h: 32, c: '#22ff88', name: 'XE HỒI MÁU' },
    atk: { hp: 9, reward: 20, speed: 0.8, w: 48, h: 30, c: '#ff3b3b', name: 'XE TẤN CÔNG' },
};
const MV_ATK_VARIANTS = ['cannon', 'smg', 'laser'];
const MV_BUFF_DMG = 1.5, MV_BUFF_T = 600;
const MV_HASTE_T = 300, MV_HASTE_MULT = 1.4;
let mvDyingVeh = null; // xe đặc biệt vừa "chết" (để body Tiến Hóa không nhận nhầm thưởng Xe Tiền)

function mvPlayerById(id) { return id === 1 ? p1 : (id === 2 ? p2 : null); }
function mvSfx(fn) { try { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[fn]) soundSystem[fn](); } catch (e) { } }
function mvTxt(p, text, col, size) { if (p) addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 18, text, col, size || 13); }
function mvAddCoins(p, m) { if (!p) return; if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m; }

class MapVehicle extends MoneyTruck {
    constructor(kind) {
        super();
        const k = MV_KINDS[kind] ? kind : 'buff';
        const K = MV_KINDS[k];
        this.id = 'mv_' + Math.random().toString(36).substr(2, 9);
        this.kind = k;
        this.w = K.w; this.h = K.h;
        const round = Math.max(1, (typeof gameState !== 'undefined' && gameState.round) || 1);
        this._hp = K.hp * (1 + 0.25 * (round - 1));
        this.maxHp = this._hp;
        this.speed = K.speed;
        this.x = this.dir === 1 ? -K.w - 10 : canvas.width + 10;
        this.variant = k === 'atk' ? MV_ATK_VARIANTS[Math.floor(Math.random() * MV_ATK_VARIANTS.length)] : '';
        this.fireCd = 80; this.burst = 0; this.burstT = 0; this.tgt = 0;
        this.warnT = 0; this.lockX = 0; this.lockY = 0; this.beamT = 0; this.beamEndY = 0;
        this.ang = this.dir === 1 ? 0 : Math.PI; this.hitFx = 0;
        this.t = 0;
    }
    get hp() { return this._hp; }
    set hp(v) {
        const was = this._hp;
        this._hp = v;
        if (was > 0 && !(v > 0) && !this._dead) {
            this._dead = true;
            this._c1 = gameState.p1Coins; this._c2 = gameState.p2Coins;
            mvDyingVeh = this;
        } else if (v < was) this.hitFx = 6;
    }
    update() {
        if (this._dead || !(this._hp > 0)) { this.active = false; if (!this._resolved) this.resolveDeath(); return; }
        if (!this.active) return;
        this.t++;
        if (this.hitFx > 0) this.hitFx--;
        const moving = !(this.warnT > 0 || this.beamT > 0);
        if (moving) this.x += this.speed * this.dir;
        if (this.kind === 'atk') this.updateAttack();
        if ((this.dir === 1 && this.x > canvas.width + 10) || (this.dir === -1 && this.x < -this.w - 20)) this.active = false;
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
    updateAttack() {
        if (this.beamT > 0) this.beamT--;
        const tgt = mvPlayerById(this.tgt);
        if (tgt && tgt.hp > 0) {
            const a = Math.atan2(tgt.y + tgt.h / 2 - this.cy(), tgt.x + tgt.w / 2 - this.cx());
            let d = a - this.ang; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
            if (!(this.warnT > 0)) this.ang += d * 0.15;
        }
        if (gameState.phase !== 'playing') return;
        const onScreen = this.x > 0 && this.x + this.w < canvas.width;
        // Lazer: cảnh báo -> khai hỏa
        if (this.warnT > 0) {
            if (--this.warnT === 0) this.fireLaser();
            return;
        }
        // SMG đang xả loạt
        if (this.burst > 0) {
            if (--this.burstT <= 0) {
                this.burstT = 7; this.burst--;
                if (tgt && tgt.hp > 0) this.shoot('smg', tgt, 4.6, 0.25, (Math.random() - 0.5) * 0.12);
            }
            return;
        }
        if (--this.fireCd > 0 || !onScreen) return;
        const alive = [p1, p2].filter(p => p && p.hp > 0);
        if (!alive.length) return;
        const t = alive[Math.floor(Math.random() * alive.length)];
        this.tgt = t.id;
        if (this.variant === 'cannon') {
            this.fireCd = 130;
            this.shoot('shell', t, 3.0, 0.9, 0);
            mvSfx('playShoot');
        } else if (this.variant === 'smg') {
            this.fireCd = 160; this.burst = 5; this.burstT = 0;
        } else {
            this.fireCd = 210;
            this.lockX = t.x + t.w / 2; this.lockY = t.y + t.h / 2;
            this.ang = Math.atan2(this.lockY - this.cy(), this.lockX - this.cx());
            this.warnT = 50; // 0.83s cảnh báo
            mvSfx('playClick');
        }
    }
    shoot(kind, t, spd, dmg, spread) {
        const sx = this.cx() + Math.cos(this.ang) * 14, sy = this.cy() + Math.sin(this.ang) * 14;
        let a = Math.atan2(t.y + t.h / 2 - sy, t.x + t.w / 2 - sx) + spread;
        bodyEffects.push(new MvShot(kind, sx, sy, Math.cos(a) * spd, Math.sin(a) * spd, dmg));
    }
    fireLaser() {
        const sx = this.cx(), sy = this.cy();
        const dirY = this.lockY > sy ? 1 : -1;
        let endY = this.lockY + dirY * 30;
        if (typeof sniperWallBlockY === 'function') {
            const wall = sniperWallBlockY(null, this.lockX, sy, dirY, 6, 1);
            if (wall) { const wy = sniperWallStopY(wall, dirY); if ((wy - sy) * dirY < (endY - sy) * dirY) endY = wy; }
        }
        this.beamEndY = endY; this.beamT = 16;
        const ex = sx + (this.lockX - sx) * ((endY - sy) / (this.lockY - sy || 1));
        this.beamEndX = ex;
        for (const p of [p1, p2]) {
            if (!p || p.hp <= 0) continue;
            const py = p.y + p.h / 2;
            const tt = (py - sy) / ((endY - sy) || 1);
            if (tt < 0 || tt > 1) continue;
            const lx = sx + (ex - sx) * tt;
            if (Math.abs(lx - (p.x + p.w / 2)) < p.w / 2 + 6) {
                p.takeDamage(1.2, null, { isEnvironmental: true });
                spawnSparkParticles(lx, py, '#ff4d6d', 10);
            }
        }
        explosions.push(new Explosion(ex, endY, 22, 'rgba(255,60,90,', 0, null));
        mvSfx('playLaser');
        triggerScreenShake(3, 6);
    }
    resolveDeath() {
        this._resolved = true;
        if (mvDyingVeh === this) mvDyingVeh = null;
        const d1 = (this._c1 === undefined) ? 0 : gameState.p1Coins - this._c1;
        const d2 = (this._c2 === undefined) ? 0 : gameState.p2Coins - this._c2;
        let killer = null, d = 0;
        if (d1 > 0 && d1 >= d2) { killer = p1; d = d1; } else if (d2 > 0) { killer = p2; d = d2; }
        if (!killer) killer = this.nearestShooter();
        else mvAddCoins(killer, -Math.min(d, 100)); // bỏ phần thưởng Xe Tiền mặc định
        const K = MV_KINDS[this.kind];
        const cx = this.cx(), cy = this.cy();
        explosions.push(new Explosion(cx, cy, 55, this.kind === 'heal' ? 'rgba(34,255,136,' : (this.kind === 'buff' ? 'rgba(255,43,214,' : 'rgba(255,59,59,'), 0, null));
        spawnSparkParticles(cx, cy, K.c, 18);
        triggerScreenShake(4, 8);
        if (killer) {
            const m = K.reward * (killer.weapon === 'money_tank' ? 2 : 1);
            mvAddCoins(killer, m);
            addFloatingText(cx, cy - 14, `+$${m}`, '#facc15', 13);
        }
        if (this.kind === 'buff' && killer) mvGrantDmgBuff(killer);
        if (this.kind === 'heal') bodyEffects.push(new MvHealOrbs(cx, cy, 14));
        if (this.kind === 'atk') addFloatingText(cx, cy + 6, 'XE TẤN CÔNG BỊ HẠ!', '#ff6b6b', 12);
        if (killer && killer.weapon === 'evolution' && killer.onEvolutionCrateEat) killer.onEvolutionCrateEat('v_' + this.kind);
    }
    nearestShooter() {
        let best = null, bd = 1e9;
        const cx = this.cx(), cy = this.cy();
        for (const p of [p1, p2]) {
            if (!p || !p.bullets) continue;
            for (const b of p.bullets) { const dd = Math.hypot(b.x - cx, b.y - cy); if (dd < bd) { bd = dd; best = p; } }
        }
        return bd < 120 ? best : null;
    }
}

function mvGrantDmgBuff(p) {
    if (!(p.mvDmgT > 0)) { p.mvDmgAmt = MV_BUFF_DMG; p.dmgBuff = (p.dmgBuff || 0) + MV_BUFF_DMG; }
    p.mvDmgT = MV_BUFF_T;
    mvTxt(p, `CUỒNG NỘ +${MV_BUFF_DMG} ST (10s) ⚔`, '#ff2bd6', 14);
    mvAura(p, 'dmg');
    mvSfx('playPowerup');
}
function mvAura(p, kind) {
    if (!p || bodyEffects.some(e => e instanceof MvAura && e.pid === p.id && e.kind === kind && e.active)) return;
    bodyEffects.push(new MvAura(p.id, kind));
}

// Đạn của Xe Tấn Công (trúng cả 2 người chơi, bị Tường Sniper chặn)
class MvShot {
    constructor(kind, x, y, vx, vy, dmg) {
        this.kind = kind; this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.dmg = dmg;
        this.r = kind === 'shell' ? 6 : 3; this.life = 360; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx; this.y += this.vy;
        if (--this.life <= 0 || this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) { this.active = false; return; }
        const r = this.r;
        if (typeof sniperWalls !== 'undefined') for (const w of sniperWalls) {
            if (w && w.active && rectIntersect(this.x - r, this.y - r, r * 2, r * 2, w.x, w.y, w.w, w.h)) {
                w.hitFlash = 8; spawnSparkParticles(this.x, this.y, '#e0f7ff', 6); this.active = false; return;
            }
        }
        for (const p of [p1, p2]) {
            if (!p || p.hp <= 0) continue;
            if (rectIntersect(this.x - r, this.y - r, r * 2, r * 2, p.x, p.y, p.w, p.h)) {
                p.takeDamage(this.dmg, null, { isEnvironmental: true });
                if (this.kind === 'shell') explosions.push(new Explosion(this.x, this.y, 30, 'rgba(255,140,40,', 0, null));
                spawnSparkParticles(this.x, this.y, this.kind === 'shell' ? '#ff9f1a' : '#ff4d4d', 6);
                this.active = false; return;
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const a = Math.atan2(this.vy, this.vx);
        if (this.kind === 'shell') {
            ctx.strokeStyle = 'rgba(255,140,40,0.45)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(this.x - Math.cos(a) * 16, this.y - Math.sin(a) * 16); ctx.lineTo(this.x, this.y); ctx.stroke();
            ctx.shadowBlur = 14; ctx.shadowColor = '#ff8c28';
            ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 0.45, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.shadowBlur = 8; ctx.shadowColor = '#ff3b3b';
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(this.x - Math.cos(a) * 9, this.y - Math.sin(a) * 9); ctx.lineTo(this.x, this.y); ctx.stroke();
            ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

// Cục hồi máu văng ra từ Xe Hồi Máu: bay tung ra rồi trôi dần về làn gần nhất, ai chạm thì hồi máu
class MvHealOrbs {
    constructor(x, y, n) {
        this.active = true; this.life = 660; this.heal = 0.35;
        this.orbs = [];
        for (let i = 0; i < n; i++) {
            const a = i * Math.PI * 2 / n + Math.random() * 0.4, s = 2 + Math.random() * 1.8;
            this.orbs.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, on: true, ph: Math.random() * 6 });
        }
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        let alive = 0;
        for (const o of this.orbs) {
            if (!o.on) continue;
            o.vx *= 0.94; o.vy *= 0.94;
            const lane = o.y > canvas.height / 2 ? p1 : p2;
            if (lane) {
                const ty = lane.y + lane.h / 2;
                const dy = ty - o.y;
                if (Math.abs(dy) > 1.5) o.y += Math.sign(dy) * Math.min(Math.abs(dy), 1.3);
            }
            o.x = Math.max(8, Math.min(canvas.width - 8, o.x + o.vx));
            o.y += o.vy;
            for (const p of [p1, p2]) {
                if (!p || p.hp <= 0) continue;
                if (rectIntersect(o.x - 7, o.y - 7, 14, 14, p.x, p.y, p.w, p.h)) {
                    o.on = false;
                    p.hp = Math.min(p.maxHp, p.hp + this.heal);
                    addFloatingText(o.x, o.y - 10, `+${this.heal} HP`, '#4ade80', 11);
                    spawnSparkParticles(o.x, o.y, '#22ff88', 6);
                    break;
                }
            }
            if (o.on) alive++;
        }
        if (!alive) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const t = Date.now();
        ctx.save();
        if (this.life < 120 && Math.floor(t / 110) % 2 === 0) ctx.globalAlpha = 0.45;
        for (const o of this.orbs) {
            if (!o.on) continue;
            const pr = 6 + Math.sin(t / 160 + o.ph) * 1.2;
            ctx.shadowBlur = 14; ctx.shadowColor = '#22ff88';
            ctx.fillStyle = 'rgba(34,255,136,0.25)'; ctx.beginPath(); ctx.arc(o.x, o.y, pr + 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0b2a1a'; ctx.beginPath(); ctx.arc(o.x, o.y, pr, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.6; ctx.stroke();
            ctx.shadowBlur = 0; ctx.fillStyle = '#bbf7d0';
            ctx.fillRect(o.x - 1.1, o.y - 3.6, 2.2, 7.2); ctx.fillRect(o.x - 3.6, o.y - 1.1, 7.2, 2.2);
        }
        ctx.restore();
    }
}

// Hào quang trạng thái trên xe người chơi (ST cuồng nộ / Tốc / Miễn nhiễm / Băng)
class MvAura {
    constructor(pid, kind) { this.pid = pid; this.kind = kind; this.active = true; }
    on(p) {
        if (!p) return false;
        if (this.kind === 'dmg') return p.mvDmgT > 0;
        if (this.kind === 'haste') return p.mvHasteT > 0;
        if (this.kind === 'immune') return p.mvImmune > 0;
        if (this.kind === 'frost') return p.mvFrostT > 0;
        return false;
    }
    update() { if (!this.on(mvPlayerById(this.pid))) this.active = false; }
    draw() {
        const p = mvPlayerById(this.pid);
        if (!this.active || !p || !this.on(p)) return;
        const t = Date.now(), cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = Math.max(p.w, p.h) * 0.75;
        ctx.save();
        if (this.kind === 'dmg') {
            ctx.strokeStyle = '#ff2bd6'; ctx.shadowBlur = 12; ctx.shadowColor = '#ff2bd6'; ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t / 30;
            ctx.beginPath(); ctx.arc(cx, cy, R + Math.sin(t / 120) * 1.5, 0, Math.PI * 2); ctx.stroke();
        } else if (this.kind === 'haste') {
            ctx.strokeStyle = 'rgba(56,240,255,0.8)'; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = '#38f0ff';
            for (let i = 0; i < 3; i++) {
                const off = ((t / 60 + i * 7) % 21) - 10;
                ctx.beginPath(); ctx.moveTo(p.x - 4, cy + off); ctx.lineTo(p.x - 12, cy + off); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(p.x + p.w + 4, cy - off); ctx.lineTo(p.x + p.w + 12, cy - off); ctx.stroke();
            }
        } else if (this.kind === 'immune') {
            ctx.strokeStyle = 'rgba(253,230,138,0.9)'; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = '#fde68a';
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + t / 1500; ctx.lineTo(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2)); }
            ctx.stroke();
            for (let i = 0; i < p.mvImmune; i++) {
                const a = t / 500 + i * Math.PI * 2 / 3;
                ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2), 2.6, 0, Math.PI * 2); ctx.fill();
            }
        } else if (this.kind === 'frost') {
            ctx.fillStyle = 'rgba(125,211,252,0.22)'; ctx.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
            ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 1.4; ctx.shadowBlur = 8; ctx.shadowColor = '#7dd3fc';
            for (let i = 0; i < 4; i++) {
                const a = i * Math.PI / 2 + t / 900, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
                for (let k = 0; k < 3; k++) { const b = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(b) * 3.5, y - Math.sin(b) * 3.5); ctx.lineTo(x + Math.cos(b) * 3.5, y + Math.sin(b) * 3.5); ctx.stroke(); }
            }
        }
        ctx.restore();
    }
}

// Sinh xe đặc biệt (host). Tần suất vừa phải: tối đa 1 xe (Rush Hour: 2) cùng lúc.
function mvSpawnTick() {
    if (typeof gameState === 'undefined' || gameState.phase !== 'playing') return;
    const n = moneyTrucks.filter(t => t.active && t instanceof MapVehicle).length;
    const cap = gameState.currentMap === 'rush_hour' ? 2 : 1;
    if (n >= cap || Math.random() >= 0.0011) return;
    const r = Math.random();
    moneyTrucks.push(new MapVehicle(r < 0.35 ? 'buff' : (r < 0.6 ? 'heal' : 'atk')));
}

// ---------- 3 Thùng mới (gọi từ crateOnBreak) ----------
function mvCrateBreak(c, p) {
    if (!c || !p || typeof p.takeDamage !== 'function') return;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    if (c.type === 'frost') {
        const en = p === p1 ? p2 : p1;
        explosions.push(new Explosion(cx, cy, 60, 'rgba(125,211,252,', 0, null));
        spawnSparkParticles(cx, cy, '#bae6fd', 16);
        if (en && en.hp > 0) {
            en.freezeTimer = Math.max(en.freezeTimer || 0, 36);
            en.mvFrostT = Math.max(en.mvFrostT || 0, 120);
            explosions.push(new Explosion(en.x + en.w / 2, en.y + en.h / 2, 40, 'rgba(125,211,252,', 0, null));
            mvTxt(en, 'ĐÓNG BĂNG! ❄', '#7dd3fc', 14);
            mvAura(en, 'frost');
        }
        mvTxt(p, 'THÙNG BĂNG ❄', '#bae6fd', 12);
    } else if (c.type === 'immune') {
        p.mvImmune = 3;
        mvTxt(p, 'MIỄN NHIỄM ×3 ⛨', '#fde68a', 14);
        mvAura(p, 'immune');
        explosions.push(new Explosion(cx, cy, 34, 'rgba(253,230,138,', 0, null));
    } else if (c.type === 'haste') {
        p.mvHasteT = MV_HASTE_T;
        mvTxt(p, 'TĂNG TỐC +40% (5s) »', '#38f0ff', 14);
        mvAura(p, 'haste');
        explosions.push(new Explosion(cx, cy, 34, 'rgba(56,240,255,', 0, null));
    } else return;
    if (p.weapon === 'evolution' && p.onEvolutionCrateEat) p.onEvolutionCrateEat('c_' + c.type);
}

// ---------- Miễn nhiễm hiệu ứng bất lợi ----------
const MV_DEBUFF_FIELDS = ['freezeTimer', 'stunTimer', 'rootTimer', 'slowTimer', 'acidZoneSlow', 'djSlowT', 'cnSlowT',
    'silenceTimer', 'blindTimer', 'confusionStacks', 'confusionTimer', 'bindingCurseTimer', 'magSealTimer', 'mvFrostT',
    'speedDebuffTimer', 'bleedTimer', 'burnTimer', 'acidBurnTimer'];
function mvCleanse(p) {
    if (!p || !(p.mvImmune > 0 || p.mvImmGrace > 0)) return;
    let found = false;
    for (const f of MV_DEBUFF_FIELDS) if (p[f] > 0) { p[f] = 0; found = true; }
    if (p.burnStacks > 0 && !(p.burnTimer > 0)) p.burnStacks = 0;
    if (p.isFrozen) { p.isFrozen = false; found = true; }
    if (p.bindingCurseStacks > 0) { p.bindingCurseStacks = 0; found = true; }
    if (p._nextSpeedMult !== undefined && p._nextSpeedMult < 0.999) { p._nextSpeedMult = 1; found = true; }
    if (p._nextVuln > 0) { p._nextVuln = 0; found = true; }
    if (found && !(p.mvImmGrace > 0)) {
        p.mvImmune--; p.mvImmGrace = 45; // 0.75s ân hạn: hiệu ứng dai dẳng (vùng chậm...) chỉ tốn 1 lượt
        mvTxt(p, `MIỄN NHIỄM! (${p.mvImmune})`, '#fde68a', 13);
        spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#fde68a', 10);
    }
}

(function () {
    const origUpd = Player.prototype.update;
    Player.prototype.update = function () {
        if (this.mvImmGrace > 0) this.mvImmGrace--;
        mvCleanse(this);
        if (this.mvDmgT > 0 && --this.mvDmgT <= 0) {
            this.dmgBuff = Math.max(0, (this.dmgBuff || 0) - (this.mvDmgAmt || 0)); this.mvDmgAmt = 0;
        }
        if (this.mvHasteT > 0) this.mvHasteT--;
        if (this.mvFrostT > 0) { this.mvFrostT--; addStatusSlow(this, 0.6); }
        if (this.mvFrostCd > 0) this.mvFrostCd--;
        return origUpd.apply(this, arguments);
    };
    const origCommit = commitStatuses;
    commitStatuses = function (p) {
        mvCleanse(p);
        const r = origCommit(p);
        if (p && p.mvHasteT > 0) p.statusSpeedMult = (p.statusSpeedMult === undefined ? 1 : p.statusSpeedMult) * MV_HASTE_MULT;
        return r;
    };
    const origSetup = Player.prototype.setupForNewRound;
    Player.prototype.setupForNewRound = function () {
        const r = origSetup.apply(this, arguments);
        this.mvDmgT = 0; this.mvDmgAmt = 0; this.mvHasteT = 0; this.mvFrostT = 0; this.mvImmune = 0; this.mvImmGrace = 0;
        // Tiến Hóa: mỗi 2 Thùng Miễn Nhiễm đã ăn -> bắt đầu hiệp với 1 lượt miễn nhiễm (tối đa 3)
        const b = this.weapon === 'evolution' && this.evolutionPermanentBonus;
        if (b && b.immune >= 2) this.mvImmune = Math.min(3, Math.floor(b.immune / 2));
        return r;
    };
    // Tiến Hóa: Thùng Băng tích luỹ -> đòn đánh có tỉ lệ làm chậm
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const hp0 = this.hp;
        const r = origTD.apply(this, arguments);
        const b = attacker && attacker !== this && attacker.weapon === 'evolution' && attacker.evolutionPermanentBonus;
        if (b && b.frost > 0 && this.hp < hp0 && !(attacker.mvFrostCd > 0) && Math.random() < Math.min(0.3, b.frost)) {
            attacker.mvFrostCd = 30;
            this.mvFrostT = Math.max(this.mvFrostT || 0, 50);
            mvAura(this, 'frost');
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#bae6fd', 8);
        }
        return r;
    };
})();

// ---------- HUD chip ----------
if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(
        p => p.mvDmgT > 0 ? { g: 'up', c: '#ff2bd6', l: 'CUỒNG', t: sec(p.mvDmgT) } : null,
        p => p.mvHasteT > 0 ? { g: 'up', c: '#38f0ff', l: 'TỐC', t: sec(p.mvHasteT) } : null,
        p => p.mvImmune > 0 ? { g: 'guard', c: '#fde68a', l: 'MIỄN×' + p.mvImmune, t: '' } : null,
    );
}

// ---------- Hình ảnh thùng mới ----------
if (typeof CRATE_STYLE !== 'undefined') {
    CRATE_STYLE.frost = { c: '#7dd3fc', icon: 'snow' };
    CRATE_STYLE.immune = { c: '#fde68a', icon: 'ward' };
    CRATE_STYLE.haste = { c: '#38f0ff', icon: 'bolt' };
    const origIcon = drawCrateIcon;
    drawCrateIcon = function (icon, s, col) {
        if (icon === 'snow') {
            ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
            for (let i = 0; i < 3; i++) {
                ctx.save(); ctx.rotate(i * Math.PI / 3);
                ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s);
                ctx.moveTo(-s * 0.35, -s * 0.75); ctx.lineTo(0, -s * 0.45); ctx.lineTo(s * 0.35, -s * 0.75);
                ctx.moveTo(-s * 0.35, s * 0.75); ctx.lineTo(0, s * 0.45); ctx.lineTo(s * 0.35, s * 0.75);
                ctx.stroke(); ctx.restore();
            }
        } else if (icon === 'ward') {
            ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2; ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); }
            ctx.closePath(); ctx.stroke();
            ctx.font = `bold ${Math.round(s * 1.1)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('3', 0, 1); ctx.textBaseline = 'alphabetic';
        } else if (icon === 'bolt') {
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.moveTo(s * 0.25, -s); ctx.lineTo(-s * 0.55, s * 0.12); ctx.lineTo(-s * 0.02, s * 0.12);
            ctx.lineTo(-s * 0.3, s); ctx.lineTo(s * 0.6, -s * 0.2); ctx.lineTo(s * 0.05, -s * 0.2); ctx.closePath(); ctx.fill();
        } else origIcon(icon, s, col);
    };
}

// ---------- Hình ảnh xe đặc biệt (neon) ----------
MapVehicle.prototype.draw = function () {
    if (!this.active) return;
    const K = MV_KINDS[this.kind] || MV_KINDS.buff;
    const x = this.x, y = this.y, w = this.w, h = this.h, d = this.dir || 1, t = Date.now();
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save();
    // Lazer: cảnh báo + tia
    if (this.kind === 'atk' && this.warnT > 0) {
        const blink = Math.floor(t / 80) % 2 === 0;
        ctx.strokeStyle = blink ? 'rgba(255,40,80,0.95)' : 'rgba(255,40,80,0.45)';
        ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(this.lockX, this.lockY); ctx.stroke(); ctx.setLineDash([]);
        const k = this.warnT / 50;
        ctx.strokeStyle = '#ff2850'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.lockX, this.lockY, 8 + k * 18, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,40,80,0.18)'; ctx.beginPath(); ctx.arc(this.lockX, this.lockY, 14, 0, Math.PI * 2); ctx.fill();
    }
    if (this.kind === 'atk' && this.beamT > 0) {
        const k = this.beamT / 16;
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(255,40,90,${0.5 * k})`; ctx.lineWidth = 16 * k;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(this.beamEndX, this.beamEndY); ctx.stroke();
        ctx.strokeStyle = `rgba(255,230,240,${k})`; ctx.lineWidth = 4 * k;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(this.beamEndX, this.beamEndY); ctx.stroke();
    }
    // bóng + bánh xe
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(cx, y + h + 2, w * 0.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    const wheels = this.kind === 'heal' ? [0.16, 0.5, 0.84] : [0.22, 0.78];
    wheels.forEach(f => {
        ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(x + w * f, y + h - 1, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = K.c; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + w * f, y + h - 1, 3, t / 80 * d, t / 80 * d + 4); ctx.stroke();
    });
    // thân
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    if (this.kind === 'buff') { g.addColorStop(0, '#5b0b4f'); g.addColorStop(1, '#1e0320'); }
    else if (this.kind === 'heal') { g.addColorStop(0, '#0f3d2a'); g.addColorStop(1, '#04140c'); }
    else { g.addColorStop(0, '#4a0a0a'); g.addColorStop(1, '#160303'); }
    ctx.fillStyle = g;
    ctx.shadowBlur = 12 + (this.hitFx > 0 ? 8 : 0); ctx.shadowColor = K.c;
    roundRectPath(x, y, w, h - 4, this.kind === 'atk' ? 3 : 6); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.hitFx > 0 ? '#fff' : K.c; ctx.lineWidth = 1.8; ctx.stroke();
    // ca-bin + đèn
    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(d === 1 ? x + w - 9 : x + 3, y + 5, 6, 7);
    ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 8; ctx.shadowColor = '#fef08a';
    ctx.beginPath(); ctx.arc(d === 1 ? x + w : x, y + h - 10, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    const lx = cx - d * 4, ly = y + (h - 4) / 2;
    if (this.kind === 'buff') {
        // vệt neon chạy + biểu tượng kiếm
        ctx.strokeStyle = 'rgba(255,43,214,0.7)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { const o = ((t / 40 + i * 9) % 26); ctx.beginPath(); ctx.moveTo(x + 4 + o, y + h - 7); ctx.lineTo(x + 10 + o, y + 3); ctx.stroke(); }
        ctx.save(); ctx.translate(lx, ly); ctx.shadowBlur = 10; ctx.shadowColor = '#ff2bd6';
        drawCrateIcon('sword', 7.5, '#ffd1f5'); ctx.restore();
    } else if (this.kind === 'heal') {
        // giáp dày + chữ thập phát sáng
        ctx.fillStyle = 'rgba(34,255,136,0.18)';
        for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + i * (w - 8) / 4, y + 3, (w - 8) / 4 - 3, h - 10);
        const pr = 1 + Math.sin(t / 200) * 0.12;
        ctx.save(); ctx.translate(lx, ly); ctx.scale(pr, pr); ctx.shadowBlur = 14; ctx.shadowColor = '#22ff88';
        drawCrateIcon('cross', 8, '#bbf7d0'); ctx.restore();
    } else {
        // tháp pháo xoay theo mục tiêu
        ctx.save(); ctx.translate(cx, cy - 2); ctx.rotate(this.ang || 0);
        ctx.shadowBlur = 8; ctx.shadowColor = K.c;
        if (this.variant === 'cannon') { ctx.fillStyle = '#ff9f43'; ctx.fillRect(4, -3.5, 18, 7); ctx.fillStyle = '#ffd6a5'; ctx.fillRect(19, -4.5, 4, 9); }
        else if (this.variant === 'smg') { ctx.fillStyle = '#ffd166'; ctx.fillRect(4, -4, 16, 2.6); ctx.fillRect(4, 1.4, 16, 2.6); }
        else {
            ctx.fillStyle = '#ff4d8d'; ctx.fillRect(4, -2.5, 15, 5);
            ctx.fillStyle = this.warnT > 0 ? '#ffffff' : '#ff9ec4'; ctx.beginPath(); ctx.arc(20, 0, 3 + (this.warnT > 0 ? Math.sin(t / 40) : 0), 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#2a0606'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = K.c; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.fillStyle = K.c; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // vạch cảnh báo
        ctx.fillStyle = 'rgba(255,200,0,0.65)';
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 3 + i * (w - 6) / 5, y + h - 8, (w - 6) / 10, 3);
    }
    // thanh máu + tên
    const pct = Math.max(0, Math.min(1, this.hp / (this.maxHp || 1)));
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 2, y - 8, w - 4, 4);
    ctx.fillStyle = K.c; ctx.fillRect(x + 2, y - 8, (w - 4) * pct, 4);
    ctx.fillStyle = K.c; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
    const lbl = this.kind === 'atk' ? (this.variant === 'cannon' ? 'PHÁO' : this.variant === 'smg' ? 'SMG' : 'LAZER') : (this.kind === 'buff' ? 'BUFF ST' : 'HỒI MÁU');
    if (typeof drawWorldText === 'function') drawWorldText(ctx, lbl, cx, y - 11);
    ctx.restore();
};
