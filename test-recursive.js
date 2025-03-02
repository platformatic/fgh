
import { query } from './src/fgh.ts';

// Test specific recursive descent case
const input = [[{ a: 1 }]];
const result = query('.. | .a?', input);
console.log('Input:', JSON.stringify(input));
console.log('Result:', JSON.stringify(result));
console.log('Result length:', result.length);

// Test recursive descent again with a flat structure
const input2 = { a: 1, b: { a: 2 }, c: { d: { a: 3 } } };
const result2 = query('.. | .a?', input2);
console.log('\nInput2:', JSON.stringify(input2));
console.log('Result2:', JSON.stringify(result2));
console.log('Result2 length:', result2.length);
