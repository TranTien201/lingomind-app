import type { NextFunction, Request, Response } from "express";
import { terminalLogger } from "./TerminalLogger";

export function createRequestLoggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    terminalLogger.logRequestStart({
      requestId,
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      body: req.body,
    });

    res.on("finish", () => {
      terminalLogger.logRequestEnd({
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
}
