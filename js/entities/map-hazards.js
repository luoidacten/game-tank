// ==========================================
// Hiểm họa của 2 map mới: Trường Lazer (laser_field) & Đồi Gió (wind_hill)
// + Sân Băng (ice_rink): quán tính di chuyển (mapIceStep)
// MapDirector là thực thể dữ liệu thuần trong bodyEffects -> host mô phỏng, guest chỉ vẽ (NET_CLASSES)
// ==========================================

const MAP_DIRECTOR_KINDS = ['laser_field', 'wind_hill'];

class MapDirector {
    constructor(kind) {
        this.kind = kind;
        this.active = true;
        this.t = 0;
        this.n = 0;            // số đợt đã phát
        this.lasers = [];      // laser_field: {x, delay, maxDelay, fire}
        this.ph = 'calm';      // wind_hill: calm | warn | gust
        this.pt = 0;           // tick trong pha
        this.dir = 1;          // hướng gió hiện tại / sắp tới
        this.force = 0;        // 0..1 (đã làm mượt)
    }
    update() {
        if (!this.active || gameState.phase !== 'playing') return;
        this.t++;
        if (this.kind === 'laser_field') this.updateLasers();
        else if (this.kind === 'wind_hill') this.updateWind();
    }
    // ----- Trường Lazer: cột lazer đứng, báo trước 0.9s, khoá cột ngắm rồi mới bắn -----
    updateLasers() {
        const FIRST = 240, EVERY = 220;
        if (this.t >= FIRST && (this.t - FIRST) % EVERY === 0) {
            const turn = this.n++;
            const targets = (turn % 3 === 2) ? [p1, p2] : [turn % 3 === 0 ? p1 : p2];
            targets.forEach(p => {
                if (!p || p.hp <= 0) return;
                const off = (Math.random() - 0.5) * 70; // lệch ngẫu nhiên để còn né được
                const x = Math.max(20, Math.min(canvas.width - 20, p.x + p.w / 2 + off));
                this.lasers.push({ x, delay: 54, maxDelay: 54, fire: 0 });
            });
        }
        for (const L of this.lasers) {
            if (L.delay > 0) {
                if (--L.delay === 0) {
                    L.fire = 14;
                    [p1, p2].forEach(p => {
                        if (p && p.hp > 0 && Math.abs(p.x + p.w / 2 - L.x) < 9 + p.w * 0.4) {
                            p.takeDamage(1, null, { isEnvironmental: true });
                        }
                    });
                }
            } else if (L.fire > 0) L.fire--;
        }
        this.lasers = this.lasers.filter(L => L.delay > 0 || L.fire > 0);
    }
    // ----- Đồi Gió: lặng 4s -> báo 1s (mũi tên hướng gió) -> gió giật 4s -----
    updateWind() {
        this.pt++;
        if (this.ph === 'calm' && this.pt > 240) { this.ph = 'warn'; this.pt = 0; this.dir = Math.random() < 0.5 ? -1 : 1; }
        else if (this.ph === 'warn' && this.pt > 60) { this.ph = 'gust'; this.pt = 0; }
        else if (this.ph === 'gust' && this.pt > 240) { this.ph = 'calm'; this.pt = 0; }
        const goal = this.ph === 'gust' ? 1 : 0;
        this.force += (goal - this.force) * 0.06;
        if (this.force < 0.02) { this.force = 0; return; }
        const f = this.force * this.dir;
        [p1, p2].forEach(p => {
            if (!p || p.hp <= 0) return;
            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + f * 0.9));
            for (const b of p.bullets) {
                if (b.isRaycast || b.noWind) continue;
                b.vx += f * 0.03;
                if (Math.abs(b.vx) > 3) b.vx = 3 * Math.sign(b.vx);
            }
        });
    }
    draw() {
        if (!this.active) return;
        if (this.kind === 'laser_field') this.drawLasers();
        else if (this.kind === 'wind_hill') this.drawWind();
    }
    drawLasers() {
        const H = canvas.height;
        for (const L of this.lasers) {
            ctx.save();
            if (L.delay > 0) {
                const k = 1 - L.delay / L.maxDelay;
                const blink = (Math.floor(L.delay / 4) % 2) ? 0.5 : 1;
                ctx.globalAlpha = 0.1 + 0.2 * k;
                ctx.fillStyle = '#ff2bd6';
                ctx.fillRect(L.x - 9, 0, 18, H);
                ctx.globalAlpha = blink;
                ctx.strokeStyle = '#ff6bff'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
                ctx.strokeRect(L.x - 9, 0, 18, H);
                ctx.setLineDash([]);
                ctx.fillStyle = '#fff'; ctx.font = "bold 14px 'Orbitron', Arial"; ctx.textAlign = 'center';
                ctx.fillText('⚠', L.x, H / 2 - 20 + Math.sin(L.delay * 0.5) * 3);
                ctx.strokeStyle = '#ff2bd6'; ctx.lineWidth = 2;
                [24, H - 24].forEach(y => { ctx.beginPath(); ctx.arc(L.x, y, 6 + 14 * (1 - k), 0, Math.PI * 2); ctx.stroke(); });
            } else {
                const a = L.fire / 14;
                ctx.globalAlpha = a;
                const w = 6 + 16 * a;
                ctx.shadowColor = '#ff2bd6'; ctx.shadowBlur = 24;
                ctx.fillStyle = '#ff2bd6';
                ctx.fillRect(L.x - w / 2, 0, w, H);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.fillRect(L.x - w / 6, 0, w / 3, H);
            }
            ctx.restore();
        }
    }
    drawWind() {
        const W = canvas.width, H = canvas.height;
        const warn = this.ph === 'warn', f = this.force;
        if (f < 0.03 && !warn) return;
        ctx.save();
        // vệt gió chạy ngang sân (xác định theo t, không có state)
        if (f > 0.03) {
            ctx.strokeStyle = 'rgba(220,255,235,0.8)'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 16; i++) {
                const y = (i * 53 + 20) % (H - 40) + 20;
                const sp = 6 + (i % 4) * 2;
                const x = (((i * 71 + this.t * sp * this.dir) % (W + 80)) + W + 80) % (W + 80) - 40;
                const len = 22 + (i % 3) * 10;
                ctx.globalAlpha = 0.15 + 0.4 * f;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - this.dir * len, y); ctx.stroke();
            }
        }
        // chỉ báo hướng gió ở giữa sân
        const cx = W / 2, cy = H / 2;
        const blink = warn ? ((Math.floor(this.pt / 6) % 2) ? 0.5 : 1) : 1;
        ctx.globalAlpha = (warn ? 0.9 : 0.25 + 0.65 * f) * blink;
        ctx.fillStyle = warn ? '#ffe36b' : '#b9ffd2';
        ctx.font = "bold 12px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.fillText(warn ? 'GIÓ SẮP GIẬT' : 'GIÓ GIẬT', cx, cy - 22);
        for (let i = 0; i < 3; i++) {
            const ax = cx + this.dir * (i - 1) * 26;
            ctx.beginPath();
            ctx.moveTo(ax - this.dir * 9, cy - 10); ctx.lineTo(ax + this.dir * 9, cy); ctx.lineTo(ax - this.dir * 9, cy + 10);
            ctx.lineTo(ax - this.dir * 4, cy); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
}

// Đảm bảo có đúng 1 MapDirector khớp map hiện tại (host/local; gọi mỗi tick)
function mapHazardEnsure() {
    const cm = gameState.currentMap;
    const need = MAP_DIRECTOR_KINDS.includes(cm) ? cm : null;
    let has = false;
    for (let i = bodyEffects.length - 1; i >= 0; i--) {
        const e = bodyEffects[i];
        if (!(e instanceof MapDirector)) continue;
        if (e.kind === need && !has) has = true; else bodyEffects.splice(i, 1);
    }
    if (need && !has) bodyEffects.push(new MapDirector(need));
}

// Sân Băng: trộn vận tốc để có quán tính (gọi quanh p.update())
function mapIceStep(prevX) {
    [p1, p2].forEach((p, i) => {
        if (!p || p.hp <= 0) return;
        const dx = p.x - prevX[i];
        let v = p.iceVx || 0;
        if (Math.abs(dx) > 12) { p.iceVx = 0; return; } // dịch chuyển / hất tung: giữ nguyên
        v = v * 0.88 + dx * 0.12;
        if (Math.abs(v) < 0.05) v = 0;
        let nx = prevX[i] + v;
        if (nx < 0) { nx = 0; v = 0; }
        if (nx > canvas.width - p.w) { nx = canvas.width - p.w; v = 0; }
        p.x = nx; p.iceVx = v;
    });
}
