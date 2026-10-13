// ==========================================
// Kiếm bay dùng chung (Kiếm Tôn, Kiếm Trận)
// ==========================================



// Class Kiếm Bay Tự Do (Dành cho Vạn Kiếm, Phá Thiên, và delay Anh Minh)
class FloatingSword {
    constructor(x, y, w, h, vx, vy, delay, dmg, isPiercing, isHoming, owner, isGreatSword = false, color = null, isAnhMinhMarker = false) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.vx = vx; this.vy = vy;
        this.delay = delay; // Thời gian chờ trước khi phóng
        this.dmg = dmg;
        this.isPiercing = isPiercing;
        this.isHoming = isHoming;
        this.owner = owner;
        this.isGreatSword = isGreatSword;
        this.color = color || ((this.owner.id === 1) ? '#3498db' : '#e74c3c'); // Hỗ trợ custom màu
        this.isAnhMinhMarker = isAnhMinhMarker; // Cờ cho skill Anh Minh
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            this.delay--;
            if (this.isAnhMinhMarker) {
                // Nếu là kiếm Anh Minh, khóa vị trí lơ lửng trên đầu nhân vật
                this.x = this.owner.x + this.owner.w / 2 - this.w / 2;
                this.y = this.owner.y + (this.owner.id === 1 ? -45 : this.owner.h + 15);
            } else {
                // Kiếm thường: rung nhẹ khi chờ
                this.x += (Math.random() - 0.5) * 1.5;
            }
        } else {
            if (this.isAnhMinhMarker) {
                // Hết delay 1s -> Bắn tia Hitscan từ vị trí thanh kiếm vàng
                this.owner.fireAnhMinhHitscan(this.dmg, this.isPiercing, this.color, this.x + this.w / 2, this.y);
                this.active = false;
            } else {
                // Các loại kiếm khác: Hết delay -> Chuyển thành Đạn (Bullet) bay đi
                this.owner.bullets.push({
                    x: this.x, y: this.y, w: this.w, h: this.h,
                    vx: this.vx, vy: this.vy, dmg: this.dmg, owner: this.owner,
                    isPiercing: this.isPiercing, isHoming: this.isHoming, hitIds: [], bounceCount: 0,
                    isFloatingSwordGraphic: true, isGreatSword: this.isGreatSword,
                    color: this.color // Lưu lại màu cho lúc vẽ
                });
                this.active = false;
            }
        }
    }
    draw() {
        if (!this.active) return;
        let dirY = (this.owner.id === 1) ? -1 : 1;
        if (this.isAnhMinhMarker) dirY = (this.owner.id === 1) ? -1 : 1; // Mũi kiếm chỉ về địch
        drawGlowingSword(this.x, this.y, this.w, this.h, this.color, dirY);
    }
}



// Hàm vẽ Kiếm có hiệu ứng phát sáng (Graphic Improvement)
function drawGlowingSword(x, y, w, h, color, dirY = -1) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = "white";

    // [FIX LỖI KIẾM NGƯỢC] Lật Canvas nếu đạn bay xuống
    if (dirY === 1) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(1, -1);
        ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    // Vẽ hình dáng thanh kiếm (nhọn ở đầu)
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y); // Mũi kiếm
    ctx.lineTo(x + w, y + h * 0.2); // Vai kiếm phải
    ctx.lineTo(x + w * 0.8, y + h); // Đuôi phải
    ctx.lineTo(x + w * 0.2, y + h); // Đuôi trái
    ctx.lineTo(x, y + h * 0.2); // Vai kiếm trái
    ctx.closePath();
    ctx.fill();

    // Lõi kiếm
    ctx.fillStyle = color;
    ctx.fillRect(x + w * 0.3, y + h * 0.2, w * 0.4, h * 0.8);
    ctx.restore();
}
