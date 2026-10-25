// ==========================================
// Art xe & đạn nhóm "curse" (registerTankArt / registerBulletArt)
// ------------------------------------------
// Vua Đầu Bếp (sukuna), Kẻ Mạnh Nhất (the_strongest), Âm Dương Sư (am_duong_su),
// Chiêu Hồn Sư (necromancer + vong linh), Trối Chết (death_lock + lồng xích), Cổng Không Gian (portal + cổng bắn).
// Kèm hiệu ứng chiêu: nhát chém Giải/Phân, Hỏa Mũi Tên (Fuga), Xanh/Đỏ/Tím, BÀNH TRƯỚNG LÃNH ĐỊA
// (Phục Ma Ngự Trù Tử & Vô Lượng Không Xứ).
// Chỉ ĐỌC trạng thái game -> host & guest vẽ giống nhau. Hạt/vị trí tính sẵn theo hạt giống + thời gian
// (không tạo mảng hạt mỗi khung hình) để chạy mượt trên điện thoại.
// ==========================================

const CURSE_FX = (() => {
    const TAU = Math.PI * 2;
    // Hash giả ngẫu nhiên cố định (0..1) theo số nguyên -> vị trí hạt tất định
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const frac = (x) => x - Math.floor(x);
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
    const low = () => (typeof Display !== 'undefined' && Display.lowQuality);

    // Ký tự "chú văn" vẽ bằng nét (không phụ thuộc font CJK): 3-5 nét theo hạt giống
    function glyph(seed, size) {
        const n = 3 + Math.floor(hash(seed) * 3);
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = hash(seed * 7 + i * 13), b = hash(seed * 11 + i * 17), c = hash(seed * 3 + i * 29);
            const kind = Math.floor(a * 4);
            const x = (b - 0.5) * size, y = (c - 0.5) * size;
            if (kind === 0) { ctx.moveTo(-size / 2, y); ctx.lineTo(size / 2, y); }            // ngang
            else if (kind === 1) { ctx.moveTo(x, -size / 2); ctx.lineTo(x, size / 2); }       // dọc
            else if (kind === 2) { ctx.moveTo(x - size * 0.3, y - size * 0.3); ctx.lineTo(x + size * 0.3, y + size * 0.3); } // phẩy
            else { ctx.moveTo(x, y - size * 0.35); ctx.lineTo(x, y + size * 0.2); ctx.lineTo(x + size * 0.25, y + size * 0.1); } // móc
        }
        ctx.stroke();
    }

    // Vòng chú văn xoay quanh (x,y)
    function glyphRing(x, y, r, count, rot, size, color, alpha, seed) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha *= alpha;
        ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.6, size * 0.18); ctx.lineCap = 'round';
        for (let i = 0; i < count; i++) {
            const a = rot + i * TAU / count;
            ctx.save();
            ctx.rotate(a); ctx.translate(0, -r);
            glyph(seed + i, size);
            ctx.restore();
        }
        ctx.lineWidth = 1;
        ctx.globalAlpha *= 0.6;
        ctx.beginPath(); ctx.arc(0, 0, r - size * 0.8, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r + size * 0.8, 0, TAU); ctx.stroke();
        ctx.restore();
    }

    // Lưỡi chém lưỡi liềm (hệ toạ độ đã xoay: +x = hướng bay), W = bề ngang lưỡi, D = độ cong
    function crescentPath(W, D, thick) {
        ctx.beginPath();
        ctx.moveTo(-thick * 0.3, -W / 2);
        ctx.quadraticCurveTo(D, 0, -thick * 0.3, W / 2);
        ctx.quadraticCurveTo(D - thick, 0, -thick * 0.3, -W / 2);
        ctx.closePath();
    }

    return { TAU, hash, frac, clamp01, easeOut, low, glyph, glyphRing, crescentPath };
})();

// ==========================================
// 1. VUA ĐẦU BẾP (SUKUNA)
// ==========================================
registerTankArt('sukuna', (p, k) => {
    const t = k.t;
    // Bánh xích đen - mắt xích đỏ máu
    TA.treads(-15.5, 4.5, -12, 14, t, '#140606', '#5b1010');
    // Thân: khối giáp đỏ sẫm, mép trước có răng nanh, hai bên vai nhô gai
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-12, 12, '#3a0707', '#9b1b1b');
    ctx.beginPath();
    ctx.moveTo(0, -11.5);
    ctx.lineTo(5, -10); ctx.lineTo(8.5, -13); ctx.lineTo(11.5, -8);
    ctx.lineTo(10.5, -2); ctx.lineTo(12.5, 4); ctx.lineTo(10.5, 11); ctx.lineTo(5, 14);
    ctx.lineTo(-5, 14); ctx.lineTo(-10.5, 11); ctx.lineTo(-12.5, 4); ctx.lineTo(-10.5, -2);
    ctx.lineTo(-11.5, -8); ctx.lineTo(-8.5, -13); ctx.lineTo(-5, -10);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Hoa văn ký tự (vết xăm đen) trên giáp
    ctx.strokeStyle = '#0a0000'; ctx.lineWidth = 1.6;
    [-1, 1].forEach(sd => {
        ctx.beginPath();
        ctx.moveTo(sd * 10, -6); ctx.lineTo(sd * 7, -4.5); ctx.lineTo(sd * 8.5, -2.5);
        ctx.moveTo(sd * 11, 3); ctx.lineTo(sd * 7.5, 4.5); ctx.lineTo(sd * 9, 7);
        ctx.moveTo(sd * 8.5, 10); ctx.lineTo(sd * 5, 11.5);
        ctx.stroke();
    });
    // Lò lửa phía sau (Evo 1: Fuga)
    if (k.evo1) {
        const fl = 0.6 + 0.4 * Math.sin(t * 18);
        const g = ctx.createRadialGradient(0, 11, 0, 0, 11, 4.5);
        g.addColorStop(0, '#fff7cc'); g.addColorStop(0.4, '#ff9f1a'); g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g; ctx.globalAlpha = 0.6 + 0.4 * fl;
        ctx.beginPath(); ctx.arc(0, 11, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffcf5a';
        ctx.beginPath(); ctx.moveTo(-1.6, 12); ctx.quadraticCurveTo(0, 7 - fl * 2, 1.6, 12); ctx.closePath(); ctx.fill();
    }
    // Dao phay (nòng) - hai lưỡi khi có Evo 2 (Phách Diện Rộng)
    const blade = (ang, len, w) => {
        ctx.save(); ctx.rotate(ang);
        ctx.fillStyle = TA.metal(-w / 2, w / 2, '#2a2a2e', '#e5e7eb');
        ctx.beginPath();
        ctx.moveTo(-w / 2, -5); ctx.lineTo(-w / 2, -5 - len + 2); ctx.lineTo(w / 2, -5 - len); ctx.lineTo(w / 2, -5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff3b3b'; ctx.fillRect(w / 2 - 1, -5 - len + 1, 1, len - 2); // lưỡi sắc đỏ
        ctx.restore();
    };
    if (k.evo2) { blade(-0.42, 8, 2.6); blade(0.42, 8, 2.6); }
    blade(0, 11, 4);
    // Chuôi chắn
    ctx.fillStyle = '#1a0000'; TA.rr(-4.5, -6.5, 9, 2.4, 1); ctx.fill();
    // Tháp: đầu tối, 4 mắt đỏ
    const tg = ctx.createRadialGradient(-1.5, -0.5, 1, 0, 1, 7);
    tg.addColorStop(0, '#5b0f0f'); tg.addColorStop(1, '#170303');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(0, 1, 6.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.5; ctx.stroke();
    const blink = (Math.floor(t * 0.7) % 7 === 0 && (t % 1) < 0.12) ? 0.25 : 1;
    ctx.save(); TA.glow('#ff2020', 6);
    ctx.fillStyle = '#ff3030'; ctx.globalAlpha = blink;
    [[-3, -1.6], [3, -1.6], [-2.4, 1.3], [2.4, 1.3]].forEach(([ex, ey], i) => {
        ctx.beginPath(); ctx.ellipse(ex, ey, i < 2 ? 1.7 : 1.3, 0.8, ex < 0 ? 0.35 : -0.35, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    // Lõi màu đội
    ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 4.5, 1.3, 0, Math.PI * 2); ctx.fill();
    // Full Evo: sừng quỷ + vòng răng đỏ xoay
    if (k.full) {
        ctx.fillStyle = '#f5f5f4';
        [-1, 1].forEach(sd => {
            ctx.beginPath(); ctx.moveTo(sd * 4.5, -3.5); ctx.quadraticCurveTo(sd * 9, -6, sd * 8, -10.5); ctx.quadraticCurveTo(sd * 7, -6.5, sd * 3.2, -2); ctx.closePath(); ctx.fill();
        });
        ctx.save(); ctx.rotate(t * 1.2);
        ctx.strokeStyle = 'rgba(255,40,40,0.55)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.arc(0, 0, 15, 0, 0.5); ctx.stroke(); }
        ctx.restore();
    }
});

// Nhát chém Giải (Dismantle) / Phân (Cleave): lưỡi liềm đỏ-đen sắc lẹm + bóng mờ phía sau
function drawSukunaSlash(b, owner) {
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    const W = Math.max(b.w, b.h, 20) * 1.05;      // bề ngang lưỡi chém (vuông góc hướng bay)
    const D = W * 0.42;                            // độ cong
    const thick = Math.max(5, W * 0.24);
    const t = Date.now();
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(ang);
    // Vệt gió chém (đường mảnh kéo dài phía sau)
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    const L = Math.min(70, 10 + sp * 3);
    const tg = ctx.createLinearGradient(-L, 0, 0, 0);
    tg.addColorStop(0, 'rgba(255,40,40,0)'); tg.addColorStop(1, 'rgba(255,80,80,0.45)');
    ctx.strokeStyle = tg; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-L, -W * 0.36); ctx.lineTo(0, -W * 0.36);
    ctx.moveTo(-L * 0.7, W * 0.36); ctx.lineTo(0, W * 0.36);
    ctx.moveTo(-L * 0.85, 0); ctx.lineTo(0, 0);
    ctx.stroke();
    // Bóng mờ (afterimage)
    for (let g = 3; g >= 1; g--) {
        ctx.save();
        ctx.translate(-g * (4 + sp * 0.35), 0);
        ctx.globalAlpha = 0.16 * (4 - g);
        ctx.fillStyle = g === 1 ? '#7f0000' : '#2b0000';
        CURSE_FX.crescentPath(W * (1 - g * 0.05), D, thick);
        ctx.fill();
        ctx.restore();
    }
    // Thân lưỡi: đen ở gốc -> đỏ rực ở mép
    ctx.shadowBlur = 12; ctx.shadowColor = '#ff1a1a';
    const bg = ctx.createLinearGradient(-thick, 0, D, 0);
    bg.addColorStop(0, '#120000'); bg.addColorStop(0.55, '#b30000'); bg.addColorStop(1, '#ff4d4d');
    ctx.fillStyle = bg;
    CURSE_FX.crescentPath(W, D, thick);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Mép sắc trắng
    ctx.strokeStyle = 'rgba(255,240,240,0.95)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-thick * 0.3, -W / 2 + 1); ctx.quadraticCurveTo(D, 0, -thick * 0.3, W / 2 - 1); ctx.stroke();
    // Tia lửa ở hai mũi
    ctx.fillStyle = '#ffd1d1';
    const fl = (t >> 5) & 1;
    [-1, 1].forEach(sd => {
        ctx.beginPath(); ctx.arc(-thick * 0.3 - 1 - fl, sd * (W / 2 + 1), 1.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
}

// Trúng nhát chém Sukuna: chữ X đỏ + nhát thứ ba (dùng SwordSweep đã có trong NET_CLASSES -> guest cũng thấy)
function fxSukunaHit(x, y) {
    if (typeof fxSweep !== 'function') return;
    const a = Math.random() * Math.PI;
    fxSweep(x, y, 24, a - 1.0, a + 1.0, '#ff1f1f', 14, 7);
    fxSweep(x, y, 20, a + Math.PI / 2 + 1.0, a + Math.PI / 2 - 1.0, '#ff5252', 16, 5);
    fxSweep(x, y, 30, a + 0.5 - 0.5, a + 0.5 + 0.5, '#2b0000', 12, 4);
}

// Hỏa Mũi Tên (Fuga): mũi tên lửa lớn, lõi trắng, đuôi lửa lập loè
function drawSukunaFuga(b) {
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    const R = Math.min(b.w, b.h) / 2;
    const t = Date.now() / 1000;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(ang);
    // Quầng nhiệt
    const halo = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.5);
    halo.addColorStop(0, 'rgba(255,200,80,0.45)'); halo.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2); ctx.fill();
    // Lưỡi lửa đuôi (tất định theo thời gian)
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
        const ph = CURSE_FX.frac(t * 3 + i / 7);
        const yy = (i / 6 - 0.5) * R * 0.9 * (1 - ph * 0.5);
        const len = R * (1.2 + ph * 1.6);
        ctx.globalAlpha = 0.55 * (1 - ph);
        ctx.fillStyle = i % 2 ? '#ff7a1a' : '#ff3b00';
        ctx.beginPath();
        ctx.moveTo(-R * 0.2, yy - R * 0.28);
        ctx.quadraticCurveTo(-len * 0.6, yy + Math.sin(t * 20 + i) * 4, -len, yy);
        ctx.quadraticCurveTo(-len * 0.6, yy + R * 0.1, -R * 0.2, yy + R * 0.28);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Thân mũi tên: vệt lửa elip
    const body = ctx.createLinearGradient(-R, 0, R * 1.2, 0);
    body.addColorStop(0, 'rgba(255,60,0,0.2)'); body.addColorStop(0.5, '#ff8c1a'); body.addColorStop(1, '#fff3c4');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.0, R * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    // Đầu mũi tên
    ctx.fillStyle = '#fffbe6';
    ctx.beginPath(); ctx.moveTo(R * 1.25, 0); ctx.lineTo(R * 0.55, -R * 0.42); ctx.lineTo(R * 0.7, 0); ctx.lineTo(R * 0.55, R * 0.42); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // Lõi trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(R * 0.2, 0, R * 0.6, R * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    // Viền đen cháy ở cánh
    ctx.strokeStyle = 'rgba(60,0,0,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-R * 0.6, -R * 0.45); ctx.lineTo(-R * 0.2, 0); ctx.lineTo(-R * 0.6, R * 0.45); ctx.stroke();
    ctx.restore();
}

// Vẽ thêm trên xe Sukuna: vòng gồng (RCT / Fuga / Lãnh địa), nhát chém thế giới, thanh chú lực
Player.prototype.drawSukuna = function () {
    if (this.weapon !== 'sukuna') return;
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    const t = Date.now() / 1000;
    const charge = (this.sukunaChargeTimer || 0) / 60;
    const evo1 = this.hasUpgrade('evo_sukuna_1'), evo2 = this.hasUpgrade('evo_sukuna_2');
    const full = evo1 && evo2;
    ctx.save();
    if (charge > 0 && !this.domainActive) {
        // Vòng tiến trình gồng: mốc 1.2s hồi máu, 2s Fuga (Evo1, CE đầy), 5s Lãnh địa (Full Evo)
        const goal = full ? 5 : (evo1 && this.cursedEnergy >= 99.5 ? 2 : 1.2);
        const kk = Math.min(1, charge / goal);
        const R = this.w * 0.85;
        ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        let col = '#ff3b3b';
        if (charge >= 1.2 && !(evo1 && this.cursedEnergy >= 99.5 && charge >= 2)) col = '#22ff88';
        if (evo1 && this.cursedEnergy >= 99.5 && charge >= 2) col = '#ffa31a';
        ctx.strokeStyle = col; ctx.shadowBlur = 8; ctx.shadowColor = col;
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kk); ctx.stroke();
        ctx.shadowBlur = 0;
        // Mốc thời gian trên vòng
        if (full) {
            ctx.fillStyle = '#fff';
            [1.2, 2].forEach(m => { const a = -Math.PI / 2 + Math.PI * 2 * (m / 5); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 1.8, 0, Math.PI * 2); ctx.fill(); });
        }
        // Phản Chuyển: chữ thập xanh lục bay lên
        if (charge >= 1.2 && col === '#22ff88') {
            ctx.strokeStyle = 'rgba(34,255,136,0.8)'; ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const ph = CURSE_FX.frac(t * 1.2 + i / 3);
                const px = cx + (CURSE_FX.hash(i) - 0.5) * this.w, py = cy - ph * this.h * 0.9 * (this.id === 1 ? 1 : -1);
                ctx.globalAlpha = 1 - ph;
                ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py); ctx.moveTo(px, py - 3); ctx.lineTo(px, py + 3); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        // Đang gồng Lãnh địa (sau 2s): vòng chú văn tụ lại
        if (full && charge >= 2 && charge < 5) {
            const kd = (charge - 2) / 3;
            CURSE_FX.glyphRing(cx, cy, this.w * (1.6 - kd * 0.5), 8, t * 2, 6, '#ff3030', 0.35 + kd * 0.5, 40);
        }
    }
    // Nhát Chém Thế Giới: khoá mục tiêu - đường cắt xuyên màn hình
    const tgt = this.worldCleaveTarget;
    if (tgt && tgt.hp > 0) {
        const ex = tgt.x + tgt.w / 2, ey = tgt.y + tgt.h / 2;
        const kk = Math.min(1, Math.max(0, (charge - 8)));
        ctx.strokeStyle = `rgba(255,30,30,${0.35 + 0.6 * kk})`;
        ctx.lineWidth = 1 + kk * 3;
        ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t * 60;
        ctx.beginPath(); ctx.moveTo(0, ey - 60); ctx.lineTo(canvas.width, ey + 60); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#ff2a2a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ex, ey, tgt.w * (1.6 - kk * 0.6), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    // THANH CHÚ LỰC (luôn ở trên cùng để dễ đọc)
    const barW = this.w, barH = 5, barX = this.x;
    const barY = (this.id === 1) ? this.y + this.h + 12 : this.y - 18;
    const ce = Math.max(0, Math.min(100, this.cursedEnergy || 0));
    ctx.save();
    ctx.fillStyle = 'rgba(20,0,0,0.85)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    if (ce >= 99.5) { g.addColorStop(0, '#ff9f1a'); g.addColorStop(1, '#ff2a00'); }
    else { g.addColorStop(0, '#6d0000'); g.addColorStop(1, '#c026d3'); }
    ctx.fillStyle = g;
    ctx.fillRect(barX, barY, barW * ce / 100, barH);
    // Vạch 50 (chi phí Lãnh địa)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(barX + barW * 0.5 - 0.5, barY, 1, barH);
    if (ce >= 99.5 && Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
    }
    ctx.restore();
};

// --- BÀNH TRƯỚNG LÃNH ĐỊA: PHỤC MA NGỰ TRÙ TỬ (vẽ dưới xe) ---
function drawMalevolentShrine(p) {
    const F = CURSE_FX;
    const tick = p.sukunaDomainTick || 0;
    const t = Date.now() / 1000;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const dir = p.id === 1 ? -1 : 1;               // hướng về phía địch
    const intro = F.easeOut(tick / 24);
    const R = 350 * intro;
    const a0 = p.id === 1 ? Math.PI : 0, a1 = a0 + Math.PI;
    ctx.save();
    // 1. Viền tối đỏ toàn màn hình
    const vg = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(canvas.width, canvas.height));
    vg.addColorStop(0, 'rgba(60,0,0,0.05)'); vg.addColorStop(0.55, 'rgba(45,0,0,0.35)'); vg.addColorStop(1, 'rgba(10,0,0,0.7)');
    ctx.fillStyle = vg; ctx.globalAlpha = intro;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    // 2. Vùng lãnh địa (bán nguyệt hướng về địch)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath();
    const dg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, R));
    dg.addColorStop(0, 'rgba(150,0,0,0.30)'); dg.addColorStop(0.7, 'rgba(90,0,0,0.22)'); dg.addColorStop(1, 'rgba(200,0,0,0.32)');
    ctx.fillStyle = dg; ctx.fill();
    // 3. Điện thờ (bóng đen) phía trước Sukuna
    const sx = cx, sy = cy + dir * 78;
    ctx.save();
    ctx.translate(sx, sy); if (dir > 0) ctx.scale(1, -1);
    ctx.globalAlpha = 0.75 * intro;
    ctx.fillStyle = '#120000'; ctx.strokeStyle = 'rgba(255,40,40,0.65)'; ctx.lineWidth = 1.5;
    const roof = (w, y, h) => {
        ctx.beginPath();
        ctx.moveTo(-w, y); ctx.quadraticCurveTo(-w * 0.55, y - h * 0.25, -w * 0.25, y - h); ctx.lineTo(w * 0.25, y - h);
        ctx.quadraticCurveTo(w * 0.55, y - h * 0.25, w, y); ctx.lineTo(w * 0.8, y + 3); ctx.lineTo(-w * 0.8, y + 3); ctx.closePath();
        ctx.fill(); ctx.stroke();
    };
    // cột
    ctx.fillRect(-40, -18, 7, 40); ctx.fillRect(33, -18, 7, 40); ctx.fillRect(-16, -14, 5, 36); ctx.fillRect(11, -14, 5, 36);
    roof(62, -16, 18); roof(46, -36, 15); roof(28, -52, 12);
    // miệng điện thờ (hàm răng)
    ctx.fillStyle = 'rgba(255,30,30,0.25)';
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(18, 18); ctx.lineTo(-18, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e7e5e4';
    for (let i = 0; i < 6; i++) { const x = -18 + i * 7.2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 3.6, 6); ctx.lineTo(x + 7.2, 0); ctx.fill(); }
    ctx.restore();
    // Cổng torii hai bên
    [-1, 1].forEach(sd => {
        const tx = Math.max(26, Math.min(canvas.width - 26, cx + sd * 140)), ty = cy + dir * 26;
        ctx.save(); ctx.translate(tx, ty); if (dir > 0) ctx.scale(1, -1);
        ctx.globalAlpha = 0.7 * intro;
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-14, -26, 4, 28); ctx.fillRect(10, -26, 4, 28);
        ctx.beginPath(); ctx.moveTo(-22, -30); ctx.quadraticCurveTo(0, -27, 22, -30); ctx.lineTo(20, -25); ctx.lineTo(-20, -25); ctx.closePath(); ctx.fill();
        ctx.fillRect(-16, -21, 32, 3);
        ctx.restore();
    });
    // 4. Vòng chú văn xoay
    F.glyphRing(cx, cy, 62, 10, t * 0.6, 11, '#ff4040', 0.85 * intro, 11);
    F.glyphRing(cx, cy, 112, 16, -t * 0.35, 12, '#e11d48', 0.6 * intro, 57);
    // 5. Viền ranh giới: răng cưa + vạch đứt xoay
    if (R > 10) {
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = 'rgba(255,40,40,0.85)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,60,60,0.7)';
        const n = 36;
        for (let i = 0; i <= n; i++) {
            const a = a0 + Math.PI * i / n;
            const ca = Math.cos(a), sa = Math.sin(a);
            ctx.beginPath();
            ctx.moveTo(cx + ca * R, cy + sa * R);
            ctx.lineTo(cx + Math.cos(a + 0.03) * (R - 9), cy + Math.sin(a + 0.03) * (R - 9));
            ctx.lineTo(cx + Math.cos(a + 0.06) * R, cy + Math.sin(a + 0.06) * R);
            ctx.fill();
        }
        ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 40;
        ctx.strokeStyle = 'rgba(255,120,120,0.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, R + 7, a0, a1); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    // 6. Mưa nhát chém liên tục trong lãnh địa (tất định theo chỉ số + chu kỳ)
    const N = F.low() ? 8 : 16;
    const enemy = p.id === 1 ? p2 : p1;
    ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
        const P = 0.45 + F.hash(i * 5) * 0.4;
        const u = t / P + F.hash(i);
        const ph = F.frac(u), cyc = Math.floor(u);
        let x, y;
        if (i % 4 === 0 && enemy) {         // 1/4 nhát chém dồn vào kẻ địch
            x = enemy.x + enemy.w / 2 + (F.hash(cyc * 3 + i) - 0.5) * 70;
            y = enemy.y + enemy.h / 2 + (F.hash(cyc * 5 + i) - 0.5) * 50;
        } else {
            const aa = a0 + F.hash(cyc * 7 + i * 13) * Math.PI;
            const rr = Math.sqrt(F.hash(cyc * 11 + i * 3)) * R;
            x = cx + Math.cos(aa) * rr; y = cy + Math.sin(aa) * rr;
        }
        const len = 26 + F.hash(cyc + i * 31) * 46;
        const ang = F.hash(cyc * 13 + i) * Math.PI;
        const head = Math.min(1, ph / 0.35);           // lưỡi lướt qua trong 35% đầu
        const fade = ph < 0.35 ? 1 : 1 - (ph - 0.35) / 0.65;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const x0 = x - ca * len / 2, y0 = y - sa * len / 2;
        const xh = x0 + ca * len * head, yh = y0 + sa * len * head;
        const bend = len * 0.18;
        ctx.globalAlpha = fade * intro;
        ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + xh) / 2 - sa * bend, (y0 + yh) / 2 + ca * bend, xh, yh); ctx.stroke();
        ctx.strokeStyle = '#ffe4e4'; ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

// Lớp phủ khi mở Lãnh địa Sukuna (trên xe): chớp, vòng nổ, tên chiêu
function drawMalevolentShrineIntro(p) {
    const tick = p.sukunaDomainTick || 0;
    if (tick > 90) return;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    ctx.save();
    if (tick < 14) {
        ctx.fillStyle = `rgba(255,${60 + tick * 6},${60 + tick * 6},${(1 - tick / 14) * 0.45})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (tick < 30) {
        const k = tick / 30;
        ctx.strokeStyle = `rgba(255,50,50,${1 - k})`; ctx.lineWidth = 8 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(cx, cy, 20 + k * 380, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(20,0,0,${(1 - k) * 0.8})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, 10 + k * 300, 0, Math.PI * 2); ctx.stroke();
    }
    drawDomainTitle('BÀNH TRƯỚNG LÃNH ĐỊA', 'PHỤC MA NGỰ TRÙ TỬ', tick, '#ff3b3b', '#2b0000');
    ctx.restore();
}

// Tên chiêu Lãnh địa ở giữa màn hình (mờ dần sau ~1.5s)
function drawDomainTitle(top, name, tick, color, shadow) {
    const a = Math.min(1, tick / 8) * Math.min(1, (90 - tick) / 25);
    if (a <= 0) return;
    const x = canvas.width / 2, y = canvas.height / 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, y - 26, canvas.width, 52);
    ctx.font = "bold 11px 'Orbitron', Arial";
    ctx.fillStyle = '#ffffff';
    drawWorldText(ctx, top, x, y - 11);
    ctx.font = "bold 19px 'Orbitron', Arial";
    ctx.shadowBlur = 12; ctx.shadowColor = color;
    ctx.fillStyle = color;
    drawWorldText(ctx, name, x, y + 9);
    ctx.restore();
}

// ==========================================
// 2. KẺ MẠNH NHẤT (THE STRONGEST / GOJO)
// ==========================================
registerTankArt('the_strongest', (p, k) => {
    const t = k.t;
    const ratio = Math.max(0, Math.min(1, (p.chuLuc || 0) / (p.maxChuLuc || 75)));
    // Vô Hạn: lớp màng cyan mờ khi còn Chú Lực
    if (ratio > 0) {
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.4 * ratio;
        ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]); ctx.lineDashOffset = -t * 8;
        ctx.beginPath(); ctx.arc(0, 0, 15.3, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    // Bánh xích mảnh
    TA.treads(-13.5, 3.2, -10, 12, t, '#1b1f33', '#56608f');
    // Thân trắng bạc thon gọn
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-10, 10, '#8b93a7', '#f8fafc');
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.quadraticCurveTo(9, -11, 10, -3); ctx.lineTo(10, 9); ctx.quadraticCurveTo(10, 13, 6, 13);
    ctx.lineTo(-6, 13); ctx.quadraticCurveTo(-10, 13, -10, 9); ctx.lineTo(-10, -3); ctx.quadraticCurveTo(-9, -11, 0, -13);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Sọc chàm giữa thân
    ctx.fillStyle = '#1e1b4b'; TA.rr(-2, 5, 4, 7.5, 1.5); ctx.fill();
    ctx.fillStyle = k.team; ctx.fillRect(-1, 9.5, 2, 2.5);
    // "Cổ tay" hai bên: vòng năng lượng Xanh (trái) & Đỏ (phải) quấn quanh
    [[-1, '#3b82f6', '#bfdbfe'], [1, '#ef4444', '#fecaca']].forEach(([sd, c, c2]) => {
        const px = sd * 12, py = 2;
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(px, py);
        TA.glow(c, 5);
        ctx.strokeStyle = c; ctx.lineWidth = 1.5;
        for (let i = 0; i < 2; i++) {
            ctx.beginPath(); ctx.ellipse(0, 0, 3.3, 1.4, sd * (t * 3 + i * Math.PI / 2), 0, Math.PI * 2); ctx.stroke();
        }
        TA.noGlow();
        ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    // Ống phát (không có nòng thường): vòng cyan ở mũi
    ctx.fillStyle = TA.metal(-2, 2, '#475569', '#e2e8f0'); TA.rr(-2, -15.5, 4, 8, 1.5); ctx.fill();
    ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, -14.5, 3.2, 1.2, 0, 0, Math.PI * 2); ctx.stroke();
    // Tháp: mái tóc trắng dựng gai + băng bịt mắt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.42;
        const r1 = 7.5 - Math.abs(i - 4) * 0.35, r0 = 4.6;
        ctx.lineTo(Math.cos(a - 0.2) * r0, -1 + Math.sin(a - 0.2) * r0);
        ctx.lineTo(Math.cos(a) * r1, -1 + Math.sin(a) * r1);
    }
    ctx.arc(0, -1, 5.2, 0.2, Math.PI - 0.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 0.8; ctx.stroke();
    // Băng mắt đen / Lục Nhãn (Evo 2) lộ mắt xanh
    ctx.fillStyle = '#0b1020'; TA.rr(-6.2, -1.6, 12.4, 3.4, 1.4); ctx.fill();
    if (k.evo2) {
        ctx.save(); TA.glow('#38bdf8', 7);
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.ellipse(-2.6, 0.1, 1.6, 1, 0, 0, Math.PI * 2); ctx.ellipse(2.6, 0.1, 1.6, 1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-2.6, 0.1, 0.5, 0, Math.PI * 2); ctx.arc(2.6, 0.1, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    // Evo 1 (Tử): lõi tím giữa hai vòng
    if (k.evo1) {
        const pg = ctx.createRadialGradient(0, 6, 0, 0, 6, 3);
        pg.addColorStop(0, '#f5d0fe'); pg.addColorStop(0.5, '#a855f7'); pg.addColorStop(1, 'rgba(88,28,135,0.2)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 6.2, 2.8, 0, Math.PI * 2); ctx.fill();
    }
    // Full Evo: hai quỹ đạo xanh/đỏ quay quanh thân
    if (k.full) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        [[0, '#60a5fa'], [Math.PI, '#f87171']].forEach(([o, c]) => {
            const a = t * 2.4 + o;
            ctx.fillStyle = c; TA.glow(c, 6);
            ctx.beginPath(); ctx.arc(Math.cos(a) * 14, Math.sin(a) * 14, 1.6, 0, Math.PI * 2); ctx.fill();
        });
        TA.noGlow(); ctx.restore();
    }
});

// Xanh (Thương): cầu hút, hạt xoáy vào tâm
function drawGojoBlue(b) {
    const F = CURSE_FX;
    const R = Math.min(b.w, b.h) / 2;
    const t = Date.now() / 1000;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    // Vệt bay
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    ctx.save(); ctx.rotate(ang);
    const tg = ctx.createLinearGradient(-R * 4, 0, 0, 0);
    tg.addColorStop(0, 'rgba(59,130,246,0)'); tg.addColorStop(1, 'rgba(96,165,250,0.45)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(-R * 4, 0); ctx.lineTo(0, -R * 0.8); ctx.lineTo(0, R * 0.8); ctx.closePath(); ctx.fill();
    ctx.restore();
    // Quầng hút
    const halo = ctx.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 2.4);
    halo.addColorStop(0, 'rgba(59,130,246,0.5)'); halo.addColorStop(1, 'rgba(30,58,138,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 2.4, 0, Math.PI * 2); ctx.fill();
    // Hạt xoáy vào tâm (xoắn ốc)
    const N = F.low() ? 8 : 14;
    ctx.fillStyle = '#bfdbfe';
    for (let i = 0; i < N; i++) {
        const ph = F.frac(t * 1.6 + i / N);
        const rr = R * 2.6 * (1 - ph) + R * 0.3;
        const a = F.hash(i) * Math.PI * 2 + ph * 4 + t * 2;
        ctx.globalAlpha = 0.25 + 0.75 * ph;
        ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1 + ph * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Cầu chính: tâm tối (lỗ hút) viền xanh rực
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, '#020617'); g.addColorStop(0.45, '#1d4ed8'); g.addColorStop(0.85, '#60a5fa'); g.addColorStop(1, '#dbeafe');
    ctx.shadowBlur = 14; ctx.shadowColor = '#3b82f6';
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Vòng méo không gian
    ctx.strokeStyle = 'rgba(191,219,254,0.7)'; ctx.lineWidth = 1.2;
    ctx.rotate(t * 3);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.45, R * 1.25, 0, 0, Math.PI * 1.3); ctx.stroke();
    ctx.rotate(Math.PI);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.3, R * 1.45, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
}

// Hư Thức: Tử - cầu tím lớn, xoáy đỏ/xanh, vòng méo không gian; lúc tụ lực: Xanh & Đỏ hợp nhất
function drawGojoPurple(b) {
    const F = CURSE_FX;
    const R = Math.min(b.w, b.h) / 2;
    const t = Date.now() / 1000;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    const charge = Math.max(0, b.chargeTimer || 0) / (b.maxCharge || 30);      // 1 -> 0 khi tụ lực xong
    const low = F.low();
    ctx.save();
    // Cột cảnh báo đường bay lúc đang tụ lực
    if (charge > 0) {
        const up = (b.vy || 0) < 0;
        const y0 = up ? 0 : cy, y1 = up ? cy : canvas.height;
        const blink = (Math.floor(Date.now() / 90) % 2) ? 0.5 : 1;
        ctx.globalAlpha = (0.10 + 0.2 * (1 - charge)) * blink;
        const cg = ctx.createLinearGradient(cx - R * 1.3, 0, cx + R * 1.3, 0);
        cg.addColorStop(0, 'rgba(168,85,247,0)'); cg.addColorStop(0.5, '#c084fc'); cg.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.fillStyle = cg; ctx.fillRect(cx - R * 1.3, y0, R * 2.6, y1 - y0);
        ctx.globalAlpha = 0.7 * blink;
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 60;
        ctx.beginPath(); ctx.moveTo(cx - R * 1.1, y0); ctx.lineTo(cx - R * 1.1, y1); ctx.moveTo(cx + R * 1.1, y0); ctx.lineTo(cx + R * 1.1, y1); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
    ctx.translate(cx, cy);
    // Vệt huỷ diệt phía sau khi bay nhanh (2 lớp + tàn lửa)
    if (sp > 3) {
        ctx.save(); ctx.rotate(ang);
        const L = Math.min(220, sp * 7);
        let tg = ctx.createLinearGradient(-L, 0, 0, 0);
        tg.addColorStop(0, 'rgba(76,29,149,0)'); tg.addColorStop(1, 'rgba(168,85,247,0.6)');
        ctx.fillStyle = tg; ctx.fillRect(-L, -R * 1.1, L, R * 2.2);
        tg = ctx.createLinearGradient(-L * 0.6, 0, 0, 0);
        tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(243,232,255,0.8)');
        ctx.fillStyle = tg; ctx.fillRect(-L * 0.6, -R * 0.35, L * 0.6, R * 0.7);
        ctx.fillStyle = '#e9d5ff';
        for (let i = 0; i < (low ? 6 : 14); i++) {
            const ph = F.frac(t * 2.2 + F.hash(i + 40));
            ctx.globalAlpha = 1 - ph;
            ctx.fillRect(-ph * L, (F.hash(i * 9) - 0.5) * R * 2.2, 2.5, 2.5);
        }
        ctx.restore();
    }
    // Quầng tím lớn + vòng méo không gian (thấu kính)
    const pulse = 1 + Math.sin(t * 7) * 0.05;
    const halo = ctx.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 2.8 * pulse);
    halo.addColorStop(0, 'rgba(192,132,252,0.6)'); halo.addColorStop(0.5, 'rgba(126,34,206,0.28)'); halo.addColorStop(1, 'rgba(46,16,101,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 2.8 * pulse, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) {
        const ph = F.frac(t * 0.9 + i / 3);
        ctx.globalAlpha = (1 - ph) * 0.7;
        ctx.strokeStyle = i % 2 ? '#f0abfc' : '#c4b5fd'; ctx.lineWidth = 2 * (1 - ph) + 0.5;
        ctx.beginPath(); ctx.ellipse(0, 0, R * (1.2 + ph * 1.8), R * (1.1 + ph * 1.6), t * 0.7 + i, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (charge > 0) {
        // Xanh (Thương) & Đỏ (Hách) xoáy quanh nhau rồi hợp nhất
        const d = R * 2.2 * charge;
        const spin = t * 6 + (1 - charge) * 5;
        [[0, '#3b82f6', '#dbeafe', 'rgba(59,130,246,'], [Math.PI, '#ef4444', '#fee2e2', 'rgba(239,68,68,']].forEach(([off, c, c2, ca]) => {
            const a0 = spin + off;
            const ox = Math.cos(a0) * d, oy = Math.sin(a0) * d * 0.6;
            // dải năng lượng nối vào tâm
            ctx.strokeStyle = ca + (0.7 * (1 - charge * 0.5)) + ')'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo(Math.cos(a0 + 1) * d * 0.5, Math.sin(a0 + 1) * d * 0.3, 0, 0); ctx.stroke();
            const rr = R * (0.45 + 0.25 * charge);
            const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr * 1.8);
            g.addColorStop(0, c2); g.addColorStop(0.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, rr * 1.8, 0, Math.PI * 2); ctx.fill();
            // hạt rơi theo quỹ đạo
            ctx.fillStyle = c2;
            for (let i = 0; i < (low ? 4 : 8); i++) {
                const aa = a0 - i * 0.22;
                ctx.globalAlpha = 1 - i / 8;
                ctx.fillRect(Math.cos(aa) * d - 1, Math.sin(aa) * d * 0.6 - 1, 2, 2);
            }
            ctx.globalAlpha = 1;
        });
        ctx.strokeStyle = `rgba(233,213,255,${1 - charge})`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, R * (2.2 - charge * 1.2), 0, Math.PI * 2); ctx.stroke();
    }
    const core = 1 - charge * 0.55;
    // Cầu chính tím - tâm trắng chói
    const g = ctx.createRadialGradient(-R * 0.15 * core, -R * 0.15 * core, 0, 0, 0, R * core);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.22, '#f5e9ff'); g.addColorStop(0.55, '#a855f7'); g.addColorStop(0.85, '#581c87'); g.addColorStop(1, '#1e0638');
    ctx.shadowBlur = 26; ctx.shadowColor = '#c084fc';
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * core, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Xoáy đỏ/xanh bên trong
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.rotate(t * 4);
    for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = i % 2 ? 'rgba(248,113,113,0.85)' : 'rgba(96,165,250,0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, R * core * (0.42 + 0.09 * i), i * Math.PI / 3, i * Math.PI / 3 + 1.4); ctx.stroke();
    }
    ctx.restore();
    // Vòng méo (thấu kính tối) + vòng sáng dao động + tia điện tím
    const wob = Math.sin(t * 9) * 0.07;
    ctx.strokeStyle = 'rgba(10,0,25,0.55)'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(0, 0, R * core * (1.2 + wob), R * core * (1.2 - wob), t, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(233,213,255,0.75)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(0, 0, R * (1.55 - wob), R * (1.55 + wob), -t * 0.8, 0, Math.PI * 2); ctx.stroke();
    if (!low) {
        ctx.strokeStyle = '#f5d0fe'; ctx.lineWidth = 1; ctx.shadowBlur = 8; ctx.shadowColor = '#e879f9';
        const fr = Math.floor(t * 14);
        for (let k = 0; k < 3; k++) {
            const a0 = F.hash(fr * 3 + k) * Math.PI * 2;
            ctx.beginPath();
            for (let s = 0; s <= 4; s++) {
                const rr = R * core * (1 + s * 0.22);
                const aa = a0 + (F.hash(fr * 11 + k * 5 + s) - 0.5) * 0.5;
                if (s === 0) ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
            }
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
    // Mảnh vụn bị hút vào
    ctx.fillStyle = '#e9d5ff';
    const N = low ? 8 : 16;
    for (let i = 0; i < N; i++) {
        const ph = F.frac(t * 1.3 + i / N);
        const rr = R * (2.6 - ph * 1.4);
        const a = F.hash(i + 9) * Math.PI * 2 - t;
        ctx.globalAlpha = ph;
        ctx.fillRect(Math.cos(a) * rr - 1, Math.sin(a) * rr - 1, 2, 2);
    }
    ctx.restore();
}

// Thông báo HUD "HƯ THỨC: TỬ" khi Gojo tung Tím (cả 2 người chơi đều thấy)
function drawGojoPurpleBanner(p) {
    const T = p.gojoPurpleBanner || 0;
    if (T <= 0) return;
    const e = 120 - T;
    const a = Math.min(1, e / 8) * Math.min(1, T / 20);
    const W = canvas.width, y = canvas.height / 2;
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha = a;
    // dải nền tím
    const bg = ctx.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, 'rgba(30,6,56,0)'); bg.addColorStop(0.5, 'rgba(46,16,101,0.85)'); bg.addColorStop(1, 'rgba(30,6,56,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, y - 34, W, 68);
    // viền cảnh báo nhấp nháy
    const blink = (Math.floor(Date.now() / 120) % 2) ? 1 : 0.45;
    ctx.fillStyle = `rgba(239,68,68,${0.8 * blink})`; ctx.fillRect(0, y - 34, W, 2);
    ctx.fillStyle = `rgba(59,130,246,${0.8 * blink})`; ctx.fillRect(0, y + 32, W, 2);
    // vạch chéo cảnh báo
    ctx.fillStyle = 'rgba(250,204,21,0.25)';
    const off = (t * 40) % 16;
    for (let x = -16 + off; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, y - 32); ctx.lineTo(x + 6, y - 32); ctx.lineTo(x + 2, y - 26); ctx.lineTo(x - 4, y - 26); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const sx = 0.8 + 0.2 * Math.min(1, e / 10);
    ctx.font = "bold 10px 'Orbitron', Arial"; ctx.fillStyle = `rgba(250,204,21,${blink})`;
    drawWorldText(ctx, '⚠ CẢNH BÁO — NÉ KHỎI CỘT TÍM ⚠', W / 2, y - 17);
    ctx.font = `bold ${Math.round(22 * sx)}px 'Orbitron', Arial`;
    ctx.shadowBlur = 18; ctx.shadowColor = '#c084fc'; ctx.fillStyle = '#f5e9ff';
    drawWorldText(ctx, 'HƯ THỨC: TỬ', W / 2, y + 6);
    ctx.shadowBlur = 0; ctx.font = "bold 9px 'Orbitron', Arial"; ctx.fillStyle = '#d8b4fe';
    drawWorldText(ctx, 'HOLLOW PURPLE', W / 2, y + 23);
    ctx.restore();
}

// Đỏ (Hách): tia đẩy - lõi trắng, sóng đỏ, chevron đẩy ra, nổ ở họng
function drawGojoRedBeam(bm) {
    const F = CURSE_FX;
    const life = bm.lifeTime;
    const maxLife = bm.isEvo ? 120 : 10;
    const a = bm.isEvo ? Math.min(1, life / 12) : Math.max(0, life / maxLife);
    const t = Date.now() / 1000;
    const cx = bm.x + bm.w / 2;
    const up = bm.ownerId === 1;
    const y0 = up ? bm.y + bm.h : bm.y;       // họng súng
    const y1 = up ? bm.y : bm.y + bm.h;
    const w = bm.w;
    ctx.save();
    ctx.globalAlpha = a;
    // Vầng ngoài
    const wg = ctx.createLinearGradient(cx - w * 1.6, 0, cx + w * 1.6, 0);
    wg.addColorStop(0, 'rgba(255,0,0,0)'); wg.addColorStop(0.35, 'rgba(255,40,40,0.45)');
    wg.addColorStop(0.5, 'rgba(255,120,120,0.75)'); wg.addColorStop(0.65, 'rgba(255,40,40,0.45)'); wg.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = wg;
    const wobble = Math.sin(t * 40) * 1.5;
    ctx.fillRect(cx - w * 1.6 + wobble, bm.y, w * 3.2, bm.h);
    // Lõi
    ctx.shadowBlur = 18; ctx.shadowColor = '#ff2020';
    ctx.fillStyle = '#ff5c5c'; ctx.fillRect(cx - w * 0.5, bm.y, w, bm.h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - w * 0.22, bm.y, w * 0.44, bm.h);
    ctx.shadowBlur = 0;
    // Chevron sóng đẩy (chạy về phía địch)
    const dir = up ? -1 : 1;
    ctx.strokeStyle = 'rgba(255,230,230,0.8)'; ctx.lineWidth = 2;
    const step = 46, off = (t * 600) % step;
    const len = Math.abs(y1 - y0);
    for (let d = off; d < len; d += step) {
        const yy = y0 + dir * d;
        ctx.beginPath();
        ctx.moveTo(cx - w * 1.1, yy - dir * w * 0.6); ctx.lineTo(cx, yy); ctx.lineTo(cx + w * 1.1, yy - dir * w * 0.6);
        ctx.stroke();
    }
    // Nổ ở họng
    const R = w * 1.4 + 6;
    const mg = ctx.createRadialGradient(cx, y0, 0, cx, y0, R);
    mg.addColorStop(0, '#ffffff'); mg.addColorStop(0.35, '#ff6b6b'); mg.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, y0, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd5d5'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
        const aa = i * Math.PI / 4 + t * 3;
        const r0 = R * 0.6, r1 = R * (1.1 + 0.25 * F.hash(i + Math.floor(t * 20)));
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(aa) * r0, y0 + Math.sin(aa) * r0); ctx.lineTo(cx + Math.cos(aa) * r1, y0 + Math.sin(aa) * r1); ctx.stroke();
    }
    ctx.restore();
}

// Tia Đỏ dùng chung class Beam -> chỉ đổi hình khi được đánh dấu isGojoRed
(() => {
    const orig = Beam.prototype.draw;
    Beam.prototype.draw = function () {
        if (this.isGojoRed && this.active) { try { drawGojoRedBeam(this); return; } catch (e) { /* rơi về hình cũ */ } }
        return orig.call(this);
    };
    // Cảnh báo tia Đỏ: thêm cầu đỏ tụ ở họng (giữ nguyên cột cảnh báo & đồng hồ)
    const origW = HitscanWarning.prototype.draw;
    HitscanWarning.prototype.draw = function () {
        origW.call(this);
        if (!this.isGojoRed || !this.active || !(this.delay > 0)) return;
        const k = 1 - this.delay / this.maxDelay;
        const t = Date.now() / 1000;
        const x = this.x, y = this.fromY + this.dirY * 6;
        const R = 5 + k * 9;
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, R * 1.8);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#ff4d4d'); g.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd0d0';
        for (let i = 0; i < 8; i++) {
            const ph = CURSE_FX.frac(t * 2.2 + i / 8);
            const rr = R * 3.2 * (1 - ph) + R;
            const a = i * Math.PI / 4 + t;
            ctx.globalAlpha = ph;
            ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };
})();

// Vòng gồng Gojo (mốc 1s = Đỏ, 5s = Lãnh địa)
CharHooks.register('the_strongest', Object.assign(CharHooks.registry['the_strongest'] || {}, {
    draw() {
        const dt = this.gojoDomainTimer || 0;
        if (dt > GOJO_DOMAIN_FREE) {
            // Đang niệm Lãnh Địa: vòng đếm ngược 4s (đứng yên), xong mới được di chuyển
            const k = (dt - GOJO_DOMAIN_FREE) / (GOJO_DOMAIN_TICKS - GOJO_DOMAIN_FREE);
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2, R = this.w * 1.05;
            ctx.save();
            ctx.lineCap = 'round'; ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(2,6,23,0.6)';
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#e0f2fe'; ctx.shadowBlur = 10; ctx.shadowColor = '#60a5fa';
            ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            ctx.font = "bold 9px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = '#e0f2fe';
            drawWorldText(ctx, 'NIỆM ' + Math.ceil((dt - GOJO_DOMAIN_FREE) / 60) + 's', cx, this.id === 1 ? this.y + this.h + 14 : this.y - 8);
            ctx.restore();
        }
        const ch = this.gojoChargeTimer || 0;
        if (ch <= 0) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const hasPurple = this.hasUpgrade('evo_strongest_1');
        const goal = (hasPurple && ch >= 60) ? 300 : 60;
        const kk = Math.min(1, ch / goal);
        const R = this.w * 0.9;
        const col = ch >= 300 && hasPurple ? '#e0f2fe' : (ch >= 60 ? '#ff3b3b' : '#60a5fa');
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = col; ctx.shadowBlur = 8; ctx.shadowColor = col;
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kk); ctx.stroke();
        if (hasPurple && ch >= 60) {
            // Đang niệm Lãnh địa: các vì sao tụ về
            const t = Date.now() / 1000;
            ctx.shadowBlur = 0; ctx.fillStyle = '#e0f2fe';
            for (let i = 0; i < 10; i++) {
                const ph = CURSE_FX.frac(t * 0.9 + i / 10);
                const rr = R * (2.8 - ph * 1.8);
                const a = CURSE_FX.hash(i * 3) * Math.PI * 2 + t * 0.6;
                ctx.globalAlpha = ph * kk;
                ctx.fillRect(cx + Math.cos(a) * rr - 1, cy + Math.sin(a) * rr - 1, 2, 2);
            }
        }
        ctx.restore();
    },
}));

// --- BÀNH TRƯỚNG LÃNH ĐỊA: VÔ LƯỢNG KHÔNG XỨ (Infinite Void) ---
const VOID_STARS = (() => {
    const s = [];
    for (let i = 0; i < 90; i++) {
        const r = Math.sqrt(CURSE_FX.hash(i * 3 + 1)) * 420;
        const a = CURSE_FX.hash(i * 7 + 2) * Math.PI * 2;
        s.push([r, a, 0.6 + CURSE_FX.hash(i * 11) * 1.6, CURSE_FX.hash(i * 13) * 6.28]);
    }
    return s;
})();
// GOJO_DOMAIN_TICKS (300) khai báo ở js/characters/the_strongest/logic.js
function drawInfiniteVoid(p) {
    const F = CURSE_FX;
    const timer = p.gojoDomainTimer || 0;
    const e = GOJO_DOMAIN_TICKS - timer;
    const t = Date.now() / 1000;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const RB = 350 * F.easeOut(e / 18);
    const a = Math.min(1, e / 6) * Math.min(1, timer / 20);
    if (a <= 0 || RB < 2) return;
    ctx.save();
    ctx.globalAlpha = a;
    // Không gian ngoài lãnh địa tối nhẹ
    ctx.fillStyle = 'rgba(2,6,23,0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Quả cầu vô tận
    ctx.beginPath(); ctx.arc(cx, cy, RB, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, RB);
    g.addColorStop(0, 'rgba(240,249,255,0.75)'); g.addColorStop(0.07, 'rgba(147,197,253,0.55)');
    g.addColorStop(0.3, 'rgba(30,41,120,0.78)'); g.addColorStop(0.8, 'rgba(6,8,40,0.9)'); g.addColorStop(1, 'rgba(15,23,80,0.92)');
    ctx.fillStyle = g; ctx.fill();
    ctx.save();
    ctx.clip();
    // Sao lấp lánh (xoay chậm như thiên hà)
    const rot = t * 0.05;
    const nStar = F.low() ? 45 : VOID_STARS.length;
    for (let i = 0; i < nStar; i++) {
        const st = VOID_STARS[i];
        const x = cx + Math.cos(st[1] + rot) * st[0], y = cy + Math.sin(st[1] + rot) * st[0];
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.5 + st[3]));
        ctx.globalAlpha = a * tw;
        ctx.fillStyle = i % 5 === 0 ? '#bfdbfe' : '#ffffff';
        ctx.fillRect(x - st[2] / 2, y - st[2] / 2, st[2], st[2]);
        if (st[2] > 1.9) { ctx.fillRect(x - 3, y - 0.4, 6, 0.8); ctx.fillRect(x - 0.4, y - 3, 0.8, 6); }
    }
    // Hai nhánh xoắn thiên hà
    for (let arm = 0; arm < 2; arm++) {
        for (let j = 0; j < 36; j += (F.low() ? 2 : 1)) {
            const rr = 10 + j * 7.5;
            const an = j * 0.26 + arm * Math.PI + t * 0.35;
            ctx.globalAlpha = a * (1 - j / 36) * 0.95;
            ctx.fillStyle = arm ? '#c7d2fe' : '#a5f3fc';
            ctx.beginPath(); ctx.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.55, 1.6 + (1 - j / 36) * 1.4, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
    // Ranh giới lãnh địa
    ctx.globalAlpha = a;
    ctx.shadowBlur = 16; ctx.shadowColor = '#60a5fa';
    ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, RB, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(147,197,253,0.5)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = t * 30;
    ctx.beginPath(); ctx.arc(cx, cy, RB + 8, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// Lớp phủ Vô Lượng Không Xứ: chớp mở, vòng nở, luồng thông tin dội vào kẻ địch, tên chiêu
function drawInfiniteVoidOverlay(p) {
    const F = CURSE_FX;
    const timer = p.gojoDomainTimer || 0;
    const e = GOJO_DOMAIN_TICKS - timer;
    const t = Date.now() / 1000;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    ctx.save();
    if (e < 12) {
        ctx.fillStyle = `rgba(235,245,255,${(1 - e / 12) * 0.6})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (e < 26) {
        const k = e / 26;
        ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 9 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(cx, cy, 10 + k * 420, 0, Math.PI * 2); ctx.stroke();
    }
    // Luồng thông tin vô tận dội vào địch bị giam
    const enemy = p.id === 1 ? p2 : p1;
    const fade = Math.min(1, timer / 20) * Math.min(1, e / 10);
    if (enemy && enemy.hp > 0 && fade > 0) {
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        const N = F.low() ? 12 : 22;
        ctx.lineCap = 'round';
        for (let i = 0; i < N; i++) {
            const ph = F.frac(t * (1.4 + F.hash(i) * 1.2) + F.hash(i + 50));
            const a = F.hash(i * 7) * Math.PI * 2 + Math.floor(t * 3 + F.hash(i)) * 0.9;
            const r0 = 24 + (1 - ph) * 80, r1 = r0 + 14 + F.hash(i * 3) * 20;
            ctx.globalAlpha = fade * ph * 0.9;
            ctx.strokeStyle = i % 3 === 0 ? '#a5f3fc' : '#ffffff';
            ctx.lineWidth = 1 + F.hash(i * 5) * 1.5;
            ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * r1, ey + Math.sin(a) * r1); ctx.lineTo(ex + Math.cos(a) * r0, ey + Math.sin(a) * r0); ctx.stroke();
        }
        // Mảnh dữ liệu nhấp nháy quanh mục tiêu
        const fr = Math.floor(t * 18);
        for (let i = 0; i < 10; i++) {
            const h1 = F.hash(fr * 13 + i), h2 = F.hash(fr * 7 + i * 3);
            ctx.globalAlpha = fade * (0.4 + 0.6 * h2);
            ctx.fillStyle = h1 > 0.5 ? '#e0f2fe' : '#93c5fd';
            const a = h1 * Math.PI * 2, r = enemy.w * 0.7 + h2 * 26;
            ctx.fillRect(ex + Math.cos(a) * r - 4, ey + Math.sin(a) * r - 1, 3 + h2 * 9, 2);
        }
        // Khung giam
        ctx.globalAlpha = fade;
        ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10; ctx.shadowColor = '#60a5fa';
        ctx.beginPath(); ctx.arc(ex, ey, enemy.w * 0.95 + Math.sin(t * 8) * 2, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    drawDomainTitle('BÀNH TRƯỚNG LÃNH ĐỊA', 'VÔ LƯỢNG KHÔNG XỨ', e, '#93c5fd', '#020617');
    ctx.restore();
}

// ==========================================
// 3. ÂM DƯƠNG SƯ
// ==========================================
registerTankArt('am_duong_su', (p, k) => {
    const t = k.t;
    const am = !!p.isAmChu;
    TA.treads(-14.5, 3.8, -11, 12.5, t, '#18181b', '#a16207');
    // Thân tròn: nửa đen / nửa vàng (đường cong âm dương)
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.beginPath(); ctx.arc(0, 1, 11.5, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15'; ctx.fill();
    TA.noGlow();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 1, 11.5, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(0, -10.5); ctx.arc(0, 1, 11.5, -Math.PI / 2, Math.PI / 2, true);
    ctx.arc(0, 6.75, 5.75, Math.PI / 2, -Math.PI / 2, true);
    ctx.arc(0, -4.75, 5.75, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    // ánh kim
    const sh = ctx.createLinearGradient(-11, -10, 11, 12);
    sh.addColorStop(0, 'rgba(255,255,255,0.25)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = sh; ctx.fillRect(-12, -11, 24, 24);
    ctx.restore();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 1, 11.5, 0, Math.PI * 2); ctx.stroke();
    // Bùa giấy treo 4 góc (Evo 1: bùa dài hơn, ấn đỏ)
    const L = k.evo1 ? 6 : 4.5;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => {
        ctx.save();
        ctx.translate(sx * 10.5, sy * 9 + 1);
        ctx.rotate(sx * sy * 0.6 + Math.sin(t * 3 + i) * 0.12);
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(-1.6, -L / 2, 3.2, L);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(-0.8, -L / 2 + 0.8, 1.6, L * 0.55);
        ctx.restore();
    });
    // Nòng bút lông
    ctx.fillStyle = TA.metal(-1.8, 1.8, '#1f2937', '#9ca3af'); TA.rr(-1.8, -15.5, 3.6, 7, 1.2); ctx.fill();
    ctx.fillStyle = am ? '#a5b4fc' : '#fde047';
    ctx.beginPath(); ctx.moveTo(-2.2, -15.5); ctx.lineTo(0, -16); ctx.lineTo(2.2, -15.5); ctx.lineTo(1.4, -13.5); ctx.lineTo(-1.4, -13.5); ctx.closePath(); ctx.fill();
    // Tháp: Thái Cực nhỏ xoay, bên đang dùng phát sáng
    ctx.save();
    ctx.translate(0, 1);
    ctx.fillStyle = '#0b0f19'; ctx.beginPath(); ctx.arc(0, 0, 5.6, 0, Math.PI * 2); ctx.fill();
    TA.glow(am ? '#818cf8' : '#fde047', 8);
    ctx.strokeStyle = am ? '#a5b4fc' : '#fde047'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 0, 5.6, 0, Math.PI * 2); ctx.stroke();
    TA.noGlow();
    ctx.rotate(t * (am ? -1.5 : 1.5));
    const R = 4.2;
    ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); ctx.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); ctx.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false); ctx.fill();
    ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.arc(0, R / 2, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, -R / 2, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Evo 2: pháp trận bát quái quay dưới thân
    if (k.evo2) {
        ctx.save(); ctx.translate(0, 1); ctx.rotate(-t * 0.8);
        ctx.strokeStyle = 'rgba(167,139,250,0.85)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath(); ctx.moveTo(-1.8, -14.2); ctx.lineTo(1.8, -14.2); ctx.stroke();
        }
        ctx.restore();
    }
    if (k.full) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const a = t * 2;
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(Math.cos(a) * 14.5, 1 + Math.sin(a) * 14.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#818cf8'; ctx.beginPath(); ctx.arc(-Math.cos(a) * 14.5, 1 - Math.sin(a) * 14.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
});

// Không phủ màu chế độ Âm/Dương lên xe nữa (đã thể hiện trên tháp Thái Cực) & bỏ chấm cũ trên đầu
(() => {
    const orig = Player.prototype.drawAmDuongSu;
    Player.prototype.drawAmDuongSu = function (drawColor) {
        if (this.weapon === 'am_duong_su') return drawColor;
        return orig ? orig.call(this, drawColor) : drawColor;
    };
})();

// Đạn bùa Âm / Dương: bùa thái cực xoay có quầng & vệt
registerBulletArt('am_duong_su', (b, color, owner, k) => {
    if (!(b.isAmChu || b.isDuongChu)) return false;
    const am = !!b.isAmChu;
    const R = Math.max(5, k.r * 1.3);
    const c1 = am ? '#111827' : '#facc15', c2 = am ? '#a5b4fc' : '#92400e', glow = am ? '#818cf8' : '#fde047';
    // vệt
    const tg = ctx.createLinearGradient(-R * 4, 0, 0, 0);
    tg.addColorStop(0, 'rgba(0,0,0,0)'); tg.addColorStop(1, am ? 'rgba(129,140,248,0.5)' : 'rgba(253,224,71,0.55)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(-R * 4, 0); ctx.lineTo(0, -R * 0.8); ctx.lineTo(0, R * 0.8); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 10; ctx.shadowColor = glow;
    ctx.rotate(k.t / 140);
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); ctx.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); ctx.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false); ctx.fill();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(0, -R / 2, R * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, R / 2, R * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = glow; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    // vòng bát quái
    ctx.strokeStyle = am ? 'rgba(165,180,252,0.6)' : 'rgba(254,240,138,0.7)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.2) * (R + 2.5), Math.sin(a - 0.2) * (R + 2.5)); ctx.lineTo(Math.cos(a + 0.2) * (R + 2.5), Math.sin(a + 0.2) * (R + 2.5)); ctx.stroke(); }
});

// Bùa dán (Talisman): giấy bùa phát sáng, chữ phù, lắc lư
Talisman.prototype.draw = function () {
    if (!this.active) return;
    const am = this.type === 'am';
    const t = Date.now() / 1000;
    const life = this.lifeTime || 0;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(t * 4 + this.x) * 0.12);
    if (life < 20 && (life >> 1) % 2) ctx.globalAlpha = 0.5;   // sắp tan
    ctx.shadowBlur = 10; ctx.shadowColor = am ? '#818cf8' : '#fde047';
    ctx.fillStyle = am ? '#1e1b4b' : '#fef3c7';
    TA.rr(-this.w / 2, -this.h / 2, this.w, this.h, 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = am ? '#a5b4fc' : '#b45309'; ctx.lineWidth = 1.2;
    TA.rr(-this.w / 2 + 1.5, -this.h / 2 + 1.5, this.w - 3, this.h - 3, 1.5); ctx.stroke();
    // Phù văn đỏ
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -8); ctx.lineTo(4, -8);
    ctx.moveTo(0, -10); ctx.lineTo(0, 6);
    ctx.moveTo(-4, -3); ctx.lineTo(4, -1);
    ctx.moveTo(-4, 2); ctx.quadraticCurveTo(0, 6, 4, 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(0, 8.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

// Pháp Trận (SpellZone): vòng trận đồ 2 lớp xoay ngược, bát quái, chữ phù (giữ đúng khung vùng)
SpellZone.prototype.draw = function () {
    if (!this.active) return;
    const t = Date.now() / 1000;
    const hw = this.r * ZONE_AX, hh = this.r * ZONE_AY;
    const fade = Math.min(1, (this.lifeTime || 0) / 20);
    ctx.save();
    ctx.globalAlpha = fade;
    zoneRectPath(this.x, this.y, this.r);
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(hw, hh));
    g.addColorStop(0, this.isFullEvo ? 'rgba(250,204,21,0.22)' : 'rgba(167,139,250,0.22)'); g.addColorStop(1, 'rgba(76,29,149,0.28)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.8; ctx.stroke();
    // Trận đồ elip (vừa khung vùng)
    ctx.translate(this.x, this.y);
    ctx.scale(hw / this.r, hh / this.r);
    const R = this.r * 0.88;
    ctx.save(); ctx.rotate(t * 0.8);
    ctx.strokeStyle = 'rgba(196,181,253,0.85)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = this.isFullEvo ? '#fde047' : '#e9d5ff';
    CURSE_FX.glyphRing(0, 0, R * 0.9, 12, 0, Math.max(4, R * 0.12), ctx.strokeStyle, 0.9, 77);
    ctx.restore();
    ctx.save(); ctx.rotate(-t * 1.2);
    ctx.strokeStyle = 'rgba(167,139,250,0.9)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6); }
    ctx.stroke();
    // Sao 5 cánh
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; ctx.lineTo(Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55); }
    ctx.stroke();
    ctx.restore();
    // Thái cực ở tâm
    const r0 = Math.max(4, R * 0.18);
    ctx.rotate(t * 2);
    ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.arc(0, 0, r0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(0, 0, r0, -Math.PI / 2, Math.PI / 2); ctx.arc(0, r0 / 2, r0 / 2, Math.PI / 2, -Math.PI / 2, true); ctx.arc(0, -r0 / 2, r0 / 2, Math.PI / 2, -Math.PI / 2, false); ctx.fill();
    ctx.restore();
};

// ==========================================
// 4. CHIÊU HỒN SƯ (NECROMANCER)
// ==========================================
registerTankArt('necromancer', (p, k) => {
    const t = k.t;
    TA.treads(-15, 4, -11, 13.5, t, '#120a1a', '#3b2a4a');
    // Thân áo choàng tím đen (hình chuông mở rộng về sau)
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-12, 12, '#1a0f24', '#4c2a6b');
    ctx.beginPath();
    ctx.moveTo(0, -12.5); ctx.quadraticCurveTo(7, -12, 8.5, -5); ctx.lineTo(12, 11); ctx.quadraticCurveTo(12, 14, 8, 14);
    ctx.lineTo(-8, 14); ctx.quadraticCurveTo(-12, 14, -12, 11); ctx.lineTo(-8.5, -5); ctx.quadraticCurveTo(-7, -12, 0, -12.5);
    ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Đường viền áo choàng (gân)
    ctx.strokeStyle = 'rgba(167,139,250,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-5, 13.5); ctx.lineTo(-4, 2); ctx.moveTo(5, 13.5); ctx.lineTo(4, 2); ctx.stroke();
    // Chuông hồn phía sau
    const sw = Math.sin(t * 3) * 0.25;
    ctx.save(); ctx.translate(0, 9.5); ctx.rotate(sw);
    ctx.fillStyle = '#a16207';
    ctx.beginPath(); ctx.moveTo(-2.6, 2.6); ctx.quadraticCurveTo(-2.6, -2.6, 0, -2.8); ctx.quadraticCurveTo(2.6, -2.6, 2.6, 2.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#facc15'; ctx.fillRect(-3, 2.2, 6, 1.2);
    ctx.restore();
    // Trượng xương (nòng) + lửa hồn
    ctx.fillStyle = '#e7e5e4'; TA.rr(-1.3, -15, 2.6, 9, 1.2); ctx.fill();
    ctx.fillStyle = '#d6d3d1'; ctx.beginPath(); ctx.arc(-1.2, -14.5, 1.3, 0, Math.PI * 2); ctx.arc(1.2, -14.5, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.save(); TA.glow('#34d399', 8);
    ctx.fillStyle = 'rgba(52,211,153,0.9)';
    const fl = Math.sin(t * 12) * 0.6;
    ctx.beginPath(); ctx.moveTo(-1.6, -14.8); ctx.quadraticCurveTo(0 + fl, -18.5, 1.6, -14.8); ctx.closePath(); ctx.fill();
    ctx.restore();
    // Tháp: sọ trắng
    ctx.fillStyle = '#f5f5f4';
    ctx.beginPath(); ctx.arc(0, -1, 5.6, Math.PI, 0); ctx.lineTo(4.4, 2.6); ctx.lineTo(2.6, 4.6); ctx.lineTo(-2.6, 4.6); ctx.lineTo(-4.4, 2.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.ellipse(-2.2, -0.6, 1.5, 1.8, 0, 0, Math.PI * 2); ctx.ellipse(2.2, -0.6, 1.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); TA.glow('#34d399', 6); ctx.fillStyle = '#6ee7b7';
    ctx.beginPath(); ctx.arc(-2.2, -0.4, 0.7, 0, Math.PI * 2); ctx.arc(2.2, -0.4, 0.7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.moveTo(0, 1.4); ctx.lineTo(-0.8, 2.8); ctx.lineTo(0.8, 2.8); ctx.closePath(); ctx.fill();
    ctx.fillRect(-2, 3.6, 0.8, 1); ctx.fillRect(-0.4, 3.6, 0.8, 1); ctx.fillRect(1.2, 3.6, 0.8, 1);
    // Linh hồn (Linh Giáp) bay quanh thân: số hồn = Linh Hồn hiện có, hồn bị khoá = mờ tím
    const cur = Math.max(0, Math.min(12, p.currentSouls || 0));
    const locked = Math.max(0, Math.min(12 - cur, p.lockedSouls || 0));
    const total = cur + locked;
    for (let i = 0; i < total; i++) {
        const a = t * 1.6 + i * Math.PI * 2 / Math.max(1, total);
        const r = 13.2 + Math.sin(t * 3 + i) * 0.8;
        const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.92 + 0.5;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(a + Math.PI);   // đuôi kéo ngược chiều bay
        ctx.globalAlpha = i < cur ? 0.9 : 0.35;
        ctx.fillStyle = i < cur ? '#ecfdf5' : '#7c3aed';
        if (i < cur) TA.glow('#34d399', 4);
        ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-1.2, -1); ctx.quadraticCurveTo(0.5, 3.5, 0, 4.5); ctx.quadraticCurveTo(-0.6, 3, 1.2, -1); ctx.fill();
        TA.noGlow();
        ctx.restore();
    }
    if (k.evo2) {
        // vương miện xương
        ctx.fillStyle = '#d6d3d1';
        [-3, 0, 3].forEach((x, i) => { ctx.beginPath(); ctx.moveTo(x - 1.1, -6.2); ctx.lineTo(x, -8.4 - (i === 1 ? 1 : 0)); ctx.lineTo(x + 1.1, -6.2); ctx.closePath(); ctx.fill(); });
    }
    if (k.evo1) {
        ctx.strokeStyle = 'rgba(52,211,153,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0.5, 9.5, t, t + 1.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0.5, 9.5, t + Math.PI, t + Math.PI + 1.5); ctx.stroke();
    }
});

// Đạn hồn: cầu hồn tím nhạt có đuôi lửa ma; đạn của Xạ Thủ: hồn xanh lục nhỏ
registerBulletArt('necromancer', (b, color, owner, k) => {
    if (!(b.isNecroSoul || b.isNecroMinionBullet)) return false;
    const minion = !!b.isNecroMinionBullet;
    const R = minion ? 3.2 : Math.max(4, Math.min(b.w, b.h) / 2);
    const c = minion ? '#34d399' : '#c4b5fd', c2 = minion ? '#d1fae5' : '#f5f3ff';
    const L = R * 5;
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.quadraticCurveTo(-L * 0.5, -R * 1.2 + Math.sin(k.t / 60) * 2, -L, Math.sin(k.t / 80) * R * 0.6);
    ctx.quadraticCurveTo(-L * 0.5, R * 1.2 + Math.sin(k.t / 70) * 2, 0, R);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 12; ctx.shadowColor = c;
    const g = ctx.createRadialGradient(R * 0.2, 0, 0, 0, 0, R);
    g.addColorStop(0, c2); g.addColorStop(0.6, c); g.addColorStop(1, minion ? '#047857' : '#6d28d9');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (!minion) { // mặt hồn nhỏ
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath(); ctx.arc(R * 0.25, -R * 0.35, R * 0.18, 0, Math.PI * 2); ctx.arc(R * 0.25, R * 0.35, R * 0.18, 0, Math.PI * 2); ctx.fill();
    }
});

// Vong linh: Cảm Tử (sọ lửa cam), Xạ Thủ (bộ xương cung xanh), Cao Cấp (hiệp sĩ xương tím) - thanh máu giữ nguyên
NecroMinion.prototype.draw = function () {
    if (!this.active) return;
    const t = Date.now() / 1000;
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    const s = this.w / 24;
    const dirY = (this.owner && this.owner.id === 2) ? 1 : -1;
    const type = this.type;
    const col = type === 'kamikaze' ? '#ff7043' : (type === 'shooter' ? '#34d399' : '#a78bfa');
    const team = (this.owner && this.owner.id === 2) ? '#e74c3c' : '#3498db';
    ctx.save();
    ctx.translate(cx, cy + Math.sin(t * 4 + this.x * 0.1) * 1.2);
    ctx.scale(s, s * -dirY);   // phía trước (-y) hướng về địch
    // Hào quang
    const ag = ctx.createRadialGradient(0, 0, 3, 0, 0, 15);
    ag.addColorStop(0, type === 'kamikaze' ? 'rgba(255,112,67,0.45)' : (type === 'shooter' ? 'rgba(52,211,153,0.35)' : 'rgba(167,139,250,0.45)'));
    ag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
    // Đuôi ma
    ctx.fillStyle = type === 'kamikaze' ? 'rgba(255,87,34,0.55)' : (type === 'shooter' ? 'rgba(16,185,129,0.45)' : 'rgba(124,58,237,0.5)');
    ctx.beginPath();
    ctx.moveTo(-8, 1);
    for (let i = 0; i <= 4; i++) { const x = -8 + i * 4; ctx.lineTo(x, 10 + Math.sin(t * 8 + i) * 1.5 + (i % 2 ? 2 : 0)); }
    ctx.lineTo(8, 1); ctx.closePath(); ctx.fill();
    if (type === 'kamikaze') {
        // Lửa trên đầu sọ
        ctx.fillStyle = '#ffab40';
        ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-4, -13 + Math.sin(t * 14) * 1.5, 0, -11); ctx.quadraticCurveTo(4, -14 + Math.cos(t * 13), 6, -4); ctx.closePath(); ctx.fill();
    }
    // Sọ
    ctx.fillStyle = '#f5f5f4'; ctx.strokeStyle = col; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -1, 7.5, Math.PI, 0); ctx.lineTo(6, 4); ctx.lineTo(3.5, 6.5); ctx.lineTo(-3.5, 6.5); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.ellipse(-2.8, -0.5, 2, 2.4, 0, 0, Math.PI * 2); ctx.ellipse(2.8, -0.5, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 6; ctx.shadowColor = col; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(-2.8, -0.3, 0.9, 0, Math.PI * 2); ctx.arc(2.8, -0.3, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1c1917'; ctx.fillRect(-2.6, 4.4, 1.2, 1.4); ctx.fillRect(-0.6, 4.4, 1.2, 1.4); ctx.fillRect(1.4, 4.4, 1.2, 1.4);
    if (type === 'shooter') {
        // Cung xương phía trước
        ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(0, -3, 10, -Math.PI * 0.82, -Math.PI * 0.18); ctx.stroke();
        ctx.strokeStyle = 'rgba(52,211,153,0.8)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(Math.cos(-Math.PI * 0.82) * 10, -3 + Math.sin(-Math.PI * 0.82) * 10); ctx.lineTo(Math.cos(-Math.PI * 0.18) * 10, -3 + Math.sin(-Math.PI * 0.18) * 10); ctx.stroke();
    } else if (type === 'elite') {
        // Mũ trụ & sừng
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath(); ctx.arc(0, -2, 8, Math.PI, 0); ctx.lineTo(8, -1); ctx.lineTo(-8, -1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e7e5e4';
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 6, -5); ctx.quadraticCurveTo(sd * 12, -8, sd * 10, -13); ctx.quadraticCurveTo(sd * 9, -8, sd * 4, -7); ctx.closePath(); ctx.fill(); });
        ctx.fillStyle = '#c4b5fd'; ctx.fillRect(-0.8, -9, 1.6, 7);
        if (this.dashState === 'dash') {
            ctx.strokeStyle = 'rgba(196,181,253,0.7)'; ctx.lineWidth = 1.5;
            for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 5, 10); ctx.lineTo(i * 5, 18); ctx.stroke(); }
        }
    }
    // Vạch màu đội dưới cằm
    ctx.fillStyle = team; ctx.fillRect(-4, 7.6, 8, 1.6);
    ctx.restore();
    // Khiên xương (Cao Cấp - Evo 2)
    if (this.shieldHits > 0) {
        ctx.save();
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.arc(cx, cy, this.w / 2 + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#34d399'; ctx.font = "bold 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
        drawWorldText(ctx, 'x' + this.shieldHits, cx + this.w / 2 + 7, cy - this.h / 2);
        ctx.restore();
    }
    // Thanh máu nhỏ
    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(this.x, this.y - 6, this.w, 3);
    ctx.fillStyle = col;
    ctx.fillRect(this.x, this.y - 6, this.w * hpRatio, 3);
};

// ==========================================
// 5. TRỐI CHẾT (DEATH LOCK)
// ==========================================
function curseChainLink(x, y, ang, len, w, col, hi) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.ellipse(0, 0, len / 2, len / 4, 0, 0, Math.PI * 2); ctx.stroke();
    if (hi) { ctx.strokeStyle = hi; ctx.lineWidth = w * 0.4; ctx.beginPath(); ctx.ellipse(0, 0, len / 2, len / 4, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); }
    ctx.restore();
}
// Chuỗi xích từ (x0,y0) đến (x1,y1)
function curseChain(x0, y0, x1, y1, link, w, col, hi) {
    const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
    const n = Math.max(1, Math.floor(L / (link * 0.72)));
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        if (i % 2) {   // mắt xích nhìn nghiêng
            ctx.fillStyle = col; ctx.fillRect(-link / 2, -w / 2, link, w);
        } else {
            ctx.strokeStyle = col; ctx.lineWidth = w;
            ctx.beginPath(); ctx.ellipse(0, 0, link / 2, link / 3.2, 0, 0, Math.PI * 2); ctx.stroke();
            if (hi) { ctx.strokeStyle = hi; ctx.lineWidth = w * 0.45; ctx.beginPath(); ctx.ellipse(0, 0, link / 2, link / 3.2, 0, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke(); }
        }
        ctx.restore();
    }
}

registerTankArt('death_lock', (p, k) => {
    const t = k.t;
    TA.treads(-15.5, 5, -12.5, 14.5, t, '#0c0c0f', '#3f3f46');
    // Thân giáp nặng đen xám, góc vát
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-11.5, 11.5, '#18181b', '#52525b');
    ctx.beginPath();
    ctx.moveTo(-8, -12.5); ctx.lineTo(8, -12.5); ctx.lineTo(11.5, -9); ctx.lineTo(11.5, 11); ctx.lineTo(8.5, 14.5);
    ctx.lineTo(-8.5, 14.5); ctx.lineTo(-11.5, 11); ctx.lineTo(-11.5, -9); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Đinh tán
    ctx.fillStyle = '#a1a1aa';
    [[-9, -10], [9, -10], [-9, 12], [9, 12]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 0.9, 0, Math.PI * 2); ctx.fill(); });
    // Nòng dày, vòng xích quanh cổ nòng
    ctx.fillStyle = TA.metal(-3, 3, '#27272a', '#a1a1aa'); TA.rr(-3, -16, 6, 9, 1.5); ctx.fill();
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-1.5, -16, 3, 1.4);
    curseChainLink(0, -10.5, 0, 7.5, 1.4, '#71717a', '#d4d4d8');
    // Xích quấn chéo thân
    const chainCol = '#6b7280', chainHi = '#c4b5fd';
    curseChain(-11, -6, 11, 9, 4.2, 1.5, chainCol, chainHi);
    curseChain(11, -6, -11, 9, 4.2, 1.5, chainCol, chainHi);
    if (k.evo1) { curseChain(-11, 3, 11, 3, 4.2, 1.5, chainCol, chainHi); }
    // Ổ khoá ở tâm (lỗ khoá màu đội)
    ctx.fillStyle = '#3b0764';
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(0, 0.5, 3, Math.PI, 0); ctx.stroke();
    TA.rr(-4.2, 0.5, 8.4, 6.5, 1.5); ctx.fill(); ctx.stroke();
    ctx.save(); TA.glow(k.team, 6);
    ctx.fillStyle = k.team;
    ctx.beginPath(); ctx.arc(0, 3, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-0.5, 3, 1, 2.5);
    ctx.restore();
    // Evo 2: vòng gai quản chế ở hai vai
    if (k.evo2) {
        ctx.fillStyle = '#d4d4d8';
        [-1, 1].forEach(sd => {
            for (let i = 0; i < 3; i++) {
                const y = -7 + i * 6;
                ctx.beginPath(); ctx.moveTo(sd * 11.5, y - 1.4); ctx.lineTo(sd * 14.5, y); ctx.lineTo(sd * 11.5, y + 1.4); ctx.closePath(); ctx.fill();
            }
        });
    }
    // Full Evo: xích tím ma thuật quay quanh
    if (k.full) {
        ctx.save(); ctx.rotate(t * 0.9);
        ctx.globalAlpha = 0.75;
        for (let i = 0; i < 10; i++) {
            const a = i * Math.PI / 5;
            curseChainLink(Math.cos(a) * 15, Math.sin(a) * 15, a + Math.PI / 2, 3.6, 1.1, '#c084fc', null);
        }
        ctx.restore();
    }
});

// Đạn xích: vòng xích lồng nhau; đạn Cấm Chế: ổ khoá phát sáng
registerBulletArt('death_lock', (b, color, owner, k) => {
    if (!(b.isDeathLockBullet || b.isConfinementBullet)) return false;
    const R = Math.max(3, k.r);
    // vệt
    const L = Math.min(30, 6 + k.sp * 2.5);
    const tg = ctx.createLinearGradient(-L, 0, 0, 0);
    tg.addColorStop(0, 'rgba(168,85,247,0)'); tg.addColorStop(1, 'rgba(192,132,252,0.55)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -R); ctx.lineTo(0, R); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
    if (b.isConfinementBullet) {
        const s = R * 1.15;
        ctx.rotate(-Math.atan2(b.vy || 0, b.vx || 0));   // ổ khoá đứng thẳng
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.55, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#7e22ce'; TA.rr(-s * 0.85, -s * 0.3, s * 1.7, s * 1.3, 1.5); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, s * 0.25, s * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.rotate(k.t / 200);
        ctx.strokeStyle = 'rgba(233,213,255,0.8)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        return;
    }
    // 2 mắt xích lồng nhau xoay
    ctx.rotate(k.t / 90);
    ctx.lineWidth = Math.max(1.4, R * 0.45);
    ctx.strokeStyle = '#d4d4d8';
    ctx.beginPath(); ctx.ellipse(-R * 0.45, 0, R * 0.9, R * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#a855f7';
    ctx.beginPath(); ctx.ellipse(R * 0.45, 0, R * 0.55, R * 0.9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
});

// Lồng Cấm Chế: hai cột trụ xích, xích căng ngang, mạng xích chéo, ổ khoá ở tâm (giữ đúng khung lồng)
ConfinementCage.prototype.draw = function () {
    if (!this.active) return;
    const t = Date.now() / 1000;
    const left = Math.max(0, this.x - this.w / 2), right = Math.min(canvas.width, this.x + this.w / 2);
    const top = Math.max(0, this.y - this.h / 2), bot = top + this.h;
    const W = right - left;
    ctx.save();
    if (this.state === 'delay') {
        // Đạn khựng lại, xích tụ về
        const k = 1 - (this.delayTicks || 0) / 18;
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 16);
        g.addColorStop(0, '#f5d0fe'); g.addColorStop(0.5, 'rgba(168,85,247,0.8)'); g.addColorStop(1, 'rgba(88,28,135,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, 16, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + t * 2;
            const r = 30 * (1 - k) + 8;
            curseChainLink(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r, a, 7, 1.6, '#d8b4fe', null);
        }
        ctx.restore();
        return;
    }
    const fade = Math.min(1, (this.durationTicks || 0) / 20);
    ctx.globalAlpha = fade;
    // Nền lồng
    const bg = ctx.createLinearGradient(0, top, 0, bot);
    bg.addColorStop(0, 'rgba(88,28,135,0.28)'); bg.addColorStop(0.5, 'rgba(59,7,100,0.12)'); bg.addColorStop(1, 'rgba(88,28,135,0.28)');
    ctx.fillStyle = bg; ctx.fillRect(left, top, W, this.h);
    // Mạng xích chéo (vạch đứt chạy)
    ctx.strokeStyle = 'rgba(216,180,254,0.35)'; ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 12;
    ctx.beginPath();
    for (let x = left - this.h; x < right; x += 22) {
        ctx.moveTo(Math.max(left, x), top + Math.max(0, left - x)); ctx.lineTo(Math.min(right, x + this.h), top + Math.min(this.h, right - x));
    }
    ctx.stroke(); ctx.setLineDash([]);
    // Xích căng trên & dưới (rung nhẹ)
    ctx.shadowBlur = 8; ctx.shadowColor = '#a855f7';
    const wob = Math.sin(t * 10) * 1.2;
    curseChain(left + 6, top + 2 + wob, right - 6, top + 2 - wob, 9, 2, '#a1a1aa', '#e9d5ff');
    curseChain(left + 6, bot - 2 - wob, right - 6, bot - 2 + wob, 9, 2, '#a1a1aa', '#e9d5ff');
    ctx.shadowBlur = 0;
    // Hai cột trụ (ranh giới không thể vượt)
    [left, right].forEach((x, i) => {
        const px = i ? x - 5 : x + 5;
        const g = ctx.createLinearGradient(px - 4, 0, px + 4, 0);
        g.addColorStop(0, '#27272a'); g.addColorStop(0.5, '#a855f7'); g.addColorStop(1, '#27272a');
        ctx.fillStyle = g; TA.rr(px - 3.5, top - 4, 7, this.h + 8, 2); ctx.fill();
        ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(px, top - 4, 3.5, 0, Math.PI * 2); ctx.arc(px, bot + 4, 3.5, 0, Math.PI * 2); ctx.fill();
    });
    // Xích kéo mục tiêu vào tâm: 2 sợi xích từ ổ khoá móc vào xe địch, mắt xích trượt dần về tâm
    const enemy = this.owner && ((this.owner.id === 1) ? p2 : p1);
    if (enemy && enemy.hp > 0) {
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        const dx = ex - this.x;
        const inRange = Math.abs(dx) <= (this.pullRange || 110) + enemy.w;
        if (inRange) {
            const pulling = Math.abs(dx) > 3;
            const linkL = 8;
            const tug = pulling ? Math.sin(t * 22) * 1.5 : 0;   // rung căng khi đang kéo
            [-1, 1].forEach(sd => {
                const hx = ex + sd * enemy.w * 0.3, hy = ey + sd * enemy.h * 0.15;
                const x0 = this.x, y0 = this.y + sd * 3;
                const L = Math.hypot(hx - x0, hy - y0) || 1;
                const a = Math.atan2(hy - y0, hx - x0);
                const n = Math.max(1, Math.floor(L / (linkL * 0.75)));
                // các mắt xích chạy ngược về ổ khoá (thể hiện đang lôi vào)
                const off = pulling ? CURSE_FX.frac(t * 2.5) : 0;
                ctx.save();
                ctx.shadowBlur = 8; ctx.shadowColor = '#a855f7';
                for (let i = 0; i <= n; i++) {
                    const kk = Math.min(1, (i + off) / n);
                    const sag = Math.sin(kk * Math.PI) * (pulling ? 2 : 6) * sd + tug * Math.sin(kk * Math.PI);
                    const x = x0 + (hx - x0) * kk - Math.sin(a) * sag, y = y0 + (hy - y0) * kk + Math.cos(a) * sag;
                    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
                    if (i % 2) { ctx.fillStyle = '#c4b5fd'; ctx.fillRect(-linkL / 2, -1, linkL, 2); }
                    else {
                        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.8;
                        ctx.beginPath(); ctx.ellipse(0, 0, linkL / 2, linkL / 3.2, 0, 0, Math.PI * 2); ctx.stroke();
                    }
                    ctx.restore();
                }
                // móc cắm vào xe địch
                ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
                ctx.strokeStyle = '#f5f5f4'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(-2, 0, 4, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
                ctx.restore();
                ctx.restore();
            });
            // Vệt lực kéo trên địch (chevron hướng về tâm lồng)
            if (pulling) {
                const dirX = dx > 0 ? -1 : 1;
                ctx.strokeStyle = 'rgba(233,213,255,0.75)'; ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    const ph = CURSE_FX.frac(t * 3 + i / 3);
                    const x = ex - dirX * (enemy.w * 0.9 + 4) + dirX * ph * enemy.w * 0.6;
                    ctx.globalAlpha = fade * (1 - ph);
                    ctx.beginPath(); ctx.moveTo(x - dirX * 4, ey - 6); ctx.lineTo(x, ey); ctx.lineTo(x - dirX * 4, ey + 6); ctx.stroke();
                }
                ctx.globalAlpha = fade;
            }
        }
    }
    // Ổ khoá tâm
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -3, 5, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#6b21a8'; TA.rr(-7, -3, 14, 11, 2); ctx.fill();
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(0, 1.5, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-0.7, 1.5, 1.4, 4);
    ctx.restore();
    // Đồng hồ thời gian giam (vòng nhỏ quanh ổ khoá)
    const kk = Math.max(0, (this.durationTicks || 0) / 180);
    ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(this.x, this.y + 2, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kk); ctx.stroke();
    ctx.restore();
};

// Ấn Ràng Buộc trên nạn nhân của Trối Chết: các mắt xích tím quanh xe = số tầng (vẽ trên xe)
function drawBindingMarks(v) {
    const n = v.bindingCurseStacks || 0;
    if (n <= 0 || !(v.bindingCurseTimer > 0) || v.hp <= 0) return;
    const t = Date.now() / 1000;
    const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    const R = v.w * 0.72;
    ctx.save();
    ctx.globalAlpha = Math.min(1, v.bindingCurseTimer / 30);
    ctx.shadowBlur = 6; ctx.shadowColor = '#a855f7';
    for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 2 + t * 0.8;
        curseChainLink(cx + Math.cos(a) * R, cy + Math.sin(a) * R, a + Math.PI / 2, 7, 1.8, i < n ? '#d8b4fe' : 'rgba(120,120,130,0.35)', i < n ? '#ffffff' : null);
    }
    ctx.restore();
}

// ==========================================
// 6. CỔNG KHÔNG GIAN (PORTAL)
// ==========================================
function curseVortex(x, y, r, t, c1, c2, dir) {
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, '#0b0217'); g.addColorStop(0.55, '#4c1d95'); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(t * 3 * dir);
    ctx.lineWidth = Math.max(1, r * 0.22); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = i % 2 ? c2 : '#e9d5ff';
        ctx.beginPath(); ctx.arc(0, 0, r * (0.85 - i * 0.22), i * 2.1, i * 2.1 + 2.6); ctx.stroke();
    }
    ctx.restore();
}

registerTankArt('portal', (p, k) => {
    const t = k.t;
    // Hai cổng xoáy hai bên thân (silhouette đặc trưng)
    [-1, 1].forEach(sd => {
        ctx.save(); TA.glow('#a855f7', 6);
        curseVortex(sd * 10.2, 2, 5.6, t, '#a855f7', k.evo1 ? '#22d3ee' : '#c084fc', sd);
        TA.noGlow(); ctx.restore();
        ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(sd * 10.2, 2, 5.9, 0, Math.PI * 2); ctx.stroke();
    });
    // Thân thon hình thoi bo tròn
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-6, 6, '#2e1065', '#7c3aed');
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.quadraticCurveTo(6.5, -6, 6, 6); ctx.quadraticCurveTo(5, 13, 0, 14);
    ctx.quadraticCurveTo(-5, 13, -6, 6); ctx.quadraticCurveTo(-6.5, -6, 0, -13); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Thanh nối 2 cổng
    ctx.fillStyle = '#18181b'; TA.rr(-6, 0.8, 12, 2.4, 1); ctx.fill();
    // Evo 2 (Gia tốc): cánh đẩy phía sau
    if (k.evo2) {
        ctx.fillStyle = '#22d3ee';
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 3.5, 9); ctx.lineTo(sd * 6.5, 15); ctx.lineTo(sd * 2, 12.5); ctx.closePath(); ctx.fill(); });
        const fl = 0.5 + 0.5 * Math.sin(t * 25);
        ctx.fillStyle = `rgba(34,211,238,${0.4 + 0.4 * fl})`;
        ctx.beginPath(); ctx.ellipse(0, 14.5, 1.6, 1 + fl, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Nòng có vòng phát
    ctx.fillStyle = TA.metal(-1.6, 1.6, '#3b0764', '#d8b4fe'); TA.rr(-1.6, -16, 3.2, 9, 1.2); ctx.fill();
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.2;
    const rp = 0.5 + 0.5 * Math.sin(t * 6);
    ctx.beginPath(); ctx.ellipse(0, -14.5 + rp, 3, 1.1, 0, 0, Math.PI * 2); ctx.stroke();
    // Lõi kỳ dị
    ctx.save(); TA.glow(k.team, 8);
    const cg = ctx.createRadialGradient(0, -2, 0, 0, -2, 3.6);
    cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.5, k.team); cg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, -2, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Đạn nổ đã nạp (Evo 1 sau khi dịch chuyển): lõi cam
    if (p.nextShotExplosive) {
        ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.arc(0, -11.5, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    if (k.full) {
        ctx.save(); ctx.rotate(-t * 1.5);
        ctx.strokeStyle = 'rgba(34,211,238,0.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
});

// Đạn cổng: cầu tím có vòng xoay (đạn nổ: lõi cam), đạn Cổng Bắn: xanh lơ
registerBulletArt('portal', (b, color, owner, k) => {
    const R = Math.max(2.5, k.r);
    const shot = !!b.isPortalShot;
    const ex = !!b.isExplosive;
    const c = ex ? '#fb923c' : (shot ? '#22d3ee' : '#c084fc');
    const L = Math.min(34, 6 + k.sp * 2.6);
    const tg = ctx.createLinearGradient(-L, 0, 0, 0);
    tg.addColorStop(0, 'rgba(0,0,0,0)'); tg.addColorStop(1, c);
    ctx.globalAlpha = 0.6; ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -R * 0.9); ctx.lineTo(0, R * 0.9); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 10; ctx.shadowColor = c;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.1);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, c); g.addColorStop(1, ex ? '#7c2d12' : '#3b0764');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.rotate(k.t / 70);
    ctx.strokeStyle = ex ? '#fde68a' : '#e9d5ff'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 2.1, R * 1.1, 0, 0, Math.PI * 1.4); ctx.stroke();
    ctx.strokeStyle = shot ? '#a855f7' : '#22d3ee';
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.1, R * 2.1, 0, Math.PI, Math.PI * 2.2); ctx.stroke();
});

// Cổng Bắn (PortalGate): xoáy không gian 3 lớp, vành hạt hút vào, đếm số phát còn lại
// (thân cổng; tia ngắm cảnh báo do PortalGate.draw trong characters/portal/logic.js vẽ quanh nó)
PortalGate.prototype.drawBody = function () {
    if (!this.active) return;
    const k = this.delay > 0 ? 0 : Math.max(0.05, Math.min(1, (this.age || 0) / 12, this.life / 20));
    if (k <= 0) return;
    const t = Date.now() / 1000;
    const r = this.r;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(k, k);
    // Quầng
    const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.8);
    halo.addColorStop(0, 'rgba(168,85,247,0.5)'); halo.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2); ctx.fill();
    // Lòng cổng (elip)
    ctx.save(); ctx.scale(1, 0.78);
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r + 2);
    g.addColorStop(0, '#000000'); g.addColorStop(0.45, '#1e0b3a'); g.addColorStop(0.8, '#7e22ce'); g.addColorStop(1, '#22d3ee');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, Math.PI * 2); ctx.fill();
    // Xoắn ốc bên trong
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate(t * (2.4 + i * 0.8) * (i % 2 ? -1 : 1));
        ctx.strokeStyle = i === 1 ? '#22d3ee' : '#d8b4fe'; ctx.lineWidth = 2 - i * 0.4;
        ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        for (let j = 0; j <= 14; j++) {
            const a = j * 0.42, rr = r * (0.15 + j / 14 * (0.9 - i * 0.15));
            const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
    // Hạt bị hút vào
    ctx.fillStyle = '#e9d5ff';
    for (let i = 0; i < 6; i++) {
        const ph = CURSE_FX.frac(t * 1.5 + i / 6);
        const rr = r * (1.9 - ph * 1.2), a = CURSE_FX.hash(i + 21) * Math.PI * 2 + t;
        ctx.globalAlpha = ph;
        ctx.fillRect(Math.cos(a) * rr - 1, Math.sin(a) * rr * 0.78 - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
    // Chấm đếm số phát còn lại
    const team = this.owner && this.owner.id === 2 ? '#e74c3c' : '#3498db';
    for (let i = 0; i < (this.shots || 0); i++) {
        const a = -Math.PI / 2 + (i - 1) * 0.5;
        ctx.fillStyle = team;
        ctx.beginPath(); ctx.arc(Math.cos(a) * (r + 5), Math.sin(a) * (r + 5) * 0.78, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};

// ==========================================
// Điểm nối với vòng vẽ chung
// ==========================================
// Vẽ riêng các đòn đặc biệt (bỏ qua vệt tròn & hình đạn mặc định). Trả về true nếu đã vẽ.
function curseBulletDraw(b, owner) {
    try {
        if (b.isSukunaSlash) { drawSukunaSlash(b, owner); return true; }
        if (b.isFuga || b.type === 'sukuna_fuga') { drawSukunaFuga(b); return true; }
        if (b.type === 'gojo_blue') { drawGojoBlue(b); return true; }
        if (b.type === 'purple' && owner && owner.weapon === 'the_strongest') { drawGojoPurple(b); return true; }
    } catch (e) { /* lỗi vẽ không được làm sập game */ }
    return false;
}

// Lớp dưới (sau nền sân, trước vật thể & xe): nền Lãnh địa
function curseFxUnder() {
    [p1, p2].forEach(p => {
        if (!p || p.hp <= 0) return;
        try {
            if (p.weapon === 'sukuna' && p.domainActive) drawMalevolentShrine(p);
            if (p.weapon === 'the_strongest' && (p.gojoDomainTimer || 0) > 0) drawInfiniteVoid(p);
        } catch (e) { /* bỏ qua */ }
    });
}
// Lớp trên (sau xe): chớp mở Lãnh địa, luồng thông tin, ấn Ràng Buộc
function curseFxOver() {
    [p1, p2].forEach(p => {
        if (!p) return;
        try {
            if (p.hp > 0 && p.weapon === 'sukuna' && p.domainActive) drawMalevolentShrineIntro(p);
            if (p.hp > 0 && p.weapon === 'the_strongest' && (p.gojoDomainTimer || 0) > 0) drawInfiniteVoidOverlay(p);
            if (p.weapon === 'the_strongest' && (p.gojoPurpleBanner || 0) > 0) drawGojoPurpleBanner(p);
            drawBindingMarks(p);
        } catch (e) { /* bỏ qua */ }
    });
}
