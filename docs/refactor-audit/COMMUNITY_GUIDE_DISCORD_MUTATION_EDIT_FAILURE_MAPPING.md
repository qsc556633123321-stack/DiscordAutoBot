# Guide Discord Mutation Edit Failure Mapping

Candidate adapter vocabulary: `MessageLookupFailed`, `MissingResource`,
`EditRejected`, and `Unknown`.

Legacy behavior is different by phase: pre-Plan message lookup rejection is
caught and becomes Send; post-Plan `message.edit` rejection is thrown and
prevents Guide persistence. A future adapter may return scalar Failure, but no
caller is authorized to translate it yet. It must not alter legacy behavior.
