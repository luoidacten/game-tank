// ==========================================
// magnet (magnet) — Vật triệu hồi / thực thể riêng
// ==========================================



function drawMagnetNode(m) {
    if (!m.active) return;
    ctx.save();
    let isPos = (m.polarity === 1);
    let age = m.age || 0;
    let strong = age <= 120; // 2s đầu: từ trường cực mạnh
    let rgb = isPos ? '255, 60, 0' : '0, 180, 255';
    let strokeColor = isPos ? '#ff4400' : '#00aaff';
    ctx.fillStyle = `rgba(${rgb}, ${strong ? 0.2 : 0.07})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgb}, ${strong ? 0.75 : 0.3})`;
    ctx.lineWidth = strong ? 2 : 1.2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = (isPos ? 1 : -1) * age * 0.5;
    ctx.stroke();
    ctx.setLineDash([]);
    if (strong) {
        // Sóng từ co vào tâm + vòng đếm ngược thời gian cực mạnh
        ctx.shadowBlur = 12; ctx.shadowColor = strokeColor;
        for (let i = 0; i < 2; i++) {
            let k = ((age * 0.025) + i * 0.5) % 1;
            ctx.strokeStyle = `rgba(${rgb}, ${0.55 * k})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(m.x, m.y, 14 + (m.radius - 14) * k, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(m.x, m.y, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - age / 120)); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    ctx.fillStyle = strokeColor;
    ctx.globalAlpha = strong ? 1 : 0.75;
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
