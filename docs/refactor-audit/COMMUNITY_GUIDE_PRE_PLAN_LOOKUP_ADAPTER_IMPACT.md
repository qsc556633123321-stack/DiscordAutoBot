# Community Guide Pre-Plan Lookup Adapter Impact

The future Discord mutation adapter may receive an Edit request only after the
pre-Plan lookup result selected Edit. It must execute the selected operation,
not repeat lookup as a defensive fallback. Repeating lookup in an Edit adapter
would create a second lookup and could discover absence after Plan selected
Edit, where legacy would instead have selected Send.

The adapter boundary is therefore not ready for implementation until a separate
lookup boundary is safely represented and integrated before Plan creation.
