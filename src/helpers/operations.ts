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
    const leftResult = ensureArray(leftFn([item]))

    console.log('leftResult', leftResult)

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
  console.log('constructObject', input, fields)
  const results = []

  for (const item of input) {
    let objects = [{}]

    for (const field of fields) {
      const key = typeof field.key === 'function' ? field.key([item]) : field.key
      const values = ensureArray(field.value([item]))

      let newObjects = []
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

export const handleSequence = (input: Array<any>, fns: ((input: Array<any>) => Array<any>)[]): Array<any> => {
  let results = []

  for (const item of input) {
    for (const fn of fns) {
      const res = ensureArray(fn([item]))
      results.push(...res)
    }
  }

  console.log('handleSequence', input, 'results', results)

  return results
}

export const handleMap = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  console.log('handleMap', input, fn)
  let results = []

  for (const item of input) {
    if (Array.isArray(item)) {
      const result = fn(item)
      results.push(result)
    } else if (typeof item === 'object')  {
      const result = fn(Object.values(item))
      results.push(result)
    } else {
      throw new Error('Cannot map over non-array or object')
    }
  }

  return results
}
