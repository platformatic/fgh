import { bench, run } from 'mitata'
import { compile, query } from '../src/fgh.ts'
import * as data from './data.ts'

// Pre-compile FGH functions for the compiled benchmarks
const compiledFunctions = {}

// Initialize compiled functions
Object.entries(data.TEST_EXPRESSIONS).forEach(([key, expr]) => {
  try {
    compiledFunctions[key] = compile(expr)
  } catch (error) {
    console.warn(`Warning: Failed to compile expression '${expr}' (${key}): ${error.message}`)
  }
})

async function runBenchmarks () {
  console.log('Initializing benchmarks...')

  // Compiler benchmarks
  const compilerExpressions = [
    'simple', 'arrayAll', 'nested', 'objectConstruction'
  ]

  compilerExpressions.forEach(key => {
    const expr = data.TEST_EXPRESSIONS[key]
    bench(`FGH - Compile ${key}`, () => {
      compile(expr)
    })
  })

  // Simple property access
  bench('FGH - Simple property (pre-compiled)', () => {
    compiledFunctions.simple(data.SIMPLE_OBJECT)
  })

  bench('FGH - Simple property (query)', () => {
    query(data.TEST_EXPRESSIONS.simple, data.SIMPLE_OBJECT)
  })

  // Multi-property access with comma operator
  bench('FGH - Multi-property (pre-compiled)', () => {
    compiledFunctions.multiProperty(data.SIMPLE_OBJECT)
  })

  bench('FGH - Multi-property (query)', () => {
    query(data.TEST_EXPRESSIONS.multiProperty, data.SIMPLE_OBJECT)
  })

  // Array extraction
  bench('FGH - Array extraction (pre-compiled)', () => {
    compiledFunctions.arrayAll(data.ARRAY_OF_OBJECTS)
  })

  bench('FGH - Array extraction (query)', () => {
    query(data.TEST_EXPRESSIONS.arrayAll, data.ARRAY_OF_OBJECTS)
  })

  // Array index access
  bench('FGH - Array index (pre-compiled)', () => {
    compiledFunctions.arrayIndex(data.ARRAY_OF_OBJECTS)
  })

  bench('FGH - Array index (query)', () => {
    query(data.TEST_EXPRESSIONS.arrayIndex, data.ARRAY_OF_OBJECTS)
  })

  // Nested object access
  bench('FGH - Nested object (pre-compiled)', () => {
    compiledFunctions.nested(data.NESTED_OBJECT)
  })

  bench('FGH - Nested object (query)', () => {
    query(data.TEST_EXPRESSIONS.nested, data.NESTED_OBJECT)
  })

  // Deep nested access
  bench('FGH - Deep nested (pre-compiled)', () => {
    compiledFunctions.deepNested(data.DEEP_NESTED)
  })

  bench('FGH - Deep nested (query)', () => {
    query(data.TEST_EXPRESSIONS.deepNested, data.DEEP_NESTED)
  })

  // Array-nested access
  bench('FGH - Array nested (pre-compiled)', () => {
    compiledFunctions.arrayNested(data.NESTED_OBJECT)
  })

  bench('FGH - Array nested (query)', () => {
    query(data.TEST_EXPRESSIONS.arrayNested, data.NESTED_OBJECT)
  })

  // Object construction
  bench('FGH - Object construction (pre-compiled)', () => {
    compiledFunctions.objectConstruction(data.NESTED_OBJECT)
  })

  bench('FGH - Object construction (query)', () => {
    query(data.TEST_EXPRESSIONS.objectConstruction, data.NESTED_OBJECT)
  })

  // Array construction
  bench('FGH - Array construction (pre-compiled)', () => {
    compiledFunctions.arrayConstruction(data.NESTED_OBJECT)
  })

  bench('FGH - Array construction (query)', () => {
    query(data.TEST_EXPRESSIONS.arrayConstruction, data.NESTED_OBJECT)
  })

  // Complex query
  bench('FGH - Complex query (pre-compiled)', () => {
    compiledFunctions.complex(data.NESTED_OBJECT)
  })

  bench('FGH - Complex query (query)', () => {
    query(data.TEST_EXPRESSIONS.complex, data.NESTED_OBJECT)
  })

  // Large array deep nested
  bench('FGH - Large array deep nested (pre-compiled)', () => {
    compiledFunctions.deepNested(data.LARGE_ARRAY)
  })

  bench('FGH - Large array deep nested (query)', () => {
    query(data.TEST_EXPRESSIONS.deepNested, data.LARGE_ARRAY)
  })

  // Run all benchmarks
  await run({
    colors: true,
    avg: true,
    json: false,
    min_max: true,
    percentiles: true
  })
}

runBenchmarks().catch(err => {
  console.error('Benchmark error:', err)
  process.exit(1)
})
