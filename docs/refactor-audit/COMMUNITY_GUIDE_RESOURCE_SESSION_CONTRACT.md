# Guide Resource Session Contract

Conceptual infrastructure-only shape:

```text
GuidePublicationResourceSession(ensuredChannel)
  lookupTrackedMessage(messageId) -> retained Message | null | rejection
  editTrackedMessage(payload) -> delegates to retained Message.edit
  sendMessage(payload) -> delegates to ensuredChannel.send
```

It initially has no retained message. Each method must document its input,
resource, Discord call, state change, output, and failure behavior. This is not
production JavaScript and is not an Application, Domain, Repository, gateway,
or service locator.
