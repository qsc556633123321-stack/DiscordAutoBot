# Guide Discord Execution Data Inventory

| Data | Type | Edit | Send | Owner |
| --- | --- | --- | --- | --- |
| operation, payload, trackedMessageId | pure | yes | yes | application request |
| existing message | Discord object | yes | no | legacy runtime |
| target channel | Discord object | no | yes | legacy runtime |
| generated message ID | scalar | after | after | execution result |
| onboarding / Roadmap / interaction | persistence/runtime | after | after | legacy runtime |
