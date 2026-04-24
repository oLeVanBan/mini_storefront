# Mini Storefront

Cửa hàng trực tuyến tối giản — duyệt sản phẩm, thêm vào giỏ, và thanh toán giả lập (COD / thẻ). Xây dựng bằng **Next.js 15 App Router**, **Supabase**, và **TypeScript**.

---

## Khởi động nhanh

### 1. Cài dependencies

```bash
pnpm install
```

### 2. Cấu hình biến môi trường

Sao chép file mẫu:

```bash
cp .env.local.example .env.local
```

| Biến | Lấy ở đâu |
|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `ADMIN_SESSION_SECRET` | `openssl rand -hex 32` |


### 3. Chạy migrations Supabase

Vào **Supabase Dashboard → SQL Editor**, chạy **lần lượt từng file** theo thứ tự:

| Thứ tự | File | Nội dung |
|--------|------|----------|
| 1 | `supabase/migrations/001_initial_schema.sql` | Schema, RLS, seed data (3 danh mục + 7 sản phẩm mẫu) |
| 2 | `supabase/migrations/002_user_id.sql` | Thêm cột `user_id` vào orders |
| 3 | `supabase/migrations/003_storage.sql` | Tạo bucket `product-images` cho upload ảnh |
| 4 | `supabase/migrations/004_admins.sql` | Bảng `admins` + tài khoản mặc định (`admin` / `admin123`) |

> ⚠️ Migration 004 tạo admin mặc định với mật khẩu `admin123` — **đổi ngay trước khi production** (xem mục [Đổi mật khẩu admin](#đổi-mật-khẩu-admin)).

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

Truy cập trang đăng nhập admin:

```
http://localhost:3000/admin/login
```

Đăng nhập bằng username/password được tạo trong bảng `admins` (mặc định sau migration 004: `admin` / `admin123`).

| Trang | URL | Chức năng |
|-------|-----|-----------|
| Đăng nhập | `/admin/login` | Đăng nhập admin |
| Danh sách sản phẩm | `/admin/products` | Xem tất cả sản phẩm, toggle publish/unpublish |
| Chỉnh sửa sản phẩm | `/admin/products/[id]` | Cập nhật tên, giá, tồn kho, ảnh, trạng thái |
| Danh sách danh mục | `/admin/categories` | Xem danh mục kèm số sản phẩm, nút xóa |
| Tạo danh mục | `/admin/categories/new` | Tạo danh mục mới với tên và slug |
| Sửa danh mục | `/admin/categories/[id]` | Cập nhật tên và slug danh mục |
| Đơn hàng | `/admin/orders` | Danh sách đơn, xác nhận / huỷ |
| Người dùng | `/admin/users` | Danh sách thành viên, khoá / mở khoá |

**Lưu ý**: Không thể xóa danh mục đang có sản phẩm.

### Đổi mật khẩu admin

1. Tạo hash mới:
   ```bash
   node -e "const b=require('bcryptjs'); b.hash('NEW_PASSWORD',12).then(console.log)"
   ```
2. Chạy lệnh SQL trong **Supabase Dashboard → SQL Editor**:
   ```sql
   UPDATE admins SET password_hash = '<new-hash>' WHERE username = 'admin';
   ```

> Credentials admin lưu trong bảng `admins` trên DB — không dùng env vars.

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

### Bước 1 — Chuẩn bị Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Vào **SQL Editor**, chạy **lần lượt** 4 file migration (xem mục [Chạy migrations](#3-chạy-migrations-supabase) ở trên)
3. Lấy các key tại **Settings → API**:
   - Project URL
   - `anon` (public) key
   - `service_role` (secret) key

### Bước 2 — Cấu hình Vercel

1. Import repository vào [Vercel](https://vercel.com/new)
2. Vào **Settings → Environment Variables**, thêm đủ 6 biến:

| Biến | Giá trị |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key từ Supabase |
| `ADMIN_SESSION_SECRET` | Chuỗi hex ngẫu nhiên ≥32 ký tự |


3. Nhấn **Deploy**

### Bước 3 — Xác nhận hoạt động

- Trang chủ hiển thị sản phẩm mẫu (từ seed data trong migration 001)
- Đăng nhập admin tại `/admin/login`
- Upload ảnh sản phẩm tại `/admin/products/{id}` (cần migration 003 đã chạy)

### Câu hỏi thường gặp khi deploy

**Q: Trang hiển thị trống, không có sản phẩm?**
→ Chưa chạy migration 001. Vào Supabase SQL Editor → chạy `001_initial_schema.sql`.

**Q: Upload ảnh bị lỗi?**
→ Kiểm tra: (1) đã chạy migration 003 tạo bucket, (2) `SUPABASE_SERVICE_ROLE_KEY` đúng trên Vercel.

**Q: Admin login không được?**
→ Kiểm tra: (1) migration 004 đã chạy (bảng `admins` có dữ liệu), (2) nhập đúng username/password, (3) `ADMIN_SESSION_SECRET` đã được set trên Vercel.

**Q: Sau khi đặt hàng, trang order không hiện?**
→ Kiểm tra migration 002 đã chạy chưa.
