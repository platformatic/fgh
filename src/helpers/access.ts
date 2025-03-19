/**
 * Helper functions for accessing properties and elements from objects and arrays
 * Provides utilities for property access, array indexing, slicing, and iteration
 * with support for optional chaining and error handling
 */

import { isNullOrUndefined } from './utils.ts'

/**
 * Access a property from an array of objects using the given property name
 * Handles nested property access and supports optional chaining
 *
 * @param input Array of objects to access properties from
 * @param prop The property name to access
 * @param optional Whether to use optional chaining (skip undefined/null values)
 * @returns Array of property values extracted from the input objects
 * @throws Error when attempting to access property on an array without optional flag
 */
export const accessProperty = (
  input: Array<any>,
  prop: string,
  optional = false
): Array<any> => {
  const results: any[] = []

  for (const obj of input) {
    // Special case for accessing .length property on arrays and strings
    if (prop === 'length' && (Array.isArray(obj) || typeof obj === 'string')) {
      results.push(obj.length)
      continue
    }

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

    // Throw error if not an object or array (unless using optional access)
    if (typeof obj !== 'object' && !optional) {
      throw new Error(`Cannot index scalar with string: ${prop}`)
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
 * Access elements at a specific index from an array of arrays or objects
 * For arrays, retrieves the element at the given index (with negative index support)
 * For objects, retrieves the value at the given position in Object.values()
 *
 * @param obj Array of arrays or objects to access elements from
 * @param idx The index to access (negative indices count from the end)
 * @param optional Whether to use optional indexing (skip non-array/object values)
 * @returns Array of elements extracted at the specified indices
 * @throws Error when attempting to index a scalar without optional flag
 */
export const accessIndex = (obj: Array<any>, idx: number, optional = false): any => {
  const results: any[] = []

  for (const item of obj) {
    if (Array.isArray(item)) {
      const index = idx < 0 ? item.length + idx : idx
      results.push(item[index])
    } else if (typeof item === 'object' && item !== null) {
      results.push(Object.values(item)[idx])
    } else if (!optional) {
      throw new Error(`Cannot index scalar with number: ${idx}`)
    }
  }

  return results
}

/**
 * Extract a slice from each item in an array of arrays or strings
 * Supports standard slice notation with start/end indices, null values,
 * and negative indices for accessing elements relative to the end
 *
 * @param input Array of arrays or strings to slice
 * @param start The start index (inclusive), null means start from beginning
 * @param end The end index (exclusive), null means slice to the end
 * @returns Array of sliced results from each input item
 * @throws Error when attempting to slice non-array and non-string items
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
 * Flatten arrays or extract values from objects in the input array
 * Implements the JQ array iteration operator [] by unwrapping arrays
 * and converting objects to arrays of their values
 *
 * @param input Array of arrays or objects to iterate/flatten
 * @returns Flattened array containing all elements from inner arrays or object values
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
