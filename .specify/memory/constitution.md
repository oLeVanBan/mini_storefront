# Project Constitution – Mini Storefront

## Core Principles
1. Simplicity First
- Ưu tiên implementation đơn giản, dễ hiểu
- Không over-engineering

2. Fullstack Type Safety
- Sử dụng TypeScript end-to-end
- Shared types giữa frontend và backend

3. Modular Architecture
- Tách rõ: UI, business logic, data access
- Dễ mở rộng sau này (payment thật, auth...)

4. Minimal but Complete Flow
- Bắt buộc có: Product → Cart → Checkout
- Checkout chỉ là giả lập (mock)

5. Admin Control
- Admin có thể:
  - Update price
  - Update stock
  - Publish / unpublish product

6. Performance & DX
- Ưu tiên Next.js App Router
- Server Actions hoặc API Routes đơn giản

7. Test-Driven Development (TDD)
- **Bắt buộc** viết test trước khi implement cho Server Actions và utility functions
- **Bắt buộc** viết test trước khi implement cho các Client Components có logic (CartItemRow, form components)
- Quy trình: Red (test fail) → Green (implement tối thiểu) → Refactor
- Test framework: Jest + React Testing Library (unit), Playwright (E2E)
- Coverage tối thiểu: 80% cho `lib/**` và `components/**`
- Mỗi Server Action phải có ít nhất: happy path, validation error, edge cases

## Tech Constraints
- Next.js (Fullstack)
- TypeScript
- Supabase (DB + optional auth)
- Deploy: Vercel hoặc Cloudflare Workers

## Non-Goals
- Không cần payment gateway thật
- Không cần auth phức tạp (có thể mock admin)