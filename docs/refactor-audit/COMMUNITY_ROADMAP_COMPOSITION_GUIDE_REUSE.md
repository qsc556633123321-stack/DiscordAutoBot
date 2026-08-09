# Community Roadmap Composition Guide Reuse Decision

Direct Guide composition reuse is rejected. Both features can share the local
composition style, but Guide owns lookup plus mutation ports whereas Roadmap
currently owns only lookup and retained-message handoff. A generic publication
composition layer would conceal those differences before Roadmap mutation has a
defined boundary.
