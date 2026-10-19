// ==========================================
// Tùy Biến (customize) — Hình ảnh: đạn theo mô-đun, vòng tụ lực, vòng Tập Trung, đèn mô-đun trên xe
// ==========================================

const CU_TRAIT_COLOR = { explosive: '#f97316', piercing: '#a855f7', hitscan: '#ef4444', homing: '#22d3ee', sticky: '#eab308', bounce: '#84cc16', crit: '#facc15', leech: '#f43f5e', twin: '#e2e8f0' };
function cuTraitColor(t) { return CU_TRAIT_COLOR[t] || (typeof ZONE_STYLE !== 'undefined' && ZONE_STYLE[t.slice(3)] ? ZONE_STYLE[t.slice(3)][1] : '#fff'); }

function cuDrawBullet(b) {
    const col = b.owner && b.owner.id === 1 ? '#38bdf8' : '#fb7185';
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    ctx.save();
    ctx.shadowBlur = b.cuCrit ? 16 : 8; ctx.shadowColor = b.cuCrit ? '#facc15' : col;
    if (b.cuKind === 'sword') drawGlowingSword(b.x, b.y, b.w, b.h, col, b.swordDir || -1);
    else if (b.cuKind === 'laser') { ctx.fillStyle = col; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 0.75, b.y + 2, 1.5, b.h - 4); }
    else if (b.cuKind === 'cannon') { ctx.fillStyle = '#1f2937'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, b.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else if (b.cuKind === 'split') {
        // Hình thoi tím (đạn mẹ to hơn, xoay)
        const r = b.w / 2 + 1, a = (b.x + b.y) * 0.08;
        ctx.fillStyle = b.cuSplit ? '#e879f9' : col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) { const t = a + k * Math.PI / 2; ctx.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r); }
        ctx.closePath(); ctx.fill(); if (b.cuSplit) ctx.stroke();
    }
    else { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, b.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(cx, cy, b.w / 5, 0, Math.PI * 2); ctx.fill(); }
    if (b.cuCrit) { ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, Math.max(b.w, b.h) / 2 + 3, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
}

Object.assign(CharHooks.registry.customize, {
    draw() {
        const d = this.cuData;
        if (!d || !d.traits) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        // Vòng tụ lực
        if (d.fire === 'charge' && this.cuCharge > 0) {
            const full = 90 - 15 * ((d.lv && d.lv.fire) || 0);
            const done = this.cuCharge >= full;
            ctx.strokeStyle = done ? '#fde047' : '#fbbf24'; ctx.lineWidth = done ? 3.5 : 2.5;
            ctx.shadowBlur = done ? 12 : 0; ctx.shadowColor = '#fde047';
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, this.cuCharge / full)); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Tập Trung Tuyệt Đối
        if (this.cuFocus > 0) {
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.0, 0, Math.PI * 2); ctx.stroke();
        }
        // Đèn mô-đun trên thân xe: mỗi tính chất 1 đèn, sáng theo cấp
        // Có art xe mới (core_small.js) thì mô-đun đã vẽ thành khối màu trên thân -> bỏ đèn cũ
        const ts = (typeof TANK_ART !== 'undefined' && TANK_ART.customize) ? [] : Object.keys(d.traits).slice(0, 7);
        const y = this.id === 1 ? this.y + this.h - 5 : this.y + 2;
        ts.forEach((t, i) => {
            ctx.fillStyle = cuTraitColor(t);
            ctx.shadowBlur = 4 + 2 * d.traits[t]; ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(this.x + 3 + i * 4, y, 3, 3);
        });
        ctx.restore();
    },
});
