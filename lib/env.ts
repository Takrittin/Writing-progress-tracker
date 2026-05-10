const defaultOpenRouterFreeModels = [
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/free"
] as const;

function uniqueModels(models: string[]) {
  return Array.from(new Set(models.filter(Boolean)));
}

export function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  return { databaseUrl };
}

export function getJwtConfig() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  return { jwtSecret };
}

export function requireJwtSecret() {
  const config = getJwtConfig();

  if (!config) {
    throw new Error("Missing JWT_SECRET. Add a long random JWT secret to .env.local.");
  }

  return config.jwtSecret;
}

export function requireOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to .env.local before analyzing writing.");
  }

  return apiKey;
}

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL ?? "gpt-5.2"
  };
}

export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENROUTER_MODEL ?? defaultOpenRouterFreeModels[0];

  return {
    apiKey,
    model,
    models: uniqueModels([model, ...defaultOpenRouterFreeModels]),
    referer: process.env.OPENROUTER_SITE_URL,
    title: process.env.OPENROUTER_APP_NAME ?? "Writing Progress Tracker"
  };
}
