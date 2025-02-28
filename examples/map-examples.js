// Examples of using map and map_values filters

import { query } from '../dist/fgh.js'

console.log('=== Map Filter Examples ===')

// Simple array example
console.log('\nApply .+1 to each element in array:')
console.log('Input:', [1, 2, 3])
console.log('map(.+1):', query('map(.+1)', [1, 2, 3]))

// Multiple values per input
console.log('\nFilter producing multiple values per input:')
console.log('Input:', [1, 2])
console.log('map(., .):', query('map(., .)', [1, 2]))

// Empty filter example
console.log('\nFilter producing no values:')
console.log('Input:', [1, 2, 3])
console.log('map(empty):', query('map(empty)', [1, 2, 3]))

// Object example
console.log('\nApply .+1 to values of an object:')
console.log('Input:', { a: 1, b: 2, c: 3 })
console.log('map(.+1):', query('map(.+1)', { a: 1, b: 2, c: 3 }))

console.log('\n\n=== Map_values Filter Examples ===')

// Simple array example
console.log('\nApply .+1 to each element in array:')
console.log('Input:', [1, 2, 3])
console.log('map_values(.+1):', query('map_values(.+1)', [1, 2, 3]))

// Multiple values per input
console.log('\nFilter producing multiple values per input:')
console.log('Input:', [1, 2])
console.log('map_values(., .):', query('map_values(., .)', [1, 2]))
console.log('(Note: only takes first value for each input)')

// Empty filter example
console.log('\nFilter producing no values:')
console.log('Input:', [1, 2, 3])
console.log('map_values(empty):', query('map_values(empty)', [1, 2, 3]))

// Object example with structure maintained
console.log('\nApply .+1 to values of an object (maintains structure):')
console.log('Input:', { a: 1, b: 2, c: 3 })
console.log('map_values(.+1):', query('map_values(.+1)', { a: 1, b: 2, c: 3 }))

// Keys dropped when filter produces no values
console.log('\nDrop keys when filter produces no values:')
console.log('Input:', { a: 1, b: 2, c: 3 })
console.log('map_values(empty):', query('map_values(empty)', { a: 1, b: 2, c: 3 }))
