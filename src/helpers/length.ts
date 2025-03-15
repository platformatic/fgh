/**
 * Length function for FGH
 *
 * Implements the JQ length function which returns:
 * - For strings: the number of Unicode codepoints
 * - For numbers: the absolute value
 * - For arrays: the number of elements
 * - For objects: the number of key-value pairs
 * - For null: zero
 * - For booleans: error
 */

/**
 * Get the length of a value according to JQ rules
 *
 * @param x The value to determine the length of
 * @returns The length as a number
 * @throws Error when calculating the length of a boolean
 */
export const getLength = (x: unknown): number[] => {
  if (Array.isArray(x)) {
    const len = x.length
    const result = new Array(len)

    for (let i = 0; i < len; i++) {
      result[i] = getLengthOfSingleValue(x[i])
    }

    return result
  }

  return [getLengthOfSingleValue(x)]
}

/**
 * Helper function to get the length of a single value
 *
 * @param x The value to determine the length of
 * @returns The length as a number
 * @throws Error when calculating the length of a boolean
 */
const getLengthOfSingleValue = (x: unknown): number => {
  // Handle various types according to JQ specs
  if (x === null || x === undefined) {
    return 0
  }

  if (typeof x === 'string') {
    // Length of string is the number of Unicode codepoints
    return [...x].length
  }

  if (typeof x === 'number') {
    // Length of number is its absolute value
    return Math.abs(x)
  }

  if (Array.isArray(x)) {
    // Length of array is the number of elements
    return x.length
  }

  if (typeof x === 'object') {
    // Length of object is the number of key-value pairs
    return Object.keys(x).length
  }

  if (typeof x === 'boolean') {
    // It's an error to use length on a boolean
    throw new Error(`Cannot calculate length of boolean value: ${x}`)
  }

  // Shouldn't get here, but handle unexpected types
  throw new Error(`Cannot calculate length of value with type: ${typeof x}`)
}
