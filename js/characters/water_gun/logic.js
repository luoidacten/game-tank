// ==========================================
// Súng Nước (water_gun) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

const WG_BEAM_FOLLOW = 1.2;   // px/tick: cột Vòi Rồng trễ theo nòng (né được)
const WG_BEAM_HALF = 7;       // nửa bề rộng cột tia

// Vòi Rồng: 1 tick sát thương dạng hitscan dọc cột wgBeamX (tường Sniper chặn)
function wgBeamTick(p, dmg) {
    const e = p === p1 ? p2 : p1;
    const dirY = p.id === 1 ? -1 : 1;
    const fromY = p.id === 1 ? p.y : p.y + p.h;
    const x = p.wgBeamX;
    let stop = dirY < 0 ? 0 : canvas.height;
    const sw = (typeof sniperWallBlockY === 'function') ? sniperWallBlockY(p, x, fromY, dirY, WG_BEAM_HALF, dmg) : null;
    if (sw) stop = sniperWallStopY(sw, dirY);
    if (typeof gmTwinAlso === 'function') gmTwinAlso(e, t => x + WG_BEAM_HALF > t.x && x - WG_BEAM_HALF < t.x + t.w && ((dirY < 0 ? t.y + t.h : t.y) - fromY) * dirY > 0 && (stop - (dirY < 0 ? t.y + t.h : t.y)) * dirY >= 0, dmg, p, { isDot: true }); // Gemini: Bản Sao AI
    if (e && e.hp > 0 && !e.isInvisible && x + WG_BEAM_HALF > e.x && x - WG_BEAM_HALF < e.x + e.w) {
        const ey = dirY < 0 ? e.y + e.h : e.y;
        if ((ey - fromY) * dirY > 0 && (stop - ey) * dirY >= 0) {
            const d = e.takeDamage(dmg, p, { isDot: true });
            if (d > 0 && p.hasUpgrade('evo_water_2')) e.slowTimer = 90;
            spawnSparkParticles(x, ey, '#7fe9ff', 3);
            if (!p.hasUpgrade('evo_water_2')) stop = ey; // Evo 2: xuyên thấu
        }
    }
    p.wgBeamStop = stop;
}

CharHooks.register('water_gun', {
    // Vẽ cột Vòi Rồng (trạng thái trên player -> guest online cũng thấy)
    draw() {
        if (!this.wgBeamOn || this.hp <= 0) return;
        const dirY = this.id === 1 ? -1 : 1;
        const fromY = this.id === 1 ? this.y : this.y + this.h;
        const stop = typeof this.wgBeamStop === 'number' ? this.wgBeamStop : (dirY < 0 ? 0 : canvas.height);
        const x = this.wgBeamX, cx = this.x + this.w / 2, t = this.wgBeamOn;
        const top = Math.min(fromY, stop), h = Math.abs(stop - fromY);
        ctx.save();
        // Cảnh báo: vạch mảnh nơi tia đang kéo tới
        if (Math.abs(cx - x) > 2) {
            ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(0,255,255,0.45)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cx, fromY); ctx.lineTo(cx, dirY < 0 ? 0 : canvas.height); ctx.stroke(); ctx.setLineDash([]);
        }
        const wob = Math.sin(t * 0.5) * 1.5;
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(0,140,255,0.35)'; ctx.fillRect(x - WG_BEAM_HALF - 3 - wob, top, (WG_BEAM_HALF + 3 + wob) * 2, h);
        ctx.fillStyle = 'rgba(0,230,255,0.6)'; ctx.fillRect(x - WG_BEAM_HALF + 1, top, (WG_BEAM_HALF - 1) * 2, h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(230,255,255,0.9)'; ctx.fillRect(x - 1.5, top, 3, h);
        // Gợn nước chảy dọc tia
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (let i = 0; i < 6; i++) {
            const k = ((t * 9 + i * 53) % Math.max(1, h)) ;
            const yy = dirY < 0 ? fromY - k : fromY + k;
            ctx.beginPath(); ctx.ellipse(x + Math.sin(i * 2 + t * 0.3) * 4, yy, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        }
        // Bọt bắn ở điểm dừng
        ctx.fillStyle = 'rgba(180,250,255,0.8)';
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.7 + i * 1.7) * 10, stop - dirY * Math.abs(Math.cos(t * 0.5 + i)) * 6, 2.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    },
});

Object.assign(Player.prototype, {
    // [handleShooting] Súng Nước — trả về true nếu cần dừng handleShooting()
    shootWaterGun(inp, now) {
        if (this.weapon === 'water_gun') {
            if (inp.s) {
                this.energyChargeTimer++;
                let hasEvo1 = this.hasUpgrade('evo_water_1');

                if (this.energyChargeTimer < 60) {
                    // Pha 1: Cảnh báo hướng bắn (Chờ 1 giây)
                    if (this.energy >= 10) {
                        ctx.save();
                        let startY = (this.id === 1) ? this.y : this.y + this.h;
                        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, startY); ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
                    }
                } else if (this.energyChargeTimer === 60) {
                    // Cấp thường: Đủ 1s -> Xả HitScan
                    // Laser nước: cột cảnh báo khoá 0.5s rồi mới bắn (đối thủ kịp né)
                    if (this.energy >= 50) {
                        this.energy -= 50;
                        const dmg = this.damage * 3, pierce = this.hasUpgrade('evo_water_2');
                        scheduleHitscan(this, 30, '#00bfff', 30, () => this.fireAnhMinhHitscan(dmg, pierce, "#3498db"));
                        this.lastShot = now;
                    }
                } else if (this.energyChargeTimer > 60 && hasEvo1) {
                    // Pha 2 (Evo 1): sau phát Laser mở màn -> Vòi Rồng phun liên tục như tia laser
                    // (cột tia trễ theo nòng nên đối thủ thấy & né được; mỗi 6 tick gây 0.125 dame)
                    if (this.energyChargeTimer > 90 && this.energy >= 1) {
                        const cx = this.x + this.w / 2;
                        if (!this.wgBeamOn) this.wgBeamX = cx;
                        this.wgBeamOn = (this.wgBeamOn || 0) + 1;
                        const dx = cx - this.wgBeamX;
                        this.wgBeamX += Math.max(-WG_BEAM_FOLLOW, Math.min(WG_BEAM_FOLLOW, dx));
                        if (this.energyChargeTimer % 6 === 0) {
                            this.energy -= 2;
                            wgBeamTick(this, 0.125);
                            this.lastShot = now;
                        }
                    } else this.wgBeamOn = 0;
                }
            } else {
                // Nhả nút
                if (this.energyChargeTimer > 0 && this.energyChargeTimer < 60 && this.energy >= 10) {
                    this.energy -= 10;
                    this.fireBullet(1, false, 'water_normal'); // Bắn 1 tia nước thường
                    this.lastShot = now;
                }
                this.energyChargeTimer = 0;
                this.wgBeamOn = 0;
            }
            if (inp.s && this.energy < 1) this.wgBeamOn = 0;
            return true;
        }
    }
});
