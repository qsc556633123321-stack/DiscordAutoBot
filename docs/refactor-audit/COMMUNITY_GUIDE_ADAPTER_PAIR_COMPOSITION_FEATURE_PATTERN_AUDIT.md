# Guide Adapter Pair Composition Feature Pattern Audit

Existing composition modules are factory functions with concrete infrastructure injection. They must not retain per-request Discord resources; a factory-of-factory is allowed only when stateless.
