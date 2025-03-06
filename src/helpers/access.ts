/**
 * Helper functions for accessing properties and elements from objects and arrays
 */

import { isNullOrUndefined } from './utils.ts'

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
    if (Array.isArray(obj)) {
      if (!optional) {
        throw new Error(`Cannot index array with string ${prop}`)
      }
      continue
    }

    if (isNullOrUndefined(obj)) {
      if (!optional) {
        results.push(obj)
      }
      continue
    }

    const value = obj[prop]

    if (value !== undefined || !optional) {
      results.push(value)
      continue
    }
  }

  return results
}

/**
 * Access an element at a specific index from an array or array-like object
 * @param obj The array or object to access
 * @param idx The index to access
 * @returns The element at the specified index, or undefined
 */
export const accessIndex = (obj: Array<any>, idx: number): any => {
  const results: any[] = []

  for (const item of obj) {
    if (Array.isArray(item)) {
      const index = idx < 0 ? item.length + idx : idx
      results.push(item[index])
    } else if (typeof item === 'object' && item !== null) {
      results.push(Object.values(item)[idx])
    }
  }

  return results
}

/**
 * Extract a slice of an array or string
 * @param input The array or string to slice
 * @param start The start index
 * @param end The end index
 * @returns The sliced array or string, or undefined
 */
export const accessSlice = (
  input: Array<any>,
  start: number | null,
  end: number | null
): Array<any> => {
  const results = []
  for (const item of input) {
    let currentStart = start
    let currentEnd = end
    if (currentEnd === null) {
      currentEnd = item.length
      if (currentStart < 0) {
        currentStart = item.length + currentStart
      }
    }

    if (Array.isArray(item)) {
      results.push(item.slice(currentStart, currentEnd))
    } else if (typeof item === 'string') {
      results.push(item.slice(currentStart, currentEnd))
    } else {
      throw new Error(`Cannot slice ${item}`)
    }
  }

  return results
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
      results.push(...Object.values(item))
    }
  }

  return results
}
