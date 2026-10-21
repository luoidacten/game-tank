// ==========================================
// 4 Thùng gacha mới (trọng số xuất hiện: CRATE_WEIGHTS trong js/entities/world.js)
//   - THÙNG LAZER (laser): phá -> 2 vạch cảnh báo chạy LÊN & XUỐNG từ thùng (cột dọc ~28px) trong 0.8s,
//       rồi bắn tia lazer khổng lồ dọc cột: 3.0 sát thương lên BẤT KỲ xe nào trong cột (cả 2 đều né được
//       bằng cách chạy ra khỏi cột). Tường Sniper / Khiên Thép chặn tia.
//   - THÙNG KHỐNG CHẾ (trap): người phá dính bẫy, choáng 1s (Juggernaut miễn nhiễm).
//   - THÙNG GIÁP ẢO (phantom): người phá nhận 2.0 Giáp Trắng (chung pool gearWhiteShield), tan dần về 0 trong 5s.
//   - THÙNG GIẢM SÁT THƯƠNG (guard): người phá giảm 35% sát thương nhận vào trong 5s (hào quang + chip HUD).
// Tiến Hóa ăn các thùng này nhận thưởng vĩnh viễn nhỏ ('c_laser' / 'c_trap' / 'c_phantom' / 'c_guard').
// Toàn bộ trạng thái là trường thuần trên người chơi / thực thể trong bodyEffects (host mô phỏng, guest chỉ vẽ).
// Ngoài ra: vẽ Giáp Trắng (gearWhiteShield) quanh xe — trước đây chỉ có chip HUD.
// ==========================================

const CR_LASER_WARN = 48, CR_LASER_DMG = 3.0, CR_LASER_HW = 14;
const CR_TRAP_T = 60;
const CR_PHANTOM_AMT = 2.0, CR_PHANTOM_T = 300;
const CR_GUARD_T = 300, CR_GUARD_RED = 0.35;

function crPlayerById(id) { return id === 1 ? p1 : (id === 2 ? p2 : null); }
function crTxt(p, text, col, size) { if (p) addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 18, text, col, size || 13); }
function crSfx(fn) { try { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[fn]) soundSystem[fn](); } catch (e) { } }
function crAura(p, kind) {
    if (!p || bodyEffects.some(e => e instanceof CrAura && e.pid === p.id && e.kind === kind && e.active)) return;
    bodyEffects.push(new CrAura(p.id, kind));
}

// Gọi từ crateOnBreak (mọi đường phá thùng)
function crGachaBreak(c, p, ally) {
    if (!c || !p || typeof p.takeDamage !== 'function') return;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    if (c.type === 'laser') {
        bodyEffects.push(new CrLaser(cx, cy, ally ? p.id : 0));
        explosions.push(new Explosion(cx, cy, 30, 'rgba(255,45,117,', 0, null));
        addFloatingText(cx, cy - 16, '⚠ LAZER! NÉ KHỎI CỘT!', '#ff2d75', 13);
        crSfx('playClick');
    } else if (c.type === 'trap') {
        explosions.push(new Explosion(cx, cy, 26, 'rgba(163,230,53,', 0, null));
        if (p.weapon === 'juggernaut') { crTxt(p, 'KHÁNG KHỐNG CHẾ!', '#ff6f00', 13); }
        else if (ally) { crTxt(p, 'GỠ BẪY AN TOÀN', '#a3e635', 12); }
        else {
            p.freezeTimer = Math.max(p.freezeTimer || 0, CR_TRAP_T);
            bodyEffects.push(new CrTrapFx(p.id));
            crTxt(p, 'DÍNH BẪY! CHOÁNG 1s ⛓', '#a3e635', 14);
            triggerScreenShake(4, 8);
            crSfx('playHit');
        }
    } else if (c.type === 'phantom') {
        p.gearWhiteShield = (p.gearWhiteShield || 0) + CR_PHANTOM_AMT;
        p.crWs = (p.crWs || 0) + CR_PHANTOM_AMT;
        p.crWsRate = p.crWs / CR_PHANTOM_T;
        crTxt(p, `GIÁP ẢO +${CR_PHANTOM_AMT} (tan dần 5s) 🛡`, '#f8fafc', 14);
        explosions.push(new Explosion(cx, cy, 34, 'rgba(248,250,252,', 0, null));
        crSfx('playPowerup');
    } else if (c.type === 'guard') {
        p.crDrT = CR_GUARD_T;
        crAura(p, 'guard');
        crTxt(p, `GIẢM ${Math.round(CR_GUARD_RED * 100)}% SÁT THƯƠNG (5s) ⛊`, '#818cf8', 14);
        explosions.push(new Explosion(cx, cy, 34, 'rgba(129,140,248,', 0, null));
        crSfx('playPowerup');
    } else return;
    if (p.weapon === 'evolution' && p.onEvolutionCrateEat) p.onEvolutionCrateEat('c_' + c.type);
}

// ---------- Tia Lazer của thùng (cảnh báo 0.8s -> bắn dọc cột) ----------
class CrLaser {
    constructor(x, y, safeId) {
        this.x = x; this.y = y; this.hw = CR_LASER_HW; this.safeId = safeId || 0;
        this.warn = CR_LASER_WARN; this.beam = 0; this.beamMax = 22;
        this.yTop = 0; this.yBot = canvas.height; this.dmg = CR_LASER_DMG;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.warn > 0) { if (--this.warn <= 0) this.fire(); return; }
        if (--this.beam <= 0) this.active = false;
    }
    fire() {
        const x = this.x, hw = this.hw;
        const wu = typeof sniperWallBlockY === 'function' ? sniperWallBlockY(null, x, this.y, -1, hw, 0) : null;
        const wd = typeof sniperWallBlockY === 'function' ? sniperWallBlockY(null, x, this.y, 1, hw, 0) : null;
        this.yTop = wu ? Math.min(this.y, sniperWallStopY(wu, -1)) : 0;
        this.yBot = wd ? Math.max(this.y, sniperWallStopY(wd, 1)) : canvas.height;
        this.beam = this.beamMax;
        for (const p of [p1, p2]) {
            if (!p || p.hp <= 0 || p.id === this.safeId) continue;
            if (p.x >= x + hw || p.x + p.w <= x - hw) continue;
            const py = p.y + p.h / 2;
            if (py < this.yTop || py > this.yBot) continue;
            p.takeDamage(this.dmg, null, { isEnvironmental: true });
            explosions.push(new Explosion(p.x + p.w / 2, py, 46, 'rgba(255,45,117,', 0, null));
            spawnSparkParticles(p.x + p.w / 2, py, '#ff9ec4', 14);
        }
        triggerScreenShake(7, 12);
        crSfx('playExplosion');
    }
    draw() {
        if (!this.active) return;
        const t = Date.now(), x = this.x, hw = this.hw, H = canvas.height;
        ctx.save();
        if (this.warn > 0) {
            const k = 1 - this.warn / CR_LASER_WARN; // 0 -> 1
            const blink = Math.floor(t / 70) % 2 === 0;
            // vùng cột mờ nhấp nháy
            ctx.fillStyle = `rgba(255,45,117,${0.07 + 0.12 * k + (blink ? 0.05 : 0)})`;
            ctx.fillRect(x - hw, 0, hw * 2, H);
            // 2 vạch cảnh báo chạy từ thùng LÊN & XUỐNG
            const reachUp = this.y * Math.min(1, k * 2.2), reachDn = (H - this.y) * Math.min(1, k * 2.2);
            ctx.strokeStyle = blink ? 'rgba(255,60,130,1)' : 'rgba(255,60,130,0.6)';
            ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = '#ff2d75';
            ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t / 25;
            for (const sx of [x - hw, x + hw]) {
                ctx.beginPath(); ctx.moveTo(sx, this.y); ctx.lineTo(sx, this.y - reachUp); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(sx, this.y); ctx.lineTo(sx, this.y + reachDn); ctx.stroke();
            }
            ctx.setLineDash([]);
            // mũi tên chạy ra 2 đầu
            ctx.fillStyle = 'rgba(255,200,225,0.85)';
            for (let i = 0; i < 4; i++) {
                const o = ((t / 6 + i * 60) % 240);
                for (const d of [-1, 1]) {
                    const yy = this.y + d * (20 + o);
                    if (yy < 0 || yy > H) continue;
                    ctx.beginPath(); ctx.moveTo(x - 6, yy - d * 4); ctx.lineTo(x, yy + d * 3); ctx.lineTo(x + 6, yy - d * 4); ctx.closePath(); ctx.fill();
                }
            }
            // lõi nạp năng lượng
            ctx.shadowBlur = 18; ctx.shadowColor = '#ff2d75';
            ctx.fillStyle = '#ffd1e3'; ctx.beginPath(); ctx.arc(x, this.y, 4 + k * 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ff2d75'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, this.y, 22 - k * 12, 0, Math.PI * 2); ctx.stroke();
        } else {
            const k = this.beam / this.beamMax, y0 = this.yTop, y1 = this.yBot;
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 30; ctx.shadowColor = '#ff2d75';
            ctx.fillStyle = `rgba(255,45,117,${0.35 * k})`; ctx.fillRect(x - hw * 1.6, y0, hw * 3.2, y1 - y0);
            ctx.fillStyle = `rgba(255,120,180,${0.7 * k})`; ctx.fillRect(x - hw * k, y0, hw * 2 * k, y1 - y0);
            ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillRect(x - hw * 0.35 * k, y0, hw * 0.7 * k, y1 - y0);
            // gợn sóng năng lượng
            ctx.strokeStyle = `rgba(255,220,240,${0.8 * k})`; ctx.lineWidth = 1.5;
            for (const d of [-1, 1]) {
                ctx.beginPath();
                for (let yy = y0; yy <= y1; yy += 12) ctx.lineTo(x + d * hw * (0.9 + 0.25 * Math.sin(yy / 14 + t / 40)), yy);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// ---------- Bẫy kẹp sập vào xe ----------
class CrTrapFx {
    constructor(pid) { this.pid = pid; this.life = CR_TRAP_T; this.active = true; }
    update() { if (--this.life <= 0) this.active = false; }
    draw() {
        const p = crPlayerById(this.pid);
        if (!this.active || !p) return;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = Math.max(p.w, p.h) * 0.7 + 4;
        const age = CR_TRAP_T - this.life;
        const close = Math.min(1, age / 6);           // hàm kẹp sập trong 0.1s
        const open = (1 - close) * 0.9;
        const shake = age < 12 ? Math.sin(age * 2.5) * 2 : 0;
        ctx.save();
        ctx.translate(cx + shake, cy);
        ctx.shadowBlur = 12; ctx.shadowColor = '#a3e635';
        ctx.strokeStyle = '#d9f99d'; ctx.fillStyle = '#a3e635'; ctx.lineWidth = 2.5;
        for (const d of [-1, 1]) {
            ctx.save(); ctx.rotate(d * open);
            ctx.beginPath(); ctx.arc(0, 0, R, d < 0 ? Math.PI : 0, d < 0 ? Math.PI * 2 : Math.PI); ctx.stroke();
            // răng cưa
            for (let i = 1; i < 8; i++) {
                const a = (d < 0 ? Math.PI : 0) + i * Math.PI / 8;
                const ox = Math.cos(a) * R, oy = Math.sin(a) * R;
                const ix = Math.cos(a) * (R - 6), iy = Math.sin(a) * (R - 6);
                ctx.beginPath(); ctx.moveTo(ox + Math.sin(a) * 2.5, oy - Math.cos(a) * 2.5); ctx.lineTo(ix, iy); ctx.lineTo(ox - Math.sin(a) * 2.5, oy + Math.cos(a) * 2.5); ctx.fill();
            }
            ctx.restore();
        }
        // chốt + xích
        ctx.fillStyle = '#365314'; ctx.beginPath(); ctx.arc(-R, 0, 3.5, 0, Math.PI * 2); ctx.arc(R, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        if (age < 8) { ctx.strokeStyle = `rgba(255,255,255,${1 - age / 8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R + age * 2, 0, Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 90);
        ctx.fillStyle = '#ecfccb'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '⛓ CHOÁNG', 0, (p.id === 1 ? -1 : 1) * (R + 9));
        ctx.restore();
    }
}

// ---------- Hào quang Giảm Sát Thương ----------
class CrAura {
    constructor(pid, kind) { this.pid = pid; this.kind = kind; this.active = true; }
    on(p) { return !!p && this.kind === 'guard' && p.crDrT > 0; }
    update() { if (!this.on(crPlayerById(this.pid))) this.active = false; }
    draw() {
        const p = crPlayerById(this.pid);
        if (!this.active || !this.on(p)) return;
        const t = Date.now(), cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = Math.max(p.w, p.h) * 0.78 + 3;
        const fade = p.crDrT < 60 && Math.floor(t / 100) % 2 === 0 ? 0.4 : 1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.strokeStyle = '#a5b4fc'; ctx.lineWidth = 2; ctx.shadowBlur = 14; ctx.shadowColor = '#818cf8';
        ctx.fillStyle = 'rgba(129,140,248,0.12)';
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4 + t / 1800; ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); }
        ctx.fill(); ctx.stroke();
        // các tấm giáp nhỏ xoay quanh
        ctx.fillStyle = '#c7d2fe';
        for (let i = 0; i < 3; i++) {
            const a = -t / 700 + i * Math.PI * 2 / 3, x = cx + Math.cos(a) * (R + 4), y = cy + Math.sin(a) * (R + 4);
            ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3.5, -2); ctx.lineTo(2.5, 3); ctx.lineTo(0, 4.5); ctx.lineTo(-2.5, 3); ctx.lineTo(-3.5, -2); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}

// ---------- Vòng đời trạng thái ----------
(function () {
    const origUpd = Player.prototype.update;
    Player.prototype.update = function () {
        if (this.crDrT > 0) this.crDrT--;
        if (this.crWs > 0) {
            // Giáp Ảo tan dần: chỉ trừ phần giáp do thùng cấp (phần đã bị đánh vỡ thì thôi)
            this.crWs = Math.min(this.crWs, this.gearWhiteShield || 0);
            const d = Math.min(this.crWs, this.crWsRate || (CR_PHANTOM_AMT / CR_PHANTOM_T));
            this.crWs -= d;
            this.gearWhiteShield = Math.max(0, (this.gearWhiteShield || 0) - d);
            if (this.crWs < 1e-3) { this.gearWhiteShield = Math.max(0, this.gearWhiteShield - this.crWs); this.crWs = 0; }
        }
        return origUpd.apply(this, arguments);
    };
    const origSetup = Player.prototype.setupForNewRound;
    Player.prototype.setupForNewRound = function () {
        const r = origSetup.apply(this, arguments);
        this.crDrT = 0; this.crWs = 0; this.crWsRate = 0;
        // Tiến Hóa: Thùng Giáp Ảo đã ăn -> mỗi hiệp bắt đầu với chút Giáp Trắng
        const b = this.weapon === 'evolution' && this.evolutionPermanentBonus;
        if (b && b.phantomWs > 0) this.gearWhiteShield = (this.gearWhiteShield || 0) + b.phantomWs;
        return r;
    };
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (typeof amount === 'number' && amount > 0) {
            let m = 1;
            if (this.crDrT > 0) m *= 1 - CR_GUARD_RED;
            const b = this.weapon === 'evolution' && this.evolutionPermanentBonus;
            if (b && b.guardDr > 0) m *= 1 - Math.min(0.1, b.guardDr);
            if (m < 1) {
                amount *= m;
                if (this.crDrT > 0 && Math.random() < 0.5) spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#a5b4fc', 4);
            }
        }
        return origTD.call(this, amount, attacker, options);
    };
    // Vẽ Giáp Trắng (gearWhiteShield) quanh xe — dùng chung cho mọi nguồn (G.E.A.R, Thùng Giáp Ảo...)
    const origDraw = Player.prototype.draw;
    if (typeof origDraw === 'function') Player.prototype.draw = function () {
        const r = origDraw.apply(this, arguments);
        const ws = this.gearWhiteShield || 0;
        if (ws >= 0.05 && this.hp > 0) {
            const t = Date.now(), cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            const R = Math.max(this.w, this.h) * 0.68 + 2, k = Math.min(1, ws / 2);
            ctx.save();
            ctx.strokeStyle = `rgba(248,250,252,${0.45 + 0.45 * k})`; ctx.lineWidth = 1.5 + k * 1.5;
            ctx.shadowBlur = 12; ctx.shadowColor = '#ffffff';
            ctx.setLineDash([7, 4]); ctx.lineDashOffset = t / 40;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            // thanh Giáp Trắng mảnh phía ngoài xe
            const bw = this.w + 6, by = this.id === 1 ? this.y + this.h + 5 : this.y - 8, fill = Math.min(1, ws / 4);
            ctx.shadowBlur = 6;
            ctx.fillStyle = 'rgba(15,23,42,0.75)'; ctx.fillRect(cx - bw / 2, by, bw, 3);
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - bw / 2, by, bw * fill, 3);
            ctx.restore();
        }
        return r;
    };
})();

// ---------- HUD chip ----------
if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(
        p => p.crDrT > 0 ? { g: 'guard', c: '#818cf8', l: `-${Math.round(CR_GUARD_RED * 100)}%ST`, t: sec(p.crDrT) } : null,
    );
}

// ---------- Hình ảnh thùng mới ----------
if (typeof CRATE_STYLE !== 'undefined') {
    CRATE_STYLE.laser = { c: '#ff2d75', icon: 'laser' };
    CRATE_STYLE.trap = { c: '#a3e635', icon: 'trap' };
    CRATE_STYLE.phantom = { c: '#f8fafc', icon: 'phantom' };
    CRATE_STYLE.guard = { c: '#818cf8', icon: 'guardx' };
    const origIcon = drawCrateIcon;
    drawCrateIcon = function (icon, s, col) {
        if (icon === 'laser') {
            ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.6;
            const w = s * 0.32 * (0.8 + 0.2 * Math.sin(Date.now() / 90));
            ctx.fillRect(-w, -s * 0.7, w * 2, s * 1.4);
            ctx.fillStyle = '#fff'; ctx.fillRect(-w * 0.35, -s * 0.7, w * 0.7, s * 1.4);
            ctx.fillStyle = col;
            for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-s * 0.5, d * s * 0.62); ctx.lineTo(0, d * s * 1.08); ctx.lineTo(s * 0.5, d * s * 0.62); ctx.closePath(); ctx.fill(); }
        } else if (icon === 'trap') {
            ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, s * 0.85, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, s * 0.85, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();
            for (let i = 0; i < 4; i++) {
                const x = -s * 0.55 + i * s * 0.37;
                ctx.beginPath(); ctx.moveTo(x - 2, -s * 0.15); ctx.lineTo(x, s * 0.25); ctx.lineTo(x + 2, -s * 0.15); ctx.fill();
            }
            ctx.beginPath(); ctx.arc(-s * 0.85, 0, 2, 0, Math.PI * 2); ctx.arc(s * 0.85, 0, 2, 0, Math.PI * 2); ctx.fill();
        } else if (icon === 'phantom') {
            ctx.save();
            ctx.globalAlpha = 0.55 + 0.35 * Math.sin(Date.now() / 200);
            ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([3, 2]);
            ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, -s * 0.6); ctx.lineTo(s * 0.75, s * 0.35); ctx.lineTo(0, s); ctx.lineTo(-s * 0.75, s * 0.35); ctx.lineTo(-s * 0.9, -s * 0.6); ctx.closePath(); ctx.stroke();
            ctx.restore();
            ctx.fillStyle = col; ctx.font = `bold ${Math.round(s * 0.95)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('2', 0, 1); ctx.textBaseline = 'alphabetic';
        } else if (icon === 'guardx') {
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, -s * 0.6); ctx.lineTo(s * 0.75, s * 0.35); ctx.lineTo(0, s); ctx.lineTo(-s * 0.75, s * 0.35); ctx.lineTo(-s * 0.9, -s * 0.6); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#0b1220';
            ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.15); ctx.lineTo(0, s * 0.45); ctx.lineTo(s * 0.4, -s * 0.15); ctx.closePath(); ctx.fill();
            ctx.fillRect(-s * 0.14, -s * 0.6, s * 0.28, s * 0.5);
        } else origIcon(icon, s, col);
    };
}
