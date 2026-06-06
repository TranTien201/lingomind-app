const SENSITIVE_KEYS = new Set([
  "apikey",
  "apiKey",
  "authorization",
  "Authorization",
  "password",
  "token",
  "accessToken",
  "refreshToken",
]);

export function redactSensitiveData<T>(value: T): T {
  return redactValue(value) as T;
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (!value || typeof value !== "object") {
    return typeof value === "string" ? redactString(value) : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      isSensitiveKey(key) ? maskSecret(nestedValue) : redactValue(nestedValue),
    ]),
  );
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || key.toLowerCase().includes("secret");
}

function maskSecret(value: unknown): string {
  if (typeof value !== "string") {
    return "[REDACTED]";
  }

  if (value.length <= 6) {
    return "***";
  }

  return `${value.slice(0, 6)}***`;
}

function redactString(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9_\-.]+/gi, "Bearer ***")
    .replace(/sk-[A-Za-z0-9_\-.]+/g, "sk-***");
}
