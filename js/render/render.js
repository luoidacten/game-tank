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

let worldViewTransform = null;

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
    // Khung nhìn thế giới (xoay guest + zoom kết liễu + rung) – lớp HUD vẽ sau renderFrame dùng lại cho khớp
    worldViewTransform = ctx.getTransform();

    // NỀN SÀN ĐẤU (vẽ trong world-space để rung màn hình đồng bộ)
    ctx.drawImage(getArenaFloor(), 0, 0, canvas.width, canvas.height);

    // VẼ TRỜI MƯA NẾU CÓ STORM FULL EVO
    if (isRaining) drawRain();

    // Nền BÀNH TRƯỚNG LÃNH ĐỊA (Sukuna / Gojo) - js/render/tank-art/curse.js
    if (typeof curseFxUnder === 'function') curseFxUnder();

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
    const zs = (typeof getZoneState === 'function') ? getZoneState(timePlayed) : null;
    if (zs) {
        const H = canvas.height, W = canvas.width;
        const blink = 0.5 + 0.5 * Math.sin(now / 160);
        ctx.save();
        // Phủ đỏ mờ vùng nguy hiểm (ngoài bo)
        ctx.fillStyle = 'rgba(255, 30, 60, 0.13)';
        if (zs.x0 > 0) ctx.fillRect(0, 0, zs.x0, H);
        if (zs.x1 < W) ctx.fillRect(zs.x1, 0, W - zs.x1, H);
        // Vùng sắp tới (vàng chấm) để người chơi kịp di chuyển
        if (zs.next && (Math.abs(zs.next.x0 - zs.x0) > 2 || Math.abs(zs.next.x1 - zs.x1) > 2)) {
            ctx.strokeStyle = `rgba(255, 215, 64, ${0.35 + 0.35 * blink})`; ctx.lineWidth = 2;
            ctx.setLineDash([4, 8]); ctx.lineDashOffset = -now / 40;
            ctx.strokeRect(zs.next.x0, 2, zs.next.x1 - zs.next.x0, H - 4);
            ctx.fillStyle = 'rgba(255, 215, 64, 0.05)';
            ctx.fillRect(zs.next.x0, 0, zs.next.x1 - zs.next.x0, H);
        }
        // Viền bo hiện tại
        ctx.setLineDash([10, 10]); ctx.lineDashOffset = 0;
        ctx.strokeStyle = 'red'; ctx.lineWidth = 2;
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 8;
        ctx.strokeRect(zs.x0, 0, zs.x1 - zs.x0, H);
        ctx.setLineDash([]); ctx.shadowBlur = 0;
        // Nhãn giai đoạn (giữa sân, chữ nhỏ)
        if (zs.label) {
            ctx.font = "bold 11px 'Orbitron', Arial"; ctx.textAlign = 'center';
            ctx.fillStyle = zs.phase === 1.5 || zs.phase === 3 ? `rgba(255, 215, 64, ${0.6 + 0.4 * blink})` : 'rgba(255, 82, 82, 0.9)';
            const lx = Math.max(60, Math.min(W - 60, (zs.x0 + zs.x1) / 2));
            if (typeof drawWorldText === 'function') drawWorldText(ctx, '⚠ ' + zs.label, lx, H * 0.4);
            else ctx.fillText('⚠ ' + zs.label, lx, H * 0.4);
        }
        ctx.restore();
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

    // Tụ lực Lôi Thần (3 giai đoạn): vòng 3 ô cạnh xe + biểu tượng trên nút Bắn (js/render/empower-providers.js)

    // Vẽ pháo nổ trên đầu người chơi
    mortars.forEach(m => m.draw());

    // Lớp phủ Lãnh địa & ấn Ràng Buộc - js/render/tank-art/curse.js
    if (typeof curseFxOver === 'function') curseFxOver();
    // Lớp phủ kết liễu Hoa Ảnh (chớp màn hình, nhát chém ngang) - js/characters/flower_shadow/render.js
    if (typeof fsFxOver === 'function') fsFxOver();
    // Lớp phủ kết liễu Tsukiyo (Nguyệt Trảm) - js/characters/tsukiyo/render.js
    if (typeof tsFxOver === 'function') tsFxOver();
    // Lớp phủ kết liễu Joker (ALL IN) - js/characters/joker/render.js
    if (typeof jkFxOver === 'function') jkFxOver();
    // Lớp phủ kết liễu Juggernaut (PHÁ XIỀNG) - js/characters/juggernaut/render.js
    if (typeof jgFxOver === 'function') jgFxOver();
    // Lớp phủ kết liễu Pháo Phân Mảnh (PHÂN MẢNH) - js/characters/cluster_gun/render.js
    if (typeof cgFxOver === 'function') cgFxOver();
    // Lớp phủ kết liễu Nhân Bản (VÔ HẠN) - js/characters/clone/render.js
    if (typeof clFxOver === 'function') clFxOver();
    // Lớp phủ kết liễu Phi Công (BÁ CHỦ BẦU TRỜI) - js/characters/jet_pilot/render.js
    if (typeof jpFxOver === 'function') jpFxOver();
    // Lớp phủ kết liễu Phong Trảm (PHONG TRẢM) - js/characters/wind_slash/render.js
    if (typeof wsFxOver === 'function') wsFxOver();
    // Lớp phủ kết liễu Cuồng Phong (CUỒNG PHONG / THIÊN PHONG) - js/characters/storm/render.js
    if (typeof stFxOver === 'function') stFxOver();
    // Lớp phủ Tất Sát (slow-motion, Chém Nát Màn Hình, kết liễu NHẤT KIẾM TẤT SÁT!) - js/characters/tat_sat/render.js
    if (typeof tatFxOver === 'function') tatFxOver();
    // Lớp phủ kết liễu Nhất Quyền (CÚ ĐẤM RẼ ĐÔI BẦU TRỜI) - js/characters/one_punch/render.js
    if (typeof opFxOver === 'function') opFxOver();
    // Lớp phủ kết liễu Boomerang (KHÔNG LỐI THOÁT) - js/characters/boomerang/render.js
    if (typeof bmFxOver === 'function') bmFxOver();
    // Lớp phủ kết liễu Nhện Độc (HÓA KÉN KẾT LIỄU) - js/characters/arachnid/render.js
    if (typeof arFxOver === 'function') arFxOver();
    // Lớp phủ kết liễu Siêu Năng (TÂM NIỆM NGHIỀN NÁT) - js/characters/psychokinesis/render.js
    if (typeof psyFxOver === 'function') psyFxOver();
    // Lớp phủ kết liễu Thợ May (ĐƯỜNG KIM MŨI CHỈ) - js/characters/tailor/render.js
    if (typeof tlFxOver === 'function') tlFxOver();
    // Lớp phủ kết liễu Jack - 6 Lỗ (JACKPOT 777!) - js/characters/jack_6_lo/render.js
    if (typeof jlFxOver === 'function') jlFxOver();

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
    // Đang có hiệu ứng kết liễu (Hoa Ảnh, Tsukiyo, Joker...) -> băng rôn THẮNG chờ tới khi nó diễn xong
    // (tối đa ~1.1s) để không che phần giữa; chỉ trễ phần hiển thị, không đổi thời gian hiệp.
    if (fatalCinematic.active) {
        const elapsed = fatalCinematic.maxTimer - fatalCinematic.timer;
        if (elapsed < 3 || elapsed < victoryBannerStart) victoryBannerStart = -1; // hiệp mới (renderFrame không chạy giữa các hiệp)
        if (victoryBannerStart < 0 && (elapsed >= VICTORY_BANNER_MAX_WAIT || (elapsed >= 3 && !finisherFxActive()))) victoryBannerStart = elapsed;
        if (victoryBannerStart >= 0) {
            const span = Math.max(20, fatalCinematic.maxTimer - victoryBannerStart);
            drawVictoryBanner(fatalCinematic.winnerId, Math.max(0, span - (elapsed - victoryBannerStart)), span);
        }
    } else victoryBannerStart = -1;
}

// Băng rôn thắng hiệp: mốc bắt đầu hiện (tick trong fatalCinematic), -1 = chưa hiện
let victoryBannerStart = -1;
const VICTORY_BANNER_MAX_WAIT = 66;
const FINISHER_FX_CLASSES = ['FsFinisher', 'TsFinisher', 'JkFinisher', 'JgFinisher', 'CgFinisher', 'ClFinisher', 'JpFinisher', 'WsFinisher', 'StFinisher', 'TatFinisher', 'OpFinisher', 'BmFinisher', 'ArFinisher', 'PsyFinisher', 'TlFinisher', 'JlFinisher'];
function finisherFxActive() {
    if (typeof bodyEffects === 'undefined') return false;
    for (const e of bodyEffects) {
        if (!e || !e.active || !e.constructor) continue;
        if (FINISHER_FX_CLASSES.includes(e.constructor.name)) return true;
    }
    return false;
}
