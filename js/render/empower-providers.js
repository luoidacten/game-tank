// ==========================================
// Provider HUD của từng body (biểu tượng/vòng thay cho chữ trên sân) — xem js/render/empower-hud.js
// Body đã tự khai báo provider trong file của mình (overload, lazer_charge, lazer_auto...) thì không ghi đè.
// ==========================================
(function () {
    const reg = (id, fn) => { if (!EMPOWER_HUD[id]) registerEmpowerHUD(id, fn); };

    // Lôi Thần: vòng 3 ô = tầng Lôi Minh; giữ nút = 3 giai đoạn (biểu tượng trên nút Bắn)
    // (ô thương do thunder/render.js vẽ ở hàng dưới thanh HP)
    const THUNDER_STAGE = [
        { label: 'PHÓNG THƯƠNG', color: '#00e5ff', icon: '⚡' },
        { label: 'THU THƯƠNG', color: '#ffd700', icon: '🧲' },
        { label: 'TRẢM LÔI', color: '#ff007f', icon: '🌪️' },
    ];
    reg('thunder', p => {
        if (p.thunderSky) return null;
        const held = p.thunderHoldFrames || 0;
        if (held > 0) {
            const st = held < 30 ? 0 : (held <= 60 ? 1 : 2);
            const S = THUNDER_STAGE[st];
            return { pct: Math.min(1, held / 65), segments: 3, lit: st + 1, ready: st === 2, color: S.color, label: S.label, btnIcon: S.icon };
        }
        if (p.thunderLoiMinhTimer > 0) {
            const max = p.hasUpgrade('evo_thun_2') ? 480 : 300;
            return { pct: p.thunderLoiMinhTimer / max, ready: true, color: '#ffd700', icon: 'stun', label: 'THIÊN KIẾP ' + Math.ceil(p.thunderLoiMinhTimer / 60) + 's', btnIcon: '⚡' };
        }
        const n = p.thunderLoiMinhStacks || 0;
        return { pct: n / 3, segments: 3, lit: n, color: '#ffffaa', label: n ? `LÔI MINH ${n}/3` : '' };
    });

    // Sniper: giữ nút dựng tường -> vòng vàng (đỏ khi tường đang hồi / đang đứng)
    reg('sniper', p => {
        if (!(p.sniperChargeTimer > 0) || p.sniperReloading) return null;
        const blocked = (p.sniperWallCooldown > 0) || (typeof sniperWalls !== 'undefined' && sniperWalls.some(w => w.owner === p && w.active && !w.isImmortal));
        if (blocked) return { pct: 1, ready: false, label: 'TƯỜNG ⌛', color: '#ef4444', icon: 'wall' };
        return { pct: Math.min(1, p.sniperChargeTimer / 60), ready: p.sniperChargeTimer >= 60, label: 'DỰNG TƯỜNG', color: '#fde047', icon: 'wall' };
    });

    // Cung: giữ nút -> kiểu bắn (vòng chia ô + biểu tượng trên nút)
    reg('cung', p => {
        if (!(p.bowChargeTimer > 0)) return null;
        const s = p.bowChargeTimer / 60;
        const rain = p.hasUpgrade('evo_cung_2');
        const stages = [
            { label: '1 MŨI', color: '#ffffff', icon: '➶' },
            { label: '3 LIÊN', color: '#a3e635', icon: '⋮' },
            { label: '3 TỎA', color: '#22d3ee', icon: '⋰' },
        ];
        if (rain) stages.push({ label: p.rainCD > 0 ? 'MƯA ⌛' : 'MƯA TÊN', color: p.rainCD > 0 ? '#64748b' : '#ff3355', icon: '☔' });
        let st = s >= 1 ? 2 : (s >= 0.5 ? 1 : 0);
        if (rain && s >= 2 && p.rainCD <= 0) st = 3;
        const S = stages[st];
        return { pct: Math.min(1, p.bowChargeTimer / 120), segments: stages.length, lit: st + 1, ready: st === stages.length - 1, color: S.color, label: S.label, btnIcon: S.icon };
    });

    // Cuồng Phong: tự tụ lực bão
    reg('storm', p => {
        const k = Math.min(1, p.stormChargeRatio || 0);
        if (k <= 0) return null;
        return { pct: k, ready: k >= 0.95, label: k >= 0.95 ? 'BÃO SẴN SÀNG' : 'BÃO', color: k >= 0.95 ? '#ff0055' : (k >= 0.5 ? '#00ffcc' : '#2ecc71'), btnIcon: k >= 0.95 ? '🌪️' : '' };
    });

    // Chiêu Hồn Sư: vòng chia ô = số linh hồn; giữ nút = 4 cấp triệu hồi
    const NECRO_TIER = [
        { label: 'BẮN PHÉP', color: '#00e676', icon: '👻' },
        { label: 'CẢM TỬ -2', color: '#ff7043', icon: '💣' },
        { label: 'XẠ THỦ -4', color: '#29b6f6', icon: '🏹' },
        { label: 'CAO CẤP -6', color: '#ab47bc', icon: '💀' },
    ];
    reg('necromancer', p => {
        const f = p.necroChargeFrames || 0;
        const max = p.maxSouls || 6, souls = Math.max(0, Math.min(max, Math.floor(p.currentSouls || 0)));
        if (f > 0) {
            const t = f >= 90 ? 3 : (f >= 60 ? 2 : (f >= 30 ? 1 : 0));
            const T = NECRO_TIER[t];
            return { pct: Math.min(1, f / 90), segments: 4, lit: t + 1, ready: t === 3, color: T.color, label: T.label, btnIcon: T.icon, pips: souls, pipMax: max, pipColor: '#00e676' };
        }
        return { pct: souls / max, segments: max, lit: souls, color: '#00e676', label: `HỒN ${souls}/${max}` + (p.lockedSouls > 0 ? ` 🔒${p.lockedSouls}` : '') };
    });

    // Nhà Phát Minh: số Linh Kiện trong vòng
    reg('inventor', p => {
        const n = p.components || 0;
        return { pct: 1, ready: false, color: '#00ffcc', label: 'LK ' + n, count: n, segments: 1 };
    });

    // Bộ đếm phát bắn: phát thứ N được cường hoá
    function shotCounter(count, every, label, color, icon) {
        const n = (count || 0) % every;
        const ready = n === every - 1;
        return { pct: n / every, ready, label: ready ? label + '!' : `${label} ${n}/${every}`, color, segments: every, lit: n, icon };
    }
    reg('ice', p => shotCounter(p.iceShotCount, 3, 'BĂNG', '#7dd3fc', 'freeze'));
    reg('acid', p => shotCounter(p.acidShotCount, 5, 'AXIT', '#84cc16', 'drop'));
    reg('death_lock', p => {
        const s = shotCounter(p.deathLockShotCount, 6, 'LỒNG', '#f43f5e', 'chain');
        if (Date.now() - (p.lastConfinementCageEndTime || 0) < 5000) { s.ready = false; s.label = 'LỒNG ⌛'; }
        return s;
    });
    reg('blade_god', p => {
        const c = p.bladeShotCount || 0, n = c % 10, ready = n === 9;
        const evo1 = p.hasUpgrade('evo_blade_1');
        return {
            pct: n / 10, ready, segments: 10, lit: n, color: '#facc15',
            label: ready ? 'PHÁ THIÊN!' : `PHÁ THIÊN ${n}/10`,
            pips: evo1 ? c % 3 : 0, pipMax: evo1 ? 3 : 0, pipColor: '#c4b5fd',
        };
    });

    // Biến hình / đổi chế độ: biểu tượng chế độ hiện tại trên nút Bắn
    reg('t_zero', p => {
        if (typeof TZ_MODE_COLOR === 'undefined') return null;
        const icon = { thu: '🛡', cong: '👊', thien: '☄' }[p.tzMode] || '';
        return { idle: true, pct: Math.min(1, (p.tzEnergy || 0) / 100), ready: false, color: TZ_MODE_COLOR[p.tzMode] || '#22d3ee', label: '', btnIcon: p.tzFly ? '✈' : icon };
    });
    reg('flower_shadow', p => {
        if (typeof FS_ICON === 'undefined' || p.fsHidden) return null;
        return { idle: true, pct: Math.max(0, Math.min(1, (p.fsHoa || 0) / 100)), ready: !!p.fsEmpowered, color: '#ff7eb6', label: '', btnIcon: FS_ICON[p.fsDance || 0] };
    });
})();
