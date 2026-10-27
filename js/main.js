// ==========================================
// Khởi động game
// ==========================================



function init() {
    updateCanvasDimensions();
    p1 = new Player(1, "#3498db");
    p2 = new Player(2, "#e74c3c");
    gameState.winScore = 3;
    setupControls();
    updateScoreBoard();
    onlineManager.initUI();
    botAI.initEvents();
    PVE.initEvents();
    if (typeof TOURNEY !== 'undefined') TOURNEY.init();
    // The main menu is visible by default in index.html!
}

window.addEventListener('load', init);
