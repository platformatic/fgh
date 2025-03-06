/**
 * Helper functions for object and array keys operations
 */

/**
 * Get the keys from an object or indices from an array
 * For objects, keys are sorted by unicode codepoint order
 * For arrays, returns indices from 0 to length-1
 * Non-object types return an empty array
 *
 * @param input The input object or array
 * @returns Array of keys (sorted) or indices
 */
export const getKeys = (input: Array<any>): Array<string> => {
  return getKeysUnsorted(input, true)
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
export const getKeysUnsorted = (input: Array<any>, sort: boolean = false): Array<string> => {
  console.log('getKeys', input)

  const results: string[] = []

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

  console.log('getKeys', input, results)

  return results
}
