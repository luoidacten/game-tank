// ==========================================
// shadow_hunter (shadow_hunter) — Vật triệu hồi / thực thể riêng
// ==========================================




// --- CLASSES ---
class ShadowTrap {
    constructor(x, y, owner, isFullEvo = false) {
        this.x = x;
        this.y = y;
        this.radius = 26;
        this.owner = owner;
        this.isFullEvo = isFullEvo;
        this.active = true;
        this.triggered = false;
        this.triggerTimer = 120; // 2s warning
    }
    update(opponent) {
        if (!this.active) return;
        if (!opponent || opponent.hp <= 0) return;

        let ox = opponent.x + opponent.w / 2;
        let oy = opponent.y + opponent.h / 2;
        let dist = Math.hypot(ox - this.x, oy - this.y);

        if (!this.triggered) {
            if (dist <= this.radius + 15) {
                this.triggered = true;
                this.triggerTimer = 120;
                if (this.isFullEvo) {
                    opponent.slowTimer = 60; // Instant slow on stepping
                    if (typeof addFloatingText === 'function') addFloatingText(opponent.x + opponent.w / 2, opponent.y - 12, "TRAPPED! 🕸️", "#9b59b6", 13);
                }
            }
        } else {
            this.triggerTimer--;
            if (this.triggerTimer <= 0) {
                // Detonate
                if (dist <= this.radius + 20) {
                    const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
                    let dmg = (this.isFullEvo && isOnline) ? 1.4 : 2; // Online balance (-30%)
                    opponent.takeDamage(dmg, this.owner);
                    opponent.bleedTimer = 60;
                    opponent.bleedInterval = 12;
                    opponent.bleedDmg = Math.max(0.05, opponent.maxHp * 0.02);

                    if (this.isFullEvo) {
                        opponent.freezeTimer = 90; // Stun 1.5s
                        if (typeof addFloatingText === 'function') addFloatingText(opponent.x + opponent.w / 2, opponent.y - 20, "STUNNED! ⚡", "#00f0ff", 14);
                    }
                }
                if (typeof explosions !== 'undefined') explosions.push(new Explosion(this.x, this.y, 60, 'rgba(155, 89, 182,', 0, this.owner));
                this.active = false;
            }
        }
    }
    draw() {
        if (!this.active) return;
        const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
        const isOwner = (typeof onlineManager === 'undefined' || !onlineManager || !onlineManager.isOnline)
            ? true
            : (onlineManager.role === 'host' ? this.owner.id === 1 : this.owner.id === 2);

        // In Full Evo: invisible to opponent until triggered
        if (this.isFullEvo && isOnline && !isOwner && !this.triggered) {
            return; // 100% invisible on opponent screen
        }

        ctx.save();
        if (!this.triggered) {
            ctx.strokeStyle = this.isFullEvo ? "rgba(155, 89, 182, 0.4)" : "rgba(155, 89, 182, 0.7)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Trap center rune
            ctx.fillStyle = "#9b59b6";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Warning telegraph circle
            let warnProgress = 1 - (this.triggerTimer / 120);
            let pulse = (Math.sin(Date.now() * 0.03) + 1) * 0.2 + 0.3;
            ctx.fillStyle = `rgba(255, 0, 50, ${pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, (this.radius + 10) * warnProgress, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ff0033";
            ctx.font = "bold 11px Orbitron, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("⚠️ TRAP!", this.x, this.y - this.radius - 8);
        }
        ctx.restore();
    }
}

function drawShadowHunterAmbiance() {
    ctx.save();
    // Lớp không gian đêm bóng tối
    ctx.fillStyle = 'rgba(5, 8, 20, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Đèn pha neon chiếu sáng về phía trước
    const drawHeadlight = (tank, color, dirY) => {
        if (!tank || tank.hp <= 0) return;
        let startX = tank.x + tank.w / 2;
        let startY = (dirY === -1) ? tank.y : tank.y + tank.h;
        let beamLength = 170;
        let spreadW = 65;

        let grad = ctx.createLinearGradient(startX, startY, startX, startY + dirY * beamLength);
        grad.addColorStop(0, color.replace(')', ', 0.35)').replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - spreadW, startY + dirY * beamLength);
        ctx.lineTo(startX + spreadW, startY + dirY * beamLength);
        ctx.closePath();
        ctx.fill();
    };

    drawHeadlight(p1, 'rgb(0, 240, 255)', -1);
    drawHeadlight(p2, 'rgb(255, 0, 85)', 1);
    ctx.restore();
}
