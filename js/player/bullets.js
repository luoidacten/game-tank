// ==========================================
// Player — Cập nhật đường bay & va chạm của đạn
// ==========================================

Object.assign(Player.prototype, {
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            // FIX: Phải gọi viên đạn b ra TRƯỚC CÙNG rồi mới làm gì thì làm
            let b = this.bullets[i];
            let hitWall = false;

            // Motion blur / trailHistory cho đạn nhanh
            let isFastBullet = b.isSniperBullet || b.isRaycast || b.type === 'arrow' || b.isLazer || (b.isGhost && b.isFast) || b.isSukunaSlash || b.isFuga || b.type === 'purple' || b.isCannonball || b.isShortgun || b.type === 'shadow_empowered';
            if (isFastBullet) {
                if (!b.trailHistory) b.trailHistory = [];
                b.trailHistory.unshift({ x: b.x, y: b.y, w: b.w, h: b.h });
                if (b.trailHistory.length > 5) b.trailHistory.pop();
            }
            // Xử lý Raycast hóa đạn thường khi chạm vật thể cứng (Chèn vào ĐẦU vòng lặp `for (let i = this.bullets.length - 1; i >= 0; i--)`)
            if (b.isRaycast) {
                // Check nếu chạm các SniperWall hoặc MovingObstacle
                let hitSolid = false;
                let allWalls = [...sniperWalls];
                if (movingObstacle && movingObstacle.active) allWalls.push(movingObstacle);
                if (typeof bastions !== 'undefined' && bastions.length > 0) allWalls.push(...bastions);

                for (let w of allWalls) {
                    if (rectIntersect(b.x, b.y, b.w, b.h, w.x, w.y, w.w, w.h)) {
                        hitSolid = true; break;
                    }
                }
                if (hitSolid) {
                    b.isRaycast = false; // Mất trạng thái Raycast
                    b.h = 10; // Cắt ngắn lại thành đạn thường
                    let angle = Math.atan2(b.vy, b.vx);
                    b.vx = Math.cos(angle) * b.raycastBaseSpd;
                    b.vy = Math.sin(angle) * b.raycastBaseSpd;
                }
            }
            // 

            // LOGIC ĐẠN TÍM (GOJO)
            // ... (bên trong hàm updateBullets) ...
            // --- LOGIC ĐẠN TÍM (HƯ THỨC: TỬ) ---

            if (b.type === 'purple') {
                // 1. Tụ lực và tăng tốc
                if (b.chargeTimer > 0) {
                    b.chargeTimer--;
                    // (Tùy chọn) Thêm hiệu ứng hút không khí lúc đang tụ lực ở đây
                } else {
                    b.vy *= 1.1; // Tăng tốc dần đều
                    b.vx *= 1.1;
                }

                // 2. Di chuyển đạn (Bắt buộc phải tự di chuyển ở đây vì ta sẽ chặn code bên dưới)
                b.x += b.vx;
                b.y += b.vy;

                // 3. Xuyên thấu & Gây sát thương lên kẻ địch trên đường bay
                const enemyObj = (this.id === 1) ? p2 : p1;
                if (rectIntersect(b.x, b.y, b.w, b.h, enemyObj.x, enemyObj.y, enemyObj.w, enemyObj.h)) {
                    if (!b.hitIds) b.hitIds = [];
                    // Chỉ giật dame 1 lần khi bay xuyên qua để tránh giật HP liên tục tới chết
                    if (!b.hitIds.includes(enemyObj)) {
                        enemyObj.takeDamage(b.dmg, this);
                        b.hitIds.push(enemyObj);
                        // Nổ hiệu ứng nhỏ trên người địch
                        explosions.push(new Explosion(enemyObj.x + enemyObj.w / 2, enemyObj.y + enemyObj.h / 2, 30, 'rgba(128, 0, 128, 0.7)', 0, this));
                    }
                }

                // 4. Cán qua và xóa sổ Rương, Xe chở tiền
                let obstacles = [...crates, ...moneyTrucks];
                for (let obj of obstacles) {
                    if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                        obj.active = false; // Xóa sổ vật thể ngay lập tức (Uy lực của Tử)
                        explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 60, 'rgba(128, 0, 128, 0.5)', 0, this));
                    }
                }

                // 5. Nổ khổng lồ khi chạm Tường (Check cả 4 bức tường)
                if (b.x <= 0 || b.x + b.w >= canvas.width || b.y <= 0 || b.y + b.h >= canvas.height) {
                    // Ép tọa độ không bị tràn viền
                    if (b.x < 0) b.x = 0;
                    if (b.x > canvas.width - b.w) b.x = canvas.width - b.w;
                    if (b.y < 0) b.y = 0;
                    if (b.y > canvas.height - b.h) b.y = canvas.height - b.h;

                    // Bùmmmm! (Nerfed: Bán kính nổ giảm 50% tránh bao phủ toàn map)
                    let radius = b.isEvo2 ? 70 : 55;
                    explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, radius, 'purple', 3.0, this));

                    this.bullets.splice(i, 1);
                    continue;
                }

                // [CHỐT CHẶN]: Bắt buộc có dòng này để đạn Tím không bị lọt xuống code đạn thường bên dưới
                continue;
            }
            // --- LOGIC ĐẠN XANH (GOJO BLUE - HỐ ĐEN TRỌNG LỰC) ---
            if (b.type === 'gojo_blue') {
                b.x += b.vx;
                b.y += b.vy;

                let hitSomething = false;

                // 1. Check chạm Tường (Bắt 4 góc giống hệt chiêu Tím để không bao giờ bị tàng hình)
                if (b.x <= 0 || b.x + b.w >= canvas.width || b.y <= 0 || b.y + b.h >= canvas.height) {
                    hitSomething = true;
                    // Ép tọa độ không tràn viền
                    if (b.x < 0) b.x = 0;
                    if (b.x > canvas.width - b.w) b.x = canvas.width - b.w;
                    if (b.y < 0) b.y = 0;
                    if (b.y > canvas.height - b.h) b.y = canvas.height - b.h;
                }

                // 2. Check chạm Địch
                const enemyObj = (this.id === 1) ? p2 : p1;
                if (!hitSomething && rectIntersect(b.x, b.y, b.w, b.h, enemyObj.x, enemyObj.y, enemyObj.w, enemyObj.h)) {
                    hitSomething = true;
                }

                // 3. Check chạm Vật thể (Mượn form chuẩn của Tím)
                if (!hitSomething) {
                    let obstacles = [...crates, ...moneyTrucks];
                    if (typeof turrets !== 'undefined') obstacles.push(...turrets);
                    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) obstacles.push(movingObstacle);

                    for (let obj of obstacles) {
                        if (obj && obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            hitSomething = true;
                            // Phá hủy vật thể cản đường
                            if (obj.hp !== undefined) obj.hp -= b.dmg;
                            else obj.active = false;
                            break;
                        }
                    }
                }

                // 4. TRÚNG ĐÍCH -> HÚT VÀ NỔ
                if (hitSomething) {
                    let hitX = b.x + b.w / 2;
                    let hitY = b.y + b.h / 2;

                    let radius = b.isEvo2 ? 60 : 35;

                    // --- CƠ CHẾ HÚT VÀO GIỮA (CHỈ TRỤC NGANG X) ---
                    // Tầm hút rộng hơn vụ nổ để kéo địch từ xa vào
                    if (Math.hypot(enemyObj.x + enemyObj.w / 2 - hitX, enemyObj.y + enemyObj.h / 2 - hitY) <= radius) {
                        // Dịch chuyển thẳng kẻ địch vào đúng tâm X của hố đen
                        enemyObj.x = hitX - enemyObj.w / 2;
                        enemyObj.kbX = 0; // Khóa gia tốc để địch không văng ra ngoài, ăn trọn sát thương
                    }

                    // --- TẠO VỤ NỔ XANH ---
                    explosions.push(new Explosion(hitX, hitY, radius, 'rgba(0, 0, 255, 0.9)', b.dmg, this));

                    // Dư chấn Evo 2 (Nổ bồi thêm phát nữa)
                    if (b.isEvo2) {
                        setTimeout(() => {
                            explosions.push(new Explosion(hitX, hitY, radius - 20, 'rgba(0, 0, 255, 0.5)', b.dmg * 0.3, this));
                        }, 300);
                    }

                    // Xóa đạn vô hình sau khi nổ
                    this.bullets.splice(i, 1);
                    continue;
                }

                // Tránh đạn rơi xuống logic bên dưới
                continue;
            }

            // --- LOGIC ĐẠN TỰ NGẮM (HOMING) ---
            if (b.isHoming) {
                const enemy = (this.id === 1) ? p2 : p1;
                // Tính góc từ đạn tới kẻ địch
                let targetAngle = Math.atan2((enemy.y + enemy.h / 2) - (b.y + b.h / 2), (enemy.x + enemy.w / 2) - (b.x + b.w / 2));
                let currentAngle = Math.atan2(b.vy, b.vx);

                // Bẻ lái từ từ về phía địch (Turn speed = 0.05)
                let diff = targetAngle - currentAngle;
                while (diff <= -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                currentAngle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                let speed = Math.hypot(b.vx, b.vy);
                b.vx = Math.cos(currentAngle) * speed;
                b.vy = Math.sin(currentAngle) * speed;
            }
            if (b.isRocket) b.vy += (b.vy > 0 ? b.rocketAccel : -b.rocketAccel);
            b.x += b.vx; b.y += b.vy;

            // ==========================================
            // --- [CHÈN VÀO ĐÂY]: LOGIC VUA ĐẦU BẾP (SUKUNA) ---
            // ==========================================
            if (b.isSukunaSlash || b.isFuga) {

                // 1. Phách Diện Rộng (Chém nát đạn đối thủ)
                if (b.isSukunaSlash && this.hasUpgrade('evo_sukuna_2')) {
                    const enemy = (this.id === 1) ? p2 : p1;
                    for (let j = enemy.bullets.length - 1; j >= 0; j--) {
                        let eb = enemy.bullets[j];
                        // Đảm bảo không tự chém trúng Fuga hay Slash của đối phương (nếu cả 2 chơi Sukuna)
                        if (!eb.isSukunaSlash && !eb.isFuga) {
                            if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                                enemy.bullets.splice(j, 1); // Xóa sổ đạn đối thủ
                            }
                        }
                    }
                }

                // 2. Hỏa Mũi Tên Fuga (Thiêu rụi mọi vật thể)
                if (b.isFuga) {
                    // Gộp chung các chướng ngại vật lại (Thùng đồ, Xe chở tiền, Tường di động)
                    let obstaclesToDestroy = [...crates, ...moneyTrucks];
                    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) {
                        obstaclesToDestroy.push(movingObstacle);
                    }

                    for (let obj of obstaclesToDestroy) {
                        if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            obj.active = false; // Phá nát vật thể
                            explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 80, 'rgba(255, 69, 0, 0.8)', 0, this));
                        }
                    }
                }

                // 3. Xóa đạn khi bay HẲN ra khỏi màn hình (Tránh lag game)
                // Kéo giãn tọa độ ra một chút để chiêu thức bay qua tường mượt mà
                if (b.x + b.w < -100 || b.x > canvas.width + 100 || b.y + b.h < -100 || b.y > canvas.height + 100) {
                    this.bullets.splice(i, 1);
                }

                // [CHỐT CHẶN]: Bỏ qua toàn bộ code check chạm tường, chạm rương bên dưới 
                // để chiêu của Sukuna càn quét xuyên thấu bản đồ!
                continue;
            }
            // ==========================================
            // --- KẾT THÚC LOGIC SUKUNA ---

            // --- [LOGIC MỚI] XỬ LÝ HƯ ẢNH (STORM PHANTOM) ---
            if (b.isStormPhantom) {
                b.y += b.vy;
                b.distanceTraveled += Math.abs(b.vy);

                // 1. EVO 1: MẮT BÃO - PHÁ ĐẠN TRÊN ĐƯỜNG BAY
                if (this.hasUpgrade('evo_storm_1')) {
                    const enemyBullets = (this.id === 1) ? p2.bullets : p1.bullets;
                    for (let j = enemyBullets.length - 1; j >= 0; j--) {
                        let eb = enemyBullets[j];
                        // Nếu chạm đạn địch -> Xóa đạn địch
                        if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                            enemyBullets.splice(j, 1);
                            // Hiệu ứng xóa đạn (tùy chọn)
                        }
                    }
                }

                // 2. GÂY SÁT THƯƠNG TRÊN ĐƯỜNG BAY (XUYÊN THẤU)
                let targets = [moneyTrucks, crates]; // Check xe và thùng
                const enemy = (this.id === 1) ? p2 : p1;

                // Check địch
                if (!b.hitIds.includes(enemy) && rectIntersect(b.x, b.y, b.w, b.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                    if (enemy.shield > 0) enemy.shield--;
                    else enemy.takeDamage(b.dmg, this);
                    b.hitIds.push(enemy);
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 40, 'rgba(0,255,255,', 0, this));
                }

                // Check vật thể
                targets.forEach(group => {
                    group.forEach(obj => {
                        if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            // Gây dame lên xe/thùng nhưng không xóa bóng
                            obj.hp -= b.dmg * 2;
                            if (obj.hp <= 0 && obj instanceof MoneyTruck) { /* Logic nổ xe...*/ }
                            // Thêm logic phá thùng tại đây nếu muốn
                        }
                    });
                });

                // 3. ĐIỀU KIỆN DỪNG & DỊCH CHUYỂN
                let stop = false;
                // Chạm tường
                if (b.y < 0 || b.y > canvas.height - b.h) {
                    b.y = (b.y < 0) ? 0 : canvas.height - b.h;
                    stop = true;
                }
                // Hết tầm bay
                if (b.distanceTraveled >= b.maxDistance) stop = true;

                if (stop) {
                    // --- THỰC HIỆN DỊCH CHUYỂN ---
                    this.x = b.x;
                    this.y = b.y;

                    // Xóa bóng
                    this.bullets.splice(i, 1);

                    // Set thời gian chờ chém (0.5s)
                    this.stormSlashDelay = 30;

                    // Hiệu ứng xuất hiện
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'rgba(255,255,255,', 0, this));
                    continue;
                }
                continue; // Bóng hư ảnh ko chạy logic đạn thường bên dưới
            }
            if (b.isWindBlade) {
                b.rotation += 0.3; // Tốc độ xoay
            }
            if (b.isWindBlade) {
                // Check va chạm với đạn đối phương
                const enemy = (this.id === 1) ? p2 : p1;
                for (let j = enemy.bullets.length - 1; j >= 0; j--) {
                    let eb = enemy.bullets[j];
                    if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                        // Evo 2: Nghịch Phong -> Phản đạn
                        if (this.hasUpgrade('evo_wind_2') && !eb.isPiercing && !eb.bounceCount) {
                            // Đổi chủ sở hữu
                            eb.owner = this;
                            eb.hitIds = []; // Xóa lịch sử va chạm

                            // Đổi hướng ngẫu nhiên về phía kẻ địch
                            let angle = Math.atan2(enemy.y - eb.y, enemy.x - eb.x);
                            angle += (Math.random() - 0.5);
                            let speed = Math.hypot(eb.vx, eb.vy);
                            eb.vx = Math.cos(angle) * speed;
                            eb.vy = Math.sin(angle) * speed;

                            // ✅ FIX QUAN TRỌNG: Chuyển đạn từ mảng địch sang mảng của mình
                            this.bullets.push(eb);
                            enemy.bullets.splice(j, 1);
                        } else {
                            // Mặc định: Phá đạn
                            enemy.bullets.splice(j, 1);
                        }
                    }
                }
            }
            if (b.x <= 0 || b.x >= canvas.width) {
                // Check đạn lớn
                if (this.hasUpgrade('evo_big_2') && b.bounceCount < 5) {
                    b.vx = -b.vx;
                    b.bounceCount++;
                    hitWall = false; // Đánh dấu là nảy, không phải đâm tường mất đạn

                    // FULL EVO BIG BULLET: Nảy tường phình to kích thước & tăng dame (bỏ tăng tốc đạn)
                    if (b.isFullEvoBig) {
                        b.w = Math.min(45, (b.w || 10) + 5);
                        b.h = Math.min(45, (b.h || 10) + 5);
                        b.dmg = (b.dmg || 2) + 0.25;
                        explosions.push(new Explosion(b.x, b.y, 30, 'orange', 0.5, this));
                    }
                } else hitWall = true;
            }
            if (b.y <= 0 || b.y >= canvas.height) {
                if (this.hasUpgrade('evo_big_2') && b.bounceCount < 5) {
                    b.vy = -b.vy;
                    b.bounceCount++;
                    hitWall = false;

                    // FULL EVO BIG BULLET: Nảy tường phình to kích thước & tăng dame (bỏ tăng tốc đạn)
                    if (b.isFullEvoBig) {
                        b.w = Math.min(45, (b.w || 10) + 5);
                        b.h = Math.min(45, (b.h || 10) + 5);
                        b.dmg = (b.dmg || 2) + 0.25;
                        explosions.push(new Explosion(b.x, b.y, 30, 'orange', 0.5, this));
                    }
                } else hitWall = true;
            }
            if (hitWall) {
                if (BulletHooks.call(b, 'edge', this) === 'keep') continue; // hook tự xử lý (vd. nảy tường)
                // --- THUNDER SPEAR CẮM TƯỜNG & NỔ ---
                if (b.isThunderSpear) {
                    let hasEvo1 = (this.hasUpgrade && this.hasUpgrade('evo_thun_1'));
                    let expDmg = 1.0;
                    explosions.push(new Explosion(b.x, b.y, 45, 'rgba(255, 255, 0,', expDmg, this));
                    let enemy = (this.id === 1) ? p2 : p1;
                    if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - b.x, (enemy.y + enemy.h / 2) - b.y) <= 45) {
                        enemy.takeDamage(expDmg, this);
                        if (hasEvo1) {
                            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                            if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
                        }
                    }
                    let plantX = Math.max(10, Math.min(canvas.width - 10, b.x));
                    let plantY = Math.max(10, Math.min(canvas.height - 10, b.y));
                    thunderPlantedSpears.push({
                        id: Math.random(),
                        owner: this,
                        x: plantX,
                        y: plantY,
                        angle: Math.atan2(b.vy, b.vx)
                    });
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- MAGNET BULLET CẮM CỘT TỪ TRƯỜNG ---
                if (b.isMagnetBullet) {
                    let maxNodes = (this.hasUpgrade && this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2')) ? 4 : (this.hasUpgrade && this.hasUpgrade('evo_mag_net_2') ? 3 : 2);
                    let myNodes = magnetNodes.filter(n => n.owner === this && n.active);
                    if (myNodes.length >= maxNodes) {
                        let oldest = myNodes[0];
                        oldest.active = false;
                        explosions.push(new Explosion(oldest.x, oldest.y, 30, oldest.polarity === 1 ? 'rgba(255, 100, 0,' : 'rgba(0, 150, 255,', 0, this));
                    }
                    let plantX = Math.max(10, Math.min(canvas.width - 10, b.x));
                    let plantY = Math.max(10, Math.min(canvas.height - 10, b.y));
                    let isFullEvo = (this.hasUpgrade && this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2'));
                    let radius = isFullEvo ? 135 : 90;
                    magnetNodes.push({
                        id: Math.random(),
                        owner: this,
                        x: plantX,
                        y: plantY,
                        polarity: b.polarity || this.magnetPolarity || 1,
                        radius: radius,
                        active: true
                    });
                    explosions.push(new Explosion(plantX, plantY, 25, b.polarity === 1 ? '#ff5722' : '#00bcd4', 0, this));
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- DEATH LOCK (TRỐI CHẾT): ĐẠN CẤM CHẾ CẮM TƯỜNG & MỞ LỒNG ---
                if (b.isConfinementBullet) {
                    confinementCages.push(new ConfinementCage(b.x, b.y, this));
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- THÊM VÀO ĐÂY CHO ÂM DƯƠNG SƯ ---
                if (b.isAmChu) {
                    let r = this.hasUpgrade('evo_ads_1') ? 55 : 40;
                    iceZones.push(new IceZone(b.x, b.y, r, 90, this)); // Âm: Làm chậm (nerfed)
                    talismans.push(new Talisman(b.x, b.y, 'am', this));
                }
                if (b.isDuongChu) {
                    let r = this.hasUpgrade('evo_ads_1') ? 55 : 40;
                    explosions.push(new Explosion(b.x, b.y, r, 'rgba(255, 100, 0,', 0.75, this)); // Dương: Nổ (nerfed)
                    voidZones.push(new VoidZone(b.x, b.y, r, 90, this)); // Dương: Cấm bắn (nerfed)
                    talismans.push(new Talisman(b.x, b.y, 'duong', this));
                }

                if (this.hasUpgrade('evo_over_1') && b.isFullCharge) explosions.push(new Explosion(b.x, b.y, 80, 'rgba(0, 255, 255,', 2, this));
                if (b.createFireZone) {
                    explosions.push(new Explosion(b.x, b.y, 100, 'red', 3, this));
                    radiationZones.push(new RadiationZone(b.x, b.y)); // Để lại vùng gây dame
                }
                if (b.type === 'hu_vo') {
                    explosions.push(new Explosion(b.x, b.y, 55, 'purple', 0.5, this));
                    voidZones.push(new VoidZone(b.x, b.y, 55, 120, this));
                }
                if (b.isRocket) {
                    let range = 60;
                    if (this.hasUpgrade('evo_rocket_1')) range = 100;
                    // Full Evo Rocket: Range 140
                    if (this.hasUpgrade('evo_rocket_1') && this.hasUpgrade('evo_rocket_2')) range = 140;

                    let color = this.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                    let dmg = this.hasUpgrade('evo_rocket_2') ? 2 : 1;
                    explosions.push(new Explosion(b.x, b.y, range, color, dmg, this));

                    if (this.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(b.x, b.y));
                }
                if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));

                // UPDATE LOGIC ICE ZONE TẠI TƯỜNG
                if (b.createIceZone) {
                    // Chỉ to nếu là BigIceZone (lần 3)
                    let radius = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 125 : 75;
                    let duration = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 600 : 120;
                    iceZones.push(new IceZone(b.x, b.y, radius, duration, this));
                }
                // --- LOGIC ACID MỚI: Chạm tường -> Tạo Vùng ---
                if (b.isAcid) {
                    iceZones.push(new AcidZone(b.x, b.y, this));
                    explosions.push(new Explosion(b.x, b.y, 40, '#7bf85cff', 0, this)); // Nổ hiệu ứng nhỏ
                }
                this.bullets.splice(i, 1); continue;
            }

            if (movingObstacle && movingObstacle.active && rectIntersect(b.x, b.y, b.w, b.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) {
                if (!b.isPiercing || b.hook) BulletHooks.call(b, 'obstacle', this, movingObstacle, 'moving');
                if (!b.isPiercing) {
                    if (b.isRocket) {
                        let range = this.hasUpgrade('evo_rocket_1') || this.hasUpgrade('evo_rocket_2') ? 100 : 60;
                        let color = this.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                        explosions.push(new Explosion(b.x, b.y, range, color, 1, this));
                    }
                    if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));
                    this.bullets.splice(i, 1); continue;
                }
            }

            if (typeof bastions !== 'undefined' && bastions.length > 0) {
                let hitBastion = false;
                for (let bw of bastions) {
                    if (bw.active && rectIntersect(b.x, b.y, b.w, b.h, bw.x, bw.y, bw.w, bw.h)) {
                        bw.hp -= (b.dmg || 1);
                        BulletHooks.call(b, 'obstacle', this, bw, 'bastion');
                        if (bw.hp <= 0) {
                            bw.active = false;
                            explosions.push(new Explosion(bw.x + bw.w / 2, bw.y + bw.h / 2, 50, '#1abc9c', 0, this));
                        }
                        if (!b.isPiercing) {
                            this.bullets.splice(i, 1);
                            hitBastion = true;
                            break;
                        }
                    }
                }
                if (hitBastion) continue;
            }

            let hitTruck = false;
            for (let t of moneyTrucks) {
                if (t.active && rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    if (b.isPiercing && b.hitIds.includes(t)) continue;
                    let dmg = b.dmg;
                    if (this.weapon === 'money_tank') dmg *= 3;
                    dmg *= (BulletHooks.call(b, 'truckDmgMult', this, t) || 1);
                    t.hp -= dmg;
                    BulletHooks.call(b, 'obstacle', this, t, 'truck');
                    if (b.isPiercing) b.hitIds.push(t);

                    if (b.isRocket || b.isExplosive) {
                        explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255,165,0,', 2, this));
                        if ((b.isRocket || b.isExplosive) && !b.isPiercing) { this.bullets.splice(i, 1); hitTruck = true; break; }
                    }

                    if (!b.isPiercing) { this.bullets.splice(i, 1); hitTruck = true; }

                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');

                        // BUFF: Xe Tiền Evo bắn Shotgun vào kẻ địch
                        if (this.hasUpgrade('evo_money_atk')) {
                            const enemy = (this.id === 1) ? p2 : p1;
                            const angle = Math.atan2(enemy.y - (t.y + t.h / 2), enemy.x - (t.x + t.w / 2));
                            const spread = [-0.3, 0, 0.3];
                            spread.forEach(a => {
                                this.bullets.push({
                                    x: t.x + t.w / 2, y: t.y + t.h / 2, w: 6, h: 6,
                                    vx: Math.cos(angle + a) * 7, vy: Math.sin(angle + a) * 7,
                                    dmg: 2, owner: this, bounceCount: 0, isPiercing: false
                                });
                            });
                            // Vẫn nổ đẹp mắt
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, this));
                        } else {
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this));
                        }
                    }
                    if (hitTruck) break;
                }
            }
            if (hitTruck) continue;

            let hitCrate = false;
            for (let c of crates) {
                if (c.active && rectIntersect(b.x, b.y, b.w, b.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    BulletHooks.call(b, 'obstacle', this, c, 'crate');
                    crateOnBreak(c, this);
                    if (c.isMimic) {
                        triggerMimicExplosion(c, this);
                    }
                    if (c.type === 'hp') {
                        if (this.weapon === 'necromancer') {
                            let cap = this.maxSouls - (this.lockedSouls || 0);
                            this.currentSouls = Math.min(cap, (this.currentSouls || 0) + 4);
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.hp = Math.min(this.hp + 1, this.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.shield++;
                    if (c.type === 'dmg') this.dmgBuff++;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                    if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 0, null));
                    if (c.type === 'coin') {
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'inventor') this.components = (this.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = this.hasUpgrade('evo_inv_1') ? 8 : 5;
                        this.ammo = Math.min(this.maxAmmo, this.ammo + 1);
                        this.hp = Math.min(this.maxHp, this.hp + 0.25);
                        if (this.weapon === 'inventor') {
                            this.components = (this.components || 0) + lkGain;
                            addFloatingText(this.x + this.w / 2, this.y - 15, `+${lkGain} LK`, "#00ffcc", 13);
                        }
                        if (this.weapon === 'genius') {
                            if (this.isPilotingMecha) {
                                if (this.mechaHp < this.mechaMaxHp) {
                                    this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.gears = (this.gears || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    // Genius: +1 Bánh Răng khi nhặt hòm tiếp tế khác gear. Nếu đang lái Mecha -> quy đổi thành +0.5 HP/Giáp Ảo
                    if (this.weapon === 'genius' && c.type !== 'gear') {
                        if (this.isPilotingMecha) {
                            if (this.mechaHp < this.mechaMaxHp) {
                                this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.gears = (this.gears || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.components = (this.components || 0) + 0.5;
                        addFloatingText(this.x + this.w / 2, this.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }
                    // Giáp hợp kim: Nhặt Crate nhận Giáp Ảo 5s
                    if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_giap']) {
                        this.shield = (this.shield || 0) + 1;
                        this.crateShieldActive = true;
                        this.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }

                    if (!b.isPiercing) {
                        if (b.isRocket) explosions.push(new Explosion(b.x, b.y, 60, 'rgba(255, 100, 0,', 1, this));
                        if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));
                        // ICE ZONE TRÊN CRATE
                        if (b.createIceZone) {
                            let radius = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 300 : 150;
                            let duration = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 600 : 120;
                            iceZones.push(new IceZone(b.x, b.y, radius, duration, this));
                        }
                        this.bullets.splice(i, 1); hitCrate = true; break;
                    }
                }
            }
            if (hitCrate) continue;
        }
    }
});
