// ==========================================
// Kiếm Trận (van_kiem) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Kiếm Trận
    setupVanKiem() {
        if (this.weapon === 'van_kiem') {
            this.speed += 2;
            this.maxAmmo = 999; this.ammo = 999;
            this.swordChargeTimer = 0;
            this.isInSwordStance = false;
            this.totalSwordsFired = 0;
            this.stanceSwordsAccumulated = 0; // Lưu số kiếm gọi ra trong Kiếm Thế
            this.autoSwordTimer = 0; // Cho nội tại Mưa Kiếm
            this.swordShieldActive = false;
            this.swordShieldHits = 0;
        }
    },

    // [update] Kiếm Trận — trả về currentSpeed mới
    updateVanKiem(currentSpeed) {
        if (this.weapon === 'van_kiem' && this.isInSwordStance) {
            currentSpeed = this.hasUpgrade('evo_vk_2') ? 1.0 : 0; // Chậm lê lết hoặc bất động
        }
        return currentSpeed;
    },

    // [handleShooting] Kiếm Trận — trả về true nếu cần dừng handleShooting()
    shootVanKiem(inp) {
        if (this.weapon === 'van_kiem') {
            let hasEvo1 = this.hasUpgrade('evo_vk_1');
            let hasEvo2 = this.hasUpgrade('evo_vk_2');

            // NỘI TẠI MƯA KIẾM (Evo 1): Tự gọi kiếm sau lưng

            if (hasEvo1) {
                this.autoSwordTimer++;
                let spawnRate = Math.max(10, 60 - Math.floor(this.totalSwordsFired / 10) * 5);
                if (this.autoSwordTimer >= spawnRate) {
                    this.autoSwordTimer = 0;

                    let offsetX = (Math.random() - 0.5) * 100;
                    let swordX = this.x + this.w / 2 + offsetX;

                    // [FIX QUAN TRỌNG]: Khóa tọa độ X để kiếm không bao giờ sinh ra ngoài map (gây lỗi xóa đạn ngay lập tức)
                    if (swordX < 5) swordX = 5;
                    if (swordX > canvas.width - 15) swordX = canvas.width - 15;

                    // [FIX TỌA ĐỘ Y]: Nới rộng lề một chút để đạn không cạ vào tường
                    let offsetY = (this.id === 1) ? 35 : -35;
                    let spawnY = this.y + offsetY;
                    if (spawnY > canvas.height - 25) spawnY = canvas.height - 25;
                    if (spawnY < 5) spawnY = 5;

                    let dirY = (this.id === 1) ? -1 : 1;
                    floatingSwords.push(new FloatingSword(swordX, spawnY, 6, 20, 0, dirY * 12, 30, this.damage, false, false, this));

                    // [FIX LỖI TỐC ĐỘ]: Phải cộng dồn biến này để kiếm tự động gọi ra càng lúc càng nhanh đúng như mô tả
                    this.totalSwordsFired++;
                }
            }

            if (inp.s) {
                this.swordChargeTimer++;
                if (this.swordChargeTimer > 360) this.isInSwordStance = true;

                let callRate = this.isInSwordStance ? 5 : 15;
                if (this.swordChargeTimer % callRate === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;
                    let spawnCount = this.isInSwordStance ? (hasEvo2 ? 4 : 2) : 1;

                    for (let k = 0; k < spawnCount; k++) {
                        let offsetX = (Math.random() - 0.5) * (this.isInSwordStance ? 150 : 60);

                        // [FIX LỖI TỌA ĐỘ]:
                        let offsetY = (this.id === 1) ? (20 + Math.random() * 20) : (-20 - Math.random() * 20);
                        let spawnY = this.y + offsetY;
                        if (spawnY > canvas.height - 20) spawnY = canvas.height - 20;
                        if (spawnY < 0) spawnY = 0;

                        let spd = this.isInSwordStance ? 18 : 12;
                        let isPiercing = (this.isInSwordStance && hasEvo2);

                        floatingSwords.push(new FloatingSword(this.x + this.w / 2 - 3 + offsetX, spawnY, 6, 20, 0, dirY * spd, 30, this.damage, isPiercing, false, this));
                        this.stanceSwordsAccumulated++;
                        this.totalSwordsFired++;
                        if (hasEvo2 && this.totalSwordsFired % 50 === 0) this.damage++; // Mỗi 50 kiếm tăng 1 dame (Buff nhỏ)
                    }
                }
            } else {
                if (this.isInSwordStance && hasEvo2) {
                    let giantW = Math.min(60, 10 + this.stanceSwordsAccumulated);
                    let giantH = Math.min(150, 30 + this.stanceSwordsAccumulated * 2);
                    let dirY = (this.id === 1) ? -1 : 1;

                    // [FIX LỖI TỌA ĐỘ ĐẠI KIẾM]: Đảm bảo nó không nổ ngay khi spawn
                    let spawnY = this.y + ((this.id === 1) ? 20 : -20);
                    if (spawnY > canvas.height - giantH - 10) spawnY = canvas.height - giantH - 10;
                    if (spawnY < 10) spawnY = 10;

                    floatingSwords.push(new FloatingSword(this.x + this.w / 2 - giantW / 2, spawnY, giantW, giantH, 0, dirY * 20, 10, this.damage * 10, true, false, this, true));
                }
                this.swordChargeTimer = 0;
                this.isInSwordStance = false;
                this.stanceSwordsAccumulated = 0;
            }
            return true;
        }
    }
});
