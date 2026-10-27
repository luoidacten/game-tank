// ==========================================
// G.E.A.R — Biểu tượng thẻ chọn + hiệu ứng trên sân
// ------------------------------------------
// 1. gearIconSVG(g): biểu tượng vector (khung lục giác theo bậc + ký hiệu theo nhóm lõi) cho thẻ chọn / dải lõi.
// 2. Lớp vẽ quanh xe cho lõi đang hoạt động (Giáp Trắng, màng Hấp Thụ, Quá Tải, Đường Ray, trường Bullet Time,
//    tầng Tụ Điện, dấu Lôi Thần / Ấn Tử Thần trên địch, viền đạn G.E.A.R đặc biệt).
// 3. GearProcFx: hiệu ứng kích hoạt ngắn (mảnh băng, xu vàng, ấn nổ, linh hồn, sóng chấn động, EMP, chí mạng).
// Chỉ đọc state đã đồng bộ (trường thường trên player / bullet / bodyEffects) -> guest online thấy giống host.
// ==========================================

// ---------- 1. BIỂU TƯỢNG ----------
const GEAR_GLYPHS = {
    coin: '<circle cx="16" cy="16" r="7"/><path d="M18.6 13.2c-.6-.8-1.5-1.2-2.6-1.2-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.6.8 2.6 2-1.2 2-2.6 2c-1.1 0-2-.4-2.6-1.2M16 10.4v11.2"/>',
    crate: '<rect x="9.5" y="10.5" width="13" height="12" rx="1.6"/><path d="M9.5 15h13M16 10.5V22.5M12.5 18.5h2"/>',
    dna: '<path d="M12 8.5c0 5 8 6 8 11.5M20 8.5c0 5-8 6-8 11.5M12.6 11.5h6.8M12.6 17h6.8M13.5 23.5h5"/>',
    dice: '<rect x="9.5" y="9.5" width="13" height="13" rx="3"/><circle class="gi-dot" cx="13" cy="13" r="1.2"/><circle class="gi-dot" cx="16" cy="16" r="1.2"/><circle class="gi-dot" cx="19" cy="19" r="1.2"/>',
    gift: '<rect x="9.5" y="14" width="13" height="9" rx="1.2"/><path d="M8.5 11h15v3h-15zM16 11v12M16 11c-1.5-3.2-5-3.2-4.6-.9.3 1.4 2.8.9 4.6.9zM16 11c1.5-3.2 5-3.2 4.6-.9-.3 1.4-2.8.9-4.6.9z"/>',
    speed: '<path d="M9.5 11l5 5-5 5M16 11l5 5-5 5"/><path d="M7 16h2" opacity=".6"/>',
    up: '<path d="M16 23V9.5M11 14.5l5-5 5 5M11 20.5l5-5 5 5"/>',
    shrink: '<path d="M9 9l4.5 4.5M23 9l-4.5 4.5M9 23l4.5-4.5M23 23l-4.5-4.5M13.5 10.5v3h-3M18.5 10.5v3h3M13.5 21.5v-3h-3M18.5 21.5v-3h3"/>',
    grow: '<path d="M13 13L8.5 8.5M19 13l4.5-4.5M13 19l-4.5 4.5M19 19l4.5 4.5M8.5 12.5v-4h4M23.5 12.5v-4h-4M8.5 19.5v4h4M23.5 19.5v4h-4"/>',
    bullet: '<path d="M16 7.5c2.6 2.1 3.2 4.8 3.2 7.3V23h-6.4v-8.2c0-2.5.6-5.2 3.2-7.3zM12.8 18.5h6.4"/><path d="M14 25.5h4" opacity=".6"/>',
    crosshair: '<circle cx="16" cy="16" r="6.5"/><path d="M16 7v4.5M16 20.5V25M7 16h4.5M20.5 16H25"/><circle class="gi-dot" cx="16" cy="16" r="1.3"/>',
    magnet: '<path d="M10.5 9v7a5.5 5.5 0 0 0 11 0V9"/><path d="M10.5 9h3v3h-3zM18.5 9h3v3h-3z"/>',
    snow: '<path d="M16 8v16M9.1 12l13.8 8M9.1 20l13.8-8M14 9.5l2 2 2-2M14 22.5l2-2 2 2"/>',
    flame: '<path d="M16 24.5c-3.3 0-5.6-2.3-5.6-5.3 0-3.4 3-4.9 3.6-8.6 1.9 1.3 2.7 3.1 2.7 4.7 1-.6 1.7-1.7 1.9-2.9 1.9 1.6 3.1 3.9 3.1 6.6 0 3.2-2.3 5.5-5.7 5.5z"/>',
    drop: '<path d="M16 8.5s-5.6 6.2-5.6 9.8a5.6 5.6 0 0 0 11.2 0c0-3.6-5.6-9.8-5.6-9.8z"/><path d="M13.6 18.6a2.6 2.6 0 0 0 2.2 2.4" opacity=".7"/>',
    bolt: '<path class="gi-fill" d="M17.8 7.5L10.5 17.2h4.8l-1.3 7.3 7.5-10h-5z"/>',
    vortex: '<path d="M16 16m-1.5 0a1.5 1.5 0 1 0 3 0c0-2.6-3.5-3.8-5.6-2.2-2.6 2-1.6 6.6 2 7.4 4.4 1 8-2.6 7.2-6.8-.9-4.6-6.3-6.6-10.2-4.2"/>',
    hourglass: '<path d="M10.5 8.5h11M10.5 23.5h11M12 8.5c0 4.5 8 3.8 8 7.5s-8 3-8 7.5M20 8.5c0 4.5-8 3.8-8 7.5s8 3 8 7.5"/>',
    skull: '<path d="M10 15.5a6 6 0 0 1 12 0c0 2.2-1 3.4-2.2 4.1V22h-7.6v-2.4C11 18.9 10 17.7 10 15.5z"/><circle class="gi-dot" cx="13.6" cy="15.6" r="1.4"/><circle class="gi-dot" cx="18.4" cy="15.6" r="1.4"/><path d="M14.5 22v1.8M17.5 22v1.8"/>',
    shield: '<path d="M16 7.8l7 2.8v5.2c0 4.6-3 7.6-7 9.2-4-1.6-7-4.6-7-9.2v-5.2z"/><path d="M16 11.5v9.5" opacity=".55"/>',
    heart: '<path d="M16 23.5s-7.2-4.4-7.2-9.2a3.9 3.9 0 0 1 7.2-2.1 3.9 3.9 0 0 1 7.2 2.1c0 4.8-7.2 9.2-7.2 9.2z"/><path d="M12 16h2.4l1.2-2 1.6 4 1.1-2H20" opacity=".8"/>',
    swords: '<path d="M9 9l10.5 10.5M23 9L12.5 19.5M17.5 21.5l4-4M14.5 21.5l-4-4M20.5 22.5l2 2M11.5 22.5l-2 2"/>',
    chain: '<rect x="8.5" y="12.5" width="9" height="6" rx="3" transform="rotate(-35 13 15.5)"/><rect x="14.5" y="13.5" width="9" height="6" rx="3" transform="rotate(-35 19 16.5)"/>',
    drone: '<rect x="12" y="13.5" width="8" height="6" rx="2"/><path d="M8 11h6M18 11h6M11 11v2.5M21 11v2.5M14.5 22.5l1.5-3 1.5 3"/>',
    tower: '<path d="M12.5 24h7M13.5 24l1.2-9.5h2.6l1.2 9.5M11.5 14.5h9M13 14.5l-1-4.5h8l-1 4.5"/><path d="M16 7v3" opacity=".7"/>',
    mine: '<circle cx="16" cy="17" r="5"/><path d="M16 9.5v2.5M10 12l1.8 1.8M22 12l-1.8 1.8M8.5 17H11M23.5 17H21"/><circle class="gi-dot" cx="16" cy="17" r="1.4"/>',
    target: '<circle cx="16" cy="16" r="7.5"/><circle cx="16" cy="16" r="3.8"/><path d="M16 5.5v3M16 23.5v3"/>',
    wall: '<path d="M8.5 11h15v11h-15zM8.5 14.7h15M8.5 18.3h15M13 11v3.7M19 11v3.7M16 14.7v3.6M11 18.3V22M21 18.3V22"/>',
    prism: '<path d="M16 8.5l7.5 13h-15z"/><path d="M5.5 15.5l6.8 1.6M19.5 17.8l7 -2.2M19.8 18.6l6.4 2.6" opacity=".75"/>',
    star: '<path d="M16 7.8l2.5 5.3 5.8.7-4.3 4 1.1 5.8-5.1-2.9-5.1 2.9 1.1-5.8-4.3-4 5.8-.7z"/>',
    breaker: '<path d="M16 7.8l7 2.8v5.2c0 4.6-3 7.6-7 9.2-4-1.6-7-4.6-7-9.2v-5.2z"/><path d="M17.5 8.6l-3 5.4 3.4 2.2-3.2 6.2"/>',
    cog: '<circle cx="16" cy="16" r="3"/><path d="M16 8v2.6M16 21.4V24M8 16h2.6M21.4 16H24M10.3 10.3l1.9 1.9M19.8 19.8l1.9 1.9M10.3 21.7l1.9-1.9M19.8 12.2l1.9-1.9"/><circle cx="16" cy="16" r="6"/>'
};

// Nhóm lõi -> ký hiệu (ưu tiên từ trên xuống)
const GEAR_ICON_RULES = [
    [/protagonist|hero_adapt|early_evo/, 'dna'],
    [/all_in_gamble/, 'dice'],
    [/mystery_box|just_a_prank/, 'gift'],
    [/ally_crate|super_crate|crate_magnet/, 'crate'],
    [/free_foot|discount|vip_shop|interest|tycoon|bounty|insurance|comeback|money_lv2|starter|glitter|ammo_to_gold/, 'coin'],
    [/mini_tank/, 'shrink'], [/giant_tank/, 'grow'],
    [/shield_breaker/, 'breaker'], [/early_zone/, 'hourglass'], [/giant_slayer/, 'crosshair'], [/blood_pact/, 'drop'],
    [/minefield/, 'mine'], [/auto_wall|mirror_wall/, 'wall'], [/center_prism/, 'prism'],
    [/artillery|satellite/, 'target'],
    [/tesla|heal_beacon|frost_totem|ammo_turret|gravity_well|supply_pod/, 'tower'],
    [/free_drone|shield_drone|mecha|summon|clone_army|twins|hero_family|decoy_holo|hero_mystic/, 'drone'],
    [/hourglass|bullet_time|hero_time|sudden_death|scaling_time|headstart/, 'hourglass'],
    [/blackhole|hero_portal/, 'vortex'],
    [/frost|shatter_ice|hero_ice/, 'snow'],
    [/burn|fire_trail|soul_burn|hero_elemental|hero_heavy_ord/, 'flame'],
    [/venom|plague|hero_blood/, 'drop'],
    [/chain_lightning|thunder|emp_pulse|map_storm|overclock|energy_core|hero_overload/, 'bolt'],
    [/death_mark|duel_frenzy|berserk|glass_cannon/, 'skull'],
    [/horizontal_pull|side_knockback|hero_hook/, 'magnet'],
    [/sniper_scope|crit|homing|marksman|hero_lazer/, 'crosshair'],
    [/big_shot|bullet_rain|ricochet|extra_mag|fast_reload|first_strike|mini_split|twin_fang|boomerang|phase_pierce|overcharge|hero_basic|hero_gatling|hero_shotgun/, 'bullet'],
    [/start_shield|auto_shield|thorn|anti_burst|surv_plate|surv_titan|surv_quake|bullet_eater|trophy|jjk/, 'shield'],
    [/regen|omnivamp|fortress|second_wind|adrenaline|tenacity|speed_heal/, 'heart'],
    [/duel_|sword_aura|hero_swords|hero_martial|ram_master|hero_apex/, 'swords'],
    [/ctrl_/, 'chain'],
    [/uncap_speed|mob_|speed_rail|hero_tank|fast_charge/, 'speed'],
    [/stat_rain|infinite_stat|harmonic|heavy_tread/, 'up'],
    [/hero_/, 'star']
];

function gearIconKind(g) {
    const id = (g && g.id) || '';
    for (const [re, k] of GEAR_ICON_RULES) if (re.test(id)) return k;
    return 'cog';
}

let _gearIconSeq = 0;
function gearIconSVG(g, size = 34) {
    if (!g) return '';
    const tier = g.tier || 'SILVER';
    const uid = 'gi' + (++_gearIconSeq);
    const pal = tier === 'PRISMATIC'
        ? { a: '#22d3ee', b: '#e879f9', ink: '#f5f3ff', bg0: '#2e1065', bg1: '#082f49' }
        : tier === 'GOLD'
            ? { a: '#fde047', b: '#f59e0b', ink: '#fef3c7', bg0: '#422006', bg1: '#1c1917' }
            : { a: '#e2e8f0', b: '#94a3b8', ink: '#f1f5f9', bg0: '#1e293b', bg1: '#0b1220' };
    const glyph = GEAR_GLYPHS[gearIconKind(g)] || GEAR_GLYPHS.cog;
    return `<svg class="gear-icon gear-icon-${tier.toLowerCase()}" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">` +
        `<defs><linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.a}"/><stop offset="1" stop-color="${pal.b}"/></linearGradient>` +
        `<radialGradient id="${uid}f" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${pal.bg0}"/><stop offset="1" stop-color="${pal.bg1}"/></radialGradient></defs>` +
        `<path d="M16 1.8l12.3 7.1v14.2L16 30.2 3.7 23.1V8.9z" fill="url(#${uid}f)" stroke="url(#${uid}s)" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<path d="M16 4.6l9.9 5.7v11.4L16 27.4 6.1 21.7V10.3z" fill="none" stroke="${pal.a}" stroke-opacity=".22" stroke-width=".8"/>` +
        `<g fill="none" stroke="${pal.ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="--gi-c:${pal.a}">${glyph}</g>` +
        `</svg>`;
}

// ---------- 2. BIỂU TƯỢNG HUD (chip trạng thái) còn thiếu ----------
if (typeof HUD_GLYPH !== 'undefined') {
    if (!HUD_GLYPH.skull) HUD_GLYPH.skull = (x, y) => {
        ctx.beginPath(); ctx.arc(x, y - 0.6, 3.3, Math.PI, 0); ctx.lineTo(x + 3.3, y + 1.2); ctx.lineTo(x + 1.8, y + 1.8); ctx.lineTo(x + 1.8, y + 3.4);
        ctx.lineTo(x - 1.8, y + 3.4); ctx.lineTo(x - 1.8, y + 1.8); ctx.lineTo(x - 3.3, y + 1.2); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.fillStyle = 'rgba(6,10,20,0.95)';
        ctx.beginPath(); ctx.arc(x - 1.3, y - 0.3, 0.9, 0, Math.PI * 2); ctx.arc(x + 1.3, y - 0.3, 0.9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    };
    if (!HUD_GLYPH.bolt) HUD_GLYPH.bolt = (x, y) => {
        ctx.beginPath(); ctx.moveTo(x + 1.2, y - 4); ctx.lineTo(x - 2.6, y + 0.6); ctx.lineTo(x - 0.1, y + 0.6); ctx.lineTo(x - 1.2, y + 4);
        ctx.lineTo(x + 2.6, y - 0.8); ctx.lineTo(x + 0.1, y - 0.8); ctx.closePath(); ctx.fill();
    };
}
if (typeof HUD_STATUS !== 'undefined') {
    const s1 = f => (f / 60).toFixed(1);
    HUD_STATUS.push(
        p => (p.gearMysteryDmgTimer || 0) > 0 ? { g: 'sword', c: '#f97316', l: 'CUỒNG NỘ', t: s1(p.gearMysteryDmgTimer) } : null,
        p => (p.gearSupplyDmgTimer || 0) > 0 ? { g: 'sword', c: '#fb923c', l: '+25% ST', t: s1(p.gearSupplyDmgTimer) } : null,
        p => (p.gearMysterySpdTimer || 0) > 0 ? { g: 'up', c: '#38bdf8', l: 'TỐC HÀNH', t: s1(p.gearMysterySpdTimer) } : null,
        p => (p.gearBurnTimer || 0) > 0 && !(p.burnTimer > 0) ? { g: 'burn', c: '#fb923c', l: 'CHÁY', t: s1(p.gearBurnTimer) } : null,
        p => ((p.gearExhaustTimer || 0) > 0 || (p.gearEmpSlowReloadTimer || 0) > 0) ? { g: 'bolt', c: '#94a3b8', l: 'NHIỄU NẠP', t: s1(Math.max(p.gearExhaustTimer || 0, p.gearEmpSlowReloadTimer || 0)) } : null,
        p => (p.gearInGravityWellTimer || 0) > 0 ? { g: 'down', c: '#c084fc', l: 'TRỌNG LỰC', t: '' } : null,
        // Buff theo thời gian / cộng dồn của chính mình (#23 #24 #59 #98 #136)
        p => (p.hasGear && p.hasGear('gear_headstart_s') && (p.gearRoundTicks || 0) <= 720) ? { g: 'up', c: '#4ade80', l: 'KHỞI ĐẦU', t: s1(720 - (p.gearRoundTicks || 0)) } : null,
        p => {
            if (!(p.hasGear && p.hasGear('gear_scaling_time_g'))) return null;
            const st = Math.min(5, Math.floor((p.gearRoundTicks || 0) / 600));
            return st > 0 ? { g: 'sword', c: '#facc15', l: 'BỀN BỈ×' + st, t: '' } : null;
        },
        p => {
            if (!(p.hasGear && p.hasGear('gear_tac_berserk_g'))) return null;
            const st = Math.min(9, Math.floor(Math.max(0, 1 - p.hp / Math.max(1, p.maxHp)) * 10));
            return st > 0 ? { g: 'skull', c: '#ef4444', l: 'CUỒNG×' + st, t: '' } : null;
        },
        p => (p.gearStepSpdTimer || 0) > 0 ? { g: 'up', c: '#5eead4', l: 'BỘ PHÁP', t: '' } : null,
        p => (p.gearTwinSynergyTimer || 0) > 0 ? { g: 'guard', c: '#f0abfc', l: 'ĐỒNG TÂM', t: '' } : null
    );
}

// ---------- 3. LỚP VẼ QUANH XE ----------
function gearFxHidden(p) {
    // Không làm lộ xe đang tàng hình
    return !!(p.isGhostActive || p.stealthActive || p.isInvisible || p.mgInvisible);
}

function gearFxRR(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// Lớp DƯỚI xe: Đường Ray Quang Học (#127), trường Bullet Time (#138)
function gearFxUnder(p, t) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    if (p.hasGear('gear_sup_speed_rail_s')) {
        const half = 85, x0 = canvas.width / 2 - half, h = p.h + 10, y0 = cy - h / 2;
        const on = Math.abs(cx - canvas.width / 2) <= half;
        ctx.save();
        ctx.globalAlpha = on ? 0.55 : 0.3;
        const g = ctx.createLinearGradient(x0, 0, x0 + half * 2, 0);
        g.addColorStop(0, 'rgba(56,189,248,0)'); g.addColorStop(0.15, 'rgba(56,189,248,0.16)');
        g.addColorStop(0.85, 'rgba(56,189,248,0.16)'); g.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = g; ctx.fillRect(x0, y0, half * 2, h);
        ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0 + 6, y0); ctx.lineTo(x0 + half * 2 - 6, y0); ctx.moveTo(x0 + 6, y0 + h); ctx.lineTo(x0 + half * 2 - 6, y0 + h); ctx.stroke();
        // vạch chạy (chevron) trôi 2 chiều
        ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(186,230,253,0.8)';
        const off = (t * 40) % 24;
        for (let x = x0 + 10 + off; x < x0 + half * 2 - 10; x += 24) {
            const a = Math.min(1, Math.min(x - x0, x0 + half * 2 - x) / 30);
            ctx.globalAlpha = (on ? 0.55 : 0.3) * a;
            ctx.beginPath(); ctx.moveTo(x - 3, cy - 3); ctx.lineTo(x, cy); ctx.lineTo(x - 3, cy + 3); ctx.stroke();
        }
        ctx.restore();
    }
    if (p.hasGear('gear_tac_bullet_time_p')) {
        const enemy = p.id === 1 ? p2 : p1;
        let busy = false;
        if (enemy && Array.isArray(enemy.bullets)) busy = enemy.bullets.some(b => b && b._bulletTimeSlowed && Math.hypot(b.x - cx, b.y - cy) < 140);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = busy ? 'rgba(196,181,253,0.55)' : 'rgba(196,181,253,0.18)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 8]);
        ctx.rotate(t * 0.25);
        ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        if (busy) {
            ctx.fillStyle = 'rgba(167,139,250,0.05)';
            ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

// Lớp TRÊN xe
function gearFxOver(p, t) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const fwd = p.id === 1 ? -1 : 1;
    const R = Math.max(p.w, p.h) / 2;

    // Giáp Trắng: vỏ bạc mờ ôm xe, dày theo lượng giáp
    const ws = p.gearWhiteShield || 0;
    if (ws >= 0.1) {
        const k = Math.min(1, ws / 2.5);
        ctx.save();
        ctx.strokeStyle = 'rgba(226,232,240,' + (0.35 + 0.35 * k) + ')';
        ctx.lineWidth = 1.2 + 1.2 * k;
        ctx.shadowBlur = 6; ctx.shadowColor = '#e2e8f0';
        gearFxRR(p.x - 4, p.y - 4, p.w + 8, p.h + 8, 7); ctx.stroke();
        // vệt sáng chạy quanh viền
        ctx.shadowBlur = 0;
        const per = 2 * (p.w + p.h + 16), pos = (t * 60) % per;
        let sx, sy;
        if (pos < p.w + 8) { sx = p.x - 4 + pos; sy = p.y - 4; }
        else if (pos < p.w + p.h + 16) { sx = p.x + p.w + 4; sy = p.y - 4 + (pos - p.w - 8); }
        else if (pos < 2 * p.w + p.h + 24) { sx = p.x + p.w + 4 - (pos - p.w - p.h - 16); sy = p.y + p.h + 4; }
        else { sx = p.x - 4; sy = p.y + p.h + 4 - (pos - 2 * p.w - p.h - 24); }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    if (!p.hasGear) return;

    // #45 Màng Hấp Thụ Đạn
    if (p.hasGear('gear_bullet_eater_g') && (p.gearBulletEaterActive || 0) > 0) {
        const a = Math.min(1, p.gearBulletEaterActive / 12);
        ctx.save();
        ctx.globalAlpha = a;
        const r = R + 9;
        const g = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
        g.addColorStop(0, 'rgba(56,189,248,0)'); g.addColorStop(1, 'rgba(56,189,248,0.22)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(125,211,252,0.85)'; ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) { const an = i * Math.PI / 3 + t * 0.8; ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
        ctx.stroke();
        ctx.restore();
    }

    // #142 Quá Tải / #139 Hưng Phấn: quầng nhiệt nhấp nháy
    const oc = (p.gearOverclockActive || 0) > 0, ad = (p.gearAdrenalineTimer || 0) > 0;
    if (oc || ad) {
        ctx.save();
        const c = oc ? '250,204,21' : '249,115,22';
        ctx.strokeStyle = 'rgba(' + c + ',' + (0.45 + 0.25 * Math.sin(t * 18)) + ')';
        ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = 'rgb(' + c + ')';
        gearFxRR(p.x - 2, p.y - 2, p.w + 4, p.h + 4, 5); ctx.stroke();
        ctx.shadowBlur = 0;
        // vệt nhiệt bốc lên phía sau xe
        ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(' + c + ',0.6)';
        for (let i = -1; i <= 1; i++) {
            const ph = (t * 2.2 + i * 0.37) % 1;
            const bx = cx + i * p.w * 0.3, by = (fwd < 0 ? p.y + p.h : p.y) - fwd * (2 + ph * 9);
            ctx.globalAlpha = 1 - ph;
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.sin(t * 9 + i) * 1.5, by - fwd * 4); ctx.stroke();
        }
        ctx.restore();
    }

    // #39 Phát Bắn Đầu Tiên sẵn sàng: tia lấp lánh nhỏ ở mũi nòng
    if (p.hasGear('gear_first_strike_s') && p.gearFirstStrikeReady) {
        const tx = cx, ty = (fwd < 0 ? p.y : p.y + p.h) + fwd * 4;
        const s = 2.5 + Math.sin(t * 6) * 0.8;
        ctx.save();
        ctx.strokeStyle = '#fef9c3'; ctx.lineWidth = 1.1; ctx.shadowBlur = 6; ctx.shadowColor = '#facc15';
        ctx.beginPath(); ctx.moveTo(tx - s, ty); ctx.lineTo(tx + s, ty); ctx.moveTo(tx, ty - s); ctx.lineTo(tx, ty + s); ctx.stroke();
        ctx.restore();
    }

    // #121 Nòng Súng Tụ Điện: 4 chấm tầng cạnh nòng
    if (p.hasGear('gear_atk_overcharge_s')) {
        const st = p.gearOverchargeStacks || 0;
        ctx.save();
        const by = (fwd < 0 ? p.y + 3 : p.y + p.h - 3);
        for (let i = 0; i < 4; i++) {
            const px = p.x + p.w + 3, py = by - fwd * i * 4;
            ctx.fillStyle = i < st ? '#38bdf8' : 'rgba(148,163,184,0.35)';
            if (i < st) { ctx.shadowBlur = 5; ctx.shadowColor = '#38bdf8'; } else ctx.shadowBlur = 0;
            ctx.fillRect(px, py - 1, 2.5, 2.5);
        }
        ctx.restore();
    }

    // Dấu do lõi của ĐỊCH khắc lên xe này: Điện Tích (#108), Ấn Tử Thần (#115)
    const en = p.id === 1 ? p2 : p1;
    if (en && en.hasGear) {
        const marks = [];
        if (en.hasGear('gear_atk_thunder_god_p') && (en.gearThunderGodStacks || 0) > 0) marks.push({ n: en.gearThunderGodStacks, m: 3, c: '#fde047', k: 'bolt' });
        if (en.hasGear('gear_atk_death_mark_g') && (en.gearDeathMarkHits || 0) > 0) marks.push({ n: en.gearDeathMarkHits, m: 3, c: '#ef4444', k: 'mark' });
        if (marks.length) {
            ctx.save();
            const my = (p.id === 1 ? p.y - 7 : p.y + p.h + 7);
            let row = 0;
            for (const mk of marks) {
                const yy = my - (p.id === 1 ? 1 : -1) * row * 7;
                for (let i = 0; i < mk.m; i++) {
                    const xx = cx + (i - (mk.m - 1) / 2) * 7;
                    const lit = i < mk.n;
                    ctx.fillStyle = lit ? mk.c : 'rgba(100,116,139,0.35)';
                    ctx.shadowBlur = lit ? 6 : 0; ctx.shadowColor = mk.c;
                    ctx.beginPath();
                    if (mk.k === 'bolt') { ctx.moveTo(xx + 1, yy - 3); ctx.lineTo(xx - 2, yy + 0.5); ctx.lineTo(xx, yy + 0.5); ctx.lineTo(xx - 1, yy + 3); ctx.lineTo(xx + 2, yy - 0.5); ctx.lineTo(xx, yy - 0.5); }
                    else { ctx.moveTo(xx, yy - 2.8); ctx.lineTo(xx + 2.8, yy); ctx.lineTo(xx, yy + 2.8); ctx.lineTo(xx - 2.8, yy); }
                    ctx.closePath(); ctx.fill();
                }
                row++;
            }
            ctx.restore();
        }
    }

    // Viền đạn G.E.A.R đặc biệt (chí mạng, dẫn đường, boomerang, cầu lửa, đạn phụ, phát đầu tiên)
    if (Array.isArray(p.bullets) && p.bullets.length) {
        ctx.save();
        for (const b of p.bullets) {
            if (!b) continue;
            const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
            const r = Math.max(b.w || 6, b.h || 6) / 2 + 2.5;
            if (b._gearCrit || b._gearTrueShot) {
                ctx.strokeStyle = b._gearCrit ? 'rgba(239,68,68,0.9)' : 'rgba(250,204,21,0.9)'; ctx.lineWidth = 1.4;
                ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
                ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
                // vệt đuôi
                const sp = Math.hypot(b.vx || 0, b.vy || 0) || 1;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - (b.vx || 0) / sp * 12, by - (b.vy || 0) / sp * 12); ctx.stroke();
            } else if (b._gearFireball) {
                const g = ctx.createRadialGradient(bx, by, 0, bx, by, r + 3);
                g.addColorStop(0, 'rgba(254,215,170,0.9)'); g.addColorStop(0.5, 'rgba(249,115,22,0.55)'); g.addColorStop(1, 'rgba(249,115,22,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, r + 3, 0, Math.PI * 2); ctx.fill();
            } else if (b._gearBoomerang) {
                ctx.strokeStyle = 'rgba(52,211,153,0.9)'; ctx.lineWidth = 1.5;
                const a0 = t * 14;
                ctx.beginPath(); ctx.arc(bx, by, r + 1, a0, a0 + Math.PI * 0.9); ctx.stroke();
                ctx.beginPath(); ctx.arc(bx, by, r + 1, a0 + Math.PI, a0 + Math.PI * 1.9); ctx.stroke();
            } else if (b._isFirstStrike) {
                ctx.strokeStyle = 'rgba(254,249,195,0.85)'; ctx.lineWidth = 1.2;
                const sp = Math.hypot(b.vx || 0, b.vy || 0) || 1;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - (b.vx || 0) / sp * 16, by - (b.vy || 0) / sp * 16); ctx.stroke();
            } else if (b._gearHoming && b.isGearBonusShot) {
                ctx.strokeStyle = 'rgba(192,132,252,0.85)'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.stroke();
            } else if (b.isGearDroneBullet || b.isGearBonusShot) {
                ctx.strokeStyle = 'rgba(125,211,252,0.7)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(bx, by, r - 0.5, 0, Math.PI * 2); ctx.stroke();
            }
        }
        ctx.restore();
    }
}

(function installGearFxDraw() {
    if (typeof Player === 'undefined' || !Player.prototype.draw) return;
    const orig = Player.prototype.draw;
    Player.prototype.draw = function () {
        const on = this.hp > 0 && Array.isArray(this.equippedGears) && !gearFxHidden(this);
        const t = Date.now() / 1000;
        if (on && this.equippedGears.length) { try { gearFxUnder(this, t); } catch (e) { } }
        const res = orig.apply(this, arguments);
        if (on) { try { gearFxOver(this, t); } catch (e) { } }
        return res;
    };
})();

// ---------- 4. HIỆU ỨNG KÍCH HOẠT NGẮN ----------
// kind: 'shards' | 'coin' | 'mark' | 'soul' | 'quake' | 'emp' | 'crit' | 'zap'
class GearProcFx {
    constructor(kind, x, y, color, o = {}) {
        this.kind = kind;
        this.x = x; this.y = y;
        this.c = color || '#ffffff';
        this.tx = typeof o.tx === 'number' ? o.tx : x;
        this.ty = typeof o.ty === 'number' ? o.ty : y;
        this.r = o.r || 40;
        this.max = o.life || ({ shards: 26, coin: 40, mark: 30, soul: 36, quake: 28, emp: 24, crit: 18, zap: 14 }[kind] || 24);
        this.life = this.max;
        this.seed = (Math.random() * 1000) | 0;
        this.active = true;
    }
    update() {
        if (--this.life <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const k = 1 - this.life / this.max; // 0 -> 1
        const a = Math.max(0, 1 - k);
        ctx.save();
        ctx.strokeStyle = this.c; ctx.fillStyle = this.c;
        ctx.shadowBlur = 8; ctx.shadowColor = this.c;
        switch (this.kind) {
            case 'shards': { // #116 mảnh pha lê văng ra
                ctx.globalAlpha = a;
                for (let i = 0; i < 5; i++) {
                    const an = (i / 5) * Math.PI * 2 + this.seed;
                    const d = 6 + k * 26;
                    const px = this.x + Math.cos(an) * d, py = this.y + Math.sin(an) * d;
                    ctx.save(); ctx.translate(px, py); ctx.rotate(an);
                    ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(0, 2); ctx.lineTo(-3, 0); ctx.lineTo(0, -2); ctx.closePath();
                    ctx.fillStyle = 'rgba(207,250,254,0.95)'; ctx.fill();
                    ctx.strokeStyle = this.c; ctx.lineWidth = 0.8; ctx.stroke();
                    ctx.restore();
                }
                break;
            }
            case 'coin': { // #81 đồng xu bay về túi
                const e = k * k * (3 - 2 * k);
                const px = this.x + (this.tx - this.x) * e, py = this.y + (this.ty - this.y) * e - Math.sin(k * Math.PI) * 30;
                ctx.globalAlpha = Math.min(1, a * 2);
                ctx.fillStyle = '#facc15';
                ctx.beginPath(); ctx.ellipse(px, py, 5 * Math.abs(Math.cos(k * 10)) + 1.2, 5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#854d0e'; ctx.shadowBlur = 0;
                ctx.font = "800 7px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                if (Math.abs(Math.cos(k * 10)) > 0.5) ctx.fillText('$', px, py + 0.5);
                break;
            }
            case 'mark': { // #115 Ấn Tử Thần nổ: vòng thu lại + chữ thập đỏ
                ctx.globalAlpha = a;
                ctx.lineWidth = 2;
                const r = 26 * (1 - k * 0.6);
                ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.stroke();
                ctx.lineWidth = 2.6;
                const s = 7 + k * 6;
                ctx.beginPath(); ctx.moveTo(this.x - s, this.y - s); ctx.lineTo(this.x + s, this.y + s); ctx.moveTo(this.x + s, this.y - s); ctx.lineTo(this.x - s, this.y + s); ctx.stroke();
                break;
            }
            case 'soul': { // #119 ngọn lửa linh hồn bốc lên
                ctx.globalAlpha = a * 0.9;
                for (let i = 0; i < 3; i++) {
                    const ph = k + i * 0.18;
                    const px = this.x + Math.sin(ph * 9 + i * 2 + this.seed) * 5, py = this.y - ph * 26;
                    const r = 3.5 * (1 - ph * 0.6);
                    if (r <= 0.3) continue;
                    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
                }
                break;
            }
            case 'quake': { // #66 sóng chấn động lan dọc làn
                ctx.globalAlpha = a;
                ctx.lineWidth = 3 * a + 0.8;
                const rx = 18 + k * this.r, ry = 6 + k * 10;
                ctx.beginPath(); ctx.ellipse(this.x, this.y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.lineWidth = 1.2; ctx.globalAlpha = a * 0.6;
                ctx.beginPath(); ctx.ellipse(this.x, this.y, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
                break;
            }
            case 'emp': { // #118 vòng EMP răng cưa
                ctx.globalAlpha = a; ctx.lineWidth = 1.5;
                const r = 10 + k * 26;
                ctx.beginPath();
                for (let i = 0; i <= 20; i++) { const an = i / 20 * Math.PI * 2; const rr = r + (i % 2 ? 3 : -2); ctx.lineTo(this.x + Math.cos(an) * rr, this.y + Math.sin(an) * rr); }
                ctx.stroke();
                break;
            }
            case 'crit': { // #113/#114 nhát chém chí mạng hình sao
                ctx.globalAlpha = a; ctx.lineWidth = 2;
                const s = 6 + k * 12;
                for (let i = 0; i < 4; i++) {
                    const an = i * Math.PI / 4 + 0.4;
                    ctx.beginPath(); ctx.moveTo(this.x - Math.cos(an) * s, this.y - Math.sin(an) * s); ctx.lineTo(this.x + Math.cos(an) * s, this.y + Math.sin(an) * s); ctx.stroke();
                }
                break;
            }
            case 'zap': { // tia sét gấp khúc từ (x,y) -> (tx,ty)
                ctx.globalAlpha = a; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(this.x, this.y);
                const n = 6;
                for (let i = 1; i < n; i++) {
                    const f = i / n;
                    const jx = ((this.seed * (i + 3)) % 13 - 6) * (1 - k * 0.5);
                    ctx.lineTo(this.x + (this.tx - this.x) * f + jx, this.y + (this.ty - this.y) * f);
                }
                ctx.lineTo(this.tx, this.ty); ctx.stroke();
                break;
            }
        }
        ctx.restore();
    }
}

// Gọi từ gear-system (host / offline). bodyEffects được đồng bộ -> guest cũng thấy.
function gearProc(kind, x, y, color, o) {
    if (typeof bodyEffects === 'undefined' || !Array.isArray(bodyEffects)) return;
    if (!isFinite(x) || !isFinite(y)) return;
    let n = 0;
    for (const e of bodyEffects) if (e instanceof GearProcFx) n++;
    if (n > 24) return; // tránh dồn quá nhiều hiệu ứng
    bodyEffects.push(new GearProcFx(kind, x, y, color, o));
}
