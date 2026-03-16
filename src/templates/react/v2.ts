import type { ReactEnvironment, GlobalConfig } from '../../types';
import type { Template } from '../types';
import { getPmCommands, getCachePath } from '../utils';

export const ReactTemplateV2: Template = {
  metadata: {
    id: 'react-s3-cloudfront-v2',
    name: 'React S3 + CloudFront (Fast)',
    version: '2.0.0',
    description: 'Optimized React deployment with faster caching and parallel steps.',
  },
  generate: (environments: ReactEnvironment[], config: GlobalConfig) => {
    const pm = getPmCommands(config.packageManager);
    const cachePath = getCachePath(config.packageManager);

    let yaml = `image: node:${config.nodeVersion}

options:
  size: 2x

definitions:
  caches:
    ${config.packageManager}: ${cachePath}

  steps:
    - step: &quality-check
        name: Quality Check (Fast)
        image: node:${config.nodeVersion}-alpine
        caches:
          - ${config.packageManager}
        script:
${pm.install.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} format:check & ${pm.run} lint
          - wait
          - ${pm.run} build --mode production
`;

    environments.forEach((env) => {
      yaml += `
    - step: &build-${env.name}
        name: Build React (${env.name})
        caches:
          - ${config.packageManager}
        script:
${pm.install.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} build --mode ${env.name}
        artifacts:
          - dist/**

    - step: &deploy-${env.name}
        name: Deploy React (${env.name})
        script:
          - pipe: atlassian/aws-s3-deploy:2.0.1
            variables:
              AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
              AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
              AWS_DEFAULT_REGION: ap-south-1
              S3_BUCKET: ${env.s3Bucket}
              LOCAL_PATH: dist

          - pipe: atlassian/aws-cloudfront-invalidate:0.11.0
            variables:
              AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
              AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
              AWS_DEFAULT_REGION: ap-south-1
              DISTRIBUTION_ID: ${env.distributionId}
`;
    });

    yaml += `
pipelines:
  pull-requests:
    '**':
      - step: *quality-check
`;

    if (environments.length > 0) {
      yaml += `  branches:\n`;
      environments.forEach((env) => {
        yaml += `    ${env.branch}:
      - step: *build-${env.name}
      - step: *deploy-${env.name}
`;
      });
    }

    return yaml;
  },
};
