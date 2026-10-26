// ==========================================
// Đạn phản / bắt giữ — luật chung (Phản Chiếu, Siêu Năng, Railgun Full)
// ------------------------------------------
// reflectBulletClone(b, newOwner, opts): sao chép NGUYÊN BẢN viên đạn (type, kích thước, cờ đặc biệt, hook BulletHooks,
//   hiệu ứng trúng đích...) -> đổi chủ, đảo chiều bay về phía địch, đặt ngay ngoài mũi xe chủ mới.
//   - Tham chiếu tới người chơi trong đạn (target, homingTarget...) được hoán đổi: chủ cũ <-> chủ mới.
//   - hitIds làm mới, b.reflects +1 (tối đa RF_MAX lần -> 2 bên phản qua lại không lặp vô hạn).
//   - Đạn có hook gốc -> hook 'reflect' uỷ quyền mọi callback cho hook gốc (b.rfOH); vẽ bằng hình gốc của chủ cũ
//     (b.rfW = vũ khí gốc, b.rfId = phe gốc) qua Player.prototype.drawBullet.
// rfAdopt(b, from, to): đổi chủ TẠI CHỖ (dùng khi chuyển chính object đạn sang mảng khác, vd. Siêu Năng bắt giữ).
// Dữ liệu thuần (đồng bộ online): không hàm, không vòng tham chiếu mới.
// ==========================================

const RF_MAX = 3;
const RF_TEAM_KEYS = ['team', 'ownerId', 'teamId'];

function rfPlayer(id) { return id === 1 ? (typeof p1 !== 'undefined' ? p1 : null) : (id === 2 ? (typeof p2 !== 'undefined' ? p2 : null) : null); }
function rfCanReflect(b) { return !!b && (b.reflects || 0) < RF_MAX; }

function rfCopyVal(v, from, to, d) {
    if (typeof v === 'function') return undefined;
    if (v === null || typeof v !== 'object') return v;
    if (from && v === from) return to;
    if (to && v === to) return from;
    if (typeof Player !== 'undefined' && v instanceof Player) return v;
    if (d > 4) return undefined;
    if (Array.isArray(v)) return v.map(x => { const c = rfCopyVal(x, from, to, d + 1); return c === undefined ? null : c; });
    const pr = Object.getPrototypeOf(v);
    if (pr !== Object.prototype && pr !== null) return v; // thực thể (class) -> giữ tham chiếu
    const o = {};
    for (const k in v) { const c = rfCopyVal(v[k], from, to, d + 1); if (c !== undefined) o[k] = c; }
    return o;
}

// Đổi chủ tại chỗ (không đổi vận tốc / vị trí)
function rfAdopt(b, from, to) {
    for (const k in b) {
        if (k === 'owner' || k === 'hitIds') continue;
        const v = b[k];
        if (from && v === from) b[k] = to;
        else if (to && v === to) b[k] = from;
    }
    if (from && to) for (const k of RF_TEAM_KEYS) if (typeof b[k] === 'number' && b[k] === from.id) b[k] = to.id;
    if (!b.rfW && from) { b.rfW = from.weapon || ''; b.rfId = from.id; }
    b.owner = to; b.hitIds = [];
    b.reflects = (b.reflects || 0) + 1;
    // Hư Ảnh Bão: giữ hình, bỏ cơ chế dịch chuyển chủ (sẽ dịch chuyển nhầm xe chủ mới) -> đạn xuyên thấu
    if (b.isStormPhantom) { b.isStormPhantom = false; b.rfDrawFlags = Object.assign({}, b.rfDrawFlags, { isStormPhantom: true }); b.isPiercing = true; }
    if (typeof b.distanceTraveled === 'number') b.distanceTraveled = 0;
    return b;
}
function rfWrapHook(b) {
    if (b.hook === 'reflect') return;
    b.rfOH = b.hook || '';
    b.hook = 'reflect';
}

// Vận tốc phản: giữ tốc độ (x speedMult), bay về phía địch của `to` (ngắm `target` nếu có)
function rfAimVel(b, to, sp, target) {
    const dir = to.id === 1 ? -1 : 1;
    let vx;
    if (target && target.hp > 0) {
        const v = aimVelocity(b.x + (b.w || 6) / 2, b.y + (b.h || 6) / 2, target, sp, true);
        vx = Math.max(-sp * 0.45, Math.min(sp * 0.45, v.vx));
    } else vx = Math.max(-sp * 0.45, Math.min(sp * 0.45, -(b.vx || 0)));
    return { vx, vy: dir * Math.sqrt(Math.max(1, sp * sp - vx * vx)) };
}
function rfSetVel(c, vx, vy) {
    const ovx = c.vx || 0, ovy = c.vy || 0;
    c.vx = vx; c.vy = vy;
    if (typeof c.angle === 'number' && (ovx || ovy)) c.angle = Math.atan2(vy, vx);
}

// opts: { from, dmgMult, speedMult, target, x, y, noPush, tint }
function reflectBulletClone(b, to, opts) {
    opts = opts || {};
    const from = opts.from || b.owner;
    const c = {};
    for (const k in b) {
        if (k === 'owner' || k === 'hitIds') continue;
        const v = rfCopyVal(b[k], from, to, 0);
        if (v !== undefined) c[k] = v;
    }
    c.w = c.w || 6; c.h = c.h || 6;
    if (!b.rfW && from) { c.rfW = from.weapon || ''; c.rfId = from.id; }
    if (typeof c.rfId !== 'number' && from) c.rfId = from.id;
    rfAdopt(c, null, to);
    c.reflects = (b.reflects || 0) + 1;
    if (from) for (const k of RF_TEAM_KEYS) if (typeof c[k] === 'number' && c[k] === from.id) c[k] = to.id;
    rfWrapHook(c);
    c.dmg = (b.dmg || 0) * (opts.dmgMult === undefined ? 1 : opts.dmgMult);
    if (opts.tint) c.rfTint = opts.tint;
    // vị trí: ngay ngoài mũi xe chủ mới (không tự trúng lại)
    const W = canvas.width;
    c.x = typeof opts.x === 'number' ? opts.x - c.w / 2 : Math.max(0, Math.min(W - c.w, b.x));
    if (typeof opts.y === 'number') c.y = opts.y - c.h / 2;
    else c.y = to.id === 1 ? to.y - c.h - 6 : to.y + to.h + 6;
    if (typeof c.startX === 'number') c.startX = c.x;
    if (typeof c.startY === 'number') c.startY = c.y;
    const sp = Math.max(4, Math.hypot(b.vx || 0, b.vy || 0)) * (opts.speedMult || 1);
    const v = rfAimVel(c, to, sp, opts.target);
    rfSetVel(c, v.vx, v.vy);
    if (!opts.noPush) to.bullets.push(c);
    return c;
}

// Vẽ đạn bằng hình gốc: hook gốc `oh` (nếu có draw) hoặc pipeline vẽ đạn của chủ gốc (vũ khí `w`, evo của chủ gốc)
function rfDrawAs(b, oh, w, oid) {
    if (oh === 'reflect') oh = b.rfOH;
    const own = b.owner, oo = rfPlayer(oid) || own;
    if (!own && !oo) return;
    const h = oh && oh !== 'reflect' && BulletHooks.registry[oh];
    const proxy = Object.create(own || oo);
    proxy.weapon = w || (oo && oo.weapon) || '';
    proxy.hasUpgrade = id => !!(oo && typeof oo.hasUpgrade === 'function' && oo.hasUpgrade(id));
    const hk = b.hook, fl = b.rfDrawFlags, sv = {};
    if (fl) for (const k in fl) { sv[k] = b[k]; b[k] = fl[k]; }
    try {
        b.owner = proxy;
        if (h && h.draw) { b.hook = oh; h.draw(b); }
        else { b.hook = ''; Player.prototype.drawBullet.call(proxy, b); }
    } catch (err) { }
    finally {
        b.owner = own; b.hook = hk;
        if (fl) for (const k in sv) b[k] = sv[k];
        ctx.globalAlpha = 1;
    }
}
function rfDrawTint(b) {
    if (!b.rfTint) return;
    const cx = b.x + (b.w || 6) / 2, cy = b.y + (b.h || 6) / 2, r = Math.max(5, Math.max(b.w || 6, b.h || 6) * 0.6) + 2;
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(Date.now() / 90);
    ctx.strokeStyle = b.rfTint; ctx.lineWidth = 1.4; ctx.shadowBlur = 10; ctx.shadowColor = b.rfTint;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function rfDelegate(b, name, args) {
    const oh = b.rfOH, h = oh && oh !== 'reflect' && BulletHooks.registry[oh];
    if (!h || !h[name]) return undefined;
    const hk = b.hook; b.hook = oh;
    try { return h[name](b, ...args); } catch (err) { return undefined; } finally { b.hook = hk; }
}
BulletHooks.register('reflect', {
    hit(b, o, v, d) { return rfDelegate(b, 'hit', [o, v, d]); },
    edge(b, o) { return rfDelegate(b, 'edge', [o]); },
    obstacle(b, o, obj, kind) { return rfDelegate(b, 'obstacle', [o, obj, kind]); },
    truckDmgMult(b, o, t) { return rfDelegate(b, 'truckDmgMult', [o, t]); },
    draw(b) { rfDrawAs(b, b.rfOH, b.rfW, b.rfId); rfDrawTint(b); },
});

// ---------- Thực thể bay (boomerang, liềm xích, cánh hoa, huyết cầu, sao...) bị bắt thành đạn ----------
// Lưu ảnh chụp trường thuần của thực thể + tên class -> vẽ lại đúng hình gốc bằng draw() của class (đối tượng tạm).
function rfEntSnap(o) {
    const s = {};
    for (const k in o) { const v = o[k]; if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') s[k] = v; }
    return s;
}
function rfEntDraw(b, kn, snap) {
    const K = kn && typeof NET_CLASSES !== 'undefined' ? NET_CLASSES[kn] : null;
    if (!K || !K.prototype || typeof K.prototype.draw !== 'function' || !snap) return false;
    const o = Object.assign(Object.create(K.prototype), snap);
    o.x = b.x + (b.w || 6) / 2; o.y = b.y + (b.h || 6) / 2;
    if ('vx' in snap) o.vx = b.vx; if ('vy' in snap) o.vy = b.vy;
    if (b.owner) { o.owner = b.owner; o.team = b.owner.id; if ('dir' in snap) o.dir = b.owner.id === 1 ? -1 : 1; }
    o.active = true;
    for (const k of ['t', 'age', 'life0']) if (typeof snap[k] === 'number') snap[k]++;
    for (const k of ['rot', 'spin', 'ang', 'angle']) if (typeof snap[k] === 'number') snap[k] += 0.3;
    try { ctx.save(); o.draw(); } catch (err) { ctx.restore(); return false; }
    ctx.restore(); ctx.globalAlpha = 1;
    return true;
}
