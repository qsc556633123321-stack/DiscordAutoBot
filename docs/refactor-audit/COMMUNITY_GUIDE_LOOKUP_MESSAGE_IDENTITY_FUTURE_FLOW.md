# Lookup Message Identity Future Flow

Future, not implemented flow:

`Pair -> lookupPort.lookup -> pure Result -> Infrastructure/Runtime exact Message handoff or null -> existing Plan -> legacy edit/send -> existing persistence`.

Roadmap ordering, persistence, and mutation ownership remain outside the handoff slice.
