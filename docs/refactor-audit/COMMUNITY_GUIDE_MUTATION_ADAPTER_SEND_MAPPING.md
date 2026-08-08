# Guide Mutation Adapter Send Mapping

Future `adapter.send(request)` delegates exactly once to
`session.sendMessage(request.payload)`. It uses the session's ensured Channel
and performs no guild/channel resolution, `client.channels.fetch`, or ensure
operation.
