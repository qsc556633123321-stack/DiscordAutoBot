# Guide Resource Session Channel Contract

`createGuidePublicationResourceSession` constructor-validates an object with
`messages.fetch` and `send` functions. `id` is not validated by Session, but
is retained by legacy persistence. Lookup/edit/send are method-time actions;
constructor validation itself performs no I/O.
