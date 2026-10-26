// ==========================================
// Điều khiển bàn phím / cảm ứng / menu
// ==========================================



// Kiểu bố cục nút điều khiển: 'new' (nút tròn, mặc định) | 'old' (kiểu cũ)
function applyControlLayout(mode) {
    document.body.classList.toggle('ctrl-new', mode !== 'old');
    document.querySelectorAll('.ctrl-layout-toggle').forEach(b => { b.textContent = `🎮 KIỂU NÚT: ${mode === 'old' ? 'CŨ' : 'MỚI'}`; });
}
function getControlLayout() {
    try { return localStorage.getItem('ctrlLayout') || 'new'; } catch (e) { return 'new'; }
}

// --- TOÀN MÀN HÌNH (điện thoại): Fullscreen API + khoá màn hình dọc nếu trình duyệt cho phép ---
function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function toggleFullscreen() {
    const el = document.documentElement;
    try {
        if (!isFullscreen()) {
            const req = el.requestFullscreen || el.webkitRequestFullscreen;
            if (req) {
                const r = req.call(el, { navigationUI: 'hide' });
                if (r && r.then) r.then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(() => {}); } catch (e) {} }).catch(() => {});
            } else {
                // iPhone (Safari) không hỗ trợ Fullscreen cho trang web: hướng dẫn "Thêm vào MH chính"
                alert('Trình duyệt này chưa hỗ trợ toàn màn hình.\nTrên iPhone: bấm Chia sẻ → "Thêm vào Màn hình chính" rồi mở game từ biểu tượng đó.');
            }
        } else {
            const ex = document.exitFullscreen || document.webkitExitFullscreen;
            if (ex) ex.call(document);
        }
    } catch (e) { /* bỏ qua */ }
}
function updateFullscreenUI() {
    const on = isFullscreen();
    document.querySelectorAll('.fullscreen-toggle .fs-text').forEach(t => {
        t.textContent = t.closest('.hud-btn') ? (on ? 'THOÁT' : 'FULL') : (on ? '⛶ THOÁT TOÀN MÀN HÌNH' : '⛶ TOÀN MÀN HÌNH');
    });
    setTimeout(() => { if (typeof updateCanvasDimensions === 'function') updateCanvasDimensions(); }, 120);
}

function setupControls() {
    document.querySelectorAll('.fullscreen-toggle').forEach(b => b.addEventListener('click', toggleFullscreen));
    document.addEventListener('fullscreenchange', updateFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
    applyControlLayout(getControlLayout());
    document.querySelectorAll('.ctrl-layout-toggle').forEach(btn => btn.addEventListener('click', () => {
        const next = getControlLayout() === 'old' ? 'new' : 'old';
        try { localStorage.setItem('ctrlLayout', next); } catch (e) {}
        applyControlLayout(next);
        if (typeof updateCanvasDimensions === 'function') updateCanvasDimensions();
    }));
    // Điều hướng các màn của menu chính (Chơi -> Chế độ -> Cổ điển -> Offline)
    const showMenuScreen = (name) => {
        document.querySelectorAll('.menu-screen').forEach(sc => sc.classList.toggle('active', sc.dataset.screen === name));
        const box = document.querySelector('#mainMenu .menu-container');
        if (box) box.scrollTop = 0;
    };
    document.querySelectorAll('.menu-nav').forEach(btn => btn.addEventListener('click', () => {
        showMenuScreen(btn.dataset.go);
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    }));
    // Mode Buttons in Main Menu
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.winScore = parseInt(btn.dataset.wins) || 3;
            updateScoreBoard();
            if (!soundSystem.muted) soundSystem.playCoin();
        });
    });

    // Map Buttons in Main Menu
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.selectedMapMode = btn.dataset.map || 'classic';
            gameState.currentMap = gameState.selectedMapMode;
            if (typeof updateMapHUD === 'function') updateMapHUD();
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
        });
    });

    // Start Battle Button
    const startBtn = document.getElementById('startBattleBtn');
    if (startBtn) startBtn.addEventListener('click', startBattle);

    // Sound Toggles
    const updateSoundUI = () => {
        const icon = soundSystem.muted ? '\u{1F507}' : '\u{1F50A}';
        const txt = soundSystem.muted ? 'T\u1EAET' : 'B\u1EACT';
        const menuSoundBtn = document.getElementById('menuSoundToggleBtn');
        if (menuSoundBtn) menuSoundBtn.innerText = `${icon} \u00C2M THANH: SFX ${txt}`;
        const hudSoundText = document.getElementById('soundText');
        if (hudSoundText) hudSoundText.innerText = soundSystem.muted ? 'OFF' : 'SFX';
        const hudSoundIcon = document.getElementById('soundIcon');
        if (hudSoundIcon) hudSoundIcon.innerText = icon;
    };

    const toggleSound = () => {
        soundSystem.muted = !soundSystem.muted;
        if (!soundSystem.muted) soundSystem.playCoin();
        updateSoundUI();
    };

    const menuSoundBtn = document.getElementById('menuSoundToggleBtn');
    if (menuSoundBtn) menuSoundBtn.addEventListener('click', toggleSound);
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);
    updateSoundUI();

    // Guide Modal
    const guideModal = document.getElementById('guideModal');
    const openGuide = () => { if (guideModal) guideModal.style.display = 'flex'; };
    const closeGuide = () => { if (guideModal) guideModal.style.display = 'none'; };

    const openGuideBtn = document.getElementById('openGuideBtn');
    if (openGuideBtn) openGuideBtn.addEventListener('click', openGuide);
    const openGuideFromPause = document.getElementById('openGuideFromPauseBtn');
    if (openGuideFromPause) openGuideFromPause.addEventListener('click', openGuide);
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeGuide);
    const guideGotItBtn = document.getElementById('guideGotItBtn');
    if (guideGotItBtn) guideGotItBtn.addEventListener('click', closeGuide);

    // Pause / In-Game Menu Modal
    const pauseModal = document.getElementById('pauseMenuModal');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            gameState.isPaused = true;
            if (pauseModal) pauseModal.style.display = 'flex';
        });
    }

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            gameState.isPaused = false;
            if (pauseModal) pauseModal.style.display = 'none';
        });
    }

    const restartCurrentBtn = document.getElementById('restartCurrentMatchBtn');
    if (restartCurrentBtn) {
        restartCurrentBtn.addEventListener('click', () => {
            if (pauseModal) pauseModal.style.display = 'none';
            gameState.isPaused = false;
            startBattle();
        });
    }

    const backToMenu = () => {
        if (typeof PVE !== 'undefined' && PVE.active) PVE.exit();
        if (typeof botAI !== 'undefined') botAI.enabled = false;
        if (typeof onlineManager !== 'undefined') onlineManager.leaveRoom();
        const tb = document.getElementById('trainingToolbar');
        if (tb) tb.style.display = 'none';
        const botModal = document.getElementById('botWeaponModal');
        if (botModal) botModal.style.display = 'none';
        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'flex';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = '🔵 PLAYER 1 (BLUE)';
        if (pauseModal) pauseModal.style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.style.display = 'none';
        const upgradeScreen = document.getElementById('upgradeScreen');
        if (upgradeScreen) upgradeScreen.style.display = 'none';
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'flex';
        gameState.phase = 'menu';
        gameState.isPaused = false;
        cancelAnimationFrame(animationId);
    };

    const backToMenuBtn = document.getElementById('backToMainMenuBtn');
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', backToMenu);
    const backFromEndBtn = document.getElementById('backToMenuFromEndBtn');
    if (backFromEndBtn) backFromEndBtn.addEventListener('click', backToMenu);

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', startBattle);

    // Touch and Mouse Input Handling
    function handleInput(p, action, pressed) {
        if (p === 'p2' && typeof botAI !== 'undefined' && botAI.enabled) return;

        // In Online Mode as Guest: map bottom controls directly to P2
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            if (action === 'left') {
                inputs.p2.r = pressed; // Screen Left -> World +X (Left from inverted view)
            } else if (action === 'right') {
                inputs.p2.l = pressed; // Screen Right -> World -X (Right from inverted view)
            } else if (action === 'shoot') {
                inputs.p2.s = pressed;
            }
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
                if (handlePlayerReady('p2')) {
                    if (onlineManager.conn && onlineManager.conn.open) {
                        onlineManager.conn.send({ type: 'READY', pid: 'p2' });
                    }
                }
            }
            return;
        }

        // In Online Mode as Host:
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (p === 'p1') {
                inputs.p1[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
                if (onlineManager.conn && onlineManager.conn.open) {
                    onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
                }
                if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
                    if (handlePlayerReady('p1')) {
                        if (onlineManager.conn && onlineManager.conn.open) {
                            onlineManager.conn.send({ type: 'READY', pid: 'p1' });
                        }
                    }
                }
            }
            return;
        }

        if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
            handlePlayerReady(p);
        }
        if (p === 'p1') inputs.p1[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
        if (p === 'p2') inputs.p2[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
    }

    // --- CẢM ỨNG ĐA ĐIỂM ---
    // Theo dõi từng ngón tay: nút nào đang nằm dưới ngón tay thì được giữ.
    // Hỗ trợ trượt ngón từ Trái sang Phải không cần nhấc tay, 2 người chơi cùng lúc,
    // và tự nhả nút khi hệ thống huỷ chạm (cuộc gọi, thông báo...) để không bị kẹt phím.
    let lastTouchActionTimestamp = 0;
    const allBtns = [...document.querySelectorAll('.btn')];
    const touchOwner = new Map(); // touch.identifier -> btn
    const heldCount = new Map();  // btn -> số ngón đang giữ
    const pressBtn = (btn) => {
        const n = (heldCount.get(btn) || 0) + 1;
        heldCount.set(btn, n);
        if (n === 1) {
            btn.classList.add('pressed');
            if (navigator.vibrate) { try { navigator.vibrate(12); } catch (err) {} }
            handleInput(btn.dataset.p, btn.dataset.a, true);
        }
    };
    const releaseBtn = (btn) => {
        const n = (heldCount.get(btn) || 0) - 1;
        if (n <= 0) {
            heldCount.delete(btn);
            btn.classList.remove('pressed');
            handleInput(btn.dataset.p, btn.dataset.a, false);
        } else heldCount.set(btn, n);
    };
    const btnAt = (x, y) => {
        const el = document.elementFromPoint(x, y);
        const btn = el && el.closest ? el.closest('.btn') : null;
        return (btn && allBtns.includes(btn) && btn.offsetParent !== null) ? btn : null;
    };
    // Khoảng cách từ điểm chạm tới khung nút (0 = nằm trong khung)
    const rectDist = (btn, x, y) => {
        const r = btn.getBoundingClientRect();
        const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
        return Math.hypot(dx, dy);
    };
    // [FIX] Nút tròn chỉ nhận chạm trong hình tròn -> ngón cái lệch ra góc / khe giữa 2 nút là bị nhả (xe khựng).
    // Nhận cả vùng chữ nhật quanh nút + 14px; ngón đang giữ nút thì còn "dính" thêm tới 30px.
    // [FIX ĐT] Chỉ "hút" chạm về nút khi điểm chạm thật sự nằm trên vùng điều khiển / sân đấu.
    // Trước đây chạm vào menu / shop / bảng hướng dẫn nằm đè lên (hoặc sát) nút điều khiển bị nuốt
    // (preventDefault) -> không bấm được nút ✕, không chạm ra ngoài để đóng, không vuốt cuộn được.
    const onPlayfield = (x, y) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return false;
        if (el.closest('.controls-area')) return true;
        return el.tagName === 'CANVAS' && el.closest('#gameContainer') && !el.closest('#upgradeScreen, .modal-overlay, .menu-overlay');
    };
    const btnNear = (x, y, prev) => {
        const hit = btnAt(x, y);
        if (hit) return hit;
        if (!onPlayfield(x, y)) return null;
        if (prev && prev.offsetParent !== null && rectDist(prev, x, y) <= 30) return prev;
        let best = null, bd = 14;
        for (const b of allBtns) {
            if (b.offsetParent === null) continue;
            const d = rectDist(b, x, y);
            if (d <= bd) { bd = d; best = b; }
        }
        return best;
    };
    const onTouch = (e) => {
        let handled = false;
        for (const t of e.changedTouches) {
            const prev = touchOwner.get(t.identifier) || null;
            const ended = (e.type === 'touchend' || e.type === 'touchcancel');
            const now = ended ? null : btnNear(t.clientX, t.clientY, prev);
            if (e.type === 'touchstart' && !now) continue; // chạm ngoài nút: để trình duyệt xử lý (cuộn menu...)
            if (prev || now) handled = true;
            if (prev === now) continue;
            if (prev) releaseBtn(prev);
            if (now) { pressBtn(now); touchOwner.set(t.identifier, now); }
            else touchOwner.delete(t.identifier);
        }
        if (handled) { lastTouchActionTimestamp = Date.now(); if (e.cancelable) e.preventDefault(); }
    };
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(type =>
        document.addEventListener(type, onTouch, { passive: false }));
    // Mất focus (chuyển app / khoá màn hình): nhả hết phím
    const releaseAll = () => {
        touchOwner.clear();
        [...heldCount.keys()].forEach(btn => { heldCount.set(btn, 1); releaseBtn(btn); });
        ['p1', 'p2'].forEach(pp => { if (typeof botAI !== 'undefined' && botAI.enabled && pp === 'p2') return; inputs[pp].l = inputs[pp].r = inputs[pp].s = false; });
    };
    // Tự tạm dừng (chơi local) khi rời app / khoá màn hình / xoay ngang điện thoại
    const autoPause = () => {
        if (gameState.phase !== 'playing' || gameState.isPaused) return;
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) return;
        gameState.isPaused = true;
        const pm = document.getElementById('pauseMenuModal');
        if (pm) pm.style.display = 'flex';
    };
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); autoPause(); } });
    const landscapeMq = window.matchMedia('(orientation: landscape) and (max-height: 520px) and (pointer: coarse)');
    const onOrient = () => { if (landscapeMq.matches) { releaseAll(); autoPause(); } };
    if (landscapeMq.addEventListener) landscapeMq.addEventListener('change', onOrient); else if (landscapeMq.addListener) landscapeMq.addListener(onOrient);
    // Chặn menu chuột phải / giữ lâu trên nút điều khiển
    allBtns.forEach(btn => btn.addEventListener('contextmenu', e => e.preventDefault()));

    allBtns.forEach(btn => {
        const p = btn.dataset.p; const a = btn.dataset.a;
        btn.addEventListener('mousedown', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return; // Chống double input do touch sinh ra mousedown
            btn.classList.add('pressed');
            handleInput(p, a, true);
        });
        btn.addEventListener('mouseup', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return;
            btn.classList.remove('pressed');
            handleInput(p, a, false);
        });
        btn.addEventListener('mouseleave', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return;
            btn.classList.remove('pressed');
            handleInput(p, a, false);
        });
    });

    window.addEventListener('resize', updateCanvasDimensions);

    // Click/Tap on Mecha to cycle modes (Mobile / Touch friendly)
    canvas.addEventListener('pointerdown', (e) => {
        if (gameState.phase !== 'playing') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clickX = (e.clientX - rect.left) * scaleX;
        let clickY = (e.clientY - rect.top) * scaleY;
        // Guest online nhìn sân xoay 180 độ
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            clickX = canvas.width - clickX;
            clickY = canvas.height - clickY;
        }

        let myPlayer = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ? p2 : p1;
        if (myPlayer && myPlayer.weapon === 'genius' && myPlayer.isPilotingMecha) {
            if (Math.abs(clickX - (myPlayer.x + myPlayer.w / 2)) < 60 && Math.abs(clickY - (myPlayer.y + myPlayer.h / 2)) < 60) {
                myPlayer.cycleMechaMode();
            }
        }
    });

    // Keyboard controls for PC
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return; // FIX DOUBLE INPUT TỪ OS KEYBOARD AUTO-REPEAT
        if (gameState.phase === 'upgrade') {
            if (e.key === 's' || e.key === 'S' || e.key === ' ') {
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                    if (handlePlayerReady('p2')) {
                        if (onlineManager.conn && onlineManager.conn.open) onlineManager.conn.send({ type: 'READY', pid: 'p2' });
                    }
                } else {
                    if (handlePlayerReady('p1')) {
                        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
                            onlineManager.conn.send({ type: 'READY', pid: 'p1' });
                        }
                    }
                }
            }
            if ((e.key === 'ArrowDown' || e.key === 'Enter') && (!botAI || !botAI.enabled) && (!onlineManager || !onlineManager.isOnline)) {
                handlePlayerReady('p2');
            }
        }

        // Online mode for Guest: PC keyboard (A/D/S/Space or Arrows) maps to P2
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            let changed = false;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { inputs.p2.r = true; changed = true; }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { inputs.p2.l = true; changed = true; }
            if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                inputs.p2.s = true; changed = true;
            }
            if (changed && onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            return;
        }

        // P1 Controls: A / D / S / W / Space
        if (e.key === 'a' || e.key === 'A') inputs.p1.l = true;
        if (e.key === 'd' || e.key === 'D') inputs.p1.r = true;
        if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ') inputs.p1.s = true;

        // Online mode for Host: Send host inputs
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
            }
            return;
        }

        // P2 Controls: Left / Right / Down / Up / Enter (Vô hiệu hóa khi bật Bot hoặc chơi Online)
        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (e.key === 'ArrowLeft') inputs.p2.l = true;
            if (e.key === 'ArrowRight') inputs.p2.r = true;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') inputs.p2.s = true;
        }

        // Mecha Mode Switching for Genius (Keys 1-5, Q, E)
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
            let mNum = parseInt(e.key);
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode(mNum);
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode(mNum);
            }
        }
        if (e.key === 'q' || e.key === 'Q') {
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode((p2.mechaMode === 1 ? 5 : p2.mechaMode - 1));
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode((p1.mechaMode === 1 ? 5 : p1.mechaMode - 1));
            }
        }
        if (e.key === 'e' || e.key === 'E') {
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode();
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode();
            }
        }
        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (p2.weapon === 'genius' && p2.isPilotingMecha) {
                if (['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5'].includes(e.code)) {
                    p2.cycleMechaMode(parseInt(e.code.replace('Numpad', '')));
                } else if (['6', '7', '8', '9', '0'].includes(e.key)) {
                    let map = {'6': 1, '7': 2, '8': 3, '9': 4, '0': 5};
                    p2.cycleMechaMode(map[e.key]);
                } else if (e.key === 'o' || e.key === 'O') {
                    p2.cycleMechaMode((p2.mechaMode === 1 ? 5 : p2.mechaMode - 1));
                } else if (e.key === 'p' || e.key === 'P') {
                    p2.cycleMechaMode();
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            let changed = false;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { inputs.p2.r = false; changed = true; }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { inputs.p2.l = false; changed = true; }
            if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                inputs.p2.s = false; changed = true;
            }
            if (changed && onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            return;
        }

        if (e.key === 'a' || e.key === 'A') inputs.p1.l = false;
        if (e.key === 'd' || e.key === 'D') inputs.p1.r = false;
        if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ') inputs.p1.s = false;

        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
            }
            return;
        }

        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (e.key === 'ArrowLeft') inputs.p2.l = false;
            if (e.key === 'ArrowRight') inputs.p2.r = false;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') inputs.p2.s = false;
        }
    });
}

// [ĐT] Chạm ra vùng tối bên ngoài bảng (hoặc nhấn Esc) = bấm nút ✕ của bảng đó.
// Chỉ áp dụng cho bảng có nút .close-btn (bảng Tạm Dừng không có -> không tự đóng nhầm).
(function initModalOutsideClose() {
    const closeOf = (ov) => ov && ov.querySelector(".modal-header .close-btn, .close-btn");
    document.addEventListener("click", (e) => {
        const ov = e.target;
        if (!ov || !ov.classList || !ov.classList.contains("modal-overlay")) return;
        const b = closeOf(ov);
        if (b) b.click();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape" || document.getElementById("bodyGuideModal")) return;
        const open = [...document.querySelectorAll(".modal-overlay")].filter(m => getComputedStyle(m).display !== "none");
        const b = open.length ? closeOf(open[open.length - 1]) : null;
        if (b) b.click();
    });
})();
