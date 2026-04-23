# UI Contracts: Các Trang & Component Chính

**Loại**: Giao diện người dùng – luồng màn hình và props chính  
**Stack**: Next.js App Router, TypeScript, React Server/Client Components

---

## Trang Storefront

### `/` – Trang Chủ (Danh Sách Sản Phẩm)

**Loại**: Server Component  
**Dữ liệu**: Fetch `products` (is_published=true) kèm `categories`; nhóm theo danh mục.

**Hiển thị**:
- Tiêu đề cửa hàng + số lượng sản phẩm trong giỏ (từ cookie)
- Mỗi danh mục: tên danh mục + lưới sản phẩm
- Mỗi sản phẩm: ảnh, tên, giá, nút "Thêm vào giỏ"
- Nếu không có sản phẩm nào published: thông báo "Cửa hàng đang cập nhật"

---

### `/categories/[slug]` – Trang Danh Mục

**Loại**: Server Component  
**Dữ liệu**: Fetch `products` WHERE `category.slug = slug AND is_published = true`

**Hiển thị**:
- Breadcrumb: Trang chủ → Tên danh mục
- Lưới sản phẩm thuộc danh mục
- Nếu danh mục trống: ẩn trang hoặc hiển thị "Không có sản phẩm trong danh mục này"

---

### `/products/[id]` – Trang Chi Tiết Sản Phẩm

**Loại**: Server Component + Client Component (nút thêm giỏ)  
**Dữ liệu**: Fetch `products.id`, kèm `category`

**Hiển thị**:
- Ảnh sản phẩm (placeholder nếu không có)
- Tên, mô tả, giá (format VND)
- Số lượng tồn kho hiện tại
- Selector số lượng (min: 1, max: stock_quantity)
- Nút "Thêm vào giỏ" → gọi `addToCart` Server Action
- Thông báo lỗi nếu vượt tồn kho

---

### `/cart` – Trang Giỏ Hàng

**Loại**: Server Component (đọc cookie) + Client Components (quantity controls)

**Hiển thị**:
- Danh sách mục: ảnh, tên, đơn giá, số lượng (có thể chỉnh), thành tiền, nút xóa
- Tổng tiền giỏ hàng
- Nút "Tiến hành thanh toán" → `/checkout`
- Nếu giỏ trống: thông báo + nút "Tiếp tục mua sắm"

**Tương tác client**:
- Tăng/giảm số lượng → gọi `updateCartQuantity` Server Action (optimistic UI)
- Xóa mục → gọi `removeFromCart` Server Action

---

### `/checkout` – Trang Thanh Toán

**Loại**: Client Component (form phức tạp với điều kiện hiển thị)  
**Guard**: Nếu giỏ trống → redirect `/cart`

**Hiển thị**:

**Cột trái – Tóm tắt đơn hàng**:
- Danh sách mục: tên, số lượng, thành tiền
- Tổng cộng

**Cột phải – Form thanh toán**:

_Thông tin khách hàng_:
- Họ và tên (text, bắt buộc)
- Email (email, bắt buộc)
- Địa chỉ giao hàng (textarea, bắt buộc)

_Phương thức thanh toán_:
- Radio chọn: **Thanh toán khi nhận hàng (COD)** / **Thẻ Visa/Mastercard**

_Nếu chọn Visa/Mastercard_ (hiện động):
- Tên chủ thẻ (text, bắt buộc)
- Số thẻ (text, mask "XXXX XXXX XXXX XXXX", chỉ cho nhập số)
- Ngày hết hạn (text, mask "MM/YY")
- Mã CVV (password, 3 ký tự số, ẩn khi nhập)

- Nút "Đặt hàng" → gọi `submitOrder` Server Action

**Validation phía client** (trước khi submit):
- Tất cả trường bắt buộc đã điền
- Email đúng định dạng
- Số thẻ = 16 chữ số (nếu CARD)
- MM/YY: tháng 1–12, năm ≥ hiện tại
- CVV = 3 chữ số

**Trạng thái loading**: Nút "Đặt hàng" disabled + hiển thị spinner khi đang submit

---

### `/orders/[reference]` – Trang Xác Nhận Đơn Hàng

**Loại**: Server Component  
**Dữ liệu**: Fetch `orders` WHERE `reference_number = reference`, kèm `order_items` và `payment_details` (nếu có)

**Hiển thị**:
- Icon thành công + tiêu đề "Đặt hàng thành công!"
- Mã tham chiếu đơn hàng (nổi bật)
- Tóm tắt: tên khách, email, địa chỉ
- Phương thức thanh toán:
  - COD: "Thanh toán khi nhận hàng"
  - CARD: "Thẻ Visa/Mastercard – **** **** **** {last4}"
- Danh sách mục đã đặt + tổng tiền
- Nút "Tiếp tục mua sắm" → `/`

---

## Trang Admin

### `/admin/products` – Danh Sách Sản Phẩm Admin

**Loại**: Server Component  
**Dữ liệu**: Fetch ALL products (cả published lẫn unpublished), kèm categories

**Hiển thị** (bảng):
| Tên | Danh mục | Giá | Tồn kho | Trạng thái | Thao tác |
|-----|----------|-----|---------|------------|----------|

**Thao tác mỗi row**:
- Toggle publish/unpublish (inline) → `updateProduct` Server Action
- Nút "Sửa" → `/admin/products/[id]`

---

### `/admin/products/[id]` – Chỉnh Sửa Sản Phẩm

**Loại**: Server Component (load) + Client Component (form)

**Form fields**:
- Giá (number, >= 0, đơn vị VND)
- Số lượng tồn kho (number, >= 0)
- Đăng bán (checkbox/toggle)

**Validation**: Giá không âm, tồn kho không âm  
**Submit** → `updateProduct` Server Action → redirect `/admin/products`

---

### `/admin/categories` – Danh Sách Danh Mục Admin

**Loại**: Server Component  
**Dữ liệu**: Fetch tất cả `categories` kèm count sản phẩm trong mỗi danh mục (LEFT JOIN)

**Hiển thị** (bảng):
| Tên | Slug | Số sản phẩm | Thao tác |
|-----|------|-------------|----------|

**Thao tác mỗi row**:
- Nút "Đổi tên" → `/admin/categories/[id]`
- Nút "Xóa" → giao diện xác nhận inline; nếu danh mục có sản phẩm: hiển thị cảnh báo "Không thể xóa — có {n} sản phẩm" và disable nút xóa

**Thêm mới**: Nút "＋ Danh Mục Mới" → `/admin/categories/new`

---

### `/admin/categories/new` – Tạo Danh Mục Mới

**Loại**: Client Component (form)

**Form fields**:
- Tên danh mục (text, bắt buộc, unique)
- Slug (text, tự sinh từ tên, có thể chỉnh sửa; chỉ có chữ thường, số, gạch ngang)

**Auto-generate slug**: Khi người dùng gõ tên, slug được tự động sinh (ví dụ: "Áo Thun" → `ao-thun`) nhưng vẫn cho phép sửa thủ công.

**Validation**:
- Tên: không rỗng, chưa tồn tại
- Slug: chỉ `[a-z0-9-]`, không rỗng, chưa tồn tại

**Submit** → `createCategory` Server Action → redirect `/admin/categories`

---

### `/admin/categories/[id]` – Chỉnh Sửa Danh Mục

**Loại**: Server Component (load) + Client Component (form)

**Form fields**:
- Tên danh mục (text, bắt buộc)
- Slug (text, có thể chỉnh sửa)

**Validation**: Tên và slug không trùng với danh mục khác  
**Submit** → `updateCategory` Server Action → redirect `/admin/categories`

---

## Navbar Component

**Loại**: Server Component (đọc cart cookie để đếm số mục)

**Hiển thị**:
- Logo / tên cửa hàng → link `/`
- Danh mục chính → dropdown hoặc links
- Icon giỏ hàng + badge số lượng mục → link `/cart`

---

## Admin Navbar Component

**Hiển thị**:
- Link "Sản phẩm" → `/admin/products`
- Link "Danh mục" → `/admin/categories`
