# Community Guide Lookup Plan Input Equivalence

Legacy planning consumes `Message | null`. A future lookup Result must be mapped to exactly that value before calling `buildGuidePublicationMutationPlan`. `MessageAvailable` alone is insufficient: the exact Message is necessary to preserve both the plan's Edit branch and the legacy edit receiver.
