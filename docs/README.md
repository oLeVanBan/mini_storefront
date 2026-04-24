# Hướng Dẫn Sử Dụng – Mini Store

> Tài liệu mô tả đầy đủ các trang, luồng thao tác, đường dẫn và chức năng của hệ thống Mini Store chạy trên web.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Khách hàng – Giao diện Shop](#2-khách-hàng--giao-diện-shop)
   - 2.1 [Trang chủ `/`](#21-trang-chủ-)
   - 2.2 [Trang danh mục `/categories/{slug}`](#22-trang-danh-mục-categoriesslug)
   - 2.3 [Chi tiết sản phẩm `/products/{id}`](#23-chi-tiết-sản-phẩm-productsid)
   - 2.4 [Giỏ hàng `/cart`](#24-giỏ-hàng-cart)
   - 2.5 [Thanh toán `/checkout`](#25-thanh-toán-checkout)
   - 2.6 [Tra cứu đơn hàng `/orders`](#26-tra-cứu-đơn-hàng-orders)
   - 2.7 [Chi tiết đơn hàng `/orders/{reference}`](#27-chi-tiết-đơn-hàng-ordersreference)
   - 2.8 [Đăng ký `/register`](#28-đăng-ký-register)
   - 2.9 [Đăng nhập `/login`](#29-đăng-nhập-login)
   - 2.10 [Lịch sử đơn hàng `/profile/orders`](#210-lịch-sử-đơn-hàng-profileorders)
3. [Admin – Giao diện quản trị](#3-admin--giao-diện-quản-trị)
   - 3.1 [Đăng nhập Admin `/admin/login`](#31-đăng-nhập-admin-adminlogin)
   - 3.2 [Quản lý Sản phẩm `/admin/products`](#32-quản-lý-sản-phẩm-adminproducts)
   - 3.3 [Sửa Sản phẩm `/admin/products/{id}`](#33-sửa-sản-phẩm-adminproductsid)
   - 3.4 [Quản lý Danh mục `/admin/categories`](#34-quản-lý-danh-mục-admincategories)
   - 3.5 [Tạo Danh mục `/admin/categories/new`](#35-tạo-danh-mục-admincategoriesnew)
   - 3.6 [Quản lý Đơn hàng `/admin/orders`](#36-quản-lý-đơn-hàng-adminorders)
   - 3.7 [Chi tiết Đơn hàng Admin `/admin/orders/{id}`](#37-chi-tiết-đơn-hàng-admin-adminordersid)
   - 3.8 [Quản lý Người dùng `/admin/users`](#38-quản-lý-người-dùng-adminusers)


---

## 1. Tổng quan

**Mini Store** là cửa hàng trực tuyến đơn giản. Hai nhóm người dùng:

| Nhóm | Mô tả |
|------|-------|
| **Khách hàng** | Duyệt sản phẩm, thêm giỏ, đặt hàng, tra cứu đơn |
| **Admin** | Quản lý sản phẩm, danh mục, đơn hàng, người dùng |

**Tech stack:** Next.js 15 · TypeScript · Supabase · Tailwind CSS

---

## 2. Khách hàng – Giao diện Shop

### Thanh điều hướng (Navbar)

Cố định ở đầu trang, xuất hiện trên tất cả trang shop.

| Thành phần | Hành động |
|------------|-----------|
| **Mini Store** (logo) | Về trang chủ `/` |
| Tên danh mục (Áo, Quần…) | Lọc sản phẩm theo danh mục |
| **Đơn hàng** | Tra cứu đơn theo mã + email |
| **Đăng nhập** | Chuyển đến `/login` |
| **Đăng ký** | Chuyển đến `/register` |
| **Giỏ hàng** (icon túi + số) | Xem giỏ tại `/cart` |

> Khi đã đăng nhập: thay Đăng nhập/Đăng ký bằng **Đơn hàng** và **Đăng xuất**.

![Navbar1](/docs/images/Navbar1.png)
![Navbar2](/docs/images/Navbar2.png)

---

### 2.1 Trang chủ `/`

Hiển thị toàn bộ sản phẩm đang bán, nhóm theo danh mục.

**Thao tác:**
- Nhấn **"Xem tất cả →"** cạnh tên danh mục → vào `/categories/{slug}`
- Nhấn thẻ sản phẩm → vào `/products/{id}`
- Nhấn **"Thêm vào giỏ"** trên thẻ → thêm 1 đơn vị vào giỏ

![homepage](/docs/images/homepage.png)

---

### 2.2 Trang danh mục `/categories/{slug}`

**Ví dụ:** `/categories/ao`

Hiển thị sản phẩm thuộc một danh mục. Tương tác giống trang chủ.

![homepage](/docs/images/ao.png)

---

### 2.3 Chi tiết sản phẩm `/products/{id}`

**Nội dung:** Ảnh · Tên · Giá · Danh mục · Tồn kho · Mô tả

**Thao tác:**
- Nhấn **"Thêm vào giỏ hàng"** → thêm vào giỏ, số đếm trên navbar tăng
- Nếu hết hàng → nút bị vô hiệu hóa, hiển thị "Hết hàng"

![homepage](/docs/images/p-detail.png)

---

### 2.4 Giỏ hàng `/cart`

**Nội dung:** Danh sách sản phẩm đã thêm + Tóm tắt đơn hàng

**Thao tác:**

| Thao tác | Cách làm |
|----------|----------|
| Tăng số lượng | Nhấn **+** |
| Giảm số lượng | Nhấn **−** (về 0 thì xoá) |
| Xoá sản phẩm | Nhấn icon thùng rác |
| Tiếp tục mua | Nhấn **"← Tiếp tục mua sắm"** |
| Đặt hàng | Nhấn **"Tiến hành thanh toán →"** → `/checkout` |

> Khi giỏ trống → icon giỏ rỗng + nút về trang chủ.

![homepage](/docs/images/oder.png)

---

### 2.5 Thanh toán `/checkout`

> Nếu giỏ trống → tự động chuyển về `/cart`.

**Bố cục:** Cột trái = Tóm tắt đơn | Cột phải = Form đặt hàng

#### Thông tin bắt buộc điền

| Trường | Ghi chú |
|--------|---------|
| **Họ và tên** | Tên người nhận |
| **Email** | Dùng để tra cứu đơn sau này |
| **Địa chỉ giao hàng** | Địa chỉ đầy đủ |
| **Phương thức thanh toán** | COD hoặc Thẻ tín dụng |

#### Nếu chọn Thẻ tín dụng (CARD)

| Trường | Định dạng |
|--------|-----------|
| **Tên chủ thẻ** | Chữ in hoa |
| **Số thẻ** | 16 chữ số |
| **Ngày hết hạn** | MM/YY (ví dụ: `08/27`) |
| **CVV** | 3 chữ số |

**Quy trình đặt hàng:**
1. Điền đầy đủ thông tin
2. Chọn COD hoặc Thẻ
3. Nếu chọn thẻ → điền thông tin thẻ
4. Nhấn **"Đặt hàng"**
5. Thành công → chuyển đến `/orders/{reference}`

**Lỗi thường gặp:** bỏ trống trường bắt buộc · số thẻ sai định dạng · sản phẩm hết hàng

![homepage](/docs/images/checkout.png)

---

### 2.6 Tra cứu đơn hàng `/orders`

Dành cho khách chưa đăng nhập.

**Quy trình:**
1. Nhập **Mã đơn hàng** (ví dụ: `ORD-20260424-XXXX`)
2. Nhập **Email** đã dùng khi đặt
3. Nhấn **"Tra cứu"**
4. Hiển thị kết quả ngay trên trang

![homepage](/docs/images/orders.png)

---

### 2.7 Chi tiết đơn hàng `/orders/{reference}`

Hiển thị sau khi đặt hàng thành công, hoặc khi tra cứu.

**Nội dung:** Mã đơn · Trạng thái · Thông tin người đặt · Danh sách sản phẩm · Phương thức thanh toán · Tổng tiền

> *[Screenshot: Trang xác nhận đơn hàng]*
![homepage](/docs/images/order-detail.png)

---

### 2.8 Đăng ký `/register`

| Trường | Ghi chú |
|--------|---------|
| **Họ và tên** | Bắt buộc |
| **Email** | Phải chưa đăng ký |
| **Mật khẩu** | Bắt buộc |

**Quy trình:**
1. Điền thông tin → nhấn **"Đăng ký"**
2. Thành công → màn hình yêu cầu xác nhận email
3. Kiểm tra hòm thư → nhấn link xác nhận
4. Đăng nhập tại `/login`

![homepage](/docs/images/login.png)
![homepage](/docs/images/register.png)

---

### 2.9 Đăng nhập `/login`

| Trường | |
|--------|--|
| **Email** | Email đã đăng ký |
| **Mật khẩu** | Mật khẩu |

Nhấn **"Đăng nhập"** → về trang chủ.

![homepage](/docs/images/login.png)

---

### 2.10 Lịch sử đơn hàng `/profile/orders`

*Yêu cầu đăng nhập.*

Toàn bộ đơn hàng của tài khoản: mã đơn · ngày · tổng tiền · trạng thái · link xem chi tiết.

![homepage](/docs/images/orders2.png)

---

## 3. Admin – Giao diện quản trị

> Tất cả trang admin nằm dưới `/admin/...`. Middleware tự chặn nếu chưa đăng nhập → redirect về `/admin/login`.

### Thanh điều hướng Admin

| Link | Đường dẫn |
|------|-----------|
| Mini Store (logo) | `/` (shop) |
| Sản phẩm | `/admin/products` |
| Danh mục | `/admin/categories` |
| Đơn hàng | `/admin/orders` |
| Người dùng | `/admin/users` |
| **Đăng xuất** | Nút góc phải |

---

### 3.1 Đăng nhập Admin `/admin/login`

Trang đăng nhập riêng cho Admin (độc lập với tài khoản shop).

| Trường | |
|--------|--|
| **Tên đăng nhập** | Username (được tạo trong bảng `admins` qua migration 004) |
| **Mật khẩu** | Mật khẩu |

Nhấn **"Đăng nhập"** → vào `/admin/products`.

Credentials được xác thực từ bảng `admins` trên DB. Session lưu bằng HMAC-signed cookie, hiệu lực 8 giờ.

![homepage](/docs/images/a-login.png)

---

### 3.2 Quản lý Sản phẩm `/admin/products`

Danh sách toàn bộ sản phẩm (kể cả đang ẩn).

| Cột | Mô tả |
|-----|-------|
| Tên | Tên sản phẩm |
| Danh mục | Danh mục thuộc về |
| Giá | Giá bán (VND) |
| Tồn kho | Số lượng còn |
| Trạng thái | **● Đang bán** (xanh) / **○ Ẩn** (xám) |
| Thao tác | Link "Sửa" |

**Thao tác nhanh:** Nhấn badge trạng thái → đổi ngay publish/unpublish không cần vào form sửa.

![homepage](/docs/images/a-orders.png)

---

### 3.3 Sửa Sản phẩm `/admin/products/{id}`

| Trường | Ghi chú |
|--------|---------|
| **Ảnh sản phẩm** | Upload file (JPEG/PNG/WebP, tối đa 5MB) |
| **Tên sản phẩm** | Bắt buộc |
| **Giá (VND)** | Số, bước nhảy 1.000đ |
| **Tồn kho** | Số nguyên ≥ 0 |
| **Danh mục** | Dropdown chọn danh mục |
| **Trạng thái** | "Đang bán" hoặc "Ẩn" |

**Quy trình:**
1. Sửa các trường → nhấn **"Lưu thay đổi"** → banner xanh xác nhận
2. Upload ảnh: nhấn nút upload → chọn file → tải lên ngay lập tức (độc lập với form lưu)

![homepage](/docs/images/a-product.png)

---

### 3.4 Quản lý Danh mục `/admin/categories`

| Cột | Mô tả |
|-----|-------|
| Tên | Tên danh mục |
| Slug | Đường dẫn URL (ví dụ: `ao`) |
| Số sản phẩm | Tổng sản phẩm trong danh mục |
| Thao tác | Sửa / Xoá |

- Nhấn **"+ Tạo danh mục mới"** → `/admin/categories/new`
- Không xoá được danh mục đang có sản phẩm

![homepage](/docs/images/acategories.png)

---

### 3.5 Tạo Danh mục `/admin/categories/new`

| Trường | Ghi chú |
|--------|---------|
| **Tên danh mục** | Bắt buộc |
| **Slug** | Chữ thường, dấu gạch ngang (ví dụ: `phu-kien`) |

Nhấn **"Tạo danh mục"** → về danh sách danh mục.

![homepage](/docs/images/acategoriesnew.png)

---

### 3.6 Quản lý Đơn hàng `/admin/orders`

| Cột | Mô tả |
|-----|-------|
| Mã đơn | Reference number |
| Khách hàng | Tên + email |
| Tổng tiền | VND |
| Phương thức TT | COD / Thẻ |
| Trạng thái | Badge màu |
| Ngày đặt | Ngày/giờ |

Nhấn **"Xem"** → `/admin/orders/{id}`

![homepage](/docs/images/aorders.png)

---

### 3.7 Chi tiết Đơn hàng Admin `/admin/orders/{id}`

Xem đầy đủ thông tin + quản lý trạng thái.

**Quản lý trạng thái:**

| Trạng thái hiện tại | Hành động có thể |
|---------------------|-----------------|
| Chờ xác nhận | Nhấn **"Xác nhận đơn"** → confirmed |
| Chờ xác nhận | Nhấn **"Huỷ đơn"** → cancelled |
| Đã xác nhận | Không thể thay đổi |
| Đã huỷ | Không thể thay đổi |

![homepage](/docs/images/aorder.png)

---

### 3.8 Quản lý Người dùng `/admin/users`

Danh sách tài khoản đã đăng ký. Nhấn vào một người dùng → `/admin/users/{id}` để xem chi tiết và khoá/mở khoá tài khoản.
![homepage](/docs/images/au.png)
![homepage](/docs/images/au2.png)

---