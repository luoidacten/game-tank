// ==========================================
// DJ (dj) — Logic: Bàn Phối Nhạc, Cảm Âm Hoàn Hảo / Loạn Âm, Combo & Sóng Âm
// "Lắng nghe nhịp điệu nào!"
// ------------------------------------------
// Nhịp tính bằng TICK của chính xe (p.djTick tăng mỗi tick ở host) -> chạy đúng với đồng hồ giả
// và khi online (host chấm Perfect/Miss cho cả 2 xe; guest chỉ vẽ nốt từ trạng thái đồng bộ).
// Nốt nhạc: p.djNotes = [{ t: tick chạm tâm, hit, beat }]
// ==========================================

// Độ khó bản nhạc: interval = số tick giữa 2 nốt, approach = thời gian nốt chạy vào tâm,
// perf = nửa cửa sổ Hoàn Hảo (tick), yel = độ dài vùng Vàng trước tâm (tick)
const DJ_DIFFS = [
    { name: 'DỄ 🎵', short: 'DỄ', interval: 40, approach: 80, perf: 6, yel: 14, color: '#22d3ee' },
    { name: 'TRUNG BÌNH 🎶', short: 'TB', interval: 40 / 1.4, approach: 68, perf: 5, yel: 12, color: '#a78bfa' }, // +40% mật độ
    { name: 'KHÓ 🔥', short: 'KHÓ', interval: 40 / 1.8, approach: 56, perf: 4.5, yel: 10, color: '#fb7185' },      // +80% mật độ
    { name: 'HUYỀN THOẠI 👑', short: 'HT', interval: 15, approach: 46, perf: 4, yel: 8, color: '#facc15' },          // Full Evo
];
const DJ_HOLD_TICKS = 24;    // giữ ~0.4s: đổi bản nhạc
const DJ_LOCK_TICKS = 90;    // hết đạn vì bấm trượt: khóa xám 1.5s
const DJ_EARLY_BONUS = 3;    // vàng sát tâm (sớm tối đa 3 tick ngoài vùng đỏ) vẫn tính Hoàn Hảo
const DJ_LATE_KEEP = 14;     // nốt đã qua tâm còn hiển thị thêm bao lâu
const DJ_COLORS = { red: '#ff1744', yellow: '#ffd60a', blue: '#2f6bff', lock: '#64748b' };

function djFull(p) { return p.hasUpgrade('evo_dj_1') && p.hasUpgrade('evo_dj_2'); }
function djMaxDiff(p) { return djFull(p) ? 3 : 2; }
function djDiffOf(p) { return DJ_DIFFS[Math.max(0, Math.min(djMaxDiff(p), p.djDiff | 0))]; }
function djMaxGuards(p) { return djFull(p) ? 6 : (p.hasUpgrade('evo_dj_1') ? 3 : 0); }

// Bậc buff theo combo (mỗi 10 combo +1 bậc). Full Evo: nhiều bậc hơn & mạnh hơn
function djTier(p) { return Math.min(djFull(p) ? 12 : 10, Math.floor((p.djCombo || 0) / 10)); }
function djSpeedMult(p) { return 1 + djTier(p) * (djFull(p) ? 0.03 : 0.02); }
function djDmgMult(p) { return 1 + djTier(p) * (djFull(p) ? 0.06 : 0.04); }

// Tick hiển thị: host = djTick; guest nội suy từ ảnh chụp gần nhất cho nốt chạy mượt
function djViewTick(p) {
    let t = p.djTick || 0;
    if (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline && onlineManager.role === 'guest' && onlineManager.lastSnapshotAt) {
        t += Math.max(0, Math.min(6, (Date.now() - onlineManager.lastSnapshotAt) / TICK_TIME));
    }
    return t;
}

// Tick dùng để chấm điểm: online, host bù độ trễ cho phím của guest (guest thấy nhịp trễ hơn host)
function djJudgeTick(p) {
    let t = p.djTick || 0;
    if (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline && onlineManager.role === 'host' && p.id === 2) {
        t -= Math.min(15, Math.round((onlineManager.pingMs || 0) / TICK_TIME));
    }
    return t;
}

// Nốt gần nhất chưa bị đánh, chưa trôi quá vùng đỏ. d = khoảng cách (tick) tới tâm, > 0 là đang tới
function djNearest(p, tick) {
    const diff = djDiffOf(p);
    let best = null, bd = 1e9;
    for (const n of (p.djNotes || [])) {
        if (n.hit) continue;
        const d = n.t - tick;
        if (d < -diff.perf) continue;
        if (Math.abs(d) < Math.abs(bd)) { bd = d; best = n; }
    }
    return { note: best, d: bd };
}

// Pha màu nút Bắn: 'lock' | 'red' | 'yellow' | 'blue'
function djPhase(p, tick) {
    if ((p.djLock || 0) > 0) return 'lock';
    const diff = djDiffOf(p);
    const { note, d } = djNearest(p, tick === undefined ? djViewTick(p) : tick);
    if (!note) return 'blue';
    if (Math.abs(d) <= diff.perf) return 'red';
    if (d > 0 && d <= diff.perf + diff.yel) return 'yellow';
    return 'blue';
}

// Smart bot: bấm khi nút đỏ, tỉ lệ bắt nhịp tăng theo cấp bot (quyết định 1 lần mỗi nốt)
function djBotWantsTap(bot, level) {
    if (!bot || bot.weapon !== 'dj' || (bot.djLock || 0) > 0) return false;
    const tick = bot.djTick || 0;
    const { note, d } = djNearest(bot, tick);
    if (!note || Math.abs(d) > djDiffOf(bot).perf - 1) return false;
    if (bot.djBotNote === note.t) return false;
    bot.djBotNote = note.t;
    const acc = 0.45 + 0.1 * Math.max(1, Math.min(5, level || 3));
    if (Math.random() < acc) return true;
    // Bot "trượt nhịp": hiếm khi bấm bừa
    return Math.random() < 0.15;
}

function djCenter(p) { return { x: p.x + p.w / 2, dirY: p.id === 1 ? -1 : 1 }; }

// ---- Bắn sóng âm ----
// kind: 'perfect' | 'miss' | 'speaker'
function djFireWave(p, kind, dmg, opts = {}) {
    const { x: cx, dirY } = djCenter(p);
    const ox = opts.ox || 0;
    const size = kind === 'perfect' ? { w: 50, h: 14, v: 6.6 } : (kind === 'miss' ? { w: 26, h: 9, v: 5.2 } : { w: 24, h: 9, v: 6.2 });
    const b = spawnBullet(p, {
        x: cx + ox - size.w / 2,
        y: dirY < 0 ? p.y - size.h - 2 : p.y + p.h + 2,
        w: size.w, h: size.h, vx: 0, vy: dirY * size.v,
        dmg, hook: 'dj', djKind: kind, djDir: dirY, djAge: 0,
        isPiercing: !!opts.pierce, djBoom: !!opts.boom, djZone: !!opts.zone, djBoomed: false,
        djHue: opts.hue || (kind === 'perfect' ? 0 : 1),
    });
    return b;
}

// Phát hiệu ứng tại điểm nổ (Evo 2: 30 combo nổ, 60 combo để lại Vùng Âm Nhiệt)
function djImpact(b, owner, x, y) {
    if (!owner || owner.weapon !== 'dj' || b.djBoomed) return;
    if (!b.djBoom && !b.djZone) return;
    b.djBoomed = true;
    if (b.djBoom) {
        explosions.push(new Explosion(x, y, 44, 'rgba(255, 60, 200,', Math.max(0.2, b.dmg * 0.45), owner));
        spawnSparkParticles(x, y, '#ff3dcf', 8);
    }
    if (b.djZone) {
        const mine = bodyEffects.filter(e => e.isDjZone && e.owner === owner && e.active);
        if (mine.length >= 3) mine[0].active = false;
        bodyEffects.push(new DjSoundZone(x, y, owner, djFull(owner) ? 34 : 28, 150));
    }
}

BulletHooks.register('dj', {
    hit(b, attacker, victim) {
        if (!attacker || attacker.weapon !== 'dj') return;
        // Sóng Âm Hoàn Hảo: xung âm làm chậm nhẹ
        if (b.djKind === 'perfect' && victim) {
            victim.djSlowT = Math.max(victim.djSlowT || 0, 54);
            spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff2fd1', 6);
        }
        djImpact(b, attacker, b.x + b.w / 2, victim ? victim.y + victim.h / 2 : b.y + b.h / 2);
    },
    obstacle(b, owner) { djImpact(b, owner, b.x + b.w / 2, b.y + b.h / 2); },
    edge(b, owner) {
        // Chạm mép sân phía sau đối thủ -> nổ ở làn của đối thủ
        const enemy = owner === p1 ? p2 : p1;
        const y = enemy ? enemy.y + enemy.h / 2 : b.y;
        djImpact(b, owner, Math.max(10, Math.min(canvas.width - 10, b.x + b.w / 2)), y);
    },
});

// Khi bấm (cạnh lên) — chấm điểm tại thời điểm nhấn
function djJudgePress(p) {
    const diff = djDiffOf(p);
    const { note, d } = djNearest(p, djJudgeTick(p));
    if (note && d >= -diff.perf && d <= diff.perf + DJ_EARLY_BONUS) {
        note.hit = true; // tiêu thụ nốt ngay để vạch nốt nổ sáng
        p.djPend = { k: 'perfect', t: note.t };
    } else {
        p.djPend = { k: 'miss', t: -1 };
    }
}

function djGainCombo(p, n) {
    const before = p.djCombo || 0;
    p.djCombo = before + n;
    p.djBest = Math.max(p.djBest || 0, p.djCombo);
    const cx = p.x + p.w / 2, ty = p.id === 1 ? p.y - 40 : p.y + p.h + 40;
    const cross = (step) => Math.floor(p.djCombo / step) > Math.floor(before / step);
    if (cross(30)) {
        p.shield = (p.shield || 0) + 1;
        addFloatingText(cx, ty, `COMBO ${Math.floor(p.djCombo / 30) * 30}! +1 KHIÊN 🛡️`, '#22d3ee', 13);
        const g = djMaxGuards(p);
        if (g > 0) p.djGuards = g; // Evo 1 / Full: hồi lượt bảo hộ
    }
    if (cross(45)) {
        p.hp = Math.min(p.maxHp, p.hp + 1);
        addFloatingText(cx, ty - 14, '+1 HP 🎧', '#4ade80', 13);
    }
    if (Math.floor(p.djCombo / 10) > Math.floor(before / 10)) p.djTierFx = 30; // vòng sáng khi lên bậc
    if (p.hasUpgrade('evo_dj_2')) {
        [[15, 'XUYÊN THẤU'], [30, 'BÙNG NỔ'], [60, 'VÙNG ÂM NHIỆT'], [120, 'HITSCAN']].forEach(([m, name]) => {
            if (before < m && p.djCombo >= m) addFloatingText(cx, ty - 28, `MỞ KHÓA: ${name}! 🎶`, '#f0abfc', 13);
        });
    }
}

// Thả nút (< 0.4s): thực hiện phát bắn đã chấm
function djExecute(p) {
    const pend = p.djPend; p.djPend = null;
    if (!pend || (p.djLock || 0) > 0) return;
    let kind = pend.k;
    const full = djFull(p);
    if (kind === 'miss') {
        // Loạn Âm: tốn 1 đạn, sóng nhỏ, nửa sát thương
        if ((p.djGuards || 0) > 0) {
            p.djGuards--;
            if (full && p.djGuards === 0) {
                // Full Evo: lần sai thứ 6 -> hệ thống tự đánh nốt chuẩn
                kind = 'auto';
            } else {
                p.djFb = { k: 'guard', t: p.djTick };
            }
        } else {
            if ((p.djCombo || 0) >= 5) addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 40 : p.y + p.h + 40, `ĐỨT CHUỖI ${p.djCombo}! 💔`, '#94a3b8', 12);
            p.djCombo = 0;
            p.djFb = { k: 'miss', t: p.djTick };
        }
        if (kind === 'miss') {
            djFireWave(p, 'miss', p.damage * djDmgMult(p) * 0.5);
            p.ammo = Math.max(0, (p.ammo || 0) - 1);
            p.lastShot = Date.now();
            if (p.ammo <= 0) {
                p.djLock = DJ_LOCK_TICKS;
                addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 26 : p.y + p.h + 26, 'LOẠN ÂM! NẠP ĐẠN... 🔇', '#94a3b8', 12);
            }
            if (soundSystem && !soundSystem.muted) soundSystem.playTone(140, 'square', 0.12, 0.12);
            return;
        }
    }
    // Cảm Âm Hoàn Hảo (hoặc Auto-Play): không tốn đạn, +combo
    djGainCombo(p, full ? 2 : 1);
    p.djFb = { k: kind === 'auto' ? 'auto' : 'perfect', t: p.djTick };
    if (kind === 'auto') addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 40 : p.y + p.h + 40, 'AUTO-PLAY! 🤖🎶', '#facc15', 13);
    const evo2 = p.hasUpgrade('evo_dj_2');
    const c = p.djCombo;
    const dmg = p.damage * djDmgMult(p);
    const traits = { pierce: evo2 && c >= 15, boom: evo2 && c >= 30, zone: evo2 && c >= 60 };
    p.djPulse = 1;
    if (evo2 && c >= 120) {
        // Sóng âm hitscan tức thời
        // Sóng âm hitscan: cảnh báo 0.5s (khoá cột) rồi mới bắn
        scheduleHitscan(p, 30, '#e879f9', 30, () => { const beam = new DjBeam(p, p.x + p.w / 2, dmg, traits); bodyEffects.push(beam); beam.fire(); });
    } else {
        djFireWave(p, 'perfect', dmg, traits);
    }
    if (soundSystem && !soundSystem.muted) {
        const base = [523, 587, 659, 784, 880][c % 5];
        soundSystem.playTone(base, 'triangle', 0.16, 0.16);
    }
}

// Lên lịch nốt nhạc & xử lý nhịp mỗi tick
function djTickBeat(p) {
    const diff = djDiffOf(p);
    p.djTick = (p.djTick || 0) + 1;
    const tick = p.djTick;
    if (!p.djNotes) p.djNotes = [];
    if (typeof p.djNext !== 'number' || p.djNext < tick) p.djNext = tick + diff.approach;
    while (p.djNext <= tick + diff.approach) {
        p.djNotes.push({ t: Math.round(p.djNext), hit: false, beat: false });
        p.djNext += diff.interval;
    }
    for (const n of p.djNotes) {
        if (!n.beat && tick >= n.t) {
            n.beat = true;
            p.djBeatN = (p.djBeatN || 0) + 1;
            p.djPulse = Math.max(p.djPulse || 0, 0.6);
            djOnBeat(p);
        }
    }
    p.djNotes = p.djNotes.filter(n => n.t >= tick - DJ_LATE_KEEP);
}

// Mỗi nhịp: Full Evo — 2 Loa nổi luân phiên bắn sóng âm phụ
function djOnBeat(p) {
    if (!djFull(p) || p.hp <= 0) return;
    if (p.freezeTimer > 0 || p.silenceTimer > 0) return;
    const side = (p.djBeatN % 2) ? -1 : 1;
    p.djSpkFx = side; p.djSpkT = 10;
    djFireWave(p, 'speaker', p.damage * djDmgMult(p) * 0.35, { ox: side * 30 });
}

CharHooks.register('dj', {
    setup() {
        this.djTick = 0; this.djNotes = []; this.djNext = undefined;
        if (typeof this.djDiff !== 'number') this.djDiff = 0;
        this.djDiff = Math.min(this.djDiff, djMaxDiff(this));
        this.djCombo = djFull(this) ? 30 : 0; // Full Evo: khởi đầu với 30 combo
        this.djBest = this.djCombo;
        this.djGuards = djMaxGuards(this);
        this.djLock = 0; this.djHold = 0; this.djPrevS = false; this.djPend = null;
        this.djFb = null; this.djPulse = 0; this.djBeatN = 0; this.djSpkT = 0; this.djSpkFx = 0;
        this.djTierFx = 0; this.djBotNote = -1;
        this.reloadTime = Math.max(this.reloadTime, 1200);
    },

    update() {
        djTickBeat(this);
        if (this.djLock > 0) {
            if (--this.djLock === 0) { this.ammo = this.maxAmmo; addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 26 : this.y + this.h + 26, 'SẴN SÀNG! 🎧', '#22d3ee', 11); }
            else this.lastShot = Date.now(); // không tự hồi đạn lẻ khi đang khóa
        }
        if (this.djPulse > 0) this.djPulse = Math.max(0, this.djPulse - 0.08);
        if (this.djSpkT > 0) this.djSpkT--;
        if (this.djTierFx > 0) this.djTierFx--;
        // Làm chậm nhẹ từ Sóng Âm Hoàn Hảo lên đối thủ
        const enemy = this === p1 ? p2 : p1;
        if (enemy && enemy.djSlowT > 0) { enemy.djSlowT--; addStatusSlow(enemy, 0.7); }
    },

    speed(s) { return s * djSpeedMult(this); },

    shoot(inp) {
        const s = !!inp.s;
        if (s && !this.djPrevS) {
            this.djHold = 0;
            if (this.djLock > 0) this.djPend = null;
            else djJudgePress(this);
        }
        if (s) {
            this.djHold++;
            if (this.djHold === DJ_HOLD_TICKS) {
                // Đổi bản nhạc (bỏ phát bắn đang chờ)
                this.djPend = null;
                this.djDiff = ((this.djDiff | 0) + 1) % (djMaxDiff(this) + 1);
                const d = djDiffOf(this);
                // Xóa nốt chưa tới, lên lịch lại theo nhịp mới
                this.djNotes = this.djNotes.filter(n => n.t <= this.djTick);
                this.djNext = this.djTick + d.approach * 0.6;
                addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 30 : this.y + this.h + 30, `BẢN NHẠC: ${d.name}`, d.color, 13);
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            }
        } else if (this.djPrevS) {
            if (this.djHold < DJ_HOLD_TICKS) djExecute(this);
            this.djPend = null;
            this.djHold = 0;
        }
        this.djPrevS = s;
        return true;
    },

    roundEnd() { this.djPend = null; this.djLock = 0; },
});

// ==========================================
// Thực thể: Vùng Âm Nhiệt (Evo 2 — 60 combo): thiêu đốt + làm chậm
// ==========================================
class DjSoundZone {
    constructor(x, y, owner, r = 28, life = 150) {
        this.x = x; this.y = y; this.owner = owner; this.r = r;
        this.life = life; this.maxLife = life; this.active = true; this.isDjZone = true;
        zoneFit(this);
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const enemy = this.owner === p1 ? p2 : p1;
        if (!enemy || enemy.hp <= 0) return;
        if (zoneDist(enemy.x + enemy.w / 2 - this.x, enemy.y + enemy.h / 2 - this.y) < this.r + enemy.w / 2) {
            addStatusSlow(enemy, 0.6);
            if (this.life % 30 === 0) enemy.takeDamage(0.15 * (djFull(this.owner) ? 1.4 : 1), this.owner, { isEnvironmental: true, isDot: true });
        }
    }
    draw() {
        if (!this.active) return;
        const k = Math.min(1, this.life / 25);
        const age = this.maxLife - this.life;
        ctx.save();
        ctx.globalAlpha = k;
        const hw = this.r * ZONE_AX, hh = this.r * ZONE_AY;
        const g = ctx.createLinearGradient(this.x - hw, this.y, this.x + hw, this.y);
        g.addColorStop(0, 'rgba(255, 60, 200, 0.10)');
        g.addColorStop(0.5, 'rgba(255, 120, 40, 0.28)');
        g.addColorStop(1, 'rgba(255, 60, 200, 0.10)');
        ctx.fillStyle = g;
        zoneRectPath(this.x, this.y, this.r); ctx.fill();
        ctx.strokeStyle = '#ff3dcf'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -age * 0.6;
        ctx.stroke(); ctx.setLineDash([]);
        // Cột equalizer nhảy múa trong vùng
        const bars = 9, bw = (hw * 2 - 8) / bars;
        for (let i = 0; i < bars; i++) {
            const v = 0.35 + 0.65 * Math.abs(Math.sin(age * 0.18 + i * 1.7));
            const bh = (hh * 2 - 6) * v;
            ctx.fillStyle = i % 2 ? 'rgba(255, 140, 40, 0.75)' : 'rgba(255, 60, 200, 0.75)';
            ctx.fillRect(this.x - hw + 4 + i * bw + 1, this.y + hh - 3 - bh, bw - 2, bh);
        }
        ctx.restore();
    }
}

// ==========================================
// Thực thể: Sóng âm Hitscan (Evo 2 — 120 combo)
// ==========================================
class DjBeam {
    constructor(owner, x, dmg, traits = {}) {
        this.owner = owner; this.x = x; this.dmg = dmg;
        this.boom = !!traits.boom; this.zone = !!traits.zone;
        this.life = 16; this.active = true; this.hitY = null;
    }
    fire() {
        const enemy = this.owner === p1 ? p2 : p1;
        const half = 26;
        if (enemy && enemy.hp > 0 && this.x > enemy.x - half && this.x < enemy.x + enemy.w + half) {
            enemy.takeDamage(this.dmg, this.owner);
            enemy.djSlowT = Math.max(enemy.djSlowT || 0, 54);
            this.hitY = enemy.y + enemy.h / 2;
            const fake = { djBoom: this.boom, djZone: this.zone, djBoomed: false, dmg: this.dmg };
            djImpact(fake, this.owner, this.x, this.hitY);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
    }
    update() { if (--this.life <= 0) this.active = false; }
    draw() {
        if (!this.active) return;
        const o = this.owner;
        const k = this.life / 16;
        const top = o.id === 1 ? 0 : o.y + o.h;
        const bot = o.id === 1 ? o.y : canvas.height;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(this.x - 26, 0, this.x + 26, 0);
        g.addColorStop(0, 'rgba(255, 40, 200, 0)');
        g.addColorStop(0.5, 'rgba(255, 90, 230, 0.55)');
        g.addColorStop(1, 'rgba(255, 40, 200, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(this.x - 26, top, 52, bot - top);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.shadowBlur = 16; ctx.shadowColor = '#ff2fd1';
        ctx.beginPath(); ctx.moveTo(this.x, top); ctx.lineTo(this.x, bot); ctx.stroke();
        // Vòng sóng âm dọc tia
        const dir = o.id === 1 ? -1 : 1;
        const y0 = o.id === 1 ? o.y : o.y + o.h;
        ctx.strokeStyle = '#ff7ae6'; ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
            const yy = y0 + dir * (((16 - this.life) * 30 + i * 90) % Math.max(1, bot - top));
            ctx.beginPath(); ctx.ellipse(this.x, yy, 24, 6, 0, dir < 0 ? Math.PI : 0, dir < 0 ? Math.PI * 2 : Math.PI); ctx.stroke();
        }
        ctx.restore();
    }
}
