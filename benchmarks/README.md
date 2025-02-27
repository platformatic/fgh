# FGH Performance Benchmark

This benchmark measures the performance of `fgh` (TypeScript implementation of JQ) across various JQ operations and dataset sizes. It specifically compares the performance difference between using pre-compiled functions vs. one-off queries.

## Running the Benchmark

You can run the benchmark in two ways:

### Basic Benchmark

To run the basic benchmark:

```bash
npm run benchmark
```

This will run the benchmark tests and output the results to the console.

### Detailed Benchmark with Report

To run the benchmark with a detailed report:

```bash
npm run benchmark:report
```

This will:
1. Run all benchmark tests
2. Save the raw results to `results/benchmark-[timestamp].txt`
3. Save the processed results as JSON to `results/benchmark-[timestamp].json`
4. Display a summary table in the console showing performance comparisons

## Benchmark Results

<!-- BENCHMARK_RESULTS_START -->
Last updated: February 27, 2025 at 4:05 PM

### Performance Summary

| Test | Pre-compiled | Query | Speedup Ratio |
|------|-------------|-------|---------------|
| Array construction | 565.20 ns | 2.95 µs | 5.20x |
| Array index | 7.38 ns | 1.15 µs | 155.80x |
| Complex query | 1.55 µs | 8.22 µs | 5.30x |
| Deep nested | 76.20 ns | 2.85 µs | 37.40x |
| Nested object | 38.50 ns | 1.52 µs | 39.50x |
| Object construction | 330.50 ns | 4.05 µs | 12.30x |
| Simple property | 25.12 ns | 1.05 µs | 41.80x |

### Overall Performance

- **Average speedup**: 42.47x faster with pre-compilation
- **Min speedup**: 5.20x
- **Max speedup**: 155.80x
- **Best case for pre-compilation**: Array index
- **Smallest speedup from pre-compilation**: Array construction

### System Information

- **Node.js Version**: v23.7.0
- **Platform**: darwin
- **Architecture**: arm64

<!-- BENCHMARK_RESULTS_END -->

## Benchmark Structure

The benchmark tests various operations categorized into groups:

1. **Compiler Performance**: Tests how fast expressions can be compiled
2. **Simple Object Operations**: Basic property access and multi-property extraction
3. **Array Operations**: Access array elements by index and iterating over arrays
4. **Nested Object Access**: Access properties deep within nested objects
5. **Construction Operations**: Create new objects and arrays from data
6. **Complex Operations**: More complex queries combining multiple operations
7. **Large Dataset Operations**: Performance with larger datasets

## Benchmark Metrics

For each operation, the benchmark compares:

- **FGH (pre-compiled)**: Using a pre-compiled function (calling `compile()` once and reusing)
- **FGH (query)**: Using one-off query execution (calling `query()` each time)

The benchmark report calculates the performance improvement ratio showing how much faster pre-compiled functions are compared to one-off queries.

## Datasets

The benchmark uses various test data sets:

- **Simple Object**: A flat object with a few properties
- **Array of Objects**: A small array of objects
- **Nested Object**: An object with deeply nested properties and arrays
- **Medium Array**: 100 objects with nested data
- **Large Array**: 1000 objects with nested data
- **Deep Nested**: Object with 8 levels of nesting
- **Complex Data**: A complex mixed data structure with arrays and nested objects

## Interpreting Results

- **Ratio > 1**: Pre-compiled function is faster than one-off query by that factor
- Higher ratio indicates greater benefit from pre-compilation

## Example Query Types

The benchmark includes common JQ operations such as:

- Property access (`.name`)
- Multiple property extraction (`.name, .age`)
- Array iteration and indexing (`.[].name`, `.[0]`)
- Nested property access (`.user.personal.name`)
- Object construction (`.user | {name: .personal.name}`)
- Array construction (`.posts[] | [.id, .title]`)
- Complex queries (`.posts[].comments[] | {author, text}`)

## Notes

- Currently, some JQ features are not yet supported and are excluded from the benchmark
- The benchmark is designed to measure the overhead of compilation vs the performance gain from reusing a compiled function
