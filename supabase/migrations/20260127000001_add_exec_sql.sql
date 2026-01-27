-- Create a function to execute dynamic SQL
-- This allows the agent to run SELECT queries safely
create or replace function exec_sql(sql text)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  -- Basic safety check: only allow SELECT queries
  if lower(trim(sql)) not like 'select%' then
    raise exception 'Only SELECT queries are allowed';
  end if;

  execute 'select json_agg(t) from (' || sql || ') t' into result;
  
  if result is null then
    result := '[]'::json;
  end if;
  
  return result;
end;
$$;
