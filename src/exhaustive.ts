/**
 * Compile-time exhaustiveness check for switch/if statements.
 * Call in the `default` branch — TypeScript will error if any case is unhandled.
 *
 * @example
 * type Status = 'active' | 'inactive';
 * switch (status) {
 *   case 'active': return 'Active';
 *   case 'inactive': return 'Inactive';
 *   default: return exhaustive(status); // TS error if new value added
 * }
 */
export function exhaustive(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${String(value)}`);
}
