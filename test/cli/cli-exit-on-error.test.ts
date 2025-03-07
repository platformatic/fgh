import { test } from 'node:test'
import assert from 'node:assert'
import { Readable } from 'node:stream'
import { processJsonStream } from '../../src/cli/index.ts'
import { TestWritableStream, createReadableFromArray } from './test-utils.ts'

// Mock process.exit to make it testable
let exitCalled = false
let exitCode = 0
const originalExit = process.exit

test('CLI exits on error when exitOnError is true', async () => {
  // Setup test data
  const input = createReadableFromArray([
    '{"name":"John"}\n',
    'invalid json\n', // This will cause an error
    '{"name":"Alice"}\n'
  ])

  const outputStream = new TestWritableStream()
  const stderrStream = new TestWritableStream()

  // Mock process.exit and stderr
  process.exit = (code) => {
    exitCalled = true
    exitCode = code || 0
    return undefined as never
  }

  const originalStderr = process.stderr.write
  process.stderr.write = (chunk: any) => {
    stderrStream.write(chunk)
    return true
  }

  try {
    // Override processJsonStream to catch the exit call
    await Promise.race([
      processJsonStream({
        input,
        expression: '.name',
        outputStream,
        exitOnError: true
      }),
      // Add a small delay and resolve if process.exit was called
      new Promise(resolve => setTimeout(() => {
        if (exitCalled) resolve(null)
      }, 100))
    ])

    // Verify that process.exit was called with code 1
    assert.strictEqual(exitCalled, true, 'process.exit should have been called')
    assert.strictEqual(exitCode, 1, 'exit code should be 1')

    // Verify error was logged
    assert.ok(stderrStream.data.length > 0, 'Error should be logged to stderr')
    const errorObj = JSON.parse(stderrStream.data[0])
    assert.ok(errorObj.error.includes('JSON'), 'Error should mention JSON')
    assert.strictEqual(errorObj.line, 2, 'Error should be on line 2')
  } finally {
    // Restore original functions
    process.exit = originalExit
    process.stderr.write = originalStderr
  }
})
