// ==========================================
// Class Player (lõi). Logic/hình ảnh riêng của từng nhân vật nằm ở js/characters/<id>/
// ==========================================



class Player {
    constructor(id, color) {
        this.id = id; this.color = color;
        this.upgrades = [];
        this.upgradeLevel = 0;
        this.kbX = 0;
        this.kbY = 0;
        this.kbFromRed = false;
        this.maxHp = 6;
        this.hp = 6;
        this.damage = 1;
        this.maxAmmo = 5;
        this.ammo = 5;
        this.shield = 0;
        this.bullets = [];
        this.trailHistory = [];
        this.equippedGears = [];
        this.gearTiers = [];
        this.gearPickedMilestones = [];
        this.gearFreeFeetUpgrades = [];
    }

    hasUpgrade(id) { return this.upgrades.includes(id); }
    addUpgrade(moduleId) {
        if (typeof feetMaxed === 'function' && feetMaxed(this, moduleId)) return false;
        this.upgrades.push(moduleId);
        return true;
    }

    hasGear(id) { return Array.isArray(this.equippedGears) && this.equippedGears.includes(id); }
    addGear(gearId) {
        if (!Array.isArray(this.equippedGears)) this.equippedGears = [];
        if (this.equippedGears.includes(gearId)) return false;
        this.equippedGears.push(gearId);
        if (typeof applyGearImmediateEffect === 'function') applyGearImmediateEffect(this, gearId);
        return true;
    }
}
