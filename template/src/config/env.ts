import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => {
      try {
        return ["postgres:", "postgresql:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "PostgreSQL URL required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
