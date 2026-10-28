// ==========================================
// Art xe & đạn nhóm "heavy" (registerTankArt / registerBulletArt)
// ------------------------------------------
// Pháo Băng, Đạn Lớn, Cuộn Quá Tải, Lazer Xuyên Phá, Lazer Pháo, Pháo Tên Lửa, Axit Hóa,
// Pháo Cao Xạ, Xe TANK, 6 Nòng, Lò Nung, Súng Nước, Shortgun ATK.
// Chỉ đọc state (không tạo state mới) -> host & guest vẽ giống nhau.
// ==========================================

(() => {
    const PI2 = Math.PI * 2;

    // --- Tiện ích riêng nhóm ---
    const H = {
        poly(pts) {
            ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
            ctx.closePath();
        },
        circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); },
        // Viền màu đội (điểm nhấn chính để nhận ra phe)
        rim(k, w = 1.6) { ctx.strokeStyle = k.team; ctx.lineWidth = w; ctx.stroke(); },
        dark(w = 1.2, c = 'rgba(0,0,0,0.55)') { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); },
        light(x, y, r, color, blur = 8) {
            ctx.save(); TA.glow(color, blur); ctx.fillStyle = color;
            H.circle(x, y, r); ctx.fill(); ctx.restore();
        },
        rad(x, y, r0, r1, stops) {
            const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
            stops.forEach((s, i) => g.addColorStop(s[0], s[1]));
            return g;
        },
        lin(x0, y0, x1, y1, stops) {
            const g = ctx.createLinearGradient(x0, y0, x1, y1);
            stops.forEach(s => g.addColorStop(s[0], s[1]));
            return g;
        },
        // Tia sét gấp khúc từ (x0,y0) tới (x1,y1), seed để mỗi tia khác nhau nhưng ổn định theo thời gian
        bolt(x0, y0, x1, y1, seg, amp, seed) {
            ctx.beginPath(); ctx.moveTo(x0, y0);
            const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
            const nx = -dy / L, ny = dx / L;
            for (let i = 1; i < seg; i++) {
                const f = i / seg;
                const o = Math.sin(seed * 12.9898 + i * 78.233) * amp;
                ctx.lineTo(x0 + dx * f + nx * o, y0 + dy * f + ny * o);
            }
            ctx.lineTo(x1, y1);
        },
        // Thân bánh xích hiện đại (dải bo tròn + mắt xích chạy)
        treads(x, w, y0, y1, t, body = '#151a22', link = '#3b4452', speed = 20) {
            [x, -x - w].forEach(tx => {
                ctx.fillStyle = H.lin(tx, 0, tx + w, 0, [[0, body], [0.5, '#262d38'], [1, body]]);
                TA.rr(tx, y0, w, y1 - y0, Math.min(2.5, w / 2)); ctx.fill();
                ctx.fillStyle = link;
                const off = (t * speed) % 3.5;
                for (let yy = y0 + 1 + off; yy < y1 - 1.5; yy += 3.5) ctx.fillRect(tx + 0.7, yy, w - 1.4, 1.6);
            });
        },
        teamOf(o) { return (o && o.id === 2) ? '#e74c3c' : '#3498db'; },
    };

    // ==========================================
    // PHÁO BĂNG (ice) — thân xanh băng, tinh thể nhọn hai bên tháp pháo
    // ==========================================
    function shard(x0, y0, x1, y1, wd, fill) {
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L * wd, ny = dx / L * wd;
        const mx = x0 + dx * 0.35, my = y0 + dy * 0.35;
        H.poly([x0, y0, mx + nx, my + ny, x1, y1, mx - nx, my - ny]);
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.7; ctx.stroke();
    }
    registerTankArt('ice', (p, k) => {
        const crystal = H.lin(0, -16, 0, 16, [[0, '#f0fdff'], [0.5, '#9be7ff'], [1, '#38a3c9']]);
        H.treads(-15.5, 4, -11, 13, k.t, '#12303d', '#4f9cb5');
        // tinh thể sau xe (Evo 1)
        if (k.evo1 || k.full) {
            shard(-6, 9, -12.5, 15.5, 2, crystal);
            shard(6, 9, 12.5, 15.5, 2, crystal);
        }
        // thân bát giác
        H.poly([-8, -12, 8, -12, 11.5, -8, 11.5, 10, 8, 14, -8, 14, -11.5, 10, -11.5, -8]);
        ctx.fillStyle = H.lin(0, -12, 0, 14, [[0, '#d8f6ff'], [0.45, '#7cc9e4'], [1, '#2f6f8a']]);
        ctx.fill(); H.rim(k);
        // vân băng
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(-3, -4); ctx.lineTo(-6, 4); ctx.moveTo(8, 10); ctx.lineTo(4, 6); ctx.lineTo(7, -2); ctx.stroke();
        // tinh thể nhọn hai bên tháp pháo
        shard(-5, -1, -15.5, -10.5, 2.4, crystal);
        shard(5, -1, 15.5, -10.5, 2.4, crystal);
        shard(-6, 3, -15.5, 1, 1.7, crystal);
        shard(6, 3, 15.5, 1, 1.7, crystal);
        // nòng băng
        ctx.fillStyle = H.lin(-2.2, 0, 2.2, 0, [[0, '#4a90a8'], [0.5, '#f0fdff'], [1, '#4a90a8']]);
        TA.rr(-2.2, -13.5, 4.4, 12, 1.2); ctx.fill();
        ctx.strokeStyle = 'rgba(20,60,80,0.6)'; ctx.lineWidth = 0.6; ctx.stroke();
        // mũi tinh thể ở đầu nòng
        H.poly([0, -16, 3, -13.2, 0, -11.5, -3, -13.2]);
        ctx.save(); TA.glow('#7df9ff', 8); ctx.fillStyle = '#e6fdff'; ctx.fill(); ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
        // tháp pháo kính băng
        H.circle(0, 2, 6.2);
        ctx.fillStyle = H.rad(-1.5, 0.5, 0.5, 6.5, [[0, '#ffffff'], [0.5, '#b9f0ff'], [1, '#4aa6c6']]);
        ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1; ctx.stroke();
        // lõi màu đội
        H.light(0, 2, 2.6, k.team, 10);
        H.circle(-0.8, 1.2, 0.9); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
        // Full Evo: bông tuyết xoay quanh tháp pháo
        if (k.full) {
            ctx.save(); ctx.translate(0, 2); ctx.rotate(k.t * 0.8);
            ctx.strokeStyle = 'rgba(220,250,255,0.85)'; ctx.lineWidth = 1; TA.glow('#7df9ff', 6);
            for (let i = 0; i < 6; i++) {
                ctx.rotate(Math.PI / 3);
                ctx.beginPath(); ctx.moveTo(0, -7.5); ctx.lineTo(0, -10.5);
                ctx.moveTo(0, -9.3); ctx.lineTo(-1.3, -10.6); ctx.moveTo(0, -9.3); ctx.lineTo(1.3, -10.6); ctx.stroke();
            }
            ctx.restore();
        }
    });
    registerBulletArt('ice', (b, color, o, k) => {
        if (!b.isIce) return false;
        const r = Math.max(2.5, (b.w || 5) / 2);
        const big = r >= 6;
        // đuôi hơi lạnh
        ctx.fillStyle = H.lin(-r * 4, 0, 0, 0, [[0, 'rgba(160,240,255,0)'], [1, 'rgba(160,240,255,0.45)']]);
        H.poly([-r * 4, 0, 0, -r * 0.8, 0, r * 0.8]); ctx.fill();
        // tinh thể hình thoi dài
        ctx.save();
        TA.glow('#7df9ff', big ? 16 : 10);
        H.poly([r * 1.9, 0, r * 0.1, -r * 0.95, -r * 1.5, 0, r * 0.1, r * 0.95]);
        ctx.fillStyle = H.lin(-r * 1.5, -r, r * 1.9, r, [[0, '#4fc3e8'], [0.55, '#c9f6ff'], [1, '#ffffff']]);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.22); ctx.stroke();
        ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(0.8, r * 0.12);
        ctx.beginPath(); ctx.moveTo(r * 1.9, 0); ctx.lineTo(-r * 1.5, 0); ctx.stroke();
        // viên to (tạo vùng băng): vòng tuyết xoay
        if (big) {
            ctx.save(); ctx.rotate(k.t / 300);
            ctx.strokeStyle = 'rgba(230,252,255,0.75)'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) {
                ctx.rotate(Math.PI / 3);
                ctx.beginPath(); ctx.moveTo(r * 1.15, 0); ctx.lineTo(r * 1.55, 0); ctx.stroke();
            }
            ctx.restore();
        }
        // bụi băng
        ctx.fillStyle = 'rgba(220,252,255,0.8)';
        for (let i = 1; i <= 3; i++) { H.circle(-r * 1.6 - i * r * 0.9, Math.sin(k.t / 90 + i * 2) * r * 0.6, Math.max(0.8, r * 0.22)); ctx.fill(); }
    });

    // ==========================================
    // ĐẠN LỚN (big_bullet) — nòng cực dày, thân gọn; đạn: cầu tròn thuần, quầng sáng
    // ==========================================
    registerTankArt('big_bullet', (p, k) => {
        const bw = k.full ? 15 : (k.evo1 ? 14 : 12.5);
        H.treads(-15, 4, -6, 15, k.t, '#1a1410', '#5b4636');
        // thân gọn
        TA.rr(-11.5, -4, 23, 18.5, 5);
        ctx.fillStyle = H.lin(0, -4, 0, 14.5, [[0, '#57534e'], [0.5, '#3a3532'], [1, '#1c1917']]);
        ctx.fill(); H.rim(k);
        // dải cam cảnh báo phía sau
        ctx.fillStyle = '#ea580c'; TA.rr(-8, 10.5, 16, 2, 1); ctx.fill();
        // nòng rất dày
        ctx.fillStyle = H.lin(-bw / 2, 0, bw / 2, 0, [[0, '#431407'], [0.3, '#c2410c'], [0.55, '#fdba74'], [0.8, '#c2410c'], [1, '#431407']]);
        TA.rr(-bw / 2, -15, bw, 15, 3); ctx.fill();
        H.dark(0.8);
        // đai gia cố
        ctx.fillStyle = 'rgba(28,25,23,0.75)';
        ctx.fillRect(-bw / 2, -9, bw, 1.6); ctx.fillRect(-bw / 2, -4.5, bw, 1.6);
        // miệng nòng loe
        ctx.fillStyle = H.lin(-bw / 2 - 1, 0, bw / 2 + 1, 0, [[0, '#292524'], [0.5, '#78716c'], [1, '#292524']]);
        TA.rr(-bw / 2 - 1, -16, bw + 2, 3.2, 1.5); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.2; ctx.stroke();
        // buồng nạp: cửa sổ tròn thấy viên đạn kế tiếp (màu đội)
        H.circle(0, 5, 6.5);
        ctx.fillStyle = '#0c0a09'; ctx.fill();
        ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 1.3; ctx.stroke();
        const ready = p.ammo > 0;
        const pulse = 0.85 + Math.sin(k.t * 4) * 0.15;
        ctx.save();
        TA.glow(k.team, ready ? 12 : 3);
        H.circle(0, 5, 4.4 * (ready ? pulse : 0.7));
        ctx.fillStyle = H.rad(-1.2, 3.8, 0.3, 4.6, [[0, '#ffffff'], [0.35, ready ? '#ffd2a8' : '#78716c'], [1, ready ? k.team : '#292524']]);
        ctx.fill(); ctx.restore();
        // Full Evo: hai cung năng lượng xoay quanh buồng nạp
        if (k.full) {
            ctx.save(); ctx.translate(0, 5); ctx.rotate(k.t * 3);
            ctx.strokeStyle = '#fdba74'; ctx.lineWidth = 1.4; TA.glow('#fb923c', 8);
            ctx.beginPath(); ctx.arc(0, 0, 8.3, 0, 1.6); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 8.3, Math.PI, Math.PI + 1.6); ctx.stroke();
            ctx.restore();
        }
    });
    // Đạn Lớn: CẦU TRÒN THUẦN đúng đường kính b.w, không đuôi, quầng sáng; to (>=22) có vòng xoay
    const bigOrb = (b, color, o, k) => {
        const R = Math.max(3, Math.max(b.w || 0, b.h || 0) / 2);
        // khử xoay để vân sáng luôn ở góc trên-trái (cầu tròn không có hướng)
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));
        // quầng sáng ngoài theo màu đội
        ctx.fillStyle = H.rad(0, 0, R * 0.6, R * 2.1, [[0, k.team], [0.45, 'rgba(255,140,60,0.25)'], [1, 'rgba(0,0,0,0)']]);
        ctx.globalAlpha *= 0.6; H.circle(0, 0, R * 2.1); ctx.fill(); ctx.globalAlpha /= 0.6;
        // thân cầu nóng rực
        ctx.save();
        TA.glow(k.team, Math.min(28, 10 + R));
        H.circle(0, 0, R);
        ctx.fillStyle = H.rad(-R * 0.3, -R * 0.3, R * 0.05, R * 1.05, [[0, '#ffffff'], [0.25, '#fff1d6'], [0.55, '#ff9a4a'], [0.85, '#d9480f'], [1, '#7c2d12']]);
        ctx.fill();
        ctx.restore();
        // viền màu đội
        H.circle(0, 0, R); ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1.2, R * 0.14); ctx.stroke();
        // điểm phản quang
        H.circle(-R * 0.38, -R * 0.4, R * 0.22); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
        // Evo 1 trở lên: vòng sáng trong
        if (R >= 8) {
            H.circle(0, 0, R * 0.7); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, R * 0.05); ctx.stroke();
        }
        // Full Evo (d >= 22): vòng năng lượng xoay quanh
        if (R >= 11) {
            ctx.rotate(k.t / 170);
            ctx.save(); TA.glow(k.team, 10);
            const g1 = R + Math.max(4, R * 0.18), g2 = R + Math.max(7, R * 0.32);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, R * 0.09);
            ctx.beginPath(); ctx.arc(0, 0, g1, 0, Math.PI * 0.65); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, g1, Math.PI, Math.PI * 1.65); ctx.stroke();
            ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1.5, R * 0.06);
            ctx.beginPath(); ctx.arc(0, 0, g2, Math.PI * 0.5, Math.PI * 0.95); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, g2, Math.PI * 1.5, Math.PI * 1.95); ctx.stroke();
            ctx.restore();
        }
        // Xuyên Thấu: vành tím nhấp nháy (vẫn là hình tròn thuần)
        if (b.bigPierce) {
            ctx.save(); TA.glow('#c084fc', 14);
            ctx.strokeStyle = `rgba(233,213,255,${0.6 + 0.35 * Math.sin(k.t / 60)})`; ctx.lineWidth = Math.max(2, R * 0.1);
            H.circle(0, 0, R + Math.max(2.5, R * 0.12)); ctx.stroke();
            ctx.restore();
        }
    };
    registerBulletArt('big_bullet', bigOrb);
    // Đạn Lớn dùng BulletHooks 'big_bullet' để vẽ -> chuyển sang quả cầu art (giữ hit/obstacle của logic)
    const hookDraw = (id, fn) => {
        if (typeof BulletHooks === 'undefined' || !BulletHooks.registry[id]) return;
        const prev = BulletHooks.registry[id].draw;
        BulletHooks.registry[id].draw = function (b) {
            const o = b.owner;
            ctx.save();
            ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
            ctx.rotate(Math.atan2(b.vy || 0, b.vx || 0));
            let ok;
            try { ok = fn(b, H.teamOf(o), o, { r: Math.max(2, Math.min(b.w, b.h) / 2), w: b.w, h: b.h, sp: Math.hypot(b.vx || 0, b.vy || 0), t: Date.now(), team: H.teamOf(o) }); }
            catch (e) { ok = false; }
            ctx.restore();
            if (ok === false && prev) prev.call(this, b);
        };
    };
    hookDraw('big_bullet', bigOrb);

    // ==========================================
    // CUỘN QUÁ TẢI (overload) — cuộn dây quấn quanh nòng, tia điện nhỏ
    // ==========================================
    registerTankArt('overload', (p, k) => {
        const c = Math.min(1, p.ovMain !== undefined ? (p.ovMain || 0) : (p.chargeLevel || 0) / 7);
        const elec = '#22d3ee';
        H.treads(-15, 3.8, -9, 14, k.t, '#0b1726', '#25506b');
        // thân lục giác
        H.poly([-6, -10, 6, -10, 11.5, -4, 11.5, 11, 7, 14.5, -7, 14.5, -11.5, 11, -11.5, -4]);
        ctx.fillStyle = H.lin(0, -10, 0, 14.5, [[0, '#1e3a5f'], [1, '#0b1220']]);
        ctx.fill(); H.rim(k);
        // tụ điện phía sau
        for (let i = 0; i < 3; i++) {
            const lit = c > i / 3 + 0.05;
            ctx.save(); if (lit) TA.glow(elec, 8);
            ctx.fillStyle = lit ? elec : '#16324a';
            TA.rr(-7.5 + i * 5.5, 9, 4, 3.6, 1); ctx.fill(); ctx.restore();
        }
        // nòng
        ctx.fillStyle = H.lin(-2.5, 0, 2.5, 0, [[0, '#334155'], [0.5, '#cbd5e1'], [1, '#334155']]);
        TA.rr(-2.5, -16, 5, 16, 1.5); ctx.fill();
        // cuộn dây quấn quanh nòng
        for (let i = 0; i < 4; i++) {
            const y = -14 + i * 3.1;
            ctx.save();
            if (c > 0.15) TA.glow(elec, 4 + c * 10);
            ctx.fillStyle = H.lin(-4.6, 0, 4.6, 0, [[0, '#7c2d12'], [0.5, c > 0.15 ? '#a5f3fc' : '#f59e0b'], [1, '#7c2d12']]);
            TA.rr(-4.6, y, 9.2, 2, 1); ctx.fill(); ctx.restore();
        }
        // cuộn lớn ở gốc nòng (vòng dây đồng)
        H.circle(0, 2, 7);
        ctx.fillStyle = '#0f172a'; ctx.fill();
        ctx.setLineDash([1.6, 0.9]);
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.6; ctx.stroke();
        ctx.setLineDash([]);
        // lõi phát sáng theo mức tụ lực
        ctx.save(); TA.glow(c > 0.95 ? '#ffffff' : elec, 6 + c * 14);
        H.circle(0, 2, 3 + c * 1.5);
        ctx.fillStyle = H.rad(0, 2, 0.3, 4.5, [[0, '#ffffff'], [0.5, c > 0.3 ? '#a5f3fc' : '#67e8f9'], [1, k.team]]);
        ctx.fill(); ctx.restore();
        // tia điện nhảy giữa các cuộn (nhiều hơn khi tụ lực)
        const nb = 1 + Math.floor(c * 4) + (k.full ? 1 : 0);
        const tick = Math.floor(k.t * 14);
        ctx.save(); TA.glow(elec, 8);
        ctx.strokeStyle = '#e0faff'; ctx.lineWidth = 0.9;
        for (let i = 0; i < nb; i++) {
            const sd = tick * 7 + i * 13;
            const side = (sd % 2) ? 1 : -1;
            const y0 = -13 + ((sd * 5) % 11);
            H.bolt(side * 4.6, y0, side * (6.5 + (sd % 3)), y0 + 2 + (sd % 4), 3, 0.9, sd);
            ctx.stroke();
        }
        if (c > 0.3 || k.full) { // vòng cung giữa cuộn lớn và vỏ
            H.bolt(-7, 2, -11, -3, 4, 1, tick); ctx.stroke();
            H.bolt(7, 2, 11, -3, 4, 1, tick + 3); ctx.stroke();
        }
        ctx.restore();
    });
    const ovOrb = (b, color, o, k) => {
        const R = Math.max(b.hook === 'overload' ? 5 : 2.5, (b.w || 5) / 2);
        const elec = b.ovFull ? '#a78bfa' : '#22d3ee';
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));
        const sp = Math.hypot(b.vx || 0, b.vy || 0) || 1;
        // vệt điện mờ phía sau
        const ux = -(b.vx || 0) / sp, uy = -(b.vy || 0) / sp;
        ctx.fillStyle = 'rgba(34,211,238,0.18)';
        for (let i = 1; i <= 3; i++) { H.circle(ux * R * 1.1 * i, uy * R * 1.1 * i, R * (1 - i * 0.22)); ctx.fill(); }
        // quầng
        ctx.fillStyle = H.rad(0, 0, R * 0.5, R * 2, [[0, 'rgba(165,243,252,0.6)'], [1, 'rgba(34,211,238,0)']]);
        H.circle(0, 0, R * 2); ctx.fill();
        // cầu điện
        ctx.save(); TA.glow(elec, 12 + R);
        H.circle(0, 0, R);
        ctx.fillStyle = H.rad(0, 0, R * 0.1, R, [[0, '#ffffff'], [0.4, '#a5f3fc'], [0.8, '#0ea5e9'], [1, k.team]]);
        ctx.fill(); ctx.restore();
        H.circle(0, 0, R); ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, R * 0.15); ctx.stroke();
        // viền sét quanh cầu
        const tick = Math.floor(k.t / 45);
        const n = 4 + Math.min(6, Math.floor(R / 2));
        ctx.save(); TA.glow(elec, 8);
        ctx.strokeStyle = '#ecfeff'; ctx.lineWidth = Math.max(0.9, R * 0.12);
        for (let i = 0; i < n; i++) {
            const a0 = (i / n) * PI2 + tick * 0.7, a1 = a0 + PI2 / n * 0.8;
            ctx.beginPath();
            for (let j = 0; j <= 4; j++) {
                const a = a0 + (a1 - a0) * j / 4;
                const rr = R * (1.08 + 0.22 * Math.abs(Math.sin(tick * 3.1 + i * 5 + j * 2.7)));
                if (j === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            }
            ctx.stroke();
        }
        ctx.restore();
        // full charge: lõi trắng chói nhấp nháy
        if (b.isFullCharge) {
            H.circle(0, 0, R * (0.45 + 0.1 * Math.sin(k.t / 40))); ctx.fillStyle = '#ffffff'; ctx.fill();
        }
        // Đạn sạc đầy (Full): vòng plasma tím xoay
        if (b.ovFull) {
            ctx.save(); ctx.rotate(k.t / 120); TA.glow('#a78bfa', 10);
            ctx.strokeStyle = 'rgba(221,214,254,0.9)'; ctx.lineWidth = Math.max(1.2, R * 0.12);
            ctx.beginPath(); ctx.arc(0, 0, R * 1.55, 0, 1.9); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, R * 1.55, Math.PI, Math.PI + 1.9); ctx.stroke();
            ctx.restore();
        }
    };
    registerBulletArt('overload', ovOrb);
    hookDraw('overload', ovOrb);

    // ==========================================
    // LAZER XUYÊN PHÁ (lazer_charge) — nòng dài mảnh, thanh tụ lực chạy dọc thân
    // ==========================================
    registerTankArt('lazer_charge', (p, k) => {
        const c = Math.min(1, Math.max((p.chargeLevel || 0) / 7, p.lcAuto ? (p.lcEnergy || 0) / 100 : 0)); // thanh tụ lực = năng lượng Tự Nạp (hoặc thanh giữ đổi chế độ)
        const az = '#5aa9ff';
        // cánh đẩy hai bên (silhouette mũi tên)
        H.poly([-9, -6, -15.5, 5, -15.5, 12, -9, 9]);
        ctx.fillStyle = H.lin(-15.5, 0, -9, 0, [[0, '#0f2547'], [1, '#2a4f86']]); ctx.fill(); H.dark(0.8);
        H.poly([9, -6, 15.5, 5, 15.5, 12, 9, 9]);
        ctx.fillStyle = H.lin(15.5, 0, 9, 0, [[0, '#0f2547'], [1, '#2a4f86']]); ctx.fill(); H.dark(0.8);
        // đèn đuôi cánh
        H.light(-14, 10.5, 1.1, k.team, 6); H.light(14, 10.5, 1.1, k.team, 6);
        // thân hẹp dài
        H.poly([-4, -11, 4, -11, 9.5, -5, 9.5, 13, 5, 15.5, -5, 15.5, -9.5, 13, -9.5, -5]);
        ctx.fillStyle = H.lin(0, -11, 0, 15.5, [[0, '#2c5ea8'], [0.5, '#173563'], [1, '#0a1730']]);
        ctx.fill(); H.rim(k);
        // khe thanh tụ lực dọc thân (7 nấc)
        TA.rr(-2.4, -6, 4.8, 20, 1.5); ctx.fillStyle = '#050b16'; ctx.fill();
        const lit = c * 7;
        for (let i = 0; i < 7; i++) {
            const y = 11.4 - i * 2.75;
            const on = lit > i + 0.1;
            ctx.save();
            if (on) TA.glow(c >= 1 ? '#ffffff' : az, c >= 1 ? 12 : 6);
            ctx.fillStyle = on ? (c >= 1 ? '#ffffff' : (i >= 5 ? '#bfe0ff' : az)) : '#13284a';
            TA.rr(-1.6, y, 3.2, 1.9, 0.6); ctx.fill(); ctx.restore();
        }
        // nòng dài mảnh
        const bw = k.evo1 ? 4.2 : 3.2;
        ctx.fillStyle = H.lin(-bw / 2, 0, bw / 2, 0, [[0, '#334155'], [0.5, '#e2e8f0'], [1, '#334155']]);
        TA.rr(-bw / 2, -16, bw, 10.5, 1); ctx.fill();
        // vòng thấu kính
        ctx.fillStyle = '#94a3b8';
        TA.rr(-bw / 2 - 1, -9.5, bw + 2, 1.6, 0.8); ctx.fill();
        TA.rr(-bw / 2 - 1, -13.2, bw + 2, 1.6, 0.8); ctx.fill();
        // chạc phát tia (Evo 1)
        if (k.evo1) {
            ctx.fillStyle = '#64748b';
            H.poly([-bw / 2 - 1, -11, -bw / 2 - 2.6, -16, -bw / 2 - 1, -15.5]); ctx.fill();
            H.poly([bw / 2 + 1, -11, bw / 2 + 2.6, -16, bw / 2 + 1, -15.5]); ctx.fill();
        }
        // đầu phát sáng (sáng dần theo tụ lực)
        ctx.save(); TA.glow(c > 0.05 ? '#bfe0ff' : k.team, 6 + c * 16);
        H.circle(0, -15.2, 1.4 + c * 1.2); ctx.fillStyle = c > 0.05 ? '#ffffff' : k.team; ctx.fill();
        ctx.restore();
        // buồng hội tụ
        H.circle(0, -6.5, 2.6); ctx.fillStyle = H.rad(0, -6.5, 0.2, 2.6, [[0, '#ffffff'], [0.6, az], [1, '#1e3a8a']]); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
    });
    registerBulletArt('lazer_charge', (b, color, o, k) => {
        // Đạn nhấp nhanh: mũi laser mảnh xanh lam, lõi trắng
        const r = Math.max(1.6, Math.min(b.w, b.h) / 2);
        const L = 16 + r * 2;
        ctx.save(); ctx.lineCap = 'round';
        TA.glow(k.team, 12);
        ctx.strokeStyle = k.team; ctx.lineWidth = r * 1.8;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(r, 0); ctx.stroke();
        ctx.restore();
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = r * 1.1;
        ctx.beginPath(); ctx.moveTo(-L * 0.8, 0); ctx.lineTo(r, 0); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.55);
        ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(r * 1.2, 0); ctx.stroke();
    });
    // Tia Xuyên Phá: chỉ thay hình cho tia của Lazer Xuyên Phá (tia của body khác giữ nguyên)
    if (typeof Beam !== 'undefined') {
        const prevBeamDraw = Beam.prototype.draw;
        Beam.prototype.draw = function () {
            const owner = (typeof p1 !== 'undefined' && this.ownerId === 1) ? p1 : (typeof p2 !== 'undefined' ? p2 : null);
            if (!this.active || !owner || owner.weapon !== 'lazer_charge') return prevBeamDraw.call(this);
            const team = H.teamOf(owner);
            const t = Date.now();
            const maxLife = this.isEvo ? 120 : 10;
            const life = Math.max(0, Math.min(1, this.lifeTime / maxLife));
            const fade = this.isEvo ? Math.min(1, life * 4) : life;
            const cx = this.x + this.w / 2;
            const jit = Math.sin(t / 23) * (this.isEvo ? 1.5 : 0.8);
            const W = this.w * (this.isEvo ? (0.9 + 0.1 * Math.sin(t / 40)) : (0.6 + 0.4 * life));
            ctx.save();
            ctx.globalAlpha *= fade;
            // quầng ngoài theo màu đội
            const HW = W * 0.62; // quầng chỉ rộng hơn vùng trúng một chút (hitbox = this.w)
            ctx.fillStyle = H.lin(cx - HW, 0, cx + HW, 0, [[0, 'rgba(0,0,0,0)'], [0.3, team], [0.5, team], [0.7, team], [1, 'rgba(0,0,0,0)']]);
            ctx.globalAlpha *= 0.45;
            ctx.fillRect(cx - HW + jit, this.y, HW * 2, this.h);
            ctx.globalAlpha /= 0.45;
            // thân tia xanh lam sáng
            ctx.shadowBlur = 20; ctx.shadowColor = '#5aa9ff';
            ctx.fillStyle = H.lin(cx - W / 2, 0, cx + W / 2, 0, [[0, 'rgba(90,169,255,0.2)'], [0.25, '#5aa9ff'], [0.5, '#dff0ff'], [0.75, '#5aa9ff'], [1, 'rgba(90,169,255,0.2)']]);
            ctx.fillRect(cx - W / 2 + jit, this.y, W, this.h);
            // lõi trắng
            ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - W * 0.14 + jit, this.y, W * 0.28, this.h);
            ctx.shadowBlur = 0;
            // vòng năng lượng chạy dọc tia
            const dir = (this.ownerId === 1) ? -1 : 1;
            const gap = this.isEvo ? 46 : 34;
            const off = ((t / 4) % gap) * dir;
            ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2;
            for (let y = this.y + ((off % gap) + gap) % gap; y < this.y + this.h; y += gap) {
                ctx.beginPath(); ctx.ellipse(cx + jit, y, W * 0.55, W * 0.16, 0, 0, PI2); ctx.stroke();
            }
            // tia sét viền (Evo)
            if (this.isEvo) {
                ctx.strokeStyle = 'rgba(191,224,255,0.8)'; ctx.lineWidth = 1.5;
                const seg = Math.max(4, Math.floor(this.h / 40));
                const tick = Math.floor(t / 50);
                [-1, 1].forEach(sd => {
                    H.bolt(cx + sd * W * 0.55, this.y, cx + sd * W * 0.55, this.y + this.h, seg, W * 0.18, tick + sd * 7);
                    ctx.stroke();
                });
            }
            ctx.restore();
        };
    }

    // ==========================================
    // LAZER PHÁO (lazer_auto) — nòng kép lớn, khe làm mát ở thân
    // ==========================================
    registerTankArt('lazer_auto', (p, k) => {
        const big = k.evo2 || k.full;
        const bw = big ? 5.6 : 4.8;
        H.treads(-15.5, 3.6, -7, 14.5, k.t, '#0b1530', '#2d4a8a');
        // thân rộng
        TA.rr(-12, -6, 24, 20, 4.5);
        ctx.fillStyle = H.lin(0, -6, 0, 14, [[0, '#2851a8'], [0.5, '#1a347a'], [1, '#0c1838']]);
        ctx.fill(); H.rim(k);
        // khe làm mát (đèn xanh nhịp nhàng)
        const over = (p.laOver || 0) > 0;
        const heat = Math.min(1, (p.laHeat || 0) / 100);
        for (let i = 0; i < 4; i++) {
            const y = -1.5 + i * 3;
            const a = 0.45 + 0.35 * Math.sin(k.t * 5 + i) + heat * 0.4;
            ctx.save(); TA.glow('#60a5fa', 4 + heat * 8);
            ctx.fillStyle = over ? `rgba(255,59,48,${Math.min(1, a)})` : `rgba(${Math.round(96 + heat * 159)},${Math.round(165 - heat * 45)},${Math.round(250 - heat * 210)},${Math.min(1, a)})`;
            TA.rr(-10.5, y, 4.2, 1.5, 0.7); ctx.fill();
            TA.rr(6.3, y, 4.2, 1.5, 0.7); ctx.fill();
            ctx.restore();
        }
        // khối nòng kép
        TA.rr(-8, -9, 16, 9, 2.5);
        ctx.fillStyle = H.lin(-8, 0, 8, 0, [[0, '#1e293b'], [0.5, '#475569'], [1, '#1e293b']]); ctx.fill();
        H.dark(0.8);
        [-4.2, 4.2].forEach(x => {
            ctx.fillStyle = H.lin(x - bw / 2, 0, x + bw / 2, 0, [[0, '#334155'], [0.5, '#dbeafe'], [1, '#334155']]);
            TA.rr(x - bw / 2, -16, bw, 9, 1.4); ctx.fill();
            // rãnh từ trường
            ctx.fillStyle = '#1d4ed8'; ctx.fillRect(x - bw / 2, -12.5, bw, 1.3);
            if (k.evo1 || k.full) { ctx.fillStyle = '#60a5fa'; ctx.fillRect(x - 0.6, -15.5, 1.2, 8); }
            // đầu phát màu đội
            ctx.save(); TA.glow(k.team, 6 + heat * 10);
            ctx.fillStyle = k.team; TA.rr(x - bw / 2 - 0.4, -16, bw + 0.8, 1.8, 0.8); ctx.fill();
            ctx.restore();
        });
        // lõi phát năng lượng giữa thân (nóng đỏ khi nhiệt cao)
        H.circle(0, 6, 3.6);
        ctx.fillStyle = H.rad(0, 6, 0.3, 3.6, [[0, '#ffffff'], [0.5, heat > 0.55 ? '#ff7a00' : '#60a5fa'], [1, over ? '#7f1d1d' : '#1e3a8a']]); ctx.fill();
        // quá nhiệt: khói bốc từ khe làm mát
        if (over) {
            for (let i = 0; i < 4; i++) {
                const ph = (k.t * 1.3 + i / 4) % 1, sd = i % 2 ? 1 : -1;
                ctx.fillStyle = `rgba(200,200,210,${0.5 * (1 - ph)})`;
                H.circle(sd * (8.5 + ph * 3), 2 + (i >> 1) * 4 - ph * 3, 1.2 + ph * 2); ctx.fill();
            }
        }
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
    });
    registerBulletArt('lazer_auto', (b, color, o, k) => {
        // Tia laser ngắn lõi trắng, xuyên mục tiêu
        const r = Math.max(1.5, Math.min(b.w, b.h) / 2);
        const L = Math.max(b.w, b.h, 16);
        ctx.lineCap = 'round';
        ctx.save(); TA.glow(k.team, 14);
        ctx.strokeStyle = k.team; ctx.lineWidth = r * 2.4;
        ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.5, 0); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = b.laHot ? '#ffb347' : '#93c5fd'; ctx.lineWidth = r * 1.4;
        ctx.beginPath(); ctx.moveTo(-L * 0.45, 0); ctx.lineTo(L * 0.5, 0); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.7);
        ctx.beginPath(); ctx.moveTo(-L * 0.35, 0); ctx.lineTo(L * 0.5, 0); ctx.stroke();
        // vệt mờ phía sau
        ctx.strokeStyle = H.lin(-L * 1.4, 0, -L * 0.5, 0, [[0, 'rgba(147,197,253,0)'], [1, 'rgba(147,197,253,0.5)']]);
        ctx.lineWidth = r;
        ctx.beginPath(); ctx.moveTo(-L * 1.4, 0); ctx.lineTo(-L * 0.5, 0); ctx.stroke();
    });

    // ==========================================
    // PHÁO TÊN LỬA (rocket) — hai ống phóng trên nắp
    // ==========================================
    registerTankArt('rocket', (p, k) => {
        const nuke = k.evo1 || k.full;
        const tw = (k.evo2 || k.full) ? 8 : 7;
        H.treads(-15.5, 4, -10, 14.5, k.t, '#1c1f24', '#4b5160');
        // thân thép
        TA.rr(-11.5, -9, 23, 23.5, 4);
        ctx.fillStyle = H.lin(0, -9, 0, 14.5, [[0, '#6b7280'], [0.5, '#4b5563'], [1, '#262b33']]);
        ctx.fill(); H.rim(k);
        // vạch cam
        ctx.fillStyle = '#f97316';
        H.poly([-11.5, 9, -7, 9, -9, 12.5, -11.5, 12.5]); ctx.fill();
        H.poly([11.5, 9, 7, 9, 9, 12.5, 11.5, 12.5]); ctx.fill();
        // biểu tượng phóng xạ (Evo 1)
        if (nuke) {
            ctx.save(); ctx.translate(0, 9.5);
            H.circle(0, 0, 3.4); ctx.fillStyle = '#facc15'; ctx.fill();
            ctx.fillStyle = '#111827';
            for (let i = 0; i < 3; i++) {
                const a = -Math.PI / 2 + i * PI2 / 3;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 3, a - 0.5, a + 0.5); ctx.closePath(); ctx.fill();
            }
            H.circle(0, 0, 0.8); ctx.fillStyle = '#facc15'; ctx.fill();
            ctx.restore();
        }
        // hai ống phóng
        const ready = p.ammo > 0;
        [-5.2, 5.2].forEach((x, i) => {
            ctx.fillStyle = H.lin(x - tw / 2, 0, x + tw / 2, 0, [[0, '#1f2937'], [0.5, '#9ca3af'], [1, '#1f2937']]);
            TA.rr(x - tw / 2, -15.5, tw, 21, 2); ctx.fill();
            H.dark(0.8);
            // đai ống
            ctx.fillStyle = '#f97316'; ctx.fillRect(x - tw / 2, -8, tw, 1.5);
            ctx.fillStyle = '#374151'; ctx.fillRect(x - tw / 2, 1, tw, 1.5);
            // miệng ống + đầu tên lửa nhô ra
            TA.rr(x - tw / 2 - 0.5, -16, tw + 1, 2.2, 1); ctx.fillStyle = '#111827'; ctx.fill();
            ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
            if (ready) {
                ctx.save(); TA.glow(nuke ? '#4ade80' : k.team, 6);
                ctx.fillStyle = nuke ? '#4ade80' : k.team;
                H.poly([x - tw * 0.32, -14, x, -16, x + tw * 0.32, -14]); ctx.fill();
                ctx.restore();
            }
        });
        // nắp điều khiển giữa
        TA.rr(-2, -4, 4, 9, 1.5); ctx.fillStyle = '#1f2937'; ctx.fill();
        H.light(0, -2, 1.2, k.team, 6);
        H.light(0, 2, 1, ready ? '#f97316' : '#57534e', 4);
    });
    registerBulletArt('rocket', (b, color, o, k) => {
        if (!b.isRocket) return false;
        const nuke = o.hasUpgrade && o.hasUpgrade('evo_rocket_1');
        const r = Math.max(2.75, (b.w || 8) * 0.32);
        const L = Math.max(b.w, b.h) * 1.7 + 4;
        const sp = k.sp || 1;
        // khói đuôi
        ctx.fillStyle = 'rgba(180,180,190,0.22)';
        for (let i = 1; i <= 4; i++) { H.circle(-L / 2 - 4 - i * r * 1.4, Math.sin(k.t / 70 + i * 1.7) * r * 0.6, r * (0.6 + i * 0.18)); ctx.fill(); }
        // lửa đuôi cam (nhấp nháy theo thời gian, không dùng random)
        const fl = r * 2.2 + sp * 1.2 + Math.sin(k.t / 25) * r * 0.6;
        ctx.save(); TA.glow('#ff8c00', 12);
        ctx.fillStyle = H.lin(-L / 2 - fl, 0, -L / 2, 0, [[0, 'rgba(255,120,0,0)'], [0.5, 'rgba(255,140,0,0.9)'], [1, '#fff3b0']]);
        H.poly([-L / 2 - fl, 0, -L / 2, -r * 0.75, -L / 2, r * 0.75]); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#ffffff'; H.poly([-L / 2 - fl * 0.35, 0, -L / 2, -r * 0.3, -L / 2, r * 0.3]); ctx.fill();
        // cánh đuôi
        ctx.fillStyle = nuke ? '#166534' : '#374151';
        H.poly([-L / 2, -r * 0.7, -L / 2 - r * 0.8, -r * 1.7, -L / 2 + r * 1.4, -r * 0.7]); ctx.fill();
        H.poly([-L / 2, r * 0.7, -L / 2 - r * 0.8, r * 1.7, -L / 2 + r * 1.4, r * 0.7]); ctx.fill();
        // thân
        ctx.fillStyle = H.lin(0, -r * 0.8, 0, r * 0.8, [[0, '#9ca3af'], [0.4, '#f3f4f6'], [1, '#4b5563']]);
        TA.rr(-L / 2, -r * 0.75, L * 0.78, r * 1.5, r * 0.4); ctx.fill();
        // sọc
        ctx.fillStyle = nuke ? '#facc15' : '#f97316'; ctx.fillRect(-L * 0.12, -r * 0.75, r * 0.7, r * 1.5);
        if (nuke) { ctx.fillStyle = '#111827'; ctx.fillRect(-L * 0.12 + r * 0.25, -r * 0.75, r * 0.22, r * 1.5); }
        // mũi màu đội (hạt nhân: xanh phóng xạ)
        ctx.save(); TA.glow(nuke ? '#4ade80' : k.team, 8);
        ctx.fillStyle = nuke ? '#4ade80' : k.team;
        ctx.beginPath(); ctx.moveTo(L * 0.28, -r * 0.75); ctx.quadraticCurveTo(L * 0.5 + r * 0.6, -r * 0.4, L * 0.5 + r * 0.5, 0);
        ctx.quadraticCurveTo(L * 0.5 + r * 0.6, r * 0.4, L * 0.28, r * 0.75); ctx.closePath(); ctx.fill();
        ctx.restore();
    });

    // ==========================================
    // AXIT HÓA (acid) — thân xanh lục, bình chứa dưới đáy, giọt nhỏ rơi
    // ==========================================
    registerTankArt('acid', (p, k) => {
        const lime = '#a3e635';
        const big = k.evo1 || k.full;
        H.treads(-15, 3.6, -10, 8, k.t, '#0f2414', '#2f6b3a');
        // thân bo tròn
        ctx.beginPath();
        ctx.moveTo(-6, -11); ctx.quadraticCurveTo(0, -13, 6, -11);
        ctx.quadraticCurveTo(11.5, -9, 11.5, -2); ctx.lineTo(11.5, 6);
        ctx.quadraticCurveTo(11.5, 9, 8, 9); ctx.lineTo(-8, 9);
        ctx.quadraticCurveTo(-11.5, 9, -11.5, 6); ctx.lineTo(-11.5, -2);
        ctx.quadraticCurveTo(-11.5, -9, -6, -11); ctx.closePath();
        ctx.fillStyle = H.lin(0, -12, 0, 9, [[0, '#4ade80'], [0.5, '#16a34a'], [1, '#14532d']]);
        ctx.fill(); H.rim(k);
        // vân nguy hiểm
        ctx.strokeStyle = 'rgba(190,242,100,0.5)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.arc(0, -2, 8.5, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -2, 8.5, Math.PI * 1.55, Math.PI * 1.9); ctx.stroke();
        // bình chứa dưới đáy (ống kính nằm ngang)
        const cw = big ? 22 : 19, cy = 9.5, ch = 6;
        TA.rr(-cw / 2, cy, cw, ch, 3);
        ctx.fillStyle = 'rgba(10,30,15,0.85)'; ctx.fill();
        ctx.strokeStyle = '#d9f99d'; ctx.lineWidth = 1.1; ctx.stroke();
        // chất lỏng sủi bọt
        ctx.save();
        TA.rr(-cw / 2 + 0.8, cy + 0.8, cw - 1.6, ch - 1.6, 2.2); ctx.clip();
        const lvl = cy + 2 + Math.sin(k.t * 3) * 0.4;
        ctx.fillStyle = H.lin(0, lvl, 0, cy + ch, [[0, '#bef264'], [1, '#4d7c0f']]);
        ctx.beginPath(); ctx.moveTo(-cw / 2, cy + ch);
        for (let x = -cw / 2; x <= cw / 2; x += 2) ctx.lineTo(x, lvl + Math.sin(x * 0.8 + k.t * 5) * 0.5);
        ctx.lineTo(cw / 2, cy + ch); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(240,255,220,0.8)';
        for (let i = 0; i < 4; i++) {
            const ph = (k.t * 0.9 + i * 0.27) % 1;
            H.circle(-cw / 2 + 3 + i * (cw - 6) / 3, cy + ch - 1 - ph * 3.5, 0.6 + ph * 0.5); ctx.fill();
        }
        ctx.restore();
        // giọt axit rơi
        for (let i = 0; i < 2; i++) {
            const ph = (k.t * 0.8 + i * 0.5) % 1;
            const dx = i ? 5 : -5;
            ctx.globalAlpha *= (1 - ph);
            ctx.fillStyle = lime;
            ctx.beginPath(); ctx.moveTo(dx, cy + ch + ph * 1.2 - 0.6);
            ctx.quadraticCurveTo(dx + 0.9, cy + ch + ph * 1.2 + 0.6, dx, cy + ch + ph * 1.2 + 1.2);
            ctx.quadraticCurveTo(dx - 0.9, cy + ch + ph * 1.2 + 0.6, dx, cy + ch + ph * 1.2 - 0.6); ctx.fill();
            ctx.globalAlpha /= (1 - ph) || 1;
        }
        // lọ phụ hai bên (Evo 2)
        if (k.evo2 || k.full) {
            [-9.5, 9.5].forEach(x => {
                TA.rr(x - 1.6, -6, 3.2, 7, 1.4); ctx.fillStyle = '#bef264'; ctx.fill();
                ctx.strokeStyle = '#14532d'; ctx.lineWidth = 0.7; ctx.stroke();
            });
        }
        // nòng phun có bầu giọt
        ctx.fillStyle = H.lin(-2.2, 0, 2.2, 0, [[0, '#14532d'], [0.5, '#86efac'], [1, '#14532d']]);
        TA.rr(-2.2, -15, 4.4, 13, 1.4); ctx.fill();
        ctx.fillStyle = '#365314'; ctx.fillRect(-2.2, -10, 4.4, 1.3);
        ctx.save(); TA.glow(lime, 8);
        H.circle(0, -14.3, 2.3); ctx.fillStyle = lime; ctx.fill(); ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; H.circle(0, -14.3, 2.3); ctx.stroke();
        // nắp tháp pháo
        H.circle(0, -1, 4.6);
        ctx.fillStyle = H.rad(-1, -2, 0.3, 4.6, [[0, '#d9f99d'], [0.6, '#22c55e'], [1, '#14532d']]); ctx.fill();
        H.light(0, -1, 1.7, k.team, 8);
    });
    registerBulletArt('acid', (b, color, o, k) => {
        if (!b.isAcid) return false;
        const R = Math.max(2.5, (b.w || 5) / 2);
        const zone = b.createAcidZone;
        // vùng lan mờ
        ctx.fillStyle = H.rad(0, 0, R * 0.5, R * (zone ? 2.6 : 2), [[0, 'rgba(163,230,53,0.45)'], [1, 'rgba(74,222,128,0)']]);
        H.circle(0, 0, R * (zone ? 2.6 : 2)); ctx.fill();
        // giọt rơi rớt phía sau
        ctx.fillStyle = 'rgba(163,230,53,0.55)';
        for (let i = 1; i <= 3; i++) { H.circle(-R * 1.2 * i - R * 0.4, Math.sin(k.t / 80 + i * 2.2) * R * 0.5, R * (0.5 - i * 0.1)); ctx.fill(); }
        // giọt axit tròn (khử xoay để bóng sáng cố định)
        ctx.save();
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));
        ctx.save(); TA.glow('#a3e635', 10 + R);
        H.circle(0, 0, R);
        ctx.fillStyle = H.rad(-R * 0.3, -R * 0.35, R * 0.1, R, [[0, '#f7fee7'], [0.35, '#bef264'], [0.8, '#22c55e'], [1, '#14532d']]);
        ctx.fill(); ctx.restore();
        H.circle(0, 0, R); ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, R * 0.18); ctx.stroke();
        // bọt sủi
        ctx.fillStyle = 'rgba(247,254,231,0.9)';
        H.circle(-R * 0.35, -R * 0.35, R * 0.22); ctx.fill();
        H.circle(R * 0.3 + Math.sin(k.t / 120) * R * 0.1, R * 0.2, R * 0.14); ctx.fill();
        if (zone) {
            ctx.rotate(k.t / 200);
            ctx.strokeStyle = 'rgba(190,242,100,0.8)'; ctx.lineWidth = 1.4; ctx.setLineDash([2.5, 3]);
            H.circle(0, 0, R + 3); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
    });

    // ==========================================
    // PHÁO CAO XẠ (aaa) — thân lớn, pháo hai nòng chĩa lên
    // ==========================================
    registerTankArt('aaa', (p, k) => {
        const moss = '#4d5b23';
        H.treads(-15.8, 4.2, -12, 14.5, k.t, '#161a10', '#4a5532');
        // thân lớn bát giác
        H.poly([-7, -12, 7, -12, 11.5, -7.5, 11.5, 11, 8, 14.5, -8, 14.5, -11.5, 11, -11.5, -7.5]);
        ctx.fillStyle = H.lin(0, -12, 0, 14.5, [[0, '#6b7a35'], [0.5, moss], [1, '#262e12']]);
        ctx.fill(); H.rim(k);
        // thùng đạn phía sau
        TA.rr(-9.5, 8.5, 6, 4.5, 1); ctx.fillStyle = '#3f3f1f'; ctx.fill(); H.dark(0.6);
        ctx.fillStyle = '#facc15'; ctx.fillRect(-9.5, 10.3, 6, 0.9);
        // radar xoay phía sau phải
        ctx.save(); ctx.translate(6.5, 10.5); ctx.rotate(k.t * 2.4);
        ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(0, 0, 3, -1.1, 1.1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, 0); ctx.stroke();
        ctx.restore();
        H.light(6.5, 10.5, 0.9, k.team, 5);
        // mâm xoay tháp pháo lớn
        H.circle(0, 1, 9);
        ctx.fillStyle = H.rad(-2, -1, 1, 9.5, [[0, '#a1a1aa'], [0.6, '#52525b'], [1, '#27272a']]); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
        // hai nòng song song có hãm giật
        [-3.6, 3.6].forEach(x => {
            ctx.fillStyle = H.lin(x - 1.9, 0, x + 1.9, 0, [[0, '#3f3f46'], [0.5, '#d4d4d8'], [1, '#3f3f46']]);
            TA.rr(x - 1.9, -14, 3.8, 14, 1); ctx.fill();
            // hãm giật đầu nòng
            ctx.fillStyle = '#27272a'; TA.rr(x - 2.6, -16, 5.2, 3.6, 1); ctx.fill();
            ctx.fillStyle = '#71717a'; ctx.fillRect(x - 2.6, -14.6, 5.2, 0.8);
            ctx.fillStyle = moss; ctx.fillRect(x - 1.9, -8, 3.8, 1.4);
        });
        // khung giữ nòng
        TA.rr(-6, -6, 12, 3, 1); ctx.fillStyle = '#3f3f46'; ctx.fill();
        // nắp chỉ huy
        H.circle(0, 3.5, 3.4); ctx.fillStyle = '#3f3f46'; ctx.fill(); H.dark(0.8);
        H.light(0, 3.5, 1.5, k.team, 8);
        // Evo 1: ống ngắm dẫn đường; Full Evo: tâm ngắm phát sáng
        if (k.evo1 || k.full) {
            TA.rr(7.2, -5, 2.6, 6, 1); ctx.fillStyle = '#18181b'; ctx.fill();
            H.light(8.5, -4.2, 0.9, '#ef4444', 5);
        }
        if (k.full) {
            ctx.save(); ctx.translate(0, 1); ctx.rotate(-k.t);
            ctx.strokeStyle = 'rgba(250,204,21,0.8)'; ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -10.2); ctx.lineTo(0, -11.8); ctx.stroke(); }
            ctx.restore();
        }
    });
    registerBulletArt('aaa', (b, color, o, k) => {
        if (b.isCannonball || b.type === 'cannonball') return false;
        // Đạn pháo thép xám tròn + vệt khói
        const R = Math.max(3, Math.min(b.w, b.h) / 2 * 1.25);
        for (let i = 1; i <= 4; i++) {
            ctx.fillStyle = `rgba(170,170,165,${0.3 - i * 0.05})`;
            H.circle(-i * R * 1.25, Math.sin(k.t / 90 + i * 1.3) * R * 0.35, R * (0.95 - i * 0.12)); ctx.fill();
        }
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));
        ctx.save(); TA.glow(k.team, 8);
        H.circle(0, 0, R);
        ctx.fillStyle = H.rad(-R * 0.35, -R * 0.4, R * 0.1, R * 1.1, [[0, '#f4f4f5'], [0.35, '#a1a1aa'], [0.8, '#3f3f46'], [1, '#18181b']]);
        ctx.fill(); ctx.restore();
        H.circle(0, 0, R); ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, R * 0.25); ctx.stroke();
    });
    // Tâm pháo kích: vòng ngắm màu đội, vạch xoay, bóng quả pháo đang rơi (giữ thông tin bán kính & giờ nổ)
    if (typeof MortarMarker !== 'undefined') {
        MortarMarker.prototype.draw = function () {
            if (!this.active) return;
            const now = Date.now();
            const age = (this.age !== undefined) ? this.age * (1000 / 60) : now - this.spawnTime;
            const progress = Math.min(1, age / this.detonateTime);
            const left = this.detonateTime - age;
            const echo = (this.echoCount || 0) > 0; // nổ bồi: cam, đứng yên tại chỗ
            const maxR = echo ? this.maxR * 0.9 : this.maxR;
            const hot = echo ? '#ff9f1c' : '#ff3b30';
            const team = H.teamOf(this.owner);
            const crit = left < 1000;
            const flash = crit && Math.floor(now / 100) % 2 === 0;
            ctx.save();
            ctx.translate(this.x, this.y);
            // vùng nổ cuối cùng (mờ) + vùng đang lớn dần
            ctx.beginPath(); ctx.arc(0, 0, maxR, 0, PI2);
            ctx.fillStyle = 'rgba(255,60,40,0.07)'; ctx.fill();
            ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,120,90,0.45)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
            const R = maxR * progress;
            ctx.beginPath(); ctx.arc(0, 0, R, 0, PI2);
            ctx.fillStyle = H.rad(0, 0, 0, Math.max(1, R), [[0, 'rgba(255,90,40,0.05)'], [1, 'rgba(255,60,40,0.32)']]);
            ctx.fill();
            ctx.shadowBlur = 10; ctx.shadowColor = flash ? '#facc15' : hot;
            ctx.strokeStyle = flash ? '#facc15' : hot; ctx.lineWidth = 3.5; ctx.stroke();
            ctx.shadowBlur = 0;
            // vòng ngắm màu đội xoay
            ctx.save(); ctx.rotate(now / 400);
            ctx.strokeStyle = team; ctx.lineWidth = 2.5;
            for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 14, i * Math.PI / 2 + 0.25, i * Math.PI / 2 + 1.3); ctx.stroke(); }
            ctx.restore();
            // tâm chữ thập
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-19, 0); ctx.lineTo(-7, 0); ctx.moveTo(7, 0); ctx.lineTo(19, 0);
            ctx.moveTo(0, -19); ctx.lineTo(0, -7); ctx.moveTo(0, 7); ctx.lineTo(0, 19); ctx.stroke();
            // quả pháo đang rơi: bóng thu nhỏ dần về tâm
            const fall = echo ? 0 : 1 - progress;
            ctx.fillStyle = `rgba(0,0,0,${0.25 + progress * 0.3})`;
            ctx.beginPath(); ctx.ellipse(0, 0, 3 + progress * 4, 2 + progress * 2.5, 0, 0, PI2); ctx.fill();
            const sy = -fall * 26;
            ctx.globalAlpha *= 0.4 + progress * 0.6;
            ctx.beginPath(); ctx.arc(0, sy, 3 + progress * 2.5, 0, PI2);
            ctx.fillStyle = H.rad(-1, sy - 1, 0.3, 5.5, [[0, '#e4e4e7'], [0.5, '#71717a'], [1, '#18181b']]); ctx.fill();
            ctx.globalAlpha = 1;
            // giờ nổ
            ctx.fillStyle = flash ? '#facc15' : '#ffffff';
            ctx.font = "bold 14px 'Orbitron', Arial";
            ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
            ctx.textAlign = 'center';
            const txt = (echo ? '↻ ' : '') + (Math.max(0, left) / 1000).toFixed(1);
            if (typeof drawWorldText === 'function') drawWorldText(ctx, txt, 0, -24); else ctx.fillText(txt, 0, -24);
            ctx.restore();
        };
    }

    // ==========================================
    // XE TANK (tank) — thân lớn nhất, bánh xích lộ rõ, gai nhọn phía trước; lao húc = sóng xung kích
    // ==========================================
    registerTankArt('tank', (p, k) => {
        const dashing = p.dashState === 1;
        const back = p.dashState === 2;
        const hot = k.evo1 || k.full;
        const orange = '#f97316';
        // sóng xung kích phía trước khi lao húc
        if (dashing) {
            ctx.save();
            const ph = (k.t * 6) % 1;
            for (let i = 0; i < 3; i++) {
                const f = (ph + i / 3) % 1;
                ctx.globalAlpha = (1 - f) * 0.9;
                TA.glow(k.team, 10);
                ctx.strokeStyle = i % 2 ? '#ffd8a8' : k.team; ctx.lineWidth = 2.4 - f;
                ctx.beginPath(); ctx.ellipse(0, -15 - f * 12, 14 + f * 8, 4 + f * 4, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
            }
            ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2; TA.noGlow();
            [-12, -6, 6, 12].forEach((x, i) => { ctx.beginPath(); ctx.moveTo(x, 16 + (i % 2) * 2); ctx.lineTo(x, 26 + (i % 2) * 4); ctx.stroke(); });
            ctx.restore();
        }
        // bánh xích lớn hai bên
        H.treads(-16, 6, -13, 16, k.t, '#111316', '#4a4f57', dashing ? 70 : (back ? -30 : 20));
        // bánh dẫn
        ctx.fillStyle = '#2b2f36';
        [-13, 13].forEach(x => { [-10, 13].forEach(y => { H.circle(x, y, 1.6); ctx.fill(); }); });
        // thân giáp
        H.poly([-10, -10, 10, -10, 10.5, 12, 7.5, 15, -7.5, 15, -10.5, 12]);
        ctx.fillStyle = H.lin(0, -10, 0, 15, [[0, '#52525b'], [0.5, '#3f3f46'], [1, '#1c1c1f']]);
        ctx.fill(); H.rim(k);
        // vạch cảnh báo cam (chevron)
        ctx.save();
        TA.rr(-8, 2, 16, 4.5, 1); ctx.clip();
        ctx.fillStyle = '#111'; ctx.fillRect(-8, 2, 16, 4.5);
        ctx.fillStyle = orange;
        for (let x = -12; x < 10; x += 4) { H.poly([x, 6.5, x + 2, 6.5, x + 4.5, 2, x + 2.5, 2]); ctx.fill(); }
        ctx.restore();
        // khối động cơ + ống xả
        TA.rr(-5.5, 8.5, 11, 5, 1.5); ctx.fillStyle = '#27272a'; ctx.fill();
        ctx.fillStyle = '#52525b'; for (let i = 0; i < 3; i++) ctx.fillRect(-4 + i * 3, 9.5, 2, 3);
        H.light(-7.5, 13, 1, k.team, 6); H.light(7.5, 13, 1, k.team, 6);
        // tháp chỉ huy
        TA.rr(-5, -6, 10, 7, 2);
        ctx.fillStyle = H.lin(0, -6, 0, 1, [[0, '#71717a'], [1, '#3f3f46']]); ctx.fill(); H.dark(0.7);
        ctx.save(); TA.glow(k.team, 8); ctx.fillStyle = k.team; TA.rr(-3.5, -4.6, 7, 1.8, 0.8); ctx.fill(); ctx.restore();
        // lưỡi ủi + gai nhọn phía trước
        H.poly([-13, -9.5, 13, -9.5, 11, -12.5, -11, -12.5]);
        ctx.fillStyle = H.lin(0, -12.5, 0, -9.5, [[0, '#a1a1aa'], [1, '#3f3f46']]); ctx.fill(); H.dark(0.7);
        const spikeCol = hot ? '#fdba74' : '#d4d4d8';
        ctx.save();
        if (hot || dashing) TA.glow(dashing ? k.team : orange, dashing ? 14 : 8);
        [[-9, -15.2], [-3, -16], [3, -16], [9, -15.2]].forEach(([x, tipY]) => {
            H.poly([x - 2.6, -12.4, x, tipY, x + 2.6, -12.4]);
            ctx.fillStyle = H.lin(x - 2.6, 0, x + 2.6, 0, [[0, '#52525b'], [0.5, spikeCol], [1, '#52525b']]);
            ctx.fill();
        });
        ctx.restore();
        ctx.strokeStyle = orange; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-11, -12.5); ctx.lineTo(11, -12.5); ctx.stroke();
        // Full Evo: lưỡi ủi nung đỏ
        if (k.full) {
            ctx.save(); TA.glow('#ff5a1f', 12);
            ctx.strokeStyle = `rgba(255,120,40,${0.6 + 0.3 * Math.sin(k.t * 6)})`; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(-13, -9.5); ctx.lineTo(13, -9.5); ctx.stroke();
            ctx.restore();
        }
    });

    // ==========================================
    // 6 NÒNG (six_barrel) — cụm sáu nòng xoay quanh trục
    // ==========================================
    registerTankArt('six_barrel', (p, k) => {
        const heat = Math.min(1, (p.heat || 0) / 100);
        const spinning = (p.sbSpin || 0) > 0;
        const spinRate = spinning ? Math.min(1, (p.sbSpin || 0) / 30) : 0;
        const rot = k.t * (2 + spinRate * 28);
        const over = p.isOverheated;
        const hr = Math.round(110 + heat * 145), hg = Math.round(115 - heat * 70), hb = Math.round(125 - heat * 100);
        const hotCol = `rgb(${hr},${hg},${hb})`;
        H.treads(-15.8, 4, -6, 15.5, k.t, '#17191d', '#4b5058');
        // thân
        TA.rr(-11.8, -4, 23.6, 19, 4);
        ctx.fillStyle = H.lin(0, -4, 0, 15, [[0, '#6b7280'], [0.5, '#4b5563'], [1, '#1f2329']]);
        ctx.fill(); H.rim(k);
        // trống đạn bên trái + băng đạn
        H.circle(-6.5, 9, 4); ctx.fillStyle = H.rad(-7.5, 8, 0.5, 4, [[0, '#9ca3af'], [1, '#374151']]); ctx.fill(); H.dark(0.6);
        ctx.save(); ctx.translate(-6.5, 9); ctx.rotate(rot * 0.15);
        ctx.fillStyle = '#d4a017'; for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillRect(-0.6, -3.3, 1.2, 1.8); } ctx.restore();
        ctx.fillStyle = '#b8860b';
        for (let i = 0; i < 4; i++) TA.rr(-3 + i * 1.6, 3.8 - i * 0.9, 1.3, 2.4, 0.4), ctx.fill();
        // tản nhiệt bên phải
        for (let i = 0; i < 3; i++) { ctx.fillStyle = heat > 0.5 ? hotCol : '#374151'; ctx.fillRect(4.5, 6 + i * 2.5, 6, 1.3); }
        // vỏ trục quay
        TA.rr(-7.5, -6, 15, 8, 3);
        ctx.fillStyle = H.lin(-7.5, 0, 7.5, 0, [[0, '#27272a'], [0.5, '#71717a'], [1, '#27272a']]); ctx.fill(); H.dark(0.7);
        // sáu nòng: chiếu ngang theo góc quay, nòng phía sau tối hơn
        const bars = [];
        for (let i = 0; i < 6; i++) {
            const a = rot + i * Math.PI / 3;
            bars.push({ x: Math.sin(a) * 4.3, d: Math.cos(a) });
        }
        bars.sort((a, b) => a.d - b.d);
        bars.forEach(bb => {
            const sh = 0.45 + 0.55 * (bb.d + 1) / 2;
            const w = 2.3;
            ctx.fillStyle = H.lin(bb.x - w / 2, 0, bb.x + w / 2, 0, [[0, '#1f2937'], [0.5, heat > 0.2 ? hotCol : '#d1d5db'], [1, '#1f2937']]);
            ctx.globalAlpha *= sh;
            TA.rr(bb.x - w / 2, -16, w, 12, 0.8); ctx.fill();
            ctx.globalAlpha /= sh;
        });
        // đai kẹp
        ctx.fillStyle = '#3f3f46';
        TA.rr(-6.2, -13, 12.4, 1.8, 0.8); ctx.fill();
        TA.rr(-6.2, -8.5, 12.4, 1.8, 0.8); ctx.fill();
        // đầu nòng nóng đỏ
        ctx.save();
        if (heat > 0.3) TA.glow('#ff3b1f', 6 + heat * 12);
        ctx.fillStyle = heat > 0.3 ? `rgba(255,${Math.round(160 - heat * 120)},40,${0.4 + heat * 0.6})` : '#52525b';
        TA.rr(-6, -16, 12, 1.6, 0.8); ctx.fill();
        ctx.restore();
        // đèn trục màu đội
        H.light(0, -2, 1.6, k.team, 8);
        // quá tải: khói bốc
        if (over) {
            for (let i = 0; i < 3; i++) {
                const ph = (k.t * 1.2 + i / 3) % 1;
                ctx.fillStyle = `rgba(160,160,160,${0.45 * (1 - ph)})`;
                H.circle((i - 1) * 4 + Math.sin(k.t * 3 + i) * 1.5, -12 + ph * 8, 1.5 + ph * 2.5); ctx.fill();
            }
        }
    });
    registerBulletArt('six_barrel', (b, color, o, k) => {
        // Viên tròn nhỏ + vệt sáng đều nhau; gây đốt -> cam đỏ
        const r = Math.max(1.8, Math.min(b.w, b.h) / 2);
        const burn = b.inflictBurn;
        const c = burn ? '#ff5a1f' : '#ffd166';
        const L = 10 + (k.sp || 1) * 1.2;
        ctx.fillStyle = H.lin(-L, 0, 0, 0, [[0, 'rgba(255,200,80,0)'], [1, burn ? 'rgba(255,90,31,0.85)' : 'rgba(255,209,102,0.8)']]);
        H.poly([-L, 0, 0, -r * 0.75, 0, r * 0.75]); ctx.fill();
        ctx.save(); TA.glow(k.team, 8);
        H.circle(0, 0, r * 1.15); ctx.fillStyle = k.team; ctx.fill(); ctx.restore();
        H.circle(0, 0, r * 0.8); ctx.fillStyle = c; ctx.fill();
        H.circle(r * 0.15, 0, r * 0.4); ctx.fillStyle = '#ffffff'; ctx.fill();
    });

    // ==========================================
    // LÒ NUNG (furnace) — thân đen, lò lửa trên lưng, khói bốc
    // ==========================================
    registerTankArt('furnace', (p, k) => {
        const en = Math.max(0, Math.min(1, (p.energy || 0) / (p.maxEnergy || 100)));
        const fl = 0.75 + 0.25 * Math.sin(k.t * 11) * Math.sin(k.t * 7.3);
        H.treads(-15.8, 4, -10, 15, k.t, '#0d0b0a', '#3a2f28');
        // thân đen
        H.poly([-8, -11, 8, -11, 11.6, -7, 11.6, 13, 8.5, 15.5, -8.5, 15.5, -11.6, 13, -11.6, -7]);
        ctx.fillStyle = H.lin(0, -11, 0, 15.5, [[0, '#2a2522'], [0.5, '#1c1917'], [1, '#0c0a09']]);
        ctx.fill(); H.rim(k);
        // vân nứt nhiệt cam
        ctx.strokeStyle = `rgba(255,110,30,${0.35 + en * 0.4})`; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-11, -5); ctx.lineTo(-8.5, -3); ctx.lineTo(-9.5, 0); ctx.moveTo(11, -5); ctx.lineTo(8.5, -3); ctx.lineTo(9.5, 0); ctx.stroke();
        // lò lửa trên lưng
        TA.rr(-8.5, 1.5, 17, 11.5, 3);
        ctx.fillStyle = '#3b2a20'; ctx.fill();
        ctx.strokeStyle = '#7c4a2d'; ctx.lineWidth = 1.1; ctx.stroke();
        // gạch lò
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(-8.5, 5); ctx.lineTo(-5.5, 5); ctx.moveTo(5.5, 5); ctx.lineTo(8.5, 5); ctx.moveTo(-8.5, 9); ctx.lineTo(-5.5, 9); ctx.moveTo(5.5, 9); ctx.lineTo(8.5, 9); ctx.stroke();
        // cửa lò rực lửa
        ctx.save();
        TA.glow('#ff6a00', 8 + en * 16 * fl);
        TA.rr(-5.5, 3, 11, 8.5, 2.5);
        ctx.fillStyle = H.rad(0, 8, 0.5, 7, [[0, '#fff3b0'], [0.35, '#ffb020'], [0.7, '#ff5a00'], [1, '#7a1d00']]);
        ctx.globalAlpha *= 0.35 + en * 0.65 * fl;
        ctx.fill();
        ctx.restore();
        // song chắn lò
        ctx.fillStyle = '#1c1917';
        for (let i = 0; i < 3; i++) ctx.fillRect(-3.6 + i * 3, 3, 1.2, 8.5);
        // ống khói hai góc sau + khói bốc (về phía sau xe)
        [-9.5, 9.5].forEach((x, i) => {
            H.circle(x, 13.2, 2); ctx.fillStyle = '#0c0a09'; ctx.fill();
            ctx.strokeStyle = '#57534e'; ctx.lineWidth = 0.9; ctx.stroke();
            for (let j = 0; j < 2; j++) {
                const ph = (k.t * 0.9 + j * 0.5 + i * 0.25) % 1;
                ctx.fillStyle = `rgba(120,113,108,${0.5 * (1 - ph)})`;
                H.circle(x + Math.sin(k.t * 2 + j + i) * 1.2 - Math.sign(x) * ph * 1.5, 13 + ph * 2.4, 1.3 + ph * 1.4); ctx.fill();
            }
        });
        // nòng phun lửa loe
        H.poly([-3, -3, 3, -3, 4.6, -15.5, -4.6, -15.5]);
        ctx.fillStyle = H.lin(-4.6, 0, 4.6, 0, [[0, '#1c1917'], [0.5, '#57534e'], [1, '#1c1917']]); ctx.fill(); H.dark(0.6);
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(-3.6, -9, 7.2, 1.4);
        // miệng phun đỏ lửa
        ctx.save(); TA.glow('#ff5a00', 6 + en * 10 * fl);
        TA.rr(-4.8, -16, 9.6, 2, 1); ctx.fillStyle = `rgba(255,${Math.round(90 + 80 * fl)},0,${0.5 + en * 0.5})`; ctx.fill();
        ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.rr(-4.8, -16, 9.6, 2, 1); ctx.stroke();
        // đèn màu đội ở hai vai
        H.light(-8, -8, 1.2, k.team, 6); H.light(8, -8, 1.2, k.team, 6);
        // Full Evo: lưỡi lửa liếm quanh miệng lò
        if (k.full) {
            ctx.save(); TA.glow('#ff7a00', 10);
            ctx.fillStyle = 'rgba(255,160,40,0.85)';
            for (let i = 0; i < 3; i++) {
                const x = -3.5 + i * 3.5, h = 2 + Math.abs(Math.sin(k.t * 9 + i * 2)) * 2.5;
                H.poly([x - 1.2, 3, x, 3 - h, x + 1.2, 3]); ctx.fill();
            }
            ctx.restore();
        }
    });
    registerBulletArt('furnace', (b, color, o, k) => {
        const t = k.t;
        if (b.type === 'fire_stream') {
            // Tia lửa dài: lưỡi lửa gradient, lõi vàng trắng, mép rung
            const L = Math.max(b.h, b.w), W = Math.min(b.h, b.w);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = H.lin(-L / 2, 0, L / 2, 0, [[0, 'rgba(120,20,0,0)'], [0.35, 'rgba(255,60,0,0.55)'], [0.8, 'rgba(255,130,20,0.8)'], [1, 'rgba(255,200,80,0.9)']]);
            ctx.beginPath(); ctx.moveTo(-L / 2, 0);
            for (let i = 0; i <= 8; i++) { const x = -L / 2 + L * i / 8; ctx.lineTo(x, -W * (0.3 + 0.5 * i / 8) - Math.sin(t / 30 + i * 1.7) * W * 0.18); }
            for (let i = 8; i >= 0; i--) { const x = -L / 2 + L * i / 8; ctx.lineTo(x, W * (0.3 + 0.5 * i / 8) + Math.sin(t / 27 + i * 2.1) * W * 0.18); }
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = H.lin(-L / 2, 0, L / 2, 0, [[0, 'rgba(255,240,180,0)'], [1, 'rgba(255,250,220,0.9)']]);
            TA.rr(-L * 0.3, -W * 0.18, L * 0.8, W * 0.36, W * 0.18); ctx.fill();
            ctx.restore();
            return;
        }
        // Cầu lửa cam tròn + đuôi lửa lập lòe
        const R = Math.max(3, Math.min(b.w, b.h) / 2) * 1.15;
        const zone = b.createFireZone || o.nextShotFireZone;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
            const f = i / 4;
            ctx.fillStyle = `rgba(255,${Math.round(150 - f * 100)},0,${0.55 - f * 0.12})`;
            H.circle(-R * (0.9 + i * 0.85), Math.sin(t / 40 + i * 1.9) * R * 0.35, R * (0.85 - f * 0.55)); ctx.fill();
        }
        ctx.restore();
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));
        ctx.save(); TA.glow('#ff6a00', 14);
        H.circle(0, 0, R);
        ctx.fillStyle = H.rad(0, 0, R * 0.1, R, [[0, '#fffbe6'], [0.35, '#ffd166'], [0.75, '#ff6a00'], [1, '#b42300']]);
        ctx.fill(); ctx.restore();
        H.circle(0, 0, R); ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, R * 0.2); ctx.stroke();
        if (zone) { ctx.strokeStyle = 'rgba(255,200,80,0.9)'; ctx.lineWidth = 1.3; H.circle(0, 0, R + 2.5 + Math.sin(t / 60)); ctx.stroke(); }
    });

    // ==========================================
    // SÚNG NƯỚC (water_gun) — bình nước lớn trên lưng, ống dẫn xuống nòng
    // ==========================================
    registerTankArt('water_gun', (p, k) => {
        const en = Math.max(0, Math.min(1, (p.energy || 0) / (p.maxEnergy || 100)));
        H.treads(-15.6, 3.8, -11, 14.5, k.t, '#0c1a2b', '#2f5a85');
        // thân
        TA.rr(-11.6, -10, 23.2, 24.5, 4.5);
        ctx.fillStyle = H.lin(0, -10, 0, 14.5, [[0, '#3f6fa3'], [0.5, '#24486f'], [1, '#11253d']]);
        ctx.fill(); H.rim(k);
        // bình nước lớn (kính)
        const tx = -8.5, ty = -1.5, tw = 17, th = 15;
        TA.rr(tx, ty, tw, th, 5.5);
        ctx.fillStyle = 'rgba(8,20,35,0.9)'; ctx.fill();
        ctx.save();
        TA.rr(tx + 1, ty + 1, tw - 2, th - 2, 4.6); ctx.clip();
        const lvl = ty + 1 + (th - 2) * (1 - en);
        ctx.fillStyle = H.lin(0, lvl, 0, ty + th, [[0, '#7dd3fc'], [0.5, '#0ea5e9'], [1, '#075985']]);
        ctx.beginPath(); ctx.moveTo(tx, ty + th);
        for (let x = tx; x <= tx + tw + 0.1; x += 1.5) ctx.lineTo(x, lvl + Math.sin(x * 0.7 + k.t * 4) * 0.7);
        ctx.lineTo(tx + tw, ty + th); ctx.closePath(); ctx.fill();
        // bọt khí
        ctx.fillStyle = 'rgba(224,247,255,0.75)';
        for (let i = 0; i < 4; i++) {
            const ph = (k.t * 0.7 + i * 0.29) % 1;
            const by = ty + th - 1.5 - ph * (th - 3);
            if (by > lvl + 0.8) { H.circle(tx + 3.5 + i * 3.4, by, 0.6 + ph * 0.4); ctx.fill(); }
        }
        ctx.restore();
        TA.rr(tx, ty, tw, th, 5.5);
        ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 1.2; ctx.stroke();
        // ánh kính
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tx + 2.6, ty + 3.5); ctx.lineTo(tx + 2.6, ty + th - 4); ctx.stroke();
        // đai giữ bình màu đội
        ctx.fillStyle = k.team; ctx.fillRect(tx - 0.6, ty + th * 0.5 - 0.8, 1.8, 1.6); ctx.fillRect(tx + tw - 1.2, ty + th * 0.5 - 0.8, 1.8, 1.6);
        // nắp bình
        TA.rr(-3, ty - 1.8, 6, 2.4, 1); ctx.fillStyle = '#94a3b8'; ctx.fill();
        // ống dẫn cong xuống nòng
        ctx.strokeStyle = '#0c4a6e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(6, ty); ctx.bezierCurveTo(9.5, -5, 6, -8, 2.5, -8.5); ctx.stroke();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.6; ctx.stroke();
        // dòng nước chạy trong ống
        ctx.save(); ctx.setLineDash([1.2, 2.2]); ctx.lineDashOffset = -k.t * 10;
        ctx.strokeStyle = '#e0f7ff'; ctx.lineWidth = 0.9; ctx.stroke(); ctx.restore();
        // nòng phun
        ctx.fillStyle = H.lin(-2.6, 0, 2.6, 0, [[0, '#334155'], [0.5, '#e2e8f0'], [1, '#334155']]);
        TA.rr(-2.6, -15, 5.2, 12, 1.5); ctx.fill();
        ctx.fillStyle = '#0369a1'; ctx.fillRect(-2.6, -11, 5.2, 1.3);
        // vòi phun
        TA.rr(-3.4, -16, 6.8, 2.6, 1.2); ctx.fillStyle = '#1e293b'; ctx.fill();
        ctx.save(); TA.glow('#38bdf8', 8);
        ctx.fillStyle = '#7dd3fc'; TA.rr(-1.6, -16, 3.2, 1.3, 0.6); ctx.fill(); ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.rr(-3.4, -16, 6.8, 2.6, 1.2); ctx.stroke();
        // đồng hồ áp suất
        H.circle(-7.5, -6.5, 2.2); ctx.fillStyle = '#e2e8f0'; ctx.fill(); ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.7; ctx.stroke();
        ctx.save(); ctx.translate(-7.5, -6.5); ctx.rotate(-2.3 + en * 4.6);
        ctx.strokeStyle = k.team; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -1.7); ctx.stroke(); ctx.restore();
        // Full Evo: vòng nước xoáy quanh bình
        if (k.full) {
            ctx.save(); ctx.translate(0, ty + th / 2); ctx.rotate(k.t * 2);
            ctx.strokeStyle = 'rgba(125,211,252,0.8)'; ctx.lineWidth = 1.2; TA.glow('#38bdf8', 6);
            ctx.beginPath(); ctx.ellipse(0, 0, 11, 9.5, 0, 0, 1.4); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(0, 0, 11, 9.5, 0, Math.PI, Math.PI + 1.4); ctx.stroke();
            ctx.restore();
        }
    });
    registerBulletArt('water_gun', (b, color, o, k) => {
        const t = k.t;
        if (b.type === 'water_stream') {
            // Tia nước dài: dòng xanh có gợn sóng, lõi trắng, giọt bắn
            const L = Math.max(b.h, b.w), W = Math.min(b.h, b.w);
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = H.lin(-L / 2, 0, L / 2, 0, [[0, 'rgba(14,165,233,0)'], [0.4, 'rgba(14,165,233,0.55)'], [1, 'rgba(125,211,252,0.9)']]);
            ctx.beginPath(); ctx.moveTo(-L / 2, 0);
            for (let i = 0; i <= 10; i++) { const x = -L / 2 + L * i / 10; ctx.lineTo(x, -W * 0.45 - Math.sin(t / 40 + i * 1.3) * W * 0.12); }
            for (let i = 10; i >= 0; i--) { const x = -L / 2 + L * i / 10; ctx.lineTo(x, W * 0.45 + Math.sin(t / 36 + i * 1.5) * W * 0.12); }
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(240,250,255,0.85)'; ctx.lineWidth = W * 0.22; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(L / 2, 0); ctx.stroke();
            ctx.restore();
            ctx.strokeStyle = H.teamOf(o); ctx.globalAlpha *= 0.6; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-L * 0.4, -W * 0.5); ctx.lineTo(L / 2, -W * 0.5); ctx.moveTo(-L * 0.4, W * 0.5); ctx.lineTo(L / 2, W * 0.5); ctx.stroke();
            return;
        }
        // Giọt nước tròn xanh (mũi tròn phía trước, đuôi thon)
        const R = Math.max(3, Math.min(b.w, b.h) / 2) * 1.1;
        ctx.fillStyle = 'rgba(125,211,252,0.35)';
        for (let i = 1; i <= 3; i++) { H.circle(-R * 1.4 - i * R * 0.9, Math.sin(t / 70 + i * 2) * R * 0.4, R * (0.45 - i * 0.08)); ctx.fill(); }
        ctx.save(); TA.glow('#38bdf8', 12);
        ctx.beginPath();
        ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2);
        ctx.quadraticCurveTo(-R * 1.2, R * 0.6, -R * 2.2, 0);
        ctx.quadraticCurveTo(-R * 1.2, -R * 0.6, 0, -R);
        ctx.closePath();
        ctx.fillStyle = H.lin(-R * 2.2, 0, R, 0, [[0, 'rgba(14,165,233,0.4)'], [0.6, '#38bdf8'], [1, '#e0f7ff']]);
        ctx.fill(); ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, R * 0.2); ctx.stroke();
        H.circle(R * 0.25, -R * 0.35, R * 0.25); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    });

    // ==========================================
    // SHORTGUN ATK (shortgunATK) — nòng kép lớn xoắn, khung cứng, đỏ & đen
    // ==========================================
    registerTankArt('shortgunATK', (p, k) => {
        const red = '#dc2626';
        const tele = (p.shortgunTelegraphTimer || 0) > 0;
        const dash = p.isShortgunDashing;
        H.treads(-15.6, 3.8, -8, 15, k.t, '#120a0a', '#4a2020', dash ? 60 : 20);
        // khung thân góc cạnh
        H.poly([-11.6, -6, -6, -9, 6, -9, 11.6, -6, 11.6, 11, 7, 15, -7, 15, -11.6, 11]);
        ctx.fillStyle = H.lin(0, -9, 0, 15, [[0, '#2a2a2e'], [0.5, '#18181b'], [1, '#09090b']]);
        ctx.fill(); H.rim(k);
        // giáp đỏ hai vai
        H.poly([-11.6, -5, -7, -7.5, -7, 4, -11.6, 6]); ctx.fillStyle = H.lin(-11.6, 0, -7, 0, [[0, '#7f1d1d'], [1, red]]); ctx.fill();
        H.poly([11.6, -5, 7, -7.5, 7, 4, 11.6, 6]); ctx.fillStyle = H.lin(11.6, 0, 7, 0, [[0, '#7f1d1d'], [1, red]]); ctx.fill();
        // giáp tăng cường (Evo 2)
        if (k.evo2 || k.full) {
            ctx.fillStyle = '#3f3f46';
            H.poly([-11.6, 7, -7, 6, -7, 11, -10, 13]); ctx.fill();
            H.poly([11.6, 7, 7, 6, 7, 11, 10, 13]); ctx.fill();
        }
        // mũi tên chỉ hướng trên thân
        ctx.save(); TA.glow(k.team, tele ? 12 : 5);
        ctx.fillStyle = k.team;
        H.poly([0, 3, 4.5, 8, 2.5, 8, 0, 5.6, -2.5, 8, -4.5, 8]); ctx.fill();
        H.poly([0, 7.5, 4.5, 12.5, 2.5, 12.5, 0, 10.1, -2.5, 12.5, -4.5, 12.5]); ctx.globalAlpha *= 0.55; ctx.fill();
        ctx.restore();
        // nòng kép lớn xoắn
        const bw = 6.2;
        [-4, 4].forEach((x, idx) => {
            ctx.fillStyle = H.lin(x - bw / 2, 0, x + bw / 2, 0, [[0, '#09090b'], [0.5, '#52525b'], [1, '#09090b']]);
            TA.rr(x - bw / 2, -15.5, bw, 15, 2); ctx.fill();
            // rãnh xoắn đỏ (chạy khi đang cảnh báo)
            ctx.save(); TA.rr(x - bw / 2, -15.5, bw, 15, 2); ctx.clip();
            ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 1.1;
            const off = tele ? (k.t * 18) % 5 : 0;
            for (let y = -18 + off; y < 2; y += 5) {
                ctx.beginPath(); ctx.moveTo(x - bw / 2, y + (idx ? 2.2 : 0)); ctx.lineTo(x + bw / 2, y + (idx ? 0 : 2.2)); ctx.stroke();
            }
            ctx.restore();
            // miệng nòng
            TA.rr(x - bw / 2 - 0.4, -16, bw + 0.8, 2.4, 1.1); ctx.fillStyle = '#18181b'; ctx.fill();
            ctx.save();
            const hot = tele || k.evo1 || k.full;
            if (hot) TA.glow(k.evo1 || k.full ? '#ff7a1a' : red, tele ? 14 : 6);
            H.circle(x, -14.8, 1.6); ctx.fillStyle = hot ? '#ff8a3d' : '#3f0d0d'; ctx.fill();
            ctx.restore();
        });
        // khung kẹp hai nòng
        TA.rr(-8, -9, 16, 2.8, 1); ctx.fillStyle = '#27272a'; ctx.fill();
        ctx.fillStyle = red; ctx.fillRect(-1.2, -9, 2.4, 2.8);
        TA.rr(-8, -3.5, 16, 2.4, 1); ctx.fillStyle = '#27272a'; ctx.fill();
        // đèn đuôi
        H.light(-8.5, 13.2, 1.1, k.team, 6); H.light(8.5, 13.2, 1.1, k.team, 6);
        // Full Evo: lửa rồng phả ra hai bên miệng nòng
        if (k.full) {
            ctx.save(); TA.glow('#ff5a00', 10);
            ctx.fillStyle = 'rgba(255,120,30,0.8)';
            [-1, 1].forEach(sd => {
                const h = 1.5 + Math.abs(Math.sin(k.t * 8 + sd)) * 2;
                H.poly([sd * 7.2, -15.5, sd * (7.2 + h), -14, sd * 7.2, -12.5]); ctx.fill();
            });
            ctx.restore();
        }
    });
    registerBulletArt('shortgunATK', (b, color, o, k) => {
        if (!(b.isShortgun || b.type === 'shortgun_pellet')) return false;
        // Sao chổi đỏ: đầu đỏ rực lõi trắng, đuôi gradient đỏ-đen, quầng màu đội
        const r = Math.max(2.5, Math.min(b.w, b.h) / 2);
        const L = Math.min(34, 8 + (k.sp || 1) * 2.4);
        ctx.fillStyle = H.lin(-L, 0, 0, 0, [[0, 'rgba(60,0,0,0)'], [0.6, 'rgba(220,38,38,0.6)'], [1, '#ff4d2e']]);
        H.poly([-L, 0, 0, -r * 0.95, 0, r * 0.95]); ctx.fill();
        ctx.save(); TA.glow(k.team, 10);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r * 1.05, 0, 0, PI2);
        ctx.fillStyle = H.rad(r * 0.2, 0, r * 0.1, r * 1.3, [[0, '#ffffff'], [0.35, '#ffb199'], [0.7, '#ef2b1d'], [1, '#7f1d1d']]);
        ctx.fill(); ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = Math.max(1, r * 0.25);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r * 1.05, 0, 0, PI2); ctx.stroke();
    });
    // Nón bộc phá / biển lửa của Shortgun ATK: nón gradient lửa, mép sáng, lưỡi lửa rung
    if (typeof ShortgunFireZone !== 'undefined') {
        const prevSG = ShortgunFireZone.prototype.draw;
        ShortgunFireZone.prototype.draw = function () {
            if (!this.active) return;
            const base = (this.dirY === -1) ? -Math.PI / 2 : Math.PI / 2;
            const alpha = Math.min(1, this.duration / 60);
            const t = Date.now();
            ctx.save();
            ctx.globalAlpha *= alpha;
            ctx.beginPath(); ctx.moveTo(this.x, this.y);
            ctx.arc(this.x, this.y, this.length, base - this.angleSpread, base + this.angleSpread); ctx.closePath();
            ctx.fillStyle = H.rad(this.x, this.y, 4, this.length, [[0, 'rgba(255,220,120,0.55)'], [0.4, 'rgba(255,110,20,0.38)'], [1, 'rgba(180,20,0,0.12)']]);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,150,40,0.7)'; ctx.lineWidth = 2; ctx.stroke();
            // các lưỡi lửa dọc nón
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 7; i++) {
                const a = base - this.angleSpread + (i + 0.5) * (this.angleSpread * 2 / 7);
                const d = this.length * (0.35 + 0.5 * ((Math.sin(t / 140 + i * 2.3) + 1) / 2));
                const x = this.x + Math.cos(a) * d, y = this.y + Math.sin(a) * d;
                ctx.fillStyle = 'rgba(255,140,30,0.35)';
                ctx.beginPath(); ctx.arc(x, y, 6 + 3 * Math.sin(t / 90 + i), 0, PI2); ctx.fill();
            }
            ctx.restore();
            // giữ tia lửa của bản gốc (hạt lửa)
            if (Math.random() < 0.3 && typeof spawnSparkParticles === 'function') {
                const rd = Math.random() * this.length;
                const ra = base + (Math.random() - 0.5) * (this.angleSpread * 2);
                spawnSparkParticles(this.x + Math.cos(ra) * rd, this.y + Math.sin(ra) * rd, '#ffaa00', 1);
            }
            void prevSG;
        };
    }
})();
