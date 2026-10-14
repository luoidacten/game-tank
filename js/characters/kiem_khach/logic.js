// ==========================================
// Kiếm Khách (kiem_khach) — Logic: phi kiếm, Tập Trung, bài tập
// ==========================================

function kkFocusDuration(p) {
    const d = p.kkData;
    let s = p.hasUpgrade('evo_kk_1') ? 5 : 3;
    s += d.skill.kiem_anh || 0;
    if (d.finals.van_tinh_vu) s += 5;
    return Math.round(s * 60);
}

function kkEnterFocus(p, ticks) {
    const was = (p.kkFocus || 0) > 0;
    p.kkFocus = Math.max(p.kkFocus || 0, ticks);
    p.kkFocusMax = Math.max(p.kkFocus, p.kkFocusMax || 0);
    if (!was) {
        addFloatingText(p.x + p.w / 2, p.y - 18, 'TẬP TRUNG! 🗡️', '#7dd3fc', 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
    }
}

// Bắn 1 loạt phi kiếm
function kkFireVolley(p, isSpray = false) {
    const d = p.kkData;
    const dirY = p.id === 1 ? -1 : 1;
    const focus = (p.kkFocus || 0) > 0;
    const gold = d.hoaThan;
    let speed = 7.2;
    if (focus && (d.skill.kiem_anh || 0) > 0) speed *= 2;
    let count = 1 + (d.skill.mua_kiem || 0);
    let rays = 1 + (d.skill.kiem_vu || 0) + (gold ? 1 : 0);
    if (d.finals.phan_anh) count += 3;
    const pierce = (d.skill.pha_troi || 0) > 0 || gold;
    const w = gold ? 9 : 6, h = gold ? 27 : 18;
    const color = gold ? '#ffd700' : (focus ? '#7dd3fc' : (p.id === 1 ? '#5dade2' : '#ec7063'));
    const cx = p.x + p.w / 2, y0 = dirY < 0 ? p.y - h : p.y + p.h;
    const spread = 0.13;
    let fired = 0;
    for (let r = 0; r < rays; r++) {
        const ang = (r - (rays - 1) / 2) * spread;
        for (let c = 0; c < count; c++) {
            const off = (c - (count - 1) / 2) * 9;
            spawnBullet(p, {
                x: cx - w / 2 + off, y: y0 - c * 6 * dirY, w, h,
                vx: Math.sin(ang) * speed, vy: dirY * Math.cos(ang) * speed,
                dmg: p.damage * (isSpray ? 0.6 : 1), isPiercing: pierce,
                hook: 'kiem_khach', color, swordDir: dirY,
            });
            fired++;
        }
    }
    // Phá: một phần kiếm hóa tia Hitscan
    if ((d.finals.pha || gold) && Math.random() < 0.25) {
        bodyEffects.push(new HitscanTelegraph(p, cx, p.damage * 1.2, '#ffd700', 30));
    }
    d.swordsTotal += fired;
    kkProgress(p, 'fire', fired);
    if (soundSystem && !soundSystem.muted) soundSystem.playShoot('normal');
}

BulletHooks.register('kiem_khach', {
    hit(b, attacker) { if (attacker.kkData) { kkProgress(attacker, 'targetHit'); } },
    obstacle(b, owner, obj, kind) {
        if (!owner.kkData) return;
        if (kind === 'crate' || kind === 'truck' || kind === 'turret') kkProgress(owner, 'targetHit');
        if (kind === 'crate' || kind === 'truck' || kind === 'turret' || kind === 'wall' || kind === 'stone') kkProgress(owner, 'obstacleHit');
    },
    draw(b) {
        drawGlowingSword(b.x, b.y, b.w, b.h, b.color || '#5dade2', b.swordDir || (b.vy < 0 ? -1 : 1));
    },
});

CharHooks.register('kiem_khach', {
    setup() {
        if (!this.kkData) {
            this.kkData = kkNewData();
            // Hiệp 1 chưa có shop: tự nhận ngẫu nhiên 3 bài khởi đầu
            kkAutoPick(this, 3);
        }
        const d = this.kkData;
        this.maxHp += d.stats.hp; this.damage += d.stats.dmg; this.maxAmmo += d.stats.ammo; this.speed += d.stats.speed;
        if (d.finals.kiem_the_cuong) { this.maxHp += 2; this.damage += 1; this.maxAmmo += 2; this.speed += 0.3; }
        if (d.hoaThan) { this.maxHp += 2; this.damage += 0.5; }
        if (this.hasUpgrade('evo_kk_2')) this.shield = Math.max(this.shield || 0, 1);
        this.kkFocus = 0; this.kkFocusMax = 0; this.kkHoaThanTimer = 0;
        this.kkLastX = null; this.kkNoDmgFail = false; this.kkRevived = false;
        this.kkPrevS = false; this.kkSprayTick = 0;
    },

    update(inp, effInp) {
        const d = this.kkData;
        if (!d) return;
        // Quãng đường (Bộ Pháp)
        if (this.kkLastX !== null) { const dx = Math.abs(this.x - this.kkLastX); if (dx > 0 && dx < 40) kkProgress(this, 'distance', dx); }
        this.kkLastX = this.x;
        // Tập Trung
        if (this.kkFocus > 0) {
            this.kkFocus--;
            if (this.kkFocus % 60 === 0) kkProgress(this, 'focusSec', 1);
            if (this.kkFocus === 0) this.kkFocusMax = 0;
        }
        // Hóa Thần: tự Tập Trung mỗi 8s
        if (d.hoaThan && ++this.kkHoaThanTimer >= 480) { this.kkHoaThanTimer = 0; kkEnterFocus(this, kkFocusDuration(this)); }
        kkCheckStateQuests(this);
    },

    shoot(inp, now) {
        const d = this.kkData;
        const focus = this.kkFocus > 0;
        const pressed = inp.s && !this.kkPrevS;
        this.kkPrevS = !!inp.s;
        // Bảo Kiếm: Tập Trung -> vô hạn đạn, giữ để xả liên tục
        if (focus && d.skill.bao_kiem) {
            if (inp.s && ++this.kkSprayTick % 7 === 1) kkFireVolley(this, true);
            if (!inp.s) this.kkSprayTick = 0;
            return true;
        }
        if (pressed && this.ammo > 0 && now - this.lastShot > 260) {
            kkFireVolley(this);
            this.ammo--;
            this.lastShot = now;
            if (this.ammo === 0) kkProgress(this, 'emptyMag');
        }
        return true;
    },

    beforeDamage(amount, attacker, options) {
        if ((this.kkFocus || 0) > 0) {
            addFloatingText(this.x + this.w / 2, this.y - 10, 'NÉ! 🗡️', '#7dd3fc', 13);
            // Vân Tinh Vũ: phản kiếm
            const d = this.kkData;
            if (d && (d.finals.van_tinh_vu || d.hoaThan) && attacker && attacker !== this) {
                const dx = (attacker.x + attacker.w / 2) - (this.x + this.w / 2);
                const dy = (attacker.y + attacker.h / 2) - (this.y + this.h / 2);
                const L = Math.hypot(dx, dy) || 1;
                spawnBullet(this, { x: this.x + this.w / 2 - 3, y: this.y + this.h / 2, w: 6, h: 18, vx: dx / L * 9, vy: dy / L * 9, dmg: this.damage, hook: 'kiem_khach', color: '#ffd700', swordDir: dy < 0 ? -1 : 1 });
                d.counters++;
                if (d.counters >= 10) {
                    d.counters = 0;
                    const enemy = attacker;
                    for (let k = 0; k < 5; k++) {
                        const sx = Math.max(30, Math.min(canvas.width - 30, enemy.x + enemy.w / 2 + (k - 2) * 60 + (Math.random() - 0.5) * 20));
                        bodyEffects.push(new SkyStrike(sx, enemy.y + enemy.h / 2, this, 2 + this.damage, 44, 120));
                    }
                    addFloatingText(this.x + this.w / 2, this.y - 26, 'VÂN TINH VŨ! ⚔️', '#ffd700', 16);
                }
            }
            return true;
        }
        return false;
    },

    shieldBreak() { kkEnterFocus(this, kkFocusDuration(this)); },

    damaged(dmg) {
        if (!this.kkData) return;
        kkProgress(this, 'dmgTaken', dmg);
        this.kkNoDmgFail = true;
    },

    beforeLethal() {
        const d = this.kkData;
        if (d && d.finals.co_hoi_cuoi && !this.kkRevived) {
            this.kkRevived = true;
            this.hp = 1;
            this.invincibleTimer = 180;
            addFloatingText(this.x + this.w / 2, this.y - 24, 'THẬP TỬ NHẤT SINH! ✨', '#ffd700', 16);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 90, 'gold', 0, this));
            if (soundSystem && !soundSystem.muted) soundSystem.playRevive();
            return true;
        }
        return false;
    },

    roundEnd(result) {
        const d = this.kkData;
        if (!d) return;
        for (const a of d.active.slice()) {
            if (a.id === 'van_tinh_vu' && !this.kkNoDmgFail) kkComplete(this, a);
            if (a.id === 'co_hoi_cuoi' && result === 'lose') { a.prog++; if (a.prog >= a.need) kkComplete(this, a); }
        }
        d.rounds = (d.rounds || 0) + 1;
    },

    shopButtons(container, playerId) {
        const d = this.kkData || (this.kkData = kkNewData());
        const btn = document.createElement('div');
        btn.className = 'card';
        btn.style.border = '2px solid #7dd3fc';
        btn.style.background = '#0c2235';
        btn.innerHTML = `<h4 style="color:#7dd3fc">📜 LUYỆN KIẾM</h4><p>Nhận bài tập (${d.active.length} đang làm)</p><p style="color:#7dd3fc">Ô trống: ${kkFreeSlots(this)}/${kkCapacity(this)}</p>`;
        btn.onclick = () => kkRenderQuestPanel(playerId);
        container.appendChild(btn);
    },
});

// Bảng chọn bài tập (trong màn hình shop)
function kkRenderQuestPanel(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const p = playerId === 'p1' ? p1 : p2;
    const d = p.kkData;
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `LUYỆN KIẾM — Đang làm ${d.active.length}/${kkCapacity(p)}${d.hoaThan ? ' • HÓA THẦN' : ''}`;

    const back = document.createElement('div');
    back.className = 'card';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = '<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>🔙</p>';
    back.onclick = () => { updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);

    // Bài đang làm
    for (const a of d.active) {
        const q = KK_QUEST_BY_ID[a.id];
        const pct = Math.min(100, Math.round(a.prog / a.need * 100));
        const card = document.createElement('div');
        card.className = 'card sold';
        card.innerHTML = `<h4>${q.name}${q.tiers > 1 ? ' ' + ['I', 'II', 'III'][a.tier] : ''}</h4><p>${q.task(a.need)}</p><p style="color:#4ade80">${pct}%</p>`;
        container.appendChild(card);
    }
    // Bài có thể nhận
    for (const { q, tier } of kkAvailableQuests(p)) {
        const need = kkQuestNeed(p, q, tier);
        const card = document.createElement('div');
        card.className = 'card' + (q.group === 'final' ? ' evo-card' : '');
        const color = q.group === 'skill' ? '#7dd3fc' : (q.group === 'stat' ? '#facc15' : '#f0abfc');
        card.innerHTML = `<h4 style="color:${color}">${q.name}${q.tiers > 1 ? ' ' + ['I', 'II', 'III'][tier] : ''}</h4>` +
            `<p>${q.task(need)}<br><span style="color:#e2e8f0">➜ ${q.reward(tier)}</span></p>` +
            `<p style="color:${kkFreeSlots(p) > 0 ? color : '#ef4444'}">${kkFreeSlots(p) > 0 ? 'NHẬN' : 'ĐẦY Ô'}</p>`;
        card.onclick = () => {
            if (kkAcceptQuest(p, q.id)) {
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                kkRenderQuestPanel(playerId);
            }
        };
        container.appendChild(card);
    }
}
