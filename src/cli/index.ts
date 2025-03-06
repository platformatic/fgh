#!/usr/bin/env node

/**
 * Command-line interface for FGH
 *
 * Provides tools for processing streams of newline-delimited JSON (NDJSON) using
 * JQ-like expressions from the command line. Supports file input, standard input,
 * error handling, and formatted output with multiple display options.
 */

import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { parseArgs } from 'node:util'
import { compile } from '../fgh.ts'
import type { JQFunction } from '../types.ts'

interface CliOptions {
  input: Readable
  expression: string
  outputStream: NodeJS.WritableStream
  exitOnError: boolean
}

/**
 * Processes a stream of newline-delimited JSON using a JQ expression
 *
 * @param options.input - Input stream of newline-delimited JSON
 * @param options.expression - JQ expression to process each JSON line
 * @param options.outputStream - Stream to write results (defaults to stdout)
 * @param options.exitOnError - Whether to exit on error (defaults to false)
 */
export async function processJsonStream (options: CliOptions): Promise<void> {
  const { input, expression, outputStream, exitOnError } = options
  const jqFn: JQFunction = compile(expression)

  const readline = createInterface({
    input,
    crlfDelay: Infinity
  })

  let lineNumber = 0

  for await (const line of readline) {
    lineNumber++

    if (!line.trim()) {
      continue // Skip empty lines
    }

    try {
      // Parse input line as JSON
      const jsonInput = JSON.parse(line)

      // Apply the JQ function
      const results = jqFn(jsonInput)

      // Output each result as JSON on a separate line
      for (const result of results) {
        outputStream.write(JSON.stringify(result) + '\n')
      }
    } catch (error) {
      const errorMessage = {
        error: (error instanceof Error) ? error.message : String(error),
        line: lineNumber,
        input: line
      }

      // Write error as JSON to stderr
      process.stderr.write(JSON.stringify(errorMessage) + '\n')

      if (exitOnError) {
        process.exit(1)
      }
    }
  }
}

// When run directly from command line
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // Configure CLI options
  const options = {
    help: {
      type: 'boolean' as const,
      short: 'h',
      default: false
    },
    exit: {
      type: 'boolean' as const,
      short: 'e',
      default: false
    },
    file: {
      type: 'string' as const,
      short: 'f'
    }
  }

  // Parse arguments
  const { values, positionals } = parseArgs({ options, allowPositionals: true })

  // Show help and exit if no arguments or help flag
  if (values.help || positionals.length === 0) {
    console.log(`
    fgh - Process newline-delimited JSON with JQ expressions
    
    Usage:
      fgh [options] <expression>
      
    Options:
      -h, --help     Show this help message
      -e, --exit     Exit on first error (default: continue processing)
      -f, --file     Read input from file instead of stdin
      
    Examples:
      cat data.ndjson | fgh '.name'
      fgh -f data.ndjson '.users[].name'
    `)
    process.exit(0)
  }

  const expression = positionals[0]

  // Set up input stream
  const input = values.file
    ? createReadStream(values.file as string, { encoding: 'utf8' })
    : process.stdin

  // Process the JSON stream
  processJsonStream({
    input,
    expression,
    outputStream: process.stdout,
    exitOnError: values.exit as boolean
  }).catch(error => {
    console.error('Fatal error:', error.message)
    process.exit(1)
  })
}
