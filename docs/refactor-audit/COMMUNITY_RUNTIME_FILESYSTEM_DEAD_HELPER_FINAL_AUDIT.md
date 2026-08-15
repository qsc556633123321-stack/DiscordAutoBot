# Community Runtime Filesystem Dead Helper Final Audit

| Symbol | Definitions | Active production calls | Export / injection / dynamic reference | Decision |
| --- | ---: | ---: | --- | --- |
| `ensureFile` | 1 in `communityConcierge.js` | 0 outside `readJson` | None | Dead; removable with `readJson` |
| `readJson` | 1 in `communityConcierge.js` | 0 | None | Dead; removable |

`readJson` is not a runtime consumer: its only local helper call is inside an
otherwise dead definition. Tests and historical documents reference its former
behavior, but no active production flow invokes it.
