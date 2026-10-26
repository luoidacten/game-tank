// ============================================================
// Cơ Bản — dạng MAIN: KẾT LIỄU "THỨC TỈNH" (chỉ khi người hạ gục là Cơ Bản bản MAIN; Cơ Bản thường không có)
//   0-34   màn tối ấm, hào quang vàng bùng lên quanh xe MAIN (camera cận xe)
//   10-70  mảnh ký ức (mảnh kính vàng) xoay quanh xe rồi hút vào nòng
//   36-86  tụ "đạn Hợp Nhất" ở đầu nòng (lõi trắng, quầng lửa vàng-cam, vạch zoom)
//   86-98  phát bắn xuyên thấu khổng lồ bay qua sân (camera bám theo), xuyên qua mục tiêu ra mép sân
//   98+    sóng xung kích, chớp sáng, tiêu đề "THỨC TỈNH"
// Thực thể chỉ chứa dữ liệu thuần (có trong NET_CLASSES).
// ============================================================
const MNF_DUR = 190, MNF_FIRE = 86, MNF_HIT = 98;

class MainFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = MNF_DUR; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() {
        this.t++;
        const t = this.t, snd = typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted;
        if (t === 4 && snd && soundSystem.playRevive) soundSystem.playRevive();
        if (t === 40 && snd && soundSystem.playPowerup) soundSystem.playPowerup();
        if (t === MNF_FIRE) {
            if (typeof triggerScreenShake === 'function') triggerScreenShake(7, 10);
            if (snd && soundSystem.playLaser) soundSystem.playLaser();
        }
        if (t === MNF_HIT) {
            if (typeof explosions !== 'undefined' && typeof Explosion !== 'undefined') {
                explosions.push(new Explosion(this.x, this.y, 110, 'rgba(255, 176, 32,', 0, null));
                explosions.push(new Explosion(this.x, this.y, 60, 'rgba(255, 90, 20,', 0, null));
            }
            if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(this.x, this.y, '#ffd700', 26); spawnSparkParticles(this.x, this.y, '#ff7a00', 18); }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(15, 24);
            if (snd && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        if (t === 128 && snd && soundSystem.playWin) soundSystem.playWin();
        if (t >= this.dur) this.active = false;
    }
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const W = canvas.width, H = canvas.height, D = this.y < this.oy ? -1 : 1;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [14, this.ox, this.oy + D * 24, 1.65], [MNF_FIRE, this.ox, this.oy + D * 34, 1.75],
            [MNF_HIT, this.x, this.y, 1.4], [136, this.x, this.y, 1.3], [170, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { mnfDraw(this); }
}
function mnfFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof MainFinisher && e.active) e.drawOver();
}
function mnfIsMain(p) { return !!p && p.weapon === 'basic' && !!(p.mainAwakened || p.mainEgg); }

// ---------- Kích hoạt: bọc takeDamage ----------
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && mnfIsMain(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new MainFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Vẽ ----------
function mnfR(s, i) { const x = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
function mnfDraw(f) {
    const t = f.t, W = canvas.width, H = canvas.height, E = fcE;
    const D = f.y < f.oy ? -1 : 1, fade = 1 - E(t, f.dur - 22, f.dur);
    const mx = f.ox, my = f.oy + D * 20;          // đầu nòng
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 1) Màn tối ấm
    const dark = E(t, 0, 24) * fade;
    ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(18,9,2,${0.7 * dark})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    // 2) Hào quang vàng quanh xe MAIN
    const au = E(t, 2, 22) * (1 - E(t, MNF_HIT + 10, MNF_HIT + 50)) * fade;
    if (au > 0) {
        fcRays(f.ox, f.oy, 14, 70 + 40 * au, '#ffb020', 0.55 * au, t * 0.012, 0.07);
        const g = ctx.createRadialGradient(f.ox, f.oy, 4, f.ox, f.oy, 46);
        g.addColorStop(0, `rgba(255,240,180,${0.7 * au})`); g.addColorStop(0.5, `rgba(255,170,30,${0.35 * au})`); g.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.ox, f.oy, 46, 0, BF_TAU); ctx.fill();
        // lưỡi lửa vàng bốc ngược (phía sau xe)
        for (let i = 0; i < 7; i++) {
            const k = ((t / 26) + mnfR(f.seed, i)) % 1, sx = f.ox + (i - 3) * 6 + Math.sin(t * 0.2 + i) * 2;
            const sy = f.oy - D * (6 + k * 46), r = 7 * (1 - k) + 2;
            ctx.fillStyle = `rgba(255,${150 + Math.round(90 * (1 - k))},40,${0.55 * au * (1 - k)})`;
            ctx.beginPath(); ctx.ellipse(sx, sy, r * 0.7, r * 1.4, 0, 0, BF_TAU); ctx.fill();
        }
        for (let i = 0; i < 2; i++) { const k = ((t + i * 13) % 26) / 26; bfRing(f.ox, f.oy, 16 + k * 40, `rgba(255,215,0,${0.6 * au * (1 - k)})`, 2); }
    }
    // 3) Mảnh ký ức xoay quanh rồi hút vào nòng
    const NS = 8;
    for (let i = 0; i < NS; i++) {
        const t0 = 8 + i * 4, ap = E(t, t0, t0 + 10), suck = E(t, 58 + i * 2, 74 + i * 2);
        if (ap <= 0 || suck >= 1) continue;
        const an = i / NS * BF_TAU + t * 0.035, rr = (52 + 10 * Math.sin(i * 1.7)) * (1 - fcOut(suck));
        const cx = bfLerp(f.ox + Math.cos(an) * rr, mx, suck * suck), cy = bfLerp(f.oy + Math.sin(an) * rr * 0.8, my, suck * suck);
        const s = (9 + mnfR(f.seed, i) * 5) * (1 - suck * 0.8) * fcOut(ap);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(an * 1.3 + i); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade * Math.min(1, ap * 2);
        const g = ctx.createLinearGradient(-s, -s, s, s);
        g.addColorStop(0, 'rgba(255,250,225,0.95)'); g.addColorStop(0.5, 'rgba(255,196,70,0.75)'); g.addColorStop(1, 'rgba(160,70,10,0.6)');
        ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1;
        bfPoly([[-s * 0.9, -s * 0.5], [s * 0.2, -s], [s, -s * 0.1], [s * 0.4, s * 0.8], [-s * 0.6, s * 0.6]]); ctx.fill(); ctx.stroke();
        // "khung hình ký ức": bóng xe nhỏ + vệt loé
        ctx.fillStyle = 'rgba(90,40,5,0.55)'; ctx.fillRect(-s * 0.3, -s * 0.25, s * 0.6, s * 0.5); ctx.fillRect(-s * 0.08, -s * 0.6, s * 0.16, s * 0.4);
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.4); ctx.lineTo(s * 0.1, -s * 0.75); ctx.stroke();
        ctx.restore();
        // vệt ánh sáng khi bị hút
        if (suck > 0) { ctx.strokeStyle = `rgba(255,215,0,${0.6 * (1 - suck)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bfLerp(cx, mx, 0.4), bfLerp(cy, my, 0.4)); ctx.stroke(); }
    }
    // 4) Tụ đạn Hợp Nhất ở đầu nòng
    const chg = E(t, 36, MNF_FIRE), hold = t < MNF_FIRE + 3;
    if (chg > 0 && hold) {
        const R = 4 + 15 * fcOut(chg) + Math.sin(t * 0.8) * 1.2;
        fcZoomLines(mx, my, 22, R + 8, R + 70, '#ffd27a', 0.45 * chg, f.seed, t);
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, R * 2.6);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.28, 'rgba(255,230,140,0.95)'); g.addColorStop(0.55, 'rgba(255,120,20,0.55)'); g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, R * 2.6, 0, BF_TAU); ctx.fill();
        // hạt năng lượng xoắn ốc hút vào
        for (let i = 0; i < 12; i++) {
            const k = ((t / 20) + i / 12) % 1, an = i * 2.1 + k * 4, rr = (R + 50) * (1 - k);
            ctx.fillStyle = `rgba(255,${200 + (i % 3) * 18},80,${0.85 * chg * k})`;
            ctx.beginPath(); ctx.arc(mx + Math.cos(an) * rr, my + Math.sin(an) * rr, 1.6 + k * 1.4, 0, BF_TAU); ctx.fill();
        }
        bfRing(mx, my, R * 1.25, `rgba(255,240,200,${0.8 * chg})`, 1.6);
    }
    // 5) Phát bắn xuyên thấu: đầu đạn bay mx->mục tiêu, vệt sáng kéo tới mép sân phía sau mục tiêu
    if (t >= MNF_FIRE) {
        const fl = E(t, MNF_FIRE, MNF_HIT), endY = D < 0 ? -20 : H + 20;
        const pierce = E(t, MNF_HIT, MNF_HIT + 6);
        const headY = t < MNF_HIT ? bfLerp(my, f.y, fl * fl) : bfLerp(f.y, endY, pierce);
        const headX = t < MNF_HIT ? bfLerp(mx, f.x, fl * fl) : f.x;
        const bw = (t < MNF_HIT ? 22 : 34) * (1 - E(t, MNF_HIT + 6, MNF_HIT + 46));
        if (bw > 0.3) {
            const y0 = my, y1 = headY;
            for (const [w, col] of [[1, 'rgba(255,120,20,0.45)'], [0.55, 'rgba(255,210,90,0.8)'], [0.2, 'rgba(255,255,240,1)']]) {
                ctx.strokeStyle = col; ctx.lineWidth = bw * w * 2;
                ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(headX, y1); ctx.stroke();
            }
            // vạch tốc độ dọc vệt
            for (let i = 0; i < 6; i++) {
                const ox = (mnfR(f.seed + Math.floor(t / 2), i) - 0.5) * bw * 3.2, oy = bfLerp(y0, y1, mnfR(f.seed + Math.floor(t / 2), i + 7));
                ctx.strokeStyle = 'rgba(255,230,160,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx + ox, oy); ctx.lineTo(mx + ox, oy + D * 26); ctx.stroke();
            }
        }
        if (t < MNF_HIT + 4) { // đầu đạn
            const g = ctx.createRadialGradient(headX, headY, 0, headX, headY, 40);
            g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,215,0,0.9)'); g.addColorStop(1, 'rgba(255,90,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(headX, headY, 40, 0, BF_TAU); ctx.fill();
        }
        // vòng lửa đầu nòng
        const mk = E(t, MNF_FIRE, MNF_FIRE + 18);
        if (mk < 1) bfRing(mx, my, 10 + mk * 40, `rgba(255,200,80,${1 - mk})`, 4 * (1 - mk) + 1);
    }
    // 6) Va chạm: sóng xung kích + tia toả
    if (t >= MNF_HIT) {
        const dt = t - MNF_HIT;
        fcRays(f.x, f.y, 18, 60 + dt * 4, '#ffb020', 0.8 * (1 - E(t, MNF_HIT, MNF_HIT + 40)), f.seed, 0.06);
        for (let i = 0; i < 3; i++) {
            const k = E(t, MNF_HIT + i * 6, MNF_HIT + 44 + i * 6); if (k <= 0 || k >= 1) continue;
            ctx.strokeStyle = i === 1 ? `rgba(255,255,255,${0.9 * (1 - k)})` : `rgba(255,${190 - i * 50},40,${1 - k})`; ctx.lineWidth = 6 * (1 - k) + 1;
            ctx.beginPath(); ctx.ellipse(f.x, f.y, 18 + k * 160, (18 + k * 160) * 0.62, 0, 0, BF_TAU); ctx.stroke();
        }
        // lỗ thủng xuyên + xác xe
        bfBody(f.x, f.y, f.vw, f.vh, 0, fade * (1 - E(t, MNF_HIT + 30, MNF_HIT + 70)) * 0.95, '#ffb020');
        const hk = (1 - E(t, MNF_HIT, MNF_HIT + 60)) * fade;
        if (hk > 0) {
            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 16);
            g.addColorStop(0, `rgba(255,255,255,${hk})`); g.addColorStop(0.5, `rgba(255,170,30,${hk * 0.8})`); g.addColorStop(1, 'rgba(255,80,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 16, 0, BF_TAU); ctx.fill();
        }
        // mảnh kim loại văng (tất định)
        for (let i = 0; i < 14; i++) {
            const k = E(t, MNF_HIT, MNF_HIT + 50); if (k >= 1) break;
            const an = mnfR(f.seed, i + 30) * BF_TAU, d = fcOut(k) * (40 + mnfR(f.seed, i + 50) * 90);
            ctx.fillStyle = `rgba(255,${180 + (i % 4) * 18},70,${1 - k})`;
            ctx.save(); ctx.translate(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.7); ctx.rotate(an + k * 6);
            ctx.fillRect(-3, -1, 6, 2); ctx.restore();
        }
    }
    ctx.restore();
    // 7) Chớp sáng màn hình (bắn & va chạm)
    const fk = t >= MNF_HIT && t < MNF_HIT + 14 ? 1 - (t - MNF_HIT) / 14 : t >= MNF_FIRE && t < MNF_FIRE + 6 ? 0.4 * (1 - (t - MNF_FIRE) / 6) : 0;
    if (fk > 0) { ctx.save(); fcScreen(); ctx.fillStyle = `rgba(255,244,214,${0.85 * fk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // 8) Khung điện ảnh + tiêu đề
    fcVignette(0.55 * dark, '#1a0b00');
    fcLetterbox(fcBarK(t, 16, f.dur - 20, f.dur), '#ffb020');
    const tk = E(t, MNF_HIT + 14, MNF_HIT + 34) * fade;
    fcTitle('THỨC TỈNH', 'MAIN · CHIẾN ĐẤU ĐẾN KHI LỬA TÀN', tk, { c: '#ff8a00', c2: '#ffe08a', size: 34, sw: E(t, MNF_HIT + 28, MNF_HIT + 58) });
}
