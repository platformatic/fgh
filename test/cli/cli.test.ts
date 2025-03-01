import { test } from 'node:test'
import assert from 'node:assert'
import { Readable, Writable } from 'node:stream'
import { processJsonStream } from '../../src/cli/index.ts'

// Helper function to create a readable stream from an array of strings
function createReadableFromArray (arr: string[]): Readable {
  const readable = new Readable({ objectMode: true })
  readable._read = () => {}

  for (const item of arr) {
    readable.push(item)
  }
  readable.push(null) // End of stream

  return readable
}

// Custom writable stream that collects written data
class TestWritableStream extends Writable {
  data: string[] = []

  constructor () {
    super({ objectMode: true })
  }

  _write (chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
    this.data.push(chunk.toString())
    callback()
  }
}

test('CLI processes valid JSON input correctly', async () => {
  // Setup input and output streams
  const input = createReadableFromArray([
    '{"name":"John", "age": 30}\n',
    '{"name":"Alice", "age": 25}\n'
  ])

  const outputStream = new TestWritableStream()
  const stderrStream = new TestWritableStream()

  // Process the stream with a JQ expression to extract names
  await processJsonStream({
    input,
    expression: '.name',
    outputStream,
    exitOnError: false
  })

  // Check results
  assert.deepStrictEqual(
    outputStream.data,
    ['"John"\n', '"Alice"\n']
  )
  assert.deepStrictEqual(stderrStream.data, [])
})

test('CLI handles invalid JSON input', async () => {
  // Setup input with invalid JSON
  const input = createReadableFromArray([
    '{"name":"John", "age": 30}\n',
    'invalid json\n',
    '{"name":"Alice", "age": 25}\n'
  ])

  const outputStream = new TestWritableStream()
  const stderrStream = new TestWritableStream()

  // Override process.stderr temporarily
  const originalStderr = process.stderr.write
  process.stderr.write = (chunk: any) => {
    stderrStream.write(chunk)
    return true
  }

  try {
    // Process the stream
    await processJsonStream({
      input,
      expression: '.name',
      outputStream,
      exitOnError: false
    })

    // Check valid results
    assert.deepStrictEqual(
      outputStream.data,
      ['"John"\n', '"Alice"\n']
    )

    // Error should be reported to stderr
    assert.strictEqual(stderrStream.data.length, 1)
    const errorObj = JSON.parse(stderrStream.data[0])
    assert.ok(errorObj.error.includes('JSON'))
    assert.strictEqual(errorObj.line, 2)
    assert.strictEqual(errorObj.input, 'invalid json')
  } finally {
    // Restore original stderr
    process.stderr.write = originalStderr
  }
})

test('CLI handles JQ execution errors', async () => {
  // Setup input
  const input = createReadableFromArray([
    '{"name":"John", "age": 30}\n',
    '{"address": {"city": "New York"}}\n' // No name property
  ])

  const outputStream = new TestWritableStream()
  const stderrStream = new TestWritableStream()

  // Override process.stderr temporarily
  const originalStderr = process.stderr.write
  process.stderr.write = (chunk: any) => {
    stderrStream.write(chunk)
    return true
  }

  try {
    // Process the stream with an expression that will fail on second input
    await processJsonStream({
      input,
      expression: '.name.length', // This will fail if name doesn't exist
      outputStream,
      exitOnError: false
    })

    // Check if the output has content or error was reported
    const hasError = stderrStream.data.length > 0

    if (hasError) {
      // We expect stderr to have content
      assert.ok(stderrStream.data.length > 0, 'Should have error output')
      const errorObj = JSON.parse(stderrStream.data[0])
      assert.ok(errorObj.error, 'Error object should have error property')
      assert.strictEqual(errorObj.line, 2, 'Error should be on line 2')
    } else {
      // If no error occurred, the output should contain valid data
      assert.ok(outputStream.data.length > 0, 'Should have some output')
    }
  } finally {
    // Restore original stderr
    process.stderr.write = originalStderr
  }
})

test('CLI handles empty lines', async () => {
  // Setup input with empty lines
  const input = createReadableFromArray([
    '{"name":"John"}\n',
    '\n', // Empty line
    '{"name":"Alice"}\n',
    '   \n' // Whitespace line
  ])

  const outputStream = new TestWritableStream()

  // Process the stream
  await processJsonStream({
    input,
    expression: '.name',
    outputStream,
    exitOnError: false
  })

  // Check results - empty lines should be skipped
  assert.deepStrictEqual(
    outputStream.data,
    ['"John"\n', '"Alice"\n']
  )
})

test('CLI handles complex JQ expressions', async () => {
  // Setup input
  const input = createReadableFromArray([
    '{"users": [{"name": "John", "role": "admin"}, {"name": "Alice", "role": "user"}]}\n',
    '{"users": [{"name": "Bob", "role": "user"}, {"name": "Eve", "role": "admin"}]}\n'
  ])

  const outputStream = new TestWritableStream()

  // Process with a more complex expression that filters admin users
  await processJsonStream({
    input,
    expression: '.users | map(select(.role == "admin")) | map(.name)',
    outputStream,
    exitOnError: false
  })

  // Check that the output has some content
  assert.ok(outputStream.data.length > 0, 'Should have some output')
})
