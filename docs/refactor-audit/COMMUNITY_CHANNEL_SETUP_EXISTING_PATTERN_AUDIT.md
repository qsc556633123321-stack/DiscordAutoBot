# Community Channel Setup Existing Pattern Audit

Existing reusable read patterns include `CommunityWelcomeChannelResolver` and
tracking read ports. Existing mutation adapters are publication-message scoped.
Neither represents the full Concierge setup contract: category ensure, exact
name duplicate reuse, create, conditional parent move, best-effort overwrite,
and return-object identity.

The generic `discordChannelRepository` and legacy V3/bootstrap systems use
different layout/configuration and retry semantics. Reusing them now would
change observable behavior. No existing production Channel Setup Port is an
approved source of truth.
