#!/usr/bin/env node

// Simple script to create a sample benchmark result
import fs from 'node:fs/promises'
import path from 'node:path'

async function generateSample () {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const resultsDir = path.join(process.cwd(), 'benchmarks/results')

  try {
    await fs.mkdir(resultsDir, { recursive: true })

    console.log('Generating sample benchmark result...')

    // Create sample data
    const benchmarkResult = {
      timestamp: new Date().toISOString(),
      benchmarks: [
        {
          name: 'FGH - Simple property (pre-compiled)',
          originalValue: 25.12,
          originalUnit: 'ns',
          value: 25.12
        },
        {
          name: 'FGH - Simple property (query)',
          originalValue: 1.05,
          originalUnit: 'µs',
          value: 1050
        },
        {
          name: 'FGH - Array index (pre-compiled)',
          originalValue: 7.38,
          originalUnit: 'ns',
          value: 7.38
        },
        {
          name: 'FGH - Array index (query)',
          originalValue: 1.15,
          originalUnit: 'µs',
          value: 1150
        },
        {
          name: 'FGH - Nested object (pre-compiled)',
          originalValue: 38.5,
          originalUnit: 'ns',
          value: 38.5
        },
        {
          name: 'FGH - Nested object (query)',
          originalValue: 1.52,
          originalUnit: 'µs',
          value: 1520
        },
        {
          name: 'FGH - Deep nested (pre-compiled)',
          originalValue: 76.2,
          originalUnit: 'ns',
          value: 76.2
        },
        {
          name: 'FGH - Deep nested (query)',
          originalValue: 2.85,
          originalUnit: 'µs',
          value: 2850
        },
        {
          name: 'FGH - Object construction (pre-compiled)',
          originalValue: 330.5,
          originalUnit: 'ns',
          value: 330.5
        },
        {
          name: 'FGH - Object construction (query)',
          originalValue: 4.05,
          originalUnit: 'µs',
          value: 4050
        },
        {
          name: 'FGH - Complex query (pre-compiled)',
          originalValue: 1.55,
          originalUnit: 'µs',
          value: 1550
        },
        {
          name: 'FGH - Complex query (query)',
          originalValue: 8.22,
          originalUnit: 'µs',
          value: 8220
        },
        {
          name: 'FGH - Large array deep nested (pre-compiled)',
          originalValue: 28.9,
          originalUnit: 'µs',
          value: 28900
        },
        {
          name: 'FGH - Large array deep nested (query)',
          originalValue: 32.1,
          originalUnit: 'µs',
          value: 32100
        }
      ],
      comparisons: []
    }

    // Generate comparisons
    const comparisons = []
    const processedTests = new Set()

    for (const benchmark of benchmarkResult.benchmarks) {
      // Extract test name without the library prefix and type
      let testName = benchmark.name
      testName = testName.replace(/FGH - /, '')
      testName = testName.replace(/ \(pre-compiled\)| \(query\)/, '')

      if (!processedTests.has(testName)) {
        processedTests.add(testName)

        // Find pre-compiled and query versions
        const preCompiled = benchmarkResult.benchmarks.find(b =>
          b.name === `FGH - ${testName} (pre-compiled)`
        )

        const query = benchmarkResult.benchmarks.find(b =>
          b.name === `FGH - ${testName} (query)`
        )

        if (preCompiled && query) {
          // For timing benchmarks, lower is better, so we divide query by precompiled
          const ratio = query.value / preCompiled.value

          comparisons.push({
            testName,
            fghPrecompiledNs: preCompiled.value,
            fghPrecompiledUnit: preCompiled.originalUnit,
            fghPrecompiledValue: preCompiled.originalValue,
            fghQueryNs: query.value,
            fghQueryUnit: query.originalUnit,
            fghQueryValue: query.originalValue,
            precompiledToQueryRatio: ratio
          })
        }
      }
    }

    benchmarkResult.comparisons = comparisons

    // Save the benchmark result
    const jsonFilePath = path.join(resultsDir, `benchmark-${timestamp}.json`)
    await fs.writeFile(jsonFilePath, JSON.stringify(benchmarkResult, null, 2))

    console.log(`Sample benchmark result saved to: ${jsonFilePath}`)

    return jsonFilePath
  } catch (error) {
    console.error('Error generating sample benchmark:', error)
    process.exit(1)
  }
}

// Run the generate function and then update docs
async function run () {
  try {
    await generateSample()

    console.log('Running update-docs.js with the sample data...')

    // Import the update-docs module (to avoid exec)
    await import('./update-docs.js')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url) {
  run()
}

export { generateSample }
