// ==========================================
// Hook nhân vật & đạn
// ------------------------------------------
// Body mới không cần sửa lõi Player: chỉ cần đăng ký các hàm cần thiết.
//
//   CharHooks.register('id_body', {
//       setup()                          // cuối setupForNewRound (this = player)
//       update(inp, effectiveInp, now)   // mỗi tick, trước khi di chuyển
//       speed(currentSpeed)              // trả về tốc độ mới
//       shoot(inp, now)                  // trả về true nếu đã tự xử lý nút bắn
//       draw() / drawUI()                // vẽ thêm lên xe / UI riêng
//       beforeDamage(amount, attacker, options) // trả về true để chặn hoàn toàn đòn
//       shieldBreak(attacker, options)   // ngay khi mất 1 khiên
//       beforeLethal(dmg, attacker)      // sắp về 0 HP: trả về true nếu đã tự cứu
//       damaged(dmg, attacker)           // sau khi trừ máu
//       roundEnd(result)                 // result: 'win' | 'lose' | 'draw'
//       shopButtons(container, playerId) // thêm nút riêng vào shop
//   });
//
// Đạn mang thuộc tính b.hook = 'ten' sẽ gọi BulletHooks['ten']:
//   hit(b, attacker, victim, dmg)  edge(b, owner)  obstacle(b, owner, obj, kind)
//   truckDmgMult(b, owner, truck) -> hệ số sát thương lên xe tiền   draw(b)
// ==========================================

const CharHooks = {
    registry: {},
    register(id, hooks) { this.registry[id] = hooks; },
    has(p, name) { const h = p && this.registry[p.weapon]; return !!(h && h[name]); },
    call(p, name, ...args) {
        const h = p && this.registry[p.weapon];
        if (h && h[name]) return h[name].apply(p, args);
        return undefined;
    },
};

const BulletHooks = {
    registry: {},
    register(id, hooks) { this.registry[id] = hooks; },
    call(b, name, ...args) {
        if (!b || !b.hook) return undefined;
        const h = this.registry[b.hook];
        if (h && h[name]) return h[name](b, ...args);
        return undefined;
    },
};

// Trạng thái chung (dùng cho mọi body): hiệu ứng ghi vào _next*, cuối tick mới áp dụng
// -> không phụ thuộc thứ tự cập nhật p1/p2.
function addStatusSlow(p, mult) { if (p) p._nextSpeedMult = Math.min(p._nextSpeedMult === undefined ? 1 : p._nextSpeedMult, mult); }
function addStatusVuln(p, v) { if (p) p._nextVuln = Math.max(p._nextVuln || 0, v); }
// Vận tốc để bắn trúng mục tiêu, có đón đầu theo hướng di chuyển (target._vx đo mỗi tick)
function aimVelocity(sx, sy, target, speed, lead = true) {
    let tx = target.x + target.w / 2, ty = target.y + target.h / 2;
    if (lead) {
        const t = Math.hypot(tx - sx, ty - sy) / Math.max(0.1, speed);
        tx = Math.max(target.w / 2, Math.min(canvas.width - target.w / 2, tx + (target._vx || 0) * t * 0.85));
    }
    const dx = tx - sx, dy = ty - sy;
    const L = Math.hypot(dx, dy) || 1;
    return { vx: dx / L * speed, vy: dy / L * speed, angle: Math.atan2(dy, dx) };
}

// Điểm rơi cho pháo kích / mưa tên / sét ngẫu nhiên: đúng LÀN của mục tiêu (xe chỉ đi trái/phải),
// lệch ngang ngẫu nhiên ±spread quanh xe -> vẫn né được nhưng không rơi vào khoảng trống giữa sân.
function laneTargetPoint(target, spread = 80) {
    const x = target.x + target.w / 2 + (Math.random() * 2 - 1) * spread;
    return { x: Math.max(20, Math.min(canvas.width - 20, x)), y: target.y + target.h / 2 };
}

// [ĐỔI] Vùng hiệu ứng mặt đất dạng HÌNH CHỮ NHẬT NẰM NGANG (hợp lối chơi chỉ đi trái/phải):
// bán trục ngang = r * ZONE_AX, bán trục dọc = r * ZONE_AY (diện tích ~ hình vuông cạnh 2r).
// zoneDist(dx, dy) < r  <=>  |dx| < r*ZONE_AX và |dy| < r*ZONE_AY -> hình vẽ & vùng trúng đòn khớp nhau.
const ZONE_AX = 1.3, ZONE_AY = 0.75;
function zoneDist(dx, dy) { return Math.max(Math.abs(dx) / ZONE_AX, Math.abs(dy) / ZONE_AY); }
// Đẩy tâm vùng vào trong sân để vùng không tràn ra sau lưng xe / ngoài mép
// (vd. đạn chạm mép sân tạo vùng -> vùng dời lên trên một đoạn nhỏ, nằm trọn trong sân)
function zoneFit(z, r) {
    const R = r !== undefined ? r : (z.maxR || z.r || 0);
    const hw = R * ZONE_AX, hh = R * ZONE_AY;
    if (canvas.height > hh * 2) z.y = Math.max(hh, Math.min(canvas.height - hh, z.y));
    if (canvas.width > hw * 2) z.x = Math.max(hw, Math.min(canvas.width - hw, z.x));
}
function zoneRectPath(x, y, r) {
    ctx.beginPath();
    const hw = Math.max(0, r) * ZONE_AX, hh = Math.max(0, r) * ZONE_AY;
    if (ctx.roundRect) ctx.roundRect(x - hw, y - hh, hw * 2, hh * 2, Math.min(8, hh * 0.3));
    else ctx.rect(x - hw, y - hh, hw * 2, hh * 2);
}

function commitStatuses(p) {
    if (!p) return;
    p._vx = (typeof p._lastX === 'number') ? Math.max(-12, Math.min(12, p.x - p._lastX)) : 0;
    p._lastX = p.x;
    p.statusSpeedMult = (p._nextSpeedMult === undefined) ? 1 : p._nextSpeedMult;
    p.statusVuln = p._nextVuln || 0;
    p._nextSpeedMult = 1;
    p._nextVuln = 0;
}

// Tạo 1 viên đạn chuẩn (tương thích mọi cơ chế va chạm sẵn có)
function spawnBullet(owner, o) {
    const b = Object.assign({
        x: owner.x + owner.w / 2 - 3,
        y: owner.id === 1 ? owner.y - 8 : owner.y + owner.h + 2,
        w: 6, h: 6, vx: 0, vy: (owner.id === 1 ? -1 : 1) * C.bulletSpeed,
        dmg: owner.damage, owner, isPiercing: false, hitIds: [], bounceCount: 0,
    }, o);
    owner.bullets.push(b);
    return b;
}

// ==========================================
// Đạn tự tìm (homing) — luật chung cho mọi body:
//  - Trước khi qua giữa sân: bẻ lái bình thường (đã giảm độ linh hoạt).
//  - Qua giữa sân hơn 40px: chỉ còn bẻ rất yếu (25%).
//  - Gần mục tiêu (< 110px): không bẻ lái nữa -> dễ né bằng cách lách ngang.
// ==========================================
function homingTurnScale(b, ownerId, tx, ty) {
    const cx = b.x + (b.w || 0) / 2, cy = b.y + (b.h || 0) / 2;
    if (Math.hypot(tx - cx, ty - cy) < 110) return 0;
    const mid = canvas.height / 2;
    const past = ownerId === 1 ? (mid - cy) : (cy - mid);
    return past > 40 ? 0.25 : 1;
}
