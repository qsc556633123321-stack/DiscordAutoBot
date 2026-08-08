# Community Guide Lookup Persistence Ordering

This slice does not change persistence. Edit and Send branches retain their existing persistence write after the successful legacy mutation. Lookup rejection maps to Send and only then persists the newly sent message ID. Persistence failures retain existing propagation behavior.
