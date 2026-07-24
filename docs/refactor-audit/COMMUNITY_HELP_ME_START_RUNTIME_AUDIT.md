# Community Help Me Start Runtime and Consumer Audit

| Item | Evidence | Decision |
| --- | --- | --- |
| Command registry | `commandRegistry` loads aliases through `aliasRegistry`; aliases dynamically require legacy command files | Registry and deploy metadata remain unchanged. |
| Legacy command | `src/legacy/commands/help-me-start.js` formerly owned metadata/options and called interactive guide helper | Retained as thin wrapper to active presentation command. |
| Active command | `src/presentation/commands/helpMeStartCommand.js` | Owns identical metadata, option mapping, deferred ephemeral reply, timestamp, and edit reply. |
| Legacy helper | `interactiveGuideSystem.buildHelpMeStartEmbed` had the only discovered runtime consumer: legacy command | Retained as compatibility consumer; delegates composition and presentation renderer. |
| `buildBaseRecommendation` | private, never exported, only called by old helper | Removed from active helper; rule now exists once in Domain. |
| `generateConciergeText` | used by Guide setup (`main_guide`) and Help-me-start | Must remain in Concierge. The new legacy text adapter delegates to it; Concierge is not refactored. |
| Deployment | deploy uses command registry / alias loading | Wrapper exports exact active `data` and `execute` references. |
| Internal consumers | no other direct `buildHelpMeStartEmbed` consumer found in `src`, tests, scripts, or apps before migration | Helper cannot be deleted in this slice; it remains compatibility surface. |

## Final active path

```text
aliasRegistry -> legacy help-me-start thin wrapper
  -> presentation/helpMeStartCommand
  -> composition/helpMeStartFeature
  -> application/getHelpMeStartRecommendation
  -> domain/helpMeStartRecommendation
  -> Discord guild-channel reader + legacy Concierge text adapter
  -> Presentation EmbedBuilder / deferred ephemeral editReply
```

No command registry, alias registry, deploy script, Concierge button, Guide setup, or Roadmap path changed.
