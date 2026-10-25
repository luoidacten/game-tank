// ==========================================
// death_lock (death_lock) — Vật triệu hồi / thực thể riêng
// ==========================================



// ==========================================
// --- CLASS LỒNG CẤM CHẾ (DEATH LOCK) ---
// ==========================================
class ConfinementCage {
    constructor(x, y, owner) {
        this.owner = owner;
        this.x = Math.max(20, Math.min(canvas.width - 20, x));
        this.y = Math.max(15, Math.min(canvas.height - 15, y));
        
        let hasEvo2 = owner.hasUpgrade && owner.hasUpgrade('evo_dl_2');
        let isFullEvo = owner.hasUpgrade && owner.hasUpgrade('evo_dl_1') && owner.hasUpgrade('evo_dl_2');
        
        this.w = isFullEvo ? 100 : (hasEvo2 ? 140 : 200);
        this.h = 50;
        this.delayTicks = 18; // 0.3s khựng lại trước khi nổ
        this.durationTicks = 180; // 3s duy trì lồng xích
        this.state = 'delay';
        this.pullForce = isFullEvo ? 4.5 : (hasEvo2 ? 3.5 : 2.5);
        this.pullRange = isFullEvo ? 180 : (hasEvo2 ? 150 : 110);
        this.active = true;
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        if (this.state === 'delay') {
            this.delayTicks--;
            if (this.delayTicks <= 0) {
                this.state = 'active';
                // Phát nổ tách ra 2 quả cầu xích (trái và phải)
                let leftX = Math.max(0, this.x - this.w / 2);
                let rightX = Math.min(canvas.width, this.x + this.w / 2);
                explosions.push(new Explosion(this.x, this.y, 40, 'rgba(140, 20, 220,', 0.125, this.owner));
                explosions.push(new Explosion(leftX, this.y, 25, 'rgba(180, 50, 255,', 0.05, this.owner));
                explosions.push(new Explosion(rightX, this.y, 25, 'rgba(180, 50, 255,', 0.05, this.owner));
                
                // Gây sát thương 25% dame cơ bản (0.125 dmg)
                if (enemy && enemy.hp > 0) {
                    enemy.takeDamage(0.125, this.owner);
                }
                if (typeof addFloatingText === 'function') {
                    addFloatingText(this.x, this.y - 15, "LỒNG CẤM CHẾ! ⛓️", "#ba68c8", 14);
                }
                if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            }
            return;
        }

        // State === 'active'
        this.durationTicks--;
        if (this.durationTicks <= 0) {
            this.active = false;
            this.owner.lastConfinementCageEndTime = Date.now();
            return;
        }

        if (enemy && enemy.hp > 0) {
            // Trong Lồng Cấm Chế: luôn bị Khóa Cơ Động (trừ Juggernaut)
            if (enemy.weapon !== 'juggernaut') enemy.groundedTimer = Math.max(enemy.groundedTimer || 0, 3);
            let enemyMidX = enemy.x + enemy.w / 2;
            let dx = this.x - enemyMidX;
            let left = Math.max(0, this.x - this.w / 2);
            let right = Math.min(canvas.width, this.x + this.w / 2);

            // 1. Hút mạnh vào tâm lồng theo trục ngang (không khóa trục dọc)
            if (Math.abs(dx) <= this.pullRange) {
                let dirX = (dx >= 0 ? 1 : -1);
                enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * Math.min(Math.abs(dx), this.pullForce)));
            }

            // 2. Xích chặt không thể vượt ra khỏi ranh giới lồng trong 3s
            if (enemy.x < left) enemy.x = left;
            if (enemy.x + enemy.w > right) enemy.x = right - enemy.w;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let left = Math.max(0, this.x - this.w / 2);
        let top = Math.max(0, this.y - this.h / 2);

        if (this.state === 'delay') {
            // Hiệu ứng viên đạn dừng lại, khựng 0.3s tích tụ năng lượng xích
            ctx.fillStyle = "rgba(186, 104, 200, 0.75)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e040fb";
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Vẽ Lồng Xích Cấm Chế
        ctx.fillStyle = "rgba(106, 27, 154, 0.18)";
        ctx.fillRect(left, top, this.w, this.h);

        ctx.strokeStyle = "#ba68c8";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, this.w, this.h);

        // Vẽ các mắt xích đan chéo
        ctx.strokeStyle = "rgba(224, 64, 251, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(left, top); ctx.lineTo(left + this.w, top + this.h);
        ctx.moveTo(left + this.w, top); ctx.lineTo(left, top + this.h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Biểu tượng ổ khóa xích ở tâm
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⛓️", this.x, this.y);

        ctx.restore();
    }
}
