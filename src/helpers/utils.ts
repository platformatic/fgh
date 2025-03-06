/**
 * Utility functions for FGH operations
 */

/**
 * Check if a value is null or undefined
 * @param x The value to check
 * @returns True if value is null or undefined
 */
export const isNullOrUndefined = (x: unknown): boolean => x === null || x === undefined

/**
 * Ensure a value is wrapped in an array if it isn't one already
 * @param x The value to ensure is an array
 * @returns The value as an array, or a single-element array containing the value
 */
export const ensureArray = <T>(x: T | T[]): T[] => {
  if (Array.isArray(x)) return x
  return [x]
}
