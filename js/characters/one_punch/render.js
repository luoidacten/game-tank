// ==========================================
// Nhất Quyền / Một Đấm (one_punch) — Hình ảnh: xe "anh hùng hói" (thân vàng, viền trắng, áo choàng đỏ,
// mái vòm trọc bóng loáng, nắm đấm Găng Đỏ thay nòng), cột áp lực, quyền phong, đường cảnh báo Đấm
// Nghiêm Túc, Giáp Ảo trắng, HUD Thú Vị, kết liễu "Cú Đấm Rẽ Đôi Bầu Trời". Chỉ đọc state -> an toàn online.
// ==========================================

function opNow() { return Date.now() / 1000; }
function opEase(k) { return 1 - Math.pow(1 - k, 3); }

// Nắm đấm găng đỏ (tâm x, mép trước y, hướng lên), cỡ s
function opFist(x, y, s, glow) {
    ctx.save();
    ctx.translate(x, y);
    if (glow) TA.glow(OP_RED, glow);
    ctx.fillStyle = TA.vgrad(0, s * 1.4, '#f87171', '#991b1b');
    TA.rr(-s * 0.62, 0, s * 1.24, s * 1.05, s * 0.32); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = 'rgba(60, 0, 0, 0.75)'; ctx.lineWidth = Math.max(0.5, s * 0.07);
    for (let i = 1; i < 4; i++) { const xx = -s * 0.62 + i * s * 0.31; ctx.beginPath(); ctx.moveTo(xx, s * 0.06); ctx.lineTo(xx, s * 0.38); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-s * 0.45, s * 0.12, s * 0.5, s * 0.1);
    // cổ găng trắng
    ctx.fillStyle = '#f1f5f9'; TA.rr(-s * 0.5, s * 0.98, s, s * 0.34, s * 0.1); ctx.fill();
    ctx.restore();
}

// ---------- Xe ----------
registerTankArt('one_punch', (p, k) => {
    const t = k.t, rec = (p.opRecoil || 0) / 16 - (p.opWindT > 0 ? (1 - p.opWindT / OP_WIND) * 0.9 : 0), exc = (p.opExc || 0) / 100;
    // áo choàng đỏ bay phía sau
    const wave = Math.sin(t * 7) * 1.6;
    ctx.fillStyle = TA.vgrad(6, 17, '#dc2626', '#7f1d1d');
    ctx.beginPath();
    ctx.moveTo(-8, 4); ctx.lineTo(8, 4);
    ctx.quadraticCurveTo(11 + wave, 11, 9 + wave, 17.5);
    ctx.lineTo(3 + wave * 0.5, 15.5); ctx.lineTo(-1 - wave * 0.3, 17.8); ctx.lineTo(-5 - wave * 0.6, 15.6);
    ctx.lineTo(-9 - wave, 17.2); ctx.quadraticCurveTo(-11 - wave, 11, -8, 4); ctx.closePath(); ctx.fill();
    // bánh xích
    TA.treads(-15.5, 5, -12, 13, t, '#111827', '#4b5563');
    // thân (bộ đồ vàng) + viền trắng hai bên
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#ca8a04', '#fde047');
    TA.rr(-10.5, -10, 21, 21, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    ctx.fillStyle = '#f8fafc';
    TA.rr(-10.5, -7, 2.6, 14, 1); ctx.fill(); TA.rr(7.9, -7, 2.6, 14, 1); ctx.fill();
    // khoá đai lưng
    ctx.fillStyle = '#111827'; ctx.fillRect(-10, 5.2, 20, 2.2);
    ctx.fillStyle = OP_YEL; TA.rr(-2.2, 4.8, 4.4, 3, 0.8); ctx.fill();
    // mái vòm trọc bóng loáng (tháp pháo)
    const dome = ctx.createRadialGradient(-2.4, -3.6, 0.6, 0, -1, 8);
    dome.addColorStop(0, '#fffaf0'); dome.addColorStop(0.45, '#fcd9b6'); dome.addColorStop(1, '#d69e6e');
    ctx.fillStyle = dome; ctx.beginPath(); ctx.arc(0, -1, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120, 72, 30, 0.6)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.ellipse(-2.6, -4.2, 1.9, 1.1, -0.6, 0, Math.PI * 2); ctx.fill();
    // ánh lấp lánh trên đầu trọc
    const tw = 0.5 + 0.5 * Math.sin(t * 3.1);
    ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * tw})`;
    ctx.beginPath(); ctx.moveTo(2.8, -5.8); ctx.lineTo(3.3, -4.6); ctx.lineTo(4.5, -4.2); ctx.lineTo(3.3, -3.8); ctx.lineTo(2.8, -2.6);
    ctx.lineTo(2.3, -3.8); ctx.lineTo(1.1, -4.2); ctx.lineTo(2.3, -4.6); ctx.closePath(); ctx.fill();
    // cánh tay + nắm đấm găng đỏ (nòng)
    const fy = -12 - rec * 5;
    ctx.fillStyle = '#eab308'; ctx.fillRect(-2.2, fy + 6, 4.4, -fy - 6);
    opFist(0, fy - 2.6, 6.2, (p.opCharging ? 12 : 4) + exc * 8);
    // găng phụ hai bên (Evo 1: Đấm Bồi Hai Tay)
    if (k.evo1) { opFist(-8.5, -12.5 - (p.opGustQ ? (p.opGustQ % 2) * 3 : 0), 3.4, 3); opFist(8.5, -12.5 - (p.opGustQ ? ((p.opGustQ + 1) % 2) * 3 : 0), 3.4, 3); }
    // Evo 2: giày đỏ (bật ngang)
    if (k.evo2) { ctx.fillStyle = OP_RED; TA.rr(-16, 9.5, 5, 3.4, 1.2); ctx.fill(); TA.rr(11, 9.5, 5, 3.4, 1.2); ctx.fill(); }
    // Full Evo: vầng hào quang đỏ thẫm
    if (k.full) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.45 + 0.35 * Math.sin(t * 4)})`; ctx.lineWidth = 1.2; TA.glow(OP_RED, 8);
        ctx.beginPath(); ctx.arc(0, -1, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); TA.noGlow();
    }
});

// ---------- Quyền phong (Evo 1) ----------
function opDrawGust(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, up = b.vy < 0 ? 1 : -1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)'; ctx.lineWidth = 2.2; ctx.shadowBlur = 8; ctx.shadowColor = OP_YEL;
    for (let i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.ellipse(x, y + up * i * 6, 8 - i * 2, 4, 0, up > 0 ? Math.PI * 1.05 : Math.PI * 0.05, up > 0 ? Math.PI * 1.95 : Math.PI * 0.95); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 3, y + up * 6); ctx.lineTo(x - 3, y + up * 18); ctx.moveTo(x + 3, y + up * 6); ctx.lineTo(x + 3, y + up * 16); ctx.stroke();
    ctx.restore();
}

// ---------- Cột áp lực (Đấm Thường / Nghiêm Túc) ----------
function opDrawPunchFx(f) {
    const k = f.t / f.dur, a = 1 - k, ser = f.kind === 'serious';
    const top = Math.min(f.y0, f.y1), bot = Math.max(f.y0, f.y1), H = bot - top;
    const grow = opEase(Math.min(1, f.t / 4));
    const hw = (ser ? OP_SER_HW : OP_CENTER) * (0.6 + 0.4 * grow) * (1 + k * 0.25);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // rìa (Đấm Thường 30–85px)
    if (!ser) {
        const g = ctx.createLinearGradient(f.x - OP_EDGE, 0, f.x + OP_EDGE, 0);
        g.addColorStop(0, 'rgba(250,204,21,0)'); g.addColorStop(0.5, `rgba(250,204,21,${0.22 * a})`); g.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = g; ctx.fillRect(f.x - OP_EDGE, top, OP_EDGE * 2, H);
    }
    // lõi cột
    const g2 = ctx.createLinearGradient(f.x - hw, 0, f.x + hw, 0);
    const c = ser ? '239, 68, 68' : '250, 204, 21';
    g2.addColorStop(0, `rgba(${c},0)`); g2.addColorStop(0.3, `rgba(${c},${0.55 * a})`);
    g2.addColorStop(0.5, `rgba(255,255,255,${0.9 * a})`); g2.addColorStop(0.7, `rgba(${c},${0.55 * a})`); g2.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g2; ctx.fillRect(f.x - hw, top, hw * 2, H);
    // vạch tốc độ kiểu manga
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * a})`; ctx.lineWidth = ser ? 1.6 : 1;
    const n = ser ? 14 : 7;
    for (let i = 0; i < n; i++) {
        const xx = f.x + Math.sin(f.seed * 7 + i * 2.3) * hw * 0.9;
        const yy = top + ((Math.sin(f.seed * 3 + i * 1.7) * 0.5 + 0.5) * 0.8) * H, L = 30 + (i % 3) * 25;
        ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + L); ctx.stroke();
    }
    // vòng áp lực toả ra ở gốc
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = ser ? `rgba(239,68,68,${a})` : `rgba(253,224,71,${a})`; ctx.lineWidth = ser ? 4 * a + 1 : 2.5 * a + 0.5;
    const R = (ser ? 70 : 34) * opEase(k);
    ctx.beginPath(); ctx.ellipse(f.x, f.y0, R, R * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    if (ser && f.t < 10) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - f.t / 10)})`;
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 3, canvas.height * 3);
    }
    ctx.restore();
}

// ---------- Quanh xe ----------
Object.assign(CharHooks.registry.one_punch, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = opNow();
        const dir = this.id === 1 ? -1 : 1;
        ctx.save();
        // Gồng Đấm Thường: vạch cảnh báo đỏ khoá trục X + nắm đấm tụ lực
        if (this.opWindT > 0) {
            const lx = this.opWindX || cx, y0 = dir < 0 ? this.y : this.y + this.h, y1 = dir < 0 ? 0 : canvas.height;
            const top = Math.min(y0, y1), H = Math.abs(y1 - y0), k = 1 - this.opWindT / OP_WIND;
            const fl = 0.55 + 0.45 * Math.abs(Math.sin(t * 28));
            ctx.fillStyle = `rgba(239, 68, 68, ${0.12 + 0.2 * k})`;
            ctx.fillRect(lx - OP_CENTER, top, OP_CENTER * 2, H);
            ctx.fillStyle = `rgba(239, 68, 68, ${0.04 + 0.08 * k})`;
            ctx.fillRect(lx - OP_EDGE, top, OP_EDGE * 2, H);
            ctx.font = "900 13px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(254, 202, 202, ${0.6 + 0.4 * fl})`;
            drawWorldText(ctx, '!', lx, dir < 0 ? this.y - 26 : this.y + this.h + 34);
            ctx.strokeStyle = `rgba(248, 113, 113, ${0.6 + 0.4 * fl})`; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
            ctx.lineDashOffset = -t * 80 * dir;
            ctx.beginPath(); ctx.moveTo(lx - OP_CENTER, top); ctx.lineTo(lx - OP_CENTER, top + H); ctx.moveTo(lx + OP_CENTER, top); ctx.lineTo(lx + OP_CENTER, top + H); ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = `rgba(254, 202, 202, ${0.6 + 0.4 * fl})`; ctx.lineWidth = 2 + 2 * k; ctx.shadowBlur = 10; ctx.shadowColor = OP_RED;
            ctx.beginPath(); ctx.moveTo(lx, y0); ctx.lineTo(lx, y0 + dir * H * Math.min(1, k * 1.6)); ctx.stroke();
            // vòng tụ quyền co lại quanh nắm đấm
            const fy = dir < 0 ? this.y - 6 : this.y + this.h + 6;
            ctx.strokeStyle = OP_YEL; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(lx, fy, 6 + 16 * (1 - k), 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = `rgba(250, 204, 21, ${0.3 + 0.5 * k})`;
            ctx.beginPath(); ctx.arc(lx, fy, 3 + 4 * k, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
        // Đường cảnh báo Đấm Nghiêm Túc (đỏ, rộng, dọc màn hình)
        if (this.opCharging) {
            const lx = this.opLineX || cx, y0 = dir < 0 ? this.y : this.y + this.h, y1 = dir < 0 ? 0 : canvas.height;
            const top = Math.min(y0, y1), H = Math.abs(y1 - y0);
            const prog = Math.min(1, (this.opHold || 0) / opHoldN(this)), ready = prog >= 1;
            const fl = ready ? 0.75 + 0.25 * Math.sin(t * 30) : 0.55;
            ctx.fillStyle = `rgba(239, 68, 68, ${0.18 + 0.16 * prog})`;
            ctx.fillRect(lx - OP_SER_HW, top, OP_SER_HW * 2, H);
            ctx.fillStyle = `rgba(239, 68, 68, ${0.12 + 0.2 * prog})`;
            ctx.fillRect(lx - OP_CENTER, top, OP_CENTER * 2, H);
            ctx.strokeStyle = `rgba(248, 113, 113, ${fl})`; ctx.lineWidth = 2.4; ctx.setLineDash([8, 6]);
            ctx.lineDashOffset = -t * 60 * dir;
            ctx.beginPath(); ctx.moveTo(lx - OP_SER_HW, top); ctx.lineTo(lx - OP_SER_HW, top + H); ctx.moveTo(lx + OP_SER_HW, top); ctx.lineTo(lx + OP_SER_HW, top + H); ctx.stroke();
            ctx.setLineDash([]);
            // lấp đầy tiến độ dọc theo đường
            ctx.fillStyle = `rgba(254, 202, 202, ${ready ? 0.5 : 0.3})`;
            ctx.fillRect(lx - 2, dir < 0 ? y0 - H * prog : y0, 4, H * prog);
            // mũi tên ⌃ chạy về phía địch
            ctx.strokeStyle = `rgba(254, 226, 226, ${0.7 * fl})`; ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const yy = y0 + dir * (((t * 140 + i * H / 6) % H));
                ctx.beginPath(); ctx.moveTo(lx - 10, yy - dir * 7); ctx.lineTo(lx, yy); ctx.lineTo(lx + 10, yy - dir * 7); ctx.stroke();
            }
            if (ready) {
                ctx.font = "900 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = '#fecaca';
                ctx.shadowBlur = 8; ctx.shadowColor = OP_RED;
                drawWorldText(ctx, 'NGHIÊM TÚC!', lx, dir < 0 ? this.y - 40 : this.y + this.h + 48);
                ctx.shadowBlur = 0;
            }
            // vòng tụ lực quanh xe
            ctx.strokeStyle = OP_RED; ctx.lineWidth = 2.2; ctx.shadowBlur = 10; ctx.shadowColor = OP_RED;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
            ctx.shadowBlur = 0;
            if (this.opDashT > 0) {
                ctx.fillStyle = 'rgba(254, 202, 202, 0.4)';
                for (let i = 1; i <= 3; i++) ctx.fillRect(this.x - Math.sign(this.opDashV) * i * 9, this.y + 4, this.w, this.h - 8);
            }
        }
        // Giáp Ảo: vỏ trắng mờ
        if (this.opVS > 0.01) {
            const a = Math.min(1, 0.35 + this.opVS / 2.5 * 0.5) + (this.opVSFx > 0 ? 0.3 : 0);
            ctx.strokeStyle = `rgba(248, 250, 252, ${Math.min(1, a)})`; ctx.lineWidth = 1.8; ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
            ctx.fillStyle = `rgba(248, 250, 252, ${0.06 + (this.opVSFx > 0 ? 0.12 : 0)})`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const an = t * 0.8 + i * Math.PI / 3, r = this.w * 0.82; ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
            ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        }
        // Thú Vị cao: hơi nóng đỏ
        const exc = (this.opExc || 0) / 100;
        if (exc > 0.3) {
            ctx.fillStyle = `rgba(239, 68, 68, ${0.25 * exc})`;
            for (let i = 0; i < 4; i++) {
                const ph = (t * 1.6 + i / 4) % 1;
                ctx.beginPath(); ctx.arc(this.x + 4 + i * (this.w - 8) / 3 + Math.sin(t * 6 + i) * 2, cy - dir * (ph * 22), 2.2 * (1 - ph) + 0.5, 0, Math.PI * 2); ctx.fill();
            }
        }
        // hồi máu
        if (this.opRegenFx > 0) {
            ctx.fillStyle = 'rgba(134, 239, 172, 0.8)';
            const ph = (t * 2) % 1;
            ctx.fillRect(cx - 1, cy - 12 - ph * 10, 2, 6); ctx.fillRect(cx - 3, cy - 10 - ph * 10, 6, 2);
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudExtraBar !== 'function') return;
        const exc = (this.opExc || 0) / 100;
        const col = exc >= 0.65 ? (this.opSerCd > 0 ? '#f97316' : OP_RED) : OP_YEL;
        hudExtraBar(this, 0, exc, col, { h: 2.5, marks: [0.65] });
        if (this.opVS > 0.01) hudExtraBar(this, 0.7, Math.min(1, this.opVS / 2.5), OP_WHITE, { h: 1.5 });
    },
});

// ---------- Kết liễu "Cú Đấm Rẽ Đôi Bầu Trời" ----------
function opDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height, dir = f.dir;
    ctx.save();
    // 1) Manga trắng đen: khử màu toàn màn hình + tăng tương phản
    const bw = t < 96 ? 1 : Math.max(0, 1 - (t - 96) / 30);
    if (bw > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const cw = ctx.canvas.width, ch = ctx.canvas.height;
        ctx.globalAlpha = bw;
        ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = 'rgba(128,128,128,0.6)'; ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(245, 245, 240, ${0.18 * bw})`; ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
        // vạch tập trung (focus lines) quanh mục tiêu
        ctx.strokeStyle = `rgba(0,0,0,${0.55 * bw})`; ctx.lineWidth = 1.4;
        for (let i = 0; i < 40; i++) {
            const an = f.seed + i * (Math.PI * 2 / 40) + Math.sin(i * 7.3) * 0.05;
            const r0 = 70 + (i % 5) * 14;
            ctx.beginPath(); ctx.moveTo(f.x + Math.cos(an) * r0, f.y + Math.sin(an) * r0); ctx.lineTo(f.x + Math.cos(an) * 700, f.y + Math.sin(an) * 700); ctx.stroke();
        }
    }
    // 3) Vệt trống khổng lồ xé toạc nền sân & mây trời
    if (t >= 30) {
        const k = opEase(Math.min(1, (t - 30) / 16)), fade = t > 100 ? Math.max(0, 1 - (t - 100) / 30) : 1;
        const hw = 16 + 34 * k, y0 = f.oy, y1 = dir < 0 ? -H : H * 2;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#fafaf5';
        ctx.beginPath();
        const steps = 22, top = Math.min(y0, y1), bot = Math.max(y0, y1);
        for (let i = 0; i <= steps; i++) { const yy = top + (bot - top) * i / steps; ctx.lineTo(f.x - hw - Math.abs(Math.sin(f.seed + i * 1.9)) * 9, yy); }
        for (let i = steps; i >= 0; i--) { const yy = top + (bot - top) * i / steps; ctx.lineTo(f.x + hw + Math.abs(Math.sin(f.seed * 2 + i * 2.3)) * 9, yy); }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke();
        // mảnh vỡ nền & mây bị thổi tung
        ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < 18; i++) {
            const side = i % 2 ? 1 : -1, d = hw + 10 + (i * 13 % 50) * k;
            const yy = f.oy + (f.y - f.oy) * ((i * 0.137) % 1) * 1.4;
            ctx.save(); ctx.translate(f.x + side * d, yy); ctx.rotate(i + t * 0.1);
            ctx.fillRect(-3, -2, 6 + (i % 3) * 3, 4); ctx.restore();
        }
        ctx.restore();
    }
    // xe địch bị thổi bẹp rồi bay khỏi màn hình
    if (t >= 22 && t < 120) {
        const fly = Math.max(0, t - 44), k2 = fly * fly * 0.35;
        const sq = t < 44 ? Math.max(0.25, 1 - (t - 22) / 14) : 0.25;
        ctx.save();
        ctx.translate(f.x + Math.sin(f.seed) * fly * 1.2, f.y + dir * k2); ctx.rotate(fly * 0.25);
        ctx.scale(1 + (1 - sq) * 0.8, sq);
        ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        TA.rr(-f.vw / 2, -f.vh / 2, f.vw, f.vh, 4); ctx.fill(); ctx.stroke();
        ctx.restore();
    }
    // 2) Găng Tay Đỏ đấm thẳng + luồng áp lực hình chữ V
    if (t >= 16 && t < 70) {
        const k = opEase(Math.min(1, (t - 16) / 18));
        const fx = f.x, fy = f.oy + (f.y - f.oy) * 0.7 * k;
        ctx.save();
        ctx.translate(fx, fy); if (dir > 0) ctx.rotate(Math.PI);
        // V áp lực phía trước nắm đấm
        const reach = Math.abs(f.y - fy);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(-90 - k * 40, -reach - 30); ctx.lineTo(-70, -reach - 30); ctx.lineTo(0, -16); ctx.lineTo(70, -reach - 30); ctx.lineTo(90 + k * 40, -reach - 30); ctx.lineTo(26, -6); ctx.closePath();
        ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 7, 30); ctx.lineTo(-14 + i * 7, 80 + (i % 2) * 20); ctx.stroke(); }
        opFist(0, -24, 30, 18);
        ctx.restore();
    }
    ctx.restore();
    // chữ Hán khổng lồ 【 死 — TỬ 】 (0.4s đầu + vang lại khi mờ dần)
    if (t >= 2 && t < 70) {
        const big = t < 28, a = big ? Math.min(1, (t - 2) / 4) : Math.max(0, 1 - (t - 28) / 42) * 0.9;
        const sc = big ? 1 + Math.max(0, 1 - (t - 2) / 6) * 0.5 : 0.62;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        // camera kết liễu luôn đặt nạn nhân ở giữa màn hình -> neo chữ quanh nạn nhân
        const cxv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimY : H / 2;
        const ty = big ? cyv : cyv + (f.team === 1 ? 120 : -120);
        ctx.translate(cxv + (big ? (Math.random() - 0.5) * 4 : 0), ty); ctx.scale(sc, sc);
        ctx.font = "900 150px 'Noto Serif JP', 'Hiragino Mincho ProN', serif";
        ctx.fillStyle = '#9f1239'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.shadowBlur = 24; ctx.shadowColor = '#ef4444';
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        ctx.strokeText('死', 0, -16); ctx.fillText('死', 0, -16);
        ctx.font = "900 30px 'Orbitron', Arial"; ctx.lineWidth = 4;
        ctx.strokeText('【 死 — TỬ 】', 0, 86); ctx.fillText('【 死 — TỬ 】', 0, 86);
        if (f.death) { ctx.font = "900 18px 'Orbitron', Arial"; ctx.fillStyle = '#fff'; ctx.strokeText('DEATH PUNCH', 0, 120); ctx.fillText('DEATH PUNCH', 0, 120); }
        ctx.restore();
    }
}
function opFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof OpFinisher && e.active) e.drawOver();
}

function opRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('one_punch', p => {
        const exc = p.opExc || 0;
        if (p.opCharging) {
            const k = Math.min(1, (p.opHold || 0) / opHoldN(p));
            return { pct: k, ready: k >= 1, color: OP_RED, label: k >= 1 ? 'NHẢ: ĐẤM NGHIÊM TÚC!' : 'NGHIÊM TÚC...', btnIcon: '✊' };
        }
        if (opUnlocked(p)) return { pct: 1, ready: true, color: OP_RED, label: 'GIỮ: ĐẤM NGHIÊM TÚC', btnIcon: '✊' };
        if (p.opSerCd > 0) return { pct: 1 - p.opSerCd / opSerCdMax(p), ready: false, color: '#f97316', label: 'NGHIÊM TÚC ' + Math.ceil(p.opSerCd / 60) + 's', btnIcon: '✊', dim: true };
        return { idle: exc <= 0, pct: Math.min(1, exc / 65), ready: false, color: OP_YEL, label: 'THÚ VỊ ' + Math.round(exc) + '%', btnIcon: '👊' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', opRegisterHUD);
