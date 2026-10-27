// Cuộn dự phòng cho menu / bảng phủ trên điện thoại.
// Một số trình duyệt di động (WebView, iOS) không cuộn được bảng phủ position:fixed lồng nhau
// (vd bảng chỉnh phòng online). Khi trình duyệt KHÔNG tự cuộn, ta tự cuộn phần tử cuộn gần nhất theo ngón tay.
(function () {
    const SEL = '.modal-overlay, .menu-overlay, #endScreen, #upgradeScreen';
    const canScroll = (el) => {
        const cs = getComputedStyle(el);
        return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
    };
    const scrollerOf = (el, root) => {
        for (let e = el; e && e !== document.body; e = e.parentElement) {
            if (canScroll(e)) return e;
            if (e === root) break;
        }
        return null;
    };
    let st = null;
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) { st = null; return; }
        const t = e.touches[0];
        const root = e.target && e.target.closest ? e.target.closest(SEL) : null;
        if (!root || e.target.closest('input[type=range]')) { st = null; return; }
        const sc = scrollerOf(e.target, root);
        st = sc ? { sc, y: t.clientY, top: sc.scrollTop, acc: 0, mode: null } : null;
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!st || e.touches.length !== 1) return;
        const t = e.touches[0], dy = st.y - t.clientY;
        st.y = t.clientY;
        st.acc = (st.acc || 0) + dy;
        // Xác định 1 lần mỗi lần vuốt: trình duyệt có tự cuộn không? Nếu không -> tự cuộn thủ công
        if (!st.mode && Math.abs(st.acc) > 14) st.mode = Math.abs(st.sc.scrollTop - st.top) < 1 ? 'manual' : 'native';
        if (st.mode === 'manual') st.sc.scrollTop += dy;
    }, { passive: true });
    const end = () => { st = null; };
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
})();
