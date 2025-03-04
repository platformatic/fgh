/**
 * Helper functions for accessing properties and elements from objects and arrays
 */

import { isNullOrUndefined, getNestedValue } from './utils.ts'

/**
 * Access a property from an object, with support for nested properties and array iteration
 * @param obj The object to access the property from
 * @param prop The property path (dot notation)
 * @param optional Whether to use optional chaining for property access
 * @returns The property value if found, or undefined
 */
export const accessProperty = (
  obj: any,
  prop: string,
  optional = false
): any => {
  process._rawDebug('accessProperty', obj, prop, optional)
  if (isNullOrUndefined(obj)) return undefined

  // Special case for array elements - critical for array iteration with property access
  if (Array.isArray(obj)) {
    // Create a collector for all the values
    const results: any[] = []

    // Process each item in the array
    for (const item of obj) {
      // Skip non-objects
      if (isNullOrUndefined(item) || typeof item !== 'object') continue

      // Get the property value
      const value = getNestedValue(item, prop.split('.'), optional)

      // Only add non-null values
      if (!isNullOrUndefined(value)) {
        // Handle nested arrays
        if (Array.isArray(value)) {
          // Push each item
          results.push(...value)
        } else {
          // Push the single value
          results.push(value)
        }
      }
    }

    // Return the array of results or undefined if empty
    return results.length > 0 ? results : undefined
  }

  // Regular property access on an object
  const value = getNestedValue(obj, prop.split('.'), optional)
  
  return value
}

/**
 * Access an element at a specific index from an array or array-like object
 * @param obj The array or object to access
 * @param idx The index to access
 * @returns The element at the specified index, or undefined
 */
export const accessIndex = (obj: any, idx: number): any => {
  if (isNullOrUndefined(obj)) return undefined

  if (Array.isArray(obj)) {
    if (obj.some(Array.isArray)) {
      const results = obj
        .map(item => Array.isArray(item) ? item[idx] : undefined)
        .filter(x => !isNullOrUndefined(x))

      return results.length > 0 ? results : undefined
    }

    // Handle negative indices to access from the end of the array
    if (idx < 0) {
      const actualIdx = obj.length + idx
      return actualIdx >= 0 && actualIdx < obj.length ? obj[actualIdx] : undefined
    }

    return idx >= 0 && idx < obj.length ? obj[idx] : undefined
  }

  if (typeof obj === 'object' && obj !== null) {
    const arrays = Object.values(obj).filter(Array.isArray)
    if (arrays.length > 0) {
      const arr = arrays[0]

      // Handle negative indices for nested arrays too
      if (idx < 0) {
        const actualIdx = arr.length + idx
        return actualIdx >= 0 && actualIdx < arr.length ? arr[actualIdx] : undefined
      }

      return idx >= 0 && idx < arr.length ? arr[idx] : undefined
    }
  }

  return undefined
}

/**
 * Extract a slice of an array or string
 * @param input The array or string to slice
 * @param start The start index
 * @param end The end index
 * @returns The sliced array or string, or undefined
 */
export const accessSlice = (
  input: any,
  start: number | null,
  end: number | null
): any => {
  if (isNullOrUndefined(input)) return undefined

  // Convert null start/end to undefined for array slice operator
  const startIdx = start !== null ? start : undefined
  const endIdx = end !== null ? end : undefined

  if (Array.isArray(input)) {
    const result = input.slice(startIdx, endIdx)
    return result
  }

  if (typeof input === 'string') {
    return input.slice(startIdx, endIdx)
  }

  return undefined
}

/**
 * Iterate over an array or object's values
 * @param input The array or object to iterate over
 * @returns The array of values, or undefined
 */
export const iterateArray = (input: any): any => {
  process._rawDebug('iterateArray', input)
  if (isNullOrUndefined(input)) return undefined

  if (Array.isArray(input)) {
    // Just return a copy of the array
    return [...input]
  }

  if (typeof input === 'object' && input !== null) {
    // Get object values as an array
    return Object.values(input)
  }

  return undefined
}
