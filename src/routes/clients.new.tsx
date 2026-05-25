import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Search, Upload } from "lucide-react";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadClientFile } from "@/lib/clientForm";
import { toast } from "sonner";

export const Route = createFileRoute("/clients/new")({
  validateSearch: (search: Record<string, unknown>): { cedula: string } => ({
    cedula: typeof search.cedula === "string" ? search.cedula : "",
  }),
  component: NewClientPage,
});

const schema = z.object({
  cedula: z.string().trim().min(3, "Cédula requerida").max(30),
  full_name: z.string().trim().min(2, "Nombre requerido").max(120),
  birth_date: z.string().optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  home_address: z.string().trim().max(300).optional(),
  work_address: z.string().trim().max(300).optional(),
  references_info: z.string().trim().max(1000).optional(),
});

type FileFields =
  | "profile_photo"
  | "cedula_front"
  | "cedula_back"
  | "utility_bill"
  | "payment_proof";

function NewClientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { cedula: prefilledCedula } = Route.useSearch();
  const [step, setStep] = useState<"check" | "form">(prefilledCedula ? "form" : "check");
  const [cedulaSearch, setCedulaSearch] = useState(prefilledCedula);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<{
    id: string;
    full_name: string;
    cedula: string;
    advisor_name: string | null;
    advisor_email: string | null;
    active_loan: { amount: number; expected_amount: number; payment_date: string } | null;
  } | null>(null);
  const [form, setForm] = useState({
    cedula: prefilledCedula,
    full_name: "",
    birth_date: "",
    phone: "",
    email: "",
    home_address: "",
    work_address: "",
    references_info: "",
  });
  const [files, setFiles] = useState<Record<FileFields, File | null>>({
    profile_photo: null,
    cedula_front: null,
    cedula_back: null,
    utility_bill: null,
    payment_proof: null,
  });

  const checkCedula = async () => {
    const term = cedulaSearch.trim();
    if (!term) return toast.error("Ingresa una cédula");
    setSearching(true);
    setExisting(null);
    const { data: client } = await supabase
      .from("clients")
      .select("id, full_name, cedula, created_by")
      .eq("cedula", term)
      .maybeSingle();

    if (!client) {
      setSearching(false);
      toast.success("Cédula disponible. Completa los datos.");
      setForm((f) => ({ ...f, cedula: term }));
      setStep("form");
      return;
    }

    const [{ data: advisor }, { data: loans }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", client.created_by).maybeSingle(),
      supabase
        .from("loans")
        .select("amount, expected_amount, payment_date")
        .eq("client_id", client.id)
        .eq("status", "activo")
        .order("loan_date", { ascending: false })
        .limit(1),
    ]);

    setExisting({
      id: client.id,
      full_name: client.full_name,
      cedula: client.cedula,
      advisor_name: advisor?.full_name ?? null,
      advisor_email: advisor?.email ?? null,
      active_loan: loans && loans.length > 0 ? loans[0] : null,
    });
    setSearching(false);
    toast.info(`${client.full_name} ya está registrado en el sistema`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const urls: Record<string, string | null> = {
        profile_photo_url: null,
        cedula_front_url: null,
        cedula_back_url: null,
        utility_bill_url: null,
        payment_proof_url: null,
      };
      const map: Record<FileFields, string> = {
        profile_photo: "profile_photo_url",
        cedula_front: "cedula_front_url",
        cedula_back: "cedula_back_url",
        utility_bill: "utility_bill_url",
        payment_proof: "payment_proof_url",
      };
      for (const k of Object.keys(files) as FileFields[]) {
        const f = files[k];
        if (f) urls[map[k]] = await uploadClientFile(user.id, f, k);
      }

      const payload = {
        cedula: parsed.data.cedula,
        full_name: parsed.data.full_name,
        birth_date: parsed.data.birth_date || null,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        home_address: parsed.data.home_address || null,
        work_address: parsed.data.work_address || null,
        references_info: parsed.data.references_info || null,
        ...urls,
        created_by: user.id,
      };

      const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
      if (error) throw error;
      toast.success("Cliente creado");
      router.navigate({ to: "/clients/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to="/clients" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver
        </Link>
      </div>

      {step === "check" ? (
        <Card className="p-8 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Nuevo cliente</h1>
          <p className="text-muted-foreground mb-6">
            Verifica primero si la cédula ya existe en el sistema.
          </p>
          <div className="space-y-3">
            <Label htmlFor="cedula-check">Cédula del cliente</Label>
            <div className="flex gap-2">
              <Input
                id="cedula-check"
                value={cedulaSearch}
                onChange={(e) => setCedulaSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkCedula()}
                placeholder="Ej: 1234567890"
              />
              <Button onClick={checkCedula} disabled={searching}>
                <Search className="mr-2 h-4 w-4" />
                {searching ? "Buscando..." : "Verificar"}
              </Button>
            </div>
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, cedula: cedulaSearch.trim() }));
                  setStep("form");
                }}
                className="text-sm text-primary hover:underline"
              >

              </button>
            </div>

            {existing && (
              <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Este cliente ya está registrado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {existing.full_name} · Cédula {existing.cedula}
                    </p>
                  </div>
                </div>

                <div className="text-sm space-y-1 pl-7">
                  <div>
                    <span className="text-muted-foreground">Asesor: </span>
                    <span className="font-medium">
                      {existing.advisor_name ?? "—"}
                    </span>
                    {existing.advisor_email && (
                      <span className="text-muted-foreground"> ({existing.advisor_email})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crédito activo: </span>
                    {existing.active_loan ? (
                      <span className="font-medium">
                        {existing.active_loan.amount.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "USD",
                        })}{" "}
                        · vence {existing.active_loan.payment_date}
                      </span>
                    ) : (
                      <span className="font-medium">Sin crédito activo</span>
                    )}
                  </div>
                </div>

                <div className="pl-7">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.navigate({ to: "/clients/$id", params: { id: existing.id } })
                    }
                  >
                    Ver ficha del cliente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Información personal</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cédula *">
                <Input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} required />
              </Field>
              <Field label="Nombre completo *">
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </Field>
              <Field label="Fecha de nacimiento">
                <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Direcciones y referencias</h2>
            <div className="space-y-4">
              <Field label="Dirección de casa">
                <Textarea value={form.home_address} onChange={(e) => setForm({ ...form, home_address: e.target.value })} rows={2} />
              </Field>
              <Field label="Dirección de trabajo">
                <Textarea value={form.work_address} onChange={(e) => setForm({ ...form, work_address: e.target.value })} rows={2} />
              </Field>
              <Field label="Referencias (nombres y teléfonos)">
                <Textarea value={form.references_info} onChange={(e) => setForm({ ...form, references_info: e.target.value })} rows={3} />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Documentos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FileField label="Foto de perfil" k="profile_photo" files={files} setFiles={setFiles} />
              <FileField label="Cédula (frente)" k="cedula_front" files={files} setFiles={setFiles} />
              <FileField label="Cédula (reverso)" k="cedula_back" files={files} setFiles={setFiles} />
              <FileField label="Servicio público" k="utility_bill" files={files} setFiles={setFiles} />
              <FileField label="Comprobante de pago" k="payment_proof" files={files} setFiles={setFiles} />
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setStep("check")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar cliente"}
            </Button>
          </div>
        </form>
      )}
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function FileField({
  label,
  k,
  files,
  setFiles,
}: {
  label: string;
  k: FileFields;
  files: Record<FileFields, File | null>;
  setFiles: React.Dispatch<React.SetStateAction<Record<FileFields, File | null>>>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate flex-1">
          {files[k]?.name ?? "Seleccionar archivo"}
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFiles((s) => ({ ...s, [k]: e.target.files?.[0] ?? null }))}
        />
      </label>
    </div>
  );
}