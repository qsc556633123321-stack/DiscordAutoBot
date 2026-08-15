# Community Concierge Button Exact-ID Inventory

| Exact customId | Current branch | Downstream work | Return |
| --- | --- | --- | --- |
| `concierge_games` | games | role quick action, game quick links, embed/reply | `true` |
| `concierge_invest` | invest | role quick action, investment quick links, embed/reply | `true` |
| `concierge_dev` | dev | role quick action, development quick links, embed/reply | `true` |
| `concierge_night` | night | night quick links, embed/reply | `true` |
| `concierge_bot` | bot | static embed/reply | `true` |
| `concierge_roadmap` | roadmap | roadmap embed/reply | `true` |
| any other value | unknown | none | `false` |

The surrounding legacy dispatcher owns only the broader `concierge_` prefix.
The exact-ID branches and all presentation remain in `handleConciergeButton`.
