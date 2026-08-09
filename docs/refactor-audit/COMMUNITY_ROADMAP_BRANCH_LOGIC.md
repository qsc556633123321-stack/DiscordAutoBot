# Roadmap Branch Logic

There is no standalone `force` or `refresh` option. A truthy
`roadmapMessageId` triggers exactly one fetch. A fetched message is edited;
missing, unavailable, or fetch-rejected messages send. A missing ID sends.
Truthy malformed IDs preserve the same fetch-then-send legacy behavior.
