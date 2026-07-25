# Community Publication Persistence Operation Contract

Supported immutable values are `SET_GUIDE_PUBLICATION`,
`CLEAR_GUIDE_PUBLICATION`, `SET_ROADMAP_PUBLICATION`, and
`CLEAR_ROADMAP_PUBLICATION`. Set changes one publication; clear removes only
its corresponding legacy keys. Operations retain legacy shallow merge behavior
and do not normalize or reown unknown data.
