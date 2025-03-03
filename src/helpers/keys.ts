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
    const result = Array.from({ length: input.length }, (_, i) => i)
    // Mark as array construction to preserve its structure
    try {
      Object.defineProperty(result, '_fromArrayConstruction', { value: true })
    } catch (e) {
      // If we can't set the property (rare case with frozen objects), still continue
    }
    return result
  }

  // Handle objects - return sorted keys
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input).sort()
    // Mark as array construction to preserve its structure
    try {
      Object.defineProperty(keys, '_fromArrayConstruction', { value: true })
    } catch (e) {
      // If we can't set the property (rare case with frozen objects), still continue
    }
    return keys
  }

  // Non-object types have no keys - return empty array
  const result: any[] = []
  // Mark as array construction to preserve its structure
  try {
    Object.defineProperty(result, '_fromArrayConstruction', { value: true })
  } catch (e) {
    // If we can't set the property (rare case with frozen objects), still continue
  }
  return result
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
    const result = Array.from({ length: input.length }, (_, i) => i)
    // Mark as array construction to preserve its structure
    try {
      Object.defineProperty(result, '_fromArrayConstruction', { value: true })
    } catch (e) {
      // If we can't set the property (rare case with frozen objects), still continue
    }
    return result
  }

  // Handle objects - return keys in insertion order (not sorted)
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input)
    // Mark as array construction to preserve its structure
    try {
      Object.defineProperty(keys, '_fromArrayConstruction', { value: true })
    } catch (e) {
      // If we can't set the property (rare case with frozen objects), still continue
    }
    return keys
  }

  // Non-object types have no keys - return empty array
  const result: any[] = []
  // Mark as array construction to preserve its structure
  try {
    Object.defineProperty(result, '_fromArrayConstruction', { value: true })
  } catch (e) {
    // If we can't set the property (rare case with frozen objects), still continue
  }
  return result
}
