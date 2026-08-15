# Community AI Text Generation Caller Matrix

| Consumer | Input | Fallback | Output use | Error expectation |
| --- | --- | --- | --- | --- |
| `buildGuidePayload` | `kind`, guild-derived context | Guide content fallback | Guide embed description through the read feature | Helper absorbs AI failure |
| Legacy Concierge text adapter | Pass-through `kind`, `context`, `fallback` | Caller-provided | Help Me Start compatibility composition | Helper absorbs AI failure |

There is one direct in-module runtime call site and one compatibility-adapter
default consumer. The helper export is retained for compatibility; no caller
requires a Discord object from the generator.
