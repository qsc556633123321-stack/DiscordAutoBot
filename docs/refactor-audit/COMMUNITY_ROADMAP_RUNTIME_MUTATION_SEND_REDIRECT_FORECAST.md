# Community Roadmap Runtime Mutation Send Redirect Forecast

Future redirect would call `mutationPort.send({ payload })`, then recover exact
sent `S` via `getRetainedMessage()`. Its ID remains the persistence source and
the returned message must remain raw `S`; no fallback, retry, or failure getter
is approved.
