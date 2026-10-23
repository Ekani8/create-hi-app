import { ZodError } from "zod";
import { AppError } from "./app-error";
import { logger } from "../logger/logger";

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Invalid input" } },
      { status: 400 },
    );
  if (error instanceof AppError)
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  const requestId = crypto.randomUUID();
  logger.error("request_failed", { requestId });
  return Response.json(
    {
      error: { code: "INTERNAL_ERROR", message: "Unexpected error", requestId },
    },
    { status: 500 },
  );
}
