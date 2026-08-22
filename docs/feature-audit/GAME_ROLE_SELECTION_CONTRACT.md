Game Role Selection Contract
Parent gate: only members holding role key game may open or submit the selector. No parent role is auto-added.
Selection is a registry-derived multi-select with min 0 and max registry size. Selected specific roles are added, deselected specific roles are removed, and all non-game roles remain untouched. Zero selection removes all specific game roles while preserving parent game and member roles.
Every target canonical Discord role is exact-resolved before mutation. Missing or unmanageable roles block all mutations. Unknown game IDs are rejected. Add operations precede remove operations; a mutation failure stops the sequence and reports ADD_FAILED or REMOVE_FAILED without inventory deletion or custom rollback.
The select handler acknowledges once with deferReply using MessageFlags.Ephemeral before lookup or mutation. New code does not introduce deprecated ephemeral true usage.
