// ==========================================
// Kiếm Khách (kiem_khach) — Hình ảnh: hào quang Tập Trung, Hóa Thần, tiến độ bài tập
// ==========================================

Object.assign(CharHooks.registry.kiem_khach, {
    draw() {
        const d = this.kkData;
        if (!d) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now() / 1000;
        ctx.save();
        // Hóa Thần: hào quang vàng + kiếm xoay quanh
        if (d.hoaThan) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.9, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 4; i++) {
                const a = t * 2 + i * Math.PI / 2;
                const x = cx + Math.cos(a) * this.w * 0.9, y = cy + Math.sin(a) * this.w * 0.9;
                if (typeof swBlade === 'function') swBlade(x, y, a + Math.PI / 2, 16, 3.4, SW_STYLES.kiem_khach_gold, 1, 1);
                else { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); }
            }
        }
        // Tập Trung: vòng sáng xanh + thanh thời gian, sân hơi tối ở mép (sắc thái tập trung)
        if ((this.kkFocus || 0) > 0) {
            const k = this.kkFocus / Math.max(1, this.kkFocusMax || this.kkFocus);
            const g = ctx.createRadialGradient(cx, cy, this.w * 0.3, cx, cy, this.w * 1.4);
            g.addColorStop(0, 'rgba(125, 211, 252, 0.0)');
            g.addColorStop(1, 'rgba(125, 211, 252, 0.35)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            const v = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75);
            v.addColorStop(0, 'rgba(10, 30, 60, 0)');
            v.addColorStop(1, 'rgba(10, 40, 80, 0.28)');
            ctx.fillStyle = v;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
    },

    drawUI() {
        const d = this.kkData;
        if (!d || !d.active.length) return;
        // Chấm tiến độ bài tập dưới/ trên xe
        const y = this.id === 1 ? this.y + this.h + 12 : this.y - 16;
        const n = Math.min(d.active.length, 6);
        const w = 8, gap = 3, x0 = this.x + this.w / 2 - (n * w + (n - 1) * gap) / 2;
        ctx.save();
        for (let i = 0; i < n; i++) {
            const a = d.active[i];
            const k = Math.min(1, a.prog / a.need);
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x0 + i * (w + gap), y, w, 3);
            ctx.fillStyle = KK_QUEST_BY_ID[a.id].group === 'final' ? '#f0abfc' : '#7dd3fc';
            ctx.fillRect(x0 + i * (w + gap), y, w * k, 3);
        }
        ctx.restore();
    },
});
