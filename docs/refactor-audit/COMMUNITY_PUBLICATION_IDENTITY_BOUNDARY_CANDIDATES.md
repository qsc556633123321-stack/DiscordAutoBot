# Community Publication Identity Boundary Candidates

| Candidate | Decision | Reason |
| --- | --- | --- |
| A. persisted message ID only | Needs more baseline | cannot detect wrong/lost records |
| B. guild + channel + message composite | Blocked | saved channel ID is currently unused |
| C. deterministic key in persistence | Rejected | new data contract |
| D. payload marker/footer | Rejected | rendered payload compatibility change |
| E. history reconciliation | Blocked | false-match/API cost risk |
| F. shared identity resolver | Blocked | Guide/Roadmap/channel coupling |
