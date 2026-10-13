// ==========================================
// Vẽ toàn bộ khung hình
// ==========================================


function drawRain() {
    ctx.strokeStyle = 'rgba(43, 128, 255, 0.46)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) { // Vẽ 50 hạt mưa mỗi frame
        let rx = Math.random() * canvas.width;
        let ry = Math.random() * canvas.height;
        let rlen = 10 + Math.random() * 20;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + rlen); // Mưa rơi chéo
    }
    ctx.stroke();
}

function renderFrame() {
    if (gameState.phase !== 'playing' && !fatalCinematic.active) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Screen Shake & Camera Jump
    ctx.save();
    const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    if (isGuestView) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(Math.PI);
    }
    if (fatalCinematic.active) {
        let progress = 1 - (fatalCinematic.timer / fatalCinematic.maxTimer);
        let zoom = 1 + 0.20 * Math.sin(Math.min(progress * 2.5, 1) * Math.PI / 2);
        let targetX = fatalCinematic.victimX;
        let targetY = fatalCinematic.victimY;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-targetX, -targetY);
    }
    if (screenShake.duration > 0) {
        let sMag = screenShake.intensity * (screenShake.duration / 10);
        screenShake.x = (Math.random() - 0.5) * sMag;
        screenShake.y = (Math.random() - 0.5) * sMag;
        ctx.translate(screenShake.x, screenShake.y);
    } else {
        screenShake.x = 0; screenShake.y = 0;
    }

    // NỀN SÀN ĐẤU (vẽ trong world-space để rung màn hình đồng bộ)
    ctx.drawImage(getArenaFloor(), 0, 0, canvas.width, canvas.height);

    // VẼ TRỜI MƯA NẾU CÓ STORM FULL EVO
    if (isRaining) drawRain();

    // VẼ SÀN TỐI & ĐÈN PHA NEON NẾU CÓ SHADOW HUNTER FULL EVO
    let hasFullEvoShadow = (p1 && p1.weapon === 'shadow_hunter' && p1.hasUpgrade('evo_sh_1') && p1.hasUpgrade('evo_sh_2')) ||
                           (p2 && p2.weapon === 'shadow_hunter' && p2.hasUpgrade('evo_sh_1') && p2.hasUpgrade('evo_sh_2'));
    if (hasFullEvoShadow) {
        drawShadowHunterAmbiance();
    }

    // VẼ BÃO SẤM U ÁM NẾU CÓ THUNDER FULL EVO
    let hasFullEvoThunder = (p1 && p1.weapon === 'thunder' && p1.hasUpgrade('evo_thun_1') && p1.hasUpgrade('evo_thun_2')) ||
                            (p2 && p2.weapon === 'thunder' && p2.hasUpgrade('evo_thun_1') && p2.hasUpgrade('evo_thun_2'));
    if (hasFullEvoThunder) {
        ctx.fillStyle = "rgba(10, 20, 45, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const now = Date.now();
    let timePlayed = now - gameState.roundStartTime;
    let suddenDeathLimit = (gameState.currentMap === 'fast_shrink') ? 20000 : C.suddenDeathTime;
    let shrinkRate = (gameState.currentMap === 'fast_shrink') ? 0.15 : 0.05;
    if (timePlayed > suddenDeathLimit) {
        let shrink = (timePlayed - suddenDeathLimit) * shrinkRate;
        let zoneX = shrink;
        let zoneW = canvas.width - shrink * 2;
        if (zoneW < 50) { zoneW = 50; zoneX = canvas.width / 2 - 25; }

        ctx.strokeStyle = 'red'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2;
        ctx.strokeRect(zoneX, 0, zoneW, canvas.height); ctx.setLineDash([]);
    }

    if (movingObstacle && movingObstacle.active) {
        movingObstacle.draw();
    }

    bastions.forEach(b => b.draw());
    magnetNodes.forEach(m => drawMagnetNode(m));
    thunderPlantedSpears.forEach(s => drawThunderPlantedSpear(s));

    // Tia sét cảnh báo Thu Thương & Cột cảnh báo Lôi Minh
    [p1, p2].forEach(p => {
        if (p && p.weapon === 'thunder' && p.thunderIsRecallWarning) {
            let mySpears = thunderPlantedSpears.filter(s => s.owner === p);
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 0, 0.85)";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            mySpears.forEach(s => {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(p.x + p.w / 2, p.y + p.h / 2);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            ctx.restore();
        }
        // Cột cảnh báo Lôi Minh (0.25s)
        if (p && p.weapon === 'thunder' && (p.thunderRaycastWarningTimer || 0) > 0) {
            let rx = p.thunderRaycastX || (p.x + p.w / 2);
            ctx.save();
            ctx.fillStyle = "rgba(255, 235, 59, 0.3)";
            ctx.fillRect(rx - 14, 0, 28, canvas.height);
            ctx.strokeStyle = "rgba(255, 50, 0, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(rx - 14, 0, 28, canvas.height);
            ctx.setLineDash([]);
            ctx.restore();
        }
    });

    artilleryHazards.forEach(h => h.draw());
    ghostDecoys.forEach(d => d.draw());

    crates.forEach(c => c.draw());
    moneyTrucks.forEach(t => t.draw());

    // Cạm bẫy & Biển lửa dưới chân xe
    shortgunFireZones.forEach(fz => fz.draw());
    shadowTraps.forEach(trap => trap.draw());

    explosions.forEach(e => e.draw());
    arrowRains.forEach(ar => ar.draw());
    arrowDrops.forEach(drop => drop.draw());
    radiationZones.forEach(r => r.draw());
    iceZones.forEach(z => z.draw());
    floatingSwords.forEach(fs => fs.draw());
    voidZones.forEach(vz => vz.draw());
    talismans.forEach(t => t.draw());
    spellZones.forEach(s => s.draw());
    turrets.forEach(t => t.draw());
    sniperWalls.forEach(sw => sw.draw());
    windWalls.forEach(w => w.draw());
    beams.forEach(b => b.draw());

    // Bóng đổ dưới các vật triệu hồi & xe
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    turrets.forEach(t => drawSoftShadow(t));
    creatorTurrets.forEach(t => drawSoftShadow(t));
    creatorRobots.forEach(r => drawSoftShadow(r));
    necroMinions.forEach(m => drawSoftShadow(m));
    [p1, p2].forEach(p => {
        if (!p) return;
        if (p.hp > 0) drawSoftShadow(p, 1.1);
        if (p.drones) p.drones.forEach(d => drawSoftShadow(d, 0.8));
        if (p.creatorDrone) drawSoftShadow(p.creatorDrone, 0.8);
    });
    ctx.restore();

    bodyEffects.forEach(e => e.draw());
    confinementCages.forEach(c => c.draw());
    creatorTurrets.forEach(t => t.draw());
    creatorRobots.forEach(r => r.draw());
    if (typeof necroMinions !== 'undefined') {
        necroMinions.forEach(m => m.draw());
    }
    [p1, p2].forEach(p => {
        if (p && p.creatorShield) p.creatorShield.draw();
        if (p && p.creatorDrone) p.creatorDrone.draw();
    });

    p1.draw(); p2.draw();

    // UI Tụ lực Sấm Chớp rõ ràng (3 giai đoạn)
    [p1, p2].forEach(p => {
        if (p && p.weapon === 'thunder' && (p.thunderHoldFrames || 0) > 0) {
            ctx.save();
            let barW = 84;
            let barH = 7;
            let barX = p.x + p.w / 2 - barW / 2;
            let barY = (p.id === 1) ? p.y - 28 : p.y + p.h + 20;

            // Nền thanh sạc
            ctx.fillStyle = "rgba(15, 15, 25, 0.88)";
            ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

            let held = p.thunderHoldFrames;
            let stage = held < 30 ? 1 : (held <= 60 ? 2 : 3);
            let stageLabel = stage === 1 ? "⚡ PHÓNG THƯƠNG" : (stage === 2 ? "🧲 THU THƯƠNG" : "🌪️ TRẢM LÔI");
            let stageColor = stage === 1 ? "#00e5ff" : (stage === 2 ? "#ffd700" : "#ff007f");

            // Tiến độ thanh sạc
            let fillPct = Math.min(1, held / 65);
            ctx.fillStyle = stageColor;
            ctx.fillRect(barX, barY, barW * fillPct, barH);

            // Vạch phân chia 30f và 60f
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1.5;
            let mark1 = barX + barW * (30 / 65);
            let mark2 = barX + barW * (60 / 65);
            ctx.beginPath();
            ctx.moveTo(mark1, barY - 1); ctx.lineTo(mark1, barY + barH + 1);
            ctx.moveTo(mark2, barY - 1); ctx.lineTo(mark2, barY + barH + 1);
            ctx.stroke();

            // Nhãn chữ kỹ năng
            ctx.font = 'bold 10px "Orbitron", Arial, sans-serif';
            ctx.fillStyle = stageColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = (p.id === 1) ? 'bottom' : 'top';
            let textY = (p.id === 1) ? barY - 3 : barY + barH + 3;
            ctx.fillText(stageLabel, p.x + p.w / 2, textY);

            ctx.restore();
        }
    });

    // Vẽ pháo nổ trên đầu người chơi
    mortars.forEach(m => m.draw());

    // Particles & Floating Numbers
    updateAndDrawParticles();
    updateAndDrawFloatingTexts();

    ctx.restore(); // Restore from Screen Shake & Camera Jump & Guest Viewport Inversion

    // Tiền hiển thị trong bảng điểm (HTML) – không vẽ lên canvas để khỏi đè lên xe ở làn dưới

    // Update Header Coin Counters
    let p1CoinEl = document.getElementById('p1-coin-val');
    let p2CoinEl = document.getElementById('p2-coin-val');
    // Chỉ ghi DOM khi giá trị đổi (tránh tính lại layout mỗi khung hình trên điện thoại)
    if (p1CoinEl && p1CoinEl.textContent !== String(gameState.p1Coins)) p1CoinEl.textContent = gameState.p1Coins;
    if (p2CoinEl && p2CoinEl.textContent !== String(gameState.p2Coins)) p2CoinEl.textContent = gameState.p2Coins;

    // Fatal Cinematic Victory Sequence
    if (fatalCinematic.active) {
        drawVictoryBanner(fatalCinematic.winnerId, fatalCinematic.timer, fatalCinematic.maxTimer);
    }
}
