# Mini Storefront

Cửa hàng trực tuyến tối giản — duyệt sản phẩm, thêm vào giỏ, và thanh toán giả lập (COD / thẻ). Xây dựng bằng **Next.js 15 App Router**, **Supabase**, và **TypeScript**.

---

## Khởi động nhanh

### 1. Cài dependencies

```bash
pnpm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_SECRET=<chuỗi-bí-mật-tự-chọn>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Chạy migration Supabase

Chạy file `supabase/migrations/001_initial_schema.sql` trực tiếp trong Supabase SQL Editor để tạo đầy đủ 5 bảng, indexes, RLS policies, và trigger `updated_at`.

### 4. Chạy server phát triển

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

---

## Hướng dẫn sử dụng

### Dành cho Khách hàng

| Trang | URL | Mô tả |
|-------|-----|-------|
| Trang chủ | `/` | Tất cả sản phẩm đã publish, nhóm theo danh mục |
| Danh mục | `/categories/[slug]` | Sản phẩm thuộc một danh mục cụ thể |
| Chi tiết sản phẩm | `/products/[id]` | Ảnh, mô tả, giá, tồn kho, chọn số lượng, thêm vào giỏ |
| Giỏ hàng | `/cart` | Xem/cập nhật/xóa các mục trong giỏ |
| Thanh toán | `/checkout` | Điền thông tin giao hàng + chọn phương thức thanh toán |
| Xác nhận đơn | `/orders/[reference]` | Tóm tắt đơn hàng sau khi đặt thành công |

**Luồng mua hàng điển hình:**

1. Duyệt sản phẩm từ trang chủ hoặc trang danh mục
2. Nhấn **"Thêm vào giỏ"** trên card sản phẩm, hoặc chọn số lượng trên trang chi tiết
3. Nhấn icon giỏ hàng ở thanh nav → trang `/cart`
4. Kiểm tra đơn hàng → nhấn **"Tiến hành thanh toán"**
5. Điền họ tên, email, địa chỉ giao hàng
6. Chọn phương thức thanh toán:
   - **COD** (Thanh toán khi nhận hàng) — không cần thêm thông tin
   - **CARD** (Visa/Mastercard) — nhập số thẻ 16 chữ số, MM/YY, CVV
7. Nhấn **"Đặt hàng"** → nhận trang xác nhận với mã reference `ORD-YYYYMMDD-XXXXXX`

### Dành cho Admin

Truy cập khu vực quản trị bằng cách thêm `?secret=<ADMIN_SECRET>` vào URL:

```
http://localhost:3000/admin/products?secret=<ADMIN_SECRET>
```

| Trang | URL | Chức năng |
|-------|-----|-----------|
| Danh sách sản phẩm | `/admin/products` | Xem tất cả sản phẩm, toggle publish/unpublish |
| Chỉnh sửa sản phẩm | `/admin/products/[id]` | Cập nhật giá, tồn kho, trạng thái |
| Danh sách danh mục | `/admin/categories` | Xem danh mục kèm số sản phẩm, nút xóa |
| Tạo danh mục | `/admin/categories/new` | Tạo danh mục mới với tên và slug |
| Sửa danh mục | `/admin/categories/[id]` | Cập nhật tên và slug danh mục |

**Lưu ý**: Không thể xóa danh mục đang có sản phẩm.

---

## Chạy tests

```bash
# Unit tests (Jest)
pnpm test

# Unit tests với coverage
pnpm test --coverage

# Type-check
pnpm exec tsc --noEmit
```

---

## Cấu trúc dự án

```
app/
  (shop)/          ← Layout có Navbar, routes: /, /categories, /products, /cart, /checkout, /orders
  (admin)/         ← Layout admin, routes: /admin/products, /admin/categories
lib/
  actions/         ← Server Actions (cart.ts, checkout.ts, admin.ts)
  supabase/        ← Supabase client (server.ts, client.ts)
  utils/           ← Helpers (format.ts, cart-cookie.ts)
  types.ts         ← Shared TypeScript types
components/        ← UI components (ProductCard, ProductGrid, CartItemRow, Navbar, …)
supabase/
  migrations/      ← SQL migration files
__tests__/
  unit/            ← Jest unit tests
  e2e/             ← Playwright E2E tests (coming soon)
```

---

## Deploy lên Vercel

1. Import repository vào [Vercel](https://vercel.com/new)
2. Thêm 5 biến môi trường (xem mục cấu hình bên trên)
3. Deploy — Vercel tự động build và deploy mỗi lần push
