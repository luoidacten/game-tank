// ==========================================
// Ghost (ghost) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Ghost
    setupGhost() {
        if (this.weapon === 'ghost') {
            this.speed += 2;
            this.ghostTimer = 0;
            this.isGhostActive = false;
            this.ghostActiveTimer = 0;
            this.ghostDuration = 120; // 2s hiệu lực
            this.ghostCooldown = 180; // 3s hồi chiêu

            if (this.hasUpgrade('evo_ghost_1')) {
                this.ghostDuration = 120;
                this.ghostCooldown = 120; // 2s hồi
            }
            if (hasFullEvo(this, 'ghost')) {
                this.ghostDuration = 120;
                this.ghostCooldown = 90; // 1.5s hồi
            }
            this.phantomTimer = 0;
            this.hasPhantom = this.hasUpgrade('evo_ghost_2');
            this.posHistory = [];
        }
    },

    // [update] Ghost
    updateGhost() {
        if (this.weapon === 'ghost') {

            if (this.isGhostActive) {
                // 1. ĐANG TRONG TRẠNG THÁI VÔ ẢNH
                // Chỉ giảm thời gian hiệu lực, KHÔNG tăng thời gian hồi chiêu
                this.ghostActiveTimer--;

                // Hiệu ứng visual (con trỏ chuột debug nếu là P1)
                if (this.id === 1) document.getElementById('gameCanvas').style.cursor = 'wait';
                if (this.ghostActiveTimer <= 0 && this.id === 1) document.getElementById('gameCanvas').style.cursor = 'default';

                // Hết thời gian Vô Ảnh
                if (this.ghostActiveTimer <= 0) {
                    this.isGhostActive = false;
                    this.ghostTimer = 0; // RESET hồi chiêu về 0 để bắt đầu đếm lại
                }

            } else {
                // 2. ĐANG TRONG TRẠNG THÁI HỒI CHIÊU (Bình thường)
                this.ghostTimer++;

                // Kiểm tra nếu đã hồi xong
                if (this.ghostTimer >= this.ghostCooldown) {
                    this.isGhostActive = true;
                    this.ghostActiveTimer = this.ghostDuration; // Nạp đầy thời gian hiệu lực
                    // Fix Evo 2 (Ảo Ảnh): Tự động sinh Tàn Ảnh (Decoy) ngay tại vị trí vừa kích hoạt!
                    if (this.hasUpgrade('evo_ghost_2')) {
                        ghostDecoys.push(new GhostDecoy(this.x, this.y, this.w, this.h, this));
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "TÀN ẢNH XUẤT HIỆN! 👻", "#bdc3c7", 13);
                    }
                }
            }

            // Logic Tàn Ảnh liên tục (Evo 2)
            if (this.hasUpgrade('evo_ghost_2')) {
                this.posHistory.push({ x: this.x, y: this.y });
                if (this.posHistory.length > 20) this.posHistory.shift();

                this.phantomTimer = (this.phantomTimer || 0) + 1;
                // Cứ mỗi 90 frame (1.5s) tạo 1 tàn ảnh đánh lừa
                if (this.phantomTimer >= 90) {
                    this.phantomTimer = 0;
                    ghostDecoys.push(new GhostDecoy(this.x, this.y, this.w, this.h, this));
                }
            }
        }
    },

    // [update] Ghost — trả về currentSpeed mới
    updateGhost2(currentSpeed) {
        if (this.weapon === 'ghost' && this.isGhostActive) {
            currentSpeed *= 1.25; // +25% tốc độ lướt khi tàng hình
        }
        return currentSpeed;
    }
});
