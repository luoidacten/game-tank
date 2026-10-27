// ==========================================
// Pháo Cao Xạ (aaa) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Pháo Cao Xạ
    setupAaa() {
        if (this.weapon === 'aaa') {
            this.speed *= 0.6;
            this.maxAmmo = 1;
            this.reloadTime = 3000;
            this.aaaAutoInterval = 240; // Giảm tần suất mưa đạn pháo
            this.aaaBurstLeft = 0; this.aaaBurstTick = 0;
            if (this.hasUpgrade('evo_aaa_2')) { this.reloadTime = 2500; }
            if (hasFullEvo(this, 'aaa')) {
                this.aaaAutoInterval = 200;
                this.reloadTime = 1500;
            }
        }
    },

    // [update] Pháo Cao Xạ
    updateAaa() {
        if (this.weapon === 'aaa') {
            // [FIX] Loạt bắn 3 tia theo tick (trước dùng setTimeout -> có thể bắn sau khi hết round)
            if ((this.aaaBurstLeft || 0) > 0 && --this.aaaBurstTick <= 0) {
                this.aaaBurstLeft--; this.aaaBurstTick = 12;
                if (this.hp > 0) this.fireBullet(1);
            }
            this.aaaAutoTimer++;
            if (this.aaaAutoTimer >= this.aaaAutoInterval) {
                this.aaaAutoTimer = 0;

                // Tự bắn thường
                let shots = this.hasUpgrade('evo_aaa_1') ? 3 : 1;
                this.fireBullet(1);
                this.aaaBurstLeft = shots - 1; this.aaaBurstTick = 12;

                // Evo 2: Mưa Tên Lửa (Rơi 3 bom ngẫu nhiên)
                if (this.hasUpgrade('evo_aaa_2')) {
                    const enemy = (this.id === 1) ? p2 : p1;
                    for (let k = 0; k < 3; k++) {
                        // [FIX] Bom rơi trên làn đối thủ (trước: ngẫu nhiên nửa sân, ít khi trúng)
                        const lt = laneTargetPoint(enemy, 120);
                        let rx = lt.x, ry = lt.y;
                        mortars.push(new MortarMarker(rx, ry, this, true));
                    }
                }
            }
        }
    },

    // [handleShooting] Pháo Cao Xạ — trả về true nếu cần dừng handleShooting()
    shootAaa(inp, now) {
        if (this.weapon === 'aaa') {
            if (inp.s) {
                let interShotDelay = 350;
                if (this.ammo > 0 && now - this.lastShot > interShotDelay) {
                    const enemy = (this.id === 1) ? p2 : p1;

                    // FIX AIM: Thả trực tiếp vào TÂM kẻ địch hiện tại
                    let targetX = enemy.x + enemy.w / 2;
                    let targetY = enemy.y + enemy.h / 2;

                    // Thêm chút rung lắc nhẹ cho tự nhiên
                    targetX += (Math.random() - 0.5) * 20;
                    targetY += (Math.random() - 0.5) * 20;

                    mortars.push(new MortarMarker(targetX, targetY, this, false));
                    // Full Evo: không tự đuổi -> thêm 2 quả phụ rơi 2 bên mục tiêu (không nổ bồi, rơi trễ 0.2s)
                    if (hasFullEvo(this, 'aaa')) {
                        [-52, 52].forEach(off => {
                            const m = new MortarMarker(Math.max(14, Math.min(canvas.width - 14, targetX + off)), targetY, this, false);
                            m.echoLeft = 0; m.detonateTime += 200;
                            mortars.push(m);
                        });
                    }

                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return true;
        }
    }
});

// HUD: vòng đếm ngược tới lượt TỰ BẮN kế tiếp (để canh thời điểm)
CharHooks.register('aaa', {
    drawUI() {
        if (this.hp <= 0 || !this.aaaAutoInterval) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const R = Math.max(this.w, this.h) * 0.5 + 9;
        const ratio = Math.min(1, (this.aaaAutoTimer || 0) / this.aaaAutoInterval);
        const left = Math.max(0, (this.aaaAutoInterval - (this.aaaAutoTimer || 0)) / 60);
        const soon = left < 1;
        const col = soon ? (Math.floor(Date.now() / 120) % 2 ? '#ffeb3b' : '#ff5722') : '#ff9800';
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = soon ? 12 : 6;
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); ctx.stroke();
        // Số giây còn lại (bên cạnh xe, không che đường bắn)
        ctx.shadowBlur = 3; ctx.shadowColor = '#000';
        ctx.fillStyle = col; ctx.font = "bold 10px 'Orbitron', Arial"; ctx.textAlign = 'center';
        const tx = cx + (cx > canvas.width - 70 ? -(R + 16) : R + 16), ty = cy + 4;
        if (typeof drawWorldText === 'function') drawWorldText(ctx, left.toFixed(1) + 's', tx, ty);
        else ctx.fillText(left.toFixed(1) + 's', tx, ty);
        ctx.restore();
    }
});
