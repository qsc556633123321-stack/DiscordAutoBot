# Community Welcome Delivery Compatibility Matrix

WD-C01 through WD-C24 are frozen in `tests/fixtures/community/community-welcome-delivery-cases.json`.

| Range | Inputs / invariant |
| --- | --- |
| WD-C01, C16-C24 | valid values, repeatability, unknown input, Unicode/template/URL/newline/emoji/payload invariants. |
| WD-C02-C08 | empty, null, omitted, numeric, object, array, and boolean `guildId`; JavaScript values are preserved. |
| WD-C09-C15 | empty, null, omitted, numeric, object, array, and boolean guide identity; values are preserved. |
| WD-C17-C18 | repeated builder and immutable input/result behavior. |

No validation or normalization is inferred from legacy behavior. The builder characterizes JavaScript interpolation only; malformed IDs are not proof that the runtime accepts malformed unresolved destinations.
