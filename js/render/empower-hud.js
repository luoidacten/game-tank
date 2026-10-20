// ==========================================
// HUD "Đạn Cường Hóa" + nút Bắn đổi trạng thái
// ------------------------------------------
// Mỗi body có đòn cường hóa / sạc / bộ đếm phát bắn khai báo 1 provider trả về trạng thái:
//   {
//     pct: 0..1 (tiến độ nạp), ready: bool (đòn kế tiếp đã cường hóa), label, color,
//     count?: số đòn tích trữ (hiện "x2" trong vòng)
//     idle?: true -> không vẽ trên sân (chỉ hiện ở nút Bắn)
//     segments?: N -> vòng chia N ô (bộ đếm phát bắn / tầng cộng dồn); lit?: số ô sáng (mặc định floor(pct*N))
//     pips?: n, pipMax?: m, pipColor? -> chấm nhỏ quanh vòng (vd. số giáo đang có)
//     icon?: tên biểu tượng vector (HUD_GLYPH trong js/render/tank-hud.js) vẽ giữa vòng
//     btnIcon?: ký tự/emoji hiển thị giữa nút Bắn (chế độ / kiểu bắn hiện tại)
//     dim?: true -> nút Bắn xám (đòn hiện tại chưa dùng được, vd. thiếu máu)
//   }
// Mọi trường mới đều tuỳ chọn -> provider cũ vẫn chạy như trước.
// - Trên sân: vòng nạp nhỏ bên phải xe; sẵn sàng -> viền nét đứt quanh xe + mũi tên trên nòng.
// - Nút Bắn của người chơi cục bộ: viền vòng nạp (conic) + nhãn + biểu tượng; sẵn sàng -> rung sáng, vòng xoay.
// Chỉ đọc state đã đồng bộ trên player -> guest online thấy giống host.
// ==========================================

const EMPOWER_HUD = {};
function registerEmpowerHUD(id, fn) { EMPOWER_HUD[id] = fn; }

// Body sạc chung (chargeLevel 0..7): Lazer Xuyên Phá, Cuộn Quá Tải, Phong Trảm
const EMP_CHARGE_STYLE = {
    overload: { color: '#38bdf8', label: 'QUÁ TẢI' },
    wind_slash: { color: '#a7f3d0', label: 'PHONG' },
};
function empChargeState(p) {
    const st = EMP_CHARGE_STYLE[p.weapon];
    if (!st || !(p.chargeLevel > 0)) return null;
    const pct = Math.min(1, p.chargeLevel / 7);
    return { pct, ready: pct >= 1, label: pct >= 1 ? st.label + ' MAX' : st.label, color: st.color, segments: 7, lit: Math.floor(p.chargeLevel) };
}
Object.keys(EMP_CHARGE_STYLE).forEach(id => registerEmpowerHUD(id, empChargeState));
// Lazer Xuyên Phá (chế độ Tự Nạp) & Lazer Pháo (Nhiệt): provider khai báo trong file logic của body
if (typeof lcEmpowerState === 'function') registerEmpowerHUD('lazer_charge', lcEmpowerState);
if (typeof laEmpowerState === 'function') registerEmpowerHUD('lazer_auto', laEmpowerState);

// Phong Trảm Evo 1: phát thứ 5 tự Full lực -> khi không sạc, hiện bộ đếm 5 ô
registerEmpowerHUD('wind_slash', p => {
    const c = empChargeState(p);
    if (c) return c;
    if (!p.hasUpgrade('evo_wind_1')) return null;
    const n = (p.windShotCount || 0) % 5;
    return { pct: n / 5, ready: n === 4, label: n === 4 ? 'PHONG MAX' : 'PHONG ' + n + '/5', color: '#a7f3d0', segments: 5, lit: n };
});

registerEmpowerHUD('shadow_hunter', p => {
    if (p.stealthActive) return { pct: 1, ready: true, label: 'ĐÒN BÓNG', color: '#a855f7', icon: 'blind' };
    if (p.stealthCooldown > 0) return { pct: 1 - p.stealthCooldown / 480, ready: false, label: 'VÔ HÌNH', color: '#a855f7', icon: 'blind' };
    return { pct: 1, ready: false, label: 'VÔ HÌNH ✓', color: '#a855f7', idle: true };
});

// --- Bộ đếm phát bắn: phát thứ N được cường hoá ---
function empShotCounter(count, every, label, color, icon) {
    const n = (count || 0) % every;
    const ready = n === every - 1;
    return { pct: n / every, ready, label: ready ? label + '!' : `${label} ${n}/${every}`, color, segments: every, lit: n, icon };
}
registerEmpowerHUD('ice', p => empShotCounter(p.iceShotCount, 3, 'BĂNG', '#7dd3fc', 'freeze'));
registerEmpowerHUD('acid', p => empShotCounter(p.acidShotCount, 5, 'AXIT', '#84cc16', 'drop'));
registerEmpowerHUD('death_lock', p => {
    const s = empShotCounter(p.deathLockShotCount, 6, 'LỒNG', '#f43f5e', 'chain');
    // Lồng chỉ ra khi đã hết hồi 5s sau lồng trước
    if (Date.now() - (p.lastConfinementCageEndTime || 0) < 5000) { s.ready = false; s.label = 'LỒNG ⌛'; }
    return s;
});
registerEmpowerHUD('blade_god', p => {
    const c = p.bladeShotCount || 0;
    const n = c % 10;
    const ready = n === 9;
    // Màu = kiếm kế tiếp: vàng = Quang Kiếm, tím = Ám Kiếm
    return {
        pct: n / 10, ready, segments: 10, lit: n, color: ready ? '#facc15' : (c % 2 === 0 ? '#ffd84d' : '#c084fc'),
        label: ready ? 'PHÁ THIÊN!' : `PHÁ THIÊN ${n}/10`,
    };
});

function empowerStateOf(p) {
    if (!p || p.hp <= 0) return null;
    const fn = EMPOWER_HUD[p.weapon];
    if (!fn) return null;
    try { return fn(p) || null; } catch (e) { return null; }
}

// --- Vẽ trên sân ---
function empTextFlip(p) { return typeof hudTextFlip === 'function' ? hudTextFlip(p) : false; }
function drawEmpowerTankHUD(p, s) {
    const cx = p.x + p.w / 2;
    const top = p.id === 1;
    const t = Date.now();
    const R = 7;
    // vòng nạp nhỏ cạnh xe (bên phải; sát tường phải -> sang trái)
    let rx = p.x + p.w + 11;
    if (rx + R + 6 > canvas.width) rx = p.x - 11;
    const ry = p.y + p.h / 2;
    const start = -Math.PI / 2;
    ctx.save();
    // nền tối cho dễ đọc trên mọi sàn
    ctx.fillStyle = 'rgba(6, 10, 20, 0.78)';
    ctx.beginPath(); ctx.arc(rx, ry, R + 3, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 3; ctx.lineCap = 'butt';
    if (s.segments > 1) {
        const N = s.segments;
        const lit = s.lit !== undefined ? s.lit : Math.floor(s.pct * N);
        const gap = N > 6 ? 0.16 : 0.24;
        const seg = Math.PI * 2 / N;
        for (let i = 0; i < N; i++) {
            const on = i < lit;
            ctx.strokeStyle = on ? s.color : 'rgba(255,255,255,0.16)';
            ctx.shadowBlur = on ? (s.ready ? 10 : 4) : 0; ctx.shadowColor = s.color;
            ctx.beginPath(); ctx.arc(rx, ry, R, start + i * seg + gap / 2, start + (i + 1) * seg - gap / 2); ctx.stroke();
        }
        if (s.ready) { // ô cuối nhấp nháy = phát kế tiếp được cường hoá
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 90);
            ctx.strokeStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = s.color;
            ctx.beginPath(); ctx.arc(rx, ry, R, start + lit * seg + gap / 2, start + (lit + 1) * seg - gap / 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
    } else {
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(rx, ry, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = s.color; ctx.shadowBlur = s.ready ? 12 : 4; ctx.shadowColor = s.color;
        ctx.beginPath(); ctx.arc(rx, ry, R, start, start + Math.PI * 2 * Math.max(0.02, Math.min(1, s.pct))); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // chấm phụ quanh vòng (vd. số giáo)
    if (s.pipMax > 0) {
        const m = s.pipMax, step = Math.min(0.62, 2.6 / m);
        const a0 = Math.PI / 2 - step * (m - 1) / 2; // xếp ở phía dưới vòng
        for (let i = 0; i < m; i++) {
            const a = a0 + i * step;
            ctx.fillStyle = i < (s.pips || 0) ? (s.pipColor || s.color) : 'rgba(255,255,255,0.2)';
            ctx.beginPath(); ctx.arc(rx + Math.cos(a) * (R + 5.5), ry + Math.sin(a) * (R + 5.5), 1.7, 0, Math.PI * 2); ctx.fill();
        }
    }
    // giữa vòng: số đòn tích trữ hoặc biểu tượng
    const F = { hx: 1, dir: p.id === 1 ? 1 : -1, flip: empTextFlip(p) };
    if (s.count > 1) {
        ctx.fillStyle = '#fff'; ctx.font = "800 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (F.flip) { ctx.save(); ctx.translate(rx, ry); ctx.rotate(Math.PI); ctx.fillText('x' + s.count, 0, 0.5); ctx.restore(); }
        else ctx.fillText('x' + s.count, rx, ry + 0.5);
        ctx.textBaseline = 'alphabetic';
    } else if (s.icon && typeof HUD_GLYPH !== 'undefined' && HUD_GLYPH[s.icon]) {
        ctx.save();
        ctx.translate(rx, ry); ctx.scale(0.8, 0.8); ctx.translate(-rx, -ry);
        ctx.fillStyle = s.color; ctx.strokeStyle = s.color; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        HUD_GLYPH[s.icon](rx, ry, F);
        ctx.restore();
    }
    // sẵn sàng: mũi tên sáng trên nòng + vầng hào quang quanh xe
    if (s.ready) {
        const k = 0.5 + 0.5 * Math.sin(t / 110);
        ctx.globalAlpha = 0.35 + 0.35 * k;
        ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t / 40;
        ctx.strokeRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        const ay = top ? p.y - 16 - k * 4 : p.y + p.h + 16 + k * 4;
        const dir = top ? -1 : 1;
        ctx.fillStyle = s.color; ctx.shadowBlur = 10; ctx.shadowColor = s.color;
        for (let i = 0; i < 2; i++) {
            const yy = ay + dir * i * 6;
            ctx.beginPath(); ctx.moveTo(cx - 6, yy - dir * 3); ctx.lineTo(cx, yy + dir * 3); ctx.lineTo(cx + 6, yy - dir * 3); ctx.lineTo(cx, yy); ctx.closePath(); ctx.fill();
        }
    }
    ctx.restore();
}

// --- Nút Bắn ---
const empBtnCache = {};
function empLocalButtons() {
    const out = [];
    if (typeof document === 'undefined' || typeof p1 === 'undefined') return out;
    const isOnline = typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline;
    if (isOnline) {
        const me = onlineManager.role === 'host' ? p1 : p2;
        out.push(['#p1-controls .btn-shoot', me]);
    } else {
        out.push(['#p1-controls .btn-shoot', p1]);
        const p2Bot = typeof botAI !== 'undefined' && botAI.enabled;
        if (!p2Bot) out.push(['#p2-controls .btn-shoot', p2]);
    }
    return out;
}
function empClearButton(el) {
    el.classList.remove('emp-on', 'emp-ready', 'emp-has-icon');
    el.style.filter = '';
    el.querySelectorAll('.emp-ring,.emp-spin,.emp-badge,.emp-icon').forEach(x => x.remove());
}
function updateEmpowerButtons() {
    empLocalButtons().forEach(([sel, p]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const s = empowerStateOf(p);
        const key = s ? `${s.ready ? 1 : 0}|${Math.round(s.pct * 40)}|${s.label}|${s.color}|${s.count || 0}|${s.btnIcon || ''}|${s.dim ? 1 : 0}` : '';
        if (empBtnCache[sel] === key) return;
        empBtnCache[sel] = key;
        if (!s) { empClearButton(el); return; }
        let badge = el.querySelector('.emp-badge');
        if (!badge) {
            ['emp-ring', 'emp-spin', 'emp-badge', 'emp-icon'].forEach(c => { const sp = document.createElement('span'); sp.className = c; el.appendChild(sp); });
            badge = el.querySelector('.emp-badge');
        }
        el.classList.add('emp-on');
        el.classList.toggle('emp-ready', !!s.ready);
        el.classList.toggle('emp-has-icon', !!s.btnIcon);
        el.style.setProperty('--emp-pct', (s.pct * 100).toFixed(1) + '%');
        el.style.setProperty('--emp-color', s.color);
        el.style.filter = s.dim ? 'grayscale(1) brightness(0.65)' : '';
        badge.textContent = (s.label || '') + (s.count > 1 ? ' x' + s.count : '');
        badge.style.display = s.label ? '' : 'none';
        const ic = el.querySelector('.emp-icon');
        if (ic) ic.textContent = s.btnIcon || '';
    });
}
function resetEmpowerButtons() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.btn-shoot.emp-on').forEach(empClearButton);
    for (const k in empBtnCache) delete empBtnCache[k];
}

// Gắn vào cuối mỗi khung hình (không sửa render.js để tránh xung đột)
(function hookEmpowerHUD() {
    const base = renderFrame;
    renderFrame = function () {
        base.apply(this, arguments);
        if (gameState.phase !== 'playing') { resetEmpowerButtons(); return; }
        // renderFrame đã restore khung nhìn -> dùng lại đúng khung thế giới (xoay guest 180°, zoom kết liễu, rung)
        // để vòng nằm sát xe, không lệch / trôi khi màn hình rung
        ctx.save();
        if (worldViewTransform) ctx.setTransform(worldViewTransform);
        [p1, p2].forEach(p => {
            const s = empowerStateOf(p);
            if (s && !s.idle && !p.isInvisible && !p.stealthActive) drawEmpowerTankHUD(p, s);
        });
        ctx.restore();
        updateEmpowerButtons();
    };
})();
