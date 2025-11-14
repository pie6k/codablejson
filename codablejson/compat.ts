import { JSONValue } from "./types";
import { getIsRecord } from "./is";

export interface Transformer {
  serialize: (value: any) => any;
  deserialize: (value: any) => any;
}

let superjsonTransformer: Transformer | null = null;

export function setSuperjsonTransformer(transformer: Transformer | null) {
  superjsonTransformer = transformer;
}

export function getSuperjsonTransformer() {
  return superjsonTransformer;
}

export function getIsSuperJSONResult(input: JSONValue) {
  return getIsRecord(input) && "json" in input;
}
