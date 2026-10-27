// ==========================================
// Pháo Cao Xạ (aaa) — Vật triệu hồi / thực thể riêng
// ==========================================


class MortarMarker {
    constructor(x, y, owner, isAuto = false) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.r = 10;

        // --- NERF: PHẠM VI NỔ ---
        // Giảm từ 80 xuống 65 (giảm nhẹ khoảng 20%)
        this.maxR = 55; // [CÂN BẰNG] 65 -> 55

        let hasEvo1 = this.owner.hasUpgrade('evo_aaa_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_aaa_2');
        let isFullEvo = hasEvo1 && hasEvo2 && hasFullEvo(this.owner, 'aaa');
        // [FIX] Đếm theo tick (trước dùng Date.now + setTimeout: nổ bồi không cảnh báo, lặp cả khi
        // hết round / sang round mới, mỗi quả bom tự bắn cũng nổ bồi -> "nổ lặp lại" ngoài ý muốn)
        this.age = 0;
        this.detonateTime = isAuto ? 5000 : (isFullEvo ? 800 : 1500); // ms (bot đọc trường này)
        this.spawnTime = Date.now();
        this.active = true;
        this.isAuto = isAuto;
        this.echoCount = 0;
        // Nổ bồi: chỉ Evo 2 -> lặp 1 lần, Full Evo -> lặp 2 lần (mỗi lần có cảnh báo, 50% dame)
        this.echoLeft = isAuto ? 0 : (isFullEvo ? 2 : (hasEvo2 ? 1 : 0));
        this.baseDmg = 0;

        // Evo 1: ghim đuổi mục tiêu. Full Evo KHÔNG đuổi nữa (bù bằng 2 quả phụ rơi quanh mục tiêu)
        if (hasEvo1 && !isFullEvo && !isAuto) {
            this.tracking = true;
        }
    }

    update() {
        if (!this.active) return;

        // --- BUFF: TỐC ĐỘ ĐUỔI (TRACKING) --- (nổ bồi đứng yên tại chỗ)
        if (this.tracking && this.echoCount === 0) {
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let dx = (enemy.x + enemy.w / 2) - this.x;
            let dy = (enemy.y + enemy.h / 2) - this.y;
            this.x += dx * 0.06;
            this.y += dy * 0.06;
        }

        this.age++;
        this.spawnTime = Date.now() - this.age * (1000 / 60); // giữ tương thích cho smart-bot
        if (this.age * (1000 / 60) >= this.detonateTime) {
            this.explode();
        }
    }

    explode() {
        // Lần nổ đầu: 1.5x dame; mỗi lần nổ bồi: 50% dame lần đầu
        if (this.echoCount === 0) this.baseDmg = (this.owner.damage + this.owner.dmgBuff) * 1.5; // [CÂN BẰNG] 2x -> 1.5x
        const damage = this.echoCount === 0 ? this.baseDmg : this.baseDmg * 0.5;
        const R = this.echoCount === 0 ? this.maxR : this.maxR * 0.9;
        const col = this.echoCount === 0 ? 'rgba(255, 69, 0,' : (this.echoCount === 1 ? 'rgba(255, 140, 0,' : 'rgba(255, 215, 0,');
        explosions.push(new Explosion(this.x, this.y, R, col, damage, this.owner, true));

        if (this.echoLeft > 0) {
            // Ở lại tại chỗ, hiện cảnh báo lại rồi nổ bồi
            this.echoLeft--;
            this.echoCount++;
            this.age = 0;
            this.detonateTime = 900;
            return;
        }
        this.active = false;
    }

    // ... (Giữ nguyên hàm draw() đã cập nhật giao diện ở bước trước) ...
    draw() {
        if (!this.active) return;
        const age = this.age * (1000 / 60);
        const progress = Math.min(1, age / this.detonateTime);
        const echo = this.echoCount > 0;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Nền cảnh báo
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        ctx.fillStyle = echo ? `rgba(255, 170, 30, 0.25)` : `rgba(255, 50, 50, 0.3)`;
        ctx.fill();

        // Viền đậm
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        let isCritical = (this.detonateTime - age) < 1000;
        ctx.strokeStyle = isCritical
            ? ((Math.floor(Date.now() / 100) % 2 === 0) ? 'yellow' : (echo ? 'orange' : 'red'))
            : (echo ? 'orange' : 'red');
        ctx.lineWidth = 5;
        ctx.stroke();

        // Tâm ngắm
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
        ctx.moveTo(0, -15); ctx.lineTo(0, 15);
        ctx.stroke();

        // Text
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.shadowColor = "black"; ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.fillText((echo ? '↻ ' : '') + Math.max(0, (this.detonateTime - age) / 1000).toFixed(1), 0, -20);
        if (echo) {
            // Vòng ngoài nét đứt: báo trước nổ bồi (50% dame)
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = 'rgba(255, 200, 80, 0.85)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, this.maxR * 0.9, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}
