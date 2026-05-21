# Mô tả Luồng Xử lý Dữ liệu — ShopeeLite E-Commerce

> **Ghi chú:** Mỗi luồng mô tả theo dạng sequence diagram bằng chữ.  
> Ký hiệu: `[Actor]` → màn hình/component, `→` truyền dữ liệu/gọi hàm, `←` nhận phản hồi.

---

## LUỒNG 1: Đăng ký tài khoản (User Registration)

**Màn hình liên quan:** `RegistrationForm` → (không có trang riêng, là modal/form)  
**Actor:** Người dùng mới

```
[Người dùng]
    → Nhập: email, password, full_name, phone
    → Nhấn nút "Đăng ký"

[RegistrationForm.jsx]
    → Validate client-side: email format, password độ dài
    → Gọi apiLogin.js: POST /api/v1/auth/register
       Body: { email, password, full_name, phone }

[Auth Service - authController.js: register()]
    → authMiddleware/validator.js kiểm tra input schema
    → User.js: SELECT * FROM users WHERE email = ?
       → Nếu tồn tại → trả lỗi 409 "Email đã được sử dụng"
    → bcrypt.hash(password, 10) → password_hash
    → User.js: INSERT INTO users (email, password_hash, full_name, phone, role='user')
    → jwt.js: generateAccessToken(user_id, role) → accessToken (15 phút)
    → jwt.js: generateRefreshToken(user_id) → refreshToken (7 ngày)
    → User.js: INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    ← Trả về: { user: {id, email, full_name, role}, accessToken, refreshToken }

[AuthContext.jsx]
    → localStorage.setItem('accessToken', accessToken)
    → localStorage.setItem('refreshToken', refreshToken)
    → Cập nhật state: isAuthenticated = true, user = {...}
    → React Router: redirect về /home

[HomePage] hiển thị avatar/tên người dùng trên header
```

---

## LUỒNG 2: Đăng nhập & Tự động làm mới Token (Login & Token Refresh)

**Màn hình liên quan:** `LoginForm` → `AuthContext` → mọi trang protected  
**Actor:** Người dùng đã có tài khoản

```
[Người dùng]
    → Nhập: email, password
    → Nhấn "Đăng nhập"

[LoginForm.jsx]
    → Gọi apiLogin.js: POST /api/v1/auth/login
       Body: { email, password }

[Auth Service - authController.js: login()]
    → User.js: SELECT * FROM users WHERE email = ? AND is_active = true
       → Không tìm thấy → 401 "Sai email hoặc mật khẩu"
    → bcrypt.compare(password, user.password_hash)
       → Không khớp → 401
    → jwt.js: generateAccessToken() → accessToken
    → jwt.js: generateRefreshToken() → refreshToken
    → User.js: UPSERT refresh_tokens (user_id, hash(refreshToken), expires_at)
    ← Trả về: { user, accessToken, refreshToken }

[AuthContext.jsx]
    → Lưu token vào localStorage
    → Dispatch: SET_USER action
    → ProtectedRoute.jsx cho phép truy cập /user, /checkout, /admin

--- Khi accessToken hết hạn (15 phút) ---

[Axios Interceptor - api.js]
    → Nhận response 401 từ bất kỳ API nào
    → Lấy refreshToken từ localStorage
    → Gọi POST /api/v1/auth/refresh
       Body: { refreshToken }

[Auth Service - authController.js: refresh()]
    → Verify refreshToken signature
    → User.js: SELECT token_hash FROM refresh_tokens WHERE user_id = ?
    → So sánh hash(refreshToken) với DB
       → Không khớp → 401, force logout
    → Tạo accessToken mới
    ← Trả về: { accessToken }

[Axios Interceptor]
    → Cập nhật localStorage
    → Retry request ban đầu với token mới
```

---

## LUỒNG 3: Duyệt sản phẩm & Tìm kiếm (Product Browsing & Search)

**Màn hình liên quan:** `HomePage` → `ProductPage` → (filter/search controls)  
**Actor:** Người dùng (chưa đăng nhập cũng được)

```
[Người dùng]
    → Truy cập /home hoặc /san-pham
    → Nhập từ khóa vào thanh search HOẶC chọn danh mục HOẶC kéo filter giá

[HomePage.jsx]
    → useGetFeatureProducts() hook
    → Gọi apiProduct.js: GET /api/v1/products?is_featured=true&limit=8
    ← Nhận: mảng sản phẩm nổi bật → render ProductCard[]

[ProductPage.jsx]
    → State: { search, category, minPrice, maxPrice, sortBy, page }
    → Debounce 300ms khi người dùng gõ tìm kiếm
    → Gọi apiProduct.js: GET /api/v1/products
       Query params: ?search=laptop&category=abc&minPrice=5000000&maxPrice=20000000&sortBy=price_asc&page=1&limit=12

[Core Service - productController.js: getProducts()]
    → productService.js xây dựng SQL query động:
       SELECT p.*, c.name as category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true
         AND (p.title ILIKE '%laptop%' OR p.description ILIKE '%laptop%')
         AND c.id = 'abc'
         AND p.price BETWEEN 5000000 AND 20000000
       ORDER BY p.price ASC
       LIMIT 12 OFFSET 0
    → Đếm total: SELECT COUNT(*) ... (same WHERE)
    ← Trả về: { products: [...], total: 45, page: 1, totalPages: 4 }

[ProductPage.jsx]
    → Render danh sách ProductCard (ảnh, tên, giá, rating)
    → Hiển thị pagination
    → Khi gõ tìm kiếm: đồng thời gọi GET /api/v1/products/suggestions?q=lap
       ← Trả về: ["Laptop Dell", "Laptop HP", ...] → hiện dropdown gợi ý
```

---

## LUỒNG 4: Xem Chi tiết Sản phẩm & Gợi ý AI (Product Detail)

**Màn hình liên quan:** `ProductDetailPage` → `ProductGallery`, `ProductInfo`, `RelatedProducts`  
**Actor:** Người dùng

```
[Người dùng]
    → Click vào 1 sản phẩm từ ProductPage
    → URL chuyển sang /product/:id

[ProductDetailPage.jsx]
    → Lấy :id từ URL params
    → Gọi song song 2 request:
       (1) apiProduct.js: GET /api/v1/products/:id
       (2) aiApi: POST /api/suggest  Body: { product_id: id, type: 'similar' }

--- Request (1): Lấy chi tiết sản phẩm ---

[Core Service - productController.js: getProductById()]
    → Product.js: SELECT p.*, c.name, c.slug
                  FROM products p JOIN categories c ON p.category_id = c.id
                  WHERE p.id = :id AND p.is_active = true
    ← Trả về: { id, title, description, specs(jsonb), images[], price, stock, rating, ... }

[ProductDetailPage.jsx]
    → ProductGallery.jsx: hiển thị ảnh chính + thumbnail, zoom on hover
    → ProductInfo.jsx: tên, giá, còn hàng/hết hàng, nút "Thêm vào giỏ"
    → ProductDetails.jsx: bảng thông số kỹ thuật từ specs(jsonb)

--- Request (2): Lấy gợi ý sản phẩm liên quan ---

[AI Service - suggest/similar.py]
    → Lấy category, brand, price_range của sản phẩm gốc
    → Gọi Core Service: GET /api/v1/products?category=...&limit=20
    → scoring.py: tính điểm tương đồng (category match, brand match, price proximity)
    → Sắp xếp theo điểm giảm dần, lấy top 6
    ← Trả về: { suggestions: [{ product, score, reason }] }

[RelatedProducts.jsx]
    → Render carousel 6 sản phẩm gợi ý với nhãn "Sản phẩm tương tự"

--- Người dùng nhấn "Thêm vào giỏ hàng" ---

[ProductInfo.jsx]
    → useCartRaw() hook
    → cartItems = localStorage.getItem('cart') → parse JSON
    → Kiểm tra product_id đã có trong giỏ chưa:
       - Có rồi → tăng quantity
       - Chưa có → thêm mới { product_id, title, price, image, quantity: 1 }
    → localStorage.setItem('cart', JSON.stringify(cartItems))
    → Toast notification: "Đã thêm vào giỏ hàng"
```

---

## LUỒNG 5: Quản lý Giỏ hàng (Shopping Cart)

**Màn hình liên quan:** `ShoppingCartPage` → `CheckoutPage`  
**Actor:** Người dùng

```
[Người dùng]
    → Nhấn icon giỏ hàng → /shopping-cart

[ShoppingCartPage.jsx]
    → useCartRaw() hook: đọc cart từ localStorage
    → Hiển thị danh sách sản phẩm:
       - Ảnh, tên, đơn giá
       - Input số lượng (tăng/giảm)
       - Nút xóa từng sản phẩm
    → Tính tổng tiền: cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

[Người dùng thay đổi số lượng]
    → useCartRaw().updateQuantity(product_id, newQty)
    → Cập nhật localStorage ngay lập tức (không gọi API)
    → Re-render tổng tiền

[Người dùng nhấn "Tiến hành thanh toán"]
    → ProtectedRoute.jsx kiểm tra isAuthenticated
       → Chưa đăng nhập: redirect /login?redirect=/checkout
       → Đã đăng nhập: redirect /ship-info
          Truyền state: { cartItems, totalPrice }
```

---

## LUỒNG 6: Nhập Thông tin Giao hàng & Đặt hàng (Checkout → Create Order)

**Màn hình liên quan:** `ShippingInfoPage` → `CheckoutPage` → `CompleteOrderPage`  
**Actor:** Người dùng đã đăng nhập

```
[ShippingInfoPage.jsx]
    → Pre-fill từ user profile (full_name, phone, address)
    → AddressForm.jsx: chọn Tỉnh/Thành → Quận/Huyện → Phường/Xã (dropdown cascade)
    → Nhập số nhà, ghi chú
    → Chọn phương thức vận chuyển:
       - Tiêu chuẩn (30.000đ, 3-5 ngày)
       - Nhanh (50.000đ, 1-2 ngày)
       - Miễn phí (đơn > 500.000đ)
    → Nhấn "Tiếp theo" → truyền shippingData sang CheckoutPage

[CheckoutPage.jsx]
    → Hiển thị tóm tắt: sản phẩm, địa chỉ, phí ship
    → PaymentMethods.jsx: chọn COD / Chuyển khoản / Stripe
    → Input mã giảm giá:
       → Gọi: POST /api/v1/payments/discount/validate  Body: { code, order_value }

[Core Service - paymentController.js: validateDiscount()]
    → DiscountCode.js: SELECT * FROM discount_codes
                       WHERE code = UPPER(?) AND is_active = true
                         AND (expires_at IS NULL OR expires_at > NOW())
                         AND (max_uses IS NULL OR used_count < max_uses)
                         AND (min_order_value IS NULL OR min_order_value <= ?)
    ← Trả về: { valid: true, discount_type, discount_value, code }
       hoặc: { valid: false, message: "Mã không hợp lệ" }

[CheckoutPage.jsx]
    → Tính final_total = product_price + shipping_fee - discount
    → Nhấn "Xác nhận đặt hàng"
    → Gọi apiOrders.js: POST /api/v1/orders
       Header: Authorization: Bearer <accessToken>
       Body: {
           customer_name, phone,
           address: { full_address, city, district, ward, street, note },
           shipping_method, payment_method,
           items: [{ product_id, quantity, price }],
           shipping_fee, discount, discount_code,
           total: final_total
       }

[Core Service - orderController.js: createOrder()]
    → authMiddleware: GET /api/v1/auth/verify → xác thực token → lấy user_id
    → orderService.js:
       BEGIN TRANSACTION
         → INSERT INTO orders (user_id, customer_name, phone, address,
                               shipping_method, payment_method,
                               product_price, shipping_fee, discount, discount_code,
                               total, status='pending', payment_status='pending')
            → Trả về order_id
         → INSERT INTO order_items (order_id, product_id, product_name,
                                    product_image, quantity, price)
            (lặp cho từng item)
         → Nếu có discount_code:
            UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?
       COMMIT TRANSACTION
    ← Trả về: { order: { id, status, total, ... }, items: [...] }

[CheckoutPage.jsx]
    → Xóa giỏ hàng: localStorage.removeItem('cart')
    → Nếu payment_method = 'cod' hoặc 'bank_transfer':
       → Redirect /complete?order_id=xxx
    → Nếu payment_method = 'stripe':
       → Redirect /payment-page?order_id=xxx

[CompleteOrderPage.jsx]
    → Hiển thị: "Đặt hàng thành công!", mã đơn hàng, thông tin giao hàng
    → Link "Xem đơn hàng của tôi" → /user/orders
```

---

## LUỒNG 7: Thanh toán Online qua Stripe (Payment Processing)

**Màn hình liên quan:** `PaymentPage` → `CompleteOrderPage`  
**Actor:** Người dùng chọn thanh toán Stripe

```
[PaymentPage.jsx]
    → Lấy order_id từ URL query params
    → Gọi: POST /api/v1/payments/process
       Header: Authorization: Bearer <accessToken>
       Body: { order_id, payment_method: 'stripe' }

[Core Service - paymentController.js: processPayment()]
    → Xác thực token (inter-service call Auth Service)
    → Order.js: SELECT * FROM orders WHERE id = order_id AND user_id = ?
       → Không tìm thấy → 404
       → payment_status đã 'paid' → 400 "Đơn đã thanh toán"
    → paymentService.js: Stripe.paymentIntents.create({
           amount: order.total * 100,   // Stripe dùng đơn vị xu
           currency: 'vnd',
           metadata: { order_id }
       })
    ← Stripe API trả về: { client_secret, payment_intent_id }
    ← Core Service trả về: { client_secret, payment_intent_id, amount }

[PaymentPage.jsx]
    → Khởi tạo Stripe Elements với client_secret
    → Hiển thị form nhập thẻ (số thẻ, CVV, ngày hết hạn)
    → Người dùng nhập thẻ và nhấn "Thanh toán"
    → stripe.confirmCardPayment(client_secret, { card }) → Stripe xử lý

--- Stripe webhook hoặc frontend verify ---

[PaymentPage.jsx]
    → Gọi: GET /api/v1/payments/verify/:order_id/:payment_intent_id
       Header: Authorization: Bearer <accessToken>

[Core Service - paymentController.js: verifyPayment()]
    → paymentService.js: Stripe.paymentIntents.retrieve(payment_intent_id)
    → Kiểm tra status = 'succeeded'
    → Order.js:
       UPDATE orders SET payment_status='paid', status='processing'
       WHERE id = order_id
    ← Trả về: { success: true, order_id, payment_status: 'paid' }

[PaymentPage.jsx]
    → Redirect /complete?order_id=xxx&payment=success

[CompleteOrderPage.jsx]
    → Hiển thị: "Thanh toán thành công!", biên lai giao dịch
```

---

## LUỒNG 8: Theo dõi Đơn hàng (Order Tracking)

**Màn hình liên quan:** `UserPage` → `UserOrders` → `OrderPage`  
**Actor:** Người dùng đã đăng nhập

```
[Người dùng]
    → Vào /user/orders (từ menu tài khoản)

[UserOrders.jsx] (trong UserPage)
    → ProtectedRoute xác nhận đã đăng nhập
    → Gọi apiOrders.js: GET /api/v1/orders/mine
       Header: Authorization: Bearer <accessToken>

[Core Service - orderController.js: getUserOrders()]
    → authMiddleware → xác thực token → lấy user_id
    → Order.js:
       SELECT o.*, json_agg(
           json_build_object(
               'product_name', oi.product_name,
               'product_image', oi.product_image,
               'quantity', oi.quantity,
               'price', oi.price
           )
       ) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND o.deleted_at IS NULL
       GROUP BY o.id
       ORDER BY o.order_date DESC
    ← Trả về: mảng đơn hàng với items lồng nhau

[UserOrders.jsx]
    → Render danh sách đơn hàng:
       - Mã đơn, ngày đặt, tổng tiền
       - Badge trạng thái (màu sắc theo status):
           pending    → vàng  "Chờ xác nhận"
           processing → xanh dương  "Đang xử lý"
           shipped    → cam  "Đang giao"
           delivered  → xanh lá  "Đã giao"
           cancelled  → đỏ  "Đã hủy"
       - Ảnh thumbnail sản phẩm đầu tiên + "+N sản phẩm khác"

[Người dùng click vào 1 đơn hàng]
    → /order?id=xxx

[OrderPage.jsx]
    → Gọi: GET /api/v1/orders/:id
       Header: Authorization: Bearer <accessToken>
    ← Nhận đầy đủ chi tiết đơn hàng

    → Hiển thị timeline trạng thái:
       [Đặt hàng] → [Xác nhận] → [Đóng gói] → [Đang giao] → [Đã nhận]
       (highlight bước hiện tại dựa trên status)
    → Hiển thị: địa chỉ giao, phương thức thanh toán, danh sách sản phẩm
    → Nếu status = 'pending': hiển thị nút "Hủy đơn"
```

---

## LUỒNG 9: Admin Quản lý hệ thống (Admin Dashboard & Management)

**Màn hình liên quan:** `/admin` → `/admin/products`, `/admin/order`, `/admin/user`, `/admin/analytics`  
**Actor:** Admin (role = 'admin')

```
[Admin]
    → Đăng nhập → AuthContext kiểm tra role = 'admin'
    → AdminRoute.jsx: cho phép truy cập /admin/*
    → Vào /admin → Dashboard

--- Dashboard ---

[Dashboard.jsx]
    → Gọi song song 3 request:
       (1) GET /api/v1/orders/revenue?period=week  → doanh thu 7 ngày
       (2) GET /api/v1/orders/admin?page=1&limit=5 → 5 đơn mới nhất
       (3) GET /api/v1/orders/admin?groupBy=status → thống kê theo trạng thái

[Core Service - orderController.js]
    → requireAdmin middleware: kiểm tra role trong JWT
    → (1) Revenue query:
       SELECT DATE(order_date) as date, SUM(total) as revenue, COUNT(*) as count
       FROM orders WHERE order_date >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(order_date) ORDER BY date
    ← DashboardCard hiển thị: Tổng doanh thu, Số đơn, Sản phẩm bán chạy
    ← AdvancedCharts: vẽ biểu đồ đường doanh thu theo ngày

--- Quản lý Đơn hàng (/admin/order) ---

[OrderManager.jsx]
    → Gọi: GET /api/v1/orders/admin?page=1&status=pending&search=...
    ← Nhận: { orders: [...], total, page, totalPages }
    → Hiển thị bảng với filter theo status, search theo tên/SĐT
    
[Admin thay đổi trạng thái đơn]
    → Gọi: PATCH /api/v1/orders/:id/status
       Body: { status: 'processing' }
    → Core Service: UPDATE orders SET status=? WHERE id=?
    ← Cập nhật UI ngay (optimistic update hoặc refetch)

--- Quản lý Sản phẩm (/admin/products) ---

[ProductManager.jsx]
    → Gọi: GET /api/v1/products?includeInactive=true
    → Hiển thị bảng sản phẩm (tất cả kể cả hết hàng)

[Admin tạo sản phẩm mới]
    → ProductForm.jsx: nhập title, description, category, brand,
                       specs(JSON editor), images[], price, stock
    → Gọi: POST /api/v1/products
       Header: Authorization: Bearer <accessToken (admin)>
       Body: { title, description, category_id, brand, specs, images, price, stock }
    → Core Service:
       → requireAdmin middleware
       → Product.js: INSERT INTO products (...) VALUES (...)
    ← Cập nhật danh sách, hiện toast "Tạo sản phẩm thành công"

--- Quản lý Người dùng (/admin/user) ---

[UserManager.jsx]
    → Gọi Auth Service: GET /api/v1/auth/admin/users
       Header: Authorization: Bearer <accessToken (admin)>
    → Auth Service: SELECT id, email, full_name, role, is_active, created_at FROM users
    → Hiển thị bảng người dùng

[Admin vô hiệu hóa tài khoản]
    → Gọi: DELETE /api/v1/auth/admin/users/:id
    → Auth Service: UPDATE users SET is_active = false WHERE id = ?
    ← UserRow cập nhật badge "Đã vô hiệu hóa"

--- Analytics (/admin/analytics) ---

[Analytics.jsx]
    → Gọi nhiều endpoint song song:
       - Revenue by category
       - Top 10 sản phẩm bán chạy
       - Xu hướng đơn hàng theo tháng
    → ChartRevenueGrowth.jsx: biểu đồ tăng trưởng
    → ChartOrderTrend.jsx: xu hướng đơn hàng
    → exportReport(): xuất Excel/PDF báo cáo
```

---

## LUỒNG 10: AI Chatbot & Tìm kiếm Thông minh (AI Chatbot & Smart Search)

**Màn hình liên quan:** `ChatBotContainer` (floating widget trên mọi trang) + `ProductPage` (AI search)  
**Actor:** Người dùng

```
--- Phần A: AI Chatbot ---

[Người dùng]
    → Nhấn nút chat nổi (ChatButton.jsx) ở góc màn hình
    → ChatBotContainer.jsx mở lên (slide animation)

[ChatInput.jsx]
    → Người dùng nhập: "Tôi muốn mua laptop gaming dưới 20 triệu"
    → Nhấn Enter / nút gửi

[ChatBotContainer.jsx]
    → Thêm tin nhắn người dùng vào conversation_history (array)
    → Hiện loading indicator (typing...)
    → Gọi aiApi: POST /api/chat
       Body: {
           message: "Tôi muốn mua laptop gaming dưới 20 triệu",
           conversation_history: [ {role, content}, ... ]
       }

[AI Service - chatbot/api/chat.py]
    → Phát hiện intent: "product_search" (từ khóa laptop, mua, giá)
    → Gọi ai-parse: POST /api/search/ai-parse
       Body: { message: "laptop gaming dưới 20 triệu" }

[AI Service - api/search.py + llm/client.py]
    → Gửi prompt đến Groq API (llama3-8b-8192):
       "Extract search filters from: 'laptop gaming dưới 20 triệu'
        Return JSON: { q, category, min_price, max_price }"
    ← Groq trả về: { q: "laptop gaming", category: "laptop", max_price: 20000000 }

[AI Service - chat.py]
    → Gọi Core Service: GET /api/v1/products
       ?search=laptop+gaming&category=laptop&maxPrice=20000000&limit=5
    ← Core Service trả về: 5 sản phẩm phù hợp

    → Tạo response text với Groq LLM:
       "Dựa trên yêu cầu của bạn, tôi tìm được các laptop gaming..."
    ← Trả về: {
           message: "Dựa trên yêu cầu...",
           products: [{ id, title, price, image, url }],
           type: "product_recommendation"
       }

[ChatMessage.jsx]
    → Hiển thị text response
    → Nếu có products array → render ProductMiniCard[] trong chat
       (ảnh nhỏ, tên, giá, nút "Xem chi tiết" → link /product/:id)

--- Phần B: AI Parse cho Smart Search trên ProductPage ---

[ProductPage.jsx - SearchBar]
    → Người dùng nhập: "RAM 16GB DDR5 cho gaming"
    → Debounce 300ms
    → Gọi: GET /api/v1/products/suggestions?q=RAM+16GB+DDR5
    ← Dropdown gợi ý text: ["Kingston DDR5 16GB", "Corsair DDR5 16GB", ...]

[Người dùng nhấn Enter (tìm kiếm nâng cao)]
    → Gọi aiApi: POST /api/search/ai-parse
       Body: { message: "RAM 16GB DDR5 cho gaming" }
    ← Nhận: { q: "RAM DDR5", category: "ram", min_capacity: "16GB" }
    → Cập nhật filter state → trigger lại GET /api/v1/products với params mới
    → ProductPage re-render kết quả đã lọc thông minh

--- Phần C: Gợi ý Cross-sell / Upsell ---

[ProductDetailPage.jsx]
    → Sau khi người dùng xem chi tiết sản phẩm X
    → Gọi aiApi: POST /api/suggest
       Body: { product_id: X, cart_items: [...], type: 'cross_sell' }

[AI Service - suggest/cross_sell.py]
    → Xác định category của sản phẩm X (ví dụ: CPU)
    → Tìm các sản phẩm bổ sung (Motherboard, RAM, Cooler phù hợp)
    → scoring.py: tính compatibility score + popularity score
    → Sắp xếp theo combined_score giảm dần
    ← Trả về: [{ product, score, reason: "Tương thích với CPU này" }]

[RelatedProducts.jsx]
    → Render carousel với nhãn "Thường được mua kèm"
```

---

## LUỒNG BỔ SUNG: Build PC Tùy chỉnh (Build PC)

**Màn hình liên quan:** `BuildPCPage` → `ConfigViewModal` → `ShoppingCartPage`  
**Actor:** Người dùng đã đăng nhập

```
[Người dùng]
    → Truy cập /build-pc (ProtectedRoute)

[BuildPCPage.jsx]
    → Khởi tạo config state:
       { cpu: null, gpu: null, ram: null, storage: null,
         motherboard: null, psu: null, case: null, cooler: null }

    → Hiển thị 8 hàng component (BuildPartRow.jsx)

[Người dùng chọn danh mục CPU]
    → BuildPartRow.jsx gọi: GET /api/v1/products?category=cpu&limit=50
    ← Nhận danh sách CPU → hiển thị ProductMiniCard[]
    → Người dùng click chọn 1 CPU
    → BuildPCPage cập nhật state: config.cpu = { product_id, title, price, ... }

[Người dùng nhấn "Xem cấu hình"]
    → ConfigViewModal.jsx hiển thị:
       - Danh sách 8 linh kiện đã chọn
       - Tổng tiền tự tính: sum(component.price)
       - Nút "Thêm tất cả vào giỏ"

[Người dùng nhấn "Thêm tất cả vào giỏ"]
    → useCartRaw().addMultiple(Object.values(config))
    → Thêm 8 items vào localStorage cart
    → Redirect /shopping-cart
    → Tiếp tục theo Luồng 5 → 6 → 7 (Checkout → Order → Payment)
```

---

## Tóm tắt các Actors và Services

| Màn hình / Component | Service gọi | Dữ liệu chính |
|---|---|---|
| LoginForm, RegistrationForm | Auth Service :3001 | email, password, JWT tokens |
| ProductPage, HomePage | Core Service :3003 | products[], filters, pagination |
| ProductDetailPage | Core Service + AI Service :3002 | product detail, suggestions |
| ShoppingCartPage | localStorage (client-side) | cartItems[], quantity, total |
| ShippingInfoPage | — (form local) | address, shipping_method |
| CheckoutPage | Core Service (discount validate) | discount_code, final_total |
| PaymentPage | Core Service + Stripe API | payment_intent, card details |
| CompleteOrderPage | — (nhận từ router state) | order_id, confirmation |
| UserOrders, OrderPage | Core Service :3003 | orders[], status timeline |
| Admin Dashboard | Core Service + Auth Service | revenue, stats, users |
| ChatBotContainer | AI Service :3002 + Core + Groq | message, products, RAG |
| BuildPCPage | Core Service :3003 | products by category |

---

*File này phục vụ mục đích vẽ sequence diagram. Mỗi luồng thể hiện: Actor → Frontend Component → API call → Service xử lý → DB query → Response → UI render.*
