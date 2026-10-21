# NOTE_Antigravity — Nhật Ký Cập Nhật Hệ Thống Lõi Công Nghệ G.E.A.R (`#1 – #150`)

Tài liệu này ghi nhận đầy đủ tất cả các file tạo mới, các file được chỉnh sửa, cũng như các quy tắc logic đã triển khai cho hệ thống **150 Lõi Công Nghệ G.E.A.R (`#1 – #150`)**:
- `1-50Đầu.txt` (`#1 – #50`)
- `Cập Nhật G.E.A.R.txt` (`#51 – #106` và quy tắc hệ thống)
- **Bản mở rộng `#107 – #150` (44 Lõi Mới)** & Tinh chỉnh giai đoạn xuất hiện / quy tắc kết hợp trên toàn bộ hệ thống.

---

## 1. Các Quy Tắc Logic Hệ Thống Đã Triển Khai

1. **Mốc Hiệp Mở G.E.A.R Theo Thể Thức Trận Đấu (`getGearMilestoneIndex`)**:
   - **BO3 (`winScore <= 2`)**: Mở chọn G.E.A.R tại **Hiệp 1, Hiệp 2, Hiệp 3**.
   - **BO5 / BO7 (`winScore >= 3`)**: Mở chọn G.E.A.R tại **Hiệp 1, Hiệp 3, Hiệp 5**.
   - Ở **Hiệp 1**, người chơi chọn **Body (Vũ Khí)** trước, sau đó màn hình chuyển ngay sang chọn **G.E.A.R Mốc 1** rồi tự động khóa Sẵn Sàng.
   - Ở **Hiệp Giữa Trận & Cuối Trận** (R2/R3 với BO3 hoặc R3/R5 với BO5/BO7), người chơi chọn **G.E.A.R** trước khi bước vào **Cửa Hàng (Shop)**.

2. **Tỉ Lệ Động (Dynamic Tier Decay — 60% Bạc / 30% Vàng / 10% Lăng Kính)**:
   - Đầu mỗi trận đấu (`startBattle`), hệ thống chạy `generateMatchGearTiers()` để quay trước 3 bậc cho 3 mốc (`gameState.matchGearTiers`).
   - Sau mỗi mốc quay, bậc vừa trúng bị giảm **50% trọng số hiện tại**, lượng giảm được chia đều cho 2 bậc còn lại.
   - Cả 2 người chơi khởi đầu với cùng chuỗi bậc `player.gearTiers = [...gameState.matchGearTiers]` để đảm bảo công bằng tuyệt đối.

3. **Logic Riêng Của Lõi `#104` (`gear_glitter_next_s` — Tiền Vàng Và Lấp Lánh)**:
   - Chỉ nâng cấp bậc G.E.A.R ở Mốc 2 (`player.gearTiers[1] = 'PRISMATIC'`) cho **đúng người chơi đã chọn `#104`**, không làm thay đổi bậc Mốc 2 của đối thủ.

4. **Logic Khóa Cùng Dòng (`familyId`) & Khóa Chéo (`incompatibleWith`)**:
   - **Khóa Cùng Dòng (`familyId`)**: Chỉ khóa các lõi cùng `familyId` khi người chơi **đã chọn** một lõi thuộc dòng đó trong `player.equippedGears` (nếu chỉ mới xuất hiện trên bàn chọn mà người chơi bỏ qua thì vẫn có thể xuất hiện ở mốc sau). Trong cùng 1 lượt 3 thẻ cũng không xuất hiện 2 thẻ trùng `familyId`.
   - **Khóa Chéo (`incompatibleWith`)**: Kiểm tra 2 chiều giữa các lõi đã sở hữu (`player.equippedGears`) và lõi ứng viên.

5. **Lọc Theo Giai Đoạn (`stage`), Vai Trò Chính (`roleReq`), Body (`bodies` / `excludeBodies`) & Điều Kiện Động (`cond`)**:
   - Mốc 1 (Early / R1): chỉ cho phép `EARLY`, `EARLY_MID`, `ALL`.
   - Mốc 2 (Mid): chỉ cho phép `EARLY_MID`, `MID_LATE`, `ALL`.
   - Mốc 3 (Late): chỉ cho phép `MID_LATE`, `ALL`.
   - Khi người chơi vừa chọn Body ở Hiệp 1, hàm `syncPlayerBodyPreviewForGear(player)` tính ngay `player.maxHp` (kể cả máu cộng thêm theo kích thước thân xe) và quay trước tỉ lệ 8% Easter Egg `player.mainEgg` của xe `basic`, đảm bảo các lõi kiểm tra `cond(player)` ở Hiệp 1 (`#25`, `#82`, `#83`, `#106`) hoạt động chính xác 100%.

6. **Tránh Xung Đột Thuộc Tính `player.gears` Của Thiên Tài (`genius`)**:
   - `player.gears` trong codebase gốc là đơn vị tiền tệ "Bánh Răng" của xe **Thiên Tài (`genius`)**.
   - Do đó, toàn bộ danh sách lõi G.E.A.R đã chọn của người chơi được lưu tách biệt tại `player.equippedGears` (mảng ID) kèm hàm kiểm tra `player.hasGear(id)` và `player.addGear(id)`.

---

## 2. Các Tinh Chỉnh Giai Đoạn Xuất Hiện (`stage`) & Kết Hợp Hợp Lý Trên `#1 – #106`

1. **`#6` (`gear_comeback_g` — Lật Kèo)**:
   - Chuyển từ `stage: 'EARLY_MID'` sang `stage: 'EARLY'` để **chỉ xuất hiện ở Hiệp 1 (R1)** theo đúng yêu cầu thiết kế tích lũy chuỗi thua từ đầu trận.
2. **`#18` (`gear_infinite_stat_p` — Chỉ Số Vô Tận)**:
   - Chuyển từ `stage: 'EARLY_MID'` sang `stage: 'EARLY'` (chỉ xuất hiện ở R1 vì lõi này cộng dồn vĩnh viễn sau mỗi hiệp kết thúc).
3. **`#7` (`gear_interest_cap_s` — Quỹ Đầu Tư Mạo Hiểm)**:
   - Thêm điều kiện `cond: (p) => ((p.upgrades && p.upgrades.interest) || 0) < 5` để không xuất hiện vô ích nếu người chơi đã nâng tối đa 5 mốc Lãi Kép trong Shop.
4. **`#26` (`gear_harmonic_s` — Cân Bằng Tuyệt Đối)**:
   - Chuyển từ `stage: 'ALL'` sang `stage: 'MID_LATE'` để xuất hiện từ Mốc 2 trở đi sau khi người chơi đã mua các nâng cấp Chân xe trong Shop (ở R1 người chơi chưa có món Chân nào).
5. **`#29` (`gear_horizontal_pull_g` — Trọng Trường Ngang) & `#30` (`gear_side_knockback_s` — Đạn Xung Kích Ngang)**:
   - Bổ sung `incompatibleWith` hai chiều giữa `#29` và `#30` để tránh trường hợp 1 viên đạn vừa hút đối thủ vào tâm vừa đẩy lùi đối thủ ra xa cùng lúc.
6. **`#36` (`gear_extra_mag_s` — Mở Rộng Băng Đạn) & `#37` (`gear_fast_reload_g` — Bàn Tay Ánh Sáng)**:
   - Bổ sung `excludeBodies: GEAR_BODY_GROUPS.ENERGY_HEAT` vì nhóm xe Năng Lượng / Nhiệt đã có bộ lõi riêng (`#38`, `#39`, `#40`).
7. **`#41` (`gear_just_a_prank_g` — Chỉ Là 1 Trò Đùa!)**:
   - Chuyển từ `stage: 'ALL'` sang `stage: 'MID_LATE'` để hộp quà bất ngờ giữa sân phát huy nhịp độ cao trào ở giữa và cuối trận.
8. **Liên Kết Mở Khóa Tộc Triệu Hồi (`#67 gear_summon_buff_s` & `#68 gear_summon_army_g`)**:
   - Mở rộng điều kiện trong `canGearAppearForPlayer`: bất kỳ xe nào đã lấy lõi tạo Drone/Trụ/Lính hỗ trợ (`#70`, `#123`, `#125`, `#126`, `#129`, `#132`, `#133`, `#134`, hoặc `#19` trúng giải Jackpot 5) đều được mở khóa tiếp `#67` (**Cường Hóa Đệ Tử**: +35% Máu & Sát thương vật triệu hồi) và `#68` (**Đội Quân Nhân Bản**: mỗi lần triệu hồi sinh thêm 1 bản sao mini 40% chỉ số)!

---

## 3. Danh Sách 44 Lõi Công Nghệ G.E.A.R Mới (`#107 – #150`)

### Nhóm 9: Đột Biến Tấn Công & Hiệu Ứng Đạn Đạo Mới (`#107 – #122`)
- **`#107` `gear_atk_chain_lightning_g` (Đạn Điện Liên Hoàn — Vàng)**: Đạn trúng đích (hồi 1.2s) phóng tia sét giật sang mục tiêu/vật triệu hồi gần đó (hoặc dội lại từ tường làm giật chính đối thủ) gây **22 sát thương** và làm chậm **20%** trong 1s.
- **`#108` `gear_atk_thunder_god_p` (Lôi Thần Giáng Thế — Lăng Kính)**: Đạn tích **Tĩnh Điện**. Đủ **4 cộng dồn** triệu hồi **Thiên Lôi** giáng thẳng từ bầu trời gây **55 sát thương chuẩn** và làm choáng **0.35s**.
- **`#109` `gear_atk_boomerang_g` (Đạn Boomerang — Vàng)**: Khi đạn chạm tường đối diện lần đầu, nó bay ngược về phía người bắn với **75% sát thương** và xuyên vật cản.
- **`#110` `gear_atk_blackhole_p` (Đạn Hố Đen — Lăng Kính)**: Mỗi **4.5s**, phát bắn trúng đích tạo ra **Hố Đen Mini** tại điểm va chạm trong **1.8s**, hút nhẹ kẻ địch về tâm và gây **36 sát thương** theo thời gian.
- **`#111` `gear_atk_venom_s` (Đầu Đạn Độc Tố — Bạc)**: Đạn phủ **Độc Tố Axit** rút **8 máu/giây** trong 3s (cộng dồn tối đa 3 tầng = 24 máu/s) và giảm **20% hiệu quả hồi máu/nhặt hộp máu** của mục tiêu.
- **`#112` `gear_atk_plague_g` (Độc Dịch Truyền Nhiễm — Vàng)**: Kẻ địch dính hiệu ứng đốt/độc từ đạn bị **Mục Rữa Giáp (nhận thêm +12% sát thương)**. Đủ **5 phát trúng** sẽ kích nổ toàn bộ độc tố gây **45 sát thương tức thì**!
- **`#113` `gear_atk_crit_s` (Đầu Đạn Chí Mạng — Bạc)**: Đạn có **22% tỉ lệ Chí Mạng**, gây **165% sát thương** kèm hiệu ứng tia lửa chí mạng.
- **`#114` `gear_atk_crit_master_p` (Phán Quyết Tử Thần — Lăng Kính)**: Tăng **+35% tỉ lệ Chí Mạng**, đòn Chí Mạng gây **200% sát thương** và bỏ qua **30% giảm sát thương/giáp** của mục tiêu.
- **`#115` `gear_atk_death_mark_g` (Ấn Tử Thần — Vàng)**: Đạn khắc **Ấn Tử Thần** lên kẻ địch trong 4s. Đủ **3 Ấn** sẽ kích nổ gây sát thương bằng **12% Máu tối đa** của mục tiêu (hồi chiêu 3s).
- **`#116` `gear_atk_shatter_ice_g` (Mảnh Vỡ Băng Tinh — Vàng)**: Khi bắn trúng kẻ địch đang bị **Làm Chậm** hoặc **Đóng Băng**, viên đạn vỡ thành **3 mảnh băng nhọn** văng ra sau lưng mục tiêu, mỗi mảnh gây **35% sát thương**.
- **`#117` `gear_atk_homing_g` (Đạn Tầm Nhiệt Tự Dẫn — Vàng)**: Đạn bắn ra tự động uốn cong quỹ đạo nhẹ (**Homing**) về phía đối thủ khi bay vào bán kính **180px** quanh mục tiêu.
- **`#118` `gear_atk_emp_pulse_s` (Đạn Xung Điện EMP — Bạc)**: Mỗi **5s**, đòn bắn tiếp theo mang xung điện **EMP**: khi trúng đích làm câm lặng kỹ năng/nạp đạn của địch trong **0.5s** và xóa **60 Lá Chắn** của chúng.
- **`#119` `gear_atk_soul_burn_g` (Lửa Linh Hồn — Vàng)**: Đạn thiêu đốt linh hồn kẻ địch gây sát thương bằng **2.5% Máu tối đa/giây** trong 2.5s và chuyển hóa **50% lượng máu đốt được** thành máu hồi cho bạn.
- **`#120` `gear_atk_phase_pierce_g` (Đạn Xuyên Không — Vàng)**: Đạn xuyên qua **Chướng Ngại Vật Giữa Sân, Thùng Gỗ và Tường Triệu Hồi** mà không bị cản lại; khi xuyên qua vật cản, đạn được tăng **+25% tốc độ bay** và **+15% sát thương**.
- **`#121` `gear_atk_overcharge_s` (Tụ Năng Quá Tải — Bạc)**: Mỗi **1 giây** bạn không bắn, đòn bắn tiếp theo tích tụ năng lượng tăng **+25% sát thương** và **+20% kích thước đạn** (tích tối đa **+75%** sau 3 giây).
- **`#122` `gear_atk_twin_fang_g` (Song Nha Liên Kích — Vàng)**: Mỗi phát bắn thứ **3** sẽ tự động phóng kèm **2 tia đạn năng lượng phụ** kẹp hai bên (mỗi tia gây **40% sát thương** đạn gốc).

### Nhóm 10: Thiết Bị Hỗ Trợ, Trụ Chiến Thuật & Triệu Hồi Đa Dụng (`#123 – #135`)
- **`#123` `gear_sup_heal_beacon_g` (Trạm Quân Y Dã Chiến — Vàng)**: Đầu hiệp và mỗi **12s**, thả **1 Trạm Quân Y** sau lưng xe (tồn tại 8s), phát xung hồi **18 Máu/giây** và tăng **+12% Tốc chạy** khi bạn đứng gần.
- **`#124` `gear_sup_trophy_ads_g` (Hệ Thống Phòng Thủ Chủ Động Trophy — Vàng)**: Trang bị hệ thống **Laser Phòng Thủ** trên nóc xe: mỗi **2.5s** tự động bắn hạ **1 viên đạn địch** bay vào phạm vi **95px** quanh xe và hồi lại **8 Lá Chắn**.
- **`#125` `gear_sup_tesla_coil_g` (Cột Thu Lôi Tesla — Vàng)**: Mỗi **9s**, dựng **1 Cột Thu Lôi Tesla** trên phần sân của bạn (tối đa 2 cột). Cột tự động phóng sét mỗi **1.3s** gây **24 sát thương** lên kẻ địch hoặc đạn lớn trong tầm **220px**.
- **`#126` `gear_sup_frost_totem_s` (Cọc Băng Hàn Khí — Bạc)**: Mỗi **10s**, triệu hồi **1 Cọc Băng** ở khu vực giữa sân (tồn tại 7s), tỏa hàn khí làm chậm **25% tốc độ di chuyển** và **15% tốc độ đạn** của đối thủ đi ngang.
- **`#127` `gear_sup_speed_rail_s` (Đường Ray Từ Trường — Bạc)**: Thiết lập **Đường Ray Từ Trường** dọc theo phần sân của bạn: tăng **+20% tốc độ lướt ngang** và để lại vệt điện từ gây **20 sát thương/giây** nếu kẻ địch hay vật triệu hồi xâm phạm.
- **`#128` `gear_sup_satellite_p` (Vệ Tinh Quỹ Đạo — Lăng Kính)**: Cứ mỗi **6.5s**, vệ tinh không gian khóa vị trí đối thủ trong **1.1s** rồi giáng **Cột Laser Quỹ Đạo** xuống gây **70 sát thương** và để lại vùng đất cháy trong **2.5s**.
- **`#129` `gear_sup_decoy_holo_s` (Cọc Ảnh Ảo Khiêu Khích — Bạc)**: Đầu hiệp và mỗi **11s**, dựng **1 Cọc Hologram (140 Máu)** phía trước xe giúp chắn đạn hộ. Khi bị bắn vỡ, cọc phát nổ sóng âm đẩy lùi đạn địch và gây **35 sát thương**.
- **`#130` `gear_sup_supply_pod_g` (Khoang Tiếp Tế Không Gian — Vàng)**: Mỗi **10s**, một **Khoang Tiếp Tế** rơi xuống phần sân của bạn. Chạm vào khoang giúp hồi **65 Máu**, nhận **40 Lá Chắn** và **+25% Tốc bắn** trong **4s**.
- **`#131` `gear_sup_gravity_well_g` (Giếng Trọng Lực — Vàng)**: Mỗi **11s**, phóng một **Giếng Trọng Lực** sang phần sân đối thủ (tồn tại 4s), liên tục kéo xe địch về tâm giếng và làm giảm **30% tốc độ di chuyển** của chúng.
- **`#132` `gear_sup_shield_drone_g` (Drone Hộ Vệ Khiên Từ — Vàng)**: Triệu hồi **1 Drone Hộ Vệ** bay vòng quanh xe. Mỗi **4s** Drone cấp cho bạn **45 Lá Chắn** và tự động lao ra đỡ **1 đòn chí mạng/sát thương lớn (>60)** thay cho bạn (tái tạo sau 8s).
- **`#133` `gear_sup_ammo_turret_s` (Trụ Tiếp Đạn Liên Thanh — Bạc)**: Đầu hiệp dựng **1 Trụ Liên Thanh Mini** bên cạnh xe: tự động bắn yểm trợ mỗi **1.4s** (**16 sát thương**) và tăng **+15% tốc độ nạp đạn / hồi nhiệt** cho chủ nhân.
- **`#134` `gear_sup_mecha_core_p` (Chiến Giáp Hộ Pháp — Lăng Kính)**: Triệu hồi **2 Chiến Giáp Mini** bay kèm hai bên sườn xe: bắn song song với bạn (**30% sát thương đạn gốc**) và gánh thay **20% sát thương** bạn phải nhận.
- **`#135` `gear_sup_mirror_wall_g` (Khiên Quang Học Khúc Xạ — Vàng)**: Mỗi **10s**, dựng một **Màn Chắn Quang Học** trước mặt trong **3s**: đạn của bạn bắn xuyên qua màn chắn sẽ được **nhân đôi (tách thêm 1 viên phụ gây 45% sát thương)** và tăng **+25% tốc độ bay**.

### Nhóm 11: Phản Công Chiến Thuật & Đột Biến Sân Đấu (`#136 – #142`)
- **`#136` `gear_tac_berserk_g` (Cuồng Nộ Tuyệt Vọng — Vàng)**: Cứ mỗi **10% Máu đã mất**, bạn nhận thêm **+4.5% Sát thương** và **+4% Tốc độ bắn** (tối đa **+40% Sát thương** và **+36% Tốc bắn** khi máu dưới 15%).
- **`#137` `gear_tac_fire_trail_s` (Bánh Xe Lửa Địa Ngục — Bạc)**: Khi xe di chuyển sẽ để lại **Vệt Lửa Địa Ngục** tồn tại **2.5s** trên mặt đất, đốt cháy kẻ địch/vật triệu hồi chạm phải (**28 sát thương/giây**) và tăng **+10% Tốc chạy** cho bạn.
- **`#138` `gear_tac_bullet_time_p` (Làm Chậm Thời Gian — Lăng Kính)**: Khi có đạn địch bay vào bán kính **110px** quanh xe bạn, **Trường Ngưng Đọng Thời Gian** tự động làm chậm **45% tốc độ bay của mọi đạn địch** trong vùng đó!
- **`#139` `gear_tac_adrenaline_g` (Cơn Sốt Adrenaline — Vàng)**: Khi né đạn sát nút (đạn địch sượt qua trong tầm **55px** mà không trúng), bạn nhận **+25% Tốc chạy**, **+20% Tốc bắn** trong 2s và hồi ngay **12 Máu** (hồi chiêu 1.5s).
- **`#140` `gear_tac_second_wind_g` (Hơi Thở Thứ Hai — Vàng)**: Một lần mỗi hiệp, khi Máu tụt xuống dưới **30%**, lập tức giải trừ mọi hiệu ứng bất lợi, đẩy lùi đạn địch xung quanh và hồi lại **35% Máu tối đa** trong 2.5s!
- **`#141` `gear_tac_mystery_box_s` (Chiếc Hộp Pandora — Bạc)**: Nhận ngay **1 Lõi G.E.A.R bậc Vàng ngẫu nhiên** tương thích với xe của bạn và được cộng thêm **+5$**!
- **`#142` `gear_tac_overclock_g` (Ép Xung Lõi Năng Lượng — Vàng)**: Trong **12 giây đầu tiên** của mỗi hiệp, xe của bạn vào trạng thái **Ép Xung**: tăng **+30% Sát thương**, **+30% Tốc bắn** và **+25% Tốc chạy** (sau 12s trở về bình thường).

### Nhóm 12: Lõi Anh Hùng Độc Quyền Cho Các Body Còn Lại (`#143 – #150`)
- **`#143` `gear_hero_mystic_p` (Bậc Thầy Bí Thuật — Lăng Kính — Nhóm Cổ Ngữ / Pháp Thuật / Ma Quái)**: Kỹ năng và đạn phép để lại **Vết Nứt Cổ Ngữ** tại điểm trúng đích, phát nổ sau **0.6s** gây thêm **35% sát thương phép** và hồi **15 Lá Chắn** cho bạn.
- **`#144` `gear_hero_elemental_g` (Hợp Nhất Nguyên Tố — Vàng — Nhóm Băng / Lửa / Độc / Phóng Xạ)**: Đòn đánh của bạn đồng thời gây cả **3 hiệu ứng Nguyên Tố**: **Làm Chậm 20% (Băng)**, **Đốt Cháy 12 máu/s (Lửa)** và **Ăn Mòn Giáp +10% sát thương nhận vào (Độc/Xạ)**.
- **`#145` `gear_hero_heavy_ord_g` (Pháo Đài Hạng Nặng — Vàng — Nhóm Pháo Cối / Đại Bác / Tên Lửa)**: Đạn pháo nổ tạo thêm **3 quả bom chùm mini** văng ra xung quanh (mỗi quả gây **30% sát thương**) và cấp cho bạn **15% Giảm sát thương** khi đang nạp pháo.
- **`#146` `gear_hero_gatling_g` (Cơn Mưa Kim Loại — Vàng — Nhóm Súng Máy / Liên Thanh / Shotgun)**: Bắn liên tục giúp tích điểm **Nóng Nòng** (tối đa 10 tầng): mỗi tầng tăng **+3.5% Tốc bắn** và ở tầng tối đa đạn bắn ra có hiệu ứng **Xuyên Giáp (+15% sát thương)**.
- **`#147` `gear_hero_thunder_mag_g` (Cực Từ Siêu Dẫn — Vàng — Nhóm Điện / Từ Trường / Âm Thanh / Laser)**: Mỗi **3.5s** phát ra **Xung Từ Trường Siêu Dẫn** nối giữa bạn và đối thủ, gây **32 sát thương điện**, hút nhẹ đối thủ và làm nhiễu loạn hướng bay của đạn địch.
- **`#148` `gear_hero_apex_p` (Đỉnh Cao Bá Chủ — Lăng Kính — Nhóm Boss / Chí Tôn / Thức Tỉnh)**: Tăng **+18% toàn bộ chỉ số** (Máu, Sát thương, Tốc chạy, Tốc bắn) và mỗi **5s** phóng ra **Sóng Bá Vương** gây **40 sát thương chuẩn** toàn sân kèm đẩy lùi đạn địch!
- **`#149` `gear_hero_adapt_p` (Tiến Hóa Thích Nghi — Lăng Kính — Nhóm Đa Dạng / Chiến Thuật)**: Mỗi lần bạn **gây sát thương** hoặc **nhận sát thương**, nhận 1 tầng **Thích Nghi** (tối đa 15 tầng): mỗi tầng cộng **+2% Sát thương**, **+1.5% Giảm sát thương** và **+3 Máu hồi/giây**.
- **`#150` `gear_hero_clone_army_g` (Binh Đoàn Ảo Ảnh — Vàng — Nhóm Phân Thân / Nhẫn Giả / Ảo Thuật)**: Bắt đầu hiệp đấu và mỗi **10s** tự động triệu hồi thêm **1 Phân Thân Chiến Đấu** hỗ trợ xả đạn (**35% sát thương**); khi phân thân biến mất sẽ phát nổ gây **40 sát thương** và hồi **30 Lá Chắn** cho chủ nhân.

---

## 4. Danh Sách Các File Tạo Mới & Chỉnh Sửa

### File Tạo Mới (2 File)
1. **[js/data/gears.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/data/gears.js)**
   - Chứa định nghĩa `GEAR_TIERS`, `GEAR_BODY_GROUPS`, mảng `GEARS` gồm đủ **150 Lõi Công Nghệ (`#1 – #150`)** và bảng tra cứu nhanh `GEAR_BY_ID`.

2. **[js/game/gear-system.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/gear-system.js)**
   - Triển khai thuật toán quay bậc & lọc thẻ (`generateMatchGearTiers`, `getGearMilestoneIndex`, `canGearAppearForPlayer`, `rollPlayerGearChoices`).
   - Triển khai giao diện chọn G.E.A.R giữa hiệp (`showGearSelectionIfNeeded`, `renderGearSelection`, `renderEquippedGearStrip`).
   - Triển khai các thực thể / vật triệu hồi trên sân của G.E.A.R (`GearSupportDrone`, `GearMine`, `GearBarrierWall`, `GearCenterPrism`, `GearMirage`, `GearPrankBox`, `GearStormBolt`, `GearFieldDevice`).
   - Triển khai toàn bộ cơ chế chiến đấu, kinh tế, hồi phục, khiên, đạn đạo, thiết bị hỗ trợ và độc quyền tướng của **150 lõi G.E.A.R** qua wrapper trên `Player.prototype` và các hook trận đấu.
   - Triển khai **Modal Thử Nghiệm G.E.A.R (`PracticeGearModal`)** trong **Phòng Tập** cho phép tìm kiếm, lọc theo bậc / độ tương thích với xe hiện tại và bật/tắt thử nghiệm bất kỳ lõi nào trong **150 lõi** cho cả Bạn (`P1`) và Bot (`P2`).

### File Đã Chỉnh Sửa (12 File)
1. **[js/player/player.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/player/player.js)**
2. **[js/player/setup.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/player/setup.js)**
3. **[js/game/shop-ui.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/shop-ui.js)**
4. **[js/game/round.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/round.js)**
5. **[js/game/physics.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/physics.js)**
6. **[js/game/combat.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/combat.js)**
7. **[js/entities/world.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/entities/world.js)**
8. **[js/characters/money_tank/logic.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/characters/money_tank/logic.js)**
9. **[js/ai/pve.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/ai/pve.js)**
10. **[js/online/netstate.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/online/netstate.js)** (bổ sung `GearFieldDevice` vào `NET_CLASSES`)
11. **[js/game/controls.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/game/controls.js)** & **[js/online/multiplayer.js](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/js/online/multiplayer.js)**:
    - Chặn lỗi bấm nút Bắn (`Shoot` / `S` / `Space` / `Enter` / `ArrowDown`) làm tự động Sẵn Sàng bỏ qua bước chọn Vũ Khí hoặc chọn G.E.A.R (thêm hàm `canPlayerReady(pid)` trong `shop-ui.js` kèm hiệu ứng rung nhắc nhở `.must-pick-shake`).
    - Thêm nút **`🔄 ĐỔI LẠI` (Reroll từng ô 1 lần)** trên từng thẻ nâng cấp G.E.A.R (`renderGearSelection` và `rollSingleGearReplacement` trong `gear-system.js`) cũng như trên từng thẻ Vũ Khí ở Hiệp 1 (`renderStandardCards` trong `shop-ui.js`).
12. **[index.html](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/index.html)**
13. **[style.css](file:///d:/Game/game-tank-claude-peaceful-goodall-w1qjps/game-tank-claude-peaceful-goodall-w1qjps/style.css)**

---

## 5. Nâng Cấp Sandbox (Phòng Tập 2.0) & Hệ Thống Test Box / Xe Bản Đồ

### 5.1. Thanh Công Cụ Phòng Tập (`#trainingToolbar`) & Các Cơ Chế Mới
- **4 Nhóm chức năng rõ ràng, có thanh cuộn gọn**:
  1. **AI BOT**: `🎯 DUMMY`, `🔫 CHỈ BẮN`, `⚔️ CHIẾN ĐẤU`, `🎚️ CẤP: TB/DỄ/KHÓ`, `🛡️ BOT BẤT TỬ`.
  2. **BODY • EVO • G.E.A.R**:
     - `🎖️ BODY BẠN` & `🔧 BODY BOT`: Mở bảng chọn đủ **67 Body** (cập nhật tự động theo `MODULES.BODY.length`) kèm ô **Tìm kiếm trực tiếp**, **Tab lọc Hệ / Vai Trò** (`TẤT CẢ`, `Đối Đầu`, `Kiểm Soát`, `Cơ Động`, `Sinh Tồn`, `Cờ Bạc`, `COLLAB`) và **Preset Tiến Hóa** (`Cơ Bản`, `Evo 1`, `Evo 2`, `Full Evo ⭐`).
     - `🧬 EVO BẠN` & `🧬 EVO BOT`: Đổi nhanh bậc Tiến Hóa ngay trên sân (`CƠ BẢN` → `EVO 1` → `EVO 2` → `FULL EVO`) cho bất kỳ Body nào (kể cả `basic` / `MAIN` và `evolution`).
     - `⚙️ G.E.A.R BẠN` & `⚙️ G.E.A.R BOT`: Lắp/gỡ thử nghiệm 150 lõi G.E.A.R.
  3. **TEST BOX & BẢN ĐỒ**:
     - `📦 TEST BOX / XE`: Mở **Hệ Thống Test Box • Xe Bản Đồ & Vật Thể** (`#sandboxBoxModal`).
     - `🎲 THÙNG TỰ NHIÊN: BẬT / KHÓA`: Cho phép khóa toàn bộ thùng/xe tự nhiên rơi ngẫu nhiên trên sân (`botAI.freezeNaturalSpawns` trong `js/game/physics.js`) để test riêng từng loại thùng mà không bị nhiễu.
     - `🗺️ MAP: ...`: Đổi trực tiếp giữa 4 bản đồ (`CỔ ĐIỂN`, `Đoàn Tàu`, `Băng Giá`, `Bão Từ`) ngay trong Phòng Tập.
  4. **CƠ CHẾ & TIỆN ÍCH**:
     - `🛡️ BẠN BẤT TỬ`: Bật/tắt chế độ bất tử cho Người chơi 1 (`botAI.isPlayerGodMode` trong `js/player/combat.js`).
     - `♾️ VÔ HẠN ĐẠN`: Giữ đầy đạn, năng lượng, chú lực, linh hồn, bánh răng, linh kiện và xóa nhiệt độ súng mỗi nhịp (`botAI.isInfiniteAmmo`).
     - `💀 TEST KẾT LIỄU`: Kích hoạt ngay hoạt cảnh **Fatal Finisher Cinematic** của Body hiện tại lên Bot.
     - `🛒 MỞ CỬA HÀNG`: Mở trực tiếp giao diện Cửa Hàng Nâng Cấp giữa trận.
     - `💚 HỒI ĐẦY MÁU`, `💰 +200$ & TÀI NGUYÊN`, `🧹 DỌN SẠCH SÂN` (xóa toàn bộ đạn, thùng, xe, vùng hiệu ứng, vật triệu hồi), `🚪 THOÁT`.

### 5.2. Hệ Thống Test Box & Xe Bản Đồ (`#sandboxBoxModal` trong `js/ai/bot.js`)
- Hỗ trợ đầy đủ **16 loại Thùng Tiếp Tế & Thùng Gacha Mới** + **9 loại Xe Bản Đồ & Pháo Đài**:
  - **10 Thùng Tốt (Buff / Tiếp Tế)**: `coin` (Thùng Xu), `hp` (Thùng Máu), `ammo` (Thùng Đạn), `shield` (Thùng Khiên), `dmg` (Thùng Sát Thương), `gear` (Thùng Bánh Răng / Linh Kiện), `frost` (Thùng Băng Hàn), `haste` (Thùng Tăng Tốc), `immune` (Thùng Miễn Nhiễm), `phantom` (Thùng Ảo Ảnh — Gacha mới), `guard` (Thùng Hộ Vệ — Gacha mới).
  - **5 Thùng Bẫy / Nguy Hiểm**: `boom` (Thùng Nổ), `bullets` (Thùng Văng Đạn), `trap` (Thùng Bẫy Kẹp — Gacha mới), `laser` (Thùng Laser Quét — Gacha mới), `mimic` (Thùng Mimic Giả Dạng).
  - **9 Xe Bản Đồ & Công Trình**: `money_truck` (Xe Tiền), `mv_buff` (Xe Cường Hóa), `mv_heal` (Xe Cứu Thương), `mv_atk_cannon` (Xe Pháo Kích), `mv_atk_smg` (Xe Liên Thanh), `mv_atk_laser` (Xe Tia Chớp Laser), `obstacle` (Chướng Ngại Vật), `bastion` (Pháo Đài Kiên Cố), `artillery` (Pháo Cối Tự Hành).
- **5 Chế độ Thả / Kích hoạt**:
  - `📍 TRƯỚC MẶT BẠN`: Thả ngay trên làn trước mặt P1 để tự bắn hoặc nhặt.
  - `🤖 TRƯỚC MẶT BOT`: Thả ngay trước mặt Bot P2.
  - `🎯 GIỮA SÂN`: Thả ở tâm đấu trường.
  - `⚡ NỔ LUÔN CHO BẠN`: Tự động đập vỡ thùng / nổ xe ngay tại vị trí của P1 (test tức thì hiệu ứng `gachaCrateActivate` / buff / bẫy).
  - `💥 NỔ LUÔN CHO BOT`: Tự động đập vỡ thùng / nổ xe ngay tại vị trí của Bot P2.
- **3 Nút Thao Tác Nhanh**: `🌧️ MƯA 8 THÙNG GACHA`, `🧪 THẢ ĐỦ MỌI LOẠI THÙNG` (xếp hàng ngang 16 loại thùng), `🧹 XÓA SẠCH THÙNG & XE`.

### 5.3. Hoàn Thiện Kiểm Tra G.E.A.R (trong `js/game/gear-system.js`)
- Bổ sung đầy đủ xử lý cho `#55 gear_ctrl_zone_s` (+25% bán kính & +1.0s thời gian vùng nguyên tố, +30% thời gian làm chậm của `#32`), `#94 gear_hero_time_g` (-20% hồi chiêu & nhận +1.0 Giáp Trắng + bắn 2 mảnh thời gian khi dịch chuyển/tua ngược), `#96 gear_hero_dj_g` (mỗi nhịp thứ 4 phát sóng Bass Drop hồi +0.35 HP, làm chậm & gây 0.35 sát thương).
- Sửa `#112 gear_atk_plague_g` tạo đúng `new BodyZone(vcx, vcy, 44, 'acid', attacker, 150, 1)` trong `bodyEffects`.
- Sửa `#119 gear_atk_soul_burn_g` gọi qua `victim.takeDamage(soulDmg, attacker, { bypassShield: true, isEnvironmental: true })`.
- Chống cộng dồn tiền/lợi tức nhiều lần khi bật/tắt lại cùng 1 lõi trong Phòng Tập (`player._appliedImmediateGearIds`) và dọn sạch 14 lệnh `hasGear` trỏ tới ID cũ.
