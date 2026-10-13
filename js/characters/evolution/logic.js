// ==========================================
// evolution (evolution) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    onEvolutionCrateEat(type) {
        if (this.weapon !== 'evolution') return;
        this.evolutionPermanentBonus = this.evolutionPermanentBonus || { hp: 0, dmg: 0, ammo: 0, speed: 0, ammoCrates: 0 };
        let mult = this.hasUpgrade('evo_evo_1') ? 1.3 : 1.0;

        if (type === 'hp') {
            let gain = 0.5 * mult;
            this.evolutionPermanentBonus.hp += gain;
            this.maxHp += gain;
            this.hp = Math.min(this.maxHp, this.hp + gain);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain.toFixed(2)} HP! 🧬`, "#2ecc71", 12);
        } else if (type === 'dmg') {
            let gain = 0.125 * mult;
            this.evolutionPermanentBonus.dmg += gain;
            this.damage += gain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain.toFixed(3)} DMG! 🧬`, "#9b59b6", 12);
        } else if (type === 'ammo') {
            this.evolutionPermanentBonus.ammoCrates = (this.evolutionPermanentBonus.ammoCrates || 0) + 1;
            if (this.evolutionPermanentBonus.ammoCrates >= 3) {
                this.evolutionPermanentBonus.ammoCrates -= 3;
                let gain = Math.round(2 * mult);
                this.evolutionPermanentBonus.ammo += gain;
                this.maxAmmo += gain;
                this.ammo += gain;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain} ĐẠN! 🧬`, "#e67e22", 13);
            } else {
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: ĐẠN (${this.evolutionPermanentBonus.ammoCrates}/3) 🧬`, "#e67e22", 11);
            }
        } else if (type === 'boom') {
            let hpGain = 1.0 * mult;
            let dmgGain = 0.25 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.hp = Math.min(this.maxHp, this.hp + hpGain);
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA NỔ: +${hpGain.toFixed(1)} HP & +${dmgGain.toFixed(2)} DMG! 🧬`, "#e74c3c", 13);
        } else if (type === 'shield') {
            let hpGain = 0.25 * mult;
            let ammoGain = Math.round(1 * mult);
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.evolutionPermanentBonus.ammo += ammoGain;
            this.maxAmmo += ammoGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA KHIÊN: +${hpGain.toFixed(2)} HP & +${ammoGain} ĐẠN! 🧬`, "#3498db", 12);
        } else if (type === 'coin') {
            let hpGain = 0.25 * mult;
            let dmgGain = 0.05 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            let coinBonus = 15;
            if (this.id === 1) gameState.p1Coins += coinBonus; else gameState.p2Coins += coinBonus;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +$15, +${hpGain.toFixed(2)} HP & +${dmgGain.toFixed(2)} DMG! 🧬`, "#f1c40f", 12);
        } else if (type === 'truck') {
            let hpGain = 1.0 * mult;
            let dmgGain = 0.5 * mult;
            let spdGain = 0.05 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.hp = Math.min(this.maxHp, this.hp + hpGain);
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            this.evolutionPermanentBonus.speed += spdGain;
            this.speed += spdGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, `SCAVENGER DIỆT XE TIỀN: +${hpGain.toFixed(1)} HP, +${dmgGain.toFixed(2)} DMG, +${spdGain.toFixed(2)} SPEED! 🧬⚡`, "gold", 13);
        } else if (type === 'mimic') {
            let spdGain = 0.05 * mult;
            this.evolutionPermanentBonus.speed += spdGain;
            this.speed += spdGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `MIMIC TIẾN HÓA: +${spdGain.toFixed(2)} SPEED! 🧬`, "#00ffcc", 12);
        }
    },

    // [setupForNewRound] evolution
    setupEvolution() {
        if (this.weapon === 'evolution') {
            this.evolutionPermanentBonus = this.evolutionPermanentBonus || { hp: 0, dmg: 0, ammo: 0, speed: 0, ammoCrates: 0 };
            if (this.hasUpgrade('evo_evo_1') && this.hasUpgrade('evo_evo_2')) {
                this.evolutionPermanentBonus.hp += 1.5;
                this.evolutionPermanentBonus.dmg += 0.5;
                this.evolutionPermanentBonus.ammo += 2;
                this.evolutionPermanentBonus.speed += 0.1;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, "TIẾN HÓA TỘT CÙNG! 🧬✨", "gold", 14);
            }

            this.maxHp += this.evolutionPermanentBonus.hp;
            this.hp = this.maxHp;
            this.damage += this.evolutionPermanentBonus.dmg;
            this.maxAmmo += this.evolutionPermanentBonus.ammo;
            this.ammo = this.maxAmmo;
            this.speed += this.evolutionPermanentBonus.speed;
        }
    }
});
