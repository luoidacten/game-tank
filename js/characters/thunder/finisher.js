// ============================================================
// Sấm Chớp (thunder) — KẾT LIỄU "LÔI THẦN GIÁNG THẾ" (điện ảnh nhiều pha, chỉ hình ảnh)
//   0-40   mây giông cuộn vào, bầu trời tối sầm (camera ở xe thắng)
//   20-80  ngọn giáo sét trên xe thắng tích điện, tia lửa điện bò dọc thân giáo, cột dẫn sét vọt lên mây
//   70-96  camera lia sang mục tiêu, các nhánh dẫn sét mờ dò đường xuống
//   96     TIA SÉT KHỔNG LỒ phân nhánh (fractal theo seed, tất định) giáng xuống + chớp trắng toàn màn hình
//   100-185 hồ quang bò trên xác xe, hố cháy xém, tiêu đề
// Thực thể chỉ chứa dữ liệu thuần (có trong NET_CLASSES); hình học tia sét tính lại từ seed + tick.
// ============================================================
const THF_DUR = 200, THF_HIT = 96;

class ThFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = THF_DUR; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() {
        this.t++;
        const t = this.t, snd = typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted;
        if (t === 30 || t === 55) { if (snd && soundSystem.playLaser) soundSystem.playLaser(); }
        if (t === THF_HIT) {
            if (typeof explosions !== 'undefined' && typeof Explosion !== 'undefined') {
                explosions.push(new Explosion(this.x, this.y, 95, 'rgba(250, 204, 21,', 0, null));
                explosions.push(new Explosion(this.x, this.y, 55, 'rgba(96, 165, 250,', 0, null));
            }
            if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(this.x, this.y, '#fde047', 26); spawnSparkParticles(this.x, this.y, '#93c5fd', 18); }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(16, 26);
            if (snd && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        if ((t === THF_HIT + 8 || t === THF_HIT + 15) && typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x, this.y, '#e0f2fe', 8);
        if (t === 130 && snd && soundSystem.playWin) soundSystem.playWin();
        if (t >= this.dur) this.active = false;
    }
    // Camera: cận xe thắng (tích điện) -> lia lên mây & xuống mục tiêu -> lùi ra toàn sân
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const W = canvas.width, H = canvas.height, A = this.team === 1 ? -1 : 1;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [16, this.ox, this.oy + A * 30, 1.55], [62, this.ox, this.oy + A * 40, 1.7],
            [84, this.x, this.y - A * 40, 1.45], [THF_HIT, this.x, this.y, 1.4], [140, this.x, this.y, 1.3], [178, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { thfDraw(this); }
}
function thfFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof ThFinisher && e.active) e.drawOver();
}

// ---------- Kích hoạt: bọc takeDamage ----------
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && a.weapon === 'thunder' && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new ThFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Hình học sét (tất định) ----------
function thfR(s, i) { const x = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
// Dời điểm giữa (midpoint displacement): trả về mảng [x,y]
function thfBolt(x0, y0, x1, y1, seed, lv, rough) {
    let pts = [[x0, y0], [x1, y1]], off = Math.hypot(x1 - x0, y1 - y0) * (rough || 0.22), k = 0;
    for (let l = 0; l < lv; l++) {
        const np = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
            const d = (thfR(seed, k++) - 0.5) * off;
            np.push([(a[0] + b[0]) / 2 - dy / L * d, (a[1] + b[1]) / 2 + dx / L * d], b);
        }
        pts = np; off *= 0.55;
    }
    return pts;
}
// Toàn bộ cây sét: kênh chính + nhánh + nhánh con. Mỗi nhánh {p: điểm, w: độ dày tương đối, s: chỉ số bắt đầu trên kênh chính}
function thfTree(x0, y0, x1, y1, seed, fy) {
    const main = thfBolt(x0, y0, x1, y1, seed, 6, 0.2), out = [{ p: main, w: 1, s: 0 }], n = main.length;
    const nf = 5 + Math.floor(thfR(seed, 900) * 2);
    for (let i = 0; i < nf; i++) {
        const si = Math.floor(n * (0.12 + 0.68 * thfR(seed, 910 + i))), a = main[si], b = main[Math.min(n - 1, si + 2)];
        const md = Math.atan2(b[1] - a[1], b[0] - a[0]), rot = 0.35 + thfR(seed, 930 + i) * 0.6;
        let dir = md + (i % 2 ? 1 : -1) * rot;
        if (fy && i % 3 && Math.sin(dir) * fy < 0) dir = md - (i % 2 ? 1 : -1) * rot; // đa số nhánh toả vào sân
        const len = Math.hypot(x1 - x0, y1 - y0) * (0.16 + thfR(seed, 950 + i) * 0.22);
        const fp = thfBolt(a[0], a[1], a[0] + Math.cos(dir) * len, a[1] + Math.sin(dir) * len, seed + i * 7.3, 4, 0.3);
        out.push({ p: fp, w: 0.45, s: si });
        // nhánh con
        const sj = Math.floor(fp.length * (0.35 + thfR(seed, 970 + i) * 0.3)), c = fp[sj], d2 = dir + (i % 2 ? -1 : 1) * 0.6;
        out.push({ p: thfBolt(c[0], c[1], c[0] + Math.cos(d2) * len * 0.45, c[1] + Math.sin(d2) * len * 0.45, seed + i * 3.1 + 50, 3, 0.35), w: 0.25, s: si + 2 });
    }
    return out;
}
function thfPath(p, upto) {
    const m = Math.max(1, Math.min(p.length - 1, Math.floor(upto)));
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i <= m; i++) ctx.lineTo(p[i][0], p[i][1]);
}
// vẽ cây sét: lớp quầng xanh rộng -> lớp xanh nhạt -> lõi trắng. rev: tỷ lệ lộ ra (0..1, dò đường từ trên xuống)
function thfDrawTree(tree, W0, a, rev) {
    if (a <= 0) return;
    const n0 = tree[0].p.length - 1, head = n0 * (rev === undefined ? 1 : rev);
    const passes = [[3.2, 'rgba(59,130,246,', 0.22], [1.6, 'rgba(147,197,253,', 0.6], [0.55, 'rgba(255,255,255,', 1]];
    for (const [mw, col, al] of passes) {
        ctx.strokeStyle = col + (al * a) + ')';
        for (const br of tree) {
            const vis = br === tree[0] ? head : (head - br.s) / n0 * br.p.length * 2.2;
            if (vis < 1) continue;
            ctx.lineWidth = Math.max(0.8, W0 * mw * br.w);
            thfPath(br.p, vis); ctx.stroke();
        }
    }
}
// hồ quang ngắn (zigzag) cho tia điện bò
function thfArc(x0, y0, x1, y1, seed, col, lw) {
    const p = thfBolt(x0, y0, x1, y1, seed, 3, 0.45);
    ctx.lineWidth = lw * 2.4; ctx.strokeStyle = col; thfPath(p, p.length); ctx.stroke();
    ctx.lineWidth = Math.max(0.7, lw * 0.6); ctx.strokeStyle = '#ffffff'; thfPath(p, p.length); ctx.stroke();
}

// ---------- Vẽ ----------
function thfDraw(f) {
    const t = f.t, W = canvas.width, H = canvas.height, A = f.team === 1 ? -1 : 1; // A: phía "trời" so với mục tiêu
    const fade = 1 - fcE(t, f.dur - 22, f.dur), E = fcE;
    const skyY = A < 0 ? -40 : H + 40;           // mây nằm ngoài mép sân phía sau mục tiêu
    const cloudY = f.y + A * 26;                 // dải mây ngay sau lưng mục tiêu (luôn trong khung hình)
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 1) Trời tối sầm (màn hình)
    const dark = E(t, 0, 34) * fade;
    ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(4,8,22,${0.72 * dark})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    // chớp trong mây (lóe xanh rải rác)
    const flick = (t > 18 && t < THF_HIT && (t % 23 < 3 || t % 37 < 2)) ? 1 : 0;
    // 2) Mây giông cuộn vào từ 2 bên
    const cl = fcOut(E(t, 2, 40)), cf = fade * (1 - E(t, 150, 190) * 0.5);
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 16; i++) {
        const side = i % 2 ? 1 : -1, home = f.x + (thfR(f.seed, i) - 0.5) * W * 1.3;
        const px = bfLerp(home + side * W * 0.9, home, cl) + Math.sin(t * 0.02 + i) * 6;
        const py = cloudY + A * (thfR(f.seed, i + 40) * 50 - 22), r = 36 + thfR(f.seed, i + 80) * 32;
        const g = ctx.createRadialGradient(px, py - A * r * 0.3, r * 0.1, px, py, r);
        const lit = flick && thfR(f.seed + t, i) > 0.5 ? 1 : 0;
        g.addColorStop(0, lit ? 'rgba(148,163,214,0.95)' : 'rgba(51,60,85,0.95)'); g.addColorStop(0.7, 'rgba(22,27,45,0.9)'); g.addColorStop(1, 'rgba(10,12,24,0)');
        ctx.globalAlpha = cf * Math.min(1, 0.3 + Math.abs(px - f.x) / 90); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, BF_TAU); ctx.fill();
    }
    // dải mây dày phía trời
    const bg = ctx.createLinearGradient(0, skyY, 0, cloudY);
    bg.addColorStop(0, 'rgba(8,10,20,0.95)'); bg.addColorStop(1, 'rgba(8,10,20,0)');
    ctx.globalAlpha = cl * cf; ctx.fillStyle = bg; ctx.fillRect(-W, Math.min(skyY, cloudY), W * 3, Math.abs(cloudY - skyY));
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    if (flick && t < THF_HIT) { // tia sét nhỏ trong mây
        const px = f.x + (thfR(f.seed, t) - 0.5) * W * 0.9;
        thfArc(px, cloudY, px + (thfR(f.seed, t + 1) - 0.5) * 60, cloudY - A * 30, f.seed + t, 'rgba(147,197,253,0.6)', 1.4);
    }
    // 3) Tích điện trên ngọn giáo của xe thắng
    const D = -A; // hướng mũi giáo (về phía mục tiêu)
    const ch = E(t, 18, 80) * (1 - E(t, THF_HIT, THF_HIT + 10));
    if (ch > 0) {
        const tipY = f.oy + D * 14, baseY = f.oy - D * 10;
        const g = ctx.createRadialGradient(f.ox, tipY, 0, f.ox, tipY, 10 + 34 * ch);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * ch})`); g.addColorStop(0.3, `rgba(253,224,71,${0.6 * ch})`); g.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.ox, tipY, 10 + 34 * ch, 0, BF_TAU); ctx.fill();
        const n = 2 + Math.floor(ch * 4), ts = Math.floor(t / 2);
        for (let i = 0; i < n; i++) { // tia lửa điện bò dọc thân giáo
            const y0 = bfLerp(baseY, tipY, thfR(f.seed + ts, i)), y1 = bfLerp(baseY, tipY, thfR(f.seed + ts, i + 9));
            const s = i % 2 ? 1 : -1;
            thfArc(f.ox + s * 3, y0, f.ox + s * (8 + 10 * ch * thfR(f.seed + ts, i + 20)), y1, f.seed + ts * 3 + i, `rgba(250,204,21,${0.55 * ch})`, 1.1);
        }
        bfRing(f.ox, f.oy, 18 + ((t * 1.6) % 26), `rgba(253,224,71,${0.5 * ch})`, 1.6);
        // cột dẫn sét vọt từ mũi giáo lên mây
        if (t >= 56 && t < THF_HIT) {
            const k = E(t, 56, 72), endY = bfLerp(tipY, f.oy + D * H, k);
            thfArc(f.ox, tipY, f.ox + (thfR(f.seed, ts) - 0.5) * 20, endY, f.seed + ts, `rgba(253,224,71,${0.7})`, 1.8);
        }
    }
    // 4) Nhánh dò đường mờ (step leaders)
    // điểm phát sét: trong mây, lệch ngang xa mục tiêu -> tia chéo dài, nhiều nhánh
    let sd = thfR(f.seed, 3) < 0.5 ? -1 : 1; if (f.x + sd * 150 < 10 || f.x + sd * 150 > W - 10) sd = -sd;
    const sx0 = Math.max(10, Math.min(W - 10, f.x + sd * 150));
    const topY = cloudY + A * 10;
    const tree = thfTree(sx0, topY, f.x, f.y, f.seed, -A);
    if (t >= 74 && t < THF_HIT) thfDrawTree(tree, 1.2, 0.4 + 0.3 * (t % 3 === 0), E(t, 74, THF_HIT) * 0.92);
    // 5) Tia sét chính + nhánh (nháy lại 2 lần)
    if (t >= THF_HIT && t < THF_HIT + 26) {
        const dt = t - THF_HIT;
        const a = dt < 6 ? 1 : (dt === 9 || dt === 10 || dt === 15 || dt === 16) ? 0.95 : Math.max(0, 0.55 - (dt - 6) * 0.03);
        const tr = dt < 9 ? tree : thfTree(sx0, topY, f.x, f.y, f.seed + (dt < 15 ? 0.37 : 0.71), -A);
        thfDrawTree(tr, 5.2, a, 1);
        // tia sét thứ 2 từ phía mây đối diện (giáng cùng lúc, tắt sớm hơn)
        if (dt < 12) thfDrawTree(thfTree(2 * f.x - sx0 * 0.8 - f.x * 0.2, topY, f.x, f.y, f.seed + 5.5, -A), 3.2, a * (1 - dt / 12), 1);
        // quầng sáng tại điểm giáng
        const R = 70 + dt * 4, g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`); g.addColorStop(0.35, `rgba(147,197,253,${0.5 * a})`); g.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, BF_TAU); ctx.fill();
    }
    // 6) Hố cháy xém + vòng xung kích
    const post = E(t, THF_HIT, THF_HIT + 60);
    if (t >= THF_HIT) {
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade * E(t, THF_HIT, THF_HIT + 6);
        const cr = 30 + 10 * fcOut(E(t, THF_HIT, THF_HIT + 12));
        const g = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, cr * 1.4);
        g.addColorStop(0, 'rgba(8,6,6,0.95)'); g.addColorStop(0.55, 'rgba(28,20,16,0.85)'); g.addColorStop(1, 'rgba(28,20,16,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, f.y, cr * 1.4, cr, 0, 0, BF_TAU); ctx.fill();
        bfCracks(f.x, f.y, 9, cr * 1.9, f.seed, 'rgba(10,8,8,0.9)', 2);
        ctx.globalCompositeOperation = 'lighter';
        const ember = 1 - E(t, THF_HIT + 20, f.dur);
        bfCracks(f.x, f.y, 9, cr * 1.9, f.seed, `rgba(251,146,60,${0.55 * ember})`, 0.9);
        ctx.restore();
        if (post < 1) for (let i = 0; i < 2; i++) {
            const k = E(t, THF_HIT + i * 7, THF_HIT + 40 + i * 7); if (k <= 0 || k >= 1) continue;
            ctx.strokeStyle = i ? `rgba(147,197,253,${1 - k})` : `rgba(253,224,71,${1 - k})`; ctx.lineWidth = 5 * (1 - k) + 1;
            ctx.beginPath(); ctx.ellipse(f.x, f.y, 20 + k * 150, (20 + k * 150) * 0.6, 0, 0, BF_TAU); ctx.stroke();
        }
        // xác xe cháy đen
        bfBody(f.x, f.y, f.vw * 0.9, f.vh * 0.9, 0.15, fade * 0.95, '#475569');
        // hồ quang bò trên xác xe
        const arcA = fade * (1 - E(t, 165, 190)), ts = Math.floor(t / 3);
        if (t > THF_HIT + 4 && arcA > 0) {
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 4; i++) {
                const a0 = thfR(f.seed + ts, i) * BF_TAU, a1 = a0 + 0.8 + thfR(f.seed + ts, i + 5) * 1.6, r0 = f.vw * 0.35, r1 = f.vw * (0.5 + thfR(f.seed + ts, i + 11) * 0.6);
                thfArc(f.x + Math.cos(a0) * r0, f.y + Math.sin(a0) * r0, f.x + Math.cos(a1) * r1, f.y + Math.sin(a1) * r1, f.seed + ts + i, i % 2 ? `rgba(250,204,21,${0.6 * arcA})` : `rgba(96,165,250,${0.7 * arcA})`, 1.2);
            }
        }
        // khói bốc lên
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 6; i++) {
            const k = ((t - THF_HIT) / 70 + thfR(f.seed, i + 60)) % 1, sx = f.x + (thfR(f.seed, i + 70) - 0.5) * 40 + Math.sin(k * 4 + i) * 6;
            ctx.fillStyle = `rgba(40,44,56,${0.45 * (1 - k) * fade})`;
            ctx.beginPath(); ctx.arc(sx, f.y + A * k * 70, 6 + k * 14, 0, BF_TAU); ctx.fill();
        }
    }
    ctx.restore();
    // 7) Chớp trắng toàn màn hình
    if (t >= THF_HIT - 1 && t < THF_HIT + 18) {
        const dt = t - THF_HIT, a = dt < 0 ? 0.5 : dt < 2 ? 0.92 : (dt === 9 || dt === 15) ? 0.4 : Math.max(0, 0.5 - dt * 0.07);
        ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = dt < 3 ? `rgba(255,255,255,${a})` : `rgba(219,234,254,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // 8) Khung điện ảnh + tiêu đề
    fcVignette(0.6 * dark, '#020617');
    fcLetterbox(fcBarK(t, 16, f.dur - 20, f.dur), '#facc15');
    const tk = E(t, THF_HIT + 16, THF_HIT + 36) * fade;
    fcTitle('LÔI THẦN GIÁNG THẾ', 'SẤM CHỚP · THIÊN PHẠT', tk, { c: '#facc15', c2: '#bfdbfe', size: 28, sw: E(t, THF_HIT + 30, THF_HIT + 60) });
}
