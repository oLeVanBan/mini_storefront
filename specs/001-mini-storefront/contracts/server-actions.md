# Server Actions Contract: Giỏ Hàng & Thanh Toán

**Loại**: Next.js Server Actions (không phải REST API)  
**Vị trí trong code**: `lib/actions/cart.ts`, `lib/actions/checkout.ts`  
**Transport**: Form submissions hoặc gọi trực tiếp từ Client Components

---

## Cart Cookie Schema

Giỏ hàng được lưu trong `httpOnly` cookie tên `cart`, giá trị là JSON được base64-encode:

```typescript
type CartCookie = {
  items: CartItem[];
  updatedAt: string; // ISO 8601
};

type CartItem = {
  productId: string;   // uuid
  name: string;        // snapshot tên sản phẩm
  price: number;       // snapshot giá (VND, integer)
  quantity: number;    // số lượng, luôn > 0
  imageUrl?: string;   // snapshot ảnh
};
```

---

## Server Actions – Giỏ Hàng

### `addToCart(productId, quantity)`

**Vị trí**: `lib/actions/cart.ts`

**Input**:
```typescript
productId: string   // uuid sản phẩm
quantity: number    // số lượng thêm vào (> 0)
```

**Hành vi**:
1. Đọc cookie giỏ hàng hiện tại
2. Truy vấn Supabase (anon) để lấy `name`, `price`, `stock_quantity`, `is_published` của sản phẩm
3. Kiểm tra sản phẩm tồn tại và `is_published = true`
4. Kiểm tra `(currentQty + quantity) <= stock_quantity`
5. Nếu sản phẩm đã có trong giỏ: cộng số lượng; nếu chưa: thêm mới
6. Ghi cookie cập nhật
7. Gọi `revalidatePath('/cart')`

**Output (thành công)**: `{ success: true }`  
**Output (lỗi)**: `{ success: false, error: 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND' | 'EXCEEDS_STOCK' }`

---

### `updateCartQuantity(productId, quantity)`

**Input**:
```typescript
productId: string   // uuid sản phẩm
quantity: number    // số lượng mới (> 0); nếu = 0 → đồng nghĩa xóa
```

**Hành vi**:
1. Đọc cookie
2. Nếu `quantity = 0`: xóa mục khỏi giỏ
3. Nếu `quantity > 0`: kiểm tra tồn kho, cập nhật số lượng
4. Ghi cookie, `revalidatePath('/cart')`

**Output**: `{ success: true }` | `{ success: false, error: 'EXCEEDS_STOCK' | 'ITEM_NOT_IN_CART' }`

---

### `removeFromCart(productId)`

**Input**: `productId: string`

**Hành vi**: Đọc cookie → xóa mục có `productId` → ghi cookie → `revalidatePath('/cart')`

**Output**: `{ success: true }`

---

### `clearCart()`

**Hành vi**: Xóa toàn bộ cookie `cart`.

**Dùng khi**: Sau khi checkout thành công.

---

## Server Actions – Checkout

### `submitOrder(formData)`

**Vị trí**: `lib/actions/checkout.ts`

**Input** (từ HTML form):
```typescript
type CheckoutFormData = {
  customerName: string;         // bắt buộc
  customerEmail: string;        // bắt buộc, định dạng email hợp lệ
  deliveryAddress: string;      // bắt buộc
  paymentMethod: 'COD' | 'CARD';
  // Chỉ bắt buộc nếu paymentMethod = 'CARD':
  cardholderName?: string;
  cardNumber?: string;          // 16 chữ số – validate định dạng; KHÔNG lưu
  cardExpiry?: string;          // "MM/YY"
  cardCvv?: string;             // 3 chữ số – validate định dạng; KHÔNG lưu
};
```

**Hành vi** (trong một database transaction):
1. Đọc cookie giỏ hàng; nếu trống → trả lỗi `EMPTY_CART`
2. Validate tất cả các trường bắt buộc phía server
3. Nếu `paymentMethod = 'CARD'`: validate định dạng thẻ (độ dài, ký tự số, ngày hết hạn)
4. Với mỗi sản phẩm trong giỏ: kiểm tra `stock_quantity` hiện tại đủ số lượng
5. Tạo `reference_number` = `ORD-{YYYYMMDD}-{6-char-uppercase-random}`
6. Insert `orders` row (service role)
7. Insert `order_items` rows – snapshot `product_name` và `unit_price` từ DB tại thời điểm này
8. Nếu `paymentMethod = 'CARD'`: insert `payment_details` với `card_last4` (4 số cuối của `cardNumber`), `cardholder_name`, `exp_month`, `exp_year` — **không lưu `cardNumber` đầy đủ hay `cardCvv`**
9. Trừ `stock_quantity` từng sản phẩm (UPDATE với `WHERE stock_quantity >= ordered_qty` để tránh race condition)
10. Nếu bất kỳ bước nào thất bại: rollback toàn bộ transaction
11. Xóa cookie giỏ hàng
12. `revalidatePath('/')`, `revalidatePath('/cart')`

**Output (thành công)**: `{ success: true, referenceNumber: string }`  
**Output (lỗi)**:
```typescript
{ success: false, error: 'EMPTY_CART' }
{ success: false, error: 'VALIDATION_ERROR', fields: Record<string, string> }
{ success: false, error: 'OUT_OF_STOCK', productName: string }
{ success: false, error: 'SERVER_ERROR' }
```

**Redirect sau thành công**: Server Action redirect đến `/orders/{referenceNumber}`

---

## Server Actions – Admin

### `updateProduct(productId, data)`

**Vị trí**: `lib/actions/admin.ts`

**Input**:
```typescript
productId: string;
data: {
  price?: number;          // >= 0
  stockQuantity?: number;  // >= 0
  isPublished?: boolean;
};
```

**Hành vi**:
1. Kiểm tra admin access (đọc header/cookie secret)
2. Validate input (giá không âm, tồn kho không âm)
3. Update `products` row qua service role
4. `revalidatePath('/')`, `revalidatePath('/products/' + productId)`, `revalidatePath('/admin/products')`

**Output**: `{ success: true }` | `{ success: false, error: string }`

---

## Server Actions – Quản Lý Danh Mục (Admin)

### `createCategory(data)`

**Vị trí**: `lib/actions/admin.ts`

**Input**:
```typescript
data: {
  name: string;    // bắt buộc, không rỗng
  slug: string;    // bắt buộc; chỉ [a-z0-9-]; tự sinh hoặc nhập thủ công
};
```

**Hành vi**:
1. Kiểm tra admin access
2. Validate: `name` không rỗng; `slug` khớp regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`
3. Kiểm tra `name` và `slug` chưa tồn tại trong DB (UNIQUE constraint)
4. Insert `categories` row qua service role
5. `revalidatePath('/admin/categories')`, `revalidatePath('/')`

**Output**: `{ success: true, id: string }` | `{ success: false, error: 'NAME_TAKEN' | 'SLUG_TAKEN' | 'VALIDATION_ERROR' | 'SERVER_ERROR' }`

---

### `updateCategory(categoryId, data)`

**Input**:
```typescript
categoryId: string;
data: {
  name?: string;
  slug?: string;
};
```

**Hành vi**:
1. Kiểm tra admin access
2. Validate format giống `createCategory`
3. Kiểm tra `name`/`slug` không trùng với danh mục khác (trừ chính nó)
4. Update `categories` row qua service role
5. `revalidatePath('/admin/categories')`, `revalidatePath('/')`, `revalidatePath('/categories/' + oldSlug)`

**Output**: `{ success: true }` | `{ success: false, error: 'NAME_TAKEN' | 'SLUG_TAKEN' | 'NOT_FOUND' | 'SERVER_ERROR' }`

---

### `deleteCategory(categoryId)`

**Input**: `categoryId: string`

**Hành vi**:
1. Kiểm tra admin access
2. Đếm số sản phẩm thuộc danh mục này
3. Nếu `count > 0`: trả lỗi `HAS_PRODUCTS` kèm số lượng — **không xóa**
4. Nếu `count = 0`: delete `categories` row qua service role
5. `revalidatePath('/admin/categories')`, `revalidatePath('/')`

**Output**: `{ success: true }` | `{ success: false, error: 'HAS_PRODUCTS', count: number }` | `{ success: false, error: 'NOT_FOUND' | 'SERVER_ERROR' }`

---

## TypeScript Shared Types

**Vị trí**: `lib/types.ts`

```typescript
export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  isPublished: boolean;
  categoryId: string;
  imageUrl: string | null;
  category?: Category;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Cart = {
  items: CartItem[];
  totalAmount: number;   // computed: sum(price * quantity)
  totalItems: number;    // computed: sum(quantity)
};

export type Order = {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'CARD';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  paymentDetail?: PaymentDetail;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type PaymentDetail = {
  cardholderName: string;
  cardLast4: string;
  expMonth: number;
  expYear: number;
};
```

---

## Server Actions – Xác Thực Khách Hàng (US5)

**Vị trí**: `lib/actions/auth.ts`

### `registerUser(formData)`

**Input** (từ HTML form):
```typescript
{
  fullName: string;    // bắt buộc, không rỗng
  email: string;       // bắt buộc, định dạng email hợp lệ
  password: string;    // bắt buộc, tối thiểu 8 ký tự
}
```

**Hành vi**:
1. Validate phía server: `fullName` không rỗng, `email` hợp lệ, `password` ≥ 8 ký tự
2. Gọi `supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })`
3. Nếu email đã tồn tại: Supabase trả identity conflict → map sang lỗi `EMAIL_TAKEN`
4. Nếu thành công: session tự động set vào cookie bởi `@supabase/ssr`
5. `redirect('/')` sau khi đăng ký thành công

**Output (lỗi — không redirect)**:
```typescript
{ success: false, error: 'EMAIL_TAKEN' }
{ success: false, error: 'VALIDATION_ERROR', fields: Record<string, string> }
{ success: false, error: 'SERVER_ERROR' }
```

---

### `loginUser(formData)`

**Input**:
```typescript
{
  email: string;
  password: string;
}
```

**Hành vi**:
1. Validate phía server: email hợp lệ, password không rỗng
2. Gọi `supabase.auth.signInWithPassword({ email, password })`
3. Nếu lỗi (sai password, email không tồn tại, bị khoá): trả về lỗi chung `INVALID_CREDENTIALS` — **không phân biệt loại lỗi** (chống user enumeration)
4. Nếu thành công: session cookie tự động set; `redirect('/')`

**Output (lỗi)**:
```typescript
{ success: false, error: 'INVALID_CREDENTIALS' }   // dùng chung cho mọi lỗi đăng nhập
{ success: false, error: 'SERVER_ERROR' }
```

---

### `logoutUser()`

**Hành vi**:
1. Gọi `supabase.auth.signOut()`
2. `redirect('/')`

**Output**: Không có — luôn redirect.

---

## Server Actions – Admin Auth (US6)

**Vị trí**: `lib/actions/admin-auth.ts`

### `adminLogin(formData)`

**Input**:
```typescript
{
  username: string;
  password: string;
}
```

**Hành vi**:
1. Validate: username và password không rỗng
2. So sánh `username` với `process.env.ADMIN_USERNAME`
3. So sánh `password` với `process.env.ADMIN_PASSWORD_HASH` dùng `bcryptjs.compare()`
4. Nếu đúng: tạo HMAC-signed session token → set `admin_session` httpOnly cookie (8h maxAge)
5. Nếu sai: delay 200ms (rate-limit đơn giản) → trả `INVALID_CREDENTIALS`
6. `redirect('/admin/products')` khi thành công

**Output (lỗi)**:
```typescript
{ success: false, error: 'INVALID_CREDENTIALS' }
```

---

### `adminLogout()`

**Hành vi**: Xóa cookie `admin_session` → `redirect('/admin/login')`

---

## Server Actions – Admin Quản Lý Users (US7)

**Vị trí**: `lib/actions/admin-users.ts`

### `toggleUserBan(userId, ban)`

**Input**:
```typescript
userId: string;     // uuid từ auth.users
ban: boolean;       // true = khoá, false = mở khoá
```

**Hành vi**:
1. Kiểm tra admin access (cookie `admin_session`)
2. Gọi service role: `supabase.auth.admin.updateUser(userId, { ban_duration: ban ? '876600h' : 'none' })`
3. `revalidatePath('/admin/users')`

**Output**: `{ success: true }` | `{ success: false, error: 'USER_NOT_FOUND' | 'SERVER_ERROR' }`
