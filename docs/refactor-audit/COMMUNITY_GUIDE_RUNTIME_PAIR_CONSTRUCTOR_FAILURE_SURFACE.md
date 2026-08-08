# Guide Runtime Pair Constructor Failure Surface

The Composition Feature delegates to Pair Factory, which delegates to Resource
Session validation. Invalid/malformed channel objects throw before lookup or
mutation adapters are used. Lookup and mutation adapter constructors are not
additional runtime failure surfaces after a valid Session is made.
