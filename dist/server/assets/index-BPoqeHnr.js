import { a9 as useRouter, Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-u5osyKlM.js";
import { u as useAuth } from "./router-Qm6JXj-0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
function Index() {
  const router = useRouter();
  const {
    user,
    loading
  } = useAuth();
  reactExports.useEffect(() => {
    if (loading) return;
    router.navigate({
      to: user ? "/dashboard" : "/login"
    });
  }, [user, loading, router]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
}
export {
  Index as component
};
