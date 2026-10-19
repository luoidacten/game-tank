// ==========================================
// Kiếm Tôn (blade_god) — Logic (cập nhật, bắn, kỹ năng)
// Luân phiên: Quang Kiếm (lơ lửng 2s rồi phóng tia) / Ám Kiếm (kiếm bay). Nhát thứ 10: Phá Thiên Kiếm.
// Evo 1: Quang Kiếm tự rải trên sân + nội tại Quang Kiếm Loạn Ảnh.
// Evo 2: Ám Kiếm tạo hố đen + nội tại Ám Kiếm Tuyệt Diệt.
// Full Evo: Quang/Ám Kiếm tự xuất hiện & tự phóng, hai nội tại được cường hoá.
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Kiếm Tôn
    setupBladeGod() {
        if (this.weapon === 'blade_god') {
            this.bladeShotCount = 0; // Đếm số lần bắn để gọi Phá Thiên
            this.huVoStack = 0;
            this.swordShieldActive = false;
            this.swordShieldHits = 0;
            this.swordShieldTimer = 0;
            this.bgRandTimer = 150;   // Evo 1 / Full: kiếm tự xuất hiện
            this.bgGuardTimer = 240;  // Evo 1: Loạn Ảnh
            this.bgDoomTimer = 480;   // Evo 2: Tuyệt Diệt
        }
    },

    // [handleShooting] Kiếm Tôn — trả về true nếu cần dừng handleShooting()
    shootBladeGod(inp, now) {
        if (this.weapon !== 'blade_god') return;
        const isReloaded = (now - this.lastShot > 700);
        if (inp.s && this.ammo > 0 && isReloaded) {
            this.bladeShotCount++;
            const dirY = (this.id === 1) ? -1 : 1;
            const cx = this.x + this.w / 2;

            if (this.bladeShotCount % 10 === 0) {
                // 1. Phá Thiên Kiếm (Phát thứ 10)
                let spawnY = this.y + ((this.id === 1) ? 50 : -50);
                if (spawnY > canvas.height - 125) spawnY = canvas.height - 125;
                if (spawnY < 5) spawnY = 5;
                floatingSwords.push(new FloatingSword(this.x - 15, spawnY, 60, 120, 0, dirY * 25, 120, this.damage * 3.5, true, false, this, true));
            } else if (this.bladeShotCount % 2 !== 0) {
                // 2. Quang Kiếm: lơ lửng tại chỗ trên đầu, 2s sau tự phóng tia
                const y = this.id === 1 ? this.y - 30 : this.y + this.h + 30;
                bodyEffects.push(new BgLightSword(this, cx, y, this.damage * 0.45 + 1, 120));
            } else {
                // 3. Ám Kiếm: kiếm bay
                bgSpawnDark(this, cx, this.id === 1 ? this.y - 18 : this.y + this.h + 18, 0, dirY * (C.bulletSpeed + 2), this.damage * 0.75);
            }
            if (soundSystem && !soundSystem.muted && soundSystem.playClick) soundSystem.playClick();
            this.ammo--; this.lastShot = now; inp.s = false;
        }
        return true;
    },

    // Vị trí ngẫu nhiên trên nửa sân của mình (gần làn địch theo trục X)
    bgRandomSpot(spreadX = 110) {
        const e = bgEnemy(this);
        const x = e ? laneTargetPoint(e, spreadX).x : 30 + Math.random() * (canvas.width - 60);
        const dirY = this.id === 1 ? -1 : 1;
        const y = this.y + this.h / 2 + dirY * (80 + Math.random() * canvas.height * 0.25);
        return { x, y };
    },

    updateBladeGodPassives() {
        if (gameState.phase !== 'playing' || this.hp <= 0) return;
        const e1 = this.hasUpgrade('evo_blade_1'), e2 = this.hasUpgrade('evo_blade_2'), full = e1 && e2;
        // Evo 1: Quang Kiếm tự rải; Full Evo: thêm Ám Kiếm tự xuất hiện
        if (e1 && --this.bgRandTimer <= 0) {
            this.bgRandTimer = full ? 150 : 200;
            const a = this.bgRandomSpot();
            bodyEffects.push(new BgLightSword(this, a.x, a.y, this.damage * 0.45 + 0.5, 120, 0.85));
            if (full) {
                const b = this.bgRandomSpot(140);
                bodyEffects.push(new BgDarkHover(this, b.x, b.y, this.damage * 0.6, 120));
            }
        }
        // Evo 1: Quang Kiếm Loạn Ảnh
        if (e1 && --this.bgGuardTimer <= 0) {
            this.bgGuardTimer = full ? 420 : 600;
            const life = full ? 240 : 180;
            bodyEffects.push(new BgGuardian(this, life, 0));
            if (full) bodyEffects.push(new BgGuardian(this, life, Math.PI));
            addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 18 : this.y + this.h + 22, 'LOẠN ẢNH', '#ffd84d', 12);
        }
        // Evo 2: Ám Kiếm Tuyệt Diệt
        if (e2 && --this.bgDoomTimer <= 0) {
            // Đã giảm: hồi 15s (Full 12s), ít kiếm hơn, cảnh báo lâu hơn (nhỏ 0.75s, khổng lồ 1.5s)
            this.bgDoomTimer = full ? 720 : 900;
            const n = full ? 6 : 4;
            for (let i = 0; i < n; i++) bodyEffects.push(new BgSkySword(this, 1 + Math.round(i * 150 / n), 45, false));
            bodyEffects.push(new BgSkySword(this, 190, 90, true, full));
            addFloatingText(this.x + this.w / 2, this.id === 1 ? this.y - 18 : this.y + this.h + 22, 'TUYỆT DIỆT', '#d946ef', 12);
        }
    },
});

CharHooks.register('blade_god', {
    update() { this.updateBladeGodPassives(); },
});
