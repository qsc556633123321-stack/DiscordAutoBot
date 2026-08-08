# Community Guide Publication Execution Characterization Coverage

| Coverage | Fixture / test | Status |
| --- | --- | --- |
| fetch success/null/rejection; edit success/failure | GE-B01-B05; existing-message baseline | Covered |
| send success/failure; returned message ID; force | GE-B07-B14, B19; new-message/call-order baselines | Covered |
| persistence order, failures, preservation | GE-B14-B18, B25-B28; persistence boundary | Covered |
| Roadmap partial failure, repeat/retry duplicate risk | GE-B16-B18, B22-B24; partial failure baseline | Covered |
| sync Discord throws, malformed returned messages, interaction response | GE-B06/B10/B12/B13/B29 | Characterized as Not Applicable/outside direct owner |
| plan mapping, architecture boundary, readiness | dedicated docs/tests | Covered |
