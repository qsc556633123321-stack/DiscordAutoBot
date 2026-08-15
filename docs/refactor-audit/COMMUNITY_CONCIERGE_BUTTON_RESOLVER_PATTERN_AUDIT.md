# Community Concierge Button Resolver Pattern Audit

There is no existing general ActionResolver, CommandResolver, CustomIdResolver,
SemanticResolver, or IntentResolver implementation in the Application layer.
The closest local convention is a plain exported resolver function such as
`resolveGameIdentity`, not a factory or registry framework.

The recommended future resolver is therefore a small Application module with a
frozen exact-ID map and one exported pure function. A factory would add state
and API surface without any current dependency or lifetime requirement.
