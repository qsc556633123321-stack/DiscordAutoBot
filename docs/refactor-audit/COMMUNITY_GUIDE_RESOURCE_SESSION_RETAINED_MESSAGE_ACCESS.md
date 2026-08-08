# Resource Session Retained Message Access

Future candidate A is a Session-local `getRetainedMessage()` accessor returning the retained Message or `null`. It must be used only after an Available lookup, must not fetch, resolve, cache globally, retry, or normalize IDs, and remains per invocation. This slice does not implement it.
