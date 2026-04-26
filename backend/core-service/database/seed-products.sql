-- Seed mock products
-- Run: psql $DATABASE_URL -f seed-products.sql
-- Or paste into Neon / DBeaver / TablePlus console

INSERT INTO products (title, description, category, image, price, original_price, sale_price, stock, rating, is_active, is_featured) VALUES

-- ── Laptops ──────────────────────────────────────────────────────────────────
('ASUS TUF Gaming A15 FA506NF',
 'AMD Ryzen 5 7535HS, RAM 8GB, SSD 512GB, RTX 2050 4GB, 15.6" FHD 144Hz, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/305658/asus-tuf-gaming-a15-fa506nf-hn006w-638229673612355523-large.jpg',
 17490000, 19990000, 17490000, 25, 4.5, true, true),

('Dell Inspiron 15 3530',
 'Intel Core i5-1335U, RAM 16GB, SSD 512GB, 15.6" FHD, tích hợp Intel Iris Xe, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/308568/dell-inspiron-15-3530-i5-n3530i5u168w-638226108649235033-large.jpg',
 14990000, 16490000, 14990000, 30, 4.3, true, false),

('Lenovo IdeaPad Slim 5 16ABR8',
 'AMD Ryzen 5 7530U, RAM 16GB, SSD 512GB, 16" 2.5K IPS 300 nits, pin 15 tiếng',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/305833/lenovo-ideapad-slim-5-16abr8-82xg005uvn-638175400179531900-large.jpg',
 16490000, 18990000, 16490000, 20, 4.4, true, true),

('HP Victus 15 fa1112TX',
 'Intel Core i5-12450H, RAM 8GB, SSD 512GB, RTX 3050 6GB, 15.6" FHD 144Hz, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/305660/hp-victus-15-fa1112tx-7c0u8pa-638223155492546617-large.jpg',
 18490000, 21490000, 18490000, 15, 4.2, true, false),

('ASUS Zenbook 14 OLED UX3405MA',
 'Intel Core Ultra 5 125H, RAM 16GB, SSD 512GB, 14" OLED 2.8K 120Hz, trọng lượng 1.2kg',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/317956/asus-zenbook-14-oled-ux3405ma-qd390w-638474661109427892-large.jpg',
 24990000, 27990000, 24990000, 12, 4.7, true, true),

('Acer Nitro 5 AN515-58',
 'Intel Core i5-12500H, RAM 8GB, SSD 512GB, RTX 3050 4GB, 15.6" FHD 144Hz, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/289700/acer-nitro-5-an515-58-57sx-nh-qfhsv-006-638056717555345635-large.jpg',
 15990000, 18990000, 15990000, 18, 4.1, true, false),

('MSI Katana 15 B13VFK',
 'Intel Core i7-13620H, RAM 16GB, SSD 512GB, RTX 4060 8GB, 15.6" FHD 144Hz, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/309578/msi-katana-15-b13vfk-894vn-638268834586486861-large.jpg',
 22990000, 25990000, 22990000, 10, 4.5, true, true),

('Lenovo Legion 5 15APH8',
 'AMD Ryzen 7 7745HX, RAM 16GB DDR5, SSD 512GB, RTX 4060 8GB, 15.6" FHD 165Hz, Windows 11',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/307948/lenovo-legion-5-15aph8-82yn001lvn-638208285419640830-large.jpg',
 27990000, 30990000, 27990000, 9, 4.7, true, true),

('HP EliteBook 840 G10',
 'Intel Core i7-1355U, RAM 16GB, SSD 512GB, 14" FHD IPS, vân tay, đọc thẻ thông minh, Windows 11 Pro',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/305661/hp-elitebook-840-g10-819f8pa-638198827124024012-large.jpg',
 28990000, 31990000, 28990000, 8, 4.6, true, false),

('MacBook Air M2 2022',
 'Apple M2 8 nhân, RAM 8GB, SSD 256GB, 13.6" Liquid Retina, pin 18 tiếng, 1.24kg',
 'laptop',
 'https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-mlxw3sa-a-638045888282771758-large.jpg',
 26990000, 28990000, 26990000, 14, 4.8, true, true),

-- ── Mouse ────────────────────────────────────────────────────────────────────
('Logitech G502 X Plus',
 'Chuột gaming không dây LIGHTSPEED, cảm biến HERO 25K DPI, 89g, pin 130 giờ, 13 nút lập trình',
 'mouse',
 'https://cdn.tgdd.vn/Products/Images/56/282464/logitech-g502-x-plus-white-638014586810827392-large.jpg',
 2290000, 2790000, 2290000, 50, 4.8, true, true),

('Razer DeathAdder V3',
 'Chuột gaming có dây, cảm biến Focus Pro 30K DPI, 59g siêu nhẹ, 6 nút lập trình, cáp SpeedFlex',
 'mouse',
 'https://cdn.tgdd.vn/Products/Images/56/285039/razer-deathadder-v3-rz01-04640100-r3m1-638037551388912799-large.jpg',
 1590000, 1990000, 1590000, 40, 4.6, true, false),

('Logitech MX Master 3S',
 'Chuột văn phòng không dây, 8000 DPI, cuộn MagSpeed điện từ, kết nối 3 thiết bị, pin 70 ngày',
 'mouse',
 'https://cdn.tgdd.vn/Products/Images/56/280556/logitech-mx-master-3s-pale-grey-637994266025260710-large.jpg',
 1890000, 2190000, 1890000, 35, 4.7, true, true),

('Pulsar X2 Mini',
 'Chuột gaming siêu nhẹ 52g, cảm biến PixArt 3395, 26000 DPI, 6 nút, cáp Superglide',
 'mouse',
 'https://cdn.tgdd.vn/Products/Images/56/295052/pulsar-x2-mini-white-pxm21w-638094455651027901-large.jpg',
 1190000, 1390000, 1190000, 45, 4.7, true, false),

('SteelSeries Rival 650 Wireless',
 'Chuột gaming không dây, cảm biến TrueMove3+ 12000 DPI, tích hợp quả nặng điều chỉnh, pin 24 giờ',
 'mouse',
 'https://cdn.tgdd.vn/Products/Images/56/221890/steelseries-rival-650-wireless-large.jpg',
 1990000, 2390000, 1990000, 22, 4.4, true, false),

-- ── Keyboard ─────────────────────────────────────────────────────────────────
('AKKO 3087 DS Ocean Star',
 'Bàn phím cơ TKL, switch AKKO CS Ocean Blue, RGB, hot-swap PCB, kết nối USB-C',
 'keyboard',
 'https://cdn.tgdd.vn/Products/Images/56/224452/akko-3087-ds-ocean-star-cherry-mx-blue-thumbs-large.jpg',
 1290000, 1590000, 1290000, 60, 4.5, true, false),

('Corsair K70 RGB Pro',
 'Bàn phím cơ full size, switch Cherry MX Red, RGB per-key, wrist rest từ tính, USB 2.0',
 'keyboard',
 'https://cdn.tgdd.vn/Products/Images/56/255637/corsair-k70-rgb-pro-mx-red-637800219415775753-large.jpg',
 2590000, 3190000, 2590000, 25, 4.6, true, true),

('Keychron Q1 Pro',
 'Bàn phím cơ 75% không dây Bluetooth 5.1 + USB-C, nhôm CNC, gasket mount, hot-swap, QMK/VIA',
 'keyboard',
 'https://cdn.tgdd.vn/Products/Images/56/289866/keychron-q1-pro-qmk-via-navy-blue-rgb-gateron-g-pro-red-638069948226920884-large.jpg',
 3490000, 3990000, 3490000, 20, 4.8, true, true),

('Logitech G PRO X TKL',
 'Bàn phím cơ gaming TKL, switch GX Blue clicky, RGB LIGHTSYNC, thiết kế tourney, USB-C tháo rời',
 'keyboard',
 'https://cdn.tgdd.vn/Products/Images/56/253866/logitech-g-pro-x-tkl-lightspeed-white-920-012148-637785897985044929-large.jpg',
 2990000, 3490000, 2990000, 18, 4.6, true, false),

('Ducky One 3 TKL Pure White',
 'Bàn phím cơ TKL hot-swap, switch Cherry MX Red, PBT double-shot keycap, RGB, USB-C',
 'keyboard',
 'https://cdn.tgdd.vn/Products/Images/56/271059/ducky-one-3-pure-white-tkl-cherry-mx-red-large.jpg',
 2190000, 2490000, 2190000, 15, 4.7, true, false),

-- ── SSD ──────────────────────────────────────────────────────────────────────
('Samsung 990 Pro 1TB NVMe M.2',
 'PCIe 4.0 x4, đọc 7450 MB/s, ghi 6900 MB/s, TBW 600TB, bảo hành 5 năm',
 'ssd',
 'https://cdn.tgdd.vn/Products/Images/159/296891/samsung-ssd-990-pro-1tb-m2-nvme-pcie-gen-4x4-mz-v9p1t0bw-thumb-638103093040975462-large.jpg',
 1990000, 2490000, 1990000, 45, 4.9, true, true),

('WD Black SN850X 2TB NVMe M.2',
 'PCIe 4.0 x4, đọc 7300 MB/s, ghi 6600 MB/s, tối ưu PS5, heatsink tùy chọn, bảo hành 5 năm',
 'ssd',
 'https://cdn.tgdd.vn/Products/Images/159/281777/wd-black-sn850x-2tb-m2-nvme-pcie-gen-4x4-wds200t2x0e-large.jpg',
 3290000, 3990000, 3290000, 30, 4.7, true, false),

('Kingston NV3 1TB NVMe M.2',
 'PCIe 4.0 x4, đọc 6000 MB/s, ghi 4000 MB/s, 1TB, phù hợp nâng cấp laptop & PC văn phòng',
 'ssd',
 'https://cdn.tgdd.vn/Products/Images/159/308756/kingston-snv3s-1000g-thumb-638240374618266285-large.jpg',
 890000, 1190000, 890000, 80, 4.4, true, false),

('Crucial P3 Plus 500GB NVMe M.2',
 'PCIe 4.0 x4, đọc 5000 MB/s, ghi 4200 MB/s, 500GB, giá rẻ phù hợp cho hệ thống phổ thông',
 'ssd',
 'https://cdn.tgdd.vn/Products/Images/159/285827/crucial-p3-plus-500gb-m2-nvme-pcie-gen-4x4-ct500p3pssd8-thumb-638044163684614745-large.jpg',
 590000, 790000, 590000, 100, 4.3, true, false),

('Seagate FireCuda 530 1TB NVMe M.2',
 'PCIe 4.0 x4, đọc 7300 MB/s, ghi 6900 MB/s, TBW 1275TB, kèm heatsink, bảo hành 5 năm',
 'ssd',
 'https://cdn.tgdd.vn/Products/Images/159/261296/seagate-firecuda-530-1tb-zp1000gm3a013-large.jpg',
 2390000, 2890000, 2390000, 25, 4.8, true, true),

-- ── Headphone ────────────────────────────────────────────────────────────────
('Sony WH-1000XM5',
 'Tai nghe over-ear ANC hàng đầu, Bluetooth 5.2, pin 30 giờ, Hi-Res Audio, chống ồn AI 8 micro',
 'headphone',
 'https://cdn.tgdd.vn/Products/Images/54/282972/sony-wh-1000xm5-black-thumb-638019781308497553-large.jpg',
 6990000, 8490000, 6990000, 20, 4.9, true, true),

('JBL Quantum 810',
 'Tai nghe gaming không dây 2.4GHz + Bluetooth, ANC, JBL QuantumSURROUND, pin 34 giờ',
 'headphone',
 'https://cdn.tgdd.vn/Products/Images/54/268475/jbl-quantum-810-black-thumb-637907428152624571-large.jpg',
 2490000, 2990000, 2490000, 28, 4.4, true, false),

('SteelSeries Arctis Nova Pro Wireless',
 'Tai nghe gaming không dây 2.4GHz + BT, ANC, Hi-Res Audio, pin 22 giờ, hệ thống sạc kép',
 'headphone',
 'https://cdn.tgdd.vn/Products/Images/54/284614/steelseries-arctis-nova-pro-wireless-black-638030168804178012-large.jpg',
 8490000, 9990000, 8490000, 12, 4.8, true, true),

('Logitech G733 Lightspeed',
 'Tai nghe gaming không dây LIGHTSPEED, Blue VO!CE micro, RGB LIGHTSYNC, pin 29 giờ, trọng lượng 278g',
 'headphone',
 'https://cdn.tgdd.vn/Products/Images/54/249026/logitech-g733-lightspeed-white-637704282540178820-large.jpg',
 1990000, 2490000, 1990000, 22, 4.5, true, false),

-- ── PC Gaming ────────────────────────────────────────────────────────────────
('PC Gaming RTX 4060 i5-13400F',
 'Intel Core i5-13400F, RAM 16GB DDR4 3200MHz, SSD 500GB NVMe, RTX 4060 8GB, nguồn 650W 80+ Bronze',
 'pcgaming',
 'https://cdn.tgdd.vn/Products/Images/44/312613/pc-gaming-rtx-4060-i5-13400f-thumb-large.jpg',
 19990000, 22990000, 19990000, 10, 4.6, true, true),

('PC Gaming RTX 4070 Super R7 7700X',
 'AMD Ryzen 7 7700X, RAM 32GB DDR5 5600MHz, SSD 1TB NVMe Gen4, RTX 4070 Super 12GB, nguồn 750W 80+ Gold',
 'pcgaming',
 'https://cdn.tgdd.vn/Products/Images/44/312614/pc-gaming-rtx-4070s-r7-7700x-thumb-large.jpg',
 34990000, 38990000, 34990000, 8, 4.8, true, true),

('PC Gaming RTX 4090 i9-14900K',
 'Intel Core i9-14900K, RAM 64GB DDR5, SSD 2TB NVMe Gen4, RTX 4090 24GB, nguồn 1000W 80+ Platinum',
 'pcgaming',
 'https://cdn.tgdd.vn/Products/Images/44/312615/pc-gaming-rtx-4090-i9-14900k-thumb-large.jpg',
 79990000, 89990000, 79990000, 5, 5.0, true, true),

-- ── PC Cooling ───────────────────────────────────────────────────────────────
('Noctua NH-D15 chromax.black',
 'Tản nhiệt khí dual-tower, 2x quạt 140mm NF-A15 PWM, TDP 250W, tương thích AM5 / LGA1700',
 'pccooling',
 'https://cdn.tgdd.vn/Products/Images/56/220809/noctua-nh-d15-chromax-black-large.jpg',
 1890000, 2190000, 1890000, 22, 4.9, true, false),

('NZXT Kraken 360 RGB',
 'Tản nhiệt nước AIO 360mm, 3x quạt 120mm RGB, màn hình LCD 1.54" hiển thị nhiệt độ, AM5 / LGA1700',
 'pccooling',
 'https://cdn.tgdd.vn/Products/Images/56/293882/nzxt-kraken-360-rgb-black-638083748632700424-large.jpg',
 3490000, 3990000, 3490000, 15, 4.6, true, true),

('Corsair iCUE H150i Elite LCD',
 'Tản nhiệt nước AIO 360mm, màn hình LCD IPS 2.1" full color, 3x quạt LL120 RGB, AM5 / LGA1700',
 'pccooling',
 'https://cdn.tgdd.vn/Products/Images/56/270893/corsair-icue-h150i-elite-lcd-360mm-cw-9060061-ww-large.jpg',
 4290000, 4990000, 4290000, 10, 4.7, true, true),

('DeepCool AK620',
 'Tản nhiệt khí dual-tower, 2x quạt 120mm FDB, TDP 260W, 6 ống đồng, chiều cao 160mm, AM5 / LGA1700',
 'pccooling',
 'https://cdn.tgdd.vn/Products/Images/56/273929/deepcool-ak620-r-ak620-bknnmt-g-1-large.jpg',
 890000, 1090000, 890000, 35, 4.8, true, false);
```
