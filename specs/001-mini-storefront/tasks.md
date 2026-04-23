# Tasks: Mini Storefront – Cửa Hàng Trực Tuyến Tối Giản

**Input**: Design documents từ `specs/001-mini-storefront/`  
**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/ ✓

---

## Format: `[ID] [P?] [Story?] Mô tả với đường dẫn file`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc task chưa hoàn thành)
- **[US1–US4]**: User story tương ứng
- Các task không có `[USx]` thuộc phase Setup hoặc Foundational

---

## Phase 1: Setup – Khởi Tạo Dự Án

**Mục đích**: Tạo cấu trúc dự án, cài dependencies, cấu hình môi trường

- [ ] T001 Khởi tạo Next.js 14+ App Router project với TypeScript và Tailwind CSS (`pnpm create next-app`)
- [ ] T002 Cài đặt dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`
- [ ] T003 [P] Tạo file `.env.local` với 5 biến môi trường theo `quickstart.md`
- [ ] T004 [P] Cấu hình `next.config.ts` với `images.remotePatterns` cho Supabase Storage
- [ ] T005 [P] Tạo cấu trúc thư mục đầy đủ theo `plan.md`: `app/(shop)/`, `app/(admin)/`, `lib/`, `components/`, `__tests__/`, `supabase/migrations/`

---

## Phase 2: Foundational – Nền Tảng Bắt Buộc

**Mục đích**: Infrastructure dùng chung, PHẢI hoàn tất trước khi bắt đầu bất kỳ User Story nào

⚠️ **CRITICAL**: Không bắt đầu Phase 3+ trước khi Phase 2 hoàn tất

- [ ] T006 Tạo Supabase migration SQL đầy đủ trong `supabase/migrations/001_initial_schema.sql` theo `data-model.md` (5 bảng: categories, products, orders, order_items, payment_details; indexes; RLS policies; trigger updated_at)
- [ ] T007 Chạy migration trên Supabase project và seed dữ liệu mẫu (ít nhất 3 categories, 6 products đã publish)
- [ ] T008 [P] Tạo Supabase server client trong `lib/supabase/server.ts`: `createClient()` (anon key + cookies) và `createAdminClient()` (service role)
- [ ] T009 [P] Tạo Supabase browser client trong `lib/supabase/client.ts`: `createBrowserClient()` với anon key
- [ ] T010 Định nghĩa tất cả shared TypeScript types trong `lib/types.ts`: `Category`, `Product`, `CartItem`, `Cart`, `Order`, `OrderItem`, `PaymentDetail`
- [ ] T011 [P] Tạo utility `lib/utils/format.ts`: hàm `formatVND(amount: number): string` và `formatDate(date: string): string`
- [ ] T012 Tạo cart cookie helpers trong `lib/utils/cart-cookie.ts`: `getCart()`, `setCart()`, `clearCartCookie()` — đọc/ghi/xóa `httpOnly` cookie `cart` với JSON serialization
- [ ] T013 Tạo root layout `app/layout.tsx` với HTML skeleton và Tailwind base styles
- [ ] T014 Tạo shop layout `app/(shop)/layout.tsx` với `Navbar` component (đọc cart count từ cookie)
- [ ] T015 Tạo `components/Navbar.tsx` (Server Component): logo → `/`, danh mục links, cart icon + badge count

**Checkpoint**: Foundation sẵn sàng — có thể bắt đầu các User Story song song

---

## Phase 3: User Story 1 – Duyệt & Khám Phá Sản Phẩm (P1) 🎯 MVP

**Mục tiêu**: Khách hàng xem được danh sách sản phẩm theo danh mục, trang danh mục, trang chi tiết sản phẩm

**Kiểm thử độc lập**: Truy cập `/`, `/categories/[slug]`, `/products/[id]` — xem đúng sản phẩm đã publish, không thấy sản phẩm unpublished

- [ ] T016 [P] [US1] Tạo `components/ProductCard.tsx`: hiển thị ảnh (placeholder nếu thiếu), tên, giá format VND, nút "Thêm vào giỏ" (placeholder ở phase này)
- [ ] T017 [P] [US1] Tạo `components/ProductGrid.tsx`: nhận `products: Product[]` và render lưới responsive
- [ ] T018 [US1] Tạo trang chủ `app/(shop)/page.tsx` (Server Component): fetch tất cả categories kèm published products từ Supabase, nhóm theo danh mục, render `ProductGrid` cho mỗi danh mục; hiển thị thông báo nếu không có sản phẩm
- [ ] T019 [US1] Tạo trang danh mục `app/(shop)/categories/[slug]/page.tsx` (Server Component): fetch category by slug, fetch published products của category đó, render `ProductGrid`; trả 404 nếu slug không tồn tại
- [ ] T020 [US1] Tạo trang chi tiết sản phẩm `app/(shop)/products/[id]/page.tsx` (Server Component + Client Component cho quantity selector): hiển thị ảnh, tên, mô tả, giá VND, tồn kho, quantity input (min 1, max stock), nút "Thêm vào giỏ" (placeholder); trả 404 nếu sản phẩm không tồn tại hoặc unpublished
- [ ] T021 [P] [US1] Cập nhật `Navbar.tsx` để hiển thị danh sách categories làm navigation links

---

## Phase 4: User Story 2 – Giỏ Hàng (P2)

**Mục tiêu**: Khách hàng thêm sản phẩm vào giỏ, xem giỏ, cập nhật số lượng, xóa mục; giỏ persist qua navigation

**Kiểm thử độc lập**: Thêm sản phẩm vào giỏ → navigate sang trang khác → quay lại giỏ → số lượng đúng, có thể tăng/giảm/xóa; thêm vượt tồn kho → bị chặn

- [ ] T022 [US2] Tạo Server Action `addToCart(productId, quantity)` trong `lib/actions/cart.ts`: đọc cookie, query stock từ Supabase, validate tồn kho, cộng/thêm vào cart, ghi cookie, `revalidatePath('/cart')`; trả `{ success, error? }`
- [ ] T023 [US2] Tạo Server Action `updateCartQuantity(productId, quantity)` trong `lib/actions/cart.ts`: validate tồn kho nếu tăng, cập nhật hoặc xóa nếu quantity=0, ghi cookie, revalidate
- [ ] T024 [US2] Tạo Server Action `removeFromCart(productId)` trong `lib/actions/cart.ts`: xóa item khỏi cart cookie, revalidate
- [ ] T025 [US2] Tạo Server Action `clearCart()` trong `lib/actions/cart.ts`: xóa toàn bộ cart cookie
- [ ] T026 [US2] Kết nối nút "Thêm vào giỏ" trong `components/ProductCard.tsx` và `app/(shop)/products/[id]/page.tsx` với `addToCart` Server Action; hiển thị toast/thông báo lỗi khi vượt tồn kho
- [ ] T027 [P] [US2] Tạo `components/CartItemRow.tsx` (Client Component): ảnh, tên, đơn giá, quantity stepper (nút −/+), thành tiền, nút xóa; gọi `updateCartQuantity`/`removeFromCart` với optimistic UI
- [ ] T028 [US2] Tạo trang giỏ hàng `app/(shop)/cart/page.tsx` (Server Component): đọc cart cookie, render danh sách `CartItemRow`, hiển thị tổng tiền, nút "Tiến hành thanh toán" → `/checkout`; nếu giỏ trống hiển thị thông báo + link "Tiếp tục mua sắm"
- [ ] T029 [US2] Cập nhật `Navbar.tsx` để hiển thị cart badge với số lượng mục thực từ cookie (Server Component read)

---

## Phase 5: User Story 3 – Thanh Toán Giả Lập (P3)

**Mục tiêu**: Luồng checkout đầu cuối với 2 phương thức COD và Visa/Mastercard; ghi nhận order vào DB; xác nhận

**Kiểm thử độc lập**: Checkout COD → xác nhận với reference number; checkout CARD → nhập thông tin thẻ → xác nhận; cart trống → redirect; validation form lỗi → không submit; tồn kho về 0 → bị chặn

- [ ] T030 [P] [US3] Tạo `components/PaymentMethodSelector.tsx` (Client Component): radio COD/CARD; khi chọn CARD hiện form thẻ (cardholder name, card number mask, MM/YY, CVV); client-side validation định dạng (16 số, tháng 1–12, năm ≥ hiện tại, CVV 3 số)
- [ ] T031 [P] [US3] Tạo `components/CheckoutForm.tsx` (Client Component): tích hợp `PaymentMethodSelector`; fields: họ tên, email, địa chỉ giao hàng; validation tất cả trường bắt buộc trước khi submit; loading state khi đang gửi; hiển thị lỗi server nếu có
- [ ] T032 [US3] Tạo Server Action `submitOrder(formData)` trong `lib/actions/checkout.ts`: đọc cart cookie (EMPTY_CART guard), validate fields server-side với Zod, nếu CARD validate định dạng thẻ, kiểm tra tồn kho từng item, tạo `reference_number` (`ORD-{YYYYMMDD}-{6-char-random}`), insert `orders` + `order_items` + `payment_details` (nếu CARD, chỉ lưu `card_last4`/`cardholder_name`/`exp_month`/`exp_year`, KHÔNG lưu PAN/CVV) trong transaction, trừ stock, xóa cart cookie, `revalidatePath('/')`, redirect đến `/orders/{reference}`
- [ ] T033 [US3] Tạo trang checkout `app/(shop)/checkout/page.tsx` (Server Component + Client): guard redirect về `/cart` nếu giỏ trống; render tóm tắt đơn hàng (danh sách items + tổng tiền) bên cạnh `CheckoutForm`
- [ ] T034 [US3] Tạo trang xác nhận `app/(shop)/orders/[reference]/page.tsx` (Server Component): fetch order by reference_number kèm order_items + payment_details; hiển thị icon thành công, reference number, thông tin khách, phương thức thanh toán (COD hoặc `**** **** **** {last4}`), danh sách items, tổng tiền, nút "Tiếp tục mua sắm"

---

## Phase 6: User Story 4 – Admin: Quản Lý Sản Phẩm & Danh Mục (P4)

**Mục tiêu**: Admin truy cập qua secret path, quản lý sản phẩm (giá/tồn kho/publish) và danh mục (CRUD với guard)

**Kiểm thử độc lập**: Thay đổi giá/tồn kho/publish → phản ánh ngay storefront; tạo category mới → xuất hiện trong nav; xóa category có sản phẩm → bị chặn; xóa category trống → thành công

- [ ] T035 [US4] Tạo admin layout `app/(admin)/layout.tsx`: kiểm tra `ADMIN_SECRET` từ query param hoặc cookie; redirect về `/` nếu không hợp lệ; render admin navbar với links "Sản phẩm" và "Danh mục"
- [ ] T036 [P] [US4] Tạo Server Action `updateProduct(productId, data)` trong `lib/actions/admin.ts`: validate admin access, validate price ≥ 0 và stockQuantity ≥ 0 với Zod, update `products` qua `createAdminClient()`, `revalidatePath('/')` + `/products/{id}` + `/admin/products`
- [ ] T037 [US4] Tạo trang danh sách sản phẩm admin `app/(admin)/admin/products/page.tsx` (Server Component): fetch ALL products kèm category, render bảng (tên, danh mục, giá VND, tồn kho, trạng thái, thao tác); toggle publish/unpublish inline gọi `updateProduct`; link "Sửa" sang `/admin/products/[id]`
- [ ] T038 [US4] Tạo trang chỉnh sửa sản phẩm `app/(admin)/admin/products/[id]/page.tsx` (Server Component + Client form): load product, form fields (giá, tồn kho, đăng bán toggle); submit gọi `updateProduct`; redirect về `/admin/products` sau khi lưu
- [ ] T039 [P] [US4] Tạo Server Action `createCategory(data)` trong `lib/actions/admin.ts`: validate admin access, validate name + slug (non-empty, slug format `^[a-z0-9]+(?:-[a-z0-9]+)*$`), kiểm tra unique name/slug, insert `categories` qua admin client, `revalidatePath('/admin/categories')` + `revalidatePath('/')`
- [ ] T040 [P] [US4] Tạo Server Action `updateCategory(categoryId, data)` trong `lib/actions/admin.ts`: validate admin access, validate fields, kiểm tra unique trừ chính nó, update `categories`, revalidate tất cả paths liên quan bao gồm slug cũ
- [ ] T041 [P] [US4] Tạo Server Action `deleteCategory(categoryId)` trong `lib/actions/admin.ts`: validate admin access, count products trong category, nếu > 0 trả `{ success: false, error: 'HAS_PRODUCTS', count }`, nếu = 0 delete và revalidate
- [ ] T042 [US4] Tạo trang danh sách danh mục admin `app/(admin)/admin/categories/page.tsx` (Server Component): fetch categories với LEFT JOIN count products, render bảng (tên, slug, số sản phẩm, thao tác); nút xóa inline với confirm dialog — disabled nếu có sản phẩm, hiển thị tooltip số lượng; link "Đổi tên" và nút "＋ Danh Mục Mới"
- [ ] T043 [US4] Tạo trang tạo danh mục mới `app/(admin)/admin/categories/new/page.tsx` (Client Component): form (tên, slug auto-generate từ tên với debounce, cho phép override); validation client-side; submit gọi `createCategory`; redirect về `/admin/categories`
- [ ] T044 [US4] Tạo trang chỉnh sửa danh mục `app/(admin)/admin/categories/[id]/page.tsx` (Server Component + Client form): load category, form (tên, slug); submit gọi `updateCategory`; redirect về `/admin/categories`

---

## Phase 7: Polish & Cross-Cutting

**Mục đích**: Hoàn thiện chất lượng, deploy, smoke test

- [ ] T045 [P] Tạo các UI atomic components trong `components/ui/`: `Button`, `Input`, `Badge`, `Spinner`, `Toast` — dùng Tailwind CSS, đảm bảo WCAG 2.1 AA (focus visible, aria labels)
- [ ] T046 [P] Xử lý error boundaries và loading states: `loading.tsx` và `error.tsx` cho các route chính trong `(shop)` và `(admin)`
- [ ] T047 [P] Xử lý 404 pages: `not-found.tsx` cho sản phẩm/danh mục không tồn tại
- [ ] T048 [P] Viết unit tests trong `__tests__/unit/` cho: `formatVND()`, `getCart()`/`setCart()`, slug auto-generate util, Zod schemas trong Server Actions (coverage ≥ 80%)
- [ ] T049 [P] Viết E2E test Playwright trong `__tests__/e2e/us1-catalog.spec.ts`: duyệt trang chủ, mở trang danh mục, mở trang chi tiết sản phẩm, xác nhận sản phẩm unpublished không hiển thị
- [ ] T050 [P] Viết E2E test Playwright trong `__tests__/e2e/us2-cart.spec.ts`: thêm sản phẩm, navigate đi/về, cập nhật số lượng, xóa, thêm vượt tồn kho
- [ ] T051 [P] Viết E2E test Playwright trong `__tests__/e2e/us3-checkout.spec.ts`: checkout COD thành công, checkout CARD thành công, checkout CARD với thẻ sai định dạng, checkout giỏ trống
- [ ] T052 [P] Viết E2E test Playwright trong `__tests__/e2e/us4-admin.spec.ts`: cập nhật giá sản phẩm, toggle publish, tạo/sửa/xóa danh mục
- [ ] T053 Chạy WCAG 2.1 AA audit (axe-core hoặc Lighthouse) và fix các vi phạm accessibility
- [ ] T054 Cấu hình Vercel project: import từ GitHub, thêm 5 biến môi trường, trigger deploy đầu tiên
- [ ] T055 Smoke test production: kiểm tra 5 URL trong bảng Quickstart, xác nhận storefront hoạt động đúng trên domain Vercel

---

## Thứ Tự Dependency

```
Phase 1 (T001–T005)
    └─► Phase 2 (T006–T015)
            ├─► Phase 3/US1 (T016–T021)  ← MVP có thể stop ở đây
            │       └─► Phase 4/US2 (T022–T029)
            │               └─► Phase 5/US3 (T030–T034)
            │                       └─► Phase 7 (T045–T055)
            └─► Phase 6/US4 (T035–T044)  ← Có thể triển khai song song với US2/US3
```

**Parallel opportunities per phase**:
- Phase 3: T016, T017 song song với nhau; T018, T019, T020, T021 song song sau T016/T017
- Phase 4: T022–T025 song song với nhau; T027 song song; T026/T028/T029 sau T022–T025
- Phase 5: T030 và T031 song song; T032 độc lập với T030/T031; T033/T034 sau T032
- Phase 6: T036/T039/T040/T041 song song; T037/T038 sau T036; T042/T043/T044 sau T039–T041

---

## Tóm Tắt

| Metric | Giá trị |
|--------|---------|
| **Tổng số tasks** | 55 |
| **Phase 1 – Setup** | 5 tasks |
| **Phase 2 – Foundational** | 10 tasks |
| **Phase 3 – US1 (Catalog)** | 6 tasks |
| **Phase 4 – US2 (Cart)** | 8 tasks |
| **Phase 5 – US3 (Checkout)** | 5 tasks |
| **Phase 6 – US4 (Admin)** | 10 tasks |
| **Phase 7 – Polish/Deploy** | 11 tasks |
| **Tasks có thể chạy song song [P]** | 30 tasks |
| **MVP scope (P1 only)** | T001–T021 (21 tasks) |

**MVP gợi ý**: Hoàn thành Phase 1 + Phase 2 + Phase 3 (T001–T021) để có storefront catalog hoạt động được; sau đó thêm US2, US3, US4 theo thứ tự.
