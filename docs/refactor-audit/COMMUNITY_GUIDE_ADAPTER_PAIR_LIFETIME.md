# Guide Adapter Pair Lifetime

One Guide setup invocation creates one pair after channel ensure. Its references end with that invocation; it is never cached, reused across guilds, or shared by concurrent calls.
