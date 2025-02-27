/**
 * Utility functions for FGH operations
 */

/**
 * Check if a value is null or undefined
 * @param x The value to check
 * @returns True if value is null or undefined
 */
export const isNullOrUndefined = (x: unknown): boolean => x === null || x === undefined

/**
 * Ensure a value is wrapped in an array if it isn't one already
 * @param x The value to ensure is an array
 * @returns The value as an array, or a single-element array containing the value
 */
export const ensureArray = <T>(x: T | T[]): T[] => {
  if (Array.isArray(x)) return x
  return [x]
}

/**
 * Get a nested property value from an object, with optional safe access
 * @param obj The object to get the property from
 * @param props Array of property names to access
 * @param optional Whether to use optional chaining for property access
 * @returns The property value if found, or undefined
 */
export const getNestedValue = (
  obj: any,
  props: string[],
  optional = false
): any => {
  if (isNullOrUndefined(obj)) return undefined

  let value = obj
  for (const prop of props) {
    if (isNullOrUndefined(value)) return undefined

    // Special handling for arrays - map property access over all elements
    if (Array.isArray(value)) {
      // For arrays, we map the property access over all elements
      const results: any[] = []
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const itemValue = optional ? item?.[prop] : item[prop]
          if (!isNullOrUndefined(itemValue)) {
            if (Array.isArray(itemValue)) {
              results.push(...itemValue)
            } else {
              results.push(itemValue)
            }
          }
        }
      }

      if (results.length > 0) {
        // Mark as array construction to preserve
        Object.defineProperty(results, '_fromArrayConstruction', { value: true })
        return results
      }
      return undefined
    }

    // For objects, access normally
    if (typeof value !== 'object') return undefined
    value = optional ? value?.[prop] : value[prop]
  }

  return value
}

/**
 * Flatten the final result of an operation according to FGH rules
 * @param result The result to flatten
 * @returns The flattened result
 */
export const flattenResult = (result: any): any => {
  // Define the types to avoid TS errors
  interface ArrayWithConstruction extends Array<any> {
    _fromArrayConstruction?: boolean;
    _fromDifference?: boolean;
  }
  // Handle non-array cases
  if (isNullOrUndefined(result)) return undefined
  if (!Array.isArray(result)) return result

  // Special case for empty arrays
  if (result.length === 0) {
    // Empty arrays from array construction should be preserved
    if ((result as ArrayWithConstruction)._fromArrayConstruction) {
      return []
    }
    // Otherwise maintain backward compatibility and return undefined
    return undefined
  }

  // Critical: preserve arrays that are marked as construction results
  // This is essential for the comma operator and array iteration to work properly
  if ((result as ArrayWithConstruction)._fromArrayConstruction) {
    return [...result]
  }

  // For array subtraction, always return an array
  if ((result as ArrayWithConstruction)._fromDifference) {
    return [...result] // Ensure we always return an array for difference operations
  }

  // Single-element arrays should be simplified unless they're from array construction
  if (result.length === 1 && !Array.isArray(result[0])) {
    return result[0]
  }

  // Return the array as is for all other cases
  return result
}
