// ==========================================
// Đồng bộ trạng thái online (Host làm chủ - Guest hiển thị)
// ------------------------------------------
// Host mô phỏng toàn bộ trận đấu rồi gửi "ảnh chụp" thế giới cho Guest.
// Guest không tự mô phỏng (tránh lệch kết quả do random / thời gian khác nhau),
// chỉ gửi phím bấm, dự đoán vị trí xe của mình và vẽ lại ảnh chụp.
// ==========================================

// Các class có thể xuất hiện trong ảnh chụp (tái tạo đúng prototype để gọi draw())
const NET_CLASSES = {
    Player, Crate, MoneyTruck, MovingObstacle, BastionWall, ArtilleryHazard,
    Explosion, IceZone, Beam, FloatingSword, AcidZone, StormSlash,
    ArrowRain, ArrowDropMarker, BowSkyShot, MortarMarker, VoidZone, Talisman, SpellZone, RadiationZone,
    ShadowTrap, ShortgunFireZone, FireZone, WindWall, InventorDrone, ConfinementCage,
    CreatorTurret, CreatorShield, CreatorDrone, CreatorRobot,
    SniperWall, NecroMinion, GhostDecoy, Turret,
    BodyZone, StoneBlock, SkyStrike, HitscanTelegraph, ThrownMecha, CrateBurst, AttackTruck, MtTruckWarn, SwordSweep, LightningBolt, PortalGate, HitscanWarning,
    DjSoundZone, DjBeam,
    BigBulletBurst,
    FsPetal, FsSlashMark, FsClone, FsShadow, FsLandStrike, FsStar, FsStreak, FsBloom, FsFinisher,
    TzMortar, TzZone, TzAirStrike,
    OvEmpRing, OvEmpMark,
    ThunderReturnBolt, ThunderStrike, ThunderZone,
    CnRing, CnRadar, CnEcho,
    BgLightSword, BgDarkHover, BgBlackHole, BgGuardian, BgSkySword,
    GeminiTwin,
    BdBatZone, BdLaser, BdOrb,
    BersArena,
    MagHatRain, MagIllusionLayer, PdxRift,
    KazTornado, KazScar, KazEcho, KazLoanVu, KazDomain,
    TsShade, TsClone, TsWall, TsFirePool, TsRush, TsVoid, TsLoan, TsStreak, TsBigStar, TsFinisher,
    JkDecoy, JkEscapeFx, JkZone, JkVerdict, JkFinisher, JkPhantom,
    JgSlug, JgWave, JgImpact, JgFinisher,
    CgFinisher,
    ClClone, ClFinisher,
    JpBomb, JpFlyby, JpFinisher,
    MapVehicle, MvShot, MvHealOrbs, MvAura,
    MainAwakenFx,
};

// Biến toàn cục cần đồng bộ: [tên, getter, setter]
const NET_ROOTS = [
    ['crates', () => crates, v => crates = v],
    ['moneyTrucks', () => moneyTrucks, v => moneyTrucks = v],
    ['movingObstacle', () => movingObstacle, v => movingObstacle = v],
    ['explosions', () => explosions, v => explosions = v],
    ['beams', () => beams, v => beams = v],
    ['radiationZones', () => radiationZones, v => radiationZones = v],
    ['iceZones', () => iceZones, v => iceZones = v],
    ['talismans', () => talismans, v => talismans = v],
    ['spellZones', () => spellZones, v => spellZones = v],
    ['shadowTraps', () => shadowTraps, v => shadowTraps = v],
    ['shortgunFireZones', () => shortgunFireZones, v => shortgunFireZones = v],
    ['windWalls', () => windWalls, v => windWalls = v],
    ['isRaining', () => isRaining, v => isRaining = v],
    ['arrowRains', () => arrowRains, v => arrowRains = v],
    ['arrowDrops', () => arrowDrops, v => arrowDrops = v],
    ['floatingSwords', () => floatingSwords, v => floatingSwords = v],
    ['voidZones', () => voidZones, v => voidZones = v],
    ['mortars', () => mortars, v => mortars = v],
    ['fireZones', () => fireZones, v => fireZones = v],
    ['sniperWalls', () => sniperWalls, v => sniperWalls = v],
    ['turrets', () => turrets, v => turrets = v],
    ['thunderPlantedSpears', () => thunderPlantedSpears, v => thunderPlantedSpears = v],
    ['magnetNodes', () => magnetNodes, v => magnetNodes = v],
    ['bastions', () => bastions, v => bastions = v],
    ['artilleryHazards', () => artilleryHazards, v => artilleryHazards = v],
    ['ghostDecoys', () => ghostDecoys, v => ghostDecoys = v],
    ['confinementCages', () => confinementCages, v => confinementCages = v],
    ['creatorTurrets', () => creatorTurrets, v => creatorTurrets = v],
    ['creatorDrones', () => creatorDrones, v => creatorDrones = v],
    ['creatorRobots', () => creatorRobots, v => creatorRobots = v],
    ['necroMinions', () => necroMinions, v => necroMinions = v],
    ['bodyEffects', () => bodyEffects, v => bodyEffects = v],
    ['screenShake', () => screenShake, v => Object.assign(screenShake, v)],
    ['fatalCinematic', () => fatalCinematic, v => fatalCinematic = v],
];

// Mảng chứa object thường (được vẽ bằng hàm riêng, không có .draw)
const NET_PLAIN_LISTS = new Set(['thunderPlantedSpears', 'magnetNodes']);

// Trường của gameState được host quyết định
const NET_GAMESTATE_KEYS = ['round', 'p1Score', 'p2Score', 'p1Coins', 'p2Coins', 'phase', 'currentMap', 'winScore', 'lastObstacleSpawn', 'lastArtillerySpawn', 'zoneOff'];

// Trang bị / ví của người chơi (đồng bộ ở màn hình shop)
const NET_LOADOUT_KEYS = ['upgrades', 'rerollCount', 'upgradeLevel', 'invUpgrades', 'boughtInvShopItems', 'boughtShopItems', 'isFullEvoInventor',
    'components', 'gears', 'geniusUpgrades', 'geniusPurchaseCount', 'mechaSummonMultiplier',
    'shortgunBonusMaxHp', 'shortgunBonusDmg', 'evolutionPermanentBonus',
    'kkData', 'cuData', 'loseStreak', 'winStreak', 'lastRoundResult', 'lastStreakBonus', 'mtSpend'];

const NetState = {
    // ---------- Tuần tự hoá ----------
    encode(roots, hostNow) {
        const ids = new Map();
        let nextId = 1;
        const enc = (v) => {
            if (v === null) return null;
            const t = typeof v;
            if (t === 'number') {
                if (!Number.isFinite(v)) return { $n: String(v) };
                if (Number.isInteger(v)) return (v > 1e12 && v < 1e13) ? { $t: v - hostNow } : v; // mốc thời gian Date.now()
                return Math.round(v * 1000) / 1000;
            }
            if (t === 'string' || t === 'boolean') return v;
            if (t !== 'object') return undefined; // function / undefined / symbol
            if (typeof Node !== 'undefined' && v instanceof Node) return undefined;
            if (typeof CanvasRenderingContext2D !== 'undefined' && v instanceof CanvasRenderingContext2D) return undefined;
            if (Array.isArray(v)) { const a = new Array(v.length); for (let i = 0; i < v.length; i++) { const e = enc(v[i]); a[i] = e === undefined ? null : e; } return a; }
            if (v instanceof Set) return { $set: [...v].map(enc) };
            if (v instanceof Map) return { $map: [...v].map(([k, x]) => [enc(k), enc(x)]) };
            if (ids.has(v)) return { $r: ids.get(v) };
            const id = nextId++;
            ids.set(v, id);
            const o = { $i: id };
            const cn = v.constructor && v.constructor.name;
            if (cn && cn !== 'Object') {
                if (!NET_CLASSES[cn]) return undefined; // class lạ (âm thanh, DOM...) – bỏ qua
                o.$c = cn;
            }
            for (const k in v) {
                if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
                const e = enc(v[k]);
                if (e !== undefined) o[k] = e;
            }
            return o;
        };
        const out = {};
        for (const [k, v] of Object.entries(roots)) out[k] = enc(v);
        return out;
    },

    // existing: { $i-gốc: object hiện có } để cập nhật tại chỗ (p1, p2)
    decode(data, guestNow, reuse) {
        const objs = new Map();
        const dec = (v, reuseTarget) => {
            if (v === null || typeof v !== 'object') return v;
            if (Array.isArray(v)) return v.map(x => dec(x));
            if ('$t' in v) return v.$t + guestNow;
            if ('$n' in v) return Number(v.$n);
            if ('$r' in v) return objs.get(v.$r);
            if ('$set' in v) return new Set(v.$set.map(x => dec(x)));
            if ('$map' in v) return new Map(v.$map.map(([k, x]) => [dec(k), dec(x)]));
            let o;
            if (reuseTarget) {
                o = reuseTarget;
                for (const k of Object.keys(o)) if (!(k in v)) delete o[k];
            } else {
                const C = v.$c ? NET_CLASSES[v.$c] : null;
                o = C ? Object.create(C.prototype) : {};
            }
            if (v.$i) objs.set(v.$i, o);
            for (const k in v) {
                if (k === '$i' || k === '$c') continue;
                o[k] = dec(v[k]);
            }
            return o;
        };
        const out = {};
        for (const [k, v] of Object.entries(data)) out[k] = dec(v, reuse && reuse[k]);
        return out;
    },

    // ---------- Ảnh chụp thế giới ----------
    captureWorld() {
        const now = Date.now();
        const roots = { p1, p2 };
        for (const [name, get] of NET_ROOTS) roots[name] = get();
        const gs = {};
        NET_GAMESTATE_KEYS.forEach(k => gs[k] = gameState[k]);
        gs.roundElapsed = now - gameState.roundStartTime;
        roots.gs = gs;
        return JSON.stringify(this.encode(roots, now));
    },

    applyWorld(json) {
        const data = JSON.parse(json);
        const now = Date.now();
        const w = this.decode(data, now, { p1, p2 });
        // Mảng được vẽ bằng item.draw(): bỏ phần tử mất hàm draw khi truyền mạng
        // (vd. hiệu ứng tia kiếm tạo bằng object chứa function) để guest không lỗi khung hình
        for (const [name, , set] of NET_ROOTS) {
            if (!(name in w)) continue;
            let v = w[name];
            if (Array.isArray(v) && !NET_PLAIN_LISTS.has(name)) v = v.filter(it => it && typeof it.draw === 'function');
            set(v);
        }
        if (w.gs) {
            gameState._noSpendTrack = true;
            NET_GAMESTATE_KEYS.forEach(k => { if (w.gs[k] !== undefined) gameState[k] = w.gs[k]; });
            gameState._noSpendTrack = false;
            gameState.roundStartTime = now - (w.gs.roundElapsed || 0);
        }
    },

    // ---------- Trang bị ----------
    captureLoadout(p, coins) {
        const d = { coins };
        NET_LOADOUT_KEYS.forEach(k => { if (p[k] !== undefined) d[k] = JSON.parse(JSON.stringify(p[k])); });
        return d;
    },

    applyLoadout(p, pid, d) {
        if (!p || !d) return;
        NET_LOADOUT_KEYS.forEach(k => { if (d[k] !== undefined) p[k] = d[k]; });
        if (typeof d.coins === 'number') {
            gameState._noSpendTrack = true; // tiền đã tiêu được tính ở máy người mua (mtSpend đi kèm)
            if (pid === 'p1') gameState.p1Coins = d.coins; else gameState.p2Coins = d.coins;
            gameState._noSpendTrack = false;
        }
    },

    // ---------- Sự kiện hiệu ứng (âm thanh, chữ nổi, tia lửa) ----------
    events: [],
    recording: false,
    hooksInstalled: false,

    installHooks() {
        if (this.hooksInstalled) return;
        this.hooksInstalled = true;
        const self = this;
        const origText = addFloatingText;
        const origSpark = spawnSparkParticles;
        this.replayText = origText;
        this.replaySpark = origSpark;
        addFloatingText = function (...a) { if (self.recording) self.events.push(['t', a]); return origText.apply(this, a); };
        spawnSparkParticles = function (...a) { if (self.recording) self.events.push(['p', a]); return origSpark.apply(this, a); };
        this.soundOrig = {};
        Object.getOwnPropertyNames(Object.getPrototypeOf(soundSystem)).forEach(name => {
            if (!/^play/.test(name) || name === 'playTone') return;
            const orig = soundSystem[name].bind(soundSystem);
            this.soundOrig[name] = orig;
            soundSystem[name] = (...a) => { if (self.recording) self.events.push(['s', name, a]); return orig(...a); };
        });
    },

    flushEvents() {
        const ev = this.events;
        this.events = [];
        return ev;
    },

    replayEvents(ev) {
        if (!Array.isArray(ev)) return;
        for (const e of ev) {
            try {
                if (e[0] === 't') this.replayText(...e[1]);
                else if (e[0] === 'p') this.replaySpark(...e[1]);
                else if (e[0] === 's' && this.soundOrig[e[1]] && !soundSystem.muted) this.soundOrig[e[1]](...e[2]);
            } catch (err) { /* bỏ qua sự kiện lỗi */ }
        }
    },
};
