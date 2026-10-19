#!/usr/bin/env python3
# Tạo docs/BODIES.md từ dữ liệu game (data.json) + kết quả mô phỏng (tuỳ chọn)
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/user/game-tank'
d = json.load(open(os.path.join(HERE, 'data.json')))
B = d['MODULES']['BODY']; E = d['EVOLUTIONS']; C = d['C']; R = d['real']
SIM = json.load(open(sys.argv[1])) if len(sys.argv) > 1 and os.path.exists(sys.argv[1]) else None
CHANGES = json.load(open(os.path.join(HERE, 'changes.json'))) if os.path.exists(os.path.join(HERE, 'changes.json')) else {}

SUMMONS = {
    'shadow_hunter': 'Bẫy Bóng Tối', 'wind_slash': 'Tường Gió', 'inventor': 'Drone Không Kích (1/2/4 chiếc)',
    'death_lock': 'Lồng Cấm Chế', 'creator': 'Ụ Súng Tự Ngắm, Khiên Thép, Drone, Robot Chiến Đấu (Evo 2)',
    'cung': 'Mưa Tên', 'aaa': 'Pháo cối đánh dấu', 'am_duong_su': 'Bùa chú, Pháp trận, Vùng hư vô, Vùng phóng xạ',
    'acid': 'Vùng Axit', 'sniper': 'Tường Sniper', 'necromancer': 'Vong Linh: Cảm Tử / Xạ Thủ / Cao Cấp (lao húc)',
    'ghost': 'Tàn Ảnh', 'engineer': 'Ụ Súng thường & thông minh', 'storm': 'Lốc Xoáy Chém',
    'magician': 'Phân Ảnh, Hòm ảo', 'genius': 'Mecha (lái được, Full Evo: ném Robot tự hủy)', 'thunder': 'Lôi Phong Thương cắm đất',
    'magnet': 'Nút Từ Trường', 'shortgunATK': 'Biển Lửa',
    'kiem_khach': 'Đại kiếm giáng trời (Vân Tinh Vũ)', 'sprayer': 'Vũng Lửa / Axit / Băng (Evo 2)',
    'customize': 'Vũng hiệu ứng theo mô-đun', 'kiem_su': 'Khối Đá, Vùng Rễ, Bùn, Gai, Biển Lửa',
}
NEW = {'kiem_khach', 'sprayer', 'customize', 'kiem_su'}

def fmt(x):
    x = round(float(x), 2)
    return str(int(x)) if x.is_integer() else str(x)
def ammo(a): return '∞' if a >= 999 else ('— (năng lượng riêng)' if a == 0 else fmt(a))

L = []
L.append('# 📘 Cẩm nang Body — CYBER TANK 1v1\n')
L.append('> Tạo tự động từ dữ liệu trong game (`js/data/*.js`) và đo chỉ số thực bằng cách chạy `setupForNewRound()`.')
L.append('> Khi sửa chỉ số trong code, chạy lại công cụ tạo tài liệu cho khớp.\n')
L.append('## Luật chung\n')
L.append('- Hiệp 1 chọn **1 Body**. Các hiệp sau mua Module / Tiến hoá (Evo) trong shop bằng tiền.')
L.append('- Tiền mỗi hiệp: thắng +50$, thua +15$, hoà +10$. Thua liên tiếp (≥2) +60$; nếu hiệp sau là **cơ hội cuối** (đối thủ chỉ cần 1 hiệp nữa) +120$; thắng liên tiếp (≥2) +30$ mỗi trận thắng.')
L.append(f'- Gốc: xe {C["tankW"]}×{C["tankH"]}, tốc độ {C["baseSpeed"]}, tốc đạn {C["bulletSpeed"]}, nạp đạn {C["reloadTime"]/1000:g}s. Sau {C["suddenDeathTime"]//1000}s **Đột Tử**: vùng an toàn thu hẹp.')
L.append('- Xe to được cộng máu: rộng 31–33 → +1, 34–35 → +2, 36 → +3, 37 → +4, ≥38 → +5 HP.')
L.append('- Mỗi Body có 2 Evo. Có **cả 2 = FULL EVO**.')
jsr = lambda x: int(x + 0.5)
L.append('- **Thùng tiếp tế:** Thùng Nổ (!) phản 1.5 sát thương vào người phá - không thể né, khiên chặn được. Thùng Đạn (✸) bắn 16 viên ra 360°, trúng cả 2 xe (body Tiến Hóa phá thì chỉ trúng đối thủ). Thùng Giả chỉ xuất hiện khi trận có body Tiến Hóa; Thùng Bánh Răng chỉ khi có Kỹ Sư / Kẻ Sáng Tạo / Thiên Tài / Nhà Phát Minh.')
L.append('- **Vùng hiệu ứng mặt đất** là hình chữ nhật nằm ngang (rộng 2.6r × cao 1.5r), luôn nằm trọn trong sân (vùng tạo sát mép được đẩy vào trong, không tràn ra sau lưng xe). Pháo kích (map Pháo Kích), sét Full Evo Lôi Thần, bom Evo 2 Pháo Cao Xạ và Mưa Tên toàn sân rơi đúng làn xe mục tiêu.')
L.append('- **Chế độ chơi:** Chơi → Chế Độ Cổ Điển → Online / Offline. Offline gồm 1v1 cùng máy, Phòng Tập (bot 5 cấp), **Giải Đấu PVE** 5 vòng (Vòng Loại → Chung Kết) với bot thông minh mạnh dần: dự đoán điểm rơi đạn & pháo để né, bắn thùng có lợi và tránh thùng nổ, bắn chặn khe né để ép góc, tự mua đồ trong shop.')
L.append('- Module chân: mỗi lần đã mua làm giá tăng thêm 50% giá gốc. **Động Cơ tối đa 3 lần** (đủ thì không xuất hiện trong shop). **Bánh Xích** x1.25 cho 3 lần đầu, sau đó giảm dần (x1.15, x1.09, x1.05…). **Lợi Tức** cộng dồn và nhân giá trị: 1/2/3/4/5 tầng = 30/72/126/192/270$ mỗi hiệp (Xe Tiền x2).\n')
L.append('- **Đạn tự tìm (homing)** của mọi body: bẻ lái kém linh hoạt; qua giữa sân hơn một chút chỉ còn bẻ rất yếu; khi tới gần mục tiêu (~110px) thì không bẻ nữa → dễ né bằng cách lách ngang.\n')

L.append('## Bảng tổng hợp\n')
hdr = '| # | Body | ID | HP | Sát thương | Đạn | Tốc độ | Kích thước | Triệu hồi |'
sep = '|---|------|----|---:|---:|---:|---:|:---:|:---:|'
if SIM:
    hdr += ' Tỉ lệ thắng mô phỏng |'; sep += '---:|'
L.append(hdr); L.append(sep)
for i, b in enumerate(B, 1):
    r = R[b['id']]
    hp = fmt(r['hp']) + (f" (+{r['souls']} Linh Hồn)" if r.get('souls') else '')
    name = f"**{b['name']}**" + (' 🆕' if b['id'] in NEW else '')
    row = f"| {i} | {name} | `{b['id']}` | {hp} | {fmt(r['dmg'])} | {ammo(r['ammo'])} | {fmt(r['speed'])} | {r['w']}×{r['h']} | {'✅' if b['id'] in SUMMONS else ''} |"
    if SIM:
        s = SIM.get(b['id'])
        row += f" {s:.0f}% |" if s is not None else ' — |'
    L.append(row)
L.append('')
if SIM:
    L.append('> *Tỉ lệ thắng mô phỏng*: trung bình của 2 mức (chỉ có body / có Full Evo + 2 module), mỗi body đấu vòng tròn với mọi body khác, hai bên cùng một AI tự động. AI không biết chơi kinh tế hay combo phức tạp nên con số chỉ mang tính tham khảo cho độ mạnh tương đối.\n')

if CHANGES:
    L.append('## Nhật ký cân bằng\n')
    L.append('| Body | Thay đổi |'); L.append('|---|---|')
    for k, v in CHANGES.items():
        nm = next((b['name'] for b in B if b['id'] == k), k)
        L.append(f'| {nm} | {v} |')
    L.append('')

jsr = lambda x: int(x + 0.5)
L.append('## Module chân (FEET)\n')
L.append('| Module | ID | Giá gốc | Lần 2 / 3 / 4 | Hiệu ứng |'); L.append('|---|---|---:|---:|---|')
for f in d['MODULES']['FEET']:
    L.append(f"| {f['name']} | `{f['id']}` | ${f.get('cost', '—')} | {jsr(f['cost']*1.5)}$ / {f['cost']*2}$ / {jsr(f['cost']*2.5)}$ | {f['desc']} |")
L.append('')

L.append('## Chi tiết từng Body\n')
for i, b in enumerate(B, 1):
    r = R[b['id']]
    L.append(f"### {i}. {b['name']} (`{b['id']}`){' 🆕' if b['id'] in NEW else ''}\n")
    L.append(f"{b['desc']}\n")
    L.append(f"- **Chỉ số thực đầu hiệp:** HP {fmt(r['hp'])}" + (f" + {r['souls']} Linh Hồn" if r.get('souls') else '') +
             f" · Sát thương {fmt(r['dmg'])} · Đạn {ammo(r['ammo'])} · Tốc độ {fmt(r['speed'])} · Kích thước {r['w']}×{r['h']}")
    if b['id'] in SUMMONS: L.append(f"- **Vật triệu hồi / hiệu ứng:** {SUMMONS[b['id']]}")
    evs = E.get(b['id'], [])
    if evs:
        L.append('- **Tiến hoá:**\n')
        L.append('  | Evo | Giá | Hiệu ứng |'); L.append('  |---|---:|---|')
        for e in evs: L.append(f"  | {e['name']} (`{e['id']}`) | ${e.get('cost', '—')} | {e['desc']} |")
    files = [f'`js/characters/{b["id"]}/{f}`' for f in ('logic.js', 'render.js', 'summons.js', 'quests.js') if os.path.exists(f'{REPO}/js/characters/{b["id"]}/{f}')]
    if files: L.append('\n- **Mã nguồn:** ' + ', '.join(files))
    L.append('')

# Phụ lục body mới
L.append('## Phụ lục: cơ chế các body mới\n')
L.append('''### Kiếm Khách — Bài Tập Luyện Kiếm
- Shop có nút **📜 LUYỆN KIẾM**: mỗi hiệp nhận 1 lượt chọn bài (Evo 2: 2 lượt, Full Evo: 4). Hiệp 1 tự nhận *Mưa Kiếm I* + *Mài Kiếm*.
- **Kỹ năng:** Mưa Kiếm I–III (+1/2/3 kiếm mỗi loạt) · Kiếm Vũ I–III (bắn chùm) · Phá Trời (xuyên) · Kiếm Ảnh I–III (Tập Trung: kiếm x2 tốc, +1/2/3s) · Bảo Kiếm (Tập Trung: vô hạn đạn, giữ để xả; cần 3 bài kỹ năng).
- **Chỉ số (làm lại được, yêu cầu tăng dần):** Thối Thể (+1 HP) · Mài Kiếm (+0.25 dmg) · Tích Lũy (+50$) · Bộ Pháp (+0.2 tốc) · Băng Đạn (+1 đạn).
- **5 Bài Cuối (Full Evo):** Vân Tinh Vũ · Phân Ảnh · Phá · Kiếm Thế Cường · Cơ Hội Cuối → xong cả 5 thành **Hóa Thần**.
- Evo 1 giảm 50% yêu cầu; Full Evo giảm còn 35%.

### Bình Phun — Lớp phủ
| Chất | Khi đang phủ | Đầy 100% |
|---|---|---|
| Lửa | Thiêu 0.25 HP/s | Nổ 5 dmg (Full: 7, lan rộng) |
| Axit | Ăn mòn 1.25% HP tối đa/s, Suy Yếu tới +30% sát thương nhận | Câm Lặng đến khi tụt dưới 99% (Full: +1s) |
| Băng | 0.125 HP/s, chậm dần tới -60% | Đóng băng 2s (Full: 2.5s), còn 25% |

Luồng phun bị chặn bởi Tường Sniper, thanh cản, tường thành, Xe Tiền, Khiên Thép, Khối Đá. Axit làm tan vật cản/ụ súng rất nhanh, Lửa đốt nổ vật cản, Băng làm chậm vật cản di động.

### Tùy Biến — Điểm Tùy Chỉnh (CP)
- Mỗi hiệp +1 CP; thắng +1; thua liên tiếp ≥2 hiệp +2; Evo 2 +1. Mỗi mô-đun tốn 1 CP.
- Lối Bắn: Tap / Shotgun / SMG / Tích Tụ / Hold (tia) / Tiến Công (lao húc). Dạng Đạn: Tròn / Thẳng / Kiếm / Pháo.
- Tính chất (cộng dồn): Nổ, Xuyên, 1 loại Vùng (Axit/Băng/Lửa/Câm Lặng), Hitscan. VIP (Evo 1): Tự Ngắm, Đạn Hút, Nảy Tường.
- Kích thước: Thu Nhỏ (24×24, +30% tốc, -1 HP) / Phóng To (38×38, -20% tốc, +4 HP). Full Evo: chọn 1 Nội Tại độc quyền.

### Kiếm Sư — 15 phản ứng Ngũ Hành (Evo 2)
| Nhóm | Phản ứng |
|---|---|
| Đồng nguyên tố | Kim+Kim: kiếm to xuyên +1 dmg · Mộc+Mộc: hồi 0.5 HP, +20% tốc 2s · Thủy+Thủy: khiên nước, vỡ đẩy lùi · Hỏa+Hỏa: nổ x2, xóa đạn địch · Thổ+Thổ: đá x2 máu & thời gian |
| Tương sinh | Kim+Thủy: hồi 0.5 HP + 2 đạn · Thủy+Mộc: rễ lan rộng hút máu · Mộc+Hỏa: biển lửa 3s · Hỏa+Thổ: tường nham thạch phản đòn · Thổ+Kim: +30$, 3 phát nhanh hơn 40% |
| Tương khắc | Kim+Mộc: gai gây Chảy Máu · Mộc+Thổ: xuyên & phá vật cản nhân tạo · Thổ+Thủy: đầm lầy -70% tốc · Thủy+Hỏa: hơi nước làm mù HUD 1.5s · Hỏa+Kim: Câm Lặng 1.5s |
''')

L.append('## Cửa hàng riêng\n')
L.append('### ⚙ Chợ Linh Kiện — Nhà Phát Minh\n')
L.append('| Món | ID | Nhóm | Giá (LK) | Cấp tối đa | Hiệu ứng |'); L.append('|---|---|---|---:|---:|---|')
for it in d['INVENTOR_SHOP']: L.append(f"| {it['name']} | `{it['id']}` | {it.get('type', '')} | {it.get('cost', '')} | {it.get('maxLvl', '')} | {it['desc']} |")
L.append('\n### 🤖 Chợ Đen Robot — Thiên Tài\n')
L.append('| Món | ID | Hiệu ứng |'); L.append('|---|---|---|')
for it in d['GENIUS_BLACK_MARKET']: L.append(f"| {it['name']} | `{it['id']}` | {it['desc']} |")

os.makedirs(f'{REPO}/docs', exist_ok=True)
open(f'{REPO}/docs/BODIES.md', 'w').write('\n'.join(L) + '\n')
print('lines', len(L))
