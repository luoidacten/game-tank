// ==========================================
// genius (genius) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

// Màu & tên 5 chế độ Mecha (ô chế độ trên sân + nút Bắn)
const GENIUS_MODE_COLORS = ['#ffd54f', '#ff7043', '#4fc3f7', '#ef5350', '#67e8f9'];
const GENIUS_MODE_INFO = [['BẮN', '🔫'], ['PHÁO', '💣'], ['SMG', '⚡'], ['ĐẤM', '👊'], ['KHIÊN', '🛡']];
function geniusRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('genius', p => {
        if (p.isPilotingMecha) {
            const m = (p.mechaMode || 1) - 1, inf = GENIUS_MODE_INFO[m] || ['M' + (m + 1), '🤖'];
            const en = Math.max(0, Math.min(1, (p.mechaEnergy || 0) / (p.mechaMaxEnergy || 1)));
            return { pct: en, ready: false, idle: true, label: inf[0], btnIcon: inf[1], color: GENIUS_MODE_COLORS[m] || '#ffd54f' };
        }
        if (p.mechaSummonHold > 0) return { pct: Math.min(1, p.mechaSummonHold / 40), ready: p.mechaSummonHold >= 40, label: 'MECHA', color: '#ff9800', icon: 'robot' };
        return null;
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', geniusRegisterHUD);

Object.assign(Player.prototype, {
    // [drawUI] genius
    drawUIForGenius(uiY, subUiY) {
        if (this.weapon !== 'genius' || typeof hudExtraBar !== 'function') return;
        // Biểu tượng thay chữ: thanh mảnh ở hàng phụ sau HUD chung; chip/ô chế độ trước mũi xe (chế độ Mecha cũng hiện trên nút Bắn)
        if (!this.isPilotingMecha) {
            // Bánh Răng / Linh Kiện: chip [biểu tượng + số]
            hudExtraChips(this, 0, [
                { g: 'gear', c: '#ffb74d', l: String(this.gears || 0) },
                { g: 'nut', c: '#00ffcc', l: String(this.components || 0) },
            ], { d: hudNearD(this, 4, 11) });
            // Giữ nút triệu hồi: vòng nạp cạnh xe (empower HUD) + thanh mảnh
            if (this.mechaSummonHold > 0) hudExtraBar(this, 0, Math.min(1, this.mechaSummonHold / 40), '#ff9800', { h: 2.5 });
        } else {
            const mHp = Math.max(0, Math.min(1, (this.mechaHp || 0) / (this.mechaMaxHp || 1)));
            const mEn = Math.max(0, Math.min(1, (this.mechaEnergy || 0) / (this.mechaMaxEnergy || 1)));
            hudExtraBar(this, 0, mHp, '#ff9800', { h: 2.5 });     // máu Mecha
            hudExtraBar(this, 0.7, mEn, '#00e5ff', { h: 1.5 });   // năng lượng
            // 5 chế độ: ô sáng = chế độ hiện tại; giáp ảo = khiên nhỏ bên phải
            const m = (this.mechaMode || 1) - 1;
            const dP = hudNearD(this, 4, 3);
            hudExtraPips(this, 0, 5, 0, GENIUS_MODE_COLORS[m] || '#ffd54f', { active: m, pw: 7, h: 3, d: dP });
            if (this.mechaVirtualArmor > 0) {
                const F = hudFrame(this);
                const n = Math.min(4, Math.ceil(this.mechaVirtualArmor));
                ctx.save();
                ctx.fillStyle = '#67e8f9'; ctx.shadowBlur = 5; ctx.shadowColor = '#00ffff';
                for (let i = 0; i < n; i++) hudGlyphAt('guard', F.X(26 + i * 8), F.Y(dP + 1.5), F);
                ctx.restore();
            }
            // Giữ để tự bạo: thanh đỏ nhấp nháy trước ô chế độ
            if (this.mechaSelfDestructHold > 0) {
                const k = Math.min(1, this.mechaSelfDestructHold / 180);
                hudExtraBar(this, 0, k, Math.floor(Date.now() / 120) % 2 ? '#f44336' : '#ffcdd2', { h: 2.5, d: hudNearD(this, 10, 2.5) });
            }
        }
    }
});
