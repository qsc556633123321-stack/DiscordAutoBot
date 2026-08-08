# Guide Mutation Adapter Resource Containment

Application callers receive only scalar mutation results. Discord Message,
Channel, Guild, Session, and raw Error values remain infrastructure-local.
Request IDs remain pure compatibility context and are not normalized or cloned.
