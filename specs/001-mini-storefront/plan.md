# Implementation Plan: Mini Storefront – Auth & User Management

**Branch**: `001-mini-storefront` | **Ngày cập nhật**: 2026-04-23 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification `specs/001-mini-storefront/spec.md` — US5, US6, US7 (mới thêm)

> **Phạm vi plan này**: Chỉ bao gồm các tính năng mới — US5 (Customer Auth), US6 (Admin Form Login), US7 (Admin User Management). US1–US4 đã implement xong; xem tasks.md cho trạng thái các phase trước.

---

## Summary

Bổ sung hệ thống xác thực hai tầng vào Mini Storefront hiện có:

1. **Customer Auth (US5)**: Đăng ký/đăng nhập/đăng xuất khách hàng qua Supabase Auth (`@supabase/ssr` đã có sẵn). Lịch sử đơn hàng tại `/profile/orders`.
2. **Admin Form Login (US6)**: Thay thế cơ chế `?secret=` bằng form login với `bcryptjs` + env vars. Session qua httpOnly cookie.
3. **Admin User Management (US7)**: Xem/khoá/mở khoá tài khoản khách hàng qua `supabase.auth.admin.*` API.

Không thêm bảng DB mới — tận dụng `auth.users` của Supabase. Chỉ cần migration nhỏ: thêm `user_id` nullable FK vào bảng `orders`.

---

## Technical Context

**Language/Version**: TypeScript 5 + Next.js App Router (hiện tại trong project)  
**Primary Dependencies**:
- `@supabase/ssr` (đã cài) — Supabase Auth với cookie session
- `bcryptjs` (cài mới) — Hash và verify admin password
- `@types/bcryptjs` (dev dependency)

**Storage**: Supabase PostgreSQL — thêm `orders.user_id` FK nullable tới `auth.users`  
**Testing**: Jest + React Testing Library (TDD bắt buộc theo constitution)  
**Target Platform**: Vercel (Next.js fullstack)  
**Constraints**: httpOnly cookies cho tất cả session; không localStorage; không OAuth; không reset password  
**Scale/Scope**: Single admin; khách hàng vừa đủ cho MVP

---

## Constitution Check

*Pre-design gate — tất cả phải pass trước khi implement*

- [x] **I. Simplicity First** — Supabase Auth tận dụng infrastructure đã có; bcryptjs + env var đủ cho single admin; không over-engineer.
- [x] **II. Fullstack Type Safety** — Types mới: `User`, `AdminSession` thêm vào `lib/types.ts`; Server Actions typed đầy đủ.
- [x] **III. Modular Architecture** — Auth actions trong `lib/actions/auth.ts`, `lib/actions/admin-auth.ts`, `lib/actions/admin-users.ts`; tách biệt khỏi cart và checkout.
- [x] **IV. TDD** — Test trước implement: mỗi Server Action có test happy path + validation + edge cases.
- [x] **V. Admin Control** — US7 thêm khoá/mở khoá user vào khu vực admin.
- [x] **VI. Performance** — Middleware chỉ gọi `getUser()` một lần per request; admin listUsers cached với `revalidatePath`.

**Không có vi phạm Constitution cần ghi nhận.**

---

## Project Structure

### Documentation (feature này)

```text
specs/001-mini-storefront/
├── plan.md              ← File này
├── research.md          ← Cập nhật: thêm section 6, 7, 8 (Auth research)
├── data-model.md        ← Cập nhật: orders.user_id FK, auth.users section
├── quickstart.md        ← Cập nhật: thêm auth setup, env vars mới
├── contracts/
│   ├── server-actions.md  ← Cập nhật: thêm auth/admin-auth/admin-users actions
│   └── ui-contracts.md    ← Cập nhật: thêm /register, /login, /profile/*, /admin/users/*
└── tasks.md             ← Sẽ tạo bởi /speckit.tasks
```

### Source Code (thay đổi / thêm mới)

```text
# Thêm mới
lib/
├── actions/
│   ├── auth.ts                      # registerUser, loginUser, logoutUser
│   ├── admin-auth.ts                # adminLogin, adminLogout
│   └── admin-users.ts               # toggleUserBan
└── utils/
    └── admin-session.ts             # HMAC sign/verify admin session token

app/
├── (shop)/
│   ├── login/
│   │   └── page.tsx                 # /login — đăng nhập khách hàng
│   ├── register/
│   │   └── page.tsx                 # /register — đăng ký tài khoản
│   └── profile/
│       └── orders/
│           └── page.tsx             # /profile/orders — lịch sử đơn hàng
│
└── (admin)/
    └── admin/
        └── users/
            ├── page.tsx             # /admin/users — danh sách users
            └── [id]/
                └── page.tsx         # /admin/users/[id] — chi tiết user

__tests__/unit/
├── actions/
│   ├── auth.test.ts                 # Tests cho registerUser, loginUser, logoutUser
│   ├── admin-auth.test.ts           # Tests cho adminLogin, adminLogout
│   └── admin-users.test.ts          # Tests cho toggleUserBan
└── utils/
    └── admin-session.test.ts        # Tests cho HMAC sign/verify

# Chỉnh sửa hiện có
middleware.ts                        # Thêm Supabase session refresh; update admin guard
components/Navbar.tsx                # Thêm user auth state (login link / user menu)
app/(admin)/layout.tsx               # Update: dùng admin_session cookie mới
app/(admin)/admin/*/                 # Cập nhật admin nav link (thêm Users)
lib/actions/checkout.ts              # Thêm user_id vào order khi user đã đăng nhập
lib/types.ts                         # Thêm type User, AdminSession
supabase/migrations/002_user_id.sql  # ALTER TABLE orders ADD COLUMN user_id
```

---

## Phase 0: Research (Đã Hoàn Thành)

Xem `research.md` — sections 6, 7, 8.

**Kết luận chính**:

| Câu hỏi | Quyết định |
|---------|-----------|
| Customer auth mechanism | Supabase Auth (`@supabase/ssr`) — đã cài sẵn |
| Admin auth mechanism | `bcryptjs` + env vars + HMAC session cookie |
| User management API | `supabase.auth.admin.listUsers/updateUser` via service role |
| New DB tables | Không cần — dùng `auth.users` của Supabase |
| Migration cần thiết | `ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id)` |
| Cart khi đăng nhập | Giữ nguyên cookie — không cần merge logic |

---

## Phase 1: Design (Đã Hoàn Thành)

### Data Model Changes

1. **`orders.user_id`** (nullable UUID FK → `auth.users.id`):
   - `NULL` = guest checkout
   - Non-null = order linked to registered user
   - `ON DELETE SET NULL` — xóa user không xóa order
   - RLS policy mới: `SELECT WHERE user_id = auth.uid()` cho `authenticated`

2. **Không có bảng mới**: `auth.users` đã chứa email, `full_name` (user_metadata), `banned_until`, `created_at`

Xem chi tiết: [data-model.md](data-model.md)

### Contracts

- **Server Actions mới**: `registerUser`, `loginUser`, `logoutUser`, `adminLogin`, `adminLogout`, `toggleUserBan`
  Xem [contracts/server-actions.md](contracts/server-actions.md)
- **UI pages mới**: `/register`, `/login`, `/profile/orders`, `/admin/login` (updated), `/admin/users`, `/admin/users/[id]`
  Xem [contracts/ui-contracts.md](contracts/ui-contracts.md)

---

## Implementation Roadmap (Cho /speckit.tasks)

> Các task dưới đây là roadmap gợi ý. `/speckit.tasks` sẽ tạo `tasks.md` chi tiết.

### Phase A – Chuẩn Bị Nền Tảng

| # | Task | TDD | Notes |
|---|------|-----|-------|
| A1 | Cài `bcryptjs` + `@types/bcryptjs` | — | `pnpm add bcryptjs && pnpm add -D @types/bcryptjs` |
| A2 | Viết migration `002_user_id.sql` | — | ALTER TABLE + index + RLS policy |
| A3 | Thêm types `User`, `AdminSession` vào `lib/types.ts` | — | |
| A4 | Implement `lib/utils/admin-session.ts` (HMAC sign/verify) | ✅ | Test trước: sign, verify valid, verify expired, verify tampered |
| A5 | Thêm env vars mới vào `.env.local.example` | — | ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET |

### Phase B – Customer Auth (US5) — TDD

| # | Task | TDD | Notes |
|---|------|-----|-------|
| B1 | Viết tests `registerUser` | ✅ | happy, EMAIL_TAKEN, validation errors |
| B2 | Implement `lib/actions/auth.ts` — `registerUser` | ✅ | |
| B3 | Viết tests `loginUser` | ✅ | happy, INVALID_CREDENTIALS, banned account |
| B4 | Implement `loginUser` | ✅ | |
| B5 | Implement `logoutUser` + test | ✅ | |
| B6 | Cập nhật `middleware.ts` — Supabase session refresh | — | `await supabase.auth.getUser()` |
| B7 | Implement `/login` page (Client Component) + tests | ✅ | form validation + submit |
| B8 | Implement `/register` page + tests | ✅ | |
| B9 | Cập nhật `Navbar.tsx` — user auth state | — | Server Component |
| B10 | Implement `/profile/orders` + guard | — | |

### Phase C – Admin Form Login (US6) — TDD

| # | Task | TDD | Notes |
|---|------|-----|-------|
| C1 | Viết tests `adminLogin` | ✅ | happy, wrong password, missing fields |
| C2 | Implement `lib/actions/admin-auth.ts` | ✅ | `adminLogin`, `adminLogout` |
| C3 | Cập nhật `middleware.ts` — HMAC verify admin session | — | |
| C4 | Cập nhật trang `/admin/login` — dùng `adminLogin` action | — | |
| C5 | Cập nhật `app/(admin)/layout.tsx` | — | Remove legacy checks |

### Phase D – Admin User Management (US7) — TDD

| # | Task | TDD | Notes |
|---|------|-----|-------|
| D1 | Viết tests `toggleUserBan` | ✅ | ban, unban, not found |
| D2 | Implement `lib/actions/admin-users.ts` | ✅ | |
| D3 | Implement `/admin/users` page | — | list + client-side search |
| D4 | Implement `/admin/users/[id]` page | — | profile + orders |
| D5 | Cập nhật Admin Navbar — link "Người dùng" | — | |

### Phase E – Integration & Polish

| # | Task | TDD | Notes |
|---|------|-----|-------|
| E1 | Cập nhật `checkout.ts` — set `user_id` từ session | — | nullable; không break guest flow |
| E2 | Cập nhật `quickstart.md` | — | bcrypt hash command, env vars |

---

## Dependency Graph

```
A1, A2, A3
    ↓
A4 (admin-session utils) ←── A5 (env vars)
    ↓
    ├── B1-B5 (auth actions)
    │       ↓
    │   B6-B10 (auth UI + middleware)
    │
    └── C1-C2 (admin-auth actions)
            ↓
        C3-C5 (admin middleware + UI)
                ↓
            D1-D4 (user management)
                    ↓
                E1-E2 (checkout + docs)
```

---

## Complexity Tracking

*Không có vi phạm Constitution cần justify.*

---

## Environment Variables (Cập Nhật)

| Biến | Phạm vi | Mô tả | Mới? |
|------|---------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | URL project Supabase | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Anon key | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key | — |
| `ADMIN_SECRET` | Server only | Legacy — xóa sau khi US6 hoàn thành | deprecated |
| `ADMIN_USERNAME` | Server only | Username admin cho form login | ✅ |
| `ADMIN_PASSWORD_HASH` | Server only | bcrypt hash của admin password (cost=12) | ✅ |
| `ADMIN_SESSION_SECRET` | Server only | Random string 32+ chars để ký HMAC | ✅ |
