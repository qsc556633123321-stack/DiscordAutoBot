# Community Welcome Tracking Read Migration Forecast

Welcome currently reads `guideChannelId` from the shared onboarding record. It is not part of the first message-ID query because that would force a wider raw record abstraction.

After the message query is established and validated, a separate preparation may evaluate a semantic `readTrackedChannel({ guildId, publication: 'guide' })` query or a carefully expanded tracking-state result. The choice must preserve the existing cache/fetch fallback in `sendConciergeWelcome` and must not add Discord knowledge to the read port.

For now, welcome remains legacy-owned and is recorded as a shared-helper consumer only.
