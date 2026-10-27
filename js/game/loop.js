// ==========================================
// Vòng lặp game (requestAnimationFrame)
// ==========================================



function gameLoop(timestamp) {
    // --- CHECK CINEMATIC MODE ---
    if (cinematicMode) {
        cinematicTimer--;
        if (cinematicTimer % 5 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + (Math.random() - 0.5) * 100, 0);
        ctx.lineTo(cinematicVictim.x + cinematicVictim.w / 2, cinematicVictim.y + cinematicVictim.h / 2);
        ctx.stroke();

        if (cinematicTimer <= 0) {
            cinematicMode = false;
            // Online guest không tự quyết định kết thúc hiệp (chờ ROUND_END từ host)
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') return;
            endRound(cinematicWinnerId);
            return;
        }
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState.phase !== 'playing' && !fatalCinematic.active) return;

    if (!timestamp) timestamp = performance.now();
    if (!lastFixedLoopTime) lastFixedLoopTime = timestamp;

    let dt = timestamp - lastFixedLoopTime;
    lastFixedLoopTime = timestamp;

    // [FIX] Tạm dừng thật sự (trước đây isPaused không được kiểm tra nên game vẫn chạy sau menu).
    // Online thì không dừng được vì đối thủ vẫn đang chơi.
    const isOnlineMatch = (typeof onlineManager !== 'undefined' && onlineManager.isOnline);
    // Online: tạm dừng chung do host quyết định (js/online/social.js)
    const onlinePaused = isOnlineMatch && typeof OnlineSocial !== 'undefined' && OnlineSocial.isPaused();
    if ((gameState.isPaused && !isOnlineMatch) || onlinePaused) {
        if (!gameState.pauseStartedAt) gameState.pauseStartedAt = Date.now();
        fixedPhysicsAccumulator = 0;
        renderFrame();
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    if (gameState.pauseStartedAt) {
        // Dời các mốc thời gian của hiệp để thời gian tạm dừng không bị tính
        const paused = Date.now() - gameState.pauseStartedAt;
        gameState.roundStartTime += paused;
        gameState.lastObstacleSpawn += paused;
        lastCrateSpawn += paused;
        gameState.pauseStartedAt = 0;
    }

    PerfMonitor.sample(dt);

    // Giới hạn dt tối đa 250ms tránh dồn tích lũy quá lớn khi drop FPS hoặc đổi tab
    if (dt > 250) dt = 250;
    if (dt < 0) dt = 0;

    fixedPhysicsAccumulator += dt;

    let ticksRan = 0;
    while (fixedPhysicsAccumulator >= TICK_TIME && ticksRan < 5) {
        tickPhysics();
        fixedPhysicsAccumulator -= TICK_TIME;
        ticksRan++;
        if (gameState.phase !== 'playing' && !fatalCinematic.active) break;
    }

    renderFrame();

    if (gameState.phase === 'playing' || fatalCinematic.active) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// ==========================================
// Tự giảm chất lượng hình ảnh khi máy yếu -> js/core/quality.js (Quality: high/medium/low)
// ==========================================
const PerfMonitor = { sample(dt) { if (typeof Quality !== 'undefined') Quality.sample(dt); } };
function enableLowQuality() { if (typeof Quality !== 'undefined') Quality.set('low'); }

