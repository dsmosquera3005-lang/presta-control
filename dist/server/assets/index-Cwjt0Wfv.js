import { a4 as useRouter, T as reactExports, K as jsxRuntimeExports } from "./worker-entry-CNURiMmK.js";
import { u as useAuth } from "./router-D6fjANqK.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
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
