/**
 * Custom pipe helpers for specific edge cases
 */
import { getKeys, getKeysUnsorted } from './keys.ts'

/**
 * Special helper for handling array iteration to select piping
 * Simplified for the new array handling approach
 */
export const handleArrayIterationToSelectPipe = (
  input: any,
  conditionFn: (item: any) => any
): any => {
  if (!Array.isArray(input)) return input

  // Get each result from applying the select function to each item in the array
  const results: any[] = []
  for (const item of input) {
    const conditionResult = conditionFn(item)
    // Include the item if the condition evaluates to a truthy value
    // Handle array condition results (from operations like .[] | select(.foo == "bar"))
    if (Array.isArray(conditionResult)) {
      // Check if any values in the array are truthy
      const hasTruthy = conditionResult.some(val => val !== null && val !== undefined && val !== false)
      if (hasTruthy) {
        results.push(item)
      }
    } 
    // Handle scalar condition results
    else if (conditionResult !== null && conditionResult !== undefined && conditionResult !== false) {
      results.push(item)
    }
  }

  // Return the filtered array directly
  return results
}

/**
 * Special helper for handling array iteration to keys piping
 * Simplified for the new array handling approach
 *
 * @param input The array from array iteration, containing objects to extract keys from
 * @param isSorted Whether to return keys in sorted order (true) or insertion order (false)
 * @returns Array of arrays of keys, preserving the nested structure
 */
export const handleArrayIterationToKeysPipe = (
  input: any,
  isSorted: boolean = true
): any => {
  if (!Array.isArray(input)) {
    // For non-array inputs, just return keys directly
    return isSorted ? getKeys(input) : getKeysUnsorted(input)
  }

  // If this is an empty array, return an empty array
  if (input.length === 0) {
    return []
  }

  // For each item in the array, get the keys
  const results: any[] = []
  for (const item of input) {
    const keys = isSorted ? getKeys(item) : getKeysUnsorted(item)
    // Add the keys as a nested array
    results.push(keys)
  }

  return results
}
