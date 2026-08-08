# Guide Mutation Adapter Responsibility

The future production adapter implements `GuidePublicationMessageMutationPort`.
It accepts pure Edit/Send requests, delegates only to its injected session, and
returns a pure result. It must not look up messages, resolve guilds or channels,
ensure channels, create sessions, choose a Plan branch, write persistence,
handle Roadmap, or handle an interaction.
