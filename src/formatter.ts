/**
 * AST Formatter for FGH expressions
 *
 * Converts the Abstract Syntax Tree (AST) back to a human-readable JQ-like expression.
 * Supports both compact and pretty-printed formatting with configurable indentation.
 */

import type {
  ASTNode,
  IdentityNode,
  PropertyAccessNode,
  IndexAccessNode,
  PipeNode,
  OptionalNode,
  SequenceNode,
  ArrayIterationNode,
  SliceNode,
  ObjectConstructionNode,
  ObjectFieldNode,
  ArrayConstructionNode,
  SumNode,
  DifferenceNode,
  MultiplyNode,
  DivideNode,
  ModuloNode,
  LiteralNode,
  RecursiveDescentNode,
  MapFilterNode,
  MapValuesFilterNode,
  SelectFilterNode,
  ConditionalNode,
  SortNode,
  SortByNode,
  GreaterThanNode,
  GreaterThanOrEqualNode,
  LessThanNode,
  LessThanOrEqualNode,
  EqualNode,
  NotEqualNode,
  AndNode,
  OrNode,
  NotNode,
  DefaultNode,
  KeysNode,
  KeysUnsortedNode,
  EmptyNode,
  TostringNode,
  TonumberNode
} from './types.ts'

export interface FormatterOptions {
  /**
   * Whether to format the output with indentation and line breaks
   */
  pretty?: boolean;

  /**
   * Indentation string to use when pretty printing (default: '  ')
   */
  indentString?: string;

  /**
   * Current indentation level (used internally)
   */
  indentLevel?: number;
}

export class FGHFormatter {
  /**
   * Format an AST node into a human-readable JQ-like expression
   *
   * @param node The AST node to format
   * @param options Formatting options
   * @returns A string representation of the expression
   */
  format (node: ASTNode, options: FormatterOptions = {}): string {
    // Default options
    const opts: Required<FormatterOptions> = {
      pretty: options.pretty ?? false,
      indentString: options.indentString ?? '  ',
      indentLevel: options.indentLevel ?? 0
    }

    return this.formatNode(node, opts)
  }

  /**
   * Get the current indentation string based on indentation level
   */
  private getIndent (options: Required<FormatterOptions>): string {
    return options.pretty ? options.indentString.repeat(options.indentLevel) : ''
  }

  /**
   * Format a node with increased indentation level
   */
  private formatWithIndent (node: ASTNode, options: Required<FormatterOptions>): string {
    return this.formatNode(node, {
      ...options,
      indentLevel: options.indentLevel + 1
    })
  }

  /**
   * Format an AST node into a string
   */
  private formatNode (node: ASTNode, options: Required<FormatterOptions>): string {
    switch (node.type) {
      case 'Identity':
        return this.formatIdentity(node, options)
      case 'PropertyAccess':
        return this.formatPropertyAccess(node, options)
      case 'IndexAccess':
        return this.formatIndexAccess(node, options)
      case 'ArrayIteration':
        return this.formatArrayIteration(node, options)
      case 'Pipe':
        return this.formatPipe(node, options)
      case 'Optional':
        return this.formatOptional(node, options)
      case 'Sequence':
        return this.formatSequence(node, options)
      case 'Slice':
        return this.formatSlice(node, options)
      case 'ObjectConstruction':
        return this.formatObjectConstruction(node, options)
      case 'ObjectField':
        return this.formatObjectField(node, options)
      case 'ArrayConstruction':
        return this.formatArrayConstruction(node, options)
      case 'Sum':
        return this.formatSum(node, options)
      case 'Difference':
        return this.formatDifference(node, options)
      case 'Multiply':
        return this.formatMultiply(node, options)
      case 'Divide':
        return this.formatDivide(node, options)
      case 'Modulo':
        return this.formatModulo(node, options)
      case 'Literal':
        return this.formatLiteral(node, options)
      case 'RecursiveDescent':
        return this.formatRecursiveDescent(node, options)
      case 'MapFilter':
        return this.formatMapFilter(node, options)
      case 'MapValuesFilter':
        return this.formatMapValuesFilter(node, options)
      case 'SelectFilter':
        return this.formatSelectFilter(node, options)
      case 'Conditional':
        return this.formatConditional(node, options)
      case 'Sort':
        return this.formatSort(node, options)
      case 'SortBy':
        return this.formatSortBy(node, options)
      case 'GreaterThan':
        return this.formatGreaterThan(node, options)
      case 'GreaterThanOrEqual':
        return this.formatGreaterThanOrEqual(node, options)
      case 'LessThan':
        return this.formatLessThan(node, options)
      case 'LessThanOrEqual':
        return this.formatLessThanOrEqual(node, options)
      case 'Equal':
        return this.formatEqual(node, options)
      case 'NotEqual':
        return this.formatNotEqual(node, options)
      case 'And':
        return this.formatAnd(node, options)
      case 'Or':
        return this.formatOr(node, options)
      case 'Not':
        return this.formatNot(node, options)
      case 'Default':
        return this.formatDefault(node, options)
      case 'Keys':
        return this.formatKeys(node, options)
      case 'KeysUnsorted':
        return this.formatKeysUnsorted(node, options)
      case 'Empty':
        return this.formatEmpty(node, options)
      case 'Tostring':
        return this.formatTostring(node, options)
      case 'Tonumber':
        return this.formatTonumber(node, options)
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`)
    }
  }

  private formatIdentity (node: IdentityNode, options: Required<FormatterOptions>): string {
    return '.'
  }

  private formatPropertyAccess (node: PropertyAccessNode, options: Required<FormatterOptions>): string {
    let result = ''

    if (node.input) {
      // Special case for 'not .a' construction which the parser parses as '.a' with input 'not .'
      if (node.input.type === 'Not' && node.input.expression?.type === 'Identity') {
        // Handle the case where a property access has a 'not' operation as input
        return `not .${node.property}`
      }

      // If input is a Pipe or a Sequence, wrap it in parentheses
      if (node.input.type === 'Pipe' || node.input.type === 'Sequence') {
        result = `(${this.formatNode(node.input, options)})`
      } else {
        result = this.formatNode(node.input, options)
      }
    } else {
      result = '.'
    }

    // Handle string literal property access (.["property"])
    if (node.stringKey) {
      return `${result}["${node.property}"]`
    }

    // Regular property access (.property)
    // Don't add a dot if the input already ends with a dot (for example, '.')
    if (result === '.') {
      return `.${node.property}`
    }

    return `${result}.${node.property}`
  }

  private formatIndexAccess (node: IndexAccessNode, options: Required<FormatterOptions>): string {
    let result = ''

    if (node.input) {
      result = this.formatNode(node.input, options)
    } else {
      result = '.'
    }

    return `${result}[${node.index}]`
  }

  private formatArrayIteration (node: ArrayIterationNode, options: Required<FormatterOptions>): string {
    let result = ''

    if (node.input) {
      result = this.formatNode(node.input, options)
    } else {
      result = '.'
    }

    return `${result}[]`
  }

  private formatPipe (node: PipeNode, options: Required<FormatterOptions>): string {
    const left = this.formatNode(node.left, options)
    const right = this.formatNode(node.right, options)

    return `${left} | ${right}`
  }

  private formatOptional (node: OptionalNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.expression, options)}?`
  }

  private formatSequence (node: SequenceNode, options: Required<FormatterOptions>): string {
    return node.expressions.map(expr => this.formatNode(expr, options)).join(', ')
  }

  private formatSlice (node: SliceNode, options: Required<FormatterOptions>): string {
    let result = ''

    if (node.input) {
      result = this.formatNode(node.input, options)
    } else {
      result = '.'
    }

    const start = node.start !== null ? node.start : ''
    const end = node.end !== null ? node.end : ''

    return `${result}[${start}:${end}]`
  }

  private formatObjectConstruction (node: ObjectConstructionNode, options: Required<FormatterOptions>): string {
    if (node.fields.length === 0) {
      return '{}'
    }

    if (!options.pretty) {
      // Compact format
      const fields = node.fields.map(field => this.formatNode(field, options)).join(', ')
      return `{${fields}}`
    }

    // Pretty format with indentation
    const indent = this.getIndent(options)
    const innerIndent = this.getIndent({ ...options, indentLevel: options.indentLevel + 1 })

    const fields = node.fields.map(field => `${innerIndent}${this.formatNode(field, {
      ...options,
      indentLevel: options.indentLevel + 1
    })}`).join(',\n')

    return `{\n${fields}\n${indent}}`
  }

  private formatObjectField (node: ObjectFieldNode, options: Required<FormatterOptions>): string {
    const value = this.formatNode(node.value, options)

    if (node.isDynamic) {
      const key = this.formatNode(node.key as ASTNode, options)
      return `(${key}): ${value}`
    } else {
      return `${node.key as string}: ${value}`
    }
  }

  private formatArrayConstruction (node: ArrayConstructionNode, options: Required<FormatterOptions>): string {
    if (node.elements.length === 0) {
      return '[]'
    }

    if (!options.pretty) {
      // Compact format
      const elements = node.elements.map(element => this.formatNode(element, options)).join(', ')
      return `[${elements}]`
    }

    // Pretty format with indentation
    const indent = this.getIndent(options)
    const innerIndent = this.getIndent({ ...options, indentLevel: options.indentLevel + 1 })

    const elements = node.elements.map(element => `${innerIndent}${this.formatNode(element, {
      ...options,
      indentLevel: options.indentLevel + 1
    })}`).join(',\n')

    return `[\n${elements}\n${indent}]`
  }

  private formatSum (node: SumNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} + ${this.formatNode(node.right, options)}`
  }

  private formatDifference (node: DifferenceNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} - ${this.formatNode(node.right, options)}`
  }

  private formatMultiply (node: MultiplyNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} * ${this.formatNode(node.right, options)}`
  }

  private formatDivide (node: DivideNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} / ${this.formatNode(node.right, options)}`
  }

  private formatModulo (node: ModuloNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} % ${this.formatNode(node.right, options)}`
  }

  private formatLiteral (node: LiteralNode, options: Required<FormatterOptions>): string {
    if (typeof node.value === 'string') {
      return `"${node.value}"`
    }
    return String(node.value)
  }

  private formatRecursiveDescent (node: RecursiveDescentNode, options: Required<FormatterOptions>): string {
    return '..'
  }

  private formatMapFilter (node: MapFilterNode, options: Required<FormatterOptions>): string {
    return `map(${this.formatNode(node.filter, options)})`
  }

  private formatMapValuesFilter (node: MapValuesFilterNode, options: Required<FormatterOptions>): string {
    return `map_values(${this.formatNode(node.filter, options)})`
  }

  private formatSelectFilter (node: SelectFilterNode, options: Required<FormatterOptions>): string {
    return `select(${this.formatNode(node.condition, options)})`
  }

  private formatConditional (node: ConditionalNode, options: Required<FormatterOptions>): string {
    const condition = this.formatNode(node.condition, options)
    const thenBranch = this.formatNode(node.thenBranch, options)

    // Handle pretty printing with proper indentation
    if (options.pretty) {
      const indent = this.getIndent(options)
      const innerIndent = this.getIndent({ ...options, indentLevel: options.indentLevel + 1 })

      const thenBranchFormatted = this.formatWithIndent(node.thenBranch, options)

      let result = `if ${condition} then\n${innerIndent}${thenBranchFormatted}`

      if (node.elseBranch) {
        const elseBranchFormatted = this.formatWithIndent(node.elseBranch, options)
        result += `\n${indent}else\n${innerIndent}${elseBranchFormatted}`
      }

      result += `\n${indent}end`
      return result
    }

    // Compact printing
    let result = `if ${condition} then ${thenBranch}`

    if (node.elseBranch) {
      const elseBranch = this.formatNode(node.elseBranch, options)
      result += ` else ${elseBranch}`
    } else {
      // No else branch specified
    }

    result += ' end'
    return result
  }

  private formatSort (node: SortNode, options: Required<FormatterOptions>): string {
    return 'sort'
  }

  private formatSortBy (node: SortByNode, options: Required<FormatterOptions>): string {
    const paths = node.paths.map(path => this.formatNode(path, options)).join(', ')
    return `sort_by(${paths})`
  }

  private formatGreaterThan (node: GreaterThanNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} > ${this.formatNode(node.right, options)}`
  }

  private formatGreaterThanOrEqual (node: GreaterThanOrEqualNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} >= ${this.formatNode(node.right, options)}`
  }

  private formatLessThan (node: LessThanNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} < ${this.formatNode(node.right, options)}`
  }

  private formatLessThanOrEqual (node: LessThanOrEqualNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} <= ${this.formatNode(node.right, options)}`
  }

  private formatEqual (node: EqualNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} == ${this.formatNode(node.right, options)}`
  }

  private formatNotEqual (node: NotEqualNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} != ${this.formatNode(node.right, options)}`
  }

  private formatAnd (node: AndNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} and ${this.formatNode(node.right, options)}`
  }

  private formatOr (node: OrNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} or ${this.formatNode(node.right, options)}`
  }

  private formatNot (node: NotNode, options: Required<FormatterOptions>): string {
    // Handle identity expressions specially to avoid double dots
    if (node.expression.type === 'Identity') {
      return 'not .'
    }

    // Handle property access expressions specially
    if (node.expression.type === 'PropertyAccess' && !node.expression.input) {
      return `not .${(node.expression as PropertyAccessNode).property}`
    }

    // For other expressions, format normally
    const exprStr = this.formatNode(node.expression, options)
    return `not ${exprStr}`
  }

  private formatDefault (node: DefaultNode, options: Required<FormatterOptions>): string {
    return `${this.formatNode(node.left, options)} // ${this.formatNode(node.right, options)}`
  }

  private formatKeys (node: KeysNode, options: Required<FormatterOptions>): string {
    return 'keys'
  }

  private formatKeysUnsorted (node: KeysUnsortedNode, options: Required<FormatterOptions>): string {
    return 'keys_unsorted'
  }

  private formatEmpty (node: EmptyNode, options: Required<FormatterOptions>): string {
    return 'empty'
  }

  private formatTostring (node: TostringNode, options: Required<FormatterOptions>): string {
    return 'tostring'
  }

  private formatTonumber (node: TonumberNode, options: Required<FormatterOptions>): string {
    return 'tonumber'
  }
}
