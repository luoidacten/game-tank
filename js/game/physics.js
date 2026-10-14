// ==========================================
// Vòng cập nhật vật lý cố định 60 tick/giây
// ==========================================



function tickPhysics() {
    // Online Guest: host mô phỏng toàn bộ, guest chỉ gửi phím & dự đoán xe mình
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
        onlineManager.guestTick();
        return;
    }
    const now = Date.now();

    // 1. Giảm thời gian rung màn hình theo nhịp tick cố định
    if (screenShake.duration > 0) {
        screenShake.duration--;
    }

    // 2. Sudden Death Damage
    let suddenDeathLimit = (gameState.currentMap === 'fast_shrink') ? 20000 : C.suddenDeathTime;
    let shrinkRate = (gameState.currentMap === 'fast_shrink') ? 0.15 : 0.05;
    let timePlayed = now - gameState.roundStartTime;
    if (timePlayed > suddenDeathLimit) {
        let shrink = (timePlayed - suddenDeathLimit) * shrinkRate;
        let zoneX = shrink;
        let zoneW = canvas.width - shrink * 2;
        if (zoneW < 50) { zoneW = 50; zoneX = canvas.width / 2 - 25; }

        [p1, p2].forEach(p => {
            if (p.x < zoneX || p.x + p.w > zoneX + zoneW) {
                if (p.weapon === 'the_strongest') {
                    p.takeDamage(0.05, null, { isEnvironmental: true });
                } else {
                    p.hp -= 0.05;
                }
            }
        });
        if (p1.hp <= 0) triggerFatalCinematic(2, p1);
        if (p2.hp <= 0) triggerFatalCinematic(1, p2);
    }

    // 3. Spawns & Obstacle (Host / Local only)
    const isOnlineGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');

    if (!isOnlineGuest) {
        let crateInterval = (gameState.currentMap === 'supply_drop') ? 1500 : 3000;
        let maxCrates = (gameState.currentMap === 'supply_drop') ? 12 : 5;
        if (now - lastCrateSpawn > crateInterval && crates.length < maxCrates) {
            crates.push(new Crate()); lastCrateSpawn = now;
        }

        // Rush Hour map: duy trì liên tục 2 - 3 xe chở tiền
        if (gameState.currentMap === 'rush_hour') {
            let activeTrucks = moneyTrucks.filter(t => t.active).length;
            const truckCap = ([p1, p2].some(p => mtIsFull(p))) ? 4 : 3; // Xe Tiền Full Evo: thêm xe tiền trên sân
            if (activeTrucks < truckCap) {
                if (activeTrucks < 2 || Math.random() < 0.05) {
                    moneyTrucks.push(new MoneyTruck());
                }
            }
        } else {
            let spawnRate = 0.001;
            if (p1.upgradeLevel >= 2 || p2.upgradeLevel >= 2) spawnRate = 0.003;
            if (mtIsFull(p1) || mtIsFull(p2)) spawnRate = 0.006;
            if (Math.random() < spawnRate) moneyTrucks.push(new MoneyTruck());
        }

        // Artillery map: bão đạn pháo kích ngẫu nhiên mỗi 2.5s
        if (gameState.currentMap === 'artillery') {
            if (!gameState.lastArtillerySpawn || now - gameState.lastArtillerySpawn > 2500) {
                gameState.lastArtillerySpawn = now;
                // [FIX] Trước đây rơi ngẫu nhiên khắp sân (đa số vào khoảng trống giữa sân, không trúng ai).
                // Nay nhắm luân phiên vào làn của 2 xe, lệch ngang ngẫu nhiên để còn né được.
                gameState.artilleryTurn = ((gameState.artilleryTurn || 0) + 1) % 2;
                const tgt = gameState.artilleryTurn === 0 ? p1 : p2;
                let pt = (tgt && tgt.hp > 0) ? laneTargetPoint(tgt, 90) : { x: 40 + Math.random() * (canvas.width - 80), y: 60 + Math.random() * (canvas.height - 120) };
                artilleryHazards.push(new ArtilleryHazard(pt.x, pt.y));
            }
        }

        if (!movingObstacle || !movingObstacle.active) {
            if (now - gameState.lastObstacleSpawn > 8000) {
                movingObstacle = new MovingObstacle(); gameState.lastObstacleSpawn = now;
            }
        } else { movingObstacle.update(); }
    } else {
        if (movingObstacle && movingObstacle.active) {
            movingObstacle.update();
        }
    }

    // Bastions & Hazards & Magnet Nodes updates
    bastions.forEach(b => b.update());
    bastions = bastions.filter(b => b.active);

    artilleryHazards.forEach(h => h.update());
    artilleryHazards = artilleryHazards.filter(h => h.active);

    ghostDecoys.forEach(d => d.update());
    ghostDecoys = ghostDecoys.filter(d => d.active);

    confinementCages.forEach(c => c.update());
    confinementCages = confinementCages.filter(c => c.active);

    creatorTurrets.forEach(t => t.update());
    creatorTurrets = creatorTurrets.filter(t => t.active);

    creatorRobots.forEach(r => r.update());
    creatorRobots = creatorRobots.filter(r => r.active);

    if (typeof necroMinions !== 'undefined') {
        necroMinions.forEach(m => m.update());
        necroMinions = necroMinions.filter(m => m.active);
    }

    let curMagnetTime = Date.now();
    magnetNodes.forEach(node => {
        if (!node.active) return;
        let speedMult = (node.owner && node.owner.hasUpgrade && node.owner.hasUpgrade('evo_mag_net_2')) ? 1.5 : 1.0;
        let baseForce = 2.8 * speedMult;
        [p1, p2].forEach(p => {
            if (!p || p.hp <= 0) return;
            let dist = Math.hypot((p.x + p.w / 2) - node.x, (p.y + p.h / 2) - node.y);
            let dx = (p.x + p.w / 2) - node.x;
            let inRange = (dist <= node.radius) || (Math.abs(dx) <= node.radius * 1.5);
            if (inRange) {
                if (node.owner && p !== node.owner) {
                    if (!p.infectedPolarity || p.infectedPolarityTimer <= 0) {
                        p.infectedPolarity = node.polarity;
                        p.infectedPolarityTimer = 180;
                    }
                }
                let targetPolarity = (p === node.owner) ? p.magnetPolarity : p.infectedPolarity;
                if (targetPolarity) {
                    // HÚT / ĐẨY CHỈ TÁC ĐỘNG THEO TRỤC NGANG (X), KHÔNG ĐƯỢC TÁC ĐỘNG THEO CHIỀU DỌC (Y)
                    if (targetPolarity === node.polarity) {
                        // Cùng cực: ĐẨY RA XA (REPEL) theo phương ngang
                        let dirX = (dx >= 0 ? 1 : -1);
                        p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dirX * baseForce));
                    } else {
                        // Khác cực: HÚT LẠI GẦN (ATTRACT) theo phương ngang
                        if (Math.abs(dx) <= baseForce) {
                            p.x = Math.max(0, Math.min(canvas.width - p.w, node.x - p.w / 2));
                        } else {
                            let dirX = (dx >= 0 ? -1 : 1);
                            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dirX * baseForce));
                        }
                        if (Math.abs(dx) <= 30 && p !== node.owner) {
                            p.freezeTimer = Math.max(p.freezeTimer || 0, 30);
                            if (!node.lastDmgTime || curMagnetTime - node.lastDmgTime >= 1000) {
                                node.lastDmgTime = curMagnetTime;
                                let shockDmg = (node.owner && node.owner.hasUpgrade && node.owner.hasUpgrade('evo_mag_net_1')) ? 0.5 : 0.25;
                                p.takeDamage(shockDmg, node.owner);
                                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 12, `GIẬT ĐIỆN -${shockDmg} ⚡`, "#00e5ff", 12);
                            }
                        }
                    }
                }
            }
        });
    });
    magnetNodes = magnetNodes.filter(n => n.active);

    // 4. Update Entities
    crates.forEach(c => c.update());
    crates = crates.filter(c => c.active);

    moneyTrucks.forEach(t => t.update());
    moneyTrucks = moneyTrucks.filter(t => t.active);

    for (let i = explosions.length - 1; i >= 0; i--) {
        let e = explosions[i]; e.update();
        if (!e.active) explosions.splice(i, 1);
    }

    for (let i = arrowRains.length - 1; i >= 0; i--) {
        let ar = arrowRains[i];
        ar.update();
        if (!ar.active) arrowRains.splice(i, 1);
    }

    for (let i = arrowDrops.length - 1; i >= 0; i--) {
        let drop = arrowDrops[i];
        drop.update();
        if (!drop.active) arrowDrops.splice(i, 1);
    }

    for (let i = radiationZones.length - 1; i >= 0; i--) {
        let r = radiationZones[i]; r.update();
        if (!r.active) radiationZones.splice(i, 1);
    }

    for (let i = iceZones.length - 1; i >= 0; i--) {
        let z = iceZones[i]; z.update();
        if (!z.active) iceZones.splice(i, 1);
    }

    for (let i = floatingSwords.length - 1; i >= 0; i--) {
        let fs = floatingSwords[i]; fs.update();
        if (!fs.active) floatingSwords.splice(i, 1);
    }

    for (let i = voidZones.length - 1; i >= 0; i--) {
        let vz = voidZones[i]; vz.update();
        if (!vz.active) voidZones.splice(i, 1);
    }

    for (let i = talismans.length - 1; i >= 0; i--) {
        let t = talismans[i]; t.update();
        if (!t.active) talismans.splice(i, 1);
    }

    for (let i = spellZones.length - 1; i >= 0; i--) {
        let s = spellZones[i]; s.update();
        if (!s.active) spellZones.splice(i, 1);
    }

    // Shadow Hunter Traps
    for (let i = shadowTraps.length - 1; i >= 0; i--) {
        let trap = shadowTraps[i];
        let opponent = (trap.owner && trap.owner.id === 1) ? p2 : p1;
        trap.update(opponent);
        if (!trap.active) shadowTraps.splice(i, 1);
    }

    // Shortgun FireZones
    for (let i = shortgunFireZones.length - 1; i >= 0; i--) {
        let fz = shortgunFireZones[i];
        let targets = [p1, p2, ...turrets, ...crates, ...moneyTrucks].filter(t => t && t !== fz.owner);
        fz.update(targets);
        if (!fz.active) shortgunFireZones.splice(i, 1);
    }

    for (let i = turrets.length - 1; i >= 0; i--) {
        let t = turrets[i];
        t.update();
        if (!t.active) turrets.splice(i, 1);
    }

    for (let i = sniperWalls.length - 1; i >= 0; i--) {
        let sw = sniperWalls[i]; sw.update();
        if (!sw.active) sniperWalls.splice(i, 1);
    }

    for (let i = windWalls.length - 1; i >= 0; i--) {
        let w = windWalls[i];
        w.update();
        if (!w.active) windWalls.splice(i, 1);
    }

    for (let i = beams.length - 1; i >= 0; i--) {
        let b = beams[i]; b.update();
        if (b.active && b.isEvo && b.lifeTime % 12 === 0) {
            const owner = (b.ownerId === 1) ? p1 : p2;
            const enemy = (b.ownerId === 1) ? p2 : p1;

            if (rectIntersect(b.x, b.y, b.w, b.h, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(1, (b.ownerId === 1 ? p1 : p2)); }

            crates.forEach(c => {
                if (c.active && rectIntersect(b.x, b.y, b.w, b.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    crateOnBreak(c, owner);
                    if (c.isMimic) {
                        triggerMimicExplosion(c, owner);
                    }
                    if (c.type === 'hp') { owner.hp = Math.min(owner.hp + 1, owner.maxHp); if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'ammo') { owner.onCollectAmmoCrate(c); if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'shield') { owner.shield++; if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'dmg') { owner.dmgBuff++; if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (owner.weapon === 'evolution') { owner.onEvolutionCrateEat(c.type); }
                    if (c.type === 'boom') {
                        explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 0, null));
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 3;
                    }
                    if (c.type === 'coin') {
                        let money = 30; if (owner.weapon === 'money_tank') money *= 2;
                        if (owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = owner.hasUpgrade('evo_inv_1') ? 8 : 5;
                        owner.ammo = Math.min(owner.maxAmmo, owner.ammo + 1);
                        owner.hp = Math.min(owner.maxHp, owner.hp + 0.25);
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + lkGain;
                    }
                }
            });

            moneyTrucks.forEach(t => {
                if (t.active && rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    let dmg = 1; if (owner.weapon === 'money_tank') dmg *= 3;
                    t.hp -= dmg;
                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30; if (owner.weapon === 'money_tank') money *= 2;
                        if (owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 3;
                        if (owner.hasUpgrade('evo_money_atk')) explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,215,0,', 5, owner));
                    }
                }
            });
        }
        if (!b.active) beams.splice(i, 1);
    }

    if (typeof botAI !== 'undefined' && botAI.enabled) {
        botAI.update(p2, p1);
    }
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        onlineManager.onGameLoopTick();
    }

    // Hiệu ứng của các body mới (vùng, khối đá, kiếm trời, hitscan)
    for (let i = bodyEffects.length - 1; i >= 0; i--) {
        bodyEffects[i].update();
        if (!bodyEffects[i].active) bodyEffects.splice(i, 1);
    }

    p1.update(); p2.update();
    checkHits(p1, p2); checkHits(p2, p1);
    commitStatuses(p1); commitStatuses(p2);

    for (let i = mortars.length - 1; i >= 0; i--) {
        let m = mortars[i];
        m.update();
        if (!m.active) mortars.splice(i, 1);
    }

    // 5. Fatal Cinematic / Victory Checks
    if (fatalCinematic.active) {
        fatalCinematic.timer--;
        if (fatalCinematic.timer <= 0) {
            fatalCinematic.active = false;
            endRound(fatalCinematic.winnerId);
            return;
        }
    } else {
        if (p1.hp <= 0 && p2.hp <= 0) triggerFatalCinematic(0, p1);
        else if (p1.hp <= 0) triggerFatalCinematic(2, p1);
        else if (p2.hp <= 0) triggerFatalCinematic(1, p2);
    }

    // Online Host: gửi ảnh chụp thế giới cho guest
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        onlineManager.onTickEnd();
    }
}
