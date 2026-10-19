// ==========================================
// Tiểu Liên (smg) — Logic (cập nhật, bắn, kỹ năng)
// ------------------------------------------
// Băng đạn (giống Sniper / Cao Bồi): sấy hết băng -> nạp nguyên băng (vòng nạp quanh xe).
// Không bắn 2.5s mà băng còn thiếu -> tự thay băng.
//  - Gốc: băng 18, nạp 1.8s | Evo 1: sấy càng lâu càng mạnh, băng 22
//  - Evo 2: băng 30, nạp 1.2s | Full Evo: nạp 0.8s, 6 viên đầu mỗi băng xuyên thấu
// ==========================================

function smgReloadTicks(p) {
    const e2 = p.hasUpgrade('evo_smg_2');
    if (e2 && p.hasUpgrade('evo_smg_1')) return 48;
    return e2 ? 72 : 108;
}
function smgStartReload(p) {
    if (p.smgReloading || p.ammo >= p.maxAmmo) return;
    p.smgReloading = true;
    p.smgReloadT = p.smgReloadMax = smgReloadTicks(p);
    p.smgSprayCount = 0;
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playClick) soundSystem.playClick();
}

CharHooks.register('smg', {
    setup() { this.smgReloading = false; this.smgReloadT = 0; this.smgReloadMax = 0; this.smgMagShots = 0; },
    draw() { if (this.smgReloading) drawReloadRing(this, 1 - this.smgReloadT / Math.max(1, this.smgReloadMax), '#ffb020'); },
});

Object.assign(Player.prototype, {
    // [update] Tiểu Liên — đếm nạp băng
    updateSmg(now) {
        if (this.weapon !== 'smg') return;
        if (this.smgReloading) {
            if (--this.smgReloadT <= 0) {
                this.smgReloading = false;
                this.ammo = this.maxAmmo;
                this.smgMagShots = 0;
                addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -12 : this.h + 16), "NẠP XONG", "#7CFC00", 11);
            }
        } else if (this.ammo <= 0 || (this.ammo < this.maxAmmo && now - this.lastShot > 2500)) {
            smgStartReload(this);
        }
    },

    // [handleShooting] Tiểu Liên — trả về true nếu cần dừng handleShooting()
    shootSmg(inp, now) {
        if (this.weapon === 'smg') {
            if (inp.s && !this.smgReloading) {
                let currentCooldown = 100; // Mặc định 100ms
                // Evo 1: Sấy càng lâu bắn càng nhanh (Ramp-up), tối đa 50ms
                if (this.hasUpgrade('evo_smg_1') && this.smgSprayCount > 3) {
                    currentCooldown = Math.max(50, 100 - (this.smgSprayCount - 3) * 5);
                }
                if (this.ammo > 0 && now - this.lastShot > currentCooldown) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                    this.smgSprayCount++;
                    this.smgMagShots = (this.smgMagShots || 0) + 1;
                    // Full Evo: 6 viên đầu mỗi băng xuyên thấu
                    if (this.smgMagShots <= 6 && this.hasUpgrade('evo_smg_1') && this.hasUpgrade('evo_smg_2')) {
                        const b = this.bullets[this.bullets.length - 1];
                        if (b) b.isPiercing = true;
                    }
                }
            } else if (!inp.s) {
                this.smgSprayCount = 0;
            }
            return true;
        }
    }
});
