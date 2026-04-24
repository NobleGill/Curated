import OpenAI from "openai";

// Support both Replit-provisioned AI integration env vars and standard OpenAI env vars.
// If neither is set, the app starts without AI features instead of crashing.
const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;

let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
} else {
  console.warn(
    "⚠️  OpenAI not configured: set OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) to enable AI features.",
  );
}

export { openai };
