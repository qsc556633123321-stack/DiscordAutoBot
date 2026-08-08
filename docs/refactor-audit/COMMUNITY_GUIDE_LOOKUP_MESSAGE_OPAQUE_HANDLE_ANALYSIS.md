# Opaque Message Handle Analysis

An opaque handle cannot satisfy the legacy `message.edit(payload)` receiver without exposing raw Message or adding an edit method. The latter is a mutation redirect, so an opaque handle is not selected.
