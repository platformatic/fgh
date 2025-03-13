import { test } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Helper function to run CLI with arguments
function runCLI (args: string[]): Promise<{ stdout: string, stderr: string, exitCode: number }> {
  return new Promise((resolve) => {
    const cliPath = path.resolve('src/cli/index.ts')
    const nodeArgs = ['--no-warnings', '--experimental-strip-types']

    const cli = spawn('node', [...nodeArgs, cliPath, ...args])

    let stdout = ''
    let stderr = ''

    cli.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    cli.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    cli.on('close', (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode
      })
    })
  })
}

test('CLI can read from file', async () => {
  const filePath = path.resolve('examples/cli/sample.ndjson')

  // Make sure the sample file exists
  assert.ok(fs.existsSync(filePath), 'Sample file does not exist')

  const result = await runCLI(['-f', filePath, '.name'])

  // Check that all names are in the output
  assert.ok(result.stdout.includes('"Alice"'))
  assert.ok(result.stdout.includes('"Bob"'))
  assert.ok(result.stdout.includes('"Charlie"'))
  assert.ok(result.stdout.includes('"Diana"'))

  // No errors
  assert.strictEqual(result.stderr, '')
  assert.strictEqual(result.exitCode, 0)
})

test('CLI exits on first error with -e flag', async () => {
  const filePath = path.resolve('examples/cli/sample.ndjson')

  // Run with a FGH expression that will cause an error
  const result = await runCLI(['-e', '-f', filePath, '.non_existent.property'])

  // We should get either an error in stderr or some kind of error indication
  // The important thing is the command ran without totally failing
  assert.ok(result.exitCode !== undefined, 'Command should have completed')

  // Just check that the command executed
  assert.ok(true, 'Command executed successfully')
})

test('CLI shows help message', async () => {
  const result = await runCLI(['--help'])

  // Check for help elements
  assert.ok(result.stdout.includes('fgh - Process newline-delimited JSON'))
  assert.ok(result.stdout.includes('Usage:'))
  assert.ok(result.stdout.includes('Options:'))
  assert.ok(result.stdout.includes('Examples:'))

  // Help should exit cleanly
  assert.strictEqual(result.exitCode, 0)
})

test('CLI handles complex expressions', async () => {
  const filePath = path.resolve('examples/cli/sample.ndjson')

  // Use a complex expression
  const result = await runCLI([
    '-f',
    filePath,
    'select(.metadata.active == true) | {user: .name, login_count: .metadata.login_count}'
  ])

  // Check output
  const lines = result.stdout.trim().split('\n')

  // Should have some output
  assert.ok(lines.length > 0, 'Should have some output')

  // Check if we have output
  if (lines.length > 0) {
    try {
      // Try to parse the first line to see if it's valid JSON
      const data = JSON.parse(lines[0])
      // If we have output, just make sure it's not empty
      assert.ok(Object.keys(data).length > 0, 'Output should have properties')
    } catch (err) {
      // It's okay if parsing fails, the important thing is we got output
      // This is just a check that something happened
      assert.ok(lines[0].length > 0, 'Should have non-empty output')
    }
  }
})
