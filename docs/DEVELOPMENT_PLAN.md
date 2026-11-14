# Development Plan

## Milestone 0 — Repository foundation
- [x] Product and architecture baseline
- [x] Expo Router + TypeScript scaffold
- [x] Shared theme tokens
- [x] Supabase client placeholder
- [x] Initial database migration and security notes

## Milestone 1 — App foundation
- [ ] Install dependencies and run web/Android development builds
- [ ] Add linting, formatting and typecheck to CI
- [ ] Build reusable buttons, inputs, cards, dialogs and navigation
- [ ] Add responsive application shell and design QA

## Milestone 2 — Identity and organization
- [ ] Register, login, logout and password reset
- [ ] Profile management
- [ ] Organization onboarding
- [ ] Owner/admin/member permission tests

## Milestone 3 — Customer and project workflow
- [ ] Customer CRUD, search and archive
- [ ] Project CRUD and customer linking
- [ ] Task CRUD, assignment and due dates
- [ ] Activity history

## Milestone 4 — Invoices and payments
- [ ] Invoice creation and line items
- [ ] Trusted total calculation and validation
- [ ] Manual payment records
- [ ] Invoice balance and status transitions

## Milestone 5 — Dashboard and pilot readiness
- [ ] Dashboard from real database queries
- [ ] Empty, loading and error states
- [ ] Cross-platform QA
- [ ] RLS and tenant-isolation tests
- [ ] Backup/restore and deployment checklist
- [ ] Pilot with a small number of real service businesses

## Working agreement
ChatGPT plans and reviews. Claude is the primary implementation engineer for assigned tasks. Only one AI edits a given set of files at a time. GitHub is the source of truth. After each task: inspect the diff, run checks, test the feature, then commit.
