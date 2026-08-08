# Guide Discord Mutation Application Port Pattern Audit

## Existing Pattern

`src/application/community/ports/communityPublicationRecordRepository.js`
represents a JavaScript port as a pure assertion function. The Application use
case validates scalar inputs before invoking the port. There is no abstract
class, no dependency injection container, and no Discord.js dependency.

## Applied Pattern

`GuidePublicationMessageMutationPort` exports
`assertGuidePublicationMessageMutationPort(port)`, requiring `edit` and `send`
methods. Edit and Send use separate immutable request factories because their
identity requirements differ. Result/failure contracts are pure frozen scalar
objects. The fake is test-only and records calls.

## Restrictions

Application contracts import neither Discord.js, filesystem code, systems,
infrastructure, nor composition. Factories do not normalize identifiers, clone
payloads, make business decisions, or perform IO.
