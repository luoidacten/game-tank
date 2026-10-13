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

// [ĐỔI] Vùng hiệu ứng mặt đất dạng HÌNH VUÔNG (hợp lối chơi chỉ đi trái/phải):
// zoneDist = khoảng cách Chebyshev -> "trong vùng" khi |dx| < r và |dy| < r (cạnh vuông = 2r).
function zoneDist(dx, dy) { return Math.max(Math.abs(dx), Math.abs(dy)); }
function zoneRectPath(x, y, r) {
    ctx.beginPath();
    const rr = Math.max(0, r);
    if (ctx.roundRect) ctx.roundRect(x - rr, y - rr, rr * 2, rr * 2, Math.min(8, rr * 0.2));
    else ctx.rect(x - rr, y - rr, rr * 2, rr * 2);
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
