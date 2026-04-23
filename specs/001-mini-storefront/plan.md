# Kế Hoạch Triển Khai: Mini Storefront – Cửa Hàng Trực Tuyến Tối Giản

**Nhánh**: `001-mini-storefront` | **Ngày**: 2026-04-23 | **Spec**: [specs/001-mini-storefront/spec.md](./spec.md)  
**Đầu vào**: Đặc tả tính năng từ `specs/001-mini-storefront/spec.md`

## Tóm Tắt

Xây dựng cửa hàng trực tuyến tối giản với đầy đủ luồng: duyệt sản phẩm theo danh mục → thêm vào giỏ hàng → thanh toán giả lập (COD hoặc Visa/Mastercard) → xác nhận đơn hàng. Admin có thể cập nhật giá, tồn kho và trạng thái đăng bán của sản phẩm.

**Stack**: Next.js 14+ App Router (fullstack) · TypeScript · Supabase (PostgreSQL + Storage) · Deploy Vercel  
**Kiến trúc chính**: Server Components + Server Actions; giỏ hàng lưu trong cookie httpOnly; không có auth khách hàng; admin dùng secret path.

## Ngữ Cảnh Kỹ Thuật

**Ngôn ngữ/Phiên bản**: TypeScript 5.x, Node.js 20+  
**Dependencies chính**: Next.js 14+ (App Router), @supabase/supabase-js, @supabase/ssr, Zod, Tailwind CSS  
**Lưu trữ**: Supabase PostgreSQL (5 bảng); giỏ hàng trong cookie httpOnly (không có DB cart)  
**Testing**: Jest + React Testing Library (unit); Playwright (E2E integration tests)  
**Nền tảng**: Web application, deploy Vercel (Edge-compatible)  
**Loại dự án**: Fullstack web application (Next.js monolith)  
**Mục tiêu hiệu năng**: LCP ≤ 2,5s, INP ≤ 200ms, CLS < 0,1; API Server Actions p95 ≤ 200ms  
**Ràng buộc**: Không có auth khách hàng; không có payment gateway thật; không lưu PAN/CVV; admin qua secret path  
**Quy mô**: Demo project, ~10 màn hình, ~5 bảng DB, dưới 1.000 người dùng đồng thời

## Kiểm Tra Quy Ước Dự Án (Constitution Check)

*GATE: Kiểm tra trước Phase 0. Kiểm tra lại sau Phase 1 design.*

Xác minh tuân thủ tất cả nguyên tắc trong Mini Storefront Constitution:

- [x] **1. Simplicity First** — Monolith Next.js duy nhất; không tách microservice; Server Actions thay cho REST layer riêng; không over-engineer.
- [x] **2. Fullstack Type Safety** — TypeScript end-to-end; shared types trong `lib/types.ts`; Zod validation đồng bộ client/server.
- [x] **3. Modular Architecture** — Tách rõ: `components/` (UI), `lib/actions/` (business logic), `lib/supabase/` (data access); mỗi module có single responsibility.
- [x] **4. Minimal but Complete Flow** — Đủ luồng Product → Cart → Checkout; thanh toán giả lập không tích hợp gateway thật.
- [x] **5. Admin Control** — Admin có thể cập nhật giá, tồn kho, publish/unpublish qua Server Actions.
- [x] **6. Performance & DX** — Next.js App Router; Server Actions; ISR qua `revalidatePath()`; Vercel deploy zero-config.
- [x] **Tech Constraints** — Next.js + TypeScript + Supabase + Vercel đúng như yêu cầu.
- [x] **Non-Goals** — Không có payment gateway thật; admin dùng secret path (không phải auth đầy đủ).
- [x] **Testing Standards** — Jest + RTL (unit ≥ 80%); Playwright (E2E cho mỗi user story).
- [x] **Performance Requirements** — LCP ≤ 2,5s; INP ≤ 200ms; CLS < 0,1; Server Actions p95 ≤ 200ms.
- [x] **Bảo mật** — Không lưu PAN/CVV; RLS trên Supabase; service role key chỉ server-side; CSRF tự động qua Server Actions.

**Kết quả**: Không có vi phạm. Không cần bảng Complexity Tracking.

---

## Cấu Trúc Dự Án

### Tài Liệu (tính năng này)

```text
specs/001-mini-storefront/
├── plan.md              # File này – output của /speckit.plan
├── research.md          # Kết quả nghiên cứu kỹ thuật
├── data-model.md        # Schema DB và quan hệ thực thể
├── quickstart.md        # Hướng dẫn cài đặt và chạy
├── contracts/
│   ├── server-actions.md   # Server Actions contract + TypeScript types
│   └── ui-contracts.md     # UI pages contract
└── tasks.md             # Output của /speckit.tasks (chưa tạo)
```

### Source Code (thư mục gốc dự án)

```text
mini-storefront/
├── app/
│   ├── (shop)/                         # Route group: Storefront công khai
│   │   ├── layout.tsx                  # Navbar + footer chung
│   │   ├── page.tsx                    # Trang chủ: sản phẩm theo danh mục
│   │   ├── categories/[slug]/
│   │   │   └── page.tsx               # Trang danh mục
│   │   ├── products/[id]/
│   │   │   └── page.tsx               # Trang chi tiết sản phẩm
│   │   ├── cart/
│   │   │   └── page.tsx               # Trang giỏ hàng
│   │   ├── checkout/
│   │   │   └── page.tsx               # Trang thanh toán
│   │   └── orders/[reference]/
│   │       └── page.tsx               # Trang xác nhận đơn hàng
│   ├── (admin)/                        # Route group: Khu vực quản trị
│   │   ├── layout.tsx                  # Admin layout + kiểm tra secret
│   │   └── admin/
│   │       ├── products/
│   │       │   ├── page.tsx           # Danh sách tất cả sản phẩm
│   │       │   └── [id]/page.tsx      # Chỉnh sửa sản phẩm
│   │       └── categories/
│   │           ├── page.tsx           # Danh sách danh mục + số sản phẩm
│   │           ├── new/page.tsx       # Tạo danh mục mới
│   │           └── [id]/page.tsx      # Chỉnh sửa danh mục
│   └── layout.tsx                     # Root layout
│
├── lib/
│   ├── actions/
│   │   ├── cart.ts                    # addToCart, removeFromCart, updateQuantity, clearCart
│   │   ├── checkout.ts                # submitOrder
│   │   └── admin.ts                   # updateProduct, togglePublish, createCategory, updateCategory, deleteCategory
│   ├── supabase/
│   │   ├── client.ts                  # createBrowserClient() – anon key
│   │   └── server.ts                  # createServerClient() + createAdminClient() – service role
│   ├── types.ts                       # Shared TypeScript types (Product, Cart, Order, v.v.)
│   └── utils/
│       ├── cart-cookie.ts             # Đọc/ghi/mã hóa cookie giỏ hàng
│       └── format.ts                  # formatVND(), formatDate()
│
├── components/
│   ├── ui/                            # Atomic: Button, Input, Badge, Spinner, v.v.
│   ├── Navbar.tsx                     # Server Component – đọc cart count
│   ├── ProductCard.tsx                # Card sản phẩm + nút thêm giỏ
│   ├── ProductGrid.tsx                # Lưới sản phẩm
│   ├── CartItemRow.tsx                # Dòng mục trong giỏ (có quantity controls)
│   ├── CheckoutForm.tsx               # Form thanh toán (Client Component)
│   └── PaymentMethodSelector.tsx      # Radio COD/CARD + form thẻ (Client Component)
│
├── __tests__/
│   ├── unit/                          # Jest + RTL
│   └── e2e/                           # Playwright
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Migration SQL đầy đủ
│
├── .env.local                         # Biến môi trường (không commit)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**Quyết định cấu trúc**: Next.js monolith duy nhất với route groups để tách layout shop/admin. Không tách frontend/backend riêng — giữ đúng nguyên tắc Simplicity First.

---

## Theo Dõi Độ Phức Tạp

> Không có vi phạm Constitution — bảng này không cần điền.

---

## Lộ Trình Triển Khai

### Milestone 1 – Nền Tảng (P1: Catalog)
- Khởi tạo Next.js project + Supabase schema
- Seed dữ liệu mẫu (categories, products)
- Trang chủ: danh sách sản phẩm theo danh mục
- Trang danh mục, trang chi tiết sản phẩm
- **Testable**: Khách hàng duyệt và xem sản phẩm

### Milestone 2 – Giỏ Hàng (P2: Cart)
- Cookie-based cart (helpers: `cart-cookie.ts`)
- Server Actions: `addToCart`, `updateQuantity`, `removeFromCart`
- Trang giỏ hàng với quantity controls
- Navbar cart badge
- **Testable**: Thêm/sửa/xóa mục, persist qua navigation

### Milestone 3 – Thanh Toán (P3: Checkout)
- Trang checkout với form 2 phương thức (COD/CARD)
- Client-side validation định dạng thẻ
- Server Action `submitOrder`: transaction, stock decrement, tạo order
- Trang xác nhận đơn hàng
- **Testable**: Luồng đầu cuối checkout cả 2 phương thức

### Milestone 4 – Admin (P4: Admin Panel)
- Layout admin + kiểm tra secret path
- Trang danh sách sản phẩm admin
- Server Actions: `updateProduct` (giá, tồn kho, publish/unpublish)
- Trang danh sách danh mục admin (kèm số sản phẩm mỗi danh mục)
- Server Actions: `createCategory`, `updateCategory`, `deleteCategory` (có guard không cho xóa khi còn sản phẩm)
- Trang tạo mới + chỉnh sửa danh mục với auto-generate slug
- Admin navbar với link Sản phẩm / Danh mục
- Revalidation ISR sau khi admin lưu
- **Testable**: Admin cập nhật sản phẩm + tạo/sửa/xóa danh mục → phản ánh ngay trên storefront

### Milestone 5 – Chất Lượng & Deploy
- Unit tests (Jest/RTL) đạt ≥ 80% coverage
- E2E tests (Playwright) cho 4 user stories
- WCAG 2.1 AA audit
- Deploy lên Vercel + cấu hình env vars
- Smoke test production

---

## Tham Chiếu Tài Liệu

| Tài liệu | Mô tả |
|----------|-------|
| [spec.md](./spec.md) | Đặc tả tính năng, user stories, yêu cầu |
| [research.md](./research.md) | Nghiên cứu kỹ thuật và quyết định kiến trúc |
| [data-model.md](./data-model.md) | Schema DB, migration SQL, RLS policies |
| [contracts/server-actions.md](./contracts/server-actions.md) | Server Actions interface + TypeScript types |
| [contracts/ui-contracts.md](./contracts/ui-contracts.md) | UI pages contract + component specs |
| [quickstart.md](./quickstart.md) | Hướng dẫn cài đặt, biến môi trường, deploy |
