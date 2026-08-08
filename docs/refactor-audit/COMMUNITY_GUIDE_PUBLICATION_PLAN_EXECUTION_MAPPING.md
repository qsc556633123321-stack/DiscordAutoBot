# Community Guide Publication Plan-to-Execution Mapping

| Plan operation | Legacy precondition | Legacy action | Persistence intent | Can control runtime now? |
| --- | --- | --- | --- | --- |
| `EditExistingMessage` | non-force and fetched message exists | `message.edit(payload)` | persist existing `message.id` | No; message, payload, writer, and error behavior remain coupled |
| `SendNewMessage` | missing/unusable message or force | `channel.send(payload)` | persist returned `message.id` | No; same coupling plus duplicate risk |
| `Skip` | no legacy Guide branch | none | none | No; emitting it would alter behavior |

The pure plan accurately describes decision intent; it does not carry enough execution data to safely own Discord or persistence behavior.
