import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";

const logo = new Hono();

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

logo.post(
  "/",
  bodyLimit({
    maxSize: MAX_SIZE,
    onError: (c) => {
      return c.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: "Logo must be smaller than 2MB.",
          },
        },
        413,
      );
    },
  }),
  async (c) => {
    const body = await c.req.parseBody();

    const file = body.logo;

    if (!(file instanceof File)) {
      return c.json(
        {
          error: {
            code: "FILE_REQUIRED",
            message: "Please select a logo.",
          },
        },
        400,
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json(
        {
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Only PNG, JPG, WEBP and SVG images are allowed.",
          },
        },
        400,
      );
    }

   

    const extension = extname(file.name);

    const filename = `${randomUUID()}${extension}`;

    const uploadDir = join(process.cwd(), "uploads", "logos");

    await mkdir(uploadDir, {
      recursive: true,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(join(uploadDir, filename), buffer);

    const origin = new URL(c.req.url).origin;

    return c.json({
      data: {
        url: `${origin}/uploads/logos/${filename}`,
      },
    });
  },
);

export default logo;
