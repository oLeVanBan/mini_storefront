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

- [x] T001 Khởi tạo Next.js 14+ App Router project với TypeScript và Tailwind CSS (`pnpm create next-app`)
- [x] T002 Cài đặt dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`
- [x] T003 [P] Tạo file `.env.local` với 5 biến môi trường theo `quickstart.md`
- [x] T004 [P] Cấu hình `next.config.ts` với `images.remotePatterns` cho Supabase Storage
- [x] T005 [P] Tạo cấu trúc thư mục đầy đủ theo `plan.md`: `app/(shop)/`, `app/(admin)/`, `lib/`, `components/`, `__tests__/`, `supabase/migrations/`

---

## Phase 2: Foundational – Nền Tảng Bắt Buộc

**Mục đích**: Infrastructure dùng chung, PHẢI hoàn tất trước khi bắt đầu bất kỳ User Story nào

⚠️ **CRITICAL**: Không bắt đầu Phase 3+ trước khi Phase 2 hoàn tất

- [x] T006 Tạo Supabase migration SQL đầy đủ trong `supabase/migrations/001_initial_schema.sql` theo `data-model.md` (5 bảng: categories, products, orders, order_items, payment_details; indexes; RLS policies; trigger updated_at)
- [ ] T007 Chạy migration trên Supabase project và seed dữ liệu mẫu (ít nhất 3 categories, 6 products đã publish)
- [x] T008 [P] Tạo Supabase server client trong `lib/supabase/server.ts`: `createClient()` (anon key + cookies) và `createAdminClient()` (service role)
- [x] T009 [P] Tạo Supabase browser client trong `lib/supabase/client.ts`: `createBrowserClient()` với anon key
- [x] T010 Định nghĩa tất cả shared TypeScript types trong `lib/types.ts`: `Category`, `Product`, `CartItem`, `Cart`, `Order`, `OrderItem`, `PaymentDetail`
- [x] T011 [P] Tạo utility `lib/utils/format.ts`: hàm `formatVND(amount: number): string` và `formatDate(date: string): string`
- [x] T012 Tạo cart cookie helpers trong `lib/utils/cart-cookie.ts`: `getCart()`, `setCart()`, `clearCartCookie()` — đọc/ghi/xóa `httpOnly` cookie `cart` với JSON serialization
- [x] T013 Tạo root layout `app/layout.tsx` với HTML skeleton và Tailwind base styles
- [x] T014 Tạo shop layout `app/(shop)/layout.tsx` với `Navbar` component (đọc cart count từ cookie)
- [x] T015 Tạo `components/Navbar.tsx` (Server Component): logo → `/`, danh mục links, cart icon + badge count

**Checkpoint**: Foundation sẵn sàng — có thể bắt đầu các User Story song song

---

## Phase 3: User Story 1 – Duyệt & Khám Phá Sản Phẩm (P1) 🎯 MVP

**Mục tiêu**: Khách hàng xem được danh sách sản phẩm theo danh mục, trang danh mục, trang chi tiết sản phẩm

**Kiểm thử độc lập**: Truy cập `/`, `/categories/[slug]`, `/products/[id]` — xem đúng sản phẩm đã publish, không thấy sản phẩm unpublished

- [x] T016 [P] [US1] Tạo `components/ProductCard.tsx`: hiển thị ảnh (placeholder nếu thiếu), tên, giá format VND, nút "Thêm vào giỏ" (placeholder ở phase này)
- [x] T017 [P] [US1] Tạo `components/ProductGrid.tsx`: nhận `products: Product[]` và render lưới responsive
- [x] T018 [US1] Tạo trang chủ `app/(shop)/page.tsx` (Server Component): fetch tất cả categories kèm published products từ Supabase, nhóm theo danh mục, render `ProductGrid` cho mỗi danh mục; hiển thị thông báo nếu không có sản phẩm
- [x] T019 [US1] Tạo trang danh mục `app/(shop)/categories/[slug]/page.tsx` (Server Component): fetch category by slug, fetch published products của category đó, render `ProductGrid`; trả 404 nếu slug không tồn tại
- [x] T020 [US1] Tạo trang chi tiết sản phẩm `app/(shop)/products/[id]/page.tsx` (Server Component + Client Component cho quantity selector): hiển thị ảnh, tên, mô tả, giá VND, tồn kho, quantity input (min 1, max stock), nút "Thêm vào giỏ" (placeholder); trả 404 nếu sản phẩm không tồn tại hoặc unpublished
- [x] T021 [P] [US1] Cập nhật `Navbar.tsx` để hiển thị danh sách categories làm navigation links

---

## Phase 4: User Story 2 – Giỏ Hàng (P2)

**Mục tiêu**: Khách hàng thêm sản phẩm vào giỏ, xem giỏ, cập nhật số lượng, xóa mục; giỏ persist qua navigation

**Kiểm thử độc lập**: Thêm sản phẩm vào giỏ → navigate sang trang khác → quay lại giỏ → số lượng đúng, có thể tăng/giảm/xóa; thêm vượt tồn kho → bị chặn

- [x] T022 [US2] Tạo Server Action `addToCart(productId, quantity)` trong `lib/actions/cart.ts`: đọc cookie, query stock từ Supabase, validate tồn kho, cộng/thêm vào cart, ghi cookie, `revalidatePath('/cart')`; trả `{ success, error? }`
- [x] T023 [US2] Tạo Server Action `updateCartQuantity(productId, quantity)` trong `lib/actions/cart.ts`: validate tồn kho nếu tăng, cập nhật hoặc xóa nếu quantity=0, ghi cookie, revalidate
- [x] T024 [US2] Tạo Server Action `removeFromCart(productId)` trong `lib/actions/cart.ts`: xóa item khỏi cart cookie, revalidate
- [x] T025 [US2] Tạo Server Action `clearCart()` trong `lib/actions/cart.ts`: xóa toàn bộ cart cookie
- [x] T026 [US2] Kết nối nút "Thêm vào giỏ" trong `components/ProductCard.tsx` và `app/(shop)/products/[id]/page.tsx` với `addToCart` Server Action; hiển thị toast/thông báo lỗi khi vượt tồn kho
- [x] T027 [P] [US2] Tạo `components/CartItemRow.tsx` (Client Component): ảnh, tên, đơn giá, quantity stepper (nút −/+), thành tiền, nút xóa; gọi `updateCartQuantity`/`removeFromCart` với optimistic UI
- [x] T028 [US2] Tạo trang giỏ hàng `app/(shop)/cart/page.tsx` (Server Component): đọc cart cookie, render danh sách `CartItemRow`, hiển thị tổng tiền, nút "Tiến hành thanh toán" → `/checkout`; nếu giỏ trống hiển thị thông báo + link "Tiếp tục mua sắm"
- [x] T029 [US2] Cập nhật `Navbar.tsx` để hiển thị cart badge với số lượng mục thực từ cookie (Server Component read)

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

- [x] T035 [US4] Tạo admin layout `app/(admin)/layout.tsx`: kiểm tra `ADMIN_SECRET` từ query param hoặc cookie; redirect về `/` nếu không hợp lệ; render admin navbar với links "Sản phẩm" và "Danh mục"
- [x] T036 [P] [US4] Tạo Server Action `updateProduct(productId, data)` trong `lib/actions/admin.ts`: validate admin access, validate price ≥ 0 và stockQuantity ≥ 0 với Zod, update `products` qua `createAdminClient()`, `revalidatePath('/')` + `/products/{id}` + `/admin/products`
- [x] T037 [US4] Tạo trang danh sách sản phẩm admin `app/(admin)/admin/products/page.tsx` (Server Component): fetch ALL products kèm category, render bảng (tên, danh mục, giá VND, tồn kho, trạng thái, thao tác); toggle publish/unpublish inline gọi `updateProduct`; link "Sửa" sang `/admin/products/[id]`
- [x] T038 [US4] Tạo trang chỉnh sửa sản phẩm `app/(admin)/admin/products/[id]/page.tsx` (Server Component + Client form): load product, form fields (giá, tồn kho, đăng bán toggle); submit gọi `updateProduct`; redirect về `/admin/products` sau khi lưu
- [x] T039 [P] [US4] Tạo Server Action `createCategory(data)` trong `lib/actions/admin.ts`: validate admin access, validate name + slug (non-empty, slug format `^[a-z0-9]+(?:-[a-z0-9]+)*$`), kiểm tra unique name/slug, insert `categories` qua admin client, `revalidatePath('/admin/categories')` + `revalidatePath('/')`
- [x] T040 [P] [US4] Tạo Server Action `updateCategory(categoryId, data)` trong `lib/actions/admin.ts`: validate admin access, validate fields, kiểm tra unique trừ chính nó, update `categories`, revalidate tất cả paths liên quan bao gồm slug cũ
- [x] T041 [P] [US4] Tạo Server Action `deleteCategory(categoryId)` trong `lib/actions/admin.ts`: validate admin access, count products trong category, nếu > 0 trả `{ success: false, error: 'HAS_PRODUCTS', count }`, nếu = 0 delete và revalidate
- [x] T042 [US4] Tạo trang danh sách danh mục admin `app/(admin)/admin/categories/page.tsx` (Server Component): fetch categories với LEFT JOIN count products, render bảng (tên, slug, số sản phẩm, thao tác); nút xóa inline với confirm dialog — disabled nếu có sản phẩm, hiển thị tooltip số lượng; link "Đổi tên" và nút "＋ Danh Mục Mới"
- [x] T043 [US4] Tạo trang tạo danh mục mới `app/(admin)/admin/categories/new/page.tsx` (Client Component): form (tên, slug auto-generate từ tên với debounce, cho phép override); validation client-side; submit gọi `createCategory`; redirect về `/admin/categories`
- [x] T044 [US4] Tạo trang chỉnh sửa danh mục `app/(admin)/admin/categories/[id]/page.tsx` (Server Component + Client form): load category, form (tên, slug); submit gọi `updateCategory`; redirect về `/admin/categories`

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

## Phase 8: Foundation Auth – Nền Tảng Xác Thực (Bắt buộc trước US5/US6/US7)

**Mục đích**: Cài đặt dependencies, migration DB, types và utils nền tảng cho toàn bộ auth system

⚠️ **CRITICAL**: Phải hoàn thành Phase 8 trước khi bắt đầu Phase 9, 10, 11

- [ ] T056 Cài đặt dependencies: `pnpm add bcryptjs && pnpm add -D @types/bcryptjs` trong `package.json`
- [ ] T057 [P] Viết migration `supabase/migrations/002_user_id.sql`: `ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL`, `CREATE INDEX idx_orders_user_id ON orders(user_id)`, `CREATE POLICY "orders_user_read" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid())`
- [ ] T058 [P] Thêm types `User` và `AdminSession` vào `lib/types.ts`: `User { id: string; email: string; fullName: string; createdAt: string; bannedUntil: string | null }`, `AdminSession { username: string; expiresAt: number }`
- [ ] T059 Viết tests cho `lib/utils/admin-session.ts` trong `__tests__/unit/utils/admin-session.test.ts`: ① sign tạo ra string không rỗng ② verify token hợp lệ trả `{ valid: true, session }` ③ verify token giả mạo (HMAC sai) trả `{ valid: false }` ④ verify token hết hạn trả `{ valid: false }`
- [ ] T060 Implement `lib/utils/admin-session.ts` (sau khi tests pass): `signAdminSession(username): string` — tạo payload `{username, expiresAt}`, HMAC-SHA256 với `ADMIN_SESSION_SECRET`, base64url encode; `verifyAdminSession(token): { valid: boolean; session?: AdminSession }` — decode, verify HMAC, check expiry (8h)
- [ ] T061 [P] Thêm env vars mới vào `.env.local.example`: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (với comment hướng dẫn tạo bcrypt hash), `ADMIN_SESSION_SECRET`; xóa `ADMIN_SECRET` cũ (deprecated)

**Checkpoint**: Admin session utils tested và passing — có thể bắt đầu Phases 9, 10, 11 song song

---

## Phase 9: User Story 5 – Xác Thực Khách Hàng (P5)

**Mục tiêu**: Đăng ký/đăng nhập/đăng xuất bằng email+password qua Supabase Auth; Navbar hiển thị trạng thái login; lịch sử đơn hàng tại `/profile/orders`

**Kiểm thử độc lập**: Đăng ký tài khoản mới → đăng nhập → Navbar hiển thị tên → `/profile/orders` có guard → đặt hàng khi login → đơn xuất hiện trong lịch sử → đăng xuất → Navbar trở về trạng thái chưa login

- [ ] T062 [P] [US5] Viết tests cho `registerUser` trong `__tests__/unit/actions/auth.test.ts`: ① happy path — `signUp` được gọi đúng args, trả `{ success: true }` ② email đã tồn tại — map error thành `{ success: false, error: 'EMAIL_TAKEN' }` ③ password < 8 ký tự — `{ success: false, error: 'VALIDATION_ERROR', fields: { password: '...' } }` ④ email không hợp lệ — validation error ⑤ fullName rỗng — validation error
- [ ] T063 [US5] Implement `registerUser(formData)` trong `lib/actions/auth.ts` (sau khi T062 tests pass): validate với Zod (`fullName` required, `email` email format, `password` min 8), gọi `createClient().auth.signUp({ email, password, options: { data: { full_name: fullName } } })`, map lỗi Supabase identity conflict thành `EMAIL_TAKEN`, `redirect('/')` khi thành công
- [ ] T064 [P] [US5] Viết tests cho `loginUser` trong `__tests__/unit/actions/auth.test.ts`: ① happy path — `signInWithPassword` gọi đúng ② sai password hoặc email không tồn tại — trả `{ success: false, error: 'INVALID_CREDENTIALS' }` (không phân biệt loại lỗi) ③ tài khoản bị khoá — cũng trả `INVALID_CREDENTIALS` (không tiết lộ lý do) ④ email trống — validation error
- [ ] T065 [US5] Implement `loginUser(formData)` và `logoutUser()` trong `lib/actions/auth.ts` (sau khi T064 tests pass): `loginUser` — validate email + password không rỗng, gọi `signInWithPassword`, map mọi lỗi auth thành `INVALID_CREDENTIALS`, `redirect('/')` khi thành công; `logoutUser` — gọi `signOut()`, `redirect('/')`
- [ ] T066 [US5] Cập nhật `middleware.ts`: thêm `await supabase.auth.getUser()` để refresh Supabase session token trong mỗi request (đặt trước logic admin guard hiện có); bảo đảm middleware không break routes hiện tại
- [ ] T067 [P] [US5] Cập nhật `components/Navbar.tsx` (Server Component): gọi `createClient().auth.getUser()` để lấy user session; nếu chưa login: hiển thị link "Đăng nhập" → `/login`; nếu đã login: hiển thị tên user (`user_metadata.full_name` hoặc email) + dropdown "Đơn hàng của tôi" + form action gọi `logoutUser`
- [ ] T068 [P] [US5] Implement trang `/login` — `app/(shop)/login/page.tsx` (Client Component): form email + password, gọi `loginUser` Server Action, hiển thị lỗi "Email hoặc mật khẩu không đúng" cho `INVALID_CREDENTIALS` (thông báo duy nhất), loading state khi submit, link "Chưa có tài khoản? Đăng ký" → `/register`; test: render form, submit gọi action, hiển thị lỗi
- [ ] T069 [P] [US5] Implement trang `/register` — `app/(shop)/register/page.tsx` (Client Component): form fullName + email + password, client-side validate password ≥ 8 ký tự, gọi `registerUser` Server Action, hiển thị lỗi field-level và `EMAIL_TAKEN`, loading state, link "Đã có tài khoản? Đăng nhập" → `/login`; test: validation, submit, error display
- [ ] T070 [US5] Implement trang lịch sử đơn hàng `app/(shop)/profile/orders/page.tsx` (Server Component): guard — `getUser()` null → `redirect('/login?redirect=/profile/orders')`; fetch `orders WHERE user_id = user.id ORDER BY created_at DESC` qua service role; render bảng (mã đơn hàng, ngày, tổng tiền VND, phương thức, trạng thái); mỗi row là link → `/orders/[reference]`; hiển thị "Chưa có đơn hàng nào" nếu trống

---

## Phase 10: User Story 6 – Đăng Nhập Admin Qua Form (P6)

**Mục tiêu**: Thay thế cơ chế `?secret=` trong URL bằng form login an toàn với bcrypt; admin session qua HMAC-signed httpOnly cookie

**Kiểm thử độc lập**: Truy cập `/admin/products` → redirect `/admin/login` → form login đúng → vào được admin → form login sai → thông báo lỗi → đăng xuất → cookie bị xóa; user thường đã login không vào được admin

- [ ] T071 [P] [US6] Viết tests cho `adminLogin` trong `__tests__/unit/actions/admin-auth.test.ts`: ① happy path — username + password đúng, set cookie `admin_session`, trả `{ success: true }` ② sai password — `{ success: false, error: 'INVALID_CREDENTIALS' }` ③ sai username — `{ success: false, error: 'INVALID_CREDENTIALS' }` ④ username rỗng — validation ⑤ password rỗng — validation
- [ ] T072 [US6] Implement `lib/actions/admin-auth.ts` (sau khi T071 pass): `adminLogin(formData)` — validate username + password không rỗng, compare username với `process.env.ADMIN_USERNAME`, `bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)`, nếu đúng gọi `signAdminSession()` → set httpOnly cookie `admin_session` (maxAge 8h), `redirect('/admin/products')`; `adminLogout()` — xóa cookie, `redirect('/admin/login')`
- [ ] T073 [US6] Cập nhật `middleware.ts`: thay logic kiểm tra `admin_secret` bằng `verifyAdminSession(cookie)` từ `lib/utils/admin-session.ts`; loại bỏ hoàn toàn cơ chế `?secret=` query param; đảm bảo user thường (có Supabase session nhưng không có `admin_session`) vẫn bị redirect về `/admin/login`
- [ ] T074 [US6] Cập nhật trang `/admin/login` — `app/admin/login/page.tsx`: đổi form action để gọi `adminLogin` Server Action (thay vì `POST /api/admin/login`); xóa `app/api/admin/login/route.ts` cũ nếu không còn dùng; hiển thị "Thông tin đăng nhập không đúng" cho `INVALID_CREDENTIALS`
- [ ] T075 [US6] Cập nhật `app/(admin)/layout.tsx`: xóa mọi legacy secret check còn sót lại; thêm nút "Đăng xuất" vào admin navbar gọi `adminLogout()` Server Action; thêm link "Người dùng" → `/admin/users`

---

## Phase 11: User Story 7 – Quản Lý Người Dùng Admin (P7)

**Mục tiêu**: Admin xem danh sách users, xem chi tiết + lịch sử đơn hàng, khoá/mở khoá tài khoản, tìm kiếm

**Kiểm thử độc lập**: `/admin/users` → danh sách users → khoá 1 user → user đó đăng nhập bị từ chối → admin mở khoá → user đăng nhập được; admin search tìm đúng user

- [ ] T076 [P] [US7] Viết tests cho `toggleUserBan` trong `__tests__/unit/actions/admin-users.test.ts`: ① ban user — `auth.admin.updateUser` được gọi với `{ ban_duration: '876600h' }`, trả `{ success: true }` ② unban user — `{ ban_duration: 'none' }` ③ userId không tồn tại — `{ success: false, error: 'USER_NOT_FOUND' }` ④ không có admin session — `{ success: false, error: 'UNAUTHORIZED' }`
- [ ] T077 [US7] Implement `lib/actions/admin-users.ts` (sau khi T076 pass): `toggleUserBan(userId, ban)` — kiểm tra `admin_session` cookie bằng `verifyAdminSession`, gọi `createAdminClient().auth.admin.updateUser(userId, { ban_duration: ban ? '876600h' : 'none' })`, map lỗi `user_not_found` thành `USER_NOT_FOUND`, `revalidatePath('/admin/users')`
- [ ] T078 [US7] Implement trang danh sách users `app/(admin)/admin/users/page.tsx` (Server Component): gọi `createAdminClient().auth.admin.listUsers()`, join count orders per user (service role SQL), render bảng (email, tên, ngày đăng ký, số đơn hàng, trạng thái badge); ô tìm kiếm client-side filter theo email/tên; nút "Khoá"/"Mở khoá" gọi `toggleUserBan` inline; link "Chi tiết" → `/admin/users/[id]`
- [ ] T079 [US7] Implement trang chi tiết user `app/(admin)/admin/users/[id]/page.tsx` (Server Component): `auth.admin.getUserById(id)`, fetch orders của user, hiển thị profile (email, tên, ngày đăng ký, lần login cuối, trạng thái), nút "Khoá"/"Mở khoá" inline, bảng đơn hàng (reference, ngày, tổng, phương thức, trạng thái) mỗi row link → `/orders/[reference]`; trả 404 nếu user không tồn tại
- [ ] T080 [P] [US7] Cập nhật admin navbar trong `app/(admin)/layout.tsx`: thêm link "Người dùng" → `/admin/users` (nếu chưa làm ở T075)

---

## Phase 12: Auth Integration & Polish

**Mục đích**: Kết nối auth với checkout, cập nhật documentation, đảm bảo backward compatibility

- [ ] T081 [US5] Cập nhật `lib/actions/checkout.ts` — `submitOrder`: sau khi validate cart, gọi `createClient().auth.getUser()` lấy user session; nếu user đã login set `user_id = user.id` trong `orders` INSERT, nếu guest để `user_id = NULL`; không thay đổi bất kỳ behavior nào khác của checkout
- [ ] T082 [P] Cập nhật `specs/001-mini-storefront/quickstart.md`: thêm section "Setup Admin Password" với lệnh tạo bcrypt hash, cập nhật bảng env vars với 3 biến mới, thêm hướng dẫn chạy migration 002

---

## Thứ Tự Dependency (Cập Nhật)

```
Phase 1 (T001–T005)
    └─► Phase 2 (T006–T015)
            ├─► Phase 3/US1 (T016–T021)  ← MVP có thể stop ở đây
            │       └─► Phase 4/US2 (T022–T029)
            │               └─► Phase 5/US3 (T030–T034)
            │                       └─► Phase 7 (T045–T055)
            └─► Phase 6/US4 (T035–T044)  ← Song song với US2/US3
            └─► Phase 8/Auth Foundation (T056–T061)  ← Song song với US1–US4
                    ├─► Phase 9/US5 (T062–T070)
                    ├─► Phase 10/US6 (T071–T075)
                    └─► Phase 11/US7 (T076–T080)  ← Phụ thuộc US6 hoàn thành
                                └─► Phase 12/Integration (T081–T082)
```

**Parallel opportunities per phase (mới)**:
- Phase 8: T057, T058, T061 song song với T056; T059 → T060 (sequential, TDD)
- Phase 9: T062 → T063 (TDD seq); T064 → T065 (TDD seq); T066, T067, T068, T069 song song sau T065; T070 sau T066+T067
- Phase 10: T071 → T072 (TDD seq); T073, T074 song song sau T072; T075 sau T073+T074
- Phase 11: T076 → T077 (TDD seq); T078, T079 song song sau T077; T080 có thể làm ở T075
- Phase 12: T081, T082 song song

---

## Tóm Tắt (Cập Nhật)

| Metric | Giá trị |
|--------|---------|
| **Tổng số tasks** | 82 |
| **Phase 1 – Setup** | 5 tasks (T001–T005) |
| **Phase 2 – Foundational** | 10 tasks (T006–T015) |
| **Phase 3 – US1 (Catalog)** | 6 tasks (T016–T021) |
| **Phase 4 – US2 (Cart)** | 8 tasks (T022–T029) |
| **Phase 5 – US3 (Checkout)** | 5 tasks (T030–T034) |
| **Phase 6 – US4 (Admin)** | 10 tasks (T035–T044) |
| **Phase 7 – Polish/Deploy** | 11 tasks (T045–T055) |
| **Phase 8 – Auth Foundation** | 6 tasks (T056–T061) |
| **Phase 9 – US5 (Customer Auth)** | 9 tasks (T062–T070) |
| **Phase 10 – US6 (Admin Login)** | 5 tasks (T071–T075) |
| **Phase 11 – US7 (User Management)** | 5 tasks (T076–T080) |
| **Phase 12 – Auth Integration** | 2 tasks (T081–T082) |
| **Tasks có thể chạy song song [P]** | 44 tasks |
| **Tasks TDD bắt buộc (viết test trước)** | T059, T062, T063, T064, T065, T071, T072, T076, T077 |
| **MVP scope ban đầu (US1 only)** | T001–T021 |
| **Auth MVP (US5 only)** | T056–T061 → T062–T070 |
