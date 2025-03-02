
import { query } from './src/fgh.ts';

// Test specific recursive descent case
const input = [[{ a: 1 }]];
console.log('Input:', JSON.stringify(input));

// Debug recursive descent results
const recursiveResult = query('..', input);
console.log('Recursive Descent Result:', JSON.stringify(recursiveResult));
console.log('Recursive Descent Length:', recursiveResult.length);
console.log('Is array?', Array.isArray(recursiveResult[0]));

// Debug piped property access
const finalResult = query('.. | .a?', input);
console.log('\nPiped Property Access Result:', JSON.stringify(finalResult));
console.log('Result length:', finalResult.length);
