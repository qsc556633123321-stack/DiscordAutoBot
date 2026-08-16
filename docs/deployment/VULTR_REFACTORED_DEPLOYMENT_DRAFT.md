# Refactored Vultr Deployment Draft

This is a procedure draft only. It must be adapted after the server audit.

1. Create a new release directory from approved `main` SHA `70ff72a` or its
   successor; do not overwrite the running checkout.
2. Copy the verified server `.env` securely and preserve the live `src/data/`
   directory using a backup plus the server-approved mount/copy mechanism.
3. Run `npm ci` and the documented local gates in the new release directory.
4. Stop the old Bot process. Wait for it to be offline before starting the new
   process; two long-running clients using one Discord token are prohibited.
5. Start `npm start` through the discovered service manager.
6. Perform the post-deploy smoke plan. If any critical check fails, run the
   rollback draft immediately.

Recommended strategy: **in-place cutover using a separate prepared release
directory**. It keeps rollback simple while avoiding Discord double-login.
Blue/green with the same token is not recommended because both versions can
process the same events.
