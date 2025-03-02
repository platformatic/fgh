// Example demonstrating object construction with identity operations
import { query } from '../src/fgh.ts'

// Simple string input
const stringInput = 'hello world'
console.log('Input:', JSON.stringify(stringInput))
console.log('{ "message": . }:', JSON.stringify(query('{ "message": . }', stringInput)))
console.log()

// Number input
const numberInput = 42
console.log('Input:', JSON.stringify(numberInput))
console.log('{ "answer": . }:', JSON.stringify(query('{ "answer": . }', numberInput)))
console.log()

// Array input
const arrayInput = [1, 2, 3]
console.log('Input:', JSON.stringify(arrayInput))
console.log('{ "numbers": . }:', JSON.stringify(query('{ "numbers": . }', arrayInput)))
console.log()

// Object input
const objectInput = { name: 'John', age: 30 }
console.log('Input:', JSON.stringify(objectInput))
console.log('{ "user": . }:', JSON.stringify(query('{ "user": . }', objectInput)))
console.log()

// Null input
const nullInput = null
console.log('Input:', JSON.stringify(nullInput))
console.log('{ "value": . }:', JSON.stringify(query('{ "value": . }', nullInput)))
console.log()

// Mixed example with multiple properties
const mixedInput = { data: 'important info', status: 'active' }
console.log('Input:', JSON.stringify(mixedInput))
console.log('{ "result": ., "meta": { "processed": true } }:', JSON.stringify(query('{ "result": ., "meta": { "processed": true } }', mixedInput)))
console.log()

// Compare with array iteration
const arrayIteration = { data: 'metadata', items: [1, 2, 3] }
console.log('Input:', JSON.stringify(arrayIteration))
console.log('{ "data": .data, "item": .items[] }:', JSON.stringify(query('{ "data": .data, "item": .items[] }', arrayIteration)))
console.log('{ "data": .data, "items": .items }:', JSON.stringify(query('{ "data": .data, "items": .items }', arrayIteration)))
