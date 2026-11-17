# Kết quả thí điểm Evo 3/4 — issue #2

Nhánh gốc: `claude/peaceful-goodall-w1qjps`, commit `41b60d7`. Đọc issue và cả hai comment; danh sách do chủ repo cập nhật là Tank, Ice, Paradox, Prism, Engineer, Sniper, Berserker, Healer, One Punch và Big Bullet. Không thêm Evo cho basic/MAIN.

## Nội dung

Mỗi body có cơ chế Evo 3, Skill/CD, nguồn Nộ riêng, Tuyệt Kỹ và ít nhất hai tổ hợp riêng. Đạn Lớn kế thừa body mẫu từ #1 và thêm tổ hợp 3+4. Nút Skill giữ vị trí sát Bắn, đối xứng cặp di chuyển.

Các cặp cũ chỉ dùng sức mạnh legacy khi hai Evo mua đầu là 1+2 (hoặc nâng lên 1234). Mua Evo thứ ba không vô tình bật thêm legacy. `EvoBodyKit` giữ registry hàm ngoài dữ liệu mạng; trạng thái Player và `EvoPilotFx` chỉ dùng dữ liệu thuần, có đăng ký NET_CLASSES. Bot đi qua input Skill chung và thao tác giữ/nhả/nhấp đúp theo body.

## Mô phỏng trước/sau

Dùng nguyên INIT và vòng vật lý RUN từ `tools/sim.js`, chọn rõ loadout thay vì cấp mọi Evo cùng lúc. Đối thủ là basic thường với Evo 1+2, tắt roll MAIN; cả hai có một Giáp Thép và một nâng sát thương. Map classic, 420×860, tối đa 5400 tick/hiệp, hai hiệp/seed và đổi P1/P2. 20 seed (`seed = k*7919+17`) → 80 hiệp/body/cặp. Đầu vào Skill và hành vi bot theo body được bật ở bản mới.

Mốc trước là bản gốc 41b60d7 chạy trên bản sao bất biến. Mốc sau dùng cùng cặp 1+2+Full để thấy điều chỉnh legacy; cột 3+4 là lựa chọn mới, không phải cùng loadout. Không có ván hòa trong các cột dưới.

| Body | Trước 1+2 | Sau 1+2 | Sau 3+4 |
|---|---:|---:|---:|
| [tank](evo-pilot/tank.md) | 100% | 32.5% | 52.5% |
| [ice](evo-pilot/ice.md) | 78.8% | 57.5% | 33.8% |
| [paradox](evo-pilot/paradox.md) | 71.3% | 51.3% | 38.8% |
| [prism](evo-pilot/prism.md) | 22.5% | 22.5% | 43.8% |
| [engineer](evo-pilot/engineer.md) | 87.5% | 60% | 46.3% |
| [sniper](evo-pilot/sniper.md) | 62.5% | 55% | 48.8% |
| [berserker](evo-pilot/berserker.md) | 32.5% | 36.3% | 36.3% |
| [healer](evo-pilot/healer.md) | 6.3% | 60% | 21.3% |
| [one_punch](evo-pilot/one_punch.md) | 73.8% | 53.8% | 56.3% |
| [big_bullet](evo-pilot/big_bullet.md) | 81.3% | 57.5% | 40% |

Đã sàng lọc thêm bốn cặp ghép, 8 seed × hai phía × hai hiệp = 32 hiệp/cặp. Các ô đánh dấu `*` đã chạy lại 20 seed/80 hiệp sau chỉnh:

| Body | 1+3 | 1+4 | 2+3 | 2+4 |
|---|---:|---:|---:|---:|
| tank | 43.8% | 45%* | 43.8% | 21.9% |
| ice | 62.5% | 21.9% | 62.5% | 43.8% |
| paradox | 37.5% | 45%* | 56.3% | 46.9% |
| prism | 9.4% | 43.8% | 50% | 34.4% |
| engineer | 53.1% | 53.1% | 15.6% | 56.3% |
| sniper | 34.4% | 43.8% | 52.5%* | 59.4% |
| berserker | 40.6% | 53.1% | 31.3% | 31.3% |
| healer | 3.1% | 25% | 34.4% | 12.5% |
| one_punch | 46.9% | 59.4% | 43.8% | 53.1% |
| big_bullet | 25% | 56.3% | 56.3% | 62.5% |

**Giới hạn:** đây là phép đo có đối thủ chuẩn basic, không phải round-robin 91 body hay kết luận cân bằng toàn game. Hai cặp chính sau chỉnh đều ≤60% trong mẫu 80 hiệp/body; sàng lọc cặp khác tối đa 62.5% ở mẫu 32 hiệp, gần ngưỡng ~60% nhưng sai số còn lớn. Healer 3+4 và một số lối chơi phản đòn còn yếu trước basic; cần playtest đối thủ hồi máu, giao tranh có vật cản và PvP thật. Không suy diễn tỷ lệ thắng theo toàn bộ người chơi từ các số này.

Dữ liệu W/L/D và cỡ mẫu: [evo-pilot/balance.json](evo-pilot/balance.json). Hệ số chỉ số theo cặp nằm riêng tại `js/characters/<body>/evo.js` và có bảng trong trang mỗi body. Các hệ số áp dụng ngay khi có cặp Evo, trước thẻ Full Evo, để thẻ luôn thêm hiệu ứng lên cùng nền chỉ số. 1234 dùng hệ số 1+2 nếu không khai báo riêng.

## Kiểm chứng chức năng

- `node --check` cho mọi file JS của repo, gồm tools và thư viện vendored: 276 file, đạt.
- `node tools/smoke.js`: đạt `done 91`, không lỗi trang, exit 0. Script smoke gốc được giữ nguyên.
- Ca riêng: 212 kiểm tra ở cả P1 và P2, bao gồm Evo 3, Skill, điều kiện Tuyệt Kỹ, vật lý và round-trip NetState; không lỗi trang.
- 72 kiểm tra hiệu ứng tổ hợp (36 ở P1, 36 ở P2), hoàn máu Healer, giữ khiên thưởng của Tank, giới hạn ụ Engineer, giữ cặp đầu khi có Evo thứ ba, phục hồi prototype hiệu ứng mạng; không lỗi trang.
- Hai trang host/guest dùng BroadcastChannel có sẵn: 10 body × 4 hiệp, đối chiếu 40 mốc sau 10 giây, thử input Skill từ guest; không lỗi trang. Đây là đường mạng nội bộ, chưa phải WebRTC hai máy qua Internet.
- Tắt FEATURE_EVO34: cả 10 body chạy vật lý, không thẻ Evo mới, không lỗi trang.
- 10 ảnh 390×844/DPR2 được chụp và xem; ảnh ở từng trang body. Khóa ngắm Sniper dùng thời gian cố định 2.5s thay thao tác nhả sớm như gợi ý kế hoạch.

## Chạy trong cloud

Game không có bước build. Chạy HTTP server tại root repo và mở bằng Chromium. `tools/smoke.js` hiện chứa đường dẫn môi trường Claude cũ và file URL; preload cục bộ của môi trường đổi các đường dẫn này sang Playwright/Chromium đã cài và `http://127.0.0.1:8000/`. Không sửa smoke để bỏ qua lỗi. Preload thu thập pageerror và trả exit code khác 0 nếu có lỗi.

Các harness kiểm tra riêng nằm ở thư mục scratch ngoài repo theo `tools/agents/mod.md`; chúng dùng fake clock của sim và assert kết quả thật. Thay đổi có chủ ý so với gợi ý kế hoạch được ghi trong trang từng body.
