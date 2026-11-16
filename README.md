# Nexora One

Nexora One is a business management platform for service-based businesses. Its first release focuses on one connected workflow: **customer inquiry → project → tasks → invoice → recorded payment**.

## Product principles
- Premium, modern, minimal, professional interface.
- Web and Android from one shared TypeScript codebase.
- Simple onboarding and a focused feature set before broad ERP functionality.
- Organization-level data isolation from the first database migration.
- Real persisted data; no fake dashboard metrics in production screens.

## Initial stack
Expo, React Native, React Native Web, TypeScript, Expo Router, and Supabase (PostgreSQL, Auth, Storage, Row Level Security).

## Repository status
This repository contains the initial Expo application scaffold, a responsive dashboard preview using clearly labelled sample data, product and security notes, and a first database migration. The dashboard is a visual prototype: authentication, navigation actions, live database queries and business workflows are not implemented yet. This is not a production-ready application.

## Getting started
1. Install Node.js LTS and Git.
2. Run `npm install` (in Windows PowerShell, `npm.cmd install` also works).
3. Copy `.env.example` to `.env` and add your Supabase project URL and public anon/publishable key.
4. Run `npx expo start` (in Windows PowerShell, `npx.cmd expo start` also works).
5. Press `w` for web, or scan the QR code with Expo Go on Android.

Never put a Supabase service-role key in this app. Use only the public key in client code and enforce authorization with RLS.

## Project structure
- `app/`: Expo Router routes
- `src/components/`: shared UI components
- `src/features/`: feature modules
- `src/lib/`: backend client and utilities
- `src/theme/`: design tokens
- `supabase/migrations/`: database migrations
- `docs/`: product, security and delivery notes

See [Product Specification](docs/PRODUCT_SPEC.md), [Security Baseline](docs/SECURITY.md), and [Development Plan](docs/DEVELOPMENT_PLAN.md).

All rights reserved. No license has been granted for reuse or redistribution.
