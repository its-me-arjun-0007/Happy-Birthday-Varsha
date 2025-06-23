// lib/config.ts
// Central configuration for Varsha's birthday site.
// Extend this object as you add more configurable settings.

export const config = {
  /**
   * Birthday date in ISO-8601 format (UTC).
   * Update this if the celebration date changes.
   */
  birthdayDate: "2025-07-03T00:00:00Z",
}

/**
 * Convenience type reflecting the current shape of `config`.
 * Allows IntelliSense & type-safety when the config object grows.
 */
export type Config = typeof config

// You can also import the default export if preferred:
//   import config from "@/lib/config"
export default config
