# Guide Runtime Pair Creation Failure Compatibility

The current Pair Factory validates its ensured Channel synchronously. A future
runtime insertion is only safe after the existing ensure result is proven to
meet that interface contract. Constructor failure would otherwise introduce a
new legacy-visible failure point, so implementation is not approved yet.
