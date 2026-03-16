import type { GlobalConfig, Environment } from '../types';

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
}

export interface Template {
  metadata: TemplateMetadata;
  generate: (_environments: Environment[], _config: GlobalConfig) => string;
}
