# Guide Lookup Adapter Production Session Audit

The production session is
`src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js`.
Its factory is `createGuidePublicationResourceSession({ ensuredChannel })`.
It retains that exact channel, retains the exact fetched message internally on
success, returns `{ available }`, propagates lookup rejection, edits the
retained message, and sends on the retained channel. It neither resolves a
channel nor fetches a second message. Runtime and Composition do not use it.
