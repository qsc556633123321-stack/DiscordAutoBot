# Current Runtime Mutation Flow

After the mutation plan, runtime calls `await message.edit(payload)` for edit or
assigns `message = await channel.send(payload)` for send. Success persists the
message ID then continues Roadmap work; rejection propagates and prevents both.
