import { getIsNotNull } from "../is";

export const TYPED_ARRAY_MAP = {
  Uint8Array: typeof Uint8Array !== "undefined" ? Uint8Array : null,
  Uint8ClampedArray: typeof Uint8ClampedArray !== "undefined" ? Uint8ClampedArray : null,
  Uint16Array: typeof Uint16Array !== "undefined" ? Uint16Array : null,
  Uint32Array: typeof Uint32Array !== "undefined" ? Uint32Array : null,
  Int8Array: typeof Int8Array !== "undefined" ? Int8Array : null,
  Int16Array: typeof Int16Array !== "undefined" ? Int16Array : null,
  Int32Array: typeof Int32Array !== "undefined" ? Int32Array : null,
  Float32Array: typeof Float32Array !== "undefined" ? Float32Array : null,
  Float64Array: typeof Float64Array !== "undefined" ? Float64Array : null,
} as const;

export const TYPED_ARRAY_CLASSES = Object.values(TYPED_ARRAY_MAP).filter(getIsNotNull);

export type TypedArrayTypeName = keyof typeof TYPED_ARRAY_MAP;
export type TypedArray = InstanceType<NonNullable<(typeof TYPED_ARRAY_MAP)[TypedArrayTypeName]>>;
