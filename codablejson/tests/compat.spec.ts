import superjson from "superjson";
import { Coder, decode, codablejson } from "../Coder";
import { captureWarnings } from "./testUtils";

describe("superjson compatibility", () => {
  it("should warn if trying to decode superjson encoded data without compability mode enabled", () => {
    const data = new Set([1, 2, 3]);
    const sjData = superjson.serialize(data);

    using _ = captureWarnings();
    decode(sjData as any);

    expect(console.warn).toHaveBeenCalledWith(
      `Seems you are decoding SuperJSON encoded data. Please enable compatibility mode by importing "codablejson/superjson" somewhere early in your code.`,
    );
  });

  it("should properly decode superjson data when compatibility mode is enabled", async () => {
    const data = new Set([1, 2, 3]);
    const sjData = superjson.serialize(data);

    await import("../superjson");

    const coder = new Coder();

    const decoded = coder.decode(sjData as any);

    expect(decoded).toEqual(data);
  });
});
