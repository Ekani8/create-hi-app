type LogContext = { requestId?: string; code?: string; durationMs?: number };
function record(level: string, event: string, context: LogContext) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: context.requestId,
    code: context.code,
    durationMs: context.durationMs,
  });
}
export const logger = {
  info(event: string, context: LogContext = {}) {
    console.info(record("info", event, context));
  },
  error(event: string, context: LogContext = {}) {
    console.error(record("error", event, context));
  },
};
