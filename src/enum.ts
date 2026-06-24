export type EnumObject = Record<string, string | number>;
export type EnumValue<T extends EnumObject> = T[keyof T];
export type EnumKey<T extends EnumObject> = keyof T & string;

/** All values of a const enum object, typed. */
export function enumValues<T extends EnumObject>(enumObj: T): EnumValue<T>[] {
  return Object.values(enumObj) as EnumValue<T>[];
}

/** All keys of a const enum object, typed. */
export function enumKeys<T extends EnumObject>(enumObj: T): EnumKey<T>[] {
  return Object.keys(enumObj) as EnumKey<T>[];
}

/** All [key, value] entries of a const enum object, typed. */
export function enumEntries<T extends EnumObject>(enumObj: T): [EnumKey<T>, EnumValue<T>][] {
  return Object.entries(enumObj) as [EnumKey<T>, EnumValue<T>][];
}

/** Type guard: value is a member of the enum. Like Python `val in MyEnum._value2member_map_`. */
export function isEnumValue<T extends EnumObject>(
  enumObj: T,
  value: unknown,
): value is EnumValue<T> {
  return Object.values(enumObj).includes(value as string | number);
}

/** Type guard: key is a member key of the enum. */
export function isEnumKey<T extends EnumObject>(
  enumObj: T,
  key: unknown,
): key is EnumKey<T> {
  return typeof key === "string" && Object.prototype.hasOwnProperty.call(enumObj, key);
}

/**
 * Reverse-lookup: value → key. Like Java `Enum.valueOf()` or Python `MyEnum(val).name`.
 * Returns `undefined` if not found.
 */
export function fromValue<T extends EnumObject>(
  enumObj: T,
  value: EnumValue<T>,
): EnumKey<T> | undefined {
  const entry = Object.entries(enumObj).find(([, v]) => v === value);
  return entry ? (entry[0] as EnumKey<T>) : undefined;
}

/** Like `fromValue` but throws `EnumError` if not found. */
export function fromValueOrThrow<T extends EnumObject>(
  enumObj: T,
  value: EnumValue<T>,
): EnumKey<T> {
  const key = fromValue(enumObj, value);
  if (key === undefined) {
    throw new EnumError(`Value "${String(value)}" is not a member of the enum`);
  }
  return key;
}

/**
 * Forward-lookup: key → value. Like Python `MyEnum["name"]` or C# `Enum.Parse()`.
 * Returns `undefined` if key not found.
 */
export function fromName<T extends EnumObject>(
  enumObj: T,
  key: string,
): EnumValue<T> | undefined {
  if (!isEnumKey(enumObj, key)) return undefined;
  return enumObj[key] as EnumValue<T>;
}

/** Like `fromName` but throws `EnumError` if key not found. */
export function fromNameOrThrow<T extends EnumObject>(
  enumObj: T,
  key: string,
): EnumValue<T> {
  const value = fromName(enumObj, key);
  if (value === undefined) {
    throw new EnumError(`Key "${key}" is not a member of the enum`);
  }
  return value;
}

/** Number of members in the enum. */
export function enumSize<T extends EnumObject>(enumObj: T): number {
  return Object.keys(enumObj).length;
}

export class EnumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnumError";
  }
}

// ── createEnum ──────────────────────────────────────────────────────────────

export interface EnumInstance<T extends EnumObject> {
  readonly source: T;
  readonly size: number;
  values(): EnumValue<T>[];
  keys(): EnumKey<T>[];
  entries(): [EnumKey<T>, EnumValue<T>][];
  isValue(value: unknown): value is EnumValue<T>;
  isKey(key: unknown): key is EnumKey<T>;
  fromValue(value: EnumValue<T>): EnumKey<T> | undefined;
  fromValueOrThrow(value: EnumValue<T>): EnumKey<T>;
  fromName(key: string): EnumValue<T> | undefined;
  fromNameOrThrow(key: string): EnumValue<T>;
  [Symbol.iterator](): Iterator<[EnumKey<T>, EnumValue<T>]>;
}

/**
 * Wraps a `const` object as an enum instance with iteration and lookup methods.
 * Like Python's `enum.Enum` class or Java's enum type.
 *
 * @example
 * const Status = createEnum({ Active: 'active', Inactive: 'inactive' } as const);
 * Status.values()           // → ['active', 'inactive']
 * Status.fromValue('active') // → 'Active'
 */
export function createEnum<T extends EnumObject>(source: T): EnumInstance<T> {
  return {
    source,
    get size() { return enumSize(source); },
    values() { return enumValues(source); },
    keys() { return enumKeys(source); },
    entries() { return enumEntries(source); },
    isValue(value: unknown): value is EnumValue<T> { return isEnumValue(source, value); },
    isKey(key: unknown): key is EnumKey<T> { return isEnumKey(source, key); },
    fromValue(value: EnumValue<T>) { return fromValue(source, value); },
    fromValueOrThrow(value: EnumValue<T>) { return fromValueOrThrow(source, value); },
    fromName(key: string) { return fromName(source, key); },
    fromNameOrThrow(key: string) { return fromNameOrThrow(source, key); },
    [Symbol.iterator]() { return enumEntries(source)[Symbol.iterator](); },
  };
}
