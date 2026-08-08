# Message Identity Handoff Candidates

- **A: Session `getRetainedMessage()`** — preferred preparation candidate; exact identity, no extra I/O, per-invocation.
- **B: Session `takeRetainedMessage()`** — rejected for now; transfer semantics can invalidate later mutation compatibility.
- **C: Pair resource capability** — needs more preparation; broadens Pair public surface.
- **D: infrastructure-only envelope** — rejected; risks leaking an infrastructure resource through Application.
- **E: mutation redirect** — rejected; changes mutation ownership.
- **F: second runtime fetch** — rejected; changes fetch count/timing.
- **G: opaque handle** — rejected; either hides edit capability or becomes a mutation redirect.
- **H: keep legacy lookup** — active safe baseline.
