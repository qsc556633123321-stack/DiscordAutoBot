# Community Roadmap Pair Mutation Composition Forecast

After a separately approved Pair implementation, Composition may pass through
the Pair's `mutationPort` unchanged. This preparation changes neither
Composition nor runtime. Composition must not construct a second Session,
perform Discord I/O, or own persistence sequencing.
