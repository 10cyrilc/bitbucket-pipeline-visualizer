import type { GlobalConfig } from '../types';

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
}

export interface Template {
  metadata: TemplateMetadata;
  generate: (environments: any[], config: GlobalConfig) => string;
}
