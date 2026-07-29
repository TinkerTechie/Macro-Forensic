// Typed env config
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
} as const;

// Ensure runtime validation in production/browser if needed
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("NEXT_PUBLIC_API_URL is missing. Using fallback http://localhost:8000");
}
