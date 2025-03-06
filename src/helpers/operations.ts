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
    return []
  }

  // Process each element function to get array elements
  const result: any[] = []

  for (const elementFn of elementFns) {
    let { values } = elementFn(input)
    console.log('values', values)

    if (!Array.isArray(values)) {
      values = [values]
    }

    for (const item of values) {
      console.log('item', item)
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

export const handleSequence = (input: Array<any>, fns: ((input: Array<any>) => Array<any>)[]): Array<any> => {
  const results = []

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
  const results = []

  for (const item of input) {
    if (Array.isArray(item)) {
      const result = fn(item)
      results.push(result)
    } else if (typeof item === 'object') {
      const result = fn(Object.values(item))
      results.push(result)
    } else {
      throw new Error('Cannot map over non-array or object')
    }
  }

  return results
}

export const handleMapValues = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  const results = []
  for (const item of input) {
    console.log('item', item)
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
        console.log('fnResult', fnResult)
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

export const handleSelect = (input: Array<any>, fn: (input: any) => any): Array<any> => {
  const results = []

  const conditions = fn(input)

  console.log('handleSelect', input, conditions)

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

export const handleRecursiveDescent = (input: Array<any>): Array<any> => {
  console.log('handleRecursiveDescent init', input)
  const results = [...input]

  console.log('handleRecursiveDescent', input, 'results before iteration', results)

  for (const item of input) {
    if (Array.isArray(item)) {
      results.push(...handleRecursiveDescent(item))
    } else if (typeof item === 'object') {
      results.push(...handleRecursiveDescent(Object.values(item), false))
    }
  }

  console.log('handleRecursiveDescent', input, 'results', results)

  return results
}
