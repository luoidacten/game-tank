// ==========================================
// Hiệu ứng màn hình: rung, kết liễu, chữ nổi, tia lửa
// ==========================================



// ============================================================================
// SCREEN SHAKE, FLOATING COMBAT TEXT & PARTICLES
// ============================================================================
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
function triggerScreenShake(intensity = 6, duration = 10) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
    screenShake.duration = Math.max(screenShake.duration, duration);
}

let fatalCinematic = {
    active: false,
    timer: 0,
    maxTimer: 90,
    winnerId: null,
    victimX: 0,
    victimY: 0
};

function triggerFatalCinematic(winnerId, victim) {
    if (fatalCinematic.active || gameState.phase !== 'playing') return;

    if (victim) {
        victim.hp = 0;
        victim.ghostHp = 0;
    }

    let vx = victim ? (victim.x + victim.w / 2) : canvas.width / 2;
    let vy = victim ? (victim.y + victim.h / 2) : canvas.height / 2;

    fatalCinematic.active = true;
    fatalCinematic.timer = 90;
    fatalCinematic.maxTimer = 90;
    fatalCinematic.winnerId = winnerId;
    fatalCinematic.victimX = vx;
    fatalCinematic.victimY = vy;
    fatalCinematic.el = 0; fatalCinematic.bannerAt = -1; fatalCinematic.fxSeen = false; fatalCinematic.fxEnd = 0;
    // Thân có kết liễu chung (BodyFinisher) mà đòn chót không qua takeDamage (vd. độc, vật triệu hồi...) -> vẫn diễn
    if ((winnerId === 1 || winnerId === 2) && victim && typeof bfSpawn === 'function') bfSpawn(winnerId === 1 ? p1 : p2, victim);

    // Dramatic Screen Shake
    triggerScreenShake(14, 30);

    // Initial shockwave and explosion burst
    let winColor = (winnerId === 1) ? '#00f0ff' : ((winnerId === 2) ? '#ff0055' : '#ffd700');
    explosions.push(new Explosion(vx, vy, 85, winColor, 3, null));

    // Staggered secondary debris explosions
    for (let k = 1; k <= 5; k++) {
        setTimeout(() => {
            if (fatalCinematic.active) {
                let ox = (Math.random() - 0.5) * 50;
                let oy = (Math.random() - 0.5) * 50;
                explosions.push(new Explosion(vx + ox, vy + oy, 40 + Math.random() * 20, 'rgba(255, 120, 0,', 2, null));
                if (soundSystem) soundSystem.playExplosion();
            }
        }, k * 120);
    }

    if (soundSystem) {
        soundSystem.playExplosion();
        soundSystem.playWin();
    }
}

function drawVictoryBanner(winnerId, timer, maxTimer) {
    let progress = 1 - (timer / maxTimer);

    ctx.save();
    let bannerW = Math.min(canvas.width * 0.94, 380);
    let bannerH = 75;
    let bannerX = (canvas.width - bannerW) / 2;
    let bannerY = (canvas.height - bannerH) / 2;

    let isP1 = (winnerId === 1);
    let isP2 = (winnerId === 2);
    let mainColor = isP1 ? "#00f0ff" : (isP2 ? "#ff0055" : "#ffd700");
    let glowColor = isP1 ? "rgba(0, 240, 255, 0.8)" : (isP2 ? "rgba(255, 0, 85, 0.8)" : "rgba(255, 215, 0, 0.8)");
    let winnerText = isP1 ? "PLAYER 1 (BLUE)" : (isP2 ? "PLAYER 2 (RED)" : "CẢ HAI BÊN");

    // Dynamic banner bounce scale
    let scale = Math.min(1, 0.6 + progress * 0.5);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Dark cyberpunk banner backdrop
    ctx.fillStyle = "rgba(10, 14, 26, 0.92)";
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 22;

    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
    } else {
        ctx.rect(bannerX, bannerY, bannerW, bannerH);
    }
    ctx.fill();
    ctx.stroke();

    // Inner highlight stripes
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bannerX + 4, bannerY + 4, bannerW - 8, bannerH - 8);

    // Main Victory Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 22px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = mainColor;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 18;
    ctx.fillText(`${winnerText} THẮNG!`, canvas.width / 2, bannerY + 28);

    // Subtitle
    ctx.font = "bold 13px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.fillText("★ VICTORY ★", canvas.width / 2, bannerY + 54);

    ctx.restore();
}

let floatingTexts = [];
const MAX_FLOATING_TEXTS = 60;
function addFloatingText(x, y, text, color = '#fff', size = 14) {
    // Gộp chữ trùng lặp vừa xuất hiện gần đó (tránh chồng chữ khi bị trúng liên tục)
    for (let ft of floatingTexts) {
        if (ft.text === text && ft.life > ft.maxLife - 12 && Math.abs(ft.baseX - x) < 30 && Math.abs(ft.y - y) < 20) {
            ft.life = ft.maxLife;
            return;
        }
    }
    // Đẩy chữ mới lệch xuống nếu trùng vị trí với chữ khác vừa sinh ra
    let stackOffset = 0;
    for (let ft of floatingTexts) {
        if (ft.life > ft.maxLife - 10 && Math.abs(ft.baseX - x) < 40 && Math.abs(ft.y - (y + stackOffset)) < size) {
            stackOffset += size + 2;
        }
    }
    if (floatingTexts.length >= MAX_FLOATING_TEXTS) floatingTexts.shift();
    floatingTexts.push({
        baseX: x,
        x: x + (Math.random() - 0.5) * 12,
        y: y + Math.min(stackOffset, 48),
        y0: y + Math.min(stackOffset, 48),
        side: (typeof canvas !== 'undefined' && y < canvas.height / 2) ? 2 : 1, // nửa sân P2 (trên) hay P1 (dưới)
        text: text,
        color: color,
        size: size,
        vy: -1.2,
        life: 45,
        maxLife: 45
    });
}
function updateAndDrawFloatingTexts() {
    // Chữ luôn đọc xuôi theo góc nhìn người chơi:
    // - Khách online: cả sân bị xoay 180° -> xoay ngược mọi chữ.
    // - 2 người cùng máy: P2 ngồi đối diện -> chữ ở nửa sân P2 xoay 180° cho P2 đọc.
    const ftGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    const ftLocal2P = !(typeof onlineManager !== 'undefined' && onlineManager.isOnline) &&
        !(typeof botAI !== 'undefined' && botAI.enabled);
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.vy *= 0.97;
        ft.life--;
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        let alpha = Math.min(1, ft.life / 15);
        let age = ft.maxLife - ft.life;
        let pop = age < 6 ? 0.6 + (age / 6) * 0.55 : (age < 10 ? 1.15 - ((age - 6) / 4) * 0.15 : 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = "bold " + ft.size + "px 'Orbitron', Arial, sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Giữ chữ nằm trong sân đấu (không tràn ra mép trái/phải/trên/dưới)
        let halfW = (ctx.measureText(ft.text).width * pop) / 2 + 4;
        let drawX = Math.max(halfW, Math.min(canvas.width - halfW, ft.x));
        const flipT = ftGuest || (ftLocal2P && ft.side === 2);
        // Chữ bị xoay thì trôi "lên" theo hướng của người đọc (xuống trên màn hình gốc)
        let fy = (flipT && typeof ft.y0 === 'number') ? ft.y0 + (ft.y0 - ft.y) : ft.y;
        let drawY = Math.max(ft.size, Math.min(canvas.height - ft.size, fy));
        ctx.translate(drawX, drawY);
        ctx.scale(pop, pop);
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(5, 8, 18, 0.85)';
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ft.color;
        if (flipT) ctx.rotate(Math.PI);
        ctx.strokeText(ft.text, 0, 0);
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();
    }
}

let particles = [];
const MAX_PARTICLES = 500;
function spawnSparkParticles(x, y, color = '#ffd700', count = 8) {
    for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        let angle = Math.random() * Math.PI * 2;
        let speed = 1 + Math.random() * 4;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            r: 2 + Math.random() * 2,
            life: 20 + Math.random() * 15,
            maxLife: 35
        });
    }
}
function updateAndDrawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        let px = p.x, py = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        let k = p.life / p.maxLife;
        ctx.globalAlpha = k;
        // Vệt sáng theo hướng bay + lõi tròn
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r * k * 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px - p.vx * 2, py - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r * k), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
