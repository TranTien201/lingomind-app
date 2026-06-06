import { redactSensitiveData } from "./redactSensitiveData";

const ANSI_RESET = "\u001b[0m";
const ANSI_DIM = "\u001b[2m";
const ANSI_BLUE = "\u001b[34m";
const ANSI_YELLOW = "\u001b[33m";
const ANSI_RED = "\u001b[31m";
const ANSI_GRAY = "\u001b[90m";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface RequestStartLog {
  requestId: string;
  method: string;
  path: string;
  query?: unknown;
  body?: unknown;
}

export interface RequestEndLog {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}

export interface RequestErrorLog {
  requestId: string;
  method: string;
  path: string;
  durationMs?: number;
  error: unknown;
  body?: unknown;
}

export interface ProviderCallStartLog {
  requestId?: string;
  provider: string;
  model: string;
  url: string;
  prompt: string;
  requestBody?: unknown;
}

export interface ProviderCallEndLog {
  requestId?: string;
  provider: string;
  model: string;
  url: string;
  statusCode: number;
  durationMs: number;
  rawResponse: unknown;
  parsedResult?: unknown;
}

export interface ProviderCallErrorLog {
  requestId?: string;
  provider: string;
  model: string;
  url: string;
  durationMs?: number;
  prompt: string;
  requestBody?: unknown;
  error: unknown;
  rawResponse?: unknown;
}

export class TerminalLogger {
  debug(message: string, meta?: unknown) {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: unknown) {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: unknown) {
    this.write("error", message, meta);
  }

  logRequestStart(entry: RequestStartLog) {
    this.info("HTTP request started", entry);
  }

  logRequestEnd(entry: RequestEndLog) {
    this.info("HTTP request completed", entry);
  }

  logRequestError(entry: RequestErrorLog) {
    this.error("HTTP request failed", {
      ...entry,
      error: normalizeError(entry.error),
    });
  }

  logProviderCallStart(entry: ProviderCallStartLog) {
    this.info("AI provider request started", entry);
  }

  logProviderCallEnd(entry: ProviderCallEndLog) {
    this.info("AI provider request completed", entry);
  }

  logProviderCallError(entry: ProviderCallErrorLog) {
    this.error("AI provider request failed", {
      ...entry,
      error: normalizeError(entry.error),
    });
  }

  private write(level: LogLevel, message: string, meta?: unknown) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: meta ? redactSensitiveData(meta) : undefined,
    };

    const summary = formatSummary(payload.timestamp, level, message);
    const serialized = JSON.stringify(payload, null, 2);

    if (level === "error") {
      console.error(summary);
      console.error(colorizeMultiline(serialized, ANSI_DIM));
      return;
    }

    if (level === "warn") {
      console.warn(summary);
      console.warn(colorizeMultiline(serialized, ANSI_DIM));
      return;
    }

    console.log(summary);
    console.log(colorizeMultiline(serialized, ANSI_DIM));
  }
}

function formatSummary(timestamp: string, level: LogLevel, message: string) {
  const levelLabel = formatLevelLabel(level);
  const coloredTimestamp = `${ANSI_GRAY}${timestamp}${ANSI_RESET}`;

  return `${levelLabel} ${coloredTimestamp} ${message}`;
}

function formatLevelLabel(level: LogLevel) {
  const color = getLevelColor(level);
  const label = level.toUpperCase().padEnd(5, " ");

  return `${color}${label}${ANSI_RESET}`;
}

function getLevelColor(level: LogLevel) {
  switch (level) {
    case "debug":
      return ANSI_GRAY;
    case "info":
      return ANSI_BLUE;
    case "warn":
      return ANSI_YELLOW;
    case "error":
      return ANSI_RED;
  }
}

function colorizeMultiline(value: string, color: string) {
  return value
    .split("\n")
    .map((line) => `${color}${line}${ANSI_RESET}`)
    .join("\n");
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

export const terminalLogger = new TerminalLogger();
