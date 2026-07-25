# Community Guide Message Identity Contract

Current canonical Guide identity is persisted `guideMessageId`, operationally scoped
by the Guide channel found through exact name. `guild.id` scopes JSON but is not
validated against Discord identity. Saved `guideChannelId` is not used during setup.
No author/content/embed/footer/component/pin/type/age/topic/parent validation occurs
before edit. Missing or failed fetch sends a new message; missing records do not scan
history. Wrong, swapped, or same IDs are not detected. Secondary/recovery/manual
identity and idempotency are **Not Present**.
