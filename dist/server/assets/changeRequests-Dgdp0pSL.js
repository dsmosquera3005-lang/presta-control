import { s as supabase } from "./router-Qm6JXj-0.js";
const REQUEST_LABELS = {
  update_client: "Actualizar datos de cliente",
  increase_loan: "Aumentar crédito",
  decrease_loan: "Disminuir crédito",
  waive_mora: "Quitar mora",
  delete_payment: "Eliminar movimiento / adicional",
  delete_loan: "Eliminar crédito",
  delete_client: "Eliminar cliente"
};
async function createChangeRequest(input) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Sesión expirada");
  const { error } = await supabase.from("change_requests").insert({
    requested_by: uid,
    request_type: input.request_type,
    client_id: input.client_id ?? null,
    loan_id: input.loan_id ?? null,
    payment_id: input.payment_id ?? null,
    payload: input.payload ?? {},
    reason: input.reason ?? null
  });
  if (error) throw error;
}
async function applyChangeRequest(reqId) {
  const { data: req, error } = await supabase.from("change_requests").select("*").eq("id", reqId).maybeSingle();
  if (error || !req) throw error ?? new Error("Solicitud no encontrada");
  const payload = req.payload ?? {};
  switch (req.request_type) {
    case "update_client": {
      if (!req.client_id) throw new Error("Falta cliente");
      const allowed = ["full_name", "phone", "email", "home_address", "work_address", "references_info"];
      const patch = {};
      for (const k of allowed) if (k in payload) patch[k] = payload[k];
      const { error: e } = await supabase.from("clients").update(patch).eq("id", req.client_id);
      if (e) throw e;
      break;
    }
    case "increase_loan":
    case "decrease_loan": {
      if (!req.loan_id) throw new Error("Falta crédito");
      const patch = {};
      if (payload.amount != null) patch.amount = payload.amount;
      if (payload.expected_amount != null) patch.expected_amount = payload.expected_amount;
      const { error: e } = await supabase.from("loans").update(patch).eq("id", req.loan_id);
      if (e) throw e;
      break;
    }
    case "waive_mora": {
      if (!req.loan_id) throw new Error("Falta crédito");
      const { error: e } = await supabase.from("loans").update({ mora_waived: true }).eq("id", req.loan_id);
      if (e) throw e;
      break;
    }
    case "delete_payment": {
      if (!req.payment_id) throw new Error("Falta movimiento");
      const payload2 = req.payload ?? {};
      if (req.loan_id && payload2.previous_loan_payment_date) {
        await supabase.from("loans").update({ payment_date: payload2.previous_loan_payment_date }).eq("id", req.loan_id);
      }
      if (req.loan_id && payload2.payment_type === "total") {
        await supabase.from("loans").update({ status: "activo" }).eq("id", req.loan_id);
      }
      if (req.loan_id && payload2.payment_type === "interes") {
        const { data: renewed } = await supabase.from("loans").select("id").eq("renewed_from", req.loan_id);
        for (const r of renewed ?? []) {
          await supabase.from("loans").delete().eq("id", r.id);
        }
        await supabase.from("loans").update({ status: "activo" }).eq("id", req.loan_id);
      }
      if (payload2.payment_type === "total" && payload2.advisor_id && payload2.client_id) {
        await supabase.from("clients").update({ status: "activo", created_by: payload2.advisor_id }).eq("id", payload2.client_id);
      }
      const { error: e } = await supabase.from("payments").delete().eq("id", req.payment_id);
      if (e) throw e;
      break;
    }
    case "delete_loan": {
      if (!req.loan_id) throw new Error("Falta crédito");
      const { error: e } = await supabase.from("loans").delete().eq("id", req.loan_id);
      if (e) throw e;
      break;
    }
    case "delete_client": {
      if (!req.client_id) throw new Error("Falta cliente");
      const { error: e } = await supabase.from("clients").delete().eq("id", req.client_id);
      if (e) throw e;
      break;
    }
  }
}
export {
  REQUEST_LABELS as R,
  applyChangeRequest as a,
  createChangeRequest as c
};
