/**
 * Helper functions for extracting and manipulating keys from objects and arrays
 * Provides utilities for retrieving keys in sorted or insertion order,
 * with special handling for different data types
 */

/**
 * Implements the JQ 'keys' function to extract keys from objects or indices from arrays
 * For objects, returns property names sorted by unicode codepoint order
 * For arrays, returns indices from 0 to length-1 as numbers
 *
 * @param input Array of objects or arrays to extract keys/indices from
 * @returns Array of arrays containing the keys (as strings) or indices (as numbers)
 * @throws Error when input is neither an object nor an array
 */
export const getKeys = (input: Array<any>): Array<(string | number)[]> => {
  return getKeysUnsorted(input, true)
}

/**
 * Implements the JQ 'keys_unsorted' function to extract keys from objects or indices from arrays
 * For objects, returns property names in their original insertion order (unless sort=true)
 * For arrays, returns indices from 0 to length-1 as numbers
 *
 * @param input Array of objects or arrays to extract keys/indices from
 * @param sort Optional flag to sort the keys (defaults to false)
 * @returns Array of arrays containing the keys (as strings) or indices (as numbers)
 * @throws Error when input is neither an object nor an array
 */
export const getKeysUnsorted = (input: Array<any>, sort: boolean = false): Array<(string | number)[]> => {
  const results: (string | number)[][] = []

  for (const item of input) {
    if (Array.isArray(item)) {
      const keys = Array.from({ length: item.length }, (_, i) => i)
      results.push(keys)
    } else if (typeof item === 'object' && item !== null) {
      const keys = Object.keys(item)
      if (sort) {
        keys.sort()
      }
      results.push(keys)
    } else {
      throw new Error(`Cannot get keys from ${item}`)
    }
  }

  return results
}
