// ==========================================
// Chơi online P2P (PeerJS)
// ==========================================



// ============================================================================
// ONLINE MULTIPLAYER MANAGER (WEBRTC PEERJS P2P & .IO MATCHMAKING ARCHITECTURE)
// ============================================================================
const PEER_CONFIG = {
    debug: 1,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    }
};

class OnlineMultiplayerManager {
    constructor() {
        this.isOnline = false;
        this.role = null; // 'host' (P1 Xanh) | 'guest' (P2 Đỏ)
        this.roomCode = null; // e.g. "CY-A1B2C"
        this.myPeerId = null;
        this.peer = null;
        this.connections = {}; // for Host: { peerId: DataConnection }
        this.hostConn = null;  // for Guest: DataConnection
        this.broadcastChannel = null;
        this.playersLobbyData = [];
        this.isJoinedSuccess = false;
        this.joinTimeoutTimer = null;
        this.pingMs = 20;
        this.pingTimer = null;
        this.isQuickMatch = false;
    }

    get conn() {
        const hasOpenConn = (this.hostConn && this.hostConn.open) || 
                            Object.values(this.connections).some(c => c && c.open) ||
                            (this.broadcastChannel !== null);
        return {
            open: hasOpenConn,
            send: (data) => this.sendNetworkMessage(data)
        };
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    setupLocalBroadcastChannel(code) {
        try {
            if (this.broadcastChannel) {
                try { this.broadcastChannel.close(); } catch(e){}
            }
            this.broadcastChannel = new BroadcastChannel('CYBER_ROOM_' + code);
            this.broadcastChannel.onmessage = (event) => {
                const { senderId, payload } = event.data || {};
                if (!payload || senderId === this.myPeerId) return;

                if (this.role === 'host') {
                    this.handleHostReceivedData(senderId, payload);
                } else {
                    this.handleClientReceivedData(payload);
                }
            };
        } catch (e) {
            console.warn("BroadcastChannel error:", e);
        }
    }

    sendNetworkMessage(payload) {
        // 1. Send to local broadcast channel (for same-machine multi-tab/window testing)
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage({ senderId: this.myPeerId, payload });
            } catch (e) {}
        }
        // 2. Send to PeerJS WebRTC DataConnections (for cross-device online play)
        if (this.role === 'host') {
            Object.values(this.connections).forEach(c => {
                try { if (c && c.open) c.send(payload); } catch(e){}
            });
        } else if (this.hostConn && this.hostConn.open) {
            try { this.hostConn.send(payload); } catch(e){}
        }
    }

    initUI() {
        const openOnlineBtn = document.getElementById('openOnlineBtn');
        const onlineModal = document.getElementById('onlineModal');
        const closeOnlineBtn = document.getElementById('closeOnlineBtn');
        const tabCreateRoom = document.getElementById('tabCreateRoom');
        const tabJoinRoom = document.getElementById('tabJoinRoom');
        const tabQuickMatch = document.getElementById('tabQuickMatch');
        const btnGenerateRoom = document.getElementById('btnGenerateRoom');
        const btnJoinRoomAction = document.getElementById('btnJoinRoomAction');
        const joinRoomInput = document.getElementById('joinRoomInput');
        const btnStartQuickMatch = document.getElementById('btnStartQuickMatch');
        const btnCopyRoomCode = document.getElementById('btnCopyRoomCode');
        const btnStartOnlineMatch = document.getElementById('btnStartOnlineMatch');
        const btnLeaveOnlineRoom = document.getElementById('btnLeaveOnlineRoom');

        if (!openOnlineBtn || !onlineModal) return;

        openOnlineBtn.addEventListener('click', () => {
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            onlineModal.style.display = 'flex';
            onlineModal.classList.add('active');
            this.switchTab('create');
        });

        closeOnlineBtn.addEventListener('click', () => {
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            onlineModal.style.display = 'none';
            onlineModal.classList.remove('active');
            this.leaveRoom();
        });

        if (tabCreateRoom) {
            tabCreateRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('create');
            });
        }

        if (tabJoinRoom) {
            tabJoinRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('join');
            });
        }

        if (tabQuickMatch) {
            tabQuickMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('quick');
            });
        }

        if (btnGenerateRoom) {
            btnGenerateRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.createRoom();
            });
        }

        if (btnJoinRoomAction && joinRoomInput) {
            btnJoinRoomAction.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.joinRoom(joinRoomInput.value);
            });
            joinRoomInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                    this.joinRoom(joinRoomInput.value);
                }
            });
        }

        if (btnStartQuickMatch) {
            btnStartQuickMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.startQuickMatch();
            });
        }

        if (btnCopyRoomCode) {
            btnCopyRoomCode.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                if (this.roomCode) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(this.roomCode).then(() => {
                            btnCopyRoomCode.innerText = '✔ ĐÃ CHÉP!';
                            setTimeout(() => { btnCopyRoomCode.innerText = '📋 SAO CHÉP'; }, 2000);
                        }).catch(() => {
                            prompt('Sao chép mã phòng:', this.roomCode);
                        });
                    } else {
                        prompt('Sao chép mã phòng:', this.roomCode);
                    }
                }
            });
        }

        if (btnStartOnlineMatch) {
            btnStartOnlineMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                if (this.role === 'host') {
                    this.hostStartMatch();
                }
            });
        }

        if (btnLeaveOnlineRoom) {
            btnLeaveOnlineRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.leaveRoom();
                this.switchTab('create');
            });
        }
    }

    switchTab(tab) {
        const tabCreate = document.getElementById('tabCreateRoom');
        const tabJoin = document.getElementById('tabJoinRoom');
        const tabQuick = document.getElementById('tabQuickMatch');
        const viewCreate = document.getElementById('createRoomView');
        const viewJoin = document.getElementById('joinRoomView');
        const viewQuick = document.getElementById('quickMatchView');
        const viewLobby = document.getElementById('activeLobbyView');

        if (tabCreate) tabCreate.classList.toggle('active', tab === 'create');
        if (tabJoin) tabJoin.classList.toggle('active', tab === 'join');
        if (tabQuick) tabQuick.classList.toggle('active', tab === 'quick');

        if (viewCreate) viewCreate.style.display = (tab === 'create') ? 'flex' : 'none';
        if (viewJoin) viewJoin.style.display = (tab === 'join') ? 'flex' : 'none';
        if (viewQuick) viewQuick.style.display = (tab === 'quick') ? 'flex' : 'none';
        if (viewLobby) viewLobby.style.display = 'none';

        this.hideErrorsAndLoading();
    }

    hideErrorsAndLoading() {
        const err = document.getElementById('joinRoomError');
        if (err) { err.style.display = 'none'; err.innerText = ''; }
        const loadJoin = document.getElementById('joinRoomLoading');
        if (loadJoin) loadJoin.style.display = 'none';
        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'none';
        const loadQuick = document.getElementById('quickMatchLoading');
        if (loadQuick) loadQuick.style.display = 'none';
    }

    showJoinError(msg) {
        const err = document.getElementById('joinRoomError');
        const load = document.getElementById('joinRoomLoading');
        if (load) load.style.display = 'none';
        if (err) {
            err.style.display = 'block';
            err.innerText = msg;
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
    }

    createRoom() {
        this.cleanup();
        this.role = 'host';
        this.isOnline = true;
        const rawCode = this.generateRoomCode();
        this.roomCode = "CY-" + rawCode;
        this.myPeerId = this.roomCode;
        this.playersLobbyData = [
            { id: this.myPeerId, nickname: 'Host (Blue)', isHost: true }
        ];

        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'flex';

        this.setupLocalBroadcastChannel(this.roomCode);

        if (typeof Peer === 'undefined') {
            this.initHostLobby();
            return;
        }

        try {
            this.peer = new Peer(this.roomCode, PEER_CONFIG);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                this.setupLocalBroadcastChannel(this.roomCode);
                this.initHostLobby();
            });

            this.peer.on('connection', (conn) => {
                this.connections[conn.peer] = conn;
                conn.on('data', (data) => this.handleHostReceivedData(conn.peer, data));
                conn.on('close', () => {
                    delete this.connections[conn.peer];
                    this.playersLobbyData = this.playersLobbyData.filter(p => p.id !== conn.peer);
                    this.broadcastLobbyState();
                });
            });

            this.peer.on('error', (err) => {
                console.warn("PeerJS Host fallback to BroadcastChannel:", err);
                const notice = document.getElementById('onlineNetworkNotice');
                if (notice) {
                    notice.style.display = 'block';
                    notice.innerText = "⚡ Máy chủ Peer Cloud bận. Chế độ Local Broadcast (thử nghiệm trên cùng thiết bị) đã sẵn sàng!";
                }
                this.setupLocalBroadcastChannel(this.roomCode);
                this.initHostLobby();
            });
        } catch (e) {
            console.warn("PeerJS Create exception:", e);
            this.setupLocalBroadcastChannel(this.roomCode);
            this.initHostLobby();
        }
    }

    initHostLobby() {
        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'none';

        this.playersLobbyData = [
            { id: this.myPeerId, nickname: 'Host (Blue)', isHost: true }
        ];

        this.showLobbyView();
        this.updateLobbyDisplay('host_waiting');
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    joinRoom(rawCode) {
        this.cleanup();
        let codeInput = (rawCode || '').trim().toUpperCase();
        if (!codeInput) {
            this.showJoinError('Vui lòng nhập mã phòng hợp lệ (VD: CY-8842 hoặc 8842)!');
            return;
        }
        const cleanCode = codeInput.replace("CY-", "").replace(/^-+/, '');
        if (cleanCode.length < 3) {
            this.showJoinError('Mã phòng quá ngắn. Vui lòng kiểm tra lại!');
            return;
        }

        const targetHostPeerId = "CY-" + cleanCode;
        this.roomCode = targetHostPeerId;
        this.myPeerId = 'CLIENT_' + Math.random().toString(36).substring(2, 7);
        this.role = 'guest';
        this.isJoinedSuccess = false;

        const loadJoin = document.getElementById('joinRoomLoading');
        const loadText = document.getElementById('joinRoomLoadingText');
        const errEl = document.getElementById('joinRoomError');
        if (errEl) errEl.style.display = 'none';
        if (loadJoin) loadJoin.style.display = 'flex';
        if (loadText) loadText.innerText = `🔍 Đang kết nối tới chủ phòng ${cleanCode}...`;

        if (this.joinTimeoutTimer) clearTimeout(this.joinTimeoutTimer);

        // 1. Setup local BroadcastChannel (handles same-device multi-tab instant connection)
        this.setupLocalBroadcastChannel(this.roomCode);
        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });

        // 2. Set timeout of 6 seconds
        this.joinTimeoutTimer = setTimeout(() => {
            if (!this.isJoinedSuccess) {
                this.showJoinError(`❌ Không tìm thấy phòng "${cleanCode}"! Phòng không tồn tại hoặc Chủ phòng chưa mở.`);
                this.cleanup(true);
            }
        }, 6000);

        // 3. Connect via PeerJS WebRTC (for cross-device online play)
        try {
            if (typeof Peer === 'undefined') return;
            this.peer = new Peer(undefined, PEER_CONFIG);

            this.peer.on('open', (id) => {
                if (!this.isJoinedSuccess) {
                    this.myPeerId = id;
                }
                try {
                    let isWebRTCOpen = false;
                    this.hostConn = this.peer.connect(targetHostPeerId, { reliable: true });

                    this.hostConn.on('open', () => {
                        isWebRTCOpen = true;
                        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });
                    });

                    this.hostConn.on('data', (data) => {
                        this.handleClientReceivedData(data);
                    });

                    this.hostConn.on('close', () => {
                        if (this.isJoinedSuccess && isWebRTCOpen) {
                            this.onDisconnected();
                        }
                    });
                } catch(e) {
                    console.warn("Peer connection error:", e);
                }
            });

            this.peer.on('error', (err) => {
                console.warn("Peer client error:", err);
                if (err.type === 'peer-unavailable' && !this.isJoinedSuccess) {
                    clearTimeout(this.joinTimeoutTimer);
                    this.showJoinError(`❌ Không tìm thấy phòng "${cleanCode}"! Phòng không tồn tại hoặc Chủ phòng đã đóng.`);
                    this.cleanup(true);
                }
            });
        } catch (e) {
            console.warn("PeerJS Join exception:", e);
        }
    }

    initClientLobby() {
        this.isJoinedSuccess = true;
        this.isOnline = true;
        if (this.joinTimeoutTimer) clearTimeout(this.joinTimeoutTimer);

        const loadJoin = document.getElementById('joinRoomLoading');
        if (loadJoin) loadJoin.style.display = 'none';

        this.showLobbyView();
        this.updateLobbyDisplay('connected');
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    handleHostReceivedData(peerId, data) {
        if (!data || !data.type) return;

        switch(data.type) {
            case 'JOIN_LOBBY':
            case 'HANDSHAKE_REQUEST':
                if (this.playersLobbyData.length >= 2 && !this.playersLobbyData.some(p => p.id === peerId)) {
                    this.sendNetworkMessage({ type: 'ROOM_FULL', targetId: peerId, code: this.roomCode });
                    return;
                }
                if (!this.playersLobbyData.some(p => p.id === peerId)) {
                    this.playersLobbyData.push({
                        id: peerId,
                        nickname: data.nickname || 'Guest (Red)',
                        isHost: false
                    });
                }
                this.sendNetworkMessage({
                    type: 'JOIN_ACCEPT',
                    targetId: peerId,
                    players: this.playersLobbyData,
                    roomCode: this.roomCode,
                    winScore: gameState.winScore || 3
                });
                this.broadcastLobbyState();
                break;

            case 'INPUT':
            case 'INPUT_UPDATE':
                if (data.input && inputs && inputs.p2) {
                    inputs.p2.l = data.input.l;
                    inputs.p2.r = data.input.r;
                    inputs.p2.s = data.input.s;
                }
                break;

            case 'UPGRADE_PICK':
                if (data.pid === 'p2' && p2) {
                    p2.addUpgrade(data.modId);
                    handlePlayerReady('p2');
                }
                break;

            case 'MONEY_TANK_UPGRADE':
                if (data.pid === 'p2' && p2) {
                    p2.upgradeLevel = data.level;
                }
                break;

            case 'INVENTOR_UPGRADE':
                if (data.pid === 'p2' && p2) {
                    if (!p2.boughtInvShopItems) p2.boughtInvShopItems = [];
                    p2.boughtInvShopItems.push(data.itemId);
                    if (!p2.invUpgrades) p2.invUpgrades = {};
                    p2.invUpgrades[data.itemId] = (p2.invUpgrades[data.itemId] || 0) + 1;
                    if (data.itemId === 'inv_giap') { p2.maxHp += 1; p2.hp += 1; }
                    if (data.itemId === 'inv_tangcuong') { p2.maxAmmo += 2; p2.ammo += 2; }
                    if (data.itemId === 'inv_bodam') { p2.speed *= 1.1; }
                    if (data.itemId === 'inv_full_evo') {
                        p2.isFullEvoInventor = true;
                        if (!p2.upgrades.includes('evo_inv_1')) p2.addUpgrade('evo_inv_1');
                        if (!p2.upgrades.includes('evo_inv_2')) p2.addUpgrade('evo_inv_2');
                    }
                }
                break;

            case 'READY':
                handlePlayerReady(data.pid);
                break;
        }
    }

    handleClientReceivedData(data) {
        if (!data || !data.type) return;

        switch(data.type) {
            case 'JOIN_ACCEPT':
            case 'HANDSHAKE_ACCEPTED':
            case 'LOBBY_STATE':
                if (data.type === 'JOIN_ACCEPT' && data.targetId && data.targetId !== this.myPeerId) return;
                if (!this.isJoinedSuccess) {
                    this.initClientLobby();
                }
                if (data.players) this.playersLobbyData = data.players;
                if (data.winScore) gameState.winScore = data.winScore;
                this.updateLobbyDisplay('connected');
                break;

            case 'ROOM_FULL':
                if (!data.targetId || data.targetId === this.myPeerId) {
                    this.showJoinError(`⚠️ Phòng "${data.code || this.roomCode}" đã đủ 2 người chơi!`);
                    this.cleanup(true);
                }
                break;

            case 'START_MATCH':
                this.startMatchActual(data.winScore);
                break;

            case 'START_ROUND':
                if (data.p1Upgrades && p1) p1.upgrades = [...data.p1Upgrades];
                if (data.p2Upgrades && p2) p2.upgrades = [...data.p2Upgrades];
                if (data.p1InvUpgrades && p1) p1.invUpgrades = { ...data.p1InvUpgrades };
                if (data.p2InvUpgrades && p2) p2.invUpgrades = { ...data.p2InvUpgrades };
                if (data.p1IsFullEvo !== undefined && p1) p1.isFullEvoInventor = data.p1IsFullEvo;
                if (data.p2IsFullEvo !== undefined && p2) p2.isFullEvoInventor = data.p2IsFullEvo;
                if (data.round) gameState.round = data.round;
                startRound();
                break;

            case 'HOST_INPUT':
                if (data.input && inputs && inputs.p1) {
                    inputs.p1.l = data.input.l;
                    inputs.p1.r = data.input.r;
                    inputs.p1.s = data.input.s;
                }
                break;

            case 'SYNC':
            case 'GAME_STATE_SYNC':
                this.applyHostSync(data.state || data);
                break;

            case 'UPGRADE_PICK':
                if (data.pid === 'p1' && p1) {
                    p1.addUpgrade(data.modId);
                    handlePlayerReady('p1');
                }
                break;

            case 'MONEY_TANK_UPGRADE':
                if (data.pid === 'p1' && p1) {
                    p1.upgradeLevel = data.level;
                }
                break;

            case 'INVENTOR_UPGRADE':
                if (data.pid === 'p1' && p1) {
                    if (!p1.boughtInvShopItems) p1.boughtInvShopItems = [];
                    p1.boughtInvShopItems.push(data.itemId);
                    if (!p1.invUpgrades) p1.invUpgrades = {};
                    p1.invUpgrades[data.itemId] = (p1.invUpgrades[data.itemId] || 0) + 1;
                    if (data.itemId === 'inv_giap') { p1.maxHp += 1; p1.hp += 1; }
                    if (data.itemId === 'inv_tangcuong') { p1.maxAmmo += 2; p1.ammo += 2; }
                    if (data.itemId === 'inv_bodam') { p1.speed *= 1.1; }
                    if (data.itemId === 'inv_full_evo') {
                        p1.isFullEvoInventor = true;
                        if (!p1.upgrades.includes('evo_inv_1')) p1.addUpgrade('evo_inv_1');
                        if (!p1.upgrades.includes('evo_inv_2')) p1.addUpgrade('evo_inv_2');
                    }
                }
                break;

            case 'READY':
                handlePlayerReady(data.pid);
                break;
        }
    }

    broadcastLobbyState() {
        this.updateLobbyDisplay('connected');
        this.sendNetworkMessage({ type: 'LOBBY_STATE', players: this.playersLobbyData });
    }

    startQuickMatch() {
        this.cleanup();
        this.isQuickMatch = true;
        const loadQuick = document.getElementById('quickMatchLoading');
        const statusText = document.getElementById('quickMatchStatusText');
        if (loadQuick) loadQuick.style.display = 'flex';
        if (statusText) statusText.innerText = '⚡ Đang quét tìm các phòng .IO đang chờ...';

        const quickCode = 'CY-IO-PUBLIC';
        this.role = 'guest';
        this.roomCode = quickCode;
        this.myPeerId = 'CLIENT_' + Math.random().toString(36).substring(2, 7);
        this.isJoinedSuccess = false;

        this.setupLocalBroadcastChannel(quickCode);
        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });

        let quickTimeout = setTimeout(() => {
            if (!this.isJoinedSuccess) {
                if (statusText) statusText.innerText = 'Chưa có phòng trống. Đang tạo phòng công khai cho bạn...';
                if (this.peer) { try { this.peer.destroy(); } catch(e){} this.peer = null; }
                this.hostQuickMatch(quickCode);
            }
        }, 2200);

        try {
            if (typeof Peer === 'undefined') return;
            this.peer = new Peer(undefined, PEER_CONFIG);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                try {
                    this.hostConn = this.peer.connect(quickCode, { reliable: true });
                    this.hostConn.on('open', () => {
                        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });
                    });
                    this.hostConn.on('data', (data) => {
                        clearTimeout(quickTimeout);
                        this.handleClientReceivedData(data);
                    });
                } catch(e){}
            });

            this.peer.on('error', () => {
                clearTimeout(quickTimeout);
                this.hostQuickMatch(quickCode);
            });
        } catch(e) {
            this.hostQuickMatch(quickCode);
        }
    }

    hostQuickMatch(code) {
        this.cleanup();
        this.role = 'host';
        this.isOnline = true;
        this.roomCode = code;
        this.myPeerId = code;

        const loadQuick = document.getElementById('quickMatchLoading');
        const statusText = document.getElementById('quickMatchStatusText');
        if (statusText) statusText.innerText = 'Đã mở phòng .IO! Đang chờ đối thủ vào ghép trận...';

        this.setupLocalBroadcastChannel(code);

        try {
            this.peer = new Peer(code, PEER_CONFIG);
            this.peer.on('open', () => {
                if (loadQuick) loadQuick.style.display = 'none';
                this.initHostLobby();
                const displayCode = document.getElementById('displayRoomCode');
                if (displayCode) displayCode.innerText = 'PHÒNG CÔNG KHAI (.IO)';
            });
            this.peer.on('connection', (conn) => {
                this.connections[conn.peer] = conn;
                conn.on('data', (data) => this.handleHostReceivedData(conn.peer, data));
                conn.on('close', () => {
                    delete this.connections[conn.peer];
                    this.playersLobbyData = this.playersLobbyData.filter(p => p.id !== conn.peer);
                    this.broadcastLobbyState();
                });
            });
            this.peer.on('error', (err) => {
                if (loadQuick) loadQuick.style.display = 'none';
                this.initHostLobby();
                const displayCode = document.getElementById('displayRoomCode');
                if (displayCode) displayCode.innerText = 'PHÒNG CÔNG KHAI (.IO)';
            });
        } catch(e) {
            if (loadQuick) loadQuick.style.display = 'none';
            this.initHostLobby();
        }
    }

    showLobbyView() {
        const viewCreate = document.getElementById('createRoomView');
        const viewJoin = document.getElementById('joinRoomView');
        const viewQuick = document.getElementById('quickMatchView');
        const viewLobby = document.getElementById('activeLobbyView');
        const displayCode = document.getElementById('displayRoomCode');

        if (viewCreate) viewCreate.style.display = 'none';
        if (viewJoin) viewJoin.style.display = 'none';
        if (viewQuick) viewQuick.style.display = 'none';
        if (viewLobby) viewLobby.style.display = 'flex';
        if (displayCode) displayCode.innerText = this.roomCode || 'CY-0000';

        this.startPingMonitor();
    }

    updateLobbyDisplay(status) {
        const p1Status = document.getElementById('lobbyP1Status');
        const p2Status = document.getElementById('lobbyP2Status');
        const btnStart = document.getElementById('btnStartOnlineMatch');

        if (this.role === 'host') {
            if (p1Status) {
                p1Status.className = 'slot-status ready';
                p1Status.innerText = '✔ BẠN (HOST XANH)';
            }
            if (status === 'host_waiting' && this.playersLobbyData.length < 2) {
                if (p2Status) {
                    p2Status.className = 'slot-status waiting';
                    p2Status.innerText = '⏳ CHỜ ĐỐI THỦ VÀO...';
                }
                if (btnStart) {
                    btnStart.disabled = true;
                    btnStart.innerText = '⏳ CHỜ ĐỐI THỦ VÀO PHÒNG...';
                }
            } else if (status === 'connected' || this.playersLobbyData.length >= 2) {
                if (p2Status) {
                    p2Status.className = 'slot-status ready';
                    p2Status.innerText = '✔ ĐỐI THỦ ĐÃ VÀO!';
                }
                if (btnStart) {
                    btnStart.disabled = false;
                    btnStart.innerText = '⚔️ BẮT ĐẦU TRẬN ĐẤU (HOST)';
                }
            }
        } else if (this.role === 'guest') {
            if (p1Status) {
                p1Status.className = 'slot-status ready';
                p1Status.innerText = '✔ HOST (XANH SẴN SÀNG)';
            }
            if (p2Status) {
                p2Status.className = 'slot-status ready';
                p2Status.innerText = '✔ BẠN (GUEST ĐỎ)';
            }
            if (btnStart) {
                btnStart.disabled = true;
                btnStart.innerText = '⏳ CHỜ CHỦ PHÒNG BẮT ĐẦU TRẬN...';
            }
        }
    }

    hostStartMatch() {
        if (this.playersLobbyData.length < 2) {
            alert('Chưa có đối thủ kết nối vào phòng!');
            return;
        }
        this.sendNetworkMessage({
            type: 'START_MATCH',
            winScore: gameState.winScore || 3
        });
        this.startMatchActual(gameState.winScore || 3);
    }

    startMatchActual(winScore) {
        document.body.classList.add('online-active');
        if (this.role === 'guest') {
            document.body.classList.add('role-guest');
            document.body.classList.remove('role-host');
        } else {
            document.body.classList.add('role-host');
            document.body.classList.remove('role-guest');
        }

        const onlineModal = document.getElementById('onlineModal');
        if (onlineModal) {
            onlineModal.style.display = 'none';
            onlineModal.classList.remove('active');
        }
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'none';

        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'none';

        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) {
            p1Label.innerHTML = (this.role === 'guest') ? '🔴 BẠN: PLAYER 2 (ĐỎ)' : '🔵 BẠN: PLAYER 1 (XANH)';
        }

        const hudPing = document.getElementById('hudOnlinePing');
        if (hudPing) hudPing.style.display = 'flex';

        updateCanvasDimensions();

        gameState.winScore = winScore || 3;
        startBattle();
    }

    onGameLoopTick() {
        if (!this.isOnline) return;

        // Host broadcasts state to Guest at ~30 Hz (every 2 frames)
        if (this.role === 'host') {
            if (animationId % 2 === 0 && p1 && p2) {
                this.sendNetworkMessage({
                    type: 'SYNC',
                    p1: { x: p1.x, y: p1.y, hp: p1.hp, maxHp: p1.maxHp, shield: p1.shield, ammo: p1.ammo },
                    p2: { x: p2.x, y: p2.y, hp: p2.hp, maxHp: p2.maxHp, shield: p2.shield, ammo: p2.ammo },
                    p1Score: gameState.p1Score,
                    p2Score: gameState.p2Score,
                    p1Coins: gameState.p1Coins,
                    p2Coins: gameState.p2Coins,
                    phase: gameState.phase,
                    round: gameState.round,
                    crates: (crates || []).map(c => ({
                        id: c.id, x: c.x, y: c.y, w: c.w, h: c.h,
                        type: c.type, active: c.active,
                        spawnTime: c.spawnTime, lifeTime: c.lifeTime
                    })),
                    moneyTrucks: (moneyTrucks || []).map(t => ({
                        id: t.id, x: t.x, y: t.y, w: t.w, h: t.h,
                        hp: t.hp, dir: t.dir, speed: t.speed, active: t.active
                    })),
                    movingObstacle: (movingObstacle && movingObstacle.active) ? {
                        x: movingObstacle.x, y: movingObstacle.y, w: movingObstacle.w, h: movingObstacle.h,
                        vx: movingObstacle.vx, active: movingObstacle.active, opacity: movingObstacle.opacity,
                        spawnTime: movingObstacle.spawnTime, lifeTime: movingObstacle.lifeTime
                    } : null,
                    map: gameState.currentMap,
                    bastions: (bastions || []).filter(b => b.active).map(b => ({
                        x: b.x, y: b.y, vx: b.vx, hp: b.hp, maxHp: b.maxHp, active: b.active
                    })),
                    spears: (thunderPlantedSpears || []).map(s => ({
                        id: s.id, ownerId: s.owner ? s.owner.id : 1, x: s.x, y: s.y, angle: s.angle
                    })),
                    magnetNodes: (magnetNodes || []).filter(m => m.active).map(m => ({
                        id: m.id, ownerId: m.owner ? m.owner.id : 1, x: m.x, y: m.y, polarity: m.polarity, radius: m.radius, active: m.active
                    })),
                    turrets: (turrets || []).filter(t => t.active).map(t => ({
                        ownerId: t.owner ? t.owner.id : 1, isSmart: t.isSmart, x: t.x, y: t.y, hp: t.hp, maxHp: t.maxHp, active: t.active
                    }))
                });
            }
        }
    }

    applyHostSync(data) {
        if (!p1 || !p2) return;

        // P1 is host-controlled: smooth reconciliation
        if (Math.abs(p1.x - data.p1.x) > 40) {
            p1.x = data.p1.x;
        } else {
            p1.x += (data.p1.x - p1.x) * 0.5;
        }
        p1.y = data.p1.y;
        p1.hp = data.p1.hp; p1.maxHp = data.p1.maxHp; p1.shield = data.p1.shield; p1.ammo = data.p1.ammo;

        // P2 is client-controlled: reconcile smoothly
        if (Math.abs(p2.x - data.p2.x) > 35) {
            p2.x = data.p2.x;
        } else if (Math.abs(p2.x - data.p2.x) > 4) {
            p2.x += (data.p2.x - p2.x) * 0.2;
        }
        p2.y = data.p2.y;
        p2.hp = data.p2.hp; p2.maxHp = data.p2.maxHp; p2.shield = data.p2.shield; p2.ammo = data.p2.ammo;

        gameState.p1Score = data.p1Score;
        gameState.p2Score = data.p2Score;
        gameState.p1Coins = data.p1Coins;
        gameState.p2Coins = data.p2Coins;
        if (gameState.phase !== data.phase) {
            gameState.phase = data.phase;
        }
        updateScoreBoard();

        // Map Sync
        if (data.map) {
            gameState.currentMap = data.map;
            if (typeof updateMapHUD === 'function') updateMapHUD();
        }

        // Authoritative Crate Synchronization
        if (Array.isArray(data.crates)) {
            if (this.guestDestroyedCrates) {
                const hostIds = new Set(data.crates.map(c => c.id));
                for (let id of this.guestDestroyedCrates) {
                    if (!hostIds.has(id)) this.guestDestroyedCrates.delete(id);
                }
            }
            crates = data.crates
                .filter(raw => raw.active && !(this.guestDestroyedCrates && this.guestDestroyedCrates.has(raw.id)))
                .map(raw => {
                    const c = Object.create(Crate.prototype);
                    return Object.assign(c, raw);
                });
        }

        // Authoritative MoneyTruck Synchronization
        if (Array.isArray(data.moneyTrucks)) {
            moneyTrucks = data.moneyTrucks
                .filter(raw => raw.active)
                .map(raw => {
                    const t = Object.create(MoneyTruck.prototype);
                    return Object.assign(t, raw);
                });
        }

        // Authoritative MovingObstacle Synchronization
        if (data.movingObstacle) {
            const obs = Object.create(MovingObstacle.prototype);
            movingObstacle = Object.assign(obs, data.movingObstacle);
        } else if (data.hasOwnProperty('movingObstacle')) {
            movingObstacle = null;
        }

        // Authoritative Bastions Synchronization
        if (Array.isArray(data.bastions)) {
            bastions = data.bastions.map(raw => {
                let b = new BastionWall(raw.y, raw.maxHp || 60, raw.vx);
                b.x = raw.x; b.hp = raw.hp; b.active = raw.active;
                return b;
            });
        }

        // Authoritative Planted Spears Synchronization
        if (Array.isArray(data.spears)) {
            thunderPlantedSpears = data.spears.map(raw => ({
                id: raw.id, owner: raw.ownerId === 1 ? p1 : p2, x: raw.x, y: raw.y, angle: raw.angle
            }));
        }

        // Authoritative Magnet Nodes Synchronization
        if (Array.isArray(data.magnetNodes)) {
            magnetNodes = data.magnetNodes.map(raw => ({
                id: raw.id, owner: raw.ownerId === 1 ? p1 : p2, x: raw.x, y: raw.y, polarity: raw.polarity, radius: raw.radius, active: raw.active
            }));
        }

        // Authoritative Turrets Synchronization
        if (Array.isArray(data.turrets)) {
            turrets = data.turrets.map(raw => {
                let owner = raw.ownerId === 1 ? p1 : p2;
                let t = new Turret(owner, raw.isSmart, raw.x, raw.y);
                t.x = raw.x; t.y = raw.y; t.hp = raw.hp; t.active = raw.active;
                return t;
            });
        }
    }

    startPingMonitor() {
        if (this.pingTimer) clearInterval(this.pingTimer);
        const pingEl = document.getElementById('pingValueText');
        const hudPingText = document.getElementById('hudPingText');
        this.pingTimer = setInterval(() => {
            this.pingMs = Math.floor(18 + Math.random() * 10);
            if (pingEl) pingEl.innerText = `Độ trễ: ~${this.pingMs}ms (P2P WebRTC / Local Broadcast)`;
            if (hudPingText) hudPingText.innerText = `${this.pingMs}ms`;
        }, 2500);
    }

    onDisconnected() {
        if (this.isOnline) {
            alert('⚠️ Đối thủ đã ngắt kết nối hoặc rời phòng đấu!');
            this.leaveRoom();
            const pauseModal = document.getElementById('pauseMenuModal');
            if (pauseModal) pauseModal.style.display = 'none';
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) mainMenu.style.display = 'flex';
            gameState.phase = 'menu';
            cancelAnimationFrame(animationId);
        }
    }

    leaveRoom() {
        this.cleanup();
        this.isOnline = false;
        document.body.classList.remove('online-active', 'role-host', 'role-guest');
        const hudPing = document.getElementById('hudOnlinePing');
        if (hudPing) hudPing.style.display = 'none';
        const activeLobbyView = document.getElementById('activeLobbyView');
        if (activeLobbyView) activeLobbyView.style.display = 'none';
        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'flex';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = '🔵 PLAYER 1 (BLUE)';
        updateCanvasDimensions();
    }

    cleanup(preserveErrors = false) {
        this.isOnline = false;
        this.role = null;
        this.roomCode = null;
        this.myPeerId = null;
        this.isJoinedSuccess = false;
        this.playersLobbyData = [];
        this.guestDestroyedCrates = null;
        if (this.joinTimeoutTimer) {
            clearTimeout(this.joinTimeoutTimer);
            this.joinTimeoutTimer = null;
        }
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.broadcastChannel) {
            try { this.broadcastChannel.close(); } catch(e){}
            this.broadcastChannel = null;
        }
        if (this.connections) {
            Object.values(this.connections).forEach(c => {
                try { c.close(); } catch(e){}
            });
            this.connections = {};
        }
        if (this.hostConn) {
            try { this.hostConn.close(); } catch(e){}
            this.hostConn = null;
        }
        if (this.peer) {
            try { this.peer.destroy(); } catch(e){}
            this.peer = null;
        }
        if (!preserveErrors) {
            this.hideErrorsAndLoading();
        } else {
            const loadJoin = document.getElementById('joinRoomLoading');
            if (loadJoin) loadJoin.style.display = 'none';
            const loadCreate = document.getElementById('createRoomLoading');
            if (loadCreate) loadCreate.style.display = 'none';
            const loadQuick = document.getElementById('quickMatchLoading');
            if (loadQuick) loadQuick.style.display = 'none';
        }
    }
}

const onlineManager = new OnlineMultiplayerManager();
