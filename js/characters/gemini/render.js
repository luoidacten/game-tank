// ==========================================
// Gemini (gemini) — Hình ảnh: xe song sinh neon (Alpha cyan / Beta tím hồng), Bản Sao AI, dây liên kết thần kinh,
// vòng cứu trợ + thanh tiến độ, nhãn điều khiển, HUD nút Bắn (xe đang điều khiển + hồi Chuyển Giao)
// ==========================================

function gmTagColor(tag) { return tag === 'B' ? GM_B : GM_A; }

// --- Xe: lưới 32×32, nòng hướng −y; xe 26×26 nên giữ chi tiết trong ±15 ---
registerTankArt('gemini', (p, k) => {
    const t = k.t;
    const col = gmTagColor(p.gmTag);
    const down = !!p.gmDown;
    const isAI = !!p.gmIsTwin;
    const kick = (p.gmKick || 0) * 0.3;
    if (down) {
        // Xác xe gục: xám, nứt, chập chờn
        const fl = Math.sin(t * 23) > 0.2 ? 1 : 0.35;
        TA.treads(-15, 5, -12, 14, 0, '#151a22', '#2a313c');
        ctx.fillStyle = '#262c36';
        TA.rr(-10, -10, 20, 22, 4); ctx.fill();
        ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.save(); ctx.translate(0, -2); ctx.rotate(0.5);
        TA.barrel(0, -6, 9, 4, '#4b5563'); ctx.restore();
        ctx.strokeStyle = '#ff5577'; ctx.lineWidth = 1; ctx.globalAlpha = fl;
        ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-1, 0); ctx.lineTo(-3, 4); ctx.lineTo(3, 9); ctx.stroke();
        ctx.globalAlpha = 1;
        if (p.gmReboot > 0) { // tái khởi động: vòng vàng quay
            TA.glow(GM_GOLD, 8); ctx.strokeStyle = GM_GOLD; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 1, 6, t * 9, t * 9 + Math.PI * 1.3); ctx.stroke(); TA.noGlow();
        } else {
            ctx.fillStyle = 'rgba(255,85,119,' + (0.45 * fl) + ')';
            ctx.beginPath(); ctx.arc(0, 1, 4, 0, Math.PI * 2); ctx.fill();
        }
        return;
    }
    // Bánh xích
    TA.treads(-15, 5, -12, 14, t, '#0f172a', isAI ? '#3b2a4a' : '#1e3a4a');
    // Thân lục giác
    ctx.fillStyle = TA.metal(-10, 10, '#111827', '#273244');
    ctx.beginPath();
    ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(10.5, -4); ctx.lineTo(10.5, 9); ctx.lineTo(6, 13.5); ctx.lineTo(-6, 13.5); ctx.lineTo(-10.5, 9); ctx.lineTo(-10.5, -4); ctx.closePath();
    ctx.fill();
    TA.glow(col, 6); ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.stroke(); TA.noGlow();
    // Viền team ở đuôi
    ctx.fillStyle = k.team; ctx.fillRect(-6, 11.5, 12, 1.6);
    // Nòng đôi mảnh song song (2 ý thức) — giật khi bắn
    TA.barrel(-2.4, -6 + kick, 9.5, 2.6, '#cbd5e1', col);
    TA.barrel(2.4, -6 + kick, 9.5, 2.6, '#cbd5e1', col);
    // Lõi: 2 vòng lồng nhau (biểu tượng Song Tử), quay ngược chiều
    const r = 4.6;
    ctx.lineWidth = 1.4;
    TA.glow(col, 10);
    ctx.strokeStyle = GM_A; ctx.beginPath(); ctx.arc(-2.2, 2.5, r, t * 3, t * 3 + Math.PI * 1.6); ctx.stroke();
    ctx.strokeStyle = GM_B; ctx.beginPath(); ctx.arc(2.2, 2.5, r, -t * 3, -t * 3 + Math.PI * 1.6); ctx.stroke();
    TA.noGlow();
    // Mắt trung tâm: bản thể = chấm sáng tròn; AI = khe quét ngang
    if (isAI) {
        const sx = Math.sin(t * 4) * 3;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; TA.rr(-4.5, 1.2, 9, 2.6, 1.2); ctx.fill();
        TA.glow(col, 8); ctx.fillStyle = col; ctx.fillRect(sx - 1.2, 1.5, 2.4, 2); TA.noGlow();
    } else {
        TA.glow(col, 10); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 2.5, 1.8, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    }
    // Đệ Quy / bùng nổ sau chuyển giao: vạch năng lượng hai sườn
    const own = isAI ? gmOwnerOf(p) : p;
    if (own && own.gmBurst > 0) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 30);
        ctx.fillStyle = GM_GOLD; ctx.fillRect(-10, -3, 1.6, 10); ctx.fillRect(8.4, -3, 1.6, 10);
        ctx.globalAlpha = 1;
    }
});

// Đạn: hạt năng lượng hình thoi theo màu xe bắn ra
registerBulletArt('gemini', (b, color, owner, k) => {
    const c = gmTagColor(b.gmSrc);
    const r = k.r + 0.5;
    const tail = Math.min(18, 5 + k.sp * 2);
    const g = ctx.createLinearGradient(-tail, 0, 0, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c);
    ctx.fillStyle = g; ctx.globalAlpha = 0.6;
    ctx.fillRect(-tail, -r * 0.45, tail, r * 0.9);
    ctx.globalAlpha = 1;
    ctx.shadowColor = b.gmHome ? GM_GOLD : c; ctx.shadowBlur = b.gmHome ? 14 : 9;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(r * 1.6, 0); ctx.lineTo(0, -r); ctx.lineTo(-r * 0.8, 0); ctx.lineTo(0, r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.2, 0, r * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (b.gmHome) { ctx.strokeStyle = GM_GOLD; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2); ctx.stroke(); }
    return true;
});

// --- Vòng cứu trợ quanh xe đang gục ---
function gmDrawRescue(body, p) {
    const cx = body.x + body.w / 2, cy = body.y + body.h / 2;
    const R = gmResR(p);
    const tm = Date.now();
    const pct = Math.max(0, Math.min(1, body.gmRes || 0));
    const reboot = body.gmReboot > 0;
    const c = reboot ? GM_GOLD : gmTagColor(body.gmTag);
    ctx.save();
    // vùng cứu (dải ngang trên làn)
    ctx.globalAlpha = 0.16 + 0.06 * Math.sin(tm / 160);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(cx, cy, R, body.h * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -tm / 50;
    ctx.beginPath(); ctx.ellipse(cx, cy, R, body.h * 0.9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // vòng tiến độ
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, body.w * 0.78, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(cx, cy, body.w * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, pct)); ctx.stroke();
    ctx.shadowBlur = 0;
    // thanh tiến độ + chữ (phía giữa sân)
    const dir = gmDir(p);
    const by = dir < 0 ? body.y - 16 : body.y + body.h + 10;
    const bw = 46;
    ctx.fillStyle = 'rgba(4,8,18,0.9)'; ctx.fillRect(cx - bw / 2 - 1, by - 1, bw + 2, 6);
    const decaying = !reboot && (body.gmResOut || 0) > 60 && !gmE1(p) && pct > 0;
    ctx.fillStyle = decaying ? '#ff5577' : c; ctx.fillRect(cx - bw / 2, by, bw * pct, 4);
    ctx.font = "bold 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    const need = gmResNeed(p) / 60;
    const label = reboot ? '⟳ KHỞI ĐỘNG ' + Math.round(pct * 100) + '%'
        : (gmFull(p) ? '✚ CHẠM ĐỂ CỨU ' + Math.round(pct * 100) + '%' : '✚ CỨU ' + Math.round(pct * 100) + '% · ' + need.toFixed(0) + 's');
    const ty = dir < 0 ? by - 3 : by + 13;
    if (typeof drawWorldText === 'function') drawWorldText(ctx, label, cx, ty); else ctx.fillText(label, cx, ty);
    ctx.restore();
}

// Nhãn nhỏ cạnh xe: ▶ = xe bạn điều khiển, AI = Bản Sao
function gmDrawTag(body, controlled) {
    const c = gmTagColor(body.gmTag);
    const x = body.x - 7, y = body.y + body.h / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(4,8,18,0.85)';
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.shadowColor = c; ctx.shadowBlur = controlled ? 8 : 0;
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = c; ctx.font = "bold 6px 'Orbitron', Arial"; ctx.textAlign = 'center';
    const s = controlled ? (body.gmTag === 'B' ? 'β' : 'α') : 'AI';
    if (typeof drawWorldText === 'function') drawWorldText(ctx, s, x, y + 2.2); else ctx.fillText(s, x, y + 2.2);
    ctx.restore();
}

// Proxy để dùng lại khung vẽ xe & HUD chuẩn cho Bản Sao / xác bản thể đang gục
function gmProxy(src, extra) {
    const o = Object.create(src);
    o.weapon = 'gemini';
    return Object.assign(o, extra);
}

// Vẽ toàn bộ phần của 1 phe Gemini (gọi từ GeminiTwin.draw)
function gmDrawTwin(t) {
    const p = gmOwnerOf(t);
    if (!p || p.weapon !== 'gemini') return;
    const tm = Date.now();
    const pcx = p.x + p.w / 2, tcx = t.x + t.w / 2, y = p.y + p.h / 2;
    const fatal = typeof fatalCinematic !== 'undefined' && fatalCinematic.active;
    ctx.save();
    // Dây liên kết thần kinh giữa 2 xe (đứt nét khi 1 xe gục)
    if (!fatal) {
        const linked = gmStanding(p) && gmStanding(t);
        const g = ctx.createLinearGradient(pcx, 0, tcx, 0);
        g.addColorStop(0, gmTagColor(p.gmTag)); g.addColorStop(1, gmTagColor(t.gmTag));
        ctx.strokeStyle = g; ctx.lineWidth = linked ? 1.4 : 1;
        ctx.globalAlpha = linked ? 0.45 + 0.2 * Math.sin(tm / 140) : 0.25;
        ctx.setLineDash(linked ? [2, 5] : [1, 7]); ctx.lineDashOffset = -tm / 30;
        ctx.beginPath(); ctx.moveTo(pcx, y); ctx.lineTo(tcx, y); ctx.stroke();
        ctx.setLineDash([]);
        if (p.gmSwapFx > 0) { // sóng chuyển giao chạy dọc dây
            ctx.globalAlpha = p.gmSwapFx / 30;
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.shadowColor = GM_GOLD; ctx.shadowBlur = 14;
            ctx.beginPath(); ctx.moveTo(pcx, y); ctx.lineTo(tcx, y); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Bản thể đang gục: lõi không vẽ xe có HP 0 -> tự vẽ xác + vòng cứu
    if (p.gmDown && !fatal) {
        gmDrawRescue(p, p);
        drawTankArt(gmProxy(p, { gmIsTwin: false }), null);
    }
    if (t.gmDown) {
        if (!fatal) gmDrawRescue(t, p);
        drawTankArt(gmProxy(t, { gmIsTwin: true }), null);
    } else {
        if (t.inv > 0 && Math.floor(tm / 80) % 2) ctx.globalAlpha = 0.55;
        drawTankArt(gmProxy(t, { gmIsTwin: true }), t.gmHitFx > 0 ? '#ffffff' : (t.freezeTimer > 0 ? '#00ffff' : null));
        ctx.globalAlpha = 1;
        if (typeof drawTankHUD === 'function') {
            try {
                drawTankHUD(gmProxy(t, {
                    lastShot: tm - t.gmSince * 16.67, lastReload: tm - t.gmRel * 16.67, reloadTime: p.reloadTime || 1500,
                    bullets: [], upgrades: p.upgrades, hasUpgrade: (u) => p.hasUpgrade(u),
                }));
            } catch (e) { /* HUD lỗi không làm sập game */ }
        }
    }
    if (!fatal) {
        if (p.hp > 0 || p.gmDown) gmDrawTag(p, true);
        gmDrawTag(t, false);
    }
}

// --- HUD vòng cạnh xe + nút Bắn: xe đang điều khiển (α/β) + hồi Chuyển Giao ---
function gmRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    const prov = p => {
        const c = gmTagColor(p.gmTag);
        const name = p.gmTag === 'B' ? 'β BETA' : 'α ALPHA';
        const icon = p.gmTag === 'B' ? '♊β' : '♊α';
        if (p.gmHold > 4 && p.gmHold < GM_HOLD && p.gmSwCd <= 0) return { pct: p.gmHold / GM_HOLD, ready: false, color: '#ffffff', label: '⇄ CHUYỂN GIAO', btnIcon: '⇄' };
        if (p.gmAim > 0) return { pct: p.gmAim / 30, ready: true, color: GM_GOLD, label: '◎ KHOÁ MỤC TIÊU', btnIcon: '◎' };
        if (p.gmBurst > 0) return { pct: p.gmBurst / 60, ready: true, color: GM_GOLD, label: '∞ ĐỆ QUY', btnIcon: icon };
        const max = gmSwCdMax(p);
        if (p.gmSwCd > 0) return { pct: 1 - p.gmSwCd / max, ready: false, color: c, label: name + ' ⇄' + (p.gmSwCd / 60).toFixed(1) + 's', btnIcon: icon };
        return { pct: 1, ready: false, idle: true, color: c, label: name + ' · GIỮ ⇄', btnIcon: icon };
    };
    registerEmpowerHUD('gemini', prov);
    // Lõi bỏ HUD khi HP = 0 -> khi bản thể đang gục vẫn hiện trạng thái Chuyển Giao trên nút Bắn
    if (typeof empowerStateOf === 'function') {
        const base = empowerStateOf;
        // eslint-disable-next-line no-global-assign
        empowerStateOf = function (p) {
            if (p && p.weapon === 'gemini' && p.gmDown) { try { return Object.assign(prov(p), { idle: true }); } catch (e) { return null; } }
            return base(p);
        };
    }
}
if (typeof window !== 'undefined') window.addEventListener('load', gmRegisterHUD);
