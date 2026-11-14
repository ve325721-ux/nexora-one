# Nexora One — Product Specification

## Vision
Give service-based businesses one calm, reliable workspace to move work from first customer contact to completed delivery and payment.

## Initial customer
Small project-based service teams: agencies, consultancies, IT service providers and digital studios. Do not target every service category in the first release.

## Core workflow
1. Capture and maintain a customer record.
2. Create a project linked to that customer.
3. Break delivery into tasks and assign team members.
4. Create an invoice with line items.
5. Record a payment manually and update invoice balance/status.
6. Review operational information on a dashboard.

## Prototype modules
- Authentication and account profile
- Organization creation and membership
- Customers: create, list, search, edit, archive
- Projects: create, link customer, dates and status
- Tasks: create, assign, due date and status
- Invoices: line items, totals, status and due date
- Payment records: manual entry only
- Dashboard: real counts, invoice totals and recent activity
- Basic roles: owner, admin and member
- Organization settings: name, logo and currency

## Out of scope
Full accounting, payroll, payment gateway processing, advanced contracts/proposals, marketing automation, GPS/dispatch, AI assistant, marketplace and complex enterprise permissions.

## Requirements
- Responsive web and Android share one backend and business rules.
- Records created on one platform are visible on the other to authorized members.
- Every business record belongs to an organization.
- Users must never read or modify another organization's records.
- Dashboard figures come from persisted records, not hardcoded demo values.
- Forms include validation, loading, empty, success and error states.

## Acceptance criteria
A pilot business can register, create an organization, add a customer, create a project and tasks, issue an invoice, record a payment, and see updated dashboard data. Tenant isolation and role permissions must have repeatable tests before pilot use.
