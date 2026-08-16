# Game Registry Source of Truth Audit

## Current Sources

src/domain/games/gameRegistry.js contains canonical id, displayName, aliases,
emoji, and tier for ten known games. It is the only current source that can
resolve aliases such as VALORANT / 特戰 / 特戰英豪.

src/domain/community/communityArchitectureV3.js contains GAMES, a legacy layout
list that repeats id, displayName, and placement tier. Its current consumers
include legacy V3 builder and validator flows, so removing or rewriting it in
this feature slice would risk legacy regression.

## Decision

gameRegistry.js is the canonical source for future game identity, role key, and
role display-name derivation. communityArchitectureV3.GAMES remains a legacy
layout compatibility list until a separately characterized migration can derive
it from the registry without changing rebuild behavior.

This foundation adds no third game list. The role policy imports only the
registry and accepts already-canonical dynamic IDs for future games.
