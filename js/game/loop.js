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
