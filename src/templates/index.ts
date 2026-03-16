import { ReactTemplateV1 } from './react/v1';
import { ReactTemplateV2 } from './react/v2';
import { NodeTemplateV1 } from './node/v1';
import type { Template } from './types';

export const templates: Record<string, Template[]> = {
  react: [ReactTemplateV1, ReactTemplateV2],
  node: [NodeTemplateV1],
};
