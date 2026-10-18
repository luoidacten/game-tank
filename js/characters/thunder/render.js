// ==========================================
// thunder (thunder) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] thunder
    drawUIForThunder(uiY, subUiY) {
        if (this.weapon === 'thunder') {
            let spearY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            let startX = this.x + this.w / 2 - 18;
            // (Số giáo hiện tại được thể hiện bằng giá giáo sau lưng - xem CharHooks 'thunder'.draw)
            void startX;
            if (this.thunderLoiMinhTimer > 0) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚡ THIÊN KIẾP (${Math.ceil(this.thunderLoiMinhTimer / 60)}s)`, this.x + this.w / 2, spearY - 5);
            } else if (this.thunderLoiMinhStacks > 0) {
                ctx.fillStyle = "#ffffaa";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `LÔI MINH: ${this.thunderLoiMinhStacks}/3`, this.x + this.w / 2, spearY - 5);
            }
            if (this.thunderShieldHits > 0) {
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            }
        }
    }
});

// Vòng Cảnh Báo Thiên Lôi Giáng (xe đang ở trên trời)
function drawThunderSkyCircle(p) {
    const c = p.thunderSky;
    if (!c) return;
    const t = c.t;
    const locked = c.lock > 0;
    const lk = locked ? 1 - c.lock / THUNDER_SKY_LOCK : 0;   // 0..1 trong 0.5s khóa
    const R = c.r;
    ctx.save();
    if (!locked) {
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, R);
        g.addColorStop(0, 'rgba(255, 241, 118, 0.06)');
        g.addColorStop(1, 'rgba(128, 222, 234, 0.24)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff176'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#fff176';
        ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t * 0.8;
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // Thời gian còn lại
        ctx.strokeStyle = 'rgba(128, 222, 234, 0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(c.x, c.y, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - t / c.max)); ctx.stroke();
        // Cung điện xoay
        ctx.strokeStyle = '#e0f7fa'; ctx.lineWidth = 1.5;
        for (let a = 0; a < 3; a++) {
            const ang = t * 0.06 + a * 2.09;
            ctx.beginPath(); ctx.arc(c.x, c.y, R * 0.62, ang, ang + 0.8); ctx.stroke();
        }
    } else {
        // KHÓA: đỏ đặc + vòng co lại -> né ngay!
        ctx.fillStyle = `rgba(255, 40, 40, ${0.25 + 0.3 * lk})`;
        ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 3; ctx.shadowBlur = 18; ctx.shadowColor = '#ff3030';
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(2, R * (1 - lk)), 0, Math.PI * 2); ctx.stroke();
        // Cột sét đang giáng xuống từ trời
        const dir = p.id === 1 ? -1 : 1;           // phía "trời" = phía sau lưng đối thủ
        const top = c.y + dir * (260 * (1 - lk) + 30);
        ctx.globalCompositeOperation = 'lighter';
        const lg = ctx.createLinearGradient(c.x, top, c.x, c.y);
        lg.addColorStop(0, 'rgba(255, 241, 118, 0)'); lg.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
        ctx.fillStyle = lg;
        ctx.fillRect(c.x - 7, Math.min(top, c.y), 14, Math.abs(c.y - top));
    }
    // Ký hiệu tia sét ở tâm
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = locked ? '#ffffff' : '#fff176';
    ctx.shadowBlur = 12; ctx.shadowColor = '#fff176';
    const x = c.x, y = c.y, s = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, y - 10 * s); ctx.lineTo(x - 5 * s, y + 1 * s); ctx.lineTo(x, y + 1 * s);
    ctx.lineTo(x - 2 * s, y + 10 * s); ctx.lineTo(x + 5 * s, y - 1 * s); ctx.lineTo(x, y - 1 * s);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

// Hình ảnh đặc trưng của Lôi Thần (vẽ sau thân xe)
CharHooks.register('thunder', {
    // Lôi Độn / Thiên Lôi Giáng: khóa di chuyển (trái/phải dùng để lái vòng cảnh báo)
    speed(s) { return (this.thunderDashState || this.thunderSky) ? 0 : s; },
    update(inp, effInp) { if (this.thunderSky) this.updateThunderSky(effInp || inp); },
    // Bất tử khi đang hóa sét lao đi hoặc đang ở trên trời
    beforeDamage() { return !!(this.thunderDashState || this.thunderSky); },
    draw() {
        if (this.thunderSky) { drawThunderSkyCircle(this); return; }
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const back = this.id === 1 ? 1 : -1; // phía sau lưng (ngược hướng địch)
        // 1. Giá giáo sau lưng: số cây = số giáo đang cầm, xòe hình quạt
        const n = this.thunderSpears || 0;
        for (let i = 0; i < 3; i++) {
            const off = i - 1;                     // -1, 0, 1: xòe quạt
            const has = i < n;
            ctx.save();
            ctx.translate(cx + off * 10, cy + back * (this.h / 2 - 2));
            ctx.rotate(back * Math.PI / 2 - off * 0.75 * back); // mũi giáo chĩa ra sau lưng, xòe quạt
            ctx.translate(11, 0);
            if (has) drawThunderSpearShape(17, 1, (Math.floor(Date.now() / 90) + i) % 5 === 0);
            else { ctx.globalAlpha = 0.18; drawThunderSpearShape(17, 1, false); } // ô trống: bóng mờ
            ctx.restore();
        }
        // 2. Cảnh báo Lôi Minh: thân xe hóa thành tia sét (viền chớp + cung điện quanh xe)
        if ((this.thunderRaycastWarningTimer || 0) > 0) {
            const k = 1 - this.thunderRaycastWarningTimer / THUNDER_DASH_WARN;
            ctx.save();
            ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 30);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowBlur = 25; ctx.shadowColor = '#fff176';
            ctx.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            ctx.strokeStyle = '#80deea'; ctx.lineWidth = 2;
            for (let a = 0; a < 4; a++) {
                const r = this.w * (0.7 + 0.3 * k), ang = Date.now() / 80 + a * Math.PI / 2;
                ctx.beginPath(); ctx.arc(cx, cy, r, ang, ang + 0.9); ctx.stroke();
            }
            ctx.restore();
        }
        // 3. Lôi Độn: xe hóa tia sét — bóng mờ kéo dài sau lưng + thân sáng trắng
        if (this.thunderDashState) {
            const homeCy = (this.thunderDashStartY || this.y) + this.h / 2;
            const back = (this.thunderDashState === 3) ? -1 : 1;      // lúc về: vệt nằm phía trước
            const dirY = (this.id === 1 ? -1 : 1) * back;
            const tail = Math.min(Math.abs(cy - homeCy) + 10, 120);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (let j = 1; j <= 5; j++) {                        // bóng mờ kéo dài
                const yy = cy - dirY * tail * j / 5;
                ctx.globalAlpha = 0.5 - j * 0.08;
                ctx.fillStyle = j === 1 ? '#ffffff' : '#fff176';
                ctx.shadowBlur = 20; ctx.shadowColor = '#fff176';
                ctx.fillRect(cx - this.w / 2 + 3, yy - this.h / 2 + 3, this.w - 6, this.h - 6);
            }
            // Thân tia sét gấp khúc
            const ph = Math.floor(Date.now() / 40);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.shadowBlur = 24; ctx.shadowColor = '#fff176';
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) {
                const yy = cy + dirY * this.h * 0.7 - dirY * (tail + this.h) * i / 8;
                const xx = cx + (i === 0 ? 0 : ((i + ph) % 2 ? 6 : -6));
                if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
            ctx.restore();
        }
        // 4. Bóng tàn ảnh khi Lôi Trảm dịch chuyển
        if (this.thunderAfterImage) {
            const a = this.thunderAfterImage;
            ctx.save();
            ctx.globalAlpha = a.t / 14 * 0.6;
            ctx.fillStyle = '#fff59d'; ctx.shadowBlur = 16; ctx.shadowColor = '#ffeb3b';
            ctx.fillRect(a.x - this.w / 2, a.y - this.h / 2, this.w, this.h);
            ctx.restore();
        }
        // 5. Đang Lôi Trảm: điện bao quanh xe
        if (this.thunderIsSlashing) {
            ctx.save();
            ctx.strokeStyle = '#fff176'; ctx.lineWidth = 1.5; ctx.shadowBlur = 12; ctx.shadowColor = '#fff176';
            for (let a = 0; a < 3; a++) {
                const ang = Date.now() / 60 + a * 2.1;
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, ang, ang + 0.7); ctx.stroke();
            }
            ctx.restore();
        }
    },
});
