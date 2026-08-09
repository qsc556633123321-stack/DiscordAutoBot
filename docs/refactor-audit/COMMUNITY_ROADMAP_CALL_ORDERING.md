# Roadmap Call Ordering

Observable order: ensure channel, build payload, read state, fetch when a
truthy ID exists, edit or send, persist IDs, return. Failure stops later steps,
except fetch rejection, which maps to send. Guide has no implicit Roadmap call.
