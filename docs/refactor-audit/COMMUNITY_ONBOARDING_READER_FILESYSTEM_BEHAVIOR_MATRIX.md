# Community Onboarding Reader Filesystem Behavior Matrix

| Input condition | Legacy side effect | Result | Logging |
| --- | --- | --- | --- |
| Missing file | Ensure directory/file with `{}` | `{}` | None on success |
| Valid object JSON | Read only | Fresh parsed object | None |
| Empty file | No rewrite | `{}` | None |
| Malformed JSON | No rewrite | `{}` | `console.error` once |
| Read error | No write after failed read | `{}` | `console.error` once |
| Ensure/create error | Propagates before parse | Throws | No reader catch |
| `null`, array, string, number, boolean JSON | No rewrite | `{}` | None |

The future reader must delegate these compatibility semantics to its injected
reader dependency; it must not independently catch `ENOENT`, normalize roots,
or create a different fallback path.
