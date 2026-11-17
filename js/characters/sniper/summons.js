// ==========================================
// Sniper (sniper) — Vật triệu hồi / thực thể riêng
// ==========================================

// Thêm biến mảng global này cùng chỗ với turrets, iceZones...
const SNIPER_WALL_DECAY_DELAY = 300;   // 5s đầu tường chưa tự mất máu
const SNIPER_WALL_DECAY_TICKS = 180;   // sau đó mất hết máu trong 3s (nhanh hơn trước: 10s)
const SNIPER_WALL_INVULN = 120;        // Full Evo: bất tử 2s đầu

class SniperWall {
    constructor(x, y, owner, isMoving = false) {
        // [Full Evo] Tường dài hơn & cứng hơn (chỉ áp dụng tường tự đặt)
        this.isFullEvo = !isMoving && !!owner && hasLegacyFullEvo(owner, 'sniper');
        this.w = this.isFullEvo ? 92 : 60; this.h = this.isFullEvo ? 22 : 20;
        this.x = x - (this.w - 60) / 2; this.y = y;
        if (this.isFullEvo) this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
        this.owner = owner;
        this.isMoving = isMoving;
        this.vx = isMoving ? 1.5 : 0;
        this.dir = Math.random() > 0.5 ? 1 : -1;

        // [CẬP NHẬT] Tường di chuyển sẽ là Tường Bất Tử
        this.isImmortal = isMoving;

        let hpMultiplier = this.isFullEvo ? 7 : (owner.hasUpgrade('evo_sniper_1') ? 5 : 3);
        this.maxHp = owner.maxHp * hpMultiplier;
        this.hp = this.maxHp;
        this.active = true;
        this.age = 0;            // tick tồn tại
        this.hitFlash = 0;       // nháy khi chặn đạn/tia

        // Tường đứng yên: 5s đầu không mất máu, sau đó mất nhanh (3s). Full Evo: không tự mất máu.
        this.decayRate = this.maxHp / SNIPER_WALL_DECAY_TICKS;
    }

    isInvuln() { return !!this.isFullEvo && this.age < SNIPER_WALL_INVULN; }

    update() {
        this.age++;
        if (this.hitFlash > 0) this.hitFlash--;
        // Full Evo: bất tử 2s đầu (kể cả các đòn trừ máu trực tiếp từ body khác)
        if (this.isInvuln()) { this.hp = this.maxHp; this.active = true; }
        if (!this.active) return;

        // Chỉ tường do người chơi đặt (đứng yên, chưa Full Evo) mới tự mất máu, sau 5s đầu
        if (!this.isImmortal && !this.isFullEvo && this.age > SNIPER_WALL_DECAY_DELAY) {
            this.hp -= this.decayRate;
            if (this.hp <= 0) {
                this.active = false;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, this.owner));
            }
        }

        if (this.isMoving) {
            this.x += this.vx * this.dir;
            if (this.x <= 0 || this.x + this.w >= canvas.width) this.dir *= -1;
        }
    }

    // Nhận sát thương từ đạn / tia địch. Trả về true nếu tường vỡ.
    takeHit(dmg, attacker) {
        if (!this.active) return false;
        this.hitFlash = 8;
        if (this.isImmortal || this.isInvuln()) return false;
        this.hp -= Math.max(0, dmg || 0);
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, attacker || null));
            return true;
        }
        return false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        // Đổi màu tường bất tử sang màu xám để dễ phân biệt, tường tự đặt thì có màu của phe
        const side = (this.owner && this.owner.id === 1) ? '52, 152, 219' : '231, 76, 60';
        if (this.isImmortal) {
            ctx.fillStyle = "rgba(149, 165, 166, 0.9)"; // Màu xám kim loại
        } else {
            ctx.fillStyle = `rgba(${side}, 0.7)`;
        }
        if (this.isFullEvo) { ctx.shadowBlur = 14; ctx.shadowColor = `rgb(${side})`; }
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Full Evo: khung thép kép + vạch chéo
        if (this.isFullEvo) {
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6);
            ctx.beginPath();
            for (let xx = this.x + 8; xx < this.x + this.w - 8; xx += 12) { ctx.moveTo(xx, this.y + this.h - 4); ctx.lineTo(xx + 6, this.y + 4); }
            ctx.stroke();
        }
        // Lá chắn bất tử 2s đầu (Full Evo)
        if (this.isInvuln()) {
            const k = 1 - this.age / SNIPER_WALL_INVULN;
            ctx.strokeStyle = `rgba(255, 235, 59, ${0.4 + 0.5 * k})`; ctx.lineWidth = 2.5;
            ctx.shadowBlur = 12; ctx.shadowColor = '#ffeb3b';
            ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            ctx.shadowBlur = 0;
        }
        // Nháy trắng khi chặn đạn / tia
        if (this.hitFlash > 0) {
            ctx.fillStyle = `rgba(255,255,255,${this.hitFlash / 12})`;
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }

        // Chỉ vẽ thanh máu cho tường có thể phá hủy (tường tự đặt)
        if (!this.isImmortal) {
            ctx.fillStyle = "red"; ctx.fillRect(this.x, this.y - 5, this.w, 3);
            ctx.fillStyle = "#0f0"; ctx.fillRect(this.x, this.y - 5, this.w * Math.max(0, this.hp / this.maxHp), 3);
            // Vạch báo thời gian trước khi tường bắt đầu tự mục (5s)
            if (!this.isFullEvo && this.age < SNIPER_WALL_DECAY_DELAY) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fillRect(this.x, this.y + this.h + 2, this.w * (1 - this.age / SNIPER_WALL_DECAY_DELAY), 2);
            }
        }
        ctx.restore();
    }
}

// ==========================================
// Tường Sniper chặn MỌI đòn của đối thủ (kể cả hitscan & đạn xuyên)
// ------------------------------------------
// sniperWallBlockY(attacker, x, fromY, dirY, halfW, dmg):
//   tia dọc cột x (rộng 2*halfW) bắn từ fromY theo hướng dirY (-1 lên / +1 xuống).
//   Trả về tường Sniper gần nhất chặn tia (bỏ qua tường phe của attacker), hoặc null.
//   Nếu dmg > 0 -> tường nhận luôn sát thương đó. Điểm dừng tia: sniperWallStopY(wall, dirY).
// sniperWallClipBeam(attacker, bx, by, bw, bh, dirY, dmg): như trên cho tia hình chữ nhật,
//   trả về null hoặc { wall, y, h } = hình chữ nhật tia đã bị cắt tại tường.
// ==========================================
function sniperTeamOf(attacker) {
    if (!attacker) return null;
    if (attacker.owner && attacker.owner.bullets) return attacker.owner; // ụ súng, tia... -> chủ
    return attacker;
}
function sniperWallBlockY(attacker, x, fromY, dirY, halfW = 0, dmg = 0) {
    const team = sniperTeamOf(attacker);
    // Khiên Thép của Kẻ Sáng Tạo cũng chặn tia/hitscan của đối thủ như tường
    const blockers = (typeof sniperWalls !== 'undefined' ? sniperWalls : []).slice();
    [typeof p1 !== 'undefined' ? p1 : null, typeof p2 !== 'undefined' ? p2 : null].forEach(pl => {
        if (pl && pl.creatorShield && pl.creatorShield.active && pl !== team && typeof pl.creatorShield.x === 'number') blockers.push(pl.creatorShield);
    });
    if (!blockers.length) return null;
    let best = null, bestD = Infinity;
    for (const w of blockers) {
        if (!w || !w.active || (team && w.owner === team)) continue;
        if (x + halfW < w.x || x - halfW > w.x + w.w) continue;
        const near = dirY < 0 ? w.y + w.h : w.y;
        const d = (near - fromY) * dirY; // khoảng cách theo hướng tia
        if (d < -w.h) continue;          // tường ở sau lưng
        if (d < bestD) { bestD = d; best = w; }
    }
    if (best) {
        if (dmg > 0 && typeof best.takeHit === 'function') best.takeHit(dmg, team);
        else best.hitFlash = 8;
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(Math.max(best.x, Math.min(best.x + best.w, x)), sniperWallStopY(best, dirY), '#e0f7ff', 8);
    }
    return best;
}
function sniperWallStopY(w, dirY) { return dirY < 0 ? w.y + w.h : w.y; }
function sniperWallClipBeam(attacker, bx, by, bw, bh, dirY, dmg = 0) {
    const fromY = dirY < 0 ? by + bh : by;
    const w = sniperWallBlockY(attacker, bx + bw / 2, fromY, dirY, bw / 2, dmg);
    if (!w) return null;
    const stop = sniperWallStopY(w, dirY);
    return dirY < 0 ? { wall: w, y: stop, h: Math.max(0, fromY - stop) } : { wall: w, y: fromY, h: Math.max(0, stop - fromY) };
}
