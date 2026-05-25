import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus, ShieldCheck, User as UserIcon, Percent, Lock } from "lucide-react";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "asesor" | null;
  is_active: boolean;
}

function AdminUsersPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [open, setOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserItem | null>(null);

  useEffect(() => {
    if (!loading && role !== "admin") {
      toast.error("Solo administradores");
      router.navigate({ to: "/dashboard" });
    }
  }, [role, loading, router]);

  useEffect(() => {
    if (role === "admin") void load();
  }, [role]);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, is_active");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const merged = (profiles ?? []).map((p) => ({
      ...p,
      is_active: p.is_active ?? true,
      role: (roles ?? []).find((r) => r.user_id === p.id)?.role as UserItem["role"],
    }));
    setUsers(merged);
  };

  const changeRole = async (userId: string, newRole: "admin" | "asesor") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) return toast.error(error.message);
    toast.success("Rol actualizado");
    void load();
  };

  const toggleActive = async (userId: string, next: boolean) => {
    // Si se va a BLOQUEAR (next=false), pedir primero la base del día siguiente
    if (!next) {
      const u = users.find((x) => x.id === userId);
      if (u) {
        setBlockTarget(u);
        return;
      }
    }
    setTogglingId(userId);
    // Actualización optimista para que el switch se mueva al instante
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: next } : u)),
    );
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: next, blocked_until: next ? null : new Date(Date.now() + 86400000).toISOString().slice(0, 10) })
      .eq("id", userId);
    if (error) {
      // Revertir si falla
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !next } : u)),
      );
      setTogglingId(null);
      return toast.error(error.message);
    }
    toast.success(next ? "Acceso habilitado" : "Acceso bloqueado");
    await load();
    setTogglingId(null);
  };

  if (role !== "admin") return null;

  return (
    <AppLayout>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona asesores y administradores</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Crear usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
            </DialogHeader>
            <CreateUserForm
              onCreated={() => {
                setOpen(false);
                setTimeout(load, 1500);
              }}
            />
          </DialogContent>
        </Dialog>
      </header>

      <InterestRateCard />

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {u.role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{u.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                {u.role ?? "sin rol"}
              </Badge>
              {u.role !== "admin" && (
                <div className="flex items-center gap-2 px-2">
                  <Switch
                    checked={u.is_active}
                    disabled={togglingId === u.id}
                    onCheckedChange={(v) => toggleActive(u.id, v)}
                    className="transition-all duration-300"
                  />
                  <span
                    key={String(u.is_active)}
                    className={`text-xs font-medium animate-fade-in transition-colors ${
                      u.is_active ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {togglingId === u.id
                      ? "Guardando..."
                      : u.is_active
                        ? "Activo"
                        : "Bloqueado"}
                  </span>
                </div>
              )}
              <Select value={u.role ?? "asesor"} onValueChange={(v) => changeRole(u.id, v as "admin" | "asesor")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asesor">Asesor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        ))}
      </div>
      <BlockUserDialog
        target={blockTarget}
        onClose={() => setBlockTarget(null)}
        onBlocked={() => {
          setBlockTarget(null);
          void load();
        }}
      />
    </AppLayout>
  );
}

function InterestRateCard() {
  const [rate, setRate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("interest_rate")
        .eq("id", true)
        .maybeSingle();
      if (data) setRate(String(data.interest_rate));
    })();
  }, []);

  const save = async () => {
    const n = Number(rate);
    if (!Number.isFinite(n) || n < 0 || n > 100)
      return toast.error("Ingresa un porcentaje entre 0 y 100");
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ interest_rate: n, updated_at: new Date().toISOString() })
      .eq("id", true);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tasa de interés actualizada");
  };

  return (
    <Card className="p-4 mb-6 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px] space-y-1.5">
        <Label className="flex items-center gap-2">
          <Percent className="h-4 w-4" /> Tasa de interés para renovaciones (%)
        </Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? "Guardando..." : "Guardar"}
      </Button>
    </Card>
  );
}

const newUserSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  role: z.enum(["asesor", "admin"]),
});

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"asesor" | "admin">("asesor");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newUserSchema.safeParse({ full_name: fullName, email, password, role });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    // Crear usuario con metadata de rol; el trigger handle_new_user lo aplica
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name, role: parsed.data.role },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Usuario creado");
    onCreated();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre completo</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Contraseña inicial</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
      </div>
      <div className="space-y-1.5">
        <Label>Rol</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "asesor" | "admin")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asesor">Asesor</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Creando..." : "Crear usuario"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Nota: Al crear un usuario aquí, se cerrará tu sesión y se iniciará la del nuevo usuario. Vuelve a iniciar sesión con tu cuenta admin.
      </p>
    </form>
  );
}

// Calcula la "Entrega Final" del día actual de un asesor
// (misma lógica que /cash) y la deja como base del día siguiente
// antes de bloquear al usuario.
function BlockUserDialog({
  target,
  onClose,
  onBlocked,
}: {
  target: UserItem | null;
  onClose: () => void;
  onBlocked: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [computed, setComputed] = useState<number>(0);
  const [base, setBase] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  useEffect(() => {
    if (!target) return;
    void (async () => {
      setLoading(true);
      try {
        // Pagos del día
        const { data: pays } = await supabase
          .from("payments")
          .select("id, loan_id, payment_type, amount")
          .eq("payment_date", today)
          .eq("advisor_id", target.id);
        // Préstamos creados hoy
        const { data: ls } = await supabase
          .from("loans")
          .select("id, amount, renewed_from")
          .eq("loan_date", today)
          .eq("created_by", target.id);
        // Base/ajuste del día
        const { data: bs } = await supabase
          .from("advisor_daily_base")
          .select("base_amount, additional_amount, manual_adjustment")
          .eq("date", today)
          .eq("advisor_id", target.id)
          .maybeSingle();
        // Transferencias aprobadas
        const { data: ts } = await supabase
          .from("cash_transfers")
          .select("from_advisor, to_advisor, amount, status")
          .eq("transfer_date", today)
          .eq("status", "approved");
        // Novedades aprobadas hoy (aumentos / disminuciones)
        const dayStart = `${today}T00:00:00`;
        const dayEnd = `${today}T23:59:59`;
        const { data: ns } = await (supabase.from("change_requests") as any)
          .select("request_type, payload")
          .eq("status", "approved")
          .eq("requested_by", target.id)
          .gte("reviewed_at", dayStart)
          .lte("reviewed_at", dayEnd);

        const recaudo = (pays ?? []).reduce(
          (s, p: any) => s + Number(p.amount),
          0,
        );
        const prestadoNuevos = (ls ?? [])
          .filter((l: any) => !l.renewed_from)
          .reduce((s, l: any) => s + Number(l.amount), 0);
        const baseDia = Number(bs?.base_amount ?? 0);
        const adicional = Number((bs as any)?.additional_amount ?? 0);
        const ajuste = Number(bs?.manual_adjustment ?? 0);
        const recibido = (ts ?? [])
          .filter((t: any) => t.to_advisor === target.id)
          .reduce((s, t: any) => s + Number(t.amount), 0);
        const enviado = (ts ?? [])
          .filter((t: any) => t.from_advisor === target.id)
          .reduce((s, t: any) => s + Number(t.amount), 0);
        let aumentos = 0;
        let disminuciones = 0;
        for (const n of (ns ?? []) as any[]) {
          const p = n.payload ?? {};
          if (n.request_type === "increase_loan") {
            const d = Number(p.amount ?? 0) - Number(p.previous_amount ?? 0);
            if (d > 0) aumentos += d;
          } else if (n.request_type === "decrease_loan") {
            const d = Number(p.previous_amount ?? 0) - Number(p.amount ?? 0);
            if (d > 0) disminuciones += d;
          }
        }
        const entrega =
          baseDia + recaudo - prestadoNuevos + adicional + ajuste + recibido - enviado +
          disminuciones - aumentos;
        setComputed(entrega);
        setBase(String(Math.round(entrega * 100) / 100));
      } finally {
        setLoading(false);
      }
    })();
  }, [target?.id]);

  const confirm = async () => {
    if (!target) return;
    const n = Number(base);
    if (!Number.isFinite(n)) return toast.error("Base inválida");
    setSaving(true);
    // 1) Crear/actualizar la base de mañana con el monto editado
    const { error: be } = await supabase
      .from("advisor_daily_base")
      .upsert(
        {
          advisor_id: target.id,
          date: tomorrow,
          base_amount: n,
          additional_amount: 0,
          manual_adjustment: 0,
          notes: notes || `Base inicial al cierre del ${today}`,
        },
        { onConflict: "advisor_id,date" },
      );
    if (be) {
      setSaving(false);
      return toast.error(be.message);
    }
    // 2) Bloquear el usuario
    const { error: pe } = await supabase
      .from("profiles")
      .update({ is_active: false, blocked_until: tomorrow })
      .eq("id", target.id);
    setSaving(false);
    if (pe) return toast.error(pe.message);
    toast.success("Usuario bloqueado y base del día siguiente asignada");
    onBlocked();
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Cerrar caja y bloquear
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Calculando entrega final...</div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Asesor: <strong>{target?.full_name}</strong>
            </p>
            <div className="rounded-md border p-3 text-sm bg-muted/30">
              Entrega final calculada del {today}:{" "}
              <strong>
                {new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(computed)}
              </strong>
            </div>
            <div className="space-y-1.5">
              <Label>Base con la que iniciará mañana ({tomorrow})</Label>
              <Input
                type="number"
                step="0.01"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Por defecto se usa la entrega final. Puedes modificarla.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={confirm} disabled={saving || loading}>
            {saving ? "Guardando..." : "Confirmar y bloquear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
