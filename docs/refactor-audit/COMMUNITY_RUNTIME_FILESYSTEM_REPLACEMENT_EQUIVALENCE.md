# Community Runtime Filesystem Replacement Equivalence

`CommunityOnboardingJsonReader` covers the dead helper behavior: recursive
directory creation, missing-file JSON initialization, UTF-8 I/O, empty-file
parse behavior, plain-object fallback, malformed/read-error logging, mkdir and
write failure propagation, fresh reads, and no cache. Existing JsonReader and
filesystem-ownership equivalence suites characterize these cases.

The candidate default factory changes only where the already-equivalent reader
receives its two path strings; it does not read, cache, write, construct a
StateReader, or know Discord.
