import { Hono } from "hono";
import type { AppEnv } from "@/types/hono";

import studio from "./studio";
import services from "./services";
import intakeForm from "./intake-form";
import complete from "./complete";

const onboarding = new Hono<AppEnv>();

onboarding.route("/studio", studio);
onboarding.route("/services", services);
onboarding.route("/intake-form", intakeForm);
onboarding.route("/complete", complete);

export default onboarding;