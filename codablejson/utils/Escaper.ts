type Matcher = RegExp;

function wrapPatternAsGroup(pattern: string) {
  return `(?:${pattern})`;
}

function preparePatterns(pattern: RegExp) {
  let { source, flags } = pattern;

  source = source.replaceAll("^", "");
  source = wrapPatternAsGroup(source);

  const maybeAlreadyEscapedPattern = new RegExp(`^\\~*${source}$`, flags);
  const alreadyEscapedPattern = new RegExp(`^\\~+${source}$`, flags);

  return {
    maybeAlreadyEscapedPattern,
    alreadyEscapedPattern,
  };
}

export class Escaper {
  readonly maybeAlreadyEscapedPattern: RegExp;
  readonly alreadyEscapedPattern: RegExp;

  constructor(readonly pattern: RegExp) {
    const { maybeAlreadyEscapedPattern, alreadyEscapedPattern } = preparePatterns(pattern);
    this.maybeAlreadyEscapedPattern = maybeAlreadyEscapedPattern;
    this.alreadyEscapedPattern = alreadyEscapedPattern;
  }

  getShouldEscape(input: string): boolean {
    return this.maybeAlreadyEscapedPattern.test(input);
  }

  getShouldUnescape(input: string): boolean {
    return this.alreadyEscapedPattern.test(input);
  }

  getIsMaybeEscaped(input: string): boolean {
    return this.maybeAlreadyEscapedPattern.test(input);
  }

  getIsAlreadyEscaped(input: string): boolean {
    return this.alreadyEscapedPattern.test(input);
  }

  getIsMatching(input: string): boolean {
    return this.pattern.test(input);
  }

  escape(input: string) {
    if (!this.getShouldEscape(input)) {
      return input;
    }

    return `~${input}`;
  }

  unescape(input: string) {
    if (this.getShouldUnescape(input)) {
      return input.slice(1);
    }

    return input;
  }
}

export function createEscaper(pattern: RegExp) {
  return new Escaper(pattern);
}
