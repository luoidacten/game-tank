// ==========================================
// Cơ Bản — dạng MAIN: đồ hoạ Evo 3/4 + Evo MAIN (Hào Quang, Ký Ức Thứ Hai, Lửa Chưa Tàn, Đạn Hợp Nhất)
// Chỉ đọc trạng thái (an toàn online). Hạt / phát sáng giảm theo Quality (js/core/quality.js).
// ==========================================
const MAIN_TAU = Math.PI * 2;
function mainQ() { return typeof Quality !== 'undefined' ? Quality.particleMult : 1; }
function mainRand(i) { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

// Lưỡi lửa (toạ độ hiện tại, a = góc, bắt đầu cách tâm r0)
function mainFlameTongue(a, r0, len, w, c0, c1) {
    ctx.save(); ctx.rotate(a);
    const g = ctx.createLinearGradient(0, -r0, 0, -r0 - len);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-w, -r0); ctx.quadraticCurveTo(-w * 0.3, -r0 - len * 0.6, 0, -r0 - len);
    ctx.quadraticCurveTo(w * 0.3, -r0 - len * 0.6, w, -r0); ctx.closePath(); ctx.fill();
    ctx.restore();
}

// ---------- Lớp nền dưới thân xe (lưới 32×32, -y = mũi xe) ----------
function mainArtBehind(p, k) {
    const t = k.t, ult = p.mainUltT > 0, hasA = mainHasEvo(p, 'a'), aura = hasA ? (p.mainAura || 0) : 0, charged = hasA && !!p.mainAuraCharged;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // Ánh đèn sân khấu (Hào Quang đầy / Lửa Chưa Tàn): vũng sáng + tia sáng xoay chậm
    if (charged || ult) {
        const R = ult ? 40 : 34;
        const g = ctx.createRadialGradient(0, 0, 4, 0, 0, R);
        g.addColorStop(0, ult ? 'rgba(255,190,90,0.55)' : 'rgba(255,248,215,0.55)');
        g.addColorStop(0.5, ult ? 'rgba(255,90,10,0.25)' : 'rgba(255,214,110,0.22)');
        g.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, MAIN_TAU); ctx.fill();
        ctx.save(); ctx.rotate(t * (ult ? 0.9 : 0.4));
        const n = 10;
        ctx.fillStyle = ult ? 'rgba(255,150,40,0.20)' : 'rgba(255,236,170,0.18)';
        for (let i = 0; i < n; i++) {
            ctx.rotate(MAIN_TAU / n);
            ctx.beginPath(); ctx.moveTo(-1.6, -14); ctx.lineTo(0, -R - 6 - 4 * Math.sin(t * 3 + i)); ctx.lineTo(1.6, -14); ctx.fill();
        }
        ctx.restore();
    }
    // Lửa Chưa Tàn: vương miện lửa lớn bùng quanh xe
    if (ult) {
        const n = 14, fr = p.mainUltT < 60 ? 0.6 + 0.4 * (p.mainUltT / 60) : 1;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * MAIN_TAU + Math.sin(t * 2.4 + i) * 0.12;
            const len = (10 + 9 * (0.5 + 0.5 * Math.sin(t * 11 + i * 2.3))) * fr;
            mainFlameTongue(a, 15, len, 3.6, i % 2 ? 'rgba(255,230,150,0.95)' : 'rgba(255,140,30,0.95)', 'rgba(255,40,0,0)');
        }
    }
    // Vòng Hào Quang (có Evo MAIN α): vành sáng + hạt sáng theo số tầng
    if (hasA) {
        const pulse = p.mainAuraFx > 0 ? p.mainAuraFx / 30 : 0;
        ctx.strokeStyle = `rgba(255,214,110,${Math.min(1, 0.22 + aura * 0.1 + pulse * 0.3)})`;
        ctx.lineWidth = 1.2 + aura * 0.25;
        ctx.beginPath(); ctx.arc(0, 0, 21 + pulse * 3, 0, MAIN_TAU); ctx.stroke();
        for (let i = 0; i < aura; i++) {
            const a = t * 2.2 + (i / MAIN_EVO.auraMax) * MAIN_TAU;
            const x = Math.cos(a) * 21, y = Math.sin(a) * 21;
            const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
            g.addColorStop(0, 'rgba(255,220,120,0.6)'); g.addColorStop(1, 'rgba(255,160,40,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, MAIN_TAU); ctx.fill();
            ctx.fillStyle = 'rgba(255,244,200,0.95)';
            ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 2, y); ctx.lineTo(x, y + 3); ctx.lineTo(x - 2, y); ctx.closePath(); ctx.fill();
        }
    }
    ctx.restore();
}
window.addEventListener('load', () => {
    if (typeof TANK_ART === 'undefined' || !TANK_ART.basic) return;
    const base = TANK_ART.basic;
    TANK_ART.basic = function (p, k) {
        if (FEATURE_EVO34 && evoIsMainBasic(p)) { try { mainArtBehind(p, k); } catch (e) { /* bỏ qua lỗi vẽ */ } }
        return base(p, k);
    };
});

// ---------- Lớp phủ trên xe (toạ độ sân) ----------
CharHooks.registry.basic.draw = function () {
    if (!FEATURE_EVO34 || !evoIsMainBasic(this) || this.hp <= 0) return;
    const p = this, cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = Date.now() / 1000, fwd = p.id === 1 ? -1 : 1;
    ctx.save();
    // Dư ảnh lướt (Bước Chân Chính Diện)
    if (p.mainDashFx > 0) {
        const a = p.mainDashFx / 16, d = p.mainDashFxDir || 1;
        ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.2;
        for (let i = 1; i <= 3; i++) {
            const f = a * (1 - i / 4), x = p.x - d * i * 12;
            ctx.fillStyle = `rgba(255,200,90,${0.22 * f})`; ctx.strokeStyle = `rgba(255,230,160,${0.55 * f})`;
            ctx.beginPath(); ctx.rect(x + 3, p.y + 3, p.w - 6, p.h - 6); ctx.fill(); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    // Né sát: vết lóe vàng tại chỗ đạn lướt qua
    if (p.mainGrazeFx > 0) {
        const a = p.mainGrazeFx / 24, r = 6 + (24 - p.mainGrazeFx) * 1.2;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,236,170,${a})`; ctx.lineWidth = 2 * a + 0.5;
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffb020';
        ctx.beginPath(); ctx.arc(p.mainGrazeX, p.mainGrazeY, r, 0, MAIN_TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.mainGrazeX - r * 1.4, p.mainGrazeY); ctx.lineTo(p.mainGrazeX + r * 1.4, p.mainGrazeY); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    }
    // Hào Quang đầy: ngôi sao "nhân vật chính" lơ lửng trước mũi xe
    if (p.mainAuraCharged && mainHasEvo(p, 'a')) {
        const sy = cy + fwd * (p.h * 0.5 + 14) + Math.sin(t * 4) * 2;
        ctx.save(); ctx.translate(cx, sy); ctx.rotate(t * 1.5);
        ctx.shadowBlur = 14; ctx.shadowColor = '#ffd56a'; ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.8 : 7, a = i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
    }
    // Lửa Chưa Tàn: vòng thời gian còn lại + tàn lửa bay
    if (p.mainUltT > 0 && p.mainUltMax > 0) {
        const f = p.mainUltT / p.mainUltMax, R = p.w * 0.95;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(60,10,0,0.55)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, MAIN_TAU); ctx.stroke();
        ctx.strokeStyle = '#ffb020'; ctx.lineWidth = 2.6; ctx.shadowBlur = 10; ctx.shadowColor = '#ff5a00';
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + MAIN_TAU * f); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'lighter';
        const n = Math.max(4, Math.round(14 * mainQ()));
        for (let i = 0; i < n; i++) {
            const ph = (t * 0.7 + mainRand(i)) % 1, ang = mainRand(i + 40) * MAIN_TAU;
            const rr = p.w * 0.5 + ph * 46, x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * 0.8 - fwd * ph * 14;
            ctx.fillStyle = `rgba(255,${150 + Math.round(90 * (1 - ph))},40,${(1 - ph) * 0.9})`;
            ctx.beginPath(); ctx.arc(x, y, 1.8 * (1 - ph) + 0.6, 0, MAIN_TAU); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    // Ký Ức Thứ Hai sẵn sàng: viền tím "ký ức" lệch nhịp quanh xe
    if (p.mainMemReady && mainHasEvo(p, 'b')) {
        const o = Math.sin(t * 2) * 4;
        ctx.strokeStyle = `rgba(196,181,253,${0.35 + 0.2 * Math.sin(t * 3)})`; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.rect(p.x - 3 + o, p.y - 3, p.w + 6, p.h + 6); ctx.stroke(); ctx.setLineDash([]);
    }
    // Skill: vòng tụ ở đầu nòng
    if (p.mainSkillFx > 0) {
        const a = p.mainSkillFx / 22, my = p.id === 1 ? p.y - 4 : p.y + p.h + 4;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,220,130,${a})`; ctx.lineWidth = 3 * a;
        ctx.beginPath(); ctx.arc(cx, my, 8 + (1 - a) * 26, 0, MAIN_TAU); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
};

// ---------- HUD: tầng Hào Quang, Mảnh Ký Ức ----------
(function () {
    const ui = CharHooks.registry.basic.drawUI;
    CharHooks.registry.basic.drawUI = function () {
        ui.call(this);
        if (!FEATURE_EVO34 || !evoIsMainBasic(this) || typeof hudFrame !== 'function') return;
        const F = hudFrame(this), lx = this.w / 2 + 6;
        const pip = (x, y, on, col) => {
            ctx.fillStyle = on ? col : 'rgba(120,110,90,0.45)';
            ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 2.2, y); ctx.lineTo(x, y + 3); ctx.lineTo(x - 2.2, y); ctx.closePath(); ctx.fill();
        };
        ctx.save();
        let row = -this.h / 2 + 15;
        if (mainHasEvo(this, 'a')) {
            for (let i = 0; i < MAIN_EVO.auraMax; i++) pip(F.X(lx + 3 + i * 6), F.Y(row), i < (this.mainAura || 0), this.mainAuraCharged ? '#fff3c4' : MAIN_UI_GOLD);
            row += 9;
        }
        if (mainHasEvo(this, 'b') && this.mainAwakened && !this.mainMemUsed) {
            for (let i = 0; i < MAIN_EVO.memNeed; i++) pip(F.X(lx + 3 + i * 6), F.Y(row), this.mainMemReady || i < (this.mainMemShards || 0), '#c4b5fd');
            if (this.mainMemReady) { ctx.font = 'bold 8px Arial'; ctx.fillStyle = '#c4b5fd'; hudText(F, 'KÝ ỨC', lx + 16, row, 'left'); }
        }
        ctx.restore();
    };
})();

// ---------- Đạn Hợp Nhất (Skill) ----------
function mainDrawFusion(b) {
    const r = b.w / 2, x = b.x + r, y = b.y + b.h / 2, t = Date.now() / 1000, back = b.vy > 0 ? -1 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // Đuôi lửa
    const L = r * 3.2;
    const g = ctx.createLinearGradient(x, y, x, y + back * L);
    g.addColorStop(0, 'rgba(255,170,50,0.75)'); g.addColorStop(1, 'rgba(255,40,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - r * 0.95, y); ctx.quadraticCurveTo(x - r * 0.4, y + back * L * 0.6, x, y + back * L);
    ctx.quadraticCurveTo(x + r * 0.4, y + back * L * 0.6, x + r * 0.95, y); ctx.closePath(); ctx.fill();
    // Quầng
    const h = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2);
    h.addColorStop(0, 'rgba(255,220,120,0.55)'); h.addColorStop(1, 'rgba(255,90,0,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, r * 2, 0, MAIN_TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // Lõi
    const c = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 1, x, y, r);
    c.addColorStop(0, '#ffffff'); c.addColorStop(0.35, '#fff1b8'); c.addColorStop(0.75, '#ffb020'); c.addColorStop(1, '#d9480f');
    ctx.fillStyle = c; ctx.shadowBlur = 18; ctx.shadowColor = '#ff8a00';
    ctx.beginPath(); ctx.arc(x, y, r, 0, MAIN_TAU); ctx.fill(); ctx.shadowBlur = 0;
    // Vành xoay 3 cung
    ctx.strokeStyle = 'rgba(255,250,220,0.9)'; ctx.lineWidth = Math.max(1.2, r * 0.12);
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * MAIN_TAU / 3; ctx.beginPath(); ctx.arc(x, y, r * 1.25, a, a + 0.9); ctx.stroke(); }
    // Chữ V (mũi chỉ về phía địch)
    mainDrawV(x, y, r * 0.5, back, 'rgba(170,55,0,0.5)');
    ctx.restore();
}
// Chữ V nhân vật chính (như trên thân xe MAIN), s = hướng mũi V (+1 xuống, -1 lên) — mũi quay về phía người bắn
function mainDrawV(x, y, v, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - v, y - s * v * 0.5); ctx.lineTo(x - v * 0.55, y - s * v * 0.5); ctx.lineTo(x, y + s * v * 0.2);
    ctx.lineTo(x + v * 0.55, y - s * v * 0.5); ctx.lineTo(x + v, y - s * v * 0.5); ctx.lineTo(x, y + s * v * 0.65); ctx.closePath(); ctx.fill();
}

// ---------- Khoảnh khắc tung LỬA CHƯA TÀN ----------
function mainDrawUltFx(f) {
    const t = f.t, W = canvas.width, H = canvas.height, owner = f.side === 1 ? p1 : p2;
    const x = owner ? owner.x + owner.w / 2 : f.x, y = owner ? owner.y + owner.h / 2 : f.y, fwd = f.side === 1 ? -1 : 1;
    const inA = Math.min(1, t / 8), outA = t > f.dur - 14 ? (f.dur - t) / 14 : 1, A = inA * outA;
    ctx.save();
    // Tối màn ấm (giữ sáng quanh xe)
    const v = ctx.createRadialGradient(x, y, 40, x, y, Math.max(W, H) * 0.8);
    v.addColorStop(0, 'rgba(40,10,0,0)'); v.addColorStop(1, `rgba(30,6,0,${0.55 * A})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    // Chớp sáng đầu
    if (t < 7) { ctx.fillStyle = `rgba(255,244,214,${(1 - t / 7) * 0.45})`; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'lighter';
    // Tia sáng mặt trời quay quanh xe
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.03);
    const n = 16, R = Math.min(W, H) * 0.55 * Math.min(1, t / 14);
    for (let i = 0; i < n; i++) {
        ctx.rotate(MAIN_TAU / n);
        const g = ctx.createLinearGradient(0, 0, 0, -R);
        g.addColorStop(0, `rgba(255,210,120,${0.42 * A})`); g.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = g; const w = i % 2 ? 7 : 13;
        ctx.beginPath(); ctx.moveTo(-w * 0.3, 0); ctx.lineTo(-w, -R); ctx.lineTo(w, -R); ctx.lineTo(w * 0.3, 0); ctx.fill();
    }
    ctx.restore();
    // Cột lửa phóng về phía đối thủ
    if (t < 60) {
        const a = (t < 8 ? t / 8 : 1 - (t - 8) / 52) * 0.9, L = 120 + t * 7;
        const g = ctx.createLinearGradient(x, y, x, y + fwd * L);
        g.addColorStop(0, `rgba(255,245,200,${a})`); g.addColorStop(0.4, `rgba(255,130,20,${a * 0.7})`); g.addColorStop(1, 'rgba(255,40,0,0)');
        ctx.fillStyle = g; const w = 26 + Math.sin(t * 0.8) * 5;
        ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * 0.35, y + fwd * L * 0.5, x, y + fwd * L);
        ctx.quadraticCurveTo(x + w * 0.35, y + fwd * L * 0.5, x + w, y); ctx.closePath(); ctx.fill();
    }
    // Vòng xung kích
    for (let i = 0; i < 3; i++) {
        const tt = t - i * 9; if (tt < 0 || tt > 40) continue;
        const r = 18 + tt * 5.5, a = 1 - tt / 40;
        ctx.strokeStyle = `rgba(255,${200 - i * 50},${80 - i * 20},${a})`; ctx.lineWidth = 5 * a + 1;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.35, r * 0.8, 0, 0, MAIN_TAU); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // Viền điện ảnh (letterbox) mảnh, bán trong suốt — không che làn xe hai bên
    const bh = Math.round(H * 0.022 * A);
    if (bh > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
        ctx.fillStyle = `rgba(255,190,70,${0.85 * A})`;
        ctx.fillRect(0, bh, W, 1.5); ctx.fillRect(0, H - bh - 1.5, W, 1.5);
    }
    ctx.restore();
}

// ---------- Hợp Nhất cỡ nửa sân ----------
function mainDrawFinaleGround(o) {
    const t = o.t;
    if (o.hit) return;
    ctx.save();
    const lock = t > o.charge * 0.5, pulse = 0.5 + 0.5 * Math.sin(t * 0.5);
    // Vùng cảnh báo trên làn địch (khoá vị trí ngay khi xuất hiện)
    ctx.fillStyle = lock ? `rgba(255,40,20,${0.16 + 0.14 * pulse})` : `rgba(255,180,40,${0.12 + 0.1 * pulse})`;
    ctx.fillRect(o.zx, o.ly, o.zw, o.lh);
    ctx.strokeStyle = lock ? '#ff3b1f' : '#ffd56a'; ctx.lineWidth = 2; ctx.setLineDash(lock ? [] : [8, 6]);
    ctx.strokeRect(o.zx + 1, o.ly + 1, o.zw - 2, o.lh - 2); ctx.setLineDash([]);
    // Sọc chéo
    ctx.save(); ctx.beginPath(); ctx.rect(o.zx, o.ly, o.zw, o.lh); ctx.clip();
    ctx.strokeStyle = lock ? 'rgba(255,90,60,0.35)' : 'rgba(255,214,110,0.3)'; ctx.lineWidth = 5;
    const off = (t * 2) % 22;
    for (let x = o.zx - o.lh + off; x < o.zx + o.zw; x += 22) { ctx.beginPath(); ctx.moveTo(x, o.ly + o.lh); ctx.lineTo(x + o.lh, o.ly); ctx.stroke(); }
    ctx.restore();
    // Vòng co lại báo thời điểm đòn đến
    if (lock) {
        const total = o.charge * 0.5 + Math.abs(o.ty - o.oy) / o.speed;
        const k = Math.max(0, 1 - (t - o.charge * 0.5) / total);
        const cx = o.zx + o.zw / 2, cy = o.ly + o.lh / 2;
        ctx.strokeStyle = 'rgba(255,80,50,0.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, o.zw / 2 * (0.25 + 0.75 * k), o.lh * (0.5 + 0.9 * k), 0, 0, MAIN_TAU); ctx.stroke();
    }
    // Cột chiếu mờ từ MAIN tới vùng
    const g = ctx.createLinearGradient(0, o.oy, 0, o.ty);
    g.addColorStop(0, 'rgba(255,190,70,0.10)'); g.addColorStop(1, 'rgba(255,90,20,0.03)');
    ctx.fillStyle = g; ctx.fillRect(o.zx, Math.min(o.oy, o.ty), o.zw, Math.abs(o.ty - o.oy));
    ctx.restore();
}
function mainDrawFinaleOrb(o) {
    const t = o.t, cx = o.zx + o.zw / 2, Rmax = o.zw / 2 * 0.92;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (!o.hit) {
        const k = Math.min(1, t / o.charge), R = t <= o.charge ? Rmax * (0.15 + 0.35 * k) : Rmax;
        const y = t <= o.charge ? o.oy + o.dir * R * 0.6 : o.y;
        const x = t <= o.charge ? o.ox + (cx - o.ox) * k : cx;
        if (t <= o.charge) {
            // Tụ lực: vệt sáng hội tụ
            const n = Math.max(6, Math.round(14 * mainQ()));
            ctx.strokeStyle = `rgba(255,220,140,${0.55 * k})`; ctx.lineWidth = 2;
            for (let i = 0; i < n; i++) {
                const a = mainRand(i) * MAIN_TAU, d = (1 - ((t * 0.045 + mainRand(i + 9)) % 1)) * 150 + R;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.lineTo(x + Math.cos(a) * (d - 22), y + Math.sin(a) * (d - 22)); ctx.stroke();
            }
        } else {
            // Đuôi lửa khổng lồ
            const L = R * 2.4, back = -o.dir;
            const g = ctx.createLinearGradient(x, y, x, y + back * L);
            g.addColorStop(0, 'rgba(255,160,40,0.6)'); g.addColorStop(1, 'rgba(255,40,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(x - R, y); ctx.quadraticCurveTo(x - R * 0.5, y + back * L * 0.6, x, y + back * L);
            ctx.quadraticCurveTo(x + R * 0.5, y + back * L * 0.6, x + R, y); ctx.closePath(); ctx.fill();
        }
        // Quầng mặt trời
        const h = ctx.createRadialGradient(x, y, R * 0.4, x, y, R * 1.5);
        h.addColorStop(0, 'rgba(255,200,90,0.5)'); h.addColorStop(1, 'rgba(255,70,0,0)');
        ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, R * 1.5, 0, MAIN_TAU); ctx.fill();
        // Lưỡi lửa vành
        ctx.save(); ctx.translate(x, y);
        const n = 18;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * MAIN_TAU + t * 0.05, len = R * (0.22 + 0.16 * Math.sin(t * 0.6 + i * 1.9));
            mainFlameTongue(a, R * 0.9, len, R * 0.12, 'rgba(255,200,90,0.8)', 'rgba(255,50,0,0)');
        }
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        const c = ctx.createRadialGradient(x, y - R * 0.2, R * 0.05, x, y, R);
        c.addColorStop(0, 'rgba(255,255,255,0.98)'); c.addColorStop(0.35, 'rgba(255,240,190,0.95)'); c.addColorStop(0.75, 'rgba(255,160,30,0.92)'); c.addColorStop(1, 'rgba(220,60,10,0.85)');
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, R, 0, MAIN_TAU); ctx.fill();
        mainDrawV(x, y, R * 0.5, -o.dir, 'rgba(190,70,0,0.35)');
    } else {
        // Va chạm: chớp + vòng nổ lan
        const tt = t - o.hitT, a = Math.max(0, 1 - tt / 40);
        if (tt < 6) { ctx.fillStyle = `rgba(255,240,200,${0.4 * (1 - tt / 6)})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        for (let i = 0; i < 2; i++) {
            const r = Rmax * (0.6 + (tt + i * 6) * 0.06);
            ctx.strokeStyle = `rgba(255,${190 - i * 70},60,${a})`; ctx.lineWidth = 8 * a + 1;
            ctx.beginPath(); ctx.ellipse(cx, o.ty, r * 1.2, r * 0.6, 0, 0, MAIN_TAU); ctx.stroke();
        }
    }
    ctx.restore();
}

// ---------- Ký Ức Thứ Hai: hồi sinh ----------
function mainDrawMemoryFx(f) {
    const t = f.t, owner = f.side === 1 ? p1 : p2;
    const x = owner ? owner.x + owner.w / 2 : f.x, y = owner ? owner.y + owner.h / 2 : f.y;
    const A = t > f.dur - 15 ? (f.dur - t) / 15 : 1;
    ctx.save();
    if (t < 8) { ctx.fillStyle = `rgba(220,210,255,${(1 - t / 8) * 0.35})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.globalCompositeOperation = 'lighter';
    // Mảnh ký ức: bay ra rồi tua ngược hút về xe
    const n = Math.max(8, Math.round(16 * mainQ()));
    const k = t < 26 ? t / 26 : Math.max(0, 1 - (t - 26) / 30);
    for (let i = 0; i < n; i++) {
        const a = (i / n) * MAIN_TAU + mainRand(i) * 0.4 - t * 0.04, d = 14 + k * (60 + mainRand(i + 3) * 50);
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.8, s = 3 + mainRand(i + 7) * 4;
        ctx.save(); ctx.translate(px, py); ctx.rotate(a + t * 0.1);
        ctx.fillStyle = i % 3 ? `rgba(196,181,253,${0.85 * A})` : `rgba(255,214,110,${0.9 * A})`;
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.6, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
    }
    // Vòng đồng hồ tua ngược
    ctx.strokeStyle = `rgba(196,181,253,${0.7 * A})`; ctx.lineWidth = 2;
    const r = 26 + (1 - k) * 10;
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 - MAIN_TAU * Math.min(1, t / 40), true); ctx.stroke();
    ctx.restore();
}

// ---------- Nút Skill & băng tên chiêu kiểu MAIN ----------
window.addEventListener('load', () => {
    if (typeof EvoSystem === 'undefined') return;
    const ui = EvoSystem.ui;
    EvoSystem.ui = function () {
        const r = ui.apply(this, arguments);
        for (const side of [1, 2]) {
            const online = onlineManager.isOnline;
            const p = online && onlineManager.role === 'guest' ? (side === 1 ? p2 : p1) : (side === 1 ? p1 : p2);
            const main = FEATURE_EVO34 && evoIsMainBasic(p);
            const btn = document.getElementById(`evo-skill-${side}`), banner = document.getElementById(`evo-banner-${side}`);
            if (btn && btn.classList.contains('evo-main') !== main) btn.classList.toggle('evo-main', main);
            if (banner && banner.classList.contains('evo-main') !== main) banner.classList.toggle('evo-main', main);
        }
        return r;
    };
});

// Nhận diện MAIN trên nút Skill / băng tên Tuyệt Kỹ dùng chung (js/render/evo-fx.js nạp sau file này)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof EvoFx === 'undefined') return;
    EvoFx.theme('basic', {
        c1: '#ff7a00', c2: '#ffd56a', dark: '#2a0a04', slogan: 'Chiến đấu đến khi lửa tàn!!',
        sfx: [[0, 55, 'sawtooth', 0.9, 0.2], [120, 660, 'triangle', 0.25, 0.08], [260, 990, 'sine', 0.3, 0.06]],
        icon(g, mode) {
            if (mode === 'ult') { // ngọn lửa
                g.beginPath(); g.moveTo(0, -13); g.quadraticCurveTo(10, -2, 7, 6); g.quadraticCurveTo(4, 12, 0, 12);
                g.quadraticCurveTo(-4, 12, -7, 6); g.quadraticCurveTo(-10, -2, 0, -13); g.fill();
            } else { // viên Hợp Nhất
                g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
                g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 11, -0.6, 0.6); g.stroke(); g.beginPath(); g.arc(0, 0, 11, Math.PI - 0.6, Math.PI + 0.6); g.stroke();
            }
        },
    });
});
