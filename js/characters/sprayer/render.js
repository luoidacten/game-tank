// ==========================================
// Bình Phun (sprayer) — Hình ảnh: luồng phun, nòng đổi màu, thanh năng lượng, lớp phủ trên địch
// ==========================================

Object.assign(CharHooks.registry.sprayer, {
    draw() {
        const n = spNozzle(this);
        const col = SP_CHEM_COLOR[this.spChem] || '#ff6a1a';
        ctx.save();
        // (Bình chứa & vòi phun đổi màu theo chất: vẽ trong art xe - js/render/tank-art/support_summons.js)
        // Luồng phun hình nón (cắt ngắn tại vật cản)
        if (this.spOn) {
            const r = Math.max(8, this.spRange || 0);
            const half = Math.max(4, spHalfWidth(r, this));
            const y0 = n.y + n.dirY * 1; // miệng vòi nón ở mép trước xe
            const g = ctx.createLinearGradient(n.x, y0, n.x, y0 + n.dirY * r);
            g.addColorStop(0, col);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = 0.42;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(n.x - 4, y0);
            ctx.lineTo(n.x - half, y0 + n.dirY * r);
            ctx.lineTo(n.x + half, y0 + n.dirY * r);
            ctx.lineTo(n.x + 4, y0);
            ctx.closePath();
            ctx.fill();
            // Hạt li ti
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = col;
            const t = Date.now() / 60;
            for (let i = 0; i < 14; i++) {
                const f = ((i * 37 + t * 7) % 100) / 100;
                const sx = n.x + Math.sin(i * 12.9 + t * 0.3) * half * f;
                ctx.beginPath(); ctx.arc(sx, y0 + n.dirY * r * f, 1.5 + 1.5 * (1 - f), 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();

        // Lớp phủ trên người đối thủ
        const enemy = this === p1 ? p2 : p1;
        if (enemy && enemy.spCoat) {
            let row = 0;
            ctx.save();
            for (const c of SP_CHEMS) {
                const v = enemy.spCoat[c];
                if (v <= 0.5) continue;
                const bx = enemy.x - 4, by = (enemy.id === 1 ? enemy.y + enemy.h + 10 : enemy.y - 14) + row * 4 * (enemy.id === 1 ? 1 : -1);
                ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(bx, by, enemy.w + 8, 3);
                ctx.fillStyle = SP_CHEM_COLOR[c]; ctx.fillRect(bx, by, (enemy.w + 8) * v / 100, 3);
                row++;
            }
            // Ngấm Sâu: giọt tím trên địch
            const sk = spSoak(enemy);
            if (sk > 0) {
                const gy = enemy.id === 1 ? enemy.y + enemy.h + 10 + row * 4 + 4 : enemy.y - 14 - row * 4 - 6;
                ctx.shadowBlur = 8; ctx.shadowColor = '#e879f9'; ctx.fillStyle = '#e879f9';
                ctx.globalAlpha = enemy.spSoakT < 90 ? 0.4 + 0.4 * Math.sin(Date.now() / 60) : 1;
                for (let i = 0; i < SP_SOAK_MAX; i++) {
                    const gx = enemy.x + enemy.w / 2 + (i - 1) * 8;
                    ctx.globalAlpha *= i < sk ? 1 : 0.25;
                    ctx.beginPath(); ctx.moveTo(gx, gy - 3); ctx.quadraticCurveTo(gx + 3, gy + 1, gx, gy + 3); ctx.quadraticCurveTo(gx - 3, gy + 1, gx, gy - 3); ctx.fill();
                    ctx.globalAlpha = enemy.spSoakT < 90 ? 0.4 + 0.4 * Math.sin(Date.now() / 60) : 1;
                }
                if (sk >= SP_SOAK_MAX) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.w * 0.8, 0, Math.PI * 2); ctx.stroke(); }
            }
            ctx.restore();
        }
    },

    drawUI() {
        const y = this.id === 1 ? this.y + this.h + 12 : this.y - 16;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(this.x - 4, y, this.w + 8, 4);
        ctx.fillStyle = this.spLock ? '#64748b' : SP_CHEM_COLOR[this.spChem];
        ctx.fillRect(this.x - 4, y, (this.w + 8) * (this.spEnergy || 0) / 100, 4);
        if (this.spHold > 4 && this.spHold < SP_SWITCH_HOLD) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.spHold / SP_SWITCH_HOLD); ctx.stroke();
        }
        ctx.restore();
    },
});
