# Research: Mini Storefront – Kế Hoạch Kỹ Thuật

**Ngày**: 2026-04-23  
**Tính năng**: 001-mini-storefront  
**Trạng thái**: Hoàn tất – tất cả điểm cần làm rõ đã được giải quyết

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
