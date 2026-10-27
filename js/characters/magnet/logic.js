// ==========================================
// magnet (magnet) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    toggleMagnetPolarity() {
        this.magnetPolarity = (this.magnetPolarity === 1) ? -1 : 1;
        let isFullEvo = hasFullEvo(this, 'magnet');
        if (typeof spawnSparkParticles === 'function') {
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, this.magnetPolarity === 1 ? '#ff3300' : '#00aaff', 16);
        }
        if (typeof addFloatingText === 'function') {
            addFloatingText(this.x + this.w / 2, this.y - 15, this.magnetPolarity === 1 ? "ĐẢO CỰC (+)" : "ĐẢO CỰC (-)", this.magnetPolarity === 1 ? "#ff3300" : "#00aaff", 14);
        }
        if (isFullEvo) {
            let enemy = (this.id === 1) ? p2 : p1;
            let edx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            let dirX = (edx >= 0 ? 1 : -1);
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * 45));
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 65, 'rgba(0, 255, 255,', 0, this));
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    fireMagnetBullet() {
        let dirY = (this.id === 1) ? -1 : 1;
        let bSpeed = C.bulletSpeed;
        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
        this.bullets.push({
            x: this.x + this.w / 2 - 4,
            y: (this.id === 1) ? this.y - 8 : this.y + this.h,
            w: 8, h: 8,
            vx: 0,
            vy: dirY * bSpeed,
            dmg: this.damage,
            owner: this,
            isMagnetBullet: true,
            polarity: this.magnetPolarity || 1,
            isPiercing: false,
            hitIds: [],
            bounceCount: 0
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    },

    // [setupForNewRound] magnet
    setupMagnet() {
        if (this.weapon === 'magnet') {
            this.magnetPolarity = 1; // 1 = Dương (+), -1 = Âm (-)
            this.magnetHoldFrames = 0;
            this.isPolarDashing = false;
            this.polarDashTarget = null;
            this.polarDashKind = null;   // 'node' (Cột Từ Trường) | 'enemy' (kẻ địch mang Ấn Từ)
            this.polarDashPhase = 0;     // 1 = lao tới, 2 = bay về
            this.polarDashHomeX = 0;
            this.polarDashHomeY = 0;
            this.polarDashMX = 0; this.polarDashMY = 0; // điểm va chạm giữa sân (kiểu 'enemy')
            this.polarDashHit = false;
            this.polarDashCd = 0;
            this.polarDashT = 0;
            // Xoá trạng thái từ tính còn sót trên đối thủ từ hiệp trước
            const enemy = (this.id === 1) ? p2 : p1;
            if (enemy) magnetClearStatus(enemy);
            magnetClearStatus(this);
        }
    },

    // Tìm mục tiêu KHÁC CỰC ở phía trước: Cột Từ Trường CỦA MÌNH hoặc kẻ địch mang ẤN TỪ
    // (Nhiễm Từ do chạm vùng từ trường KHÔNG đủ điều kiện)
    findPolarDashTarget() {
        const cx = this.x + this.w / 2;
        const range = MAG_DASH_RANGE;
        const fwd = (y) => (this.id === 1) ? (y < this.y) : (y > this.y + this.h);
        let best = null, bestDx = 1e9, kind = null;
        const enemy = (this.id === 1) ? p2 : p1;
        if (enemy && enemy.hp > 0 && enemy.magSealTimer > 0 && enemy.magSealPol && enemy.magSealPol !== this.magnetPolarity && !enemy.magPullPhase) {
            const dx = Math.abs(enemy.x + enemy.w / 2 - cx);
            if (dx <= range) { best = enemy; bestDx = dx - 20; kind = 'enemy'; } // ưu tiên kẻ địch
        }
        if (typeof magnetNodes !== 'undefined') for (const m of magnetNodes) {
            if (!m.active || m.owner !== this || m.polarity === this.magnetPolarity || !fwd(m.y)) continue;
            const dx = Math.abs(m.x - cx);
            if (dx <= range && dx < bestDx) { best = m; bestDx = dx; kind = 'node'; }
        }
        return best ? { t: best, kind } : null;
    },

    startPolarDash(found) {
        this.isPolarDashing = true;
        this.polarDashTarget = found.t;
        this.polarDashKind = found.kind;
        this.polarDashPhase = 1;
        this.polarDashHomeX = Math.max(0, Math.min(canvas.width - this.w, this.x));
        this.polarDashHomeY = (this.id === 1) ? canvas.height - this.h - 22 : 20;
        this.polarDashHit = false;
        this.polarDashT = 0;
        this.polarDashCd = MAG_DASH_CD;
        this.magnetHoldFrames = 0;
        if (found.kind === 'enemy') {
            const e = found.t;
            const eHomeY = (e.id === 1) ? canvas.height - e.h - 22 : 20;
            // Điểm gặp: giữa hai làn, trung điểm theo phương ngang
            this.polarDashMX = Math.max(30, Math.min(canvas.width - 30, ((this.x + this.w / 2) + (e.x + e.w / 2)) / 2));
            this.polarDashMY = ((this.polarDashHomeY + this.h / 2) + (eHomeY + e.h / 2)) / 2;
            e.magPullPhase = 1;
            e.magPullT = 0;
            e.magPullHX = Math.max(0, Math.min(canvas.width - e.w, e.x));
            e.magPullHY = eHomeY;
            e.magPullMX = this.polarDashMX;
            e.magPullMY = this.polarDashMY;
            e.magPullBy = this.id;
            e.magSealTimer = 0; e.magSealPol = 0; // tiêu hao Ấn Từ
            addFloatingText(e.x + e.w / 2, e.y - 15, "BỊ HÚT! 🧲", "#ffffff", 13);
        }
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, found.kind === 'enemy' ? "TỪ CỰC VA CHẠM! 🧲💥" : "LƯỚT CỰC TÍNH! 🧲💨", "#00ffff", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
    },

    // Kết thúc pha lao tới Cột: nổ từ tính tại cột, rồi bay về
    polarDashImpact(x, y) {
        let dmg = this.hasUpgrade('evo_mag_net_1') ? 2.0 : 1.0;
        let radius = 60;
        explosions.push(new Explosion(x, y, radius, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', 0, this));
        let enemy = (this.id === 1) ? p2 : p1;
        if (!this.polarDashHit && enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - x, (enemy.y + enemy.h / 2) - y) <= radius + enemy.w / 2) {
            this.polarDashHit = true;
            enemy.takeDamage(dmg, this);
        }
        triggerScreenShake(5, 8);
        this.polarDashPhase = 2;
    },

    // Va chạm GIỮA SÂN với kẻ địch mang Ấn Từ
    polarClashImpact(enemy) {
        const full = hasFullEvo(this, 'magnet');
        const dmg = this.hasUpgrade('evo_mag_net_1') ? 2.0 : 1.5;
        const x = ((this.x + this.w / 2) + (enemy.x + enemy.w / 2)) / 2, y = ((this.y + this.h / 2) + (enemy.y + enemy.h / 2)) / 2;
        const col = this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,';
        explosions.push(new Explosion(x, y, full ? 85 : 65, col, 0, this));
        explosions.push(new Explosion(x, y, 35, 'rgba(255, 255, 255,', 0, this));
        if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(x, y, '#ff4422', 14); spawnSparkParticles(x, y, '#1ea7ff', 14); }
        if (enemy.hp > 0) enemy.takeDamage(dmg, this);
        addFloatingText(x, y - 26, "VA CHẠM TỪ CỰC! 💥", "#ffffff", 16);
        triggerScreenShake(10, 16);
        if (soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
        this.polarDashHit = true;
        this.polarDashPhase = 2;
        if (enemy.magPullPhase === 1) { enemy.magPullPhase = 2; }
    },

    // Va chạm khi đang lao tới Cột (giống xe TANK): húc địch 1 lần, phá thùng đồ
    polarDashCollide() {
        let enemy = (this.id === 1) ? p2 : p1;
        if (!this.polarDashHit && enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            this.polarDashHit = true;
            let dmg = this.hasUpgrade('evo_mag_net_1') ? 1.5 : 1.0;
            enemy.takeDamage(dmg, this);
            enemy.kbX = ((enemy.x + enemy.w / 2) >= (this.x + this.w / 2) ? 1 : -1) * 6;
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 50, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', 0, this));
            triggerScreenShake(6, 10);
        }
        if (typeof crates !== 'undefined') {
            for (let c of crates) {
                if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    crateOnBreak(c, this);
                    if (typeof grantCrateLoot === 'function') grantCrateLoot(c, this);
                    break;
                }
            }
        }
    },

    endPolarDash() {
        this.x = Math.max(0, Math.min(canvas.width - this.w, this.polarDashHomeX));
        this.y = this.polarDashHomeY;
        this.isPolarDashing = false;
        this.polarDashPhase = 0;
        this.polarDashTarget = null;
    },

    // [update] magnet — trả về true nếu cần dừng update() (đang Lướt Cực Tính)
    updateMagnet() {
        if (this.weapon === 'magnet') {
            if (this.polarDashCd > 0) this.polarDashCd--;
            if (this.isPolarDashing) {
                let t = this.polarDashTarget;
                let dir = (this.id === 1) ? -1 : 1;
                let cx = this.x + this.w / 2;
                const enemy = (this.id === 1) ? p2 : p1;
                this.polarDashT++;
                // Chốt an toàn: quá lâu -> về làn ngay
                if (this.polarDashT > 150 || this.hp <= 0) { this.endPolarDash(); return true; }
                if (this.polarDashPhase === 1 && this.polarDashKind === 'enemy') {
                    // HAI XE HÚT NHAU: bay về điểm giữa sân
                    if (this.polarDashT > 60 || !enemy || enemy.hp <= 0 || enemy.magPullPhase !== 1) { this.polarDashPhase = 2; return true; }
                    magMoveToward(this, this.polarDashMX - this.w / 2, this.polarDashMY - this.h / 2, MAG_FLY_SPEED);
                    const d = Math.hypot((this.x + this.w / 2) - (enemy.x + enemy.w / 2), (this.y + this.h / 2) - (enemy.y + enemy.h / 2));
                    if (d <= (this.w + enemy.w) / 2 + 2) this.polarClashImpact(enemy);
                    return true;
                }
                if (this.polarDashPhase === 1) {
                    // Lao THẲNG tới Cột của mình (như xe TANK), vừa hút địch quanh cột
                    if (!t || !t.active) { this.polarDashPhase = 2; return true; }
                    let sdx = t.x - cx;
                    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + Math.max(-7, Math.min(7, sdx))));
                    cx = this.x + this.w / 2;
                    this.y += dir * 18;
                    if (enemy && enemy.hp > 0 && !enemy.magPullPhase && Math.abs(enemy.x + enemy.w / 2 - t.x) <= t.radius * 1.5) {
                        let edx = t.x - (enemy.x + enemy.w / 2);
                        enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + Math.max(-5, Math.min(5, edx))));
                    }
                    this.polarDashCollide();
                    let myY = this.y + this.h / 2;
                    if (dir < 0 ? myY <= t.y + 14 : myY >= t.y - 14) {
                        t.active = false;
                        this.polarDashImpact(t.x, t.y);
                    }
                    if (this.y < 0 || this.y > canvas.height - this.h) {
                        this.y = Math.max(0, Math.min(canvas.height - this.h, this.y));
                        if (this.polarDashPhase === 1) this.polarDashImpact(this.x + this.w / 2, this.y + this.h / 2);
                    }
                } else {
                    // Bay về đúng vị trí cũ trên làn của mình
                    if (magMoveToward(this, this.polarDashHomeX, this.polarDashHomeY, MAG_FLY_SPEED)) this.endPolarDash();
                }
                return true;
            } else if (!this.magPullPhase) {
                this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;
            }

    // Visual vòng tụ lực đảo cực
            if (this.magnetHoldFrames > 0) {
                ctx.save();
                ctx.strokeStyle = this.magnetHoldFrames >= 25 ? (this.magnetPolarity === 1 ? "#00aaff" : "#ff3300") : "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                let progress = Math.min(1, this.magnetHoldFrames / 25);
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 24, 0, progress * Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
        return false;
    },

    // [handleShooting] magnet — trả về true nếu cần dừng handleShooting()
    shootMagnet(inp, now) {
        if (this.weapon === 'magnet') {
            if (this.isPolarDashing) return true;
            if (inp.s) {
                this.magnetHoldFrames = (this.magnetHoldFrames || 0) + 1;
                return true;
            } else {
                if (this.magnetHoldFrames > 0) {
                    let held = this.magnetHoldFrames;
                    this.magnetHoldFrames = 0;
                    if (held >= 25) {
                        this.toggleMagnetPolarity();
                        return true;
                    } else {
                        // Nhấp 1 lần: có mục tiêu KHÁC CỰC phía trước & hết hồi -> Lướt Cực Tính thay cho bắn
                        let found = (this.polarDashCd <= 0 && !isGrounded(this)) ? this.findPolarDashTarget() : null;
                        if (found) {
                            this.startPolarDash(found);
                            return true;
                        }

                        if (this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireMagnetBullet();
                            this.ammo--;
                            this.lastShot = now;
                        }
                        return true;
                    }
                }
                return true;
            }
        }
    }
});

// ==========================================
// Trạng thái từ tính trên kẻ địch (trường thường trên player -> đồng bộ online)
//   NHIỄM TỪ (infectedPolarity/Timer): chạm vùng từ trường -> chỉ bị hút/đẩy, KHÔNG dùng cho Lướt Cực Tính
//   ẤN TỪ (magSealPol/Timer/Max): đạn Nam Châm bắn TRÚNG -> mang cực của đạn, tự toả vùng từ nhỏ,
//                                  là mục tiêu của Lướt Cực Tính (hút hai xe va chạm giữa sân)
//   magPullPhase: 1 = đang bị hút ra giữa sân, 2 = đang bay về làn
// ==========================================
const MAG_DASH_CD = 180;     // 3s hồi Lướt Cực Tính
const MAG_DASH_RANGE = 170;  // lệch ngang tối đa để coi là "phía trước"
const MAG_FLY_SPEED = 14;    // px/tick khi bay tới điểm va chạm / bay về
const MAG_SEAL_TICKS = 360;  // Ấn Từ 6s (Evo 2: 8s)

function magSealAuraR(owner) {
    return (owner && owner.hasUpgrade && hasFullEvo(owner, 'magnet')) ? 44 : 34;
}

function magnetClearStatus(p) {
    if (!p) return;
    p.magSealTimer = 0; p.magSealPol = 0; p.magSealMax = 0; p.magSealAura = 0;
    p.magPullPhase = 0; p.magPullT = 0;
    p.infectedPolarityTimer = 0; p.infectedPolarity = 0;
}

// Đạn Nam Châm trúng trực tiếp -> ẤN TỪ (làm mới khi trúng lại)
function magnetApplySeal(victim, attacker, pol) {
    if (!victim || victim === attacker) return;
    const dur = (attacker && attacker.hasUpgrade && attacker.hasUpgrade('evo_mag_net_2')) ? 480 : MAG_SEAL_TICKS;
    victim.magSealPol = pol || 1;
    victim.magSealTimer = dur;
    victim.magSealMax = dur;
    victim.magSealAura = magSealAuraR(attacker);
    victim.infectedPolarity = 0; victim.infectedPolarityTimer = 0; // Ấn Từ thay thế Nhiễm Từ
    if (typeof addFloatingText === 'function') addFloatingText(victim.x + victim.w / 2, victim.y - 15, victim.magSealPol === 1 ? "ẤN TỪ (+)" : "ẤN TỪ (−)", victim.magSealPol === 1 ? "#ff5533" : "#33aaff", 15);
}

// Di chuyển (góc trên-trái) về (tx, ty) với tốc độ sp; trả về true khi đã tới
function magMoveToward(p, tx, ty, sp) {
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (d <= sp) { p.x = tx; p.y = ty; return true; }
    p.x += dx / d * sp; p.y += dy / d * sp;
    p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
    return false;
}

// Gọi mỗi tick ở đầu Player.update() cho MỌI xe: đếm lùi Ấn Từ + điều khiển việc bị hút ra giữa sân.
// Trả về true khi xe đang bị hút (mất điều khiển -> dừng update()).
function magnetStatusTick(p) {
    if (p.magSealTimer > 0) { p.magSealTimer--; if (p.magSealTimer <= 0) p.magSealPol = 0; }
    if (!p.magPullPhase) return false;
    p.magPullT = (p.magPullT || 0) + 1;
    const homeX = Math.max(0, Math.min(canvas.width - p.w, p.magPullHX || 0));
    const homeY = p.magPullHY;
    const snapHome = () => { p.x = homeX; p.y = homeY; p.magPullPhase = 0; p.magPullT = 0; };
    // Chốt an toàn: chết / quá lâu / kẻ hút đã thôi lướt -> về làn ngay
    const puller = (p.magPullBy === 1) ? p1 : p2;
    if (p.hp <= 0 || p.magPullT > 150 || typeof homeY !== 'number') { snapHome(); return false; }
    if (p.magPullPhase === 1 && (p.magPullT > 60 || !puller || puller === p || !puller.isPolarDashing)) p.magPullPhase = 2;
    p.kbX = 0;
    if (p.magPullPhase === 1) magMoveToward(p, p.magPullMX - p.w / 2, p.magPullMY - p.h / 2, MAG_FLY_SPEED);
    else if (magMoveToward(p, homeX, homeY, MAG_FLY_SPEED)) { snapHome(); return false; }
    return true;
}
