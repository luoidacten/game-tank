// ==========================================
// Dữ liệu 150 Lõi Công Nghệ G.E.A.R (#1 – #150)
// Hệ thống Tỉ Lệ Động (Dynamic Tier Decay), Giai Đoạn (STAGE),
// Khóa Cùng Dòng (familyId) & Khóa Chéo (incompatibleWith)
// ==========================================

const GEAR_TIERS = {
    SILVER: { id: 'SILVER', name: 'Bạc', icon: '🥈', color: '#cbd5e1', border: '#94a3b8', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', glow: 'rgba(148, 163, 184, 0.55)' },
    GOLD: { id: 'GOLD', name: 'Vàng', icon: '🥇', color: '#facc15', border: '#eab308', bg: 'linear-gradient(135deg, #422006, #1c1917)', glow: 'rgba(250, 204, 21, 0.65)' },
    PRISMATIC: { id: 'PRISMATIC', name: 'Lăng Kính', icon: '💎', color: '#e879f9', border: '#22d3ee', bg: 'linear-gradient(135deg, #3b0764, #083344, #4c0519)', glow: 'rgba(34, 211, 238, 0.8)' }
};

// Nhóm Body phục vụ điều kiện lọc G.E.A.R
const GEAR_BODY_GROUPS = {
    SUMMON: ['engineer', 'inventor', 'creator', 'necromancer', 'clone', 'am_duong_su', 'magician', 'ghost', 'mirror', 'gemini', 'jet_pilot', 'raven_oca', 'genius', 'blade_god', 'van_kiem'],
    SUMMON_OVERLOAD: ['engineer', 'inventor', 'creator', 'necromancer', 'clone', 'am_duong_su'],
    SWORD: ['wind_slash', 'storm', 'blade_god', 'van_kiem', 'kiem_khach', 'kiem_su', 'kiem_vu', 'tsukiyo', 'kazuki', 'tat_sat'],
    RAM: ['tank', 'storm', 'magnet', 'shortgunATK', 'thunder', 'flower_shadow', 't_zero', 'blood_lord', 'tsukiyo', 'kazuki', 'tat_sat'],
    HOLD_CHARGE: ['wind_slash', 'storm', 'water_gun', 'cung', 'necromancer', 'steel_hook', 'lazer_beam', 'tsukiyo', 'tat_sat', 'one_punch'],
    ENERGY_HEAT: ['water_gun', 'furnace', 'lazer_auto', 'six_barrel', 'the_strongest', 'sukuna', 'sprayer', 'flower_shadow', 't_zero', 'lazer_beam', 'berserker', 'kazuki', 'tsukiyo', 'tat_sat'],
    HITSCAN_NO_BOUNCE: ['lazer_beam', 'lazer_charge', 'the_strongest', 'one_punch', 'big_bullet', 'steel_hook', 'cluster_gun', 'sprayer', 'tank', 'storm'],
    AMMO_BODIES: ['basic', 'shotgun', 'shortgunATK', 'sniper', 'smg', 'revolver', 'rocket', 'ice', 'acid', 'aaa', 'big_bullet', 'cluster_gun', 'juggernaut', 'paradox', 'portal', 'mirror', 'ghost', 'shadow_hunter', 'magician', 'money_tank', 'inventor', 'engineer', 'creator', 'genius', 'death_lock', 'steel_hook', 'evolution', 'healer', 'dj', 'chrononeo', 'gemini', 'clone', 'jet_pilot', 'raven_oca', 'joker'],
    RAPID_BODIES: ['smg', 'six_barrel', 'lazer_auto', 'sprayer', 'water_gun', 'furnace', 'lazer_beam', 'dj', 'berserker']
};

const GEARS = [
    // =========================================================================
    // 📦 NHÓM 1: KINH TẾ, CỬA HÀNG & THÙNG TIẾP TẾ (#1 – #14)
    // =========================================================================
    {
        num: 1, id: 'gear_ally_crate_s', name: 'Đồng Minh Tiếp Tế',
        tier: 'SILVER', stage: 'ALL', familyId: 'fam_ally_crate',
        excludeBodies: ['evolution'],
        desc: 'Thùng Tiếp Tế Xấu không còn gây hại cho bạn: Phá Thùng Nổ (!) không bị phản 1.5 sát thương; phá Thùng Đạn (✸) thì 16 viên đạn chỉ bắn đối thủ; Xe Tấn Công & Xe Tiền địch không gây sát thương lên bạn.'
    },
    {
        num: 2, id: 'gear_ally_crate_p', name: 'Đại Đội Tiếp Tế Phản Công',
        tier: 'PRISMATIC', stage: 'ALL', familyId: 'fam_ally_crate',
        desc: 'Bao gồm hiệu ứng Đồng Minh Tiếp Tế. Tăng +50% Xe Tiền xuất hiện; mỗi khi bạn bắn phá Xe Tiền, nó bốc lửa lao thẳng sang làn kẻ địch gây 1.5 sát thương nổ!'
    },
    {
        num: 3, id: 'gear_free_foot_s', name: 'Cửa Hàng Gian Lận',
        tier: 'SILVER', stage: 'EARLY_MID',
        incompatibleWith: ['gear_vip_shop_g'],
        desc: 'Đầu mỗi hiệp đấu, 1 Module Chân (FEET) đầu tiên bạn mua trong Shop được Miễn Phí hoàn toàn ($0) (vẫn tính bậc giá cho các lần mua sau).'
    },
    {
        num: 4, id: 'gear_discount_s', name: 'Giảm Giá',
        tier: 'SILVER', stage: 'EARLY_MID', familyId: 'fam_discount',
        desc: 'Toàn bộ 4 Module Chân (Động Cơ, Giáp Thép, Bánh Xích, Lợi Tức) trong Shop được giảm giá 25% vĩnh viễn. Nhận ngay +$15.'
    },
    {
        num: 5, id: 'gear_discount_g', name: 'Giảm Giá++',
        tier: 'GOLD', stage: 'EARLY_MID', familyId: 'fam_discount',
        desc: 'Mọi mặt hàng trong tất cả cửa hàng (Module Chân, Evo, Cấp Độ Xe Tiền, Chợ Linh Kiện, Chợ Đen) giảm giá 30%! Nhận ngay +$30.'
    },
    {
        num: 6, id: 'gear_comeback_g', name: 'Lật Kèo',
        tier: 'GOLD', stage: 'EARLY',
        desc: 'Khi thua liên tiếp từ 2 ván trở lên, ngoài $60 chuỗi thua mặc định, bạn nhận thêm +$70 tiền mặt, +1 Max HP vĩnh viễn và +15% Sát thương ở hiệp tiếp theo!'
    },
    {
        num: 7, id: 'gear_interest_cap_s', name: 'Quỹ Đầu Tư Mạo Hiểm',
        tier: 'SILVER', stage: 'EARLY_MID', familyId: 'fam_interest',
        cond: (p) => p && (typeof feetOwnedCount === 'function' ? feetOwnedCount(p, 'interest') < 5 : true),
        desc: 'Nhận ngay 1 tầng Module Lợi Tức miễn phí ($30/hiệp). Giới hạn tối đa của tầng Lợi Tức mở thêm +1 tầng (lên tầng 6 = $360/hiệp).'
    },
    {
        num: 8, id: 'gear_tycoon_p', name: 'Tài Phiệt Phố Alano',
        tier: 'PRISMATIC', stage: 'ALL', familyId: 'fam_interest',
        excludeBodies: ['money_tank'],
        desc: 'Nhận ngay +$100 và 2 tầng Lợi Tức. Cứ mỗi $50 tiền mặt giữ trong túi lúc bắt đầu hiệp, nhận thêm +8% Sát thương và +0.5 Giáp Trắng đầu hiệp (tối đa mốc $250 = +40% Dame & +2.5 Giáp).'
    },
    {
        num: 9, id: 'gear_bounty_s', name: 'Thợ Săn Tiền Thưởng',
        tier: 'SILVER', stage: 'EARLY_MID',
        desc: 'Mỗi khi bạn tự tay bắn phá Thùng Tiếp Tế nhận thêm +$8; mỗi khi bắn phá Xe Tiền nhận thêm +$15 (ngoài lượng tiền gốc).'
    },
    {
        num: 10, id: 'gear_super_crate_g', name: 'Thùng Đồ Đột Biến',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Mỗi khi ăn hoặc bắn lấy Thùng Tiếp Tế có lợi (Hồi máu, Khiên, Nạp đạn, Bánh răng, Sát thương), hiệu quả tăng gấp đôi (x2) và tăng +20% tốc chạy trong 2s.'
    },
    {
        num: 11, id: 'gear_vip_shop_g', name: 'Khách Hàng Thân Thiết',
        tier: 'GOLD', stage: 'EARLY_MID',
        incompatibleWith: ['gear_free_foot_s'],
        desc: 'Cứ sau mỗi 3 lần mua Module Chân bất kỳ trong Shop, bạn được tặng miễn phí 1 nâng cấp ngẫu nhiên (Giáp Thép +1 HP, Bánh Xích x1.25 Dame hoặc Động Cơ +Tốc) mà không làm tăng giá Shop!'
    },
    {
        num: 12, id: 'gear_early_evo_p', name: 'Tiến Hóa Sớm',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        cond: (p) => {
            if (!p) return false;
            const evos = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.weapon]) || [];
            if (!evos.length) return !p.isFullEvoInventor;
            return evos.some(e => !e.fullEvoGate && !p.hasUpgrade(e.id));
        },
        desc: 'Mở khóa miễn phí ngay lập tức 1 Tiến Hóa (Evo 1 hoặc Evo 2 giá thấp hơn) của Body bạn đang chơi! Nếu đã có đủ 2 Evo, nhận +$220 và +25% mọi chỉ số.'
    },
    {
        num: 13, id: 'gear_crate_magnet_s', name: 'Kẻ Cướp Tiếp Tế',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Đạn của bạn gây x2 sát thương lên Thùng Tiếp Tế và Xe Tiền. Các thùng tiếp tế có lợi ở giữa sân tự động trôi chậm về phía nửa sân và trục X của bạn.'
    },
    {
        num: 14, id: 'gear_insurance_s', name: 'Bảo Hiểm Sinh Mạng',
        tier: 'SILVER', stage: 'EARLY_MID',
        desc: 'Nếu bạn thua một hiệp đấu mà lúc đó kẻ địch chỉ còn dưới 1.5 HP, bạn được hoàn trả +$45 tiền bảo hiểm để mua đồ cho hiệp sau.'
    },

    // =========================================================================
    // 📈 NHÓM 2: CHỈ SỐ ĐỘT PHÁ, TỐC ĐỘ & VẬN MỆNH (#15 – #26)
    // =========================================================================
    {
        num: 15, id: 'gear_uncap_speed_g', name: 'Phá Bỏ Giới Hạn Gia Tốc',
        tier: 'GOLD', stage: 'ALL', familyId: 'fam_uncap_speed',
        desc: 'Xóa bỏ giới hạn mua tối đa 3 lần của Động Cơ trong Shop — mua tốc độ không giới hạn! Tặng kèm ngay 1 cấp Động Cơ miễn phí và giảm 20% giá mua Động Cơ.'
    },
    {
        num: 16, id: 'gear_speed_heal_p', name: 'Đột Phá Tốc Ảnh',
        tier: 'PRISMATIC', stage: 'ALL', familyId: 'fam_uncap_speed',
        desc: 'Mua Động Cơ không giới hạn trong Shop và nhận ngay +18% Tốc chạy. Hồi Phục Động Năng: Mỗi khi di chuyển ngang đủ 260px, tự động hồi +0.3 HP!'
    },
    {
        num: 17, id: 'gear_stat_rain_g', name: 'Cơn Mưa Chỉ Số',
        tier: 'GOLD', stage: 'ALL', familyId: 'fam_all_stats',
        desc: 'Cộng trực tiếp tất cả chỉ số cơ bản: +1.5 Max HP, +15% Sát thương, +10% Tốc độ di chuyển, +1 Đạn tối đa (hoặc +15% tốc hồi Năng Lượng/Nội Năng).'
    },
    {
        num: 18, id: 'gear_infinite_stat_p', name: 'Chỉ Số Vô Tận',
        tier: 'PRISMATIC', stage: 'EARLY', familyId: 'fam_all_stats',
        desc: 'Nhận ngay (+1.0 Max HP, +12% Dame, +6% Tốc độ), VÀ sau mỗi Hiệp đấu lại được cộng dồn thêm một lần tất cả chỉ số trên vĩnh viễn (mỗi 2 hiệp +1 Đạn / +10% Hồi NL)!'
    },
    {
        num: 19, id: 'gear_all_in_gamble_p', name: 'Ván Cược Tất Thắng',
        tier: 'PRISMATIC', stage: 'ALL',
        desc: 'Quay bánh xe định mệnh nhận ngẫu nhiên 1 trong 5 Siêu Hiệu Ứng Độc Đắc: (1) Thần Tài +$250 | (2) Bất Tử Thân +6 HP & hồi 0.4 HP/s | (3) Cuồng Sát +55% Dame & Xuyên Khiên | (4) Thần Tốc +45% Tốc chạy & +40% Tốc bắn | (5) Song Bản 2 Khiên/hiệp & 1 Drone 100% dame!'
    },
    {
        num: 20, id: 'gear_mini_tank_s', name: 'Thu Nhỏ Siêu Thanh',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: ['customize'],
        incompatibleWith: ['gear_giant_tank_g'],
        desc: 'Kích thước thân xe của bạn thu nhỏ đi 20% (khó bị bắn trúng hơn hẳn) và nhận thêm +15% Tốc độ di chuyển, +10% Tốc độ bắn.'
    },
    {
        num: 21, id: 'gear_giant_tank_g', name: 'Pháo Đài Khổng Lồ',
        tier: 'GOLD', stage: 'ALL',
        incompatibleWith: ['gear_mini_tank_s'],
        desc: 'Kích thước thân xe phóng to lên +25%, bù lại nhận ngay +2.0 Max HP, +10% Sát thương và miễn nhiễm hiệu ứng bị đẩy lùi/kéo lệch ngang!'
    },
    {
        num: 22, id: 'gear_heavy_tread_s', name: 'Bánh Xích Hạng Nặng',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Nhận ngay 1 cấp Bánh Xích miễn phí (x1.25 Sát thương). Ngoài ra, 3 lần mua Bánh Xích tiếp theo trong Shop đều giữ nguyên hệ số x1.25 không bị giảm dần.'
    },
    {
        num: 23, id: 'gear_headstart_s', name: 'Khởi Đầu Hoàn Hảo',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Trong 12 giây đầu tiên của mỗi hiệp đấu, bạn nhận thêm +30% Tốc độ di chuyển và +30% Tốc độ bắn / Tốc độ nạp đạn.'
    },
    {
        num: 24, id: 'gear_scaling_time_g', name: 'Chiến Binh Bền Bỉ',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Cứ mỗi 10 giây trôi qua trong một hiệp đấu, bạn nhận cộng dồn +8% Sát thương và +5% Giảm sát thương nhận vào (tối đa 5 lần tại giây 50).'
    },
    {
        num: 25, id: 'gear_glass_cannon_g', name: 'Đánh Đổi Liều Lĩnh',
        tier: 'GOLD', stage: 'ALL',
        incompatibleWith: ['gear_anti_burst_g'],
        cond: (p) => p && (p.maxHp || 0) >= 4,
        desc: 'Khấu trừ đi 30% Max HP hiện tại của bạn, đổi lại tăng vĩnh viễn +45% Sát thương gây ra và +15% Tốc độ đạn!'
    },
    {
        num: 26, id: 'gear_harmonic_s', name: 'Cân Bằng Tuyệt Đối',
        tier: 'SILVER', stage: 'MID_LATE',
        desc: 'Nếu số cấp Giáp Thép và Bánh Xích bạn đã mua trong Shop bằng nhau, bạn được nhận thêm +15% Sát thương và +1.5 Max HP.'
    },

    // =========================================================================
    // 🔫 NHÓM 3: CƯỜNG HÓA ĐƯỜNG ĐẠN & CƠ CHẾ BẮN CHUNG (#27 – #40)
    // =========================================================================
    {
        num: 27, id: 'gear_big_shot_s', name: 'Đạn To',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: ['tank', 'storm', 'lazer_beam'],
        desc: 'Toàn bộ đạn và vật phóng của bạn có kích thước to hơn +35% và gây thêm +10% Sát thương.'
    },
    {
        num: 28, id: 'gear_bullet_rain_p', name: 'Mưa Đạn',
        tier: 'PRISMATIC', stage: 'ALL',
        excludeBodies: ['tank', 'storm', 'lazer_beam', 'sprayer'],
        desc: 'Mỗi khi bạn khai hỏa hoặc tung đòn bắn, sau 0.15 giây nòng súng tự động bắn bồi thêm 1 đợt đạn phụ miễn phí (40% sát thương đợt chính)!'
    },
    {
        num: 29, id: 'gear_horizontal_pull_g', name: 'Đạn Từ Tính (Kéo Ngang)',
        tier: 'GOLD', stage: 'ALL',
        incompatibleWith: ['gear_side_knockback_s'],
        desc: 'Đạn bắn trúng địch (hoặc bay sượt cách < 45px) tạo lực hút kéo giật kẻ địch trượt ngang trên làn của chúng (25px) về phía tâm đường đạn (CD: 2.5s).'
    },
    {
        num: 30, id: 'gear_side_knockback_s', name: 'Sóng Chấn Động (Đẩy Ngang)',
        tier: 'SILVER', stage: 'ALL',
        incompatibleWith: ['gear_horizontal_pull_g'],
        desc: 'Mỗi phát bắn thứ 3 trúng đích phát nổ chấn động đẩy trượt kẻ địch dạt ngang (50px) và Làm Chậm 25% trong 1.5s (đập tường biên gây thêm +0.5 sát thương!).'
    },
    {
        num: 31, id: 'gear_ricochet_g', name: 'Đạn Nảy Cao Su',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: GEAR_BODY_GROUPS.HITSCAN_NO_BOUNCE,
        desc: 'Đạn thường của bạn khi bay chạm vào tường hai bên hoặc tường biên phía sau lưng địch sẽ nảy ngược lại 1 lần với 75% sát thương!'
    },
    {
        num: 32, id: 'gear_frost_ammo_s', name: 'Đạn Băng Giá',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: ['ice', 'sprayer'],
        desc: 'Đòn đánh của bạn làm Chậm 20% tốc độ di chuyển của kẻ địch trong 1.5s (hồi chiêu 3s trên cùng mục tiêu).'
    },
    {
        num: 33, id: 'gear_burn_ammo_s', name: 'Đạn Nhiệt Hạch',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: ['furnace', 'sprayer', 'shortgunATK'],
        desc: 'Đòn đánh của bạn thiêu đốt mục tiêu, gây thêm 0.3 sát thương Đốt trong 2 giây (làm mới thời gian khi trúng đạn).'
    },
    {
        num: 34, id: 'gear_shield_breaker_g', name: 'Đạn Phá Giáp',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Gây x2 sát thương lên Giáp Trắng và Vật Triệu Hồi / Tường Chắn. Khi bắn vào kẻ địch có Khiên chắn đạn, làm vỡ Khiên VÀ 35% sát thương vẫn xuyên qua trừ thẳng vào máu!'
    },
    {
        num: 35, id: 'gear_sniper_scope_g', name: 'Tay Súng Thiện Xạ',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['tank', 'shortgunATK', 'storm'],
        desc: 'Tốc độ bay của đạn tăng +35%. Viên đạn bay quãng đường càng xa thì sát thương càng tăng, tối đa +25% Sát thương khi trúng ở nửa sân bên kia!'
    },
    {
        num: 36, id: 'gear_extra_mag_s', name: 'Băng Đạn Mở Rộng',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: GEAR_BODY_GROUPS.ENERGY_HEAT,
        cond: (p) => {
            if (!p) return false;
            const mod = MODULES.BODY.find(b => b.id === p.weapon);
            const am = mod && mod.stats ? mod.stats.ammo : p.maxAmmo;
            return am > 0 && am <= 12;
        },
        desc: 'Tăng băng đạn tối đa thêm +2 viên (riêng các xe chỉ có 1 viên đạn gốc thì được +1 viên và +15% tốc nạp).'
    },
    {
        num: 37, id: 'gear_fast_reload_g', name: 'Nạp Đạn Ma Thuật',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: GEAR_BODY_GROUPS.ENERGY_HEAT,
        cond: (p) => {
            if (!p) return false;
            const mod = MODULES.BODY.find(b => b.id === p.weapon);
            const am = mod && mod.stats ? mod.stats.ammo : p.maxAmmo;
            return am > 0 && am < 100;
        },
        desc: 'Tốc độ nạp đạn nhanh hơn +35%. Mỗi khi bắn trúng trực tiếp xe kẻ địch, lập tức rút ngắn 0.25s thời gian nạp viên đạn tiếp theo.'
    },
    {
        num: 38, id: 'gear_energy_core_g', name: 'Lõi Năng Lượng Vĩnh Cửu',
        tier: 'GOLD', stage: 'ALL',
        bodies: GEAR_BODY_GROUPS.ENERGY_HEAT,
        desc: 'Tăng +30% tốc độ hồi Năng Lượng / Nội Năng (hoặc hạ Nhiệt nhanh hơn +30%) giúp tung kỹ năng liên tục hơn!'
    },
    {
        num: 39, id: 'gear_first_strike_s', name: 'Phát Bắn Đầu Tiên',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Phát đạn / kỹ năng đầu tiên bạn tung ra trong mỗi hiệp đấu (và làm mới lại sau mỗi 10s) sẽ bay cực nhanh (+50% tốc) và gây thêm +0.8 sát thương.'
    },
    {
        num: 40, id: 'gear_mini_split_g', name: 'Đạn Phân Hạch Nhỏ',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['cluster_gun', 'big_bullet'],
        desc: 'Khi đạn của bạn bắn trúng xe địch, nó văng ra 2 mảnh đạn nhỏ sang hai bên Trái – Phải dọc theo làn của địch (gây 0.25 sát thương lên vật triệu hồi/phân thân đứng cạnh)!'
    },

    // =========================================================================
    // 🛡️ NHÓM 4: PHÒNG THỦ, THOÁT HIỂM & SINH TỒN (#41 – #50)
    // =========================================================================
    {
        num: 41, id: 'gear_just_a_prank_g', name: 'Chỉ Là 1 Trò Đùa!',
        tier: 'GOLD', stage: 'MID_LATE',
        excludeBodies: ['joker', 'blood_lord', 'basic'],
        desc: 'Khi nhận đòn sát thương chí tử (1 lần mỗi hiệp), bạn không chết mà dịch chuyển ngẫu nhiên sang vị trí khác trên làn ngang, nhận Bất Tử 2.0s và để lại 1 hộp quà nổ trêu ngươi tại chỗ cũ!'
    },
    {
        num: 42, id: 'gear_start_shield_s', name: 'Lá Chắn Khởi Đầu',
        tier: 'SILVER', stage: 'ALL', familyId: 'fam_shield_gen',
        incompatibleWith: ['gear_starter_g', 'gear_starter_p'],
        desc: 'Bắt đầu mỗi hiệp đấu với 1 lớp Khiên chắn đạn tồn tại suốt hiệp (cho đến khi bị bắn vỡ).'
    },
    {
        num: 43, id: 'gear_auto_shield_p', name: 'Máy Tạo Khiên Tự Động',
        tier: 'PRISMATIC', stage: 'ALL', familyId: 'fam_shield_gen',
        excludeBodies: ['tank'],
        incompatibleWith: ['gear_starter_g', 'gear_starter_p'],
        desc: 'Đầu hiệp nhận 1 lớp Khiên. Cứ sau mỗi 12 giây trong trận đấu, tự động tái tạo 1 lớp Khiên chắn đạn mới (tối đa tích trữ 2 lớp Khiên cùng lúc)!'
    },
    {
        num: 44, id: 'gear_thorn_armor_g', name: 'Giáp Phản Đòn',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Nhận +1.5 Max HP. Mỗi khi nhận sát thương trực tiếp từ kẻ địch, giảm 10% sát thương đó và tự động phóng trả 1 tia năng lượng phản đòn gây 0.4 sát thương (CD: 1.5s).'
    },
    {
        num: 45, id: 'gear_bullet_eater_g', name: 'Hấp Thụ Đạn Đạo',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Cứ mỗi 6 giây, xe của bạn bật lớp màng từ trường trong 1.5s: Viên đạn thường đầu tiên của địch chạm vào màng này sẽ bị nuốt chửng (0 sát thương) và chuyển thành +0.5 HP!'
    },
    {
        num: 46, id: 'gear_sudden_death_s', name: 'Chiến Binh Vòng Bo (Đột Tử)',
        tier: 'SILVER', stage: 'ALL',
        incompatibleWith: ['gear_early_zone_g'],
        desc: 'Khi trận đấu bước sang giây thứ 45 (hoặc khi Đột Tử bắt đầu), bạn được hồi ngay +2.5 HP, nhận 1 lớp Khiên và tăng +25% Tốc độ bắn!'
    },
    {
        num: 47, id: 'gear_anti_burst_g', name: 'Giáp Chống Sốc Sát Thương',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['the_strongest', 'necromancer', 'kiem_vu'],
        incompatibleWith: ['gear_glass_cannon_g'],
        desc: 'Bạn không thể bị mất quá 35% Max HP chỉ từ một đòn đánh đơn lẻ (khắc chế cực mạnh các tướng bắn đau 1 phát)!'
    },
    {
        num: 48, id: 'gear_combat_regen_s', name: 'Hồi Máu Chiến Trường',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Sau 6 giây không nhận sát thương từ kẻ địch, xe của bạn tự động hồi phục +0.15 HP mỗi giây cho đến khi bị bắn trúng.'
    },
    {
        num: 49, id: 'gear_omnivamp_p', name: 'Hút Máu Toàn Phần',
        tier: 'PRISMATIC', stage: 'ALL',
        desc: 'Nhận 30% Hút Máu từ mọi sát thương gây ra lên tướng địch. Nếu máu đang đầy, lượng máu hút dư sẽ chuyển thành Giáp Trắng (tối đa 3.0 Giáp)!'
    },
    {
        num: 50, id: 'gear_tenacity_s', name: 'Ý Chí Bất Khuất',
        tier: 'SILVER', stage: 'ALL',
        excludeBodies: ['juggernaut'],
        desc: 'Giảm 40% thời gian chịu đựng mọi hiệu ứng Khống Chế (Choáng, Đóng băng, Làm chậm, Câm lặng, Trói) và giảm 30% sát thương theo thời gian (Đốt, Axit, Chảy máu).'
    },

    // =========================================================================
    // ⚔️ NHÓM 5: G.E.A.R THEO 4 VAI TRÒ CHÍNH (#51 – #66)
    // =========================================================================
    {
        num: 51, id: 'gear_duel_instinct_s', name: 'Bản Năng Đấu Sĩ',
        tier: 'SILVER', stage: 'ALL', roleReq: 'Đối Đầu', familyId: 'fam_duel_dmg',
        desc: 'Khi bạn đứng ở vị trí cùng trục X (lệch ngang < 40px) đối diện trực tiếp với xe kẻ địch, đòn bắn của bạn gây thêm +18% Sát thương.'
    },
    {
        num: 52, id: 'gear_duel_master_g', name: 'Chuyên Gia Quyết Đấu',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Đối Đầu', familyId: 'fam_duel_dmg',
        desc: 'Đứng đối diện trực tiếp với kẻ địch (lệch ngang < 45px) giúp tăng +25% Sát thương và +20% Tốc độ bắn. Mỗi phát trúng liên tiếp cộng dồn thêm +4% sát thương (tối đa +20%).'
    },
    {
        num: 53, id: 'gear_duel_frenzy_p', name: 'Xung Kích Khát Máu',
        tier: 'PRISMATIC', stage: 'MID_LATE', roleReq: 'Đối Đầu',
        desc: 'Khi máu kẻ địch xuống dưới 50% HP, đạn của bạn bay nhanh hơn +40%, gây thêm +30% Sát thương và xuyên qua các vật triệu hồi để găm thẳng vào tướng địch!'
    },
    {
        num: 54, id: 'gear_duel_honor_g', name: 'Đấu Tay Đôi Công Bằng',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Đối Đầu',
        desc: 'Gây thêm +30% Sát thương lên kẻ địch nếu trên sân của địch đang có Vật Triệu Hồi hoặc Tường Chắn, đồng thời nhận giảm 25% sát thương từ mọi vật triệu hồi của địch!'
    },
    {
        num: 55, id: 'gear_ctrl_zone_s', name: 'Trường Lực Kiểm Soát',
        tier: 'SILVER', stage: 'ALL', roleReq: 'Kiểm Soát', familyId: 'fam_ctrl_zone',
        desc: 'Mọi Vùng hiệu ứng mặt đất bạn tạo ra có bán kính lớn hơn +25% và tồn tại lâu hơn +1.0 giây (Đạn Băng Giá làm chậm lâu hơn +30%).'
    },
    {
        num: 56, id: 'gear_ctrl_master_g', name: 'Bậc Thầy Phong Tỏa',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Kiểm Soát', familyId: 'fam_ctrl_zone',
        desc: 'Kẻ địch đang chịu Khống Chế (Chậm, Choáng, Băng, Câm lặng, Trói, Đốt, Độc) nhận thêm +20% sát thương từ đòn của bạn và mất thêm 0.15 HP mỗi giây!'
    },
    {
        num: 57, id: 'gear_ctrl_prison_p', name: 'Ngục Tù Không Gian 1D',
        tier: 'PRISMATIC', stage: 'MID_LATE', roleReq: 'Kiểm Soát',
        desc: 'Mỗi 10 giây, phát đạn trúng đích tiếp theo sẽ dựng lên 2 Cột Chắn Năng Lượng ở hai bên sườn kẻ địch (cách địch 85px Trái/Phải) trong 2.5s, khóa không cho địch chạy dạt ra mép!'
    },
    {
        num: 58, id: 'gear_ctrl_jammer_g', name: 'Nhiễu Sóng Tâm Trí',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Kiểm Soát',
        desc: 'Mỗi đòn bắn trúng kẻ địch làm tốc độ nạp đạn / hồi năng lượng của kẻ địch đó cũng bị giảm đi 30% trong 2.0 giây.'
    },
    {
        num: 59, id: 'gear_mob_step_s', name: 'Bộ Pháp Linh Hoạt',
        tier: 'SILVER', stage: 'ALL', roleReq: 'Cơ Động', familyId: 'fam_mob_dash',
        desc: 'Tăng +12% Tốc độ di chuyển. Mỗi khi đổi hướng di chuyển (Trái ↔ Phải) hoặc dùng kỹ năng Lướt/Dịch chuyển, nhận +30% Tốc chạy trong 1.2s (CD: 2.5s).'
    },
    {
        num: 60, id: 'gear_mob_mirage_g', name: 'Ảo Ảnh Gia Tốc',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Cơ Động', familyId: 'fam_mob_dash',
        desc: 'Mỗi khi Lướt / Dịch chuyển / Bay lên (hoặc chạy đủ 250px), để lại 1 Phân Ảnh tồn tại 1.5s tại vị trí cũ để đỡ hộ 1 viên đạn thường của địch và phát bắn kế tiếp +25% Sát thương!'
    },
    {
        num: 61, id: 'gear_mob_phantom_p', name: 'Siêu Thanh Vô Ảnh',
        tier: 'PRISMATIC', stage: 'ALL', roleReq: 'Cơ Động',
        desc: 'Tăng +20% Tốc độ di chuyển. Cứ mỗi 20% Tốc độ di chuyển cộng thêm (so với tốc gốc 3.5), nhận thêm +12% Sát thương và +8% tỉ lệ Tự Né hoàn toàn đạn thường (tối đa 25% né)!'
    },
    {
        num: 62, id: 'gear_mob_run_gun_s', name: 'Bắn Khi Đang Chạy',
        tier: 'SILVER', stage: 'ALL', roleReq: 'Cơ Động',
        desc: 'Khi vừa di chuyển vừa bắn, đạn bay nhanh hơn +25% (khó né hơn hẳn khi thả diều).'
    },
    {
        num: 63, id: 'gear_surv_plate_s', name: 'Giáp Cốt Thép',
        tier: 'SILVER', stage: 'ALL', roleReq: 'Sinh Tồn', familyId: 'fam_surv_armor',
        desc: 'Nhận ngay +1.5 Max HP và giảm 0.12 sát thương từ mọi đòn đánh trực tiếp (tối thiểu địch vẫn gây 0.1 dame).'
    },
    {
        num: 64, id: 'gear_surv_fortress_g', name: 'Pháo Đài Sinh Học',
        tier: 'GOLD', stage: 'ALL', roleReq: 'Sinh Tồn', familyId: 'fam_surv_armor',
        desc: 'Nhận +1.5 Max HP. Khi máu dưới 50% Max HP: giảm 15% sát thương nhận vào, tự động hồi +0.2 HP/giây và mọi hiệu ứng Hồi Máu / Tạo Giáp của bạn tăng +30% hiệu quả!'
    },
    {
        num: 65, id: 'gear_surv_titan_p', name: 'Trái Tim Bất Diệt',
        tier: 'PRISMATIC', stage: 'ALL', roleReq: 'Sinh Tồn',
        desc: 'Tăng +35% Max HP hiện tại (cộng thêm cả cho các lần mua Giáp Thép sau đó). Đòn bắn của bạn gây thêm sát thương cộng thẳng bằng 6% Max HP của bản thân!'
    },
    {
        num: 66, id: 'gear_surv_quake_g', name: 'Phản Chấn Hạng Nặng',
        tier: 'GOLD', stage: 'MID_LATE', roleReq: 'Sinh Tồn',
        desc: 'Mỗi khi mất đủ 2.0 HP (tích lũy trong hiệp), xe tự động phóng ra một Sóng Chấn Động toàn làn xóa sạch đạn thường đang bay tới trước mặt và gây 1.0 sát thương + Làm Chậm lên địch!'
    },

    // =========================================================================
    // 🧩 NHÓM 6: G.E.A.R THEO NHÓM HỆ & CAN THIỆP SÂN ĐẤU (#67 – #82)
    // =========================================================================
    {
        num: 67, id: 'gear_summon_buff_s', name: 'Cường Hóa Triệu Hồi',
        tier: 'SILVER', stage: 'ALL', familyId: 'fam_summon',
        bodies: GEAR_BODY_GROUPS.SUMMON,
        desc: 'Mọi Vật Triệu Hồi / Công Trình / Phân Thân của bạn được tăng +30% Máu tối đa và +20% Sát thương / Thời gian tồn tại.'
    },
    {
        num: 68, id: 'gear_summon_army_g', name: 'Quân Đoàn Cơ Giới Hóa',
        tier: 'GOLD', stage: 'ALL', familyId: 'fam_summon',
        bodies: GEAR_BODY_GROUPS.SUMMON,
        desc: 'Vật Triệu Hồi của bạn có +50% Máu, +30% Tốc bắn và khi vừa được gọi ra sẽ có sẵn 1 lớp Khiên chắn đạn tồn tại 3s!'
    },
    {
        num: 69, id: 'gear_summon_overload_p', name: 'Bầy Đàn Tối Thượng',
        tier: 'PRISMATIC', stage: 'MID_LATE', familyId: 'fam_summon',
        bodies: GEAR_BODY_GROUPS.SUMMON_OVERLOAD,
        desc: 'Tăng giới hạn số lượng tối đa của Ụ Súng / Drone / Vong Linh / Bùa / Clone lên +1 đơn vị, giảm 35% hồi chiêu/hồi sinh và nổ gây 0.8 sát thương điện khi bị phá hủy!'
    },
    {
        num: 70, id: 'gear_free_drone_g', name: 'Trợ Thủ Drone Tự Động',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['inventor', 'creator'],
        desc: 'Bạn được cấp 1 chiếc Drone Không Kích mini bay lơ lửng phía trên xe suốt trận (không thể bị bắn trúng), tự động bắn 1 viên đạn ngắm vào kẻ địch mỗi 2.5 giây gây 0.45 sát thương!'
    },
    {
        num: 71, id: 'gear_sword_aura_g', name: 'Kiếm Khí Hộ Thể',
        tier: 'GOLD', stage: 'ALL',
        bodies: GEAR_BODY_GROUPS.SWORD,
        desc: 'Cứ mỗi 4 giây, một thanh phi kiếm xoay quanh xe bạn sẽ tự động chém tan 1 viên đạn thường của địch bay tới gần và phóng trả 1 luồng kiếm khí gây 0.6 sát thương!'
    },
    {
        num: 72, id: 'gear_ram_master_g', name: 'Lao Húc Không Phanh',
        tier: 'GOLD', stage: 'ALL',
        bodies: GEAR_BODY_GROUPS.RAM,
        desc: 'Khi thực hiện kỹ năng Lao lên phía trước, bạn nhận thêm +1.0 Giáp Trắng (tối đa 3.0) và phát sóng chấn động làm Chậm kẻ địch trong 1.5s!'
    },
    {
        num: 73, id: 'gear_fast_charge_s', name: 'Tụ Lực Siêu Tốc',
        tier: 'SILVER', stage: 'ALL',
        bodies: GEAR_BODY_GROUPS.HOLD_CHARGE,
        desc: 'Giảm 30% thời gian cần giữ nút Bắn để đạt tối đa lực tụ hoặc kết ấn kỹ năng!'
    },
    {
        num: 74, id: 'gear_minefield_s', name: 'Bẫy Mìn Giữa Sân',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Cứ mỗi 10 giây thả 1 Quả Mìn trên làn kẻ địch (lệch khỏi chân địch, mất 1s mới kích hoạt, tồn tại 10s, tối đa 2). Địch dẫm phải nổ 0.6 sát thương + đẩy trượt ngang. Đạn địch bắn trúng sẽ phá mìn.'
    },
    {
        num: 75, id: 'gear_artillery_call_g', name: 'Pháo Kích Hỗ Trợ',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Cứ mỗi 8 giây, gọi 2 quả đạn Pháo Kích (có vòng cảnh báo đỏ 1.5s) rơi thẳng xuống vị trí hiện tại trên làn của kẻ địch (mỗi quả 0.7 sát thương)!'
    },
    {
        num: 76, id: 'gear_map_storm_p', name: 'Cơn Bão Từ Trường (Sửa Đổi Sân)',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        desc: 'Biến sân đấu thành Vùng Bão Sét: Cứ mỗi 6 giây, 2 tia sét ngẫu nhiên giáng xuống làn kẻ địch (1.0 dame + Choáng 0.4s); riêng bạn đứng vào vết sét trên làn mình được hồi +0.5 HP và +25% tốc bắn!'
    },
    {
        num: 77, id: 'gear_auto_wall_g', name: 'Tường Chắn Di Động',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['sniper', 'creator'],
        desc: 'Đầu hiệp và sau mỗi 14 giây, trước mặt bạn tự động dựng lên 1 Bức Tường Chắn Ngắn (3.0 HP, tồn tại 6s) chặn đạn thường của địch (đạn của bạn bắn xuyên qua bình thường)!'
    },
    {
        num: 78, id: 'gear_early_zone_g', name: 'Khế Ước Đột Tử (Sớm Bo)',
        tier: 'GOLD', stage: 'ALL',
        incompatibleWith: ['gear_sudden_death_s'],
        desc: 'Thời gian bắt đầu Đột Tử (Vòng Bo thu hẹp) rút ngắn từ 60s xuống còn 35s! Bản thân bạn nhận giảm 50% sát thương đốt từ Bo và tăng +30% Sát thương ngay khi Bo thu hẹp!'
    },
    {
        num: 79, id: 'gear_center_prism_p', name: 'Gương Phản Xạ Giữa Sân',
        tier: 'PRISMATIC', stage: 'ALL',
        excludeBodies: ['tank', 'storm', 'steel_hook'],
        desc: 'Tạo ra 1 Lăng Kính Khúc Xạ trôi qua lại chậm rãi ở chính giữa bản đồ: Khi bạn bắn đạn đi xuyên qua Lăng Kính này, viên đạn sẽ nhân đôi thành 2 viên và tăng +25% sát thương!'
    },
    {
        num: 80, id: 'gear_giant_slayer_s', name: 'Thợ Săn Khổng Lồ',
        tier: 'SILVER', stage: 'MID_LATE',
        desc: 'Nếu đối thủ có Max HP cao hơn bạn (hoặc kích thước xe > 30×30), đòn đánh của bạn gây thêm +20% sát thương (tăng lên +35% nếu máu địch nhiều hơn bạn từ 4 HP trở lên).'
    },
    {
        num: 81, id: 'gear_ammo_to_gold_s', name: 'Thuật Giả Kim Đạn Đạo',
        tier: 'SILVER', stage: 'EARLY_MID',
        desc: 'Trong mỗi hiệp đấu, cứ mỗi 15 lần bạn bắn trúng xe kẻ địch, một đồng xu vàng +$10 sẽ văng ra và tự bay về túi bạn (tối đa +$40 mỗi hiệp)!'
    },
    {
        num: 82, id: 'gear_blood_pact_p', name: 'Đổi Máu Lấy Sức Mạnh',
        tier: 'PRISMATIC', stage: 'ALL',
        cond: (p) => p && (p.maxHp || 0) >= 5,
        desc: 'Mỗi khi mua Giáp Thép (+1 HP) trong Shop (hoặc nhận thêm Max HP từ mọi nguồn), bạn được cộng thêm vĩnh viễn +12% Sát thương và +8% Tốc độ bắn cho mỗi 1 HP tăng thêm!'
    },

    // =========================================================================
    // 🌟 NHÓM 7: G.E.A.R ĐỘC QUYỀN THEO XE (HERO G.E.A.R — #83 – #100)
    // =========================================================================
    {
        num: 83, id: 'gear_hero_basic_g', name: 'Đạn Pháo Cải Tiến',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['basic'],
        incompatibleWith: ['gear_protagonist_p'],
        cond: (p) => p && !p.mainEgg && !p.mainAwakened && !p.isMainChar,
        desc: 'Cứ mỗi viên đạn thứ 4 của Cơ Bản sẽ biến thành Đạn Pháo Liên Hợp: To gấp đôi, gây x1.5 sát thương (+0.3 nổ lan) và hồi lại ngay +0.5 HP khi trúng đích!'
    },
    {
        num: 84, id: 'gear_hero_tank_g', name: 'Chiến Xa Thiết Giáp',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['tank'],
        desc: 'Khi đang Lao húc, bạn có thể bẻ lái lách ngang Trái/Phải nhẹ (35px) để đón đầu kẻ địch đang né, đồng thời mỗi khi khiên nội tại của TANK vỡ sẽ phát nổ đẩy trượt và làm chậm địch!'
    },
    {
        num: 85, id: 'gear_hero_ice_g', name: 'Độ Không Tuyệt Đối',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['ice'],
        desc: 'Bắn trúng kẻ địch đang đứng trên Vùng Băng đủ 4 phát sẽ Đóng Băng cứng mục tiêu trong 1.25 giây (CD: 8s)!'
    },
    {
        num: 86, id: 'gear_hero_shotgun_g', name: 'Bổ Củi Đôi',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['shotgun', 'shortgunATK'],
        desc: 'Mỗi phát bắn Shotgun sẽ đẩy giật nhẹ xe bạn lướt ngang theo hướng bạn đang bấm di chuyển (giúp vừa bắn vừa lướt né đạn), và tăng +2 viên đạn tỏa cho mỗi phát bắn!'
    },
    {
        num: 87, id: 'gear_hero_overload_g', name: 'Phản Ứng Dây Chuyền',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['overload'],
        desc: 'Thời gian tự tụ thanh năng lượng giảm từ 2.4s xuống 1.8s. Khi Đạn Sạc bắn trúng kẻ địch, nó sẽ lập tức nạp lại 40% thanh năng lượng cho phát tiếp theo!'
    },
    {
        num: 88, id: 'gear_hero_lazer_g', name: 'Tia Khúc Xạ Gương',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['lazer_charge', 'lazer_auto', 'lazer_beam'],
        desc: 'Khi tia Laser của bạn bắn chạm vào tường biên phía sau lưng địch, nó sẽ phản chiếu chéo ngược lại 1 tia phụ (50% dame) quét qua làn của địch!'
    },
    {
        num: 89, id: 'gear_hero_portal_g', name: 'Ma Trận Cổng Xoáy',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['portal'],
        desc: 'Mỗi khi bạn Dịch chuyển hoặc đi xuyên mép màn hình, tại vị trí vừa xuất hiện sẽ phóng ra một vòng sóng không gian xóa đạn thường xung quanh và kéo lệch kẻ địch 30px về cùng trục X với bạn!'
    },
    {
        num: 90, id: 'gear_hero_ghost_g', name: 'Ám Ảnh Kinh Hoàng',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['ghost', 'shadow_hunter'],
        desc: 'Thời gian Vô Ảnh / Vô Hình tăng thêm +0.75 giây. Phát đạn đầu tiên bắn ra khi thoát tàng hình sẽ Chí Mạng (x1.4 dame) và hồi lại 1 viên đạn!'
    },
    {
        num: 91, id: 'gear_hero_swords_p', name: 'Vạn Kiếm Triều Tông',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        bodies: ['blade_god', 'van_kiem', 'kiem_khach', 'kiem_su'],
        desc: 'Tăng +25% tốc độ phóng kiếm. Cứ mỗi 6 thanh kiếm bạn bắn ra, một thanh Thần Kiếm Khổng Lồ sẽ tự động giáng từ trên trời xuống thẳng vị trí của kẻ địch gây 1.5 sát thương diện rộng!'
    },
    {
        num: 92, id: 'gear_hero_jjk_p', name: 'Lãnh Địa Bất Diệt',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        bodies: ['the_strongest', 'sukuna'],
        desc: 'Khi bạn đang đứng giữ nút Niệm kỹ năng / Mở Lãnh Địa, bạn nhận 1 lớp Khiên Chú Lực chặn 1 đòn đánh để không bị trúng đạn ngắt niệm (CD: 10s)!'
    },
    {
        num: 93, id: 'gear_hero_marksman_g', name: 'Phát Bắn Bách Phát Bách Trúng',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['sniper', 'cung', 'revolver', 'raven_oca'],
        desc: 'Nếu bạn bắn trúng liên tiếp 2 phát mà không trượt phát nào, phát bắn thứ 3 sẽ được cường hóa gây thêm +0.8 sát thương chuẩn (xuyên Khiên) và làm Choáng 0.5s!'
    },
    {
        num: 94, id: 'gear_hero_time_g', name: 'Dây Cót Vĩnh Cửu',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['paradox', 'chrononeo'],
        desc: 'Giảm 20% thời gian hồi đạn / kỹ năng. Mỗi khi bạn Tua Ngược hoặc dịch chuyển xa (CD: 3s), nhận ngay +1.0 Giáp Trắng và bắn ra 2 Mảnh Thời Gian (mỗi mảnh 0.4 sát thương)!'
    },
    {
        num: 95, id: 'gear_hero_family_p', name: 'Gia Tộc Cơ Khí Alano',
        tier: 'PRISMATIC', stage: 'EARLY_MID',
        bodies: ['inventor', 'engineer', 'genius', 'creator'],
        desc: 'Đầu mỗi hiệp đấu tự động nhận thêm +3 Linh Kiện & Bánh Răng. Toàn bộ công trình/vật triệu hồi của bạn được miễn nhiễm hoàn toàn với đóng băng EMP và tự hồi 0.3 HP/s!'
    },
    {
        num: 96, id: 'gear_hero_dj_g', name: 'Sân Khấu Siêu Sao',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['dj'],
        desc: 'Cứ mỗi 4 phát bắn, DJ tung 1 nhịp Bass Drop: hồi +0.35 HP, gây 0.35 sát thương âm thanh và làm Chậm kẻ địch 1.25s!'
    },
    {
        num: 97, id: 'gear_hero_hook_g', name: 'Xích Tử Thần Nung Đỏ',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['steel_hook', 'death_lock'],
        desc: 'Đạn Cấm Chế của Trói Chết bay nhanh hơn +35%; kẻ địch bị trúng xích của cả hai sẽ bị Thiêu Đốt và Câm Lặng thêm 1.0s!'
    },
    {
        num: 98, id: 'gear_hero_twins_g', name: 'Đồng Tâm Hiệp Lực',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['gemini', 'mirror', 'jet_pilot', 'clone'],
        desc: 'Khi bản thể chính và bản sao/Phi Ảnh của bạn đứng cách nhau < 120px (hoặc ngay sau khi đổi quyền điều khiển/hoán đổi vị trí), cả hai nhận +25% Sát thương và giảm 25% sát thương nhận vào trong 2.5s!'
    },
    {
        num: 99, id: 'gear_hero_blood_g', name: 'Huyết Hải Vô Biên',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['blood_lord', 'berserker', 'healer'],
        desc: 'Tăng +2.5 Max HP mỗi hiệp: Huyết Hải dày hơn giúp trụ lâu để tích đầy Bể Máu / Huyết Chiến / Năng Lượng Sinh Mệnh!'
    },
    {
        num: 100, id: 'gear_hero_martial_p', name: 'Bậc Thầy Võ Đạo',
        tier: 'PRISMATIC', stage: 'ALL',
        bodies: ['flower_shadow', 'kiem_vu', 'tsukiyo', 'kazuki'],
        desc: 'Võ Đạo Hộ Thể: cứ mỗi 4 giây, đòn tấn công kế tiếp của bạn (Cường Hóa / Tâm Kiếm / Nhẫn Đạo / Loạn Vũ...) cho ngay 1 lớp Khiên và hồi +0.6 HP!'
    },

    // =========================================================================
    // 🚀 NHÓM 8: 6 G.E.A.R KHỞI ĐẦU MỚI (#101 – #106)
    // =========================================================================
    {
        num: 101, id: 'gear_starter_s', name: 'Gói Khởi Đầu',
        tier: 'SILVER', stage: 'EARLY', familyId: 'fam_starter',
        desc: 'Nhận ngay $30 vàng và 1 lớp Khiên ở Hiệp đấu đầu tiên (Round 1).'
    },
    {
        num: 102, id: 'gear_starter_g', name: 'Gói Khởi Đầu++',
        tier: 'GOLD', stage: 'EARLY', familyId: 'fam_starter',
        incompatibleWith: ['gear_start_shield_s', 'gear_auto_shield_p'],
        desc: 'Nhận ngay $30 vàng và nhận 1 lớp Khiên ở đầu TẤT CẢ các Hiệp đấu (R).'
    },
    {
        num: 103, id: 'gear_starter_p', name: 'Gói Khởi Đầu Tối Thượng',
        tier: 'PRISMATIC', stage: 'EARLY', familyId: 'fam_starter',
        incompatibleWith: ['gear_start_shield_s', 'gear_auto_shield_p'],
        desc: 'Nhận ngay $45 vàng, nhận 1 lượt đổi lại (Reroll miễn phí) ở mỗi Shop và nhận 1 lớp Khiên ở đầu TẤT CẢ các Hiệp đấu (R).'
    },
    {
        num: 104, id: 'gear_glitter_next_s', name: 'Tiền Vàng Và Lấp Lánh',
        tier: 'SILVER', stage: 'EARLY',
        cond: (p) => p && Array.isArray(p.gearTiers) && p.gearTiers[1] !== 'PRISMATIC',
        desc: 'Nhận ngay $15 vàng. Hiệu ứng đặc biệt: Ép buộc mốc chọn G.E.A.R tiếp theo của bạn chắc chắn biến thành bậc 💎 LĂNG KÍNH!'
    },
    {
        num: 105, id: 'gear_money_lv2_g', name: 'Tiền Mua Quyền',
        tier: 'GOLD', stage: 'EARLY',
        bodies: ['money_tank'],
        desc: 'Xe Tiền lập tức được tăng thẳng +2 Cấp Độ (LV) trong cửa hàng nâng cấp cấp độ ngay từ đầu Hiệp 1!'
    },
    {
        num: 106, id: 'gear_protagonist_p', name: 'Ta Là Nhân Vật Chính',
        tier: 'PRISMATIC', stage: 'EARLY',
        bodies: ['basic'],
        incompatibleWith: ['gear_hero_basic_g'],
        cond: (p) => p && !p.mainEgg && !p.mainAwakened && !p.isMainChar,
        desc: 'Biến thành MAIN (xe ẩn). Đổi lại, đối thủ lập tức nhận ngay $200 vàng!'
    },

    // =========================================================================
    // ⚡ NHÓM 9: ĐÒN TẤN CÔNG KÈM HIỆU ỨNG MỚI & ĐẠN ĐẠO ĐỘT BIẾN (#107 – #122)
    // =========================================================================
    {
        num: 107, id: 'gear_atk_chain_lightning_g', name: 'Đạn Giật Sét (Chain Volt)',
        tier: 'GOLD', stage: 'ALL', familyId: 'fam_atk_volt',
        desc: 'Mỗi phát bắn thứ 3 trúng đích sẽ phóng ra hồ quang điện giật lan giữa tướng địch và mọi Vật Triệu Hồi/Tường Chắn của địch, gây thêm 0.45 sát thương điện và làm Tê Liệt nhẹ 0.3s!'
    },
    {
        num: 108, id: 'gear_atk_thunder_god_p', name: 'Lôi Thần Giáng Thế',
        tier: 'PRISMATIC', stage: 'MID_LATE', familyId: 'fam_atk_volt',
        desc: 'Đòn bắn tích Điện Tích lên kẻ địch; đủ 3 Điện Tích sẽ giáng 1 Cột Sét Phán Quyết từ đỉnh màn hình xuống thẳng đầu địch gây 1.3 sát thương chuẩn, xóa 1 lớp Khiên và làm Choáng 0.6s!'
    },
    {
        num: 109, id: 'gear_atk_boomerang_g', name: 'Đạn Hồi Tuyển (Boomerang)',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: GEAR_BODY_GROUPS.HITSCAN_NO_BOUNCE,
        desc: 'Cứ mỗi 4 giây, phát đạn tiếp theo khi bay hết tầm sẽ tự động đảo chiều bay vòng ngược trở lại vị trí xe của bạn với 85% sát thương và kéo nhẹ kẻ địch trên đường về!'
    },
    {
        num: 110, id: 'gear_atk_blackhole_p', name: 'Đạn Hố Đen (Singularity)',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        desc: 'Cứ mỗi 9 giây, phát đạn trúng đích tiếp theo tạo ra một Hố Đen Trọng Trường tại vị trí kẻ địch trong 2.0s: liên tục hút ghì kẻ địch về tâm hố đen, làm chậm 45% và nổ gây 0.8 sát thương khi sập xuống!'
    },
    {
        num: 111, id: 'gear_atk_venom_s', name: 'Đạn Độc Tố Cộng Dồn',
        tier: 'SILVER', stage: 'ALL', familyId: 'fam_atk_venom',
        excludeBodies: ['acid'],
        desc: 'Đòn bắn tiêm Nọc Độc lên kẻ địch (tối đa 5 tầng, tồn tại 4s): mỗi tầng gây 0.08 sát thương/giây và làm giảm 6% hiệu quả Hồi Máu & Tạo Giáp của địch (tối đa giảm 30%).'
    },
    {
        num: 112, id: 'gear_atk_plague_g', name: 'Đạn Dịch Hạch Bùng Phát',
        tier: 'GOLD', stage: 'ALL', familyId: 'fam_atk_venom',
        excludeBodies: ['acid'],
        desc: 'Tiêm Độc Tố mỗi đòn trúng; khi tích đủ 4 tầng Độc Tố lên kẻ địch, vết độc lập tức phát nổ gây 0.9 sát thương độc, để lại vũng Axit dưới chân địch 2.5s và hồi cho bạn +0.4 HP!'
    },
    {
        num: 113, id: 'gear_atk_crit_s', name: 'Lăng Kính Chí Mạng',
        tier: 'SILVER', stage: 'ALL', familyId: 'fam_atk_crit',
        desc: 'Mọi đòn bắn của bạn có 25% tỉ lệ Bạo Kích gây x1.5 sát thương (hiển thị tia chớp đỏ Chí Mạng khi trúng đích).'
    },
    {
        num: 114, id: 'gear_atk_crit_master_p', name: 'Tuyệt Kỹ Tử Điểm',
        tier: 'PRISMATIC', stage: 'MID_LATE', familyId: 'fam_atk_crit',
        desc: 'Tăng 35% tỉ lệ Bạo Kích và sát thương Bạo Kích tăng lên x1.85! Mỗi khi Bạo Kích thành công, lập tức hồi ngay 1 viên đạn (hoặc 15% Năng Lượng) và tăng +20% tốc bắn trong 1.5s!'
    },
    {
        num: 115, id: 'gear_atk_death_mark_g', name: 'Ấn Tử Thần (3 Đòn)',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Bắn trúng kẻ địch sẽ khắc Ấn Tử Thần; đòn trúng thứ 3 kích nổ Ấn gây sát thương bằng 12% Máu đã mất của kẻ địch (tối thiểu 0.5, tối đa 1.8 sát thương) và tăng +20% tốc chạy cho bạn trong 1.5s!'
    },
    {
        num: 116, id: 'gear_atk_shatter_ice_g', name: 'Mảnh Vỡ Kim Cương',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Khi đạn của bạn bắn trúng kẻ địch đang bị Làm Chậm, Đóng Băng, Câm Lặng hoặc Choáng, viên đạn nổ tung thành 5 mảnh pha lê sắc nhọn gây thêm +0.45 sát thương nổ!'
    },
    {
        num: 117, id: 'gear_atk_homing_g', name: 'Đạn Dẫn Đường Từ Tính',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: GEAR_BODY_GROUPS.HITSCAN_NO_BOUNCE,
        desc: 'Toàn bộ đạn bay của bạn được gắn chip dẫn đường từ tính: tự động uốn cong quỹ đạo nhẹ trên không trung để bám theo trục X của tướng địch!'
    },
    {
        num: 118, id: 'gear_atk_emp_pulse_s', name: 'Đạn Xung Điện Từ (Micro-EMP)',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Cứ mỗi 7 giây, phát đạn tiếp theo mang đầu đạn EMP: khi trúng đích sẽ xóa 1.0 Giáp Trắng của địch, làm tê liệt Vật Triệu Hồi của địch 2.5s và làm chậm nạp đạn 30%!'
    },
    {
        num: 119, id: 'gear_atk_soul_burn_g', name: 'Đạn Thiêu Đốt Linh Hồn',
        tier: 'GOLD', stage: 'MID_LATE',
        desc: 'Đòn bắn của bạn gây thêm sát thương chuẩn bằng 5% Max HP của kẻ địch và rút cạn 10% thanh Năng Lượng / Nội Năng (hoặc kéo dài thời gian nạp đạn) của địch (CD: 1.0s).'
    },
    {
        num: 120, id: 'gear_atk_phase_pierce_g', name: 'Đạn Xuyên Không (Phase Shot)',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Đạn của bạn bắn xuyên qua mọi Thùng Tiếp Tế, Xe Tiền, Tường Chắn và Vật Triệu Hồi của địch mà không bị chặn lại (vẫn gây đủ sát thương lên chúng trên đường bay tới tướng địch)!'
    },
    {
        num: 121, id: 'gear_atk_overcharge_s', name: 'Nòng Súng Tụ Điện',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Mỗi giây bạn không khai hỏa sẽ tích 1 tầng Tụ Điện (tối đa 4 tầng): phát bắn tiếp theo tiêu thụ toàn bộ tầng để tăng +18% Sát thương và +15% Kích thước đạn cho mỗi tầng!'
    },
    {
        num: 122, id: 'gear_atk_twin_fang_g', name: 'Nanh Kép Song Hành',
        tier: 'GOLD', stage: 'ALL',
        excludeBodies: ['shotgun', 'shortgunATK', 'cluster_gun', 'tank', 'storm', 'lazer_beam'],
        desc: 'Cứ mỗi phát bắn thứ 2, nòng súng tách viên đạn thành 2 viên Nanh Kép bay song song (mỗi viên gây 70% sát thương gốc = tổng 140% sát thương và diện tích trúng rộng gấp đôi)!'
    },

    // =========================================================================
    // 🛸 NHÓM 10: THIẾT BỊ HỖ TRỢ, TRỤ PHỤ TRỢ & VẬT TRIỆU HỒI MỚI (#123 – #135)
    // =========================================================================
    {
        num: 123, id: 'gear_sup_heal_beacon_g', name: 'Trạm Quân Y Dã Chiến',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Đầu hiệp và mỗi 12 giây, thả 1 Trạm Quân Y (3.0 HP, tồn tại 7s) trên làn của bạn: phát sóng xanh lá hồi +0.25 HP/giây và tăng +15% tốc bắn khi bạn đứng trong bán kính 75px quanh trạm!'
    },
    {
        num: 124, id: 'gear_sup_trophy_ads_g', name: 'Hệ Thống Đánh Chặn (Trophy ADS)',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Trang bị 1 thiết bị Laser Đánh Chặn gắn trên nóc xe: cứ mỗi 3.5 giây, tự động bắn tia laser xóa sổ 1 viên đạn thường của địch đang bay vào vùng nguy hiểm quanh xe bạn!'
    },
    {
        num: 125, id: 'gear_sup_tesla_coil_g', name: 'Cột Thu Lôi Từ Trường',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Đầu hiệp và mỗi 13 giây, dựng 1 Cột Thu Lôi ở rìa nửa sân bạn (3.5 HP, tồn tại 8s): mỗi 2 giây tự động phóng tia điện giật kẻ địch gây 0.3 sát thương và làm chậm 20%!'
    },
    {
        num: 126, id: 'gear_sup_frost_totem_s', name: 'Cọc Băng Hàn Khí',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Cứ mỗi 10 giây, triệu hồi 1 Cọc Băng ở giữa sân (2.5 HP, tồn tại 6s) tỏa hàn khí làm chậm 25% tốc độ di chuyển của kẻ địch và giảm 20% tốc độ bay của đạn địch đi ngang qua!'
    },
    {
        num: 127, id: 'gear_sup_speed_rail_s', name: 'Đường Ray Gia Tốc',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Trải một dải Đường Ray Quang Học ở trung tâm làn của bạn (rộng 170px): khi di chuyển trên dải ray này, bạn nhận +28% Tốc độ di chuyển và +20% Tốc độ nạp đạn!'
    },
    {
        num: 128, id: 'gear_sup_satellite_p', name: 'Vệ Tinh Quỹ Đạo (Orbital Laser)',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        desc: 'Triệu hồi Vệ Tinh Tác Chiến khóa mục tiêu từ không gian: cứ mỗi 8 giây, một cột tia Laser Vũ Trụ quét dọc theo vị trí của kẻ địch trong 1.2s, gây tổng cộng 1.4 sát thương và đốt cháy mặt đất!'
    },
    {
        num: 129, id: 'gear_sup_decoy_holo_s', name: 'Máy Chiếu Phân Thân (Holo-Decoy)',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Cứ mỗi 7 giây, tự động tạo 1 Phân Thân Quang Học biết tự di chuyển tuần tra trên làn của bạn (2.0 HP, tồn tại 5s): chắn đạn hộ bạn và phát nổ gây 0.5 sát thương + làm chậm khi bị bắn vỡ!'
    },
    {
        num: 130, id: 'gear_sup_supply_pod_g', name: 'Khoang Tiếp Tế Không Gian',
        tier: 'GOLD', stage: 'EARLY_MID',
        desc: 'Cứ mỗi 11 giây, một Khoang Tiếp Tế Cá Nhân rơi xuống làn của bạn: chạm vào nhận ngay ngẫu nhiên (+1.0 HP, +1.0 Giáp Trắng, Đầy Đạn, hoặc +25% Sát thương trong 4s) và +$5 vàng!'
    },
    {
        num: 131, id: 'gear_sup_gravity_well_g', name: 'Cọc Trọng Trường (Gravity Anchor)',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Cứ mỗi 11 giây, phóng 1 Cọc Trọng Trường cắm xuống làn của kẻ địch trong 3.5s: tạo vùng lực hút kéo địch về phía cọc mỗi giây và khiến kẻ địch trong vùng chịu thêm +20% sát thương!'
    },
    {
        num: 132, id: 'gear_sup_shield_drone_g', name: 'Drone Hộ Vệ Quang Khiên',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Triệu hồi 1 Drone Hộ Vệ bay quanh xe bạn: đầu hiệp và cứ mỗi 10 giây nó nạp cho bạn +0.5 Giáp Trắng (tối đa tích trữ 1.5 Giáp Trắng) và bắn tia laze hỗ trợ 0.25 sát thương!'
    },
    {
        num: 133, id: 'gear_sup_ammo_turret_s', name: 'Trạm Tiếp Đạn & Hỏa Lực',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Đầu hiệp đặt 1 Trạm Hậu Cần mini đi theo phía sau lưng bạn: mỗi 3.5 giây tự động nạp thêm +1 viên đạn (hoặc +12% Năng lượng) cho bạn và bắn 1 viên đạn yểm trợ 0.3 sát thương!'
    },
    {
        num: 134, id: 'gear_sup_mecha_core_p', name: 'Lõi Pháo Đài Cơ Giới (Mecha Core)',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        desc: 'Đầu hiệp triệu hồi cùng lúc 1 Drone Tác Chiến VÀ 1 Cột Thu Lôi; đồng thời mỗi khi bạn bắn đủ 5 phát đạn, mọi thiết bị triệu hồi trên sân lập tức bắn đồng loạt 1 loạt đạn Pháo Điện Cường Hóa (0.65 dame)!'
    },
    {
        num: 135, id: 'gear_sup_mirror_wall_g', name: 'Màn Chắn Khúc Xạ (Reflector)',
        tier: 'GOLD', stage: 'MID_LATE',
        desc: 'Đầu hiệp và mỗi 12 giây, dựng 1 Màn Chắn Khúc Xạ trước mặt bạn trong 3.0s: viên đạn thường đầu tiên của địch bắn vào màn chắn sẽ bị phản ngược 180 độ bay trả lại phía kẻ địch với 100% sát thương!'
    },

    // =========================================================================
    // 🔥 NHÓM 11: CƠ CHẾ PHẢN CÔNG, CHIẾN THUẬT & ĐẤU TRƯỜNG (#136 – #142)
    // =========================================================================
    {
        num: 136, id: 'gear_tac_berserk_g', name: 'Cuồng Nộ Tuyệt Cảnh',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Máu của bạn càng thấp, sức chiến đấu càng điên cuồng: cứ mỗi 10% Máu đã mất, bạn nhận thêm +6% Sát thương, +5% Tốc độ bắn và +4% Tốc độ di chuyển (tối đa +54% Dame)!'
    },
    {
        num: 137, id: 'gear_tac_fire_trail_s', name: 'Bước Chân Hỏa Ngục',
        tier: 'SILVER', stage: 'ALL',
        desc: 'Tăng +12% Tốc độ di chuyển. Mỗi khi bạn Lướt hoặc đổi hướng chạy nhanh, xe phóng ra 2 Cầu Lửa Nhiệt Hạch bay về phía kẻ địch (gây 0.5 sát thương + Đốt cháy) (CD: 2s)!'
    },
    {
        num: 138, id: 'gear_tac_bullet_time_p', name: 'Ma Trận Làm Chậm Thời Gian (Bullet Time)',
        tier: 'PRISMATIC', stage: 'MID_LATE',
        desc: 'Tạo một trường Không-Thời Gian bán kính 130px quanh xe của bạn: mọi viên đạn của kẻ địch khi bay vào vùng này bị giảm 55% tốc độ bay và chỉ còn 85% sát thương, giúp bạn dễ dàng lách né!'
    },
    {
        num: 139, id: 'gear_tac_adrenaline_g', name: 'Hưng Phấn Tác Chiến',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Mỗi khi bạn bắn vỡ Khiên hoặc Giáp Trắng của kẻ địch (hoặc khi máu địch lần đầu xuống dưới 35% HP), bạn vào trạng thái Hưng Phấn trong 3.5s: +35% Tốc chạy, +35% Tốc bắn và hồi ngay +0.8 HP!'
    },
    {
        num: 140, id: 'gear_tac_second_wind_g', name: 'Hơi Thở Thứ Hai',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Khi máu của bạn lần đầu tiên tụt xuống dưới 35% Max HP trong hiệp đấu, lập tức xóa sạch mọi hiệu ứng Khống Chế/Đốt, nhận ngay +2.5 Giáp Trắng và xóa đạn địch xung quanh!'
    },
    {
        num: 141, id: 'gear_tac_mystery_box_s', name: 'Hộp Bí Ẩn Đầu Hiệp',
        tier: 'SILVER', stage: 'EARLY_MID',
        desc: 'Nhận ngay +$20 vàng. Đầu mỗi hiệp đấu, bạn được mở Hộp Bí Ẩn nhận ngẫu nhiên 1 trong 5 Siêu Buff (1 Khiên, Cuồng Nộ +30% Dame 8s, Tốc Hành +30% 8s, +1.5 Giáp Trắng, hoặc +$20 vàng)!'
    },
    {
        num: 142, id: 'gear_tac_overclock_g', name: 'Quá Tải Chu Kỳ (Overclock)',
        tier: 'GOLD', stage: 'ALL',
        desc: 'Cứ mỗi 8 giây trong trận đấu, động cơ xe bạn vào trạng thái Quá Tải trong 2.5s: Tốc độ bắn tăng +50%, hoàn lại đạn/năng lượng khi bắn và đạn gây thêm +15% sát thương!'
    },

    // =========================================================================
    // 👑 NHÓM 12: G.E.A.R ĐỘC QUYỀN CHO CÁC TƯỚNG CÒN LẠI (#143 – #150)
    // =========================================================================
    {
        num: 143, id: 'gear_hero_mystic_p', name: 'Bí Thuật Hắc Ám & Âm Dương',
        tier: 'PRISMATIC', stage: 'ALL',
        bodies: ['necromancer', 'am_duong_su', 'magician'],
        desc: 'Mỗi khi tấn công hoặc triệu hồi (CD: 2.5s), tự động phóng kèm 1 luồng Linh Hỏa dẫn đường gây 0.55 sát thương và hồi +0.3 HP!'
    },
    {
        num: 144, id: 'gear_hero_elemental_g', name: 'Áp Suất Nguyên Tố Cực Đại',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['furnace', 'water_gun', 'acid', 'sprayer'],
        desc: 'Tăng +25% Sát thương và +30% tốc độ hồi Năng Lượng/Đạn nguyên tố; kẻ địch đang dính Đốt, Ướt, Axit hoặc Khói Độc của bạn sẽ bị giảm 20% tốc chạy và chịu thêm +18% sát thương!'
    },
    {
        num: 145, id: 'gear_hero_heavy_ord_g', name: 'Đầu Đạn Hạt Nhân Chiến Thuật',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['rocket', 'aaa', 'big_bullet', 'cluster_gun'],
        desc: 'Tăng +30% tốc độ bay của đầu đạn; mỗi khi đạn của bạn trúng đích sẽ phát nổ chấn động lan gây thêm 0.3 sát thương diện rộng và làm chậm 30%!'
    },
    {
        num: 146, id: 'gear_hero_gatling_g', name: 'Cơn Bão Chì Liên Thanh',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['smg', 'six_barrel'],
        desc: 'Tăng +15% tốc độ bắn; cứ mỗi 10 viên đạn bắn ra sẽ tự động phóng kèm 1 quả Tên Lửa Mini dẫn đường gây 0.5 sát thương (+0.15 nổ lan)!'
    },
    {
        num: 147, id: 'gear_hero_thunder_mag_g', name: 'Cộng Hưởng Điện Từ Bão Tố',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['thunder', 'magnet', 'storm'],
        desc: 'Cứ mỗi 5 giây khi bạn tung đòn hoặc Lao Bão Tố, bạn nhận ngay +1.0 Giáp Trắng và phóng ra 1 vòng Xung Điện Từ gây 0.6 sát thương + kéo giật kẻ địch 30px về cùng trục X!'
    },
    {
        num: 148, id: 'gear_hero_apex_p', name: 'Bá Vương Tuyệt Đối',
        tier: 'PRISMATIC', stage: 'ALL',
        bodies: ['one_punch', 'tat_sat', 'juggernaut', 't_zero'],
        desc: 'Tăng +25% Sát thương và +2.5 Max HP; mỗi khi tung đòn đánh hoặc húc sẽ tạo sóng xung kích xóa đạn thường của địch trước mặt (CD: 3s) và xuyên qua 50% giảm sát thương của đối thủ!'
    },
    {
        num: 149, id: 'gear_hero_adapt_p', name: 'Đột Biến Vô Cực',
        tier: 'PRISMATIC', stage: 'ALL',
        bodies: ['evolution', 'customize', 'joker'],
        desc: 'Nhận ngay +$80 vàng và tăng vĩnh viễn +22% toàn bộ chỉ số (Max HP, Sát thương, Tốc chạy, Tốc bắn) kèm +1.0 Giáp Trắng đầu mỗi hiệp đấu!'
    },
    {
        num: 150, id: 'gear_hero_clone_army_g', name: 'Liên Minh Bóng Tối',
        tier: 'GOLD', stage: 'ALL',
        bodies: ['clone', 'gemini', 'mirror', 'ghost'],
        desc: 'Mỗi 4 giây khi bạn khai hỏa sẽ tự động gọi 1 Bóng Ma Phụ Trợ bắn bồi 2 tia Đạn Ảnh (mỗi tia 0.35 sát thương) và hồi +0.25 HP!'
    }
];

const GEAR_BY_ID = {};
GEARS.forEach(g => { GEAR_BY_ID[g.id] = g; });
