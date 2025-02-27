/**
 * Helper functions for FGH operations (pipe, array/object construction, etc.)
 */

import { isNullOrUndefined, ensureArray } from './utils.ts'

/**
 * Handle the pipe operation (|) by applying the right function to each result of the left function
 * @param input The input value
 * @param leftFn The function on the left side of the pipe
 * @param rightFn The function on the right side of the pipe
 * @returns The result of piping the left function into the right function
 */
export const handlePipe = (
  input: any,
  leftFn: (input: any) => any,
  rightFn: (input: any) => any
): any => {
  // Get the result of the left function
  const leftResult = leftFn(input)
  if (isNullOrUndefined(leftResult)) return undefined

  // Ensure we have an array to iterate over
  const leftArray = ensureArray(leftResult)
  const results: any[] = []

  // Process each item from the left result
  for (const item of leftArray) {
    // Apply the right function to each item
    const rightResult = rightFn(item)

    // Skip undefined results
    if (isNullOrUndefined(rightResult)) continue

    // Handle arrays from the right function
    if (Array.isArray(rightResult)) {
      // Arrays marked as construction results should be spread
      // Define interface for arrays with _fromArrayConstruction property
      interface ArrayWithConstruction extends Array<any> {
        _fromArrayConstruction?: boolean;
      }

      if ((rightResult as ArrayWithConstruction)._fromArrayConstruction) {
        results.push(...rightResult)

        // Normal arrays should be spread too
      } else {
        results.push(...rightResult)
      }

      // Single values added directly
    } else {
      results.push(rightResult)
    }
  }

  // Make sure the final results array is preserved
  Object.defineProperty(results, '_fromArrayConstruction', { value: true })

  // Return undefined for empty results, otherwise the array
  return results.length === 0 ? undefined : results
}

/**
 * Construct an array by applying element functions to the input
 * @param input The input value
 * @param elementFns The functions to apply to the input to get array elements
 * @returns The constructed array
 */
export const constructArray = (
  input: any,
  elementFns: ((input: any) => any)[]
): any[] => {
  if (isNullOrUndefined(input)) return []

  const result: any[] = []

  // Process each element function
  for (const elementFn of elementFns) {
    // Apply the element function to the input
    const value = elementFn(input)

    // Handle different types of values
    if (Array.isArray(value)) {
      // If the array is already a construction, preserve its structure by spreading
      interface ArrayWithConstruction extends Array<any> {
        _fromArrayConstruction?: boolean;
      }

      if ((value as ArrayWithConstruction)._fromArrayConstruction) {
        result.push(...value)
        // Other arrays should also be flattened
      } else {
        result.push(...value)
      }
      // Add single non-null values directly
    } else if (!isNullOrUndefined(value)) {
      result.push(value)
    }
  }

  // Mark the resulting array as a construction result so it's preserved
  Object.defineProperty(result, '_fromArrayConstruction', { value: true })

  return result
}

/**
 * Interface for an object field definition
 */
interface FieldDefinition {
  isDynamic: boolean
  key: string | ((input: any) => any)
  value: (input: any) => any
}

/**
 * Construct an object by applying field functions to the input
 * @param input The input value
 * @param fields The field definitions for the object
 * @returns The constructed object or array of objects
 */
export const constructObject = (
  input: any,
  fields: FieldDefinition[]
): any => {
  // Special case for null input with object construction - just create the object
  if (input === null) {
    const result: Record<string, any> = {}

    for (const field of fields) {
      if (field.isDynamic) {
        // Dynamic key: {(.user): .titles}
        const dynamicKey = (field.key as Function)(input)
        if (!isNullOrUndefined(dynamicKey)) {
          result[dynamicKey] = field.value(input)
        }
      } else {
        // Static key
        result[field.key as string] = field.value(input)
      }
    }

    return result
  }

  if (isNullOrUndefined(input)) return undefined

  // Handle array input for object construction: { user, title: .titles[] }
  // This creates an array of objects by iterating over array elements in the fields
  const hasArrayField = fields.some(field => {
    const fieldValue = field.value(input)
    return Array.isArray(fieldValue) && !field.isDynamic
  })

  if (hasArrayField) {
    // First, find the array field and its length
    let arrayField: FieldDefinition | undefined
    let arrayLength = 0

    for (const field of fields) {
      const fieldValue = field.value(input)
      if (Array.isArray(fieldValue) && !field.isDynamic) {
        arrayField = field
        arrayLength = fieldValue.length
        break
      }
    }

    // Create an array of objects
    const result: Record<string, any>[] = []

    for (let i = 0; i < arrayLength; i++) {
      const obj: Record<string, any> = {}

      for (const field of fields) {
        const fieldValue = field.value(input)

        if (field === arrayField) {
          obj[field.key as string] = fieldValue[i]
        } else {
          obj[field.key as string] = fieldValue
        }
      }

      result.push(obj)
    }

    return result
  } else {
    // Regular object construction
    const result: Record<string, any> = {}

    for (const field of fields) {
      if (field.isDynamic) {
        // Dynamic key: {(.user): .titles}
        const dynamicKey = (field.key as Function)(input)
        if (!isNullOrUndefined(dynamicKey)) {
          result[dynamicKey] = field.value(input)
        }
      } else {
        // Static key
        result[field.key as string] = field.value(input)
      }
    }

    return result
  }
}
