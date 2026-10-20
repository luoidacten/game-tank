// ==========================================
// paradox (paradox) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

// ------------------------------------------
// VẾT NỨT THỜI GIAN (thực thể bodyEffects, dữ liệu thuần -> đồng bộ online)
// ------------------------------------------
class PdxRift {
    constructor(owner, cx, cy) {
        this.owner = owner; this.x = cx; this.y = cy;
        this.t = 0; this.life = PDX_RIFT_LIFE;
        this.fireIn = 0; this.cd = 0; this.flash = 0;
        this.seed = Math.floor(Math.random() * 1000);
        this.active = true;
    }
    update() {
        this.t++;
        if (this.cd > 0) this.cd--;
        if (this.flash > 0) this.flash--;
        const o = this.owner;
        if (!o || o.weapon !== 'paradox') { this.active = false; return; }
        if (this.fireIn > 0 && --this.fireIn === 0 && o.hp > 0) {
            const full = o.hasUpgrade('evo_paradox_1') && o.hasUpgrade('evo_paradox_2');
            const dirY = o.id === 1 ? -1 : 1;
            o.bullets.push({
                type: 'normal', x: this.x - 2.5, y: this.y + dirY * 18 - 2.5, w: 5, h: 5,
                vx: 0, vy: dirY * C.bulletSpeed, dmg: o.damage * (full ? 0.5 : 0.25),
                owner: o, bounceCount: 0, hitIds: [], isPiercing: false, pdxRift: true
            });
            this.flash = 12;
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x, this.y + dirY * 16, '#00f0ff', 6);
        }
        if (this.t >= this.life && this.fireIn <= 0) this.active = false;
    }
    draw() {
        const t = this.t;
        let a = Math.min(1, t / 10) * Math.min(1, (this.life - t) / 60);
        if (a <= 0) return;
        const charging = this.fireIn > 0;
        const k = charging ? 1 - this.fireIn / 12 : 0;
        const H = 36, x = this.x, y = this.y;
        const jit = (i) => { const v = Math.sin(this.seed * 1.37 + i * 2.9) * 4 + Math.sin(t * 0.25 + i) * (charging ? 1.6 : 0.6); return v; };
        const pts = [];
        const N = 7;
        for (let i = 0; i <= N; i++) pts.push([x + (i === 0 || i === N ? 0 : jit(i)), y - H / 2 + H * i / N]);
        ctx.save();
        ctx.globalAlpha = a;
        // quầng tối của khe nứt
        const g = ctx.createRadialGradient(x, y, 1, x, y, 22);
        g.addColorStop(0, 'rgba(0,240,255,' + (0.28 + 0.4 * k) + ')'); g.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 14 + 6 * k, 24, 0, 0, Math.PI * 2); ctx.fill();
        // khe nứt: viền cyan + lõi trắng
        const path = () => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); };
        ctx.lineJoin = 'miter';
        ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 12 + 10 * k + this.flash;
        ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 4 + 2 * k; path(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; path(); ctx.stroke();
        // nhánh nứt nhỏ
        ctx.strokeStyle = 'rgba(160,240,255,0.8)'; ctx.lineWidth = 1;
        for (let i = 2; i < N - 1; i += 2) {
            const p = pts[i], s = (i % 4 ? 1 : -1);
            ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + s * 6, p[1] - 3); ctx.lineTo(p[0] + s * 9, p[1] - 1); ctx.stroke();
        }
        // kim đồng hồ quay ngược nhỏ ở tâm
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
        const ang = -t * 0.15;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * 4, y + Math.sin(ang) * 4); ctx.stroke();
        // cảnh báo tụ sáng: vòng co lại + vạch hướng bắn
        if (charging && this.owner) {
            const dirY = this.owner.id === 1 ? -1 : 1;
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * k) + ')'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, 22 * (1 - k) + 6, 0, Math.PI * 2); ctx.stroke();
            const lg = ctx.createLinearGradient(x, y, x, y + dirY * 140);
            lg.addColorStop(0, 'rgba(0,240,255,' + (0.45 * k) + ')'); lg.addColorStop(1, 'rgba(0,240,255,0)');
            ctx.strokeStyle = lg; ctx.lineWidth = 3; ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(x, y + dirY * 18); ctx.lineTo(x, y + dirY * 140); ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    }
}

Object.assign(Player.prototype, {
    // [draw] paradox
    drawParadox() {
        if (this.weapon === 'paradox') {
            const drawTether = (x1, y1, x2, y2, color) => {
                ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.restore();
            };
            const enemy = (this.id === 1) ? p2 : p1;
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2');

            // 1. VẼ BÓNG BẢN THÂN (3 GIÂY TRƯỚC)
            if (this.paradoxHistory && this.paradoxHistory.length > 0) {
                let pShadow = this.paradoxHistory[0];
                ctx.save();
                if (!((typeof coreSmallArtAt === 'function') && coreSmallArtAt(this, pShadow.x, pShadow.y, 0.4, '#00ffff'))) {
                    ctx.globalAlpha = 0.4;
                    ctx.fillStyle = "cyan";
                    ctx.fillRect(pShadow.x, pShadow.y, this.w, this.h);
                }
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 10px Arial";
                ctx.fillText("3s", pShadow.x + this.w / 2, pShadow.y - 5);
                ctx.restore();
                drawTether(this.x + this.w / 2, this.y + this.h / 2, pShadow.x + this.w / 2, pShadow.y + this.h / 2, "rgba(0, 255, 255, 0.3)");
            }

            // 2. VẼ UI TỤ LỰC: vạch các mốc, mốc đang đạt sáng lên
            const m = this.paradoxMilestones();
            const marks = [];
            if (this.paradoxCooldown <= 0) marks.push({ t: m.rewind, label: this.paradoxAnchor ? 'VỀ NEO' : 'TUA NGƯỢC', color: 'cyan' });
            if (m.pull) marks.push({ t: m.pull, label: 'KÉO ĐỊCH', color: 'magenta' });
            if (m.anchor) marks.push({ t: m.anchor, label: 'ĐẶT NEO', color: '#88aaff' });
            if (this.paradoxCharge > 0 && marks.length) {
                const maxT = marks[marks.length - 1].t;
                const fillRatio = Math.min(this.paradoxCharge / maxT, 1);
                let cur = null;
                for (const mk of marks) if (this.paradoxCharge >= mk.t) cur = mk;
                // Thanh tụ ở hàng phụ của HUD chung (không đè thanh máu), vạch trắng = các mốc
                const bar = hudExtraBar(this, 0, fillRatio, cur ? cur.color : 'rgba(200,200,200,0.8)', { h: 4, marks: marks.map(mk => mk.t / maxT) });
                if (cur) {
                    ctx.font = "700 9px 'Rajdhani', Arial"; ctx.fillStyle = cur.color === 'cyan' ? '#a5f3fc' : '#ffffff';
                    ctx.shadowBlur = 4; ctx.shadowColor = cur.color;
                    hudText(bar.F, cur.label, 0, hudNearD(this, 18));
                    ctx.shadowBlur = 0;
                }
            }

            // Vẽ hồi chiêu
            if (this.paradoxCooldown > 0) {
                let maxCd = this.hasUpgrade('evo_paradox_2') ? 420 : 720;
                hudExtraBar(this, this.paradoxCharge > 0 ? 0.9 : 0, this.paradoxCooldown / maxCd, '#94a3b8', { h: 2, glow: 0 });
            }
            if (this.paradoxAnchorCD > 0) {
                hudExtraBar(this, 0, this.paradoxAnchorCD / 1200, '#5566aa', { h: 2, glow: 0, d: hudNearD(this, 3, 2) });
            }

            // NEO THỜI KHÔNG
            if (this.paradoxAnchor) {
                const a = this.paradoxAnchor;
                ctx.save();
                ctx.globalAlpha = 0.35 + 0.25 * Math.sin(Date.now() / 150);
                ctx.strokeStyle = '#88aaff'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
                ctx.strokeRect(a.x, a.y, this.w, this.h);
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#88aaff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
                ctx.fillText(`⚓ ${Math.ceil(a.timer / 60)}s`, a.x + this.w / 2, a.y - 5);
                ctx.restore();
                drawTether(this.x + this.w / 2, this.y + this.h / 2, a.x + this.w / 2, a.y + this.h / 2, "rgba(136, 170, 255, 0.4)");
            }

            // 2. VẼ BÓNG ĐỨNG YÊN CỦA ĐỊCH (EVO 1 - DẤU ẤN)
            if (this.enemyStationaryShadow) {
                ctx.save();
                const sh = this.enemyStationaryShadow;
                if (!((typeof coreSmallArtAt === 'function') && coreSmallArtAt(enemy, sh.x + (this.w - enemy.w) / 2, sh.y + (this.h - enemy.h) / 2, 0.6, '#ff00ff'))) {
                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = "magenta";
                    ctx.fillRect(sh.x, sh.y, this.w, this.h);
                }
                ctx.globalAlpha = 0.6;

                // Viền nhấp nháy cho bóng điểm đánh dấu
                ctx.strokeStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? "white" : "magenta";
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.strokeRect(this.enemyStationaryShadow.x - 2, this.enemyStationaryShadow.y - 2, this.w + 4, this.h + 4);

                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "bold 10px Arial";
                ctx.fillText("MARK", this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y - 5);
                ctx.restore();

                // Vẽ dây nối từ Địch tới Điểm Đánh Dấu
                drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y + this.h / 2, "rgba(255, 0, 255, 0.4)");
            }

            // 3. VẼ BÓNG 5 GIÂY CỦA ĐỊCH (FULL EVO)
            // Chỉ vẽ dây nối nếu Địch chưa bị dính Bóng Đứng Yên (ưu tiên Bóng Đứng Yên)
            if (this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2') && this.enemyHistory && this.enemyHistory.length > 0) {
                let eShadow = this.enemyHistory[0];

                ctx.save();
                if (!((typeof coreSmallArtAt === 'function') && coreSmallArtAt(enemy, eShadow.x, eShadow.y, 0.3, '#a020f0'))) {
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = enemy.color; // Bóng màu của địch
                    ctx.fillRect(eShadow.x, eShadow.y, this.w, this.h);
                }
                ctx.globalAlpha = 0.3;

                ctx.strokeStyle = "purple";
                ctx.lineWidth = 2;
                ctx.strokeRect(eShadow.x, eShadow.y, this.w, this.h);
                ctx.restore();

                // Nối dây nếu địch chưa bị Mark
                if (!this.enemyStationaryShadow) {
                    drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, eShadow.x + this.w / 2, eShadow.y + this.h / 2, "rgba(128, 0, 128, 0.3)");
                }
            }
        }
    }
});
