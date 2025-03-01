/**
 * Mathematical operations for FGH
 */

import { isNullOrUndefined } from './utils.ts'

/**
 * Add two values together, handling various types appropriately
 * @param left The left value
 * @param right The right value
 * @returns The result of adding the values
 */
export const addValues = (left: any, right: any): any => {
  // If either value is undefined, use the other one (handles null + val cases)
  if (isNullOrUndefined(left)) return right
  if (isNullOrUndefined(right)) return left

  // If both are arrays, concatenate them
  if (Array.isArray(left) && Array.isArray(right)) {
    return [...left, ...right]
  }

  // If both are objects, merge them with right taking precedence for duplicate keys
  if (typeof left === 'object' && left !== null &&
      typeof right === 'object' && right !== null &&
      !Array.isArray(left) && !Array.isArray(right)) {
    return { ...left, ...right }
  }

  // If one is an array and the other isn't, convert the non-array to an array and concatenate
  if (Array.isArray(left) && !Array.isArray(right)) {
    return [...left, right]
  }

  if (!Array.isArray(left) && Array.isArray(right)) {
    return [left, ...right]
  }

  // For numeric addition
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right
  }

  // Default string concatenation
  return String(left) + String(right)
}

/**
 * Subtract one value from another, handling various types appropriately
 * @param left The left value
 * @param right The right value to subtract
 * @returns The result of subtracting the values
 */
export const subtractValues = (left: any, right: any): any => {
  // If left is undefined, treat as 0 for numeric subtraction
  if (isNullOrUndefined(left)) {
    // For array subtraction, nothing to subtract from
    if (Array.isArray(right)) return []
    // For numeric subtraction, treat as 0 - right
    if (typeof right === 'number') return -right
    // Default: return undefined for other types
    return undefined
  }

  // If right is undefined, return left unchanged
  if (isNullOrUndefined(right)) return left

  // If both are arrays, remove elements from left that are in right
  if (Array.isArray(left) && Array.isArray(right)) {
    // Define interface for arrays with _fromArrayConstruction property
    interface ArrayWithConstruction extends Array<any> {
      _fromArrayConstruction?: boolean;
    }

    // Special handling for array construction with a single element to remove
    if ((right as ArrayWithConstruction)._fromArrayConstruction && right.length === 1) {
      // Remove ALL instances of the value, not just the first one
      const elementToRemove = right[0]
      const result = left.filter(item => item !== elementToRemove)
      // Mark as a difference result to preserve array structure
      Object.defineProperty(result, '_fromDifference', { value: true })
      return result
    }

    // Handle string array case differently to ensure proper comparison
    // Also handle null/undefined values in the arrays
    const isRightStringArray = right.every(item =>
      typeof item === 'string' || item === null || item === undefined)

    if (isRightStringArray) {
      // Make sure we preserve the array type
      const result = left.filter(item => !right.includes(item))
      // Mark as a difference result to preserve array structure
      Object.defineProperty(result, '_fromDifference', { value: true })
      return result // Always return as array, never unwrap
    }

    // Convert right array to a Set for O(1) lookups - for non-string arrays
    const rightSet = new Set(right)
    // Make sure we preserve the array type
    const result = left.filter(item => !rightSet.has(item))
    // Mark as a difference result to preserve array structure
    Object.defineProperty(result, '_fromDifference', { value: true })
    return result // Always return as array, never unwrap
  }

  // If left is an array but right is not, still remove the element from array
  if (Array.isArray(left) && !Array.isArray(right)) {
    const result = left.filter(item => item !== right)
    // Mark as a difference result to preserve array structure
    Object.defineProperty(result, '_fromDifference', { value: true })
    return result
  }

  // If left is not an array but right is, can't meaningfully subtract
  if (!Array.isArray(left) && Array.isArray(right)) {
    // For numeric, treat right as empty and return left
    if (typeof left === 'number') return left
    // Otherwise return left unchanged
    return left
  }

  // For numeric subtraction
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  // For objects, remove keys that exist in right from left
  if (typeof left === 'object' && left !== null &&
      typeof right === 'object' && right !== null &&
      !Array.isArray(left) && !Array.isArray(right)) {
    const result = { ...left }
    for (const key in right) {
      delete result[key]
    }
    return result
  }

  // Default: convert to numbers and subtract if possible
  const leftNum = Number(left)
  const rightNum = Number(right)
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    return leftNum - rightNum
  }

  // If all else fails, return left unchanged
  return left
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
