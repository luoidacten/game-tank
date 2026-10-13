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
    }

    hasUpgrade(id) { return this.upgrades.includes(id); }
    addUpgrade(moduleId) {
        this.upgrades.push(moduleId);
        return true;
    }
}
