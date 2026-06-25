import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";
const leads = new Hono();

leads.use("*", requireAuth);
leads.use("*", requireOrg);

leads.get("/", async (c) => {
  return c.json({ leads: [] });
});

export default leads;
