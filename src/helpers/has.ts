/**
 * Helper function for checking if objects have specified keys or arrays have elements at specified indices
 * Implements the `has` builtin function for testing property/element existence
 */

/**
 * Checks if each object in the input array has the specified key or if each array has an element at the specified index
 * For objects, tests if the key exists as a property
 * For arrays, tests if the index is within bounds (0 to length-1)
 *
 * @param input Array of objects or arrays to check for key/index existence
 * @param key The key (string) or index (number) to check
 * @returns Array of boolean values indicating whether each input item has the key/index
 */
export const hasKey = (input: Array<any>, _keyArray: string | number | string[] | number[]): boolean[] => {
  const results: boolean[] = []
  const keyArray = Array.isArray(_keyArray) ? _keyArray : [_keyArray]

  for (const key of keyArray) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('The has filter requires a string or number argument')
    }

    for (const item of input) {
      // For arrays, check if the index is within bounds
      if (Array.isArray(item)) {
        // Convert key to number if it's a string representing a number
        const index = typeof key === 'string' ? parseInt(key, 10) : key

        // Check if index is valid (a non-negative number less than array length)
        const hasIndex = typeof index === 'number' &&
          !isNaN(index) &&
          index >= 0 &&
          index < item.length

        results.push(hasIndex)

        // For objects, check if the key exists
      } else if (typeof item === 'object' && item !== null) {
        results.push(key in item)

        // For other types, return false
      } else {
        results.push(false)
      }
    }
  }

  return results
}
