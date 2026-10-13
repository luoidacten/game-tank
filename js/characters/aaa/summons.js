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

        this.spawnTime = Date.now();
        let hasEvo1 = this.owner.hasUpgrade('evo_aaa_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_aaa_2');
        let isFullEvo = hasEvo1 && hasEvo2;
        this.detonateTime = isAuto ? 5000 : (isFullEvo ? 500 : 1500);
        this.active = true;
        this.isAuto = isAuto;
        this.echoCount = 0;

        if (hasEvo1 && !isAuto) {
            this.tracking = true;
        }
    }

    update() {
        if (!this.active) return;

        // --- BUFF: TỐC ĐỘ ĐUỔI (TRACKING) ---
        if (this.tracking) {
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let dx = (enemy.x + enemy.w / 2) - this.x;
            let dy = (enemy.y + enemy.h / 2) - this.y;

            // Tăng hệ số từ 0.02 lên 0.06 (Nhanh gấp 3 lần)
            // Số càng lớn đuổi càng rát.
            this.x += dx * 0.06;
            this.y += dy * 0.06;
        }

        const age = Date.now() - this.spawnTime;
        if (age >= this.detonateTime) {
            this.explode();
        }
    }

    explode() {
        // Dame to (x2 dame gốc)
        let damage = (this.owner.damage + this.owner.dmgBuff) * 1.5; // [CÂN BẰNG] 2x -> 1.5x

        // Kích hoạt nổ với tham số hasFalloff = true (giảm dame theo rìa)
        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(255, 69, 0,', damage, this.owner, true));

        // Logic Nổ Bồi (Echo) cho Evo 2
        let hasEvo2 = this.owner.hasUpgrade('evo_aaa_2');
        let isFullEvo = hasEvo2 && this.owner.hasUpgrade('evo_aaa_1');

        if (this.echoCount === 0) {
            if (hasEvo2) {
                setTimeout(() => {
                    // Nổ bồi nhỏ hơn chút (0.8 maxR)
                    explosions.push(new Explosion(this.x, this.y, this.maxR * 0.8, 'rgba(255, 140, 0,', damage * 0.8, this.owner, true));
                }, 2000);
            }
            if (isFullEvo) {
                setTimeout(() => {
                    // Nổ bồi lần 3 nhỏ hơn nữa (0.6 maxR)
                    explosions.push(new Explosion(this.x, this.y, this.maxR * 0.6, 'rgba(255, 215, 0,', damage * 0.6, this.owner, true));
                }, 4000);
            }
        }

        this.active = false;
    }

    // ... (Giữ nguyên hàm draw() đã cập nhật giao diện ở bước trước) ...
    draw() {
        if (!this.active) return;
        const age = Date.now() - this.spawnTime;
        const progress = age / this.detonateTime;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Nền cảnh báo
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 50, 50, 0.3)`;
        ctx.fill();

        // Viền đậm
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        let isCritical = (this.detonateTime - age) < 1000;
        ctx.strokeStyle = isCritical
            ? ((Math.floor(Date.now() / 100) % 2 === 0) ? 'yellow' : 'red')
            : 'red';
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
        ctx.fillText(((this.detonateTime - age) / 1000).toFixed(1), 0, -20);

        ctx.restore();
    }
}
