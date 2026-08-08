# Retained Message Accessor Visibility

The accessor exists solely on the infrastructure Session, while the Pair intentionally exposes only `lookupPort` and `mutationPort`. Future options are a narrow Pair capability, an infrastructure-only adapter handoff, or a runtime-local Session seam. None is implemented here; Runtime must not obtain the accessor yet.
