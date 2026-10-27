// ==========================================
// Bầu MÁY CHỦ: đo cấu hình + mạng 2 máy, máy mạnh hơn làm host (nguồn chuẩn mô phỏng)
// ==========================================
// Phần thiết bị (CPU, khung hình, số nhân, RAM, DPR) đo 1 lần ~1s rồi lưu lại; phần mạng (RTT + độ dao động)
// đo qua kênh dữ liệu ~1.5s ngay khi 2 máy nối nhau. Điểm 0..100 (cao = mạnh).
const DeviceBench = {
    dev: null,
    _p: null,

    // Đo CPU: số vòng lặp toán học / ms (lấy lần tốt nhất trong vài lát 40ms để tránh bị ngắt quãng)
    _cpu() {
        let best = 0, sink = 0;
        for (let r = 0; r < 4; r++) {
            const t0 = performance.now();
            let n = 0;
            while (performance.now() - t0 < 40) {
                for (let i = 0; i < 2000; i++) sink += Math.sqrt(i * 1.7 + n) * Math.sin(i);
                n += 2000;
            }
            best = Math.max(best, n / Math.max(1, performance.now() - t0));
        }
        this._sink = sink;
        return best;
    },

    // Đo thời gian khung hình qua requestAnimationFrame (~600ms). Trả về { fps, jank }
    _frames(ms = 600) {
        return new Promise((res) => {
            const ds = [];
            let last = 0, start = performance.now(), done = false;
            const fin = () => {
                if (done) return; done = true;
                if (ds.length < 5) { res({ fps: 60, jank: 0, est: true }); return; }
                ds.sort((a, b) => a - b);
                const med = ds[ds.length >> 1];
                const p90 = ds[Math.floor(ds.length * 0.9)];
                res({ fps: Math.min(144, 1000 / Math.max(1, med)), jank: Math.max(0, p90 - med) });
            };
            const step = (t) => {
                if (done) return;
                if (last) ds.push(t - last);
                last = t;
                if (t - start > ms) fin(); else requestAnimationFrame(step);
            };
            try { requestAnimationFrame(step); } catch (e) { fin(); }
            setTimeout(fin, ms + 400); // tab ẩn / rAF bị chặn
        });
    },

    runDevice() {
        if (this.dev) return Promise.resolve(this.dev);
        if (this._p) return this._p;
        this._p = (async () => {
            const cpu = this._cpu();
            const fr = await this._frames();
            const nc = navigator.connection || {};
            this.dev = {
                cpu: Math.round(cpu),
                fps: Math.round(fr.fps), jank: Math.round(fr.jank),
                cores: navigator.hardwareConcurrency || 0,
                mem: navigator.deviceMemory || 0,
                dpr: +(window.devicePixelRatio || 1).toFixed(2),
                net: nc.type || nc.effectiveType || '',
                down: nc.downlink || 0,
            };
            this._p = null;
            return this.dev;
        })();
        return this._p;
    },

    // RTT mẫu (ms) -> { rtt (trung vị), jit (độ lệch chuẩn) }
    netStats(samples) {
        if (!samples || !samples.length) return { rtt: 0, jit: 0, n: 0 };
        let s = samples.slice().sort((a, b) => a - b);
        const med = s[s.length >> 1];
        // bỏ 25% mẫu chậm nhất: 1 lần khựng (máy kia đang đo CPU, GC...) không làm hỏng điểm mạng
        if (s.length >= 8) s = s.slice(0, Math.ceil(s.length * 0.75));
        const mean = s.reduce((a, b) => a + b, 0) / s.length;
        const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) * (b - mean), 0) / s.length);
        return { rtt: Math.round(med), jit: Math.round(sd * 10) / 10, n: s.length };
    },

    // Điểm tổng 0..100
    score(dev, net) {
        const cl = (v) => Math.max(0, Math.min(1, v));
        dev = dev || {}; net = net || {};
        const cpuN = cl(Math.log2(Math.max(1, dev.cpu || 0) / 1500) / 6);     // ~1.5k vòng/ms = rất yếu, ~96k = rất mạnh
        const fpsN = cl(((dev.fps || 60) - 20) / 40) * (1 - cl((dev.jank || 0) / 40) * 0.5);
        const coreN = dev.cores ? cl((dev.cores - 2) / 6) : 0.4;
        const memN = dev.mem ? cl((dev.mem - 1) / 7) : 0.5;
        const dprPen = cl(((dev.dpr || 1) - 1) / 2) * 0.5;                    // màn hình DPR cao = nhiều điểm ảnh phải vẽ
        const linkN = /ethernet|wifi/.test(dev.net || '') ? 1 : /cellular|3g|2g/.test(dev.net || '') ? 0.3 : 0.65;
        const netN = (1 - cl((net.jit || 0) / 40)) * 0.7 + linkN * 0.3;
        let s = 34 * cpuN + 20 * fpsN + 12 * coreN + 8 * memN + 20 * netN + 6 * (1 - dprPen);
        if (typeof window.CY_BENCH_OVERRIDE === 'number') s = window.CY_BENCH_OVERRIDE; // kiểm thử
        return Math.round(s * 10) / 10;
    },

    // Quyết định: máy nào làm host. Ưu tiên giữ host hiện tại nếu chênh lệch nhỏ (tránh đổi vai vô ích)
    pickHost(hostScore, guestScore) {
        if (typeof guestScore !== 'number') return 'host';
        if (typeof hostScore !== 'number') return 'guest';
        return guestScore > hostScore * 1.12 + 2 ? 'guest' : 'host';
    },
};
