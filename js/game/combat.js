// ==========================================
// Xử lý va chạm đạn & sát thương
// ==========================================



function checkHits(attacker, victim) {
    let prevHp = victim.hp;
    let applyDamage = true;

    for (let i = 0; i < attacker.bullets.length; i++) {
        let b = attacker.bullets[i];

        // =======================================================
        // [SNIPER LOGIC] - TÍNH TOÁN SÁT THƯƠNG ĐÃ GIẢM KHI XUYÊN
        // =======================================================
        let isFullEvoSniper = (b.owner && b.owner.weapon === 'sniper' && b.owner.hasUpgrade('evo_sniper_1') && b.owner.hasUpgrade('evo_sniper_2'));
        let dmgReduc = 1;
        if (b.isSniperBullet && b.hitIds && b.hitIds.length > 0 && !isFullEvoSniper) dmgReduc = 0.5;
        let currentFinalDmg = b.dmg * dmgReduc;

        // --- 0. LOGIC PHẢN ĐẠN (Storm Evo 2) ---
        if (victim.weapon === 'storm' && victim.shield > 0) {
            if (victim.weapon === 'ghost' && victim.isGhostActive) continue;
            if (rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h)) {
                if (!b.isPiercing && b.bounceCount === 0 && !b.isStormShadow) {
                    b.owner = victim;
                    b.vx *= -1; b.vy *= -1;
                    attacker.bullets.splice(i, 1);
                    victim.bullets.push(b);
                    i--;
                    continue;
                }
            }
        }

        // Check va chạm với Kiếm Thể Thủ (Chặn hit)
        if (victim.swordShieldActive && !b.isPiercing) {
            victim.swordShieldHits--;
            attacker.bullets.splice(i, 1); i--;
            continue;
        }
        //sukuna
        // Thêm vào logic xử lý khi victim bị trúng đạn thương vong:
        // Thay thế đoạn nhận 10 Chú Lực cũ bằng đoạn code này:
        if (victim.weapon === 'sukuna') {
            let now = Date.now();
            victim.lastCeGainTime = victim.lastCeGainTime || 0;

            // THÊM COOLDOWN: Phải cách nhau ít nhất 0.5 giây mới được nhận thêm Chú Lực từ sát thương
            if (now - victim.lastCeGainTime > 3000) {
                victim.cursedEnergy = Math.min(100, victim.cursedEnergy + 10);
                victim.lastCeGainTime = now;
            }

            // Ngắt Lãnh địa / Phản chuyển khi bị đánh trúng
            victim.sukunaChargeTimer = 0;
            if (victim.domainActive) victim.domainActive = false;
        }
        if (victim.weapon === 'the_strongest') {
            // Ngắt niệm Chú Lực khi bị đánh trúng
            victim.gojoChargeTimer = 0;
        }
        // =========================================================================
        // HÀM DÙNG CHUNG: KÍCH HOẠT HIỆU ỨNG LÊN VẬT CẢN (Y HỆT NHƯ LÊN NGƯỜI CHƠI)
        // =========================================================================
        function applyBulletEffectsToStructure(target, x, y) {
            if (b.isAmChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                iceZones.push(new IceZone(x, y, r, 90, attacker));
            }
            if (b.isDuongChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                explosions.push(new Explosion(x, y, r, 'rgba(255, 100, 0,', 0.75, attacker));
                voidZones.push(new VoidZone(x, y, r, 90, attacker));
            }
            if (b.type === 'hu_vo') {
                explosions.push(new Explosion(x, y, 55, 'purple', 0.5, attacker));
                voidZones.push(new VoidZone(x, y, 55, 120, attacker));
                if (attacker.hasUpgrade('evo_blade_1') && typeof target.hp !== 'undefined') {
                    target.huVoStack = (target.huVoStack || 0) + 1;
                    if (target.huVoStack >= 3) {
                        // [FIX] Vật cản (ụ súng, tường, xe tiền) không có takeDamage -> trước đây gây lỗi
                        if (typeof target.takeDamage === 'function') target.takeDamage(999, attacker, { ignoreInvincible: true });
                        else { target.hp = 0; target.active = false; }
                        target.huVoStack = 0;
                        explosions.push(new Explosion(target.x, target.y, 150, 'black', 0, attacker));
                    }
                }
            }
            if (b.createAcidZone) iceZones.push(new AcidZone(x, y, attacker));
            if (b.createIceZone) {
                let radius = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 140 : 100;
                let duration = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 240 : 120;
                iceZones.push(new IceZone(x, y, radius, duration, attacker));
            }
            if (b.isRocket) {
                let range = attacker.hasUpgrade('evo_rocket_1') ? 100 : 60;
                let color = attacker.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                explosions.push(new Explosion(x, y, range, color, 1, attacker));
                if (attacker.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(x, y));
            }
            if (b.isExplosive) explosions.push(new Explosion(x, y, 55, 'rgba(255, 0, 255,', 2, attacker));
        }

        function handleEntityKilledByAttacker(victimEntity, x, y) {
            if (attacker.weapon === 'shortgunATK') {
                // Thu hồi đạn khi tiêu diệt mục tiêu
                attacker.ammo = Math.min(attacker.maxAmmo, attacker.ammo + 1);
                if (typeof addFloatingText === 'function') addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 AMMO 🎯", "#00ffcc", 13);

                // Evo 2: Tàn Phá -> Xác mục tiêu hóa đạn pháo quán tính văng tới nổ AoE
                if (attacker.hasUpgrade('evo_sg_2')) {
                    let dirY = (attacker.id === 1) ? -1 : 1;
                    attacker.bullets.push({
                        type: 'cannonball',
                        isCannonball: true,
                        x: x - 8, y: y - 8, w: 16, h: 16,
                        vx: 0, vy: dirY * (C.bulletSpeed * 1.8),
                        dmg: attacker.damage * 1.5,
                        owner: attacker,
                        isPiercing: false,
                        hitIds: [], bounceCount: 0,
                        trailHistory: [],
                        spawnTime: Date.now()
                    });
                    if (typeof explosions !== 'undefined') explosions.push(new Explosion(x, y, 40, 'orange', 0, attacker));
                }

                // Full Evo: Kill All -> Tăng vĩnh viễn +0.25 Max HP và +0.125 Dmg
                if (attacker.hasUpgrade('evo_sg_1') && attacker.hasUpgrade('evo_sg_2')) {
                    attacker.shortgunBonusMaxHp = (attacker.shortgunBonusMaxHp || 0) + 0.25;
                    attacker.shortgunBonusDmg = (attacker.shortgunBonusDmg || 0) + 0.125;
                    attacker.maxHp += 0.25;
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.25);
                    attacker.damage += 0.125;
                    if (typeof addFloatingText === 'function') addFloatingText(attacker.x + attacker.w / 2, attacker.y - 30, "+0.25 HP & +0.125 DMG", "#ffd700", 12);
                }
            }
        }

        // --- 1. KIỂM TRA VA CHẠM VỚI Ụ SÚNG (TURRETS & CREATOR TURRETS) ---
        let hitTurret = false;
        let allTurrets = [...turrets];
        if (typeof creatorTurrets !== 'undefined') allTurrets.push(...creatorTurrets);
        for (let t of allTurrets) {
            if (t.active && t.owner.id !== attacker.id) {
                if (rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(t)) continue;

                    let dmgToTurret = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    if (attacker.weapon === 'money_tank') dmgToTurret *= 2;

                    if (attacker.weapon === 'furnace') {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        dmgToTurret += (0.125 * t.burnStacks);
                        if (t.burnStacks >= 5) {
                            t.hp -= 5; t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'orange', 0, attacker));
                        }
                    }

                    t.hp -= dmgToTurret;
                    BulletHooks.call(b, 'obstacle', attacker, t, 'turret');
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 20, 'gray', 0, attacker));

                    // KÍCH HOẠT HIỆU ỨNG NHƯ NGƯỜI CHƠI
                    applyBulletEffectsToStructure(t, b.x, b.y);
                    if (t.hp <= 0) {
                        t.active = false;
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 50, 'red', 0, attacker));
                        handleEntityKilledByAttacker(t, t.x + t.w / 2, t.y + t.h / 2);
                    }

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(t);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitTurret = true; break;
                    }
                }
            }
        }
        if (hitTurret) continue;

        // --- 1.1. KIỂM TRA VA CHẠM VỚI DRONE CỦA NHÀ PHÁT MINH ---
        let hitDrone = false;
        if (victim.drones && victim.drones.length > 0) {
            for (let d of victim.drones) {
                if (d.active && rectIntersect(b.x, b.y, b.w, b.h, d.x, d.y, d.w, d.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(d)) continue;

                    d.takeDamage((b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg);

                    // Thưởng Linh Kiện cho Inventor khi phá Drone
                    if (!d.active) {
                        if (attacker.weapon === 'inventor') {
                            let lkBonus = attacker.hasUpgrade('evo_inv_1') ? 2 : 1;
                            attacker.components = (attacker.components || 0) + lkBonus;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkBonus} LK`, "#00ffcc", 12);
                        }
                        handleEntityKilledByAttacker(d, d.x + d.w / 2, d.y + d.h / 2);
                    }

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(d);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitDrone = true; break;
                    }
                }
            }
        }
        if (hitDrone) continue;

        // --- 1.2. KIỂM TRA VA CHẠM VỚI MINION CHIÊU HỒN SƯ ---
        let hitNecroMinion = false;
        if (typeof necroMinions !== 'undefined' && necroMinions.length > 0) {
            for (let m of necroMinions) {
                if (m.active && m.owner.id !== attacker.id && rectIntersect(b.x, b.y, b.w, b.h, m.x, m.y, m.w, m.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(m)) continue;

                    let minionDmg = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    m.takeDamage(minionDmg);

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(m);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitNecroMinion = true; break;
                    }
                }
            }
        }
        if (hitNecroMinion) continue;

        // --- 1.5. ĐẶC BIỆT: TƯỜNG SNIPER VÀ THANH NGANG ---
        let hitWall = false;
        let allWalls = [];
        if (typeof sniperWalls !== 'undefined') allWalls.push(...sniperWalls);
        if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) allWalls.push(movingObstacle);
        if (typeof bastions !== 'undefined' && bastions.length > 0) allWalls.push(...bastions);
        for (let s of bodyEffects) if (s.isStone && s.active && s.owner !== b.owner) allWalls.push(s); // Khối đá Thổ chặn đạn đối thủ

        for (let w of allWalls) {
            if (w.active && rectIntersect(b.x, b.y, b.w, b.h, w.x, w.y, w.w, w.h)) {
                if (b.isPiercing && b.hitIds && b.hitIds.includes(w)) continue;
                if (BulletHooks.call(b, 'obstacle', attacker, w, w.isStone ? 'stone' : 'wall') === 'pass') continue;
                if (w.isStone && w.isLava) BulletHooks.call({ hook: 'kiem_su' }, 'lavaHit', w, b);
                let isOwnEvoWall = (b.owner && w.owner === b.owner && b.owner.hasUpgrade('evo_sniper_1'));

                if (!w.isImmortal) {
                    let dmgToWall = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    w.hp -= dmgToWall;
                    applyBulletEffectsToStructure(w, b.x, b.y);
                    if (w.hp <= 0) {
                        w.active = false;
                        explosions.push(new Explosion(w.x + w.w / 2, w.y + w.h / 2, 40, 'gray', 0, attacker));
                    }
                } else {
                    // Tường bất tử: vẫn kích hoạt hiệu ứng nổ, băng, axit nhưng ko mất máu
                    applyBulletEffectsToStructure(w, b.x, b.y);
                }

                if (!isOwnEvoWall) {
                    if (!b.hitIds) b.hitIds = [];
                    b.hitIds.push(w);
                }
                if (!b.isPiercing) {
                    attacker.bullets.splice(i, 1); i--; hitWall = true; break;
                }
            }
        }
        if (hitWall) continue;

        // --- 1.6. XE TIỀN (MONEY TRUCKS) VÀ THÙNG GỖ (CRATES) ---
        let hitNeutral = false;
        let neutrals = [];
        if (typeof moneyTrucks !== 'undefined') neutrals.push(...moneyTrucks);
        if (typeof crates !== 'undefined') neutrals.push(...crates);

        for (let n of neutrals) {
            if (n.active && rectIntersect(b.x, b.y, b.w, b.h, n.x, n.y, n.w, n.h)) {
                if (b.isPiercing && b.hitIds && b.hitIds.includes(n)) continue;

                // [FIX LỖI MÁU ÂM VÀ LỖI KHÔNG ĂN ĐƯỢC HỘP TIẾP TẾ]
                if (n.hp !== undefined) {
                    // Xử lý Xe Tiền (Có thanh máu)
                    let truckDmg = (b.isAcid || attacker.weapon === 'acid') ? 3 : currentFinalDmg;
                    n.hp -= truckDmg;
                    applyBulletEffectsToStructure(n, b.x, b.y);

                    if (n.hp <= 0) {
                        n.active = false;
                        let money = 30; if (attacker.weapon === 'money_tank') money *= 2;
                        if (attacker.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (attacker.weapon === 'inventor') {
                            let lkTruck = attacker.hasUpgrade('evo_inv_1') ? 3 : 2;
                            attacker.components = (attacker.components || 0) + lkTruck;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkTruck} LK`, "#00ffcc", 13);
                        }
                        if (attacker.weapon === 'genius') {
                            attacker.gears = (attacker.gears || 0) + 2;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+2 BÁNH RĂNG ⚙️", "#ff9800", 13);
                        }
                        if (attacker.weapon === 'evolution') attacker.onEvolutionCrateEat('truck');
                        explosions.push(new Explosion(n.x + n.w / 2, n.y + n.h / 2, 80, 'rgba(255,215,0,', 5, attacker));
                        handleEntityKilledByAttacker(n, n.x + n.w / 2, n.y + n.h / 2);
                    }
                } else {
                    // Xử lý Hộp Tiếp Tế (Không có máu, 1 hit là nát và nhận quà)
                    n.active = false;
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest' && n.id) {
                        if (!onlineManager.guestDestroyedCrates) onlineManager.guestDestroyedCrates = new Set();
                        onlineManager.guestDestroyedCrates.add(n.id);
                    }
                    crateOnBreak(n, attacker);
                    if (n.isMimic) {
                        triggerMimicExplosion(n, attacker);
                    }
                    if (n.type === 'hp') {
                        if (attacker.weapon === 'necromancer') {
                            let cap = attacker.maxSouls - (attacker.lockedSouls || 0);
                            attacker.currentSouls = Math.min(cap, (attacker.currentSouls || 0) + 4);
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            attacker.hp = Math.min(attacker.hp + 1, attacker.maxHp);
                        }
                    }
                    if (n.type === 'ammo') { attacker.onCollectAmmoCrate(n); }
                    if (n.type === 'shield') { attacker.shield++; }
                    if (n.type === 'dmg') { attacker.dmgBuff++; }
                    if (attacker.weapon === 'evolution') { attacker.onEvolutionCrateEat(n.type); }
                    if (n.type === 'coin') {
                        let money = 30; if (attacker.weapon === 'money_tank') money *= 2;
                        if (attacker.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                    if (n.type === 'gear') {
                        attacker.ammo = Math.min(attacker.maxAmmo, attacker.ammo + 1);
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.25);
                        if (attacker.weapon === 'genius') {
                            if (attacker.isPilotingMecha) {
                                if (attacker.mechaHp < attacker.mechaMaxHp) {
                                    attacker.mechaHp = Math.min(attacker.mechaMaxHp, attacker.mechaHp + 0.5);
                                    addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    attacker.mechaVirtualArmor = (attacker.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                attacker.gears = (attacker.gears || 0) + 1;
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }

                    // Rơi Linh Kiện khi phá Hộp Tiếp Tế (Crate): 1 LK (Evo 1: 2 LK)
                    if (attacker.weapon === 'inventor') {
                        let lkCrate = attacker.hasUpgrade('evo_inv_1') ? 2 : 1;
                        attacker.components = (attacker.components || 0) + lkCrate;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkCrate} LK`, "#00ffcc", 13);
                    }

                    // Genius: +1 Bánh Răng khi nhặt hòm tiếp tế. Nếu đang lái Mecha -> quy đổi thành +0.5 HP/Giáp Ảo
                    if (attacker.weapon === 'genius' && n.type !== 'gear') {
                        if (attacker.isPilotingMecha) {
                            if (attacker.mechaHp < attacker.mechaMaxHp) {
                                attacker.mechaHp = Math.min(attacker.mechaMaxHp, attacker.mechaHp + 0.5);
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                attacker.mechaVirtualArmor = (attacker.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            attacker.gears = (attacker.gears || 0) + 1;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        attacker.components = (attacker.components || 0) + 0.5;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }

                    // Giáp Hợp Kim: Nhặt Crate nhận Giáp Ảo tồn tại 5s
                    if (attacker.weapon === 'inventor' && attacker.invUpgrades && attacker.invUpgrades['inv_giap']) {
                        attacker.shield = (attacker.shield || 0) + 1;
                        attacker.crateShieldActive = true;
                        attacker.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }
                    if (n.type === 'boom') {
                        explosions.push(new Explosion(n.x, n.y, 60, 'rgba(255,0,0,', 0, null));
                    } else {
                        explosions.push(new Explosion(n.x, n.y, 30, 'rgba(255,255,255,', 0, attacker));
                    }
                    handleEntityKilledByAttacker(n, n.x + n.w / 2, n.y + n.h / 2);
                }

                if (!b.hitIds) b.hitIds = [];
                b.hitIds.push(n);

                if (!b.isPiercing) {
                    attacker.bullets.splice(i, 1); i--; hitNeutral = true; break;
                }
            }
        }
        if (hitNeutral) continue;


        // --- 2. KIỂM TRA VA CHẠM VỚI PLAYER ---
        if (victim.weapon === 'ghost' && victim.isGhostActive) continue;
// cho mirror
        // ĐỊCH PHÁ ẢNH CHIẾU TAN VỠ (Shattered Clone) CỦA MIRROR
        if (victim.weapon === 'mirror' && victim.shatteredClone && victim.shatteredClone.active) {
            if (rectIntersect(b.x, b.y, b.w, b.h, victim.shatteredClone.x, victim.shatteredClone.y, victim.shatteredClone.w, victim.shatteredClone.h)) {
                victim.shatteredClone.hp -= currentFinalDmg;
                explosions.push(new Explosion(b.x, b.y, 20, 'cyan', 0, attacker));

                if (victim.shatteredClone.hp <= 0) {
                    victim.shatteredClone.active = false;
                    victim.enemyClone.active = false; // Phá vỡ liên kết, ngắt luôn Ảnh Chiếu Kẻ Thù
                    explosions.push(new Explosion(victim.shatteredClone.x + victim.w / 2, victim.shatteredClone.y + victim.h / 2, 80, 'white', 0, attacker));
                    handleEntityKilledByAttacker(victim.shatteredClone, victim.shatteredClone.x + victim.w / 2, victim.shatteredClone.y + victim.h / 2);
                }

                if (!b.isPiercing) { attacker.bullets.splice(i, 1); i--; continue; }
            }
        }
        // ==========================================
        // --- ĐỊCH BẮN TRÚNG PHÂN ẢNH CỦA MAGICIAN ---
        // ==========================================
        let hitIllusion = false;
        if (victim.weapon === 'magician' && victim.illusions.length > 0) {
            for (let j = 0; j < victim.illusions.length; j++) {
                let ill = victim.illusions[j];
                // Phân ảnh đang không tàng hình mới ăn đạn
                if (ill.invisTimer <= 0 && rectIntersect(b.x, b.y, b.w, b.h, ill.x, ill.y, ill.w, ill.h)) {
                    hitIllusion = true;
                    victim.illusions.splice(j, 1); // Xóa bóng

                    // NỘI TẠI 1: BẪY NỔ (Choáng + Phản dame + Khói Làm Chậm 2s)
                    attacker.takeDamage(0.25, victim);
                    attacker.freezeTimer = 60; // Địch bị choáng 1s
                    attacker.slowTimer = Math.max(attacker.slowTimer || 0, 120); // Khói làm chậm 2s
                    explosions.push(new Explosion(ill.x + ill.w / 2, ill.y + ill.h / 2, 60, 'cyan', 0, victim));
                    explosions.push(new Explosion(ill.x + ill.w / 2, ill.y + ill.h / 2, 80, 'rgba(128, 128, 128, 0.7)', 0, victim)); // Khói xám làm chậm

                    // EVO 2: Phá bóng dính 3 stack Suy Yếu
                    if (victim.hasUpgrade('evo_mag_2')) {
                        attacker.vulnerableStacks += 3;
                        if (attacker.vulnerableStacks >= 3) attacker.speedDebuffTimer = 180; // Slow 3s
                    }

                    if (!b.isPiercing) { attacker.bullets.splice(i, 1); i--; break; }
                }
            }
            if (hitIllusion) continue; // Nếu trúng bóng, bỏ qua xét trúng bản thể
        }
        // [FIX] Xe đã về 0 HP không nhận va chạm đạn nữa. Trước đây Shortgun (Evo 2) hạ gục ->
        // sinh đạn pháo ngay trên xác -> đạn trúng xác -> lại tính hạ gục... vòng lặp vô hạn làm sập game.
        let hitReal = victim.hp > 0 && rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h);

        // 1. Check Mirror clone projection
        let hitProjection = false;
        if (!hitReal && attacker.weapon === 'mirror' && attacker.enemyClone && attacker.enemyClone.active) {
            hitProjection = rectIntersect(b.x, b.y, b.w, b.h, attacker.enemyClone.x, attacker.enemyClone.y, attacker.enemyClone.w, attacker.enemyClone.h);
        }

        if (hitProjection) {
            let isFullEvo = attacker.hasUpgrade('evo_mirror_1') && attacker.hasUpgrade('evo_mirror_2');
            let canDamage = true;
            if (isFullEvo && (!attacker.shatteredClone || !attacker.shatteredClone.active)) {
                canDamage = false;
            }

            if (canDamage) {
                let finalDmg = currentFinalDmg * 1.5;
                victim.takeDamage(finalDmg, attacker);
                explosions.push(new Explosion(attacker.enemyClone.x + victim.w / 2, attacker.enemyClone.y + victim.h / 2, 40, 'magenta', 0, attacker));
                explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 40, 'red', 0, attacker));
            }

            if (!b.isPiercing) {
                attacker.bullets.splice(i, 1);
                i--;
            }
            continue;
        }

        // 2. Collision with real player body
        if (hitReal) {
            // [HÌNH ẢNH] Đòn chém (Sukuna, Kiếm Khí, Kiếm Tôn, Lôi Phong Thương...) trúng địch -> nhát chém chéo
            if (b.isSukunaSlash || b.isWindBlade || b.isThunderSpear || b.type === 'hu_vo' || b.isFloatingSwordGraphic || b.hook === 'kiem_khach' || b.hook === 'kiem_su') {
                if (!b._slashFx) { b._slashFx = true; fxSlashHit(victim.x + victim.w / 2, victim.y + victim.h / 2, b.isSukunaSlash ? '#ff5252' : (b.isThunderSpear ? '#fff176' : '#7dd3fc'), 22); }
            }
            // Am Duong Su effects
            if (b.isAmChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                let isFullEvo = attacker.hasUpgrade('evo_ads_1') && attacker.hasUpgrade('evo_ads_2');
                victim.slowTimer = isFullEvo ? 60 : 35; // Giảm mạnh từ 240/120 xuống 60/35 frames (1s / 0.6s)
                iceZones.push(new IceZone(b.x, b.y, r, 90, attacker));
                talismans.push(new Talisman(victim.x, victim.y, 'am', attacker, victim));
            }
            if (b.isDuongChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                explosions.push(new Explosion(b.x, b.y, r, 'rgba(255, 100, 0,', 1.0, attacker));
                victim.silenceTimer = 35; // Giảm từ 120 (2s) xuống 35 frames (0.6s)
                voidZones.push(new VoidZone(b.x, b.y, r, 90, attacker));
                talismans.push(new Talisman(victim.x, victim.y, 'duong', attacker, victim));
            }

            // Hu Vo Kiem
            if (b.type === 'hu_vo') {
                explosions.push(new Explosion(b.x, b.y, 55, 'purple', 0.5, attacker));
                voidZones.push(new VoidZone(b.x, b.y, 55, 120, attacker));
                if (attacker.hasUpgrade('evo_blade_1')) {
                    attacker.huVoStack = (attacker.huVoStack || 0) + 1;
                    if (attacker.huVoStack >= 3) {
                        victim.takeDamage(999, attacker, { ignoreInvincible: true });
                        attacker.huVoStack = 0;
                        explosions.push(new Explosion(victim.x, victim.y, 150, 'black', 0, attacker));
                    }
                }
            }

            // SĂ¡t thÆ°Æ¡ng & Äƒn mĂ²n Axit (Acid)
            if (b.isAcid) {
                if (victim.weapon !== 'the_strongest') {
                    victim.acidBurnTimer = 180;
                    let erosion = attacker.hasUpgrade('evo_acid_1') ? 2 : 1;
                    victim.maxHp = Math.max(1, victim.maxHp - erosion);
                    victim.hp = Math.min(victim.hp, victim.maxHp);

                    let killThreshold = attacker.hasUpgrade('evo_acid_2') ? 2 : 0;
                    if (killThreshold > 0 && victim.hp <= killThreshold) {
                        victim.takeDamage(999, attacker);
                        explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, '#32CD32', 0, attacker));
                    }
                }

                // YĂU Cáº¦U Cá»¦A USER: Acid dame tá»« 0 lĂªn 0.5, vĂ  khi Ä‘á»‘i phÆ°Æ¡ng cĂ³ maxHp <= 1 sáº½ gĂ¢y 4 sĂ¡t thÆ°Æ¡ng!
                let acidDmg = (victim.maxHp <= 1) ? 4.0 : 0.5;
                currentFinalDmg = acidDmg;
            }

            if (b.createAcidZone) iceZones.push(new AcidZone(b.x, b.y, attacker));

            // Magician Stacks
            if (attacker.weapon === 'magician' && attacker.hasUpgrade('evo_mag_2')) {
                victim.vulnerableStacks += 1;
                victim.confusionStacks += 1;
                if (victim.vulnerableStacks >= 3) {
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 180);
                }
            }

            // Damage synthesis
            let finalDmg = currentFinalDmg;

            if (attacker.weapon === 'magician' && attacker.hasUpgrade('evo_mag_2')) {
                finalDmg += (victim.vulnerableStacks * 0.1);
            }

            if (attacker.weapon === 'furnace' || b.inflictBurn) {
                if (attacker.weapon === 'furnace') finalDmg += (0.125 * (victim.burnStacks || 0));

                let bTimer = (attacker.weapon === 'furnace' && attacker.hasUpgrade('evo_furnace_2')) ? 360 : 180;
                victim.burnTimer = bTimer;
                victim.burnStacks = (victim.burnStacks || 0) + 1;

                if (victim.burnStacks >= 3 && attacker.weapon === 'furnace') {
                    victim.takeDamage(5, attacker);
                    victim.burnStacks = 0;
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, 'orange', 0, attacker));
                    addFloatingText(victim.x + victim.w / 2, victim.y - 20, "BOOM!", "red", 16);
                }
            }

            // Magnet Polarity Infection on Hit
            if (b.isMagnetBullet) {
                victim.infectedPolarity = b.polarity || attacker.magnetPolarity || 1;
                victim.infectedPolarityTimer = 240;
                addFloatingText(victim.x + victim.w / 2, victim.y - 15, victim.infectedPolarity === 1 ? "NHIỄM TỪ (+)" : "NHIỄM TỪ (-)", victim.infectedPolarity === 1 ? "#ff3300" : "#00aaff", 14);
            }

            // --- DEATH LOCK (TRỐI CHẾT): RÀNG BUỘC (BINDING CURSE) ---
            if (b.isDeathLockBullet || attacker.weapon === 'death_lock') {
                let hasEvo1 = attacker.hasUpgrade && attacker.hasUpgrade('evo_dl_1');
                let hasEvo2 = attacker.hasUpgrade && attacker.hasUpgrade('evo_dl_2');
                let isFullEvo = hasEvo1 && hasEvo2;

                let maxDuration = isFullEvo ? 720 : (hasEvo1 ? 480 : 300); // 12s, 8s, 5s (ticks)
                victim.bindingCurseTimer = maxDuration;
                victim.bindingCurseStacks = (victim.bindingCurseStacks || 0) + 1;

                if (victim.bindingCurseStacks === 1) {
                    let slowAmount = isFullEvo ? 0.5 : 0.3;
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
                    victim.slowFactor = slowAmount;
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [1] -${Math.round(slowAmount * 100)}% SPD`, "#ba68c8", 12);
                } else if (victim.bindingCurseStacks === 2) {
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 120);
                    victim.slowFactor = 0.5;
                    let silDuration = isFullEvo ? 180 : 120; // 3s vs 2s
                    victim.silenceTimer = Math.max(victim.silenceTimer || 0, silDuration);
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [2] CÂM LẶNG ${silDuration / 60}s! 🤐`, "#ab47bc", 13);
                } else if (victim.bindingCurseStacks === 3) {
                    victim.freezeTimer = Math.max(victim.freezeTimer || 0, 90); // 1.5s choáng
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [3] CHOÁNG 1.5s! ⛓️`, "#8e24aa", 14);
                } else if (victim.bindingCurseStacks >= 4) {
                    // Tầng 4 (Kích nổ ấn)
                    victim.bindingCurseStacks = 0;
                    victim.bindingCurseTimer = 0;
                    victim.permanentSlow = (victim.permanentSlow || 0) + 0.2; // -20% vĩnh viễn
                    let vulnBonus = isFullEvo ? 0.5 : 0.25; // +50% vs +25%
                    victim.permanentVulnerability = (victim.permanentVulnerability || 0) + vulnBonus;
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 70, 'rgba(140, 0, 220,', 0.25, attacker));
                    triggerScreenShake(4, 6);
                    addFloatingText(victim.x + victim.w / 2, victim.y - 20, `KÍCH NỔ RÀNG BUỘC! +${Math.round(vulnBonus * 100)}% DMG 💥⛓️`, "#e040fb", 16);
                }
            }

            // Paradox Marks
            if (attacker.weapon === 'paradox' && attacker.hasUpgrade('evo_paradox_1')) {
                let isFullEvo = attacker.hasUpgrade('evo_paradox_2');
                let maxStacks = isFullEvo ? 2 : 3;

                attacker.enemyTimeMarks = (attacker.enemyTimeMarks || 0) + 1;
                explosions.push(new Explosion(victim.x + victim.w / 2, victim.y, 20, 'magenta', 0, attacker));

                if (attacker.enemyTimeMarks >= maxStacks) {
                    attacker.enemyTimeMarks = 0;
                    victim.freezeTimer = 60;
                    attacker.enemyStationaryShadow = { x: victim.x, y: victim.y };
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, 'purple', 0, attacker));
                }
            }

            if (attacker.weapon === 'water_gun' && attacker.hasUpgrade('evo_water_2')) victim.slowTimer = 90;

            if (b.isIce) {
                victim.slowTimer = 180;
                if (attacker.hasUpgrade('evo_ice_2')) finalDmg *= 1.5;
                if (attacker.hasUpgrade('evo_ice_1')) {
                    victim.coldStack += 25;
                    let isFullEvo = attacker.hasUpgrade('evo_ice_1') && attacker.hasUpgrade('evo_ice_2');
                    if (isFullEvo && victim.speed > 1.75) {
                        victim.speed = Math.max(1.75, victim.speed - 0.05);
                    }
                    if (victim.coldStack >= 100) {
                        victim.freezeTimer = isFullEvo ? 120 : 30;
                        victim.coldStack = 0;
                        explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 50, '#00ffff', 0, attacker));
                        if (isFullEvo) addFloatingText(victim.x + victim.w / 2, victim.y - 15, "DEEP FREEZE!", "#00ffff", 14);
                    }
                }
            }

            // Unified damage application via takeDamage
            let localApplyDamage = true;
            if (b.isPiercing) {
                if (!b.hitIds) b.hitIds = [];
                if (b.hitIds.includes(victim)) localApplyDamage = false;
                else b.hitIds.push(victim);
            }

            if (localApplyDamage) {
                let dealtDmg = victim.takeDamage(finalDmg, attacker);
                BulletHooks.call(b, 'hit', attacker, victim, dealtDmg);

                // --- SHADOW HUNTER BULLET HIT EFFECTS ---
                if (attacker.weapon === 'shadow_hunter' || b.isShadowHunter) {
                    victim.bleedTimer = 60;
                    victim.bleedInterval = 12;
                    victim.bleedDmg = Math.max(0.05, victim.maxHp * 0.02);
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 60);

                    if (b.causesBlind || (attacker.hasUpgrade('evo_sh_1') && b.type === 'shadow_empowered')) {
                        victim.blindTimer = 90;
                        if (typeof addFloatingText === 'function') addFloatingText(victim.x + victim.w / 2, victim.y - 20, "BLINDED! 👁️", "#ff0055", 14);
                    }

                    if (b.causesSilence || attacker.hasUpgrade('evo_sh_2')) {
                        victim.silenceTimer = Math.max(victim.silenceTimer || 0, 90);
                        if (typeof addFloatingText === 'function') addFloatingText(victim.x + victim.w / 2, victim.y - 20, "SILENCED! 🔇", "#8e44ad", 14);
                    }
                }

                // --- SHORTGUN BULLET HIT EFFECTS ---
                if (attacker.weapon === 'shortgunATK' || b.isShortgun) {
                    if (b.isBurn || attacker.hasUpgrade('evo_sg_1')) {
                        victim.burnStacks = (victim.burnStacks || 0) + 2;
                        victim.burnTimer = 180;
                    }
                    if (victim.hp <= 0) {
                        handleEntityKilledByAttacker(victim, victim.x + victim.w / 2, victim.y + victim.h / 2);
                    }
                }

                // Hiệu ứng đạn Drone Không Kích
                if (b.isInventorBullet) {
                    if (b.specialType === 'mortar') {
                        explosions.push(new Explosion(b.x, b.y, 65, 'orange', 1, attacker));
                    } else if (b.specialType === 'ice') {
                        iceZones.push(new IceZone(b.x, b.y, 90, 150, attacker));
                    } else if (b.specialType === 'fire') {
                        victim.burnTimer = 180;
                        victim.burnStacks = (victim.burnStacks || 0) + 1;
                        explosions.push(new Explosion(b.x, b.y, 50, 'red', 1, attacker));
                    }
                    // Nhiễu sóng (Stun 1.5s khi đủ 3 hit)
                    if (attacker.invUpgrades && attacker.invUpgrades['inv_nhieu']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
                        attacker.nhieuSongHits = (attacker.nhieuSongHits || 0) + 1;
                        if (attacker.nhieuSongHits >= 3) {
                            victim.freezeTimer = 90;
                            attacker.nhieuSongHits = 0;
                            addFloatingText(victim.x + victim.w / 2, victim.y - 15, "STUNNED! ⚡", "#00ffcc", 14);
                        }
                    }
                }

                // Hiệu ứng thừa hưởng từ Tăng Cường Hệ Thống cho đạn thường của Nhà Phát Minh
                if (b.isInventorPlayerBullet && attacker.invUpgrades && attacker.invUpgrades['inv_tangcuong']) {
                    if (b.tangCuongSlow || attacker.invUpgrades['inv_bang']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
                    }
                    if (b.tangCuongBurn || attacker.invUpgrades['inv_lua']) {
                        victim.burnTimer = 180;
                        victim.burnStacks = (victim.burnStacks || 0) + 1;
                        explosions.push(new Explosion(b.x, b.y, 35, 'red', 0.5, attacker));
                    }
                    if (b.tangCuongNhieu || attacker.invUpgrades['inv_nhieu']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
                        attacker.nhieuSongHits = (attacker.nhieuSongHits || 0) + 1;
                        if (attacker.nhieuSongHits >= 3) {
                            victim.freezeTimer = 90;
                            attacker.nhieuSongHits = 0;
                            addFloatingText(victim.x + victim.w / 2, victim.y - 15, "STUNNED! ⚡", "#00ffcc", 14);
                        }
                    }
                }

                if (b.isRocket) {
                    let range = attacker.hasUpgrade('evo_rocket_1') ? 100 : 60;
                    let color = attacker.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                    explosions.push(new Explosion(b.x, b.y, range, color, 1, attacker));
                    if (attacker.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(b.x, b.y));
                }
                if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, attacker));
                if (b.createIceZone) {
                    let radius = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 140 : 100;
                    let duration = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 240 : 120;
                    iceZones.push(new IceZone(b.x, b.y, radius, duration, attacker));
                }
                if (b.createFireZone) {
                    explosions.push(new Explosion(b.x, b.y, 100, 'red', 3, attacker));
                    radiationZones.push(new RadiationZone(b.x, b.y));
                }
            }

            if (!b.isPiercing) {
                attacker.bullets.splice(i, 1);
                i--;
            }

        if (victim.hp <= 0) {
            triggerFatalCinematic(attacker.id, victim);
            if (attacker.weapon === 'storm' && attacker.hasUpgrade('evo_storm_1') && attacker.hasUpgrade('evo_storm_2')) {
                explosions.push(new Explosion(canvas.width / 2, canvas.height / 2, 300, 'white', 0, attacker));
            }
        }
        }
    }
}
