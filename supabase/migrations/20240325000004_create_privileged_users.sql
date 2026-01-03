-- Create privileged_users table
create table if not exists privileged_users (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table privileged_users enable row level security;

-- Only service role can manage this table for now (via Edge Function)
-- We grant all to service_role by default in Supabase, but explicit policy helps clarity if we open it up later
create policy "Service role managed"
  on privileged_users
  to service_role
  using ( true )
  with check ( true );

-- Update the handle_new_user function to check for privilege
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_plan user_plan_type := 'FREE';
begin
  -- Check if user is in privileged list
  if exists (select 1 from privileged_users where email = new.email) then
    user_plan := 'PRO';
  end if;

  insert into public.profiles (id, full_name, email, plan)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, user_plan);
  return new;
end;
$$;
