# Guide Runtime Pair Creation Zero I/O

Feature creation and Pair construction must perform zero message fetches,
edits, sends, channel resolutions, persistence writes, and Roadmap calls.
Only later port use would cause I/O; it is explicitly excluded here.
