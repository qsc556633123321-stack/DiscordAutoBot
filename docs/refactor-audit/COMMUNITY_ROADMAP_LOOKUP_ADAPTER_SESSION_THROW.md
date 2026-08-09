# Community Roadmap Lookup Adapter Session Throw Policy

Normal Discord fetch rejection is not visible to the adapter: the Resource
Session maps it to Unavailable. A Session invariant or programming failure that
does throw must propagate unchanged through the adapter. The adapter does not
retry or convert it to an application lookup result.
