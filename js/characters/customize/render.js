// ==========================================
// Tùy Biến (customize) — Hình ảnh: thanh tụ lực, tia liên tục, năng lượng, vòng Tập Trung
// ==========================================

Object.assign(CharHooks.registry.customize, {
    draw() {
        const d = this.cuData;
        if (!d) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        // Tia liên tục
        if (d.fire === 'hold' && this.cuBeamOn) {
            const ny = this.id === 1 ? this.y : this.y + this.h;
            const len = this.cuBeamLen || canvas.height;
            const col = this.id === 1 ? '#38bdf8' : '#fb7185';
            ctx.strokeStyle = col; ctx.lineWidth = 4 + Math.sin(Date.now() / 40) * 1.5;
            ctx.shadowBlur = 12; ctx.shadowColor = col;
            ctx.beginPath(); ctx.moveTo(cx, ny); ctx.lineTo(cx, ny + (this.id === 1 ? -len : len)); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Vòng tụ lực
        if (d.fire === 'charge' && this.cuCharge > 0) {
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.cuCharge / 90); ctx.stroke();
        }
        // Tập Trung Tuyệt Đối
        if (this.cuFocus > 0) {
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.0, 0, Math.PI * 2); ctx.stroke();
        }
        // Chi tiết mô-đun trên thân xe: chấm màu theo tính chất
        const dots = d.traits.slice(0, 6);
        dots.forEach((t, i) => {
            ctx.fillStyle = { explosive: '#f97316', piercing: '#a855f7', hitscan: '#ef4444', homing: '#22d3ee', sticky: '#eab308', bounce: '#84cc16' }[t] || (ZONE_STYLE[t.slice(3)] || [0, '#fff'])[1];
            ctx.fillRect(this.x + 3 + i * 4, this.y + this.h - 5, 3, 3);
        });
        ctx.restore();
    },

    drawUI() {
        const d = this.cuData;
        if (!d || d.fire !== 'hold') return;
        const y = this.id === 1 ? this.y + this.h + 12 : this.y - 16;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(this.x - 4, y, this.w + 8, 4);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(this.x - 4, y, (this.w + 8) * this.cuEnergy / 100, 4);
        ctx.restore();
    },
});
