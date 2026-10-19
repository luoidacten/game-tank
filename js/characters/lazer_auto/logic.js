// ==========================================
// Lazer Pháo (lazer_auto) — Dòng Laser Quá Nhiệt
// ------------------------------------------
// Không dùng đạn: GIỮ bắn để xả dòng laser xuyên thấu, nhịp bắn tăng dần (0.43s -> 0.17s/tia).
// Mỗi tia +9 Nhiệt (Full Evo +7). Nhiệt >= 60% (Evo 2: 50%): tia "Nóng Đỏ" +35% dame, to hơn.
// Nhiệt đầy 100% -> QUÁ NHIỆT: khóa bắn 1.5s (Full Evo 0.8s). Nhả nút: nhiệt tự giảm ~36%/s.
// Hòm đạn: xả sạch nhiệt. Mọi trạng thái là trường thuần trên player, đếm theo tick.
// ==========================================
function laFull(p) { return p.hasUpgrade('evo_lazer_a_1') && p.hasUpgrade('evo_lazer_a_2'); }
function laHotAt(p) { return p.hasUpgrade('evo_lazer_a_2') ? 50 : 60; }
function laOverTicks(p) { return laFull(p) ? 48 : 90; }

CharHooks.register('lazer_auto', {
    setup() { this.laHeat = 0; this.laOver = 0; this.laCd = 0; this.laStreak = 0; this.maxAmmo = 0; },
    shoot(inp, now) {
        if (this.laCd > 0) this.laCd--;
        if (this.laOver > 0) {
            this.laOver--;
            this.laHeat = 100 * this.laOver / laOverTicks(this);
            this.laStreak = 0;
            if (this.laOver % 8 === 0) spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#cbd5e1', 2);
            return true;
        }
        if (inp.s) {
            if (this.laCd <= 0) {
                const hot = this.laHeat >= laHotAt(this);
                this.fireBullet(hot ? 0.55 * 1.35 : 0.55);
                const b = this.bullets[this.bullets.length - 1];
                if (b && hot) { b.laHot = true; b.x -= 1.5; b.w += 3; }
                this.laStreak++;
                this.laHeat = Math.min(100, this.laHeat + (laFull(this) ? 7 : 9));
                this.laCd = Math.max(this.hasUpgrade('evo_lazer_a_1') ? 8 : 10, 26 - this.laStreak * 3);
                this.lastShot = now;
                if (this.laHeat >= 100) {
                    this.laOver = laOverTicks(this);
                    addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -14 : this.h + 18), 'QUÁ NHIỆT!', '#ff3b30', 13);
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 26, 'rgba(255,120,60,', 0, this));
                }
            }
        } else {
            this.laStreak = 0;
            this.laHeat = Math.max(0, this.laHeat - 0.6);
        }
        return true;
    },
});

// Trạng thái cho HUD nút Bắn (đăng ký trong empower-hud.js)
function laEmpowerState(p) {
    if (p.laOver > 0) return { pct: p.laOver / laOverTicks(p), ready: false, label: 'QUÁ NHIỆT', color: '#ff3b30' };
    const heat = p.laHeat || 0;
    const hot = heat >= laHotAt(p);
    return { pct: heat / 100, ready: hot, label: hot ? 'NÓNG ĐỎ' : 'NHIỆT', color: hot ? '#ff7a00' : '#00e5ff', idle: heat < 1 };
}
