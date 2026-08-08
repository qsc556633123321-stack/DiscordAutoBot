# Guide Discord Mutation Adapter Candidate Contract

Candidate name: `GuidePublicationMessageMutationDiscordAdapter`.

```text
createGuidePublicationMessageMutationDiscordAdapter({ resourceGateway })
  -> { edit(request), send(request) }
```

It would implement `GuidePublicationMessageMutationPort`, use only scalar
request fields at its boundary, return scalar success/failure results, and keep
raw Discord resources/errors internal. This is a documentation/test candidate;
no production JavaScript adapter exists.
