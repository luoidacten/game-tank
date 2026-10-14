// ==========================================
// Tùy Biến (customize) — Logic: xe lắp ghép mô-đun
// ==========================================

const CU_PARTS = {
    fire: [
        { id: 'tap', name: 'Tap', desc: 'Nhấp bắn từng viên. +3 đạn.' },
        { id: 'shotgun', name: 'Shotgun', desc: 'Bắn chùm 5 tia tỏa.' },
        { id: 'smg', name: 'SMG', desc: 'Giữ để sấy liên tục. 12 đạn.' },
        { id: 'charge', name: 'Tích Tụ', desc: 'Giữ để tụ lực, nhả ra đạn càng to càng mạnh.' },
        { id: 'hold', name: 'Hold (Tia)', desc: 'Giữ để phát tia liên tục (tốn năng lượng).' },
        { id: 'ram', name: 'Tiến Công', desc: 'Không bắn. Nhấn để lao thẳng tông địch.' },
    ],
    bullet: [
        { id: 'round', name: 'Đạn Tròn', desc: 'Đạn cơ bản.' },
        { id: 'laser', name: 'Đạn Thẳng', desc: 'Bay cực nhanh.' },
        { id: 'sword', name: 'Đạn Kiếm', desc: 'Lưỡi kiếm, nhanh, hitbox dài.' },
        { id: 'cannon', name: 'Đạn Pháo', desc: 'Chậm, nổ khi tới làn địch hoặc chạm mục tiêu.' },
    ],
    trait: [
        { id: 'explosive', name: 'Nổ', desc: 'Chạm mục tiêu nổ lan.' },
        { id: 'piercing', name: 'Xuyên', desc: 'Xuyên qua vật cản & địch.' },
        { id: 'hz_acid', name: 'Vũng Axit', desc: 'Để lại vũng ăn mòn & suy yếu.' },
        { id: 'hz_ice', name: 'Vũng Băng', desc: 'Để lại vũng làm chậm sâu.' },
        { id: 'hz_fire', name: 'Vũng Lửa', desc: 'Để lại vũng thiêu đốt.' },
        { id: 'hz_silence', name: 'Vùng Câm Lặng', desc: 'Đứng vào bị khóa nút bắn.' },
        { id: 'hitscan', name: 'Hitscan', desc: 'Trúng tức thì, có tia cảnh báo 0.25s (Tap/Shotgun/Tích Tụ).' },
        { id: 'homing', name: 'Tự Ngắm', desc: 'Đạn bẻ cong về phía địch.', vip: true },
        { id: 'sticky', name: 'Đạn Hút', desc: 'Trúng địch kéo họ về phía bạn.', vip: true },
        { id: 'bounce', name: 'Nảy Tường', desc: 'Nảy tường 3 lần, mỗi lần +0.25 sát thương.', vip: true },
    ],
    size: [
        { id: 'normal', name: 'Chuẩn', desc: '30x30.' },
        { id: 'small', name: 'Thu Nhỏ', desc: '24x24, tốc độ +30%, -1 Máu.' },
        { id: 'large', name: 'Phóng To', desc: '38x38, tốc độ -20%, +4 Máu.' },
    ],
    passive: [
        { id: 'revive', name: 'Thập Tử Nhất Sinh', desc: 'Về 0 HP hồi sinh 1 lần/hiệp kèm 3s bất tử.' },
        { id: 'vo_anh', name: 'Vô Ảnh', desc: 'Mỗi 10s tự tàng hình miễn nhiễm 1.5s.' },
        { id: 'tap_trung', name: 'Tập Trung Tuyệt Đối', desc: 'Mất khiên -> né mọi đòn 3s.' },
        { id: 'phan_luc', name: 'Phản Lực', desc: 'Trúng địch đẩy lùi họ; mỗi 3 lần trúng +1 khiên.' },
    ],
};
const CU_PART_BY_ID = {};
Object.values(CU_PARTS).forEach(list => list.forEach(x => CU_PART_BY_ID[x.id] = x));

function cuNewData() {
    return { fire: 'tap', bullet: 'round', traits: [], size: 'normal', passive: null, cp: 0 };
}
function cuPower(p) { return p.hasUpgrade('evo_cu_2') ? 1.3 : 1; }
function cuHas(p, t) { return p.cuData && p.cuData.traits.includes(t); }
function cuHazard(p) { const t = (p.cuData.traits.find(x => x.startsWith('hz_')) || ''); return t ? t.slice(3) : null; }

// Mua / lắp 1 mô-đun (tốn 1 Điểm Tùy Chỉnh)
function cuApplyPart(p, group, id) {
    const d = p.cuData;
    const fullEvo = p.hasUpgrade('evo_cu_1') && p.hasUpgrade('evo_cu_2');
    if (group === 'passive') {
        if (!fullEvo || d.passive === id) return false;
        d.passive = id; // Nội tại Full Evo: chọn miễn phí, đổi được
        return true;
    }
    if (d.cp <= 0) return false;
    if (group === 'trait') {
        const part = CU_PART_BY_ID[id];
        if (part.vip && !p.hasUpgrade('evo_cu_1')) return false;
        if (d.traits.includes(id)) return false;
        if (id.startsWith('hz_')) d.traits = d.traits.filter(t => !t.startsWith('hz_')); // 1 loại vùng
        d.traits.push(id);
    } else {
        if (d[group] === id) return false;
        d[group] = id;
    }
    d.cp--;
    return true;
}

// Bắn 1 viên theo dạng đạn & tính chất đã lắp
function cuSpawn(p, ang = 0, dmgMult = 1, sizeMult = 1) {
    const d = p.cuData;
    const dirY = p.id === 1 ? -1 : 1;
    const T = { round: [4.8, 6, 6], laser: [11, 4, 16], sword: [8, 6, 18], cannon: [3.6, 11, 11] }[d.bullet] || [4.8, 6, 6];
    const [spd, w0, h0] = T;
    const w = w0 * sizeMult, h = h0 * sizeMult;
    const enemy = p === p1 ? p2 : p1;
    return spawnBullet(p, {
        x: p.x + p.w / 2 - w / 2, y: dirY < 0 ? p.y - h : p.y + p.h, w, h,
        vx: Math.sin(ang) * spd, vy: dirY * Math.cos(ang) * spd,
        dmg: p.damage * dmgMult * (d.bullet === 'cannon' ? 1.4 : 1),
        isPiercing: cuHas(p, 'piercing'), isHoming: cuHas(p, 'homing'), isLazer: d.bullet === 'laser',
        hook: 'customize', cuKind: d.bullet, swordDir: dirY, cuBounces: 0,
        cuTargetY: enemy ? enemy.y + enemy.h / 2 : null,
    });
}

// Hiệu ứng khi đạn chạm (mục tiêu / vật cản / mép sân)
function cuImpact(p, x, y, victim) {
    if (!p || !p.cuData) return; // đạn bị phản (Cuồng Phong) đổi chủ
    const pw = cuPower(p);
    if (cuHas(p, 'explosive') || (p.cuData.bullet === 'cannon')) {
        explosions.push(new Explosion(x, y, 48 * pw, 'rgba(255, 140, 0,', 0.6 * p.damage * pw, p));
    }
    const hz = cuHazard(p);
    if (hz) bodyEffects.push(new BodyZone(x, y, 34 * pw, hz, p, 180, pw));
    if (victim && victim !== p) {
        if (cuHas(p, 'sticky')) victim.kbX = Math.sign((p.x + p.w / 2) - (victim.x + victim.w / 2)) * 7 * pw;
        if (p.cuData.passive === 'phan_luc') {
            victim.kbX = Math.sign((victim.x + victim.w / 2) - (p.x + p.w / 2)) * 8;
            p.cuHitCount = (p.cuHitCount || 0) + 1;
            if (p.cuHitCount % 3 === 0) { p.shield = (p.shield || 0) + 1; addFloatingText(p.x + p.w / 2, p.y - 12, '+1 KHIÊN ẢO', '#00f0ff', 12); }
        }
    }
}

BulletHooks.register('customize', {
    hit(b, attacker, victim) { cuImpact(attacker, b.x, b.y, victim); if (b.cuKind === 'cannon') b.cuDone = true; },
    obstacle(b, owner, obj) { cuImpact(owner, b.x, b.y, null); },
    edge(b, owner) {
        if (b.cuDone || !owner.cuData) return undefined; // đạn pháo đã nổ / đạn bị phản
        // Nảy tường (VIP): chỉ mép trái/phải
        if (cuHas(owner, 'bounce') && (b.cuBounces || 0) < 3 && (b.x <= 0 || b.x + b.w >= canvas.width) && b.y > 0 && b.y < canvas.height) {
            b.vx = -b.vx || (b.x <= 0 ? 2 : -2);
            b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x));
            b.cuBounces = (b.cuBounces || 0) + 1;
            b.dmg += 0.25 * cuPower(owner);
            return 'keep';
        }
        cuImpact(owner, b.x + b.w / 2, b.y + b.h / 2, null);
        return undefined;
    },
    draw(b) {
        const col = b.owner.id === 1 ? '#38bdf8' : '#fb7185';
        ctx.save();
        if (b.cuKind === 'sword') drawGlowingSword(b.x, b.y, b.w, b.h, col, b.swordDir || -1);
        else if (b.cuKind === 'laser') { ctx.fillStyle = col; ctx.shadowBlur = 10; ctx.shadowColor = col; ctx.fillRect(b.x, b.y, b.w, b.h); }
        else if (b.cuKind === 'cannon') { ctx.fillStyle = '#1f2937'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        else { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    },
});

CharHooks.register('customize', {
    setup() {
        if (!this.cuData) { this.cuData = cuNewData(); this.cuData.cp = 0; }
        const d = this.cuData;
        const fire = d.fire;
        this.maxAmmo = { tap: 4, shotgun: 3, smg: 12, charge: 3, hold: 0, ram: 0 }[fire];
        if (fire === 'smg') this.damage *= 0.35;
        if (d.size === 'small') { this.w = 24; this.h = 24; this.speed *= 1.3; this.maxHp = Math.max(1, this.maxHp - 1); }
        if (d.size === 'large') { this.w = 38; this.h = 38; this.speed *= 0.8; this.maxHp += 4; }
        this.cuCharge = 0; this.cuEnergy = 100; this.cuDash = 0; this.cuDashCd = 0; this.cuPrevS = false;
        this.cuSmgTick = 0; this.cuBeamOn = false; this.cuReviveUsed = false; this.cuVoAnh = 0; this.cuFocus = 0; this.cuHitCount = 0;
        this.cuHomeY = null;
    },

    update() {
        const d = this.cuData;
        // Đạn pháo nổ khi tới làn đối thủ
        for (const b of this.bullets) {
            if (b.hook !== 'customize' || b.cuKind !== 'cannon' || b.cuDone || b.cuTargetY === null) continue;
            if ((b.vy < 0 && b.y + b.h / 2 <= b.cuTargetY) || (b.vy > 0 && b.y + b.h / 2 >= b.cuTargetY)) {
                b.cuDone = true; b.active = false;
                cuImpact(this, b.x + b.w / 2, b.y + b.h / 2, null);
                b.x = -999; // ra khỏi sân -> bị xoá ở lượt cập nhật đạn kế tiếp
            }
        }
        // Lao húc (Tiến Công)
        if (this.cuDashCd > 0) this.cuDashCd--;
        if (this.cuHomeY === null) this.cuHomeY = this.y;
        const enemy = this === p1 ? p2 : p1;
        if (this.cuDash > 0) {
            this.cuDash--;
            const dirY = this.id === 1 ? -1 : 1;
            this.y += dirY * 14;
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                enemy.takeDamage(2.5 * this.damage * cuPower(this), this);
                enemy.kbX = Math.sign((enemy.x + enemy.w / 2) - (this.x + this.w / 2) || 1) * 10;
                cuImpact(this, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy);
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 40, '#ff5722', 0, this));
                this.cuDash = 0;
            }
            if (this.y < 20 || this.y + this.h > canvas.height - 22) this.cuDash = 0;
        } else if (Math.abs(this.y - this.cuHomeY) > 0.5) {
            this.y += (this.cuHomeY - this.y) * 0.2;
            if (Math.abs(this.y - this.cuHomeY) < 1) this.y = this.cuHomeY;
        }
        // Tia liên tục (Hold)
        if (d.fire === 'hold') {
            if (this.cuBeamOn && this.cuEnergy > 0) {
                this.cuEnergy -= 40 / 60;
                if (enemy && enemy.hp > 0) {
                    const cx = this.x + this.w / 2;
                    const ny = this.id === 1 ? this.y : this.y + this.h;
                    const ey = enemy.y + enemy.h / 2;
                    const blocked = spBlockers(this).some(b => segHitsRect(cx, ny, cx, ey, b));
                    this.cuBeamLen = blocked ? Math.min(...spBlockers(this).filter(b => segHitsRect(cx, ny, cx, ey, b)).map(b => Math.abs((this.id === 1 ? b.y + b.h : b.y) - ny))) : Math.abs(ey - ny);
                    if (!blocked && cx > enemy.x - 3 && cx < enemy.x + enemy.w + 3) {
                        this.cuBeamAcc = (this.cuBeamAcc || 0) + 1.4 * this.damage * cuPower(this) / 60;
                        if (this.cuBeamAcc >= 0.2) { const dd = this.cuBeamAcc; this.cuBeamAcc = 0; enemy.takeDamage(dd, this); if (Math.random() < 0.15) cuImpact(this, cx, ey, enemy); }
                    }
                }
            } else if (!this.cuBeamOn) this.cuEnergy = Math.min(100, this.cuEnergy + 25 / 60);
            if (this.cuEnergy <= 0) this.cuBeamOn = false;
        }
        // Nội tại Full Evo
        if (d.passive === 'vo_anh' && ++this.cuVoAnh >= 600) { this.cuVoAnh = 0; this.invincibleTimer = Math.max(this.invincibleTimer || 0, 90); addFloatingText(this.x + this.w / 2, this.y - 14, 'VÔ ẢNH 👻', '#cbd5e1', 13); }
        if (this.cuFocus > 0) this.cuFocus--;
    },

    shoot(inp, now) {
        const d = this.cuData;
        const pressed = inp.s && !this.cuPrevS;
        const released = !inp.s && this.cuPrevS;
        this.cuPrevS = !!inp.s;
        const hitscan = cuHas(this, 'hitscan');
        const fireOne = (dmgMult = 1, sizeMult = 1) => {
            if (hitscan) bodyEffects.push(new HitscanTelegraph(this, this.x + this.w / 2, this.damage * dmgMult, '#ff2244', 30, 'customize'));
            else cuSpawn(this, 0, dmgMult, sizeMult);
        };
        switch (d.fire) {
            case 'tap':
                if (pressed && this.ammo > 0 && now - this.lastShot > 300) { fireOne(); this.ammo--; this.lastShot = now; soundSystem.playShoot('normal'); }
                break;
            case 'shotgun':
                if (pressed && this.ammo > 0 && now - this.lastShot > 500) {
                    if (hitscan) fireOne(1.6);
                    else for (let k = -2; k <= 2; k++) cuSpawn(this, k * 0.17, 0.45);
                    this.ammo--; this.lastShot = now; soundSystem.playShoot('normal');
                }
                break;
            case 'smg':
                if (inp.s && this.ammo > 0 && ++this.cuSmgTick % 6 === 1) { cuSpawn(this, (Math.random() - 0.5) * 0.12, 1, 0.8); this.ammo--; this.lastShot = now; }
                if (!inp.s) this.cuSmgTick = 0;
                break;
            case 'charge':
                if (inp.s && this.ammo > 0) this.cuCharge = Math.min(90, this.cuCharge + 1);
                if (released && this.cuCharge > 0 && this.ammo > 0) {
                    const k = this.cuCharge / 90;
                    fireOne(1 + 2 * k, 1 + 1.6 * k);
                    this.ammo--; this.lastShot = now; this.cuCharge = 0;
                    soundSystem.playShoot('normal');
                }
                break;
            case 'hold':
                this.cuBeamOn = !!inp.s && this.cuEnergy > 3;
                break;
            case 'ram':
                if (pressed && this.cuDash <= 0 && this.cuDashCd <= 0) {
                    this.cuHomeY = this.y; this.cuDash = 40; this.cuDashCd = 150;
                    if (soundSystem && !soundSystem.muted) soundSystem.playDash();
                }
                break;
        }
        return true;
    },

    beforeDamage() {
        if (this.cuData.passive === 'tap_trung' && this.cuFocus > 0) { addFloatingText(this.x + this.w / 2, this.y - 10, 'NÉ!', '#7dd3fc', 13); return true; }
        return false;
    },
    shieldBreak() { if (this.cuData.passive === 'tap_trung') this.cuFocus = 180; },
    beforeLethal() {
        if (this.cuData.passive === 'revive' && !this.cuReviveUsed) {
            this.cuReviveUsed = true; this.hp = 1; this.invincibleTimer = 180;
            addFloatingText(this.x + this.w / 2, this.y - 22, 'THẬP TỬ NHẤT SINH!', '#ffd700', 15);
            if (soundSystem && !soundSystem.muted) soundSystem.playRevive();
            return true;
        }
        return false;
    },

    roundEnd(result) {
        const d = this.cuData || (this.cuData = cuNewData());
        let gain = 1;
        if (result === 'win') gain += 1;
        if ((this.loseStreak || 0) >= 2) gain += 2;
        if (this.hasUpgrade('evo_cu_2')) gain += 1;
        d.cp += gain;
    },

    shopButtons(container, playerId) {
        const d = this.cuData || (this.cuData = cuNewData());
        const btn = document.createElement('div');
        btn.className = 'card';
        btn.style.border = '2px solid #f59e0b';
        btn.style.background = '#2a1a05';
        btn.innerHTML = `<h4 style="color:#fbbf24">🔧 TÙY Ý CHỈNH SỬA</h4><p>${CU_PART_BY_ID[d.fire].name} • ${d.fire === 'ram' ? '—' : CU_PART_BY_ID[d.bullet].name}</p><p style="color:#fbbf24">CP: ${d.cp}</p>`;
        btn.onclick = () => cuRenderPanel(playerId);
        container.appendChild(btn);
    },
});

function cuRenderPanel(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const p = playerId === 'p1' ? p1 : p2;
    const d = p.cuData;
    const fullEvo = p.hasUpgrade('evo_cu_1') && p.hasUpgrade('evo_cu_2');
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `TÙY Ý CHỈNH SỬA — Điểm: ${d.cp} CP`;

    const back = document.createElement('div');
    back.className = 'card';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = '<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>🔙</p>';
    back.onclick = () => { updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);

    const groups = [['fire', 'LỐI BẮN'], ['bullet', 'DẠNG ĐẠN'], ['trait', 'TÍNH CHẤT'], ['size', 'KÍCH THƯỚC']];
    if (fullEvo) groups.push(['passive', 'NỘI TẠI']);
    for (const [g, label] of groups) {
        if (g === 'bullet' && d.fire === 'ram') continue;
        for (const part of CU_PARTS[g]) {
            if (part.vip && !p.hasUpgrade('evo_cu_1')) continue;
            const owned = g === 'trait' ? d.traits.includes(part.id) : (g === 'passive' ? d.passive === part.id : d[g] === part.id);
            const card = document.createElement('div');
            card.className = 'card' + (owned ? ' sold' : '') + (part.vip || g === 'passive' ? ' evo-card' : '');
            card.innerHTML = `<p style="font-size:8px;color:#fbbf24;flex-grow:0">${label}</p><h4>${part.name}</h4><p>${part.desc}</p><p style="color:#fbbf24">${owned ? 'ĐANG LẮP' : (g === 'passive' ? 'CHỌN' : '1 CP')}</p>`;
            card.onclick = () => {
                if (cuApplyPart(p, g, part.id)) {
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                    cuRenderPanel(playerId);
                }
            };
            container.appendChild(card);
        }
    }
}
