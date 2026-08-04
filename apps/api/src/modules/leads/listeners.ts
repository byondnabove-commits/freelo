// features/leads/listeners.ts
import { onEvent } from "@/lib/event-bus";
import { leadService } from "./service";

onEvent("form.submitted", async (payload) => {
  await leadService.createFromSubmission(payload);
});