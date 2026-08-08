# Community Guide Pre-Plan Lookup to Mutation Plan Mapping

| Legacy/result state | `existingMessageAvailable` | attempted | Plan operation |
| --- | ---: | ---: | --- |
| MessageAvailable | true | true | `EditExistingMessage` |
| MessageUnavailable from null | false | true | `SendNewMessage` |
| MessageUnavailable from rejection | false | true | `SendNewMessage` |
| MessageUnavailable from malformed truthy ID | false | true | `SendNewMessage` |
| LookupSkipped from missing/falsy ID | false | false | `SendNewMessage` |
| LookupSkipped from force | false | false | `SendNewMessage` |

This mapping occurs before `buildGuidePublicationMutationPlan()`. It changes no
mutation, persistence, or Roadmap behavior.
