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
function commitStatuses(p) {
    if (!p) return;
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
