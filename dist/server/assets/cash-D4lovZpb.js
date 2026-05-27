import { Y as reactExports, P as jsxRuntimeExports, R as React } from "./worker-entry-DR4bSXle.js";
import { A as AppLayout } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { u as useComposedRefs, B as Button } from "./button-C9pURHNj.js";
import { I as Input } from "./input-MtMwySKV.js";
import { L as Label } from "./label-BvGZFAJt.js";
import { B as Badge } from "./badge-HHM55BVR.js";
import { T as Textarea } from "./textarea-DMJd0uqG.js";
import { T as Tabs, b as TabsList, c as TabsTrigger } from "./tabs-o9rtLHuV.js";
import { C as ChevronDown, S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BVT3-eYc.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, c as DialogHeader, d as DialogTitle, b as DialogFooter } from "./dialog-De4gqTSZ.js";
import { e as useControllableState, P as Primitive, g as useId, c as composeEventHandlers, b as createContextScope, h as useLayoutEffect2, f as useDirection } from "./index-C1dl1jUB.js";
import { c as createCollection, C as Check } from "./index-DEX-kEHT.js";
import { P as Presence } from "./index-B_Ux4b9a.js";
import { b as cn, u as useAuth, l as localIsoDate, s as supabase, t as toast } from "./router-CNRSrf85.js";
import { C as Calendar } from "./calendar-C1xaeimH.js";
import { c as createLucideIcon } from "./wallet-BP1busbB.js";
import { T as Trash2 } from "./trash-2-yYeiY-yY.js";
import { S as Send } from "./send-B2N-dWzj.js";
import { X } from "./x-DJbEe9gg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-DwOo3BR9.js";
import "./index-ChW4vIqc.js";
const __iconNode$1 = [
  ["path", { d: "m16 3 4 4-4 4", key: "1x1c3m" }],
  ["path", { d: "M20 7H4", key: "zbl0bi" }],
  ["path", { d: "m8 21-4-4 4-4", key: "h9nckh" }],
  ["path", { d: "M4 17h16", key: "g4d7ey" }]
];
const ArrowRightLeft = createLucideIcon("arrow-right-left", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$1 = "CollapsibleTrigger";
var CollapsibleTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$1, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME$1;
var CONTENT_NAME$1 = "CollapsibleContent";
var CollapsibleContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$1, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME$1;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$1, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible;
var Trigger = CollapsibleTrigger;
var Content = CollapsibleContent;
var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = createCollection(ACCORDION_NAME);
var [createAccordionContext] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope
]);
var useCollapsibleScope = createCollapsibleScope();
var Accordion$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion$1.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = React.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? "",
      onChange: onValueChange,
      caller: ACCORDION_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: React.useMemo(() => value ? [value] : [], [value]),
        onItemOpen: setValue,
        onItemClose: React.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: ACCORDION_NAME
  });
  const handleItemOpen = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = React.useRef(null);
    const composedRefs = useComposedRefs(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event) => {
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => !item.ref.current?.disabled);
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      triggerCollection[clampedIndex].ref.current?.focus();
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = useId();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem$1.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ["--radix-accordion-content-height"]: "var(--radix-collapsible-content-height)",
          ["--radix-accordion-content-width"]: "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent$1.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion$1;
var Item = AccordionItem$1;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger$1;
var Content2 = AccordionContent$1;
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const fmt = (n) => new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
}).format(n);
const isAdditionalPayment = (p) => p.payment_type === "adicional" || p.payment_type === "abono" && (p.notes ?? "").toLowerCase().includes("cobro adicional");
function CashPage() {
  const {
    user,
    role,
    loading
  } = useAuth();
  const [date, setDate] = reactExports.useState(() => localIsoDate());
  const [advisors, setAdvisors] = reactExports.useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = reactExports.useState("");
  const [advisorName, setAdvisorName] = reactExports.useState("");
  const [payments, setPayments] = reactExports.useState([]);
  const [newLoans, setNewLoans] = reactExports.useState([]);
  const [bases, setBases] = reactExports.useState([]);
  const [transfers, setTransfers] = reactExports.useState([]);
  const [novelties, setNovelties] = reactExports.useState([]);
  const [noveltyClients, setNoveltyClients] = reactExports.useState({});
  const isAdmin = role === "admin";
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!isAdmin) setSelectedAdvisor(user.id);
    void loadAdvisors();
  }, [loading, user, isAdmin]);
  reactExports.useEffect(() => {
    if (!user) return;
    void loadData();
  }, [date, selectedAdvisor, isAdmin, user]);
  const loadAdvisors = async () => {
    const {
      data: profs
    } = await supabase.from("profiles").select("id, full_name, email, is_active");
    const allProfiles = (profs ?? []).filter((p) => p.is_active !== false);
    const {
      data: roles
    } = await supabase.from("user_roles").select("user_id, role");
    const rolesMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    const seenRoles = rolesMap.size;
    const advisorList = seenRoles >= allProfiles.length ? allProfiles.filter((p) => rolesMap.get(p.id) === "asesor") : allProfiles.filter((p) => rolesMap.get(p.id) !== "admin");
    setAdvisors(advisorList.map(({
      id,
      full_name,
      email
    }) => ({
      id,
      full_name,
      email
    })));
  };
  const loadData = async () => {
    const targetId = isAdmin ? selectedAdvisor : user?.id ?? "";
    if (targetId) {
      const {
        data: prof
      } = await supabase.from("profiles").select("full_name").eq("id", targetId).maybeSingle();
      setAdvisorName(prof?.full_name ?? "");
    }
    let pq = supabase.from("payments").select("id, loan_id, client_id, advisor_id, payment_type, amount, payment_date, notes").eq("payment_date", date);
    if (!isAdmin && user) pq = pq.eq("advisor_id", user.id);
    else if (isAdmin && selectedAdvisor) pq = pq.eq("advisor_id", selectedAdvisor);
    const {
      data: pays
    } = await pq.order("created_at", {
      ascending: false
    });
    let lq = supabase.from("loans").select("id, amount, loan_date, created_by, client_id, renewed_from").eq("loan_date", date);
    if (!isAdmin && user) lq = lq.eq("created_by", user.id);
    else if (isAdmin && selectedAdvisor) lq = lq.eq("created_by", selectedAdvisor);
    const {
      data: ls
    } = await lq.order("created_at", {
      ascending: false
    });
    const newLoanClientIds = Array.from(new Set((ls ?? []).filter((l) => !l.renewed_from).map((l) => l.client_id)));
    let priorLoansByClient = {};
    if (newLoanClientIds.length > 0) {
      const {
        data: prior
      } = await supabase.from("loans").select("id, client_id, loan_date").in("client_id", newLoanClientIds).lt("loan_date", date);
      for (const r of prior ?? []) {
        priorLoansByClient[r.client_id] = (priorLoansByClient[r.client_id] ?? 0) + 1;
      }
    }
    const clientIds = Array.from(/* @__PURE__ */ new Set([...(pays ?? []).map((p) => p.client_id), ...(ls ?? []).map((l) => l.client_id)]));
    let clientsMap = {};
    if (clientIds.length > 0) {
      const {
        data: cs
      } = await supabase.from("clients").select("id, full_name, cedula").in("id", clientIds);
      clientsMap = Object.fromEntries((cs ?? []).map((c) => [c.id, {
        full_name: c.full_name,
        cedula: c.cedula
      }]));
    }
    const loanIds = Array.from(new Set((pays ?? []).map((p) => p.loan_id).filter(Boolean)));
    let loansMap = {};
    if (loanIds.length > 0) {
      const {
        data: lz
      } = await supabase.from("loans").select("id, amount, expected_amount").in("id", loanIds);
      loansMap = Object.fromEntries((lz ?? []).map((l) => [l.id, {
        amount: Number(l.amount),
        expected_amount: Number(l.expected_amount)
      }]));
    }
    setPayments((pays ?? []).map((p) => ({
      ...p,
      clients: clientsMap[p.client_id] ?? null,
      loanCapital: loansMap[p.loan_id]?.amount,
      loanExpected: loansMap[p.loan_id]?.expected_amount
    })));
    setNewLoans((ls ?? []).map((l) => ({
      ...l,
      clients: clientsMap[l.client_id] ?? null,
      isReactivation: !l.renewed_from && (priorLoansByClient[l.client_id] ?? 0) > 0
    })));
    let bq = supabase.from("advisor_daily_base").select("id, advisor_id, date, base_amount, additional_amount, manual_adjustment, notes").eq("date", date);
    if (!isAdmin && user) bq = bq.eq("advisor_id", user.id);
    else if (isAdmin && selectedAdvisor) bq = bq.eq("advisor_id", selectedAdvisor);
    const {
      data: bs
    } = await bq;
    setBases(bs ?? []);
    let tq = supabase.from("cash_transfers").select("id, from_advisor, to_advisor, amount, status, transfer_date, notes, created_at").eq("transfer_date", date).order("created_at", {
      ascending: false
    });
    const focus = isAdmin ? selectedAdvisor : user?.id;
    if (focus) tq = tq.or(`from_advisor.eq.${focus},to_advisor.eq.${focus}`);
    const {
      data: ts
    } = await tq;
    setTransfers(ts ?? []);
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;
    let nq = supabase.from("change_requests").select("id, request_type, client_id, loan_id, payment_id, payload, reviewed_at, requested_by, status").eq("status", "approved").gte("reviewed_at", dayStart).lte("reviewed_at", dayEnd);
    if (!isAdmin && user) nq = nq.eq("requested_by", user.id);
    else if (isAdmin && selectedAdvisor) nq = nq.eq("requested_by", selectedAdvisor);
    const {
      data: ns
    } = await nq;
    setNovelties(ns ?? []);
    const novClientIds = Array.from(new Set((ns ?? []).map((n) => n.client_id).filter(Boolean)));
    if (novClientIds.length > 0) {
      const {
        data: ncs
      } = await supabase.from("clients").select("id, full_name").in("id", novClientIds);
      setNoveltyClients(Object.fromEntries((ncs ?? []).map((c) => [c.id, c.full_name])));
    } else {
      setNoveltyClients({});
    }
  };
  const targetAdvisorId = isAdmin ? selectedAdvisor : user?.id ?? "";
  const baseRow = reactExports.useMemo(() => bases.find((b) => b.advisor_id === targetAdvisorId), [bases, targetAdvisorId]);
  const totals = reactExports.useMemo(() => {
    const interes = payments.filter((p) => p.payment_type === "interes").reduce((s, p) => s + Number(p.amount), 0);
    const totalPagos = payments.filter((p) => p.payment_type === "total").reduce((s, p) => s + Number(p.amount), 0);
    const abonos = payments.filter((p) => p.payment_type === "abono" && !isAdditionalPayment(p)).reduce((s, p) => s + Number(p.amount), 0);
    const renovaciones = payments.filter((p) => p.payment_type === "renovacion").reduce((s, p) => s + Number(p.amount), 0);
    const adicionales = payments.filter(isAdditionalPayment).reduce((s, p) => s + Number(p.amount), 0);
    const completos = payments.filter((p) => p.payment_type === "total");
    const retirados = completos.filter((p) => (p.notes ?? "").toLowerCase().includes("sacado"));
    const retiradosCapital = retirados.reduce((s, p) => s + Number(p.loanCapital ?? 0), 0);
    const completosCapital = completos.reduce((s, p) => s + Number(p.loanCapital ?? 0), 0);
    const completosInteres = completos.reduce((s, p) => {
      const cap = Number(p.loanCapital ?? 0);
      const paid = Number(p.amount);
      return s + Math.max(0, paid - cap);
    }, 0);
    const moraCobrada = payments.filter((p) => (p.notes ?? "").toLowerCase().includes("mora")).reduce((s, p) => {
      const m = (p.notes ?? "").match(/\(([\d.]+)\)/);
      return s + (m ? Number(m[1]) : 0);
    }, 0);
    const recaudoTotal = interes + totalPagos + abonos + renovaciones;
    const prestadoNuevos = newLoans.filter((l) => !l.renewed_from).reduce((s, l) => s + Number(l.amount), 0);
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
    const recibido = transfers.filter((t) => t.status === "approved" && t.to_advisor === targetAdvisorId).reduce((s, t) => s + Number(t.amount), 0);
    const enviado = transfers.filter((t) => t.status === "approved" && t.from_advisor === targetAdvisorId).reduce((s, t) => s + Number(t.amount), 0);
    let aumentos = 0;
    let disminuciones = 0;
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
    const entrega = base + recaudoTotal - prestadoNuevos + adicional + ajusteManual + recibido - enviado + disminuciones - aumentos;
    return {
      interes,
      totalPagos,
      abonos,
      renovaciones,
      recaudoTotal,
      moraCobrada,
      prestadoNuevos,
      renovadosCount,
      nuevosCount,
      activadosCount,
      prestadoActivados,
      activados,
      prestadoSoloNuevos,
      base,
      adicional,
      ajusteManual,
      recibido,
      enviado,
      aumentos,
      disminuciones,
      entrega,
      retirados,
      retiradosCapital,
      nuevos,
      renovados,
      completos,
      completosCapital,
      completosInteres
    };
  }, [payments, newLoans, baseRow, transfers, targetAdvisorId, novelties]);
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Cargando..." }) });
  const dateLabel = (/* @__PURE__ */ new Date(date + "T00:00:00")).toLocaleString("es", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: advisorName || "Caja" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: dateLabel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-40" })
      ] })
    ] }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: selectedAdvisor, onValueChange: setSelectedAdvisor, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "flex-wrap h-auto", children: advisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: a.id, children: a.full_name }, a.id)) }) }),
      !selectedAdvisor && advisors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Selecciona un asesor para ver su caja." })
    ] }),
    targetAdvisorId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Accordion, { type: "multiple", className: "divide-y", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "💼", title: "Base", value: fmt(totals.base), children: /* @__PURE__ */ jsxRuntimeExports.jsx(BasePanel, { isAdmin, advisorId: targetAdvisorId, date, base: baseRow, onSaved: loadData }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🚩", title: "Recaudo Total", value: fmt(totals.recaudoTotal), highlight: "success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: payments.map((p) => ({
        key: p.id,
        title: p.clients?.full_name ?? "—",
        subtitle: `${p.payment_type} · ${p.clients?.cedula ?? "—"}`,
        right: fmt(Number(p.amount)),
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPaymentActions, { payment: p, advisors, onChanged: loadData }) : null
      })), empty: "Sin pagos en esta fecha." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🟡", title: "Cobro Mora", value: fmt(totals.moraCobrada) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { icon: "🛍️", title: "Adicional", value: fmt(totals.adicional), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Adicional: ",
          fmt(totals.adicional)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdditionalPanel, { isAdmin, advisorId: targetAdvisorId, date, base: baseRow, onSaved: loadData })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🛡️", title: "Entrega Final", value: fmt(totals.entrega), highlight: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "Base", value: fmt(totals.base) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "+ Recaudo", value: fmt(totals.recaudoTotal) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "− Prestado", value: fmt(totals.prestadoNuevos) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "− Aumentos", value: fmt(totals.aumentos) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "+ Adicional", value: fmt(totals.adicional) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "+ Recibido", value: fmt(totals.recibido) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "− Enviado", value: fmt(totals.enviado) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "+ Ajuste manual", value: fmt(totals.ajusteManual) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "= Entrega", value: fmt(totals.entrega), bold: true })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { icon: "👥", title: "Clientes Capital", value: `${totals.completos.length} - ${fmt(totals.completosCapital + totals.disminuciones)}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.completos.map((p) => ({
          key: p.id,
          title: p.clients?.full_name ?? "—",
          subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
          right: fmt(Number(p.loanCapital ?? 0)),
          actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPaymentActions, { payment: p, advisors, onChanged: loadData }) : null
        })), empty: "Sin clientes que pagaron completo." }),
        totals.disminuciones > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-2", children: "Disminuciones de crédito" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NoveltyList, { list: novelties.filter((n) => n.request_type === "decrease_loan"), clientNames: noveltyClients })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "👥", title: "Pago Servicio", value: `${totals.completos.length} - ${fmt(totals.completosInteres)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.completos.map((p) => ({
        key: p.id,
        title: p.clients?.full_name ?? "—",
        subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
        right: fmt(Math.max(0, Number(p.amount) - Number(p.loanCapital ?? 0))),
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPaymentActions, { payment: p, advisors, onChanged: loadData }) : null
      })), empty: "Sin interés cobrado." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "👤", title: "Aumentos", value: fmt(totals.aumentos), children: /* @__PURE__ */ jsxRuntimeExports.jsx(NoveltyList, { list: novelties.filter((n) => n.request_type === "increase_loan"), clientNames: noveltyClients }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "📕", title: "Renovados", value: `${totals.renovadosCount} - ${fmt(totals.renovaciones)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.renovados.map((l) => ({
        key: l.id,
        title: l.clients?.full_name ?? "—",
        subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
        right: fmt(Number(l.amount)),
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLoanActions, { loan: l, advisors, onChanged: loadData }) : null
      })), empty: "Sin renovaciones." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "👤", title: "Nuevos", value: `${totals.nuevosCount} - ${fmt(totals.prestadoSoloNuevos)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.nuevos.map((l) => ({
        key: l.id,
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLoanActions, { loan: l, advisors, onChanged: loadData }) : null,
        title: l.clients?.full_name ?? "—",
        subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
        right: fmt(Number(l.amount))
      })), empty: "No se entregaron préstamos." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "👤", title: "Activados", value: `${totals.activadosCount} - ${fmt(totals.prestadoActivados)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.activados.map((l) => ({
        key: l.id,
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLoanActions, { loan: l, advisors, onChanged: loadData }) : null,
        title: l.clients?.full_name ?? "—",
        subtitle: `Cédula ${l.clients?.cedula ?? "—"}`,
        right: fmt(Number(l.amount))
      })), empty: "Sin clientes activados." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "📞", title: "Avisas", value: "0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🏅", title: "Retirados", value: `${totals.retirados.length} - ${fmt(totals.retiradosCapital)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RowList, { items: totals.retirados.map((p) => ({
        key: p.id,
        title: p.clients?.full_name ?? "—",
        subtitle: `Cédula ${p.clients?.cedula ?? "—"}`,
        right: fmt(Number(p.loanCapital ?? 0)),
        actions: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPaymentActions, { payment: p, advisors, onChanged: loadData }) : null
      })), empty: "Sin clientes retirados." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "📊", title: "Diferencia", value: fmt(totals.ajusteManual) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🩸", title: "Gastos", value: "0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "📕", title: "Entrega", value: fmt(totals.enviado), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransfersPanel, { currentUserId: user?.id ?? "", targetAdvisorId, isAdmin, advisors, transfers, recibido: totals.recibido, enviado: totals.enviado, date, onChanged: loadData }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: "🏬", title: "Recibí", value: fmt(totals.recibido) })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: "Selecciona un asesor para continuar." })
  ] });
}
function Row({
  icon,
  title,
  value,
  children,
  highlight
}) {
  const valueClass = highlight === "primary" ? "text-primary font-bold" : highlight === "success" ? "text-success font-semibold" : "text-foreground";
  const id = `row-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: id, className: "border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "px-4 py-3 hover:bg-muted/40 hover:no-underline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center justify-between gap-3 pr-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm tabular-nums ${valueClass}`, children: value })
    ] }) }),
    children && /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "px-4 pb-4 pt-1 bg-muted/20", children })
  ] });
}
function Line({
  label,
  value,
  bold
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex justify-between ${bold ? "font-bold border-t pt-1 mt-1" : "text-muted-foreground"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-foreground", children: value })
  ] });
}
function RowList({
  items,
  empty
}) {
  if (items.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-2", children: empty });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: it.title }),
      it.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: it.subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold tabular-nums", children: it.right }),
      it.actions
    ] })
  ] }, it.key)) });
}
function NoveltyList({
  list,
  clientNames
}) {
  if (list.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-2", children: "Sin novedades aprobadas hoy." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: list.map((n) => {
    const p = n.payload ?? {};
    const delta = n.request_type === "increase_loan" ? Number(p.amount ?? 0) - Number(p.previous_amount ?? 0) : n.request_type === "decrease_loan" ? Number(p.previous_amount ?? 0) - Number(p.amount ?? 0) : Number(p.amount ?? 0);
    const name = n.client_id && clientNames?.[n.client_id] || "—";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: n.request_type === "increase_loan" ? "Aumento de crédito" : n.request_type === "decrease_loan" ? "Disminución de crédito" : n.request_type === "delete_payment" ? "Pago eliminado" : n.request_type })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold tabular-nums", children: fmt(delta) })
    ] }, n.id);
  }) });
}
function AdminPaymentActions({
  payment,
  advisors,
  onChanged
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [amount, setAmount] = reactExports.useState(String(payment.amount ?? 0));
  const [paymentType, setPaymentType] = reactExports.useState(payment.payment_type);
  const [paymentDate, setPaymentDate] = reactExports.useState(payment.payment_date);
  const [advisorId, setAdvisorId] = reactExports.useState(payment.advisor_id);
  const [notes, setNotes] = reactExports.useState(payment.notes ?? "");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
    const {
      error
    } = await supabase.from("payments").update({
      amount: amt,
      payment_type: paymentType,
      payment_date: paymentDate,
      advisor_id: advisorId,
      notes: notes || null
    }).eq("id", payment.id);
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
    const {
      error
    } = await supabase.from("payments").delete().eq("id", payment.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Movimiento eliminado de la caja");
    onChanged();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", title: "Modificar movimiento", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Modificar movimiento" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: paymentDate, onChange: (e) => setPaymentDate(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentType, onValueChange: (v) => setPaymentType(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "interes", children: "Interes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "total", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "renovacion", children: "Renovacion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "abono", children: "Abono" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mover a asesor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: advisorId, onValueChange: setAdvisorId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecciona asesor" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: advisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Guardando..." : "Guardar" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 px-2 text-destructive", title: "Eliminar movimiento", onClick: removeMovement, disabled: saving, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-4 w-4" }),
      " Eliminar movimiento"
    ] })
  ] });
}
function AdminLoanActions({
  loan,
  advisors,
  onChanged
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [advisorId, setAdvisorId] = reactExports.useState(loan.created_by);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setAdvisorId(loan.created_by);
  }, [loan]);
  const move = async () => {
    if (!advisorId) return toast.error("Selecciona un asesor");
    setSaving(true);
    const {
      error: loanError
    } = await supabase.from("loans").update({
      created_by: advisorId
    }).eq("id", loan.id);
    if (!loanError) {
      await supabase.from("clients").update({
        created_by: advisorId
      }).eq("id", loan.client_id);
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
      await supabase.from("payments").delete().eq("loan_id", loan.renewed_from).eq("payment_type", "interes").eq("payment_date", loan.loan_date);
      await supabase.from("loans").update({
        status: "activo"
      }).eq("id", loan.renewed_from);
    } else {
      await supabase.from("payments").delete().eq("loan_id", loan.id);
    }
    const previousDate = new Date(loan.loan_date);
    previousDate.setDate(previousDate.getDate() - 1);
    const formattedDate = localIsoDate(previousDate);
    const {
      error
    } = await supabase.from("loans").update({
      loan_date: formattedDate
    }).eq("id", loan.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Movimiento eliminado");
    onChanged();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", title: "Mover movimiento", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mover movimiento de asesor" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Asesor destino" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: advisorId, onValueChange: setAdvisorId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecciona asesor" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: advisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: move, disabled: saving, children: saving ? "Guardando..." : "Mover" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 px-2 text-destructive", title: "Eliminar movimiento", onClick: removeMovement, disabled: saving, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-4 w-4" }),
      " Eliminar movimiento"
    ] })
  ] });
}
function BasePanel({
  isAdmin,
  advisorId,
  date,
  base,
  onSaved
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [baseAmount, setBaseAmount] = reactExports.useState(String(base?.base_amount ?? 0));
  const [adjustment, setAdjustment] = reactExports.useState(String(base?.manual_adjustment ?? 0));
  const [notes, setNotes] = reactExports.useState(base?.notes ?? "");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
      notes: notes || null
    };
    const {
      error
    } = await supabase.from("advisor_daily_base").upsert(payload, {
      onConflict: "advisor_id,date"
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Base actualizada");
    setEditing(false);
    onSaved();
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Base asignada: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(Number(base?.base_amount ?? 0)) })
      ] }),
      Number(base?.manual_adjustment ?? 0) !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
        "Ajuste: ",
        fmt(Number(base?.manual_adjustment ?? 0))
      ] }),
      base?.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-1", children: base.notes })
    ] });
  }
  return !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Base: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(Number(base?.base_amount ?? 0)) })
      ] }),
      Number(base?.manual_adjustment ?? 0) !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
        "Ajuste: ",
        fmt(Number(base?.manual_adjustment ?? 0))
      ] }),
      base?.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-1", children: base.notes })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
      " Modificar"
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Base diaria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: baseAmount, onChange: (e) => setBaseAmount(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ajuste (+/-)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: adjustment, onChange: (e) => setAdjustment(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditing(false), disabled: saving, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? "Guardando..." : "Guardar" })
    ] })
  ] });
}
function AdditionalPanel({
  isAdmin,
  advisorId,
  date,
  base,
  onSaved
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [amount, setAmount] = reactExports.useState(String(base?.additional_amount ?? 0));
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
      notes: base?.notes ?? null
    };
    const {
      error
    } = await supabase.from("advisor_daily_base").upsert(payload, {
      onConflict: "advisor_id,date"
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Adicional actualizado");
    setEditing(false);
    onSaved();
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      "Valor adicional: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(Number(base?.additional_amount ?? 0)) })
    ] });
  }
  return !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      "Valor adicional: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(Number(base?.additional_amount ?? 0)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
      " Modificar"
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor adicional" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditing(false), disabled: saving, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? "Guardando..." : "Guardar" })
    ] })
  ] });
}
function TransfersPanel({
  currentUserId,
  targetAdvisorId,
  isAdmin,
  advisors,
  transfers,
  recibido,
  enviado,
  date,
  onChanged
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [toId, setToId] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const advisorName = (id) => advisors.find((a) => a.id === id)?.full_name ?? "—";
  const canSend = !isAdmin && currentUserId === targetAdvisorId;
  const submit = async () => {
    const amt = Number(amount);
    if (!toId || !amt || amt <= 0) return toast.error("Selecciona un asesor e indica un monto válido");
    if (toId === currentUserId) return toast.error("No puedes enviarte dinero a ti mismo");
    setSaving(true);
    const {
      error
    } = await supabase.from("cash_transfers").insert({
      from_advisor: currentUserId,
      to_advisor: toId,
      amount: amt,
      transfer_date: date,
      notes: notes || null
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitud enviada. Espera aprobación del receptor.");
    setOpen(false);
    setToId("");
    setAmount("");
    setNotes("");
    onChanged();
  };
  const respond = async (id, status) => {
    const {
      error
    } = await supabase.from("cash_transfers").update({
      status,
      responded_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Transferencia aprobada" : "Transferencia rechazada");
    onChanged();
  };
  const otherAdvisors = advisors.filter((a) => a.id !== currentUserId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2 flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Recibido ",
        fmt(recibido),
        " · Enviado ",
        fmt(enviado)
      ] }),
      canSend && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
          " Enviar dinero"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enviar dinero a otro asesor" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Asesor destinatario" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: toId, onValueChange: setToId, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecciona un asesor" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: otherAdvisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas (opcional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: saving, children: saving ? "Enviando..." : "Enviar solicitud" })
          ] })
        ] })
      ] })
    ] }),
    transfers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-2", children: "Sin transferencias en esta fecha." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: transfers.map((t) => {
      const isIncoming = t.to_advisor === targetAdvisorId;
      const canRespond = t.status === "pending" && t.to_advisor === currentUserId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded-md border border-border gap-2 flex-wrap bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: isIncoming ? `De: ${advisorName(t.from_advisor)}` : `Para: ${advisorName(t.to_advisor)}` }),
          t.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: t.status === "approved" ? "bg-success/15 text-success border-success/30" : t.status === "rejected" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-warning/15 text-warning border-warning/30", children: t.status === "approved" ? "Aprobada" : t.status === "rejected" ? "Rechazada" : "Pendiente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-semibold ${isIncoming ? "text-success" : "text-warning"}`, children: [
            isIncoming ? "+" : "-",
            fmt(Number(t.amount))
          ] }),
          canRespond && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => respond(t.id, "approved"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => respond(t.id, "rejected"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }, t.id);
    }) })
  ] });
}
export {
  CashPage as component
};
