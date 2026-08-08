# Guide Lookup Adapter Resource Containment

The session's Discord Message remains internal. A future adapter returns only
`status` and `messageId`; it must not return a message/error resource, place
one in an Application request, or retain one in an Application closure.
