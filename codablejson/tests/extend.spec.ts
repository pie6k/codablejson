import { extendJSONWithCodableJSON } from "../extendJSON";

describe("extendJSONWithCodableJSON", () => {
  it("should extend JSON with CodableJSON", () => {
    const restore = extendJSONWithCodableJSON();

    const stringified = JSON.stringify({ foo: /hello/gi });

    expect(stringified).toMatchInlineSnapshot(`"{"foo":{"$$RegExp":"/hello/gi"}}"`);

    const parsed = JSON.parse(stringified);

    expect(parsed).toEqual({ foo: /hello/gi });

    restore();

    expect(JSON.stringify({ foo: /hello/gi })).toMatchInlineSnapshot(`"{"foo":{}}"`);
  });
});
