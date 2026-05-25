import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Send, Check, X, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/cash")({
  component: CashPage,
});

interface Advisor { id: string; full_name: string; email: string }

interface PaymentRow {
  id: string;
  loan_id: string;
  client_id: string;
  advisor_id: string;
  payment_type: "interes" | "total" | "renovacion" | "abono" | "adicional";
  amount: number;
  payment_date: string;
  notes?: string | null;
  clients: { full_name: string; cedula: string } | null;
  loanCapital?: number;
  loanExpected?: number;
}

type PaymentType = PaymentRow["payment_type"];

interface LoanRow {
  id: string;
  amount: number;
  loan_date: string;
  created_by: string;
  renewed_from: string | null;
  client_id: string;
  clients: { full_name: string; cedula: string } | null;
  isReactivation?: boolean;
}

interface BaseRow {
  id?: string;
  advisor_id: string;
  date: string;
  base_amount: number;
  additional_amount?: number;
  manual_adjustment: number;
  notes: string | null;
}

interface TransferRow {
  id: string;
  from_advisor: string;
  to_advisor: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  transfer_date: string;
  notes: string | null;
  created_at: string;
}

interface ApprovedNovelty {
  id: string;
  request_type: "increase_loan" | "decrease_loan" | "delete_payment" | string;
  client_id: string | null;
  loan_id: string | null;
  payment_id: string | null;
  payload: Record<string, any>;
  reviewed_at: string | null;
  requested_by: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const isAdditionalPayment = (p: Pick<PaymentRow, "payment_type" | "notes">) =>
  p.payment_type === "adicional" || (
    p.payment_type === "abono" &&
    (p.notes ?? "").toLowerCase().includes("cobro adicional")
  );

function CashPage() {
  const { user, role, loading } = useAuth();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  const [advisorName, setAdvisorName] = useState<string>("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [newLoans, setNewLoans] = useState<LoanRow[]>([]);
  const [bases, setBases] = useState<BaseRow[]>([]);
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [novelties, setNovelties] = useState<ApprovedNovelty[]>([]);
  const [noveltyClients, setNoveltyClients] = useState<Record<string, string>>({});

  const isAdmin = role === "admin";

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!isAdmin) setSelectedAdvisor(user.id);
    void loadAdvisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isAdmin]);

  useEffect(() => {
    if (!user) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedAdvisor, isAdmin, user]);

  const loadAdvisors = async () => {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_active");
    const allProfiles = (profs ?? []).filter((p) => p.is_active !== false);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const rolesMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    const seenRoles = rolesMap.size;
    const advisorList = seenRoles >= allProfiles.length
      ? allProfiles.filter((p) => rolesMap.get(p.id) === "asesor")
      : allProfiles.filter((p) => rolesMap.get(p.id) !== "admin");
    setAdvisors(advisorList.map(({ id, full_name, email }) => ({ id, full_name, email })));
  };

  const loadData = async () => {
    const targetId = isAdmin ? selectedAdvisor : user?.id ?? "";
    if (targetId) {
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", targetId).maybeSingle();
      setAdvisorName(prof?.full_name ?? "");
    }
    let pq = supabase
      .from("payments")
      .select("id, loan_id, client_id, advisor_id, payment_type, amount, payment_date, notes")
      .eq("payment_date", date);
    if (!isAdmin && user) pq = pq.eq("advisor_id", user.id);
    else if (isAdmin && selectedAdvisor) pq = pq.eq("advisor_id", selectedAdvisor);
    const { data: pays } = await pq.order("created_at", { ascending: false });

    let lq = supabase
      .from("loans")
      .select("id, amount, loan_date, created_by, client_id, renewed_from")
      .eq("loan_date", date);
    if (!isAdmin && user) lq = lq.eq("created_by", user.id);
    else if (isAdmin && selectedAdvisor) lq = lq.eq("created_by", selectedAdvisor);
    const { data: ls } = await lq.order("created_at", { ascending: false });

    // Para distinguir Nuevos vs Activados: un cliente cuenta como "Nuevo"
    // solo si este es su primer préstamo. Si ya tenía préstamos previos
    // (sin estar renovando uno hoy) cuenta como "Activado".
    const newLoanClientIds = Array.from(new Set(
      (ls ?? []).filter((l) => !l.renewed_from).map((l) => l.client_id)
    ));
    let priorLoansByClient: Record<string, number> = {};
    if (newLoanClientIds.length > 0) {
      const { data: prior } = await supabase
        .from("loans")
        .select("id, client_id, loan_date")
        .in("client_id", newLoanClientIds)
        .lt("loan_date", date);
      for (const r of prior ?? []) {
        priorLoansByClient[r.client_id] = (priorLoansByClient[r.client_id] ?? 0) + 1;
      }
    }

    const clientIds = Array.from(new Set([
      ...((pays ?? []).map((p) => p.client_id)),
      ...((ls ?? []).map((l) => l.client_id)),
    ]));
    let clientsMap: Record<string, { full_name: string; cedula: string }> = {};
    if (clientIds.length > 0) {
      const { data: cs } = await supabase
        .from("clients")
        .select("id, full_name, cedula")
        .in("id", clientIds);
      clientsMap = Object.fromEntries((cs ?? []).map((c) => [c.id, { full_name: c.full_name, cedula: c.cedula }]));
    }
    // Cargar capital/expected de los créditos relacionados con pagos (para "total")
    const loanIds = Array.from(new Set((pays ?? []).map((p) => p.loan_id).filter(Boolean)));
    let loansMap: Record<string, { amount: number; expected_amount: number }> = {};
    if (loanIds.length > 0) {
      const { data: lz } = await supabase
        .from("loans")
        .select("id, amount, expected_amount")
        .in("id", loanIds);
      loansMap = Object.fromEntries((lz ?? []).map((l) => [l.id, { amount: Number(l.amount), expected_amount: Number(l.expected_amount) }]));
    }
    setPayments((pays ?? []).map((p) => ({
      ...p,
      clients: clientsMap[p.client_id] ?? null,
      loanCapital: loansMap[p.loan_id]?.amount,
      loanExpected: loansMap[p.loan_id]?.expected_amount,
    })) as PaymentRow[]);
    setNewLoans((ls ?? []).map((l) => ({
      ...l,
      clients: clientsMap[l.client_id] ?? null,
      isReactivation: !l.renewed_from && (priorLoansByClient[l.client_id] ?? 0) > 0,
    })) as LoanRow[]);

    let bq = supabase
      .from("advisor_daily_base")
      .select("id, advisor_id, date, base_amount, additional_amount, manual_adjustment, notes")
      .eq("date", date);
    if (!isAdmin && user) bq = bq.eq("advisor_id", user.id);
    else if (isAdmin && selectedAdvisor) bq = bq.eq("advisor_id", selectedAdvisor);
    const { data: bs } = await bq;
    setBases((bs ?? []) as BaseRow[]);

    let tq = supabase
      .from("cash_transfers")
      .select("id, from_advisor, to_advisor, amount, status, transfer_date, notes, created_at")
      .eq("transfer_date", date)
      .order("created_at", { ascending: false });
    const focus = isAdmin ? selectedAdvisor : user?.id;
    if (focus) tq = tq.or(`from_advisor.eq.${focus},to_advisor.eq.${focus}`);
    const { data: ts } = await tq;
    setTransfers((ts ?? []) as TransferRow[]);

    // Novedades aprobadas en el día (ajustes a caja)
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;
    let nq = (supabase.from("change_requests") as any)
      .select("id, request_type, client_id, loan_id, payment_id, payload, reviewed_at, requested_by, status")
      .eq("status", "approved")
      .gte("reviewed_at", dayStart)
      .lte("reviewed_at", dayEnd);
    if (!isAdmin && user) nq = nq.eq("requested_by", user.id);
    else if (isAdmin && selectedAdvisor) nq = nq.eq("requested_by", selectedAdvisor);
    const { data: ns } = await nq;
    setNovelties((ns ?? []) as ApprovedNovelty[]);
    const novClientIds = Array.from(new Set(((ns ?? []) as ApprovedNovelty[])
      .map((n) => n.client_id).filter(Boolean) as string[]));
    if (novClientIds.length > 0) {
      const { data: ncs } = await supabase.from("clients").select("id, full_name").in("id", novClientIds);
      setNoveltyClients(Object.fromEntries((ncs ?? []).map((c: any) => [c.id, c.full_name])));
    } else {
      setNoveltyClients({});
    }
  };

  const targetAdvisorId = isAdmin ? selectedAdvisor : (user?.id ?? "");
  const baseRow = useMemo(
    () => bases.find((b) => b.advisor_id === targetAdvisorId),
    [bases, targetAdvisorId]
  );

  const totals = useMemo(() => {
    
    const interes = payments.filter((p) => p.payment_type === "interes").reduce((s, p) => s + Number(p.amount), 0);
    const totalPagos = payments.filter((p) => p.payment_type === "total").reduce((s, p) => s + Number(p.amount), 0);
    const abonos = payments.filter((p) => p.payment_type === "abono" && !isAdditionalPayment(p)).reduce((s, p) => s + Number(p.amount), 0);
    const renovaciones = payments.filter((p) => p.payment_type === "renovacion").reduce((s, p) => s + Number(p.amount), 0);
    const adicionales = payments.filter(isAdditionalPayment).reduce((s, p) => s + Number(p.amount), 0);
    
    // Clientes que pagaron completo: capital del crédito y su interés
    const completos = payments.filter((p) => p.payment_type === "total");
    const retirados = completos.filter((p) =>
      (p.notes ?? "").toLowerCase().includes("sacado")
    );

    const retiradosCapital = retirados.reduce(
      (s, p) => s + Number(p.loanCapital ?? 0),
      0
    );
    const completosCapital = completos.reduce((s, p) => s + Number(p.loanCapital ?? 0), 0);
    const completosInteres = completos.reduce((s, p) => {
      const cap = Number(p.loanCapital ?? 0);
      const paid = Number(p.amount);
      return s + Math.max(0, paid - cap);
    }, 0);
    // Mora: pagos "total" cuya nota incluye 'mora' — aproximamos con notas
    const moraCobrada = payments
      .filter((p) => (p.notes ?? "").toLowerCase().includes("mora"))
      .reduce((s, p) => {
        const m = (p.notes ?? "").match(/\(([\d.]+)\)/);
        return s + (m ? Number(m[1]) : 0);
      }, 0);

    const recaudoTotal = interes + totalPagos + abonos + renovaciones;

    const prestadoNuevos = newLoans
      .filter((l) => !l.renewed_from)
      .reduce((s, l) => s + Number(l.amount), 0);
    const renovados = newLoans.filter((l) => !!l.renewed_from);
    const renovadosCount = renovados.length;
    const nuevos = newLoans.filter((l) => !l.renewed_from && !l.isReactivation);
    const nuevosCount = nuevos.length;
    const activados = newLoans.filter((l) => !l.renewed_from && l.isReactivation);
    const activadosCount = activados.length;
    const prestadoActivados = activados.reduce((s, l) => s + Number(l.amount), 0);
    const prestadoSoloNuevos = nuevos.reduce((s, l) => s + Number(l.amount), 0);

    const base = Number(baseRow?.base_amount ?? 0);
    const adicionalManual = Number(baseRow?.additional_amount ?? 0);
    const adicional = adicionales + adicionalManual;
    const ajusteManual = Number(baseRow?.manual_adjustment ?? 0);

    const recibido = transfers
      .filter((t) => t.status === "approved" && t.to_advisor === targetAdvisorId)
      .reduce((s, t) => s + Number(t.amount), 0);
    const enviado = transfers
      .filter((t) => t.status === "approved" && t.from_advisor === targetAdvisorId)
      .reduce((s, t) => s + Number(t.amount), 0);

    // Ajustes por novedades aprobadas del día
    let aumentos = 0;       // suma de incrementos de capital → resta a entrega
    let disminuciones = 0;  // suma de decrementos de capital → suma a entrega
    for (const n of novelties) {
      const p = n.payload ?? {};
      if (n.request_type === "increase_loan") {
        const delta = Number(p.amount ?? 0) - Number(p.previous_amount ?? 0);
        if (delta > 0) aumentos += delta;
      } else if (n.request_type === "decrease_loan") {
        const delta = Number(p.previous_amount ?? 0) - Number(p.amount ?? 0);
        if (delta > 0) disminuciones += delta;
      }
    }

    // Entrega final =
    //   base + recaudo - prestado + adicional + ajusteManual + recibido - enviado
    //   + disminuciones (capital que ya no se entregó)
    //   - aumentos (capital extra entregado)
    //   - pagosEliminados (ese dinero realmente no se cobró)
    const entrega =
      base + recaudoTotal - prestadoNuevos + adicional + ajusteManual + recibido - enviado +
      disminuciones - aumentos;

    return {
      interes, totalPagos, abonos, renovaciones, recaudoTotal, moraCobrada,
      prestadoNuevos, renovadosCount, nuevosCount,
      activadosCount, prestadoActivados, activados, prestadoSoloNuevos,
      base, adicional, ajusteManual, recibido, enviado,
      aumentos, disminuciones, entrega,retirados, retiradosCapital,
      nuevos, renovados, completos, completosCapital, completosInteres,
    };
  }, [payments, newLoans, baseRow, transfers, targetAdvisorId, novelties]);

  if (loading) return <AppLayout><div className="text-center py-12 text-muted-foreground">Cargando...</div></AppLayout>;

  const dateLabel = new Date(date + "T00:00:00").toLocaleString("es", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <AppLayout>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{advisorName || "Caja"}</h1>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
      </header>

      {isAdmin && (
        <Card className="p-3 mb-4">
          <Tabs value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
            <TabsList className="flex-wrap h-auto">
              {advisors.map((a) => (
                <TabsTrigger key={a.id} value={a.id}>{a.full_name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {!selectedAdvisor && advisors.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Selecciona un asesor para ver su caja.</p>
          )}
        </Card>
      )}

      {targetAdvisorId ? (
        <Card className="p-0 overflow-hidden">
          <Accordion type="multiple" className="divide-y">
            <Row icon="💼" title="Base" value={fmt(totals.base)}>
              <BasePanel
                isAdmin={isAdmin}
                advisorId={targetAdvisorId}
                date={date}
                base={baseRow}
                onSaved={loadData}
              />
            </Row>

            <Row icon="🚩" title="Recaudo Total" value={fmt(totals.recaudoTotal)} highlight="success">
              <RowList
                items={payments.map((p) => ({
                  key: p.id,
                  title: p.clients?.full_name ?? "—",
                  subtitle: `${p.payment_type} · ${p.clients?.cedula ?? "—"}`,
                  right: fmt(Number(p.amount)),
                  actions: isAdmin ? <AdminPaymentActions payment={p} advisors={advisors} onChanged={loadData} /> : null,
                }))}
                empty="Sin pagos en esta fecha."
              />
            </Row>

            <Row icon="🟡" title="Cobro Mora" value={fmt(totals.moraCobrada)} />

            <Row icon="🛍️" title="Adicional" value={fmt(totals.adicional)}>
              <div className="text-sm text-muted-foreground">
                Adicional: {fmt(totals.adicional)}
              </div>
              <AdditionalPanel
                isAdmin={isAdmin}
                advisorId={targetAdvisorId}
                date={date}
                base={baseRow}
                onSaved={loadData}
              />
            </Row>

            <Row icon="🛡️" title="Entrega Final" value={fmt(totals.entrega)} highlight="primary">
              <div className="text-sm space-y-1">
                <Line label="Base" value={fmt(totals.base)} />
                <Line label="+ Recaudo" value={fmt(totals.recaudoTotal)} />
                <Line label="− Prestado" value={fmt(totals.prestadoNuevos)} />
                <Line label="− Aumentos" value={fmt(totals.aumentos)} />
                <Line label="+ Adicional" value={fmt(totals.adicional)} />
                <Line label="+ Recibido" value={fmt(totals.recibido)} />
                <Line label="− Enviado" value={fmt(totals.enviado)} />
                <Line label="+ Ajuste manual" value={fmt(totals.ajusteManual)} />
                <Line label="= Entrega" value={fmt(totals.entrega)} bold />
              </div>
            </Row>

        <Row
  icon="👥"
  title="Clientes Capital"
  value={`${totals.completos.length} - ${fmt(totals.completosCapital + totals.disminuciones)}`}
>
  <RowList
    items={totals.completos.map((p) => ({
      key: p.id,
      title: p.clients?.full_name ?? "—",
      subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
      right: fmt(Number(p.loanCapital ?? 0)),
      actions: isAdmin ? <AdminPaymentActions payment={p} advisors={advisors} onChanged={loadData} /> : null,
    }))}
    empty="Sin clientes que pagaron completo."
  />

  {totals.disminuciones > 0 && (
    <div className="mt-3">
      <div className="text-sm font-medium mb-2">
        Disminuciones de crédito
      </div>

      <NoveltyList
        list={novelties.filter((n) => n.request_type === "decrease_loan")}
        clientNames={noveltyClients}
      />
    </div>
  )}
</Row>
            <Row icon="👥" title="Pago Servicio" value={`${totals.completos.length} - ${fmt(totals.completosInteres)}`}>
              <RowList
                items={totals.completos.map((p) => ({
                  key: p.id,
                  title: p.clients?.full_name ?? "—",
                  subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
                  right: fmt(Math.max(0, Number(p.amount) - Number(p.loanCapital ?? 0))),
                  actions: isAdmin ? <AdminPaymentActions payment={p} advisors={advisors} onChanged={loadData} /> : null,
                }))}
                empty="Sin interés cobrado."
              />
            </Row>

            <Row icon="👤" title="Aumentos" value={fmt(totals.aumentos)}>
              <NoveltyList list={novelties.filter((n) => n.request_type === "increase_loan")} clientNames={noveltyClients} />
            </Row>

            <Row icon="📕" title="Renovados" value={`${totals.renovadosCount} - ${fmt(totals.renovaciones)}`}>
              <RowList
                items={totals.renovados.map((l) => ({
                  key: l.id,
                  title: l.clients?.full_name ?? "—",
                  subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
                  right: fmt(Number(l.amount)),
                  actions: isAdmin ? <AdminLoanActions loan={l} advisors={advisors} onChanged={loadData} /> : null,
                }))}
                empty="Sin renovaciones."
              />
            </Row>

            <Row icon="👤" title="Nuevos" value={`${totals.nuevosCount} - ${fmt(totals.prestadoSoloNuevos)}`}>
              <RowList
                items={totals.nuevos.map((l) => ({
                  key: l.id,
                  actions: isAdmin ? <AdminLoanActions loan={l} advisors={advisors} onChanged={loadData} /> : null,
                  title: l.clients?.full_name ?? "—",
                  subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
                  right: fmt(Number(l.amount)),
                }))}
                empty="No se entregaron préstamos."
              />
            </Row>

            <Row icon="👤" title="Activados" value={`${totals.activadosCount} - ${fmt(totals.prestadoActivados)}`}>
              <RowList
                items={totals.activados.map((l) => ({
                  key: l.id,
                  actions: isAdmin ? <AdminLoanActions loan={l} advisors={advisors} onChanged={loadData} /> : null,
                  title: l.clients?.full_name ?? "—",
                  subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
                  right: fmt(Number(l.amount)),
                }))}
                empty="Sin clientes activados."
              />
            </Row>

            <Row icon="📞" title="Avisas" value={"0"} />

            <Row
            icon="🏅"
            title="Retirados"
            value={`${totals.retirados.length} - ${fmt(totals.retiradosCapital)}`}
          >
            <RowList
              items={totals.retirados.map((p) => ({
                key: p.id,
                title: p.clients?.full_name ?? "—",
                subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
                right: fmt(Number(p.loanCapital ?? 0)),
                actions: isAdmin ? <AdminPaymentActions payment={p} advisors={advisors} onChanged={loadData} /> : null,
              }))}
              empty="Sin clientes retirados."
            />
          </Row>

            <Row icon="📊" title="Diferencia" value={fmt(totals.ajusteManual)} />

            <Row icon="🩸" title="Gastos" value={"0"} />

            <Row icon="📕" title="Entrega" value={fmt(totals.enviado)}>
              <TransfersPanel
                currentUserId={user?.id ?? ""}
                targetAdvisorId={targetAdvisorId}
                isAdmin={isAdmin}
                advisors={advisors}
                transfers={transfers}
                recibido={totals.recibido}
                enviado={totals.enviado}
                date={date}
                onChanged={loadData}
              />
            </Row>

            <Row icon="🏬" title="Recibí" value={fmt(totals.recibido)} />
          </Accordion>
        </Card>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">Selecciona un asesor para continuar.</Card>
      )}
    </AppLayout>
  );
}

function Row({
  icon, title, value, children, highlight,
}: {
  icon: string;
  title: string;
  value: string;
  children?: React.ReactNode;
  highlight?: "success" | "primary";
}) {
  const valueClass =
    highlight === "primary" ? "text-primary font-bold" :
    highlight === "success" ? "text-success font-semibold" :
    "text-foreground";
  const id = `row-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <AccordionItem value={id} className="border-0">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/40 hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3 pr-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-sm font-medium truncate">{title}</span>
          </div>
          <span className={`text-sm tabular-nums ${valueClass}`}>{value}</span>
        </div>
      </AccordionTrigger>
      {children && (
        <AccordionContent className="px-4 pb-4 pt-1 bg-muted/20">
          {children}
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold border-t pt-1 mt-1" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function RowList({
  items, empty,
}: {
  items: { key: string; title: string; subtitle?: string; right: string; actions?: React.ReactNode }[];
  empty: string;
}) {
  if (items.length === 0) return <div className="text-sm text-muted-foreground py-2">{empty}</div>;
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.key} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{it.title}</div>
            {it.subtitle && <div className="text-xs text-muted-foreground truncate">{it.subtitle}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="text-sm font-semibold tabular-nums">{it.right}</div>
            {it.actions}
          </div>
        </div>
      ))}
    </div>
  );
}

function NoveltyList({ list, clientNames }: { list: ApprovedNovelty[]; clientNames?: Record<string, string> }) {
  if (list.length === 0) return <div className="text-sm text-muted-foreground py-2">Sin novedades aprobadas hoy.</div>;
  return (
    <div className="space-y-1.5">
      {list.map((n) => {
        const p = n.payload ?? {};
        const delta =
          n.request_type === "increase_loan" ? Number(p.amount ?? 0) - Number(p.previous_amount ?? 0) :
          n.request_type === "decrease_loan" ? Number(p.previous_amount ?? 0) - Number(p.amount ?? 0) :
          Number(p.amount ?? 0);
        const name = (n.client_id && clientNames?.[n.client_id]) || "—";
        return (
          <div key={n.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
            <div className="text-sm min-w-0">
              <div className="font-medium truncate">{name}</div>
              <div className="text-xs text-muted-foreground">
                {n.request_type === "increase_loan" ? "Aumento de crédito" :
                 n.request_type === "decrease_loan" ? "Disminución de crédito" :
                 n.request_type === "delete_payment" ? "Pago eliminado" : n.request_type}
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums">{fmt(delta)}</div>
          </div>
        );
      })}
    </div>
  );
}

function AdminPaymentActions({
  payment, advisors, onChanged,
}: {
  payment: PaymentRow;
  advisors: Advisor[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(payment.amount ?? 0));
  const [paymentType, setPaymentType] = useState<PaymentType>(payment.payment_type);
  const [paymentDate, setPaymentDate] = useState(payment.payment_date);
  const [advisorId, setAdvisorId] = useState(payment.advisor_id);
  const [notes, setNotes] = useState(payment.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount(String(payment.amount ?? 0));
    setPaymentType(payment.payment_type);
    setPaymentDate(payment.payment_date);
    setAdvisorId(payment.advisor_id);
    setNotes(payment.notes ?? "");
  }, [payment]);

  const save = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Monto invalido");
    if (!advisorId) return toast.error("Selecciona un asesor");
    setSaving(true);
    const { error } = await supabase
      .from("payments")
      .update({
        amount: amt,
        payment_type: paymentType,
        payment_date: paymentDate,
        advisor_id: advisorId,
        notes: notes || null,
      })
      .eq("id", payment.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Movimiento actualizado");
    setOpen(false);
    onChanged();
  };

  const removeMovement = async () => {
  const ok = window.confirm("Eliminar este movimiento de la caja del día?");
  if (!ok) return;

  setSaving(true);

  // SOLO elimina el registro del pago en caja
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", payment.id);

  setSaving(false);

  if (error) return toast.error(error.message);

  toast.success("Movimiento eliminado de la caja");
  onChanged();
};

  return (
    <div className="flex items-center gap-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Modificar movimiento">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Modificar movimiento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monto</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interes">Interes</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="renovacion">Renovacion</SelectItem>
                  <SelectItem value="abono">Abono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mover a asesor</Label>
              <Select value={advisorId} onValueChange={setAdvisorId}>
                <SelectTrigger><SelectValue placeholder="Selecciona asesor" /></SelectTrigger>
                <SelectContent>
                  {advisors.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" title="Eliminar movimiento" onClick={removeMovement} disabled={saving}>
        <Trash2 className="mr-1 h-4 w-4" /> Eliminar movimiento
      </Button>
    </div>
  );
}

function AdminLoanActions({
  loan, advisors, onChanged,
}: {
  loan: LoanRow;
  advisors: Advisor[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [advisorId, setAdvisorId] = useState(loan.created_by);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAdvisorId(loan.created_by);
  }, [loan]);

  const move = async () => {
    if (!advisorId) return toast.error("Selecciona un asesor");
    setSaving(true);
    const { error: loanError } = await supabase
      .from("loans")
      .update({ created_by: advisorId })
      .eq("id", loan.id);
    if (!loanError) {
      await supabase.from("clients").update({ created_by: advisorId }).eq("id", loan.client_id);
    }
    setSaving(false);
    if (loanError) return toast.error(loanError.message);
    toast.success("Movimiento movido de asesor");
    setOpen(false);
    onChanged();
  };

  const removeMovement = async () => {
    const ok = window.confirm("Eliminar este movimiento de la caja del dia?");
    if (!ok) return;
    setSaving(true);

    if (loan.renewed_from) {
      await supabase
        .from("payments")
        .delete()
        .eq("loan_id", loan.renewed_from)
        .eq("payment_type", "interes")
        .eq("payment_date", loan.loan_date);
      await supabase.from("loans").update({ status: "activo" }).eq("id", loan.renewed_from);
    } else {
      await supabase.from("payments").delete().eq("loan_id", loan.id);
    }

  

const previousDate = new Date(loan.loan_date);
previousDate.setDate(previousDate.getDate() - 1);

const formattedDate = previousDate.toISOString().slice(0, 10);

const { error } = await supabase
  .from("loans")
  .update({
    loan_date: formattedDate,
  })
  .eq("id", loan.id);
  
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Movimiento eliminado");
    onChanged();
  };

  return (
    <div className="flex items-center gap-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Mover movimiento">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Mover movimiento de asesor</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Asesor destino</Label>
            <Select value={advisorId} onValueChange={setAdvisorId}>
              <SelectTrigger><SelectValue placeholder="Selecciona asesor" /></SelectTrigger>
              <SelectContent>
                {advisors.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={move} disabled={saving}>{saving ? "Guardando..." : "Mover"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" title="Eliminar movimiento" onClick={removeMovement} disabled={saving}>
        <Trash2 className="mr-1 h-4 w-4" /> Eliminar movimiento
      </Button>
    </div>
  );
}

function BasePanel({
  isAdmin, advisorId, date, base, onSaved,
}: {
  isAdmin: boolean;
  advisorId: string;
  date: string;
  base: BaseRow | undefined;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [baseAmount, setBaseAmount] = useState<string>(String(base?.base_amount ?? 0));
  const [adjustment, setAdjustment] = useState<string>(String(base?.manual_adjustment ?? 0));
  const [notes, setNotes] = useState<string>(base?.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBaseAmount(String(base?.base_amount ?? 0));
    setAdjustment(String(base?.manual_adjustment ?? 0));
    setNotes(base?.notes ?? "");
  }, [base]);

  const save = async () => {
    setSaving(true);
    const payload = {
      advisor_id: advisorId,
      date,
      base_amount: Number(baseAmount) || 0,
      additional_amount: Number(base?.additional_amount ?? 0),
      manual_adjustment: Number(adjustment) || 0,
      notes: notes || null,
    };
    const { error } = await supabase
      .from("advisor_daily_base")
      .upsert(payload, { onConflict: "advisor_id,date" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Base actualizada");
    setEditing(false);
    onSaved();
  };

  if (!isAdmin) {
    return (
      <div className="text-sm">
        <div>Base asignada: <strong>{fmt(Number(base?.base_amount ?? 0))}</strong></div>
        {Number(base?.manual_adjustment ?? 0) !== 0 && (
          <div className="text-muted-foreground">Ajuste: {fmt(Number(base?.manual_adjustment ?? 0))}</div>
        )}
        {base?.notes && <div className="text-muted-foreground mt-1">{base.notes}</div>}
      </div>
    );
  }

  return !editing ? (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">
        <div>Base: <strong>{fmt(Number(base?.base_amount ?? 0))}</strong></div>
        {Number(base?.manual_adjustment ?? 0) !== 0 && (
          <div className="text-muted-foreground">Ajuste: {fmt(Number(base?.manual_adjustment ?? 0))}</div>
        )}
        {base?.notes && <div className="text-muted-foreground mt-1">{base.notes}</div>}
      </div>
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="mr-2 h-4 w-4" /> Modificar
      </Button>
    </div>
  ) : (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Base diaria</Label>
          <Input type="number" step="0.01" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Ajuste (+/-)</Label>
          <Input type="number" step="0.01" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notas</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </div>
    </div>
  );
}

function AdditionalPanel({
  isAdmin, advisorId, date, base, onSaved,
}: {
  isAdmin: boolean;
  advisorId: string;
  date: string;
  base: BaseRow | undefined;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState<string>(String(base?.additional_amount ?? 0));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount(String(base?.additional_amount ?? 0));
  }, [base]);

  const save = async () => {
    setSaving(true);
    const payload = {
      advisor_id: advisorId,
      date,
      base_amount: Number(base?.base_amount ?? 0),
      additional_amount: Number(amount) || 0,
      manual_adjustment: Number(base?.manual_adjustment ?? 0),
      notes: base?.notes ?? null,
    };
    const { error } = await supabase
      .from("advisor_daily_base")
      .upsert(payload, { onConflict: "advisor_id,date" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Adicional actualizado");
    setEditing(false);
    onSaved();
  };

  if (!isAdmin) {
    return (
      <div className="text-sm">
        Valor adicional: <strong>{fmt(Number(base?.additional_amount ?? 0))}</strong>
      </div>
    );
  }

  return !editing ? (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">
        Valor adicional: <strong>{fmt(Number(base?.additional_amount ?? 0))}</strong>
      </div>
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="mr-2 h-4 w-4" /> Modificar
      </Button>
    </div>
  ) : (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Valor adicional</Label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </div>
    </div>
  );
}

function TransfersPanel({
  currentUserId, targetAdvisorId, isAdmin, advisors, transfers, recibido, enviado, date, onChanged,
}: {
  currentUserId: string;
  targetAdvisorId: string;
  isAdmin: boolean;
  advisors: Advisor[];
  transfers: TransferRow[];
  recibido: number;
  enviado: number;
  date: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const advisorName = (id: string) => advisors.find((a) => a.id === id)?.full_name ?? "—";
  const canSend = !isAdmin && currentUserId === targetAdvisorId;

  const submit = async () => {
    const amt = Number(amount);
    if (!toId || !amt || amt <= 0) return toast.error("Selecciona un asesor e indica un monto válido");
    if (toId === currentUserId) return toast.error("No puedes enviarte dinero a ti mismo");
    setSaving(true);
    const { error } = await supabase.from("cash_transfers").insert({
      from_advisor: currentUserId, to_advisor: toId, amount: amt, transfer_date: date, notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitud enviada. Espera aprobación del receptor.");
    setOpen(false); setToId(""); setAmount(""); setNotes("");
    onChanged();
  };

  const respond = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("cash_transfers")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Transferencia aprobada" : "Transferencia rechazada");
    onChanged();
  };

  const otherAdvisors = advisors.filter((a) => a.id !== currentUserId);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          Recibido {fmt(recibido)} · Enviado {fmt(enviado)}
        </div>
        {canSend && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Send className="h-4 w-4 mr-2" /> Enviar dinero</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enviar dinero a otro asesor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Asesor destinatario</Label>
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un asesor" /></SelectTrigger>
                    <SelectContent>
                      {otherAdvisors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Monto</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Notas (opcional)</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
                <Button onClick={submit} disabled={saving}>{saving ? "Enviando..." : "Enviar solicitud"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {transfers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">Sin transferencias en esta fecha.</p>
      ) : (
        <div className="space-y-2">
          {transfers.map((t) => {
            const isIncoming = t.to_advisor === targetAdvisorId;
            const canRespond = t.status === "pending" && t.to_advisor === currentUserId;
            return (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-md border border-border gap-2 flex-wrap bg-card">
                <div className="min-w-0">
                  <div className="font-medium text-sm">
                    {isIncoming ? `De: ${advisorName(t.from_advisor)}` : `Para: ${advisorName(t.to_advisor)}`}
                  </div>
                  {t.notes && <div className="text-xs text-muted-foreground">{t.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    t.status === "approved" ? "bg-success/15 text-success border-success/30" :
                    t.status === "rejected" ? "bg-destructive/15 text-destructive border-destructive/30" :
                    "bg-warning/15 text-warning border-warning/30"
                  }>
                    {t.status === "approved" ? "Aprobada" : t.status === "rejected" ? "Rechazada" : "Pendiente"}
                  </Badge>
                  <div className={`font-semibold ${isIncoming ? "text-success" : "text-warning"}`}>
                    {isIncoming ? "+" : "-"}{fmt(Number(t.amount))}
                  </div>
                  {canRespond && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => respond(t.id, "approved")}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => respond(t.id, "rejected")}><X className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
