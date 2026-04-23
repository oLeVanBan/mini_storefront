# Data Model: Mini Storefront

**Ngày**: 2026-04-23  
**Tính năng**: 001-mini-storefront  
**Database**: Supabase (PostgreSQL)

---

## Tổng Quan Quan Hệ

```
auth.users  (1) ──────< orders (N)          [nullable FK, chỉ khi đặt hàng khi đã đăng nhập]
categories  (1) ──────< products (N)
products    (1) ──────< order_items (N)
orders      (1) ──────< order_items (N)
orders      (1) ──────< payment_details (0..1)
```

---

## Các Bảng

### `categories`

Nhóm phân loại sản phẩm.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Định danh duy nhất |
| `name` | `text` | NOT NULL | Tên danh mục hiển thị |
| `slug` | `text` | NOT NULL, UNIQUE | URL-friendly identifier (vd: `ao-thun`, `quan-jean`) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Thời điểm tạo |

**Index**: `categories(slug)` — tra cứu theo slug trên URL danh mục.

**RLS**: `SELECT` mở cho `anon`; không cho phép insert/update/delete từ client.

---

### `products`

Mặt hàng bán trong cửa hàng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Định danh duy nhất |
| `name` | `text` | NOT NULL | Tên sản phẩm |
| `description` | `text` | | Mô tả chi tiết |
| `price` | `numeric(12,0)` | NOT NULL, CHECK `price >= 0` | Giá tính bằng VND (không dấu thập phân) |
| `stock_quantity` | `integer` | NOT NULL, default `0`, CHECK `stock_quantity >= 0` | Số lượng tồn kho |
| `is_published` | `boolean` | NOT NULL, default `false` | `true` = hiển thị trên storefront |
| `category_id` | `uuid` | FK → `categories.id`, NOT NULL | Danh mục chứa sản phẩm |
| `image_url` | `text` | | URL ảnh sản phẩm (Supabase Storage hoặc external) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Thời điểm tạo |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Thời điểm cập nhật cuối |

**Index**:
- `products(category_id)` — query theo danh mục
- `products(is_published)` — lọc storefront
- `products(created_at DESC)` — sắp xếp mặc định

**RLS**:
- `SELECT` cho `anon`: `WHERE is_published = true`
- Admin thao tác qua service role (bypass RLS)

**Trigger**: Tự động cập nhật `updated_at` khi row thay đổi.

---

### `orders`

Đơn hàng đã được đặt thành công (giả lập thanh toán).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Định danh nội bộ |
| `reference_number` | `text` | NOT NULL, UNIQUE | Mã tham chiếu hiển thị cho khách (vd: `ORD-20260423-A1B2`) |
| `customer_name` | `text` | NOT NULL | Tên người đặt hàng |
| `customer_email` | `text` | NOT NULL, CHECK định dạng email | Email liên hệ |
| `delivery_address` | `text` | NOT NULL | Địa chỉ giao hàng (full text) |
| `total_amount` | `numeric(15,0)` | NOT NULL, CHECK `>= 0` | Tổng tiền đơn hàng (VND) |
| `payment_method` | `text` | NOT NULL, CHECK IN (`'COD'`, `'CARD'`) | Phương thức thanh toán |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK IN (`'pending'`, `'confirmed'`, `'cancelled'`) | Trạng thái đơn hàng |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE SET NULL, NULLABLE | Tài khoản khách hàng (null nếu guest) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Thời điểm đặt hàng |

**Index**:
- `orders(reference_number)` UNIQUE — tra cứu đơn hàng từ trang xác nhận
- `orders(user_id)` — lịch sử đơn hàng theo user
- `orders(created_at DESC)` — danh sách đơn hàng admin

**RLS**: Không có policy cho `anon`. Policy cho `authenticated`: `SELECT WHERE user_id = auth.uid()` (cho phép user xem đơn hàng của mình). Ghi qua service role.

---

### `order_items`

Các mục sản phẩm trong một đơn hàng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Định danh duy nhất |
| `order_id` | `uuid` | FK → `orders.id` ON DELETE CASCADE, NOT NULL | Đơn hàng chứa mục này |
| `product_id` | `uuid` | FK → `products.id`, NOT NULL | Sản phẩm được đặt |
| `product_name` | `text` | NOT NULL | Tên sản phẩm tại thời điểm đặt (snapshot) |
| `quantity` | `integer` | NOT NULL, CHECK `quantity > 0` | Số lượng đặt |
| `unit_price` | `numeric(12,0)` | NOT NULL, CHECK `unit_price >= 0` | Đơn giá tại thời điểm đặt (snapshot) |

> **Ghi chú**: `product_name` và `unit_price` là snapshot — lưu giá trị tại thời điểm đặt hàng, không liên kết với giá hiện tại của sản phẩm.

**Index**:
- `order_items(order_id)` — join với bảng orders

**RLS**: Kế thừa từ `orders` — không expose ra client.

---

### `payment_details`

Thông tin thẻ tham chiếu (chỉ áp dụng khi `payment_method = 'CARD'`).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Định danh duy nhất |
| `order_id` | `uuid` | FK → `orders.id` ON DELETE CASCADE, NOT NULL, UNIQUE | 1-1 với orders |
| `cardholder_name` | `text` | NOT NULL | Tên chủ thẻ như in trên thẻ |
| `card_last4` | `char(4)` | NOT NULL, CHECK `~ '^[0-9]{4}$'` | 4 số cuối của thẻ |
| `exp_month` | `smallint` | NOT NULL, CHECK BETWEEN 1 AND 12 | Tháng hết hạn |
| `exp_year` | `smallint` | NOT NULL, CHECK `exp_year >= 2026` | Năm hết hạn (4 chữ số) |

> **Bảo mật**: Số thẻ đầy đủ (`PAN`) và mã CVV **không bao giờ được lưu** vào bảng này hay bất kỳ bảng nào khác. Chỉ lưu dữ liệu tham chiếu tối thiểu.

**Index**:
- `payment_details(order_id)` UNIQUE — 1-1 relationship với orders

**RLS**: Không có policy — không bao giờ accessible từ client. Chỉ service role.

---

## Trạng Thái & Chuyển Đổi

### Order Status

```
[Khách đặt hàng]
      │
      ▼
  "pending"     ← Trạng thái mặc định sau checkout
      │
      ▼
  "confirmed"   ← Admin xác nhận (tương lai, ngoài phạm vi MVP)
      │
      ▼
 "cancelled"    ← Admin huỷ (tương lai, ngoài phạm vi MVP)
```

Trong MVP, tất cả đơn hàng tạo ra đều ở trạng thái `pending`.

### Cart (không lưu DB)

```
Cookie: base64(JSON({ items: [{productId, quantity, price, name}], updatedAt }))
```

Cart không có trạng thái trong DB — chỉ tồn tại trong cookie phiên.

---

## Quy Tắc Nghiệp Vụ Chính

1. **Tồn kho không âm**: `products.stock_quantity` có CHECK constraint `>= 0`.
2. **Giá không âm**: `products.price` có CHECK constraint `>= 0`.
3. **Snapshot giá khi đặt hàng**: `order_items.unit_price` và `order_items.product_name` được copy từ `products` lúc checkout — không liên kết động.
4. **Tồn kho trừ khi checkout**: Không trừ tồn kho khi thêm vào giỏ; chỉ trừ khi đơn hàng được tạo thành công (atomic transaction).
5. **Payment detail chỉ cho CARD**: Bảng `payment_details` chỉ có row khi `orders.payment_method = 'CARD'`.
6. **Reference number duy nhất**: Format `ORD-{YYYYMMDD}-{6-char-random}`, được tạo phía server trước khi insert.
7. **user_id nullable trong orders**: Guest checkout không có `user_id`; khi user đã đăng nhập, `user_id` được set từ `supabase.auth.getUser().data.user.id`. Không bao giờ expose `user_id` ra client.
8. **Không có custom `users` table**: Supabase Auth tự quản lý `auth.users`. `user_metadata.full_name` lưu tên đầy đủ. Không cần thêm bảng public.

---

## Bảng Supabase Auth (Được Quản Lý Tự Động)

Supabase Auth tự động tạo và quản lý bảng `auth.users`. Các field quan trọng cho project:

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | `uuid` | PK — dùng làm FK trong `orders.user_id` |
| `email` | `text` | Email đăng nhập (unique) |
| `encrypted_password` | `text` | Password đã bcrypt hash (quản lý bởi Supabase) |
| `user_metadata` | `jsonb` | `{ full_name: string }` — set khi đăng ký |
| `created_at` | `timestamptz` | Ngày tạo tài khoản |
| `last_sign_in_at` | `timestamptz` | Lần đăng nhập cuối |
| `banned_until` | `timestamptz` | null = không bị khoá; future date = bị khoá |
| `confirmed_at` | `timestamptz` | null = chưa xác nhận email |

> **Ghi chú**: Admin tương tác với `auth.users` qua `supabase.auth.admin.*` API (service role). Không trực tiếp query `auth.users` bằng SQL từ server actions.

---

## Migration SQL (Tham Khảo)

```sql
-- 1. Categories
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- 2. Products
CREATE TABLE products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  description    text,
  price          numeric(12,0) NOT NULL CHECK (price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_published   boolean NOT NULL DEFAULT false,
  category_id    uuid NOT NULL REFERENCES categories(id),
  image_url      text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Orders
CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL CHECK (customer_email ~* '^[^@]+@[^@]+\.[^@]+$'),
  delivery_address text NOT NULL,
  total_amount     numeric(15,0) NOT NULL CHECK (total_amount >= 0),
  payment_method   text NOT NULL CHECK (payment_method IN ('COD', 'CARD')),
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: guest = null
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 4. Order Items
CREATE TABLE order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric(12,0) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 5. Payment Details
CREATE TABLE payment_details (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  cardholder_name  text NOT NULL,
  card_last4       char(4) NOT NULL CHECK (card_last4 ~ '^[0-9]{4}$'),
  exp_month        smallint NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
  exp_year         smallint NOT NULL CHECK (exp_year >= 2026)
);
CREATE INDEX idx_payment_details_order_id ON payment_details(order_id);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "products_public_read" ON products FOR SELECT TO anon USING (is_published = true);
-- orders: authenticated user can read their own orders
CREATE POLICY "orders_user_read" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid());
-- orders, order_items, payment_details: no anon policies → blocked by default
-- All writes go through service role

-- Migration 002: Add user_id to orders (run after initial migration if upgrading)
-- ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
-- CREATE INDEX idx_orders_user_id ON orders(user_id);
-- CREATE POLICY "orders_user_read" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid());
```
