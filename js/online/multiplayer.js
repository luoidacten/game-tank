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
        this.pingMs = 0;
        this.pingTimer = null;
        this.isQuickMatch = false;

        // ID cố định của máy này (không đổi khi PeerJS cấp peer id mới) + chống trùng tin nhắn
        this.clientId = 'C' + Math.random().toString(36).substring(2, 10);
        this.sendSeq = 0;
        this.seenSeq = {};       // { senderId: Set(seq) }
        this.peerToClient = {};  // Host: peerId WebRTC -> clientId
        this.lastHeard = 0;
        this.matchActive = false;

        // Đồng bộ trận đấu
        this.netTick = 0;
        this.lastSnapshotAt = 0;
        this.predX = null;
        this.lastInputSent = '';
        this.lastInputSentTick = 0;
        this.inSeq = 0;        // guest: số thứ tự phím đang giữ
        this.p2InSeq = -1;     // host: phím mới nhất đã nhận từ guest
        this.p2InTicks = 0;
        this.resetNetPrediction();
    }

    // Dự đoán xe của guest: lịch sử phím chưa được host xác nhận (mỗi tick 1 phần tử {seq, dir})
    resetNetPrediction() {
        this.predX = null;
        this.predOff = 0;      // độ lệch hiển thị giảm dần sau mỗi lần sửa (tránh giật)
        this.inHist = [];
        this.ackSeq = -1; this.ackDone = 0;
    }

    // Nhận mọi tin nhắn (từ BroadcastChannel hoặc WebRTC) qua 1 cửa: lọc trùng rồi định tuyến
    receive(data, transportId) {
        if (!data || !data.type) return;
        const from = data._from || transportId;
        if (from === this.clientId) return;
        if (data._seq !== undefined) {
            const set = this.seenSeq[from] || (this.seenSeq[from] = new Set());
            if (set.has(data._seq)) return; // đã nhận qua kênh khác
            set.add(data._seq);
            if (set.size > 4000) {
                const keep = [...set].sort((a, b) => a - b).slice(-2000);
                this.seenSeq[from] = new Set(keep);
            }
        }
        if (transportId && data._from && this.role === 'host') this.peerToClient[transportId] = data._from;
        this.lastHeard = Date.now();

        // Thăm dò Ghép nhanh: trả lời riêng kết nối thăm dò, không tính là người chơi
        if (data.type === 'QM_PROBE') { this.answerQuickProbe(transportId); return; }
        if (data.type === 'PING') { this.sendNetworkMessage({ type: 'PONG', t: data.t }); return; }
        if (data.type === 'PONG') { this.onPong(data.t); return; }

        if (this.role === 'host') this.handleHostReceivedData(from, data);
        else this.handleClientReceivedData(data);
    }

    onPong(t) {
        if (typeof t !== 'number') return;
        const rtt = Math.max(1, Date.now() - t);
        this.pingMs = this.pingMs ? Math.round(this.pingMs * 0.7 + rtt * 0.3) : rtt;
        const pingEl = document.getElementById('pingValueText');
        const hudPingText = document.getElementById('hudPingText');
        const via = (this.hostConn && this.hostConn.open) || Object.values(this.connections).some(c => c && c.open) ? 'P2P WebRTC' : 'Local Broadcast';
        if (pingEl) pingEl.innerText = `Độ trễ: ${this.pingMs}ms (${via})`;
        if (hudPingText) hudPingText.innerText = `${this.pingMs}ms`;
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
                if (!payload || senderId === this.clientId) return;
                this.receive(payload, senderId);
            };
        } catch (e) {
            console.warn("BroadcastChannel error:", e);
        }
    }

    sendNetworkMessage(payload) {
        payload = Object.assign({}, payload, { _from: this.clientId, _seq: ++this.sendSeq });
        // 1. Send to local broadcast channel (for same-machine multi-tab/window testing)
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage({ senderId: this.clientId, payload });
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
                this.probeQuickMatch();
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
                conn.on('data', (data) => this.receive(data, conn.peer));
                conn.on('close', () => this.onHostConnClosed(conn.peer));
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
                        this.receive(data, targetHostPeerId);
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
                    // Số thứ tự phím (guest tăng mỗi lần đổi phím): bỏ gói cũ đến trễ,
                    // đếm số tick đã chạy với phím hiện tại để guest đối chiếu dự đoán
                    if (typeof data.seq === 'number') {
                        if (data.seq < this.p2InSeq && this.p2InSeq - data.seq < 50) break; // gói cũ đến trễ
                        if (data.seq !== this.p2InSeq) { this.p2InSeq = data.seq; this.p2InTicks = 0; }
                    }
                    inputs.p2.l = !!data.input.l;
                    inputs.p2.r = !!data.input.r;
                    inputs.p2.s = !!data.input.s;
                }
                break;

            case 'LOADOUT':
                // Guest chỉ được sửa trang bị của chính mình (P2)
                if (data.pid === 'p2' && p2) NetState.applyLoadout(p2, 'p2', data.loadout);
                break;

            case 'PAY_TO_WIN':
                if (gameState.phase === 'upgrade' && gameState.p2Coins >= 500) {
                    gameState.p2Coins -= 500;
                    endRound(2);
                    const upg = document.getElementById('upgradeScreen');
                    if (upg) upg.style.display = 'none';
                }
                break;

            case 'READY':
                if (data.pid === 'p2') handlePlayerReady('p2', true);
                break;

            case 'LEAVE':
                this.onDisconnected();
                break;
        }
    }

    handleClientReceivedData(data) {
        if (!data || !data.type) return;

        switch(data.type) {
            case 'JOIN_ACCEPT':
            case 'HANDSHAKE_ACCEPTED':
            case 'LOBBY_STATE':
                if (data.type === 'JOIN_ACCEPT' && data.targetId && data.targetId !== this.clientId) return;
                if (!this.isJoinedSuccess) {
                    this.initClientLobby();
                }
                if (data.players) this.playersLobbyData = data.players;
                if (data.winScore) gameState.winScore = data.winScore;
                this.updateLobbyDisplay('connected');
                break;

            case 'ROOM_FULL':
                if (this.isQuickMatch && (!data.targetId || data.targetId === this.clientId)) {
                    this.setQuickNotice('busy', '🟠 Phòng ghép công khai đang có trận. Hãy thử lại sau ít phút hoặc tạo phòng riêng mời bạn bè.');
                }
                if (!data.targetId || data.targetId === this.clientId) {
                    this.showJoinError(`⚠️ Phòng "${data.code || this.roomCode}" đã đủ 2 người chơi!`);
                    this.cleanup(true);
                }
                break;

            case 'START_MATCH':
                this.startMatchActual(data.winScore);
                break;

            case 'START_ROUND':
                // Host là nguồn chuẩn cho trang bị & ví của cả 2 bên
                if (data.p1Loadout) NetState.applyLoadout(p1, 'p1', data.p1Loadout);
                if (data.p2Loadout) NetState.applyLoadout(p2, 'p2', data.p2Loadout);
                if (data.round) gameState.round = data.round;
                if (data.map) gameState.currentMap = data.map;
                this.resetNetPrediction();
                startRound();
                break;

            case 'SYNC':
                this.applyHostSync(data);
                break;

            case 'ROUND_END':
                this.guestEndRound(data);
                break;

            case 'LOADOUT':
                if (data.pid === 'p1' && p1) NetState.applyLoadout(p1, 'p1', data.loadout);
                break;

            case 'READY':
                if (data.pid === 'p1') handlePlayerReady('p1', true);
                break;

            case 'LEAVE':
                this.onDisconnected();
                break;
        }
    }

    // Gửi trang bị + ví của người chơi máy này sau mỗi lần mua / chọn
    sendLoadout(pid) {
        if (!this.isOnline) return;
        const p = pid === 'p1' ? p1 : p2;
        const coins = pid === 'p1' ? gameState.p1Coins : gameState.p2Coins;
        this.sendNetworkMessage({ type: 'LOADOUT', pid, loadout: NetState.captureLoadout(p, coins) });
    }

    sendReady(pid) {
        if (!this.isOnline) return;
        this.sendNetworkMessage({ type: 'READY', pid });
    }

    myPid() {
        return this.role === 'guest' ? 'p2' : 'p1';
    }

    // Host: thông báo bắt đầu hiệp kèm trang bị chuẩn của cả 2 bên
    sendStartRound() {
        this.sendNetworkMessage({
            type: 'START_ROUND',
            round: gameState.round,
            map: gameState.currentMap,
            p1Loadout: NetState.captureLoadout(p1, gameState.p1Coins),
            p2Loadout: NetState.captureLoadout(p2, gameState.p2Coins)
        });
    }

    // Host: kết thúc hiệp -> gửi ảnh chụp cuối + kết quả cho Guest
    sendRoundEnd(winnerId) {
        if (!this.isOnline || this.role !== 'host') return;
        this.sendNetworkMessage({
            type: 'ROUND_END',
            winnerId,
            world: NetState.captureWorld(),
            ev: NetState.flushEvents(),
            p1Loadout: NetState.captureLoadout(p1, gameState.p1Coins),
            p2Loadout: NetState.captureLoadout(p2, gameState.p2Coins),
        });
        NetState.recording = false;
    }

    // Guest: hiển thị kết thúc hiệp theo kết quả host
    guestEndRound(data) {
        if (data.world) { try { NetState.applyWorld(data.world); } catch (e) { console.warn('ROUND_END world', e); } }
        NetState.replayEvents(data.ev);
        if (data.p1Loadout) NetState.applyLoadout(p1, 'p1', data.p1Loadout);
        if (data.p2Loadout) NetState.applyLoadout(p2, 'p2', data.p2Loadout);
        fatalCinematic.active = false;
        gameState.phase = 'end_round';
        cancelAnimationFrame(animationId);
        const ctrl = document.getElementById('p1-controls');
        if (ctrl) ctrl.classList.remove('blinded-hud');
        updateScoreBoard();
        let targetWins = gameState.winScore || 3;
        if (gameState.p1Score >= targetWins || gameState.p2Score >= targetWins) {
            const iWon = (gameState.p2Score >= targetWins);
            document.getElementById('finalWinner').innerText = (iWon ? "BẠN (PLAYER 2)" : "PLAYER 1") + " VÔ ĐỊCH!";
            setTimeout(() => { document.getElementById('endScreen').style.display = 'block'; }, 1200);
        } else {
            gameState.round++; // host cũng tăng hiệp sau khi gửi ROUND_END
            setTimeout(showUpgradeScreen, 1800);
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
        this.qmStart = Date.now();
        this.qmPhase = 'search';
        this.startQuickTicker();

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
                        if (this.qmPhase === 'search') this.qmPhase = 'joined';
                        this.receive(data, quickCode);
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
        this.isQuickMatch = true;
        this.qmPhase = 'hosting';
        this.qmHostSince = Date.now();
        this.qmProbePeers = {};
        this.startQuickTicker();

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
                conn.on('data', (data) => this.receive(data, conn.peer));
                conn.on('close', () => this.onHostConnClosed(conn.peer));
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

    // ===== GHÉP NHANH: thông báo trạng thái (không có máy chủ đếm người -> thăm dò phòng công khai) =====
    setQuickNotice(kind, html) {
        for (const id of ['quickMatchNotice', 'lobbyQuickNotice']) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (id === 'lobbyQuickNotice' && !this.isQuickMatch) { el.style.display = 'none'; continue; }
            el.style.display = 'block';
            el.className = 'qm-notice qm-' + kind;
            el.innerHTML = html;
        }
    }

    fmtElapsed(ms) {
        const s = Math.max(0, Math.floor(ms / 1000));
        return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    // Host phòng công khai trả lời kết nối thăm dò: có đang chờ người ghép không
    answerQuickProbe(tid) {
        if (this.role !== 'host' || !tid) return;
        const conn = this.connections[tid];
        if (!this.qmProbePeers) this.qmProbePeers = {};
        this.qmProbePeers[tid] = true;
        const waiting = !this.matchActive && this.playersLobbyData.length < 2;
        try { if (conn && conn.open) conn.send({ type: 'QM_STATUS', waiting, waitMs: this.qmHostSince ? Date.now() - this.qmHostSince : 0 }); } catch (e) {}
    }

    // Thăm dò (không vào phòng) xem có ai đang mở phòng Ghép nhanh không
    probeQuickMatch() {
        if (this.qmProbeBusy || (this.isQuickMatch && this.qmPhase)) return;
        if (typeof Peer === 'undefined') {
            this.setQuickNotice('none', '⚪ Không kết nối được máy chủ ghép. Bấm tìm để mở phòng chờ trên máy này, hoặc mời bạn bè bằng mã phòng.');
            return;
        }
        this.qmProbeBusy = true;
        this.setQuickNotice('scan', '🔎 Đang kiểm tra phòng ghép công khai...');
        let probe = null, done = false;
        const finish = (kind, html) => {
            if (done) return;
            done = true;
            this.qmProbeBusy = false;
            clearTimeout(t);
            try { if (probe) probe.destroy(); } catch (e) {}
            if (!(this.isQuickMatch && this.qmPhase)) this.setQuickNotice(kind, html);
        };
        const NONE = '⚪ Chưa có ai đang ghép. Bấm <b>TÌM TRẬN</b> để mở phòng và chờ, hoặc mời bạn bè.';
        const t = setTimeout(() => finish('none', NONE), 5000);
        try {
            probe = new Peer(undefined, PEER_CONFIG);
            probe.on('open', () => {
                try {
                    const c = probe.connect('CY-IO-PUBLIC', { reliable: true });
                    c.on('open', () => { try { c.send({ type: 'QM_PROBE' }); } catch (e) {} });
                    c.on('data', (d) => {
                        if (!d || d.type !== 'QM_STATUS') return;
                        if (d.waiting) finish('found', `🟢 Có <b>1 người</b> đang chờ ghép (đã chờ ${this.fmtElapsed(d.waitMs || 0)}). Bấm <b>TÌM TRẬN</b> để vào ngay!`);
                        else finish('busy', '🟠 Phòng ghép công khai đang có trận. Bấm tìm để thử lại, hoặc mời bạn bè.');
                    });
                } catch (e) { finish('none', NONE); }
            });
            probe.on('error', (err) => {
                if (err && err.type === 'peer-unavailable') finish('none', NONE);
                else finish('none', '⚪ Không kiểm tra được (mạng/máy chủ bận). Bạn vẫn có thể bấm tìm trận.');
            });
        } catch (e) { finish('none', NONE); }
    }

    // Cập nhật thông báo mỗi giây khi đang tìm / đang chờ trong phòng công khai
    startQuickTicker() {
        if (this.qmTicker) clearInterval(this.qmTicker);
        const tick = () => {
            const modal = document.getElementById('onlineModal');
            const open = !modal || modal.style.display !== 'none';
            if (!this.isQuickMatch || !this.qmPhase || this.matchActive || !open) {
                clearInterval(this.qmTicker); this.qmTicker = null;
                return;
            }
            if (this.qmPhase === 'search') {
                this.setQuickNotice('scan', `🔎 Đang tìm đối thủ... ${this.fmtElapsed(Date.now() - this.qmStart)}`);
            } else if (this.qmPhase === 'joined' || (this.role === 'guest' && this.isJoinedSuccess)) {
                this.setQuickNotice('found', '✅ Đã tìm thấy người đang chờ — đã vào phòng của họ! Chờ chủ phòng bắt đầu.');
            } else if (this.role === 'host') {
                if (this.playersLobbyData.length >= 2) this.setQuickNotice('found', '✅ Đã ghép được đối thủ! Bấm BẮT ĐẦU để vào trận.');
                else this.setQuickNotice('wait', `⏳ Chưa có ai khác đang ghép — bạn đang mở phòng công khai và chờ người tiếp theo (${this.fmtElapsed(Date.now() - (this.qmHostSince || this.qmStart))}). Có thể mời bạn bè bấm Ghép nhanh.`);
            }
        };
        tick();
        this.qmTicker = setInterval(tick, 1000);
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
        const qmLobby = document.getElementById('lobbyQuickNotice');
        if (qmLobby && !this.isQuickMatch) qmLobby.style.display = 'none';

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

        NetState.installHooks();
        this.matchActive = true;
        this.lastHeard = Date.now();
        gameState.winScore = winScore || 3;
        startBattle();
    }

    // Gọi mỗi tick vật lý (host & guest)
    onGameLoopTick() {
        if (!this.isOnline) return;
        this.netTick++;
        // Gửi lại phím định kỳ (phòng mất gói) + khi có thay đổi
        const pid = this.myPid();
        const inp = inputs[pid];
        const key = (inp.l ? 'L' : '') + (inp.r ? 'R' : '') + (inp.s ? 'S' : '');
        if (key !== this.lastInputSent) this.inSeq++;
        if (key !== this.lastInputSent || this.netTick - this.lastInputSentTick >= 15) {
            this.lastInputSent = key;
            this.lastInputSentTick = this.netTick;
            this.sendNetworkMessage({ type: this.role === 'guest' ? 'INPUT' : 'HOST_INPUT', input: { l: inp.l, r: inp.r, s: inp.s }, seq: this.inSeq });
        }
        // Host: số tick đã mô phỏng với phím hiện tại của guest (gửi kèm ảnh chụp qua p2.netInSeq / netInTicks)
        if (this.role === 'host' && p2) { this.p2InTicks++; p2.netInSeq = this.p2InSeq; p2.netInTicks = this.p2InTicks; }
    }

    // Host: cuối mỗi tick, gửi ảnh chụp thế giới ~30 lần/giây
    onTickEnd() {
        if (!this.isOnline || this.role !== 'host') return;
        NetState.recording = true;
        if (this.netTick % 2 !== 0) return;
        let world;
        try { world = NetState.captureWorld(); } catch (e) { console.warn('captureWorld', e); return; }
        this.sendNetworkMessage({ type: 'SYNC', world, ev: NetState.flushEvents() });
    }

    // Guest: không mô phỏng – chỉ dự đoán chuyển động xe mình cho mượt
    guestTick() {
        this.onGameLoopTick();
        if (screenShake.duration > 0) screenShake.duration--;
        if (!p2 || this.predX === null) return;
        const dir = (inputs.p2.r ? 1 : 0) - (inputs.p2.l ? 1 : 0);
        this.inHist.push({ seq: this.inSeq, dir });
        if (this.inHist.length > 240) this.inHist.shift();
        this.predX = this.guestStep(this.predX, dir);
        this.predOff *= 0.75;
        if (Math.abs(this.predOff) < 0.2) this.predOff = 0;
        p2.x = this.predX + this.predOff;
        this.applyGuestLocalEffects();
    }

    // 1 tick di chuyển dự đoán của xe guest. Tốc độ lấy từ host (p2.netMoveSpd = tốc độ thật sau mọi
    // hiệu ứng / hook body; 0 khi bị khoá di chuyển) thay vì p2.speed gốc.
    guestStep(x, dir) {
        if (!dir || p2.freezeTimer > 0 || p2.hp <= 0) return x;
        let spd = (typeof p2.netMoveSpd === 'number') ? p2.netMoveSpd : (p2.speed || C.baseSpeed);
        return Math.max(0, Math.min(canvas.width - p2.w, x + dir * spd));
    }

    applyHostSync(data) {
        if (!p1 || !p2 || !data.world) return;
        if (gameState.phase !== 'playing' && !fatalCinematic.active) return; // đang ở shop: bỏ qua ảnh chụp cũ
        const shownX = p2.x;
        try {
            NetState.applyWorld(data.world);
        } catch (e) {
            console.warn('applyWorld', e);
            return;
        }
        this.lastSnapshotAt = Date.now();
        NetState.replayEvents(data.ev);

        // Hoà giải kiểu "client-side prediction": vị trí host là kết quả của phím seq netInSeq đã chạy
        // netInTicks tick -> bỏ các tick lịch sử đó, chạy lại phần phím host chưa xử lý từ vị trí host.
        const hostX = p2.x;
        const seq = p2.netInSeq, done = p2.netInTicks;
        if (typeof seq === 'number' && typeof done === 'number') {
            // các tick của seq này đã bỏ ở ảnh chụp trước thì không bỏ lại lần nữa
            let skip = (seq === this.ackSeq) ? done - this.ackDone : done;
            this.ackSeq = seq; this.ackDone = done;
            this.inHist = this.inHist.filter(h => {
                if (h.seq < seq) return false;
                if (h.seq === seq && skip > 0) { skip--; return false; }
                return true;
            });
        }
        let x = hostX;
        for (const h of this.inHist) x = this.guestStep(x, h.dir);
        if (this.predX === null) { this.predX = x; this.predOff = 0; }
        else {
            // Sai lệch nhỏ: trượt mượt về vị trí đúng; lệch lớn (dịch chuyển, lướt, bị kéo): nhảy ngay
            const off = shownX - x;
            this.predX = x;
            this.predOff = Math.abs(off) > 40 ? 0 : off;
        }
        p2.x = this.predX + this.predOff;
        this.applyGuestLocalEffects();
    }

    // Hiệu ứng chỉ hiển thị trên máy guest (vd: Mù bảng điều khiển)
    applyGuestLocalEffects() {
        const ctrlEl = document.getElementById('p1-controls');
        if (!ctrlEl || !p2) return;
        if (p2.blindTimer > 0) ctrlEl.classList.add('blinded-hud');
        else ctrlEl.classList.remove('blinded-hud');
    }

    // Ping thật (PING/PONG) + phát hiện mất kết nối
    startPingMonitor() {
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.lastHeard = Date.now();
        this.pingTimer = setInterval(() => {
            if (!this.isOnline) return;
            this.sendNetworkMessage({ type: 'PING', t: Date.now() });
            const silence = Date.now() - this.lastHeard;
            const hudPing = document.getElementById('hudOnlinePing');
            if (hudPing) hudPing.classList.toggle('ping-bad', silence > 2500);
            if (this.matchActive && silence > 8000) this.onDisconnected();
        }, 1000);
    }

    // Host: 1 kết nối WebRTC đóng
    onHostConnClosed(peerId) {
        delete this.connections[peerId];
        const cid = this.peerToClient[peerId] || peerId;
        if (this.qmProbePeers && this.qmProbePeers[peerId]) { delete this.qmProbePeers[peerId]; return; }
        // Kết nối lạ (vd. thăm dò Ghép nhanh) đóng giữa trận -> không phải đối thủ rời đi
        if (this.matchActive && !this.playersLobbyData.some(p => p.id === cid || p.id === peerId)) return;
        if (this.matchActive) {
            // BroadcastChannel có thể vẫn sống (cùng máy) – heartbeat sẽ quyết định
            if (!this.broadcastChannel) this.onDisconnected();
            return;
        }
        this.playersLobbyData = this.playersLobbyData.filter(p => p.id !== cid && p.id !== peerId);
        this.broadcastLobbyState();
    }

    onDisconnected() {
        if (this.isOnline) {
            this.matchActive = false;
            this.leaveRoom();
            alert('⚠️ Đối thủ đã ngắt kết nối hoặc rời phòng đấu!');
            const upg = document.getElementById('upgradeScreen');
            if (upg) upg.style.display = 'none';
            const endScreen = document.getElementById('endScreen');
            if (endScreen) endScreen.style.display = 'none';
            const pauseModal = document.getElementById('pauseMenuModal');
            if (pauseModal) pauseModal.style.display = 'none';
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) mainMenu.style.display = 'flex';
            gameState.phase = 'menu';
            cancelAnimationFrame(animationId);
        }
    }

    leaveRoom() {
        if (this.isOnline) { try { this.sendNetworkMessage({ type: 'LEAVE' }); } catch (e) {} }
        this.matchActive = false;
        NetState.recording = false;
        NetState.events = [];
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
        this.isQuickMatch = false;
        this.qmPhase = null;
        this.playersLobbyData = [];
        this.guestDestroyedCrates = null;
        this.seenSeq = {};
        this.peerToClient = {};
        this.resetNetPrediction();
        this.matchActive = false;
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
