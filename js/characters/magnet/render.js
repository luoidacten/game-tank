// ==========================================
// magnet (magnet) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] magnet
    drawUIForMagnet(uiY, subUiY) {
        if (this.weapon === 'magnet') {
            let badgeY = (this.id === 1) ? uiY - 14 : subUiY + 14;
            let isPos = (this.magnetPolarity === 1);
            ctx.fillStyle = isPos ? "#ff3300" : "#00aaff";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, badgeY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPos ? "+" : "-", this.x + this.w / 2, badgeY);
            ctx.textBaseline = "alphabetic";
            if (this.isPolarDashing) this.drawPolarDashFx();
        }
    },

    // Lướt Cực Tính: vệt từ trường phía sau + tia từ lực nối tới mục tiêu khác cực
    drawPolarDashFx() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const isPos = (this.magnetPolarity === 1);
        const col = isPos ? '#ff4400' : '#00d0ff';
        const rgb = isPos ? '255, 80, 20' : '0, 200, 255';
        const back = (this.id === 1) ? 1 : -1;
        const t = this.polarDashT || 0;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (this.polarDashPhase === 1) {
            // Vệt lao
            const g = ctx.createLinearGradient(cx, cy, cx, cy + back * 90);
            g.addColorStop(0, `rgba(${rgb}, 0.55)`); g.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(cx - this.w / 2, cy); ctx.lineTo(cx + this.w / 2, cy); ctx.lineTo(cx + 4, cy + back * 90); ctx.lineTo(cx - 4, cy + back * 90);
            ctx.closePath(); ctx.fill();
            // Tia từ lực tới mục tiêu
            const tg = this.polarDashTarget;
            if (tg) {
                const tx = this.polarDashKind === 'enemy' ? tg.x + tg.w / 2 : tg.x;
                const ty = this.polarDashKind === 'enemy' ? tg.y + tg.h / 2 : tg.y;
                ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = col;
                ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 3;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
                ctx.setLineDash([]);
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
                const k = (t % 12) / 12;
                ctx.beginPath(); ctx.arc(tx, ty, 26 - 16 * k, 0, Math.PI * 2); ctx.stroke();
            }
            // Khiên từ quanh xe (bất khả xâm phạm khi lao)
            ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.shadowBlur = 16; ctx.shadowColor = col;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.75 + Math.sin(t * 0.8) * 2, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(${rgb}, 0.5)`; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.7, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
});
