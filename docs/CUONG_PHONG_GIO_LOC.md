# CẬP NHẬT LOGIC: CUỒNG PHONG (`storm` — Thêm mới Gió Lốc)
(Người dùng gửi. Các đặc điểm cũ giữ nguyên.)

- Lúc xe rung lắc là xe đang chém: vẽ một đường quét kiếm giống radar theo chiều kim đồng hồ (lúc này cũng hiện vùng cảnh báo).
- Chỉ số gốc: HP 3.5 | Dame 2.0 | Năng lượng: Tụ lực (3.5s đầy 100%) | Tốc độ 5.0 | Size 30×30

## 1. Nút Bắn & "Gió Lốc" (cuối đường lao)
- Giữ: tích chargePct 0→100% trong 3.5s (Full Evo 2.5s).
- Nhả: lưu (originX, originY), lao dọc lên làn địch (trên đường lao xoay tròn Phản Đạn thường của địch).
- Chạm điểm cuối đường lao:
  - chargePct < 50%: chém 1 nhát cơ bản rồi lướt về (originX, originY).
  - 50% ≤ chargePct < 100% (Gió Lốc 2.0s): xe ẩn, Bất Tử & Untargetable 2s (như Đại Tiệc Máu của blood_lord). Lốc bán kính 75px, 0.25x dame mỗi 0.4s, hút nhẹ theo trục X về tâm, Làm Chậm 25%. Hết 2s: 1 nhát chém cắt đôi cơn lốc 1.2x (2.4 dame), hết bất tử, lướt giật về vị trí cũ.
  - chargePct == 100% (Lôi Bão 4.0s): ẩn, Bất Tử & Untargetable 4s. Lốc 105px, hút mạnh hơn, Làm Chậm 35%, 0.3x dame mỗi 0.4s. Mỗi 0.8s 1 tia sét ngẫu nhiên trong lốc (chớp báo trước 0.25s): trúng +0.5 dame & Choáng 0.75s. Hết 4s: nhát chém cực mạnh chẻ đôi 1.8x (3.6 dame) (Evo 2 + đang có Khiên: chém bồi nhát 2 +50%). Lướt về vị trí cũ.

## 2. Phân Thân Lốc Xoáy (evo_storm_2 — Phong Ảnh Trảm)
- Mỗi 3–8s (Full Evo 3–5s) triệu hồi 1 Phân Thân lao thẳng lên chém.
- Khi Phân Thân kết thúc đường lao / biến mất: tạo Cơn Lốc Nhỏ 1.0s tại điểm cuối (làn địch), bán kính 55px, 0.3 dame, Làm Chậm 25% trong 1.0s.
