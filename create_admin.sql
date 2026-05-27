-- Crear usuario administrador
-- Supabase automáticamente ejecutará el trigger handle_new_user que creará el profile y rol
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'dantiny3005@gmail.com',
  crypt('D@nte3005', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador","role":"admin"}',
  now(),
  now()
);
