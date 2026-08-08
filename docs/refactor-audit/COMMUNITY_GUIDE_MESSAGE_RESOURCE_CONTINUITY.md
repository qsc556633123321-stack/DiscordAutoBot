# Community Guide Message Resource Continuity

Legacy preserves the fetched message from selection to Edit. Discarding it in a
lookup adapter and fetching again in a mutation adapter changes fetch count and
failure timing. The future boundary must account for this continuity without
leaking Discord Message into Application.
