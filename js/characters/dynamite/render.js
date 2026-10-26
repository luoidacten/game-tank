// ==========================================
// Dynamite (dynamite) — Hình ảnh: xe mỏ, bó thuốc nổ, dây dẫn nổ lan, Ném Cao, khói, vàng, Kết liễu
// ==========================================

const DYN_RED = '#ff3b30', DYN_HOT = '#ff8a1f', DYN_GOLD = '#ffd34d';
function dynNowT() { return Date.now() / 1000; }

// ---------- Xe ----------
registerTankArt('dynamite', (p, k) => {
    TA.treads(11, 5, -14, 14, k.t, '#1c1917', '#57534e');
    // Thân xe mỏ (gỗ + đai thép)
    ctx.fillStyle = TA.vgrad(-11, 13, '#7c4a24', '#4a2a12'); TA.rr(-11, -8, 22, 21, 3); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.4; TA.rr(-11, -8, 22, 21, 3); ctx.stroke();
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(-11, -2, 22, 1.6); ctx.fillRect(-11, 7, 22, 1.6);
    // Bó thuốc nổ trên lưng (3/4/5 thỏi theo Evo)
    const n = k.full ? 5 : (k.evo1 ? 4 : 3);
    for (let i = 0; i < n; i++) {
        const x = -((n - 1) * 3.6) / 2 + i * 3.6;
        ctx.fillStyle = TA.metal(x - 1.6, x + 1.6, '#9f1239', '#ff4d4d'); TA.rr(x - 1.6, -6, 3.2, 12, 1); ctx.fill();
    }
    ctx.fillStyle = '#facc15'; ctx.fillRect(-((n - 1) * 3.6) / 2 - 2, -1, (n - 1) * 3.6 + 4, 1.6);
    // Cánh tay ném (nòng) + ngòi lửa
    TA.barrel(0, -8, 7, 4, '#d6d3d1', '#78716c');
    const fl = 0.6 + 0.4 * Math.sin(k.t * 30);
    TA.glow(DYN_HOT, 8); ctx.fillStyle = `rgba(255,${180 + 60 * fl | 0},60,${0.9})`;
    ctx.beginPath(); ctx.arc(0, -16, 1.6 + fl, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    // Đèn mũ thợ mỏ
    ctx.fillStyle = k.full ? DYN_GOLD : k.team; TA.glow(ctx.fillStyle, 6);
    ctx.beginPath(); ctx.arc(0, 9.5, 2, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
});

// 1 thỏi / bó thuốc nổ tại gốc toạ độ hiện tại
function dynStick(len, w, rot) {
    ctx.save(); ctx.rotate(rot || 0);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, '#7f1d1d'); g.addColorStop(0.5, '#ff4b3e'); g.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = g;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-w / 2, -len / 2, w, len, 1.5); else ctx.rect(-w / 2, -len / 2, w, len); ctx.fill();
    ctx.fillStyle = '#fde68a'; ctx.fillRect(-w / 2, -1, w, 2);
    ctx.restore();
}
function dynBundle(s, t) {
    dynStick(12 * s, 4 * s, -0.25); dynStick(12 * s, 4 * s, 0.25); dynStick(13 * s, 4 * s, 0);
    ctx.fillStyle = '#facc15'; ctx.fillRect(-6 * s, -1.2 * s, 12 * s, 2.4 * s);
    // ngòi + tia lửa
    ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -6.5 * s); ctx.quadraticCurveTo(3 * s, -9 * s, 1.5 * s, -11 * s); ctx.stroke();
    const f = 0.5 + 0.5 * Math.sin(t * 40);
    ctx.shadowColor = DYN_HOT; ctx.shadowBlur = 10; ctx.fillStyle = `rgba(255,${200 + 55 * f | 0},90,1)`;
    ctx.beginPath(); ctx.arc(1.5 * s, -11 * s, (1.4 + f) * s, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
}

// ---------- Bó nằm trên sân / dính người ----------
function dynDrawBomb(b) {
    const t = dynNowT(), left = Math.max(0, b.life - b.t), urgent = left < 90 || b.fuse >= 0;
    const pulse = urgent ? 0.5 + 0.5 * Math.sin(t * (b.fuse >= 0 ? 60 : 18)) : 0.5 + 0.5 * Math.sin(t * 4);
    ctx.save();
    // dây dẫn nổ lan tới các bó cùng phe trong tầm (vẽ 1 lần mỗi cặp)
    const p = dynTeam(b.team), R = p ? dynChainR(p) : 140;
    for (const o of bodyEffects) {
        if (!(o instanceof DynBomb) || !o.active || o.team !== b.team || o.uid <= b.uid) continue;
        const d = Math.hypot(o.x - b.x, o.y - b.y); if (d > R) continue;
        const mx = (b.x + o.x) / 2, my = (b.y + o.y) / 2 + 10 + Math.sin(b.uid + o.uid) * 6;
        ctx.strokeStyle = 'rgba(255,170,60,0.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(mx, my, o.x, o.y); ctx.stroke();
        ctx.setLineDash([]);
        // tia lửa chạy dọc dây
        const f = (t * 0.9 + (b.uid % 7) * 0.13) % 1, u = 1 - f;
        const sx = u * u * b.x + 2 * u * f * mx + f * f * o.x, sy = u * u * b.y + 2 * u * f * my + f * f * o.y;
        ctx.shadowColor = DYN_HOT; ctx.shadowBlur = 8; ctx.fillStyle = '#ffe08a';
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    // vòng cảnh báo
    ctx.strokeStyle = `rgba(255,${urgent ? 60 : 120},40,${0.35 + 0.4 * pulse})`; ctx.lineWidth = urgent ? 2 : 1.4;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = t * 12;
    ctx.beginPath(); ctx.arc(b.x, b.y, DYN_RING, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255,80,30,${0.05 + 0.07 * pulse})`;
    ctx.beginPath(); ctx.arc(b.x, b.y, DYN_RING, 0, Math.PI * 2); ctx.fill();
    // vòng đếm ngược
    ctx.strokeStyle = urgent ? '#ff3b30' : DYN_GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(b.x, b.y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (left / Math.max(1, b.life))); ctx.stroke();
    // bó thuốc nổ
    ctx.translate(b.x, b.y);
    if (b.stuck) { ctx.rotate(Math.sin(t * 9) * 0.15); }
    dynBundle(b.stuck ? 0.85 : 1, t);
    ctx.restore();
    if (b.stuck) {
        ctx.save(); ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff6b5a';
        ctx.fillText('🧨 DÍNH', b.x, b.team === 1 ? b.y + 32 : b.y - 26); ctx.restore();
    }
}

// ---------- Ném Cao (vòng cung + bóng đổ + điểm rơi) ----------
function dynDrawLob(l) {
    const t = dynNowT(), f = Math.min(1, l.t / l.dur);
    const x = l.sx + (l.tx - l.sx) * f, yG = l.sy + (l.ty - l.sy) * f;
    const h = Math.sin(f * Math.PI) * 120 * (0.6 + 0.4 * Math.abs(l.ty - l.sy) / 500);
    const sc = 1 + Math.sin(f * Math.PI) * 0.9; // "lên cao" = to hơn
    ctx.save();
    // điểm rơi
    ctx.strokeStyle = `rgba(255,90,40,${0.4 + 0.4 * f})`; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(l.tx, l.ty, 6 + 14 * (1 - f), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // bóng
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, yG, 7 * (1 - 0.4 * Math.sin(f * Math.PI)), 3, 0, 0, Math.PI * 2); ctx.fill();
    // bó đang bay (lệch sang trái của màn để thấy độ cao)
    const y = yG, dxh = -h * 0.35;
    ctx.translate(x + dxh, y - h * 0.15);
    ctx.rotate(t * 10);
    dynBundle(sc, t);
    ctx.restore();
}

// ---------- Đạn Ném Thẳng ----------
function dynDrawTapStick(b) {
    const t = dynNowT();
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    // vệt lửa ngòi
    ctx.fillStyle = 'rgba(255,140,40,0.35)';
    ctx.beginPath(); ctx.ellipse(0, -Math.sign(b.vy || 1) * 10, 3, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(t * 14);
    dynStick(14, 5, 0);
    ctx.shadowColor = DYN_HOT; ctx.shadowBlur = 8; ctx.fillStyle = '#ffe08a';
    ctx.beginPath(); ctx.arc(0, -7.5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Khói Đen ----------
function dynDrawSmoke(s) {
    const k = s.t / s.life, a = k < 0.15 ? k / 0.15 : (1 - k);
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const ang = s.seed + i * 1.05 + s.t * 0.01, rr = s.r * (0.35 + 0.15 * (i % 3));
        const x = s.x + Math.cos(ang) * rr * 0.9, y = s.y + Math.sin(ang) * rr * 0.5 - k * 10;
        ctx.fillStyle = `rgba(30,27,36,${0.45 * a})`;
        ctx.beginPath(); ctx.arc(x, y, s.r * (0.45 + 0.1 * (i % 2)) * (0.8 + 0.3 * k), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// ---------- Cục Vàng bay về chủ ----------
function dynDrawNugget(n) {
    const p = dynTeam(n.team); if (!p) return;
    const f = n.t / n.dur, e = f * f * (3 - 2 * f);
    const tx = p.x + p.w / 2, ty = p.y + p.h / 2;
    const x = n.x0 + (tx - n.x0) * e, y = n.y0 + (ty - n.y0) * e - Math.sin(f * Math.PI) * 40;
    ctx.save();
    ctx.shadowColor = DYN_GOLD; ctx.shadowBlur = 10;
    ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 5, y + 2); ctx.lineTo(x - 2, y - 4); ctx.lineTo(x + 4, y - 3); ctx.lineTo(x + 5, y + 3); ctx.lineTo(x - 1, y + 4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff7c2'; ctx.beginPath(); ctx.arc(x - 1, y - 1, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- HUD: số bó / đạn, vòng giữ Ném Cao + điểm rơi dự kiến ----------
Object.assign(CharHooks.registry.dynamite, {
    drawUI() {
        const cx = this.x + this.w / 2, up = this.id === 1;
        ctx.save();
        ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const n = dynCount(this.id), mx = dynMax(this);
        ctx.fillStyle = n >= mx ? '#94a3b8' : DYN_GOLD;
        const hx = this.x + this.w + 30 > canvas.width ? this.x - 34 : this.x + this.w + 5;
        ctx.fillText(`🧨${n}/${mx}`, hx, this.y + this.h / 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const h = this.dynHold || 0;
        if (h > 4) {
            const k = Math.min(1, h / DYN_HOLD);
            ctx.strokeStyle = k >= 1 ? DYN_RED : '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, this.y + this.h / 2, this.w * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            if (k >= 1) {
                const e = dynFoe(this);
                if (e) {
                    const ty = e.y + e.h / 2, t = dynNowT();
                    ctx.strokeStyle = 'rgba(255,90,40,0.85)'; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 20;
                    ctx.beginPath(); ctx.arc(cx, ty, DYN_RING * 0.5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(255,90,40,0.9)'; ctx.fillText('NÉM CAO ▼', cx, up ? ty + 36 : ty - 30);
                }
            }
        }
        ctx.restore();
    },
});

// ---------- Kết liễu: SẬP HẦM MỎ VÀNG ----------
function dynFR(s, i) { const x = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
function dynDrawFinisher(f) {
    const t = f.t, T = dynNowT();
    ctx.save();
    // trời tối dần
    const dark = Math.min(1, t / 30) * (t > DYNF_DUR - 25 ? (DYNF_DUR - t) / 25 : 1);
    ctx.fillStyle = `rgba(10,5,2,${0.55 * dark})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // hầm mỏ: nền đất nứt dưới mục tiêu
    if (t > 20 && t < DYNF_BIG + 40) {
        ctx.fillStyle = `rgba(120,60,20,${0.25 * dark})`;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, 80, 52, 0, 0, Math.PI * 2); ctx.fill();
    }
    // dây cháy chậm nối các bó (cháy dần từ bó 0 vòng quanh)
    const lit = t < DYNF_LIT ? 0 : Math.min(1, (t - DYNF_LIT) / (DYNF_BOOM0 - DYNF_LIT));
    if (t >= DYNF_DROP - 6 && t < DYNF_BIG) {
        ctx.lineWidth = 1.6;
        for (let i = 0; i < DYNF_N; i++) {
            const a = f.ringPos(i), b = f.ringPos((i + 1) % DYNF_N);
            ctx.strokeStyle = 'rgba(214,211,209,0.7)'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        if (lit > 0) {
            const head = lit * DYNF_N;
            ctx.strokeStyle = DYN_HOT; ctx.shadowColor = DYN_HOT; ctx.shadowBlur = 10; ctx.lineWidth = 2.4;
            for (let i = 0; i < DYNF_N && i < head; i++) {
                const a = f.ringPos(i), b = f.ringPos((i + 1) % DYNF_N), k = Math.min(1, head - i);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k); ctx.stroke();
                if (k < 1) {
                    const sx = a.x + (b.x - a.x) * k, sy = a.y + (b.y - a.y) * k;
                    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(sx, sy, 3 + Math.sin(T * 50), 0, Math.PI * 2); ctx.fill();
                    for (let j = 0; j < 4; j++) { const ang = dynFR(f.seed, t * 4 + j) * 6.28; ctx.fillRect(sx + Math.cos(ang) * 6, sy + Math.sin(ang) * 6, 1.5, 1.5); }
                }
            }
            ctx.shadowBlur = 0;
        }
    }
    // các bó rơi từ trên trời xuống thành vòng tròn
    for (let i = 0; i < DYNF_N; i++) {
        const boomAt = DYNF_BOOM0 + i * 3; if (t >= boomAt) continue;
        const land = 6 + i * (DYNF_DROP - 10) / DYNF_N, q = f.ringPos(i);
        if (t < land - 14) continue;
        const k = Math.min(1, (t - (land - 14)) / 14);
        const y = q.y - (1 - k) * (1 - k) * 220;
        ctx.save(); ctx.translate(q.x, y);
        ctx.rotate(k < 1 ? (1 - k) * 4 + i : Math.sin(T * 8 + i) * 0.08);
        dynBundle(1.1, T + i);
        ctx.restore();
        if (k >= 1 && t < land + 6) { ctx.fillStyle = 'rgba(200,140,80,0.5)'; ctx.beginPath(); ctx.ellipse(q.x, q.y + 6, 10, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    // mục tiêu bị hất tung lên trời + xoay
    if (t >= DYNF_BIG) {
        const k = (t - DYNF_BIG) / 50;
        if (k < 1.3) {
            const up = f.vid === 1 ? 1 : -1; // bay về phía giữa sân
            const yy = f.y - up * (k * 260 - k * k * 90), sc = 1 + k * 0.6;
            ctx.save(); ctx.translate(f.x + k * 30, yy); ctx.rotate(k * 9); ctx.scale(sc, sc);
            ctx.globalAlpha = Math.max(0, 1 - k / 1.3);
            ctx.fillStyle = '#1f1f1f'; ctx.fillRect(-f.vw / 2, -f.vh / 2, f.vw, f.vh);
            ctx.strokeStyle = DYN_HOT; ctx.lineWidth = 2; ctx.strokeRect(-f.vw / 2, -f.vh / 2, f.vw, f.vh);
            ctx.restore();
        }
        // cột lửa
        const ka = Math.max(0, 1 - (t - DYNF_BIG) / 30);
        if (ka > 0) {
            const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 140);
            g.addColorStop(0, `rgba(255,250,210,${ka})`); g.addColorStop(0.4, `rgba(255,140,30,${0.7 * ka})`); g.addColorStop(1, 'rgba(255,60,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 140, 0, Math.PI * 2); ctx.fill();
        }
        // mưa vàng
        for (let i = 0; i < 46; i++) {
            const s0 = DYNF_BIG + dynFR(f.seed, i) * 25; if (t < s0) continue;
            const life = (t - s0) / 60; if (life > 1.2) continue;
            const ang = dynFR(f.seed, i + 100) * Math.PI * 2, sp = 60 + dynFR(f.seed, i + 200) * 120;
            const x = f.x + Math.cos(ang) * sp * life, y = f.y + Math.sin(ang) * sp * life * 0.7 - 80 * life + 140 * life * life;
            const tw = 0.5 + 0.5 * Math.sin(T * 20 + i);
            ctx.save(); ctx.translate(x, y); ctx.rotate(T * 6 + i);
            ctx.globalAlpha = Math.max(0, 1 - life / 1.2);
            ctx.shadowColor = DYN_GOLD; ctx.shadowBlur = 8 * tw;
            ctx.fillStyle = i % 3 ? '#facc15' : '#fff3b0';
            ctx.fillRect(-2.5, -1.5 * (0.4 + tw), 5, 3 * (0.4 + tw));
            ctx.restore();
        }
    }
    // tiêu đề
    if (t > 70) {
        const a = Math.min(1, (t - 70) / 20) * (t > DYNF_DUR - 20 ? (DYNF_DUR - t) / 20 : 1);
        const sc = t < DYNF_BIG ? 1 : 1 + 0.25 * Math.max(0, 1 - (t - DYNF_BIG) / 12);
        ctx.save(); ctx.translate(Math.max(110, Math.min(canvas.width - 110, f.x)), f.y + (f.vid === 2 ? 115 : -115)); ctx.scale(sc, sc);
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 17px sans-serif';
        ctx.lineWidth = 4; ctx.strokeStyle = '#3b1a06'; ctx.strokeText('SẬP HẦM MỎ VÀNG', 0, 0);
        const g = ctx.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#facc15'); g.addColorStop(1, '#ff7a1a');
        ctx.fillStyle = g; ctx.shadowColor = DYN_HOT; ctx.shadowBlur = 16; ctx.fillText('SẬP HẦM MỎ VÀNG', 0, 0);
        ctx.shadowBlur = 0; ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = '#fde68a'; ctx.fillText('💥 BÙM! 💥', 0, 17);
        ctx.restore();
    }
    ctx.restore();
}
