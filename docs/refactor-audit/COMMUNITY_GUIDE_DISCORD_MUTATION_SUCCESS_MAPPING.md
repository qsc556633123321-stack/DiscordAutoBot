# Guide Discord Mutation Success Mapping

Edit receives the existing Discord Message and maps its scalar `id` to
`{ kind: 'EditSuccess', messageId }`. Send maps the returned Discord Message
`id` to `{ kind: 'SendSuccess', messageId }`.

Raw Discord Message and raw Error values stay infrastructure-local. Persistence
uses the scalar result only in a future outer workflow; persistence itself is
outside the adapter.
