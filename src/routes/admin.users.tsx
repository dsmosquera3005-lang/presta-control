import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { UserPlus, ShieldCheck, User as UserIcon, Percent, Lock, Edit3, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { localIsoDate } from "@/lib/utils";
import { createAdminUser } from "@/lib/userApi";
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
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [open, setOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserItem | null>(null);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [reassignTarget, setReassignTarget] = useState<UserItem | null>(null);

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

  const saveUser = async (id: string, full_name: string, email: string, roleValue: "admin" | "asesor") => {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, email })
      .eq("id", id);
    if (profileError) return toast.error(profileError.message);

    await supabase.from("user_roles").delete().eq("user_id", id);
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: id, role: roleValue });
    if (roleError) return toast.error(roleError.message);

    toast.success("Usuario actualizado");
    void load();
  };

  const deleteUser = async (id: string) => {
    const { error: roleError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (roleError) return toast.error(roleError.message);

    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);
    if (profileError) return toast.error(profileError.message);

    toast.success("Usuario eliminado");
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
      .update({ is_active: next, blocked_until: next ? null : localIsoDate(new Date(Date.now() + 86400000)) })
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
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setReassignTarget(u)}
                >
                  {"Reasignar clientes"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditTarget(u)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget(u)}
                  disabled={u.id === user?.id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />Eliminar
                </Button>
              </div>
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
      <ReassignClientsDialog
        target={reassignTarget}
        users={users}
        onClose={() => setReassignTarget(null)}
        onReassigned={() => {
          setReassignTarget(null);
          void load();
        }}
      />
      <EditUserDialog
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          void load();
        }}
        onSave={saveUser}
      />
      <DeleteUserDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={async (id) => {
          await deleteUser(id);
          setDeleteTarget(null);
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

const editUserSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  role: z.enum(["asesor", "admin"]),
});

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"asesor" | "admin">("asesor");
  const [saving, setSaving] = useState(false);

  const createUserFn = useServerFn(createAdminUser);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newUserSchema.safeParse({ full_name: fullName, email, password, role });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);

    try {
      await createUserFn({ data: parsed.data });
      toast.success("Usuario creado");
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el usuario.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
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

function EditUserDialog({
  target,
  onClose,
  onSaved,
  onSave,
}: {
  target: UserItem | null;
  onClose: () => void;
  onSaved: () => void;
  onSave: (id: string, full_name: string, email: string, role: "admin" | "asesor") => Promise<void>;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "asesor">("asesor");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;
    setFullName(target.full_name);
    setEmail(target.email);
    setRole(target.role ?? "asesor");
  }, [target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const parsed = editUserSchema.safeParse({ full_name: fullName, email, role });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    await onSave(target.id, parsed.data.full_name, parsed.data.email, parsed.data.role);
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>
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
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "asesor")}> 
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asesor">Asesor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  target,
  onClose,
  onDelete,
}: {
  target: UserItem | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setSaving(true);
    await onDelete(target.id);
    setSaving(false);
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar usuario</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Esta acción eliminará al usuario <strong>{target?.full_name}</strong> y su rol asociado. Esta operación no puede deshacerse.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="destructive" onClick={confirm} disabled={saving}>
            {saving ? "Eliminando..." : "Eliminar usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ClientItem {
  id: string;
  cedula: string;
  full_name: string;
  phone: string | null;
  status: string | null;
  created_at: string;
}

function ReassignClientsDialog({
  target,
  users,
  onClose,
  onReassigned,
}: {
  target: UserItem | null;
  users: UserItem[];
  onClose: () => void;
  onReassigned: () => void;
}) {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const [targetAdvisorId, setTargetAdvisorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const advisors = useMemo(
    () => users.filter((u) => u.role === "asesor" && u.id !== target?.id),
    [users, target?.id],
  );

  useEffect(() => {
    if (!target) {
      setSearch("");
      setClients([]);
      setSelectedClientIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearch("");
    setSelectedClientIds(new Set());

    (async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, cedula, full_name, phone, status, created_at")
        .eq("created_by", target.id)
        .order("full_name", { ascending: true });

      if (error) {
        toast.error(error.message);
        setClients([]);
      } else {
        setClients(data ?? []);
      }
      setLoading(false);
    })();
  }, [target?.id]);

  useEffect(() => {
    if (!targetAdvisorId && advisors.length > 0) {
      setTargetAdvisorId(advisors[0].id);
    }
  }, [advisors, targetAdvisorId]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (client) =>
        client.full_name.toLowerCase().includes(term) ||
        client.cedula.toLowerCase().includes(term),
    );
  }, [clients, search]);

  const allVisibleSelected =
    filteredClients.length > 0 &&
    filteredClients.every((client) => selectedClientIds.has(client.id));

  const toggleClient = (id: string) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredClients.forEach((client) => next.delete(client.id));
      } else {
        filteredClients.forEach((client) => next.add(client.id));
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!target) return;
    if (!targetAdvisorId) {
      return toast.error("Selecciona un asesor destino.");
    }
    if (selectedClientIds.size === 0) {
      return toast.error("Selecciona al menos un cliente.");
    }
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({ created_by: targetAdvisorId })
      .in("id", Array.from(selectedClientIds));
    setSaving(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Clientes reasignados correctamente.");
    onReassigned();
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reasignar clientes de {target?.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mover a:</span>
              <Select value={targetAdvisorId} onValueChange={(v) => setTargetAdvisorId(v as string)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecciona asesor" />
                </SelectTrigger>
                <SelectContent>
                  {advisors.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      {advisor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} />
              Seleccionar todos ({filteredClients.length})
            </label>
            <span className="text-sm text-muted-foreground">
              {selectedClientIds.size} cliente(s) seleccionado(s)
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-border bg-background p-2">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Cargando clientes...</div>
            ) : filteredClients.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {clients.length === 0
                  ? "No hay clientes asignados a este usuario."
                  : "No se encontraron clientes con ese término de búsqueda."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <label
                    key={client.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={selectedClientIds.has(client.id)}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{client.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {client.cedula} · {client.phone ?? "Sin teléfono"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString("es")}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving || targetAdvisorId === "" || selectedClientIds.size === 0}>
            {saving ? "Reasignando..." : "Reasignar clientes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  const [base, setBase] = useState("0");
  const [notes, setNotes] = useState("");
  const [computed, setComputed] = useState(0);

  const today = localIsoDate();
  const tomorrow = localIsoDate(new Date(Date.now() + 86400000));

  useEffect(() => {
    if (!target) {
      setLoading(false);
      setBase("0");
      setNotes("");
      setComputed(0);
      return;
    }
    setLoading(true);

    (async () => {
      try {
        const { data: pays } = await supabase
          .from("payments")
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
