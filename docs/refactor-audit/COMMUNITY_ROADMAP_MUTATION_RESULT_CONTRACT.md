# Roadmap Mutation Result Contract

Any future application result should expose only an operation discriminator and
message ID. The Discord Message remains an infrastructure resource and would
require a narrow retained-message handoff for runtime persistence and return
compatibility. The current runtime exposes no mutation result contract.
