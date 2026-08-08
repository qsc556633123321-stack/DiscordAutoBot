# Guide Resource Session Message State Machine

States: `Initial`, `LookupSkipped`, `MessageAvailable`,
`MessageUnavailable`, `LookupFailed-as-Unavailable`, `EditCompleted`, and
`SendCompleted`. `MessageAvailable` retains the exact fetched object; Edit
uses it without another fetch. Unavailable and skipped states retain no fake
message and lead to Send only when the existing legacy plan does so. This model
adds neither fetches nor state-machine enforcement to runtime.
