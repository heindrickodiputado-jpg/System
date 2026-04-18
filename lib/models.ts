export interface ModelConfig {
  url: string;
  model: string;
  key: string;
  temperature: number;
  max_tokens: number;
  headers?: Record<string, string>;
}

export function getSovereignConfig(): ModelConfig {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    key: process.env.GROQ_API_KEY!,
    temperature: 0.75,
    max_tokens: 4096,
  };
}

export function getUnrestrictedConfig(): ModelConfig {
  return {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'nothingiisreal/mn-celeste-12b',
    key: process.env.OPENROUTER_API_KEY!,
    temperature: 0.75,
    max_tokens: 4096,
    headers: {
      'HTTP-Referer': process.env.SITE_URL || 'https://system-theta-ten.vercel.app',
      'X-Title': 'System Hein',
    },
  };
}

export function getModelConfig(mode: 'sovereign' | 'unrestricted'): ModelConfig {
  return mode === 'unrestricted' ? getUnrestrictedConfig() : getSovereignConfig();
}

export function getSummarizeConfig(): ModelConfig {
  return getSovereignConfig();
}
