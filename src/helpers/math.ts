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
 * Multiply two values, handling various types appropriately
 * @param left The left value
 * @param right The right value
 * @returns The result of multiplying the values
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
 * Divide one value by another, handling various types appropriately
 * @param left The dividend
 * @param right The divisor
 * @returns The result of dividing the values
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
 * Calculate the modulo of two values
 * @param left The dividend
 * @param right The divisor
 * @returns The remainder after division
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
