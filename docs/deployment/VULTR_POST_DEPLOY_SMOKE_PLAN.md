# Vultr Post-Deploy Smoke Plan

Run manually in a controlled guild after the new Bot is the only process using
the token.

1. Confirm one Bot presence and clean startup logs.
2. Verify Guide and Roadmap refresh/edit behavior without duplicate messages.
3. Verify a new-member Welcome path and no duplicate welcome delivery.
4. Exercise Concierge buttons: role action, Night/Bot/Roadmap presentation,
   and unknown-button fallback.
5. Verify community channel setup does not create duplicate channels and keeps
   expected permissions.
6. Verify tracking IDs persist and subsequent Guide/Roadmap runs edit rather
   than duplicate messages.
7. Verify Concierge AI fallback with no key. If a key is configured, separately
   verify one successful AI response without exposing the key.
8. Verify a representative Voice and moderation event if those services are
   enabled.
9. Check error logs, rate-limit warnings, and duplicate event processing for a
   short observation period.
