# Community Publication Persistence Error Contract

Frozen error codes: invalid guild ID, record not found, malformed record, read
failure, write failure, invalid operation, and unsupported operation. The
preparation does not translate active runtime errors. The in-memory store can
inject read/write failures, documenting propagation without retry or rollback.
