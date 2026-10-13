// ==========================================
// Sniper (sniper) — Vật triệu hồi / thực thể riêng
// ==========================================

 // Thêm biến mảng global này cùng chỗ với turrets, iceZones...
class SniperWall {
    constructor(x, y, owner, isMoving = false) {
        this.w = 60; this.h = 20;
        this.x = x; this.y = y;
        this.owner = owner;
        this.isMoving = isMoving;
        this.vx = isMoving ? 1.5 : 0;
        this.dir = Math.random() > 0.5 ? 1 : -1;

        // [CẬP NHẬT] Tường di chuyển sẽ là Tường Bất Tử
        this.isImmortal = isMoving;

        let hpMultiplier = owner.hasUpgrade('evo_sniper_1') ? 5 : 3;
        this.maxHp = owner.maxHp * hpMultiplier;
        this.hp = this.maxHp;
        this.active = true;

        // Tốc độ giảm máu để tường tự biến mất sau 10 giây (chỉ áp dụng tường đứng yên)
        this.decayRate = this.maxHp / 600;
    }

    update() {
        if (!this.active) return;

        // Chỉ tường do người chơi đặt (đứng yên) mới bị giảm máu và tự vỡ
        if (!this.isImmortal) {
            this.hp -= this.decayRate;
            if (this.hp <= 0) {
                this.active = false;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, this.owner));
            }
        }

        if (this.isMoving) {
            this.x += this.vx * this.dir;
            if (this.x <= 0 || this.x + this.w >= canvas.width) this.dir *= -1;
        }
    }

    draw() {
        if (!this.active) return;

        // Đổi màu tường bất tử sang màu xám để dễ phân biệt, tường tự đặt thì có màu của phe
        if (this.isImmortal) {
            ctx.fillStyle = "rgba(149, 165, 166, 0.9)"; // Màu xám kim loại
        } else {
            ctx.fillStyle = (this.owner.id === 1) ? "rgba(52, 152, 219, 0.7)" : "rgba(231, 76, 60, 0.7)";
        }

        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Chỉ vẽ thanh máu cho tường có thể phá hủy (tường tự đặt)
        if (!this.isImmortal) {
            ctx.fillStyle = "red"; ctx.fillRect(this.x, this.y - 5, this.w, 3);
            ctx.fillStyle = "#0f0"; ctx.fillRect(this.x, this.y - 5, this.w * (this.hp / this.maxHp), 3);
        }
    }
}
