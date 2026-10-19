// ==========================================
// HUD "Đạn Cường Hóa" + nút Bắn đổi trạng thái
// ------------------------------------------
// Mỗi body có đòn cường hóa / sạc khai báo 1 provider trả về trạng thái:
//   { pct: 0..1 (tiến độ nạp), ready: bool (đòn kế tiếp đã cường hóa), label, color, count? (số đòn tích trữ) }
// - Trên sân: vòng nạp + nhãn nhỏ cạnh xe, khi sẵn sàng có mũi tên sáng nhấp nháy trên nòng.
// - Nút Bắn của người chơi cục bộ: viền vòng nạp (conic) + nhãn; sẵn sàng -> rung sáng, vòng xoay.
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
    return { pct, ready: pct >= 1, label: pct >= 1 ? st.label + ' MAX' : st.label, color: st.color };
}
Object.keys(EMP_CHARGE_STYLE).forEach(id => registerEmpowerHUD(id, empChargeState));
// Lazer Xuyên Phá (chế độ Tự Nạp) & Lazer Pháo (Nhiệt): provider khai báo trong file logic của body
if (typeof lcEmpowerState === 'function') registerEmpowerHUD('lazer_charge', lcEmpowerState);
if (typeof laEmpowerState === 'function') registerEmpowerHUD('lazer_auto', laEmpowerState);

registerEmpowerHUD('shadow_hunter', p => {
    if (p.stealthActive) return { pct: 1, ready: true, label: 'ĐÒN BÓNG', color: '#a855f7' };
    if (p.stealthCooldown > 0) return { pct: 1 - p.stealthCooldown / 480, ready: false, label: 'VÔ HÌNH', color: '#a855f7' };
    return { pct: 1, ready: false, label: 'VÔ HÌNH ✓', color: '#a855f7', idle: true };
});

function empowerStateOf(p) {
    if (!p || p.hp <= 0) return null;
    const fn = EMPOWER_HUD[p.weapon];
    if (!fn) return null;
    try { return fn(p) || null; } catch (e) { return null; }
}

// --- Vẽ trên sân ---
function drawEmpowerTankHUD(p, s) {
    const cx = p.x + p.w / 2;
    const top = p.id === 1;
    const t = Date.now();
    // vòng nạp nhỏ cạnh xe
    const rx = p.x + p.w + 11, ry = p.y + p.h / 2;
    ctx.save();
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = s.color; ctx.shadowBlur = s.ready ? 12 : 4; ctx.shadowColor = s.color;
    ctx.beginPath(); ctx.arc(rx, ry, 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, s.pct)); ctx.stroke();
    ctx.shadowBlur = 0;
    if (s.count > 1) {
        ctx.fillStyle = '#fff'; ctx.font = "bold 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
        drawWorldText(ctx, 'x' + s.count, rx, ry + 3);
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
function updateEmpowerButtons() {
    empLocalButtons().forEach(([sel, p]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const s = empowerStateOf(p);
        const key = s ? `${s.ready ? 1 : 0}|${Math.round(s.pct * 40)}|${s.label}|${s.color}|${s.count || 0}` : '';
        if (empBtnCache[sel] === key) return;
        empBtnCache[sel] = key;
        let badge = el.querySelector('.emp-badge');
        if (!s) {
            el.classList.remove('emp-on', 'emp-ready');
            el.querySelectorAll('.emp-ring,.emp-spin,.emp-badge').forEach(x => x.remove());
            return;
        }
        if (!badge) {
            ['emp-ring', 'emp-spin', 'emp-badge'].forEach(c => { const sp = document.createElement('span'); sp.className = c; el.appendChild(sp); });
            badge = el.querySelector('.emp-badge');
        }
        el.classList.add('emp-on');
        el.classList.toggle('emp-ready', !!s.ready);
        el.style.setProperty('--emp-pct', (s.pct * 100).toFixed(1) + '%');
        el.style.setProperty('--emp-color', s.color);
        badge.textContent = s.label + (s.count > 1 ? ' x' + s.count : '');
    });
}
function resetEmpowerButtons() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.btn-shoot.emp-on').forEach(el => {
        el.classList.remove('emp-on', 'emp-ready');
        el.querySelectorAll('.emp-ring,.emp-spin,.emp-badge').forEach(x => x.remove());
    });
    for (const k in empBtnCache) delete empBtnCache[k];
}

// Gắn vào cuối mỗi khung hình (không sửa render.js để tránh xung đột)
(function hookEmpowerHUD() {
    const base = renderFrame;
    renderFrame = function () {
        base.apply(this, arguments);
        if (gameState.phase !== 'playing') { resetEmpowerButtons(); return; }
        [p1, p2].forEach(p => {
            const s = empowerStateOf(p);
            if (s && !s.idle && !p.isInvisible && !p.stealthActive) drawEmpowerTankHUD(p, s);
        });
        updateEmpowerButtons();
    };
})();
