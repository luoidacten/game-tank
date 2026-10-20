// ==========================================
// Cuồng Phong (storm) — Vật triệu hồi / thực thể riêng
// ==========================================


class StormSlash {
    constructor(x, y, radius, dmg, owner, isVacuum) {
        this.x = x; this.y = y;
        this.r = 10;
        this.maxR = radius;
        this.dmg = dmg;
        this.owner = owner;
        this.active = true;
        this.isVacuum = isVacuum; // Hiệu ứng hút của Evo 1
        this.hitTargets = [];
        this.color = (owner.id === 1) ? "rgba(0, 255, 255," : "rgba(255, 69, 0,";
    }

    update() {
        if (!this.active) return;
        this.r += (this.maxR / 10); // Tốc độ mở rộng vòng chém
        if (this.r >= this.maxR) this.active = false;

        // 1. XỬ LÝ VA CHẠM ĐỊCH (P1/P2)
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (!this.gmTw && typeof gmTwinAlso === 'function' && gmTwinAlso(enemy, t => Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r, this.dmg, this.owner)) this.gmTw = true; // Gemini: Bản Sao AI
        if (!this.hitTargets.includes(enemy)) {
            let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
            if (d < this.r) {
                enemy.takeDamage(this.dmg, this.owner);

                // Hiệu ứng Hút (Evo 1) - Chỉ hút theo trục ngang (X)
                if (this.isVacuum) {
                    let dx = this.x - (enemy.x + enemy.w / 2);
                    let dirX = (dx >= 0 ? 1 : -1);
                    enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * Math.min(Math.abs(dx), 60)));
                }
                this.hitTargets.push(enemy);
            }
        }

        // 2. [FIX] XỬ LÝ VA CHẠM XE TIỀN (MONEY TRUCK)
        moneyTrucks.forEach(t => {
            if (t.active && !this.hitTargets.includes(t)) {
                let d = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                // Cho phép chém trúng xe tiền dễ hơn chút (tăng range va chạm)
                if (d < this.r + 10) {
                    let finalDmg = this.dmg;
                    // Xe tiền chịu nhiều sát thương hơn từ kỹ năng
                    t.hp -= finalDmg * 2;

                    // Tạo hiệu ứng nổ nhỏ khi chém trúng
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 40, 'rgba(255,165,0,', 0, this.owner));

                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30;
                        if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.owner.weapon === 'evolution') this.owner.onEvolutionCrateEat('truck');
                        // Nổ lớn khi xe chết
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this.owner));
                    }
                    this.hitTargets.push(t); // Đánh dấu đã chém xe này (để không trừ máu liên tục mỗi frame)
                }
            }
        });

        // 3. [FIX] XỬ LÝ VA CHẠM THÙNG TIẾP TẾ (CRATES)
        crates.forEach(c => {
            if (c.active) {
                let d = Math.hypot(this.x - (c.x + c.w / 2), this.y - (c.y + c.h / 2));
                if (d < this.r) {
                    c.active = false; // Phá thùng ngay lập tức
                    crateOnBreak(c, this.owner);
                    if (c.isMimic) {
                        triggerMimicExplosion(c, this.owner);
                    }

                    // Logic nhận quà cho người chém
                    if (c.type === 'hp') {
                        if (this.owner.weapon === 'necromancer') {
                            let cap = this.owner.maxSouls - (this.owner.lockedSouls || 0);
                            this.owner.currentSouls = Math.min(cap, (this.owner.currentSouls || 0) + 4);
                            if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.owner.hp = Math.min(this.owner.hp + 1, this.owner.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.owner.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.owner.shield++;
                    if (c.type === 'dmg') this.owner.dmgBuff++;
                    if (this.owner.weapon === 'evolution') this.owner.onEvolutionCrateEat(c.type);
                    if (c.type === 'coin') {
                        let money = 30; if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                    if (c.type === 'gear') {
                        this.owner.ammo = Math.min(this.owner.maxAmmo, this.owner.ammo + 1);
                        this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + 0.25);
                        if (this.owner.weapon === 'genius') {
                            if (this.owner.isPilotingMecha) {
                                if (this.owner.mechaHp < this.owner.mechaMaxHp) {
                                    this.owner.mechaHp = Math.min(this.owner.mechaMaxHp, this.owner.mechaHp + 0.5);
                                    if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.owner.mechaVirtualArmor = (this.owner.mechaVirtualArmor || 0) + 0.5;
                                    if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.owner.gears = (this.owner.gears || 0) + 1;
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    if (this.owner.weapon === 'genius' && c.type !== 'gear') {
                        if (this.owner.isPilotingMecha) {
                            if (this.owner.mechaHp < this.owner.mechaMaxHp) {
                                this.owner.mechaHp = Math.min(this.owner.mechaMaxHp, this.owner.mechaHp + 0.5);
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.owner.mechaVirtualArmor = (this.owner.mechaVirtualArmor || 0) + 0.5;
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.owner.gears = (this.owner.gears || 0) + 1;
                            if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.owner.components = (this.owner.components || 0) + 0.5;
                        if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }

                    // Hiệu ứng nổ thùng
                    if (c.type === 'boom') explosions.push(new Explosion(c.x, c.y, 60, 'rgba(255,0,0,', 0, this.owner));
                    else explosions.push(new Explosion(c.x, c.y, 30, 'rgba(255,255,255,', 0, this.owner));
                }
            }
        });
    }

    draw() {
        if (!this.active) return;
        // Chém tròn: 3 lưỡi gió hình lưỡi liềm xoay quanh tâm, vệt mờ dần phía sau
        const k = Math.min(1, this.r / this.maxR);
        const spin = (this.r / this.maxR) * Math.PI * 2.2;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.18 * (1 - k * 0.5);
        ctx.fillStyle = `${this.color} 1)`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        // Xoắn ốc gió bên trong + lõi sáng
        for (let a = 0; a < 5; a++) {
            const base = a * Math.PI * 2 / 5 - spin * 1.4;
            ctx.globalAlpha = 0.45 * (1 - k * 0.6);
            ctx.strokeStyle = a % 2 ? '#ffffff' : `${this.color} 1)`; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= 10; i++) {
                const f = i / 10, rr = this.r * (0.1 + f * 0.75), th = base + f * 2.4;
                const x = this.x + Math.cos(th) * rr, y = this.y + Math.sin(th) * rr;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        const cg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 0.4);
        cg.addColorStop(0, `rgba(255,255,255,${0.6 * (1 - k)})`); cg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 0.4, 0, Math.PI * 2); ctx.fill();
        // Hút (Evo 1): vệt gió dồn vào tâm
        if (this.isVacuum) {
            for (let i = 0; i < 10; i++) {
                const th = i * 0.628 + spin * 0.5, r1 = this.maxR * (1.15 - k * 0.5), r2 = r1 * 0.7;
                ctx.globalAlpha = 0.55; ctx.strokeStyle = '#ccfbf1'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(this.x + Math.cos(th) * r1, this.y + Math.sin(th) * r1); ctx.lineTo(this.x + Math.cos(th + 0.25) * r2, this.y + Math.sin(th + 0.25) * r2); ctx.stroke();
            }
        }
        // Mảnh vụn văng ra theo vòng chém
        for (let i = 0; i < 12; i++) {
            const th = i * 0.5236 + spin * 0.8, rr = this.r * (0.9 + (i % 3) * 0.08);
            ctx.globalAlpha = 0.8 * (1 - k * 0.5); ctx.fillStyle = i % 2 ? '#e2e8f0' : `${this.color} 1)`;
            ctx.fillRect(this.x + Math.cos(th) * rr - 1.5, this.y + Math.sin(th) * rr - 1.5, 3, 3);
        }
        for (let b = 0; b < 3; b++) {
            const head = spin + b * (Math.PI * 2 / 3);
            for (let i = 0; i < 6; i++) {
                const f = i / 6;
                ctx.globalAlpha = (0.15 + 0.85 * f) * (1 - k * 0.35);
                ctx.strokeStyle = i === 5 ? '#ffffff' : `${this.color} 1)`;
                ctx.lineWidth = 3 + 7 * f;
                ctx.shadowBlur = 12; ctx.shadowColor = `${this.color} 1)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * (0.82 + 0.18 * f), head - 1.2 + f * 0.9, head - 1.2 + f * 0.9 + 0.32);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// ---------- Entity: kết liễu CUỒNG PHONG / THIÊN PHONG (Full Evo) — dữ liệu thuần ----------
class StFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.full = !!(owner.hasUpgrade && owner.hasUpgrade('evo_storm_1') && owner.hasUpgrade('evo_storm_2'));
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = this.full ? 170 : 140; this.active = true;
    }
    update() {
        this.t++;
        const o = this.team === 1 ? p1 : p2;
        if (!this.full) {
            if (this.t === 12 || this.t === 50) triggerScreenShake(7, 12);
        } else if (this.t >= 20 && this.t < 120 && (this.t - 20) % 12 === 0) {
            // sét giáng vào mắt bão
            triggerScreenShake(9, 8);
            explosions.push(new Explosion(this.x, this.y, 34, 'rgba(167, 139, 250,', 0, o));
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof stDrawFinisherOver === 'function') stDrawFinisherOver(this); }
}
