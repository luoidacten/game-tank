// ==========================================
// Art xe & đạn nhóm "support_summons" (registerTankArt / registerBulletArt)
// ------------------------------------------
// Xe: Xe Tiền (đổi theo cấp 0..6), Kỹ Sư, Nam Châm, Bình Phun, Móc Thép, DJ, Hoa Ảnh, Sấm Chớp.
// Vật triệu hồi / công trình (ghi đè draw(), chỉ đọc trạng thái): Ụ Kỹ Sư, Ụ / Khiên / Drone / Robot
// Kẻ Sáng Tạo, Drone Nhà Phát Minh, Tường Sniper, Bastion, Bóng nhử Ghost, Hồng tâm Pháo Cao Xạ.
// File này nạp SAU mọi script nhân vật nên được phép ghi đè prototype.draw ở đây.
// ==========================================
(function () {
    const PI2 = Math.PI * 2;

    // ---------- Tiện ích chung ----------
    function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); }
    function radial(x, y, r, c0, c1, c2) {
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
        return g;
    }
    function hexA(hex, a) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    // Thanh máu bo tròn, nền tối, viền mảnh (dùng cho ụ / drone / tường)
    function hpBar(x, y, w, ratio, color, h = 3) {
        ratio = Math.max(0, Math.min(1, ratio || 0));
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(5,8,18,0.85)';
        TA.rr(x - 1, y - 1, w + 2, h + 2, (h + 2) / 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.8; ctx.stroke();
        if (ratio > 0) {
            ctx.fillStyle = color;
            ctx.shadowBlur = 5; ctx.shadowColor = color;
            TA.rr(x, y, Math.max(h, w * ratio), h, h / 2); ctx.fill();
        }
        ctx.restore();
    }
    function teamOf(owner) { return (owner && TEAM_COLORS[owner.id]) || TEAM_COLORS[1]; }
    // Ký hiệu $ vẽ bằng nét (không dùng chữ để không bị lật ở P2)
    function dollar(x, y, r, color, lw) {
        ctx.save();
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + r * 0.62, y - r * 0.55);
        ctx.bezierCurveTo(x + r * 0.3, y - r * 0.95, x - r * 0.75, y - r * 0.8, x - r * 0.55, y - r * 0.2);
        ctx.bezierCurveTo(x - r * 0.35, y + r * 0.25, x + r * 0.65, y + r * 0.05, x + r * 0.6, y + r * 0.45);
        ctx.bezierCurveTo(x + r * 0.5, y + r * 0.95, x - r * 0.4, y + r * 0.9, x - r * 0.65, y + r * 0.5);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - r * 1.05); ctx.lineTo(x, y + r * 1.05); ctx.stroke();
        ctx.restore();
    }
    function sparkle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.25, y - r * 0.25); ctx.lineTo(x + r, y); ctx.lineTo(x + r * 0.25, y + r * 0.25);
        ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.25, y + r * 0.25); ctx.lineTo(x - r, y); ctx.lineTo(x - r * 0.25, y - r * 0.25);
        ctx.closePath(); ctx.fill();
    }
    // Tia điện zigzag giữa 2 điểm (seed theo thời gian -> giống nhau mọi máy trong cùng khung hình)
    function zap(x0, y0, x1, y1, seg, amp, seed) {
        ctx.beginPath(); ctx.moveTo(x0, y0);
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        for (let i = 1; i < seg; i++) {
            const f = i / seg, o = Math.sin(seed * 12.9898 + i * 78.233) * amp;
            ctx.lineTo(x0 + dx * f + nx * o, y0 + dy * f + ny * o);
        }
        ctx.lineTo(x1, y1); ctx.stroke();
    }
    function hullOutline(color, lw) {
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; TA.glow(color, 6); ctx.stroke(); ctx.restore();
    }

    // ==========================================
    // XE TIỀN — đổi hình theo cấp 0..6 trong shop
    // ==========================================
    registerTankArt('money_tank', (p, k) => {
        const lv = Math.max(0, Math.min(6, p.upgradeLevel | 0));
        const t = k.t;
        // Bảng màu: đồng thau (0-2) -> vàng kim (3-5) -> vàng hoàng gia (6)
        const pal = lv >= 6 ? { d: '#7a4f00', m: '#ffcf3a', l: '#fff6cf', rim: '#fff1a8' }
            : lv >= 3 ? { d: '#6d4a07', m: '#eab308', l: '#fde68a', rim: '#fcd34d' }
                : { d: '#4a3518', m: '#b8893a', l: '#e9cf94', rim: '#d6b46a' };
        // Hào quang vàng cấp 6
        if (lv >= 6) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 3);
            const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 16);
            g.addColorStop(0, 'rgba(255,215,0,0)'); g.addColorStop(0.7, `rgba(255,215,0,${0.18 + 0.12 * pulse})`); g.addColorStop(1, 'rgba(255,215,0,0)');
            ctx.fillStyle = g; circle(0, 0, 16); ctx.fill();
        }
        // Bánh xích
        TA.treads(-15, 4, -12, 13, t, '#241a0c', lv >= 3 ? '#a37b1f' : '#6b5530');
        // Cấp 3+: giáp sườn (Khiên)
        if (lv >= 3) {
            [-1, 1].forEach(sd => {
                ctx.fillStyle = TA.metal(sd * 15.5, sd * 10.5, pal.d, pal.rim);
                TA.rr(sd > 0 ? 10.6 : -15.6, -8, 5, 15, 1.6); ctx.fill();
                ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = '#7dd3fc'; circle(sd * 13.1, -0.5, 1.1); ctx.fill();
            });
        }
        // Cấp 2+: chồng xu trên đuôi hai dải xích
        if (lv >= 2) {
            [-1, 1].forEach(sd => {
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = i % 2 ? '#facc15' : '#fde68a';
                    TA.rr(sd * 13 - 2.2, 12.2 - i * 1.6, 4.4, 1.5, 0.7); ctx.fill();
                }
            });
        }
        // Thân chính vàng
        TA.glow(lv >= 6 ? '#ffd700' : 'rgba(0,0,0,0)', lv >= 6 ? 10 : 0);
        ctx.fillStyle = TA.metal(-11, 11, pal.d, pal.m);
        TA.rr(-11, -11.5, 22, 24, 4); ctx.fill();
        TA.noGlow();
        hullOutline(k.team, 1.3);
        // Cấp 1+: viền vàng chạm khắc + 4 đinh vàng
        if (lv >= 1) {
            ctx.strokeStyle = pal.rim; ctx.lineWidth = 0.9;
            TA.rr(-9.4, -10, 18.8, 21, 3); ctx.stroke();
            ctx.fillStyle = '#fff3b0';
            [[-8.2, -8.8], [8.2, -8.8], [-8.2, 1.5], [8.2, 1.5]].forEach(([x, y]) => { circle(x, y, 0.9); ctx.fill(); });
        }
        // Vệt sáng lấp lánh chạy ngang thân (cấp 4+)
        if (lv >= 4) {
            ctx.save();
            TA.rr(-11, -11.5, 22, 24, 4); ctx.clip();
            const sx = ((t * 18) % 60) - 30;
            const g = ctx.createLinearGradient(sx - 6, 0, sx + 6, 0);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g; ctx.transform(1, 0, -0.5, 1, 0, 0); ctx.fillRect(sx - 6, -14, 12, 30);
            ctx.restore();
        }
        // Két tiền phía sau (to dần theo cấp)
        const vh = 7 + lv * 0.5, vy = 12.5 - vh;
        ctx.fillStyle = TA.vgrad(vy, 12.5, '#3b3f46', '#1c1f24');
        TA.rr(-8.5, vy, 17, vh, 2); ctx.fill();
        ctx.strokeStyle = pal.rim; ctx.lineWidth = 1.2; ctx.stroke();
        // Vô lăng két / vương miện cấp 6
        const dx = 4.5, dy = vy + vh / 2 - 0.6;
        if (lv >= 6) {
            ctx.fillStyle = '#ffd700'; TA.glow('#ffd700', 6);
            ctx.beginPath();
            ctx.moveTo(-5, dy + 2.4); ctx.lineTo(-5.4, dy - 2); ctx.lineTo(-2.6, dy); ctx.lineTo(0, dy - 3.2);
            ctx.lineTo(2.6, dy); ctx.lineTo(5.4, dy - 2); ctx.lineTo(5, dy + 2.4); ctx.closePath(); ctx.fill();
            TA.noGlow();
            [['#ef4444', -3.2], ['#22d3ee', 0], ['#22c55e', 3.2]].forEach(([c, x]) => { ctx.fillStyle = c; circle(x, dy + 1, 0.9); ctx.fill(); });
        } else {
            ctx.strokeStyle = pal.l; ctx.lineWidth = 1;
            circle(dx, dy, 2.2); ctx.stroke();
            ctx.save(); ctx.translate(dx, dy); ctx.rotate(t * 0.8);
            for (let i = 0; i < 3; i++) { ctx.rotate(PI2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -2.2); ctx.stroke(); }
            ctx.restore();
            // Khe tiền
            ctx.fillStyle = '#0b0c0f'; TA.rr(-6.5, dy - 0.8, 6, 1.6, 0.8); ctx.fill();
            // Chồng xu nhô lên (cấp 1+)
            for (let i = 0; i < Math.min(3, lv); i++) {
                ctx.fillStyle = i % 2 ? '#facc15' : '#fde047';
                TA.rr(-6.5, dy - 2.6 - i * 1.3, 6, 1.4, 0.7); ctx.fill();
            }
        }
        // Đèn cấp độ (6 chấm) trên mép két
        for (let i = 0; i < 6; i++) {
            const on = i < lv;
            ctx.fillStyle = on ? (lv >= 6 ? '#fff3b0' : '#facc15') : 'rgba(255,255,255,0.13)';
            if (on) TA.glow('#facc15', 4);
            circle(-6.25 + i * 2.5, 11, 0.85); ctx.fill();
            TA.noGlow();
        }
        // Đồng xu $ giữa thân
        const cr = lv >= 6 ? 6.2 : 5.5;
        ctx.fillStyle = radial(0, -3.5, cr, '#fffbe6', lv >= 3 ? '#facc15' : '#d4a43a', pal.d);
        TA.glow('#ffd700', lv >= 3 ? 8 : 3);
        circle(0, -3.5, cr); ctx.fill();
        TA.noGlow();
        ctx.strokeStyle = pal.d; ctx.lineWidth = 0.9; circle(0, -3.5, cr - 1.1); ctx.stroke();
        ctx.save(); ctx.translate(0, -3.5); if (p.id === 2) ctx.scale(1, -1); // P2 bị lật trục y -> lật lại cho $ đúng chiều
        dollar(0, 0, cr * 0.62, '#5a3a00', 1.5);
        ctx.restore();
        // Hai nòng ngắn song song (đạn 2 viên)
        const blen = lv >= 4 ? 7.5 : 6;
        [-3.6, 3.6].forEach(x => {
            TA.barrel(x, -9.5, blen, 3, lv >= 3 ? '#fff1b8' : '#e2c98a');
            // mũi nòng: cấp 4 kim cương xuyên, cấp 5+ lõi nổ cam
            const ty = -9.5 - blen;
            ctx.fillStyle = lv >= 5 ? '#ff7a1a' : (lv >= 4 ? '#a5f3fc' : pal.rim);
            if (lv >= 4) TA.glow(ctx.fillStyle, 6);
            TA.rr(x - 2, ty - 0.4, 4, 1.8, 0.8); ctx.fill();
            TA.noGlow();
        });
        // Đèn đội ở mũi
        ctx.fillStyle = k.team; TA.glow(k.team, 6);
        TA.rr(-9.5, -11, 2.6, 1.8, 0.8); ctx.fill(); TA.rr(6.9, -11, 2.6, 1.8, 0.8); ctx.fill();
        TA.noGlow();
        // Evo 1 Tiền Tấn Công: 2 bệ phóng xe tiền mini hai góc trước
        if (k.evo1) {
            [-1, 1].forEach(sd => {
                ctx.fillStyle = '#7c2d12'; TA.rr(sd * 12.5 - 2, -15.5, 4, 5.5, 1); ctx.fill();
                ctx.fillStyle = '#facc15'; TA.rr(sd * 12.5 - 1.3, -15, 2.6, 2.2, 0.6); ctx.fill();
            });
        }
        // Evo 2 Sức Mạnh Đồng Tiền: viên kim cương xanh lục giữa hai nòng
        if (k.evo2) {
            const pulse = 0.6 + 0.4 * Math.sin(t * 4);
            ctx.fillStyle = '#34d399'; TA.glow('#34d399', 6 * pulse);
            ctx.beginPath(); ctx.moveTo(0, -13.5); ctx.lineTo(1.8, -11.3); ctx.lineTo(0, -9.3); ctx.lineTo(-1.8, -11.3); ctx.closePath(); ctx.fill();
            TA.noGlow();
        }
        // Cấp 6: lấp lánh quanh xe
        if (lv >= 6) {
            for (let i = 0; i < 4; i++) {
                const ph = (t * 1.6 + i * 0.25) % 1;
                const a = Math.sin(ph * Math.PI);
                const ang = i * 1.7 + Math.floor(t * 1.6 + i * 0.25) * 2.3;
                ctx.globalAlpha = a;
                sparkle(Math.cos(ang) * 13, Math.sin(ang) * 13, 1.2 + a * 1.4, '#fffbe6');
                ctx.globalAlpha = 1;
            }
        }
    });

    // Đạn Xe Tiền: cầu vàng tròn có quầng (d >= 10 vẫn là cầu tròn thuần)
    registerBulletArt('money_tank', (b, color, owner, k) => {
        const R = Math.min(b.w, b.h) / 2;
        const boom = !!b.isExplosive, pierce = !!b.isPiercing;
        const g = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 2.2);
        g.addColorStop(0, 'rgba(255,230,120,0.6)'); g.addColorStop(1, 'rgba(255,190,0,0)');
        ctx.fillStyle = g; circle(0, 0, R * 2.2); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = boom ? '#ff7a1a' : '#ffd700';
        ctx.fillStyle = radial(0, 0, R, '#fffbe6', '#facc15', boom ? '#c2410c' : '#a16207');
        circle(0, 0, R); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = pierce ? '#a5f3fc' : k.team; ctx.lineWidth = Math.max(1, R * 0.28);
        circle(0, 0, R * 0.95); ctx.stroke();
        if (R >= 4) { ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0)); dollar(0, 0, R * 0.5, '#6b4300', Math.max(1, R * 0.22)); }
        return true;
    });

    // ==========================================
    // KỸ SƯ — thân lớn cam/xám, mui trụ có cờ lê, thùng chứa ụ phía sau
    // ==========================================
    function wrench(len, w) {
        // cờ lê nằm dọc trục x, tâm (0,0)
        ctx.fillStyle = TA.metal(-w, w, '#6b7280', '#e5e7eb');
        TA.rr(-len / 2 + 2, -w / 2, len - 4, w, w / 2); ctx.fill();
        ctx.beginPath(); ctx.arc(len / 2 - 1, 0, w * 1.35, 0, PI2); ctx.fill();
        ctx.beginPath(); ctx.arc(-len / 2 + 1, 0, w * 1.15, 0, PI2); ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(len / 2 - 1, -w * 0.45, w * 1.6, w * 0.9);
        circle(-len / 2 + 1, 0, w * 0.5); ctx.fill();
    }
    registerTankArt('engineer', (p, k) => {
        const t = k.t;
        const ov = !!p.isOverloaded;
        TA.treads(-16, 4.5, -14, 14, t, '#1c1f26', '#5b6170');
        // Thân thép xám + nắp cam
        ctx.fillStyle = TA.metal(-11.5, 11.5, '#2d333d', '#7b8494');
        TA.rr(-11.5, -13, 23, 26, 3); ctx.fill();
        hullOutline(k.team, 1.3);
        ctx.fillStyle = TA.vgrad(-11, 4, '#fb923c', '#c2410c');
        TA.rr(-9.5, -11, 19, 15, 3); ctx.fill();
        // Sọc cảnh báo ở mũi
        ctx.save();
        TA.rr(-9.5, -13, 19, 2.6, 1); ctx.clip();
        ctx.fillStyle = '#111827'; ctx.fillRect(-10, -13, 20, 2.6);
        ctx.fillStyle = '#facc15';
        for (let x = -12; x < 12; x += 3.2) { ctx.beginPath(); ctx.moveTo(x, -10.4); ctx.lineTo(x + 1.6, -10.4); ctx.lineTo(x + 3.2, -13); ctx.lineTo(x + 1.6, -13); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        // Thùng chứa ụ (phía sau)
        ctx.fillStyle = TA.vgrad(5, 13, '#57534e', '#292524');
        TA.rr(-8, 5.5, 16, 7.5, 1.5); ctx.fill();
        ctx.strokeStyle = '#fdba74'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(253,186,116,0.55)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(-8, 5.5); ctx.lineTo(8, 13); ctx.moveTo(8, 5.5); ctx.lineTo(-8, 13); ctx.stroke();
        // ụ mini trong thùng + đèn đội
        ctx.fillStyle = '#9ca3af'; circle(0, 9.2, 2.2); ctx.fill();
        ctx.fillStyle = k.team; TA.glow(k.team, 6);
        circle(-6, 7.4, 0.95); ctx.fill(); circle(6, 7.4, 0.95); ctx.fill();
        TA.noGlow();
        // Mui trụ tròn + cờ lê bắt chéo
        ctx.fillStyle = radial(0, -3, 7, '#d1d5db', '#6b7280', '#1f2937');
        circle(0, -3, 7); ctx.fill();
        ctx.strokeStyle = ov ? '#22d3ee' : '#fb923c'; ctx.lineWidth = 1.5;
        if (ov) TA.glow('#22d3ee', 10);
        circle(0, -3, 7); ctx.stroke();
        TA.noGlow();
        ctx.save(); ctx.translate(0, -3); ctx.rotate(-0.78); wrench(15, 2.2); ctx.restore();
        // Nòng
        TA.barrel(0, -7, 9, 3.6, '#e5e7eb', '#fb923c');
        ctx.fillStyle = '#374151'; circle(0, -3, 2.6); ctx.fill();
        ctx.fillStyle = ov ? '#67e8f9' : k.team; circle(0, -3, 1.4); ctx.fill();
        // Evo 1: ăng-ten đèn nháy
        if (k.evo1) {
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(8.5, -9); ctx.lineTo(10, -15); ctx.stroke();
            ctx.fillStyle = (Math.floor(t * 3) % 2) ? '#22c55e' : '#14532d'; TA.glow('#22c55e', 5);
            circle(10, -15, 1.2); ctx.fill(); TA.noGlow();
        }
        // Evo 2: chảo mạng LAN
        if (k.evo2) {
            ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 1.4; TA.glow('#2dd4bf', 5);
            ctx.beginPath(); ctx.arc(-9.5, -9.5, 3.2, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
            const wv = (t * 1.5) % 1;
            ctx.globalAlpha = 1 - wv; ctx.beginPath(); ctx.arc(-9.5, -9.5, 3.2 + wv * 3, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
            ctx.globalAlpha = 1; TA.noGlow();
        }
        // Quá tải: tia điện quanh xe
        if (ov) {
            ctx.strokeStyle = 'rgba(165,243,252,0.9)'; ctx.lineWidth = 1; TA.glow('#22d3ee', 8);
            const sd = Math.floor(t * 20);
            zap(-11, -6, -4, 2, 4, 1.6, sd); zap(11, 4, 4, -9, 4, 1.6, sd + 7);
            TA.noGlow();
        }
    });
    registerBulletArt('engineer', (b, color, owner, k) => {
        const smart = !!b.isSmartTurret;
        const c = smart ? '#22d3ee' : '#fb923c';
        const r = Math.max(2, Math.min(b.w, b.h) / 2);
        const L = Math.min(30, 6 + k.sp * 3);
        const g = ctx.createLinearGradient(-L, 0, 0, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, c);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -r * 0.9); ctx.lineTo(0, r * 0.9); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = c;
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r, 0, 0, PI2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(r * 0.2, 0, r * 0.6, r * 0.45, 0, 0, PI2); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r, 0, 0, PI2); ctx.stroke();
        return true;
    });

    // ==========================================
    // NAM CHÂM — thân chia đôi đỏ (+) / xanh (−), nam châm móng ngựa trên nắp
    // ==========================================
    registerTankArt('magnet', (p, k) => {
        const t = k.t;
        const pos = (p.magnetPolarity || 1) === 1;
        TA.treads(-16, 4.5, -13, 14, t, '#1b1f27', '#545b69');
        // Hai nửa thân
        ctx.save();
        TA.rr(-11.5, -12.5, 23, 25.5, 4); ctx.clip();
        ctx.fillStyle = TA.vgrad(-12.5, 13, '#e2543f', '#7f1d1d'); ctx.fillRect(-12, -13, 12, 27);
        ctx.fillStyle = TA.vgrad(-12.5, 13, '#3b8fd9', '#0c3a66'); ctx.fillRect(0, -13, 12, 27);
        // nửa đang kích hoạt sáng lên
        ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.08 * Math.sin(t * 6)})`;
        ctx.fillRect(pos ? -12 : 0, -13, 12, 27);
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-0.7, -13, 1.4, 27);
        ctx.restore();
        TA.rr(-11.5, -12.5, 23, 25.5, 4);
        hullOutline(k.team, 1.6);
        // Dấu + / −
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-8.6, 8.5); ctx.lineTo(-4.4, 8.5); ctx.moveTo(-6.5, 6.4); ctx.lineTo(-6.5, 10.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4.4, 8.5); ctx.lineTo(8.6, 8.5); ctx.stroke();
        // Vòng từ trường dưới chân nam châm
        ctx.strokeStyle = pos ? 'rgba(255,120,90,0.6)' : 'rgba(120,200,255,0.6)'; ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
            const f = (t * 0.9 + i * 0.5) % 1;
            ctx.globalAlpha = 1 - f;
            circle(0, -1, 5 + f * 6); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Nam châm móng ngựa (mở về phía trước)
        ctx.lineCap = 'butt';
        ctx.lineWidth = 3.6;
        ctx.strokeStyle = TA.metal(-7, 7, '#6b7280', '#e5e7eb');
        ctx.beginPath(); ctx.moveTo(-4.6, -9); ctx.lineTo(-4.6, -1); ctx.arc(0, -1, 4.6, Math.PI, 0, true); ctx.lineTo(4.6, -9); ctx.stroke();
        // Hai cực
        ctx.fillStyle = '#ef4444'; if (pos) TA.glow('#ff5533', 10);
        TA.rr(-6.4, -15, 3.6, 6.2, 0.8); ctx.fill(); TA.noGlow();
        ctx.fillStyle = '#3b82f6'; if (!pos) TA.glow('#33aaff', 10);
        TA.rr(2.8, -15, 3.6, 6.2, 0.8); ctx.fill(); TA.noGlow();
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(-6.4, -10.2, 3.6, 1.1); ctx.fillRect(2.8, -10.2, 3.6, 1.1);
        // Đường sức từ giữa hai cực
        ctx.strokeStyle = pos ? '#ffb4a2' : '#a5d8ff'; ctx.lineWidth = 1; TA.glow(pos ? '#ff5533' : '#33aaff', 6);
        const ph = (t * 3) % 1;
        for (let i = 0; i < 2; i++) {
            const bend = 2.5 + i * 2.2;
            ctx.setLineDash([1.5, 1.5]); ctx.lineDashOffset = (pos ? -1 : 1) * ph * 6;
            ctx.beginPath(); ctx.moveTo(-4.6, -15); ctx.quadraticCurveTo(0, -15 - bend, 4.6, -15); ctx.stroke();
        }
        ctx.setLineDash([]); TA.noGlow();
        // Lõi đội
        ctx.fillStyle = '#0f172a'; circle(0, -1, 2.6); ctx.fill();
        ctx.fillStyle = k.team; TA.glow(k.team, 6); circle(0, -1, 1.5); ctx.fill(); TA.noGlow();
        // Evo: cuộn dây đồng hai bên; Full: hạt từ tính xoay quanh
        if (k.evo1 || k.evo2) {
            [-1, 1].forEach(sd => {
                ctx.fillStyle = '#b45309'; TA.rr(sd * 9.5 - 1.6, -6, 3.2, 8, 1); ctx.fill();
                ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 0.8;
                for (let y = -5; y < 2; y += 1.6) { ctx.beginPath(); ctx.moveTo(sd * 9.5 - 1.6, y); ctx.lineTo(sd * 9.5 + 1.6, y + 0.6); ctx.stroke(); }
            });
        }
        if (k.full) {
            for (let i = 0; i < 4; i++) {
                const a = t * 2.2 + i * Math.PI / 2;
                ctx.fillStyle = i % 2 ? '#60a5fa' : '#f87171'; TA.glow(ctx.fillStyle, 6);
                circle(Math.cos(a) * 14.2, Math.sin(a) * 14.2, 1.3); ctx.fill();
            }
            TA.noGlow();
        }
    });
    // Đạn Nam Châm (được gọi từ js/player/render.js)
    window.drawMagnetBulletArt = function (b) {
        const pos = b.polarity === 1;
        const c = pos ? '#ff4422' : '#1ea7ff';
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, R = b.w / 2 + 1;
        const team = teamOf(b.owner).team;
        ctx.save();
        const g = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.2);
        g.addColorStop(0, hexA(c, 0.5)); g.addColorStop(1, hexA(c, 0));
        ctx.fillStyle = g; circle(cx, cy, R * 2.2); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = c;
        ctx.fillStyle = radial(cx, cy, R, '#ffffff', c, pos ? '#7f1d1d' : '#0c3a66');
        circle(cx, cy, R); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = team; ctx.lineWidth = 1; circle(cx, cy, R); ctx.stroke();
        // vòng từ xoay
        const a = Date.now() / 120;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, R + 2.2, a, a + 1.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, R + 2.2, a + Math.PI, a + Math.PI + 1.2); ctx.stroke();
        // dấu cực
        const s = R * 0.5;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.3, R * 0.3); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
        if (pos) { ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s); }
        ctx.stroke();
        ctx.restore();
    };
    // Huy hiệu cực: chuyển sang cạnh xe cho khỏi đè lên thân
    Player.prototype.drawUIForMagnet = function (uiY, subUiY) {
        if (this.weapon !== 'magnet') return;
        const isPos = (this.magnetPolarity === 1);
        const right = this.x + this.w + 14 < canvas.width;
        const bx = right ? this.x + this.w + 8 : this.x - 8, by = this.y + this.h / 2;
        const c = isPos ? '#ff4422' : '#1ea7ff';
        ctx.save();
        ctx.shadowBlur = 8; ctx.shadowColor = c;
        ctx.fillStyle = c; circle(bx, by, 5.5); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx - 2.6, by); ctx.lineTo(bx + 2.6, by);
        if (isPos) { ctx.moveTo(bx, by - 2.6); ctx.lineTo(bx, by + 2.6); }
        ctx.stroke();
        ctx.restore();
        if (this.isPolarDashing) { if (this.drawPolarDashFx) this.drawPolarDashFx(); }
        else if (this.drawMagnetDashCue) this.drawMagnetDashCue();
    };
    // HUD nút Bắn: hồi / sẵn sàng Lướt Cực Tính (nhấp khi có mục tiêu KHÁC CỰC phía trước)
    if (typeof registerEmpowerHUD === 'function') registerEmpowerHUD('magnet', p => {
        const col = p.magnetPolarity === 1 ? '#ff4422' : '#1ea7ff';
        if (p.isPolarDashing) return { pct: 1, ready: true, label: 'LƯỚT CỰC!', color: col, idle: true, btnIcon: '🧲' };
        if (p.polarDashCd > 0) return { pct: 1 - p.polarDashCd / 180, ready: false, label: 'LƯỚT ⌛' + Math.ceil(p.polarDashCd / 60) + 's', color: '#64748b', idle: true, btnIcon: '🧲' };
        const f = p.findPolarDashTarget ? p.findPolarDashTarget() : null;
        if (f) return { pct: 1, ready: true, label: f.kind === 'enemy' ? 'HÚT VA CHẠM!' : 'LƯỚT TỚI CỘT!', color: col, idle: true, btnIcon: '🧲' };
        return { pct: 1, ready: false, label: '', color: col, idle: true };
    });

    // ==========================================
    // BÌNH PHUN — vòi hình nón lớn phía trước, 3 bình hoá chất phía sau
    // ==========================================
    const SPR_CHEMS = ['fire', 'acid', 'ice'];
    const SPR_COL = { fire: ['#ff6a1a', '#7c1d06'], acid: ['#7bf85c', '#14532d'], ice: ['#5ee7ff', '#0e4a5c'] };
    registerTankArt('sprayer', (p, k) => {
        const t = k.t;
        const chem = SPR_COL[p.spChem] ? p.spChem : 'fire';
        const col = SPR_COL[chem][0];
        const on = !!p.spOn;
        TA.treads(-16, 4.5, -11, 14, t, '#1e2028', '#5a606e');
        // Thân
        ctx.fillStyle = TA.metal(-11.5, 11.5, '#2b303a', '#8a93a3');
        TA.rr(-11.5, -9, 23, 22, 3.5); ctx.fill();
        hullOutline(k.team, 1.3);
        // 3 bình (sau)
        SPR_CHEMS.forEach((c, i) => {
            const x = -9.6 + i * 6.6, act = c === chem;
            const [cl, cd] = SPR_COL[c];
            ctx.fillStyle = '#0f172a'; TA.rr(x - 0.4, 0.6, 6, 12, 2.6); ctx.fill();
            const lvl = act && on ? 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 5)) : 0.8;
            ctx.save(); TA.rr(x, 1, 5.2, 11.2, 2.4); ctx.clip();
            ctx.fillStyle = hexA(cl, 0.18); ctx.fillRect(x, 1, 5.2, 11.2);
            ctx.fillStyle = TA.vgrad(1, 12, cl, cd);
            if (act) TA.glow(cl, 8);
            ctx.fillRect(x, 12.2 - 11.2 * lvl, 5.2, 11.2 * lvl);
            TA.noGlow();
            // bọt
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            circle(x + 1.6, 12.2 - 11.2 * lvl + 1.2 + ((t * 3 + i) % 1) * 6, 0.6); ctx.fill();
            ctx.restore();
            ctx.strokeStyle = act ? '#ffffff' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = act ? 1.2 : 0.8;
            TA.rr(x, 1, 5.2, 11.2, 2.4); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 0.8, 2.5, 1, 7);
        });
        // Ống dẫn từ bình tới vòi
        ctx.lineWidth = 1.5;
        SPR_CHEMS.forEach((c, i) => {
            const x = -7 + i * 6.6;
            ctx.strokeStyle = c === chem ? SPR_COL[c][0] : 'rgba(148,163,184,0.7)';
            ctx.beginPath(); ctx.moveTo(x, 1); ctx.quadraticCurveTo(x * 0.7, -3, x * 0.25, -6); ctx.stroke();
        });
        // Vòi hình nón (loa kèn)
        ctx.fillStyle = TA.metal(-7, 7, '#475569', '#e2e8f0');
        ctx.beginPath();
        ctx.moveTo(-3, -5.5); ctx.lineTo(3, -5.5); ctx.lineTo(7.2, -15.2); ctx.quadraticCurveTo(0, -16.6, -7.2, -15.2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.stroke();
        // vòng gân
        ctx.strokeStyle = 'rgba(15,23,42,0.6)'; ctx.lineWidth = 0.9;
        [[-8.6, 3.6], [-11.8, 5.3]].forEach(([y, hw]) => { ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke(); });
        // miệng vòi theo màu hoá chất
        ctx.fillStyle = col; TA.glow(col, on ? 14 : 6);
        ctx.beginPath(); ctx.ellipse(0, -15.2, 6.4, 1.3, 0, 0, PI2); ctx.fill();
        TA.noGlow();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(0, -15.2, 3, 0.55, 0, 0, PI2); ctx.fill();
        // Khớp nối
        ctx.fillStyle = '#334155'; TA.rr(-4, -7, 8, 3, 1.2); ctx.fill();
        ctx.fillStyle = k.team; TA.glow(k.team, 5); circle(0, -5.5, 1); ctx.fill(); TA.noGlow();
        // Evo: ống tăng áp 2 bên vòi
        if (k.evo1) {
            [-1, 1].forEach(sd => { ctx.fillStyle = '#64748b'; TA.rr(sd * 9 - 1.2, -11, 2.4, 7, 1); ctx.fill(); ctx.fillStyle = col; circle(sd * 9, -11.2, 1.1); ctx.fill(); });
        }
        if (k.evo2) {
            ctx.strokeStyle = hexA(col, 0.8); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-11, -2.5); ctx.lineTo(11, -2.5); ctx.stroke();
        }
    });

    // ==========================================
    // MÓC THÉP — thân vuông lớn bọc thép, tời quay giữa thân, bệ móc ở mũi
    // ==========================================
    registerTankArt('steel_hook', (p, k) => {
        const t = k.t;
        const ph = p.shPhase;
        TA.treads(-16, 5, -14.5, 15, t, '#171b22', '#5d6876');
        // Thân thép vuông
        ctx.fillStyle = TA.metal(-11.5, 11.5, '#38414d', '#a9b4c2');
        TA.rr(-11.5, -13.5, 23, 27.5, 2.5); ctx.fill();
        hullOutline(k.team, 1.3);
        // Tấm thép + đinh tán
        ctx.strokeStyle = 'rgba(15,20,28,0.55)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(-11, -6); ctx.lineTo(11, -6); ctx.moveTo(-11, 8); ctx.lineTo(11, 8); ctx.stroke();
        ctx.fillStyle = '#dbe3ec';
        [[-9.5, -11.8], [9.5, -11.8], [-9.5, 12], [9.5, 12], [-9.5, 1], [9.5, 1]].forEach(([x, y]) => { circle(x, y, 0.8); ctx.fill(); });
        // Evo 1: giáp gầm mũi dày
        if (k.evo1) {
            ctx.fillStyle = TA.metal(-11, 11, '#4b5563', '#e2e8f0');
            ctx.beginPath(); ctx.moveTo(-11.5, -13.5); ctx.lineTo(11.5, -13.5); ctx.lineTo(9, -10.5); ctx.lineTo(-9, -10.5); ctx.closePath(); ctx.fill();
        }
        // Tời quay
        const spin = (ph === 'retract' || ph === 'drag' || ph === 'zip') ? t * 25 : (ph === 'fly' ? -t * 20 : 0);
        ctx.fillStyle = '#1f2833'; TA.glow('#7fdcff', 8);
        circle(0, 1, 8.6); ctx.fill(); TA.noGlow();
        ctx.strokeStyle = '#d5dee8'; ctx.lineWidth = 1.8; circle(0, 1, 8.6); ctx.stroke();
        // cuộn xích quanh tời
        ctx.strokeStyle = '#5b6777'; ctx.lineWidth = 1.6; circle(0, 1, 6.6); ctx.stroke();
        ctx.strokeStyle = '#c3ccd7'; ctx.lineWidth = 0.9; ctx.setLineDash([1.6, 1.2]); ctx.lineDashOffset = spin; circle(0, 1, 6.6); ctx.stroke(); ctx.setLineDash([]);
        ctx.save(); ctx.translate(0, 1); ctx.rotate(spin * 0.3);
        ctx.strokeStyle = '#d5dee8'; ctx.lineWidth = 1.3;
        for (let i = 0; i < 3; i++) { ctx.rotate(PI2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -5); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = k.team; TA.glow(k.team, 8); circle(0, 1, 2); ctx.fill(); TA.noGlow();
        // Bệ móc ở mũi + dây xích nối tời -> bệ
        ctx.strokeStyle = '#8b97a7'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0, -7.6); ctx.lineTo(0, -12.5); ctx.stroke();
        ctx.fillStyle = TA.metal(-5, 5, '#2b3440', '#94a3b8');
        TA.rr(-5, -16, 10, 4.2, 1.2); ctx.fill();
        ctx.fillStyle = '#7fdcff'; TA.glow('#7fdcff', 6); TA.rr(-2.4, -15.6, 4.8, 1.2, 0.6); ctx.fill(); TA.noGlow();
        // Evo 2: cuộn xích dự phòng hai bên
        if (k.evo2) {
            [-1, 1].forEach(sd => {
                ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 1.2; TA.glow('#c4b5fd', 5);
                for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(sd * 8.2, 10.5 - i * 1.8, 2.2, 1, 0, 0, PI2); ctx.stroke(); }
                TA.noGlow();
            });
        }
        // Đèn đội góc sau
        ctx.fillStyle = k.team; TA.glow(k.team, 6);
        TA.rr(-10.5, 12, 3, 1.6, 0.8); ctx.fill(); TA.rr(7.5, 12, 3, 1.6, 0.8); ctx.fill();
        TA.noGlow();
    });

    // ==========================================
    // DJ — thân đen, loa lớn trên nắp, dải LED chạy theo nhịp
    // ==========================================
    const DJ_LED = ['#22c55e', '#facc15', '#ef4444', '#22d3ee', '#ff2fd1'];
    registerTankArt('dj', (p, k) => {
        const t = k.t;
        const pulse = Math.max(0, Math.min(1, p.djPulse || 0));
        TA.treads(-15.5, 3.6, -12, 13, t, '#0b0b12', '#3b3b52');
        // Thân đen bóng
        ctx.fillStyle = TA.metal(-12, 12, '#05050a', '#2a2a3a');
        TA.rr(-12, -13, 24, 26, 5); ctx.fill();
        hullOutline(k.team, 1.4);
        // Dải LED quanh mép (đuổi nhau theo nhịp)
        const N = 18, step = Math.floor(t * 8);
        for (let i = 0; i < N; i++) {
            const f = i / N, per = 2 * (21 + 23);
            let d = f * per, x, y;
            if (d < 21) { x = -10.5 + d; y = -11.4; }
            else if ((d -= 21) < 23) { x = 10.5; y = -11.4 + d; }
            else if ((d -= 23) < 21) { x = 10.5 - d; y = 11.6; }
            else { d -= 21; x = -10.5; y = 11.6 - d; }
            const c = DJ_LED[(i + step) % DJ_LED.length];
            const lit = ((i + step) % 3 !== 0) || pulse > 0.4;
            ctx.fillStyle = lit ? c : 'rgba(255,255,255,0.08)';
            if (lit) TA.glow(c, 4 + pulse * 6);
            circle(x, y, 0.95); ctx.fill();
        }
        TA.noGlow();
        // Thùng loa
        ctx.fillStyle = '#12121c'; TA.rr(-9, -9.5, 18, 19.5, 3); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8; ctx.stroke();
        // Loa trầm lớn (phập phồng theo nhịp)
        const R = 7.2 + pulse * 0.9;
        ctx.fillStyle = '#2b2b3b'; circle(0, 2, R + 0.6); ctx.fill();
        ctx.strokeStyle = pulse > 0.3 ? '#ff2fd1' : '#6b6b8a'; ctx.lineWidth = 1.3;
        if (pulse > 0.3) TA.glow('#ff2fd1', 10 * pulse);
        circle(0, 2, R + 0.6); ctx.stroke(); TA.noGlow();
        const cg = ctx.createRadialGradient(0, 2, 0.5, 0, 2, R);
        cg.addColorStop(0, '#4b4b63'); cg.addColorStop(0.35, '#151520'); cg.addColorStop(0.8, '#2e2e42'); cg.addColorStop(1, '#0a0a10');
        ctx.fillStyle = cg; circle(0, 2, R); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.7; circle(0, 2, R * 0.65); ctx.stroke();
        ctx.fillStyle = radial(0, 2, 2.4, '#ffffff', k.team, k.teamDark); circle(0, 2, 2.3 + pulse * 0.6); ctx.fill();
        // Loa tép phía trước (miệng sóng âm)
        ctx.fillStyle = '#20202e'; TA.rr(-4.5, -13.5, 9, 4.2, 1.6); ctx.fill();
        ctx.fillStyle = radial(0, -11.4, 1.8, '#ffffff', '#22d3ee', '#0e7490');
        TA.glow('#22d3ee', 6 + pulse * 8); circle(0, -11.4, 1.6); ctx.fill(); TA.noGlow();
        // Evo 1: thanh equalizer phía sau
        if (k.evo1) {
            for (let i = 0; i < 5; i++) {
                const h = 1.2 + 2.2 * Math.abs(Math.sin(t * 7 + i * 1.3)) * (0.6 + pulse * 0.6);
                ctx.fillStyle = DJ_LED[i];
                ctx.fillRect(-6 + i * 2.6, 13 - h, 1.6, h);
            }
        }
        // Evo 2: vòng sóng phát ra từ loa
        if (k.evo2) {
            const f = (t * 1.2) % 1;
            ctx.strokeStyle = `rgba(255,47,209,${0.6 * (1 - f)})`; ctx.lineWidth = 1;
            circle(0, 2, R + 1 + f * 4); ctx.stroke();
        }
    });
    // Bàn xoay cũ đè lên thân -> chỉ giữ hiệu ứng lên bậc combo (vòng vàng)
    if (typeof djDrawDeck === 'function') {
        djDrawDeck = function (p) {
            if (!(p.djTierFx > 0)) return;
            ctx.save();
            ctx.globalAlpha = p.djTierFx / 30;
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.shadowBlur = 10; ctx.shadowColor = '#facc15';
            circle(p.x + p.w / 2, p.y + p.h / 2, p.w * (1.4 - p.djTierFx / 60)); ctx.stroke();
            ctx.restore();
        };
    }

    // ==========================================
    // HOA ẢNH — thân tròn, 3 cánh hoa nhỏ xoay quanh
    // ==========================================
    function petal(x, y, s, rot, c0, c1) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        const g = ctx.createRadialGradient(0, s * 0.6, 0, 0, 0, s * 1.1);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, c0); g.addColorStop(1, c1);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.bezierCurveTo(-s * 0.95, s * 0.35, -s * 0.8, -s * 0.75, -s * 0.22, -s * 0.95);
        ctx.lineTo(0, -s * 0.62); ctx.lineTo(s * 0.22, -s * 0.95);
        ctx.bezierCurveTo(s * 0.8, -s * 0.75, s * 0.95, s * 0.35, 0, s);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }
    registerTankArt('flower_shadow', (p, k) => {
        const t = k.t;
        const emp = !!p.fsEmpowered;
        const pink = '#ff7eb6', light = '#ffd1e6', deep = '#c2185b';
        // Quầng hồng
        const ag = ctx.createRadialGradient(0, 0, 6, 0, 0, 16);
        ag.addColorStop(0, 'rgba(255,126,182,0)'); ag.addColorStop(0.75, `rgba(255,126,182,${emp ? 0.35 : 0.18})`); ag.addColorStop(1, 'rgba(255,126,182,0)');
        ctx.fillStyle = ag; circle(0, 0, 16); ctx.fill();
        // Thân tròn
        ctx.fillStyle = radial(0, 0, 10.5, '#fff0f7', pink, '#7a1340');
        TA.glow(pink, 8); circle(0, 0, 10.5); ctx.fill(); TA.noGlow();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.8; TA.glow(k.team, 6); circle(0, 0, 10.5); ctx.stroke(); TA.noGlow();
        // Vòng hoa văn trong
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.9; circle(0, 0, 7.8); ctx.stroke();
        // Hoa 5 cánh nhỏ ở tâm (xoay chậm)
        for (let i = 0; i < 5; i++) {
            const a = t * 0.6 + i * PI2 / 5;
            petal(Math.sin(a) * 3.1, -Math.cos(a) * 3.1, 2.8, a + Math.PI, light, deep);
        }
        ctx.fillStyle = '#fff7a8'; circle(0, 0, 1.4); ctx.fill();
        ctx.fillStyle = k.team; circle(0, 0, 0.8); ctx.fill();
        // Nhuỵ phía trước (miệng bắn cánh hoa)
        ctx.fillStyle = TA.metal(-1.8, 1.8, deep, light);
        TA.rr(-1.6, -14, 3.2, 4.5, 1.4); ctx.fill();
        ctx.fillStyle = '#fff7a8'; TA.glow('#fff7a8', 5); circle(0, -14, 1.5); ctx.fill(); TA.noGlow();
        // 3 cánh hoa bay quanh thân
        const sp = emp ? 2.6 : 1.4;
        const n = k.full ? 3 : 3;
        for (let i = 0; i < n; i++) {
            const a = t * sp + i * PI2 / 3;
            const x = Math.cos(a) * 12.8, y = Math.sin(a) * 12.8;
            if (emp) TA.glow('#ffffff', 8); else TA.glow(pink, 5);
            petal(x, y, 3.2, a + Math.PI / 2, emp ? '#ffffff' : light, emp ? pink : deep);
            TA.noGlow();
        }
        // Evo: lá xanh nhỏ hai bên (Evo 1), vòng kim tuyến (Evo 2)
        if (k.evo1) {
            [-1, 1].forEach(sd => {
                ctx.fillStyle = '#4ade80';
                ctx.beginPath(); ctx.ellipse(sd * 9.5, 7.5, 2.6, 1.2, sd * 0.7, 0, PI2); ctx.fill();
            });
        }
        if (k.evo2) {
            ctx.strokeStyle = 'rgba(255,240,170,0.85)'; ctx.lineWidth = 0.9;
            ctx.setLineDash([1.2, 2]); ctx.lineDashOffset = -t * 6; circle(0, 0, 9.2); ctx.stroke(); ctx.setLineDash([]);
        }
    });
    // Hoa to cũ vẽ đè lên thân -> bỏ riêng bông hoa ở tâm xe (giữ các hiệu ứng khác của hook)
    if (typeof CharHooks !== 'undefined' && CharHooks.registry && CharHooks.registry.flower_shadow && typeof CharHooks.registry.flower_shadow.draw === 'function' && typeof fsDrawFlower === 'function') {
        const origFsDraw = CharHooks.registry.flower_shadow.draw;
        CharHooks.registry.flower_shadow.draw = function () {
            const orig = fsDrawFlower, me = this;
            const cx = me.x + me.w / 2, cy = me.y + me.h / 2;
            fsDrawFlower = function (x, y) {
                if (Math.abs(x - cx) < 0.5 && Math.abs(y - cy) < 0.5) return;
                return orig.apply(this, arguments);
            };
            try { return origFsDraw.apply(this, arguments); } finally { fsDrawFlower = orig; }
        };
    }

    // Bản sao Phá / bóng trễ: vẽ bằng art xe (mờ, phủ hồng / tím) thay cho ô vuông
    if (typeof fsDrawCloneEntity === 'function' && typeof coreSmallArtAt === 'function') {
        const origClone = fsDrawCloneEntity;
        fsDrawCloneEntity = function (c, isShadow) {
            const o = c.owner;
            if (!c.active || !o || o.w !== c.w) return origClone.apply(this, arguments);
            ctx.save();
            const col = isShadow ? '#a96eff' : FS_PINK;
            const tr = c.trail || [];
            for (let i = 0; i < tr.length; i++) {
                ctx.fillStyle = hexA(col, 0.18 * (1 - i / tr.length));
                circle(c.x + c.w / 2, tr[i] + c.h / 2, c.w * 0.42); ctx.fill();
            }
            let a = isShadow ? 0.42 : 0.55;
            if (!isShadow && c.life < 40) a *= c.life / 40;
            ctx.shadowBlur = 12; ctx.shadowColor = col;
            coreSmallArtAt(o, c.x, c.y, a, null);
            ctx.shadowBlur = 0;
            if (c.phase > 0) fsDrawBlade(c.x + c.w / 2, c.y, c.h, fsDir(o), 0.8);
            ctx.restore();
        };
    }

    // ==========================================
    // SẤM CHỚP — thân nhỏ, ngọn giáo điện dựng trên nắp (giá giáo sau lưng giữ nguyên)
    // ==========================================
    registerTankArt('thunder', (p, k) => {
        const t = k.t;
        const sd = Math.floor(t * 16);
        TA.treads(-14, 3.6, -9, 11, t, '#151a2a', '#4b5675');
        // Thân nhỏ hình khiên
        ctx.fillStyle = TA.vgrad(-11, 12, '#334155', '#0f172a');
        ctx.beginPath();
        ctx.moveTo(0, -11.5); ctx.lineTo(9.5, -6); ctx.lineTo(9.5, 8); ctx.quadraticCurveTo(9.5, 12, 5.5, 12);
        ctx.lineTo(-5.5, 12); ctx.quadraticCurveTo(-9.5, 12, -9.5, 8); ctx.lineTo(-9.5, -6); ctx.closePath(); ctx.fill();
        hullOutline(k.team, 1.6);
        // Dải vàng điện hai bên
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-5.5, -6.5); ctx.lineTo(-5.5, 9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(8, -5); ctx.lineTo(5.5, -6.5); ctx.lineTo(5.5, 9); ctx.lineTo(8, 9); ctx.closePath(); ctx.fill();
        // Lõi tụ điện
        ctx.fillStyle = radial(0, 5, 3.6, '#ffffff', '#fde047', '#a16207');
        TA.glow('#fde047', 10); circle(0, 5, 3.4); ctx.fill(); TA.noGlow();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1; circle(0, 5, 3.4); ctx.stroke();
        // Ngọn giáo điện dựng dọc (mũi hướng về phía trước)
        ctx.save();
        ctx.translate(0, 0); ctx.rotate(-Math.PI / 2);
        // drawThunderSpearShape vẽ theo trục +x; scale nhỏ để vừa khung
        if (typeof drawThunderSpearShape === 'function') {
            ctx.scale(0.62, 0.62);
            ctx.translate(-1, 0);
            drawThunderSpearShape(28, 1, true);
        }
        ctx.restore();
        // Tia điện nhảy giữa hai cánh
        ctx.strokeStyle = 'rgba(186,230,253,0.9)'; ctx.lineWidth = 0.9; TA.glow('#7dd3fc', 6);
        if (sd % 3 !== 0) zap(-6.8, -3, 6.8, -1, 5, 1.6, sd);
        if (k.full || k.evo2) zap(-6.8, 7, 6.8, 9, 5, 1.6, sd + 3);
        TA.noGlow();
        // Evo 1: hai cột thu lôi nhỏ ở vai
        if (k.evo1) {
            [-1, 1].forEach(s2 => {
                ctx.fillStyle = '#cbd5e1'; TA.rr(s2 * 11.5 - 0.8, -12, 1.6, 6, 0.8); ctx.fill();
                ctx.fillStyle = '#fef08a'; TA.glow('#fde047', 6); circle(s2 * 11.5, -12.4, 1.2); ctx.fill(); TA.noGlow();
            });
        }
    });

    // ==========================================
    // VẬT TRIỆU HỒI / CÔNG TRÌNH
    // ==========================================

    // --- Ụ súng Kỹ Sư ---
    if (typeof Turret !== 'undefined') Turret.prototype.draw = function () {
        if (!this.active) return;
        const o = this.owner, tc = teamOf(o);
        const smart = !!this.isSmart;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, r = this.w / 2;
        const hasEvo2 = o.hasUpgrade('evo_eng_2');
        const full = o.hasUpgrade('evo_eng_1') && hasEvo2;
        const t = Date.now() / 1000;
        ctx.save();
        // Vòng mạng LAN (Evo 2) quanh ụ thường
        if (!smart && (hasEvo2 || full)) {
            ctx.strokeStyle = 'rgba(0,255,204,0.4)'; ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 10;
            circle(cx, cy, 50); ctx.stroke(); ctx.setLineDash([]);
        }
        // Đường ngắm cảnh báo của Ụ Thông Minh trong Quá Tải
        if (smart && o.isOverloaded && this.warningAlpha > 0) {
            const L = canvas.height;
            ctx.strokeStyle = `rgba(255,0,80,${this.warningAlpha * 0.85})`; ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 3]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(this.currentAngle) * L, cy + Math.sin(this.currentAngle) * L); ctx.stroke();
            ctx.setLineDash([]);
        }
        // Đế lục giác
        ctx.fillStyle = smart ? TA.vgrad(this.y, this.y + this.h, '#1e3a5f', '#0b1626') : TA.vgrad(this.y, this.y + this.h, '#6b7280', '#262b33');
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx.lineTo(cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 1.05); }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = smart ? '#22d3ee' : '#fb923c'; ctx.lineWidth = 1.4;
        if (smart) { ctx.shadowBlur = 8; ctx.shadowColor = '#22d3ee'; }
        ctx.stroke(); ctx.shadowBlur = 0;
        // đèn đội 3 góc
        ctx.fillStyle = tc.team;
        for (let i = 0; i < 3; i++) { const a = i * PI2 / 3 + Math.PI / 2; circle(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, 1.1); ctx.fill(); }
        // Đầu xoay + nòng
        ctx.translate(cx, cy); ctx.rotate(this.currentAngle);
        const bl = smart ? r + 6 : r + 4;
        ctx.fillStyle = TA.metal(-2, 2, '#4b5563', '#e5e7eb');
        if (smart) { TA.rr(0, -3.2, bl, 2.4, 1); ctx.fill(); TA.rr(0, 0.8, bl, 2.4, 1); ctx.fill(); }
        else { TA.rr(0, -1.6, bl, 3.2, 1.2); ctx.fill(); }
        ctx.fillStyle = smart ? '#67e8f9' : '#fb923c';
        ctx.fillRect(bl - 1.5, smart ? -3.4 : -1.9, 1.5, smart ? 6.8 : 3.8);
        ctx.fillStyle = smart ? radial(0, 0, r * 0.62, '#e0fbff', '#0e7490', '#082f49') : radial(0, 0, r * 0.62, '#f3f4f6', '#9ca3af', '#374151');
        circle(0, 0, r * 0.62); ctx.fill();
        ctx.strokeStyle = smart ? '#a5f3fc' : '#fdba74'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = smart ? '#ecfeff' : tc.team;
        if (smart) { ctx.shadowBlur = 6; ctx.shadowColor = '#22d3ee'; }
        circle(0, 0, r * 0.22); ctx.fill();
        ctx.restore();
        // Thanh HP
        hpBar(this.x - 1, this.y - 7, this.w + 2, this.hp / this.maxHp, smart ? '#22d3ee' : '#4ade80');
    };

    // --- Ụ súng Kẻ Sáng Tạo: chân ba càng + đầu bánh răng ---
    if (typeof CreatorTurret !== 'undefined') CreatorTurret.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now() / 1000;
        ctx.save();
        // 3 chân
        ctx.strokeStyle = '#78716c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const a = i * PI2 / 3 + Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11); ctx.stroke(); }
        ctx.fillStyle = '#d6a33a';
        for (let i = 0; i < 3; i++) { const a = i * PI2 / 3 + Math.PI / 2; circle(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, 1.8); ctx.fill(); }
        // bánh răng
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.8);
        ctx.fillStyle = '#b7791f';
        for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-1.6, -9.4, 3.2, 3); }
        ctx.fillStyle = radial(0, 0, 7.6, '#fde68a', '#b7791f', '#5c3d0a'); circle(0, 0, 7.6); ctx.fill();
        ctx.restore();
        // nòng tự ngắm
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(this.angle);
        ctx.fillStyle = TA.metal(-2, 2, '#57534e', '#f5f5f4');
        TA.rr(0, -2, 14, 4, 1.4); ctx.fill();
        ctx.fillStyle = tc.team; ctx.fillRect(12.5, -2.3, 1.8, 4.6);
        ctx.restore();
        ctx.fillStyle = '#1c1917'; circle(cx, cy, 3.6); ctx.fill();
        ctx.fillStyle = tc.team; ctx.shadowBlur = 8; ctx.shadowColor = tc.team; circle(cx, cy, 2.2); ctx.fill();
        ctx.restore();
        hpBar(this.x - 2, this.y - 8, this.w + 4, this.hp / this.maxHp, tc.team === '#3498db' ? '#38bdf8' : '#fb7185');
    };

    // --- Khiên thép Kẻ Sáng Tạo: rào năng lượng lục giác ---
    if (typeof CreatorShield !== 'undefined') CreatorShield.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const t = Date.now() / 1000;
        const x = this.x, y = this.y, w = this.w, h = this.h;
        const ratio = Math.max(0, this.hp / this.maxHp);
        ctx.save();
        ctx.shadowBlur = 14; ctx.shadowColor = '#00e5ff';
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, 'rgba(0,229,255,0.45)'); g.addColorStop(0.5, 'rgba(0,229,255,0.15)'); g.addColorStop(1, 'rgba(0,229,255,0.45)');
        ctx.fillStyle = g; TA.rr(x, y, w, h, h / 2); ctx.fill();
        ctx.shadowBlur = 0;
        // ô lục giác
        ctx.save(); TA.rr(x, y, w, h, h / 2); ctx.clip();
        ctx.strokeStyle = 'rgba(180,250,255,0.45)'; ctx.lineWidth = 0.8;
        for (let hx = x - 4; hx < x + w + 4; hx += 6) {
            ctx.beginPath(); ctx.moveTo(hx, y + h / 2); ctx.lineTo(hx + 1.5, y); ctx.moveTo(hx, y + h / 2); ctx.lineTo(hx + 1.5, y + h); ctx.moveTo(hx, y + h / 2); ctx.lineTo(hx - 3, y + h / 2); ctx.stroke();
        }
        // vệt quét
        const sx = x + ((t * 60) % (w + 20)) - 10;
        const sg = ctx.createLinearGradient(sx - 8, 0, sx + 8, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.6)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fillRect(sx - 8, y, 16, h);
        ctx.restore();
        ctx.strokeStyle = ratio < 0.35 && Math.floor(t * 8) % 2 ? '#ff6b6b' : '#a5f3fc'; ctx.lineWidth = 1.6;
        TA.rr(x, y, w, h, h / 2); ctx.stroke();
        // trụ phát hai đầu (màu đội)
        [x, x + w].forEach(px => {
            ctx.fillStyle = '#1f2937'; TA.rr(px - 2.5, y - 2, 5, h + 4, 2); ctx.fill();
            ctx.fillStyle = tc.team; ctx.shadowBlur = 6; ctx.shadowColor = tc.team; circle(px, y + h / 2, 1.6); ctx.fill(); ctx.shadowBlur = 0;
        });
        ctx.restore();
        hpBar(x + 4, this.owner.id === 1 ? y - 5 : y + h + 2, w - 8, ratio, '#e0fbff', 2);
    };

    // --- Drone Kẻ Sáng Tạo: quadcopter 4 cánh quạt, pháo đôi ---
    function rotor(x, y, r, t, col) {
        ctx.fillStyle = 'rgba(200,220,255,0.18)'; circle(x, y, r); ctx.fill();
        ctx.strokeStyle = 'rgba(230,240,255,0.7)'; ctx.lineWidth = 1;
        const a = t * 40;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x - Math.cos(a) * r, y - Math.sin(a) * r); ctx.stroke();
        ctx.fillStyle = col; circle(x, y, 1.3); ctx.fill();
    }
    if (typeof CreatorDrone !== 'undefined') CreatorDrone.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dir = this.owner.id === 1 ? -1 : 1;
        const t = Date.now() / 1000;
        const hover = Math.sin(t * 4) * 0.8;
        ctx.save();
        ctx.translate(0, hover);
        // tay đỡ
        ctx.strokeStyle = '#57534e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(this.x + 4, this.y + 3); ctx.lineTo(this.x + this.w - 4, this.y + this.h - 3); ctx.moveTo(this.x + this.w - 4, this.y + 3); ctx.lineTo(this.x + 4, this.y + this.h - 3); ctx.stroke();
        // pháo đôi
        ctx.fillStyle = TA.metal(cx - 6, cx + 6, '#57534e', '#f5f5f4');
        [-4, 4].forEach(o => { TA.rr(cx + o - 1.4, dir < 0 ? this.y - 4 : cy, 2.8, this.h / 2 + 4, 1); ctx.fill(); });
        // thân
        ctx.fillStyle = radial(cx, cy, 7, '#fde68a', '#b7791f', '#3f2a06');
        TA.rr(cx - 7, cy - 5, 14, 10, 4); ctx.fill();
        ctx.strokeStyle = tc.team; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.fillStyle = '#0b1220'; TA.rr(cx - 4, cy + dir * 1 - 1.2, 8, 2.4, 1.2); ctx.fill();
        ctx.fillStyle = tc.team; ctx.shadowBlur = 6; ctx.shadowColor = tc.team; circle(cx + Math.sin(t * 3) * 2.5, cy + dir * 1, 1); ctx.fill(); ctx.shadowBlur = 0;
        // cánh quạt
        rotor(this.x + 3, this.y + 3, 4.2, t, tc.team);
        rotor(this.x + this.w - 3, this.y + 3, 4.2, t + 0.3, tc.team);
        rotor(this.x + 3, this.y + this.h - 3, 4.2, t + 0.6, tc.team);
        rotor(this.x + this.w - 3, this.y + this.h - 3, 4.2, t + 0.9, tc.team);
        ctx.restore();
        hpBar(this.x - 2, this.y - 9, this.w + 4, this.hp / this.getMaxHp(), '#00e5ff');
    };

    // --- Robot chiến đấu Kẻ Sáng Tạo: mech 2 chân, 2 tay pháo, kính visor ---
    if (typeof CreatorRobot !== 'undefined') CreatorRobot.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dir = this.owner.id === 1 ? -1 : 1;
        const t = Date.now() / 1000;
        const step = Math.sin(t * 6) * 1.5;
        ctx.save();
        // vệt lướt
        if (this.isDashing) {
            for (let i = 1; i <= 3; i++) {
                ctx.globalAlpha = 0.18 * (4 - i) / 3;
                ctx.fillStyle = tc.team;
                TA.rr(this.x + 4, this.y - dir * i * 7 + 4, this.w - 8, this.h - 8, 6); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        // chân
        ctx.fillStyle = '#374151';
        TA.rr(cx - 11, cy + 2 + step * -dir * 0.3, 7, 15, 2); ctx.fill();
        TA.rr(cx + 4, cy + 2 - step * -dir * 0.3, 7, 15, 2); ctx.fill();
        ctx.fillStyle = '#111827';
        TA.rr(cx - 12, cy + 14 + step * 0.3, 9, 4, 1.5); ctx.fill();
        TA.rr(cx + 3, cy + 14 - step * 0.3, 9, 4, 1.5); ctx.fill();
        // tay pháo
        [-1, 1].forEach(sd => {
            const ax = cx + sd * 14;
            ctx.fillStyle = TA.metal(ax - 4, ax + 4, '#3f3f46', '#a1a1aa');
            TA.rr(ax - 3.5, cy - 8, 7, 14, 2.5); ctx.fill();
            ctx.fillStyle = '#d4d4d8';
            TA.rr(ax - 1.5, dir < 0 ? cy - 15 : cy + 4, 3, 11, 1); ctx.fill();
            ctx.fillStyle = sd < 0 ? '#fb923c' : '#22d3ee';
            circle(ax, dir < 0 ? cy - 15 : cy + 15, 1.5); ctx.fill();
        });
        // thân
        ctx.fillStyle = TA.vgrad(this.y + 4, this.y + this.h - 6, '#d6a33a', '#5c3d0a');
        TA.rr(cx - 10, cy - 12, 20, 20, 5); ctx.fill();
        ctx.strokeStyle = tc.team; ctx.lineWidth = 1.8; ctx.shadowBlur = 8; ctx.shadowColor = tc.team; ctx.stroke(); ctx.shadowBlur = 0;
        // đầu + visor
        const hy = cy - 2 + dir * 4;
        ctx.fillStyle = '#1f2937'; TA.rr(cx - 7, hy - 4, 14, 8, 3); ctx.fill();
        ctx.fillStyle = tc.team; ctx.shadowBlur = 10; ctx.shadowColor = tc.team;
        TA.rr(cx - 5.5, hy - 1.2, 11, 2.4, 1.2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; circle(cx - 3 + Math.sin(t * 2) * 3, hy, 0.9); ctx.fill();
        // lõi năng lượng ngực
        const nr = Math.max(0, this.energy / this.maxEnergy);
        ctx.fillStyle = `rgba(255,179,0,${0.4 + 0.6 * nr})`; ctx.shadowBlur = 8; ctx.shadowColor = '#ffb300';
        circle(cx, cy + 3 - dir * 3, 2.4); ctx.fill(); ctx.shadowBlur = 0;
        ctx.restore();
        // Thanh máu + năng lượng
        hpBar(this.x - 2, this.y - 12, this.w + 4, this.hp / this.maxHp, '#4ade80');
        hpBar(this.x - 2, this.y - 6.5, this.w + 4, this.energy / this.maxEnergy, '#ffb300', 2);
        ctx.save();
        // Hồng tâm Pháo Cao Xạ
        if (this.aaaReticle && this.aaaTimer > 0) {
            ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.aaaReticle.x, this.aaaReticle.y, 40, 0, PI2);
            ctx.moveTo(this.aaaReticle.x - 45, this.aaaReticle.y); ctx.lineTo(this.aaaReticle.x + 45, this.aaaReticle.y);
            ctx.moveTo(this.aaaReticle.x, this.aaaReticle.y - 45); ctx.lineTo(this.aaaReticle.x, this.aaaReticle.y + 45);
            ctx.stroke(); ctx.setLineDash([]);
        }
        // Vùng cảnh báo Laser Thủy Lực
        if (this.laserTelegraph > 0) {
            const lx = this.laserX || cx;
            const y0 = this.owner.id === 1 ? 0 : this.y + this.h;
            const hgt = this.owner.id === 1 ? this.y : canvas.height - (this.y + this.h);
            const k2 = 1 - this.laserTelegraph / 50;
            const blink = Math.floor(this.laserTelegraph / Math.max(2, 8 - k2 * 6)) % 2 === 0;
            ctx.fillStyle = `rgba(255,0,60,${0.08 + 0.18 * k2})`; ctx.fillRect(lx - 10, y0, 20, hgt);
            ctx.strokeStyle = blink ? 'rgba(255,40,80,0.95)' : 'rgba(255,40,80,0.35)'; ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]); ctx.strokeRect(lx - 10, y0, 20, hgt); ctx.setLineDash([]);
            ctx.fillStyle = '#ff0055'; circle(lx, this.owner.id === 1 ? this.y : this.y + this.h, 4 + 3 * k2); ctx.fill();
        }
        ctx.restore();
    };

    // --- Drone Nhà Phát Minh: cánh bay tam giác bạc/cam, động cơ phản lực ---
    if (typeof InventorDrone !== 'undefined') InventorDrone.prototype.draw = function () {
        if (!this.active) return;
        const o = this.owner, tc = teamOf(o);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dir = o.id === 1 ? -1 : 1;
        const t = Date.now() / 1000;
        const oc = !!this.isOverclocking;
        ctx.save();
        // lửa động cơ phía sau
        const fl = 3 + Math.sin(t * 30) * 1.2 + (oc ? 3 : 0);
        ctx.fillStyle = oc ? 'rgba(255,80,200,0.85)' : 'rgba(0,240,255,0.85)';
        ctx.shadowBlur = 8; ctx.shadowColor = ctx.fillStyle;
        [-7, 7].forEach(o2 => { ctx.beginPath(); ctx.ellipse(cx + o2, cy - dir * (this.h / 2 + fl / 2 - 1), 1.8, fl, 0, 0, PI2); ctx.fill(); });
        ctx.shadowBlur = 0;
        // cánh
        ctx.fillStyle = TA.metal(this.x, this.x + this.w, '#64748b', '#e2e8f0');
        ctx.beginPath();
        ctx.moveTo(cx, cy + dir * this.h / 2);
        ctx.lineTo(this.x, cy - dir * this.h / 2 + dir * 2);
        ctx.lineTo(cx, cy - dir * 3);
        ctx.lineTo(this.x + this.w, cy - dir * this.h / 2 + dir * 2);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = tc.team; ctx.lineWidth = 1.2; ctx.stroke();
        // sọc cam
        ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(this.x + 4, cy - dir * this.h / 2 + dir * 3.5); ctx.lineTo(cx - 3, cy - dir * 1); ctx.moveTo(this.x + this.w - 4, cy - dir * this.h / 2 + dir * 3.5); ctx.lineTo(cx + 3, cy - dir * 1); ctx.stroke();
        // buồng lái
        ctx.fillStyle = radial(cx, cy + dir * 2, 3.6, '#ffffff', oc ? '#f472b6' : '#22d3ee', '#0e3a4a');
        ctx.beginPath(); ctx.ellipse(cx, cy + dir * 2, 3, 4.2, 0, 0, PI2); ctx.fill();
        // nòng
        ctx.fillStyle = '#1f2937';
        if (typeof this.aimAngle === 'number' && o.invUpgrades && o.invUpgrades['inv_ngam']) {
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(this.aimAngle);
            TA.rr(2, -1.8, this.w / 2 + 6, 3.6, 1.2); ctx.fill();
            ctx.fillStyle = tc.team; ctx.fillRect(this.w / 2 + 6, -2, 1.6, 4);
            ctx.restore();
        } else {
            TA.rr(cx - 1.6, dir < 0 ? this.y - 5 : cy + dir * 4, 3.2, this.h / 2 + 1, 1.2); ctx.fill();
            ctx.fillStyle = tc.team; ctx.fillRect(cx - 2, dir < 0 ? this.y - 5.5 : this.y + this.h + 3.5, 4, 1.6);
        }
        // ăng-ten
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + 4, cy - dir * 1); ctx.lineTo(cx + 7, cy - dir * 6); ctx.stroke();
        ctx.fillStyle = Math.floor(t * 3) % 2 ? '#22c55e' : '#f97316'; circle(cx + 7, cy - dir * 6, 1.1); ctx.fill();
        // Khiên drone
        if ((o.invUpgrades && o.invUpgrades['inv_khien_drone']) > 0) {
            ctx.strokeStyle = 'rgba(0,255,200,0.7)'; ctx.lineWidth = 1.6; ctx.shadowBlur = 8; ctx.shadowColor = '#00ffc8';
            ctx.beginPath(); ctx.ellipse(cx, cy, this.w / 2 + 4, this.h / 2 + 4, 0, 0, PI2); ctx.stroke(); ctx.shadowBlur = 0;
        }
        ctx.restore();
        hpBar(this.x - 2, this.y - 9, this.w + 4, this.hp / this.getMaxHp(), '#00ffcc');
    };

    // --- Tường Sniper: rào thép bọc bê tông, dải năng lượng màu đội ---
    if (typeof SniperWall !== 'undefined') SniperWall.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const x = this.x, y = this.y, w = this.w, h = this.h;
        const t = Date.now() / 1000;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; TA.rr(x + 2, y + 3, w, h, 4); ctx.fill();
        if (this.isImmortal) {
            ctx.fillStyle = TA.vgrad(y, y + h, '#9ca3af', '#374151');
            TA.rr(x, y, w, h, 4); ctx.fill();
            ctx.save(); TA.rr(x, y, w, h, 4); ctx.clip();
            ctx.fillStyle = 'rgba(250,204,21,0.85)';
            for (let sx = x - h; sx < x + w; sx += 10) { ctx.beginPath(); ctx.moveTo(sx, y + h); ctx.lineTo(sx + 5, y + h); ctx.lineTo(sx + 5 + h * 0.5, y + h - 4); ctx.lineTo(sx + h * 0.5, y + h - 4); ctx.closePath(); ctx.fill(); }
            ctx.restore();
            ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1.4; TA.rr(x, y, w, h, 4); ctx.stroke();
            ctx.fillStyle = '#1f2937';
            [x + 6, x + w - 6].forEach(px => { circle(px, y + h / 2 - 2, 1.5); ctx.fill(); });
        } else {
            const ratio = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = TA.vgrad(y, y + h, '#475569', '#1e293b');
            TA.rr(x, y, w, h, 4); ctx.fill();
            // tấm giáp
            ctx.strokeStyle = 'rgba(148,163,184,0.5)'; ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 4, y + 2); ctx.lineTo(x + w * i / 4, y + h - 2); ctx.stroke(); }
            // dải năng lượng màu đội (mờ dần khi yếu)
            ctx.fillStyle = hexA(tc.team, 0.4 + 0.5 * ratio);
            ctx.shadowBlur = 10; ctx.shadowColor = tc.team;
            TA.rr(x + 3, y + h / 2 - 2, w - 6, 4, 2); ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            const sx = x + 3 + ((t * 40) % (w - 6));
            ctx.fillRect(sx, y + h / 2 - 1, 3, 2);
            // vết nứt khi máu thấp
            if (ratio < 0.5) {
                ctx.strokeStyle = 'rgba(15,23,42,0.85)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x + w * 0.3, y); ctx.lineTo(x + w * 0.34, y + h * 0.45); ctx.lineTo(x + w * 0.28, y + h); ctx.stroke();
                if (ratio < 0.25) { ctx.beginPath(); ctx.moveTo(x + w * 0.7, y + h); ctx.lineTo(x + w * 0.66, y + h * 0.5); ctx.lineTo(x + w * 0.72, y); ctx.stroke(); }
            }
            ctx.strokeStyle = tc.team; ctx.lineWidth = 1.5; TA.rr(x, y, w, h, 4); ctx.stroke();
            ctx.restore();
            hpBar(x, y - 6, w, ratio, '#4ade80');
            return;
        }
        ctx.restore();
    };

    // --- Bastion (vật cản trung lập trên sân) ---
    if (typeof BastionWall !== 'undefined') BastionWall.prototype.draw = function () {
        if (!this.active) return;
        const x = this.x, y = this.y, w = this.w, h = this.h;
        const ratio = Math.max(0, this.hp / this.maxHp);
        const t = Date.now() / 1000;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; TA.rr(x + 2, y + 3, w, h, 3); ctx.fill();
        ctx.fillStyle = TA.vgrad(y, y + h, '#334155', '#0f172a');
        TA.rr(x, y, w, h, 3); ctx.fill();
        // răng thành (lỗ châu mai)
        ctx.fillStyle = '#475569';
        for (let i = 0; i < 6; i++) { TA.rr(x + 4 + i * (w - 8) / 6, y + 1.5, (w - 8) / 6 - 3, 3.5, 1); ctx.fill(); }
        // dải neon ngọc
        ctx.fillStyle = '#1abc9c'; ctx.shadowBlur = 8; ctx.shadowColor = '#1abc9c';
        ctx.fillRect(x + 3, y + h - 4.5, w - 6, 1.6); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(x + 3 + ((t * 50) % (w - 10)), y + h - 4.5, 4, 1.6);
        // đinh tán hai đầu
        ctx.fillStyle = '#94a3b8'; circle(x + 3.5, y + h / 2 + 1, 1.2); ctx.fill(); circle(x + w - 3.5, y + h / 2 + 1, 1.2); ctx.fill();
        ctx.strokeStyle = '#1abc9c'; ctx.lineWidth = 1.5; TA.rr(x, y, w, h, 3); ctx.stroke();
        ctx.fillStyle = 'rgba(226,232,240,0.85)';
        ctx.font = "bold 7px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.fillText('BASTION', x + w / 2, y + h - 6.5);
        ctx.restore();
        hpBar(x, y - 7, w, ratio, '#2ecc71', 3.5);
    };

    // --- Bóng nhử Ghost: hình chiếu ba chiều của chính xe chủ ---
    if (typeof GhostDecoy !== 'undefined') GhostDecoy.prototype.draw = function () {
        if (!this.active) return;
        const o = this.owner, tc = teamOf(o);
        const life = Math.max(0, this.lifeTime / this.maxLife);
        const t = Date.now() / 1000;
        ctx.save();
        ctx.globalAlpha = life * 0.5 * (0.85 + 0.15 * Math.sin(t * 30));
        let drawn = false;
        if (typeof drawTankArt === 'function' && typeof TANK_ART !== 'undefined' && TANK_ART[o.weapon]) {
            const fake = Object.create(o);
            fake.x = this.x; fake.y = this.y; fake.w = this.w; fake.h = this.h;
            try { drawn = drawTankArt(fake, null); } catch (e) { drawn = false; }
        }
        if (!drawn) { ctx.fillStyle = o.color; TA.rr(this.x, this.y, this.w, this.h, 4); ctx.fill(); }
        // vạch quét hologram
        ctx.globalAlpha = life * 0.6;
        ctx.fillStyle = 'rgba(180,240,255,0.5)';
        for (let yy = this.y + ((t * 30) % 4); yy < this.y + this.h; yy += 4) ctx.fillRect(this.x, yy, this.w, 1);
        ctx.strokeStyle = tc.team; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -t * 20;
        TA.rr(this.x - 2, this.y - 2, this.w + 4, this.h + 4, 5); ctx.stroke();
        ctx.restore();
    };

    // --- Hồng tâm pháo kích (Pháo Cao Xạ) ---
    if (typeof MortarMarker !== 'undefined') MortarMarker.prototype.draw = function () {
        if (!this.active) return;
        const age = Date.now() - this.spawnTime;
        const prog = Math.max(0, Math.min(1, age / this.detonateTime));
        const left = Math.max(0, this.detonateTime - age);
        const crit = left < 1000;
        const blink = crit && Math.floor(Date.now() / 100) % 2 === 0;
        const R = this.maxR, tc = teamOf(this.owner);
        const t = Date.now() / 1000;
        ctx.save();
        ctx.translate(this.x, this.y);
        // vùng nổ cuối cùng (mờ) + vùng đang lan
        ctx.strokeStyle = 'rgba(255,90,60,0.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 12;
        circle(0, 0, R); ctx.stroke(); ctx.setLineDash([]);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, R * prog));
        g.addColorStop(0, 'rgba(255,60,40,0.05)'); g.addColorStop(0.75, 'rgba(255,60,40,0.22)'); g.addColorStop(1, blink ? 'rgba(255,220,60,0.5)' : 'rgba(255,60,40,0.45)');
        ctx.fillStyle = g; circle(0, 0, R * prog); ctx.fill();
        ctx.strokeStyle = blink ? '#fde047' : '#ff3b30'; ctx.lineWidth = 3;
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle;
        circle(0, 0, R * prog); ctx.stroke();
        ctx.shadowBlur = 0;
        // vòng ngắm xoay + 4 ngoặc
        ctx.rotate(t * 1.5);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath(); ctx.arc(0, 0, 14, -0.45, 0.45); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(22, 0); ctx.stroke();
        }
        ctx.rotate(-t * 1.5);
        ctx.fillStyle = tc.team; circle(0, 0, 2.5); ctx.fill();
        // đếm ngược
        ctx.fillStyle = crit ? '#fde047' : '#ffffff';
        ctx.font = "bold 13px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
        ctx.fillText((left / 1000).toFixed(1), 0, -R * Math.max(0.45, prog) - 6);
        ctx.restore();
    };

    // ==========================================
    // THIÊN TÀI — Mecha chiến đấu (khi lái) & Mecha bị ném tự huỷ
    // ------------------------------------------
    // Vẽ trong lưới 32×32 (trước = −y). mode: 1 pháo, 2 bộc phá, 3 tiểu liên, 4 đấm thép, 5 khiên
    // ==========================================
    function mechaBody(k, mode, t, opts = {}) {
        const step = Math.sin(t * 7) * 1.1;
        const core = opts.core || '#22d3ee';
        // Chân + bàn chân (phía sau)
        [-1, 1].forEach(sd => {
            const off = sd * step;
            ctx.fillStyle = TA.metal(sd * 9 - 3, sd * 9 + 3, '#1f2937', '#64748b');
            TA.rr(sd * 7.5 - 2.8, 4 + off, 5.6, 9, 2); ctx.fill();
            ctx.fillStyle = '#111827';
            TA.rr(sd * 7.5 - 4, 11.5 + off, 8, 4, 1.6); ctx.fill();
            ctx.fillStyle = k.team; ctx.fillRect(sd * 7.5 - 2.5, 14 + off, 5, 1);
        });
        // Vai + cánh tay
        const armW = 5.5;
        [-1, 1].forEach(sd => {
            const ax = sd * 12;
            ctx.fillStyle = TA.metal(ax - 4, ax + 4, '#78350f', '#fb923c');
            circle(ax, -3, 4.2); ctx.fill();
            ctx.strokeStyle = '#fed7aa'; ctx.lineWidth = 0.8; ctx.stroke();
            ctx.fillStyle = TA.metal(ax - armW / 2, ax + armW / 2, '#334155', '#cbd5e1');
            TA.rr(ax - armW / 2, -8, armW, 10, 2); ctx.fill();
            const special = sd < 0;
            const m = special ? mode : 1;
            if (m === 2) { // ống bộc phá to
                ctx.fillStyle = TA.metal(ax - 3.5, ax + 3.5, '#3f3f46', '#a1a1aa');
                TA.rr(ax - 3.3, -15.5, 6.6, 8, 2); ctx.fill();
                ctx.fillStyle = '#ef4444'; TA.glow('#ef4444', 6); TA.rr(ax - 2.4, -15.8, 4.8, 1.6, 0.8); ctx.fill(); TA.noGlow();
            } else if (m === 3) { // tiểu liên 3 nòng xoay
                const sp = t * 30;
                for (let i = -1; i <= 1; i++) {
                    ctx.fillStyle = Math.floor(sp + i) % 2 ? '#e5e7eb' : '#94a3b8';
                    TA.rr(ax + i * 1.6 - 0.7, -15.5, 1.4, 8, 0.6); ctx.fill();
                }
                ctx.fillStyle = '#facc15'; ctx.fillRect(ax - 2.6, -10, 5.2, 1.4);
            } else if (m === 4) { // nắm đấm thép
                ctx.fillStyle = radial(ax, -12, 4.2, '#fff7ed', '#f97316', '#7c2d12');
                TA.rr(ax - 4, -16, 8, 7, 2.5); ctx.fill();
                ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 0.8;
                for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(ax + i * 2, -16); ctx.lineTo(ax + i * 2, -13.4); ctx.stroke(); }
            } else if (m === 5) { // máy phát khiên
                ctx.fillStyle = '#0e7490'; TA.rr(ax - 2.6, -12.5, 5.2, 5, 1.5); ctx.fill();
                ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1.2; TA.glow('#22d3ee', 8);
                ctx.beginPath(); ctx.arc(ax, -12.5, 3.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); TA.noGlow();
            } else { // pháo thường
                ctx.fillStyle = TA.metal(ax - 1.6, ax + 1.6, '#475569', '#f1f5f9');
                TA.rr(ax - 1.6, -15, 3.2, 7.5, 1); ctx.fill();
                ctx.fillStyle = core; ctx.fillRect(ax - 2, -15.4, 4, 1.4);
            }
        });
        // Thân giáp
        ctx.fillStyle = TA.vgrad(-11, 9, '#fb923c', '#7c2d12');
        ctx.beginPath();
        ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(9.5, -4); ctx.lineTo(7.5, 7); ctx.lineTo(-7.5, 7); ctx.lineTo(-9.5, -4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.4; TA.glow(k.team, 6); ctx.stroke(); TA.noGlow();
        // tấm ngực tối + lõi lò phản ứng
        ctx.fillStyle = '#1e293b'; TA.rr(-5.5, -2, 11, 7, 2); ctx.fill();
        const pulse = 0.6 + 0.4 * Math.sin(t * 5);
        ctx.fillStyle = radial(0, 1.5, 3, '#ffffff', core, '#0e3a4a');
        TA.glow(core, 10 * pulse); circle(0, 1.5, 2.6); ctx.fill(); TA.noGlow();
        // Đầu + visor
        ctx.fillStyle = TA.metal(-5, 5, '#334155', '#e2e8f0');
        TA.rr(-5, -13.5, 10, 6, 2.5); ctx.fill();
        ctx.fillStyle = opts.visor || core; TA.glow(opts.visor || core, 8);
        TA.rr(-3.8, -12.2, 7.6, 2, 1); ctx.fill(); TA.noGlow();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(3.5, -13.5); ctx.lineTo(5.5, -16); ctx.stroke();
        ctx.fillStyle = k.team; circle(5.5, -16, 0.9); ctx.fill();
        // Bóng đèn biểu tượng Thiên Tài trên nóc
        ctx.fillStyle = '#fde047'; TA.glow('#fde047', 5); circle(-6.5, -7.5, 1.2); ctx.fill(); TA.noGlow();
    }

    function geniusMechaArt(p, k) {
        const mode = p.mechaMode || 1;
        const t = k.t;
        if (mode === 5) { // khiên từ trường bao quanh
            ctx.strokeStyle = `rgba(103,232,249,${0.35 + 0.25 * Math.sin(t * 6)})`; ctx.lineWidth = 1.5;
            TA.glow('#22d3ee', 10); circle(0, 0, 15.5); ctx.stroke(); TA.noGlow();
        }
        mechaBody(k, mode, t);
        if (p.mechaVirtualArmor > 0) {
            ctx.strokeStyle = 'rgba(165,243,252,0.7)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(9.5, -4); ctx.lineTo(7.5, 7); ctx.lineTo(-7.5, 7); ctx.lineTo(-9.5, -4); ctx.closePath(); ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    // Khi đang lái Mecha: vẽ Mecha bằng khung art chung (bóng, tint trạng thái), còn lại giữ art gốc của Thiên Tài
    if (typeof drawTankArt === 'function') {
        const baseDrawTankArt = drawTankArt;
        drawTankArt = function (p, statusColor) {
            if (p && p.weapon === 'genius' && p.isPilotingMecha) {
                const prev = TANK_ART.genius;
                TANK_ART.genius = geniusMechaArt;
                try { return baseDrawTankArt(p, statusColor); } finally { if (prev) TANK_ART.genius = prev; else delete TANK_ART.genius; }
            }
            return baseDrawTankArt(p, statusColor);
        };
    }

    // Mecha bị ném (Tự Huỷ): lao thẳng, lắc lư, đèn đỏ nháy, phản lực phía sau
    if (typeof ThrownMecha !== 'undefined') ThrownMecha.prototype.draw = function () {
        if (!this.active) return;
        const tc = teamOf(this.owner);
        const k = Object.assign({}, tc);
        const t = Date.now() / 1000;
        const s = this.w / 32, fy = this.dirY < 0 ? 1 : -1;
        const blink = Math.floor(Date.now() / 80) % 2;
        ctx.save();
        // vệt cháy phía sau
        this.trail.forEach((tr, i) => {
            const a = 0.3 * (1 - i / this.trail.length);
            const g = ctx.createRadialGradient(tr.x + this.w / 2, tr.y + this.h / 2, 2, tr.x + this.w / 2, tr.y + this.h / 2, this.w * 0.55);
            g.addColorStop(0, `rgba(255,200,80,${a})`); g.addColorStop(1, 'rgba(255,80,0,0)');
            ctx.fillStyle = g; circle(tr.x + this.w / 2, tr.y + this.h / 2, this.w * 0.55); ctx.fill();
        });
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(Math.sin(this.spin) * 0.25);
        // quầng đỏ cảnh báo
        ctx.fillStyle = `rgba(255,23,68,${blink ? 0.3 : 0.12})`; circle(0, 0, this.w * 0.62); ctx.fill();
        ctx.scale(s, fy * s);
        // phản lực ở lưng
        [-7.5, 7.5].forEach(x => {
            const L = 5 + Math.sin(t * 40 + x) * 1.5;
            const g = ctx.createLinearGradient(0, 12, 0, 12 + L);
            g.addColorStop(0, '#fff7ae'); g.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 2.5, 12); ctx.lineTo(x + 2.5, 12); ctx.lineTo(x, 12 + L * 1.6); ctx.closePath(); ctx.fill();
        });
        mechaBody(k, 4, t, { core: blink ? '#ff1744' : '#ffffff', visor: '#ff1744' });
        // dây quấn bom trên ngực
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.2; ctx.setLineDash([2, 1.5]);
        ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(9, -4); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
    };
})();
