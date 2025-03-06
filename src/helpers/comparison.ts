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
export const greaterThan = (leftArray: any[], rightArray: any[]): boolean[] => {
  console.log('greaterThan', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results = []
  const maxLen = Math.max(leftArray.length, rightArray.length)

  for (let i = 0; i < maxLen; i++) {
    const left = leftArray[i]
    const right = rightArray[i]

    // Handle special cases for null and undefined
    // undefined is less than null in our ordering
    if (left === undefined) {
      results.push( false)
    } else if (right === undefined) {
      results.push( true)
    } else if (left === null && right === null) {
      results.push( false)
    } else if (left === null) {
      results.push( false)
    } else if (right === null) {
      results.push( true)
      // Handle boolean vs number ordering (boolean > number according to tests)
    } else if (typeof left === 'boolean' && typeof right === 'number') {
      results.push( true)
    } else if (typeof left === 'number' && typeof right === 'boolean') {
      results.push( false)
    } else {
      // Use the same comparison function as sort for other cases
      results.push( compareValues(left, right) > 0)
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
export const greaterThanOrEqual = (leftArray: any, rightArray: any): boolean => {
  console.log('greaterThanOrEqual', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results = []
  const maxLen = Math.max(leftArray.length, rightArray.length)

  for (let i = 0; i < maxLen; i++) {
    const left = leftArray[i]
    const right = rightArray[i]

    // Handle special cases for null and undefined
    // undefined is less than null in our ordering
    if (left === undefined) {
      results.push( false)
    } else if (right === undefined) {
      results.push( true)
    } else if (left === null && right === null) {
      results.push(true)
    } else if (left === null) {
      results.push( false)
    } else if (right === null) {
      results.push( true)
      // Handle boolean vs number ordering (boolean > number according to tests)
    } else if (typeof left === 'boolean' && typeof right === 'number') {
      results.push( true)
    } else if (typeof left === 'number' && typeof right === 'boolean') {
      results.push( false)
    } else {
      // Use the same comparison function as sort for other cases
      results.push( compareValues(left, right) >= 0)
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
export const lessThan = (leftArray: any, rightArray: any): boolean => {
  console.log('lessThan', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results = []
  const maxLen = Math.max(leftArray.length, rightArray.length)

  for (let i = 0; i < maxLen; i++) {
    const left = leftArray[i]
    const right = rightArray[i]

    // Handle special cases for null and undefined
    // undefined is less than null in our ordering
    if (left === undefined) {
      results.push( false)
    } else if (right === undefined) {
      results.push( true)
    } else if (left === null && right === null) {
      results.push( false)
    } else if (left === null) {
      results.push( true)
    } else if (right === null) {
      results.push( false)
      // Handle boolean vs number ordering (boolean > number according to tests)
    } else if (typeof left === 'boolean' && typeof right === 'number') {
      results.push( true)
    } else if (typeof left === 'number' && typeof right === 'boolean') {
      results.push( false)
    } else {
      // Use the same comparison function as sort for other cases
      results.push( compareValues(left, right) < 0)
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
export const lessThanOrEqual = (leftArray: any, rightArray: any): boolean => {
  console.log('lessThanOrEqual', leftArray, rightArray)
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)
  const results = []
  const maxLen = Math.max(leftArray.length, rightArray.length)

  for (let i = 0; i < maxLen; i++) {
    const left = leftArray[i]
    const right = rightArray[i]

    // Handle special cases for null and undefined
    // undefined is less than null in our ordering
    if (left === undefined) {
      results.push( false)
    } else if (right === undefined) {
      results.push( true)
    } else if (left === null && right === null) {
      results.push(true)
    } else if (left === null) {
      results.push( true)
    } else if (right === null) {
      results.push( false)
      // Handle boolean vs number ordering (boolean > number according to tests)
    } else if (typeof left === 'boolean' && typeof right === 'number') {
      results.push( true)
    } else if (typeof left === 'number' && typeof right === 'boolean') {
      results.push( false)
    } else {
      // Use the same comparison function as sort for other cases
      results.push( compareValues(left, right) <= 0)
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
export const equal = (leftArray: any, rightArray: any): boolean => {
  const results = []

  for (let i = 0; i < leftArray.length; i++) {
    results.push(isDeepEqual(leftArray[i], rightArray[i]))
  }

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
export const notEqual = (left: any, right: any): boolean => {
  const results = []

  for (let i = 0; i < leftArray.length; i++) {
    results.push(!isDeepEqual(leftArray[i], rightArray[i]))
  }

  return results
}
