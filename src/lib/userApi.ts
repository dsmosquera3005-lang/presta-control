import { createServerFn } from '@tanstack/react-start';
import { requireAdmin } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';

type NewUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'asesor';
};

export const createAdminUser = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .inputValidator((data: NewUserPayload) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const { error, data: user } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
      },
      email_confirm: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new Error('No se pudo crear el usuario.');
    }

    return user;
  });
