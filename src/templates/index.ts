import { ReactTemplateV1 } from './react/v1';
import { NodeTemplateV1 } from './node/v1';
import type { Template } from './types';

export const templates: Record<string, Template[]> = {
  react: [ReactTemplateV1],
  node: [NodeTemplateV1],
};
