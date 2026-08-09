# Community Roadmap Lookup Responsibility Matrix

| Owner | Responsibility | Not responsible for |
| --- | --- | --- |
| Resource Session | Owns ensured channel, fetches, swallows lookup rejection, retains exact message | Runtime branching or persistence |
| Future Port | Application-facing semantic request/result contract | Discord objects or fetch |
| Future Adapter | Maps port request to session and maps semantic result | Channel resolution or retry |
| Runtime | Chooses edit versus send and receives retained identity | Reimplementing fetch semantics |
| Persistence | Stores roadmap channel/message identifiers after publication | Lookup, edit, or send |

The current runtime and persistence ownership remain unchanged.
