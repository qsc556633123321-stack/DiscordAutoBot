# Roadmap Mutation Persistence ID Source

After Edit, persistence receives the retained pre-edit Message ID. After Send,
persistence receives the exact sent Message ID. The call is ordered after the
Discord mutation and before successful method return. Existing writer failure
swallowing means this order does not guarantee durable state.
