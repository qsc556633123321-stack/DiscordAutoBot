# Community Roadmap Message Identity Contract

Roadmap follows the same pattern through `roadmapMessageId` and exact Roadmap
channel name. It is independent from Guide by ID but coupled by command order and
shared guild JSON. There is no Roadmap payload, author, saved-channel-ID, or
Guide-vs-Roadmap validation. Fetch failure sends; write failure can leave an
untracked publication. Automatic and manual identity repair are **Not Present**.
