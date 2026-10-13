// ==========================================
// Cơ Bản (basic) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Cơ Bản
    setupBasic() {
        if (this.weapon === 'basic') {
            // 1. Luôn cộng chỉ số cứng của Evo 1 trước (nếu có)
            if (this.hasUpgrade('evo_basic_1')) {
                this.maxHp += 2;
                this.damage *= 1.25;
            }

            // 2. Nếu có đủ 2 Evo -> Nhân sức mạnh theo Round (scale late game)
            if (this.hasUpgrade('evo_basic_1') && this.hasUpgrade('evo_basic_2')) {
                let multiplier = Math.pow(1.25, gameState.round - 1);
                this.maxHp = Math.ceil(this.maxHp * multiplier);
                this.damage *= multiplier;

                // [FIX LỖI CRASH]: Kiểm tra xem UI có tồn tại không rồi mới đổi màu
                let statsUI = document.getElementById(`p${this.id}-stats`);
                if (statsUI) {
                    statsUI.style.color = "gold";
                }
            }
        } else {
            // Các vũ khí khác có Evo 1 tăng chỉ số (nếu có logic chung thì để đây)
            // Lưu ý: Đoạn code cũ của bạn có dòng `if (this.hasUpgrade('evo_basic_1'))` nằm trôi nổi
            // Nếu ý bạn là Evo Basic 1 tác dụng lên TẤT CẢ vũ khí thì giữ lại, 
            // còn nếu chỉ tác dụng lên xe Basic thì logic if/else ở trên là đúng.
            // Giả sử Evo Basic 1 chỉ cho xe Basic, ta bỏ dòng trôi nổi đi.
        }
    }
});
