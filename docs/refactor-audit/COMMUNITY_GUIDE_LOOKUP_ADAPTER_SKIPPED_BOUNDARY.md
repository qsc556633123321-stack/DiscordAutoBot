# Guide Lookup Adapter Skipped Boundary

The adapter never produces `LookupSkipped`. Force and missing/falsy tracked ID
belong to the caller, which must not call the adapter and must create the
existing skipped result itself. Compatible force and missing-ID adapter call
counts are both zero.
