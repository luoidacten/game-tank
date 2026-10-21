// ==========================================
// Luồng trận đấu: bắt đầu/kết thúc hiệp, bảng điểm
// ==========================================



function startRound() {
    cancelAnimationFrame(animationId);
    fatalCinematic = { active: false, timer: 0, maxTimer: 90, winnerId: null, victimX: 0, victimY: 0 };
    document.getElementById('upgradeScreen').style.display = 'none';
    gameState.phase = 'playing';
    crates = []; moneyTrucks = []; movingObstacle = null;
    if (typeof onlineManager !== 'undefined' && onlineManager.guestDestroyedCrates) {
        onlineManager.guestDestroyedCrates.clear();
    }
    explosions = []; beams = []; radiationZones = []; iceZones = [];
    gameState.lastObstacleSpawn = Date.now();
    gameState.roundStartTime = Date.now();
    // Bo GĐ1: tâm lệch ngẫu nhiên 12-22% bề ngang sang trái/phải (chống cắm giữa sân)
    gameState.zoneOff = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.1);
    gameState.pauseStartedAt = 0;
    gameState.isPaused = false;
    lastCrateSpawn = Date.now();
    talismans = [];
    spellZones = [];
    floatingSwords = [];
    turrets = [];
    sniperWalls = [];
    windWalls = [];
    thunderPlantedSpears = [];
    magnetNodes = [];
    bastions = [];
    artilleryHazards = [];
    ghostDecoys = [];
    necroMinions = [];
    // [FIX] Dọn sạch vật triệu hồi / hiệu ứng còn sót từ hiệp trước (tránh ụ súng, robot,
    // lồng cấm... của hiệp cũ nằm lại sai vị trí và tiếp tục hoạt động)
    creatorTurrets = [];
    creatorDrones = [];
    creatorRobots = [];
    confinementCages = [];
    arrowRains = [];
    arrowDrops = [];
    voidZones = [];
    fireZones = [];
    floatingTexts = [];
    particles = [];
    bodyEffects = [];

    // Map selection & Mutators
    let isOnlineGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    if (!isOnlineGuest && gameState.mapPreselected) {
        gameState.mapPreselected = false; // host online đã chọn map trước khi gửi START_ROUND
    } else if (!isOnlineGuest) {
        if (!gameState.selectedMapMode || gameState.selectedMapMode === 'random') {
            const mapList = ['classic', 'bastion', 'artillery', 'overdrive', 'fast_shrink', 'rush_hour', 'supply_drop'];
            gameState.currentMap = mapList[Math.floor(Math.random() * mapList.length)];
        } else {
            gameState.currentMap = gameState.selectedMapMode;
        }
    }

    if (gameState.currentMap === 'bastion') {
        let count = 3;
        let step = (canvas.height - 240) / (count + 1);
        for (let bIdx = 0; bIdx < count; bIdx++) {
            let bY = 120 + (bIdx + 1) * step;
            let vx = (bIdx % 2 === 0 ? 2 : -2);
            bastions.push(new BastionWall(bY, 60, vx));
        }
    }

    updateMapHUD();
    triggerRoundIntroBanner();

    // Cố định kích thước sàn đấu mobile khi online
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        canvas.width = ONLINE_ARENA_WIDTH;
        canvas.height = ONLINE_ARENA_HEIGHT;
    }

    // [FIX] Reset trước khi setup: bẫy Shadow Hunter (Evo 2) sinh ra lúc đầu hiệp không bị xoá mất
    mortars = []; // Reset pháo
    shadowTraps = [];
    shortgunFireZones = [];
    p1.setupForNewRound(); p2.setupForNewRound();
    if (typeof applyCollabBonus === 'function') applyCollabBonus();
    lastFixedLoopTime = performance.now();
    fixedPhysicsAccumulator = 0;

    animationId = requestAnimationFrame(gameLoop);
}

let roundBannerTimeout = null;
function triggerRoundIntroBanner() {
    const banner = document.getElementById('roundIntroBanner');
    if (!banner) return;
    banner.classList.remove('show');
    void banner.offsetWidth; // Force reflow
    banner.classList.add('show');
    if (roundBannerTimeout) clearTimeout(roundBannerTimeout);
    roundBannerTimeout = setTimeout(() => {
        banner.classList.remove('show');
    }, 1700); // hiện ~1.7s rồi mờ dần 0.4s -> không che sân lâu
}

function updateMapHUD() {
    let badge = document.getElementById('hudMapBadge');
    if (!badge) return;
    const mapNames = {
        classic: '🏛️ CỔ ĐIỂN',
        bastion: '🛡️ PHÁO ĐÀI',
        artillery: '💣 PHÁO KÍCH',
        overdrive: '⚡ SIÊU TỐC',
        fast_shrink: '💀 BO THẦN TỐC',
        rush_hour: '🚛 CAO ĐIỂM',
        supply_drop: '📦 TIẾP TẾ'
    };
    badge.innerText = `MAP: ${mapNames[gameState.currentMap] || (gameState.currentMap ? gameState.currentMap.toUpperCase() : 'CỔ ĐIỂN')}`;
}
function endRound(winnerId) {
    if (gameState.phase === 'end_round') return;
    // --- LOGIC LỢI TỨC (MỚI - CỘNG LÃI TIẾT KIỆM THEO TIỀN GIỮ LẠI) ---
    // Duyệt qua cả 2 người chơi để tính tiền lãi trước khi cộng tiền thưởng hiệp
    [p1, p2].forEach(p => {
        // Đếm số lượng 'Lợi Tức' mà người chơi đã mua
        let interestCount = p.upgrades.filter(u => u === 'interest').length;

        if (interestCount > 0) {
            const currentSavedCoins = (p.id === 1) ? gameState.p1Coins : gameState.p2Coins;
            // Cộng dồn lãi cố định + lãi tiết kiệm 15%/tầng trên số tiền giữ lại - xem interestIncome()
            let totalProfit = interestIncome(interestCount, p.weapon === 'money_tank', currentSavedCoins);
            let savingDiv = typeof interestSavingBonus === 'function' ? interestSavingBonus(interestCount, p.weapon === 'money_tank', currentSavedCoins) : 0;

            // Cộng tiền vào game state
            if (p.id === 1) gameState.p1Coins += totalProfit;
            else gameState.p2Coins += totalProfit;

            // Hiệu ứng visual báo nhận tiền lãi
            ctx.fillStyle = "gold";
            ctx.font = "bold 20px Arial";
            ctx.fillText(`+$${totalProfit}`, p.x, p.y - 20);
            if (typeof addFloatingText === 'function') {
                const subNote = savingDiv > 0 ? ` (+$${savingDiv} lãi giữ ví)` : '';
                addFloatingText(p.x + p.w / 2, p.y - 45, `+$${totalProfit} LỢI TỨC${subNote}`, '#facc15', 14);
            }
        }
    });
    // ----------------------------
    gameState.phase = 'end_round';
    cancelAnimationFrame(animationId);

    soundSystem.playWin();
    if (winnerId === 1) { gameState.p1Score++; gameState.p1Coins += 65; gameState.p2Coins += 30; }
    else if (winnerId === 2) { gameState.p2Score++; gameState.p2Coins += 65; gameState.p1Coins += 30; }
    else { gameState.p1Coins += 25; gameState.p2Coins += 25; }

    // Thưởng Linh Kiện (LK) an toàn cho Inventor (Thắng: 4 -> 6 LK, Thua: 2 -> 3 LK)
    let winnerPlayer = (winnerId === 1) ? p1 : ((winnerId === 2) ? p2 : null);
    let loserPlayer = (winnerId === 1) ? p2 : ((winnerId === 2) ? p1 : null);
    if (winnerPlayer && winnerPlayer.weapon === 'inventor') {
        let lkWin = winnerPlayer.hasUpgrade('evo_inv_1') ? 6 : 4;
        winnerPlayer.components = (winnerPlayer.components || 0) + lkWin;
        if (typeof addFloatingText === 'function') addFloatingText(winnerPlayer.x + winnerPlayer.w / 2, winnerPlayer.y - 15, `+${lkWin} LK (THẮNG)`, "#00ffcc", 14);
    }
    if (loserPlayer && loserPlayer.weapon === 'inventor') {
        let lkLoss = loserPlayer.hasUpgrade('evo_inv_1') ? 3 : 2;
        loserPlayer.components = (loserPlayer.components || 0) + lkLoss;
        if (typeof addFloatingText === 'function') addFloatingText(loserPlayer.x + loserPlayer.w / 2, loserPlayer.y - 15, `+${lkLoss} LK (AN ỦI)`, "#00ffcc", 14);
    }
    if (winnerId === 0) {
        [p1, p2].forEach(p => {
            if (p && p.weapon === 'inventor') {
                let lkTie = p.hasUpgrade('evo_inv_1') ? 4 : 3;
                p.components = (p.components || 0) + lkTie;
                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 15, `+${lkTie} LK (HÒA)`, "#00ffcc", 14);
            }
        });
    }

    // Thưởng vĩnh viễn cho Shortgun Full Evo khi thắng hiệp (+2 Max HP, +1 DMG)
    if (winnerPlayer && winnerPlayer.weapon === 'shortgunATK' && winnerPlayer.hasUpgrade('evo_sg_1') && winnerPlayer.hasUpgrade('evo_sg_2')) {
        winnerPlayer.shortgunBonusMaxHp = (winnerPlayer.shortgunBonusMaxHp || 0) + 2;
        winnerPlayer.shortgunBonusDmg = (winnerPlayer.shortgunBonusDmg || 0) + 1;
        winnerPlayer.maxHp += 2;
        winnerPlayer.hp += 2;
        winnerPlayer.damage += 1;
        if (typeof addFloatingText === 'function') addFloatingText(winnerPlayer.x + winnerPlayer.w / 2, winnerPlayer.y - 15, `+2 MAX HP & +1 DMG!`, "#ff6600", 16);
    }

    // [MỚI] Thưởng chuỗi: thua liên tiếp +80$, sắp bị loại (hiệp sau là cơ hội cuối) +160$,
    // thắng liên tiếp +40$ mỗi trận thắng
    const targetScore = gameState.winScore || 3;
    [p1, p2].forEach(p => {
        const res = winnerId === 0 ? 'draw' : (winnerId === p.id ? 'win' : 'lose');
        p.lastRoundResult = res;
        p.loseStreak = res === 'lose' ? (p.loseStreak || 0) + 1 : 0;
        p.winStreak = res === 'win' ? (p.winStreak || 0) + 1 : 0;
        const myScore = p.id === 1 ? gameState.p1Score : gameState.p2Score;
        const oppScore = p.id === 1 ? gameState.p2Score : gameState.p1Score;
        let bonus = 0;
        const notes = [];
        if (p.loseStreak >= 2) { bonus += 80; notes.push('CHUỖI THUA'); }
        if (oppScore === targetScore - 1 && myScore < targetScore) { bonus += 160; notes.push('CƠ HỘI CUỐI'); }
        if (p.winStreak >= 2) { bonus += 40; notes.push(`CHUỖI THẮNG x${p.winStreak}`); }
        if (bonus > 0) {
            if (p.id === 1) gameState.p1Coins += bonus; else gameState.p2Coins += bonus;
            p.lastStreakBonus = { bonus, notes };
            if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 30, `+${bonus}$ ${notes.join(' + ')}`, '#ffd700', 14);
        } else p.lastStreakBonus = null;
    });

    // Hook kết thúc hiệp cho G.E.A.R (Thưởng tiền #14/#15/#105, bảo hiểm thua #29, thưởng hạ gục #12...)
    if (typeof applyGearsOnRoundEnd === 'function') {
        applyGearsOnRoundEnd(winnerId);
    }

    updateScoreBoard();

    // Hook kết thúc hiệp cho body (bài tập, điểm tùy chỉnh...)
    [p1, p2].forEach(p => {
        CharHooks.call(p, 'roundEnd', p.lastRoundResult);
    });

    // Online: host gửi kết quả hiệp cho guest
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
        onlineManager.sendRoundEnd(winnerId);
    }

    let targetWins = gameState.winScore || 3;
    if (gameState.p1Score >= targetWins || gameState.p2Score >= targetWins) {
        if (typeof PVE !== 'undefined' && PVE.active) {
            const won = gameState.p1Score >= targetWins;
            setTimeout(() => PVE.onMatchEnd(won), 1200);
            return;
        }
        let winnerName = (gameState.p1Score >= targetWins) ? "PLAYER 1" : "PLAYER 2";
        document.getElementById('finalWinner').innerText = winnerName + " VÔ ĐỊCH!";
        setTimeout(() => {
            document.getElementById('endScreen').style.display = 'block';
        }, 1200);
    } else {
        gameState.round++;
        setTimeout(showUpgradeScreen, 1800);
    }
}

function updateScoreBoard() {
    let targetWins = gameState.winScore || 3;
    const p1Row = document.getElementById('p1-score-row');
    const p2Row = document.getElementById('p2-score-row');
    if (p1Row && p2Row) {
        p1Row.innerHTML = '';
        p2Row.innerHTML = '';
        for (let i = 1; i <= targetWins; i++) {
            const d1 = document.createElement('div');
            d1.id = `p1-s${i}`;
            d1.className = `score-dot ${i <= gameState.p1Score ? 'active-p1' : ''}`;
            p1Row.appendChild(d1);

            const d2 = document.createElement('div');
            d2.id = `p2-s${i}`;
            d2.className = `score-dot ${i <= gameState.p2Score ? 'active-p2' : ''}`;
            p2Row.appendChild(d2);
        }
    }

    const badge = document.getElementById('hudRoundBadge');
    if (badge) {
        let totalRounds = targetWins * 2 - 1;
        badge.innerText = `BO${totalRounds} \u2022 HI\u1EC6P ${gameState.round}`;
    }
    if (typeof triggerRoundIntroBanner === 'function' && gameState.phase === 'playing') {
        triggerRoundIntroBanner();
    }
}

function startBattle() {
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) mainMenu.style.display = 'none';
    const endScreen = document.getElementById('endScreen');
    if (endScreen) endScreen.style.display = 'none';
    const pauseModal = document.getElementById('pauseMenuModal');
    if (pauseModal) pauseModal.style.display = 'none';

    gameState.round = 1;
    gameState.p1Score = 0;
    gameState.p2Score = 0;
    gameState.p1Coins = 0;
    gameState.p2Coins = 0;
    gameState.collabBonusDone = false;
    gameState.isPaused = false;
    gameState.matchGearTiers = typeof generateMatchGearTiers === 'function' ? generateMatchGearTiers() : ['SILVER', 'GOLD', 'PRISMATIC'];

    p1 = new Player(1, "#3498db");
    p2 = new Player(2, "#e74c3c");
    p1.gearTiers = [...gameState.matchGearTiers];
    p2.gearTiers = [...gameState.matchGearTiers];

    thunderPlantedSpears = [];
    magnetNodes = [];
    bastions = [];
    artilleryHazards = [];
    ghostDecoys = [];
    necroMinions = [];
    updateMapHUD();

    updateScoreBoard();
    soundSystem.playPowerup();
    showUpgradeScreen();
}
