# Research: Mini Storefront – Kế Hoạch Kỹ Thuật

**Ngày**: 2026-04-23  
**Tính năng**: 001-mini-storefront  
**Trạng thái**: Hoàn tất – tất cả điểm cần làm rõ đã được giải quyết  
**Cập nhật**: 2026-04-23 – Bổ sung US5 (Customer Auth), US6 (Admin Form Login), US7 (Admin User Management)

---

## 1. Quản Lý Trạng Thái Giỏ Hàng (Cart State)

### Quyết định: Cookies + Server Actions (không cần tài khoản, không có DB cart)

**Lý do chọn**:
- Cookies `httpOnly` được đọc trực tiếp trong Server Components qua `cookies()` từ `'next/headers'` — hoàn toàn tương thích SSR.
- Server Actions xử lý mutation (thêm/xóa/cập nhật) mà không cần endpoint API riêng.
- Không cần external session store; toàn bộ trạng thái giỏ hàng được mã hóa và lưu trong cookie (JSON serialized, base64 encoded).
- CSRF protection tự động từ Next.js.

**Phương án đã xem xét và loại bỏ**:
- `localStorage + React Context`: Không tương thích SSR, gây hydration mismatch, không bảo mật.
- `Zustand`: Cần hydration layer phức tạp, không phù hợp với App Router Server Components.
- `Supabase anonymous sessions`: Thêm độ phức tạp không cần thiết cho luồng không có auth.

**Giới hạn cần lưu ý**: Cookie tối đa ~4 KB — đủ cho 20–30 mục trong giỏ. Không đồng bộ giữa các tab trình duyệt (chấp nhận được với yêu cầu hiện tại).

---

## 2. Cấu Trúc Schema Supabase

### Quyết định: PostgreSQL với RLS và service role cho admin/checkout

**Cấu trúc bảng đã xác định**:

| Bảng | Mục đích | Truy cập |
|------|----------|----------|
| `categories` | Danh mục sản phẩm | Public read (anon) |
| `products` | Sản phẩm, giá, tồn kho | Public read nếu `is_published=true`; admin full access qua service role |
| `orders` | Đơn hàng đã đặt | Chỉ ghi qua service role (Server Action); không có client-side read |
| `order_items` | Các mục trong đơn hàng | Kế thừa từ `orders` |
| `payment_details` | 4 số cuối thẻ, tên chủ thẻ, hết hạn | Chỉ ghi qua service role; không bao giờ expose ra client |

**Index cần thiết**:
- `products(category_id)` — FK index cho query theo danh mục
- `products(is_published)` — filter storefront
- `products(created_at DESC)` — sorting
- `orders(reference_number) UNIQUE` — tra cứu đơn hàng
- `order_items(order_id)` — join với orders
- `payment_details(order_id)` — join với orders

**RLS Policies**:
- `categories`: `SELECT` cho `anon` — không cần điều kiện
- `products`: `SELECT` cho `anon` chỉ khi `is_published = true`; admin thao tác qua service role (bypass RLS)
- `orders`, `order_items`, `payment_details`: Không có policy cho `anon`; toàn bộ ghi/đọc qua service role từ backend

---

## 3. Cấu Trúc Thư Mục Next.js App Router

### Quyết định: Route Groups `(shop)` và `(admin)`, Server Actions trong `lib/actions/`

```
app/
├── (shop)/                         # Storefront công khai
│   ├── layout.tsx                  # Navbar, footer, cart icon
│   ├── page.tsx                    # Trang chủ – danh sách sản phẩm theo danh mục
│   ├── categories/[slug]/
│   │   └── page.tsx                # Trang danh mục
│   ├── products/[id]/
│   │   └── page.tsx                # Trang chi tiết sản phẩm
│   ├── cart/
│   │   └── page.tsx                # Trang giỏ hàng
│   ├── checkout/
│   │   └── page.tsx                # Trang thanh toán (form + phương thức)
│   └── orders/[reference]/
│       └── page.tsx                # Trang xác nhận đơn hàng
│
├── (admin)/                        # Khu vực quản trị
│   ├── layout.tsx                  # Admin navbar + kiểm tra truy cập
│   └── admin/
│       └── products/
│           ├── page.tsx            # Danh sách tất cả sản phẩm
│           └── [id]/
│               └── page.tsx        # Chỉnh sửa sản phẩm
│
├── lib/
│   ├── actions/
│   │   ├── cart.ts                 # addToCart, removeFromCart, updateQuantity, clearCart
│   │   ├── checkout.ts             # submitOrder
│   │   └── admin.ts                # updateProduct, togglePublish
│   ├── supabase/
│   │   ├── client.ts               # Browser client (anon key)
│   │   └── server.ts               # Server client (service role)
│   ├── types.ts                    # Shared TypeScript types
│   └── utils/
│       ├── cart-cookie.ts          # Đọc/ghi cookie giỏ hàng
│       └── format.ts               # Format tiền VND, ngày tháng
│
└── layout.tsx                      # Root layout
```

**Lý do**: Route groups cho phép `(shop)` và `(admin)` có layout riêng mà không ảnh hưởng URL. Server Actions trong `lib/actions/` dễ test và tái sử dụng.

---

## 4. Server Actions vs Route Handlers

### Quyết định: Server Actions cho tất cả mutations, Route Handlers chỉ nếu cần webhook sau này

**Mapping**:

| Thao tác | Cách xử lý | Lý do |
|----------|-----------|-------|
| Thêm/xóa/cập nhật giỏ hàng | Server Action | Cookie access trực tiếp, CSRF tự động |
| Gửi đơn hàng (checkout) | Server Action | Form validation, cookie clear, DB write |
| Cập nhật sản phẩm (admin) | Server Action | Đơn giản, không cần REST endpoint |
| Ẩn/hiện sản phẩm (admin) | Server Action | Toggle state đơn giản |
| Revalidate cache sau admin edit | `revalidatePath()` trong Server Action | ISR tự động trên Vercel |

---

## 5. Cấu Hình Vercel & Biến Môi Trường

### Quyết định: Zero-config Vercel, biến môi trường chuẩn Supabase

**Biến môi trường**:

| Biến | Phạm vi | Mô tả |
|------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (bí mật, không expose) |
| `CART_COOKIE_SECRET` | Server only | Secret để ký/mã hóa cookie giỏ hàng |
| `ADMIN_SECRET_PATH` | Server only | Path bí mật truy cập admin (thay cho auth thật) |

**Cấu hình `next.config.ts`**:
- `images.remotePatterns`: Supabase Storage URL cho ảnh sản phẩm
- Không cần cấu hình đặc biệt thêm — Vercel tự xử lý ISR, streaming, edge

**Revalidation**: Sau khi admin lưu thay đổi, gọi `revalidatePath('/')` và `revalidatePath('/products/[id]')` để cập nhật cache ISR trong vòng dưới 2 giây.

---

## Tóm Tắt Quyết Định

| Câu hỏi kỹ thuật | Quyết định | Căn cứ |
|------------------|-----------|--------|
| Cart state | Cookie (httpOnly) + Server Actions | SSR-compatible, bảo mật, không cần store |
| DB schema | Supabase PostgreSQL, RLS + service role | Phân quyền rõ ràng, payment data không expose |
| App structure | Next.js App Router với route groups | Layout tách biệt shop/admin, URL sạch |
| Mutations | Server Actions (tất cả) | CSRF tự động, DX tốt hơn, bundle nhỏ hơn |
| Deploy | Vercel zero-config | ISR tự động, global CDN, env var secure |
| Payment data | Chỉ lưu last4/exp, không lưu PAN/CVV | Tuân thủ nguyên tắc bảo mật tối thiểu |

---

## 6. Xác Thực Khách Hàng (Customer Auth – US5)

### Quyết định: Supabase Auth (`@supabase/ssr`) – email/password

**Lý do chọn**:
- `@supabase/ssr` đã được cài sẵn trong project; `createClient()` trong `lib/supabase/server.ts` đã dùng cookie adapter.
- Supabase Auth tự động quản lý session qua httpOnly cookie, refresh token hoàn toàn tự động qua middleware.
- API rõ ràng: `signUp`, `signInWithPassword`, `signOut`, `getUser()` — không cần custom table users.
- `auth.users` của Supabase lưu email, `user_metadata.full_name`, `created_at`, `banned_until` — đủ cho US5 & US7.

**Phương án đã xem xét và loại bỏ**:
- **Custom users table + bcryptjs + JWT**: Phức tạp hơn nhiều, cần tự xử lý token refresh, session store.
- **NextAuth.js (v5)**: Thêm dependency lớn, cấu hình phức tạp, chưa stable với Next.js App Router.
- **Lucia auth**: Minimal nhưng không có email/password built-in, cần viết thêm nhiều code.

**Luồng kỹ thuật**:
```
Đăng ký: POST form → Server Action `registerUser()` → supabase.auth.signUp({ email, password, options: { data: { full_name } } })
Đăng nhập: POST form → Server Action `loginUser()` → supabase.auth.signInWithPassword({ email, password })
Đăng xuất: Server Action `logoutUser()` → supabase.auth.signOut()
Session check: Server Component → createClient().auth.getUser() → user | null
```

**Middleware refresh (bắt buộc)**:
```typescript
// middleware.ts — Supabase yêu cầu refresh token trong mỗi request để tránh session hết hạn
await supabase.auth.getUser()  // Automatically refreshes session cookies
```

**Cart persistence khi đăng nhập**: Cookie `cart` vẫn còn nguyên sau khi đăng nhập — không cần merge logic vì cart là cookie độc lập.

---

## 7. Đăng Nhập Admin Form (US6)

### Quyết định: `bcryptjs` + env vars + httpOnly session cookie riêng

**Lý do chọn**:
- Admin là **single user**, không cần DB table phức tạp.
- `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` lưu trong env vars — đơn giản, không cần migration.
- `bcryptjs` (pure JS, không cần native binding) để hash và compare password.
- Session admin lưu trong httpOnly cookie `admin_session` riêng (không dùng Supabase Auth để tách biệt hoàn toàn).
- Middleware đọc `admin_session` cookie để guard toàn bộ `/admin/*`.

**Phương án đã xem xét và loại bỏ**:
- **Supabase Auth với admin role**: Cần JWT hook, custom claims — phức tạp hóa cho single admin.
- **Giữ `?secret=` trong URL**: Lộ thông tin trong browser history, server log, referer header — vi phạm bảo mật tối thiểu.
- **DB table `admin_credentials`**: Over-engineering cho một admin duy nhất trong MVP.

**Setup lần đầu**:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 12))"
# Copy hash vào ADMIN_PASSWORD_HASH trong .env.local
```

**Biến môi trường mới**:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$...   # bcrypt hash
ADMIN_SESSION_SECRET=...         # Random string dùng để sign JWT hoặc làm session value
```

**Session mechanism**: Sau khi login thành công, set httpOnly cookie `admin_session` với giá trị là HMAC-signed token `{username}:{timestamp}:{hmac}`. Middleware verify HMAC trước khi cho qua.

---

## 8. Quản Lý Người Dùng Admin (US7)

### Quyết định: `supabase.auth.admin.*` API qua service role client

**Lý do chọn**:
- `createAdminClient()` (service role) đã có sẵn trong `lib/supabase/server.ts`.
- `supabase.auth.admin.listUsers()` trả về danh sách đầy đủ users từ `auth.users`.
- `supabase.auth.admin.updateUser(uid, { ban_duration: '876600h' })` để khoá tài khoản (87660h ≈ 10 năm).
- `supabase.auth.admin.updateUser(uid, { ban_duration: 'none' })` để mở khoá.
- Không cần thêm bảng DB mới — tận dụng hoàn toàn Supabase Auth.

**User info có sẵn từ `auth.users`**:
| Field | Mô tả |
|-------|-------|
| `id` | UUID user |
| `email` | Email đăng nhập |
| `user_metadata.full_name` | Tên đầy đủ (từ đăng ký) |
| `created_at` | Ngày đăng ký |
| `banned_until` | null = không bị khoá; date = bị khoá đến |
| `last_sign_in_at` | Lần đăng nhập cuối |

**Số đơn hàng per user**: JOIN `orders.user_id` qua service role SQL.

**Tìm kiếm**: `listUsers()` lấy toàn bộ rồi filter phía server (số user nhỏ trong MVP). Nếu scale lớn hơn sau này có thể dùng Supabase Admin REST API với `?filter=email=...`.

---

## Tóm Tắt Quyết Định Cập Nhật

| Câu hỏi kỹ thuật | Quyết định | Căn cứ |
|------------------|-----------|--------|
| Cart state | Cookie (httpOnly) + Server Actions | SSR-compatible, bảo mật, không cần store |
| DB schema | Supabase PostgreSQL, RLS + service role | Phân quyền rõ ràng, payment data không expose |
| App structure | Next.js App Router với route groups | Layout tách biệt shop/admin, URL sạch |
| Mutations | Server Actions (tất cả) | CSRF tự động, DX tốt hơn, bundle nhỏ hơn |
| Deploy | Vercel zero-config | ISR tự động, global CDN, env var secure |
| Payment data | Chỉ lưu last4/exp, không lưu PAN/CVV | Tuân thủ nguyên tắc bảo mật tối thiểu |
| Customer auth | Supabase Auth (`@supabase/ssr`) | Đã cài sẵn, cookie session, không cần custom table |
| Admin auth | bcryptjs + env vars + httpOnly cookie | Đơn giản cho single admin, không lộ secret trong URL |
| Admin user management | `supabase.auth.admin.*` | Service role đã có, không cần bảng DB thêm |
