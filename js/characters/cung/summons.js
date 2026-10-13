// ==========================================
// cung (cung) — Vật triệu hồi / thực thể riêng
// ==========================================



class ArrowRain {
    constructor(owner, targetX, targetY, radius, isGlobal = false) {
        this.owner = owner;
        this.x = targetX;
        this.y = targetY;
        this.radius = radius;
        this.isGlobal = isGlobal;
        this.duration = 5000; // Mưa rơi trong 5 giây
        this.spawnTime = Date.now();
        this.active = true;
        this.arrowsFired = 0;

        let isFullEvo = owner.hasUpgrade('evo_cung_1') && owner.hasUpgrade('evo_cung_2');
        let dmg = owner.damage + owner.dmgBuff;

        // --- CÔNG THỨC SỐ LƯỢNG MŨI TÊN MỚI ---
        if (this.isGlobal) {
            // Mưa full màn hình: (Sát Thương * 50) + 200
            this.totalArrows = Math.floor(dmg * 50) + 200;
        } else if (isFullEvo) {
            // Full Evo: (Sát Thương * 20) + 100, giới hạn 800
            this.totalArrows = Math.min(Math.floor(dmg * 20) + 100, 800);
        } else {
            // Căn bản: (Sát Thương * 10) + 50, giới hạn 500
            this.totalArrows = Math.min(Math.floor(dmg * 10) + 50, 500);
        }

        // Chia đều thời gian rơi (mật độ)
        this.fireInterval = this.duration / this.totalArrows;
        this.lastFireTime = Date.now();
    }

    update() {
        if (!this.active) return;
        let now = Date.now();

        if (now - this.spawnTime > this.duration || this.arrowsFired >= this.totalArrows) {
            this.active = false;
            return;
        }

        if (now - this.lastFireTime >= this.fireInterval) {
            this.lastFireTime = now;
            this.arrowsFired++;

            // Lấy tọa độ ngẫu nhiên
            let dropX = this.isGlobal ? Math.random() * canvas.width : this.x + (Math.random() * 2 - 1) * this.radius;
            let dropY = this.isGlobal ? Math.random() * canvas.height : this.y + (Math.random() * 2 - 1) * this.radius;
            // [FIX] Mưa tên toàn sân: rơi trên làn đối thủ (trước: rải khắp sân, đa số rơi vào khoảng trống)
            if (this.isGlobal) {
                const enemy = this.owner === p1 ? p2 : p1;
                if (enemy) dropY = enemy.y + enemy.h / 2 + (Math.random() * 2 - 1) * 18;
            }

            // Ép tọa độ không lọt ra ngoài mép bản đồ
            dropX = Math.max(15, Math.min(canvas.width - 15, dropX));
            dropY = Math.max(15, Math.min(canvas.height - 15, dropY));

            // THAY ĐỔI: Gọi chấm đen rơi xuống
            arrowDrops.push(new ArrowDropMarker(dropX, dropY, this.owner, this.owner.damage));
        }
    }

    draw() {
        if (!this.active || this.isGlobal) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 69, 0, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'red';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
    }
}
class ArrowDropMarker {
    constructor(x, y, owner, dmg) {
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.dmg = dmg;
        this.spawnTime = Date.now();

        this.delay = 600; // Thời gian từ lúc hiện chấm đen đến lúc nổ (0.6 giây)
        this.startRadius = 15; // Kích thước chấm đen ban đầu
        this.endRadius = 3;    // Kích thước khi thu nhỏ tối đa
        this.active = true;
    }

    update() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        if (age >= this.delay) {
            this.explode();
        }
    }

    explode() {
        this.active = false;
        // Tạo vụ nổ nhỏ (phạm vi 30) tại vị trí chấm đen, sát thương x1.5
        explosions.push(new Explosion(this.x, this.y, 30, 'rgba(255, 0, 0,', this.dmg * 1.5, this.owner));
    }

    draw() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        let progress = Math.min(age / this.delay, 1);

        // Chấm tròn thu nhỏ dần
        let currentRadius = this.startRadius - (this.startRadius - this.endRadius) * progress;

        // Tính toán màu sắc: Từ Đen (0,0,0) chuyển dần sang Đỏ (255,0,0)
        let r = Math.floor(255 * progress);
        let color = `rgb(${r}, 0, 0)`;

        ctx.save();

        // Vẽ vòng viền mờ cảnh báo bên ngoài (tùy chọn)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.startRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Vẽ chấm đen/đỏ ở giữa
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Hiệu ứng phát sáng khi sắp nổ
        if (progress > 0.7) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "red";
            ctx.fill();
        }

        ctx.restore();
    }
}
