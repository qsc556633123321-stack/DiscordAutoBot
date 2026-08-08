# Guide Channel Failure Timing

Malformed partial objects can make Pair construction fail before payload or
tracked-ID work, but those objects are not successful outputs of ensure. For a
successful production ensure result, no new constructor failure is evidenced.
Ensure rejection remains its existing earlier failure behavior.
