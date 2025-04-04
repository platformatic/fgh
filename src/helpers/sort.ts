/**
 * Helper functions for sorting and comparing values in FGH expressions
 * Implements consistent ordering, array sorting, and deep equality comparison
 * with special handling for all data types
 */

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
 * Implements the JQ 'sort' function to sort array contents
 * Sorts each array in the input using the JQ type-aware comparison rules,
 * preserving the original array structure while sorting its contents
 *
 * @param input Array of arrays to sort
 * @returns Array of sorted arrays
 * @throws Error when attempting to sort non-array values
 */
export const sortArray = (input: Array<any>): Array<any> => {
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
 * Implements the JQ 'sort_by(path)' function for custom sorting
 * Sorts arrays based on the values obtained by applying path expressions
 * to each element, supporting multi-level sorting with multiple paths
 *
 * @param input Array of arrays to sort
 * @param paths Array of functions that compute sort keys for each element
 * @returns Array of arrays sorted according to the specified path criteria
 * @throws Error when attempting to sort non-array values
 */
export const sortArrayBy = (
  input: any,
  paths: ((item: any) => any)[]
): any => {
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
 * Performs a deep equality comparison between two values of any type
 * Used by the equality (==) and inequality (!=) operators to determine
 * if two values should be considered equal, with structural comparison
 * for complex types like arrays and objects
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
