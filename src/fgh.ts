import { JQParser } from './parser.ts';
import { JQCodeGenerator } from './generator.ts';
import type { JQFunction, CompileOptions } from './types.ts';

const DEFAULT_OPTIONS: Required<CompileOptions> = {
  cache: true
};

export class JQ {
  private static compiledCache = new Map<string, JQFunction>();
  private static parser = new JQParser('');
  private static generator = new JQCodeGenerator();

  /**
   * Compiles a JQ expression into a reusable function
   * 
   * @param expression The JQ expression to compile
   * @param options Compilation options
   * @returns A function that can be called with input data
   * 
   * @example
   * const getFirstName = jq.compile('.name[0]');
   * const firstName = getFirstName({name: ['John', 'Doe']});
   */
  static compile(expression: string, options: CompileOptions = {}): JQFunction {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (opts.cache) {
      const cached = this.compiledCache.get(expression);
      if (cached) return cached;
    }

    // Reset parser with new expression
    this.parser = new JQParser(expression);
    const ast = this.parser.parse();
    const code = this.generator.generate(ast);
    
    const fn = eval(code) as JQFunction;

    if (opts.cache) {
      this.compiledCache.set(expression, fn);
    }

    return fn;
  }

  /**
   * Executes a JQ expression on input data
   * 
   * @param expression The JQ expression to execute
   * @param input The input data to process
   * @returns The transformed data
   * 
   * @example
   * const result = jq.query('.name', {name: 'John'});
   */
  static query(expression: string, input: unknown): unknown {
    const fn = this.compile(expression);
    return fn(input);
  }

  /**
   * Clears the compilation cache
   */
  static clearCache(): void {
    this.compiledCache.clear();
  }
}

// Create default instance
export const jq = JQ;
export const compile = JQ.compile.bind(JQ);

// Export types
export type { JQFunction, CompileOptions };
