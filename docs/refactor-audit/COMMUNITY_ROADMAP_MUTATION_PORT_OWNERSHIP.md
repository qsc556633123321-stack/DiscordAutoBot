# Roadmap Mutation Port Ownership

If approved later, a Roadmap mutation Port belongs in Application as an
application-safe operation contract. Infrastructure would implement it against
the existing per-invocation Resource Session and ensured channel; Composition
would wire it; runtime would retain only request handling and legacy
persistence sequencing until separately migrated.

This is an ownership decision, not an implementation approval. Guide mutation
types must not be reused by assumption because Roadmap has distinct retained
message and persistence contracts.
