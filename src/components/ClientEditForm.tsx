import { useState } from "react";
import { Upload, X } from "lucide-react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadClientFile } from "@/lib/clientForm";
import { toast } from "sonner";

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

export type FileFields =
  | "profile_photo"
  | "cedula_front"
  | "cedula_back"
  | "utility_bill"
  | "payment_proof";

const fileToColumn: Record<FileFields, string> = {
  profile_photo: "profile_photo_url",
  cedula_front: "cedula_front_url",
  cedula_back: "cedula_back_url",
  utility_bill: "utility_bill_url",
  payment_proof: "payment_proof_url",
};

export interface ClientEditValues {
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
}

interface Props {
  client: ClientEditValues;
  userId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function ClientEditForm({ client, userId, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    cedula: client.cedula,
    full_name: client.full_name,
    birth_date: client.birth_date ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    home_address: client.home_address ?? "",
    work_address: client.work_address ?? "",
    references_info: client.references_info ?? "",
  });
  const [files, setFiles] = useState<Record<FileFields, File | null>>({
    profile_photo: null,
    cedula_front: null,
    cedula_back: null,
    utility_bill: null,
    payment_proof: null,
  });
  const [removed, setRemoved] = useState<Record<FileFields, boolean>>({
    profile_photo: false,
    cedula_front: false,
    cedula_back: false,
    utility_bill: false,
    payment_proof: false,
  });
  const [saving, setSaving] = useState(false);

  const currentUrls: Record<FileFields, string | null> = {
    profile_photo: client.profile_photo_url,
    cedula_front: client.cedula_front_url,
    cedula_back: client.cedula_back_url,
    utility_bill: client.utility_bill_url,
    payment_proof: client.payment_proof_url,
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const urlUpdates: Record<string, string | null> = {};
      for (const k of Object.keys(files) as FileFields[]) {
        const f = files[k];
        if (f) {
          urlUpdates[fileToColumn[k]] = await uploadClientFile(userId, f, k);
        } else if (removed[k]) {
          urlUpdates[fileToColumn[k]] = null;
        }
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
        ...urlUpdates,
      };

      const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
      if (error) throw error;
      toast.success("Cliente actualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
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
        <h2 className="font-semibold text-lg mb-4">Documentos y foto de perfil</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FileField label="Foto de perfil" k="profile_photo" files={files} setFiles={setFiles} currentUrl={currentUrls.profile_photo} removed={removed} setRemoved={setRemoved} />
          <FileField label="Cédula (frente)" k="cedula_front" files={files} setFiles={setFiles} currentUrl={currentUrls.cedula_front} removed={removed} setRemoved={setRemoved} />
          <FileField label="Cédula (reverso)" k="cedula_back" files={files} setFiles={setFiles} currentUrl={currentUrls.cedula_back} removed={removed} setRemoved={setRemoved} />
          <FileField label="Servicio público" k="utility_bill" files={files} setFiles={setFiles} currentUrl={currentUrls.utility_bill} removed={removed} setRemoved={setRemoved} />
          <FileField label="Comprobante de pago" k="payment_proof" files={files} setFiles={setFiles} currentUrl={currentUrls.payment_proof} removed={removed} setRemoved={setRemoved} />
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
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
  currentUrl,
  removed,
  setRemoved,
}: {
  label: string;
  k: FileFields;
  files: Record<FileFields, File | null>;
  setFiles: React.Dispatch<React.SetStateAction<Record<FileFields, File | null>>>;
  currentUrl: string | null;
  removed: Record<FileFields, boolean>;
  setRemoved: React.Dispatch<React.SetStateAction<Record<FileFields, boolean>>>;
}) {
  const hasExisting = !!currentUrl && !removed[k];
  const newFile = files[k];

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {hasExisting && !newFile && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-primary/5 text-xs">
          <a href={currentUrl!} target="_blank" rel="noreferrer" className="text-primary truncate hover:underline">
            Ver archivo actual
          </a>
          <button
            type="button"
            onClick={() => setRemoved((s) => ({ ...s, [k]: true }))}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Quitar archivo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate flex-1">
          {newFile?.name ?? (hasExisting ? "Reemplazar archivo" : "Seleccionar archivo")}
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFiles((s) => ({ ...s, [k]: f }));
            if (f) setRemoved((s) => ({ ...s, [k]: false }));
          }}
        />
      </label>
      {newFile && (
        <button
          type="button"
          onClick={() => setFiles((s) => ({ ...s, [k]: null }))}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Quitar selección
        </button>
      )}
    </div>
  );
}