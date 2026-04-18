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
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'nousresearch/hermes-3-llama-3.1-405b:free',
    key: process.env.OPENROUTER_API_KEY!,
    temperature: 0.75,
    max_tokens: 4096,
    headers: {
      'HTTP-Referer': process.env.SITE_URL || 'https://system-theta-ten.vercel.app',
      'X-Title': 'System Hein',
    },
  };
}

export function getUnrestrictedConfig(): ModelConfig {
  return {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    key: process.env.OPENROUTER_API_KEY!,
    temperature: 0.9,
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
