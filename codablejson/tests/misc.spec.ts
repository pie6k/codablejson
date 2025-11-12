import { DecodeContext } from "../DecodeContext";
import { codablejson } from "../Coder";

describe("misc", () => {
  it("encodes function as null", () => {
    const foo = () => "foo";
    const encoded = codablejson.encode(foo);
    expect(encoded).toEqual(null);
    const decoded = codablejson.decode<typeof foo>(encoded);
    expect(decoded).toBe(null);
  });
});

describe("POJO with symbol key", () => {
  it("should ignore symbol keys", () => {
    const foo = { [Symbol("foo")]: "foo" };
    const encoded = codablejson.encode(foo);
    expect(encoded).toEqual({});
    const decoded = codablejson.decode<typeof foo>(encoded);
    expect(decoded).toEqual({});
  });
});

describe("primitive objects", () => {
  it("String", () => {
    const input = String("foo");
    const encoded = codablejson.encode(input);
    expect(encoded).toEqual("foo");
    const decoded = codablejson.decode<typeof input>(encoded);
    expect(decoded).toEqual(input);
  });
});
