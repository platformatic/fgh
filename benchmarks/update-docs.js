#!/usr/bin/env node

// Script to update the README.md with the latest benchmark results
import fs from 'node:fs/promises'
import path from 'node:path'

// Make the function available for direct import
export async function updateDocs (specificResultPath = null) {
  console.log('Updating benchmark documentation...')

  try {
    let resultPath

    if (specificResultPath) {
      resultPath = specificResultPath
      console.log(`Using specified benchmark results: ${resultPath}`)
    } else {
      // Find the most recent benchmark result file
      const resultsDir = path.join(process.cwd(), 'benchmarks/results')
      const files = await fs.readdir(resultsDir)

      // Filter for JSON files and sort by name (which includes timestamp)
      const jsonFiles = files
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse()

      if (jsonFiles.length === 0) {
        throw new Error('No benchmark results found. Run npm run benchmark:report first.')
      }

      resultPath = path.join(resultsDir, jsonFiles[0])
      console.log(`Using latest benchmark results: ${resultPath}`)
    }

    // Read the benchmark results
    const resultContent = await fs.readFile(resultPath, 'utf8')
    const benchmarkResults = JSON.parse(resultContent)

    // Read the current README
    const readmePath = path.join(process.cwd(), 'benchmarks/README.md')
    let readmeContent = await fs.readFile(readmePath, 'utf8')

    // Generate the results markdown
    const resultsMarkdown = generateResultsMarkdown(benchmarkResults)

    // Find where to insert the results (between markers or at the end)
    if (readmeContent.includes('<!-- BENCHMARK_RESULTS_START -->')) {
      // Replace content between markers
      readmeContent = readmeContent.replace(
        /<!-- BENCHMARK_RESULTS_START -->[\s\S]*?<!-- BENCHMARK_RESULTS_END -->/,
        `<!-- BENCHMARK_RESULTS_START -->\n${resultsMarkdown}\n<!-- BENCHMARK_RESULTS_END -->`
      )
    } else {
      // Append to the end
      readmeContent += `\n\n## Benchmark Results\n\n<!-- BENCHMARK_RESULTS_START -->\n${resultsMarkdown}\n<!-- BENCHMARK_RESULTS_END -->`
    }

    // Write the updated README
    await fs.writeFile(readmePath, readmeContent)
    console.log('Benchmark documentation updated successfully!')
  } catch (error) {
    console.error('Error updating benchmark documentation:', error)
    process.exit(1)
  }
}

function generateResultsMarkdown (results) {
  const { timestamp, comparisons } = results

  // Format timestamp for display
  const date = new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })

  let markdown = `Last updated: ${date}\n\n`

  // Add performance summary table
  markdown += '### Performance Summary\n\n'
  markdown += '| Test | Pre-compiled | Query | Speedup Ratio |\n'
  markdown += '|------|-------------|-------|---------------|\n'

  // Sort comparisons by test name
  const sortedComparisons = [...comparisons].sort((a, b) => a.testName.localeCompare(b.testName))

  for (const comparison of sortedComparisons) {
    const { testName, fghPrecompiledValue, fghPrecompiledUnit, fghQueryValue, fghQueryUnit, precompiledToQueryRatio } = comparison

    const precompiledFormatted = fghPrecompiledValue ? `${fghPrecompiledValue.toFixed(2)} ${fghPrecompiledUnit}` : '-'
    const queryFormatted = fghQueryValue ? `${fghQueryValue.toFixed(2)} ${fghQueryUnit}` : '-'
    const ratioFormatted = precompiledToQueryRatio ? `${precompiledToQueryRatio.toFixed(2)}x` : '-'

    markdown += `| ${testName} | ${precompiledFormatted} | ${queryFormatted} | ${ratioFormatted} |\n`
  }

  // Add overall summary
  markdown += '\n### Overall Performance\n\n'

  const validComparisons = comparisons.filter(c => c.fghPrecompiledNs && c.fghQueryNs)

  if (validComparisons.length > 0) {
    // Calculate average, min, max ratios
    const ratios = validComparisons.map(c => c.precompiledToQueryRatio)
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length
    const minRatio = Math.min(...ratios)
    const maxRatio = Math.max(...ratios)

    markdown += `- **Average speedup**: ${avgRatio.toFixed(2)}x faster with pre-compilation\n`
    markdown += `- **Min speedup**: ${minRatio.toFixed(2)}x\n`
    markdown += `- **Max speedup**: ${maxRatio.toFixed(2)}x\n`

    // Get best and worst test names
    const bestTest = validComparisons.find(c => c.precompiledToQueryRatio === maxRatio).testName
    const worstTest = validComparisons.find(c => c.precompiledToQueryRatio === minRatio).testName

    markdown += `- **Best case for pre-compilation**: ${bestTest}\n`
    markdown += `- **Smallest speedup from pre-compilation**: ${worstTest}\n`
  } else {
    markdown += 'No valid comparisons available.\n'
  }

  // System info
  markdown += '\n### System Information\n\n'
  markdown += `- **Node.js Version**: ${process.version}\n`
  markdown += `- **Platform**: ${process.platform}\n`
  markdown += `- **Architecture**: ${process.arch}\n`

  return markdown
}

// If this script is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  updateDocs()
}
