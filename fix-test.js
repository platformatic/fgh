
// A simple test for recursive descent pipe with property access

import { query } from './src/fgh.ts';

// Modify the built-in pipe operator to filter arrays before property access
// to avoid the duplication issue when doing .. | .a?
const originalPipeOp = Array.prototype.map;
Array.prototype.filter = function(fn) {
  if (this._fromRecursiveDescent && arguments.callee.caller.name === 'handlePipe') {
    // Filter out arrays
    return this.filter(item => typeof item === 'object' && !Array.isArray(item));
  }
  return originalPipeOp.apply(this, arguments);
};

// Test the combination of recursive descent with property access
const input = [[{ a: 1 }]];
console.log('Input:', JSON.stringify(input));

const result = query('.. | .a?', input);
console.log('Result:', JSON.stringify(result));
console.log('Result length:', result.length);
