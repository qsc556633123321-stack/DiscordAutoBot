# Community Roadmap Runtime Persistence Redirect: Lifetime Decision

## Decision

Use per-invocation, post-mutation construction inside `setupRoadmapPanel`.

After a Roadmap Edit succeeds or a Send has produced and validated its retained
Message, runtime creates the existing generic publication feature with the same
legacy file-path dependencies, creates the Roadmap reuse feature, creates the
semantic request, and calls `persist` synchronously.

## Rationale

- The legacy `saveOnboarding` helper also constructs its generic feature at the
  persistence call site after mutation.
- This introduces no new module-level writer lifetime or shared writer instance.
- It preserves per-setup invocation behavior and avoids a new composition root.

## Exclusions

No generic use case, repository, filesystem adapter, writer, Port, schema, or
Guide persistence code was changed.
