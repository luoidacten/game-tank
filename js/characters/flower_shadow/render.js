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
    ctx.restore();
}

// Cánh hoa cường hóa: vàng kim + hào quang tia sáng 4 cánh (xuyên vật cản)
function fsDrawEmpPetal(x, y, s, rot, alpha, age) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.75 + 0.25 * Math.sin(age * 0.3);
    const halo = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
    halo.addColorStop(0, 'rgba(255, 230, 140, 0.55)'); halo.addColorStop(1, 'rgba(255, 200, 60, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, s * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255, 246, 200, ${0.8 * pulse})`; ctx.lineWidth = 1.2;
    const L = s * 2.6 * pulse, a = age * 0.08;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const k = a + i * Math.PI / 2;
        ctx.moveTo(x + Math.cos(k) * s * 0.6, y + Math.sin(k) * s * 0.6);
        ctx.lineTo(x + Math.cos(k) * L, y + Math.sin(k) * L);
    }
    ctx.stroke();
    ctx.restore();
    fsDrawPetal(x, y, s, rot, alpha, true, FS_EMP_GOLD, FS_EMP_LIGHT);
}

function fsDrawPetalEntity(p) {
    if (!p.active) return;
    const o = p.owner;
    const alpha = p.fade > 0 ? 1 - p.fade / 20 : 1;
    ctx.save();
    // Vệt bay
    const tr = p.trail || [];
    for (let i = 2; i < tr.length; i += 2) {
        ctx.globalAlpha = alpha * (p.emp ? 0.4 : 0.28) * (1 - i / tr.length);
        ctx.fillStyle = p.emp ? FS_EMP_GOLD : FS_PINK;
        ctx.beginPath(); ctx.arc(tr[i], tr[i + 1], p.r * (1 - i / tr.length) * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (p.fade > 0) {
        // Vỡ / bị đè nát: cánh hoa tan dần & rơi vụn
        const k = p.fade / 20;
        fsDrawPetal(p.x, p.y, p.r * (1.1 - 0.5 * k), p.rot, alpha * 0.9, false, p.emp ? FS_EMP_GOLD : FS_PINK);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.emp ? FS_EMP_LIGHT : FS_LIGHT;
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
    ctx.strokeStyle = '#ff4d8d'; ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t * 0.8;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
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
            for (let i = 0; i < tr.length; i++) {
                ctx.fillStyle = `rgba(255, 126, 182, ${0.3 * (1 - i / tr.length)})`;
                ctx.fillRect(this.x, tr[i], this.w, this.h);
            }
            fsDrawBlade(cx, this.y, this.h, fsDir(this), 1);
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
