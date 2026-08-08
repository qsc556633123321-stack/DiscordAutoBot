# Community Guide Message Lookup No Double Lookup Rule

There must be one selection lookup per attempted Guide publication. A future
lookup adapter must not combine an extra channel/message lookup with a later
mutation adapter lookup. Mutation execution receives the Plan-selected action;
it cannot repeat selection lookup without changing timing/count/failure behavior.
