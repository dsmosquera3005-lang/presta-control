import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { applyChangeRequest, REQUEST_LABELS, type ChangeRequestType } from "@/lib/changeRequests";
import { Check, X, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin/novelties")({
  component: NoveltiesPage,
});

interface RequestRow {
  id: string;
  request_type: ChangeRequestType;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  payload: any;
  client_id: string | null;
  loan_id: string | null;
  payment_id: string | null;
  requested_by: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Nombre",
  phone: "Teléfono",
  email: "Email",
  home_address: "Dirección casa",
  work_address: "Dirección trabajo",
  references_info: "Referencias",
  amount: "Capital prestado",
  expected_amount: "Monto a pagar",
};

const fmtMoney = (n: any) =>
  new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(Number(n) || 0);

function ChangeDiff({
  req,
  currentLoan,
  currentClient,
}: {
  req: RequestRow;
  currentLoan?: { amount: number; expected_amount: number } | null;
  currentClient?: Record<string, any> | null;
}) {
  const payload = (req.payload ?? {}) as Record<string, any>;
  const keys = Object.keys(payload);
  if (!keys.length) return null;

  const isMoney = (k: string) => k === "amount" || k === "expected_amount";
  const current: Record<string, any> | null | undefined = req.loan_id
    ? (currentLoan as any)
    : (currentClient as any);

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 mb-2 space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground mb-1">Cambios solicitados</div>
      {keys.map((k) => {
        const newVal = payload[k];
        const oldVal = current?.[k];
        const label = FIELD_LABELS[k] ?? k;
        const showOld = oldVal !== undefined && oldVal !== null && String(oldVal) !== String(newVal);
        return (
          <div key={k} className="text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground min-w-[120px]">{label}:</span>
            {showOld && (
              <>
                <span className="line-through text-muted-foreground">
                  {isMoney(k) ? fmtMoney(oldVal) : String(oldVal)}
                </span>
                <span className="text-muted-foreground">→</span>
              </>
            )}
            <span className="font-medium">
              {isMoney(k) ? fmtMoney(newVal) : String(newVal)}
            </span>
          </div>
        );
      })}
      {(req.request_type === "increase_loan" || req.request_type === "decrease_loan") && (
        <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 mt-2">
          Al aprobar, el cambio se reflejará automáticamente en la caja del asesor (préstamos del día).
        </div>
      )}
    </div>
  );
}

function NoveltiesPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Record<string, string>>({});
  const [clientFull, setClientFull] = useState<Record<string, any>>({});
  const [loansFull, setLoansFull] = useState<Record<string, { amount: number; expected_amount: number }>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && role !== "admin") router.navigate({ to: "/dashboard" });
  }, [role, loading, router]);

  const load = async () => {
    setLoadingRows(true);
    const { data, error } = await (supabase.from("change_requests") as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data ?? []) as RequestRow[];
    setRows(list);

    const userIds = Array.from(new Set(list.map((r) => r.requested_by)));
    const clientIds = Array.from(new Set(list.map((r) => r.client_id).filter(Boolean) as string[]));
    if (userIds.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const map: Record<string, string> = {};
      (ps ?? []).forEach((p: any) => (map[p.id] = p.full_name));
      setProfiles(map);
    }
    if (clientIds.length) {
      const { data: cs } = await supabase
        .from("clients")
        .select("id, full_name, phone, email, home_address, work_address, references_info")
        .in("id", clientIds);
      const map: Record<string, string> = {};
      const full: Record<string, any> = {};
      (cs ?? []).forEach((c: any) => {
        map[c.id] = c.full_name;
        full[c.id] = c;
      });
      setClients(map);
      setClientFull(full);
    }

    const loanIds = Array.from(new Set(list.map((r) => r.loan_id).filter(Boolean) as string[]));
    if (loanIds.length) {
      const { data: ls } = await supabase
        .from("loans")
        .select("id, amount, expected_amount")
        .in("id", loanIds);
      const map: Record<string, { amount: number; expected_amount: number }> = {};
      (ls ?? []).forEach((l: any) => (map[l.id] = { amount: Number(l.amount), expected_amount: Number(l.expected_amount) }));
      setLoansFull(map);
    }
    setLoadingRows(false);
  };

  useEffect(() => { void load(); }, []);

  const decide = async (req: RequestRow, approve: boolean) => {
    setWorking(req.id);
    try {
      if (approve) await applyChangeRequest(req.id);
      const { error } = await (supabase.from("change_requests") as any)
        .update({
          status: approve ? "approved" : "rejected",
          admin_notes: notes[req.id] ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", req.id);
      if (error) throw error;
      toast.success(approve ? "Novedad aplicada" : "Novedad rechazada");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Error al procesar");
    } finally {
      setWorking(null);
    }
  };

  const renderList = (status: "pending" | "approved" | "rejected") => {
    const filtered = rows.filter((r) => r.status === status);
    if (loadingRows) return <div className="text-muted-foreground py-8 text-center">Cargando...</div>;
    if (!filtered.length) return (
      <Card className="p-12 text-center">
        <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Sin novedades</p>
      </Card>
    );
    return (
      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-medium">{REQUEST_LABELS[r.request_type]}</div>
                <div className="text-xs text-muted-foreground">
                  De {profiles[r.requested_by] ?? "Asesor"} ·{" "}
                  {new Date(r.created_at).toLocaleString("es-CO")}
                </div>
                {r.client_id && (
                  <div className="text-sm mt-1">
                    Cliente: <span className="font-medium">{clients[r.client_id] ?? r.client_id}</span>
                  </div>
                )}
              </div>
              <Badge variant={status === "pending" ? "outline" : status === "approved" ? "default" : "destructive"}>
                {status === "pending" ? "Pendiente" : status === "approved" ? "Aprobada" : "Rechazada"}
              </Badge>
            </div>
            {r.reason && (
              <div className="text-sm bg-muted/40 rounded p-2 mb-2"><span className="font-medium">Motivo: </span>{r.reason}</div>
            )}
            {r.payload && Object.keys(r.payload).length > 0 && (
              <ChangeDiff
                req={r}
                currentLoan={r.loan_id ? loansFull[r.loan_id] : null}
                currentClient={r.client_id ? clientFull[r.client_id] : null}
              />
            )}
            {status === "pending" ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Notas del administrador (opcional)"
                  value={notes[r.id] ?? ""}
                  onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" disabled={working === r.id} onClick={() => decide(r, false)}>
                    <X className="mr-1 h-4 w-4" /> Rechazar
                  </Button>
                  <Button size="sm" disabled={working === r.id} onClick={() => decide(r, true)}>
                    <Check className="mr-1 h-4 w-4" /> Aprobar y aplicar
                  </Button>
                </div>
              </div>
            ) : r.admin_notes ? (
              <div className="text-sm text-muted-foreground"><span className="font-medium">Notas: </span>{r.admin_notes}</div>
            ) : null}
          </Card>
        ))}
      </div>
    );
  };

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <AppLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bandeja de novedades</h1>
        <p className="text-muted-foreground">Solicitudes enviadas por los asesores</p>
      </header>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{renderList("pending")}</TabsContent>
        <TabsContent value="approved" className="mt-4">{renderList("approved")}</TabsContent>
        <TabsContent value="rejected" className="mt-4">{renderList("rejected")}</TabsContent>
      </Tabs>
    </AppLayout>
  );
}