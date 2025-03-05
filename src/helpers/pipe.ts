/**
 * Custom pipe helpers for specific edge cases
 */
import { getKeys, getKeysUnsorted } from './keys.ts'

/**
 * Special helper for handling array iteration to select piping
 * Ensures array structure is consistent with test expectations
 */
export const handleArrayIterationToSelectPipe = (
  input: any,
  conditionFn: (item: any) => any
): any => {
  // For non-array inputs, apply the condition but return in consistent array form
  if (!Array.isArray(input)) {
    const conditionResult = conditionFn(input)
    const isTruthy = Array.isArray(conditionResult) 
      ? conditionResult.some(val => val !== null && val !== undefined && val !== false)
      : (conditionResult !== null && conditionResult !== undefined && conditionResult !== false)
    
    return isTruthy ? [input] : []
  }

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

  // For empty results, return an empty array
  if (results.length === 0) {
    return []
  }
  
  // Return results directly for array iteration case
  return results
}
