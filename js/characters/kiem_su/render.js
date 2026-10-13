// ==========================================
// Kiếm Sư (kiem_su) — Hình ảnh: hàng chờ nguyên tố, vòng giữ đổi đạn
// ==========================================

Object.assign(CharHooks.registry.kiem_su, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        // Lõi ngũ hành trên thân xe: viên đạn kế tiếp
        const next = (this.ksQueue && this.ksQueue[0]) || 'white';
        ctx.fillStyle = KS_COLOR[next];
        ctx.shadowBlur = 8; ctx.shadowColor = KS_COLOR[next];
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (this.ksSpeedBuff > 0) {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, 0, Math.PI * 2); ctx.stroke();
        }
        if (this.ksHold > 2 && this.ksHold < 15) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.ksHold / 15); ctx.stroke();
        }
        ctx.restore();
    },

    drawUI() {
        const q = this.ksQueue || [];
        const n = Math.min(q.length, 5);
        if (!n) return;
        const y = this.id === 1 ? this.y + this.h + 13 : this.y - 15;
        const x0 = this.x + this.w / 2 - (n * 8) / 2 + 4;
        ctx.save();
        for (let i = 0; i < n; i++) {
            ctx.globalAlpha = i === 0 ? 1 : 0.65;
            ctx.fillStyle = KS_COLOR[q[i]];
            ctx.beginPath(); ctx.arc(x0 + i * 8, y, i === 0 ? 3.2 : 2.4, 0, Math.PI * 2); ctx.fill();
        }
        // Gợi ý phản ứng sắp kích hoạt (Evo 2)
        if (this.hasUpgrade('evo_ks_2') && this.ksPrevEl && this.ksPrevEl !== 'white' && q[0] && q[0] !== 'white') {
            ctx.globalAlpha = 1;
            ctx.font = 'bold 8px "Orbitron", Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = KS_COLOR[q[0]];
            drawWorldText(ctx, KS_COMBOS[ksComboKey(this.ksPrevEl, q[0])], this.x + this.w / 2, this.id === 1 ? y + 11 : y - 6);
        }
        ctx.restore();
    },
});
