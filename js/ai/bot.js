// ==========================================
// AI Bot & Hệ Thống Sandbox / Phòng Tập Nâng Cao
// ==========================================

// Danh mục đầy đủ 16 loại Thùng Gacha & 9 Vật Thể / Xe Bản Đồ trong Sandbox
const SANDBOX_BOX_CATALOG = [
    // --- Nhóm 1: Thùng Cơ Bản & Chế Tạo ---
    { id: 'coin', kind: 'crate', icon: '💰', name: 'Thùng Tiền ($)', color: '#f1c40f', badge: 'Weight: 25', desc: 'Cộng +$30 vàng (+$60 cho Xe Tiền).' },
    { id: 'hp', kind: 'crate', icon: '💚', name: 'Thùng Máu (+)', color: '#2ecc71', badge: 'Weight: 20', desc: 'Hồi +1.0 HP (hoặc +4 Linh Hồn cho Kẻ Gọi Hồn).' },
    { id: 'ammo', kind: 'crate', icon: '🎯', name: 'Thùng Đạn (A)', color: '#e67e22', badge: 'Weight: 15', desc: 'Nạp đầy đạn, giảm nhiệt hoặc hồi 50% Năng Lượng / Chú Lực / Kiếm Khí.' },
    { id: 'shield', kind: 'crate', icon: '🛡️', name: 'Thùng Khiên (S)', color: '#3498db', badge: 'Weight: 13', desc: 'Nhận +1 lớp Khiên chắn đạn.' },
    { id: 'dmg', kind: 'crate', icon: '🟣', name: 'Thùng Sát Thương (D)', color: '#a855f7', badge: 'Weight: 10', desc: 'Tăng +1.0 Sát thương đạn trong hiệp hiện tại.' },
    { id: 'gear', kind: 'crate', icon: '⚙️', name: 'Thùng Bánh Răng (G)', color: '#00ffcc', badge: 'Chế Tạo', desc: 'Hồi +1 đạn, +0.25 HP và cộng Bánh Răng / Linh Kiện cho hệ Chế Tạo.' },

    // --- Nhóm 2: Thùng Buff & Gacha Mới ---
    { id: 'frost', kind: 'crate', icon: '❄️', name: 'Thùng Băng (Frost)', color: '#7dd3fc', badge: 'Weight: 6', desc: 'Đóng băng đối thủ 1.75s từ xa (hoặc làm chậm nếu kháng).' },
    { id: 'haste', kind: 'crate', icon: '⚡', name: 'Thùng Tốc (Haste)', color: '#38f0ff', badge: 'Weight: 6', desc: 'Tăng +40% tốc độ di chuyển trong 5 giây.' },
    { id: 'immune', kind: 'crate', icon: '✨', name: 'Thùng Miễn Nhiễm ×3', color: '#fde68a', badge: 'Weight: 5', desc: 'Nhận 3 tầng Miễn Nhiễm chặn sát thương hoặc khống chế.' },
    { id: 'phantom', kind: 'crate', icon: '👻', name: 'Thùng Giáp Ảo (+2.0)', color: '#f8fafc', badge: 'Weight: 5', desc: 'Nhận +2.0 Giáp Trắng (tan dần về 0 trong 5 giây).' },
    { id: 'guard', kind: 'crate', icon: '⛊', name: 'Thùng Giảm Sát Thương', color: '#818cf8', badge: 'Weight: 5', desc: 'Giảm 35% sát thương nhận vào trong 5 giây.' },

    // --- Nhóm 3: Thùng Nguy Hiểm / Bẫy / Sát Thương ---
    { id: 'boom', kind: 'crate', icon: '💥', name: 'Thùng Nổ (!)', color: '#ef4444', badge: 'Weight: 9', desc: 'Phản nổ 1.5 sát thương trực tiếp lên người bắn vỡ (trừ khi có G.E.A.R Đồng Minh Tiếp Tế).' },
    { id: 'bullets', kind: 'crate', icon: '✸', name: 'Thùng Đạn 360°', color: '#ff9f1a', badge: 'Weight: 8', desc: 'Phóng 16 viên đạn tỏa tròn 360° gây 0.75 sát thương.' },
    { id: 'trap', kind: 'crate', icon: '⛓', name: 'Thùng Bẫy Khống Chế', color: '#a3e635', badge: 'Weight: 5', desc: 'Sập bẫy kẹp làm Choáng 1.0s người phá thùng.' },
    { id: 'laser', kind: 'crate', icon: '🚨', name: 'Thùng Đại Pháo Lazer', color: '#ff2d75', badge: 'HIẾM (3)', desc: 'Cảnh báo cột dọc 0.8s rồi bắn tia Lazer khổng lồ gây 3.0 sát thương dọc cột!' },
    { id: 'mimic', kind: 'crate', icon: '👾', name: 'Thùng Giả (Mimic)', color: '#f43f5e', badge: 'Tiến Hóa', desc: 'Thùng ngụy trang phát nổ khi bị phá (cơ chế đặc trưng khi có Tiến Hóa).' },

    // --- Nhóm 4: Xe Bản Đồ & Vật Thể Sân Đấu ---
    { id: 'money_truck', kind: 'vehicle', icon: '🚛', name: 'Xe Tiền Vàng', color: '#facc15', badge: 'Xe Bản Đồ', desc: 'Xe chở tiền chạy ngang sân (+30$ khi bắn hạ, +60$ với Xe Tiền).' },
    { id: 'mv_buff', kind: 'vehicle', icon: '🟣', name: 'Xe Buff Sát Thương', color: '#ff2bd6', badge: 'Xe Đặc Biệt', desc: 'Phá hủy giúp người hạ gục nhận +1.5 Sát thương trong 10 giây!' },
    { id: 'mv_heal', kind: 'vehicle', icon: '🟢', name: 'Xe Hồi Máu Bọc Thép', color: '#22ff88', badge: 'Xe Đặc Biệt', desc: 'Xe hạng nặng, khi nổ tung ra mưa ngọc hồi máu về cả 2 làn.' },
    { id: 'mv_atk_cannon', kind: 'vehicle', icon: '🔴', name: 'Xe Tấn Công (Pháo)', color: '#ff3b3b', badge: 'Xe Thù Địch', desc: 'Xe vũ trang bắn đạn pháo 0.9 ST vào cả 2 người chơi.' },
    { id: 'mv_atk_smg', kind: 'vehicle', icon: '🟠', name: 'Xe Tấn Công (Tiểu Liên)', color: '#fb923c', badge: 'Xe Thù Địch', desc: 'Xe vũ trang xả loạt 5 viên SMG liên thanh.' },
    { id: 'mv_atk_laser', kind: 'vehicle', icon: '💗', name: 'Xe Tấn Công (Lazer)', color: '#ff4d8d', badge: 'Xe Thù Địch', desc: 'Xe vũ trang khóa mục tiêu 0.83s rồi bắn tia Lazer xuyên sân.' },
    { id: 'obstacle', kind: 'hazard', icon: '🧱', name: 'Chướng Ngại Di Động', color: '#94a3b8', badge: 'Vật Cản', desc: 'Khối bê tông di chuyển ngang giữa sân chặn đạn thường.' },
    { id: 'bastion', kind: 'hazard', icon: '🏰', name: 'Tường Pháo Đài (Bastion)', color: '#38bdf8', badge: 'Vật Cản', desc: 'Dựng lô cốt chắn đạn có máu trên sân.' },
    { id: 'artillery', kind: 'hazard', icon: '💣', name: 'Pháo Kích Rơi (Artillery)', color: '#f87171', badge: 'Hiểm Họa', desc: 'Gọi 2 quả đạn pháo kích cảnh báo và nổ xuống làn xe.' }
];

const SANDBOX_MAPS = [
    { id: 'classic', name: 'CỔ ĐIỂN' },
    { id: 'bastion', name: 'PHÁO ĐÀI' },
    { id: 'artillery', name: 'PHÁO KÍCH' },
    { id: 'overdrive', name: 'SIÊU TỐC' },
    { id: 'fast_shrink', name: 'BO THẦN TỐC' },
    { id: 'rush_hour', name: 'CAO ĐIỂM' },
    { id: 'supply_drop', name: 'TIẾP TẾ' }
];

class BotAIController {
    constructor() {
        this.enabled = false;
        this.mode = 'dummy'; // 'dummy' | 'shooter' | 'combat'
        this.isGodMode = false;
        this.isPlayerGodMode = false;
        this.infiniteAmmo = false;
        this.freezeNaturalSpawns = false;
        this.timer = 0;
        this.shootCycle = 0;
        this.level = 3;      // cấp bot thông minh trong phòng tập (1-5)
        this.smart = null;

        // Bộ lọc Modal chọn Body
        this.weaponSearchQuery = '';
        this.weaponRoleFilter = 'ALL';
        this.weaponEvoPreset = '0'; // '0' | '1' | '2' | 'full'

        // Chế độ thả thùng trong Modal Test Box
        this.boxSpawnMode = 'front_p1'; // 'front_p1' | 'front_p2' | 'center' | 'break_p1' | 'break_p2'
    }

    setMode(mode) {
        this.mode = mode;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p2) {
            const modeNames = { dummy: 'BAO CÁT (DUMMY)', shooter: 'CHỈ BẮN (SHOOTER)', combat: 'CHIẾN ĐẤU (COMBAT)' };
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, modeNames[mode] || mode, "#00f0ff", 14);
        }
    }

    cycleLevel() {
        this.level = this.level % 5 + 1;
        this.smart = new SmartBot(this.level);
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p2) addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, `BOT: ${BOT_LEVELS[this.level].name}`, "#00f0ff", 14);
    }

    toggleGodMode() {
        this.isGodMode = !this.isGodMode;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p2) {
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, this.isGodMode ? "BOT BẤT TỬ: BẬT 🛡️" : "BOT BẤT TỬ: TẮT", this.isGodMode ? "#ffd700" : "#ef4444", 14);
        }
    }

    togglePlayerGodMode() {
        this.isPlayerGodMode = !this.isPlayerGodMode;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p1) {
            addFloatingText(p1.x + p1.w / 2, p1.y - 16, this.isPlayerGodMode ? "BẠN BẤT TỬ: BẬT 🛡️" : "BẠN BẤT TỬ: TẮT", this.isPlayerGodMode ? "#4ade80" : "#ef4444", 14);
        }
    }

    toggleInfiniteAmmo() {
        this.infiniteAmmo = !this.infiniteAmmo;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p1) {
            if (this.infiniteAmmo) this.refillPlayerResources(p1);
            addFloatingText(p1.x + p1.w / 2, p1.y - 16, this.infiniteAmmo ? "VÔ HẠN ĐẠN & NĂNG LƯỢNG ♾️" : "VÔ HẠN ĐẠN: TẮT", "#38bdf8", 14);
        }
    }

    refillPlayerResources(p) {
        if (!p) return;
        p.ammo = Math.max(p.ammo || 0, p.maxAmmo || 5);
        p.reloadTimer = 0;
        p.heat = 0;
        p.isOverheated = false;
        p.laHeat = 0;
        p.laOver = 0;
        if (p.maxEnergy) p.energy = p.maxEnergy;
        if (p.maxChuLuc) p.chuLuc = p.maxChuLuc;
        if (p.weapon === 'sukuna') p.cursedEnergy = 100;
        if (p.weapon === 'necromancer') p.currentSouls = Math.max(p.currentSouls || 0, (p.maxSouls || 12) - (p.lockedSouls || 0));
        if (p.weapon === 'thunder' && typeof thunderSpearCap === 'function') p.thunderSpears = thunderSpearCap(p);
        if (p.weapon === 'van_kiem') p.stanceSwordsAccumulated = 8;
        if (p.weapon === 'wind_slash') p.chargeLevel = 7;
    }

    toggleAutoCrate() {
        this.freezeNaturalSpawns = !this.freezeNaturalSpawns;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p1) {
            addFloatingText(p1.x + p1.w / 2, p1.y - 16, this.freezeNaturalSpawns ? "ĐÃ KHÓA THÙNG TỰ NHIÊN 🔒" : "MỞ SINH THÙNG TỰ NHIÊN 🎲", "#facc15", 13);
        }
    }

    cycleSandboxMap() {
        const cur = gameState.currentMap || 'classic';
        const idx = SANDBOX_MAPS.findIndex(m => m.id === cur);
        const next = SANDBOX_MAPS[(idx + 1) % SANDBOX_MAPS.length];
        gameState.currentMap = next.id;
        gameState.selectedMapMode = next.id;
        const mapBadge = document.getElementById('hudMapBadge');
        if (mapBadge) mapBadge.innerText = `MAP: ${next.name}`;
        if (next.id === 'bastion' && typeof bastions !== 'undefined' && bastions.length === 0 && typeof BastionWall !== 'undefined') {
            bastions.push(new BastionWall(60, canvas.height / 2 - 40), new BastionWall(canvas.width - 130, canvas.height / 2 + 20));
        }
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 16, `ĐỔI MAP: ${next.name} 🗺️`, "#38bdf8", 14);
    }

    getPlayerEvoStage(p) {
        if (!p) return '0';
        const evos = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.weapon]) ? EVOLUTIONS[p.weapon] : [];
        if (evos.length === 0) return '0';
        const has1 = evos[0] && p.hasUpgrade(evos[0].id);
        const has2 = evos[1] && p.hasUpgrade(evos[1].id);
        if (has1 && has2) return 'full';
        if (has2) return '2';
        if (has1) return '1';
        return '0';
    }

    applyPlayerEvoStage(p, stage) {
        if (!p) return;
        const evos = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.weapon]) ? EVOLUTIONS[p.weapon] : [];
        const evoIds = evos.map(e => e.id);
        p.upgrades = (p.upgrades || []).filter(u => !evoIds.includes(u));
        if (stage === '1' && evos[0]) p.upgrades.push(evos[0].id);
        else if (stage === '2' && evos[1]) p.upgrades.push(evos[1].id);
        else if (stage === 'full') {
            evos.forEach(e => { if (!p.upgrades.includes(e.id)) p.upgrades.push(e.id); });
        }
        if (p.weapon === 'inventor') {
            p.isFullEvoInventor = (stage === 'full');
        }
        if (p.weapon === 'money_tank' && stage === 'full') {
            p.upgradeLevel = Math.max(p.upgradeLevel || 0, 5);
        }
        const curCX = p.x + (p.w || C.tankW) / 2;
        if (typeof clearOwnedSummons === 'function') clearOwnedSummons(p);
        if (typeof PracticeGearModal !== 'undefined' && PracticeGearModal.clearOwnerGearEntities) {
            PracticeGearModal.clearOwnerGearEntities(p);
        }
        p.setupForNewRound();
        p.x = Math.max(0, Math.min(canvas.width - p.w, curCX - p.w / 2));
        p.hp = p.maxHp;
        this.updateToolbarUI();
    }

    cyclePlayerEvo(pid) {
        const p = pid === 'p1' ? p1 : p2;
        if (!p) return;
        const order = ['0', '1', '2', 'full'];
        const cur = this.getPlayerEvoStage(p);
        const next = order[(order.indexOf(cur) + 1) % order.length];
        this.applyPlayerEvoStage(p, next);
        const labels = { '0': 'CƠ BẢN', '1': 'EVO 1', '2': 'EVO 2', 'full': 'FULL EVO ⭐' };
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 18 : p.y + p.h + 16, `TIẾN HÓA: ${labels[next]}`, "#e879f9", 14);
    }

    testFinisher() {
        if (!p2) return;
        this.isGodMode = false;
        p2.hp = 0.05;
        p2.shield = 0;
        p2.gearWhiteShield = 0;
        p2.invincibleTimer = 0;
        p2.mvImmune = 0;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 15, "💀 BOT = 0.05 HP! BẮN 1 PHÁT ĐỂ TEST KẾT LIỄU!", "#f43f5e", 14);
    }

    openSandboxShop() {
        if (!this.enabled) return;
        if (gameState.round < 2) gameState.round = 2;
        if (typeof showUpgradeScreen === 'function') {
            // Đánh dấu đã chọn G.E.A.R ở mốc hiện tại nếu chỉ muốn mở thẳng Shop
            const mIdx = typeof getGearMilestoneIndex === 'function' ? getGearMilestoneIndex(gameState.round) : -1;
            [p1, p2].forEach(pl => {
                if (pl && mIdx >= 0 && Array.isArray(pl.gearPickedMilestones) && !pl.gearPickedMilestones.includes(mIdx)) {
                    pl.gearPickedMilestones.push(mIdx);
                }
            });
            showUpgradeScreen();
        }
    }

    clearArena() {
        if (typeof crates !== 'undefined') crates.length = 0;
        if (typeof moneyTrucks !== 'undefined') moneyTrucks.length = 0;
        if (typeof movingObstacle !== 'undefined') movingObstacle = null;
        if (typeof bastions !== 'undefined') bastions.length = 0;
        if (typeof artilleryHazards !== 'undefined') artilleryHazards.length = 0;
        if (typeof explosions !== 'undefined') explosions.length = 0;
        if (typeof fireZones !== 'undefined') fireZones.length = 0;
        if (typeof iceZones !== 'undefined') iceZones.length = 0;
        if (typeof voidZones !== 'undefined') voidZones.length = 0;
        if (typeof radiationZones !== 'undefined') radiationZones.length = 0;
        if (typeof spellZones !== 'undefined') spellZones.length = 0;
        if (typeof shadowTraps !== 'undefined') shadowTraps.length = 0;
        if (typeof windWalls !== 'undefined') windWalls.length = 0;
        if (typeof sniperWalls !== 'undefined') sniperWalls.length = 0;
        if (typeof bodyEffects !== 'undefined') {
            bodyEffects = bodyEffects.filter(e => e && e.constructor && /^Gear/.test(e.constructor.name));
        }
        [p1, p2].forEach(pl => { if (pl && Array.isArray(pl.bullets)) pl.bullets.length = 0; });
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 16, "🧹 ĐÃ DỌN SẠCH SÂN ĐẤU!", "#38bdf8", 14);
    }

    healAll() {
        if (p1) {
            p1.hp = p1.maxHp;
            p1.shield = Math.max(p1.shield, 1);
            this.refillPlayerResources(p1);
            addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+FULL HP & ĐẠN", "#2ecc71", 15);
        }
        if (p2) {
            p2.hp = p2.maxHp;
            p2.shield = Math.max(p2.shield, 1);
            this.refillPlayerResources(p2);
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, "+FULL HP & ĐẠN", "#2ecc71", 15);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    addCoins() {
        gameState.p1Coins += 200;
        gameState.p2Coins += 200;
        [p1, p2].forEach(pl => {
            if (!pl) return;
            pl.components = (pl.components || 0) + 10;
            pl.gears = (pl.gears || 0) + 10;
            if (pl.cuData) pl.cuData.cp = (pl.cuData.cp || 0) + 10;
        });
        if (typeof updateScoreBoard === 'function') updateScoreBoard();
        if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+$200 • +10 LK/GEAR/CP", "#f1c40f", 14);
    }

    changeBotWeapon(bodyId, evoPreset = null) {
        if (!p2) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí & evo cũ của Bot
        const bodyIds = MODULES.BODY.map(m => m.id);
        const allEvoIds = Object.values(EVOLUTIONS || {}).flat().map(e => e.id);
        p2.upgrades = p2.upgrades.filter(u => !bodyIds.includes(u) && !allEvoIds.includes(u));
        p2.upgrades.push(bodyId);

        const targetEvo = evoPreset !== null ? evoPreset : this.weaponEvoPreset;
        const evos = (EVOLUTIONS && EVOLUTIONS[bodyId]) ? EVOLUTIONS[bodyId] : [];
        if (targetEvo === '1' && evos[0]) p2.upgrades.push(evos[0].id);
        else if (targetEvo === '2' && evos[1]) p2.upgrades.push(evos[1].id);
        else if (targetEvo === 'full') evos.forEach(e => p2.upgrades.push(e.id));

        const curCX = p2.x + (p2.w || C.tankW) / 2;
        clearOwnedSummons(p2);
        p2.setupForNewRound();
        p2.x = Math.max(0, Math.min(canvas.width - p2.w, curCX - p2.w / 2));
        p2.hp = p2.maxHp;
        p2.bullets = [];
        p2.bowChargeTimer = 0;
        p2.sukunaChargeTimer = 0;
        p2.lazerCharge = 0;
        p2.overloadCharge = 0;
        p2.mirrorCharge = 0;
        inputs.p2.l = false;
        inputs.p2.r = false;
        inputs.p2.s = false;

        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 15, `BODY: ${mod.name}`, "#00f0ff", 16);
        this.renderBotWeaponModal();
        this.closeBotWeaponModal();
    }

    changePlayerWeapon(bodyId, evoPreset = null) {
        if (!p1) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí & evo cũ của Người chơi (Player 1)
        const bodyIds = MODULES.BODY.map(m => m.id);
        const allEvoIds = Object.values(EVOLUTIONS || {}).flat().map(e => e.id);
        p1.upgrades = p1.upgrades.filter(u => !bodyIds.includes(u) && !allEvoIds.includes(u));
        p1.upgrades.push(bodyId);

        const targetEvo = evoPreset !== null ? evoPreset : this.weaponEvoPreset;
        const evos = (EVOLUTIONS && EVOLUTIONS[bodyId]) ? EVOLUTIONS[bodyId] : [];
        if (targetEvo === '1' && evos[0]) p1.upgrades.push(evos[0].id);
        else if (targetEvo === '2' && evos[1]) p1.upgrades.push(evos[1].id);
        else if (targetEvo === 'full') evos.forEach(e => p1.upgrades.push(e.id));

        const curCX = p1.x + (p1.w || C.tankW) / 2;
        clearOwnedSummons(p1);
        p1.setupForNewRound();
        p1.x = Math.max(0, Math.min(canvas.width - p1.w, curCX - p1.w / 2));
        p1.hp = p1.maxHp;
        p1.bullets = [];
        p1.bowChargeTimer = 0;
        p1.sukunaChargeTimer = 0;
        p1.lazerCharge = 0;
        p1.overloadCharge = 0;
        p1.mirrorCharge = 0;
        inputs.p1.l = false;
        inputs.p1.r = false;
        inputs.p1.s = false;

        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p1.x + p1.w / 2, p1.y - 20, `BODY BẠN: ${mod.name} ⭐`, "#2ecc71", 16);
        this.renderBotWeaponModal();
        this.closeBotWeaponModal();
    }

    update(bot, player) {
        if (!this.enabled || !bot || !player || gameState.phase !== 'playing') {
            return;
        }

        this.timer++;

        if (this.infiniteAmmo && player) {
            this.refillPlayerResources(player);
        }

        // 1. Chế độ Dummy (Đứng yên làm bao cát)
        if (this.mode === 'dummy') {
            inputs.p2.l = false;
            inputs.p2.r = false;
            inputs.p2.s = false;
            return;
        }

        // 2. Chế độ Shooter (Chỉ bắn theo nhịp đều đặn, di chuyển bám trục)
        if (this.mode === 'shooter') {
            const botCenterX = bot.x + bot.w / 2;
            const playerCenterX = player.x + player.w / 2;

            if (botCenterX < playerCenterX - 45) {
                inputs.p2.r = true; inputs.p2.l = false;
            } else if (botCenterX > playerCenterX + 45) {
                inputs.p2.l = true; inputs.p2.r = false;
            } else {
                inputs.p2.l = false; inputs.p2.r = false;
            }

            // Nhịp bắn: Chu kỳ 60 frames (~1s), nhấn giữ 18 frames rồi nhả
            this.shootCycle = (this.shootCycle + 1) % 60;
            inputs.p2.s = (this.shootCycle < 18);
            return;
        }

        // 3. Bot thông minh (Giải Đấu PVE & chế độ Combat của phòng tập)
        if (this.mode === 'pve' || this.mode === 'combat') {
            if (!this.smart) this.smart = new SmartBot(this.level || 3);
            this.smart.update(bot, player, inputs.p2);
            return;
        }
    }

    updateToolbarUI() {
        const btnDummy = document.getElementById('btnBotDummy');
        const btnShooter = document.getElementById('btnBotShooter');
        const btnCombat = document.getElementById('btnBotCombat');
        const btnGod = document.getElementById('btnBotGodMode');
        const btnP1God = document.getElementById('btnPlayerGodMode');
        const btnInfAmmo = document.getElementById('btnInfiniteAmmo');
        const btnAutoCrate = document.getElementById('btnToggleAutoCrate');
        const btnMap = document.getElementById('btnCycleSandboxMap');
        const btnP1Evo = document.getElementById('btnCycleP1Evo');
        const btnP2Evo = document.getElementById('btnCycleP2Evo');

        if (btnDummy) btnDummy.classList.toggle('active', this.mode === 'dummy');
        if (btnShooter) btnShooter.classList.toggle('active', this.mode === 'shooter');
        if (btnCombat) btnCombat.classList.toggle('active', this.mode === 'combat');

        const btnLv = document.getElementById('btnBotLevel');
        if (btnLv) btnLv.innerText = `🧠 CẤP: ${BOT_LEVELS[this.level].name}`;

        if (btnGod) {
            btnGod.classList.toggle('active-god', this.isGodMode);
            btnGod.innerText = this.isGodMode ? '🛡️ BOT BẤT TỬ: BẬT' : '🛡️ BOT BẤT TỬ: TẮT';
        }
        if (btnP1God) {
            btnP1God.classList.toggle('active-god', this.isPlayerGodMode);
            btnP1God.innerText = this.isPlayerGodMode ? '🛡️ BẠN BẤT TỬ: BẬT' : '🛡️ BẠN BẤT TỬ: TẮT';
        }
        if (btnInfAmmo) {
            btnInfAmmo.classList.toggle('active', this.infiniteAmmo);
            btnInfAmmo.innerText = this.infiniteAmmo ? '♾️ VÔ HẠN ĐẠN: BẬT' : '♾️ VÔ HẠN ĐẠN: TẮT';
        }
        if (btnAutoCrate) {
            btnAutoCrate.classList.toggle('active', !this.freezeNaturalSpawns);
            btnAutoCrate.innerText = this.freezeNaturalSpawns ? '🔒 THÙNG TỰ NHIÊN: TẮT' : '🎲 THÙNG TỰ NHIÊN: BẬT';
        }
        if (btnMap) {
            const curMap = SANDBOX_MAPS.find(m => m.id === (gameState.currentMap || 'classic')) || SANDBOX_MAPS[0];
            btnMap.innerText = `🗺️ MAP: ${curMap.name}`;
        }
        const evoLabels = { '0': 'CƠ BẢN', '1': 'EVO 1', '2': 'EVO 2', 'full': 'FULL EVO ⭐' };
        if (btnP1Evo && p1) {
            const st = this.getPlayerEvoStage(p1);
            btnP1Evo.innerText = `🧬 EVO BẠN: ${evoLabels[st]}`;
        }
        if (btnP2Evo && p2) {
            const st = this.getPlayerEvoStage(p2);
            btnP2Evo.innerText = `🧬 EVO BOT: ${evoLabels[st]}`;
        }
    }

    toggleToolbar() {
        const toolbar = document.getElementById('trainingToolbar');
        const btn = document.getElementById('btnToggleTrainingToolbar');
        if (!toolbar || !btn) return;
        toolbar.classList.toggle('collapsed');
        btn.innerText = toolbar.classList.contains('collapsed') ? '▸' : '▾';
    }

    openPlayerWeaponModal() {
        this.modalTarget = 'player';
        const total = (typeof MODULES !== 'undefined' && MODULES.BODY) ? MODULES.BODY.length : 67;
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = `👤 CHỌN BODY CHO BẠN (${total} BODY)`;
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Tìm kiếm, lọc theo Hệ/Tộc và chọn mức Tiến Hóa để thử nghiệm ngay cho Bạn (Player 1):';
        this.openWeaponModalCommon();
    }

    openBotWeaponModal() {
        this.modalTarget = 'bot';
        const total = (typeof MODULES !== 'undefined' && MODULES.BODY) ? MODULES.BODY.length : 67;
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = `🤖 CHỌN BODY CHO BOT (${total} BODY)`;
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Tìm kiếm, lọc theo Hệ/Tộc và chọn mức Tiến Hóa để Bot trang bị ngay lập tức:';
        this.openWeaponModalCommon();
    }

    openWeaponModalCommon() {
        const modal = document.getElementById('botWeaponModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderBotWeaponModal();
        }
    }

    closeBotWeaponModal() {
        const modal = document.getElementById('botWeaponModal');
        if (modal) modal.style.display = 'none';
    }

    renderBotWeaponModal() {
        const grid = document.getElementById('botWeaponGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const targetPlayer = (this.modalTarget === 'player') ? p1 : p2;
        const currentWeapon = targetPlayer ? targetPlayer.weapon : 'basic';
        const q = (this.weaponSearchQuery || '').trim().toLowerCase();

        const filtered = MODULES.BODY.filter(mod => {
            if (this.weaponRoleFilter === 'COLLAB') {
                if (typeof collabBonusOf !== 'function' || !collabBonusOf(mod.id)) return false;
            } else if (this.weaponRoleFilter !== 'ALL') {
                const roles = Array.isArray(mod.role) ? mod.role : [];
                if (!roles.includes(this.weaponRoleFilter)) return false;
            }
            if (q) {
                const hay = `${mod.name} ${mod.id} ${mod.desc || ''} ${(mod.role || []).join(' ')}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        filtered.forEach(mod => {
            const item = document.createElement('div');
            item.className = 'bot-weapon-item' + (mod.id === currentWeapon ? ' current' : '');
            const statsText = mod.stats ? `HP:${mod.stats.hp} | Dame:${mod.stats.dmg} | Đạn:${mod.stats.ammo}` : '';
            item.innerHTML = `
                <div class="bwi-name">${mod.name} <span style="opacity:0.55;font-size:9px;">(${mod.id})</span></div>${typeof roleBadges === 'function' ? roleBadges(mod) : ''}
                <div class="bwi-stats">${statsText}</div>
                <div class="bwi-desc">${mod.desc || ''}</div>
            `;
            item.onclick = () => this.pickSandboxBody(mod.id, false);
            grid.appendChild(item);

            // Cơ Bản: lựa chọn riêng "MAIN" (chỉ có trong Phòng Tập) — vào thẳng dạng MAIN đã Thức Tỉnh
            if (mod.id === 'basic') {
                const mainItem = document.createElement('div');
                const isMain = currentWeapon === 'basic' && targetPlayer && targetPlayer.mainAwakened;
                mainItem.className = 'bot-weapon-item' + (isMain ? ' current' : '');
                mainItem.style.borderColor = '#ffb020';
                mainItem.innerHTML = `
                    <div class="bwi-name" style="color:#ffb020">🔥 MAIN (Cơ Bản Thức Tỉnh)</div>
                    <div class="bwi-stats">Phòng Tập: vào thẳng dạng MAIN</div>
                    <div class="bwi-desc">Cơ Bản bản MAIN (bình thường chỉ 8% mỗi trận): Full Evo sẵn, đã Thức Tỉnh — x2 Max HP, +1 Dame/viên, 10 đạn; hiệp quyết định kích hoạt Cơ Hội Cuối.</div>
                `;
                mainItem.onclick = () => this.pickSandboxBody('basic', true);
                grid.appendChild(mainItem);
            }
        });
    }

    // Phòng Tập: chọn body (Cơ Bản: main=true -> dạng MAIN, false -> Cơ Bản thường)
    pickSandboxBody(bodyId, main) {
        const tp = (this.modalTarget === 'player') ? p1 : p2;
        if (tp && bodyId === 'basic') {
            tp.mainEgg = !!main;
            tp.mainAwakened = !!main;
            if (!main) tp.upgrades = tp.upgrades.filter(u => u !== 'evo_basic_1' && u !== 'evo_basic_2');
        }
        const preset = main ? 'full' : this.weaponEvoPreset;
        if (this.modalTarget === 'player') this.changePlayerWeapon(bodyId, preset);
        else this.changeBotWeapon(bodyId, preset);
    }

    // ==========================================
    // HỆ THỐNG TEST BOX & XE BẢN ĐỒ (SANDBOX BOX MODAL)
    // ==========================================
    openTestBoxModal() {
        const modal = document.getElementById('sandboxBoxModal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.renderTestBoxModal();
    }

    closeTestBoxModal() {
        const modal = document.getElementById('sandboxBoxModal');
        if (modal) modal.style.display = 'none';
    }

    renderTestBoxModal() {
        const grid = document.getElementById('sandboxBoxGrid');
        if (!grid) return;
        grid.innerHTML = '';

        SANDBOX_BOX_CATALOG.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'bot-weapon-item sandbox-box-item';
            card.style.borderColor = entry.color;
            card.innerHTML = `
                <div class="bwi-name" style="color:${entry.color};display:flex;justify-content:space-between;align-items:center;">
                    <span>${entry.icon} ${entry.name}</span>
                    <span class="sb-item-badge">${entry.badge}</span>
                </div>
                <div class="bwi-desc" style="-webkit-line-clamp:3;">${entry.desc}</div>
            `;
            card.onclick = () => {
                this.spawnOrTriggerBoxItem(entry);
            };
            grid.appendChild(card);
        });
    }

    getBoxSpawnCoords(mode) {
        const W = canvas.width || 400;
        const H = canvas.height || 600;
        if (mode === 'front_p1' && p1) {
            return {
                x: Math.max(24, Math.min(W - 46, p1.x + p1.w / 2 - 11)),
                y: Math.max(80, p1.y - 78)
            };
        }
        if (mode === 'front_p2' && p2) {
            return {
                x: Math.max(24, Math.min(W - 46, p2.x + p2.w / 2 - 11)),
                y: Math.min(H - 90, p2.y + p2.h + 56)
            };
        }
        return {
            x: 45 + Math.random() * (W - 90),
            y: H * 0.32 + Math.random() * (H * 0.36)
        };
    }

    triggerCrateBreakImmediately(crate, opener) {
        if (!crate || !opener) return;
        crate.active = false;
        if (typeof crateOnBreak === 'function') crateOnBreak(crate, opener);
        if (crate.isMimic && typeof triggerMimicExplosion === 'function') {
            triggerMimicExplosion(crate, opener);
        }
        if (crate.type === 'hp') {
            if (opener.weapon === 'necromancer') {
                const cap = (opener.maxSouls || 12) - (opener.lockedSouls || 0);
                opener.currentSouls = Math.min(cap, (opener.currentSouls || 0) + 4);
                addFloatingText(opener.x + opener.w / 2, opener.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
            } else {
                opener.hp = Math.min(opener.hp + 1, opener.maxHp);
                addFloatingText(opener.x + opener.w / 2, opener.y - 15, "+1.0 HP 💚", "#2ecc71", 13);
            }
        }
        if (crate.type === 'ammo' && typeof opener.onCollectAmmoCrate === 'function') {
            opener.onCollectAmmoCrate(crate);
        }
        if (crate.type === 'shield') {
            opener.shield = (opener.shield || 0) + 1;
            addFloatingText(opener.x + opener.w / 2, opener.y - 15, "+1 KHIÊN 🛡️", "#3498db", 13);
        }
        if (crate.type === 'dmg') {
            opener.dmgBuff = (opener.dmgBuff || 0) + 1;
            addFloatingText(opener.x + opener.w / 2, opener.y - 15, "+1.0 SÁT THƯƠNG 🟣", "#a855f7", 13);
        }
        if (opener.weapon === 'evolution' && typeof opener.onEvolutionCrateEat === 'function') {
            opener.onEvolutionCrateEat(crate.type);
        }
        if (crate.type === 'coin') {
            let money = 30;
            if (opener.weapon === 'money_tank') money *= 2;
            if (opener.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
            addFloatingText(opener.x + opener.w / 2, opener.y - 15, `+$${money} 💰`, "#f1c40f", 13);
        }
        if (crate.type === 'gear') {
            opener.ammo = Math.min(opener.maxAmmo, (opener.ammo || 0) + 1);
            opener.hp = Math.min(opener.maxHp, opener.hp + 0.25);
            opener.gears = (opener.gears || 0) + 1;
            opener.components = (opener.components || 0) + 1;
            addFloatingText(opener.x + opener.w / 2, opener.y - 15, "+1 GEAR/LK ⚙️", "#00ffcc", 13);
        }
        if (typeof updateScoreBoard === 'function') updateScoreBoard();
    }

    spawnOrTriggerBoxItem(entry) {
        if (!entry) return;
        const mode = this.boxSpawnMode || 'front_p1';

        if (entry.kind === 'crate') {
            const c = new Crate();
            if (entry.id === 'mimic') {
                c.type = 'coin';
                c.isMimic = true;
            } else {
                c.type = entry.id;
                c.isMimic = false;
            }
            // Trong Phòng Tập: kéo dài thời gian tồn tại của thùng lên 60s để thoải mái test
            c.lifeTime = 60000;

            if (mode === 'break_p1' || mode === 'break_p2') {
                const target = (mode === 'break_p1') ? p1 : p2;
                if (target) {
                    c.x = target.x + target.w / 2 - c.w / 2;
                    c.y = target.id === 1 ? target.y - 36 : target.y + target.h + 14;
                    this.triggerCrateBreakImmediately(c, target);
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                }
                return;
            }

            const pos = this.getBoxSpawnCoords(mode);
            c.x = pos.x;
            c.y = pos.y;
            crates.push(c);
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            addFloatingText(c.x + c.w / 2, c.y - 10, `${entry.icon} ${entry.name}`, entry.color, 12);
            return;
        }

        if (entry.kind === 'vehicle') {
            let v = null;
            if (entry.id === 'money_truck') {
                v = new MoneyTruck();
            } else if (entry.id === 'mv_buff') {
                v = new MapVehicle('buff');
            } else if (entry.id === 'mv_heal') {
                v = new MapVehicle('heal');
            } else if (entry.id.startsWith('mv_atk_')) {
                v = new MapVehicle('atk');
                v.variant = entry.id.replace('mv_atk_', '');
            }
            if (v) {
                v.x = canvas.width / 2 - v.w / 2;
                moneyTrucks.push(v);
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                addFloatingText(v.x + v.w / 2, v.y - 12, `${entry.icon} ${entry.name}`, entry.color, 13);
            }
            return;
        }

        if (entry.kind === 'hazard') {
            if (entry.id === 'obstacle') {
                movingObstacle = new MovingObstacle();
                movingObstacle.x = canvas.width / 2 - movingObstacle.w / 2;
                movingObstacle.lifeTime = 30000;
            } else if (entry.id === 'bastion') {
                const pos = this.getBoxSpawnCoords(mode);
                bastions.push(new BastionWall(Math.max(20, Math.min(canvas.width - 90, pos.x - 24)), pos.y));
            } else if (entry.id === 'artillery') {
                if (p1) artilleryHazards.push(new ArtilleryHazard(p1.x + p1.w / 2, p1.y + p1.h / 2));
                if (p2) artilleryHazards.push(new ArtilleryHazard(p2.x + p2.w / 2, p2.y + p2.h / 2));
            }
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        }
    }

    spawnCrateRain(count = 8) {
        for (let i = 0; i < count; i++) {
            const c = new Crate();
            c.lifeTime = 45000;
            c.x = 35 + Math.random() * (canvas.width - 70);
            c.y = 95 + Math.random() * (canvas.height - 190);
            crates.push(c);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 16, `🌧️ ĐÃ THẢ ${count} THÙNG GACHA!`, "#38bdf8", 14);
    }

    spawnAllCrateTypesRow() {
        const crateEntries = SANDBOX_BOX_CATALOG.filter(e => e.kind === 'crate');
        const cols = 8;
        const spacingX = Math.max(32, Math.floor((canvas.width - 48) / cols));
        const baseY = canvas.height / 2 - 28;
        crateEntries.forEach((entry, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const c = new Crate();
            if (entry.id === 'mimic') {
                c.type = 'coin';
                c.isMimic = true;
            } else {
                c.type = entry.id;
                c.isMimic = false;
            }
            c.lifeTime = 90000;
            c.x = 24 + col * spacingX;
            c.y = baseY + row * 38;
            crates.push(c);
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 16, "🧪 ĐÃ XẾP ĐỦ 16 LOẠI THÙNG GIỮA SÂN!", "#4ade80", 14);
        this.closeTestBoxModal();
    }

    startPractice() {
        this.enabled = true;
        if (this.mode === 'pve') this.mode = 'dummy';
        this.smart = new SmartBot(this.level);
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'none';
            mainMenu.classList.remove('active');
        }
        const toolbar = document.getElementById('trainingToolbar');
        if (toolbar) toolbar.style.display = 'flex';

        startBattle();
        this.updateToolbarUI();
    }

    exitPractice() {
        this.enabled = false;
        this.isPlayerGodMode = false;
        this.infiniteAmmo = false;
        this.freezeNaturalSpawns = false;
        const toolbar = document.getElementById('trainingToolbar');
        if (toolbar) toolbar.style.display = 'none';
        this.closeBotWeaponModal();
        this.closeTestBoxModal();

        const pauseModal = document.getElementById('pauseMenuModal');
        if (pauseModal) pauseModal.style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.style.display = 'none';
        const upgradeScreen = document.getElementById('upgradeScreen');
        if (upgradeScreen) upgradeScreen.style.display = 'none';
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'flex';
        gameState.phase = 'menu';
        gameState.isPaused = false;
        cancelAnimationFrame(animationId);
    }

    initEvents() {
        const openPracticeBtn = document.getElementById('openPracticeBtn');
        if (openPracticeBtn) {
            openPracticeBtn.addEventListener('click', () => this.startPractice());
        }

        const btnToggle = document.getElementById('btnToggleTrainingToolbar');
        if (btnToggle) btnToggle.addEventListener('click', () => this.toggleToolbar());

        const btnDummy = document.getElementById('btnBotDummy');
        if (btnDummy) btnDummy.addEventListener('click', () => this.setMode('dummy'));

        const btnShooter = document.getElementById('btnBotShooter');
        if (btnShooter) btnShooter.addEventListener('click', () => this.setMode('shooter'));

        const btnCombat = document.getElementById('btnBotCombat');
        if (btnCombat) btnCombat.addEventListener('click', () => this.setMode('combat'));

        const btnLv = document.getElementById('btnBotLevel');
        if (btnLv) btnLv.addEventListener('click', () => this.cycleLevel());

        const btnGod = document.getElementById('btnBotGodMode');
        if (btnGod) btnGod.addEventListener('click', () => this.toggleGodMode());

        const btnP1God = document.getElementById('btnPlayerGodMode');
        if (btnP1God) btnP1God.addEventListener('click', () => this.togglePlayerGodMode());

        const btnInfAmmo = document.getElementById('btnInfiniteAmmo');
        if (btnInfAmmo) btnInfAmmo.addEventListener('click', () => this.toggleInfiniteAmmo());

        const btnTestFin = document.getElementById('btnTestFinisher');
        if (btnTestFin) btnTestFin.addEventListener('click', () => this.testFinisher());

        const btnOpenShop = document.getElementById('btnOpenSandboxShop');
        if (btnOpenShop) btnOpenShop.addEventListener('click', () => this.openSandboxShop());

        const btnClear = document.getElementById('btnClearArena');
        if (btnClear) btnClear.addEventListener('click', () => this.clearArena());

        const btnP1Evo = document.getElementById('btnCycleP1Evo');
        if (btnP1Evo) btnP1Evo.addEventListener('click', () => this.cyclePlayerEvo('p1'));

        const btnP2Evo = document.getElementById('btnCycleP2Evo');
        if (btnP2Evo) btnP2Evo.addEventListener('click', () => this.cyclePlayerEvo('p2'));

        const btnAutoCrate = document.getElementById('btnToggleAutoCrate');
        if (btnAutoCrate) btnAutoCrate.addEventListener('click', () => this.toggleAutoCrate());

        const btnCycleMap = document.getElementById('btnCycleSandboxMap');
        if (btnCycleMap) btnCycleMap.addEventListener('click', () => this.cycleSandboxMap());

        const btnOpenPlayerModal = document.getElementById('btnOpenPlayerWeaponModal');
        if (btnOpenPlayerModal) btnOpenPlayerModal.addEventListener('click', () => this.openPlayerWeaponModal());

        const btnOpenModal = document.getElementById('btnOpenBotWeaponModal');
        if (btnOpenModal) btnOpenModal.addEventListener('click', () => this.openBotWeaponModal());

        const btnCloseModal = document.getElementById('closeBotWeaponBtn');
        if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeBotWeaponModal());

        const btnCloseFooter = document.getElementById('closeBotWeaponFooterBtn');
        if (btnCloseFooter) btnCloseFooter.addEventListener('click', () => this.closeBotWeaponModal());

        // Bộ lọc Tìm Kiếm / Vai Trò / Evo Preset trong Modal Chọn Body
        const searchInput = document.getElementById('weaponSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.weaponSearchQuery = e.target.value || '';
                this.renderBotWeaponModal();
            });
        }
        const roleTabs = document.querySelectorAll('#weaponRoleTabs .gear-filter-btn');
        roleTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                roleTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.weaponRoleFilter = btn.dataset.role || 'ALL';
                this.renderBotWeaponModal();
            });
        });
        const evoBtns = document.querySelectorAll('#weaponEvoPresetGroup .gear-filter-btn');
        evoBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                evoBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.weaponEvoPreset = btn.dataset.evo || '0';
            });
        });

        // Sự kiện Modal Test Box
        const btnOpenBoxModal = document.getElementById('btnOpenTestBoxModal');
        if (btnOpenBoxModal) btnOpenBoxModal.addEventListener('click', () => this.openTestBoxModal());

        const btnCloseBox = document.getElementById('closeSandboxBoxBtn');
        if (btnCloseBox) btnCloseBox.addEventListener('click', () => this.closeTestBoxModal());

        const btnCloseBoxFooter = document.getElementById('closeSandboxBoxFooterBtn');
        if (btnCloseBoxFooter) btnCloseBoxFooter.addEventListener('click', () => this.closeTestBoxModal());

        const boxModeBtns = document.querySelectorAll('#sandboxBoxModeTabs .gear-filter-btn');
        boxModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                boxModeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.boxSpawnMode = btn.dataset.bmode || 'front_p1';
            });
        });

        const btnRain = document.getElementById('btnBoxSpawnRain');
        if (btnRain) btnRain.addEventListener('click', () => this.spawnCrateRain(8));

        const btnAllTypes = document.getElementById('btnBoxSpawnAllTypes');
        if (btnAllTypes) btnAllTypes.addEventListener('click', () => this.spawnAllCrateTypesRow());

        const btnBoxClear = document.getElementById('btnBoxClearAll');
        if (btnBoxClear) btnBoxClear.addEventListener('click', () => this.clearArena());

        const btnHeal = document.getElementById('btnHealAll');
        if (btnHeal) btnHeal.addEventListener('click', () => this.healAll());

        const btnAddCoin = document.getElementById('btnAddCoins');
        if (btnAddCoin) btnAddCoin.addEventListener('click', () => this.addCoins());

        const btnExit = document.getElementById('btnExitPractice');
        if (btnExit) btnExit.addEventListener('click', () => this.exitPractice());
    }
}
const botAI = new BotAIController();
