/**
 * Custom pipe helpers for specific edge cases
 */

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

  // Handle special case: if there's only one match, return the item directly
  // instead of wrapping it in an array
  if (results.length === 1) {
    return results[0]
  }

  // Otherwise, return the entire array with proper construction marking
  if (results.length > 0) {
    Object.defineProperty(results, '_fromArrayConstruction', { value: true })
    return results
  }

  return null
}
