# Community Welcome Delivery Request Contract

`CommunityWelcomeDeliveryRequest` is a frozen, two-field application value:

| Field | Source | Observed type | Handling |
| --- | --- | --- | --- |
| `guildId` | resolved runtime guild ID | any JavaScript value | preserved exactly; no validation, trim, stringify, or normalization. |
| `guideChannelId` | resolved Guide channel ID | any JavaScript value | preserved exactly; no validation, trim, stringify, or normalization. |

Missing, null, empty, numeric, boolean, object, and array values are represented unchanged. Unknown input fields are ignored. The factory does not import Discord/JSON, mutate input, throw for malformed values, or cause effects. Excluded fields include member identity, guild name, locale, retry, timestamps, metadata, and persistence data. This contract does not authorize runtime integration.
