import { c as createServerRpc } from "./createServerRpc-C9FstJEG.js";
import { l as createServerFn } from "./worker-entry-u5osyKlM.js";
import { r as requireAdmin } from "./auth-middleware-CxkccP6c.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const createAdminUser_createServerFn_handler = createServerRpc({
  id: "a575f6742def2c1eb06cdd0c706f375fd49e97b36aa83133fb9e0a01c5e69208",
  name: "createAdminUser",
  filename: "src/lib/userApi.ts"
}, (opts) => createAdminUser.__executeServer(opts));
const createAdminUser = createServerFn({
  method: "POST"
}).middleware([requireAdmin]).inputValidator((data) => data).handler(createAdminUser_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByIo5Byn.js");
  const {
    error,
    data: user
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    user_metadata: {
      full_name: data.full_name,
      role: data.role
    },
    email_confirm: true
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error("No se pudo crear el usuario.");
  }
  return user;
});
export {
  createAdminUser_createServerFn_handler
};
