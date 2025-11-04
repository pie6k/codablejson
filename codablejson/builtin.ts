import { CodableReader, codableType } from "./CodableType";
import {
  EntryIndex,
  getInSetAtIndex,
  getMapKeyByIndex,
  getMapValueByIndex,
  setInSetAtIndex,
  updateMapKeyByIndex,
  updateMapValueByIndex,
} from "./utils/readers";
import { getSymbolKey, removeUndefinedProperties } from "./utils/misc";

import { EncodeContext } from "./EncodeContext";
import { TYPED_ARRAY_MAP } from "./utils/typedArrays";
import { assertNumeric } from "./utils/assert";
import { getErrorExtraProperties } from "./utils/errors";
import { getIsNotNull } from "./is";

/**
 * This is the list of all built-in coders that are used to encode and decode basic types.
 *
 * Note: put the most popular types at the beginning of the file to improve encoding performance.
 */

function getIsValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

export const $$date = codableType(
  "Date",
  (value) => value instanceof Date,
  (date) => {
    if (!getIsValidDate(date)) return null;

    return date.toISOString();
  },
  (maybeISOString) => {
    if (maybeISOString === null) return new Date("invalid");

    return new Date(maybeISOString);
  },
  {
    isFlat: true,
    Class: Date,
  },
);

const setReader: CodableReader<Set<unknown>> = (set, [indexString]) => {
  const index = assertNumeric(indexString);

  return {
    get: () => getInSetAtIndex(set, index),
    set: (value) => setInSetAtIndex(set, index, value),
  };
};

export const $$set = codableType(
  "Set",
  (value) => value instanceof Set,
  (set) => [...set],
  (array) => new Set(array),
  {
    Class: Set,
    reader: setReader,
  },
);

const mapReader: CodableReader<Map<unknown, unknown>> = (map, [entryIndexString, indexInEntryString]) => {
  // index of the entry path points to
  const entryIndex = assertNumeric(entryIndexString);
  // 0 if path points to key, 1 if path points to value
  const indexInEntry = assertNumeric<EntryIndex>(indexInEntryString);

  switch (indexInEntry) {
    case EntryIndex.Key:
      return {
        get: () => getMapKeyByIndex(map, entryIndex),
        set: (value) => updateMapKeyByIndex(map, entryIndex, value),
      };
    case EntryIndex.Value:
      return {
        get: () => getMapValueByIndex(map, entryIndex),
        set: (value) => updateMapValueByIndex(map, entryIndex, value),
      };
    default:
      throw new Error(`Entry path should be either 0 or 1, got ${indexInEntry}`);
  }
};

export const $$map = codableType(
  "Map",
  (value) => value instanceof Map,
  (map) => [...map.entries()],
  (entries) => new Map(entries),
  {
    Class: Map,
    reader: mapReader,
  },
);

export const $$error = codableType(
  "Error",
  (value) => value instanceof Error,
  (error: Error, context: EncodeContext) => {
    const shouldIncludeErrorStack = context.options?.includeErrorStack ?? false;

    const extraProperties = getErrorExtraProperties(error) ?? undefined;
    const name = error.name && error.name !== "Error" ? error.name : undefined;
    const cause = error.cause;
    const message = error.message;
    const stack = shouldIncludeErrorStack ? error.stack : undefined;

    if (!extraProperties && !name && !cause && !stack) {
      return message;
    }

    return removeUndefinedProperties({
      message,
      name,
      cause,
      properties: extraProperties,
      stack,
    });
  },
  (messageOrData) => {
    if (typeof messageOrData === "string") return new Error(messageOrData);

    const { message, name, cause, properties, stack } = messageOrData;

    const error = new Error(message, { cause });

    if (stack) {
      error.stack = stack;
    }

    if (name && name !== "Error") {
      error.name = name;
    }

    if (properties) {
      Object.assign(error, properties);
    }

    return error;
  },
  {
    Class: Error,
  },
);

export const $$undefined = codableType(
  "undefined",
  (value) => value === undefined,
  () => null,
  () => undefined,
  {
    isFlat: true,
  },
);

export const $$bigInt = codableType(
  "BigInt",
  (value) => typeof value === "bigint",
  (bigInt) => bigInt.toString(),
  (string) => BigInt(string),
  {
    isFlat: true,
  },
);

export const $$regexp = codableType(
  "RegExp",
  (value) => value instanceof RegExp,
  ({ source, flags }) => {
    return `/${source}/${flags}`;
  },
  (string) => {
    const [source, flags] = string.split("/").slice(1);
    return new RegExp(source, flags);
  },
  {
    isFlat: true,
    Class: RegExp,
  },
);

export const $$url = codableType(
  "URL",
  (value) => value instanceof URL,
  (url) => url.toString(),
  (string) => new URL(string),
  {
    isFlat: true,
    Class: URL,
  },
);

const symbolsRegistry = new Map<string, symbol>();

export const $$symbol = codableType(
  "Symbol",
  (value) => typeof value === "symbol",
  (symbol) => {
    const symbolKey = getSymbolKey(symbol);

    symbolsRegistry.set(symbolKey, symbol);

    return symbolKey;
  },
  (symbolKey) => symbolsRegistry.get(symbolKey) ?? Symbol.for(symbolKey),
  {
    isFlat: true,
  },
);

export const typedArrays = Object.entries(TYPED_ARRAY_MAP)
  .map(([name, TypedArrayClass]) => {
    if (!TypedArrayClass) return null;

    return codableType(
      name,
      (value): value is InstanceType<typeof TypedArrayClass> => value instanceof TypedArrayClass,
      (value) => [...value],
      (array) => new TypedArrayClass(array),
      {
        // Almost flat, but can contain NaN
        isFlat: false,
        Class: TypedArrayClass,
      },
    );
  })
  .filter(getIsNotNull);

export const $$urlSearchParams = codableType(
  "URLSearchParams",
  (value) => value instanceof URLSearchParams,
  (urlSearchParams) => urlSearchParams.toString(),
  (string) => new URLSearchParams(string),
  {
    isFlat: false,
    Class: URLSearchParams,
  },
);
