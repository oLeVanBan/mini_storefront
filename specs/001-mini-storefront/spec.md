# Đặc Tả Tính Năng: Mini Storefront – Cửa Hàng Trực Tuyến Tối Giản

**Nhánh tính năng**: `001-mini-storefront`  
**Ngày tạo**: 2026-04-23  
**Trạng thái**: Bản nháp  
**Đầu vào**: Mô tả của người dùng: "Mini Storefront – Bán hàng tối giản. Xây dựng cửa hàng online đơn giản: danh mục, giỏ hàng, thanh toán giả lập. Hiển thị Product, Category, người dùng thêm vào Cart và Checkout (giả lập thanh toán). Admin quản lý tồn kho, giá, publish/unpublish."

---

## Kịch Bản Người Dùng & Kiểm Thử *(bắt buộc)*

### User Story 1 – Duyệt & Khám Phá Sản Phẩm (Ưu tiên: P1)

Khách hàng truy cập cửa hàng và có thể xem tất cả sản phẩm đang được đăng bán, được tổ chức theo danh mục. Họ có thể điều hướng vào một danh mục để xem các sản phẩm trong đó, và nhấp vào từng sản phẩm để xem chi tiết (tên, mô tả, giá, tồn kho hiện có).

**Lý do ưu tiên**: Danh mục sản phẩm là nền tảng của toàn bộ cửa hàng. Nếu không có sản phẩm có thể duyệt, mọi tính năng khác đều không có giá trị.

**Kiểm thử độc lập**: Có thể kiểm thử hoàn toàn bằng cách truy cập trang chủ cửa hàng, điều hướng qua các danh mục và xem trang chi tiết sản phẩm — cung cấp danh mục chỉ đọc mà không cần thực hiện mua hàng.

**Kịch bản chấp nhận**:

1. **Cho trước** trang chủ cửa hàng đang mở, **Khi** khách hàng xem, **Thì** tất cả sản phẩm đang đăng bán được hiển thị theo nhóm danh mục
2. **Cho trước** trang danh mục được mở, **Khi** khách hàng xem, **Thì** chỉ hiển thị các sản phẩm đang đăng bán thuộc danh mục đó
3. **Cho trước** trang chi tiết sản phẩm được mở, **Khi** khách hàng xem, **Thì** tên, mô tả, giá và số lượng tồn kho của sản phẩm được hiển thị
4. **Cho trước** một sản phẩm bị ẩn bởi admin, **Khi** bất kỳ khách hàng nào truy cập cửa hàng, **Thì** sản phẩm đó không xuất hiện ở bất kỳ đâu trong danh mục

---

### User Story 2 – Thêm Sản Phẩm Vào Giỏ Hàng & Quản Lý Giỏ Hàng (Ưu tiên: P2)

Khách hàng có thể thêm một hoặc nhiều sản phẩm vào giỏ hàng. Họ có thể xem giỏ hàng để thấy tất cả các mục đã chọn cùng số lượng và thành tiền, cập nhật số lượng hoặc xóa các mục. Giỏ hàng được duy trì khi khách hàng điều hướng giữa các trang.

**Lý do ưu tiên**: Quản lý giỏ hàng là cầu nối thiết yếu giữa việc duyệt sản phẩm và thanh toán. Phải có trước khi thanh toán có ý nghĩa.

**Kiểm thử độc lập**: Có thể kiểm thử hoàn toàn bằng cách thêm sản phẩm vào giỏ, điều hướng sang trang khác, quay lại giỏ, thay đổi số lượng và xóa mục — mà không cần hoàn tất bất kỳ thanh toán nào.

**Kịch bản chấp nhận**:

1. **Cho trước** khách hàng đang ở trang sản phẩm, **Khi** họ nhấp "Thêm vào giỏ", **Thì** mục được thêm vào giỏ hàng và số lượng mục trong giỏ được cập nhật hiển thị rõ ràng
2. **Cho trước** khách hàng có hàng trong giỏ, **Khi** họ điều hướng đến trang giỏ hàng, **Thì** họ thấy từng mục với tên, số lượng, đơn giá và thành tiền
3. **Cho trước** trang giỏ hàng đang mở, **Khi** khách hàng thay đổi số lượng của một mục, **Thì** thành tiền của dòng đó và tổng giỏ hàng cập nhật ngay lập tức
4. **Cho trước** trang giỏ hàng đang mở, **Khi** khách hàng xóa một mục, **Thì** mục đó biến mất khỏi giỏ và tổng tiền được tính lại
5. **Cho trước** khách hàng có hàng trong giỏ, **Khi** họ điều hướng sang trang khác và quay lại giỏ hàng, **Thì** nội dung giỏ hàng không thay đổi
6. **Cho trước** khách hàng cố thêm số lượng sản phẩm vượt quá tồn kho, **Khi** họ thực hiện hành động, **Thì** hệ thống ngăn không cho vượt quá tồn kho và hiển thị thông báo rõ ràng

---

### User Story 3 – Thanh Toán Giả Lập Với Lựa Chọn Phương Thức (Ưu tiên: P3)

Khách hàng xem lại giỏ hàng và tiến hành thanh toán. Họ cung cấp thông tin giao hàng cơ bản, chọn một trong hai phương thức thanh toán được hỗ trợ, điền thông tin tương ứng rồi xác nhận đơn hàng. Hệ thống ghi nhận đơn hàng mà không xử lý bất kỳ giao dịch tài chính thực nào. Khách hàng nhận được xác nhận cùng tóm tắt đơn hàng bao gồm phương thức thanh toán đã chọn.

Hai phương thức thanh toán được hỗ trợ:
- **Thanh toán khi nhận hàng (COD)**: Khách trả tiền mặt khi giao hàng, không cần nhập thêm thông tin.
- **Thẻ tín dụng/ghi nợ quốc tế (Visa/Mastercard)**: Khách nhập thông tin thẻ trên giao diện giả lập; không có xác minh thực tế với ngân hàng hay cổng thanh toán.

**Lý do ưu tiên**: Thanh toán hoàn thiện luồng mua sắm đầu cuối. Đây là cốt lõi của sản phẩm, nhưng yêu cầu P1 và P2 phải được triển khai trước.

**Kiểm thử độc lập**: Có thể kiểm thử hoàn toàn đầu cuối bằng cách thêm mục vào giỏ, tiến hành thanh toán, chọn từng phương thức thanh toán, điền thông tin tương ứng và xác minh màn hình xác nhận với tóm tắt đơn hàng hiển thị đúng phương thức.

**Kịch bản chấp nhận**:

1. **Cho trước** khách hàng có hàng trong giỏ, **Khi** họ tiến hành thanh toán, **Thì** tóm tắt đơn hàng (mục, số lượng, giá, tổng cộng) được hiển thị trước khi xác nhận
2. **Cho trước** trang thanh toán đang hiển thị, **Khi** khách hàng xem phần chọn phương thức thanh toán, **Thì** hai lựa chọn "Thanh toán khi nhận hàng (COD)" và "Thẻ Visa/Mastercard" được hiển thị rõ ràng
3. **Cho trước** khách hàng chọn COD, **Khi** họ điền tên, email, địa chỉ giao hàng và xác nhận, **Thì** đơn hàng được ghi nhận với phương thức thanh toán là COD và khách hàng thấy màn hình xác nhận thành công kèm mã tham chiếu
4. **Cho trước** khách hàng chọn Visa/Mastercard, **Khi** họ xem biểu mẫu thẻ, **Thì** các trường bắt buộc gồm: tên chủ thẻ, số thẻ (16 chữ số), ngày hết hạn (MM/YY), mã CVV (3 chữ số) được hiển thị
5. **Cho trước** khách hàng đã điền đầy đủ thông tin thẻ hợp lệ về định dạng, **Khi** họ xác nhận đơn hàng, **Thì** đơn hàng được ghi nhận với phương thức thanh toán là thẻ quốc tế, chỉ lưu 4 số cuối của thẻ, và khách hàng thấy xác nhận thành công
6. **Cho trước** khách hàng nhập số thẻ không đúng định dạng (không đủ 16 chữ số, có ký tự lạ, v.v.), **Khi** họ cố xác nhận, **Thì** hệ thống hiển thị thông báo lỗi rõ ràng ngay trên trường nhập liệu tương ứng và không gửi đơn hàng
7. **Cho trước** thanh toán thành công (bất kỳ phương thức), **Khi** xác nhận được hiển thị, **Thì** giỏ hàng được xóa
8. **Cho trước** khách hàng cố thanh toán với giỏ hàng trống, **Khi** họ truy cập trang thanh toán, **Thì** họ được chuyển hướng về giỏ hàng kèm thông báo rõ ràng
9. **Cho trước** tồn kho sản phẩm về 0, **Khi** khách hàng có mục đó trong giỏ và cố thanh toán, **Thì** hệ thống thông báo cho khách hàng và ngăn hoàn tất đến khi số lượng được điều chỉnh

---

### User Story 4 – Quản Trị: Quản Lý Sản Phẩm & Danh Mục (Ưu tiên: P4)

Người dùng admin có thể truy cập khu vực quản lý để: (1) xem tất cả sản phẩm, cập nhật giá, tồn kho và trạng thái đăng bán; (2) quản lý danh mục — tạo mới, đổi tên, xóa danh mục không còn sản phẩm.

**Lý do ưu tiên**: Admin phải kiểm soát được cả sản phẩm lẫn cấu trúc danh mục để vận hành cửa hàng. Danh mục là dữ liệu nền tảng — thiếu khả năng quản lý danh mục sẽ làm admin phụ thuộc hoàn toàn vào seed data.

**Kiểm thử độc lập**: Có thể kiểm thử hoàn toàn bằng cách: truy cập admin, thay đổi giá/tồn kho/publish sản phẩm và xác minh phản ánh ngay trên storefront; tạo danh mục mới rồi gán sản phẩm vào; xóa danh mục trống.

**Kịch bản chấp nhận — Sản phẩm**:

1. **Cho trước** bảng quản trị đang mở, **Khi** admin xem danh sách sản phẩm, **Thì** tất cả sản phẩm (đã đăng và chưa đăng) được hiển thị với giá, tồn kho và trạng thái hiện tại
2. **Cho trước** admin chỉnh sửa giá sản phẩm, **Khi** họ lưu thay đổi, **Thì** giá mới được hiển thị ngay lập tức cho khách hàng trên cửa hàng
3. **Cho trước** admin chỉnh sửa số lượng tồn kho, **Khi** họ lưu thay đổi, **Thì** tồn kho mới được phản ánh ngay trong luồng thêm vào giỏ và thanh toán
4. **Cho trước** admin ẩn một sản phẩm, **Khi** họ lưu, **Thì** sản phẩm đó biến mất ngay khỏi danh mục khách hàng
5. **Cho trước** admin đăng bán một sản phẩm đang bị ẩn, **Khi** họ lưu, **Thì** sản phẩm xuất hiện ngay trong danh mục khách hàng
6. **Cho trước** admin chỉnh sửa danh mục của sản phẩm, **Khi** họ chọn danh mục mới từ dropdown và lưu, **Thì** sản phẩm chuyển sang danh mục mới và hiển thị đúng trên storefront
7. **Cho trước** admin mở trang chỉnh sửa sản phẩm, **Khi** họ chọn file ảnh hợp lệ (JPEG/PNG/WebP, ≤ 5MB) và bấm Upload, **Thì** ảnh được lưu lên Supabase Storage và URL được gán vào sản phẩm, ảnh hiển thị ngay trên storefront
8. **Cho trước** admin upload ảnh không hợp lệ (sai định dạng hoặc quá 5MB), **Khi** họ chọn file, **Thì** thông báo lỗi hiển thị ngay và file không được upload

**Kịch bản chấp nhận — Danh mục**:

6. **Cho trước** trang quản lý danh mục đang mở, **Khi** admin xem, **Thì** tất cả danh mục được liệt kê kèm số lượng sản phẩm trong mỗi danh mục
7. **Cho trước** admin điền tên danh mục mới và lưu, **Khi** thao tác thành công, **Thì** danh mục xuất hiện ngay trong danh sách admin và có thể chọn khi tạo sản phẩm mới
8. **Cho trước** admin đổi tên một danh mục và lưu, **Khi** thao tác thành công, **Thì** tên mới hiển thị ngay trên storefront (trang danh mục, trang chủ)
9. **Cho trước** admin cố xóa một danh mục đang có sản phẩm, **Khi** họ xác nhận xóa, **Thì** hệ thống từ chối và hiển thị thông báo yêu cầu chuyển hoặc xóa sản phẩm trước
10. **Cho trước** admin xóa một danh mục không có sản phẩm nào, **Khi** họ xác nhận xóa, **Thì** danh mục bị xóa và biến mất khỏi storefront

---

### User Story 5 – Đăng Ký / Đăng Nhập / Đăng Xuất Khách Hàng (Ưu tiên: P5)

Khách hàng có thể tạo tài khoản bằng email và mật khẩu để xem lại lịch sử đơn hàng. Đăng nhập là tuỳ chọn — guest checkout vẫn hoạt động đầy đủ.

**Lý do ưu tiên**: Tài khoản mang lại giá trị dài hạn (lịch sử đơn hàng) nhưng không ảnh hưởng đến luồng mua hàng cốt lõi đã hoàn thiện ở P1–P4.

**Kiểm thử độc lập**: Đăng ký tài khoản mới → đăng nhập → xem lịch sử đơn hàng → đăng xuất → xác nhận không còn truy cập được trang profile.

**Kịch bản chấp nhận**:

1. **Cho trước** người dùng chưa có tài khoản, **Khi** điền email hợp lệ + mật khẩu ≥ 8 ký tự vào form đăng ký và submit, **Thì** tài khoản được tạo và người dùng tự động đăng nhập, redirect về trang chủ.
2. **Cho trước** người dùng đã có tài khoản, **Khi** điền đúng email + mật khẩu và submit, **Thì** được đăng nhập thành công; tên/email hiển thị trên Navbar.
3. **Cho trước** người dùng nhập sai mật khẩu, **Khi** submit form đăng nhập, **Thì** hiển thị thông báo lỗi chung "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không).
4. **Cho trước** người dùng đã đăng nhập, **Khi** nhấn "Đăng xuất", **Thì** session bị hủy ngay lập tức và redirect về trang chủ.
5. **Cho trước** người dùng đã đăng nhập và đặt ≥ 1 đơn hàng, **Khi** truy cập trang "Đơn hàng của tôi", **Thì** thấy danh sách đơn hàng theo thứ tự mới nhất trước kèm reference number, ngày đặt, tổng tiền và trạng thái.
6. **Cho trước** người dùng chưa đăng nhập, **Khi** truy cập `/profile`, **Thì** được redirect về trang đăng nhập.
7. **Cho trước** người dùng đăng nhập và đặt hàng thành công, **Thì** đơn hàng được liên kết với tài khoản và xuất hiện trong lịch sử.

---

### User Story 6 – Đăng Nhập Admin Qua Form (Ưu tiên: P6)

Admin đăng nhập bằng username + password qua form. Thông tin admin được lưu trong bảng `admins` trong database thay vì environment variables.

**Lý do ưu tiên**: `?secret=` trong URL lộ thông tin trong browser history và server log. Form login là yêu cầu bảo mật tối thiểu cho khu vực admin. Lưu trong DB dễ quản lý nhiều admin hơn so với env vars.

**Kiểm thử độc lập**: Truy cập `/admin/products` khi chưa đăng nhập → redirect `/admin/login` → điền đúng thông tin → vào được trang admin.

**Kịch bản chấp nhận**:

1. **Cho trước** admin chưa đăng nhập, **Khi** truy cập bất kỳ trang `/admin/*`, **Thì** bị redirect về `/admin/login`.
2. **Cho trước** admin ở `/admin/login`, **Khi** nhập đúng username + password, **Thì** được đăng nhập và redirect về `/admin/products`.
3. **Cho trước** admin nhập sai password, **Khi** submit form, **Thì** hiển thị "Thông tin đăng nhập không đúng" — không tiết lộ thêm.
4. **Cho trước** admin đã đăng nhập, **Khi** nhấn "Đăng xuất", **Thì** session admin bị hủy và redirect về `/admin/login`.
5. **Cho trước** user thường đã đăng nhập với tài khoản khách hàng, **Khi** cố truy cập `/admin/*`, **Thì** vẫn bị redirect về `/admin/login` (phân tách hoàn toàn).
6. **Cho trước** bảng `admins` trong DB, **Khi** lookup admin theo username, **Thì** password_hash được so sánh qua bcrypt — không dùng env ADMIN_PASSWORD_HASH.

---

### User Story 7 – Quản Lý Người Dùng (Admin) (Ưu tiên: P7)

Admin xem danh sách tài khoản khách hàng đã đăng ký, có thể xem thông tin cơ bản, khoá/mở khoá tài khoản và xem lịch sử đơn hàng của từng user.

**Lý do ưu tiên**: Cần thiết để vận hành thực tế — admin phải xử lý được tình huống tài khoản cần can thiệp (spam, gian lận, hỗ trợ khách hàng).

**Kiểm thử độc lập**: Truy cập `/admin/users` → thấy danh sách users → nhấn vào user → xem thông tin + đơn hàng → khoá tài khoản → user bị từ chối đăng nhập.

**Kịch bản chấp nhận**:

1. **Cho trước** trang `/admin/users` đang mở, **Khi** admin xem, **Thì** danh sách tất cả tài khoản khách hàng được hiển thị kèm email, tên đầy đủ, ngày đăng ký, số đơn hàng và trạng thái (hoạt động/bị khoá).
2. **Cho trước** admin nhấp vào một user, **Khi** xem trang chi tiết, **Thì** thấy thông tin profile và danh sách đơn hàng đã đặt của user đó.
3. **Cho trước** admin khoá một tài khoản, **Khi** user đó cố đăng nhập, **Thì** nhận thông báo "Tài khoản của bạn đã bị khoá" và không thể đăng nhập.
4. **Cho trước** admin mở khoá tài khoản đã bị khoá, **Khi** user đó đăng nhập lại, **Thì** đăng nhập thành công bình thường.
5. **Cho trước** admin tìm kiếm theo email hoặc tên, **Khi** nhập từ khoá, **Thì** danh sách được lọc theo thời gian thực.

---

### Các Trường Hợp Ngoại Lệ

- Điều gì xảy ra khi tồn kho sản phẩm giảm về 0 trong khi nó đã có trong giỏ hàng của khách?
- Điều gì xảy ra nếu cùng một sản phẩm được thêm vào giỏ nhiều lần — số lượng có cộng dồn hay tạo ra các mục trùng lặp?
- Điều gì xảy ra khi khách hàng gửi biểu mẫu thanh toán với các trường bắt buộc bị thiếu?
- Hệ thống xử lý như thế nào với danh mục không có sản phẩm nào đang đăng bán — ẩn đi hay hiển thị trống?
- Điều gì xảy ra nếu admin cố đặt giá hoặc tồn kho âm?
- Điều gì xảy ra nếu admin tạo hai danh mục trùng tên hoặc trùng slug?
- Điều gì xảy ra nếu admin xóa danh mục trong khi có sản phẩm đang được khách hàng xem?
- Người dùng đăng ký email đã tồn tại → hệ thống thông báo "Email đã được sử dụng" mà không tiết lộ thêm thông tin.
- Mật khẩu không đủ độ dài (< 8 ký tự) → chặn ở cả client và server.
- Người dùng bị khoá tài khoản khi đang có session active → session bị hủy ngay lần request tiếp theo.
- Admin cố xoá chính tài khoản mình (nếu có nhiều admin sau này) → bị chặn.
- Người dùng nhấn Back sau khi đăng xuất → không thể truy cập lại trang cần auth (cache busting).
- Khi đang có hàng trong giỏ (chưa đăng nhập) → đăng nhập → giỏ hàng cookie vẫn còn nguyên.

---

## Yêu Cầu *(bắt buộc)*

### Yêu Cầu Chức Năng

**Dành Cho Khách Hàng**

- **FR-001**: Hệ thống PHẢI hiển thị tất cả sản phẩm đang đăng bán trên trang chủ cửa hàng, được tổ chức theo danh mục
- **FR-002**: Hệ thống PHẢI cung cấp các trang danh mục có thể duyệt, chỉ hiển thị sản phẩm đang đăng bán thuộc danh mục đó
- **FR-003**: Hệ thống PHẢI hiển thị trang chi tiết sản phẩm với tên, mô tả, giá và tồn kho cho mỗi sản phẩm đang đăng bán
- **FR-004**: Người dùng PHẢI có thể thêm sản phẩm vào giỏ hàng từ trang danh sách hoặc trang chi tiết sản phẩm
- **FR-005**: Hệ thống PHẢI ngăn người dùng thêm số lượng sản phẩm vượt quá tồn kho hiện có vào giỏ
- **FR-006**: Người dùng PHẢI có thể xem trang giỏ hàng liệt kê tất cả mục đã thêm với tên, số lượng, đơn giá và thành tiền
- **FR-007**: Người dùng PHẢI có thể cập nhật số lượng mục và xóa mục khỏi giỏ hàng
- **FR-008**: Giỏ hàng PHẢI được duy trì qua các lần điều hướng trang trong cùng một phiên duyệt web
- **FR-009**: Người dùng PHẢI có thể chuyển từ giỏ hàng đến trang thanh toán với đầy đủ tóm tắt đơn hàng
- **FR-010**: Người dùng PHẢI có thể gửi biểu mẫu thanh toán với tên, địa chỉ email và địa chỉ giao hàng
- **FR-010a**: Trang thanh toán PHẢI hiển thị lựa chọn phương thức thanh toán với hai tùy chọn: "Thanh toán khi nhận hàng (COD)" và "Thẻ Visa/Mastercard"
- **FR-010b**: Khi người dùng chọn phương thức COD, hệ thống KHÔNG ĐƯỢC yêu cầu nhập thêm thông tin thanh toán
- **FR-010c**: Khi người dùng chọn Visa/Mastercard, hệ thống PHẢI hiển thị biểu mẫu nhập thông tin thẻ gồm: tên chủ thẻ, số thẻ (16 chữ số), ngày hết hạn (MM/YY), và mã CVV (3 chữ số)
- **FR-010d**: Hệ thống PHẢI xác thực định dạng thông tin thẻ ở phía giao diện (đúng số chữ số, không có ký tự không hợp lệ, ngày hết hạn chưa quá) trước khi cho phép xác nhận đơn hàng
- **FR-010e**: Hệ thống KHÔNG ĐƯỢC thực hiện bất kỳ xác minh thực tế nào với ngân hàng hay cổng thanh toán — toàn bộ là giả lập
- **FR-011**: Hệ thống PHẢI ghi nhận mỗi lần thanh toán thành công thành một đơn hàng với đầy đủ chi tiết mục, số lượng, giá, phương thức thanh toán đã chọn và mã tham chiếu đơn hàng duy nhất
- **FR-011a**: Khi phương thức thanh toán là Visa/Mastercard, hệ thống PHẢI lưu trong cơ sở dữ liệu: tên chủ thẻ, 4 số cuối của thẻ, tháng và năm hết hạn — hệ thống KHÔNG ĐƯỢC lưu số thẻ đầy đủ hay mã CVV
- **FR-012**: Hệ thống PHẢI hiển thị trang xác nhận với mã tham chiếu đơn hàng, tóm tắt đơn hàng và phương thức thanh toán đã sử dụng sau khi thanh toán thành công
- **FR-013**: Hệ thống PHẢI xóa giỏ hàng sau khi thanh toán thành công
- **FR-014**: Hệ thống KHÔNG ĐƯỢC xử lý bất kỳ giao dịch tài chính thực nào — toàn bộ quy trình thanh toán là giả lập

**Quản Trị**

- **FR-015**: Admin PHẢI có thể truy cập khu vực quản lý sản phẩm
- **FR-016**: Admin PHẢI có thể xem tất cả sản phẩm (cả đã đăng và chưa đăng) với giá, tồn kho và trạng thái hiện tại
- **FR-017**: Admin PHẢI có thể cập nhật giá của bất kỳ sản phẩm nào
- **FR-018**: Admin PHẢI có thể cập nhật số lượng tồn kho của bất kỳ sản phẩm nào
- **FR-019**: Admin PHẢI có thể đăng bán hoặc ẩn bất kỳ sản phẩm nào
- **FR-020**: Các thay đổi của admin về giá, tồn kho hoặc trạng thái đăng bán PHẢI được phản ánh ngay lập tức trên cửa hàng khách hàng
- **FR-021**: Admin PHẢI có thể xem danh sách tất cả danh mục kèm số lượng sản phẩm trong mỗi danh mục
- **FR-022**: Admin PHẢI có thể tạo danh mục mới với tên; hệ thống PHẢI tự động sinh `slug` từ tên (có thể chỉnh sửa thủ công)
- **FR-023**: Admin PHẢI có thể đổi tên danh mục; thay đổi PHẢI được phản ánh ngay trên storefront
- **FR-024**: Admin PHẢI có thể xóa danh mục; hệ thống PHẢI ngăn xóa nếu danh mục còn sản phẩm và hiển thị số lượng sản phẩm bị ảnh hưởng
- **FR-025**: Tên danh mục PHẢI là duy nhất; hệ thống PHẢI báo lỗi nếu admin tạo hoặc đổi tên trùng với danh mục đã tồn tại
- **FR-026**: Slug danh mục PHẢI là duy nhất và chỉ chứa chữ thường, chữ số và dấu gạch ngang

**Xác Thực Khách Hàng (US5)**

- **FR-027**: Hệ thống PHẢI cho phép đăng ký tài khoản bằng email + mật khẩu; email phải hợp lệ định dạng, mật khẩu tối thiểu 8 ký tự.
- **FR-028**: Hệ thống PHẢI hash mật khẩu trước khi lưu; không bao giờ lưu plaintext.
- **FR-029**: Hệ thống PHẢI duy trì session đăng nhập qua httpOnly cookie.
- **FR-030**: Navbar PHẢI hiển thị tên/email người dùng và link đăng xuất khi đã đăng nhập.
- **FR-031**: Hệ thống PHẢI cho phép đăng xuất và hủy session ngay lập tức.
- **FR-032**: Trang `/profile` và `/profile/orders` PHẢI yêu cầu đăng nhập; redirect về `/login` nếu chưa.
- **FR-033**: Khi đặt hàng trong trạng thái đã đăng nhập, đơn hàng PHẢI được liên kết với tài khoản.
- **FR-034**: Trang "Đơn hàng của tôi" PHẢI chỉ hiển thị đơn hàng của người dùng đang đăng nhập.
- **FR-035**: Hệ thống PHẢI không tiết lộ sự tồn tại của email qua thông báo lỗi (chống user enumeration).
- **FR-036**: Guest checkout PHẢI vẫn hoạt động đầy đủ — đăng ký là tuỳ chọn.

**Đăng Nhập Admin Form (US6)**

- **FR-037**: Admin PHẢI đăng nhập qua form `/admin/login` với username + password; cơ chế `?secret=` trong URL bị vô hiệu hóa.
- **FR-038**: Thông tin đăng nhập admin PHẢI lưu an toàn (biến môi trường hoặc bảng riêng với password hash); không hardcode trong code.
- **FR-039**: Tất cả route `/admin/*` PHẢI yêu cầu admin session hợp lệ; redirect về `/admin/login` nếu thiếu.
- **FR-040**: Người dùng thường (khách hàng đã đăng nhập) KHÔNG ĐƯỢC truy cập khu vực admin.

**Quản Lý Users (US7)**

- **FR-041**: Admin PHẢI có thể xem danh sách tất cả tài khoản khách hàng kèm email, tên, ngày đăng ký, số đơn hàng và trạng thái.
- **FR-042**: Admin PHẢI có thể xem trang chi tiết của từng user kèm thông tin profile và lịch sử đơn hàng.
- **FR-043**: Admin PHẢI có thể khoá hoặc mở khoá tài khoản khách hàng; tài khoản bị khoá không thể đăng nhập.
- **FR-044**: Admin PHẢI có thể tìm kiếm user theo email hoặc tên.

### Các Thực Thể Chính

- **Category (Danh mục)**: Nhóm phân loại sản phẩm. Có tên và định danh duy nhất. Một danh mục có thể chứa nhiều sản phẩm.
- **Product (Sản phẩm)**: Mặt hàng có thể bán. Có tên, mô tả, giá, số lượng tồn kho, trạng thái đăng bán và thuộc về một danh mục.
- **Cart (Giỏ hàng)**: Tập hợp tạm thời các mục được chọn bởi khách hàng trong một phiên. Gắn với phiên duyệt web (không cần tài khoản).
- **CartItem (Mục trong giỏ)**: Một dòng trong giỏ hàng. Liên kết sản phẩm với giỏ hàng kèm số lượng và giá tại thời điểm thêm.
- **Order (Đơn hàng)**: Bản ghi mua hàng đã hoàn tất (giả lập). Chứa mã tham chiếu duy nhất, thông tin liên hệ khách hàng (tên, email), địa chỉ giao hàng, tổng tiền, phương thức thanh toán (`COD` hoặc `CARD`) và danh sách mục đã đặt.
- **OrderItem (Mục trong đơn hàng)**: Một dòng trong đơn hàng. Ghi nhận sản phẩm, số lượng và giá tại thời điểm thanh toán.
- **PaymentDetail (Chi tiết thanh toán thẻ)**: Thông tin thẻ được lưu khi phương thức là Visa/Mastercard. Chỉ lưu: tên chủ thẻ, 4 số cuối của thẻ (`card_last4`), tháng hết hạn (`exp_month`), năm hết hạn (`exp_year`). Số thẻ đầy đủ và CVV KHÔNG được lưu ở bất kỳ đâu.
- **User (Tài khoản khách hàng)**: Người mua hàng đã đăng ký. Có email (duy nhất), mật khẩu đã hash, tên đầy đủ, ngày tạo, trạng thái (hoạt động / bị khoá). Liên kết với nhiều đơn hàng.
- **AdminCredential (Thông tin đăng nhập admin)**: Credential riêng của admin — username duy nhất và mật khẩu đã hash. Tách biệt hoàn toàn khỏi bảng User thông thường.

---

## Tiêu Chí Thành Công *(bắt buộc)*

### Kết Quả Đo Lường Được

- **SC-001**: Khách hàng có thể hoàn thành toàn bộ luồng mua sắm — từ khi vào trang chủ đến khi nhận xác nhận đơn hàng — trong vòng 3 phút
- **SC-002**: Tất cả sản phẩm đã đăng bán xuất hiện trong danh mục trong vòng 2 giây sau khi admin đăng bán
- **SC-003**: Giỏ hàng lưu giữ đúng tất cả các mục qua ít nhất 10 lần điều hướng trang trong một phiên
- **SC-004**: 100% các lần thanh toán thành công đều tạo ra một đơn hàng được ghi nhận với mã tham chiếu duy nhất và đầy đủ chi tiết mục
- **SC-005**: Các cập nhật giá và tồn kho của admin hiển thị cho khách hàng trong vòng 2 giây sau khi lưu
- **SC-006**: Khách hàng không thể đặt đơn hàng với số lượng vượt quá tồn kho trong bất kỳ tình huống nào
- **SC-007**: Người dùng hoàn thành đăng ký tài khoản mới trong dưới 2 phút.
- **SC-008**: 100% route `/admin/*` bị chặn khi chưa đăng nhập admin — 0 bypass path (kiểm tra bằng automated test).
- **SC-009**: Người dùng thường không thể truy cập bất kỳ trang/action admin nào — phân tách hoàn toàn.
- **SC-010**: Thông báo lỗi đăng nhập không tiết lộ liệu email có tồn tại hay không (1 thông báo duy nhất cho mọi loại lỗi credential).

### Tiêu Chí Bắt Buộc Từ Quy Ước Dự Án *(không thể thương lượng)*

- **SC-PERF-01**: Core Web Vitals đạt ngưỡng "Tốt" (LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS < 0,1)
- **SC-PERF-02**: Tất cả API endpoint phản hồi trong vòng 200 ms ở mức p95 dưới tải bình thường
- **SC-TEST-01**: Độ phủ unit test đạt ≥ 80% trên tất cả các module tính năng
- **SC-TEST-02**: Mỗi user story có ít nhất một integration test đang pass trước khi merge
- **SC-UX-01**: Tất cả các phần tử tương tác đạt kiểm tra khả năng truy cập WCAG 2.1 AA tự động
- **SC-UX-02**: Tất cả component UI tuân thủ quy ước design system của dự án

---

## Yêu Cầu Công Cụ Phát Triển (Developer Tooling)

### MCP Server – Context7

Dự án yêu cầu thiết lập **Context7 MCP Server** để hỗ trợ AI-assisted development trong suốt quá trình phát triển.

**Mục đích**: Context7 cung cấp tài liệu thư viện luôn cập nhật theo phiên bản thực tế (Next.js, Supabase, Zod, Tailwind CSS, ...) trực tiếp vào ngữ cảnh của AI. Giải quyết vấn đề AI coding assistant đề xuất API đã lỗi thời hoặc không tồn tại.

**Yêu cầu thiết lập**:
- File `.mcp.json` ở thư mục gốc dự án với cấu hình Context7 server URL `https://mcp.context7.com/mcp`
- Cập nhật `CLAUDE.md` với quy tắc sử dụng Context7 cho tất cả tra cứu tài liệu thư viện
- AI assistant phải gọi `resolve-library-id` rồi `query-docs` trước khi viết code tích hợp thư viện mới

**Thư viện ưu tiên cần tra cứu qua Context7**:
- Next.js App Router (Server Actions, cookies, routing, caching)
- Supabase JS + SSR (server client, RLS, realtime)
- Zod (schema validation)
- Tailwind CSS (utility classes)

**Tiêu chí chấp nhận**:
- [ ] File `.mcp.json` tồn tại ở thư mục gốc với cấu hình Context7 đúng định dạng
- [ ] `CLAUDE.md` chứa quy tắc Context7 với danh sách library ID cho dự án
- [ ] Không có API của thư viện bị deprecated hoặc hallucinated trong code base

---

## Giả Định

- **Giỏ hàng theo phiên**: Không cần tài khoản hay đăng nhập để mua sắm hay thanh toán. Giỏ hàng gắn với phiên duyệt web.
- **Quyền truy cập admin tối giản**: Khu vực admin chỉ cần một cơ chế truy cập đơn giản (ví dụ: một đường dẫn URL đã biết hoặc một mật khẩu chung). Xác thực/phân quyền đầy đủ nằm ngoài phạm vi.
- **Một đơn vị tiền tệ**: Tất cả giá cả đều theo VND, không cần chuyển đổi tiền tệ.
- **Không có lịch sử đơn hàng của khách**: Khách hàng không có tài khoản và không thể xem các đơn hàng đã đặt sau khi rời trang xác nhận. Nếu đăng ký tài khoản và đặt hàng khi đã đăng nhập thì có thể xem lại.
- **Tài khoản là tuỳ chọn cho khách hàng**: Guest checkout vẫn hoạt động đầy đủ; đăng ký mang lại thêm tính năng lịch sử đơn hàng nhưng không bắt buộc.
- **Admin credential riêng biệt**: Admin không dùng hệ thống auth của khách hàng; credential admin lưu riêng (biến môi trường hoặc bảng DB riêng) với password được hash.
- **Session dựa trên httpOnly cookie**: Cả user session (khách hàng) lẫn admin session đều dùng httpOnly cookie — không dùng localStorage.
- **Không có OAuth / social login trong phiên bản này**: Chỉ hỗ trợ email/password; social login là out of scope.
- **Không có quên mật khẩu trong MVP**: Tính năng reset mật khẩu qua email là out of scope.
- **Một admin**: Không cần quản lý nhiều admin account với roles/permissions phức tạp trong phiên bản này.
- **Không có thông báo qua email**: Xác nhận thanh toán chỉ hiển thị trên màn hình; không gửi email xác nhận.
- **Hình ảnh là tùy chọn**: Sản phẩm có thể có hình ảnh, nhưng luồng chính không bị chặn nếu thiếu hình.
- **Một sản phẩm thuộc một danh mục**: Mỗi sản phẩm chỉ thuộc về một danh mục; sản phẩm đa danh mục nằm ngoài phạm vi.
- **Không có hệ thống giảm giá hoặc mã khuyến mãi**: Giá cố định; không có mã giảm giá hay khuyến mãi trong phạm vi.
- **Tồn kho trừ khi thanh toán hoàn tất**: Thêm vào giỏ không đặt trước tồn kho; tồn kho chỉ bị trừ sau khi thanh toán thành công.
- **Không lưu thông tin thẻ nhạy cảm**: Số thẻ đầy đủ và mã CVV không bao giờ được lưu vào cơ sở dữ liệu. Chỉ lưu 4 số cuối của thẻ, tên chủ thẻ và ngày hết hạn nhằm hiển thị tham chiếu trên tóm tắt đơn hàng.
- **Xác thực thẻ chỉ ở mức định dạng**: Hệ thống chỉ kiểm tra định dạng hợp lệ (độ dài, ký tự số, ngày chưa quá hạn). Không có xác minh với bất kỳ tổ chức tài chính nào.
