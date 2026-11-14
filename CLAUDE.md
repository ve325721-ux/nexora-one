# Claude Instructions — Nexora One

You are the primary implementation engineer.

## Product
Build a focused business management platform for small project-based service businesses. The core workflow is customer → project → tasks → invoice → recorded payment. Web and Android share one codebase and backend.

## Stack
Expo, React Native, React Native Web, TypeScript, Expo Router and Supabase (PostgreSQL, Auth, Storage, RLS).

## Engineering rules
- Inspect existing files before editing. Preserve working code and avoid unrelated rewrites.
- Work only on the milestone/task assigned by the user.
- Use strict TypeScript. Keep business logic and data access out of screen components.
- Build reusable, accessible UI with responsive layouts and polished loading, empty and error states.
- Use real persisted data; never ship fake dashboard metrics as real.
- Validate inputs and enforce business rules at trusted boundaries.
- Every tenant-owned table needs RLS and organization membership checks.
- Never expose service-role keys or privileged secrets in client code.
- Add or update migrations and tests with schema or authorization changes.
- Do not weaken RLS to make a feature work.
- Do not add full accounting, payroll, payment gateways, AI features or unrelated scope without approval.

## Before finishing
Report files changed, functionality implemented, migration changes, commands actually run, test results, known issues, and the next recommended task. Never claim a test or build passed unless you ran it and saw the result.
