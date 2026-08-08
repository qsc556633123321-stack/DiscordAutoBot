# Guide Runtime Pair Edit Compatibility

For a normal existing message, Pair Creation-only would create one Pair but
make zero port calls. Legacy still performs one fetch, one edit, no send, then
persistence in its current order.
