# Community Guide Message Lookup Infrastructure Pattern Audit

Existing infrastructure adapters use factory functions and explicit injected
dependencies; composition owns wiring. They do not introduce a DI framework.
Discord resource access is normally hidden behind an adapter/gateway and tests
use fakes rather than `discord.js`. A future lookup adapter should follow that
factory/injection pattern, but no production implementation is created here.
