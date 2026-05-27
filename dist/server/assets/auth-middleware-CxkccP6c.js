import { j as createMiddleware, A as getRequest } from "./worker-entry-u5osyKlM.js";
import { c as createClient } from "./index-ChW4vIqc.js";
function getBearerToken() {
  const request = getRequest();
  if (!request?.headers) {
    throw new Response("Unauthorized: No request headers available", { status: 401 });
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Response("Unauthorized: No authorization header provided", { status: 401 });
  }
  if (!authHeader.startsWith("Bearer ")) {
    throw new Response("Unauthorized: Only Bearer tokens are supported", { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Response("Unauthorized: No token provided", { status: 401 });
  }
  return token;
}
function createSupabaseAuthClient(token) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Response(
      "Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set.",
      { status: 500 }
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
async function resolveAuthContext() {
  const token = getBearerToken();
  const supabase = createSupabaseAuthClient(token);
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Response("Unauthorized: Invalid or expired token", { status: 401 });
  }
  const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle();
  const isActive = profile?.is_active ?? true;
  if (!isActive) {
    throw new Response("Forbidden: User account is inactive", { status: 403 });
  }
  const { data: roleRow, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (roleError) {
    throw new Response("Unauthorized: Unable to resolve user role", { status: 401 });
  }
  return {
    supabase,
    userId: user.id,
    claims: user,
    role: roleRow?.role ?? null,
    isActive
  };
}
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authContext = await resolveAuthContext();
    return next({ context: authContext });
  }
);
const requireAdmin = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authContext = await resolveAuthContext();
    if (authContext.role !== "admin") {
      throw new Response("Forbidden: Admin role required", { status: 403 });
    }
    return next({ context: authContext });
  }
);
export {
  requireSupabaseAuth as a,
  requireAdmin as r
};
