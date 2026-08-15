# Community Button Dispatch Error Semantics

The legacy `concierge_*` branch wraps the awaited handler in `try/catch`.

1. A thrown handler error is logged with `console.error('Concierge button failed:', error)`.
2. If `!interaction.replied && !interaction.deferred`, it calls
   `interaction.reply({ content: '處理互動導覽時發生錯誤，請稍後再試。', ephemeral: true })`.
3. If already replied or deferred, it emits no generic reply, follow-up, or edit.
4. The error is swallowed and the dispatcher branch returns `undefined`.

Successful handler replies are owned by `handleConciergeButton`; the wrapper
does not defer, update, follow up, or inspect a successful handler return.
