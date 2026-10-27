// ==========================================
// Đồng bộ trạng thái online (Host làm chủ - Guest hiển thị)
// ------------------------------------------
// Host mô phỏng toàn bộ trận đấu rồi gửi "ảnh chụp" thế giới cho Guest.
// Guest không tự mô phỏng (tránh lệch kết quả do random / thời gian khác nhau),
// chỉ gửi phím bấm, dự đoán vị trí xe của mình và vẽ lại ảnh chụp.
// ==========================================

// Các class có thể xuất hiện trong ảnh chụp (tái tạo đúng prototype để gọi draw())
const NET_CLASSES = {
    MapDirector, Player, Crate, MoneyTruck, MovingObstacle, BastionWall, ArtilleryHazard,
    Explosion, IceZone, Beam, FloatingSword, AcidZone, StormSlash, StTornado, StSplitFx, StDashTrail, StDelayedSlash,
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
    WsFinisher, StFinisher,
    TatZone, TatPhantom, TatCombo, TatTrail, TatFinisher,
    OpPunchFx, OpFinisher,
    ArWeb, ArSpiderling, ArFinisher,
    MapVehicle, MvShot, MvHealOrbs, MvAura, CrLaser, CrTrapFx, CrAura,
    MainAwakenFx,
    GearSupportDrone, GearMine, GearBarrierWall, GearCenterPrism, GearMirage, GearPrankBox, GearStormBolt, GearFieldDevice, GearProcFx,
    BmStraight, BmCurve, BmBlast, BmCatch, BmFinisher,
    PsyWave, PsyFinisher,
    TlPin, TlWhite, TlBlack, TlFinisher,
    JlFinisher,
    KgSickle, KgPool, KgVortex, KgFinisher,
    BodyFinisher,
    TcFinisher,
    DynBomb, DynLob, DynSmoke, DynNugget, DynFinisher,
    CocLaser, CocFireZone, CocBolt, CocSlash, CocFinisher,
    PrBeam, PrFinisher,
    WdFinisher,
    AdFinisher,
    TnZone, TnFinisher,
    DtpOrb, DtpGrowTornado, DtpBigTornado, DtpStorm, DtpSkyZone, DtpFinisher,
    RgBeam, RgFinisher, GjPurpleBlast,
    SwFinisher,
    IdolBeam, IdolTrail, IdolRing, IdolGift, IdolStick, IdolFinisher,
    ThFinisher, MainFinisher,
    TgFinisher,
    MrShell, MrCrater, MrFinisher,
    BtFinisher,
    HlFinisher,
    ColHolo, ColFinisher,
    TadFinisher,
    FcZone, FcFinisher,
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

// Trường chỉ dùng để vẽ, mỗi máy tự tính theo khung hình của mình (vd. vệt máu trễ ghostHp):
// host không gửi, guest giữ giá trị cục bộ khi nhận ảnh chụp -> không bị giật ngược mỗi gói
const NET_LOCAL_PLAYER_KEYS = ['ghostHp'];

// Mảng chứa object thường (được vẽ bằng hàm riêng, không có .draw)
const NET_PLAIN_LISTS = new Set(['thunderPlantedSpears', 'magnetNodes']);

// Trường của gameState được host quyết định
const NET_GAMESTATE_KEYS = ['round', 'p1Score', 'p2Score', 'p1Coins', 'p2Coins', 'phase', 'currentMap', 'winScore', 'lastObstacleSpawn', 'lastArtillerySpawn', 'zoneOff', 'matchGearTiers'];

// Trang bị / ví của người chơi (đồng bộ ở màn hình shop)
const NET_LOADOUT_KEYS = ['upgrades', 'rerollCount', 'upgradeLevel', 'invUpgrades', 'boughtInvShopItems', 'boughtShopItems', 'isFullEvoInventor',
    'components', 'gears', 'geniusUpgrades', 'geniusPurchaseCount', 'mechaSummonMultiplier',
    'shortgunBonusMaxHp', 'shortgunBonusDmg', 'evolutionPermanentBonus',
    'kkData', 'cuData', 'loseStreak', 'winStreak', 'lastRoundResult', 'lastStreakBonus', 'mtSpend',
    'equippedGears', 'gearTiers', 'gearPickedMilestones', 'gearFreeFeetUpgrades',
    'gearBonusMaxHp', 'gearComebackDmgBuff', 'gearEarlyEvoFallback', 'gearInfiniteStacks', 'gearJackpot',
    'mainEgg', 'mainAwakened', 'isMainChar', 'idolData', 'crUpgrades', 'crEssence', 'crEssenceAcc', 'engUpgrades', 'engParts', 'engPartsAcc', 'adminData'];

// Trường của Player luôn gửi kể cả khi không đổi (guest dự đoán / nội suy ghi đè x,y tại chỗ nên cần giá trị gốc của host)
const NET_ALWAYS_PLAYER_KEYS = new Set(['x', 'y', 'netInSeq', 'netInTicks']);
// Trường Player không đồng bộ: trạng thái màn chọn tướng ở shop (mỗi máy tự giữ, khá nặng ~1.7KB)
const NET_SKIP_PLAYER_KEYS = new Set(['_bodySelectionState']);
// Gói đầy đủ (keyframe) mỗi NET_KEY_EVERY ảnh chụp (~5 giây, kênh tin cậy nên chỉ để phòng hờ; thiếu gói thì guest xin SYNC_KEY); giữa đó chỉ gửi phần thay đổi (delta)
const NET_KEY_EVERY = 150;

const NetState = {
    // ---------- Tuần tự hoá ----------
    // Mỗi "phạm vi" (1 trường của Player / 1 mảng gốc) có bảng id riêng -> bỏ được phạm vi không đổi.
    // p1 = {$r:1}, p2 = {$r:2} ở mọi phạm vi (guest dùng lại object người chơi sẵn có).
    makeEnc(hostNow) {
        const ids = new Map();
        let nextId = 3;
        const enc = (v, top) => {
            if (v === null) return null;
            const t = typeof v;
            if (t === 'number') {
                if (!Number.isFinite(v)) return { $n: String(v) };
                // mốc thời gian Date.now() (kể cả số lẻ như Date.now() + 0.5 * x): gửi dạng tương đối
                // vì đồng hồ 2 máy lệch nhau -> guest cộng lại theo đồng hồ của mình
                if (v > 1e12 && v < 1e13) return { $t: Math.round(v - hostNow) };
                if (Number.isInteger(v)) return v;
                const a = Math.abs(v); // số lẻ: làm tròn theo độ lớn (vị trí 0.1px, vận tốc 0.01) cho gói nhỏ hơn
                return a >= 100 ? Math.round(v * 10) / 10 : a >= 1 ? Math.round(v * 100) / 100 : Math.round(v * 1000) / 1000;
            }
            if (t === 'string' || t === 'boolean') return v;
            if (t !== 'object') return undefined; // function / undefined / symbol
            if (typeof Node !== 'undefined' && v instanceof Node) return undefined;
            if (typeof CanvasRenderingContext2D !== 'undefined' && v instanceof CanvasRenderingContext2D) return undefined;
            if (Array.isArray(v)) { const a = new Array(v.length); for (let i = 0; i < v.length; i++) { const e = enc(v[i]); a[i] = e === undefined ? null : e; } return a; }
            if (v instanceof Set) return { $set: [...v].map(x => enc(x)) };
            if (v instanceof Map) return { $map: [...v].map(([k, x]) => [enc(k), enc(x)]) };
            if (!top && typeof p1 !== 'undefined' && v === p1) return { $r: 1 };
            if (!top && typeof p2 !== 'undefined' && v === p2) return { $r: 2 };
            if (ids.has(v)) return { $r: ids.get(v) };
            const id = nextId++;
            ids.set(v, id);
            const o = { $i: id };
            const cn = v.constructor && v.constructor.name;
            if (cn && cn !== 'Object') {
                if (!NET_CLASSES[cn]) return undefined; // class lạ (âm thanh, DOM...) – bỏ qua
                o.$c = cn;
            }
            const skipLocal = cn === 'Player'; // bỏ trường chỉ để vẽ / chỉ của máy đó
            for (const k in v) {
                if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
                if (skipLocal && (NET_LOCAL_PLAYER_KEYS.includes(k) || NET_SKIP_PLAYER_KEYS.has(k))) continue;
                const e = enc(v[k]);
                if (e !== undefined) o[k] = e;
            }
            return o;
        };
        return enc;
    },

    // Mã hoá toàn bộ trong 1 phạm vi (ROUND_END)
    encode(roots, hostNow) {
        const enc = this.makeEnc(hostNow);
        const out = {};
        for (const [k, v] of Object.entries(roots)) out[k] = enc(v, k === 'p1' || k === 'p2');
        return out;
    },

    makeDec(guestNow) {
        const objs = new Map();
        if (typeof p1 !== 'undefined') objs.set(1, p1);
        if (typeof p2 !== 'undefined') objs.set(2, p2);
        const dec = (v) => {
            if (v === null || typeof v !== 'object') return v;
            if (Array.isArray(v)) return v.map(x => dec(x));
            if ('$t' in v) return v.$t + guestNow;
            if ('$n' in v) return Number(v.$n);
            if ('$r' in v) return objs.get(v.$r);
            if ('$set' in v) return new Set(v.$set.map(x => dec(x)));
            if ('$map' in v) return new Map(v.$map.map(([k, x]) => [dec(k), dec(x)]));
            const C = v.$c ? NET_CLASSES[v.$c] : null;
            const o = C ? Object.create(C.prototype) : {};
            if (v.$i) objs.set(v.$i, o);
            for (const k in v) {
                if (k === '$i' || k === '$c') continue;
                o[k] = dec(v[k]);
            }
            return o;
        };
        return dec;
    },

    // Cập nhật tại chỗ object người chơi. full = keyframe (xoá trường host không còn); $x = trường đã bị xoá (delta)
    // shared = bộ giải mã dùng chung (ROUND_END: 1 phạm vi) | null = mỗi trường 1 phạm vi (SYNC)
    decodePlayer(o, v, guestNow, full, shared) {
        if (!o || !v || typeof v !== 'object') return;
        if (full) for (const k of Object.keys(o)) if (!(k in v) && !NET_LOCAL_PLAYER_KEYS.includes(k) && !NET_SKIP_PLAYER_KEYS.has(k)) delete o[k];
        if (Array.isArray(v.$x)) v.$x.forEach(k => { delete o[k]; });
        for (const k in v) {
            if (k === '$i' || k === '$c' || k === '$x') continue;
            o[k] = (shared || this.makeDec(guestNow))(v[k]);
        }
    },

    decode(data, guestNow, reuse) {
        const dec = this.makeDec(guestNow);
        const out = {};
        for (const [k, v] of Object.entries(data)) {
            if (reuse && reuse[k] && v && typeof v === 'object' && !('$r' in v)) { this.decodePlayer(reuse[k], v, guestNow, true, dec); out[k] = reuse[k]; }
            else out[k] = dec(v);
        }
        return out;
    },

    // ---------- Ảnh chụp thế giới (SYNC: keyframe + delta) ----------
    // Mốc Date.now() trong SYNC gửi tương đối với 1 mốc cố định của host (_epoch) chứ không phải "bây giờ"
    // -> trường thời gian không đổi thì chuỗi mã hoá cũng không đổi (không phải gửi lại mỗi gói).
    // Gói kèm e = now - _epoch; guest ước lượng mốc tương ứng theo đồng hồ mình (làm mượt chống dao động độ trễ).
    _sent: null,      // chuỗi JSON đã gửi của từng phạm vi: { 'p1.x': '...', 'r.crates': '...' }
    _sentKeys: null,  // { p1: Set(trường), p2: Set(trường) }
    _seq: 0, _sinceKey: 0, _forceKey: true, _epoch: 0,
    resetDelta() { this._forceKey = true; this._gotSeq = -1; },

    // Chuỗi JSON { s: seq, b: seq gói gốc (delta) | 0 (keyframe), e, w: { p1:{trường đổi}, p2:{...}, gs:{...}, <gốc đổi>: ... } }
    captureSync() {
        const now = Date.now();
        if (!this._epoch) this._epoch = now;
        const ep = this._epoch;
        const ghosts = this.addGhostBullets();
        this.tagNetIds();
        const key = this._forceKey || !this._sent || ++this._sinceKey >= NET_KEY_EVERY;
        if (key) { this._sinceKey = 0; this._forceKey = false; }
        const prev = key ? {} : this._sent;
        const sent = {}, sentKeys = {}, parts = [];
        const gs = { roundStartTime: gameState.roundStartTime };
        NET_GAMESTATE_KEYS.forEach(k => gs[k] = gameState[k]);
        // Object gửi theo từng trường (chỉ trường đổi); trường bị xoá liệt kê trong $x
        for (const [pk, p] of [['p1', p1], ['p2', p2], ['gs', gs]]) {
            if (!p) continue;
            const isP = pk !== 'gs';
            const fp = [], keys = new Set();
            for (const k in p) {
                if (!Object.prototype.hasOwnProperty.call(p, k)) continue;
                if (isP && (NET_LOCAL_PLAYER_KEYS.includes(k) || NET_SKIP_PLAYER_KEYS.has(k))) continue;
                const e = this.makeEnc(ep)(p[k]);
                if (e === undefined) continue;
                keys.add(k);
                const js = JSON.stringify(e), id = pk + '.' + k;
                sent[id] = js;
                if (prev[id] !== js || (isP && NET_ALWAYS_PLAYER_KEYS.has(k))) fp.push(JSON.stringify(k) + ':' + js);
            }
            if (isP && !key && this._sentKeys && this._sentKeys[pk]) {
                const gone = [...this._sentKeys[pk]].filter(k => !keys.has(k));
                if (gone.length) fp.push('"$x":' + JSON.stringify(gone));
            }
            sentKeys[pk] = keys;
            if (fp.length || isP) parts.push(JSON.stringify(pk) + ':{' + fp.join(',') + '}');
        }
        for (const [name, get] of NET_ROOTS) {
            const e = this.makeEnc(ep)(get());
            if (e === undefined) continue;
            const js = JSON.stringify(e), id = 'r.' + name;
            sent[id] = js;
            if (prev[id] !== js) parts.push(JSON.stringify(name) + ':' + js);
        }
        const base = key ? 0 : this._seq;
        this._seq++;
        this._sent = sent;
        this._sentKeys = sentKeys;
        this.removeGhostBullets(ghosts);
        return '{"s":' + this._seq + ',"b":' + base + ',"e":' + (now - ep) + ',"w":{' + parts.join(',') + '}}';
    },

    // Ảnh chụp đầy đủ kiểu cũ (gửi kèm ROUND_END): mốc thời gian tương đối với "bây giờ"
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

    // Guest: seq gói SYNC đã áp gần nhất; delta chỉ áp khi gói gốc của nó (b) đúng bằng seq này.
    // Trả về false khi thiếu gói gốc (chờ / xin keyframe)
    _gotSeq: -1, _gEpoch: 0,
    applySync(json) {
        const pk = typeof json === 'string' ? JSON.parse(json) : json;
        if (pk.b && pk.b !== this._gotSeq) return false;
        const now = Date.now();
        // mốc host theo đồng hồ guest: lấy giá trị nhỏ dần (gói đến nhanh nhất) + trôi chậm theo đồng hồ lệch
        const est = now - (pk.e || 0);
        if (!this._gEpoch || Math.abs(est - this._gEpoch) > 400) this._gEpoch = est;
        else this._gEpoch = est < this._gEpoch ? est * 0.5 + this._gEpoch * 0.5 : this._gEpoch * 0.98 + est * 0.02;
        const base = this._gEpoch;
        this.lastHostT = pk.e || 0;
        this.lastLate = est - this._gEpoch;
        const w = pk.w || {};
        const full = !pk.b;
        if (w.p1 && typeof p1 !== 'undefined') this.decodePlayer(p1, w.p1, base, full, null);
        if (w.p2 && typeof p2 !== 'undefined') this.decodePlayer(p2, w.p2, base, full, null);
        const out = {};
        for (const k in w) if (k !== 'p1' && k !== 'p2') out[k] = this.makeDec(base)(w[k]);
        this._gotSeq = pk.s;
        if (out.gs && typeof out.gs.roundStartTime === 'number') { gameState.roundStartTime = out.gs.roundStartTime; delete out.gs.roundStartTime; }
        this._applyRoots(out, now);
        return true;
    },

    _applyRoots(w, now) {
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
            if (typeof w.gs.roundElapsed === 'number') gameState.roundStartTime = now - w.gs.roundElapsed;
        }
    },

    applyWorld(json) {
        const data = JSON.parse(json);
        const now = Date.now();
        const w = this.decode(data, now, { p1, p2 });
        this._applyRoots(w, now);
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
        if (typeof onGearLoadoutSynced === 'function') onGearLoadoutSynced(p);
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

    // Host: đạn sinh ra và biến mất giữa 2 ảnh chụp (ảnh chụp cách nhau 2 tick) sẽ không bao giờ tới guest.
    // Mỗi tick ghi nhớ đạn đang có; khi chụp, đạn có ở cuối tick trước nhưng đã mất và chưa từng được gửi thì
    // gắn tạm vào mảng đạn của chủ (cờ _gh) để guest vẽ nó 1 nhịp ở vị trí cuối.
    _tickB: null, _snapB: new Set(),
    noteTickBullets() {
        const m = new Map();
        for (const p of [p1, p2]) if (p && Array.isArray(p.bullets)) p.bullets.forEach(b => m.set(b, p));
        this._tickB = m;
    },
    addGhostBullets() {
        const out = [], prev = this._tickB, cur = new Set();
        for (const p of [p1, p2]) if (p && Array.isArray(p.bullets)) p.bullets.forEach(b => cur.add(b));
        if (prev) for (const [b, p] of prev) {
            if (cur.has(b) || this._snapB.has(b)) continue;
            b._gh = 1; p.bullets.push(b); out.push([p, b]);
        }
        this._tickB = null;
        this._snapB = cur;
        return out;
    },
    removeGhostBullets(g) { for (const [p, b] of g) { const i = p.bullets.lastIndexOf(b); if (i >= 0) p.bullets.splice(i, 1); } },

    // Host: gắn id mạng (_nid) cho đạn & thực thể để guest nối đúng object giữa 2 ảnh chụp (nội suy)
    _nidNext: 1,
    tagNetIds() {
        const seen = new Set();
        const tag = (o) => {
            if (!o || typeof o !== 'object') return;
            if (!o._nid || seen.has(o._nid)) o._nid = this._nidNext++; // đạn sao chép (phản đạn) mang _nid cũ -> cấp mới
            seen.add(o._nid);
        };
        for (const p of [p1, p2]) if (p && Array.isArray(p.bullets)) p.bullets.forEach(tag);
        for (const [name, get] of NET_ROOTS) {
            if (NET_PLAIN_LISTS.has(name)) continue;
            const a = get();
            if (Array.isArray(a)) a.forEach(tag);
        }
    },
};

// ==========================================
// Guest: nội suy vị trí giữa các ảnh chụp (~30 gói/giây, vẽ 60 khung/giây)
// ------------------------------------------
// Mỗi object có _nid (đạn, thực thể) + xe đối thủ giữ lịch sử vị trí theo thời gian HOST (pk.e).
// Mỗi tick guest vẽ ở thời điểm host "hiện tại - độ trễ đệm" (đủ phủ dao động độ trễ mạng) -> nội suy giữa
// 2 ảnh chụp kẹp thời điểm đó; quá ảnh mới nhất thì ngoại suy ngắn (≤ 50ms) rồi đứng chờ.
// Chỉ ghi đè x/y HIỂN THỊ; host vẫn là nguồn chuẩn (gói sau ghi đè lại). Nhảy xa (dịch chuyển) không nội suy.
// ==========================================
const NetSmooth = {
    tr: new Map(),      // khoá -> { o, h: [{ t, x, y }] } (x/y gốc của host)
    late: 15,           // trung bình độ trễ thêm (ms) so với gói đến nhanh nhất -> độ trễ đệm
    SNAP: 140,
    lateVar: 64,        // phương sai độ trễ thêm (ms²) -> độ dao động (jitter)
    _d: 60,             // độ trễ đệm hiện tại (ms), trượt dần về mục tiêu để không giật hình
    reset() { this.tr.clear(); },

    each(fn) {
        if (typeof p1 !== 'undefined' && p1) fn('P1', p1); // xe đối thủ (xe mình = p2 đã có dự đoán riêng)
        for (const p of [p1, p2]) if (p && Array.isArray(p.bullets)) p.bullets.forEach(b => { if (b && b._nid) fn(b._nid, b, p === p1 ? p1 : p2); });
        for (const [name, get] of NET_ROOTS) {
            if (NET_PLAIN_LISTS.has(name)) continue;
            const a = get();
            if (Array.isArray(a)) a.forEach(o => { if (o && o._nid) fn(o._nid, o); });
        }
    },

    // Độ trễ đệm mục tiêu thích ứng theo mạng: 1 khoảng gói (~33ms) + trễ trung bình + 2.2 x độ dao động.
    // Mạng ổn định -> đệm ngắn (phản hồi nhanh); mạng giật -> đệm dài hơn (vẫn mượt, không khựng)
    target() { return Math.max(45, Math.min(220, 35 + this.late + 2.2 * Math.sqrt(this.lateVar))); },
    jitter() { return Math.round(Math.sqrt(this.lateVar)); },
    delay() { return this._d; },
    hostNow() { return Date.now() - NetState._gEpoch - this.delay(); },

    // Gọi ngay sau khi áp 1 ảnh chụp có thời điểm host t (ms tính từ mốc host)
    onSnapshot(t, lateMs) {
        if (typeof t !== 'number') return;
        if (typeof lateMs === 'number') {
            const l = Math.max(0, Math.min(300, lateMs)), d = l - this.late;
            // gói đến trễ bất thường: tăng nhanh; mạng ổn định trở lại: giảm chậm
            const k = d > 0 ? 0.2 : 0.05;
            this.late += d * k;
            this.lateVar = Math.max(4, this.lateVar * (1 - k) + d * d * k);
        }
        const next = new Map();
        this.each((k, o, src) => {
            if (typeof o.x !== 'number' || typeof o.y !== 'number') return;
            const old = this.tr.get(k);
            let h;
            if (old && old.o === o && k !== 'P1') { // gốc không gửi lại (không đổi) -> vị trí host như lần trước
                const l = old.h[old.h.length - 1];
                h = old.h; h.push({ t, x: l.x, y: l.y });
            } else {
                h = old ? old.h : [];
                h.push({ t, x: o.x, y: o.y });
            }
            while (h.length > 8) h.shift();
            next.set(k, { o, h, src: src || null });
        });
        // Đạn biến mất khỏi ảnh chụp (trúng đích / hết tầm): màn hình guest đang trễ ~đệm so với host nên giữ vẽ
        // thêm tới khi nội suy chạm vị trí cuối của host (không thì đạn "tắt" cách mục tiêu cả chục px)
        const rt = this.hostNow();
        for (const [k, e] of this.tr) {
            if (next.has(k) || !e.src || !Array.isArray(e.src.bullets)) continue;
            const last = e.h[e.h.length - 1];
            if (rt >= last.t || t - last.t > 400) continue;
            e.dead = true;
            e.src.bullets.push(e.o);
            next.set(k, e);
        }
        this.tr = next;
        this.apply();
    },

    // Gọi mỗi tick guest
    step() {
        const d = this.target() - this._d; // tăng tối đa 3ms / giảm 0.5ms mỗi tick -> thời gian hiển thị liền mạch
        this._d += Math.max(-0.5, Math.min(3, d));
        this.apply();
    },

    apply() {
        if (!this.tr.size) return;
        const rt = this.hostNow();
        for (const [k, e] of this.tr) {
            const h = e.h, n = h.length;
            if (e.dead && rt >= h[n - 1].t) { // hết hạn: gỡ khỏi mảng đạn
                const i = e.src.bullets.indexOf(e.o);
                if (i >= 0) e.src.bullets.splice(i, 1);
                this.tr.delete(k);
                continue;
            }
            let x = h[n - 1].x, y = h[n - 1].y;
            if (rt <= h[0].t) { x = h[0].x; y = h[0].y; }
            else if (rt >= h[n - 1].t) {
                if (n >= 2 && !e.dead) { // ngoại suy ngắn theo 2 ảnh cuối
                    const a = h[n - 2], b = h[n - 1], dt = b.t - a.t;
                    if (dt > 0 && Math.abs(b.x - a.x) < this.SNAP && Math.abs(b.y - a.y) < this.SNAP) {
                        const k = Math.min(Math.min(rt - b.t, 50) / dt, 1.5); // 2 gói sát nhau (host bù tick) làm dt ~0 -> không để vọt đi xa
                        x = b.x + (b.x - a.x) * k; y = b.y + (b.y - a.y) * k;
                    }
                }
            } else {
                for (let i = n - 2; i >= 0; i--) {
                    const a = h[i], b = h[i + 1];
                    if (rt < a.t) continue;
                    if (Math.abs(b.x - a.x) >= this.SNAP || Math.abs(b.y - a.y) >= this.SNAP || b.t <= a.t) { x = a.x; y = a.y; }
                    else { const k = (rt - a.t) / (b.t - a.t); x = a.x + (b.x - a.x) * k; y = a.y + (b.y - a.y) * k; }
                    break;
                }
            }
            e.o.x = x; e.o.y = y;
        }
    },
};
