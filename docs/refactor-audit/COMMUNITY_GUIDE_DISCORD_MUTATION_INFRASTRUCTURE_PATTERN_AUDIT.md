# Guide Discord Mutation Infrastructure Pattern Audit

Existing infrastructure modules use factory-style construction and injected
dependencies, such as filesystem adapters and Discord gateways. They expose
plain JavaScript methods, return mapped scalar/domain results, and are tested
with call-recording fakes. No DI framework or abstract base class is used.

For a future Guide adapter, the matching shape is a factory named
`createGuidePublicationMessageMutationDiscordAdapter({ resourceGateway })`.
The gateway is the minimal injected seam for Guild/Channel/Message lookup and
mutation. It prevents raw Discord.js objects crossing into Application.

This is a naming/dependency decision only. No infrastructure source was added.
