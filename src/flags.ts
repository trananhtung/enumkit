/**
 * Bit-flag utilities for numeric enum objects.
 * Like C# `[Flags]` enum or Java `EnumSet`.
 */

/** True if `value` has the given `flag` bit set. */
export function hasFlag(value: number, flag: number): boolean {
  return (value & flag) === flag;
}

/** True if `value` has ANY of the given flags set. */
export function hasAnyFlag(value: number, ...flags: number[]): boolean {
  return flags.some((f) => (value & f) !== 0);
}

/** True if `value` has ALL of the given flags set. */
export function hasAllFlags(value: number, ...flags: number[]): boolean {
  return flags.every((f) => (value & f) === f);
}

/** Returns a new value with `flag` added. */
export function addFlag(value: number, flag: number): number {
  return value | flag;
}

/** Returns a new value with `flag` removed. */
export function removeFlag(value: number, flag: number): number {
  return value & ~flag;
}

/** Returns a new value with `flag` toggled. */
export function toggleFlag(value: number, flag: number): number {
  return value ^ flag;
}

/**
 * Returns keys from `flagsObj` whose bits are all set in `value`.
 * Like C# `Enum.GetFlags()` (conceptual).
 *
 * @example
 * const Permission = { Read: 1, Write: 2, Execute: 4 } as const;
 * flagsSet(3, Permission) // → ['Read', 'Write']
 */
export function flagsSet<T extends Record<string, number>>(
  value: number,
  flagsObj: T,
): (keyof T & string)[] {
  return Object.entries(flagsObj)
    .filter(([, f]) => f !== 0 && (value & f) === f)
    .map(([k]) => k as keyof T & string);
}

/** Combine multiple flags into one value. */
export function combineFlags(...flags: number[]): number {
  return flags.reduce((acc, f) => acc | f, 0);
}
