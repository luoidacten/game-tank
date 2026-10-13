// ==========================================
// Vật thể bản đồ: chướng ngại, hòm, xe tiền, tường thành, pháo kích
// ==========================================



class MovingObstacle {
    constructor() {
        this.w = 60; this.h = 20;
        this.y = (canvas.height / 2) - (this.h / 2);
        if (Math.random() > 0.5) { this.x = -this.w; this.vx = 2 + Math.random(); }
        else { this.x = canvas.width; this.vx = -(2 + Math.random()); }
        this.spawnTime = Date.now();
        this.lifeTime = 8000;
        this.active = true;
        this.opacity = 1;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx;
        if (this.x <= 0 || this.x + this.w >= canvas.width) this.vx *= -1;
        const age = Date.now() - this.spawnTime;
        if (age > this.lifeTime) this.active = false;
        else if (age > this.lifeTime - 1000) this.opacity = 1 - (age - (this.lifeTime - 1000)) / 1000;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#2c3e50"; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

class Crate {
    constructor() {
        this.id = 'c_' + Math.random().toString(36).substr(2, 9);
        this.w = 22; this.h = 22;
        this.x = 40 + Math.random() * (canvas.width - 80);
        this.y = 80 + Math.random() * (canvas.height - 160);
        this.active = true;
        this.spawnTime = Date.now();
        this.lifeTime = 10000;
        this.isMimic = (Math.random() < 0.2);

        let hasInventor = (typeof p1 !== 'undefined' && p1 && (p1.weapon === 'inventor' || p1.weapon === 'genius')) || (typeof p2 !== 'undefined' && p2 && (p2.weapon === 'inventor' || p2.weapon === 'genius'));
        let hasEvo1 = (typeof p1 !== 'undefined' && p1 && ((p1.weapon === 'inventor' && p1.hasUpgrade('evo_inv_1')) || (p1.weapon === 'genius' && p1.hasUpgrade('evo_gen_1')))) || (typeof p2 !== 'undefined' && p2 && ((p2.weapon === 'inventor' && p2.hasUpgrade('evo_inv_1')) || (p2.weapon === 'genius' && p2.hasUpgrade('evo_gen_1'))));

        let rand = Math.random();
        if (hasEvo1) {
            if (rand < 0.20) this.type = 'coin';
            else if (rand < 0.35) this.type = 'hp';
            else if (rand < 0.45) this.type = 'ammo';
            else if (rand < 0.55) this.type = 'shield';
            else if (rand < 0.65) this.type = 'dmg';
            else if (rand < 0.85) this.type = 'gear';
            else this.type = 'boom';
        } else if (hasInventor) {
            if (rand < 0.20) this.type = 'coin';
            else if (rand < 0.38) this.type = 'hp';
            else if (rand < 0.50) this.type = 'ammo';
            else if (rand < 0.62) this.type = 'shield';
            else if (rand < 0.72) this.type = 'dmg';
            else if (rand < 0.86) this.type = 'gear';
            else this.type = 'boom';
        } else {
            if (rand < 0.25) this.type = 'coin';
            else if (rand < 0.45) this.type = 'hp';
            else if (rand < 0.60) this.type = 'ammo';
            else if (rand < 0.75) this.type = 'shield';
            else if (rand < 0.85) this.type = 'dmg';
            else this.type = 'boom';
        }
    }
    update() {
        if (!this.active) return;
        if (Date.now() - this.spawnTime > this.lifeTime) this.active = false;
    }
    draw() {
        if (!this.active) return;
        if (this.type === 'coin') ctx.fillStyle = '#f1c40f';
        else if (this.type === 'hp') ctx.fillStyle = '#2ecc71';
        else if (this.type === 'ammo') ctx.fillStyle = '#e67e22';
        else if (this.type === 'shield') ctx.fillStyle = '#3498db';
        else if (this.type === 'dmg') ctx.fillStyle = '#9b59b6';
        else if (this.type === 'boom') ctx.fillStyle = '#c0392b';
        else if (this.type === 'gear') ctx.fillStyle = '#00ffcc';

        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';

        let txt = '$';
        if (this.type === 'hp') txt = '+';
        else if (this.type === 'ammo') txt = 'A';
        else if (this.type === 'shield') txt = 'S';
        else if (this.type === 'dmg') txt = 'D';
        else if (this.type === 'boom') txt = '!';
        else if (this.type === 'gear') txt = 'G';

        const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
        if (isGuestView) {
            ctx.save();
            ctx.translate(this.x + 11, this.y + 11);
            ctx.rotate(Math.PI);
            ctx.fillText(txt, 0, 4);
            ctx.restore();
        } else {
            ctx.fillText(txt, this.x + 11, this.y + 16);
        }

        let lifePct = 1 - (Date.now() - this.spawnTime) / this.lifeTime;
        ctx.fillStyle = 'white'; ctx.fillRect(this.x, this.y + 22, this.w * lifePct, 2);
    }
}

function triggerMimicExplosion(crate, destroyer) {
    let count = (destroyer && destroyer.hasUpgrade && destroyer.hasUpgrade('evo_evo_2')) ? 16 : 8;
    let baseDmg = (destroyer && destroyer.hasUpgrade && destroyer.hasUpgrade('evo_evo_2')) ? (destroyer.damage || 1) : 0.5;
    let step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
        let angle = i * step + (Math.random() - 0.5) * 0.15;
        let spd = 4.5 + Math.random();
        let targetOwner = (destroyer && destroyer.bullets) ? destroyer : ((destroyer && destroyer.id === 1) ? p1 : p2);
        if (targetOwner && targetOwner.bullets) {
            targetOwner.bullets.push({
                x: crate.x + crate.w / 2,
                y: crate.y + crate.h / 2,
                w: 5, h: 5,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                dmg: baseDmg,
                owner: targetOwner,
                isShrapnel: true,
                hitIds: []
            });
        }
    }
    explosions.push(new Explosion(crate.x + crate.w / 2, crate.y + crate.h / 2, 45, 'rgba(231, 76, 60,', 1, null));
    if (destroyer && destroyer.weapon === 'evolution') {
        destroyer.onEvolutionCrateEat('mimic');
    }
}

class MoneyTruck {
    constructor() {
        this.id = 'mt_' + Math.random().toString(36).substr(2, 9);
        this.w = 45; this.h = 28;
        this.hp = 6;
        this.y = 100 + Math.random() * (canvas.height - 200);
        this.dir = Math.random() > 0.5 ? 1 : -1;
        this.x = this.dir === 1 ? -60 : canvas.width + 10;
        this.speed = 1.25;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.speed * this.dir;
        if ((this.dir === 1 && this.x > canvas.width) || (this.dir === -1 && this.x < -70)) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
        const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
        if (isGuestView) {
            ctx.save();
            ctx.translate(this.x + 22, this.y + 14);
            ctx.rotate(Math.PI);
            ctx.fillText("$$$", 0, 4);
            ctx.fillText(`HP:${Math.ceil(this.hp)}`, 0, -9);
            ctx.restore();
        } else {
            ctx.fillText(`HP:${Math.ceil(this.hp)}`, this.x + 22, this.y - 5);
            ctx.fillText("$$$", this.x + 22, this.y + 18);
        }
    }
}

class BastionWall {
    constructor(y, hp = 60, vx = 2) {
        this.w = 90;
        this.h = 16;
        this.x = 40 + Math.random() * (canvas.width - 170);
        this.y = y;
        this.vx = vx;
        this.hp = hp;
        this.maxHp = hp;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx;
        if (this.x <= 10 || this.x + this.w >= canvas.width - 10) {
            this.vx *= -1;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#1abc9c";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // HP bar
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 4);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(this.x, this.y - 6, this.w * (this.hp / this.maxHp), 4);

        ctx.fillStyle = "white";
        ctx.font = "bold 9px 'Orbitron', Arial";
        ctx.textAlign = "center";
        ctx.fillText("BASTION", this.x + this.w / 2, this.y + 12);
        ctx.restore();
    }
}

class ArtilleryHazard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.maxR = 60;
        this.spawnTime = Date.now();
        this.detonateTime = 2500;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        if (age >= this.detonateTime) {
            this.explode();
        }
    }
    explode() {
        this.active = false;
        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(231, 76, 60,', 2.0, null, true));
        [p1, p2].forEach(p => {
            if (p && p.hp > 0 && Math.hypot((p.x + p.w / 2) - this.x, (p.y + p.h / 2) - this.y) <= this.maxR) {
                p.takeDamage(2.0, null);
            }
        });
    }
    draw() {
        if (!this.active) return;
        let progress = Math.min(1, (Date.now() - this.spawnTime) / this.detonateTime);
        ctx.save();
        ctx.strokeStyle = `rgba(231, 76, 60, ${0.4 + progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(231, 76, 60, ${0.15 + progress * 0.35})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxR * progress, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "bold 10px 'Orbitron', Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠ PHÁO KÍCH", this.x, this.y - this.maxR - 4);
        ctx.restore();
    }
}
