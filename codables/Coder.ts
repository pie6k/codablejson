import * as builtinTypesMap from "./builtin";

import { CodableType, CodableTypeOptions, codableType, defaultCodableReader, getIsCodableType } from "./CodableType";
import { DecodeContext, DecodeOptions } from "./DecodeContext";
import { EncodeContext, EncodeOptions } from "./EncodeContext";
import { Path, ROOT_PATH, splitPath } from "./utils/path";
import { getCodableClassType, getIsCodableClass } from "./decorators/registry";

import { $$externalReference } from "./ExternalReference";
import { AnyClass } from "./decorators/types";
import { JSONValue } from "./types";
import { assertGet } from "./utils/assert";
import { consumeArray } from "./utils/misc";
import { decodeInput } from "./decode";
import { getIsObject } from "./is";
import { getIsTagKey } from "./format";
import { performEncode } from "./encode";
import { resolveCodableDependencies } from "./dependencies";

const BUILTIN_TYPES = [...Object.values(builtinTypesMap)]
  .map((codableTypeOrCodableTypes) => {
    if (Array.isArray(codableTypeOrCodableTypes)) {
      return codableTypeOrCodableTypes;
    }

    return [codableTypeOrCodableTypes];
  })
  .flat()
  .filter(getIsCodableType);

const DEFAULT_TYPES = [...BUILTIN_TYPES, $$externalReference].filter(getIsCodableType);

function getSortedTypes(types: CodableType[]) {
  return types.sort((a, b) => {
    return b.priority - a.priority;
  });
}

function fillMapWithTypes(map: Map<string, CodableType>, types: CodableType[]) {
  map.clear();

  for (const type of types) {
    if (map.has(type.name)) {
      throw new Error(`Coder type "${type.name}" already registered`);
    }

    map.set(type.name, type);
  }
}

function createTypesMap(types: CodableType[]) {
  const sortedTypes = getSortedTypes(types);

  const map = new Map<string, CodableType>();

  fillMapWithTypes(map, sortedTypes);

  return map;
}

type CodableTypeOrClass = CodableType | AnyClass;

function updateTypesOrderByPriority(currentTypes: Map<string, CodableType>) {
  const sortedTypes = getSortedTypes([...currentTypes.values()]);

  const needsReordering = sortedTypes.some((type) => !type.hasDefaultPriority);

  if (!needsReordering) return;

  fillMapWithTypes(currentTypes, sortedTypes);
}

export class Coder {
  private readonly typesMap = new Map<string, CodableType>();
  private readonly codableTypeByClassMap = new Map<AnyClass, CodableType>();

  constructor(extraTypes: CodableTypeOrClass[] = []) {
    this.typesMap = createTypesMap([...DEFAULT_TYPES]);

    this.register(...extraTypes);
  }

  private refreshCodableTypeByClassMap() {
    this.codableTypeByClassMap.clear();

    for (const type of this.typesMap.values()) {
      if (type.classes) {
        for (const Class of type.classes) {
          this.codableTypeByClassMap.set(Class, type);
        }
      }
    }
  }

  private organizeTypes() {
    updateTypesOrderByPriority(this.typesMap);
    this.refreshCodableTypeByClassMap();
  }

  getTypeByName(name: string): CodableType | null {
    return this.typesMap.get(name) ?? null;
  }

  private getHasType(type: CodableType): boolean {
    const existingType = this.getTypeByName(type.name);

    return type === existingType;
  }

  register(...typesOrClasses: CodableTypeOrClass[]) {
    if (typesOrClasses.length === 0) return;

    if (this.isDefault) {
      throw new Error(
        "Cannot register types on the default coder. Create a custom coder instance using `new Coder()` and register types on that instance.",
      );
    }

    const dependenciesToRegister = new Set<CodableType>();

    for (const typeOrClass of typesOrClasses) {
      const codableType = getIsCodableClass(typeOrClass)
        ? assertGet(getCodableClassType(typeOrClass), `Codable class "${typeOrClass.name}" not registered`)
        : typeOrClass;

      if (this.getHasType(codableType)) continue;

      if (this.typesMap.has(codableType.name)) {
        throw new Error(`Other codable type with name "${codableType.name}" already registered`);
      }

      this.typesMap.set(codableType.name, codableType);

      for (const dependency of resolveCodableDependencies(codableType)) {
        dependenciesToRegister.add(dependency);
      }
    }

    this.register(...dependenciesToRegister);

    this.organizeTypes();
  }

  addType<Item, Data>(
    name: string,
    canEncode: (value: unknown) => value is Item,
    encode: (data: Item) => Data,
    decode: (data: Data) => Item,
    options?: CodableTypeOptions<Item>,
  ) {
    return this.register(codableType(name, canEncode, encode, decode, options));
  }

  encode<T>(value: T, options?: EncodeOptions): JSONValue {
    const encodeContext = new EncodeContext(this, options);

    const result = performEncode(value, encodeContext);

    encodeContext.finalize();

    return result;
  }

  decode<T>(value: JSONValue, options?: DecodeOptions): T {
    const context = new DecodeContext(this, options);

    const result = decodeInput<T>(value, context, this, ROOT_PATH);

    this.resolvePendingReferencesInOutput(result, context);

    return result;
  }

  stringify<T>(value: T, space?: string | number): string {
    return JSON.stringify(this.encode(value), null, space);
  }

  parse<T>(value: string): T {
    return this.decode(JSON.parse(value));
  }

  clone<T>(value: T): T {
    return this.decode<T>(this.encode(value));
  }

  getMatchingTypeForObject<T extends object>(input: T): CodableType<T> | null {
    const codableTypeByClass = this.codableTypeByClassMap.get(input.constructor as AnyClass);

    if (codableTypeByClass?.canHandle(input)) {
      return codableTypeByClass;
    }

    for (const type of this.typesMap.values()) {
      if (type.canHandle(input)) {
        return type;
      }
    }

    return null;
  }

  get isDefault() {
    return this === coder;
  }

  private resolvePendingReferencesInOutput(output: any, context: DecodeContext) {
    for (const [refId, paths] of context.pendingReferences) {
      const referenceTarget = context.resolvedRefs.get(refId);

      if (!referenceTarget) continue;

      for (const path of paths) {
        const didUpdate = this.updateValueInOutput(output, path, referenceTarget);

        if (!didUpdate) {
          console.warn(`Failed to update value at path ${path}`);
        }
      }
    }
  }

  private updateValueInOutput(root: object, path: Path, value: unknown) {
    const segmentsConsumer = consumeArray(splitPath(path), getIsTagKey);

    let current = root;

    while (true) {
      const matchingType = this.getMatchingTypeForObject(current);

      const reader = matchingType?.reader ?? defaultCodableReader;

      const { get, set } = reader(current, segmentsConsumer);

      if (segmentsConsumer.isDone) {
        // We are at the end of the path, so we can set the value
        return set(value);
      }

      // Read the value and keep traversing the path
      const result = get();

      if (!getIsObject(result)) {
        console.warn(`Expected object at path ${path}, got ${typeof result}`);
        return false;
      }

      current = result;
    }
  }
}

export function createCoder(extraTypes: CodableType[] = []) {
  return new Coder(extraTypes);
}

export const coder = createCoder();

export function decode<T>(value: JSONValue, options?: DecodeOptions): T {
  return coder.decode(value, options);
}

export function encode<T>(value: T): JSONValue {
  return coder.encode(value);
}

export function stringify<T>(value: T, space?: string | number): string {
  return coder.stringify(value, space);
}

export function parse<T>(value: string): T {
  return coder.parse(value);
}

export function clone<T>(value: T): T {
  return coder.clone(value);
}
