import { JSONValue } from "./types";
import { getIsRecord } from "./is";

export interface Transformer {
  serialize: (value: any) => any;
  deserialize: (value: any) => any;
}

export function getIsSuperJSONResult(input: JSONValue) {
  return getIsRecord(input) && "json" in input;
}
