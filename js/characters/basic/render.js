// ==========================================
// Cơ Bản (basic) — HUD: nhãn MAIN, trạng thái Hồi Ức, hồi chiêu Lướt (Cơ Hội Cuối)
// (hình xe dạng thường / MAIN: js/render/tank-art/core_small.js)
// ==========================================

CharHooks.registry.basic.drawUI = function () {
    if (typeof hudFrame !== 'function') return;
    const F = hudFrame(this);
    const main = !!this.mainAwakened;
    const lx = this.w / 2 + 6, d = -this.h / 2;
    ctx.save();
    ctx.font = 'bold 9px Arial';
    if (main || this.mainEgg) {
        const pulse = 0.75 + 0.25 * Math.sin((this.mainTick || 0) * 0.15);
        ctx.fillStyle = main ? `rgba(255,176,32,${pulse})` : '#ffd27a';
        ctx.shadowBlur = main ? 10 : 4; ctx.shadowColor = '#ff7a00';
        hudText(F, main ? (this.mainFinal ? 'MAIN ★' : 'MAIN') : 'MAIN', lx, d - 6, 'left');
    }
    ctx.shadowBlur = 0;
    ctx.font = 'bold 8px Arial';
    if (!main && this.mainEgg) {
        // Hồi Ức sẵn sàng (ngọn lửa mờ chờ bùng cháy)
        ctx.fillStyle = 'rgba(255,140,40,0.85)';
        hudText(F, '🔥 HỒI ỨC', lx, d + 5, 'left');
    } else if (this.mainFinal) {
        const cd = this.mainDashCd || 0;
        ctx.fillStyle = cd > 0 ? 'rgba(200,200,200,0.7)' : '#7ff6ff';
        hudText(F, cd > 0 ? `LƯỚT ${Math.ceil(cd / 60)}s` : 'LƯỚT ⇆', lx, d + 5, 'left');
    }
    ctx.restore();
};
