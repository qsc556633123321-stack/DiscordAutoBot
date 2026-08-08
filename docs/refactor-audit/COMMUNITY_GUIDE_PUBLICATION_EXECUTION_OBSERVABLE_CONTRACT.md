# Community Guide Publication Execution Observable Contract

| Observable | State |
| --- | --- |
| fetch / edit / send call and payload | Confirmed by execution harness |
| edit vs send order | Confirmed: overwrite, optional fetch, edit/send, then write |
| returned message / ID | Confirmed when Discord returns message-like object |
| persistence payload and timing | Confirmed after Discord success only |
| write failure | Confirmed swallowed by legacy writer; Discord publication remains |
| edit/send rejection | Confirmed propagated; no Guide persistence |
| Roadmap and interaction response | Confirmed separate caller concern |
| retry / duplicate / rollback | Confirmed no automatic behavior; unpersisted send may duplicate |
