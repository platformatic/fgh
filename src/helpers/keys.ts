/**
 * Helper functions for object and array keys operations
 */

import { isNullOrUndefined } from './utils.ts'

/**
 * Get the keys from an object or indices from an array
 * For objects, keys are sorted by unicode codepoint order
 * For arrays, returns indices from 0 to length-1
 * Non-object types return an empty array
 *
 * @param input The input object or array
 * @returns Array of keys (sorted) or indices
 */
export const getKeys = (input: unknown): string[] | number[] => {
  // Handle null and undefined
  if (isNullOrUndefined(input)) {
    return []
  }

  // Handle arrays - return indices
  if (Array.isArray(input)) {
    // Simply return array of indices - no special marking needed
    return Array.from({ length: input.length }, (_, i) => i)
  }

  // Handle objects - return sorted keys
  if (typeof input === 'object' && input !== null) {
    // Return sorted keys array - no special marking needed
    return Object.keys(input).sort()
  }

  // Non-object types have no keys - return empty array
  return []
}

/**
 * Get the keys from an object or indices from an array
 * For objects, keys are in insertion order (not sorted)
 * For arrays, returns indices from 0 to length-1
 * Non-object types return an empty array
 *
 * @param input The input object or array
 * @returns Array of keys (unsorted) or indices
 */
export const getKeysUnsorted = (input: unknown): string[] | number[] => {
  // Handle null and undefined
  if (isNullOrUndefined(input)) {
    return []
  }

  // Handle arrays - return indices
  if (Array.isArray(input)) {
    // Simply return array of indices - no special marking needed
    return Array.from({ length: input.length }, (_, i) => i)
  }

  // Handle objects - return keys in insertion order (not sorted)
  if (typeof input === 'object' && input !== null) {
    // Return keys array without sorting - no special marking needed
    return Object.keys(input)
  }

  // Non-object types have no keys - return empty array
  return []
}
