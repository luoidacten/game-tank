// ==========================================
// T-Zero (t_zero) — Hình ảnh: mech thép neon, khiên boomerang, tâm ngắm Thiên Luật,
// thanh Năng Lượng, đèn chỉ báo 3 Thiết Luật, nút Bắn đổi màu theo chế độ
// ==========================================

// Trạng thái DOM cục bộ (không nằm trên player -> không bị đồng bộ online)
const tzBtnState = {};

function tzLocalShootButton(p) {
    if (typeof document === 'undefined') return null;
    const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
    const isMyTank = !isOnline || (onlineManager.role === 'host' ? p.id === 1 : p.id === 2);
    if (!isMyTank) return null;
    if (!isOnline && p.id === 2 && typeof botAI !== 'undefined' && botAI.enabled) return null;
    const sel = (p.id === 1 || isOnline) ? '#p1-controls .btn-shoot' : '#p2-controls .btn-shoot';
    return { el: document.querySelector(sel), key: sel };
}

function tzTintShootButton(p) {
    const r = tzLocalShootButton(p);
    if (!r || !r.el) return;
    const col = TZ_MODE_COLOR[p.tzMode] || '#22d3ee';
    const cool = !p.tzFly && p.tzMode === 'thien' && (p.tzFlyCd || 0) > 0;
    const want = p.tzFly ? '#facc15|fly' : (cool ? col + '|cd' : col);
    if (tzBtnState[r.key] === want) return;
    tzBtnState[r.key] = want;
    const c2 = cool ? '#64748b' : col;
    r.el.style.borderColor = c2;
    r.el.style.boxShadow = cool ? 'none' : `0 0 14px ${col}, inset 0 0 12px ${col}88`;
    r.el.style.outline = p.tzFly ? `2px dashed ${col}` : '';
}

function tzResetShootButton() {
    if (typeof document === 'undefined') return;
    for (const key of Object.keys(tzBtnState)) {
        const el = document.querySelector(key);
        if (el) { el.style.borderColor = ''; el.style.boxShadow = ''; el.style.outline = ''; }
        delete tzBtnState[key];
    }
}

// Vẽ thân mech tại (cx, cy); hệ trục cục bộ: phía trước = -y (P2 lật trục y)
function tzDrawMech(p, cx, cy, scale, opts = {}) {
    const mode = opts.mode || p.tzMode || 'thu';
    const acc = TZ_MODE_COLOR[mode];
    const t = Date.now() / 1000;
    const s = (p.w / 34) * scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s * (p.id === 1 ? 1 : -1));
    ctx.lineJoin = 'round';

    // Bệ khung (che hitbox gốc) & nòng ngực (che nòng mặc định)
    if (!opts.noPlate) {
        ctx.fillStyle = 'rgba(8, 13, 28, 0.92)';
        ctx.strokeStyle = p.id === 1 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(251, 113, 133, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-17.5, -17.5, 35, 35, 5); else ctx.rect(-17.5, -17.5, 35, 35);
        ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#334155'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
    ctx.fillRect(-5, -34, 10, 20); ctx.strokeRect(-5, -34, 10, 20);
    ctx.fillStyle = acc; ctx.shadowBlur = 8; ctx.shadowColor = acc;
    ctx.fillRect(-3, -35, 6, 3); ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-1.5, -30, 3, 12);

    // Lửa đẩy phía sau (Công: luôn bật, Thiên: lớn)
    if (mode === 'cong' || mode === 'thien' || opts.thrust) {
        const big = mode === 'thien' || opts.thrust;
        const fl = (big ? 14 : 8) + Math.sin(t * 40) * 3;
        for (const sx of [-8, 8]) {
            const g = ctx.createLinearGradient(0, 14, 0, 14 + fl);
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, acc); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(sx - 3, 14); ctx.lineTo(sx + 3, 14); ctx.lineTo(sx, 14 + fl); ctx.closePath(); ctx.fill();
        }
    }

    // Cánh (Thiên Luật)
    if (mode === 'thien') {
        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = acc; ctx.lineWidth = 1.4;
        for (const sd of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(sd * 14, -6); ctx.lineTo(sd * 30, 4); ctx.lineTo(sd * 27, 10); ctx.lineTo(sd * 14, 6);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sd * 17, 0); ctx.lineTo(sd * 26, 6); ctx.stroke();
        }
    }

    // Xích / chân
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(-17, 2, 7, 15); ctx.fillRect(10, 2, 7, 15);
    ctx.fillStyle = '#475569';
    const tread = Math.floor(t * 12) % 3;
    for (let i = 0; i < 4; i++) { ctx.fillRect(-16, 3 + i * 4 + tread, 5, 1.5); ctx.fillRect(11, 3 + i * 4 + tread, 5, 1.5); }

    // Vai giáp
    const steel = ctx.createLinearGradient(-17, -12, 17, 6);
    steel.addColorStop(0, '#94a3b8'); steel.addColorStop(0.5, '#475569'); steel.addColorStop(1, '#1e293b');
    ctx.fillStyle = steel; ctx.strokeStyle = acc; ctx.lineWidth = 1.2;
    for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sd * 9, -12); ctx.lineTo(sd * 17, -9); ctx.lineTo(sd * 17, 3); ctx.lineTo(sd * 9, 5);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = acc; ctx.globalAlpha = 0.85;
        ctx.fillRect(sd > 0 ? 12 : -15, -6, 3, 1.5); ctx.fillRect(sd > 0 ? 12 : -15, -3, 3, 1.5);
        ctx.globalAlpha = 1; ctx.fillStyle = steel;
    }

    // Thân
    const body = ctx.createLinearGradient(0, -13, 0, 14);
    body.addColorStop(0, '#334155'); body.addColorStop(1, '#0f172a');
    ctx.fillStyle = body; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, -11); ctx.lineTo(9, -11); ctx.lineTo(11, 8); ctx.lineTo(6, 14); ctx.lineTo(-6, 14); ctx.lineTo(-11, 8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Đường mạch neon
    ctx.strokeStyle = acc; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(-7, 9); ctx.lineTo(-3, 6); ctx.lineTo(3, 6); ctx.lineTo(7, 9); ctx.stroke();
    ctx.globalAlpha = 1;

    // Lò phản ứng
    const pulse = 0.6 + 0.4 * Math.sin(t * 6);
    ctx.shadowBlur = 12 * pulse; ctx.shadowColor = acc;
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Đầu & kính chắn
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, -11); ctx.lineTo(-4, -17); ctx.lineTo(4, -17); ctx.lineTo(6, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 8; ctx.shadowColor = acc; ctx.strokeStyle = acc; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-3.5, -14); ctx.lineTo(3.5, -14); ctx.stroke();
    ctx.shadowBlur = 0;

    // Vũ trang phía trước theo chế độ
    if (mode === 'thu') {
        if (opts.shieldInHand) {
            const glow = (p.tzReflectFlash || 0) > 0 ? 18 : 8;
            ctx.shadowBlur = glow; ctx.shadowColor = '#22d3ee';
            ctx.fillStyle = 'rgba(34, 211, 238, 0.28)'; ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(-13, -19); ctx.lineTo(-8, -24); ctx.lineTo(8, -24); ctx.lineTo(13, -19); ctx.lineTo(8, -17); ctx.lineTo(-8, -17);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#e0f7ff'; ctx.fillRect(-1, -23, 2, 5);
        } else {
            // Khiên đang bay: lộ tiểu liên / tay trống
            ctx.fillStyle = '#64748b'; ctx.fillRect(-2, -22, 4, 6);
            if (opts.smg) {
                ctx.fillStyle = '#fde68a'; ctx.globalAlpha = 0.5 + 0.5 * Math.random();
                ctx.beginPath(); ctx.arc(0, -24, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
            }
        }
    } else if (mode === 'cong') {
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff4d6d';
        for (const sd of [-1, 1]) {
            ctx.fillStyle = '#7f1d1d'; ctx.strokeStyle = '#ff8fa3'; ctx.lineWidth = 1.2;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(sd * 12 - 5, -22, 10, 11, 2); else ctx.rect(sd * 12 - 5, -22, 10, 11);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ffccd5';
            for (let k = 0; k < 3; k++) ctx.fillRect(sd * 12 - 4 + k * 3, -23, 2, 2);
        }
        ctx.shadowBlur = 0;
    } else {
        // Thiên: nòng pháo kép trên vai
        ctx.fillStyle = '#334155'; ctx.strokeStyle = acc; ctx.lineWidth = 1;
        for (const sd of [-1, 1]) { ctx.fillRect(sd * 13 - 2, -18, 4, 8); ctx.strokeRect(sd * 13 - 2, -18, 4, 8); }
    }
    ctx.restore();
}

Object.assign(CharHooks.registry.t_zero, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dir = this.id === 1 ? -1 : 1;
        const t = Date.now() / 1000;
        const f = this.tzFly;

        // Vệt lao (Công)
        if (this.tzDash) {
            ctx.save();
            const g = ctx.createLinearGradient(cx, cy, cx, cy - dir * 70);
            g.addColorStop(0, 'rgba(255, 77, 109, 0.55)'); g.addColorStop(1, 'rgba(255, 77, 109, 0)');
            ctx.fillStyle = g;
            ctx.fillRect(this.x + 4, dir < 0 ? cy : cy - 70, this.w - 8, 70);
            ctx.restore();
        }
        // Sóng xung kích Evo 2
        if (this.tzWave > 0) {
            ctx.save();
            const k = 1 - this.tzWave / 18;
            ctx.strokeStyle = `rgba(255, 140, 80, ${1 - k})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(cx, (dir < 0 ? this.y : this.y + this.h) + dir * 30, 20 + 50 * k, 8 + 18 * k, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }

        if (f) {
            // Bệ phóng tại làn (che hitbox gốc)
            ctx.save();
            ctx.fillStyle = '#0b1220';
            ctx.fillRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t; const r = this.w * 0.42; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'; ctx.fill();
            ctx.restore();

            // Tâm ngắm Thiên Luật trên làn địch
            const R = tzSlamRadius(this);
            const lockK = (f.phase === 'lock' || f.phase === 'dive') ? Math.min(1, (f.lock || 0) / TZ_LOCK_TICKS) : -1;
            if (lockK >= 0) {
                // LUẬT 11: đã khóa — đỏ đặc, vòng trong co dần tới lúc đáp
                ctx.save();
                const bl = 0.5 + 0.5 * Math.sin(t * 30);
                ctx.shadowBlur = 16; ctx.shadowColor = '#ff2d2d';
                ctx.fillStyle = `rgba(255, 30, 30, ${0.18 + 0.14 * lockK + 0.06 * bl})`;
                ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.ellipse(f.cx, f.cy, R, R * 0.75, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#ffe4e4'; ctx.lineWidth = 2.5;
                const q = Math.max(0.02, 1 - lockK);
                ctx.beginPath(); ctx.ellipse(f.cx, f.cy, R * q, R * 0.75 * q, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.lineWidth = 2; ctx.strokeStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.moveTo(f.cx - R - 8, f.cy); ctx.lineTo(f.cx + R + 8, f.cy);
                ctx.moveTo(f.cx, f.cy - R * 0.75 - 6); ctx.lineTo(f.cx, f.cy + R * 0.75 + 6);
                ctx.stroke();
                ctx.restore();
            }
            ctx.save();
            if (lockK >= 0) ctx.globalAlpha = 0;
            const pul = 0.5 + 0.5 * Math.sin(t * 8);
            ctx.strokeStyle = `rgba(250, 204, 21, ${0.55 + 0.4 * pul})`; ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
            ctx.setLineDash([8, 5]); ctx.lineDashOffset = -t * 30;
            ctx.beginPath(); ctx.ellipse(f.cx, f.cy, R, R * 0.75, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(f.cx, f.cy, R * 0.45, R * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(f.cx - R - 8, f.cy); ctx.lineTo(f.cx - R * 0.55, f.cy);
            ctx.moveTo(f.cx + R * 0.55, f.cy); ctx.lineTo(f.cx + R + 8, f.cy);
            ctx.moveTo(f.cx, f.cy - R * 0.75 - 6); ctx.lineTo(f.cx, f.cy - R * 0.4);
            ctx.moveTo(f.cx, f.cy + R * 0.4); ctx.lineTo(f.cx, f.cy + R * 0.75 + 6);
            ctx.stroke();
            ctx.restore();

            // Vị trí mech đang bay
            const hoverY = cy + dir * 90;
            let mx = cx, my = cy, sc = 1, thrust = true;
            if (f.phase === 'up') { const k = Math.min(1, f.anim / 16); mx = cx + (f.cx - cx) * k * 0.6; my = cy + (hoverY - cy) * k; sc = 1 + 0.3 * k; }
            else if (f.phase === 'air' || f.phase === 'lock') { mx = cx + (f.cx - cx) * 0.6; my = hoverY + Math.sin(t * 3) * 4; sc = 1.3; }
            else if (f.phase === 'dive') { const k = Math.min(1, f.anim / 12); const sx = cx + (f.cx - cx) * 0.6; mx = sx + (f.cx - sx) * k; my = hoverY + (f.cy - hoverY) * k * k; sc = 1.3 - 0.2 * k; }
            else { const k = Math.min(1, f.anim / 14); mx = f.cx + (cx - f.cx) * k; my = f.cy + (cy - f.cy) * k; sc = 1.1 - 0.1 * k; }
            // Chùm sáng radar xuống tâm ngắm
            if (f.phase === 'air' || f.phase === 'lock') {
                ctx.save();
                ctx.strokeStyle = f.phase === 'lock' ? 'rgba(255, 60, 60, 0.75)' : 'rgba(250, 204, 21, 0.35)';
                ctx.lineWidth = f.phase === 'lock' ? 2 : 1; ctx.setLineDash([3, 6]);
                ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(f.cx, f.cy); ctx.stroke();
                ctx.restore();
            }
            // Bóng đổ dưới mech
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath(); ctx.ellipse(mx, my + 22 * sc * (dir < 0 ? 1 : -1) * 0.2 + 6, 14 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            tzDrawMech(this, mx, my, sc, { mode: 'thien', thrust, noPlate: true });
        } else {
            tzDrawMech(this, cx, cy, 1, { shieldInHand: !this.tzShield, smg: this.tzSmgOn });
        }

        // Vòng khiên từ trường (Thủ, khiên trên tay)
        if (!f && tzCanReflect(this)) {
            const can = this.tzEnergy >= tzCost(this, 'reflect', 1);
            ctx.save();
            ctx.strokeStyle = can ? `rgba(103, 232, 249, ${0.25 + 0.15 * Math.sin(t * 5) + (this.tzReflectFlash > 0 ? 0.5 : 0)})` : 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = this.tzReflectFlash > 0 ? 3 : 1.4;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.78, Math.PI + 0.5, Math.PI * 2 - 0.5, dir > 0); ctx.stroke();
            ctx.restore();
        }

        // Khiên Boomerang đang bay
        const s = this.tzShield;
        if (s) {
            const sx = s.x + s.w / 2, sy = s.y + s.h / 2;
            ctx.save();
            if (s.ret) {
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)'; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
            }
            ctx.translate(sx, sy);
            ctx.rotate(s.spin);
            ctx.shadowBlur = 14; ctx.shadowColor = '#22d3ee';
            const hw = s.w / 2, hh = s.w / 2.6;
            ctx.fillStyle = 'rgba(14, 116, 144, 0.75)'; ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * hw, Math.sin(a) * hh); }
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ecfeff';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        tzTintShootButton(this);
    },

    drawUI() {
        const isP1 = this.id === 1;
        const uiY = isP1 ? Math.min(canvas.height - 18, this.y + this.h + 4) : Math.max(10, this.y - 15);
        const y = uiY + 7;
        const x0 = this.x - 4, W = this.w + 8;
        const acc = TZ_MODE_COLOR[this.tzMode] || '#22d3ee';
        const e = Math.max(0, Math.min(100, this.tzEnergy || 0));
        ctx.save();
        // Thanh Năng Lượng
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'; ctx.fillRect(x0, y, W, 4);
        ctx.fillStyle = (this.tzRegenLock > 0) ? acc : '#e2e8f0';
        ctx.globalAlpha = this.tzRegenLock > 0 ? 0.9 : 0.75 + 0.25 * Math.sin(Date.now() / 120);
        ctx.shadowBlur = 6; ctx.shadowColor = acc;
        ctx.fillRect(x0, y, W * e / 100, 4);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        // Vạch 10%
        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        for (let i = 1; i < 10; i++) ctx.fillRect(x0 + W * i / 10 - 0.5, y, 1, 4);
        // Vạch chi phí đòn hiện tại
        const costKey = this.tzFly ? null : (this.tzMode === 'thu' ? 'shield' : (this.tzMode === 'cong' ? 'punch' : 'fly'));
        if (costKey) {
            const c = tzCost(this, costKey);
            ctx.fillStyle = e >= c ? '#ffffff' : '#ef4444';
            ctx.fillRect(x0 + W * Math.min(1, c / 100) - 1, y - 1, 2, 6);
        }

        // Đèn chỉ báo 3 Thiết Luật (bên trái xe, xếp dọc)
        const px = this.x - 8;
        for (let i = 0; i < 3; i++) {
            const m = TZ_MODES[i];
            const on = m === this.tzMode;
            const py = this.y + this.h / 2 + (i - 1) * 9 * (isP1 ? 1 : -1);
            ctx.fillStyle = on ? TZ_MODE_COLOR[m] : 'rgba(100, 116, 139, 0.45)';
            ctx.shadowBlur = on ? 8 : 0; ctx.shadowColor = TZ_MODE_COLOR[m];
            ctx.beginPath(); ctx.moveTo(px, py - 3.5); ctx.lineTo(px + 3.5, py); ctx.lineTo(px, py + 3.5); ctx.lineTo(px - 3.5, py); ctx.closePath(); ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Hồi chiêu cất cánh (2.5s sau khi đáp): vòng quay quanh đèn THIÊN + số giây
        if (!this.tzFly && (this.tzFlyCd || 0) > 0) {
            const k = this.tzFlyCd / TZ_FLY_CD;
            const py = this.y + this.h / 2 + 9 * (isP1 ? 1 : -1);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#facc15'; ctx.shadowBlur = 6; ctx.shadowColor = '#facc15';
            ctx.beginPath(); ctx.arc(px, py, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke();
            ctx.shadowBlur = 0;
            if (this.tzMode === 'thien') {
                ctx.fillStyle = '#fde68a'; ctx.font = "bold 8px 'Orbitron', Arial"; ctx.textAlign = 'right';
                drawWorldText(ctx, `✈${(this.tzFlyCd / 60).toFixed(1)}s`, px - 8, py + 3);
                // Phủ xám thanh NL ở vạch chi phí: chưa cất cánh được
                ctx.fillStyle = 'rgba(15, 23, 42, 0.55)'; ctx.fillRect(x0, y - 1, W * k, 6);
            }
        }
        // Đang bay: hiện mức tiêu hao NL/s (tăng dần theo thời gian bay)
        if (this.tzFly && (this.tzFly.phase === 'air' || this.tzFly.phase === 'up')) {
            const d = tzFlyDrainPerSec(this);
            ctx.fillStyle = d > 25 ? '#ff4d4d' : '#fde68a'; ctx.font = "bold 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
            drawWorldText(ctx, `-${Math.round(d)}%/s`, this.x + this.w / 2, isP1 ? this.y - 6 : this.y + this.h + 14);
        }

        // Vòng giữ nút đổi chế độ
        if (!this.tzFly && this.tzHold > 3 && this.tzHold < TZ_HOLD_TICKS) {
            const next = TZ_MODES[(TZ_MODES.indexOf(this.tzMode) + 1) % 3];
            ctx.strokeStyle = TZ_MODE_COLOR[next]; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.tzHold / TZ_HOLD_TICKS); ctx.stroke();
        }
        // Nhãn chế độ khi vừa đổi
        if (this.tzModeFlash > 0) {
            ctx.globalAlpha = Math.min(1, this.tzModeFlash / 10);
            ctx.fillStyle = acc; ctx.font = "bold 9px 'Orbitron', Arial"; ctx.textAlign = 'center';
            drawWorldText(ctx, TZ_MODE_NAME[this.tzMode], this.x + this.w / 2, isP1 ? this.y - 26 : this.y + this.h + 32);
        }
        ctx.restore();
    },
});

// Vẽ đạn riêng
BulletHooks.registry.tz_reflect.draw = function (b) {
    ctx.save();
    ctx.shadowBlur = 12; ctx.shadowColor = '#22d3ee';
    ctx.fillStyle = '#a5f3fc';
    ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(b.x + b.w / 2, b.y + b.h / 2); ctx.lineTo(b.x + b.w / 2 - b.vx * 2.5, b.y + b.h / 2 - b.vy * 2.5); ctx.stroke();
    ctx.restore();
};
BulletHooks.registry.tz_missile.draw = function (b) {
    const a = Math.atan2(b.vy, b.vx);
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(a);
    const fl = 6 + Math.random() * 4;
    ctx.fillStyle = 'rgba(255, 140, 40, 0.85)';
    ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-5 - fl, 0); ctx.lineTo(-5, 2); ctx.fill();
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-5, -2, 9, 4);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(7, 0); ctx.lineTo(4, 2); ctx.fill();
    ctx.restore();
};
BulletHooks.registry.tz_smg.draw = function (b) {
    ctx.save();
    ctx.fillStyle = '#fde68a'; ctx.shadowBlur = 6; ctx.shadowColor = '#f59e0b';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.restore();
};
