# Guide Runtime Pair Creator Acquisition

Direct runtime imports of Session, adapters, or Pair Factory are rejected.
Global feature registries and singleton pairs are rejected. A future runtime
candidate may acquire `createCommunityGuideAdapterPairFeature` through a
testable dependency boundary, but acquisition is not implemented here.
