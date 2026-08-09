# Community Roadmap Lookup Guide Port Reuse Decision

Rejected. Guide and Roadmap both look up tracked messages, but they do not yet
share an approved semantic boundary. Roadmap must preserve its own truthiness,
rejection-swallow, session-local retained-message, and continuation contracts.
Reusing the Guide port would create implicit Guide coupling and make a later
generic publication abstraction appear approved before it is characterized.
