/**
 * Comparison operations for FGH expressions
 * Implements relational operators (<, <=, >, >=) and equality operators (==, !=)
 * with consistent ordering rules and deep equality comparison for complex data types
 */

import { compareValues, isDeepEqual } from './sort.ts'
import { ensureArray } from './utils.ts'

/**
 * Implements the greater than (>) operator with JQ-compatible ordering rules
 * Compares all combinations of elements between the left and right arrays
 * using a consistent type ordering system (null < boolean < number < string < array < object)
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is greater than each right value
 */
export const greaterThan = (leftArray: any[], rightArray: any[]): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]
    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle special cases for null and undefined
      // undefined is less than null in our ordering
      if (left === undefined) {
        results.push(false)
      } else if (right === undefined) {
        results.push(true)
      } else if (left === null && right === null) {
        results.push(false)
      } else if (left === null) {
        results.push(false)
      } else if (right === null) {
        results.push(true)
        // Handle boolean vs number ordering (boolean > number according to tests)
      } else if (typeof left === 'boolean' && typeof right === 'number') {
        results.push(true)
      } else if (typeof left === 'number' && typeof right === 'boolean') {
        results.push(false)
      } else {
        // Use the same comparison function as sort for other cases
        results.push(compareValues(left, right) > 0)
      }
    }
  }

  return results
}

/**
 * Implements the greater than or equal (>=) operator with JQ-compatible ordering rules
 * Compares all combinations of elements between the left and right arrays
 * using a consistent type ordering system (null < boolean < number < string < array < object)
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is greater than or equal to each right value
 */
export const greaterThanOrEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]
    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle special cases for null and undefined
      // undefined is less than null in our ordering
      if (left === undefined) {
        results.push(false)
      } else if (right === undefined) {
        results.push(true)
      } else if (left === null && right === null) {
        results.push(true)
      } else if (left === null) {
        results.push(false)
      } else if (right === null) {
        results.push(true)
        // Handle boolean vs number ordering (boolean > number according to tests)
      } else if (typeof left === 'boolean' && typeof right === 'number') {
        results.push(true)
      } else if (typeof left === 'number' && typeof right === 'boolean') {
        results.push(false)
      } else {
        // Use the same comparison function as sort for other cases
        results.push(compareValues(left, right) >= 0)
      }
    }
  }

  return results
}

/**
 * Implements the less than (<) operator with JQ-compatible ordering rules
 * Compares all combinations of elements between the left and right arrays
 * using a consistent type ordering system (null < boolean < number < string < array < object)
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is less than each right value
 */
export const lessThan = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]
    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle special cases for null and undefined
      // undefined is less than null in our ordering
      if (left === undefined) {
        results.push(false)
      } else if (right === undefined) {
        results.push(true)
      } else if (left === null && right === null) {
        results.push(false)
      } else if (left === null) {
        results.push(true)
      } else if (right === null) {
        results.push(false)
        // Handle boolean vs number ordering (boolean > number according to tests)
      } else if (typeof left === 'boolean' && typeof right === 'number') {
        results.push(true)
      } else if (typeof left === 'number' && typeof right === 'boolean') {
        results.push(false)
      } else {
        // Use the same comparison function as sort for other cases
        results.push(compareValues(left, right) < 0)
      }
    }
  }

  return results
}

/**
 * Implements the less than or equal (<=) operator with JQ-compatible ordering rules
 * Compares all combinations of elements between the left and right arrays
 * using a consistent type ordering system (null < boolean < number < string < array < object)
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is less than or equal to each right value
 */
export const lessThanOrEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]
    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle special cases for null and undefined
      // undefined is less than null in our ordering
      if (left === undefined) {
        results.push(false)
      } else if (right === undefined) {
        results.push(true)
      } else if (left === null && right === null) {
        results.push(true)
      } else if (left === null) {
        results.push(true)
      } else if (right === null) {
        results.push(false)
        // Handle boolean vs number ordering (boolean > number according to tests)
      } else if (typeof left === 'boolean' && typeof right === 'number') {
        results.push(true)
      } else if (typeof left === 'number' && typeof right === 'boolean') {
        results.push(false)
      } else {
        // Use the same comparison function as sort for other cases
        results.push(compareValues(left, right) <= 0)
      }
    }
  }

  return results
}

/**
 * Implements the equality (==) operator using deep equality comparison
 * Compares all combinations of elements between the left and right arrays
 * with special handling for array comparisons using structural equality
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is deeply equal to each right value
 */
export const equal = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      if (Array.isArray(leftArray[i]) && Array.isArray(rightArray[k])) {
        results.push(isDeepEqual(leftArray[i], rightArray[k]))
      } else if (Array.isArray(leftArray[i]) && !Array.isArray(rightArray[k])) {
        const result = []
        for (const item of leftArray[i]) {
          result.push(isDeepEqual(item, rightArray[k]))
        }
        results.push(result)
      } else {
        results.push(isDeepEqual(leftArray[i], rightArray[k]))
      }
    }
  }

  return results
}

/**
 * Implements the inequality (!=) operator using deep equality comparison
 * Compares all combinations of elements between the left and right arrays
 * with special handling for array comparisons using structural equality
 *
 * @param leftArray Array of values to compare as left operands
 * @param rightArray Array of values to compare as right operands
 * @returns Array of boolean results indicating whether each left value is not deeply equal to each right value
 */
export const notEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      if (Array.isArray(leftArray[i]) && Array.isArray(rightArray[k])) {
        results.push(!isDeepEqual(leftArray[i], rightArray[k]))
      } else if (Array.isArray(leftArray[i]) && !Array.isArray(rightArray[k])) {
        const result = []
        for (const item of leftArray[i]) {
          result.push(!isDeepEqual(item, rightArray[k]))
        }
        results.push(result)
      } else {
        results.push(!isDeepEqual(leftArray[i], rightArray[k]))
      }
    }
  }

  return results
}
