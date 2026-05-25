import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { createChangeRequest, REQUEST_LABELS, type ChangeRequestType } from "@/lib/changeRequests";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  trigger?: React.ReactNode;
  defaultType?: ChangeRequestType;
  clientId?: string | null;
  loanId?: string | null;
  paymentId?: string | null;
  clientName?: string;
  current?: { full_name?: string; phone?: string; email?: string; home_address?: string; work_address?: string };
}

const TYPES: ChangeRequestType[] = [
  "update_client",
  "increase_loan",
  "decrease_loan",
  "waive_mora",
  "delete_payment",
  "delete_loan",
  "delete_client",
];

const isAdditionalPayment = (p: { payment_type?: string | null; notes?: string | null }) =>
  p.payment_type === "adicional" ||
  (p.payment_type === "abono" && (p.notes ?? "").toLowerCase().includes("cobro adicional"));

export function NoveltyDialog({ trigger, defaultType, clientId, loanId, paymentId, clientName, current }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChangeRequestType>(defaultType ?? "update_client");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Campos para update_client
  const [fullName, setFullName] = useState(current?.full_name ?? "");
  const [phone, setPhone] = useState(current?.phone ?? "");
  const [email, setEmail] = useState(current?.email ?? "");
  const [home, setHome] = useState(current?.home_address ?? "");
  const [work, setWork] = useState(current?.work_address ?? "");

  // Campos para aumento/disminución
  const [newAmount, setNewAmount] = useState("");
  const [newExpected, setNewExpected] = useState("");

  // Para eliminar movimiento: lista de pagos del cliente
  const [payments, setPayments] = useState<Array<{ id: string; amount: number; payment_type: string; payment_date: string; notes: string | null }>>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(paymentId ?? "");

  // Crédito activo del cliente (para increase/decrease/waive_mora/delete_loan)
  const [activeLoan, setActiveLoan] = useState<{ id: string; amount: number; expected_amount: number } | null>(null);

  // Carga datos auxiliares cuando se abre el diálogo o cambia el tipo
  const loadAux = async (t: ChangeRequestType = type) => {
    if (!clientId) return;
    if (t === "delete_payment") {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("payments")
        .select("id, amount, payment_type, payment_date, notes")
        .eq("client_id", clientId)
        .eq("payment_date", today)
        .order("created_at", { ascending: false });
      setPayments((data ?? []) as any);
    }
    if (t === "increase_loan" || t === "decrease_loan" || t === "waive_mora" || t === "delete_loan") {
      const { data } = await supabase
        .from("loans")
        .select("id, amount, expected_amount, status, loan_date")
        .eq("client_id", clientId)
        .order("loan_date", { ascending: false })
        .limit(1);
      const l = (data ?? [])[0];
      if (l) {
        setActiveLoan({ id: l.id, amount: Number(l.amount), expected_amount: Number(l.expected_amount) });
        if (t === "increase_loan" || t === "decrease_loan") {
          setNewAmount(String(l.amount));
          setNewExpected(String(l.expected_amount));
        }
      } else {
        setActiveLoan(null);
      }
    }
  };

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Escribe un motivo");
      return;
    }
    let payload: Record<string, unknown> = {};
    let resolvedLoanId: string | null = loanId ?? null;
    let resolvedPaymentId: string | null = paymentId ?? null;
    if (type === "update_client") {
      if (fullName) payload.full_name = fullName;
      if (phone) payload.phone = phone;
      if (email) payload.email = email;
      if (home) payload.home_address = home;
      if (work) payload.work_address = work;
      if (Object.keys(payload).length === 0) {
        toast.error("Cambia al menos un dato");
        return;
      }
    }
    if (type === "increase_loan" || type === "decrease_loan") {
      const a = Number(newAmount);
      const e = Number(newExpected);
      if (!a || !e) {
        toast.error("Ingresa nuevo capital y monto a pagar");
        return;
      }
      if (!activeLoan) {
        toast.error("Este cliente no tiene un crédito para modificar");
        return;
      }
      resolvedLoanId = activeLoan.id;
      payload = {
        amount: a,
        expected_amount: e,
        previous_amount: activeLoan.amount,
        previous_expected: activeLoan.expected_amount,
      };
    }
    if (type === "waive_mora" || type === "delete_loan") {
      if (!activeLoan) {
        toast.error("Este cliente no tiene un crédito");
        return;
      }
      resolvedLoanId = activeLoan.id;
    }
    if (type === "delete_payment") {
      if (!selectedPaymentId) {
        toast.error("Selecciona el movimiento a eliminar");
        return;
      }
      resolvedPaymentId = selectedPaymentId;
      const p = payments.find((x) => x.id === selectedPaymentId);
      if (p) {
        // Buscamos el loan_id y la payment_date actual del crédito para poder revertir
        const { data: pay } = await supabase
  .from("payments")
  .select("loan_id")
  .eq("id", p.id)
  .maybeSingle();

let prevDate: string | null = null;
let renewedFrom: string | null = null;
let currentLoanId: string | null = null;

if (pay?.loan_id) {
  resolvedLoanId = pay.loan_id;
  currentLoanId = pay.loan_id;

  const { data: ln } = await supabase
    .from("loans")
    .select("payment_date, renewed_from")
    .eq("id", pay.loan_id)
    .maybeSingle();

  prevDate = ln?.payment_date ?? null;
  renewedFrom = ln?.renewed_from ?? null;
}

payload = {
  amount: p.amount,
  payment_type: p.payment_type,
  payment_date: p.payment_date,
  previous_loan_payment_date: prevDate,
  renewed_from: renewedFrom,
  current_loan_id: currentLoanId,
};
      }
    }

    setSaving(true);
    try {
      await createChangeRequest({
        request_type: type,
        client_id: clientId ?? null,
        loan_id: resolvedLoanId,
        payment_id: resolvedPaymentId,
        payload,
        reason,
      });
      toast.success("Novedad enviada al administrador");
      setOpen(false);
      setReason("");
    } catch (e: any) {
      toast.error(e.message ?? "Error al enviar novedad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) void loadAux(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" /> Enviar novedad
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar novedad al administrador</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {clientName && (
            <div className="text-sm text-muted-foreground">Cliente: <span className="font-medium text-foreground">{clientName}</span></div>
          )}
          <div>
            <Label>Tipo de novedad</Label>
            <Select value={type} onValueChange={(v) => { const nt = v as ChangeRequestType; setType(nt); void loadAux(nt); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{REQUEST_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "update_client" && (
            <div className="grid grid-cols-1 gap-2">
              <div><Label>Nombre completo</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Teléfono</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              </div>
              <div><Label>Dirección casa</Label><Input value={home} onChange={(e) => setHome(e.target.value)} /></div>
              <div><Label>Dirección trabajo</Label><Input value={work} onChange={(e) => setWork(e.target.value)} /></div>
            </div>
          )}

          {(type === "increase_loan" || type === "decrease_loan") && (
            <div className="space-y-2">
              {activeLoan ? (
                <div className="text-xs text-muted-foreground rounded-md bg-muted/40 px-2 py-1.5">
                  Crédito actual: capital <strong>{activeLoan.amount}</strong> · a pagar <strong>{activeLoan.expected_amount}</strong>
                </div>
              ) : (
                <div className="text-xs text-destructive">Este cliente no tiene crédito registrado.</div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Nuevo capital</Label><Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} /></div>
                <div><Label>Nuevo monto a pagar</Label><Input type="number" value={newExpected} onChange={(e) => setNewExpected(e.target.value)} /></div>
              </div>
            </div>
          )}

          {type === "delete_payment" && (
            <div>
              <Label>Movimiento a eliminar</Label>
              <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
                <SelectTrigger><SelectValue placeholder="Selecciona un pago" /></SelectTrigger>
                <SelectContent>
                  {payments.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.payment_date} · {isAdditionalPayment(p) ? "adicional" : p.payment_type} · ${p.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Para quitar un adicional, selecciona el movimiento marcado como adicional.
              </div>
              {payments.length === 0 && (
                <div className="text-xs text-muted-foreground mt-1">Este cliente no tiene movimientos.</div>
              )}
            </div>
          )}

          <div>
            <Label>Motivo</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explica al administrador por qué se necesita el cambio" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Enviando..." : "Enviar novedad"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
