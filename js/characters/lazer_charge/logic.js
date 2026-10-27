// ==========================================
// Lazer Xuyên Phá (lazer_charge) — Logic (cập nhật, bắn, kỹ năng)
// ------------------------------------------
// - Chế độ TỰ NẠP (bật sẵn đầu hiệp): năng lượng tự nạp đầy (5s; Evo 2: 4s; Full Evo: 3.5s),
//   đầy rồi NHẤP để phóng Tia Xuyên Phá (20 dame). Đang Tự Nạp thì không bắn đạn thường.
// - GIỮ bắn 0.4s: bật/tắt Tự Nạp. Tắt: nhấp bắn đạn thường (0.01 dame), năng lượng ngừng nạp (giữ nguyên).
// - Full Evo: Tia Xuyên Phá hạ gục ngay lập tức bất kể máu, xuyên khiên.
// Trạng thái: lcAuto, lcEnergy, lcHold (trường thuần trên player, đếm theo tick).
// ==========================================

const LC_TOGGLE_TICKS = 24;
function lcIsFull(p) { return hasFullEvo(p, 'lazer_charge'); }
function lcChargeTicks(p) { return lcIsFull(p) ? 210 : (p.hasUpgrade('evo_lazer_c_2') ? 240 : 300); }

CharHooks.register('lazer_charge', {
    setup() { this.lcAuto = true; this.lcEnergy = 0; this.lcHold = 0; },
});

// Trạng thái cho HUD nút Bắn (đăng ký trong empower-hud.js)
function lcEmpowerState(p) {
    if (!p.lcAuto) return { pct: (p.lcEnergy || 0) / 100, ready: false, label: 'ĐẠN THƯỜNG', color: '#94a3b8' };
    const pct = Math.min(1, (p.lcEnergy || 0) / 100);
    return { pct, ready: pct >= 1, label: pct >= 1 ? 'LAZER MAX' : 'TỰ NẠP', color: '#ff3355' };
}

Object.assign(Player.prototype, {
    fireBeam() {
        const isEvo = this.hasUpgrade('evo_lazer_c_1');
        const beamW = isEvo ? 30 : 10;
        const beamX = this.x + this.w / 2 - beamW / 2;
        const bRx = beamX; let bRy = (this.id === 1 ? 0 : this.y + this.h);
        const bRw = beamW; let bRh = (this.id === 1 ? this.y : canvas.height - (this.y + this.h));
        const swBlk = sniperWallClipBeam(this, bRx, bRy, bRw, bRh, this.id === 1 ? -1 : 1, 20); // Tường Sniper chặn tia
        if (swBlk) { bRy = swBlk.y; bRh = swBlk.h; }
        const lcBeam = new Beam(beamX, bRy, beamW, bRh, this.id, isEvo);
        lcBeam.gmHit = true; // Gemini: Bản Sao xét trúng riêng bên dưới
        beams.push(lcBeam);

        const enemy = (this.id === 1) ? p2 : p1;
        // Tia 20 dame. Full Evo: hạ gục ngay bất kể máu, xuyên khiên. Đòn hitscan duy nhất không có cột cảnh báo:
        // tín hiệu cho đối thủ là thanh năng lượng / mũi tên "LAZER MAX" trên xe.
        const lcFull = lcIsFull(this);
        if (rectIntersect(bRx, bRy, bRw, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) {
            const dmg = lcFull ? Math.max(20, (enemy.hp + (enemy.maxHp || 0)) * 10 + 100) : 20;
            enemy.takeDamage(dmg, this, lcFull ? { bypassShield: true, isPiercing: true } : {});
            if (typeof fxSlashHit === 'function') fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#7dd3fc', 30);
        }
        if (typeof gmTwinAlso === 'function') gmTwinAlso(enemy, t => rectIntersect(bRx, bRy, bRw, bRh, t.x, t.y, t.w, t.h), lcFull ? (enemy.maxHp || 5) * 10 + 100 : 20, this, lcFull ? { unavoidable: true } : {}); // Gemini: Bản Sao AI

        crates.forEach(c => {
            if (c.active && rectIntersect(bRx, bRy, bRw, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                crateOnBreak(c, this);
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 0, null));
                if (c.type === 'coin') {
                    let money = 30; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(bRx, bRy, bRw, bRh, t.x, t.y, t.w, t.h)) {
                let dmg = 8; if (this.weapon === 'money_tank') dmg *= 3;
                t.hp -= dmg;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    if (this.hasUpgrade('evo_money_atk')) explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,215,0,', 5, this));
                }
            }
        });
    },

    // [handleShooting] Lazer Xuyên Phá — trả về true nếu cần dừng handleShooting()
    shootLazerCharge(inp, now) {
        if (this.weapon !== 'lazer_charge') return;
        if (this.lcAuto === undefined) { this.lcAuto = true; this.lcEnergy = 0; this.lcHold = 0; }
        // Tự nạp năng lượng
        if (this.lcAuto && this.lcEnergy < 100) {
            this.lcEnergy = Math.min(100, this.lcEnergy + 100 / lcChargeTicks(this));
            if (this.lcEnergy > 99.99) this.lcEnergy = 100; // tránh sai số dấu phẩy động
            if (this.lcEnergy >= 100) {
                addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -14 : this.h + 18), 'LAZER SẴN SÀNG', '#ff3355', 12);
                if (soundSystem && !soundSystem.muted && soundSystem.playPowerup) soundSystem.playPowerup();
            }
        }
        this.chargeLevel = 0;
        if (inp.s) {
            this.lcHold = (this.lcHold || 0) + 1;
            // thanh giữ để đổi chế độ
            if (this.lcHold < LC_TOGGLE_TICKS) this.chargeLevel = (this.lcHold / LC_TOGGLE_TICKS) * 7;
            if (this.lcHold === LC_TOGGLE_TICKS) {
                this.lcAuto = !this.lcAuto;
                addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -14 : this.h + 18),
                    this.lcAuto ? 'TỰ NẠP: BẬT ⚡' : 'TỰ NẠP: TẮT • ĐẠN THƯỜNG', this.lcAuto ? '#ff3355' : '#94a3b8', 12);
                if (soundSystem && !soundSystem.muted && soundSystem.playClick) soundSystem.playClick();
            }
        } else if (this.lcHold > 0) {
            const held = this.lcHold;
            this.lcHold = 0;
            if (held < LC_TOGGLE_TICKS) {
                if (this.lcAuto) {
                    if (this.lcEnergy >= 100) { this.fireBeam(); this.lcEnergy = 0; this.lastShot = now; }
                } else if (this.ammo > 0 && now - this.lastShot > 220) {
                    this.fireBullet(0.01 / Math.max(0.01, this.damage + (this.dmgBuff || 0))); // đạn thường 0.01 dame
                    this.ammo--; this.lastShot = now;
                }
            }
        }
        return true;
    }
});
