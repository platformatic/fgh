/**
 * Mathematical operations for FGH expressions
 * Implements arithmetic operators (+, -, *, /, %) with type-aware behavior
 * for various data types including numbers, strings, arrays, and objects
 */

import { isNullOrUndefined, ensureArray } from './utils.ts'

/**
 * Implements the addition (+) operator with type-specific behavior:
 * - Numbers: standard arithmetic addition
 * - Arrays: array concatenation
 * - Objects: object property merging
 * - Mixed types: various conversions based on JQ semantics
 *
 * @param leftArray Array of values to use as left operands
 * @param rightArray Array of values to use as right operands
 * @returns Array of results from adding each combination of left and right values
 * @throws Error when attempting incompatible operations like array+non-array
 */
export const addValues = (leftArray: any, rightArray: any): Array<any> => {
  // Ensure leftArray and rightArray are properly wrapped
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: any[] = []

  console.log('leftArray:', leftArray)
  console.log('rightArray:', rightArray)

  // Regular case-by-case handling
  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]

      // First handle array concatenation
      if (Array.isArray(left) && Array.isArray(right)) {
        // Use array spread operator for proper array concatenation
        results.push([...left, ...right])
        // Handle object merging
      } else if (typeof left === 'object' && typeof right === 'object' && left !== null && right !== null) {
        results.push({ ...left, ...right })
        // Handle null/undefined on either side
      } else if (left === undefined || left === null) {
        results.push(right)
      } else if (right === undefined || right === null) {
        results.push(left)
        // Prevent mixing arrays with non-arrays
      } else if (Array.isArray(left)) {
        throw new Error('Cannot add array to non-array')
      } else if (Array.isArray(right)) {
        throw new Error('Cannot add array to non-array')
        // Default case: convert to string or number and add
      } else {
        results.push(left + right)
      }
    }
  }

  console.log('results:', results)

  return results
}

/**
 * Implements the subtraction (-) operator with type-specific behavior:
 * - Numbers: standard arithmetic subtraction
 * - Arrays: removes elements from left array that are in right array
 * - Mixed types: converts to numbers when possible
 *
 * @param leftArray Array of values to use as left operands
 * @param rightArray Array of values to use as right operands
 * @returns Array of results from subtracting each right value from each left value
 * @throws Error for incompatible operations (null/undefined, objects, mixed array/non-array)
 */
export const subtractValues = (leftArray: any, rightArray: any): any => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]

      if (Array.isArray(left) && Array.isArray(right)) {
        results.push(left.filter((item) => !right.includes(item)))
      } else if (typeof left === 'object' && typeof right === 'object' && left !== null && right !== null) {
        throw new Error('Cannot subtract objects')
      } else if (left === undefined || left === null) {
        throw new Error('Cannot subtract from non-number')
      } else if (Array.isArray(left) && right !== null) {
        throw new Error('Cannot subtract array to non-array')
      } else if (Array.isArray(right) && left !== null) {
        throw new Error('Cannot subtract array to non-array')
      } else if (right === undefined || right === null) {
        throw new Error('Cannot subtract null or undefined')
      } else {
        results.push(left - right)
      }
    }
  }

  return results
}

/**
 * Implements the multiplication (*) operator with type-specific behavior:
 * - Numbers: standard arithmetic multiplication
 * - String×Number: string repetition ("a" * 3 = "aaa")
 * - Mixed types: converts to numbers when possible
 *
 * @param leftArray Array of values to use as left operands
 * @param rightArray Array of values to use as right operands
 * @returns Array of results from multiplying each left value by each right value
 * @throws Error for incompatible operations like array multiplication
 */
export const multiplyValues = (leftArray: any, rightArray: any): any => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: any[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]
      // Handle null/undefined inputs
      if (isNullOrUndefined(left) || isNullOrUndefined(right)) {
        results.push(0)
        // For numeric multiplication
      } else if (typeof left === 'number' && typeof right === 'number') {
        results.push(left * right)
        // String repetition: "a" * 3 = "aaa"
      } else if (typeof left === 'string' && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
        results.push(...left.repeat(right))
      } else if (typeof right === 'string' && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
        results.push(...right.repeat(left))
        // Array repetition: [1, 2] * 3 = [1, 2, 1, 2, 1, 2]
      } else if (Array.isArray(left) && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
        throw new Error('Cannot multiply array by number')
      } else if (Array.isArray(right) && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
        throw new Error('Cannot multiply array by number')
      } else {
        // Try to convert values to numbers if possible
        const leftNum = Number(left)
        const rightNum = Number(right)
        if (!isNaN(leftNum) && !isNaN(rightNum)) {
          results.push(leftNum * rightNum)
        } else {
          throw new Error('Cannot multiply non-numeric values')
        }
      }
    }
  }

  return results
}

/**
 * Implements the division (/) operator with type-specific behavior:
 * - Numbers: standard arithmetic division
 * - Mixed types: converts to numbers when possible
 *
 * @param leftArray Array of values to use as left operands (dividends)
 * @param rightArray Array of values to use as right operands (divisors)
 * @returns Array of results from dividing each left value by each right value
 * @throws Error for incompatible operations or null/undefined values
 */
export const divideValues = (leftArray: any, rightArray: any): any => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: any[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]
      // Handle null/undefined inputs
      if (isNullOrUndefined(left) || isNullOrUndefined(right)) {
        throw new Error('Cannot divide null or undefined')
        // For numeric division
      } else if (typeof left === 'number' && typeof right === 'number') {
        results.push(left / right)
        // String repetition: "a" * 3 = "aaa"
      } else if (typeof left === 'string' && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
        throw new Error('Cannot divide string by number')
      } else if (typeof right === 'string' && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
        throw new Error('Cannot divide number by string')
      } else if (Array.isArray(left) && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
        throw new Error('Cannot divide array by number')
      } else if (Array.isArray(right) && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
        throw new Error('Cannot divide array by number')
      } else {
        // Try to convert values to numbers if possible
        const leftNum = Number(left)
        const rightNum = Number(right)
        if (!isNaN(leftNum) && !isNaN(rightNum)) {
          results.push(leftNum / rightNum)
        } else {
          throw new Error('Cannot multiply non-numeric values')
        }
      }
    }
  }

  return results
}

/**
 * Implements the modulo (%) operator with mathematical (not just JavaScript) semantics:
 * - Always returns a non-negative result for positive divisors
 * - Handles special cases like null/undefined and zero divisor
 * - Applies true mathematical modulo rather than remainder operation
 *
 * @param leftArray Array of values to use as left operands (dividends)
 * @param rightArray Array of values to use as right operands (divisors)
 * @returns Array of modulo results for each combination of values
 */
export const moduloValues = (leftArray: any, rightArray: any): any => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: any[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]

      // Handle null/undefined inputs
      if (isNullOrUndefined(left)) {
        results.push(0)
      } else if (isNullOrUndefined(right)) {
        results.push(left) // Modulo by null treated as identity
        // Handle modulo by zero - return NaN rather than causing an error
      } else if (right === 0) {
        results.push(NaN)
        // For numeric modulo
      } else if (typeof left === 'number' && typeof right === 'number') {
        // JavaScript's % operator retains the sign of the dividend, but we want true mathematical modulo
        // For modulo, we want to ensure the result is always in the range [0, abs(right)-1]
        const mod = left % right
        // If mod is negative, we add the absolute value of right to make it positive
        results.push(mod < 0 ? mod + Math.abs(right) : mod)
      } else {
        // Try to convert values to numbers if possible
        const leftNum = Number(left)
        const rightNum = Number(right)
        if (!isNaN(leftNum) && !isNaN(rightNum)) {
          if (rightNum === 0) return NaN
          const mod = leftNum % rightNum
          results.push(mod < 0 ? mod + Math.abs(rightNum) : mod)
        }
        // Default: return NaN for incompatible types
        results.push(NaN)
      }
    }
  }

  return results
}
