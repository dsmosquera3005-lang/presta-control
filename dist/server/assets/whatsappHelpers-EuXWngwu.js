import { j as createMiddleware, A as getRequest } from "./worker-entry-DR4bSXle.js";
import { c as createClient } from "./index-ChW4vIqc.js";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Response(
        "Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set.",
        { status: 500 }
      );
    }
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
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Response("Unauthorized: No token provided", { status: 401 });
    }
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
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
      }
    );
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }
    if (!data.claims.sub) {
      throw new Response("Unauthorized: No user ID found in token", { status: 401 });
    }
    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims
      }
    });
  }
);
const normalizePhoneNumber = (phone) => {
  const digits = phone.replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.length === 8) {
    return `507${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("507")) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith("57")) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith("57")) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `57${digits.slice(1)}`;
  }
  return null;
};
const buildWhatsAppMessage = (payment, client, receiptUrl) => {
  const fmt = (n) => new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);
  const amount = Number(payment.amount);
  const base = `Hola ${client.full_name}, hemos registrado su `;
  let message = "";
  switch (payment.payment_type) {
    case "interes":
      message = `${base}pago de interés por ${fmt(amount)}.`;
      break;
    case "total":
      message = `${base}pago total por ${fmt(amount)}.`;
      break;
    case "abono":
      message = `${base}abono por ${fmt(amount)}.`;
      break;
    case "renovacion":
      message = `${base}pago de renovación por ${fmt(amount)}.`;
      break;
    case "adicional":
      message = `${base}pago adicional por ${fmt(amount)}.`;
      break;
    default:
      message = `${base}pago por ${fmt(amount)}.`;
  }
  if (payment.notes) {
    message += `
Nota: ${payment.notes}.`;
  }
  message += " Gracias por su pago.";
  if (receiptUrl) {
    message += `

Puede ver su comprobante aquí: ${receiptUrl}`;
  }
  return message;
};
export {
  buildWhatsAppMessage as b,
  normalizePhoneNumber as n,
  requireSupabaseAuth as r
};
