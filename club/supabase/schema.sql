-- Private club: members, time-limited guest lists, and signups.
-- Run once in the Supabase SQL Editor. The app talks to these tables only
-- with the service-role key from the server, so RLS is on with no policies.

create table if not exists club_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  email text not null,
  instagram text not null default '',
  age int not null check (age >= 18),
  created_at timestamptz not null default now()
);

create table if not exists club_lists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text not null default '',
  event_at text,
  closes_at timestamptz not null,
  capacity int not null default 40 check (capacity > 0),
  closed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists club_signups (
  list_id uuid not null references club_lists(id) on delete cascade,
  member_id uuid not null references club_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, member_id)
);

alter table club_members enable row level security;
alter table club_lists enable row level security;
alter table club_signups enable row level security;

-- Locks the list row so concurrent joins can't push it past capacity.
create or replace function club_join_list(p_list uuid, p_member uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  l club_lists;
  n int;
begin
  select * into l from club_lists where id = p_list for update;
  if not found then return 'missing'; end if;
  if exists (select 1 from club_signups where list_id = p_list and member_id = p_member) then
    return 'already';
  end if;
  if l.closed or now() >= l.closes_at then return 'closed'; end if;
  select count(*) into n from club_signups where list_id = p_list;
  if n >= l.capacity then return 'full'; end if;
  insert into club_signups (list_id, member_id) values (p_list, p_member);
  return 'ok';
end;
$$;

revoke execute on function club_join_list(uuid, uuid) from public, anon, authenticated;
