import {
  enumValues,
  enumKeys,
  enumEntries,
  enumSize,
  isEnumValue,
  isEnumKey,
  fromValue,
  fromValueOrThrow,
  fromName,
  fromNameOrThrow,
  createEnum,
  EnumError,
  hasFlag,
  hasAnyFlag,
  hasAllFlags,
  addFlag,
  removeFlag,
  toggleFlag,
  flagsSet,
  combineFlags,
  exhaustive,
} from "../src/index.js";

// ── fixtures ─────────────────────────────────────────────────────────────────

const Status = { Active: "active", Inactive: "inactive", Pending: "pending" } as const;
const Direction = { Up: "up", Down: "down", Left: "left", Right: "right" } as const;
const Priority = { Low: 1, Medium: 2, High: 3 } as const;
const Permission = { Read: 1, Write: 2, Execute: 4 } as const;
const Empty = {} as const;

// ── enumValues ───────────────────────────────────────────────────────────────

describe("enumValues", () => {
  test("returns all string values", () => {
    expect(enumValues(Status)).toEqual(["active", "inactive", "pending"]);
  });

  test("returns all numeric values", () => {
    expect(enumValues(Priority)).toEqual([1, 2, 3]);
  });

  test("returns empty array for empty enum", () => {
    expect(enumValues(Empty)).toEqual([]);
  });

  test("preserves insertion order", () => {
    expect(enumValues(Direction)).toEqual(["up", "down", "left", "right"]);
  });
});

// ── enumKeys ─────────────────────────────────────────────────────────────────

describe("enumKeys", () => {
  test("returns all keys", () => {
    expect(enumKeys(Status)).toEqual(["Active", "Inactive", "Pending"]);
  });

  test("returns numeric enum keys", () => {
    expect(enumKeys(Priority)).toEqual(["Low", "Medium", "High"]);
  });

  test("returns empty array for empty enum", () => {
    expect(enumKeys(Empty)).toEqual([]);
  });
});

// ── enumEntries ──────────────────────────────────────────────────────────────

describe("enumEntries", () => {
  test("returns [key, value] pairs", () => {
    expect(enumEntries(Status)).toEqual([
      ["Active", "active"],
      ["Inactive", "inactive"],
      ["Pending", "pending"],
    ]);
  });

  test("returns numeric enum entries", () => {
    expect(enumEntries(Priority)).toEqual([
      ["Low", 1],
      ["Medium", 2],
      ["High", 3],
    ]);
  });
});

// ── enumSize ─────────────────────────────────────────────────────────────────

describe("enumSize", () => {
  test("counts members", () => {
    expect(enumSize(Status)).toBe(3);
    expect(enumSize(Direction)).toBe(4);
    expect(enumSize(Empty)).toBe(0);
  });
});

// ── isEnumValue ──────────────────────────────────────────────────────────────

describe("isEnumValue", () => {
  test("returns true for valid value", () => {
    expect(isEnumValue(Status, "active")).toBe(true);
    expect(isEnumValue(Status, "pending")).toBe(true);
  });

  test("returns false for invalid value", () => {
    expect(isEnumValue(Status, "Active")).toBe(false);
    expect(isEnumValue(Status, "unknown")).toBe(false);
    expect(isEnumValue(Status, 42)).toBe(false);
    expect(isEnumValue(Status, null)).toBe(false);
  });

  test("works with numeric enum", () => {
    expect(isEnumValue(Priority, 2)).toBe(true);
    expect(isEnumValue(Priority, 99)).toBe(false);
  });

  test("narrows type", () => {
    const val: unknown = "active";
    if (isEnumValue(Status, val)) {
      const _: typeof Status[keyof typeof Status] = val;
      expect(_).toBe("active");
    }
  });
});

// ── isEnumKey ────────────────────────────────────────────────────────────────

describe("isEnumKey", () => {
  test("returns true for valid key", () => {
    expect(isEnumKey(Status, "Active")).toBe(true);
    expect(isEnumKey(Status, "Pending")).toBe(true);
  });

  test("returns false for values, not keys", () => {
    expect(isEnumKey(Status, "active")).toBe(false);
  });

  test("returns false for non-string", () => {
    expect(isEnumKey(Status, 42)).toBe(false);
    expect(isEnumKey(Status, null)).toBe(false);
  });
});

// ── fromValue ────────────────────────────────────────────────────────────────

describe("fromValue", () => {
  test("returns key for known value", () => {
    expect(fromValue(Status, "active")).toBe("Active");
    expect(fromValue(Status, "pending")).toBe("Pending");
  });

  test("returns undefined for unknown value", () => {
    expect(fromValue(Status, "unknown" as never)).toBeUndefined();
  });

  test("works with numeric enum", () => {
    expect(fromValue(Priority, 3)).toBe("High");
  });
});

// ── fromValueOrThrow ─────────────────────────────────────────────────────────

describe("fromValueOrThrow", () => {
  test("returns key for known value", () => {
    expect(fromValueOrThrow(Status, "inactive")).toBe("Inactive");
  });

  test("throws EnumError for unknown value", () => {
    expect(() => fromValueOrThrow(Status, "missing" as never)).toThrow(EnumError);
    expect(() => fromValueOrThrow(Status, "missing" as never)).toThrow(
      'Value "missing" is not a member',
    );
  });
});

// ── fromName ─────────────────────────────────────────────────────────────────

describe("fromName", () => {
  test("returns value for known key", () => {
    expect(fromName(Status, "Active")).toBe("active");
    expect(fromName(Status, "Pending")).toBe("pending");
  });

  test("returns undefined for unknown key", () => {
    expect(fromName(Status, "active")).toBeUndefined();
    expect(fromName(Status, "Unknown")).toBeUndefined();
  });

  test("works with numeric enum", () => {
    expect(fromName(Priority, "High")).toBe(3);
  });
});

// ── fromNameOrThrow ──────────────────────────────────────────────────────────

describe("fromNameOrThrow", () => {
  test("returns value for known key", () => {
    expect(fromNameOrThrow(Status, "Inactive")).toBe("inactive");
  });

  test("throws EnumError for unknown key", () => {
    expect(() => fromNameOrThrow(Status, "missing")).toThrow(EnumError);
    expect(() => fromNameOrThrow(Status, "missing")).toThrow('Key "missing" is not a member');
  });
});

// ── createEnum ───────────────────────────────────────────────────────────────

describe("createEnum", () => {
  const Status$ = createEnum(Status);
  const Priority$ = createEnum(Priority);

  test("exposes source", () => {
    expect(Status$.source).toBe(Status);
  });

  test("size property", () => {
    expect(Status$.size).toBe(3);
  });

  test("values()", () => {
    expect(Status$.values()).toEqual(["active", "inactive", "pending"]);
  });

  test("keys()", () => {
    expect(Status$.keys()).toEqual(["Active", "Inactive", "Pending"]);
  });

  test("entries()", () => {
    expect(Status$.entries()[0]).toEqual(["Active", "active"]);
  });

  test("isValue()", () => {
    expect(Status$.isValue("active")).toBe(true);
    expect(Status$.isValue("Active")).toBe(false);
  });

  test("isKey()", () => {
    expect(Status$.isKey("Active")).toBe(true);
    expect(Status$.isKey("active")).toBe(false);
  });

  test("fromValue()", () => {
    expect(Status$.fromValue("pending")).toBe("Pending");
  });

  test("fromValueOrThrow() — found", () => {
    expect(Priority$.fromValueOrThrow(2)).toBe("Medium");
  });

  test("fromValueOrThrow() — throws", () => {
    expect(() => Status$.fromValueOrThrow("nope" as never)).toThrow(EnumError);
  });

  test("fromName()", () => {
    expect(Status$.fromName("Active")).toBe("active");
    expect(Status$.fromName("nope")).toBeUndefined();
  });

  test("fromNameOrThrow() — found", () => {
    expect(Status$.fromNameOrThrow("Inactive")).toBe("inactive");
  });

  test("fromNameOrThrow() — throws", () => {
    expect(() => Status$.fromNameOrThrow("nope")).toThrow(EnumError);
  });

  test("is iterable (Symbol.iterator)", () => {
    const pairs: unknown[] = [];
    for (const [k, v] of Status$) {
      pairs.push([k, v]);
    }
    expect(pairs).toEqual([
      ["Active", "active"],
      ["Inactive", "inactive"],
      ["Pending", "pending"],
    ]);
  });
});

// ── hasFlag ──────────────────────────────────────────────────────────────────

describe("hasFlag", () => {
  test("single flag present", () => {
    expect(hasFlag(Permission.Read, Permission.Read)).toBe(true);
    expect(hasFlag(7, Permission.Execute)).toBe(true);
  });

  test("flag absent", () => {
    expect(hasFlag(Permission.Read, Permission.Write)).toBe(false);
    expect(hasFlag(0, Permission.Read)).toBe(false);
  });

  test("combined flags", () => {
    const rw = Permission.Read | Permission.Write;
    expect(hasFlag(rw, Permission.Read)).toBe(true);
    expect(hasFlag(rw, Permission.Write)).toBe(true);
    expect(hasFlag(rw, Permission.Execute)).toBe(false);
  });
});

// ── hasAnyFlag ───────────────────────────────────────────────────────────────

describe("hasAnyFlag", () => {
  test("true if any flag set", () => {
    expect(hasAnyFlag(Permission.Read, Permission.Read, Permission.Write)).toBe(true);
    expect(hasAnyFlag(0, Permission.Read, Permission.Write)).toBe(false);
  });
});

// ── hasAllFlags ──────────────────────────────────────────────────────────────

describe("hasAllFlags", () => {
  test("true only if all flags set", () => {
    expect(hasAllFlags(7, Permission.Read, Permission.Write, Permission.Execute)).toBe(true);
    expect(hasAllFlags(3, Permission.Read, Permission.Write, Permission.Execute)).toBe(false);
  });
});

// ── addFlag / removeFlag / toggleFlag ────────────────────────────────────────

describe("addFlag", () => {
  test("adds a flag", () => {
    expect(addFlag(Permission.Read, Permission.Write)).toBe(3);
    expect(addFlag(3, Permission.Write)).toBe(3);
  });
});

describe("removeFlag", () => {
  test("removes a flag", () => {
    expect(removeFlag(3, Permission.Write)).toBe(1);
    expect(removeFlag(Permission.Read, Permission.Write)).toBe(1);
  });
});

describe("toggleFlag", () => {
  test("toggles a flag on", () => {
    expect(toggleFlag(1, Permission.Write)).toBe(3);
  });

  test("toggles a flag off", () => {
    expect(toggleFlag(3, Permission.Write)).toBe(1);
  });

  test("toggles all bits", () => {
    expect(toggleFlag(7, 7)).toBe(0);
  });
});

// ── flagsSet ─────────────────────────────────────────────────────────────────

describe("flagsSet", () => {
  test("returns keys for set flags", () => {
    expect(flagsSet(Permission.Read | Permission.Execute, Permission)).toEqual([
      "Read",
      "Execute",
    ]);
  });

  test("returns empty array if no flags set", () => {
    expect(flagsSet(0, Permission)).toEqual([]);
  });
});

// ── combineFlags ─────────────────────────────────────────────────────────────

describe("combineFlags", () => {
  test("combines multiple flags", () => {
    expect(combineFlags(Permission.Read, Permission.Write, Permission.Execute)).toBe(7);
  });

  test("no args = 0", () => {
    expect(combineFlags()).toBe(0);
  });
});

// ── exhaustive ───────────────────────────────────────────────────────────────

describe("exhaustive", () => {
  test("throws at runtime with unhandled case", () => {
    function handle(s: "a" | "b"): string {
      switch (s) {
        case "a": return "A";
        case "b": return "B";
        default: return exhaustive(s);
      }
    }
    expect(handle("a")).toBe("A");
    expect(() => exhaustive("unexpected" as never)).toThrow("Unhandled case: unexpected");
  });

  test("custom message", () => {
    expect(() => exhaustive("x" as never, "custom error")).toThrow("custom error");
  });
});
