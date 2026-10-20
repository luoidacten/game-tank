// ==========================================
// Phong Trảm (wind_slash) — Vật triệu hồi / thực thể riêng
// ==========================================

  // <--- THÊM DÒNG NÀY
// --- CLASS TƯỜNG GIÓ (WIND WALL) ---
class WindWall {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.w = 120; this.h = 20; // Tường rộng
        this.owner = owner;
        this.lifeTime = 240; // 2 giây (60fps * 2)
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // 1. CHẶN ĐẠN ĐỊCH
        const enemy = (this.owner.id === 1) ? p2 : p1;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            let b = enemy.bullets[i];
            // Nếu đạn chạm tường
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                // Hủy đạn ngay lập tức (kể cả đạn xuyên)
                enemy.bullets.splice(i, 1);
                // Hiệu ứng chặn
                explosions.push(new Explosion(b.x, b.y, 20, 'white', 0, this.owner));
            }
        }

        // 2. GIA TỐC ĐẠN MÌNH (Phong Trảm)
        for (let b of this.owner.bullets) {
            if (b.isWindBlade && !b.isAccelerated) {
                if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                    b.vy *= 2; // Tăng gấp đôi tốc độ
                    b.isAccelerated = true; // Đánh dấu để không buff nhiều lần
                    // Visual buff
                    explosions.push(new Explosion(b.x, b.y, 30, 'cyan', 0, this.owner));
                }
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#aaddff";
        // Vẽ tường lượn sóng hoặc hình chữ nhật mờ
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Viền gió xoáy
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Text Wind Wall
        ctx.fillStyle = "white"; ctx.font = "10px Arial"; ctx.textAlign = "center";
        ctx.fillText("WIND WALL", 0, 4);
        ctx.restore();
    }
}

// ---------- Entity: kết liễu PHONG TRẢM (dữ liệu thuần, đồng bộ online) ----------
class WsFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 130; this.active = true;
    }
    update() {
        this.t++;
        // lưỡi gió khổng lồ quét qua nạn nhân
        if (this.t === 20) {
            triggerScreenShake(9, 14);
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x, this.y, '#a7f3d0', 26);
            explosions.push(new Explosion(this.x, this.y, 46, 'rgba(167, 243, 208,', 0, this.team === 1 ? p1 : p2));
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof wsDrawFinisherOver === 'function') wsDrawFinisherOver(this); }
}
