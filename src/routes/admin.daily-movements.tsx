import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Calendar as CalendarIcon, TrendingUp, Users, DollarSign, RotateCw, CheckCircle, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { localIsoDate } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/daily-movements")({
  component: DailyMovementsPage,
});

interface Advisor {
  id: string;
  full_name: string;
  email: string;
}

interface Movement {
  id: string;
  type: "payment" | "loan" | "novelty" | "client" | "transfer";
  subtype?: string;
  advisor_id: string;
  advisor_name?: string;
  client_id?: string;
  client_name?: string;
  client_cedula?: string;
  amount?: number;
  description: string;
  date: string;
  timestamp: string;
  details?: Record<string, any>;
  from_advisor_name?: string;
  to_advisor_name?: string;
  transfer_status?: "pending" | "approved" | "rejected";
}

const fmt = (n: number | undefined) =>
  new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

const getMovementIcon = (type: string) => {
  switch (type) {
    case "payment":
      return "💰";
    case "loan":
      return "💳";
    case "novelty":
      return "📝";
    case "client":
      return "👤";
    case "transfer":
      return "💸";
    default:
      return "📌";
  }
};

const getMovementColor = (type: string, subtype?: string): string => {
  if (type === "payment") return "bg-green-50 border-green-200";
  if (type === "loan") {
    if (subtype === "renovacion") return "bg-blue-50 border-blue-200";
    return "bg-purple-50 border-purple-200";
  }
  if (type === "novelty") return "bg-yellow-50 border-yellow-200";
  if (type === "client") return "bg-gray-50 border-gray-200";
  if (type === "transfer") return "bg-orange-50 border-orange-200";
  return "bg-gray-50 border-gray-200";
};

const getMovementLabel = (type: string, subtype?: string): string => {
  if (type === "payment") return `Pago • ${subtype}`;
  if (type === "loan") {
    if (subtype === "renovacion") return "Renovación";
    if (subtype === "reactivation") return "Activación";
    return "Nuevo préstamo";
  }
  if (type === "novelty") return "Novedad";
  if (type === "client") return "Cliente nuevo";
  if (type === "transfer") return "Transferencia";
  return "Movimiento";
};

function DailyMovementsPage() {
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<string>(() => localIsoDate());
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (role === "asesor" && user?.id) {
      setSelectedAdvisor(user.id);
    }
  }, [role, user?.id]);

  useEffect(() => {
    if (role === "admin") {
      void loadAdvisors();
    }
  }, [role]);

  useEffect(() => {
    if (role === "admin" || role === "asesor") {
      void loadMovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedAdvisor, role, user?.id]);

  const loadAdvisors = async () => {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_active");
    const allProfiles = (profs ?? []).filter((p) => p.is_active !== false);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const rolesMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    const advisorList = allProfiles.filter((p) => rolesMap.get(p.id) !== "admin");
    setAdvisors(advisorList.map(({ id, full_name, email }) => ({ id, full_name, email })));
  };

  const loadMovements = async () => {
    setLoadingData(true);
    const allMovements: Movement[] = [];

    try {
      // 1. Cargar asesores para mapeo de IDs a nombres
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name");
      const profilesMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.full_name]));

      // 2. Cargar clientes para mapeo de IDs a nombres
      const { data: clients } = await supabase
        .from("clients")
        .select("id, full_name, cedula");
      const clientsMap = Object.fromEntries((clients ?? []).map((c: any) => [c.id, { full_name: c.full_name, cedula: c.cedula }]));

      // 3. Pagos
      let pq = supabase
        .from("payments")
        .select("id, loan_id, client_id, advisor_id, payment_type, amount, payment_date, notes, created_at")
        .eq("payment_date", date)
        .order("created_at", { ascending: false });
      if (selectedAdvisor !== "all") {
        pq = pq.eq("advisor_id", selectedAdvisor);
      }
      const { data: payments } = await pq;
      (payments ?? []).forEach((p: any) => {
        allMovements.push({
          id: `payment-${p.id}`,
          type: "payment",
          subtype: p.payment_type,
          advisor_id: p.advisor_id,
          advisor_name: profilesMap[p.advisor_id],
          client_id: p.client_id,
          client_name: clientsMap[p.client_id]?.full_name,
          client_cedula: clientsMap[p.client_id]?.cedula,
          amount: Number(p.amount),
          description: `Pago ${p.payment_type} de ${clientsMap[p.client_id]?.full_name || "Cliente"}`,
          date: p.payment_date,
          timestamp: p.created_at,
          details: { notes: p.notes },
        });
      });

      // 4. Préstamos (nuevos, activaciones, renovaciones)
      let lq = supabase
        .from("loans")
        .select("id, amount, loan_date, created_by, client_id, renewed_from, created_at")
        .eq("loan_date", date)
        .order("created_at", { ascending: false });
      if (selectedAdvisor !== "all") {
        lq = lq.eq("created_by", selectedAdvisor);
      }
      const { data: loans } = await lq;

      // Determinar si es reactivación o nuevo
      const newLoanClientIds = Array.from(new Set(
        (loans ?? []).filter((l: any) => !l.renewed_from).map((l: any) => l.client_id)
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

      (loans ?? []).forEach((l: any) => {
        const isRenovacion = !!l.renewed_from;
        const isReactivation = !l.renewed_from && (priorLoansByClient[l.client_id] ?? 0) > 0;
        const subtype = isRenovacion ? "renovacion" : isReactivation ? "reactivation" : "new";

        allMovements.push({
          id: `loan-${l.id}`,
          type: "loan",
          subtype,
          advisor_id: l.created_by,
          advisor_name: profilesMap[l.created_by],
          client_id: l.client_id,
          client_name: clientsMap[l.client_id]?.full_name,
          client_cedula: clientsMap[l.client_id]?.cedula,
          amount: Number(l.amount),
          description: `${subtype === "renovacion" ? "Renovación" : subtype === "reactivation" ? "Activación" : "Nuevo préstamo"} a ${clientsMap[l.client_id]?.full_name || "Cliente"}`,
          date: l.loan_date,
          timestamp: l.created_at,
        });
      });

      // 5. Novedades aprobadas
      const dayStart = `${date}T00:00:00`;
      const dayEnd = `${date}T23:59:59`;
      let nq = (supabase.from("change_requests") as any)
        .select("id, request_type, client_id, payload, reviewed_at, requested_by, created_at")
        .eq("status", "approved")
        .gte("reviewed_at", dayStart)
        .lte("reviewed_at", dayEnd)
        .order("reviewed_at", { ascending: false });
      if (selectedAdvisor !== "all") {
        nq = nq.eq("requested_by", selectedAdvisor);
      }
      const { data: novelties } = await nq;
      (novelties ?? []).forEach((n: any) => {
        const payload = n.payload ?? {};
        const amount = Number(payload.amount ?? 0);
        const description = `Novedad: ${n.request_type === "increase_loan" ? "Aumento" : n.request_type === "decrease_loan" ? "Disminución" : n.request_type}`;

        allMovements.push({
          id: `novelty-${n.id}`,
          type: "novelty",
          subtype: n.request_type,
          advisor_id: n.requested_by,
          advisor_name: profilesMap[n.requested_by],
          client_id: n.client_id || undefined,
          client_name: n.client_id ? clientsMap[n.client_id]?.full_name : undefined,
          client_cedula: n.client_id ? clientsMap[n.client_id]?.cedula : undefined,
          amount: amount || undefined,
          description,
          date,
          timestamp: n.reviewed_at || n.created_at,
          details: payload,
        });
      });

      // 6. Clientes nuevos (creados hoy)
      const todayStart = `${date}T00:00:00`;
      const todayEnd = `${date}T23:59:59.999`;
      let cq = supabase
        .from("clients")
        .select("id, full_name, cedula, created_by, created_at")
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd)
        .order("created_at", { ascending: false });
      if (selectedAdvisor !== "all") {
        cq = cq.eq("created_by", selectedAdvisor);
      }
      const { data: newClients } = await cq;
      (newClients ?? []).forEach((c: any) => {
        allMovements.push({
          id: `client-${c.id}`,
          type: "client",
          advisor_id: c.created_by,
          advisor_name: profilesMap[c.created_by],
          client_id: c.id,
          client_name: c.full_name,
          client_cedula: c.cedula,
          description: `Cliente nuevo: ${c.full_name}`,
          date,
          timestamp: c.created_at,
        });
      });

      // 7. Transferencias entre asesores
      let tq = supabase
        .from("cash_transfers")
        .select("id, from_advisor, to_advisor, amount, status, transfer_date, notes, created_at")
        .eq("transfer_date", date)
        .order("created_at", { ascending: false });
      if (role !== "admin" && user?.id) {
        tq = tq.or(`from_advisor.eq.${user.id},to_advisor.eq.${user.id}`);
      }
      const { data: transfers } = await tq;
      (transfers ?? []).forEach((t: any) => {
        const shouldShow = role === "admin"
          ? selectedAdvisor === "all" || selectedAdvisor === t.from_advisor || selectedAdvisor === t.to_advisor
          : t.from_advisor === user?.id || t.to_advisor === user?.id;
        if (shouldShow) {
          allMovements.push({
            id: `transfer-${t.id}`,
            type: "transfer",
            subtype: t.status,
            advisor_id: t.from_advisor,
            advisor_name: profilesMap[t.from_advisor],
            from_advisor_name: profilesMap[t.from_advisor],
            to_advisor_name: profilesMap[t.to_advisor],
            amount: Number(t.amount),
            description: `Transferencia de ${profilesMap[t.from_advisor]} a ${profilesMap[t.to_advisor]}`,
            date: t.transfer_date,
            timestamp: t.created_at,
            transfer_status: t.status,
            details: { notes: t.notes },
          });
        }
      });

      // Ordenar por timestamp descendente
      allMovements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMovements(allMovements);
    } catch (error: any) {
      toast.error("Error al cargar movimientos: " + error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const dateLabel = new Date(date + "T00:00:00").toLocaleString("es", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Agrupar movimientos por tipo
  const byType = useMemo(() => {
    const grouped: Record<string, Movement[]> = {
      payment: [],
      loan: [],
      novelty: [],
      client: [],
      transfer: [],
    };
    movements.forEach((m) => {
      grouped[m.type]?.push(m);
    });
    return grouped;
  }, [movements]);

  // Calcular totales
  const totals = useMemo(() => {
    const paymentTotal = byType.payment.reduce((s, m) => s + (m.amount || 0), 0);
    const loanTotal = byType.loan.reduce((s, m) => s + (m.amount || 0), 0);
    
    return {
      paymentCount: byType.payment.length,
      paymentTotal,
      loanCount: byType.loan.length,
      loanTotal,
      noveltyCount: byType.novelty.length,
      clientCount: byType.client.length,
    };
  }, [byType]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = movements.map((m) => ({
      "Tipo de Movimiento": getMovementLabel(m.type, m.subtype),
      "De Asesor": m.from_advisor_name || m.advisor_name || m.advisor_id,
      "Para Asesor": m.to_advisor_name || "",
      "Cliente": m.client_name || "—",
      "Cédula": m.client_cedula || "—",
      "Monto": m.amount ? `${m.amount}` : "—",
      "Estado": m.transfer_status || "",
      "Descripción": m.description,
      "Fecha": new Date(m.timestamp).toLocaleDateString("es-CO"),
      "Hora": new Date(m.timestamp).toLocaleTimeString("es-CO"),
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar anchos de columna
    const colWidths = [
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
    ];
    ws["!cols"] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    
    const fileName = `movimientos_${date}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos del día</h1>
          <p className="text-sm text-muted-foreground">
            {role === "admin" ? "Actividad de todos los asesores" : "Actividad propia"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            disabled={movements.length === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Excel
          </Button>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pagos</p>
              <p className="text-2xl font-bold">{totals.paymentCount}</p>
              <p className="text-xs text-green-600 mt-1">{fmt(totals.paymentTotal)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Préstamos</p>
              <p className="text-2xl font-bold">{totals.loanCount}</p>
              <p className="text-xs text-blue-600 mt-1">{fmt(totals.loanTotal)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Novedades</p>
              <p className="text-2xl font-bold">{totals.noveltyCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Clientes nuevos</p>
              <p className="text-2xl font-bold">{totals.clientCount}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {role === "admin" ? (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Filtrar por asesor:</label>
            <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {advisors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-6">
          <p className="text-sm text-muted-foreground">Mostrando solo tu actividad.</p>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Todos
            <span className="ml-1 text-xs">({movements.length})</span>
          </TabsTrigger>
          <TabsTrigger value="payment">
            Pagos
            <span className="ml-1 text-xs">({totals.paymentCount})</span>
          </TabsTrigger>
          <TabsTrigger value="loan">
            Préstamos
            <span className="ml-1 text-xs">({totals.loanCount})</span>
          </TabsTrigger>
          <TabsTrigger value="novelty">
            Novedades
            <span className="ml-1 text-xs">({totals.noveltyCount})</span>
          </TabsTrigger>
          <TabsTrigger value="client">
            Clientes
            <span className="ml-1 text-xs">({totals.clientCount})</span>
          </TabsTrigger>
          <TabsTrigger value="transfer">
            Transferencias
            <span className="ml-1 text-xs">({movements.filter(m => m.type === "transfer").length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <MovementsList movements={movements} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <MovementsList movements={byType.payment} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>

        <TabsContent value="loan" className="mt-4">
          <MovementsList movements={byType.loan} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>

        <TabsContent value="novelty" className="mt-4">
          <MovementsList movements={byType.novelty} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>

        <TabsContent value="client" className="mt-4">
          <MovementsList movements={byType.client} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>

        <TabsContent value="transfer" className="mt-4">
          <MovementsList movements={byType.transfer} loading={loadingData} dateLabel={dateLabel} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function MovementsList({
  movements,
  loading,
  dateLabel,
}: {
  movements: Movement[];
  loading: boolean;
  dateLabel: string;
}) {
  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Cargando movimientos...</p>
      </Card>
    );
  }

  if (!movements.length) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Sin movimientos en esta fecha</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {movements.map((m) => (
        <Card
          key={m.id}
          className={`p-4 border-l-4 ${getMovementColor(m.type, m.subtype)}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-2xl">{getMovementIcon(m.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <div className="font-medium">{m.description}</div>
                  <Badge variant="outline" className="text-xs">
                    {getMovementLabel(m.type, m.subtype)}
                  </Badge>
                  {m.transfer_status && (
                    <Badge
                      variant={m.transfer_status === "approved" ? "default" : m.transfer_status === "pending" ? "outline" : "destructive"}
                      className="text-xs"
                    >
                      {m.transfer_status === "approved" ? "Aprobada" : m.transfer_status === "pending" ? "Pendiente" : "Rechazada"}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {m.type === "transfer" ? (
                    <>
                      <p>
                        <span className="font-medium">De:</span> {m.from_advisor_name || m.advisor_name || m.advisor_id}
                      </p>
                      <p>
                        <span className="font-medium">Para:</span> {m.to_advisor_name || "—"}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="font-medium">Asesor:</span> {m.advisor_name || m.advisor_id}
                    </p>
                  )}
                  {m.client_name && (
                    <p>
                      <span className="font-medium">Cliente:</span> {m.client_name}{" "}
                      {m.client_cedula && `(${m.client_cedula})`}
                    </p>
                  )}
                  <p>
                    {new Date(m.timestamp).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              {m.amount !== undefined && <div className="text-lg font-bold text-green-600">{fmt(m.amount)}</div>}
              {m.details?.notes && (
                <p className="text-xs text-muted-foreground mt-2 max-w-xs">{m.details.notes}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
