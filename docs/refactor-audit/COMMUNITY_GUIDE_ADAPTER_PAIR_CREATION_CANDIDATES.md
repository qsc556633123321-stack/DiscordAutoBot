# Guide Adapter Pair Creation Candidates

A stateless composition factory is the leading post-preparation candidate. Runtime-direct construction and an infrastructure factory add ownership leakage; composition singleton, global registry, and Lookup Adapter creating Mutation Adapter are rejected.
