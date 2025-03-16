/**
 * Helper functions for FGH high-level operations
 * Implements pipe (|), array/object construction, mapping, filtering, and
 * various data transformation operations with consistent handling of
 * arrays, objects, and scalar values
 */

import { isNullOrUndefined, ensureArray } from './utils.ts'

/**
 * Implements the JQ pipe operator (|) for function composition
 * Applies the left function to each input item, then feeds those results
 * into the right function, creating a processing pipeline
 *
 * @param input Array of input values to process through the pipeline
 * @param leftFn Function to apply first (left side of the pipe)
 * @param rightFn Function to apply to the results of leftFn (right side of the pipe)
 * @returns Combined results after applying both functions in sequence
 */
export const handlePipe = (
  input: any,
  leftFn: (input: any) => any,
  rightFn: (input: any) => any
): any => {
  const results = []

  for (const item of input) {
    const leftResult = ensureArray(leftFn([item]))

    for (const leftItem of leftResult) {
      const rightResult = rightFn([leftItem])
      if (!isNullOrUndefined(rightResult)) {
        results.push(...rightResult)
      }
    }
  }

  return results
}

/**
 * Implements array construction for JQ expressions like [.a, .b, .c]
 * Executes each element function on the input and collects the results
 * into a single array, handling null/undefined values appropriately
 *
 * @param input Array of input values to process
 * @param elementFns Array of functions that generate the array elements
 * @returns Single-element array containing the constructed array
 */
export const constructArray = (
  input: Array<any>,
  elementFns: ((input: any) => any)[]
): any[] => {
  // Handle empty arrays
  if (elementFns.length === 0) {
    return []
  }

  // Process each element function to get array elements
  const result: any[] = []

  for (const elementFn of elementFns) {
    let { values } = elementFn(input)

    if (!Array.isArray(values)) {
      values = [values]
    }

    for (const item of values) {
      // Skip undefined/null results
      if (isNullOrUndefined(item)) continue

      result.push(item)
    }
  }

  return [result]
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
 * Implements object construction for JQ expressions like {key: .value}
 * Creates objects by computing each field's key and value dynamically,
 * with support for both static and computed property names
 *
 * @param input Array of input values to process
 * @param fields Array of field definitions with key/value functions
 * @returns Array of constructed objects with all field combinations
 */
export const constructObject = (
  input: Array<any>,
  fields: FieldDefinition[]
): Array<any> => {
  const results = []

  for (const item of input) {
    let objects = [{}]

    for (const field of fields) {
      const key = typeof field.key === 'function' ? field.key([item]) : field.key
      const values = ensureArray(field.value([item]))

      const newObjects = []
      for (const obj of objects) {
        for (const value of values) {
          const newObj = { ...obj, [key]: value }
          newObjects.push(newObj)
        }
      }
      objects = newObjects
    }

    results.push(...objects)
  }

  return results
}

/**
 * Implements the JQ comma operator for sequencing operations
 * Executes each function in the sequence and concatenates all results
 *
 * @param input Array of input values to process
 * @param fns Array of functions to apply in sequence
 * @returns Array containing the concatenated results of all functions
 */
export const handleSequence = (input: Array<any>, fns: ((input: Array<any>) => Array<any>)[]): Array<any> => {
  const results = []

  for (const item of input) {
    for (const fn of fns) {
      const res = ensureArray(fn([item]))
      results.push(...res)
    }
  }

  return results
}

/**
 * Implements the JQ 'map' function for arrays and objects
 * Transforms each item in arrays or each value in objects
 * using the provided mapping function
 *
 * @param input Array of arrays or objects to map over
 * @param fn Mapping function to apply to each item
 * @returns Array of mapped results
 * @throws Error when attempting to map over non-array and non-object values
 */
export const handleMap = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  // Results array will hold one array containing all mapped values
  const finalResults = [];
  const allResults = [];

  for (const item of input) {
    if (Array.isArray(item)) {
      // For arrays, apply the function directly to each element
      for (const element of item) {
        // Get all results from applying the function to this element
        const results = fn([element]);
        // Add all results to our collection
        for (const result of results) {
          allResults.push(result);
        }
      }
    } else if (typeof item === 'object' && item !== null) {
      // For objects, extract property values and apply function to each
      const values = Object.values(item);
      
      // When mapping over an object, apply the function to each property individually
      for (const value of values) {
        // Get all results from applying the function to this value
        const results = fn([value]);
        // Add all results to our collection
        for (const result of results) {
          allResults.push(result);
        }
      }
    } else {
      throw new Error('Cannot map over non-array or object')
    }
  }

  // Handle empty results array (for the "empty" filter case)
  if (allResults.length === 0 || allResults.every(r => r === undefined)) {
    finalResults.push([]);
  } else {
    // Return a single array containing all the mapped values
    finalResults.push(allResults.filter(r => r !== undefined));
  }
  
  return finalResults;
}

/**
 * Implements the JQ 'map_values' function for transforming values
 * For arrays: transforms each element while preserving array structure
 * For objects: transforms each value while preserving keys and structure
 *
 * @param input Array of arrays or objects to transform
 * @param fn Transformation function to apply to each value
 * @returns Array of transformed inputs with structure preserved
 * @throws Error when attempting to map over non-array and non-object values
 */
export const handleMapValues = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  const results = []
  for (const item of input) {
    if (Array.isArray(item)) {
      const partial = []
      for (const subitem of item) {
        const [result] = fn([subitem])
        if (!isNullOrUndefined(result)) {
          partial.push(result)
        }
      }
      results.push(partial)
    } else if (typeof item === 'object') {
      const keys = Object.keys(item)

      const obj = {}
      for (const key of keys) {
        const fnResult = fn([item[key]])
        const result = fnResult?.[0]

        if (!isNullOrUndefined(result)) {
          obj[key] = result
        }
      }
      results.push(obj)
    } else {
      throw new Error('Cannot map over non-array or object')
    }
  }
  return results
}

/**
 * Implements the JQ 'select' function for filtering
 * Keeps only elements that match the provided condition,
 * with special handling for filtering arrays vs. scalar values
 *
 * @param input Array of values to filter
 * @param fn Function that returns boolean conditions for filtering
 * @returns Array containing only values that passed the condition
 */
export const handleSelect = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  const results = []

  const conditions = fn(input)

  for (let i = 0; i < input.length; i++) {
    const condition = conditions[i]
    const item = input[i]

    if (Array.isArray(item)) {
      results.push(item.filter((_, idx) => condition[idx]))
    } else if (condition) {
      results.push(item)
    }
  }

  return results
}

/**
 * Implements the JQ recursive descent operator (..)
 * Recursively traverses arrays and objects, collecting all nested values
 * at any depth into a flat result array
 *
 * @param input Array of values to recursively traverse
 * @returns Flattened array containing the input items and all of their descendants
 */
export const handleRecursiveDescent = (input: Array<any>): Array<any> => {
  const results = [...input]

  for (const item of input) {
    if (Array.isArray(item)) {
      results.push(...handleRecursiveDescent(item))
    } else if (typeof item === 'object') {
      results.push(...handleRecursiveDescent(Object.values(item)))
    }
  }

  return results
}
