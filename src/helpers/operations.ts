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

  const results = []

  for (const item of input) {
    const leftResult = leftFn([item])

    console.log('leftResult', leftResult)

    const rightResult = rightFn(leftResult)
    if (!isNullOrUndefined(rightResult)) {
      results.push(...rightResult)
    }
  }

  return results
}

/**
 * Construct an array by applying element functions to the input
 * @param input The input value
 * @param elementFns The functions to apply to the input to get array elements
 * @returns The constructed array
 */
export const constructArray = (
  input: Array<any>,
  elementFns: ((input: any) => any)[]
): any[] => {
  // Handle empty arrays
  if (elementFns.length === 0) {
    return [];
  }
  
  // Process each element function to get array elements
  const result: any[] = [];
  
  for (const elementFn of elementFns) {
    let { values } = elementFn(input);
    console.log('values', values)

    if (!Array.isArray(values)) {
      values = [values]
    }

    for (const item of values) {
      console.log('item', item)
      // Skip undefined/null results
      if (isNullOrUndefined(item)) continue;
      
      result.push(item);
    }
  }
  
  return [result];
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
  input: Array<any>,
  fields: FieldDefinition[]
): Array<any> => {
  // Special case for empty input
  if (input.length === 0 || input[0] == null || input[0] === undefined) {
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

    return [result]
  }

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

    // For object construction with array expansion, we need to be consistent
    // with how arrays are processed in the standardizeResult function
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

    return [result]
  }
}
