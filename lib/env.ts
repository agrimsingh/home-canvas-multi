// Environment variable validation
export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
} as const;

export function validateEnv() {
  const required = ["GEMINI_API_KEY"] as const;
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
