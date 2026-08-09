# Legacy to Future Mapping

Success maps to `MessageAvailable` plus `getRetainedMessage() === M`; rejection maps to unavailable plus `null`. Force and missing IDs skip lookup and choose send.
