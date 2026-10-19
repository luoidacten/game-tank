// ==========================================
// Sniper (sniper) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Sniper
    drawSniper() {
        if (this.weapon === 'sniper') {
            // Vẽ tia nhắm Laser cho Sniper — cùng góc với viên đạn sẽ bắn ra (sniperAimAngle)
            if (this.ammo > 0 && !this.sniperReloading) {
                const ang = sniperAimAngle(this);
                const a = (ang === null) ? ((this.id === 1) ? -Math.PI / 2 : Math.PI / 2) : ang;
                const sx = this.x + this.w / 2, sy = (this.id === 1) ? this.y : this.y + this.h;
                const L = Math.hypot(canvas.width, canvas.height);
                ctx.save();
                ctx.strokeStyle = (this.id === 1) ? "rgba(52, 152, 219, 0.45)" : "rgba(231, 76, 60, 0.45)";
                if (ang !== null) { ctx.shadowBlur = 6; ctx.shadowColor = ctx.strokeStyle; }
                ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + Math.cos(a) * L, sy + Math.sin(a) * L);
                ctx.stroke();
                ctx.restore();
            }

            // Vẽ UI Reload tụ lực
            if (this.sniperChargeTimer > 0) {
                // [FIX UI] Cũng phải loại bỏ Tường Bất Tử ở đây để không bị hiện chữ đỏ sai
                let hasActiveWall = sniperWalls.some(w => w.owner === this && w.active && !w.isImmortal);

                // Nếu đang rặn đạn nhưng Tường đang Cooldown hoặc đã có Tường -> Báo chữ đỏ
                if (hasActiveWall || this.sniperWallCooldown > 0) {
                    ctx.fillStyle = "red"; ctx.font = "10px Arial";
                    ctx.fillText("WALL CD/ACTIVE", this.x - 20, this.y - 10);
                } else {
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(this.x, this.y - 10, this.w * (this.sniperChargeTimer / 60), 5);
                }
            }
            if (this.sniperReloading) {
                const mx = this.sniperReloadMax || ((this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2')) ? 150 : 180);
                drawReloadRing(this, 1 - this.sniperReloadTimer / mx, '#ffb020');
            }

            // Vẽ thanh hồi chiêu (Cooldown) của Tường Sniper ở bên dưới gầm xe
            if (this.sniperWallCooldown > 0) {
                ctx.fillStyle = "cyan"; // Màu thanh hồi chiêu tường
                ctx.fillRect(this.x, this.y + this.h + 5, this.w * (this.sniperWallCooldown / 300), 3);
            }
        }
    }
});

// Vòng nạp đạn quanh xe (Sniper, Tiểu Liên...). prog 0..1
function drawReloadRing(p, prog, color) {
    prog = Math.max(0, Math.min(1, prog || 0));
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = Math.max(p.w, p.h) * 0.5 + 9;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = color; ctx.shadowBlur = 10; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, prog)); ctx.stroke();
    // chấm sáng đầu vòng
    const ea = -Math.PI / 2 + Math.PI * 2 * prog;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx + Math.cos(ea) * R, cy + Math.sin(ea) * R, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
