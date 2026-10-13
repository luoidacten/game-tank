# Cấu trúc mã nguồn

Game dùng các file `<script>` thường (không cần build). Mọi khai báo top-level dùng chung
phạm vi toàn cục, nên **thứ tự nạp trong `index.html` rất quan trọng**:

```
core/        Nền tảng: âm thanh, hiệu ứng màn hình, canvas, cấu hình, trạng thái toàn cục, tiện ích
data/        Dữ liệu tĩnh: Body/Module, Tiến hoá (Evo), cửa hàng riêng
entities/    Thực thể dùng chung: vật thể bản đồ, vụ nổ/vùng băng/laser, kiếm bay
player/      Class Player (lõi) + các phần dùng chung: setup, update, combat, bullets, render
characters/  Mỗi nhân vật 1 thư mục <id>/
               logic.js    – cập nhật, bắn, kỹ năng riêng (gắn vào Player.prototype)
               render.js   – vẽ xe / UI riêng
               summons.js  – vật triệu hồi & thực thể riêng (ụ súng, drone, vong linh...)
game/        Luồng trận: shop, hiệp đấu, vật lý, va chạm, vòng lặp, điều khiển
render/      Vẽ khung hình & nền sàn đấu
ai/          Bot phòng tập
online/      Chơi online (host làm chủ, guest hiển thị)
main.js      Khởi động
```

## Thêm logic cho một nhân vật

Trong `player/update.js`, `player/combat.js`... các đoạn riêng của nhân vật được gọi qua
method như `this.updateEngineer(inp)` hay `this.drawSniper()`. Phần thân nằm trong
`characters/<id>/logic.js` hoặc `render.js`, dạng:

```js
Object.assign(Player.prototype, {
    updateEngineer(inp) {
        if (this.weapon === 'engineer') { ... }
    },
});
```

Method có ghi chú "trả về true nếu cần dừng" được gọi kiểu `if (this.x()) return;`.
Method có ghi chú "trả về currentSpeed mới" được gọi kiểu `currentSpeed = this.x(currentSpeed);`.

Thêm file mới thì nhớ thêm thẻ `<script>` vào `index.html`, đặt **sau** `player/*.js`
nếu file đó gắn method vào `Player.prototype`.
