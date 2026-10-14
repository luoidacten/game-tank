// ==========================================
// Kiếm Vũ (kiem_vu) — Hình ảnh: Bản Mệnh Kiếm, vệt nước, vòng gạt Lưu Thủy, thanh Tâm Định / Sát Ý
// ==========================================

// Vẽ 1 thanh kiếm: (x, y) là tâm, ang là hướng mũi kiếm
function kvDrawBlade(x, y, ang, len, wid, core, glow, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha *= alpha;
    const half = len / 2;
    const g = -half + len * 0.24; // vị trí chắn kiếm
    // Thân kiếm
    ctx.shadowBlur = 14; ctx.shadowColor = glow;
    const grad = ctx.createLinearGradient(0, -wid / 2, 0, wid / 2);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, core); grad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(g, -wid / 2);
    ctx.lineTo(half - wid * 1.6, -wid / 2);
    ctx.lineTo(half, 0);
    ctx.lineTo(half - wid * 1.6, wid / 2);
    ctx.lineTo(g, wid / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Rãnh máu (sống kiếm)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(g + 2, 0); ctx.lineTo(half - wid * 1.8, 0); ctx.stroke();
    // Chắn kiếm & chuôi
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(g - 1.5, -wid * 1.15, 3, wid * 2.3);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-half + 2, -wid * 0.32, g - (-half + 2) - 1.5, wid * 0.64);
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(-half + 2, 0, wid * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Vệt nước chảy phía sau kiếm
function kvDrawTrail(pts, color) {
    if (!pts || pts.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // Dải lụa nước thon dần: nhiều lượt vẽ, lượt sau ngắn hơn, mảnh hơn và sáng hơn
    const n = pts.length;
    const passes = [
        [1.0, 10, 'rgba(14, 165, 233, 0.16)'],
        [0.8, 6.5, 'rgba(56, 189, 248, 0.28)'],
        [0.6, 3.5, 'rgba(125, 211, 252, 0.45)'],
        [0.4, 1.6, 'rgba(240, 249, 255, 0.8)'],
    ];
    for (const [frac, lw, col] of passes) {
        const m = Math.max(2, Math.round(n * frac));
        ctx.strokeStyle = col; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < m; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
    }
    // Hai sợi nước uốn lượn quanh vệt chính
    for (const sgn of [-1, 1]) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < n - 1; i++) {
            const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
            const L = Math.hypot(dx, dy) || 1;
            const off = sgn * Math.sin(i * 0.9) * 4 * (i / n);
            const x = pts[i][0] - dy / L * off, y = pts[i][1] + dx / L * off;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

BulletHooks.registry.kiem_vu_ref.draw = function (b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ang = Math.atan2(b.vy, b.vx);
    const sp = Math.hypot(b.vx, b.vy) || 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // đuôi nước
    const tx = cx - b.vx / sp * 26, ty = cy - b.vy / sp * 26;
    const gr = ctx.createLinearGradient(cx, cy, tx, ty);
    gr.addColorStop(0, 'rgba(125, 211, 252, 0.8)'); gr.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.strokeStyle = gr; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    // trăng khuyết kiếm khí
    ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.shadowBlur = 12; ctx.shadowColor = b.isExplosive ? '#f472b6' : '#38bdf8';
    ctx.fillStyle = b.isExplosive ? 'rgba(251, 207, 232, 0.95)' : 'rgba(224, 242, 254, 0.95)';
    ctx.beginPath();
    ctx.arc(-2, 0, 9, -1.25, 1.25);
    ctx.arc(-7, 0, 9, 1.0, -1.0, true);
    ctx.closePath(); ctx.fill();
    ctx.restore();
};

Object.assign(CharHooks.registry.kiem_vu, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dirY = this.id === 1 ? -1 : 1;
        const fwd = dirY < 0 ? -Math.PI / 2 : Math.PI / 2;
        const t = this.kvTick || 0;
        const full = kvFull(this);
        ctx.save();

        // 1. Tâm Kiếm: nhát chém dọc cả cột
        if (this.kvSlashFx > 0) {
            const k = this.kvSlashFx / 30;
            const x = this.kvSlashX;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const w = 34 * k + 4;
            const gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
            gr.addColorStop(0, 'rgba(255, 56, 96, 0)');
            gr.addColorStop(0.35, `rgba(255, 56, 96, ${0.45 * k})`);
            gr.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * k})`);
            gr.addColorStop(0.65, `rgba(56, 189, 248, ${0.45 * k})`);
            gr.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = gr;
            ctx.fillRect(x - w, 0, w * 2, canvas.height);
            ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            // mảnh kiếm khí văng ngang
            for (let i = 0; i < 9; i++) {
                const yy = ((i * 97 + 31) % 100) / 100 * canvas.height;
                const len = (14 + (i * 13) % 22) * (1.6 - k);
                ctx.strokeStyle = `rgba(255, ${i % 2 ? 255 : 120}, ${i % 2 ? 255 : 150}, ${0.7 * k})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(x - len, yy + len * 0.2); ctx.lineTo(x + len, yy - len * 0.2); ctx.stroke();
            }
            ctx.restore();
        }

        // 2. Bản Mệnh Kiếm cắm trên sân địch
        if (this.kvSwState === KV_SW_PLANT) {
            const x = this.kvSwX, y = this.kvSwY;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            if (kvEvo1(this)) {
                ctx.fillStyle = `rgba(56, 189, 248, ${0.06 + 0.03 * Math.sin(t / 10)})`;
                ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.rect(x - 44, y - 40, 88, 80); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
            }
            // gợn sóng quanh điểm cắm
            for (let k = 0; k < 3; k++) {
                const ph = ((t * 0.6 + k * 10) % 30) / 30;
                ctx.strokeStyle = `rgba(125, 211, 252, ${0.5 * (1 - ph)})`; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.ellipse(x, y + dirY * 10, 6 + ph * 20, 3 + ph * 8, 0, 0, Math.PI * 2); ctx.stroke();
            }
            if (this.kvPlantFx > 0) {
                const k = this.kvPlantFx / 24;
                ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(x, y + dirY * 10, 30 * (1 - k) + 6, 12 * (1 - k) + 3, 0, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
            const sway = Math.sin(t / 18) * 0.05;
            kvDrawBlade(x, y, fwd + sway, 34, 6, KV_WATER, KV_WATER);
        }

        // 3. Vệt nước & kiếm đang bay
        if (this.kvSwState === KV_SW_FLY || this.kvSwState === KV_SW_RETURN || (this.kvTrail && this.kvTrail.length > 1)) {
            kvDrawTrail(this.kvTrail, KV_WATER);
        }
        if (this.kvSwState === KV_SW_FLY || this.kvSwState === KV_SW_RETURN) {
            kvDrawBlade(this.kvSwX, this.kvSwY, this.kvSwAng, 34, 6, full ? '#7dd3fc' : KV_WATER, KV_WATER);
            // Đang thu về & đã sang nửa sân mình: vòng sáng báo "có thể phóng lại"
            if (this.kvSwState === KV_SW_RETURN && kvSwordOnOwnHalf(this)) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.strokeStyle = `rgba(186, 230, 253, ${0.55 + 0.35 * Math.sin(t / 3)})`; ctx.lineWidth = 1.5;
                ctx.shadowBlur = 8; ctx.shadowColor = KV_WATER;
                ctx.beginPath(); ctx.arc(this.kvSwX, this.kvSwY, 14, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }
        }

        // 4. Bản Mệnh Kiếm lơ lửng trước mặt
        if (this.kvSwState === KV_SW_FLOAT) {
            const ready = this.kvSat >= 100;
            if (ready) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                const pr = 13 + 3 * Math.sin(t / 5);
                const rg = ctx.createRadialGradient(this.kvSwX, this.kvSwY, 2, this.kvSwX, this.kvSwY, pr);
                rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,56,96,0)');
                ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(this.kvSwX, this.kvSwY, pr, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
            kvDrawBlade(this.kvSwX, this.kvSwY, fwd, 30, 5.5, ready ? '#fda4af' : KV_WATER, ready ? KV_BLOOD : KV_WATER);
        }

        // 5. Kiếm Phụ (Full Evo)
        if (this.kvMinis) for (const m of this.kvMinis) kvDrawBlade(m.x, m.y, m.ang, 20, 4, '#a5f3fc', '#22d3ee', m.delay > 0 ? 0.5 : 0.95);

        // 6. Tập Trung / Kiếm Tâm
        if (this.kvFocus > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (let k = 0; k < 3; k++) {
                const ph = ((t * 1.4 + k * 9) % 27) / 27;
                ctx.strokeStyle = `rgba(125, 211, 252, ${0.55 * (1 - ph)})`; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.6 + ph * 22, 0, Math.PI * 2); ctx.stroke();
            }
            const fr = this.kvFocus / (this.kvFocusMax || 30);
            ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2.5; ctx.shadowBlur = 10; ctx.shadowColor = KV_WATER;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, fwd - Math.PI * fr, fwd + Math.PI * fr); ctx.stroke();
            ctx.restore();
        } else if (this.kvStill && this.kvTam >= 25 && !kvLowHp(this)) {
            ctx.strokeStyle = `rgba(125, 211, 252, ${0.22 + 0.14 * Math.sin(t / 9)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, 0, Math.PI * 2); ctx.stroke();
        }

        // 7. Lưu Thủy Kiếm trên tay & vòng gạt
        const side = this.kvParrySide || 1;
        const R = this.w * 0.78;
        if (this.kvParryFx > 0) {
            const p = 1 - this.kvParryFx / 14;
            const e = 1 - Math.pow(1 - Math.min(1, p * 1.6), 3);
            const a0 = fwd - side * 1.35, a1 = fwd - side * 1.35 + side * 2.7 * e;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const fade = this.kvParryFx / 14;
            for (let k = 0; k < 4; k++) {
                ctx.strokeStyle = `rgba(${k === 0 ? '255,255,255' : '125,211,252'}, ${(0.75 - k * 0.16) * fade})`;
                ctx.lineWidth = 6 - k * 1.3;
                ctx.beginPath();
                const rr = R + 4 + k * 2.2;
                if (side > 0) ctx.arc(cx, cy, rr, a0, a1); else ctx.arc(cx, cy, rr, a1, a0);
                ctx.stroke();
            }
            ctx.restore();
            kvDrawBlade(cx + Math.cos(a1) * R * 0.75, cy + Math.sin(a1) * R * 0.75, a1, 24, 4, '#e0f2fe', KV_WATER);
        } else {
            const a = fwd + 1.05 + Math.sin(t / 20) * 0.04;
            kvDrawBlade(cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7, a - 0.5, 22, 3.6, '#cbd5e1', '#7dd3fc', 0.9);
        }

        // Loạn tâm (máu < 25%)
        if (kvLowHp(this)) {
            ctx.strokeStyle = `rgba(248, 113, 113, ${0.35 + 0.25 * Math.sin(t / 4)})`;
            ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
    },

    drawUI() {
        const subUiY = (this.id === 1 ? Math.min(canvas.height - 18, this.y + this.h + 4) : Math.max(10, this.y - 15)) + 7;
        const x = this.x - 4, W = this.w + 8;
        const t = this.kvTick || 0;
        ctx.save();
        // Thanh Tâm Định
        const y1 = subUiY, y2 = subUiY + 4;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
        ctx.fillRect(x, y1, W, 3); ctx.fillRect(x, y2, W, 3);
        const tam = Math.max(0, Math.min(100, this.kvTam || 0)) / 100;
        const g1 = ctx.createLinearGradient(x, 0, x + W, 0);
        g1.addColorStop(0, '#0ea5e9'); g1.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = g1;
        ctx.globalAlpha = (this.kvTam >= 25 && !kvLowHp(this)) ? 1 : 0.55;
        ctx.shadowBlur = 6; ctx.shadowColor = KV_WATER;
        ctx.fillRect(x, y1, W * tam, 3);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        for (let k = 1; k < 4; k++) ctx.fillRect(x + W * k / 4 - 0.5, y1, 1, 3);
        // Khoá hồi Tâm Định (1.25s sau khi dùng kỹ năng / tiêu Tâm Định): vạch xám chạy ngược
        if (this.kvTamCd > 0) {
            const k = this.kvTamCd / KV_TAM_DELAY;
            ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
            ctx.fillRect(x, y1 - 2, W * k, 1);
        }
        // Thanh Sát Ý
        const sat = Math.max(0, Math.min(100, this.kvSat || 0)) / 100;
        const fullSat = sat >= 1;
        ctx.fillStyle = fullSat ? `rgba(255, ${200 + Math.round(55 * Math.sin(t / 4))}, 220, 1)` : KV_BLOOD;
        ctx.shadowBlur = fullSat ? 10 : 5; ctx.shadowColor = KV_BLOOD;
        ctx.fillRect(x, y2, W * sat, 3);
        ctx.shadowBlur = 0;
        // Chu kỳ Vạn Kiếm (Full Evo): 5 chấm
        if (kvFull(this)) {
            const n = this.kvCmdCount || 0;
            for (let i = 0; i < 5; i++) {
                ctx.fillStyle = i < n ? '#a5f3fc' : 'rgba(255,255,255,0.18)';
                ctx.beginPath(); ctx.arc(x + W + 4, y1 + 0.5 + (i - 2) * 3.2 + 3, 1.2, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    },
});
