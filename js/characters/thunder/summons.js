// ==========================================
// thunder (thunder) — Vật triệu hồi / thực thể riêng
// ==========================================



function drawThunderPlantedSpear(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = "#ffff00";
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 10;
    ctx.fillRect(-14, -2, 28, 4);
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(24, 0);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
}
