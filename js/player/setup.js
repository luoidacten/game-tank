// ==========================================
// Player — Khởi tạo chỉ số đầu hiệp (dùng chung mọi nhân vật)
// ==========================================

Object.assign(Player.prototype, {
    getSpeed() {
        let currentSpeed = this.speed;
        if (this.slowTimer > 0) currentSpeed *= 0.5;
        if (this.acidBurnTimer > 0) currentSpeed *= 0.75;
        if (this.acidZoneSlow > 0) currentSpeed *= 0.75;
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            let spdBonus = ((this.geniusUpgrades && this.geniusUpgrades['gen_speed']) || 0) * 0.15;
            currentSpeed *= 0.65 * (1 + spdBonus);
        }
        if (this.weapon === 'van_kiem' && this.isInSwordStance) {
            currentSpeed = this.hasUpgrade('evo_vk_2') ? 1.0 : 0;
        }
        if (this.weapon === 'sniper') {
            currentSpeed *= 0.5;
        }
        if (this.weapon === 'mirror' && this.mirrorBuffTimer > 0) {
            currentSpeed += this.hasUpgrade('evo_mirror_1') ? 3 : 1.5;
        }
        if (this.weapon === 'ghost' && this.isGhostActive) {
            currentSpeed *= 1.35;
        }
        return currentSpeed;
    },

    setupForNewRound() {
        // 1. CẤU HÌNH CƠ BẢN
        let baseStats = { hp: 6, dmg: 1, ammo: 5 };
        this.weapon = 'basic';
        const bodyIds = MODULES.BODY.map(m => m.id);
        const myBodyId = this.upgrades.find(u => bodyIds.includes(u));
        let modInfo = null;
        if (myBodyId) {
            this.weapon = myBodyId;
            modInfo = MODULES.BODY.find(m => m.id === myBodyId);
            if (modInfo && modInfo.stats) baseStats = { ...modInfo.stats };
        }

        // KÍCH THƯỚC XE DỰA TRÊN PHÂN NHÓM (Hitbox w & h)
        if (modInfo && modInfo.size) {
            this.w = modInfo.size.w;
            this.h = modInfo.size.h;
        } else {
            this.w = C.tankW;
            this.h = C.tankH;
        }

        this.speed = C.baseSpeed;
        if (modInfo && modInfo.stats && modInfo.stats.speedMult) {
            this.speed *= modInfo.stats.speedMult;
        }
        this.myBulletColor = (this.id === 1) ? '#3498db' : '#e74c3c';

        this.maxHp = baseStats.hp;

        // Thưởng máu cho xe to (Hitbox w > 30): Càng lớn cộng càng nhiều máu cho công bằng
        if (this.w > 30) {
            let sizeBonusHp = 0;
            if (this.w >= 38) sizeBonusHp = 5;
            else if (this.w >= 37) sizeBonusHp = 4;
            else if (this.w >= 36) sizeBonusHp = 3;
            else if (this.w >= 34) sizeBonusHp = 2;
            else if (this.w > 30) sizeBonusHp = 1;
            this.maxHp += sizeBonusHp;
        }

        this.damage = baseStats.dmg;
        this.maxAmmo = baseStats.ammo;
        this.bulletCount = 1;
        this.reloadTime = C.reloadTime;

        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') {
            this.speed *= 1.35;
            this.reloadTime *= 0.5;
        }

        // 3. ÁP DỤNG CÁC NÂNG CẤP CHỈ SỐ (UPGRADES & EVOLUTIONS)

        // --- Money Tank Level Up ---
        this.setupMoneyTank();

        // cung
        this.setupCung();

        // shadow_hunter
        this.setupShadowHunter();

        // shortgunATK
        this.setupShortgunATK();

        // --- Full Evo & Basic Logic ---
        // SỬA LỖI: Gom logic Basic vào một chỗ để tránh cộng dồn sai
        this.setupBasic();

        // --- Weapon Specific Stat Modifiers ---
        if (this.hasUpgrade('evo_shot_1')) { this.bulletCount = 5; }
        if (this.hasUpgrade('evo_shot_2')) { this.maxAmmo = 4; }
        if (this.hasUpgrade('evo_smg_1')) { this.maxAmmo = 26; this.damage *= 0.85; }
        if (this.hasUpgrade('evo_smg_2')) { this.maxAmmo = 26; this.reloadTime = 400; }
        if (this.hasUpgrade('evo_lazer_a_2')) { this.damage *= 1.5; }
        if (this.hasUpgrade('evo_lazer_c_2')) { this.reloadTime = 1000; }
        if (this.weapon === 'portal') this.speed += 1.5;

        // --- KIẾM TÔN (BLADE GOD) ---
        this.setupBladeGod();
        // Thêm vào phần setup vũ khí của Player

        this.setupTheStrongest();
        // --- MAGICIAN LOGIC ---
        this.confusionStacks = 0; // Tầng Loạn Ảnh
        this.vulnerableStacks = 0; // Tầng Suy Yếu (Debuff Stack)
        this.confusionTimer = 0;
        this.inputDelayQueue = [];
        this.setupMagician();

        // --- KIẾM TRẬN (VAN KIEM) ---
        this.setupVanKiem();
        // --- SNIPER LOGIC ---
        this.setupSniper();
        // --- INVENTOR LOGIC ---
        this.setupInventor();

        // --- PARADOX LOGIC ---
        this.setupParadox();
        // --- AAA Logic ---
        this.setupAaa();

        // --- ENGINEER LOGIC ---
        this.setupEngineer();

        // --- THUNDER LOGIC ---
        this.setupThunder();

        // --- MAGNET LOGIC ---
        this.setupMagnet();

        // --- EVOLUTION LOGIC ---
        this.setupEvolution();

        // ---Âm Dương sư Logic ---
        this.setupAmDuongSu();

        // 5. KHỞI TẠO BIẾN RIÊNG CHO TỪNG VŨ KHÍ (WEAPON SPECIFIC VARS)
        // --- ENERGY SYSTEM (SÚNG NƯỚC & LÒ NUNG) ---
        this.maxEnergy = 100;
        this.energy = 100;
        this.energyChargeTimer = 0; // Bộ đếm giữ nút
        this.isSpraying = false;    // Trạng thái đang phun (Evo 1)
        this.energyUsedAcc = 0;     // Tích lũy năng lượng đã xài (Lò nung Evo 2)
        this.nextShotFireZone = false;

        // Quản lý Hiệu ứng bất lợi (Debuff) trên người chơi
        this.burnStacks = 0;
        this.burnTimer = 0;
        this.bindingCurseStacks = 0;
        this.bindingCurseTimer = 0;
        this.permanentSlow = 0;
        this.permanentVulnerability = 0;

        this.setupDeathLock();

        this.setupCreator();

        // --- SUKUNA LOGIC ---
        this.setupSukuna();

        // --- 6 NÒNG (MINIGUN) ---
        this.setupSixBarrel();
        // --- MIRROR LOGIC ---
        this.setupMirror();

        // --- TANK LOGIC (Sắp xếp lại) ---
        this.setupTank();

        // --- WIND SLASH ---
        this.setupWindSlash();

        // --- STORM ---
        this.setupStorm();

        // --- GHOST ---
        this.setupGhost();
        // 4. ÁP DỤNG FEET (GIÀY/PHỤ KIỆN) - QUAN TRỌNG: Đặt trước logic tính Dash Tank
        const feetIds = MODULES.FEET.map(m => m.id);
        this.upgrades.forEach(uId => {
            if (feetIds.includes(uId)) {
                if (uId === 'speed') this.speed += 1.5;
                if (uId === 'armor') this.maxHp += 1;
                if (uId === 'damage') this.damage *= 1.25;
            }
        });

        // --- CÁC BIẾN CỜ & TIMER KHÁC ---
        this.bullets = [];
        this.chargeLevel = 0;
        this.lastShot = Date.now();
        this.lastReload = 0;
        this.revived = false;
        this.invincibleTimer = 0;
        this.nextShotExplosive = false;

        this.shield = (this.weapon === 'money_tank' && this.upgradeLevel >= 3) ? 1 : 0;
        if (this.weapon === 'tank') this.shield = 0; // Reset lại shield tank (sẽ tự hồi bằng passiveShieldTimer)

        // Silence Debuff
        this.silenceTimer = 0;

        // SMG Var
        this.dmgBuff = 0;
        this.smgSprayCount = 0;

        // Ice Vars
        this.slowTimer = 0;
        this.freezeTimer = 0;
        this.coldStack = 0;
        this.iceShotCount = 0;
        this.iceZoneTriggerCount = 0;
        this.iceAutoFreezeTimer = 0;

        // Portal Vars
        this.lastPortalBoost = 0;
        this.lastPortalFullBonus = 0;
        this.portalBulletSpeedBonus = 0;

        // Acid / Engi Vars
        this.acidShotCount = 0;
        this.acidBurnTimer = 0;
        this.turretTimer = 0;
        this.overloadCharge = 0;
        this.isOverloaded = false;
        this.overloadDuration = 0;
        this.aaaAutoTimer = 0;

        // Shadow Hunter & Shortgun & Motion Trail debuff / tracker resets
        this.blindTimer = 0;
        this.bleedTimer = 0;
        this.bleedInterval = 0;
        this.bleedDmg = 0;
        this.trailHistory = [];
        this.prevInpS = false;

        // Necromancer setup
        this.setupNecromancer();

        // Genius setup
        this.setupGenius();

        // 6. FINAL STATE RESET (QUAN TRỌNG NHẤT)
        // Đặt ở cuối cùng để đảm bảo nhận đủ MaxHP và MaxAmmo từ tất cả nguồn trên
        this.hp = this.maxHp;
        this.ammo = this.maxAmmo;

        // 7. VỊ TRÍ XUẤT PHÁT
        this.x = (canvas.width / 2) - (this.w / 2);
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;
    }
});
