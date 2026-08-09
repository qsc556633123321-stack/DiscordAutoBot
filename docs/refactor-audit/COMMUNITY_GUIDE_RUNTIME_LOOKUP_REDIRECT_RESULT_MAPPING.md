# Lookup Result Mapping

`lookupPort.lookup({ messageId })` returns `MessageAvailable` with `messageId` after one fetch, or `MessageUnavailable` after all legacy-equivalent fetch rejection classes. Raw Message never enters the result.
