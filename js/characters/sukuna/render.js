// ==========================================
// sukuna (sukuna) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] sukuna
    drawSukuna() {
        if (this.weapon === 'sukuna') {
            let currentInp = this.id === 1 ? inputs.p1 : inputs.p2;

            // 1. VẼ HIỆU ỨNG LÃNH ĐỊA / HỒI MÁU (Vẽ TRƯỚC để chìm xuống dưới, không che UI)
            if (currentInp.s && this.sukunaChargeTimer > 0) {
                ctx.save();
                let chargeSec = this.sukunaChargeTimer / 60;

                if (this.domainActive) {
                    // --- BẾP BÀNH TRƯỚNG: HÌNH BÁN NGUYỆT ---
                    let radius = 350; // Tầm xa của lãnh địa (có thể chỉnh to/nhỏ tùy ý)
                    let centerX = this.x + this.w / 2;
                    let centerY = this.y + this.h / 2; // Lấy tâm xe làm gốc

                    ctx.beginPath();
                    if (this.id === 1) {
                        // Player 1 (Ở dưới): Bán nguyệt hướng LÊN TRÊN (từ 180 độ đến 0 độ)
                        ctx.arc(centerX, centerY, radius, Math.PI, 0);
                    } else {
                        // Player 2 (Ở trên): Bán nguyệt hướng XUỐNG DƯỚI (từ 0 độ đến 180 độ)
                        ctx.arc(centerX, centerY, radius, 0, Math.PI);
                    }

                    // Đổ màu Lãnh Địa (Đỏ sẫm mờ)
                    ctx.fillStyle = 'rgba(150, 0, 0, 0.15)';
                    ctx.fill();

                    // Vẽ viền ngoài cho sắc nét
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Vòng tròn chém cắt nhỏ ngay sát bản thể
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 60 + Math.sin(Date.now() / 50) * 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
                else if (this.skFugaArmed) {
                    // Đang nạp Fuga: vòng lửa cam đầy dần tới 1.5s (đủ -> nhả để phóng)
                    const k = Math.min(1, chargeSec / 1.5);
                    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                    ctx.lineCap = 'round'; ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, 0, Math.PI * 2); ctx.stroke();
                    ctx.strokeStyle = k >= 1 ? '#ffd166' : '#ff6a00'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff6a00';
                    ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
                }
                else if (chargeSec >= 1.2) {
                    // Hiệu ứng Phản chuyển Hồi máu
                    ctx.strokeStyle = '#00ff66';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 2. VẼ THANH CHÚ LỰC (Vẽ SAU CÙNG để luôn nổi lên trên cùng, không bị mờ)
            let barW = this.w;
            let barH = 5;
            let barX = this.x;
            // Đặt vị trí thanh Chú lực ngay dưới gầm xe P1, hoặc trên đầu xe P2
            let barY = (this.id === 1) ? this.y + this.h + 12 : this.y - 18;

            ctx.save();
            // Nền xám
            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(barX, barY, barW, barH);

            // Năng lượng Đỏ/Tím
            let currentCeW = barW * (this.cursedEnergy / 100);
            ctx.fillStyle = this.cursedEnergy >= 99.5 ? '#ff3300' : '#aa00ff';
            ctx.fillRect(barX, barY, currentCeW, barH);

            // Chớp nháy trắng khi đầy 100%
            if (this.cursedEnergy >= 99.5 && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barW, barH);
            }
            ctx.restore();
        }
    }
});
