
// Helper function to create a test mock for the recursive descent 
// with property access pattern that's causing duplications

// Mock the behavior of ensureArrayResult
function ensureArrayResult(result) {
  if (result === null) return [null];
  if (result === undefined) return [];
  if (Array.isArray(result)) {
    // If array is from array iteration, always keep as-is
    if (result._fromArrayConstruction || result.length === 0) {
      return [...result];
    }
    // If it's the original input, wrap it
    return [result];
  }
  // If result is a scalar value, wrap it in an array
  return [result];
}

// This function simulates .. operator with original behavior
function recursiveDescentOriginal(input) {
  if (input === null || input === undefined) return undefined;
  
  // Final result array
  const result = [];
  
  // Track object references to avoid duplicates
  const visited = new WeakSet();
  
  // Function to recursively collect all values
  const collectAllValues = (obj) => {
    // Skip null/undefined values
    if (obj === null || obj === undefined) return;
    
    // For objects and arrays, track if we've seen them before
    if (typeof obj === 'object') {
      if (visited.has(obj)) return;
      visited.add(obj);
    }
    
    // Add the current object/value itself to results
    result.push(obj);
    
    // If it's an array, process each element
    if (Array.isArray(obj)) {
      for (const item of obj) {
        collectAllValues(item);
      }
    }
    // If it's an object, process each property
    else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.startsWith('_')) continue; // Skip internal properties
        collectAllValues(obj[key]);
      }
    }
  };
  
  // Start the collection process with the input
  collectAllValues(input);
  
  // Mark as array construction to preserve its structure
  Object.defineProperty(result, '_fromArrayConstruction', { value: true });
  
  return result;
}

// This function simulates .. | .a? pipe operation with original behavior
function pipeToPropertyAccess(input, propName) {
  const leftResult = recursiveDescentOriginal(input);
  if (leftResult === undefined) return undefined;
  
  const results = [];
  
  // Apply property access to each item from recursive descent
  for (const item of leftResult) {
    // Try to access property, even from non-objects (arrays)
    const propValue = item && typeof item === 'object' ? item[propName] : undefined;
    if (propValue !== undefined) {
      results.push(propValue);
    }
  }
  
  Object.defineProperty(results, '_fromArrayConstruction', { value: true });
  return ensureArrayResult(results);
}

// Modified version that filters arrays before property access
function pipeToPropertyAccessFixed(input, propName) {
  const leftResult = recursiveDescentOriginal(input);
  if (leftResult === undefined) return undefined;
  
  const results = [];
  
  // Filter to only include objects (not arrays)
  const objectValues = leftResult.filter(item => 
    item !== null && 
    typeof item === 'object' && 
    !Array.isArray(item)
  );
  
  // Apply property access only to objects
  for (const obj of objectValues) {
    const propValue = obj[propName];
    if (propValue !== undefined) {
      results.push(propValue);
    }
  }
  
  Object.defineProperty(results, '_fromArrayConstruction', { value: true });
  return ensureArrayResult(results);
}

// Test with a nested structure
const input = [[{ a: 1 }]];

// Test original behavior
const originalResult = pipeToPropertyAccess(input, 'a');
console.log('Input:', JSON.stringify(input));
console.log('Original behavior result:', JSON.stringify(originalResult));
console.log('Original result length:', originalResult.length);

// Test fixed behavior
const fixedResult = pipeToPropertyAccessFixed(input, 'a');
console.log('\nFixed behavior result:', JSON.stringify(fixedResult));
console.log('Fixed result length:', fixedResult.length);

// Demonstrate the solution 
console.log('\nSolution:');
console.log('When piping from recursive descent to property access, filter out array values:');
console.log('const objectValues = leftResult.filter(item => typeof item === "object" && !Array.isArray(item));');
