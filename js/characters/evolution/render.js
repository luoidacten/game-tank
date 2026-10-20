// ==========================================
// evolution (evolution) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] evolution
    drawUIForEvolution() {
        if (this.weapon !== 'evolution' || typeof hudExtraChips !== 'function') return;
        // Chỉ số tiến hoá vĩnh viễn: chip [tim +HP] [kiếm +ST] trước mũi xe (không chữ dài)
        const b = this.evolutionPermanentBonus || { hp: 0, dmg: 0, speed: 0 };
        const chips = [];
        if (b.hp > 0) chips.push({ g: 'heart', c: '#2ecc71', l: '+' + (Math.round(b.hp * 10) / 10) });
        if (b.dmg > 0) chips.push({ g: 'sword', c: '#facc15', l: '+' + (Math.round(b.dmg * 100) / 100) });
        hudExtraChips(this, 0, chips, { d: hudNearD(this, 4, 11) });
    }
});
