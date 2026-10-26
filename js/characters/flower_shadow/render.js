// ==========================================
// Hoa Ảnh (flower_shadow) — Hình ảnh: cánh anh đào, nhát chém lưỡi liềm,
// vòng cảnh báo Thiên, Ngôi Sao Trảm, bản sao, thanh Hoa
// ==========================================

// Cánh hoa anh đào (có khía ở đầu), tâm (0,0), dài 2s
function fsPetalPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 0.95, s * 0.35, -s * 0.8, -s * 0.75, -s * 0.22, -s * 0.95);
    ctx.lineTo(0, -s * 0.62);
    ctx.lineTo(s * 0.22, -s * 0.95);
    ctx.bezierCurveTo(s * 0.8, -s * 0.75, s * 0.95, s * 0.35, 0, s);
    ctx.closePath();
}

function fsDrawPetal(x, y, s, rot, alpha = 1, glow = true, col = FS_PINK, light = FS_LIGHT) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha *= alpha;
    if (glow) { ctx.shadowBlur = 10; ctx.shadowColor = col; }
    const g = ctx.createRadialGradient(0, s * 0.6, 0, 0, 0, s * 1.1);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, light);
    g.addColorStop(1, col);
    ctx.fillStyle = g;
    fsPetalPath(s); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, s * 0.8); ctx.lineTo(0, -s * 0.3); ctx.stroke();
    ctx.restore();
}

// Hoa 5 cánh
function fsDrawFlower(x, y, s, rot, alpha = 1, col = FS_PINK) {
    for (let i = 0; i < 5; i++) {
        const a = rot + i * Math.PI * 2 / 5;
        fsDrawPetal(x + Math.sin(a) * s * 0.55, y - Math.cos(a) * s * 0.55, s * 0.5, a + Math.PI, alpha, i === 0, col);
    }
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#fff7a8';
    ctx.beginPath(); ctx.arc(x, y, s * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Nhát chém lưỡi liềm mượt (k: 0 -> 1)
function fsDrawSlash(cx, cy, R, rot, k, col = FS_PINK, width = 0.2) {
    if (k <= 0 || k >= 1) return;
    const ease = 1 - Math.pow(1 - Math.min(1, k / 0.6), 3);
    const a0 = -1.35, span = 2.7;
    const head = a0 + span * ease;
    const tail = Math.max(a0, head - 1.6 * (0.4 + ease * 0.6));
    const fade = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.globalAlpha *= fade;
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 14; ctx.shadowColor = col;
    const g = ctx.createLinearGradient(Math.cos(tail) * R, Math.sin(tail) * R, Math.cos(head) * R, Math.sin(head) * R);
    g.addColorStop(0, 'rgba(255,126,182,0)');
    g.addColorStop(0.6, col);
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R, tail, head);
    ctx.arc(R * width * 0.6, 0, R * (1 - width), head, tail, true);
    ctx.closePath(); ctx.fill();
    // Lõi trắng
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 0, R * (1 - width * 0.35), Math.max(tail, head - 0.9), head); ctx.stroke();
    // Vệt dư mảnh bên ngoài
    ctx.strokeStyle = 'rgba(255,214,232,0.45)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.08, Math.max(a0, head - 1.2), Math.max(a0, head - 0.1)); ctx.stroke();
    ctx.restore();
    // Cánh hoa vụn bắn ra từ mũi chém
    if (k > 0.15) {
        const sp = (k - 0.15) * R * 0.5;
        for (let i = 0; i < 2; i++) {
            const ha = head + rot + 0.25 + i * 0.35, rr = R + sp * (1 + i);
            fsDrawPetal(cx + Math.cos(ha) * rr, cy + Math.sin(ha) * rr, 2.4, ha + k * 4, fade * 0.85, false, col);
        }
    }
}

// Cánh hoa cường hóa: hồng nhạt + ánh kim vàng mờ lấp lánh (xuyên vật cản, không thể phá)
function fsDrawEmpPetal(x, y, s, rot, alpha, age) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.75 + 0.25 * Math.sin(age * 0.3);
    const halo = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
    halo.addColorStop(0, 'rgba(255, 196, 222, 0.5)'); halo.addColorStop(0.6, 'rgba(255, 225, 150, 0.12)'); halo.addColorStop(1, 'rgba(255, 210, 120, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, s * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255, 228, 160, ${0.35 * pulse})`; ctx.lineWidth = 1;
    const L = s * 2.6 * pulse, a = age * 0.08;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const k = a + i * Math.PI / 2;
        ctx.moveTo(x + Math.cos(k) * s * 0.6, y + Math.sin(k) * s * 0.6);
        ctx.lineTo(x + Math.cos(k) * L, y + Math.sin(k) * L);
    }
    ctx.stroke();
    ctx.restore();
    fsDrawPetal(x, y, s, rot, alpha, true, FS_EMP_PINK, FS_EMP_PINK_LIGHT);
}

function fsDrawPetalEntity(p) {
    if (!p.active) return;
    const o = p.owner;
    const alpha = p.fade > 0 ? 1 - p.fade / 20 : 1;
    ctx.save();
    // Vệt bay
    const tr = p.trail || [];
    if (tr.length >= 4) {
        // Dải sáng thon dần theo đường bay
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        let px = p.x, py = p.y;
        for (let i = 0; i < tr.length; i += 2) {
            const f = 1 - i / tr.length;
            ctx.globalAlpha = alpha * (p.emp ? 0.55 : 0.4) * f;
            ctx.strokeStyle = p.emp ? FS_EMP_PINK : FS_PINK;
            ctx.lineWidth = p.r * 1.3 * f + 0.5;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tr[i], tr[i + 1]); ctx.stroke();
            px = tr[i]; py = tr[i + 1];
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    if (p.fade > 0) {
        // Vỡ / bị đè nát: cánh hoa tan dần & rơi vụn
        const k = p.fade / 20;
        fsDrawPetal(p.x, p.y, p.r * (1.1 - 0.5 * k), p.rot, alpha * 0.9, false, p.emp ? FS_EMP_PINK : FS_PINK);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.emp ? FS_EMP_PINK_LIGHT : FS_LIGHT;
        for (let i = 0; i < 4; i++) {
            const a = i * 1.57 + p.rot;
            ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * 12 * k, p.y + Math.sin(a) * 12 * k, 1.5, 0, Math.PI * 2); ctx.fill();
        }
    } else if (p.state === 'rest') {
        // Nằm nghỉ: mờ, phập phồng; Evo 2 tỏa phấn
        const pulse = 0.6 + 0.25 * Math.sin(p.age * 0.12);
        if (o && fsEvo2(o)) {
            ctx.globalAlpha = 0.12 + 0.06 * Math.sin(p.age * 0.1);
            ctx.fillStyle = FS_PINK;
            ctx.beginPath(); ctx.arc(p.x, p.y, 58, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.6;
            for (let i = 0; i < 5; i++) {
                const a = p.age * 0.03 + i * 1.26, rr = 18 + ((p.age * 0.6 + i * 9) % 38);
                ctx.fillStyle = FS_LIGHT;
                ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * 0.6, 1.4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        // Đồng hồ nghỉ
        ctx.strokeStyle = 'rgba(255, 214, 232, 0.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (p.timer / (p.restMax || 180))); ctx.stroke();
        if (p.emp) fsDrawEmpPetal(p.x, p.y, p.r * 1.3, p.rot * 0.2, pulse + 0.15, p.age);
        else fsDrawPetal(p.x, p.y, p.r * 1.3, p.rot * 0.2, pulse + 0.15, true);
    } else if (p.state === 'aim' || p.state === 'seekAim') {
        // Đường cảnh báo hồng
        const k = p.state === 'aim' ? 1 - p.timer / 60 : 1 - p.timer / 36;
        ctx.strokeStyle = `rgba(255, 61, 139, ${0.35 + 0.45 * k})`;
        ctx.lineWidth = 1 + k * 1.5; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -p.age;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.tx, p.ty); ctx.stroke();
        ctx.setLineDash([]);
        if (p.emp) fsDrawEmpPetal(p.x, p.y, p.r * (1.1 + 0.3 * k), p.rot, 1, p.age);
        else fsDrawPetal(p.x, p.y, p.r * (1.1 + 0.3 * k), p.rot, 1);
    } else if (p.state === 'line') {
        const k = p.flash / 14;
        ctx.globalAlpha = 1 - k;
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 18; ctx.shadowColor = FS_DEEP;
        ctx.strokeStyle = FS_PINK; ctx.lineWidth = 7 * (1 - k) + 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.tx, p.ty); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.tx, p.ty); ctx.stroke();
    } else if (p.emp) {
        fsDrawEmpPetal(p.x, p.y, p.r * 1.25, p.rot, alpha, p.age);
    } else {
        fsDrawPetal(p.x, p.y, p.r * 1.05, p.rot, alpha);
    }
    ctx.restore();
}

function fsDrawSlashMark(m) {
    if (!m.active) return;
    const R = m.size * 0.95 * m.scale + 8;
    ctx.save();
    if (m.delay > 0) {
        // Ấn hoa đang tụ: xoay & thu nhỏ dần -> báo hiệu sắp chém
        const k = 1 - m.delay / m.maxDelay;
        ctx.globalAlpha = 0.35 + 0.5 * k;
        ctx.strokeStyle = FS_PINK; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]); ctx.lineDashOffset = k * 40;
        ctx.beginPath(); ctx.arc(m.x, m.y, R * (1.5 - 0.5 * k), 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        fsDrawFlower(m.x, m.y, 8 + 6 * k, k * 6, 0.5 + 0.5 * k);
    }
    const sl = m.slashes || [];
    for (let i = 0; i < sl.length; i += 2) {
        const k = (m.t - sl[i]) / 14;
        fsDrawSlash(m.x, m.y, R, sl[i + 1], k, i % 4 === 0 ? FS_PINK : FS_DEEP);
    }
    ctx.restore();
}

// Bản sao Phá / bóng trễ
function fsDrawCloneEntity(c, isShadow) {
    if (!c.active) return;
    const o = c.owner;
    ctx.save();
    const col = isShadow ? 'rgba(170, 110, 255,' : 'rgba(255, 126, 182,';
    const tr = c.trail || [];
    for (let i = 0; i < tr.length; i++) {
        ctx.fillStyle = `${col} ${0.22 * (1 - i / tr.length)})`;
        ctx.fillRect(c.x, tr[i], c.w, c.h);
    }
    let a = isShadow ? 0.38 : 0.5;
    if (!isShadow && c.life < 40) a *= c.life / 40;
    ctx.fillStyle = `${col} ${a})`;
    ctx.shadowBlur = 12; ctx.shadowColor = isShadow ? '#a96eff' : FS_PINK;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1;
    ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
    fsDrawFlower(c.x + c.w / 2, c.y + c.h / 2, c.w * 0.42, (c.age || c.life || 0) * 0.03, a + 0.2, isShadow ? '#c39bff' : FS_PINK);
    if (c.phase > 0) fsDrawBlade(c.x + c.w / 2, c.y, c.h, fsDir(o), 0.8);
    ctx.restore();
}

// Lưỡi kiếm khí trước mũi xe khi đang lướt Phá
function fsDrawBlade(cx, y, h, dir, alpha = 1) {
    const tipY = dir < 0 ? y - 22 : y + h + 22;
    const baseY = dir < 0 ? y + 4 : y + h - 4;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 16; ctx.shadowColor = FS_PINK;
    const g = ctx.createLinearGradient(cx, baseY, cx, tipY);
    g.addColorStop(0, 'rgba(255,126,182,0.1)'); g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - 14, baseY);
    ctx.quadraticCurveTo(cx - 8, (baseY + tipY) / 2, cx, tipY);
    ctx.quadraticCurveTo(cx + 8, (baseY + tipY) / 2, cx + 14, baseY);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

function fsDrawLandStrike(s) {
    if (!s.active) return;
    ctx.save();
    if (s.delay > 0) {
        const k = 1 - s.delay / s.maxDelay;
        ctx.strokeStyle = `rgba(190, 120, 255, ${0.4 + 0.5 * k})`; ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(170, 110, 255, ${0.06 + 0.16 * k})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 - k), 0, Math.PI * 2); ctx.stroke();
        fsDrawFlower(s.x, s.y, 10, k * 5, 0.6, '#c39bff');
    } else {
        const k = s.fall / 20;
        fsDrawSlash(s.x, s.y, s.r, 0.6, k, '#c39bff');
        fsDrawSlash(s.x, s.y, s.r * 0.8, 3.7, k, '#c39bff');
    }
    ctx.restore();
}

function fsDrawStar(st) {
    if (!st.active) return;
    const R = st.r;
    ctx.save();
    const life = Math.min(1, st.t / 10);
    const k = Math.min(1, st.t / st.dur);
    // Vùng
    ctx.globalAlpha = 0.85 * life * (st.t > st.dur ? Math.max(0, 1 - (st.t - st.dur) / 24) : 1);
    const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, R);
    g.addColorStop(0, 'rgba(255, 61, 139, 0.32)'); g.addColorStop(1, 'rgba(255, 126, 182, 0.04)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(st.x, st.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = FS_PINK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(st.x, st.y, R, 0, Math.PI * 2); ctx.stroke();
    // Ngôi sao 5 cánh vẽ dần bằng các đường chém
    const rot = st.rot + st.t * 0.02;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = rot + i * 4 * Math.PI / 5 - Math.PI / 2; pts.push([st.x + Math.cos(a) * R * 0.9, st.y + Math.sin(a) * R * 0.9]); }
    const segs = Math.min(5, k * 5 * 1.6);
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 14; ctx.shadowColor = FS_DEEP;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
        const f = Math.max(0, Math.min(1, segs - i));
        if (f <= 0) break;
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 5];
        ctx.strokeStyle = FS_PINK; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f); ctx.stroke();
    }
    // Nhát chém liên tục trong vùng
    if (st.t <= st.dur) {
        const kk = (st.t % 15) / 15;
        fsDrawSlash(st.x, st.y, R * 0.7, st.t * 0.37, kk, FS_PINK);
    } else {
        // Nhát kết liễu: chữ X lớn
        const kf = (st.t - st.dur) / 24;
        fsDrawSlash(st.x, st.y, R * 1.1, 0.78, kf, '#ffffff', 0.25);
        fsDrawSlash(st.x, st.y, R * 1.1, 0.78 + Math.PI / 2 + Math.PI, kf, FS_DEEP, 0.25);
    }
    ctx.restore();
    fsDrawFlower(st.x, st.y, 12, -st.t * 0.05, 0.9);
}

// Vòng Cảnh Báo Thiên
function fsDrawThienCircle(p) {
    const c = p.fsCircle;
    if (!c) return;
    const t = c.t;
    ctx.save();
    const landing = c.landing > 0;
    if (landing) {
        // RULE 11: vòng đã KHÓA — đỏ đặc, đứng yên, vòng ngoài co dần tới lúc giáng
        const lk = 1 - c.landing / (c.landMax || 30);
        const R = c.r;
        const blink = 0.5 + 0.5 * Math.sin(lk * Math.PI * 10);
        ctx.fillStyle = `rgba(255, 30, 60, ${0.28 + 0.22 * lk})`;
        ctx.shadowBlur = 16; ctx.shadowColor = '#ff1e3c';
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff1e3c'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + 0.4 * blink})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.x, c.y, R + R * 1.1 * (1 - lk), 0, Math.PI * 2); ctx.stroke();
        // Hồng tâm
        ctx.strokeStyle = 'rgba(255, 230, 235, 0.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x - R * 0.5, c.y); ctx.lineTo(c.x + R * 0.5, c.y);
        ctx.moveTo(c.x, c.y - R * 0.5); ctx.lineTo(c.x, c.y + R * 0.5);
        ctx.stroke();
        fsDrawFlower(c.x, c.y, c.emp ? 14 : 10, 0, 0.9, '#ff3d5a');
        // 0.25s cuối: cột sáng & lưỡi kiếm rơi
        if (lk > 0.5) {
            const fk = (lk - 0.5) / 0.5;
            const dir = fsDir(p);
            const top = c.y + dir * (200 * (1 - fk));
            ctx.globalCompositeOperation = 'lighter';
            const lg = ctx.createLinearGradient(c.x, top, c.x, c.y);
            lg.addColorStop(0, 'rgba(255,126,182,0)'); lg.addColorStop(1, 'rgba(255,240,247,0.85)');
            ctx.fillStyle = lg;
            ctx.fillRect(c.x - 6, Math.min(top, c.y), 12, Math.abs(c.y - top));
            fsDrawPetal(c.x, top, 12, dir < 0 ? Math.PI : 0, 1);
        }
        ctx.restore();
        return;
    }
    const R = c.r;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, R);
    g.addColorStop(0, 'rgba(255, 61, 139, 0.08)');
    g.addColorStop(1, 'rgba(255, 61, 139, 0.22)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
    // Quầng ngoài phập phồng
    const halo = ctx.createRadialGradient(c.x, c.y, R * 0.85, c.x, c.y, R * 1.35);
    halo.addColorStop(0, `rgba(255,61,139,${0.18 + 0.08 * Math.sin(t * 0.15)})`); halo.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(c.x, c.y, R * 1.35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff4d8d'; ctx.lineWidth = 2;
    ctx.shadowBlur = 10; ctx.shadowColor = FS_DEEP;
    ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t * 0.8;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    // Thời gian còn lại
    ctx.strokeStyle = 'rgba(255, 214, 232, 0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(c.x, c.y, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - t / c.max)); ctx.stroke();
    // Hoa văn xoay
    for (let i = 0; i < 6; i++) {
        const a = t * 0.03 + i * Math.PI / 3;
        fsDrawPetal(c.x + Math.cos(a) * R * 0.66, c.y + Math.sin(a) * R * 0.66, 4, a + Math.PI / 2, 0.7, false);
    }
    fsDrawFlower(c.x, c.y, c.emp ? 14 : 10, -t * 0.04, 0.85);
    ctx.restore();
}

// Full Evo: cánh hoa rơi phủ màn hình
function fsDrawPetalRain(p) {
    const t = p.fsTick || 0;
    const W = canvas.width, H = canvas.height;
    ctx.save();
    for (let i = 0; i < 16; i++) {
        const sp = 0.5 + (i % 4) * 0.18;
        const y = ((i * 97 + t * sp * 1.4) % (H + 40)) - 20;
        const x = ((i * 53.7) % W) + Math.sin(t * 0.02 + i) * 24;
        fsDrawPetal(x, y, 3.5 + (i % 3), t * 0.03 + i, 0.32, false);
    }
    ctx.restore();
}

// ==========================================
// Vệt sáng / bùng nở / kết liễu
// ==========================================
function fsEaseOut(k) { return 1 - Math.pow(1 - k, 3); }
function fsEaseBack(k) { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }

// Sao chổi sáng hồng: đuôi (x1,y1) thon dần -> đầu (x2,y2) tròn rực
function fsDrawLightStreak(x1, y1, x2, y2, w, alpha = 1) {
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (alpha <= 0) return;
    ctx.save();
    ctx.translate(x2, y2); ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    const shape = (ww) => {
        ctx.beginPath();
        ctx.moveTo(-L, 0);
        ctx.quadraticCurveTo(-L * 0.35, -ww, 0, -ww);
        ctx.arc(0, 0, ww, -Math.PI / 2, Math.PI / 2);
        ctx.quadraticCurveTo(-L * 0.35, ww, -L, 0);
        ctx.closePath();
    };
    if (L > 1) {
        const g = ctx.createLinearGradient(-L, 0, 0, 0);
        g.addColorStop(0, 'rgba(255,61,139,0)'); g.addColorStop(0.55, 'rgba(255,61,139,0.32)'); g.addColorStop(1, 'rgba(255,126,182,0.8)');
        ctx.fillStyle = g; shape(w); ctx.fill();
        const g2 = ctx.createLinearGradient(-L, 0, 0, 0);
        g2.addColorStop(0, 'rgba(255,214,232,0)'); g2.addColorStop(0.7, 'rgba(255,230,242,0.7)'); g2.addColorStop(1, '#ffffff');
        ctx.fillStyle = g2; shape(w * 0.38); ctx.fill();
    }
    const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.9);
    hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(0.3, 'rgba(255,214,232,0.75)'); hg.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(0, 0, w * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function fsDrawStreak(s) {
    const D = s.dur, t = s.t;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    const at = (u) => [s.x1 + dx * u, s.y1 + dy * u];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    ctx.save();
    // Điểm xuất phát: quầng hồng tan dần
    const k0 = Math.min(1, t / (D + 6));
    if (k0 < 1) {
        const g = ctx.createRadialGradient(s.x1, s.y1, 0, s.x1, s.y1, 26);
        g.addColorStop(0, `rgba(255,214,232,${0.55 * (1 - k0)})`); g.addColorStop(1, 'rgba(255,126,182,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x1, s.y1, 26, 0, Math.PI * 2); ctx.fill();
    }
    // Thân vệt sáng (đầu lao nhanh rồi phanh, đuôi đuổi theo)
    if (t <= D) {
        const k = t / D;
        const hu = fsEaseOut(k), tu = Math.pow(k, 2.2) * 0.98;
        const [hx, hy] = at(hu), [tx, ty] = at(tu);
        fsDrawLightStreak(tx, ty, hx, hy, 9 - 3 * k, 1);
    }
    // Cánh hoa rụng dọc đường bay
    const N = 12;
    for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N;
        const born = D * (1 - Math.cbrt(1 - u));
        const age = t - born;
        if (age < 0 || age > 26) continue;
        const f = age / 26;
        const side = ((i * 7 + Math.floor(s.seed * 10)) % 2) ? 1 : -1;
        const drift = (6 + (i % 3) * 5) * fsEaseOut(Math.min(1, age / 18)) * side;
        const [px, py] = at(u);
        const rot = s.seed + i * 1.7 + age * 0.18 * side;
        fsDrawPetal(px + nx * drift, py + ny * drift + age * 0.3, 3.4 * (1 - f * 0.5), rot, (1 - f) * 0.9, i % 3 === 0);
    }
    ctx.restore();
}

function fsDrawBloom(b) {
    const k = b.t / b.dur, e = fsEaseOut(k), R = b.r;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Chớp sáng
    const fr = R * (0.45 + 0.6 * e);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, fr);
    g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k) * (1 - k)})`);
    g.addColorStop(0.4, `rgba(255,180,215,${0.5 * (1 - k)})`);
    g.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, fr, 0, Math.PI * 2); ctx.fill();
    // Vòng sóng kép
    ctx.strokeStyle = `rgba(255,126,182,${0.85 * (1 - k)})`; ctx.lineWidth = 3.2 * (1 - k) + 0.6;
    ctx.beginPath(); ctx.arc(b.x, b.y, R * (0.3 + 0.95 * e), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(b.x, b.y, R * (0.2 + 0.7 * e), 0, Math.PI * 2); ctx.stroke();
    // Tia sáng
    ctx.strokeStyle = `rgba(255,230,242,${0.8 * (1 - k)})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const a = b.rot + i * Math.PI / 4;
        const r0 = R * (0.25 + 0.5 * e), r1 = R * (0.5 + 0.85 * e) * (i % 2 ? 0.75 : 1);
        ctx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0);
        ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1);
    }
    ctx.stroke();
    ctx.restore();
    // Bông hoa mở
    const fk = fsEaseBack(Math.min(1, k * 2.4));
    fsDrawFlower(b.x, b.y, Math.max(0.1, R * 0.42 * fk), b.rot + k * 1.2, Math.max(0, 1 - k * 1.1));
}

// Nét mực thư pháp: dải thuôn 2 đầu theo đường cong (x0,y0)->(cx,cy)->(x1,y1), hiện dần theo k
function fsInkStroke(x0, y0, cx, cy, x1, y1, w, k, col, seed, rim) {
    if (k <= 0) return;
    const N = 18, L = [], R = [];
    for (let i = 0; i <= N; i++) {
        const s = i / N * k, u = 1 - s;
        const px = u * u * x0 + 2 * u * s * cx + s * s * x1, py = u * u * y0 + 2 * u * s * cy + s * s * y1;
        const dx = 2 * u * (cx - x0) + 2 * s * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * s * (y1 - cy), dl = Math.hypot(dx, dy) || 1;
        const ww = w * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.05)), 0.55) * (0.82 + 0.18 * Math.sin(s * 23 + seed));
        L.push([px - dy / dl * ww, py + dx / dl * ww]); R.push([px + dy / dl * ww * 0.7, py - dx / dl * ww * 0.7]);
    }
    ctx.fillStyle = col; ctx.beginPath();
    L.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath(); ctx.fill();
    if (rim) { ctx.strokeStyle = rim; ctx.lineWidth = 1; ctx.stroke(); }
}
// Kết liễu (lớp dưới xe): trăng tròn + nét mực + hoa lớn nở + bão cánh hoa xoáy
function fsDrawFinisher(f) {
    const t = f.t, away = f.team === 1 ? -1 : 1;
    const E = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
    const out = t > 55 ? Math.max(0, 1 - (t - 55) / 35) : 1, end = 1 - E(70, 90);
    ctx.save();
    // Trăng tròn mờ sau lưng nạn nhân
    const mk = E(0, 18) * end;
    if (mk > 0) {
        const mx = f.x + 70, my = f.y + away * 95, mr = 46;
        const hg = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.6);
        hg.addColorStop(0, `rgba(255,214,232,${0.35 * mk})`); hg.addColorStop(1, 'rgba(255,214,232,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(mx, my, mr * 2.6, 0, Math.PI * 2); ctx.fill();
        const mg = ctx.createRadialGradient(mx - 12, my - 12, 4, mx, my, mr);
        mg.addColorStop(0, `rgba(255,250,252,${0.95 * mk})`); mg.addColorStop(1, `rgba(255,190,220,${0.85 * mk})`);
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(214,120,170,${0.25 * mk})`;
        [[-14, -8, 9], [10, 12, 7], [16, -16, 5]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, Math.PI * 2); ctx.fill(); });
        // cành anh đào vắt ngang trăng (nét mực)
        fsInkStroke(mx - 110, my + 30, mx - 20, my - 10, mx + 80, my + 20, 4, E(2, 16), `rgba(26,8,20,${0.9 * mk})`, f.seed);
        for (let i = 0; i < 5; i++) fsDrawFlower(mx - 70 + i * 34, my + 6 + Math.sin(i * 2.1) * 12, 5.5, f.seed + i, mk * 0.95, i % 2 ? FS_LIGHT : FS_PINK);
    }
    // 3 nét mực lớn quét ngang phía sau (đậm -> nhạt)
    for (let j = 0; j < 3; j++) {
        const k = fsEaseOut(E(2 + j * 4, 14 + j * 4)), y0 = f.y + (j - 1) * 34 + away * 10;
        fsInkStroke(f.x - 230, y0 + 30, f.x, y0 - 30 + j * 20, f.x + 230, y0 + 10 - j * 12, 18 - j * 4, k, `rgba(48,6,30,${(0.7 - j * 0.15) * end})`, f.seed + j, `rgba(255,126,182,${(0.45 - j * 0.1) * end})`);
    }
    // Vùng sáng hồng loang
    const R = 130 * fsEaseOut(Math.min(1, t / 20)) + 1;
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
    g.addColorStop(0, `rgba(255,214,232,${0.45 * out})`); g.addColorStop(0.5, `rgba(255,61,139,${0.18 * out})`); g.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill();
    // Vòng sóng
    ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 3; j++) {
        const kk = (t - j * 6) / 34;
        if (kk <= 0 || kk >= 1) continue;
        ctx.strokeStyle = j === 1 ? `rgba(255,255,255,${0.8 * (1 - kk)})` : `rgba(255,140,195,${0.8 * (1 - kk)})`;
        ctx.lineWidth = 5 * (1 - kk) + 0.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, 20 + 150 * fsEaseOut(kk), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // Hoa anh đào khổng lồ
    const s = 46 * fsEaseBack(Math.min(1, t / 16));
    if (s > 0.5 && out > 0) {
        for (let i = 0; i < 5; i++) {
            const a = f.seed + t * 0.012 + i * Math.PI * 2 / 5;
            fsDrawPetal(f.x + Math.sin(a) * s * 0.55, f.y - Math.cos(a) * s * 0.55, s * 0.55, a + Math.PI, 0.85 * out, i === 0);
        }
        ctx.save();
        ctx.globalAlpha = out;
        ctx.strokeStyle = 'rgba(255,247,168,0.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const a = f.seed * 2 + i * Math.PI / 5;
            ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * s * 0.32, f.y + Math.sin(a) * s * 0.32);
        }
        ctx.stroke();
        const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, s * 0.2);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#ffd34d');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(f.x, f.y, s * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    // Bão cánh hoa: xoáy quanh mục tiêu rồi tung ra, rơi nhẹ
    for (let i = 0; i < 44; i++) {
        const r1 = ((Math.sin(f.seed * 13 + i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const r2 = ((Math.sin(f.seed * 7 + i * 78.233) * 12345.678) % 1 + 1) % 1;
        const sp = fsEaseOut(Math.min(1, t / 60));
        const a = i * 2.39996 + f.seed + sp * (2.2 + r2 * 1.5);
        const d = (30 + r1 * 170) * sp + 10;
        const px = f.x + Math.cos(a) * d + Math.sin(t * 0.05 + i) * 6;
        const py = f.y + Math.sin(a) * d * 0.8 + t * t * 0.005;
        const al = Math.min(1, t / 4) * (t > 50 ? Math.max(0, 1 - (t - 50) / 38) : 1);
        if (al <= 0) continue;
        fsDrawPetal(px, py, 3.2 + r2 * 4.5, a + t * (0.08 + r2 * 0.1), al, i % 4 === 0, i % 5 === 0 ? '#ffc4dd' : (i % 7 === 0 ? '#ffffff' : FS_PINK));
    }
    ctx.restore();
}

// Kết liễu (lớp trên cùng): chớp màn hình + nhát chém hồng cắt ngang + vệt mực văng + khung điện ảnh + tiêu đề
function fsDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const E = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
    ctx.save();
    if (t < 10) {
        ctx.fillStyle = `rgba(255, 210, 230, ${0.55 * (1 - t / 10)})`;
        ctx.fillRect(-W, -H, W * 3, H * 3);
    }
    if (t < 44) {
        const L = Math.hypot(W, H);
        const grow = fsEaseOut(Math.min(1, t / 6));
        const thin = t < 8 ? 1 : Math.max(0, 1 - (t - 8) / 36);
        ctx.translate(f.x, f.y); ctx.rotate(f.ang);
        // vệt mực đen dưới nhát chém
        fsInkStroke(-L * 0.6, 6, 0, -10, -L * 0.6 + 1.2 * L * grow, 4, 7 * thin + 1, 1, `rgba(20,4,14,${0.6 * thin})`, f.seed);
        ctx.globalCompositeOperation = 'lighter';
        const x0 = -L, x1 = -L + 2 * L * grow;
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, 'rgba(255,61,139,0)'); g.addColorStop(0.75, 'rgba(255,61,139,0.75)'); g.addColorStop(1, 'rgba(255,214,232,0.95)');
        ctx.fillStyle = g;
        const hw = 9 * thin + 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, 0); ctx.quadraticCurveTo(0, -hw * 1.6, x1, 0); ctx.quadraticCurveTo(0, hw * 1.6, x0, 0);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.95 * thin})`;
        ctx.beginPath();
        ctx.moveTo(x0 * 0.8, 0); ctx.quadraticCurveTo(0, -hw * 0.45, x1, 0); ctx.quadraticCurveTo(0, hw * 0.45, x0 * 0.8, 0);
        ctx.fill();
        // Nhát chéo thứ hai tại mục tiêu
        if (t > 4 && t < 26) {
            const kk = (t - 4) / 22;
            ctx.rotate(Math.PI / 2 + 0.3);
            ctx.fillStyle = `rgba(255,240,247,${0.9 * (1 - kk)})`;
            const l2 = 70 * fsEaseOut(kk);
            ctx.beginPath(); ctx.moveTo(-l2, 0); ctx.quadraticCurveTo(0, -4, l2, 0); ctx.quadraticCurveTo(0, 4, -l2, 0); ctx.fill();
        }
    }
    ctx.restore();
    // giọt mực văng quanh mục tiêu
    const sk = E(4, 14) * (1 - E(60, 86));
    if (sk > 0) {
        ctx.save(); ctx.fillStyle = `rgba(24,6,16,${0.75 * sk})`;
        for (let i = 0; i < 14; i++) {
            const r1 = ((Math.sin(f.seed * 3 + i * 9.17) * 9631.7) % 1 + 1) % 1, a = f.ang + (i % 2 ? 0 : Math.PI) + (r1 - 0.5) * 0.9;
            const d = (40 + r1 * 110) * fsEaseOut(E(4, 14)), r = 1.5 + r1 * 3.5;
            ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
    if (typeof fcLetterbox === 'function') {
        fcVignette(0.45 * fcBarK(t, 10, 72, 90), '#2a0518');
        fcLetterbox(fcBarK(t, 8, 74, 90), FS_PINK);
        fcTitle('HOA TÀN', '✿  NGUYỆT HẠ · HOA ẢNH TRẢM  ✿', E(8, 18), { c: FS_DEEP, c2: FS_LIGHT, alpha: 1 - E(72, 88), sw: E(12, 40) * 1.2 - 0.1, size: 36 });
    }
}

function fsFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof FsFinisher && e.active) e.drawOver();
}

Object.assign(CharHooks.registry.flower_shadow, {
    draw() {
        if (fsFull(this) && !(this.id === 2 && p1 && p1.weapon === 'flower_shadow' && fsFull(p1))) fsDrawPetalRain(this);
        if (this.fsMode === 'thien') { fsDrawThienCircle(this); return; }
        if (this.fsHidden) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = this.fsTick || 0;
        ctx.save();
        // Vệt lướt Phá
        if (this.fsMode === 'pha') {
            const tr = this.trail || [];
            if (this.phase === 2 && tr.length > 1) {
                // Lộn về: xe hóa vệt sáng hồng lao vút về chỗ cũ, cánh hoa rụng theo
                const dir = fsDir(this), farY = dir < 0 ? 2 + this.h / 2 : canvas.height - this.h / 2 - 2;
                fsDrawLightStreak(cx, cy + dir * Math.min(130, Math.abs(cy - farY) + 10), cx, cy, this.w * 0.4, 1);
                for (let i = 1; i < tr.length; i++) {
                    const sd = (i % 2 ? 1 : -1) * (6 + i * 1.5);
                    fsDrawPetal(cx + sd, tr[i] + this.h / 2, 3.2 - i * 0.2, t * 0.2 + i * 1.3, 0.75 * (1 - i / tr.length), false);
                }
            } else {
                // Lướt tới: tàn ảnh mềm
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 1; i < tr.length; i++) {
                    const yy = tr[i] + this.h / 2, rr = this.w * 0.5 * (1 - i / tr.length * 0.5);
                    const g = ctx.createRadialGradient(cx, yy, 0, cx, yy, rr);
                    g.addColorStop(0, `rgba(255,190,220,${0.35 * (1 - i / tr.length)})`); g.addColorStop(1, 'rgba(255,61,139,0)');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, yy, rr, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalCompositeOperation = 'source-over';
                fsDrawBlade(cx, this.y, this.h, fsDir(this), 1);
            }
        }
        // Hoa văn trên thân xe
        fsDrawFlower(cx, cy, this.w * 0.42, t * 0.02, 0.95);
        // Bách Hoa Nở Rộ: cánh hoa bay quanh xe
        if (this.fsEmpowered) {
            for (let i = 0; i < 5; i++) {
                const a = t * 0.06 + i * Math.PI * 2 / 5;
                fsDrawPetal(cx + Math.cos(a) * this.w * 0.95, cy + Math.sin(a) * this.h * 0.7, 3.6, a, 0.95);
            }
        }
        // Vòng giữ đổi vũ điệu
        if (this.fsHoldValid && this.fsHold > 3) {
            const k = this.fsHold < FS_HOLD_TICKS ? this.fsHold / FS_HOLD_TICKS : ((this.fsHold - FS_HOLD_TICKS) % 20) / 20;
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        }
        ctx.restore();
    },

    drawUI() {
        if (this.fsHidden) return;
        const bw = this.w + 16, bx = this.x - 8;
        const y = this.id === 1 ? this.y + this.h + 12 : this.y - 16;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(bx, y, bw, 4);
        const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        g.addColorStop(0, FS_DEEP); g.addColorStop(1, FS_LIGHT);
        ctx.fillStyle = g;
        const hoa = Math.max(0, this.fsHoa);
        ctx.fillRect(bx, y, bw * Math.min(100, hoa) / 100, 4);
        // Kho Hoa > 100%: lớp 2 (100-200%) trắng hồng rực, lớp 3 (200-300%) vàng kim, chồng lên cùng thanh
        const maxH = fsMaxHoa(this);
        const layers = [[100, '#ffffff', FS_PINK], [200, FS_EMP_GOLD, FS_EMP_GOLD]];
        for (const [base, col, glow] of layers) {
            if (maxH <= base) break;
            // Khung báo còn lớp chưa nạp
            ctx.strokeStyle = base === 100 ? 'rgba(255,255,255,0.35)' : 'rgba(255,211,77,0.45)';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(bx - 0.5 - (base === 200 ? 1 : 0), y - 0.5 - (base === 200 ? 1 : 0), bw + 1 + (base === 200 ? 2 : 0), 5 + (base === 200 ? 2 : 0));
            if (hoa <= base) continue;
            ctx.shadowBlur = 8; ctx.shadowColor = glow;
            ctx.fillStyle = col;
            ctx.fillRect(bx, y + 1, bw * Math.min(100, hoa - base) / 100, 2);
            ctx.shadowBlur = 0;
        }
        if (hoa > 100) {
            ctx.font = 'bold 7px "Orbitron", Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = hoa > 200 ? FS_EMP_GOLD : '#ffffff';
            drawWorldText(ctx, `${Math.floor(hoa)}%`, bx - 2, y + 5);
        }
        // Vạch giá vũ điệu hiện tại
        const cost = FS_COST[this.fsDance || 0];
        ctx.fillStyle = this.fsHoa >= cost ? '#ffffff' : '#64748b';
        ctx.fillRect(bx + bw * cost / 100 - 0.5, y - 1, 1.5, 6);
        // Số cánh Khai trên sân / giới hạn (Full Evo: không giới hạn)
        const cap = fsPetalCap(this);
        if (cap !== Infinity) {
            const n = fsKhaiCount(this);
            ctx.font = 'bold 7px "Orbitron", Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = n >= cap ? '#ff5d7a' : 'rgba(255, 214, 232, 0.75)';
            drawWorldText(ctx, `✿${n}/${cap}`, bx + bw / 2, this.id === 1 ? y + 12 : y - 4);
        }
        // Vũ điệu hiện tại: nhãn + 3 chấm bên cạnh xe
        const right = this.x + this.w + 44 < canvas.width;
        const lx = right ? this.x + this.w + 6 : this.x - 6;
        const ly = this.y + this.h / 2 + (this.id === 1 ? 0 : 3);
        ctx.font = 'bold 8px "Orbitron", Arial';
        ctx.textAlign = right ? 'left' : 'right';
        ctx.fillStyle = this.fsEmpowered ? '#fff0f7' : FS_PINK;
        if (this.fsEmpowered) { ctx.shadowBlur = 8; ctx.shadowColor = FS_PINK; }
        drawWorldText(ctx, (this.fsEmpowered ? '✿' : '') + FS_NAME[this.fsDance || 0], lx, ly);
        ctx.shadowBlur = 0;
        const dotY = this.id === 1 ? ly + 6 : ly - 12;
        for (let i = 0; i < 3; i++) {
            const on = i === this.fsDance;
            ctx.fillStyle = on ? (this.fsEmpowered ? '#fff0f7' : FS_PINK) : 'rgba(255, 214, 232, 0.35)';
            const dx = right ? lx + 3 + i * 8 : lx - 3 - (2 - i) * 8;
            ctx.beginPath(); ctx.arc(dx, dotY, on ? 2.6 : 1.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
});
