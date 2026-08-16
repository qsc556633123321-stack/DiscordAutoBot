# Refactored Vultr Rollback Draft

Target recovery objective: restore the prior Bot process within approximately
10 minutes after a failed smoke check, subject to the server service manager.

1. Stop the new Bot process immediately.
2. Switch the service manager back to the recorded prior release directory and
   its captured environment configuration.
3. Restore the backed-up live data only if the failed release changed it; do
   not overwrite newer valid state blindly.
4. Start the prior release.
5. Verify one Bot connection is online, then run the minimal Discord smoke
   checks for commands/events affected by the failed deployment.
6. Preserve logs and release artifacts for diagnosis before attempting another
   deployment.
