# Y Sư — Evo 3/4

Issue #2; danh sách theo comment cập nhật của chủ repo.

## Evo 3: Kim Đảo Mệnh ($120)

+2 Max HP dự trữ máu. Giữ 0.5s, nhả: đổi 0.5 HP thành kim 1 dame xuyên khiên; không tự hạ dưới 1 HP.

## Evo 4: Truyền Máu Khẩn ($160)

Hồi ngay 1 HP (CD 16s); Năng Lượng Sinh Mệnh ≥50% thì nạp đầy. +10 Nộ/0.5 HP hồi thực. SINH TỬ ĐẢO NGƯỢC: 4s hồi máu địch thành dame, dame địch nhận hồi bạn 50%.

## Full Evo

| Cặp | Hiệu ứng |
|---|---|
| 1+2 | Full Evo nguyên bản. |
| 1+3 | Kim Đảo Mệnh trả Giáp Trắng trước khi trả HP. |
| 2+4 | Lượng hồi từ Ultimate tạo Tia Xung. |
| 3+4 | Kim trúng hoàn lại 0.5 HP; giữ thưởng chung +1 HP, +10% dame, 1 khiên. |
| 1+2+3+4 | Ultimate kéo dài 6s. |

Các cặp chưa có hiệu ứng riêng nhận thưởng chung của framework. Cặp được chốt theo hai Evo mua đầu; chỉ 1234 được nâng khi có đủ bốn Evo và Con Đường Tiến Hóa.

## Cân bằng và điều chỉnh

Kim trả 0.5 HP (hoặc Giáp Trắng với 1+3), không tự hạ dưới 1. +2 Max HP là dự trữ máu. 3+4 hoàn HP khi kim trúng. Đảo hồi máu bỏ tăng đột biến >50% Max HP để tránh nhận nhầm reset/hồi sinh. Đổi tên helper của Y Sư để không bị helper Hellrider trùng tên ghi đè.

## Kiểm chứng

Đã thử P1 và P2: cơ chế Evo 3, Skill, điều kiện Tuyệt Kỹ, tổ hợp riêng, mô phỏng vật lý và round-trip NetState. Kiểm tra thêm host/guest bốn hiệp/body. Số liệu trước/sau và giới hạn phép đo nằm trong [báo cáo chung](../EVO_PILOT_RESULTS.md).

![Y Sư trên màn hình 390×844](images/healer.png)
