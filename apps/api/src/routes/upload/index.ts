import { Hono } from "hono";

import logo from "./logo";

const upload = new Hono();

upload.route("/logo", logo);

export default upload;