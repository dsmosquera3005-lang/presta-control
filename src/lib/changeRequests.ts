import { supabase } from "@/integrations/supabase/client";

export type ChangeRequestType =
  | "update_client"
  | "increase_loan"
  | "decrease_loan"
  | "waive_mora"
  | "delete_payment"
  | "delete_loan"
  | "delete_client";

export const REQUEST_LABELS: Record<ChangeRequestType, string> = {
  update_client: "Actualizar datos de cliente",
  increase_loan: "Aumentar crédito",
  decrease_loan: "Disminuir crédito",
  waive_mora: "Quitar mora",
  delete_payment: "Eliminar movimiento / adicional",
  delete_loan: "Eliminar crédito",
  delete_client: "Eliminar cliente",
};

export interface CreateChangeRequestInput {
  request_type: ChangeRequestType;
  client_id?: string | null;
  loan_id?: string | null;
  payment_id?: string | null;
  payload?: Record<string, unknown>;
  reason?: string;
}

export async function createChangeRequest(input: CreateChangeRequestInput) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Sesión expirada");
  const { error } = await (supabase.from("change_requests") as any).insert({
    requested_by: uid,
    request_type: input.request_type,
    client_id: input.client_id ?? null,
    loan_id: input.loan_id ?? null,
    payment_id: input.payment_id ?? null,
    payload: input.payload ?? {},
    reason: input.reason ?? null,
  });
  if (error) throw error;
}

export async function applyChangeRequest(reqId: string): Promise<void> {
  const { data: req, error } = await (supabase
    .from("change_requests") as any)
    .select("*")
    .eq("id", reqId)
    .maybeSingle();
  if (error || !req) throw error ?? new Error("Solicitud no encontrada");

  const payload = (req.payload ?? {}) as Record<string, any>;

  switch (req.request_type as ChangeRequestType) {
    case "update_client": {
      if (!req.client_id) throw new Error("Falta cliente");
      const allowed = ["full_name", "phone", "email", "home_address", "work_address", "references_info"];
      const patch: Record<string, unknown> = {};
      for (const k of allowed) if (k in payload) patch[k] = payload[k];
      const { error: e } = await supabase.from("clients").update(patch as any).eq("id", req.client_id);
      if (e) throw e;
      break;
    }
    case "increase_loan":
    case "decrease_loan": {
      if (!req.loan_id) throw new Error("Falta crédito");
      const patch: Record<string, unknown> = {};
      if (payload.amount != null) patch.amount = payload.amount;
      if (payload.expected_amount != null) patch.expected_amount = payload.expected_amount;
      const { error: e } = await supabase.from("loans").update(patch as any).eq("id", req.loan_id);
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
      // Revertir la fecha de pago del crédito a la anterior si se conoce
      const payload = (req.payload ?? {}) as Record<string, any>;
      if (req.loan_id && payload.previous_loan_payment_date) {
        await supabase
          .from("loans")
          .update({ payment_date: payload.previous_loan_payment_date })
          .eq("id", req.loan_id);
      }
      // Si era un pago de "interes" (renovación), eliminar el crédito renovado
      // y reactivar el anterior para que desaparezca de Renovados.
      if (req.loan_id && payload.payment_type === "interes") {
        const { data: renewed } = await supabase
          .from("loans")
          .select("id")
          .eq("renewed_from", req.loan_id);
        for (const r of renewed ?? []) {
          await supabase.from("loans").delete().eq("id", (r as any).id);
        }
        await supabase.from("loans").update({ status: "activo" }).eq("id", req.loan_id);
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
