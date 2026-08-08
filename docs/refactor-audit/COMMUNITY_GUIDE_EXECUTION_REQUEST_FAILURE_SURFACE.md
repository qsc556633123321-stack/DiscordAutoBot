# Guide Execution Request Failure Surface

Current runtime has no Request construction step. Introducing one would add a
new failure surface for operation validation, payload validation/normalization,
clone/freeze behavior, and unknown-operation handling. The current Request
factory only rejects a missing operation and otherwise preserves payload and
tracked-message input by reference/value.

Because the Plan already supplies a supported operation, this additional step
would not improve current edit/send failure handling. It could nevertheless
change throw timing if the contract later adds validation. This is another
reason not to integrate it into runtime now.
