# Roadmap Mutation Resource Session Reuse

The current Pair owns a private Resource Session that retains the lookup
Message. A future Edit capability should reuse that Session so the Edit receiver
remains identical and no second fetch is introduced. Send would need access to
the ensured channel already held by that Session. No Session surface is
extended in this slice.
