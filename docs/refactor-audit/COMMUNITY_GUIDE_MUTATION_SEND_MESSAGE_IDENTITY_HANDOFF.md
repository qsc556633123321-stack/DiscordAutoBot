# Send Message Identity Handoff

Session sends on the correct Channel but does not retain the generated Message;
the adapter exposes only its ID. A send identity handoff must be prepared before
runtime send redirect can preserve `{ channel, message }`.
