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
  input: Array<any>,
  prop: string,
  optional = false
): Array<any> => {
  const results: any[] = []

  for (const obj of input) {
    if (isNullOrUndefined(obj)) {
      results.push(obj)
      continue
    }

    console.log('accessProperty', obj, prop, optional)

    const value = getNestedValue(obj, prop.split('.'), optional)
    results.push(value)
  }

  console.log('accessProperty', input, prop, results)
  
  return results
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
export const iterateArray = (input: Array<any>): Array<any> => {
  const results: any[] = []

  for (const item of input) {
    if (Array.isArray(item)) {
      results.push(...item)
    } else if (typeof input === 'object' && input !== null) {
      results.push(...Object.values(input))
    }
  }
  console.log('iterateArray', input, results)

  return results
}
