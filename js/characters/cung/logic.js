// ==========================================
// Cung (cung) — Logic
// ------------------------------------------
// Nhấp nút Bắn: bắn theo KIỂU hiện tại.
// Giữ 0.5s: đổi kiểu (Tụ Lực -> Liên Hoàn -> Bắn 3 Mũi). Giữ 2.5s: vào trạng thái NGẮM
//   (giữ nguyên kiểu cũ): hồng tâm đuổi theo địch & thu hẹp dần (tối đa 5s), nhả nút -> Thiên Tiễn
//   (hồng tâm khóa đỏ 0.5s rồi mũi tên khổng lồ từ trời cắm xuống; hẹp càng lâu càng đau).
//  1. Tụ Lực   : cung tự kéo dây (nhanh), nhấp nhả 1 mũi — kéo càng căng mũi càng to/mạnh/nhanh; nhịp bắn rất chậm.
//  2. Liên Hoàn: 1 nhấp = loạt 5 mũi rất nhanh, sát thương thấp, tốc đạn thường; có hồi giữa các loạt.
//  3. Bắn 3 Mũi: 3 mũi tỏa 3 hướng, sát thương vừa, bay nhanh, nhịp vừa.
// Evo 1 Cung Thần: Tụ Lực kéo nhanh hơn + căng tối đa thì xuyên thủng; Liên Hoàn 7 mũi; Bắn 3 Mũi -> 5 mũi.
// Evo 2 Mưa Tên: Thiên Tiễn kéo theo trận Mưa Tên trút xuống hồng tâm; hồi Ngắm nhanh hơn.
// Full Evo Vạn Tiễn: Mưa Tên phủ KHẮP sân định kỳ (rải đều cả bề ngang, số mũi theo sát thương),
//   Nhạy Bén hồi 5s, Ngắm hồi 5s.
// Nội tại Nhạy Bén: tự né 1 đòn mỗi 8s (xử lý ở js/player/combat.js).
// Toàn bộ trạng thái là trường số/bool trên player -> đồng bộ online.
// ==========================================

const BOW_MODES = [
    { name: 'TỤ LỰC', icon: '🏹', color: '#ffc83d' },
    { name: 'LIÊN HOÀN', icon: '⚡', color: '#3dffb0' },
    { name: 'BẮN 3 MŨI', icon: '🔱', color: '#38c8ff' },
];
const BOW_CYCLE_T = 30;     // giữ 0.5s -> đổi kiểu
const BOW_AIM_T = 150;      // giữ 2.5s -> vào Ngắm
const BOW_AIM_MAX = 300;    // ngắm tối đa 5s
const BOW_AIM_R0 = 100, BOW_AIM_R1 = 24;

function bowEvo1(p) { return p.hasUpgrade('evo_cung_1'); }
function bowEvo2(p) { return p.hasUpgrade('evo_cung_2'); }
function bowFull(p) { return bowEvo1(p) && bowEvo2(p); }
function bowAimCDMax(p) { return bowFull(p) ? 300 : (bowEvo2(p) ? 420 : 480); }
function bowEnemy(p) { return p === p1 ? p2 : p1; }

// Bắn 1 mũi tên theo góc lệch (rad) so với hướng thẳng tới địch
function bowArrow(p, off, speed, dmg, kind, o = {}) {
    const dirY = p.id === 1 ? -1 : 1;
    const w = o.w || 6, h = o.h || 12;
    p.bowNockT = 8;
    return spawnBullet(p, Object.assign({
        type: 'arrow', bowKind: kind,
        x: p.x + p.w / 2 - w / 2, y: p.id === 1 ? p.y - h : p.y + p.h,
        w, h, vx: Math.sin(off) * speed, vy: dirY * Math.cos(off) * speed, dmg,
    }, o));
}

function bowTapFire(p, now) {
    if (p.bowCD > 0 || p.bowBurst > 0 || p.ammo <= 0) return;
    const d = p.damage, e1 = bowEvo1(p);
    if (p.bowMode === 0) {
        // Tụ Lực: kéo càng căng mũi càng to, mạnh, nhanh
        const c = Math.max(0, Math.min(1, p.bowDraw || 0));
        const max = c >= 1;
        bowArrow(p, 0, C.bulletSpeed * (1.05 + 0.95 * c), d * (1 + 2 * c), 'charge', {
            bowC: c, w: Math.round(6 + 6 * c), h: Math.round(12 + 12 * c), isPiercing: e1 && max,
        });
        p.bowDraw = 0;
        p.bowCD = e1 ? 54 : 66;
        if (max) triggerScreenShake(2, 5);
    } else if (p.bowMode === 1) {
        // Liên Hoàn: loạt tên liên tiếp (bắn trong update)
        p.bowBurst = e1 ? 7 : 5;
        p.bowBurstT = 0;
        p.bowCD = 34;
    } else {
        // Bắn 3 Mũi (Evo 1: 5 mũi)
        const offs = e1 ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.2, 0, 0.2];
        offs.forEach(o => bowArrow(p, o, C.bulletSpeed * 1.4, d * (Math.abs(o) > 0.3 ? 0.55 : 0.8), 'triple', { w: 6, h: 12 }));
        p.bowCD = 40;
    }
    p.ammo--;
    p.lastShot = now;
    p.bowRecoil = 8;
    if (soundSystem && !soundSystem.muted && soundSystem.playShoot) soundSystem.playShoot();
}

function bowStartAim(p) {
    const e = bowEnemy(p);
    p.bowAiming = true;
    p.bowAimT = 0;
    p.bowAimX = e ? e.x + e.w / 2 : canvas.width / 2;
    p.bowAimY = e ? e.y + e.h / 2 : canvas.height / 2;
    p.bowAimR = BOW_AIM_R0;
    addFloatingText(p.x + p.w / 2, p.y - 12, '🎯 NGẮM', '#ff3355', 13);
}

function bowReleaseAim(p) {
    const k = Math.min(1, (p.bowAimT || 0) / BOW_AIM_MAX);
    const dmg = p.damage * (2 + 3 * k);
    bodyEffects.push(new BowSkyShot(p, p.bowAimX, p.bowAimY, p.bowAimR, dmg, bowEvo2(p)));
    p.bowAiming = false;
    p.bowAimT = 0;
    p.bowAimCD = bowAimCDMax(p);
    p.ammo = Math.max(0, p.ammo - 1);
    p.lastShot = Date.now();
    p.bowRecoil = 10;
}

Object.assign(Player.prototype, {
    // [setupForNewRound] cung
    setupCung() {
        if (this.weapon !== 'cung') return;
        this.bowMode = this.bowMode || 0;   // giữ kiểu giữa các hiệp
        this.bowHold = 0; this.bowPrevS = false; this.bowModeBefore = this.bowMode;
        this.bowAiming = false; this.bowAimT = 0; this.bowAimX = 0; this.bowAimY = 0; this.bowAimR = BOW_AIM_R0;
        this.bowAimCD = 0; this.bowCD = 0; this.bowDraw = 0; this.bowBurst = 0; this.bowBurstT = 0;
        this.bowRecoil = 0; this.bowNockT = 0;
        this.bowRainT = 90; // Full Evo: Mưa Tên toàn sân sau 1.5s đầu hiệp
        this.bowDodgeReady = true;
        this.bowDodgeCooldown = 0;
        this.bowChargeTimer = 0;
    },
});

CharHooks.register('cung', {
    update() {
        if (this.bowDodgeCooldown > 0 && --this.bowDodgeCooldown <= 0) {
            this.bowDodgeReady = true;
            addFloatingText(this.x + this.w / 2, this.y - 10, '⚡ NHẠY BÉN SẴN SÀNG', '#00ffcc', 13);
        }
        if (this.bowCD > 0) this.bowCD--;
        if (this.bowAimCD > 0) this.bowAimCD--;
        if (this.bowRecoil > 0) this.bowRecoil--;
        if (this.bowNockT > 0) this.bowNockT--;
        // Tụ Lực: dây cung tự kéo khi đã hồi (đầy ~0.9s, Evo 1 ~0.6s)
        if (this.bowMode === 0 && this.bowCD <= 0 && this.ammo > 0 && !this.bowAiming)
            this.bowDraw = Math.min(1, (this.bowDraw || 0) + 1 / (bowEvo1(this) ? 36 : 54));
        // Liên Hoàn: mỗi 4 tick 1 mũi
        if (this.bowBurst > 0 && --this.bowBurstT <= 0) {
            const jit = ((this.bowBurst * 37) % 7 - 3) * 0.012;
            bowArrow(this, jit, C.bulletSpeed, this.damage * 0.3, 'rapid', { w: 5, h: 10 });
            this.bowBurst--;
            this.bowBurstT = 4;
            this.bowRecoil = 3;
        }
        // Full Evo: Mưa Tên phủ khắp sân mỗi 12s
        if (bowFull(this) && --this.bowRainT <= 0) {
            arrowRains.push(new ArrowRain(this, 0, 0, 0, true));
            this.bowRainT = 720;
            addFloatingText(this.x + this.w / 2, this.y - 14, '☔ VẠN TIỄN', '#ffd23f', 14);
        }
    },

    speed(v) { return this.bowAiming ? v * 0.55 : v; },

    shoot(inp, now) {
        const s = !!inp.s;
        if (s) {
            this.bowHold = (this.bowHold || 0) + 1;
            if (this.bowHold === BOW_CYCLE_T) {
                this.bowModeBefore = this.bowMode;
                this.bowMode = (this.bowMode + 1) % 3;
                const M = BOW_MODES[this.bowMode];
                addFloatingText(this.x + this.w / 2, this.y - 12, M.icon + ' ' + M.name, M.color, 13);
            }
            if (this.bowHold === BOW_AIM_T) {
                this.bowMode = this.bowModeBefore; // vào Ngắm thì giữ nguyên kiểu cũ
                if (this.bowAimCD <= 0 && this.ammo > 0) bowStartAim(this);
                else addFloatingText(this.x + this.w / 2, this.y - 12, this.ammo > 0 ? 'NGẮM ⌛' : 'HẾT TÊN', '#94a3b8', 12);
            }
            if (this.bowAiming) {
                this.bowAimT++;
                const e = bowEnemy(this);
                if (e) {
                    const dx = e.x + e.w / 2 - this.bowAimX;
                    this.bowAimX += Math.max(-2.6, Math.min(2.6, dx * 0.12));
                    this.bowAimY = e.y + e.h / 2;
                }
                this.bowAimR = BOW_AIM_R0 - (BOW_AIM_R0 - BOW_AIM_R1) * Math.min(1, this.bowAimT / BOW_AIM_MAX);
                if (this.bowAimT >= BOW_AIM_MAX) bowReleaseAim(this);
            }
        } else if (this.bowPrevS) {
            if (this.bowAiming) bowReleaseAim(this);
            else if (this.bowHold < BOW_CYCLE_T) bowTapFire(this, now);
            this.bowHold = 0;
        }
        this.bowPrevS = s;
        return true;
    },
});
