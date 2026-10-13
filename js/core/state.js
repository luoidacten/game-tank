// ==========================================
// Biến trạng thái toàn cục (danh sách thực thể trên sân)
// ==========================================


// --- GLOBAL VARS BỔ SUNG ---
let windWalls = []; // Mảng chứa tường gió
let isRaining = false; // Cờ bật hiệu ứng mưa
let rainDrops = []; // Mảng hạt mưa
let cinematicMode = false; // Chế độ kết liễu
let cinematicTimer = 0; // Timer đếm ngược kết liễu
let cinematicVictim = null;    // <--- THÊM DÒNG NÀY
let cinematicWinnerId = null;
let arrowRains = [];
let arrowDrops = [];

let floatingSwords = [];
let voidZones = [];
// Khởi tạo mảng global
let mortars = [];
let fireZones = [];

let sniperWalls = [];

// --- CLASS Ụ SÚNG (TURRET) ---
let turrets = []; // GLOBAL VAR: Nhớ khai báo biến này ở đầu file cùng với bullets
let thunderPlantedSpears = [];
let magnetNodes = [];
let bastions = [];
let artilleryHazards = [];
let ghostDecoys = [];
let confinementCages = [];
let creatorTurrets = [];
let creatorDrones = [];
let creatorRobots = [];
let necroMinions = [];

// --- GLOBAL VARS ---
let p1, p2;
let crates = [];
let moneyTrucks = [];
let explosions = [];
let beams = [];
let radiationZones = [];
let iceZones = [];
let movingObstacle = null;
let animationId;
let lastCrateSpawn = 0;
let talismans = [];
let spellZones = [];
let shadowTraps = [];
let shortgunFireZones = []; // ~16.66667 ms
let fixedPhysicsAccumulator = 0;
let lastFixedLoopTime = 0;
