# enumkit

> Zero-dependency TypeScript enum utilities for `as const` objects: `enumValues`, `fromValue`, `fromName`, `isEnumValue`, `exhaustive` switch check, bit-flag helpers. Port of Python `enum.Enum` / Java enum reflection / C# `Enum.Parse`.

[![npm](https://img.shields.io/npm/v/enumkit)](https://www.npmjs.com/package/enumkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## The problem

TypeScript's built-in `enum` has well-known footguns (numeric enums, const enum erasure, module augmentation issues). The idiomatic alternative is `as const`:

```typescript
const Status = { Active: 'active', Inactive: 'inactive', Pending: 'pending' } as const;
type StatusValue = typeof Status[keyof typeof Status]; // 'active' | 'inactive' | 'pending'
```

But then you lose everything Python `enum.Enum` / Java enum / C# `Enum` gives you for free: iteration, reverse lookup, type-safe exhaustiveness checks, runtime validation.

**enumkit** adds all of that back, with full TypeScript inference.

## Install

```bash
npm install enumkit
```

## Quick start

```typescript
import {
  enumValues, enumKeys, enumEntries,
  isEnumValue, fromValue, fromName,
  createEnum, exhaustive,
  hasFlag, addFlag, flagsSet
} from "enumkit";

const Status = { Active: 'active', Inactive: 'inactive', Pending: 'pending' } as const;

enumValues(Status)          // ['active', 'inactive', 'pending']
enumKeys(Status)            // ['Active', 'Inactive', 'Pending']
isEnumValue(Status, 'active')   // true  (narrows type)
fromValue(Status, 'active')     // 'Active'   ← like Java Enum.valueOf()
fromName(Status, 'Active')      // 'active'   ← like Python MyEnum['Active'].value
```

## API

### Core functions

```typescript
enumValues<T>(obj: T): T[keyof T][]
enumKeys<T>(obj: T): (keyof T & string)[]
enumEntries<T>(obj: T): [keyof T & string, T[keyof T]][]
enumSize<T>(obj: T): number

isEnumValue<T>(obj: T, value: unknown): value is T[keyof T]   // type guard
isEnumKey<T>(obj: T, key: unknown): key is keyof T & string   // type guard

fromValue<T>(obj: T, value: T[keyof T]): keyof T | undefined  // reverse lookup
fromValueOrThrow<T>(obj: T, value: T[keyof T]): keyof T       // throws EnumError
fromName<T>(obj: T, key: string): T[keyof T] | undefined      // forward lookup
fromNameOrThrow<T>(obj: T, key: string): T[keyof T]           // throws EnumError
```

### `createEnum` — OOP API

```typescript
const Status$ = createEnum({ Active: 'active', Inactive: 'inactive' } as const);

Status$.values()                // ['active', 'inactive']
Status$.keys()                  // ['Active', 'Inactive']
Status$.entries()               // [['Active', 'active'], ...]
Status$.size                    // 2
Status$.isValue('active')       // true
Status$.isKey('Active')         // true
Status$.fromValue('active')     // 'Active'
Status$.fromName('Active')      // 'active'
Status$.fromNameOrThrow('X')    // throws EnumError

// Iterable
for (const [key, value] of Status$) { ... }
```

### `exhaustive` — switch exhaustiveness

```typescript
import { exhaustive } from "enumkit";

type Color = 'red' | 'green' | 'blue';

function hex(c: Color): string {
  switch (c) {
    case 'red':   return '#ff0000';
    case 'green': return '#00ff00';
    case 'blue':  return '#0000ff';
    default: return exhaustive(c); // TypeScript error if any case is missing
  }
}
```

If you add `'yellow'` to the `Color` type but forget the `case 'yellow':` branch, TypeScript shows an error at the `exhaustive(c)` call site.

### Bit-flag utilities

For numeric enums acting as bit flags (like C# `[Flags]` / Java `EnumSet`):

```typescript
import { hasFlag, hasAnyFlag, hasAllFlags, addFlag, removeFlag, toggleFlag, flagsSet, combineFlags } from "enumkit";

const Permission = { Read: 1, Write: 2, Execute: 4 } as const;

const rw = combineFlags(Permission.Read, Permission.Write);  // 3
hasFlag(rw, Permission.Read)     // true
hasFlag(rw, Permission.Execute)  // false
hasAnyFlag(rw, Permission.Write, Permission.Execute)  // true
hasAllFlags(rw, Permission.Read, Permission.Write)    // true

addFlag(rw, Permission.Execute)    // 7
removeFlag(rw, Permission.Write)   // 1
toggleFlag(rw, Permission.Execute) // 7

flagsSet(rw, Permission)  // ['Read', 'Write']
```

## Comparison

| Feature | Python `enum.Enum` | Java enum | C# Enum | enumkit |
|---|---|---|---|---|
| Iteration | `list(MyEnum)` | `MyEnum.values()` | `Enum.GetValues()` | `enumValues(obj)` |
| Value → name | `MyEnum(val).name` | via loop | n/a | `fromValue(obj, val)` |
| Name → value | `MyEnum['name'].value` | `MyEnum.valueOf(name)` | `Enum.Parse()` | `fromName(obj, name)` |
| Type guard | isinstance | instanceof | n/a | `isEnumValue(obj, val)` |
| Exhaustive check | `match` + `assert_never` | sealed (Java 17+) | n/a | `exhaustive(val)` |
| Bit flags | `Flag` subclass | `EnumSet` | `[Flags]` | `hasFlag/addFlag/...` |

## Why not `ts-enum-util`?

`ts-enum-util` (2022, ~12k/week) works with TypeScript's native `enum` keyword — which has known issues. `enumkit` works with the idiomatic `as const` pattern, gives you zero-dep runtime utilities with full generic inference, and adds exhaustive checking + bit flags in one package.

## License

MIT © [trananhtung](https://github.com/trananhtung)
