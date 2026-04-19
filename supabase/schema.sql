-- SUPPLIERS
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefono text,
  indirizzo text,
  lat float,
  lng float,
  created_at timestamp with time zone default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  marca text,
  specs jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- SUPPLIER_PRODUCTS
create table if not exists supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  prezzo float,
  disponibile boolean default true,
  updated_at timestamp with time zone default now(),
  unique(supplier_id, product_id)
);

-- LEADS
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  nome text,
  email text,
  telefono text,
  messaggio text,
  created_at timestamp with time zone default now()
);
