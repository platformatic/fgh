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
 * Ensure the final result is always an array according to the new FGH API
 * @param result The result to convert to an array
 * @returns The result as an array
 */
export const ensureArrayResult = (result: any): any[] => {
  // Special handling for null from select filter - return empty array
  if (result === null && (result as any)?._fromSelectFilter) {
    return []
  }
  
  // For other null values, we want to return [null], not an empty array
  if (result === null) return [null]
  
  // If result is undefined, return an empty array
  if (result === undefined) return []
  
  // If result is already an array, we need to decide based on whether we're dealing
  // with a direct array input or array elements
  if (Array.isArray(result)) {
    // Handle arrays that are final results (like from keys/keys_unsorted)
    // which should be returned without additional wrapping
    if ((result as any)._isFinalResult) {
      return result
    }
    
    // Special handling for empty array from select filter - we need to wrap it
    if ((result as any)._fromSelectFilter && result.length === 0) {
      return [result]
    }
    
    // If array is from map or map_values filter, we need to wrap the entire array
    if ((result as any)._fromMapFilter || (result as any)._fromMapValuesFilter) {
      return [result]
    }
    
    // Arrays that need to be preserved as-is (from default operator)
    if ((result as any)._preserveArray) {
      return [result]
    }
    
    // If array is from array iteration, return as-is
    if ((result as any)._fromArrayConstruction || result.length === 0) {
      return [...result]
    }
    
    // If it's the original input, wrap it
    return [result]
  }
  
  // If result is a scalar value, wrap it in an array
  return [result]
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use ensureArrayResult instead
 */
export const flattenResult = ensureArrayResult
