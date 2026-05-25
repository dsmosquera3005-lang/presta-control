import { T as reactExports, K as jsxRuntimeExports, a4 as useRouter } from "./worker-entry-CNURiMmK.js";
import { A as AppLayout } from "./AppLayout-PvnASmSl.js";
import { C as Card } from "./card-DGzOhCrx.js";
import { d as createLucideIcon, u as useComposedRefs, a as cn, B as Button } from "./button-Ch56ZDAM.js";
import { I as Input } from "./input-B7Qm_XgT.js";
import { L as Label } from "./label-BpNOmtEt.js";
import { B as Badge } from "./badge-DyNApPR-.js";
import { e as useControllableState, P as Primitive, c as composeEventHandlers, b as createContextScope } from "./index-11z5DbUg.js";
import { u as usePrevious, S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-D5sEDkdZ.js";
import { e as useSize } from "./Combination-CmTRIBKz.js";
import { T as Textarea } from "./textarea-B3FQq1IO.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, c as DialogHeader, d as DialogTitle, b as DialogFooter } from "./dialog-Oo3zw78j.js";
import { u as useAuth, t as toast, s as supabase } from "./router-D6fjANqK.js";
import { o as objectType, e as enumType, s as stringType } from "./types-DRCBwTGg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-_0XBO-Dg.js";
import "./index-DzDdKfKp.js";
import "./x-DVzBypwu.js";
const __iconNode$4 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$4);
const __iconNode$3 = [
  ["line", { x1: "19", x2: "5", y1: "5", y2: "19", key: "1x9vlm" }],
  ["circle", { cx: "6.5", cy: "6.5", r: "2.5", key: "4mh3h7" }],
  ["circle", { cx: "17.5", cy: "17.5", r: "2.5", key: "1mdrzq" }]
];
const Percent = createLucideIcon("percent", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
function AdminUsersPage() {
  const {
    role,
    loading
  } = useAuth();
  const router = useRouter();
  const [users, setUsers] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  const [togglingId, setTogglingId] = reactExports.useState(null);
  const [blockTarget, setBlockTarget] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!loading && role !== "admin") {
      toast.error("Solo administradores");
      router.navigate({
        to: "/dashboard"
      });
    }
  }, [role, loading, router]);
  reactExports.useEffect(() => {
    if (role === "admin") void load();
  }, [role]);
  const load = async () => {
    const {
      data: profiles
    } = await supabase.from("profiles").select("id, full_name, email, is_active");
    const {
      data: roles
    } = await supabase.from("user_roles").select("user_id, role");
    const merged = (profiles ?? []).map((p) => ({
      ...p,
      is_active: p.is_active ?? true,
      role: (roles ?? []).find((r) => r.user_id === p.id)?.role
    }));
    setUsers(merged);
  };
  const changeRole = async (userId, newRole) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const {
      error
    } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: newRole
    });
    if (error) return toast.error(error.message);
    toast.success("Rol actualizado");
    void load();
  };
  const toggleActive = async (userId, next) => {
    if (!next) {
      const u = users.find((x) => x.id === userId);
      if (u) {
        setBlockTarget(u);
        return;
      }
    }
    setTogglingId(userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? {
      ...u,
      is_active: next
    } : u));
    const {
      error
    } = await supabase.from("profiles").update({
      is_active: next,
      blocked_until: next ? null : new Date(Date.now() + 864e5).toISOString().slice(0, 10)
    }).eq("id", userId);
    if (error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? {
        ...u,
        is_active: !next
      } : u));
      setTogglingId(null);
      return toast.error(error.message);
    }
    toast.success(next ? "Acceso habilitado" : "Acceso bloqueado");
    await load();
    setTogglingId(null);
  };
  if (role !== "admin") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Usuarios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Gestiona asesores y administradores" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
          " Crear usuario"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Crear nuevo usuario" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreateUserForm, { onCreated: () => {
            setOpen(false);
            setTimeout(load, 1500);
          } })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InterestRateCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 flex flex-wrap items-center gap-3 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center", children: u.role === "admin" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: u.full_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: u.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: u.role === "admin" ? "default" : "secondary", className: "capitalize", children: u.role ?? "sin rol" }),
        u.role !== "admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: u.is_active, disabled: togglingId === u.id, onCheckedChange: (v) => toggleActive(u.id, v), className: "transition-all duration-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium animate-fade-in transition-colors ${u.is_active ? "text-primary" : "text-destructive"}`, children: togglingId === u.id ? "Guardando..." : u.is_active ? "Activo" : "Bloqueado" }, String(u.is_active))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: u.role ?? "asesor", onValueChange: (v) => changeRole(u.id, v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asesor", children: "Asesor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" })
          ] })
        ] })
      ] })
    ] }, u.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlockUserDialog, { target: blockTarget, onClose: () => setBlockTarget(null), onBlocked: () => {
      setBlockTarget(null);
      void load();
    } })
  ] });
}
function InterestRateCard() {
  const [rate, setRate] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void (async () => {
      const {
        data
      } = await supabase.from("app_settings").select("interest_rate").eq("id", true).maybeSingle();
      if (data) setRate(String(data.interest_rate));
    })();
  }, []);
  const save = async () => {
    const n = Number(rate);
    if (!Number.isFinite(n) || n < 0 || n > 100) return toast.error("Ingresa un porcentaje entre 0 y 100");
    setSaving(true);
    const {
      error
    } = await supabase.from("app_settings").update({
      interest_rate: n,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", true);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tasa de interés actualizada");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 mb-6 flex flex-wrap items-end gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px] space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4" }),
        " Tasa de interés para renovaciones (%)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", max: "100", value: rate, onChange: (e) => setRate(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Guardando..." : "Guardar" })
  ] });
}
const newUserSchema = objectType({
  full_name: stringType().trim().min(2).max(120),
  email: stringType().trim().email().max(255),
  password: stringType().min(6).max(72),
  role: enumType(["asesor", "admin"])
});
function CreateUserForm({
  onCreated
}) {
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("asesor");
  const [saving, setSaving] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const parsed = newUserSchema.safeParse({
      full_name: fullName,
      email,
      password,
      role
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const {
      error
    } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.full_name,
          role: parsed.data.role
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Usuario creado");
    onCreated();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre completo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contraseña inicial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), minLength: 6, required: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rol" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: role, onValueChange: (v) => setRole(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asesor", children: "Asesor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Administrador" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full", children: saving ? "Creando..." : "Crear usuario" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nota: Al crear un usuario aquí, se cerrará tu sesión y se iniciará la del nuevo usuario. Vuelve a iniciar sesión con tu cuenta admin." })
  ] });
}
function BlockUserDialog({
  target,
  onClose,
  onBlocked
}) {
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [computed, setComputed] = reactExports.useState(0);
  const [base, setBase] = reactExports.useState("0");
  const [notes, setNotes] = reactExports.useState("");
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  reactExports.useEffect(() => {
    if (!target) return;
    void (async () => {
      setLoading(true);
      try {
        const {
          data: pays
        } = await supabase.from("payments").select("id, loan_id, payment_type, amount").eq("payment_date", today).eq("advisor_id", target.id);
        const {
          data: ls
        } = await supabase.from("loans").select("id, amount, renewed_from").eq("loan_date", today).eq("created_by", target.id);
        const {
          data: bs
        } = await supabase.from("advisor_daily_base").select("base_amount, additional_amount, manual_adjustment").eq("date", today).eq("advisor_id", target.id).maybeSingle();
        const {
          data: ts
        } = await supabase.from("cash_transfers").select("from_advisor, to_advisor, amount, status").eq("transfer_date", today).eq("status", "approved");
        const dayStart = `${today}T00:00:00`;
        const dayEnd = `${today}T23:59:59`;
        const {
          data: ns
        } = await supabase.from("change_requests").select("request_type, payload").eq("status", "approved").eq("requested_by", target.id).gte("reviewed_at", dayStart).lte("reviewed_at", dayEnd);
        const recaudo = (pays ?? []).reduce((s, p) => s + Number(p.amount), 0);
        const prestadoNuevos = (ls ?? []).filter((l) => !l.renewed_from).reduce((s, l) => s + Number(l.amount), 0);
        const baseDia = Number(bs?.base_amount ?? 0);
        const adicional = Number(bs?.additional_amount ?? 0);
        const ajuste = Number(bs?.manual_adjustment ?? 0);
        const recibido = (ts ?? []).filter((t) => t.to_advisor === target.id).reduce((s, t) => s + Number(t.amount), 0);
        const enviado = (ts ?? []).filter((t) => t.from_advisor === target.id).reduce((s, t) => s + Number(t.amount), 0);
        let aumentos = 0;
        let disminuciones = 0;
        for (const n of ns ?? []) {
          const p = n.payload ?? {};
          if (n.request_type === "increase_loan") {
            const d = Number(p.amount ?? 0) - Number(p.previous_amount ?? 0);
            if (d > 0) aumentos += d;
          } else if (n.request_type === "decrease_loan") {
            const d = Number(p.previous_amount ?? 0) - Number(p.amount ?? 0);
            if (d > 0) disminuciones += d;
          }
        }
        const entrega = baseDia + recaudo - prestadoNuevos + adicional + ajuste + recibido - enviado + disminuciones - aumentos;
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
    const {
      error: be
    } = await supabase.from("advisor_daily_base").upsert({
      advisor_id: target.id,
      date: tomorrow,
      base_amount: n,
      additional_amount: 0,
      manual_adjustment: 0,
      notes: notes || `Base inicial al cierre del ${today}`
    }, {
      onConflict: "advisor_id,date"
    });
    if (be) {
      setSaving(false);
      return toast.error(be.message);
    }
    const {
      error: pe
    } = await supabase.from("profiles").update({
      is_active: false,
      blocked_until: tomorrow
    }).eq("id", target.id);
    setSaving(false);
    if (pe) return toast.error(pe.message);
    toast.success("Usuario bloqueado y base del día siguiente asignada");
    onBlocked();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!target, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }),
      " Cerrar caja y bloquear"
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-4", children: "Calculando entrega final..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Asesor: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: target?.full_name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 text-sm bg-muted/30", children: [
        "Entrega final calculada del ",
        today,
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: new Intl.NumberFormat("es", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(computed) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Base con la que iniciará mañana (",
          tomorrow,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: base, onChange: (e) => setBase(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Por defecto se usa la entrega final. Puedes modificarla." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, disabled: saving, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirm, disabled: saving || loading, children: saving ? "Guardando..." : "Confirmar y bloquear" })
    ] })
  ] }) });
}
export {
  AdminUsersPage as component
};
