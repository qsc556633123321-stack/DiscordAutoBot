# Community Legacy Writer Pair Coexistence Matrix

| Pair | Shared target | Same-guild risk | Different-guild risk | Result |
| --- | --- | --- | --- | --- |
| W01 Guide / W02 Roadmap | full root, guild record | high; either publication field can be lost | high under stale full-root write | timing-dependent last writer wins |
| W01 Guide / W03 Native | full root, guild record | high; Guide or native fields can be lost | high under stale root | timing-dependent |
| W02 Roadmap / W03 Native | full root, guild record | high; Roadmap or native fields can be lost | high under stale root | timing-dependent |
| W01 / W04 Bootstrap | same W01 implementation | high when bootstrap refresh overlaps | high under stale root | no separate lock |
| W01 / W05 V3 rebuild | same W01 implementation | high when rebuild refresh overlaps | high under stale root | errors may be summarized after Discord work |
| W04 Bootstrap / W05 rebuild | W01 through two flows | high | high | no coordination evidenced |

All active/indirect pairs share the same full-root writer. No lock, mutex,
transaction, atomic replace, version, or conflict detection is evidenced.
