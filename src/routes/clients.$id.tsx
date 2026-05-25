import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, FileText, Calendar, Phone, Mail, MapPin, Pencil, RefreshCw, CheckCircle2, Ban, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ClientEditForm } from "@/components/ClientEditForm";
import { calcMora, totalDue } from "@/lib/mora";
import { cn } from "@/lib/utils";
import { NoveltyDialog } from "@/components/NoveltyDialog";

export const Route = createFileRoute("/clients/$id")({
  component: ClientDetailPage,
});

type ClientStatus = "activo" | "en_aviso" | "sacado";

interface ClientFull {
  id: string;
  cedula: string;
  full_name: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  home_address: string | null;
  work_address: string | null;
  references_info: string | null;
  profile_photo_url: string | null;
  cedula_front_url: string | null;
  cedula_back_url: string | null;
  utility_bill_url: string | null;
  payment_proof_url: string | null;
  status: ClientStatus;
  created_by: string;
}

interface Loan {
  id: string;
  amount: number;
  expected_amount: number;
  loan_date: string;
  payment_date: string;
  status: "activo" | "pagado" | "vencido";
  notes: string | null;
  created_by: string;
  mora_waived: boolean | null;
}

function ClientDetailPage() {
  const { id } = useParams({ from: "/clients/$id" });
  const { user, role } = useAuth();
  const [client, setClient] = useState<ClientFull | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
    const { data: l } = await supabase
    .from("loans")
    .select("id, amount, expected_amount, loan_date, payment_date, status, notes, created_by, mora_waived")
    .eq("client_id", id)
    .order("status", { ascending: true }) // activo primero
    .order("loan_date", { ascending: false });
    setClient(c as ClientFull | null);
    setLoans((l ?? []) as Loan[]);
    setLoading(false);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);

  const hasActiveLoan = loans.some((l) => l.status === "activo");
  const isAdmin = role === "admin";
  const isOwner = !!user && client?.created_by === user.id;
  // Solo el asesor dueño (o admin) puede operar sobre los préstamos del cliente.
  const canManage = isAdmin || isOwner;

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cliente no encontrado.</p>
          <Link to="/clients" className="text-primary underline mt-2 inline-block">
            Volver a clientes
          </Link>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to="/clients" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Clientes
        </Link>
      </div>

      
        <>
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {client.profile_photo_url ? (
            <img
              src={client.profile_photo_url}
              alt={client.full_name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">{client.full_name}</h1>
                <div className="text-muted-foreground">Cédula {client.cedula}</div>
                <div className="mt-2">
                  <ClientStatusControl
                    client={client}
                    isAdmin={isAdmin}
                    onChanged={load}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!isAdmin && isOwner && (
                  <NoveltyDialog
                    clientId={client.id}
                    clientName={client.full_name}
                    current={{
                      full_name: client.full_name,
                      phone: client.phone ?? "",
                      email: client.email ?? "",
                      home_address: client.home_address ?? "",
                      work_address: client.work_address ?? "",
                    }}
                  />
                )}
                
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
              {client.phone && <Info icon={<Phone className="h-3.5 w-3.5" />}>{client.phone}</Info>}
              {client.email && <Info icon={<Mail className="h-3.5 w-3.5" />}>{client.email}</Info>}
              {client.birth_date && (
                <Info icon={<Calendar className="h-3.5 w-3.5" />}>
                  {new Date(client.birth_date).toLocaleDateString("es")}
                </Info>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Direcciones y referencias
          </h2>
          <dl className="space-y-3 text-sm">
            <Pair label="Dirección casa" value={client.home_address} />
            <Pair label="Dirección trabajo" value={client.work_address} />
            <Pair label="Referencias" value={client.references_info} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documentos
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <DocLink url={client.cedula_front_url} label="Cédula (frente)" />
            <DocLink url={client.cedula_back_url} label="Cédula (reverso)" />
            <DocLink url={client.utility_bill_url} label="Servicio público" />
            <DocLink url={client.payment_proof_url} label="Comprobante" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Préstamos ({loans.length})</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={
                  client.status === "sacado" ||
                  hasActiveLoan ||
                  (client.status === "activo" && !canManage)
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo préstamo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar nuevo préstamo</DialogTitle>
              </DialogHeader>
              <NewLoanForm
                clientId={client.id}
                userId={user!.id}
                onCreated={() => {
                  setOpen(false);
                  void load();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {client.status === "sacado" && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-center gap-2">
            <Ban className="h-4 w-4" /> Cliente sacado: no se permiten nuevos préstamos.
          </div>
        )}
        {client.status !== "sacado" && hasActiveLoan && (
          <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Este cliente ya tiene un préstamo activo. Debe pagarlo o renovarlo antes de crear otro.
          </div>
        )}
        {client.status === "en_aviso" && (
          <div className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Cliente en aviso. Cualquier asesor puede reactivarlo.
          </div>
        )}

        {loans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aún no hay préstamos para este cliente.
          </p>
        ) : (
          <div className="space-y-3">
            {loans.map((l) => (
              <LoanRow
                key={l.id}
                loan={l}
                fmt={fmt}
                clientId={client.id}
                userId={user!.id}
                isAdmin={isAdmin}
                currentUserId={user!.id}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </Card>
        </>
      )
    </AppLayout>
  );
}

function Info({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5">{value || <span className="text-muted-foreground italic">No registrado</span>}</dd>
    </div>
  );
}

function DocLink({ url, label }: { url: string | null; label: string }) {
  if (!url) {
    return (
      <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground">
        {label}
        <div className="italic mt-0.5">No subido</div>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="p-3 rounded-md bg-primary/5 text-xs hover:bg-primary/10 transition-colors block"
    >
      <FileText className="h-3.5 w-3.5 inline mr-1" />
      {label}
      <div className="text-primary mt-0.5">Ver archivo</div>
    </a>
  );
}

const loanSchema = z.object({
  amount: z.number().positive(),
  expected_amount: z.number().positive(),
  payment_date: z.string().min(1),
});

function NewLoanForm({
  clientId,
  userId,
  onCreated,
}: {
  clientId: string;
  userId: string;
  onCreated: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [expected, setExpected] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().slice(0, 10);
  })();
  const [date, setDate] = useState(maxDate);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [rate, setRate] = useState<number>(20);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("interest_rate")
        .eq("id", true)
        .maybeSingle();
      setRate(Number(data?.interest_rate ?? 20));
    })();
  }, []);

  useEffect(() => {
    const a = Number(amount);
    if (Number.isFinite(a) && a > 0) {
      setExpected((a + (a * rate) / 100).toFixed(2));
    } else {
      setExpected("");
    }
  }, [amount, rate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loanSchema.safeParse({
      amount: Number(amount),
      expected_amount: Number(expected),
      payment_date: date,
    });
    if (!parsed.success) return toast.error("Revisa los montos y la fecha");

    const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

// Verificar si ya hubo una renovación hoy
const { data: renewedToday, error: renewCheckError } = await supabase
  .from("loans")
  .select("id")
  .eq("client_id", clientId)
  .not("renewed_from", "is", null)
  .gte("created_at", startOfDay.toISOString())
  .lte("created_at", endOfDay.toISOString())
  .limit(1);

if (renewCheckError) {
  return toast.error("Error validando renovaciones");
}

if (renewedToday && renewedToday.length > 0) {
  return toast.error("Este cliente ya fue renovado hoy");
}

    setSaving(true);
    const { error } = await supabase.from("loans").insert({
      client_id: clientId,
      amount: parsed.data.amount,
      expected_amount: parsed.data.expected_amount,
      payment_date: parsed.data.payment_date,
      notes: notes || null,
      created_by: userId,
    });
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    const { error: clientErr } = await supabase
      .from("clients")
      .update({ status: "activo", created_by: userId })
      .eq("id", clientId);
    setSaving(false);
    if (clientErr) return toast.error(clientErr.message);
    toast.success("Préstamo registrado");
    onCreated();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Monto prestado</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Monto esperado</Label>
          <Input type="number" step="0.01" value={expected} readOnly required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Fecha de pago</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} max={maxDate} required />
        <p className="text-xs text-muted-foreground">Máximo 20 días desde hoy.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando..." : "Registrar préstamo"}
      </Button>
    </form>
  );
}

function LoanRow({
  loan,
  fmt,
  clientId,
  userId,
  isAdmin,
  currentUserId,
  onChanged,
}: {
  loan: Loan;
  fmt: (n: number) => string;
  clientId: string;
  userId: string;
  isAdmin: boolean;
  currentUserId: string;
  onChanged: () => void;
}) {
  const overdue = loan.status === "activo" && new Date(loan.payment_date) < new Date();
  const status = overdue ? "vencido" : loan.status;
  const tones = {
    activo: "bg-primary/10 text-primary border-primary/30",
    pagado: "bg-success/15 text-success border-success/30",
    vencido: "bg-destructive/10 text-destructive border-destructive/30",
  } as const;
  const [renewOpen, setRenewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ClientStatus>("en_aviso");
  const [paying, setPaying] = useState(false);
  const [waiving, setWaiving] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);

  const mora = calcMora(loan);
  const totalACobrar = totalDue(Number(loan.expected_amount), mora.fee);

  // Solo el asesor que prestó (o admin) puede cobrar / renovar / poner en aviso o sacado.
  const canActOnLoan = isAdmin || loan.created_by === currentUserId;

  const confirmPayTotal = async () => {
    setPaying(true);
    const { error: loanErr } = await supabase
      .from("loans")
      .update({ status: "pagado" })
      .eq("id", loan.id);
    if (loanErr) {
      setPaying(false);
      return toast.error(loanErr.message);
    }
    const { error: clientErr } = await supabase
      .from("clients")
      .update({ status: nextStatus })
      .eq("id", clientId);
    if (!clientErr) {
      await supabase.from("payments").insert({
        loan_id: loan.id,
        client_id: clientId,
        advisor_id: currentUserId,
        payment_type: "total",
        amount: totalACobrar,
        notes: mora.fee > 0 ? `Incluye mora ${mora.percent}% (${mora.fee})` : null,
      });
    }
    setPaying(false);
    if (clientErr) return toast.error(clientErr.message);
    toast.success("Pago total registrado");
    setPayOpen(false);
    onChanged();
  };

  const toggleWaiveMora = async () => {
    setWaiving(true);
    const { error } = await supabase
      .from("loans")
      .update({ mora_waived: !loan.mora_waived })
      .eq("id", loan.id);
    setWaiving(false);
    if (error) return toast.error(error.message);
    toast.success(loan.mora_waived ? "Mora reactivada" : "Mora anulada");
    onChanged();
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <div className="font-semibold">{fmt(Number(loan.amount))} → {fmt(Number(loan.expected_amount))}</div>
          <div className="text-xs text-muted-foreground">
            Prestado: {new Date(loan.loan_date).toLocaleDateString("es")} · Pago: {new Date(loan.payment_date).toLocaleDateString("es")}
          </div>
        </div>
        <Badge variant="outline" className={tones[status as keyof typeof tones]}>
          {status}
        </Badge>
      </div>
      {loan.status !== "pagado" && (mora.days > 0 || mora.waived) && (
        <div className={cn(
          "mt-2 rounded-md px-3 py-2 text-xs flex items-center justify-between gap-2 border",
          mora.waived
            ? "border-success/30 bg-success/10 text-success"
            : mora.fee > 0
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-warning/30 bg-warning/10 text-warning"
        )}>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            {mora.waived
              ? `Mora anulada (${mora.days}d de atraso)`
              : mora.fee > 0
                ? `${mora.days}d en mora · Recargo ${mora.percent}% = ${fmt(mora.fee)}`
                : `${mora.days}d de atraso · sin recargo aún`}
          </span>
          {mora.fee > 0 && !mora.waived && (
            <span className="font-semibold">Total: {fmt(totalACobrar)}</span>
          )}
        </div>
      )}
      {loan.notes && <p className="text-sm text-muted-foreground mt-1">{loan.notes}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {loan.status !== "pagado" && canActOnLoan && (
          <>
          <Dialog open={additionalOpen} onOpenChange={setAdditionalOpen}>
  <DialogTrigger asChild>
    <Button size="sm" variant="outline">
      <Plus className="mr-1.5 h-4 w-4" /> Adicional
    </Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Registrar adicional</DialogTitle>
    </DialogHeader>

    <AdditionalLoanForm
      loan={loan}
      clientId={clientId}
      userId={userId}
      onDone={() => {
        setAdditionalOpen(false);
        onChanged();
      }}
    />
  </DialogContent>
</Dialog>

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Pagar total
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar pago total</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ¿Estás seguro de marcar este crédito como pagado en su totalidad?
                    Esta acción cerrará el préstamo.
                  </p>
                  <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Cuota esperada</span><span>{fmt(Number(loan.expected_amount))}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Recargo mora ({mora.percent}%)</span><span className={mora.fee > 0 ? "text-destructive font-semibold" : ""}>{fmt(mora.fee)}</span></div>
                    <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold">Total a cobrar</span><span className="font-bold text-primary">{fmt(totalACobrar)}</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado del cliente después del pago</Label>
                    <Select
                      value={nextStatus}
                      onValueChange={(v) => setNextStatus(v as ClientStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_aviso">En aviso (cualquier asesor puede reactivarlo)</SelectItem>
                        <SelectItem value="sacado">Sacado (solo admin puede reactivar)</SelectItem>
                      </SelectContent>
                    </Select>
                    {nextStatus === "sacado" && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <Ban className="h-3 w-3" /> Solo un administrador podrá reactivarlo.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>
                      Cancelar
                    </Button>
                    <Button onClick={confirmPayTotal} disabled={paying}>
                      {paying ? "Guardando..." : "Confirmar pago"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Renovar (solo interés)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renovar crédito</DialogTitle>
                </DialogHeader>
                <RenewLoanForm
                  loan={loan}
                  clientId={clientId}
                  userId={userId}
                  onDone={() => {
                    setRenewOpen(false);
                    onChanged();
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
        {loan.status !== "pagado" && isAdmin && (mora.days >= 5 || mora.waived) && (
          <Button size="sm" variant="outline" onClick={toggleWaiveMora} disabled={waiving}>
            <Ban className="mr-1.5 h-4 w-4" />
            {loan.mora_waived ? "Reactivar mora" : "Anular mora y días"}
          </Button>
        


        )}
      </div>
    </div>



  );

  
}
function AdditionalLoanForm({
  loan,
  clientId,
  userId,
  onDone,
}: {
  loan: Loan;
  clientId: string;
  userId: string;
  onDone: () => void;
}) {
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [rate, setRate] = useState<number>(20);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("interest_rate")
        .eq("id", true)
        .maybeSingle();

      setRate(Number(data?.interest_rate ?? 20));
    })();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const adicional = Number(additionalAmount || 0);
  
  const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!adicional || adicional <= 0) {
    return toast.error("Ingresa un valor válido");
  }

  setSaving(true);

  // Registrar únicamente el movimiento adicional
  const { error } = await supabase.from("payments").insert({
    loan_id: loan.id,
    client_id: clientId,
    advisor_id: userId,
    payment_type: "abono",
    amount: adicional,
    notes: `Cobro adicional`,
  });

  setSaving(false);

  if (error) {
    return toast.error(error.message);
  }

  toast.success("Adicional registrado");
  onDone();
};
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-md bg-muted/40 p-3 text-sm">
  Este valor será registrado como un cobro adicional y se sumará en caja del día.
</div>

      <div className="space-y-1.5">
        <Label>Monto adicional</Label>

        <Input
          type="number"
          step="0.01"
          value={additionalAmount}
          onChange={(e) => setAdditionalAmount(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Procesando..." : "Confirmar adicional"}
      </Button>
    </form>
  );
}


function ClientStatusControl({
  client,
  isAdmin,
  onChanged,
}: {
  client: ClientFull;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [activateOpen, setActivateOpen] = useState(false);
  const tones: Record<ClientStatus, string> = {
    activo: "bg-success/15 text-success border-success/30",
    en_aviso: "bg-warning/15 text-warning border-warning/30",
    sacado: "bg-destructive/10 text-destructive border-destructive/30",
  };
  const labels: Record<ClientStatus, string> = {
    activo: "Activo",
    en_aviso: "En aviso",
    sacado: "Sacado",
  };

  const lockedForNonAdmin = client.status === "sacado" && !isAdmin;

  const change = async (next: ClientStatus) => {
    if (next === client.status) return;
    setSaving(true);
    // Si un asesor reactiva un cliente "en aviso", toma la propiedad del cliente.
    const updatePayload: { status: ClientStatus; created_by?: string } = { status: next };
    if (
      !isAdmin &&
      user &&
      client.status === "en_aviso" &&
      next === "activo"
    ) {
      updatePayload.created_by = user.id;
    }
    const { error } = await supabase
      .from("clients")
      .update(updatePayload)
      .eq("id", client.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Estado cambiado a ${labels[next]}`);
    onChanged();
  };

  if (lockedForNonAdmin) {
    return (
      <Badge variant="outline" className={tones.sacado}>
        {labels.sacado}
      </Badge>
    );
  }

  // Los asesores normalmente no cambian el estado manualmente, EXCEPTO:
  // pueden "Activar" un cliente que está en aviso (toma la propiedad del cliente).
  if (!isAdmin) {
    if (client.status === "en_aviso") {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={tones.en_aviso}>
            {labels.en_aviso}
          </Badge>
          <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" disabled={saving}>
                Activar cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Activar cliente y registrar préstamo</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Al registrar el préstamo, el cliente pasará a estar activo bajo tu cuenta.
              </p>
              {user && (
                <NewLoanForm
                  clientId={client.id}
                  userId={user.id}
                  onCreated={() => {
                    setActivateOpen(false);
                    onChanged();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    return (
      <Badge variant="outline" className={tones[client.status]}>
        {labels[client.status]}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={tones[client.status]}>
        {labels[client.status]}
      </Badge>
      <Select
        value={client.status}
        onValueChange={(v) => change(v as ClientStatus)}
        disabled={saving}
      >
        <SelectTrigger className="h-7 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="en_aviso">En aviso</SelectItem>
          {isAdmin && <SelectItem value="sacado">Sacado</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}

function RenewLoanForm({
  loan,
  clientId,
  userId,
  onDone,
}: {
  loan: Loan;
  clientId: string;
  userId: string;
  onDone: () => void;
}) {
  const [rate, setRate] = useState<number>(20);
  const [interest, setInterest] = useState<string>("");
  const moraInfo = calcMora(loan);
  const moraFee = moraInfo.fee;
  const today = new Date().toISOString().slice(0, 10);
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().slice(0, 10);
  })();
  const [nextDate, setNextDate] = useState<string>(maxDate);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("interest_rate")
        .eq("id", true)
        .maybeSingle();
      const r = Number(data?.interest_rate ?? 20);
      setRate(r);
      const baseInteres = (Number(loan.amount) * r) / 100;
      setInterest((baseInteres + moraFee).toFixed(2));
    })();
  }, [loan.amount, moraFee]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  const interestNum = Number(interest);
  if (!Number.isFinite(interestNum) || interestNum <= 0)
    return toast.error("Monto de interés inválido");
  if (!nextDate) return toast.error("Selecciona la próxima fecha de pago");

  setSaving(true);

  // 1) Validar si ya se realizó una renovación el día de hoy para este cliente
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data: renewedToday, error: renewCheckError } = await supabase
    .from("loans")
    .select("id")
    .eq("client_id", clientId)
    .not("renewed_from", "is", null)
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString())
    .limit(1);

  if (renewCheckError) {
    setSaving(false);
    return toast.error("Error validando renovaciones de hoy");
  }

  if (renewedToday && renewedToday.length > 0) {
    setSaving(false);
    return toast.error("Este cliente ya tuvo una renovación de interés el día de hoy");
  }

  // 2) Marcar préstamo anterior como pagado
  const { error: e1 } = await supabase
    .from("loans")
    .update({ status: "pagado" })
    .eq("id", loan.id);
    
  if (e1) {
    setSaving(false);
    return toast.error(e1.message);
  }

  // 3) Crear nuevo préstamo con mismo capital
  const newExpected = Number(loan.amount) + interestNum;
  const { error: e2 } = await supabase.from("loans").insert({
    client_id: clientId,
    created_by: userId,
    amount: Number(loan.amount),
    expected_amount: newExpected,
    payment_date: nextDate,
    notes: notes || `Renovación. Interés pagado: ${fmt(interestNum)}`,
    renewed_from: loan.id,
    interest_paid: interestNum,
  });

  if (e2) {
    setSaving(false);
    return toast.error(e2.message);
  }

  // 4) Registrar el pago del interés en la tabla de pagos
  await supabase.from("payments").insert({
    loan_id: loan.id,
    client_id: clientId,
    advisor_id: userId,
    payment_type: "interes",
    amount: interestNum,
  });

  setSaving(false);
  toast.success("Crédito renovado");
  onDone();
};

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
        <div>Capital actual: <strong>{fmt(Number(loan.amount))}</strong></div>
        <div className="text-muted-foreground text-xs">Tasa configurada: {rate}%</div>
        {moraFee > 0 && (
          <div className="text-destructive text-xs">
            Mora ({moraInfo.days} días, {moraInfo.percent}%): <strong>{fmt(moraFee)}</strong> incluida en el servicio
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Servicio a pagar {moraFee > 0 ? "(interés + mora)" : ""}</Label>
        <Input
          type="number"
          step="0.01"
          value={interest}
          readOnly
          required
        />
        <p className="text-xs text-muted-foreground">
          Calculado automáticamente: capital × {rate}%{moraFee > 0 ? " + mora acumulada" : ""}.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Próxima fecha de pago</Label>
        <Input
          type="date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          min={today}
          max={maxDate}
          required
        />
        <p className="text-xs text-muted-foreground">Máximo 20 días desde hoy.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="text-sm text-muted-foreground">
        Nuevo monto esperado: <strong className="text-foreground">{fmt(Number(loan.amount) + (Number(interest) || 0))}</strong>
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Procesando..." : "Confirmar renovación"}
      </Button>
    </form>
  );
}
