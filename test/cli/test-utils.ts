import { Readable, Writable } from 'node:stream'

// Helper function to create a readable stream from an array of strings
export function createReadableFromArray (arr: string[]): Readable {
  const readable = new Readable({ objectMode: true })
  readable._read = () => {}

  for (const item of arr) {
    readable.push(item)
  }
  readable.push(null) // End of stream

  return readable
}

// Custom writable stream that collects written data
export class TestWritableStream extends Writable {
  data: string[] = []

  constructor () {
    super({ objectMode: true })
  }

  _write (chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
    this.data.push(chunk.toString())
    callback()
  }
}
