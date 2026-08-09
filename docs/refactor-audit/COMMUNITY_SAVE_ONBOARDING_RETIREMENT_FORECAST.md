# saveOnboarding Retirement Forecast

**Forecast: A — zero consumers after Guide migration, then cleanup candidate.**

Current production has one runtime caller: `setupCommunityGuide`. Roadmap no longer calls the helper. Once Guide runtime persistence is safely redirected and covered with migration regression tests, `saveOnboarding` should be re-audited before removal. It is not removed or modified in this preparation slice.
