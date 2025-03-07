import { test } from 'node:test'
import assert from 'node:assert'
import { join } from 'node:path'
import { writeFileSync, unlinkSync } from 'node:fs'
import { processJsonStream } from '../../src/cli/index.ts'
import { TestWritableStream } from './test-utils.ts'
import { createReadStream } from 'node:fs'

// Create a temporary file for testing
const tempFilePath = join(process.cwd(), 'temp-test-file.ndjson')

test('CLI can read from file', async () => {
  // Create test file
  const fileContent = [
    '{"name":"John", "age": 30}',
    '{"name":"Alice", "age": 25}'
  ].join('\n')
  
  try {
    writeFileSync(tempFilePath, fileContent, 'utf8')
    
    // Set up streams
    const fileStream = createReadStream(tempFilePath, { encoding: 'utf8' })
    const outputStream = new TestWritableStream()
    
    // Process the file
    await processJsonStream({
      input: fileStream,
      expression: '.name',
      outputStream,
      exitOnError: false
    })
    
    // Check results
    assert.deepStrictEqual(
      outputStream.data,
      ['"John"\n', '"Alice"\n']
    )
  } finally {
    // Clean up
    try {
      unlinkSync(tempFilePath)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
})
