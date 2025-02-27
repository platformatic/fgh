#!/usr/bin/env node

// Simple script to run benchmarks and save results to a file
import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

async function runBenchmark () {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const resultsDir = path.join(process.cwd(), 'benchmarks/results')

  try {
    await fs.mkdir(resultsDir, { recursive: true })

    console.log('Running FGH benchmark...')

    // Execute the benchmark and capture output
    const { stdout } = await new Promise((resolve, reject) => {
      exec('node --no-warnings --experimental-strip-types benchmarks/benchmark.ts',
        { maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer to handle large output
        (error, stdout, stderr) => {
          if (error) reject(error)
          else resolve({ stdout, stderr })
        }
      )
    })

    // Save the results
    const outputFilePath = path.join(resultsDir, `benchmark-${timestamp}.txt`)
    await fs.writeFile(outputFilePath, stdout)

    // Create JSON results for easier processing
    const jsonResults = parseResults(stdout)
    const jsonFilePath = path.join(resultsDir, `benchmark-${timestamp}.json`)
    await fs.writeFile(jsonFilePath, JSON.stringify(jsonResults, null, 2))

    console.log('Benchmark complete. Results saved to:')
    console.log(`- ${outputFilePath}`)
    console.log(`- ${jsonFilePath}`)

    // Print summary
    printSummary(jsonResults)
  } catch (error) {
    console.error('Error running benchmark:', error)
    process.exit(1)
  }
}

function parseResults (output) {
  const results = {
    timestamp: new Date().toISOString(),
    benchmarks: [],
    comparisons: []
  }

  // Extract the results
  const lines = output.split('\n')

  for (const line of lines) {
    // Parse benchmark results
    /* eslint-disable no-useless-escape  */
    /* eslint-disable no-control-regex  */
    const resultMatch = line.match(/([^\[]+)\[\d+m\[\d+m([\d.]+ (?:µs|ns))\[\d+m\[\d+m\/iter/)
    if (resultMatch) {
      const [, name, valueWithUnit] = resultMatch

      // Clean up name (remove color codes and extra spaces)
      const cleanName = name.replace(/\u001b\[[\d;]+m/g, '').trim()

      // Extract value and unit
      const valueParts = valueWithUnit.match(/([\d.]+)\s+(\w+)/)
      const valueNum = parseFloat(valueParts[1])
      const unit = valueParts[2]

      // Convert to nanoseconds for uniform measurement
      const valueNs = unit === 'µs' ? valueNum * 1000 : valueNum

      const benchmarkResult = {
        name: cleanName,
        value: valueNs,
        unit: 'ns',
        originalUnit: unit,
        originalValue: valueNum,
        type: 'fgh',
        subtype: cleanName.includes('pre-compiled') ? 'pre-compiled' : 'query'
      }

      results.benchmarks.push(benchmarkResult)

      // Extract test name without the library prefix and type
      let testName = cleanName
      testName = testName.replace(/FGH - /, '')
      testName = testName.replace(/ \(pre-compiled\)| \(query\)/, '')

      // Add to comparisons
      const existingComparison = results.comparisons.find(c => c.testName === testName)
      if (existingComparison) {
        if (benchmarkResult.subtype === 'pre-compiled') {
          existingComparison.fghPrecompiledNs = benchmarkResult.value
          existingComparison.fghPrecompiledUnit = benchmarkResult.originalUnit
          existingComparison.fghPrecompiledValue = benchmarkResult.originalValue
        } else if (benchmarkResult.subtype === 'query') {
          existingComparison.fghQueryNs = benchmarkResult.value
          existingComparison.fghQueryUnit = benchmarkResult.originalUnit
          existingComparison.fghQueryValue = benchmarkResult.originalValue
        }
      } else {
        const comparison = {
          testName,
          fghPrecompiledNs: benchmarkResult.subtype === 'pre-compiled' ? benchmarkResult.value : undefined,
          fghPrecompiledUnit: benchmarkResult.subtype === 'pre-compiled' ? benchmarkResult.originalUnit : undefined,
          fghPrecompiledValue: benchmarkResult.subtype === 'pre-compiled' ? benchmarkResult.originalValue : undefined,
          fghQueryNs: benchmarkResult.subtype === 'query' ? benchmarkResult.value : undefined,
          fghQueryUnit: benchmarkResult.subtype === 'query' ? benchmarkResult.originalUnit : undefined,
          fghQueryValue: benchmarkResult.subtype === 'query' ? benchmarkResult.originalValue : undefined
        }
        results.comparisons.push(comparison)
      }
    }
  }

  // Calculate improvement ratio of pre-compiled vs query
  for (const comparison of results.comparisons) {
    if (comparison.fghPrecompiledNs && comparison.fghQueryNs) {
      // For timing benchmarks, lower is better, so we divide query by precompiled
      comparison.precompiledToQueryRatio = comparison.fghQueryNs / comparison.fghPrecompiledNs
    }
  }

  return results
}

function printSummary (results) {
  console.log('\n=== BENCHMARK SUMMARY ===\n')

  console.log('-'.repeat(75))
  console.log('Test                    | FGH (pre-compiled)     | FGH (query)            | Improvement Ratio')
  console.log('-'.repeat(75))

  // Sort by test name for a consistent output
  const sortedComparisons = [...results.comparisons].sort((a, b) => a.testName.localeCompare(b.testName))

  for (const comparison of sortedComparisons) {
    const precompiled = comparison.fghPrecompiledValue
      ? `${comparison.fghPrecompiledValue.toFixed(2)} ${comparison.fghPrecompiledUnit}`.padStart(21)
      : '-'.padStart(21)

    const query = comparison.fghQueryValue
      ? `${comparison.fghQueryValue.toFixed(2)} ${comparison.fghQueryUnit}`.padStart(21)
      : '-'.padStart(21)

    const ratio = comparison.precompiledToQueryRatio
      ? comparison.precompiledToQueryRatio.toFixed(2).padStart(17)
      : '-'.padStart(17)

    const testName = comparison.testName.padEnd(23)
    console.log(`${testName}| ${precompiled} | ${query} | ${ratio}x`)
  }

  // Overall comparison
  console.log('\n=== OVERALL COMPARISON ===')

  const validComparisons = results.comparisons.filter(c =>
    c.fghPrecompiledNs && c.fghQueryNs
  )

  if (validComparisons.length > 0) {
    // Average ratios
    const ratios = validComparisons
      .filter(c => c.precompiledToQueryRatio)
      .map(c => c.precompiledToQueryRatio)

    const avgRatio = ratios.length > 0
      ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
      : 'N/A'

    console.log(`\nAverage speedup with pre-compilation: ${typeof avgRatio === 'number' ? avgRatio.toFixed(2) + 'x' : avgRatio}`)

    // Best and worst cases
    if (ratios.length > 0) {
      const bestRatio = Math.max(...ratios)
      const worstRatio = Math.min(...ratios)

      const bestTest = validComparisons.find(c => c.precompiledToQueryRatio === bestRatio).testName
      const worstTest = validComparisons.find(c => c.precompiledToQueryRatio === worstRatio).testName

      console.log(`\nBest speedup with pre-compilation: ${bestTest} (${bestRatio.toFixed(2)}x faster)`)
      console.log(`Smallest speedup with pre-compilation: ${worstTest} (${worstRatio.toFixed(2)}x faster)`)
    }
  } else {
    console.log('No valid comparisons available.')
  }
}

runBenchmark()
