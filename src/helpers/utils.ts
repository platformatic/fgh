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
 * When given an array, applies the conversion to each element.
 *
 * @param x The value or array of values to convert to strings
 * @returns Array of string representations of the input
 */
export const toString = (x: unknown): string[] => {
  if (Array.isArray(x)) {
    const len = x.length
    const result = new Array(len)

    for (let i = 0; i < len; i++) {
      const item = x[i]
      result[i] = typeof item === 'string' ? item : JSON.stringify(item)
    }

    return result
  }

  if (typeof x === 'string') return [x]
  return [JSON.stringify(x)]
}

/**
 * Converts a value to a number.
 * Numbers are returned as-is, strings that represent valid numbers are converted,
 * and all other types result in an error.
 * When given an array, applies the conversion to each element.
 *
 * @param x The value or array of values to convert to numbers
 * @returns Array of numeric representations of the input
 * @throws Error when a value cannot be converted to a number
 */
export const toNumber = (x: unknown): number[] => {
  if (Array.isArray(x)) {
    const len = x.length
    const result = new Array(len)

    for (let i = 0; i < len; i++) {
      result[i] = convertSingleValueToNumber(x[i])
    }

    return result
  }

  return [convertSingleValueToNumber(x)]
}

/**
 * Helper function to convert a single value to a number.
 *
 * @param x The value to convert
 * @returns The numeric representation of the input
 * @throws Error when the value cannot be converted to a number
 */
const convertSingleValueToNumber = (x: unknown): number => {
  // Numbers pass through unchanged
  if (typeof x === 'number') return x

  // Convert strings to numbers if they're valid numeric format
  if (typeof x === 'string') {
    const trimmed = x.trim()
    const num = Number(trimmed)

    if (!isNaN(num)) {
      return num
    }

    throw new Error(`Cannot convert string to number: ${x}`)
  }

  // All other types result in an error
  throw new Error(`Cannot convert ${typeof x} to number`)
}
