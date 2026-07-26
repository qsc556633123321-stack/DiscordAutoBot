# Community Publication Channel Identity Characterization

Guide channel identity is observable in two paths: setup persists the created or
located channel ID, while welcome uses it to resolve a channel before sending a
DM. Roadmap channel identity is observable when Roadmap setup persists its
channel ID; no isolated reader was found.

Channel identity cannot be treated as a pure message-identity analogue because
the actual consumers are coupled to Discord channel lookup or channel mutation.
No observable runtime behavior was changed by this preparation.
