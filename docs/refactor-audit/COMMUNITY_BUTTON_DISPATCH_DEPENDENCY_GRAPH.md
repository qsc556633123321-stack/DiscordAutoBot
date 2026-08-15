# Community Button Dispatch Dependency Graph

```text
interactionCreate event
  -> interactionGateway
  -> buttonInteractionHandler
  -> legacyInteractionDispatcher.execute (unmatched button fallback)
  -> legacyInteractionRuntime.execute
  -> concierge_ prefix branch
  -> handleConciergeButton
     -> role quick-action feature (games/invest/dev only)
     -> quickLinks / presentation (all relevant branches)
     -> interaction.reply
```

The active `concierge_` prefix owner count is one. Role mutation is no longer
owned by the runtime handler; role quick-action Application and Infrastructure
boundaries remain downstream dependencies. Night, bot, and roadmap presentation
remain runtime-owned.
