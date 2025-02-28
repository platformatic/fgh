// Select filter examples
import { query, compile } from '../dist/fgh.js'

// Example 1: Basic selection with numbers
const numbers = [1, 5, 3, 0, 7]
console.log('\nExample 1: Filter numbers greater than or equal to 2')
console.log('Input:', numbers)
console.log('Output:', query('map(select(. >= 2))', numbers))
// => [5, 3, 7]

// Example 2: Finding a specific item in an array of objects
const users = [
  { id: 'first', val: 1 },
  { id: 'second', val: 2 }
]
console.log('\nExample 2: Find a specific user by ID')
console.log('Input:', users)
console.log('Output:', query('.[] | select(.id == "second")', users))
// => { id: 'second', val: 2 }

// Example 3: Filtering multiple items from an array
console.log('\nExample 3: Filter all users with positive values')
console.log('Input:', users)
console.log('Output:', query('.[] | select(.val > 0)', users))
// => [{ id: 'first', val: 1 }, { id: 'second', val: 2 }]

// Example 4: Using select on a single object
const product = { name: 'test', value: 15 }
console.log('\nExample 4: Check if a product meets a price threshold')
console.log('Input:', product)
console.log('Output:', query('select(.value > 10)', product))
// => { name: 'test', value: 15 }

// Example 5: Using select with empty result
console.log('\nExample 5: A condition that returns empty result')
console.log('Input:', product)
console.log('Output:', query('select(.value < 10)', product))
// => null

// Example 6: Compiling a select filter for reuse
console.log('\nExample 6: Compiling a select filter for reuse')
const highValueFilter = compile('select(.value > 10)')
console.log('Is high value product:', highValueFilter(product) !== null)
// => true

// Example 7: Combining select with other operations
const inventory = [
  { name: 'apple', type: 'fruit', price: 1.20, stock: 50 },
  { name: 'banana', type: 'fruit', price: 0.80, stock: 25 },
  { name: 'carrot', type: 'vegetable', price: 0.90, stock: 30 },
  { name: 'potato', type: 'vegetable', price: 1.10, stock: 10 }
]
console.log('\nExample 7: Filtering and transformation')
console.log('Input:', inventory)
console.log('Output:', query('.[] | select(.type == "fruit") | {name, total_value: (.price * .stock)}', inventory))
// => [{ name: 'apple', total_value: 60 }, { name: 'banana', total_value: 20 }]
