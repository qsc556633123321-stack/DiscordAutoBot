# Guide Publication Plan Decision Timing

T1 reads the legacy tracked ID. T2 conditionally fetches it when truthy and not
`force`. T3 converts fetch success/null/rejection into availability. T4 builds
the Guide payload. T5 performs edit or send and then persists the message ID.

The recommended future creation point is immediately after T3, using the
existing pure input mapper. There is no safe earlier point because availability
does not exist; there is no safe later point because the branch has already
occurred. This recommendation is preparation only and does not authorize a
runtime change.
