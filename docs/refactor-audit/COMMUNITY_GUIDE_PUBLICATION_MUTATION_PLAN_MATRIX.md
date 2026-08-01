# Community Guide Publication Mutation Plan Matrix

| Cases | Legacy selected operation | Planned operation | Persistence intent | Excluded downstream behavior |
| --- | --- | --- | --- | --- |
| GP-B01, B08, B12, B13, B15, B16, B18-B20 | existing message and non-force mode | EditExistingMessage | persist published message ID | edit result, write success/failure |
| GP-B02-B07, B09-B11, B17 | unavailable/missing/malformed tracked message | SendNewMessage | persist published message ID | fetch/send/persistence behavior |
| GP-B14 | force despite existing message | SendNewMessage | persist published message ID | duplicate-message consequence |

Every one of GP-B01 through GP-B20 is frozen in `community-guide-publication-mutation-plan-cases.json`. The plan preserves the supplied tracked ID exactly and never emits `Skip`, because this legacy publication path does not have a matching skip branch after channel/payload setup.
