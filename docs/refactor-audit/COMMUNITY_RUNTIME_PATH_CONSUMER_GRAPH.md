# Community Runtime Path Consumer Graph

`communityConcierge.js` defines one path pair:

```text
DATA_DIR
  -> ONBOARDING_FILE
     -> Guide JsonReader -> Guide StateReader -> Guide tracking read
     -> Roadmap JsonReader -> Roadmap StateReader -> Roadmap tracking read
     -> Welcome JsonReader -> Welcome StateReader -> channel tracking read
     -> Guide publication-state feature -> Guide persistence feature
     -> Roadmap publication-state feature -> Roadmap persistence feature
```

There are exactly five active path-construction consumers in this runtime: three `CommunityOnboardingJsonReader` constructions and two `CommunityPublicationStateFeature` constructions. Guide and Roadmap persistence share the root file; Welcome is read-only and has zero persistence consumers.

The StateReader, tracking adapters, domain, and Discord adapters receive no filesystem path.
