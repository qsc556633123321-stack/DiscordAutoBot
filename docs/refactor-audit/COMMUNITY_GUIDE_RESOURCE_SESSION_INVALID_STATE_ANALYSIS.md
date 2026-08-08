# Guide Resource Session Invalid State Analysis

Conceptual invalid states include edit before lookup, edit after unavailable or
skip, double edit, send after available/edit, double send, and double lookup.
They are test characterization only. No runtime guard, Snowflake validation,
or new state-machine restriction is approved because legacy does not expose one.
