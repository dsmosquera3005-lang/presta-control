import { a4 as useRouter, T as reactExports, K as jsxRuntimeExports } from "./worker-entry-CNURiMmK.js";
import { u as useAuth, t as toast, s as supabase } from "./router-D6fjANqK.js";
import { W as Wallet, B as Button } from "./button-Ch56ZDAM.js";
import { I as Input } from "./input-B7Qm_XgT.js";
import { L as Label } from "./label-BpNOmtEt.js";
import { C as Card } from "./card-DGzOhCrx.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const router = useRouter();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && user) router.navigate({
      to: "/dashboard"
    });
  }, [user, loading, router]);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("blocked=1")) {
      toast.error("Tu acceso fue desactivado por el administrador");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success("Bienvenido");
      router.navigate({
        to: "/dashboard"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-30", style: {
      background: "var(--gradient-primary)",
      filter: "blur(120px)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md p-8 relative shadow-[var(--shadow-elevated)] border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "PrestaControl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Gestión profesional de préstamos" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "tu@correo.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, placeholder: "••••••••" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: submitting, children: submitting ? "Procesando..." : "Entrar" })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
