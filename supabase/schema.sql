-- קולאקטייב — schema
-- Run against a fresh Supabase project (SQL editor, or `supabase db push`).

create table if not exists bodies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  initials      text not null,
  category      text not null check (category in ('government', 'municipal', 'ngo')),
  source_url    text not null,
  source_kind   text not null check (source_kind in ('portal', 'list', 'tenders_page')),
  adapter       text,
  verified      boolean not null default false,
  active        boolean not null default true,
  last_scan_at  timestamptz,
  last_status   text not null default 'ok' check (last_status in ('ok', 'slow', 'error')),
  created_at    timestamptz not null default now()
);

create table if not exists tenders (
  id             uuid primary key default gen_random_uuid(),
  body_id        uuid not null references bodies(id) on delete cascade,
  external_ref   text,
  title          text not null,
  summary        text,
  procedure_type text,
  topics         text[] not null default '{}',
  budget_text    text,
  deadline_at    timestamptz,
  published_at   timestamptz,
  docs_url       text not null,
  content_hash   text not null,
  confidence     numeric,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notified_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (body_id, content_hash)
);

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        text,
  topics      text[] not null default '{}',
  prefs       jsonb not null default '{"instant":true,"closing":true,"digest":false}',
  is_admin    boolean not null default false,
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists saved_sources (
  user_id    uuid not null references profiles(id) on delete cascade,
  body_id    uuid not null references bodies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, body_id)
);

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  tender_id   uuid not null references tenders(id) on delete cascade,
  channel     text not null default 'email',
  sent_at     timestamptz,
  provider_id text,
  unique (user_id, tender_id, channel)
);

create index if not exists tenders_status_published_idx on tenders (status, published_at desc);
create index if not exists tenders_topics_idx on tenders using gin (topics);
create index if not exists profiles_topics_idx on profiles using gin (topics);

-- New auth users get a profile row seeded from the signup metadata
-- (full_name / role / topics / prefs) collected in the auth modal.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, topics, prefs, confirmed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'role',
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(new.raw_user_meta_data -> 'topics')),
      '{}'
    ),
    coalesce(new.raw_user_meta_data -> 'prefs', '{"instant":true,"closing":true,"digest":false}'::jsonb),
    new.email_confirmed_at is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = coalesce(excluded.role, profiles.role),
    topics = case when array_length(excluded.topics, 1) > 0 then excluded.topics else profiles.topics end,
    prefs = excluded.prefs;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keeps profiles.email in sync once a user confirms an email change
-- (auth.users.email only updates after they click the confirmation link).
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_change();

-- Marks a member "מאומת" once they click a magic link (Supabase stamps
-- email_confirmed_at the first time a user completes any OTP/magic-link flow).
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set confirmed = (new.email_confirmed_at is not null) where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_user_confirmed();

-- Row Level Security

alter table bodies enable row level security;
alter table tenders enable row level security;
alter table profiles enable row level security;
alter table saved_sources enable row level security;
alter table notifications enable row level security;

create policy "bodies are publicly readable" on bodies
  for select using (true);

create policy "approved tenders are publicly readable" on tenders
  for select using (status = 'approved');

create policy "admins can read every tender" on tenders
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "admins can update tenders" on tenders
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "users read their own profile" on profiles
  for select using (auth.uid() = id);

create policy "admins read every profile" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "users update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "users manage their own saved sources" on saved_sources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read their own notifications" on notifications
  for select using (auth.uid() = user_id);
