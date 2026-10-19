// ==========================================
// Cuồng Chiến Binh (berserker) — Hình ảnh
// Xe giáp gai + rìu đôi ở mũi, lõi tim cuồng nộ sáng dần theo mốc Cuồng Chiến;
// thanh Huyết Chiến ở hàng "extra" + 3 chevron mốc; Huyết Địa = 2 bức tường năng lượng đỏ.
// ==========================================

function bersTierColor(tier) { return ['#94a3b8', '#ffb020', BERS_ORANGE, BERS_RED][tier] || BERS_RED; }

registerTankArt('berserker', (p, k) => {
    const t = k.t;
    const tier = bersTier(p);
    const hc = !!p.bersHC;
    const rage = hc ? 1 : tier / 3;
    const pulse = 0.5 + 0.5 * Math.sin(t * (6 + rage * 10));
    const hot = hc ? BERS_RED : bersTierColor(tier);
    const recoil = (p.bersRecoil || 0) * 0.5;

    // Hào quang Huyết Chiến
    if (hc) {
        ctx.save();
        const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 17);
        g.addColorStop(0, 'rgba(255,45,61,0)'); g.addColorStop(1, `rgba(255,45,61,${0.25 + 0.25 * pulse})`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, 16.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    TA.treads(-15.5, 4, -11, 13, t, '#140608', '#5b1a1f');

    // Thân bát giác
    ctx.fillStyle = TA.vgrad(-12, 14, '#3a1015', '#12060a');
    ctx.beginPath();
    ctx.moveTo(-11, -8); ctx.lineTo(-7, -12); ctx.lineTo(7, -12); ctx.lineTo(11, -8);
    ctx.lineTo(11, 10); ctx.lineTo(7, 14); ctx.lineTo(-7, 14); ctx.lineTo(-11, 10); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hot; ctx.lineWidth = 1.1; TA.glow(hot, 4 + rage * 8); ctx.stroke(); TA.noGlow();

    // Gai giáp hai bên
    ctx.fillStyle = '#c7ccd6';
    const spikes = k.evo1 ? [-6, -1, 4, 9] : [-5, 1, 7];
    [-1, 1].forEach(sd => spikes.forEach(y => {
        ctx.beginPath(); ctx.moveTo(sd * 11, y - 2); ctx.lineTo(sd * 14.8, y); ctx.lineTo(sd * 11, y + 2); ctx.closePath(); ctx.fill();
    }));

    // Rìu đôi ở mũi (lưỡi cong ôm nòng)
    [-1, 1].forEach(sd => {
        ctx.save(); ctx.scale(sd, 1);
        ctx.fillStyle = TA.metal(2, 12, '#64748b', k.full ? '#ffe9a8' : '#e2e8f0');
        ctx.beginPath();
        ctx.moveTo(3, -9); ctx.quadraticCurveTo(12.5, -10, 12, -15.5);
        ctx.quadraticCurveTo(8, -12.5, 4.5, -13.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = k.full ? BERS_GOLD : hot; ctx.lineWidth = 0.8; TA.glow(ctx.strokeStyle, 4 + rage * 6);
        ctx.beginPath(); ctx.moveTo(12, -15.5); ctx.quadraticCurveTo(12.5, -10, 3, -9); ctx.stroke(); TA.noGlow();
        ctx.restore();
    });

    // Nòng ngắn dày (giật khi bắn)
    TA.barrel(0, -6 + recoil, 9.5, 5, '#d4d8e0', hot);

    // Tháp + lõi tim cuồng nộ (màu đội viền ngoài)
    ctx.fillStyle = '#1b0a0e';
    TA.rr(-6.5, -6, 13, 13, 3); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    const R = 3.2 + rage * 1.4 + pulse * 0.6;
    const cg = ctx.createRadialGradient(0, 0.5, 0.5, 0, 0.5, R);
    cg.addColorStop(0, '#fff2f2'); cg.addColorStop(0.45, hot); cg.addColorStop(1, 'rgba(120,0,10,0.2)');
    ctx.fillStyle = cg; TA.glow(hot, 6 + rage * 12);
    ctx.beginPath(); ctx.arc(0, 0.5, R, 0, Math.PI * 2); ctx.fill(); TA.noGlow();

    // Khe xả nhiệt phía sau: sáng theo mốc (1..3)
    for (let i = 0; i < 3; i++) {
        const on = hc || i < tier;
        ctx.fillStyle = on ? hot : 'rgba(255,255,255,0.12)';
        if (on) TA.glow(hot, 5);
        TA.rr(-6 + i * 4.3, 9.5, 3.4, 2.2, 1); ctx.fill(); TA.noGlow();
    }

    // Evo 2: vạch rune Huyết Địa trên giáp
    if (k.evo2) {
        ctx.strokeStyle = 'rgba(255,45,61,0.7)'; ctx.lineWidth = 0.7;
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 8.5, -6); ctx.lineTo(sd * 8.5, 7); ctx.stroke(); });
    }
    // Full Evo: sừng vàng
    if (k.full) {
        ctx.fillStyle = BERS_GOLD; TA.glow(BERS_GOLD, 6);
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 5, -6); ctx.quadraticCurveTo(sd * 9, -8, sd * 8.5, -12); ctx.lineTo(sd * 3.5, -6); ctx.closePath(); ctx.fill(); });
        TA.noGlow();
    }
});

registerBulletArt('berserker', (b, color, owner, k) => {
    if (b.isBersBlood) {
        const R = k.r;
        const rot = k.t / 90;
        ctx.save();
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R * 1.7);
        g.addColorStop(0, '#fff1f1'); g.addColorStop(0.35, BERS_RED); g.addColorStop(1, 'rgba(120,0,15,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.rotate(rot);
        ctx.fillStyle = '#7a0010'; ctx.strokeStyle = '#ff6b78'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, rr = i % 2 ? R * 0.7 : R * 1.15;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath(); ctx.fill(); TA.glow(BERS_RED, 10); ctx.stroke(); TA.noGlow();
        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath(); ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2); ctx.stroke();
        return true;
    }
    // Đạn thường: mảnh lưỡi rìu đỏ cam có đuôi
    const L = 6;
    const g = ctx.createLinearGradient(-L * 3, 0, 0, 0);
    g.addColorStop(0, 'rgba(255,138,31,0)'); g.addColorStop(1, 'rgba(255,90,40,0.6)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-L * 3, 0); ctx.lineTo(0, -2.2); ctx.lineTo(0, 2.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = owner && owner.bersHC ? BERS_RED : BERS_ORANGE;
    TA.glow(ctx.fillStyle, 8);
    ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(-1, -3); ctx.lineTo(-3, 0); ctx.lineTo(-1, 3); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath(); ctx.arc(0.5, 0, 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, Math.PI * 2); ctx.stroke();
    return true;
});

// Đấu Trường Huyết Địa
function bersDrawArena(e) {
    const a = e.on ? Math.min(1, e.t / 10) : Math.max(0, e.fade / 20);
    if (a <= 0) return;
    const H = canvas.height, W = canvas.width;
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha *= a;
    // vùng ngoài bị phủ tối
    ctx.fillStyle = 'rgba(60, 0, 8, 0.22)';
    ctx.fillRect(0, 0, e.x0, H); ctx.fillRect(e.x1, 0, W - e.x1, H);
    [[e.x0, 1], [e.x1, -1]].forEach(([x, inward]) => {
        const g = ctx.createLinearGradient(x - inward * 10, 0, x + inward * 3, 0);
        g.addColorStop(0, 'rgba(255,45,61,0)'); g.addColorStop(1, 'rgba(255,45,61,0.45)');
        ctx.fillStyle = g;
        ctx.fillRect(Math.min(x - inward * 10, x + inward * 3), 0, 13, H);
        ctx.strokeStyle = BERS_RED; ctx.lineWidth = 2; ctx.shadowColor = BERS_RED; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        // vạch năng lượng chạy dọc
        ctx.strokeStyle = '#ffd0d5'; ctx.lineWidth = 1; ctx.shadowBlur = 6;
        ctx.setLineDash([10, 22]); ctx.lineDashOffset = -t * 60 * inward;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        ctx.setLineDash([]);
        // mũi chevron chỉ vào trong ở 2 làn xe
        ctx.shadowBlur = 0; ctx.fillStyle = BERS_RED;
        [p1, p2].forEach(pl => {
            if (!pl) return;
            const cy = pl.y + pl.h / 2;
            ctx.beginPath();
            ctx.moveTo(x + inward * 2, cy - 7); ctx.lineTo(x + inward * 8, cy); ctx.lineTo(x + inward * 2, cy + 7); ctx.closePath(); ctx.fill();
        });
    });
    ctx.restore();
}

// Chevron mốc Cuồng Chiến (bên trái xe, trỏ về phía trước)
function bersDrawTier(p, tier, hc) {
    const top = p.id === 1;
    let x = p.x - 7;
    if (x < 5) x = p.x + p.w + 22 < canvas.width ? p.x + p.w + 22 : p.x + p.w + 7;
    const cy = p.y + p.h / 2;
    const dir = top ? -1 : 1; // hướng trước
    ctx.save();
    for (let i = 0; i < 3; i++) {
        const on = hc || i < tier;
        const y = cy + dir * (i - 1) * 6;
        ctx.strokeStyle = on ? (hc ? BERS_RED : bersTierColor(tier)) : 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (on) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 6; } else ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(x - 3.5, y - dir * 2); ctx.lineTo(x, y + dir * 1.8); ctx.lineTo(x + 3.5, y - dir * 2); ctx.stroke();
    }
    ctx.restore();
}

CharHooks.register('berserker', Object.assign(CharHooks.registry.berserker || {}, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now() / 1000;
        // Đánh Trả: vệt tốc độ
        if (this.bersRageT > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.bersRageT / 30) * 0.6;
            ctx.strokeStyle = BERS_ORANGE; ctx.lineWidth = 1.5;
            const back = this.id === 1 ? 1 : -1;
            for (let i = -1; i <= 1; i++) {
                const xx = cx + i * 9, y0 = cy + back * (this.h / 2 + 2);
                ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + back * (6 + ((t * 30 + i * 7) % 6))); ctx.stroke();
            }
            ctx.restore();
        }
        // Huyết Chiến: vòng lửa máu (ngoài bo -> nhấp nháy)
        if (this.bersHC) {
            ctx.save();
            const flick = this.bersOut ? (Math.sin(t * 30) > 0 ? 1 : 0.35) : 1;
            ctx.globalAlpha = flick;
            ctx.strokeStyle = this.bersGrace > 0 ? BERS_GOLD : BERS_RED;
            ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 40;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.78, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudRowY !== 'function') return;
        const tier = bersTier(this), hc = !!this.bersHC;
        bersDrawTier(this, tier, hc);
        // Thanh Huyết Chiến (0..100)
        const frac = Math.max(0, Math.min(1, (this.bersBar || 0) / 100));
        const y = hudRowY(this, 'extra') + (this.id === 1 ? 1 : -3.5);
        const x = this.x - 3, w = this.w + 6, h = 3;
        const tt = Date.now();
        ctx.save();
        ctx.fillStyle = 'rgba(20,3,6,0.88)';
        ctx.fillRect(x - 0.5, y - 0.5, w + 1, h + 1);
        const full = frac >= 1 - 1e-6;
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        if (hc && this.bersGrace > 0) { g.addColorStop(0, '#ffb020'); g.addColorStop(1, BERS_GOLD); }
        else if (hc) { g.addColorStop(0, '#8b0010'); g.addColorStop(1, '#ff5060'); }
        else { g.addColorStop(0, '#7a1a00'); g.addColorStop(1, full ? '#ff3b3b' : BERS_ORANGE); }
        ctx.fillStyle = g;
        ctx.shadowColor = hc ? BERS_RED : (full ? BERS_RED : BERS_ORANGE);
        ctx.shadowBlur = (hc || full) ? 6 + 4 * Math.sin(tt / 80) : 2;
        ctx.fillRect(x, y, w * frac, h);
        ctx.shadowBlur = 0;
        // vạch 25/50/75
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        for (let i = 1; i < 4; i++) ctx.fillRect(x + w * i / 4 - 0.3, y, 0.6, h);
        // Đầy & chưa kích hoạt: giọt máu nhấp nháy ở cuối thanh (sẵn sàng Huyết Chiến)
        if (full && !hc) {
            ctx.globalAlpha = 0.6 + 0.4 * Math.sin(tt / 100);
            ctx.fillStyle = BERS_RED; ctx.shadowColor = BERS_RED; ctx.shadowBlur = 8;
            const dx = x + w + 4, dy = y + h / 2;
            ctx.beginPath(); ctx.moveTo(dx, dy - 3.5); ctx.quadraticCurveTo(dx + 3, dy + 0.5, dx, dy + 2.5); ctx.quadraticCurveTo(dx - 3, dy + 0.5, dx, dy - 3.5); ctx.fill();
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        }
        // Full Evo: số lần Tàn Hơi còn lại (chấm vàng bên trái thanh)
        if (bersFull(this)) {
            const left = 2 - (this.bersRevives || 0);
            for (let i = 0; i < 2; i++) {
                ctx.fillStyle = i < left ? BERS_GOLD : 'rgba(255,255,255,0.15)';
                ctx.beginPath(); ctx.arc(x - 3.5 - i * 4, y + h / 2, 1.4, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    },
}));

// HUD nút Bắn / vòng cạnh xe: Huyết Đạn sẵn sàng + kiểu bắn hiện tại
function bersRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('berserker', p => {
        const bar = p.bersBar || 0, tier = bersTier(p);
        const base = { pct: bar / 100, pips: p.bersHC ? 3 : tier, pipMax: 3, pipColor: BERS_GOLD, btnIcon: bersSpray(p) ? '🔥' : '🪓' };
        if (p.bersHC) return Object.assign(base, { ready: !!p.bersBloodReady, color: BERS_RED, icon: 'drop', label: 'HUYẾT CHIẾN ' + Math.ceil(bar) });
        if (p.bersBloodReady) return Object.assign(base, { ready: true, color: BERS_RED, icon: 'drop', label: 'HUYẾT ĐẠN' });
        return Object.assign(base, { ready: false, idle: true, color: BERS_ORANGE, label: 'HUYẾT ' + Math.floor(bar) });
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', bersRegisterHUD);
