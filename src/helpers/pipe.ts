/**
 * Custom pipe helpers for specific edge cases
 */
import { getKeys, getKeysUnsorted } from './keys.ts'

/**
 * Special helper for handling array iteration to select piping
 * This is needed to make patterns like ".[] | select(.id == "second")" handle
 * returning single items correctly
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
    // Include the item if the condition is true (not null, undefined, or false)
    if (conditionResult !== null && conditionResult !== undefined && conditionResult !== false) {
      results.push(item)
    }
  }

  // Return the filtered array directly
  return results
}

/**
 * Special helper for handling array iteration to keys piping
 * This is needed to make .users[] | keys return the keys for each object in array
 * as a nested array instead of flattening
 *
 * Example:
 * Input: {"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}
 * Filter: '.users[] | keys'
 * Output: [["id","name"],["id","name"]]
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
