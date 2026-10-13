// ==========================================
// Hàm tiện ích dùng chung
// ==========================================



function distToSegment(px, py, x1, y1, x2, y2) {
    let l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// [FIX] Xoá toàn bộ vật triệu hồi thuộc về 1 người chơi (dùng khi đổi body giữa trận ở phòng tập)
function clearOwnedSummons(owner) {
    const notMine = (o) => o && o.owner !== owner;
    turrets = turrets.filter(notMine);
    creatorTurrets = creatorTurrets.filter(notMine);
    creatorRobots = creatorRobots.filter(notMine);
    necroMinions = necroMinions.filter(notMine);
    ghostDecoys = ghostDecoys.filter(notMine);
    confinementCages = confinementCages.filter(notMine);
    shadowTraps = shadowTraps.filter(notMine);
    thunderPlantedSpears = thunderPlantedSpears.filter(notMine);
    magnetNodes = magnetNodes.filter(notMine);
    floatingSwords = floatingSwords.filter(notMine);
    arrowRains = arrowRains.filter(notMine);
    mortars = mortars.filter(notMine);
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}
