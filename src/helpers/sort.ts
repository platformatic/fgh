/**
 * Compare values according to JQ sort order:
 * null < false < true < numbers < strings < arrays < objects
 *
 * @param a First value to compare
 * @param b Second value to compare
 * @returns -1 if a < b, 0 if a = b, 1 if a > b
 */
export const compareValues = (a: any, b: any): number => {
  // Type order: null, false, true, numbers, strings, arrays, objects

  // Handle null values (lowest in sort order)
  if (a === null && b === null) return 0
  if (a === null) return -1
  if (b === null) return 1

  // Handle undefined as equivalent to null
  if (a === undefined && b === undefined) return 0
  if (a === undefined) return -1
  if (b === undefined) return 1

  // Handle different types
  const typeA = getValueType(a)
  const typeB = getValueType(b)

  if (typeA !== typeB) {
    return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB)
  }

  // Same type, compare values
  switch (typeA) {
    case 'boolean':
      return a === b ? 0 : a ? 1 : -1
    case 'number':
      return a - b
    case 'string':
      return a.localeCompare(b)
    case 'array':
      return compareArrays(a, b)
    case 'object':
      return compareObjects(a, b)
    default:
      return 0
  }
}

/**
 * The type order for sorting
 */
const typeOrder = ['null', 'boolean', 'number', 'string', 'array', 'object']

/**
 * Get the type of a value for sorting purposes
 */
function getValueType (value: any): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) return 'array'
  return 'object'
}

/**
 * Compare two arrays lexicographically
 */
function compareArrays (a: any[], b: any[]): number {
  const minLength = Math.min(a.length, b.length)

  for (let i = 0; i < minLength; i++) {
    const comparison = compareValues(a[i], b[i])
    if (comparison !== 0) return comparison
  }

  // If we get here, all elements are equal up to the minimum length
  return a.length - b.length
}

/**
 * Compare two objects by their sorted keys, then their values
 */
function compareObjects (a: any, b: any): number {
  const keysA = Object.keys(a).sort()
  const keysB = Object.keys(b).sort()

  // First compare the sets of keys
  const keysComparison = compareArrays(keysA, keysB)
  if (keysComparison !== 0) return keysComparison

  // If keys are the same, compare values key by key
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    const comparison = compareValues(a[key], b[key])
    if (comparison !== 0) return comparison
  }

  return 0
}

/**
 * Sort an array using the JQ sort order
 *
 * @param input The array to sort
 * @returns The sorted array
 */
export const sortArray = (input: Array<any>): Array<any> => {
  console.log('sortArray', input)
  const results = []

  for (const item of input) {
    if (!Array.isArray(item)) {
      throw new Error('Cannot sort non-array')
    }
    const result = [...item].sort(compareValues)
    results.push(result)
  }

  return results
}

/**
 * Sort an array by the results of applying path expressions to each element
 *
 * @param input The array to sort
 * @param paths Array of functions that compute the sort keys
 * @returns The sorted array
 */
export const sortArrayBy = (
  input: any,
  paths: ((item: any) => any)[]
): any => {
  console.log('sortArrayBy', input, paths)
  const results = []

  for (const item of input) {
    if (!Array.isArray(item)) {
      throw new Error('Cannot sort non-array')
    }
    const result = [...item].sort((a, b) => {
      for (const pathFn of paths) {
        const valueA = pathFn([a])
        const valueB = pathFn([b])

        const comparison = compareValues(valueA, valueB)
        if (comparison !== 0) return comparison
      }
      return 0
    })
    results.push(result)
  }

  return results
}

/**
 * Checks if two values are deeply equal
 * This is used for the equality (==) operator
 *
 * @param a First value to compare
 * @param b Second value to compare
 * @returns true if values are deeply equal, false otherwise
 */
export const isDeepEqual = (a: any, b: any): boolean => {
  // Handle null and undefined
  if (a === null && b === null) return true
  if (a === undefined && b === undefined) return true
  if (a === null || a === undefined || b === null || b === undefined) return false

  // For simple types, use strict equality
  if (typeof a !== 'object' && typeof b !== 'object') {
    return a === b
  }

  // Different types are never equal
  const typeA = getValueType(a)
  const typeB = getValueType(b)
  if (typeA !== typeB) return false

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false
    }

    return true
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a).sort()
    const keysB = Object.keys(b).sort()

    if (keysA.length !== keysB.length) return false

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i]
      if (key !== keysB[i]) return false
      if (!isDeepEqual(a[key], b[key])) return false
    }

    return true
  }

  return false
}
