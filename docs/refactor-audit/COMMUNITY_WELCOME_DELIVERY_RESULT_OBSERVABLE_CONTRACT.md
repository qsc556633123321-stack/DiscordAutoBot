# Community Welcome Delivery Result Observable Contract

| Observable | State |
| --- | --- |
| normal function return / resolved value | Confirmed: `undefined` |
| missing destination | Confirmed: early resolve `undefined`, no DM |
| DM rejection | Confirmed: inner catch swallows and resolves `undefined` |
| cache/fetch lookup rejection | Confirmed: fetch rejection becomes no destination; cache failures reject |
| synchronous send throw | Confirmed: rejects before inner `.catch` attaches |
| caller await/catch/continuation | Confirmed: awaits, catches, logs, continues |
| persistence / JSON write / channel creation / channel message / logs in function | Confirmed: none |
| retry / dedupe | Confirmed: none; repeated calls can duplicate a DM |
| Delivered, Skipped, Failed result output | Not Applicable: no runtime Result output |
