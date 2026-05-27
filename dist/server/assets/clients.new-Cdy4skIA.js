import { a9 as useRouter, Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-DR4bSXle.js";
import { s as supabase, u as useAuth, a as Route, L as Link, t as toast } from "./router-CNRSrf85.js";
import { A as AppLayout } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { I as Input } from "./input-MtMwySKV.js";
import { L as Label } from "./label-BvGZFAJt.js";
import { B as Button } from "./button-C9pURHNj.js";
import { T as Textarea } from "./textarea-DMJd0uqG.js";
import { A as ArrowLeft } from "./arrow-left-1gJc8L64.js";
import { S as Search } from "./search-F8cVrw3C.js";
import { T as TriangleAlert } from "./triangle-alert-LT4FcGEt.js";
import { c as createLucideIcon } from "./wallet-BP1busbB.js";
import { o as objectType, s as stringType, l as literalType } from "./types-DRCBwTGg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
async function uploadClientFile(userId, file, kind) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("client-docs").upload(path, file, {
    upsert: false,
    contentType: file.type
  });
  if (error) throw error;
  const { data } = await supabase.storage.from("client-docs").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? path;
}
const schema = objectType({
  cedula: stringType().trim().min(3, "Cédula requerida").max(30),
  full_name: stringType().trim().min(2, "Nombre requerido").max(120),
  birth_date: stringType().optional(),
  phone: stringType().trim().max(30).optional(),
  email: stringType().trim().email().max(255).optional().or(literalType("")),
  home_address: stringType().trim().max(300).optional(),
  work_address: stringType().trim().max(300).optional(),
  references_info: stringType().trim().max(1e3).optional()
});
function NewClientPage() {
  const {
    user
  } = useAuth();
  const router = useRouter();
  const {
    cedula: prefilledCedula
  } = Route.useSearch();
  const [step, setStep] = reactExports.useState(prefilledCedula ? "form" : "check");
  const [cedulaSearch, setCedulaSearch] = reactExports.useState(prefilledCedula);
  const [searching, setSearching] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [existing, setExisting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    cedula: prefilledCedula,
    full_name: "",
    birth_date: "",
    phone: "",
    email: "",
    home_address: "",
    work_address: "",
    references_info: ""
  });
  const [files, setFiles] = reactExports.useState({
    profile_photo: null,
    cedula_front: null,
    cedula_back: null,
    utility_bill: null,
    payment_proof: null
  });
  const checkCedula = async () => {
    const term = cedulaSearch.trim();
    if (!term) return toast.error("Ingresa una cédula");
    setSearching(true);
    setExisting(null);
    const {
      data: client
    } = await supabase.from("clients").select("id, full_name, cedula, created_by").eq("cedula", term).maybeSingle();
    if (!client) {
      setSearching(false);
      toast.success("Cédula disponible. Completa los datos.");
      setForm((f) => ({
        ...f,
        cedula: term
      }));
      setStep("form");
      return;
    }
    const [{
      data: advisor
    }, {
      data: loans
    }] = await Promise.all([supabase.from("profiles").select("full_name, email").eq("id", client.created_by).maybeSingle(), supabase.from("loans").select("amount, expected_amount, payment_date").eq("client_id", client.id).eq("status", "activo").order("loan_date", {
      ascending: false
    }).limit(1)]);
    setExisting({
      id: client.id,
      full_name: client.full_name,
      cedula: client.cedula,
      advisor_name: advisor?.full_name ?? null,
      advisor_email: advisor?.email ?? null,
      active_loan: loans && loans.length > 0 ? loans[0] : null
    });
    setSearching(false);
    toast.info(`${client.full_name} ya está registrado en el sistema`);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const urls = {
        profile_photo_url: null,
        cedula_front_url: null,
        cedula_back_url: null,
        utility_bill_url: null,
        payment_proof_url: null
      };
      const map = {
        profile_photo: "profile_photo_url",
        cedula_front: "cedula_front_url",
        cedula_back: "cedula_back_url",
        utility_bill: "utility_bill_url",
        payment_proof: "payment_proof_url"
      };
      for (const k of Object.keys(files)) {
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
        created_by: user.id
      };
      const {
        data,
        error
      } = await supabase.from("clients").insert(payload).select("id").single();
      if (error) throw error;
      toast.success("Cliente creado");
      router.navigate({
        to: "/clients/$id",
        params: {
          id: data.id
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/clients", className: "text-sm text-muted-foreground hover:text-foreground inline-flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " Volver"
    ] }) }),
    step === "check" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 max-w-xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-2", children: "Nuevo cliente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6", children: "Verifica primero si la cédula ya existe en el sistema." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cedula-check", children: "Cédula del cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cedula-check", value: cedulaSearch, onChange: (e) => setCedulaSearch(e.target.value), onKeyDown: (e) => e.key === "Enter" && checkCedula(), placeholder: "Ej: 1234567890" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: checkCedula, disabled: searching, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4" }),
            searching ? "Buscando..." : "Verificar"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setForm((f) => ({
            ...f,
            cedula: cedulaSearch.trim()
          }));
          setStep("form");
        }, className: "text-sm text-primary hover:underline" }) }),
        existing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-warning mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Este cliente ya está registrado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                existing.full_name,
                " · Cédula ",
                existing.cedula
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1 pl-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Asesor: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: existing.advisor_name ?? "—" }),
              existing.advisor_email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " (",
                existing.advisor_email,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Crédito activo: " }),
              existing.active_loan ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                existing.active_loan.amount.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "USD"
                }),
                " ",
                "· vence ",
                existing.active_loan.payment_date
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Sin crédito activo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => router.navigate({
            to: "/clients/$id",
            params: {
              id: existing.id
            }
          }), children: "Ver ficha del cliente" }) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg mb-4", children: "Información personal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cédula *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cedula, onChange: (e) => setForm({
            ...form,
            cedula: e.target.value
          }), required: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nombre completo *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.full_name, onChange: (e) => setForm({
            ...form,
            full_name: e.target.value
          }), required: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fecha de nacimiento", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.birth_date, onChange: (e) => setForm({
            ...form,
            birth_date: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Teléfono", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm({
            ...form,
            phone: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm({
            ...form,
            email: e.target.value
          }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg mb-4", children: "Direcciones y referencias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dirección de casa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.home_address, onChange: (e) => setForm({
            ...form,
            home_address: e.target.value
          }), rows: 2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dirección de trabajo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.work_address, onChange: (e) => setForm({
            ...form,
            work_address: e.target.value
          }), rows: 2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Referencias (nombres y teléfonos)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.references_info, onChange: (e) => setForm({
            ...form,
            references_info: e.target.value
          }), rows: 3 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg mb-4", children: "Documentos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileField, { label: "Foto de perfil", k: "profile_photo", files, setFiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileField, { label: "Cédula (frente)", k: "cedula_front", files, setFiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileField, { label: "Cédula (reverso)", k: "cedula_back", files, setFiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileField, { label: "Servicio público", k: "utility_bill", files, setFiles }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileField, { label: "Comprobante de pago", k: "payment_proof", files, setFiles })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setStep("check"), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Guardando..." : "Guardar cliente" })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: label }),
    children
  ] });
}
function FileField({
  label,
  k,
  files,
  setFiles
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground truncate flex-1", children: files[k]?.name ?? "Seleccionar archivo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", className: "hidden", onChange: (e) => setFiles((s) => ({
        ...s,
        [k]: e.target.files?.[0] ?? null
      })) })
    ] })
  ] });
}
export {
  NewClientPage as component
};
