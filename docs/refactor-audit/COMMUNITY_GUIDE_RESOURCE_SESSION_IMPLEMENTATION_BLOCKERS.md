# Guide Resource Session Implementation Blockers

This slice approves only the production infrastructure session module. It does
not approve a lookup adapter, mutation adapter, composition feature, runtime
session creation, injection, or redirect. Those later slices must preserve the
legacy ensure-once, fetch-at-most-once, retained-message Edit, and ensured-
channel Send behavior before they may be wired.
