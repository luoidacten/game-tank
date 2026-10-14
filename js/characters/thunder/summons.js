// ==========================================
// thunder (thunder) — Vật triệu hồi / thực thể riêng
// ==========================================



// Vẽ 1 cây Lôi Phong Thương nằm dọc trục X (mũi về +X), dài L
function drawThunderSpearShape(L = 30, alpha = 1, crackle = true) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.shadowColor = '#ffeb3b'; ctx.shadowBlur = 12;
    // Cán
    const g = ctx.createLinearGradient(-L / 2, 0, L / 2, 0);
    g.addColorStop(0, '#5d4037'); g.addColorStop(0.5, '#fbc02d'); g.addColorStop(1, '#fff59d');
    ctx.fillStyle = g;
    ctx.fillRect(-L / 2, -1.6, L * 0.78, 3.2);
    // Mũi giáo
    ctx.beginPath();
    ctx.moveTo(L * 0.28, -5); ctx.lineTo(L / 2 + 6, 0); ctx.lineTo(L * 0.28, 5); ctx.lineTo(L * 0.34, 0); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 1.2; ctx.stroke();
    // Tua đuôi
    ctx.fillStyle = '#80deea';
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(-L / 2 - 6, -3); ctx.lineTo(-L / 2 - 4, 0); ctx.lineTo(-L / 2 - 6, 3); ctx.closePath(); ctx.fill();
    // Điện chạy dọc thân
    if (crackle) {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.shadowBlur = 6;
        ctx.beginPath();
        const ph = Math.floor(Date.now() / 60);
        for (let i = 0; i <= 6; i++) {
            const x = -L / 2 + (L * 0.8) * i / 6, y = ((i + ph) % 2 ? -3 : 3) * (i % 3 === 0 ? 0.4 : 1);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawThunderPlantedSpear(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    drawThunderSpearShape(30, 1, true);
    // Vòng điện quanh chỗ cắm
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-14, 0, 6 + Math.sin(Date.now() / 120) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
