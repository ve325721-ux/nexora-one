create index if not exists invoice_items_business_id_idx on public.invoice_items(business_id);
create index if not exists payments_business_id_idx on public.payments(business_id);
