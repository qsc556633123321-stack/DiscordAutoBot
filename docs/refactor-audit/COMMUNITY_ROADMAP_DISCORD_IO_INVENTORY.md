# Roadmap Discord I/O Inventory

| Operation | Branch | Count | Failure behavior | Return use |
| --- | --- | --- | --- | --- |
| category cache/find/create | ensure | once as needed | rejects | channel parent |
| channel cache/find/create | ensure | once as needed | rejects | ensured channel |
| `messages.fetch(id)` | tracked ID | once | swallowed to `null` | edit/send decision |
| `message.edit(payload)` | found message | once | raw rejection | returned message |
| `channel.send(payload)` | no message | once | raw rejection | sent message |

There is no retry, replacement fetch, or mutation fallback.
