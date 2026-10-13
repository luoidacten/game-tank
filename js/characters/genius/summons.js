// ==========================================
// Thiên Tài (genius) — Robot bị ném khi Tự Hủy (Full Evo)
// ==========================================

// Robot lao thẳng về phía trước, chạm tường mới phát nổ
class ThrownMecha {
    constructor(owner, x, y, dmg = 5, radius = 150) {
        this.owner = owner;
        this.w = 40; this.h = 40;
        this.x = x - this.w / 2; this.y = y - this.h / 2;
        this.dirY = owner.id === 1 ? -1 : 1;
        this.vy = 3; this.dmg = dmg; this.radius = radius;
        this.spin = 0; this.active = true; this.trail = [];
    }
    update() {
        if (!this.active) return;
        this.vy = Math.min(13, this.vy + 0.6); // tăng tốc dần
        this.y += this.dirY * this.vy;
        this.spin += 0.25;
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.pop();
        if (this.y <= 0 || this.y + this.h >= canvas.height) this.explode();
    }
    explode() {
        this.active = false;
        const cx = this.x + this.w / 2, cy = this.dirY < 0 ? this.h / 2 : canvas.height - this.h / 2;
        explosions.push(new Explosion(cx, cy, this.radius, '#ff1744', 0, this.owner));
        const enemy = this.owner === p1 ? p2 : p1;
        if (enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - cx, enemy.y + enemy.h / 2 - cy) <= this.radius) {
            enemy.takeDamage(this.dmg, this.owner);
        }
        triggerScreenShake(9, 16);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        addFloatingText(cx, cy + this.dirY * -30, 'TỰ HỦY MECHA KHỔNG LỒ! 💥💣', '#ff1744', 16);
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        this.trail.forEach((t, i) => {
            ctx.globalAlpha = 0.25 * (1 - i / this.trail.length);
            ctx.fillStyle = '#ff9800';
            ctx.fillRect(t.x, t.y, this.w, this.h);
        });
        ctx.globalAlpha = 1;
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(Math.sin(this.spin) * 0.25);
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 3;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
        // Đèn báo nổ nhấp nháy
        ctx.fillStyle = (Math.floor(Date.now() / 80) % 2) ? '#ff1744' : '#fff';
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
