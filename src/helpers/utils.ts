/**
 * Utility functions for FGH operations
 */

/**
 * Preserve nested array structure for tests that need specific array wrapping behavior
 * This function handles cases where nested arrays need to be presented consistently
 * Simplified for the new approach - arrays are returned as is without special handling
 * @param arr The array to format consistently
 * @returns The array itself without special wrapping
 */
export const preserveNestedArrays = <T>(arr: T[]): T[] => {
  if (!Array.isArray(arr)) return [arr];
  
  // Return the array as is - no special handling needed
  return arr;
}

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

      return results.length > 0 ? results : undefined
    }

    // For objects, access normally
    if (typeof value !== 'object') return undefined
    value = optional ? value?.[prop] : value[prop]
  }

  return value
}
