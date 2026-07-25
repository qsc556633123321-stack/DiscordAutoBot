# Community Publication Identity State Matrix

| State | Current result | Risk |
| --- | --- | --- |
| I-B01 record/channel/message exist | fetch then edit | no semantic validation |
| I-B02 record/channel, message missing | send | duplicate possible |
| I-B03 record, channel missing | ensure/create then send | stale record risk |
| I-B04 record missing, one matching-looking message | send | history ignored |
| I-B05 record missing, multiple matching-looking messages | send | duplicates ignored |
| I-B06 record missing, no message | send | normal publish |
| I-B07 wrong message ID | fetch fallback/send | not detected |
| I-B08 wrong channel ID | name lookup continues | saved ID ignored |
| I-B09 Guide record only | Roadmap sends | shared workflow coupling |
| I-B10 Roadmap record only | Guide sends | shared workflow coupling |
| I-B11 swapped IDs | fetched object may edit | not detected |
| I-B12 same IDs | fetched object may edit | not detected |
| I-B13 message another channel | no saved-channel validation | not detected |
| I-B14 deleted after JSON read | fetch/send path | no compensation |
| I-B15 channel deleted after JSON read | create path | no compensation |
| I-B16 send then write fails | resource remains | retry duplicate risk |
| I-B17 edit then second write fails | edit remains | stale record risk |
| I-B18 duplicate Guide messages | no detector | no repair |
| I-B19 duplicate Roadmap messages | no detector | no repair |
| I-B20 duplicate channels | first name match | ambiguity |
| I-B21 concurrent setup | unprotected read/write | lost update risk |
| I-B22 Bootstrap/manual overlap | unprotected read/write | duplicate risk |
| I-B23 rebuild/setup overlap | unprotected read/write | duplicate risk |
| I-B24 stale record after message delete | fetch fallback/send | duplicate risk |
| I-B25 stale record after channel delete | name ensure/create | stale ID ignored |
| I-B26 manually edited record | normal lookup | no validation |
| I-B27 unknown message-like object | resolved object may edit | no type validation |
| I-B28 fetch permission error | caught as null | sends |
| I-B29 cache/fetch mismatch | name cache lookup | ambiguity |
| I-B30 transient API error | caught fetch fallback | sends |

Position, marker, pin, footer, title, custom-ID and history matching are **Not
Applicable** because current lookup does not use them.
