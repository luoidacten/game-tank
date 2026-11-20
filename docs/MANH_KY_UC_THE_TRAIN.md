# Mảnh Ký Ức 1 — THE TRAIN (Đoàn Tàu)

> Bản thiết kế, **chưa code**. Chế độ đánh boss (chơi 1 mình hoặc co-op 2 người).
> Sân dọc giữ nguyên: P1 ở dưới bắn lên, P2 ở trên bắn xuống; đoàn tàu chạy ngang **giữa sân**.

## 1. Vòng chơi tổng

```
Phase 1 (The Train gốc, 50 máu)
  → Cửa hàng (tiền, Evo, G.E.A.R như thường)
  → CHỌN KÝ ỨC (1 trong 3 thẻ)
Phase 2.x (biến thể theo thẻ đã chọn)
  → Cửa hàng → CHỌN KÝ ỨC
Phase 3.x (biến thể)
  → THẮNG (Mảnh Ký Ức 1 hoàn thành)
  → Tuỳ chọn: THIÊU ĐỐT (chơi tiếp vô tận, boss tiến hóa mạnh dần, đi càng xa càng tốt)
```

**Thẻ Ký Ức** = 1 gói 3 phần, chọn 1 trong 3 thẻ:
1. **Buff cho bạn** (giữ tới hết lượt chơi).
2. **Dạng Phase tiếp theo** (biến thể 2.1 / 2.2 / 2.3 hoặc 3.1 / 3.2 / 3.3).
3. **Chỉ số buff cho boss** (máu, tốc bắn, giáp…).

Thẻ có buff cho bạn mạnh thì đi kèm biến thể khó hơn / buff boss nặng hơn → người chơi tự cân rủi ro.
Mỗi thẻ hiện rõ cả 3 phần, có hình biến thể và độ khó (★1–3).

## 2. Phase 1 — THE TRAIN

### Cách đoàn tàu vận hành
- Đoàn tàu **8 toa** chạy ngang trên đường ray giữa sân: Đầu Tàu, 2 Toa SMG, 2 Toa Pháo Kích, 1 Toa Pháo Lazer, 2 Toa Gọi Quân.
- Chu kỳ: tàu chạy vào → **dừng lại với 3 toa nằm trong màn hình** (~6s) → chạy tiếp tới cụm 3 toa kế → lặp vòng.
- **Chỉ toa trong màn hình mới tấn công và bị bắn trúng.**
- **Khi đang chạy**: tàu là bức tường chắn đạn ngang giữa sân (đạn hai phía không qua được), toa không bắn. Đây là lúc né / nạp đạn / mua vị trí.
- Bánh tàu tóe lửa báo trước 1s khi sắp dừng / sắp chạy.

### Máu & thắng
- Tổng **50 máu** = tổng máu các toa (Đầu Tàu 10, mỗi toa khác 5–6).
- **Mỗi toa bị phá → các toa còn lại mạnh hơn**: +15% sát thương & tốc bắn mỗi toa đã mất (cộng dồn), toa vỡ thành xác cháy (vẫn chắn đạn khi đi ngang).
- **Đầu Tàu có Khiên Hơi Nước** tới khi mất ≥3 toa → phải phá toa trước rồi mới hạ được đầu tàu.
- Hạ Đầu Tàu hoặc phá hết toa → qua Phase.

### Kỹ năng từng toa (Phase 1)

| Toa | Kỹ năng | Cách né / khắc chế |
|---|---|---|
| **Toa SMG ×2** | **Xả Hai Phía**: 2 nòng quay quét hình quạt bắn đồng thời lên trên và xuống dưới, loạt 1.5s, có **khe hở** di chuyển theo nòng | Chạy theo khe hở; đứng xa thì đạn tản |
| **Toa Pháo Kích ×2** | **Nả Pháo**: 3 quả cối rơi xuống làn người chơi, vòng cảnh báo 0.8s, quả 2–3 đón đầu theo hướng bạn đang chạy | Đổi hướng ngay khi thấy vòng thứ 2 |
| **Toa Pháo Lazer** | **Tia Ray** (hitscan, dùng `scheduleHitscan`/`HitscanWarning`): khóa cột vào bạn, cột cảnh báo 0.6s rồi bắn tia xuyên làn | Lách khỏi cột; tường Sniper / khiên chặn được |
| **Toa Gọi Quân ×2** | **Mở Cửa Toa**: thả 2–3 lính (Lính Ray: chạy về làn bạn, chạm thì nổ; Lính Súng: đứng bắn) | Diệt lính sớm; lính rơi tiền nhỏ |
| **Đầu Tàu** | **Còi Tàu**: sóng âm đẩy lùi + làm chậm 1s hai làn. **Xông Ga**: khi còn ≤50% máu, đầu tàu lao vụt qua màn hình (đường cảnh báo vàng), chạm làn nào gây dame làn đó | Còi tàu báo bằng khói trắng 0.5s; Xông Ga đứng xa đường ray |

### Co-op
- 2 người: P1 dưới, P2 trên, tàu ở giữa → Toa SMG bắn về **cả hai phía** nên hai người cùng chịu áp lực.
- Máu boss ×1.6 khi có 2 người.
- **Cứu đồng đội**: người bị hạ thành "Hồn Ký Ức" (không bắn được); đồng đội phá được 1 toa → hồi sinh 50% máu.
- Chơi 1 mình: chỉ có P1; nửa trên sân trống (đạn bắn lên thì bay mất).

## 3. Thẻ Ký Ức — ví dụ

### Buff cho bạn (mẫu)
| Buff | Hiệu ứng |
|---|---|
| Vé Hạng Nhất | +2 Max HP, hồi đầy đầu mỗi Phase |
| Phá Ray | +35% sát thương lên toa tàu / lính |
| Ký Ức Thợ Máy | Mỗi toa bị phá: +1 đạn tối đa vĩnh viễn |
| Khói Sân Ga | Khi tàu đang chạy: bất tử 0.5s mỗi lần tàu đổi trạng thái |
| Vé Khứ Hồi | Hồi sinh 1 lần / lượt chơi (co-op: cả đội) |
| Tín Hiệu Đỏ | Bắn trúng Đầu Tàu làm tàu dừng thêm 1.5s |

### Buff cho boss (mẫu)
+20% máu · +15% tốc bắn · Lính +1 · Giáp toa (−20% dame nhận) · Cảnh báo ngắn hơn 0.1s · Thêm 1 toa ngẫu nhiên.

## 4. Phase 2 — 3 biến thể (đổi lối chơi, không chỉ đổi số)

### 2.1 TÀU THIẾT GIÁP (★1)
- Tàu **không dừng hẳn** — bò chậm liên tục, toa luôn nằm trong tầm.
- Mỗi toa có **Giáp Mặt** quay về 1 phía (lên/xuống), đổi phía mỗi 4s: bắn vào giáp chỉ 25% dame → canh lúc giáp quay đi (co-op: một người dụ, một người bắn).
- Toa SMG → **Súng Máy Hạng Nặng** (đạn to, chậm, xuyên khiên).
- Toa Gọi Quân → thả **Khiên Binh** đứng chắn trước toa.

### 2.2 TÀU ĐÊM / TÀU MA (★2)
- Tàu chạy qua **đường hầm**: cả sân tối, chỉ thấy đèn pha + đèn cảnh báo.
- Toa Lazer → **Đèn Pha Truy Lùng**: rọi theo bạn; bị rọi 1s = bị **đánh dấu**, Toa Pháo Kích ưu tiên nã vào người bị đánh dấu.
- **Toa Ảo Ảnh**: 1 toa giả xuất hiện xen kẽ (bắn trúng toa giả thì bị phản đạn) — toa thật có khói, toa giả không.
- Lính → **Bóng Ma Ray** đi xuyên đạn, chỉ chết khi bị đèn của bạn (đạn có hiệu ứng sáng/lửa) chiếu trúng hoặc khi tàu ra khỏi hầm.

### 2.3 TÀU HỎA NGỤC / TÀU CHỞ DẦU (★3)
- Thêm 2 **Toa Bồn Dầu**: rỉ dầu thành vệt cháy chạy ngang làn người chơi.
- **Phá Toa Bồn Dầu → nổ dây chuyền** gây dame toa bên cạnh (người chơi tự tận dụng để phá nhanh) nhưng cũng đốt làn mình 3s.
- Toa Pháo Kích → **Bom Xăng**: nổ thành vũng lửa 4s.
- Đầu Tàu nóng dần: **Quá Nhiệt** ở 100% → phun hơi toàn sân, phải giữ nó dưới 100% bằng cách bắn **van xả** (điểm yếu phát sáng).

## 5. Phase 3 — 3 biến thể (trùm cuối)

### 3.1 SIÊU TỐC TUYẾN ĐẦU (★1)
- **2 đường ray**: tàu tách thành 2 đoàn ngắn chạy ngược chiều, một đường gần làn P1, một đường gần làn P2 (chơi 1 mình: cả hai đường dồn về nửa sân dưới, lệch nhau).
- Tàu chạy nhanh, dừng ngắn (3s) → nhịp nhanh, nhiều đạn.
- Khi 2 đầu tàu gặp nhau giữa sân → **Va Chạm**: nổ lớn toàn bộ khu giữa (cảnh báo 1.5s).

### 3.2 PHÁO ĐÀI DI ĐỘNG (★2)
- Tàu dừng vĩnh viễn, ghép thành **pháo đài**; các toa xoay vòng như băng chuyền quanh Đầu Tàu (lần lượt quay mặt về phía bạn).
- **Pháo Ray Khổng Lồ** nạp 6s → tia xuyên toàn làn rộng; phải bắn vỡ **2 tụ điện** trước khi nạp xong để hủy (co-op: mỗi người 1 tụ).
- Lính được thả liên tục từ băng chuyền.

### 3.3 ĐOÀN TÀU KÝ ỨC (★3)
- Mỗi toa là **ký ức một trận đấu cũ**: toa sao chép kỹ năng của 1 body (ưu tiên body bạn hay chơi / body bạn từng thua) — ví dụ toa Sniper dựng tường, toa Pháo Băng làm chậm, toa Huyết Ma hút máu.
- Toa đổi ký ức mỗi vòng chạy → mỗi lần tàu dừng là một bộ chiêu khác.
- Đầu Tàu → **Người Lái Ký Ức**: khi còn 30% máu, chiếu lại 5s cuối của bạn thành bóng ảo bắn ngược vào bạn.

## 6. THIÊU ĐỐT (chơi tiếp sau khi thắng)

- Sau Phase 3, chọn **Kết thúc** (nhận thưởng) hoặc **Thiêu Đốt**.
- Mỗi tầng Thiêu Đốt: boss là một biến thể ngẫu nhiên (2.x/3.x), bạn **chọn 1 trong 3 Tiến Hóa Boss** (boss mạnh hơn) — đổi lại nhận phần thưởng (tiền, buff nhỏ). Không có buff miễn phí như thẻ Ký Ức.
- Ví dụ Tiến Hóa Boss: Đường Ray Kép (luôn 2 đoàn) · Toa Mới (thêm Toa Bồn Dầu / Toa Ảo Ảnh vào đoàn) · Nhiên Liệu Đỏ (mọi chu kỳ nhanh 15%) · Thép Ký Ức (toa hồi 1 máu/3s) · Đêm Vĩnh Viễn (luôn tối) · Đoàn Tàu Dài (+2 toa).
- Điểm = số tầng vượt qua (lưu kỷ lục, co-op lưu riêng).

## 7. Ghi chú kỹ thuật (khi code)

- Boss là thực thể mới (`TrainBoss`, `TrainCar`, `TrainMinion`…) → thêm vào `NET_CLASSES`, chỉ dữ liệu thuần (co-op online).
- Lazer: `scheduleHitscan` / `HitscanWarning` như quy ước.
- **Rủi ro lớn nhất**: rất nhiều chiêu body nhắm vào "xe địch" (`p2` / `enemy`). Cần một **mục tiêu thay thế** (toa đang trong màn hình gần nhất / lính gần nhất) cho các hàm tìm địch, và rà từng body xem chiêu nào vô dụng khi đánh boss (kết liễu, đếm nhịp, cướp chỉ số…). Phần rà soát giao Codex được.
- Tận dụng: cảnh báo vòng / cột, Explosion, hệ đạn, cửa hàng, G.E.A.R, co-op online sẵn có.

## 8. Câu hỏi còn mở

1. Thua (chết) trong 1 Phase: chơi lại Phase đó (giữ đồ) hay thua cả lượt?
2. Tiền ở chế độ boss lấy từ đâu: phá toa / lính, hay cố định mỗi Phase?
3. Chơi 1 mình: P1 đánh một mình, hay có bot đồng đội làm P2?
4. 50 máu Phase 1 là con số cuối, hay để mình cân theo sát thương trung bình các body?
5. Thẻ Ký Ức là gói cố định 3 phần, hay cho chọn riêng buff bạn và biến thể?
