// ============================================================
// Pháo Lửa (fire_cannon) — KẾT LIỄU "HỎA NGỤC THIÊU RỤI" (chỉ hình ảnh)
//   0-35    màn hình tối đỏ, vết nứt dung nham bò về phía mục tiêu
//   35      CỘT LỬA phun trào từ mặt đất nuốt trọn xe địch + chớp cam
//   35-110  vòng tường lửa toả ra, tàn lửa bay ngược lên trời
//   90-170  tiêu đề, khói tro tan dần
// Thực thể chỉ chứa dữ liệu thuần (có trong NET_CLASSES).
// ============================================================
const FCF_DUR = 175, FCF_HIT = 35;

class FcFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.t = 0; this.dur = FCF_DUR; this.active = true;
    }
    update() {
        this.t++;
        const t = this.t, snd = typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted;
        if (t === FCF_HIT) {
            if (typeof explosions !== 'undefined' && typeof Explosion !== 'undefined') {
                explosions.push(new Explosion(this.x, this.y, 110, 'rgba(255, 110, 20,', 0, null));
                explosions.push(new Explosion(this.x, this.y, 60, 'rgba(255, 220, 120,', 0, null));
            }
            if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(this.x, this.y, '#ff7a1a', 30); spawnSparkParticles(this.x, this.y, '#ffd166', 20); }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(14, 24);
            if (snd && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        if (t === 120 && snd && soundSystem.playWin) soundSystem.playWin();
        if (t >= this.dur) this.active = false;
    }
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const W = canvas.width, H = canvas.height;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [20, this.x, this.y, 1.35], [FCF_HIT, this.x, this.y, 1.5], [110, this.x, this.y, 1.3], [155, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { fcfDraw(this); }
}
function fcfFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof FcFinisher && e.active) e.drawOver();
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
            if (a && a !== this && a.weapon === 'fire_cannon' && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new FcFinisher(a, this));
            }
        }
        return r;
    };
})();

function fcfR(i) { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

function fcfDraw(e) {
    const t = e.t, W = canvas.width, H = canvas.height;
    const fin = Math.min(1, (e.dur - t) / 25);
    const dark = Math.min(1, t / 20) * fin;
    const up = e.team === 1 ? 1 : -1; // hướng từ nạn nhân về giữa sân
    ctx.save();
    // 1) Nền tối đỏ (toạ độ màn hình)
    if (typeof fcScreen === 'function') {
        ctx.save(); fcScreen();
        ctx.fillStyle = `rgba(30,4,0,${0.5 * dark})`; ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }
    // 2) Vết nứt dung nham bò từ xe thắng tới mục tiêu (tắt dần sau cú phun)
    const crack = Math.min(1, t / FCF_HIT), ca = fin * Math.max(0, 1 - Math.max(0, t - FCF_HIT) / 30);
    if (ca > 0) {
        ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let k = 0; k < 3; k++) {
            ctx.beginPath(); ctx.moveTo(e.ox, e.oy);
            const N = 18;
            for (let i = 1; i <= Math.ceil(N * crack); i++) {
                const f = i / N, s = Math.sin(f * Math.PI);
                ctx.lineTo(e.ox + (e.x - e.ox) * f + (fcfR(k * 40 + i) - 0.5) * 12 * s + (k - 1) * 16 * s, e.oy + (e.y - e.oy) * f);
            }
            ctx.strokeStyle = k === 1 ? `rgba(255,236,170,${ca})` : `rgba(255,${110 + Math.floor(60 * Math.sin(t * 0.3 + k))},30,${0.85 * ca})`;
            ctx.lineWidth = k === 1 ? 2.6 : 1.6;
            ctx.stroke();
        }
    }
    if (t >= FCF_HIT) {
        const u = t - FCF_HIT;
        // 3) Cột lửa phun trào nuốt trọn xác xe
        const rise = Math.min(1, u / 10), fall = Math.max(0, 1 - Math.max(0, u - 70) / 50);
        const colH = H * 0.42 * rise, colW = 40 + Math.sin(u * 0.4) * 5;
        ctx.globalAlpha = fall * fin;
        const cg = ctx.createLinearGradient(e.x, e.y, e.x, e.y + up * colH);
        cg.addColorStop(0, 'rgba(255,250,220,0.95)'); cg.addColorStop(0.25, 'rgba(255,170,40,0.85)'); cg.addColorStop(0.7, 'rgba(255,60,10,0.45)'); cg.addColorStop(1, 'rgba(120,10,0,0)');
        ctx.fillStyle = cg; ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.moveTo(e.x - colW, e.y - up * 10);
        for (let i = 0; i <= 12; i++) { const f = i / 12; ctx.lineTo(e.x - colW * (1 - f * 0.75) + Math.sin(u * 0.5 + i) * 6, e.y + up * colH * f); }
        for (let i = 12; i >= 0; i--) { const f = i / 12; ctx.lineTo(e.x + colW * (1 - f * 0.75) + Math.sin(u * 0.5 + i + 2) * 6, e.y + up * colH * f); }
        ctx.closePath(); ctx.fill();
        // lưỡi lửa liếm quanh chân cột
        for (let i = 0; i < 9; i++) {
            const fx = e.x + (i - 4) * 12, fh = (18 + 14 * fcfR(i)) * (0.7 + 0.3 * Math.sin(u * 0.6 + i)) * rise;
            ctx.fillStyle = i % 2 ? 'rgba(255,120,30,0.9)' : 'rgba(255,215,110,0.9)';
            ctx.beginPath(); ctx.moveTo(fx - 6, e.y); ctx.quadraticCurveTo(fx, e.y + up * fh * 1.4, fx + 6, e.y); ctx.closePath(); ctx.fill();
        }
        // 4) Vòng tường lửa toả ra dọc làn
        const rr = Math.min(1, u / 60);
        ctx.globalAlpha = (1 - rr) * fin; ctx.shadowBlur = 18;
        ctx.strokeStyle = '#ffb020'; ctx.lineWidth = 8 * (1 - rr) + 2;
        ctx.beginPath(); ctx.ellipse(e.x, e.y, 30 + rr * W * 0.7, 12 + rr * 50, 0, 0, Math.PI * 2); ctx.stroke();
        // 5) Tàn lửa bay lên
        ctx.shadowBlur = 6;
        for (let i = 0; i < 40; i++) {
            const f = ((u * (0.6 + fcfR(i) * 0.8) + fcfR(i + 99) * 120) % 120) / 120;
            const px = e.x + (fcfR(i + 7) - 0.5) * 220 + Math.sin(u * 0.08 + i) * 10;
            const py = e.y + up * f * H * 0.5;
            ctx.fillStyle = i % 3 ? 'rgba(255,170,50,0.9)' : 'rgba(255,240,180,0.9)';
            ctx.globalAlpha = fin * (1 - f);
            ctx.fillRect(px, py, 2.2, 2.2);
        }
    }
    ctx.restore();
    // 6) Chớp cam toàn màn hình
    if (t >= FCF_HIT && t < FCF_HIT + 12 && typeof fcScreen === 'function') {
        ctx.save(); fcScreen(); ctx.fillStyle = `rgba(255,200,120,${0.6 * (1 - (t - FCF_HIT) / 12)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // 7) Khung điện ảnh + tiêu đề (helper chung js/render/finisher-cinema.js)
    if (typeof fcVignette === 'function') fcVignette(0.55 * dark, '#1c0500');
    if (typeof fcLetterbox === 'function' && typeof fcBarK === 'function') fcLetterbox(fcBarK(t, 12, e.dur - 20, e.dur), '#ff7a1a');
    if (typeof fcTitle === 'function') {
        const tk = Math.max(0, Math.min(1, (t - FCF_HIT - 18) / 20)) * fin;
        fcTitle('HỎA NGỤC THIÊU RỤI', 'PHÁO LỬA · TƯỜNG LỬA BẤT DIỆT', tk, { c: '#ff8a1a', c2: '#ffe2a8', size: 28, sw: Math.max(0, Math.min(1, (t - FCF_HIT - 30) / 30)) });
    }
}
