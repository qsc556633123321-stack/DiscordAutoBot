# Community Legacy Persistence Failure Window Contract

| Window | Current observed/characterized result |
| --- | --- |
| F-W01/F-W02 read or parse failure | `readJson` logs and returns fallback; later write may start from fallback |
| F-W03 channel create then write failure | Discord channel can remain without tracked record |
| F-W04 message send then write failure | untracked published message; retry may duplicate |
| F-W05 message edit then write failure | Discord content changed without record update |
| F-W06 permission update then write failure | permissions can persist independently |
| F-W07/F-W08 competing writers | first write can be replaced by stale second root |
| F-W09 serialized/process interruption | not characterized; no atomic protocol evidenced |
| F-W10 partial filesystem write | not characterized; no temp-file protocol evidenced |
| F-W11 manual edit during write | no conflict detection |
| F-W12 retry after untracked side effect | duplicate risk; no automatic recovery |
| F-W13/F-W14 rebuild/bootstrap overlap | indirect W01 write can overwrite a current snapshot |
| F-W15 other-guild update | stale root can lose it |
