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

## Tech Constraints
- Next.js (Fullstack)
- TypeScript
- Supabase (DB + optional auth)
- Deploy: Vercel

## Non-Goals
- Không cần payment gateway thật
- Không cần auth phức tạp (có thể mock admin)

<!-- SPECKIT START -->
## Active Implementation Plan
- **Feature**: 001-mini-storefront
- **Plan**: specs/001-mini-storefront/plan.md
- **Spec**: specs/001-mini-storefront/spec.md
- **Research**: specs/001-mini-storefront/research.md
- **Data Model**: specs/001-mini-storefront/data-model.md
- **Contracts**: specs/001-mini-storefront/contracts/
- **Quickstart**: specs/001-mini-storefront/quickstart.md
<!-- SPECKIT END -->