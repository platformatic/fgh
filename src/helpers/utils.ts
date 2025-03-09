/**
 * Core utility functions for FGH operations
 * Provides foundational helpers used throughout the library
 * for type checking, array handling, and other common operations
 */

/**
 * Utility function to check if a value is null or undefined
 * Used throughout the FGH library for consistent null checking
 * and safer property access
 *
 * @param x The value to check for null or undefined status
 * @returns true if the value is either null or undefined, false otherwise
 */
export const isNullOrUndefined = (x: unknown): boolean => x === null || x === undefined

/**
 * Ensures a value is always wrapped in an array for consistent processing
 * If the input is already an array, returns it unchanged
 * If not, wraps the single value in a new array
 * Used for standardizing function inputs throughout the library
 *
 * @param x The value to ensure is wrapped in an array
 * @returns Either the original array or a new single-element array containing the value
 * @template T Type of the elements in the array
 */
export const ensureArray = <T>(x: T | T[]): T[] => {
  if (Array.isArray(x)) return x
  return [x]
}

/**
 * Converts a value to a string representation.
 * Strings are returned as-is, all other types are JSON encoded.
 *
 * @param x The value to convert to a string
 * @returns The string representation of the input
 */
export const toString = (x: unknown): string => {
  if (typeof x === 'string') return x
  return JSON.stringify(x)
}
