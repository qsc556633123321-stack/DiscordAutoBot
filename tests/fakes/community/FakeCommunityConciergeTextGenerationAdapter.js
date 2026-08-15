function createFakeCommunityConciergeTextGenerationAdapter({ apiKey, loadOpenAi } = {}) {
  return Object.freeze({
    async generate({ request, fallback } = {}) {
      if (!apiKey) return fallback;

      try {
        const { default: OpenAI } = await loadOpenAi();
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create(request);
        return response.choices?.[0]?.message?.content?.trim() || fallback;
      } catch {
        return fallback;
      }
    }
  });
}

module.exports = { createFakeCommunityConciergeTextGenerationAdapter };
