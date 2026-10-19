// ==========================================
// Art xe & đạn nhóm "core_small" (registerTankArt / registerBulletArt)
// ------------------------------------------
// Cơ Bản, Tiểu Liên, Ghost, Sniper, Bow, Shadow Hunter, Kẻ Sáng Tạo, Thiên Tài, Shotgun,
// Nhà Ảo Thuật, Mirror, Paradox, Nhà Phát Minh, Tiến Hóa, Tùy Biến.
// Xe vẽ trên lưới 32×32 (−16..16), nòng hướng −y. Đạn vẽ trong hệ +x = hướng bay.
// Chỉ đọc trạng thái để vẽ -> an toàn khi chơi online.
// ==========================================

(() => {
    const PI = Math.PI, TAU = PI * 2;

    // ---------- Tiện ích nội bộ ----------
    const rgba = (hex, a) => {
        const h = hex.replace('#', '');
        const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };
    const poly = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    const circ = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
    const lin = (x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; };
    const rad = (x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; };
    const stroke = (color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(); };
    // Viền màu đội có quầng sáng nhẹ -> nhìn là biết phe
    const teamEdge = (k, w = 1.6, blur = 6) => { TA.glow(k.teamGlow, blur); stroke(k.team, w); TA.noGlow(); };
    // Đèn tròn phát sáng
    const lamp = (x, y, r, color, blur = 6) => {
        TA.glow(color, blur); ctx.fillStyle = color; circ(x, y, r); ctx.fill(); TA.noGlow();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; circ(x - r * 0.25, y - r * 0.25, r * 0.45); ctx.fill();
    };
    // Bánh xích gọn có gân chạy
    const tracks = (x, w, y0, y1, k, body = '#151b26', link = '#3b4556') => TA.treads(x, w, y0, y1, k.t, body, link);
    // Nòng kim loại có vạch đầu nòng màu đội
    const gun = (cx, yStart, len, w, k, body = '#d1d5db') => {
        TA.barrel(cx, yStart, len, w, body, null);
        ctx.fillStyle = k.team; TA.glow(k.teamGlow, 4);
        TA.rr(cx - w / 2 - 0.4, yStart - len, w + 0.8, 1.8, 0.6); ctx.fill(); TA.noGlow();
    };
    // Bánh răng (n răng)
    const gear = (x, y, r, n, rot, fill, edge) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.beginPath();
        for (let i = 0; i < n * 2; i++) {
            const a0 = (i / (n * 2)) * TAU, a1 = ((i + 1) / (n * 2)) * TAU;
            const rr = i % 2 ? r * 0.78 : r;
            ctx.arc(0, 0, rr, a0, a1);
        }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        if (edge) stroke(edge, 0.8);
        ctx.restore();
    };
    const star = (x, y, r, n = 5, inner = 0.45) => {
        ctx.beginPath();
        for (let i = 0; i < n * 2; i++) {
            const a = -PI / 2 + i * PI / n, rr = i % 2 ? r * inner : r;
            ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        ctx.closePath();
    };

    // ---------- Đạn: tiện ích ----------
    // Sao chổi: đuôi gradient + đầu sáng + lõi trắng
    const comet = (len, r, head, tail, opts = {}) => {
        const g = ctx.createLinearGradient(-len, 0, 0, 0);
        g.addColorStop(0, rgba(tail, 0)); g.addColorStop(0.6, rgba(tail, 0.45)); g.addColorStop(1, rgba(tail, 0.95));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-len, 0);
        ctx.quadraticCurveTo(-len * 0.4, -r * 1.05, 0, -r); ctx.lineTo(0, r);
        ctx.quadraticCurveTo(-len * 0.4, r * 1.05, -len, 0); ctx.fill();
        ctx.shadowBlur = opts.blur || 10; ctx.shadowColor = opts.glow || head;
        ctx.fillStyle = head; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r, 0, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = opts.core || '#ffffff';
        ctx.beginPath(); ctx.ellipse(r * 0.25, 0, r * 0.65, r * 0.5, 0, 0, TAU); ctx.fill();
    };
    const tailLen = (k, base = 8, mul = 2.4, max = 34) => Math.min(max, base + k.sp * mul);

    // Vẽ art của một xe tại vị trí khác (bóng, bản sao, phân ảnh). Trả về false nếu xe chưa có art.
    window.coreSmallArtAt = function (p, x, y, alpha = 1, tint = null) {
        if (typeof TANK_ART === 'undefined' || !TANK_ART[p.weapon]) return false;
        const ox = p.x, oy = p.y;
        p.x = x; p.y = y;
        ctx.save();
        ctx.globalAlpha *= alpha;
        try { drawTankArt(p, tint || p.color); } finally { p.x = ox; p.y = oy; ctx.restore(); }
        return true;
    };

    // =====================================================================
    // 1. CƠ BẢN (basic) — thân vuông trơn, tháp tròn, nòng chuẩn
    // =====================================================================
    registerTankArt('basic', (p, k) => {
        tracks(-15, 5.5, -14, 15, k);
        // Thân
        ctx.fillStyle = TA.metal(-11, 11, '#3f4754', '#9aa3b0');
        TA.rr(-10.5, -12, 21, 25, 4); ctx.fill(); teamEdge(k);
        // Mặt vát trước + vạch sau
        ctx.fillStyle = 'rgba(255,255,255,0.14)'; poly([[-9, -11], [9, -11], [7, -7], [-7, -7]]); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; TA.rr(-7, 9, 14, 2.4, 1); ctx.fill();
        // Evo 1: giáp hông dày
        if (k.evo1) {
            ['l', 'r'].forEach(sd => {
                const x = sd === 'l' ? -16 : 12;
                ctx.fillStyle = TA.metal(x, x + 4, '#4b5563', '#cbd5e1');
                TA.rr(x, -9, 4, 18, 1.5); ctx.fill(); stroke('#1f2937', 0.8);
                ctx.fillStyle = k.team; ctx.fillRect(x + 1.2, -5, 1.6, 10);
            });
        }
        // Nòng
        gun(0, -5, 11, k.evo1 ? 5.4 : 4.4, k);
        if (k.evo1) { ctx.fillStyle = '#6b7280'; TA.rr(-3.6, -12, 7.2, 2.2, 0.8); ctx.fill(); }
        // Tháp pháo
        ctx.fillStyle = rad(-2, 0, 1, 8, ['#d1d5db', '#6b7280', '#374151']);
        circ(0, 2, 7); ctx.fill(); stroke('#1f2937', 1);
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 2, 4.6, 0, TAU); ctx.stroke();
        lamp(0, 2, 1.8, k.team, 8);
        // Evo 2: dấu Thập Tử Nhất Sinh (chữ thập hồi sinh nhấp nháy)
        if (k.evo2) {
            const a = 0.6 + 0.4 * Math.sin(k.t * 4);
            ctx.save(); ctx.globalAlpha *= a; TA.glow('#4ade80', 8); ctx.fillStyle = '#4ade80';
            ctx.fillRect(-1, 7.5, 2, 5.5); ctx.fillRect(-2.8, 9.3, 5.6, 2); ctx.restore(); TA.noGlow();
        }
    });
    registerBulletArt('basic', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive || b.isIce) return false;
        const strong = o.hasUpgrade && o.hasUpgrade('evo_basic_1');
        const r = k.r * (strong ? 1.15 : 1);
        if (strong) { ctx.save(); ctx.globalAlpha *= 0.5; comet(tailLen(k) * 1.35, r * 1.5, color, color, { blur: 4 }); ctx.restore(); }
        comet(tailLen(k), r, color, color, { blur: 12 });
    });

    // =====================================================================
    // 2. TIỂU LIÊN (smg) — thân gầy, 2 nòng song song ngắn, trống đạn đồng
    // =====================================================================
    registerTankArt('smg', (p, k) => {
        tracks(-11.5, 4, -9, 14, k, '#1c1917', '#57534e');
        // Thân gầy
        ctx.fillStyle = TA.metal(-7.5, 7.5, '#6b3d12', '#e0b053');
        TA.rr(-7.5, -9, 15, 22, 3.5); ctx.fill(); teamEdge(k, 1.8);
        // Khe tản nhiệt
        ctx.fillStyle = 'rgba(40,20,5,0.55)';
        for (let i = 0; i < 3; i++) TA.rr(-5, -5 + i * 2.6, 10, 1.4, 0.7), ctx.fill();
        // 2 nòng ngắn (rung khi đang sấy)
        const spray = p.smgSprayCount || 0;
        const jit = spray > 0 ? Math.sin(k.t * 90) * 0.5 : 0;
        const heat = (k.evo1 ? Math.min(1, spray / 12) : 0);
        [-2.9, 2.9].forEach(x => {
            gun(x + jit, -8, 8, 3, k, '#e5c07b');
            if (heat > 0) { ctx.fillStyle = rgba('#ff7a18', 0.25 + heat * 0.6); TA.glow('#ff7a18', 6 * heat); TA.rr(x + jit - 1.5, -14, 3, 5, 1); ctx.fill(); TA.noGlow(); }
        });
        ctx.fillStyle = '#3f2a10'; TA.rr(-5, -9.5, 10, 2.5, 1); ctx.fill();
        // Trống đạn (Evo 2: trống lớn)
        const R = k.evo2 ? 5.6 : 4.4;
        ctx.fillStyle = rad(-1, 5, 0.5, R, ['#fde68a', '#b7791f', '#5b3a0e']);
        circ(0, 6, R); ctx.fill(); stroke('#2a1a06', 0.9);
        ctx.save(); ctx.translate(0, 6); ctx.rotate(-k.t * (spray > 0 ? 14 : 1));
        ctx.strokeStyle = 'rgba(60,35,5,0.8)'; ctx.lineWidth = 1;
        for (let i = 0; i < (k.evo2 ? 8 : 6); i++) { ctx.rotate(TAU / (k.evo2 ? 8 : 6)); ctx.beginPath(); ctx.moveTo(R * 0.4, 0); ctx.lineTo(R * 0.92, 0); ctx.stroke(); }
        ctx.restore();
        lamp(0, 6, 1.6, k.team, 7);
    });
    registerBulletArt('smg', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const r = Math.max(2, k.r * 0.95);
        if (b.w > 5.4) {
            // Hỏa Lực +++ (sấy lâu): đạn vạch đỏ cam nóng rực, dài dần theo cỡ đạn
            const L = tailLen(k, 12, 2.6, 36);
            ctx.strokeStyle = 'rgba(255,90,20,0.35)'; ctx.lineWidth = r * 2.6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-L * 0.8, 0); ctx.lineTo(0, 0); ctx.stroke();
            comet(L, r, '#ff8c42', '#ff3d00', { glow: '#ff5500', core: '#fff1c1', blur: 14 });
            ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.6, r * 1.25, 0, 0, TAU); ctx.stroke();
            return;
        }
        comet(tailLen(k, 6, 2.2, 26), r, '#ffd166', color, { glow: '#ffb703', core: '#fff7d6', blur: 9 });
        // Tia lửa đầu đạn
        ctx.strokeStyle = 'rgba(255,214,102,0.7)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(-r * 1.2, -r * 1.3); ctx.lineTo(-r * 3, -r * 2); ctx.moveTo(-r * 1.2, r * 1.3); ctx.lineTo(-r * 3, r * 2); ctx.stroke();
    });

    // =====================================================================
    // 3. GHOST (ghost) — thân dẹt hình giọt nước, không tháp pháo, đuôi khói
    // =====================================================================
    const ghostShape = () => {
        ctx.beginPath();
        ctx.moveTo(0, -15.5);
        ctx.bezierCurveTo(5, -10, 11.5, -2, 11.5, 4.5);
        ctx.bezierCurveTo(11.5, 11, 6, 13.5, 0, 13.5);
        ctx.bezierCurveTo(-6, 13.5, -11.5, 11, -11.5, 4.5);
        ctx.bezierCurveTo(-11.5, -2, -5, -10, 0, -15.5);
        ctx.closePath();
    };
    registerTankArt('ghost', (p, k) => {
        const stealth = !!p.isGhostActive;
        const cold = '#7dd3fc';
        // Đuôi khói lượn phía sau
        ctx.save(); ctx.globalAlpha *= stealth ? 0.35 : 0.5;
        for (let i = -1; i <= 1; i++) {
            const w = Math.sin(k.t * 6 + i * 1.7) * 1.6;
            ctx.fillStyle = rgba(stealth ? cold : '#cbd5e1', 0.7);
            ctx.beginPath(); ctx.moveTo(i * 5 - 2.4, 10); ctx.quadraticCurveTo(i * 5 + w, 15.8, i * 5 + w * 1.4, 15.8);
            ctx.quadraticCurveTo(i * 5 + w + 1.5, 13, i * 5 + 2.4, 10); ctx.fill();
        }
        ctx.restore();
        // Thân
        ctx.save();
        if (stealth) ctx.globalAlpha *= 0.6;
        ctx.fillStyle = lin(0, -15, 0, 14, ['#e2e8f0', '#94a3b8', '#475569']);
        ghostShape(); ctx.fill();
        if (stealth) { TA.glow(cold, 10); ctx.setLineDash([3, 2]); ctx.lineDashOffset = -k.t * 12; stroke(cold, 1.8); ctx.setLineDash([]); TA.noGlow(); }
        else teamEdge(k, 1.7);
        // Ánh bóng
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath(); ctx.ellipse(-3.5, -3, 3, 7, -0.35, 0, TAU); ctx.fill();
        // Khe phát xạ phía trước + 2 mắt
        ctx.fillStyle = '#0f172a'; TA.rr(-1.6, -14, 3.2, 7, 1.5); ctx.fill();
        lamp(0, -10.5, 1.3, stealth ? cold : k.team, 8);
        [-4.6, 4.6].forEach(x => {
            TA.glow(stealth ? cold : k.team, 8); ctx.fillStyle = stealth ? cold : k.team;
            ctx.beginPath(); ctx.ellipse(x, -1, 2.2, 1.2, x < 0 ? 0.5 : -0.5, 0, TAU); ctx.fill(); TA.noGlow();
        });
        // Evo 1: vân ectoplasm; Evo 2: lõi Hư Ảnh
        if (k.evo1) { ctx.strokeStyle = rgba(cold, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 5, 6.5, PI * 0.15, PI * 0.85); ctx.stroke(); }
        if (k.evo2) { ctx.fillStyle = rad(0, 6, 0, 3.4, ['#ffffff', rgba(cold, 0.8), rgba(cold, 0)]); circ(0, 6, 3.4); ctx.fill(); }
        ctx.restore();
    });
    registerBulletArt('ghost', (b, color, o, k) => {
        const cold = '#7dd3fc';
        const L = tailLen(k, 10, 2, 30), r = k.r * 0.95;
        if (b.isFlicker) {
            // ĐÒN VÔ ẢNH (cường hóa): mũi kim hồn ma xuyên thấu + các vòng sóng lạnh lan dần
            ctx.save(); ctx.globalAlpha *= 0.85;
            const ph = (k.t / 160) % 1;
            for (let i = 0; i < 2; i++) {
                const q = (ph + i * 0.5) % 1;
                ctx.strokeStyle = rgba(cold, 0.6 * (1 - q)); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.ellipse(-q * 14, 0, 1.5 + q * 2, 3 + q * 4, 0, 0, TAU); ctx.stroke();
            }
            ctx.fillStyle = lin(-L, 0, 0, 0, [rgba(cold, 0), rgba(cold, 0.5)]);
            ctx.beginPath(); ctx.moveTo(-L, 0);
            for (let i = 0; i <= 8; i++) { const x = -L + L * i / 8; ctx.lineTo(x, -r * 0.9 * (i / 8) + Math.sin(k.t / 30 + i) * 0.6); }
            for (let i = 8; i >= 0; i--) { const x = -L + L * i / 8; ctx.lineTo(x, r * 0.9 * (i / 8) + Math.sin(k.t / 30 + i + 2) * 0.6); }
            ctx.fill();
            ctx.shadowBlur = 14; ctx.shadowColor = cold;
            ctx.fillStyle = lin(-6, 0, 9, 0, ['#e0f2fe', '#ffffff']);
            poly([[9, 0], [0, -r * 1.1], [-6, 0], [0, r * 1.1]]); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = color; poly([[4, 0], [0, -r * 0.45], [-2.5, 0], [0, r * 0.45]]); ctx.fill();
            ctx.restore();
            return;
        }
        ctx.save(); ctx.globalAlpha *= b.isFlicker ? 0.75 : 0.6;
        // Đuôi khói dạng sóng
        ctx.strokeStyle = rgba(b.isFlicker ? cold : '#e2e8f0', 0.55); ctx.lineWidth = r * 1.2; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) { const x = -L * i / 10; ctx.lineTo(x, Math.sin(k.t / 45 + i * 0.9) * r * 0.7 * (i / 10)); }
        ctx.stroke();
        comet(L * 0.55, r, b.isFlicker ? '#bae6fd' : '#cbd5e1', b.isFlicker ? cold : color, { glow: b.isFlicker ? cold : '#e2e8f0', blur: 12 });
        ctx.restore();
    });

    // =====================================================================
    // 4. SNIPER (sniper) — thân dài hẹp, nòng dài, ống kính lớn
    // =====================================================================
    registerTankArt('sniper', (p, k) => {
        tracks(-10, 3.5, -6, 15, k);
        // Chân chống (bipod) hai bên đầu
        ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(-8, -9); ctx.moveTo(3, -4); ctx.lineTo(8, -9); ctx.stroke();
        // Thân dài hẹp
        ctx.fillStyle = TA.metal(-6, 6, '#2b313b', '#8f99a8');
        TA.rr(-6, -7, 12, 22, 2.5); ctx.fill(); teamEdge(k, 1.6);
        // Viền đỏ đặc trưng
        ctx.fillStyle = '#dc2626'; ctx.fillRect(-4.6, -3, 1.4, 14); ctx.fillRect(3.2, -3, 1.4, 14);
        // Evo 1 Tường Thép: tấm giáp lục giác phía sau
        if (k.evo1) {
            ctx.fillStyle = '#94a3b8';
            poly([[-3, 9], [0, 7.4], [3, 9], [3, 12.4], [0, 14], [-3, 12.4]]); ctx.fill(); stroke('#1f2937', 0.8);
        }
        // Nòng + ống ngắm xoay theo hướng ngắm thật
        ctx.save();
        const aimA = (typeof sniperAimAngle === 'function') ? sniperAimAngle(p) : null;
        if (aimA !== null) { // góc lệch so với hướng thẳng (cùng công thức với tia ngắm & viên đạn)
            const dx = Math.cos(aimA), dy = Math.abs(Math.sin(aimA));
            ctx.translate(0, -2); ctx.rotate(Math.atan2(dx, dy)); ctx.translate(0, 2);
        }
        // Nòng dài + hãm nòng
        gun(0, -5, 11, 2.4, k, '#e5e7eb');
        ctx.fillStyle = '#374151'; TA.rr(-2.2, -14.5, 4.4, 2.6, 0.8); ctx.fill();
        // Evo 2 Raycast: cuộn năng lượng trên nòng
        if (k.evo2) {
            const a = 0.6 + 0.4 * Math.sin(k.t * 8);
            TA.glow('#22d3ee', 6); ctx.fillStyle = rgba('#22d3ee', a);
            ctx.fillRect(-1.9, -9.5, 3.8, 1.3); ctx.fillRect(-1.9, -7, 3.8, 1.3); TA.noGlow();
        }
        // Ống ngắm lớn với ống kính phát sáng
        ctx.fillStyle = TA.metal(1.2, 6.4, '#1f2937', '#6b7280');
        TA.rr(1.6, -9, 4.6, 12, 2); ctx.fill(); stroke('#111827', 0.8);
        ctx.fillStyle = '#111827'; circ(3.9, -9.5, 3.1); ctx.fill();
        ctx.fillStyle = rad(3.4, -10, 0.2, 2.6, ['#ffffff', k.team, '#dc2626']);
        TA.glow('#ef4444', 8); circ(3.9, -9.5, 2.4); ctx.fill(); TA.noGlow();
        ctx.restore();
        // Đèn sau
        lamp(-2.5, 12.5, 1.2, k.team, 6);
    });
    registerBulletArt('sniper', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const ray = !!b.isRaycast;
        const L = ray ? 46 : 24, w = ray ? 3.6 : 2.2;
        ctx.lineCap = 'round';
        // Quầng màu đội rất mờ để biết phe
        ctx.strokeStyle = rgba(color, 0.35); ctx.lineWidth = w * 3;
        ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(2, 0); ctx.stroke();
        ctx.shadowBlur = 14; ctx.shadowColor = '#ff2a2a';
        const g = ctx.createLinearGradient(-L, 0, 3, 0);
        g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(0.5, 'rgba(255,40,40,0.8)'); g.addColorStop(1, '#ff4d4d');
        ctx.strokeStyle = g; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(3, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, w * 0.4);
        ctx.beginPath(); ctx.moveTo(-L * 0.55, 0); ctx.lineTo(3, 0); ctx.stroke();
        ctx.fillStyle = '#ffffff'; circ(3, 0, w * 0.7); ctx.fill();
        if (ray) { // Tia Raycast: các vòng nén khí
            ctx.strokeStyle = 'rgba(255,200,200,0.6)'; ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(-i * 9, 0, 1.6, w * 1.6, 0, 0, TAU); ctx.stroke(); }
        }
    });


    // 5. BOW (cung): đã có art riêng trên nhánh chính -> không vẽ ở đây

    // =====================================================================
    // 6. SHADOW HUNTER (shadow_hunter) — thân nhọn bóng đêm, 2 vệt mờ phía sau
    // =====================================================================
    registerTankArt('shadow_hunter', (p, k) => {
        const on = !!p.stealthActive;
        // 2 vệt mờ phía sau
        ctx.save();
        for (const sx of [-1, 1]) {
            const f = 0.5 + 0.5 * Math.sin(k.t * 7 + sx);
            ctx.globalAlpha = (on ? 0.55 : 0.35) * (0.6 + 0.4 * f);
            ctx.fillStyle = lin(0, 6, 0, 16, ['rgba(124,58,237,0.9)', 'rgba(124,58,237,0)']);
            poly([[sx * 3, 8], [sx * 8.5, 7], [sx * (10 + f), 16], [sx * 5, 16]]); ctx.fill();
        }
        ctx.restore();
        // Thân chữ V nhọn
        const body = [[0, -15.5], [4.5, -6], [10.5, 6], [6.5, 13], [0, 9], [-6.5, 13], [-10.5, 6], [-4.5, -6]];
        ctx.fillStyle = lin(0, -15, 0, 13, ['#4c1d95', '#2a1250', '#120822']);
        poly(body); ctx.fill();
        TA.glow(on ? '#a855f7' : '#5b21b6', on ? 12 : 5); stroke('#6d28d9', 1.8); TA.noGlow();
        // Gờ sống lưng & cánh
        ctx.fillStyle = 'rgba(167,139,250,0.22)'; poly([[0, -14], [3.5, -5], [0, 6], [-3.5, -5]]); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 5);
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 5); ctx.stroke(); TA.noGlow();
        // Mắt chém màu đội
        TA.glow(k.team, 8); ctx.fillStyle = k.team;
        poly([[-2.2, -3], [-7.2, 1.2], [-6.4, 2.4], [-1.8, -1]]); ctx.fill();
        poly([[2.2, -3], [7.2, 1.2], [6.4, 2.4], [1.8, -1]]); ctx.fill(); TA.noGlow();
        // Evo 1: vết đỏ trên cánh
        if (k.evo1) {
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.2; TA.glow('#ef4444', 5);
            ctx.beginPath(); ctx.moveTo(-8.6, 6.5); ctx.lineTo(-6, 9.5); ctx.moveTo(8.6, 6.5); ctx.lineTo(6, 9.5); ctx.stroke(); TA.noGlow();
        }
        // Evo 2: lõi Phục Kích
        if (k.evo2) lamp(0, 7, 1.6, '#c084fc', 10);
    });
    registerBulletArt('shadow_hunter', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        if (b.type === 'shadow_empowered') {
            // Cầu bóng đêm cường hóa + vết đỏ xoay
            const R = Math.min(b.w, b.h) / 2;
            ctx.fillStyle = rad(0, 0, R * 0.2, R * 2.2, ['rgba(168,85,247,0.55)', 'rgba(88,28,135,0.3)', 'rgba(88,28,135,0)']);
            circ(0, 0, R * 2.2); ctx.fill();
            ctx.shadowBlur = 16; ctx.shadowColor = '#a855f7';
            ctx.fillStyle = rad(-R * 0.3, -R * 0.3, 0, R, ['#3b0764', '#0b0314']); circ(0, 0, R); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = color; ctx.lineWidth = 1.3; circ(0, 0, R); ctx.stroke();
            ctx.save(); ctx.rotate(k.t / 90);
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.6; ctx.shadowBlur = 6; ctx.shadowColor = '#ef4444';
            for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.moveTo(R * 0.9, -1.4); ctx.lineTo(R * 1.6, 1.4); ctx.stroke(); }
            ctx.restore();
            return;
        }
        // Đạn thường: vệt tối tím, viền sáng tím
        const L = tailLen(k, 10, 2.2, 28), r = k.r;
        ctx.shadowBlur = 10; ctx.shadowColor = '#8b5cf6';
        ctx.fillStyle = lin(-L, 0, r, 0, ['rgba(76,29,149,0)', 'rgba(76,29,149,0.85)', '#1e0b3a']);
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(-L * 0.3, -r * 1.2, r * 1.4, 0); ctx.quadraticCurveTo(-L * 0.3, r * 1.2, -L, 0); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.fillStyle = color; circ(r * 0.3, 0, r * 0.55); ctx.fill();
    });

    // =====================================================================
    // 7. KẺ SÁNG TẠO (creator) — khối vuông, bánh răng nhỏ trên nắp
    // =====================================================================
    registerTankArt('creator', (p, k) => {
        tracks(-12, 3.6, -10, 13, k);
        ctx.fillStyle = TA.metal(-9, 9, '#3a414c', '#8b94a1');
        TA.rr(-9, -10, 18, 22, 2); ctx.fill();
        // Khung đồng
        ctx.strokeStyle = '#b7791f'; ctx.lineWidth = 1.6; TA.rr(-7.6, -8.6, 15.2, 19.2, 1.5); ctx.stroke();
        TA.rr(-9, -10, 18, 22, 2); teamEdge(k, 1.5);
        // Đinh tán góc màu đội
        [[-7, -8], [7, -8], [-7, 10], [7, 10]].forEach(([x, y]) => lamp(x, y, 1.1, k.team, 5));
        // Nòng ngắn
        gun(0, -9.5, 6.5, 4.2, k, '#e2c08a');
        // Bánh răng trên nắp
        gear(0, 2, 6.2, 8, k.t * 1.2, lin(-6, -4, 6, 8, ['#fcd34d', '#b7791f', '#7c4a03']), '#4a2c02');
        ctx.fillStyle = '#1f2937'; circ(0, 2, 2.4); ctx.fill();
        lamp(0, 2, 1.3, k.team, 6);
        // Evo 1: cờ lê bên hông
        if (k.evo1) {
            ctx.save(); ctx.translate(-12.6, -1); ctx.rotate(-0.2);
            ctx.fillStyle = '#cbd5e1'; TA.rr(-0.9, -5, 1.8, 9, 0.8); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -5.5, 2.1, PI * 0.25, PI * 1.75, false); ctx.lineWidth = 1.4; ctx.strokeStyle = '#cbd5e1'; ctx.stroke();
            ctx.restore();
        }
        // Evo 2: ăng-ten Robot Tự Động
        if (k.evo2) {
            ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(6, 9); ctx.lineTo(10.5, 14); ctx.stroke();
            lamp(10.5, 14, 1.4, Math.sin(k.t * 6) > 0 ? '#fbbf24' : k.team, 7);
        }
    });
    registerBulletArt('creator', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const r = Math.max(2.4, k.r);
        // Vệt mờ ngắn
        ctx.fillStyle = lin(-r * 5, 0, 0, 0, [rgba(color, 0), rgba(color, 0.55)]);
        poly([[-r * 5, 0], [0, -r * 0.8], [0, r * 0.8]]); ctx.fill();
        // Cầu đồng có vành răng
        ctx.shadowBlur = 8; ctx.shadowColor = '#f59e0b';
        gear(0, 0, r * 1.35, 6, k.t / 120, '#b7791f', null);
        ctx.shadowBlur = 0;
        ctx.fillStyle = rad(-r * 0.35, -r * 0.35, 0, r, ['#fff3c4', '#e0a93b', '#7c4a03']); circ(0, 0, r); ctx.fill();
        ctx.fillStyle = color; circ(0, 0, r * 0.35); ctx.fill();
    });

    // =====================================================================
    // 8. THIÊN TÀI (genius) — thân gọn, kính cyan, bóng đèn trên nắp; lái Mecha
    // =====================================================================
    const drawMecha = (p, k) => {
        const mode = p.mechaMode || 1;
        const orange = '#ff9800';
        // Chân / bánh xích lớn
        tracks(-15.5, 4.5, -11, 15, k, '#1a1a1a', '#5a4632');
        // Vai & cánh tay
        [-1, 1].forEach(sd => {
            ctx.fillStyle = TA.metal(sd * 9, sd * 15, '#7a3e00', '#ffb74d');
            TA.rr(sd > 0 ? 9 : -15, -6, 6, 12, 2.5); ctx.fill(); stroke('#3a1d00', 0.8);
            // Nắm đấm (mode 4 vươn ra trước)
            const fy = mode === 4 ? -15 + Math.sin(k.t * 10) * 0.8 : -11;
            ctx.fillStyle = '#b45309'; TA.rr(sd > 0 ? 9.5 : -14.5, fy, 5, 5, 1.6); ctx.fill(); stroke(k.team, 0.9);
        });
        // Thân chính
        ctx.fillStyle = lin(0, -10, 0, 12, ['#ffb74d', '#e65100', '#7a2e00']);
        poly([[-8, -9], [8, -9], [10, 0], [7, 12], [-7, 12], [-10, 0]]); ctx.fill(); teamEdge(k, 1.5);
        // Vũ khí theo chế độ
        if (mode === 2) { gun(0, -8, 8, 6.5, k, '#9ca3af'); }
        else if (mode === 3) { gun(-2.4, -8, 8, 2.6, k); gun(2.4, -8, 8, 2.6, k); }
        else if (mode === 5) {
            TA.glow('#00e5ff', 10); ctx.strokeStyle = 'rgba(0,229,255,0.85)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 4, 18, -PI * 0.78, -PI * 0.22); ctx.stroke(); TA.noGlow();
        } else if (mode !== 4) gun(0, -8, 7.5, 3.6, k);
        // Buồng lái kính + bóng đèn của Thiên Tài
        ctx.fillStyle = lin(0, -6, 0, 4, ['#a5f3fc', '#0891b2', '#083344']);
        TA.rr(-4.5, -5.5, 9, 8, 3); ctx.fill(); stroke('#0e7490', 0.8);
        lamp(0, -1.5, 1.7, '#fde047', 8);
        // Lò phản ứng
        lamp(0, 7, 2, orange, 10);
    };
    registerTankArt('genius', (p, k) => {
        if (p.isPilotingMecha) return drawMecha(p, k);
        tracks(-11.5, 3.5, -7, 13, k);
        // Thân gọn bo tròn
        ctx.fillStyle = lin(0, -9, 0, 13, ['#155e75', '#0e3a4a', '#0a2530']);
        TA.rr(-8.5, -9, 17, 22, 6); ctx.fill(); teamEdge(k, 1.6);
        // Nòng mảnh cyan
        gun(0, -8, 8, 2.6, k, '#a5f3fc');
        // Kính cyan phía trước
        ctx.fillStyle = lin(0, -9, 0, -2, ['#cffafe', '#22d3ee', '#0e7490']);
        TA.glow('#22d3ee', 8);
        ctx.beginPath(); ctx.ellipse(0, -4, 6.2, 3.6, 0, PI, TAU); ctx.lineTo(6.2, -3); ctx.ellipse(0, -3, 6.2, 1.2, 0, 0, PI); ctx.closePath(); ctx.fill(); TA.noGlow();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-2.6, -5.6, 1.8, 0.8, -0.3, 0, TAU); ctx.fill();
        // Bóng đèn trên nắp
        const pulse = 0.75 + 0.25 * Math.sin(k.t * 3);
        ctx.fillStyle = '#6b7280'; TA.rr(-1.8, 7, 3.6, 2.6, 0.6); ctx.fill();
        ctx.fillStyle = '#9ca3af'; ctx.fillRect(-1.8, 7.8, 3.6, 0.7);
        TA.glow('#fde047', 10 * pulse);
        ctx.fillStyle = rad(-0.8, 2.6, 0.2, 4, ['#fffbeb', '#fde047', rgba('#f59e0b', pulse)]);
        circ(0, 3.6, 3.7); ctx.fill(); TA.noGlow();
        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(-1.2, 6.6); ctx.lineTo(-1.2, 4); ctx.lineTo(0, 2.8); ctx.lineTo(1.2, 4); ctx.lineTo(1.2, 6.6); ctx.stroke();
        // Evo: mạch điện bên hông
        if (k.evo1 || k.evo2) {
            ctx.strokeStyle = rgba('#22d3ee', 0.85); ctx.lineWidth = 0.9;
            ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-5, 2); ctx.lineTo(-5, 9); ctx.moveTo(7, 0); ctx.lineTo(5, 2); ctx.lineTo(5, 9); ctx.stroke();
        }
        if (k.evo2) { lamp(-6.2, 10.5, 1.1, '#22d3ee', 5); lamp(6.2, 10.5, 1.1, '#22d3ee', 5); }
        lamp(0, 11, 1.1, k.team, 5);
    });
    registerBulletArt('genius', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        if (b.isMechaPunch) {
            // Cú đấm thép: nắm đấm năng lượng + sóng xung kích
            const R = Math.min(b.w, b.h) / 2;
            ctx.strokeStyle = 'rgba(255,152,0,0.55)'; ctx.lineWidth = 2;
            for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(-i * 5, 0, R * (0.7 + i * 0.2), -0.9, 0.9); ctx.stroke(); }
            ctx.shadowBlur = 14; ctx.shadowColor = '#ff6d00';
            ctx.fillStyle = lin(-R, 0, R, 0, ['#7a2e00', '#ff9800', '#ffe0b2']);
            TA.rr(-R * 0.6, -R * 0.6, R * 1.3, R * 1.2, R * 0.35); ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = '#7a2e00'; ctx.lineWidth = 1.2;
            for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(R * 0.25, i * R * 0.32); ctx.lineTo(R * 0.7, i * R * 0.32); ctx.stroke(); }
            return;
        }
        if (o.isPilotingMecha || b.color) {
            // Đạn Mecha: viên plasma cam dạng con nhộng
            const L = Math.max(b.w, b.h), r = Math.min(b.w, b.h) / 2;
            ctx.shadowBlur = 12; ctx.shadowColor = '#ff9800';
            ctx.fillStyle = lin(-L, 0, L / 2, 0, ['rgba(255,152,0,0)', '#ff9800', '#fff3e0']);
            TA.rr(-L, -r, L * 1.5, r * 2, r); ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = color; circ(L * 0.2, 0, r * 0.45); ctx.fill();
            return;
        }
        // Tia cyan nhỏ
        const L = tailLen(k, 10, 1.8, 24);
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(color, 0.45); ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(-L * 0.7, 0); ctx.lineTo(3, 0); ctx.stroke();
        ctx.shadowBlur = 12; ctx.shadowColor = '#22d3ee';
        ctx.strokeStyle = lin(-L, 0, 3, 0, ['rgba(34,211,238,0)', '#22d3ee', '#cffafe']); ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(-L * 0.5, -1.2); ctx.lineTo(-L * 0.25, 1); ctx.lineTo(3.5, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; circ(3.5, 0, 1.4); ctx.fill();
    });

    // =====================================================================
    // 9. SHOTGUN (shotgun) — thân vuông, nòng ngắn to, 2 vòng khóa lớn
    // =====================================================================
    registerTankArt('shotgun', (p, k) => {
        tracks(-14, 4.5, -11, 14, k, '#1c1410', '#5c4433');
        ctx.fillStyle = TA.metal(-10, 10, '#6b2a0d', '#d9692c');
        TA.rr(-9.5, -9, 19, 22, 3); ctx.fill(); teamEdge(k, 1.6);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; TA.rr(-6.5, -6, 13, 16, 2); ctx.fill();
        // Nòng ngắn to + loa nòng
        ctx.fillStyle = TA.metal(-4.5, 4.5, '#292524', '#a8a29e');
        TA.rr(-4.2, -13, 8.4, 9, 1.5); ctx.fill();
        ctx.fillStyle = TA.metal(-6, 6, '#1c1917', '#78716c');
        TA.rr(-5.8, -16, 11.6, 3.6, 1.4); ctx.fill(); stroke(k.team, 1);
        // Họng nòng (5 tia, Evo 1: 6 tia)
        ctx.fillStyle = '#0c0a09';
        const bores = k.evo1 ? [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25] : [-4, -2, 0, 2, 4];
        bores.forEach(x => { circ(x, -14.2, 0.75); ctx.fill(); });
        // 2 vòng khóa lớn hai bên
        [-1, 1].forEach(sd => {
            const x = sd * 9.8, y = 1;
            ctx.fillStyle = '#292524'; circ(x, y, 4.2); ctx.fill();
            ctx.strokeStyle = lin(x - 4, y - 4, x + 4, y + 4, ['#fde68a', '#b45309']); ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(x, y, 3.3, 0, TAU); ctx.stroke();
            lamp(x, y, 1.2, k.team, 6);
        });
        // Băng đạn sau: 2 viên (Evo 2: 4 viên)
        const n = k.evo2 ? 4 : 2;
        for (let i = 0; i < n; i++) {
            const x = (i - (n - 1) / 2) * 3.4;
            ctx.fillStyle = '#b91c1c'; TA.rr(x - 1.2, 6.5, 2.4, 5, 0.8); ctx.fill();
            ctx.fillStyle = '#fbbf24'; ctx.fillRect(x - 1.2, 10, 2.4, 1.5);
        }
    });
    registerBulletArt('shotgun', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const r = Math.max(2, k.r * 0.85);
        ctx.fillStyle = lin(-r * 4, 0, 0, 0, [rgba(color, 0), rgba(color, 0.7)]);
        poly([[-r * 4.2, 0], [0, -r * 0.8], [0, r * 0.8]]); ctx.fill();
        ctx.shadowBlur = 9; ctx.shadowColor = '#facc15';
        ctx.fillStyle = rad(-r * 0.3, -r * 0.3, 0, r, ['#fffbe6', '#facc15', '#b45309']); circ(0, 0, r); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = color; ctx.lineWidth = 0.8; circ(0, 0, r); ctx.stroke();
    });

    // =====================================================================
    // 10. NHÀ ẢO THUẬT (magician) — đầu nhọn, mũ phù thủy nhỏ, áo choàng
    // =====================================================================
    registerTankArt('magician', (p, k) => {
        // Áo choàng bay phía sau
        const wv = Math.sin(k.t * 5) * 1.2;
        ctx.fillStyle = lin(0, 4, 0, 16, ['#3b0764', '#581c87', '#2e1065']);
        ctx.beginPath(); ctx.moveTo(-9, 4); ctx.lineTo(9, 4);
        ctx.quadraticCurveTo(12, 11, 10 + wv, 15.5); ctx.quadraticCurveTo(5, 13 + wv, 0, 15.5);
        ctx.quadraticCurveTo(-5, 13 - wv, -10 - wv, 15.5); ctx.quadraticCurveTo(-12, 11, -9, 4); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
        // Thân đầu nhọn
        ctx.fillStyle = lin(0, -14, 0, 12, ['#ddd6fe', '#a78bfa', '#5b21b6']);
        poly([[0, -12.5], [7.5, -6], [10, 4], [7, 11], [-7, 11], [-10, 4], [-7.5, -6]]); ctx.fill(); teamEdge(k, 1.6);
        // Đũa phép (nòng) + sao đầu đũa
        ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -13); ctx.stroke();
        ctx.strokeStyle = '#f5f3ff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -11.8); ctx.lineTo(0, -13); ctx.stroke();
        TA.glow(k.team, 10); ctx.fillStyle = '#fef9c3'; star(0, -14, 2.4); ctx.fill(); TA.noGlow();
        ctx.fillStyle = k.team; circ(0, -14, 0.8); ctx.fill();
        // Mũ phù thủy (vành + chóp cong)
        ctx.fillStyle = '#2e1065'; ctx.beginPath(); ctx.ellipse(0, 3.5, 7.2, 3, 0, 0, TAU); ctx.fill(); stroke('#7c3aed', 0.9);
        ctx.fillStyle = lin(-4, 3, 4, -6, ['#1e1035', '#4c1d95']);
        ctx.beginPath(); ctx.moveTo(-4.4, 3.2); ctx.quadraticCurveTo(-2, -2, 1, -5.5); ctx.quadraticCurveTo(3.4, -6.5, 5, -4.6);
        ctx.quadraticCurveTo(2.6, -4.4, 2.2, -2); ctx.quadraticCurveTo(3.5, 1, 4.4, 3.2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = k.team; ctx.beginPath(); ctx.ellipse(0, 2.4, 4.4, 1.2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fde047'; star(-0.6, -0.6, 1.4); ctx.fill();
        // Lấp lánh xoay quanh
        const n = 2 + (k.evo1 ? 1 : 0) + (k.evo2 ? 1 : 0);
        for (let i = 0; i < n; i++) {
            const a = k.t * 2 + i * TAU / n;
            const x = Math.cos(a) * 12.5, y = 1 + Math.sin(a) * 12.5;
            ctx.save(); ctx.globalAlpha *= 0.55 + 0.45 * Math.sin(k.t * 6 + i);
            ctx.fillStyle = i % 2 ? '#f0abfc' : '#e9d5ff'; star(x, y, 1.6, 4, 0.35); ctx.fill(); ctx.restore();
        }
    });
    const magicianBullet = (color, k, faint) => {
        const L = tailLen(k, 10, 2.2, 30), r = Math.max(2, k.r);
        comet(L, r, '#d8b4fe', color, { glow: '#c084fc', core: '#faf5ff', blur: 12 });
        // Sao lấp lánh dọc đuôi
        for (let i = 1; i <= 3; i++) {
            const x = -L * i / 4, y = Math.sin(k.t / 70 + i * 2) * r * 1.6;
            ctx.save(); ctx.globalAlpha *= (faint ? 0.5 : 0.9) * (1 - i / 4.5);
            ctx.fillStyle = i % 2 ? '#f5d0fe' : '#ffffff'; star(x, y, 1.5, 4, 0.35); ctx.fill(); ctx.restore();
        }
    };
    registerBulletArt('magician', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        magicianBullet(color, k, false);
    });

    // =====================================================================
    // 11. MIRROR (mirror) — bề mặt gương bóng, chia đôi đối xứng
    // =====================================================================
    const mirrorHull = [[0, -13], [10.5, -8], [10.5, 9.5], [0, 14], [-10.5, 9.5], [-10.5, -8]];
    registerTankArt('mirror', (p, k) => {
        tracks(-15, 4.5, -12, 14, k);
        // Nửa trái / nửa phải gradient ngược nhau
        ctx.save(); poly(mirrorHull); ctx.clip();
        ctx.fillStyle = lin(-11, -13, 0, 14, ['#f8fafc', '#94a3b8', '#e2e8f0']); ctx.fillRect(-11, -14, 11, 29);
        ctx.fillStyle = lin(11, -13, 0, 14, ['#f8fafc', '#94a3b8', '#e2e8f0']); ctx.fillRect(0, -14, 11, 29);
        // Vệt sáng gương quét qua (đối xứng)
        const sweep = ((k.t * 0.6) % 1) * 30 - 15;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        [-1, 1].forEach(sd => { poly([[sd * 0, sweep - 6], [sd * 11, sweep - 1], [sd * 11, sweep + 1.6], [0, sweep - 3.4]]); ctx.fill(); });
        // Ô kính tam giác
        ctx.strokeStyle = 'rgba(71,85,105,0.45)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(-10.5, -8); ctx.lineTo(0, 1); ctx.lineTo(10.5, -8); ctx.moveTo(-10.5, 9.5); ctx.lineTo(0, 1); ctx.lineTo(10.5, 9.5); ctx.stroke();
        ctx.restore();
        poly(mirrorHull); teamEdge(k, 1.7);
        // Đường trục đối xứng phát sáng
        TA.glow(k.team, 8); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 13); ctx.stroke(); TA.noGlow();
        // Nòng lăng kính
        gun(0, -11, 4, 3.6, k, '#e2e8f0');
        ctx.fillStyle = lin(-2.6, -16, 2.6, -12, ['#e0f2fe', '#7dd3fc', '#f0abfc']);
        TA.glow('#bae6fd', 8); poly([[0, -16], [2.6, -13.5], [0, -11], [-2.6, -13.5]]); ctx.fill(); TA.noGlow();
        lamp(0, 1, 2, k.team, 8);
        // Evo 1: mảnh gương bay hai bên; Evo 2: viền ảnh chiếu hồng
        if (k.evo1) {
            [-1, 1].forEach(sd => {
                const y = Math.sin(k.t * 3 + sd) * 1.5;
                ctx.fillStyle = 'rgba(224,242,254,0.9)'; TA.glow('#7dd3fc', 6);
                poly([[sd * 13.5, -3 + y], [sd * 15.5, 0 + y], [sd * 13.5, 3 + y], [sd * 12.4, 0 + y]]); ctx.fill(); TA.noGlow();
            });
        }
        if (k.evo2) {
            ctx.save(); ctx.globalAlpha *= 0.5 + 0.3 * Math.sin(k.t * 4);
            ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
            ctx.save(); ctx.translate(0, 0.5); ctx.scale(1.1, 1.08); poly(mirrorHull); ctx.restore(); ctx.stroke(); ctx.restore();
        }
    });
    registerBulletArt('mirror', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const clone = typeof b.type === 'string' && b.type.includes('mirror_clone');
        const r = Math.max(2, k.r), L = tailLen(k);
        ctx.save();
        if (clone) ctx.globalAlpha *= 0.75;
        comet(L, r, clone ? '#e0f2fe' : '#f1f5f9', color, { glow: clone ? '#f0abfc' : '#bae6fd', blur: 12 });
        // Viền lăng kính (cyan / hồng) – bản sao đảo thứ tự màu như ảnh soi gương
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = clone ? '#f0abfc' : '#67e8f9'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * 1.2, 0, -PI * 0.9, -PI * 0.1); ctx.stroke();
        ctx.strokeStyle = clone ? '#67e8f9' : '#f0abfc'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * 1.2, 0, PI * 0.1, PI * 0.9); ctx.stroke();
        ctx.restore();
    });

    // =====================================================================
    // 12. PARADOX (paradox) — viền đồng hồ tròn trên nắp
    // =====================================================================
    registerTankArt('paradox', (p, k) => {
        tracks(-15, 5, -13, 14, k);
        ctx.fillStyle = lin(0, -12, 0, 14, ['#1e3a5f', '#0f2440', '#0a1a30']);
        TA.rr(-11, -11, 22, 25, 7); ctx.fill(); teamEdge(k, 1.6);
        gun(0, -9, 7, 4, k, '#bae6fd');
        // Mặt đồng hồ
        const cy = 2;
        ctx.fillStyle = rad(0, cy, 1, 9, ['#e0f2fe', '#7dd3fc', '#0c4a6e']); circ(0, cy, 9); ctx.fill();
        ctx.fillStyle = '#0b1e33'; circ(0, cy, 7.2); ctx.fill();
        TA.glow('#7dd3fc', 6); ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 1.2; circ(0, cy, 7.2); ctx.stroke(); TA.noGlow();
        for (let i = 0; i < 12; i++) {
            const a = i * TAU / 12, r0 = i % 3 ? 5.8 : 5.0;
            ctx.strokeStyle = i % 3 ? 'rgba(186,230,253,0.6)' : '#e0f2fe'; ctx.lineWidth = i % 3 ? 0.6 : 1;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * 6.6, cy + Math.sin(a) * 6.6); ctx.stroke();
        }
        // Kim đồng hồ: tụ lực -> quay ngược nhanh
        const rev = (p.paradoxCharge || 0) > 0;
        const base = rev ? -k.t * 9 : k.t * 0.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(Math.cos(base / 12 - PI / 2) * 3.6, cy + Math.sin(base / 12 - PI / 2) * 3.6); ctx.stroke();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(Math.cos(base - PI / 2) * 5.6, cy + Math.sin(base - PI / 2) * 5.6); ctx.stroke(); TA.noGlow();
        lamp(0, cy, 1.1, k.team, 5);
        // Evo 1: 3 dấu ấn thời gian (sáng theo số ấn trên địch)
        if (k.evo1) {
            for (let i = 0; i < 3; i++) {
                const a = PI * 0.75 + i * PI * 0.25 - PI;
                const lit = (p.enemyTimeMarks || 0) > i;
                lamp(Math.cos(a) * 9.4, cy + Math.sin(a) * 9.4 + 18 * 0, 1.1, lit ? '#f0abfc' : 'rgba(186,230,253,0.4)', lit ? 8 : 0);
            }
        }
        // Evo 2: vòng nghịch đảo quay ngược ngoài viền
        if (k.evo2) {
            ctx.save(); ctx.translate(0, cy); ctx.rotate(-k.t * 1.5);
            ctx.strokeStyle = 'rgba(125,211,252,0.8)'; ctx.lineWidth = 1.2;
            for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 10.6, i * TAU / 3, i * TAU / 3 + 1.2); ctx.stroke(); }
            ctx.restore();
        }
        // Neo thời không đang đặt: biểu tượng neo nhỏ
        if (p.paradoxAnchor) lamp(0, 12, 1.3, '#88aaff', 8);
    });
    registerBulletArt('paradox', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const r = Math.max(2, k.r), gap = 4 + k.sp * 0.9;
        const rewinding = (o.paradoxCharge || 0) > 0;
        // Vệt xanh thời gian khi tua ngược
        if (rewinding) {
            ctx.fillStyle = lin(-gap * 4, 0, 0, 0, ['rgba(34,211,238,0)', 'rgba(34,211,238,0.55)']);
            TA.rr(-gap * 4, -r * 0.7, gap * 4, r * 1.4, r * 0.7); ctx.fill();
        }
        // Bóng ảnh trễ đi sau
        for (let i = 3; i >= 1; i--) {
            ctx.save(); ctx.globalAlpha *= 0.42 / i;
            ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1; circ(-gap * i, 0, r * (1 - i * 0.12)); ctx.stroke();
            ctx.fillStyle = rgba(color, 0.5); ctx.fill(); ctx.restore();
        }
        // Quả cầu chính + vạch đồng hồ
        ctx.shadowBlur = 12; ctx.shadowColor = '#7dd3fc';
        ctx.fillStyle = rad(-r * 0.3, -r * 0.3, 0, r * 1.2, ['#ffffff', '#bae6fd', color]); circ(0, 0, r * 1.2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.save(); ctx.rotate(-k.t / 60);
        ctx.strokeStyle = '#0c4a6e'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.9); ctx.stroke();
        ctx.restore();
    });

    // =====================================================================
    // 13. NHÀ PHÁT MINH (inventor) — ăng-ten, đồ nghề trên nắp, sọc cam
    // =====================================================================
    registerTankArt('inventor', (p, k) => {
        tracks(-15, 5, -13, 14, k);
        ctx.fillStyle = TA.metal(-11, 11, '#5b6472', '#e5e7eb');
        TA.rr(-10.5, -11, 21, 24, 4); ctx.fill(); teamEdge(k, 1.6);
        // Sọc cam cảnh báo phía sau
        ctx.save(); TA.rr(-9, 7.5, 18, 4, 1.4); ctx.clip();
        ctx.fillStyle = '#1f2937'; ctx.fillRect(-9, 7.5, 18, 4);
        ctx.fillStyle = '#f97316'; for (let x = -12; x < 10; x += 4) { poly([[x, 11.5], [x + 2, 7.5], [x + 4, 7.5], [x + 2, 11.5]]); ctx.fill(); }
        ctx.restore();
        // Nòng
        gun(0, -8, 8, 4, k, '#fdba74');
        ctx.fillStyle = '#f97316'; TA.rr(-3, -10.5, 6, 2, 0.8); ctx.fill();
        // Tháp nhỏ
        ctx.fillStyle = rad(-1, -2, 0.5, 6, ['#f3f4f6', '#9ca3af', '#4b5563']); TA.rr(-5, -7, 10, 9, 3); ctx.fill(); stroke('#374151', 0.8);
        lamp(0, -2.5, 1.5, k.team, 7);
        // Cờ lê trên nắp
        ctx.save(); ctx.translate(-6, 3); ctx.rotate(0.6);
        ctx.fillStyle = '#d1d5db'; TA.rr(-0.9, -3.2, 1.8, 7, 0.8); ctx.fill();
        ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, -4, 1.8, PI * 0.3, PI * 1.7); ctx.stroke();
        ctx.restore();
        // Bánh răng nhỏ
        gear(5.5, 3.5, 2.8, 6, k.t, '#f97316', '#7c2d12');
        // Ăng-ten + đèn nháy
        ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(12.5, -14.5); ctx.stroke();
        lamp(12.5, -14.5, 1.3, Math.sin(k.t * 5) > 0 ? '#f97316' : k.team, 7);
        if (k.evo1) {
            ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-12, -13); ctx.strokeStyle = '#9ca3af'; ctx.stroke();
            lamp(-12, -13, 1.1, '#00ffcc', 6);
        }
        // Evo 2: bệ đỗ drone kép
        if (k.evo2) {
            ctx.strokeStyle = 'rgba(0,255,204,0.7)'; ctx.lineWidth = 0.8;
            [-6.5, 6.5].forEach(x => { circ(x, -9.5 + 0 * x, 0); });
            ctx.beginPath(); ctx.arc(-13, 4, 2.2, 0, TAU); ctx.moveTo(15.2, 4); ctx.arc(13, 4, 2.2, 0, TAU); ctx.stroke();
        }
    });
    registerBulletArt('inventor', (b, color, o, k) => {
        if (b.isRocket) return false;
        const r = Math.max(2, k.r);
        const tint = b.tangCuongBurn ? '#f97316' : (b.tangCuongSlow ? '#67e8f9' : '#fb923c');
        comet(tailLen(k), r, '#e5e7eb', tint, { glow: tint, core: '#ffffff', blur: 10 });
        ctx.fillStyle = color; circ(r * 0.25, 0, r * 0.38); ctx.fill();
        if (b.isExplosive) {
            ctx.strokeStyle = 'rgba(255,90,60,0.85)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, r * 2.2, k.t / 100, k.t / 100 + 4); ctx.stroke();
        }
        if (b.isPiercing) {
            ctx.fillStyle = '#ffffff'; poly([[r * 3, 0], [r, -r * 0.7], [r, r * 0.7]]); ctx.fill();
        }
    });

    // =====================================================================
    // 14. TIẾN HÓA (evolution) — lõi sinh học, giáp mọc thêm theo tiến hóa
    // =====================================================================
    // Vị trí các mảnh giáp theo thứ tự mọc (góc, bán kính, cỡ)
    const EVO_PLATES = [
        [-PI / 2 - 0.55, 10.5, 1], [-PI / 2 + 0.55, 10.5, 1],
        [PI, 11, 1.1], [0, 11, 1.1],
        [PI / 2 + 0.6, 10.8, 1], [PI / 2 - 0.6, 10.8, 1],
        [PI + 0.6, 12, 0.9], [-0.6, 12, 0.9],
        [PI - 0.65, 12.4, 0.9], [0.65, 12.4, 0.9],
        [PI / 2, 12.2, 1], [-PI / 2 - 1.2, 12.4, 0.85], [-PI / 2 + 1.2, 12.4, 0.85],
    ];
    const evoGrowth = (p) => {
        const b = p.evolutionPermanentBonus || {};
        return (b.hp || 0) * 2 + (b.dmg || 0) * 8 + (b.ammo || 0) * 2 + (b.speed || 0) * 10;
    };
    registerTankArt('evolution', (p, k) => {
        const g = evoGrowth(p);
        const plates = Math.min(EVO_PLATES.length, 2 + Math.floor(g / 1.5) + (k.evo1 ? 2 : 0) + (k.evo2 ? 2 : 0));
        // Thân sinh học co bóp
        ctx.beginPath();
        for (let i = 0; i <= 28; i++) {
            const a = i / 28 * TAU;
            const r = 10.2 + Math.sin(a * 5 + k.t * 3) * 0.5;
            ctx.lineTo(Math.cos(a) * r, 1 + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = rad(-2, -1, 1, 11, ['#bbf7d0', '#4ade80', '#166534']); ctx.fill(); teamEdge(k, 1.5);
        // Nòng dạng đốt xương
        gun(0, -7, 9, 4.4, k, '#d9f99d');
        ctx.fillStyle = 'rgba(54,83,20,0.8)'; [-10, -13].forEach(y => ctx.fillRect(-2.6, y, 5.2, 1));
        // Mảnh giáp mọc dần
        for (let i = 0; i < plates; i++) {
            const [a, r, s] = EVO_PLATES[i];
            ctx.save(); ctx.translate(Math.cos(a) * r * 0.92, 1 + Math.sin(a) * r * 0.92); ctx.rotate(a + PI / 2); ctx.scale(s, s);
            ctx.fillStyle = lin(0, -3, 0, 3, ['#f0fdf4', '#86efac', '#15803d']);
            poly([[-3.4, 1.6], [-2.4, -2], [0, -3], [2.4, -2], [3.4, 1.6], [0, 2.8]]); ctx.fill();
            stroke('#14532d', 0.9);
            if (k.evo2) { ctx.fillStyle = '#ecfccb'; poly([[-0.8, -2.6], [0, -4.6], [0.8, -2.6]]); ctx.fill(); }
            ctx.restore();
        }
        // Nhân tế bào (màu đội) + chuỗi xoắn
        const pul = 1 + Math.sin(k.t * 4) * 0.12;
        ctx.fillStyle = rad(0, 2, 0.5, 5 * pul, ['#ffffff', k.team, rgba(k.team, 0)]); circ(0, 2, 5 * pul); ctx.fill();
        ctx.strokeStyle = 'rgba(240,253,244,0.8)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); for (let y = -2; y <= 6; y += 0.5) ctx.lineTo(Math.sin(y * 1.4 + k.t * 3) * 2, y); ctx.stroke();
        ctx.beginPath(); for (let y = -2; y <= 6; y += 0.5) ctx.lineTo(-Math.sin(y * 1.4 + k.t * 3) * 2, y); ctx.stroke();
    });
    registerBulletArt('evolution', (b, color, o, k) => {
        if (b.isRocket || b.isExplosive) return false;
        const evolved = (o.hasUpgrade && (o.hasUpgrade('evo_evo_1') || o.hasUpgrade('evo_evo_2'))) || evoGrowth(o) > 0;
        const c = evolved ? '#4ade80' : '#f8fafc';
        const r = Math.max(2.4, k.r);
        // Bào tử nhỏ phía sau
        for (let i = 1; i <= 3; i++) {
            ctx.fillStyle = rgba(evolved ? '#86efac' : '#e2e8f0', 0.5 - i * 0.12);
            circ(-i * (3 + k.sp * 0.5), Math.sin(k.t / 80 + i) * 1.5, r * (0.6 - i * 0.12)); ctx.fill();
        }
        ctx.fillStyle = rad(0, 0, r * 0.3, r * 2.2, [rgba(c, 0.5), rgba(c, 0)]); circ(0, 0, r * 2.2); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = c;
        ctx.fillStyle = rad(-r * 0.3, -r * 0.3, 0, r, ['#ffffff', c, evolved ? '#15803d' : '#94a3b8']); circ(0, 0, r); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = color; ctx.lineWidth = 0.9; circ(0, 0, r); ctx.stroke();
    });

    // =====================================================================
    // 15. TÙY BIẾN (customize) — thân lắp ghép từ khối vuông, mô-đun theo lựa chọn
    // =====================================================================
    const CU_TRAIT_COL = { explosive: '#f97316', piercing: '#a855f7', hitscan: '#ef4444', homing: '#22d3ee', sticky: '#eab308', bounce: '#84cc16' };
    const cuTraitColor = (t) => CU_TRAIT_COL[t] || ((typeof ZONE_STYLE !== 'undefined' && ZONE_STYLE[t.slice(3)]) || [0, '#ffffff'])[1];
    registerTankArt('customize', (p, k) => {
        const d = p.cuData || { fire: 'tap', bullet: 'round', traits: {}, passive: null };
        // Bánh xích dạng khối
        [-15.5, 11].forEach(x => {
            for (let i = 0; i < 6; i++) {
                const y = -12 + i * 4.6 + ((k.t * 8) % 4.6) * 0;
                ctx.fillStyle = i % 2 ? '#1f2937' : '#273244'; TA.rr(x, y, 4.5, 4, 1); ctx.fill();
            }
        });
        // Lưới khối 3×3
        const traits = (Array.isArray(d.traits) ? d.traits : Object.keys(d.traits || {})).slice(0, 6);
        const order = [6, 8, 3, 5, 0, 2]; // ô nhận mô-đun tính chất
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c, x = -10.5 + c * 7, y = -10 + r * 7.5;
            const ti = order.indexOf(idx);
            const col = ti >= 0 && traits[ti] ? cuTraitColor(traits[ti]) : null;
            ctx.fillStyle = col ? lin(x, y, x + 6.6, y + 7, ['#f8fafc', col]) : ((r + c) % 2 ? TA.metal(x, x + 6.6, '#6b7280', '#d1d5db') : TA.metal(x, x + 6.6, '#9ca3af', '#f3f4f6'));
            TA.rr(x, y, 6.6, 7.1, 1.4); ctx.fill(); stroke('#1f2937', 0.6);
            if (col) { TA.glow(col, 5); ctx.fillStyle = col; circ(x + 3.3, y + 3.55, 1.2); ctx.fill(); TA.noGlow(); }
        }
        TA.rr(-11, -10.5, 22, 23.5, 2.5); teamEdge(k, 1.5);
        // Lõi trung tâm (nội tại Full Evo: hình thoi sáng)
        if (d.passive) { TA.glow(k.team, 10); ctx.fillStyle = '#ffffff'; poly([[0, -1], [2.6, 1.75], [0, 4.5], [-2.6, 1.75]]); ctx.fill(); TA.noGlow(); }
        lamp(0, 1.75, 1.5, k.team, 7);
        // Mô-đun Lối Bắn
        const tipCol = { round: '#ffffff', laser: '#22d3ee', sword: '#e2e8f0', cannon: '#f97316' }[d.bullet] || '#ffffff';
        const bw = d.bullet === 'cannon' ? 5.6 : (d.bullet === 'laser' ? 2.6 : 3.8);
        const tip = (x, y, w) => { ctx.fillStyle = tipCol; TA.glow(tipCol, 6); TA.rr(x - w / 2 - 0.3, y, w + 0.6, 1.8, 0.6); ctx.fill(); TA.noGlow(); };
        if (d.fire === 'shotgun') {
            [-0.35, 0, 0.35].forEach(a => { ctx.save(); ctx.translate(0, -10); ctx.rotate(a); TA.barrel(0, 0, 5.5, 3, '#d1d5db'); tip(0, -5.5, 3); ctx.restore(); });
        } else if (d.fire === 'smg') {
            [-2.4, 2.4].forEach(x => { TA.barrel(x, -10, 6, 2.6, '#d1d5db'); tip(x, -16, 2.6); });
        } else if (d.fire === 'charge') {
            TA.barrel(0, -10, 6, bw + 1, '#d1d5db'); tip(0, -16, bw + 1);
            const c = Math.min(1, (p.cuCharge || 0) / 90);
            ctx.strokeStyle = rgba('#fbbf24', 0.4 + c * 0.6); ctx.lineWidth = 1.2; TA.glow('#fbbf24', 8 * c);
            ctx.beginPath(); ctx.ellipse(0, -12, bw * 0.9 + 1, 1.2, 0, 0, TAU); ctx.stroke(); TA.noGlow();
        } else if (d.fire === 'burst') {
            // Loạt Đạn: nòng có 3 khoang nạp xếp chồng
            TA.barrel(0, -10, 6, bw + 0.6, '#d1d5db'); tip(0, -16, bw + 0.6);
            for (let i = 0; i < 3; i++) { ctx.fillStyle = i === Math.floor(k.t * 6) % 3 ? k.team : '#4b5563'; TA.rr(-bw / 2 - 1.4, -14.5 + i * 1.9, bw + 2.8, 1.1, 0.5); ctx.fill(); }
        } else if (d.fire === 'ram') {
            ctx.fillStyle = TA.metal(-9, 9, '#4b5563', '#e5e7eb');
            poly([[-9, -10], [9, -10], [3, -15.5], [-3, -15.5]]); ctx.fill(); stroke('#1f2937', 0.8);
            ctx.fillStyle = k.team; poly([[-2.5, -15.5], [2.5, -15.5], [0, -13]]); ctx.fill();
        } else { TA.barrel(0, -10, 6, bw, '#d1d5db'); tip(0, -16, bw); }
    });
    registerBulletArt('customize', () => false); // đạn Tùy Biến vẽ qua BulletHooks bên dưới
    if (typeof BulletHooks !== 'undefined' && BulletHooks.registry && BulletHooks.registry.customize) {
        BulletHooks.registry.customize.draw = function (b) {
            const o = b.owner || {};
            const team = o.id === 1 ? '#3498db' : '#e74c3c';
            const d = o.cuData;
            // Màu do người chơi lắp: theo tính chất đầu tiên, mặc định trắng
            const tk = d && d.traits ? (Array.isArray(d.traits) ? d.traits : Object.keys(d.traits)) : [];
            const pick = b.cuCrit ? '#facc15' : (tk[0] ? cuTraitColor(tk[0]) : '#ffffff');
            const sp = Math.hypot(b.vx || 0, b.vy || 0);
            const t = Date.now();
            ctx.save();
            ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
            ctx.rotate(Math.atan2(b.vy || 0, b.vx || 0));
            const W = Math.max(b.w, b.h), H = Math.min(b.w, b.h);
            if (b.cuKind === 'sword') {
                // Lưỡi kiếm thép, cán màu đội
                ctx.shadowBlur = 12; ctx.shadowColor = pick === '#ffffff' ? team : pick;
                ctx.fillStyle = lin(0, -H / 2, 0, H / 2, ['#ffffff', '#cbd5e1', '#64748b']);
                poly([[W / 2, 0], [W * 0.2, -H * 0.42], [-W * 0.25, -H * 0.42], [-W * 0.25, H * 0.42], [W * 0.2, H * 0.42]]); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = team; ctx.fillRect(-W * 0.3, -H * 0.6, 1.8, H * 1.2);
                ctx.fillStyle = '#1f2937'; ctx.fillRect(-W / 2, -H * 0.2, W * 0.2, H * 0.4);
                ctx.strokeStyle = rgba(pick, 0.8); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-W * 0.2, 0); ctx.lineTo(W * 0.4, 0); ctx.stroke();
            } else if (b.cuKind === 'laser') {
                const L = W * 1.4;
                ctx.lineCap = 'round';
                ctx.strokeStyle = rgba(team, 0.5); ctx.lineWidth = H * 1.8; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(W / 2, 0); ctx.stroke();
                ctx.shadowBlur = 12; ctx.shadowColor = team;
                ctx.strokeStyle = pick === '#ffffff' ? '#e0f2fe' : pick; ctx.lineWidth = H;
                ctx.beginPath(); ctx.moveTo(-L * 0.9, 0); ctx.lineTo(W / 2, 0); ctx.stroke();
                ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, H * 0.4);
                ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(W / 2, 0); ctx.stroke();
            } else if (b.cuKind === 'cannon') {
                // Đạn pháo: cầu tròn thuần, vỏ tối, vành màu đội, lõi sáng
                const R = W / 2;
                ctx.fillStyle = rad(0, 0, R * 0.4, R * 1.8, [rgba(pick === '#ffffff' ? '#f97316' : pick, 0.45), 'rgba(0,0,0,0)']); circ(0, 0, R * 1.8); ctx.fill();
                ctx.fillStyle = rad(-R * 0.35, -R * 0.35, 0, R, ['#6b7280', '#1f2937', '#0b0f17']); circ(0, 0, R); ctx.fill();
                ctx.strokeStyle = team; ctx.lineWidth = 1.6; ctx.stroke();
                ctx.save(); ctx.rotate(t / 150); ctx.strokeStyle = pick === '#ffffff' ? '#f97316' : pick; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(0, 0, R * 0.6, 0, PI * 1.2); ctx.stroke(); ctx.restore();
            } else if (b.cuKind === 'split') {
                // Đạn Tách: hạt nhân hình thoi xoay (mảnh con nhỏ, hồng)
                const R = W / 2 + 1, c = b.cuSplit ? '#e879f9' : pick;
                ctx.fillStyle = lin(-R * 3, 0, 0, 0, [rgba(team, 0), rgba(team, 0.5)]); poly([[-R * 3, 0], [0, -R * 0.6], [0, R * 0.6]]); ctx.fill();
                ctx.save(); ctx.rotate(t / 120);
                ctx.shadowBlur = 10; ctx.shadowColor = c === '#ffffff' ? team : c;
                ctx.fillStyle = c; poly([[R, 0], [0, -R], [-R, 0], [0, R]]); ctx.fill(); ctx.shadowBlur = 0;
                ctx.strokeStyle = team; ctx.lineWidth = 1; ctx.stroke();
                if (!b.cuSplit) { ctx.fillStyle = '#ffffff'; poly([[R * 0.4, 0], [0, -R * 0.4], [-R * 0.4, 0], [0, R * 0.4]]); ctx.fill(); }
                ctx.restore();
            } else {
                comet(Math.min(30, 8 + sp * 2.4), Math.max(2, H / 2), pick, team, { glow: pick === '#ffffff' ? team : pick, blur: 11 });
            }
            // Chí mạng: vòng vàng xoay quanh đạn
            if (b.cuCrit) { ctx.save(); ctx.rotate(t / 80); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = '#facc15'; ctx.beginPath(); ctx.arc(0, 0, W / 2 + 3, 0, PI * 1.4); ctx.stroke(); ctx.restore(); }
            ctx.restore();
        };
    }
})();
