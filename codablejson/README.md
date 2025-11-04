# CodableJSON

High-performance, no-dependencies, extensible, and declarative "anything to/from JSON" serializer.

![npm](https://img.shields.io/npm/v/codablejson)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/codablejson)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

Throw your data at it - [open playground](https://codablejson.com/playground/)

[Read the docs](https://codablejson.com/docs)

## Key Features

- **📝 Declarative**: Modern decorators allowing you to mark "what to serialize", not "how to serialize it"
- **🔌 Type-rich & Extensible**: By default handles almost every built-in JavaScript type. Easy to extend with custom handled types.
- **⚡️ High-performance**: ~3x faster than SuperJSON ([see benchmark](https://codablejson.com/docs/performance))
- **🔒 Type-safe**: Full TypeScript support with autocompletion and type inference
- **🎯 Zero dependencies**: Fully standalone, no external dependencies. 7.3KB gziped.
- **✅ Well tested**: Every feature is covered by tests. It passes most of SuperJSON tests moved into CodableJSON (including plenty of edge cases)
- **🔄 Framework agnostic**: Works with any JavaScript/TypeScript project
- **🛡️ Secure**: Built-in protection against prototype pollution

# Installation

```bash
npm install codablejson
yarn add codablejson
pnpm add codablejson
```

# Quick start

## JSON Serialization

Extend JSON to handle JavaScript types that JSON can't serialize:

```typescript
import { encode, decode } from "codablejson";

const data = {
  date: new Date("2025-01-01"),
  set: new Set(["a", "b", "c"]),
  map: new Map([["key", "value"]]),
  bigint: BigInt("1234567890123456789"),
  regex: /hello/gi,
  url: new URL("https://example.com"),
};

const encoded = encode(data);
// {
//   date: { $$Date: "2025-01-01T00:00:00.000Z" },
//   set: { $$Set: ["a", "b", "c"] },
//   map: { $$Map: [["key", "value"]] },
//   bigint: { $$BigInt: "1234567890123456789" },
//   regex: { $$RegExp: "/hello/gi" },
//   url: { $$URL: "https://example.com/" }
// }

const decoded = decode(encoded);
// decoded.date instanceof Date === true
// decoded.set instanceof Set === true
// All types preserved!
```

## Declarative Class Serialization

Eliminate the dual-format problem with modern decorators

### What declarative means here?

It means you mark "what to serialize", not "how to serialize it"

```typescript
import { codableClass, codable, Coder } from "codablejson";

@codableClass("Player")
class Player {
  @codable() name: string;
  @codable() score: number;

  // Note: constructor is not needed for CodableJSON to work, it is here for convenience of creating instances.
  constructor(data: Pick<Player, "name" | "score">) {
    this.name = data.name;
    this.score = data.score;
  }
}

@codableClass("GameState")
class GameState {
  @codable() players: Set<Player> = new Set();
  @codable() createdAt = new Date();
  @codable() activePlayer: Player | null = null;

  addPlayer(player: Player) {
    this.players.add(player);
    this.activePlayer = player;
  }
}

// Create a custom coder instance
const coder = new Coder([GameState]);

// Use your classes naturally
const gameState = new GameState();
gameState.addPlayer(new Player({ name: "Alice", score: 100 }));

// Serialize directly - no conversion logic needed!
const encoded = coder.encode(gameState);
const decoded = coder.decode<GameState>(encoded);
// All types, references, and circular dependencies preserved!
```

Note: for classes to be automatically serialized, they need to have memberwise constructor (eg the same way like Swift `Codable` structs work). Read more about it [here](https://codablejson.com/docs/declarative-serialization/memberwise-constructor).

# Built-in Types

CodableJSON automatically handles JavaScript types that standard JSON cannot serialize:

| JavaScript Type   | Example Output                                       |
| ----------------- | ---------------------------------------------------- |
| `Date`            | `{ $$Date: "2025-01-01T00:00:00.000Z" }`             |
| `BigInt`          | `{ $$BigInt: "1234567890123456789" }`                |
| `Set`             | `{ $$Set: ["a", "b", "c"] }`                         |
| `Map`             | `{ $$Map: [["key", "value"]] }`                      |
| `RegExp`          | `{ $$RegExp: "/hello/gi" }`                          |
| `Symbol`          | `{ $$Symbol: "test" }`                               |
| `URL`             | `{ $$URL: "https://example.com/" }`                  |
| `URLSearchParams` | `{ $$URLSearchParams: "foo=bar&baz=qux" }`           |
| `Error`           | `{ $$Error: "Something went wrong" }`                |
| `undefined`       | `"$$undefined"`                                      |
| Typed Arrays      | `{ $$uint8array: [1, 2, 3] }`                        |
| Special Numbers   | `"$$NaN"`, `"$$Infinity"`, `"$$-Infinity"`, `"$$-0"` |

[Read more about supported types →](https://codablejson.com/docs/json-serialization/supported-types)

Of course, you can extend it with custom types.

# Performance

CodableJSON is heavily optimized for performance:

- **Encoding**: ~3-3.5x faster than SuperJSON across all data sizes and types
- **Decoding**: Comparable to or faster than SuperJSON depending on the data type

[View detailed benchmarks →](https://codablejson.com/docs/performance)

# API Overview

## Core Functions

```typescript
import { encode, decode, stringify, parse, clone } from "codablejson";

// Basic encoding/decoding
const encoded = encode(data);
const decoded = decode(encoded);

// With JSON stringification
const jsonString = stringify(data);
const restored = parse(jsonString);

// Deep clone maintaining all types and references equality
const foo = { foo: "foo" };
const original = [foo, foo];
const cloned = clone(original);
// cloned === original; // false
// cloned[0] === original[0]; // false -> nested clone
// cloned[0] === cloned[1]; // true -> reference equality is preserved
```

## Declarative Class Serialization

```typescript
import { codableClass, codable, Coder } from "codablejson";

@codableClass("MyClass")
class MyClass {
  @codable() property: string;
}

const coder = new Coder([MyClass]);
const encoded = coder.encode(instance);
const decoded = coder.decode<MyClass>(encoded);
```

## Custom Types

You can also use lower-level API to create custom types and encode/decode them manually.

```typescript
import { codableType, Coder } from "codablejson";

const $$custom = codableType(
  "CustomType", // name of the type
  (value) => value instanceof CustomType, // how to detect some value should be encoded using this type
  (instance) => instance.data, // how to encode the value (might return rich data like `Map` or `Set`, or even other custom types)
  (data) => new CustomType(data), // how to recreate the value from the encoded data
);

const coder = new Coder([$$custom]);
// or
const coder = new Coder();
coder.register($$custom);
```

# Security

CodableJSON includes built-in security measures:

- **Prototype Pollution Protection**: Automatically filters dangerous properties (`constructor`, `__proto__`, `prototype`)
- **Safe Object Creation**: Creates objects without modifying prototypes
- **Format Safety**: Automatic collision detection and escaping

[Read more about security features →](https://codablejson.com/docs/security)

# Comparisons

## Benchmark vs SuperJSON

You can run these benchmarks yourself by downloading the repository and running `yarn codablejson bench`. The benchmark code is available in [`benchmark.bench.ts`](https://github.com/adam/codablejson/blob/main/codablejson/tests/benchmark.bench.ts).

### Plain JSON Data (6MB)

| Operation  | Preserve refs                      | Copy refs                          |
| ---------- | ---------------------------------- | ---------------------------------- |
| **Encode** | 🟢 **3.68x faster** than SuperJSON | 🟢 **6.85x faster** than SuperJSON |
| **Decode** | 🟢 **1.29x faster** than SuperJSON | 🟢 **1.28x faster** than SuperJSON |

### Complex Data Structures

It includes deeply nested objects, with repeating references, `Sets`, `Maps`, and `Dates`

| Dataset     | Encode              |                     | Decode              |                     |
| ----------- | ------------------- | ------------------- | ------------------- | ------------------- |
|             | **Preserve refs**   | **Copy refs**       | **Preserve refs**   | **Copy refs**       |
| **Small**   | 🟢 **3.89x faster** | 🟢 **6.98x faster** | 🟢 **1.68x faster** | 🟢 **1.66x faster** |
| **Average** | 🟢 **4.20x faster** | 🟢 **5.06x faster** | 🟢 **1.16x faster** | 🟢 **1.05x faster** |
| **Large**   | 🟢 **4.01x faster** | 🟢 **7.54x faster** | 🟢 **1.19x faster** | 🟢 **1.83x faster** |
| **Huge**    | 🟢 **4.08x faster** | 🟢 **6.43x faster** | 🟢 **1.31x faster** | 🟢 **2.37x faster** |

Benchmark was run on a MacBook Pro M3 Max with 128GB of RAM.

## Migration from SuperJSON

For simple JSON serialization, CodableJSON is almost a drop-in replacement for SuperJSON.

For custom types, please read about [custom types](https://codablejson.com/docs/json-serialization/custom-types) in JSON Serialization section.

```typescript
// Before
import { stringify, parse } from "superjson";
const serialized = stringify(data);
const deserialized = parse(serialized);

// After
import { stringify, parse } from "codablejson";
const serialized = stringify(data);
const deserialized = parse(serialized);
```

[Read complete comparison guide →](https://codablejson.com/docs/comparisons)

# Documentation

- **[Quick Start](https://codablejson.com/docs)** - Get up and running quickly
- **[JSON Serialization](https://codablejson.com/docs/json-serialization)** - Handle complex JavaScript types
- **[Declarative Serialization](https://codablejson.com/docs/declarative-serialization)** - Serialize classes with decorators
- **[Performance](https://codablejson.com/docs/performance)** - Benchmark results and optimization
- **[Security](https://codablejson.com/docs/security)** - Security features and best practices
- **[Recipes](https://codablejson.com/docs/recipes)** - Real-world examples and integrations

# Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
