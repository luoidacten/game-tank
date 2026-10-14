// ==========================================
// AI Bot (phòng tập)
// ==========================================



// ============================================================================
// BOT TEST / PRACTICE MODE CONTROLLER (DUMMY, SHOOTER, COMBAT, GODMODE, BODY)
// ============================================================================
class BotAIController {
    constructor() {
        this.enabled = false;
        this.mode = 'dummy'; // 'dummy' | 'shooter' | 'combat'
        this.isGodMode = false;
        this.timer = 0;
        this.shootCycle = 0;
        this.level = 3;      // cấp bot thông minh trong phòng tập (1-5)
        this.smart = null;
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
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, this.isGodMode ? "BẤT TỬ: BẬT 🛡️" : "BẤT TỬ: TẮT", this.isGodMode ? "#ffd700" : "#ef4444", 14);
        }
    }

    healAll() {
        if (p1) {
            p1.hp = p1.maxHp;
            p1.shield = Math.max(p1.shield, 1);
            addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+FULL HP", "#2ecc71", 15);
        }
        if (p2) {
            p2.hp = p2.maxHp;
            p2.shield = Math.max(p2.shield, 1);
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, "+FULL HP", "#2ecc71", 15);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    addCoins() {
        gameState.p1Coins += 100;
        gameState.p2Coins += 100;
        if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+$100", "#f1c40f", 15);
        if (p2) addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, "+$100", "#f1c40f", 15);
    }

    changeBotWeapon(bodyId) {
        if (!p2) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí cũ của Bot
        const bodyIds = MODULES.BODY.map(m => m.id);
        p2.upgrades = p2.upgrades.filter(u => !bodyIds.includes(u));
        p2.upgrades.push(bodyId);

        // [FIX] Giữ tâm xe theo trục X; Y do setupForNewRound tính theo kích thước body mới
        // (trước đây giữ Y cũ khiến xe to/nhỏ bị lơ lửng hoặc lún khỏi mép sân).
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

        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 15, `BODY: ${mod.name}`, "#00f0ff", 16);
        this.renderBotWeaponModal();
        this.closeBotWeaponModal();
    }

    changePlayerWeapon(bodyId) {
        if (!p1) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí cũ của Người chơi (Player 1)
        const bodyIds = MODULES.BODY.map(m => m.id);
        p1.upgrades = p1.upgrades.filter(u => !bodyIds.includes(u));
        p1.upgrades.push(bodyId);

        // [FIX] Giữ tâm xe theo trục X; Y do setupForNewRound tính theo kích thước body mới
        // (trước đây giữ Y cũ khiến xe to/nhỏ bị lơ lửng hoặc lún khỏi mép sân).
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

        // (Bot combat cũ - giữ lại để tham khảo)
        if (this.mode === 'combat_old') {
            const botCenterX = bot.x + bot.w / 2;
            const playerCenterX = player.x + player.w / 2;

            // A. Tránh né đạn nguy hiểm bay về phía Bot
            let incomingDanger = null;
            let minDist = 220;
            if (player.bullets && player.bullets.length > 0) {
                for (let b of player.bullets) {
                    if (!b.active) continue;
                    let vy = (b.vy !== undefined) ? b.vy : -5;
                    if (vy < 0 && b.y > bot.y && b.y < bot.y + minDist) {
                        let dx = Math.abs((b.x || 0) - botCenterX);
                        if (dx < 50) {
                            incomingDanger = b;
                            break;
                        }
                    }
                }
            }

            if (incomingDanger) {
                if (incomingDanger.x < botCenterX) {
                    inputs.p2.r = true; inputs.p2.l = false;
                } else {
                    inputs.p2.l = true; inputs.p2.r = false;
                }
                inputs.p2.s = (Math.abs(botCenterX - playerCenterX) < 70);
                return;
            }

            // B. Nhặt rương hoặc Xe Tiền gần
            let closestCrate = null;
            let crateDist = 200;
            for (let c of crates) {
                if (!c.active) continue;
                let dy = Math.abs(c.y - bot.y);
                if (dy < 140) {
                    let dx = Math.abs(c.x + c.w / 2 - botCenterX);
                    if (dx < crateDist) {
                        crateDist = dx;
                        closestCrate = c;
                    }
                }
            }

            if (closestCrate) {
                let targetX = closestCrate.x + closestCrate.w / 2;
                if (botCenterX < targetX - 15) {
                    inputs.p2.r = true; inputs.p2.l = false;
                } else if (botCenterX > targetX + 15) {
                    inputs.p2.l = true; inputs.p2.r = false;
                } else {
                    inputs.p2.l = false; inputs.p2.r = false;
                }
                inputs.p2.s = (Math.abs(botCenterX - playerCenterX) < 70);
                return;
            }

            // C. Di chuyển chiến đấu và nhắm bắn
            let strafe = Math.sin(this.timer * 0.05) * 60;
            let desiredX = playerCenterX + strafe;

            if (botCenterX < desiredX - 20) {
                inputs.p2.r = true; inputs.p2.l = false;
            } else if (botCenterX > desiredX + 20) {
                inputs.p2.l = true; inputs.p2.r = false;
            } else {
                inputs.p2.l = false; inputs.p2.r = false;
            }

            let alignDist = Math.abs(botCenterX - playerCenterX);
            if (alignDist < 80) {
                this.shootCycle = (this.shootCycle + 1) % 45;
                inputs.p2.s = (this.shootCycle < 25);
            } else {
                inputs.p2.s = false;
            }
        }
    }

    updateToolbarUI() {
        const btnDummy = document.getElementById('btnBotDummy');
        const btnShooter = document.getElementById('btnBotShooter');
        const btnCombat = document.getElementById('btnBotCombat');
        const btnGod = document.getElementById('btnBotGodMode');

        if (btnDummy) btnDummy.classList.toggle('active', this.mode === 'dummy');
        if (btnShooter) btnShooter.classList.toggle('active', this.mode === 'shooter');
        if (btnCombat) btnCombat.classList.toggle('active', this.mode === 'combat');

        const btnLv = document.getElementById('btnBotLevel');
        if (btnLv) btnLv.innerText = `🧠 CẤP: ${BOT_LEVELS[this.level].name}`;

        if (btnGod) {
            btnGod.classList.toggle('active-god', this.isGodMode);
            btnGod.innerText = this.isGodMode ? '🛡️ BẤT TỬ: BẬT' : '🛡️ BẤT TỬ: TẮT';
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
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = '👤 CHỌN BODY CHO BẠN (34 BODY)';
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Chọn 1 Body dưới đây để xe của bạn (Player 1) trang bị thử nghiệm ngay:';
        this.openWeaponModalCommon();
    }

    openBotWeaponModal() {
        this.modalTarget = 'bot';
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = '🤖 CHỌN BODY CHO BOT (34 BODY)';
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Chọn 1 Body dưới đây để Bot trang bị chiến đấu hoặc làm bia thử nghiệm:';
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

        MODULES.BODY.forEach(mod => {
            const item = document.createElement('div');
            item.className = 'bot-weapon-item' + (mod.id === currentWeapon ? ' current' : '');
            const statsText = mod.stats ? `HP:${mod.stats.hp} | Dame:${mod.stats.dmg} | Đạn:${mod.stats.ammo}` : '';
            item.innerHTML = `
                <div class="bwi-name">${mod.name}</div>
                <div class="bwi-stats">${statsText}</div>
                <div class="bwi-desc">${mod.desc || ''}</div>
            `;
            item.onclick = () => {
                if (this.modalTarget === 'player') {
                    this.changePlayerWeapon(mod.id);
                } else {
                    this.changeBotWeapon(mod.id);
                }
            };
            grid.appendChild(item);
        });
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

        this.updateToolbarUI();
        startBattle();
    }

    exitPractice() {
        this.enabled = false;
        const toolbar = document.getElementById('trainingToolbar');
        if (toolbar) toolbar.style.display = 'none';
        this.closeBotWeaponModal();

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

        const btnOpenPlayerModal = document.getElementById('btnOpenPlayerWeaponModal');
        if (btnOpenPlayerModal) btnOpenPlayerModal.addEventListener('click', () => this.openPlayerWeaponModal());

        const btnOpenModal = document.getElementById('btnOpenBotWeaponModal');
        if (btnOpenModal) btnOpenModal.addEventListener('click', () => this.openBotWeaponModal());

        const btnCloseModal = document.getElementById('closeBotWeaponBtn');
        if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeBotWeaponModal());

        const btnCloseFooter = document.getElementById('closeBotWeaponFooterBtn');
        if (btnCloseFooter) btnCloseFooter.addEventListener('click', () => this.closeBotWeaponModal());

        const btnHeal = document.getElementById('btnHealAll');
        if (btnHeal) btnHeal.addEventListener('click', () => this.healAll());

        const btnAddCoin = document.getElementById('btnAddCoins');
        if (btnAddCoin) btnAddCoin.addEventListener('click', () => this.addCoins());

        const btnExit = document.getElementById('btnExitPractice');
        if (btnExit) btnExit.addEventListener('click', () => this.exitPractice());
    }
}
const botAI = new BotAIController();
