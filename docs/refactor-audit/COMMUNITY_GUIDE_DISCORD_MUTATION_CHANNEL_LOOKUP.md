# Guide Discord Mutation Channel Lookup

The legacy runtime ensures the Guide text channel before payload construction,
then uses that same object for both message fetch and send. Thus the legacy
send destination is already known, with no cache/fetch fallback performed in
the publication branch.

A future adapter would resolve `channelId` once per Edit or Send operation.
It must not create fallback channels, create channels, scan history, normalize
IDs, or repair wrong channel types. Missing/rejected/wrong-type behavior is
not yet mapped to runtime behavior and remains preparation evidence only.
