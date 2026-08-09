# Community Infrastructure to Application Port Dependency Audit

`AGENTS.md` permits Infrastructure to implement Application ports. The
dependency analyzer previously marked every Infrastructure-to-Application edge
as reverse, including the Roadmap lookup adapter importing its Application port
result factories.

The analyzer now permits only a generic, path-based contract bridge:
Infrastructure may depend on an Application module under `src/application/**`
whose filename ends in `Port.js`. This is not Roadmap-specific and does not
permit Infrastructure to import an Application use case, service implementation,
or Presentation module. Domain-to-Infrastructure remains prohibited.
