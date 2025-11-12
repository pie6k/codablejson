import { decode, encode } from "../Coder";

import { createEscaper } from "../utils/Escaper";

const SPECIAL_STRINGS = ["$$undefined", "$$NaN", "$$-0", "$$Infinity", "$$-Infinity"] as const;

describe("Escaper", () => {
  it("Escaper should work", () => {
    const escaper = createEscaper(/^\$\$.+$/);

    expect(escaper.escape("nope")).toEqual("nope");
    expect(escaper.escape("$$foo")).toEqual("~$$foo");
    expect(escaper.escape("~$$foo")).toEqual("~~$$foo");
    expect(escaper.escape("~~$$foo")).toEqual("~~~$$foo");

    expect(escaper.unescape("~$$foo")).toEqual("$$foo");
    expect(escaper.unescape("~~$$foo")).toEqual("~$$foo");
    expect(escaper.unescape("~~~$$foo")).toEqual("~~$$foo");
    expect(escaper.unescape("$$foo")).toEqual("$$foo");
  });

  it("properly detects escaped strings", () => {
    const escaper = createEscaper(/^\$\$.+$/);

    expect(escaper.getIsMaybeEscaped("nope")).toEqual(false);
    expect(escaper.getIsMaybeEscaped("$$foo")).toEqual(true);
    expect(escaper.getIsMaybeEscaped("~$$foo")).toEqual(true);
    expect(escaper.getIsMaybeEscaped("~~$$foo")).toEqual(true);

    expect(escaper.getIsAlreadyEscaped("nope")).toEqual(false);
    expect(escaper.getIsAlreadyEscaped("$$foo")).toEqual(false);
    expect(escaper.getIsAlreadyEscaped("~$$foo")).toEqual(true);
    expect(escaper.getIsAlreadyEscaped("~~$$foo")).toEqual(true);
  });

  it("properly detects matching strings", () => {
    const escaper = createEscaper(/^\$\$.+$/);

    expect(escaper.getIsMatching("nope")).toEqual(false);
    expect(escaper.getIsMatching("$$foo")).toEqual(true);
    expect(escaper.getIsMatching("~$$foo")).toEqual(false);
    expect(escaper.getIsMatching("~~$$foo")).toEqual(false);
  });
});

describe("escape", () => {
  it("should escape special strings", () => {
    for (const string of SPECIAL_STRINGS) {
      expect(encode(string)).toEqual(`~${string}`);
      expect(encode(`~${string}`)).toEqual(`~~${string}`);
      expect(encode(`~~${string}`)).toEqual(`~~~${string}`);

      expect(decode(`~${string}`)).toEqual(string);
      expect(decode(`~~${string}`)).toEqual(`~${string}`);
      expect(decode(`~~~${string}`)).toEqual(`~~${string}`);
    }
  });

  it("should not escape regular strings looking like special strings", () => {
    expect(encode("$$foo")).toEqual("$$foo");
    expect(decode("$$foo")).toEqual("$$foo");

    expect(encode("~$$foo")).toEqual("~$$foo");
    expect(decode("~$$foo")).toEqual("~$$foo");

    expect(encode("~~$$foo")).toEqual("~~$$foo");
    expect(decode("~~$$foo")).toEqual("~~$$foo");

    expect(encode("~~~$$foo")).toEqual("~~~$$foo");
    expect(decode("~~~$$foo")).toEqual("~~~$$foo");
  });

  it("should escape empty strings", () => {
    expect(encode("$$empty")).toEqual("~$$empty");
    expect(decode("$$empty")).toEqual("$$empty");

    expect(encode("~$$empty")).toEqual("~~$$empty");
    expect(decode("~~$$empty")).toEqual("~$$empty");

    expect(encode(["$$empty"])).toEqual(["~$$empty"]);
    expect(decode(["~$$empty"])).toEqual(["$$empty"]);
    expect(decode(["$$empty"])).toEqual([,]);
  });
});

describe("superjson escape", () => {
  it("should not encode to superjson format", () => {
    const data = [1, 2, 3];
    const input = { json: data };
    const encoded = encode(input);
    expect(encoded).toEqual({ ["~json"]: data });

    expect(decode(encoded)).toEqual(input);

    expect(encode({ "~~json": data })).toEqual({ "~~~json": data });
    expect(decode({ "~~~json": data })).toEqual({ "~~json": data });
  });
});
