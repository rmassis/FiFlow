-- Allow users to insert their own profile (needed for upsert/initial creation if missing)
create policy "Users can insert own profile"
on profiles for insert
to public
with check ( auth.uid() = id );
