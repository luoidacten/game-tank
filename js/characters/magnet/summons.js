// ==========================================
// magnet (magnet) — Vật triệu hồi / thực thể riêng
// ==========================================



function drawMagnetNode(m) {
    if (!m.active) return;
    ctx.save();
    let isPos = (m.polarity === 1);
    let auraColor = isPos ? 'rgba(255, 60, 0, 0.12)' : 'rgba(0, 180, 255, 0.12)';
    let strokeColor = isPos ? '#ff4400' : '#00aaff';
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isPos ? 'rgba(255, 60, 0, 0.4)' : 'rgba(0, 180, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isPos ? "+" : "-", m.x, m.y);
    ctx.restore();
}
