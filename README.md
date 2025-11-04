![npm](https://img.shields.io/npm/v/codablejson)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/codablejson)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

CodableJSON is a declarative JSON serialization library that aims to enable a whole new paradigm of data serialization in TypeScript/JavaScript.

Using modern decorators (`@codableClass` and `@codable`), you can mark your data model classes as serializable instead of writing custom (to/from) JSON functions.

Besides that, it's 3x faster SuperJSON alternative.

- **[Playground](https://codablejson.com/playground/)** - Experiment with CodableJSON in the playground
- **[Documentation](https://codablejson.com/docs)** - Read the documentation

## Key Features

- **Declarative and extensible**: Mark props and classes as serializable instead of writing custom (to/from) JSON functions.
- **SuperJSON drop-in replacement**: ~3x faster than SuperJSON ([see benchmark](https://codablejson.com/docs/performance))
- **Type-safe**: Full TypeScript support with autocompletion and type inference
- **Zero dependencies**: Fully standalone, no external dependencies. Less than 10KB gziped.
- **Well tested**: Every feature is covered by tests. It passes most of SuperJSON tests moved into CodableJSON (including plenty of edge cases)
- **Framework agnostic**: Works with any JavaScript/TypeScript project
- **Secure**: Built-in protection against prototype pollution

# Installation

```bash
npm install codablejson
yarn add codablejson
pnpm add codablejson
```

# Quick start

## 1. JSON Serialization

Besides declarative framework (described below), it is also an ultra-fast SuperJSON alternative that can encode/decode almost any JavaScript input.

```typescript
import { encode, decode } from "codablejson";

const data = {
  date: new Date("2025-01-01"),
  map: new Map([["key", "value"]]),
};

const encoded = encode(data);
// {
//   date: { $$Date: "2025-01-01T00:00:00.000Z" },
//   map: { $$Map: [["key", "value"]] },
// }

const decoded = decode(encoded); // fully equals to the original data
```

## 2. Declarative Class Serialization

Instead of writing custom (to/from) JSON functions, you can mark your classes and properties as serializable with modern decorators.

Let's define some classes and mark them as serializable:

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

// Use your classes naturally
const gameState = new GameState();
gameState.addPlayer(new Player({ name: "Alice", score: 100 }));
```

Now, let's create a custom coder instance that is aware of our classes:

```typescript
const coder = new Coder([GameState]);
```

Now, we can serialize our game state:

```typescript
const encoded = coder.encode(gameState);
```

Will be serialized as:

```json
{
  "$$GameState": [
    {
      "players": {
        "$$Set": [
          {
            "$$Player": [
              {
                "$$id": 0,
                "name": "Foo",
                "score": 100
              }
            ]
          }
        ]
      },
      "createdAt": { "$$Date": "2025-11-27T23:00:00.000Z" },
      "activePlayer": { "$$ref": 0 }
    }
  ]
}
```

We can decode it back to our original data. All types, references, and circular dependencies are preserved!

```typescript
const decoded = coder.decode<GameState>(encoded);
```

> [!NOTE]  
> Note: for classes to be automatically serialized, some conventions need to be followed. Read more about it [here](https://codablejson.com/docs/declarative-serialization/memberwise-constructor).

# Built-in Types

Out of the box, CodableJSON handles most of the built-in JavaScript types:

`Date`, `BigInt`, `Set`, `Map`, `RegExp`, `Symbol`, `URL`, `URLSearchParams`, `Error`, `undefined`, typed arrays, special numbers like `NaN`, `Infinity`, `-Infinity`, `-0` (treated as `null` by regular JSON).

[Read more about supported types →](https://codablejson.com/docs/json-serialization/supported-types)

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

[Read more about custom types →](https://codablejson.com/docs/json-serialization/custom-types)

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

# License

MIT
