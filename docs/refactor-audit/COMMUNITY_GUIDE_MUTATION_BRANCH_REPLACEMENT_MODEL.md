# Guide Mutation Branch Replacement Model

Legacy behavior is `if (message) edit; else send`. A future bounded change may
build the existing Plan after fetch and branch on `EditExistingMessage` versus
`SendNewMessage`. Characterization fixtures predict identical fetch timing,
fetch arguments, edit/send selection, persistence intent, error propagation,
and repeated-invocation behavior. The Plan computation itself is new pure work;
all observable legacy behavior must remain identical. No runtime replacement is
made in this slice.
