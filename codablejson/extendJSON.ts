import { Coder, codablejson } from "./Coder";

let isExtended = false;

export function extendJSONWithCodableJSON(coder: Coder = codablejson) {
  if (isExtended) {
    throw new Error("JSON is already extended. Make sure to undo the other extension first.");
  }

  isExtended = true;

  const JSONparse = JSON.parse;
  const JSONstringify = JSON.stringify;

  JSON.stringify = (value, replacer?: any, space?: any) => {
    value = codablejson.encode(value);

    return JSONstringify(value, replacer, space);
  };

  JSON.parse = (text, reviver) => {
    const rawParsed = JSONparse(text, reviver);

    return codablejson.decode(rawParsed);
  };

  return function restoreJSON() {
    JSON.parse = JSONparse;
    JSON.stringify = JSONstringify;

    isExtended = false;
  };
}
