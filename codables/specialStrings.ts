const SPECIAL_STRINGS_REGEXP = /^\~*\$\$(?:undefined|NaN|-0|Infinity|-Infinity)$/;

export const INFINITY_STRING = "$$Infinity";
export const NEGATIVE_INFINITY_STRING = "$$-Infinity";
export const NEGATIVE_ZERO_STRING = "$$-0";
export const NaN_STRING = "$$NaN";
export const UNDEFINED_STRING = "$$undefined";

export function maybeEscapeSpecialString(input: string) {
  if (SPECIAL_STRINGS_REGEXP.test(input)) {
    return `~${input}`;
  }

  return input;
}

export function maybeEncodeNumber(input: number) {
  switch (input) {
    case Infinity:
      return INFINITY_STRING;
    case -Infinity:
      return NEGATIVE_INFINITY_STRING;
    case 0:
      if (1 / input === -Infinity) return NEGATIVE_ZERO_STRING;
      return input;
  }

  if (isNaN(input)) return "$$NaN";

  return input;
}

export function decodeMaybeSpecialString(input: string) {
  switch (input) {
    case UNDEFINED_STRING:
      return undefined;
    case NaN_STRING:
      return NaN;
    case NEGATIVE_ZERO_STRING:
      return -0;
    case INFINITY_STRING:
      return Infinity;
    case NEGATIVE_INFINITY_STRING:
      return -Infinity;
  }

  // if (!SPECIAL_STRINGS_REGEXP.test(input)) return input;

  if (input.startsWith("~") && SPECIAL_STRINGS_REGEXP.test(input)) return input.slice(1);

  return input;
}
