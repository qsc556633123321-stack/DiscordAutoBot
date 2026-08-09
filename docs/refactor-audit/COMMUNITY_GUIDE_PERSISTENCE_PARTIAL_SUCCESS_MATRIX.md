# Community Guide Persistence Partial-Success Matrix

| Completed side effect | Persistence outcome | Runtime outcome | Retry / rollback |
| --- | --- | --- | --- |
| Edit retained Message | writer succeeds | resolves `{ channel, message }` | none / none |
| Edit retained Message | writer fails | resolves exact edited Message; write failure logged | none / none |
| Send new Message | writer succeeds | resolves `{ channel, message }` | none / none |
| Send new Message | writer fails | resolves exact sent Message; write failure logged | none / none |
| Mutation rejects | persistence is not reached | rejects with existing raw mutation behavior | none / none |

There is no second native-state write, so no two-write partial-success window exists. The same invocation does not re-read post-write state; later invocations read the JSON synchronously.
