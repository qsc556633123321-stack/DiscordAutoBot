# Guide vs Roadmap Resource Session Mutation

Guide is the semantic reference, not a module to reuse. The Roadmap candidate
uses the same retained-message and presence-aware failure model, while keeping
Roadmap lookup's existing rejection-swallow behavior. Successful Edit retains
original `M`; successful Send retains exact `S`; mutation failures retain and
rethrow the original value without changing retained message state.
