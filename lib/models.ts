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
    max_tokens: 8192,
  };
}

export function getUnrestrictedConfig(): ModelConfig {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    key: process.env.GROQ_API_KEY!,
    temperature: 0.9,
    max_tokens: 8192,
  };
}

export function getModelConfig(mode: 'sovereign' | 'unrestricted'): ModelConfig {
  return mode === 'unrestricted' ? getUnrestrictedConfig() : getSovereignConfig();
}

export function getSummarizeConfig(): ModelConfig {
  return getSovereignConfig();
}
