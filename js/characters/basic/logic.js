// ==========================================
// Cơ Bản (basic) — Logic: Thiên Phú Bẩm Sinh, Thức Tỉnh "MAIN" (Hồi Ức), Cơ Hội Cuối
// ------------------------------------------
// • Bản thường: Evo mua trong shop như mọi body (Evo 2 = Bản Lĩnh: +2 đạn, nạp nhanh hơn 15%).
// • Bản MAIN (8% mỗi trận, hoặc chọn thẳng "MAIN" trong Phòng Tập): xe mang tên MAIN + khẩu hiệu
//   "Chiến đấu đến khi lửa tàn!!", THIÊN PHÚ BẨM SINH (có sẵn Full Evo) và nội tại HỒI ỨC.
// • HỒI ỨC (chỉ bản MAIN): lần ĐẦU TIÊN trong TRẬN bị đối thủ hạ gục -> hồi sinh 100% máu, chuyển VĨNH VIỄN
//   sang dạng MAIN (x2 Max HP, +1 Dame/viên, 10 đạn), sóng xung kích đẩy lùi + xoá đạn địch gần, bất tử 3s.
// • CƠ HỘI CUỐI (chỉ dạng MAIN, hiệp quyết định = đối thủ chạm điểm thắng, gồm 2-2):
//   Tốc chạy +20%, nạp đạn nhanh hơn 25%, Max HP +3, 2 Khiên; "Sức Mạnh Hợp Nhất":
//   đạn to x2 + xuyên vật cản, trúng đích -> làm chậm 1s + thiêu đốt (DoT 0.4) + nổ lan AoE 0.4,
//   chạm đúp ← / → để Lướt Tốc Biến (bất tử 0.25s, hồi 3s).
// Mọi trạng thái là trường thuần trên player / thực thể bodyEffects -> an toàn online.
// ==========================================

const MAIN_SLOGAN = 'Chiến đấu đến khi lửa tàn!!';

Object.assign(Player.prototype, {
    // [setupForNewRound] Cơ Bản (gọi giữa setup, trước chỉ số chân/khiên)
    setupBasic() {
        if (this.weapon !== 'basic') return;
        // Bản MAIN: 8% mỗi trận (Player tạo mới mỗi trận -> roll 1 lần/trận); Phòng Tập có thể chọn thẳng
        if (this.mainEgg === undefined) this.mainEgg = Math.random() < 0.08;
        // Thiên Phú Bẩm Sinh (chỉ bản MAIN): tự sở hữu Full Evo
        if (this.mainEgg) ['evo_basic_1', 'evo_basic_2'].forEach(id => { if (!this.hasUpgrade(id)) this.upgrades.push(id); });
        // Nội tại: nạp đạn nhanh hơn 20% (đạn bay nhanh hơn: xem fireBullet)
        this.reloadTime *= 0.8;
        // Evo 1: Công Thủ Toàn Diện
        if (this.hasUpgrade('evo_basic_1')) {
            this.maxHp += 2;
            this.damage *= 1.25;
        }
        // Evo 2 bản thường: Bản Lĩnh (bản MAIN dùng Evo 2 làm Hồi Ức)
        if (!this.mainEgg && this.hasUpgrade('evo_basic_2')) {
            this.maxAmmo += 2;
            this.reloadTime *= 0.85;
        }
    }
});

// Hiệp quyết định với p: đối thủ chỉ còn 1 điểm nữa là thắng trận (gồm 2-2)
function mainIsFinalRound(p) {
    if (typeof gameState === 'undefined') return false;
    const target = gameState.winScore || 3;
    const opp = p.id === 1 ? gameState.p2Score : gameState.p1Score;
    return (opp || 0) === target - 1;
}

// Áp chỉ số dạng MAIN (gọi cuối setup hoặc lúc thức tỉnh)
function mainApplyForm(p) {
    p.maxHp = Math.ceil(p.maxHp * 2);
    p.damage += 1;
    p.maxAmmo = Math.max(p.maxAmmo, 10);
}

// Hiệu ứng thức tỉnh: chớp màn hình, cột lửa, vòng xung kích (dữ liệu thuần)
class MainAwakenFx {
    constructor(owner, x, y) {
        this.owner = owner; this.x = x; this.y = y;
        this.life = 100; this.maxLife = 100; this.active = true;
    }
    update() { if (--this.life <= 0) this.active = false; }
    draw() {
        if (!this.active) return;
        const t = this.maxLife - this.life; // 0..100
        ctx.save();
        // Chớp màn hình (trắng -> cam)
        if (t < 28) {
            const a = (1 - t / 28) * 0.75;
            ctx.fillStyle = t < 6 ? `rgba(255,255,240,${a})` : `rgba(255,140,30,${a * 0.8})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalCompositeOperation = 'lighter';
        // Vòng xung kích lan rộng
        for (let i = 0; i < 2; i++) {
            const tt = t - i * 10;
            if (tt < 0 || tt > 45) continue;
            const r = 20 + tt * 6.5, a = 1 - tt / 45;
            ctx.strokeStyle = `rgba(255,${170 - i * 70},40,${a})`;
            ctx.lineWidth = 7 * a + 1; ctx.shadowBlur = 20; ctx.shadowColor = '#ff7a00';
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r * 1.3, r * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
        }
        // Cột lửa bùng lên (đi về phía đối thủ)
        if (t < 70) {
            const a = t < 10 ? t / 10 : 1 - (t - 10) / 60;
            const dir = this.owner && this.owner.id === 2 ? 1 : -1;
            const L = 140 + t * 2;
            const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + dir * L);
            g.addColorStop(0, `rgba(255,240,180,${a})`); g.addColorStop(0.35, `rgba(255,120,20,${a * 0.8})`); g.addColorStop(1, 'rgba(255,40,0,0)');
            ctx.fillStyle = g; ctx.shadowBlur = 0;
            const w = 22 + Math.sin(t * 0.7) * 4;
            ctx.beginPath();
            ctx.moveTo(this.x - w, this.y);
            ctx.quadraticCurveTo(this.x - w * 0.4, this.y + dir * L * 0.5, this.x, this.y + dir * L);
            ctx.quadraticCurveTo(this.x + w * 0.4, this.y + dir * L * 0.5, this.x + w, this.y);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
}

// Đạn "Sức Mạnh Hợp Nhất": làm chậm + thiêu đốt + nổ lan
BulletHooks.register('main_unity', {
    hit(b, attacker, victim) {
        if (!victim || victim.hp <= 0) return;
        victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
        victim.bleedTimer = Math.max(victim.bleedTimer || 0, 36); // 3 nhịp x 0.13 ≈ 0.4 DoT
        victim.bleedInterval = 12;
        victim.bleedDmg = 0.13;
        explosions.push(new Explosion(b.x + b.w / 2, victim.y + victim.h / 2, 42, 'rgba(255,120,20,', 0.4, attacker));
        spawnSparkParticles(victim.x + victim.w / 2, victim.y + victim.h / 2, '#ffb020', 6);
    }
});

CharHooks.register('basic', {
    setup() {
        this.mainFinal = false;
        this.mainDashCd = 0; this.mainDashT = 0; this.mainDashDir = 0;
        this.mainTapL = -99; this.mainTapR = -99; this.mainPrevL = false; this.mainPrevR = false;
        this.mainTick = 0;
        this.mainIntro = 90;
        if (!this.mainAwakened) return;
        mainApplyForm(this);
        if (mainIsFinalRound(this)) {
            // CƠ HỘI CUỐI
            this.mainFinal = true;
            this.speed *= 1.2;
            this.reloadTime *= 0.75;
            this.maxHp += 3;
            this.shield = (this.shield || 0) + 2;
        }
    },
    update(inp, eff) {
        this.mainTick = (this.mainTick || 0) + 1;
        if (this.mainIntro > 0) {
            if (this.mainIntro === 90 && gameState.phase === 'playing' && (this.mainEgg || this.mainAwakened)) {
                const cx = this.x + this.w / 2, ty = this.id === 1 ? this.y - 28 : this.y + this.h + 28;
                addFloatingText(cx, ty, this.mainFinal ? '🔥 CƠ HỘI CUỐI! 🔥' : `MAIN — ${MAIN_SLOGAN}`, '#ffb020', this.mainFinal ? 17 : 13);
            }
            if (gameState.phase === 'playing') this.mainIntro--;
        }
        // Đánh dấu đạn mới: màu vàng kim (MAIN) / Sức Mạnh Hợp Nhất (Cơ Hội Cuối)
        if (this.mainAwakened) {
            for (const b of this.bullets) {
                if (b.mainTag) continue;
                b.mainTag = true;
                if (this.mainFinal && !b.hook) {
                    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
                    b.w *= 2; b.h *= 2; b.x = cx - b.w / 2; b.y = cy - b.h / 2;
                    b.isPiercing = true; b.hitIds = b.hitIds || [];
                    b.hook = 'main_unity'; b.mainUnity = true;
                }
            }
        }
        // Lướt Tốc Biến (chạm đúp trái/phải) — chỉ khi Cơ Hội Cuối
        if (this.mainDashCd > 0) this.mainDashCd--;
        if (this.mainFinal && eff) {
            const l = !!eff.l, r = !!eff.r, t = this.mainTick;
            if (l && !this.mainPrevL) { if (t - this.mainTapL < 14 && this.mainDashCd <= 0) this.mainDashDir = -1; this.mainTapL = t; }
            if (r && !this.mainPrevR) { if (t - this.mainTapR < 14 && this.mainDashCd <= 0) this.mainDashDir = 1; this.mainTapR = t; }
            this.mainPrevL = l; this.mainPrevR = r;
            if (this.mainDashDir && this.mainDashT <= 0 && this.mainDashCd <= 0) {
                this.mainDashT = 8; this.mainDashCd = 180;
                this.invincibleTimer = Math.max(this.invincibleTimer || 0, 15);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#ffb020', 10);
                if (soundSystem && !soundSystem.muted && soundSystem.playDash) soundSystem.playDash();
            }
            if (this.mainDashT > 0) {
                this.mainDashT--;
                this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.mainDashDir * 11));
                if (this.mainDashT <= 0) this.mainDashDir = 0;
            } else this.mainDashDir = 0;
        }
    },
    // HỒI ỨC: lần đầu trong trận bị đối thủ hạ gục -> Thức Tỉnh dạng MAIN
    beforeLethal(dmg, attacker) {
        if (this.mainAwakened || !this.mainEgg || !this.hasUpgrade('evo_basic_2')) return false;
        if (!attacker || attacker === this || gameState.phase !== 'playing') return false;
        this.mainAwakened = true;
        mainApplyForm(this);
        this.hp = this.maxHp;
        this.ammo = this.maxAmmo;
        this.invincibleTimer = 180;
        this.mainIntro = 0;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        // Sóng xung kích: đẩy lùi đối thủ theo phương ngang + xoá đạn địch ở gần
        const enemy = this === p1 ? p2 : p1;
        if (enemy && enemy.hp > 0) {
            const ex = enemy.x + enemy.w / 2;
            const dir = ex >= cx ? 1 : -1;
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dir * 70));
            if (Array.isArray(enemy.bullets)) enemy.bullets = enemy.bullets.filter(b => Math.hypot(b.x - cx, b.y - cy) > 230);
        }
        bodyEffects.push(new MainAwakenFx(this, cx, cy));
        explosions.push(new Explosion(cx, cy, 120, 'rgba(255,140,20,', 0, this));
        addFloatingText(cx, this.id === 1 ? this.y - 26 : this.y + this.h + 26, 'HỒI ỨC — THỨC TỈNH: MAIN!', '#ffd700', 17);
        addFloatingText(canvas.width / 2, canvas.height / 2, MAIN_SLOGAN, '#ff7a00', 22);
        spawnSparkParticles(cx, cy, '#ffb020', 24);
        triggerScreenShake(14, 24);
        if (soundSystem && !soundSystem.muted) soundSystem.playRevive();
        return true;
    }
});
