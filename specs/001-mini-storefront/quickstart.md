# Quickstart: Mini Storefront

**Stack**: Next.js 14+ (App Router) · TypeScript · Supabase · Vercel  
**Nhánh**: `001-mini-storefront`

---

## Yêu Cầu Hệ Thống

- Node.js 20+
- pnpm 9+ (hoặc npm/yarn)
- Tài khoản Supabase (free tier đủ dùng)
- Tài khoản Vercel (để deploy)

---

## 1. Khởi Tạo Dự Án

```bash
# Tạo Next.js app mới
pnpm create next-app@latest mini-storefront \
  --typescript \
  --tailwind \
  --app \
  --src-dir=no \
  --import-alias="@/*"

cd mini-storefront
```

---

## 2. Cài Đặt Dependencies

```bash
# Supabase client
pnpm add @supabase/supabase-js @supabase/ssr

# Form validation
pnpm add zod

# Dev dependencies
pnpm add -D @types/node
```

---

## 3. Cấu Hình Supabase

### 3.1 Tạo project trên Supabase

1. Truy cập [supabase.com](https://supabase.com) → New Project
2. Lưu lại: **Project URL**, **anon key**, **service_role key**

### 3.2 Chạy migrations

Copy nội dung migration SQL từ [data-model.md](./data-model.md) và chạy trong **Supabase SQL Editor**.

### 3.3 Seed dữ liệu mẫu

```sql
-- Thêm danh mục
INSERT INTO categories (name, slug) VALUES
  ('Áo', 'ao'),
  ('Quần', 'quan'),
  ('Phụ kiện', 'phu-kien');

-- Thêm sản phẩm mẫu
INSERT INTO products (name, description, price, stock_quantity, is_published, category_id)
SELECT 'Áo Thun Basic', 'Áo thun cotton 100%', 150000, 50, true, id
FROM categories WHERE slug = 'ao';
```

---

## 4. Biến Môi Trường

Tạo file `.env.local` ở thư mục gốc:

```env
# Supabase (public – dùng được ở cả client và server)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase (private – chỉ dùng ở server/server actions)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cart cookie secret (tự sinh: openssl rand -base64 32)
CART_COOKIE_SECRET=your-random-secret-here

# Admin Form Login (US6) — thay thế ADMIN_SECRET cũ
ADMIN_USERNAME=admin
# Tạo hash: node -e "const b=require('bcryptjs');console.log(b.hashSync('your_password',12))"
ADMIN_PASSWORD_HASH=$2b$12$replace_with_bcrypt_hash
# Tự sinh: node -e "require('crypto').randomBytes(32).toString('hex')|0" hoặc openssl rand -hex 32
ADMIN_SESSION_SECRET=your-random-hex-secret-here

# Legacy — có thể xóa sau khi US6 hoàn thành
# ADMIN_SECRET=your-admin-secret-here
```

> **Lưu ý bảo mật**: Không commit `.env.local` vào git. `SUPABASE_SERVICE_ROLE_KEY` và `ADMIN_PASSWORD_HASH` không bao giờ được expose ra client.

### Tạo bcrypt hash cho admin password

```bash
# Cài bcryptjs nếu chưa có
pnpm add bcryptjs

# Tạo hash (thay 'your_password' bằng mật khẩu thực)
node -e "const b=require('bcryptjs'); console.log(b.hashSync('your_password', 12))"
# Copy output vào ADMIN_PASSWORD_HASH trong .env.local
```

---

## 5. Cấu Trúc Thư Mục Triển Khai

```
mini-storefront/
├── app/
│   ├── (shop)/                     # Storefront công khai
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Trang chủ
│   │   ├── categories/[slug]/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── orders/[reference]/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/products/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── layout.tsx
├── lib/
│   ├── actions/
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   └── admin.ts
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient()
│   │   └── server.ts               # createServerClient() với service role
│   ├── types.ts
│   └── utils/
│       ├── cart-cookie.ts
│       └── format.ts               # formatVND(), formatDate()
├── components/
│   ├── ui/                         # Button, Input, Badge, v.v.
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── CartItemRow.tsx
│   └── CheckoutForm.tsx
└── next.config.ts
```

---

## 6. Khởi Tạo Supabase Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}

export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [] } }
  )
}
```

---

## 7. Chạy Development

```bash
pnpm dev
# → http://localhost:3000
# → Admin: http://localhost:3000/admin?secret=<ADMIN_SECRET>
```

---

## 8. Deploy lên Vercel

```bash
# Cài Vercel CLI
pnpm add -g vercel

# Deploy (lần đầu)
vercel

# Thêm biến môi trường trên Vercel Dashboard:
# Settings → Environment Variables → thêm 5 biến từ .env.local
# (SUPABASE_SERVICE_ROLE_KEY và CART_COOKIE_SECRET: chỉ Production + Preview, không phải Public)
```

**Hoặc dùng Vercel GitHub integration**:
1. Push code lên GitHub
2. Import project trên vercel.com
3. Thêm environment variables trong dashboard
4. Deploy tự động

---

## 9. Kiểm Tra Nhanh Sau Deploy

| URL | Kỳ vọng |
|-----|---------|
| `/` | Hiển thị danh sách sản phẩm đã publish |
| `/categories/ao` | Hiển thị sản phẩm trong danh mục Áo |
| `/cart` | Hiển thị giỏ hàng trống hoặc có hàng |
| `/checkout` | Redirect về `/cart` nếu giỏ trống |
| `/admin?secret=xxx` | Hiển thị danh sách tất cả sản phẩm |

---

## 10. Cấu Hình `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',   // Supabase Storage
      },
    ],
  },
}

export default nextConfig
```
