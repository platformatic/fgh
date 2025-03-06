/**
 * Mathematical operations for FGH
 */

import { isNullOrUndefined, ensureArray } from './utils.ts'

/**
 * Add two values together, handling various types appropriately
 * @param left The left value
 * @param right The right value
 * @returns The result of adding the values
 */
export const addValues = (leftArray: any, rightArray: any): Array<any> => {
  console.log('addValues', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: any[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      const left = leftArray[i]
      const right = rightArray[k]

      if (Array.isArray(left) && Array.isArray(right)) {
        results.push([...left, ...right])
      } else if (typeof left === 'object' && typeof right === 'object' && left !== null && right !== null) {
        results.push({ ...left, ...right })
      } else if (left === undefined || left === null) {
        results.push(right)
      } else if (Array.isArray(left) && right !== null) {
        throw new Error('Cannot add array to non-array')
      } else if (Array.isArray(right) && left !== null) {
        throw new Error('Cannot add array to non-array')
      } else {
        console.log('addValues', left, right)
        results.push(left + right)
      }
    }
  }

  return results
}

/**
 * Subtract one value from another, handling various types appropriately
 * @param left The left value
 * @param right The right value to subtract
 * @returns The result of subtracting the values
 */
export const subtractValues = (leftArray: any, rightArray: any): any => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results= []

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
 * Multiply two values, handling various types appropriately
 * @param left The left value
 * @param right The right value
 * @returns The result of multiplying the values
 */
export const multiplyValues = (left: any, right: any): any => {
  // Handle null/undefined inputs
  if (isNullOrUndefined(left) || isNullOrUndefined(right)) return 0

  // For numeric multiplication
  if (typeof left === 'number' && typeof right === 'number') {
    return left * right
  }

  // String repetition: "a" * 3 = "aaa"
  if (typeof left === 'string' && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
    return left.repeat(right)
  }

  if (typeof right === 'string' && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
    return right.repeat(left)
  }

  // Array repetition: [1, 2] * 3 = [1, 2, 1, 2, 1, 2]
  if (Array.isArray(left) && typeof right === 'number' && Number.isInteger(right) && right >= 0) {
    const result = []
    for (let i = 0; i < right; i++) {
      result.push(...left)
    }
    return result
  }

  if (Array.isArray(right) && typeof left === 'number' && Number.isInteger(left) && left >= 0) {
    const result = []
    for (let i = 0; i < left; i++) {
      result.push(...right)
    }
    return result
  }

  // Try to convert values to numbers if possible
  const leftNum = Number(left)
  const rightNum = Number(right)
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    return leftNum * rightNum
  }

  // Default: return 0 for incompatible types
  return 0
}

/**
 * Divide one value by another, handling various types appropriately
 * @param left The dividend
 * @param right The divisor
 * @returns The result of dividing the values
 */
export const divideValues = (left: any, right: any): any => {
  // Handle null/undefined inputs
  if (isNullOrUndefined(left)) return 0
  if (isNullOrUndefined(right)) return left // Division by null treated as identity

  // Handle division by zero
  if (right === 0) return Infinity

  // For numeric division
  if (typeof left === 'number' && typeof right === 'number') {
    return left / right
  }

  // Try to convert values to numbers if possible
  const leftNum = Number(left)
  const rightNum = Number(right)
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    return rightNum === 0 ? Infinity : leftNum / rightNum
  }

  // Default: return NaN for incompatible types
  return NaN
}

/**
 * Calculate the modulo of two values
 * @param left The dividend
 * @param right The divisor
 * @returns The remainder after division
 */
export const moduloValues = (left: any, right: any): any => {
  // Handle null/undefined inputs
  if (isNullOrUndefined(left)) return 0
  if (isNullOrUndefined(right)) return left // Modulo by null treated as identity

  // Handle modulo by zero - return NaN rather than causing an error
  if (right === 0) return NaN

  // For numeric modulo
  if (typeof left === 'number' && typeof right === 'number') {
    // JavaScript's % operator retains the sign of the dividend, but we want true mathematical modulo
    // For modulo, we want to ensure the result is always in the range [0, abs(right)-1]
    const mod = left % right
    // If mod is negative, we add the absolute value of right to make it positive
    return mod < 0 ? mod + Math.abs(right) : mod
  }

  // Try to convert values to numbers if possible
  const leftNum = Number(left)
  const rightNum = Number(right)
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    if (rightNum === 0) return NaN
    const mod = leftNum % rightNum
    return mod < 0 ? mod + Math.abs(rightNum) : mod
  }

  // Default: return NaN for incompatible types
  return NaN
}
