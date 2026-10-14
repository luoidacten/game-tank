// ==========================================
// Cao Bồi (revolver) — Hình ảnh: nón cao bồi, nòng súng lục, ổ đạn 6 viên,
// hồng tâm Quạt Cò, lửa đầu nòng & vệt đạn vàng/đồng kiểu Viễn Tây
// ==========================================

function revStar(cx, cy, rOut, rIn, n, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
        const r = i % 2 ? rIn : rOut;
        const a = rot + i * Math.PI / n;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
}

// Vẽ khẩu súng lục (nòng + khung) nhô ra phía trước
function revDrawGun(p, dx, kick) {
    const d = revDir(p);
    const cx = p.x + p.w / 2 + dx;
    const baseY = d < 0 ? p.y + 2 : p.y + p.h - 2;
    const k = -d * kick * 0.5; // giật lùi
    ctx.save();
    // Khung súng (đồng thau)
    ctx.fillStyle = '#7a4a1e';
    ctx.fillRect(cx - 4, baseY + d * 2 + k - (d < 0 ? 6 : 0), 8, 6);
    // Nòng dài thép xanh
    const bl = 14;
    const by0 = d < 0 ? baseY - bl + k : baseY + k;
    const g = ctx.createLinearGradient(cx - 2.5, 0, cx + 2.5, 0);
    g.addColorStop(0, '#5b6577'); g.addColorStop(0.5, '#dfe7f2'); g.addColorStop(1, '#4a5263');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 2.5, by0 - (d < 0 ? 2 : -2), 5, bl);
    // Đầu ruồi vàng
    ctx.fillStyle = REV_GOLD;
    ctx.fillRect(cx - 1, d < 0 ? by0 - 4 : by0 + bl + 1, 2, 3);
    ctx.restore();
}

Object.assign(CharHooks.registry.revolver, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now();
        const dual = revFull(this) && this.revFanPhase;
        ctx.save();

        // Súng lục (Song Lục khi Full Evo quạt cò)
        if (dual) { revDrawGun(this, -9, this.revKick || 0); revDrawGun(this, 9, this.revKick || 0); }
        else revDrawGun(this, 0, this.revKick || 0);

        // Nón cao bồi nhìn từ trên xuống: vành nón + chóp + dây đồng
        const rw = this.w * 0.62, rh = this.h * 0.5;
        ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fillStyle = '#8b5a2b';
        ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4a2c12'; ctx.lineWidth = 1.2; ctx.stroke();
        // vành cong lên 2 bên
        ctx.strokeStyle = 'rgba(255, 220, 160, 0.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, rw - 2, rh - 2, 0, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
        ctx.fillStyle = '#6b3f1a';
        ctx.beginPath(); ctx.ellipse(cx, cy, rw * 0.55, rh * 0.62, 0, 0, Math.PI * 2); ctx.fill();
        // dây nón đồng
        ctx.strokeStyle = REV_COPPER; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rw * 0.58, rh * 0.66, 0, 0, Math.PI * 2); ctx.stroke();
        // nếp lõm chóp nón
        ctx.strokeStyle = '#3d220c'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx - rw * 0.25, cy); ctx.lineTo(cx + rw * 0.25, cy); ctx.stroke();
        // ngôi sao cảnh sát trưởng (màu đội)
        ctx.fillStyle = this.id === 1 ? '#7dd3fc' : '#fda4af';
        revStar(cx, cy + (this.id === 1 ? rh * 0.82 : -rh * 0.82), 3.2, 1.4, 5, -Math.PI / 2);
        ctx.fill();

        // Thưởng +1 sát thương cho ổ đạn hiện tại: hào quang vàng
        if (this.revDmgBonus > 0) {
            ctx.strokeStyle = `rgba(255, 204, 77, ${0.45 + 0.3 * Math.sin(t / 120)})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, 0, Math.PI * 2); ctx.stroke();
        }

        // Vòng giữ nút (tới 0.4s -> Quạt Cò)
        if (this.revHold > 3 && this.revHold < REV_HOLD_TICKS && !this.revFanPhase && !this.revReloading && this.ammo > 0) {
            ctx.strokeStyle = REV_GOLD; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.revHold / REV_HOLD_TICKS); ctx.stroke();
        }

        // Lửa đầu nòng
        (this.revFx || []).forEach(f => {
            if (f.k !== 'flash') return;
            const a = f.life / f.max;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = a;
            const R = (f.copper ? 15 : 10) * (0.6 + 0.6 * a);
            const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
            gr.addColorStop(0, '#fffbe6');
            gr.addColorStop(0.35, f.copper ? '#ffb15c' : '#ffe08a');
            gr.addColorStop(1, 'rgba(255, 120, 30, 0)');
            ctx.fillStyle = gr;
            revStar(f.x, f.y, R, R * 0.4, f.copper ? 7 : 5, f.ang || 0);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();

        // Hồng tâm Quạt Cò trên mục tiêu
        if (this.revFanPhase) {
            const mx = this.revMarkX, my = this.revMarkY;
            const locking = this.revFanPhase === 1;
            const prog = locking ? 1 - this.revFanT / REV_LOCK_TICKS : 1;
            const R = 30 - 14 * prog;
            const col = locking ? REV_GOLD : '#ff3b3b';
            ctx.save();
            // tia ngắm mờ từ họng súng
            const m = revMuzzle(this);
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = locking ? 'rgba(255, 204, 77, 0.35)' : 'rgba(255, 59, 59, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(mx, my); ctx.stroke();
            ctx.setLineDash([]);
            ctx.translate(mx, my);
            ctx.shadowBlur = 10; ctx.shadowColor = col;
            ctx.strokeStyle = col; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
            // vòng tiến trình khóa mục tiêu
            if (locking) {
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(0, 0, R + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
            }
            ctx.rotate(t / (locking ? 260 : 90));
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath(); ctx.moveTo(R - 6, 0); ctx.lineTo(R + 8, 0); ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            if (!locking || this.revFanT % 20 < 14) {
                ctx.save();
                ctx.font = 'bold 9px "Orbitron", Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = col;
                const label = locking ? `KHÓA ${(this.revFanT / 60).toFixed(1)}s` : 'FAN THE HAMMER!';
                drawWorldText(ctx, label, mx, my + (this.id === 1 ? R + 28 : -R - 20)); // phía giữa sân, không đè HUD
                ctx.restore();
            }
        }
    },

    drawUI() {
        // Ổ đạn xoay 6 viên bên cạnh xe (lật sang trái nếu sát mép phải)
        const right = this.x + this.w + 28 < canvas.width;
        const ox = right ? this.x + this.w + 14 : this.x - 14;
        const oy = this.y + this.h / 2;
        const R = 10.5, rc = 3.1, ring = 6.2;
        const d = revDir(this);
        const next = revChamber(this); // viên sắp bắn
        const step = Math.PI * 2 / REV_CYL;
        // Viên sắp bắn quay về phía trước (về phía đối thủ)
        let rot = (d < 0 ? -Math.PI / 2 : Math.PI / 2) - (next - 1) * step;
        if (this.revSpinT > 0) rot += step * Math.min(1, this.revSpinT / 6);
        let reloadProg = 0;
        if (this.revReloading) {
            reloadProg = 1 - (this.revReloadT || 0) / Math.max(1, this.revReloadMax || 1);
            rot = Math.PI * 4 * reloadProg * reloadProg;
        }
        ctx.save();
        // Thân ổ đạn
        const g = ctx.createRadialGradient(ox - 3, oy - 3, 1, ox, oy, R);
        g.addColorStop(0, '#c9b38a'); g.addColorStop(0.6, '#8a6a3c'); g.addColorStop(1, '#4a3518');
        ctx.fillStyle = g;
        ctx.shadowBlur = 6; ctx.shadowColor = this.revDmgBonus > 0 ? REV_GOLD : 'rgba(0,0,0,0.7)';
        ctx.beginPath(); ctx.arc(ox, oy, R, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#2b1d0b'; ctx.lineWidth = 1; ctx.stroke();
        // Rãnh giữa các buồng đạn
        for (let i = 0; i < REV_CYL; i++) {
            const a = rot + (i + 0.5) * step;
            ctx.strokeStyle = 'rgba(40, 25, 8, 0.7)';
            ctx.beginPath(); ctx.moveTo(ox + Math.cos(a) * (R - 3), oy + Math.sin(a) * (R - 3)); ctx.lineTo(ox + Math.cos(a) * R, oy + Math.sin(a) * R); ctx.stroke();
        }
        // Buồng đạn: còn đạn = vàng đồng thau, viên 6 = đạn đồng đỏ rực; rỗng = lỗ tối
        for (let c = 1; c <= REV_CYL; c++) {
            const a = rot + (c - 1) * step;
            const bx = ox + Math.cos(a) * ring, by = oy + Math.sin(a) * ring;
            const loaded = this.revReloading ? (c <= Math.floor(reloadProg * REV_CYL + 0.0001)) : c >= next && this.ammo > 0;
            const copper = c === REV_CYL;
            if (loaded) {
                const cg = ctx.createRadialGradient(bx - 1, by - 1, 0.3, bx, by, rc);
                cg.addColorStop(0, '#fff6d6');
                cg.addColorStop(0.5, copper ? REV_COPPER : REV_GOLD);
                cg.addColorStop(1, copper ? '#8a3410' : '#8a6410');
                ctx.fillStyle = cg;
                if (copper) { ctx.shadowBlur = 7; ctx.shadowColor = REV_COPPER; }
                ctx.beginPath(); ctx.arc(bx, by, rc, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                // hạt nổ (primer)
                ctx.fillStyle = 'rgba(60, 30, 5, 0.75)';
                ctx.beginPath(); ctx.arc(bx, by, 0.9, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#120b04';
                ctx.beginPath(); ctx.arc(bx, by, rc - 0.3, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = copper ? 'rgba(255, 122, 47, 0.55)' : 'rgba(255, 204, 77, 0.25)';
                ctx.lineWidth = 0.8; ctx.stroke();
            }
            // Viên sắp bắn: viền sáng
            if (!this.revReloading && c === next && this.ammo > 0) {
                ctx.strokeStyle = copper ? '#ffd2b0' : '#fff3c4'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(bx, by, rc + 1.2, 0, Math.PI * 2); ctx.stroke();
            }
        }
        // Trục giữa
        ctx.fillStyle = '#2b1d0b';
        ctx.beginPath(); ctx.arc(ox, oy, 1.6, 0, Math.PI * 2); ctx.fill();
        // Tiến trình nạp ổ
        if (this.revReloading) {
            ctx.strokeStyle = REV_GOLD; ctx.lineWidth = 2;
            ctx.shadowBlur = 6; ctx.shadowColor = REV_GOLD;
            ctx.beginPath(); ctx.arc(ox, oy, R + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * reloadProg); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Thưởng +1 DMG
        if (this.revDmgBonus > 0) {
            ctx.font = 'bold 8px "Orbitron", Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = REV_GOLD;
            drawWorldText(ctx, '+1', ox, oy + (d < 0 ? -R - 4 : R + 10));
        }
        ctx.restore();
    },
});

BulletHooks.registry.revolver.draw = function (b) {
    const copper = b.revCopper;
    const sp = Math.hypot(b.vx, b.vy) || 1;
    const ux = b.vx / sp, uy = b.vy / sp;
    const hx = b.x + b.w / 2 + ux * b.h / 2, hy = b.y + b.h / 2 + uy * b.h / 2;
    // Vệt đạn (tracer) dài theo hướng bay, không vượt quá điểm bắn
    let len = copper ? 70 : (b.revFan ? 60 : 46);
    if (typeof b.revSX === 'number') len = Math.min(len, Math.hypot(hx - b.revSX, hy - b.revSY));
    const tx = hx - ux * len, ty = hy - uy * len;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(255, 140, 40, 0)');
    g.addColorStop(1, copper ? 'rgba(255, 122, 47, 0.95)' : (b.revFan ? 'rgba(255, 90, 60, 0.85)' : 'rgba(255, 210, 90, 0.9)'));
    ctx.strokeStyle = g;
    ctx.lineWidth = copper ? 4 : 2.4;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 250, 230, 0.9)';
    ctx.lineWidth = copper ? 1.6 : 1;
    ctx.beginPath(); ctx.moveTo(hx - ux * len * 0.35, hy - uy * len * 0.35); ctx.lineTo(hx, hy); ctx.stroke();
    // Đầu đạn
    ctx.shadowBlur = copper ? 14 : 8;
    ctx.shadowColor = copper ? REV_COPPER : REV_GOLD;
    ctx.fillStyle = copper ? '#ffb27a' : '#fff1b8';
    ctx.beginPath(); ctx.ellipse(hx - ux * 2, hy - uy * 2, copper ? 3.4 : 2.4, copper ? 5 : 3.6, Math.atan2(uy, ux) + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
    if (b.revBoom) {
        // Đạn nổ (Evo 1): vầng đỏ nhấp nháy
        ctx.strokeStyle = `rgba(255, 80, 40, ${0.5 + 0.4 * Math.sin(Date.now() / 50)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx - ux * 2, hy - uy * 2, copper ? 6 : 4.5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
};
