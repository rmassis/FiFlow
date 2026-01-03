-- Add new columns to profiles table
alter table profiles 
add column if not exists phone text,
add column if not exists date_of_birth date,
add column if not exists cpf text;
