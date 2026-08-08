# Community Publication Filesystem Adapter Readiness

**Approved for the characterized legacy contract only.**
`communityPublicationStateFilesystemAdapter` owns the synchronous whole-root
read, shallow guild-record merge, and full-root write that were previously in
the legacy Concierge runtime. It intentionally retains malformed-root fallback,
non-atomic writes, no lock, no retry, no rollback, and swallowed write errors.
This is a responsibility move, not a persistence-contract redesign.
