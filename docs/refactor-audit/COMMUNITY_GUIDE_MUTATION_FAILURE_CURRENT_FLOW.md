# Mutation Failure Current Flow

Session edit/send rethrows the original rejection. The adapter catches it and
maps it to a failure result. Legacy runtime currently bypasses that adapter and
therefore propagates the exact original value.
