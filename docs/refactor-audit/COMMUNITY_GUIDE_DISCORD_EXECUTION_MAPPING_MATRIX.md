# Guide Discord Execution Mapping Matrix

| Case | Mapping | Boundary |
| --- | --- | --- |
| EX-M01/M02 | Plan Edit/Send -> execution request | pure application |
| EX-M03/M04 | legacy edit/send -> result success/failure | future runtime mapping |
| EX-M05 | returned `message.id` -> result `messageId` | scalar only |
| EX-M06/M07 | rejected edit/send -> failure vocabulary | coarse contract only |
| EX-M08/M09 | malformed/no ID remains legacy behavior | runtime blocked |
| EX-M10-M12 | persistence/Roadmap/interaction handoff | outside contract |
