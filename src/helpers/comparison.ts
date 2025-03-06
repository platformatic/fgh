/**
 * Comparison operations for FGH
 */

import { compareValues, isDeepEqual } from './sort.ts'
import { ensureArray } from './utils.ts'

/**
 * Check if left value is greater than right value
 * Using the same ordering rules as the sort function
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left > right, false otherwise
 */
export const greaterThan = (leftArray: any[], rightArray: any[]): (boolean | boolean[])[] => {
  console.log('greaterThan', leftArray, rightArray)
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
 * Check if left value is greater than or equal to right value
 * Using the same ordering rules as the sort function
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left >= right, false otherwise
 */
export const greaterThanOrEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  console.log('greaterThanOrEqual', leftArray, rightArray)
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
 * Check if left value is less than right value
 * Using the same ordering rules as the sort function
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left < right, false otherwise
 */
export const lessThan = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  console.log('lessThan', leftArray, rightArray)
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
 * Check if left value is less than or equal to right value
 * Using the same ordering rules as the sort function
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left <= right, false otherwise
 */
export const lessThanOrEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  console.log('lessThanOrEqual', leftArray, rightArray)
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
 * Check if two values are equal
 * This uses deep equality comparison for objects and arrays
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if values are equal, false otherwise
 */
export const equal = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      console.log('equal item', leftArray[i], rightArray[k])
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

  console.log('equal', leftArray, rightArray, results)

  return results
}

/**
 * Check if two values are not equal
 * This uses deep equality comparison for objects and arrays
 *
 * @param left The left value
 * @param right The right value to compare
 * @returns true if values are not equal, false otherwise
 */
export const notEqual = (leftArray: any, rightArray: any): (boolean | boolean[])[] => {
  console.log('notEqual', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  const results: (boolean | boolean[])[] = []

  for (let i = 0; i < leftArray.length; i++) {
    for (let k = 0; k < rightArray.length; k++) {
      console.log('notEqual item', leftArray[i], rightArray[k])
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

  console.log('notEqual', leftArray, rightArray, results)

  return results
}
